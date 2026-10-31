/* GeoFlock: tour stops about day and night use the real Day & Night globe (geoflock-daynightglobe.js).
   A stop that showed day and night with the old gadget (gfSun: a thin yellow day/night line and a sun dot over the
   map, with Time of day / Date sliders in the card), or with the live world clock (worldclock), is now shown on the
   Satellite globe lit by the Sun: the sunlit half, a soft terminator, city lights on the night side and the sun-aware
   rim. The card's controls move the globe's Sun:
   - "stop": the card's Time of day and Date sliders (the stop's moment, gfSun) set the Sun;
   - "clock": the live world clock in the card ("drag the Sun to travel in time") sets the Sun, live or dragged;
   - "live": the Sun stands where it really is now.
   The card says which moment the globe shows. A small yellow sun marks the point where the Sun is overhead; the old
   yellow line is not drawn over the shaded globe.
   How it works: Day & Night itself refuses to switch on during a tour (its allowed() check), so this file does not turn
   it on. While such a stop shows, every draw of the Maps globe (the shader, its rim and its overlay layer) runs as if
   Day & Night were on, with the Sun of the stop; nothing of the Day & Night state is changed, so leaving the stop, or
   ending the tour, gives back exactly what was there (and Day & Night is turned back on afterwards if it was on before
   the tour). Stops on a flat map are shown on the globe (the Time zones tour runs on the globe throughout); stops of
   tours on another map switch to the Satellite map for that stop through the tours' own per-stop map switch
   (stopModes). The "Day" chip under the globe shows the plain satellite picture for the stop; "Day & Night" brings the
   sun back. Load after the tour files and geoflock-daynightglobe.js (it patches after window load + 1.5 s). */
(function(){
let booted=false;
function boot(){if(booted)return;booted=true;
 try{run()}catch(e){console.error("dngtour",e)}}
if(document.readyState==="complete")setTimeout(boot,1500);else addEventListener("load",()=>setTimeout(boot,1500));
window.gfDngTourBoot=boot;

function run(){
if(typeof PS_TOURS==="undefined"||typeof psGo!=="function"||!window.gfDNG||typeof GlobeGL==="undefined"||typeof GlobeView==="undefined")return;
const D=window.gfDNG,DS=D.state,R=Math.PI/180;
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONL=["January","February","March","April","May","June","July","August","September","October","November","December"];
const hm=h=>{h=(h%24+24)%24;const m=Math.round(h*60)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
const doyDate=d=>{const t=new Date(Date.UTC(2026,0,1)+((Math.round(d)-1+365)%365)*864e5);return t.getUTCDate()+" "+MONL[t.getUTCMonth()]};
function subsolar(ms){try{if(window.gfDayNight&&gfDayNight.subsolar){const s=gfDayNight.subsolar(ms);return{lon:s[0],lat:s[1]}}}catch(e){}
 const d=ms/864e5+2440587.5-2451545,g=(357.529+.98560028*d)*R,q=280.459+.98564736*d,L=(q+1.915*Math.sin(g)+.02*Math.sin(2*g))*R,e=(23.439-36e-8*d)*R;
 const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L)),gm=((18.697374558+24.06570982441908*d)%24+24)%24;
 let lon=(ra/R-gm*15)%360;if(lon>180)lon-=360;if(lon<-180)lon+=360;return{lon,lat:dec/R}}
const def=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{o[k]=v}catch(x){}}};
const stopOf=(t,title)=>{const T=PS_TOURS[t];return T&&(T.steps||[]).find(s=>s&&String(s.title).replace(/​/g,"").trim()===title)};

/* ---------------------------------------------------------------- which stops, and how
   key "tour|title": {sun:"stop"|"clock"|"live"|null, at: UTC hour the world clock starts at (clock stops),
   gfSun: a moment to add to a stop that had none, body: [old, new] text swap} */
