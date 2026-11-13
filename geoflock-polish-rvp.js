/* GeoFlock polish RV-P: a stop-by-stop review of the four AP Human Geography Unit 7 tours, Measuring development
   (hg7a), Industry and the global economy (hg7b), Trade and the world economy (hg7c) and Sustainable development (hg7d),
   each looked at on the globe, their default mode, at 1280×860. Built on geoflock-polish-rvn.js (the same helpers and
   engine, under "rvp" names so the two never touch each other's controls).
   1. Fixes, keyed by tour and stop title, applied once the page has settled and again whenever one of these tours is on
      (to the stops psSteps() builds as well). Each fix says why; changed facts cite their source. Every stop of these
      tours keeps its card on the left (some opened it on the right, over the place the stop is about).
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3).
   geoflock-sweep-tours*.js re-set framing on every psGo, so a fixed field becomes a non-configurable getter whose setter
   is ignored; a field already non-configurable (fixed by another file) is left alone. CSS classes start with "rvp-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvp)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};
const TEST=()=>!!(window.__rvpTest||/[?&]rvptest\b/.test(location.search));

/* ======================================================================== part 1: data fixes */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* a field that keeps taking new values from other scripts, but always reads back filtered */
const FILT=(S,k,fn)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvp){d.get._rvp.push(fn);return}if(d&&d.configurable===false)return;let v=S[k];const fns=[fn];
 const get=()=>fns.reduce((x,f)=>{try{return f(x)}catch(e){return x}},v);get._rvp=fns;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get,set:x=>{v=x}})}catch(e){}};
/* swap one phrase in a text field, now and whenever another script sets the field again */
const RE=(S,k,a,b)=>FILT(S,k,t=>typeof t==="string"&&t.indexOf(a)>=0?t.split(a).join(b):t);
const pinText=p=>Array.isArray(p)?String(p[1]||""):String(p&&(p.text||p.label)||"");
/* drop the text pins / photo pins whose label matches (also from pins other scripts add later) */
const DROP=(S,re)=>FILT(S,"pins",P=>Array.isArray(P)?P.filter(p=>!re.test(strip(pinText(p)))):P);
const DROPPH=(S,re)=>FILT(S,"phPins",P=>Array.isArray(P)?P.filter(q=>!re.test(strip(q&&q.label))):P);
/* rename a text pin */
const RELABEL=(S,re,to)=>FILT(S,"pins",P=>Array.isArray(P)?P.map(p=>Array.isArray(p)&&re.test(strip(pinText(p)))?[p[0],to].concat(p.slice(2)):p):P);
/* a point pin becomes an "area" label: still shown, but index.html no longer turns the globe to the middle of it and
   the stop's other pins (gfSubjectPts skips area pins) */
const AREA=(S,re)=>FILT(S,"pins",P=>Array.isArray(P)?P.map(p=>Array.isArray(p)&&re.test(strip(pinText(p)))&&p[2]!=="area"&&typeof(p[0]&&p[0][0])==="number"?[[p[0]],p[1],"area"]:p):P);
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine turns it out from under the card */
const VIEW=(S,gl)=>LOCK(S,"globe",gl);

