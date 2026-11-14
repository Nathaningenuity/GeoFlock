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
/* 5. Tours: the Great Wall is drawn along its real course (the mapped Ming wall), not as a rough line */
(function(){const fix=()=>{try{const G=window.GF_LM_LINES&&GF_LM_LINES["Great Wall of China"];if(!G||typeof PS_TOURS==="undefined")return false;
 Object.values(PS_TOURS).forEach(T=>(T.steps||[]).forEach(S=>{if(!S.lines)return;const i=S.lines.findIndex(L=>L.coords&&L.coords[0]&&L.coords[0][0]===98.22&&L.coords[0][1]===39.8);
  if(i<0)return;const k=S.lines[i].kind;S.lines.splice(i,1,...G.coordinates.filter(c=>c.length>1).map(c=>({coords:c,kind:k==="dash"?"solid":k||"solid",w:2})))}));return true}catch(e){return false}};
 if(!fix())document.addEventListener("DOMContentLoaded",fix)})();
/* 6. Mountain-range names sit on the range itself, along its length, and steep ones read upwards (bottom to top, like the
   Appalachians), never downwards. Position and slant come from each range's mapped shape. */
(function(){if(typeof globeOverlays!=="function"||typeof LANDFORMS==="undefined")return;
 const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\b(mountains|mts|mountain|range|ranges|peninsula|the)\b/g,"").replace(/[^a-z ]/g,"").replace(/\s+/g," ").trim();
 const geomOf=g=>{if(!g||g.t!=="poly")return null;const deep=Array.isArray(g.c[0]&&g.c[0][0]&&g.c[0][0][0]);return{type:"MultiPolygon",coordinates:deep?g.c:g.c.map(r=>[r])}};
 /* ranges, deserts and peninsulas each have a mapped shape (keyed by category so the Atacama desert and a range of the same
    word stay apart) */
 const SC={ranges:"mountains",deserts:"deserts",peninsulas:"peninsulas"};
 let SH=null;function shapes(){if(SH)return SH;SH={};LANDFORMS.items.forEach(o=>{const c=SC[o.cat];if(!c)return;const g=geomOf(o.geom);if(g)(SH[c]=SH[c]||{})[norm(o.name)]=g});return SH}
 const R=d3.geoRobinson();
 function place(g){const pts=[];g.coordinates.forEach(P=>P[0].forEach(c=>{const q=R(c);if(q)pts.push([q,c])}));if(pts.length<3)return null;
  let mx=0,my=0;pts.forEach(([q])=>{mx+=q[0];my+=q[1]});mx/=pts.length;my/=pts.length;let sxx=0,syy=0,sxy=0;pts.forEach(([q])=>{const dx=q[0]-mx,dy=q[1]-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy});
  let a=.5*Math.atan2(2*sxy,sxx-syy)*180/Math.PI;/* -90..90, screen y down */
  /* an elongated range gets its slant; a round one stays level */const l1=(sxx+syy)/2+Math.sqrt(((sxx-syy)/2)**2+sxy*sxy),l2=(sxx+syy)/2-Math.sqrt(((sxx-syy)/2)**2+sxy*sxy);if(l1<2.2*Math.max(l2,1e-9))a=0;
  /* steep names read from top to bottom: a steep slant rising to the right is turned round to read downwards */
  if(a<-50)a+=180;
  /* the middle of the shape along its length: the points halfway along its long axis (a curved range such as the Andes has
     its centre of mass off the range, out to one side) */
  /* (the halfway point of its length, and the middle of its width there: an average of the outline's points would be pulled
     towards wherever the outline is most detailed, as the fjords of Patagonia pull the Andes south) */
  const th=.5*Math.atan2(2*sxy,sxx-syy),ux=Math.cos(th),uy=Math.sin(th);let t0=1e18,t1=-1e18;pts.forEach(([q])=>{const t=(q[0]-mx)*ux+(q[1]-my)*uy;if(t<t0)t0=t;if(t>t1)t1=t});
  const tm=(t0+t1)/2,span=(t1-t0)||1;let w0=1e18,w1=-1e18;pts.forEach(([q])=>{const t=(q[0]-mx)*ux+(q[1]-my)*uy;if(Math.abs(t-tm)<span*.06){const w=-(q[0]-mx)*uy+(q[1]-my)*ux;if(w<w0)w0=w;if(w>w1)w1=w}});
  if(w1>=w0){const wm=(w0+w1)/2,X=mx+tm*ux-wm*uy,Y=my+tm*uy+wm*ux;mx=X;my=Y}
  let ll=R.invert([mx,my]);if(ll&&!d3.geoContains(g,ll)){let best=null,bd=1e18;pts.forEach(([q,c])=>{const d=(q[0]-mx)**2+(q[1]-my)**2;if(d<bd){bd=d;best=c}});ll=best}
  return ll?{ll,ang:a}:null}
 const _go=globeOverlays;globeOverlays=function(){const O=_go.apply(this,arguments);try{if(O&&O.landforms&&!O._gfRng){O._gfRng=1;const S=shapes();
  Object.keys(S).forEach(cat=>(O.landforms[cat]||[]).forEach(L=>{const g=S[cat][norm(L.n)];if(!g)return;const p=place(g);if(p){L.ll=p.ll;L.ang=p.ang}}))}}catch(e){console.error(e)}return O}})();
