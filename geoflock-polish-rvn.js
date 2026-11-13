/* GeoFlock polish RV-N: a stop-by-stop review of the four AP Human Geography Unit 5 tours, How the world farms (hg5a),
   Models of rural land (hg5b), Food in a global system (hg5c) and Farming and the planet (hg5d), each looked at on the
   globe, their default mode, at 1280×860. Built on geoflock-polish-rvk.js (the same helpers and engine).
   1. Fixes, keyed by tour and stop title, applied once the page has settled and again whenever one of these tours is on
      (to the stops psSteps() builds as well). Each fix says why; changed facts cite their source.
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3).
   geoflock-sweep-tours*.js re-set framing on every psGo, so a fixed field becomes a non-configurable getter whose setter
   is ignored; a field already non-configurable (fixed by another file) is left alone. CSS classes start with "rvn-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvn)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};
const TEST=()=>!!(window.__rvnTest||/[?&]rvntest\b/.test(location.search));

/* ======================================================================== part 1: data fixes */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* a field that keeps taking new values from other scripts, but always reads back filtered */
const FILT=(S,k,fn)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvn){d.get._rvn.push(fn);return}if(d&&d.configurable===false)return;let v=S[k];const fns=[fn];
 const get=()=>fns.reduce((x,f)=>{try{return f(x)}catch(e){return x}},v);get._rvn=fns;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get,set:x=>{v=x}})}catch(e){}};
/* swap one phrase in a text field, now and whenever another script sets the field again */
const RE=(S,k,a,b)=>FILT(S,k,t=>typeof t==="string"&&t.indexOf(a)>=0?t.split(a).join(b):t);
const pinText=p=>Array.isArray(p)?String(p[1]||""):String(p&&(p.text||p.label)||"");
/* drop the text pins / photo pins whose label matches (also from pins other scripts add later) */
const DROP=(S,re)=>FILT(S,"pins",P=>Array.isArray(P)?P.filter(p=>!re.test(strip(pinText(p)))):P);
const DROPPH=(S,re)=>FILT(S,"phPins",P=>Array.isArray(P)?P.filter(q=>!re.test(strip(q&&q.label))):P);
/* a point pin becomes an "area" label: still shown, but index.html no longer turns the globe to the middle of it and
   the stop's other pins (gfSubjectPts skips area pins) */
const AREA=(S,re)=>FILT(S,"pins",P=>Array.isArray(P)?P.map(p=>Array.isArray(p)&&re.test(strip(pinText(p)))&&p[2]!=="area"&&typeof(p[0]&&p[0][0])==="number"?[[p[0]],p[1],"area"]:p):P);
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine turns it out from under the card */
const VIEW=(S,gl,card)=>{LOCK(S,"globe",gl);if(card)LOCK(S,"card",card)};