const FIX={
 hg7a:{
  /* Ireland was labelled twice, by the map and by a pin with its plain name */
  "GDP, GNI and per person":S=>DROP(S,/^Ireland$/),
  /* the photos of Lagos, the Niger Delta's gas flare and Niger lay on top of each other, Lagos's point under the card's
     edge, and Dhaka's garment factory hung over the zoom buttons. The Niger Delta's oil and Dhaka's garment workers
     have their own stops (Dependency, Women at work); their photos go, and the globe turns so Lagos clears the card */
  "Measuring development":S=>{DROPPH(S,/^(Niger Delta|Dhaka)/);VIEW(S,[43,16,1])},
  /* India's GDP per person in 2024: about $2,592 at market exchange rates and $10,719 at purchasing power parity,
     4.1 times as much (World Bank, World Development Indicators, NY.GDP.PCAP.CD and NY.GDP.PCAP.PP.CD; 2022: 3.9
     times). The stop said "three to four times" */
  "Per person and PPP":S=>{RE(S,"stat","three to four times as much","about four times as much");
   RE(S,"more","India’s income per person is roughly three to four times higher at PPP than at market exchange rates.","In 2024 India’s income per person was about $2,600 at market exchange rates but about $10,700 at PPP, roughly four times as much (World Bank).")},
  /* Iceland, the HDI's leader, was under the card */
  "The Human Development Index":S=>VIEW(S,[0,57,1.4]),
  /* the card stood on the right, over Dhaka's garment workers, and Rwanda sat on the globe's far edge */
  "Women at work":S=>VIEW(S,[66,8,1.15]),
  /* the globe faced Africa and South Korea, the stop's example, was round the back */
  "Rostow’s stages of growth":S=>VIEW(S,[112,30,1.3]),
  /* the card stood on the right; index.html turned the globe to the middle of the USA, Brazil and the Central African
     Republic, so the USA was round the back and Brazil on the edge. The USA's label goes (no view shows it beside the
     card with Africa); the sorting game (part 3) turns the globe to each country, the USA among them */
  "World-systems theory":S=>{DROP(S,/^Core: USA/);VIEW(S,[-8,8,1])},
  /* Zambia's copper label sat low, by the globe's edge */
  "Dependency and commodity dependence":S=>VIEW(S,[16,-4,1.6])
 },
 hg7b:{
  /* Detroit's photo sat under the card's edge, Silicon Valley's round the back of the globe and Bengaluru's under the
     map key; all three have their own stops (Deindustrialisation, Agglomeration, The knowledge economy), so their
     photos go */
  "Industry and the global economy":S=>{DROPPH(S,/^(Detroit|Silicon Valley|Bengaluru)/);VIEW(S,[40,35,1])},
  /* index.html turned the globe to the middle of Liège, Pittsburgh and Yawata, so Liège and the Ruhr were under the
     card, Pittsburgh behind it and Yawata on the far edge. Pittsburgh and Yawata become area labels; the stop opens
     on Europe and buttons (part 3) turn the globe to each step of the spread */
  "Industry spreads":S=>{AREA(S,/^(Pittsburgh|Yawata)/);VIEW(S,[30,50,1.5])},
  /* the Reyðarfjörður smelter's label ran under the map key */
  "Ore from the other side of the world":S=>VIEW(S,[-11,64.9,4.5]),
  /* Youngstown had 170,002 people in 1930, 115,427 in 1980 and 60,068 in 2020 (US Census Bureau, decennial censuses,
     in Wikipedia, "Youngstown, Ohio"): about half lost since 1977, not two-thirds; two-thirds is since 1930 */
  "Deindustrialisation":S=>RE(S,"body","the city has since lost about two-thirds of its people.","the city has lost about half its people since then, and almost two-thirds since 1930."),
  /* Highland Park's label lay over the map toggles and Toyota City on the globe's far edge. The stop opens on Ford's
     Detroit; Toyota City becomes an area label and the sorting game (part 3) turns the globe between the two */
  "From Fordism to post-Fordism":S=>{AREA(S,/^Toyota City/);VIEW(S,[-83.1,42.4,2.6])}
 },
 hg7c:{
  /* the photos ran from Tijuana and Port Hedland, round the back of the globe, to Shanghai and Shenzhen on its far
     edge and Dhaka's by the zoom buttons; each has its own stop later in the tour. The opening keeps Geneva and Vienna,
     the homes of the WTO and OPEC */
  "Trade and the world economy":S=>{DROPPH(S,/^(Shanghai|Port Hedland|Shenzhen|Tijuana|Dhaka)/);VIEW(S,[48,28,1])},
  /* Port Hedland, where the ore sets out, lay below the bottom of the screen */
  "Complementarity":S=>VIEW(S,[138,-2,1.2]),
  /* Washington's label lay over the map toggles and its point under the card, 77° from Ghana: the stop opens on
     Ghana and buttons (part 3) turn the globe between the lenders and the borrower */
  "Neoliberal policies":S=>{AREA(S,/^Washington/);VIEW(S,[12,18,1.2])},
  /* Baltimore, where the vans' seats came out, was under the card: the globe now faces it, with Europe on the far side
     of the dashed line */
  "The chicken tax":S=>VIEW(S,[-36,40,1]),
  /* The United Arab Emirates, an OPEC member from 1967 (as Abu Dhabi), left OPEC and OPEC+ on 1 May 2026 (Wikipedia,
     "OPEC", citing NBC News and DW, 28 April 2026; OPEC now has 11 members), so it is no longer highlighted. Saudi
     Arabia is OPEC's largest producer, not the world's (the United States produces more crude oil); its label ran
     under the map key */
  "OPEC and oil":S=>{FILT(S,"hi",H=>Array.isArray(H)?H.filter(c=>c!=="ae"):H);RELABEL(S,/^Saudi Arabia/,"Saudi Arabia: OPEC’s largest producer");
   RE(S,"more","for others such as Russia, Norway and Canada.","for others such as Russia, Norway and Canada. The United Arab Emirates, a member since 1967, left OPEC in May 2026.");VIEW(S,[58,24,1.1])},
  /* Mauritius lay at the bottom of the screen, by the graphics notice */
  "Free-trade and export processing zones":S=>VIEW(S,[62,0,1.5]),
  /* the card stood on the right over Monrovia, and the Marshall Islands were round the back of the globe (an area
     label now, so the globe is not turned to the middle of them) */
  "The world’s biggest fleet sails under Liberia":S=>{AREA(S,/^Marshall Islands/);VIEW(S,[-36,16,1])}
 },
 hg7d:{
  /* the photos of California and the Galápagos were round the back of the globe, St John's under the card, Dhaka's
     by the zoom buttons and Kolwezi's below the graphics notice; each has its own stop later in the tour. The opening
     keeps Africa's two, the cobalt mines and the gorillas, beside the card */
  "Sustainable development":S=>{DROPPH(S,/^(California|Galápagos|St John|Dhaka)/);VIEW(S,[54,1,1])},
  /* Country Overshoot Days 2026 (Global Footprint Network, overshootday.org, "Country Overshoot Days 2026"): Qatar's is
     4 February; Earth Overshoot Day 2026 is 30 July (Wikipedia, "Earth Overshoot Day"). The stop gave 2025's dates */
  "The ecological footprint":S=>{RE(S,"body","put its 2025 “overshoot day” on 6 February.","put its 2026 “overshoot day” on 4 February.");
   RE(S,"more","For the world as a whole, overshoot day fell in late July:","For the world as a whole, overshoot day fell on 30 July in 2026:")},
  /* the UN headquarters photo was round the back of the globe, and China's label by the zoom buttons */
  "From 8 goals to 17":S=>{DROPPH(S,/^UN headquarters/);VIEW(S,[98,24,1.5])},
  /* the highlighted country was labelled twice, by the map and by a pin with its plain name */
  "Minerals for a green future":S=>DROP(S,/^DR Congo$/),
  "Rich in oil, poor in people":S=>DROP(S,/^Equatorial Guinea$/),
  "$1,500 to see a gorilla":S=>DROP(S,/^Rwanda$/)
 }
};
/* stops that keep the card where their own script put it */
const KEEPSIDE=new Set(["hg7b|Night shift in Manila"]);
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;applied.add(S);const t=strip(S.title);
 try{if(!KEEPSIDE.has(tour+"|"+t))LOCK(S,"card","left");const f=F[t];if(f)f(S)}catch(e){console.error("rvp fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
/* geoflock-polish-b.js re-patches some stops with Object.defineProperty at load + 1.5 s and 4 s after it runs; a field
   fixed here before then would make those writes throw. So the fixes start once the page has settled (6 s), or as soon
   as one of these tours is opened, whichever comes first. */
let lastKey="",ready=false;
const start=()=>{if(ready)return;ready=true;applyAll()};
if(document.readyState==="complete")setTimeout(start,6000);else addEventListener("load",()=>setTimeout(start,6000));
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}if(!ready)start();const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvk.js and -rvn.js do for theirs): psFlyGlobe (index.html) turns a
   stop's place out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain
   centre whenever it is more than 20° from it. So on these tours aim is told the stop is already aimed, and for four
   seconds after a stop opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there
   once more. A drag or zoom by the reader in that time cancels it, and so does a stop whose own buttons turn the globe. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const S=psSteps()[ps.i];if(S&&S.gfSun)return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=S;
 if(document.querySelector(".rvp-ctl[data-turned]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>6500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* India's GDP per person in 2024: $2,592 at market exchange rates, $10,719 at PPP (World Bank, World Development
     Indicators) */
  "hg7a|Per person and PPP":G("India’s income per person in 2024 was about $2,600 at market exchange rates. How much is it at purchasing power parity?",1000,25000,10700,"dollars",{step:100,show:"about $10,700, roughly four times as much"}),
  /* Youngstown: 170,002 people in 1930, 60,068 in 2020 (US Census Bureau, in Wikipedia, "Youngstown, Ohio") */
  "hg7b|Deindustrialisation":G("Steel made Youngstown, Ohio, a city of 170,000 people in 1930. How many lived there in 2020?",0,200000,60068,"people",{step:1000,show:"60,068: little more than a third"}),
  /* "in 1980 there were just 250 mountain gorillas, as of 2025, there are 1,063" (UNESCO, quoted in Wikipedia,
     "Mountain gorilla"; the 1,063 is the 2018 census total, announced in 2019) */
  "hg7d|$1,500 to see a gorilla":G("In 1980 only about 250 mountain gorillas were left. How many are there now?",0,3000,1063,"gorillas",{step:10,show:"1,063, more than four times as many"})
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvn.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in amGlobe.host,
   clipped to the globe's visible disc), and removes everything as soon as the stop changes or the tour ends.
   - hg7a | "Sectors of the economy": primary, secondary or tertiary? Sort eight jobs.
   - hg7a | "The Human Development Index": put six countries in HDI order, from Norway to South Sudan.
   - hg7a | "World-systems theory": core, semi-periphery or periphery? Sort nine countries; the globe turns to each.
   - hg7b | "Industry spreads": Manchester, Seraing, the Ruhr, Pittsburgh, Yawata; buttons turn the globe to each.
   - hg7b | "From Fordism to post-Fordism": Ford's way or Toyota's? Sort eight features; the globe turns to each factory.
   - hg7c | "Comparative advantage": Ricardo's England and Portugal; move workers between cloth and wine and beat what
            the two make without trade.
   - hg7c | "Neoliberal policies": buttons turn the globe between Washington and Ghana.
   - hg7c | "OPEC and oil": in OPEC today, or not? Sort eight oil countries; the globe turns to each.
   - hg7d | "The ecological footprint": if everyone lived like each country, when would a year's nature run out? Put
            seven countries' overshoot days in order.
   - hg7d | "A town that trades its waste": where does each of Kalundborg's wastes go? Sort seven by-products. */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;if(!G._flat&&G.size){const z=G.size();if(z&&z.r&&Math.hypot(s[0]-z.w/2,s[1]-z.h/2)>z.r+1)return null}const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvp-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+esc(head)+"</b>":"")+"<span>"+esc(text)+"</span>";e.classList.remove("rvp-new");void e.offsetWidth;e.classList.add("rvp-new")}
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
 card:()=>'<div class="rvp-pool"></div><div class="rvp-order"></div><div class="rvp-row"><button type="button" class="rvp-btn rvp-undo">↶ Undo</button><button type="button" class="rvp-btn rvp-reset">↺ Start again</button></div>',
 init(L){L.pick=[];L.items=shuffle(o.items.map((x,i)=>i),o.seed||7)},
 wire(L){const c=L.card;c.querySelector(".rvp-undo").onclick=()=>{if(L.pick.length&&L.pick.length<o.items.length)L.pick.pop();this.render(L)};
  c.querySelector(".rvp-reset").onclick=()=>{L.pick=[];this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=o.items.length,done=L.pick.length===n;
  setHTML(c.querySelector(".rvp-pool"),done?"":L.items.filter(i=>!L.pick.includes(i)).map(i=>'<button type="button" class="rvp-chip" data-i="'+i+'">'+esc(o.items[i][0])+"</button>").join(""));
  c.querySelectorAll(".rvp-chip").forEach(b=>b.onclick=()=>{L.pick.push(+b.dataset.i);this.render(L)});
  let right=0;const rows=[];for(let k=0;k<n;k++){const i=L.pick[k];if(i==null){rows.push('<div class="rvp-slot rvp-empty"><em>'+(k+1)+'</em><span>'+(k===L.pick.length?"tap the "+(k===0?o.first:"next"):"")+"</span></div>");continue}
   const ok=done&&i===k;if(ok)right++;rows.push('<div class="rvp-slot'+(done?ok?" rvp-ok":" rvp-no":"")+'"><em>'+(k+1)+"</em><span>"+esc(o.items[i][0])+"</span>"+(done?"<b>"+esc(o.items[i][1])+(ok?"":' <i>(no. '+(i+1)+")</i>")+"</b>":"")+"</div>")}
  setHTML(c.querySelector(".rvp-order"),rows.join(""));c.querySelector(".rvp-undo").disabled=!L.pick.length||done;
  if(!L.pick.length)say(L,o.head,o.intro);else if(!done)say(L,"",o.items.length-L.pick.length+" to go");
  else say(L,right+" of "+n+" in the right place"+(right===n?"!":""),o.after)}}}

