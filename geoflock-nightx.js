/* GeoFlock: City Lights and grid lines.
   1. City Lights is a night-only map: a small star on its tab; Satellite and City Lights keep their own labels and globe settings,
      and its guided tour first asks to switch to the Starlight (dark) theme.
   2. Grid lines get a ▾: everywhere, over land only, or over the sea only; softer at night. */
(function(){
const night=()=>{try{return appMode==="allmaps"&&allMapsColorMode==="night"}catch(e){return false}};
let GM="all";try{GM=localStorage.getItem("gfGratMode")||"all"}catch(e){}
let LAND=null;function land(){if(LAND)return LAND;try{LAND=topojson.merge(PROJ_WORLD,PROJ_WORLD.objects.countries.geometries)}catch(e){}return LAND}
/* called by the globe/flat map where it draws the grid */
window.gfGrat=function(ctx,path){ctx.save();
 if(GM!=="all"&&land()){ctx.beginPath();if(GM==="sea")path({type:"Sphere"});path(land());ctx.clip(GM==="sea"?"evenodd":"nonzero")}
 ctx.beginPath();path(d3.geoGraticule10());ctx.strokeStyle=night()?"rgba(190,205,235,0.16)":"rgba(255,255,255,0.35)";ctx.lineWidth=night()?.5:.6;ctx.stroke();ctx.restore()};
function redraw(){try{amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}
/* the ▾ on Grid lines */
function fold(){const inp=document.getElementById("allMapsGraticuleToggle");if(!inp)return;const sw=inp.closest("label.switch");if(!sw||sw.parentNode.classList.contains("gf-grat"))return;
 const g=document.createElement("span");g.className="lf-control gf-grat";sw.parentNode.insertBefore(g,sw);g.appendChild(sw);
 g.insertAdjacentHTML("beforeend",'<button type="button" class="lf-caret" aria-haspopup="true" aria-expanded="false" title="Where to draw the grid">▾</button><div class="lf-pop" role="menu" hidden><div class="lf-pop-head"><span>Draw the grid</span></div>'+
  [["all","Everywhere"],["land","Over land only"],["sea","Over the sea only"]].map(([k,l])=>'<button type="button" class="lf-item" role="menuitemradio" data-gm="'+k+'"><i aria-hidden="true"></i>'+l+'</button>').join("")+'</div>');
 const pop=g.querySelector(".lf-pop"),car=g.querySelector(".lf-caret");
 const mark=()=>pop.querySelectorAll("[data-gm]").forEach(b=>{const v=b.dataset.gm===GM;b.classList.toggle("on",v);b.setAttribute("aria-checked",String(v))});mark();
 car.onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden;car.setAttribute("aria-expanded",String(!pop.hidden))};
 document.addEventListener("click",e=>{if(!g.contains(e.target)){pop.hidden=true;car.setAttribute("aria-expanded","false")}});
 pop.querySelectorAll("[data-gm]").forEach(b=>b.onclick=e=>{e.stopPropagation();GM=b.dataset.gm;try{localStorage.setItem("gfGratMode",GM)}catch(_){}mark();
  if(!inp.checked){inp.checked=true;inp.dispatchEvent(new Event("change",{bubbles:true}))}redraw()})}
/* Satellite and City Lights keep their own names setting (place and sea labels, off by default), and Satellite its own
   globe/flat choice (the globe by default; City Lights goes with the other maps). What you change while on them is remembered
   for them (localStorage gfLitView), and the other maps get their own settings back on the way out. Tours are left alone. */
const LITK="gfLitView";let LIT={labels:[false,false],globe:true};try{const v=JSON.parse(localStorage.getItem(LITK)||"null");if(v&&Array.isArray(v.labels))LIT=Object.assign(LIT,v)}catch(e){}
const saveLit=()=>{try{localStorage.setItem(LITK,JSON.stringify(LIT))}catch(e){}};
const onMode=ms=>{try{return appMode==="allmaps"&&allMapsColorModeOn&&ms.includes(allMapsColorMode)&&!(typeof ps!=="undefined"&&ps)}catch(e){return false}};
const lblEls=()=>["allMapsShowLabelsToggle","allMapsSeaLabelsToggle"].map(id=>document.getElementById(id));
const setChk=(t,v)=>{if(t&&t.checked!==v){t.checked=v;t.dispatchEvent(new Event("change",{bubbles:true}))}};
const globeOn=()=>{try{return!!globePrefs().allmaps}catch(e){return false}};
const setGlobe=v=>{try{if(!!globePrefs().allmaps!==v){globePrefs().allmaps=v;try{saveStats()}catch(e){}amGlobeSync()}}catch(e){}};
let wasL=null,wasG=null,wasN=null,otherL=null,otherG=null;
function labels(){
 /* names: Satellite and City Lights */
 const nL=onMode(["satellite","night"]);
 if(nL!==wasL){if(nL){otherL=lblEls().map(t=>t?t.checked:null);lblEls().forEach((t,i)=>setChk(t,!!LIT.labels[i]))}
  else if(wasL&&otherL){lblEls().forEach((t,i)=>{if(otherL[i]!=null)setChk(t,otherL[i])});otherL=null}wasL=nL}
 else if(nL){const L=lblEls().map(t=>t?t.checked:false);if(L[0]!==LIT.labels[0]||L[1]!==LIT.labels[1]){LIT.labels=L;saveLit()}}
 /* globe or flat: Satellite has its own (the globe by default); City Lights opens on the globe; the other maps get their
    own choice back when you leave both. */
 const nG=onMode(["satellite"]),inLit=nL;
 if(nG!==wasG){if(nG){if(otherG==null)otherG=globeOn();setGlobe(LIT.globe!==false)}wasG=nG}
 else if(nG){const g=globeOn();if(g!==LIT.globe){LIT.globe=g;saveLit()}}
 /* City Lights opens on the globe each time (the flat map stays one click away) */
 const nN=onMode(["night"]);if(nN!==wasN){if(nN){if(otherG==null)otherG=globeOn();setGlobe(true)}wasN=nN}
 if(!inLit&&otherG!=null&&!(typeof ps!=="undefined"&&ps)){setGlobe(otherG);otherG=null}}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("[data-allmaps-mode]"))setTimeout(()=>{try{labels()}catch(x){}},0)},true);
