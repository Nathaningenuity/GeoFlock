/* GeoFlock: more detail as you zoom in. Small rivers, lakes and sharper coasts and borders come in from OpenFreeMap's
   vector tiles (OpenMapTiles schema, © OpenMapTiles © OpenStreetMap contributors; free, no key). Only the water, waterway,
   water-name and boundary layers are read; the base picture (relief, satellite…) is unchanged.
   - from about 8× zoom the tiles replace the built-in rivers and lakes; deeper zoom brings more and smaller ones
   - from about 30× the coast and country borders are drawn from the tiles too (sharper than the built-in outlines)
   - the flat map and the globe can now zoom to 256×
   - Satellite: lakes are not painted (they are in the photo) but hovering one names and outlines it, like the big ones
   - hovering a river or lake names it (from the tile's names; unnamed ones say "Lake", "River", "Stream"…)
   Hooks in index.html's GlobeView._render: gfDetail.covers(view) (skip the built-in lakes and rivers), gfDetail.ownsCoast(view)
   (skip the built-in outlines) and gfDetail.draw(view,ctx,info). */
(function(){
window.gfMaxZoom=256;
const MINZ=5,COASTZ=7,MAXZ=14,TILEPX=256,MAXTILES=36,PAR=6;
let URL0="https://tiles.openfreemap.org/planet/20261101_080013_pt/{z}/{x}/{y}.pbf",urlP=null;
function tileUrl(){if(!urlP)urlP=fetch("https://tiles.openfreemap.org/planet").then(r=>r.json()).then(j=>{if(j&&j.tiles&&j.tiles[0])URL0=j.tiles[0];return URL0}).catch(()=>URL0);return urlP}
const view=g=>{try{return typeof amGlobe!=="undefined"&&g===amGlobe&&appMode==="allmaps"&&allMapsColorMode!=="history"}catch(e){return false}};

/* ---------- a small vector-tile reader (only the layers used here) ---------- */
const TD=new TextDecoder(),WANT={water:1,waterway:1,water_name:1,boundary:1};
function readTile(u8){let pos=0;const vi=()=>{let r=0,s=0,b;do{b=u8[pos++];r+=(b&127)*Math.pow(2,s);s+=7}while(b&128);return r};
 const skip=w=>{if(w===0)vi();else if(w===2)pos+=vi();else if(w===5)pos+=4;else pos+=8};
 const layers={};
 while(pos<u8.length){const t=vi(),f=t>>>3,w=t&7;if(f!==3||w!==2){skip(w);continue}
  const len=vi(),end=pos+len;const L={name:"",keys:[],vals:[],feats:[],ext:4096};const st=pos;
  /* the name comes first in practice; read it, skip the layer if unwanted */
  while(pos<end){const t2=vi(),f2=t2>>>3,w2=t2&7;
   if(f2===1){const l=vi();L.name=TD.decode(u8.subarray(pos,pos+l));pos+=l;if(!WANT[L.name]){pos=end;break}}
   else if(f2===2){const l=vi();L.feats.push([pos,pos+l]);pos+=l}
   else if(f2===3){const l=vi();L.keys.push(TD.decode(u8.subarray(pos,pos+l)));pos+=l}
   else if(f2===4){const l=vi(),e=pos+l;let v=null;while(pos<e){const t3=vi(),f3=t3>>>3,w3=t3&7;if(f3===1){const sl=vi();v=TD.decode(u8.subarray(pos,pos+sl));pos+=sl}else if(w3===0){v=vi();if(f3===6)v=(v%2)?-(v+1)/2:v/2}else if(w3===1){v=new DataView(u8.buffer,u8.byteOffset+pos,8).getFloat64(0,true);pos+=8}else if(w3===5){v=new DataView(u8.buffer,u8.byteOffset+pos,4).getFloat32(0,true);pos+=4}else skip(w3)}L.vals.push(v)}
   else if(f2===5)L.ext=vi();else skip(w2)}
  if(WANT[L.name])layers[L.name]=L;pos=Math.max(pos,end);void st}
 const feats=L=>L.feats.map(([a,b])=>{pos=a;const o={tags:{},type:0,geom:null};while(pos<b){const t=vi(),f=t>>>3,w=t&7;
   if(f===2){const l=vi(),e=pos+l;while(pos<e){const k=vi(),v=vi();o.tags[L.keys[k]]=L.vals[v]}}else if(f===3)o.type=vi();else if(f===4){const l=vi(),e=pos+l,G=[];while(pos<e)G.push(vi());o.geom=G}else skip(w)}return o});
 return{layers,feats}}
/* geometry commands to rings/lines in tile units */
function parts(G){const out=[];let x=0,y=0,cur=null,i=0;while(i<G.length){const c=G[i++],id=c&7,n=c>>>3;
  if(id===7){if(cur&&cur.length)cur.push(cur[0].slice());continue}
  for(let k=0;k<n;k++){const dx=G[i++],dy=G[i++];x+=(dx%2)?-(dx+1)/2:dx/2;y+=(dy%2)?-(dy+1)/2:dy/2;if(id===1){cur=[[x,y]];out.push(cur)}else if(cur)cur.push([x,y])}}return out}
const area=r=>{let a=0;for(let i=0;i<r.length-1;i++)a+=r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1];return a};/* > 0: an outer ring (tile y points down) */
/* clip a ring to the tile square (Sutherland–Hodgman); points on the square's edge are flagged so their segments are not stroked */
function clipRing(r,E){let P=r;const sides=[[p=>p[0]>=0,(a,b)=>{const t=(0-a[0])/(b[0]-a[0]);return[0,a[1]+t*(b[1]-a[1])]}],[p=>p[0]<=E,(a,b)=>{const t=(E-a[0])/(b[0]-a[0]);return[E,a[1]+t*(b[1]-a[1])]}],
  [p=>p[1]>=0,(a,b)=>{const t=(0-a[1])/(b[1]-a[1]);return[a[0]+t*(b[0]-a[0]),0]}],[p=>p[1]<=E,(a,b)=>{const t=(E-a[1])/(b[1]-a[1]);return[a[0]+t*(b[0]-a[0]),E]}]];
 for(const[ins,cut]of sides){const Q=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ia=ins(a),ib=ins(b);if(ia){Q.push(a);if(!ib)Q.push(cut(a,b))}else if(ib)Q.push(cut(a,b))}P=Q;if(P.length<3)return null}return P}
