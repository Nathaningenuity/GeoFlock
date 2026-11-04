/* GeoFlock: small places on every tour (the user's standing rules, applied everywhere except the Geography tour).
   1. A pin on a small territory (a delta, reef, lake, island, patch, swamp, forest, crater...) is a big circle around the
      place, and the photo's or label's line ends at the circle's edge: no pointed line into it, no dot on it.
   2. Photos and labels keep their distance: they sit well clear of the circle (or of the dot, for a city), never on it.
   3. Two photo pins of the same place on one stop: only the first is kept.
   Load after every other tour patch: its wrappers must be the outermost. */
(function(){
"use strict";
const TERR=/\b(delta|sundarbans|mangroves?|reefs?|atolls?|patch|plastic|wetlands?|swamps?|marsh(es)?|pantanal|salar|caldera|crater|sinkhole|everglades|okavango|uyuni|salt lakes?|salt (flat|pan)s?|lake eyre|kati thanda)\b/i;
/* where the circle goes for well-known small places (the place's middle, and a size that surrounds it) */
const CENTRE=[[/okavango/i,[22.85,-19.25],150],[/sundarbans/i,[89.25,21.95],95],[/nile delta/i,[31.0,30.85],110],[/uyuni/i,[-67.55,-20.2],80],[/lake eyre|kati thanda/i,[137.3,-28.45],90]];
const SKIP=new Set(["geo"]);
const strip=s=>String(s==null?"":s).replace(/​/g,"");
const lab=p=>Array.isArray(p)?p[1]:(p&&p.label);
const at=p=>Array.isArray(p)?p[0]:(p&&p.at);
const isPt=a=>Array.isArray(a)&&a.length===2&&typeof a[0]==="number";
function viewKm(S){const v=S.flatView||S.view||[-180,-60,180,80],mid=(v[1]+v[3])/2;return Math.abs(v[2]-v[0])*111.32*Math.max(.2,Math.cos(mid*Math.PI/180))}
function km(a,b){const R=Math.PI/180,x=(b[0]-a[0])*Math.cos((a[1]+b[1])/2*R),y=b[1]-a[1];return Math.hypot(x,y)*111.32}
const WORD=/[a-zà-ÿ]{5,}/gi,GENERIC=new Set(["about","years","water","river","there","where","their","world","floodwater","photo"]);
const words=s=>new Set((strip(s).toLowerCase().match(WORD)||[]).filter(w=>!GENERIC.has(w)));
function sameThing(a,b){const A=words(a);for(const w of words(b))if(A.has(w))return true;return false}

function prep(S){try{
 if(!S||typeof ps==="undefined"||!ps||SKIP.has(ps.tour))return;
 const P=Array.isArray(S.phPins)?S.phPins:[],T=Array.isArray(S.pins)?S.pins:[];
 if(S._gfSm&&S._gfSm.P===P&&S._gfSm.T===T)return;
 const vk=viewKm(S),rk=Math.max(15,Math.min(260,vk*.07)),near=Math.max(80,vk*.15);
 /* 3: duplicates */
 /* the same picture twice on one stop: keep the first (a different photo of the same place stays, under its own name) */
 const pic=q=>{try{const P=typeof psSqPhoto==="function"?psSqPhoto(q):null;return P&&P.d||null}catch(e){return null}};
 const capOf=q=>{const l=strip(q.label),c=(window.GF_PHCAP&&(GF_PHCAP[l]||GF_PHCAP[q.label]))||l;return shortCap(c).toLowerCase().replace(/^the\s+/,"")};
 const keep=[];P.forEach(q=>{if(!q||!isPt(q.at))return;const d=pic(q),c=capOf(q);if(keep.some(k=>(d&&pic(k)===d)||(capOf(k)===c&&km(k.at,q.at)<near)))return;keep.push(q)});
 let P2=keep;
 /* text pins that only repeat a photo pin's place */
 let T2=T.filter(p=>{const a=at(p);if(!isPt(a)||(Array.isArray(p)&&p[2]&&p[2]!=="point"))return true;return!P2.some(q=>km(q.at,a)<near*.6&&sameThing(q.label,lab(p)))});
 /* 1: rings */
 const circles=[];const addC=(a,r)=>{if(!circles.some(c=>km(c[0],a)<r*.8))circles.push([a,r])};
 const share=a=>circles.find(c=>km(c[0],a)<c[1]*2);
 P2=P2.map(q=>{if(q.ringKm){addC(q.at,q.ringKm);return q}if(!TERR.test(strip(q.label)))return q;
  const C=CENTRE.find(c=>c[0].test(strip(q.label)));if(C){const ex=share(C[1]);if(ex)return Object.assign({},q,{at:ex[0],ringKm:ex[1]});const r2=Math.max(rk,C[2]);addC(C[1],r2);return Object.assign({},q,{at:C[1],ringKm:r2})}
  const c=share(q.at);if(c)return Object.assign({},q,{at:c[0],ringKm:c[1]});const n=Object.assign({},q,{ringKm:rk});addC(q.at,rk);return n});
 /* a photo of something inside a ringed place (the tiger in the Sundarbans) shares that circle */
 P2=P2.map(q=>{if(q.ringKm)return q;const c=circles.find(c=>km(c[0],q.at)<c[1]*1.1);return c?Object.assign({},q,{at:c[0],ringKm:c[1]}):q});
 /* a text label on a small place (a salt lake, a delta...) gets the circle too; other labels keep plain lines */
 T2=T2.map(p=>{if(!Array.isArray(p)||!TERR.test(strip(p[1])))return p;let a=at(p);
  /* an "area" label on a small place becomes a ringed point in its middle */
  if(p[2]==="area"&&Array.isArray(a)&&a.length===2&&isPt(a[0])&&isPt(a[1])){a=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];p=[a,p[1],"point"]}
  if(!isPt(a)||(p[2]&&p[2]!=="point"))return p;
  const C=CENTRE.find(c=>c[0].test(strip(p[1])));const n=p.slice();if(C){n[0]=C[1];n._gfRk=Math.max(rk,C[2])}else n._gfRk=rk;addC(n[0],n._gfRk);return n});
 const L=Array.isArray(S.lines)?S.lines:[];const have=L.filter(l=>l&&l.circle).map(l=>[l.circle,l.km||0]);
 const add=circles.filter(c=>!have.some(h=>km(h[0],c[0])<Math.max(c[1],h[1])*.8)).map(c=>({circle:c[0],km:c[1],kind:"outline",_gfSm:1}));
 const set=(k,v)=>{try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{S[k]=v}catch(x){}}};
 if(P2.length!==P.length||P2.some((q,i)=>q!==P[i]))set("phPins",P2);
 if(T2.length!==T.length||T2.some((p,i)=>p!==T[i]))set("pins",T2);
 if(add.length)set("lines",L.concat(add));
 S._gfSm={P:S.phPins||P,T:S.pins||T};
}catch(e){console.error("smallplaces",e)}}
const cur=()=>{try{return typeof ps!=="undefined"&&ps?psSteps()[ps.i]:null}catch(e){return null}};
const STOPW=new Set(["of","the","in","a","an","and","to","for","at","on","by","from","with","hardly","most","still","now","is","are","was","were","its","their","one","once","where","when","that","who","not","than","more","less","over","under","about","into","up"]);
function shortCap(t){t=strip(t).replace(/\u2026|\.\.\.$/g,"").trim();let seg=t.split(/\s*[:;,(–—]\s*|\s+-\s+/)[0].trim().replace(/^the\s+/i,"");
 if(seg.length<=20)return seg.charAt(0).toUpperCase()+seg.slice(1);const w=seg.split(/\s+/),out=[];
 for(const x of w){if((out.join(" ")+" "+x).trim().length>20)break;out.push(x)}
 while(out.length>1&&STOPW.has(out[out.length-1].toLowerCase()))out.pop();const r=out.join(" ")||w[0];return r.charAt(0).toUpperCase()+r.slice(1)}
/* a tiny island (a land piece under TINY_KM2), or no land outline at all there: a line points at it, not into it, with no
   dot on it. Returns the place's radius in km (6 when the map has no outline for it), or null for a bigger place. */
const TINY_KM2=5000,tinyMemo=new Map();
function tinyKm(ll){if(!isPt(ll))return null;const key=ll[0].toFixed(3)+","+ll[1].toFixed(3);if(tinyMemo.has(key))return tinyMemo.get(key);
 let F=null;try{F=typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.features}catch(e){}if(!F||!F.length)return null;
 let out=6;try{outer:for(const f of F){const g=f.geometry;if(!g)continue;const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
  for(const c of polys){const piece={type:"Polygon",coordinates:c};if(d3.geoContains(piece,ll)){const A=d3.geoArea(piece)*6371*6371;out=A<TINY_KM2?Math.max(1.5,Math.sqrt(A/Math.PI)):null;break outer}}}}catch(e){out=null}
 tinyMemo.set(key,out);return out}
function tinyPx(ll){const k=tinyKm(ll);return k==null?null:Math.max(3,ringPx(ll,k))+6}
function ringPx(a,k){try{const p=psScreen(a),q=psScreen([a[0]+k/(111.32*Math.cos(a[1]*Math.PI/180)),a[1]]);return p&&q?Math.hypot(q[0]-p[0],q[1]-p[1]):0}catch(e){return 0}}

function install(){
 if(typeof psPhPinsSync!=="function"||typeof psLayout!=="function"||typeof psLeaders!=="function"||typeof psGo!=="function")return false;
 if(psPhPinsSync._gfSm)return true;
 /* the stop is prepared before it is drawn */
 const _go=psGo;psGo=function(i){try{const st=psSteps(),S=st&&st[Math.max(0,Math.min(st.length-1,i|0))];if(typeof ps!=="undefined"&&ps)prep(S)}catch(e){}return _go.apply(this,arguments)};
 /* 2: photos keep their distance; ring pins: the line starts at the circle's edge */
 const _ph=psPhPinsSync;psPhPinsSync=function(){const S=cur();prep(S);const r=_ph.apply(this,arguments);
  try{if(!S||SKIP.has(ps.tour))return r;const box=psContainer&&psContainer(),L=box&&box.querySelector(".ps-phpins");if(!L)return r;
   const P=S.phPins||[],bw=box.clientWidth,bh=box.clientHeight,br=box.getBoundingClientRect();
   const cr=ps.card?ps.card.getBoundingClientRect():null,card=cr&&cr.width?{l:cr.left-br.left-6,r:cr.right-br.left+6,t:cr.top-br.top-6,b:cr.bottom-br.top+6}:null;
   const els=[...L.querySelectorAll(".ps-sq")];let lines="";const placed=[];
   els.forEach((el,k)=>{const q=P[k];if(!q||el.style.display==="none")return;const a=psScreen(q.at);if(!a)return;
    const w=el.offsetWidth||62,h=el.offsetHeight||80,R=q.ringKm?ringPx(q.at,q.ringKm):0;
    let x=parseFloat(el.style.left),y=parseFloat(el.style.top);if(!isFinite(x)||!isFinite(y))return;
    const edge=(X,Y)=>Math.hypot(Math.max(0,Math.abs(X-a[0])-w/2),Math.max(0,Math.abs(Y-a[1])-h/2));
    let dx=x-a[0],dy=y-a[1],d=Math.hypot(dx,dy);const G=R+52;
    if(edge(x,y)<G){const need=d+(G-edge(x,y))+4;if(d<1){dx=a[0]<bw/2?1:-1;dy=-.6;d=Math.hypot(dx,dy)}
     const hit=(X,Y)=>(card&&X+w/2>card.l&&X-w/2<card.r&&Y+h/2>card.t&&Y-h/2<card.b)||placed.some(p=>Math.abs(p[0]-X)<w+6&&Math.abs(p[1]-Y)<h+6)||X<w/2+4||X>bw-w/2-4||Y<h/2+4||Y>bh-h/2-4;
     const base=Math.atan2(dy,dx);let best=null;
     for(const off of [0,.5,-.5,1,-1,1.6,-1.6,2.3,-2.3,Math.PI]){const t=base+off;let X=a[0]+Math.cos(t)*need,Y=a[1]+Math.sin(t)*need;for(let n=0;n<6&&edge(X,Y)<G;n++){X+=Math.cos(t)*12;Y+=Math.sin(t)*12}if(!hit(X,Y)){best=[X,Y];break}}
     if(!best)best=[Math.max(w/2+4,Math.min(bw-w/2-4,a[0]+dx/d*need)),Math.max(h/2+4,Math.min(bh-h/2-4,a[1]+dy/d*need))];
     x=best[0];y=best[1];el.style.left=x+"px";el.style.top=y+"px"}
    placed.push([x,y]);
    const ux=(x-a[0]),uy=(y-a[1]),ud=Math.hypot(ux,uy)||1;
    if(R){lines+=`<line x1="${(a[0]+ux/ud*(R+1)).toFixed(1)}" y1="${(a[1]+uy/ud*(R+1)).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`}
    else if(tinyPx(q.at)!=null){const g=Math.min(ud-4,tinyPx(q.at));if(g<ud-6)lines+=`<line x1="${(a[0]+ux/ud*g).toFixed(1)}" y1="${(a[1]+uy/ud*g).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`}
    else{lines+=`<line x1="${(a[0]+ux/ud*6).toFixed(1)}" y1="${(a[1]+uy/ud*6).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><circle class="ps-dot2" cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="3.4"/>`}});
   const svg=L.querySelector("svg.ps-sq-lead");if(svg)svg.innerHTML=lines;
   /* captions short enough to read in full on the map; the whole name stays in the tooltip and the opened photo */
   const used=new Set(els.map(el=>{const sp=el.querySelector("span");return sp&&sp.textContent.length<=22?sp.textContent.toLowerCase():null}).filter(Boolean));
   els.forEach(el=>{const sp=el.querySelector("span");if(!sp)return;const t=sp.textContent;if(t.length<=22||sp._gfShort===t)return;let n=shortCap(t);
    if(used.has(n.toLowerCase())){const parts=strip(t).split(/\s*:\s*/);if(parts.length>1){const m=shortCap(parts.slice(1).join(" "));n=m&&!used.has(m.toLowerCase())?m+", "+n:n}}used.add(n.toLowerCase());if(n&&n!==t){if(!el.title||el.title.indexOf(t)<0)el.title=t;sp.textContent=n;sp._gfShort=n}})
  }catch(e){console.error("smallplaces ph",e)}return r};
 psPhPinsSync._gfSm=1;
 /* 2: text labels keep their distance from their place (and from its circle) */
 const _lay=psLayout;psLayout=function(cands,pins,sizes,W,H,blocks){const S=cur();prep(S);const r=_lay.apply(this,arguments);
  try{if(!S||SKIP.has(ps.tour)||!Array.isArray(r))return r;
   const TS=(S.pins||[]).filter(p=>Array.isArray(p)&&isPt(p[0])&&(!p[2]||p[2]==="point"||p[2]==="ring")).map(p=>[p,psScreen(p[0])]).filter(x=>x[1]);
   r.forEach(q=>{if(!q||q.ax==null)return;const m=TS.find(x=>Math.hypot(x[1][0]-q.ax,x[1][1]-q.ay)<3);if(!m)return;const p=m[0];
    const R=p&&p._gfRk?ringPx(p[0],p._gfRk):0,cx=q.x+q.w/2,cy=q.y+q.h/2,G=R+48;
    const edge=(X,Y)=>Math.hypot(Math.max(0,Math.abs(X-q.ax)-q.w/2),Math.max(0,Math.abs(Y-q.ay)-q.h/2));
    if(edge(cx,cy)>=G)return;let dx=cx-q.ax,dy=cy-q.ay,d=Math.hypot(dx,dy);if(d<1){dx=q.ax<W/2?1:-1;dy=-.5;d=Math.hypot(dx,dy)}
    let ux=dx/d,uy=dy/d,CX=cx,CY=cy;for(let n=0;n<40&&edge(CX,CY)<G;n++){CX+=ux*8;CY+=uy*8}
    let X=CX-q.w/2,Y=CY-q.h/2;X=Math.max(4,Math.min(W-q.w-4,X));Y=Math.max(4,Math.min(H-q.h-4,Y));
    q.x=X;q.y=Y;q.ex=Math.max(q.x,Math.min(q.x+q.w,q.ax));q.ey=Math.max(q.y,Math.min(q.y+q.h,q.ay));q.gap=Math.max(q.gap||0,9)})}catch(e){console.error("smallplaces lay",e)}return r};
 /* 1: a ringed text pin: no dot, its line ends at the circle */
 const _ld=psLeaders;psLeaders=function(pinsEl,rects){const r=_ld.apply(this,arguments);
  try{const S=cur();if(!S||SKIP.has(ps.tour))return r;const svg=pinsEl.querySelector(".ps-leaders");if(!svg)return r;
   const rk=(S.pins||[]).filter(p=>p&&p._gfRk).map(p=>{const a=psScreen(at(p));return a?[a[0],a[1],ringPx(at(p),p._gfRk)]:null}).filter(Boolean);
   /* text pins on a tiny island: the same, with the island's own size as the circle */
   (S.pins||[]).forEach(p=>{if(!p||p._gfRk||!Array.isArray(p)||(p[2]&&p[2]!=="point"))return;const ll=at(p),t=tinyPx(ll);if(t==null)return;const a=psScreen(ll);if(a)rk.push([a[0],a[1],t-1])});
   if(!rk.length)return r;
   svg.querySelectorAll("circle").forEach(c=>{const x=+c.getAttribute("cx"),y=+c.getAttribute("cy"),k=rk.find(k=>Math.hypot(k[0]-x,k[1]-y)<2);if(k)c.style.display="none"});
   svg.querySelectorAll("line").forEach(l=>{const x=+l.getAttribute("x1"),y=+l.getAttribute("y1"),k=rk.find(k=>Math.hypot(k[0]-x,k[1]-y)<2);if(!k)return;
    const x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),d=Math.hypot(x2-x,y2-y),R=k[2]+1;
    if(d>R+2){l.setAttribute("x1",(x+(x2-x)/d*R).toFixed(1));l.setAttribute("y1",(y+(y2-y)/d*R).toFixed(1))}else l.style.display="none"})}catch(e){console.error("smallplaces ld",e)}return r};
 return true}
const boot=()=>{let n=0;const t=setInterval(()=>{if(install()||++n>60)clearInterval(t)},500)};
/* after every other patch has wrapped these functions */
if(document.readyState==="complete")setTimeout(boot,14000);else addEventListener("load",()=>setTimeout(boot,14000));
})();
