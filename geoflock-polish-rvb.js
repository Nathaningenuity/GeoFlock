/* GeoFlock: review pass over four physical-geography tours (Climate, Rivers, Lakes, Seas & oceans).
   Two parts:
   1. Fixes to the stops' own data (framing, pins, wording), applied by tour and title when the tours are built and again
      whenever one of these tours starts, so later patches cannot undo them. Each fix says why.
   2. A few stops you can play with, not just read. Same pattern as geoflock-interact-world3.js: a watchdog polls `ps`,
      matches the stop by tour and title, mounts a layer in amGlobe.host drawn with amGlobe.projection(), adds a control
      block after the stop's headline with a one-line instruction, and removes everything (layer, card block, body class,
      timers) as soon as the stop changes or the tour ends. Globe view only; Next and Back are never blocked; every step
      is wrapped in try/catch. CSS classes start with "rvb-". Sources are named beside each set of figures.
      - climate | "Africa, folded at the Equator": fold southern Africa up over the north. Dots sampled from the app's
        own climate data (textures/CLIMATE_MONTHLY.png, classified with gfThermo.koppen) swing across the Equator and
        land on the same kinds of climate: savanna on savanna, desert on desert, Mediterranean by the Mediterranean.
      - climate | "Five Mediterraneans", "Fjords: carved on windy west coasts", "Ice far from the poles": the places are
        spread round the world (some sat under the card or round the back), so a row of buttons flies the globe to each
        in turn, rings it, and shows the westerly wind blowing onto the coast (Mediterraneans, fjords) or how much colder
        the summit is than sea level (ice).
      - rivers | "The river that reverses": run through the year; the Tonlé Sap River turns round and the lake swells.
      - rivers | "Running from the sea": drag a raindrop down the Niger and watch its distance from the sea grow, then
        shrink: it starts 250 km from the Atlantic and gets far deeper into the Sahel before it reaches it.
      - lakes | "A tsunami on Lake Geneva": set off the AD 563 collapse and follow the wave town by town to Geneva.
      - lakes | "Sharks in fresh water": drag a bull shark from the Caribbean up the San Juan River into the lake; the
        salt meter empties, and the card says how its body copes.
      - seas | "The busiest gateways": close the Suez or Panama Canal and send a ship the long way round; the card
        compares the distances and days at sea.
*/
(function(){
"use strict";
if(window.gfPolishRvb)return;
const R_KM=6371,DEG=Math.PI/180;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const km=(a,b)=>{try{return d3.geoDistance(a,b)*R_KM}catch(e){return 0}};
const NS="http://www.w3.org/2000/svg";
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();

/* ======================================================================== part 1: data fixes */
/* Other patch files re-set framing on every psGo (geoflock-sweep-tours*.js, through a configurable defineProperty in a
   try/catch), which undid these fixes. LOCK makes a field a fixed, non-configurable getter whose setter is ignored, so a
   later plain assignment does nothing and a later defineProperty fails quietly inside their try/catch. Only the fields
   named here, on these stops, are locked. */
const LOCK=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:false,enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
const FIX={
 climate:{
  /* the rain belt: centred on Africa the Amazon sat under the card and Indonesia round the back; centred on the
     Atlantic side both the Amazon and the Congo show beside the card */
  "The rain belt":S=>{LOCK(S,"globe",[-22,2,1.05])},
  /* the whole continent from Tunis to Cape Town has to fit beside the card (it was cut off top and bottom) */
  "Africa, folded at the Equator":S=>{LOCK(S,"globe",[24,-12,1])},
  /* the cold Humboldt Current and its label sat under the card: turn the globe west a little */
  "The driest place, and the Andes’ trick":S=>{LOCK(S,"globe",[-71,-33,1.75])},
  /* London was off the edge of the globe (only North America showed). London and Calgary are 114° of longitude apart
     but only about 65° apart on the globe, over the top: looking down from above northern Canada, Calgary, London and
     the Gulf Stream all show beside the card, and the 51.5°N line curves between them */
  "London is mild for its latitude":S=>{LOCK(S,"globe",[-55,62,1.15]);LOCK(S,"card","left")},
  /* the card jumped to the right and the Rwenzori label hung far from its peak; centre on the Equator between the
     Andes and Africa, card on the left like the rest of the tour */
  "Ice far from the poles":S=>{LOCK(S,"card","left");LOCK(S,"globe",[32,2,1.02])},
  /* Mega-Chad and the Cave of Swimmers (Egypt) were at the right edge, under the map key */
  "When the Sahara was green":S=>{LOCK(S,"globe",[18,21,1.5])},
  /* (and the rings sat half under the card) the two rings looked the same and had no names: say which is which */
  "The fastest-warming place":S=>{LOCK(S,"globe",[-4,80,1.17]);const P=(S.pins||[]).filter(p=>!/^Sea ice/.test(p[1]));
   P.push([[118,79.6],"Sea ice in late summer, 1979","point"],[[-60,76.6],"Sea ice in late summer now","point"]);LOCK(S,"pins",P)},
  /* the "Alaska & British Columbia" label hung off the top edge of the globe, over the map buttons, from every view that
     also shows Norway; its ring stays, and the new buttons fly to each coast and name it */
  "Fjords: carved on windy west coasts":S=>{LOCK(S,"globe",[25,45,1]);LOCK(S,"pins",(S.pins||[]).filter(p=>!/^Alaska/.test(p[1])))},
  /* Oymyakon sat on the very rim of the globe */
  "The coldest places people live":S=>{LOCK(S,"globe",[132,62,2.3])}
 },
 rivers:{
  /* (the framings below were checked against where the card and the map key really sit, with the card shift applied)
     the Amazon's western half, its basin label and Manaus sat under the map key: a little further out, and west */
  "The Amazon":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-72,-9,1.6])},
  /* the stop is about the west, but the Pebas wetland, the Andes and the old western exit were under the map key */
  "The Amazon once flowed west":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-63,-8,1.76])},
  /* Khartoum and Ethiopia's highlands sat under the map key */
  "The Nile’s slow fall and summer flood":S=>{LOCK(S,"card","left");LOCK(S,"globe",[41,20,2.5]);fixNile(S)},
  /* the lower Congo, Kinshasa and "over 220 m deep here" sat under the map key */
  "The deepest river":S=>{LOCK(S,"card","right");LOCK(S,"globe",[14,-2,3])},
  /* Old River Control and the basin label sat under the map key */
  "The Mississippi system":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-84,40,1.6])},
  /* the dry delta by the Gulf of California sat under the map key */
  "A river that stops short":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-115,36,5.18])},
  /* the old mouth (south of Shandong) and Kaifeng's label sat under the map key */
  "China’s Sorrow":S=>{LOCK(S,"card","left");LOCK(S,"globe",[121,36,1.9])},
  /* Belgrade's label sat under the map key */
  "Ten countries, one river":S=>{LOCK(S,"card","left");LOCK(S,"globe",[26,48,3.15])},
  /* the Niger's source and the ruler sat at the card's edge */
  "Running from the sea":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-2,6,3])},
  /* the Lena, the third of the three rivers, ran off the right-hand rim */
  "Rivers that flood themselves":S=>{LOCK(S,"card","left");LOCK(S,"globe",[106,63,2])},
  /* the lake was a sliver at the stop's zoom: closer in, so it can be seen swelling and shrinking */
  "The river that reverses":S=>{LOCK(S,"card","left");LOCK(S,"globe",[104.4,12.3,6])},
  /* this stop's slider (the Nile's year, before and after the High Dam) was keyed to the stop's old title, "The flood
     that made Egypt", so the card said "Slide through the year" with no slider */
 },
 lakes:{
  /* (framings checked against where the card and map key really sit, with the card shift applied) the Caspian sat on
     the globe's right-hand rim, half under the map key */
  "The biggest lake is called a sea":S=>{LOCK(S,"card","left");LOCK(S,"globe",[54,42,3])},
  /* Lake Ontario, Niagara and the St Lawrence (the water drop's way to the sea) were off the right edge; and about 34
     million people live in the Great Lakes basin (Great Lakes Commission; US EPA: over 30 million), not 40 million */
  "The Great Lakes":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-78,45.5,4]);fixMore(S,"About 40 million people in the US and Canada live around them.","More than 30 million people in the US and Canada live around them.")},
  /* Lake Victoria's label and the Nile's outflow sat by the map key */
  "Africa’s great shallow lake":S=>{LOCK(S,"card","left");LOCK(S,"globe",[35,4,4.13])},
  /* Lake Malawi and the south of the rift were under the map key */
  "Lakes in a crack":S=>{LOCK(S,"card","left");LOCK(S,"globe",[37,-4,2.6])},
  /* the Columbia, where the floods poured out, sat at the card's edge */
  "The lake that emptied in days":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-114,47,4])},
  /* Lake Kariba (the second lake of the stop) was off the right-hand rim */
  "Lakes made by people":S=>{LOCK(S,"card","left");LOCK(S,"globe",[18,2,1.05])},
  /* Lake Chad (the second lake of the stop) sat at the card's edge */
  "Lakes that disappeared":S=>{LOCK(S,"card","left");LOCK(S,"globe",[50,42,1.4])},
  /* the narrow strait and the salty east half were at the bottom, by the map key */
  "Half fresh, half salty":S=>{LOCK(S,"card","left");LOCK(S,"globe",[77.5,46.3,6])},
  /* Finland and the Baltic Shield were near the top rim; looking down from further north both shields show */
  "Lakes scraped by ice":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-56,76,1.1])},
  /* Lake Vostok and its label sat by the card */
  "A lake under the ice":S=>{LOCK(S,"card","left");LOCK(S,"globe",[154,-80,2.2])},
  /* Baikal's nerpa is the only seal SPECIES that lives only in fresh water; the tour's later stop mentions Saimaa's own
     seal (a subspecies of the ringed seal), so "the only seal" contradicted it */
  "The deepest and oldest lake":S=>{if(S.more)LOCK(S,"more",S.more.replace("the only seal that lives only in fresh water","the only kind of seal that lives only in fresh water"))},
 },
 seas:{
  /* (framings checked against where the card and map key really sit, with the card shift applied) */
  /* the Philippine Sea's label sat under the map key */
  "The deep ocean":S=>{LOCK(S,"card","right");LOCK(S,"globe",[132,14,2.2])},
  /* the Drake Passage label sat at the bottom edge */
  "The Southern Ocean":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-84,-69,1.3])},
  /* the Strait of Magellan's label sat under the map key */
  "Magellan and the wildest sea":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-78,-56,2.4])},
  /* "…and sinks about 3.5 km to the deep floor" sat under the map key */
  "The biggest waterfall is underwater":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-31,63,3])},
  /* Morocco and Tarifa's labels crowded the bottom right */
  "14 km from Africa":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-3.6,38,5.84])},
  "When the Mediterranean dried up":S=>{LOCK(S,"card","left");LOCK(S,"globe",[13,35,2])},
  /* Miami sat under the map key */
  "The Bermuda Triangle":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-78.5,31.5,1.44])},
  /* the White Sea was on the top rim and the Red Sea's photo under the key */
  "Seas named after colours":S=>{LOCK(S,"card","right");LOCK(S,"globe",[56,62,1])},
  /* the stop is about the Black Sea, but the view was centred on the Caspian: the Bosphorus sat under the map key */
  "A sea that’s dead below":S=>{LOCK(S,"card","right");LOCK(S,"globe",[29,43.5,3.8])},
  "A patch of plastic":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-138,34,1.4])},
  /* the Northwest Passage was round the back; looking straight down on the pole both routes show */
  "The melting Arctic":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-80,80,1])},
  /* Shanghai sat on the right-hand rim */
  "If all the ice melted":S=>{LOCK(S,"card","left");LOCK(S,"globe",[118,22,1.9])},
  /* the Cape Horn route from New York to San Francisco is given as 22,500 km (Wikipedia) to about 24,300 km (port-distance
     tables), against about 9,500 km through the canal: the saving is 13,000 to 15,000 km, so say "over 12,000 km" */
  "The busiest gateways":S=>{if(S.more)LOCK(S,"more",S.more.replace("The Panama Canal saves ships about 13,000 km around South America.","The Panama Canal saves a ship from New York to San Francisco over 12,000 km of sailing round South America."))}
 }
};
/* rivers | "The Nile’s slow fall and summer flood": its slider (the Nile's year, before and after the High Dam) was keyed to
   the stop's old title, "The flood that made Egypt", so the card said "Slide through the year" with no slider */