function clipLine(l,E){const out=[];let cur=null;for(let i=1;i<l.length;i++){let[x0,y0]=l[i-1],[x1,y1]=l[i];let t0=0,t1=1;const dx=x1-x0,dy=y1-y0;let ok=true;
  for(const[p,q]of[[-dx,x0],[dx,E-x0],[-dy,y0],[dy,E-y0]]){if(p===0){if(q<0){ok=false;break}}else{const r=q/p;if(p<0){if(r>t1){ok=false;break}if(r>t0)t0=r}else{if(r<t0){ok=false;break}if(r<t1)t1=r}}}
  if(!ok){cur=null;continue}const a=[x0+t0*dx,y0+t0*dy],b=[x0+t1*dx,y0+t1*dy];if(!cur||t0>0){cur=[a];out.push(cur)}cur.push(b);if(t1<1)cur=null}return out}
/* tile units to longitude/latitude: rings stored as flat arrays [lon,lat,edge, lon,lat,edge…] */
function toLL(pts,z,tx,ty,E,flag){const n=Math.pow(2,z),o=new Float64Array(pts.length*3);for(let i=0;i<pts.length;i++){const[x,y]=pts[i];
  o[i*3]=(tx+x/E)/n*360-180;const m=Math.PI*(1-2*(ty+y/E)/n);o[i*3+1]=Math.atan(Math.sinh(m))*180/Math.PI;o[i*3+2]=flag?((x<=0?1:0)|(x>=E?2:0)|(y<=0?4:0)|(y>=E?8:0)):0}return o}
