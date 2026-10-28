/* GeoFlock: map tools, batch of Oct 2026.
   1. Population map: two views, "Density map" (the usual) and "Cartogram" — Our World in Data's
      "All the people in the world" (Max Roser, 2018, CC BY), shown zoomable where the map is. The old circle cartogram is hidden for now. */
(function(){
const $=id=>document.getElementById(id);
const mode=()=>{try{return appMode==="allmaps"?allMapsColorMode:null}catch(e){return null}};
const css=document.createElement("style");css.textContent=`
#allMapsSubModes.gf-pop [data-allmaps-sub], #amGlobeSubs [data-sub="carto"]{ display:none !important; }
#allMapsSubModes .gf-popv{ display:inline-flex !important; }
.gf-owid{ position:absolute; inset:0; z-index:40; background:#2e3a4f; border-radius:14px; overflow:hidden; touch-action:none; cursor:grab; }
.gf-owid.drag{ cursor:grabbing; }
.gf-owid img{ position:absolute; left:0; top:0; transform-origin:0 0; user-select:none; -webkit-user-drag:none; max-width:none; image-rendering:auto; }
.gf-owid .gf-ow-btns{ position:absolute; right:10px; top:10px; display:flex; flex-direction:column; gap:6px; z-index:2; }
.gf-owid .gf-ow-btns button{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; font:700 17px system-ui; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.25); }
.gf-owid .gf-ow-cap{ position:absolute; left:10px; bottom:8px; right:60px; z-index:2; font:12px/1.35 system-ui,sans-serif; color:#e9eef7; text-shadow:0 1px 2px #000; }
.gf-owid .gf-ow-cap a{ color:#ffd98a; }`;document.head.appendChild(css);
let view="dens",box=null,T={s:1,x:0,y:0},W=6985,H=2670;
function host(){try{return amGlobe&&amGlobe._flat&&amGlobe.host.isConnected?amGlobe.host:null}catch(e){return null}}
function chips(){const row=$("allMapsSubModes");if(!row)return;row.classList.toggle("gf-pop",mode()==="population");let a=row.querySelector('.gf-popv[data-v="dens"]');
 if(mode()!=="population"){row.querySelectorAll(".gf-popv").forEach(b=>b.remove());return}
 if(!a){row.insertAdjacentHTML("beforeend",'<button type="button" class="chip sub-chip gf-popv" data-v="dens">Density map</button><button type="button" class="chip sub-chip gf-popv" data-v="owid" title="All the people in the world: one square for every 500,000 people (Our World in Data)">Cartogram</button>');
  row.querySelectorAll(".gf-popv").forEach(b=>b.onclick=()=>{view=b.dataset.v;sync()})}
 row.querySelectorAll(".gf-popv").forEach(b=>b.classList.toggle("active",b.dataset.v===view))}
function fit(){if(!box)return;const r=box.getBoundingClientRect();const s=Math.min(r.width/W,r.height/H);T={s,x:(r.width-W*s)/2,y:(r.height-H*s)/2};paint()}
function paint(){const im=box&&box.querySelector("img");if(im)im.style.transform="translate("+T.x+"px,"+T.y+"px) scale("+T.s+")"}
function zoomAt(k,cx,cy){const r=box.getBoundingClientRect(),min=Math.min(r.width/W,r.height/H);const s=Math.max(min,Math.min(min*12,T.s*k));k=s/T.s;T.x=cx-(cx-T.x)*k;T.y=cy-(cy-T.y)*k;T.s=s;clamp();paint()}
function clamp(){const r=box.getBoundingClientRect(),w=W*T.s,h=H*T.s;T.x=w<=r.width?(r.width-w)/2:Math.min(0,Math.max(r.width-w,T.x));T.y=h<=r.height?(r.height-h)/2:Math.min(0,Math.max(r.height-h,T.y))}
function open(){const h=host();if(!h)return;if(box&&box.parentNode===h)return;close();
 box=document.createElement("div");box.className="gf-owid";
 box.innerHTML='<img src="textures/OWID_POP_CARTOGRAM.webp" alt="All the people in the world: a cartogram where each country is sized by its population, one square per 500,000 people" draggable="false"><div class="gf-ow-btns"><button type="button" data-z="in" title="Zoom in">+</button><button type="button" data-z="out" title="Zoom out">−</button><button type="button" data-z="fit" title="Whole world">↺</button></div>'+
  '<div class="gf-ow-cap">“All the people in the world” by Max Roser, <a href="https://ourworldindata.org/world-population-cartogram" target="_blank" rel="noopener">Our World in Data</a> (2018), CC BY. Each square is 500,000 people; data: UN Population Division.</div>';
 if(getComputedStyle(h).position==="static")h.style.position="relative";h.appendChild(box);
 const im=box.querySelector("img");im.onload=()=>{W=im.naturalWidth||W;H=im.naturalHeight||H;fit()};fit();
 box.querySelectorAll("[data-z]").forEach(b=>b.onclick=e=>{e.stopPropagation();const r=box.getBoundingClientRect();if(b.dataset.z==="fit")fit();else zoomAt(b.dataset.z==="in"?1.6:1/1.6,r.width/2,r.height/2)});
 box.addEventListener("wheel",e=>{e.preventDefault();e.stopPropagation();const r=box.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.0018),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 let d=null;const pts=new Map();
 box.addEventListener("pointerdown",e=>{if(e.target.closest("button,a"))return;e.stopPropagation();box.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);d={x:e.clientX,y:e.clientY,pd:null};box.classList.add("drag")});
 box.addEventListener("pointermove",e=>{if(!d||!pts.has(e.pointerId))return;e.stopPropagation();const prev=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pts.size>=2){const [a,b]=[...pts.values()],dist=Math.hypot(a[0]-b[0],a[1]-b[1]),r=box.getBoundingClientRect();if(d.pd)zoomAt(dist/d.pd,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);d.pd=dist;return}
  T.x+=e.clientX-prev[0];T.y+=e.clientY-prev[1];clamp();paint()});
 const up=e=>{pts.delete(e.pointerId);if(pts.size<2&&d)d.pd=null;if(!pts.size){d=null;box.classList.remove("drag")}};box.addEventListener("pointerup",up);box.addEventListener("pointercancel",up);
 box.addEventListener("dblclick",e=>{const r=box.getBoundingClientRect();zoomAt(2,e.clientX-r.left,e.clientY-r.top)})}
function close(){if(box){box.remove();box=null}}
function sync(){chips();if(mode()!=="population")view="dens";if(view==="owid"&&mode()==="population")open();else close()}
window.gfPopView=v=>{view=v;sync()};
setInterval(()=>{try{sync()}catch(e){}},400);
addEventListener("resize",()=>{if(box)fit()});
})();
/* 2. Pop-up windows can be dragged: by their title, their top strip or their empty edges (never by buttons, images, maps or text fields) */
(function(){
const SEL=".flag-zoom-panel, .game-modal, .modal-panel";
const st=document.createElement("style");st.textContent=`.flag-zoom-panel h2,.game-modal h2,.game-modal h3,.modal-panel .modal-header,.modal-panel .modal-title{cursor:move}.gf-mdrag{user-select:none;transition:none !important}`;document.head.appendChild(st);
addEventListener("pointerdown",e=>{if(e.button)return;const box=e.target.closest&&e.target.closest(SEL);if(!box)return;
 if(e.target.closest("button,a,input,select,textarea,label,[contenteditable],img,canvas,svg,video,iframe,.no-drag,[draggable=true]"))return;
 const r=box.getBoundingClientRect(),inTop=e.clientY-r.top<34,head=!!e.target.closest("h1,h2,h3,.modal-header,.modal-title"),edge=e.target===box;if(!inTop&&!head&&!edge)return;
 const m=/(-?[\d.]+)px\s+(-?[\d.]+)px/.exec(box.style.translate||"")||[0,0,0],x0=+m[1],y0=+m[2],sx=e.clientX,sy=e.clientY;let moved=false;
 const mv=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(!moved&&Math.hypot(dx,dy)<4)return;moved=true;box.classList.add("gf-mdrag");
  const nx=Math.max(-r.left-r.width+80,Math.min(innerWidth-r.left-80,x0+dx)),ny=Math.max(-r.top,Math.min(innerHeight-r.top-40,y0+dy));box.style.translate=nx+"px "+ny+"px";ev.preventDefault()};
 const up=()=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true);box.classList.remove("gf-mdrag");if(moved){const k=ev=>{ev.stopPropagation();ev.preventDefault();removeEventListener("click",k,true)};addEventListener("click",k,true);setTimeout(()=>removeEventListener("click",k,true),50)}};
 addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)},true);
