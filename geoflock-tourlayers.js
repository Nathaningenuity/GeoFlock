/* GeoFlock: map layers and "Relief underneath" around the guided tours, and a round Relief button by the map.
   1. Relief underneath is a round button in the column of map buttons (full screen, +, −, reset…) on the maps where
      it works: the History map and the Politics and Culture maps (the switch that used to sit in the map key is
      hidden; the button sets the same choice). Pressed = on.
   2. Guided tours show the relief under the History map by default (T.relief:true / false per tour overrides it; tours
      on the History map, or with History-map stops, get it unless T.relief===false). On the Politics and Culture maps
      a tour turns it on with T.relief:true (or the older T.map.thRelief). The viewer's own choice comes back when the
      tour ends (the existing histReliefTour / thReliefTour mechanism).
   3. Starting a guided tour switches off the optional overlay layers (Resources, Connections, Hazards, Currents,
      Plates, Plate motion, Time zones, Grid lines, Day and night) unless the tour (T.map.on) or the stop on screen
      (S.on, switched per stop by geoflock-mapsx.js) needs them. The viewer's layers are switched back on when the tour
      ends. */
(function(){
if(typeof psStart!=="function"||typeof psEnd!=="function"||typeof psLaunchTour!=="function")return;
const live=()=>typeof ps!=="undefined"&&!!ps;
const onMaps=()=>{try{return appMode==="allmaps"}catch(e){return false}};

/* ---------- 2. relief under the tours ---------- */
function wantsRelief(T){if(!T)return false;if(T.relief===false)return false;if(T.relief===true)return true;const m=T.map||{};
 return!!(m.histRelief||m.mode==="history"||(T.steps||[]).some(s=>s&&s.mode==="history"))}
function tourRelief(){try{if(!live())return;const T=PS_TOURS[ps.tour];if(!T)return;
  if(wantsRelief(T)&&typeof histRelief!=="undefined"&&!histRelief&&histReliefTour!==ps.tour){histReliefTour=ps.tour;histReliefApply()}
  if((T.relief===true||(T.map&&T.map.thRelief))&&typeof thRelief!=="undefined"&&!thRelief&&thReliefTour!==ps.tour){thReliefTour=ps.tour;thReliefApply()}}catch(e){console.error(e)}}

/* ---------- 3. optional layers off during a tour ---------- */
const OPT=["resources","connections","hazards","currents","plates","motion","timezones","grid","daynight"];
const input=n=>{try{return window.gfTourToggleInput?gfTourToggleInput(n):null}catch(e){return null}};
const set=(i,v)=>{if(!i||i.checked===v)return;i.checked=v;i.dispatchEvent(new Event("change",{bubbles:true}))};
let sess=null,pre=null,pending=null,pendT=0,starting=0;
const nowOn=()=>OPT.filter(n=>{const i=input(n);return i&&i.checked});
/* what the tour and the stop on screen need: T.map.on holds switch ids (or layer names), S.on layer names */
function needed(T){const need=new Set(),ids=new Set();(T&&T.map&&T.map.on||[]).forEach(x=>{ids.add(x);need.add(x)});
 OPT.forEach(n=>{const i=input(n);if(i&&i.id&&ids.has(i.id))need.add(n)});
 try{const S=live()&&psSteps()[ps.i];(S&&S.on||[]).forEach(n=>need.add(n))}catch(e){}return need}
function begin(){if(sess)return false;sess={off:new Set()};if(pending){pending.forEach(n=>sess.off.add(n));pending=null;clearTimeout(pendT)}return true}
/* the viewer's layers are noted once, when the tour begins (later restarts of the same tour, for a stop on another map,
   must not take the tour's own layers for the viewer's) */
function quiet(){try{if(!live()||!onMaps())return;const first=begin(),need=needed(PS_TOURS[ps.tour]);
  if(first){nowOn().concat(pre||[]).forEach(n=>sess.off.add(n));pre=null}
  sess.off.forEach(n=>{if(!need.has(n))set(input(n),false)})}catch(e){console.error(e)}}
function finish(){if(!sess)return;const off=[...sess.off];sess=null;if(!off.length)return;pending=off;clearTimeout(pendT);
 /* after the tour's own clean-up (geoflock-mapsx.js switches its per-stop layers off every 300 ms) */
 pendT=setTimeout(()=>{const p=pending;pending=null;if(!p)return;if(live()&&sess){p.forEach(n=>sess.off.add(n));return}
  if(!onMaps())return;p.forEach(n=>set(input(n),true))},750)}

{const _l=psLaunchTour;psLaunchTour=function(id){try{if(!live()&&!sess&&onMaps())pre=nowOn()}catch(e){}return _l.apply(this,arguments)}}
{const _s=psStart;psStart=function(){starting++;let r;try{r=_s.apply(this,arguments)}finally{starting--}
  if(live()){quiet();tourRelief();setTimeout(tourRelief,0)}return r}}
{const _e=psEnd;psEnd=function(){const was=live();const r=_e.apply(this,arguments);if(was&&!starting&&!live())finish();return r}}
/* a tour can also be dropped without psEnd (its map closed); the viewer's layers still come back */
setInterval(()=>{try{if(sess&&!live()&&!starting)finish()}catch(e){}},1000);
/* a layer of the viewer's that a stop needed (so it stayed on) goes off again at the next stop that does not need it */
let lastStop="";setInterval(()=>{try{if(!sess||!live()||!onMaps())return;const k=ps.tour+"|"+ps.i;if(k===lastStop)return;lastStop=k;const need=needed(PS_TOURS[ps.tour]);
 sess.off.forEach(n=>{if(!need.has(n))set(input(n),false)})}catch(e){}},350);
window.gfTourLayers={wantsRelief,state:()=>({sess:sess&&[...sess.off],pending})};

/* ---------- 1. the round Relief button ---------- */
const hOn=()=>{try{return typeof histOn==="function"&&histOn()}catch(e){return false}};
const tOn=()=>{try{return typeof thOn==="function"&&thOn()}catch(e){return false}};
function reliefOn(){try{if(hOn())return histReliefOn();if(tOn())return thReliefOn()}catch(e){}return false}
function toggle(){const v=!reliefOn();
 try{if(hOn()){histRelief=v;if(!v)histReliefTour=null;try{localStorage.setItem("histRelief",v?"1":"0")}catch(e){}histReliefApply()}
  else if(tOn()){thRelief=v;if(!v)thReliefTour=null;try{localStorage.setItem("thRelief",v?"1":"0")}catch(e){}thReliefApply()}}catch(e){console.error(e)}
 sync()}
const ICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M2.5 19.5 9 8.5l4.2 6.6 2.6-3.6 5.7 8z"/><path d="M7.1 11.7 9 8.5l1.9 3-1.1 1.1-1-.9z" fill="currentColor" stroke-width="1.2"/></svg>';
function sync(){const g=typeof amGlobe!=="undefined"&&amGlobe;if(!g||!g.host)return;const bar=g.host.querySelector(".globe-btns");if(!bar)return;
 let b=bar.querySelector('[data-g="gfrelief"]');
 if(!b){b=document.createElement("button");b.type="button";b.dataset.g="gfrelief";b.title="Relief underneath";b.setAttribute("aria-label","Relief underneath");b.innerHTML=ICO;
  b.addEventListener("click",e=>{e.stopPropagation();e.preventDefault();toggle()},true);bar.appendChild(b)}
 const show=onMaps()&&(hOn()||tOn());b.style.display=show?"":"none";const on=show&&reliefOn();b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false")}
setInterval(()=>{try{sync()}catch(e){}},400);
const st=document.createElement("style");st.textContent=`
.globe-btns [data-g="gfrelief"]{ display:inline-flex; align-items:center; justify-content:center; }
.globe-btns [data-g="gfrelief"] svg{ width:18px; height:18px; }
.globe-btns [data-g="gfrelief"].on{ background:#8a6a3c !important; color:#fff !important; border-color:#8a6a3c !important; }
/* the old switch in the map key: the round button replaces it */
html body #populationLegend label.hist-relief-sw, html body #flKey label.hist-relief-sw, html body #amReliefUnderSw{ display:none !important; }`;
document.head.appendChild(st);
})();