/* 7. The Caspian Sea's hover outline follows its real shore, Garabogaz Bay included (Natural Earth 1:10m coast, public domain) */
(function(){if(typeof GlobeView==="undefined")return;let C=null;fetch("textures/CASPIAN.json").then(r=>r.json()).then(g=>{try{if(d3.geoArea(g)>2*Math.PI)g.coordinates[0].reverse()}catch(e){}C={type:"Feature",properties:{n:"Caspian Sea"},geometry:g}}).catch(()=>{});
 const isCasp=W=>{try{if(!W||W===C)return false;const c=d3.geoCentroid(W);return c[0]>46&&c[0]<55&&c[1]>36&&c[1]<48&&d3.geoArea(W)>.004}catch(e){return false}};
 const P=GlobeView.prototype,_r=P._render;P._render=function(){try{if(C&&this.hotWater&&isCasp(this.hotWater))this.hotWater=C}catch(e){}return _r.apply(this,arguments)}})();
/* "Click a country to learn more about it": a small × closes it, and it goes away once a country has been clicked.
   It stays away for a week, and for six weeks once it has been closed or used three times; after that long without
   a country being clicked it comes back as a reminder. */
(function(){const KEY="gfLearnHint",DAY=864e5;let off=false;
 const get=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}},put=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
 const hide=o=>{const t=Math.max(o.click||0,o.x||0);if(!t)return false;return Date.now()-t<((o.n||0)>=3?42:7)*DAY};
 function used(kind){const o=get();o[kind]=Date.now();o.n=(o.n||0)+1;put(o);off=true;sync()}
 function sync(){document.body.classList.toggle("gf-learn-off",off||hide(get()));const el=document.getElementById("gfLearn");if(el&&!el.querySelector(".gf-learn-x")){const b=document.createElement("button");b.type="button";b.className="gf-learn-x";b.setAttribute("aria-label","Hide this tip");b.textContent="×";b.onclick=e=>{e.stopPropagation();used("x")};el.appendChild(b)}}
 if(typeof openFlagZoom==="function"){const _o=openFlagZoom;openFlagZoom=function(){try{if(typeof appMode!=="undefined"&&(appMode==="allmaps"||appMode==="map"))used("click")}catch(e){}return _o.apply(this,arguments)}}
 setInterval(sync,900);sync();
 const st=document.createElement("style");st.textContent=`body.gf-learn-off .gf-learn{display:none !important}#allMapsView .gf-learn{left:50% !important;transform:translateX(-50%);bottom:6px !important;white-space:nowrap}.gf-learn .gf-learn-x{pointer-events:auto;margin-left:6px;border:0;background:rgba(0,0,0,.08);color:inherit;border-radius:50%;width:17px;height:17px;line-height:15px;padding:0;font:700 13px system-ui;cursor:pointer;vertical-align:middle}.gf-learn .gf-learn-x:hover{background:rgba(0,0,0,.18)}body.sky-night .gf-learn .gf-learn-x,body.dark-theme .gf-learn .gf-learn-x{background:rgba(255,255,255,.15)}`;document.head.appendChild(st)})();
