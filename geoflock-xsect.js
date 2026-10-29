/* GeoFlock: Elevation map › Cross-section. Draw a straight or freehand line on the map (or pick a ready-made one) and see the
   land and sea floor along it. River profiles follow each river's own course from source to sea, and "Compare rivers" puts
   several on one chart. Heights: NOAA ETOPO 2022 (public domain), averaged to 0.1° (about 11 km), so the highest summits read
   several hundred metres low. */
(function(){
if(typeof d3==="undefined")return;
const $=id=>document.getElementById(id),esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mode=()=>{try{return appMode==="allmaps"?allMapsColorMode:null}catch(e){return null}};
const G=()=>{try{return amGlobe&&amGlobe._flat&&amGlobe.host.isConnected?amGlobe:null}catch(e){return null}};
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
const cname=c=>c&&typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[c]?COUNTRY_BY_CODE[c].n:null;
/* ---------- state ---------- */
let head=null,on=false,armed=false,shape="line",lines=[],hover=null,panel=null,ov=null,raf=0,drawing=null,title="",note="";
const css=document.createElement("style");css.textContent=`
.gf-xs-chip.active{ background:#7a4b1f !important; color:#fff !important; }
.gf-xs-ico{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; color:#5b3a17; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); flex:none; }
.gf-xs-ico.on{ background:#8a5a2b; color:#fff; } .gf-xs-ico-top{ margin-right:8px; align-self:center; }
.gf-xs-top{ cursor:move; } .gf-xs-top button,.gf-xs-top select{ cursor:pointer; }
.gf-xs-ov{ position:absolute; left:0; top:0; pointer-events:none; z-index:30; }
.gf-xs{ position:absolute; left:10px; right:58px; bottom:10px; z-index:41; background:#fff; border-radius:14px; box-shadow:0 6px 24px rgba(0,0,0,.25); padding:10px 12px 8px; font:13px/1.35 system-ui,sans-serif; color:#1d2433; }
body.dark .gf-xs{ background:#1c2333; color:#e8ecf3; }
.gf-xs-hctl{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin:4px 0 2px; }
.gf-xs-hz button{ font-size:11px !important; }
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
.gf-xs-help{ font-size:12px; opacity:.75; padding:22px 6px; text-align:center; }
.gf-xs-src{ font-size:10.5px; opacity:.55; margin-top:3px; }`;document.head.appendChild(css);
/* the chip next to the map's sub-modes */
const ICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20h20"/><path d="M2 17l5-7 4 4 4-8 7 11"/></svg>';
function icons(show){const g=G(),spots=[];const btns=g&&g.host.querySelector(".globe-btns");if(btns)spots.push([btns,"gf-xs-ico gf-xs-ico-col"]);
 document.querySelectorAll(".gf-xs-ico").forEach(b=>{if(!show)b.remove()});if(!show)return;
 spots.forEach(([el,cl])=>{let b=cl.includes("col")?el.querySelector(".gf-xs-ico"):el.parentNode.querySelector(":scope > .gf-xs-ico");
  if(!b){b=document.createElement("button");b.type="button";b.className=cl;b.title="Cross-section: draw a line and see the land and sea floor along it";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();on?stop():start()};
   if(cl.includes("col"))el.appendChild(b);else el.parentNode.insertBefore(b,el)}b.classList.toggle("on",on)})}
/* the way in: a round button in the map's right-hand column (and the Shovel gadget in the toolkit) */
function chip(){icons(mode()==="elevation")}
function start(){const g=G();if(!g)return;on=true;loadDEM().then(()=>{renderPanel()}).catch(()=>{});mount();renderPanel();if(!lines.length)armed=true;renderPanel();loop()}
function dragPanel(){if(!panel||panel._drag)return;panel._drag=1;panel.addEventListener("pointerdown",e=>{if(!e.target.closest(".gf-xs-top")||e.target.closest("button,select,input"))return;e.preventDefault();e.stopPropagation();
 const h=panel.parentNode.getBoundingClientRect(),r=panel.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;panel.style.right="auto";panel.style.bottom="auto";panel.style.width=r.width+"px";
 const mv=ev=>{panel.style.left=Math.max(-r.width+80,Math.min(h.width-80,ev.clientX-h.left-dx))+"px";panel.style.top=Math.max(0,Math.min(h.height-40,ev.clientY-h.top-dy))+"px"};
 const upx=()=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",upx,true)};addEventListener("pointermove",mv,true);addEventListener("pointerup",upx,true)},true)}
function stop(){on=false;armed=false;lines=[];hover=null;if(panel){panel.remove();panel=null}if(ov){ov.remove();ov=null}cancelAnimationFrame(raf);chip()}
function mount(){const g=G();if(!g)return;const h=g.host;if(getComputedStyle(h).position==="static")h.style.position="relative";
 if(!ov||ov.parentNode!==h){ov=document.createElement("canvas");ov.className="gf-xs-ov";h.appendChild(ov)}
 if(!panel||panel.parentNode!==h){panel=document.createElement("div");panel.className="gf-xs";h.appendChild(panel)}dragPanel();
 }
/* ---------- drawing on the map ---------- */
const inPanel=e=>e.target.closest&&e.target.closest(".gf-xs,.globe-btns,.gfk-tray,.gfk-panel,button,a,input,select");
function local(e){const g=G();const r=g.canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
function down(e){if(!on||!armed||inPanel(e))return;const g=G();if(!g)return;e.stopImmediatePropagation();e.preventDefault();try{g.host.setPointerCapture(e.pointerId)}catch(_){}
 const p=local(e);drawing={pts:[p],id:e.pointerId}}
function move(e){if(!on)return;const g=G();if(!g)return;
 if(drawing&&e.pointerId===drawing.id){e.stopImmediatePropagation();e.preventDefault();const p=local(e);if(shape==="line")drawing.pts=[drawing.pts[0],p];else{const l=drawing.pts[drawing.pts.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>3)drawing.pts.push(p)}return}}
function up(e){if(!drawing||e.pointerId!==drawing.id)return;e.stopImmediatePropagation();const g=G(),pts=drawing.pts;drawing=null;if(!g||pts.length<2)return;
 /* even steps along what was drawn on screen, turned into places */
 let tot=0;for(let i=1;i<pts.length;i++)tot+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(tot<8)return;const n=500,inv=g.projection().invert,ll=[];let acc=0,k=0;
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);while(k<=n&&k*tot/n<=acc+d+1e-9){const t=d?(k*tot/n-acc)/d:0,q=inv([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);if(q&&isFinite(q[0]))ll.push(q);k++}acc+=d}
 if(ll.length<2)return;armed=false;title=shape==="line"?"Your line":"Your path";note="";head=null;lines=[{ll,c:"#c0392b",P:null}];compute();renderPanel()}
/* ---------- the map overlay ---------- */
function loop(){cancelAnimationFrame(raf);if(!on)return;raf=requestAnimationFrame(loop);const g=G();if(!g||!ov){return}
 const c=g.canvas,r=c.getBoundingClientRect(),hr=g.host.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 if(ov.width!==Math.round(r.width*dpr)||ov.height!==Math.round(r.height*dpr)){ov.width=Math.round(r.width*dpr);ov.height=Math.round(r.height*dpr);ov.style.width=r.width+"px";ov.style.height=r.height+"px"}
 ov.style.left=(r.left-hr.left)+"px";ov.style.top=(r.top-hr.top)+"px";const x=ov.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);const pr=g.projection();
 const stroke=(pts,col)=>{x.lineJoin=x.lineCap="round";x.beginPath();let pen=false,last=null;pts.forEach(p=>{if(!p){pen=false;return}if(pen&&last&&Math.abs(p[0]-last[0])>r.width/2)pen=false;pen?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]);pen=true;last=p});
  x.strokeStyle="rgba(255,255,255,.95)";x.lineWidth=6;x.stroke();x.strokeStyle=col;x.lineWidth=3;x.stroke()};
 lines.forEach(L=>{const pts=L.ll.map(ll=>{const q=pr(ll);return q&&isFinite(q[0])?q:null});stroke(pts,L.c);
  const lab=(q,t)=>{if(!q)return;x.fillStyle="#fff";x.strokeStyle=L.c;x.lineWidth=2;x.beginPath();x.arc(q[0],q[1],9,0,7);x.fill();x.stroke();x.fillStyle=L.c;x.font="800 11px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(t,q[0],q[1]+.5)};
  if(lines.length===1){lab(pts[0],"A");lab(pts[pts.length-1],"B")}});
 if(drawing){stroke(drawing.pts,"#c0392b")}
 if(hover){const q=pr(hover.ll);if(q){x.fillStyle=hover.c||"#c0392b";x.strokeStyle="#fff";x.lineWidth=2.5;x.beginPath();x.arc(q[0],q[1],6,0,7);x.fill();x.stroke()}}}
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
 for(const o of LFD){if(o.sea||o.lake){if(e>5&&!o.lake)continue}else if(e<-20)continue;if(!inB(o.b,ll))continue;try{if(!d3.geoContains(o.g,ll))continue}catch(er){continue}hit.push(o)}
 if(!hit.length)return null;const pr=o=>o.sea||o.lake?5:o.p,p0=Math.min(...hit.map(pr)),C=hit.filter(o=>pr(o)===p0);
 const big=C.filter(o=>o.a>=(minA||0)).sort((x,y)=>x.a-y.a)[0]||C.sort((x,y)=>y.a-x.a)[0];return{n:big.n,k:big.sea?"sea":big.lake?"lake":"land"}}
function lfSegs(P){const step=Math.max(1,Math.floor(P.length/160)),out=[];let cur=null;
 const Lk=(P[P.length-1].km||0)-(P[0].km||0),minA=Math.pow(Lk/7/R_KM,2);
 for(let i=0;i<P.length;i+=step){const p=P[i],h=lfAt(p.ll,p.e,minA),n=h&&h.n;if(cur&&cur.n===n){cur.b=p.km;cur.hi=Math.max(cur.hi,p.e);cur.lo=Math.min(cur.lo,p.e)}else{cur={n,k:h&&h.k,a:p.km,b:p.km,hi:p.e,lo:p.e};out.push(cur)}}
 return out.filter(g=>g.n)}
/* ---------- profiles and the chart ---------- */
function compute(){lines.forEach(L=>{L.P=profile(L.ll,{river:L.river,name:L.name});if(L.river&&REAL_KM[L.name]&&L.P.length){const T=L.P[L.P.length-1].km,f=T?REAL_KM[L.name]/T:1;L.P.forEach(p=>p.km*=f)}if(lines.length===1){const step=Math.max(1,Math.floor(L.P.length/80));const segs=[];let cur=null;
 for(let i=0;i<L.P.length;i+=step){const c=countryAt(L.P[i].ll);if(!cur||cur.c!==c){cur={c,a:L.P[i].km,b:L.P[i].km};segs.push(cur)}else cur.b=L.P[i].km}if(cur)cur.b=L.P[L.P.length-1].km;L.segs=segs;if(!L.river){if(LFD)L.lf=lfSegs(L.P);else loadLF()}}})}
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
 L.P=P;L.fine=Math.round(40075/(256*2**z)*Math.cos(pts[0][1]*Math.PI/180)*1000);if(on&&panel)renderPanel()}
{const _c=compute;compute=function(){const r=_c.apply(this,arguments);try{lines.forEach(L=>{if(!L.river)refine(L)})}catch(e){}return r}}
const STOPS=[[-11000,"#0b1d4d"],[-6000,"#123a7a"],[-3000,"#1f63a8"],[-200,"#4ea6d6"],[0,"#8fd3e8"],[1,"#4f9d52"],[300,"#8fbf5a"],[800,"#d8c86d"],[1600,"#c18f4f"],[3000,"#8d5a34"],[4500,"#a7a2a0"],[6000,"#ffffff"]];
/* ---------- rivers: one height window for every river (scroll up for the high sources), the story of each river, and a
   comparison of the rivers you pick ---------- */
