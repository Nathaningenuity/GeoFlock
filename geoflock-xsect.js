/* GeoFlock: Elevation map › Cross-section. Draw a straight or freehand line on the map (or pick a ready-made one) and see the
   land and sea floor along it. River profiles follow each river's own course from source to sea, and "Compare rivers" puts
   several on one chart. Heights: NOAA ETOPO 2022 (public domain), averaged to 0.1° (about 11 km), so the highest summits read
   several hundred metres low. */
(function(){
if(typeof d3==="undefined")return;
const $=id=>document.getElementById(id),esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mode=()=>{try{return appMode==="allmaps"?allMapsColorMode:null}catch(e){return null}};
/* works on the flat map and on the globe */
const G=()=>{try{return amGlobe&&amGlobe.host.isConnected&&(amGlobe._flat||typeof amGlobeOn!=="function"||amGlobeOn())?amGlobe:null}catch(e){return null}};
const R_KM=6371;
/* ---------- the height grid ---------- */
let DEM=null,demP=null;
function loadDEM(){if(demP)return demP;demP=new Promise((ok,no)=>{const im=new Image();im.onload=()=>{try{const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
  const d=x.getImageData(0,0,w,h).data,a=new Int16Array(w*h);for(let i=0,j=0;i<a.length;i++,j+=4)a[i]=((d[j]<<8)|d[j+1])-32768;DEM={w,h,a};ok(DEM)}catch(e){no(e)}};im.onerror=no;im.src="textures/DEM_0p1.png"});return demP}
function elevAt(lon,lat){if(!DEM)return 0;const {w,h,a}=DEM;let x=((lon+180)/360*w-.5),y=(90-lat)/180*h-.5;y=Math.max(0,Math.min(h-1.001,y));const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
 const g=(xx,yy)=>a[yy*w+(((xx%w)+w)%w)];return (g(x0,y0)*(1-fx)+g(x0+1,y0)*fx)*(1-fy)+(g(x0,y0+1)*(1-fx)+g(x0+1,y0+1)*fx)*fy}
/* ---------- ready-made lines ---------- */
const PRESETS=[
 {n:"Andes to the Atlantic",a:[-82,-10],b:[-35,-7.5],t:"From the Pacific, over the Andes, then 3,000 km of Amazon lowland barely above sea level."},
 {n:"Up to the roof of the world",a:[78,22],b:[86,42],t:"The Ganges plain, the Himalaya, then the Tibetan Plateau: a whole region higher than the Alps."},
 {n:"Africa's high plateau",a:[11,-17],b:[40,-19],t:"Southern Africa is a raised table: the land climbs steeply from the coast and stays high inland."},
 {n:"East African Rift",a:[26,-1],b:[44,-1],t:"The Rift Valley's twin walls, with lakes and volcanoes in between."},
 {n:"Across the Atlantic",a:[-76,36],b:[-9,39],t:"The ocean floor rises to the Mid-Atlantic Ridge, where new sea floor is made."},
 {n:"Into the Mariana Trench",a:[135,11.4],b:[152,11.4],t:"The deepest place on Earth, where one plate dives under another."},
 {n:"Rockies to the Appalachians",a:[-124.5,39.5],b:[-74,39.5],t:"The young, high west of North America and the old, worn-down east."},
 {n:"Over the Alps",a:[7,43.6],b:[12,48.5],t:"From the Mediterranean over the Alps to the Danube."},
 {n:"The Dead Sea rift",a:[33.6,31.5],b:[37.5,31.5],t:"Down to the lowest land on Earth, about 430 m below sea level."},
 {n:"Iceland on the ridge",a:[-32,64.5],b:[-4,64.5],t:"Iceland is a piece of the Mid-Atlantic Ridge that rises above the sea."}];
const RIVERS={Amazon:{p:["Amazonas","Ucayali"],src:[-71.8,-15.5],sea:[-50,-0.2],c:"#2e9d5b"},Mississippi:{p:["Mississippi"],src:[-95.2,47.24],sea:[-89.25,29.15],c:"#3b6fd8"},
 Nile:{p:["Nile","White Nile"],src:[33.2,0.45],sea:[31.2,31.5],c:"#d98a1b"},Congo:{p:["Congo"],src:[26,-11],sea:[12.3,-6],c:"#9c3fb8"},Zambezi:{p:["Zambezi"],src:[24.3,-11.4],sea:[36.3,-18.8],c:"#d6453d"},
 Niger:{p:["Niger"],src:[-10.7,9.1],sea:[6.1,4.3],c:"#b07a2a"},Yangtze:{p:["Yangtze"],src:[90.9,33.4],sea:[121.8,31.4],c:"#1b9aa8"},Danube:{p:["Danube"],src:[8.2,48],sea:[29.7,45.2],c:"#6a5acd"},
 Ganges:{p:["Ganges"],src:[79,30.9],sea:[88.1,21.7],c:"#e0559c"},Orange:{p:["Orange"],src:[28.9,-29.2],sea:[16.5,-28.6],c:"#e07b2e"}};
const REAL_KM={Amazon:6400,Mississippi:3730,Nile:6650,Congo:4700,Zambezi:2574,Niger:4180,Yangtze:6300,Danube:2850,Ganges:2525,Orange:2200};/* published lengths; the drawn course is simplified, so distances along it are stretched to these */
const COMPARE=["Amazon","Mississippi","Congo","Nile","Zambezi","Orange"];
/* a river's main stem, source to sea, from its drawn course: join the pieces into a network and take the path from the mouth to the source */
const PJ=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
const STEM={};
function stem(name){if(STEM[name])return STEM[name];const R=RIVERS[name];if(!R||typeof ALLMAPS_RIVERS==="undefined")return null;
 const polys=[];ALLMAPS_RIVERS.filter(r=>R.p.includes(r[0])).forEach(r=>{let cur=null,x=0,y=0;const tk=r[1].match(/[MmLl]|-?[\d.]+(?:e-?\d+)?/g)||[];let cmd="M";
  for(let i=0;i<tk.length;){if(/[MmLl]/.test(tk[i])){cmd=tk[i++];continue}const a=+tk[i++],b=+tk[i++];if(cmd==="M"){x=a;y=b;cur=[[x,y]];polys.push(cur);cmd="L"}else if(cmd==="m"){x+=a;y+=b;cur=[[x,y]];polys.push(cur);cmd="l"}else if(cmd==="L"){x=a;y=b;cur&&cur.push([x,y])}else{x+=a;y+=b;cur&&cur.push([x,y])}}});
 if(!polys.length)return null;const pts=[],adj=[],key=new Map();const id=p=>{const k=p[0].toFixed(2)+","+p[1].toFixed(2);let i=key.get(k);if(i==null){i=pts.length;key.set(k,i);pts.push(p);adj.push([])}return i};
 const link=(i,j)=>{const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);adj[i].push([j,d]);adj[j].push([i,d])};
 const ends=[];polys.forEach(P=>{let prev=null;P.forEach(p=>{const i=id(p);if(prev!=null&&prev!==i)link(prev,i);prev=i});if(P.length){ends.push(id(P[0]),id(P[P.length-1]))}});
 /* gaps between pieces */
 const near=ll=>{const q=PJ(ll);let b=0,bd=1e9;pts.forEach((p,i)=>{const d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d<bd){bd=d;b=i}});return b};
 const s0=near(R.sea),s1=near(R.src);let dist,prev;
 /* the drawn pieces can leave gaps: bridge them, wider each time, until mouth and source join up (a wider bridge costs extra, so real channels win) */
 for(const gap of [2.5,6,14]){
  ends.forEach(i=>{let best=-1,bd=gap;pts.forEach((q,j)=>{if(j===i)return;const d=Math.hypot(pts[i][0]-q[0],pts[i][1]-q[1]);if(d<bd&&!adj[i].some(e=>e[0]===j)){bd=d;best=j}});if(best>=0){const d=Math.hypot(pts[i][0]-pts[best][0],pts[i][1]-pts[best][1])*(gap>2.5?3:1);adj[i].push([best,d]);adj[best].push([i,d])}});
  dist=new Float64Array(pts.length).fill(Infinity);prev=new Int32Array(pts.length).fill(-1);const done=new Uint8Array(pts.length);dist[s0]=0;
  for(;;){let u=-1,ud=Infinity;for(let i=0;i<pts.length;i++)if(!done[i]&&dist[i]<ud){ud=dist[i];u=i}if(u<0||u===s1)break;done[u]=1;adj[u].forEach(([v,d])=>{if(dist[u]+d<dist[v]){dist[v]=dist[u]+d;prev[v]=u}})}
  if(isFinite(dist[s1]))break}
 if(!isFinite(dist[s1]))return null;const path=[];for(let v=s1;v>=0;v=prev[v]){const ll=PJ.invert(pts[v]);if(ll)path.push(ll);if(v===s0)break}
 return STEM[name]=densify(path,600)}
/* ---------- geometry helpers ---------- */
function densify(ll,n){const seg=[];let tot=0;for(let i=1;i<ll.length;i++){const d=d3.geoDistance(ll[i-1],ll[i]);seg.push(d);tot+=d}if(!tot)return ll.slice();const out=[ll[0]];let acc=0,k=1;
 for(let i=1;i<ll.length;i++){const d=seg[i-1];while(k<n&&(k*tot/n)<=acc+d+1e-12){const t=d?((k*tot/n)-acc)/d:0;out.push(d3.geoInterpolate(ll[i-1],ll[i])(Math.max(0,Math.min(1,t))));k++}acc+=d}if(out.length<n+1)out.push(ll[ll.length-1]);return out}
/* published water levels along the big rivers (lakes, falls, rapids, dams), so the steps the 11 km grid smooths away show */
let RP=null;fetch("textures/RIVER_PROFILES.json").then(r=>r.json()).then(j=>{RP=j}).catch(()=>{});
function riverLevels(P,name){const C=RP&&RP[name];if(!C||C.length<2)return null;let from=0;const hv=(a,b)=>d3.geoDistance(a,b);
 /* each level point is pinned to the nearest place on the course, never upstream of the one before */
 const pts=C.map(c=>{let bi=from,bd=1e9;for(let i=from;i<P.length;i++){const d=hv(P[i].ll,[c[1],c[2]]);if(d<bd){bd=d;bi=i}}from=bi;return{i:bi,km:P[bi].km,e:c[3],n:c[0],k:c[4]}});
 /* a top and bottom pinned to the same spot still make a step: the bottom sits a little downstream */
 for(let j=1;j<pts.length;j++)if(pts[j].km<=pts[j-1].km)pts[j].km=pts[j-1].km+.5;
 const at=km=>{if(km<=pts[0].km)return pts[0].e;for(let j=1;j<pts.length;j++)if(km<=pts[j].km){const a=pts[j-1],b=pts[j],t=(km-a.km)/((b.km-a.km)||1);return a.e+(b.e-a.e)*t}return pts[pts.length-1].e};
 const out=P.map(p=>({km:p.km,ll:p.ll,e:at(p.km)}));pts.forEach(q=>out.push({km:q.km,ll:P[Math.min(P.length-1,q.i)].ll,e:q.e,n:q.n,k:q.k}));
 out.sort((a,b)=>a.km-b.km||b.e-a.e);for(let i=1;i<out.length;i++)out[i].e=Math.min(out[i].e,out[i-1].e);return out}
function profile(ll,opt){const P=[];let km=0;for(let i=0;i<ll.length;i++){if(i)km+=d3.geoDistance(ll[i-1],ll[i])*R_KM;P.push({km,ll:ll[i],e:elevAt(ll[i][0],ll[i][1])})}
 if(opt&&opt.river&&opt.name){const R=riverLevels(P,opt.name);if(R)return R}
 if(opt&&opt.river){for(let i=1;i<P.length;i++)P[i].e=Math.min(P[i].e,P[i-1].e);P.forEach(p=>p.e=Math.max(0,p.e))}return P}
