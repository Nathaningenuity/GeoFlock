/* GeoFlock: tours on the Satellite map, the map key during tours, and the day-and-night controls of a stop.
   1. No dimming on the Satellite map. A tour stop shades everything outside what it lights (psDimFill: the flat map's
      .ps-dim rect, the globe's psGlobeDraw fill and the half-strength "soft" areas). The Satellite map, the flat one and
      the globe, plain or lit by the Sun (Day & Night), is dark already: there the shade is transparent. The white
      outlines, casing and glow stay. Other maps are not changed.
   2. The map key stays open during a tour. The floating map key (#flKey, flkSync) hid itself during tours, and folded if
      the user had folded it; the key under the map is far below the tour's map. While a tour runs the floating key shows,
      open, with the key of the map the stop is on, and follows every stop and map switch. The user's fold setting is not
      touched, so after the tour the key is as they left it. It keeps clear of the stop card and the stop's own key.
      On a stop shown on the globe lit by the Sun it is the Day & Night key: day side, night side, the Sun's yellow dot,
      and a line on what to drag to move the Sun (the card's Time of day / Date sliders, or the world clock's little Sun).
   3. A diagram with its own date stays in step with the card's Date slider (gfSun) and so with the globe's Sun: the
      seasons diagram ("Daylight and the seasons") both ways. (The world clock stops already move the globe's Sun with
      the clock: geoflock-dngtour.js.)
   4. The card's Time of day / Date sliders (.psc-sun) sit right under the orange headline (.ps-stat), before the text,
      even when a diagram is at the top of the card.
   Load after geoflock-dngtour.js (it patches after window load + 1.5 s, after that file). */
