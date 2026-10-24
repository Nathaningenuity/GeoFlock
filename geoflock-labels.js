/* GeoFlock: tour map labels that get out of the way.
   - smaller, slightly see-through boxes
   - drag a label anywhere; its leader line follows, and it stays put for that stop
   - tap a label to shrink it to a small dot-sized tab; tap again to open it
   - while the map is being dragged or zoomed, labels fade so the map shows through */
(function(){
if(typeof psPlacePins!=="function")return;
const OFF=new Map(),MINI=new Set();
const key=el=>{try{return ps.tour+"|"+ps.i+"|"+el.dataset.k+"|"+el.textContent.slice(0,24)}catch(e){return null}};
/* leader lines whose far end touches a label box */
function leadersFor(box,r){const svg=box.querySelector("svg.ps-leaders");if(!svg)return[];const out=[];
 svg.querySelectorAll("line").forEach(l=>{const x=+l.getAttribute("x2"),y=+l.getAttribute("y2");if(x>=r.x-6&&x<=r.x+r.w+6&&y>=r.y-6&&y<=r.y+r.h+6)out.push(l)});return out}
function rectOf(el){return{x:parseFloat(el.style.left)||0,y:parseFloat(el.style.top)||0,w:el.offsetWidth,h:el.offsetHeight}}
function move(el,dx,dy){const box=el.closest(".ps-pins");const r=rectOf(el);leadersFor(box,r).forEach(l=>{l.setAttribute("x2",+l.getAttribute("x2")+dx);l.setAttribute("y2",+l.getAttribute("y2")+dy)});
 el.style.left=(r.x+dx)+"px";el.style.top=(r.y+dy)+"px"}
function apply(){document.querySelectorAll(".ps-pins .ps-lab").forEach(el=>{const k=key(el);if(!k)return;el.classList.toggle("gf-mini",MINI.has(k));
 const o=OFF.get(k);if(o){/* skip if the label is still where we last put it; otherwise the site has re-placed it, so offset it again */const S=el._gfSet;if(!(S&&S[0]===el.style.left&&S[1]===el.style.top)){move(el,o[0],o[1]);el._gfSet=[el.style.left,el.style.top]}}wire(el)})}
function wire(el){if(el._gfw)return;el._gfw=1;el.title="Drag to move · tap to shrink";
 el.addEventListener("pointerdown",e=>{if(e.button)return;e.stopPropagation();e.preventDefault();const k=key(el),x0=e.clientX,y0=e.clientY;let lx=x0,ly=y0,moved=false;
  try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add("gf-drag");
  const mv=ev=>{const dx=ev.clientX-lx,dy=ev.clientY-ly;if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<4)return;moved=true;move(el,dx,dy);lx=ev.clientX;ly=ev.clientY};
  const up=ev=>{el.removeEventListener("pointermove",mv);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.classList.remove("gf-drag");
   if(moved){const o=OFF.get(k)||[0,0];OFF.set(k,[o[0]+ev.clientX-x0,o[1]+ev.clientY-y0]);el._gfSet=[el.style.left,el.style.top]}
   else{if(MINI.has(k))MINI.delete(k);else MINI.add(k);el.classList.toggle("gf-mini",MINI.has(k))}};
  el.addEventListener("pointermove",mv);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)});
 ["click","mousedown","touchstart","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:false}))}
const _pp=psPlacePins;psPlacePins=function(){const r=_pp.apply(this,arguments);try{apply()}catch(e){console.error(e)}return r};
/* labels are re-made when the map moves; their saved offsets are applied again each time */
new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.classList&&n.classList.contains("ps-lab")||n.querySelector&&n.querySelector(".ps-lab")))))apply()}).observe(document.body,{childList:true,subtree:true});
/* fade labels while the map is being dragged */
let fadeT=0;document.addEventListener("pointerdown",e=>{const w=e.target.closest&&e.target.closest("#allMapsWrap, .globe-host, #atlasStudyMapWrap, .map-wrap");if(!w||e.target.closest(".ps-lab,.ps-card,button,.ps-pp"))return;w.classList.add("gf-lab-fade");
 const end=()=>{clearTimeout(fadeT);fadeT=setTimeout(()=>w.classList.remove("gf-lab-fade"),250);document.removeEventListener("pointerup",end,true);document.removeEventListener("pointercancel",end,true)};
 document.addEventListener("pointerup",end,true);document.addEventListener("pointercancel",end,true)},true);
const css=document.createElement("style");css.textContent=`
.ps-pins .ps-lab{ max-width:190px !important; font-size:12px !important; line-height:1.25 !important; padding:4px 8px !important; opacity:.9; cursor:grab; touch-action:none; user-select:none; pointer-events:auto !important; transition:opacity .2s; }
.ps-pins .ps-lab:hover{ opacity:1; } .ps-pins .ps-lab.gf-drag{ cursor:grabbing; opacity:1; box-shadow:0 6px 18px rgba(0,0,0,.35); z-index:5; }
.ps-pins .ps-lab.gf-mini{ max-width:22px !important; max-height:22px; overflow:hidden; padding:0 !important; border-radius:50% !important; color:transparent !important; position:absolute; }
.ps-pins .ps-lab.gf-mini::after{ content:"i"; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff; font:700 12px/1 Georgia,serif; }
.gf-lab-fade .ps-pins .ps-lab, .gf-lab-fade .ps-pins .ps-leaders{ opacity:.18 !important; transition:opacity .15s; }
@media (max-width:760px){ .ps-pins .ps-lab{ max-width:150px !important; font-size:11px !important; } }`;
document.head.appendChild(css);
})();
