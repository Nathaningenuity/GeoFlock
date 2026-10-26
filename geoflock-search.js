/* GeoFlock: Maps search beyond countries.
   - cities: fly there, centred, zoomed out enough for context, with a marker
   - islands, island chains, peninsulas, seas, lakes, rivers: flash the shape, then keep a soft highlight
   - peaks, volcanoes, waterfalls: the map icon and its name
   - mountain ranges, deserts, forests: flash, then keep that one landform drawn in its Landforms colour
   - landmarks (the Pyramids, the Eiffel Tower…): fly there and show the landmark's photo on the map, like the tours' photo
     pins; cities, peaks, waterfalls and others with a photo in the library show theirs too
   - states and provinces (for the countries in States & provinces): flash the shape
   An × in the search box (or Esc) clears whatever the search added. Works on the flat map and the globe, in every
   Maps mode except Deep Time and Projections. */
(function(){
if(typeof LANDFORMS==="undefined"||typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[’'`.]/g,"").replace(/\s+/g," ").trim();
const STRIP=/^(the |mount |mt |lake |loch |river |isla |isle of |gulf of |bay of |sea of |strait of |cape )/;
const COL={landmarks:"#b5651d",provinces:"#6a4fb0",seas:"#2f7fc4",ranges:"#8d5a2b",peaks:"#2b2b2b",volcanoes:"#d9480f",deserts:"#e2ad2c",forests:"#2f8a3e",rivers:"#1c64c8",lakes:"#4aa3e0",groups:"#c2259a",islands:"#e0569f",peninsulas:"#7d3cc8",cities:"#c0392b",waterfalls:"#1c64c8"};
const TYPE={landmarks:"landmark",provinces:"state or province",seas:"sea",ranges:"mountain range",peaks:"mountain",volcanoes:"volcano",deserts:"desert",forests:"forest",rivers:"river",lakes:"lake",groups:"island chain",islands:"island",peninsulas:"peninsula",cities:"city",waterfalls:"waterfall"};
const EMO={landmarks:"🏛️",provinces:"🗺️",seas:"🌊",ranges:"⛰️",peaks:"🏔️",volcanoes:"🌋",deserts:"🏜️",forests:"🌳",rivers:"〰️",lakes:"💧",groups:"🏝️",islands:"🏝️",peninsulas:"🗺️",cities:"🏙️",waterfalls:"💦"};
/* how each type is shown: zoom = fly to a point; flash = flash then soft highlight; icon = map icon; layer = flash then keep it drawn */
const SHOW={landmarks:"photo",provinces:"flash",cities:"city",peaks:"icon",volcanoes:"icon",waterfalls:"icon",islands:"flash",groups:"flash",peninsulas:"flash",seas:"flash",lakes:"flash",rivers:"flash",ranges:"layer",deserts:"layer",forests:"layer"};
let IDX=null;
/* which seas belong to which (roughly following the International Hydrographic Organization's limits). Only used by search:
   searching a sea also lights up its bays, gulfs and smaller seas. Everywhere else they stay separate. */
const SEA_PARENT=window.GF_SEA_PARENT||{};
/* a sea with everything inside it */
function withParts(e){if(e.cat!=="seas")return e;const kids=n=>Object.keys(SEA_PARENT).filter(k=>SEA_PARENT[k]===n),seen=new Set(),all=[];const walk=n=>{if(seen.has(n))return;seen.add(n);all.push(n);kids(n).forEach(walk)};walk(e.n);
 if(all.length<2)return e;const polys=[];all.forEach(n=>{const x=IDX.find(y=>y.cat==="seas"&&y.n===n&&y.g);if(x&&x.g.type==="MultiPolygon")x.g.coordinates.forEach(c=>polys.push(c))});
 return Object.assign({},e,{g:{type:"MultiPolygon",coordinates:polys},parts:all.length})}
function geomOf(g){if(!g)return null;if(g.t==="pt")return{type:"Point",coordinates:g.c};if(g.t==="line")return{type:"MultiLineString",coordinates:g.c};if(g.t==="poly"){/* either a list of rings or (seas) a list of polygons */const deep=Array.isArray(g.c[0]&&g.c[0][0]&&g.c[0][0][0]);return{type:"MultiPolygon",coordinates:deep?g.c:g.c.map(r=>[r])}}return null}
function build(){if(IDX)return IDX;IDX=[];const seen=new Set();
 LANDFORMS.items.forEach(o=>{if(/__L\d$/.test(o.id||""))return;const cat=o.kind==="waterfall"||o.wf?"waterfalls":o.cat;if(!SHOW[cat])return;const g=geomOf(o.geom);if(!g)return;
  const e={n:o.name,alt:o.alt||[],cat,g,ll:g.type==="Point"?g.coordinates:d3.geoCentroid(g),h:o.size&&o.size.height_m,fame:o.fame||3};IDX.push(e);seen.add(cat+"|"+norm(o.name))});
 /* more peaks from the map's own peak list (positions stored on the flat map: turn them back into longitude and latitude) */
 try{const P=d3.geoRobinson().scale(318.31).translate([1e3,500.5]),dl=typeof SPIN!=="undefined"?SPIN.A.dl:0;
  const pts=IDX.filter(e=>e.cat==="peaks"||e.cat==="volcanoes");(LANDFORM_DATA.peaks||[]).forEach(r=>{const k="peaks|"+norm(r[0]);if(seen.has(k)||seen.has("volcanoes|"+norm(r[0])))return;let ll=P.invert([r[2],r[3]]);if(!ll)return;ll=[((ll[0]-dl+540)%360)-180,ll[1]];if(pts.some(e=>d3.geoDistance(e.ll,ll)<.006))return;seen.add(k);IDX.push({n:r[0],alt:[],cat:"peaks",g:{type:"Point",coordinates:ll},ll,h:r[1],fame:r[4]||3})})}catch(e){console.error(e)}
 try{const P=d3.geoRobinson().scale(318.31).translate([1e3,500.5]),dl=typeof SPIN!=="undefined"?SPIN.A.dl:0;
  (ALLMAPS_CITIES||[]).forEach(r=>{const k="cities|"+norm(r[0]);if(seen.has(k))return;let ll=P.invert([r[3],r[4]]);if(!ll)return;ll=[((ll[0]-dl+540)%360)-180,ll[1]];seen.add(k);IDX.push({n:r[0],alt:[],cat:"cities",g:{type:"Point",coordinates:ll},ll,fame:r[2]||3})})}catch(e){console.error(e)}
 /* landmarks (a landmark that is also a waterfall or a peak replaces that entry, keeping its photo and icon) */
 (window.GF_LANDMARKS||[]).forEach(r=>{const ll=[r[1],r[2]],k=norm(r[0]);IDX=IDX.filter(e=>!(norm(e.n)===k&&e.cat!=="landmarks"&&(e.g.type==="Point")));IDX.push({n:r[0],alt:r[6]||[],cat:"landmarks",g:{type:"Point",coordinates:ll},ll,fame:1,icon:r[4],phf:r[5],cc:r[3]})});
 /* states and provinces (names and centres; the shape is loaded when one is chosen) */
 (PROV||[]).forEach(r=>{IDX.push({n:r[0],alt:[],cat:"provinces",cc:r[1],g:{type:"Point",coordinates:[r[2],r[3]]},ll:[r[2],r[3]],fame:2,typ:provKind(r[1])})});
 {const isl=new Set(IDX.filter(e=>e.cat==="islands").map(e=>norm(e.n)));IDX=IDX.filter(e=>!(e.cat==="groups"&&isl.has(norm(e.n))))}
 /* a name that is both a lake and a sea (the Caspian, Aral and Dead Seas) is kept once, as a lake */
 {const lk=new Set(IDX.filter(e=>e.cat==="lakes").map(e=>norm(e.n)));IDX=IDX.filter(e=>!(e.cat==="seas"&&lk.has(norm(e.n))))}
 IDX.forEach(e=>{e.keys=[e.n].concat(e.alt).map(norm);e.keys=e.keys.concat(e.keys.map(k=>k.replace(STRIP,"")))});return IDX}
/* states and provinces: the name list is small and loaded once; each shape comes with its country's file */
let PROV=null;function loadProv(){if(PROV)return;PROV=[];fetch("provinces/names.json").then(r=>r.ok?r.json():[]).then(d=>{PROV=d;if(IDX){IDX=null}}).catch(()=>{})}
function provKind(cc){try{const L=(window.gfProvinces&&gfProvinces.LIST||[]).find(x=>x[0]===cc);const k=L?L[2]:"province";return(k.includes(" or ")?k.split(" or ")[0]:k)+" of "+((COUNTRY_BY_CODE||{})[cc]||{n:cc.toUpperCase()}).n}catch(e){return"province"}}
/* a place's photo: its landmark photo; else a library photo whose file is named after it ("Amazon River - 2018.jpg",
   "Lake Baikal…"); else a country-profile photo captioned with its name. Looked up when the place is shown. */
let FN=null;function phFor(e){if(e.phf!==undefined)return e.phf;e.phf=null;if(e.cat==="seas"&&/Ocean$/.test(e.n))return null;try{if(typeof gfMergeExtra==="function")gfMergeExtra();
 if(!FN)FN=PS_PHOTO_DATA.filter(x=>x&&x.d&&x.f).map(x=>[norm(x.f.replace(/\.[a-z]+$/i,"")),x.f]);const n=norm(e.n);
 const tries={rivers:[n+" river","river "+n,"rio "+n,n],lakes:[n,"lake "+n],islands:[n+" island",n],groups:[n+" islands",n],peaks:[n,"mount "+n],volcanoes:[n,"mount "+n],deserts:[n+" desert",n],ranges:[n+" mountains",n],forests:[n],waterfalls:[n],seas:[n],peninsulas:[n+" peninsula",n],cities:[]}[e.cat]||[];
 for(const t of tries){if(t.length<4)continue;const hit=FN.find(([k])=>k===t||k.startsWith(t+" ")||k.startsWith(t+",")||k.startsWith(t+"-"));if(hit){e.phf=hit[1];return e.phf}}
 const NP=window.GF_NAMEPH||{};for(const k of e.keys){if(NP[k]){e.phf=NP[k];return e.phf}}}catch(err){}return e.phf}
/* a photo from the site's library, by its Commons file name */
function photoOf(f){if(!f)return null;try{if(typeof gfMergeExtra==="function")gfMergeExtra();const P=PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d);return P||null}catch(e){return null}}
/* typo tolerance: "misisipi" finds Mississippi. Letters doubled by mistake or not are ignored, and a few slips are allowed
   depending on length, compared with the whole name and with its beginning (for names still being typed) */
const squash=s=>s.replace(/(.)\1+/g,"$1").replace(/ph/g,"f").replace(/y/g,"i").replace(/ou/g,"u").replace(/ck/g,"k");
function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];let lo=i;for(let j=1;j<=b.length;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));lo=Math.min(lo,c[j])}if(lo>max)return max+1;p=c}return p[b.length]}
function score(q,keys){let best=9;const sq=squash(q),max=q.length>=8?2:q.length>=4?1:0;
 for(const k of keys){if(k===q)return 0;if(k.startsWith(q))best=Math.min(best,1);else if(k.split(/[ -]/).some(w=>w.startsWith(q)))best=Math.min(best,2);else if(q.length>=4&&k.includes(q))best=Math.min(best,3);
  if(best>3&&max){const sk=squash(k);if(sk===sq||sk.startsWith(sq))best=Math.min(best,4);else{const d=Math.min(lev(sq,sk,max),lev(sq,sk.slice(0,sq.length),max));if(d<=max)best=Math.min(best,4+d)}}}
 return best}
