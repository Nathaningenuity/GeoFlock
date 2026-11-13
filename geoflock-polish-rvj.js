/* GeoFlock polish RV-J: a stop-by-stop review of four AP Human Geography tours: Thinking like a geographer (hg1), Data,
   regions and environment (hg1b), Where people live (hg2a) and Models of population (hg2b), each looked at on the globe,
   their default mode, at 1280×860. (The "Empires through time" tour, timeline, was on the list too, but it is retired:
   it is out of PS_TOUR_ORDER, launching it opens the Ancient civilisations tour, and its stops were folded into the
   History tours. So hg2b, the next Human Geography unit, was reviewed instead.)
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours starts (to
      the stops psSteps() builds as well). Each fix says why; changed facts cite their source.
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rvc.js / -rvf.js) the fixed fields
   are made fixed, non-configurable getters whose setters are ignored. A field that is already non-configurable (locked
   by another file) is left alone. Same structure as geoflock-polish-rvf.js, whose control styles are copied here under
   "rvj-" names so the two files never touch each other's controls. */
(function(){
"use strict";
if(window.gfPolishRvj)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvjTest or ?rvjtest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvjTest||/[?&]rvjtest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* drop the text pins / photo pins whose label matches */
const DROP=(S,re)=>{const P=S.pins||[];const Q=P.filter(p=>!re.test(pinText(p)));if(Q.length!==P.length)LOCK(S,"pins",Q)};
const DROPPH=(S,re)=>{const P=S.phPins||[];const Q=P.filter(p=>!re.test(strip(p&&p.label)));if(Q.length!==P.length)LOCK(S,"phPins",Q)};
/* rename a text pin */
const RENAME=(S,re,txt)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p))};
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine itself turns it out from under the card */
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);if(card)LOCK(S,"card",card)};

/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p))};
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p))};
const FIX={
 hg1:{
  /* the Boston photo sat at the globe's edge, half under the card (Boston has its own stop, Time–space compression) */
  "Thinking like a geographer":S=>DROPPH(S,/^Boston/),
  /* Africa, which the purple true-size Greenland is dropped onto, was mostly off the bottom right, under the map key;
     its label, hung from the Congo basin, still ran under the key and over the purple Greenland's own label, so it
     hangs from the Sahara instead */
  "Every flat map distorts":S=>{VIEW(S,[12,30,1],"left");MOVE(S,/^Africa/,[6,19])},
  /* the South China Sea, the claim the stop is mostly about, sat at the globe's right edge */
  "A map in your passport":S=>VIEW(S,[101,24,1.4],"left"),
  /* the card was switched to the right at run time and covered the zoom buttons; back on the left, as written */
  "A coastline in the votes":S=>VIEW(S,[-86,32.6,6],"left"),
  /* London, the other end of the arrow, was cut off at the globe's edge (its photo hidden) */
  "Distance decay and a shrinking world":S=>VIEW(S,[-30,46,1],"left"),
  /* Liverpool, where the race starts, and its Jet airliner / Mayflower / Concorde tags piled up at the globe's edge on
     the zoom buttons */
  "Time–space compression":S=>VIEW(S,[-30,46,1],"left"),
  /* a wheat icon for the US Great Plains (named only under "Tell me more") sat round the back of the globe; the
     framing script in index.html flies to the middle of a stop's icons, so one far-off icon can pull the view away */
  "Density, concentration and pattern":S=>{const I=(S.iconPins||[]).filter(q=>!(q&&q.icon==="wheat"));if(I.length!==(S.iconPins||[]).length)LOCK(S,"iconPins",I)},
  /* the long Bihar label wrapped onto two lines and sat over the middle of India; same form as "Kerala: about 1.8" */
  "Scale changes the story":S=>RENAME(S,/^Bihar/,"Bihar: about 3")
 },
 hg1b:{
  /* the Washington and Tikal photos were pushed out from under the card on long leaders, and the Moynaq photo sat on
     the zoom buttons; both have their own stops later */
  "Data, regions and environment":S=>{DROPPH(S,/^(Washington|Tikal)/);VIEW(S,[20,25,1],"left")},
  /* the globe zooms no closer than this, so both labels hung from the same dot in London, one over the other */
  "Walking the streets":S=>{DROP(S,/^West End/);RENAME(S,/^East End/,"London: Booth’s poverty maps")},
  /* the pump's photo pin repeated the card's own photo; the stop's map game (part 3) shows Snow's map itself */
  "A map that stopped an epidemic":S=>DROPPH(S,/^Broad Street pump/),
  /* the Census Bureau, in Maryland, and its label sat at the globe's edge by the zoom buttons */
  "Counting everyone":S=>VIEW(S,[-84,38,1.8],"left"),
  /* the Texas label ran under the map key and New York sat at the globe's edge */
  "Data decide who gets what":S=>VIEW(S,[-86,37,1.8],"left"),
  /* the London label ran under the card and the Sahara ruler's Red Sea end was cut off at the globe's edge */
  "Formal and functional regions":S=>{VIEW(S,[16,33,1],"left");RENAME(S,/^Functional: London/,"Functional: London’s commuters")},
  /* at the closest zoom the globe allows, the Causeway pin sat on top of Johor Bahru's */
  "One region, two countries":S=>DROP(S,/^The Causeway/),
  /* "the American South" was under the card and "the Middle East" at the globe's edge: 130° apart, they cannot both
     show beside the card. The Middle East (the stop's photo, Riyadh) is framed; the South stays in the text */
  "Perceptual regions":S=>{DROP(S,/American/);VIEW(S,[30,28,1],"left")},
  /* Singapore, the stop's own counter-example and photo, was off the globe's edge under the map key */
  "Does nature decide?":S=>VIEW(S,[80,14,1],"left")
 },
 hg2a:{
  /* the Jakarta photo hung off the globe's edge (Java has its own stop) */
  "Where people live":S=>DROPPH(S,/^Jakarta/),
  /* the five clusters span half the world: West Africa hung from under the card and the eastern United States was
     round the back. The two Asian clusters, the stop's headline, are framed with Europe; the other two stay in the text */
  "The big clusters":S=>{DROP(S,/^(West Africa|Eastern United States)/);MOVE(S,/^Europe/,[28,51]);MOVE(S,/^East Asia/,[110,31]);VIEW(S,[78,32,1],"left")},
  /* New York, Dhaka, Lagos and Shanghai lie so far apart that the globe turned to their middle, over the Arctic: New
     York hung from under the card and Shanghai sat round the edge. Asia's deltas are framed (the headline photo is
     Shanghai); New York and Lagos stay in the text */
  "Coasts and rivers":S=>{DROP(S,/^(New York|Lagos)/);VIEW(S,[104,26,1.3],"left")},
  /* the Amazon label hung from under the card (the rainforest has the next stop to itself), Tibet sat by the zoom
     buttons and the Sahara at the card's edge */
  "Where people avoid":S=>{DROP(S,/^Amazon/);MOVE(S,/^Sahara/,[18,24]);VIEW(S,[52,38,1],"left")},
  /* Mongolia, the other half of the comparison, sat at the top edge, and the purple Bangladesh lay on the
     Ulaanbaatar photo */
  "Arithmetic density":S=>{VIEW(S,[97,37,1.8],"left");const G=(S.ghosts||[]).map(q=>q&&q.code==="bd"?Object.assign({},q,{at:[97,45.5]}):q);if(G.length)LOCK(S,"ghosts",G)},
  /* Bangladesh and Iowa are on opposite sides of the Earth, so the globe turned to their middle, the North Pole, and
     the Iowa label hung over the toolbar. The stop opens on Bangladesh; the buttons in part 3 turn the globe to Iowa */
  "Agricultural density":S=>{AREA(S,/^Iowa/);VIEW(S,[90,24,2],"left")},
  /* the 1790 label lay across the moving-middle game's own "1790" tag and its "Drag me west" handle */
  "America’s moving middle":S=>DROP(S,/^1790/)
 },
 hg2b:{
  /* the two Niger photos hung from under the card on long leaders; with East Asia's four photos half a world away,
     they cannot share the view beside the card. Niger has the tour's next stops */
  "Models of population":S=>DROPPH(S,/^(Niger|Agadez)/),
  /* the card was switched to the right at run time: the People map's indicator menu then covered the Germany label
     and the map key the stop's own title. Card on the left, Niger and Germany framed together */
  "Natural increase and doubling":S=>{VIEW(S,[14.7,32,1.2],"left");RENAME(S,/^Germany/,"Germany: grows only by migration")},
  /* Niger and South Korea are half a world apart: the globe turned to their middle, over Siberia, and Korea's label
     sat under the map key. The stop opens on Niger; the buttons in part 3 turn the globe to Korea */
  "Fertility and replacement":S=>{AREA(S,/^South Korea/);VIEW(S,[8,17,1.4],"left")},
  /* the same for Chad and Japan */
  "Infant mortality":S=>{AREA(S,/^Japan/);VIEW(S,[18.7,15.5,1.4],"left")},
  /* Somalia sat at the globe's edge, by the zoom buttons */
  "Stages 1 and 2: deaths fall first":S=>VIEW(S,[34.8,0,1],"left"),
  /* Bangladesh, the stop's fastest fall, was off the globe's edge */
  "Stage 3: births fall":S=>{RENAME(S,/^Bangladesh/,"Bangladesh: 6 → 2");VIEW(S,[66.9,4,1],"left")},
  /* Niger, the United States and Japan: the globe turned to their middle, the North Pole; Japan hung from under the
     card and Niger's label sat under the map key. The stop opens on Niger; the buttons in part 3 turn to the others */
  "Population pyramids":S=>{AREA(S,/^(USA|Japan)/);VIEW(S,[8,17,1.4],"left")},
  /* as for fertility: Niger and Japan, half a world apart */
  "The dependency ratio":S=>{AREA(S,/^Japan/);VIEW(S,[8,17,1.4],"left")},
  "The epidemiological transition":S=>{AREA(S,/^Japan/);VIEW(S,[8,9.5,1.4],"left")}
 }
};

