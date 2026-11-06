/* GeoFlock: the base map of the guided tours.
   1. Many tours start on the Satellite map (plain Day: the real Earth, far more convincing for nature, oceans, islands,
      ice, hazards and the continents); the rest of the Relief tours stay on Relief.
   2. Any tour that runs on Relief or Satellite can be switched between the two at any stop: the choice is kept for the
      rest of the tour (no stop switches it back) and remembered for that tour next time (localStorage gfTourBase). */
(function(){
if(typeof PS_TOURS==="undefined"||typeof psGo!=="function")return;
const PAIR={relief:1,satellite:1};
const SAT=["rivers","lakes","seas","islands","europe","asia","africa","namerica","samerica","oceania","antarctica","hantarctica","hazards",
 "humans","islandlife","volcanoes","caves","coasts","ice","ocean","amigration","animals","explorers","environment","landmarks","regions"];
let PICK={};try{PICK=JSON.parse(localStorage.getItem("gfTourBase")||"{}")||{}}catch(e){}
const savePick=()=>{try{localStorage.setItem("gfTourBase",JSON.stringify(PICK))}catch(e){}};
function apply(){Object.keys(PS_TOURS).forEach(id=>{const T=PS_TOURS[id];if(!T||!T.map||!PAIR[T.map.mode])return;
 if(T._gfOrig==null)T._gfOrig=T.map.mode;if(T._gfBase==null)T._gfBase=SAT.includes(id)?"satellite":T.map.mode;T.map.mode=PICK[id]&&PAIR[PICK[id]]?PICK[id]:T._gfBase})}
apply();setTimeout(apply,1500);setTimeout(apply,5000);
const inPair=id=>{const T=PS_TOURS[id];return!!(T&&T.map&&PAIR[T.map.mode])};
/* a stop that asks for Relief or Satellite gets whichever of the two is on show */
{const _g=psGo;psGo=function(i){let S=null,orig;try{if(typeof ps!=="undefined"&&ps&&inPair(ps.tour)){S=psSteps()[i];const cur=allMapsColorModeOn?allMapsColorMode:null;
   /* on show now if it is one of the two, else the tour's own choice (after a stop on another map, e.g. Elevation) */
   if(S&&(S.mode?PAIR[S.mode]:true)){orig=S.mode;S.mode=PAIR[cur]?cur:PS_TOURS[ps.tour].map.mode}else S=null}}catch(e){S=null}
 try{return _g.apply(this,arguments)}finally{if(S){if(orig===undefined)delete S.mode;else S.mode=orig}}}}
/* switching between Relief and Satellite during a tour: kept for the rest of it, and remembered */
let guard=0;
document.addEventListener("click",e=>{if(guard||!e.isTrusted)return;const b=e.target.closest&&e.target.closest('[data-allmaps-mode="relief"],[data-allmaps-mode="satellite"]');if(!b)return;
 try{if(typeof ps==="undefined"||!ps||!inPair(ps.tour))return;const m=b.dataset.allmapsMode,id=ps.tour;PS_TOURS[id].map.mode=m;PICK[id]=m;savePick()}catch(x){}},true);
/* tours that were on Relief show the Satellite map as plain Day (not Day & Night) */
/* and a guard: during a Relief/Satellite tour, a stop meant for those two shows the one you picked (or the tour's own),
   whatever else reset it (some tours put their map back when a stop restarts the tour) */
let busy=0;
setInterval(()=>{try{if(typeof ps==="undefined"||!ps||(typeof psSwitching!=="undefined"&&psSwitching))return;const id=ps.tour,T=PS_TOURS[id];if(!T||!T.map||T._gfBase==null)return;
 const want=PICK[id]&&PAIR[PICK[id]]?PICK[id]:T._gfBase;if(T.map.mode!==want&&PAIR[T.map.mode])T.map.mode=want;
 const S=psSteps()[ps.i],cur=allMapsColorModeOn?allMapsColorMode:null;
 if(PAIR[cur]&&cur!==want&&(!S||!S.mode||PAIR[S.mode]&&!S.modeFixed)/* modeFixed: the stop needs that exact map (Samosir needs Relief) */&&performance.now()-busy>1500){busy=performance.now();const b=document.querySelector('#allMapsToggleRow [data-allmaps-mode="'+want+'"]');if(b){guard=1;b.click();guard=0}}
 if(window.gfDNG&&gfDNG.on()&&T._gfOrig==="relief"&&allMapsColorMode==="satellite"){try{gfDNG.state.wasFlat=false}catch(e){}gfDNG.set(false)}}catch(e){}},300);
window.gfTourBase={apply,SAT,pick:PICK};
})();