const FIX={
 hg5a:{
  /* the Yunnan and Laos photos sat at the globe's right edge, by the zoom buttons, and Cape Town's below the bottom */
  "How the world farms":S=>VIEW(S,[70,5,1],"left"),
  /* the Fertile Crescent and its wheat were under the card, New Guinea at the edge, Mesoamerica and the Andes round
     the back: the stop opens on the Old World hearths, and buttons (part 3) turn the globe to each of the five */
  "Where farming began":S=>VIEW(S,[84,26,1.1],"left"),
  /* the globe turned to the middle of Ethiopia and the USA, 13,000 km apart, so it faced the Arctic: Ethiopia's label
     lay under the graphics notice and the USA sat on the globe's edge, with the card on the right. The USA becomes an
     area label; the sorting game (part 3) turns the globe to each farm */
  "Subsistence and commercial":S=>{AREA(S,/^USA/);VIEW(S,[26,16,1.15],"left")},
  /* the Kansas photo lay across the harvest route, over Oklahoma and Kansas, where the route game (part 3) marks them */
  "Following the wheat north":S=>DROPPH(S,/^Kansas: wheat/),
  /* zoomed in so far that Ohio, one end of the Corn Belt, was at the globe's edge */
  "Mixed crop and livestock":S=>VIEW(S,[-90,41,3],"left"),
  /* the globe faced the Indian Ocean: Australia on the edge, the Pampas and the Great Plains round the back, and the
     purple Belgium to drag below the bottom of the screen. It opens on Anna Creek; buttons (part 3) visit the others */
  "Extensive farming":S=>VIEW(S,[134,-27,2.2],"left"),
  /* the Sahel was under the card, Mongolia on the globe's edge and the South Sudan photo nowhere: Africa's herders
     now sit beside the card (Mongolia is still on the map, one turn of the globe away) */
  "Pastoral nomadism":S=>VIEW(S,[22,14,1.7],"left"),
  /* the Congo basin was under the card and the Southeast Asian uplands on the globe's edge: 80° apart, they cannot
     both sit beside the card, so the stop opens on the Congo and buttons (part 3) turn the globe to all three forests */
  "Shifting cultivation":S=>VIEW(S,[34,4,1.5],"left")
 },
 hg5b:{
  /* the globe turned to the middle of six photos from Kansas to Punjab and faced the Arctic, with the card on the
     right over the Punjab photo. Punjab's Green Revolution and Kansas's wheat belong to the next and previous tours;
     Norfolk's photo lay on top of Westland's; the three left are this tour's own places */
  "Models of rural land":S=>{DROPPH(S,/^(Punjab|Kansas|Wheat field|Norfolk)/);VIEW(S,[-35,50,1],"left")},
  /* the card stood on the right over Germany, and Iowa and Quebec sat on the globe's far edge: the sorting game
     (part 3) turns the globe to each kind of settlement */
  "Patterns of rural settlement":S=>VIEW(S,[-20,48,1.15],"left"),
  /* the Seven Ranges label lay under the map key */
  "Township and range":S=>VIEW(S,[-79,41,2.8],"left"),
  /* index.html turned the globe to the middle of Britain and Mexico, so it faced North America and the first
     revolution's Fertile Crescent was round the back. Both become area labels; the stop opens on the Old World and
     buttons (part 3) turn the globe to each revolution's birthplace */
  "Three agricultural revolutions":S=>{AREA(S,/^(Second|Third):/);VIEW(S,[22,40,1],"left")}
 },
 hg5c:{
  /* six photos from Iowa to Punjab, half a world apart, turned the globe towards the Atlantic with Iowa and Colombia
     under the card and the DR Congo photo on the globe's edge. Iowa, Punjab and Colombia each have their own stop
     later in the tour; the opening keeps Côte d'Ivoire, Champagne and the DR Congo */
  "Food in a global system":S=>{DROPPH(S,/^(Iowa|Punjab|Colombia)/);VIEW(S,[15,20,1.1],"left")},
  /* index.html turned the globe to the middle of Mexico and the Philippines, so Mexico sat under the card and the
     rice institute round the back. The two become area labels, the stop opens on Punjab and the Philippines, and
     buttons (part 3) turn the globe to each step of the revolution */
  "The Green Revolution":S=>{AREA(S,/^(Mexico|IRRI)/);VIEW(S,[106,22,1.2],"left")},
  /* Ecuador, the start of the chain, was under the card: the stop now has a banana to follow (part 3) */
  "From farm to supermarket":S=>VIEW(S,[-36,18,1],"left"),
  /* Lake Naivasha, where the roses grow, was on the globe's edge */
  "Roses from the equator":S=>VIEW(S,[36,20,1.4],"left"),
  /* Colombia, where the beans start, was under the card's corner */
  "Fair trade":S=>VIEW(S,[-35,22,1],"left"),
  /* Ethiopia was on the globe's edge */
  "Women who farm":S=>VIEW(S,[30,2,1.6],"left"),
  /* Ireland's label was under the card */
  "Feeding eight billion":S=>VIEW(S,[16,25,1],"left")
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvn fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
/* geoflock-polish-b.js re-patches some stops with Object.defineProperty at load + 1.5 s and 4 s after it runs; a field
   fixed here before then would make those writes throw. So the fixes start once the page has settled (6 s), or as soon
   as one of these tours is opened, whichever comes first. */
let lastKey="",ready=false;
const start=()=>{if(ready)return;ready=true;applyAll()};
if(document.readyState==="complete")setTimeout(start,6000);else addEventListener("load",()=>setTimeout(start,6000));
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}if(!ready)start();const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvj.js and -rvk.js do for theirs): psFlyGlobe (index.html) turns a
   stop's place out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain
   centre whenever it is more than 20° from it. So on these tours aim is told the stop is already aimed, and for four
   seconds after a stop opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there
   once more. A drag or zoom by the reader in that time cancels it, and so does a stop whose own buttons turn the globe. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 if(document.querySelector(".rvn-ctl[data-turned]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* Indonesia and Malaysia: about 83% of world palm oil production in 2023/24 (USDA Foreign Agricultural Service,
     "Oilseeds: World Markets and Trade", 2024: world about 79.5, Indonesia about 46-47 and Malaysia about 19 million
     tonnes); the stop's text says "about 85%" */
  /* a circle in a square covers π/4 of it: the pivot's dry corners are the other 21% */
  "hg5b|Circles in squares":G("A pivot’s circle fits inside a square field. What share of the square gets watered?",0,100,79,"%",{step:1,show:"about 79% (π ÷ 4)"}),
  /* Cranfield University (A. Williams, 2007, for World Flowers): 12,000 Dutch roses gave off about 35,000 kg of CO2,
     12,000 Kenyan roses, flown to Europe, about 6,000 kg: about 5.8 times as much (reported by Scientific American,
     "Floral footprint") */
  "hg5c|Roses from the equator":G("A Dutch greenhouse rose gives off how many times the carbon of a Kenyan rose flown to Europe?",0.2,10,5.8,"×",{step:0.1,show:"about 6 times"}),
  "hg5a|Plantations":G("What share of the world’s palm oil comes from Indonesia and Malaysia?",0,100,83,"%",{step:1,show:"over 80%"})
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvk.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in amGlobe.host), and
   removes everything as soon as the stop changes or the tour ends.
   - hg5a | "Where farming began": the five hearths circle the globe; buttons turn it to each.
   - hg5a | "Subsistence and commercial": subsistence or commercial? Sort eight farms; the globe turns to each.
   - hg5a | "Following the wheat north": drag the date from May to September and follow the harvest north.
   - hg5a | "Extensive farming": Anna Creek, the Pampas and the Great Plains are on three continents; buttons turn the globe.
   - hg5a | "Shifting cultivation": the stop's three rainforests, the Amazon, the Congo and Southeast Asia's uplands.
   - hg5b | "Patterns of rural settlement": clustered, dispersed or linear? Sort eight places; the globe turns to each.
   - hg5b | "Long lots": metes and bounds, township and range, or long lots? Sort eight places; the globe turns to each.
   - hg5b | "Split between sons": pass a 10-hectare farm down five generations and watch each son's share shrink.
   - hg5b | "Three agricultural revolutions": buttons turn the globe to where each began.
   - hg5c | "The Green Revolution": Mexico, the Philippines and Punjab; buttons turn the globe to each.
   - hg5c | "From farm to supermarket": drag a banana 10,000 km from a farm in Ecuador to a shop in Germany; the
            globe follows it. */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;if(!G._flat&&G.size){const z=G.size();if(z&&z.r&&Math.hypot(s[0]-z.w/2,s[1]-z.h/2)>z.r+1)return null}const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvn-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+esc(head)+"</b>":"")+"<span>"+esc(text)+"</span>";e.classList.remove("rvn-new");void e.offsetWidth;e.classList.add("rvn-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
const shuffle=(a,seed)=>{let s=seed>>>0;const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
/* turn the globe to a place, beside the card (the same card-aware flight as psFlyGlobe in index.html) */
function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.3;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}

/* ---------------------------------------------------------------- RANK: tap the items in order (from rvg) */
function rankDef(tour,title,o){return{tour,title,globe:false,tip:o.tip,
 card:()=>'<div class="rvn-pool"></div><div class="rvn-order"></div><div class="rvn-row"><button type="button" class="rvn-btn rvn-undo">↶ Undo</button><button type="button" class="rvn-btn rvn-reset">↺ Start again</button></div>',
 init(L){L.pick=[];L.items=shuffle(o.items.map((x,i)=>i),o.seed||7)},
 wire(L){const c=L.card;c.querySelector(".rvn-undo").onclick=()=>{if(L.pick.length&&L.pick.length<o.items.length)L.pick.pop();this.render(L)};
  c.querySelector(".rvn-reset").onclick=()=>{L.pick=[];this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=o.items.length,done=L.pick.length===n;
  setHTML(c.querySelector(".rvn-pool"),done?"":L.items.filter(i=>!L.pick.includes(i)).map(i=>'<button type="button" class="rvn-chip" data-i="'+i+'">'+esc(o.items[i][0])+"</button>").join(""));
  c.querySelectorAll(".rvn-chip").forEach(b=>b.onclick=()=>{L.pick.push(+b.dataset.i);this.render(L)});
  let right=0;const rows=[];for(let k=0;k<n;k++){const i=L.pick[k];if(i==null){rows.push('<div class="rvn-slot rvn-empty"><em>'+(k+1)+'</em><span>'+(k===L.pick.length?"tap the "+(k===0?o.first:"next"):"")+"</span></div>");continue}
   const ok=done&&i===k;if(ok)right++;rows.push('<div class="rvn-slot'+(done?ok?" rvn-ok":" rvn-no":"")+'"><em>'+(k+1)+"</em><span>"+esc(o.items[i][0])+"</span>"+(done?"<b>"+esc(o.items[i][1])+(ok?"":' <i>(no. '+(i+1)+")</i>")+"</b>":"")+"</div>")}
  setHTML(c.querySelector(".rvn-order"),rows.join(""));c.querySelector(".rvn-undo").disabled=!L.pick.length||done;
  if(!L.pick.length)say(L,o.head,o.intro);else if(!done)say(L,"",o.items.length-L.pick.length+" to go");
  else say(L,right+" of "+n+" in the right place"+(right===n?"!":""),o.after)}}}

/* ---------------------------------------------------------------- TURN: buttons turn the globe from place to place */
function turnDef(tour,title,o){return{tour,title,globe:true,turn:true,tip:o.tip,
 card:()=>'<div class="rvn-row rvn-turn">'+o.places.map((f,i)=>'<button type="button" class="rvn-btn" data-i="'+i+'"></button>').join("")+'</div>',
 init(L){L.at=-1;L.t=0;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvn-ring"});L.tag=document.createElement("div");L.tag.className="rvn-tag rvn-new2";L.el.appendChild(L.tag)},
 tick(L,dt){L.t+=dt;if(L.at>=0)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){const f=L.at>=0?o.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;c.querySelectorAll(".rvn-turn button").forEach(b=>b.onclick=()=>{const f=o.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turned="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvn-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvn-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+o.places[k][0]});
  if(L.at<0)say(L,"",o.intro);else{const f=o.places[L.at];say(L,f[0],f[4])}}}}

/* ---------------------------------------------------------------- BIN: one item at a time; which kind is it?
   As in geoflock-polish-rvk.js, plus: an item may name a place ([lon, lat, zoom] as its fourth entry); once answered,
   the globe turns to it and a ring marks it, so farms half a world apart can each be seen beside the card. */
function binDef(tour,title,o){const placed=o.items.some(it=>it[3]);return{tour,title,globe:placed,turn:placed,tip:o.tip,
 card:()=>'<div class="rvn-q"><span class="rvn-n"></span><b class="rvn-item"></b></div><div class="rvn-row rvn-bins">'+o.keys.map(k=>'<button type="button" class="rvn-btn rvn-bin" data-k="'+k[0]+'">'+esc(k[1])+"</button>").join("")+'</div>'+
  '<div class="rvn-dots">'+o.items.map(()=>"<i></i>").join("")+'</div><div class="rvn-row"><button type="button" class="rvn-btn rvn-next" hidden>Next ▶</button><button type="button" class="rvn-btn rvn-again" hidden>Play again</button></div>',
 init(L){L.k=0;L.res=[];L.ans=null;L.t=0;L.at=null;if(L.svg){L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvn-ring"});L.ring.style.display="none";L.tag=document.createElement("div");L.tag.className="rvn-tag rvn-new2";L.tag.style.display="none";L.el.appendChild(L.tag)}},
 tick(L,dt){L.t+=dt;if(L.ring&&L.at)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){if(!L.ring)return;const f=L.at,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;
  c.querySelectorAll(".rvn-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=o.items.length)return;const it=o.items[L.k];L.ans=b.dataset.k;L.res[L.k]=L.ans===it[1];
   if(it[3]){const p=it[3];L.at=[p[3]||"",p[0],p[1]];c.dataset.turned="1";turnGlobe(p[0],p[1],p[2]);L.dirty=1}this.render(L)});
  c.querySelector(".rvn-next").onclick=()=>{L.k++;L.ans=null;L.at=null;L.dirty=1;this.render(L)};
  c.querySelector(".rvn-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;L.at=null;L.dirty=1;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=o.items.length,end=L.k>=N,it=o.items[Math.min(L.k,N-1)];
  c.querySelector(".rvn-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvn-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvn-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvn-right",!!L.ans&&b.dataset.k===it[1]);b.classList.toggle("rvn-wrong",!!L.ans&&b.dataset.k===L.ans&&L.ans!==it[1])});
  c.querySelectorAll(".rvn-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvn-ok":L.res[i]===false?"rvn-no":i===L.k&&!end?"rvn-at":"");
  const nx=c.querySelector(".rvn-next");nx.hidden=end||!L.ans;nx.textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvn-again").hidden=!end;
  const name=k=>(o.keys.find(x=>x[0]===k)||[,""])[1];
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": all right!":""),o.done)}
  else if(!L.ans)say(L,"",o.ask);
  else if(L.ans===it[1])say(L,"Right: "+name(it[1]),it[2]);
  else say(L,"Not quite: "+name(it[1]),it[2])}}}

/* ======================================================================== hg5a: How the world farms */
/* The five hearths of the stop (and of its own chart). Fertile Crescent: wheat, barley, sheep and goats, about 10,000
   years ago (the stop). Kuk Swamp, New Guinea: drainage ditches and mounds for taro and bananas, 7,000 and perhaps
   10,000 years old (UNESCO, "Kuk Early Agricultural Site", inscribed 2008). Maize was bred from teosinte in Mexico's
   Balsas valley about 9,000 years ago (Piperno et al., PNAS 2009). The potato was first grown in the highlands of
   southern Peru, near Lake Titicaca (Spooner et al., PNAS 2005). */
const HEARTHS5=turnDef("hg5a","Where farming began",{tip:"Farming began in five places, far apart. Visit each one.",
 intro:"Tap a hearth to turn the globe to it.",
 places:[["Fertile Crescent",40,35,2.4,"Wheat, barley, lentils, sheep and goats: the first farmers, about 10,000 years ago, in the hills from the Levant to Iraq."],
  ["China",112,32,2.2,"Two hearths in one country: rice in the wet Yangtze valley, millet on the dry Yellow River plain."],
  ["New Guinea",144.33,-5.78,3,"At Kuk Swamp, in the highlands, farmers dug ditches to drain land for taro and bananas 7,000, perhaps 10,000, years ago. It is a UNESCO World Heritage site."],
  ["Mesoamerica",-100,18.3,2.4,"Maize was bred from a wild grass, teosinte, in Mexico’s Balsas valley about 9,000 years ago. Beans and squash were grown with it."],
  ["Andes",-70,-15.8,2.4,"The potato was first grown in the highlands of southern Peru, near Lake Titicaca. The Andes also gave us quinoa and llamas."]]});
/* Subsistence or commercial: the tour's own farms and places (Ethiopia, Iowa, Kansas, New Guinea, Malaysia,
   Bangladesh, the Amazon, the Netherlands' Westland greenhouses of tour hg5b). Iowa's maize going to ethanol and feed is
   hg5c's "Corn that fuels cars". Answers are mixed so that taking turns cannot win. */
const FARMS=binDef("hg5a","Subsistence and commercial",{tip:"Subsistence or commercial? Sort eight farms; the globe turns to each.",
 keys:[["s","🍲 Subsistence: to eat"],["c","💰 Commercial: to sell"]],ask:"Is this farm growing food mainly to eat at home, or to sell?",
 items:[["A family in the Ethiopian highlands grows teff and keeps two oxen to plough","s","Subsistence: most of the harvest feeds the family. Over half of Ethiopia’s workers farm.",[38.7,9,3,"Ethiopia"]],
  ["A 400-hectare Iowa farm sells its maize to an ethanol plant","c","Commercial: grown to sell, with machines, by one family and a few workers.",[-93.5,42,3.5,"Iowa"]],
  ["Combines cut thousands of hectares of Kansas wheat for export","c","Commercial grain farming: huge farms, few workers, crops sold on world markets.",[-98.5,38.5,3.5,"Kansas"]],
  ["Highland families in Papua New Guinea dig gardens of sweet potato","s","Subsistence: food for the household and the village, with little left to sell.",[144.3,-5.8,3,"Papua New Guinea"]],
  ["An estate in Malaysia grows only oil palms","c","Commercial: a plantation, one cash crop, grown for export.",[101.5,3.5,3.5,"Malaysia"]],
  ["A family in an Amazon village clears a patch of forest to grow cassava","s","Subsistence: shifting cultivation feeds the village, then the patch is left to regrow.",[-63,-5,2.6,"Amazon"]],
  ["A Bangladeshi family’s small rice paddy, most of it eaten at home","s","Subsistence, though intensive: a tiny plot worked by hand, with any small surplus sold at market.",[90.4,23.8,3.5,"Bangladesh"]],
  ["Dutch greenhouses grow tomatoes for supermarkets across Europe","c","Commercial, and very intensive: much money on little land, all of it for sale.",[4.25,52,4,"Westland, Netherlands"]]],
 done:"Subsistence farms are mostly small and in poorer countries; commercial farms are larger, use machines and sell everything. Many farms in between eat some and sell some."});
/* The custom cutters' route, Texas to the Canadian border along the stop's own line. Usual winter wheat harvest dates
   by state, and North Dakota's spring wheat in August: USDA National Agricultural Statistics Service, "Field Crops:
   Usual Planting and Harvesting Dates", Agricultural Handbook 628 (October 2010); rounded here to the part of the
   month. The stop's own months: Texas in May, Kansas in June, North Dakota in August. */
const WHEAT={tour:"hg5a",title:"Following the wheat north",globe:true,
 tip:"Drag the summer along and follow the combines north as the wheat ripens.",
 pts:[["Texas",-99.3,34.15,140],["Oklahoma",-97.88,36.4,156],["Kansas",-100.02,37.75,172],["Nebraska",-98.39,40.59,190],["South Dakota",-100.35,44.37,206],["North Dakota",-101.3,48.23,226],["Canadian border",-101.5,49,240]],
 card:()=>'<div class="rvn-sl"><input type="range" class="rvn-day" min="130" max="245" step="1" value="130" aria-label="Date"><b class="rvn-dv"></b></div><div class="rvn-row"><button type="button" class="rvn-btn rvn-play">▶ Play the summer</button></div>',
 init(L){L.d=130;L.trail=svgEl(L.svg,"path",{class:"rvn-trail"});L.dots=this.pts.map(()=>svgEl(L.svg,"circle",{r:"6",class:"rvn-green"}));
  L.cmb=svgEl(L.svg,"circle",{r:"9",class:"rvn-cmb"});L.tag=document.createElement("div");L.tag.className="rvn-tag rvn-new2";L.el.appendChild(L.tag)},
 date(d){const M=[["January",31],["February",28],["March",31],["April",30],["May",31],["June",30],["July",31],["August",31],["September",30]];let x=Math.round(d);for(const m of M){if(x<=m[1])return x+" "+m[0];x-=m[1]}return""},
 where(d){const P=this.pts;if(d<=P[0][3])return{ll:[P[0][1],P[0][2]],i:-1};for(let i=1;i<P.length;i++)if(d<=P[i][3]){const k=(d-P[i-1][3])/(P[i][3]-P[i-1][3]);return{ll:[P[i-1][1]+(P[i][1]-P[i-1][1])*k,P[i-1][2]+(P[i][2]-P[i-1][2])*k],i:i-1}}return{ll:[P[P.length-1][1],P[P.length-1][2]],i:P.length-1}},
 wire(L){const c=L.card,r=c.querySelector(".rvn-day");r.oninput=()=>{L.play=0;L.d=+r.value;L.dirty=1;this.text(L)};
  c.querySelector(".rvn-play").onclick=()=>{if(L.d>=245)L.d=130;L.play=1};this.text(L)},
 tick(L,dt){if(!L.play)return;L.d=Math.min(245,L.d+dt*9);if(L.d>=245)L.play=0;L.dirty=1;try{L.card.querySelector(".rvn-day").value=Math.round(L.d)}catch(e){}this.text(L)},
 text(L){const c=L.card;if(!c)return;const d=L.d;c.querySelector(".rvn-dv").textContent=this.date(d);c.querySelector(".rvn-play").textContent=L.play?"▶ Playing…":"▶ Play the summer";
  if(d<140)say(L,"Early May: still green","The wheat was sown last autumn and is still green. The crews wait in Texas with their combines.");
  else if(d<156)say(L,"Late May: Texas","The harvest starts in Texas, where spring comes first. The crews cut farm after farm, then load up and drive north.");
  else if(d<172)say(L,"June: Oklahoma","A few hundred kilometres north, the wheat has just turned gold.");
  else if(d<190)say(L,"Late June: Kansas","The heart of the winter wheat belt: Kansas is the biggest winter wheat state.");
  else if(d<206)say(L,"July: Nebraska","Further north, summer arrives later, so the wheat ripens later too.");
  else if(d<226)say(L,"Late July: South Dakota","The crews have driven over 1,000 km since May.");
  else if(d<240)say(L,"August: North Dakota","Here farmers sow spring wheat, because winters are too harsh for winter wheat. It is cut in August.");
  else say(L,"The end of the run","At the Canadian border the season ends. Many crews head home to Texas, and one combine has worked dozens of farms: economies of scale on wheels.")},
 draw(L){const d=L.d,P=this.pts,w=this.where(d);
  P.forEach((p,i)=>{const q=proj(L,[p[1],p[2]]),c=L.dots[i];if(q&&i<P.length-1){c.style.display="";c.setAttribute("cx",q[0].toFixed(1));c.setAttribute("cy",q[1].toFixed(1));c.setAttribute("class",d>=p[3]?"rvn-gold":"rvn-green")}else c.style.display="none"});
  const pts=[];if(d>=P[0][3]){for(let i=0;i<=w.i&&i<P.length;i++)pts.push([P[i][1],P[i][2]]);pts.push(w.ll)}
  const xy=pts.map(ll=>proj(L,ll)).filter(Boolean);L.trail.setAttribute("d",xy.length>1?"M"+xy.map(q=>q[0].toFixed(1)+" "+q[1].toFixed(1)).join("L"):"");
  const q=proj(L,w.ll),qq=proj(L,w.ll,1);if(q){L.cmb.style.display="";L.cmb.setAttribute("cx",q[0].toFixed(1));L.cmb.setAttribute("cy",q[1].toFixed(1))}else L.cmb.style.display="none";
  if(qq){L.tag.style.display="";const h="🚜 "+this.date(d);if(L.tag._h!==h){L.tag.textContent=h;L.tag._h=h}L.tag.style.left=(qq[0]-70)+"px";L.tag.style.top=(qq[1]-12)+"px"}else L.tag.style.display="none"}};
/* Extensive farming's three examples, which no single view shows beside the card. Anna Creek: about 23,700 km² (the
   stop). The Pampas and the US Great Plains as the stop names them. */
const RANCH=turnDef("hg5a","Extensive farming",{tip:"Three ranching lands on three continents. Visit each one.",
 intro:"Tap a place to turn the globe to it. Then drag purple Belgium onto Anna Creek.",
 places:[["Anna Creek, Australia",136.34,-28.9,2.6,"The world’s largest cattle station, about 23,700 km² of dry outback in South Australia: over three-quarters the size of Belgium."],
  ["The Pampas, Argentina",-61,-35,2.6,"Flat grassland around Buenos Aires, where gauchos herded cattle on open range. Much of it now grows soybeans too."],
  ["Great Plains, USA",-104,41,2.6,"West of the Corn Belt the plains are too dry for most crops without irrigation, so cattle graze huge ranches."]]});

/* the three forests the stop names; the crops are the common swidden staples of each (FAO, "Shifting cultivation",
   and the stop) */
const SWIDDEN=turnDef("hg5a","Shifting cultivation",{tip:"The stop’s three rainforests are on three continents. Visit each one.",
 intro:"Tap a forest to turn the globe to it.",
 places:[["Amazon",-62,-6,2.3,"Indigenous villages clear small fields in the forest for cassava and plantains, farm them for a few years, then let the trees return."],
  ["Congo basin",22,0,2.3,"Many farmers still clear and burn small fields for cassava, maize and plantains. As villages grow, fields are reused before the forest can recover."],
  ["Southeast Asian uplands",101,22,2.6,"In the hills of Laos, northern Thailand and Myanmar, families grow upland rice in fields cleared from the forest, then move on."]]});

/* ======================================================================== hg5b: Models of rural land */
/* Clustered, dispersed or linear, as the stop defines them, with its own three examples (German villages, Iowa farms,
   Quebec's St Lawrence) and five more common ones: Vietnam's Red River delta villages, Dutch "lintdorpen" (ribbon
   villages along a dyke or canal road), Australian sheep stations, the English village round its green, and the long
   lots along the Mississippi in Louisiana that the "Long lots" stop names. */
const SETTLE=binDef("hg5b","Patterns of rural settlement",{tip:"Clustered, dispersed or linear? Sort eight places; the globe turns to each.",
 keys:[["c","🏘 Clustered"],["d","🏠 · 🏠 Dispersed"],["l","🏠🏠🏠 Linear"]],ask:"How are the farm homes laid out here?",
 items:[["A German village: houses round the church, fields all around","c","Clustered (nucleated): families live together and walk out to their fields.",[10,51,3.5,"Germany"]],
  ["An Iowa farmhouse alone in the middle of its own land","d","Dispersed: each family lives on its own farm, often a kilometre or more from the next.",[-93.5,42,3.5,"Iowa"]],
  ["Farmhouses in a row along the St Lawrence","l","Linear: each long lot has its house on the river bank.",[-71.5,46.9,3.5,"Quebec"]],
  ["A village in Vietnam’s Red River delta, packed inside a bamboo hedge","c","Clustered: houses close together, rice paddies all around, as across much of Asia.",[105.9,20.6,3.5,"Red River delta"]],
  ["A Dutch village stretched along a dyke road for kilometres","l","Linear: a “lintdorp”, a ribbon village, one house deep on each side of the road.",[4.9,52.6,4,"North Holland"]],
  ["An Australian sheep station, its nearest neighbour an hour’s drive away","d","Dispersed, at its most extreme: one homestead in the middle of a huge run.",[143,-31,3,"New South Wales"]],
  ["An English village round its green, with the farmland beyond","c","Clustered: the green was shared ground, and the houses face it.",[-1.5,52.3,3.5,"England"]],
  ["Old farmhouses one after another along the Mississippi between Baton Rouge and New Orleans","l","Linear: the French long lots gave every farm a river front.",[-90.6,30,3.5,"Louisiana"]]],
 done:"Clustered villages share land, water and defence; dispersed farms put each family on its own land; linear settlements follow a road, river or dyke."});
/* Survey systems of the three stops before (metes and bounds, township and range, long lots). Kentucky, once part
   of Virginia, kept metes and bounds; Ohio's Seven Ranges were the first federal survey (1785); Detroit's French
   "ribbon farms" ran back from the Detroit River (Detroit Historical Society, "Ribbon farms"). */
const SURVEY=binDef("hg5b","Long lots",{tip:"Which survey? Sort eight places; the globe turns to each.",
 keys:[["m","🌳 Metes and bounds"],["t","▦ Township and range"],["l","▥ Long lots"]],ask:"Which way was this land divided?",
 items:[["Old Virginia farms bounded by creeks, ridges and big trees","m","Metes and bounds: natural features and distances, so the plots are irregular.",[-78.5,37.5,4,"Virginia"]],
  ["Square fields and a straight road every mile, as far as you can see","t","Township and range: the 1785 grid of square-mile sections.",[-93.5,42,4,"Iowa"]],
  ["Thin farms running back from the St Lawrence","l","Long lots: every farm gets a share of the river front.",[-71.5,46.9,4,"Quebec"]],
  ["Kentucky, settled before the federal survey, with crooked boundaries","m","Metes and bounds: Kentucky was part of Virginia and kept its system.",[-85,37.5,4,"Kentucky"]],
  ["Strips running back from the Mississippi in Louisiana","l","Long lots, brought by French settlers, as in Quebec.",[-90.6,30,4,"Louisiana"]],
  ["Eastern Ohio, 1785: the very first township grid","t","Township and range: the Seven Ranges, where the federal survey began.",[-80.8,40.6,4,"Seven Ranges, Ohio"]],
  ["Kansas wheat country, with section roads a mile apart","t","Township and range: from the air, a chequerboard.",[-98.5,38.5,4,"Kansas"]],
  ["Old French “ribbon farms” along the Detroit River","l","Long lots: Detroit’s old streets still follow the ribbon farms’ edges.",[-83.05,42.33,4,"Detroit"]]],
 done:"Who surveyed the land first still shows: crooked lines in the East, a grid in the Midwest and West, and long thin strips wherever the French settled."});
/* Partible inheritance: plain arithmetic. India's average farm: 1.08 ha (Agriculture Census 2015–16, Ministry of
   Agriculture and Farmers Welfare); a football pitch of 105 × 68 m (FIFA's recommended size) is about 0.71 ha. */
const SPLIT={tour:"hg5b",title:"Split between sons",globe:false,tip:"Pass the farm down: pick how many sons share it, then split it.",
 card:()=>'<svg class="rvn-field" viewBox="0 0 240 120" role="img" aria-label="The family farm"></svg><div class="rvn-row rvn-heirs"><span>Sons each time:</span>'+[2,3,4].map(n=>'<button type="button" class="rvn-btn" data-n="'+n+'">'+n+"</button>").join("")+'</div><div class="rvn-row"><button type="button" class="rvn-btn rvn-gen">Next generation ▶</button><button type="button" class="rvn-btn rvn-reset">↺ Start again</button></div>',
 init(L){L.n=3;L.gen=0},
 wire(L){const c=L.card;c.querySelectorAll(".rvn-heirs button").forEach(b=>b.onclick=()=>{if(L.gen)return;L.n=+b.dataset.n;this.render(L)});
  c.querySelector(".rvn-gen").onclick=()=>{if(L.gen<5)L.gen++;this.render(L)};c.querySelector(".rvn-reset").onclick=()=>{L.gen=0;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const ha=10/Math.pow(L.n,L.gen);let x=0,y=0,w=240,h=120,out="";
  for(let g=0;g<L.gen;g++){const vert=g%2===0,k=Math.floor(L.n/2);for(let i=0;i<L.n;i++){if(i===k)continue;const r=vert?[x+w*i/L.n,y,w/L.n,h]:[x,y+h*i/L.n,w,h/L.n];out+='<rect class="rvn-cous" x="'+r[0].toFixed(1)+'" y="'+r[1].toFixed(1)+'" width="'+r[2].toFixed(1)+'" height="'+r[3].toFixed(1)+'"/>'}
   if(vert){x+=w*k/L.n;w/=L.n}else{y+=h*k/L.n;h/=L.n}}
  out='<rect class="rvn-cous" x="0" y="0" width="240" height="120"/>'+out+'<rect class="rvn-mine" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'"/>';
  setHTML(c.querySelector(".rvn-field"),out);
  c.querySelectorAll(".rvn-heirs button").forEach(b=>{b.classList.toggle("rvn-cur",+b.dataset.n===L.n);b.disabled=L.gen>0&&+b.dataset.n!==L.n});
  c.querySelector(".rvn-gen").disabled=L.gen>=5;
  const f=v=>v>=1?v.toFixed(1).replace(/\.0$/,""):v>=.1?v.toFixed(2):v.toFixed(3);
  if(!L.gen)say(L,"10 hectares","Great-great-grandfather’s farm, about 14 football pitches. Each generation it is shared equally between his sons.");
  else{const who=["","Your great-grandfather","Your grandfather","Your father","You","Your son"][L.gen]+" inherits "+f(ha)+" ha";
   say(L,who,ha>=1.08?"About "+Math.round(ha/.714)+" football pitches. Still bigger than the average Indian farm today, 1.08 hectares.":ha>=.3?"Smaller than the average Indian farm today (1.08 ha). A tractor no longer pays, and one son may leave for a city job.":"Less than half a football pitch: too small to feed a family. This is why so many Indian farmers also work in cities, and why France merged its strips.")}}};

/* where each revolution began, as the stop and the next stop tell it: Norman Borlaug's wheat breeding in Mexico from
   1944, in the Yaqui valley of Sonora and near Mexico City (Nobel Prize biography, 1970) */
const REVS=turnDef("hg5b","Three agricultural revolutions",{tip:"Three revolutions, three continents. Visit where each began.",
 intro:"Tap a revolution to turn the globe to where it began.",
 places:[["First: Fertile Crescent",42,34,2.2,"About 10,000 years ago people began sowing wheat and barley and herding sheep and goats instead of hunting and gathering."],
  ["Second: Britain",-1.5,52.5,3,"From the 1700s: enclosed fields, the Norfolk four-course rotation and new machines. Fewer farm hands were needed, so people moved to factory towns."],
  ["Third: Mexico",-99.1,19.4,2.4,"From the 1940s Norman Borlaug bred high-yield wheat in Sonora and near Mexico City; with new rice, the Green Revolution spread to India and Pakistan in the 1960s."]]});

/* ======================================================================== hg5c: Food in a global system */
/* Borlaug: in Mexico from 1944; by 1963 Mexico's wheat harvest was six times that of 1944 (Nobel Prize biography;
   Wikipedia, "Norman Borlaug"). IR8, the "miracle rice", released by the International Rice Research Institute at
   Los Baños in 1966 (IRRI; Wikipedia, "IR8"). India imported the Mexican wheat seed in 1965–66, and its wheat harvest
   more than doubled, from about 12 million tonnes in 1965 to about 26 million in 1972 (FAOSTAT, wheat production, India). */
const GREEN=turnDef("hg5c","The Green Revolution",{tip:"The seeds came from Mexico and the Philippines. Follow them to Punjab.",
 intro:"Tap a place to turn the globe to it.",
 places:[["Mexico, from 1944",-99.1,19.4,2.6,"Norman Borlaug bred short, sturdy wheat that resisted rust disease and could carry heavy heads of grain. By 1963 Mexico’s wheat harvest was six times that of 1944."],
  ["IRRI, the Philippines, 1966",121.24,14.17,3,"At the International Rice Research Institute, south of Manila, scientists released IR8, the “miracle rice”: short stems and far bigger yields with fertiliser."],
  ["Punjab, from 1966",75.5,30.8,3,"India brought in Mexican wheat seed in 1965–66. With canals, wells and fertiliser, Punjab’s farmers took it up fastest, and India’s wheat harvest more than doubled by 1972."]]});
/* One banana's commodity chain, along the stop's own route. Machala, in El Oro province, calls itself the world's
   banana capital (Wikipedia, "Machala"); bananas are shipped green, chilled to about 13 °C so they do not ripen
   (Wikipedia, "Banana", Trade), through the Panama Canal, to Antwerp, one of Europe's main banana ports (Port of
   Antwerp-Bruges), then ripened with ethylene gas in ripening rooms before they go to the shops. About 10,000 km in
   all, the stop's own figure. */
const BANANA={tour:"hg5c",title:"From farm to supermarket",globe:true,turn:true,
 tip:"Drag the banana from the farm in Ecuador to a shop in Germany.",
 route:[[-79.96,-3.26],[-80.6,-2.6],[-80.3,2],[-79.6,8.6],[-79.75,9.3],[-77,13],[-73.5,17],[-68,19],[-50,30],[-25,42],[-7,48.6],[1.4,51],[4.4,51.25],[8.68,50.11]],
 card:()=>'<div class="rvn-sl"><input type="range" class="rvn-km" min="0" max="1000" step="1" value="0" aria-label="How far the banana has gone"><b class="rvn-kv">🍌</b></div><div class="rvn-row"><button type="button" class="rvn-btn rvn-play">▶ Ship it</button></div>',
 init(L){const R=this.route;L.cum=[0];for(let i=1;i<R.length;i++)L.cum.push(L.cum[i-1]+d3.geoDistance(R[i-1],R[i])*6371);L.tot=L.cum[L.cum.length-1];L.f=0;
  L.line=svgEl(L.svg,"path",{class:"rvn-route"});L.done=svgEl(L.svg,"path",{class:"rvn-trail"});L.dot=svgEl(L.svg,"circle",{r:"9",class:"rvn-cmb"});
  L.tag=document.createElement("div");L.tag.className="rvn-tag rvn-new2";L.el.appendChild(L.tag)},
 at(L,f){const km=f*L.tot,R=this.route;let i=1;while(i<R.length-1&&L.cum[i]<km)i++;const k=Math.max(0,Math.min(1,(km-L.cum[i-1])/Math.max(1e-6,L.cum[i]-L.cum[i-1])));return{ll:d3.geoInterpolate(R[i-1],R[i])(k),i}},
 follow(L){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;const p=this.at(L,L.f).ll,z=2;let lon=p[0];const over=typeof psCardOver==="function"?psCardOver():0;
  if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(p[1]*Math.PI/180))}
  const c=[-G.rot[0],-G.rot[1]],t=d3.geoInterpolate(c,[lon,p[1]])(L.play?.08:.35);G._flyId=(G._flyId||0)+1;G._flying=false;G.zoom=G.zoom+(z-G.zoom)*.3;G.rot=[-t[0],-t[1]];G.render()}catch(e){}},
 wire(L){const c=L.card,r=c.querySelector(".rvn-km");const go=()=>{c.dataset.turned="1"};
  r.oninput=()=>{go();L.play=0;L.f=+r.value/1000;L.dirty=1;this.text(L);this.follow(L);clearTimeout(L.tmo);L.tmo=setTimeout(()=>{if(!L.play&&L.card&&L.card.isConnected){const p=this.at(L,L.f).ll;turnGlobe(p[0],p[1],2)}},260)};
  c.querySelector(".rvn-play").onclick=()=>{go();if(L.f>=1)L.f=0;L.play=1};this.text(L)},
 tick(L,dt){if(!L.play)return;L.f=Math.min(1,L.f+dt/14);if(L.f>=1)L.play=0;L.dirty=1;try{L.card.querySelector(".rvn-km").value=Math.round(L.f*1000)}catch(e){}this.text(L);this.follow(L)},
 text(L){const c=L.card;if(!c)return;const km=Math.round(L.f*L.tot/100)*100,i=this.at(L,L.f).i;
  c.querySelector(".rvn-kv").textContent="🍌 "+km.toLocaleString("en-GB")+" km";c.querySelector(".rvn-play").textContent=L.play?"▶ Sailing…":"▶ Ship it";
  if(L.f<.02)say(L,"A farm near Machala, Ecuador","Bananas are cut while still green, washed and packed in boxes. Ecuador sells more bananas abroad than any other country.");
  else if(i<=3)say(L,"Down the Pacific coast","A refrigerated ship keeps the fruit at about 13 °C, cold enough to stop it ripening on the way.");
  else if(i<=5)say(L,"The Panama Canal","A short cut from the Pacific to the Caribbean, instead of sailing round South America.");
  else if(i<=10)say(L,"Across the Atlantic","About two weeks at sea. The shipping line, not the farmer, earns this part of the price.");
  else if(i<=12)say(L,"Antwerp","One of Europe’s main banana ports. Trucks take the boxes to ripening rooms, where ethylene gas turns them yellow in a few days.");
  else if(L.f<1)say(L,"To the shops","The importer, the ripener and the supermarket each take a share of the price.");
  else say(L,"A supermarket in Frankfurt","About 10,000 km and three weeks from the farm. That is a commodity chain: grower, packer, shipper, ripener, retailer, and each one takes a cut.")},
 draw(L){const R=this.route,P=ll=>proj(L,ll),path=pts=>{let d="",pen=0;pts.forEach(ll=>{const q=P(ll);if(q){d+=(pen?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=1}else pen=0});return d};
  const dense=[];for(let i=1;i<R.length;i++){const ip=d3.geoInterpolate(R[i-1],R[i]);for(let k=0;k<8;k++)dense.push(ip(k/8))}dense.push(R[R.length-1]);
  L.line.setAttribute("d",path(dense));const w=this.at(L,L.f),done=[];for(let i=0;i<w.i;i++){const ip=d3.geoInterpolate(R[i],R[i+1]);for(let k=0;k<8;k++)done.push(ip(k/8))}done.push(w.ll);L.done.setAttribute("d",path(done));
  const q=P(w.ll),qq=proj(L,w.ll,1);if(q){L.dot.style.display="";L.dot.setAttribute("cx",q[0].toFixed(1));L.dot.setAttribute("cy",q[1].toFixed(1))}else L.dot.style.display="none";
  if(qq){L.tag.style.display="";if(L.tag._h!=="🍌"){L.tag.textContent="🍌";L.tag._h="🍌"}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+12)+"px"}else L.tag.style.display="none"}};

