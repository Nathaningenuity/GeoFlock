/* GeoFlock: AP Human Geography course, the "plus" layer (core).
   - A shared game kit (window.HGX) for the course's map games: an atlas in the lab window (d3, the app's own country
     shapes from projFeatures(), zoom and pan, click a country or any spot), the country data the maps already hold
     (population, GDP, HDI, fertility, median age, life expectancy, cities, farming jobs, religion, language family,
     driving side, EU/NATO), and four game engines that many games share:
       hunt   – "click the place": score by the distance from the real spot (sacred sites, choke points, hearths…)
       pick   – "click a country that…": checked against the data, the answer explained
       paint  – "paint the map": colour countries with a palette, checked country by country
       mission – a game card on the live Maps page, so the toolkit (ruler, compass, thermometer) and the real map layers
                 can be used to answer
     plus the round header, the result card (stars, best score, play again, next activity).
   - The course page: each unit becomes a path of chapters (a tour, then the games that practise it), then a
     "check your understanding" block; games get their own icon; the lab window widens for map games.
   - Unit text revised (blurbs, a "big idea" and skills line per unit), a few facts updated to 2026.
   The games themselves are in geoflock-hug-games-*.js. Loads after index.html's HUG / HUG_LAB code. */
(function(){
"use strict";
if(window.HGX||typeof HUG==="undefined"||typeof HUG_LAB==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const R_KM=6371;
const km=(a,b)=>d3.geoDistance(a,b)*R_KM;
const fmt=n=>Math.round(n).toLocaleString("en-US");
const night=()=>!document.body.classList.contains("light-theme");

/* ================= data the maps already hold ================= */
const TH=k=>{try{return TH_THEMES[k]}catch(e){return null}};
const num=(k,c)=>{const T=TH(k);if(!T)return null;if(T.grad&&T.grad.vals&&T.grad.vals[c]!=null)return +T.grad.vals[c];const s=T.info&&T.info[c];if(!s)return null;const m=String(s).replace(/,/g,"").match(/-?\d+(\.\d+)?/);return m?+m[0]:null};
const cat=(k,c)=>{const T=TH(k);return T&&T.data?T.data[c]||null:null};
let FEATS=null,BYC=null;
function feats(){if(FEATS)return FEATS;let raw=[];try{raw=projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c)}catch(e){}
 /* a code can have more than one shape (Australia and Ashmore Reef, Somalia and Somaliland, Cyprus): merge them, the biggest first */
 const by={};raw.forEach(f=>{(by[f.properties.c]=by[f.properties.c]||[]).push(f)});FEATS=[];BYC={};
 Object.keys(by).forEach(c=>{let L=by[c];let f=L[0];if(L.length>1){L=L.slice().sort((a,b)=>d3.geoArea(b)-d3.geoArea(a));const polys=[];L.forEach(x=>{const g=x.geometry;if(g.type==="Polygon")polys.push(g.coordinates);else if(g.type==="MultiPolygon")polys.push(...g.coordinates)});f={type:"Feature",id:L[0].id,properties:L[0].properties,geometry:{type:"MultiPolygon",coordinates:polys}}}FEATS.push(f);BYC[c]=f});return FEATS}
const feat=c=>{feats();return BYC[c]||null};
const AREA={};
const D={
 name(c){try{const x=COUNTRY_BY_CODE[c];if(x)return x.n}catch(e){}const f=feat(c);return f?f.properties.n:String(c).toUpperCase()},
 pop(c){try{return COUNTRY_POPULATION[c]||null}catch(e){return null}},
 gdp(c){try{const g=COUNTRY_GDP[c];return g?g*1e6:null}catch(e){return null}},
 gdppc(c){const g=D.gdp(c),p=D.pop(c);return g&&p?g/p:null},
 hdi:c=>num("hdi",c),fert:c=>num("fert",c),age:c=>num("age",c),life:c=>num("life",c),urban:c=>num("urban",c),farm:c=>num("farm",c),mig:c=>num("mig",c),
 rel:c=>cat("rel",c),lang:c=>cat("lang",c),drive:c=>cat("drive",c),clubs:c=>cat("clubs",c),gov:c=>cat("gov",c),cw:c=>cat("cw",c),
 /* land area from the outline, in km² (the outlines are generalised, so a few per cent off) */
 area(c){if(AREA[c]!=null)return AREA[c];const f=feat(c);return AREA[c]=f?d3.geoArea(f)*R_KM*R_KM:null},
 dens(c){const p=D.pop(c),a=D.area(c);return p&&a?p/a:null},
 cats:k=>{const T=TH(k);return T&&T.cats||[]},
 info:(k,c)=>{const T=TH(k);return T&&T.info&&T.info[c]||""},
 has:c=>!!feat(c),
 codes(){return feats().map(f=>f.properties.c)}
};

/* ================= stats ================= */
const ST=()=>{try{stats.hgx=stats.hgx||{};return stats.hgx}catch(e){return{}}};
const save=()=>{try{saveStats()}catch(e){}};

/* ================= the atlas ================= */
const NS="http://www.w3.org/2000/svg";
function atlas(host,o){
 o=o||{};feats();
 const merc=o.proj==="merc",eq=o.proj==="eq";
 const W=o.w||960,H=o.h||(merc?640:eq?480:500);
 const P=merc?d3.geoMercator():eq?d3.geoEquirectangular():d3.geoNaturalEarth1();
 if(merc)P.fitExtent([[0,0],[W,H]],{type:"MultiPoint",coordinates:[[-180,-60],[180,80]]});else P.fitExtent([[6,6],[W-6,H-6]],{type:"Sphere"});
 const path=d3.geoPath(P);
 const list=FEATS.filter(f=>o.aq||f.properties.c!=="aq");
 const wrap=document.createElement("div");wrap.className="hgx-atlas"+(o.cls?" "+o.cls:"");
 const el=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e};
 const svg=el("svg",{viewBox:"0 0 "+W+" "+H,class:"hgx-map",role:"img"},wrap);
 const uid="a"+Math.random().toString(36).slice(2,7);
 const defs=el("defs",{},svg);const mk=el("marker",{id:uid+"ar",viewBox:"0 0 10 10",refX:8,refY:5,markerWidth:5,markerHeight:5,orient:"auto-start-reverse"},defs);el("path",{d:"M0,0L10,5L0,10z",class:"hgx-arhead"},mk);
 const Z=el("g",{class:"hgx-z"},svg);
 if(merc)el("rect",{class:"hgx-sea",x:-W,y:-H,width:W*3,height:H*3},Z);else el("path",{class:"hgx-sea",d:path({type:"Sphere"})},Z);
 if(o.grat!==false){const g=o.grat==="fine"?d3.geoGraticule().step([10,10]):d3.geoGraticule().step([30,30]);el("path",{class:"hgx-grat",d:path(g())},Z)}
 const bgL=el("g",{class:"hgx-bg"},Z),land=el("g",{class:"hgx-land"},Z);
 const PATHS={};
 list.forEach(f=>{const d=path(f);if(!d)return;PATHS[f.properties.c]=el("path",{d,"data-c":f.properties.c,class:"hgx-c"},land)});
 const ov=el("g",{class:"hgx-ov"},Z),pt=el("g",{class:"hgx-pt"},Z),lab=el("g",{class:"hgx-lab"},Z);
 if(o.gratLabels){const gl=el("g",{class:"hgx-gl"},Z);const tx=(x,y,t)=>{const e=el("text",{x,y},gl);e.textContent=t};for(let la=-60;la<=60;la+=30){const q=P([-178,la]);if(q)tx(q[0]+3,q[1]-2,la===0?"0° Equator":Math.abs(la)+"°"+(la>0?"N":"S"))}
  for(let lo=-150;lo<180;lo+=30){const q=P([lo,-56]);if(q)tx(q[0]+2,q[1],lo===0?"0° Greenwich":Math.abs(lo)+"°"+(lo>0?"E":"W"))}}
 /* pan and zoom: t = {x,y,k}, screen = t.k*p + t */
 const maxK=o.maxZoom||24;let t={x:0,y:0,k:1},anim=0;
 const clampT=q=>{const k=clamp(q.k,1,maxK);const x=clamp(q.x,W-W*k-W*.1*k,W*.1*k),y=clamp(q.y,H-H*k-H*.1*k,H*.1*k);return{x,y,k}};
 const apply=()=>{Z.setAttribute("transform","translate("+t.x+","+t.y+") scale("+t.k+")");rescale();if(A.onZoom)try{A.onZoom(t.k)}catch(x){}};
 const setT=(q,ms)=>{q=clampT(q);cancelAnimationFrame(anim);if(!ms||matchMedia("(prefers-reduced-motion: reduce)").matches){t=q;apply();return}const a=t,t0=performance.now();
  const step=now=>{const u=Math.min(1,(now-t0)/ms),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;const lk=Math.log(a.k)+(Math.log(q.k)-Math.log(a.k))*e;const k=Math.exp(lk);
   /* interpolate the view centre so the zoom looks straight */const ca=[(W/2-a.x)/a.k,(H/2-a.y)/a.k],cb=[(W/2-q.x)/q.k,(H/2-q.y)/q.k];const cx=ca[0]+(cb[0]-ca[0])*e,cy=ca[1]+(cb[1]-ca[1])*e;
   t={x:W/2-k*cx,y:H/2-k*cy,k};apply();if(u<1)anim=requestAnimationFrame(step)};anim=requestAnimationFrame(step)};
 const toSvg=(cx,cy)=>{const r=svg.getBoundingClientRect();return[(cx-r.left)*W/r.width,(cy-r.top)*H/r.height]};
 const toMap=(cx,cy)=>{const q=toSvg(cx,cy);return[(q[0]-t.x)/t.k,(q[1]-t.y)/t.k]};
 const zoomAt=(sx,sy,f)=>{const k=clamp(t.k*f,1,maxK);const mx=(sx-t.x)/t.k,my=(sy-t.y)/t.k;setT({x:sx-k*mx,y:sy-k*my,k})};
 const ptrs=new Map();let pan=null,pinch=null,moved=false,downAt=null;
 if(o.zoom!==false){
  svg.addEventListener("wheel",e=>{e.preventDefault();const q=toSvg(e.clientX,e.clientY);zoomAt(q[0],q[1],Math.exp(-e.deltaY*(e.deltaMode?0.05:0.0022)))},{passive:false});
  svg.addEventListener("dblclick",e=>{const q=toSvg(e.clientX,e.clientY);zoomAt(q[0],q[1],2)});
 }
 svg.addEventListener("pointerdown",e=>{if(A.grab&&A.grab(e))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);try{svg.setPointerCapture(e.pointerId)}catch(x){}
  if(ptrs.size===1){downAt=[e.clientX,e.clientY];moved=false;pan={sx:e.clientX,sy:e.clientY,t:{...t}}}
  else if(ptrs.size===2&&o.zoom!==false){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),t:{...t},c:toSvg((a[0]+b[0])/2,(a[1]+b[1])/2)};pan=null;moved=true}});
 svg.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()];const f=Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d;const k=clamp(pinch.t.k*f,1,maxK);const mx=(pinch.c[0]-pinch.t.x)/pinch.t.k,my=(pinch.c[1]-pinch.t.y)/pinch.t.k;setT({x:pinch.c[0]-k*mx,y:pinch.c[1]-k*my,k});return}
  if(pan&&o.zoom!==false){const dx=e.clientX-pan.sx,dy=e.clientY-pan.sy;if(Math.hypot(dx,dy)>5)moved=true;if(moved){const r=svg.getBoundingClientRect(),s=W/r.width;setT({x:pan.t.x+dx*s,y:pan.t.y+dy*s,k:pan.t.k})}}});
 const up=e=>{if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size){pan=null;
   if(!moved&&downAt&&e.type==="pointerup"&&A.onClick){const tg=document.elementFromPoint(e.clientX,e.clientY);const c=tg&&tg.closest&&tg.closest("[data-c]");try{A.onClick(c&&wrap.contains(c)?c.dataset.c:null,A.llAt(e.clientX,e.clientY),e)}catch(x){console.error(x)}}downAt=null}};
 svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
 function rescale(){const s=1/Math.pow(t.k,.85);pt.querySelectorAll(".hgx-mk").forEach(g=>g.setAttribute("transform","translate("+g.dataset.x+","+g.dataset.y+") scale("+s+")"));
  lab.querySelectorAll("text").forEach(x=>{x.setAttribute("font-size",(+x.dataset.fs||13)*s);x.setAttribute("stroke-width",3*s)})}
 /* tooltip */
 const tip=document.createElement("div");tip.className="hgx-tip";tip.hidden=true;wrap.appendChild(tip);
 svg.addEventListener("pointermove",e=>{if(!A.hoverText||ptrs.size&&moved){tip.hidden=true;return}const tg=e.target.closest&&e.target.closest("[data-c]");const s=tg?A.hoverText(tg.dataset.c):null;if(!s){tip.hidden=true;return}
  const r=wrap.getBoundingClientRect();tip.innerHTML=s;tip.hidden=false;let x=e.clientX-r.left+12,y=e.clientY-r.top+12;if(x>r.width-170)x=e.clientX-r.left-170;tip.style.left=x+"px";tip.style.top=y+"px"});
 svg.addEventListener("pointerleave",()=>{tip.hidden=true});
 const A={wrap,svg,P,path,W,H,PATHS,Z,ov,
  get k(){return t.k},get t(){return t},
  llAt(cx,cy){const v=P.invert(toMap(cx,cy));return v&&isFinite(v[0])?v:null},
  ll(e){return A.llAt(e.clientX,e.clientY)},
  toMap,
  xy(ll){return P(ll)},
  fill(fn){for(const c in PATHS){const v=fn(c);PATHS[c].style.fill=v||"";}},
  cls(fn){for(const c in PATHS){const v=fn(c);PATHS[c].setAttribute("class","hgx-c"+(v?" "+v:""));}},
  setFill(c,v){if(PATHS[c])PATHS[c].style.fill=v||""},
  setCls(c,v){if(PATHS[c])PATHS[c].setAttribute("class","hgx-c"+(v?" "+v:""))},
  marker(ll,m){m=m||{};const q=P(ll);if(!q)return null;const g=el("g",{class:"hgx-mk "+(m.cls||"")},pt);g.dataset.x=q[0];g.dataset.y=q[1];
   if(m.ring)el("circle",{r:m.ring,class:"hgx-ring"},g);const d=el("circle",{r:m.r||6,class:"hgx-dot"},g);if(m.col)d.style.fill=m.col;
   if(m.text){const x=el("text",{x:(m.r||6)+4,y:4,class:"hgx-mt"},g);x.textContent=m.text}
   rescale();return g},
  label(ll,txt,m){m=m||{};const q=P(ll);if(!q)return;const x=el("text",{x:q[0],y:q[1],class:"hgx-lb "+(m.cls||""),"text-anchor":m.anchor||"middle"},lab);x.textContent=txt;x.dataset.fs=m.fs||13;rescale();return x},
  line(a,b,m){m=m||{};const d=path({type:"LineString",coordinates:m.via?[a,...m.via,b]:[a,b]});const p=el("path",{d:d||"",class:"hgx-line "+(m.cls||"")},ov);if(m.col)p.style.stroke=m.col;if(m.arrow)p.setAttribute("marker-end","url(#"+uid+"ar)");if(m.w)p.style.strokeWidth=m.w;return p},
  geo(g,m){m=m||{};const p=el("path",{d:path(g)||"",class:"hgx-geo "+(m.cls||"")},ov);if(m.col)p.style.stroke=m.col;if(m.fill)p.style.fill=m.fill;return p},
  bg(fn,step,box,op){step=step||o.bgStep||2;let h2="";const B=box||[[-180,-60],[180,84]];
   if(eq){/* an image, pixel by pixel: exact on the equirectangular grid */const cw=Math.round((B[1][0]-B[0][0])/step),ch=Math.round((B[1][1]-B[0][1])/step);const cv=document.createElement("canvas");cv.width=cw;cv.height=ch;const cx=cv.getContext("2d");const im=cx.createImageData(cw,ch);
    const rgb={};const parse=c=>{if(rgb[c])return rgb[c];const m=c.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);return rgb[c]=m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[200,200,200]};
    /* a land mask drawn with the same shapes, so only land is coloured */let mk=null;try{const mc=document.createElement("canvas");mc.width=cw;mc.height=ch;const mx=mc.getContext("2d",{willReadFrequently:true});const sc=cw/(2*Math.PI);
     const Pc=d3.geoEquirectangular().scale(sc*360/(B[1][0]-B[0][0])).translate([-B[0][0]*Math.PI/180*sc*360/(B[1][0]-B[0][0]),B[1][1]*Math.PI/180*sc*360/(B[1][0]-B[0][0])]);const gp=d3.geoPath(Pc,mx);mx.fillStyle="#000";list.forEach(f=>{mx.beginPath();gp(f);mx.fill()});mk=mx.getImageData(0,0,cw,ch).data}catch(e){mk=null}
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){if(mk&&!mk[(y*cw+x)*4+3])continue;const c=fn(B[0][0]+(x+.5)*step,B[1][1]-(y+.5)*step);if(!c)continue;const q=parse(c),k=(y*cw+x)*4;im.data[k]=q[0];im.data[k+1]=q[1];im.data[k+2]=q[2];im.data[k+3]=255}
    cx.putImageData(im,0,0);const a=P([B[0][0],B[1][1]]),b=P([B[1][0],B[0][1]]);bgL.innerHTML="";el("image",{href:cv.toDataURL(),x:a[0],y:a[1],width:b[0]-a[0],height:b[1]-a[1],preserveAspectRatio:"none",style:"image-rendering:pixelated",opacity:op||1},bgL);h2=null}
   if(h2!==null){
   for(let la=84;la>-60;la-=step)for(let lo=-180;lo<180;lo+=step){const c=fn(lo+step/2,la-step/2);if(!c)continue;const a=P([lo,la]),b=P([Math.min(179.999,lo+step),la-step]);if(!a||!b||b[0]<=a[0]||b[1]<=a[1])continue;h2+='<rect x="'+a[0].toFixed(1)+'" y="'+a[1].toFixed(1)+'" width="'+(b[0]-a[0]+.6).toFixed(1)+'" height="'+(b[1]-a[1]+.6).toFixed(1)+'" fill="'+c+'"/>'}
   bgL.innerHTML=h2}land.classList.add("hgx-onbg");
   },
  bgClear(){bgL.innerHTML="";land.classList.remove("hgx-onbg")},
  clear(which){(which==="pt"?[pt]:which==="ov"?[ov]:which==="lab"?[lab]:[pt,ov,lab]).forEach(g=>{g.innerHTML=""})},
  focusBox(b,ms){const pts=[];for(let i=0;i<=8;i++)for(let j=0;j<=8;j++)pts.push([b[0][0]+(b[1][0]-b[0][0])*i/8,b[0][1]+(b[1][1]-b[0][1])*j/8]);
   A.focusPx(path.bounds({type:"MultiPoint",coordinates:pts}),ms)},
  focusCodes(cs,ms,pad){const fs=cs.map(feat).filter(Boolean);if(!fs.length)return;
   let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;fs.forEach(f=>{const b=mainBounds(f);x0=Math.min(x0,b[0][0]);y0=Math.min(y0,b[0][1]);x1=Math.max(x1,b[1][0]);y1=Math.max(y1,b[1][1])});
   A.focusPx([[x0,y0],[x1,y1]],ms,pad)},
  focusPx(bb,ms,pad){pad=pad||1.25;const dx=Math.max(1,bb[1][0]-bb[0][0]),dy=Math.max(1,bb[1][1]-bb[0][1]);const kk=clamp(Math.min(W/(dx*pad),H/(dy*pad)),1,maxK);
   const cx=(bb[0][0]+bb[1][0])/2,cy=(bb[0][1]+bb[1][1])/2;setT({x:W/2-kk*cx,y:H/2-kk*cy,k:kk},ms===0?0:(ms||650))},
  reset(ms){setT({x:0,y:0,k:1},ms===0?0:(ms||500))},
  zoomBy(f){const k=clamp(t.k*f,1,maxK);const cx=(W/2-t.x)/t.k,cy=(H/2-t.y)/t.k;setT({x:W/2-k*cx,y:H/2-k*cy,k},300)},
  hoverText:o.names?c=>esc(D.name(c)):null,
  onClick:null,grab:null
 };
 function mainBounds(f){const g=f.geometry;if(g.type!=="MultiPolygon")return path.bounds(f);let best=null,ba=-1;g.coordinates.forEach(pl=>{const x={type:"Polygon",coordinates:pl};const a=d3.geoArea(x);if(a>ba){ba=a;best=x}});
  let b=path.bounds(best);const w=b[1][0]-b[0][0],hh=b[1][1]-b[0][1];g.coordinates.forEach(pl=>{const q=path.bounds({type:"Polygon",coordinates:pl});if(q[0][0]>b[0][0]-w*.6&&q[1][0]<b[1][0]+w*.6&&q[0][1]>b[0][1]-hh*.6&&q[1][1]<b[1][1]+hh*.6)b=[[Math.min(b[0][0],q[0][0]),Math.min(b[0][1],q[0][1])],[Math.max(b[1][0],q[1][0]),Math.max(b[1][1],q[1][1])]]});return b}
 if(o.zoom!==false){const zb=document.createElement("div");zb.className="hgx-zb";zb.innerHTML='<button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="home" aria-label="Whole map">⟲</button>';
  zb.onclick=e=>{const b2=e.target.closest("[data-z]");if(!b2)return;e.stopPropagation();if(b2.dataset.z==="in")A.zoomBy(1.6);else if(b2.dataset.z==="out")A.zoomBy(1/1.6);else if(A.home)A.home();else A.reset()};wrap.appendChild(zb)}
 if(host)host.appendChild(wrap);
 return A;
}

