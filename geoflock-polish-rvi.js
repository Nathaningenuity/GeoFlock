/* GeoFlock polish RV-I: a stop-by-stop review of four tours (The Earth at night, The Earth from space, Geopolitics,
   How countries are run), looked at on their own map mode at 1280×860.
   1. Fixes, keyed "tour|stop title" and applied each time the stop opens (psGo is wrapped, as in geoflock-polish-rvi.js,
      and the fixed fields are pinned with non-configurable getters, because several sweep files set framing and card
      side again from their own psGo wrappers). A field another file has already pinned is left alone.
   2. Stops you can play with: a layer over the Maps globe and a control block on the card right after the stop's
      headline, with a one-line instruction (pattern of geoflock-polish-rvi.js).
   Everything goes (layer, card block, timers) as soon as the stop changes or the tour ends. Next and Back are never
   blocked; every step is wrapped in try/catch. CSS classes start with "rvi-". */
(function(){
"use strict";
if(window.gfPolishRVI)return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const NS="http://www.w3.org/2000/svg";
const SET=(S,k,v)=>{try{S[k]=v}catch(e){}if(S[k]!==v)try{const d=Object.getOwnPropertyDescriptor(S,k);if(!d||d.configurable)Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};


/* ============================================================ 1. stop fixes
   globe: [lon, lat, zoom]; card: side of the card; exact: fly straight to the framing (no sideways shift away from the
   card). Checked by screenshot at 1280×860. */
const FIX={
 /* ---------------- The Earth at night */
 /* the shaded half of the globe was round the back: the stop now looks at the line between day and night */
 "night|Night moves round the planet":{globe:[-35,24,1],exact:1,card:"left"},
 /* the 100th meridian was drawn but not named */
 "night|East of the 100th meridian":{pinAdd:[[[-100,47.6],"100° W","point"]]},
 /* Moscow, where the line starts, was under the card */
 "night|The railway that lights Siberia":{globe:[45,57,1],exact:1,card:"left",pinDrop:/^(Novosibirsk|Irkutsk|Vladivostok)$/,iconDrop:1},   /* the ride names the stations itself */
 /* the Persian Gulf oil fields were under the card */
 "night|Not every light is a city":{globe:[14,19,1.25],exact:1,card:"left"},
 /* the dark west of China, the point of the stop, was under the card */
 "night|The Hu line by night":{globe:[84,37,1.4],exact:1,card:"left"}
};
/* framing is pinned: several sweep files set a stop's globe or card side from their own psGo wrappers, some of them
   running after this one, so a plain assignment would be undone. The pinned field ignores later writes. A field another
   file has already pinned (non-configurable) is left alone. */
function pin(S,k,v){try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvi){d.get._rvi.v=v;return}
 if(d&&!d.configurable)return;
 const box={v},get=()=>{const x=typeof box.v==="function"?box.v():box.v;return Array.isArray(x)?x.slice():x};get._rvi=box;Object.defineProperty(S,k,{configurable:false,enumerable:true,get,set(){}})}catch(e){SET(S,k,v)}}
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
function applyFix(S,tour,soft){try{if(!S)return;const X=FIX[tour+"|"+S.title];if(!X)return;
 const put=soft?(S,k,v)=>{const d=Object.getOwnPropertyDescriptor(S,k);if(!(d&&d.get&&d.get._rvi))SET(S,k,typeof v==="function"?v():v)}:pin;
 if(X.hiAdd&&Array.isArray(S.hi)){const add=X.hiAdd.filter(c=>!S.hi.includes(c));if(add.length)SET(S,"hi",S.hi.concat(add))}
 if(X.globe)put(S,"globe",X.globe);if(X.card)put(S,"card",X.card);
 if(X.pinAdd){const P=Array.isArray(S.pins)?S.pins:[];const add=X.pinAdd.filter(a=>!P.some(q=>q&&clean(q[1])===a[1]));if(add.length)SET(S,"pins",P.concat(add))}
 if(X.iconDrop&&Array.isArray(S.iconPins)&&S.iconPins.length)SET(S,"iconPins",[]);
 if(X.pinDrop&&Array.isArray(S.pins)){const P=S.pins.filter(q=>!(q&&X.pinDrop.test(clean(q[1]))));if(P.length!==S.pins.length)SET(S,"pins",P)}
 if(X.phMove&&Array.isArray(S.phPins))S.phPins.forEach(q=>{const to=q&&X.phMove[clean(q.label)];if(to)try{q.at=to.slice()}catch(e){}});
 (X.rep||[]).forEach(([a,b])=>["stat","body","more"].forEach(k=>{if(typeof S[k]==="string"&&S[k].includes(a))SET(S,k,S[k].split(a).join(b))}))}catch(e){}}
function curFix(){try{if(typeof ps==="undefined"||!ps||!ps.tour)return null;const S=psSteps()[ps.i];return S?FIX[ps.tour+"|"+S.title]||null:null}catch(e){return null}}
function wrapGo(){if(typeof psGo!=="function")return false;if(psGo._rvi)return true;const _g=psGo;
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];applyFix(S,ps&&ps.tour)}catch(e){}return _g.apply(this,arguments)};psGo._rvi=1;return true}
/* stops framed `exact` (and the turned Antarctica views) skip the sideways shift away from the card */
function wrapFly(){if(typeof psFlyGlobe!=="function")return false;if(psFlyGlobe._rvi)return true;const _f=psFlyGlobe;
 psFlyGlobe=function(){const X=curFix();if(X&&X.exact&&typeof psCardOver==="function"){const o=psCardOver;try{psCardOver=()=>0}catch(e){}
   try{return _f.apply(this,arguments)}finally{try{psCardOver=o}catch(e){}}}return _f.apply(this,arguments)};psFlyGlobe._rvi=1;return true}