const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvj fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps());/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f)f(S)}catch(e){}}catch(e){}},300);
try{applyAll()}catch(e){}setTimeout(applyAll,1500);setTimeout(applyAll,6000);

/* The card shift, kept (as geoflock-polish-rvb.js and -rvf.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for four seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["hg1","hg1b","hg2a","hg2b"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".gc3-ctl,.ge2-ctl,.rvj-ctl[data-turns]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. Only stops whose headline holds the
   number (and whose text does not give it away) get one. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* Canuto et al., "Ancient lowland Maya complexity as revealed by airborne laser scanning of northern Guatemala",
     Science 361 (2018): 61,480 structures in 2,144 km² */
  "hg1b|Lasers find lost cities":G("How many hidden Maya structures did the 2018 laser survey find under Guatemala’s forest?",100,1000000,61480,"",{log:1,show:"over 60,000"}),
  /* the stop's own figure: about 300,000 people a day through the two land checkpoints (Woodlands, on the Causeway,
     and Tuas, on the Second Link), the daily total Singapore's Immigration & Checkpoints Authority reports for a normal
     day */
  "hg1b|One region, two countries":G("How many people cross between Malaysia and Singapore by land on a normal day?",1000,1000000,300000,"",{log:1,show:"about 300,000"}),
  /* UN Atlas of the Oceans, "Human settlements on the coast": about 40% of the world's people live within 100 km of
     the coast */
  "hg2a|Coasts and rivers":G("What share of the world’s people live within 100 km of the sea?",0,100,40,"%",{step:1,show:"about four in ten"}),
  /* BPS-Statistics Indonesia, 2020 census: Java 151.6 million of 270.2 million, 56% */
  "hg2a|When one island is too crowded":G("What share of Indonesia’s people live on Java?",0,100,56,"%",{step:1,show:"over half (56%)"}),
  /* Japan, Ministry of Health, Labour and Welfare, vital statistics: 1,823,697 births in 1965, 1,360,974 in 1966 (−25%) */
  "hg2b|The year of the Fire Horse":G("By how much did the number of babies born in Japan fall in 1966?",0,60,25,"%",{step:1,show:"about a quarter"}),
  /* UN World Population Prospects 2024: India about 1.45 billion in 2024, peaking at about 1.7 billion in the early 2060s */
  "hg2b|Still growing, below replacement":G("India has about 1.45 billion people. How many will it have at its peak, even with small families?",1.4,3,1.7,"billion",{step:.05,show:"about 1.7 billion"})
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}


/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvf.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction, and removes everything as soon as the stop changes or
   the tour ends. Next and Back are never blocked; every step is wrapped in try/catch. CSS classes start with "rvj-".
   - hg1  | "Large scale, small scale": put six maps in order from the largest scale to the smallest.
   - hg1b | "A map that stopped an epidemic": John Snow's real map; tap the pump you think spread the cholera.
   - hg1b | "Perceptual regions": formal, functional or perceptual? Sort nine regions.
   - hg2a | "Agricultural density": turn the globe from Bangladesh to Iowa, on the far side of the Earth.
   - hg2a | "Crowded but rich, sparse but stretched": sort six countries by people per km².
   - hg2b | "Natural increase and doubling": set the birth and death rates and watch 100 people grow (or shrink).
   - hg2b | "Fertility and replacement", "Infant mortality", "Population pyramids", "The dependency ratio" and "The
            epidemiological transition": the two (or three) ends of the scale are half a world apart, so no single view
            shows them beside the card; buttons turn the globe from one to the other. */

const NS="http://www.w3.org/2000/svg";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb,D=L.disc;if(D&&Math.hypot(x-D[0],y-D[1])>D[2]-1)return null;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function pathOf(L,pts){let d="",pen=false,px=0,py=0;const G=g(),J=G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function tag(L,cls){const d=document.createElement("div");d.className="rvj-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvj-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvj-new");void e.offsetWidth;e.classList.add("rvj-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvj-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvj-rank"></ol><div class="rvj-pool"></div>'+
  '<div class="rvj-btns"><button type="button" class="rvj-btn rvj-undo">Undo</button><button type="button" class="rvj-btn rvj-show">Show me</button><button type="button" class="rvj-btn rvj-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvj-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvj-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvj-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvj-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvj-ok":"rvj-no"):"")+'"><span class="rvj-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvj-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvj-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvj-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvj-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvj-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvj-show").hidden=L.shown;c.querySelector(".rvj-again").hidden=!L.shown;
  if(!L.order.length)say(L,"","Tap the "+cfg.first.toLowerCase()+" first.");
  else if(!done)say(L,"",(N-L.order.length)+" to go. Next one?");
  else if(L.gave)say(L,"Here is the real order",cfg.after(-1,N));
  else say(L,right===N?"All "+N+" in the right place!":right+" of "+N+" in the right place",cfg.after(right,N))}};}

/* ======================================================================== 1. Large scale or small scale? (hg1)
   The ratios are the stop's own (1:10,000 street map, 1:5,000,000 Britain, 1:50,000,000 world) plus three common map
   types in between; "1 cm on the map" is plain arithmetic (1:10,000 means 1 cm = 10,000 cm = 100 m). */
const SCALE=SORT({tours:["hg1"],title:"Large scale, small scale",
 tip:"Put these maps in order, from the largest scale (most detail) to the smallest.",first:"Largest scale",last:"Smallest scale",desc:false,log:true,bars:false,
 items:[["World map, 1:50,000,000",5e7,"1 cm = 500 km"],["House plan, 1:100",100,"1 cm = 1 m"],["Britain on a page, 1:5,000,000",5e6,"1 cm = 50 km"],["Street map, 1:10,000",1e4,"1 cm = 100 m"],["Road atlas, 1:250,000",2.5e5,"1 cm = 2.5 km"],["Hiking map, 1:50,000",5e4,"1 cm = 500 m"]],
 after:(n,N)=>(n>=0&&n<N?"The right order: house plan, street map, hiking map, road atlas, Britain, world. ":"")+"The smaller the number after the colon, the larger the scale: the house plan shows one building in great detail, the world map the whole planet with almost none. One centimetre on each map stands for the distance shown."});

/* ======================================================================== 2. Formal, functional or perceptual? (hg1b)
   The three kinds of region as the tour (and the AP Human Geography course) defines them: formal = one shared,
   measurable trait; functional (nodal) = tied to a centre by flows; perceptual (vernacular) = in people's heads. The
   examples are the tour's own (the Sahara, French-speaking lands, London's commuters, the Middle East, the South) and
   the course's stock ones (a pizza delivery area, a TV station's reach, the Corn Belt, the Bible Belt). */
const KINDS=[["formal","Formal"],["functional","Functional"],["perceptual","Perceptual"]];
const REGION_ITEMS=[["The Sahara","formal","It shares one trait you can measure: a desert climate."],
 ["A pizza shop’s delivery area","functional","It is defined by trips out from one centre, the shop."],
 ["The Middle East","perceptual","It is real to people, but where it stops depends on who you ask."],
 ["The area a TV station reaches","functional","It is tied to one centre, the transmitter, and fades with distance from it."],
 ["The Corn Belt","formal","It shares one trait: corn is the main crop. (Formal regions can still have fuzzy edges.)"],
 ["The American South","perceptual","A shared sense of place: no official line marks where it begins."],
 ["London’s commuter belt","functional","It is held together by daily trips into one centre, London."],
 ["The Bible Belt","perceptual","A label for a feeling about religion in the US South, not a line anyone measured."],
 ["Lands where French is an official language","formal","They share one measurable trait: the language of law and government."]];
const REGIONS={tours:["hg1b"],title:"Perceptual regions",globe:false,
 tip:"Formal, functional or perceptual? Sort nine regions.",
 card(L){return'<div class="rvj-q"><span class="rvj-n"></span><b class="rvj-item"></b></div><div class="rvj-bins">'+KINDS.map(k=>'<button type="button" class="rvj-btn rvj-bin" data-k="'+k[0]+'">'+k[1]+'</button>').join("")+'</div>'+
  '<div class="rvj-dots">'+REGION_ITEMS.map(()=>"<i></i>").join("")+'</div><div class="rvj-btns"><button type="button" class="rvj-btn rvj-next" hidden>Next ▶</button><button type="button" class="rvj-btn rvj-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;
  c.querySelectorAll(".rvj-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=REGION_ITEMS.length)return;L.ans=b.dataset.k;L.res[L.k]=L.ans===REGION_ITEMS[L.k][1];this.render(L)});
  c.querySelector(".rvj-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvj-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=REGION_ITEMS.length,end=L.k>=N,it=REGION_ITEMS[Math.min(L.k,N-1)];
  c.querySelector(".rvj-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvj-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvj-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvj-good",!!L.ans&&b.dataset.k===it[1]);b.classList.toggle("rvj-bad",!!L.ans&&b.dataset.k===L.ans&&L.ans!==it[1])});
  c.querySelectorAll(".rvj-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvj-y":L.res[i]===false?"rvj-x":i===L.k&&!end?"rvj-now":"");
  c.querySelector(".rvj-next").hidden=end||!L.ans;c.querySelector(".rvj-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvj-again").hidden=!end;
  const name=k=>KINDS.find(x=>x[0]===k)[1].toLowerCase();
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": a perfect score!":r>=6?": well sorted.":""),"Ask three questions: is it one shared trait you could measure (formal), flows to and from a centre (functional), or an idea in people’s heads (perceptual)?")}
  else if(!L.ans)say(L,"","Which kind of region is it?");
  else if(L.ans===it[1])say(L,"Right: "+name(it[1]),it[2]);
  else say(L,"Not quite: it is "+name(it[1]),it[2])}};

