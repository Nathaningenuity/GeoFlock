/* GeoFlock: the People counter. It is the Toolkit's Geometry set in people mode (one set of shapes, one way to draw, pick,
   move, resize and edit them), with every shape labelled with the people inside and a People section in the panel:
   - Country: click a country to make it a shape; Around a place: a circle of a chosen size round a city or country;
     Grow: click a centre and a circle grows until it holds a target (100 million … half of humanity). All of these are
     ordinary shapes afterwards: pick them with Select, drag them, resize them, Parameters, Make oval, Delete.
   - The picked shape: people, size, density, share of the world, countries and main cities inside, a country of about
     the same population; cut it with lines into parts (or in half) to compare them.
   - Every shape: a ranked comparison.
   Clicks for Country and Grow let the map see the press and the release (so it never keeps following the mouse); only the
   click itself is swallowed. Drawing a cut is always cancellable (Esc or a right-click).
   People: GHS-POP 2025 (European Commission JRC, CC BY 4.0) summed over 0.1° cells (about 11 km), so small shapes and
   coasts are approximate. */
(function(){
if(typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const T=()=>window.gfToolkit||null;
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent?amGlobe:null}catch(e){return null}};
const mapMode=()=>{try{return appMode==="allmaps"?allMapsColorMode:null}catch(e){return null}};
const R_KM=6371;
const isOpen=()=>{const t=T();return!!(t&&t.GEO&&t.GEO.people&&document.getElementById("gfkGeo"))};

/* ---------- the people grid (0.1°) and which country each cell is in ---------- */
let POP=null,popP=null,WORLD=0;const W=3600,H=1800,STEP=.1;
function load(){if(popP)return popP;popP=new Promise((ok,no)=>{const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 const d=x.getImageData(0,0,W,H).data,a=new Float32Array(W*H);let t=0;for(let i=0,j=0;i<a.length;i++,j+=4){const v=(d[j]<<8)|d[j+1];a[i]=v?Math.pow(10,v/4096)-1:0;t+=a[i]}POP=a;WORLD=t;c.width=0;ok(a)}catch(e){no(e)}};im.onerror=no;im.src="textures/POP_GRID_0p1.png"});return popP}
let CIDX=null,CODES=[];
function countryGrid(){if(CIDX)return CIDX;try{const F=projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c);const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});
 const pr=d3.geoEquirectangular().scale(W/(2*Math.PI)).translate([W/2,H/2]).precision(.2),path=d3.geoPath(pr,x);CODES=[null];
 F.forEach(f=>{const id=CODES.length;CODES.push(String(f.properties.c).toLowerCase());x.fillStyle="rgb("+(id>>8)+","+(id&255)+",255)";x.beginPath();path(f);x.fill()});
 const d=x.getImageData(0,0,W,H).data,a=new Uint16Array(W*H);for(let i=0,j=0;i<a.length;i++,j+=4)if(d[j+2]===255&&d[j+3]===255)a[i]=(d[j]<<8)|d[j+1];CIDX=a;c.width=0}catch(e){console.error(e);CIDX=new Uint16Array(1)}return CIDX}
function mask(rings){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;rings.forEach(r=>r.forEach(([lo,la])=>{x0=Math.min(x0,lo);x1=Math.max(x1,lo);y0=Math.min(y0,la);y1=Math.max(y1,la)}));
 const c0=Math.max(0,Math.floor((x0+180)/STEP)),c1=Math.min(W-1,Math.ceil((x1+180)/STEP)),r0=Math.max(0,Math.floor((90-y1)/STEP)),r1=Math.min(H-1,Math.ceil((90-y0)/STEP));
 const w=c1-c0+1,h=r1-r0+1;if(w<1||h<1)return null;const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d",{willReadFrequently:true});x.fillStyle="#fff";x.beginPath();
 rings.forEach(r=>r.forEach(([lo,la],i)=>{const px=(lo+180)/STEP-c0,py=(90-la)/STEP-r0;i?x.lineTo(px,py):x.moveTo(px,py)}));x.fill("evenodd");
 const d=x.getImageData(0,0,w,h).data;cv.width=0;return{c0,r0,w,h,at:(i,j)=>d[(j*w+i)*4+3]>=128}}
/* union or overlap of several areas: each drawn on the same frame of cells, then combined cell by cell */
function comboMask(list,op){if(!list.length)return null;const box=R=>{let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;R.forEach(r=>r.forEach(([lo,la])=>{x0=Math.min(x0,lo);x1=Math.max(x1,lo);y0=Math.min(y0,la);y1=Math.max(y1,la)}));return[x0,x1,y0,y1]};
 const B=list.map(box);let F=op==="inter"?[Math.max(...B.map(b=>b[0])),Math.min(...B.map(b=>b[1])),Math.max(...B.map(b=>b[2])),Math.min(...B.map(b=>b[3]))]:[Math.min(...B.map(b=>b[0])),Math.max(...B.map(b=>b[1])),Math.min(...B.map(b=>b[2])),Math.max(...B.map(b=>b[3]))];
 if(F[0]>F[1]||F[2]>F[3])return{c0:0,r0:0,w:0,h:0,at:()=>false};
 const c0=Math.max(0,Math.floor((F[0]+180)/STEP)),c1=Math.min(W-1,Math.ceil((F[1]+180)/STEP)),r0=Math.max(0,Math.floor((90-F[3])/STEP)),r1=Math.min(H-1,Math.ceil((90-F[2])/STEP));const w=c1-c0+1,h=r1-r0+1;if(w<1||h<1)return null;
 const acc=new Uint8Array(w*h);const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d",{willReadFrequently:true});
 list.forEach(rings=>{x.clearRect(0,0,w,h);x.fillStyle="#fff";x.beginPath();rings.forEach(r=>r.forEach(([lo,la],i)=>{const px=(lo+180)/STEP-c0,py=(90-la)/STEP-r0;i?x.lineTo(px,py):x.moveTo(px,py)}));x.fill("evenodd");const d=x.getImageData(0,0,w,h).data;for(let i=0;i<w*h;i++)if(d[i*4+3]>=128)acc[i]++});
 cv.width=0;const need=op==="inter"?list.length:1;return{c0,r0,w,h,at:(i,j)=>acc[j*w+i]>=need}}
/* the area of the cells in a mask (km²), for combined shapes */
function maskKm2(m){let a=0;const c=111.32*STEP;for(let j=0;j<m.h;j++){const la=90-(m.r0+j+.5)*STEP,ca=c*c*Math.cos(la*Math.PI/180);for(let i=0;i<m.w;i++)if(m.at(i,j))a+=ca}return a}
/* a cut: the points it was drawn through (2 for an old straight cut). Its ends are carried on far beyond the shape, so it
   cuts all the way across; a cell is on one side or the other of the nearest piece of the line (curves are followed) */
function cutPrep(c){const P=c.map(q=>[q[0],q[1]]);if(P.length<2)return null;const k=Math.cos((P.reduce((a,q)=>a+q[1],0)/P.length)*Math.PI/180)||1;
 const X=P.map(q=>[q[0]*k,q[1]]);
 /* a freehand cut that comes back round to where it started is a loop: what is inside it is one part, the rest another */
 if(X.length>=4){let len=0;for(let i=1;i<X.length;i++)len+=Math.hypot(X[i][0]-X[i-1][0],X[i][1]-X[i-1][1]);const gap=Math.hypot(X[0][0]-X[X.length-1][0],X[0][1]-X[X.length-1][1]);if(gap<len*.18)return{k,X,loop:true}}const ext=(a,b)=>{const dx=a[0]-b[0],dy=a[1]-b[1],L=Math.hypot(dx,dy)||1;return[a[0]+dx/L*90,a[1]+dy/L*90]};
 X.unshift(ext(X[0],X[1]));X.push(ext(X[X.length-1],X[X.length-2]));return{k,X}}
