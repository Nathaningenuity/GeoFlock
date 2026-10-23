/* GeoFlock: a cleaner look for what tours light up on the flat map.
   - one crisp outline round each lit area (a white casing with a soft shadow) instead of a thin line round every country
   - coloured groups are inked in (multiply) so the relief shows through, rather than a pale translucent wash
   - hand-drawn regions are smoothed and given a halo and a fine hatch
   - each new stop fades in */
(function(){
if(typeof psDrawFlat!=="function")return;
const NS="http://www.w3.org/2000/svg";
/* d3 path strings → arrays of rings of points (only M/L/Z, which is all d3 writes for polygons) */
function rings(d){const out=[];let cur=null;(d.match(/[MLZ][^MLZ]*/g)||[]).forEach(seg=>{const c=seg[0],n=seg.slice(1).split(/[ ,]+/).filter(Boolean).map(Number);if(c==="M"){cur=[[n[0],n[1]]];out.push(cur)}else if(c==="L"&&cur){for(let k=0;k+1<n.length;k+=2)cur.push([n[k],n[k+1]])}});return out}
/* drop crowded points, then draw a closed Catmull–Rom curve through what's left */
function smooth(d){try{if(/[CQAHV]/i.test(d.replace(/[MLZ]/g,"")))return d;return rings(d).map(R=>{if(R.length<4)return"M"+R.join("L")+"Z";
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;R.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});const tol=Math.max(.6,Math.hypot(x1-x0,y1-y0)/70);
 const P=[R[0]];R.forEach(p=>{const q=P[P.length-1];if(Math.hypot(p[0]-q[0],p[1]-q[1])>=tol)P.push(p)});if(P.length>3&&Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1])<tol)P.pop();if(P.length<4)return"M"+R.join("L")+"Z";
 const n=P.length,f=v=>v.toFixed(1);let s="M"+f(P[0][0])+","+f(P[0][1]);
 for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n],e=P[(i+2)%n];s+="C"+f(b[0]+(c[0]-a[0])/6)+","+f(b[1]+(c[1]-a[1])/6)+" "+f(c[0]-(e[0]-b[0])/6)+","+f(c[1]-(e[1]-b[1])/6)+" "+f(c[0])+","+f(c[1])}return s+"Z"}).join("")}catch(e){return d}}
