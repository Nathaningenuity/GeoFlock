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
/* every magnified place: the stop, the spot, the ring's radius in km, the close-up and its caption.
   Island close-ups: Sentinel-2 cloudless 2016 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016),
   CC BY 4.0, https://s2maps.eu . */
const S2="Sentinel-2 cloudless 2016 by EOX · CC BY 4.0";
const ZOOMS=[
 {tour:"space",title:"The colours of the Sahara",at:[-11.40,21.12],ringKm:24,img:"photos/richat-iss069e005471.webp",name:"The Eye of the Sahara",sub:"about 40 km across · seen from the ISS",credit:"Photo: NASA"},
 {tour:"islandlife",title:"Christmas Island’s red crabs",at:[105.63,-10.49],ringKm:12,img:"photos/s2-christmas.webp",name:"Christmas Island",sub:"about 19 km across · from space",credit:S2},
 {tour:"amigration",title:"Red crabs march to the sea",at:[105.63,-10.49],ringKm:12,img:"photos/s2-christmas.webp",name:"Christmas Island",sub:"about 19 km across · from space",credit:S2},
 {tour:"islands",title:"Tiny island, two nations",at:[-63.06,18.06],ringKm:11,img:"photos/s2-stmartin.webp",name:"Saint Martin",sub:"French north, Dutch south · about 15 km across",credit:S2,
  /* the stop's two flag tags sit on the close-up (French north, Dutch south) instead of covering the island on the map */
  tags:[["fr","France",28],["nl","Netherlands",74]]},
 {tour:"oceania",title:"The smallest island country",at:[166.93,-0.525],ringKm:4,img:"photos/s2-nauru.webp",name:"Nauru",sub:"21 km² · about 6 km across",credit:S2},
 {tour:"hoceania",title:"Easter Island’s giants",at:[-109.35,-27.12],ringKm:14,img:"photos/s2-rapanui.webp",name:"Rapa Nui (Easter Island)",sub:"about 24 km across · from space",credit:S2},
 {tour:"bremote",title:"Christmas Island",at:[105.63,-10.49],ringKm:12,img:"photos/s2-christmas.webp",name:"Christmas Island",sub:"about 19 km across · from space",credit:S2},
 {tour:"bremote",title:"Rapa Nui",at:[-109.35,-27.12],ringKm:14,img:"photos/s2-rapanui.webp",name:"Rapa Nui (Easter Island)",sub:"about 24 km across · from space",credit:S2},
 {tour:"bcollapse",title:"Easter Island",at:[-109.35,-27.12],ringKm:14,img:"photos/s2-rapanui.webp",name:"Rapa Nui (Easter Island)",sub:"about 24 km across · from space",credit:S2},
 {tour:"islandlife",title:"Krakatoa starts again",at:[105.42,-6.11],ringKm:7,img:"photos/s2-krakatau.webp",name:"Krakatoa",sub:"what is left of the 1883 volcano, Anak Krakatau in the middle",credit:S2}];
let C=ZOOMS[0];
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const tourOn=()=>typeof ps!=="undefined"&&!!ps;
const active=()=>{try{if(!tourOn())return false;const t=clean((psSteps()[ps.i]||{}).title),z=ZOOMS.find(z=>z.tour===ps.tour&&z.title===t);if(z)C=z;return!!z}catch(e){return false}};
/* where the reader dragged the close-up, as an offset from the eye on screen (so it follows the map); reset per visit */
let OFF=null,KEY=null,drag=null;

