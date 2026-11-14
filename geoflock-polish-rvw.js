/* GeoFlock polish RV-W: a stop-by-stop review of four tours: Ocean life (ocean), Animal migration (amigration), Crops
   (crops) and Capital cities (capitals), each looked at on the globe, their default mode, at 1280×860. Built on
   geoflock-polish-rvs.js (the same helpers and engine, under "rvw" names so the two never touch each other's controls),
   with geoflock-polish-rvt.js's frames found by tour and title (so a tour's opening stop is right on its first launch)
   and its psGlobeTarget wrapper (so a framed stop gets exactly its frame).
   1. Fixes, keyed by tour and stop title, applied once the page has settled and again whenever one of these tours is on.
      Each fix says why; changed facts cite their source. Every stop keeps its card on the left (tour questions flipped
      some to the right, over the place the stop is about and the zoom buttons).
   2. Guess-first questions (through geoflock-tourplay.js). The answer is kept out of the stop's text and pins.
   3. Stops you can play with (listed at the start of part 3).
   4. The map's banner slides clear of the map key and the search box.
   A fixed field becomes a non-configurable getter whose setter is ignored (geoflock-sweep-tours*.js re-set framing on
   every psGo); a field already non-configurable (fixed by another file) is left alone. CSS classes start with "rvw-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvw)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};
const TEST=()=>!!(window.__rvwTest||/[?&]rvwtest\b/.test(location.search));

/* ======================================================================== part 1: data fixes */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* a field that keeps taking new values from other scripts, but always reads back filtered */
const FILT=(S,k,fn)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvw){d.get._rvw.push(fn);return}if(d&&d.configurable===false)return;let v=S[k];const fns=[fn];
 /* a field that another script already serves through its own (configurable) getter, as geoflock-polish-m.js does for
    the photos it adds, keeps that getter and setter underneath */
 const og=d&&d.get,os=d&&d.set;
 const get=()=>fns.reduce((x,f)=>{try{return f(x)}catch(e){return x}},og?og.call(S):v);get._rvw=fns;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get,set:x=>{if(os)os.call(S,x);else v=x}})}catch(e){}};
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
const VIEWED=new WeakMap();
const VIEW=(S,gl)=>{LOCK(S,"globe",gl);VIEWED.set(S,gl)};

const FIX={
 ocean:{
  /* five of the eight photos were out of sight: the black smoker, the krill and the emperor penguins round the back of the
     globe, the manta ray under the map key and the Great Barrier Reef at the globe's bottom edge beside the card. Each
     has its own stop (the manta ray's Peru has two) */
  "Ocean life":S=>{DROPPH(S,/^(A black smoker|Great Barrier Reef|Antarctic krill|Manta ray|Emperor penguins)$/);VIEW(S,[-150,0,1])},
  /* the Great Barrier Reef, the stop's biggest reef, and the bleached coral's photo lay under the map key */
  "Coral reefs and the Coral Triangle":S=>VIEW(S,[148,-4,1.5]),
  /* the card opened on the right, over the zoom buttons; the stop's own kelp coasts lay round the back of the globe.
     It opens on California and buttons (part 3) visit the five coasts the text names */
  "Kelp forests":S=>VIEW(S,[-121,37,2.4]),
  /* a tour question flipped the card to the right, over Benguela's seals; on the left, with the globe turned out from
     under it, Benguela and its seals lay under the map key. The globe now tips south a little; buttons (part 3) visit the
     four zones */
  "Upwelling: where the fish are":S=>VIEW(S,[-8,-8,1]),
  /* a second "Peru" label, besides the map's own, hung in the ocean at the end of a long leader line */
  "The anchoveta and El Niño":S=>DROP(S,/^Peru$/),
  /* the Juan de Fuca Ridge, which the text never mentions, hung its label over the map's switches at the top (and its
     point under the card); the vent shrimp's photo sat on the zoom buttons */
  "Life without sunlight":S=>{DROP(S,/^Juan de Fuca/);VIEW(S,[-65,0,1])},
  /* the card opened on the right and the globe faced empty ocean: Deception Island's whaling station lay off the globe's
     edge. The same Grytviken photo was pinned twice at one spot */
  "The great whales":S=>{DROPPH(S,/^Grytviken, South Georgia$/);VIEW(S,[-41,-57.5,2.4])},
  /* the card opened on the right, over Mongolia's outline, and Midway, the chain's far end, was off the globe's edge.
     Mongolia's outline now starts north of the islands, beside the card, ready to drag */
  "Ocean parks":S=>{VIEW(S,[-164,26,2.2]);FILT(S,"ghosts",A=>Array.isArray(A)?A.map(x=>x&&x.code==="mn"?Object.assign({},x,{at:[-160,36]}):x):A)},
  /* Iran's outline and the patch's label lay under the map key */
  "Plastic seas":S=>{VIEW(S,[-140,30,2]);FILT(S,"ghosts",A=>Array.isArray(A)?A.map(x=>x&&x.code==="ir"?Object.assign({},x,{at:[-137,43]}):x):A)}
 },
 amigration:{
  /* the opening's lines (tern, godwit, monarchs, humpbacks) mostly lay under the card or round the back of the globe; the
     locust photo sat under the map key and the monarch and humpback photos under the card. The globe now faces the
     Americas and the Atlantic, where three of the four journeys run (the godwit's has its own stop) */
  "Animals on the move":S=>{DROPPH(S,/^(A locust swarm|Bar-tailed godwit|Muskox|Nile crocodile)$/);VIEW(S,[-55,12,1])},
  /* the card opened on the right, over the zoom buttons; the herds' loop, about 800 km round, was a 60-pixel knot. Zoomed
     in, the month slider (part 3) can follow the herds round it */
  "Wildebeest follow the rain":S=>VIEW(S,[35.2,-2.1,11]),
  /* the Greenland nest's two labels (the stop's and its game's) sat on the map's switches at the top: the globe tips
     north and the stop's own label, which said the same as the game's, goes */
  "The Arctic tern":S=>{DROP(S,/^Nesting: north-east Greenland$/);VIEW(S,[-25,35,1])},
  /* neither end of the flight was on screen (Alaska above the top, New Zealand and Tasmania below the bottom); the long
     Alaska label then ran into the search box */
  "The godwit’s non-stop flight":S=>{RELABEL(S,/^Yukon–Kuskokwim delta/,"Yukon delta, Alaska");VIEW(S,[-172,6,1])},
  /* the card opened on the right and the globe faced the open Pacific: the Yellow Sea, the stop's subject, lay under
     the map key and the Chukotka label on the map's switches */
  "The East Asian–Australasian Flyway":S=>VIEW(S,[130,20,1.1]),
  /* the nesting grounds were off the top of the screen and southern Africa under the card (framed further west, the
     Arabian Sea label then ran under the map key) */
  "The falcons of Nagaland":S=>VIEW(S,[72,10,1]),
  /* the cards of these two opened on the right, over the zoom buttons */
  "Monarch butterflies":S=>VIEW(S,[-95,35,1.8]),
  "The river of raptors":S=>VIEW(S,[-96,22,2.8]),
  /* the Adams River photo hung off the globe's right edge */
  "Salmon come home":S=>VIEW(S,[-140,56,1.8]),
  /* the card opened on the right, over Brazil's Abrolhos Bank; the Antarctic feeding grounds were below the screen. The
     Abrolhos label is shortened to clear the map key */
  "Humpback whales":S=>{RELABEL(S,/^Abrolhos Bank/,"Abrolhos, Brazil");VIEW(S,[-50,-26,1])},
  /* the card opened on the right and the Caribbean, where the 1988 swarms landed, was round the globe's edge */
  "Locust swarms":S=>VIEW(S,[-35,15,1.1]),
  /* Durban's label ran under the map key */
  "The sardine run":S=>VIEW(S,[27,-32,4])
 },
 crops:{
  /* five of the six photos (maize, potatoes, cacao, tomatoes in the Americas, bananas in New Guinea) were round the back
     of the globe or under the card; each crop has its own stop */
  "Where our food comes from":S=>{DROPPH(S,/^(Maize|Andean potatoes|Cacao pod|Bananas|Tomatoes)$/);VIEW(S,[55,25,1])},
  /* turned out from under the card, the globe lost China off its right edge, and the Saint Petersburg seed bank's label
     ran under the card: the Old World's centres are framed beside it (the sorting game, part 3, visits the Americas) */
  "Vavilov’s centres":S=>VIEW(S,[60,30,1]),
  /* a second "Mexico" label, besides the map's own, on a leader line */
  "Maize from teosinte":S=>DROP(S,/^Mexico$/),
  /* the Hemudu and Shangshan labels, the stop's oldest rice, lay under the map key */
  "Rice from the Yangtze":S=>VIEW(S,[122,24,2.3]),
  /* Ethiopia's teff and wild coffee were off the globe's right edge and the sorghum label under the map key; the Yemen
     coffee photo sat on the zoom buttons */
  "Africa’s crops and coffee":S=>{DROPPH(S,/^Coffee cherries, Yemen/);VIEW(S,[29,2,1.35])},
  /* a tour question flipped the card to the right, over the zoom buttons; the Côte d'Ivoire photo, half a world east,
     was off the screen (cocoa there has its own photo on Crops far from home) */
  "Chocolate from the Amazon":S=>{DROPPH(S,/^Opening cacao pods/);VIEW(S,[-77,-3,2.6])},
  /* Brazil's coffee and the Colombian coffee photo lay under the card; buttons (part 3) visit all five crops */
  "Crops far from home":S=>VIEW(S,[-15,5,1]),
  /* Réunion, where Albius found his trick, had its label under the map key */
  "Vanilla by hand":S=>VIEW(S,[53,-16,3.4]),
  /* the Aleppo seed bank, the vault's first withdrawal, lay under the map key */
  "A vault for seeds":S=>VIEW(S,[26,56,1.25])
 },
 capitals:{
  /* five of the seven photos were out of sight or in the way: Canberra round the back of the globe, the US Capitol, La
     Paz and Aso Rock under the card, the Naypyidaw pagoda on the zoom buttons and Ulaanbaatar by the search box. Each city has its own stop. Framed, so that index.html no longer tips the globe up to Siberia, the middle of the two
     photos left */
  "Capital cities":S=>{DROPPH(S,/^(Parliament House, Canberra|The US Capitol|Aso Rock, Abuja|Uppatasanti Pagoda|La Paz|Ulaanbaatar)/);VIEW(S,[45,30,1])},
  /* Nanjing and Hangzhou, where the capital and the Grand Canal came from, had their labels pushed off the bottom of the
     screen; a second "China" label, besides the map's own, hung on a long leader */
  "Beijing, guarding the north":S=>{DROP(S,/^China$/);RELABEL(S,/^Hangzhou/,"Hangzhou: the canal’s south end");VIEW(S,[124,34,2.4])},
  /* the Philadelphia and New York labels lay under the map key */
  "Washington, D.C.":S=>VIEW(S,[-74,38,4.5]),
  /* a second "Brazil" label, besides the map's own; the Rio label ran under the map key */
  "Brasília: built in 41 months":S=>{DROP(S,/^Brazil$/);VIEW(S,[-40,-19,2.8])},
  /* the Almaty label lay under the map key */
  "Astana on the steppe":S=>VIEW(S,[75,48,3.2]),
  /* the Bloemfontein label lay under the map key and the Johannesburg photo on the zoom buttons */
  "Three capitals":S=>VIEW(S,[30,-35,2.8])
 }
};
/* stops that keep the card where their own script put it */
const KEEPSIDE=new Set(/*KEEPSIDE*/[]);
const applied=new WeakSet();
/* stops whose photos geoflock-polish-m.js adds, with a getter of its own, when the stop is first shown: their fixes wait
   until it has (S._gfXp), or its defineProperty would fail on a field fixed here first and the stop would lose them */
