/* GeoFlock: the Toolkit tray's layout, chosen by the user and remembered.
   - Move it: drag the tray by its tab (a click still opens and closes it). Let go near the map's left or right edge and it
     becomes a column on that side; anywhere else it is a row along the bottom, where you let go.
   - Make it shorter: pull either end of the tray (or of the column); the gadgets then scroll inside it.
   - ⚙ on the tab: a list of every gadget with a tick box; untick to hide it from the tray.
   Saved in this browser (localStorage gfKitLayout). */
(function(){
const KEY="gfKitLayout";
let L={dock:"bottom",x:12,lenRow:null,lenCol:null,hidden:[]};try{Object.assign(L,JSON.parse(localStorage.getItem(KEY)||"{}"));delete L.len}catch(e){}
/* the People gadget starts hidden (tick it under ⚙ to show it) */
if(!L.v2){L.v2=1;if(!L.hidden.includes("gfk-people"))L.hidden.push("gfk-people");try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}}
const saveL=()=>{try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}};
const tray=()=>document.getElementById("gfKit");
const host=()=>{const t=tray();return t&&t.parentElement};
const nameOf=b=>b.getAttribute("aria-label")||(b.querySelector("span")||{}).textContent||b.dataset.tool||"";
const keyOf=b=>b.dataset.tool||[...b.classList].find(c=>/^gfk-(?!slot)/.test(c))||nameOf(b);

function apply(){const t=tray();if(!t)return;const f=t.querySelector(".gfk-felt");if(!f)return;
 t.classList.toggle("gfkl-col",L.dock!=="bottom");t.classList.toggle("gfkl-left",L.dock==="left");t.classList.toggle("gfkl-right",L.dock==="right");
 const h=host(),hw=h?h.clientWidth:1000,hh=h?h.clientHeight:600;
 if(L.dock==="free"){t.classList.toggle("gfkl-col",!!L.col);t.classList.remove("gfkl-left","gfkl-right");t.classList.toggle("gfkl-free",true);
  f.style.maxWidth=!L.col&&L.lenRow?Math.max(130,L.lenRow)+"px":"";f.style.maxHeight=L.col?(L.lenCol?Math.max(130,Math.min(L.lenCol,innerHeight-90)):Math.max(160,Math.min(innerHeight-90,520)))+"px":"";
  t.style.right="auto";t.style.bottom="auto";const hr=h?h.getBoundingClientRect():{left:0,top:0},w=t.offsetWidth||300,th=t.offsetHeight||120;
  const x=Math.max(-hr.left+4,Math.min(innerWidth-hr.left-w-4,L.fx||0)),y=Math.max(-hr.top+4,Math.min(innerHeight-hr.top-th-4,L.fy||0));
  t.style.left=x+"px";t.style.top=y+"px";f.querySelectorAll(".gfk-slot").forEach(b=>{b.classList.toggle("gfkl-hide",L.hidden.includes(keyOf(b)))});return}
 t.classList.remove("gfkl-free");
 if(L.dock==="bottom"){t.style.left=Math.max(0,Math.min(hw-140,L.x||12))+"px";t.style.right="auto";t.style.top="auto";if(t._gfx!==2)t.style.bottom="0";/* lifted above the History timeline in full screen (geoflock-fsfix.js): left there */
  f.style.maxHeight="";f.style.maxWidth=L.lenRow?Math.max(130,L.lenRow)+"px":"";}
 else{t.style.bottom="auto";t.style.top="58px";if(L.dock==="left"){t.style.left="6px";t.style.right="auto"}else{t.style.left="auto";t.style.right="54px"}
  f.style.maxWidth="";f.style.maxHeight=(L.lenCol?Math.max(130,Math.min(L.lenCol,hh-90)):Math.max(160,hh-90))+"px"}
 f.querySelectorAll(".gfk-slot").forEach(b=>{b.classList.toggle("gfkl-hide",L.hidden.includes(keyOf(b)))})
 /* a row stays inside the map */
 if(L.dock==="bottom"&&h){const w=t.offsetWidth,mx=Math.max(0,hw-w-4);if(parseFloat(t.style.left)>mx)t.style.left=mx+"px"}}