function find(q,all){q=norm(q);if(q.length<2)return[];const out=[];build().forEach(e=>{const best=score(q,e.keys);if(best<9)out.push([best,e.fame||3,e])});
 out.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2].n.length-b[2].n.length);return all?out.slice(0,8):out.slice(0,7).map(x=>x[2])}
const active=()=>typeof appMode!=="undefined"&&appMode==="allmaps"&&!(typeof proj!=="undefined"&&proj.on)&&!(()=>{const d=document.getElementById("gfDeep");return d&&!d.hidden})();
const onGlobe=()=>{try{return typeof amGlobeOn==="function"&&amGlobeOn()&&typeof amGlobe!=="undefined"&&!!amGlobe}catch(e){return false}};
/* ---------- the current result ---------- */
let CUR=null,t0=0,raf=0;
function clear(){CUR=null;cancelAnimationFrame(raf);document.querySelectorAll(".gfs-leash").forEach(x=>x.remove());const l=document.querySelector("#allMapsWrap svg #gfSearchLayer");if(l)l.remove();document.querySelectorAll(".gfs-pin").forEach(x=>x.remove());try{if(onGlobe())amGlobe.request()}catch(e){}xBtn()}
function show(e){clear();if(!active())return;
 if(e.cat==="provinces"&&!e.shape){const c=e;if(window.gfProvinces)gfProvinces.load(c.cc).then(d=>{const it=d.items.find(x=>x.n===c.n);if(it){c.g=it.g;c.ll=it.c||c.ll;c.shape=1}show(c)}).catch(()=>{c.shape=1;show(c)});return}
 e=withParts(e);if(/^Pacific Ocean$/.test(e.n))e.ll=[-160,0];if(/^Atlantic Ocean$/.test(e.n))e.ll=[-30,0];CUR=e;t0=performance.now();fly(e);draw();xBtn();
 const tick=()=>{if(!CUR)return;draw();if(performance.now()-t0<2600)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)}
