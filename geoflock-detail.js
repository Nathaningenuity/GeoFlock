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
const MINZ=5,COASTZ=6,MAXZ=14,TILEPX=256,MAXTILES=36,PAR=10;
let URL0="https://tiles.openfreemap.org/planet/20261101_080013_pt/{z}/{x}/{y}.pbf",urlP=null;
function tileUrl(){if(!urlP)urlP=fetch("https://tiles.openfreemap.org/planet").then(r=>r.json()).then(j=>{if(j&&j.tiles&&j.tiles[0])URL0=j.tiles[0];return URL0}).catch(()=>URL0);return urlP}
const view=g=>{try{if(g&&g._gfProj)return!!(typeof proj!=="undefined"&&proj.on);return typeof amGlobe!=="undefined"&&g===amGlobe&&appMode==="allmaps"&&allMapsColorMode!=="history"&&allMapsColorMode!=="night"/* City Lights: no detailed outlines */}catch(e){return false}};
/* other views (the Projections map) get a redraw when tiles arrive */
const REDRAW=new Set();const redraw=()=>{try{amGlobe&&amGlobe.request()}catch(e){}REDRAW.forEach(f=>{try{f()}catch(e){}})};

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
/* a ring cut to one side of x=X (s=1 keeps x<=X, s=-1 keeps x>=X) */
function cutX(r,X,s){const ins=p=>s*(p[0]-X)<=0,Q=[];for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],ia=ins(a),ib=ins(b);
  if(ia)Q.push(a);if(ia!==ib){const t=(X-a[0])/(b[0]-a[0]);Q.push([X,a[1]+t*(b[1]-a[1])])}}return Q.length>=3?Q:null}
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
   /* group: an outer ring (positive area) followed by its holes */const lls=[],n2=Math.pow(2,z);rings.forEach(r=>{if(r.length<4)return;/* not cut to the tile here (cutting big lakes made broken shapes): the drawing clips each tile to its square */let c=r.slice(0,-1);
   /* except at the world's east and west edges: the tile's buffer past 180° (or -180°) wraps to the far side of the flat map, and the
      sea ring jumping across the whole map turned land into sea there (New Zealand's North Island). Cut there only, on that side only */
   if(tx===n2-1)c=cutX(c,E,1);if(tx===0&&c)c=cutX(c,0,-1);if(!c||c.length<3)return;lls.push(toLL(c,z,tx,ty,E,true))});
   /* outlines and holes by nesting, not by the tiles' winding (Lake Huron came wound the wrong way and vanished): a ring inside
      an odd number of others is a hole; each ring is then turned so outlines and holes wind opposite ways (filled "nonzero") */
   const depth=lls.map((r,i)=>lls.reduce((n,o,j)=>n+(j!==i&&o.length>8&&inRings([o],[r[0],r[1]])?1:0),0));
   const polys=[];lls.forEach((r,i)=>{const hole=depth[i]%2===1,ar=areaLL(r);if(hole?ar<0:ar>0)revLL(r);if(!hole||!polys.length)polys.push([r]);else polys[polys.length-1].push(r)});
   if(!polys.length)return;const all=polys.flat();if(cls==="ocean")D.ocean.push({rings:all});else D.lakes.push({id:f.tags.id,cls,int:f.tags.intermittent,polys,rings:all,bb:bboxOf(all)})})}
 if(L.waterway){const E=L.waterway.ext;T.feats(L.waterway).forEach(f=>{if(f.type!==2||!f.geom)return;const ls=[];parts(f.geom).forEach(l=>clipLine(l,E).forEach(c=>{if(c.length>1)ls.push(toLL(c,z,tx,ty,E,false))}));if(ls.length){const t=f.tags,R={name:nm(t),cls:t.class,ls,bb:bboxOf(ls),keys:[...new Set([t["name:en"],t.name_en,t.name_int,t.name].filter(Boolean).map(rkey))],lowz:z<=8};if(R.lowz)R.keys.forEach(k=>MED.add(k));const ek=R.keys[0];if(ek){const e=EXT.get(ek),b=R.bb;EXT.set(ek,e?[Math.min(e[0],b[0]),Math.min(e[1],b[1]),Math.max(e[2],b[2]),Math.max(e[3],b[3])]:b.slice())}D.rivers.push(R)}})}
 if(L.boundary){const E=L.boundary.ext;T.feats(L.boundary).forEach(f=>{const t=f.tags;if(f.type!==2||!f.geom||t.admin_level!==2||t.maritime)return;const ls=[];parts(f.geom).forEach(l=>clipLine(l,E).forEach(c=>{if(c.length>1)ls.push(toLL(c,z,tx,ty,E,false))}));if(ls.length)D.borders.push({disp:!!t.disputed,ls})})}
 if(L.water_name){const E=L.water_name.ext;T.feats(L.water_name).forEach(f=>{if(f.type!==1||!f.geom)return;const p=parts(f.geom)[0];if(!p||!p[0])return;const ll=toLL([p[0]],z,tx,ty,E,false);D.names.push({n:nm(f.tags),cls:f.tags.class,ll:[ll[0],ll[1]]})})}
 /* lake names: a name point inside a lake names that lake (and its pieces in other tiles, by the lake's id) */
 D.names.forEach(N=>{if(!N.n||(N.cls&&!/^(lake|reservoir|lagoon|pond|basin)$/.test(N.cls)))return;for(const K of D.lakes){if(N.ll[0]<K.bb[0]||N.ll[0]>K.bb[2]||N.ll[1]<K.bb[1]||N.ll[1]>K.bb[3])continue;if(inRings(K.rings,N.ll)){if(K.id!=null)NAMES.set(K.id,N.n);K.n=N.n;break}}});
 return D}
const NAMES=new Map();
function areaLL(r){let a=0;for(let i=0,j=r.length-3;i<r.length;j=i,i+=3)a+=r[j]*r[i+1]-r[i]*r[j+1];return a/2}
function revLL(r){const n=r.length/3;for(let i=0;i<n>>1;i++){const a=i*3,b=(n-1-i)*3;for(let k=0;k<3;k++){const t=r[a+k];r[a+k]=r[b+k];r[b+k]=t}}}
/* river importance: the map's own named rivers (the Amazon, the Congo…) are major; rivers already in the small-scale tiles
   (tile zoom 8 or less) are medium; the rest (and streams) are minor and come in later and thinner */
const rkey=n=>String(n||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\(.*?\)/g,"").replace(/\b(river|rio|riviere|fleuve|he|jiang|nehri|nahr|the)\b/g,"").replace(/[^a-z]+/g," ").trim();
const MED=new Set(),EXT=new Map(),MAJN=new Map();let MAJ=null;
/* how far a river reaches (degrees across, over every tile seen): long rivers come in first, short ones later */
function reach(R){const b=(R.keys[0]&&EXT.get(R.keys[0]))||R.bb;return Math.max(.05,Math.hypot(b[2]-b[0],b[3]-b[1]))}
function major(){if(MAJ)return MAJ;MAJ=new Set();try{(ALLMAPS_RIVERS||[]).forEach(([n])=>{if(!/^[A-Z]{2}[-\\/]/.test(n)){MAJ.add(rkey(n));MAJN.set(rkey(n),n)}})}catch(e){}
 [["amazonas","amazon"],["yellow","huang"],["ayeyarwady","irrawaddy"],["yenisey","yenisei"],["selenge","selenga"],["severnaya dvina","northern dvina"],["xi","xi"],["st lawrence","saint lawrence"],["parana","parana"]].forEach(([a,b])=>{if(MAJ.has(a)){MAJ.add(b);MAJN.set(b,MAJN.get(a))}});MAJ.delete("");return MAJ}
/* a river with no name (or a local one) that runs along one of the map's own big rivers is that river */
let CO=null;function coarse(){if(CO)return CO;CO=[];try{globeOverlays().rivers.forEach(Rv=>Rv.coordinates.forEach(l=>{for(let i=1;i<l.length;i++)CO.push([l[i-1][0],l[i-1][1],l[i][0],l[i][1],Rv.n])}))}catch(e){}return CO}
function nearCoarse(R){let best=null;R.ls.forEach(l=>{if(!best||l.length>best.length)best=l});if(!best||best.length<9)return false;const n=best.length/3;let hits=0;
 [.25,.5,.75].forEach(f=>{const i=Math.floor(n*f)*3,x=best[i],y=best[i+1],c=Math.cos(y*Math.PI/180);let d=1e9,dn=null;for(const q of coarse()){if(Math.abs(q[1]-y)>1||Math.abs(q[0]-x)>2)continue;const vx=(q[2]-q[0])*c,vy=q[3]-q[1],px=(x-q[0])*c,py=y-q[1],L2=vx*vx+vy*vy||1e-9;let u=(px*vx+py*vy)/L2;u=Math.max(0,Math.min(1,u));const dd=Math.hypot(px-u*vx,py-u*vy);if(dd<d){d=dd;dn=q[4]}}if(d<.2){hits++;R.cn=dn}});return hits>=2}