const WAITXP=new Set([]);
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const t=strip(S.title);
 if(WAITXP.has(tour+"|"+t)&&!S._gfXp){LOCK(S,"card","left");return}applied.add(S);
 try{if(!KEEPSIDE.has(tour+"|"+t))LOCK(S,"card","left");const f=F[t];if(f)f(S)}catch(e){console.error("rvw fix",tour,S.title,e)}})}
/* Each stop's frame, by tour and title, read once from FIX at load (each fix run on a stand-in stop that has only its
   title), as geoflock-polish-rvt.js does: on a tour's very first launch index.html flies to the opening stop before the
   fixes are applied to it, so psGlobeTarget (wrapped below) also finds the frame by title. */
const FRAMES={};
for(const t in FIX)for(const k in FIX[t]){try{const D={title:k};FIX[t][k](D);const v=VIEWED.get(D);if(v)FRAMES[t+"|"+k]=v}catch(e){}}
const viewOf=S=>{const v=VIEWED.get(S);if(v)return v;try{return S&&ps&&ps.tour&&FRAMES[ps.tour+"|"+strip(S.title)]}catch(e){return null}};
/* index.html's wrapper of psGlobeTarget flies to the middle of all a stop's pins, photos and icons whenever more of them
   are in sight from there (as geoflock-polish-rvq.js found): a stop framed here (on the globe) gets exactly its frame */
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvw)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvw,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvw=1;window.psGlobeTarget=w}catch(e){}})(0);
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
/* geoflock-polish-b.js re-patches some stops with Object.defineProperty at load + 1.5 s and 4 s after it runs; a field
   fixed here before then would make those writes throw. So the fixes start once the page has settled (6 s), or as soon
   as one of these tours is opened, whichever comes first. */