/* ======================================================================== 3. Crowded or empty? (hg2a)
   People per km² of land. The tour's own figures: Bangladesh about 1,300, the Netherlands over 500, Japan about 330,
   Egypt about 110, Mongolia about 2. Niger: about 21 (World Bank WDI, population density, 2022: 26.2 million people on
   1.27 million km² of land). */
const DENS=SORT({tours:["hg2a"],title:"Crowded but rich, sparse but stretched",
 tip:"Which country is most crowded? Tap them in order, most people per km² first.",first:"Most crowded",last:"Emptiest",desc:true,log:true,
 items:[["Egypt",110,"about 110"],["Mongolia",2,"about 2"],["Netherlands",520,"over 500"],["Niger",21,"about 21"],["Bangladesh",1300,"about 1,300"],["Japan",330,"about 330"]],
 after:(n,N)=>"People per km² of land. The Netherlands and Japan are crowded and rich; Niger is thinly peopled yet often short of food. Density alone cannot tell you whether a place is overpopulated."});

/* ======================================================================== 4. Births minus deaths (hg2b)
   Rate of natural increase (%) = (crude birth rate − crude death rate) / 10, both per 1,000 a year; doubling time ≈ 70 ÷
   RNI (the "rule of 70", from ln 2 ≈ 0.69). The curve is compound growth, 100 × (1 + RNI/100)^years. Germany 2023
   (Destatis, Statistisches Bundesamt): 692,989 births and 1,028,206 deaths for about 84.7 million people, so a CBR of
   about 8 and a CDR of about 12. */
