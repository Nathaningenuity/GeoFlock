/* GeoFlock: the Toolkit tray's layout, chosen by the user and remembered.
   - The tray floats over the page (position: fixed), wherever it was put: it never moves with the page's layout, the
     History timeline or any other bar, and it stays in its place when another map is chosen. Full screen keeps a place
     of its own (the screen is laid out differently there), and the tray can be dragged anywhere in it too.
   - Move it: drag the tray by its tab (a click still opens and closes it). Let go near the left or right edge of the
     window and it becomes a column; anywhere else it is a row, where you let go. Esc while dragging puts it back where it
     was; letting go anywhere (also outside the window) ends the drag.
   - Make it shorter: pull either end of the tray (or of the column); the gadgets then scroll inside it.
   - ⚙ on the tab: a list of every gadget with a tick box; untick to hide it from the tray.
   - While the map is scrolled wholly out of view the tray is hidden (not moved).
   - Phones keep the tray under the map (geoflock-uxfix.js).
   Saved in this browser (localStorage gfKitLayout): pn / pf = the place outside / in full screen (the top left corner of
   the open tray, in window pixels), col = a column. */
(function(){
const KEY="gfKitLayout";
let L={col:false,lenRow:null,lenCol:null,hidden:[]};try{Object.assign(L,JSON.parse(localStorage.getItem(KEY)||"{}"));delete L.len}catch(e){}
/* the People gadget starts hidden (tick it under ⚙ to show it) */
if(!L.v2){L.v2=1;if(!L.hidden.includes("gfk-people"))L.hidden.push("gfk-people");try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}}
/* the older docked layouts (a row on the map's bottom, a column on its left or right) become a floating row or column */
if(L.dock&&L.dock!=="free")L.col=L.dock!=="bottom";
if(!L.fsb){L.fsb=1;delete L.pf}
const saveL=()=>{try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}};
const tray=()=>document.getElementById("gfKit");
const host=()=>{const t=tray();return t&&t.parentElement};
const nameOf=b=>b.getAttribute("aria-label")||(b.querySelector("span")||{}).textContent||b.dataset.tool||"";
const keyOf=b=>b.dataset.tool||[...b.classList].find(c=>/^gfk-(?!slot)/.test(c))||nameOf(b);
const phone=()=>innerWidth<=640;
const FS=()=>document.body.classList.contains("gf-fs");
const PK=()=>FS()?"pf":"pn";
const PROPS=["position","left","top","right","bottom","translate","transform","margin","z-index","visibility"];
const put=(t,k,v)=>{if(t.style.getPropertyValue(k)!==v||t.style.getPropertyPriority(k)!=="important")t.style.setProperty(k,v,"important")};
/* the place where the tray first appears: the bottom left corner of the map (just above the timeline strip in full screen) */
function defPos(t,oh){const h=host();if(FS())return{x:10,y:Math.round(innerHeight-oh-4)};/* full screen: along the very bottom, over the History timeline */
 if(L.dock==="free"&&L.fx!=null&&h){const hr=h.getBoundingClientRect();if(hr.width)return{x:Math.round(hr.left+L.fx),y:Math.round(hr.top+(L.fy||0))}}
 const r=h&&h.getBoundingClientRect();if(r&&r.width&&r.bottom>60&&r.top<innerHeight-60)return{x:Math.round(r.left+12),y:Math.round(Math.min(r.bottom,innerHeight)-oh-6)};
 return{x:12,y:Math.round(innerHeight-oh-12)}}
/* where the tray may sit: in full screen anywhere on the screen; otherwise inside the map (or the screen, if the map is smaller) */
function bounds(w,th){const h=host();if(FS()||!h)return{l:4,r:innerWidth-w-4,t:4,b:innerHeight-th-4};const r=h.getBoundingClientRect();
 const l=r.left+4,rr=r.right-w-4,t=r.top+4,b=r.bottom-th-4;return{l:Math.min(l,Math.max(4,rr)),r:Math.max(l,rr),t:Math.min(t,Math.max(4,b)),b:Math.max(t,b)}}