function cutSide(C,lo,la){const x=lo*C.k,y=la,X=C.X;if(C.loop){let c=false;for(let i=0,j=X.length-1;i<X.length;j=i++){const a=X[i],b=X[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}let bd=1e18,bs=0;for(let i=0;i<X.length-1;i++){const a=X[i],b=X[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1e-12;let t=((x-a[0])*dx+(y-a[1])*dy)/L;t=t<0?0:t>1?1:t;
  const ex=a[0]+t*dx-x,ey=a[1]+t*dy-y,d=ex*ex+ey*ey;if(d<bd-1e-12){bd=d;bs=dx*(y-a[1])-dy*(x-a[0])}else if(Math.abs(d-bd)<=1e-12&&t>0&&t<1){bs=dx*(y-a[1])-dy*(x-a[0])}}return bs>0}
function countRings(rings,cuts,mm){const m=mm||mask(rings);if(!m||!POP)return null;cuts=cuts||[];const CP=cuts.map(cutPrep).filter(Boolean);const CI=countryGrid();let tot=0,cx=0,cy=0;const parts={},cty={};const KEY=CP.length?new Array(m.w*m.h):null,PA=CP.length?new Float64Array(m.w*m.h):null,PV=CP.length?new Float64Array(m.w*m.h):null,PX=CP.length?new Float64Array(m.w*m.h):null,PY=CP.length?new Float64Array(m.w*m.h):null;
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.at(i,j))continue;const gi=(m.r0+j)*W+(m.c0+i),v=POP[gi];const lo=(m.c0+i+.5)*STEP-180,la=90-(m.r0+j+.5)*STEP;
  /* every cell of the shape gets its side of each cut (empty desert too), so the pieces join up across it */
  if(KEY){let k="";for(const C of CP)k+=cutSide(C,lo,la)?"1":"0";KEY[j*m.w+i]=k;PA[j*m.w+i]=Math.cos(la*Math.PI/180)}
  if(!v)continue;tot+=v;cx+=lo*v;cy+=la*v;
  const ci=CI.length>1?CI[gi]:0;cty[ci]=(cty[ci]||0)+v;if(PV){const q=j*m.w+i;PV[q]=v;PX[q]=lo;PY[q]=la}
  }
 /* the pieces: cells on the same side of every cut AND joined to each other. A curvy cut that crosses the shape more than
    once (or bends back) leaves two separate pieces on the same side: those count as separate parts. Islands of the
    shape on the same side stay one part (they were never joined to begin with). */
 if(CP.length){const N=m.w*m.h,base=new Int32Array(N).fill(-1),comp=new Int32Array(N).fill(-1),st=[];
  const fill=(lab,ok,id,i0)=>{st.length=0;st.push(i0);lab[i0]=id;while(st.length){const q=st.pop(),x=q%m.w,y=(q-x)/m.w;
   for(const n of [x>0?q-1:-1,x<m.w-1?q+1:-1,y>0?q-m.w:-1,y<m.h-1?q+m.w:-1])if(n>=0&&lab[n]<0&&ok(q,n)){lab[n]=id;st.push(n)}}};
  const inM=q=>m.at(q%m.w,(q-q%m.w)/m.w);let nb=0,nc=0;const size=[],cBase=[],cKey=[];
  for(let q=0;q<N;q++)if(base[q]<0&&inM(q))fill(base,(a,n)=>inM(n),nb++,q);
  for(let q=0;q<N;q++)if(comp[q]<0&&KEY[q]!=null){const id=nc++;fill(comp,(a,n)=>KEY[n]===KEY[q],id,q);cBase[id]=base[q];cKey[id]=KEY[q];size[id]=0}
  for(let q=0;q<N;q++)if(comp[q]>=0)size[comp[q]]++;
  /* within each island, the pieces with the same side-pattern, biggest first, numbered 0,1,2…; slivers along a cut join piece 0 */
  const ord={},grp={};for(let id=0;id<nc;id++){const g=cBase[id]+"|"+cKey[id];(grp[g]=grp[g]||[]).push(id)}
  const bSize={};for(let id=0;id<nc;id++)bSize[cBase[id]]=(bSize[cBase[id]]||0)+size[id];
  /* (a piece smaller than 1.5% of its island is a sliver left by a ragged coast along the cut: it joins piece 0) */
  for(const g in grp){grp[g].sort((a,b)=>size[b]-size[a]);let n=0;grp[g].forEach(id=>{ord[id]=size[id]<Math.max(6,bSize[cBase[id]]*.015)?0:n++})}
  let aT=0;for(let q=0;q<N;q++){const id=comp[q];if(id<0)continue;aT+=PA[q];const k=cKey[id]+"#"+ord[id],P=parts[k]||(parts[k]={v:0,x:0,y:0,a:0});P.a=(P.a||0)+PA[q];if(!PV[q])continue;P.v+=PV[q];P.x+=PX[q]*PV[q];P.y+=PY[q]*PV[q]}
  for(const k in parts)parts[k].af=aT?parts[k].a/aT:0;
  /* where each part's label goes: the cell of the part farthest from its edges (a chamfer distance over the grid), so the
     label sits well inside its own part and not on the cut or in the neighbouring part */
  const PI=new Int32Array(N).fill(-1),pk=Object.keys(parts);const kix={};pk.forEach((k,i)=>kix[k]=i);for(let q=0;q<N;q++){const id=comp[q];if(id>=0)PI[q]=kix[cKey[id]+"#"+ord[id]]}
  const D=new Float32Array(N),BIG=1e9;for(let q=0;q<N;q++)D[q]=PI[q]<0?0:BIG;const w=m.w,h=m.h;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=y*w+x;if(!D[q])continue;let d=D[q];const t=PI[q];
   const c=(n,c2)=>{const v=(n>=0&&PI[n]===t?D[n]:0)+c2;if(v<d)d=v};c(x>0?q-1:-1,1);c(y>0?q-w:-1,1);c(x>0&&y>0?q-w-1:-1,1.41);c(x<w-1&&y>0?q-w+1:-1,1.41);if(x===0||y===0||x===w-1||y===h-1)d=Math.min(d,1);D[q]=d}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const q=y*w+x;if(!D[q])continue;let d=D[q];const t=PI[q];
   const c=(n,c2)=>{const v=(n>=0&&PI[n]===t?D[n]:0)+c2;if(v<d)d=v};c(x<w-1?q+1:-1,1);c(y<h-1?q+w:-1,1);c(x<w-1&&y<h-1?q+w+1:-1,1.41);c(x>0&&y<h-1?q+w-1:-1,1.41);D[q]=d}
  const best=pk.map(()=>[-1,-1]);for(let q=0;q<N;q++){const i=PI[q];if(i<0)continue;if(D[q]>best[i][0])best[i]=[D[q],q]}
  pk.forEach((k,i)=>{const q=best[i][1];if(q>=0){const x=q%w,y=(q-x)/w;parts[k].lc=[(m.c0+x+.5)*STEP-180,90-(m.r0+y+.5)*STEP]}})}
 return{tot,c:tot?[cx/tot,cy/tot]:null,m,parts:Object.keys(parts).map(k=>({v:parts[k].v,af:parts[k].af||0,c:[parts[k].x/parts[k].v,parts[k].y/parts[k].v],lc:parts[k].lc})).filter(p=>p.v>0).sort((a,b)=>b.v-a.v),
  countries:Object.keys(cty).filter(k=>+k>0).map(k=>({c:CODES[+k],v:cty[k]})).filter(o=>o.c).sort((a,b)=>b.v-a.v)}}
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+" billion":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" million":n>=1e3?Math.round(n/1e3).toLocaleString()+" thousand":Math.round(n).toLocaleString();
const fmtS=n=>n>=1e9?(n/1e9).toFixed(1)+" bn":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" m":n>=1e3?Math.round(n/1e3)+"k":Math.round(n)+"";
const cname=c=>{try{return(COUNTRY_BY_CODE[c]||{}).n||c.toUpperCase()}catch(e){return c}};
function likeCountry(n){try{let best=null,bd=1e9;for(const c in COUNTRY_POPULATION){const p=COUNTRY_POPULATION[c];if(!p)continue;const d=Math.abs(Math.log(p/n));if(d<bd){bd=d;best=c}}return best&&bd<.35?best:null}catch(e){return null}}
let CITYLL=null;function cities(){if(CITYLL)return CITYLL;CITYLL=[];try{const PJ=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);(typeof ALLMAPS_CITIES!=="undefined"?ALLMAPS_CITIES:[]).forEach(r=>{const ll=PJ.invert([r[3],r[4]]);if(ll&&isFinite(ll[0]))CITYLL.push({n:String(r[0]).replace(/\s+/g," "),t:r[1],cap:r[2]===1,ll})});CITYLL.sort((a,b)=>a.t-b.t||b.cap-a.cap)}catch(e){}return CITYLL}
function citiesIn(m,max){const out=[];if(!m)return out;for(const c of cities()){const i=Math.floor((c.ll[0]+180)/STEP)-m.c0,j=Math.floor((90-c.ll[1])/STEP)-m.r0;if(i>=0&&j>=0&&i<m.w&&j<m.h&&m.at(i,j)){out.push(c);if(out.length>=max)break}}return out}

