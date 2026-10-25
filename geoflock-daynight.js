/* GeoFlock: live day and night on the Maps page, with a live clock.
   The night side is the half of the Earth more than 90° from the point where the sun is overhead right now;
   twilight bands are drawn at 6°, 12° and 18° below the horizon. Redrawn every minute.
   On the globe the same night side is drawn on the globe's overlay layer, and the clock sits on whichever map is showing. */
(function(){
if(typeof renderAllMapsView!=="function"||typeof d3==="undefined")return;
const R=Math.PI/180;
/* where the sun is overhead at time t (NOAA-style approximation, good to a fraction of a degree) */
function subsolar(t){const d=(t/864e5)+2440587.5-2451545.0,g=(357.529+0.98560028*d)*R,q=280.459+0.98564736*d,L=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R,e=(23.439-0.00000036*d)*R;
 const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L));
 const gmst=((18.697374558+24.06570982441908*d)%24+24)%24;let lon=(ra/R-gmst*15)%360;if(lon>180)lon-=360;if(lon<-180)lon+=360;return[lon,dec/R]}
let on=false,timer=null;
/* off whenever the page opens; the switch turns it on for this visit */
function prefsOn(){return false}
function setPref(v){try{stats.dayNight=v;saveStats()}catch(e){}}
function proj(){return typeof GLOBE_ROBINSON!=="undefined"?GLOBE_ROBINSON:d3.geoRobinson().scale(318.31).translate([1e3,500.5])}
function draw(){globe();const wrap=document.getElementById("allMapsWrap"),svg=wrap&&wrap.querySelector("svg");if(wrap)wrap.classList.toggle("gf-dn-on",on);if(!svg){clock();return}let g=svg.querySelector("g.gf-night");
 if(!on){if(g)g.remove();clock();return}
 if(!g){g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","gf-night");g.setAttribute("data-spin","no");g.style.pointerEvents="none";const anchor=svg.querySelector("g.map-labels")||svg.querySelector("g.map-cities");svg.insertBefore(g,anchor||null)}
 /* above the cloud layer, below the labels */
 {const cl=svg.querySelector("#allMapsCloudLayer"),lab=svg.querySelector("g.map-labels");if(cl&&lab&&cl.compareDocumentPosition(lab)&Node.DOCUMENT_POSITION_PRECEDING)cl.after(g);else if(lab&&g.nextElementSibling!==lab)svg.insertBefore(g,lab);if(cl&&(g.compareDocumentPosition(cl)&Node.DOCUMENT_POSITION_FOLLOWING))cl.after(g)}
 const s=subsolar(Date.now()),anti=[s[0]+180>180?s[0]-180:s[0]+180,-s[1]],path=d3.geoPath(proj());
 /* night = circle of 90° around the anti-solar point; darker bands for civil, nautical and astronomical twilight */
 const kk=wrap.classList.contains("sat-mode")?1.7:1;g.innerHTML=[[90,.26],[84,.16],[78,.12],[72,.1]].map(([r,o])=>(o=+(o*kk).toFixed(3),0)||'<path d="'+(path(d3.geoCircle().center(anti).radius(r).precision(2)())||"")+'" style="fill:#06122b !important;fill-opacity:'+o+' !important;stroke:none !important;filter:none !important"/>').join("")+
  (()=>{const p=proj()(s);return p?'<g transform="translate('+p[0].toFixed(1)+','+p[1].toFixed(1)+')"><circle r="9" fill="#ffd34d" fill-opacity=".35"/><circle r="4.5" fill="#ffcc33" stroke="#fff" stroke-width="1"/></g>':""})();
 clock()}
/* the globe: ask it to redraw; its overlay hook below paints the night side */
function globe(){try{if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}
if(typeof GlobeView!=="undefined"){const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){
 try{if(on&&typeof amGlobe!=="undefined"&&this===amGlobe){const s=subsolar(Date.now()),anti=[s[0]+180>180?s[0]-180:s[0]+180,-s[1]],path=d3.geoPath(p,ctx);
  ctx.save();ctx.fillStyle="#06122b";[[90,.3],[84,.16],[78,.12],[72,.1]].forEach(([r,o])=>{ctx.globalAlpha=o;ctx.beginPath();path(d3.geoCircle().center(anti).radius(r).precision(2)());ctx.fill()});ctx.globalAlpha=1;
  const c=[-this.rot[0],-this.rot[1]];if(d3.geoDistance(s,c)<Math.PI/2-.02){const q=p(s);if(q){ctx.fillStyle="rgba(255,211,77,.35)";ctx.beginPath();ctx.arc(q[0],q[1],9,0,7);ctx.fill();ctx.fillStyle="#ffcc33";ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1],4.5,0,7);ctx.fill();ctx.stroke()}}
  ctx.restore()}}catch(e){console.error(e)}return _dm.apply(this,arguments)}}