let lastKey="",ready=false;
const start=()=>{if(ready)return;ready=true;applyAll()};
if(document.readyState==="complete")setTimeout(start,6000);else addEventListener("load",()=>setTimeout(start,6000));
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}if(!ready)start();lastKey=t+"|"+ps.i;applyTo(t,psSteps())}catch(e){}},300);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvk.js and -rvn.js do for theirs): psFlyGlobe (index.html) turns a
   stop's place out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain
   centre whenever it is more than 20° from it. So on these tours aim is told the stop is already aimed, and for eight
   seconds after a stop opens (counted in ticks of the check, not clock time: a tour's first launch can freeze the page
   for many seconds while its map loads, as geoflock-polish-rvt.js found), if the globe has come to rest away from where psFlyGlobe would put it, it flies there
   once more. A drag or zoom by the reader in that time cancels it, and so does a stop whose own buttons turn the globe. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const S=psSteps()[ps.i];if(S&&S.gfSun)return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=0;refl=0;touched=0}goAt++;ps._gfAimed=S;
 if(document.querySelector(".rvw-ctl[data-turned]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same eight seconds */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvw){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvw=1;window.psGo=w}catch(e){}})(0);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* the longest blue whale measured was 29.9 m; its maximum confirmed length is 29.9–30.5 m (Wikipedia, "Blue whale") */
  "ocean|The great whales":G("The blue whale is the biggest animal that has ever lived. How long can one grow?",5,60,30,"m",{step:1,show:"up to about 30 m"}),
  /* the stop's own figure: about 8,300 km between Antarctica and Costa Rica (Rasmussen et al., Biology Letters 2007,
     "Southern Hemisphere humpback whales wintering off Central America") */
  "amigration|Humpback whales":G("Some humpbacks swim each year between Antarctica and Costa Rica. How far is that, one way?",1000,15000,8300,"km",{step:100,show:"about 8,300 km"}),
  /* Edmond Albius, born about 1829, found the trick in 1841, aged about 12 (Wikipedia, "Edmond Albius") */
  "crops|Vanilla by hand":G("Vanilla flowers are still pollinated by hand, with a trick found on Réunion in 1841 by an enslaved boy, Edmond Albius. How old was he?",5,40,12,"",{step:1,show:"about 12 years old"}),
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvn.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in amGlobe.host,
   clipped to the globe's visible disc), and removes everything as soon as the stop changes or the tour ends.
   - ocean | "Kelp forests": buttons turn the globe to California, Chile, South Africa, Tasmania and Norway.
   - ocean | "Upwelling: where the fish are": buttons visit the four great upwelling zones.
   - ocean | "Into the deep": drag a submarine from the surface to Challenger Deep, past the light zones, a penguin's and
             a whale's deepest dives, the Titanic and the deepest fish.
   - amigration | "Wildebeest follow the rain": drag through the year (or play it) and watch the herds go round their loop.
   - amigration | "Now explore": pick an animal: the globe turns to its journey and draws it.
   - crops | "Vavilov’s centres": where was it first farmed? Sort eight crops; the globe turns to each one's birthplace.
   - crops | "Maize from teosinte": breed maize: each year keep the plant with the biggest cob, from a dozen seeds to 300.
   - crops | "Crops far from home": buttons visit where five crops grow most today, far from where they began.
   - capitals | "Now explore": which is the capital? Eight pairs, from Beijing or Nanjing to Naypyidaw or Yangon; each
                answer turns the globe to the capital. */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;if(!G._flat&&G.size){const z=G.size();if(z&&z.r&&Math.hypot(s[0]-z.w/2,s[1]-z.h/2)>z.r+1)return null}const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvw-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+esc(head)+"</b>":"")+"<span>"+esc(text)+"</span>";e.classList.remove("rvw-new");void e.offsetWidth;e.classList.add("rvw-new")}
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
 card:()=>'<div class="rvw-pool"></div><div class="rvw-order"></div><div class="rvw-row"><button type="button" class="rvw-btn rvw-undo">↶ Undo</button><button type="button" class="rvw-btn rvw-reset">↺ Start again</button></div>',
 init(L){L.pick=[];L.items=shuffle(o.items.map((x,i)=>i),o.seed||7)},
 wire(L){const c=L.card;c.querySelector(".rvw-undo").onclick=()=>{if(L.pick.length&&L.pick.length<o.items.length)L.pick.pop();this.render(L)};
  c.querySelector(".rvw-reset").onclick=()=>{L.pick=[];this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=o.items.length,done=L.pick.length===n;
  setHTML(c.querySelector(".rvw-pool"),done?"":L.items.filter(i=>!L.pick.includes(i)).map(i=>'<button type="button" class="rvw-chip" data-i="'+i+'">'+esc(o.items[i][0])+"</button>").join(""));
  c.querySelectorAll(".rvw-chip").forEach(b=>b.onclick=()=>{L.pick.push(+b.dataset.i);this.render(L)});
  let right=0;const rows=[];for(let k=0;k<n;k++){const i=L.pick[k];if(i==null){rows.push('<div class="rvw-slot rvw-empty"><em>'+(k+1)+'</em><span>'+(k===L.pick.length?"tap the "+(k===0?o.first:"next"):"")+"</span></div>");continue}
   const ok=done&&i===k;if(ok)right++;rows.push('<div class="rvw-slot'+(done?ok?" rvw-ok":" rvw-no":"")+'"><em>'+(k+1)+"</em><span>"+esc(o.items[i][0])+"</span>"+(done?"<b>"+esc(o.items[i][1])+(ok?"":' <i>(no. '+(i+1)+")</i>")+"</b>":"")+"</div>")}
  setHTML(c.querySelector(".rvw-order"),rows.join(""));c.querySelector(".rvw-undo").disabled=!L.pick.length||done;
  if(!L.pick.length)say(L,o.head,o.intro);else if(!done)say(L,"",o.items.length-L.pick.length+" to go");
  else say(L,right+" of "+n+" in the right place"+(right===n?"!":""),o.after)}}}

/* ---------------------------------------------------------------- TURN: buttons turn the globe from place to place */
function turnDef(tour,title,o){return{tour,title,globe:true,turn:true,tip:o.tip,
 card:()=>'<div class="rvw-row rvw-turn">'+o.places.map((f,i)=>'<button type="button" class="rvw-btn" data-i="'+i+'"></button>').join("")+'</div>',
 init(L){L.at=-1;L.t=0;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvw-ring"});L.tag=document.createElement("div");L.tag.className="rvw-tag rvw-new2";L.el.appendChild(L.tag)},
 tick(L,dt){L.t+=dt;if(L.at>=0)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){const f=L.at>=0?o.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;c.querySelectorAll(".rvw-turn button").forEach(b=>b.onclick=()=>{const f=o.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turned="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvw-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvw-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+o.places[k][0]});
  if(L.at<0)say(L,"",o.intro);else{const f=o.places[L.at];say(L,f[0],f[4])}}}}

/* ---------------------------------------------------------------- BIN: one item at a time; which kind is it?
   As in geoflock-polish-rvk.js, plus: an item may name a place ([lon, lat, zoom] as its fourth entry); once answered,
   the globe turns to it and a ring marks it, so farms half a world apart can each be seen beside the card. */
function binDef(tour,title,o){const placed=o.items.some(it=>it[3]);return{tour,title,globe:placed,turn:placed,tip:o.tip,
 card:()=>'<div class="rvw-q"><span class="rvw-n"></span><b class="rvw-item"></b></div><div class="rvw-row rvw-bins">'+o.keys.map(k=>'<button type="button" class="rvw-btn rvw-bin" data-k="'+k[0]+'">'+esc(k[1])+"</button>").join("")+'</div>'+
  '<div class="rvw-dots">'+o.items.map(()=>"<i></i>").join("")+'</div><div class="rvw-row"><button type="button" class="rvw-btn rvw-next" hidden>Next ▶</button><button type="button" class="rvw-btn rvw-again" hidden>Play again</button></div>',
 init(L){L.k=0;L.res=[];L.ans=null;L.t=0;L.at=null;if(L.svg){L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvw-ring"});L.ring.style.display="none";L.tag=document.createElement("div");L.tag.className="rvw-tag rvw-new2";L.tag.style.display="none";L.el.appendChild(L.tag)}},
 tick(L,dt){L.t+=dt;if(L.ring&&L.at)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){if(!L.ring)return;const f=L.at,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;
  c.querySelectorAll(".rvw-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=o.items.length)return;const it=o.items[L.k];L.ans=b.dataset.k;L.res[L.k]=L.ans===it[1];
   if(it[3]){const p=it[3];L.at=[p[3]||"",p[0],p[1]];c.dataset.turned="1";turnGlobe(p[0],p[1],p[2]);L.dirty=1}this.render(L)});
  c.querySelector(".rvw-next").onclick=()=>{L.k++;L.ans=null;L.at=null;L.dirty=1;this.render(L)};
  c.querySelector(".rvw-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;L.at=null;L.dirty=1;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=o.items.length,end=L.k>=N,it=o.items[Math.min(L.k,N-1)];
  c.querySelector(".rvw-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvw-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvw-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvw-right",!!L.ans&&b.dataset.k===it[1]);b.classList.toggle("rvw-wrong",!!L.ans&&b.dataset.k===L.ans&&L.ans!==it[1])});
  c.querySelectorAll(".rvw-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvw-ok":L.res[i]===false?"rvw-no":i===L.k&&!end?"rvw-at":"");
  const nx=c.querySelector(".rvw-next");nx.hidden=end||!L.ans;nx.textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvw-again").hidden=!end;
  const name=k=>(o.keys.find(x=>x[0]===k)||[,""])[1];
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": all right!":""),o.done)}
  else if(!L.ans)say(L,"",o.ask);
  else if(L.ans===it[1])say(L,"Right: "+name(it[1]),it[2]);
  else say(L,"Not quite: "+name(it[1]),it[2])}}}