/* flash: three pulses, then settle to a steady level */
function alpha(){const t=(performance.now()-t0)/1000;if(t>2.4)return 1;return .45+.55*Math.abs(Math.sin(t*Math.PI*1.25))}
function fly(e){const pt=e.g.type==="Point";
 if(onGlobe()){const b=pt?null:d3.geoBounds(e.g);let r=.06;if(b){const c=e.ll;[[b[0][0],b[0][1]],[b[1][0],b[1][1]],[b[0][0],b[1][1]],[b[1][0],b[0][1]]].forEach(p=>{r=Math.max(r,d3.geoDistance(p,c))});if(b[0][0]>b[1][0])r=Math.max(r,.5)}
  const zTo=pt?(e.cat==="cities"?4.5:4):Math.max(1,Math.min(9,.5/Math.max(.03,r)));const G=amGlobe,from=[-G.rot[0],-G.rot[1]],z0=G.zoom,to=e.ll,st=performance.now(),D=900,ip=d3.geoInterpolate(from,to);
  const step=n=>{const k=Math.min(1,(n-st)/D),s=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(s);G.rot=[-c[0],-c[1]];G.zoom=Math.exp(Math.log(z0)+(Math.log(zTo)-Math.log(z0))*s);G.render();if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);return}
 /* the Pacific is cut by the map's edge: turn the flat map to put it in the middle */
 if(/Pacific/.test(e.n)&&e.cat==="seas"&&typeof spinTo==="function"){try{spinTo("A",160)}catch(err){}}
 /* anything else cut by the map's edge (the Bering Sea, Fiji's seas): turn the map so it sits in the middle, then fly */
 else if(!pt&&typeof spinTo==="function"&&!e._spun){try{const bw=d3.geoPath(GLOBE_ROBINSON).bounds(e.g);if(bw[1][0]-bw[0][0]>1500&&d3.geoArea(e.g)<1){e._spun=1;spinTo("A",-Math.round(e.ll[0]));setTimeout(()=>{fly(e);e._spun=0},80);return}}catch(err){}}
 const w=document.getElementById("allMapsWrap");if(!w||!w._panZoom)return;const P=GLOBE_ROBINSON,path=d3.geoPath(P);let x0,y0,x1,y1;
 if(pt){const p=P(e.ll);if(!p)return;const W=e.cat==="cities"?230:200;x0=p[0]-W/2;x1=p[0]+W/2;y0=p[1]-W/4;y1=p[1]+W/4}
 else{const bb=path.bounds(e.g);x0=bb[0][0];y0=bb[0][1];x1=bb[1][0];y1=bb[1][1];if(x1-x0>1500){const p=P(e.ll);x0=p[0]-300;x1=p[0]+300;y0=p[1]-150;y1=p[1]+150}
  const cx=(x0+x1)/2,cy=(y0+y1)/2;let ww=Math.max(140,(x1-x0)*1.5),hh=Math.max(70,(y1-y0)*1.5);if(ww<hh*2)ww=hh*2;else hh=ww/2;x0=cx-ww/2;x1=cx+ww/2;y0=cy-hh/2;y1=cy+hh/2}
 const box={x:x0,y:y0,w:x1-x0,h:y1-y0};try{typeof pzFly==="function"?pzFly(w,box):w._panZoom.setBox(box)}catch(err){w._panZoom.setBox(box)}}