/* ---------------------------------------------------------------- TURN: buttons turn the globe from place to place */
function turnDef(tour,title,o){return{tour,title,globe:true,turn:true,tip:o.tip,
 card:()=>'<div class="rvp-row rvp-turn">'+o.places.map((f,i)=>'<button type="button" class="rvp-btn" data-i="'+i+'"></button>').join("")+'</div>',
 init(L){L.at=-1;L.t=0;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvp-ring"});L.tag=document.createElement("div");L.tag.className="rvp-tag rvp-new2";L.el.appendChild(L.tag)},
 tick(L,dt){L.t+=dt;if(L.at>=0)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){const f=L.at>=0?o.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;c.querySelectorAll(".rvp-turn button").forEach(b=>b.onclick=()=>{const f=o.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turned="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvp-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvp-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+o.places[k][0]});
  if(L.at<0)say(L,"",o.intro);else{const f=o.places[L.at];say(L,f[0],f[4])}}}}

/* ---------------------------------------------------------------- BIN: one item at a time; which kind is it?
   As in geoflock-polish-rvk.js, plus: an item may name a place ([lon, lat, zoom] as its fourth entry); once answered,
   the globe turns to it and a ring marks it, so farms half a world apart can each be seen beside the card. */
function binDef(tour,title,o){const placed=o.items.some(it=>it[3]);return{tour,title,globe:placed,turn:placed,tip:o.tip,
 card:()=>'<div class="rvp-q"><span class="rvp-n"></span><b class="rvp-item"></b></div><div class="rvp-row rvp-bins">'+o.keys.map(k=>'<button type="button" class="rvp-btn rvp-bin" data-k="'+k[0]+'">'+esc(k[1])+"</button>").join("")+'</div>'+
  '<div class="rvp-dots">'+o.items.map(()=>"<i></i>").join("")+'</div><div class="rvp-row"><button type="button" class="rvp-btn rvp-next" hidden>Next ▶</button><button type="button" class="rvp-btn rvp-again" hidden>Play again</button></div>',
 init(L){L.k=0;L.res=[];L.ans=null;L.t=0;L.at=null;if(L.svg){L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvp-ring"});L.ring.style.display="none";L.tag=document.createElement("div");L.tag.className="rvp-tag rvp-new2";L.tag.style.display="none";L.el.appendChild(L.tag)}},
 tick(L,dt){L.t+=dt;if(L.ring&&L.at)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){if(!L.ring)return;const f=L.at,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;
  c.querySelectorAll(".rvp-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=o.items.length)return;const it=o.items[L.k];L.ans=b.dataset.k;L.res[L.k]=L.ans===it[1];
   if(it[3]){const p=it[3];L.at=[p[3]||"",p[0],p[1]];c.dataset.turned="1";turnGlobe(p[0],p[1],p[2]);L.dirty=1}this.render(L)});
  c.querySelector(".rvp-next").onclick=()=>{L.k++;L.ans=null;L.at=null;L.dirty=1;this.render(L)};
  c.querySelector(".rvp-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;L.at=null;L.dirty=1;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=o.items.length,end=L.k>=N,it=o.items[Math.min(L.k,N-1)];
  c.querySelector(".rvp-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvp-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvp-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvp-right",!!L.ans&&b.dataset.k===it[1]);b.classList.toggle("rvp-wrong",!!L.ans&&b.dataset.k===L.ans&&L.ans!==it[1])});
  c.querySelectorAll(".rvp-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvp-ok":L.res[i]===false?"rvp-no":i===L.k&&!end?"rvp-at":"");
  const nx=c.querySelector(".rvp-next");nx.hidden=end||!L.ans;nx.textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvp-again").hidden=!end;
  const name=k=>(o.keys.find(x=>x[0]===k)||[,""])[1];
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": all right!":""),o.done)}
  else if(!L.ans)say(L,"",o.ask);
  else if(L.ans===it[1])say(L,"Right: "+name(it[1]),it[2]);
  else say(L,"Not quite: "+name(it[1]),it[2])}}}