const TOURS=["night","space","geopol","govmap"];
function applyAll(){try{for(const t of TOURS){const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>applyFix(S,t,1))}}catch(e){}}
{let n=0;const t=setInterval(()=>{const ok=wrapGo()&&wrapFly();if(ok)applyAll();if(ok&&n>20||++n>90)clearInterval(t)},500)}
/* the first stop of a tour is shown without psGo: fix it there too */
setInterval(()=>{try{if(typeof ps!=="undefined"&&ps&&TOURS.includes(ps.tour)&&ps._rviT!==ps.tour+ps.i){ps._rviT=ps.tour+ps.i;applyFix(psSteps()[ps.i],ps.tour)}}catch(e){}},400);

/* ---- a stop whose place is tiny turns the globe in closer once the tour's own move has settled */
let zLast="";setInterval(()=>{try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return;const k=ps.tour+"|"+ps.i;if(k===zLast)return;zLast=k;const X=curFix();if(!X||!X.zoomTo)return;
 setTimeout(()=>{try{if(!ps||ps.tour+"|"+ps.i!==k)return;const G=g();if(!G||!G.lookAt)return;const t=X.zoomTo,r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,[t[0],t[1]]);
  const step=()=>{if(!ps||ps.tour+"|"+ps.i!==k)return;const f=Math.min(1,(performance.now()-T0)/1400),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0*Math.pow(t[2]/z0,e))}catch(err){return}if(f<1)requestAnimationFrame(step)};step()}catch(e){}},1700)}catch(e){}},300);


/* ============================================================ 2. interactive stops: shared helpers */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{const P=G.projection();if(!G._flat){const r=P.rotate(),c=[-r[0],-r[1]];if(d3.geoDistance(c,ll)>Math.PI/2-.02)return null}
 const s=P(ll);if(!s||!isFinite(s[0]))return null;if(!G._flat){const z=G.size();if(Math.hypot(s[0]-z.w/2,s[1]-z.h/2)>z.r+1)return null}const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function quiet(el){["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function tag(L,cls){const d=document.createElement("div");d.className="rvi-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 /* a tag that would fall on the card slides sideways off it, if there is room; otherwise it hides */
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;
  if(!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])){const toR=B[2]+4-x0,toL=B[0]-4-(x0+r.width);
   const dx=Math.abs(toR)<=Math.abs(toL)&&x0+toR+r.width<h.width-4||x0+toL<4?toR:toL;
   if(Math.abs(dx)<r.width+60&&x0+dx>=4&&x0+dx+r.width<=h.width-4)d.style.left=(q[0]+dx)+"px";else hide=true}}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvi-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvi-new");void e.offsetWidth;e.classList.add("rvi-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