/* ======================================================================== ocean */
/* The stop's kelp coasts. California, northern California and eastern Tasmania as the stop tells them; Chile's coast
   has giant kelp, Macrocystis, as California's does (Wikipedia, "Kelp forest": Macrocystis "occurs throughout the
   northeastern and southeastern Pacific Ocean"); My Octopus Teacher was filmed in a kelp forest in False Bay, near Cape
   Town, and won the Oscar for best documentary in 2021 (Wikipedia, "My Octopus Teacher"); in Norway a Norwegian study
   found up to 238 kinds of small animals living on Laminaria hyperborea, about 8,000 animals on one plant (Wikipedia,
   "Laminaria hyperborea") */
const KELP=turnDef("ocean","Kelp forests",{tip:"Kelp grows on cool coasts all round the world. Visit five of its forests.",
 intro:"Tap a coast to turn the globe to it.",
 places:[["California",-121.9,36.6,3,"In Monterey Bay sea otters dive for urchins among giant kelp. Further north, after the 2014 heatwave, over 90% of the bull kelp was lost."],
  ["Chile",-73.6,-41.5,3,"The same giant kelp as California’s lines Chile’s cold southern coast."],
  ["South Africa",18.6,-34.2,3.4,"A diver’s year with an octopus in this kelp forest, in False Bay near Cape Town, became My Octopus Teacher, which won an Oscar in 2021."],
  ["Tasmania",148.2,-42.5,3.4,"Eastern Tasmania has lost about 95% of its giant kelp."],
  ["Norway",12,66,2.6,"A different kelp grows here. Scientists found up to 238 kinds of small animals living on it, about 8,000 on one plant."]]});
/* The four great upwelling zones, as the stop names them. Monterey's sardine catch peaked at 142,282 tons in 1946 and
   fell to 26,818 tons the next year; by 1958 the canneries packed tuna, anchovy and mackerel instead (Wikipedia,
   "Cannery Row"). The Canary Current cools the coasts of Morocco and Western Sahara (Wikipedia, "Canary Current").
   Peru and Namibia as the stop and the next one tell them */
const UPWELL=turnDef("ocean","Upwelling: where the fish are",{tip:"Four cold coasts feed the world’s biggest fisheries. Visit each.",
 intro:"Tap an upwelling zone to turn the globe to it.",
 places:[["California",-123,38,2.4,"Upwelling fed Monterey’s sardine boom. The catch peaked in 1946, then crashed within a year, and the canneries closed one by one."],
  ["Humboldt: Peru and Chile",-77,-12,2.4,"The richest of all: Peru’s anchoveta, the next stop, is the biggest catch of any single kind of fish."],
  ["Canary: north-west Africa",-17,22,2.4,"Cold water rising off Morocco and Western Sahara keeps these desert coasts cool much of the year."],
  ["Benguela: Namibia",14,-23,2.4,"Seals and seabirds crowd a cold, rich sea beside one of the driest deserts on Earth, the Namib."]]});
/* Dive: the ocean's depth zones and how deep things go. Zones: sunlight to about 200 m, twilight to about 1,000 m,
   midnight to about 4,000 m, the abyss to about 6,000 m, the hadal zone below, in trenches (Wikipedia, "Pelagic
   zone"); pressure rises by about 1 atmosphere every 10 m and the water is about 5–6 °C at 1,000 m (Wikipedia, "Deep
   sea"); an emperor penguin dived to 564 m in 1994 (Wikipedia, "Emperor penguin"); a Cuvier's beaked whale to 2,992 m
   off California, the deepest dive of any mammal recorded (Schorr et al., PLOS ONE 2014; Wikipedia, "Cuvier's beaked
   whale"); the Titanic lies at about 3,800 m (Wikipedia, "Wreck of the Titanic"); the average depth, the snailfish
   and Challenger Deep are the stop's own */
const DIVE_MARKS=[[200,"The sunlight runs out","Below about 200 m there is too little light for plants to grow.","☀️"],
 [564,"An emperor penguin’s deepest dive","564 m, recorded in 1994.","🐧"],
 [1000,"Total darkness","No sunlight at all from here down, and the water is only about 5 °C.","🌑"],
 [2992,"The deepest-diving mammal","A Cuvier’s beaked whale dived to 2,992 m off California in 2014.","🐋"],
 [3700,"The average depth of the ocean","About 3,700 m: most of the sea floor lies around here.","〰️"],
 [3800,"The Titanic","The wreck lies about 3,800 m down.","🚢"],
 [6000,"The trenches begin","Below about 6,000 m is the hadal zone, found only in trenches.","🕳️"],
 [8336,"The deepest fish ever filmed","A snailfish, filmed in 2022 in a trench off Japan.","🐟"],
 [10935,"Challenger Deep","The deepest point on Earth: the bottom of the Mariana Trench.","⚓"]];