(function(){
let booted=false;
function boot(){if(booted)return;booted=true;
 try{run()}catch(e){console.error("tourlegend",e)}}
if(document.readyState==="complete")setTimeout(boot,1600);else addEventListener("load",()=>setTimeout(boot,1600));
window.gfTourLegendBoot=boot;

function run(){
const tourOn=()=>{try{return typeof ps!=="undefined"&&!!ps}catch(e){return false}};
const satMap=()=>{try{return appMode==="allmaps"&&allMapsColorModeOn&&allMapsColorMode==="satellite"}catch(e){return false}};
const curStop=()=>{try{return tourOn()?psSteps()[ps.i]:null}catch(e){return null}};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const vis=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=="hidden"&&getComputedStyle(e).display!=="none";
const dng=()=>window.gfDngTour&&gfDngTour.state;
/* the stop is shown on the globe lit by the Sun (geoflock-dngtour.js) */
const litNow=()=>{const s=dng();return!!(tourOn()&&s&&s.F&&!s.userDay&&s.plan&&s.plan.sun)};

/* ------------------------------------------------------------------ 1. no dimming on the Satellite map */
if(typeof psDimFill==="function"){const _d=psDimFill;psDimFill=function(){try{if(tourOn()&&satMap())return"rgba(0,0,0,0)"}catch(e){}return _d.apply(this,arguments)};psDimFill._gfTl=1}

/* ------------------------------------------------------------------ 2. the map key during a tour */
const KEYSEL=".legend-swatch, .legend-gradient, .legend-bar, [data-clim], [data-th], canvas, .legend-scale, .legend-ramp, .legend-item";
let mine=false,lastK="";
function dragLine(){const s=dng(),P=s&&s.plan;const card=tourOn()&&ps.card;
 if(P&&P.sun==="clock")return"Drag the little Sun on the world clock in the card to move the Sun.";
 if(P&&P.sun==="live")return"The Sun stands where it is right now.";
 const sun=card&&card.querySelector(".psc-sun"),date=sun&&sun.querySelector('.psc-r[data-k="day"]');
 const dg=card&&card.querySelector(".ps-dg .dg-handle");
 return"Drag the <b>Time of day</b>"+(date?" and <b>Date</b>":"")+" sliders in the card"+(dg?" (or the diagram’s date)":"")+" to move the Sun."}
/* the key under the map, when its key row is on screen anyway, needs no floating copy */
function rowOnScreen(lg){if(!lg||!lg.getClientRects().length)return false;const cand=lg.querySelector(KEYSEL);if(!cand||!cand.getClientRects().length)return false;
 const r=cand.getBoundingClientRect(),l=lg.getBoundingClientRect();if(!r.height)return false;const top=Math.min(r.top,l.top),bot=Math.max(r.bottom,Math.min(l.bottom,r.bottom+60));
 if(top<56||bot>innerHeight-4)return false;
 /* and nothing (the card, the toolkit) lies over it: the left end, the middle and the right end of its first row */
 const y=r.top+Math.min(6,r.height/2);return[l.left+12,(l.left+l.right)/2,l.right-12].every(x=>{const at=document.elementFromPoint(Math.min(innerWidth-2,Math.max(2,x)),y);return!!(at&&(lg.contains(at)||at===lg))})}
function keyHTML(lg,lit){let body="";
 if(lit){body='<div class="gf-tl-dn"><span class="gf-tl-sw"><i class="gf-tl-day"></i>Sunlit half: daytime</span><span class="gf-tl-sw"><i class="gf-tl-night"></i>Night side, with city lights</span><span class="gf-tl-sw"><i class="gf-tl-sun"></i>The Sun is overhead here</span></div>'+
  '<p class="gf-tl-drag"><span aria-hidden="true">☀</span> '+dragLine()+"</p>"}
 else{const c=lg.cloneNode(true);c.removeAttribute("id");
  const note=(c.querySelector(".legend-note")||{}).textContent||"";
  c.querySelectorAll("label, .leg-opts, .ps-legend-btn, .legend-note, .legend-multi, button, input, .relief-under, [data-relief], .faint-sw, .pop-games, #gfShadeRow").forEach(x=>x.remove());
  const t=c.querySelector(".legend-title");if(t)t.remove();
  if(c.querySelector(KEYSEL))body='<div class="flk-body '+esc(lg.className)+'">'+c.innerHTML+"</div>";
  else if(note){const first=(note.match(/^[^.]*\./)||[note])[0].trim();body='<p class="gf-tl-txt">'+esc(first)+"</p>"}}
 return body}
function tourKey(){const el=typeof flkEl==="function"?flkEl():document.getElementById("flKey"),lg=document.getElementById("populationLegend");if(!el)return;
 const pj=typeof proj!=="undefined"&&proj.on,lit=litNow(),phone=innerWidth<=760;
 const items=lg&&lg.querySelector(KEYSEL);
 let want=appMode==="allmaps"&&!pj&&!!lg&&(lit||!!items||(satMap()&&!!lg.querySelector(".legend-title")));
 try{if(allMapsColorMode==="history")want=false}catch(e){}
 const title=want?(lit?"Day & Night":((lg.querySelector(".legend-title")||{}).textContent||"Map key")):"";
 const k=want?[title,lit,lit&&dng().plan.sun,allMapsColorMode,lg.innerHTML.length,(typeof thFocus!=="undefined"&&thFocus)||"",ps.tour,ps.i,!!(ps.card&&ps.card.querySelector(".psc-sun .psc-r")),!!(ps.card&&ps.card.querySelector(".ps-dg .dg-handle"))].join("|"):"";
 /* on a phone the card is a sheet over most of the screen: the key goes into the card, at its end */
 const card=ps.card;let ic=card&&card.querySelector(".gf-tl-incard");
 if(!want||!phone){if(ic)ic.remove();ic=null}
 else{if(!ic){ic=document.createElement("div");ic.className="gf-tl-incard";ic.setAttribute("aria-label","Map key");const dots=card.querySelector(".ps-dots,.ps-nav");if(dots&&dots.parentNode)dots.parentNode.insertBefore(ic,dots);else card.appendChild(ic)}
  if(ic._k!==k){ic._k=k;ic.innerHTML='<div class="gf-tl-h"><b>'+esc(title)+'</b><small class="gf-tl-tag">Map key</small></div>'+keyHTML(lg,lit)}}
 if(!want||phone||(!lit&&rowOnScreen(lg))){el.style.display="none";el.classList.remove("gf-tl-on");return}
 el.style.display="";el.classList.add("open","gf-tl-on");
 if(el._k===k&&el.querySelector(".flk-h"))return;el._k=k;
 el.innerHTML='<div class="flk-h"><b>'+esc(title)+'</b><small class="gf-tl-tag">Map key</small></div>'+keyHTML(lg,lit)}
const POS=["left","top","right","bottom"];
function clearPos(el){if(el._gftlPos&&POS.every(k=>el.style.getPropertyValue(k)===el._gftlPos[k]))POS.forEach(k=>el.style.removeProperty(k));el._gftlPos=null}
function leaveKey(){document.querySelectorAll(".gf-tl-incard").forEach(x=>x.remove());const el=document.getElementById("flKey");if(!el)return;el.classList.remove("gf-tl-on");el._k=null;el.innerHTML="";clearPos(el)}
/* where the key stands: the first corner that is clear of the card, the stop's own key and banner, the round map buttons,
   the toolkit and "Point at the map"; it is placed here (inline), so the general key placement (geoflock-fsfix.js) stands
   aside during the tour. If the user drags it (geoflock-toolkit.js), it stays where they put it. */
function place(){const el=document.getElementById("flKey");if(!el||!el.classList.contains("gf-tl-on")||el.style.display==="none")return;
 if(el._gftlPos&&!POS.every(k=>el.style.getPropertyValue(k)===el._gftlPos[k]))return;/* moved by the user */
 if(!el._gftlPos&&(el.style.getPropertyValue("left")||el.style.getPropertyValue("top")))return;
 el.classList.remove("gfx-fit","gfx-w","gfx-r");
 const W=innerWidth,H=innerHeight,w=el.offsetWidth||250,h=Math.min(el.offsetHeight||200,H-80),m=16;
 const hit=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 const obs=[ps&&ps.card,...document.querySelectorAll(".ps-mapkey, .ps-mapbanner, #allMapsView .gfk-tray, #allMapsView .gfk-coord, #allMapsView .globe-btns, #allMapsView .map-zoom-controls, #gfDngPanel.gf-dng-float, #allMapsSubModes, #amGlobeSubs")].filter(vis).map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<H);
 let top0=70;try{const row=document.querySelector("#allMapsView .all-maps-controls")||document.getElementById("allMapsToggleRow");if(row&&vis(row)){const b=row.getBoundingClientRect().bottom;if(b>0&&b<H*.45)top0=b+8}}catch(e){}
 const C=[[W-m-w,H-m-h],[m,H-72-h],[W-m-w,top0],[m,top0]].map(([x,y])=>({left:x,top:Math.max(8,y),right:x+w,bottom:Math.max(8,y)+h}));
 let best=C[0],bs=1e12;for(const c of C){const s=obs.reduce((a,o)=>a+hit(o,c),0);if(s<bs-1){bs=s;best=c}if(!s)break}
 const want={left:Math.round(best.left)+"px",top:Math.round(best.top)+"px",right:"auto",bottom:"auto"};
 if(el._gftlPos&&POS.every(k=>el._gftlPos[k]===want[k]))return;
 POS.forEach(k=>el.style.setProperty(k,want[k],"important"));el._gftlPos=want}
if(typeof flkSync==="function"){const _f=flkSync;flkSync=function(){
 if(tourOn()){let hist=false;try{hist=allMapsColorMode==="history"}catch(e){}
  if(!hist){try{mine=true;tourKey();place()}catch(e){console.error("tourlegend key",e)}return}}
 if(mine){mine=false;leaveKey();const r=_f.call(this,true);return r}
 return _f.apply(this,arguments)}}

/* ------------------------------------------------------------------ 3. the diagram's date and the card's Date slider */
const SYNC={};
function cardSun(){const c=tourOn()&&ps.card;return c&&c.querySelector(".psc-sun")}
function setCardDay(d){const S=curStop();if(!S||!S.gfSun||S.gfSun.date===false)return;const sun=cardSun();if(!sun)return;
 const r=sun.querySelector('.psc-r[data-k="day"]');if(!r)return;d=Math.max(1,Math.min(365,Math.round(d)));
 if(+pscGet("day",S.gfSun.day==null?80:S.gfSun.day)===d&&+r.value===d)return;
 r.value=d;try{pscApply("day",d,true)}catch(e){try{pscSet("day",d);pscRefreshCard();pscRedraw()}catch(x){}}
 try{gfDngTour.reconcile()}catch(e){}try{flkSync(true)}catch(e){}}
function cardDay(){const S=curStop();if(!S||!S.gfSun)return null;try{return pscSun(S).d}catch(e){return null}}
/* the seasons diagram keeps its date in DG.seasons._d and redraws with DG.seasons._set(svg) */
if(typeof DG!=="undefined"&&DG.seasons&&typeof DG.seasons.drag==="function"){const D=DG.seasons,_dr=D.drag;
 D.drag=function(svg,n){const r=_dr.apply(this,arguments);try{if(n==="d"&&svg&&svg.closest&&svg.closest(".ps-card"))setCardDay(D._d)}catch(e){}return r};
 SYNC.seasons=function(svg,d){if(d==null||D._d===d)return;D._d=d;try{D._set(svg)}catch(e){}}}
function cardDiagrams(){const c=tourOn()&&ps.card;if(!c)return[];return[...c.querySelectorAll(".ps-dg svg")].map(svg=>{let k=null;try{k=dgKeyOf(svg)}catch(e){}
 if(!k){const f=svg.closest("[data-dg]");k=f&&String(f.getAttribute("data-dg")).split(":")[0]}return[k,svg]}).filter(x=>x[0]&&SYNC[x[0]])}
function toDiagrams(){const d=cardDay();if(d==null)return;cardDiagrams().forEach(([k,svg])=>SYNC[k](svg,d))}
/* the card's slider (and its Reset) moves the diagram */
document.addEventListener("input",e=>{try{if(e.target.closest&&e.target.closest('.ps-card .psc-sun .psc-r[data-k="day"]'))setTimeout(toDiagrams,0)}catch(x){}},true);
document.addEventListener("change",e=>{try{if(e.target.closest&&e.target.closest('.ps-card .psc-sun .psc-r'))setTimeout(toDiagrams,0)}catch(x){}},true);
document.addEventListener("click",e=>{try{if(e.target.closest&&e.target.closest(".ps-card .psc-sun .psc-reset"))setTimeout(toDiagrams,0)}catch(x){}},true);

/* ------------------------------------------------------------------ 4. the sliders up, under the headline */
function moveSun(){const c=tourOn()&&ps.card;if(!c)return;const sun=c.querySelector(".psc-sun"),st=c.querySelector(".ps-stat");if(!sun||!st||sun.contains(st))return;
 let at=st;while(at.nextElementSibling&&at.nextElementSibling!==sun&&at.nextElementSibling.matches(".ps-lgd"))at=at.nextElementSibling;
 if(at.nextElementSibling!==sun)at.after(sun);
 const n=c.querySelector(":scope .gf-dngt-note");if(n&&!c.classList.contains("gf-dngt-clock")&&sun.nextElementSibling!==n&&n.parentNode===sun.parentNode)sun.after(n)}

/* ------------------------------------------------------------------ following the tour */
let lastStop="";
function tick(){if(!tourOn()){if(mine){try{flkSync(true)}catch(e){}}lastStop="";return}
 try{moveSun()}catch(e){}
 const key=ps.tour+"|"+ps.i+"|"+!!ps.card;if(key!==lastStop){lastStop=key;try{toDiagrams()}catch(e){}}
 try{flkSync()}catch(e){}}
{const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);[0,80,400,1200].forEach(t=>setTimeout(()=>{try{lastStop="";tick()}catch(e){}},t));return r}}
{const _e=psEnd;psEnd=function(){const r=_e.apply(this,arguments);setTimeout(()=>{try{if(!tourOn()&&mine){flkSync(true)}}catch(e){}},0);return r}}
setInterval(tick,400);
/* a new stop's globe redraw: the shade there is drawn on the canvas each frame, so nothing to undo here */