/* ================= UI pieces ================= */
function hud(el,o){/* the round bar; returns an updater */
 const bar=document.createElement("div");bar.className="hgx-hud";el.appendChild(bar);
 const set=(r,n,s,extra)=>{bar.innerHTML='<span class="hgx-r">'+(n?'Round <b>'+Math.min(r,n)+'</b> of '+n:'')+'</span><span class="hgx-dots">'+(n?Array.from({length:n},(_,i)=>'<i class="'+(i<(o&&o.res?o.res.length:0)?(o.res[i]>=.8?"g":o.res[i]>=.4?"m":"b"):i===r-1?"c":"")+'"></i>').join(""):"")+'</span><span class="hgx-s">'+(extra||"")+'Score <b>'+fmt(s)+'</b></span>'};
 return{el:bar,set}}
function stars(f){const n=f>=.85?3:f>=.6?2:f>=.3?1:0;return'<span class="hgx-stars" aria-label="'+n+' of 3 stars">'+[0,1,2].map(i=>'<i class="'+(i<n?"on":"")+'">★</i>').join("")+'</span>'}
/* the result card: o = {key, pts, max, title, lines:[html], again(), done(frac)} */
function finish(el,o){const f=o.max?clamp(o.pts/o.max,0,1):0;const S=ST(),prev=S[o.key]||0,pc=Math.round(f*100);if(pc>prev){S[o.key]=pc;save()}
 try{o.done&&o.done(f)}catch(e){}
 const msg=f>=.85?"Superb: you have this.":f>=.6?"Good work. One more go for three stars?":f>=.3?"A start. Read the notes and try again.":"Tricky one. The notes below show the pattern; have another go.";
 el.innerHTML='<div class="hgx-end"><div class="hgx-end-top">'+stars(f)+'<div class="hgx-end-sc"><b>'+fmt(o.pts)+'</b><span>of '+fmt(o.max)+'</span></div></div><h4>'+esc(o.title||msg)+'</h4>'+(o.title?'<p>'+esc(msg)+'</p>':'')+
  (pc>prev&&prev?'<p class="hgx-best">New best: '+pc+'% (was '+prev+'%)</p>':prev?'<p class="hgx-best">Your best: '+Math.max(prev,pc)+'%</p>':'')+
  (o.lines&&o.lines.length?'<div class="hgx-recap">'+o.lines.join("")+'</div>':'')+
  '<div class="hgx-end-btns"><button type="button" class="hgx-btn pri" data-x="again">↻ Play again</button>'+(nextItemBtn()||"")+'<button type="button" class="hgx-btn" data-x="close">Back to the course</button></div></div>';
 el.querySelector('[data-x="again"]').onclick=()=>o.again&&o.again();
 el.querySelector('[data-x="close"]').onclick=()=>{try{hugQuizClose()}catch(e){}};
 const nb=el.querySelector('[data-x="next"]');if(nb)nb.onclick=()=>{const it=CUR.next;if(it)try{hugGo(it)}catch(e){console.error(e)}};
 try{el.scrollIntoView({block:"nearest"})}catch(e){}}