function fixMore(S,a,b){try{if(typeof S.more==="string"&&S.more.includes(a))LOCK(S,"more",S.more.replace(a,b))}catch(e){}}
function fixNile(S){try{const k="rivers|"+S.title;if(typeof PS_DIAG!=="undefined"&&!PS_DIAG[k]&&PS_DIAG["rivers|The flood that made Egypt"])PS_DIAG[k]=PS_DIAG["rivers|The flood that made Egypt"]}catch(e){}}
function applyFixes(tour){try{const T=PS_TOURS[tour],F=FIX[tour];if(!T||!F)return;T.steps.forEach(S=>{const f=F[strip(S.title)];if(!f||S._rvbFix)return;
  try{f(S);Object.defineProperty(S,"_rvbFix",{value:1,configurable:true,enumerable:false})}catch(e){console.error("rvb fix",tour,S.title,e)}})}catch(e){}}
function applyAll(){Object.keys(FIX).forEach(applyFixes)}
/* geoflock-polish-m.js cuts three climate stops (CLIM_CUT there), but only while the climate tour is not running, and
   geoflock-review-phys.js inserts one of them again up to 12 s after the page loads: a tour started straight away got
   them back halfway through. Cut them here too while the tour runs, but only those still ahead of the reader, so the
   stop being read never moves. */
const CLIM_CUT=["Same line, different worlds","The coldest winter is a summer","Two islands, two currents"];
function climCut(){try{const L=PS_TOURS.climate&&PS_TOURS.climate.steps;if(!L||!ps||ps.tour!=="climate")return;const cur=psSteps()[ps.i];
 for(let i=L.length-1;i>=0;i--){const S=L[i];if(S&&CLIM_CUT.includes(strip(S.title))&&L.indexOf(cur)<i)L.splice(i,1)}}catch(e){}}
let lastTour=null;
setInterval(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(t&&FIX[t]&&t!==lastTour)applyFixes(t);lastTour=t||null;if(t==="climate")climCut()}catch(e){}},400);
try{applyAll()}catch(e){}setTimeout(applyAll,1500);setTimeout(applyAll,6000);

/* The globe turns a stop's place out from under the tour card: psFlyGlobe (index.html) shifts the centre by the card's
   width (psCardOver). Two later patches undid that on many stops: geoflock-tourload.js's "aim" turns the globe back to
   the stop's plain centre whenever it is more than 20° from it (which the card shift always is), and
   geoflock-sweep-tours.js moves the card to the other side after the flight has started. So the place often ended up
   under the card, or not, depending on timing. On these four tours only: aim is told the stop is already aimed, and for
   four seconds after a stop opens, if the globe has come to rest away from where psFlyGlobe would put it with the card
   where it is now, it flies there once more. A drag or zoom by the reader in that time cancels it. */
const MYT=new Set(["climate","rivers","lakes","seas"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
setInterval(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g)return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: interactive stops */
/* ---------------- shared helpers (as in geoflock-interact-world3.js) ---------------- */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function unproj(L,x,y){const G=g();try{const p=G.projection();if(!p.invert)return null;const ll=p.invert([x-L.ox,y-L.oy]);if(!ll||!isFinite(ll[0]))return null;
 if(!G._flat&&d3.geoDistance([-G.rot[0],-G.rot[1]],ll)>Math.PI/2-.02)return null;return ll}catch(e){return null}}
function pathOf(L,pts,close){let d="",pen=false,px=0,py=0,n=0;const G=g(),J=close?1e9:G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else{d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);n++}px=q[0];py=q[1]}
 return close&&n>1?d+"Z":d}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function route(C,step){step=step||.15;const P=[];for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
  for(let k=0;k<n;k++)P.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}P.push(C[C.length-1].slice(0,2));
 const K=[0];for(let i=1;i<P.length;i++)K.push(K[i-1]+km(P[i-1],P[i]));return{P,K,total:K[K.length-1]}}
function at(R,u){const t=clamp(u,0,1)*R.total;let lo=0,hi=R.K.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.K[m]<=t)lo=m;else hi=m}
 const f=R.K[hi]>R.K[lo]?(t-R.K[lo])/(R.K[hi]-R.K[lo]):0,a=R.P[lo],b=R.P[hi];return{ll:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],i:lo}}
function nearestU(L,R,px,py,u){const cur=at(R,u).i,W=Math.max(60,R.P.length>>2);let best=-1,bd=1e9;
 for(let i=Math.max(0,cur-W);i<=Math.min(R.P.length-1,cur+W);i++){const q=proj(L,R.P[i]);if(!q)continue;const d=Math.hypot(q[0]-px,q[1]-py)+Math.abs(i-cur)*.05;if(d<bd){bd=d;best=i}}
 return best<0?u:R.K[best]/R.total}
function draggable(L,el,mv,start,keys,end){const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{el.setPointerCapture(e.pointerId)}catch(err){}
  el.classList.add("rvb-dragging");const hr0=L.host.getBoundingClientRect();let cancelled=false;if(start)try{start(e.clientX-hr0.left,e.clientY-hr0.top)}catch(err){}
  const m=ev=>{ev.stopPropagation();if(cancelled)return;const hr=L.host.getBoundingClientRect();try{mv(ev.clientX-hr.left,ev.clientY-hr.top)}catch(err){}L.dirty=1};
  /* Escape cancels a drag: whatever start() saved in L.undo is put back */
  const esc=ev=>{if(ev.key!=="Escape")return;cancelled=true;try{if(L.undo)L.undo()}catch(err){}fin()};
  const fin=()=>{el.removeEventListener("pointermove",m);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);removeEventListener("keydown",esc,true);el.classList.remove("rvb-dragging");L.dirty=1};
  const up=()=>{fin();if(!cancelled&&end)try{end()}catch(err){}};
  el.addEventListener("pointermove",m);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);addEventListener("keydown",esc,true)};
 el.addEventListener("keydown",e=>{const k=e.key,f=k==="ArrowRight"||k==="ArrowUp"?1:k==="ArrowLeft"||k==="ArrowDown"?-1:0;if(!f)return;e.preventDefault();
  if(keys){try{keys(f)}catch(err){}}else{stopPlay(L);L.u=clamp(L.u+f*.01,0,1)}L.dirty=1});
 el.addEventListener("pointerdown",down);quiet(el)}
function quiet(el){["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function place(el,q,extra){if(!q){el.style.display="none";return false}el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")"+(extra||""));return true}
function tag(L,cls){const d=document.createElement("div");d.className="rvb-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvb-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvb-new");void e.offsetWidth;e.classList.add("rvb-new")}
function playerHTML(label,read){return'<div class="rvb-row"><button type="button" class="rvb-play" aria-label="Play">▶</button><input type="range" class="rvb-range" min="0" max="1000" step="1" value="0" aria-label="'+esc(label)+'"><span class="rvb-read">'+esc(read||"")+"</span></div>"}
function playBtn(L){const b=L.card&&L.card.querySelector(".rvb-play");if(b){b.textContent=L.playing?"❚❚":"▶";b.setAttribute("aria-label",L.playing?"Pause":"Play")}}
function wirePlayer(L){const c=L.card,b=c.querySelector(".rvb-play"),r=c.querySelector(".rvb-range");if(!b||!r)return;
 b.onclick=()=>{if(L.u>=1&&!L.D.loop)L.u=0;L.playing=!L.playing;playBtn(L);L.dirty=1};r.addEventListener("input",()=>{L.playing=false;playBtn(L);L.u=r.value/1000;L.dirty=1})}