const css=document.createElement("style");css.textContent=`
[data-allmaps-mode="night"]{ position:relative; overflow:visible; }
html.gf-nl-seen [data-allmaps-mode="night"]::after{ display:none; }
[data-allmaps-mode="night"]::after{ content:""; position:absolute; top:-5px; right:-3px; width:15px; height:15px; pointer-events:none;
 background:radial-gradient(circle,#fff 0 18%,rgba(255,255,255,.55) 30%,rgba(255,255,255,0) 62%);
 -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z'/%3E%3C/svg%3E") center/contain no-repeat;
 mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z'/%3E%3C/svg%3E") center/contain no-repeat;
 background-color:#fff; filter:drop-shadow(0 0 3px rgba(255,255,255,.95)) drop-shadow(0 0 6px rgba(190,215,255,.8)); animation:gfStarTw 2.6s ease-in-out infinite; }
@keyframes gfStarTw{ 0%,100%{ opacity:.85; transform:scale(.9) rotate(0deg); } 50%{ opacity:1; transform:scale(1.12) rotate(12deg); } }
@media (prefers-reduced-motion:reduce){ [data-allmaps-mode="night"]::after{ animation:none; } }
.gf-nightask{ position:fixed; inset:0; z-index:10050; display:flex; align-items:center; justify-content:center; background:rgba(8,12,28,.55); }
.gf-nightask > div{ width:min(400px,calc(100vw - 32px)); background:#fffdf8; color:#22324a; border-radius:18px; padding:22px 22px 18px; box-shadow:0 18px 50px rgba(0,0,0,.35); font:500 14.5px/1.45 system-ui,sans-serif; text-align:center; }
.gf-nightask h3{ margin:4px 0 6px; font-size:19px; } .gf-nightask .ico{ font-size:34px; }
.gf-nightask .row{ display:flex; gap:8px; justify-content:center; margin-top:14px; flex-wrap:wrap; }
.gf-nightask button{ border:0; border-radius:999px; padding:9px 16px; font:700 14px system-ui; cursor:pointer; background:#e9edf3; color:#22324a; }
.gf-nightask button.pri{ background:#2b3566; color:#fff; }
body.sky-night .gf-nightask > div{ background:#1d2638; color:#e6edf7; } body.sky-night .gf-nightask button{ background:#2c3750; color:#e6edf7; } body.sky-night .gf-nightask button.pri{ background:#f5c84b; color:#1d2638; }`;
document.head.appendChild(css);
/* the City Lights tour: switch to Starlight first */
if(typeof psLaunchTour==="function"){const _l=psLaunchTour;psLaunchTour=function(id){const self=this,args=arguments;
 try{if(id==="night"&&stats.theme!=="night"){const m=document.createElement("div");m.className="gf-nightask";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  m.innerHTML='<div><div class="ico">🌙</div><h3>City lights only show at night</h3><p>This tour needs the dark <b>Starlight</b> theme. Switch to it now? You can switch back with the sun button at the top.</p><div class="row"><button type="button" class="pri" data-y>Switch to Starlight and start</button><button type="button" data-n>Not now</button></div></div>';
  document.body.appendChild(m);const done=()=>m.remove();
  m.querySelector("[data-y]").onclick=()=>{done();stats.theme="night";try{applyTheme();saveStats()}catch(e){}_l.apply(self,args)};
  m.querySelector("[data-n]").onclick=done;m.addEventListener("click",e=>{if(e.target===m)done()});m.querySelector("[data-y]").focus();return}}catch(e){console.error(e)}
 return _l.apply(this,arguments)}}
