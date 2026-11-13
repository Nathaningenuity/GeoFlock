/* GeoFlock polish RV-G: a stop-by-stop review of four tours (Transport and trade, Animals, Politics, Languages), looked
   at on the globe, their default mode, at 1280×860.
   1. Fixes keyed by tour and stop title: framing (places under the card or the map key, off the globe's edge or round
      the back), facts that had gone out of date (sources beside each), leftovers. They are applied when the page loads
      and again whenever one of these tours is on (to the stops psSteps() builds as well). geoflock-sweep-tours*.js
      re-set framing on every psGo, so (as in geoflock-polish-rvc.js / -rvd.js) a fixed field becomes a non-configurable
      getter whose setter is ignored; a field that is already non-configurable (fixed by another file) is left alone.
   2. Guess-first questions and "find it on the map" taps, through geoflock-tourplay.js.
   3. Stops you can play with (listed at the start of part 3).
   CSS classes start with "rvg-". Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvg)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");

/* ======================================================================== part 1: data fixes */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!window.__rvgTest,enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};

/* a field that keeps taking new values from other scripts, but always reads back filtered */
const FILT=(S,k,fn)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvg){d.get._rvg.push(fn);return}if(d&&d.configurable===false)return;let v=S[k];const fns=[fn];
 const get=()=>fns.reduce((x,f)=>{try{return f(x)}catch(e){return x}},v);get._rvg=fns;
 Object.defineProperty(S,k,{configurable:!!window.__rvgTest,enumerable:true,get,set:x=>{v=x}})}catch(e){}};
/* swap one phrase in a text field, now and whenever another script sets the field again */
const RE=(S,k,a,b)=>FILT(S,k,t=>typeof t==="string"&&t.indexOf(a)>=0?t.split(a).join(b):t);
const pinText=p=>Array.isArray(p)?String(p[1]||""):String(p&&(p.text||p.label)||"");
/* drop the text pins whose label matches (also from pins other scripts add later) */
const DROP=(S,re)=>FILT(S,"pins",P=>Array.isArray(P)?P.filter(p=>!re.test(strip(pinText(p)))):P);