/* ---------- the shapes: the Geometry set's closed shapes ---------- */
const sig=s=>s.p.length+"|"+s.p[0]+"|"+s.p[s.p.length>>1];
/* a country keeps all its parts (islands too) until it is moved or reshaped; then it is the outline it was given */
const ringsOf=s=>{const t=T();if((s.cc||s.mg)&&s.rings&&s._ccSig===sig(s))return s.rings;try{return[t.fillRing(s)]}catch(e){return[s.p]}};
function shapes(){const t=T();if(!t)return[];return t.K().ink.map((s,i)=>({s,i})).filter(o=>{try{return t.closedOf(o.s)}catch(e){return false}})}
/* a merged shape is counted as the union of its members (an overlap once, never as a hole) */
function memberRings(s){const R=ringsOf(s);if(!s.mg||!s.rm||s.rm.length!==R.length)return[R];const G=[];R.forEach((r,i)=>{(G[s.rm[i]]||(G[s.rm[i]]=[])).push(r)});return G.filter(Boolean)}
function res(s){if(!POP)return null;const k=sig(s)+"|"+JSON.stringify(s.cuts||[])+"|"+((s.cc||s.mg)&&s._ccSig===sig(s)?"c":"");if(s._ppK===k&&s._ppR)return s._ppR;const mg=s.mg&&s._ccSig===sig(s),mm=mg?comboMask(memberRings(s),"union"):null;const r=mg?(mm&&countRings(null,s.cuts,mm)):countRings(ringsOf(s),s.cuts);if(r&&mm)r.km=maskKm2(mm);s._ppK=k;s._ppR=r;return r}
const nameOf=(s,i)=>s.nm||(s.g&&s.g.m==="compass"?"Circle":s.g&&s.g.m==="rect"?"Box":s.g&&s.g.m==="oval"?"Oval":"Shape")+(s.nm?"":" "+(i+1));
const kmOf=s=>{if(s.mg){const r=res(s);if(r&&r.km)return r.km}try{const o=T().ringOf(s.p);return o?o.A*T().KM*T().KM:0}catch(e){return 0}};

/* ---------- combined shapes: several shapes taken together (union) or only where they all overlap (intersection) ---------- */
const GROUPS=[];let selG=-1;
const alive=g=>{const ink=T().K().ink;g.members=g.members.filter(s=>ink.includes(s));return g.members.length>=2};
function gres(g){if(!POP||!alive(g))return null;const k=g.op+"|"+g.members.map(sig).join(";");if(g._k===k&&g._r)return g._r;const m=comboMask(g.members.map(ringsOf),g.op);const r=m?countRings(null,[],m):null;if(r)r.km=maskKm2(m);g._k=k;g._r=r;return r}
function combine(op){const t=T(),L=t.selList().map(i=>t.K().ink[i]).filter(s=>s&&t.closedOf(s));if(L.length<2)return;
 const nm=L.map((s,j)=>s.nm||nameOf(s,t.K().ink.indexOf(s))).slice(0,4).join(op==="inter"?" ∩ ":" + ")+(L.length>4?" + "+(L.length-4)+" more":"");
 /* together: one real shape made of them all, inner borders gone; it can be cut, halved and counted like any other */
 if(op==="union"){t.hist();const R=[],rm=[];L.forEach((s,j)=>ringsOf(s).forEach(r=>{if(r&&r.length>2){R.push(r.map(q=>[+(+q[0]).toFixed(3),+(+q[1]).toFixed(3)]));rm.push(j)}}));if(!R.length)return;
  let big=R[0],ba=-1;R.forEach(r=>{let a=0;try{a=d3.geoArea({type:"Polygon",coordinates:[r]});if(a>2*Math.PI)a=4*Math.PI-a}catch(e){}if(a>ba){ba=a;big=r}});
  const p=big.map(q=>q.slice()),ink=t.K().ink;L.forEach(s=>{const i=ink.indexOf(s);if(i>=0)ink.splice(i,1)});
  t.keep({t:"geo",c:L[0].c||t.GEO.col,p,f:1,fo:.14,g:t.polyFrom(p,1),nm,mg:1,lk:1});const o=ink[ink.length-1];if(o){o.rings=R;o.rm=rm;o.mg=1;o._ccSig=sig(o)}
  try{t.geoSelect(ink.length-1)}catch(e){}t.save();selG=-1;after();return}
 GROUPS.push({op,members:L,nm,col:op==="inter"?"#7a3fb0":"#c2491f"});selG=GROUPS.length-1;render()}
/* ---------- making shapes from a country, a place, a growing circle ---------- */
function addCircle(c,km,nm){const t=T();const o={t:"geo",c:t.GEO.col,p:[c.slice(),c.slice()],f:1,fo:.14,g:{m:"compass",A:c.slice(),B:t.dest(c,90,km/t.KM),tru:true},nm};t.rebuild(o);if(!o.p||o.p.length<3)return;t.keep(o);t.geoSelect(t.K().ink.length-1);after()}
function addCountry(code){const t=T();let rings=[];try{projFeatures().filter(f=>f.geometry&&String(f.properties.c).toLowerCase()===code).forEach(f=>{const g=f.geometry,P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];P.forEach(pl=>rings.push(pl[0]))})}catch(e){}
 if(!rings.length)return;let big=rings[0],ba=0;rings.forEach(r=>{let a=0;try{a=d3.geoArea({type:"Polygon",coordinates:[r]});if(a>2*Math.PI)a=4*Math.PI-a}catch(e){}if(a>ba){ba=a;big=r}});
 const p=big.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]);const o={t:"geo",c:t.GEO.col,p,f:1,fo:.14,g:t.polyFrom(p,1),nm:cname(code),cc:code,lk:1};/* a country's outline stays where the country is (the Dragger is the tool for moving countries) */t.keep(o);const s=t.K().ink[t.K().ink.length-1];
 if(s){s.rings=rings;s._ccSig=sig(s)}
 /* in Country mode each new country joins the pick, so several can be combined in one go */
 const prev=pickMode==="country"?t.selList().filter(i=>{const x=t.K().ink[i];return x&&x.cc}):[];t.geoSelect(t.K().ink.length-1);prev.forEach(i=>t.geoSelect(i,true));selG=-1;after()}
function grow(c){if(!POP)return;const target=growT>=1e12?WORLD/2:growT;busy=true;render();
 setTimeout(()=>{let lo=5,hi=19000,best=null;const ring=km=>{const deg=km/R_KM*180/Math.PI;return d3.geoCircle().center(c).radius(Math.min(179,deg)).precision(Math.max(.5,deg/60))().coordinates[0]};
  for(let k=0;k<22;k++){const mid=Math.sqrt(lo*hi),r=countRings([ring(mid)]);if(!r)break;if(r.tot>=target){hi=mid;best=mid}else lo=mid;if(hi/lo<1.01)break}
  busy=false;if(best)addCircle(c,best,(growT>=1e12?"Half of humanity":fmtS(target)+" people")+" in "+Math.round(best).toLocaleString()+" km");else render()},30)}
function around(q,km){q=String(q||"").trim().toLowerCase();if(!q)return false;let ll=null,name=null;const c=cities().find(c=>c.n.toLowerCase()===q)||cities().find(c=>c.n.toLowerCase().startsWith(q));
 if(c){ll=c.ll;name=c.n}else{try{for(const code in COUNTRY_BY_CODE){const C=COUNTRY_BY_CODE[code];if(C&&C.n&&C.n.toLowerCase()===q){const f=projFeatures().find(f=>String(f.properties.c).toLowerCase()===code);if(f){ll=d3.geoCentroid(f);name=C.n}break}}}catch(e){}}
 if(!ll)return false;addCircle(ll,km,"Within "+km.toLocaleString()+" km of "+name);return true}
