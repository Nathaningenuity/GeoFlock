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
