/* GeoFlock polish RV-S: a stop-by-stop review of four tours: People (people), Human origins (humans), Island life
   (islandlife) and Special regions (regions), each looked at on the globe, their default mode, at 1280×860. Built on
   geoflock-polish-rvp.js (the same helpers and engine, under "rvs" names so the two never touch each other's controls).
   1. Fixes, keyed by tour and stop title, applied once the page has settled and again whenever one of these tours is on
      (to the stops psSteps() builds as well). Each fix says why; changed facts cite their source. Every stop of these
      tours keeps its card on the left (some opened it on the right, over the place the stop is about), except those
      listed in KEEPSIDE.
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops. The answer is kept out of the stop's text and
      pins, so only the veiled headline gives it away.
   3. Stops you can play with (listed at the start of part 3).
   4. The map's banner slides clear of the map key and the search box.
   geoflock-sweep-tours*.js re-set framing on every psGo, so a fixed field becomes a non-configurable getter whose setter
   is ignored; a field already non-configurable (fixed by another file) is left alone. CSS classes start with "rvs-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvs)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};
const TEST=()=>!!(window.__rvsTest||/[?&]rvstest\b/.test(location.search));

/* ======================================================================== part 1: data fixes */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* a field that keeps taking new values from other scripts, but always reads back filtered */
const FILT=(S,k,fn)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvs){d.get._rvs.push(fn);return}if(d&&d.configurable===false)return;let v=S[k];const fns=[fn];
 const get=()=>fns.reduce((x,f)=>{try{return f(x)}catch(e){return x}},v);get._rvs=fns;
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
 people:{
  /* the six photos spanned the world: Tokyo and Seoul under the map key, Dhaka on the zoom buttons, Kinshasa and Agadez
     under the graphics notice at the screen's bottom and Reykjavík under the card. Tokyo (the card's own photo), Seoul,
     Dhaka and Kinshasa have their own stops; Reykjavík is far from the rest. Niger's Agadez, the highest fertility,
     stays */
  "The people map":S=>{DROPPH(S,/^(Tokyo|Dhaka|Kinshasa|Reykjav|Seoul)/);VIEW(S,[40,20,1])},
  /* Niger, 96° of longitude from China, sat under the card; it has its own label (about 6) on Africa's baby boom */
  "Too few to replace":S=>DROP(S,/^Niger/),
  /* Somalia (46°E) lay beyond the globe's right edge on these three stops of Africa */
  "Africa’s baby boom":S=>VIEW(S,[37,2,1.5]),
  "The youngest countries":S=>VIEW(S,[37,4,1.5]),
  /* (and Lesotho's label under the graphics notice at the screen's bottom) */
  "Where life is shortest":S=>VIEW(S,[42,-4,1.25]),
  /* Japan's label sat under the zoom buttons */
  "South Korea, the lowest on Earth":S=>VIEW(S,[132,31,2.4]),
  /* Bangladesh, the stop's comparison, was beyond the globe's right edge */
  "Russia’s missing men":S=>VIEW(S,[66,42,1.15]),
  /* Hong Kong's label sat on the graphics notice at the screen's bottom */
  "Japan buys more nappies for adults":S=>VIEW(S,[130,31,2.6]),
  /* Papua New Guinea was round the back of the globe: index.html turned the globe to the middle of it and Vaduz's
     photo, 136° of longitude apart, over Central Asia (the photo was also pinned at 4°E 52°N, in the Netherlands). The
     photo goes; the stop opens on Papua New Guinea and buttons (part 3) turn the globe to each country */
  "Town and country":S=>{AREA(S,/^Liechtenstein/);DROPPH(S,/Liechtenstein|Vaduz/);VIEW(S,[145,-6,2.4])},
  /* Japan's label sat at the globe's edge, by the zoom buttons */
  "A short-sighted generation":S=>VIEW(S,[128,32,2]),
  /* Bosnia's label sat on the globe's edge and Montenegro's round the back; the pin no longer gives away the height,
     which is now guessed first (part 2) */
  "From short to tallest":S=>{VIEW(S,[12,48,2.5]);RELABEL(S,/^The Netherlands/,"The Netherlands")},
  /* Costa Rica, 103° of longitude from Iceland and South Sudan, sat under the card (its label hung below it), and
     Norway under the map key: the stop opens on Europe and Africa, and buttons (part 3) turn the globe to all three.
     The key's two long entries (each country is labelled on the map anyway) made it 300 px wide, too wide for the map's
     banner to fit between it and the card: they become "The top three" and "The bottom three" */
  "Top of the class":S=>{DROP(S,/^Costa Rica/);VIEW(S,[5,45,1]);FILT(S,"G",A=>Array.isArray(A)?A.map(x=>x&&/: the (top|bottom) three$/.test(x.t)?Object.assign({},x,{t:/top/.test(x.t)?"The top three":"The bottom three"}):x):A)},
  /* the layer buttons it pointed to lie under the card, on the globe's left: they are now repeated in the card (part 3) */
  "Now explore":S=>RE(S,"stat","Switch layers with the buttons on the left,","Switch layers with the buttons below,")
 },
 humans:{
  /* the eight photos span the world: the hobbit, the tarsier and the snow monkeys were round the back of the globe and
     the early modern human (in France) under the card; framed beside the card, Harbin's sat on the search box. The
     hobbit and the Denisovans have their own stops and the snow monkeys are the next stop's card photo */
  "Our family’s map":S=>{DROPPH(S,/^(‘Hobbit’|Tarsier|Snow monkeys|Early modern human|Harbin)/);VIEW(S,[60,25,1])},
  /* the golden lion tamarin's photo hung off the globe under the card, and the proboscis monkey was round the back of
     the globe (South America's monkeys have their own stop, Monkeys on rafts) */
  "Where primates live":S=>DROPPH(S,/^(Golden lion tamarin|Proboscis monkey)/),
  /* the card opened on the right, over the koala, the platypus and the wombat */
  "Australia sails away":S=>VIEW(S,[143,-28,1.6]),
  /* the card opened on the right, and the raft's line ran under the map key on the left; the stop now opens zoomed
     out, with South America's monkeys clear of the card and Africa's coast on the right */
  "Monkeys on rafts":S=>VIEW(S,[-32,-5,1]),
  /* the card opened on the right, over the gibbon; the line from Africa ran under the map key. Zoomed out a little, the
     gibbon in Thailand clears the key too */
  "Africa joins Asia":S=>VIEW(S,[72,18,1.1]),
  /* Gigantopithecus's two photos sat at the globe's top edge, by the map's switches */
  "The apes of Asia":S=>VIEW(S,[106,13,2.2]),
  /* Dmanisi, the stop's headline, and the hand axes were under the card; the walkers' lines to China and Java ran off
     the right edge. The stop opens on the whole route and buttons (part 3) turn the globe to each site */
  "The first to leave Africa":S=>{DROPPH(S,/^Hand axes/);VIEW(S,[72,20,1.05])},
  /* the card opened on the right, over the sea-level chart's own place */
  "Sundaland":S=>VIEW(S,[112,0,2]),
  /* the Luzon stegodon's photo sat under the map's switches and the Flores giant rat's at the bottom of the screen */
  "The hobbits":S=>VIEW(S,[117,4,2]),
  /* the Tibetan and Taiwanese jaws were beyond the globe's right edge and Homo naledi below the screen: the stop opens
     on the Neanderthals' lands and buttons (part 3) visit the five kinds alive 100,000 years ago */
  "Many kinds of human":S=>AREA(S,/^(Tibet|Off Taiwan|Rising Star)/),
  /* the Tibetan jaw, where the Denisovans' line starts, was beyond the globe's right edge */
  "Denny, child of two kinds":S=>VIEW(S,[92,46,1.8]),
  /* none of the stop's places showed: Omo Kibish and Herto lay on the globe's right edge, Florisbad and Blombos below
     the screen, and Jebel Irhoud, the headline, had no pin at all. Buttons (part 3) visit the four oldest sites */
  "Our own species":S=>{AREA(S,/^(Omo Kibish|Florisbad)/);DROPPH(S,/^(Herto|Blombos|Florisbad)/);VIEW(S,[30,6,1.1])},
  /* the card opened on the right; Lake Mungo, White Sands and Clovis were round the back of the globe and the Sulawesi
     painting under the card. Those photos go and the far pins become area labels; buttons (part 3) follow the journey */
  "Out of Africa again":S=>{DROPPH(S,/^(Lake Mungo|White Sands|Clovis|Sulawesi)/);AREA(S,/^(Bering|Americas)/);VIEW(S,[40,30,1])},
  /* the labels of the Solomon Islands and Vanuatu, the countries with the most Denisovan DNA, were cut off at the
     globe's right edge or ran under the map key. index.html turns the globe to the middle of the stop's point pins and
     photos, here Tibet and Ladakh, whenever that shows more of them, which left Papua New Guinea round the back. So the
     globe faces Australasia, and the Changpa nomads' photo, the Tibet label (which then hung over the map's switches at
     the top) and the general "1–2% Neanderthal DNA" label, placed in Germany, go; the text still tells Tibet's story */
  "We still carry them":S=>{DROP(S,/^(About 1–2% Neanderthal|Tibet)/);DROPPH(S,/^Changpa/);VIEW(S,[144,-17,1])}
 }
};
/* stops that keep the card where their own script put it */
const KEEPSIDE=new Set(/*KEEPSIDE*/[]);
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;applied.add(S);const t=strip(S.title);
 try{if(!KEEPSIDE.has(tour+"|"+t))LOCK(S,"card","left");const f=F[t];if(f)f(S)}catch(e){console.error("rvs fix",tour,S.title,e)}})}
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
 if(document.querySelector(".rvs-ctl[data-turned]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>6500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* Dutch men born in 1996 averaged 182.5 cm, the tallest of 200 countries (NCD Risk Factor Collaboration, "A century of
     trends in adult human height", eLife 2016; in Wikipedia, "Human height") */
  "people|From short to tallest":G("Dutch men were among Europe’s shorter men in the mid-1800s. How tall is a young Dutch man on average today?",150,200,183,"cm",{step:1,show:"about 1.83 m, the tallest on Earth"})
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvn.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in amGlobe.host,
   clipped to the globe's visible disc), and removes everything as soon as the stop changes or the tour ends.
   - people | "South Korea, the lowest on Earth": set the children per woman and watch 100 adults' children and
              grandchildren (South Korea's 0.75, replacement 2.1, Niger's about 6).
   - people | "Town and country": buttons turn the globe between Papua New Guinea and Liechtenstein.
   - people | "Top of the class": buttons turn the globe to Iceland, South Sudan and Costa Rica.
   - people | "Now explore": the map's layer buttons, hidden under the card, repeated inside it.
   - humans | "The first to leave Africa": buttons turn the globe to Dmanisi, Lantian and Java.
   - humans | "Many kinds of human": buttons visit the five kinds of human alive 100,000 years ago.
   - humans | "Our own species": buttons visit the four oldest Homo sapiens sites, from Jebel Irhoud to Herto.
   - humans | "Now explore": put eight moments of the tour in order, from the monkeys' raft to Europe. */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;if(!G._flat&&G.size){const z=G.size();if(z&&z.r&&Math.hypot(s[0]-z.w/2,s[1]-z.h/2)>z.r+1)return null}const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvs-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+esc(head)+"</b>":"")+"<span>"+esc(text)+"</span>";e.classList.remove("rvs-new");void e.offsetWidth;e.classList.add("rvs-new")}
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
 card:()=>'<div class="rvs-pool"></div><div class="rvs-order"></div><div class="rvs-row"><button type="button" class="rvs-btn rvs-undo">↶ Undo</button><button type="button" class="rvs-btn rvs-reset">↺ Start again</button></div>',
 init(L){L.pick=[];L.items=shuffle(o.items.map((x,i)=>i),o.seed||7)},
 wire(L){const c=L.card;c.querySelector(".rvs-undo").onclick=()=>{if(L.pick.length&&L.pick.length<o.items.length)L.pick.pop();this.render(L)};
  c.querySelector(".rvs-reset").onclick=()=>{L.pick=[];this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=o.items.length,done=L.pick.length===n;
  setHTML(c.querySelector(".rvs-pool"),done?"":L.items.filter(i=>!L.pick.includes(i)).map(i=>'<button type="button" class="rvs-chip" data-i="'+i+'">'+esc(o.items[i][0])+"</button>").join(""));
  c.querySelectorAll(".rvs-chip").forEach(b=>b.onclick=()=>{L.pick.push(+b.dataset.i);this.render(L)});
  let right=0;const rows=[];for(let k=0;k<n;k++){const i=L.pick[k];if(i==null){rows.push('<div class="rvs-slot rvs-empty"><em>'+(k+1)+'</em><span>'+(k===L.pick.length?"tap the "+(k===0?o.first:"next"):"")+"</span></div>");continue}
   const ok=done&&i===k;if(ok)right++;rows.push('<div class="rvs-slot'+(done?ok?" rvs-ok":" rvs-no":"")+'"><em>'+(k+1)+"</em><span>"+esc(o.items[i][0])+"</span>"+(done?"<b>"+esc(o.items[i][1])+(ok?"":' <i>(no. '+(i+1)+")</i>")+"</b>":"")+"</div>")}
  setHTML(c.querySelector(".rvs-order"),rows.join(""));c.querySelector(".rvs-undo").disabled=!L.pick.length||done;
  if(!L.pick.length)say(L,o.head,o.intro);else if(!done)say(L,"",o.items.length-L.pick.length+" to go");
  else say(L,right+" of "+n+" in the right place"+(right===n?"!":""),o.after)}}}

/* ---------------------------------------------------------------- TURN: buttons turn the globe from place to place */
function turnDef(tour,title,o){return{tour,title,globe:true,turn:true,tip:o.tip,
 card:()=>'<div class="rvs-row rvs-turn">'+o.places.map((f,i)=>'<button type="button" class="rvs-btn" data-i="'+i+'"></button>').join("")+'</div>',
 init(L){L.at=-1;L.t=0;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvs-ring"});L.tag=document.createElement("div");L.tag.className="rvs-tag rvs-new2";L.el.appendChild(L.tag)},
 tick(L,dt){L.t+=dt;if(L.at>=0)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){const f=L.at>=0?o.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;c.querySelectorAll(".rvs-turn button").forEach(b=>b.onclick=()=>{const f=o.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turned="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvs-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvs-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+o.places[k][0]});
  if(L.at<0)say(L,"",o.intro);else{const f=o.places[L.at];say(L,f[0],f[4])}}}}

/* ---------------------------------------------------------------- BIN: one item at a time; which kind is it?
   As in geoflock-polish-rvk.js, plus: an item may name a place ([lon, lat, zoom] as its fourth entry); once answered,
   the globe turns to it and a ring marks it, so farms half a world apart can each be seen beside the card. */
function binDef(tour,title,o){const placed=o.items.some(it=>it[3]);return{tour,title,globe:placed,turn:placed,tip:o.tip,
 card:()=>'<div class="rvs-q"><span class="rvs-n"></span><b class="rvs-item"></b></div><div class="rvs-row rvs-bins">'+o.keys.map(k=>'<button type="button" class="rvs-btn rvs-bin" data-k="'+k[0]+'">'+esc(k[1])+"</button>").join("")+'</div>'+
  '<div class="rvs-dots">'+o.items.map(()=>"<i></i>").join("")+'</div><div class="rvs-row"><button type="button" class="rvs-btn rvs-next" hidden>Next ▶</button><button type="button" class="rvs-btn rvs-again" hidden>Play again</button></div>',
 init(L){L.k=0;L.res=[];L.ans=null;L.t=0;L.at=null;if(L.svg){L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvs-ring"});L.ring.style.display="none";L.tag=document.createElement("div");L.tag.className="rvs-tag rvs-new2";L.tag.style.display="none";L.el.appendChild(L.tag)}},
 tick(L,dt){L.t+=dt;if(L.ring&&L.at)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){if(!L.ring)return;const f=L.at,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  /* no tag where the stop already labels the place */
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  if(qq&&!L._dup){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;
  c.querySelectorAll(".rvs-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=o.items.length)return;const it=o.items[L.k];L.ans=b.dataset.k;L.res[L.k]=L.ans===it[1];
   if(it[3]){const p=it[3];L.at=[p[3]||"",p[0],p[1]];c.dataset.turned="1";turnGlobe(p[0],p[1],p[2]);L.dirty=1}this.render(L)});
  c.querySelector(".rvs-next").onclick=()=>{L.k++;L.ans=null;L.at=null;L.dirty=1;this.render(L)};
  c.querySelector(".rvs-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;L.at=null;L.dirty=1;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=o.items.length,end=L.k>=N,it=o.items[Math.min(L.k,N-1)];
  c.querySelector(".rvs-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvs-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvs-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvs-right",!!L.ans&&b.dataset.k===it[1]);b.classList.toggle("rvs-wrong",!!L.ans&&b.dataset.k===L.ans&&L.ans!==it[1])});
  c.querySelectorAll(".rvs-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvs-ok":L.res[i]===false?"rvs-no":i===L.k&&!end?"rvs-at":"");
  const nx=c.querySelector(".rvs-next");nx.hidden=end||!L.ans;nx.textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvs-again").hidden=!end;
  const name=k=>(o.keys.find(x=>x[0]===k)||[,""])[1];
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": all right!":""),o.done)}
  else if(!L.ans)say(L,"",o.ask);
  else if(L.ans===it[1])say(L,"Right: "+name(it[1]),it[2]);
  else say(L,"Not quite: "+name(it[1]),it[2])}}}


/* ======================================================================== people */
/* Three generations at a given number of children per woman: 100 adults (50 couples) have 100 × TFR ÷ 2 children, and
   they in turn have that × TFR ÷ 2 grandchildren (deaths before parenthood ignored, as in the stop's own "every 100
   adults are having about 37 children"). South Korea's 2024 total fertility rate was 0.75 (Statistics Korea, "Birth
   statistics 2024", Feb 2025); Niger's about 6.1 (World Bank, SP.DYN.TFRT.IN, 2023); replacement about 2.1. Each dot
   is 5 people. */
const KOREA={tour:"people",title:"South Korea, the lowest on Earth",globe:false,
 tip:"Set the children per woman and watch three generations of one village.",
 card:()=>'<div class="rvs-sl"><input type="range" class="rvs-tfr" min="0.5" max="6.5" step="0.05" value="2.1" aria-label="Children per woman"><b class="rvs-tv"></b></div>'+
  '<div class="rvs-row"><button type="button" class="rvs-btn" data-v="0.75">🇰🇷 South Korea 0.75</button><button type="button" class="rvs-btn" data-v="2.1">Replacement 2.1</button><button type="button" class="rvs-btn" data-v="6.1">🇳🇪 Niger about 6</button></div>'+
  '<svg class="rvs-gen" viewBox="0 0 300 102" role="img" aria-label="Three generations"></svg>',
 init(L){L.v=2.1},
 wire(L){const c=L.card,r=c.querySelector(".rvs-tfr");r.oninput=()=>{L.v=+r.value;this.render(L)};
  c.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{L.v=+b.dataset.v;r.value=L.v;this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;const v=L.v,g=[100,100*v/2,100*v*v/4];c.querySelector(".rvs-tv").textContent=v.toFixed(2).replace(/0$/,"");
  c.querySelectorAll("[data-v]").forEach(b=>b.classList.toggle("rvs-cur",Math.abs(+b.dataset.v-v)<.001));
  /* each generation a block of dots, 10 to a column; the block widths add up to at most 300 */
  const n=g.map(x=>Math.round(x/5)),cols=n.map(k=>Math.max(1,Math.ceil(k/10))),tot=cols.reduce((a,b)=>a+b,0),gap=26,pitch=Math.min(7,(300-2*gap)/tot);
  let x=0,h="";const lab=["Adults","Children","Grandchildren"],col=["#13294b","#d9682b","#c2364f"];
  for(let k=0;k<3;k++){const x0=x;for(let i=0;i<n[k];i++){const cx=x+Math.floor(i/10)*pitch+pitch/2,cy=1+(i%10)*pitch+pitch/2;h+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+(pitch*.38).toFixed(2)+'" fill="'+col[k]+'"/>'}
   const w=cols[k]*pitch;h+='<text x="'+(x0).toFixed(1)+'" y="100" class="rvs-gt">'+lab[k]+'</text><text x="'+x0.toFixed(1)+'" y="87" class="rvs-gt rvs-gn">'+Math.floor(g[k]+1e-9).toLocaleString("en-GB")+'</text>';
   x+=Math.max(w,k<2?52:0)+gap}
  setHTML(c.querySelector(".rvs-gen"),h);
  const gk=Math.floor(g[2]+1e-9);
  if(v<2.05)say(L,"Shrinking: "+gk+" grandchildren for every 100 adults","Each generation is "+Math.round(v/2*100)+"% the size of the one before."+(v<=0.9?" At South Korea’s rate, every three generations lose more than 9 in 10.":""));
  else if(v<=2.15)say(L,"Just about steady","About 2.1 children per woman replaces the parents (a few children die young), so each generation is the same size.");
  else say(L,"Growing: "+gk.toLocaleString("en-GB")+" grandchildren for every 100 adults","Each generation is "+(v/2).toFixed(1).replace(/\.0$/,"")+" times the size of the one before.")}};
/* Papua New Guinea and Liechtenstein, as the stop tells it (World Bank, SP.URB.TOTL.IN.ZS: both about 15% urban) */
const TOWN=turnDef("people","Town and country",{tip:"Both countries are about 85% rural. Visit each to see why.",
 intro:"Tap a country to turn the globe to it.",
 places:[["Papua New Guinea",145,-6.3,2.4,"Most people farm in remote mountain valleys, far from any town: rural in fact."],
  ["Liechtenstein",9.52,47.14,4,"Rich and built-up, but by its own rules only the capital, Vaduz, counts as a town: rural on paper."]]});
/* HDI 2023 values (UNDP, Human Development Report 2025): Iceland 0.972, 1st; South Sudan 0.388, 193rd and last.
   Iceland had about 390,000 people in 2024 (Statistics Iceland). Costa Rica's figures are the stop's own. */
const TOPCLASS=turnDef("people","Top of the class",{tip:"The top, the bottom and a surprise. Visit each.",
 intro:"Tap a country to turn the globe to it.",
 places:[["Iceland: 1st, 0.972",-19,64.9,3,"Fewer than 400,000 people, long lives, long schooling and high incomes."],
  ["South Sudan: last, 0.388",30,7.5,3,"Independent only since 2011, and in 2013 civil war broke out: short lives, little schooling, low incomes."],
  ["Costa Rica: a surprise",-84,10,3.2,"People live longer than Americans (about 81 years against 79) on about a fifth of the income per person."]]});
/* The People map's own layer buttons (#amGlobeSubs, made by index.html) sit on the globe's left, under the card; on
   the last stop they are repeated in the card, each one pressing the real button */
const LAYERS={tour:"people",title:"Now explore",globe:false,tip:"Pick a layer and look for the countries at each end.",
 card:()=>'<div class="rvs-row rvs-lay"></div>',
 wire(L){this.render(L);L.iv=setInterval(()=>this.render(L),700)},off(L){clearInterval(L.iv);document.body.classList.remove("rvs-offlayer")},
 render(L){const c=L.card;if(!c||!c.isConnected){clearInterval(L.iv);document.body.classList.remove("rvs-offlayer");return}const B=[...document.querySelectorAll("#amGlobeSubs [data-sub]")];
  const h=B.map(b=>'<button type="button" class="rvs-btn'+(b.classList.contains("active")?" rvs-cur":"")+'" data-s="'+esc(b.dataset.sub)+'">'+esc(b.textContent.trim())+"</button>").join("");
  const row=c.querySelector(".rvs-lay");if(row._h!==h){row.innerHTML=h;row._h=h;row.querySelectorAll("[data-s]").forEach(x=>x.onclick=()=>{const b=document.querySelector('#amGlobeSubs [data-sub="'+x.dataset.s+'"]');if(b)b.click();setTimeout(()=>this.render(L),150)})}
  /* the tour's own key and banner describe the stop's layer: once another layer is picked they would be wrong, so they
     hide until the stop changes */
  const a=B.find(b=>b.classList.contains("active"));let own="";try{own=String(psSteps()[ps.i].sub||"").split("/")[0]}catch(e){}
  document.body.classList.toggle("rvs-offlayer",!!(a&&own&&a.dataset.sub!==own));say(L,"",a?"Showing: "+a.textContent.trim()+". Hover a country for its number.":"Tap a layer.")}};
/* ======================================================================== humans */
/* Dmanisi 1.85 to 1.77 million years, five skulls (Wikipedia, "Dmanisi hominins"); Lantian's Gongwangling skull about
   1.63 million years (Zhu et al., Journal of Human Evolution 2015); Sangiran, Java, about 1.5 to 1.6 million years, and
   Dubois's Trinil find of 1891 (Wikipedia, "Java Man"); Java's last Homo erectus, Ngandong, 117,000 to 108,000 years
   ago (Rizal et al., Nature 2020) */
const LEAVE=turnDef("humans","The first to leave Africa",{tip:"Homo erectus walked a third of the way round the world. Visit its sites.",
 intro:"Tap a site to turn the globe to it.",
 places:[["Dmanisi, Georgia: 1.8 million years",44.34,41.34,3.2,"Five skulls and simple stone tools: the oldest humans known outside Africa."],
  ["Lantian, China: 1.6 million years",109.5,34.1,3.2,"A skull from Gongwangling, near Xi’an: by now Homo erectus had crossed Asia."],
  ["Java: about 1.6 million years",110.9,-7.4,3.2,"Eugène Dubois found ‘Java Man’ at Trinil in 1891. Homo erectus lived on Java until roughly 110,000 years ago."]]});
/* The five kinds alive about 100,000 years ago, as the stop counts them. Qafzeh's burials, 90,000 to 100,000 years old
   (Wikipedia, "Qafzeh"); ten Neanderthals found at Shanidar (Wikipedia, "Shanidar Cave"); Callao Cave's Homo luzonensis
   at least 50,000 years old (Détroit et al., Nature 2019) */
const FIVE=turnDef("humans","Many kinds of human",{tip:"Five kinds of human, 100,000 years ago. Visit each one’s home.",
 intro:"Tap a kind of human to turn the globe to where it lived.",
 places:[["Homo sapiens: us",35.3,32.7,3,"Our species lived across Africa, and just into Asia: burials at Qafzeh, in Israel, are about 100,000 years old."],
  ["Neanderthals",44.22,36.83,3,"From Spain to Siberia. At Shanidar Cave, in Iraq, the bones of ten Neanderthals have been found."],
  ["Denisovans",84.68,51.4,3,"Known mostly from DNA: a finger bone from Denisova Cave, in Siberia, and jaws from Tibet and the seabed off Taiwan."],
  ["Homo floresiensis",120.45,-8.53,3.2,"The ‘hobbits’ of Flores, about 1.1 m tall."],
  ["Homo luzonensis",121.82,17.7,3.2,"Teeth and bones from Callao Cave, on Luzon, at least 50,000 years old: another small island human."]]});
/* Jebel Irhoud about 315,000 years (Hublin et al., Nature 2017); Florisbad about 259,000 years, found in 1932 (Grün et
   al., Nature 1996; Wikipedia, "Florisbad Skull"); Omo I, found in 1967, at least 233,000 years (Vidal et al., Nature
   2022); Herto, 160,000 years, found in 1997 (White et al., Nature 2003) */
const OURS=turnDef("humans","Our own species",{tip:"Our species’ oldest fossils are spread across Africa. Visit them, oldest first.",
 intro:"Tap a site to turn the globe to it.",
 places:[["Jebel Irhoud, Morocco: about 300,000 years",-8.87,31.85,3,"The oldest known Homo sapiens: faces like ours, but long, low braincases."],
  ["Florisbad, South Africa: about 260,000 years",26.1,-28.77,3,"A partial skull, found at a spring in 1932."],
  ["Omo Kibish, Ethiopia: about 230,000 years",35.9,5.4,3,"Found in 1967; in 2022 the volcanic ash above it showed it is at least 230,000 years old."],
  ["Herto, Ethiopia: about 160,000 years",40.53,10.33,3,"The skulls of two adults and a child, found in 1997."]]});
/* The tour's own dates, oldest first (each stop gives its source) */
const TIMELINE=rankDef("humans","Now explore",{seed:5,first:"oldest",head:"Put the tour in order",
 tip:"Which came first? Tap the eight moments from the oldest to the newest.",
 items:[["Monkeys raft to South America","35–40 million years ago"],["Arabia joins Africa to Asia","about 20 million"],["Our line splits from the chimps’","6–7 million"],
  ["The first stone tools, Lomekwi","3.3 million"],["Lucy walks upright","3.2 million"],["Humans reach Dmanisi","1.8 million"],["The oldest Homo sapiens, Jebel Irhoud","300,000"],["People reach Europe","about 45,000"]],
 intro:"Some of these are tens of millions of years apart, some only 100,000.",
 after:"If the 40 million years since the monkeys’ raft were one day, our species would have appeared about 11 minutes before midnight."});

/* ---------------------------------------------------------------- the engine: one stop at a time */
const DEFS=[KOREA,TOWN,TOPCLASS,LAYERS,LEAVE,FIVE,OURS,TIMELINE];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tour===ps.tour&&d.title===t);if(!D)return null;if((D.globe||D.turn)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvs-layer";el.innerHTML='<svg class="rvs-sv"><defs><clipPath id="rvsClip"><path class="rvs-clipp" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvsClip)"></g></svg>';host.appendChild(el);
  L.el=el;L.root=el.querySelector("svg");L.svg=el.querySelector("g");L.clipP=el.querySelector(".rvs-clipp")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}lastT=0;if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvs-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvs-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvs-ctl";
 c.innerHTML='<div class="rvs-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvs-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvs-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvs-field{display:block;width:100%;height:auto;border-radius:8px;margin:2px 0 4px}.rvs-cous{fill:#cfe3b0;stroke:#6f8f4a;stroke-width:1}.rvs-mine{fill:#d9682b;stroke:#7a3410;stroke-width:1.5}
.rvs-heirs span{font-size:12.5px;font-weight:700;opacity:.75}
.rvs-route{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:6 5;opacity:.7}
.rvs-trail{fill:none;stroke:#d9a21a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.rvs-green{fill:#4c9a3a;stroke:#fff;stroke-width:2}.rvs-gold{fill:#f2c230;stroke:#7a4a12;stroke-width:2}
.rvs-cmb{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvs-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvs-sv{position:absolute;left:0;top:0;overflow:visible}
.rvs-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none;background:rgba(255,255,255,.95);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvs-tag.rvs-new2{background:#13294b;color:#fff}
.rvs-ring{fill:rgba(255,209,102,.35);stroke:#d9682b;stroke-width:3}
.rvs-dot{fill:#ffd166;stroke:#13294b;stroke-width:2.5}.rvs-stop{fill:#c2364f;stroke:#fff;stroke-width:2.5}
.rvs-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvs-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvs-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvs-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvs-btn[hidden]{display:none}.rvs-btn:disabled{cursor:default;opacity:.55}
.rvs-btn.rvs-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvs-btn.rvs-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvs-btn.rvs-cur{background:#13294b;color:#fff;border-color:#13294b}
.rvs-pool{display:flex;flex-wrap:wrap;gap:6px}.rvs-pool:empty{display:none}
.rvs-chip{border:1px solid #d9682b;background:#fff4ec;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvs-chip:hover{background:#d9682b;color:#fff}
.rvs-order{display:flex;flex-direction:column;gap:3px;margin-top:8px}
.rvs-slot{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 8px;border-radius:8px;background:rgba(19,41,75,.06);min-height:24px}
.rvs-slot em{font-style:normal;font-weight:800;width:16px;opacity:.6}.rvs-slot span{flex:1 1 auto;font-weight:700}.rvs-slot b{font-weight:700;font-size:12.5px;white-space:nowrap}.rvs-slot b i{font-style:normal;opacity:.8}
.rvs-slot.rvs-empty span{font-weight:500;opacity:.6;font-style:italic}
.rvs-slot.rvs-ok{background:rgba(31,138,76,.16)}.rvs-slot.rvs-no{background:rgba(194,54,79,.13)}
.rvs-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 4px;min-height:1.4em}.rvs-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvs-item{font-size:15.5px;color:#13294b;line-height:1.3}
.rvs-dots{display:flex;gap:4px;margin-top:8px}.rvs-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvs-dots i.rvs-ok{background:#1f8a4c}.rvs-dots i.rvs-no{background:#c2364f}.rvs-dots i.rvs-at{box-shadow:0 0 0 2px #ffd166}
.rvs-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvs-ep b{display:block;font-size:15px}
.rvs-ep.rvs-new{animation:rvsIn .45s ease}@keyframes rvsIn{from{opacity:.2;transform:translateY(4px)}}
.rvs-sl{display:flex;align-items:center;gap:10px;margin-top:4px}.rvs-sl input{flex:1 1 auto;accent-color:#d9682b}.rvs-sl b{min-width:64px;text-align:right;font-size:17px;color:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvs-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvs-do,:is(body.dark-theme,body.sky-night) .rvs-sl b{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvs-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvs-n{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvs-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvs-btn.rvs-cur{background:#ffb27a;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvs-chip{background:rgba(217,104,43,.18);color:#ffd2b3;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvs-slot{background:rgba(255,255,255,.07)}
:is(body.dark-theme,body.sky-night) .rvs-slot.rvs-ok{background:rgba(31,138,76,.35)}:is(body.dark-theme,body.sky-night) .rvs-slot.rvs-no{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvs-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}


/* night: the answer colours must outrank the plain night button style above them (as geoflock-polish-rvl.js does) */
{const s=document.createElement("style");s.textContent=`
:is(body.dark-theme,body.sky-night) .rvs-btn.rvs-right{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rvs-btn.rvs-wrong{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvs-dots i.rvs-ok{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvs-dots i.rvs-no{background:#ff7088}
:is(body.dark-theme,body.sky-night) .rvs-dots i.rvs-at{box-shadow:0 0 0 2px #ffb27a}
:is(body.dark-theme,body.sky-night) .rvs-tag{background:#13294b;color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.4)}
.rvs-rc{display:grid;gap:4px}.rvs-rc label{font-size:12.5px;font-weight:700;color:#13294b}.rvs-rc label b{font-weight:600;color:#5b6b7c}.rvs-rc input{width:100%;accent-color:#d9682b}
.rvs-rbars{display:block;width:100%;height:auto;margin-top:6px}.rvs-rt{font:700 11px system-ui,sans-serif;fill:#13294b}.rvs-rv{fill:#9a4a16}.rvs-r2{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3;opacity:.6}.rvs-r2t{font-weight:600;font-size:9.5px;opacity:.7}
:is(body.dark-theme,body.sky-night) .rvs-rc label{color:#fff}:is(body.dark-theme,body.sky-night) .rvs-rc label b{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rvs-rt{fill:#e8eef7}:is(body.dark-theme,body.sky-night) .rvs-rv{fill:#ffb27a}:is(body.dark-theme,body.sky-night) .rvs-r2{stroke:#e8eef7}
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
.rvs-gen{display:block;width:100%;height:auto;margin-top:8px}.rvs-gt{font:700 10.5px system-ui,sans-serif;fill:#5b6b7c}.rvs-gn{font-size:13px;fill:#13294b}
:is(body.dark-theme,body.sky-night) .rvs-gt{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvs-gn{fill:#fff}
:is(body.dark-theme,body.sky-night) .rvs-gen circle[fill="#13294b"]{fill:#9fb6d9}
body.rvs-offlayer .ps-mapkey.at-right,body.rvs-offlayer .ps-mapbanner{display:none!important}
`;document.head.appendChild(s)}

window.gfPolishRvs={v:1,FIX,stop(){IV.forEach(clearInterval);unmount()}};
})();