const PLAN={
 /* Earth from space: the stop that was a yellow line over the daylight picture */
 "space|The line between day and night":{sun:"stop",body:["This satellite picture shows every place in daylight, but really the Sun lights only one side. The yellow line, the terminator, is where the Sun is rising or setting.","Here the globe is lit as it really is: the Sun lights only one side, and city lights shine on the other. The soft edge between them, the terminator, is where the Sun is rising or setting."]},
 /* Time zones: on the globe throughout; the Sun where it makes the point */
 "time|Time zones":{sun:"live"},
 "time|Why time zones":{sun:"clock"},
 "time|Paris, nine minutes late":{sun:null},
 "time|The date line":{sun:"clock",at:21},
 "time|The most time zones":{sun:null},
 "time|Russia: eleven clocks":{sun:"stop",gfSun:{utc:7,day:355}},
 "time|The United States: six zones":{sun:"stop",gfSun:{utc:16,day:172}},
 "time|When sunset steals your sleep":{sun:"stop"},
 "time|Australia: three zones, five in summer":{sun:null},
 "time|One clock for China":{sun:"stop"},
 "time|Half and quarter hours":{sun:null},
 "time|Pyongyang time":{sun:null},
 "time|Spain’s clock is off":{sun:"stop"},
 "time|The day Samoa skipped":{sun:"clock",at:21},
 "time|Daylight saving time":{sun:null},
 "time|Arizona’s clock doughnut":{sun:null},
 "time|Where north and west fool you":{sun:null},
 "time|Every time zone at once":{sun:"stop"},
 "time|Now explore":{sun:"live"},
 /* other tours: the stops whose point is the Sun, the season or the time of day (their map switches to Satellite) */
 "night|Night moves round the planet":{sun:"stop"},
 "climate|Why we have seasons":{sun:"stop"},
 "europe|Islands of the midnight sun":{sun:"stop"},
 "hantarctica|The first winter":{sun:"stop",gfSun:{utc:12,day:172}},
 "flags|Suns on flags":{sun:"stop"},
 "hg1|Time–space compression":{sun:"stop"},
 "hg7b|Night shift in Manila":{sun:"stop"},
 "regions|Arctic oddities":{sun:"stop"},
 "weather|The lightning capital":{sun:"stop"},
 "ice|The frozen ocean":{sun:"stop"},
 "music|K-pop":{sun:"stop"},
 "literature|Sagas by the fireside":{sun:"stop"},
 "festivals|New year in spring":{sun:"stop"},
 "festivals|Inti Raymi":{sun:"stop"},
 "festivals|Welcome back, Sun":{sun:"stop"},
 "houses|Snow houses":{sun:"stop"},
 "amigration|Caribou on the tundra":{sun:"stop"},
 "amigration|The biggest migration happens every night":{sun:"stop"},
 "energy|Sunshine in the desert":{sun:"stop"},
 "maths|Eratosthenes measures the Earth":{sun:"stop"},
 "psychology|Winter in Tromsø":{sun:"stop"}
};
/* A stop is lit only when its point is day or night; every other Satellite stop shows the plain daytime picture. */
/* tours whose every stop is shown on the globe (the Day & Night stops among them are lit) */
const GLOBE_TOURS=new Set(["time"]);
const FOUND=[];
for(const k in PLAN){const [t,title]=k.split("|"),S=stopOf(t,title),P=PLAN[k];if(!S)continue;FOUND.push(k);
 try{
  if(P.gfSun&&!S.gfSun)def(S,"gfSun",P.gfSun);
  if(P.body&&typeof S.body==="string"&&S.body.includes(P.body[0]))def(S,"body",S.body.replace(P.body[0],P.body[1]));
  /* the live night overlay (on:["daynight"]) would darken the night side twice */
  if(P.sun&&Array.isArray(S.on)&&S.on.includes("daynight"))def(S,"on",S.on.filter(x=>x!=="daynight"));
  const T=PS_TOURS[t];
  if(P.sun&&(S.mode||T.map.mode)!=="satellite"){def(S,"mode","satellite");T.stopModes=true}
  S._dngt=P}catch(e){console.error("dngtour plan",k,e)}}
window.gfDngTourPlan=FOUND;
/* any other stop on the Satellite map with the old day-and-night gadget, or the world clock, gets the same treatment */
function planFor(t,S){if(!S)return null;if(S._dngt)return S._dngt;
 try{const T=PS_TOURS[t],m=S.mode||T.map.mode;if(m!=="satellite")return GLOBE_TOURS.has(t)?{sun:null}:null;
  if(S.gfSun)return{sun:"stop"};
  if(typeof ps!=="undefined"&&ps&&ps.card&&ps.card.querySelector('[data-dg="worldclock"]'))return{sun:"clock"}}catch(e){}
 return GLOBE_TOURS.has(t)?{sun:null}:null}