const DIVE_ZONES=[[0,"Sunlight zone","Sunlight"],[200,"Twilight zone","Twilight"],[1000,"Midnight zone","Midnight"],[4000,"The abyss","Abyss"],[6000,"The trenches (hadal zone)","Trenches"]];
const DMAX=10935,dPos=d=>Math.sqrt(d/DMAX),dOf=p=>Math.round(p*p*DMAX);
const DIVE={tour:"ocean",title:"Into the deep",globe:false,tip:"Drag the sub down. How deep can you go before the light runs out?",
 card:()=>'<div class="rvw-dive"><svg class="rvw-col" viewBox="0 0 300 180" role="img" aria-label="The ocean, top to bottom"></svg>'+
  '<div class="rvw-sl"><input type="range" class="rvw-dep" min="0" max="1000" step="1" value="0" aria-label="Depth"><b class="rvw-dv"></b></div>'+
  '<div class="rvw-row"><button type="button" class="rvw-btn rvw-up">▲ Back up</button><button type="button" class="rvw-btn rvw-down">Dive to the next ▼</button></div></div>',
 init(L){L.d=0},
 wire(L){const c=L.card,r=c.querySelector(".rvw-dep");r.oninput=()=>{L.d=dOf(+r.value/1000);this.render(L)};
  c.querySelector(".rvw-down").onclick=()=>{const m=DIVE_MARKS.find(x=>x[0]>L.d+1);L.d=m?m[0]:DMAX;r.value=Math.round(dPos(L.d)*1000);this.render(L)};
  c.querySelector(".rvw-up").onclick=()=>{L.d=0;r.value=0;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const d=L.d,y=v=>8+dPos(v)*164,hit=DIVE_MARKS.filter(x=>d>=x[0]).pop();
  /* the water darkens with depth: light falls to nothing by 1,000 m */
  let h='<defs><linearGradient id="rvwSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb4e6"/><stop offset="'+dPos(200).toFixed(3)+'" stop-color="#1d6fa5"/><stop offset="'+dPos(1000).toFixed(3)+'" stop-color="#0b2a4a"/><stop offset="1" stop-color="#02060d"/></linearGradient></defs>';
  h+='<rect x="0" y="8" width="300" height="164" rx="6" fill="url(#rvwSea)"/>';
  DIVE_ZONES.forEach((z,i)=>{if(i)h+='<line x1="0" x2="300" y1="'+y(z[0]).toFixed(1)+'" y2="'+y(z[0]).toFixed(1)+'" class="rvw-zl"/>';h+='<text x="5" y="'+(y(z[0])+12).toFixed(1)+'" class="rvw-zt'+(d>=z[0]&&(!DIVE_ZONES[i+1]||d<DIVE_ZONES[i+1][0])?" rvw-zon":"")+'">'+z[2]+'</text>'});
  DIVE_MARKS.forEach((m,i)=>{const yy=y(m[0]),on=d>=m[0],x=[250,270,290][i%3];if(m===hit)h+='<circle cx="'+x+'" cy="'+yy.toFixed(1)+'" r="9" class="rvw-hit"/>';h+='<text x="'+x+'" y="'+(yy+4.5).toFixed(1)+'" font-size="13" text-anchor="middle" class="rvw-em" opacity="'+(on?1:.4)+'">'+m[3]+'</text>'});
  const sy=y(d);h+='<line x1="120" x2="120" y1="8" y2="'+sy.toFixed(1)+'" class="rvw-cab"/><g transform="translate(120,'+sy.toFixed(1)+')"><ellipse rx="15" ry="7" class="rvw-sub"/><circle cx="6" r="2.6" class="rvw-win"/>'+(d>200?'<path d="M15 0 L75 -13 L75 13Z" class="rvw-beam"/>':"")+'</g>';
  const z=DIVE_ZONES.filter(x=>d>=x[0]).pop();
  setHTML(c.querySelector(".rvw-col"),h);
  const atm=Math.round(1+d/10);c.querySelector(".rvw-dv").textContent=d.toLocaleString("en-GB")+" m";
  const m=hit;
  if(!d)say(L,"At the surface","Drag the slider, or dive from one record to the next.");
  else say(L,m?m[1]:z[1],(m?m[2]+" ":"")+"The water presses "+atm.toLocaleString("en-GB")+" times as hard as the air at the surface.")}};

/* ======================================================================== amigration */
/* The herds' year, month by month, along the stop's own loop (its lines and pins). Calving on the south-eastern short-
   grass plains from January to March, about 500,000 calves in two to three weeks around February; north-west towards
   the Grumeti River in May, staying until late June; the Grumeti and Mara river crossings from July; in Kenya from late
   July or August through the dry season; back south with the short rains in early November, reaching the plains by
   December; about 250,000 die on the roughly 800 km journey (Wikipedia, "Serengeti", The Great Migration) */
const HERD=[[35,-3,"January: the southern plains","The herds gather on the short-grass plains of the southern Serengeti as the rains bring fresh grass."],
 [35,-3,"February: calving","About half a million calves are born within two to three weeks."],
 [35,-3,"March: still calving","Calving goes on from January to March, on the rain-ripened grass."],
 [34.5,-2.6,"April: moving west","The herds begin to move west."],
 [34.1,-2.15,"May: the western corridor","Herds stretching for kilometres head north-west, towards the Grumeti River."],
 [34.1,-2.15,"June: by the Grumeti","They stay here until late June."],
 [34.4,-1.7,"July: north to Kenya","The Grumeti and Mara river crossings begin as the herds head north into Kenya."],
 [35.03,-1.55,"August: the Mara River","The most dangerous crossings of all: crocodiles wait in the water."],
 [35,-1.5,"September: the Maasai Mara","The herds spend the dry season in Kenya’s Maasai Mara."],
 [35,-1.5,"October: the Maasai Mara","Still in Kenya, through the dry season."],
 [35.25,-1.9,"November: turning south","The short rains begin and the herds turn back south."],
 [35.1,-2.8,"December: home again","They reach the southern plains, in time for the calves in February. The loop is about 800 km."]];
const WILDE={tour:"amigration",title:"Wildebeest follow the rain",globe:true,tip:"Drag through the year and follow the herds round their loop.",
 card:()=>'<div class="rvw-sl"><input type="range" class="rvw-mon" min="0" max="11" step="1" value="0" aria-label="Month"><b class="rvw-mv"></b></div>'+
  '<div class="rvw-row"><button type="button" class="rvw-btn rvw-play">▶ Play the year</button></div>',
 init(L){L.m=0;L.t=0;L.pos=[HERD[0][0],HERD[0][1]];L.dots=[];for(let i=0;i<14;i++)L.dots.push(svgEl(L.svg,"circle",{r:"3.4",class:"rvw-gnu"}));
  L.tag=document.createElement("div");L.tag.className="rvw-tag";L.el.appendChild(L.tag)},
 off(L){clearInterval(L.play)},
 tick(L,dt){L.t+=dt;const T=HERD[L.m],k=Math.min(1,dt*3);L.pos=[L.pos[0]+(T[0]-L.pos[0])*k,L.pos[1]+(T[1]-L.pos[1])*k];L.dirty=1},
 draw(L){const q=proj(L,L.pos),qq=proj(L,L.pos,1);
  L.dots.forEach((d,i)=>{if(!q){d.style.display="none";return}d.style.display="";const a=i*2.4+L.t*.8,r=4+((i*7)%13)*1.3;
   d.setAttribute("cx",(q[0]+Math.cos(a)*r).toFixed(1));d.setAttribute("cy",(q[1]+Math.sin(a)*r*.7).toFixed(1))});
  if(qq){L.tag.style.display="";const t=HERD[L.m][2].split(":")[0];if(L.tag._h!==t){L.tag.textContent=t;L.tag._h=t}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+20)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card,r=c.querySelector(".rvw-mon"),pb=c.querySelector(".rvw-play");
  r.oninput=()=>{clearInterval(L.play);L.play=0;pb.textContent="▶ Play the year";L.m=+r.value;this.render(L)};
  pb.onclick=()=>{if(L.play){clearInterval(L.play);L.play=0;pb.textContent="▶ Play the year";return}pb.textContent="❚❚ Pause";if(L.m===11)L.m=-1;
   const step=()=>{if(!c.isConnected){clearInterval(L.play);return}L.m++;r.value=L.m;this.render(L);if(L.m>=11){clearInterval(L.play);L.play=0;pb.textContent="▶ Play again"}};step();L.play=setInterval(step,1600)};
  this.render(L)},
 render(L){const c=L.card;if(!c)return;const H=HERD[L.m];c.querySelector(".rvw-mv").textContent=H[2].split(":")[0];say(L,H[2],H[3])}};
/* "Pick an animal": the tour's journeys, each drawn from its own stop's lines (and that stop's figures, sourced there) */
const ANIMALS=[["Arctic tern","The Arctic tern",[-25,10,1],"About 70,000 km a year, Greenland to Antarctica and back."],
 ["Bar-tailed godwit","The godwit’s non-stop flight",[-172,6,1],"About 13,500 km from Alaska to Tasmania in 11 days, without landing."],
 ["Humpback whale","Humpback whales",[-50,-26,1],"About 8,300 km from Antarctica to Costa Rica."],
 ["Amur falcon","The falcons of Nagaland",[72,10,1],"From north-east Asia to southern Africa, non-stop over the Arabian Sea."],
 ["Monarch butterfly","Monarch butterflies",[-95,35,1.8],"Up to about 4,000 km to a few mountains in Mexico."],
 ["European eel","Eels to the Sargasso Sea",[-30,38,1.5],"Up to 6,000 km from Europe’s rivers to the Sargasso Sea."],
 ["Desert locust","Locust swarms",[-35,15,1.1],"In 1988, about 5,000 km across the Atlantic on the trade winds."],
 ["Salmon","Salmon come home",[-140,56,1.8],"From the ocean back to the very stream where they hatched."],
 ["Caribou","Caribou on the tundra",[-141,67,4],"More than 1,000 km a year, to calve by the Arctic Ocean."],
 ["Wildebeest","Wildebeest follow the rain",[35.2,-2.1,11],"A loop of about 800 km round the Serengeti and the Maasai Mara."]];
const PICK={tour:"amigration",title:"Now explore",globe:true,turn:true,tip:"Pick an animal to see its journey, then hover the countries on its route.",
 card:()=>'<div class="rvw-row rvw-turn">'+ANIMALS.map((a,i)=>'<button type="button" class="rvw-btn" data-i="'+i+'">'+esc(a[0])+'</button>').join("")+'</div>',
 init(L){L.at=-1;L.t=0;L.g=svgEl(L.svg,"g",{});L.paths=[]},
 tick(L,dt){L.t+=dt;if(L.paths.length){L.paths.forEach(p=>p.style.strokeDashoffset=String(-(L.t*30)%24))}},
 draw(L){const G=g();if(L.at<0||!G)return;try{const P=G.projection(),gp=d3.geoPath(P);L.g.setAttribute("transform","translate("+L.ox+","+L.oy+")");
  L.lines.forEach((ln,i)=>{const d=gp({type:"LineString",coordinates:ln})||"";L.paths[i].setAttribute("d",d)})}catch(e){}},
 wire(L){const c=L.card;c.querySelectorAll(".rvw-turn button").forEach(b=>b.onclick=()=>{const k=+b.dataset.i,a=ANIMALS[k];L.at=k;c.dataset.turned="1";
   let lines=[];try{const S=PS_TOURS.amigration.steps.find(x=>strip(x.title)===a[1]);lines=(S&&S.lines||[]).filter(x=>x&&Array.isArray(x.coords)).map(x=>x.coords)}catch(e){}
   L.lines=lines;L.g.innerHTML="";L.paths=lines.map(()=>svgEl(L.g,"path",{class:"rvw-route"}));turnGlobe(a[2][0],a[2][1],a[2][2]);L.dirty=1;this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvw-turn button").forEach(b=>b.classList.toggle("rvw-cur",+b.dataset.i===L.at));
  if(L.at<0)say(L,"","Tap an animal: the globe turns to its journey.");else{const a=ANIMALS[L.at];say(L,a[0],a[3])}}};

/* ======================================================================== crops */
/* Where each crop was first farmed, as the tour's own stops tell it (each stop gives its source): maize in Mexico's
   Balsas valley, potatoes by Lake Titicaca, wheat at Karacadağ and lentils in the Fertile Crescent, rice on the lower
   Yangtze, bananas at Kuk Swamp in New Guinea, sorghum in eastern Sudan, coffee in Ethiopia's Kaffa. Answers are mixed
   so that taking turns cannot win. */
const ORIGIN=binDef("crops","Vavilov’s centres",{tip:"Where was it first farmed? Sort eight crops; the globe turns to each one’s birthplace.",
 keys:[["a","🌎 The Americas"],["f","🌾 Fertile Crescent"],["af","🌍 Africa"],["as","🌏 Asia and New Guinea"]],ask:"Where was this crop first farmed?",
 items:[["Maize","a","Mexico: farmers in the Balsas River valley bred it from teosinte, a wild grass, about 9,000 years ago.",[-100.5,18.3,3.4,"Balsas valley"]],
  ["Wheat","f","The Fertile Crescent: einkorn wheat was first farmed in the Karacadağ hills of south-east Turkey.",[39.8,37.7,3.4,"Karacadağ"]],
  ["Coffee","af","Ethiopia: Arabica coffee grows wild in the mountain forests of Kaffa.",[36.2,7.3,3.4,"Kaffa"]],
  ["Rice","as","China: rice was tamed from wild rice on the lower Yangtze about 9,000 years ago.",[121.35,30.02,3.2,"Hemudu"]],
  ["Potatoes","a","The Andes: tamed near Lake Titicaca over 7,000 years ago.",[-69.3,-15.9,3.4,"Lake Titicaca"]],
  ["Bananas","as","New Guinea: people at Kuk Swamp were farming bananas about 7,000 years ago.",[144.33,-5.78,3.4,"Kuk Swamp"]],
  ["Sorghum","af","Africa: tamed on the plains of eastern Sudan about 5,000 years ago.",[36,15,3.2,"Eastern Sudan"]],
  ["Lentils","f","The Fertile Crescent, with wheat, barley, peas and chickpeas, about 10,500 years ago.",[38.4,35.87,3.4,"Abu Hureyra"]]],
 done:"Most crops began in a few hilly regions, the centres Vavilov mapped, far from today’s great farm belts."});
/* Breed maize: a game of choosing, not real numbers. Teosinte's 'cob' held about a dozen hard seeds and a maize cob
   holds hundreds of kernels (the stop's own figures); in between, each round shows six plants grown from the last
   pick, varying around it, and the reader keeps the best. */
const MAIZE={tour:"crops",title:"Maize from teosinte",globe:false,tip:"Be an early farmer: each year, keep the seeds of the plant with the biggest cob. Can you breed maize?",
 card:()=>'<div class="rvw-cobs"></div><div class="rvw-row"><span class="rvw-gen"></span><button type="button" class="rvw-btn rvw-again2" hidden>Start again</button></div>',
 init(L){L.best=12;L.n=0;L.seed=11;L.hist=[12]},
 roll(L){let s=(L.seed=(L.seed*1664525+1013904223)>>>0);const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
  L.cobs=Array.from({length:6},()=>Math.max(6,Math.round(L.best*(.78+r()*.6))))},
 wire(L){const c=L.card;this.roll(L);c.querySelector(".rvw-again2").onclick=()=>{this.init(L);this.roll(L);this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const done=L.best>=300;
  const cob=k=>{const h=Math.min(46,10+Math.sqrt(k)*2.1),w=Math.min(18,5+Math.sqrt(k)*.7),rows=Math.max(1,Math.round(Math.sqrt(k)/2.2));
   let dots="";const per=Math.ceil(k/rows),cap=Math.min(per,26);for(let j=0;j<rows&&j<8;j++)for(let i=0;i<cap;i++)dots+='<circle cx="'+(10-w/2+(j+.5)*w/Math.min(rows,8)).toFixed(1)+'" cy="'+(52-h+(i+.5)*h/cap).toFixed(1)+'" r="'+Math.max(.7,Math.min(1.8,w/Math.min(rows,8)/2.4)).toFixed(2)+'" fill="#f2c230"/>';
   return '<svg viewBox="0 0 20 56" width="22" height="56"><path d="M10 56 V'+(54-h).toFixed(1)+'" stroke="#6f8f4a" stroke-width="1.5"/><ellipse cx="10" cy="'+(53-h/2).toFixed(1)+'" rx="'+(w/2).toFixed(1)+'" ry="'+(h/2).toFixed(1)+'" fill="#d9a21a" stroke="#7a4a12" stroke-width=".8"/>'+dots+'</svg>'};
  setHTML(c.querySelector(".rvw-cobs"),done?"":L.cobs.map((k,i)=>'<button type="button" class="rvw-cob" data-i="'+i+'">'+cob(k)+"<b>"+k+"</b></button>").join(""));
  c.querySelectorAll(".rvw-cob").forEach(b=>b.onclick=()=>{L.best=L.cobs[+b.dataset.i];L.n++;L.hist.push(L.best);this.roll(L);this.render(L)});
  c.querySelector(".rvw-gen").textContent=L.n?"Year "+L.n+" of your farm · best cob so far: "+Math.max(...L.hist)+" seeds":"Each plant’s number is the seeds on its cob.";
  c.querySelector(".rvw-again2").hidden=!L.n;
  if(done)say(L,"You bred maize: "+L.best+" seeds a cob, from teosinte’s dozen, in "+L.n+" years","Real farmers took thousands of years. And the maize they made can no longer survive without people to plant it.");
  else if(!L.n)say(L,"Teosinte: about a dozen hard seeds","Tap the plant whose cob has the most seeds. Its seeds are next year’s crop.");
  else say(L,L.best>L.hist[L.hist.length-2]?"Bigger!":"Smaller this year","Plants vary, and seeds take after their parents. Keep picking the biggest; aim for 300 seeds a cob.")}};
/* Each crop and where it grows most today, as the tour's stops tell it */
const FAR=turnDef("crops","Crops far from home",{tip:"Each of these crops is grown most a long way from where it began. Visit them.",
 intro:"Tap a crop to turn the globe to where most of it grows today.",
 places:[["Cassava: Nigeria",8,8,2.6,"Cassava came from the Amazon. It became a staple of Africa, and Nigeria now grows the most."],
  ["Coffee: Brazil",-45.5,-21.5,2.6,"Coffee came from Ethiopia. Brazil now grows about a third of the world’s coffee."],
  ["Cocoa: Côte d’Ivoire",-6,6.5,2.8,"Cacao came from the Amazon. About 40% of the world’s cocoa is now grown in Côte d’Ivoire."],
  ["Potatoes: China",105,35,2.4,"Potatoes came from the Andes. China now grows the most."],
  ["Bananas: India",78,20,2.6,"Bananas were first farmed in New Guinea. India now grows the most."]]});

/* ======================================================================== capitals */
/* Which is the capital? Eight pairs from the tour's own stops (each gives its source). The capital is first or second
   in no regular pattern; once answered, the globe turns to the capital */
const PAIRS=[["China","Beijing","Nanjing",0,[116.4,39.9,3],"Beijing, since the Ming emperor Yongle moved the capital from Nanjing in 1421."],
 ["Russia","St Petersburg","Moscow",1,[37.62,55.75,3.2],"Moscow, again since 1918. St Petersburg was the capital for about two centuries before that."],
 ["Australia","Sydney","Canberra",1,[149.13,-35.28,3.4],"Canberra, built between Sydney and Melbourne, the two rivals."],
 ["Canada","Ottawa","Toronto",0,[-75.7,45.42,3.4],"Ottawa, chosen by Queen Victoria in 1857. Toronto is about four times bigger."],
 ["Brazil","Rio de Janeiro","Brasília",1,[-47.88,-15.79,3.2],"Brasília, since 1960. Rio, on the coast, was the capital until then."],
 ["Nigeria","Lagos","Abuja",1,[7.49,9.06,3.4],"Abuja, since 1991. Lagos is still the biggest city."],
 ["Kazakhstan","Astana","Almaty",0,[71.43,51.13,3.2],"Astana, since 1997. Almaty, in a corner by the mountains, was the capital before."],
 ["Myanmar","Naypyidaw","Yangon",0,[96.13,19.75,3.4],"Naypyidaw, since 2005. Yangon is still the largest city."]];
const PAIR={tour:"capitals",title:"Now explore",globe:true,turn:true,tip:"Which is the capital? Eight countries whose capital is not the city you might expect.",
 card:()=>'<div class="rvw-q"><span class="rvw-n"></span><b class="rvw-item"></b></div><div class="rvw-row rvw-bins"><button type="button" class="rvw-btn rvw-bin" data-k="0"></button><button type="button" class="rvw-btn rvw-bin" data-k="1"></button></div>'+
  '<div class="rvw-dots">'+PAIRS.map(()=>"<i></i>").join("")+'</div><div class="rvw-row"><button type="button" class="rvw-btn rvw-next" hidden>Next ▶</button><button type="button" class="rvw-btn rvw-again" hidden>Play again</button></div>',
 init(L){L.k=0;L.res=[];L.ans=null;L.t=0;L.at=null;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvw-ring"});L.ring.style.display="none";L.tag=document.createElement("div");L.tag.className="rvw-tag rvw-new2";L.tag.style.display="none";L.el.appendChild(L.tag)},
 tick(L,dt){L.t+=dt;if(L.at)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){const f=L.at,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  if(qq){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;
  c.querySelectorAll(".rvw-bin").forEach(b=>b.onclick=()=>{if(L.ans!=null||L.k>=PAIRS.length)return;const P=PAIRS[L.k];L.ans=+b.dataset.k;L.res[L.k]=L.ans===P[3];
   const p=P[4];L.at=[P[1+P[3]],p[0],p[1]];c.dataset.turned="1";turnGlobe(p[0],p[1],p[2]);L.dirty=1;this.render(L)});
  c.querySelector(".rvw-next").onclick=()=>{L.k++;L.ans=null;L.at=null;L.dirty=1;this.render(L)};
  c.querySelector(".rvw-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;L.at=null;L.dirty=1;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=PAIRS.length,end=L.k>=N,P=PAIRS[Math.min(L.k,N-1)];
  c.querySelector(".rvw-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvw-item").textContent=end?"":"The capital of "+P[0]+"?";
  c.querySelectorAll(".rvw-bin").forEach(b=>{const k=+b.dataset.k;b.hidden=end;b.textContent=P[1+k];b.disabled=L.ans!=null;b.classList.toggle("rvw-right",L.ans!=null&&k===P[3]);b.classList.toggle("rvw-wrong",L.ans!=null&&k===L.ans&&L.ans!==P[3])});
  c.querySelectorAll(".rvw-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvw-ok":L.res[i]===false?"rvw-no":i===L.k&&!end?"rvw-at":"");
  const nx=c.querySelector(".rvw-next");nx.hidden=end||L.ans==null;nx.textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvw-again").hidden=!end;
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": all right!":""),"In each of these countries the biggest or best-known city is not the capital. Hover any country on the map to see its capital.")}
  else if(L.ans==null)say(L,"","Tap the city you think is the capital.");
  else say(L,(L.ans===P[3]?"Right: ":"Not quite: ")+P[1+P[3]],P[5])}};

const DEFS=[KELP,UPWELL,DIVE,WILDE,PICK,ORIGIN,MAIZE,FAR,PAIR];
/* ---------------------------------------------------------------- the engine: one stop at a time */
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tour===ps.tour&&d.title===t);if(!D)return null;if((D.globe||D.turn)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvw-layer";el.innerHTML='<svg class="rvw-sv"><defs><clipPath id="rvwClip"><path class="rvw-clipp" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvwClip)"></g></svg>';host.appendChild(el);
  L.el=el;L.root=el.querySelector("svg");L.svg=el.querySelector("g");L.clipP=el.querySelector(".rvw-clipp")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}lastT=0;if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvw-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvw-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvw-ctl";
 c.innerHTML='<div class="rvw-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvw-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvw-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvw-field{display:block;width:100%;height:auto;border-radius:8px;margin:2px 0 4px}.rvw-cous{fill:#cfe3b0;stroke:#6f8f4a;stroke-width:1}.rvw-mine{fill:#d9682b;stroke:#7a3410;stroke-width:1.5}
.rvw-heirs span{font-size:12.5px;font-weight:700;opacity:.75}
.rvw-route{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:6 5;opacity:.7}
.rvw-trail{fill:none;stroke:#d9a21a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.rvw-green{fill:#4c9a3a;stroke:#fff;stroke-width:2}.rvw-gold{fill:#f2c230;stroke:#7a4a12;stroke-width:2}
.rvw-cmb{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvw-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvw-sv{position:absolute;left:0;top:0;overflow:visible}
.rvw-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none;background:rgba(255,255,255,.95);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvw-tag.rvw-new2{background:#13294b;color:#fff}
.rvw-ring{fill:rgba(255,209,102,.35);stroke:#d9682b;stroke-width:3}
.rvw-dot{fill:#ffd166;stroke:#13294b;stroke-width:2.5}.rvw-stop{fill:#c2364f;stroke:#fff;stroke-width:2.5}
.rvw-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvw-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvw-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvw-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvw-btn[hidden]{display:none}.rvw-btn:disabled{cursor:default;opacity:.55}
.rvw-btn.rvw-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvw-btn.rvw-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvw-btn.rvw-cur{background:#13294b;color:#fff;border-color:#13294b}
.rvw-pool{display:flex;flex-wrap:wrap;gap:6px}.rvw-pool:empty{display:none}
.rvw-chip{border:1px solid #d9682b;background:#fff4ec;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvw-chip:hover{background:#d9682b;color:#fff}
.rvw-order{display:flex;flex-direction:column;gap:3px;margin-top:8px}
.rvw-slot{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 8px;border-radius:8px;background:rgba(19,41,75,.06);min-height:24px}
.rvw-slot em{font-style:normal;font-weight:800;width:16px;opacity:.6}.rvw-slot span{flex:1 1 auto;font-weight:700}.rvw-slot b{font-weight:700;font-size:12.5px;white-space:nowrap}.rvw-slot b i{font-style:normal;opacity:.8}
.rvw-slot.rvw-empty span{font-weight:500;opacity:.6;font-style:italic}
.rvw-slot.rvw-ok{background:rgba(31,138,76,.16)}.rvw-slot.rvw-no{background:rgba(194,54,79,.13)}
.rvw-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 4px;min-height:1.4em}.rvw-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvw-item{font-size:15.5px;color:#13294b;line-height:1.3}
.rvw-dots{display:flex;gap:4px;margin-top:8px}.rvw-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvw-dots i.rvw-ok{background:#1f8a4c}.rvw-dots i.rvw-no{background:#c2364f}.rvw-dots i.rvw-at{box-shadow:0 0 0 2px #ffd166}
.rvw-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvw-ep b{display:block;font-size:15px}
.rvw-ep.rvw-new{animation:rvwIn .45s ease}@keyframes rvwIn{from{opacity:.2;transform:translateY(4px)}}
.rvw-sl{display:flex;align-items:center;gap:10px;margin-top:4px}.rvw-sl input{flex:1 1 auto;accent-color:#d9682b}.rvw-sl b{min-width:64px;text-align:right;font-size:17px;color:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvw-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvw-do,:is(body.dark-theme,body.sky-night) .rvw-sl b{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvw-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvw-n{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvw-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvw-btn.rvw-cur{background:#ffb27a;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvw-chip{background:rgba(217,104,43,.18);color:#ffd2b3;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvw-slot{background:rgba(255,255,255,.07)}
:is(body.dark-theme,body.sky-night) .rvw-slot.rvw-ok{background:rgba(31,138,76,.35)}:is(body.dark-theme,body.sky-night) .rvw-slot.rvw-no{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvw-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}


/* night: the answer colours must outrank the plain night button style above them (as geoflock-polish-rvl.js does) */
{const s=document.createElement("style");s.textContent=`
:is(body.dark-theme,body.sky-night) .rvw-btn.rvw-right{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rvw-btn.rvw-wrong{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvw-dots i.rvw-ok{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvw-dots i.rvw-no{background:#ff7088}
:is(body.dark-theme,body.sky-night) .rvw-dots i.rvw-at{box-shadow:0 0 0 2px #ffb27a}
:is(body.dark-theme,body.sky-night) .rvw-tag{background:#13294b;color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.4)}
.rvw-rc{display:grid;gap:4px}.rvw-rc label{font-size:12.5px;font-weight:700;color:#13294b}.rvw-rc label b{font-weight:600;color:#5b6b7c}.rvw-rc input{width:100%;accent-color:#d9682b}
.rvw-rbars{display:block;width:100%;height:auto;margin-top:6px}.rvw-rt{font:700 11px system-ui,sans-serif;fill:#13294b}.rvw-rv{fill:#9a4a16}.rvw-r2{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3;opacity:.6}.rvw-r2t{font-weight:600;font-size:9.5px;opacity:.7}
:is(body.dark-theme,body.sky-night) .rvw-rc label{color:#fff}:is(body.dark-theme,body.sky-night) .rvw-rc label b{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rvw-rt{fill:#e8eef7}:is(body.dark-theme,body.sky-night) .rvw-rv{fill:#ffb27a}:is(body.dark-theme,body.sky-night) .rvw-r2{stroke:#e8eef7}
`;document.head.appendChild(s)}
/* ======================================================================== part 4: the map's banner
   As geoflock-polish-rvp.js does, but checked against everything near it at once: a long banner ran under the map key
   in the top right corner, or under the search box. On these tours it slides sideways to the nearest spot clear of the
   key, the search box and the card; where there is none (a wide key beside the card), it rises into the gap between
   the map's switches and the search box, clear of both. It is put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;if(b.style.translate&&bannerMoved!==b)return;b.style.translate="";bannerMoved=null;
 const B=b.getBoundingClientRect(),R=e=>e&&e.offsetWidth?e.getBoundingClientRect():null;
 const key=R(document.querySelector(".ps-mapkey.at-right")),srch=R(document.getElementById("globalSearchInput")),card=R(ps.card);
 const over=(K,dx,dy)=>K&&B.right+dx>K.left-6&&B.left+dx<K.right+6&&B.bottom+dy>K.top-3&&B.top+dy<K.bottom+3;
 /* it moves only when it is under the key or the search box; where it may go, it must also clear the card and the map's
    switches */
 if(!over(key,0,0)&&!over(srch,0,0))return;
 const obs=[key,srch,card].concat([...document.querySelectorAll(".all-maps-label-controls label, .all-maps-label-controls .lf-control")].map(R)).filter(Boolean);
 const hit=(dx,dy)=>obs.some(K=>over(K,dx,dy))||B.left+dx<4||B.right+dx>innerWidth-4;
 let best=null;const dys=[0];if(key)dys.push(Math.min(0,key.top-4-B.bottom));
 for(const dy of dys){const xs=[0];obs.forEach(K=>{xs.push(K.left-7-B.right,K.right+7-B.left)});
  xs.forEach(dx=>{if(hit(dx,dy))return;const cost=Math.abs(dx)+Math.abs(dy)*3;if(!best||cost<best[2])best=[dx,dy,cost]})}
 if(!best)return;b.style.translate=Math.round(best[0])+"px "+Math.round(best[1])+"px";bannerMoved=b}catch(e){}},400);

{const s=document.createElement("style");s.textContent=`
.rvw-gen{display:block;width:100%;height:auto;margin-top:8px}.rvw-gt{font:700 10.5px system-ui,sans-serif;fill:#5b6b7c}.rvw-gn{font-size:13px;fill:#13294b}
:is(body.dark-theme,body.sky-night) .rvw-gt{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvw-gn{fill:#fff}
:is(body.dark-theme,body.sky-night) .rvw-gen circle[fill="#13294b"]{fill:#9fb6d9}
body.rvw-offlayer .ps-mapkey.at-right,body.rvw-offlayer .ps-mapbanner{display:none!important}
`;document.head.appendChild(s)}

/* ======================================================================== part 5: odds and ends */
/* "The anchoveta and El Niño" showed the same diagram, on the same tab ("Upwelling off Peru"), as the stop before it;
   it now opens on the diagram's other tab, "Across the Pacific", which shows what El Niño does (geoflock-diagrams2.js
   keys its stops in PS_DIAG) */
(function diag(n){try{if(typeof PS_DIAG!=="undefined"&&PS_DIAG["ocean|The anchoveta and El Niño"]){PS_DIAG["ocean|The anchoveta and El Niño"]="upwell:1";if(window.gfDiag2&&gfDiag2.STOPS)gfDiag2.STOPS["ocean|The anchoveta and El Niño"]="upwell:1";return}}catch(e){}if(n<40)setTimeout(()=>diag(n+1),500)})(0);

{const s=document.createElement("style");s.textContent=`
.rvw-gnu{fill:#3b2a1a;stroke:#f2e3c6;stroke-width:1}.rvw-route{fill:none;stroke:#d9682b;stroke-width:4;stroke-linecap:round;stroke-dasharray:14 10;filter:drop-shadow(0 0 1.5px #fff)}
.rvw-cobs{display:flex;gap:4px;justify-content:space-between;margin-top:4px}.rvw-cob{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid rgba(19,41,75,.2);background:#fff;border-radius:10px;padding:4px 0;cursor:pointer;font:800 12px system-ui,sans-serif;color:#13294b}
.rvw-cob:hover{border-color:#d9682b;background:#fff4ec}.rvw-gen{font-size:12.5px;font-weight:700;opacity:.8}
:is(body.dark-theme,body.sky-night) .rvw-cob{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
.rvw-col{display:block;width:100%;height:auto;margin:2px 0 4px}.rvw-zl{stroke:rgba(255,255,255,.35);stroke-width:1;stroke-dasharray:3 3}
.rvw-cab{stroke:#ffd166;stroke-width:1.2;stroke-dasharray:2 2}.rvw-sub{fill:#ffd166;stroke:#7a4a12;stroke-width:1.5}.rvw-win{fill:#13294b}.rvw-beam{fill:rgba(255,236,170,.28)}
.rvw-em{filter:drop-shadow(0 0 2px rgba(255,255,255,.85))}.rvw-zt{font:700 9.5px system-ui,sans-serif;fill:#fff;opacity:.55}.rvw-zt.rvw-zon{opacity:1;font-weight:800}.rvw-hit{fill:rgba(255,209,102,.35);stroke:#ffd166;stroke-width:1.5}
`;document.head.appendChild(s)}

window.gfPolishRvw={v:1,FIX,viewOf,tours:MYT,stop(){IV.forEach(clearInterval);unmount()}};
})();