function half(s){const r=res(s);if(!r||!r.m||!POP)return;const m=r.m,col=new Float64Array(m.w);let tot=0;for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.at(i,j))continue;const v=POP[(m.r0+j)*W+(m.c0+i)];col[i]+=v;tot+=v}
 let acc=0,ci=0;for(;ci<m.w;ci++){acc+=col[ci];if(acc>=tot/2)break}const lo=(m.c0+ci+.5)*STEP-180;let la0=90,la1=-90;ringsOf(s).forEach(R=>R.forEach(q=>{la0=Math.min(la0,q[1]);la1=Math.max(la1,q[1])}));
 T().hist();s.cuts=[[[lo,la1+1],[lo,la0-1]]];T().save();after()}

/* ---------- the People section in the panel ---------- */
let box=null,pickMode=null,growT=1e9,placeQ="",placeKm=200,busy=false,lastSig="";
const COLS=["#1f5fa8","#e07b2e","#2e8b57","#9c3fb5","#c9a227","#d1495b","#3a9aa8","#6d5d4b"];
function pick(m){pickMode=m;const t=T();if(m){try{gfOneTool.claim("people")}catch(e){}if(t&&t.GEO.mode&&t.GEO.mode!=="select"){t.GEO.mode="select";try{t.capture(false)}catch(e){}t.geoPanel();return}}render();syncCursor()}
function syncCursor(){const g=G();if(g){g.host.classList.toggle("gfpp-draw",!!(pickMode&&isOpen()));g.host.classList.toggle("gfpp-cutting",!!(pickMode&&pickMode!=="country"&&isOpen()))}}
function selShape(){const t=T();if(!t)return null;const i=t.GEO.sel,s=t.K().ink[i];return s&&t.closedOf(s)?{s,i}:null}
function detail(o){const s=o.s,r=res(s);if(!r)return'<p class="gfpp-hint">Counting…</p>';const km=kmOf(s),dens=km?r.tot/km:0,share=WORLD?r.tot/WORLD*100:0,like=likeCountry(r.tot);
 let h='<div class="gfpp-area" style="--c:'+esc(s.c)+'"><div class="gfpp-at"><i></i><b contenteditable="true" spellcheck="false" data-nm>'+esc(nameOf(s,o.i))+'</b></div>'+
  '<p class="gfpp-big">'+fmt(r.tot)+' people</p><p class="gfpp-sub">'+(km?Math.round(km).toLocaleString()+' km² · '+(dens>=10?Math.round(dens).toLocaleString():dens.toFixed(1))+' per km² · ':'')+(share>=.01?share.toFixed(share>=1?1:2):"<0.01")+'% of the world'+(share>=.5?' (1 in '+Math.round(100/share)+')':'')+'</p>';
 if(like&&like!==s.cc)h+='<p class="gfpp-like">About as many people as <b>'+esc(cname(like))+'</b></p>';
 if(r.parts&&r.parts.length>1)h+='<div class="gfpp-bar">'+r.parts.map((p,k)=>'<span style="width:'+(p.v/r.tot*100)+'%;background:'+COLS[k%COLS.length]+'">'+(p.v/r.tot>.14?Math.round(p.v/r.tot*100)+'%':'')+'</span>').join("")+'</div><ol class="gfpp-parts">'+r.parts.map((p,k)=>'<li style="--p:'+COLS[k%COLS.length]+'"><i></i>'+fmt(p.v)+' <small>'+(p.v/r.tot*100).toFixed(1)+'% of the people · '+Math.round((p.af||0)*100)+'% of the area</small></li>').join("")+'</ol>';
 /* the lists open in their own window (click to show), so the panel stays short */
 const nC=r.countries.filter(x=>x.v/r.tot>.002).length;
 h+='<div class="gfpp-acts gfpp-open">'+(nC>1||(nC===1&&!s.cc)?'<button type="button" data-m="cty">Countries <small>'+r.countries.length+'</small> ▸</button>':'')+'<button type="button" data-m="city">Cities ▸</button>'+
  '<button type="button" data-a="cut" class="'+(pickMode==="split"?"on":"")+'" title="Draw lines across the shape to cut it into parts">✂️ Cut</button><button type="button" data-a="half" title="Split it in half">½</button>'+((s.cuts||[]).length?'<button type="button" data-a="uncut" title="Clear the cuts">✕ cuts</button>':'')+'</div></div>';return h}
function gdetail(g){const r=gres(g);if(!r)return'<p class="gfpp-hint">Counting…</p>';const dens=r.km?r.tot/r.km:0,share=WORLD?r.tot/WORLD*100:0,like=likeCountry(r.tot);
 let h='<div class="gfpp-area" style="--c:'+g.col+'"><div class="gfpp-at"><i></i><b>'+(g.op==="inter"?"⊗ ":"⊕ ")+esc(g.nm)+'</b><button type="button" data-gdel title="Remove this combination">✕</button></div>'+
  '<p class="gfpp-sub">'+(g.op==="inter"?"Only where all "+g.members.length+" shapes overlap":"All "+g.members.length+" shapes together, overlaps counted once")+'</p>'+
  '<p class="gfpp-big">'+fmt(r.tot)+' people</p><p class="gfpp-sub">'+(r.km?Math.round(r.km).toLocaleString()+' km² · '+(dens>=10?Math.round(dens).toLocaleString():dens.toFixed(1))+' per km² · ':'')+(share>=.01?share.toFixed(share>=1?1:2):"<0.01")+'% of the world'+(share>=.5?' (1 in '+Math.round(100/share)+')':'')+'</p>';
 if(like)h+='<p class="gfpp-like">About as many people as <b>'+esc(cname(like))+'</b></p>';
 h+='<div class="gfpp-acts gfpp-open"><button type="button" data-m="cty">Countries <small>'+r.countries.length+'</small> ▸</button><button type="button" data-m="city">Cities ▸</button></div>';
 return h+'</div>'}
function combineBox(){const t=T(),L=t.selList().map(i=>t.K().ink[i]).filter(s=>s&&t.closedOf(s));if(L.length<2)return"";
 let u="";if(POP){const m=comboMask(L.map(ringsOf),"union"),r=m&&countRings(null,[],m);if(r)u=' · together '+fmtS(r.tot)}
 return'<div class="gfpp-comb"><p class="gfpp-k">'+L.length+' shapes picked'+u+'</p><div class="gfpp-acts"><button type="button" data-c="union" title="One combined shape: every place in any of them, overlaps counted once">⊕ Together (union)</button><button type="button" data-c="inter" title="Only the places inside all of them">⊗ Overlap only (intersection)</button></div></div>'}
function compare(L){const R=rank(L);if(R.length<2)return"";return'<div class="gfpp-acts gfpp-open"><button type="button" data-m="cmp">All your shapes, ranked <small>'+R.length+'</small> ▸</button></div>'}
function rank(L){const R=L.map(o=>({nm:nameOf(o.s,o.i),col:o.s.c,a:'data-i="'+o.i+'"',r:res(o.s)})).concat(GROUPS.map((g,j)=>({nm:(g.op==="inter"?"⊗ ":"⊕ ")+g.nm,col:g.col,a:'data-gi="'+j+'"',r:gres(g)}))).filter(x=>x.r);R.sort((a,b)=>b.r.tot-a.r.tot);return R}
function rankHTML(L){const R=rank(L);if(!R.length)return'<p class="gfpp-hint">No shapes yet.</p>';const mx=R[0].r.tot||1;
 return'<div class="gfpp-cmp">'+R.map(x=>'<button type="button" class="gfpp-cr" '+x.a+'><span>'+esc(x.nm)+'</span><i style="width:'+Math.max(2,x.r.tot/mx*100)+'%;background:'+esc(x.col)+'"></i><b>'+fmtS(x.r.tot)+'</b></button>').join("")+'</div>'}