/* the clock follows the Flat map / Globe switch */
document.addEventListener("click",e=>{if(on&&e.target.closest&&e.target.closest("button"))setTimeout(clock,300)},true);
function fmt(d,tz){try{return d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",timeZone:tz})}catch(e){return""}}
function clockHost(){try{if(typeof amGlobeOn==="function"&&amGlobeOn()&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected)return amGlobe.host}catch(e){}return document.getElementById("allMapsWrap")}
function clock(){const wrap=clockHost();if(!wrap)return;document.querySelectorAll(".gf-clock").forEach(x=>{if(x.parentNode!==wrap||!on)x.remove()});let c=wrap.querySelector(":scope > .gf-clock");if(!on)return;
 if(!c){c=document.createElement("div");c.className="gf-clock";if(getComputedStyle(wrap).position==="static")wrap.style.position="relative";wrap.appendChild(c)}const now=new Date();
 c.innerHTML='<b>'+fmt(now,"UTC")+'</b> <small>UTC</small><span>·</span><b>'+fmt(now)+'</b> <small>your time</small>'+(c._at?'<span>·</span><b>'+c._at+'</b>':'')}
/* the local solar-ish time under the pointer, from its longitude and the official zone where we know it */
function hoverTime(e){const wrap=document.getElementById("allMapsWrap"),c=wrap&&wrap.querySelector(".gf-clock");if(!on||!c)return;const svg=wrap.querySelector("svg");const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();if(!m)return;const q=pt.matrixTransform(m.inverse());const ll=proj().invert([q.x,q.y]);if(!ll||!isFinite(ll[0])||Math.abs(ll[1])>90){c._at=null;clock();return}
 const off=Math.round(ll[0]/15),t=new Date(Date.now()+off*36e5);c._at=fmt(t,"UTC")+' <small>at '+Math.abs(ll[1]).toFixed(0)+'°'+(ll[1]>=0?"N":"S")+' '+Math.abs(ll[0]).toFixed(0)+'°'+(ll[0]>=0?"E":"W")+' (sun time)</small>';clock()}
function set(v){on=v;setPref(v);clearInterval(timer);if(on)timer=setInterval(draw,60000);draw();const i=document.getElementById("gfDayNightToggle");if(i)i.checked=on}
function ensure(){const tz=document.getElementById("allMapsTimeZonesToggle");if(!tz||document.getElementById("gfDayNightToggle"))return;const lab=tz.closest("label");if(!lab)return;
 lab.insertAdjacentHTML("afterend",'<label class="switch" title="Where it is day and night right now"><input type="checkbox" id="gfDayNightToggle"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Day &amp; night</span></label>');
 const i=document.getElementById("gfDayNightToggle");i.checked=prefsOn();i.onchange=()=>set(i.checked);if(i.checked)set(true);
 const wrap=document.getElementById("allMapsWrap");if(wrap&&!wrap._gfDN){wrap._gfDN=1;wrap.addEventListener("mousemove",hoverTime);wrap.addEventListener("mouseleave",()=>{const c=wrap.querySelector(".gf-clock");if(c){c._at=null;clock()}})}}
const _r=renderAllMapsView;renderAllMapsView=function(){const r=_r.apply(this,arguments);try{ensure();if(on)draw()}catch(e){console.error(e)}return r};
/* redraw when the map mode changes (the satellite's cloud layer is added then) */
if(typeof applyAllMapsColorMode==="function"){const _a=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_a.apply(this,arguments);try{if(on)setTimeout(draw,400)}catch(e){}return r}}
/* the cloud switch adds its layer later too */
document.addEventListener("change",e=>{if(on&&e.target&&/Cloud/i.test(e.target.id||""))setTimeout(draw,400)},true);
/* redraw after the world is spun east–west */
if(typeof spinTo==="function"){const _s=spinTo;spinTo=function(){const r=_s.apply(this,arguments);try{if(on)setTimeout(draw,0)}catch(e){}return r}}
const css=document.createElement("style");css.textContent=`
.gf-clock{ position:absolute; left:50%; transform:translateX(-50%); bottom:12px; z-index:6; background:rgba(10,20,40,.78); color:#fff; border-radius:999px; padding:5px 14px; font-size:13px; display:flex; gap:6px; align-items:baseline; pointer-events:none; white-space:nowrap; box-shadow:0 2px 10px rgba(0,0,0,.25); }
.gf-clock small{ opacity:.7; font-size:11px; } .gf-clock span{ opacity:.4; }
.globe-host > .gf-clock{ top:10px; bottom:auto; }
/* with night drawn, the white halos of the small mountain-range labels showed as pale bars on the dark side */
#allMapsWrap.gf-dn-on svg text.landform-label{ fill:#f4ecdc !important; stroke:rgba(14,22,38,.55) !important; }
@media (max-width:600px){ .gf-clock{ font-size:11px; bottom:46px; } }`;
document.head.appendChild(css);
window.gfDayNight={subsolar,set};
})();