const FIX={
 transport:{
  /* Newark, where the Ideal X sailed from, was at the globe's edge under the zoom buttons */
  "The box that changed the world":S=>{LOCK(S,"globe",[-82,36,2.2])},
  /* the registry office near Washington was off the globe's edge and Panama under the card */
  "Flags of convenience":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-75,22,0.85])},
  /* the card stood on the right, over China, the subject, and the stop's own key lay across the card's corner */
  "China sells, America buys":S=>{LOCK(S,"card","left");LOCK(S,"globe",[72,33,1])},
  /* the card stood on the right, over China and the end of the Khorgos line */
  "The Belt and Road":S=>{LOCK(S,"card","left");LOCK(S,"globe",[45,22,0.9])},
  /* the card stood on the right, over Vladivostok and the whole eastern half of the line */
  "The Trans-Siberian":S=>{LOCK(S,"card","left");LOCK(S,"globe",[95,52,1.1])},
  "Change wheels at the border":S=>{LOCK(S,"card","left")},
  /* the card stood on the right; its Fukuoka photo then hung under the map key */
  "The bullet train":S=>{LOCK(S,"card","left");LOCK(S,"globe",[136,36,4.3])},
  /* the Tanggula Pass label ran under the map key and Lhasa sat at the globe's edge */
  "The railway to the sky":S=>{LOCK(S,"card","left");LOCK(S,"globe",[97,33,3.2])},
  /* the Black Sea end of the route was under the map key */
  "North Sea to Black Sea":S=>{LOCK(S,"card","left");LOCK(S,"globe",[22,47,2.6])},
  /* the Prudhoe Bay label sat on the map's toolbar and Ushuaia's photo hung off the bottom of the screen */
  "The Pan-American Highway":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-98,-5,0.72])},
  /* the Dallas and United States labels sat on the map's toolbar, Atlanta was at the globe's edge */
  "The busiest airports":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-45,32,0.95]);
   /* London and Dubai are round the far side of the card from Atlanta: their labels were lifted onto the toolbar.
      They stay in the stop's list (and in the ranking game, part 3) */
   DROP(S,/^(London Heathrow|Dubai|United Arab Emirates)$/);if(Array.isArray(S.hi))LOCK(S,"hi",S.hi.filter(c=>!/^(ae|gb|jp)$/.test(c)))}
 },
 animals:{
  /* photos of all seventeen countries' animals hang round the whole globe; with the card on the right, the ones from
     Africa, Asia and Australia were pushed out from under it and piled up over West Africa (a Bengal tiger on the
     Sahel, on top of the okapi). The stop looks at the Americas: keep their photos, except three at the edge that sat on
     the map toolbar and the Nature map buttons */
  "Seventeen wild countries":S=>{LOCK(S,"card","right");LOCK(S,"globe",[-35,-6,1]);FILT(S,"phPins",P=>Array.isArray(P)?P.filter(q=>!(q&&q.at&&q.at[0]>-25)&&!/^(Axolotl|Giant tortoise|Bald eagle)$/.test(strip(q&&q.label))):P)},
  /* the Great Barrier Reef label and its photos ran under the map key */
  "The Coral Triangle and the Great Barrier Reef":S=>{LOCK(S,"card","left");LOCK(S,"globe",[144,-9,1.6])},
  /* the wildebeest photo hung under the map key */
  "Great journeys":S=>{LOCK(S,"card","left");LOCK(S,"globe",[10,12,1])},
  /* the card stood on the right, so the Okavango labels lay across the Nature map's own buttons on the left */
  "Elephant country":S=>{LOCK(S,"card","left");LOCK(S,"globe",[31,-19,2.6])},
  /* the "Tigers: Asia" label sat on the map's toolbar */
  "Tigers and lions":S=>{LOCK(S,"card","left");LOCK(S,"globe",[94,18,1.15])},
  /* the stop's place labels (Alaska, Hudson Bay...) sat on top of the polar bear or penguin game's own (part 3), and its
     Galápagos photo gave away the game's surprise */
  "Polar bears never meet penguins":S=>{LOCK(S,"card","left");DROP(S,/./);FILT(S,"phPins",P=>Array.isArray(P)?P.filter(q=>!/^Galápagos penguins$/.test(strip(q&&q.label))):P)},
  /* Xochimilco and the axolotl photo were under the map key. Vaquitas: the 2025 survey (SEMARNAT with Sea Shepherd and
     the IUCN's vaquita recovery team) saw 7 to 10, after 6 to 8 in 2024 */
  "The axolotl’s last lake":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-102,24,2.6]);
   RE(S,"stat","and only about 6 to 8 vaquitas are left in the sea","and in 2025 surveyors saw only 7 to 10 vaquitas in the sea");
   RE(S,"more","A 2024 survey saw only about six to eight vaquitas, but they looked healthy and still had calves,","Surveys saw only about six to eight vaquitas in 2024 and seven to ten in 2025, but they looked healthy and still had calves,")}
 },
 politics:{
  /* the card stood on the right, so the UN headquarters label lay across the Politics map's own buttons on the left */
  "A seat worth paying for":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-70,22,1])},
  /* Finland's 1,340 km border more than doubled NATO's land border with Russia (NATO, "Finland joins NATO", 4 April
     2023); "its land border" read as if Finland's own border had grown */
  "NATO":S=>{RE(S,"stat","Finland alone more than doubled its land border with Russia","Finland alone more than doubled NATO’s land border with Russia")},
  /* the game on this stop (part 3) asks which club each country is in: the stop's own "Switzerland: in neither" label
     gave one answer away */
  "The EU is not NATO":S=>{LOCK(S,"card","left");DROP(S,/in neither/)},
  /* the card stood on the right, so the Schengen label lay across the Politics map's buttons; with the card on the
     left, Lisbon (one end of the ruler) and Helsinki both show beside it */
  "Borders without passports":S=>{LOCK(S,"card","left");LOCK(S,"globe",[19,50,2.2])},
  /* Jerusalem, where the Order began, was off the globe's edge */
  "A country without land":S=>{LOCK(S,"card","left");LOCK(S,"globe",[30,37,2.8])},
  /* the Czechia and Slovakia labels sat on the map's toolbar: Europe, where the stop's peaceful splits are, now sits
     beside the card (Singapore, at the far side, is in the photo and the text) */
  "How new countries are born":S=>{LOCK(S,"card","left");LOCK(S,"globe",[48,48,1.6]);DROP(S,/^Malaysia$/)}
 },
 culture:{
  /* New Spain (Mexico), the empire's richest part, and Peru were under the card */
  "The Spanish Empire":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-92,-2,1.15])},
  /* Madagascar, one end of the stop's ruler, was under the card: Antananarivo and southern Borneo now both show
     beside it, with the open Indian Ocean the sailors crossed between them */
  "Madagascar speaks Bornean":S=>{LOCK(S,"card","left");LOCK(S,"globe",[62,-8,0.85]);
   /* the long Borneo label then ran under the map key: the card says the rest */
   FILT(S,"pins",P=>Array.isArray(P)?P.map(p=>Array.isArray(p)&&/^Southern Borneo: Ma/.test(strip(p[1]))?[p[0],"Ma’anyan, Borneo",p[2]]:p):P)},
  /* Morocco, half of the headline ("a Moroccan and an Iraqi"), was under the card */
  "The Arab world":S=>{LOCK(S,"card","left");LOCK(S,"globe",[4,24,1])},
  /* the card stood on the right and the map's floating key lay across its top corner, over the close button */
  "How the world writes":S=>{LOCK(S,"card","left");LOCK(S,"globe",[5,36,1.44])},
  /* "Georgia" and "Armenia" were each written twice, a name label under each flag label */
  "Two neighbours, two alphabets":S=>{DROP(S,/^(Georgia|Armenia)$/)},
  /* the Guangzhou (Cantonese) label ran under the map key */
  "Tones need wet air?":S=>{LOCK(S,"globe",[112,20,1.6])}
 }
};
/* "In the EU, not in the euro" showed Sofia's cathedral, but Bulgaria joined the euro on 1 January 2026 (European
   Council, 8 July 2025): Copenhagen's Nyhavn instead, as Denmark is the stop's headline */