const ring=c=>{const r=c.slice();const a=r[0],b=r[r.length-1];if(a[0]!==b[0]||a[1]!==b[1])r.push(a);return r};
const polyGeo=c=>{const r=ring(c);let p={type:"Polygon",coordinates:[r]};if(d3.geoArea(p)>2*Math.PI)p={type:"Polygon",coordinates:[r.slice().reverse()]};return p};
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*26/z/Math.max(.5,Math.cos(ll[1]*Math.PI/180)),clamp(ll[1],-70,70)],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}
/* a sector of the Southern Ocean and Antarctica, from longitude a east to b, south of `lat` */
function sector(a,b,lat){let B=b;if(B<a)B+=360;const pts=[];for(let x=a;x<B;x+=2)pts.push([x>180?x-360:x,lat]);pts.push([B>180?B-360:B,lat]);
 pts.push([B>180?B-360:B,-89.999]);pts.push([a,-89.999]);return polyGeo(pts)}
function arrowMarker(L,id,col){const d=svgEl(L.root,"defs",{});const m=svgEl(d,"marker",{id,viewBox:"0 0 10 10",refX:"6",refY:"5",markerWidth:"4",markerHeight:"4",orient:"auto-start-reverse"});
 svgEl(m,"path",{d:"M0 0L10 5L0 10z",fill:col});return"url(#"+id+")"}


/* ============================================================ A. The railway that lights Siberia: ride the train
   Distances from Moscow by the main line (Wikipedia, "Trans-Siberian Railway", route table): Kirov 957 km, Perm 1,436,
   Yekaterinburg 1,816, Tyumen 2,144, Omsk 2,712, Novosibirsk 3,335, Krasnoyarsk 4,098, Irkutsk 5,185, Ulan-Ude 5,642,
   Chita 6,199, Birobidzhan 8,312, Khabarovsk 8,493, Vladivostok 9,289; the timetable of train No. 2 takes about 6 days
   4 hours from Moscow to Vladivostok. The route is drawn through the stations (via Yaroslavl, and along the Amur north
   of China), not along every curve of the track. */
const TSR=[{n:"Moscow",km:0,ll:[37.62,55.75]},{ll:[39.87,57.63]},{n:"Kirov",km:957,ll:[49.67,58.6]},{n:"Perm",km:1436,ll:[56.25,58.01]},
 {n:"Yekaterinburg",km:1816,ll:[60.6,56.84]},{n:"Tyumen",km:2144,ll:[65.53,57.15]},{n:"Omsk",km:2712,ll:[73.37,54.99]},
 {n:"Novosibirsk",km:3335,ll:[82.92,55.03]},{n:"Krasnoyarsk",km:4098,ll:[92.87,56.01]},{n:"Irkutsk",km:5185,ll:[104.3,52.29]},
 {n:"Ulan-Ude",km:5642,ll:[107.6,51.83]},{n:"Chita",km:6199,ll:[113.5,52.03]},{ll:[119.75,53.74]},{ll:[123.92,53.99]},{ll:[128.47,50.92]},
 {n:"Birobidzhan",km:8312,ll:[132.93,48.79]},{n:"Khabarovsk",km:8493,ll:[135.07,48.48]},{n:"Vladivostok",km:9289,ll:[131.9,43.12]}];