let shown=true;
function apply(){const t=tray();if(!t)return;const f=t.querySelector(".gfk-felt");if(!f)return;
 f.querySelectorAll(".gfk-slot").forEach(b=>{b.classList.toggle("gfkl-hide",L.hidden.includes(keyOf(b)))});
 t.classList.remove("gfkl-left","gfkl-right");
 /* phones: the tray hangs under the map, laid out by the page's own rules */
 if(phone()){if(t.classList.contains("gfkl-fixed")){t.classList.remove("gfkl-fixed","gfkl-col","gfkl-free");PROPS.forEach(k=>t.style.removeProperty(k));f.style.maxWidth=f.style.maxHeight=""}return}
 if(!t.getClientRects().length)return;
 t.classList.add("gfkl-fixed");t.classList.toggle("gfkl-col",!!L.col);t.classList.toggle("gfkl-free",true);
 f.style.maxWidth=!L.col&&L.lenRow?Math.max(130,Math.min(L.lenRow,innerWidth-24))+"px":"";
 f.style.maxHeight=L.col?(L.lenCol?Math.max(130,Math.min(L.lenCol,innerHeight-90)):Math.max(160,Math.min(innerHeight-90,520)))+"px":"";
 put(t,"position","fixed");put(t,"right","auto");put(t,"bottom","auto");put(t,"translate","none");put(t,"transform","none");put(t,"margin","0");put(t,"z-index","40");
 const w=t.offsetWidth||300,th=t.offsetHeight||120,closed=t.classList.contains("closed");
 /* folding keeps the bottom edge where it was: the tray folds down, not up (the open height is remembered) */
 if(!closed&&th>40)L.fh=th;const oh=closed?Math.max(th,L.fh||th):th;
 const k=PK(),h0=host(),HR=!FS()&&h0?h0.getBoundingClientRect():null;
 /* outside full screen the place is kept relative to the map (L.rel): the tray rides with the map when the page scrolls and
    stays inside the map, so it never sits on the History timeline or other bars under it */
 if(k==="pn"&&HR&&L.pn&&!L.rel&&isFinite(L.pn.x)){L.pn={x:Math.round(L.pn.x-HR.left),y:Math.round(L.pn.y-HR.top)};L.rel=1;saveL()}
 if(!L[k]||!isFinite(L[k].x)||!isFinite(L[k].y)){const d=defPos(t,oh);L[k]=k==="pn"&&HR?{x:Math.round(d.x-HR.left),y:Math.round(d.y-HR.top)}:d;if(k==="pn")L.rel=1;saveL()}
 const P=L[k],fold=closed?oh-th:0,B=bounds(w,th);
 const ax=k==="pn"&&HR?HR.left+P.x:P.x,ay=k==="pn"&&HR?HR.top+P.y:P.y;
 const x=Math.max(B.l,Math.min(B.r,ax)),y=Math.max(B.t,Math.min(B.b,ay+fold));
 put(t,"left",Math.round(x)+"px");put(t,"top",Math.round(y)+"px");
 /* the map scrolled wholly out of view: hidden where it is */
 const h=host(),hr=h&&!FS()?h.getBoundingClientRect():null;const vis=!hr||!hr.height||(hr.bottom>0&&hr.top<innerHeight);
 if(vis!==shown||t.style.getPropertyValue("visibility")!==(vis?"visible":"hidden")){shown=vis;put(t,"visibility",vis?"visible":"hidden")}}

/* ---------- the tab: drag to move, click to open/close, ⚙ for the gadgets ---------- */
let drag=null,swallow=false;
function endDrag(cancel){const t=tray();if(!drag)return;const d=drag;drag=null;if(t)t.classList.remove("gfkl-moving");document.documentElement.classList.remove("gfkl-dragging");
 try{d.tab.releasePointerCapture(d.id)}catch(x){}
 if(cancel&&d.moved){L[d.k]=d.start;L.col=d.col0;apply()}
 if(d.moved){swallow=true;setTimeout(()=>swallow=false,80);if(!cancel)saveL()}}
