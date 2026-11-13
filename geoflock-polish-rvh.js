/* GeoFlock polish RV-H: a stop-by-stop review of four tours, Flags, Cities, Religions (langrel) and Projections, each
   looked at on its default mode (the globe; Projections on its own projection map) at 1280×860.
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours is on (also
      to the stops psSteps() builds). Mostly framing: the tour card covers the left (or right) third of the globe, so West
      Africa, the US end of the Liberia line, Venezuela and Kenya sat under it. Changed facts cite their source.
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3), on the guided tours (`ps`) and on the Projections tour,
      which has its own engine (`pt`, PT_STEPS, #ptCard in index.html).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rvd.js) fixed fields are made fixed,
   non-configurable getters whose setters are ignored; a field already non-configurable (locked by another file) is left
   alone. CSS classes start with "rvh-". */
(function(){
"use strict";
if(window.gfPolishRvh)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ======================================================================== part 1: data fixes */
/* (window.__rvhTest, set only by a test page, keeps the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!window.__rvhTest,enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* like LOCK, but every read gets a new array, so code that pushes onto the field cannot fill it again */
const FRESH=(S,k,f)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!window.__rvhTest,enumerable:true,get:f,set:()=>{}})}catch(e){}};
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?String(p[1]||""):String(p&&p.text||"");
const MOVEPIN=(S,re,at)=>{LOCK(S,"pins",(S.pins||[]).map(p=>Array.isArray(p)&&re.test(p[1])?[at,p[1],p[2]]:p))};

const FIX={
 flags:{
  /* Ghana, Guinea, Mali and Senegal, and the ends of the arrows from Ethiopia, were under the card: turn west so the
     whole band from Dakar to Ethiopia shows beside it */
  "Pan-African colours":S=>{LOCK(S,"globe",[9,7,1.3])},
  /* Japan, whose rising sun the stop is about (the map shows dawn reaching it), was off the right edge */
  "Suns on flags":S=>{LOCK(S,"globe",[84,20,1])},
  /* Libya's flag was half under the card */
  "Pan-Arab colours":S=>{LOCK(S,"globe",[22,24,1.45])},
  /* Australia's flag hung half under the card: turn west so it shows beside the card, with New Zealand, Fiji and Tuvalu */
  "The Union Jack in the corner":S=>{LOCK(S,"globe",[138,-24,1])},
  /* Samoa, one of the five, was off the right edge: turn a little east (Brazil, on the far side of the world, cannot
     show with them) */
  "The Southern Cross":S=>{LOCK(S,"globe",[163,-20,1.15])},
  /* the card sat on the right, over Venezuela and its flag */
  "Three flags from one country":S=>{LOCK(S,"card","left")},
  /* the card sat on the right over Indonesia, and Chad's label ran under the map key on the left */
  "Twins":S=>{LOCK(S,"card","left");LOCK(S,"globe",[44,22,.85])},
  /* Algeria, Tunisia and Mauritania were under the card */
  "The crescent and star":S=>{LOCK(S,"globe",[36,24,1.05])},
  /* the US end of the line from Washington to Liberia was under the card, and the "United States" label ran over the map
     switches above the globe. The US flag has had 27 official versions since 1777 (Smithsonian National Museum of American
     History), so its design changed 26 times, not 27 */
  "Stars and stripes":S=>{LOCK(S,"globe",[-50,24,1]);RE(S,"more","its design has changed 27 times","it has had 27 versions")},
  /* "The equator" label ran under the map key: move it west along the line. The card switched sides from visit to visit,
     sometimes pushing Nauru's flag under the map key: keep it on the left */
  "Flags that are sea charts":S=>{LOCK(S,"card","left");MOVEPIN(S,/^The equator$/,[157,0])},
  /* the card sat on the right, over Kenya, Oman and their flags */
  "Weapons on flags":S=>{LOCK(S,"card","left");LOCK(S,"globe",[14,4,1])}
 },
 cities:{
  /* the Varanasi photo sat under the map key (or, when the card jumped to the right, beside the globe): card on the left
     and the view a little further out, so Athens, the Levant and Varanasi all show beside it */
  "The oldest cities":S=>{LOCK(S,"card","left");LOCK(S,"globe",[45,31,1.15])},
  /* New York, the first of the two, was under the card: turn west and out a little so New York and London both show */
  "Money cities":S=>{LOCK(S,"globe",[-50,42,.95]);
   /* Tokyo is no longer in the top ten of the Global Financial Centres Index (Z/Yen, GFCI 37 and 38, 2025): New York,
      London, Hong Kong, Singapore, San Francisco lead. US exchanges hold about half of the world's stock-market value
      (World Federation of Exchanges, 2024), so "more than every other exchange combined" was too strong */
   RE(S,"body","Hong Kong, Singapore, Shanghai, Tokyo and San Francisco follow the top two in most rankings.","Hong Kong, Singapore and San Francisco come next in the Global Financial Centres Index (2025); Shanghai and Tokyo are Asia’s other big centres.");
   RE(S,"more","together list companies worth more than every other exchange combined","together list companies worth about as much as all the world’s other stock exchanges put together")},
  /* Singapore, second of the busiest ports, was cut off at the bottom of the screen */
  "The busiest ports":S=>{LOCK(S,"globe",[112,15,1.55])},
  /* Singapore's label ran under the map key */
  "Countries that are a city":S=>{LOCK(S,"globe",[48,24,.9])},
  /* the photo pins of Shanghai, Delhi, Dhaka and Jakarta sat on top of the city bubbles of the stop's own game
     (geoflock-interact-human2.js), which carry their names already, and hid the Tokyo and Shanghai labels. Left
     configurable: geoflock-pinfix.js redefines phPins on this stop and logs an error if it cannot */
  "The biggest cities":S=>{try{const d=Object.getOwnPropertyDescriptor(S,"phPins");if(!d||d.configurable)Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get:()=>[],set:()=>{}})}catch(e){}},
  /* the Nairobi and Dar es Salaam photos were under the map key */
  "Africa’s booming cities":S=>{LOCK(S,"globe",[21,4,1.15])},
  /* Guinness World Records' figure for Shinjuku, about 3.6 million passengers a day, was counted before the pandemic */
  "A city the size of a country":S=>{RE(S,"more","Shinjuku station, used by about 3.5 million people a day, is the busiest railway station on Earth","Shinjuku station is the busiest railway station on Earth: Guinness World Records counted about 3.6 million passengers a day there before the pandemic")}
 },
 langrel:{
  /* the card flipped to the right, under the floating religion key; and a stray photo pin, "Ethiopia: 7 to 8 years
     behind" from the calendar stop, sat in Ethiopia on the opening view
     (showing the Bodh Gaya or the Lalibela photo), and the stop's own Indonesia label had gone */
  "What the world believes":S=>{LOCK(S,"card","left");FRESH(S,"phPins",()=>[]);FRESH(S,"pins",()=>[[[113,-1],"Indonesia: about 240 million Muslims","point"]])},
  /* the card sat on the right, over Spain and Portugal where the arrows start; the Chicago pin label ran under the
     culture-map chips and the Chiclayo one under the map key */
  "Catholicism moved west":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-50,6,.95])},
  /* New England, where one arrow ends, and its label were under the card (which also jumped sides between visits) */
  "The Reformation went south":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-28,34,1])},
  /* the Lalibela photo (Ethiopia) hung off the bottom of the screen */
  "Older than Russia’s church":S=>{LOCK(S,"globe",[31,28,1.4])},
  /* Bali, the stop's subject, was off the right edge of the globe, under the map key (card kept on the left, where the
     tour puts it) */
  "Hindu India, Hindu Bali":S=>{LOCK(S,"card","left");LOCK(S,"globe",[106,0,1.15])},
  /* the card sat on the right, over Korea and Japan, and the Xi'an label ran under the culture-map chips on the left */
  "Buddhism left home":S=>{LOCK(S,"card","left");LOCK(S,"globe",[106,24,1.2])},
  /* the Sikhs' three homes, Punjab, Britain and Canada, lie 155° of longitude apart: on the stop's own view the Brampton,
     Canada and United States labels ran over the map switches and Amritsar's under the bottom edge. Looking down from
     over Iceland (the globe turns it beside the card), Punjab, London and Toronto all show */
  "Sikhism’s Punjab":S=>{LOCK(S,"card","left");LOCK(S,"globe",[17,62,1])},
  /* Ethiopia was under the card and the Bangkok photo under the map key */
  "It isn’t 2026 everywhere":S=>{LOCK(S,"globe",[86,20,1.02])},
  /* the card jumped to the right, under the floating religion key, over the Atlantic route the stop draws */
  "Which way is Mecca?":S=>{LOCK(S,"card","left")},
  /* Varanasi and Bodh Gaya, two of the five holy cities, were off the right edge */
  "Holy cities":S=>{LOCK(S,"card","left");LOCK(S,"globe",[48,28,1])},
  /* the Netherlands and Czechia labels ran over the map switches above the globe */
  "The least religious places":S=>{LOCK(S,"card","left");LOCK(S,"globe",[70,26,1])}
 }
};
const applied=new WeakSet();
/* Projections tour (PT_STEPS, its own engine): a map rotation [λ, 0] centres the map on longitude −λ. The card covers the
   left third of the map, so the places a stop is about are turned to the right of it. */