/* the activity after the open lab in the unit's path */
const CUR={uid:null,li:null,next:null};
function nextItemBtn(){try{const U=HUG.units.find(u=>u.id===CUR.uid);if(!U)return"";const its=hugItems(U);const i=its.findIndex(it=>it.kind==="lab"&&it.li===CUR.li);const nx=i>=0?its[i+1]:null;CUR.next=nx;if(!nx)return"";
  return'<button type="button" class="hgx-btn" data-x="next">Next: '+esc(hugItemLabel(nx).replace(/^(Lab|Game): /,""))+' →</button>'}catch(e){return""}}
function toast(el,html,kind){const t=document.createElement("div");t.className="hgx-fb "+(kind||"");t.innerHTML=html;el.appendChild(t);return t}
function btn(t,cls,on){const b=document.createElement("button");b.type="button";b.className="hgx-btn"+(cls?" "+cls:"");b.innerHTML=t;if(on)b.onclick=on;return b}
function h(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}

/* ================= engine: hunt (click the place) ================= */
/* cfg: {key, rounds:[{q, ll, name, why, tol(km), focus:[[w,s],[e,n]], hint}], n, proj, intro, after(round,A) , mapStyle:fn(A)} */
function hunt(el,cfg,done){
 const play=()=>{
  el.innerHTML="";const res=[];const R=shuffle(cfg.rounds).slice(0,cfg.n||8);let i=0,score=0;
  const H=hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
  const A=atlas(el,{proj:cfg.proj,grat:cfg.grat,gratLabels:cfg.gratLabels,names:false,cls:cfg.cls});
  if(cfg.mapStyle)cfg.mapStyle(A);
  const fb=h("div","hgx-fbw");el.appendChild(fb);
  A.home=()=>{const r=R[i];if(r&&r.focus)A.focusBox(r.focus);else A.reset()};
  const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();fb.innerHTML="";
   q.innerHTML='<b>'+r.q+'</b>'+(r.hint?'<small>'+r.hint+'</small>':'')+'<small class="hgx-dim">Click the map where you think it is. Drag to pan, scroll or pinch to zoom.</small>';
   if(r.focus)A.focusBox(r.focus);else A.reset();
   A.onClick=(c,ll)=>{if(!ll)return;A.onClick=null;const d=km(ll,r.ll),tol=r.tol||150;const f=d<=tol?1:clamp(1-(d-tol)/(tol*9),0,1);const p=Math.round(100*f);score+=p;res.push(f);
    A.marker(ll,{cls:"guess",r:6});A.line(ll,r.ll,{cls:"dash"});A.marker(r.ll,{cls:"real",r:7,ring:16,text:r.name});
    H.set(i+1,R.length,score);
    fb.innerHTML='<div class="hgx-fb '+(f>=.8?"ok":f>=.4?"mid":"no")+'"><b>'+(f>=.99?"Spot on!":f>=.8?"Very close!":f>=.4?"Near.":"Not quite.")+' +'+p+'</b> You were '+fmt(d)+' km from '+esc(r.name)+'.<p>'+(r.why||"")+'</p></div>';
    const nb=btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()});fb.appendChild(nb);nb.focus({preventScroll:true});
    if(cfg.after)try{cfg.after(r,A,c,ll)}catch(e){}
    /* show both points */const b=[[Math.min(ll[0],r.ll[0]),Math.min(ll[1],r.ll[1])],[Math.max(ll[0],r.ll[0]),Math.max(ll[1],r.ll[1])]];if(Math.abs(b[1][0]-b[0][0])<170){const pad=Math.max(3,(b[1][0]-b[0][0])*.3,(b[1][1]-b[0][1])*.3);A.focusBox([[b[0][0]-pad,b[0][1]-pad],[b[1][0]+pad,b[1][1]+pad]])}};
  };
  const end=()=>finish(el,{key:cfg.key,pts:score,max:R.length*100,lines:R.map((r,j)=>'<p><span class="hgx-pill '+(res[j]>=.8?"g":res[j]>=.4?"m":"b")+'">'+Math.round(res[j]*100)+'</span> '+esc(r.name)+'</p>'),again:play,done});
  ask()};
 if(cfg.intro){el.innerHTML='<div class="hgx-start">'+cfg.intro+'</div>';const b=btn("Start →","pri",play);el.firstChild.appendChild(b)}else play();
}

