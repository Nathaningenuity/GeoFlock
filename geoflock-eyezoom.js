/* GeoFlock: a magnifier for the Earth-from-space tour stop "The colours of the Sahara".
   The Richat Structure ("Eye of the Sahara", Mauritania, about 21.12°N, 11.40°W) is about 40 km across, too small to
   see on the tour's satellite map. This file circles it on the map and joins the circle, with two tangent lines like a
   magnifying glass, to a round close-up photo set in a free corner of the map (away from the card and the screen edges).
   Works on the globe and on the flat map: it is a DOM layer inside the tour's map box, placed with psScreen, and it is
   re-placed every time the tour places its photo squares (psPhPinsSync), so it follows panning and zooming.

   Photo: photos/richat-iss069e005471.webp, a square crop of NASA ISS photo iss069e005471 (Expedition 69 crew,
   26 April 2023), https://images.nasa.gov/details/iss069e005471 . NASA, public domain.
   Patch pattern as in geoflock-niagara.js: runs after window load + 1.5 s, re-runs at +5 and +12 s, guarded. */
(function(){
const TOUR="space",TITLE="The colours of the Sahara";
const EYE=[-11.40,21.12],RING_KM=24;/* the outer ring is about 40–50 km across */
const IMG="photos/richat-iss069e005471.webp";
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const tourOn=()=>typeof ps!=="undefined"&&!!ps;
const active=()=>{try{return tourOn()&&ps.tour===TOUR&&clean((psSteps()[ps.i]||{}).title)===TITLE}catch(e){return false}};
/* where the reader dragged the close-up, as an offset from the eye on screen (so it follows the map); reset per visit */
let OFF=null,KEY=null,drag=null;

function layer(box){let L=box.querySelector(".gf-eyez");
 if(!L){L=document.createElement("div");L.className="gf-eyez";L.setAttribute("aria-hidden","true");
  L.innerHTML='<svg class="gf-eyez-svg"><path class="gf-eyez-cone"/><path class="gf-eyez-tan"/><circle class="gf-eyez-ring0"/><circle class="gf-eyez-ring"/></svg>'+
   '<div class="gf-eyez-lens"><div class="gf-eyez-img" style="background-image:url('+IMG+')"></div>'+
   '<div class="gf-eyez-cap"><b>The Eye of the Sahara</b><span>about 40 km across · seen from the ISS</span><small>Photo: NASA</small></div></div>';
  box.appendChild(L);
  const lens=L.querySelector(".gf-eyez-lens");
  /* keep the map's own pan and zoom off the close-up */
  ["pointerdown","mousedown","touchstart","wheel","click","dblclick"].forEach(ev=>lens.addEventListener(ev,e=>e.stopPropagation(),{passive:ev!=="click"&&ev!=="dblclick"}));
  lens.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;
   const c=psScreen(EYE),x=parseFloat(lens.style.left),y=parseFloat(lens.style.top);if(!c||!isFinite(x))return;
   drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,ox:x-c[0],oy:y-c[1]};lens.classList.add("gf-eyez-drag");
   try{lens.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
  lens.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;e.stopPropagation();
   OFF=[drag.ox+e.clientX-drag.x0,drag.oy+e.clientY-drag.y0];place()});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;lens.classList.remove("gf-eyez-drag");try{lens.releasePointerCapture(e.pointerId)}catch(x){}};
  lens.addEventListener("pointerup",end);lens.addEventListener("pointercancel",end);
  lens.addEventListener("dblclick",()=>{OFF=null;place()})}
 return L}
function remove(){document.querySelectorAll(".gf-eyez").forEach(x=>x.remove())}

/* screen rectangle of the card, in the box's coordinates (null if it is not over the map) */
function cardRect(br){try{const c=ps.card;if(!c||c.offsetParent===null)return null;const r=c.getBoundingClientRect();
 return{l:r.left-br.left-10,r:r.right-br.left+10,t:r.top-br.top-10,b:r.bottom-br.top+10}}catch(e){return null}}
function hits(a,b){return!(a.r<=b.l||a.l>=b.r||a.b<=b.t||a.t>=b.b)}