/* ======================================================================== hg7a: Measuring development */
/* Primary, secondary or tertiary, as the stop defines them (primary: farming, fishing, mining; secondary:
   manufacturing; tertiary: services). Answers are mixed so that taking turns cannot win. */
const SECTORS=binDef("hg7a","Sectors of the economy",{tip:"Primary, secondary or tertiary? Sort eight jobs.",
 keys:[["p","🌾 Primary"],["s","🏭 Secondary"],["t","💼 Tertiary"]],ask:"Which sector does this job belong to?",
 items:[["A cocoa farmer in Ghana","p","Primary: growing or taking things straight from nature."],
  ["A machinist sewing shirts in a Dhaka garment factory","s","Secondary: turning cloth into clothes is manufacturing."],
  ["A nurse in a London hospital","t","Tertiary: a service. Most British workers have service jobs."],
  ["A copper miner in Zambia","p","Primary: mining takes a raw material out of the ground."],
  ["A bus driver in Lagos","t","Tertiary: transport is a service, even when it is informal."],
  ["A worker on a car assembly line near Stuttgart","s","Secondary: making cars from parts is manufacturing."],
  ["A fisher off the coast of Senegal","p","Primary: fishing takes food from nature."],
  ["A software engineer in Bengaluru","t","Tertiary (some books say quaternary): knowledge work, sold as a service."]],
 done:"As countries develop, workers move from the first column to the second and then the third: in Niger most people farm, in the UK over 80% work in services."});
/* Human Development Index, 2023 values (UNDP, Human Development Report 2025; table in Wikipedia, "List of countries
   by Human Development Index"): Norway 0.970 (2nd), United States 0.938, China 0.797, India 0.685, Nigeria 0.560,
   South Sudan 0.388 (193rd, last). */
const HDIRANK=rankDef("hg7a","The Human Development Index",{seed:11,first:"highest HDI",head:"Guess the order",
 tip:"Which country scores highest? Tap them from the highest HDI to the lowest.",
 items:[["Norway","0.970"],["United States","0.938"],["China","0.797"],["India","0.685"],["Nigeria","0.560"],["South Sudan","0.388"]],
 intro:"The HDI runs from 0 to 1 and mixes life expectancy, years of schooling and income per person.",
 after:"Income is only a third of the score: a long, healthy life and schooling count just as much. Of 193 countries, South Sudan comes last."});