function bboxOf(rs){let a=1e9,b=1e9,c=-1e9,d=-1e9;rs.forEach(r=>{for(let i=0;i<r.length;i+=3){a=Math.min(a,r[i]);c=Math.max(c,r[i]);b=Math.min(b,r[i+1]);d=Math.max(d,r[i+1])}});return[a,b,c,d]}
const nm=t=>t["name:en"]||t.name_en||t.name_int||t.name||"";
function build(u8,z,tx,ty){const T=readTile(u8),L=T.layers,D={lakes:[],ocean:[],rivers:[],borders:[],names:[]};
 if(L.water){const E=L.water.ext;T.feats(L.water).forEach(f=>{if(f.type!==3||!f.geom)return;const cls=f.tags.class;const rings=parts(f.geom);
   /* group: an outer ring (positive area) followed by its holes */const polys=[];rings.forEach(r=>{if(r.length<4)return;const c=clipRing(r.slice(0,-1),E);if(!c)return;const ll=toLL(c,z,tx,ty,E,true);if(area(r)>0||!polys.length)polys.push([ll]);else polys[polys.length-1].push(ll)});
   if(!polys.length)return;const all=polys.flat();if(cls==="ocean")D.ocean.push({rings:all});else D.lakes.push({id:f.tags.id,cls,int:f.tags.intermittent,polys,rings:all,bb:bboxOf(all)})})}
 if(L.waterway){const E=L.waterway.ext;T.feats(L.waterway).forEach(f=>{if(f.type!==2||!f.geom)return;const ls=[];parts(f.geom).forEach(l=>clipLine(l,E).forEach(c=>{if(c.length>1)ls.push(toLL(c,z,tx,ty,E,false))}));if(ls.length)D.rivers.push({name:nm(f.tags),cls:f.tags.class,ls,bb:bboxOf(ls)})})}
 if(L.boundary){const E=L.boundary.ext;T.feats(L.boundary).forEach(f=>{const t=f.tags;if(f.type!==2||!f.geom||t.admin_level!==2||t.maritime)return;const ls=[];parts(f.geom).forEach(l=>clipLine(l,E).forEach(c=>{if(c.length>1)ls.push(toLL(c,z,tx,ty,E,false))}));if(ls.length)D.borders.push({disp:!!t.disputed,ls})})}
 if(L.water_name){const E=L.water_name.ext;T.feats(L.water_name).forEach(f=>{if(f.type!==1||!f.geom)return;const p=parts(f.geom)[0];if(!p||!p[0])return;const ll=toLL([p[0]],z,tx,ty,E,false);D.names.push({n:nm(f.tags),cls:f.tags.class,ll:[ll[0],ll[1]]})})}
 /* lake names: a name point inside a lake names that lake (and its pieces in other tiles, by the lake's id) */
 D.names.forEach(N=>{if(!N.n)return;for(const K of D.lakes){if(N.ll[0]<K.bb[0]||N.ll[0]>K.bb[2]||N.ll[1]<K.bb[1]||N.ll[1]>K.bb[3])continue;if(inRings(K.rings,N.ll)){if(K.id!=null)NAMES.set(K.id,N.n);K.n=N.n;break}}});
 return D}
const NAMES=new Map();
function inRings(rs,p){let c=false;for(const r of rs){for(let i=0,j=r.length-3;i<r.length;j=i,i+=3){const xi=r[i],yi=r[i+1],xj=r[j],yj=r[j+1];if((yi>p[1])!==(yj>p[1])&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi)c=!c}}return c}

/* ---------- tiles: which are wanted, loading, cache ---------- */
const CACHE=new Map();let inflight=0,queue=[],loads=0;
const key=(z,x,y)=>z+"/"+x+"/"+y;
function want(list){queue=list.filter(k=>!CACHE.has(k));pump()}
function pump(){while(inflight<PAR&&queue.length){const k=queue.shift();if(CACHE.has(k))continue;CACHE.set(k,{st:"load"});inflight++;
  const[z,x,y]=k.split("/").map(Number);
  tileUrl().then(u=>fetch(u.replace("{z}",z).replace("{x}",x).replace("{y}",y))).then(r=>r.ok?r.arrayBuffer():null).then(b=>{
   let d=null;try{d=b&&b.byteLength?build(new Uint8Array(b),z,x,y):{lakes:[],ocean:[],rivers:[],borders:[],names:[]}}catch(e){console.error("tile",k,e);d={lakes:[],ocean:[],rivers:[],borders:[],names:[]}}
   CACHE.set(k,{st:"ok",d,t:performance.now()})}).catch(()=>{CACHE.delete(k)}).finally(()=>{inflight--;loads++;trim();try{amGlobe&&amGlobe.request()}catch(e){}pump()})}}
