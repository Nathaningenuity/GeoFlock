/* GeoFlock: full-screen and dark-mode fixes for World Maps (maps, keys, gadgets, tours), from an audit of every map
   in normal view and full screen, light and dark themes.
   1. Full screen, folding "Layers": the toggle rows are hidden but keep their space, so the map does not hop up under
      the top bar (which then could not be clicked); the search box stays.
   2. Full screen: the map key. The key under the map is hidden in full screen, so the floating key (#flKey) shows instead.
   3. Full screen: the round map buttons sit just outside the globe's edge (or in a gutter beside the flat map), below
      the layer rows.
   4. The globe canvas is as wide as the map area, so the atmosphere glow never ends at a hard vertical line; the globe
      leaves room for the glow at the top and bottom too.
   5. The floating key keeps clear of the round map buttons, the toolkit and "Point at the map".
   6. Toolkit / History timeline / "Point at the map": lifted into view when the bottom of a tall globe is below the
      window; in full screen the toolkit sits above the History timeline instead of on it.
   7. The Day & Night sun panel: a fold button (it can shrink to its top row), and in normal view it floats at the
      bottom right, clear of the toolkit.
   8. Full screen: the map tab row scrolls sideways; arrows show that there is more and scroll it.
   9. Dark theme: the History timeline's era names and the currents key note were too dim. */