function syncRange(L,txt){const c=L.card;if(!c)return;const r=c.querySelector(".rvb-range");if(r&&document.activeElement!==r)r.value=Math.round(L.u*1000);const o=c.querySelector(".rvb-read");if(o&&txt!=null&&o.textContent!==txt)o.textContent=txt}
const stopPlay=L=>{if(L.playing){L.playing=false;playBtn(L)}};
function advance(L,dt,dur,loop){if(!L.playing)return;L.u+=dt/dur;if(L.u>=1){if(loop)L.u-=1;else{L.u=1;L.playing=false;playBtn(L)}}L.dirty=1}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
function polysOf(f){if(!f||!f.geometry)return[];const P=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.type==="MultiPolygon"?f.geometry.coordinates:[];
 return P.map(c=>({type:"Polygon",coordinates:c})).filter(p=>{const a=d3.geoArea(p);p.a=a;return a>0&&a<2*Math.PI})}
function riverLines(name){try{const R=(globeOverlays().rivers||[]).find(r=>r.n===name);if(!R)return[];return R.type==="LineString"?[R.coordinates]:R.coordinates||[]}catch(e){return[]}}
function lakeGeom(name){try{return(globeOverlays().lakes||[]).find(r=>r.n===name)||null}catch(e){return null}}

/* ======================================================================== climate | Africa, folded at the Equator
   The dots are the app's own climate data: monthly temperature and rain (textures/CLIMATE_MONTHLY.png, read through
   gfThermo.load/at) classified with gfThermo.koppen (Köppen–Geiger after Peel, Finlayson & McMahon 2007), coloured
   with the standard Köppen–Geiger palette that the Climate map's key uses (Beck et al. 2018, Scientific Data 5:180214).
   Folding mirrors each dot's latitude about the Equator (lat → −lat), keeping its longitude. */
const KCOL={Af:"#0000ff",Am:"#0078ff",Aw:"#46aafa",BWh:"#ff0000",BWk:"#ff9696",BSh:"#f5a500",BSk:"#ffdc64",Csa:"#ffff00",Csb:"#c8c800",Csc:"#969600",
 Cwa:"#96ff96",Cwb:"#64c864",Cwc:"#329632",Cfa:"#c8ff50",Cfb:"#64ff50",Cfc:"#32c800",ET:"#b2b2b2",EF:"#666666"};
const KFAM=k=>k[0]==="A"?(k==="Aw"?"savanna":"rainforest"):k[0]==="B"?(k[1]==="W"?"desert":"dry grassland"):k[0]==="C"&&k[1]==="s"?"Mediterranean":k[0]==="C"?"temperate":"other";
const SAFR=["ao","zm","mw","mz","zw","bw","na","za","ls","sz","tz","cd","cg","ga","ke","rw","bi","ug","so","mg"];
const FOLD={tour:"climate",title:"Africa, folded at the Equator",low:1,
 tip:"Drag the slider (or press ▶) to fold the south of Africa up over the north. Do the colours land on the same kinds of climate?",
 card:()=>playerHTML("Fold","Flat")+'<div class="rvb-legend"></div>',
 init(L){L.u=0;L.g=svgEl(L.clip,"g",{class:"rvb-noev"});L.dots=[];L.tags=[tag(L,"rvb-small"),tag(L,"rvb-small"),tag(L,"rvb-small")];
  const polys=[];SAFR.forEach(c=>polysOf(feat(c)).forEach(p=>polys.push(p)));
  const build=()=>{if(!L.el.isConnected||!window.gfThermo)return;const pts=[];
   for(let lat=-35.5;lat<=-.5;lat+=1.1)for(let lon=8;lon<=51;lon+=1.1){const ll=[lon,lat];if(!polys.some(p=>d3.geoContains(p,ll)))continue;
    const c=gfThermo.at(ll);if(!c)continue;let k="";try{k=gfThermo.koppen(c.T,c.P,lat)}catch(e){}if(!KCOL[k])continue;pts.push({ll,k})}
   L.dots=pts.map(p=>{p.el=svgEl(L.g,"circle",{r:3.4,fill:KCOL[p.k],class:"rvb-dot"});return p});L.dirty=1};
  try{if(window.gfThermo)gfThermo.load().then(()=>setTimeout(build,30))}catch(e){}},
 tick(L,dt){advance(L,dt,4.5,0)},
 draw(L){const u=L.u,c=Math.cos(Math.PI*u);const z=g()?g().zoom||1:1,r=clamp(2.2*z,2.4,5);
  L.dots.forEach(p=>{const q=proj(L,[p.ll[0],p.ll[1]*c]);if(!q){p.el.style.display="none";return}p.el.style.display="";p.el.setAttribute("cx",q[0].toFixed(1));p.el.setAttribute("cy",q[1].toFixed(1));p.el.setAttribute("r",r.toFixed(1))});
  L.g.style.opacity=u<.02?".5":"1";
  /* the three southern zones and where they land */
  const Z=[[19,-23.5,"Kalahari & Namib (desert)"],[19.5,-33.9,"Cape Town (Mediterranean)"],[26,-12,"Savanna"]];
  Z.forEach((z0,i)=>{const q=u>.02?proj(L,[z0[0]+7,z0[1]*c],1):null;putTag(L,L.tags[i],q,(u>.97?"↑ ":"")+z0[2],-11)});
  /* while folded, the stop's own labels fade so the folded ones can be read */
  document.body.classList.toggle("rvb-folding",u>.02);
  syncRange(L,u<.02?"Flat":u>.98?"Folded":Math.round(u*100)+"%");
  if(L.card){const cnt={};L.dots.forEach(p=>{const f=KFAM(p.k);cnt[f]=(cnt[f]||0)+1});
   setHTML(L.card.querySelector(".rvb-legend"),'<div class="rvb-keys">'+[["rainforest","#0000ff"],["savanna","#46aafa"],["dry grassland","#f5a500"],["desert","#ff0000"],["Mediterranean","#ffff00"],["temperate","#64ff50"]].map(a=>'<span><i style="background:'+a[1]+'"></i>'+a[0]+"</span>").join("")+"</div>")}
  if(!L.dots.length)say(L,"Loading the climate data…","");
  else if(u<.03)say(L,"The south of Africa, dot by dot","Each dot is one patch of land south of the Equator, coloured by its climate, just like the map. Now fold it.");
  else if(u<.97)say(L,"Folding…","Every dot swings across the Equator to the same distance north. Watch the bands: blue savanna, orange dry grassland, red desert.");
  else say(L,"Folded: the bands line up","The south’s savanna lands on the Sahel’s savanna, the Kalahari and Namib land on the Sahara, and the Cape’s Mediterranean dots land beside the Mediterranean. The same sun, rain belt and sinking dry air make the same climates at the same distance from the Equator. The south is narrower, so its desert is much smaller.")}};

/* ======================================================================== climate | three "visit them all" stops
   A stop about places spread round the world cannot show them all on one side of a globe, and some sat under the card
   or round the back. Here a row of buttons turns the globe to each one in turn (beside the card), rings it and, where the
   point is the wind, draws the westerly wind blowing onto that coast. Figures are the stops' own, plus summit heights:
   Kilimanjaro 5,895 m (Tanzania National Parks), Margherita Peak in the Rwenzori 5,109 m, Cayambe 5,790 m, Puncak Jaya
   4,884 m, K2 8,611 m (each mountain's standard surveyed height, as in Encyclopaedia Britannica). "Colder than at sea
   level" uses the stop's own 6.5 °C per 1,000 m (the standard-atmosphere lapse rate). Rain seasons of the five
   Mediterranean climates: the wet season is winter, November–March north of the Equator and May–August south of it
   (Köppen Cs definition: the driest summer month has under a third of the wettest winter month's rain). */