/* ---------- the tab: drag to move, click to open/close, ⚙ for the gadgets ---------- */
function wire(){const t=tray();if(!t||t._gfkl)return;t._gfkl=1;const tab=t.querySelector(".gfk-tab"),f=t.querySelector(".gfk-felt");if(!tab||!f)return;
 const gear=document.createElement("span");gear.className="gfkl-gear";gear.setAttribute("role","button");gear.title="Choose which gadgets show";gear.textContent="⚙";tab.appendChild(gear);
 /* not a <span>: the toolkit relabels the tab's first span */const grip=document.createElement("b");grip.className="gfkl-grip";grip.title="Drag to move the toolkit";grip.textContent="⋮⋮";tab.insertBefore(grip,tab.firstChild);
 gear.addEventListener("click",e=>{e.stopPropagation();e.preventDefault();toggleMenu()});
 gear.addEventListener("pointerdown",e=>e.stopPropagation());
 let drag=null,swallow=false;
 tab.addEventListener("pointerdown",e=>{if(e.button)return;const h=host();if(!h)return;const tr=t.getBoundingClientRect();drag={x0:e.clientX,y0:e.clientY,dx:e.clientX-tr.left,dy:e.clientY-tr.top,moved:false,id:e.pointerId};try{tab.setPointerCapture(e.pointerId)}catch(x){}});
 /* the tray goes exactly where it is dropped, anywhere on the screen (row or column is chosen under ⚙) */
 tab.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<6)return;
  if(!drag.moved){if(L.dock!=="free"){L.col=L.dock!=="bottom"}L.dock="free"}drag.moved=true;t.classList.add("gfkl-moving");
  const hr=host().getBoundingClientRect();L.fx=Math.round(e.clientX-hr.left-drag.dx);L.fy=Math.round(e.clientY-hr.top-drag.dy);apply()});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;const m=drag.moved;drag=null;t.classList.remove("gfkl-moving");if(m){swallow=true;setTimeout(()=>swallow=false,50);saveL()}};
 tab.addEventListener("pointerup",end);tab.addEventListener("pointercancel",end);
 /* a drag is not a click: it must not also open or close the tray */
 tab.addEventListener("click",e=>{if(swallow){e.stopImmediatePropagation();e.preventDefault()}},true);
 /* the two ends: pull to make the tray (or column) shorter or longer */
 ["a","b"].forEach(side=>{const z=document.createElement("span");z.className="gfkl-rz gfkl-rz-"+side;z.title="Pull to make the toolkit shorter or longer";t.appendChild(z);
  z.addEventListener("pointerdown",e=>{if(e.button)return;e.stopPropagation();e.preventDefault();const fr=f.getBoundingClientRect(),col=L.dock!=="bottom",len0=col?fr.height:fr.width,p0=col?e.clientY:e.clientX,x0=L.x;try{z.setPointerCapture(e.pointerId)}catch(x){}
   const mv=ev=>{const d=(col?ev.clientY:ev.clientX)-p0;let len=side==="b"?len0+d:len0-d;len=Math.max(130,len);if(!col&&side==="a")L.x=Math.round(x0+(len0-len));if(col)L.lenCol=Math.round(len);else L.lenRow=Math.round(len);apply()};
   const up=()=>{z.removeEventListener("pointermove",mv);z.removeEventListener("pointerup",up);z.removeEventListener("pointercancel",up);saveL()};
   z.addEventListener("pointermove",mv);z.addEventListener("pointerup",up);z.addEventListener("pointercancel",up)})});
 apply()}
let hint=null;function showHint(dock){const h=host();if(!h)return;if(!hint){hint=document.createElement("div");hint.className="gfkl-hint";h.appendChild(hint)}hint.className="gfkl-hint gfkl-hint-"+dock;hint.textContent=dock==="bottom"?"Row along the bottom":dock==="left"?"Column on the left":"Column on the right"}
function hideHint(){if(hint){hint.remove();hint=null}}