function trim(){if(CACHE.size<500)return;const live=new Set((ST&&ST.tiles||[]).map(t=>t.k));[...CACHE.entries()].filter(([k,v])=>v.st==="ok"&&!live.has(k)).sort((a,b)=>a[1].t-b[1].t).slice(0,150).forEach(([k])=>CACHE.delete(k))}
const got=k=>{const c=CACHE.get(k);return c&&c.st==="ok"?c.d:null};

/* ---------- what the view needs ---------- */
let ST=null,STK="",WT=0,WSIG="";
function state(g){const sz=g.size(),k=g.rot[0].toFixed(3)+","+g.rot[1].toFixed(3)+","+g.zoom.toFixed(4)+","+sz.w+","+sz.h+","+loads+","+allMapsColorMode;if(k===STK&&ST)return ST;STK=k;ST=compute(g,sz);return ST}
function compute(g,sz){const P=g.projection(),inv=q=>{try{const ll=P.invert(q);if(!ll||!isFinite(ll[0])||!isFinite(ll[1])||Math.abs(ll[0])>180.001||Math.abs(ll[1])>90.001)return null;const b=P(ll);if(!b||Math.hypot(b[0]-q[0],b[1]-q[1])>2)return null;return ll}catch(e){return null}};
 const c=inv([sz.w/2,sz.h/2]),c2=inv([sz.w/2+10,sz.h/2]);if(!c||!c2)return{on:false};
 const dpp=d3.geoDistance(c,c2)*180/Math.PI/10;let z=Math.round(Math.log2(360*Math.cos(c[1]*Math.PI/180)/(TILEPX*dpp)));z=Math.min(MAXZ,z);if(z<MINZ)return{on:false,z};
 /* the tiles under a grid of points over the view */
 const pts=[];const N=40,M=28;for(let i=0;i<=N;i++)for(let j=0;j<=M;j++){const ll=inv([sz.w*i/N,sz.h*j/M]);if(ll)pts.push(ll)}
 let tiles;for(;;){const S=new Map(),n=Math.pow(2,z);pts.forEach(([lo,la])=>{la=Math.max(-85.05,Math.min(85.05,la));const x=Math.min(n-1,Math.floor((lo+180)/360*n)),r=la*Math.PI/180,y=Math.min(n-1,Math.max(0,Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n)));
    S.set(key(z,x,y),[x,y])});
  if(S.size<=MAXTILES){tiles=[...S.entries()].map(([k,[x,y]])=>({k,z,x,y}));break}z--;if(z<MINZ)return{on:false,z}}
 if(z<MINZ)return{on:false,z};
 /* each tile drawn from itself, or while it loads from a loaded parent (up to three levels up) */
 tiles.forEach(t=>{t.d=got(t.k);t.src=t;if(!t.d)for(let u=1;u<=3&&z-u>=MINZ-1;u++){const pk=key(z-u,t.x>>u,t.y>>u),pd=got(pk);if(pd){t.d=pd;t.src={z:z-u,x:t.x>>u,y:t.y>>u};break}}});
 /* nearest first */const cx=(c[0]+180)/360*Math.pow(2,z);tiles.sort((a,b)=>Math.abs(a.x+.5-cx)-Math.abs(b.x+.5-cx));
 /* fetch only once the view has settled (not on every frame of a drag, a fly or a spin) */
 const ks=tiles.map(t=>t.k),sig=z+":"+ks.slice().sort().join(",");clearTimeout(WT);if(sig===WSIG)want(ks);else{WSIG=sig;WT=setTimeout(()=>{if(WSIG===sig){want(ks);try{amGlobe.request()}catch(e){}}},260)}
 return{on:true,z,tiles,all:tiles.every(t=>t.d)}}
const on=g=>{if(!view(g))return null;const s=state(g);return s.on&&s.all?s:null};