/* ---------- countries along the line ---------- */
let FB=null;function feats(){if(FB)return FB;try{FB=projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c).map(f=>({f,b:d3.geoBounds(f),c:String(f.properties.c).toLowerCase()}))}catch(e){FB=[]}return FB}
function countryAt(ll){for(const o of feats()){const b=o.b;if(b[0][0]<=b[1][0]?(ll[0]<b[0][0]||ll[0]>b[1][0]):(ll[0]<b[0][0]&&ll[0]>b[1][0]))continue;if(ll[1]<b[0][1]||ll[1]>b[1][1])continue;if(d3.geoContains(o.f,ll))return o.c}return null}
/* the name the map itself uses: territories as "Guadeloupe (France)", countries by their own name */
const cname=c=>{if(!c)return null;try{if(typeof allMapsCountryName==="function"){const n=allMapsCountryName(c);if(n)return n}}catch(e){}return typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[c]?COUNTRY_BY_CODE[c].n:null};
/* ---------- state ---------- */
let head=null,on=false,armed=false,shape="line",lines=[],hover=null,panel=null,ov=null,raf=0,drawing=null,title="",note="";
/* the lines you draw stay on the map (up to MAXL, the oldest goes first); the card shows one, and you switch between them */
const MAXL=6,HCOL=["#c0392b","#2e6fd0","#8e44ad","#138a72","#d35400","#4a5568"];let hist=[],badges=[];
function renum(){hist.forEach((h,i)=>{h.n=i+1;h.title=(h.edit.kind==="line"?"Your line ":"Your path ")+(i+1)})}
function showHist(i){const L=hist[i];if(!L)return;armed=false;drawing=null;editing=null;head=null;note="";title=L.title;lines=[L];yl={lo:null,hi:null};if(!L.P)compute();renderPanel()}
const css=document.createElement("style");css.textContent=`
.gf-xs-chip.active{ background:#7a4b1f !important; color:#fff !important; }
.gf-xs-ico{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; color:#5b3a17; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); flex:none; }
.gf-xs-ico.on{ background:#8a5a2b; color:#fff; } .gf-xs-ico-top{ margin-right:8px; align-self:center; }
.gf-xs-top{ cursor:move; } .gf-xs-top button,.gf-xs-top select{ cursor:pointer; }
.gf-xs-ov{ position:absolute; left:0; top:0; pointer-events:none; z-index:30; }
.gf-xs-hist{ display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin:2px 0 6px; font-size:12px; } .gf-xs-hist>span{ font-weight:700; margin-right:2px; } .gf-xs-hist small{ opacity:.6; margin-left:4px; }
.gf-xs-hist button{ border:1.5px solid rgba(0,0,0,.12); background:transparent; color:inherit; border-radius:999px; padding:2px 9px; font:700 12px system-ui; cursor:pointer; display:inline-flex; align-items:center; gap:4px; }
.gf-xs-hist button i{ width:9px; height:9px; border-radius:50%; background:var(--c); } .gf-xs-hist button.on{ border-color:var(--c); background:color-mix(in srgb,var(--c) 14%,transparent); }
:is(body.dark,body.dark-theme,body.sky-night) .gf-xs-hist button{ border-color:rgba(255,255,255,.18); }
.gf-xs{ position:absolute; left:10px; right:58px; bottom:10px; z-index:41; background:#fff; border-radius:14px; box-shadow:0 6px 24px rgba(0,0,0,.25); padding:10px 12px 8px; font:13px/1.35 system-ui,sans-serif; color:#1d2433; }
body.dark .gf-xs{ background:#1c2333; color:#e8ecf3; }
.gf-xs-hctl{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin:4px 0 2px; }
.gf-xs-hz button{ font-size:11px !important; }
.gf-xs-lknote{ margin:3px 0 0; font-size:11.5px; font-style:italic; opacity:.8; }
.gf-xs-yctl{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin:5px 0 2px; font-size:11.5px; }
.gf-xs-yctl input{ width:78px; font:12px system-ui; border:1px solid #ccb; border-radius:7px; padding:2px 6px; background:inherit; color:inherit; }
.gf-xs-yctl button{ border:1px solid #d9cdb8; background:#fffaf0; border-radius:999px; padding:2px 9px; font:700 11px system-ui; cursor:pointer; color:#4a3520; }
body.dark .gf-xs-yctl button, body.sky-night .gf-xs-yctl button{ background:#25304a; color:#e8ecf3; border-color:#3a4a66; }
/* "Dig through" is hidden for now (the owner's call); the code stays */
.gf-xs-dig{ display:none !important; }
.gf-xs-dig{ border:1px solid #d9cdb8; background:#fffaf0; border-radius:999px; padding:4px 10px; font:700 12px system-ui; cursor:pointer; color:#5b3a17; }
.gf-xs-up{ border:1px solid #d9cdb8; background:#fffaf0; border-radius:999px; padding:2px 9px; font:700 11px system-ui; cursor:pointer; color:#4a3520; }
.gf-xs-pick{ display:flex; flex-wrap:wrap; gap:4px; margin:4px 0; }
.gf-xs-pick button{ border:2px solid var(--c); background:#fff; color:#1d2433; border-radius:999px; padding:2px 9px; font:700 11px system-ui; cursor:pointer; }
.gf-xs-pick button.on{ background:var(--c); color:#fff; }
.gf-xs-tab{ width:100%; border-collapse:collapse; font-size:11.5px; margin-top:4px; }
.gf-xs-tab th{ text-align:left; font-weight:800; opacity:.7; padding:2px 6px; border-bottom:1px solid rgba(0,0,0,.12); }
.gf-xs-tab td{ padding:2px 6px; border-bottom:1px solid rgba(0,0,0,.05); white-space:nowrap; }
.gf-xs-tab td i{ display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:5px; vertical-align:-1px; }
body.dark .gf-xs-up, body.dark .gf-xs-pick button:not(.on){ background:#25304a; color:#e8ecf3; border-color:#3a4a66; }
.gf-xs-top{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:6px; }
.gf-xs-top b{ font-size:14px; margin-right:6px; }
.gf-xs-seg{ display:inline-flex; background:#efe7dc; border-radius:999px; padding:2px; }
.gf-xs-seg button{ border:0; background:none; border-radius:999px; padding:4px 10px; font:700 12px system-ui; cursor:pointer; color:#5b3a17; }
.gf-xs-seg button.on{ background:#8a5a2b; color:#fff; }
.gf-xs-go{ border:0; border-radius:999px; padding:5px 12px; font:700 12px system-ui; background:#c0392b; color:#fff; cursor:pointer; }
.gf-xs-go.on{ background:#2e7d32; }
.gf-xs select{ font:12px system-ui; border-radius:8px; padding:3px 6px; border:1px solid #ccb; max-width:220px; }
.gf-xs-x{ margin-left:auto; border:0; background:none; font-size:18px; cursor:pointer; color:inherit; opacity:.7; }
.gf-xs-min{ border:0; background:none; font-size:14px; cursor:pointer; color:inherit; opacity:.7; }
.gf-xs.mini .gf-xs-body{ display:none; }
.gf-xs-note{ font-size:12px; opacity:.8; margin:0 0 4px; }
.gf-xs svg{ display:block; width:100%; height:190px; border-radius:10px; }
.gf-xs-srcbox{ display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; }
.gf-xs-tabs button small{ font-size:10px; opacity:.75; margin-left:2px; }
.gf-xs-help{ font-size:12px; opacity:.75; padding:6px 6px 2px; text-align:center; }
.gf-xs-src{ font-size:10.5px; opacity:.55; margin-top:3px; }
.gf-xs.gf-xs-empty .gf-xs-src{ display:none; }
/* short while there is nothing to show; wider once a profile is drawn; the corner handle resizes it either way */
.gf-xs.gf-xs-empty{ right:auto; width:min(470px, calc(100% - 68px)); }
.gf-xs svg{ height:var(--xs-h,190px); }
.gf-xs-rz{ position:absolute; z-index:2; touch-action:none; }
.gf-xs-rz.w{ right:-3px; top:14px; bottom:14px; width:9px; cursor:ew-resize; }
.gf-xs-rz.h{ left:14px; right:14px; top:-3px; height:9px; cursor:ns-resize; }
.gf-xs-rz.w::after{ content:""; position:absolute; left:3px; top:50%; height:34px; margin-top:-17px; width:3px; border-radius:2px; background:currentColor; opacity:.25; }
.gf-xs-rz.h::after{ content:""; position:absolute; top:3px; left:50%; width:34px; margin-left:-17px; height:3px; border-radius:2px; background:currentColor; opacity:.25; }
.gf-xs-rz:hover::after{ opacity:.6; }
.gf-xs.gf-xs-empty .gf-xs-rz.h{ display:none; }
/* the Draw button stands out so it's clear where to start */
.gf-xs-go{ font-size:13px !important; padding:7px 16px !important; box-shadow:0 0 0 0 rgba(192,57,43,.55); animation:gfXsPulse 1.6s ease-out infinite; }
.gf-xs-go.on{ box-shadow:0 0 0 0 rgba(46,125,50,.55); animation-name:gfXsPulseG; }
.gf-xs:not(.gf-xs-empty) .gf-xs-go:not(.on){ animation:none; font-size:12px !important; padding:5px 12px !important; }
@keyframes gfXsPulse{ 0%{ box-shadow:0 0 0 0 rgba(192,57,43,.6); } 70%{ box-shadow:0 0 0 10px rgba(192,57,43,0); } 100%{ box-shadow:0 0 0 0 rgba(192,57,43,0); } }
@keyframes gfXsPulseG{ 0%{ box-shadow:0 0 0 0 rgba(46,125,50,.6); } 70%{ box-shadow:0 0 0 10px rgba(46,125,50,0); } 100%{ box-shadow:0 0 0 0 rgba(46,125,50,0); } }
.gf-xs-help.armed{ font-size:13.5px; opacity:1; font-weight:700; color:#2e7d32; }
.globe-host.gf-xs-armed canvas{ cursor:crosshair !important; }
/* the country names under the chart sit on the panel itself: light in the dark themes */
:is(body.dark,body.dark-theme,body.sky-night) .gf-xs .gf-xs-cty{ fill:#ecc894; }
.gf-xs-exit,.gf-xs-clear{ border:1px solid rgba(0,0,0,.18); border-radius:999px; padding:5px 12px; font:700 12px system-ui; background:#fff; color:#1d3047; cursor:pointer; }
:is(body.dark,body.dark-theme,body.sky-night) .gf-xs-exit,:is(body.dark,body.dark-theme,body.sky-night) .gf-xs-clear{ background:#25304a; color:#e8ecf3; border-color:#3a4a66; }
.gf-xs-edhint{ font-size:12px; opacity:.75; margin:2px 0 4px; }`;document.head.appendChild(css);
/* the chip next to the map's sub-modes */
const ICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20h20"/><path d="M2 17l5-7 4 4 4-8 7 11"/></svg>';
function icons(show){const g=G(),spots=[];const btns=g&&g.host.querySelector(".globe-btns");if(btns)spots.push([btns,"gf-xs-ico gf-xs-ico-col"]);
 document.querySelectorAll(".gf-xs-ico").forEach(b=>{if(!show)b.remove()});if(!show)return;
 spots.forEach(([el,cl])=>{let b=cl.includes("col")?el.querySelector(".gf-xs-ico"):el.parentNode.querySelector(":scope > .gf-xs-ico");
  if(!b){b=document.createElement("button");b.type="button";b.className=cl;b.title="Cross-section: draw a line and see the land and sea floor along it";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();on?stop():start()};
   if(cl.includes("col"))el.appendChild(b);else el.parentNode.insertBefore(b,el)}b.classList.toggle("on",on)})}