function layer(box){let L=box.querySelector(".gf-eyez");
 if(L&&L._z!==C){L.remove();L=null}
 if(!L){L=document.createElement("div");L.className="gf-eyez";L.setAttribute("aria-hidden","true");
  L._z=C;L.innerHTML='<svg class="gf-eyez-svg"><path class="gf-eyez-cone"/><path class="gf-eyez-tan"/><circle class="gf-eyez-ring0"/><circle class="gf-eyez-ring"/></svg>'+
   '<div class="gf-eyez-lens"><div class="gf-eyez-img" style="background-image:url('+C.img+')">'+(C.tags||[]).map(t=>'<span class="gf-eyez-tag" style="top:'+t[2]+'%"><img src="'+(typeof flagUrl==="function"?flagUrl(t[0],"w40"):"")+'" alt="">'+t[1]+'</span>').join("")+'</div>'+
   '<div class="gf-eyez-cap"><b>'+C.name+'</b><span>'+C.sub+'</span><small>'+C.credit+'</small></div></div>';
  box.appendChild(L);
  const lens=L.querySelector(".gf-eyez-lens");
  /* keep the map's own pan and zoom off the close-up */
  ["pointerdown","mousedown","touchstart","wheel","click","dblclick"].forEach(ev=>lens.addEventListener(ev,e=>e.stopPropagation(),{passive:ev!=="click"&&ev!=="dblclick"}));
  lens.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;
   const c=psScreen(C.at),x=parseFloat(lens.style.left),y=parseFloat(lens.style.top);if(!c||!isFinite(x))return;
   drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,ox:x-c[0],oy:y-c[1]};lens.classList.add("gf-eyez-drag");
   try{lens.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
  lens.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;e.stopPropagation();
   OFF=[drag.ox+e.clientX-drag.x0,drag.oy+e.clientY-drag.y0];place()});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;lens.classList.remove("gf-eyez-drag");try{lens.releasePointerCapture(e.pointerId)}catch(x){}};
  lens.addEventListener("pointerup",end);lens.addEventListener("pointercancel",end);
  lens.addEventListener("dblclick",()=>{OFF=null;place()})}
 return L}
function remove(){document.querySelectorAll(".gf-eyez").forEach(x=>x.remove());document.querySelectorAll(".gf-ftags").forEach(x=>x.style.visibility="")}

/* screen rectangle of the card, in the box's coordinates (null if it is not over the map) */
function cardRect(br){try{const c=ps.card;if(!c||c.offsetParent===null)return null;const r=c.getBoundingClientRect();
 return{l:r.left-br.left-10,r:r.right-br.left+10,t:r.top-br.top-10,b:r.bottom-br.top+10}}catch(e){return null}}
function hits(a,b){return!(a.r<=b.l||a.l>=b.r||a.b<=b.t||a.t>=b.b)}

function place(){
 if(!active()){remove();KEY=null;OFF=null;return}
 {const k=ps.tour+"|"+ps.i;if(k!==KEY){KEY=k;OFF=null}}
 const box=psContainer&&psContainer();if(!box)return;
 document.querySelectorAll(".gf-eyez").forEach(x=>{if(x.parentElement!==box)x.remove()});
 const L=layer(box),c=psScreen(C.at);
 {const ft=box.querySelector(".gf-ftags");if(ft)ft.style.visibility=C.tags?"hidden":""}
 if(!c){L.style.display="none";return}
 const n=psScreen([C.at[0],C.at[1]+C.ringKm/111.2]);
 const r=Math.max(9,Math.min(80,n?Math.hypot(n[0]-c[0],n[1]-c[1]):9));
 const W=box.clientWidth,H=box.clientHeight,br=box.getBoundingClientRect();
 /* keep inside the visible window, too (the globe's stage can be larger than the screen) */
 const vx0=Math.max(0,-br.left),vy0=Math.max(0,-br.top),vx1=Math.min(W,innerWidth-br.left),vy1=Math.min(H,innerHeight-br.top);
 const R=Math.round(Math.max(56,Math.min(118,Math.min(vx1-vx0,vy1-vy0)*.15)));
 const small=innerWidth<=600,CAP=small?22:46,M=small?6:12,HW=Math.max(R,small?60:92),card=cardRect(br);
 /* other things on the map to keep clear of: the photo squares and the stop's own pins */
 const avoid=[];try{box.querySelectorAll(".ps-sq,.ps-pin,.ps-legend,.ps-tourlegend,.ps-mapkey,.ps-lbl,.globe-btns button").forEach(el=>{if(el.closest(".gf-eyez"))return;const q=el.getBoundingClientRect();if(q.width&&q.height)avoid.push({l:q.left-br.left,r:q.right-br.left,t:q.top-br.top,b:q.bottom-br.top})})}catch(e){}
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
.gf-eyez-img{ position:relative; }
.gf-eyez-tag{ position:absolute; left:50%; transform:translate(-50%,-50%); display:flex; align-items:center; gap:4px; padding:2px 7px 2px 3px; border-radius:999px;
  background:rgba(255,255,255,.92); color:#1d2a3a; font:800 10.5px system-ui,sans-serif; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,.4); }
.gf-eyez-tag img{ width:16px; height:11px; border-radius:2px; object-fit:cover; }
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
