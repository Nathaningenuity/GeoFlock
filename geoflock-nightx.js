/* GeoFlock: City Lights and grid lines.
   1. City Lights is a night-only map: a small star on its tab, place names off when it opens (back as they were on leaving),
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
/* City Lights: names off on the way in, back on the way out */
let was=null,saved=null;
function labels(){const n=night();if(n===was)return;const ts=["allMapsShowLabelsToggle","allMapsSeaLabelsToggle"].map(id=>document.getElementById(id)).filter(Boolean);
 const set=(t,v)=>{if(t.checked!==v){t.checked=v;t.dispatchEvent(new Event("change",{bubbles:true}))}};
 if(n){saved=ts.map(t=>t.checked);ts.forEach(t=>set(t,false))}else if(was&&saved)ts.forEach((t,i)=>{if(saved[i])set(t,true)});was=n}
const css=document.createElement("style");css.textContent=`
[data-allmaps-mode="night"]::after{ content:"★"; font-size:.72em; margin-left:4px; color:#f5c84b; vertical-align:.18em; }
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
/* with the City Lights tab the map tabs still fit two rows in Starlight: Printable maps becomes just its icon */
function printChip(){const b=document.getElementById("gfPrintChip");if(!b)return;const want=document.body.classList.contains("sky-night")?"🖨":"🖨 Printable maps";if(b.textContent!==want){b.textContent=want;b.setAttribute("aria-label","Printable maps")}}
setInterval(()=>{try{fold();labels();printChip()}catch(e){}},400);
})();