/* Printable maps is only ever its symbol (light and dark), so the map tabs stay on two rows */
function printChip(){const b=document.getElementById("gfPrintChip");if(!b)return;if(b.textContent!=="🖨"){b.textContent="🖨";b.setAttribute("aria-label","Printable maps")}}
setInterval(()=>{try{fold();labels();printChip()}catch(e){}},400);
})();
/* the City Lights tour plays on the globe, where the night picture is sharpest */
setInterval(()=>{try{if(typeof ps!=="undefined"&&ps&&ps.tour==="night"&&typeof psSwitching!=="undefined"&&!psSwitching&&appMode==="allmaps"&&!globePrefs().allmaps){globePrefs().allmaps=true;amGlobeSync()}}catch(e){}},500);
(function(){const set=()=>{try{const T=PS_TOURS.night;if(T&&T.map&&!T.map.globe){T.map.globe=true;return true}return!!(T&&T.map&&T.map.globe)}catch(e){return false}};if(!set()){let n=0;const t=setInterval(()=>{if(set()||++n>60)clearInterval(t)},500)}})();
/* the star on the City Lights tab goes away once the map has been opened */
(function(){const K="gfNightSeen";try{if(localStorage.getItem(K))document.documentElement.classList.add("gf-nl-seen")}catch(e){}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('[data-allmaps-mode="night"]')){document.documentElement.classList.add("gf-nl-seen");try{localStorage.setItem(K,"1")}catch(err){}}},true)})();