/* the way in: a round button in the map's right-hand column (and the Shovel gadget in the toolkit) */
function chip(){icons(mode()==="elevation")}
function start(o){const g=G();if(!g)return;on=true;loadDEM().then(()=>{if(!lines.length&&hist.length)showHist(hist.length-1);else renderPanel()}).catch(()=>{});mount();if(!lines.length&&hist.length){lines=[hist[hist.length-1]];title=lines[0].title}renderPanel();/* opening the Elevation map: ready to draw straight away (your earlier lines stay listed) */if(!lines.length||(o&&o.draw))armed=true;renderPanel();loop()}
function dragPanel(){if(!panel||panel._drag)return;panel._drag=1;panel.addEventListener("pointerdown",e=>{if(e.target.closest(".gf-xs-rz")){e.preventDefault();e.stopPropagation();
  const h=panel.parentNode.getBoundingClientRect(),r=panel.getBoundingClientRect(),sv=panel.querySelector("svg"),sh=sv?sv.getBoundingClientRect().height:190,x0=e.clientX,y0=e.clientY;
  panel.style.left=(r.left-h.left)+"px";panel.style.top=(r.top-h.top)+"px";panel.style.right="auto";panel.style.bottom="auto";
  const W=e.target.closest(".gf-xs-rz").classList.contains("w"),top0=panel.style.top;
  /* the top edge: the panel keeps its bottom where it is and the chart grows upward */
  if(!W){panel.style.top="auto";panel.style.bottom=(h.bottom-r.bottom)+"px"}
  const mv=ev=>{if(W)panel.style.width=Math.max(300,Math.min(innerWidth-20,r.width+ev.clientX-x0))+"px";else if(sv)panel.style.setProperty("--xs-h",Math.max(90,Math.min(innerHeight*.7,sh-(ev.clientY-y0)))+"px")};
  const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up)};addEventListener("pointermove",mv);addEventListener("pointerup",up);return}
 if(!e.target.closest(".gf-xs-top")||e.target.closest("button,select,input"))return;e.preventDefault();e.stopPropagation();
 const h=panel.parentNode.getBoundingClientRect(),r=panel.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;panel.style.right="auto";panel.style.bottom="auto";panel.style.width=r.width+"px";
 const mv=ev=>{panel.style.left=Math.max(-r.width+80,Math.min(h.width-80,ev.clientX-h.left-dx))+"px";panel.style.top=Math.max(0,Math.min(h.height-40,ev.clientY-h.top-dy))+"px"};
 const upx=()=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",upx,true)};addEventListener("pointermove",mv,true);addEventListener("pointerup",upx,true)},true)}
function stop(){on=false;armed=false;drawing=null;lines=[];hover=null;badges=[];try{const g=G();if(g)g.host.classList.remove("gf-xs-pen")}catch(e){}if(panel){panel.remove();panel=null}if(ov){ov.remove();ov=null}cancelAnimationFrame(raf);chip()}
function mount(){const g=G();if(!g)return;const h=g.host;if(getComputedStyle(h).position==="static")h.style.position="relative";
 if(!ov||ov.parentNode!==h){ov=document.createElement("canvas");ov.className="gf-xs-ov";h.appendChild(ov)}
 if(!panel||panel.parentNode!==h){panel=document.createElement("div");panel.className="gf-xs";h.appendChild(panel)}dragPanel();
 }
/* ---------- drawing on the map ---------- */
const inPanel=e=>e.target.closest&&e.target.closest(".gf-xs,.globe-btns,.gfk-tray,.gfk-panel,button,a,input,select");
function local(e){const g=G();const r=g.canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
/* what is drawn is kept as places (longitude, latitude), so it stays on the map when you zoom or pan while drawing;
   a finished line keeps its control points (the two ends of a straight line, the points of a freehand path) to edit */
const inv=p=>{try{const q=G().projection().invert(p);return q&&isFinite(q[0])&&isFinite(q[1])?q:null}catch(e){return null}};
/* the part of the globe on show: when zoomed in, the globe is a magnified view inside a circle of its normal size */
function vis(g,pr0){if(!g||g._flat||!pr0||!pr0.translate)return null;const t=pr0.translate();let R=pr0.scale();try{const z=g.size();if(z&&z.r<R)R=z.r}catch(e){}return[t[0],t[1],R]}
function scr(ll){const g=G();if(!g)return null;const pr0=g.projection(),ro=pr0.rotate?pr0.rotate():[g.rot[0],g.rot[1]];if(!g._flat&&d3.geoDistance(ll,[-ro[0],-ro[1]])>=Math.PI/2-1e-3)return null;const q=pr0(ll);if(!q||!isFinite(q[0]))return null;const d=vis(g,pr0);return d&&Math.hypot(q[0]-d[0],q[1]-d[1])>d[2]?null:q}
let editing=null;
function handleAt(e){const L=lines.length===1&&lines[0].edit;if(!L)return-1;const p=local(e);let best=-1,bd=13;L.pts.forEach((ll,i)=>{const q=scr(ll);if(!q)return;const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;best=i}});return best}
function down(e){if(!on||inPanel(e))return;const g=G();if(!g)return;
 if(!armed){{const p=local(e),b=badges.find(b=>Math.hypot(b.x-p[0],b.y-p[1])<12);if(b){e.stopImmediatePropagation();e.preventDefault();showHist(b.i);return}}const i=handleAt(e);if(i<0)return;e.stopImmediatePropagation();e.preventDefault();try{g.host.setPointerCapture(e.pointerId)}catch(_){}editing={i,id:e.pointerId};return}
 if(e.button||drawing)return;/* a second finger: left to the map (pinch to zoom while drawing) */e.stopImmediatePropagation();e.preventDefault();try{g.host.setPointerCapture(e.pointerId)}catch(_){}
 const q=inv(local(e));if(!q)return;drawing={ll:[q],id:e.pointerId,last:local(e)}}
function move(e){if(!on)return;const g=G();if(!g)return;
 if(editing&&e.pointerId===editing.id){e.stopImmediatePropagation();e.preventDefault();const q=inv(local(e));if(q){lines[0].edit.pts[editing.i]=q;lines[0].ll=lines[0].edit.pts.slice();lines[0]._prev=1}return}
 if(drawing&&e.pointerId===drawing.id){e.stopImmediatePropagation();e.preventDefault();const p=local(e),q=inv(p);if(!q)return;if(shape==="line")drawing.ll=[drawing.ll[0],q];else{const l=drawing.last;if(Math.hypot(p[0]-l[0],p[1]-l[1])>3){drawing.ll.push(q);drawing.last=p}}return}
 /* over a handle of a finished line: a hand to drag it */
 if(!armed&&lines.length===1&&lines[0].edit){const h=handleAt(e)>=0;if(h!==!!move._h){move._h=h;g.host.style.cursor=h?"grab":""}}}
/* a path through the control points, sampled evenly along the screen (as drawn) into 500 places */
function build(ctrl){const g=G();if(!g)return null;const pts=ctrl.map(scr);
 if(pts.some(p=>!p))return densify(ctrl,500);
 let tot=0;for(let i=1;i<pts.length;i++)tot+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(tot<1)return null;const n=500,iv=g.projection().invert,ll=[];let acc=0,k=0;
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);while(k<=n&&k*tot/n<=acc+d+1e-9){const t=d?(k*tot/n-acc)/d:0,q=iv([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);if(q&&isFinite(q[0]))ll.push(q);k++}acc+=d}
 return ll.length>1?ll:null}
/* a freehand path's editable points: about one every 22 px along what was drawn */
function thin(ctrl){const out=[ctrl[0]];let last=scr(ctrl[0]);for(let i=1;i<ctrl.length-1;i++){const q=scr(ctrl[i]);if(!q||!last||Math.hypot(q[0]-last[0],q[1]-last[1])>=22){out.push(ctrl[i]);last=q}}out.push(ctrl[ctrl.length-1]);return out}
function clearLine(){const cur=lines.length===1?hist.indexOf(lines[0]):-1;if(cur>=0){hist.splice(cur,1);renum()}lines=[];head=null;hover=null;title="";note="";editing=null;drawing=null;if(cur>=0&&hist.length){showHist(Math.min(cur,hist.length)-1<0?0:Math.min(cur,hist.length)-1);return}renderPanel()}
function up(e){
 if(editing&&e.pointerId===editing.id){e.stopImmediatePropagation();editing=null;const L=lines[0];if(L&&L.edit){const ll=build(L.edit.pts);if(ll){L.ll=ll;L._prev=0;L.P=null;head=null;yl={lo:null,hi:null};compute();renderPanel()}}return}
 if(!drawing||e.pointerId!==drawing.id)return;e.stopImmediatePropagation();const g=G(),ctrl=drawing.ll;drawing=null;if(!g||ctrl.length<2)return;
 {const a=scr(ctrl[0]),b=scr(ctrl[ctrl.length-1]);let tot=0;for(let i=1;i<ctrl.length;i++){const p=scr(ctrl[i-1]),q=scr(ctrl[i]);if(p&&q)tot+=Math.hypot(q[0]-p[0],q[1]-p[1])}if(tot<8&&!(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])>=8))return}
 const ed=shape==="line"?[ctrl[0],ctrl[ctrl.length-1]]:thin(ctrl);const ll=build(shape==="line"?ed:ctrl);if(!ll)return;
 armed=false;title=shape==="line"?"Your line":"Your path";note="";head=null;const used=new Set(hist.map(h=>h.c)),col=HCOL.find(c=>!used.has(c))||HCOL[0];if(hist.length>=MAXL)hist.shift();const nL={ll,c:col,P:null,edit:{kind:shape,pts:ed},title,n:0};hist.push(nL);renum();title=nL.title;lines=[nL];compute();renderPanel()}