function place(){
 if(!active()){remove();KEY=null;OFF=null;return}
 {const k=ps.tour+"|"+ps.i;if(k!==KEY){KEY=k;OFF=null}}
 const box=psContainer&&psContainer();if(!box)return;
 document.querySelectorAll(".gf-eyez").forEach(x=>{if(x.parentElement!==box)x.remove()});
 const L=layer(box),c=psScreen(EYE);
 if(!c){L.style.display="none";return}
 const n=psScreen([EYE[0],EYE[1]+RING_KM/111.2]);
 const r=Math.max(9,Math.min(80,n?Math.hypot(n[0]-c[0],n[1]-c[1]):9));
 const W=box.clientWidth,H=box.clientHeight,br=box.getBoundingClientRect();
 /* keep inside the visible window, too (the globe's stage can be larger than the screen) */
 const vx0=Math.max(0,-br.left),vy0=Math.max(0,-br.top),vx1=Math.min(W,innerWidth-br.left),vy1=Math.min(H,innerHeight-br.top);
 const R=Math.round(Math.max(56,Math.min(118,Math.min(vx1-vx0,vy1-vy0)*.15)));
 const small=innerWidth<=600,CAP=small?22:46,M=small?6:12,HW=Math.max(R,small?60:92),card=cardRect(br);
 /* other things on the map to keep clear of: the photo squares and the stop's own pins */
 const avoid=[];try{box.querySelectorAll(".ps-sq,.ps-pin,.ps-legend,.ps-tourlegend,.globe-btns button").forEach(el=>{if(el.closest(".gf-eyez"))return;const q=el.getBoundingClientRect();if(q.width&&q.height)avoid.push({l:q.left-br.left,r:q.right-br.left,t:q.top-br.top,b:q.bottom-br.top})})}catch(e){}
 const ok=(x,y)=>{const rc={l:x-HW,r:x+HW,t:y-R,b:y+R+CAP};
  if(rc.l<vx0+M||rc.r>vx1-M||rc.t<vy0+M||rc.b>vy1-M)return-1;
  if(card&&hits(rc,card))return-1;
  if(Math.hypot(x-c[0],y-c[1])<R+r+24)return-1;
  if(hits(rc,{l:c[0]-r-8,r:c[0]+r+8,t:c[1]-r-8,b:c[1]+r+8}))return-1;
  return avoid.filter(a=>hits(rc,a)).length};
 let best=null;
 const ANG=[-50,-20,-80,20,-110,50,-140,160,80,130,110,180];
 for(const k of [1,1.5,2.1,2.8])for(const a of ANG){const d=(R+r)*k+30,x=c[0]+Math.cos(a*Math.PI/180)*d,y=c[1]+Math.sin(a*Math.PI/180)*d,s=ok(x,y);
  if(s<0)continue;const score=s*1000+d*.2+ANG.indexOf(a)*4;if(!best||score<best.score)best={x,y,score};if(s===0&&k===1)break}
 if(OFF){const x=Math.max(vx0+HW,Math.min(vx1-HW,c[0]+OFF[0])),y=Math.max(vy0+R,Math.min(vy1-R-CAP,c[1]+OFF[1]));best={x,y}}
 L.style.display="";
 const svg=L.querySelector("svg");svg.setAttribute("width",W);svg.setAttribute("height",H);svg.setAttribute("viewBox","0 0 "+W+" "+H);
 ["gf-eyez-ring0","gf-eyez-ring"].forEach(k=>{const e=svg.querySelector("."+k);e.setAttribute("cx",c[0]);e.setAttribute("cy",c[1]);e.setAttribute("r",r)});
 const lens=L.querySelector(".gf-eyez-lens"),cone=svg.querySelector(".gf-eyez-cone"),tan=svg.querySelector(".gf-eyez-tan");
 if(!best){lens.style.display="none";cone.setAttribute("d","");tan.setAttribute("d","");return}
 lens.style.display="";lens.title="Drag to move · double-click to put it back";lens.style.left=best.x+"px";lens.style.top=best.y+"px";lens.style.setProperty("--R",R+"px");
 /* the two outer tangents between the ring and the lens */
 const dx=best.x-c[0],dy=best.y-c[1],D=Math.hypot(dx,dy),th=Math.atan2(dy,dx),al=Math.acos(Math.max(-1,Math.min(1,(r-R)/D)));
 const P=(cx,cy,rr,a)=>[cx+rr*Math.cos(a),cy+rr*Math.sin(a)];
 const a1=th+al,a2=th-al,p1=P(c[0],c[1],r,a1),q1=P(best.x,best.y,R,a1),p2=P(c[0],c[1],r,a2),q2=P(best.x,best.y,R,a2);
 const f=v=>v[0].toFixed(1)+" "+v[1].toFixed(1);
 cone.setAttribute("d","M"+f(p1)+"L"+f(q1)+"L"+f(q2)+"L"+f(p2)+"Z");
 tan.setAttribute("d","M"+f(p1)+"L"+f(q1)+"M"+f(p2)+"L"+f(q2))}