/* ---------- drawing ---------- */
function draw(){if(!CUR)return;const e=CUR,mode=SHOW[e.cat],col=COL[e.cat]||"#c2259a",a=alpha();
 if(mode==="icon"||mode==="city"||mode==="photo"||phFor(e))pin(e);
 if(onGlobe()){try{amGlobe.request()}catch(err){}return}
 const svg=document.querySelector("#allMapsWrap svg");if(!svg||mode==="icon"||mode==="city"||mode==="photo"){return}
 let g=svg.querySelector("#gfSearchLayer");if(g&&g!==svg.lastElementChild)svg.appendChild(g);if(!g){g=document.createElementNS("http://www.w3.org/2000/svg","g");g.id="gfSearchLayer";g.setAttribute("pointer-events","none");g.setAttribute("data-spin","no");svg.appendChild(g)}
 const d=d3.geoPath(GLOBE_ROBINSON)(e.g)||"",line=e.g.type==="MultiLineString",keep=mode==="layer"?.62:.36,fo=(a<1?a*.8:keep);
 if(g._d!==d){g._d=d;g.innerHTML=line?'<path class="gfs-case" d="'+d+'"/><path class="gfs-line" d="'+d+'"/>':'<path class="gfs-fill" d="'+d+'"/><path class="gfs-edge" d="'+d+'"/>'}
 g.style.setProperty("--gfs",col);g.style.setProperty("--gfa",fo.toFixed(3));g.style.setProperty("--gfe",(a<1?Math.max(a,.6):1).toFixed(3))}