const lapse=h=>Math.round(h*6.5/1000);
const VISITS={
 med:{tour:"climate",title:"Five Mediterraneans",tip:"Tap each one to fly there. Notice: every one is on a west coast, about 30–40° from the Equator.",
  P:[{n:"California",ll:[-120.5,36.3],z:2.4,w:[[-136,36.8],[-123,36.8]],t:"Los Angeles and San Francisco: rain mostly from November to March, then months of dry sunshine. The wind and the rain come off the Pacific, from the west."},
   {n:"Central Chile",ll:[-71.2,-34],z:2.6,w:[[-86,-34.5],[-72.6,-34.5]],t:"Santiago: the same pattern turned round, because the seasons are: rain from May to August, a dry summer from December to February."},
   {n:"Western Cape",ll:[19,-33.6],z:2.8,w:[[4,-35],[18,-34.4]],t:"Cape Town: wet winters from May to August, when the westerly winds swing north and bring storms off the Atlantic."},
   {n:"Southwest Australia",ll:[116.5,-32.5],z:2.6,w:[[101,-33.5],[115,-32.8]],t:"Perth: winter rain off the Indian Ocean, dry summers. Wheat, grapes and olives grow here too."},
   {n:"Mediterranean Basin",ll:[16,39.5],z:2.2,w:[[2,40.6],[13.6,40.6]],t:"Rome, Athens, Barcelona: the sea that gave the climate its name, on the west side of Europe and Asia. Olives, grapes and oranges again."}],
  end:"Five continents, the same recipe: a west coast about 30–40° from the Equator, under dry sinking air in summer and in the path of the westerly winds and their rain in winter."},
 fjord:{tour:"climate",title:"Fjords: carved on windy west coasts",tip:"Tap each coast to fly there. Which way does the wind blow in, and from where does the snow come?",
  P:[{n:"Norway",ll:[6.5,61.5],z:2.6,w:[[-10,61.5],[4.4,61.5]],t:"Sognefjord runs 205 km inland. Westerly winds off the Atlantic dump snow on Norway’s mountains; in the ice age that snow fed glaciers that dug the valleys."},
   {n:"Alaska & British Columbia",ll:[-133,56.5],z:2.4,w:[[-152,55.5],[-135.5,56]],t:"The Pacific’s westerlies hit the Coast Mountains, which get huge snowfalls and are still full of glaciers, some reaching the sea."},
   {n:"Southern Chile",ll:[-74,-48],z:2.4,w:[[-92,-48],[-75.6,-48]],t:"Down here the westerlies blow all year (sailors call these latitudes the Roaring Forties and Furious Fifties), and the coast is a maze of fjords and islands."},
   {n:"New Zealand’s Fiordland",ll:[167.3,-45.3],z:3.4,w:[[155,-45],[166.4,-45.2]],t:"Milford Sound: on the west side of the Southern Alps, where the westerlies drop several metres of rain a year."},
   {n:"Greenland",ll:[-26,70.5],z:2.2,w:null,t:"The exception: Greenland has fjords all round, east coast too, because its ice sheet still reaches the sea on every side. Scoresby Sund, here, is the biggest fjord system on Earth."}],
  end:"High-latitude west coasts face the westerly winds and their snow: big glaciers grew there, and the sea flooded their valleys when the ice melted. East coasts in the same latitudes, like eastern Sweden, lie in the mountains’ snow shadow."},
 ice:{tour:"climate",title:"Ice far from the poles",tip:"Tap a mountain to fly there. How high do you need to go to find ice on the Equator?",
  P:[{n:"Kilimanjaro",ll:[37.36,-3.07],z:3.2,h:5895,t:"5,895 m, three degrees south of the Equator: at 6.5 °C per 1,000 m its top is about "+lapse(5895)+" °C colder than the coast. It has lost over 80% of its ice since 1912."},
   {n:"Rwenzori",ll:[29.87,.39],z:3.2,h:5109,t:"The ‘Mountains of the Moon’, right by the Equator: Margherita Peak, 5,109 m, is about "+lapse(5109)+" °C colder than sea level, and still has small glaciers."},
   {n:"Cayambe",ll:[-77.99,.03],z:3.2,h:5790,t:"5,790 m, in Ecuador: the only place on the Equator itself with permanent snow and ice, about "+lapse(5790)+" °C colder at the top than at sea level."},
   {n:"Puncak Jaya",ll:[137.16,-4.08],z:3.2,h:4884,t:"4,884 m, in New Guinea: about "+lapse(4884)+" °C colder than the coast, only just cold enough. Its last ice may be gone within a few years."},
   {n:"Karakoram",ll:[76.51,35.88],z:2.6,h:8611,t:"Not tropical, but the most glaciers outside the polar regions: Pakistan has over 7,000. K2, 8,611 m, is about "+lapse(8611)+" °C colder at the top than at sea level."}],
  end:"The higher you go, the colder it gets, about 6.5 °C for every 1,000 m. Above roughly 4,500–5,000 m, even on the Equator, it is cold enough for snow to last all year."}};
function visitDef(V){return{tour:V.tour,title:V.title,tip:V.tip,
 card:()=>'<div class="rvb-row rvb-btns">'+V.P.map((p,i)=>'<button type="button" class="rvb-btn rvb-vb" data-i="'+i+'">'+esc(p.n)+"</button>").join("")+'</div><div class="rvb-note rvb-vc"></div>',
 init(L){L.cur=-1;L.seen={};L.ring=svgEl(L.clip,"path",{class:"rvb-vring"});L.wsh=svgEl(L.clip,"path",{class:"rvb-rsh"});L.wind=svgEl(L.clip,"path",{class:"rvb-wind"});L.head=svgEl(L.clip,"path",{class:"rvb-whead"});L.wT=tag(L,"rvb-small")},
 wire(L){L.card.querySelectorAll(".rvb-vb").forEach(b=>b.onclick=()=>{const i=+b.dataset.i,p=V.P[i];L.cur=i;L.seen[i]=1;L._said="";turnTo(L,p.ll,p.z);L.dirty=1})},
 tick(L){if(L.cur>=0&&V.P[L.cur].w)L.dirty=1},
 draw(L){const p=V.P[L.cur];if(L.card){L.card.querySelectorAll(".rvb-vb").forEach(b=>{const i=+b.dataset.i;b.classList.toggle("rvb-on",i===L.cur);b.classList.toggle("rvb-seen",!!L.seen[i]&&i!==L.cur)});
   setHTML(L.card.querySelector(".rvb-vc"),Object.keys(L.seen).length+" of "+V.P.length+" visited")}
  if(!p){L.ring.setAttribute("d","");L.wind.setAttribute("d","");L.wsh.setAttribute("d","");L.head.setAttribute("d","");putTag(L,L.wT,null);say(L,"","");return}
  L.ring.setAttribute("d",geoD(d3.geoCircle().center(p.ll).radius(p.z>3?1.4:2.4)()));
  if(p.w){const R=route(p.w,.2),d=pathOf(L,R.P);L.wind.setAttribute("d",d);L.wsh.setAttribute("d",d);L.wind.style.strokeDashoffset=String(-(performance.now()/30)%1000);
   const a=proj(L,p.w[1]),b=proj(L,at(R,.9).ll);if(a&&b){const ang=Math.atan2(a[1]-b[1],a[0]-b[0]),s=11;L.head.setAttribute("d","M"+(a[0]+Math.cos(ang)*4).toFixed(1)+" "+(a[1]+Math.sin(ang)*4).toFixed(1)+"L"+(a[0]-Math.cos(ang-.5)*s).toFixed(1)+" "+(a[1]-Math.sin(ang-.5)*s).toFixed(1)+"L"+(a[0]-Math.cos(ang+.5)*s).toFixed(1)+" "+(a[1]-Math.sin(ang+.5)*s).toFixed(1)+"Z")}else L.head.setAttribute("d","");
   putTag(L,L.wT,proj(L,at(R,.35).ll,1),"westerly wind",-30)}
  else{L.wind.setAttribute("d","");L.wsh.setAttribute("d","");L.head.setAttribute("d","");putTag(L,L.wT,null)}
  const done=Object.keys(L.seen).length===V.P.length;say(L,p.n,p.t+(done?" <i>"+V.end+"</i>":""))}}}
/* turn the globe smoothly so a place shows beside the card, not under it (as in geoflock-interact-world3.js) */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;touched=1;/* the stop has been moved on purpose: no re-fly */let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*28/z,ll[1]*(1-.3/Math.max(1,z))],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}

/* ======================================================================== rivers | The river that reverses
   Mekong River Commission (State of the Basin Report; "The Tonle Sap Lake"): the lake covers about 2,500 km² at the end
   of the dry season and up to about 16,000 km² in a big flood year (the stop's own figure). The Tonlé Sap River flows
   INTO the lake while the Mekong is high, usually from about June to September or early October, and back out to the
   Mekong for the rest of the year; Cambodia's Water Festival, Bon Om Touk, at the full moon of late October or November,
   marks the turn back. The month-by-month size in between is drawn as a smooth sketch, not measured data: the lake's
   own outline (Natural Earth, via the app's lakes layer) is scaled about its middle to the area for that month. */
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],MONL=["January","February","March","April","May","June","July","August","September","October","November","December"];
const TSR=[[104.93,11.57],[104.88,11.66],[104.84,11.78],[104.8,11.9],[104.72,12.02],[104.68,12.14],[104.66,12.26],[104.58,12.36],[104.49,12.45]];
const TONLE={tour:"rivers",title:"The river that reverses",loop:1,zoomIn:[[104.3,12.35],10],
 tip:"Press ▶ or drag through the year. Watch which way the Tonlé Sap River runs, and how big the lake gets.",
 card:()=>playerHTML("Month","Jan")+'<div class="rvb-bar2"><div class="rvb-bartitle">Lake size (sketch)</div><div class="rvb-track"><i></i></div><div class="rvb-note rvb-area"></div></div>',
 init(L){L.u=0;const G0=lakeGeom("Tonlé Sap");L.base=null;try{if(G0){const P=G0.type==="Polygon"?[G0.coordinates]:G0.coordinates;
   const big=P.map(c=>({type:"Polygon",coordinates:c})).sort((a,b)=>d3.geoArea(b)-d3.geoArea(a))[0];L.base=big;L.c=d3.geoCentroid(big);L.a0=d3.geoArea(big)*R_KM*R_KM}}catch(e){}
  L.lake=svgEl(L.clip,"path",{class:"rvb-lake"});L.rsh=svgEl(L.clip,"path",{class:"rvb-rsh"});L.riv=svgEl(L.clip,"path",{class:"rvb-flow"});
  L.dirT=tag(L,"rvb-bub");L.lakeT=tag(L,"rvb-small");L.R=route(TSR,.02)},
 tick(L,dt){advance(L,dt,14,1);if(L.el.isConnected)L.dirty=1},
 month(L){return(L.u*12)%12},
 inflow(t){return t>=5.5&&t<9.2},
 /* a smooth year: smallest in May, biggest in late September to early October */
 area(t){const peak=8.8,low=4.6;let f;if(t>=low&&t<=peak)f=(1-Math.cos(Math.PI*(t-low)/(peak-low)))/2;else{const d=((t-peak)+12)%12,span=12-(peak-low);f=(1+Math.cos(Math.PI*d/span))/2}return 2500+13500*f},
 draw(L){const t=this.month(L),inn=this.inflow(t),A=this.area(t);
  if(L.base){const s=Math.sqrt(A/L.a0),c=L.c,sc=p=>[c[0]+(p[0]-c[0])*s,c[1]+(p[1]-c[1])*s];
   const ring=L.base.coordinates[0].map(sc),top=ring.reduce((m,p)=>p[1]>m[1]?p:m,ring[0]);
   L.lake.setAttribute("d",pathOf(L,ring,true));putTag(L,L.lakeT,proj(L,top,1),"Tonlé Sap lake: about "+fmt(Math.round(A/500)*500)+" km²",-30)}
  const d=pathOf(L,inn?TSR:TSR.slice().reverse());L.riv.setAttribute("d",d);L.rsh.setAttribute("d",d);
  L.riv.style.strokeDashoffset=String(-(performance.now()/40)%1000);L.riv.classList.toggle("rvb-in",inn);
  const mid=at(L.R,.35).ll;putTag(L,L.dirT,proj(L,[mid[0]+.85,mid[1]+.1],1),inn?"⬆ Into the lake":"⬇ Out to the Mekong",-10);L.dirT.classList.toggle("rvb-green",inn);
  const mi=Math.floor(t);syncRange(L,MON[mi]);
  if(L.card){const tr=L.card.querySelector(".rvb-track i");if(tr)tr.style.width=(A/16000*100).toFixed(1)+"%";setHTML(L.card.querySelector(".rvb-area"),"about "+fmt(Math.round(A/500)*500)+" km² <small>(2,500 in May → up to 16,000 in a big flood)</small>")}
  if(inn)say(L,MONL[mi]+": the river runs backwards","Monsoon rain swells the Mekong so much that it is higher than the lake. Water pours up the Tonlé Sap River into the lake, which spreads over the forests and fields around it, several times its dry-season size.");
  else if(t>=9.2&&t<11)say(L,MONL[mi]+": the turn","The Mekong falls, so the lake is now the higher one and the river turns round to flow out again. Cambodians celebrate with Bon Om Touk, the Water Festival, with boat races in Phnom Penh.");
  else say(L,MONL[mi]+": flowing out","In the dry season the Tonlé Sap River runs the ‘normal’ way, down into the Mekong, and the lake slowly shrinks to its smallest by about May. Fish that grew fat in the flooded forest swim out with it.")}};

