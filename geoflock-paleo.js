/* GeoFlock: continental drift from 750 million years ago to today.
   Data: C. R. Scotese, PALEOMAP Project plate model (via the pyGPlates tutorial data); coastlines simplified.
   Each coastline polygon keeps its present-day shape and is turned about the Earth's centre by its plate's rotation. */
(function(){
let DATA=null,LOADING=null;
const R=Math.PI/180;
function load(){if(DATA)return Promise.resolve(DATA);if(LOADING)return LOADING;
 LOADING=fetch("geoflock-paleo.json").then(r=>r.json()).then(d=>{
  d.polys.forEach(P=>{P.v=P.c.map(([lo,la])=>[Math.cos(la*R)*Math.cos(lo*R),Math.cos(la*R)*Math.sin(lo*R),Math.sin(la*R)]);
   /* d3 wants clockwise outer rings: flip any ring that would cover more than half the globe */
   if(typeof d3!=="undefined"&&d3.geoArea({type:"Polygon",coordinates:[P.c]})>2*Math.PI){P.c.reverse();P.v.reverse()}});
  DATA=d;return d});return LOADING}
function quat(pid,t){const S=DATA.rot[pid];if(!S)return[1,0,0,0];const f=Math.max(0,Math.min(DATA.max,t))/DATA.step,i=Math.min(S.length-1,Math.floor(f)),j=Math.min(S.length-1,i+1),u=f-i;
 const a=S[i],b=S[j],sg=(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3])<0?-1:1;
 const q=[0,1,2,3].map(n=>a[n]*(1-u)+sg*b[n]*u),m=Math.hypot(q[0],q[1],q[2],q[3])||1;return q.map(x=>x/m)}
function turn(q,v){const w=q[0],x=q[1],y=q[2],z=q[3];
 const cx=y*v[2]-z*v[1],cy=z*v[0]-x*v[2],cz=x*v[1]-y*v[0];
 const dx=y*cz-z*cy,dy=z*cx-x*cz,dz=x*cy-y*cx;
 return[v[0]+2*(w*cx+dx),v[1]+2*(w*cy+dy),v[2]+2*(w*cz+dz)]}
const ll=v=>[Math.atan2(v[1],v[0])/R,Math.asin(Math.max(-1,Math.min(1,v[2])))/R];
/* the continents at time t (million years ago), grouped by today's continent: {k:[ring,...]} plus each group's centre */
function at(t){if(!DATA)return null;t=Math.max(t,.5);const out={},cen={},qs={};
 DATA.polys.forEach(P=>{if(P.b<t)return;const q=qs[P.p]||(qs[P.p]=quat(P.p,t));let ring=P.v.map(v=>ll(turn(q,v)));if(typeof d3!=="undefined"&&d3.geoArea({type:"Polygon",coordinates:[ring]})>2*Math.PI)ring=ring.reverse();(out[P.k]=out[P.k]||[]).push(ring);
  const c=cen[P.k]||(cen[P.k]=[0,0,0,0]);const n=P.v.length;P.v.forEach(v=>{const r=turn(q,v);c[0]+=r[0];c[1]+=r[1];c[2]+=r[2]});c[3]+=n});
 const centres={};for(const k in cen){const c=cen[k],m=Math.hypot(c[0],c[1],c[2])||1;centres[k]=ll([c[0]/m,c[1]/m,c[2]/m])}
 return{groups:out,centres:centres}}
const STAGES=[[750,"Rodinia, the supercontinent before Pangaea, is breaking apart"],[640,"Snowball Earth: ice may have reached the equator"],[560,"Gondwana assembles in the south"],[500,"Life explodes in the seas; Gondwana sits over the South Pole"],[420,"Plants and animals begin to move onto land"],[330,"The continents crash together, building the Appalachians"],[250,"Pangaea: one supercontinent, ringed by one ocean, Panthalassa"],[200,"Pangaea starts to split; dinosaurs can walk to every continent"],[150,"The Atlantic opens between Africa and North America"],[100,"Gondwana breaks up: South America leaves Africa"],[66,"An asteroid ends the dinosaurs; India races north"],[45,"India hits Asia and pushes up the Himalaya"],[0,"Today"]];
function stage(t){return STAGES.find(s=>t>=s[0]-(s[0]>100?40:12))||STAGES[STAGES.length-1]}
const COL={na:"#d98c4a",sa:"#7fb069",af:"#e0b84c",eu:"#c9785f",in:"#b5648f",au:"#d4a373",an:"#e8eef3"};
const NAME={na:"N. America",sa:"S. America",af:"Africa",eu:"Eurasia",in:"India",au:"Australia",an:"Antarctica"};
window.gfPaleo={load:load,at:at,stage:stage,COL:COL,NAME:NAME,MAX:750,credit:"Plate model: C. R. Scotese, PALEOMAP Project"};
})();
/* All Maps: a "Deep time" chip that opens a full-size drift map with a time slider */
(function(){
if(typeof renderAllMapsView!=="function")return;
const css=document.createElement("style");css.textContent=`
#gfDeep{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;background:#0e2238;border-radius:inherit;overflow:hidden;color:#fff;font-family:inherit}
#gfDeep svg.gfd-map{flex:1;min-height:0;width:100%;cursor:grab;touch-action:none}
#gfDeep svg.gfd-map.drag{cursor:grabbing}
#gfDeep .gfd-bar{display:flex;flex-direction:column;gap:6px;padding:10px 16px 12px;background:rgba(8,20,36,.92)}
#gfDeep .gfd-row{display:flex;align-items:center;gap:12px}
#gfDeep .gfd-play{flex:none;width:34px;height:34px;border-radius:50%;border:0;background:#e8701a;color:#fff;font-size:15px;cursor:pointer;display:grid;place-items:center}
#gfDeep input[type=range]{flex:1;accent-color:#e8701a;min-width:0}
#gfDeep .gfd-time{flex:none;min-width:9.5em;font-weight:800;font-size:15px;text-align:right}
#gfDeep .gfd-stage{font-size:13px;font-weight:700;color:#ffc58a;min-height:1.2em}
#gfDeep .gfd-ticks{display:flex;justify-content:space-between;font-size:10.5px;opacity:.65;padding:0 46px 0 46px}
#gfDeep .gfd-credit{font-size:10.5px;opacity:.6}
#gfDeep .gfd-x{position:absolute;top:10px;right:12px;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:18px;cursor:pointer}
#gfDeep .gfd-load{position:absolute;inset:0;display:grid;place-items:center;font-weight:700;opacity:.8}
`;document.head.appendChild(css);
const MARKS=[750,500,250,0];
let st={t:250,lon:-10,playing:false,raf:0};
function draw(box){const svg=box.querySelector("svg.gfd-map");const W=svg.clientWidth||800,H=svg.clientHeight||400;svg.setAttribute("viewBox","0 0 "+W+" "+H);
 const P=gfPaleo.at(st.t);if(!P)return;const p=d3.geoEqualEarth().rotate([st.lon,0]).fitExtent([[12,12],[W-12,H-12]],{type:"Sphere"}),path=d3.geoPath(p);
 let g='<defs><radialGradient id="gfdSea" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#2f78b7"/><stop offset="1" stop-color="#174a7c"/></radialGradient></defs>';
 g+='<path d="'+path({type:"Sphere"})+'" fill="url(#gfdSea)" stroke="#5d8fbd" stroke-width="1"/>';
 g+='<path d="'+path(d3.geoGraticule().step([30,30])())+'" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width=".7"/>';
 for(const k in P.groups){const dd=path({type:"MultiPolygon",coordinates:P.groups[k].map(r=>[r])});if(dd)g+='<path d="'+dd+'" fill="'+gfPaleo.COL[k]+'" stroke="'+gfPaleo.COL[k]+'" stroke-width=".6"><title>'+gfPaleo.NAME[k]+'</title></path>'}
 const fs=Math.max(11,Math.min(15,W/70));
 for(const k in P.centres){if(k==="an"&&st.t<40)continue;const xy=p(P.centres[k]);if(!xy)continue;g+='<text x="'+xy[0].toFixed(1)+'" y="'+xy[1].toFixed(1)+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="#1b130c" stroke="#fff" stroke-width="3" paint-order="stroke">'+gfPaleo.NAME[k]+'</text>'}
 svg.innerHTML=g;
 box.querySelector(".gfd-time").textContent=st.t<1?"Today":Math.round(st.t)+" million years ago";
 box.querySelector(".gfd-stage").textContent=gfPaleo.stage(st.t)[1];
 const r=box.querySelector("input[type=range]");if(+r.value!==Math.round(gfPaleo.MAX-st.t))r.value=Math.round(gfPaleo.MAX-st.t)}
function open(){const wrap=document.getElementById("allMapsWrap");if(!wrap)return;let box=document.getElementById("gfDeep");
 if(!box){if(getComputedStyle(wrap).position==="static")wrap.style.position="relative";box=document.createElement("div");box.id="gfDeep";
  box.innerHTML='<svg class="gfd-map" aria-label="The continents through time"></svg><div class="gfd-load">Loading 750 million years…</div><button type="button" class="gfd-x" aria-label="Close deep time">×</button><div class="gfd-bar"><div class="gfd-stage"></div><div class="gfd-row"><button type="button" class="gfd-play" aria-label="Play">▶</button><input type="range" min="0" max="'+gfPaleo.MAX+'" step="1" aria-label="Millions of years ago"><span class="gfd-time"></span></div><div class="gfd-ticks">'+MARKS.map(m=>'<span>'+(m?m+" Ma":"Today")+'</span>').join("")+'</div><div class="gfd-credit">'+gfPaleo.credit+' · today’s coastlines carried back in time, so old shapes are approximate · drag the map to turn the world</div></div>';
  wrap.appendChild(box);
  const r=box.querySelector("input[type=range]");r.oninput=()=>{stop();st.t=gfPaleo.MAX-(+r.value);draw(box)};
  box.querySelector(".gfd-play").onclick=()=>{st.playing?stop():play(box)};
  box.querySelector(".gfd-x").onclick=close;
  const svg=box.querySelector("svg.gfd-map");let d0=null;
  svg.addEventListener("pointerdown",e=>{d0={x:e.clientX,lon:st.lon};svg.classList.add("drag");try{svg.setPointerCapture(e.pointerId)}catch(_){}});
  svg.addEventListener("pointermove",e=>{if(!d0)return;st.lon=d0.lon+(e.clientX-d0.x)*360/(svg.clientWidth||800);draw(box)});
  const up=()=>{d0=null;svg.classList.remove("drag")};svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
  new ResizeObserver(()=>{if(box.isConnected&&!box.hidden)draw(box)}).observe(box)}
 box.hidden=false;document.querySelectorAll("#allMapsToggleRow .chip").forEach(c=>c.classList.toggle("active",c.id==="gfDeepChip"));
 gfPaleo.load().then(()=>{const L=box.querySelector(".gfd-load");if(L)L.remove();draw(box)}).catch(()=>{const L=box.querySelector(".gfd-load");if(L)L.textContent="Couldn’t load the plate data"})}
function play(box){st.playing=true;box.querySelector(".gfd-play").textContent="❚❚";if(st.t<1)st.t=gfPaleo.MAX;let last=performance.now();
 const step=n=>{if(!st.playing||!box.isConnected||box.hidden)return stop();const dt=Math.min(.1,(n-last)/1000);last=n;st.t=Math.max(0,st.t-dt*45);draw(box);if(st.t<=0)return stop();st.raf=requestAnimationFrame(step)};st.raf=requestAnimationFrame(step)}
function stop(){st.playing=false;cancelAnimationFrame(st.raf);const b=document.querySelector("#gfDeep .gfd-play");if(b)b.textContent="▶"}
function close(){stop();const box=document.getElementById("gfDeep");if(box)box.hidden=true;const c=document.getElementById("gfDeepChip");if(c)c.classList.remove("active");
 const cur=document.querySelector('#allMapsToggleRow [data-allmaps-mode="'+(typeof allMapsColorMode!=="undefined"?allMapsColorMode:"relief")+'"]');if(cur)cur.classList.add("active")}
function ensure(){const row=document.getElementById("allMapsToggleRow");if(!row||document.getElementById("gfDeepChip"))return;
 const b=document.createElement("button");b.type="button";b.className="chip";b.id="gfDeepChip";b.textContent="Deep Time";b.title="Watch the continents drift over 750 million years";b.onclick=open;row.appendChild(b);
 row.addEventListener("click",e=>{if(e.target.closest("[data-allmaps-mode]"))close()},true)}
const _r=renderAllMapsView;renderAllMapsView=function(){const r=_r.apply(this,arguments);try{ensure()}catch(e){console.error(e)}return r};
window.gfDeepTimeOpen=open;
})();