/* globe: shapes drawn on the globe canvas */
function globeDraw(ctx,p){if(!CUR||!active())return;const e=CUR,mode=SHOW[e.cat];if(mode==="icon"||mode==="city")return pin(e);if(mode==="photo")return pin(e);const col=COL[e.cat],a=alpha(),keep=mode==="layer"?.62:.28,path=d3.geoPath(p,ctx);
 ctx.save();ctx.beginPath();path(e.g);if(e.g.type==="MultiLineString"){ctx.lineJoin=ctx.lineCap="round";ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=col;ctx.globalAlpha=a<1?a:1;ctx.lineWidth=3;ctx.stroke()}
 else{ctx.globalAlpha=a<1?a*.8:keep;ctx.fillStyle=col;ctx.fill();{ctx.globalAlpha=1;ctx.lineWidth=4.5;ctx.strokeStyle="rgba(255,255,255,.75)";ctx.stroke();ctx.globalAlpha=a<1?Math.max(a,.6):1;ctx.lineWidth=2.6;ctx.strokeStyle=col;ctx.stroke()}}ctx.restore();pin(e,true)}
/* the icon or city marker, as an HTML pin positioned over the map */
function screenOf(ll){if(onGlobe()){const G=amGlobe,pr=G.projection(),c=[-G.rot[0],-G.rot[1]];if(d3.geoDistance(ll,c)>Math.PI/2-.02)return null;const p=pr(ll);if(!p)return null;const r=G.canvas.getBoundingClientRect();return[r.left+p[0],r.top+p[1]]}
 const svg=document.querySelector("#allMapsWrap svg");if(!svg)return null;const p=GLOBE_ROBINSON(ll);if(!p)return null;const m=svg.getScreenCTM();if(!m)return null;return[p[0]*m.a+m.e,p[1]*m.d+m.f]}