function heroFix(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return false;
 const i=PS_PHOTO_DATA.findIndex(p=>p&&/^Nyhavn, Copenhagen/.test(p.f||""));if(i<0)return false;PS_PHOTO["politics|In the EU, not in the euro"]=i;return true}catch(e){return false}}
{let n=0;const t=setInterval(()=>{if(heroFix()&&++n>3||++n>60)clearInterval(t)},1000)}
/* on the politics and languages stops, the map's own floating key (top right) lay across the stop's title chip and,
   on some stops, the full-screen button: it moves down below the chip and left of the buttons, unless it would then
   cover the card */
const KEYT=new Set(["politics","culture"]);
setInterval(()=>{try{const k=[...document.querySelectorAll(".ps-mapkey")].find(e=>e.offsetWidth&&!e.closest(".ps-card"));if(!k)return;
 const reset=()=>{k.style.removeProperty("translate");delete k.dataset.rvg};
 if(typeof ps==="undefined"||!ps||!KEYT.has(ps.tour)||ps.mode!=="globe"){if(k.dataset.rvg)reset();return}
 if(k.dataset.rvg)k.style.removeProperty("translate");const r=k.getBoundingClientRect();let dx=0,dy=0;
 const b=document.querySelector(".ps-mapbanner");
 if(b&&b.offsetWidth){const br=b.getBoundingClientRect();if(!(br.right<r.left||br.left>r.right||br.bottom<r.top||br.top>r.bottom))dy=br.bottom+6-r.top}
 const btn=[...document.querySelectorAll("button")].find(x=>x.offsetWidth&&/full ?screen/i.test(x.getAttribute("aria-label")||x.title||""));
 if(btn){const q=btn.getBoundingClientRect();if(r.right>q.left-4&&r.left<q.right&&r.top+dy<q.bottom&&r.bottom+dy>q.top)dx=q.left-8-r.right}
 if(!dx&&!dy){delete k.dataset.rvg;return}
 const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.width&&!(r.right+dx<c.left||r.left+dx>c.right||r.bottom+dy<c.top||r.top+dy>c.bottom)){delete k.dataset.rvg;return}
 k.style.setProperty("translate",dx+"px "+dy+"px","important");k.dataset.rvg="1"}catch(e){}},400);
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvg fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
/* geoflock-polish-b.js re-patches some of these stops with Object.defineProperty at load + 1.5 s and 4 s after it runs;
   a field fixed here before then would make those writes throw. So the fixes start once the page has settled, or as
   soon as one of these tours is opened, whichever comes first. */
let lastKey="",ready=false;
const start=()=>{if(ready)return;ready=true;applyAll()};
if(document.readyState==="complete")setTimeout(start,6000);else addEventListener("load",()=>setTimeout(start,6000));
setInterval(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}if(!ready)start();const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);