/* ================= engine: pick (click a country that…) ================= */
/* cfg: {key, rounds:[{q, ok:c=>bool, why:c=>html, focus, show:c=>colour (reveal fill), hint}], n, legend} */
function pick(el,cfg,done){
 const play=()=>{
  el.innerHTML="";const res=[];const R=(cfg.fixed?cfg.rounds:shuffle(cfg.rounds)).slice(0,cfg.n||8);let i=0,score=0;
  const H=hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
  const A=atlas(el,{names:cfg.names!==false,grat:cfg.grat});const fb=h("div","hgx-fbw");el.appendChild(fb);
  A.home=()=>{const r=R[i];if(r&&r.focus)A.focusBox(r.focus);else A.reset()};
  const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();A.fill(()=>null);A.cls(c=>r.scope&&!r.scope.includes(c)?"off":"");fb.innerHTML="";
   q.innerHTML='<b>'+r.q+'</b>'+(r.hint?'<small>'+r.hint+'</small>':'');if(r.focus)A.focusBox(r.focus);else A.reset();
   A.onClick=c=>{if(!c||(r.scope&&!r.scope.includes(c)))return;A.onClick=null;const ok=!!r.ok(c);const f=ok?1:0;score+=ok?100:0;res.push(f);
    A.setCls(c,ok?"pick-ok":"pick-no");
    if(r.show){A.fill(x=>x===c?null:r.show(x))}
    H.set(i+1,R.length,score);
    fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Yes! +100":"Not this one.")+'</b> '+(r.why?r.why(c):"")+(r.legend?'<div class="hgx-leg">'+r.legend+'</div>':'')+'</div>';
    const nb=btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()});fb.appendChild(nb)};
  };
  const end=()=>finish(el,{key:cfg.key,pts:score,max:R.length*100,again:play,done,lines:cfg.recap?cfg.recap(R,res):null});
  ask()};
 if(cfg.intro){el.innerHTML='<div class="hgx-start">'+cfg.intro+'</div>';el.firstChild.appendChild(btn("Start →","pri",play))}else play();
}

/* ================= engine: paint the map ================= */
/* cfg: {key, rounds:[{q, cats:[[k,label,col]], scope:[codes], ans:c=>k|null (null = unpainted is right), focus, why:html, explain:c=>text}]} */
function paint(el,cfg,done){
 const play=()=>{
  el.innerHTML="";const res=[];const R=(cfg.fixed?cfg.rounds:shuffle(cfg.rounds)).slice(0,cfg.n||cfg.rounds.length);let i=0,score=0,maxp=0;
  const H=hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const pal=h("div","hgx-pal");el.appendChild(pal);
  const A=atlas(el,{names:true});const fb=h("div","hgx-fbw");el.appendChild(fb);
  A.home=()=>{const r=R[i];if(r&&r.focus)A.focusBox(r.focus);else if(r)A.focusCodes(r.scope);else A.reset()};
  const ask=()=>{const r=R[i];const P={};let cur=r.cats[0][0],checked=false;H.set(i+1,R.length,score);A.clear();fb.innerHTML="";
   const col=k=>(r.cats.find(x=>x[0]===k)||[])[2];
   q.innerHTML='<b>'+r.q+'</b>'+(r.hint?'<small>'+r.hint+'</small>':'')+'<small class="hgx-dim">Pick a colour, then click countries to paint them. Click a painted country again to clear it.</small>';
   const drawPal=()=>{pal.innerHTML=r.cats.map(([k2,l,c2])=>'<button type="button" data-k="'+k2+'" class="'+(k2===cur?"on":"")+'"><i style="background:'+c2+'"></i>'+esc(l)+'</button>').join("")+'<span class="hgx-cnt">'+Object.keys(P).length+' painted</span>';
    pal.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{cur=b.dataset.k;drawPal()});};
   drawPal();
   const sc=new Set(r.scope);
   A.cls(c=>sc.has(c)?"can":"off");A.fill(()=>null);
   if(r.focus)A.focusBox(r.focus);else A.focusCodes(r.scope);
   A.onClick=c=>{if(checked||!c||!sc.has(c))return;if(P[c]===cur)delete P[c];else P[c]=cur;A.setFill(c,P[c]?col(P[c]):null);drawPal();chk.disabled=!Object.keys(P).length};
   const chk=btn("Check my map","pri",()=>{checked=true;A.onClick=null;let right=0,n=0;const wrong=[];
    r.scope.forEach(c=>{const a=r.ans(c);if(a===undefined)return;n++;const mine=P[c]||null;const ok=mine===(a||null);if(ok)right++;else wrong.push(c);
     A.setCls(c,"can "+(ok?"chk-ok":"chk-no"));if(!ok&&a)A.setFill(c,col(a));if(!ok&&!a)A.setFill(c,null)});
    let f=n?right/n:0;if(r.cats.length===1){let tp=0,fp=0,fn=0;r.scope.forEach(c=>{const a=r.ans(c);if(a===undefined)return;const m=!!P[c];if(m&&a)tp++;else if(m)fp++;else if(a)fn++});f=tp+fp+fn?tp/(tp+fp+fn):1;right=tp;n=tp+fn}const p=Math.round(f*100);score+=p;maxp+=100;res.push(f);H.set(i+1,R.length,score);
    fb.innerHTML='<div class="hgx-fb '+(f>=.8?"ok":f>=.5?"mid":"no")+'"><b>'+(r.cats.length===1?'You found '+right+' of '+n+(wrong.length>n-right?' and painted '+(wrong.length-(n-right))+' that don’t belong':'')+'. +'+p:right+' of '+n+' right. +'+p)+'</b> Mistakes have a red edge and now show the right answer.'+(wrong.length?'<p class="hgx-small">'+wrong.slice(0,10).map(c=>{const a=r.ans(c);return'<b>'+esc(D.name(c))+'</b> '+(r.explain?esc(r.explain(c)):a?'should be '+esc((r.cats.find(x=>x[0]===a)||[])[1]||''):'should be left blank')}).join(" · ")+(wrong.length>10?" …":"")+'</p>':'')+(r.why?'<p>'+r.why+'</p>':'')+'</div>';
    const nb=btn(i+1<R.length?"Next map →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()});fb.appendChild(nb)});
   chk.disabled=true;fb.appendChild(chk);
   if(r.cats.length>1){const fill=btn("Fill the rest","",()=>{if(checked)return;r.scope.forEach(c=>{if(!P[c]){P[c]=cur;A.setFill(c,col(cur))}});drawPal();chk.disabled=false});fb.appendChild(fill);const oc=chk.onclick;chk.onclick=()=>{fill.remove();oc()}}
  };
  const end=()=>finish(el,{key:cfg.key,pts:score,max:R.length*100,again:play,done});
  ask()};
 if(cfg.intro){el.innerHTML='<div class="hgx-start">'+cfg.intro+'</div>';el.firstChild.appendChild(btn("Start →","pri",play))}else play();
}

/* ================= engine: a mission on the live Maps page ================= */
/* cfg: {key, title, mode, sub, intro, tools:"ruler"|…, rounds:[{q, kind:"num", ans, unit, tol(fraction), why, fly:[[w,s],[e,n]]} | {q, kind:"click", ll, name, tol(km), why}]} */
let MS=null;
function missionLayer(){let L=document.getElementById("hgxMsLayer");if(!L){L=h("div","hgx-ms-layer");L.id="hgxMsLayer";document.body.appendChild(L)}return L}
function mapRect(){try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(g&&g.host&&g.host.isConnected&&g.host.offsetParent){const r=g.host.getBoundingClientRect();if(r.width>50)return r}}catch(e){}const w=document.getElementById("allMapsWrap");if(w){const r=w.getBoundingClientRect();if(r.width>50)return r}return null}
function placeCard(card){try{const r=mapRect();if(!r)return;if(innerWidth-r.right>=356){card.style.left=(r.right+12)+"px";card.style.top=Math.max(70,r.top)+"px";card.style.right="auto"}else if(innerWidth>640){card.style.top=Math.max(70,r.bottom-260)+"px"}}catch(e){}}
function missionStop(){if(!MS)return;try{document.removeEventListener("click",MS.onDoc,true)}catch(e){}cancelAnimationFrame(MS.raf);const c=document.getElementById("hgxMission");if(c)c.remove();const L=document.getElementById("hgxMsLayer");if(L)L.innerHTML="";document.body.classList.remove("hgx-ms-on","hgx-ms-arm");MS=null}
function liveFly(b){try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(g&&g.host&&g.host.isConnected&&g.host.offsetParent){const c=[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2];const w=Math.max(b[1][0]-b[0][0],(b[1][1]-b[0][1])*1.8,.5);
  const z=g._flat?clamp(270/(w*1.3),1,80):clamp(.55/Math.max(.01,w*Math.PI/360),1,40);g.lookAt(c[0],c[1],z);return}}catch(e){}
 try{const wrap=document.getElementById("allMapsWrap");if(!wrap||!wrap._panZoom||typeof amtFromLL!=="function")return;const pts=[];for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){const q=amtFromLL([b[0][0]+(b[1][0]-b[0][0])*i/6,b[0][1]+(b[1][1]-b[0][1])*j/6]);if(q)pts.push(q)}
 if(!pts.length)return;const x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));const w=(x1-x0)*1.3,hh=(y1-y0)*1.3,cx=(x0+x1)/2,cy=(y0+y1)/2;const asp=2000/1001;let W2=Math.max(w,hh*asp),H2=W2/asp;pzFly(wrap,{x:cx-W2/2,y:cy-H2/2,w:W2,h:H2})}catch(e){}}
function liveMode(mode,sub){try{const chip=document.querySelector('[data-allmaps-mode="'+mode+'"]');if(chip&&!(typeof allMapsColorModeOn!=="undefined"&&allMapsColorModeOn&&allMapsColorMode===mode))chip.click();
 if(sub)setTimeout(()=>{const s=document.querySelector('[data-allmaps-sub="'+sub+'"]');if(s&&!s.classList.contains("active"))s.click()},350)}catch(e){console.error(e)}}