const PTFIX={
 /* Havana, the end of the compass line from Lisbon, was under the card: centre on 63° W */
 "Why sailors loved Mercator":S=>{LOCK(S,"rot",[63,0])},
 /* Tokyo, one end of both routes, was under the card: centre on 174° E, so Tokyo sits just right of the card and New York
    on the right */
 "The shortest way is curved":S=>{LOCK(S,"rot",[-174,0])},
 /* this stop (a diagram stop added by index.html) had no projection of its own, so the map kept the previous stop's
    one, turned to the Pacific: show Mercator with its distortion circles, the subject of the diagram */
 "Same circle, two maps":S=>{if(!S.proj){LOCK(S,"proj","mercator");LOCK(S,"rot",[0,0]);LOCK(S,"tissot",true)}},
 /* Greenland, in its real place, was half under the card: centre on 60° W */
 "Google’s two maps":S=>{LOCK(S,"rot",[60,0])}
};
function applyPT(){try{if(typeof PT_STEPS==="undefined")return;PT_STEPS.forEach(S=>{if(!S||applied.has(S))return;const f=PTFIX[strip(S.title)];if(!f)return;applied.add(S);try{f(S)}catch(e){console.error("rvh pt fix",S.title,e)}})}catch(e){}}

function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvh fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);
/* geoflock-polish-b.js re-sets a few of the same fields (with defineProperty) at load, 1.5 s after the load event and
   4 s after it runs; a locked field would make it throw, so the locks wait until it has finished (or a tour starts) */
const later=()=>{try{applyAll();applyPT()}catch(e){}};
if(document.readyState==="complete")setTimeout(later,3000);else addEventListener("load",()=>setTimeout(later,3000));setTimeout(later,9000);every(applyPT,2000);

/* The globe turns a stop's place out from under the tour card (psFlyGlobe shifts the centre by the card's width), but
   geoflock-tourload.js's "aim" turns it back to the stop's plain centre when that shift is more than 20°, so the framing
   depended on timing. As in geoflock-polish-rvb.js: on these three tours aim is told the stop is already aimed, and for
   four seconds after a stop opens, if the globe has come to rest away from where psFlyGlobe would put it with the card
   where it is now, it flies there once more (twice at most). A drag or zoom by the reader in that time cancels it. */