/* ======================================================================== part 2: guess first, find it
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first (GUESS), or asks for a tap on the
   globe (FIND). */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const F=(q,ll,km,name,o)=>Object.assign({q,ll,km,name},o||{});
 const GS={
  /* China State Railway Group: about 48,000 km of high-speed line at the end of 2024 (the stop's own figure) */
  "transport|China’s fast trains":G("How many km of high-speed railway does China have?",1000,200000,48000,"km",{log:1,show:"about 48,000 km"}),
  /* BOVAG-RAI / Statistics Netherlands: about 23 million bicycles; about 18 million people (the stop's figures) */
  "transport|More bikes than people":G("The Netherlands has about 18 million people. How many bicycles?",1,50,23,"million",{step:1,show:"about 23 million"}),
  /* KAZA elephant survey 2022: about 131,900 elephants in Botswana */
  "animals|Elephant country":G("How many elephants live in Botswana?",1000,1000000,130000,"",{log:1,show:"about 130,000"}),
  /* China's fourth national giant panda survey (2014): 1,864 wild pandas */
  "animals|Pandas":G("How many giant pandas live in the wild?",100,100000,1900,"",{log:1,show:"about 1,900"}),
  /* SIPRI Yearbook 2026: an estimated 12,187 warheads in January 2026 */
  "politics|Nine nuclear powers":G("How many nuclear warheads were there in the world in January 2026?",100,100000,12200,"",{log:1,show:"about 12,200"}),
  /* Taiwan's Ministry of Foreign Affairs lists 12 diplomatic allies (since Nauru switched in January 2024) */
  "politics|Countries in question":G("How many countries officially recognise Taiwan?",0,60,12,"",{step:1,show:"12"}),
  /* World Federation of the Deaf: more than 300 sign languages */
  "culture|Sign languages have borders too":G("How many different sign languages are there in the world?",1,1000,300,"",{log:1,show:"more than 300"}),
  /* about 213 million in Brazil and 10.6 million in Portugal (IBGE 2025 estimate; INE Portugal 2024): about 20 times */
  "culture|Portuguese: the colony outgrew the country":G("How many times more people live in Brazil than in Portugal?",1,50,20,"times",{step:1,show:"about 20 times"})
 };
 const FS={
 };
 for(const k in GS)if(!TP.GUESS[k])TP.GUESS[k]=GS[k];
 if(TP.FIND)for(const k in FS)if(!TP.FIND[k])TP.FIND[k]=FS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with */