const css=document.createElement("style");css.textContent=`
#flKey.gf-tl-on{ width:250px; max-height:min(46vh,380px); z-index:792; }
#flKey.gf-tl-on .flk-h{ display:flex; align-items:baseline; gap:8px; }
#flKey.gf-tl-on .gf-tl-tag{ margin-left:auto; font-size:10.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; opacity:.55; }
#flKey.gf-tl-on .flk-body{ overflow:auto; }
#flKey .gf-tl-txt, .gf-tl-incard .gf-tl-txt{ margin:4px 0 0; font-size:12px; line-height:1.4; opacity:.85; }
.gf-tl-incard{ margin:10px 0 4px; padding:8px 10px; border-radius:12px; border:1px solid rgba(127,140,180,.28); background:rgba(127,140,180,.07); font-size:12px; }
.gf-tl-incard .gf-tl-h{ display:flex; align-items:baseline; gap:8px; margin-bottom:2px; }
.gf-tl-incard .gf-tl-tag{ margin-left:auto; font-size:10px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; opacity:.55; }
.gf-tl-incard .flk-body .legend-swatches, .gf-tl-incard .flk-body .legend-group{ display:flex; flex-wrap:wrap; align-items:center; gap:2px 10px; }
.gf-tl-incard .flk-body .legend-group > b{ flex-basis:100%; }
.gf-tl-incard .flk-body .legend-scale{ display:block; margin:2px 0 6px; }
.gf-tl-incard .flk-body .legend-swatch{ display:inline-flex; align-items:center; gap:5px; font-size:11.5px; }
.gf-tl-incard .flk-body .legend-swatch i{ display:inline-block; width:11px; height:11px; border-radius:3px; }
#flKey .gf-tl-dn, .gf-tl-incard .gf-tl-dn{ display:flex; flex-direction:column; gap:3px; margin-top:4px; }
#flKey .gf-tl-sw, .gf-tl-incard .gf-tl-sw{ display:flex; align-items:center; gap:7px; font-size:12px; line-height:1.25; padding:2px 4px; }
#flKey .gf-tl-sw i, .gf-tl-incard .gf-tl-sw i{ flex:none; width:13px; height:13px; border-radius:3px; border:1px solid rgba(0,0,0,.12); }
#flKey .gf-tl-day, .gf-tl-incard .gf-tl-day{ background:linear-gradient(135deg,#4f86c6,#7fae5a); }
#flKey .gf-tl-night, .gf-tl-incard .gf-tl-night{ background:radial-gradient(circle at 35% 40%,#ffd36b 0 1.5px,transparent 2px),radial-gradient(circle at 70% 65%,#ffd36b 0 1.2px,transparent 1.8px),#0b1530; }
#flKey .gf-tl-sun, .gf-tl-incard .gf-tl-sun{ border-radius:50% !important; background:#ffd34d; border:2px solid #fff !important; box-shadow:0 0 0 1px rgba(0,0,0,.2),0 0 6px rgba(255,210,90,.9); }
#flKey .gf-tl-drag, .gf-tl-incard .gf-tl-drag{ margin:7px 0 0; padding:6px 8px; border-radius:10px; font-size:12px; line-height:1.4; background:rgba(255,197,51,.16); border-left:3px solid #ffc533; }
#flKey .gf-tl-drag b, .gf-tl-incard .gf-tl-drag b{ font-weight:800; }`;
document.head.appendChild(css);
window.gfTourLegend={tick,place,moveSun,toDiagrams,setCardDay};
try{if(tourOn())tick()}catch(e){}
}
})();