/* stations without a distance get one by their share of the drawn line between the stations either side */
(function(){try{const d=(a,b)=>d3.geoDistance(a,b);for(let i=1;i<TSR.length;i++)if(TSR[i].km==null){let j=i;while(TSR[j].km==null)j++;
 let s=0,t=0;for(let k=i;k<=j;k++)t+=d(TSR[k-1].ll,TSR[k].ll);for(let k=i;k<j;k++){s+=d(TSR[k-1].ll,TSR[k].ll);TSR[k].km=TSR[i-1].km+(TSR[j].km-TSR[i-1].km)*s/t}}}catch(e){}})();
function tsrAt(km){for(let i=1;i<TSR.length;i++)if(km<=TSR[i].km){const a=TSR[i-1],b=TSR[i],f=(km-a.km)/Math.max(1,b.km-a.km);return{i,ll:d3.geoInterpolate(a.ll,b.ll)(clamp(f,0,1))}}return{i:TSR.length,ll:TSR[TSR.length-1].ll}}
const TRAIN={tour:"night",title:"The railway that lights Siberia",
 tip:"Press ▶ and ride the Trans-Siberian from Moscow to the Pacific. Watch which lights the line strings together.",
 card:()=>'<div class="rvi-row"><button type="button" class="rvi-play" aria-label="Play">▶</button><input type="range" class="rvi-range" min="0" max="9289" step="1" value="0" aria-label="Kilometres from Moscow"><span class="rvi-read rvi-km" style="flex:0 0 auto;min-width:92px;text-align:right"></span></div>',
 init(L){L.km=0;L.play=false;L.all=svgEl(L.geo,"path",{class:"rvi-rail"});L.done=svgEl(L.geo,"path",{class:"rvi-rail-on"});
  L.dots=TSR.filter(s=>s.n).map(s=>({s,c:svgEl(L.svg,"circle",{r:"4.5",class:"rvi-stn"}),t:tag(L,"rvi-small rvi-tiny")}));L.train=tag(L,"rvi-train");L.train.textContent="🚂"},
 wire(L){const c=L.card,b=c.querySelector(".rvi-play"),r=c.querySelector(".rvi-range");
  b.onclick=()=>{if(L.km>=9289)L.km=0;L.play=!L.play;b.textContent=L.play?"❚❚":"▶";b.setAttribute("aria-label",L.play?"Pause":"Play")};
  r.addEventListener("input",()=>{L.play=false;b.textContent="▶";b.setAttribute("aria-label","Play");L.km=+r.value;L.dirty=1})},
 tick(L,dt){if(L.play){L.km=Math.min(9289,L.km+dt*620);L.dirty=1;if(L.km>=9289){L.play=false;try{L.card.querySelector(".rvi-play").textContent="▶"}catch(e){}}}},
 draw(L){const at=tsrAt(L.km),line=TSR.map(s=>s.ll);L.all.setAttribute("d",geoD({type:"LineString",coordinates:line}));
  const gone=TSR.slice(0,at.i).map(s=>s.ll).concat([at.ll]);L.done.setAttribute("d",L.km>0?geoD({type:"LineString",coordinates:gone}):"");
  let last=null;L.dots.forEach((d,k)=>{const q=proj(L,d.s.ll,1),passed=L.km>=d.s.km-1;if(passed)last=d.s;
   if(q){d.c.style.display="";d.c.setAttribute("cx",q[0].toFixed(1));d.c.setAttribute("cy",q[1].toFixed(1));d.c.classList.toggle("rvi-stn-on",passed)}else d.c.style.display="none";
   /* name the stations already passed; the newest one is named in the train's bubble instead */
   putTag(L,d.t,passed&&d.s!==last&&L.km>0?q:null,esc(d.s.n),8)});
  putTag(L,L.train,proj(L,at.ll,1),"🚂",-4);
  const lastStop=L.dots.filter(d=>L.km>=d.s.km-1).pop();
  if(L.card){const r=L.card.querySelector(".rvi-range");if(r&&document.activeElement!==r)r.value=Math.round(L.km);setHTML(L.card.querySelector(".rvi-km"),fmt(L.km)+" km")}
  if(lastStop&&L.km>0){const q=proj(L,lastStop.s.ll,1);putTag(L,lastStop.t,q,"<b>"+esc(lastStop.s.n)+"</b> · "+fmt(lastStop.s.km)+" km",8)}
  if(L.km>=9289)say(L,"Vladivostok: 9,289 km","About six days on the train, and the clocks go forward seven hours on the way. Look back along the line: Yekaterinburg, Omsk, Novosibirsk, Krasnoyarsk, Irkutsk… nearly every bright dot in Siberia sits on the railway, because the towns grew up around its stations.");
  else if(L.km>=5100&&L.km<5700)say(L,"Irkutsk and Lake Baikal","The line swings round the southern tip of Lake Baikal, the deepest lake on Earth. East of here the towns, and the lights, get fewer.");
  else if(L.km>=3300&&L.km<3800)say(L,"Novosibirsk: a city made by the railway","It was founded in 1893 where the railway was to cross the Ob river. Today it is Russia’s third-biggest city and the biggest in Siberia.");
  else if(L.km>=1800&&L.km<2000)say(L,"Over the Urals into Asia","Just before Yekaterinburg the line crosses the Ural Mountains, the border between Europe and Asia. Siberia starts here.");
  else if(L.km>0)say(L,"Following the line","Each station town is a dot of light in the dark. Keep going.");
  else say(L,"Moscow, kilometre 0","The longest railway line in the world starts here. Press ▶, or drag the slider.")}};

