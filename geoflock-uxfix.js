/* GeoFlock UX fixes: small layout fixes found in a first-time-user review.
   Loaded last, after geoflock-polish-c.js. CSS only plus one tiny layout helper. */
(function(){
const css=document.createElement("style");css.id="gfUxFix";css.textContent=`
@media (max-width:640px){
 /* Phone Maps > Layers: the Labels and Plates groups share the .gf-fold class with the phone "Layers" fold,
    so their own switch was hidden and only a lone "▾" showed. Keep their switch, and hide the
    groups while Layers is folded. */
 .gf-fold[data-g] > label.switch{ display:flex !important; }
 .gf-fold:not(.gf-open):not([data-g]) > .gf-fold[data-g]{ display:none !important; }
}
@media (max-width:640px){
 /* Phone Maps: the toolkit sat beside the map inside a flex row, pushing the map 50px off the left
    edge and the TOOLKIT tab off the right edge (sideways page scroll). Put it under the map instead;
    the helper below makes room for it. */
 body:not(.gf-fs) #amGlobeHost.globe-host > .gfk-tray{ position:absolute !important; left:0 !important; right:0 !important; top:calc(100% + 6px) !important; bottom:auto !important; width:auto !important; margin:0 !important; }
 /* the six round map buttons were taller than the map and spilled onto the key: two columns */
 #allMapsView #amGlobeHost .globe-btns{ flex-direction:row !important; flex-wrap:wrap; width:74px; justify-content:flex-end; }
 /* ...and the GPS read-out moves to the bottom-left corner so it doesn't sit on the spin button */
 #amGlobeHost.globe-host > .gfk-coord{ right:auto !important; left:8px !important; }
}
@media (max-width:420px){
 /* Phone home: the top bar could only show a clipped sliver of the streak, passport and XP pills
    (the rest overflowed to the left, where it cannot be scrolled to). The same numbers sit in the
    "You" strip on the home page, so keep just the level badge here. */
 .topbar-inner > #gmBar > #gmStreakBtn, .topbar-inner > #gmBar > #ppPill, .topbar-inner > #gmBar > #xpNumPill{ display:none !important; }
}
/* Country profile: the close "×" was a 24px, 45%-grey glyph sitting on the edge of the first box, easy to miss.
   Same place, a little bigger, with a light disc behind it. */
html body #flagZoomOverlay #flagZoomClose.flag-zoom-close{ width:32px !important; height:32px !important; min-width:32px !important; min-height:32px !important; top:6px !important; right:6px !important;
 color:rgba(22,50,79,.8) !important; background:rgba(255,255,255,.92) !important; box-shadow:0 1px 4px rgba(0,0,0,.18) !important; font-size:22px !important; }
html body #flagZoomOverlay #flagZoomClose.flag-zoom-close:hover{ color:var(--coral,#e0603f) !important; }
body.dark-theme #flagZoomOverlay #flagZoomClose.flag-zoom-close, body.sky-night #flagZoomOverlay #flagZoomClose.flag-zoom-close{ color:#fff !important; background:rgba(70,86,120,.95) !important; }
/* Starlight: the Country-of-the-day card has a pale mint-to-blue band when the country has no photo;
   on the night theme it glared like an empty box. Use a night-sky version of the same band. */
body.sky-night .h2-cod-ph.none, body.dark-theme .h2-cod-ph.none{ background:linear-gradient(135deg,#1f4a52,#23406e); }
`;document.head.appendChild(css);

/* make room under the phone map for the toolkit, which now hangs below it */
const PH=matchMedia("(max-width:640px)");let ro=null,kit=null;
function room(){try{const h=document.getElementById("amGlobeHost"),k=document.getElementById("gfKit");if(!h)return;
 if(k&&k!==kit){kit=k;if(window.ResizeObserver){if(ro)ro.disconnect();ro=new ResizeObserver(room);ro.observe(k)}}
 const on=PH.matches&&k&&k.parentElement===h&&!document.body.classList.contains("gf-fs")&&k.getClientRects().length>0;
 if(on){const mb=(k.offsetHeight+12)+"px";if(h.style.marginBottom!==mb)h.style.marginBottom=mb;h.dataset.uxMb="1"}
 else if(h.dataset.uxMb){h.style.marginBottom="";delete h.dataset.uxMb}}catch(e){}}
setInterval(room,1200);addEventListener("resize",room);document.addEventListener("click",()=>setTimeout(room,60),true);
})();