/* ---------- drawing ---------- */
function projector(g){const P=g.projection();if(g._flat)return(lo,la)=>P([lo,la]);const c=[-g.rot[0]*Math.PI/180,-g.rot[1]*Math.PI/180],cx=Math.cos(c[1])*Math.cos(c[0]),cy=Math.cos(c[1])*Math.sin(c[0]),cz=Math.sin(c[1]);
 return(lo,la)=>{const a=lo*Math.PI/180,b=la*Math.PI/180,cb=Math.cos(b);if(cb*Math.cos(a)*cx+cb*Math.sin(a)*cy+Math.sin(b)*cz<.02)return null;return P([lo,la])}}
function ringPath(ctx,pj,r,closeIt){let first=true;for(let i=0;i<r.length;i+=3){const q=pj(r[i],r[i+1]);if(!q)return false;if(first){ctx.moveTo(q[0],q[1]);first=false}else ctx.lineTo(q[0],q[1])}if(closeIt)ctx.closePath();return true}
function edgePath(ctx,pj,r,closed){let pen=false;const n=r.length/3;for(let k=0;k<(closed?n:n-1);k++){const i=k*3,j=((k+1)%n)*3;if(r[i+2]&r[j+2]){pen=false;continue}const a=pj(r[i],r[i+1]),b=pj(r[j],r[j+1]);if(!a||!b){pen=false;continue}if(!pen){ctx.moveTo(a[0],a[1]);pen=true}ctx.lineTo(b[0],b[1])}}
function boxClip(ctx,pj,t){const n=Math.pow(2,t.z),L=[];const ll=(x,y)=>{const m=Math.PI*(1-2*y/n);return[x/n*360-180,Math.atan(Math.sinh(m))*180/Math.PI]};const S=8;
 for(let i=0;i<=S;i++)L.push(ll(t.x+i/S,t.y));for(let i=0;i<=S;i++)L.push(ll(t.x+1,t.y+i/S));for(let i=0;i<=S;i++)L.push(ll(t.x+1-i/S,t.y+1));for(let i=0;i<=S;i++)L.push(ll(t.x,t.y+1-i/S));
 ctx.beginPath();let ok=true;L.forEach((p,i)=>{const q=pj(p[0],p[1]);if(!q){ok=false;return}i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();if(ok)ctx.clip();return ok}
let CASP=null;function caspian(){if(CASP!==null)return CASP;try{CASP=globeOverlays().lakes.find(L=>/^Caspian/.test(L.n||""))||false}catch(e){CASP=false}return CASP}
function isCaspian(K){if(K._casp!==undefined)return K._casp;const C=caspian();K._casp=!!(C&&K.bb[2]-K.bb[0]>.5&&d3.geoContains(C,[(K.bb[0]+K.bb[2])/2,(K.bb[1]+K.bb[3])/2]));return K._casp}
function draw(g,ctx,I){const s=on(g);if(!s)return;const pj=projector(g),ov=I.ov||{},sat=I.texKey==="satellite",rel=I.drewRaster&&I.texKey==="relief";
 const borders=g.cfg.borders?g.cfg.borders():true,coast=s.z>=COASTZ,z=g.zoom;
 /* each tile is drawn whole (begin, path, fill or stroke) so a tile drawn from its parent can be clipped to its own square */
 const each=fn=>s.tiles.forEach(t=>{if(!t.d)return;const sub=t.src!==t;if(sub){ctx.save();if(!boxClip(ctx,pj,t)){ctx.restore();return}}try{fn(t.d)}finally{if(sub)ctx.restore()}});
 const rivCol=sat?"rgb(26,66,120)":I.drewRaster?"#2f7ab8":"#14568c",rivA=Math.max(.12,Math.min(.9,.12+.16*(z-1)));
 /* fill maps: the sea drawn again over the land colours along the sharp coast */
 if(coast&&!I.drewRaster){/* cut the land colours back to the sharp coast, then put the sea colour (which may be clear) under the gap */
  ctx.save();ctx.globalCompositeOperation="destination-out";ctx.fillStyle="#000";each(d=>{ctx.beginPath();d.ocean.forEach(o=>o.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("evenodd")});
  ctx.globalCompositeOperation="destination-over";ctx.fillStyle=I.ocean||"#5797cf";each(d=>{ctx.beginPath();d.ocean.forEach(o=>o.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("evenodd")});ctx.restore()}
 if(ov.lakes&&!sat){const lf=I.drewRaster?(rel?(window._gfLakesClean?"#a8cbe5":"rgba(166,201,228,0.78)"):"#b9d8ea"):(I.ocean||"#5797cf");
  ctx.strokeStyle=rel?"rgba(40,90,140,0.45)":"rgba(255,255,255,0.5)";ctx.lineWidth=.4;
  each(d=>{const L=d.lakes.filter(K=>K.cls!=="river"&&!(I.drewRaster&&isCaspian(K)));ctx.fillStyle=lf;ctx.beginPath();L.forEach(K=>K.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("evenodd");
   if(I.drewRaster){ctx.beginPath();L.forEach(K=>K.rings.forEach(r=>edgePath(ctx,pj,r,true)));ctx.stroke()}})}
 if(ov.rivers){ctx.lineJoin="round";ctx.lineCap="round";ctx.globalAlpha=rivA;
  /* wide rivers drawn as water areas, in the river colour */
  ctx.fillStyle=rivCol;each(d=>{ctx.beginPath();d.lakes.forEach(K=>{if(K.cls==="river")K.rings.forEach(r=>ringPath(ctx,pj,r,true))});ctx.fill("evenodd")});
  const W={river:Math.min(2.2,.45+.15*Math.min(z,12)),canal:1,stream:.6,drain:.5,ditch:.5};ctx.strokeStyle=rivCol;
  each(d=>["stream","drain","ditch","canal","river"].forEach(cl=>{ctx.lineWidth=W[cl];ctx.beginPath();d.rivers.forEach(R=>{const c=W[R.cls]?R.cls:"river";if(c!==cl)return;R.ls.forEach(l=>ringPath(ctx,pj,l,false))});ctx.stroke()}));ctx.globalAlpha=1}
 if(coast&&borders){ctx.lineWidth=.55;ctx.strokeStyle=I.drewRaster?"rgba(25,25,25,0.55)":"rgba(20,30,20,0.5)";
  each(d=>{ctx.beginPath();d.ocean.forEach(o=>o.rings.forEach(r=>edgePath(ctx,pj,r,true)));d.borders.forEach(B=>{if(!B.disp)B.ls.forEach(l=>ringPath(ctx,pj,l,false))});ctx.stroke();
   ctx.setLineDash([3,2]);ctx.beginPath();d.borders.forEach(B=>{if(B.disp)B.ls.forEach(l=>ringPath(ctx,pj,l,false))});ctx.stroke();ctx.setLineDash([])})}}

/* ---------- hover: name and outline the river or lake under the pointer ---------- */
const LAB={lake:"Lake",river:"River",pond:"Pond",dock:"Dock",basin:"Reservoir",reservoir:"Reservoir",lagoon:"Lagoon",stream:"Stream",canal:"Canal",drain:"Drain",ditch:"Ditch",swimming_pool:"Pool"};
function d3poly(rings){/* d3 wants each piece wound the other way from the tile's; check by area */const pol=rings.map(r=>{const c=[];for(let i=0;i<r.length;i+=3)c.push([r[i],r[i+1]]);if(c.length&&(c[0][0]!==c[c.length-1][0]||c[0][1]!==c[c.length-1][1]))c.push(c[0].slice());return c});
 let P={type:"Polygon",coordinates:pol};try{if(d3.geoArea(P)>2*Math.PI)P={type:"Polygon",coordinates:pol.map(r=>r.slice().reverse())}}catch(e){}return P}
function lakeAt(s,ll){for(const t of s.tiles){if(!t.d)continue;for(const K of t.d.lakes){if(ll[0]<K.bb[0]||ll[0]>K.bb[2]||ll[1]<K.bb[1]||ll[1]>K.bb[3])continue;if(inRings(K.rings,ll))return K}}return null}
function waterHit(g,ll,cx,cy,ov){const s=on(g);if(!s)return null;const out={};
 if(ov.lakes){const K=lakeAt(s,ll);if(K){const name=K.n||(K.id!=null&&NAMES.get(K.id))||"";const co=[];s.tiles.forEach(t=>{if(!t.d)return;t.d.lakes.forEach(Q=>{if(Q===K||(K.id!=null&&Q.id===K.id))Q.polys.forEach(p=>co.push(d3poly(p).coordinates))})});
   out.water=name||LAB[K.cls]||"Lake";out.lake={type:"MultiPolygon",coordinates:co,n:out.water};return out}}
 if(ov.rivers){const pj=projector(g),rc=g.canvas.getBoundingClientRect(),mx=cx-rc.left,my=cy-rc.top;let best=6,hit=null;const pad=.5;
  s.tiles.forEach(t=>{if(!t.d)return;t.d.rivers.forEach(R=>{if(ll[0]<R.bb[0]-pad||ll[0]>R.bb[2]+pad||ll[1]<R.bb[1]-pad||ll[1]>R.bb[3]+pad)return;R.ls.forEach(l=>{let a=null;for(let i=0;i<l.length;i+=3){const b=pj(l[i],l[i+1]);if(a&&b){const vx=b[0]-a[0],vy=b[1]-a[1],L2=vx*vx+vy*vy||1;let u=((mx-a[0])*vx+(my-a[1])*vy)/L2;u=Math.max(0,Math.min(1,u));const d=Math.hypot(a[0]+u*vx-mx,a[1]+u*vy-my);if(d<best){best=d;hit=R}}a=b}})})});
  if(hit){const co=[];s.tiles.forEach(t=>{if(!t.d)return;t.d.rivers.forEach(R=>{if(R===hit||(hit.name&&R.name===hit.name))R.ls.forEach(l=>{const c=[];for(let i=0;i<l.length;i+=3)c.push([l[i],l[i+1]]);co.push(c)})})});
   const n=hit.name||LAB[hit.cls]||"River";out.water=hit.name&&hit.cls==="river"&&!/river|rio|río|fleuve|fluss|joki|älv|elva|reka|река|nehri|nahr/i.test(n)?n+" River":n;out.river={type:"MultiLineString",coordinates:co,n:out.water};return out}}
 return null}
const _wa=GlobeView.prototype.waterAt;GlobeView.prototype.waterAt=function(ll,cx,cy){const out=_wa.apply(this,arguments)||{};try{let ov=this.cfg.overlays?this.cfg.overlays():{};/* Satellite: lakes are in the photo; hovering one names it even with Lakes off */if(allMapsColorMode==="satellite"&&!ov.lakes)ov=Object.assign({},ov,{lakes:true});if(view(this)&&(ov.lakes||ov.rivers)){const h=waterHit(this,ll,cx,cy,ov);
  if(h){delete out.lake;delete out.river;Object.assign(out,h);if(out.lake&&!h.lake)delete out.lake}else if(on(this)){/* the built-in shapes are not drawn now: keep only a name from them */if(out.lake){const n=out.water;delete out.lake;out.water=n}if(out.river){delete out.river;delete out.water}}}}catch(e){console.error(e)}return out};

window.gfDetail={dbg:()=>({WSIG:WSIG.slice(0,60),q:queue.length,inflight,loads}),covers:g=>!!on(g),ownsCoast:g=>{const s=on(g);return!!(s&&s.z>=COASTZ)},draw:(g,ctx,I)=>{try{draw(g,ctx,I)}catch(e){console.error(e)}},state:g=>view(g)?state(g):null,cache:CACHE};
/* the credit, shown on the map while the tiles are in use */
setInterval(()=>{try{const g=typeof amGlobe!=="undefined"&&amGlobe;const h=g&&g.host;if(!h)return;let c=h.querySelector(".gf-dt-cred");const v=!!(g&&on(g));if(v&&!c){c=document.createElement("div");c.className="gf-dt-cred";c.innerHTML='Detail © <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';h.appendChild(c)}if(c)c.hidden=!v}catch(e){}},700);
{const st=document.createElement("style");st.textContent=".gf-dt-cred{position:absolute;right:62px;bottom:4px;z-index:6;font:500 9.5px system-ui,sans-serif;color:#33475b;background:rgba(255,255,255,.62);padding:1px 6px;border-radius:6px;pointer-events:auto}.gf-dt-cred a{color:inherit}.gf-dt-cred[hidden]{display:none}";document.head.appendChild(st)}
})();