const DOUBLE={tours:["hg2b"],title:"Natural increase and doubling",globe:false,
 tip:"Set the birth and death rates. How fast does the population grow?",
 card(L){return'<div class="rvj-sl"><label>Births a year per 1,000 people (CBR)</label><div class="rvj-row"><input type="range" class="rvj-rng rvj-b" min="0" max="50" step="1" value="40" aria-label="Crude birth rate"><b class="rvj-val rvj-bv"></b></div></div>'+
  '<div class="rvj-sl"><label>Deaths a year per 1,000 people (CDR)</label><div class="rvj-row"><input type="range" class="rvj-rng rvj-d" min="0" max="30" step="1" value="10" aria-label="Crude death rate"><b class="rvj-val rvj-dv"></b></div></div>'+
  '<div class="rvj-out"><div><span>Natural increase</span><b class="rvj-r"></b></div><div><span>Doubling time</span><b class="rvj-t"></b></div></div>'+
  '<svg class="rvj-ch" viewBox="0 0 300 96" role="img" aria-label="100 people today, and how many there would be over the next 70 years"><path class="rvj-ax" d="M28 8V80H292"/><path class="rvj-c"/><text class="rvj-tx rvj-ty" x="24" y="12" text-anchor="end"></text><text class="rvj-tx" x="24" y="83" text-anchor="end">0</text><text class="rvj-tx" x="28" y="93">now</text><text class="rvj-tx" x="292" y="93" text-anchor="end">70 years</text><text class="rvj-tx rvj-end" x="290" text-anchor="end"></text></svg>'+
  '<div class="rvj-btns"><button type="button" class="rvj-btn rvj-p1">40 and 10</button><button type="button" class="rvj-btn rvj-p2">Germany: 8 and 12</button><button type="button" class="rvj-btn rvj-p3">Challenge</button></div>'},
 wire(L){const c=L.card,b=c.querySelector(".rvj-b"),d=c.querySelector(".rvj-d");L.b=40;L.d=10;L.ch=false;L.won=false;
  const set=(x,y)=>{L.b=x;L.d=y;b.value=x;d.value=y;this.render(L)};
  b.oninput=()=>{L.b=+b.value;this.render(L)};d.oninput=()=>{L.d=+d.value;this.render(L)};
  c.querySelector(".rvj-p1").onclick=()=>{L.ch=false;set(40,10)};c.querySelector(".rvj-p2").onclick=()=>{L.ch=false;set(8,12)};
  c.querySelector(".rvj-p3").onclick=()=>{L.ch=true;L.won=false;set(25,25)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=(L.b-L.d)/10;c.querySelector(".rvj-bv").textContent=L.b;c.querySelector(".rvj-dv").textContent=L.d;
  c.querySelector(".rvj-r").textContent=(r>0?"+":r<0?"−":"")+Math.abs(r).toFixed(1)+"% a year";
  c.querySelector(".rvj-t").textContent=r>=.05?"about "+Math.round(70/r)+" years":r<=-.05?"halves in about "+Math.round(70/-r)+" years":"never: steady";
  const P=t=>100*Math.pow(1+r/100,t),end=P(70),top=Math.max(200,Math.ceil(end/100)*100);
  const X=t=>28+t/70*264,Y=v=>80-v/top*72;let d="";for(let t=0;t<=70;t+=2)d+=(t?"L":"M")+X(t).toFixed(1)+" "+Y(P(t)).toFixed(1);
  c.querySelector(".rvj-c").setAttribute("d",d);c.querySelector(".rvj-ty").textContent=fmt(top);
  const e=c.querySelector(".rvj-end");e.textContent=fmt(end)+" people";e.setAttribute("y",Math.max(18,Y(end)-5).toFixed(1));
  if(L.ch){if(Math.abs(r-2)<.001)L.won=true;
   say(L,L.won?"Done: 2% a year doubles in about 35 years":"Challenge: make 100 people become 200 in 35 years",L.won?"70 ÷ 2 = 35. Many countries grew this fast in the 1960s and 1970s; today Niger grows faster still.":"Move the sliders. Hint: what growth rate does the rule of 70 need?")}
  else if(r>=.05)say(L,"100 people now, about "+fmt(end)+" in 70 years","Doubling every "+Math.round(70/r)+" years means twice the schools, jobs and homes, again and again.");
  else if(r<=-.05)say(L,"More deaths than births: natural decrease","Without migration, 100 people would fall to about "+fmt(end)+" in 70 years. Germany still grows, because people move in.");
  else say(L,"Births and deaths balance","The population holds steady (leaving migration aside).")}};

/* ======================================================================== 5. Which pump? (hg1b)
   John Snow's own map of the 1854 Soho outbreak, as digitised by Waldo Tobler and published in the R package HistData
   (Friendly and Dalzell; data sets Snow.deaths, Snow.pumps and Snow.streets, in Tobler's map units, north up): 578
   deaths, 13 public pumps and the street plan (coordinates rounded to 0.01 unit here). Each death is matched to the
   nearest pump in a straight line: 358 of the 578 (62%) are nearer to the Broad Street pump than to any other (359 with
   the unrounded coordinates). (Snow measured walking distance along the streets,
   which sharpens the pattern further.) */
const SNOW_D="13.59,11.1 9.88,12.56 14.65,10.18 15.22,9.99 13.16,12.96 13.81,8.89 13.1,10.56 11,11.87 15.15,11.7 11.13,9.64 11.71,13.59 12.34,11.48 10.59,11.87 14.57,10.58 16.57,14.32 9.51,10.67 13.34,10.71 15.03,10.19 15.14,10.04 10.87,9.82 12.55,11.98 11.82,11.8 12.19,10.38 13.88,12.75 12.31,11.85 10.97,11.85 10.99,9.76 13.51,13.34 10.81,11.66 12.21,13.64 13.9,13.99 12.52,11.62 15.75,12.65 12.86,9.9 12.99,10.17 13.69,11.41 13.09,11.12 13.42,11.08 14.76,9.37 13.21,13.17 9.85,12.53 12.54,12 13.41,10.25 14.43,11.62 15.99,14.19 10.9,12.01 12.54,13.41 15.84,12.38 16.55,14.35 11.2,8.59 15.78,12.17 11.02,9.78 11.68,13.58 11.55,12.28 11.8,15.08 13.05,13.88 14.14,13.13 14.85,10.01 12.58,11.01 14.64,12.92 12.47,11.21 14.5,8.74 9.22,10.84 17.94,7.19 11.17,14.73 9.49,10.71 10.8,9.93 16.07,14.11 10.38,10.57 13.69,8.98 15.8,13.93 12.17,11.81 11.5,10.73 15.41,11.19 15.91,12.21 10.19,11.92 14,12.78 16.55,11.39 17.52,11.23 13.78,8.86 14.11,10.56 14.69,11.46 12.57,13.44 11.71,10.36 14.37,12.55 15.21,16.96 15.82,13.9 13.9,12.72 15.18,11.59 13.17,12.93 12.65,11.26 15.14,13.2 12.84,11.61 13.55,13.18 14.03,13.07 15.44,13.28 14.85,14.87 10.28,11.37 10.53,11.63 9.93,12.31 14.16,9.24 13.62,12.55 14.96,9.84 15.69,12.38 9.2,11.97 16.83,11.39 13.31,10.32 10.56,11.58 8.31,7.2 13.39,13.04 14.52,8.72 16.81,11.43 14.71,11.92 10.31,11.39 13.16,11.15 9.08,13.22 15.19,9.97 8.44,7.39 15.35,9.82 13.31,12.38 13.23,9.73 12.55,11.55 13.89,10.95 13.49,12.51 15.25,16.97 11.59,11.09 9.44,10.77 11.36,9.6 11.16,14.78 11.9,10.23 15.01,10.21 13.61,11.49 14.11,13.6 10.46,11.21 10.31,9.46 13.78,12.7 13.41,12.43 12.56,11.05 15.66,13.94 13.84,8.91 13.23,12.34 15.12,10.07 13.25,10.51 14.63,11.42 14.39,10.29 15.02,14.11 13.15,10.59 13.39,8.82 11.77,9.53 16.04,14.35 10.63,10.93 14.56,10.6 9.33,12.17 14.51,11.5 10.52,12.32 13.99,12.8 10.55,11.6 10.65,11.71 15.73,6.09 11.8,11.16 11.77,10.27 11.57,11.13 15.76,14.02 10.66,11.68 13.41,13.28 11.25,11.45 15.54,12.76 14.02,10.71 13.4,12.46 14.58,16.19 15.33,13.43 14.47,8.78 11.4,9.89 12.49,11.18 13.78,11.16 10.57,11.03 10.54,11.01 14.76,10.75 14.23,12.04 13.35,11.98 10.44,11.81 12.52,10.58 15,11.99 10.64,9.88 13.13,11.13 10.09,11.47 11.22,11.44 12.91,11.74 12.17,9.97 12.44,11.28 11.92,10.2 11.47,11.38 11.65,13.57 12.46,11.51 14.78,12.31 14.02,12.75 12.5,13.4 9.22,12.33 10.4,11.31 12.75,9.16 9.11,6.34 8.34,7.14 15.32,13.57 11.18,11.42 11.79,11.19 12.71,11.3 11.77,11.23 12.18,13.63 12.68,11.28 13.62,13.39 8.81,15.13 12.22,11.34 16.18,14.29 12.84,11.61 13.61,13.43 12.69,10.21 15.03,11.86 13.91,12.69 13.61,9.08 12.47,13.01 9.87,12.4 17.6,7.34 11.1,11.11 16.66,14.4 9.69,11.01 13.4,13 13.13,10.58 13.74,10.08 11.68,11.13 13.15,11.82 13.12,11.85 12.3,11.88 14.9,12.76 11.54,12.59 12.87,11.62 11.05,11.23 15.78,13.99 12.9,10.34 12.32,11.51 9.79,11.77 12.65,11.26 12.68,12.05 15.96,9.16 11.03,11.88 14.09,9.34 11.03,11.75 14.54,8.68 15.55,11.28 9.58,11.78 15.47,11.1 14.44,12.16 11.38,9.91 13.74,11.31 11.39,11.03 16.02,9.07 9.92,11.86 10.8,9.69 12.63,11.62 9.26,10.66 13.78,13.82 13.76,13.8 14.71,9.97 15.29,10.05 14.15,12.42 13.77,10.09 10.97,11.34 12.37,10.48 14.82,10.04 15.05,13.61 15.36,13.45 12.79,14.31 11.32,9.79 10.45,11.78 11.01,11.21 13.38,9.46 10.34,11.4 9.61,11.81 14.55,12.27 11.45,11.42 12.74,10.74 14.96,11.97 12.32,14.83 12.88,10.78 15.27,9.14 15.78,9.57 13.06,13.85 12.93,11.71 15.28,12.11 13.02,11.79 12.46,11.25 15.77,12.95 14.03,13.36 12.98,14.37 13.88,14.64 10.94,9.73 16.02,14.01 15.1,10.09 13.46,12.57 11.59,12.29 10.7,12 16.84,11.6 13.91,14.6 13.7,11.11 13.29,9.63 15.66,12.37 15.46,11.23 10.99,11.2 15.5,11.12 11.71,9.64 12.36,11.44 11.13,11.53 9.6,10.94 8.33,7.17 14,13.34 13.25,13 15.29,9.34 15.5,11.24 15.39,7.33 16.06,14.32 12.38,13.69 12.19,11.79 15.12,11.69 13.95,12.86 9.62,10.91 16.29,14.34 12.64,10.65 10.49,12.87 13.98,12.83 15.52,11.27 10.96,11.18 13.3,12.92 13.92,13.57 13.32,9.64 12.75,10.71 15.44,11.21 15.69,13.88 13.84,11.06 11.68,10.48 16.07,14.29 12.6,10.99 15.36,11.29 16.28,14.36 12.5,12.07 15.65,12.9 11.55,12.56 14.22,12.07 16.25,10.09 13.62,11.2 12.62,10.36 11.66,11.17 8.77,10.94 10.9,14.7 11.62,11.05 13.04,11.24 13.71,11.3 11.06,11.76 14.57,12.29 10.44,11.56 13.14,12.28 11.88,14.16 13.34,10.34 9.85,12.18 12.74,12.85 9.29,10.63 11.59,9.54 13.12,12.32 11.41,11 13.64,11.51 11.77,13.61 16.27,14.38 8.74,12.05 15.75,12.16 12.19,11.4 14.79,14.09 13.45,8.86 15.74,12.94 11.91,14.17 12.53,12.79 14.37,13.08 12.22,14.14 15.28,11.42 11.54,10.75 9.05,11.21 10.75,8.84 14.95,10.11 13.23,11.91 13.42,8.84 14.36,12.04 12.2,11.37 12,14.57 13.59,11.61 8.76,12.02 13.39,10.97 12.57,12.8 15.56,14.17 12.52,12.03 12.41,11.35 12.37,11.42 13.45,12.6 12.03,11.37 9.94,11.84 12.14,13.63 14.41,13.1 15.71,12.93 13.76,11.14 11.45,10.93 13.8,14.17 15.58,11.3 14.99,10.25 14.11,13.12 13.17,9.84 13.26,12.97 10.93,12.03 12.15,9.95 13.96,13.88 11.26,10.8 13.43,12.97 13.52,12.49 14.77,11.96 12.97,10.95 12.43,11.32 12.35,14.78 13.1,12.35 14.78,13.2 9.81,12.5 14.14,10.57 12.03,14.58 16.1,14.24 12.68,11.28 14.7,10.13 8.84,12.13 10.55,12.33 12.25,14.16 11.74,13.6 8.28,11.57 12.39,13.22 16.73,8.45 15.72,7.18 16.08,14.26 14.27,10.47 9.74,12.36 13.28,12.94 16.07,9.97 14.35,10.35 13.41,10.94 14.52,9.03 14.57,11.39 13.71,13.94 16.24,14.2 16.26,14.42 12.81,14.28 13.36,11.95 11.18,8.62 11.64,12.17 14.74,11.94 9.42,10.79 9.47,10.74 15.71,11.61 14.26,12.49 14.19,13.43 11.48,10.42 15.03,10.36 13.09,12.38 10.96,12.04 11.94,14.17 13.48,8.89 14.06,13.09 10.95,16.49 14.21,9.44 10.38,11.16 15.6,11.32 11.27,11.46 13.02,9.61 13.58,13.14 11.08,11.64 14.6,11.4 15.25,8.63 13.36,10.36 16.14,10.91 14.3,10.43 16.41,14.4 12.59,14.98 13.25,10.82 10.99,12.06 10.1,10.65 15.62,12.56 14.22,13.44 13.37,12.52 10.78,11.65 13.18,10.61 13.81,12.64 11.42,10.97 12.92,9.79 13.61,11.07 13.34,14.33 12.17,11.44 14.37,10.33 8.86,12.11 15.54,14.21 14.32,10.41 10.03,11.28 13.21,14.26 10.49,12.46 9.53,10.64 10.43,11.19 10.93,14.62 13.32,11.02 12.61,10.95 13.08,14.2 11.65,10.46 13.56,10.07 13.38,13.07 13.74,11.13 10.69,12.46 12.19,14.14 13.97,13.32 14.77,9.21 15.08,10.12 16.24,9.91 15.31,11.45 12.55,11.08 14.66,11.44 12.53,11.1 10.91,14.67 15.68,12.91 11.65,12.62 9.5,11.54 13.27,14.8 13.62,15.33 13.43,10.26 13.48,12.54 11.07,11.1 12.93,10.93 12.84,16.02 15.32,9.79 12.78,11.34 9.21,11.08 14.37,12 15.58,10.92 10.41,11.18 12.98,10.66 13.25,11.87 10.96,9.75 13.52,11.01 9.58,10.58 14.54,10.63 12.51,11.14 10.71,12.47 13.32,12.88 9.38,10.96 13.38,11.92 13.52,11.14 13.5,11.04 13.64,9.1 14.26,15.62 9.56,10.62 14.07,15.51 12.94,13.79 15.41,13.81 13.79,12.66 11.42,9.86 12.39,11.38 12.74,11.32 13.59,11.48 14.09,13.1 15.07,10.15 15.28,13.55 14.68,10.15 13.38,12.49 12.28,11.91 14.33,10.37 12.42,11.57 12.06,10.3 12.44,11.54 15.05,10.17 17.27,11.63 12.43,11.91 15.02,12.52";
const SNOW_P=[["Oxford Market",8.65,17.89],["Castle St E",10.98,18.52],["Oxford St #1",13.38,17.39],["Oxford St #2",14.88,17.81],["Gt Marlborough",8.69,14.91],["Crown Chapel",8.86,12.75],["Broad St",12.57,11.73],["Warwick",10.66,7.43],["Briddle St",13.52,7.96],["So Soho",16.43,9.25],["Dean St",18.91,9.74],["Coventry St",16.01,5.05],["Vigo St",9.0,5.1]];
const SNOW_S="16.74,18.7 17.66,18.71|14.46,18.66 16.74,18.7|12.79,18.62 14.46,18.66|11.6,18.59 12.79,18.62|10.97,18.57 11.6,18.59|10.8,18.57 10.97,18.57|8.53,18.52 10.8,18.57|7.36,18.5 8.53,18.52|6.7,18.49 7.36,18.5|6.48,18.48 6.7,18.49|4.99,18.44 6.48,18.48|3.39,18.4 4.99,18.44|9.68,18.21 10.8,18.57|17.66,18.71 19.48,18.73 19.5,18.12|8.66,18.09 8.53,18.52|5.1,18.05 6.48,18.48|4.99,18.44 5.1,18.05|8.77,17.91 9.68,18.21|8.77,17.91 8.66,18.09|17.45,17.9 18.74,18.06 19.5,18.12|17.45,17.9 17.52,18.44 17.66,18.71|17.17,17.87 17.45,17.9|17.17,17.87 16.74,18.7|7.93,17.67 7.88,17.85 8.66,18.09|16.11,17.65 17.17,17.87|16.11,17.65 15.9,18.33 15.51,18.24 15.39,18.34 15.32,18.52|3.73,17.62 5.1,18.05|7.62,17.58 7.93,17.67|7.36,18.5 7.62,17.58|3.41,17.54 3.73,17.62|3.41,17.54 3.39,18.4|15.6,17.52 16.11,17.65|14.97,17.42 15.6,17.52|14.97,17.42 14.46,18.66|6.99,17.4 7.62,17.58|6.99,17.4 6.7,18.49|19.5,18.12 19.53,17.26|14.16,17.26 14.78,17.38 14.97,17.42|8.82,17.2 8.88,17.33 8.77,17.91|19.35,17.18 19.53,17.26|18.51,17.33 19.18,17.56 19.35,17.18|13.39,17.12 13.82,17.2 14.16,17.26|13.39,17.12 12.79,18.62|11.52,17.08 10.97,18.57|8.19,17.01 8.82,17.2|8.15,16.99 8.19,17.01|7.93,17.67 8.15,16.99|5.4,16.94 6.99,17.4|5.1,18.05 5.4,16.94|12.31,16.92 12.74,17 13.39,17.12|12.24,16.91 12.31,16.92|14.16,17.26 14.33,16.49 14.39,16.5|15.32,16.41 14.97,17.42|15.39,16.12 16.07,16.41|15.32,16.41 15.39,16.12|14.02,15.83 15.13,16.36 15.32,16.41|14.02,15.83 13.39,17.12|15.39,16.12 15.51,15.75 15.61,15.62|13.58,15.6 14.02,15.83|14.44,15.01 14.02,15.83|12.24,16.91 11.6,18.59|19.53,17.26 19.54,16.77|19.35,17.18 19.54,16.77|11.16,16.71 12.24,16.91|3.73,17.62 4.24,16.7|8.15,16.99 7.19,16.68 6.99,17.4|10.83,16.65 11.16,16.71|4.29,16.61 5.4,16.94|4.24,16.7 4.29,16.61|17.17,17.87 17.74,16.59|10.32,16.55 10.83,16.65|9.68,18.21 10.32,16.55|19.54,16.77 19.55,16.54|15.6,17.52 16.07,16.41|9.47,16.39 10.32,16.55|9.34,16.97 9.47,16.39|4.24,16.7 3.43,16.38 3.41,17.54|9.09,16.32 9.47,16.39|9.03,16.31 9.09,16.32|8.82,17.2 9.03,16.31|8.37,16.17 9.03,16.31|8.19,17.01 8.37,16.17|18.74,16.15 19.55,16.54|18.74,16.15 18.39,16.88 17.74,16.59|7.87,16.08 8.37,16.17|3.52,16.03 3.94,16.16|3.43,16.38 3.52,16.03|7.38,15.98 7.87,16.08|7.38,15.98 7.19,16.68|16.07,16.41 16.27,15.93|10.83,16.65 11.03,15.86|6.63,15.82 7.38,15.98|5.7,15.63 6.63,15.82|5.4,16.94 5.7,15.63|15.61,15.62 16.27,15.93|17.74,16.59 17.1,16.25 17.42,15.54|5.03,15.52 5.7,15.63|4.91,15.49 5.03,15.52|4.29,16.61 4.91,15.49|18.91,15.38 19.06,15.45 18.74,16.15|13.09,15.36 13.58,15.6|12.31,16.92 13.09,15.36|15.61,15.62 15.69,15.34|10.26,15.67 9.49,15.32|9.09,16.32 9.49,15.32|13.58,15.6 13.67,15.39 13.56,15.31|3.72,15.25 4.91,15.49|3.52,16.03 3.72,15.25|16.59,15.17 17.42,15.54|16.27,15.93 16.59,15.17|3.45,15.17 3.72,15.25|3.45,15.17 3.43,16.38|18.4,15.14 18.91,15.38|9.06,15.13 9.49,15.32|9.06,15.13 8.78,15.77|13.09,15.36 12.21,14.91|17.89,14.9 18.4,15.14|15.69,15.34 15.85,14.84 16.59,15.17|17.42,15.54 17.74,14.83 17.89,14.9|11.8,14.81 11.45,15.61 11.16,16.71|14.55,14.81 15.69,15.34|14.44,15.01 14.55,14.81|13.93,14.75 14.44,15.01|7.87,16.08 7.98,15.22 7.95,15.14 8.16,14.72 9.06,15.13|16.59,15.17 16.65,15.02 16.86,14.55|13.5,14.53 13.93,14.75|13.5,14.53 13.09,15.36|7.24,14.43 6.8,15.3 6.63,15.82|6.01,14.37 5.96,14.59 5.7,15.63|5.36,14.22 6.01,14.37|5.03,15.52 5.13,14.95 5.2,14.96 5.36,14.22|12.69,14.11 13.5,14.53|10.04,14.05 11.8,14.81|9.49,15.32 10.04,14.05|15.86,13.98 15.97,14.06 15.95,14.1 16.86,14.55|15.54,14.11 15.74,14.21 15.86,13.98|12.21,13.86 12.69,14.11|11.8,14.81 12.21,13.86|15.57,13.84 15.86,13.98|19.55,16.54 19.62,13.83|18.91,15.38 19.62,13.83|6.15,13.81 7.24,14.43|6.15,13.81 6.01,14.37|16.86,14.55 17.19,13.8|19.62,13.83 19.63,13.74|11.78,13.64 12.21,13.86|15.15,13.63 15.57,13.84|14.55,14.81 15.15,13.63|8.9,13.56 10.04,14.05|14.04,13.51 13.5,14.53|13.93,14.75 14.32,14.02 14.55,13.5|19.15,13.48 19.63,13.74|18.4,15.14 19,13.79 19.15,13.48|15.15,13.63 15.28,13.38|18.67,13.19 19.15,13.48|17.89,14.9 18.36,13.87 18.67,13.19|13.38,13.16 14.04,13.51|12.69,14.11 12.78,13.94 12.94,13.6 13.1,13.68 13.38,13.16|7.91,13.14 8.9,13.56|7.91,13.14 7.24,14.43|15.57,13.84 15.82,13.32 15.46,13.13|15.28,13.38 15.46,13.13|14.81,13.11 15.28,13.38|6.47,13.03 6.23,13.47 6.15,13.81|13.38,13.16 13.09,13|14.36,12.85 14.81,13.11|14.36,12.85 14.04,13.51|8.9,13.56 8.94,12.83|14.42,12.74 14.36,12.85|7.21,12.74 7.91,13.14|18.67,13.19 17.71,12.65|17.19,13.8 17.58,12.94 17.71,12.65|5.19,12.61 6.47,13.03|6.76,12.49 7.21,12.74|6.76,12.49 6.47,13.03|13.91,12.48 14.42,12.74|7.42,12.48 7.85,12.74|7.42,12.48 7.21,12.74|9.1,12.39 9.55,12.73|8.94,12.83 8.92,12.64 9.1,12.39|4.25,12.31 5.19,12.61|5.36,14.22 3.77,13.7 4.25,12.31|9.55,12.73 9.86,12.29|14.42,12.74 14.71,12.25|13.4,12.2 13.91,12.48|15.46,13.13 15.88,12.14|16.94,12.12 16.49,13.02 16.44,13.02 16.27,13.4 17.19,13.8|8.94,12.83 7.75,12.06 7.42,12.48|17.71,12.65 17.97,12.05|13.01,12 13.4,12.2|12.21,13.86 13.01,12|9.86,12.29 10.05,11.99|14.19,11.97 14.71,12.25|13.91,12.48 14.19,11.97|14.81,13.11 15.27,12.1 15.33,12.02 15.48,12.05 15.52,11.95 15.88,12.14|9.38,11.95 9.86,12.29|9.1,12.39 9.38,11.95|9.55,12.73 10.36,12.97 10.84,11.92|9.38,11.95 9.44,11.85|13.01,12 12.65,11.84|15.88,12.14 16.06,11.72|19.63,13.74 19.69,11.7|10.05,11.99 9.56,11.66|9.44,11.85 9.56,11.66|8.08,11.64 9.1,12.39|8.08,11.64 7.75,12.06|17.97,12.05 18.15,11.64|10.32,11.58 10.84,11.92|10.05,11.99 10.32,11.58|19.42,11.54 19.69,11.7|18.67,13.19 18.97,12.52 19.42,11.54|14.19,11.97 14.42,11.54|12.65,11.84 12.03,11.53 11.59,12.48 11.81,12.61|9.44,11.85 9.21,11.69 9.08,11.66 8.75,11.4|5.87,11.33 6.76,12.49|5.19,12.61 5.46,11.64 5.87,11.33|15.25,11.31 15.64,11.52 15.81,11.61 16.06,11.72|14.71,12.25 15.25,11.31|7.4,11.3 6.76,12.49|13.86,11.28 13.4,12.2|14.42,11.54 13.89,11.22 13.86,11.28|9.84,11.22 10.32,11.58|9.56,11.66 9.84,11.22|7.46,11.19 8.08,11.64|7.4,11.3 7.46,11.19|15.25,11.31 15.36,11.15|16.3,11.12 16.83,11.49 17.14,11.71 17.4,11.81 17.47,11.81 17.97,12.05|16.06,11.72 16.28,11.19 16.3,11.12|12.03,11.53 11.2,11.11|10.84,11.92 11.2,11.11|15.45,10.97 15.84,11.24|15.36,11.15 15.45,10.97|18.46,10.94 18.81,11.15 19.42,11.54|18.15,11.64 18.46,10.94|19.69,11.7 19.71,10.9|19.42,11.54 19.71,10.9|13.13,10.85 13.86,11.28|12.65,11.84 12.79,11.51 13.07,10.96 13.13,10.85|15.36,11.15 14.83,10.85|14.42,11.54 14.69,11.09 14.83,10.85|9.35,10.82 9.84,11.22|9.35,10.82 9.05,11.27|19.71,10.9 19.71,10.82|10.32,11.58 10.77,10.77|5.37,10.69 5.87,11.33|4.93,11.51 5.06,10.88 5.37,10.69|15.64,10.65 16.3,11.12|15.45,10.97 15.64,10.65 15.6,10.62|10.77,10.77 10.86,10.6|12.64,10.56 13.13,10.85|8.98,10.53 9.35,10.82|8.08,11.64 8.98,10.53|14.83,10.85 14.24,10.52 13.89,11.22|10.35,10.47 10.77,10.77|9.84,11.22 10.35,10.47|12.46,10.46 12.64,10.56|12.25,10.85 12.46,10.46|15.17,10.33 15.6,10.62|14.83,10.85 14.97,10.59 15.17,10.33|5.09,10.32 5.37,10.69|16.65,10.3 16.93,10.55 17.11,10.7 17.27,10.87 17.45,11.11 17.83,11.39 18.15,11.64|16.3,11.12 16.44,10.75 16.65,10.3|15.17,10.33 15.07,10.27|12.11,10.25 12.46,10.46|18.77,10.23 19.71,10.82|18.46,10.94 18.55,10.73 18.77,10.23|5.09,10.32 5.07,10.41 4.31,10.2 3.74,12.01 4.25,12.31|11.83,10.06 12.11,10.25|11.2,11.11 11.56,10.46 11.83,10.06|15.07,10.27 15.23,10.06|16.65,10.3 16.95,10.04|7.46,11.19 8.14,10.02|19.71,10.82 19.73,9.97|17.03,9.95 17.23,10.12 17.64,10.42 18.46,10.94|16.95,10.04 17.03,9.95|15.07,10.27 14.53,9.94|4.31,10.2 3.55,9.88 3.45,15.17|16.02,9.83 16.65,10.3|15.6,10.62 16.02,9.83|8.98,10.53 9.56,9.81|11.83,10.06 11.49,9.81|15.23,10.06 14.85,9.78|17.03,9.95 17.22,9.73|15.79,9.66 16.02,9.83|15.79,9.66 15.55,10.03|19.07,9.56 19.73,9.97|18.77,10.23 19.07,9.56|15.6,9.51 15.72,9.61 15.79,9.66|15.23,10.06 15.6,9.51|6.05,9.49 7.4,11.3|6.05,9.49 5.26,10.1 5.11,10.26 5.09,10.32|11.49,9.81 11.03,9.47|10.35,10.47 11.03,9.47|16.32,9.47 16.95,10.04|16.02,9.83 16.32,9.47|15.36,9.3 15.6,9.51|8.14,10.02 6.77,9.17|8.63,9.16 9.56,9.81|8.14,10.02 8.63,9.16|11.03,9.47 10.62,9.16 9.66,10.41|19.07,9.56 19.31,9.09|17.22,9.73 16.55,9.09|16.41,9.28 16.55,9.09|8.63,9.16 8.7,9.06|6.54,9.04 6.05,9.49|12.03,9.02 11.49,9.81|14.99,8.99 15.26,9.22 15.36,9.3|14.99,8.99 14.68,9.38 14.46,9.65 14.02,10.43|10.62,9.16 10.29,8.91|9.56,9.81 10.29,8.91|16.32,9.47 15.73,8.89 15.36,9.3|14.73,8.75 14.88,8.89 14.99,8.99|19.07,9.56 17.91,8.72|17.22,9.73 17.91,8.72|14.69,8.71 14.73,8.75|13.13,10.85 13.16,10.79 13.79,9.86 14.29,9.19 14.69,8.71|16.55,9.09 16.76,8.7|10.29,8.91 9.88,8.6|16.76,8.7 16.89,8.46|11.15,8.38 12.03,9.02|11.15,8.38 10.62,9.16|15.73,8.89 15.68,8.79 15.64,8.75 15.49,8.64 15.39,8.54 15.11,8.32|14.73,8.75 15.11,8.32|18.11,8.28 18.41,8.48 18.69,8.69 18.9,8.84 19.31,9.09|17.91,8.72 18.11,8.28|9.88,8.6 9.73,8.48 9.16,8.23|8.7,9.06 9.07,8.4 9.16,8.23|16.89,8.46 16.5,8.2|15.11,8.32 15.2,8.2|14.14,8.19 14.41,8.45 14.69,8.71|12.64,10.56 13.4,9.19 13.78,8.64 14.14,8.19|12.65,8.11 12.03,9.02|5.02,8.1 6.05,9.49|5.02,8.1 4.31,10.2|17.08,8.09 17.91,8.72|16.89,8.46 17.08,8.09|9.16,8.23 9.25,8.09|3.58,8.07 3.55,9.88|7.04,8 8.7,9.06|9.02,7.98 9.25,8.09 9.36,7.88|18.33,7.82 19.56,8.61 19.31,9.09|18.11,8.28 18.33,7.82|7.04,8 6.89,8.26 6.19,7.8|15.53,7.78 16.76,8.7|15.2,8.2 15.53,7.78|13.67,7.76 14.14,8.19|12.11,10.25 12.74,9.02 13.67,7.76|15.53,7.78 15.56,7.74|19.73,9.97 19.8,7.74|15.32,7.53 15.27,7.58 15.56,7.74|8.21,7.52 9.02,7.98|14.16,7.51 14.43,7.8 14.56,7.66 15.2,8.2|14.96,7.51 15.26,7.76|15.1,7.91 14.84,7.65 14.96,7.51|18.33,7.82 18.51,7.47|8.59,7.47 9.36,7.88|11.79,7.44 12.65,8.11|11.79,7.44 11.15,8.38|19.3,7.44 19.8,7.74|9.88,8.6 10.64,7.41|15.1,7.33 15.32,7.53|14.96,7.51 15.1,7.33|13.19,7.31 13.49,7.58 13.67,7.76|13.19,7.31 12.65,8.11|15.32,7.53 15.5,7.31|8.24,7.23 8.59,7.47|12.04,7.09 11.79,7.44|17.58,7.07 18.51,7.47|17.08,8.09 17.37,7.47 17.58,7.07|4.25,7.07 5.02,8.1|4.25,7.07 3.58,8.07|18.68,7.06 19.3,7.44|18.51,7.47 18.68,7.06|6.19,7.8 5.67,7.41 5.6,7.34 5.61,7.25 5.59,7.2 5.36,7.04|15.56,7.74 15.7,7.39 15.86,7.01|10.64,7.41 9.87,6.96|9.36,7.88 9.87,6.96|6.73,6.96 6.19,7.8|15.86,7.01 15.45,6.93 15.32,7.1|13.54,6.86 13.94,7.19|13.54,6.86 13.19,7.31|11.53,6.99 11.66,6.81 12.04,7.09|15.94,6.78 16.3,7.01 16.82,7.32|15.86,7.01 15.94,6.78|4.25,7.07 3.61,6.63 3.58,8.07|15.94,6.78 15.98,6.65 16,6.6|12.38,6.57 12.72,6.87 13.19,7.31|12.38,6.57 12.04,7.09|9.87,6.96 9.17,6.48 8.59,7.47|16,6.6 14.98,6.47|14.06,6.83 14.59,7.26 14.75,7.07 14.83,7.03 14.93,6.91 14.98,6.47|19.8,7.74 19.83,6.47|19.3,7.44 19.83,6.47|5.85,6.45 6.73,6.96|9.87,6.96 10.2,6.38|9.17,6.48 8.98,6.37|13.95,6.33 14.98,6.47|13.95,6.33 13.54,6.86|8.98,6.37 8.91,6.32|9.98,6.25 10.2,6.38|19.83,6.47 19.07,6.09|18.68,7.06 18.92,6.54 19.05,6.17 19.07,6.09|16,6.6 16.12,6.32 16.22,6.09|8.98,6.37 9.17,6.07|9.61,6.04 9.98,6.25|19.83,6.47 19.84,6.37 19.85,6.03|15.57,5.99 16.22,6.09|11.69,5.93 12.38,6.57|10.64,7.41 11.16,6.57 11.69,5.93 11.55,5.95|4.97,5.92 5.85,6.45|4.97,5.92 4.25,7.07|19.07,6.09 19.09,5.97 19.1,5.84|12.62,5.81 12.38,6.57|12.62,5.81 11.69,5.93|12.94,5.77 12.95,6.2 13.14,6.37|12.94,5.77 12.84,5.79 12.62,5.81|19.26,5.7 19.85,6.03|19.1,5.84 19.26,5.7|19.1,5.84 18.32,5.65|17.58,7.07 17.86,6.52 18.32,5.65|11.55,5.95 10.61,5.64|10.2,6.38 10.61,5.64|18.32,5.65 18.11,5.6|14.49,5.57 14.24,5.98 13.95,6.33|14.49,5.57 12.94,5.77|5.23,5.51 4.97,5.92|18.11,5.6 17.6,5.47 16.98,6.7|17.6,5.47 17.48,5.44|14.9,5.42 14.59,5.53 14.49,5.57|10.61,5.64 9.66,5.33|17.48,5.44 17.03,5.32 16.89,5.28 16.64,5.19|16.22,6.09 16.26,6 16.49,5.54 16.64,5.19|19.26,5.7 19.55,5.15|16.64,5.19 16.51,5.13 16.37,5.11 16.2,5.1 16.01,5.12 15.7,5.2 15.08,5.35 14.9,5.42|9.66,5.33 8.94,5.09 8.78,5.09 7.04,8|16.64,5.19 16.68,5.08|14.66,5.05 14.9,5.42|4.53,5.04 5.23,5.51|10.61,5.64 10.63,5.59 10.7,5.46 10.79,5.35 10.92,5.22 11.1,5.08 11.35,4.97|6.79,4.94 5.85,6.45|8.78,5.09 8.56,5.09 8.02,4.75 6.73,6.96|6.79,4.94 6.27,4.65 6.03,4.92 5.78,5.2 5.55,5.5|16.68,5.08 15.78,4.63|18.71,4.6 19.55,5.15|18.71,4.6 18.11,5.6|13.2,4.57 13.39,4.61 13.56,4.65 13.7,4.69 13.81,4.72 13.95,4.78 14.11,4.85 14.27,4.92 14.41,4.98 14.49,5.01 14.66,5.05|13.2,4.57 12.62,5.81|19.85,6.03 19.89,4.56|19.55,5.15 19.89,4.56|3.7,4.48 4.53,5.04|3.65,4.45 3.7,4.48|3.65,4.45 3.61,6.63|16.68,5.08 16.89,5.14 17.43,4.32|15.78,4.63 15.08,4.27|14.66,5.05 15.08,4.27|17.46,4.25 18.02,4.61 17.48,5.44|17.43,4.32 17.46,4.25|8.02,4.75 7.22,4.24 6.79,4.94|17.46,4.25 17.59,4.07|19.05,4.03 19.89,4.56|19.05,4.03 18.71,4.6|7.22,4.24 6.57,3.83 5.23,5.51|16.55,3.81 17.43,4.32|19.89,4.56 19.89,4.49 19.91,3.7 19.26,3.68 19.05,4.03|16.36,3.68 16.55,3.81|16.36,3.68 15.78,4.63|19.26,3.68 18.5,3.66 19.05,4.03|18.5,3.66 17.86,3.64|17.59,4.07 17.86,3.64 16.81,3.61 17.59,4.07|16.81,3.61 16.76,3.61 16.67,3.61|16.55,3.81 16.67,3.61 16.21,3.59 16.36,3.68|11.63,3.57 11.97,3.75|16.21,3.59 15.48,3.57 15.08,4.27|15.48,3.57 13.69,3.51|15.08,4.27 13.69,3.51 13.2,4.57|13.69,3.51 12.12,3.48|11.97,3.75 12.12,3.48 11.69,3.47|11.63,3.57 11.69,3.47 10.78,3.44|9.66,5.33 10.78,3.44 9.78,3.41 8.78,5.09|9.78,3.41 7.8,3.35|7.22,4.24 7.8,3.35 6.96,3.33|6.57,3.83 6.96,3.33 5.65,3.29|4.53,5.04 5.65,3.29 4.5,3.26|3.7,4.48 4.5,3.26 3.67,3.23 3.65,4.45|11.74,4.81 11.88,5.17 11.55,5.95|11.74,4.81 11.72,4.76|11.35,4.97 11.54,4.83 11.72,4.76 11.91,4.7 12.1,4.64 12.24,4.6 12.31,4.59 12.46,4.57 12.79,4.56 13,4.55 13.11,4.57 13.2,4.57|12.33,3.9 12.46,3.95|12.24,4.6 12.17,4.25 12.33,3.9|11.97,3.75 12.33,3.9|11.35,4.97 11.08,4.49 11.63,3.57";
const SNOWD=SNOW_D.split(" ").map(s=>s.split(",").map(Number));
const SNOW_X0=3.2,SNOW_X1=20.1,SNOW_Y0=3,SNOW_Y1=19,SNOW_W=300,SNOW_H=Math.round(300*(SNOW_Y1-SNOW_Y0)/(SNOW_X1-SNOW_X0));
const sx=x=>((x-SNOW_X0)/(SNOW_X1-SNOW_X0)*SNOW_W).toFixed(1),sy=y=>((SNOW_Y1-y)/(SNOW_Y1-SNOW_Y0)*SNOW_H).toFixed(1);
const SNOW_NEAR=SNOWD.map(([x,y])=>{let b=0,bd=1e9;SNOW_P.forEach((p,i)=>{const d=(p[1]-x)*(p[1]-x)+(p[2]-y)*(p[2]-y);if(d<bd){bd=d;b=i}});return b});
const SNOW_BROAD=SNOW_P.findIndex(p=>p[0]==="Broad St");
const SNOW={tours:["hg1b"],title:"A map that stopped an epidemic",globe:false,
 tip:"578 deaths, 13 water pumps. Tap the pump you think spread the cholera.",
 card(L){const st=SNOW_S.split("|").map(l=>"M"+l.split(" ").map(q=>{const a=q.split(",");return sx(+a[0])+" "+sy(+a[1])}).join("L")).join("");
  return'<svg class="rvj-snow" viewBox="0 0 '+SNOW_W+' '+SNOW_H+'" role="img" aria-label="Snow’s map of Soho: streets, cholera deaths and the 13 water pumps">'+
  '<path class="rvj-st" d="'+st+'"/><g class="rvj-dd">'+SNOWD.map(([x,y],i)=>'<circle cx="'+sx(x)+'" cy="'+sy(y)+'" r="1.9" data-i="'+i+'"/>').join("")+'</g>'+
  '<g class="rvj-pp">'+SNOW_P.map((p,i)=>'<g class="rvj-pump" data-k="'+i+'" tabindex="0" role="button" aria-label="Pump: '+esc(p[0])+'"><circle cx="'+sx(p[1])+'" cy="'+sy(p[2])+'" r="10" class="rvj-hit"/><rect x="'+(+sx(p[1])-4.5).toFixed(1)+'" y="'+(+sy(p[2])-4.5).toFixed(1)+'" width="9" height="9" rx="2"/></g>').join("")+'</g>'+
  '<text class="rvj-pl" text-anchor="middle"></text></svg>'+
  '<div class="rvj-key2"><span><i class="rvj-kd"></i>a death</span><span><i class="rvj-kp"></i>a water pump</span><span><i class="rvj-kn"></i>nearest this pump</span></div>'+
  '<div class="rvj-btns"><button type="button" class="rvj-btn rvj-show">Show me</button></div>'},
 wire(L){const c=L.card;L.k=-1;L.tries=0;L.found=false;
  const pick=k=>{L.k=k;L.tries++;if(k===SNOW_BROAD)L.found=true;this.render(L)};
  c.querySelectorAll(".rvj-pump").forEach(g=>{g.onclick=()=>pick(+g.dataset.k);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(+g.dataset.k)}}});
  c.querySelector(".rvj-show").onclick=()=>{L.gave=!L.found;L.found=true;L.k=SNOW_BROAD;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const k=L.k;
  c.querySelectorAll(".rvj-dd circle").forEach((d,i)=>d.classList.toggle("rvj-near",k>=0&&SNOW_NEAR[i]===k));
  c.querySelectorAll(".rvj-pump").forEach(g=>g.classList.toggle("rvj-on",+g.dataset.k===k));
  const t=c.querySelector(".rvj-pl");if(k>=0){const p=SNOW_P[k];t.textContent=p[0];t.setAttribute("x",Math.min(SNOW_W-40,Math.max(40,+sx(p[1]))));t.setAttribute("y",Math.max(12,+sy(p[2])-9))}else t.textContent="";
  c.querySelector(".rvj-show").hidden=L.found;
  if(k<0){say(L,"","Each dot is one death. Which pump sits in the thick of them?");return}
  const n=SNOW_NEAR.filter(v=>v===k).length,pc=Math.round(n/SNOWD.length*100);
  if(k===SNOW_BROAD)say(L,(L.gave?"The Broad Street pump: ":L.tries===1?"First try! The Broad Street pump: ":"Found it: the Broad Street pump. ")+n+" of "+SNOWD.length+" deaths lived nearer to it than to any other pump","That is "+pc+"% of the deaths around one pump out of thirteen. Snow also found that brewery workers, who drank beer, and a workhouse with its own well escaped. (Here “nearer” is a straight line; Snow measured walking distance along the streets.)");
  else say(L,SNOW_P[k][0]+": "+n+" of "+SNOWD.length+" deaths lived nearer to this pump than to any other",(n<30?"Too few. ":"Some, but not most. ")+"Which pump has the most deaths around it? Tap another.")}};