const MYT=new Set(["flags","cities","langrel"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g)return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||(T[2]>=1&&Math.abs(ps.g.zoom-T[2])>.15)){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* Philippine Statistics Authority, 2020 census: City of Manila 1,846,513 people on 42.88 km², about 43,000 per km² */
  "cities|Packed together":G("How many people live in each square kilometre of the city of Manila?",1000,100000,43000,"",{log:1,show:"about 43,000"}),
  /* Shanghai International Port Group / Lloyd's List One Hundred Ports 2025: Shanghai handled 51.5 million TEU in 2024 */
  "cities|The busiest ports":G("How many containers (TEU) did the port of Shanghai handle in a year?",1,200,51.5,"million",{log:1,show:"about 51.5 million (2024)"}),
  /* Jewish Agency for Israel, Rosh Hashanah 2025 figures (the stop's own source): 15.8 million Jews, 7.2 million in
     Israel and 6.3 million in the US, about 85–86% */
  "langrel|Two homes for most Jews":G("What share of the world’s Jews live in just two countries, Israel and the United States?",0,100,86,"%",{step:1,show:"about 86%"}),
  /* Pew Research Center, "Mapping the Global Muslim Population" (2009): Shia Muslims are 10–13% of all Muslims */
  "langrel|Sunni and Shia":G("What share of the world’s Muslims are Shia?",0,100,12,"%",{step:1,show:"about 10–13%"})
 };
 for(const k in GS)if(!TP.GUESS[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvd.js: a watchdog polls `ps` (and `pt` for Projections), matches the stop by tour and
   title, adds a control block after the stop's headline with a one-line instruction (and, for the globe ones, a layer
   in amGlobe.host drawn with amGlobe.projection()), and removes everything as soon as the stop changes or the tour
   ends. Next and Back are never blocked; every step is wrapped in try/catch.
   - flags       | "Twins": five more look-alike pairs. Which is which? Tap a flag.
   - flags       | "Pan-Slavic colours": sort eight flags into the four colour families met so far.
   - flags       | "Now explore": open the Flag map (geoflock-flagmap.js), every country filled with its own flag.
   - cities      | "The fall line": sail up the James River from the sea; at Richmond the falls stop the ship.
   - langrel     | "It isn’t 2026 everywhere": pick any date and read it in five calendars (the browser's own Intl
                   calendars: Ethiopian, Persian, Islamic Umm al-Qura, Thai Buddhist; Nepal's from its New Year).
   - projections | "Greenland vs Africa": slide the latitude and see how much bigger Mercator draws a country there.
   - projections | "Whose middle?": slide the map's centre round the world.
   - projections | "A better compromise", "Now explore": open "Make your own" (geoflock-projmaker.js). */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const flagSrc=c=>{try{return flagUrl(c,"w320")}catch(e){return""}};
const cname=c=>{try{return COUNTRY_BY_CODE[c].n}catch(e){return c.toUpperCase()}};
function toXY(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function pathOf(L,pts){let d="",pen=false;for(const ll of pts){const q=toXY(L,ll);if(!q){pen=false;continue}d+=(pen?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}return d}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvh-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvh-new");void e.offsetWidth;e.classList.add("rvh-new")}
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel","keydown"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"&&t!=="keydown"}))}
const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};

/* ======================================================================== 1. Twins: which is which?
   Differences: Ireland (green at the flagpole) and Côte d'Ivoire (orange at the flagpole); New Zealand (four red stars
   edged in white) and Australia (six white stars, five of them the Southern Cross plus the seven-pointed Commonwealth
   Star); Slovakia (coat of arms with a double cross on three blue hills, set towards the flagpole) and Slovenia (a
   smaller shield with Mount Triglav and three gold stars, in the upper corner); Poland (white over red) and Indonesia
   (red over white); Senegal (a green star) and Mali (plain). Encyclopaedia Britannica, the flag articles of each
   country; the stop's own "more" names Ireland/Côte d'Ivoire, Poland/Indonesia and (stop "Pan-Slavic colours")
   Slovenia/Slovakia. */
const TWINS=[["ie","ci","Ireland","Green sits at the flagpole on Ireland’s flag; Côte d’Ivoire’s is the mirror image, orange at the flagpole."],
 ["nz","au","New Zealand","New Zealand has four red stars edged in white; Australia has six white stars, one of them the big seven-pointed Commonwealth Star."],
 ["sk","si","Slovakia","Slovakia’s big shield, a white double cross on three blue hills, sits towards the flagpole; Slovenia’s small shield shows Mount Triglav under three gold stars."],
 ["pl","id","Poland","Poland is white over red; Indonesia (and Monaco) are red over white."],
 ["sn","ml","Senegal","Senegal has a green star in the middle; Mali’s green, gold and red bands are plain."]];
const TWIN={tours:["flags"],title:"Twins",globe:false,
 tip:"More twins! Each pair is two different countries. Tap the one you are asked for.",
 card(){return'<div class="rvh-q"></div><div class="rvh-pair"></div><div class="rvh-score"><span class="rvh-dots">'+TWINS.map(()=>"<i></i>").join("")+'</span><button type="button" class="rvh-btn rvh-next" hidden>Next pair →</button></div>'},
 wire(L){L.k=0;L.res=[];this.ask(L)},
 ask(L){const c=L.card;if(!c)return;const p=TWINS[L.k];L.ans=null;L.order=shuffle([0,1]);
  c.querySelector(".rvh-q").innerHTML="<b>Pair "+(L.k+1)+" of "+TWINS.length+":</b> which is <b>"+esc(p[2])+"</b>?";
  const box=c.querySelector(".rvh-pair");box.innerHTML="";
  L.order.forEach(j=>{const b=document.createElement("button");b.type="button";b.className="rvh-flag";b.innerHTML='<img alt="A flag" src="'+esc(flagSrc(p[j]))+'"><span></span>';b.onclick=()=>this.pick(L,j);box.appendChild(b)});
  c.querySelector(".rvh-next").hidden=true;this.dots(L);say(L,"","Look closely: colours, stars, the side nearest the flagpole…")},
 pick(L,j){if(L.ans!=null)return;const p=TWINS[L.k];L.ans=j;const ok=j===0;L.res[L.k]=ok;
  L.card.querySelectorAll(".rvh-flag").forEach((b,i)=>{const jj=L.order[i];b.disabled=true;b.querySelector("span").textContent=cname(p[jj]);b.classList.add(jj===0?"rvh-right":(jj===j?"rvh-wrong":"rvh-other"))});
  say(L,(ok?"Yes! That’s ":"Not quite: that’s ")+cname(p[0])+".",p[3]);
  const nx=L.card.querySelector(".rvh-next");nx.hidden=false;nx.textContent=L.k<TWINS.length-1?"Next pair →":"Play again ↺";
  nx.onclick=()=>{if(L.k<TWINS.length-1)L.k++;else{L.k=0;L.res=[]}this.ask(L)};this.dots(L);
  const done=L.res.filter(x=>x!=null).length;if(done===TWINS.length){const n=L.res.filter(Boolean).length;say(L,n+" out of "+TWINS.length+"!",(n>=4?"A sharp eye for flags. ":"Twins are hard: that is why Chad asked the UN about Romania’s flag. ")+p[3])}},
 dots(L){const d=L.card&&L.card.querySelectorAll(".rvh-dots i");if(!d)return;d.forEach((e,i)=>{e.className=L.res[i]===true?"rvh-ok":L.res[i]===false?"rvh-no":i===L.k?"rvh-at":""})}};