/* the India–Pakistan border, now that the sharp NASA tiles show it: back as its own stop, after "India: the most people" */
(function(){const go=()=>{try{const T=PS_TOURS.night;if(!T||!T.steps)return false;const S=T.steps;if(S.some(s=>s&&s.title==="A border you can see from space"))return true;
 const i=S.findIndex(s=>s&&s.title==="India: the most people");if(i<0)return false;const IN=S[i];
 if(typeof IN.more==="string"&&/India–Pakistan border/.test(IN.more))IN.more="India passed China as the country with the most people in 2023. At night its railways and highways show up too, as strings of lit towns running across the plains.";
 S.splice(i+1,0,{title:"A border you can see from space",view:[66,22,78,32],globe:[71,27,9],hi:[],_enr:1,
  pins:[[[70.36,26.42],"The floodlit border","point"],[[74.33,31.55],"Lahore","point"],[[68.37,25.4],"Hyderabad (Pakistan)","point"],[[73.02,26.24],"Jodhpur","point"]],
  stat:"Floodlights along the India–Pakistan border make a line you can see from space",
  body:"Look closely at the thin orange line winding through the dark Thar Desert. It is not a line drawn on the map: it is real light, photographed from space. India lit most of its 3,300 km border with Pakistan with tens of thousands of floodlights, so the border itself glows, even where no one lives.",
  more:"India fenced and floodlit the border in the 1990s and 2000s to stop smuggling and armed infiltration. Astronauts on the Space Station photograph it as an orange line between the lights of Pakistan’s Indus valley and India’s towns. It is one of very few borders you can see at night."});return true}catch(e){return false}};
 if(!go()){let n=0;const t=setInterval(()=>{if(go()||++n>60)clearInterval(t)},500)}
 /* the old stop's Mumbai skyline photo does not fit it */
 let m=0;const ph=setInterval(()=>{try{if(typeof PS_PHOTO!=="undefined"&&PS_PHOTO["night|A border you can see from space"]!=null){delete PS_PHOTO["night|A border you can see from space"]}}catch(e){}if(++m>40)clearInterval(ph)},500)})();
/* that stop: tours keep the globe further out than the border needs, so once there it eases in close (the sharp tiles load
   at that zoom); the tour's own sideways shift for its card is kept */
(function(){const T="A border you can see from space";let done="",hid=false;
 /* the map's own border lines are hidden at this stop, so the line you see is only the floodlights */
 const borders=on=>{try{allMapsBordersOn=on;applyAllMapsLakesBorders();amGlobe&&amGlobe.render&&amGlobe.render()}catch(e){}};
 setInterval(()=>{try{const here=typeof ps!=="undefined"&&ps&&ps.tour==="night"&&psSteps()[ps.i]&&psSteps()[ps.i].title===T;
  if(here&&!hid&&allMapsBordersOn){hid=true;borders(false)}else if(!here&&hid){hid=false;borders(true)}}catch(e){}},250);
 setInterval(()=>{try{if(typeof ps==="undefined"||!ps||ps.tour!=="night")return;const S=psSteps()[ps.i],k=ps.tour+"|"+ps.i;if(!S||S.title!==T){done="";return}
  const g=amGlobe;if(done===k||!g||g._flat||g._flying||g._gfDown)return;done=k;
  const z0=g.zoom,r0=g.rot.slice(),z1=12,off=(r0[0]-(-71))*z0/z1,r1=[-71+off,-27],t0=performance.now(),D=1800;
  const step=n=>{if(typeof ps==="undefined"||!ps||psSteps()[ps.i]!==S||g._gfDown)return;const t=Math.min(1,(n-t0)/D),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
   g.zoom=z0+(z1-z0)*e;g.rot=[r0[0]+(r1[0]-r0[0])*e,r0[1]+(r1[1]-r0[1])*e];g.render();if(t<1)requestAnimationFrame(step)};requestAnimationFrame(step)}catch(e){}},700)})();

/* the City Lights tour runs on the City Lights map only: offered in other maps' tour lists too, it switches to City
   Lights when started from one (psLaunchTour puts the map on, then starts the tour) */
(function(){let at=0;const hook=()=>{if(typeof psStart!=="function"||typeof psLaunchTour!=="function")return false;if(psStart._gfNightOwn)return true;
 const _s=psStart;psStart=function(want){try{if(want==="night"&&!(appMode==="allmaps"&&allMapsColorModeOn&&allMapsColorMode==="night")){
   if(Date.now()-at>15000){at=Date.now();psLaunchTour("night")}return}}catch(e){console.error(e)}return _s.apply(this,arguments)};psStart._gfNightOwn=1;
 const _l=psLaunchTour;psLaunchTour=function(id){if(id==="night")at=Date.now();return _l.apply(this,arguments)};return true};
 if(!hook()){let n=0;const t=setInterval(()=>{if(hook()||++n>60)clearInterval(t)},500)}})();