/* ======================================================================== 6. Two sides of the Earth (hg2a)
   Bangladesh and Iowa, the stop's two examples, are almost opposite each other on the globe, so no single view shows
   both. Two buttons turn the globe from one to the other (the same card-aware flight as psFlyGlobe in index.html). The
   facts are the stop's own. */
function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.35;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}
/* a row of buttons, one per place; the stop opens on the first. places: [name, lon, lat, zoom, text] */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:true,tip:cfg.tip,
 card(L){return'<div class="rvj-btns rvj-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvj-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvj-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvj-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvj-cur",k===L.at);b.textContent=(k===L.at?"● ":"Turn to ")+cfg.places[k][0]});
  const f=cfg.places[L.at];say(L,f[0],f[4])}}}
const TURN=TURNER({tours:["hg2a"],title:"Agricultural density",
 tip:"Bangladesh and Iowa are on opposite sides of the Earth. Turn the globe from one to the other.",
 places:[["Bangladesh",90,24,2,"Over a third of workers farm, most on small plots worked by hand: many farmers per km² of farmland, a high agricultural density."],
  ["Iowa, USA",-93.5,42,2.2,"Under 2% of Americans farm. Big machines work huge fields, so a few farmers cover a lot of land: a low agricultural density."]]});
/* Models of population: the tour keeps comparing Niger (or its neighbours) with East Asia, half a world apart. The
   texts are the stops' own figures. */