/* ======================================================================== 2. Sort the flag families
   The four families of the tour's earlier stops (Nordic cross, Pan-African, Pan-Arab, Pan-Slavic); each flag here is one
   the tour names in that family. */
const FAM=[["nordic","Nordic cross"],["afr","Pan-African"],["arab","Pan-Arab"],["slav","Pan-Slavic"]];
const SORT=[["se","nordic"],["gh","afr"],["jo","arab"],["cz","slav"],["is","nordic"],["sd","arab"],["ml","afr"],["hr","slav"]];
const SORTER={tours:["flags"],title:"Pan-Slavic colours",globe:false,
 tip:"Four families so far. Tap a flag, then tap its family.",
 card(){return'<div class="rvh-pool"></div><div class="rvh-bins">'+FAM.map(f=>'<button type="button" class="rvh-bin" data-f="'+f[0]+'"><b>'+f[1]+'</b><span class="rvh-in"></span></button>').join("")+'</div>'+
  '<div class="rvh-btns"><button type="button" class="rvh-btn rvh-reset">Start again</button></div>'},
 wire(L){const c=L.card;L.sel=null;L.placed={};L.miss=0;
  c.querySelectorAll(".rvh-bin").forEach(b=>b.onclick=()=>this.drop(L,b.dataset.f));
  c.querySelector(".rvh-reset").onclick=()=>{L.sel=null;L.placed={};L.miss=0;this.render(L)};this.render(L)},
 drop(L,f){if(L.sel==null){say(L,"","First tap a flag in the row above, then its family.");return}const it=SORT[L.sel];
  if(it[1]===f){L.placed[it[0]]=f;L.sel=null;const n=Object.keys(L.placed).length;
   if(n===SORT.length)say(L,"All sorted"+(L.miss?" ("+L.miss+(L.miss===1?" wrong try)":" wrong tries)"):", without a slip!"),"Neighbours borrow each other’s flags on purpose: a cross for the Nordic countries, Ethiopia’s colours for free Africa, the Arab Revolt’s four colours, and Russia’s white, blue and red for the Slavs.");
   else say(L,"Yes: "+cname(it[0])+" is in the "+FAM.find(x=>x[0]===f)[1]+" family.",(SORT.length-n)+" to go.")}
  else{L.miss++;say(L,"Not that one","Look again at "+cname(it[0])+"’s colours"+(it[1]==="nordic"?" and the shape: a cross pushed towards the flagpole.":it[1]==="afr"?": green, gold and red, Ethiopia’s colours.":it[1]==="arab"?": red, white, black and green, from the Arab Revolt of 1916.":": white, blue and red, like Russia’s."))}
  this.render(L)},
 render(L){const c=L.card;if(!c)return;const pool=c.querySelector(".rvh-pool");pool.innerHTML="";
  SORT.forEach((it,i)=>{if(L.placed[it[0]])return;const b=document.createElement("button");b.type="button";b.className="rvh-chipflag"+(L.sel===i?" rvh-sel":"");b.title="Pick this flag";
   b.innerHTML='<img alt="Flag of '+esc(cname(it[0]))+'" src="'+esc(flagSrc(it[0]))+'">';b.onclick=()=>{L.sel=L.sel===i?null:i;this.render(L);if(L.sel!=null)say(L,"","Now tap the family "+cname(it[0])+"’s flag belongs to.")};pool.appendChild(b)});
  if(!pool.children.length)pool.innerHTML='<span class="rvh-done">All eight sorted ✓</span>';
  c.querySelectorAll(".rvh-bin").forEach(b=>{const f=b.dataset.f;b.querySelector(".rvh-in").innerHTML=SORT.filter(it=>L.placed[it[0]]===f).map(it=>'<img alt="'+esc(cname(it[0]))+'" title="'+esc(cname(it[0]))+'" src="'+esc(flagSrc(it[0]))+'">').join("");
   b.classList.toggle("rvh-armed",L.sel!=null)});
  if(!L._said)say(L,"","Which family? Sweden, Ghana, Jordan, Czechia, Iceland, Sudan, Mali and Croatia, shuffled.")}};

/* ======================================================================== 3. The Flag map */
const FLAGMAP={tours:["flags"],title:"Now explore",globe:false,
 tip:"See every flag at once, on its own country.",
 card(){return'<div class="rvh-btns"><button type="button" class="rvh-btn rvh-go">🗺 Open the Flag map</button></div>'},
 wire(L){L.card.querySelector(".rvh-go").onclick=()=>{try{psEnd()}catch(e){}try{window.gfFlagMap.open()}catch(e){console.error(e)}};
  say(L,"","The Flag map, in Study › Flags, fills each country with its own flag: spot the families side by side, Nordic crosses, Pan-African bands and all.")}};

