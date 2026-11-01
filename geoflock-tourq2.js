/* GeoFlock: guided-tour questions, kept on and finished properly.
   - Questions are always on (the "Questions" switch is gone: once off it could not be turned back on anywhere).
   - While a question is on the card the tour cannot be closed (no ✕, no Escape): it is too tempting.
   - A stop's questions (and the recap) come up once per run of the tour: going Back and forward again does not repeat
     them; starting the tour again does.
   - A tour finished before: when taken again, every dot along the bottom of the card is filled in and any stop can be
     jumped to; the questions still come up as you go forward. */
(function(){
if(typeof tqFor!=="function"||typeof psGo!=="function"||typeof psLaunchTour!=="function")return;
try{tqOn=true;if(typeof stats!=="undefined"&&stats.prefs&&stats.prefs.tourQOff){stats.prefs.tourQOff=false;try{saveStats()}catch(e){}}}catch(e){}
const busy=()=>{try{return!!tqBusy}catch(e){return false}};
document.addEventListener("click",e=>{if(!busy())return;const x=e.target.closest&&e.target.closest(".ps-card .ps-x");if(x){e.preventDefault();e.stopImmediatePropagation()}},true);
addEventListener("keydown",e=>{if(busy()&&e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation()}},true);
/* once per run */
let seen=new Set();
{const _f=tqFor;tqFor=function(tour,fromI,toI){const r=_f.apply(this,arguments);if(!r)return r;const k=tour+"|"+fromI+"|"+r.kind;if(seen.has(k))return null;seen.add(k);return r}}
{const _l=psLaunchTour;psLaunchTour=function(){seen=new Set();return _l.apply(this,arguments)}}
/* a finished tour: all stops open */
const done=t=>{try{const p=stats.tourProg&&stats.tourProg[t];return!!(p&&p.done)}catch(e){return false}};
{const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);try{if(ps&&done(ps.tour)){const n=psSteps().length;if((ps.maxI||0)<n-1){ps.maxI=n-1;if(typeof psDotsMark==="function")psDotsMark()}}}catch(e){}return r}}
const st=document.createElement("style");st.textContent=`
.tq .tq-sw{ display:none !important; }
.ps-card:has(.tq) .ps-x{ visibility:hidden !important; pointer-events:none !important; }`;
document.head.appendChild(st);
})();