/* ---------- the map overlay ---------- */
function loop(){cancelAnimationFrame(raf);if(!on)return;raf=requestAnimationFrame(loop);const g=G();if(!g||!ov){return}
 const c=g.canvas,r=c.getBoundingClientRect(),hr=g.host.getBoundingClientRect(),dpr=(window.gfDpr?gfDpr():Math.min(2,devicePixelRatio||1));
 if(ov.width!==Math.round(r.width*dpr)||ov.height!==Math.round(r.height*dpr)){ov.width=Math.round(r.width*dpr);ov.height=Math.round(r.height*dpr);ov.style.width=r.width+"px";ov.style.height=r.height+"px"}
 /* lined up with the globe by where it really lands (its offset parent can differ, e.g. in full screen) */
 {const L0=parseFloat(ov.style.left)||0,T0=parseFloat(ov.style.top)||0,o=ov.getBoundingClientRect();if(Math.abs(o.left-r.left)>.5||Math.abs(o.top-r.top)>.5){ov.style.left=(L0+r.left-o.left)+"px";ov.style.top=(T0+r.top-o.top)+"px"}}
 const x=ov.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);const pr0=g.projection();
 /* on the globe nothing is drawn outside the ball */
 x.save();const disc=vis(g,pr0);if(disc){x.beginPath();x.arc(disc[0],disc[1],disc[2]+.5,0,7);x.clip()}
 /* on the globe, points on the far side are not drawn (the projection would mirror them onto the near side) */
 const ro=pr0.rotate?pr0.rotate():[g.rot[0],g.rot[1]],ctr=[-ro[0],-ro[1]],pr=ll=>{if(!(g._flat||d3.geoDistance(ll,ctr)<Math.PI/2-1e-3))return null;const q=pr0(ll);return q&&(!disc||Math.hypot(q[0]-disc[0],q[1]-disc[1])<=disc[2])?q:null};
 const stroke=(pts,col)=>{x.lineJoin=x.lineCap="round";x.beginPath();let pen=false,last=null;pts.forEach(p=>{if(!p){pen=false;return}if(pen&&last&&Math.abs(p[0]-last[0])>r.width/2)pen=false;pen?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]);pen=true;last=p});
  x.strokeStyle="rgba(255,255,255,.95)";x.lineWidth=4;x.stroke();x.strokeStyle=col;x.lineWidth=2;x.stroke()};
 badges=[];hist.forEach((H,i)=>{if(lines.includes(H))return;const pts=H.ll.map(ll=>{const q=pr(ll);return q&&isFinite(q[0])?q:null});x.globalAlpha=.55;stroke(pts,H.c);x.globalAlpha=1;
  const vis=pts.filter(Boolean);if(!vis.length)return;const q=vis[Math.floor(vis.length/2)];x.fillStyle=H.c;x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.arc(q[0],q[1],9,0,7);x.fill();x.stroke();
  x.fillStyle="#fff";x.font="800 11px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(String(i+1),q[0],q[1]+.5);badges.push({i,x:q[0],y:q[1]})});
 lines.forEach(L=>{const pts=L.ll.map(ll=>{const q=pr(ll);return q&&isFinite(q[0])?q:null});stroke(pts,L.c);
  const lab=(q,t)=>{if(!q)return;x.fillStyle="#fff";x.strokeStyle=L.c;x.lineWidth=2;x.beginPath();x.arc(q[0],q[1],9,0,7);x.fill();x.stroke();x.fillStyle=L.c;x.font="800 11px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(t,q[0],q[1]+.5)};
  /* the points you can drag: the ends of a straight line, every point of a freehand path */
  if(lines.length===1&&L.edit&&!armed){const E=L.edit.pts;E.forEach((ll,i)=>{if(L.edit.kind==="line"||i===0||i===E.length-1)return;const q=pr(ll);if(!q)return;x.fillStyle="#fff";x.strokeStyle=L.c;x.lineWidth=1.6;x.beginPath();x.arc(q[0],q[1],4.2,0,7);x.fill();x.stroke()})}
  if(lines.length===1){lab(pts[0],"A");lab(pts[pts.length-1],"B")}});
 if(drawing){stroke(drawing.ll.map(ll=>{const q=pr(ll);return q&&isFinite(q[0])?q:null}),"#c0392b")}
 if(hover){const q=pr(hover.ll);if(q){x.fillStyle=hover.c||"#c0392b";x.strokeStyle="#fff";x.lineWidth=2.5;x.beginPath();x.arc(q[0],q[1],6,0,7);x.fill();x.stroke()}}x.restore()}
/* ---------- named landforms along a line ----------
   mountain ranges, plateaus, plains, basins and deserts (the outlines the map search uses), the map's own seas and lakes,
   and the deep-sea trenches (rough centre lines) */
const TRENCH=[["Mariana Trench",[[141.5,10.5],[142.5,11.4],[144.5,12.5],[146.5,14.5],[147.8,17.5],[147.5,20.5]]],["Japan Trench",[[142.5,34.5],[143.8,37],[144.4,39.5],[144.6,41]]],
 ["Kuril–Kamchatka Trench",[[145.5,41.5],[150,44],[154,47.5],[160,52],[163,55]]],["Aleutian Trench",[[165,52],[175,50.5],[180,50.5],[-170,51],[-160,53.5],[-150,56.5]]],
 ["Tonga Trench",[[-173.5,-15],[-173,-19],[-174.5,-23.5]]],["Kermadec Trench",[[-175.5,-25],[-177,-30],[-178,-35]]],["Philippine Trench",[[127,5],[127.2,8],[126.5,11],[125.5,14]]],
 ["Puerto Rico Trench",[[-68,19.8],[-65,19.8],[-62,19.6]]],["Peru–Chile Trench",[[-80,-5],[-79.5,-10],[-77,-14],[-72,-18.5],[-71.5,-24],[-72.5,-30],[-74,-36],[-75.5,-42]]],
 ["Java Trench",[[95,2],[97,-2],[102,-7],[107,-9.5],[113,-10.5],[118,-11]]],["Middle America Trench",[[-105,17],[-98,15],[-93,13.5],[-90,12.5]]],["South Sandwich Trench",[[-26,-55.5],[-25.5,-58],[-26.5,-60.5]]]]
 .map(([n,c])=>{const pts=[];for(let i=1;i<c.length;i++){const f=d3.geoInterpolate(c[i-1],c[i]),k=Math.max(2,Math.ceil(d3.geoDistance(c[i-1],c[i])*R_KM/40));for(let j=0;j<k;j++)pts.push(f(j/k))}pts.push(c[c.length-1]);return{n,pts}});
let LFD=null,lfP=null;
function loadLF(){if(lfP)return lfP;lfP=fetch("textures/GF_REGIONS.json").then(r=>r.ok?r.json():[]).catch(()=>[]).then(d=>{const PR={"mountain range":1,foothills:2,plateau:2,gorge:1,valley:2,desert:3,plain:3,basin:3,lowland:3,wetland:3,tundra:3},out=[];
 /* each part's rings the way d3 wants them (some parts of a shape can run the other way round) */
 const fix=g=>{try{const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;polys.forEach(P=>{if(d3.geoArea({type:"Polygon",coordinates:P})>2*Math.PI)P.forEach(r=>r.reverse())});const a=d3.geoArea(g);return a<1.5?a:null}catch(e){return null}};
 (d||[]).forEach(o=>{const p=PR[o.t];if(!p||!o.g)return;const a=fix(o.g);if(a==null)return;out.push({n:o.n,g:o.g,b:d3.geoBounds(o.g),p,a})});
 try{(LANDFORMS.items||[]).forEach(it=>{if(!(it.cat==="seas"||it.cat==="lakes")||!it.geom||it.geom.t!=="poly")return;const g={type:"Polygon",coordinates:it.geom.c},a=fix(g);if(a==null)return;out.push({n:it.name,g,b:d3.geoBounds(g),p:4,a,sea:it.cat==="seas",lake:it.cat==="lakes"})})}catch(e){}
 /* the oceans and big seas from the map's own sea names */
 try{(globeOverlays().seas||[]).forEach(o=>{if(!o.poly||out.some(x=>x.n===o.n))return;const g=o.poly.type?o.poly:{type:"Polygon",coordinates:o.poly};fix(g);let a;try{a=d3.geoArea(g)}catch(e){return}if(!(a<2*Math.PI))return;out.push({n:o.n,g,b:d3.geoBounds(g),p:4,a,sea:true})})}catch(e){}
 LFD=out;if(on&&lines.length===1){compute();renderPanel()}return out});return lfP}
const inB=(b,ll)=>!(ll[1]<b[0][1]||ll[1]>b[1][1]||(b[0][0]<=b[1][0]?(ll[0]<b[0][0]||ll[0]>b[1][0]):(ll[0]<b[0][0]&&ll[0]>b[1][0])));
/* minA: on a long line the bigger feature reads better (the Andes, not one of its cordilleras); on a short line the specific one */
function lfAt(ll,e,minA){if(e<-4000){for(const T of TRENCH)if(T.pts.some(q=>d3.geoDistance(q,ll)*R_KM<170))return{n:T.n,k:"trench"}}if(!LFD)return null;const hit=[];
 for(const o of LFD){if(o.lake&&LAKES)continue;if(o.sea||o.lake){if(e>5&&!o.lake)continue}else if(e<-20)continue;if(!inB(o.b,ll))continue;try{if(!d3.geoContains(o.g,ll))continue}catch(er){continue}hit.push(o)}
 if(!hit.length)return null;const pr=o=>o.sea||o.lake?5:o.p,p0=Math.min(...hit.map(pr)),C=hit.filter(o=>pr(o)===p0);
 const big=C.filter(o=>o.a>=(minA||0)).sort((x,y)=>x.a-y.a)[0]||C.sort((x,y)=>y.a-x.a)[0];return{n:big.n,k:big.sea?"sea":big.lake?"lake":"land"}}
/* the water a point is in, for the readout when it is in no country: a lake, else the smallest named sea, else the ocean */
function waterName(ll){try{const k=LAKES&&lakeAt(ll);if(k&&k.n)return/lake|sea|reservoir/i.test(k.n)?k.n:"Lake "+k.n}catch(e){}
 let best=null;try{(LFD||[]).forEach(o=>{if(!o.sea||!inB(o.b,ll))return;try{if(d3.geoContains(o.g,ll)&&(!best||o.a<best.a))best=o}catch(e){}})}catch(e){}if(best)return best.n;
 const lon=ll[0],lat=ll[1];if(lat<-60)return"Southern Ocean";if(lat>66)return"Arctic Ocean";
 if(lon>-100&&lon<20&&!(lon<-70&&lat<8&&lon<-80))return"Atlantic Ocean";if(lon>=20&&lon<=147&&lat<=30)return"Indian Ocean";return"Pacific Ocean"}
function lfSegs(P){const step=Math.max(1,Math.floor(P.length/160)),out=[];let cur=null;
 const Lk=(P[P.length-1].km||0)-(P[0].km||0),minA=Math.pow(Lk/7/R_KM,2);
 for(let i=0;i<P.length;i+=step){const p=P[i],h=lfAt(p.ll,p.e,minA),n=h&&h.n;if(cur&&cur.n===n){cur.b=p.km;cur.hi=Math.max(cur.hi,p.e);cur.lo=Math.min(cur.lo,p.e)}else{cur={n,k:h&&h.k,a:p.km,b:p.km,hi:p.e,lo:p.e};out.push(cur)}}
 return out.filter(g=>g.n)}
/* ---------- profiles and the chart ---------- */
/* ---------- lakes (HydroLAKES v1.0, Messager et al. 2016, CC BY 4.0: lakes and reservoirs of 50 km² or more) ----------
   each lake: name, surface height (m above sea level, a long-term average), mean depth, type (1 lake, 2 reservoir,
   3 controlled lake), area (km²), outline. Where the line crosses one, its water is drawn up to that level and named;
   where the height data has the lake bed (the Great Lakes, for one) the water is shown full depth, elsewhere the height
   data only knows the surface, and just the surface line is drawn (no invented lake bed). */
/* the world's land depressions (below sea level, not under a lake): name, lowest point lon/lat, how far round it counts (km) */
const DEPRESSIONS=[["Qattara Depression",27.1,29.6,260],["Faiyum Depression",30.6,29.45,50],["Danakil Depression",40.3,14.2,150],["Turpan Depression",89.3,42.6,120],["Death Valley",-116.83,36.25,80],
 ["Caspian Depression",50,46.5,700],["Karagiye Depression",51.4,43.5,80],["Akdzhakaya Depression",57.4,40.7,120],["Lake Assal basin",42.4,11.6,40],["Laguna del Carbón",-68.4,-49.6,60],
 ["Salton Trough",-115.8,33.2,120],["Chott Melrhir",6.3,34.2,120],["Sebkha Tah",-12.8,27.6,60],["Jordan Rift",35.5,32.2,150],["Kuttanad",76.4,9.4,40],["Netherlands polders",4.9,52.2,180],
 ["Lammefjord",11.5,55.8,30],["Lake Eyre basin",137.3,-28.4,200]];
let LAKES=null,lakeP=null;
function loadLakes(){if(lakeP)return lakeP;lakeP=fetch("textures/LAKES.json").then(r=>r.ok?r.json():[]).catch(()=>[]).then(d=>{
 const dec=a=>{const r=[];let x=0,y=0;for(let i=0;i+1<a.length;i+=2){x+=a[i];y+=a[i+1];r.push([x/100,y/100])}if(r.length&&(r[0][0]!==r[r.length-1][0]||r[0][1]!==r[r.length-1][1]))r.push(r[0].slice());return r};
 LAKES=[];(d||[]).forEach(([n,lv,dep,t,ar,polys])=>{try{const g={type:"MultiPolygon",coordinates:polys.map(P=>P.map(dec))};
  g.coordinates.forEach(P=>{if(d3.geoArea({type:"Polygon",coordinates:P})>2*Math.PI)P.forEach(r=>r.reverse())});LAKES.push({n,lv,dep,t,ar,g,b:d3.geoBounds(g)})}catch(e){}});
 if(on&&lines.length){lines.forEach(L=>{if(!L.river&&L.P)lakeify(L)});renderPanel()}return LAKES});return lakeP}
function lakeAt(ll){if(!LAKES)return null;let best=null;for(const o of LAKES){if(!inB(o.b,ll))continue;try{if(d3.geoContains(o.g,ll)&&(!best||o.ar<best.ar))best=o}catch(e){}}return best}
function lakeify(L){L.lk=null;if(!LAKES){loadLakes();return}const P=L.P;if(!P||P.length<2)return;const out=[];let cur=null;
 for(let i=0;i<P.length;i++){const o=lakeAt(P[i].ll);if(o){/* the detailed tiles mostly know only the water surface; the NOAA grid has the bed of many big lakes (the Great
   Lakes, Baikal, the Caspian...): the deeper of the two is used, and never above the lake's own level */
   P[i].e=Math.min(P[i].e,Math.round(elevAt(P[i].ll[0],P[i].ll[1])),o.lv);
   if(cur&&cur.o===o&&cur.j===i-1){cur.b=P[i].km;cur.j=i;cur.lo=Math.min(cur.lo,P[i].e)}else{cur={o,n:o.n,lv:o.lv,a:P[i].km,b:P[i].km,i,j:i,lo:P[i].e};out.push(cur)}}}
 /* where the height data only has the water surface, the lake bed is drawn as an approximate bowl: deepest where the
    point is farthest from the shore, as deep as the lake's published maximum (or twice HydroLAKES' mean depth) */
 out.forEach(k=>{const o=k.o,mx=maxDepth(o);if(!(mx>5)||k.lv-k.lo>mx*.35)return;const inner=innerMax(o);if(!(inner>0))return;k.syn=1;k.mx=mx;
  for(let i=k.i;i<=k.j;i++){const x=Math.min(1,shoreKm(o,P[i].ll)/inner),d=mx*(1-(1-x)*(1-x));const bed=Math.round(o.lv-d);if(bed<P[i].e){P[i].e=bed;P[i].syn=1}k.lo=Math.min(k.lo,P[i].e)}});
 L.lk=out}
/* published greatest depths (m) of the deep lakes; any other lake: twice its mean depth */
const MAXD={Baikal:1642,Tanganyika:1470,Caspian:1025,"Caspian Sea":1025,Malawi:706,Nyasa:706,"Issyk-Kul":668,"Ysyk-Kol":668,"Great Slave":614,Matano:590,Crater:594,Toba:505,Superior:406,
 Titicaca:281,Michigan:281,Huron:229,Ontario:244,Ladoga:230,Kivu:485,Hovsgol:262,"Khuvsgul":262,Sarez:500,Tahoe:501,Chelan:453,Van:451,Ohrid:288,Garda:346,Como:425,Maggiore:372,Geneva:310,Leman:310,
 Victoria:84,Albert:58,Turkana:109,Edward:112,Tana:14,Chad:11,Erie:64,Onega:127,"Great Bear":446,Athabasca:243,Winnipeg:36,Nicaragua:26,Balkhash:26,"Hornindalsvatnet":514,Quesnel:506};
function maxDepth(o){const k=MAXD[o.n];return k||(o.dep>0?o.dep*2:0)}
function shoreKm(o,ll){let best=Infinity;const V=o._v||(o._v=(()=>{const a=[];o.g.coordinates.forEach(P=>P.forEach(r=>{const st=Math.max(1,Math.floor(r.length/1500));for(let i=0;i<r.length;i+=st)a.push(r[i])}));return a})());
 for(const v of V){const d=d3.geoDistance(ll,v);if(d<best)best=d}return best*R_KM}
function innerMax(o){if(o._in!=null)return o._in;let m=0;const[[w,sth],[e,n]]=o.b,N=22;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const ll=[w+(e-w)*i/N,sth+(n-sth)*j/N];try{if(d3.geoContains(o.g,ll))m=Math.max(m,shoreKm(o,ll))}catch(e){}}
 o._in=m||1;return o._in}
function compute(){yl={lo:null,hi:null};lines.forEach(L=>{L.P=profile(L.ll,{river:L.river,name:L.name});if(L.river&&REAL_KM[L.name]&&L.P.length){const T=L.P[L.P.length-1].km,f=T?REAL_KM[L.name]/T:1;L.P.forEach(p=>p.km*=f)}if(lines.length===1){const segs=[];let cur=null;
 /* every sample, so small islands (Guadeloupe, Dominica...) on a long line are not skipped */
 /* stretches in no country are split by the water they cross (a lake, a sea, an ocean), named in blue */
 for(let i=0;i<L.P.length;i++){const c=countryAt(L.P[i].ll);L.P[i].c=c||null;const w=c?null:waterName(L.P[i].ll),k=c||("~"+w);if(!cur||cur.k!==k){cur={k,c,w,a:L.P[i].km,b:L.P[i].km};segs.push(cur)}else cur.b=L.P[i].km}if(cur)cur.b=L.P[L.P.length-1].km;L.segs=segs;if(!L.river){if(LFD)L.lf=lfSegs(L.P);else loadLF()}}if(!L.river)lakeify(L)})}
/* detailed heights for a drawn line (not the rivers): AWS Terrain Tiles (Terrarium; SRTM, GMTED2010, ETOPO1 and other
   open sources), fetched only for the tiles the line crosses, at a zoom that matches the line's length */
const TILES=new Map();let refineId=0;
function tile(z,x,y){const k=z+"/"+x+"/"+y;if(TILES.has(k))return TILES.get(k);const pr=new Promise((res,rej)=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0);res(g.getImageData(0,0,256,256).data)}catch(e){rej(e)}};im.onerror=rej;
 im.src="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/"+k+".png"});TILES.set(k,pr);pr.catch(()=>TILES.delete(k));return pr}