/* ======================================================================== 4. Sail up to the fall line
   The James River is tidal and navigable from Hampton Roads up to Richmond; there the Falls of the James drop about
   32 m (105 ft) over about 11 km (7 miles) (James River Park System, City of Richmond; US National Park Service, "Fall
   Line"). The course below is a simplified line along the river, so distances along it are approximate. */
const JAMES=[[-76.33,36.96],[-76.47,37.03],[-76.62,37.13],[-76.78,37.21],[-76.95,37.25],[-77.11,37.29],[-77.27,37.31],[-77.37,37.38],[-77.42,37.46],[-77.43,37.53],[-77.49,37.54],[-77.55,37.56]];
const FALLS_AT=9;/* index of Richmond in JAMES */
const FALL={tours:["cities"],title:"The fall line",globe:true,
 tip:"Sail a ship up the James River from the sea. How far can it go?",
 card(){return'<svg class="rvh-prof" viewBox="0 0 300 92" role="img" aria-label="Height of the James River from the sea to above Richmond"></svg>'+
  '<div class="rvh-row"><input type="range" class="rvh-rng" min="0" max="1000" step="1" value="0" aria-label="How far upriver"><b class="rvh-val">0 km</b></div>'},
 init(L){L.t=0;L.cum=[0];for(let i=1;i<JAMES.length;i++)L.cum.push(L.cum[i-1]+d3.geoDistance(JAMES[i-1],JAMES[i])*6371);L.tot=L.cum[L.cum.length-1];L.fk=L.cum[FALLS_AT];
  L.river=svgEl(L.svg,"path",{class:"rvh-riv"});L.done=svgEl(L.svg,"path",{class:"rvh-rivd"});L.ship=svgEl(L.svg,"g",{class:"rvh-ship"});
  svgEl(L.ship,"circle",{r:11});const t=svgEl(L.ship,"text",{"text-anchor":"middle",y:5});t.textContent="⛵";L.mark=svgEl(L.svg,"g",{class:"rvh-fmark"});svgEl(L.mark,"circle",{r:6})},
 /* the river's height: sea level up to the falls, then 32 m over the next 11 km */
 h(km){const f=km-this.fk0;return f<=0?0:Math.min(32,32*f/11)},
 at(L,km){for(let i=1;i<JAMES.length;i++)if(km<=L.cum[i]){const u=(km-L.cum[i-1])/(L.cum[i]-L.cum[i-1]);return d3.geoInterpolate(JAMES[i-1],JAMES[i])(u)}return JAMES[JAMES.length-1]},
 wire(L){const c=L.card,r=c.querySelector(".rvh-rng");this.fk0=L.fk;
  /* the profile: distance along the river (x) against height (y) */
  /* tidal stretch on the first 200 px, the falls (the last ~10 km) on the last 80 px, so the climb shows */
  const X=km=>km<=L.fk?10+km/L.fk*200:210+(km-L.fk)/Math.max(1,L.tot-L.fk)*80,Y=h=>78-h*1.8;let d="M"+X(0)+" "+Y(0);for(let k=0;k<=L.tot;k+=1)d+="L"+X(k).toFixed(1)+" "+Y(this.h(k)).toFixed(1);
  c.querySelector(".rvh-prof").innerHTML='<rect x="0" y="0" width="300" height="92" class="rvh-pbg"/><path d="'+d+'L'+X(L.tot)+' 86L10 86Z" class="rvh-pland"/><path d="'+d+'" class="rvh-pline"/>'+
   '<line x1="'+X(L.fk).toFixed(1)+'" x2="'+X(L.fk).toFixed(1)+'" y1="8" y2="86" class="rvh-pfall"/><text x="'+(X(L.fk)-4).toFixed(1)+'" y="16" text-anchor="end" class="rvh-pt">Richmond: the falls</text>'+
   '<text x="12" y="74" class="rvh-pt">Tidal river: sea level</text><text x="286" y="'+(Y(32)+12).toFixed(1)+'" text-anchor="end" class="rvh-pt">+32 m</text><circle r="5" class="rvh-pdot" cx="'+X(0)+'" cy="'+Y(0)+'"/>';
  L.X=X;L.Y=Y;r.oninput=()=>{L.t=+r.value/1000;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const km=L.t*L.tot,h=this.h(km),dot=c.querySelector(".rvh-pdot");dot.setAttribute("cx",L.X(km).toFixed(1));dot.setAttribute("cy",L.Y(h).toFixed(1));
  c.querySelector(".rvh-val").textContent=fmt(km)+" km";const past=km>L.fk+.5;c.querySelector(".rvh-prof").classList.toggle("rvh-stuck",past);
  if(km<5)say(L,"","Hampton Roads, where the James meets Chesapeake Bay. Drag the slider to sail upriver.");
  else if(km<L.fk-4)say(L,"Sailing on the tide","Here the river is still at sea level and the tide comes and goes, so a sea-going ship can sail on. Jamestown, England’s first lasting colony (1607), is on this stretch.");
  else if(!past)say(L,"Journey’s end: Richmond","About "+fmt(L.fk)+" km from the sea the ship can go no further: rapids. Goods were unloaded here and carried on by road or canal, so a town grew at the falls. That is the fall line.");
  else say(L,"Rapids! Only canoes from here","Above Richmond the river climbs about 32 m in 11 km over hard rock, where the uplands begin. The rushing water later turned the mills of Richmond’s first factories.");
  L.dirty=1},
 draw(L){const km=L.t*L.tot;L.river.setAttribute("d",pathOf(L,JAMES));const P=[];for(let k=0;k<=km;k+=1)P.push(this.at(L,k));P.push(this.at(L,km));L.done.setAttribute("d",pathOf(L,P));
  const q=toXY(L,this.at(L,Math.min(km,L.fk)),1);if(q){L.ship.style.display="";L.ship.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")")}else L.ship.style.display="none";
  const m=toXY(L,JAMES[FALLS_AT],1);if(m){L.mark.style.display="";L.mark.setAttribute("transform","translate("+m[0].toFixed(1)+","+m[1].toFixed(1)+")")}else L.mark.style.display="none"}};