let lastKey="",keyT=0;
function enhance(){const svg=ps&&ps.wrap&&ps.wrap.querySelector("svg"),g=svg&&svg.querySelector("#psLayer");if(!g)return;

 if(!svg.querySelector("#gfHatchDefs"))svg.insertAdjacentHTML("afterbegin",'<defs id="gfHatchDefs">'+[["b","#2f6fd6"],["g","#2e8a46"],["l","#3f9a3f"]].map(([k,c])=>'<pattern id="gfHatch'+k+'" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(40)"><rect width="6" height="6" style="fill:'+c+' !important;fill-opacity:.2 !important;stroke:none !important;opacity:1 !important;display:inline !important"/><line x1="0" y1="0" x2="0" y2="6" style="stroke:'+c+' !important;stroke-opacity:.75 !important;stroke-width:1.6px !important;fill:none !important;opacity:1 !important;display:inline !important;vector-effect:none !important"/></pattern>').join("")+'</defs>')
 hatchSize(svg);
 /* the layer is redrawn several times as a stop opens, so time the reveal from when the stop changed and carry on from there */
 const key=ps.tour+":"+ps.i;if(key!==lastKey){lastKey=key;keyT=performance.now()}const el=(performance.now()-keyT)/1000,fresh=el<1.6;
 if(fresh&&!g.classList.contains("gf-reveal")){g.classList.add("gf-reveal");g.style.setProperty("--gfel",(-el).toFixed(2)+"s")}
 /* 1. one outline round everything that is lit: the stroke is masked by the dimming mask, so only its outer half shows
       and the borders between lit neighbours disappear */
 const mask=g.querySelector("#psMask");
 if(mask&&!g.querySelector(".gf-casing")){const ds=[...mask.querySelectorAll("path:not(.ps-mband)")].map(p=>p.getAttribute("d")).filter(Boolean);
  if(ds.length){const one=ds.join("");g.querySelectorAll(".ps-edge").forEach(e=>e.remove());
   const dim=g.querySelector(".ps-dim"),h='<g class="gf-casing" mask="url(#psMask)"><path class="gf-cs-shadow" d="'+one+'"/><path class="gf-cs-line" d="'+one+'"/></g>';
   if(dim)dim.insertAdjacentHTML("afterend",h);else g.insertAdjacentHTML("afterbegin",h)}}
 /* 1b. on a new stop the lit areas switch on one after another, west to east, like a map video */
 if(fresh&&!matchMedia("(prefers-reduced-motion:reduce)").matches){const holes=mask?[...mask.querySelectorAll("path:not(.ps-mband)")]:[];
  /* stops that only colour countries, without dimming the rest, stagger the colours themselves */
  if(holes.length<2){const T=[...g.querySelectorAll(".ps-tint")];if(T.length>1&&T.length<=80){const xs=T.map(t=>{try{const b=t.getBBox();return b.x+b.width/2}catch(e){return 0}}),ord=xs.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]),step=Math.min(.09,1.1/T.length);ord.forEach((i,k)=>{T[i].style.animation="gfFadeIn .5s ease "+(k*step-el).toFixed(2)+"s both"})}}
  if(holes.length>1&&holes.length<=60){
  const xs=holes.map(h=>{try{const b=h.getBBox();return b.x+b.width/2}catch(e){return 0}}),ord=xs.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]),step=Math.min(.09,1.1/holes.length),delay={};
  ord.forEach((i,k)=>{const h=holes[i];h.style.animation="gfHoleIn .45s ease "+(k*step-el).toFixed(2)+"s both";delay[h.getAttribute("d")]=k*step});
  g.querySelectorAll(".ps-tint").forEach(t=>{const dl=delay[t.getAttribute("d")];if(dl!=null)t.style.animation="gfFadeIn .5s ease "+(dl+.05-el).toFixed(2)+"s both"})}}
 /* 2. coloured groups: ink rather than wash, and the casing sits above them */
 const cas=g.querySelector(".gf-casing"),tints=g.querySelectorAll(".ps-tint");if(cas&&tints.length){const last=tints[tints.length-1];last.after(cas)}
 /* 3. hand-drawn regions: smoothed, with a halo under them */
 g.querySelectorAll("path.ps-shade,path.ps-forest,path.ps-grass").forEach(p=>{if(p._gf)return;p._gf=1;p.style.setProperty("fill","url(#gfHatch"+(p.classList.contains("ps-shade")?"b":p.classList.contains("ps-forest")?"g":"l")+")","important");const d=smooth(p.getAttribute("d")||"");p.setAttribute("d",d);
  if(g.querySelector(".gf-casing"))return;const h=document.createElementNS(NS,"path");h.setAttribute("class","gf-halo");h.setAttribute("d",d);p.before(h)});
 /* tints: stronger, because multiply darkens rather than covers */
 g.querySelectorAll(".ps-tint").forEach(t=>{if(t._gf)return;t._gf=1;const st=t.getAttribute("style")||"";t.setAttribute("style",st.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/,(m,r,gg,b,a)=>"rgba("+r+","+gg+","+b+","+Math.min(.85,(+a)*1.3).toFixed(2)+")"))});
}
/* keep the hatch about 9 screen pixels apart whatever the zoom */
function hatchSize(svg){const vb=svg.viewBox&&svg.viewBox.baseVal,w=svg.clientWidth||svg.getBoundingClientRect().width;if(!vb||!vb.width||!w)return;const u=9*vb.width/w;
 svg.querySelectorAll("#gfHatchDefs pattern").forEach(P=>{if(Math.abs((+P.getAttribute("width"))-u)<u*.05)return;P.setAttribute("width",u);P.setAttribute("height",u);const r=P.querySelector("rect"),l=P.querySelector("line");r.setAttribute("width",u);r.setAttribute("height",u);l.setAttribute("x1",u/2);l.setAttribute("x2",u/2);l.setAttribute("y2",u);l.style.setProperty("stroke-width",(u*.3)+"px","important")})}