function pin(e,labelOnly){const wrap=document.getElementById("allMapsWrap")&&document.getElementById("allMapsView")||document.body;const host=document.getElementById("allMapsView")||document.body;
 const mode=SHOW[e.cat];if(labelOnly&&mode!=="icon"&&mode!=="city"&&mode!=="photo"&&!phFor(e))return;let el=document.querySelector(".gfs-pin");
 const P=photoOf(phFor(e));
 if(!el&&P){/* the photo card, like the tours' photo pins: photo and name; click for the big photo */
  el=document.createElement("div");el.className="gfs-pin gfs-photo";const ic="";
  el.innerHTML='<button type="button" class="gfs-card" aria-label="Photo of '+esc(e.n)+'"><img src="'+esc(typeof gfSrc==="function"?gfSrc(P.d):P.d)+'" alt="">'+ic+'</button><span class="gfs-lab">'+esc(e.n)+(e.h?' <small>'+Math.round(e.h).toLocaleString()+' m</small>':'')+'</span><span class="gfs-tip"></span>';
  /* drag the card anywhere (a line keeps it tied to the place); a click without dragging opens the big photo */
  const card=el.querySelector(".gfs-card");card.addEventListener("pointerdown",ev=>{ev.preventDefault();ev.stopPropagation();const o=e._off||[0,0],x0=ev.clientX,y0=ev.clientY;let moved=false;try{card.setPointerCapture(ev.pointerId)}catch(err){}
   const mv=m=>{const dx=m.clientX-x0,dy=m.clientY-y0;if(!moved&&Math.hypot(dx,dy)<4)return;moved=true;e._off=[o[0]+dx,o[1]+dy];pin(e)};
   const up=()=>{card.removeEventListener("pointermove",mv);card.removeEventListener("pointerup",up);card.removeEventListener("pointercancel",up);if(!moved){try{psPhotoOpen(P,e.n)}catch(err){}}};
   card.addEventListener("pointermove",mv);card.addEventListener("pointerup",up);card.addEventListener("pointercancel",up)});
  ["click","mousedown","wheel"].forEach(t=>card.addEventListener(t,ev=>ev.stopPropagation()));document.body.appendChild(el)}
 if(!el){el=document.createElement("div");el.className="gfs-pin gfs-"+mode;const ic=e.cat==="volcanoes"?"volcano":e.cat==="waterfalls"?"waterfall":"mountain";
  el.innerHTML=(mode==="city"?'<span class="gfs-dot"></span>':'<span class="gfs-ic" style="--ipc:'+COL[e.cat]+'">'+(typeof psIconSVG==="function"?psIconSVG(ic):"▲")+'</span>')+'<span class="gfs-lab">'+esc(e.n)+(e.h?' <small>'+Math.round(e.h).toLocaleString()+' m</small>':'')+'</span>';document.body.appendChild(el)}
 const s=screenOf(e.ll);if(!s){el.style.display="none";return}const wr=(onGlobe()?amGlobe.canvas:document.querySelector("#allMapsWrap")).getBoundingClientRect();
 if(s[0]<wr.left||s[0]>wr.right||s[1]<wr.top||s[1]>wr.bottom){el.style.display="none";return}el.style.display="";const off=el.classList.contains("gfs-photo")&&e._off||[0,0];el.style.left=(s[0]+scrollX+off[0])+"px";el.style.top=(s[1]+scrollY+off[1])+"px";
 /* the line from a moved card back to its place */
 if(el.classList.contains("gfs-photo")){let ln=document.querySelector(".gfs-leash");const far=Math.hypot(off[0],off[1])>8;if(!far){if(ln)ln.remove();el.classList.remove("gfs-moved")}else{if(!ln){ln=document.createElement("div");ln.className="gfs-leash";document.body.appendChild(ln)}el.classList.add("gfs-moved");
  const x1=s[0]+scrollX,y1=s[1]+scrollY,x2=x1+off[0],y2=y1+off[1]-4,len=Math.hypot(x2-x1,y2-y1),ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI;ln.style.cssText="left:"+x1+"px;top:"+y1+"px;width:"+len+"px;transform:rotate("+ang+"deg)"}}}
/* the map adds its own layers after a search is drawn; keep the search highlight on top of them */
setInterval(()=>{if(!CUR)return;const svg=document.querySelector("#allMapsWrap svg"),g=svg&&svg.querySelector("#gfSearchLayer");if(g&&g!==svg.lastElementChild)svg.appendChild(g)},400);
/* keep things in place as the map moves */
function follow(){if(!CUR)return;try{if(!active()){clear();return}const m=SHOW[CUR.cat];if(m==="icon"||m==="city"||m==="photo"||phFor(CUR))pin(CUR);if(m!=="icon"&&m!=="city"&&m!=="photo"&&!onGlobe())draw()}catch(e){}}
new MutationObserver(follow).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:["viewBox"]});
addEventListener("scroll",follow,{passive:true});addEventListener("resize",follow);
if(typeof GlobeView!=="undefined"){const _r=GlobeView.prototype.render;GlobeView.prototype.render=function(){const cfg=this.cfg;if(typeof amGlobe!=="undefined"&&this===amGlobe&&cfg&&!cfg._gfs){cfg._gfs=1;const d0=cfg.drawExtra;cfg.drawExtra=(ctx,p,g)=>{if(d0)d0(ctx,p,g);globeDraw(ctx,p)}}return _r.apply(this,arguments)}}
if(typeof spinTo==="function"){const _s=spinTo;spinTo=function(){const r=_s.apply(this,arguments);try{if(CUR){const l=document.querySelector("#allMapsWrap svg #gfSearchLayer");if(l)l._d=null;setTimeout(()=>{draw();follow()},30)}}catch(e){}return r}}
if(typeof renderAllMapsView==="function"){const _ra=renderAllMapsView;renderAllMapsView=function(){const r=_ra.apply(this,arguments);try{if(CUR){setTimeout(()=>{const l=document.querySelector("#allMapsWrap svg #gfSearchLayer");if(l)l._d=null;draw();follow()},60)}}catch(e){}return r}}
if(typeof switchAppMode==="function"){const _sm=switchAppMode;switchAppMode=function(){const r=_sm.apply(this,arguments);try{if(CUR&&!active())clear()}catch(e){}return r}}
/* ---------- the search box ---------- */
function xBtn(){const wrap=document.getElementById("globalSearchWrap");if(!wrap)return;let b=document.getElementById("gfsX");
 if(!CUR){if(b)b.remove();return}if(!b){b=document.createElement("button");b.type="button";b.id="gfsX";b.setAttribute("aria-label","Clear the search");b.onclick=e=>{e.stopPropagation();const i=document.getElementById("globalSearchInput");if(i)i.value="";clear()};wrap.appendChild(b)}
 b.innerHTML='<span>'+EMO[CUR.cat]+' '+esc(CUR.n)+'</span><b>×</b>'}