/* a closed window comes back centred next time */
setInterval(()=>{document.querySelectorAll(SEL).forEach(b=>{if(b.style.translate&&!b.offsetParent)b.style.translate=""})},500);
})();
/* 3. Flat map lock: a padlock in the right-hand buttons (in place of the spin button the globe has). Locked, a sideways drag no
   longer spins the world round east–west; zoomed in, the map still pans inside its edges. */
(function(){
let locked=false;try{locked=localStorage.getItem("gfFlatLock")==="1"}catch(e){}
const ICO=on=>'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="'+(on?"M8 11V7a4 4 0 0 1 8 0v4":"M8 11V7a4 4 0 0 1 7.8-1.2")+'"/></svg>';
const st=document.createElement("style");st.textContent=`.globe-btns .gf-lock.on{ background:#2f6fb0 !important; color:#fff !important; }`;document.head.appendChild(st);
function sync(){let g;try{g=amGlobe}catch(e){return}if(!g||!g.host)return;const btns=g.host.querySelector(".globe-btns");if(!btns)return;let b=btns.querySelector(".gf-lock");
 if(!g._flat){if(b)b.remove();g._spinOK=undefined;return}
 if(!b){b=document.createElement("button");b.type="button";b.className="gf-lock";const after=btns.querySelector('[data-g="reset"]');after?after.after(b):btns.appendChild(b);
  b.onclick=e=>{e.stopPropagation();locked=!locked;try{localStorage.setItem("gfFlatLock",locked?"1":"0")}catch(_){}sync()}}
 if(b._on!==locked){b._on=locked;b.innerHTML=ICO(locked);b.classList.toggle("on",locked);b.title=locked?"Map locked: it won't spin east–west. Click to unlock":"Lock the map so it doesn't spin east–west";b.setAttribute("aria-pressed",String(locked))}
 g._spinOK=locked?false:undefined;if(locked&&g._gfOx){g._gfOx=0;g.request&&g.request()}}
setInterval(()=>{try{sync()}catch(e){}},400);
})();
/* 4. Projections and Deep Time are separate views: opening one closes the other */
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#gfDeepChip, #projTabChip");if(!t)return;
 try{if(t.id==="gfDeepChip"){if(typeof proj!=="undefined"&&proj.on)projShow(false)}
  else{const d=document.getElementById("gfDeep");if(d&&!d.hidden){d.hidden=true;const c=document.getElementById("gfDeepChip");if(c)c.classList.remove("active")}}}catch(_){}},true);