const txy=(ll,z)=>{const n=2**z,la=Math.max(-85.05,Math.min(85.05,ll[1]))*Math.PI/180;return[(ll[0]+180)/360*n*256,(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n*256]};
async function refine(L){const id=++refineId;if(L.river||!L.P||L.P.length<2)return;const T=L.P[L.P.length-1].km;if(T<2)return;
 const N=700,pts=densify(L.ll,N);
 /* the zoom: about two pixels per sample, at most ~48 tiles */
 let z=Math.max(3,Math.min(12,Math.round(Math.log2(40075*Math.cos((pts[0][1]+pts[pts.length-1][1])/2*Math.PI/180)/(256*(T/N)/2)))));
 const need=z=>{const S=new Set();pts.forEach(ll=>{const q=txy(ll,z);S.add(z+"/"+(((Math.floor(q[0]/256)%2**z)+2**z)%2**z)+"/"+Math.floor(q[1]/256))});return S};let S=need(z);while(S.size>48&&z>3){z--;S=need(z)}
 const T0={};try{await Promise.all([...S].map(k=>{const[a,b,c]=k.split("/").map(Number);return tile(a,b,c).then(d=>{T0[k]=d})}))}catch(e){return}
 if(id!==refineId||lines.indexOf(L)<0)return;
 const at=ll=>{const q=txy(ll,z),n=2**z,px=q[0]-.5,py=q[1]-.5,x0=Math.floor(px),y0=Math.floor(py),fx=px-x0,fy=py-y0;
  const v=(X,Y)=>{const tx=((Math.floor(X/256)%n)+n)%n,ty=Math.max(0,Math.min(n-1,Math.floor(Y/256))),d=T0[z+"/"+tx+"/"+ty];if(!d)return null;const i=(((Y%256)+256)%256*256+(((X%256)+256)%256))*4;return d[i]*256+d[i+1]+d[i+2]/256-32768};
  const a=v(x0,y0),b=v(x0+1,y0),c=v(x0,y0+1),d=v(x0+1,y0+1);if([a,b,c,d].some(x=>x==null))return null;return(a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy};
 const P=[];let km=0;for(let i=0;i<pts.length;i++){if(i)km+=d3.geoDistance(pts[i-1],pts[i])*R_KM;const e=at(pts[i]);P.push({km,ll:pts[i],e:e==null?elevAt(pts[i][0],pts[i][1]):Math.round(e)})}
 if(lines.length===1)P.forEach(p=>{p.c=countryAt(p.ll)||null});L.P=P;lakeify(L);L.fine=Math.round(40075/(256*2**z)*Math.cos(pts[0][1]*Math.PI/180)*1000);if(on&&panel)renderPanel()}
{const _c=compute;compute=function(){const r=_c.apply(this,arguments);try{lines.forEach(L=>{if(!L.river)refine(L)})}catch(e){}return r}}
const STOPS=[[-11000,"#0b1d4d"],[-6000,"#123a7a"],[-3000,"#1f63a8"],[-200,"#4ea6d6"],[0,"#8fd3e8"],[1,"#4f9d52"],[300,"#8fbf5a"],[800,"#d8c86d"],[1600,"#c18f4f"],[3000,"#8d5a34"],[4500,"#a7a2a0"],[6000,"#ffffff"]];
/* ---------- rivers: one height window for every river (scroll up for the high sources), the story of each river, and a
   comparison of the rivers you pick ---------- */
/* the height scale picked by hand (null: automatic) */let yl={lo:null,hi:null};
const YSPAN=1700;let yv={span:YSPAN,base:0},picks=["Amazon","Congo","Zambezi","Mississippi"];
const STORY={
 Amazon:{h:"The Amazon drops about 5,000 m in the Andes, then only about 110 m over the 3,600 km from Iquitos to the sea. That gentle slope is why ocean-going ships can sail all the way up to Iquitos in Peru.",nav:[["Iquitos","Amazon mouth","Ocean-going ships reach Iquitos"]],lab:[["Pucallpa","Pucallpa"],["Iquitos","Iquitos 110 m"],["Manaus","Manaus 20 m · Meeting of the Waters"]]},
 Congo:{h:"The Congo crosses its basin as a calm highway, then falls about 270 m through the 32 rapids of the Livingstone Falls between Kinshasa and Matadi. No boat could get past them, so the interior was cut off from the sea; a railway from Matadi to Kinshasa was built to go round them.",nav:[["Kisangani","Malebo Pool","River boats, about 1,700 km"],["Matadi","Congo mouth","Ships from the sea"]],spans:[["Livingstone Falls top","Matadi","Livingstone Falls: −270 m, 32 rapids"]],lab:[["Kisangani","Kisangani"],["Mbandaka","Mbandaka"],["Malebo Pool","Kinshasa"]]},
 Zambezi:{h:"A staircase: a high plateau, the 108 m drop of Victoria Falls, then two dams, Kariba and Cahora Bassa, that turned steps of the river into long lakes.",nav:[["Chavuma","Ngonye","Barotse floodplain: local boats"],["Lake Kariba head","Kariba Dam top","Ferries on Lake Kariba"],["Caia","Zambezi mouth","Small boats; shifting sandbanks"]]},
 Mississippi:{h:"The Mississippi starts only 450 m above the sea, at Lake Itasca, and slopes gently for more than 3,700 km. Locks and dams let barges travel all the way up to Minneapolis.",nav:[["Minneapolis locks bottom","Mississippi mouth","Barges, through locks"]],lab:[["St. Louis","St. Louis"],["New Orleans","New Orleans"]]},
 Nile:{h:"The Nile leaves Lake Victoria about 1,130 m up and loses half of that height in Uganda, at the Karuma and Murchison Falls, before its long, gentle run through the swamps and the desert to the Mediterranean.",nav:[["Nimule","Merowe Dam top","River boats, South Sudan to Khartoum"],["Lake Nubia","Aswan High Dam top","Ferries on Lake Nasser"],["Aswan High Dam bottom","Nile mouth","Cruise boats and barges to the sea"]],lab:[["Khartoum","Khartoum"],["Cairo","Cairo"]]},
 Niger:{h:"The Niger rises only about 745 m up, close to the Atlantic, yet flows inland first, across the Sahel. Its slope is so gentle that it spreads into the Inner Niger Delta, a vast wetland around Mopti and Lake Debo.",nav:[["Bamako","Gao","River boats in the flood season"],["Jebba Dam bottom","Niger mouth","Barges to the sea"]],lab:[["Bamako","Bamako"],["Timbuktu","Timbuktu"],["Niamey","Niamey"]]},
 Yangtze:{h:"The Yangtze falls more than 5,000 m from the Tibetan Plateau. A chain of giant dams now holds its upper course in steps, and below the dams at Yichang it falls only about 40 m to the sea.",nav:[["Xiangjiaba Dam bottom","Yangtze mouth","Ships through the Three Gorges locks; ocean ships to Nanjing"]],lab:[["Chongqing","Chongqing"],["Wuhan","Wuhan"]]},
 Danube:{h:"The Danube starts in Germany's Black Forest and loses most of its height before Vienna. Its Iron Gates gorge, once full of dangerous rapids, is now drowned behind two dams.",nav:[["Regensburg","Danube mouth","Barges and river cruises, through locks"]],lab:[["Vienna","Vienna"],["Budapest","Budapest"],["Belgrade","Belgrade"]]},
 Ganges:{h:"The Ganges falls about 3,600 m in the Himalaya before Haridwar, then crawls across the plain: in over 2,000 km from Haridwar to the sea it drops less than 300 m.",nav:[["Varanasi","Hooghly mouth","National Waterway 1, through the Farakka lock"]],lab:[["Haridwar","Haridwar"],["Varanasi","Varanasi"],["Kolkata","Kolkata"]]},
 Orange:{h:"The Orange begins 3,000 m up in Lesotho, crosses South Africa's high plateau, and drops off its edge at the Augrabies Falls before crossing the desert to the Atlantic. Too shallow and broken by falls, it carries no boats to speak of.",lab:[["Upington","Upington"]]}};
/* can boats get past each dam? 🔒 a lock or ship lift; ⛔ no way through. (first words of the dam's name in the river data) */
const DAMPASS=[["Nalubaale","no"],["Bujagali","no"],["Merowe","no"],["Aswan High","no"],["Old Aswan","lock"],["Kariba","no"],["Cahora Bassa","no"],["Markala","lock"],["Kainji","lock"],["Jebba","lock"],
 ["Wudongde","no"],["Baihetan","no"],["Xiluodu","no"],["Xiangjiaba","lift"],["Three Gorges","lock"],["Gezhouba","lock"],["Gabcikovo","lock"],["Iron Gate I ","lock"],["Iron Gate II","lock"],["Tehri","no"],["Farakka","lock"],
 ["Gariep","no"],["Vanderkloof","no"],["St. Anthony Falls","closed"],["Minneapolis locks","lock"],["Keokuk","lock"]];
function damPass(n){n=String(n||"");const d=DAMPASS.find(([k])=>n.startsWith(k)||n.startsWith(k.trim()+" ")||(k.trim()===n.split(" (")[0].replace(/ (top|bottom)$/,"")));return d?d[1]:null}
const PASSMARK={lock:" 🔒",lift:" 🔒",no:" ⛔",closed:" ⛔"};
const findPt=(P,name)=>P.find(p=>p.n&&p.n.toLowerCase().startsWith(name.toLowerCase()));
/* the biggest single drop in the published levels: falls, rapids or a dam */
const nmOf=n=>{const m=String(n).match(/([A-Z][\w'’.-]*(?: [A-Z][\w'’.-]*)* (?:Falls|Rapids|rapids|Dam|Barrage|Gorge))/);return m?m[1]:String(n).split(" (")[0].replace(/\s+(top|lip|headwater|gorge top)$/i,"")};
function bigDrop(name){const C=RP&&RP[name];if(!C)return null;let best=null;for(let i=0;i+1<C.length;i++){if(!/_top$/.test(C[i][4]||""))continue;const d=C[i][3]-C[i+1][3];if(!best||d>best.d)best={d,n:nmOf(C[i][0]),full:C[i][0]}}return best}
function chartSVG(){const Ps=lines.filter(L=>L.P&&L.P.length);if(!Ps.length)return"";const rv=Ps.some(L=>L.river);
 const W=900,H=rv&&lines.length===1?214:190,ml=50,mr=10,mt=12,mb=lines.length===1?46:22;
 const comp=lines.length>1,xKey=p=>comp?p.fromSea:p.km;if(comp)Ps.forEach(L=>{const T=L.P[L.P.length-1].km;L.P.forEach(p=>p.fromSea=T-p.km)});
 let e0=Infinity,e1=-Infinity,kmax=0,dmax=-Infinity;Ps.forEach(L=>L.P.forEach(p=>{e0=Math.min(e0,p.e);e1=Math.max(e1,p.e);kmax=Math.max(kmax,xKey(p))}));dmax=e1;
 if(rv&&yv.span!=="all"){e0=yv.base;e1=yv.base+yv.span}else{e0=Math.min(0,e0);e1=Math.max(e1,e0+200);const pad=(e1-e0)*.08;e1+=pad;if(e0<0)e0-=pad*.5}
 {let dmin=Infinity;Ps.forEach(L=>L.P.forEach(p=>{dmin=Math.min(dmin,p.e)}));chartSVG.dmin=dmin}
 if(!rv&&!comp){if(yl.lo!=null)e0=yl.lo;if(yl.hi!=null)e1=yl.hi;if(e1<e0+50)e1=e0+50}
 chartSVG.dmax=dmax;
 const X=k=>ml+(comp?(1-k/kmax):k/kmax)*(W-ml-mr),Y=e=>mt+(1-(e-e0)/(e1-e0))*(H-mt-mb);
 const yz=Y(0);let defs='<defs><clipPath id="gfxsClip"><rect x="'+ml+'" y="'+mt+'" width="'+(W-ml-mr)+'" height="'+(H-mt-mb)+'"/></clipPath><linearGradient id="gfxsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe8fb"/><stop offset="1" stop-color="#f4fbff"/></linearGradient>';
 defs+='<linearGradient id="gfxsLand" gradientUnits="userSpaceOnUse" x1="0" y1="'+Y(e1)+'" x2="0" y2="'+Y(e0)+'">'+STOPS.slice().reverse().map(([e,c])=>{const o=(e1-e)/(e1-e0);return o<0||o>1?"":'<stop offset="'+o.toFixed(4)+'" stop-color="'+c+'"/>'}).join("")+'</linearGradient>';
 defs+='<linearGradient id="gfxsSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb3e8"/><stop offset="1" stop-color="#0d3278"/></linearGradient><linearGradient id="gfxsRock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8916a"/><stop offset=".55" stop-color="#8a6243"/><stop offset="1" stop-color="#4e3424"/></linearGradient></defs>';
 let s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Cross-section">'+defs+'<rect x="'+ml+'" y="'+mt+'" width="'+(W-ml-mr)+'" height="'+(H-mt-mb)+'" fill="url(#gfxsSky)"/>';
 const step=niceStep((e1-e0)/4);for(let e=Math.ceil(e0/step)*step;e<=e1+1e-6;e+=step){s+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+Y(e)+'" y2="'+Y(e)+'" stroke="#000" stroke-opacity=".08"/><text x="'+(ml-5)+'" y="'+(Y(e)+4)+'" text-anchor="end" font-size="11" fill="#5b6575">'+fmtE(e)+'</text>'}
 const kstep=niceStep(kmax/6);for(let k=0;k<=kmax+1;k+=kstep)s+='<text x="'+X(k)+'" y="'+(H-mb+13)+'" text-anchor="middle" font-size="10.5" fill="#5b6575">'+Math.round(k).toLocaleString()+(k===0?(comp?" km to the sea":" km"):"")+'</text>';
 const lbl=(x,y,t,o)=>{o=o||{};const anc=x>W-mr-120?"end":x<ml+70?"start":"middle";return'<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="'+anc+'" font-size="'+(o.fs||10)+'" font-weight="'+(o.fw||700)+'" fill="'+(o.c||"#1d2433")+'" stroke="#fff" stroke-width="2.6" paint-order="stroke">'+esc(t)+'</text>'};
 const inWin=e=>e>=e0-1&&e<=e1+1;
 /* where a line leaves the top of the window: an arrow says how high it goes, and that you can scroll up */
 const overTop=(L,col)=>{const P=L.P;if(!rv||yv.span==="all")return"";const mx=Math.max(...P.map(p=>p.e));if(mx<=e1)return"";let i=P.findIndex(p=>p.e<=e1);if(i<0)i=P.length-1;const x=X(xKey(P[i]));
  return'<path d="M'+(x-5).toFixed(1)+','+(mt+11)+' l5,-7 l5,7z" fill="'+(col||"#8a5a2b")+'"/>'+lbl(x+(comp?-8:8),mt+11,"up to "+fmtE(mx)+(comp?"":" — scroll up to see it"),{c:col||"#5b3a17",fs:10.5})};
 if(!comp){const L=Ps[0],P=L.P,St=L.river&&STORY[L.name];
  const inLake=new Set();(L.lk||[]).forEach(k=>{for(let i=k.i;i<=k.j;i++)inLake.add(i)});
  if(e0<0){let w="M"+X(0)+","+yz;P.forEach((p,i)=>{w+="L"+X(p.km).toFixed(1)+","+Y(inLake.has(i)||p.c?0:Math.min(0,p.e)).toFixed(1)});w+="L"+X(P[P.length-1].km)+","+yz+"Z";s+='<path d="'+w+'" fill="url(#gfxsSea)" clip-path="url(#gfxsClip)"/>'}
  let top="";P.forEach((p,i)=>{top+=(i?"L":"M")+X(p.km).toFixed(1)+","+Y(p.e).toFixed(1)});
  s+='<g clip-path="url(#gfxsClip)"><path d="'+top+"L"+X(P[P.length-1].km)+","+(H-mb)+"L"+X(0)+","+(H-mb)+'Z" fill="url(#gfxsRock)"/>';
  /* the sea always shows: a thin water layer just under sea level along every stretch of sea, even where it is only a
     few metres deep (the rock would otherwise hide it); land above sea level still rises above it */
  if(e0<0){let sw="",prev=null;const sea=i=>P[i].e<0&&!P[i].c&&!inLake.has(i);
   for(let i=0;i<P.length;i++){if(!sea(i))continue;let a=i;while(i+1<P.length&&sea(i+1))i++;
    const xa=a>0?(X(P[a-1].km)+X(P[a].km))/2:X(P[a].km),xb=i<P.length-1?(X(P[i].km)+X(P[i+1].km))/2:X(P[i].km);
    sw+='<rect x="'+xa.toFixed(1)+'" y="'+yz.toFixed(1)+'" width="'+Math.max(1.5,xb-xa).toFixed(1)+'" height="3.2" fill="#3f9fe0"/>'}
   s+=sw}
  /* the coloured land edge only where the ground is above the sea: no green on a sea floor at -2 m */
  {let land="",run=false,dep="",dr=false;P.forEach((p,i)=>{if(p.e>=0&&!inLake.has(i)){land+=(run?"L":"M")+X(p.km).toFixed(1)+","+Y(p.e).toFixed(1);run=true}else run=false;
    /* land below sea level (a depression): a plain land-green edge, not the colour scale's below-sea blue */
    const lo=p.e<0&&p.c&&!inLake.has(i),nb=i>0&&P[i-1].e<0&&P[i-1].c&&!inLake.has(i-1);if(lo||(p.e>=0&&nb)){dep+=(dr?"L":"M")+X(p.km).toFixed(1)+","+Y(p.e).toFixed(1);dr=lo}else dr=false});
   s+=(land?'<path d="'+land+'" fill="none" stroke="url(#gfxsLand)" stroke-width="4" stroke-linejoin="round"/>':"")+(dep?'<path d="'+dep+'" fill="none" stroke="#6f9a4a" stroke-width="4" stroke-linejoin="round"/>':"")+'<path d="'+top+'" fill="none" stroke="#2a1c10" stroke-width=".8" stroke-opacity=".6"/></g>'};
  /* depressions: each stretch of land below sea level, named where it is a known one, with its lowest point */
  {const runs=[];let cur=null;P.forEach((p,i)=>{const lo=p.e<0&&p.c&&!inLake.has(i);if(lo){if(!cur){cur={i,j:i,lo:i};runs.push(cur)}else{cur.j=i;if(p.e<P[cur.lo].e)cur.lo=i}}else cur=null});
   runs.forEach(r=>{const q=P[r.lo];if(q.e>-5||X(P[r.j].km)-X(P[r.i].km)<6||!inWin(q.e))return;let nm="",best=1e9;
    DEPRESSIONS.forEach(([n,lon,lat,rad])=>{const d=d3.geoDistance(q.ll,[lon,lat])*R_KM;if(d<rad&&d<best){best=d;nm=n}});
    const t=(nm||"Land below sea level")+" · "+fmtE(q.e),xm=X(q.km),yy=Y(q.e)+14;
    s+='<circle cx="'+xm.toFixed(1)+'" cy="'+Y(q.e).toFixed(1)+'" r="2.6" fill="#5b3a17"/>'+lbl(xm,Math.min(H-mb-4,yy),t,{c:"#5b3a17",fs:10.5,fw:800})})}
  /* lakes: the water up to the lake's level, its surface, and its name and height */
  if(L.lk&&L.lk.length){s+='<g clip-path="url(#gfxsClip)">';const LX=[];
   L.lk.forEach(k=>{const yl=Y(k.lv),xa=X(P[k.i].km),xb=X(P[k.j].km),pad=(xb-xa<2)?1:0;
    let w="M"+(xa-pad).toFixed(1)+","+yl.toFixed(1);for(let i=k.i;i<=k.j;i++)w+="L"+X(P[i].km).toFixed(1)+","+Y(Math.min(P[i].e,k.lv)).toFixed(1);w+="L"+(xb+pad).toFixed(1)+","+yl.toFixed(1)+"Z";
    if(k.syn){let bd="";for(let i=k.i;i<=k.j;i++)bd+=(bd?"L":"M")+X(P[i].km).toFixed(1)+","+Y(Math.min(P[i].e,k.lv)).toFixed(1);s+='<path d="'+bd+'" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="4 3"/>'}
    s+='<path d="'+w+'" fill="#3d8fd6" fill-opacity=".72"/><line x1="'+(xa-pad).toFixed(1)+'" x2="'+(xb+pad).toFixed(1)+'" y1="'+yl.toFixed(1)+'" y2="'+yl.toFixed(1)+'" stroke="#1f6fb8" stroke-width="2"/>'});
   s+='</g>';
   const LN=new Set();L.lk.slice().sort((p,q)=>(q.b-q.a)-(p.b-p.a)).forEach(k=>{if(!k.n||!inWin(k.lv)||LN.has(k.n))return;LN.add(k.n);const xa=X(k.a),xb=X(k.b),xm=(xa+xb)/2,t=k.n,tw=t.length*5.4;
    const L0=xm-tw/2,R0=xm+tw/2;if(LX.some(q=>L0<q[1]+6&&R0>q[0]-6))return;LX.push([L0,R0]);
    s+=lbl(xm,Y(k.lv)-6,t,{c:"#1f5f9e",fs:10.5,fw:800})})}
  /* navigable stretches: a pale band along the bottom and a short note */
  if(St&&St.nav)St.nav.forEach(([a,b,t])=>{const A=findPt(P,a),B=findPt(P,b);if(!A||!B)return;const xa=X(A.km),xb=X(B.km);s+='<line x1="'+xa.toFixed(1)+'" x2="'+xa.toFixed(1)+'" y1="'+(Y(e0+(e1-e0)*.42)+4)+'" y2="'+(H-mb-7)+'" stroke="#2f7fd0" stroke-dasharray="3 3" stroke-opacity=".6"/><rect x="'+xa.toFixed(1)+'" y="'+(H-mb-7)+'" width="'+Math.max(2,xb-xa).toFixed(1)+'" height="7" fill="#2f7fd0" fill-opacity=".55" rx="2"/>'+(xb-xa>60?lbl(xa+4,Y(e0+(e1-e0)*.42),"⛴ "+t+" →",{c:"#1f5f9e",fs:10.5,fw:800}):"")});
  const placed=[];const free=(x,w)=>{if(placed.some(q=>Math.abs(q-x)<w))return false;placed.push(x);return true};
  /* spans (a whole set of rapids) get a bracket and a name */
  if(St&&St.spans)St.spans.forEach(([a,b,t])=>{const A=findPt(P,a),B=findPt(P,b);if(!A||!B||!inWin(A.e))return;const xa=X(A.km),xb=Math.max(X(B.km),xa+6),y=Math.max(mt+24,Y(A.e)-12);
   s+='<path d="M'+xa.toFixed(1)+','+(y+5)+' v-5 H'+xb.toFixed(1)+' v5" fill="none" stroke="#b3261e" stroke-width="1.6"/>'+lbl(Math.min(xb,W-mr-2),y-4,t,{c:"#b3261e",fs:10.5,fw:800});placed.push(xa,xb)});
  /* falls, rapids and dams with a real drop */
  if(L.river)P.forEach((p,i)=>{if(!p.n||!/_top$/.test(p.k||"")||!inWin(p.e))return;const nx=P.slice(i+1).find(q=>q.n);if(!nx||p.e-nx.e<15)return;if(St&&St.spans&&St.spans.some(sp=>p.n.toLowerCase().startsWith(sp[0].toLowerCase())))return;const x=X(p.km);if(!free(x,60))return;
   const nm=nmOf(p.n),pass=p.k==="dam_top"?damPass(p.n):null;s+=lbl(x,Y(p.e)-7,nm+" −"+Math.round(p.e-nx.e)+" m"+(pass?PASSMARK[pass]:""))});
  if(St&&St.lab)St.lab.forEach(([a,t])=>{const A=findPt(P,a);if(!A||!inWin(A.e))return;const x=X(A.km);if(!free(x,50))return;s+='<circle cx="'+x.toFixed(1)+'" cy="'+Y(A.e).toFixed(1)+'" r="3" fill="#1d2433"/>'+lbl(x,Y(A.e)-8,t,{fw:700,c:"#33415a"})});
  if(e0<0)s+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+yz+'" y2="'+yz+'" stroke="#1f63a8" stroke-dasharray="4 3" stroke-opacity=".6"/>';
  if(L.river){s+=overTop(L);const src=P[0];if(inWin(src.e))s+=lbl(X(src.km)+4,Y(src.e)-8,"Source "+fmtE(src.e),{fw:800,c:"#3b2a1a",fs:11})}
  else{let hi=P[0],lo=P[0];P.forEach(p=>{if(p.e>hi.e)hi=p;if(p.e<lo.e)lo=p});
   s+=lbl(Math.max(ml+34,X(hi.km)),Y(hi.e)-5,"▲ "+fmtE(hi.e),{fs:11.5,fw:800,c:"#3b2a1a"});
   if(lo.e<-50)s+='<text x="'+X(lo.km)+'" y="'+(Y(lo.e)+14)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff">▼ '+fmtE(lo.e)+'</text>';
   s+='<text x="'+(ml+4)+'" y="'+(H-mb-6)+'" font-size="12" font-weight="800" fill="#c0392b">A</text><text x="'+(W-mr-4)+'" y="'+(H-mb-6)+'" text-anchor="end" font-size="12" font-weight="800" fill="#c0392b">B</text>'}
  /* the landforms the line crosses: a name over each mountain range, plateau or plain, in the water for seas and trenches */
  {const tot=P[P.length-1].km||1,LFX=[];(L.lf||[]).slice().sort((p,q)=>(q.b-q.a)-(p.b-p.a)).forEach(g=>{if(g.k==="lake"&&(L.lk||[]).some(k=>k.n&&k.a<g.b&&k.b>g.a))return;/* the lake is already named with its level and depth */const a=X(g.a),b=X(g.b),w=b-a,nm=g.n,tw=nm.length*5.6;if(w<Math.max(18,tot?0:0)||(w<tw*.55&&g.k!=="trench"))return;const xm=(a+b)/2,L0=xm-tw/2-5,R0=xm+tw/2+5,YY=g.k==="sea"||g.k==="trench"||g.k==="lake"?Y(g.lo):Y(Math.min(g.hi,e1));if(LFX.some(q=>L0<q[1]&&R0>q[0]&&Math.abs(q[2]-YY)<16))return;LFX.push([L0,R0,YY]);
   if(g.k==="sea"||g.k==="trench"||g.k==="lake"){const yy=g.k==="trench"?Y(g.lo)-8:Math.min(Y(g.lo)-6,Math.max(yz+13,(yz+Y(g.lo))/2));if(!inWin(g.lo)&&g.k==="trench")return;s+='<text x="'+xm.toFixed(1)+'" y="'+yy.toFixed(1)+'" text-anchor="middle" font-size="10.5" font-style="italic" font-weight="700" fill="'+(g.k==="trench"?"#fff":"#1f4f7a")+'">'+esc(nm)+'</text>'}
   else{const yy=Math.max(mt+24,Y(Math.min(g.hi,e1))-10);s+='<path d="M'+(a+2).toFixed(1)+','+(yy+4).toFixed(1)+'v-3H'+(b-2).toFixed(1)+'v3" fill="none" stroke="#6b4a2a" stroke-opacity=".55"/><text x="'+xm.toFixed(1)+'" y="'+(yy-1).toFixed(1)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="#5b3a17">'+esc(nm)+'</text>'}})}
  /* every country or territory the line crosses is named, however short the stretch: names that would collide drop to a second row */
  {const rowEnd=[-1e9,-1e9];(L.segs||[]).forEach(g=>{if(!g.c&&!g.w)return;const a=X(g.a),b=Math.max(X(g.b),a+2),nm=g.c?cname(g.c):g.w;if(!nm)return;
   /* a stretch of water too short to see is not named (a bay between two headlands) */
   if(!g.c&&b-a<10)return;
   s+='<rect x="'+a.toFixed(1)+'" y="'+(H-mb+15)+'" width="'+(b-a).toFixed(1)+'" height="3" fill="'+(g.c?"#8a5a2b":"#2f7fd0")+'" fill-opacity=".45"/>';
   const w=nm.length*5.6+6,xm=Math.max(w/2,(a+b)/2);let r=rowEnd.findIndex(e=>xm-w/2>e+4);if(r<0)return;rowEnd[r]=xm+w/2;
   s+='<text class="gf-xs-cty" x="'+xm.toFixed(1)+'" y="'+(H-mb+28+r*12)+'" text-anchor="middle" font-size="10.5" font-weight="700"'+(g.c?' fill="#5b3a17"':' fill="#1f5f9e" font-style="italic"')+'>'+esc(nm)+'</text>'})}}
 else{s+='<g clip-path="url(#gfxsClip)">';Ps.forEach(L=>{let d="";L.P.forEach((p,i)=>{d+=(i?"L":"M")+X(xKey(p)).toFixed(1)+","+Y(p.e).toFixed(1)});s+='<path d="'+d+'" fill="none" stroke="'+L.c+'" stroke-width="2.6"/>'});s+='</g>';
  /* each river's name where its line enters the window, and its biggest drop */
  Ps.forEach(L=>{const i=Math.max(0,L.P.findIndex(p=>p.e<=e1)),p=L.P[i];s+=lbl(X(xKey(p))+4,Math.max(mt+22,Y(p.e)-4),L.name,{c:L.c,fs:11,fw:800});s+=overTop(L,L.c);
   const bd=bigDrop(L.name);if(bd&&bd.d>=40){const q=findPt(L.P,bd.full);if(q&&inWin(q.e))s+='<circle cx="'+X(xKey(q)).toFixed(1)+'" cy="'+Y(q.e).toFixed(1)+'" r="3.5" fill="#fff" stroke="'+L.c+'" stroke-width="2"/>'}})}
 s+='<rect class="gf-xs-hit" x="'+ml+'" y="'+mt+'" width="'+(W-ml-mr)+'" height="'+(H-mt-mb)+'" fill="transparent"/><g class="gf-xs-cur" pointer-events="none"></g></svg>';chartSVG.X=X;chartSVG.Y=Y;chartSVG.comp=comp;chartSVG.W=W;chartSVG.H=H;chartSVG.kmax=kmax;chartSVG.ml=ml;chartSVG.mr=mr;chartSVG.rv=rv;return s}
/* the comparison table: the numbers behind the lines */
function cmpTable(){const Ps=lines.filter(L=>L.P&&L.P.length);if(Ps.length<2)return"";
 const at=(L,k)=>{let b=null,bd=1e9;L.P.forEach(p=>{const d=Math.abs(p.fromSea-k);if(d<bd){bd=d;b=p}});return b&&bd<150?fmtE(b.e):"—"};
 return'<table class="gf-xs-tab"><tr><th>River</th><th>Length</th><th>Source</th><th>1,000 km from the sea</th><th>Biggest drop</th></tr>'+Ps.map(L=>{const T=L.P[L.P.length-1].km,bd=bigDrop(L.name);
  return'<tr><td><i style="background:'+L.c+'"></i>'+esc(L.name)+'</td><td>'+Math.round(T/10)*10+' km</td><td>'+fmtE(L.P[0].e)+'</td><td>'+at(L,1000)+'</td><td>'+(bd?esc(bd.n)+" "+Math.round(bd.d)+" m":"—")+'</td></tr>'}).join("")+'</table>'}
function niceStep(v){const p=Math.pow(10,Math.floor(Math.log10(Math.max(1e-9,v)))),m=v/p;return(m<1.5?1:m<3.5?2:m<7.5?5:10)*p}
const fmtE=e=>(e<0?"−":"")+Math.abs(Math.round(e)).toLocaleString()+" m";
/* lines drawn with the pens or the geometry set can be cut too */
const KINDS={compass:"Circle",ring:"Range ring",line:"Straight line",rect:"Rectangle",oval:"Oval"};
function myInk(){try{return(stats.kit&&stats.kit.ink||[]).map((s,i)=>({s,i})).filter(o=>o.s.p&&o.s.p.length>1&&o.s.t!=="geoText")}catch(e){return[]}}
function myLinesOpts(){const L=myInk();if(!L.length)return'<option value="">No drawings yet: draw one with the Pens or the Geometry set</option>';return'<option value="">Pick one of your drawings…</option>'+L.slice(-20).reverse().map(o=>{const g=o.s.g,k=g?(g.m==="poly"?(o.s.pen?"Pen shape":"Free shape"):KINDS[g.m]||"Shape"):o.s.t==="geoDash"?"Latitude / longitude line":"Pen line";return'<option value="d'+o.i+'">'+esc(k+(o.s.lab?" · "+o.s.lab:"")+(o.s.tx?" · "+o.s.tx:""))+'</option>'}).join("")}
/* the two lists of lines to cut along: ready-made ones, and the user's own drawings */
let SRC="pre";
function renderPanel(){if(!panel)return;const nMine=myInk().length;const presetOpts=SRC==="mine"?myLinesOpts():'<option value="">Pick a ready-made line…</option>'+PRESETS.map((p,i)=>'<option value="p'+i+'">'+esc(p.n)+'</option>').join("")+'<optgroup label="Rivers, source to sea">'+Object.keys(RIVERS).map(k=>'<option value="r'+k+'">'+k+'</option>').join("")+'</optgroup><option value="cmp">Compare rivers (pick which)</option>';
 const srcTabs='<span class="gf-xs-seg gf-xs-tabs"><button type="button" data-src="pre" class="'+(SRC==="pre"?"on":"")+'">Ready-made lines</button><button type="button" data-src="mine" class="'+(SRC==="mine"?"on":"")+'">Your drawings'+(nMine?' <small>'+nMine+'</small>':'')+'</button></span>';
 const rvNow=lines.some(L=>L.river),cmpNow=lines.length>1||title==="Rivers compared";
 const hctl=rvNow?'<div class="gf-xs-hctl"><span class="gf-xs-seg gf-xs-hz">'+[[YSPAN,"Same scale for every river (0–1,700 m)"],[250,"Lowlands (0–250 m)"],["all","Whole river"]].map(([v,t])=>'<button type="button" data-hz="'+v+'" class="'+(String(yv.span)===String(v)?"on":"")+'">'+t+'</button>').join("")+'</span>'+(yv.span!=="all"?'<button type="button" class="gf-xs-up" data-sc="1" title="Scroll up (or use the mouse wheel over the chart)">▲ higher</button><button type="button" class="gf-xs-up" data-sc="-1" title="Scroll down">▼ lower</button>':'')+'</div>':'';
 const chips=cmpNow?'<div class="gf-xs-pick">'+Object.keys(RIVERS).map(k=>'<button type="button" data-rv="'+k+'" class="'+(picks.includes(k)?"on":"")+'" style="--c:'+RIVERS[k].c+'">'+k+'</button>').join("")+'</div>':'';
 const yctl=!rvNow&&!cmpNow&&lines.length&&lines[0].P?'<div class="gf-xs-yctl"><span>Height from</span><input type="number" step="100" data-yl="lo" placeholder="auto" value="'+(yl.lo==null?'':yl.lo)+'"><span>to</span><input type="number" step="100" data-yl="hi" placeholder="auto" value="'+(yl.hi==null?'':yl.hi)+'"><span>m</span><button type="button" data-yf="fit" title="Start the chart just below the lowest point, so small ups and downs show">Fit to the land</button><button type="button" data-yf="sea" title="From sea level up">From sea level</button></div>':'';
 const hsw=hist.length?'<div class="gf-xs-hist"><span>Your lines</span>'+hist.map((h,i)=>'<button type="button" data-hi="'+i+'" class="'+(lines.includes(h)?'on':'')+'" style="--c:'+h.c+'" title="'+esc(h.title)+'"><i></i>'+(i+1)+'</button>').join('')+(hist.length>1?'<button type="button" data-hstep="-1" title="Previous line">‹</button><button type="button" data-hstep="1" title="Next line">›</button>':'')+'<small>'+hist.length+' of '+MAXL+(hist.length>=MAXL?' · a new line replaces the oldest':'')+'</small></div>':'';
 const body=!DEM?'<div class="gf-xs-help">Loading heights…</div>':lines.length&&lines[0].P?(note?'<p class="gf-xs-note">'+esc(note)+'</p>':'')+(lines.length===1&&lines[0].edit?'<p class="gf-xs-edhint">'+(lines[0].edit.kind==="line"?"Drag A or B on the map to move an end.":"Drag any point of your path on the map to reshape it.")+'</p>':'')+chips+hctl+chartSVG()+((lines[0]&&lines[0].lk||[]).some(k=>k.n)?'<p class="gf-xs-lknote">Lake depths and lake beds are approximate.</p>':'')+yctl+(cmpNow?cmpTable():''):'<div class="gf-xs-help'+(armed?' armed':'')+'">'+(armed?(shape==="line"?"Drag across the map to draw a straight line.":"Drag across the map to draw your own path."):"Pick a ready-made line, or press Draw.")+'</div>';
 const drawUI=armed||!lines.length;
 {const em=!(lines.length&&lines[0].P),was=panel.classList.contains("gf-xs-empty");if(was&&!em&&panel.style.width){const hw=panel.parentNode.getBoundingClientRect().width,l=parseFloat(panel.style.left)||10;panel.style.width=Math.max(panel.getBoundingClientRect().width,Math.min(860,hw-68,hw-l-10))+"px"}panel.classList.toggle("gf-xs-empty",em);try{G().host.classList.toggle("gf-xs-armed",!!armed)}catch(e){}}panel.innerHTML='<div class="gf-xs-top"><b>✂ '+esc(title||"Cross-section")+'</b>'+(drawUI?'<span class="gf-xs-seg"><button type="button" data-sh="line" class="'+(shape==="line"?"on":"")+'">Straight</button><button type="button" data-sh="free" class="'+(shape==="free"?"on":"")+'">Freehand</button></span>':'')+
  (window.gfShovelDig?'<button type="button" class="gf-xs-dig" title="Dig straight through the Earth instead">⛏ Dig through</button>':'')+'<button type="button" class="gf-xs-go'+(armed?" on":"")+'">'+(armed?"Drawing… drag on the map":drawUI?"✏ Draw":"✏ Draw your own")+'</button>'+(armed?'<button type="button" class="gf-xs-exit" title="Stop drawing (Esc)">✕ Exit</button>':'')+(!armed&&lines.length?'<button type="button" class="gf-xs-clear" title="Clear the chart and remove the line from the map">✕ Clear line</button>':'')+'<span class="gf-xs-srcbox">'+srcTabs+'<select class="gf-xs-pre">'+presetOpts+'</select></span><button type="button" class="gf-xs-min" title="Fold">▾</button><button type="button" class="gf-xs-x" title="Close">×</button></div><div class="gf-xs-body">'+hsw+body+
  '<span class="gf-xs-rz w" title="Drag to make it wider or narrower"></span><span class="gf-xs-rz h" title="Drag to make the chart taller or shorter"></span><div class="gf-xs-src">'+(rvNow?'River profiles follow each river\'s own course, with its water level from published figures for lakes, falls, rapids and dams, estimated in between. Blue bars along the bottom: stretches boats can use. At a dam, 🔒 boats get past (locks or a ship lift), ⛔ no way through. ':'')+'Heights: NOAA ETOPO 2022 and AWS Terrain Tiles (open data); peaks read a little low. Lakes: HydroLAKES (lakes of 50 km² or more, long-term average level). Where the height data has no lake bed, the bed is an approximate bowl (dashed) as deep as the lake\'s published greatest depth, or twice its mean depth. Height is stretched far more than length.</div></div>';
 panel.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{shape=b.dataset.sh;armed=true;renderPanel()});
 panel.querySelector(".gf-xs-go").onclick=()=>{armed=!armed;renderPanel()};
 {const ex=panel.querySelector(".gf-xs-exit");if(ex)ex.onclick=()=>{armed=false;drawing=null;renderPanel()};const cl=panel.querySelector(".gf-xs-clear");if(cl)cl.onclick=clearLine}
 panel.querySelector(".gf-xs-x").onclick=stop;{const dg=panel.querySelector(".gf-xs-dig");if(dg)dg.onclick=()=>window.gfShovelDig()}panel.querySelector(".gf-xs-min").onclick=()=>panel.classList.toggle("mini");
 panel.querySelector(".gf-xs-pre").onchange=e=>{if(e.target.value)pick(e.target.value)};
 panel.querySelectorAll("[data-hi]").forEach(b=>b.onclick=()=>showHist(+b.dataset.hi));
 panel.querySelectorAll("[data-hstep]").forEach(b=>b.onclick=()=>{const c=lines.length===1?hist.indexOf(lines[0]):hist.length;const n=hist.length;showHist(((c<0?n-1:c)+(+b.dataset.hstep)+n)%n)});
 panel.querySelectorAll("[data-src]").forEach(b=>b.onclick=()=>{SRC=b.dataset.src;renderPanel();const sel=panel.querySelector(".gf-xs-pre");if(sel&&(myInk().length||SRC==="pre"))try{sel.focus()}catch(e){}});
 panel.querySelectorAll("[data-yl]").forEach(inp=>{["keydown","keyup","keypress"].forEach(t=>inp.addEventListener(t,ev=>ev.stopPropagation()));inp.onchange=()=>{const v=inp.value.trim()===""?null:+inp.value;yl[inp.dataset.yl]=v!=null&&isFinite(v)?v:null;renderPanel()}});
 panel.querySelectorAll("[data-yf]").forEach(b=>b.onclick=()=>{if(b.dataset.yf==="sea"){yl={lo:Math.min(0,Math.floor((chartSVG.dmin||0)/100)*100),hi:null}}else{const lo=chartSVG.dmin||0,hi=chartSVG.dmax||0,pad=Math.max(50,(hi-lo)*.08);yl={lo:Math.floor((lo-pad)/100)*100,hi:Math.ceil((hi+pad)/100)*100}}renderPanel()});
 panel.querySelectorAll("[data-hz]").forEach(b=>b.onclick=()=>{const v=b.dataset.hz;yv={span:v==="all"?"all":+v,base:0};renderPanel()});
 const scroll=dir=>{if(yv.span==="all")return;const mx=chartSVG.dmax||0;yv.base=Math.max(0,Math.min(Math.max(0,mx-yv.span*.6),yv.base+dir*yv.span*.25));renderPanel()};
 panel.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>scroll(+b.dataset.sc));
 panel.querySelectorAll("[data-rv]").forEach(b=>b.onclick=()=>{const k=b.dataset.rv,i=picks.indexOf(k);if(i>=0){if(picks.length>1)picks.splice(i,1)}else picks.push(k);pick("cmp",true)});
 {const sv=panel.querySelector("svg");if(sv&&lines.some(L=>L.river))sv.addEventListener("wheel",e=>{if(yv.span==="all")return;e.preventDefault();e.stopPropagation();scroll(e.deltaY<0?1:-1)},{passive:false})}
 const svg=panel.querySelector("svg");if(svg){const hit=svg.querySelector(".gf-xs-hit"),cur=svg.querySelector(".gf-xs-cur");
  /* a playhead, like a video's: it stays put, jumps to wherever you click, drags left and right, and its point shows on the map */
  const X0=chartSVG.X(0),put=vx=>{let best=null,bd=1e9;
   lines.forEach(L=>(L.P||[]).forEach(p=>{const d=Math.abs(chartSVG.X(chartSVG.comp?p.fromSea:p.km)-vx);if(d<bd){bd=d;best={p,L}}}));if(!best)return;
   const p=best.p,xx=chartSVG.X(chartSVG.comp?p.fromSea:p.km),yy=chartSVG.Y(p.e);head=xx;hover={ll:p.ll,c:best.L.c};const nm=lines.length===1?(cname(countryAt(p.ll))||waterName(p.ll)):best.L.name;
   const T=(best.L.P[best.L.P.length-1]||{}).km||1,ft=best.L.P.find(q=>q.n&&Math.abs(q.km-p.km)<T*.012);
   const txt=Math.round(chartSVG.comp?p.fromSea:p.km).toLocaleString()+" km · "+fmtE(p.e)+(ft?" · "+ft.n:nm?" · "+nm:"");
   const yyc=Math.max(14,Math.min(chartSVG.H-24,yy));cur.innerHTML='<line x1="'+xx+'" x2="'+xx+'" y1="12" y2="'+(chartSVG.H-24)+'" stroke="#1d2433" stroke-opacity=".7" stroke-width="1.6"/><path d="M'+(xx-6)+',6 h12 v5 l-6,6 l-6,-6z" fill="#1d2433"/><circle cx="'+xx+'" cy="'+yyc+'" r="5" fill="'+best.L.c+'" stroke="#fff" stroke-width="2"/><text x="'+Math.min(chartSVG.W-150,Math.max(60,xx+8))+'" y="26" font-size="12" font-weight="800" fill="#1d2433" stroke="#fff" stroke-width="3" paint-order="stroke">'+esc(txt)+'</text>';
   try{const g=G();g.request?g.request():g.render()}catch(e){}};
  const vxOf=e=>{const r=svg.getBoundingClientRect();return(e.clientX-r.left)/r.width*chartSVG.W};let held=false;
  hit.style.cursor="ew-resize";
  /* the moves are heard on the window, before the map can take them for a pan */
  hit.addEventListener("pointerdown",e=>{if(e.button)return;e.preventDefault();e.stopPropagation();held=true;put(vxOf(e));
   const mv=ev=>{if(!held)return;ev.stopPropagation();ev.preventDefault();put(vxOf(ev))},rel=ev=>{held=false;ev.stopPropagation();removeEventListener("pointermove",mv,true);removeEventListener("pointerup",rel,true);removeEventListener("pointercancel",rel,true)};
   addEventListener("pointermove",mv,true);addEventListener("pointerup",rel,true);addEventListener("pointercancel",rel,true)});
  svg.setAttribute("tabindex","0");svg.addEventListener("keydown",e=>{if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;e.preventDefault();put((head==null?X0:head)+(e.key==="ArrowRight"?1:-1)*(e.shiftKey?40:8))});
  /* the playhead shows from the start, at 0 km, so it is plain it can be dragged or clicked along */
  put(head!=null?head:X0)}}
/* fly so the whole line sits in the top half of the map, above the chart */
function frameTo(llAll){const g=G();if(!g||!llAll.length)return;if(!g._flat){try{const c=d3.geoCentroid({type:"MultiPoint",coordinates:llAll});if(c&&isFinite(c[0])){g.rot=[-c[0],-c[1]];g.request()}}catch(e){}return}try{const b=g._flatBase(),{w,h}=g.size(),z0=g.zoom,q=llAll.map(ll=>b(ll)).filter(p=>p&&isFinite(p[0]));if(!q.length)return;
 const xs=q.map(p=>p[0]/z0),ys=q.map(p=>p[1]/z0),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const zt=Math.max(1,Math.min(12,Math.min(w/((x1-x0)*1.25||1),h*.48/((y1-y0)*1.25||1)))),cx=(x0+x1)/2,cy=(y0+y1)/2+(h*.5-h*.27)/zt;
 const c=b.invert([cx*z0,cy*z0]);if(c&&isFinite(c[0])){g.zoom=zt;g.rot=[-c[0],-c[1]];g.request()}}catch(e){}}
function pick(v,keepView){head=null;if(!v)return;if(v[0]==="d")SRC="mine";else SRC="pre";armed=false;loadDEM().then(()=>{
 if(v[0]==="d"){const o=myInk().find(x=>x.i===+v.slice(1));if(!o){renderPanel();return}const g=o.s.g;title="Your "+(g?(KINDS[g.m]||"shape").toLowerCase():"line");note=g&&(g.m==="compass"||g.m==="ring"||g.m==="rect"||g.m==="oval")?"Round the outline of your shape, starting where it begins.":"Along the line you drew, from where you started it.";lines=[{ll:densify(o.s.p,600),c:o.s.c||"#c0392b"}]}
 else if(v[0]==="p"){const P=PRESETS[+v.slice(1)];title=P.n;note=P.t;head=null;lines=[{ll:densify([P.a,P.b],500),c:"#c0392b"}]}
 else if(v[0]==="r"){const k=v.slice(1),s=stem(k);if(!s){note="";title=k;lines=[];renderPanel();return}title=k+": source to sea";note=(STORY[k]||{}).h||"";yv={span:YSPAN,base:0};lines=[{ll:s,c:RIVERS[k].c,river:1,name:k}]}
 else if(v==="cmp"){title="Rivers compared";note="Height above the sea against distance from the mouth, every river at the same scale. Pick the rivers to compare; scroll up (▲ or the mouse wheel) to see the high sources. White dots mark each river's biggest single drop.";if(!keepView)yv={span:YSPAN,base:0};
  lines=picks.map(k=>{const s=stem(k);return s?{ll:s,c:RIVERS[k].c,river:1,name:k}:null}).filter(Boolean)}
 compute();frameTo([].concat(...lines.map(L=>L.ll)));renderPanel()})}
/* listen before the map does (it handles presses at the document level) */
if(!window._gfXsL){window._gfXsL=1;addEventListener("pointerdown",e=>{const g=G();if(g&&g.host.contains(e.target))down(e)},true);addEventListener("pointermove",move,true);addEventListener("pointerup",up,true);addEventListener("pointercancel",up,true)}
/* while drawing, the pointer over the map is a pen (its tip is the point being drawn) */
{const PEN="url(\"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M3 25l2.2-7.4L19.6 3.2a2.4 2.4 0 0 1 3.4 0l1.8 1.8a2.4 2.4 0 0 1 0 3.4L10.4 22.8z" fill="#fff" stroke="#3b2a17" stroke-width="1.6" stroke-linejoin="round"/><path d="M5.2 17.6l5.2 5.2" stroke="#3b2a17" stroke-width="1.6"/><path d="M16.8 6l5.2 5.2" stroke="#3b2a17" stroke-width="1.4"/><path d="M3 25l1.2-4 2.8 2.8z" fill="#c0392b"/></svg>')+"\") 3 25, crosshair";
 const st=document.createElement("style");st.textContent=".gf-xs-pen,.gf-xs-pen *{cursor:"+PEN+" !important} .gf-xs-pen .gf-xs, .gf-xs-pen .gf-xs *{cursor:auto !important} .gf-xs-pen .gf-xs :is(button,select,a,label,.gf-xs-hit){cursor:pointer !important} .gf-xs-pen .gf-xs .gf-xs-top{cursor:move !important}";document.head.appendChild(st);
 let last=null;setInterval(()=>{try{const g=G(),h=g&&g.host,w=!!(on&&armed&&h);if(last&&last!==h)last.classList.remove("gf-xs-pen");if(h)h.classList.toggle("gf-xs-pen",w);last=h}catch(e){}},150)}
/* a straight line between two places (for tours and checks): gfCrossSection.line([lon,lat],[lon,lat],"title") */
function line(a,b,t,pts){if(!on)start();armed=false;head=null;title=t||"Your line";note="";loadDEM().then(()=>{lines=[{ll:densify(pts&&pts.length>1?pts:[a,b],500),c:"#c0392b",P:null}];compute();renderPanel()})}
/* Esc: out of drawing at once (a stroke in progress is dropped), the pen goes; a second Esc closes the panel */
addEventListener("keydown",e=>{if(e.key!=="Escape"||!on)return;if(armed||drawing){armed=false;drawing=null;try{const g=G();if(g)g.host.classList.remove("gf-xs-pen")}catch(er){}renderPanel();e.preventDefault();e.stopImmediatePropagation()}},true);
window.gfCrossSection={start,stop,pick,line,loadLakes,lakeAt:ll=>lakeAt(ll),
 /* lakes along a list of points [{ll,km,e}]: sets each lake point's e to its bed (approximate where the data has none) and returns the lakes [{n,lv,i,j,syn}] */
 lakeify:P=>{const L={P};lakeify(L);return L.lk||[]},clear:()=>clearLine(),editPoints:()=>{const L=lines.length===1&&lines[0].edit;if(!L)return null;const r=G().canvas.getBoundingClientRect();return L.pts.map(ll=>{const q=scr(ll);return q?[q[0]+r.left,q[1]+r.top]:null})},get lineCount(){return lines.length},elevAt,loadDEM,stem,lfAt,loadLF,get presets(){return PRESETS},get armed(){return on&&armed},get drawing(){return!!drawing}};
setInterval(()=>{try{chip();if(on&&!G())stop();else if(on)mount()}catch(e){}},400);
})();
/* the cross-section panel stays a compact size: on a full-screen map it no longer stretches across the whole screen */
(function(){const st=document.createElement("style");st.textContent=".gf-xs{ max-width:min(860px, calc(100% - 68px)); }";document.head.appendChild(st)})();
