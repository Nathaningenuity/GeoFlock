/* GeoFlock: shrink the country profile into a small card that can be dragged around.
   - A "−" button at the top-left of the profile (opposite the ×) shrinks it.
   - The small card has a header bar (flag, name, expand, close). Drag the bar to move the card.
   - The map behind stays usable. Clicking another country swaps the card to that country, still small, in the same place.
   - Expand (or a double-click on the bar) brings back the full profile. × closes it, and the next profile opens full size. */
(function(){
"use strict";
if(window.gfPfMini||typeof openFlagZoom!=="function")return;
const S={min:false,x:null,y:null,goto:null};
window.gfPfMini=S;
const W=()=>innerWidth<600?innerWidth-16:340;
const ov=()=>document.getElementById("flagZoomOverlay");
const panelOf=o=>o&&o.querySelector(".flag-zoom-panel");
const MIN_SVG='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg>';
const EXP_SVG='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';

const css=document.createElement("style");
css.textContent=`
html body #flagZoomOverlay .pfm-min{ position:absolute; top:6px; left:6px; margin:0; z-index:5; flex:none;
 width:32px !important; height:32px !important; min-width:32px !important; min-height:32px !important; box-sizing:border-box; border-radius:50%; border:1px solid rgba(16,28,48,.12); background:rgba(255,255,255,.95);
 color:#2c3e57; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; box-shadow:0 2px 6px rgba(16,28,48,.12); }
#flagZoomOverlay .pfm-min:hover{ color:var(--teal,#1f8f86); }
#flagZoomOverlay .pfm-bar{ display:none; }
body.dark-theme #flagZoomOverlay .pfm-min, body.sky-night #flagZoomOverlay .pfm-min{ color:#fff; background:rgba(70,86,120,.95); }

/* small card */
#flagZoomOverlay.pf-min{ z-index:960 !important; background:transparent !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important;
 pointer-events:none !important; animation:none !important; }
#flagZoomOverlay.pf-min .flag-zoom-panel{ pointer-events:auto; position:fixed !important; margin:0 !important; transform:none !important;
 width:var(--pfm-w,340px) !important; max-width:none !important;  overflow-y:auto !important;
 padding:0 12px 12px !important; border-radius:16px !important; animation:none !important;
 box-shadow:0 12px 32px rgba(16,28,48,.28), 0 0 0 1px rgba(16,28,48,.08) !important; }
#flagZoomOverlay.pf-min .flag-zoom-panel > .flag-zoom-close, #flagZoomOverlay.pf-min .pfm-min,
#flagZoomOverlay.pf-min .zoom-media, #flagZoomOverlay.pf-min .zoom-dots, #flagZoomOverlay.pf-min .zoom-practise,
#flagZoomOverlay.pf-min .flag-zoom-name, #flagZoomOverlay.pf-min .pf-stamps-top, #flagZoomOverlay.pf-min .zoom-extras,
#flagZoomOverlay.pf-min .cod-note{ display:none !important; }
#flagZoomOverlay.pf-min .pfm-bar{ display:flex; align-items:center; gap:8px; position:sticky; top:0; z-index:6;
 align-self:stretch; box-sizing:border-box; width:auto; margin:0 -12px 8px; padding:8px 8px 8px 12px; background:inherit; background-color:var(--pfm-bg,#fff);
 border-bottom:1px solid rgba(16,28,48,.08); cursor:grab; touch-action:none; user-select:none; -webkit-user-select:none; }
#flagZoomOverlay.pf-min .pfm-bar.drag{ cursor:grabbing; }
#flagZoomOverlay .pfm-grip{ color:rgba(16,28,48,.35); font-size:13px; letter-spacing:-2px; line-height:1; }
#flagZoomOverlay .pfm-flag{ width:34px; height:23px; object-fit:cover; border-radius:3px; box-shadow:0 0 0 1px rgba(16,28,48,.15); flex:none; }
#flagZoomOverlay .pfm-name{ flex:1; min-width:0; font-weight:800; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
html body #flagZoomOverlay .pfm-b{ width:30px !important; height:30px !important; min-width:30px !important; min-height:30px !important; flex:none; box-sizing:border-box; border-radius:50%; border:1px solid rgba(16,28,48,.12); background:rgba(255,255,255,.95);
 color:#2c3e57; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; font-size:20px; line-height:1; }
#flagZoomOverlay .pfm-b:hover{ color:var(--teal,#1f8f86); }
#flagZoomOverlay .pfm-b.x:hover{ color:var(--coral,#e0603f); }
#flagZoomOverlay.pf-min .flag-zoom-official{ margin-top:0 !important; font-size:10px !important; }
#flagZoomOverlay.pf-min .pf-dyk{ padding:8px 10px !important; }
#flagZoomOverlay.pf-min .profile-block{ margin-top:8px !important; grid-template-columns:1fr 1fr !important; }
body.dark-theme #flagZoomOverlay .pfm-b, body.sky-night #flagZoomOverlay .pfm-b{ color:#fff; background:rgba(70,86,120,.95); }
body.dark-theme #flagZoomOverlay .pfm-grip, body.sky-night #flagZoomOverlay .pfm-grip{ color:rgba(255,255,255,.4); }
`;
document.head.appendChild(css);

function clamp(p){const r=p.getBoundingClientRect(),w=r.width||W(),h=Math.min(r.height||300,innerHeight-16);
 S.x=Math.max(8,Math.min(innerWidth-w-8,S.x));S.y=Math.max(8,Math.min(innerHeight-Math.min(h,60)-8,S.y));
 p.style.left=S.x+"px";p.style.top=S.y+"px"}
function place(p){p.style.setProperty("--pfm-w",W()+"px");
 if(S.x==null){S.x=innerWidth<600?8:16;S.y=innerWidth<600?Math.max(70,Math.round(innerHeight*.58)-12):Math.min(290,Math.max(80,innerHeight-460))}
 clamp(p);p.style.maxHeight=Math.max(160,Math.min(innerHeight*(innerWidth<600?.42:.62),520,innerHeight-S.y-12))+"px"}

function shrink(){const o=ov(),p=panelOf(o);if(!o||!p)return;S.min=true;o.classList.add("pf-min");
 const bg=getComputedStyle(p).backgroundColor;if(bg&&!/rgba\(0, 0, 0, 0\)|transparent/.test(bg))p.style.setProperty("--pfm-bg",bg);
 place(p);p.scrollTop=0;
 try{if(flagZoomGoToPage){S.goto=flagZoomGoToPage;flagZoomGoToPage=null}}catch(e){}}
function expand(){const o=ov(),p=panelOf(o);S.min=false;if(!o||!p)return;o.classList.remove("pf-min");
 p.style.left=p.style.top=p.style.maxHeight="";p.scrollTop=0;
 try{if(S.goto&&!flagZoomGoToPage)flagZoomGoToPage=S.goto}catch(e){}S.goto=null}

function decorate(country){const o=ov(),p=panelOf(o);if(!o||!p||p.querySelector(".pfm-bar"))return;
 const close=p.querySelector(".flag-zoom-close");
 const mb=document.createElement("button");mb.type="button";mb.className="pfm-min";mb.title="Shrink to a small card";
 mb.setAttribute("aria-label","Shrink to a small card");mb.innerHTML=MIN_SVG;mb.onclick=e=>{e.stopPropagation();shrink()};
 if(close)close.after(mb);else p.prepend(mb);
 const img=p.querySelector(".zoom-slide img"),name=(p.querySelector(".flag-zoom-name")||{}).textContent||(country&&country.n)||"";
 const bar=document.createElement("div");bar.className="pfm-bar";
 bar.innerHTML='<span class="pfm-grip" aria-hidden="true">⋮⋮</span>'+(img?'<img class="pfm-flag" alt="" src="'+img.getAttribute("src")+'">':"")+
  '<span class="pfm-name"></span><button type="button" class="pfm-b e" title="Show the full profile" aria-label="Show the full profile">'+EXP_SVG+
  '</button><button type="button" class="pfm-b x" title="Close" aria-label="Close">×</button>';
 bar.querySelector(".pfm-name").textContent=name.trim();
 bar.title="Drag to move · double-click to show the full profile";
 mb.after(bar);
 bar.querySelector(".e").onclick=e=>{e.stopPropagation();expand()};
 bar.querySelector(".x").onclick=e=>{e.stopPropagation();closeFlagZoom()};
 bar.addEventListener("dblclick",e=>{if(!e.target.closest(".pfm-b"))expand()});
 /* drag the card by its bar; Esc or a second pointer puts it back where it started */
 bar.addEventListener("pointerdown",e=>{if(e.button!==0||e.target.closest(".pfm-b"))return;e.preventDefault();e.stopPropagation();
  const sx=e.clientX,sy=e.clientY,ox=S.x,oy=S.y,id=e.pointerId;bar.classList.add("drag");try{bar.setPointerCapture(id)}catch(_){}
  const mv=ev=>{if(ev.pointerId!==id)return;S.x=ox+ev.clientX-sx;S.y=oy+ev.clientY-sy;clamp(p);p.style.maxHeight=Math.max(160,Math.min(innerHeight*(innerWidth<600?.42:.62),520,innerHeight-S.y-12))+"px"};
  const end=ev=>{if(ev&&ev.pointerId!=null&&ev.pointerId!==id)return;bar.classList.remove("drag");
   bar.removeEventListener("pointermove",mv);bar.removeEventListener("pointerup",end);bar.removeEventListener("pointercancel",end);
   removeEventListener("keydown",esc,true);try{bar.releasePointerCapture(id)}catch(_){}};
  const esc=ev=>{if(ev.key==="Escape"){ev.preventDefault();ev.stopImmediatePropagation();S.x=ox;S.y=oy;clamp(p);end()}};
  bar.addEventListener("pointermove",mv);bar.addEventListener("pointerup",end);bar.addEventListener("pointercancel",end);
  addEventListener("keydown",esc,true)})}

const _o=openFlagZoom;
openFlagZoom=function(country){const r=_o.apply(this,arguments);
 try{decorate(country);if(S.min)shrink()}catch(e){console.error(e)}
 /* other scripts add parts of the profile a moment later; keep the bar first and the flag right */
 setTimeout(()=>{try{const o=ov(),p=panelOf(o);if(!p)return;if(!p.querySelector(".pfm-bar"))decorate(country);if(S.min){o.classList.add("pf-min");place(p)}}catch(e){}},120);
 return r};
const _c=closeFlagZoom;
closeFlagZoom=function(){const o=ov();
 /* the × (or Esc, or a click outside) ends small mode; switching country goes through here too, so only reset on a real close */
 if(!S._opening){S.min=false;S.goto=null}
 return _c.apply(this,arguments)};
/* openFlagZoom closes the old profile before building the new one: keep small mode across that */
const _o2=openFlagZoom;
openFlagZoom=function(){S._opening=true;try{return _o2.apply(this,arguments)}finally{S._opening=false}};

/* while small: Tab moves through the whole page (no focus trap) and the arrow keys don't flip the profile's photos */
addEventListener("keydown",e=>{const o=ov();if(!o||!o.classList.contains("pf-min"))return;
 if(e.key==="Tab")e.stopImmediatePropagation()},true);
addEventListener("resize",()=>{const o=ov(),p=panelOf(o);if(o&&p&&o.classList.contains("pf-min"))place(p)});
})();