/* Core, semi-periphery or periphery: the countries the stop's own diagram names (core: US, Germany, Japan;
   semi-periphery: China, Brazil, India; periphery: Chad, Haiti) and its pin, the Central African Republic. */
const WORLDSYS=binDef("hg7a","World-systems theory",{tip:"Core, semi-periphery or periphery? Sort nine countries; the globe turns to each.",
 keys:[["c","Core"],["s","Semi-periphery"],["p","Periphery"]],ask:"Where does this country sit in Wallerstein’s world system?",
 items:[["Germany: cars, machine tools and big banks","c","Core: high-tech industry, high wages, and firms that invest all over the world.",[10.4,51.2,2.4,"Germany"]],
  ["Brazil: car factories, but also soybeans and iron ore for export","s","Semi-periphery: some industry of its own, but still a big exporter of raw materials.",[-51,-12,2,"Brazil"]],
  ["Chad: oil and cotton, sold unprocessed","p","Periphery: raw materials go out; factories, finance and profits stay elsewhere.",[18.7,15.5,2.4,"Chad"]],
  ["Japan: robots, electronics and world-famous brands","c","Core: it designs and sells the high-value goods others assemble.",[138,36.5,2.4,"Japan"]],
  ["Haiti: cheap labour sewing clothes for American brands","p","Periphery: low wages and little say over prices.",[-72.3,19,3.2,"Haiti"]],
  ["India: software exports, but hundreds of millions of small farmers","s","Semi-periphery: core-like cities and periphery-like villages in one country.",[78.9,22,2,"India"]],
  ["United States: finance, Silicon Valley and the dollar","c","Core: the heart of the system since 1945.",[-98,39,1.8,"United States"]],
  ["Central African Republic: diamonds, timber and gold","p","Periphery: one of the least developed countries on Earth.",[20.9,6.6,2.6,"Central African Republic"]],
  ["China: the world’s factory, now building its own tech giants","s","Semi-periphery, and climbing: Wallerstein said countries can move between the zones.",[104,35,1.8,"China"]]],
 done:"Wallerstein’s point: these zones are linked. The core gains most from trade with the periphery. Countries can move between zones: South Korea, poor in the 1950s, now makes the core’s high-tech goods."});
/* ======================================================================== hg7b: Industry and the global economy */
/* How industry spread, as the stop tells it, with each place's first big works: John Cockerill's ironworks at
   Seraing, beside Liège, 1817 (Wikipedia, "John Cockerill (company)"); the Edgar Thomson Steel Works at Braddock,
   Carnegie's mill, opened 1875, "the plant that made Pittsburgh the Steel City" (Wikipedia, "Edgar Thomson Steel
   Works", citing the Pittsburgh Post-Gazette, 2000); Yawata's first blast furnace, 5 February 1901, and 80% of Japan's
   pig iron by 1912 (Wikipedia, "Yahata Steel Works"). */
const SPREAD=turnDef("hg7b","Industry spreads",{tip:"Follow industry from Britain round the world. Visit each place in turn.",
 intro:"Tap a place to turn the globe to it.",
 places:[["1. Manchester, from the 1760s",-2.24,53.48,3.2,"Coal, iron, steam and cotton mills: the world’s first industrial region, where the tour began."],
  ["2. Seraing, Belgium, 1817",5.5,50.6,3.6,"John Cockerill, son of an English textile-machine maker, opened an ironworks at Seraing, on the Meuse beside Liège."],
  ["3. The Ruhr, Germany",7.0,51.45,3.6,"Coal mines and steelworks spread along the Ruhr valley in the 1800s, making it Germany’s heavy-industry heartland."],
  ["4. Pittsburgh, 1875",-79.86,40.39,3,"Carnegie’s Edgar Thomson Steel Works opened beside the Monongahela River and made Pittsburgh the “Steel City”."],
  ["5. Yawata, Japan, 1901",130.8,33.88,3,"Meiji Japan’s state steelworks, in Kyushu, lit its first blast furnace in 1901, built by German engineers. By 1912 it made 80% of Japan’s pig iron."]]});
/* Fordism or post-Fordism, as the stop defines them: Ford's moving assembly line at Highland Park, the first in the
   world, 7 October 1913 (Wikipedia, "Highland Park Ford Plant", which also lists the blast furnaces, sawmills, railway and glass plant Ford
   built or bought after 1913), and Toyota's just-in-time system. */
const FORD=binDef("hg7b","From Fordism to post-Fordism",{tip:"Ford’s way or Toyota’s? Sort eight features; the globe turns to each factory.",
 keys:[["f","🚗 Fordism"],["p","🔄 Post-Fordism"]],ask:"Is this mass production, or the flexible kind that followed it?",
 items:[["One model, every car the same, made in huge numbers","f","Fordism: Highland Park turned out the Model T, the same car over and over, in huge numbers.",[-83.1,42.41,3,"Highland Park"]],
  ["Parts arrive just in time, a few hours before they are needed","p","Post-Fordism: Toyota’s just-in-time system cuts stock and waste.",[137.15,35.08,3,"Toyota City"]],
  ["Warehouses full of parts, kept just in case","f","Fordism: huge stockpiles kept the line moving, but tied up money.",[-83.1,42.41,3,"Highland Park"]],
  ["Each worker repeats one simple task as the line moves past","f","Fordism: the moving assembly line, first used at Highland Park in 1913.",[-83.1,42.41,3,"Highland Park"]],
  ["Many models and colours, made in small batches to order","p","Post-Fordism: flexible machines switch quickly from one product to another.",[137.15,35.08,3,"Toyota City"]],
  ["Teams of workers who can do many jobs, and can stop the line to fix a fault","p","Post-Fordism: Toyota trusted workers to spot and fix problems.",[137.15,35.08,3,"Toyota City"]],
  ["Parts made by suppliers in many different countries","p","Post-Fordism: production is spread across a global network of firms.",[137.15,35.08,3,"Toyota City"]],
  ["One giant company owns almost everything, from blast furnaces to sawmills","f","Fordism: after 1913 Ford bought or built blast furnaces, sawmills, a railway and even a glass plant to control every step.",[-83.1,42.41,3,"Highland Park"]]],
 done:"Fordism made cars cheap enough for workers to buy; post-Fordism made production flexible and global. Most factories today mix the two."});
