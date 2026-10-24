/* GeoFlock on phones (screens up to 640 px wide): less stacking, so the map and the content come first.
   - rows of chips (map types, Study/Quiz tabs, regions) stay on one line and scroll sideways, fading at the edge while more is hidden
   - the layer switches (rivers, lakes, labels…) fold behind a "Layers" button; the search box and Flat map / Globe stay out
   - the top bar keeps the logo, stats, account and theme on one line above the section tabs
   - the help button is smaller */
(function(){
const PHONE="(max-width:640px)";
const phone=()=>matchMedia(PHONE).matches;
/* rows that scroll sideways */
const ROWS="#mainContent > nav.tabs, #mainContent nav.tabs.lf-tabs, #regionRow, #allMapsToggleRow, .lf-regions, nav.tabs.app-mode-tabs, #triviaView > nav.tabs";
/* switches that fold away: container, button label */
const FOLD=[[".all-maps-label-controls","Layers"],[".study-toolbar-actions","Layers"],[".lf-toolbar","Show on map"]];
const OPEN=new Set();
function edge(r){const more=r.scrollWidth-r.clientWidth-r.scrollLeft>4,less=r.scrollLeft>4;r.classList.toggle("gf-more",more);r.classList.toggle("gf-less",less)}
function scrollActive(r){const a=r.querySelector(".active,.on,[aria-selected=true]");if(a&&!r._gfScrolled){r._gfScrolled=1;const x=a.offsetLeft-r.offsetLeft-24;if(x>0)r.scrollLeft=x}}
function ensure(){if(!phone())return;
 document.querySelectorAll(ROWS).forEach(r=>{if(!r.offsetParent)return;/* the list of games stays a grid */if(r.classList.contains("game-pick")){r.classList.remove("gf-row","gf-more","gf-less");return}if(!r.classList.contains("gf-row"))r.classList.add("gf-row");if(!r._gfRow){r._gfRow=1;r.addEventListener("scroll",()=>edge(r),{passive:true})}edge(r);scrollActive(r)});
 FOLD.forEach(([sel,label])=>document.querySelectorAll(sel).forEach(c=>{if(!c.offsetParent||c.querySelector(":scope > .gf-fold-btn")||(c.previousElementSibling&&c.previousElementSibling.classList.contains("gf-fold-btn")))return;
  c.classList.add("gf-fold");c.classList.toggle("gf-open",OPEN.has(sel));
  const b=document.createElement("button");b.type="button";b.className="gf-fold-btn"+(OPEN.has(sel)?" on":"");b.innerHTML=label+' <span aria-hidden="true">▾</span>';b.setAttribute("aria-expanded",OPEN.has(sel));
  b.onclick=()=>{const o=!c.classList.contains("gf-open");c.classList.toggle("gf-open",o);b.classList.toggle("on",o);b.setAttribute("aria-expanded",o);if(o)OPEN.add(sel);else OPEN.delete(sel)};
  /* next to the search box when the container has one, else just above the switches */
  const keep=c.querySelector(":scope > .global-search-wrap");if(keep)c.insertBefore(b,keep);else c.parentNode.insertBefore(b,c)}))}
let q=0;const soon=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;try{ensure()}catch(e){console.error(e)}})};
new MutationObserver(soon).observe(document.documentElement,{childList:true,subtree:true});
addEventListener("resize",soon);document.addEventListener("DOMContentLoaded",soon);soon();
const css=document.createElement("style");css.textContent=`
.gf-fold-btn{ display:none; }
@media ${PHONE}{
 /* one-line rows that scroll */
 .gf-row{ flex-wrap:nowrap !important; white-space:nowrap; justify-content:flex-start !important; overflow-x:auto !important; overflow-y:hidden; scrollbar-width:none; -webkit-overflow-scrolling:touch; gap:6px !important; padding:3px 2px 6px !important; margin-left:0 !important; margin-right:0 !important; scroll-padding:0 24px; }
 .gf-row::-webkit-scrollbar{ display:none; }
 .gf-row > *{ flex:none !important; }
 .gf-row.gf-more{ -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 34px),transparent); mask-image:linear-gradient(90deg,#000 calc(100% - 34px),transparent); }
 .gf-row.gf-more.gf-less{ -webkit-mask-image:linear-gradient(90deg,transparent,#000 26px,#000 calc(100% - 34px),transparent); mask-image:linear-gradient(90deg,transparent,#000 26px,#000 calc(100% - 34px),transparent); }
 .gf-row.gf-less:not(.gf-more){ -webkit-mask-image:linear-gradient(90deg,transparent,#000 26px); mask-image:linear-gradient(90deg,transparent,#000 26px); }
 #mainContent > nav.tabs.gf-row, .lf-tabs.gf-row{ margin-bottom:6px !important; }
 /* folded switches */
 .gf-fold-btn{ display:inline-flex; align-items:center; gap:4px; border:1px solid rgba(0,0,0,.14); background:rgba(255,255,255,.85); color:inherit; border-radius:999px; padding:7px 14px; font:700 12px inherit; letter-spacing:.04em; text-transform:uppercase; cursor:pointer; flex:none; }
 .gf-fold-btn span{ transition:transform .2s; } .gf-fold-btn.on span{ transform:rotate(180deg); } .gf-fold-btn.on{ background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.1); }
 .gf-fold:not(.gf-open) > :is(.switch,.lf-control,.lf-tb-actions,.lf-labdd){ display:none !important; }
 .lf-toolbar.gf-fold:not(.gf-open){ display:none !important; }
 .lf-toolbar + * , .gf-fold-btn + .lf-toolbar{ margin-top:6px; }
 .all-maps-label-controls.gf-fold, .study-toolbar-actions.gf-fold{ display:flex !important; flex-wrap:wrap; align-items:center; gap:8px 10px !important; }
 .all-maps-label-controls.gf-fold > .global-search-wrap, .study-toolbar-actions.gf-fold > .global-search-wrap{ flex:1 1 140px; min-width:0; margin:0 !important; }
 .gf-fold.gf-open > .global-search-wrap{ flex-basis:100%; order:9; }
 /* top bar: logo, stats, account and theme on one line; section tabs below */
 .topbar-inner{ display:flex !important; flex-wrap:wrap !important; align-items:center !important; column-gap:6px !important; row-gap:6px !important; }
 .topbar-inner > .topbar-brand{ order:0; flex:none; position:static !important; transform:none !important; margin:0 !important; }
 .topbar-inner > .topbar-brand .gf-word{ font-size:20px; }
 .topbar-inner > #d5Pill{ order:1; flex:none; position:static !important; margin:0 !important; }
 .topbar-inner > #gmBar{ order:2; flex:1 1 0 !important; min-width:0; display:flex !important; flex-wrap:nowrap !important; justify-content:flex-end; overflow-x:auto; scrollbar-width:none; position:static !important; margin:0 !important; gap:4px !important; }
 .topbar-inner > #gmBar::-webkit-scrollbar{ display:none; } .topbar-inner > #gmBar > *{ flex:none !important; }
 .topbar-inner > #acctBtn, .topbar-inner > #themeToggle{ order:3; flex:none; position:static !important; margin:0 !important; }
 .topbar-inner > nav.app-mode-tabs{ order:4; flex:1 1 100% !important; width:100%; position:static !important; margin:0 !important; }
 /* tours: a compact row each (picture, name, one line, Start) instead of a tall card with its stop list */
 .tr-grid{ grid-template-columns:1fr !important; gap:10px !important; }
 .tr-card{ display:grid !important; grid-template-columns:104px 1fr; align-items:stretch; min-height:0 !important; }
 .tr-card > .tr-thumb{ height:auto !important; min-height:104px; aspect-ratio:auto !important; border-radius:inherit; border-top-right-radius:0 !important; border-bottom-right-radius:0 !important; }
 .tr-card > .tr-thumb img{ height:100% !important; width:100%; object-fit:cover; }
 .tr-card > .tr-thumb .tr-badge{ font-size:9.5px; padding:2px 6px; left:6px; bottom:6px; top:auto; max-width:92px; overflow:hidden; text-overflow:ellipsis; }
 .tr-card .tr-body{ padding:10px 12px !important; gap:4px; display:flex; flex-direction:column; }
 .tr-card .tr-body h3{ font-size:15px !important; line-height:1.25; margin:0 !important; }
 .tr-card .tr-hint{ font-size:12.5px !important; line-height:1.35; margin:0 !important; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
 .tr-card .tr-sample{ display:none !important; }
 .tr-card .tr-foot{ margin-top:auto !important; gap:8px; } .tr-card .tr-go{ padding:6px 12px !important; font-size:13px !important; }
 /* maps: the overlays that crowd a small map (tour launcher, "click a country" hint) are left out; the tours are below the map and on the Tours page */
 :is(#allMapsWrap,#atlasStudyMapWrap,.map-wrap) .ps-launcher, #gfLearn{ display:none !important; }
 /* help button: smaller, out of the way */
 #gfHelpBtn{ width:34px !important; height:34px !important; left:8px !important; bottom:10px !important; opacity:.85; font-size:15px; }
}`;
document.head.appendChild(css);
})();