if(typeof psPlacePins==="function"){const _pp=psPlacePins;psPlacePins=function(){const r=_pp.apply(this,arguments);try{const svg=ps&&ps.wrap&&ps.wrap.querySelector("svg");if(svg&&svg.querySelector("#gfHatchDefs"))hatchSize(svg)}catch(e){}return r}}
/* the first number in the card's headline line counts up when a stop opens */
function countUp(){const el=document.querySelector(".ps-card .ps-stat");if(!el||el._gfc===el.textContent)return;const txt=el.textContent,m=txt.match(/(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)/);el._gfc=txt;if(!m||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 const raw=m[1],val=parseFloat(raw.replace(/,/g,"")),dec=(raw.split(".")[1]||"").length,comma=raw.includes(",");if(!(val>=10)||/^(1[5-9]|20)\d\d$/.test(raw))return;/* years stay as they are */
 const pre=txt.slice(0,m.index),post=txt.slice(m.index+raw.length),t0=performance.now(),D=900,fmt=v=>{const s=v.toFixed(dec);return comma?Number(s).toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec}):s};
 const f=n=>{if(!el.isConnected)return;const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3);el.textContent=pre+fmt(val*e)+post;if(k<1)requestAnimationFrame(f);else{el.textContent=txt;el._gfc=txt}};requestAnimationFrame(f)}
if(typeof psGo==="function"){const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);try{setTimeout(countUp,60)}catch(e){}return r}}
const _d=psDrawFlat;psDrawFlat=function(){const r=_d.apply(this,arguments);try{enhance()}catch(e){console.error(e)}return r};
const css=document.createElement("style");css.textContent=`
#psLayer .gf-casing path{ fill:none !important; vector-effect:non-scaling-stroke !important; stroke-linejoin:round !important; stroke-linecap:round !important; }
#psLayer .gf-cs-shadow{ stroke:rgba(5,12,30,.38) !important; stroke-width:9px !important; }
#psLayer .gf-cs-line{ stroke:#fff !important; stroke-width:3.6px !important; }
#psLayer .ps-tint{ mix-blend-mode:multiply; }
#psLayer path.ps-shade{ stroke:#1d4fae !important; stroke-width:2.2px !important; stroke-dasharray:none !important; }
#psLayer path.ps-forest{ stroke:#1f6b34 !important; stroke-width:2.2px !important; stroke-dasharray:none !important; }
#psLayer path.ps-grass{ filter:none !important; }
#psLayer .gf-halo{ fill:none !important; stroke:rgba(255,255,255,.9) !important; stroke-width:5.5px !important; vector-effect:non-scaling-stroke !important; stroke-linejoin:round !important; }
#psLayer.gf-reveal .ps-dim{ animation:gfDimIn .5s ease var(--gfel,0s) both; }
#psLayer.gf-reveal .ps-tint, #psLayer.gf-reveal .ps-shade, #psLayer.gf-reveal .ps-forest, #psLayer.gf-reveal .ps-grass, #psLayer.gf-reveal .gf-halo{ animation:gfFadeIn .7s ease calc(.1s + var(--gfel,0s)) both; }
#psLayer.gf-reveal .gf-casing{ animation:gfCaseIn .8s cubic-bezier(.2,.8,.2,1) calc(.15s + var(--gfel,0s)) both; }
@keyframes gfHoleIn{ from{ opacity:0 } to{ opacity:1 } }
@keyframes gfDimIn{ from{ opacity:0 } to{ opacity:1 } }
@keyframes gfFadeIn{ from{ opacity:0 } to{ opacity:1 } }
@keyframes gfCaseIn{ 0%{ opacity:0 } 60%{ opacity:1 } 100%{ opacity:1 } }
@media (prefers-reduced-motion:reduce){ #psLayer.gf-reveal *{ animation:none !important; } }`;
document.head.appendChild(css);
window.gfHighlight={smooth};
})();