/* ============================================================ B. Not every light is a city: city or gas flares?
   Gas flaring: the World Bank's Global Gas Flaring Tracker names Nigeria and the United States among the countries that
   flare the most gas; NASA Earth Observatory showed the Bakken oil field in North Dakota lit by flares and drilling sites
   ("Bakken Formation", 2012, Suomi NPP night image), where few people live. The cities are the biggest in their areas. */
const FLR=[{n:"Riyadh",k:"c",ll:[46.72,24.69],why:"Saudi Arabia’s capital: about 7 million people, and wide streets lit all night."},
 {n:"The Niger delta",k:"f",ll:[6.3,5],why:"Oil wells in the creeks of southern Nigeria burn off the gas that comes up with the oil. Some flares have burned for decades, next to villages."},
 {n:"Lagos",k:"c",ll:[3.39,6.45],why:"Nigeria’s biggest city, one of the largest in Africa. Yet for its size it is dim: power cuts are common."},
 {n:"North Dakota’s Bakken oil field",k:"f",ll:[-103,48],why:"Farmland with few people, but since the oil boom it glows at night like a city: thousands of wells, many flaring gas, and the lights of the drilling sites."},
 {n:"Las Vegas",k:"c",ll:[-115.15,36.17],why:"A city in the desert, and one of the brightest spots in North America."}];