function wire(){loadProv();const input=document.getElementById("globalSearchInput"),box=document.getElementById("globalSearchSuggestions");if(!input||!box||input._gfs)return;input._gfs=1;
 input.addEventListener("input",()=>{if(!active())return;const q=input.value.trim();box.querySelectorAll(".gfs-res").forEach(x=>x.remove());if(!q)return;
  /* the site's own country suggestions are kept, but scored the same way as places, and weak guesses are dropped */
  const nq=norm(q),ctry=[...box.querySelectorAll(".global-search-result[data-code]")].map(el=>{const c=(COUNTRY_BY_CODE||{})[el.dataset.code];const keys=c?[c.n].concat((typeof COUNTRY_ALIASES!=="undefined"&&COUNTRY_ALIASES[c.c])||[]).map(norm):[];return{el,s:score(nq,keys),f:1}});
  const R=find(q,true);const best=Math.min(9,...ctry.map(x=>x.s),...R.map(x=>x[0]));
  const items=ctry.filter(x=>x.s<9||best>=9).map(x=>({s:x.s<9?x.s:8.5,f:0,el:x.el})).concat(R.map(([sc,f,e],i)=>({s:sc,f:f,e})));
  /* drop fuzzy guesses once anything matches properly */
  const keep=items.filter(x=>best<=3?x.s<=3:true).sort((a,b)=>a.s-b.s||a.f-b.f).slice(0,8);
  box.innerHTML="";const shown=[];keep.forEach(x=>{if(x.el){box.appendChild(x.el);return}const k=shown.push(x.e)-1;box.insertAdjacentHTML("beforeend",'<div class="global-search-result gfs-res" data-i="'+k+'"><span class="gfs-emo">'+EMO[x.e.cat]+'</span><span>'+esc(x.e.n)+'</span><span class="gsr-cap">'+(x.e.typ||TYPE[x.e.cat])+'</span></div>')});
  if(best>=4&&keep.length)box.insertAdjacentHTML("afterbegin",'<div class="gfs-did">Did you mean…</div>');
  box.querySelectorAll(".gfs-res").forEach(el=>el.onclick=()=>{const e=shown[+el.dataset.i];input.value="";box.innerHTML="";show(e)})});
 input.addEventListener("keydown",e=>{if(e.key==="Escape"&&CUR)clear()})}