function tier(R){if(R.cls&&R.cls!=="river")return R.cls==="canal"?"minor":"stream";const M=major();{const k=R.keys.find(k=>M.has(k));if(k){R.cn=MAJN.get(k)||null;return"major"}}if(nearCoarse(R)){R.keys.forEach(k=>M.add(k));return"major"}if(R.lowz||R.keys.some(k=>MED.has(k)))return"medium";return"minor"}
function inRings(rs,p){let c=false;for(const r of rs){for(let i=0,j=r.length-3;i<r.length;j=i,i+=3){const xi=r[i],yi=r[i+1],xj=r[j],yj=r[j+1];if((yi>p[1])!==(yj>p[1])&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi)c=!c}}return c}

/* ---------- tiles: which are wanted, loading, cache ---------- */
const CACHE=new Map();let inflight=0,queue=[],loads=0;
const key=(z,x,y)=>z+"/"+x+"/"+y;
/* a tile no longer wanted (the view moved on) is not fetched, and one on its way is dropped */
const CTRL=new Map();
function want(list){queue=list.filter(k=>!CACHE.has(k));const W=new Set(list);CTRL.forEach((c,k)=>{if(!W.has(k)){try{c.abort()}catch(e){}}});pump()}
function pump(){while(inflight<PAR&&queue.length){const k=queue.shift();if(CACHE.has(k))continue;CACHE.set(k,{st:"load"});inflight++;
  const[z,x,y]=k.split("/").map(Number),ac=typeof AbortController!=="undefined"?new AbortController():null;if(ac)CTRL.set(k,ac);
  /* the tile is only kept as it came here; it is read later, when the map is still (see parseSoon) */
  tileUrl().then(u=>fetch(u.replace("{z}",z).replace("{x}",x).replace("{y}",y),ac?{signal:ac.signal}:undefined)).then(r=>r.ok?r.arrayBuffer():null).then(b=>{
   CACHE.set(k,{st:"raw",b,z,x,y,t:performance.now()});parseSoon()}).catch(()=>{CACHE.delete(k)}).finally(()=>{CTRL.delete(k);inflight--;trim();pump()})}}
/* reading tiles (decoding, sorting rings, finding lakes) is done in idle time and never while the map is being zoomed or
   dragged: the map keeps its coarse lakes, rivers and coast until the tiles are read, then the sharp ones take over */
const EMPTY=()=>({lakes:[],ocean:[],rivers:[],borders:[],names:[]});let PQ=false;
const busy=()=>{try{const g=typeof amGlobe!=="undefined"&&amGlobe;return!!(g&&(g._moving||performance.now()-(g._viewT||0)<300))}catch(e){return false}};
/* in slices of about 12 ms between frames (idle callbacks hardly come on a page that animates, and the tiles came in seconds late) */
function parseSoon(delay){if(PQ)return;PQ=true;setTimeout(parseIdle,delay||0)}
function parseIdle(){PQ=false;if(busy()){parseSoon(120);return}
 const live=new Set((ST&&ST.tiles||[]).map(t=>t.k)),raws=[...CACHE.entries()].filter(e=>e[1].st==="raw").sort((a,b)=>(live.has(b[0])?1:0)-(live.has(a[0])?1:0));if(!raws.length)return;
 const t0=performance.now();let did=0;
 for(const[k,v]of raws){if(did&&performance.now()-t0>12)break;
  let d;try{d=v.b&&v.b.byteLength?build(new Uint8Array(v.b),v.z,v.x,v.y):EMPTY()}catch(e){console.error("tile",k,e);d=EMPTY()}
  try{d.ocean.forEach(isLakeSea)}catch(e){}CACHE.set(k,{st:"ok",d,t:performance.now()});loads++;did++}
 redraw();if(raws.length>did)parseSoon(20)}
function trim(){if(CACHE.size<500)return;const live=new Set((ST&&ST.tiles||[]).map(t=>t.k));[...CACHE.entries()].filter(([k,v])=>(v.st==="ok"||v.st==="raw")&&!live.has(k)).sort((a,b)=>a[1].t-b[1].t).slice(0,150).forEach(([k])=>CACHE.delete(k))}
const got=k=>{const c=CACHE.get(k);return c&&c.st==="ok"?c.d:null};