const TURN_TFR=TURNER({tours:["hg2b"],title:"Fertility and replacement",tip:"Turn the globe between the two ends of the scale.",
 places:[["Niger",8,17,1.4,"About six children per woman, nearly three times the replacement level of 2.1."],
  ["South Korea",127.5,36.5,1.8,"About 0.7 children per woman, a third of the replacement level of 2.1: each generation is about a third the size of the one before."]]});
const TURN_IMR=TURNER({tours:["hg2b"],title:"Infant mortality",tip:"Turn the globe between the two ends of the scale.",
 places:[["Chad",18.7,15.5,1.4,"More than 50 of every 1,000 babies die before their first birthday."],["Japan",138,36.5,1.8,"Fewer than 3 in 1,000 babies die before their first birthday."]]});
const TURN_PYR=TURNER({tours:["hg2b"],title:"Population pyramids",tip:"Turn the globe to each of the three pyramids.",
 places:[["Niger",8,17,1.4,"Median age about 15: a wide base of children, an expanding pyramid."],["United States",-98,39,1.5,"Median age about 38: fairly straight sides, slow growth."],
  ["Japan",138,36.5,1.8,"Median age about 49: a narrow base and a heavy top, a shrinking pyramid."]]});
const TURN_DEP=TURNER({tours:["hg2b"],title:"The dependency ratio",tip:"Both have many dependants, for opposite reasons. Turn the globe to compare.",
 places:[["Niger",8,17,1.4,"Many dependants because so many people are children: schools and jobs are the challenge."],["Japan",138,36.5,1.8,"Many dependants because so many people are old: pensions and care are the challenge."]]});