const YSPAN=1700;let yv={span:YSPAN,base:0},picks=["Amazon","Congo","Zambezi","Mississippi"];
const STORY={
 Amazon:{h:"The Amazon drops about 5,000 m in the Andes, then only about 110 m over the 3,600 km from Iquitos to the sea. That gentle slope is why ocean-going ships can sail all the way up to Iquitos in Peru.",nav:[["Iquitos","Amazon mouth","Ocean-going ships reach Iquitos"]],lab:[["Pucallpa","Pucallpa"],["Iquitos","Iquitos 110 m"],["Manaus","Manaus 20 m · Meeting of the Waters"]]},
 Congo:{h:"The Congo crosses its basin as a calm highway, then falls about 270 m through the 32 rapids of the Livingstone Falls between Kinshasa and Matadi. No boat could get past them, so the interior was cut off from the sea; a railway from Matadi to Kinshasa was built to go round them.",nav:[["Kisangani","Malebo Pool","River boats, about 1,700 km"],["Matadi","Congo mouth","Ships from the sea"]],spans:[["Livingstone Falls top","Matadi","Livingstone Falls: −270 m, 32 rapids"]],lab:[["Kisangani","Kisangani"],["Mbandaka","Mbandaka"],["Malebo Pool","Kinshasa"]]},
 Zambezi:{h:"A staircase: a high plateau, the 108 m drop of Victoria Falls, then two dams, Kariba and Cahora Bassa, that turned steps of the river into long lakes."},
 Mississippi:{h:"The Mississippi starts only 450 m above the sea, at Lake Itasca, and slopes gently for more than 3,700 km. Locks and dams let barges travel all the way up to Minneapolis.",nav:[["Minneapolis locks bottom","Mississippi mouth","Barges, through locks"]],lab:[["St. Louis","St. Louis"],["New Orleans","New Orleans"]]},
 Nile:{h:"The Nile leaves Lake Victoria about 1,130 m up and loses half of that height in Uganda, at the Karuma and Murchison Falls, before its long, gentle run through the swamps and the desert to the Mediterranean.",lab:[["Khartoum","Khartoum"],["Cairo","Cairo"]]},
 Niger:{h:"The Niger rises only about 745 m up, close to the Atlantic, yet flows inland first, across the Sahel. Its slope is so gentle that it spreads into the Inner Niger Delta, a vast wetland around Mopti and Lake Debo.",lab:[["Bamako","Bamako"],["Timbuktu","Timbuktu"],["Niamey","Niamey"]]},
 Yangtze:{h:"The Yangtze falls more than 5,000 m from the Tibetan Plateau. A chain of giant dams now holds its upper course in steps, and below the dams at Yichang it falls only about 40 m to the sea.",lab:[["Chongqing","Chongqing"],["Wuhan","Wuhan"]]},
 Danube:{h:"The Danube starts in Germany's Black Forest and loses most of its height before Vienna. Its Iron Gates gorge, once full of dangerous rapids, is now drowned behind two dams.",lab:[["Vienna","Vienna"],["Budapest","Budapest"],["Belgrade","Belgrade"]]},
 Ganges:{h:"The Ganges falls about 3,600 m in the Himalaya before Haridwar, then crawls across the plain: in over 2,000 km from Haridwar to the sea it drops less than 300 m.",lab:[["Haridwar","Haridwar"],["Varanasi","Varanasi"],["Kolkata","Kolkata"]]},
 Orange:{h:"The Orange begins 3,000 m up in Lesotho, crosses South Africa's high plateau, and drops off its edge at the Augrabies Falls before crossing the desert to the Atlantic.",lab:[["Upington","Upington"]]}};