/* ================= UX review, round 2 ================= */
(function(){
const css=document.createElement("style");css.id="gfUxFix2";css.textContent=`
/* 1. Phone tours: the card under the map scrolls on its own (a bottom sheet), so the page never has to scroll the map
   away to reach Next. Its Back/Next row stays pinned at the card's foot. */
.ps-card.ux-sheet{ overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; scroll-padding-bottom:64px; }
.ps-card.ux-sheet .ps-nav{ position:sticky; bottom:-12px; margin:0 -16px -12px; padding:8px 16px 12px; z-index:2;
 background:rgba(255,255,255,0.99); box-shadow:0 -10px 12px -8px rgba(255,255,255,0.95); border-radius:0 0 18px 18px; }
body.sky-night .ps-card.ux-sheet .ps-nav, body.dark-theme .ps-card.ux-sheet .ps-nav{ background:rgba(29,37,70,0.99) !important; box-shadow:0 -10px 12px -8px rgba(29,37,70,0.95) !important; }
/* the "?" button would sit on the card's Back button */
body.ux-ps-sheet #gfHelpBtn{ display:none !important; }
/* 3. History map: the story card and the toolkit don't overlap; the toolkit folds to its tab while they would */
.gfk-tray.ux-tuck .gfk-felt{ display:none !important; }
.gfk-tray.ux-tuck .gfk-tab i{ transform:rotate(180deg); }
/* 4a. Tours hub: on wider screens the category chips wrap instead of running off the right edge */
@media (min-width:641px){ .tr-shelf-tabs{ flex-wrap:wrap !important; overflow-x:visible !important; row-gap:6px; } }
/* ...and on phones, where the row scrolls, a fade at the edge says there is more */
@media (max-width:640px){
 .tr-shelf-tabs.ux-more-r{ -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 44px),transparent); mask-image:linear-gradient(90deg,#000 calc(100% - 44px),transparent); }
 .tr-shelf-tabs.ux-more-l{ -webkit-mask-image:linear-gradient(90deg,transparent,#000 44px); mask-image:linear-gradient(90deg,transparent,#000 44px); }
 .tr-shelf-tabs.ux-more-l.ux-more-r{ -webkit-mask-image:linear-gradient(90deg,transparent,#000 44px,#000 calc(100% - 44px),transparent); mask-image:linear-gradient(90deg,transparent,#000 44px,#000 calc(100% - 44px),transparent); }
 /* 4b. the "?" help button: a small tab tucked against the left edge instead of a disc over the content */
 html body #gfHelpBtn.gf-help-btn{ left:0 !important; bottom:14px !important; width:24px !important; height:36px !important; min-width:0 !important;
  border-radius:0 18px 18px 0 !important; font-size:14px !important; padding:0 4px 0 0 !important; opacity:.8; box-shadow:0 2px 8px rgba(15,50,60,.25) !important; }
 html body #gfHelpBtn.gf-help-btn:hover{ transform:none; }
}
`;document.head.appendChild(css);

const PHONE=()=>innerWidth<=640;
const touch=()=>{try{return matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0}catch(e){return false}};
const has=n=>typeof window[n]==="function";
const tourOn=()=>{try{return typeof ps!=="undefined"&&!!ps&&!!ps.card}catch(e){return false}};

/* the bottom of whatever is pinned to the top of the window (the sticky top bar) */
function hdrBottom(){let b=0;try{[16,innerWidth/2,innerWidth-16].forEach(x=>{let el=document.elementFromPoint(x,2);while(el&&el!==document.body&&el!==document.documentElement){const p=getComputedStyle(el).position;if(p==="fixed"||p==="sticky"){const r=el.getBoundingClientRect();if(r.top<=2&&r.bottom<innerHeight/2)b=Math.max(b,r.bottom);break}el=el.parentElement}})}catch(e){}return b}

/* ---------- 1. phone tours: keep the map on screen, card scrolls by itself ---------- */
function sheetFit(scroll){try{
 const on=tourOn()&&!ps.card.classList.contains("ps-over")&&innerWidth<=760&&document.body.contains(ps.card);
 const host=on&&typeof psHostEl==="function"?psHostEl():null;
 if(!on||!host){if(tourOn()){ps.card.classList.remove("ux-sheet");ps.card.style.maxHeight=""}document.body.classList.remove("ux-ps-sheet");return}
 const top=hdrBottom()+6;
 if(scroll){const hr=host.getBoundingClientRect();const want=Math.max(0,Math.round(scrollY+hr.top-top));if(Math.abs(scrollY-want)>2)window.scrollTo({top:want,behavior:"auto"})}
 const hr=host.getBoundingClientRect(),cr=ps.card.getBoundingClientRect();
 /* size from where the card sits once the map is at the top, not from wherever the page happens to be scrolled */
 const off=hr.top-top,cardTop=cr.top-off,avail=Math.floor(innerHeight-cardTop-8);
 if(avail<220){ps.card.classList.remove("ux-sheet");ps.card.style.maxHeight="";document.body.classList.remove("ux-ps-sheet");return}
 ps.card.classList.add("ux-sheet");document.body.classList.add("ux-ps-sheet");const mh=avail+"px";if(ps.card.style.maxHeight!==mh)ps.card.style.maxHeight=mh;
 if(scroll)ps.card.scrollTop=0}catch(e){console.error(e)}}
if(has("psGo")){const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);sheetFit(true);setTimeout(()=>sheetFit(false),60);return r}}
if(has("psStart")){const _s=psStart;psStart=function(){const r=_s.apply(this,arguments);
 /* psStart smooth-scrolls the map to the top on phones; size the card for that spot, then make sure it got there */
 sheetFit(false);setTimeout(()=>sheetFit(true),700);return r}}