function mission(cfg,done){
 missionStop();try{hugQuizClose()}catch(e){}
 const go=()=>{liveMode(cfg.mode||"relief",cfg.sub);setTimeout(()=>start(),500)};
 try{if(appMode!=="allmaps"){switchAppMode("allmaps");setTimeout(go,800)}else go()}catch(e){console.error(e)}
 function start(){
  const R=cfg.fixed?cfg.rounds.slice(0,cfg.n||99):shuffle(cfg.rounds).slice(0,cfg.n||6);let i=0,score=0;const res=[];
  const card=h("div","hgx-ms");card.id="hgxMission";card.style.setProperty("--uc",cfg.col||"#3b6fb6");document.body.appendChild(card);document.body.classList.add("hgx-ms-on");placeCard(card);
  MS={raf:0,pins:[],onDoc:null};
  const L=missionLayer();
  const tick=()=>{if(!MS)return;try{if(appMode!=="allmaps"){missionStop();return}}catch(e){}try{MS.pins.forEach(p=>{const s=gfToolkit.toScreen(p.ll);if(!s){p.el.style.display="none";return}p.el.style.display="";p.el.style.left=s[0]+"px";p.el.style.top=s[1]+"px"})}catch(e){}MS.raf=requestAnimationFrame(tick)};tick();
  const pin=(ll,cls,t)=>{const e=h("div","hgx-ms-pin "+cls,t?'<span>'+esc(t)+'</span>':"");L.appendChild(e);MS.pins.push({ll,el:e})};
  /* drag the card by its top bar */
  let drag=null;card.addEventListener("pointerdown",e=>{if(!e.target.closest(".hgx-ms-top")||e.target.closest("button"))return;const r=card.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};card.setPointerCapture(e.pointerId)});
  card.addEventListener("pointermove",e=>{if(!drag)return;card.style.left=clamp(e.clientX-drag.dx,4,innerWidth-80)+"px";card.style.top=clamp(e.clientY-drag.dy,4,innerHeight-60)+"px";card.style.right="auto";card.style.bottom="auto"});
  card.addEventListener("pointerup",()=>{drag=null});
  const top='<div class="hgx-ms-top"><span>'+esc(cfg.title)+'</span><button type="button" class="hgx-ms-min" aria-label="Fold">▾</button><button type="button" class="hgx-ms-x" aria-label="End the mission">✕</button></div>';
  const wire=()=>{card.querySelector(".hgx-ms-x").onclick=()=>{missionStop()};card.querySelector(".hgx-ms-min").onclick=()=>card.classList.toggle("fold")};
  const back=()=>{missionStop();try{hugTab="aphg";stats.prefs=stats.prefs||{};stats.prefs.hugTab="aphg";switchAppMode("tours");scrollTo({top:0})}catch(e){}};
  const ask=()=>{const r=R[i];L.innerHTML="";MS.pins=[];
   card.innerHTML=top+'<div class="hgx-ms-b"><div class="hgx-ms-r">Task '+(i+1)+' of '+R.length+' · score '+score+'</div><p class="hgx-ms-q">'+r.q+'</p>'+(r.tip?'<p class="hgx-ms-tip">'+r.tip+'</p>':'')+
    (r.kind==="num"?'<div class="hgx-ms-in"><input type="number" inputmode="decimal" placeholder="your answer"><span>'+esc(r.unit||"")+'</span><button type="button" class="hgx-btn pri" data-a>Check</button></div>':
     '<p class="hgx-ms-tip"><b>Click the map</b> at the spot. Zoom and pan as much as you like first.</p>')+'<div class="hgx-ms-fb"></div></div>';wire();
   if(r.fly)setTimeout(()=>liveFly(r.fly),200);
   const fb=card.querySelector(".hgx-ms-fb");
   const show=(f,html)=>{const p=Math.round(100*f);score+=p;res.push(f);fb.innerHTML='<div class="hgx-fb '+(f>=.8?"ok":f>=.4?"mid":"no")+'">'+html+' <b>+'+p+'</b>'+(r.why?'<p>'+r.why+'</p>':'')+'</div>';
    const nb=btn(i+1<R.length?"Next task →":"Finish","pri",()=>{i++;if(i<R.length)ask();else end()});fb.appendChild(nb);card.querySelector(".hgx-ms-r").textContent="Task "+(i+1)+" of "+R.length+" · score "+score};
   if(r.kind==="num"){const inp=card.querySelector("input");const a=card.querySelector("[data-a]");const check=()=>{const v=parseFloat(inp.value);if(!isFinite(v)){inp.focus();return}a.disabled=true;inp.disabled=true;const err=Math.abs(v-r.ans)/r.ans;const tol=r.tol||.08;const f=err<=tol?1:clamp(1-(err-tol)/(tol*5),0,1);
     show(f,(f>=.99?"Spot on.":f>=.6?"Close.":"Some way off.")+' The answer is about <b>'+fmt(r.ans)+' '+esc(r.unit||"")+'</b>; you said '+fmt(v)+'.');if(r.a&&r.b){pin(r.a,"real");pin(r.b,"real")}};
    a.onclick=check;inp.addEventListener("keydown",e=>{if(e.key==="Enter")check()});document.body.classList.remove("hgx-ms-arm")}
   else{document.body.classList.add("hgx-ms-arm");
    MS.onDoc&&document.removeEventListener("click",MS.onDoc,true);
    MS.onDoc=e=>{if(!MS||appMode!=="allmaps"||e.target.closest('#hgxMission,button,input,select,a,label,.topbar,[class*="gfk"],.amz,.zoom-controls,.ps-card,[role="dialog"]'))return;const mr=mapRect();if(!mr||e.clientX<mr.left||e.clientX>mr.right||e.clientY<mr.top||e.clientY>mr.bottom)return;let ll=null;try{ll=gfToolkit.toLL(e.clientX,e.clientY)}catch(x){}if(!ll)return;
     e.stopPropagation();e.preventDefault();document.removeEventListener("click",MS.onDoc,true);document.body.classList.remove("hgx-ms-arm");
     const d=km(ll,r.ll),tol=r.tol||150;const f=d<=tol?1:clamp(1-(d-tol)/(tol*9),0,1);pin(ll,"guess");pin(r.ll,"real",r.name);
     show(f,(f>=.99?"Spot on!":f>=.8?"Very close!":f>=.4?"Near.":"Not quite.")+' You were '+fmt(d)+' km from '+esc(r.name)+'.')};
    document.addEventListener("click",MS.onDoc,true)}
  };
  const end=()=>{L.innerHTML="";MS.pins=[];document.body.classList.remove("hgx-ms-arm");const f=R.length?score/(R.length*100):0;const S=ST(),prev=S[cfg.key]||0,pc=Math.round(f*100);if(pc>prev){S[cfg.key]=pc;save()}try{done&&done(f)}catch(e){}
   card.innerHTML=top+'<div class="hgx-ms-b"><div class="hgx-end-top">'+stars(f)+'<div class="hgx-end-sc"><b>'+score+'</b><span>of '+R.length*100+'</span></div></div><p>'+(f>=.85?"Expert map work.":f>=.6?"Good measuring.":"Have another go: zoom in close before you click or measure.")+'</p>'+(prev?'<p class="hgx-best">Best: '+Math.max(prev,pc)+'%</p>':'')+
    '<div class="hgx-end-btns"><button type="button" class="hgx-btn pri" data-m="again">↻ Again</button><button type="button" class="hgx-btn" data-m="back">Back to the course</button></div></div>';wire();
   card.querySelector('[data-m="again"]').onclick=()=>{missionStop();mission(cfg,done)};card.querySelector('[data-m="back"]').onclick=back};
  if(cfg.intro){card.innerHTML=top+'<div class="hgx-ms-b"><p>'+cfg.intro+'</p><div class="hgx-end-btns"><button type="button" class="hgx-btn pri" data-m="go">Start →</button></div></div>';wire();card.querySelector('[data-m="go"]').onclick=ask}else ask();
 }
}
/* a lab whose card offers the live-map mission, with the in-window version as the other choice */
HUG_LAB.mission={render(L,el,done){
 el.innerHTML='<div class="hgx-start">'+(L.how?'<p>'+L.how+'</p>':'')+'<div class="hgx-choice"><button type="button" class="hgx-btn pri" data-go>Open the live map and start →</button></div><p class="hgx-dim">The map opens with a task card you can drag anywhere. The toolkit tray sits at the bottom left of the map.</p></div>';
 el.querySelector("[data-go]").onclick=()=>mission(Object.assign({key:"ms:"+L.id,col:CUR.col},L.mission),done)}};

/* ================= generic lab kinds driven by data ================= */
HUG_LAB.hunt={render(L,el,done){hunt(el,Object.assign({key:"hunt:"+L.id},L.game),done)}};
HUG_LAB.pick={render(L,el,done){pick(el,Object.assign({key:"pick:"+L.id},typeof L.game==="function"?L.game():L.game),done)}};
HUG_LAB.paint={render(L,el,done){paint(el,Object.assign({key:"paint:"+L.id},typeof L.game==="function"?L.game():L.game),done)}};
/* a game written as a function: L.play(el, done, L) */
HUG_LAB.game={render(L,el,done){try{L.play(el,done,L)}catch(e){console.error(e);el.innerHTML='<p>Sorry, this game could not start.</p>'}}};

/* ================= the lab window: wider for map games, unit colour inside ================= */
{const _lo=hugLabOpen;hugLabOpen=function(uid,li){const U=HUG.units.find(u=>u.id===uid),L=hugLabList(uid)[li];CUR.uid=uid;CUR.li=li;CUR.col=U&&U.col;
 const r=_lo.apply(this,arguments);watchFb(document.getElementById("hgQuiz"));try{const box=document.querySelector("#hgQuiz .hg-q-box");if(box&&L){box.classList.toggle("hgx-wide",!!L.wide);box.classList.toggle("hgx-game",!!L.game||!!L.play||!!L.mission);if(U)box.style.setProperty("--uc",U.col);
  const top=box.querySelector(".hg-q-top span");if(top&&(L.play||L.game||L.mission))top.textContent=(L.mission?"Map mission":"Game")+" · Unit "+U.n+": "+U.title;
  if(L.skill){const h3=box.querySelector(".hg-lab-body h3");if(h3)h3.insertAdjacentHTML("afterend",'<p class="hgx-skill"><b>AP skill</b> '+esc(L.skill)+'</p>')}}}catch(e){console.error(e)}return r}}
/* Escape closes the window; a mission ends with Escape too */
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(MS&&!document.body.classList.contains("hg-quiz-on")){missionStop();return}});