/* ======================================================================== 5. Five calendars
   The browser's Intl calendars (Unicode CLDR): "ethiopic" (Amete Mihret), "persian" (Solar Hijri, Iran's official
   calendar), "islamic-umalqura" (Saudi Arabia's Umm al-Qura tables), "buddhist" (Thai solar calendar, year + 543).
   Nepal's Bikram Sambat has no Intl calendar: its New Year (1 Baishakh) falls on 13 or 14 April, so the year is the
   Gregorian year + 57 from mid-April and + 56 before it; shown as "about" near the boundary (Government of Nepal). */
const CALS=[["ethiopic","Ethiopia","🇪🇹"],["persian","Iran","🇮🇷"],["islamic-umalqura","Islamic (religious dates everywhere)","☪"],["buddhist","Thailand","🇹🇭"]];
function calLine(cal,d){try{const f=new Intl.DateTimeFormat("en-GB-u-ca-"+cal,{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});
  const parts=f.formatToParts(d);const get=t=>(parts.find(p=>p.type===t)||{}).value||"";const y=get("year")||get("relatedYear");return{y:+String(y).replace(/[^\d]/g,""),t:get("day")+" "+get("month")+" "+y}}catch(e){return null}}
function nepal(d){const y=d.getUTCFullYear(),m=d.getUTCMonth(),day=d.getUTCDate();const after=m>3||(m===3&&day>=14),edge=m===3&&day>=12&&day<=15;return{y:after?y+57:y+56,edge}}
const CAL={tours:["langrel"],title:"It isn’t 2026 everywhere",globe:false,
 tip:"Pick any date, your birthday perhaps, and read it in five calendars.",
 card(){return'<div class="rvh-row"><input type="date" class="rvh-date" min="1900-01-01" max="2100-12-31" aria-label="A date"><button type="button" class="rvh-btn rvh-today">Today</button></div><div class="rvh-cals"></div>'},
 wire(L){const c=L.card,i=c.querySelector(".rvh-date"),now=new Date();const iso=d=>d.toISOString().slice(0,10);i.value=iso(now);
  i.oninput=i.onchange=()=>this.render(L);c.querySelector(".rvh-today").onclick=()=>{i.value=iso(new Date());this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const v=c.querySelector(".rvh-date").value;if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return;const d=new Date(v+"T12:00:00Z");if(isNaN(d))return;const gy=d.getUTCFullYear();
  let h='<div class="rvh-cal rvh-greg"><span>Gregorian (most of the world)</span><b>'+esc(d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}))+"</b></div>";
  const diff=y=>{const n=y-gy;return n===0?"same year":(n>0?"+":"−")+Math.abs(n)+" years"};
  CALS.forEach(k=>{const r=calLine(k[0],d);if(!r)return;h+='<div class="rvh-cal"><span>'+k[2]+" "+esc(k[1])+"</span><b>"+esc(r.t.replace(/\s+(ERA\d|AP|AH|BE)$/,""))+'</b><em>'+diff(r.y)+"</em></div>"});
  const n=nepal(d);h+='<div class="rvh-cal"><span>🇳🇵 Nepal (Bikram Sambat)</span><b>'+(n.edge?"about ":"")+"year "+n.y+'</b><em>'+diff(n.y)+"</em></div>";
  c.querySelector(".rvh-cals").innerHTML=h;
  const e=calLine("ethiopic",d),ey=e?e.y:0;
  say(L,"In Ethiopia it is "+ey+", in Nepal "+n.y,"The Islamic year is shorter than ours (354 or 355 days), so it slowly catches up: it gains about one year on the Gregorian calendar every 33 years.")}};

/* ---------------- the engine for the guided tours (`ps`) ---------------- */
const DEFS=[TWIN,SORTER,FLAGMAP,FALL,CAL];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if(D.globe&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvh-layer";el.innerHTML='<svg class="rvh-sv"><g></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvh-ctl.rvh-ps").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvh-ctl.rvh-ps");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvh-ctl rvh-ps";
 c.innerHTML='<div class="rvh-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvh-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvh-ctl.rvh-ps"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

/* ======================================================================== the Projections tour (`pt`)
   ptGo (index.html) rebuilds #ptCard on every stop; a watchdog adds the block after the headline when the stop matches. */
/* 6. Mercator's stretch: at latitude φ Mercator draws lengths 1/cos φ times too long, so areas 1/cos² φ times too big
   (any map-projection text, e.g. J. P. Snyder, "Map Projections: A Working Manual", USGS Professional Paper 1395, 1987,
   p. 41). Mid-latitudes, rounded: Singapore 1.3° N, Cairo 30° N, London 51.5° N, Oslo 60° N, the middle of Greenland
   about 72° N, Svalbard 78° N. */