if(has("psEnd")){const _e=psEnd;psEnd=function(){const c=tourOn()?ps.card:null;const r=_e.apply(this,arguments);try{if(c){c.classList.remove("ux-sheet");c.style.maxHeight=""}if(!tourOn())document.body.classList.remove("ux-ps-sheet")}catch(e){}return r}}
addEventListener("resize",()=>setTimeout(()=>sheetFit(false),80));setInterval(()=>{if(tourOn()||document.body.classList.contains("ux-ps-sheet"))sheetFit(false)},900);

/* the tour intro says "use the arrow keys"; on a touch screen say what works there */
if(has("psCardHTML")){const _h=psCardHTML;psCardHTML=function(){let s=_h.apply(this,arguments);try{if(touch()&&typeof s==="string")s=s.replace(/\b([Uu])se the arrow keys to move between stops/g,(m,u)=>(u==="U"?"S":"s")+"wipe the card or tap Next to move between stops")}catch(e){}return s}}
/* ...and make the swipe work: a sideways flick on the card goes to the next / previous stop */
{let t0=null;
 document.addEventListener("touchstart",e=>{t0=null;try{if(!tourOn()||e.touches.length!==1)return;const t=e.target;if(!t.closest||!t.closest(".ps-card")||t.closest("input,select,textarea,canvas,svg,button,a,summary,.ps-sea,.psc,.ps-pp,[draggable=true]"))return;
  const p=e.touches[0];t0={x:p.clientX,y:p.clientY,at:Date.now()}}catch(err){}},{passive:true,capture:true});
 document.addEventListener("touchend",e=>{try{if(!t0||!tourOn())return;const p=e.changedTouches[0],dx=p.clientX-t0.x,dy=p.clientY-t0.y,dt=Date.now()-t0.at;t0=null;
  if(dt>800||Math.abs(dx)<60||Math.abs(dx)<1.6*Math.abs(dy))return;const n=psSteps().length,i=ps.i+(dx<0?1:-1);if(i<0||i>=n)return;psGo(i)}catch(err){}},{passive:true,capture:true});}

/* ---------- 2. the floating copy of the map key: only when the key under the map is really out of view ---------- */
function keyRowOnScreen(lg){if(!lg||!lg.getClientRects().length)return false;
 const cand=lg.querySelector(".legend-swatch, .legend-gradient:not(.gf-lg-mark), .legend-gradient-bar, .legend-bar, [data-clim], [data-th], canvas, .legend-scale, .legend-ramp, .legend-item");
 let r=cand&&cand.getClientRects().length?cand.getBoundingClientRect():null;
 if(!r||!r.height){const l=lg.getBoundingClientRect();r={top:l.top,bottom:Math.min(l.bottom,l.top+40)}}
 const top=hdrBottom();return r.top>=top-4&&r.bottom<=innerHeight+4}
if(has("flkSync")){const _f=flkSync;flkSync=function(){const r=_f.apply(this,arguments);try{const el=document.getElementById("flKey"),lg=document.getElementById("populationLegend");
 if(el&&el.style.display!=="none"&&keyRowOnScreen(lg)&&!(typeof ps!=="undefined"&&ps))el.style.display="none"}catch(e){}return r}}