function render(){if(!box||!box.isConnected||!isOpen()){box=null;return}const t=T(),L=shapes(),S=selShape();
 const tools=[["country","🗺️","Country","Click a country to make it a shape"],["place","📍","Around a place","A circle of a set size round a city or country"],["grow","🎯","Grow","Click a centre: a circle grows until it holds the target"]];
 let h='<p class="gfpp-k">Make a shape from</p><div class="gfpp-tools">'+tools.map(x=>'<button type="button" data-p="'+x[0]+'" class="'+(pickMode===x[0]?"on":"")+'" title="'+esc(x[3])+'"><i>'+x[1]+'</i>'+x[2]+'</button>').join("")+'</div>';
 if(pickMode==="place")h+='<form class="gfpp-place"><input type="search" placeholder="A city or country, e.g. Lagos" value="'+esc(placeQ)+'" list="gfppList"><input type="number" min="5" max="5000" step="5" value="'+placeKm+'" aria-label="Distance in km"> km<button type="submit">Add</button><datalist id="gfppList">'+cities().slice(0,900).map(c=>'<option value="'+esc(c.n)+'">').join("")+'</datalist></form>';
 if(pickMode==="grow")h+='<div class="gfpp-seg">'+[[1e8,"100 million"],[5e8,"500 million"],[1e9,"1 billion"],[1e12,"Half of humanity"]].map(([v,l])=>'<button type="button" data-g="'+v+'" class="'+(growT===v?"on":"")+'">'+l+'</button>').join("")+'</div>';
 const hint=pickMode==="country"?"Click a country on the map. Esc stops.":pickMode==="grow"?(busy?"Growing the circle…":"Click a centre on the map. Esc stops."):pickMode==="split"?(cutMode==="free"?"Draw any line across the picked shape, curving round what you like, or a loop round an area (the Blue Banana, say) to count what is inside it. Each line cuts it again. Esc stops.":"Drag a straight line across the picked shape. Each line cuts it again. Esc stops."):"";
 if(pickMode==="split")h+='<div class="gfpp-seg"><button type="button" data-cm="line" class="'+(cutMode==="line"?"on":"")+'">╱ Straight line</button><button type="button" data-cm="free" class="'+(cutMode==="free"?"on":"")+'">〰 Freehand</button></div>';
 if(hint)h+='<p class="gfpp-hint act">'+hint+(pickMode==="split"?' Or press the button again to stop.':'')+'</p>';if(cutNote&&pickMode==="split")h+='<p class="gfpp-hint">'+cutNote+'</p>';
 if(!POP)h+='<p class="gfpp-hint">Loading the people grid…</p>';
 else if(selG>=0&&GROUPS[selG]&&alive(GROUPS[selG]))h+=gdetail(GROUPS[selG]);
 else if(S)h+=detail(S);else if(L.length)h+='<p class="gfpp-hint">Pick a shape (Select) to see who lives there.</p>';else h+='<p class="gfpp-hint">Draw a shape with the tools above, or make one from a country or a place.</p>';
 if(POP)h+=combineBox()+compare(L);
 box.innerHTML=h;
 box.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>openWin(b.dataset.m));
 if(win)fillWin();
 box.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>pick(pickMode===b.dataset.p?null:b.dataset.p));
 box.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{growT=+b.dataset.g;render()});
 box.querySelectorAll("[data-cm]").forEach(b=>b.onclick=()=>{if(pickMode==="split"&&cutMode===b.dataset.cm){pick(null);return}cutMode=b.dataset.cm;cutNote="";render()});
 box.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{selG=-1;t.geoSelect(+b.dataset.i);after()});
 box.querySelectorAll("[data-gi]").forEach(b=>b.onclick=()=>{selG=+b.dataset.gi;render()});
 box.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>combine(b.dataset.c));
 const gd=box.querySelector("[data-gdel]");if(gd)gd.onclick=()=>{GROUPS.splice(selG,1);selG=-1;render()};
 const nm=box.querySelector("[data-nm]");if(nm&&S){nm.onkeydown=e=>{e.stopPropagation();if(e.key==="Enter"){e.preventDefault();nm.blur()}};nm.onblur=()=>{const v=nm.textContent.trim();if(v&&v!==nameOf(S.s,S.i)){S.s.nm=v;t.save();render()}}}
 box.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(!S)return;if(a==="cut")pick(pickMode==="split"?null:"split");else if(a==="half")half(S.s);else if(a==="uncut"){t.hist();S.s.cuts=[];t.save();after()}});
 const f=box.querySelector(".gfpp-place");if(f){const [q,k]=f.querySelectorAll("input");f.addEventListener("keydown",e=>e.stopPropagation());f.onsubmit=e=>{e.preventDefault();placeQ=q.value;placeKm=Math.max(5,Math.min(5000,+k.value||200));if(!around(placeQ,placeKm)){const p=box.querySelector(".gfpp-hint");if(p)p.textContent="Couldn’t find “"+placeQ+"”. Try a city name from the list."}};setTimeout(()=>q.focus(),0)}
 syncCursor()}
/* ---------- the details window: countries, cities, every shape ranked (opened from the panel's buttons) ---------- */
let win=null,winTab="cty";
function cur(){const S=selShape();if(selG>=0&&GROUPS[selG]&&alive(GROUPS[selG])){const g=GROUPS[selG];return{nm:(g.op==="inter"?"⊗ ":"⊕ ")+g.nm,col:g.col,r:gres(g),cc:null}}if(S)return{nm:nameOf(S.s,S.i),col:S.s.c,r:res(S.s),cc:S.s.cc};return null}
function openWin(tab){winTab=tab;if(!win){win=document.createElement("div");win.className="gfpp-win";win.setAttribute("role","dialog");win.setAttribute("aria-label","People details");document.body.appendChild(win);
  const pr=(box&&box.closest(".gfk-panel")||box).getBoundingClientRect();win.style.left=Math.min(innerWidth-330,pr.right+10)+"px";win.style.top=Math.max(70,pr.top)+"px"}
 fillWin()}
function closeWin(){if(win){win.remove();win=null}}
function fillWin(){if(!win)return;if(!isOpen()){closeWin();return}const o=cur(),L=shapes();
 const tabs=[["cty","Countries"],["city","Cities"],["cmp","All shapes"]];
 let h='<div class="gfpp-wh"><b>'+(o?'<i style="background:'+esc(o.col)+'"></i>'+esc(o.nm):"People")+'</b><button type="button" class="gfpp-wx" aria-label="Close">×</button></div>'+
  '<div class="gfpp-wt">'+tabs.map(([k,l])=>'<button type="button" data-t="'+k+'" class="'+(winTab===k?"on":"")+'">'+l+'</button>').join("")+'</div><div class="gfpp-wb">';
 if(winTab==="cmp")h+=rankHTML(L);
 else if(!o||!o.r)h+='<p class="gfpp-hint">Pick a shape to see who lives there.</p>';
 else if(winTab==="cty"){const r=o.r,C=r.countries.filter(x=>x.v/r.tot>.0005).slice(0,40);h+='<ul class="gfpp-cty">'+C.map(x=>'<li><span>'+esc(cname(x.c))+'</span><b>'+fmtS(x.v)+'</b> <small>'+(x.v/r.tot*100).toFixed(x.v/r.tot>=.1?0:1)+'%</small></li>').join("")+(r.countries.length>C.length?'<li class="more">+ '+(r.countries.length-C.length)+' more, each a tiny share</li>':'')+'</ul>'}
 else{const ci=citiesIn(o.r.m,24);h+=ci.length?'<ul class="gfpp-cty">'+ci.map(c=>'<li><span>'+(c.cap?'★ ':'')+esc(c.n)+'</span>'+(c.cap?'<small>capital</small>':'')+'</li>').join("")+'</ul>':'<p class="gfpp-hint">No big cities inside.</p>'}
 h+='</div><p class="gfpp-src">People: GHS-POP 2025 (European Commission JRC, CC BY 4.0), counted in cells about 11 km across, so small shapes and coasts are approximate.</p>';
 const st=win.querySelector(".gfpp-wb");const sc=st?st.scrollTop:0;win.innerHTML=h;const nb=win.querySelector(".gfpp-wb");if(nb)nb.scrollTop=sc;
 win.querySelector(".gfpp-wx").onclick=closeWin;win.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{winTab=b.dataset.t;fillWin()});
 win.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{selG=-1;T().geoSelect(+b.dataset.i);after()});win.querySelectorAll("[data-gi]").forEach(b=>b.onclick=()=>{selG=+b.dataset.gi;render()});
 /* dragged by its title bar */
 const hd=win.querySelector(".gfpp-wh");hd.onpointerdown=e=>{if(e.target.closest("button"))return;e.preventDefault();const r=win.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;
  const mv=ev=>{win.style.left=Math.max(-r.width+80,Math.min(innerWidth-80,ev.clientX-dx))+"px";win.style.top=Math.max(0,Math.min(innerHeight-40,ev.clientY-dy))+"px"};const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up)};addEventListener("pointermove",mv);addEventListener("pointerup",up)}}