/* ======================================================================== hg7c: Trade and the world economy */
/* Ricardo's own example (On the Principles of Political Economy and Taxation, 1817, chapter 7; Wikipedia,
   "Comparative advantage"): a unit of cloth takes 100 men's labour for a year in England and 90 in Portugal; a unit
   of wine 120 in England and 80 in Portugal. Without trade England's 220 and Portugal's 170 make one of each. Here the
   reader moves each country's labour between the two goods; specialising (England all cloth, Portugal all wine) gives
   2.2 cloth and 2.125 wine, more of both than the 2 and 2 made without trade, though Portugal is better at both. */
const RICARDO={tour:"hg7c",title:"Comparative advantage",globe:false,
 tip:"Ricardo’s puzzle: move the workers, and make more cloth AND more wine than 2 and 2.",
 card:()=>'<div class="rvp-rc"><label>🇬🇧 England’s 220 workers: <b class="rvp-e"></b></label><input type="range" class="rvp-er" min="0" max="220" step="10" value="100" aria-label="English workers making cloth">'+
  '<label>🇵🇹 Portugal’s 170 workers: <b class="rvp-p"></b></label><input type="range" class="rvp-pr" min="0" max="170" step="10" value="90" aria-label="Portuguese workers making cloth"></div>'+
  '<svg class="rvp-rbars" viewBox="0 0 260 74" role="img" aria-label="Total cloth and wine"></svg><div class="rvp-row"><button type="button" class="rvp-btn rvp-sp">Specialise ▶</button><button type="button" class="rvp-btn rvp-rs">↺ No trade</button></div>',
 init(L){L.e=100;L.p=90},
 wire(L){const c=L.card,er=c.querySelector(".rvp-er"),pr=c.querySelector(".rvp-pr");
  er.oninput=()=>{L.e=+er.value;this.render(L)};pr.oninput=()=>{L.p=+pr.value;this.render(L)};
  c.querySelector(".rvp-sp").onclick=()=>{L.e=220;L.p=0;er.value=220;pr.value=0;this.render(L)};
  c.querySelector(".rvp-rs").onclick=()=>{L.e=100;L.p=90;er.value=100;pr.value=90;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const eC=L.e/100,eW=(220-L.e)/120,pC=L.p/90,pW=(170-L.p)/80,C=eC+pC,W=eW+pW;
  c.querySelector(".rvp-e").textContent=L.e+" on cloth, "+(220-L.e)+" on wine";c.querySelector(".rvp-p").textContent=L.p+" on cloth, "+(170-L.p)+" on wine";
  const f=v=>v.toFixed(2).replace(/\.?0+$/,""),bar=(y,lab,v,col)=>'<text x="0" y="'+(y+13)+'" class="rvp-rt">'+lab+'</text><rect x="56" y="'+y+'" width="'+Math.max(0,v/2.4*170).toFixed(1)+'" height="18" rx="4" fill="'+col+'"/><text x="'+(60+Math.max(0,v/2.4*170)).toFixed(1)+'" y="'+(y+13)+'" class="rvp-rt rvp-rv">'+f(v)+'</text>';
  const line='<line x1="'+(56+2/2.4*170).toFixed(1)+'" y1="2" x2="'+(56+2/2.4*170).toFixed(1)+'" y2="64" class="rvp-r2"/><text x="'+(56+2/2.4*170).toFixed(1)+'" y="73" class="rvp-rt rvp-r2t" text-anchor="middle">2 without trade</text>';
  setHTML(c.querySelector(".rvp-rbars"),bar(6,"🧵 Cloth",C,"#5a7fc4")+bar(32,"🍷 Wine",W,"#a3324d")+line);
  const both=C>2.001&&W>2.001;
  if(L.e===100&&L.p===90)say(L,"No trade: 2 cloth, 2 wine","Each country makes one unit of each for itself. Portugal is better at both (90 and 80 against 100 and 120). Can trade still help?");
  else if(both)say(L,"More of both!","England makes only cloth, Portugal mostly wine, and they swap. Each does what it gives up least to make: its comparative advantage.");
  else if(C>2.001)say(L,"More cloth, but no more wine","Try moving Portugal’s workers to wine: it is twice as good at wine as England, but only a little better at cloth.");
  else if(W>2.001)say(L,"More wine, but no more cloth","Try moving England’s workers to cloth, the thing it is least bad at.");
  else say(L,"No more of either","Keep moving the sliders: which country should make which?")}};
/* Washington and Ghana as the stop tells it; the IMF was set up at the Bretton Woods conference in 1944 and has its
   headquarters in Washington (Wikipedia, "International Monetary Fund") */
const LENDERS=turnDef("hg7c","Neoliberal policies",{tip:"The lenders and a borrower are an ocean apart. Visit each.",
 intro:"Tap a place to turn the globe to it.",
 places:[["Washington: the lenders",-77.04,38.9,3,"The IMF and the World Bank, set up at the Bretton Woods conference in 1944, both have their headquarters here."],
  ["Accra, Ghana: a borrower",-0.2,5.6,3,"From 1983 Ghana took their loans on condition of structural adjustment: cutting spending, selling state firms and opening its markets."]]});
/* OPEC's members (Wikipedia, "OPEC", as of May 2026): Algeria, Equatorial Guinea, Gabon, Iran, Iraq, Kuwait, Libya,
   Nigeria, the Republic of the Congo, Saudi Arabia and Venezuela. Iraq and Venezuela were founders (Baghdad, 1960);
   Gabon left in 1994 and rejoined in 2016; Qatar left on 1 January 2019; the UAE on 1 May 2026; Russia is in the wider
   OPEC+ group only. */
const OPEC=binDef("hg7c","OPEC and oil",{tip:"In OPEC today, or not? Sort eight oil countries; the globe turns to each.",
 keys:[["y","🛢 OPEC member"],["n","Not a member"]],ask:"Is this country a member of OPEC today?",
 items:[["Venezuela, with the world’s largest proven oil reserves","y","A member: one of the five founders, at Baghdad in 1960.",[-66.6,7,2.4,"Venezuela"]],
  ["Nigeria, with its oil fields in the Niger Delta","y","A member since 1971.",[8,9.5,2.6,"Nigeria"]],
  ["Russia, a giant oil and gas exporter","n","Not a member: it joins OPEC’s output deals in the looser OPEC+ group.",[60,58,1.6,"Russia"]],
  ["Iraq","y","A member: a founder, and OPEC was set up in its capital, Baghdad.",[43.7,33.2,2.6,"Iraq"]],
  ["Norway, with oil and gas under the North Sea","n","Not a member: Norway sells its oil freely and saves the money in a huge fund.",[9,61,2.4,"Norway"]],
  ["Qatar","n","Not any more: Qatar left on 1 January 2019, during its quarrel with Saudi Arabia and the UAE.",[51.2,25.3,3.5,"Qatar"]],
  ["Gabon, on Africa’s Atlantic coast","y","A member: it left in 1994 but rejoined in 2016.",[11.6,-0.8,3,"Gabon"]],
  ["The United Arab Emirates","n","Not any more: the UAE left OPEC and OPEC+ in May 2026, after 59 years.",[54,24,3,"UAE"]]],
 done:"OPEC has 11 members today. Big producers such as the United States, Russia, Canada and Norway are outside it, which limits how far it can steer the price."});
/* ======================================================================== hg7d: Sustainable development */
/* Country Overshoot Days 2026, Global Footprint Network (overshootday.org, table 1): Qatar 4 February, United States
   14 March, United Kingdom 22 May, China 27 May, Brazil 14 August, Indonesia 18 October. India is in table 2,
   countries that do not overshoot: if everyone lived like India, humanity would use 75% of what Earth regrows. */
const OVERSHOOT=rankDef("hg7d","The ecological footprint",{seed:3,first:"earliest",head:"Guess the order",
 tip:"If everyone lived like the people of each country, when would a year’s nature run out? Tap from earliest to latest.",
 items:[["Qatar","4 February"],["United States","14 March"],["United Kingdom","22 May"],["China","27 May"],["Brazil","14 August"],["Indonesia","18 October"],["India","never: 3/4 of an Earth"]],
 intro:"Each date is when humanity would use up all the nature Earth regrows in a year, if everyone lived like that country’s people.",
 after:"The richer and more energy-hungry the country, the earlier its date. Living like Americans, humanity would need about five Earths; living like Indians, three-quarters of one."});
/* Kalundborg's exchanges (Wikipedia, "Kalundborg Eco-industrial Park", timeline): Novo Nordisk's biological sludge to
   farms (1976); the power station's fly ash to cement makers (1979); its waste heat to the town's district heating
   (1981); its steam to Novo Nordisk and the refinery (1982); warm cooling water to a trout and turbot farm (1989);
   sulphur recovered at the refinery sold to a sulphuric acid maker (1990); gypsum from cleaning its smoke to Gyproc's
   plasterboard plant (1993). */
const KALUND=binDef("hg7d","A town that trades its waste",{tip:"One firm’s waste is another’s raw material. Where does each one go?",
 keys:[["f","🏭 Another factory"],["h","🏠 Homes"],["a","🐟 Farms"]],ask:"Who in Kalundborg uses this waste?",
 items:[["Steam from the power station","f","A factory: the insulin and enzyme maker Novo Nordisk and the oil refinery bought it from 1982 and shut their own boilers.",],
  ["Waste heat from the power station","h","Homes: since 1981 it has warmed the town through district-heating pipes.",],
  ["Sludge left over from making insulin and enzymes","a","Farms: since 1976 it has gone onto nearby fields as fertiliser.",],
  ["Gypsum from cleaning the power station’s smoke","f","A factory: Gyproc makes plasterboard from it instead of importing natural gypsum.",],
  ["Warm, salty cooling water","a","A fish farm: since 1989 it has raised trout and turbot.",],
  ["Fly ash from burning coal","f","A factory: cement makers have used it since 1979.",],
  ["Sulphur taken out of the refinery’s gas","f","A factory: it is sold to a sulphuric acid maker in Fredericia.",]],
 done:"Over thirty exchanges like these grew up deal by deal, each because it saved someone money: a working circular economy."});

/* ---------------------------------------------------------------- the engine: one stop at a time */
const DEFS=[SECTORS,HDIRANK,WORLDSYS,SPREAD,FORD,RICARDO,LENDERS,OPEC,OVERSHOOT,KALUND];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tour===ps.tour&&d.title===t);if(!D)return null;if((D.globe||D.turn)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvp-layer";el.innerHTML='<svg class="rvp-sv"><defs><clipPath id="rvpClip"><path class="rvp-clipp" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvpClip)"></g></svg>';host.appendChild(el);
  L.el=el;L.root=el.querySelector("svg");L.svg=el.querySelector("g");L.clipP=el.querySelector(".rvp-clipp")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}lastT=0;if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvp-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvp-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvp-ctl";
 c.innerHTML='<div class="rvp-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvp-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvp-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvp-field{display:block;width:100%;height:auto;border-radius:8px;margin:2px 0 4px}.rvp-cous{fill:#cfe3b0;stroke:#6f8f4a;stroke-width:1}.rvp-mine{fill:#d9682b;stroke:#7a3410;stroke-width:1.5}