/* Tour stops can switch map layers on for just that stop: on:["resources","hazards","plates","rivers","grid", …].
   They go off again when the tour moves to a stop without them, or ends. */
(function(){if(typeof psGo!=="function")return;
 const IDS={rivers:"allMapsRiversToggle",lakes:"allMapsLakesToggle",landforms:"allMapsLandformsToggle",borders:"allMapsBordersToggle",cities:"allMapsCitiesToggle",labels:"allMapsShowLabelsToggle",ocean:"allMapsSeaLabelsToggle",grid:"allMapsGraticuleToggle",plates:"allMapsPlatesToggle",timezones:"allMapsTimeZonesToggle",daynight:"gfDayNightToggle",currents:"gfEimToggle"};
 const BYLABEL={resources:"Resources",connections:"Connections",hazards:"Hazards",motion:"Plate motion"};
 function input(n){if(IDS[n])return document.getElementById(IDS[n]);const t=BYLABEL[n];if(!t)return null;return[...document.querySelectorAll("#allMapsView label")].map(l=>l.querySelector("input[type=checkbox]")&&l.textContent.trim().startsWith(t)?l.querySelector("input"):null).find(Boolean)||null}
 window.gfTourToggleInput=input;
 /* switching off sets the box directly (a click during a tour can be held back by the tour's own toggle guard) */
 const setOff=i=>{i.checked=false;i.dispatchEvent(new Event("change",{bubbles:true}))};
 /* the stop on screen is watched (a stop can be reached many ways), and whatever a stop switched on goes off when it is left */
 let lastI=null,lastT=null,onNow=[];
 setInterval(()=>{try{const live=typeof ps!=="undefined"&&ps&&typeof appMode!=="undefined"&&appMode==="allmaps";
  if(!live){if(onNow.length){onNow.forEach(n=>{const i=input(n);if(i&&i.checked)setOff(i)});onNow=[]}lastI=lastT=null;return}
  if(ps.i===lastI&&ps.tour===lastT)return;lastI=ps.i;lastT=ps.tour;const S=(psSteps()||[])[ps.i]||{},want=new Set(S.on||[]);
  onNow.forEach(n=>{if(want.has(n))return;const i=input(n);if(i&&i.checked)setOff(i)});const kept=onNow.filter(n=>want.has(n));
  want.forEach(n=>{if(kept.includes(n))return;const i=input(n);if(i&&!i.checked){i.checked=true;i.dispatchEvent(new Event("change",{bubbles:true}));kept.push(n)}});onNow=kept}catch(e){console.error(e)}},300);
})();
/* stops in existing tours that show a map layer: resource icons, hazards, plate motion, currents, grid lines, routes, day and night */
(function(){const ADD={resources:{0:["resources"],1:["resources"],2:["resources"],3:["resources"],4:["resources"],9:["resources"],10:["resources"],11:["resources"],12:["resources"],13:["resources"],14:["resources"]},
 hazards:{0:["hazards"],5:["hazards"],6:["hazards"],7:["hazards"],9:["hazards"],10:["hazards"]},plates:{3:["motion"],8:["motion"],15:["motion"]},
 transport:{0:["connections"],1:["connections"],2:["connections"],3:["connections"]},seas:{6:["currents"]},climate:{12:["currents"],7:["grid"]},geo:{7:["grid"]},time:{1:["daynight"]}};
 const TITLES={resources:"Energy and resources",hazards:"Natural hazards",plates:"Plate tectonics",transport:"Transport and trade",seas:"Seas & oceans",climate:"The world’s climates",geo:"The world’s best surprises",time:"Time zones"};
 function apply(){try{for(const k in ADD){const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[k];if(!T||!T.steps||!T.steps[0]||T.steps[0].title!==TITLES[k])continue;for(const i in ADD[k]){const S=T.steps[+i];if(S&&!S.on)S.on=ADD[k][i]}}}catch(e){}}
 apply();addEventListener("load",()=>setTimeout(apply,1500))})();