/* Same pattern as geoflock-polish-rvc.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in amGlobe.host drawn
   with amGlobe.projection()), and removes everything as soon as the stop changes or the tour ends.
   - transport | "The busiest airports": put the five busiest airports in order, then see the real figures.
   - culture   | "The most spoken languages": the same, for six of the biggest languages.
   - animals   | "Polar bears never meet penguins": a place glows on the globe; polar bear or penguin?
   - politics  | "The EU is not NATO": a country glows; is it in the EU, NATO, both or neither? */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvg-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+esc(head)+"</b>":"")+"<span>"+esc(text)+"</span>";e.classList.remove("rvg-new");void e.offsetWidth;e.classList.add("rvg-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom,latK){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*30/z,Math.max(-60,Math.min(60,ll[1]*(latK||1-.3/Math.max(1,z))))],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1000),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}
const shuffle=(a,seed)=>{let s=seed>>>0;const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};

/* ---------------------------------------------------------------- RANK: tap the items from biggest to smallest */
function rankDef(tour,title,o){return{tour,title,globe:false,tip:o.tip,
 card:()=>'<div class="rvg-pool"></div><div class="rvg-order"></div><div class="rvg-row"><button type="button" class="rvg-btn rvg-undo">↶ Undo</button><button type="button" class="rvg-btn rvg-reset">↺ Start again</button></div>',
 init(L){L.pick=[];L.items=shuffle(o.items.map((x,i)=>i),o.seed||7)},
 wire(L){const c=L.card;c.querySelector(".rvg-undo").onclick=()=>{if(L.pick.length&&L.pick.length<o.items.length)L.pick.pop();this.render(L)};
  c.querySelector(".rvg-reset").onclick=()=>{L.pick=[];this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=o.items.length,done=L.pick.length===n;
  /* the stop's own ranked list gives the answer away: hidden until the order is in */
  try{ps.card.querySelectorAll(".ps-rank"+(o.hideStat?",.ps-stat,.ps-body,.ps-more":"")).forEach(e=>{if(!e.closest(".rvg-ctl"))e.style.display=done?"":"none"})}catch(e){}
  setHTML(c.querySelector(".rvg-pool"),done?"":L.items.filter(i=>!L.pick.includes(i)).map(i=>'<button type="button" class="rvg-chip" data-i="'+i+'">'+esc(o.items[i][0])+"</button>").join(""));
  c.querySelectorAll(".rvg-chip").forEach(b=>b.onclick=()=>{L.pick.push(+b.dataset.i);this.render(L)});
  let right=0;const rows=[];for(let k=0;k<n;k++){const i=L.pick[k];if(i==null){rows.push('<div class="rvg-slot rvg-empty"><em>'+(k+1)+'</em><span>'+(k===L.pick.length?"tap the "+(k===0?o.first:"next"):"")+"</span></div>");continue}
   const ok=done&&i===k;if(ok)right++;rows.push('<div class="rvg-slot'+(done?ok?" rvg-ok":" rvg-no":"")+'"><em>'+(k+1)+"</em><span>"+esc(o.items[i][0])+"</span>"+(done?"<b>"+esc(o.items[i][1])+(ok?"":' <i>(no. '+(i+1)+")</i>")+"</b>":"")+"</div>")}
  setHTML(c.querySelector(".rvg-order"),rows.join(""));c.querySelector(".rvg-undo").disabled=!L.pick.length||done;
  if(!L.pick.length)say(L,o.head,o.intro);else if(!done)say(L,"",o.items.length-L.pick.length+" to go");
  else say(L,right+" of "+n+" in the right place"+(right===n?"!":""),o.after)},
 draw(){}}}
/* Airports Council International (ACI World), "Top 20 busiest airports" for 2024 (April 2025): Atlanta 108.1 million
   passengers, Dubai 92.3, Dallas Fort Worth 87.8, Tokyo Haneda 85.9, London Heathrow 83.9 (the stop's own list). */
const AIRP=rankDef("transport","The busiest airports",{seed:11,hideStat:1,first:"busiest",head:"Guess the order",
 tip:"Tap the airports from busiest to least busy. Then see who really flies the most people.",
 items:[["Atlanta","108 million"],["Dubai","92 million"],["Dallas–Fort Worth","88 million"],["Tokyo Haneda","86 million"],["London Heathrow","84 million"]],
 intro:"Five giant airports, all within about 25 million passengers a year of each other. Which handles the most people?",
 after:"Atlanta wins because so many Americans change planes there, on Delta’s home hub, without leaving the country. Dubai has the most international passengers: almost all of its travellers cross a border. (Passengers in 2024, ACI World.)"});
/* Ethnologue (2025), total speakers, first and second language together: the stop's own list. */
const LANGR=rankDef("culture","The most spoken languages",{seed:5,hideStat:1,first:"most spoken",head:"Guess the order",
 tip:"Tap the languages from the most speakers to the fewest, counting everyone who speaks them, not only native speakers.",
 items:[["English","about 1.5 billion"],["Mandarin Chinese","about 1.2 billion"],["Hindi","about 600 million"],["Spanish","about 560 million"],["French","about 310 million"],["Portuguese","about 270 million"]],
 intro:"Six of the world’s biggest languages. Count everyone who can speak each one, as a first or a second language.",
 after:"English comes first only because so many people learn it as a second language; count native speakers alone and Mandarin, with about 940 million, is far ahead, and Spanish comes second. (Ethnologue, 2025.)"});

/* ---------------------------------------------------------------- SORT ON THE GLOBE: a place glows; which group? */
function sortDef(tour,title,o){return{tour,title,globe:true,tip:o.tip,
 card:()=>'<div class="rvg-row rvg-btns">'+o.keys.map(k=>'<button type="button" class="rvg-btn rvg-k" data-k="'+k[0]+'">'+esc(k[1])+"</button>").join("")+'</div><div class="rvg-score"></div>',
 init(L){L.cur=0;L.ans={};L.t=0;
  /* o.veil: [w,s,e,n] — the map's own colours give the answers away there, so they are washed out until every
     answer is in, then revealed */
  if(o.veil){L.veil=svgEl(L.geo,"path",{class:"rvg-veil"});try{const B=o.veil;L.veilF=projFeatures().filter(f=>{const c=d3.geoCentroid(f);return c[0]>B[0]&&c[0]<B[2]&&c[1]>B[1]&&c[1]<B[3]})}catch(e){L.veilF=[]}}
  L.fillG=svgEl(L.geo,"g",{});L.fill=svgEl(L.fillG,"path",{class:"rvg-cfill"});const G=svgEl(L.svg,"g",{});
  L.dots=o.items.map(()=>svgEl(G,"circle",{r:"6",class:"rvg-cdot"}));L.tags=o.items.map(()=>{const d=document.createElement("div");d.className="rvg-tag rvg-small";L.el.appendChild(d);return d});
  L.bub=document.createElement("div");L.bub.className="rvg-tag rvg-bub";L.el.appendChild(L.bub);setTimeout(()=>{if(L.el&&L.el.isConnected)turnTo(L,o.items[0].ll,o.zoom,o.latK)},1400)},
 wire(L){L.card.querySelectorAll(".rvg-k").forEach(b=>b.onclick=()=>{const i=L.cur;if(L.ans[i])return;L.ans[i]={k:b.dataset.k,ok:b.dataset.k===o.items[i].s};L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L.el||!L.el.isConnected)return;const n=o.items.findIndex((x,j)=>!L.ans[j]);if(n>=0){L.cur=n;L._said="";L.dirty=1;turnTo(L,o.items[n].ll,o.zoom,o.latK)}},2200)})},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;const c=L.dots[L.cur];if(c&&!L.ans[L.cur]){c.setAttribute("r",(6+2.5*Math.sin(L.t*5)).toFixed(1));L.fill.style.fillOpacity=(.45+.25*Math.sin(L.t*4)).toFixed(2)}},
 draw(L){let right=0,done=0;const lab=k=>(o.keys.find(x=>x[0]===k)||[])[1];
  L.allIn=o.items.every((x,i)=>L.ans[i]);if(L.veil)L.veil.setAttribute("d",L.allIn?"":L.veilF.map(f=>geoD(f)).join(""));
  o.items.forEach((it,i)=>{const a=L.ans[i],q=proj(L,it.ll),c=L.dots[i];if(q&&!it.code){c.style.display="";c.setAttribute("cx",q[0].toFixed(1));c.setAttribute("cy",q[1].toFixed(1))}else c.style.display="none";
   c.style.fill=a?(a.ok?"#1f8a4c":"#c2364f"):i===L.cur?"#ffd166":"#fff";if(i!==L.cur||a)c.setAttribute("r","6");if(a){done++;if(a.ok)right++}
   const t=L.tags[i],qq=a&&i!==L.cur&&!(o.veil&&L.allIn)?proj(L,it.ll,1):null;if(qq){t.style.display="";const h=(a.ok?"✓ ":"✗ ")+it.n;if(t._h!==h){t.textContent=h;t._h=h}t.style.left=qq[0]+"px";t.style.top=(qq[1]+9)+"px"}else t.style.display="none"});
  const it=o.items[L.cur],a=L.ans[L.cur];
  L.fill.setAttribute("d",it.code&&!(o.veil&&L.allIn)?geoD(feat(it.code)):"");L.fill.style.fill=a?(a.ok?"#1f8a4c":"#c2364f"):o.glow||"#ffd166";if(a)L.fill.style.fillOpacity=".7";
  const q=o.veil&&L.allIn?null:proj(L,it.ll,1);if(q){L.bub.style.display="";const h=a?(a.ok?"Right! ":"No: ")+lab(it.s):it.n+": "+o.ask;if(L.bub._h!==h){L.bub.textContent=h;L.bub._h=h}L.bub.style.left=q[0]+"px";L.bub.style.top=(q[1]-14)+"px"}else L.bub.style.display="none";
  if(L.card){L.card.querySelectorAll(".rvg-k").forEach(b=>{b.disabled=!!a;b.classList.toggle("rvg-right",!!a&&b.dataset.k===it.s);b.classList.toggle("rvg-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   setHTML(L.card.querySelector(".rvg-score"),'<div class="rvg-dots">'+o.items.map((x,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"rvg-ok":"rvg-no":"")+(i===L.cur?" rvg-at":"")+'" title="'+esc(x.n)+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+"</span>")}
  if(done===o.items.length)say(L,"All "+done+": "+right+" right",o.done);
  else if(a)say(L,(a.ok?"Right: ":"Not quite: ")+it.n,it.why);
  else say(L,it.n,o.ask)}}}
/* Polar bears: the Arctic only, around the sea ice (Wikipedia, "Polar bear": Distribution). Penguins: almost all in the
   Southern Hemisphere, from Antarctica to the coasts of South America, southern Africa, Australia and New Zealand; the
   Galápagos penguin is the only one that lives north of the equator, just (Wikipedia, "Penguin" and "Galápagos penguin").
   Churchill, on Hudson Bay, calls itself the polar bear capital of the world; Punta Tombo holds one of the largest
   Magellanic penguin colonies; Boulders Beach has a colony of African penguins. */
const BEARS=sortDef("animals","Polar bears never meet penguins",{zoom:1.2,latK:.5,ask:"polar bear or penguin?",
 tip:"A place glows on the globe. Would you meet polar bears or penguins there? Tap your answer.",
 keys:[["b","🐻‍❄️ Polar bears"],["p","🐧 Penguins"]],
 items:[{n:"Churchill, Hudson Bay",ll:[-94.17,58.77],s:"b",why:"Churchill, in Canada, calls itself the polar bear capital of the world: each autumn the bears gather there, waiting for the bay to freeze."},
  {n:"Punta Tombo, Argentina",ll:[-65.3,-44.05],s:"p",why:"Hundreds of thousands of Magellanic penguins nest here on the coast of Patagonia."},
  {n:"Svalbard",ll:[16,78.2],s:"b",why:"The Norwegian islands of Svalbard lie far north in the Arctic; anyone leaving town must carry protection against the bears."},
  {n:"Cape Town",ll:[18.45,-34.2],s:"p",why:"African penguins nest on Boulders Beach, just outside Cape Town, in the warm south of Africa."},
  {n:"The Galápagos",ll:[-91,-0.4],s:"p",why:"The Galápagos penguin lives right on the equator, kept cool by cold ocean currents. A few nest just north of it: the only penguins in the Northern Hemisphere."},
  {n:"Northern Greenland",ll:[-40,76],s:"b",why:"Polar bears hunt seals on the sea ice all around Greenland."},
  {n:"The Antarctic Peninsula",ll:[-61,-64.5],s:"p",why:"Antarctica is penguin land: Adélie, gentoo and chinstrap penguins nest along its peninsula."},
  {n:"Northern Alaska",ll:[-152,70.6],s:"b",why:"Polar bears live along Alaska’s Arctic coast, hunting on the sea ice of the Beaufort and Chukchi seas."},
  {n:"Phillip Island, Australia",ll:[145.2,-38.5],s:"p",why:"Little penguins, the smallest kind, waddle ashore here at dusk, near Melbourne."}],
 done:"Bears in the north, penguins in the south. Penguins could never walk to the Arctic: the warm tropics in between are a wall they cannot cross, and polar bears need sea ice to hunt from."});
/* NATO's 32 members (nato.int, "NATO member countries"); the EU's 27 (european-union.europa.eu, "Country profiles"). */
const CLUBS=sortDef("politics","The EU is not NATO",{zoom:2,veil:[-30,34,48,72],glow:"#e8590c",ask:"EU, NATO, both or neither?",
 tip:"A country lights up. Is it in the EU, in NATO, in both or in neither? Tap your answer.",
 keys:[["e","EU only"],["n","NATO only"],["b","Both"],["x","Neither"]],
 items:[{n:"Germany",code:"de",ll:[10.4,51.1],s:"b",why:"A founder of both clubs’ forerunners: in NATO since 1955 (West Germany), and a founding member of the European communities."},
  {n:"Norway",code:"no",ll:[9,61],s:"n",why:"A NATO founder in 1949, but its voters said no to the EU twice, in 1972 and 1994."},
  {n:"Austria",code:"at",ll:[14.5,47.5],s:"e",why:"In the EU since 1995, but neutral by law since 1955, so not in NATO."},
  {n:"Turkey",code:"tr",ll:[35,39],s:"n",why:"In NATO since 1952; it applied to join the EU in 1987 and is still waiting."},
  {n:"Finland",code:"fi",ll:[26,63],s:"b",why:"In the EU since 1995, and in NATO since 2023, after Russia’s full invasion of Ukraine."},
  {n:"Switzerland",code:"ch",ll:[8.2,46.8],s:"x",why:"Neutral, and outside the EU too, though it trades closely with it and has no passport checks at its borders."},
  {n:"Ireland",code:"ie",ll:[-8,53.2],s:"e",why:"In the EU since 1973, but neutral and outside NATO."},
  {n:"United Kingdom",code:"gb",ll:[-2,53],s:"n",why:"A NATO founder; it left the EU in 2020."},
  {n:"Sweden",code:"se",ll:[16,62],s:"b",why:"In the EU since 1995, and NATO’s newest member, since 2024."},
  {n:"Serbia",code:"rs",ll:[20.8,44],s:"x",why:"Neither: Serbia has applied to join the EU, but is militarily neutral and has no wish to join NATO."}],
 done:"The map’s colours are back: most European countries are in both clubs, but not all. The EU is about trade, laws and money; NATO is a military alliance that includes the US and Canada."});

/* ---------------------------------------------------------------- the engine: one stop at a time */
const DEFS=[AIRP,LANGR,BEARS,CLUBS];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tour===ps.tour&&d.title===t);if(!D)return null;if(D.globe&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvg-layer";el.innerHTML='<svg class="rvg-sv"><defs><clipPath id="rvgClip"><path class="rvg-clipp" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvgClip)"></g></svg>';host.appendChild(el);
  L.el=el;L.root=el.querySelector("svg");L.svg=el.querySelector("g");L.clipP=el.querySelector(".rvg-clipp");L.geo=svgEl(L.svg,"g",{})}
 try{D.init.call(D,L)}catch(e){console.error(e)}lastT=0;if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvg-ctl").forEach(c=>c.remove());try{if(ps&&ps.card)ps.card.querySelectorAll(".ps-rank,.ps-stat,.ps-body,.ps-more").forEach(e=>e.style.display="")}catch(e){}}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvg-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvg-ctl";
 c.innerHTML='<div class="rvg-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvg-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.rot||[]).join(",")+G.zoom+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.root.setAttribute("width",hr.width);L.root.setAttribute("height",hr.height);
   L.geo.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");
   L.clipP.setAttribute("d","M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z"+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvg-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvg-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvg-sv{position:absolute;left:0;top:0;overflow:visible}
.rvg-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvg-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.rvg-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvg-cdot{stroke:#13294b;stroke-width:2.5}
.rvg-cfill{stroke:#13294b;stroke-width:1.5;transition:fill .3s}
.rvg-veil{fill:#ece6d8;fill-opacity:.94;stroke:#b9b2a3;stroke-width:.6}
.rvg-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvg-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvg-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvg-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.rvg-btn:disabled{cursor:default;opacity:.55}.rvg-btn.rvg-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvg-btn.rvg-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvg-pool{display:flex;flex-wrap:wrap;gap:6px}
.rvg-pool:empty{display:none}
.rvg-chip{border:1px solid #d9682b;background:#fff4ec;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer}
.rvg-chip:hover{background:#d9682b;color:#fff}
.rvg-order{display:flex;flex-direction:column;gap:3px;margin-top:8px}
.rvg-slot{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 8px;border-radius:8px;background:rgba(19,41,75,.06);min-height:24px}
.rvg-slot em{font-style:normal;font-weight:800;width:16px;opacity:.6}.rvg-slot span{flex:1 1 auto;font-weight:700}.rvg-slot b{font-weight:700;font-size:12.5px;white-space:nowrap}.rvg-slot b i{font-style:normal;opacity:.8}
.rvg-slot.rvg-empty span{font-weight:500;opacity:.6;font-style:italic}
.rvg-slot.rvg-ok{background:rgba(31,138,76,.16)}.rvg-slot.rvg-no{background:rgba(194,54,79,.13)}
.rvg-score{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:12.5px}
.rvg-dots{display:flex;gap:4px}.rvg-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvg-dots i.rvg-ok{background:#1f8a4c}.rvg-dots i.rvg-no{background:#c2364f}.rvg-dots i.rvg-at{box-shadow:0 0 0 2px #ffd166}
.rvg-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvg-ep b{display:block;font-size:15px}
.rvg-ep.rvg-new{animation:rvgIn .45s ease}@keyframes rvgIn{from{opacity:.2;transform:translateY(4px)}}
:is(body.dark-theme,body.sky-night) .rvg-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvg-do{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvg-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvg-chip{background:rgba(217,104,43,.18);color:#ffd2b3;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvg-slot{background:rgba(255,255,255,.07)}
:is(body.dark-theme,body.sky-night) .rvg-slot.rvg-ok{background:rgba(31,138,76,.35)}:is(body.dark-theme,body.sky-night) .rvg-slot.rvg-no{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvg-dots i{background:rgba(255,255,255,.15)}
:is(body.dark-theme,body.sky-night) .rvg-veil{fill:#2b3446;stroke:#4b566b}`;document.head.appendChild(s)}

window.gfPolishRvg={v:1,FIX};
})();
