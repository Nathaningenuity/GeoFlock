/* GeoFlock: the tour card can be dragged while a question is on it.
   The question panel (.tq) covers the whole card, title bar included, so there was nothing left to grab. Its own top bar
   ("Quick question" / "Recap · question 2 of 5") and its empty space now drag the card, as the card's title bar does;
   buttons, the Questions switch, inputs and links still work as before. A press that moves less than 6 px is a plain click. */
(function(){
const SKIP="button, a, input, select, textarea, label, summary, details, .tq-pick, svg, canvas";
document.addEventListener("pointerdown",function(e){try{
 if(typeof ps==="undefined"||!ps||!ps.card||!ps.card.classList.contains("ps-over")||e.button>0)return;
 const t=e.target;if(!t||!t.closest)return;const box=t.closest(".ps-card .tq");if(!box||!ps.card.contains(box))return;
 const onBar=!!t.closest(".tq-h");if(!onBar&&(e.pointerType==="touch"||t.closest(SKIP)))return;if(onBar&&t.closest("button, a, input, label"))return;
 if(typeof psSetCardPos!=="function")return;
 const c=ps.card.getBoundingClientRect(),dx=e.clientX-c.left,dy=e.clientY-c.top,x0=e.clientX,y0=e.clientY;let on=false;
 if(onBar)e.preventDefault();
 const move=ev=>{if(!ps||!ps.card)return;if(!on){if(Math.abs(ev.clientX-x0)+Math.abs(ev.clientY-y0)<6)return;on=true;ps.card.classList.add("ps-dragging");try{getSelection().removeAllRanges()}catch(_){}}
  ev.preventDefault();psSetCardPos(ev.clientX-dx,ev.clientY-dy)};
 const up=()=>{document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);
  if(ps&&ps.card)ps.card.classList.remove("ps-dragging");
  if(on){const k=ev2=>{ev2.stopPropagation();ev2.preventDefault()};document.addEventListener("click",k,{capture:true,once:true});setTimeout(()=>document.removeEventListener("click",k,true),50)}};
 document.addEventListener("pointermove",move);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);
 e.stopPropagation();
}catch(err){}},true);
const st=document.createElement("style");st.textContent=".ps-card.ps-over .tq .tq-h{cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}.ps-card.ps-over.ps-dragging .tq, .ps-card.ps-over.ps-dragging .tq *{cursor:grabbing !important}";document.head.appendChild(st);
})();