/* 7. Sea names on the globe.
   - Where: always inside the name's own sea (the Bay of Campeche in the southern Gulf of Mexico, the Arabian Sea west of
     India, the North Atlantic out in the open ocean and not in the Bay of Biscay), at the most open water of the part of
     that sea in view: the spot farthest from its edges (coasts, and the lines where it meets its neighbours), from the
     screen's edge and from names already placed. A sea partly in view keeps its name, moved into the part that shows.
     The spots are worked out from the sea's own outline in longitude and latitude when the sea is first named (the
     earlier spots, kept from page load, could be some 30 degrees out, putting the Arabian Sea in the Bay of Bengal).
   - Which way: level whenever a level name fits inside the sea there; only a sea too narrow for that (the Red Sea,
     the Gulf of California, the Adriatic) has its name slanted along its length, steep names reading top to bottom.
   - Size: grows as the globe is zoomed in, like the country and city names, and a little more (about half as big
     again close up), so a sea name is not lost beside the land's names. */
(function(){if(typeof GlobeView==="undefined"||typeof ALLMAPS_MARINE==="undefined"||typeof globeParsePath!=="function")return;
 const ANG=new Map();
 ALLMAPS_MARINE.forEach(r=>{try{const n=r[0],d=r[4];if(!n||!d||ANG.has(n))return;const pts=globeParsePath(d).flat();if(pts.length<6)return;
  let mx=0,my=0;pts.forEach(q=>{mx+=q[0];my+=q[1]});mx/=pts.length;my/=pts.length;let sxx=0,syy=0,sxy=0;pts.forEach(q=>{const dx=q[0]-mx,dy=q[1]-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy});
  const h=(sxx+syy)/2,r2=Math.sqrt(((sxx-syy)/2)**2+sxy*sxy),l1=h+r2,l2=h-r2;let a=.5*Math.atan2(2*sxy,sxx-syy)*180/Math.PI;
  if(l1<3*Math.max(l2,1e-9)||Math.abs(a)<12)a=0;if(a<-50)a+=180;ANG.set(n,a)}catch(e){}});
 const D2R=Math.PI/180;
 /* the sea's outline as flat rings of [lon,lat] (outer rings and islands alike: inside = inside an odd number of rings).
    Each ring is made continuous in longitude: a point on the map's edge can come back as 180 degrees east or west, and a
    ring jumping right round the world that way made the North Pacific take in the Atlantic and the Mediterranean. A spot
    is then tested as it is and a whole turn east and west. */
 function geo(S){if(S._g!==undefined)return S._g;let g=null;try{const R=[];(S.poly&&S.poly.coordinates||[]).forEach(P=>P.forEach(r=>{if(!r||r.length<4)return;const c=[[r[0][0],r[0][1]]];for(let i=1;i<r.length;i++){let x=r[i][0];const px=c[i-1][0];while(x-px>180)x-=360;while(x-px<-180)x+=360;c.push([x,r[i][1]])}R.push(c)}));
  if(R.length){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;R.forEach(r=>r.forEach(q=>{if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}));g={R,bb:[x0,y0,x1,y1]}}}catch(e){}return S._g=g}
 function in1(g,x,y){let c=false;for(const r of g.R)for(let i=0,j=r.length-1;i<r.length;j=i++){const xi=r[i][0],yi=r[i][1],xj=r[j][0],yj=r[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
 function inside(g,x,y){return in1(g,x,y)||(g.bb[0]<-180&&in1(g,x-360,y))||(g.bb[2]>180&&in1(g,x+360,y))}
 /* distance (radians, roughly) from a spot to the nearest edge of the sea */
 function ed1(g,x,y){const k=Math.cos(y*D2R);let best=1e9;for(const r of g.R)for(let i=0,j=r.length-1;i<r.length;j=i++){const ax=(r[j][0]-x)*k,ay=r[j][1]-y,bx=(r[i][0]-x)*k,by=r[i][1]-y,vx=bx-ax,vy=by-ay,L=vx*vx+vy*vy;let t=L?-(ax*vx+ay*vy)/L:0;t=t<0?0:t>1?1:t;const dx=ax+t*vx,dy=ay+t*vy,d=dx*dx+dy*dy;if(d<best)best=d}return best}
 function edgeDist(g,x,y){let b=ed1(g,x,y);if(g.bb[0]<-180)b=Math.min(b,ed1(g,x-360,y));if(g.bb[2]>180)b=Math.min(b,ed1(g,x+360,y));return Math.sqrt(b)*D2R}
 /* spots inside the sea, on a grid over its outline's box, each with its distance to the sea's edge */
 function spots(S){if(S._sp)return S._sp;const g=geo(S),C=[];if(g){const[x0,y0,x1,y1]=g.bb,N=26;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=x0+(x1-x0)*(i+.5)/(N+1),y=y0+(y1-y0)*(j+.5)/(N+1);if(inside(g,x,y))C.push({ll:[((x+540)%360)-180,y],dm:edgeDist(g,x,y)})}
  if(S.ll&&inside(g,S.ll[0],S.ll[1]))C.push({ll:S.ll,dm:edgeDist(g,S.ll[0],S.ll[1]),home:true})}return S._sp=C}
 window.gfSeaGeo={geo,inside,ANG};
 const P=GlobeView.prototype,_s=P._seaLabels;if(!_s)return;
 P._seaLabels=function(ctx,p,O,show,onRaster){if(this._flat||!O||!O.seas)return _s.apply(this,arguments);window.gfSeaGeo.O=O;
  const zr=.7/this.zoom,darkSea=!onRaster&&!document.body.classList.contains("light-theme"),ink=darkSea?"rgba(178,212,240,0.92)":"rgba(28,78,128,0.85)",halo=darkSea?"rgba(10,20,45,0.75)":"rgba(255,255,255,0.35)";
  const grow=1+.25*Math.max(0,Math.min(1,(this.zoom-1.5)/4.5)),k=this.ls()*grow,sizes=[7.6*k,6*k,5.2*k,4.8*k];
  const{w,h,r:RD}=this.size(),pr=this.projection(),R=pr.scale(),ctr=[-this.rot[0],-this.rot[1]],vis=Math.min(1.2,this.visibleAngle?this.visibleAngle():1.2);
  /* the part of the world in view, for spots made on the fly close up */
  let vb=null;if(this.zoom>2.5){const L=[];for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){const q=pr.invert([w*i/4,h*j/4]);if(q&&isFinite(q[0]))L.push(q)}if(L.length===25){const xs=L.map(q=>q[0]),ys=L.map(q=>q[1]);if(Math.max(...xs)-Math.min(...xs)<180)vb=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}}
  /* the part of the globe's canvas that is on the page (the canvas can run below the window) */
  let X0=0,Y0=0,X1=w,Y1=h;try{const rc=this.canvas.getBoundingClientRect();if(rc.width>0){X0=Math.max(0,-rc.left);Y0=Math.max(0,-rc.top);X1=Math.min(w,innerWidth-rc.left);Y1=Math.min(h,innerHeight-rc.top-30)}}catch(e){}if(X1-X0<100||Y1-Y0<100){X0=0;Y0=0;X1=w;Y1=h}
  /* not under the map's own buttons and panels (the map key, the zoom buttons, a notice) */
  let rc0=null;try{rc0=this.canvas.getBoundingClientRect();if(!(rc0.width>0))rc0=null}catch(e){}
  const hidden=(x,y)=>{if(!rc0)return false;try{const el=document.elementFromPoint(rc0.left+x,rc0.top+y);return!!el&&el.tagName!=="CANVAS"&&el!==this.host&&!(el.closest&&el.closest("svg"))}catch(e){return false}};
  O.seas.forEach(S=>{const tier=SEA_TIERS[Math.min(S.tier,3)];if(zr>tier.show)return;const g=geo(S);if(!g)return;
   if(vb&&![0,-360,360].some(o=>!(g.bb[2]+o<vb[0]||g.bb[0]+o>vb[2]||g.bb[3]<vb[1]||g.bb[1]>vb[3])))return;
   const fs=sizes[Math.min(S.tier,3)],font="italic 500 "+fs.toFixed(1)+'px Inter, "Baloo 2", system-ui, sans-serif';ctx.font=font;const tw=ctx.measureText(S.n).width;
   let C=spots(S).filter(A=>d3.geoDistance(A.ll,ctr)<vis);
   /* close up, the sea's grid can be coarser than the view: add spots across the screen that are in this sea */
   if(vb&&C.length<4){for(let i=1;i<10;i++)for(let j=1;j<8;j++){const q=pr.invert([X0+(X1-X0)*i/10,Y0+(Y1-Y0)*j/8]);if(q&&isFinite(q[0])&&inside(g,q[0],q[1]))C.push({ll:q,dm:edgeDist(g,q[0],q[1])})}}
   if(!C.length)return;
   /* how open each spot is on screen: its distance to the sea's edge, to the screen's edge, to the globe's rim */
   const sc=[];for(const A of C){const xy=p(A.ll);if(!xy)continue;const cd=d3.geoDistance(A.ll,ctr);const open=Math.min(A.dm*R*Math.max(.25,Math.cos(cd)),xy[0]-X0,X1-xy[0],(xy[1]-Y0)*1.5,(Y1-xy[1])*1.5,(Math.min(R*Math.sin(vis),RD)-Math.hypot(xy[0]-w/2,xy[1]-h/2)));if(open<fs*.6)continue;/* (a little nearer the middle of the view wins a tie: the open western Mediterranean, not its far corner) */const mid=Math.hypot(xy[0]-(X0+X1)/2,xy[1]-(Y0+Y1)/2)/Math.hypot((X1-X0)/2,(Y1-Y0)/2);sc.push({A,xy,open:open*(A.home?1.08:1)*(1-.35*Math.min(1,mid))})}
   sc.sort((u,v)=>v.open-u.open);
   const a0=(ANG.get(S.n)||0)*D2R;
   /* a name fits at a spot when its box (ends, corners, middle) is wholly inside the sea */
   const fits=(xy,a)=>{const ca=Math.cos(a),sa=Math.sin(a),hx=tw/2+2,hy=fs/2+1;for(const[u,v] of [[0,0],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1],[-.5,-1],[.5,-1],[-.5,1],[.5,1],[0,-1],[0,1]]){const X=xy[0]+ca*u*hx-sa*v*hy,Y=xy[1]+sa*u*hx+ca*v*hy;if(X<X0+2||Y<Y0+2||X>X1-2||Y>Y1-2||Math.hypot(X-w/2,Y-h/2)>Math.min(R,RD)-4)return false;const q=pr.invert([X,Y]);if(!q||!isFinite(q[0])||!inside(g,q[0],q[1]))return false}return true};
   const box=(xy,a)=>{const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),hw=(tw*c+fs*s)/2,hh=(tw*s+fs*c)/2;return[xy[0]-hw,xy[1]-hh,xy[0]+hw,xy[1]+hh]};
   let pick=null,fb=null;
   for(const E of sc.slice(0,14)){const tries=[0];if(a0)tries.push(a0);for(const a of tries){const b=box(E.xy,a);if(!this._fits(b)){continue}
     /* (_fits took the box; it is given back unless this is the spot chosen) */this._placed.pop();
     if(fits(E.xy,a)&&![-1,0,1].some(u=>hidden(E.xy[0]+Math.cos(a)*u*tw/2,E.xy[1]+Math.sin(a)*u*tw/2))){pick={E,a,b};break}if(!fb&&a===0)fb={E,a,b}}if(pick)break}
   /* nowhere does the whole name fit inside the sea: still named, level, at its most open spot in view, as long as the
      name stays mostly on its water (its middle and both ends) */
   if(!pick&&fb){const ok=[[0],[-.45],[.45]].every(([u])=>{const X=fb.E.xy[0]+u*tw,Y=fb.E.xy[1];if(X<X0||X>X1||Math.hypot(X-w/2,Y-h/2)>Math.min(R,RD)-4||hidden(X,Y))return false;const q=pr.invert([X,Y]);return q&&isFinite(q[0])&&inside(g,q[0],q[1])});if(ok)pick=fb}
   if(!pick)return;this._placed.push(pick.b);this._text(ctx,S.n,pick.E.xy[0],pick.E.xy[1],ink,halo,font,pick.a||undefined)})}})();