setInterval(()=>{if(win&&!isOpen())closeWin()},700);
function after(){try{T().render();T().geoList()}catch(e){}render()}
/* the Geometry set calls this to fill its People section */
window.gfPeopleExt=function(el){box=el;load().then(render).catch(()=>{});render();loop()};
window.gfPeopleExt.pick=m=>{if(pickMode!==m){pickMode=m;syncCursor();render()}};
try{gfOneTool.on("people",()=>{if(pickMode){pickMode=null;syncCursor();render()}})}catch(e){}
/* keep the section in step with the picked shape and its edits */
setInterval(()=>{if(!isOpen()){if(pickMode){pickMode=null;syncCursor()}return}const t=T(),S=selShape();const k=(S?S.i+"|"+sig(S.s)+"|"+(S.s.cuts||[]).length:"-")+"|"+t.selList().join(",")+"|"+shapes().length+"|"+(POP?1:0);if(k!==lastSig){if(lastSig&&S&&lastSig.split("|")[0]!==k.split("|")[0])selG=-1;lastSig=k;const a=document.activeElement;if(!(a&&box&&box.contains(a)&&(a.tagName==="INPUT"||a.isContentEditable)))render()}},400);

/* ---------- the map: Country and Grow clicks, and cutting lines ---------- */
const inUI=e=>e.target.closest&&e.target.closest(".gfk-panel,.globe-btns,.gfk-tray,.gf-xs,.gfth,.ps-card,button,a,input,select,textarea");
function local(e){const g=G(),r=g.canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
function inv(q){const g=G();if(!g)return null;try{const ll=g.projection().invert(q);if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return null;if(!g._flat){const ro=g.projection().rotate();if(d3.geoDistance(ll,[-ro[0],-ro[1]])>Math.PI/2)return null}return ll}catch(e){return null}}
let press=null,cut=null,eatUntil=0,cutMode="line",cutNote="";
/* is a [lon,lat] point inside a ring of [lon,lat] points (plain even-odd test) */
function pip(q,R){let inside=false;for(let i=0,j=R.length-1;i<R.length;j=i++){const a=R[i],b=R[j];if(((a[1]>q[1])!==(b[1]>q[1]))&&q[0]<(b[0]-a[0])*(q[1]-a[1])/((b[1]-a[1])||1e-12)+a[0])inside=!inside}return inside}
function down(e){if(!isOpen()||!pickMode||inUI(e)||e.button)return;const g=G();if(!g)return;/* anywhere over the map (place names float above it) */const cr=g.canvas.getBoundingClientRect();if(!g.host.contains(e.target)&&!(e.clientX>=cr.left&&e.clientX<=cr.right&&e.clientY>=cr.top&&e.clientY<=cr.bottom&&!(e.target.closest&&e.target.closest(".gfk-panel,.gfpp-win,.ps-card,.gftq,[role=dialog]"))))return;
 if(pickMode==="split"){if(!selShape()&&!shapes().length)return;e.stopImmediatePropagation();e.preventDefault();const q=local(e);cut={a:q,b:q,pts:[q],id:e.pointerId};return}
 /* Country and Grow: the map keeps the press (it may be a drag); a click without moving is ours */
 press={x:e.clientX,y:e.clientY,t:performance.now()}}
function move(e){if(cut&&e.pointerId===cut.id){e.stopImmediatePropagation();e.preventDefault();const q=local(e);cut.b=q;const l=cut.pts[cut.pts.length-1];if(Math.hypot(q[0]-l[0],q[1]-l[1])>5)cut.pts.push(q)}}
/* the cut as drawn on the screen, as points on the map: a straight one sampled along its length (so it follows what was drawn
   on the globe too), a freehand one point by point */
function cutLL(C){let Q=cutMode==="free"?C.pts.concat([C.b]):Array.from({length:25},(_,i)=>[C.a[0]+(C.b[0]-C.a[0])*i/24,C.a[1]+(C.b[1]-C.a[1])*i/24]);
 const L=Q.map(inv).filter(Boolean).map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]);return L.length>=2?L:null}
function up(e){if(cut&&e.pointerId===cut.id){e.stopImmediatePropagation();e.preventDefault();const C=cut;cut=null;eatUntil=Date.now()+400;
  if(Math.hypot(C.b[0]-C.a[0],C.b[1]-C.a[1])<10&&C.pts.length<4)return;const L=cutLL(C);if(!L)return;
  /* the shape it cuts: the picked one if the line crosses it, else whichever shape the line crosses */
  const crosses=o=>{try{return ringsOf(o.s).length&&L.some(q=>ringsOf(o.s).some(R=>pip(q,R)))}catch(e){return false}};
  let S=selShape();if(!S||!crosses(S))S=shapes().find(crosses)||null;
  if(!S){cutNote="That line doesn’t cross a shape. Draw it across the shape you want to split.";render();return}
  cutNote="";T().hist();S.s.cuts=(S.s.cuts||[]).concat([L]);try{T().geoSelect(S.i)}catch(e){}T().save();
  /* one line per press of Cut: drawing stops here (press Straight line or Freehand again to cut once more) */
  pick(null);after();return}
 if(!press)return;const P=press;press=null;if(Math.hypot(e.clientX-P.x,e.clientY-P.y)>5||performance.now()-P.t>600)return;
 const g=G();if(!g)return;eatUntil=Date.now()+500;
 if(pickMode==="grow"){const ll=inv(local(e));if(ll)grow(ll);return}
 if(pickMode==="country"){if(window.gfClickGuard&&!gfClickGuard.ok(e))return;const h=g.hit&&g.hit(e.clientX,e.clientY),code=h&&h.code;if(code)addCountry(code)}}
if(!window._gfPpL2){window._gfPpL2=1;addEventListener("pointerdown",down,true);addEventListener("pointermove",move,true);addEventListener("pointerup",up,true);
 addEventListener("click",e=>{if(isOpen()&&Date.now()<eatUntil){e.stopImmediatePropagation();e.preventDefault()}},true);
 addEventListener("contextmenu",e=>{if(cut){e.preventDefault();cut=null}},true);
 addEventListener("keydown",e=>{if(!isOpen()||e.key!=="Escape")return;if(e.target.closest&&e.target.closest("input,textarea,[contenteditable]"))return;if(cut){cut=null;e.stopImmediatePropagation();return}if(pickMode){pick(null);e.stopImmediatePropagation()}},true)}
/* a country can't be clicked on while the map takes it as a country card */
(function hook(){if(typeof openFlagZoom!=="function"){setTimeout(hook,900);return}if(openFlagZoom._pp)return;const _f=openFlagZoom;openFlagZoom=function(){if(Date.now()<eatUntil)return;return _f.apply(this,arguments)};openFlagZoom._pp=1})();