/* ======================================================================== rivers | Running from the sea
   The Niger's course is the app's own rivers layer (Natural Earth). Distances along it and to the sea are measured on
   the globe (great circles, Earth radius 6,371 km); "to the sea" is to the nearest of the coast points below, traced
   roughly along West Africa's coast from Natural Earth, so it is approximate (to tens of kilometres). The source and the
   ruler are the stop's own (Tembakounda, in the Guinea Highlands). The Niger is about 4,200 km long (Britannica). */
const COAST=[[-17,21],[-16.5,19.5],[-16.1,18],[-16.5,16.5],[-17.1,14.7],[-16.7,13.4],[-16.6,12.5],[-15.5,11.5],[-14.7,10.7],[-13.7,9.6],[-13.2,8.5],[-12.5,7.6],
 [-11.5,6.9],[-10.5,6.2],[-9.5,5.5],[-8.3,4.6],[-7.5,4.4],[-6.2,4.8],[-5,5.1],[-4,5.25],[-3,5.1],[-2,4.75],[-1,5.4],[.3,5.75],[1.2,6.1],[2.5,6.35],[3.4,6.4],[4.3,6.25],[5.1,5.8],[5.6,5.1],[6.1,4.3],[7,4.4],[8,4.5],[8.6,4.6]];
const toSea=ll=>COAST.reduce((m,c)=>Math.min(m,km(ll,c)),1e9);
function chain(lines,start){const segs=lines.map(l=>l.slice()).filter(l=>l.length>1);if(!segs.length)return[];
 let best=0,bd=1e9,rev=false;segs.forEach((s,i)=>{const a=km(s[0],start),b=km(s[s.length-1],start);if(a<bd){bd=a;best=i;rev=false}if(b<bd){bd=b;best=i;rev=true}});
 let out=segs.splice(best,1)[0];if(rev)out.reverse();
 while(segs.length){const e=out[out.length-1];let bi=-1,bdd=1e9,br=false;segs.forEach((s,i)=>{const a=km(s[0],e),b=km(s[s.length-1],e);if(a<bdd){bdd=a;bi=i;br=false}if(b<bdd){bdd=b;bi=i;br=true}});
  if(bdd>150)break;const s=segs.splice(bi,1)[0];if(br)s.reverse();out=out.concat(s)}return out}
const NIGER={tour:"rivers",title:"Running from the sea",
 tip:"Press ▶ or drag the raindrop down the Niger. Keep an eye on how far it is from the sea.",
 card:()=>playerHTML("Along the river","0 km")+'<div class="rvb-two"><div><b class="rvb-n1">0</b><span>km travelled</span></div><div><b class="rvb-n2">–</b><span>km from the sea</span></div></div>',
 init(L){L.u=0;const C=chain(riverLines("Niger"),[-10.7,9.1]);L.R=C.length>2?route(C,.08):null;L.far=0;
  L.done=svgEl(L.clip,"path",{class:"rvb-trail"});L.ray=svgEl(L.clip,"path",{class:"rvb-ray"});
  L.drop=svgEl(L.clip,"g",{class:"rvb-grab",tabindex:"0","aria-label":"Raindrop: drag it down the river"});svgEl(L.drop,"circle",{r:20,class:"rvb-hit"});
  svgEl(L.drop,"g",{},'<path d="M0 -15 C6 -6 9 -2 9 3 A9 9 0 0 1 -9 3 C-9 -2 -6 -6 0 -15Z" fill="#2f8fe0" stroke="#fff" stroke-width="2"/><circle cx="-3" cy="2" r="2.2" fill="#fff" opacity=".7"/>');
  L.dT=tag(L,"rvb-bub");L.hint=tag(L,"rvb-hint");
  if(L.R){let u0=0;draggable(L,L.drop,(x,y)=>{L.u=nearestU(L,L.R,x,y,L.u);L.moved=1},()=>{stopPlay(L);u0=L.u;L.undo=()=>{L.u=u0}},f=>{stopPlay(L);L.u=clamp(L.u+f*.01,0,1);L.moved=1})}},
 tick(L,dt){advance(L,dt,16,0)},
 draw(L){if(!L.R){say(L,"","The river's course could not be loaded.");return}
  const p=at(L.R,L.u),ll=p.ll,trav=L.u*L.R.total,sea=toSea(ll);if(L.u>.02)L.far=Math.max(L.far,sea);
  L.done.setAttribute("d",pathOf(L,L.R.P.slice(0,p.i+1).concat([ll])));
  /* the straight way to the sea it did not take: from the drop to the nearest coast point */
  const nc=COAST.reduce((b,c)=>km(ll,c)<km(ll,b)?c:b,COAST[0]);L.ray.setAttribute("d",pathOf(L,route([ll,nc],.2).P));
  place(L.drop,proj(L,ll));const q=proj(L,ll,1);putTag(L,L.dT,q,L.u>=.995?"The Atlantic, at last":fmt(sea)+" km from the sea",-22);
  putTag(L,L.hint,!L.moved&&!L.playing&&L.u<.01&&q?[q[0]+18,q[1]+4]:null,"Drag me, or press ▶");
  syncRange(L,fmt(trav)+" km");
  if(L.card){setHTML(L.card.querySelector(".rvb-n1"),fmt(trav));setHTML(L.card.querySelector(".rvb-n2"),L.u>=.995?"0":fmt(sea))}
  if(L.u<.02)say(L,"Only about 250 km from the ocean…","…so you might expect a raindrop here to run straight down to the Atlantic. Instead the Niger sets off north-east, away from it.");
  else if(ll[1]>14.5&&L.u<.6)say(L,"Into the edge of the Sahara","Now the drop is over "+fmt(Math.round(sea/50)*50)+" km from the sea. Here, by Timbuktu, the river spreads into the Inner Niger Delta and loses much of its water to the hot, dry air.");
  else if(L.u<.995)say(L,"Turning back south","The great bend: the river swings south-east, through Niger and into Nigeria, where the Benue joins it.");
  else say(L,"About "+fmt(Math.round(L.R.total/100)*100)+" km later","It reaches the Atlantic in Nigeria, after getting as far as about "+fmt(Math.round(L.far/50)*50)+" km from the sea. A straight run from the source would have been about 250 km. (Distances are measured along the map’s line of the river, which smooths its bends.)")}};

/* ======================================================================== lakes | A tsunami on Lake Geneva
   Kremer, Simpson & Girardclos (2012), "Giant Lake Geneva tsunami in AD 563", Nature Geoscience 5: 756–757, and the
   University of Geneva's release: in their model the wave reached Lausanne about 15 minutes after the collapse, up to
   about 13 m high, and Geneva about 70 minutes after it, about 8 m high. The track down the lake is drawn roughly
   along its middle; the times between those two towns are spread along it in proportion to distance (the wave is
   slower in the shallow western end, the Petit Lac, which is why the second leg takes so much longer). */