/* ================= the course page: chapters and games ================= */
const isGame=L=>!!(L&&(L.play||L.game||L.mission||L.kindGame));
{const _hi=hugItems;hugItems=function(U){const a=_hi.apply(this,arguments);try{
  const tours=a.filter(it=>it.kind==="tour"),labs=a.filter(it=>it.kind==="lab"),rest=a.filter(it=>it.kind!=="tour"&&it.kind!=="lab");
  const out=[];const used=new Set();
  tours.forEach(t=>{out.push(t);labs.forEach(l=>{const L=hugLabList(U.id)[l.li];if(L&&L.ch===t.id){out.push(l);used.add(l)}})});
  labs.forEach(l=>{if(!used.has(l))out.splice(out.length,0,l)});
  /* labs with no chapter go after the last tour */
  return out.concat(rest)}catch(e){console.error(e);return a}}}
{const _hl=hugItemLabel;hugItemLabel=function(it){if(it.kind==="lab"){const L=hugLabList(it.id)[it.li];if(L&&isGame(L))return(L.mission?"Map mission: ":"Game: ")+L.title}return _hl.apply(this,arguments)}}
/* decorate the rendered course page */
function decorate(){const v=document.getElementById("toursView");if(!v||!v.querySelector(".hg-page")||v.querySelector(".hg-page").dataset.hgx)return;const page=v.querySelector(".hg-page");page.dataset.hgx=1;
 let games=0;HUG.units.forEach(U=>hugLabList(U.id).forEach(L=>{if(isGame(L))games++}));
 const st=page.querySelector(".hg-stats");if(st)st.insertAdjacentHTML("beforeend",'<span><b>'+games+'</b> map games</span>');
 const hp=page.querySelector(".hg-hero p");if(hp)hp.textContent="The seven units of the AP course, taught on the maps. Each unit is a path of chapters: a short tour that flies to real places, then games that make you use the idea on a real map (click, paint, measure, build), then quick checks and a unit test that take the unit from Attempted to Mastered.";
 page.querySelectorAll(".hg-unit").forEach((sec,ui)=>{const U=HUG.units[ui];if(!U)return;const its=hugItems(U);const lis=[...sec.querySelectorAll(".hg-items > li")];
  if(U.big&&!sec.querySelector(".hgx-big")){const hd=sec.querySelector(".hg-unit-h");if(hd)hd.insertAdjacentHTML("afterend",'<div class="hgx-big"><p><b>Big idea</b> '+esc(U.big)+'</p>'+(U.skills?'<p class="hgx-dim"><b>You will</b> '+esc(U.skills)+'</p>':'')+'</div>')}
  let ch=0,checkDone=false;
  lis.forEach((li,j)=>{const it=its[j];if(!it)return;
   if(it.kind==="tour"){ch++;const D=HUG.tours[it.id];const inCh=its.filter(x=>x.kind==="lab"&&(hugLabList(U.id)[x.li]||{}).ch===it.id).map(x=>hugLabList(U.id)[x.li]);const gs=inCh.filter(isGame).length,ls=inCh.length-gs;
    li.insertAdjacentHTML("beforebegin",'<li class="hgx-chh"><span>Chapter '+U.n+'.'+ch+'</span><b>'+esc(D?D.name:"")+'</b><em>tour'+(gs?' + '+gs+(gs>1?" games":" game"):'')+(ls?' + '+ls+(ls>1?" labs":" lab"):'')+'</em></li>')}
   else if(it.kind==="lab"){const L=hugLabList(U.id)[it.li];if(isGame(L)){li.classList.add("hgx-gi");const ic=li.querySelector(".hg-ic");if(ic&&!/✓|◐|↷/.test(ic.textContent))ic.innerHTML=L.mission?MS_ICON:GAME_ICON;
      const sm=li.querySelector("small");if(sm){const b=ST()[(L.mission?"ms:":L.kind==="hunt"?"hunt:":L.kind==="pick"?"pick:":L.kind==="paint"?"paint:":"g:")+L.id];if(b)sm.insertAdjacentHTML("beforeend",' · <span class="hgx-bestchip">best '+b+'%</span>')}}}
   else if(!checkDone){checkDone=true;li.insertAdjacentHTML("beforebegin",'<li class="hgx-chh chk"><span>Review</span><b>Check your understanding</b><em>terms, practice, quick-fire, written answers, the unit test</em></li>')}
  })});
}
const GAME_ICON='<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M7 7h10a5 5 0 0 1 4.9 6l-.8 4a2.6 2.6 0 0 1-4.5 1.2L14.5 16h-5l-2.1 2.2A2.6 2.6 0 0 1 2.9 17l-.8-4A5 5 0 0 1 7 7zm0 3v1.5H5.5v1.5H7v1.5h1.5V13H10v-1.5H8.5V10zm8.8.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>';
const MS_ICON='<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M9 3 3 5.5v15.5l6-2.5 6 2.5 6-2.5V3l-6 2.5zm0 2.2 6 2.5v11.1l-6-2.5zM5 6.8l2-.8v11.1l-2 .8zm12 11.4V7.1l2-.8v11.1z"/></svg>';
{const _rtv=renderToursView;renderToursView=function(){const r=_rtv.apply(this,arguments);try{decorate()}catch(e){console.error(e)}return r}}

/* ================= the Games page: an AP map games entry ================= */
function gamesHub(){const v=document.getElementById("gamesView");if(!v)return;
 let h='<div class="hgx-hub"><h2>AP Human Geography map games</h2><p>Every game from the course, unit by unit. They open in a window on top of the page; the map missions open the live map.</p>';
 HUG.units.forEach(U=>{const gs=hugLabList(U.id).map((L,li)=>({L,li})).filter(x=>isGame(x.L));if(!gs.length)return;
  h+='<section style="--uc:'+U.col+'"><h3><span>'+U.n+'</span>'+esc(U.title)+'</h3><div class="hgx-hub-g">'+gs.map(x=>{const b=ST()[(x.L.mission?"ms:":x.L.kind==="hunt"?"hunt:":x.L.kind==="pick"?"pick:":x.L.kind==="paint"?"paint:":"g:")+x.L.id];return'<button type="button" data-u="'+U.id+'" data-li="'+x.li+'"><b>'+esc(x.L.title)+'</b><small>'+esc(x.L.blurb||"")+(b?' · best '+b+'%':'')+'</small></button>'}).join("")+'</div></section>'});
 v.innerHTML=h+'</div>';v.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>hugLabOpen(b.dataset.u,+b.dataset.li))}
try{if(typeof NEW_GAMES!=="undefined"){NEW_GAMES.push(["apgames","AP Geography map games",gamesHub]);try{GH_INFO.apgames=["globe","Map games from the AP Human Geography course","#3b6fb6"]}catch(e){}}}catch(e){}

/* ================= unit text: big ideas, skills, revised blurbs and fixes ================= */
const UNITX={
 u1:{blurb:"Maps and their distortions, location, scale, regions, data and the friction of distance: the toolkit for the whole course.",
  big:"Where something is explains a lot about what it is. Maps, scale and regions are the lenses geographers use to see the pattern, and every map is a choice.",
  skills:"find any place by latitude and longitude, see how projections lie, measure distance on the live map with the ruler, and draw formal regions from real data."},
 u2:{blurb:"Where people live, how populations grow, age and shrink, and why people move.",
  big:"Population change is births, deaths and migration. Countries pass through the same transition at different times, so the world map is a snapshot of one story told at many stages.",
  skills:"place real countries on the demographic transition, build population pyramids, compare densities, and draw the world’s great migration flows."},
 u3:{blurb:"What culture is, where it began, how it spreads, and how language and religion mark the land.",
  big:"Culture spreads from hearths by contact, by hierarchy and by people moving, and it leaves marks on the landscape you can map.",
  skills:"run diffusion on a real map of cities, paint the world’s language families, and find the sacred places of the major religions."},
 u4:{blurb:"States and nations, how borders are drawn and fought over, and the forces that bind and divide.",
  big:"Borders are human decisions drawn on physical space. Who draws them, and how, shapes power from the world map down to a voting district.",
  skills:"spot boundary types on real borders, sort countries by shape, find the choke points of world trade, and draw (and undo) a gerrymander."},
 u5:{blurb:"Where farming began, how the world farms, the models of rural land, the global food system and farming’s footprint.",
  big:"Farming is shaped by climate, distance to market and technology. Models like von Thünen’s explain the pattern; globalisation stretches it across the planet.",
  skills:"run a von Thünen farm for profit, match farm types to real climates, find the hearths of the great crops, and measure the food miles on your plate."},
 u6:{blurb:"Why cities grow where they do, the models of what lies inside them, and the challenges of changing, sustainable cities.",
  big:"Cities follow patterns: site and situation decide where they grow, bid-rent sorts land inside them, and size follows rank. Planning can bend the pattern.",
  skills:"build a city to a model, place market towns so every village is served, test the rank-size rule on real countries, and cool an urban heat island."},
 u7:{blurb:"How development is measured and explained, where industry and trade have moved, and how development can last.",
  big:"Development is uneven, and the reasons are spatial: resources, location, trade routes and history. Industry moves to where costs are lowest.",
  skills:"site a factory with Weber’s triangle, map the core and periphery from real GDP data, guess HDI, route a container ship round the world’s choke points, and match projects to the SDGs."}
};
HUG.units.forEach(U=>{const x=UNITX[U.id];if(x)Object.assign(U,x)});
/* key terms the course was missing */
const addTerms={u1:[["Mercator projection","A conformal projection that keeps shapes and directions but swells areas towards the poles."],["Equal-area projection","A projection that keeps the relative size of areas true, at the cost of shape (for example Gall–Peters)."],["Representative fraction","Map scale written as a ratio, such as 1:50,000: one unit on the map is 50,000 on the ground."]],
 u3:[["Expansion diffusion","Spread outward from a hearth while the idea stays strong at home: contagious, hierarchical and stimulus diffusion."],["Language family","Languages related through a common ancestor, such as Indo-European or Sino-Tibetan."]],
 u4:[["Choke point","A narrow sea passage that much trade must use, so it is easy to block: Hormuz, Malacca, Suez, Panama."],["Packing and cracking","Gerrymandering tactics: pack the other side’s voters into a few districts, or crack them thinly across many."]],
 u5:[["Food miles","The distance food travels from farm to plate, one measure of its environmental cost."],["Agricultural hearth","Where farming began independently: the Fertile Crescent, the Yangtze and Yellow rivers, Mesoamerica, the Andes, West Africa and New Guinea."]],
 u6:[["Urban heat island","A city that is warmer than the countryside around it, because of dark surfaces, few trees and waste heat."],["Threshold and range","Threshold: the fewest customers a service needs to survive. Range: the farthest people will travel for it."]],
 u7:[["Isodapane","A line joining places of equal extra transport cost around the cheapest point, in Weber’s model."],["Sustainable Development Goals","Seventeen UN goals for 2030, from ending poverty to climate action, agreed in 2015."]]};