const SPOTS=[[1.3,"Singapore"],[30,"Cairo"],[51.5,"London"],[60,"Oslo"],[72,"Greenland"],[78,"Svalbard"]];
const STRETCH={title:"Greenland vs Africa",tip:"Slide north. How much bigger does Mercator draw a country up there?",
 card(){return'<div class="rvh-merc"><svg viewBox="0 0 300 120" role="img" aria-label="A country at the equator and the same country drawn by Mercator further north"><rect x="0" y="0" width="300" height="120" rx="10" class="rvh-pbg"/>'+
  '<text x="60" y="16" text-anchor="middle" class="rvh-pt">At the equator</text><text x="200" y="16" text-anchor="middle" class="rvh-pt rvh-mlab">Mercator at 0°</text>'+
  '<rect class="rvh-sq0" x="45" y="55" width="30" height="30" rx="2"/><rect class="rvh-sq1" x="185" y="55" width="30" height="30" rx="2"/></svg>'+
  '<div class="rvh-row"><input type="range" class="rvh-rng" min="0" max="80" step="1" value="0" aria-label="Latitude"><b class="rvh-val">0°</b></div><div class="rvh-spots">'+SPOTS.map(s=>'<button type="button" class="rvh-btn" data-lat="'+s[0]+'">'+s[1]+"</button>").join("")+"</div></div>"},
 wire(L){const c=L.card,r=c.querySelector(".rvh-rng");r.oninput=()=>this.render(L,+r.value);c.querySelectorAll("[data-lat]").forEach(b=>b.onclick=()=>{r.value=Math.round(+b.dataset.lat);this.render(L,+b.dataset.lat,b.textContent)});this.render(L,0)},
 render(L,lat,name){const c=L.card;if(!c)return;const k=1/Math.cos(lat*Math.PI/180),a=k*k,s=Math.min(30*k,100);const q=c.querySelector(".rvh-sq1");
  q.setAttribute("width",s.toFixed(1));q.setAttribute("height",s.toFixed(1));q.setAttribute("x",(200-s/2).toFixed(1));q.setAttribute("y",(70-s/2+2).toFixed(1));q.classList.toggle("rvh-clip",30*k>100);
  c.querySelector(".rvh-mlab").textContent="Mercator at "+Math.round(lat)+"°"+(name?" ("+name+")":"");c.querySelector(".rvh-val").textContent=Math.round(lat)+"°";
  const ar=a<10?a.toFixed(1):fmt(a);
  sayPT(c,lat<1?"The same size":"Drawn "+ar+"× too big",lat<1?"At the equator Mercator draws countries at their true size. Slide north…":
   "At "+Math.round(lat)+"° Mercator stretches every distance "+k.toFixed(k<10?2:1)+" times, east–west and north–south alike, so the area comes out "+ar+" times too big"+(lat>=59&&lat<=61?": four times at 60°, as the headline says.":lat>=71&&lat<=73?": that is why Greenland looks as big as Africa, though Africa is 14 times bigger.":lat>=77?". At the pole it would be infinitely big, so Mercator maps simply stop.":"."))}};
/* 7. Choose the middle: the map's centre meridian. proj.rot (index.html) holds each projection's rotation, so the map
   centred on longitude c has rotation [−c, 0]. */