.rvp-heirs span{font-size:12.5px;font-weight:700;opacity:.75}
.rvp-route{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:6 5;opacity:.7}
.rvp-trail{fill:none;stroke:#d9a21a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.rvp-green{fill:#4c9a3a;stroke:#fff;stroke-width:2}.rvp-gold{fill:#f2c230;stroke:#7a4a12;stroke-width:2}
.rvp-cmb{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvp-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvp-sv{position:absolute;left:0;top:0;overflow:visible}
.rvp-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none;background:rgba(255,255,255,.95);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvp-tag.rvp-new2{background:#13294b;color:#fff}
.rvp-ring{fill:rgba(255,209,102,.35);stroke:#d9682b;stroke-width:3}
.rvp-dot{fill:#ffd166;stroke:#13294b;stroke-width:2.5}.rvp-stop{fill:#c2364f;stroke:#fff;stroke-width:2.5}
.rvp-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvp-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvp-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvp-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvp-btn[hidden]{display:none}.rvp-btn:disabled{cursor:default;opacity:.55}
.rvp-btn.rvp-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvp-btn.rvp-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvp-btn.rvp-cur{background:#13294b;color:#fff;border-color:#13294b}
.rvp-pool{display:flex;flex-wrap:wrap;gap:6px}.rvp-pool:empty{display:none}
.rvp-chip{border:1px solid #d9682b;background:#fff4ec;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvp-chip:hover{background:#d9682b;color:#fff}
.rvp-order{display:flex;flex-direction:column;gap:3px;margin-top:8px}
.rvp-slot{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 8px;border-radius:8px;background:rgba(19,41,75,.06);min-height:24px}
.rvp-slot em{font-style:normal;font-weight:800;width:16px;opacity:.6}.rvp-slot span{flex:1 1 auto;font-weight:700}.rvp-slot b{font-weight:700;font-size:12.5px;white-space:nowrap}.rvp-slot b i{font-style:normal;opacity:.8}
.rvp-slot.rvp-empty span{font-weight:500;opacity:.6;font-style:italic}
.rvp-slot.rvp-ok{background:rgba(31,138,76,.16)}.rvp-slot.rvp-no{background:rgba(194,54,79,.13)}
.rvp-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 4px;min-height:1.4em}.rvp-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvp-item{font-size:15.5px;color:#13294b;line-height:1.3}
.rvp-dots{display:flex;gap:4px;margin-top:8px}.rvp-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvp-dots i.rvp-ok{background:#1f8a4c}.rvp-dots i.rvp-no{background:#c2364f}.rvp-dots i.rvp-at{box-shadow:0 0 0 2px #ffd166}
.rvp-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvp-ep b{display:block;font-size:15px}
.rvp-ep.rvp-new{animation:rvpIn .45s ease}@keyframes rvpIn{from{opacity:.2;transform:translateY(4px)}}
.rvp-sl{display:flex;align-items:center;gap:10px;margin-top:4px}.rvp-sl input{flex:1 1 auto;accent-color:#d9682b}.rvp-sl b{min-width:64px;text-align:right;font-size:17px;color:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvp-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvp-do,:is(body.dark-theme,body.sky-night) .rvp-sl b{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvp-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvp-n{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvp-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvp-btn.rvp-cur{background:#ffb27a;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvp-chip{background:rgba(217,104,43,.18);color:#ffd2b3;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvp-slot{background:rgba(255,255,255,.07)}
:is(body.dark-theme,body.sky-night) .rvp-slot.rvp-ok{background:rgba(31,138,76,.35)}:is(body.dark-theme,body.sky-night) .rvp-slot.rvp-no{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvp-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}


/* night: the answer colours must outrank the plain night button style above them (as geoflock-polish-rvl.js does) */
{const s=document.createElement("style");s.textContent=`
:is(body.dark-theme,body.sky-night) .rvp-btn.rvp-right{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rvp-btn.rvp-wrong{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvp-dots i.rvp-ok{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvp-dots i.rvp-no{background:#ff7088}
:is(body.dark-theme,body.sky-night) .rvp-dots i.rvp-at{box-shadow:0 0 0 2px #ffb27a}
:is(body.dark-theme,body.sky-night) .rvp-tag{background:#13294b;color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.4)}
.rvp-rc{display:grid;gap:4px}.rvp-rc label{font-size:12.5px;font-weight:700;color:#13294b}.rvp-rc label b{font-weight:600;color:#5b6b7c}.rvp-rc input{width:100%;accent-color:#d9682b}
.rvp-rbars{display:block;width:100%;height:auto;margin-top:6px}.rvp-rt{font:700 11px system-ui,sans-serif;fill:#13294b}.rvp-rv{fill:#9a4a16}.rvp-r2{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3;opacity:.6}.rvp-r2t{font-weight:600;font-size:9.5px;opacity:.7}
:is(body.dark-theme,body.sky-night) .rvp-rc label{color:#fff}:is(body.dark-theme,body.sky-night) .rvp-rc label b{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rvp-rt{fill:#e8eef7}:is(body.dark-theme,body.sky-night) .rvp-rv{fill:#ffb27a}:is(body.dark-theme,body.sky-night) .rvp-r2{stroke:#e8eef7}
`;document.head.appendChild(s)}
/* ======================================================================== part 4: the map's banner
   As geoflock-polish-rvn.js does: a long banner ("Human Development Index · Very high") ran under the map key in the
   top right corner, or under the search box. On these tours it slides left until it clears them (never onto the card),
   and is put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;if(b.style.translate&&bannerMoved!==b)return;b.style.translate="";bannerMoved=null;
 const B=b.getBoundingClientRect();let dx=0;
 [document.querySelector(".ps-mapkey.at-right"),document.getElementById("globalSearchInput")].forEach(k=>{if(!k||!k.offsetWidth)return;const K=k.getBoundingClientRect();
  if(B.right>K.left-8&&B.left<K.right&&B.bottom>K.top&&B.top<K.bottom)dx=Math.min(dx,K.left-8-B.right)});
 if(!dx)return;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

window.gfPolishRvp={v:1,FIX,stop(){IV.forEach(clearInterval);unmount()}};
})();