HUG.units.forEach(U=>{(addTerms[U.id]||[]).forEach(t=>{if(U.terms&&!U.terms.some(x=>x[0]===t[0]))U.terms.push(t)})});

/* facts brought up to date (2026). Tour stops are patched by tour id and stop title, and only when the text is as expected. */
function fixStop(tid,title,f){try{[typeof PS_TOURS!=="undefined"&&PS_TOURS[tid],HUG.tours[tid]].forEach(T=>{if(!T||!T.steps)return;const s=T.steps.find(x=>x.title===title);if(!s)return;const o=f(s);if(!o)return;for(const k in o)Object.defineProperty(s,k,{configurable:true,enumerable:true,writable:true,value:o[k]})})}catch(e){console.error(e)}}
function applyFixes(){
 fixStop("hg6a","Megacities",s=>/Most are in Asia: Tokyo, Delhi/.test(s.body||"")?{body:"A megacity has over 10 million people. The UN’s 2025 count, which draws every city’s edge the same way, puts Jakarta first (about 42 million), then Dhaka (about 37 million) and Tokyo (about 33 million); New Delhi, Shanghai, Guangzhou, Cairo and Manila follow. Most megacities are in Asia; others include Lagos, São Paulo and Mexico City. Rankings depend on where the city’s edge is drawn."}:null);
 /* the same stop may have another title: find it by its text */
 try{[PS_TOURS.hg6a,HUG.tours.hg6a].forEach(T=>{if(!T)return;T.steps.forEach(s=>{if(/Most are in Asia: Tokyo, Delhi, Shanghai, Dhaka, Jakarta, Mumbai/.test(s.body||""))Object.defineProperty(s,"body",{configurable:true,enumerable:true,writable:true,value:"A megacity has over 10 million people. The UN’s 2025 count, which draws every city’s edge the same way, puts Jakarta first (about 42 million), then Dhaka (about 37 million) and Tokyo (about 33 million); New Delhi, Shanghai, Guangzhou, Cairo and Manila follow. Most megacities are in Asia; others include Lagos, São Paulo and Mexico City. Rankings depend on where the city’s edge is drawn."})})})}catch(e){}
 try{(HUG.practice.u6||[]).forEach(q=>{if(/megacities are in/.test(q.q)&&q.why&&!/Jakarta/.test(q.why))q.why+=" The UN’s 2025 count puts Jakarta, Dhaka and Tokyo at the top."})}catch(e){}
 try{const f=HUG.frq.u2;(Array.isArray(f)?f:[f]).forEach(F=>{(F.parts||[]).forEach(p=>{if(typeof p[1]==="string")p[1]=p[1].replace("a total fertility rate of 0.72 (2023), the lowest in the world","a total fertility rate of 0.72 in 2023 (0.75 in 2024), the lowest in the world")})})}catch(e){}
 try{(HUG.labs.u1||[]).forEach(L=>{(L.items||[]).forEach(it=>{if(it[0]==="India’s 2011 census: about 1.21 billion people counted")it[0]="India’s 2011 census counted 1.21 billion people (the next one, delayed since 2021, is set for 2027)"})})}catch(e){}
}
applyFixes();setTimeout(applyFixes,1500);