/* ---------- what the view needs ---------- */
let ST=null,STK="",WT=0,WSIG="",WKIDS=[],LASTW=0;
/* the tiles one level down under the middle of the view (where a zoom in lands) */
function ahead(tiles,c,z){const n=Math.pow(2,z),cx=(c[0]+180)/360*n,r=c[1]*Math.PI/180,cy=(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n;
 return tiles.slice().sort((a,b)=>Math.hypot(a.x+.5-cx,a.y+.5-cy)-Math.hypot(b.x+.5-cx,b.y+.5-cy)).slice(0,4).flatMap(t=>[[0,0],[1,0],[0,1],[1,1]].map(([i,j])=>key(z+1,t.x*2+i,t.y*2+j)))}
function state(g){const sz=g.size(),k=(g.key?g.key():g.rot[0].toFixed(3)+","+g.rot[1].toFixed(3)+","+g.zoom.toFixed(4))+","+sz.w+","+sz.h+","+loads+","+allMapsColorMode;if(k===g._dstk&&g._dst)return(ST=g._dst);g._dstk=k;ST=g._dst=compute(g,sz);return ST}
function compute(g,sz){const P=g.projection(),inv=q=>{try{const ll=P.invert(q);if(!ll||!isFinite(ll[0])||!isFinite(ll[1])||Math.abs(ll[0])>180.001||Math.abs(ll[1])>90.001)return null;const b=P(ll);if(!b||Math.hypot(b[0]-q[0],b[1]-q[1])>2)return null;return ll}catch(e){return null}};
 const c=inv([sz.w/2,sz.h/2]),c2=inv([sz.w/2+10,sz.h/2]);if(!c||!c2)return{on:false};
 const dpp=d3.geoDistance(c,c2)*180/Math.PI/10;const z0=Math.min(MAXZ,Math.round(Math.log2(360*Math.cos(c[1]*Math.PI/180)/(TILEPX*dpp))));if(z0<MINZ)return{on:false,z:z0};
 /* the tiles are read one level sharper than the screen needs (low-zoom tiles simplify lakes into blobs); z0 still decides what is shown */
 let z=Math.min(MAXZ,z0+1);
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
 /* tiles are asked for while the view moves too (at most every 150 ms), coarser parents first so something sharp shows soon;
    once it settles, the next level down around the middle is fetched ahead, ready for the next zoom in */
 const ks=tiles.map(t=>t.k),sig=z+":"+ks.slice().sort().join(","),par=[...new Set(tiles.flatMap(t=>[2,1].filter(u=>z-u>=MINZ).map(u=>key(z-u,t.x>>u,t.y>>u))))];
 const list=()=>par.concat(ks,sig===WSIG?WKIDS:[]);clearTimeout(WT);const now=performance.now();
 if(sig===WSIG)want(list());else{WSIG=sig;WKIDS=[];if(now-LASTW>150){LASTW=now;want(list())}
  WT=setTimeout(()=>{if(WSIG!==sig)return;WKIDS=z<MAXZ?ahead(tiles,c,z):[];want(list());redraw()},180)}
 return{on:true,z:Math.min(z,z0),tz:z,tiles,all:tiles.every(t=>t.d)}}
const on=g=>{if(!view(g))return null;const s=state(g);return s.on&&s.all?s:null};

/* ---------- drawing ---------- */
function projector(g){const P=g.projection();if(g._flat)return(lo,la)=>P([lo,la]);const c=[-g.rot[0]*Math.PI/180,-g.rot[1]*Math.PI/180],cx=Math.cos(c[1])*Math.cos(c[0]),cy=Math.cos(c[1])*Math.sin(c[0]),cz=Math.sin(c[1]);
 return(lo,la)=>{const a=lo*Math.PI/180,b=la*Math.PI/180,cb=Math.cos(b);if(cb*Math.cos(a)*cx+cb*Math.sin(a)*cy+Math.sin(b)*cz<.02)return null;return P([lo,la])}}
let JUMP=Infinity;/* interrupted projections: a jump across a gap is not drawn */
function ringPath(ctx,pj,r,closeIt){let first=true,px=0,py=0;for(let i=0;i<r.length;i+=3){const q=pj(r[i],r[i+1]);if(!q)return false;if(first||Math.abs(q[0]-px)+Math.abs(q[1]-py)>JUMP){ctx.moveTo(q[0],q[1]);first=false}else ctx.lineTo(q[0],q[1]);px=q[0];py=q[1]}if(closeIt)ctx.closePath();return true}
function edgePath(ctx,pj,r,closed){let pen=false;const n=r.length/3;for(let k=0;k<(closed?n:n-1);k++){const i=k*3,j=((k+1)%n)*3;if(r[i+2]&r[j+2]){pen=false;continue}const a=pj(r[i],r[i+1]),b=pj(r[j],r[j+1]);if(!a||!b){pen=false;continue}if(!pen){ctx.moveTo(a[0],a[1]);pen=true}ctx.lineTo(b[0],b[1])}}
function boxClip(ctx,pj,t){const n=Math.pow(2,t.z),L=[];const ll=(x,y)=>{const m=Math.PI*(1-2*y/n);return[x/n*360-180,Math.atan(Math.sinh(m))*180/Math.PI]};const S=8;
 for(let i=0;i<=S;i++)L.push(ll(t.x+i/S,t.y));for(let i=0;i<=S;i++)L.push(ll(t.x+1,t.y+i/S));for(let i=0;i<=S;i++)L.push(ll(t.x+1-i/S,t.y+1));for(let i=0;i<=S;i++)L.push(ll(t.x,t.y+1-i/S));
 ctx.beginPath();let ok=true;L.forEach((p,i)=>{const q=pj(p[0],p[1]);if(!q){ok=false;return}i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();if(ok)ctx.clip();return ok}
/* the tiles count the Great Lakes (and the Caspian) as sea at small scales: a sea piece that lies inside one of the map's own
   big lakes is a lake, drawn with the lakes (on the pictures, where the sea is already painted, it would go missing) */
function isLakeSea(o){if(o._lk!==undefined)return o._lk;o._lk=false;try{const L=globeOverlays().lakes.filter(x=>!x.minor),b=bboxOf(o.rings),pts=[];
  /* points well inside the water: a grid over the piece, kept where it is water */
  for(let a=1;a<8;a++)for(let c=1;c<8;c++){const p=[b[0]+(b[2]-b[0])*a/8,b[1]+(b[3]-b[1])*c/8];if(inRings(o.rings,p))pts.push(p)}
  if(!pts.length)return false;let hit=0;const by=new Map();pts.forEach(p=>{const K=L.find(K=>d3.geoDistance(K.c,p)<=K.r+.01&&d3.geoContains(K,p));if(K){hit++;by.set(K,(by.get(K)||0)+1)}});
  /* which of the map's lakes it is (for its name on hover) */let bk=null,bn=0;by.forEach((n,K)=>{if(n>bn){bn=n;bk=K}});if(bk)o._lkn=bk.n;
  o._lk=hit>=Math.max(1,pts.length*.4)}catch(e){}return o._lk}
function bigLakes(d){return d.ocean.filter(isLakeSea).map(o=>{if(!o._K){o._K={cls:"lake",rings:o.rings,bb:bboxOf(o.rings),int:0,_big:1,n:o._lkn};o._K._casp=undefined}return o._K})}
let SEAL=null;function seaLakes(){if(SEAL)return SEAL;try{SEAL=globeOverlays().lakes.filter(L=>window.gfSeaLake&&gfSeaLake(L.n))}catch(e){SEAL=[]}return SEAL}
function isSeaLake(K){if(K._sl!==undefined)return K._sl;const c=[(K.bb[0]+K.bb[2])/2,(K.bb[1]+K.bb[3])/2];K._sl=seaLakes().some(L=>{try{return d3.geoContains(L,c)}catch(e){return false}});return K._sl}
let CASP=null;function caspian(){if(CASP!==null)return CASP;try{CASP=globeOverlays().lakes.find(L=>/^Caspian/.test(L.n||""))||false}catch(e){CASP=false}return CASP}
function isCaspian(K){if(K._casp!==undefined)return K._casp;const C=caspian();K._casp=!!(C&&K.bb[2]-K.bb[0]>.5&&d3.geoContains(C,[(K.bb[0]+K.bb[2])/2,(K.bb[1]+K.bb[3])/2]));return K._casp}
/* how many pixels about 25 km makes on screen (the coarse picture's coast can be off by about that much) */
function bandPx(pj,s){if(s._bpx!=null)return s._bpx;let v=20;try{const t=s.tiles[0],n=Math.pow(2,t.z),lo=(t.x+.5)/n*360-180,m=Math.PI*(1-2*(t.y+.5)/n),la=Math.atan(Math.sinh(m))*180/Math.PI;
 const a=pj(lo,la),b=pj(lo,la+.225);if(a&&b)v=Math.hypot(a[0]-b[0],a[1]-b[1])}catch(e){}return(s._bpx=v)}
/* the picture's sea colour near the coast: pixels just off the coast that look like sea, their median */
function seaCol(ctx,pj,s,W){if(s._sea!==undefined)return s._sea;if(!STILL){PEND=true;return null}let out=null;try{const T=ctx.getTransform(),R=[],G=[],B=[];let tries=0;const S=snap(ctx);if(!S.d)throw 0;const px1=(X,Y)=>{const o=(Y*S.w+X)*4;return[S.d[o],S.d[o+1],S.d[o+2]]};
 for(const t of s.tiles){const d=t.d;if(!d||!d.ocean)continue;/* the open sea; with none in view, the Caspian (the picture shows it as sea) */const SRC=d.ocean.filter(o=>!isLakeSea(o));if(!SRC.length)d.lakes.concat(bigLakes(d)).forEach(K=>{if(isCaspian(K))SRC.push(K)});for(const o of SRC){for(const r of o.rings){const step=Math.max(3,Math.floor(r.length/3/12))*3;
   for(let i=0;i<r.length&&R.length<60&&tries<400;i+=step){if(r[i+2])continue;const q=pj(r[i],r[i+1]);if(!q)continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){tries++;const x=q[0]+dx*W*1.4,y=q[1]+dy*W*1.4,X=Math.round(T.a*x+T.c*y+T.e),Y=Math.round(T.b*x+T.d*y+T.f);
     if(X<0||Y<0||X>=ctx.canvas.width||Y>=ctx.canvas.height)continue;const p=px1(X,Y);if(p[2]>p[0]+25&&p[2]>=p[1]){R.push(p[0]);G.push(p[1]);B.push(p[2])}}}}}}
 /* no sea pixels along a coast: points well inside the Caspian */
 if(R.length<5){for(const t of s.tiles){const d=t.d;if(!d)continue;for(const K of d.lakes.concat(bigLakes(d))){if(!isCaspian(K))continue;const b=K.bb;
   for(let a=1;a<6;a++)for(let c=1;c<6;c++){const ll=[b[0]+(b[2]-b[0])*a/6,b[1]+(b[3]-b[1])*c/6];if(!inRings(K.rings,ll))continue;const q=pj(ll[0],ll[1]);if(!q)continue;
    const X=Math.round(T.a*q[0]+T.c*q[1]+T.e),Y=Math.round(T.b*q[0]+T.d*q[1]+T.f);if(X<0||Y<0||X>=ctx.canvas.width||Y>=ctx.canvas.height)continue;const p=px1(X,Y);if(p[2]>p[0]+25&&p[2]>=p[1]){R.push(p[0]);G.push(p[1]);B.push(p[2])}}}}}
 if(R.length>=5){const md=a=>a.sort((x,y)=>x-y)[a.length>>1];out="rgb("+md(R)+","+md(G)+","+md(B)+")"}}catch(e){out=null}/* a failed look is not remembered: the picture may not be drawn yet */if(out)s._sea=out;return out}
/* water joined to the sea (river channels, estuaries, bays closed off by a line in the map data such as Lake Maracaibo's
   Tablazo Bay, lagoons like Lagoa dos Patos) is drawn in the sea's colour, not the lakes' pale blue. A lake is joined when
   it shares points with the sea in the same tile, touches water already found to be joined, or is a known sea lake. */
const SEA_IDS=new Set();
function vkeys(rings,set){rings.forEach(r=>{for(let i=0;i<r.length;i+=3){if(r[i+2])continue;set.add(r[i].toFixed(4)+","+r[i+1].toFixed(4))}})}
function shares(K,set){let n=0;for(const r of K.rings)for(let i=0;i<r.length;i+=3){if(r[i+2])continue;if(set.has(r[i].toFixed(4)+","+r[i+1].toFixed(4))&&++n>=2)return true}return false}
/* lakes right on the coast (lagoons and limans behind a sand bar, like those around Odessa): any point within about 2 km of the sea */
const NEAR=.02;
function coastGrid(d){const G=new Map();d.ocean.forEach(o=>{if(isLakeSea(o))return;o.rings.forEach(r=>{for(let i=0;i<r.length;i+=3){if(r[i+2])continue;const k=Math.floor(r[i]/NEAR)+","+Math.floor(r[i+1]/NEAR);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(r[i],r[i+1])}})});return G}
function nearCoast(K,G){if(!G.size)return false;for(const r of K.rings)for(let i=0;i<r.length;i+=3){if(r[i+2])continue;const x=r[i],y=r[i+1],cx=Math.floor(x/NEAR),cy=Math.floor(y/NEAR);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const P=G.get((cx+a)+","+(cy+b));if(!P)continue;for(let j=0;j<P.length;j+=2){const dx=(P[j]-x)*Math.cos(y*Math.PI/180),dy=P[j+1]-y;if(dx*dx+dy*dy<NEAR*NEAR)return true}}}return false}
function seaLinks(d){if(d._seaDone)return;d._seaDone=1;try{const S=new Set();d.ocean.forEach(o=>{if(!isLakeSea(o))vkeys(o.rings,S)});const CG=coastGrid(d);
 /* the Caspian is drawn as sea by the picture: water joined to it (Garabogazköl) is sea-coloured too */
 d.lakes.concat(bigLakes(d)).forEach(K=>{if(!isCaspian(K))return;vkeys(K.rings,S);K.rings.forEach(r=>{for(let i=0;i<r.length;i+=3){if(r[i+2])continue;const k=Math.floor(r[i]/NEAR)+","+Math.floor(r[i+1]/NEAR);let a=CG.get(k);if(!a)CG.set(k,a=[]);a.push(r[i],r[i+1])}})});
 const L=d.lakes;/* only water joined to the sea directly counts: river channels are sea-coloured as rivers, but do not pass the sea on to
    the lakes and reservoirs along them (Sobradinho on the São Francisco stays a lake) */
 L.forEach(K=>{if(K.cls==="river"){K._sea=false;return}K._sea=(K.id!=null&&SEA_IDS.has(K.id))||(!isCaspian(K)&&isSeaLake(K))||(S.size>0&&shares(K,S))||(!isCaspian(K)&&nearCoast(K,CG))});
 /* joined through other joined water (a bay, then the lake behind it) */
 for(let pass=0;pass<4;pass++){const J=new Set();L.forEach(K=>{if(K._sea&&K.cls!=="river")vkeys(K.rings,J)});let more=false;L.forEach(K=>{if(!K._sea&&K.cls!=="river"&&!isCaspian(K)&&J.size&&shares(K,J)){K._sea=true;more=true}});if(!more)break}
 L.forEach(K=>{if(K._sea&&K.id!=null)SEA_IDS.add(K.id)})}catch(e){console.error(e)}}
/* ---- the sea colour along each stretch of coast ---- */
const CH=24;/* points per stretch */
function colSig(I){let a="";try{const st=gfMS().style;a=st+"|"+JSON.stringify((window.gfReliefAdj&&gfReliefAdj.ADJ&&gfReliefAdj.ADJ[st])||"")+"|"+(window.gfLakeColor&&gfLakeColor())}catch(e){}return I.texKey+"|"+a+"|"+(window._gfSeaSig||"")}
/* reads single pixels of the picture as drawn so far, in screen terms (one read of a small square around each point) */
/* the picture is read once per frame, as a whole, the first time a colour is needed: hundreds of small reads each stalled the
   drawing (a zoom ran at a few frames a second) */
let FRAME=0,SNAP=null;
function snap(ctx){const c=ctx.canvas;if(!SNAP||SNAP.f!==FRAME||SNAP.c!==c){let d=null;try{d=ctx.getImageData(0,0,c.width,c.height).data}catch(e){}SNAP={f:FRAME,c,d,w:c.width,h:c.height}}return SNAP}
function pixReader(ctx){const T=ctx.getTransform(),cw=ctx.canvas.width,chh=ctx.canvas.height;let S=null;return(x,y)=>{const X=Math.round(T.a*x+T.c*y+T.e),Y=Math.round(T.b*x+T.d*y+T.f);if(X<1||Y<1||X>=cw-1||Y>=chh-1)return null;
  if(!S)S=snap(ctx);if(!S.d)return null;const d=S.d;let r=0,g=0,b=0;for(let j=-1;j<=1;j++){let o=((Y+j)*S.w+X-1)*4;for(let i=0;i<3;i++,o+=4){r+=d[o];g+=d[o+1];b+=d[o+2]}}return[r/9,g/9,b/9]}}
function chunkCol(px,pj,r,a,b,W){const R=[],G=[],B=[];const step=Math.max(1,Math.floor((b-a)/4));let seen=0;
 for(let k=a;k<b;k+=step){const i=k*3;if(r[i+2])continue;const q=pj(r[i],r[i+1]);if(!q)continue;
  for(const f of[1.6,2.4])for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]]){const p=px(q[0]+dx*W*f,q[1]+dy*W*f);if(p)seen++;if(p&&p[2]>p[0]+25&&p[2]>=p[1]){R.push(p[0]);G.push(p[1]);B.push(p[2])}}}
 /* "": looked, no sea there (remembered); undefined: not on screen (tried again later) */if(R.length<3)return seen?"":undefined;const md=v=>Math.round(v.sort((x,y)=>x-y)[v.length>>1]);return"rgb("+md(R)+","+md(G)+","+md(B)+")"}