/* ---------- cut lines and the parts' counts over the map ---------- */
let ov=null,raf=0;
function loop(){cancelAnimationFrame(raf);if(!isOpen()){if(ov){ov.remove();ov=null}return}raf=requestAnimationFrame(loop);const g=G();if(!g)return;
 if(!ov||ov.parentNode!==g.host){if(ov)ov.remove();ov=document.createElement("canvas");ov.className="gfpp-ov";g.host.appendChild(ov)}
 const c=g.canvas,r=c.getBoundingClientRect(),hr=g.host.getBoundingClientRect(),dpr=(window.gfDpr?gfDpr():Math.min(2,devicePixelRatio||1));
 if(ov.width!==Math.round(r.width*dpr)||ov.height!==Math.round(r.height*dpr)){ov.width=Math.round(r.width*dpr);ov.height=Math.round(r.height*dpr);ov.style.width=r.width+"px";ov.style.height=r.height+"px"}
 ov.style.left=(r.left-hr.left)+"px";ov.style.top=(r.top-hr.top)+"px";const x=ov.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);const pr=g.projection();
 const vis=ll=>{if(g._flat)return true;const ro=pr.rotate();return d3.geoDistance(ll,[-ro[0],-ro[1]])<Math.PI/2};
 const seg=(q1,q2)=>{x.setLineDash([8,6]);x.strokeStyle="#fff";x.lineWidth=5;x.beginPath();x.moveTo(q1[0],q1[1]);x.lineTo(q2[0],q2[1]);x.stroke();x.strokeStyle="#1d2433";x.lineWidth=2.3;x.stroke();x.setLineDash([])};
 const placed=[];const lab=(ll,t,col)=>{if(!ll||!vis(ll))return;const q0=pr(ll);if(!q0)return;x.font="800 12.5px system-ui,sans-serif";const w=x.measureText(t).width+14;
 /* labels never sit on each other: one that would is moved down (or up) until it is clear */
 const q=[q0[0],q0[1]];const hit=()=>placed.some(b=>Math.abs(b[0]-q[0])<(b[2]+w)/2+4&&Math.abs(b[1]-q[1])<26);for(let k=1;k<12&&hit();k++)q[1]=q0[1]+(k%2?1:-1)*Math.ceil(k/2)*26;placed.push([q[0],q[1],w]);x.fillStyle=col;x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(q[0]-w/2,q[1]-11,w,22,11):x.rect(q[0]-w/2,q[1]-11,w,22);x.fill();x.stroke();x.fillStyle="#fff";x.textAlign="center";x.textBaseline="middle";x.fillText(t,q[0],q[1]+.5)};
 shapes().forEach(o=>{const cuts=o.s.cuts||[];if(!cuts.length){if(o.s.mg){const R=res(o.s);if(R&&R.c)lab(R.c,(R.km?Math.round(R.km).toLocaleString()+" km² · ":"")+fmtS(R.tot)+" people",o.s.c||"#c2491f")}return}cuts.forEach(c0=>{const cp=cutPrep(c0),c=cp&&cp.loop?c0.concat([c0[0]]):c0;for(let i=0;i<c.length-1;i++){if(!vis(c[i])||!vis(c[i+1]))continue;const a=pr(c[i]),b=pr(c[i+1]);if(a&&b)seg(a,b)}});const R=res(o.s);if(R&&R.parts.length>1)R.parts.forEach((p,k)=>lab(p.lc||p.c,fmtS(p.v)+" · "+Math.round(p.v/R.tot*100)+"% · "+Math.round((p.af||0)*100)+"% of area",COLS[k%COLS.length]))});
 /* combinations: a union is outlined round every member; an overlap is shaded where all of them meet */
 GROUPS.forEach((g,j)=>{if(!alive(g))return;const path=s=>{x.beginPath();ringsOf(s).forEach(R=>{let pen=false,last=null;R.forEach(ll=>{const q=vis(ll)&&pr(ll);if(!q||!isFinite(q[0])){pen=false;return}if(pen&&last&&Math.abs(q[0]-last[0])>r.width/2)pen=false;pen?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);pen=true;last=q})})};
  x.save();if(g.op==="inter"){g.members.forEach(s=>{path(s);x.clip("evenodd")});x.fillStyle=g.col;x.globalAlpha=j===selG?.42:.28;x.fillRect(0,0,r.width,r.height)}
  else{x.globalAlpha=j===selG?.95:.6;x.setLineDash([6,4]);x.lineWidth=j===selG?3:2;x.strokeStyle=g.col;g.members.forEach(s=>{path(s);x.stroke()})}
  x.restore();const R=gres(g);if(R&&R.c)lab(R.c,(g.op==="inter"?"⊗ ":"⊕ ")+fmtS(R.tot),g.col)});
 if(cut){if(cutMode==="free"){const P=cut.pts.concat([cut.b]);x.setLineDash([8,6]);x.lineJoin=x.lineCap="round";x.beginPath();P.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.strokeStyle="#fff";x.lineWidth=5;x.stroke();x.strokeStyle="#1d2433";x.lineWidth=2.3;x.stroke();x.setLineDash([])}else seg(cut.a,cut.b)}}

/* ---------- ways in: the Toolkit slot, a button on the Population map; the Population map opens it (picking, not drawing) ---------- */
function open(o){const t=T();if(!t||!t.openPeople)return;t.openPeople(o||{mode:"select"})}
function close(){try{const p=document.getElementById("gfkGeo");if(p&&T().GEO.people){const x=p.querySelector(".gfk-px");if(x)x.click();else p.remove()}}catch(e){}}
const ART='<svg viewBox="0 0 100 100" class="gfk-art"><ellipse cx="50" cy="92" rx="36" ry="5" fill="#000" opacity=".18"/><g stroke="#4a2e14" stroke-width="2.2"><circle cx="30" cy="38" r="11" fill="#e8b98a"/><path d="M12 84c0-14 8-26 18-26s18 12 18 26z" fill="#2f6fb0"/><circle cx="70" cy="38" r="11" fill="#c98b5a"/><path d="M52 84c0-14 8-26 18-26s18 12 18 26z" fill="#c2491f"/><circle cx="50" cy="30" r="12.5" fill="#f1cfa5"/><path d="M29 86c0-16 9-30 21-30s21 14 21 30z" fill="#2e8b57"/></g><g font-family="Georgia,serif" font-weight="800" font-size="13" fill="#fff" text-anchor="middle"><text x="50" y="80">123</text></g></svg>';
function addSlot(){const felt=document.querySelector("#gfKit .gfk-felt");if(!felt||felt.querySelector(".gfk-people"))return;
 const b=document.createElement("button");b.type="button";b.className="gfk-slot gfk-people";b.title="People counter: draw a shape and see how many people live in it";b.setAttribute("aria-label","People counter");
 b.innerHTML=ART+"<span>People</span>";b.onclick=e=>{e.stopPropagation();autoOn=false;if(isOpen())close();else open({mode:"select"})};
 const th=felt.querySelector(".gfk-thermo");if(th&&th.nextSibling)felt.insertBefore(b,th.nextSibling);else felt.appendChild(b)}
setInterval(addSlot,700);addSlot();
setInterval(()=>{document.querySelectorAll(".gfk-people,.gfpp-ico").forEach(b=>b.classList.toggle("on",isOpen()))},500);
const ICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/></svg>';
setInterval(()=>{try{const g=G(),btns=g&&g.host.querySelector(".globe-btns");if(!btns)return;let b=btns.querySelector(".gfpp-ico");if(mapMode()!=="population"){if(b)b.remove();return}
 if(!b){b=document.createElement("button");b.type="button";b.className="gfpp-ico";b.title="People counter";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();autoOn=false;isOpen()?close():open({mode:"select"})};btns.appendChild(b)}}catch(e){}},600);
const inTour=()=>{try{if(typeof ps!=="undefined"&&ps){window._gfTourSeen=Date.now();return true}return!!(typeof psSwitching!=="undefined"&&psSwitching)||Date.now()-(window._gfTourSeen||0)<4000}catch(e){return false}};/* a tour (also while it switches maps, when it briefly ends and restarts) */let autoOn=false,lastM=null;setInterval(()=>{try{inTour();const m=mapMode();if(m===lastM)return;const prev=lastM;lastM=m;if(inTour())return;
 if(m==="population"&&!isOpen()&&!document.getElementById("gfkGeo")){setTimeout(()=>{if(mapMode()==="population"&&!document.getElementById("gfkGeo")&&!inTour()){autoOn=true;open({mode:"select"})}},400)}
 else if(prev==="population"&&autoOn&&isOpen()){autoOn=false;close()}}catch(e){}},400);