/* ================= styles ================= */
const css=document.createElement("style");css.id="hgx-css";css.textContent=`
.hg-q-box.hgx-wide{ width:min(1080px,100%); }
.hg-q-box.hgx-game .hg-lab-body h3{ margin-bottom:4px; }
.hgx-skill{ font-size:12.5px; margin:0 0 8px; opacity:.8; } .hgx-skill b{ color:var(--uc,#3b6fb6); text-transform:uppercase; font-size:10.5px; letter-spacing:.06em; margin-right:4px; }
.hgx-atlas{ position:relative; border-radius:14px; overflow:hidden; background:#cfe3f2; touch-action:none; user-select:none; -webkit-user-select:none; }
.hgx-map{ display:block; width:100%; height:auto; max-height:58vh; cursor:crosshair; }
.hgx-sea{ fill:#cfe3f2; } .hgx-grat{ fill:none; stroke:#7aa3c4; stroke-opacity:.35; stroke-width:.6; vector-effect:non-scaling-stroke; }
.hgx-c{ fill:#efe9dc; stroke:#9c927f; stroke-width:.5; vector-effect:non-scaling-stroke; transition:fill .2s; }
.hgx-c:hover{ fill:#e3d6b8; } .hgx-c.off{ fill:#e4e0d7; opacity:.55; } .hgx-c.can{ fill:#fffaf0; stroke:#6b6250; cursor:pointer; } .hgx-c.can:hover{ filter:brightness(.93); }
.hgx-land.hgx-onbg .hgx-c{ fill:transparent; stroke:#4b4538; stroke-opacity:.5; } .hgx-land.hgx-onbg .hgx-c:hover{ fill:rgba(255,255,255,.25); }
.hgx-c.pick-ok{ fill:#3aa66a !important; } .hgx-c.pick-no{ fill:#d9573a !important; }
.hgx-c.chk-ok{ stroke:#1d7f4b; stroke-width:1.6; } .hgx-c.chk-no{ stroke:#d23b2a; stroke-width:2.4; }
.hgx-c.hl{ fill:#ffcf5a !important; stroke:#8a5b00; stroke-width:1.5; } .hgx-c.hl2{ fill:#7fc4ff !important; stroke:#1b5e9c; stroke-width:1.5; }
.hgx-dot{ fill:#d9573a; stroke:#fff; stroke-width:2; } .hgx-mk.guess .hgx-dot{ fill:#2b6fd0; } .hgx-mk.real .hgx-dot{ fill:#d9573a; }
.hgx-ring{ fill:none; stroke:#d9573a; stroke-width:2; stroke-dasharray:4 3; }
.hgx-mt,.hgx-lb{ font:700 13px Inter,system-ui,sans-serif; fill:#1d2433; paint-order:stroke; stroke:#fff; stroke-width:3px; stroke-linejoin:round; pointer-events:none; }
.hgx-line{ fill:none; stroke:#d9573a; stroke-width:2.2; vector-effect:non-scaling-stroke; } .hgx-line.dash{ stroke-dasharray:6 4; stroke:#444; } .hgx-arhead{ fill:#d9573a; }
.hgx-geo{ fill:none; stroke:#d9573a; stroke-width:3; vector-effect:non-scaling-stroke; }
.hgx-gl text{ font:600 10px Inter,system-ui,sans-serif; fill:#3d6a8c; opacity:.8; }
.hgx-tip{ position:absolute; z-index:3; pointer-events:none; background:rgba(20,28,44,.92); color:#fff; font-size:12.5px; padding:5px 9px; border-radius:8px; max-width:220px; }
.hgx-zb{ position:absolute; right:8px; top:8px; display:flex; flex-direction:column; gap:4px; z-index:2; }
.hgx-zb button{ width:30px; height:30px; border-radius:9px; border:1px solid rgba(0,0,0,.15); background:rgba(255,255,255,.92); font:700 16px system-ui; color:#1d2433; cursor:pointer; }
.hgx-hud{ display:flex; align-items:center; gap:10px; justify-content:space-between; font-size:13px; margin:0 0 8px; flex-wrap:wrap; }
.hgx-dots{ display:flex; gap:4px; } .hgx-dots i{ width:10px; height:10px; border-radius:50%; background:rgba(127,127,127,.25); } .hgx-dots i.c{ background:var(--uc,#3b6fb6); box-shadow:0 0 0 2px rgba(127,127,127,.25); } .hgx-dots i.g{ background:#3aa66a; } .hgx-dots i.m{ background:#e2a33a; } .hgx-dots i.b{ background:#d9573a; }
.hgx-s b{ font-size:16px; color:var(--uc,#3b6fb6); }
.hgx-q{ background:rgba(127,127,127,.08); border-left:4px solid var(--uc,#3b6fb6); padding:9px 12px; border-radius:10px; margin:0 0 8px; font-size:15px; line-height:1.4; }
.hgx-q small{ display:block; font-size:12.5px; opacity:.8; margin-top:3px; } .hgx-dim{ opacity:.65; } .hgx-small{ font-size:12.5px; }
.hgx-fbw{ margin-top:8px; display:flex; flex-wrap:wrap; gap:8px; align-items:flex-start; } .hgx-fbw>.hgx-fb{ flex:1 1 300px; } .hgx-fbw>.hgx-btn{ align-self:center; }
.hgx-fb{ border-radius:12px; padding:9px 12px; font-size:14px; line-height:1.45; background:rgba(127,127,127,.1); } .hgx-fb p{ margin:4px 0 0; } .hgx-fb.ok{ background:#e3f5e9; } .hgx-fb.mid{ background:#fff2d6; } .hgx-fb.no{ background:#fde8e4; }
.hgx-btn{ border:1px solid rgba(0,0,0,.14); background:#fff; color:#1d2433; border-radius:999px; padding:8px 15px; font:700 13.5px Inter,system-ui,sans-serif; cursor:pointer; }
.hgx-btn.pri{ background:var(--uc,#3b6fb6); border-color:transparent; color:#fff; } .hgx-btn:disabled{ opacity:.45; cursor:default; } .hgx-btn:not(:disabled):hover{ filter:brightness(1.07); }
.hgx-btn.on{ outline:3px solid var(--uc,#3b6fb6); outline-offset:1px; }
.hgx-start{ padding:6px 0; } .hgx-start p{ margin:0 0 10px; line-height:1.5; } .hgx-start ul{ margin:0 0 12px; padding-left:20px; line-height:1.5; }
.hgx-choice{ display:flex; gap:8px; flex-wrap:wrap; margin:8px 0; }
.hgx-pal{ display:flex; flex-wrap:wrap; gap:6px; margin:0 0 8px; align-items:center; }
.hgx-pal button{ display:flex; gap:6px; align-items:center; border:1px solid rgba(0,0,0,.15); background:#fff; color:#1d2433; border-radius:999px; padding:5px 11px 5px 6px; font:600 12.5px Inter,system-ui,sans-serif; cursor:pointer; }
.hgx-pal button i{ width:16px; height:16px; border-radius:50%; border:1px solid rgba(0,0,0,.2); } .hgx-pal button.on{ outline:3px solid var(--uc,#3b6fb6); } .hgx-cnt{ font-size:12px; opacity:.6; margin-left:auto; }
.hgx-leg{ font-size:12px; margin-top:4px; opacity:.85; }
.hgx-end{ text-align:center; padding:10px 4px; } .hgx-end h4{ margin:8px 0 4px; font-size:19px; } .hgx-end p{ margin:4px 0; }
.hgx-end-top{ display:flex; align-items:center; justify-content:center; gap:16px; } .hgx-end-sc b{ font-size:34px; color:var(--uc,#3b6fb6); display:block; line-height:1; } .hgx-end-sc span{ font-size:12px; opacity:.6; }
.hgx-stars i{ font-style:normal; font-size:34px; color:rgba(127,127,127,.3); } .hgx-stars i.on{ color:#f2b630; text-shadow:0 2px 6px rgba(242,182,48,.35); }
.hgx-best{ font-weight:700; color:#2f8a63; } .hgx-recap{ text-align:left; max-width:560px; margin:10px auto; font-size:13px; columns:2 220px; } .hgx-recap p{ margin:2px 0; break-inside:avoid; }
.hgx-pill{ display:inline-block; min-width:30px; text-align:center; border-radius:999px; padding:0 6px; font-weight:800; font-size:11.5px; color:#fff; } .hgx-pill.g{ background:#3aa66a; } .hgx-pill.m{ background:#e2a33a; } .hgx-pill.b{ background:#d9573a; }
.hgx-end-btns{ display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:12px; }
/* course page */
.hg-items > li.hgx-chh{ list-style:none; display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 10px; margin:14px 0 4px; padding:0 4px; border-bottom:1px dashed rgba(127,127,127,.3); }
.hg-items > li.hgx-chh:first-child{ margin-top:4px; }
.hgx-chh span{ font-size:10.5px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--uc); } .hgx-chh b{ font-size:13.5px; } .hgx-chh em{ font-style:normal; font-size:11.5px; opacity:.6; margin-left:auto; }
.hgx-chh.chk{ margin-top:18px; }
.hgx-gi .hg-ic{ color:var(--uc); } .hgx-gi > button b{ } .hgx-bestchip{ color:#2f8a63; font-weight:700; }
.hgx-big{ margin:6px 0 4px; padding:8px 12px; border-radius:12px; background:rgba(127,127,127,.08); font-size:13px; line-height:1.45; } .hgx-big p{ margin:0; } .hgx-big p+p{ margin-top:4px; } .hgx-big b{ color:var(--uc); }
/* the live-map mission card */
.hgx-ms{ position:fixed; right:16px; top:120px; z-index:2500; width:min(340px,calc(100vw - 24px)); background:#fff; color:#1d2433; border-radius:16px; box-shadow:0 14px 40px rgba(0,0,0,.3); border-top:5px solid var(--uc); font-size:14px; }
.hgx-ms-top{ display:flex; align-items:center; gap:6px; padding:8px 10px 6px 14px; cursor:move; font-weight:800; font-size:13px; } .hgx-ms-top span{ flex:1; }
.hgx-ms-top button{ border:0; background:rgba(127,127,127,.12); color:inherit; width:26px; height:26px; border-radius:8px; cursor:pointer; }
.hgx-ms-b{ padding:0 14px 14px; max-height:60vh; overflow:auto; } .hgx-ms.fold .hgx-ms-b{ display:none; }
.hgx-ms-r{ font-size:11.5px; font-weight:700; opacity:.6; } .hgx-ms-q{ font-size:15px; font-weight:700; margin:6px 0; line-height:1.35; } .hgx-ms-tip{ font-size:12.5px; opacity:.8; margin:4px 0; }
.hgx-ms-in{ display:flex; gap:6px; align-items:center; margin:8px 0; } .hgx-ms-in input{ width:120px; font:inherit; padding:7px 10px; border-radius:10px; border:2px solid #d8dee8; }
.hgx-ms-pin{ position:fixed; z-index:2400; width:14px; height:14px; margin:-7px 0 0 -7px; border-radius:50%; border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,.4); pointer-events:none; }
.hgx-ms-pin.guess{ background:#2b6fd0; } .hgx-ms-pin.real{ background:#d9573a; } .hgx-ms-pin span{ position:absolute; left:16px; top:-4px; white-space:nowrap; font:800 12.5px Inter,system-ui,sans-serif; color:#1d2433; background:#fff; padding:1px 6px; border-radius:6px; }
body.hgx-ms-arm #allMapsWrap, body.hgx-ms-arm .globe-canvas{ cursor:crosshair !important; }
/* games hub */
.hgx-hub{ max-width:980px; margin:8px auto 30px; padding:0 14px; } .hgx-hub h2{ margin:4px 0; } .hgx-hub > p{ opacity:.75; margin:0 0 12px; }
.hgx-hub section{ margin:0 0 14px; } .hgx-hub h3{ display:flex; gap:8px; align-items:center; font-size:16px; margin:0 0 6px; } .hgx-hub h3 span{ background:var(--uc); color:#fff; border-radius:8px; width:26px; height:26px; display:grid; place-items:center; font-size:14px; }
.hgx-hub-g{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:8px; }
.hgx-hub-g button{ text-align:left; border:2px solid transparent; border-left:5px solid var(--uc); background:#fff; color:#1d2433; border-radius:12px; padding:10px 12px; cursor:pointer; font:inherit; } .hgx-hub-g button:hover{ border-color:var(--uc); }
.hgx-hub-g b{ display:block; font-size:14px; } .hgx-hub-g small{ font-size:12px; opacity:.7; }
/* existing labs: buttons readable in the dark theme */
body:not(.light-theme) .hg-wb-tabs button:not(.on):not(.pri), body:not(.light-theme) .hg-gerry-side > button{ background:#24324d; color:#e6edf5; border-color:#3a4a6a; }
.hg-wb-tabs button:not(.on):not(.pri), .hg-gerry-side > button{ color:#1d2433; }
/* dark theme */
body:not(.light-theme) .hgx-atlas,body:not(.light-theme) .hgx-sea{ background:#14243c; fill:#14243c; } body:not(.light-theme) .hgx-grat{ stroke:#5b7fa6; }
body:not(.light-theme) .hgx-c{ fill:#3a4459; stroke:#16243b; } body:not(.light-theme) .hgx-c:hover{ fill:#4b5774; } body:not(.light-theme) .hgx-c.off{ fill:#273246; opacity:.7; }
body:not(.light-theme) .hgx-c.can{ fill:#56627d; stroke:#c9d3e6; stroke-opacity:.6; } body:not(.light-theme) .hgx-c.chk-ok{ stroke:#6fe0a0; } body:not(.light-theme) .hgx-c.chk-no{ stroke:#ff7a66; }
body:not(.light-theme) .hgx-land.hgx-onbg .hgx-c{ fill:transparent; stroke:#10192a; }
body:not(.light-theme) .hgx-mt,body:not(.light-theme) .hgx-lb{ fill:#fff; stroke:#0d1626; } body:not(.light-theme) .hgx-gl text{ fill:#9cc0e3; } body:not(.light-theme) .hgx-line.dash{ stroke:#e6edf5; }
body:not(.light-theme) .hgx-zb button,body:not(.light-theme) .hgx-btn:not(.pri),body:not(.light-theme) .hgx-pal button{ background:#24324d; color:#e6edf5; border-color:#3a4a6a; }
body:not(.light-theme) .hgx-fb.ok{ background:#1f3a2a; } body:not(.light-theme) .hgx-fb.mid{ background:#3a3220; } body:not(.light-theme) .hgx-fb.no{ background:#3d2323; }
body:not(.light-theme) .hgx-ms{ background:#1c2333; color:#e8ecf3; } body:not(.light-theme) .hgx-ms-in input{ background:#151b29; color:inherit; border-color:#3a4560; }
body:not(.light-theme) .hgx-hub-g button{ background:#1c2333; color:#e8ecf3; }
@media (max-width:640px){ .hgx-q{ font-size:14px; } .hgx-recap{ columns:1; } .hgx-ms{ right:8px; left:8px; top:auto; bottom:8px; width:auto; } .hgx-map{ max-height:50vh; } .hg-q-box.hgx-wide .hg-lab-body{ padding:10px 10px 14px; } }
`;document.head.appendChild(css);

/* new feedback in a game window scrolls into view (the map can push it below the fold) */
function watchFb(root){if(!root||root._hgxObs)return;root._hgxObs=1;try{new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1&&(n.matches(".hgx-fb,.hgx-fbw .hgx-btn")||n.querySelector&&n.querySelector(".hgx-fb"))){const t=n;setTimeout(()=>{try{t.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}},60);return}}}).observe(root,{childList:true,subtree:true})}catch(e){}}
window.HGX={esc,shuffle,clamp,km,fmt,night,D,atlas,hud,finish,stars,toast,btn,h,hunt,pick,paint,mission,missionStop,liveMode,liveFly,ST,save,feat,feats,CUR,
 /* add labs to a unit: each lab can carry ch (the tour it belongs after), wide, skill */
 add(uid,labs,at){const A=HUG.labs[uid]=HUG.labs[uid]||[];labs.forEach(L=>{const i=A.findIndex(x=>x.id===L.id);if(i>=0)A[i]=L;else if(at!=null)A.splice(at++,0,L);else A.push(L)})},
 set(uid,id,o){const L=(HUG.labs[uid]||[]).find(x=>x.id===id);if(L)Object.assign(L,o);return L},
 drop(uid,id){const A=HUG.labs[uid]||[];const i=A.findIndex(x=>x.id===id);if(i>=0)A.splice(i,1)}};
})();