/* ---------------------------------------------------------------- the engine: one stop at a time */
const DEFS=[HEARTHS5,FARMS,WHEAT,RANCH,SWIDDEN,SETTLE,SURVEY,SPLIT,REVS,GREEN,BANANA];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tour===ps.tour&&d.title===t);if(!D)return null;if((D.globe||D.turn)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvn-layer";el.innerHTML='<svg class="rvn-sv"><defs><clipPath id="rvnClip"><path class="rvn-clipp" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvnClip)"></g></svg>';host.appendChild(el);
  L.el=el;L.root=el.querySelector("svg");L.svg=el.querySelector("g");L.clipP=el.querySelector(".rvn-clipp")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}lastT=0;if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvn-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvn-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvn-ctl";
 c.innerHTML='<div class="rvn-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvn-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.rot||[]).join(",")+G.zoom+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.root.setAttribute("width",hr.width);L.root.setAttribute("height",hr.height);
   /* clipped to the globe's visible disc (zoomed in, the sphere is larger than the round window it is seen through),
      with a hole where the card is */
   let outer="M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";try{const sz=G.size&&G.size();if(sz&&sz.r&&!G._flat){const cx=L.ox+sz.w/2,cy=L.oy+sz.h/2,r=sz.r+2;outer="M"+(cx-r).toFixed(1)+" "+cy.toFixed(1)+"a"+r.toFixed(1)+" "+r.toFixed(1)+" 0 1 0 "+(2*r).toFixed(1)+" 0a"+r.toFixed(1)+" "+r.toFixed(1)+" 0 1 0 "+(-2*r).toFixed(1)+" 0Z"}}catch(e){}
   L.clipP.setAttribute("d",outer+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvn-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvn-field{display:block;width:100%;height:auto;border-radius:8px;margin:2px 0 4px}.rvn-cous{fill:#cfe3b0;stroke:#6f8f4a;stroke-width:1}.rvn-mine{fill:#d9682b;stroke:#7a3410;stroke-width:1.5}
.rvn-heirs span{font-size:12.5px;font-weight:700;opacity:.75}
.rvn-route{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:6 5;opacity:.7}
.rvn-trail{fill:none;stroke:#d9a21a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.rvn-green{fill:#4c9a3a;stroke:#fff;stroke-width:2}.rvn-gold{fill:#f2c230;stroke:#7a4a12;stroke-width:2}
.rvn-cmb{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvn-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvn-sv{position:absolute;left:0;top:0;overflow:visible}
.rvn-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none;background:rgba(255,255,255,.95);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvn-tag.rvn-new2{background:#13294b;color:#fff}
.rvn-ring{fill:rgba(255,209,102,.35);stroke:#d9682b;stroke-width:3}
.rvn-dot{fill:#ffd166;stroke:#13294b;stroke-width:2.5}.rvn-stop{fill:#c2364f;stroke:#fff;stroke-width:2.5}
.rvn-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvn-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvn-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvn-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvn-btn[hidden]{display:none}.rvn-btn:disabled{cursor:default;opacity:.55}
.rvn-btn.rvn-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvn-btn.rvn-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvn-btn.rvn-cur{background:#13294b;color:#fff;border-color:#13294b}
.rvn-pool{display:flex;flex-wrap:wrap;gap:6px}.rvn-pool:empty{display:none}
.rvn-chip{border:1px solid #d9682b;background:#fff4ec;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvn-chip:hover{background:#d9682b;color:#fff}
.rvn-order{display:flex;flex-direction:column;gap:3px;margin-top:8px}
.rvn-slot{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 8px;border-radius:8px;background:rgba(19,41,75,.06);min-height:24px}
.rvn-slot em{font-style:normal;font-weight:800;width:16px;opacity:.6}.rvn-slot span{flex:1 1 auto;font-weight:700}.rvn-slot b{font-weight:700;font-size:12.5px;white-space:nowrap}.rvn-slot b i{font-style:normal;opacity:.8}
.rvn-slot.rvn-empty span{font-weight:500;opacity:.6;font-style:italic}
.rvn-slot.rvn-ok{background:rgba(31,138,76,.16)}.rvn-slot.rvn-no{background:rgba(194,54,79,.13)}
.rvn-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 4px;min-height:1.4em}.rvn-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvn-item{font-size:15.5px;color:#13294b;line-height:1.3}
.rvn-dots{display:flex;gap:4px;margin-top:8px}.rvn-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvn-dots i.rvn-ok{background:#1f8a4c}.rvn-dots i.rvn-no{background:#c2364f}.rvn-dots i.rvn-at{box-shadow:0 0 0 2px #ffd166}
.rvn-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvn-ep b{display:block;font-size:15px}
.rvn-ep.rvn-new{animation:rvnIn .45s ease}@keyframes rvnIn{from{opacity:.2;transform:translateY(4px)}}
.rvn-sl{display:flex;align-items:center;gap:10px;margin-top:4px}.rvn-sl input{flex:1 1 auto;accent-color:#d9682b}.rvn-sl b{min-width:64px;text-align:right;font-size:17px;color:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvn-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvn-do,:is(body.dark-theme,body.sky-night) .rvn-sl b{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvn-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvn-n{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvn-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvn-btn.rvn-cur{background:#ffb27a;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvn-chip{background:rgba(217,104,43,.18);color:#ffd2b3;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvn-slot{background:rgba(255,255,255,.07)}
:is(body.dark-theme,body.sky-night) .rvn-slot.rvn-ok{background:rgba(31,138,76,.35)}:is(body.dark-theme,body.sky-night) .rvn-slot.rvn-no{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvn-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}

/* ======================================================================== part 4: the People map's banner
   As geoflock-polish-rvj.js does for its tours: on People map stops a long banner ("Born in another country · 10 to
   20%, 20% or more") ran under the map key in the top right corner. On these tours it slides left until it clears
   the key (never onto the card), and is put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;const k=document.querySelector(".ps-mapkey.at-right");if(b.style.translate&&bannerMoved!==b)return;b.style.translate="";bannerMoved=null;if(!k||!k.offsetWidth)return;
 const B=b.getBoundingClientRect(),K=k.getBoundingClientRect();if(!(B.right>K.left-8&&B.bottom>K.top&&B.top<K.bottom))return;
 let dx=K.left-8-B.right;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

window.gfPolishRvn={v:1,FIX,stop(){IV.forEach(clearInterval);unmount()}};
})();