function edgeSpan(ctx,pj,r,a,b){let pen=false;const n=r.length/3;for(let k=a;k<b-1;k++){const i=k*3,j=((k+1)%n)*3;if(r[i+2]&r[j+2]){pen=false;continue}const p=pj(r[i],r[i+1]),q=pj(r[j],r[j+1]);if(!p||!q){pen=false;continue}if(!pen){ctx.moveTo(p[0],p[1]);pen=true}ctx.lineTo(q[0],q[1])}
 if(b===n){const i=(n-1)*3;if(!(r[i+2]&r[2])){const p=pj(r[i],r[i+1]),q=pj(r[0],r[1]);if(p&&q){if(!pen)ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1])}}}}
/* while the map moves, no new colours are read (the last ones and the view's sea colour stand in); once it is still they are
   read a few milliseconds' worth per frame, and the map is drawn again until all are in */
let STILL=true,PEND=false,PT=0,T0=0;
function draw(g,ctx,I){const s=on(g);if(!s)return;FRAME++;STILL=!(g._moving||performance.now()-(g._viewT||0)<300);PEND=false;T0=performance.now();try{draw1(g,ctx,I,s)}finally{if(PEND){clearTimeout(PT);PT=setTimeout(redraw,STILL?0:200)}}}
function draw1(g,ctx,I,s){JUMP=g._gfProj?g.size().w*.25:Infinity;const pj=projector(g),ov=I.ov||{},sat=I.texKey==="satellite",rel=I.drewRaster&&/^(relief|gfRelShade)/.test(I.texKey||"");
 const borders=g.cfg.borders?g.cfg.borders():true,coast=s.z>=COASTZ,LT=window.gfRiverLate?gfRiverLate(g):1,z=g.zoom/LT;/* rivers: later on maps other than Relief and Elevation */
 /* each tile is drawn whole (begin, path, fill or stroke) so a tile drawn from its parent can be clipped to its own square */
 const each=fn=>s.tiles.forEach(t=>{if(!t.d)return;ctx.save();if(!boxClip(ctx,pj,t)){ctx.restore();return}try{fn(t.d)}finally{ctx.restore()}});
 const rivCol=sat?"rgb(26,66,120)":I.drewRaster?"#2f7ab8":"#14568c",rivA=Math.max(LT>1?.05:.12,Math.min(.9,(LT>1?.05:.12)+.4*(z-1)));
 /* fill maps: the sea drawn again over the land colours along the sharp coast */
 if(coast&&!I.drewRaster){/* cut the land colours back to the sharp coast, then put the sea colour (which may be clear) under the gap */
  ctx.save();ctx.globalCompositeOperation="destination-out";ctx.fillStyle="#000";each(d=>{ctx.beginPath();d.ocean.forEach(o=>o.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("evenodd")});
  ctx.globalCompositeOperation="destination-over";ctx.fillStyle=I.ocean||"#5797cf";each(d=>{ctx.beginPath();d.ocean.forEach(o=>o.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("evenodd")});ctx.restore()}
 /* Elevation: water joined to the sea is the colour of the shallow sea on its depth scale (a few tens of metres), not a colour
    read off the coast, which came out dark blue in bays beside pale shallows (the Gulf of Venezuela, Lagoa dos Patos) */
 const elev=I.texKey==="elevation";
 const seaC=elev?"#b3d3ea":I.drewRaster&&!sat?(seaCol(ctx,pj,s,Math.max(6,Math.min(70,bandPx(pj,s))))||window._gfSeaC||"rgb(38,116,185)"):null;/* no open sea in view (the Caspian): the last sea colour seen */if(seaC)window._gfSeaC=seaC;
 /* raster maps (Relief, Elevation...): the picture's own coast is coarse, and in places shows land where the sea is (the Gulf
    of Venezuela off Maracaibo). Along the sharp coast, a band of the picture's own sea colour is painted on the sea side only. */
 /* only on the plain Relief and Elevation pictures: on City Lights (a dark picture) and on maps coloured over the relief
    (Climate...) the sampled colour came out as a bright blue band along every coast */
 const plain=/^relief/i.test(String(I.texKey||""))&&(typeof allMapsColorMode==="undefined"||allMapsColorMode==="relief");/* (not Elevation either: its depth-shaded sea showed the band as pale squares) */
 if(I.drewRaster&&!sat&&plain){try{const W=Math.max(5,Math.min(55,bandPx(pj,s)*1.3));if(seaC){const sig=colSig(I);let px=null;
   each(d=>{if(!d.ocean.length)return;/* each stretch of coast in the colour of the sea just off it (the picture's sea is lighter over
     shallows and darker over deeps: one colour for the whole view left pale bands round darker seas, as in the Gulf of Bothnia) */
    const G=new Map();d.ocean.forEach(o=>{if(isLakeSea(o))return;o.rings.forEach((r,ri)=>{const n=r.length/3;for(let c0=0;c0<n;c0+=CH){const id=ri+":"+c0;
      if(!o._bc||o._bc.sig!==sig)o._bc={sig,m:new Map()};let col=o._bc.m.get(id);
      if(col===undefined){if(!STILL||performance.now()-T0>8)PEND=true;else{if(!px)px=pixReader(ctx);col=chunkCol(px,pj,r,c0,Math.min(n,c0+CH+1),W);if(col!==undefined)o._bc.m.set(id,col)}}
      col=col||seaC;let a=G.get(col);if(!a)G.set(col,a=[]);a.push([r,c0,Math.min(n,c0+CH+1)])}})});
    ctx.save();ctx.beginPath();d.ocean.forEach(o=>o.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.clip("evenodd");
    ctx.lineWidth=W*2;ctx.lineJoin=ctx.lineCap="round";try{ctx.filter="blur("+Math.round(W/3)+"px)"}catch(e){}
    G.forEach((list,col)=>{ctx.strokeStyle=col;ctx.beginPath();list.forEach(([r,a,b])=>edgeSpan(ctx,pj,r,a,b));ctx.stroke()});ctx.restore()})}}catch(e){console.error(e)}}
 if(ov.lakes){/* Satellite: only when Lakes is switched on (hover works either way), in clear blue, small lakes coming in with the zoom */
  const lf=sat?"rgba(64,138,214,0.76)":I.drewRaster?(rel?((window.gfLakeColor&&gfLakeColor())||(window._gfLakesClean?"#a8cbe5":"rgba(166,201,228,0.78)")):elev?"#86b6df":"#b9d8ea"):(I.ocean||"#5797cf");/* Elevation: lakes a clear blue, apart from the pale shallow sea (they looked white) */
  const ls=sat?"rgba(205,228,255,0.55)":rel?"rgba(40,90,140,0.45)":"rgba(255,255,255,0.5)";ctx.lineWidth=.4;
  const vis=K=>{if(!sat)return 1;const d=Math.hypot(K.bb[2]-K.bb[0],K.bb[3]-K.bb[1]);const za=3*Math.pow(.6/Math.max(.005,d),.6);return Math.min(1,Math.max(0,(g.zoom-za)/za))};
  each(d=>{const ne=window.gfSeaLake&&gfSeaLake.ne();const L0=d.lakes.filter(K=>K.cls!=="river"&&!(I.drewRaster&&isCaspian(K))).concat(I.drewRaster?bigLakes(d).filter(K=>!isCaspian(K)):[]);
   /* lakes open to the sea look like the sea: left to the Natural Earth picture, sea-coloured on Bright */
   if(seaC)seaLinks(d);/* big lakes that the tiles store as sea (Lake Albert, the Great Lakes) stay lakes, unless they are a known sea lake (Maracaibo) */const SL=seaC?L0.filter(K=>K._sea||(K._big&&!isCaspian(K)&&window.gfSeaLake&&gfSeaLake(K.n||""))):rel?L0.filter(isSeaLake):[],L=L0.filter(K=>!SL.includes(K));
   if(SL.length&&(seaC||!ne)){ctx.fillStyle=seaC||"#6fa3cd";ctx.beginPath();SL.forEach(K=>K.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("nonzero")}
   /* lakes that are often dry (Lake Eyre, salt pans) are drawn faint, with a dashed edge, so they do not look full */
   [[0,1],[1,.4]].forEach(([dry,fa])=>{const M=L.filter(K=>!!K.int===!!dry);if(!M.length)return;
    const groups=sat?[[.25,.5],[.5,.75],[.75,1.01]]:[[0,1.01]];
    groups.forEach(([lo,hi])=>{const G=M.filter(K=>{const v=vis(K);return v>lo&&v<=hi||(!sat&&true)});if(!G.length)return;const a=sat?(lo+hi)/2:1;
     ctx.globalAlpha=Math.min(1,a)*fa;ctx.fillStyle=lf;ctx.beginPath();G.forEach(K=>K.rings.forEach(r=>ringPath(ctx,pj,r,true)));ctx.fill("nonzero");
     if(I.drewRaster||dry){ctx.globalAlpha=Math.min(1,a);ctx.strokeStyle=ls;if(dry)ctx.setLineDash([3,2]);ctx.beginPath();G.forEach(K=>K.rings.forEach(r=>edgePath(ctx,pj,r,true)));ctx.stroke();ctx.setLineDash([])}})});ctx.globalAlpha=1})}
 /* Satellite: the tiles give the sharp coast and borders only; rivers are the map's own major ones (and lakes are in the photo) */
 if(ov.rivers&&!sat){ctx.lineJoin="round";ctx.lineCap="round";ctx.globalAlpha=rivA;
  /* wide rivers drawn as water areas, in the river colour */
  const RC=(!elev&&seaC)||rivCol;ctx.fillStyle=RC;if(seaC&&!elev)ctx.globalAlpha=1;each(d=>{ctx.beginPath();d.lakes.forEach(K=>{if(K.cls==="river")K.rings.forEach(r=>ringPath(ctx,pj,r,true))});ctx.fill("evenodd")});ctx.globalAlpha=rivA;
  /* major rivers bold from the start; every other river fades in at its own zoom, by how far it reaches (long ones first,
     short ones later), so they do not all appear at once; small rivers and streams later still and thinner */
  ctx.strokeStyle=RC;const B=new Map();
  each(d=>d.rivers.forEach(R=>{const t=R._t||(R._t=tier(R));let w,a;
   if(t==="major"){w=Math.min(1.8,.55+.07*z);a=rivA}
   else{let za=18*Math.pow(4/reach(R),.7);if(t==="minor")za=Math.max(za,55);if(t==="stream")za=Math.max(za,110);
    a=Math.min(t==="medium"?.85:.7,Math.max(0,(z-za)/za));if(a<.04)return;w=Math.min(t==="medium"?1.1:.8,.3+.25*Math.log2(1+z/za))}
   const k=(Math.round(a*20)/20)+"|"+(Math.round(w*10)/10);let L=B.get(k);if(!L)B.set(k,L=[]);L.push([R,d])}));
  /* one stroke per look; a tile drawn from its parent keeps its clip, so those are drawn tile by tile */
  [...B.entries()].sort((x,y)=>parseFloat(x[0])-parseFloat(y[0])).forEach(([k,L])=>{const[a,w]=k.split("|").map(Number);ctx.globalAlpha=a;ctx.lineWidth=w;
   each(d=>{ctx.beginPath();let any=false;L.forEach(([R,dd])=>{if(dd!==d)return;any=true;R.ls.forEach(l=>ringPath(ctx,pj,l,false))});if(any)ctx.stroke()})});
  /* the map's own big rivers that these tiles leave out (the first detail levels hold only some rivers): drawn from the map's own line, so none vanishes */
  {const have=new Set();each(d=>d.rivers.forEach(R=>{if(R._t==="major"&&R.cn)have.add(R.cn)}));ctx.globalAlpha=rivA;ctx.lineWidth=Math.min(1.8,.55+.07*z);ctx.beginPath();
   try{globeOverlays().rivers.forEach(Rv=>{if(have.has(Rv.n)||/^[A-Z]{2}[-\\/]/.test(Rv.n))return;Rv.coordinates.forEach(l=>{let pen=false;for(const q of l){const v=pj(q[0],q[1]);if(!v){pen=false;continue}if(pen)ctx.lineTo(v[0],v[1]);else{ctx.moveTo(v[0],v[1]);pen=true}}})})}catch(e){}ctx.stroke()}
  ctx.globalAlpha=1}
 /* borders over the sea are left out: the tiles carry some claim lines out across the water (a dashed line through the Gulf
    of Venezuela) that read as land borders. A piece is kept where the middle of each of its steps is on land. */
 const landB=landBorders;
 if(coast&&borders){ctx.lineWidth=.55;ctx.strokeStyle=I.drewRaster?"rgba(25,25,25,0.55)":"rgba(20,30,20,0.5)";
  each(d=>{ctx.beginPath();d.ocean.forEach(o=>{if(isLakeSea(o))return;o.rings.forEach(r=>edgePath(ctx,pj,r,true))});landB(d).forEach(B=>{if(!B.disp)B.ls.forEach(l=>ringPath(ctx,pj,l,false))});ctx.stroke();
   ctx.setLineDash([3,2]);ctx.beginPath();landB(d).forEach(B=>{if(B.disp)B.ls.forEach(l=>ringPath(ctx,pj,l,false))});ctx.stroke();ctx.setLineDash([])})}}

/* ---------- hover: name and outline the river or lake under the pointer ---------- */
const LAB={lake:"Lake",river:"River",pond:"Pond",dock:"Dock",basin:"Reservoir",reservoir:"Reservoir",lagoon:"Lagoon",stream:"Stream",canal:"Canal",drain:"Drain",ditch:"Ditch",swimming_pool:"Pool"};
function d3poly(rings){/* d3 wants each piece wound the other way from the tile's; check by area */const pol=rings.map(r=>{const c=[];for(let i=0;i<r.length;i+=3)c.push([r[i],r[i+1]]);if(c.length&&(c[0][0]!==c[c.length-1][0]||c[0][1]!==c[c.length-1][1]))c.push(c[0].slice());return c});
 let P={type:"Polygon",coordinates:pol};try{if(d3.geoArea(P)>2*Math.PI)P={type:"Polygon",coordinates:pol.map(r=>r.slice().reverse())}}catch(e){}return P}
function lakeAt(s,ll){for(const t of s.tiles){if(!t.d)continue;for(const K of t.d.lakes.concat(bigLakes(t.d))){if(ll[0]<K.bb[0]||ll[0]>K.bb[2]||ll[1]<K.bb[1]||ll[1]>K.bb[3])continue;if(inRings(K.rings,ll))return K}}return null}
/* lakes the tiles leave unnamed (Crater Lake…) are named from a list of about 7,000 named lakes and their positions
   (Wikidata, CC0): a named point inside the lake, or just off its shore, names it */
let GAZ=null,GAZG=null;function gazLoad(){if(GAZ)return;GAZ=[];fetch("textures/GF_LAKENAMES.json").then(r=>r.ok?r.json():[]).then(d=>{GAZ=d;GAZG=new Map();d.forEach(p=>{const k=Math.floor(p[1])+","+Math.floor(p[2]);let a=GAZG.get(k);if(!a)GAZG.set(k,a=[]);a.push(p)})}).catch(()=>{})}
function gazName(K){if(K._gz!==undefined)return K._gz;gazLoad();if(!GAZG)return null;K._gz=null;const b=K.bb,pad=.03;let best=null,bd=1e9;const cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;
 for(let x=Math.floor(b[0]-pad);x<=Math.floor(b[2]+pad);x++)for(let y=Math.floor(b[1]-pad);y<=Math.floor(b[3]+pad);y++){const a=GAZG.get(x+","+y);if(!a)continue;for(const p of a){if(p[1]<b[0]-pad||p[1]>b[2]+pad||p[2]<b[1]-pad||p[2]>b[3]+pad)continue;
  const inside=inRings(K.rings,[p[1],p[2]]),d=(inside?0:1)+Math.hypot(p[1]-cx,p[2]-cy)*1e-3;if(d<bd){bd=d;best=p}}}
 if(best&&(bd<1||Math.max(b[2]-b[0],b[3]-b[1])<.6))K._gz=best[0];return K._gz}
setTimeout(gazLoad,4000);
function waterHit(g,ll,cx,cy,ov,base){const s=on(g);if(!s)return null;const out={};
 /* close up, a lake is outlined from the tiles' sharp shape, every piece of it; named from the tiles, or else from the map's own lake
    under the pointer, or else by its kind ("Lake", "Reservoir"...) */
 if(ov.lakes){const K=lakeAt(s,ll);if(K){let gz=null;if(!((base&&base.lake&&base.water)||K.n||(K.id!=null&&NAMES.get(K.id)))){gz=gazName(K);if(!gz&&K.id!=null)s.tiles.forEach(t=>{if(gz||!t.d)return;t.d.lakes.forEach(Q=>{if(!gz&&Q!==K&&Q.id===K.id)gz=gazName(Q)})});if(gz&&K.id!=null)NAMES.set(K.id,gz)}
   const name=(base&&base.lake&&base.water)||K.n||(K.id!=null&&NAMES.get(K.id))||gz||LAB[K.cls]||"Lake";const co=[];
   const same=Q=>Q===K||(K.id!=null&&Q.id===K.id);s.tiles.forEach(t=>{if(!t.d)return;t.d.lakes.forEach(Q=>{if(same(Q))Q.polys.forEach(p=>co.push(d3poly(p).coordinates))});
    if(K._big)bigLakes(t.d).forEach(Q=>{if(Q===K||(K.n&&Q.n===K.n))co.push(d3poly(Q.rings).coordinates)})});
   const ed=[];const shore=rings=>rings.forEach(r=>{const n=r.length/3;let cur=null;for(let k=0;k<n;k++){const i=k*3,j=((k+1)%n)*3;if(r[i+2]&r[j+2]){if(cur&&cur.length>1)ed.push(cur);cur=null;continue}if(!cur)cur=[[r[i],r[i+1]]];cur.push([r[j],r[j+1]])}if(cur&&cur.length>1)ed.push(cur)});
   s.tiles.forEach(t=>{if(!t.d)return;t.d.lakes.forEach(Q=>{if(same(Q))shore(Q.rings)});if(K._big)bigLakes(t.d).forEach(Q=>{if(Q===K||(K.n&&Q.n===K.n))shore(Q.rings)})});
   out.water=name;out.lake={type:"MultiPolygon",coordinates:co,n:out.water,edge:{type:"MultiLineString",coordinates:ed}};return out}}
 if(ov.rivers&&allMapsColorMode!=="satellite"){const pj=projector(g),rc=g.canvas.getBoundingClientRect(),mx=cx-rc.left,my=cy-rc.top;let best=6,hit=null;const pad=.5;
  s.tiles.forEach(t=>{if(!t.d)return;t.d.rivers.forEach(R=>{if(ll[0]<R.bb[0]-pad||ll[0]>R.bb[2]+pad||ll[1]<R.bb[1]-pad||ll[1]>R.bb[3]+pad)return;R.ls.forEach(l=>{let a=null;for(let i=0;i<l.length;i+=3){const b=pj(l[i],l[i+1]);if(a&&b){const vx=b[0]-a[0],vy=b[1]-a[1],L2=vx*vx+vy*vy||1;let u=((mx-a[0])*vx+(my-a[1])*vy)/L2;u=Math.max(0,Math.min(1,u));const d=Math.hypot(a[0]+u*vx-mx,a[1]+u*vy-my);if(d<best&&R.name&&(t=>t==="major"||t!=="stream"&&g.zoom/(window.gfRiverLate?gfRiverLate(g):1)>18*Math.pow(4/reach(R),.7)*1.25&&(t==="medium"||g.zoom/(window.gfRiverLate?gfRiverLate(g):1)>60))(R._t||(R._t=tier(R)))){best=d;hit=R}}a=b}})})});
  if(hit){const co=[];s.tiles.forEach(t=>{if(!t.d)return;t.d.rivers.forEach(R=>{if(R===hit||(hit.name&&R.name===hit.name))R.ls.forEach(l=>{const c=[];for(let i=0;i<l.length;i+=3)c.push([l[i],l[i+1]]);co.push(c)})})});
   const n=hit.name;out.water=hit.name&&hit.cls==="river"&&!/river|rio|río|fleuve|fluss|joki|älv|elva|reka|река|nehri|nahr/i.test(n)?n+" River":n;out.river={type:"MultiLineString",coordinates:co,n:out.water};return out}}
 return null}
const _wa=GlobeView.prototype.waterAt;GlobeView.prototype.waterAt=function(ll,cx,cy){const out=_wa.apply(this,arguments)||{};try{let ov=this.cfg.overlays?this.cfg.overlays():{};/* Satellite: lakes are in the photo; hovering one names it even with Lakes off */if(allMapsColorMode==="satellite"&&!ov.lakes)ov=Object.assign({},ov,{lakes:true});if(view(this)&&(ov.lakes||ov.rivers)){const h=waterHit(this,ll,cx,cy,ov,out);
  if(h){delete out.lake;delete out.river;Object.assign(out,h);if(out.lake&&!h.lake)delete out.lake}else if(on(this)){/* the built-in shapes are not drawn now: keep only a name from them */if(out.lake){const n=out.water;delete out.lake;out.water=n}/* rivers: the big ones are still drawn from the built-in lines at this zoom (a tile with no named line for them), so a hit on one stands */}}}catch(e){console.error(e)}return out};

/* sharp outlines for a searched island or lake (geoflock-search.js): from the tiles on show, the coast rings (islands are holes in
   the sea) or lake shapes that lie within the place's box. null when the tiles are not on show or nothing fits */
function sharpFor(g,kind,bb,ll){const s=on(g);if(!s)return null;const w=bb[2]-bb[0],h=bb[3]-bb[1],pad=Math.max(w,h)*.25+.02,B=[bb[0]-pad,bb[1]-pad,bb[2]+pad,bb[3]+pad];
 const inB=b=>b[0]>=B[0]&&b[2]<=B[2]&&b[1]>=B[1]&&b[3]<=B[3];const polys=[],seen=new Set();
 s.tiles.forEach(t=>{const d=t.d;if(!d||seen.has(d))return;seen.add(d);
  if(kind==="lake")d.lakes.forEach(K=>{if(K.cls==="river"||!inB(K.bb))return;K.polys.forEach(p=>polys.push(d3poly(p).coordinates))});
  else d.ocean.forEach(o=>o.rings.forEach(r=>{let edge=false;for(let i=2;i<r.length;i+=3)if(r[i]){edge=true;break}if(edge)return;const b=bboxOf([r]);if(!inB(b)||b[2]-b[0]<1e-4)return;polys.push(d3poly([r]).coordinates)}))});
 if(!polys.length)return null;return{type:"MultiPolygon",coordinates:polys}}
/* is each point in the sea? From OpenFreeMap's coast (the water layer's ocean), fetched for the tiles the points fall in,
   whatever the map is showing; for the cross-section. Resolves to an array of true/false, or null when the tiles cannot be had */
async function seaAt(lls){if(!lls||!lls.length)return null;const tk=(ll,z)=>{const n=2**z,la=Math.max(-85.05,Math.min(85.05,ll[1]))*Math.PI/180;return[Math.floor(((ll[0]+180)/360%1+1)%1*n),Math.max(0,Math.min(n-1,Math.floor((1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n)))]};
 let z=12,K;for(;z>=6;z--){K=new Set(lls.map(ll=>{const t=tk(ll,z);return key(z,t[0],t[1])}));if(K.size<=40)break}
 const u=await tileUrl(),D={};
 await Promise.all([...K].map(async k=>{try{let d=got(k);if(!d){const[zz,x,y]=k.split("/").map(Number);const r=await fetch(u.replace("{z}",zz).replace("{x}",x).replace("{y}",y));if(!r.ok)throw new Error("tile");const bb=await r.arrayBuffer();
  d=bb.byteLength?build(new Uint8Array(bb),zz,x,y):EMPTY();try{d.ocean.forEach(isLakeSea)}catch(e){}CACHE.set(k,{st:"ok",d,t:performance.now()})}D[k]=d}catch(e){/* a tile that failed: its points are left unknown */}}));
 return lls.map(ll=>{const t=tk(ll,z),d=D[key(z,t[0],t[1])];if(!d)return null;return d.ocean.some(o=>!o._lk&&inRings(o.rings,ll))})}
/* borders over the sea are left out (see draw1) */
function landBorders(d){if(d._bl)return d._bl;const O=d.ocean.filter(o=>!isLakeSea(o));if(!O.length)return(d._bl=d.borders);const wet=(x,y)=>O.some(o=>inRings(o.rings,[x,y]));
  d._bl=d.borders.map(B=>{const ls=[];B.ls.forEach(l=>{let cur=[];const flush=()=>{if(cur.length>=6)ls.push(Float64Array.from(cur));cur=[]};
   for(let i=0;i+3<l.length;i+=3){if(wet((l[i]+l[i+3])/2,(l[i+1]+l[i+4])/2)){flush();continue}if(!cur.length)cur.push(l[i],l[i+1],l[i+2]);cur.push(l[i+3],l[i+4],l[i+5])}flush()});return{disp:B.disp,ls}});return d._bl}
/* the hovered country's outline when zoomed in: the detailed coast and borders, kept to a band around its rough outline (its
   rough shape can be several kilometres off), instead of the rough outline itself. Returns false when there is no detail. */
let HM=null,HL=null;
function hotSharp(g,ctx,fs,lw){const s=on(g);if(!s||s.z<COASTZ||!fs.length||!s.tiles.some(t=>t.d))return false;const cv=ctx.canvas,W=cv.width,H=cv.height;if(!W||!H)return false;
 if(!HM){HM=document.createElement("canvas");HL=document.createElement("canvas")}[HM,HL].forEach(c=>{if(c.width!==W||c.height!==H){c.width=W;c.height=H}});
 const m=HM.getContext("2d"),l=HL.getContext("2d"),T=ctx.getTransform(),pj=projector(g);
 /* how many pixels 20 km makes here: the band kept around the rough outline */
 let band=16;try{const c=g.projection().invert([g.size().w/2,g.size().h/2]),a=pj(c[0],c[1]),b=pj(c[0],c[1]+.18);if(a&&b)band=Math.max(12,Math.min(260,Math.hypot(a[0]-b[0],a[1]-b[1])*2))}catch(e){}
 m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,W,H);m.setTransform(T);const P=d3.geoPath(g.projection(),m);m.beginPath();fs.forEach(f=>P(f));m.fillStyle="#000";m.fill();m.lineWidth=band;m.lineJoin="round";m.strokeStyle="#000";m.stroke();
 l.setTransform(1,0,0,1,0,0);l.globalCompositeOperation="source-over";l.clearRect(0,0,W,H);l.setTransform(T);l.strokeStyle="#ffffff";l.lineWidth=lw;l.lineJoin=l.lineCap="round";
 s.tiles.forEach(t=>{if(!t.d)return;l.save();if(!boxClip(l,pj,t)){l.restore();return}l.beginPath();t.d.ocean.forEach(o=>{if(isLakeSea(o))return;o.rings.forEach(r=>edgePath(l,pj,r,true))});landBorders(t.d).forEach(B=>B.ls.forEach(x=>ringPath(l,pj,x,false)));l.stroke();l.restore()});
 l.setTransform(1,0,0,1,0,0);l.globalCompositeOperation="destination-in";l.drawImage(HM,0,0);l.globalCompositeOperation="source-over";
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(HL,0,0);ctx.restore();return true}
window.gfDetail={hotSharp:(g,ctx,fs,lw)=>{try{return hotSharp(g,ctx,fs,lw)}catch(e){return false}},seaAt:lls=>seaAt(lls).catch(()=>null),sharp:(g,kind,bb,ll)=>{try{return sharpFor(g,kind,bb,ll)}catch(e){return null}},onRedraw:f=>REDRAW.add(f),dbg:()=>({WSIG:WSIG.slice(0,60),q:queue.length,inflight,loads}),lakeInfo:(g,ll)=>{const s=on(g);if(!s)return'off';const out=[];s.tiles.forEach(t=>{if(!t.d)return;t.d.lakes.concat(bigLakes(t.d)).forEach(K=>{if(ll[0]<K.bb[0]||ll[0]>K.bb[2]||ll[1]<K.bb[1]||ll[1]>K.bb[3])return;if(inRings(K.rings,ll))out.push({cls:K.cls,big:!!K._big,n:K.n,sea:K._sea,casp:isCaspian(K),bb:K.bb.map(v=>+v.toFixed(2))})})});return out},covers:g=>{try{if(allMapsColorMode==="satellite")return false}catch(e){}return!!on(g)},ownsCoast:g=>{const s=on(g);return!!(s&&s.z>=COASTZ)},draw:(g,ctx,I)=>{try{draw(g,ctx,I)}catch(e){console.error(e)}},state:g=>view(g)?state(g):null,cache:CACHE};
/* the credit, shown on the map while the tiles are in use */
setInterval(()=>{try{const g=typeof amGlobe!=="undefined"&&amGlobe;const h=g&&g.host;if(!h)return;let c=h.querySelector(".gf-dt-cred");const v=!!(g&&on(g));if(v&&!c){c=document.createElement("div");c.className="gf-dt-cred";c.innerHTML='Detail © <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';h.appendChild(c)}if(c)c.hidden=!v}catch(e){}},700);
{const st=document.createElement("style");st.textContent=".gf-dt-cred{position:absolute;right:62px;bottom:4px;z-index:6;font:500 9.5px system-ui,sans-serif;color:#33475b;background:rgba(255,255,255,.62);padding:1px 6px;border-radius:6px;pointer-events:auto}.gf-dt-cred a{color:inherit}.gf-dt-cred[hidden]{display:none}";document.head.appendChild(st)}

/* ---------- the Projections map: the same detail on a canvas over its picture ---------- */
(function(){if(typeof projRender!=="function")return;
 window.gfProjMaxZoom=64;
 const V={_gfProj:1,_flat:true,rot:[0,0],get zoom(){return proj.zoom||1},projection:()=>proj._p,size:()=>{const m=document.getElementById("projSvg");return{w:+(m&&m.getAttribute("width"))||800,h:+(m&&m.getAttribute("height"))||400}},
  key:()=>{const p=proj._p;return p?p.scale().toFixed(2)+","+p.translate().map(v=>v.toFixed(1))+","+p.rotate().map(v=>v.toFixed(2))+","+(projDef().id||""):"-"},cfg:{borders:()=>true},canvas:null};
 function paint(){const host=document.getElementById("projMap"),svg=document.getElementById("projSvg");let c=document.getElementById("projDetail");
  if(!host||!svg||!proj.on||!proj._p){if(c)c.hidden=true;return}
  if(!c){c=document.createElement("canvas");c.id="projDetail";c.style.cssText="position:absolute;pointer-events:none;z-index:1";host.appendChild(c);if(getComputedStyle(host).position==="static")host.style.position="relative"}
  const s=on(V);svg.classList.toggle("gf-pd-coast",!!(s&&s.z>=COASTZ));if(!s){c.hidden=true;return}c.hidden=false;
  const sz=V.size(),hr=host.getBoundingClientRect(),sr=svg.getBoundingClientRect(),k=sr.width/sz.w||1,dpr=Math.min(2,devicePixelRatio||1);
  c.style.left=(sr.left-hr.left+host.scrollLeft)+"px";c.style.top=(sr.top-hr.top+host.scrollTop)+"px";c.style.width=sr.width+"px";c.style.height=sr.height+"px";
  /* the zoom preview has moved the picture: draw only once it settles */
  if(proj._pv)return;c.style.transform="";
  const W=Math.round(sr.width*dpr),H=Math.round(sr.height*dpr);if(c.width!==W||c.height!==H){c.width=W;c.height=H}
  const ctx=c.getContext("2d");ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.setTransform(dpr*k,0,0,dpr*k,0,0);
  const sea=svg.querySelector(".proj-sea"),od=sea&&sea.getAttribute("d");ctx.save();if(od)try{ctx.clip(new Path2D(od))}catch(e){}
  const ocean=sea?getComputedStyle(sea).fill:"#5797cf";
  draw(V,ctx,{texKey:null,drewRaster:false,ov:{lakes:true,rivers:true},ocean});ctx.restore()}
 const _pr=projRender;projRender=function(){const r=_pr.apply(this,arguments);try{paint()}catch(e){console.error(e)}return r};
 if(typeof pjEls==="function"){const _pe=pjEls;pjEls=function(){const a=_pe.apply(this,arguments);const c=document.getElementById("projDetail");if(c&&!c.hidden&&a.length)a.push(c);return a}}
 REDRAW.add(()=>{if(typeof proj!=="undefined"&&proj.on)paint()});
 const st=document.createElement("style");st.textContent="#projSvg.gf-pd-coast .proj-land,#projSvg.gf-pd-coast .proj-seamline{stroke:none !important}";document.head.appendChild(st);
})();
})();
/* ---------- Satellite: lakes are never painted over the photo (the photo shows them); hovering one outlines it and names it ----------
   The drawing reads the map's overlays: on Satellite they say "no lakes". Hovering still finds lakes (waterAt switches them on
   for the hit test), and the Lakes switch is hidden there, since it would do nothing. */
(function(){const sat=()=>{try{return allMapsColorMode==="satellite"}catch(e){return false}};
 const patch=()=>{const g=typeof amGlobe!=="undefined"?amGlobe:null;if(!g||!g.cfg||typeof g.cfg.overlays!=="function"){setTimeout(patch,600);return}if(g.cfg._gfSatNoLakes)return;g.cfg._gfSatNoLakes=1;
  const o=g.cfg.overlays;g.cfg.overlays=function(){const r=o.apply(this,arguments)||{};/* Satellite: lakes are never drawn (they are in the photo), but while the pointer is matched to a place every lake counts,
     big and small, so hovering one outlines and names it whatever the Lakes switch says */if(!sat())return r;return INHIT?Object.assign({},r,{lakes:true,minorLakes:true}):(r.lakes||r.minorLakes?Object.assign({},r,{lakes:false,minorLakes:false}):r)}};patch();
 /* while the pointer is being matched to a place, lakes count as on, so hovering a lake still finds it and names it */
 let INHIT=0;const wrapHit=()=>{if(typeof GlobeView==="undefined")return;const W=GlobeView.prototype.waterAt;if(!W||W._gfSatOuter)return;const f=function(){INHIT++;try{return W.apply(this,arguments)}finally{INHIT--}};Object.assign(f,W);f._gfSatOuter=1;GlobeView.prototype.waterAt=f};
 setInterval(()=>{wrapHit();/* the map's settings object can be replaced: patch the new one */try{if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.cfg&&!amGlobe.cfg._gfSatNoLakes)patch()}catch(e){}const t=document.getElementById("allMapsLakesToggle");if(!t)return;const box=t.closest("label")||t.parentElement;if(box){const hide=sat();if(box._gfSatHid!==hide){box._gfSatHid=hide;box.style.display=hide?"none":""}}},400)})();