const GVR=[[6.88,46.385],[6.8,46.43],[6.71,46.47],[6.63,46.49],[6.53,46.47],[6.43,46.44],[6.33,46.41],[6.26,46.36],[6.21,46.29],[6.16,46.215]];
const GVT=[{n:"Vevey",ll:[6.843,46.462]},{n:"Évian",ll:[6.59,46.401]},{n:"Lausanne",ll:[6.633,46.512],t:15,h:13},{n:"Thonon",ll:[6.479,46.372]},{n:"Morges",ll:[6.498,46.511]},{n:"Rolle",ll:[6.338,46.46]},{n:"Nyon",ll:[6.239,46.383]},{n:"Geneva",ll:[6.148,46.204],t:70,h:8}];
const TSUNAMI={tour:"lakes",title:"A tsunami on Lake Geneva",zoomIn:[[6.52,46.4],18],
 tip:"Press ▶ to let the mountainside fall, then follow the wave down the lake. Which towns does it reach, and when?",
 card:()=>playerHTML("Minutes after the collapse","0 min")+'<div class="rvb-towns"></div>',
 init(L){L.u=0;L.R=route(GVR,.005);L.uL=L.R.K[L.R.P.findIndex(p=>Math.abs(p[0]-6.63)<1e-9&&Math.abs(p[1]-46.49)<1e-9)]/L.R.total||.35;
  L.rings=[0,1,2].map(()=>svgEl(L.clip,"path",{class:"rvb-wave"}));L.track=svgEl(L.clip,"path",{class:"rvb-wtrack"});L.boom=svgEl(L.clip,"g",{class:"rvb-noev"},'<circle r="7" fill="#8a5a2b" stroke="#fff" stroke-width="2"/>');
  L.towns=GVT.map(t=>{const R=L.R;let b=0,bd=1e9;R.P.forEach((p,i)=>{const d=km(p,t.ll);if(d<bd){bd=d;b=i}});return Object.assign({},t,{u:R.K[b]/R.total,dot:svgEl(L.clip,"circle",{r:5,class:"rvb-town"}),tg:tag(L,"rvb-small")})});
  L.fT=tag(L,"rvb-bub")},
 tick(L,dt){advance(L,dt,14,0)},
 /* minutes after the collapse for a point u along the track */
 tOf(L,u){return u<=L.uL?15*u/L.uL:15+55*(u-L.uL)/(1-L.uL)},
 uOf(L,t){return t<=15?L.uL*t/15:L.uL+(1-L.uL)*(t-15)/55},
 draw(L){const T=L.u*70,uf=this.uOf(L,T),f=at(L.R,uf).ll;
  L.track.setAttribute("d",pathOf(L,L.R.P.slice(0,at(L.R,uf).i+1).concat([f])));
  L.rings.forEach((r,k)=>{const rad=Math.max(.001,.035-.009*k);r.setAttribute("d",L.u>0&&L.u<1?pathOf(L,d3.range(0,361,15).map(a=>[f[0]+rad*1.45*Math.cos(a*DEG),f[1]+rad*Math.sin(a*DEG)]),true):"");r.style.opacity=String(.9-.25*k)});
  place(L.boom,proj(L,GVR[0]));
  L.towns.forEach(t=>{const hit=uf>=t.u-.004;t.dot.classList.toggle("rvb-hitn",hit);const q=proj(L,t.ll);if(q){t.dot.setAttribute("cx",q[0]);t.dot.setAttribute("cy",q[1]);t.dot.style.display=""}else t.dot.style.display="none";
   /* names only for Lausanne and Geneva until the wave gets there, so the small towns do not pile up */
   putTag(L,t.tg,proj(L,t.ll,1),hit?(t.t?"🌊 "+t.n+" · "+t.t+" min":"🌊 "+t.n):t.t?t.n:null,t.ll[1]<46.43?6:-28);t.tg.classList.toggle("rvb-red",hit)});
  putTag(L,L.fT,L.u>0&&L.u<1?proj(L,f,1):null,Math.round(T)+" min",-18);
  syncRange(L,Math.round(T)+" min");
  if(L.card){setHTML(L.card.querySelector(".rvb-towns"),'<div class="rvb-tl">'+L.towns.map(t=>{const hit=uf>=t.u-.004;return'<span class="'+(hit?"rvb-tw-hit":"")+'">'+(hit?"🌊 ":"")+esc(t.n)+(t.t&&hit?" <b>"+t.t+" min, ~"+t.h+" m</b>":"")+"</span>"}).join("")+"</div>")}
  if(L.u<=0)say(L,"AD 563, at the eastern end of the lake","A mountainside crashes into the Rhône valley and shakes loose the soft mud of the river’s delta, which slides down into the deep lake. Press ▶.");
  else if(T<15)say(L,"The wave races west","In the deep eastern lake (over 300 m) the wave travels at about 90 km/h, as fast as a car on a motorway. The towns on both shores have only minutes.");
  else if(T<69)say(L,"Lausanne hit after about 15 minutes","The model gives a wave up to about 13 m high at Lausanne. Then the lake narrows and gets shallow, so the wave slows right down.");
  else say(L,"Geneva, about 70 minutes later","An 8 m wave reaches Geneva, where chroniclers wrote that it swept away the bridge and mills and killed many people. Scientists found the slide’s mud on the lakebed in 2012. Around a million people live by the shore today.")}};

/* ======================================================================== lakes | Sharks in fresh water
   The route up the San Juan River (Río San Juan), from its mouth at San Juan de Nicaragua on the Caribbean to San Carlos
   on Lake Nicaragua, is traced roughly from Natural Earth; the river is about 190 km long (Encyclopaedia Britannica). El
   Castillo's rapids are among the river's rapids that the sharks leap (the stop's own text). Seawater holds about 35 g of
   salt per litre (NOAA); river and lake water almost none. Thorson's tagging in the 1960s showed the sharks travel between
   the sea and the lake (Thorson, 1971, Copeia), and bull sharks' kidneys and rectal gland adjust to keep their salt in
   fresh water (Pillans et al., 2005, J. Exp. Biol.). */
const SJR=[[-83.69,10.93],[-83.78,10.85],[-83.88,10.76],[-83.96,10.72],[-84.08,10.76],[-84.2,10.82],[-84.3,10.92],[-84.38,10.99],[-84.44,11.02],[-84.55,11.06],[-84.66,11.09],[-84.78,11.12],[-84.95,11.25],[-85.1,11.38]];
const SHARK={tour:"lakes",title:"Sharks in fresh water",zoomIn:[[-84.55,11.15],14],
 tip:"Drag the bull shark from the Caribbean up the San Juan River into Lake Nicaragua.",
 card:()=>'<div class="rvb-salt"><div class="rvb-bartitle">Salt in the water around the shark</div><div class="rvb-track rvb-strack"><i></i></div><div class="rvb-note rvb-sread"></div></div><div class="rvb-two"><div><b class="rvb-n1">0</b><span>km up the river</span></div><div><b class="rvb-n2">Sea</b><span>where it is</span></div></div>',
 init(L){L.u=0;L.R=route(SJR,.01);L.uLake=L.R.K[L.R.P.findIndex(p=>Math.abs(p[0]+84.78)<1e-9)]/L.R.total||.85;L.uCas=L.R.K[L.R.P.findIndex(p=>Math.abs(p[0]+84.44)<1e-9)]/L.R.total||.6;
  L.trail=svgEl(L.clip,"path",{class:"rvb-trail rvb-strail"});L.sh=svgEl(L.clip,"g",{class:"rvb-grab",tabindex:"0","aria-label":"Bull shark: drag it up the river"});svgEl(L.sh,"circle",{r:22,class:"rvb-hit"});
  L.shI=svgEl(L.sh,"g",{},'<path d="M-18 0 C-10 -7 6 -8 16 -2 L22 -6 L20 0 L22 6 L16 2 C6 8 -10 7 -18 0Z" fill="#7d8b99" stroke="#fff" stroke-width="1.6"/><path d="M-2 -6 L2 -15 L6 -5Z" fill="#7d8b99" stroke="#fff" stroke-width="1.2"/><circle cx="-12" cy="-1.5" r="1.4" fill="#13294b"/>');
  L.castle=svgEl(L.clip,"g",{class:"rvb-noev"},'<circle r="5" fill="#fff" stroke="#8a5a2b" stroke-width="2"/>');L.cT=tag(L,"rvb-small");L.sT=tag(L,"rvb-bub");L.hint=tag(L,"rvb-hint");
  let u0=0;draggable(L,L.sh,(x,y)=>{L.u=nearestU(L,L.R,x,y,L.u);L.moved=1},()=>{u0=L.u;L.undo=()=>{L.u=u0}},f=>{L.u=clamp(L.u+f*.01,0,1);L.moved=1})},
 draw(L){const p=at(L.R,L.u),ll=p.ll,up=L.u*L.R.total,lake=L.u>=L.uLake,salt=L.u<.03?35*(1-L.u/.03):0;
  L.trail.setAttribute("d",pathOf(L,L.R.P.slice(0,p.i+1).concat([ll])));
  const a=at(L.R,Math.min(1,L.u+.01)).ll,q0=proj(L,ll),q1=proj(L,a);let ang=0;if(q0&&q1)ang=Math.atan2(q1[1]-q0[1],q1[0]-q0[0])/DEG+180;
  place(L.sh,q0,"rotate("+ang.toFixed(0)+")");L.shI.setAttribute("transform",Math.abs(((ang%360)+360)%360-180)<90?"":"scale(1,-1)");
  const qc=proj(L,SJR[8]);place(L.castle,qc);putTag(L,L.cT,proj(L,SJR[8],1),"El Castillo rapids",8);
  const jump=Math.abs(L.u-L.uCas)<.03;putTag(L,L.sT,proj(L,ll,1),lake?"In the lake!":jump?"Leap!":salt>0?"Salty sea":"Fresh water",-24);
  putTag(L,L.hint,!L.moved&&q0?[q0[0]+20,q0[1]+6]:null,"Drag me up the river");
  if(L.card){const tr=L.card.querySelector(".rvb-strack i");if(tr)tr.style.width=(salt/35*100).toFixed(0)+"%";
   setHTML(L.card.querySelector(".rvb-sread"),salt>0?"about "+Math.round(salt)+" g of salt per litre (sea water: about 35)":"almost none: fresh water");
   setHTML(L.card.querySelector(".rvb-n1"),fmt(Math.min(up,L.R.K[L.R.P.findIndex(p=>Math.abs(p[0]+84.78)<1e-9)]||up)));setHTML(L.card.querySelector(".rvb-n2"),lake?"Lake":salt>0?"Sea":"River")}
  if(L.u<.005)say(L,"A bull shark in the Caribbean","Most sharks would die in fresh water: their bodies would soak it up and lose their salt. Bull sharks can switch.");
  else if(salt>0)say(L,"Into the river mouth","The water gets less and less salty. The shark’s kidneys start making lots of very dilute urine, and its salt-dumping gland slows down, so it keeps its salt in.");
  else if(jump)say(L,"Leaping the rapids","At rapids like El Castillo’s, bull sharks have been seen jumping up through the white water like salmon.");
  else if(!lake)say(L,"Up the San Juan River","About 190 km of river from the sea to the lake, all of it fresh water. Tagging has shown that sharks really do travel between the sea and the lake.");
  else say(L,"Into Lake Nicaragua","For years scientists thought the lake’s sharks were a separate, trapped kind. Tagging in the 1960s showed they are the same bull sharks, coming and going from the sea. Overfishing has made them rare here now.")}};