/* ---------------------------------------------------------------- state */
const ST={F:null,plan:null,key:null,userDay:false,flatPrev:null,wasOn:false,clockSet:null,lastSun:null};
const tourOn=()=>typeof ps!=="undefined"&&!!ps;
const switching=()=>{try{return typeof psSwitching!=="undefined"&&!!psSwitching}catch(e){return false}};
const curStop=()=>{try{return tourOn()?psSteps()[ps.i]:null}catch(e){return null}};
const satMap=()=>{try{return appMode==="allmaps"&&allMapsColorModeOn&&allMapsColorMode==="satellite"}catch(e){return false}};
const isFlat=()=>{try{return!globePrefs().allmaps}catch(e){return false}};
const globeGL=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe?amGlobe:null}catch(e){return null}};
const lit=()=>!!(ST.F&&!ST.userDay);
function req(){try{const g=globeGL();if(g)g.request?g.request():g.render()}catch(e){}}

/* the Sun of the stop showing now */
function sunNow(){const S=curStop(),P=ST.plan;if(!S||!P||!P.sun)return null;
 if(P.sun==="stop"&&S.gfSun&&typeof pscSun==="function"){const s=pscSun(S);return{lon:s.lon,lat:s.lat,u:s.u,d:s.d,kind:"stop"}}
 if(P.sun==="clock"){const svg=ps.card&&ps.card.querySelector('[data-dg="worldclock"] svg');const off=svg&&svg._s?+svg._s.off||0:0,ms=Date.now()+off*36e5;return Object.assign(subsolar(ms),{ms,off,kind:"clock"})}
 const ms=Date.now();return Object.assign(subsolar(ms),{ms,kind:"live"})}

/* ---------------------------------------------------------------- drawing as if Day & Night were on */
function scoped(fn,test){return function(){if(!lit()||!test(this))return fn.apply(this,arguments);
 const o=DS.on,la=DS.lat,lo=DS.lon;DS.on=true;DS.lat=ST.F.lat;DS.lon=ST.F.lon;
 try{return fn.apply(this,arguments)}finally{DS.on=o;DS.lat=la;DS.lon=lo}}}
const isGL=g=>{const a=globeGL();return!!(a&&a.gl===g&&!a._flat)};
const isGV=v=>{const a=globeGL();return!!(a&&a===v&&!v._flat)};
GlobeGL.prototype.draw=scoped(GlobeGL.prototype.draw,isGL);
if(GlobeView.prototype._rimLit)GlobeView.prototype._rimLit=scoped(GlobeView.prototype._rimLit,isGV);
{const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=scoped(function(ctx,p){const r=_dm.apply(this,arguments);
 /* the Sun: a small yellow sun where it stands overhead (when that side faces us) */
 try{if(lit()&&isGV(this)){const sp=[ST.F.lon,ST.F.lat],c=[-this.rot[0],-this.rot[1]];if(d3.geoDistance(sp,c)<Math.PI/2-.03){const q=p(sp);if(q){ctx.save();
  const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],15);g.addColorStop(0,"rgba(255,236,170,.8)");g.addColorStop(1,"rgba(255,210,90,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],15,0,7);ctx.fill();
  ctx.fillStyle="#ffd34d";ctx.strokeStyle="rgba(255,255,255,.95)";ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(q[0],q[1],5.5,0,7);ctx.fill();ctx.stroke();ctx.restore()}}}}catch(e){}
 return r},isGV)}
/* the old gadget's yellow day/night line and sun dot are not drawn over the shaded globe (a ruler on the same stop still is) */
if(typeof psGlobeDraw==="function"){const _pg=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){const S=curStop();
 if(lit()&&S&&S.gfSun&&isGV(gv)){const dsc=Object.getOwnPropertyDescriptor(S,"gfSun");if(dsc&&dsc.configurable){
  Object.defineProperty(S,"gfSun",{configurable:true,enumerable:true,writable:true,value:undefined});
  try{return _pg.apply(this,arguments)}finally{Object.defineProperty(S,"gfSun",dsc)}}}
 return _pg.apply(this,arguments)}}