const findPt=(P,name)=>P.find(p=>p.n&&p.n.toLowerCase().startsWith(name.toLowerCase()));
/* the biggest single drop in the published levels: falls, rapids or a dam */
const nmOf=n=>{const m=String(n).match(/([A-Z][\w'’.-]*(?: [A-Z][\w'’.-]*)* (?:Falls|Rapids|rapids|Dam|Barrage|Gorge))/);return m?m[1]:String(n).split(" (")[0].replace(/\s+(top|lip|headwater|gorge top)$/i,"")};
function bigDrop(name){const C=RP&&RP[name];if(!C)return null;let best=null;for(let i=0;i+1<C.length;i++){if(!/_top$/.test(C[i][4]||""))continue;const d=C[i][3]-C[i+1][3];if(!best||d>best.d)best={d,n:nmOf(C[i][0]),full:C[i][0]}}return best}
function chartSVG(){const Ps=lines.filter(L=>L.P&&L.P.length);if(!Ps.length)return"";const rv=Ps.some(L=>L.river);
 const W=900,H=rv&&lines.length===1?214:190,ml=50,mr=10,mt=12,mb=lines.length===1?34:22;
 const comp=lines.length>1,xKey=p=>comp?p.fromSea:p.km;if(comp)Ps.forEach(L=>{const T=L.P[L.P.length-1].km;L.P.forEach(p=>p.fromSea=T-p.km)});
 let e0=Infinity,e1=-Infinity,kmax=0,dmax=-Infinity;Ps.forEach(L=>L.P.forEach(p=>{e0=Math.min(e0,p.e);e1=Math.max(e1,p.e);kmax=Math.max(kmax,xKey(p))}));dmax=e1;
 if(rv&&yv.span!=="all"){e0=yv.base;e1=yv.base+yv.span}else{e0=Math.min(0,e0);e1=Math.max(e1,e0+200);const pad=(e1-e0)*.08;e1+=pad;if(e0<0)e0-=pad*.5}
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
  if(e0<0){let w="M"+X(0)+","+yz;P.forEach(p=>{w+="L"+X(p.km).toFixed(1)+","+Y(Math.min(0,p.e)).toFixed(1)});w+="L"+X(P[P.length-1].km)+","+yz+"Z";s+='<path d="'+w+'" fill="url(#gfxsSea)" clip-path="url(#gfxsClip)"/>'}
  let top="";P.forEach((p,i)=>{top+=(i?"L":"M")+X(p.km).toFixed(1)+","+Y(p.e).toFixed(1)});
  s+='<g clip-path="url(#gfxsClip)"><path d="'+top+"L"+X(P[P.length-1].km)+","+(H-mb)+"L"+X(0)+","+(H-mb)+'Z" fill="url(#gfxsRock)"/>';
  s+='<path d="'+top+'" fill="none" stroke="url(#gfxsLand)" stroke-width="4" stroke-linejoin="round"/><path d="'+top+'" fill="none" stroke="#2a1c10" stroke-width=".8" stroke-opacity=".6"/></g>';
  /* navigable stretches: a pale band along the bottom and a short note */
  if(St&&St.nav)St.nav.forEach(([a,b,t])=>{const A=findPt(P,a),B=findPt(P,b);if(!A||!B)return;const xa=X(A.km),xb=X(B.km);s+='<line x1="'+xa.toFixed(1)+'" x2="'+xa.toFixed(1)+'" y1="'+(Y(e0+(e1-e0)*.42)+4)+'" y2="'+(H-mb-7)+'" stroke="#2f7fd0" stroke-dasharray="3 3" stroke-opacity=".6"/><rect x="'+xa.toFixed(1)+'" y="'+(H-mb-7)+'" width="'+Math.max(2,xb-xa).toFixed(1)+'" height="7" fill="#2f7fd0" fill-opacity=".55" rx="2"/>'+(xb-xa>60?lbl(xa+4,Y(e0+(e1-e0)*.42),"⛴ "+t+" →",{c:"#1f5f9e",fs:10.5,fw:800}):"")});
  const placed=[];const free=(x,w)=>{if(placed.some(q=>Math.abs(q-x)<w))return false;placed.push(x);return true};
  /* spans (a whole set of rapids) get a bracket and a name */
  if(St&&St.spans)St.spans.forEach(([a,b,t])=>{const A=findPt(P,a),B=findPt(P,b);if(!A||!B||!inWin(A.e))return;const xa=X(A.km),xb=Math.max(X(B.km),xa+6),y=Math.max(mt+24,Y(A.e)-12);
   s+='<path d="M'+xa.toFixed(1)+','+(y+5)+' v-5 H'+xb.toFixed(1)+' v5" fill="none" stroke="#b3261e" stroke-width="1.6"/>'+lbl(Math.min(xb,W-mr-2),y-4,t,{c:"#b3261e",fs:10.5,fw:800});placed.push(xa,xb)});
  /* falls, rapids and dams with a real drop */
  if(L.river)P.forEach((p,i)=>{if(!p.n||!/_top$/.test(p.k||"")||!inWin(p.e))return;const nx=P.slice(i+1).find(q=>q.n);if(!nx||p.e-nx.e<15)return;if(St&&St.spans&&St.spans.some(sp=>p.n.toLowerCase().startsWith(sp[0].toLowerCase())))return;const x=X(p.km);if(!free(x,60))return;
   const nm=nmOf(p.n);s+=lbl(x,Y(p.e)-7,nm+" −"+Math.round(p.e-nx.e)+" m")});
  if(St&&St.lab)St.lab.forEach(([a,t])=>{const A=findPt(P,a);if(!A||!inWin(A.e))return;const x=X(A.km);if(!free(x,50))return;s+='<circle cx="'+x.toFixed(1)+'" cy="'+Y(A.e).toFixed(1)+'" r="3" fill="#1d2433"/>'+lbl(x,Y(A.e)-8,t,{fw:700,c:"#33415a"})});
  if(e0<0)s+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+yz+'" y2="'+yz+'" stroke="#1f63a8" stroke-dasharray="4 3" stroke-opacity=".6"/>';
  if(L.river){s+=overTop(L);const src=P[0];if(inWin(src.e))s+=lbl(X(src.km)+4,Y(src.e)-8,"Source "+fmtE(src.e),{fw:800,c:"#3b2a1a",fs:11})}
  else{let hi=P[0],lo=P[0];P.forEach(p=>{if(p.e>hi.e)hi=p;if(p.e<lo.e)lo=p});
   s+=lbl(Math.max(ml+34,X(hi.km)),Y(hi.e)-5,"▲ "+fmtE(hi.e),{fs:11.5,fw:800,c:"#3b2a1a"});
   if(lo.e<-50)s+='<text x="'+X(lo.km)+'" y="'+(Y(lo.e)+14)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff">▼ '+fmtE(lo.e)+'</text>';
   s+='<text x="'+(ml+4)+'" y="'+(H-mb-6)+'" font-size="12" font-weight="800" fill="#c0392b">A</text><text x="'+(W-mr-4)+'" y="'+(H-mb-6)+'" text-anchor="end" font-size="12" font-weight="800" fill="#c0392b">B</text>'}
  /* the landforms the line crosses: a name over each mountain range, plateau or plain, in the water for seas and trenches */
  {const tot=P[P.length-1].km||1,LFX=[];(L.lf||[]).slice().sort((p,q)=>(q.b-q.a)-(p.b-p.a)).forEach(g=>{const a=X(g.a),b=X(g.b),w=b-a,nm=g.n,tw=nm.length*5.6;if(w<Math.max(18,tot?0:0)||(w<tw*.55&&g.k!=="trench"))return;const xm=(a+b)/2,L0=xm-tw/2-5,R0=xm+tw/2+5,YY=g.k==="sea"||g.k==="trench"||g.k==="lake"?Y(g.lo):Y(Math.min(g.hi,e1));if(LFX.some(q=>L0<q[1]&&R0>q[0]&&Math.abs(q[2]-YY)<16))return;LFX.push([L0,R0,YY]);
   if(g.k==="sea"||g.k==="trench"||g.k==="lake"){const yy=g.k==="trench"?Y(g.lo)-8:Math.min(Y(g.lo)-6,Math.max(yz+13,(yz+Y(g.lo))/2));if(!inWin(g.lo)&&g.k==="trench")return;s+='<text x="'+xm.toFixed(1)+'" y="'+yy.toFixed(1)+'" text-anchor="middle" font-size="10.5" font-style="italic" font-weight="700" fill="'+(g.k==="trench"?"#fff":"#1f4f7a")+'">'+esc(nm)+'</text>'}
   else{const yy=Math.max(mt+24,Y(Math.min(g.hi,e1))-10);s+='<path d="M'+(a+2).toFixed(1)+','+(yy+4).toFixed(1)+'v-3H'+(b-2).toFixed(1)+'v3" fill="none" stroke="#6b4a2a" stroke-opacity=".55"/><text x="'+xm.toFixed(1)+'" y="'+(yy-1).toFixed(1)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="#5b3a17">'+esc(nm)+'</text>'}})}
  (L.segs||[]).forEach(g=>{if(!g.c)return;const a=X(g.a),b=X(g.b),nm=cname(g.c);if(b-a<26||!nm)return;s+='<line x1="'+(a+1)+'" x2="'+(a+1)+'" y1="'+(H-mb+16)+'" y2="'+(H-mb+29)+'" stroke="#8a5a2b" stroke-opacity=".4"/>';
   if(b-a>nm.length*5.5)s+='<text x="'+((a+b)/2)+'" y="'+(H-mb+26)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="#5b3a17">'+esc(nm)+'</text>'})}
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
function myLinesOpts(){const L=myInk();if(!L.length)return"";return'<optgroup label="Your drawings">'+L.slice(-20).reverse().map(o=>{const g=o.s.g,k=g?KINDS[g.m]||"Shape":o.s.t==="geoDash"?"Latitude / longitude line":"Pen line";return'<option value="d'+o.i+'">'+esc(k+(o.s.lab?" · "+o.s.lab:"")+(o.s.tx?" · "+o.s.tx:""))+'</option>'}).join("")+'</optgroup>'}
function renderPanel(){if(!panel)return;const presetOpts='<option value="">Ready-made lines…</option>'+PRESETS.map((p,i)=>'<option value="p'+i+'">'+esc(p.n)+'</option>').join("")+'<optgroup label="Rivers, source to sea">'+Object.keys(RIVERS).map(k=>'<option value="r'+k+'">'+k+'</option>').join("")+'</optgroup><option value="cmp">Compare rivers (pick which)</option>'+myLinesOpts();
 const rvNow=lines.some(L=>L.river),cmpNow=lines.length>1||title==="Rivers compared";
 const hctl=rvNow?'<div class="gf-xs-hctl"><span class="gf-xs-seg gf-xs-hz">'+[[YSPAN,"Same scale for every river (0–1,700 m)"],[250,"Lowlands (0–250 m)"],["all","Whole river"]].map(([v,t])=>'<button type="button" data-hz="'+v+'" class="'+(String(yv.span)===String(v)?"on":"")+'">'+t+'</button>').join("")+'</span>'+(yv.span!=="all"?'<button type="button" class="gf-xs-up" data-sc="1" title="Scroll up (or use the mouse wheel over the chart)">▲ higher</button><button type="button" class="gf-xs-up" data-sc="-1" title="Scroll down">▼ lower</button>':'')+'</div>':'';
 const chips=cmpNow?'<div class="gf-xs-pick">'+Object.keys(RIVERS).map(k=>'<button type="button" data-rv="'+k+'" class="'+(picks.includes(k)?"on":"")+'" style="--c:'+RIVERS[k].c+'">'+k+'</button>').join("")+'</div>':'';
 const body=!DEM?'<div class="gf-xs-help">Loading heights…</div>':lines.length&&lines[0].P?(note?'<p class="gf-xs-note">'+esc(note)+'</p>':'')+chips+hctl+chartSVG()+(cmpNow?cmpTable():''):'<div class="gf-xs-help">'+(armed?(shape==="line"?"Drag across the map to draw a straight line.":"Drag across the map to draw your own path."):"Pick a ready-made line, or press Draw.")+'</div>';
 const drawUI=armed||!lines.length;
 panel.innerHTML='<div class="gf-xs-top"><b>✂ '+esc(title||"Cross-section")+'</b>'+(drawUI?'<span class="gf-xs-seg"><button type="button" data-sh="line" class="'+(shape==="line"?"on":"")+'">Straight</button><button type="button" data-sh="free" class="'+(shape==="free"?"on":"")+'">Freehand</button></span>':'')+
  (window.gfShovelDig?'<button type="button" class="gf-xs-dig" title="Dig straight through the Earth instead">⛏ Dig through</button>':'')+'<button type="button" class="gf-xs-go'+(armed?" on":"")+'">'+(armed?"Drawing… drag on the map":drawUI?"✏ Draw":"✏ Draw your own")+'</button><select class="gf-xs-pre">'+presetOpts+'</select><button type="button" class="gf-xs-min" title="Fold">▾</button><button type="button" class="gf-xs-x" title="Close">×</button></div><div class="gf-xs-body">'+body+
  '<div class="gf-xs-src">'+(rvNow?'River profiles follow each river\'s own course, with its water level from published figures for lakes, falls, rapids and dams, estimated in between. ':'')+'Heights: NOAA ETOPO 2022 and AWS Terrain Tiles (open data); peaks read a little low. Height is stretched far more than length.</div></div>';
 panel.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{shape=b.dataset.sh;armed=true;renderPanel()});
 panel.querySelector(".gf-xs-go").onclick=()=>{armed=!armed;renderPanel()};
 panel.querySelector(".gf-xs-x").onclick=stop;{const dg=panel.querySelector(".gf-xs-dig");if(dg)dg.onclick=()=>window.gfShovelDig()}panel.querySelector(".gf-xs-min").onclick=()=>panel.classList.toggle("mini");
 panel.querySelector(".gf-xs-pre").onchange=e=>{pick(e.target.value)};
 panel.querySelectorAll("[data-hz]").forEach(b=>b.onclick=()=>{const v=b.dataset.hz;yv={span:v==="all"?"all":+v,base:0};renderPanel()});
 const scroll=dir=>{if(yv.span==="all")return;const mx=chartSVG.dmax||0;yv.base=Math.max(0,Math.min(Math.max(0,mx-yv.span*.6),yv.base+dir*yv.span*.25));renderPanel()};
 panel.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>scroll(+b.dataset.sc));
 panel.querySelectorAll("[data-rv]").forEach(b=>b.onclick=()=>{const k=b.dataset.rv,i=picks.indexOf(k);if(i>=0){if(picks.length>1)picks.splice(i,1)}else picks.push(k);pick("cmp",true)});
 {const sv=panel.querySelector("svg");if(sv&&lines.some(L=>L.river))sv.addEventListener("wheel",e=>{if(yv.span==="all")return;e.preventDefault();e.stopPropagation();scroll(e.deltaY<0?1:-1)},{passive:false})}
 const svg=panel.querySelector("svg");if(svg){const hit=svg.querySelector(".gf-xs-hit"),cur=svg.querySelector(".gf-xs-cur");
  /* a playhead, like a video's: it stays put, jumps to wherever you click, drags left and right, and its point shows on the map */
  const X0=chartSVG.X(0),put=vx=>{let best=null,bd=1e9;
   lines.forEach(L=>(L.P||[]).forEach(p=>{const d=Math.abs(chartSVG.X(chartSVG.comp?p.fromSea:p.km)-vx);if(d<bd){bd=d;best={p,L}}}));if(!best)return;
   const p=best.p,xx=chartSVG.X(chartSVG.comp?p.fromSea:p.km),yy=chartSVG.Y(p.e);head=xx;hover={ll:p.ll,c:best.L.c};const nm=lines.length===1?cname(countryAt(p.ll)):best.L.name;
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
  if(head!=null)put(head)}}
/* fly so the whole line sits in the top half of the map, above the chart */
function frameTo(llAll){const g=G();if(!g||!llAll.length)return;try{const b=g._flatBase(),{w,h}=g.size(),z0=g.zoom,q=llAll.map(ll=>b(ll)).filter(p=>p&&isFinite(p[0]));if(!q.length)return;
 const xs=q.map(p=>p[0]/z0),ys=q.map(p=>p[1]/z0),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const zt=Math.max(1,Math.min(12,Math.min(w/((x1-x0)*1.25||1),h*.48/((y1-y0)*1.25||1)))),cx=(x0+x1)/2,cy=(y0+y1)/2+(h*.5-h*.27)/zt;
 const c=b.invert([cx*z0,cy*z0]);if(c&&isFinite(c[0])){g.zoom=zt;g.rot=[-c[0],-c[1]];g.request()}}catch(e){}}
function pick(v,keepView){head=null;if(!v)return;armed=false;loadDEM().then(()=>{
 if(v[0]==="d"){const o=myInk().find(x=>x.i===+v.slice(1));if(!o){renderPanel();return}const g=o.s.g;title="Your "+(g?(KINDS[g.m]||"shape").toLowerCase():"line");note=g&&(g.m==="compass"||g.m==="ring"||g.m==="rect"||g.m==="oval")?"Round the outline of your shape, starting where it begins.":"Along the line you drew, from where you started it.";lines=[{ll:densify(o.s.p,600),c:o.s.c||"#c0392b"}]}
 else if(v[0]==="p"){const P=PRESETS[+v.slice(1)];title=P.n;note=P.t;head=null;lines=[{ll:densify([P.a,P.b],500),c:"#c0392b"}]}
 else if(v[0]==="r"){const k=v.slice(1),s=stem(k);if(!s){note="";title=k;lines=[];renderPanel();return}title=k+": source to sea";note=(STORY[k]||{}).h||"";yv={span:YSPAN,base:0};lines=[{ll:s,c:RIVERS[k].c,river:1,name:k}]}
 else if(v==="cmp"){title="Rivers compared";note="Height above the sea against distance from the mouth, every river at the same scale. Pick the rivers to compare; scroll up (▲ or the mouse wheel) to see the high sources. White dots mark each river's biggest single drop.";if(!keepView)yv={span:YSPAN,base:0};
  lines=picks.map(k=>{const s=stem(k);return s?{ll:s,c:RIVERS[k].c,river:1,name:k}:null}).filter(Boolean)}
 compute();frameTo([].concat(...lines.map(L=>L.ll)));renderPanel()})}
/* listen before the map does (it handles presses at the document level) */
if(!window._gfXsL){window._gfXsL=1;addEventListener("pointerdown",e=>{const g=G();if(g&&g.host.contains(e.target))down(e)},true);addEventListener("pointermove",move,true);addEventListener("pointerup",up,true);addEventListener("pointercancel",up,true)}
window.gfCrossSection={start,stop,pick,elevAt,loadDEM,stem,lfAt,loadLF};
setInterval(()=>{try{chip();if(on&&!G())stop();else if(on)mount()}catch(e){}},400);
})();