const css=document.createElement("style");css.textContent=`
.gfpp-ov{ position:absolute; left:0; top:0; pointer-events:none; z-index:30; }
.globe-host.gfpp-draw canvas{ cursor:crosshair !important; }
.gfpp-ico{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; color:#b3401f; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }
.gfpp-ico.on{ background:#c2491f; color:#fff; }
.gfk-pplx{ margin:6px 0 4px; padding-top:6px; border-top:1px solid rgba(0,0,0,.08); font:13px/1.4 system-ui,sans-serif; }
.gfpp-tools{ display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 6px; } .gfpp-tools button{ flex:1 1 auto; flex-direction:row !important; justify-content:center; gap:5px !important; padding:5px 8px !important; }
.gfpp-tools button{ display:flex; flex-direction:column; align-items:center; gap:1px; border:1px solid rgba(194,73,31,.25); background:rgba(194,73,31,.05); border-radius:9px; padding:4px 2px; font:700 10.5px system-ui; color:inherit; cursor:pointer; }
.gfpp-tools button i{ font-style:normal; font-size:15px; line-height:1.1; } .gfpp-tools button.on{ background:#c2491f; color:#fff; border-color:#c2491f; }
.gfpp-hint{ font-size:12.3px; opacity:.85; margin:4px 0; } .gfpp-hint.act{ background:rgba(194,73,31,.1); border-radius:8px; padding:5px 8px; opacity:1; }
.gfpp-place{ display:flex; gap:4px; align-items:center; margin:2px 0 4px; font-size:12px; } .gfpp-place input[type=search]{ flex:1; min-width:0; } .gfpp-place input{ border:1px solid #ccd3dd; border-radius:7px; padding:4px 6px; font:12.5px system-ui; } .gfpp-place input[type=number]{ width:62px; }
.gfpp-place button{ border:0; background:#c2491f; color:#fff; border-radius:7px; padding:5px 9px; font:700 12px system-ui; cursor:pointer; }
.gfpp-seg{ display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 4px; } .gfpp-seg button{ border:1px solid rgba(194,73,31,.3); background:none; color:inherit; border-radius:999px; padding:3px 9px; font:700 11.5px system-ui; cursor:pointer; } .gfpp-seg button.on{ background:#c2491f; color:#fff; }
.gfpp-area{ border-left:4px solid var(--c); background:rgba(0,0,0,.04); border-radius:8px; padding:6px 8px; margin:6px 0; }
body.sky-night .gfpp-area{ background:rgba(255,255,255,.06); }
.gfpp-at{ display:flex; align-items:center; gap:6px; } .gfpp-at i{ width:10px; height:10px; border-radius:50%; background:var(--c); flex:none; } .gfpp-at b{ flex:1; font-size:13px; outline:none; } .gfpp-at b:focus{ text-decoration:underline dotted; }
.gfpp-big{ font-size:20px; font-weight:800; color:var(--c); margin:2px 0 0; } .gfpp-sub{ font-size:11.5px; opacity:.75; margin:0 0 3px; } .gfpp-like{ font-size:12px; margin:2px 0; }
.gfpp-k{ font:800 10.5px system-ui; text-transform:uppercase; letter-spacing:.05em; opacity:.6; margin:7px 0 2px; }
.gfpp-cty{ list-style:none; margin:0; padding:0; font-size:12px; } .gfpp-cty li{ display:flex; justify-content:space-between; gap:8px; padding:1px 0; } .gfpp-cty li.more{ opacity:.6; }
.gfpp-cities{ font-size:12px; margin:0; }
.gfpp-bar{ display:flex; height:20px; border-radius:6px; overflow:hidden; margin:6px 0 3px; font:700 10.5px system-ui; color:#fff; } .gfpp-bar span{ display:flex; align-items:center; justify-content:center; overflow:hidden; white-space:nowrap; }
.gfpp-parts{ margin:0; padding:0 0 0 2px; list-style:none; font-size:12px; } .gfpp-parts li{ display:flex; align-items:center; gap:6px; } .gfpp-parts i{ width:9px; height:9px; border-radius:2px; background:var(--p); } .gfpp-parts small{ opacity:.65; }
.gfpp-acts{ margin-top:6px; display:flex; flex-wrap:wrap; gap:5px; } .gfpp-acts button{ border:1px solid rgba(0,0,0,.15); background:none; color:inherit; border-radius:999px; padding:3px 10px; font:700 11.5px system-ui; cursor:pointer; } .gfpp-acts button.on{ background:#1d2433; color:#fff; }
.gfpp-comb{ margin:6px 0; padding:6px 8px; border-radius:8px; background:rgba(194,73,31,.08); }
.gfpp-at button{ border:0; background:none; cursor:pointer; color:inherit; opacity:.55; } .gfpp-at button:hover{ opacity:1; }
.gfpp-cmp{ margin-top:6px; } .gfpp-cr{ display:grid; grid-template-columns:96px 1fr 46px; align-items:center; gap:6px; font:11.5px system-ui; margin:2px 0; width:100%; border:0; background:none; color:inherit; padding:1px 0; cursor:pointer; text-align:left; } .gfpp-cr span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .gfpp-cr i{ height:10px; border-radius:5px; display:block; } .gfpp-cr b{ text-align:right; }
.gfpp-src{ font-size:10.3px; opacity:.55; margin:6px 0 0; }
.gfpp-open{ display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; } .gfpp-open small{ opacity:.6; font-weight:700; }
.gfpp-win{ position:fixed; z-index:9400; width:300px; max-height:min(70vh,520px); display:flex; flex-direction:column; background:#fffaf2; color:#2b2016; border-radius:14px; box-shadow:0 14px 40px rgba(0,0,0,.28); border:1px solid rgba(194,73,31,.2); font:13px system-ui,sans-serif; overflow:hidden; }
.gfpp-wh{ display:flex; align-items:center; gap:8px; padding:10px 10px 6px 14px; cursor:grab; touch-action:none; } .gfpp-wh b{ flex:1; display:flex; align-items:center; gap:7px; font-size:14px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .gfpp-wh b i{ flex:0 0 auto; width:10px; height:10px; border-radius:50%; }
.gfpp-wx{ border:0; background:rgba(0,0,0,.06); width:26px; height:26px; border-radius:50%; font-size:16px; cursor:pointer; color:inherit; }
.gfpp-wt{ display:flex; gap:4px; padding:0 12px 6px; } .gfpp-wt button{ flex:1; border:1px solid rgba(194,73,31,.25); background:transparent; border-radius:999px; padding:4px 6px; font:600 12px system-ui; cursor:pointer; color:inherit; } .gfpp-wt button.on{ background:#c2491f; color:#fff; border-color:#c2491f; }
.gfpp-wb{ overflow:auto; padding:0 14px 6px; flex:1 1 auto; } .gfpp-win .gfpp-cty li small{ opacity:.55; margin-left:6px; min-width:34px; text-align:right; } .gfpp-win .gfpp-cty li b{ margin-left:auto; }
.gfpp-win .gfpp-src{ padding:4px 14px 10px; margin:0; }
body.dark-theme .gfpp-win{ background:#1f2433; color:#e9edf5; border-color:rgba(255,255,255,.12); }`;document.head.appendChild(css);
/* the old Count people tool's helpers, still used by the toolkit's shape labels */
window.gfPopCount={load,count:rings=>countRings(rings,[])};
window.gfPeople={open,close,shapes,res,addCountry,addCircle,load};
})();
/* ---------- no hover labels while drawing: the country/density tooltip is hidden while a drawing or cutting mode is on ---------- */
(function(){const st=document.createElement("style");st.textContent="html.gf-drawing .map-territory-tooltip,html.gf-drawing .gf-ly-tip,html.gf-drawing .gf-nat-tip,html.gf-drawing .gf-la-tip,html.gf-drawing .gf-eth-tip{display:none!important}";document.head.appendChild(st);
 setInterval(()=>{let on=false;try{const t=window.gfToolkit;on=!!document.querySelector(".gfpp-cutting")||!!(t&&t.GEO&&t.GEO.mode&&t.GEO.mode!=="select"&&document.getElementById("gfkGeo"))}catch(e){}document.documentElement.classList.toggle("gf-drawing",on)},150)})();