const FLKIND={c:"🏙 A city",f:"🔥 Gas flares"};
const FLARE={tour:"night",title:"Not every light is a city",
 tip:"The globe turns to a bright spot. Is it a city, or oil wells burning off gas?",
 card:()=>'<div class="rvi-row rvi-btns">'+Object.keys(FLKIND).map(k=>'<button type="button" class="rvi-btn rvi-k" data-k="'+k+'">'+FLKIND[k]+"</button>").join("")+'</div><div class="rvi-score"></div>',
 init(L){L.cur=0;L.ans={};L.t=0;L.ring=svgEl(L.svg,"circle",{r:"14",class:"rvi-qring"});L.tags=FLR.map(()=>tag(L,"rvi-small"));L.bub=tag(L,"rvi-bub");setTimeout(()=>{if(L&&L.el.isConnected)turnTo(L,FLR[0].ll,2.2)},1700)},
 wire(L){L.card.querySelectorAll(".rvi-k").forEach(b=>b.onclick=()=>{const i=L.cur;if(L.ans[i])return;L.ans[i]={k:b.dataset.k,ok:b.dataset.k===FLR[i].k};L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L||!L.el.isConnected)return;const n=FLR.findIndex((x,j)=>!L.ans[j]);if(n>=0){L.cur=n;L._said="";L.dirty=1;turnTo(L,FLR[n].ll,2.2)}},3600)})},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;if(!L.ans[L.cur])try{L.ring.setAttribute("r",(14+4*Math.sin(L.t*5)).toFixed(1))}catch(e){}},
 draw(L){let right=0,done=0;FLR.forEach((o,i)=>{const a=L.ans[i];if(a){done++;if(a.ok)right++}putTag(L,L.tags[i],a&&i!==L.cur?proj(L,o.ll,1):null,a?(o.k==="f"?"🔥 ":"🏙 ")+esc(o.n):null,12)});
  const o=FLR[L.cur],a=L.ans[L.cur],q=proj(L,o.ll);if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.style.stroke=a?(a.ok?"#1f8a4c":"#c2364f"):"#ffd166"}else L.ring.style.display="none";
  putTag(L,L.bub,proj(L,o.ll,1),a?esc(o.n):"What is this light?",-22);
  if(L.card){L.card.querySelectorAll(".rvi-k").forEach(b=>{b.disabled=!!a;b.classList.toggle("rvi-right",!!a&&b.dataset.k===o.k);b.classList.toggle("rvi-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   setHTML(L.card.querySelector(".rvi-score"),'<div class="rvi-dots">'+FLR.map((x,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"rvi-ok":"rvi-no":"")+(i===L.cur?" rvi-at":"")+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+"</span>")}
  if(done===FLR.length)say(L,right+" of "+FLR.length+" right","From space a flame and a city look alike: both are just light. Satellites that also measure heat can tell them apart, which is how gas flares are now counted, country by country.");
  else if(a)say(L,(a.ok?"Right: ":"No: ")+FLKIND[o.k].replace(/^\S+ /,"").toLowerCase(),o.why);
  else say(L,"Look at the ringed light","Is it a city, or oil wells burning off gas? Tap your answer.")}};

/* ============================================================ C. A border you can see from space: find it
   The India–Pakistan border is about 3,300 km long and most of it is fenced and floodlit (Wikipedia, "India–Pakistan
   border"). The line drawn here is the border of the map's own country shapes, south of the Kashmir Line of Control. */
const BORDER={tour:"night",title:"A border you can see from space",
 tip:"Where is the border? Press the button, then tap the map where you think it runs. Then compare with the real line.",
 card:()=>'<div class="rvi-row rvi-btns"><button type="button" class="rvi-btn rvi-arm">👆 Tap the map to guess</button><button type="button" class="rvi-btn rvi-show">Show the border</button></div>',
 init(L){L.line=null;L.guess=null;L.arm=false;L.show=false;
  try{const F=c=>projFeatures().find(f=>String(f.properties.c).toLowerCase()===c);const pk=F("pk"),ind=F("in");const rings=g=>g.type==="Polygon"?g.coordinates:[].concat(...g.coordinates);
   const I=[].concat(...rings(ind.geometry));let best=[];rings(pk.geometry).forEach(r=>{let cur=[];r.forEach(p=>{let ok=false;if(p[0]>=68.5&&p[1]<=33)for(const q of I){if(Math.abs(p[0]-q[0])<.08&&Math.abs(p[1]-q[1])<.08){ok=true;break}}
    if(ok)cur.push(p);else{if(cur.length>best.length)best=cur;cur=[]}});if(cur.length>best.length)best=cur});L.line=best.length>10?best:null}catch(e){}
  L.bl=svgEl(L.geo,"path",{class:"rvi-border"});L.gd=svgEl(L.svg,"circle",{r:"8",class:"rvi-guess"});L.gt=tag(L,"rvi-bub");L.bt=tag(L,"rvi-small");
  /* the catcher takes one tap while armed; Esc or the button again cancels */
  L.cat=document.createElement("div");L.cat.className="rvi-catch";L.el.appendChild(L.cat);
  L.cat.addEventListener("click",e=>{try{const G=g(),cr=G.canvas.getBoundingClientRect(),ll=G.projection().invert([e.clientX-cr.left,e.clientY-cr.top]);if(ll&&isFinite(ll[0])){L.guess=ll;L.show=true}}catch(err){}L.arm=false;L._said="";L.dirty=1;e.stopPropagation()});
  L.esc=e=>{if(e.key==="Escape"&&L.arm){L.arm=false;L.dirty=1}};addEventListener("keydown",L.esc)},
 off(L){removeEventListener("keydown",L.esc)},
 wire(L){const c=L.card;c.querySelector(".rvi-arm").onclick=()=>{L.arm=!L.arm;L._said="";L.dirty=1};c.querySelector(".rvi-show").onclick=()=>{L.show=!L.show;L.arm=false;L._said="";L.dirty=1}},
 dist(L){if(!L.line||!L.guess)return null;let m=1e9;for(let i=1;i<L.line.length;i++){const a=L.line[i-1],b=L.line[i];for(let t=0;t<=1;t+=.25){const p=d3.geoInterpolate(a,b)(t);m=Math.min(m,d3.geoDistance(L.guess,p))}}return m*6371},
 draw(L){L.cat.style.display=L.arm?"block":"none";L.bl.setAttribute("d",L.show&&L.line?geoD({type:"LineString",coordinates:L.line}):"");
  const q=L.guess?proj(L,L.guess):null;if(q){L.gd.style.display="";L.gd.setAttribute("cx",q[0].toFixed(1));L.gd.setAttribute("cy",q[1].toFixed(1))}else L.gd.style.display="none";
  const km=this.dist(L);putTag(L,L.gt,q&&km!=null?proj(L,L.guess,1):null,km==null?null:km<25?"Spot on!":fmt(km)+" km off",-14);
  putTag(L,L.bt,L.show&&L.line?proj(L,L.line[Math.floor(L.line.length*.62)],1):null,"The border on the map",10);
  if(L.card){const a=L.card.querySelector(".rvi-arm"),s=L.card.querySelector(".rvi-show");a.classList.toggle("rvi-on",L.arm);a.textContent=L.arm?"✕ Cancel":(L.guess?"👆 Guess again":"👆 Tap the map to guess");s.textContent=L.show?"Hide the drawn line":"Show the border"}
  if(L.arm)say(L,"Tap where the border runs","Look for a thin orange thread in the dark desert, between the lights of Pakistan’s Indus valley (west) and India’s towns (east).");
  else if(km!=null&&L.show)say(L,km<25?"Found it: "+fmt(km)+" km away":"The border is "+fmt(km)+" km from your tap","Now hide the drawn line and look closely where it was: the faint orange thread is the floodlit fence itself. Zoom in with the + button to see it better.");
  else if(L.show)say(L,"The border on the map","Hide it again and look for the same line in the lights alone: in the desert, the floodlights are the only lights there are.");
  else say(L,"A line drawn by floodlights","Can you find it without help? Press the button, then tap the map.")}};


/* ============================================================ the engine: one stop at a time */
const DEFS=[TRAIN,FLARE,BORDER];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;return DEFS.find(d=>d.tour===ps.tour&&d.title===S.title)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="rvi-layer";el.innerHTML='<svg class="rvi-svg"><defs><clipPath id="rviClip"><path class="rvi-clipp" clip-rule="evenodd"/></clipPath></defs><g class="rvi-clipg" clip-path="url(#rviClip)"></g></svg>';G.host.appendChild(el);
 const svg=el.querySelector("svg");const cg=svg.querySelector(".rvi-clipg");L={D,host:G.host,el,svg:cg,geo:svgEl(cg,"g",{}),root:svg,clipP:svg.querySelector(".rvi-clipp"),dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}lastT=0;loop();
 if(D.look){const L0=L;setTimeout(()=>{if(L===L0&&L.el.isConnected)turnTo(L,D.look[0],D.look[1])},1600)}}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}L=null}document.querySelectorAll(".rvi-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".rvi-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvi-ctl";
 c.innerHTML='<div class="rvi-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvi-ep"></div>';at0.after(c);L.card=c;L._said="";showCtl(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
/* the card scrolls: bring the new controls into view (the headline stays just above them) */
function showCtl(c){setTimeout(()=>{try{let sc=c.parentElement;while(sc&&sc!==document.body){const o=getComputedStyle(sc).overflowY;if(/auto|scroll/.test(o)&&sc.scrollHeight>sc.clientHeight+4)break;sc=sc.parentElement}
 if(!sc||sc===document.body)return;const r=c.getBoundingClientRect(),b=sc.getBoundingClientRect();if(r.bottom>b.bottom)sc.scrollTop+=Math.min(r.top-b.top-70,r.bottom-b.bottom+8)}catch(e){}},900)}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  let rl=0;try{rl=G.roll()}catch(e){}
  const key=(G.rot||[]).join(",")+G.zoom+"|"+rl+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.root.setAttribute("width",hr.width);L.root.setAttribute("height",hr.height);
   /* shapes drawn with the globe's projection (geoD) sit in L.geo, shifted by the canvas offset; points from proj() are
      already in the host's pixels. Everything is kept off the tour card by an even-odd clip. */
   L.geo.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");
   /* the globe is drawn as a disc of radius size().r (zooming in magnifies inside it): keep shapes inside the disc */
   let disc="M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";try{if(!G._flat){const z=G.size(),cx=L.ox+z.w/2,cy=L.oy+z.h/2,r=z.r+1;disc="M"+(cx-r)+" "+cy+"A"+r+" "+r+" 0 1 0 "+(cx+r)+" "+cy+"A"+r+" "+r+" 0 1 0 "+(cx-r)+" "+cy+"Z"}}catch(e){}
   L.clipP.setAttribute("d",disc+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvi-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvi-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvi-svg{position:absolute;left:0;top:0;overflow:visible}
.rvi-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvi-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.rvi-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:700;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvi-tiny{font-size:11px;padding:2px 7px}
.rvi-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvi-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvi-row{display:flex;align-items:center;gap:10px}
.rvi-btns{gap:6px;flex-wrap:wrap}
.rvi-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.rvi-btn.rvi-on{background:#13294b;color:#fff;border-color:#13294b}
.rvi-btn:disabled{cursor:default;opacity:.55}.rvi-btn.rvi-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvi-btn.rvi-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvi-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.rvi-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.rvi-read{flex:1 1 auto;font-weight:700;font-size:12.5px;color:#9a4a16}
.rvi-score{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:12.5px}
.rvi-dots{display:flex;gap:4px}.rvi-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvi-dots i.rvi-ok{background:#1f8a4c}.rvi-dots i.rvi-no{background:#c2364f}.rvi-dots i.rvi-at{box-shadow:0 0 0 2px #ffd166}
.rvi-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvi-ep b{display:block;font-size:15px}
.rvi-ep.rvi-new{animation:rviIn .45s ease}@keyframes rviIn{from{opacity:.2;transform:translateY(4px)}}
.rvi-qring{fill:none;stroke-width:4;filter:drop-shadow(0 0 3px rgba(0,0,0,.6))}
.rvi-rail{fill:none;stroke:rgba(255,255,255,.55);stroke-width:2.5;stroke-dasharray:5 5}
.rvi-rail-on{fill:none;stroke:#ffd166;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 4px #ffb000)}
.rvi-stn{fill:#13294b;stroke:#fff;stroke-width:1.5}.rvi-stn.rvi-stn-on{fill:#ffd166;stroke:#13294b}
.rvi-train{transform:translate(-50%,-100%);font-size:24px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
.rvi-border{fill:none;stroke:#4fd1ff;stroke-width:3;stroke-dasharray:7 5;filter:drop-shadow(0 0 2px #000)}
.rvi-guess{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rvi-catch{position:absolute;inset:0;pointer-events:auto;cursor:crosshair;display:none}
:is(body.dark-theme,body.sky-night) .rvi-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvi-do,:is(body.dark-theme,body.sky-night) .rvi-read{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvi-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvi-btn.rvi-on{background:#fff;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvi-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}
window.gfPolishRVI={v:1,FIX,L:()=>L};
})();