/* rivers and lakes are drawn in day colours; Day & Night leaves them off */
function patchOverlays(){const g=globeGL();if(!g||!g.cfg||typeof g.cfg.overlays!=="function"||g.cfg.overlays._dngt)return;const ov=g.cfg.overlays;
 g.cfg.overlays=function(){const o=ov.apply(this,arguments);if(lit()&&o&&!this._flat){o.rivers=false;o.lakes=false}return o};g.cfg.overlays._dngt=1}

/* ---------------------------------------------------------------- the card: what moment the globe shows */
function note(){const card=tourOn()&&ps.card;if(!card)return;const P=ST.plan,on=lit()&&P&&P.sun;
 card.classList.toggle("gf-dngt-clock",!!(on&&P.sun==="clock"));
 let el=card.querySelector(".gf-dngt-note");
 const s=ST.F;if(!on||!s){if(el)el.remove();const n=card.querySelector(".psc-sun .psc-n");if(n&&n._dngt){n.textContent=n._dngt;n._dngt=null}return}
 let txt="";
 if(s.kind==="stop"){txt="The globe shows "+hm(s.u)+" UTC on "+doyDate(s.d)+": the lit half is in daylight, and the night side shows its city lights. The Sun is overhead at the yellow dot.";
  const n=card.querySelector(".psc-sun .psc-n");if(n){if(n._dngt==null)n._dngt=n.textContent;if(n.textContent!==txt)n.textContent=txt;if(el)el.remove();return}}
 else{const t=new Date(s.ms),w=t.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"});
  txt=s.kind==="clock"?(s.off?"The globe shows the clock’s moment: "+hm(t.getUTCHours()+t.getUTCMinutes()/60)+" UTC, "+w+". Drag the little Sun to move the globe’s Sun; “Back to now” returns to the present.":"The globe shows right now, "+hm(t.getUTCHours()+t.getUTCMinutes()/60)+" UTC, "+w+". Drag the little Sun to travel in time: the globe’s Sun moves with it.")
   :"The globe shows the Sun where it is right now: "+hm(t.getUTCHours()+t.getUTCMinutes()/60)+" UTC, "+w+".";}
 if(!el){el=document.createElement("p");el.className="gf-dngt-note";el.setAttribute("aria-live","polite");
  const fig=card.querySelector('[data-dg="worldclock"]'),st=card.querySelector(".ps-stat");
  if(s.kind==="clock"&&fig)fig.after(el);else if(st)st.after(el);else (card.querySelector(".ps-body")||card).appendChild(el)}
 if(el.textContent!==txt)el.textContent=txt}

/* ---------------------------------------------------------------- following the tour */
function wantGlobe(t,S,P){return!!P&&(!!P.sun||GLOBE_TOURS.has(t))}
function toGlobe(){try{if(ST.flatPrev==null)ST.flatPrev=isFlat();if(isFlat()){globePrefs().allmaps=true;try{saveStats()}catch(e){}amGlobeSync();return true}}catch(e){console.error(e)}return false}
function backToFlat(){try{if(ST.flatPrev===true&&!isFlat()){globePrefs().allmaps=false;try{saveStats()}catch(e){}amGlobeSync()}}catch(e){console.error(e)}ST.flatPrev=null}
let refly=0;
/* bring everything in line with the stop showing now; pre = called from psGo before the stop is drawn */
function reconcile(i){
 if(!tourOn()||switching()){if(!tourOn()&&!switching())leave();return}
 const idx=i==null?ps.i:i,S=(psSteps()||[])[idx],t=ps.tour,key=t+"|"+idx;
 const P=planFor(t,S);
 if(key!==ST.key){ST.key=key;ST.userDay=false;ST.clockSet=null}
 ST.plan=P;
 patchOverlays();
 if(wantGlobe(t,S,P)){
  if(satMap()&&isFlat()){const ch=toGlobe();if(ch&&i==null&&Date.now()-refly>1500){refly=Date.now();setTimeout(()=>{try{if(tourOn()&&ps.i===idx)psGo(idx)}catch(e){}},0)}}}
 else if(ST.flatPrev!=null){
  /* a stop with a Pacific view keeps the globe: hand it to the tours' own switch, which goes back to the flat map later */
  if(S&&(S.pacific||S.autoGlobe)&&ST.flatPrev===true&&!isFlat()){try{ps._autoGlobe="allmaps"}catch(e){}ST.flatPrev=null}else backToFlat()}
 const on=!!(P&&P.sun&&satMap()&&!isFlat());
 if(!on){if(ST.F){ST.F=null;req()}note();return}
 /* the world clock starts at the hour that makes the point */
 if(P.sun==="clock"&&P.at!=null&&ST.clockSet!==key){const svg=ps.card&&ps.card.querySelector('[data-dg="worldclock"] svg');
  if(svg&&svg._s){const n=new Date(),nh=n.getUTCHours()+n.getUTCMinutes()/60;let off=((P.at-nh)%24+36)%24-12;svg._s.off=Math.round(off*12)/12;ST.clockSet=key}}
 const s=sunNow();if(!s){if(ST.F){ST.F=null;req()}return}
 const moved=!ST.F||Math.abs(ST.F.lon-s.lon)>.005||Math.abs(ST.F.lat-s.lat)>.005;ST.F=s;
 if(moved)req();note()}