function wire(){const t=tray();if(!t||t._gfkl)return;const tab=t.querySelector(".gfk-tab"),f=t.querySelector(".gfk-felt");if(!tab||!f)return;t._gfkl=1;
 const gear=document.createElement("span");gear.className="gfkl-gear";gear.setAttribute("role","button");gear.title="Choose which gadgets show";gear.textContent="⚙";tab.appendChild(gear);
 /* not a <span>: the toolkit relabels the tab's first span */const grip=document.createElement("b");grip.className="gfkl-grip";grip.title="Drag to move the toolkit";grip.textContent="⋮⋮";tab.insertBefore(grip,tab.firstChild);
 gear.addEventListener("click",e=>{e.stopPropagation();e.preventDefault();toggleMenu()});
 gear.addEventListener("pointerdown",e=>e.stopPropagation());
 tab.addEventListener("pointerdown",e=>{if(e.button||phone())return;if(drag)endDrag(false);apply();const tr=t.getBoundingClientRect(),k=PK();
  drag={tab,x0:e.clientX,y0:e.clientY,dx:e.clientX-tr.left,dy:e.clientY-tr.top,moved:false,id:e.pointerId,k,start:Object.assign({},L[k]),col0:!!L.col};try{tab.setPointerCapture(e.pointerId)}catch(x){}});
 /* the tray goes exactly where it is dropped, with the tab held under the pointer the whole way (no easing, no lag) */
 tab.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;
  /* the button was let go where the page could not hear it: the drag is over */
  if(!(e.buttons&1)){endDrag(false);return}
  if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<6)return;
  if(!drag.moved){drag.moved=true;t.classList.add("gfkl-moving");document.documentElement.classList.add("gfkl-dragging");if(menu){menu.remove();menu=null}}
  /* near the left or right edge of the window it stands up as a column; anywhere else it is a row */
  const edge=e.clientX<110||e.clientX>innerWidth-110;if(edge!==!!L.col){L.col=edge;apply();const tr=t.getBoundingClientRect();drag.dx=Math.min(drag.dx,tr.width-20);drag.dy=Math.min(drag.dy,24)}
  /* (a folded tray's place is that of the open tray: it is drawn lower by the height it will open to) */
  const th=t.offsetHeight||120,fold=t.classList.contains("closed")&&L.fh?Math.max(0,L.fh-th):0,w=t.offsetWidth||300;
  /* kept on the screen while dragged: what is shown is where it will stay */
  const B=bounds(w,th),x=Math.max(B.l,Math.min(B.r,e.clientX-drag.dx)),y=Math.max(B.t,Math.min(B.b,e.clientY-drag.dy));
  const h=host(),hr=drag.k==="pn"&&h?h.getBoundingClientRect():{left:0,top:0};
  L[drag.k]={x:Math.round(x-hr.left),y:Math.round(y-fold-hr.top)};apply()});
 tab.addEventListener("pointerup",e=>{if(drag&&e.pointerId===drag.id)endDrag(false)});
 tab.addEventListener("pointercancel",e=>{if(drag&&e.pointerId===drag.id)endDrag(true)});
 tab.addEventListener("lostpointercapture",e=>{if(drag&&e.pointerId===drag.id)endDrag(false)});
 /* a drag is not a click: it must not also open or close the tray */
 tab.addEventListener("click",e=>{if(swallow){e.stopImmediatePropagation();e.preventDefault()}},true);
 /* the two ends: pull to make the tray (or column) shorter or longer */
 ["a","b"].forEach(side=>{const z=document.createElement("span");z.className="gfkl-rz gfkl-rz-"+side;z.title="Pull to make the toolkit shorter or longer";t.appendChild(z);
  z.addEventListener("pointerdown",e=>{if(e.button)return;e.stopPropagation();e.preventDefault();const fr=f.getBoundingClientRect(),col=!!L.col,len0=col?fr.height:fr.width,p0=col?e.clientY:e.clientX,k=PK(),P0=Object.assign({},L[k]);try{z.setPointerCapture(e.pointerId)}catch(x){}
   const mv=ev=>{if(!(ev.buttons&1)){up();return}const d=(col?ev.clientY:ev.clientX)-p0;let len=side==="b"?len0+d:len0-d;len=Math.max(130,len);
    /* pulling the left (or top) end moves that end; the other one stays put */
    if(side==="a"&&P0&&isFinite(P0.x))L[k]=col?{x:P0.x,y:Math.round(P0.y+(len0-len))}:{x:Math.round(P0.x+(len0-len)),y:P0.y};
    if(col)L.lenCol=Math.round(len);else L.lenRow=Math.round(len);apply()};
   const up=()=>{z.removeEventListener("pointermove",mv);z.removeEventListener("pointerup",up);z.removeEventListener("pointercancel",up);z.removeEventListener("lostpointercapture",up);saveL()};
   z.addEventListener("pointermove",mv);z.addEventListener("pointerup",up);z.addEventListener("pointercancel",up);z.addEventListener("lostpointercapture",up)})});
 apply()}