/* ---------- ⚙: which gadgets show ---------- */
let menu=null;
function toggleMenu(){if(menu){menu.remove();menu=null;return}const t=tray();if(!t)return;const slots=[...t.querySelectorAll(".gfk-felt .gfk-slot")];
 menu=document.createElement("div");menu.className="gfkl-menu";menu.innerHTML='<b>Gadgets in the toolkit</b><p>Untick to hide one from the tray.</p>'+slots.map(b=>{const k=keyOf(b);return'<label><input type="checkbox" data-k="'+k.replace(/"/g,"")+'"'+(L.hidden.includes(k)?"":" checked")+'> '+nameOf(b)+'</label>'}).join("")+
  '<div class="gfkl-acts"><button type="button" data-col>'+((L.dock==="free"?L.col:L.dock!=="bottom")?"Show as a row":"Show as a column")+'</button><button type="button" data-all>Show all</button><button type="button" data-reset>Reset position and size</button></div>';
 ["pointerdown","mousedown","click","wheel","keydown"].forEach(ev=>menu.addEventListener(ev,e=>e.stopPropagation()));
 menu.querySelectorAll("input").forEach(i=>i.onchange=()=>{const k=i.dataset.k;L.hidden=L.hidden.filter(x=>x!==k);if(!i.checked)L.hidden.push(k);saveL();apply()});
 menu.querySelector("[data-all]").onclick=()=>{L.hidden=[];saveL();apply();menu.querySelectorAll("input").forEach(i=>i.checked=true)};
 menu.querySelector("[data-col]").onclick=()=>{const t2=tray(),r=t2&&t2.getBoundingClientRect(),hr=host()&&host().getBoundingClientRect();const wasCol=L.dock==="free"?!!L.col:L.dock!=="bottom";if(L.dock!=="free"&&r&&hr){L.fx=Math.round(r.left-hr.left);L.fy=Math.round(r.top-hr.top)}L.dock="free";L.col=!wasCol;saveL();apply();toggleMenu()};
 menu.querySelector("[data-reset]").onclick=()=>{L.dock="bottom";L.col=false;L.x=12;L.lenRow=null;L.lenCol=null;saveL();apply();toggleMenu()};
 document.body.appendChild(menu);const r=t.querySelector(".gfk-tab").getBoundingClientRect();
 menu.style.left=Math.max(8,Math.min(innerWidth-260,r.left))+"px";const below=r.top<260;menu.style.top=(below?r.bottom+6:Math.max(8,r.top-6-menu.offsetHeight))+"px"}
document.addEventListener("pointerdown",e=>{if(menu&&!menu.contains(e.target)&&!(e.target.closest&&e.target.closest(".gfkl-gear"))){menu.remove();menu=null}},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu){menu.remove();menu=null}});

/* the tray is rebuilt with the map and gadgets add their slots later: keep wiring and applying */
setInterval(()=>{wire();apply()},700);
addEventListener("resize",()=>apply());

const css=document.createElement("style");css.textContent=`
.gfk-tab{ cursor:grab; touch-action:none; } .gfkl-moving .gfk-tab{ cursor:grabbing; }
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
.gfkl-hint{ position:absolute; z-index:6; pointer-events:none; border:2px dashed rgba(246,200,90,.9); background:rgba(246,200,90,.12); border-radius:14px; display:flex; align-items:center; justify-content:center; font:800 12px system-ui; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.6); }
.gfkl-hint-left{ left:4px; top:54px; bottom:10px; width:84px; writing-mode:vertical-rl; } .gfkl-hint-right{ right:52px; top:54px; bottom:10px; width:84px; writing-mode:vertical-rl; } .gfkl-hint-bottom{ left:10px; right:10px; bottom:4px; height:90px; }
.gfkl-menu{ position:fixed; z-index:3000; width:240px; max-height:70vh; overflow:auto; background:#fbf6ea; color:#2a2014; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.3); padding:10px 12px; font:13px/1.4 system-ui,sans-serif; }
body.sky-night .gfkl-menu{ background:#1d2440; color:#e8ecf6; }
.gfkl-menu b{ display:block; margin-bottom:2px; } .gfkl-menu p{ margin:0 0 6px; font-size:11.5px; opacity:.7; }
.gfkl-menu label{ display:flex; align-items:center; gap:8px; padding:3px 0; cursor:pointer; } .gfkl-menu input{ width:16px; height:16px; accent-color:#8a5a30; }
.gfkl-acts{ display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; } .gfkl-acts button{ border:1px solid rgba(0,0,0,.15); background:none; color:inherit; border-radius:999px; padding:4px 10px; font:700 11.5px system-ui; cursor:pointer; }
@media (max-width:640px){ .gfkl-rz,.gfkl-grip{ display:none; } }`;document.head.appendChild(css);
window.gfKitLayout={get:()=>JSON.parse(JSON.stringify(L)),set:o=>{Object.assign(L,o);saveL();apply()},apply};
})();