function leave(){if(ST.F){ST.F=null;req()}ST.plan=null;ST.key=null;backToFlat()}

{const _g=psGo;psGo=function(i){
 try{if(tourOn()&&!switching()){const S=(psSteps()||[])[Math.max(0,Math.min(psSteps().length-1,i|0))],P=planFor(ps.tour,S),mode=S&&(S.mode||PS_TOURS[ps.tour].map.mode);
  /* switch the flat map to the globe (or back) before the stop flies there */
  if(mode==="satellite"&&satMap()){if(wantGlobe(ps.tour,S,P)){if(isFlat())toGlobe()}else if(ST.flatPrev!=null&&!(S&&(S.pacific||S.autoGlobe)))backToFlat()}
  else if(!wantGlobe(ps.tour,S,P)&&ST.flatPrev!=null&&!(S&&(S.pacific||S.autoGlobe)))backToFlat()}}catch(e){console.error(e)}
 const r=_g.apply(this,arguments);
 try{reconcile()}catch(e){console.error(e)}return r}}
{const _s=psStart;psStart=function(){try{if(!tourOn()&&!switching())ST.wasOn=!!D.on()}catch(e){}return _s.apply(this,arguments)}}
{const _e=psEnd;psEnd=function(){const sw=switching();const r=_e.apply(this,arguments);
 try{if(!sw&&!tourOn()){leave();if(ST.wasOn){ST.wasOn=false;setTimeout(()=>{try{if(!tourOn()&&!D.on())D.set(true)}catch(e){}},60)}}}catch(e){console.error(e)}return r}}
setInterval(()=>{try{if(tourOn()||ST.F||ST.flatPrev!=null)reconcile();if(lit()){
 document.querySelectorAll("[data-dng-sub]").forEach(b=>{const k=b.dataset.dngSub;b.classList.toggle("active",k==="dn"?lit():k==="sat"?!lit():false)})}}catch(e){console.error(e)}},250);
/* the card's sliders and the clock's Sun move the globe at once */
["input","pointermove","click"].forEach(ev=>document.addEventListener(ev,e=>{try{if(ST.plan&&e.target.closest&&e.target.closest(".ps-card"))setTimeout(reconcile,0)}catch(x){}},true));
/* the chips under the globe: "Day" shows this stop in plain daylight, "Day & Night" lights it again */
document.addEventListener("click",e=>{try{const b=e.target.closest&&e.target.closest("[data-dng-sub]");if(!b||!tourOn()||!ST.plan||!ST.plan.sun)return;
 const k=b.dataset.dngSub;if(k==="sat"){ST.userDay=true}else if(k==="dn"){ST.userDay=false}else return;
 setTimeout(()=>{reconcile();req()},0)}catch(x){}},true);

const css=document.createElement("style");css.textContent=`
.ps-card.gf-dngt-clock .psc-sun{ display:none; }
.ps-card .gf-dngt-note{ margin:6px 0 2px; padding:6px 10px; border-radius:10px; font-size:12.5px; line-height:1.4; background:rgba(255,197,51,.13); border-left:3px solid #ffc533; }
body.sky-night .ps-card .gf-dngt-note{ background:rgba(255,197,51,.1); }`;
document.head.appendChild(css);
window.gfDngTour={state:ST,reconcile,plan:PLAN,found:FOUND};
try{if(tourOn())reconcile()}catch(e){}
}
})();