const TURN_EPI=TURNER({tours:["hg2b"],title:"The epidemiological transition",tip:"Turn the globe between the two ends of the scale.",
 places:[["Nigeria",8,9.5,1.4,"Life expectancy about 54 years: infections and childbirth still take many lives."],["Japan",138,36.5,1.8,"Life expectancy about 84 years: most people live long enough to die of heart disease and cancer."]]});

/* ---------------- the engine: one stop at a time ---------------- */
const DEFS=[SCALE,REGIONS,DENS,DOUBLE,SNOW,TURN,TURN_TFR,TURN_IMR,TURN_PYR,TURN_DEP,TURN_EPI];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvj-layer rvj-layer";el.innerHTML='<svg class="rvj-sv"><defs><clipPath id="rvjDisc"><path class="rvj-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvjDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvj-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvj-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvj-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvj-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvj-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvj-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty||L.anim){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvj-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

/* ======================================================================== part 4: the People map's banner
   On People map stops the banner at the top of the globe ("Children per woman · Under 1.5, 1.5 to 2.1") is centred,
   and a long one ran under the map key in the top right corner. On these tours it is slid left until it clears the
   key (never under the card), and put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;const k=document.querySelector(".ps-mapkey.at-right");b.style.translate="";bannerMoved=null;if(!k||!k.offsetWidth)return;
 const B=b.getBoundingClientRect(),K=k.getBoundingClientRect();if(!(B.right>K.left-8&&B.bottom>K.top&&B.top<K.bottom))return;
 let dx=K.left-8-B.right;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

{const s=document.createElement("style");s.textContent=`
.rvj-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvj-sv{position:absolute;left:0;top:0;overflow:visible}
.rvj-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvj-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvj-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvj-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvj-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvj-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvj-btn[hidden]{display:none}
.rvj-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvj-ep b{display:block;font-size:15px}
.rvj-ep.rvj-new{animation:rvjIn .45s ease}@keyframes rvjIn{from{opacity:.2;transform:translateY(4px)}}
.rvj-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvj-sortq i{font-style:normal}
.rvj-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvj}
.rvj-rank li{position:relative;counter-increment:rvj;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvj-rank li::before{content:counter(rvj);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvj-rank li.rvj-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvj-rank li.rvj-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvj-nm{flex:1 1 auto;z-index:1}.rvj-v{z-index:1;font-weight:800;white-space:nowrap}
.rvj-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvj-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvj-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvj-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvj-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvj-do,:is(body.dark-theme,body.sky-night) .rvj-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvj-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvj-btn,:is(body.dark-theme,body.sky-night) .rvj-chip,:is(body.dark-theme,body.sky-night) .rvj-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvj-rank li.rvj-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvj-rank li.rvj-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvj-bar{background:rgba(255,178,122,.2)}
.rvj-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvj-rng{flex:1 1 auto;accent-color:#d9682b}.rvj-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvj-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvj-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvj-item{font-size:16px;color:#13294b}
.rvj-bins{display:flex;gap:6px;flex-wrap:wrap}.rvj-bins .rvj-btn[hidden]{display:none}.rvj-bin:disabled{cursor:default;opacity:.55}
.rvj-btn.rvj-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvj-btn.rvj-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvj-dots{display:flex;gap:4px;margin-top:8px}.rvj-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvj-dots i.rvj-now{box-shadow:0 0 0 2px #d9682b inset}.rvj-dots i.rvj-y{background:#1f8a4c}.rvj-dots i.rvj-x{background:#c2364f}
.rvj-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvj-sl .rvj-row{margin-top:2px}.rvj-sl .rvj-val{min-width:36px}
.rvj-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvj-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvj-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvj-out b{font-size:15px;color:#9a4a16}
.rvj-ch{display:block;width:100%;height:auto;margin-top:6px}.rvj-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvj-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvj-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvj-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvj-val,:is(body.dark-theme,body.sky-night) .rvj-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvj-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvj-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvj-n,:is(body.dark-theme,body.sky-night) .rvj-sl label,:is(body.dark-theme,body.sky-night) .rvj-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvj-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvj-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvj-dots i{background:rgba(255,255,255,.18)}
.rvj-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvj-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvj-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvj-dd circle.rvj-near{fill:#d9682b;opacity:1}
.rvj-pump{cursor:pointer;outline:none}.rvj-pump .rvj-hit{fill:transparent}.rvj-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvj-pump:hover rect,.rvj-pump:focus rect{fill:#13294b}.rvj-pump.rvj-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvj-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvj-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvj-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvj-kd{background:#2a2f3a}.rvj-kp{background:#2a78d0;border-radius:2px!important}.rvj-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvj-key2{color:#aab6c8}
.rvj-btn.rvj-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvj-btn.rvj-cur{background:#9fc3ff;color:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRvj={v:1,FIX,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