(function(){
"use strict";
const fs=()=>document.body.classList.contains("gf-fs");
const dark=()=>document.body.classList.contains("sky-night");
const G=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const onMaps=()=>{try{return appMode==="allmaps"}catch(e){return false}};
const vis=e=>!!(e&&e.getClientRects().length&&getComputedStyle(e).visibility!=="hidden");
const hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;

const css=document.createElement("style");css.textContent=`
/* 1. folding Layers in full screen hides the rows but keeps their place: nothing moves, nothing covers the top bar */
body.gf-fs:not(.gf-fs-layers) .all-maps-controls{ display:flex !important; visibility:hidden !important; margin:0 0 4px !important; }
body.gf-fs:not(.gf-fs-layers) .all-maps-controls #globalSearchWrap{ visibility:visible !important; }
body.gf-fs #allMapsToggleRow{ position:relative; z-index:9; }
body.gf-fs .all-maps-controls{ position:relative; z-index:9; }
/* 2. full screen: the key under the map is out of sight, so the floating key takes over (it reads the hidden one) */
body.gf-fs #allMapsView #populationLegend:not(.hist-docked){ display:block !important; position:absolute !important; left:0 !important; top:-10000px !important; width:600px !important; visibility:hidden !important; pointer-events:none !important; }
/* 5. the floating key, fitted round the map's buttons */
#flKey.gfx-fit.open{ max-height:var(--gfx-mh) !important; }
#flKey.gfx-fit{ bottom:var(--gfx-b,16px) !important; }
#flKey.gfx-fit.gfx-w.open{ width:var(--gfx-w) !important; }
/* 7. the sun panel's fold */
.gf-dng-fold{ border:1px solid var(--line); background:var(--raised); color:inherit; border-radius:50%; width:28px; height:28px; padding:0; font:700 13px system-ui,sans-serif; cursor:pointer; flex:none; }
body.sky-night .gf-dng-fold{ background:#22304f; border-color:rgba(150,175,230,.25); }
.gf-dng.gf-dng-min .gf-dng-row, .gf-dng.gf-dng-min .gf-dng-note, .gf-dng.gf-dng-min .gf-dng-where{ display:none !important; }
.gf-dng.gf-dng-min .gf-dng-top{ margin-bottom:0; }
body.gf-fs .gf-dng.gf-dng-float.gf-dng-min{ width:auto; }
/* 8. arrows on the full-screen tab row */
.gfx-arr{ position:fixed; z-index:62; display:none; align-items:center; justify-content:center; width:34px; border:0; padding:0; cursor:pointer; font:800 18px/1 system-ui,sans-serif; color:#1b2a4a;
 background:linear-gradient(90deg,rgba(230,241,251,0),rgba(230,241,251,.97) 45%); }
.gfx-arr.l{ background:linear-gradient(270deg,rgba(230,241,251,0),rgba(230,241,251,.97) 45%); }
body.sky-night .gfx-arr{ color:#eef1ff; background:linear-gradient(90deg,rgba(14,19,40,0),rgba(14,19,40,.97) 45%); }
body.sky-night .gfx-arr.l{ background:linear-gradient(270deg,rgba(14,19,40,0),rgba(14,19,40,.97) 45%); }
body.gf-fs .gfx-arr.on{ display:flex; }
/* full screen over the starry sky (Satellite globe) in the light theme: the pale see-through chips turned grey on black */
body:not(.sky-night).gf-fs #allMapsView.gf-fs-sky #allMapsToggleRow .chip:not(.active), body:not(.sky-night).gf-fs #allMapsView.gf-fs-sky #allMapsToggleRow button:not(.active):not(.on),
body:not(.sky-night).gf-fs #allMapsView.gf-fs-sky .sub-chip:not(.active), body:not(.sky-night).gf-fs #allMapsView.gf-fs-sky .ps-launch-more{ background:rgba(255,255,255,.94) !important; color:#1b2a4a !important; opacity:1 !important; }
body:not(.sky-night).gf-fs #allMapsView.gf-fs-sky #globalSearchInput{ background:rgba(255,255,255,.94) !important; color:#1b2a4a !important; }
body:not(.sky-night).gf-fs #allMapsView.gf-fs-sky #globalSearchInput::placeholder{ color:#5a6a85 !important; }
body.gf-fs.gfx-sky .gfx-arr{ color:#eef1ff; background:linear-gradient(90deg,rgba(3,6,15,0),rgba(3,6,15,.97) 45%); }
body.gf-fs.gfx-sky .gfx-arr.l{ background:linear-gradient(270deg,rgba(3,6,15,0),rgba(3,6,15,.97) 45%); }
/* light theme, Satellite globe (normal view): the starry halo round the globe reached up under the layer switches, so
   their grey names sat on near-black; the halo now fades out closer to the globe, and the switch names get a light backing */
body:not(.sky-night) .globe-stage.gf-sky::before{
 -webkit-mask-image:radial-gradient(circle at calc(var(--gf-cx,400px) + var(--gf-rs,200px) * .32) calc(var(--gf-cy,400px) + var(--gf-rs,200px) * .32), #000 calc(var(--gf-rs,200px) * 1.0), transparent calc(var(--gf-rs,200px) * 1.16));
 mask-image:radial-gradient(circle at calc(var(--gf-cx,400px) + var(--gf-rs,200px) * .32) calc(var(--gf-cy,400px) + var(--gf-rs,200px) * .32), #000 calc(var(--gf-rs,200px) * 1.0), transparent calc(var(--gf-rs,200px) * 1.16)); }
body:not(.sky-night):not(.gf-fs) #allMapsView.sat-on.globe-on .all-maps-controls .switch-label{ background:rgba(255,255,255,.82); border-radius:6px; padding:1px 5px; }
/* 9. dark theme: dim labels */
body.sky-night .hist-era{ color:#aeb9dc !important; opacity:1 !important; }
body.sky-night .hist-era.on{ color:#ffd98a !important; }
body.sky-night .gf-eim-key{ color:#b9c6dc !important; }
body.sky-night #populationLegend .hist-relief-sw, body.sky-night #populationLegend .th-relief-sw{ color:#c9d3ea !important; opacity:1 !important; }
/* the floating key's "Show all" stays on one line */
.flk-h .flk-all{ white-space:nowrap; flex:none; }`;
document.head.appendChild(css);

/* 4. the globe's canvas spans the whole map area; the globe leaves room for its rim glow above and below */
if(typeof GlobeView!=="undefined"){const P=GlobeView.prototype,_s=P.size;P.size=function(){const r=_s.apply(this,arguments);try{const g=G();
 if(g&&this===g&&!this._flat&&onMaps()&&r&&r.w===r.h){const W=this.host.clientWidth||r.w;return{w:Math.max(r.w,W),h:r.h,r:Math.min(r.r,r.h/2/1.085)}}
 /* full screen, flat map: a gutter on each side for the column of round buttons */
 if(g&&this===g&&this._flat&&fs()&&onMaps()&&r){const W=this.host.clientWidth||r.w,maxW=W-8-2*50;if(r.w>maxW&&maxW>300){const k=maxW/r.w;return{w:Math.round(maxW),h:Math.round(r.h*k),r:r.r>=1e5?r.r:r.r*k}}}}catch(e){}return r}}

/* 3. full screen: the round buttons stand just outside the globe, under the layer rows */
function btnsSync(){const g=G();if(!g||!g.host)return;const b=g.host.querySelector(".globe-btns");if(!b)return;
 const clear=()=>{if(b._gfx){["left","top","right"].forEach(k=>b.style.removeProperty(k));b._gfx=0}};
 if(!fs()||!onMaps()||!vis(b)){clear();return}
 const st=b.offsetParent;if(!st)return;const sr=st.getBoundingClientRect();
 const ctl=document.querySelector("#allMapsView .all-maps-controls"),row=document.getElementById("allMapsToggleRow");
 let minTop=8;[row,ctl].forEach(e=>{if(e&&e.getClientRects().length){const r=e.getBoundingClientRect();if(r.height)minTop=Math.max(minTop,r.bottom+8)}});
 let s;try{s=g.size()}catch(e){return}
 const cv=g.canvas&&g.canvas.getBoundingClientRect();if(!cv)return;
 const cx=cv.left+s.w/2,cy=cv.top+s.h/2,R=s.r+8,bw=b.offsetWidth||34,bh=b.offsetHeight;
 const top=minTop,bottom=top+bh,dy=Math.max(0,cy-bottom);
 let x=g._flat?cv.right+8:cx+(dy<R?Math.sqrt(R*R-dy*dy):0);x=Math.min(x,innerWidth-bw-10);
 b.style.setProperty("left",Math.round(x-sr.left)+"px","important");b.style.setProperty("right","auto","important");b.style.setProperty("top",Math.round(top-sr.top)+"px","important");b._gfx=1}

/* 5. the floating key keeps clear of the round buttons, the toolkit and "Point at the map" */
function keySync(){const k=document.getElementById("flKey");if(!k)return;
 const off=()=>{k.classList.remove("gfx-fit","gfx-w")};
 if(k.style.display==="none"||!k.classList.contains("open")||k.style.left||k.style.top||!onMaps()){off();return}
 off();const kr=k.getBoundingClientRect();if(!kr.width)return;
 const obs=[...document.querySelectorAll("#allMapsView .globe-btns, #allMapsView .map-zoom-controls, #allMapsView .gfk-coord, #allMapsView .gfk-tray, #gfDngPanel.gf-dng-float")].filter(vis).map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight);
 let bot=16,width=0,topLim=0;const low=o=>o.top>innerHeight*.6;
 obs.forEach(o=>{if(o.left<kr.right&&o.right>kr.left&&low(o)&&o.bottom>kr.top)bot=Math.max(bot,innerHeight-o.top+8)});
 /* where the key would stand once lifted above those */
 const sh=bot-16,kk={left:kr.left,right:kr.right,top:kr.top-sh,bottom:kr.bottom-sh};
 obs.forEach(o=>{if(!(o.left<kk.right&&o.right>kk.left)||low(o))return;
  if(hit(o,kk)){const w=Math.round(kk.right-o.right-10);if(w>=230&&o.right<kk.right){width=width?Math.min(width,w):w}else topLim=Math.max(topLim,o.bottom+8)}});
 if(bot===16&&!width&&!topLim)return;
 const mh=Math.max(150,Math.round(innerHeight-bot-Math.max(topLim,8)));
 k.style.setProperty("--gfx-b",bot+"px");k.style.setProperty("--gfx-mh",mh+"px");if(width)k.style.setProperty("--gfx-w",width+"px");
 k.classList.add("gfx-fit");k.classList.toggle("gfx-w",!!width)}

/* 6. bottom-of-map controls: into view when the map runs below the window; in full screen, above the History timeline */
function bottomSync(){const g=G();const host=g&&g.host&&vis(g.host)?g.host:document.getElementById("allMapsWrap");
 const els=[...document.querySelectorAll("#allMapsView .gfk-tray, #allMapsView .hist-dock, #allMapsView .gfk-coord")];
 const reset=()=>els.forEach(e=>{if(e._gfx){e.style.removeProperty("translate");e.style.removeProperty("bottom");e._gfx=0}});
 if(!onMaps()||!host||!vis(host)){reset();return}
 if(fs()){els.forEach(e=>{if(e._gfx===1){e.style.removeProperty("translate");e._gfx=0}});
  const dock=document.querySelector("#allMapsView .hist-dock");const d=dock&&vis(dock)?dock.getBoundingClientRect():null;
  ["#allMapsView .gfk-tray","#allMapsView .gfk-coord"].forEach(sel=>{const e=document.querySelector(sel);if(!e)return;
   if(d){e.style.removeProperty("bottom");const r=e.getBoundingClientRect();const need=r.bottom>d.top-4&&r.left<d.right&&r.right>d.left;
    if(need||e._gfx===2){const base=sel.includes("tray")?4:12;e.style.setProperty("bottom",Math.round(innerHeight-d.top+6)+"px","important");e._gfx=2}}
   else if(e._gfx===2){e.style.removeProperty("bottom");e._gfx=0}});return}
 els.forEach(e=>{if(e._gfx===2){e.style.removeProperty("bottom");e._gfx=0}});
 const hr=host.getBoundingClientRect();const over=hr.bottom-innerHeight+6;
 const lift=hr.top<innerHeight-260&&over>0?Math.min(over,hr.height*.45):0;
 els.forEach(e=>{if(!host.contains(e)&&!e.closest(".globe-wrap-rel, #allMapsWrap")){return}
  if(lift){e.style.translate="0 "+(-Math.round(lift))+"px";e._gfx=1}else if(e._gfx===1){e.style.removeProperty("translate");e._gfx=0}})}

/* 7. the sun panel: a fold, and a place clear of the toolkit */
let dngMin=false;
function dngSync(){const el=document.getElementById("gfDngPanel");if(!el||el.hidden)return;const top=el.querySelector(".gf-dng-top");
 if(top&&!top.querySelector(".gf-dng-fold")){const f=document.createElement("button");f.type="button";f.className="gf-dng-fold";
  f.onclick=e=>{e.stopPropagation();dngMin=!dngMin;el.classList.toggle("gf-dng-min",dngMin);fold(f)};top.appendChild(f);fold(f)}
 el.classList.toggle("gf-dng-min",dngMin);
 const fl=el.classList.contains("gf-dng-float");
 if(fl&&!fs()&&!el._moved){const tray=document.querySelector("#allMapsView .gfk-tray");const t=tray&&vis(tray)?tray.getBoundingClientRect():null;
  const left=t&&t.top<innerHeight?t.right+14:12,w=Math.max(300,Math.min(620,innerWidth-left-14));
  el.style.left="auto";el.style.right="14px";el.style.transform="none";el.style.width=w+"px";
  /* and above "Point at the map" */
  const c=document.querySelector("#allMapsView .gfk-coord");let bot=12;if(c&&vis(c)){const cr=c.getBoundingClientRect();if(cr.bottom>innerHeight-140&&cr.top<innerHeight&&cr.right>innerWidth-14-w)bot=Math.max(bot,Math.round(innerHeight-cr.top+8))}
  el.style.bottom=bot+"px";el._gfx=1}
 else if(el._gfx&&(!fl||fs())&&!el._moved){["left","right","transform","width","bottom"].forEach(k=>el.style.removeProperty(k));el._gfx=0}}
function fold(f){f.textContent=dngMin?"▴":"▾";f.title=dngMin?"Show the sliders":"Fold the panel to one line";f.setAttribute("aria-label",f.title);f.setAttribute("aria-expanded",String(!dngMin))}

/* 8. the full-screen tab row: arrows when it scrolls */
let AL=null,AR=null;
function arrows(){const row=document.getElementById("allMapsToggleRow");
 if(!AL){AL=document.createElement("button");AL.type="button";AL.className="gfx-arr l";AL.textContent="‹";AL.title="More maps";AL.setAttribute("aria-label","Scroll the map tabs left");
  AR=document.createElement("button");AR.type="button";AR.className="gfx-arr r";AR.textContent="›";AR.title="More maps";AR.setAttribute("aria-label","Scroll the map tabs right");
  AL.onclick=()=>{const r=document.getElementById("allMapsToggleRow");if(r)r.scrollBy({left:-r.clientWidth*.6,behavior:"smooth"})};
  AR.onclick=()=>{const r=document.getElementById("allMapsToggleRow");if(r)r.scrollBy({left:r.clientWidth*.6,behavior:"smooth"})};document.body.append(AL,AR)}
 if(!fs()||!row||!onMaps()){AL.classList.remove("on");AR.classList.remove("on");return}
 const r=row.getBoundingClientRect(),more=row.scrollWidth-row.clientWidth>4;
 [AL,AR].forEach(a=>{a.style.top=r.top+"px";a.style.height=Math.max(28,r.height-4)+"px"});AL.style.left=r.left+"px";AR.style.left=(r.right-34)+"px";
 AL.classList.toggle("on",more&&row.scrollLeft>4);AR.classList.toggle("on",more&&row.scrollLeft<row.scrollWidth-row.clientWidth-4)}
document.addEventListener("scroll",e=>{if(e.target&&e.target.id==="allMapsToggleRow")try{arrows()}catch(x){}},true);

function skySync(){const v=document.getElementById("allMapsView");document.body.classList.toggle("gfx-sky",!!(v&&v.classList.contains("gf-fs-sky")&&fs()))}
function tick(){try{skySync()}catch(e){}[btnsSync,keySync,bottomSync,dngSync,arrows].forEach(f=>{try{f()}catch(e){}})}
setInterval(tick,350);addEventListener("resize",()=>setTimeout(tick,150));addEventListener("scroll",()=>{try{bottomSync();keySync()}catch(e){}},{passive:true});
window.gfFsFix={tick};
})();