/* ---------- 3. History map: story card vs. toolkit ---------- */
{let rel=null,userOpen=false;
 const vis=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=="hidden";
 const hit=(a,b)=>a.left<b.right-2&&a.right>b.left+2&&a.top<b.bottom-2&&a.bottom>b.top+2;
 function tuck(){try{const tray=document.querySelector("#amGlobeHost > .gfk-tray"),host=document.getElementById("amGlobeHost");if(!tray||!host)return;
  const st=document.querySelector("#allMapsView .hist-story, .hist-story.hs-fixed");
  const on=!PHONE()&&typeof appMode!=="undefined"&&appMode==="allmaps"&&vis(st)&&!tray.classList.contains("closed");
  if(!vis(st))userOpen=false;
  if(!on||userOpen){if(tray.classList.contains("ux-tuck"))tray.classList.remove("ux-tuck");if(!on)rel=null;return}
  const hr=host.getBoundingClientRect();
  if(!tray.classList.contains("ux-tuck")){const t=(tray.querySelector(".gfk-felt")||tray).getBoundingClientRect();rel={l:t.left-hr.left,t:t.top-hr.top,r:t.right-hr.left,b:t.bottom-hr.top}}
  if(!rel)return;const kit={left:hr.left+rel.l,top:hr.top+rel.t,right:hr.left+rel.r,bottom:hr.top+rel.b};
  tray.classList.toggle("ux-tuck",hit(st.getBoundingClientRect(),kit))}catch(e){}}
 /* opening the toolkit by hand while it's tucked away: the user wins until the card closes */
 document.addEventListener("click",e=>{const tab=e.target.closest&&e.target.closest(".gfk-tab");const tray=tab&&tab.closest(".gfk-tray");if(!tray||!tray.classList.contains("ux-tuck"))return;
  e.preventDefault();e.stopPropagation();tray.classList.remove("ux-tuck");userOpen=true},true);
 setInterval(tuck,350);addEventListener("resize",tuck);document.addEventListener("pointerup",()=>setTimeout(tuck,30),true);}

/* ---------- 4. small items ---------- */
/* Maps search: the long placeholder was cut off in the narrow desktop box */
function searchPh(){try{document.querySelectorAll("#globalSearchInput").forEach(i=>{if(!i.dataset.uxPh&&i.placeholder&&!/^Search places/.test(i.placeholder))i.dataset.uxPh=i.placeholder;const full=i.dataset.uxPh;if(!full)return;
 const short=i.clientWidth>0&&i.clientWidth<250;const want=short?"Search places…":full;if(i.placeholder!==want)i.placeholder=want;if(short&&!i.title)i.title=full})}catch(e){}}
setInterval(searchPh,1000);addEventListener("resize",searchPh);
/* Tours hub chips (phones): fade the edge that has more chips behind it */
function chipFade(){try{document.querySelectorAll(".tr-shelf-tabs").forEach(n=>{if(!n._uxF){n._uxF=1;n.addEventListener("scroll",chipFade,{passive:true})}
 const more=n.scrollWidth>n.clientWidth+4;n.classList.toggle("ux-more-r",more&&n.scrollLeft+n.clientWidth<n.scrollWidth-4);n.classList.toggle("ux-more-l",more&&n.scrollLeft>4)})}catch(e){}}
setInterval(chipFade,800);addEventListener("resize",chipFade);
/* closing a tour started from the Tours hub goes back to the hub (where it was), not to Maps */
{let hub=null,closeAt=0;
 if(has("psLaunchTour")){const _l=psLaunchTour;psLaunchTour=function(){try{if(typeof appMode!=="undefined"&&appMode==="tours")hub={y:scrollY};else if(!tourOn())hub=null}catch(e){}return _l.apply(this,arguments)}}
 document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".ps-card [data-ps-end]"))closeAt=Date.now()},true);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&tourOn())closeAt=Date.now()},true);
 if(has("psEnd")){const _e=psEnd;psEnd=function(silent){let back=null;try{
  const sw=typeof psSwitching!=="undefined"&&psSwitching,T=tourOn()&&PS_TOURS[ps.tour];let course=false;try{course=!!(T&&T.group==="aphg"&&typeof hugFromCourse!=="undefined"&&hugFromCourse)}catch(er){}
  if(hub&&!silent&&!sw&&!course&&Date.now()-closeAt<2000&&appMode==="allmaps")back=hub}catch(e){}
  const r=_e.apply(this,arguments);
  if(back){hub=null;setTimeout(()=>{try{if(tourOn()||appMode!=="allmaps")return;switchAppMode("tours");setTimeout(()=>{try{window.scrollTo({top:back.y,behavior:"auto"})}catch(e){}},350)}catch(e){console.error(e)}},60)}
  else if(!silent&&!tourOn())hub=null;
  return r}}}
})();