/* ======================================================================== seas | The busiest gateways
   Close a canal and see the detour. The sea routes are traced roughly along the usual shipping lanes (waypoints below)
   and measured on the globe as great circles, so the totals are approximate; they match published port-to-port
   distances to within a few per cent (Rotterdam–Singapore about 8,300 nautical miles, 15,400 km, via Suez and about
   11,750 nmi, 21,800 km, round the Cape of Good Hope; New York–San Francisco about 9,500 km via Panama and
   22,500 km (Wikipedia, "Panama Canal") to 24,300 km (port-distance tables such as Sea-distances.org) round the tip of
   South America; this route, outside Cape Horn, measures about 24,900 km, so the detour shown may be a little long. Days at sea assume a steady 15 knots (28 km/h), a common speed for big cargo ships. */
const GATES={
 suez:{n:"Suez Canal",a:"Rotterdam",b:"Singapore",gate:[32.35,30.5],
  open:[[4.05,51.98],[1.5,51.1],[-1,50.2],[-5.5,48.9],[-9.6,43.3],[-9.8,38.5],[-7.5,36.2],[-5.6,35.95],[-2,36.4],[4,37.6],[10.5,37.6],[15,36.3],[22,34],[28,32.5],[32.3,31.35],[32.55,29.9],[34,27.5],[37,23],[40,18],[42.5,14.3],[43.4,12.6],[45.5,12.2],[51.3,12.3],[60,11],[72,8.5],[80.6,5.6],[88,5.9],[94.5,5.8],[97.5,5.3],[100.5,3.1],[102.3,1.8],[103.8,1.25]],
  shut:[[4.05,51.98],[1.5,51.1],[-1,50.2],[-5.5,48.9],[-10.5,43],[-14,33],[-18.5,21],[-18,13],[-13,4],[-2,-4],[7,-15],[12,-25],[16.5,-33],[18.5,-35.2],[22,-36.2],[30,-35.5],[42,-31],[55,-22],[70,-10],[85,-2],[94.5,5.8],[97.5,5.3],[100.5,3.1],[102.3,1.8],[103.8,1.25]],
  look:[22,8,1.05],say:"Ships must go all the way round Africa, past the Cape of Good Hope. In 2021 the Ever Given blocked the canal for six days and hundreds of ships queued at each end; since late 2023 attacks near Bab-el-Mandeb have sent many ships the long way round again."},
 panama:{n:"Panama Canal",a:"New York",b:"San Francisco",gate:[-79.7,9.1],
  open:[[-74,40.5],[-72.5,36],[-73,30],[-73.5,24],[-73.8,20.2],[-75,17],[-78.5,12],[-79.9,9.4],[-79.55,8.9],[-80,7.5],[-84,8],[-91,12.5],[-98,15.5],[-105,19.5],[-110,22.8],[-114.5,27],[-117.5,31.5],[-120.5,34.4],[-122.6,37.8]],
  shut:[[-74,40.5],[-60,24],[-46,8],[-34.6,-6],[-37.2,-13],[-41,-23],[-47,-29],[-53,-35],[-62,-47],[-63.3,-54.3],[-65.5,-56.3],[-67.3,-56.6],[-70,-56.6],[-76,-50.5],[-92,-20],[-102.7,0],[-113,20],[-117.8,30],[-121.5,33.6],[-122.6,37.8]],
  look:[-78,-6,1.05],say:"Without the canal, ships between the Atlantic and Pacific coasts of the Americas sail right round South America and Cape Horn, through some of the stormiest seas on Earth. Before 1914 that was the only sea route."}};
const KNOT=1.852,SPEED=15*KNOT;
const GATE={tour:"seas",title:"The busiest gateways",
 tip:"Close a canal and send a ship: how much longer is the trip the long way round?",
 card:()=>'<div class="rvb-row rvb-btns">'+Object.keys(GATES).map(k=>'<button type="button" class="rvb-btn rvb-gk" data-k="'+k+'">'+esc(GATES[k].n)+"</button>").join("")+'</div><div class="rvb-row rvb-btns"><button type="button" class="rvb-btn rvb-go" data-s="0">⛴ Sail with it open</button><button type="button" class="rvb-btn rvb-go" data-s="1">🚧 Close it and sail</button></div><div class="rvb-gres"></div>',
 init(L){L.k="suez";L.res={};L.u=1;L.mode=0;L.sh=svgEl(L.clip,"path",{class:"rvb-rsh"});L.rt=svgEl(L.clip,"path",{class:"rvb-route"});L.rt0=svgEl(L.clip,"path",{class:"rvb-route0"});
  L.ship=svgEl(L.clip,"g",{class:"rvb-noev"},'<circle r="9" fill="#13294b" stroke="#fff" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11">⛴</text>');L.gX=svgEl(L.clip,"g",{class:"rvb-noev"});
  L.aT=tag(L,"rvb-small");L.bT=tag(L,"rvb-small");L.sT=tag(L,"rvb-bub");L.R={};for(const k in GATES)L.R[k]=[route(GATES[k].open,.4),route(GATES[k].shut,.4)]},
 wire(L){const c=L.card;c.querySelectorAll(".rvb-gk").forEach(b=>b.onclick=()=>{L.k=b.dataset.k;L.u=1;L.mode=0;L._said="";this.turn(L);L.dirty=1});
  c.querySelectorAll(".rvb-go").forEach(b=>b.onclick=()=>{L.mode=+b.dataset.s;L.u=0;L.playing=true;L._said="";if(!L.turned||L.turned!==L.k+L.mode){L.turned=L.k+L.mode;this.turn(L)}L.dirty=1})},
 turn(L){const t=GATES[L.k].look;turnTo(L,[t[0],t[1]],t[2])},
 tick(L,dt){if(L.playing){L.u+=dt/(L.mode?7:4.5);if(L.u>=1){L.u=1;L.playing=false;L.res[L.k+L.mode]=1}L.dirty=1}},
 draw(L){const Gt=GATES[L.k],R=L.R[L.k][L.mode],R0=L.R[L.k][0],p=at(R,L.u);
  L.rt0.setAttribute("d",L.mode?pathOf(L,R0.P):"");const d=pathOf(L,R.P.slice(0,p.i+1).concat([p.ll]));L.rt.setAttribute("d",d);L.sh.setAttribute("d",d);L.rt.classList.toggle("rvb-long",!!L.mode);
  place(L.ship,proj(L,p.ll));const qg=proj(L,Gt.gate);L.gX.innerHTML=L.mode?'<path d="M-8 -8L8 8M8 -8L-8 8" stroke="#c2364f" stroke-width="4" stroke-linecap="round"/>':"";place(L.gX,qg);
  putTag(L,L.aT,proj(L,R.P[0],1),Gt.a,8);putTag(L,L.bT,proj(L,R.P[R.P.length-1],1),Gt.b,8);
  const dist=R.total*L.u;putTag(L,L.sT,L.u>0&&L.u<1?proj(L,p.ll,1):null,fmt(Math.round(dist/100)*100)+" km",-14);
  const o=R0.total,s=L.R[L.k][1].total,days=k=>k/SPEED/24;
  if(L.card){L.card.querySelectorAll(".rvb-gk").forEach(b=>b.classList.toggle("rvb-on",b.dataset.k===L.k));L.card.querySelectorAll(".rvb-go").forEach(b=>b.classList.toggle("rvb-on",+b.dataset.s===L.mode));
   const row=(lab,km_,on)=>'<div class="rvb-grow'+(on?" rvb-on2":"")+'"><span>'+lab+'</span><div class="rvb-track"><i style="width:'+(km_/s*100).toFixed(0)+'%"></i></div><b>'+fmt(Math.round(km_/100)*100)+" km · "+Math.round(days(km_))+" days</b></div>";
   setHTML(L.card.querySelector(".rvb-gres"),'<div class="rvb-bartitle">'+esc(Gt.a)+" → "+esc(Gt.b)+"</div>"+row("Through the canal",o,!L.mode)+(L.res[L.k+"1"]||L.mode?row("The long way",L.mode&&L.u<1?Math.max(o*.02,s*L.u):s,!!L.mode):""))}
  if(L.mode&&L.u>=1)say(L,"Closed: about "+fmt(Math.round((s-o)/100)*100)+" km farther","That is about "+Math.round(days(s-o))+" more days at sea, with more fuel and wages, and the goods arrive late. "+Gt.say);
  else if(!L.mode&&L.u>=1&&L.res[L.k+"0"])say(L,"Through the "+Gt.n+": about "+fmt(Math.round(o/100)*100)+" km","About "+Math.round(days(o))+" days at 15 knots. Now close it and send the ship again.");
  else if(L.playing)say(L,L.mode?"Taking the long way round…":"Sailing through the "+Gt.n+"…","");
  else say(L,esc(Gt.a)+" to "+esc(Gt.b),"Press “Sail with it open”, then “Close it and sail”, and compare.")}};