wire();document.addEventListener("DOMContentLoaded",wire);setTimeout(wire,1500);
if(typeof renderChrome==="function"){const _rc=renderChrome;renderChrome=function(){const r=_rc.apply(this,arguments);try{wire();const i=document.getElementById("globalSearchInput");if(i&&active())i.placeholder="Search a country, city, river, mountain…";else if(i&&i.placeholder.startsWith("Search a country, city"))i.placeholder="Search for a country…";xBtn()}catch(e){}return r}}
const css=document.createElement("style");css.textContent=`
#gfSearchLayer path{ vector-effect:non-scaling-stroke; }
#gfSearchLayer .gfs-fill{ fill:var(--gfs) !important; fill-opacity:var(--gfa,.3) !important; stroke:none !important; }
#gfSearchLayer .gfs-edge{ fill:none !important; stroke:var(--gfs) !important; stroke-opacity:var(--gfe,1) !important; stroke-width:3px !important; stroke-linejoin:round; filter:drop-shadow(0 0 1.5px rgba(255,255,255,.9)); }
#gfSearchLayer .gfs-case{ fill:none !important; stroke:#fff !important; stroke-opacity:.9; stroke-width:6px !important; stroke-linecap:round; stroke-linejoin:round; }
#gfSearchLayer .gfs-line{ fill:none !important; stroke:var(--gfs) !important; stroke-opacity:var(--gfe,1) !important; stroke-width:3.4px !important; stroke-linecap:round; stroke-linejoin:round; }
.gfs-pin{ position:absolute; z-index:40; pointer-events:none; transform:translate(-50%,-100%); display:flex; flex-direction:column; align-items:center; animation:gfsIn .4s cubic-bezier(.2,1.4,.4,1); }
.gfs-pin.gfs-city{ transform:translate(-50%,-50%); flex-direction:row; gap:6px; }
@keyframes gfsIn{ from{ opacity:0; margin-top:-10px } to{ opacity:1; margin-top:0 } }
.gfs-ic{ width:34px; height:34px; display:block; color:var(--ipc); filter:drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
.gfs-ic svg{ width:100%; height:100%; display:block; } .gfs-ic svg *{ fill:var(--ipc); }
.gfs-lab{ margin-top:2px; background:rgba(16,28,48,.9); color:#fff; font:700 12.5px/1.2 system-ui,sans-serif; padding:3px 8px; border-radius:999px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.3); }
.gfs-lab small{ opacity:.75; font-weight:600; }
.gfs-dot{ width:12px; height:12px; border-radius:50%; background:#c0392b; border:2px solid #fff; box-shadow:0 0 0 6px rgba(192,57,43,.25); }
.gfs-city .gfs-lab{ margin-top:0; }
#globalSearchWrap{ position:relative; }
.gfs-pin.gfs-photo{ pointer-events:none; transform:translate(-50%,-100%); }
.gfs-card{ pointer-events:auto; position:relative; width:96px; height:96px; padding:0; border:3px solid #fff; border-radius:14px; overflow:visible; background:#ddd; box-shadow:0 6px 16px rgba(0,0,0,.35); cursor:zoom-in; }
.gfs-card img{ width:100%; height:100%; object-fit:cover; border-radius:11px; display:block; }
.gfs-pic{ position:absolute; right:-12px; top:-12px; width:30px; height:30px; padding:5px; border-radius:50%; background:#fff; box-shadow:0 2px 6px rgba(0,0,0,.3); color:var(--ipc); }
.gfs-pic svg{ width:100%; height:100%; display:block; } .gfs-pic svg *{ fill:var(--ipc); }
.gfs-photo .gfs-lab{ margin-top:6px; }
.gfs-card{ cursor:grab; touch-action:none; } .gfs-card:active{ cursor:grabbing; }
.gfs-leash{ position:absolute; z-index:39; height:2px; background:rgba(16,28,48,.75); transform-origin:0 50%; pointer-events:none; box-shadow:0 0 0 1px rgba(255,255,255,.6); }
.gfs-leash::before{ content:""; position:absolute; left:-5px; top:-4px; width:10px; height:10px; border-radius:50%; background:#c0392b; border:2px solid #fff; }
.gfs-photo.gfs-moved .gfs-tip{ visibility:hidden; }
.gfs-tip{ width:0; height:0; border:7px solid transparent; border-top-color:rgba(16,28,48,.9); margin-top:-1px; }
@media (max-width:600px){ .gfs-card{ width:72px; height:72px; } }
#gfsX{ position:absolute; left:0; top:calc(100% + 6px); display:flex; gap:8px; align-items:center; border:0; border-radius:999px; padding:5px 6px 5px 12px; background:rgba(16,28,48,.88); color:#fff; font:600 12.5px/1 system-ui,sans-serif; cursor:pointer; z-index:30; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.25); }
#gfsX b{ display:inline-flex; width:20px; height:20px; border-radius:50%; background:rgba(255,255,255,.18); align-items:center; justify-content:center; font-size:15px; }
#gfsX:hover b{ background:#e8701a; }
.gfs-did{ padding:6px 14px 2px; font-size:12px; opacity:.6; font-style:italic; }
.gfs-res .gfs-emo{ width:28px; text-align:center; font-size:18px; }`;
document.head.appendChild(css);
window.gfSearch={find,show,clear,build};
})();
