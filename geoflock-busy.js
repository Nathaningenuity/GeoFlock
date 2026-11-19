/* GeoFlock: a small spinning ring on the Maps page while sharper detail for the view is being fetched or built.
   Each sharp-detail loader says when it starts and when it is done (window.gfSharpBusy.start(key, token) / .done(key)):
   the globe and flat close-ups of the Elevation map (geoflock-elevhr.js, geoflock-nightsharp.js), Population
   (geoflock-pophr.js), Relief (geoflock-reliefsharp.js), City Lights and Satellite (NASA's tiles: geoflock-nightsharp.js,
   geoflock-daynightglobe.js); the Relief map's zoom-detail tiles (geoflock-detail.js) are looked at every few tenths of
   a second (gfSharpBusy.poll). The ring sits under the map's buttons (zoom, reset...), in the same column.
   It never spins for good:
   - each load counts for at most 15 s (or the time its loader gives: start(key, token, ms), at most 60 s; the Elevation
     close-ups, which wait for NOAA's sea depth after the land, give 30 s): after that it is dropped, even if its tiles
     never answer. The time is counted
     over every try for the same key and token (the same view), so a view whose tiles keep failing and are asked for
     again does not keep the ring turning; a new token (the view changed) is a new load;
   - every load is dropped when you leave the Maps page, change map or switch between globe and flat map;
   - loads that end within 250 ms show nothing; once shown, the ring stays at least 300 ms, and a gap shorter than
     400 ms between two loads (a quick look, then the sharp one) does not hide it. */
(function(){
"use strict";
const TMAX=15000,SHOW=250,MINV=300,GAP=400,TICK=100;
const A=new Map(),POLL=new Map(),SPENT=new Map();let el=null,shownAt=0,idleAt=0,timer=0,lastM=null;
/* which map is showing: loads are for this map only */
function mapNow(){try{if(typeof appMode==="undefined"||appMode!=="allmaps"||document.hidden)return null;const g=typeof amGlobe!=="undefined"&&amGlobe;
 if(!g||!g.host||!g.host.isConnected||!g.host.offsetParent)return null;return allMapsColorMode+(g._flat?"|flat":"|globe")}catch(e){return null}}
function start(key,tok,max){const m=mapNow();max=Math.min(60000,max>0?max:TMAX);if(!m||!key)return;tok=tok==null?"":String(tok);const e=A.get(key);
 if(e&&e.tok===tok&&e.m===m)return;/* the same load: its clock goes on (and a load past its time stays dropped) */
 end(key);const id=key+"#"+tok,sp=SPENT.get(id)||0;A.set(key,{t0:Date.now(),sp,tok,m,id,max,dead:sp>=max});run()}
/* the time a load has run is kept (for its key and token), the last 100 */
function end(key){const e=A.get(key);if(!e)return false;A.delete(key);SPENT.delete(e.id);SPENT.set(e.id,e.sp+Date.now()-e.t0);while(SPENT.size>100)SPENT.delete(SPENT.keys().next().value);return true}
function done(key){if(end(key))run()}
/* fn() is asked every tick: a token while busy, nothing when not */
function poll(key,fn){POLL.set(key,fn);run()}
const run=()=>{if(!timer)timer=setTimeout(tick,0)};
function ring(){if(!el){el=document.createElement("div");el.className="gf-busy";el.setAttribute("role","status");el.setAttribute("aria-label","Loading sharper detail");el.title="Loading sharper detail";
  el.innerHTML='<span class="gf-busy-ring"></span>';const st=document.createElement("style");st.textContent=
  ".gf-busy{display:none;order:99;width:34px;height:34px;align-items:center;justify-content:center;pointer-events:none;flex:none}"+
  ".gf-busy.on{display:flex}"+
  ".gf-busy-ring{width:20px;height:20px;box-sizing:border-box;border-radius:50%;border:2.5px solid rgba(var(--text-rgb,40,50,70),.18);border-top-color:var(--gold,#2f7fb8);"+
  "animation:gfSharpBusySpin .8s linear infinite;box-shadow:0 0 0 3px var(--surface,#fff),0 1px 6px rgba(0,0,0,.18);background:var(--surface,#fff)}"+
  "@keyframes gfSharpBusySpin{to{transform:rotate(360deg)}}"+
  "@media (prefers-reduced-motion:reduce){.gf-busy-ring{animation-duration:2.4s}}";document.head.appendChild(st)}
 /* in the column of the map's buttons (zoom, reset...), last */
 try{const col=amGlobe.host.querySelector(".globe-btns");if(col&&el.parentNode!==col)col.appendChild(el);else if(col&&col.lastElementChild!==el)col.appendChild(el)}catch(e){}return el}
function show(on){if(on){const r=ring();if(!r.classList.contains("on")){r.classList.add("on");shownAt=Date.now()}}else if(el&&el.classList.contains("on"))el.classList.remove("on")}
function tick(){timer=0;const now=Date.now(),m=mapNow();
 POLL.forEach((fn,k)=>{let t=null;try{t=m?fn():null}catch(e){t=null}if(t)start(k,t);else end(k)});
 let first=Infinity;A.forEach((e,k)=>{if(e.m!==m){end(k);return}if(!e.dead&&e.sp+now-e.t0>e.max)e.dead=true;if(!e.dead)first=Math.min(first,e.t0)});
 const busy=first<Infinity,vis=!!(el&&el.classList.contains("on"));
 /* off the Maps page, or another map: hidden at once */
 const moved=m!==lastM;lastM=m;
 if(!m||moved&&!busy)show(false);
 else if(busy){idleAt=0;if(vis||now-first>=SHOW)show(true)}
 else if(vis){if(!idleAt)idleAt=now;if(now-shownAt>=MINV&&now-idleAt>=GAP)show(false)}
 if(A.size||POLL.size&&m||el&&el.classList.contains("on"))timer=setTimeout(tick,TICK)}
/* the Maps page may be left without any loader saying so: looked at now and then */
setInterval(()=>{if(!timer&&(A.size||el&&el.classList.contains("on")||POLL.size&&mapNow()))run()},1000);
window.gfSharpBusy={start,done,poll,state:()=>({on:!!(el&&el.classList.contains("on")),keys:[...A].map(([k,e])=>k+(e.dead?" (dropped)":"")+" "+Math.round((Date.now()-e.t0)/100)/10+"s")})};
/* the Relief map's zoom-detail tiles (geoflock-detail.js): busy while tiles are queued or loading */
poll("detail",()=>{const D=window.gfDetail&&gfDetail.dbg&&gfDetail.dbg();return D&&(D.inflight>0||D.q>0)?"tiles":null});
})();