/* ---------------- the engine: one stop at a time (as in geoflock-interact-world3.js) ---------------- */
const DEFS=[FOLD,visitDef(VISITS.med),visitDef(VISITS.fjord),visitDef(VISITS.ice),TONLE,NIGER,TSUNAMI,SHARK,GATE];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);return DEFS.find(d=>d.tour===ps.tour&&d.title===t)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="rvb-layer";el.innerHTML='<svg class="rvb-svg"><defs><clipPath id="rvbClip"><path class="rvb-clipp" clip-rule="evenodd"/></clipPath></defs><g class="rvb-clipg" clip-path="url(#rvbClip)"></g></svg>';if(D.low)el.classList.add("rvb-low");G.host.appendChild(el);
 const svg=el.querySelector("svg");L={D,host:G.host,el,svg,clip:svg.querySelector(".rvb-clipg"),clipP:svg.querySelector(".rvb-clipp"),u:0,playing:false,dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}document.body.classList.add("rvb-on");lastT=0;loop();
 /* a stop whose subject is tiny at the tour's top zoom (6) moves in closer once it has settled, unless the reader has
    already moved the globe */
 if(D.zoomIn){const L0=L,t0=performance.now();let still=0,last="";L.zt2=setInterval(()=>{try{const G2=g();if(L!==L0||!L.el.isConnected||!G2){clearInterval(L0.zt2);return}
  const k=G2.rot.map(v=>v.toFixed(2)).join()+"|"+(+G2.zoom).toFixed(2);still=k===last&&!G2._flying?still+1:0;last=k;
  if(performance.now()-t0>14000){clearInterval(L.zt2);return}
  if(performance.now()-t0>3200&&(still>=2||performance.now()-t0>5000)&&!G2._flying){clearInterval(L.zt2);let zt=6;try{zt=psGlobeTarget(psSteps()[ps.i])[2]}catch(e){}if(Math.abs(G2.zoom-zt)<.4)turnTo(L,D.zoomIn[0],D.zoomIn[1])}}catch(e){}},400)}}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){clearInterval(L.zt2);try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvb-ctl").forEach(c=>c.remove());document.body.classList.remove("rvb-on","rvb-folding")}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".rvb-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvb-ctl";
 c.innerHTML='<div class="rvb-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvb-ep"></div>';at0.after(c);L.card=c;L._said="";
 try{if(c.querySelector(".rvb-play"))wirePlayer(L);if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}playBtn(L);L.dirty=1}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);
   L.clipP.setAttribute("d","M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z"+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvb-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
/* a tour stop's thermometers (geoflock-thermo.js, z-index 8) were drawn on top of the tour card (z-index 7) when their
   place sat under it; keep them under the card */
.globe-host.ps-on .gfth-pin,.globe-host.ps-on .gfth-tag{z-index:6}
/* rivers | "The longest river?": the felucca photo (a tall picture) was cropped to empty sky; show the boat on the Nile */
.ps-card figure img[src*="46ec06d828f0d4a4"]{object-position:50% 66%!important}
.rvb-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvb-layer.rvb-low{z-index:4}
.rvb-svg{position:absolute;left:0;top:0;overflow:visible}
.rvb-grab{pointer-events:all;cursor:grab;touch-action:none;outline:none}.rvb-grab.rvb-dragging{cursor:grabbing}
.rvb-noev{pointer-events:none}
.rvb-hit{fill:rgba(255,255,255,.001);stroke:none}
.rvb-grab>g{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.rvb-grab:hover>g,.rvb-grab:focus-visible>g{filter:drop-shadow(0 0 5px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.rvb-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvb-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.rvb-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvb-hint{transform:none;background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:rvbNudge 1.4s ease-in-out infinite}
@keyframes rvbNudge{50%{transform:translateX(6px)}}
.rvb-dot{stroke:rgba(20,30,50,.75);stroke-width:.8}
.rvb-lake{fill:rgba(47,143,224,.55);stroke:#0d5ea8;stroke-width:2;stroke-linejoin:round}
.rvb-rsh{fill:none;stroke:rgba(10,20,40,.5);stroke-width:8;stroke-linecap:round;stroke-linejoin:round}
.rvb-flow{fill:none;stroke:#ffb347;stroke-width:4.5;stroke-linecap:round;stroke-dasharray:9 7}.rvb-flow.rvb-in{stroke:#5fe08a}
.rvb-green{background:#1f7a45}.rvb-red{background:#c2364f!important;color:#fff!important}
.rvb-track{position:relative;height:10px;border-radius:6px;background:rgba(19,41,75,.12);overflow:hidden}.rvb-track i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,#7fc4ff,#1d6fc0);transition:width .15s}
.rvb-strack i{background:linear-gradient(90deg,#ffd166,#d9682b)}
.rvb-two{display:flex;gap:12px;margin-top:8px}.rvb-two div{flex:1 1 0;background:rgba(255,255,255,.7);border-radius:10px;padding:5px 8px}.rvb-two b{display:block;font-size:19px;color:#1d6fc0}.rvb-two span{font-size:11.5px;font-weight:700;opacity:.8}
.rvb-trail{fill:none;stroke:#2f8fe0;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.9}.rvb-strail{stroke:#7d8b99;stroke-dasharray:2 6}
.rvb-ray{fill:none;stroke:#d9682b;stroke-width:2.5;stroke-dasharray:6 5}
.rvb-wave{fill:rgba(47,143,224,.25);stroke:#fff;stroke-width:2.5}
.rvb-wtrack{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round;opacity:.8}
.rvb-town{fill:#fff;stroke:#13294b;stroke-width:2}.rvb-town.rvb-hitn{fill:#c2364f}
.rvb-tl{display:flex;flex-wrap:wrap;gap:4px 6px;margin-top:8px}.rvb-tl span{font-size:12px;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(19,41,75,.08)}.rvb-tl span.rvb-tw-hit{background:#c2364f;color:#fff}
body.dark-theme .rvb-two div{background:rgba(255,255,255,.08)}body.dark-theme .rvb-two b{color:#8fc8ff}body.dark-theme .rvb-track{background:rgba(255,255,255,.15)}body.dark-theme .rvb-tl span{background:rgba(255,255,255,.1)}
.rvb-route{fill:none;stroke:#2fd06a;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}.rvb-route.rvb-long{stroke:#ff8a3d}
.rvb-route0{fill:none;stroke:#2fd06a;stroke-width:2;stroke-dasharray:4 5;opacity:.8}
.rvb-grow{display:flex;align-items:center;gap:8px;font-size:12px;margin-top:4px;opacity:.75}.rvb-grow.rvb-on2{opacity:1}.rvb-grow span{flex:0 0 110px;font-weight:700}.rvb-grow .rvb-track{flex:1 1 auto}.rvb-grow b{flex:0 0 auto;font-size:12px}
.rvb-vring{fill:rgba(255,209,102,.18);stroke:#ffd166;stroke-width:3;stroke-dasharray:6 4}
.rvb-wind{fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;stroke-dasharray:12 8}.rvb-whead{fill:#fff;stroke:rgba(10,20,40,.5);stroke-width:1}
.rvb-btn.rvb-seen{background:rgba(31,138,76,.12);border-color:#1f8a4c}
.rvb-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvb-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvb-row{display:flex;align-items:center;gap:10px}
.rvb-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.rvb-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.rvb-read{flex:0 0 auto;font-weight:800;font-size:12.5px;color:#9a4a16;white-space:nowrap;min-width:64px;text-align:right}
.rvb-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvb-ep b{display:block;font-size:15px}
.rvb-ep.rvb-new{animation:rvbIn .45s ease}@keyframes rvbIn{from{opacity:.2;transform:translateY(4px)}}
.rvb-btns{margin-top:8px;gap:6px;flex-wrap:wrap}
.rvb-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.rvb-btn.rvb-on{background:#13294b;color:#fff;border-color:#13294b}
.rvb-btn:disabled{cursor:default;opacity:.55}.rvb-btn.rvb-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvb-btn.rvb-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvb-keys{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:8px;font-size:12px;font-weight:700}.rvb-keys i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px;border:1px solid rgba(20,30,50,.6)}
.rvb-note{font-size:12px;opacity:.8;margin-top:3px}
.rvb-bartitle{font-size:12px;font-weight:700;opacity:.75;margin:8px 0 2px}
.rvb-svgc{display:block;width:100%;height:auto}.rvb-svgc text{font-size:9.5px;font-weight:700;fill:#13294b}
body.rvb-on .ps-leaders{opacity:.5}
body.rvb-folding .ps-pins,body.rvb-folding .ps-leaders{opacity:.18;transition:opacity .3s}
body.dark-theme .rvb-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark-theme .rvb-do,body.dark-theme .rvb-read{color:#ffb27a}
body.dark-theme .rvb-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
body.dark-theme .rvb-btn.rvb-on{background:#fff;color:#13294b}
body.dark-theme .rvb-svgc text{fill:#fff}`;document.head.appendChild(s)}
window.gfPolishRvb={v:1,FIX,set:u=>{if(L){L.u=clamp(u,0,1);L.dirty=1}},get:()=>L?{title:L.D.title,u:L.u}:null,L:()=>L,apply:applyAll};
})();