/* Esc while dragging: back where it was (before anything else hears the key, so it does not also leave full screen) */
addEventListener("keydown",e=>{if(e.key==="Escape"&&drag){e.preventDefault();e.stopImmediatePropagation();endDrag(true)}},true);
addEventListener("blur",()=>{if(drag)endDrag(false)});

/* ---------- ⚙: which gadgets show ---------- */
let menu=null;
function toggleMenu(){if(menu){menu.remove();menu=null;return}const t=tray();if(!t)return;const slots=[...t.querySelectorAll(".gfk-felt .gfk-slot")];
 menu=document.createElement("div");menu.className="gfkl-menu";menu.innerHTML='<b>Gadgets in the toolkit</b><p>Untick to hide one from the tray.</p>'+slots.map(b=>{const k=keyOf(b);return'<label><input type="checkbox" data-k="'+k.replace(/"/g,"")+'"'+(L.hidden.includes(k)?"":" checked")+'> '+nameOf(b)+'</label>'}).join("")+
  '<div class="gfkl-acts"><button type="button" data-col>'+(L.col?"Show as a row":"Show as a column")+'</button><button type="button" data-all>Show all</button><button type="button" data-reset>Reset position and size</button></div>';
 ["pointerdown","mousedown","click","wheel","keydown"].forEach(ev=>menu.addEventListener(ev,e=>e.stopPropagation()));
 menu.querySelectorAll("input").forEach(i=>i.onchange=()=>{const k=i.dataset.k;L.hidden=L.hidden.filter(x=>x!==k);if(!i.checked)L.hidden.push(k);saveL();apply()});
 menu.querySelector("[data-all]").onclick=()=>{L.hidden=[];saveL();apply();menu.querySelectorAll("input").forEach(i=>i.checked=true)};
 menu.querySelector("[data-col]").onclick=()=>{L.col=!L.col;saveL();apply();toggleMenu()};
 menu.querySelector("[data-reset]").onclick=()=>{delete L.pn;delete L.pf;delete L.dock;delete L.fx;delete L.fy;L.col=false;L.lenRow=null;L.lenCol=null;saveL();apply();toggleMenu()};
 document.body.appendChild(menu);const r=t.querySelector(".gfk-tab").getBoundingClientRect();
 menu.style.left=Math.max(8,Math.min(innerWidth-260,r.left))+"px";const below=r.top<260;menu.style.top=(below?r.bottom+6:Math.max(8,r.top-6-menu.offsetHeight))+"px"}
document.addEventListener("pointerdown",e=>{if(menu&&!menu.contains(e.target)&&!(e.target.closest&&e.target.closest(".gfkl-gear"))){menu.remove();menu=null}},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu){menu.remove();menu=null}});

/* the tray is rebuilt with the map and gadgets add their slots later: keep wiring and applying */
setInterval(()=>{wire();apply()},700);
addEventListener("resize",()=>apply());addEventListener("scroll",()=>apply(),{passive:true});
/* a tray just built or moved to another map is put in its place at once (not up to 0.7 s later), as is one going into or
   out of full screen */
{let lastP=null,lastFs=null,lastC=null;(function loop(){requestAnimationFrame(loop);const t=tray();if(!t)return;const fs=FS(),c=t.classList.contains("closed");if(t.parentElement!==lastP||fs!==lastFs||c!==lastC||!t._gfkl){lastP=t.parentElement;lastFs=fs;lastC=c;wire();apply()}})()}

const css=document.createElement("style");css.textContent=`
.gfk-tab{ cursor:grab; touch-action:none; } .gfkl-moving .gfk-tab{ cursor:grabbing; }
.gfk-tray.gfkl-fixed, .gfk-tray.gfkl-moving, .gfk-tray.gfkl-moving *{ transition:none !important; animation:none !important; }
html.gfkl-dragging, html.gfkl-dragging *{ user-select:none !important; -webkit-user-select:none !important; }
.gfkl-grip{ opacity:.6; letter-spacing:-1px; margin-right:2px; font-weight:800; }
.gfkl-gear{ margin-left:4px; font-size:13px; line-height:1; opacity:.8; cursor:pointer; padding:0 2px; } .gfkl-gear:hover{ opacity:1; }
.gfk-slot.gfkl-hide{ display:none !important; }
.gfkl-rz{ position:absolute; z-index:3; background:transparent; }
.gfk-tray:not(.gfkl-col) .gfkl-rz{ bottom:0; width:10px; height:calc(100% - 26px); cursor:ew-resize; }
.gfk-tray:not(.gfkl-col) .gfkl-rz-a{ left:-4px; } .gfk-tray:not(.gfkl-col) .gfkl-rz-b{ right:-4px; }
.gfk-tray:not(.gfkl-col) .gfkl-rz::after{ content:""; position:absolute; top:50%; left:3px; width:4px; height:28px; margin-top:-14px; border-radius:2px; background:rgba(250,230,190,.0); transition:background .15s; }
.gfk-tray:hover .gfkl-rz::after{ background:rgba(250,230,190,.55); }
.gfk-tray.gfkl-col{ align-items:stretch; width:auto; }
.gfk-tray.gfkl-col .gfk-felt{ width:max-content; flex-direction:column; align-items:center; overflow-x:hidden; overflow-y:auto; border-radius:14px; padding:8px 6px; }
.gfk-tray.gfkl-col .gfk-tab{ margin:0 0 -2px 10px; align-self:flex-start; }
.gfk-tray.gfkl-col .gfk-slot.gfk-ruler{ width:66px; }
.gfk-tray.gfkl-col .gfkl-rz{ left:0; width:100%; height:10px; cursor:ns-resize; }
.gfk-tray.gfkl-col .gfkl-rz-a{ top:20px; } .gfk-tray.gfkl-col .gfkl-rz-b{ bottom:-4px; }
.gfkl-menu{ position:fixed; z-index:3000; width:240px; max-height:70vh; overflow:auto; background:#fbf6ea; color:#2a2014; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.3); padding:10px 12px; font:13px/1.4 system-ui,sans-serif; }
body.sky-night .gfkl-menu{ background:#1d2440; color:#e8ecf6; }
.gfkl-menu b{ display:block; margin-bottom:2px; } .gfkl-menu p{ margin:0 0 6px; font-size:11.5px; opacity:.7; }
.gfkl-menu label{ display:flex; align-items:center; gap:8px; padding:3px 0; cursor:pointer; } .gfkl-menu input{ width:16px; height:16px; accent-color:#8a5a30; }
.gfkl-acts{ display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; } .gfkl-acts button{ border:1px solid rgba(0,0,0,.15); background:none; color:inherit; border-radius:999px; padding:4px 10px; font:700 11.5px system-ui; cursor:pointer; }
@media (max-width:640px){ .gfkl-rz,.gfkl-grip{ display:none; } }`;document.head.appendChild(css);
window.gfKitLayout={get:()=>JSON.parse(JSON.stringify(L)),set:o=>{Object.assign(L,o);saveL();apply()},apply};
})();

/* (during a guided tour the toolkit stays where it was put too: it floats like everywhere else) */
/* re-place the free tray when it is folded or opened */
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#gfKit .gfk-tab"))setTimeout(()=>{try{window.gfKitLayout&&gfKitLayout.apply()}catch(err){}},30)});