let hooked=false;
function hook(){if(hooked||typeof psPhPinsSync!=="function"||typeof psScreen!=="function"||typeof psContainer!=="function")return;hooked=true;
 {const _s=psPhPinsSync;psPhPinsSync=function(){const out=_s.apply(this,arguments);try{place()}catch(e){console.error("eyezoom",e)}return out}}
 if(typeof psEnd==="function"){const _e=psEnd;psEnd=function(){const out=_e.apply(this,arguments);try{if(!tourOn())remove()}catch(e){}return out}}
 /* the globe can turn without placing pins (inertia, fly-to); keep up while the stop is open */
 let last="";const tick=()=>{try{if(active()){const g=ps.g,k=ps.mode+"|"+(g&&g.rot?g.rot.join(",")+"|"+g.zoom:"")+"|"+innerWidth+"x"+innerHeight;if(k!==last){last=k;place()}}else if(last){last="";remove()}}catch(e){}requestAnimationFrame(tick)};
 requestAnimationFrame(tick);
 const css=document.createElement("style");css.textContent=`
.gf-eyez{ position:absolute; inset:0; pointer-events:none; z-index:7; }
.gf-eyez-svg{ position:absolute; left:0; top:0; overflow:visible; }
.gf-eyez-cone{ fill:rgba(255,190,110,.16); stroke:none; }
.gf-eyez-tan{ fill:none; stroke:#ffb347; stroke-width:2; filter:drop-shadow(0 0 1.5px rgba(0,0,0,.8)); }
.gf-eyez-ring0{ fill:none; stroke:rgba(20,20,30,.55); stroke-width:5; }
.gf-eyez-ring{ fill:rgba(255,160,60,.12); stroke:#ffb347; stroke-width:2.6; }
.gf-eyez-lens{ position:absolute; pointer-events:auto; cursor:grab; touch-action:none; user-select:none; -webkit-user-select:none; width:calc(var(--R) * 2); transform:translate(-50%,calc(var(--R) * -1)); }
.gf-eyez-img{ width:calc(var(--R) * 2); height:calc(var(--R) * 2); border-radius:50%; background-size:cover; background-position:center;
  border:3px solid #ffb347; box-shadow:0 0 0 2px rgba(255,255,255,.9), 0 8px 24px rgba(0,0,0,.45); box-sizing:border-box; }
.gf-eyez-lens.gf-eyez-drag{ cursor:grabbing; }
.gf-eyez-lens.gf-eyez-drag .gf-eyez-img{ box-shadow:0 0 0 2px #fff, 0 14px 34px rgba(0,0,0,.55); }
.gf-eyez-cap{ margin-top:6px; text-align:center; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.85), 0 0 8px rgba(0,0,0,.6); line-height:1.2; white-space:nowrap; }
.gf-eyez-cap b{ display:block; font-size:12.5px; }
.gf-eyez-cap span{ display:block; font-size:10.5px; opacity:.95; }
.gf-eyez-cap small{ display:block; font-size:9px; opacity:.75; }
@media (max-width:600px){ .gf-eyez-cap span,.gf-eyez-cap small{ display:none; } }`;
 document.head.appendChild(css)}

function patch(){try{hook();if(tourOn())place()}catch(e){console.error("eyezoom",e)}}
let booted=false;
function boot(){if(booted)return;booted=true;patch();[5000,12000].forEach(ms=>setTimeout(patch,ms))}
if(document.readyState==="complete")setTimeout(boot,1500);else addEventListener("load",()=>setTimeout(boot,1500));
window.gfEyeZoom={place};
})();