const MIDDLE={title:"Whose middle?",tip:"Slide to choose the middle of your world map.",
 card(){return'<div class="rvh-row"><input type="range" class="rvh-rng" min="-180" max="180" step="5" value="150" aria-label="Centre longitude"><b class="rvh-val">150° E</b></div>'+
  '<div class="rvh-spots"><button type="button" class="rvh-btn" data-c="0">Europe (0°)</button><button type="button" class="rvh-btn" data-c="150">Pacific (150° E)</button><button type="button" class="rvh-btn" data-c="-90">The Americas (90° W)</button><button type="button" class="rvh-btn" data-c="80">India (80° E)</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvh-rng");const set=v=>{r.value=v;this.render(L,+v)};r.oninput=()=>this.render(L,+r.value);c.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>set(b.dataset.c));this.render(L,150,true)},
 render(L,v,first){const c=L.card;if(!c)return;c.querySelector(".rvh-val").textContent=Math.abs(v)+"°"+(v>0?" E":v<0?" W":"");
  if(!first){try{const id=proj.id;proj.rot[id]=[-v,0];cancelAnimationFrame(L.raf);L.raf=requestAnimationFrame(()=>{try{projRender(true)}catch(e){}})}catch(e){}}
  const t=Math.abs(v)<=20?["Europe in the middle","The usual European and American map: the cut runs down the Pacific, so Asia and America sit at opposite edges."]:
   v>=120||v<=-160?["The Pacific in the middle","As in many maps from China, Japan and Australia: now the cut runs down the Atlantic."]:
   v<0?["The Americas in the middle","Africa and Europe on the right, Asia split between the edges."]:["Asia in the middle","The cut now runs between the Americas."];
  sayPT(c,t[0],t[1]+" Nothing about the Earth changed: only where we cut it.")}};
/* 8. Make your own (geoflock-projmaker.js) */
const MAKER=t=>({title:t,tip:t==="Now explore"?"Or build a projection of your own, with sliders.":"Try it yourself: blend between projections with sliders.",
 card(){return'<div class="rvh-btns"><button type="button" class="rvh-btn rvh-go">🛠 Make your own projection</button></div>'},
 wire(L){L.card.querySelector(".rvh-go").onclick=()=>{try{ptEnd()}catch(e){}try{window.gfProjMaker.show(true);if(window.gfProjMaker.preset&&t!=="Now explore")window.gfProjMaker.set({fam:"pseudo",blend:2})}catch(e){console.error(e)}};
  sayPT(L.card,"",t==="Now explore"?"Pick a family, move the sliders, and the panel names the projection you land on and measures how much it bends sizes and shapes.":"In the projection maker, “Pseudo-cylindrical” blends Sinusoidal, Mollweide, Equal Earth, Robinson and Winkel tripel: watch how Greenland and Africa change.")}});
const PDEFS=[STRETCH,MIDDLE,MAKER("A better compromise"),MAKER("Now explore")];
function sayPT(c,head,text){const e=c&&c.querySelector(".rvh-ep");if(!e)return;const k=head+"|"+text;if(e._k===k)return;e._k=k;e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvh-new");void e.offsetWidth;e.classList.add("rvh-new")}
let PL=null;
every(()=>{try{const on=typeof pt!=="undefined"&&pt&&typeof PT_STEPS!=="undefined";const card=document.getElementById("ptCard");
 const S=on?PT_STEPS[pt.i]:null,D=S?PDEFS.find(d=>d.title===strip(S.title)):null;
 if(!D||!card){if(PL){try{cancelAnimationFrame(PL.raf)}catch(e){}PL=null}return}
 if(PL&&PL.D===D&&PL.card&&PL.card.isConnected&&PL.i===pt.i)return;
 const at0=card.querySelector(".ps-stat");if(!at0)return;card.querySelectorAll(".rvh-ctl").forEach(x=>x.remove());
 const c=document.createElement("div");c.className="rvh-ctl";c.innerHTML='<div class="rvh-do">'+esc(D.tip)+"</div>"+D.card()+'<div class="rvh-ep"></div>';at0.after(c);quiet(c);
 PL={D,card:c,i:pt.i};try{D.wire(PL)}catch(e){console.error(e)}}catch(e){}},300);

{const s=document.createElement("style");s.textContent=`
.rvh-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvh-sv{position:absolute;left:0;top:0;overflow:visible}
.rvh-riv{fill:none;stroke:#2f8fe0;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;opacity:.55}
.rvh-rivd{fill:none;stroke:#d9682b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rvh-ship circle{fill:#fff;stroke:#13294b;stroke-width:2}.rvh-ship text{font-size:13px}
.rvh-fmark circle{fill:#c2364f;stroke:#fff;stroke-width:2.5}
.rvh-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvh-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvh-q{font-size:14px;margin-bottom:6px}
.rvh-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rvh-flag{border:2px solid rgba(19,41,75,.15);background:#fff;border-radius:10px;padding:8px 6px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;font:700 12.5px inherit;color:#13294b;font-family:inherit}
.rvh-flag img{display:block;max-width:100%;height:58px;width:auto;box-shadow:0 1px 4px rgba(0,0,0,.25)}
.rvh-flag span{min-height:1.2em}.rvh-flag:not(:disabled):hover{border-color:#d9682b}
.rvh-flag.rvh-right{border-color:#1f8a4c;background:#e8f6ee}.rvh-flag.rvh-wrong{border-color:#c2364f;background:#fbeaee}.rvh-flag:disabled{cursor:default}
.rvh-btns,.rvh-spots{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvh-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvh-btn:hover{border-color:#d9682b}
.rvh-score{display:flex;align-items:center;gap:10px;margin-top:8px}.rvh-score .rvh-btn{flex:0 0 auto}
.rvh-dots{display:flex;gap:4px;flex:1 1 auto}.rvh-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvh-dots i.rvh-ok{background:#1f8a4c}.rvh-dots i.rvh-no{background:#c2364f}.rvh-dots i.rvh-at{box-shadow:0 0 0 2px #ffd166}
.rvh-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvh-ep b{display:block;font-size:15px}
.rvh-ep.rvh-new{animation:rvhIn .45s ease}@keyframes rvhIn{from{transform:translateY(4px)}}
.rvh-pool{display:flex;flex-wrap:wrap;gap:6px;min-height:36px;align-items:center}
.rvh-chipflag{border:2px solid transparent;background:none;padding:2px;border-radius:6px;cursor:pointer;line-height:0}
.rvh-chipflag img{height:30px;width:auto;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.rvh-chipflag.rvh-sel{border-color:#d9682b;transform:translateY(-3px);box-shadow:0 4px 10px rgba(217,104,43,.35)}
.rvh-done{font-weight:800;color:#1f8a4c;font-size:13px}
.rvh-bins{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.rvh-bin{border:1.5px dashed rgba(19,41,75,.3);background:#fff;border-radius:10px;padding:6px 8px;min-height:52px;cursor:pointer;text-align:left;font-family:inherit;color:#13294b}
.rvh-bin b{display:block;font-size:12px}.rvh-bin.rvh-armed{border-color:#d9682b;border-style:solid}
.rvh-in{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.rvh-in img{height:16px;width:auto;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.rvh-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvh-rng{flex:1 1 auto;accent-color:#d9682b}.rvh-val{min-width:60px;text-align:right;font-size:15px;color:#9a4a16}
.rvh-prof{display:block;width:100%;height:auto;border-radius:10px}
.rvh-pbg{fill:#eaf4fb}.rvh-pland{fill:#b9cf9a}.rvh-pline{fill:none;stroke:#2f8fe0;stroke-width:3}.rvh-pfall{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 3}
.rvh-pt{font:700 9.5px system-ui,sans-serif;fill:#13294b}.rvh-pdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rvh-date{flex:1 1 auto;font:inherit;font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid rgba(19,41,75,.25);background:#fff;color:#13294b}
.rvh-row .rvh-btn{flex:0 0 auto}
.rvh-cals{display:flex;flex-direction:column;gap:4px;margin-top:8px}
.rvh-cal{display:grid;grid-template-columns:1fr auto;gap:0 8px;padding:5px 9px;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.1)}
.rvh-cal span{font-size:11.5px;color:rgba(19,41,75,.7);grid-column:1/-1}.rvh-cal b{font-size:14px;color:#13294b}.rvh-cal em{font-style:normal;font-size:12px;font-weight:700;color:#9a4a16;align-self:center}
.rvh-greg{background:#13294b}.rvh-greg span{color:rgba(255,255,255,.75)}.rvh-greg b{color:#fff}
.rvh-merc svg{display:block;width:100%;height:auto}
.rvh-sq0{fill:#7f9a55;stroke:#4c6131}.rvh-sq1{fill:#d9682b;stroke:#9a4a16;opacity:.85;transition:all .15s}
#ptCard .rvh-ctl{max-width:100%}
:is(body.dark-theme,body.sky-night) .rvh-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvh-do,:is(body.dark-theme,body.sky-night) .rvh-val,:is(body.dark-theme,body.sky-night) .rvh-cal em{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvh-btn,:is(body.dark-theme,body.sky-night) .rvh-bin,:is(body.dark-theme,body.sky-night) .rvh-flag,:is(body.dark-theme,body.sky-night) .rvh-date,:is(body.dark-theme,body.sky-night) .rvh-cal{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvh-cal b,:is(body.dark-theme,body.sky-night) .rvh-bin b{color:#fff}:is(body.dark-theme,body.sky-night) .rvh-cal span{color:rgba(255,255,255,.7)}
:is(body.dark-theme,body.sky-night) .rvh-flag.rvh-right{background:rgba(31,138,76,.3)}:is(body.dark-theme,body.sky-night) .rvh-flag.rvh-wrong{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvh-pbg{fill:#1d2b44}:is(body.dark-theme,body.sky-night) .rvh-pt{fill:#e8eefc}:is(body.dark-theme,body.sky-night) .rvh-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}

window.gfPolishRvh={v:1,FIX,L:()=>L,PL:()=>PL,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
