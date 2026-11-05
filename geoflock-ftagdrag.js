/* GeoFlock: the flags on tour stops (the Flags tour, regions and others) can be dragged off the country they sit on;
   a line then points from the flag back to its country. Each flag keeps its new place for that stop; a quick click without
   moving does whatever the flag did before. Load after the other tour patches (this wrapper is the outermost). */
(function(){
if(typeof gfFlagTagsSync!=="function")return;
const OFF=new WeakMap();/* stop -> {k:[dx,dy]} */
const offs=S=>{let o=OFF.get(S);if(!o){o={};OFF.set(S,o)}return o};
function after(){try{
 if(typeof ps==="undefined"||!ps)return;const box=psContainer&&psContainer();if(!box)return;const L=box.querySelector(".gf-ftags");let svg=box.querySelector(":scope>svg.gf-ftl");if(!L){if(svg)svg.remove();return}
 const S=psSteps()[ps.i],P=S&&S.flagTags||[],O=offs(S);
 /* beside the flags, not among them: the flags are matched to their places by position */
 if(!svg){svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("class","gf-ftl")}if(svg.nextSibling!==L)box.insertBefore(svg,L);
 let lines="";
 [...L.children].filter(e=>e.classList&&e.classList.contains("gf-ftag")).forEach((el,k)=>{
  if(!el._gfDrag)wire(el,k);
  if(el.style.display==="none")return;const o=O[k];if(!o)return;
  const bx=parseFloat(el.style.left),by=parseFloat(el.style.top);if(!isFinite(bx))return;
  el.style.left=(bx+o[0])+"px";el.style.top=(by+o[1])+"px";
  const a=P[k]&&psScreen(P[k].at);if(!a)return;
  /* from the country to the nearest edge of the flag */
  const w=el.offsetWidth,h=el.offsetHeight,cx=bx+o[0],cy=by+o[1],ex=Math.max(cx-w/2,Math.min(cx+w/2,a[0])),ey=Math.max(cy-h/2,Math.min(cy+h/2,a[1]));
  if(Math.hypot(ex-a[0],ey-a[1])>6)lines+='<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+ex.toFixed(1)+'" y2="'+ey.toFixed(1)+'"/><circle cx="'+a[0].toFixed(1)+'" cy="'+a[1].toFixed(1)+'" r="2.6"/>'});
 svg.innerHTML=lines}catch(e){console.error("ftagdrag",e)}}
function wire(el,k){el._gfDrag=1;el.style.pointerEvents="auto";el.style.cursor="grab";el.title=(el.title?el.title+" · ":"")+"Drag to move it off the country";
 el.addEventListener("pointerdown",e=>{if(e.button)return;e.stopPropagation();e.preventDefault();const S=psSteps()[ps.i],O=offs(S),o0=(O[k]||[0,0]).slice(),x0=e.clientX,y0=e.clientY;let moved=false;
  try{el.setPointerCapture(e.pointerId)}catch(x){}el.style.cursor="grabbing";
  const mv=m=>{const dx=m.clientX-x0,dy=m.clientY-y0;if(!moved&&Math.hypot(dx,dy)<4)return;moved=true;O[k]=[o0[0]+dx,o0[1]+dy];gfFlagTagsSync()};
  const up=()=>{el.removeEventListener("pointermove",mv);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.style.cursor="grab";
   /* a click right after a drag does nothing else */if(moved){const stop=c=>{c.stopPropagation();c.preventDefault()};el.addEventListener("click",stop,{capture:true,once:true})}};
  el.addEventListener("pointermove",mv);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)});
 ["mousedown","touchstart","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:true}))}
const _s=gfFlagTagsSync;gfFlagTagsSync=function(){const r=_s.apply(this,arguments);after();return r};
const st=document.createElement("style");st.textContent=`
svg.gf-ftl{ position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
svg.gf-ftl line{ stroke:rgba(16,28,48,.8); stroke-width:1.6; stroke-linecap:round; }
svg.gf-ftl circle{ fill:#c0392b; stroke:#fff; stroke-width:1.2; }
.gf-ftag{ touch-action:none; }`;document.head.appendChild(st);
})();
