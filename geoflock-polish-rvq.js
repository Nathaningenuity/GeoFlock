/* GeoFlock polish RV-Q: a stop-by-stop review of three guided tours, Food (food), Landmarks (landmarks) and Explorers
   (explorers), each looked at on the globe, their default mode, at 1280×860. (Music & sport, musicsport, was on the list
   too, but it is retired; the next on the fallback list, People, is reviewed in geoflock-polish-rvs.js, as are Human
   origins and Island life, so they are left to it.)
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on (to the stops psSteps() builds as
      well). Each fix says why; changed facts cite their source. Every stop keeps its card on the left: several opened
      it on the right, where it covered the place the stop is about and pushed the map key over the left of the globe.
   2. Stops you can play with (listed in DEFS at the end of part 2), and guess-first questions through
      geoflock-tourplay.js.
   The structure, helpers and engine are copied from geoflock-polish-rvo.js under "rvq" names, so the two never touch
   each other's controls. geoflock-sweep-tours*.js re-set framing on every psGo, so the fixed fields are made fixed,
   non-configurable getters whose setters are ignored; a field that is already non-configurable is left alone.
   On these relief-map stops the map key sits in the bottom right corner (about x 1014–1264, y 512–840 at 1280×860),
   the legend of a stop's highlights at the globe's top right (x 760–990, y 211–265) and the zoom buttons at x 992–1028,
   y 230–425. index.html sets each photo square out from its place, away from the globe's middle, so a photo far from
   the middle lands on the card, the buttons or the key: the stops are framed so their photos sit near the middle, and
   a place too far away keeps a label instead of its photo. */
(function(){
"use strict";
if(window.gfPolishRvq)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvqTest or ?rvqtest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvqTest||/[?&]rvqtest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* drop the text pins / photo pins whose label matches */
const DROP=(S,re)=>{const P=S.pins||[];const Q=P.filter(p=>!re.test(pinText(p)));if(Q.length!==P.length)LOCK(S,"pins",Q)};
/* (index.html builds a stop's photo squares once per stop, by index: if the stop is already on screen, its squares are
   rebuilt so the photos match their places) */
const DROPPH=(S,re)=>{const P=S.phPins||[];const Q=P.filter(p=>!re.test(strip(p&&p.label)));if(Q.length!==P.length){LOCK(S,"phPins",Q);try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}}};
/* rename a text pin */
const RENAME=(S,re,txt)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p))};
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine itself turns it out from under the card */
const VIEWED=new WeakMap();
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);VIEWED.set(S,g);if(card)LOCK(S,"card",card)};
/* index.html's wrapper of psGlobeTarget flies to the middle of all a stop's pins, photos and icons whenever more of them
   are in sight from there; on these tours that turned the globe to points half a world apart (Three grains to the North
   Atlantic, Coffee to the Gulf of Guinea). A stop framed here (on the globe, not the flat map) gets exactly its frame. */
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvq)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvq,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvq=1;window.psGlobeTarget=w}catch(e){}})(0);

/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p))};
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p))};
/* rename a photo pin's label (the short label under the photo square) */
const PHLABEL=(S,re,txt)=>{const P=S.phPins||[];if(!P.some(p=>p&&re.test(strip(p.label))))return;LOCK(S,"phPins",P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p))};
/* add an "area" label (left out of the stop's framing, shown whenever it is on the visible side of the globe) */
const ADDAREA=(S,ll,txt)=>{const P=S.pins||[];if(P.some(p=>pinText(p)===txt))return;LOCK(S,"pins",P.concat([[[ll],txt,"area"]]))};
/* a country named twice, by its flag tag and again by a plain label: the plain label goes (as geoflock-sweep-tours3.js
   does for its own tours) */
const FLAGDUP=S=>{try{const F=S.flagTags;if(!Array.isArray(F)||!F.length)return;const N=new Set(F.map(f=>strip(f&&f.name).toLowerCase()));
 const P=S.pins||[];const Q=P.filter(p=>!(Array.isArray(p)&&N.has(pinText(p).toLowerCase())));if(Q.length!==P.length)LOCK(S,"pins",Q)}catch(e){}};
/* drop the icon pins with this icon name */
const DROPICON=(S,re)=>{const P=S.iconPins||[];const Q=P.filter(p=>!re.test(String(p&&p.icon)));if(Q.length!==P.length)LOCK(S,"iconPins",Q)};
/* drop the icon pins at one place ([lon, lat], within half a degree) */
const DROPICON2=(S,ll)=>{const P=S.iconPins||[];const Q=P.filter(p=>!(p&&p.at&&Math.abs(p.at[0]-ll[0])<.5&&Math.abs(p.at[1]-ll[1])<.5));if(Q.length!==P.length)LOCK(S,"iconPins",Q)};
const FIX={
 food:{
  /* seven photos spread round the world: the Andes and the Banda Islands were round the back, Côte d'Ivoire's under the
     card, Yunnan's on the zoom buttons and Sri Lanka's under the map key. The opening card covers the left of the globe
     and index.html sets each photo square out from its place, away from the globe's middle, so only photos near the
     middle stay clear of the card, the zoom buttons and the key: Naples and Ethiopia are framed there. The other five
     each have their own stop later. (The frame suits the globe turned out from under the card or not: on a
     tour's very first launch the opening is sometimes not turned) */
  "Food of the world":S=>{DROPPH(S,/^(Andes|Banda|Yunnan|Sri Lanka|Côte)/);VIEW(S,[28,24,1])},
  /* the three hearths are 140° and more apart: maize's was round the back and rice's label on the zoom buttons. The
     stop opens on the Fertile Crescent; buttons (part 2) turn the globe to each hearth and name it, so the rice and maize
     pins (and a second "Yangtze: rice" pin that repeated the first) go */
  "Three grains, three cradles":S=>{DROP(S,/^(Yangtze: rice|Rice: the Yangtze|Maize: southern Mexico)/);VIEW(S,[46,32,1.4])},
  /* Mexico sat under the card (its photo, pushed out from under it, floated in mid-Atlantic) and Italy's photo was on
     the zoom buttons. The stop opens on Italy and Ireland, from its headline (the Andes have their own stop next); a sorting
     game (part 2) turns the globe to each food's home in turn, Mexico and the Andes included */
  "Before 1492":S=>{DROPPH(S,/^(Mexico|Andes)/);VIEW(S,[18,30,1])},
  /* the card was on the right, over northern Italy, and the map key (pushed left) covered Oaxaca and the cotton South */
  "Maize without the recipe":S=>{VIEW(S,[-48,30,1])},
  /* card on the right and the map key over Lake Titicaca; China's photo and potato were round the back (China has a
     word in the stop's headline, but the stop is about the Andes and Ireland). Titicaca and Ireland are too far apart for
     both photos: Ireland's square, pushed out from the globe's middle, sat over the search box, so Ireland keeps its
     potato and a label */
  "From Titicaca to Ireland":S=>{DROPPH(S,/^(China|Ireland)/);DROPICON2(S,[104,34]);ADDAREA(S,[-8,53.2],"Ireland: the famine");VIEW(S,[-30,-5,1])},
  /* Brazil and Colombia under the card, Ethiopia's photo on the zoom buttons and Mocha under the map key. The stop opens
     on Ethiopia and Yemen; buttons (part 2) follow coffee's journey from there */
  /* the Banaue terraces' label was under the map key */
  "Rice feeds Asia":S=>{VIEW(S,[125,8,1])},
  "Coffee from Ethiopia":S=>{AREA(S,/^(Brazil|Colombia|Vietnam|Indonesia|Istanbul)/);VIEW(S,[38,21,1.5])},
  /* Elmina's photo was under the map key; 75° east of Jamaica, its square (set out from the globe's middle) always
     landed on the key or the zoom buttons, so Elmina keeps a label */
  "The sugar islands":S=>{DROPPH(S,/^Elmina/);ADDAREA(S,[-1.35,5.08],"Elmina: a slave-trading fort");VIEW(S,[-24,-12,1])},
  /* the Maya photo sat under the card and São Tomé under the map key, at the globe's edge. The stop is about cocoa in
     West Africa; the Maya and Aztecs are in its text */
  "Chocolate moved to Africa":S=>{DROPPH(S,/^Maya/);VIEW(S,[15,0,1])},
  /* the globe turned to the middle of all its pins, the Mediterranean: the Banda Islands and Ternate, the stop's subject,
     were round the back. Framed on the Indian Ocean (Venice and Lisbon, at the far end of the spice route, stay on the
     ruler's end and in the text) */
  "The Spice Islands":S=>{VIEW(S,[124,-4,1])},
  /* the United States label hung above the globe, on the map toggles, and the Netherlands' true-size shape under the card.
     The US is 100° of longitude from the Netherlands, too far for both beside the card: the stop opens on the Netherlands
     and Brazil, the pair its drag-the-shape compares first. The US stays shaded; its label, pushed out from under the card, hung
     over the map toggles */
  "The food giants":S=>{DROP(S,/^United States$/);VIEW(S,[0,15,1])},
  /* Sicily's photo was under the card, 75° west of China (its story is in the stop's text) */
  "The first noodles":S=>{DROPPH(S,/^Sicily/)},
  /* the card was on the right, over Naples, and California at the globe's edge behind the map key; it is 140° from
     Naples, so it keeps only its label (shown whenever it is in sight), and its bowl icon goes(The frame's middle is well east of
     Glasgow and Naples: at this latitude the card's turn-out shifts the globe about 40° west) */
  "Dishes that travelled":S=>{AREA(S,/^California/);DROPICON2(S,[-122.4,37.8]);VIEW(S,[30,46,1.1])},
  /* six foods from Iceland to Japan, 160° apart: Korea and Japan were under the card (on the right) and the labels of
     Sweden and Germany on top of each other. The stop opens on kimchi's Korea; a game (part 2) turns the globe to each
     of the others */
  "Fermented foods":S=>{AREA(S,/^(Sweden|Iceland|Germany|Ethiopia)/);VIEW(S,[135,38,2.6])},
  /* the Maasai and Arabia, the two other milk-drinking peoples, were off the globe's right edge under the map key */
  "Milk drinkers’ map":S=>{VIEW(S,[48,24,1.2])},
  /* card on the right, over Thailand; Oaxaca's photo round the back (Mexico's chapulines are in the text). Thailand is
     75° from DR Congo: its photo square sat on the globe's edge, so it keeps a label */
  "Insects on the menu":S=>{DROPPH(S,/^(Oaxaca|Thailand)/);ADDAREA(S,[101,15],"Thailand: crickets");VIEW(S,[58,0,1])}
 },
 landmarks:{
  /* eight photos round the world: the Great Wall round the back, Machu Picchu and Christ the Redeemer under the card and
     the toolkit, the Taj Mahal on the zoom buttons and the Eiffel Tower's label over the map toggles. Each has its own
     stop (Christ the Redeemer is on the Wonders stop); the four round the Mediterranean are framed beside the card */
  "Landmarks of the world":S=>{DROPPH(S,/^(The Great Wall|Machu Picchu|Christ|The Taj)/);VIEW(S,[52,30,1])},
  /* the card was on the right, over Giza and the Taj Mahal, with the map key over the Mediterranean; Machu Picchu,
     Christ the Redeemer and Chichén Itzá were round the back. The stop opens on the ancient wonders round the eastern
     Mediterranean; the game (part 2) turns the globe to the new ones */
  "Wonders old and new":S=>{DROPPH(S,/^(Great Wall|Machu Picchu|Christ|Taj Mahal)/);VIEW(S,[38,33,2])},
  /* Shanhaiguan and the Badaling photo sat at the globe's right edge, over the map key */
  "The Great Wall":S=>VIEW(S,[112,39,2.5]),
  /* the Paris photo sat on the zoom buttons, 74° east of New York (Paris stays at the ruler's far end, with a label),
     and a Grand Canyon photo had nothing to do with the statue */
  "The Statue of Liberty":S=>{DROPPH(S,/^(Built in Paris|United States: Grand Canyon)/);ADDAREA(S,[2.35,48.86],"Built in Paris");VIEW(S,[-38,42,1])},
  /* seven wonders on five continents: Parícutin and the Grand Canyon were under the card, Everest and the reef round the
     back, Rio below the screen and Victoria Falls under the map key. The stop opens on its headline, Parícutin; buttons
     (part 2) turn the globe to each of the seven */
  "Natural wonders":S=>{DROPPH(S,/^(Everest|Grand Canyon|Rio|Great Barrier)/);VIEW(S,[-70,15,1.4])}
 },
 explorers:{
  /* six photos: Magellan, Zheng He, Cook and the Norge airship round the back, and a William Clark portrait hanging over
     the map toggles; with the card on the left the voyage labels of da Gama and Magellan sat under the map key and below
     the screen. The five coloured voyages stay; the opening keeps Columbus's photo, and the others each have a stop */
  "The great journeys":S=>{DROPPH(S,/^(Magellan|Zheng He|Cook|Norge|William Clark)/);VIEW(S,[28,6,1])},
  /* the card was on the right, over Asia, and the map key over East Africa; Europe and the Bering land bridge sat on the
     globe's edge. The stop opens on East Africa; buttons (part 2) follow the first explorers from there */
  "The first explorers":S=>VIEW(S,[60,18,1.2]),
  /* Chang'an, where Zhang Qian set out, was at the globe's right edge, its label under the map key */
  "The envoy who opened the Silk Road":S=>VIEW(S,[100,38,2]),
  /* Palos's label was on the globe's edge, by the zoom buttons */
  "Columbus, 1492":S=>VIEW(S,[-38,28,1.11]),
  /* da Gama's goal, Calicut, was on the globe's right edge */
  "Around Africa to India":S=>VIEW(S,[42,0,1]),
  /* "About 250 men": "the five-ship fleet left Spain on 20 September 1519 with about 270 men", and "only 18 men out of the
     original 270" came home (Wikipedia, "Magellan expedition") */
  "Around the world":S=>{RE(S,"stat","About 250 men set off","About 270 men set off")},
  /* the card was on the right, over Calicut and Malacca, with the map key over Hormuz and Malindi */
  "Zheng He’s treasure fleets":S=>VIEW(S,[86,12,1.05]),
  /* Xanadu's photo (and Marco Polo's portrait) sat on the zoom buttons, 104° from Venice: Xanadu keeps a label */
  "Marco Polo":S=>{DROPPH(S,/^Xanadu/);ADDAREA(S,[116.2,42.35],"Xanadu, Kublai’s summer palace");VIEW(S,[80,35,1])},
  /* card on the right, over Tahiti and Hawaii, and the map key over Botany Bay; Tahiti's label and Cook's portrait then
     sat under the key on the right */
  "Captain Cook":S=>VIEW(S,[-165,-22,1]),
  /* card on the right, over Mauritius; the voyage goes round the world, so the stop opens on Brest and Rio, where she
     joined and where bougainvillea was found */
  "The first woman to sail round the world":S=>VIEW(S,[-10,-10,1]),
  /* the card was on the right, over St Louis, and the map key over the Pacific end of the route */
  "Lewis and Clark":S=>VIEW(S,[-98,44,2])
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left: on the right (as some stops were switched at run time, after a tour question) it lay
    under the map key, which covered its title, and the stop's place went under the card
    (locked even where it already says "left", or a later file flips it, as happened on "Swapped by religion") */
 LOCK(S,"card","left");const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvq fix",tour,S.title,e)}})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}/* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when ps.tour changes */applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f)f(S)}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins, which a locked field
   would ignore, so the stops lost all their photos; the fixes go in when one of these tours opens) */
/* Only the card side is locked at load, so a tour's first stop already opens with its card on the left */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvf.js and -rvl.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for eight seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["food","landmarks","explorers"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=0;refl=0;touched=0}goAt++;ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".gc3-ctl,.ge2-ctl,.rvq-ctl[data-turns]"))return;
 /* counted in ticks of this 250 ms check, not in clock time: a tour's first launch can block the page for many seconds while its map loads, which used up the whole window before the globe had even moved */
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same four seconds: psGo is wrapped to start the clock again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvq){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvq=1;window.psGo=w}catch(e){}})(0);

/* ======================================================================== part 2: stops you can play with
   (the list is in DEFS below) */
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
function tag(L,cls){const d=document.createElement("div");d.className="rvq-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvq-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvq-new");void e.offsetWidth;e.classList.add("rvq-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvq-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvq-rank"></ol><div class="rvq-pool"></div>'+
  '<div class="rvq-btns"><button type="button" class="rvq-btn rvq-undo">Undo</button><button type="button" class="rvq-btn rvq-show">Show me</button><button type="button" class="rvq-btn rvq-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvq-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvq-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvq-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvq-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvq-ok":"rvq-no"):"")+'"><span class="rvq-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvq-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvq-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvq-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvq-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvq-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvq-show").hidden=L.shown;c.querySelector(".rvq-again").hidden=!L.shown;
  if(!L.order.length)say(L,"","Tap the "+cfg.first.toLowerCase()+" first.");
  else if(!done)say(L,"",(N-L.order.length)+" to go. Next one?");
  else if(L.gave)say(L,"Here is the real order",cfg.after(-1,N));
  else say(L,right===N?"All "+N+" in the right place!":right+" of "+N+" in the right place",cfg.after(right,N))}};}


/* ---------------- a one-at-a-time sorting quiz: which kind is it? ----------------
   cfg: {tours, title, tip, kinds:[[key, button text, name in the answer]], items:[[text, key or [keys that count], why]],
   turns (an item's 4th entry, [lon, lat, zoom], is where the globe turns once it is answered), ask (the
   question under each item), below (after the stop's text: a review), end(right, N) → closing text}. An item may fit more than one kind: any of them
   counts, and all of them light up. */
function CLASSIFY(cfg){const OK=it=>Array.isArray(it[1])?it[1]:[it[1]];const nm=k=>{const x=cfg.kinds.find(q=>q[0]===k);return x?(x[2]||x[1]):k};
 return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvq-q"><span class="rvq-n"></span><b class="rvq-item"></b></div><div class="rvq-bins">'+cfg.kinds.map(k=>'<button type="button" class="rvq-btn rvq-bin" data-k="'+k[0]+'">'+esc(k[1])+'</button>').join("")+'</div>'+
  '<div class="rvq-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div><div class="rvq-btns"><button type="button" class="rvq-btn rvq-next" hidden>Next ▶</button><button type="button" class="rvq-btn rvq-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;const N=cfg.items.length;
  c.querySelectorAll(".rvq-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=N)return;L.ans=b.dataset.k;L.res[L.k]=OK(cfg.items[L.k]).includes(L.ans);const at=cfg.items[L.k][3];if(cfg.turns&&at)turnGlobe(at[0],at[1],at[2]);this.render(L)});
  c.querySelector(".rvq-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvq-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,end=L.k>=N,it=cfg.items[Math.min(L.k,N-1)],ok=OK(it);
  c.querySelector(".rvq-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvq-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvq-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvq-good",!!L.ans&&ok.includes(b.dataset.k));b.classList.toggle("rvq-bad",!!L.ans&&b.dataset.k===L.ans&&!ok.includes(L.ans))});
  c.querySelectorAll(".rvq-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvq-y":L.res[i]===false?"rvq-x":i===L.k&&!end?"rvq-now":"");
  c.querySelector(".rvq-next").hidden=end||!L.ans;c.querySelector(".rvq-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvq-again").hidden=!end;
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": a perfect score!":r>=N-2?": well done.":""),cfg.end(r,N))}
  else if(!L.ans)say(L,"",cfg.ask);
  else if(ok.includes(L.ans))say(L,"Right: "+(ok.length>1?ok.map(nm).join(" and "):nm(L.ans)),it[2]);
  else say(L,"Not quite: "+ok.map(nm).join(" and "),it[2])}}}


function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.35;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}
/* a row of buttons, one per place; the stop opens on the first. places: [name, lon, lat, zoom, text] */

/* ---------------- buttons that turn the globe from place to place (as in geoflock-polish-rvk.js) ----------------
   cfg: {tours, title, tip, intro, places:[[name, lon, lat, zoom, text]], extra:{card(L), wire(L)} (more controls under the
   buttons)}. A pulsing ring marks the place turned to, with a name tag unless the stop already labels that spot. */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:true,turns:true,tip:cfg.tip,
 card(L){return(cfg.extra?cfg.extra.card(L):"")+'<div class="rvq-btns rvq-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvq-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 init(L){L.at=-1;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvq-ring"});L.tag=tag(L,"rvq-ctag");L.anim=1},
 draw(L){const f=L.at>=0?cfg.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  putTag(L,L.tag,f&&!L._dup?proj(L,[f[1],f[2]],1):null,f?esc(f[0]):null,16)},
 wire(L){const c=L.card;c.querySelectorAll(".rvq-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});
  if(cfg.extra)try{cfg.extra.wire.call(this,L)}catch(e){console.error(e)}this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvq-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvq-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+cfg.places[k][0]});
  if(L.over)return;if(L.at<0)say(L,"",cfg.intro);else{const f=cfg.places[L.at];say(L,f[0],f[4])}}}}

/* ======================================================================== food */
/* ---- Three grains, three cradles: turn the globe to each hearth (places and dates from the stop itself and its
   hearth chart: Encyclopaedia Britannica, approximate dates of first domestication) */
const GRAINS=TURNER({tours:["food"],title:"Three grains, three cradles",tip:"The three cradles are far apart. Turn the globe to each one.",
 intro:"Each grain was tamed from a wild grass in its own corner of the world, long before the three ever met.",
 places:[["Wheat",40,36,2,"The Fertile Crescent, from Iraq round to Syria and Turkey: wild wheat and barley, tamed about 10,000 years ago."],
  ["Rice",113,30,2,"China’s Yangtze valley: rice, grown in flooded fields."],
  ["Maize",-97,17.5,2,"Southern Mexico: farmers bred a wild grass, teosinte, into maize."]]});

/* ---- Before 1492: which side of the Atlantic did each food come from? The Columbian exchange (Wikipedia, "Columbian
   exchange", table of post-Columbian transfers of cultivated plants: from the Americas tomato, potato, chili pepper,
   cocoa, maize, peanut, squash, pineapple; to the Americas wheat, rice, sugarcane, coffee, onion, citrus; bananas were
   brought to the Americas from West Africa by Portuguese sailors in the 16th century). Each answer turns the globe to
   the food's home. */
const SWAP=CLASSIFY({tours:["food"],title:"Before 1492",turns:true,below:true,
 tip:"Which way did it cross the Atlantic? Each answer turns the globe to the food’s home.",ask:"From the Americas, or to the Americas?",
 kinds:[["nw","From the Americas","from the Americas"],["ow","To the Americas","to the Americas, from the Old World"]],
 items:[["Tomatoes","nw","From the Americas: Mexico’s farmers grew them long before Italy had heard of them.",[-99,19.4,2]],
  ["Potatoes","nw","From the Andes, near Lake Titicaca.",[-70,-15.8,2]],
  ["Coffee","ow","From Ethiopia, by way of Yemen; it reached Brazil in 1727.",[38.5,7.5,2]],
  ["Chilli peppers","nw","From Mexico and Central America. Portuguese traders carried them to India and Asia.",[-96.7,17.1,2]],
  ["Sugar cane","ow","First grown in New Guinea and made into sugar in India; Europeans planted it in Brazil and the Caribbean.",[78,21,1.6]],
  ["Rice","ow","From Asia: China’s Yangtze valley, the tour’s second stop.",[113,30,1.6]],
  ["Cocoa","nw","From the Americas: the Maya and Aztecs drank it.",[-90,17.5,2]],
  ["Bananas","ow","From Southeast Asia and New Guinea; Portuguese sailors brought them from West Africa to the Americas.",[144.4,-5.8,1.6]],
  ["Pineapples","nw","From South America.",[-55,-15,1.6]]],
 end:()=>"The exchange went both ways: the foods that now seem most Italian, Indian or Irish often came from the Americas, and the Americas’ biggest crops today, like coffee and sugar, came from the other side."});

/* ---- Coffee's journey, place by place. Wikipedia, "History of coffee": wild coffee from Ethiopia; "by the late 15th
   century, coffee drinking was well established among Sufi communities in Yemen"; the first coffeehouse in Istanbul, in
   the Tahtakale district, in 1554 (İbrahim Peçevi); the Dutch East India Company, starting from plants obtained from
   Mocha, could supply Europe with "Java coffee" by 1719; "the first coffee plantation in Brazil occurred in 1727", from
   seeds Francisco de Melo Palheta obtained in French Guiana. Brazil's share: the stop's own headline. */
const COFFEE=TURNER({tours:["food"],title:"Coffee from Ethiopia",tip:"Follow coffee from Ethiopia to Brazil, one stop at a time.",
 intro:"Coffee took about 300 years to get from Ethiopia’s forests to Brazil. Start at the beginning.",
 places:[["Ethiopia",38.5,7.5,2,"Coffee bushes grow wild in the highland forests of south-west Ethiopia."],
  ["Yemen",43.25,13.3,2.4,"By the late 1400s Sufis in Yemen drank it to stay awake for night prayers. Coffee left for the world from the port of Mocha."],
  ["Istanbul",29,41,2.4,"Istanbul’s first coffeehouse opened in 1554; from the Ottoman Empire, coffee reached Europe."],
  ["Java",110,-7.3,2.2,"The Dutch grew coffee from Mocha plants on Java, and by 1719 “Java coffee” was supplying Europe."],
  ["Brazil",-48.5,-1.45,1.8,"In 1727 Francisco de Melo Palheta brought seeds from French Guiana to Pará. Brazil now grows about a third of the world’s coffee."]]});

/* ---- Fermented foods: which country is each from? The foods and countries are the stop's own (Korea's kimchi, Japan's
   natto and miso, Sweden's surströmming, Iceland's fermented shark, Germany's sauerkraut and Ethiopia's injera). Each
   answer turns the globe there. */
const FERM=CLASSIFY({tours:["food"],title:"Fermented foods",turns:true,below:true,
 tip:"Match each fermented food to its country. Each answer turns the globe there.",ask:"Where is it from?",
 kinds:[["kr","Korea"],["jp","Japan"],["se","Sweden"],["is","Iceland"],["de","Germany"],["et","Ethiopia"]],
 items:[["Sauerkraut: shredded cabbage left to sour","de","Germany: “sour cabbage”, which keeps through the winter.",[10,51,2.4]],
  ["Natto: sticky, stringy fermented soybeans","jp","Japan, where miso and soy sauce are fermented too.",[139.7,35.7,2.4]],
  ["Injera: a spongy, sour flatbread","et","Ethiopia: the batter, usually of teff, ferments for days before it is baked.",[38.7,9,2.4]],
  ["Surströmming: herring fermented in the tin","se","Sweden: the smell is so strong that tins are usually opened outdoors.",[17,62.5,2.4]],
  ["Kimchi: cabbage with chilli, garlic and ginger","kr","Korea: red only since chillies arrived from the Americas, around 1600.",[127,37.5,2.4]],
  ["Fermented shark","is","Iceland: the shark meat is left to ferment for weeks, then hung to dry for months.",[-19,64.9,2.4]]],
 end:()=>"Every cuisine found the same trick: let friendly microbes sour the food, and it keeps for months."});

/* ======================================================================== landmarks */
/* ---- Wonders old and new: ancient wonder, or one of the 2007 New Seven Wonders? The two lists are the stop's own (the
   Greek list of seven; the 2007 vote, with Giza as an honorary eighth). Notes from the stop and from Wikipedia: "Seven
   Wonders of the Ancient World" (the Lighthouse of Alexandria brought down by earthquakes; the Statue of Zeus at Olympia,
   of gold and ivory, later lost; no definitive trace of the Hanging Gardens found at Babylon). Each answer turns the globe
   there (the places of the stop's own pins and icons). */
const WONDERS=CLASSIFY({tours:["landmarks"],title:"Wonders old and new",turns:true,below:true,
 tip:"Ancient wonder, or one of the 2007 winners? Each answer turns the globe there.",ask:"An ancient wonder, or a new one?",
 kinds:[["a","Ancient wonder","an ancient wonder"],["n","New, 2007","one of the New Seven Wonders of 2007"]],
 items:[["Petra","n","Chosen in 2007: the rock-cut city the Nabataeans carved about 2,000 years ago (two stops on).",[35.44,30.33,2.6]],
  ["The Colossus of Rhodes","a","A bronze giant by the harbour of Rhodes; an earthquake toppled it after only about 54 years.",[28.23,36.45,2.6]],
  ["The Lighthouse of Alexandria","a","It lit the harbour of Alexandria for centuries until earthquakes brought it down.",[29.89,31.21,2.6]],
  ["Chichén Itzá","n","Chosen in 2007: a great Maya city in Mexico’s Yucatán.",[-88.57,20.68,2.6]],
  ["The Taj Mahal","n","Chosen in 2007: the tomb in Agra, four stops on.",[78.04,27.17,2.6]],
  ["The Great Pyramid of Giza",["a","n"],"Both: the only ancient wonder still standing, and the honorary eighth of the 2007 vote.",[31.13,29.98,2.6]],
  ["The Hanging Gardens of Babylon","a","Ancient, if they were ever real: no sure trace of them has been found at Babylon.",[44.42,32.54,2.6]],
  ["Christ the Redeemer","n","Chosen in 2007: the statue above Rio de Janeiro.",[-43.21,-22.95,2.6]],
  ["The Statue of Zeus at Olympia","a","A giant statue of gold and ivory in Zeus’s temple, later lost.",[21.63,37.64,2.6]],
  ["The Colosseum","n","Chosen in 2007: Rome’s great arena.",[12.49,41.89,2.6]]],
 end:()=>"All the ancient wonders stood round the eastern Mediterranean, the world the Greek list-makers knew; the 2007 winners are spread over four continents."});

/* ---- Natural wonders: turn the globe to each of the seven (the stop's own list; Wikipedia, "Natural Wonders of the
   World": the 1997 list of seven; "Grand Canyon": over a mile, 1,857 m, deep; "Great Barrier Reef": the world's largest
   coral reef system; "Mount Everest": 8,849 m). The northern lights have no one place: the globe turns to northern
   Norway, inside the Arctic Circle, where they are often seen. */
const NATW=TURNER({tours:["landmarks"],title:"Natural wonders",tip:"The seven natural wonders are spread over five continents. Turn the globe to each.",
 intro:"No people built these. Pick one to fly there.",
 places:[["Everest",86.925,27.988,2.6,"The highest mountain on Earth, 8,849 m, on the border of Nepal and China."],
  ["Grand Canyon",-112.1,36.1,2.6,"Cut by the Colorado River, over 1.8 km deep in places."],
  ["Victoria Falls",25.857,-17.925,2.6,"On the Zambia–Zimbabwe border: Mosi-oa-Tunya, “the smoke that thunders”."],
  ["Great Barrier Reef",146,-18,2.2,"Off Queensland, Australia: the largest coral reef system in the world."],
  ["Rio’s harbour",-43.17,-22.9,2.6,"Guanabara Bay, ringed by granite peaks such as Sugarloaf Mountain."],
  ["Northern lights",18.96,69.65,2.2,"They shine on dark winter nights near the Arctic Circle, as here over northern Norway."],
  ["Parícutin",-102.25,19.49,2.6,"The volcano born in a Mexican cornfield in February 1943, over 300 m tall within a year."]]});

/* ======================================================================== explorers */
/* ---- The first explorers: turn the globe along the first people's spread, place by place (places and dates from the
   stop itself: East Africa; Australia at least 50,000 years ago, across open sea; Europe about 45,000 years ago; the
   Bering land bridge into the Americas at least 15,000 years ago). */
const FIRSTX=TURNER({tours:["explorers"],title:"The first explorers",tip:"Follow the first explorers out of Africa, one step at a time.",
 intro:"No maps, no ships, no writing: just small groups moving on, generation after generation. Start in Africa.",
 places:[["East Africa",37,3,1.8,"Our species evolved in Africa; small groups began to leave it, on foot and along the coasts."],
  ["Australia",136,-22,1.6,"Reached at least 50,000 years ago: even with the sea at its lowest, the last stretch was open water, so they must have come by boat, probably a raft or canoe."],
  ["Europe",0,46,1.8,"Reached about 45,000 years ago, in the middle of the last Ice Age."],
  ["Bering land bridge",-168,65.5,1.8,"With the sea lower, Siberia and Alaska were joined: people walked into the Americas at least 15,000 years ago."]]});

/* ---- Review on the last stop: put the tour's journeys in order. Dates from the tour's own stops (Pytheas about 325 BC,
   Zhang Qian about 138 BC, Leif Erikson about 1000, Marco Polo 1271, Ibn Battuta 1325, Zheng He 1405, Columbus 1492,
   Magellan 1519, Lewis and Clark 1804, Amundsen 1911, Apollo 11 1969). */
const XORDER=SORT({tours:["explorers"],title:"Now explore",below:true,bars:false,
 tip:"Review: put these journeys in order, earliest first.",first:"Earliest",last:"Latest",
 items:[["Pytheas sails to Thule",-325,"about 325 BC"],["Zhang Qian heads west",-138,"about 138 BC"],["Leif Erikson reaches Vinland",1000,"about 1000"],
  ["Marco Polo leaves Venice",1271,"1271"],["Ibn Battuta leaves Tangier",1325,"1325"],["Zheng He’s first voyage",1405,"1405"],["Columbus reaches the Bahamas",1492,"1492"],
  ["Magellan’s fleet sets off",1519,"1519"],["Lewis and Clark set out",1804,"1804"],["Amundsen reaches the South Pole",1911,"1911"],["Apollo 11 lands on the Moon",1969,"1969"]],
 after:(r,N)=>"Over 2,000 years from Pytheas to the Moon: the Vikings beat Columbus by about 500 years, and Zheng He’s fleets sailed decades before him."});

/* ---------------- guess first (geoflock-tourplay.js veils the headline and asks for an estimate) ----------------
   Mont-Saint-Michel: "The tides vary greatly, at roughly 14 metres (46 ft) between highest and lowest water marks"
   (Wikipedia, "Mont-Saint-Michel"), as the stop's headline says. Ibn Battuta: the stop's own figure, about 120,000 km
   (Wikipedia, "Ibn Battuta", gives about 117,000 km). */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const GS={"explorers|Ibn Battuta":{q:"Marco Polo travelled for 24 years. About how far did Ibn Battuta travel in his 29 years on the road?",min:10000,max:300000,ans:120000,unit:" km",step:5000,show:"about 120,000 km, three times round the equator"},
  "landmarks|An island only twice a day":{q:"How far can the sea rise and fall between low and high tide in the bay of Mont-Saint-Michel?",min:1,max:30,ans:14,unit:" m",step:1,show:"about 14 m, about as tall as a four-storey building"}};
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

const DEFS=[GRAINS,SWAP,COFFEE,FERM,WONDERS,NATW,FIRSTX,XORDER];


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvq-layer rvq-layer";el.innerHTML='<svg class="rvq-sv"><defs><clipPath id="rvqDisc"><path class="rvq-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvqDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvq-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvq-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvq-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvq-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvq-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvq-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");
 /* a review game (D.below) goes after the stop's text, so it is read first */
 const bd=D.below&&ps.card.querySelector(".ps-body");if(bd&&bd.parentNode===at0.parentNode){const mo=bd.nextElementSibling;(mo&&mo.matches("details.ps-more")?mo:bd).after(c)}else(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty||L.anim){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvq-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

/* ======================================================================== part 3: the map's banner
   The banner at the top of the globe ("System of government") is centred, and on the Politics map it touched the map
   key in the top right corner (copied from geoflock-polish-rvl.js, where People map banners ran under it). On these tours it is slid left until it clears the
   key (never under the card), and put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;const k=document.querySelector(".ps-mapkey.at-right");b.style.translate="";bannerMoved=null;if(!k||!k.offsetWidth)return;
 const B=b.getBoundingClientRect(),K=k.getBoundingClientRect();if(!(B.right>K.left-8&&B.bottom>K.top&&B.top<K.bottom))return;
 let dx=K.left-8-B.right;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

{const s=document.createElement("style");s.textContent=`
.rvq-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvq-sv{position:absolute;left:0;top:0;overflow:visible}
.rvq-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvq-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvq-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvq-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvq-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvq-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvq-btn[hidden]{display:none}
.rvq-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvq-ep b{display:block;font-size:15px}
.rvq-ep.rvq-new{animation:rvqIn .45s ease}@keyframes rvqIn{from{opacity:.2;transform:translateY(4px)}}
.rvq-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvq-sortq i{font-style:normal}
.rvq-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvq}
.rvq-rank li{position:relative;counter-increment:rvq;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvq-rank li::before{content:counter(rvq);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvq-rank li.rvq-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvq-rank li.rvq-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvq-nm{flex:1 1 auto;z-index:1}.rvq-v{z-index:1;font-weight:800;white-space:nowrap}
.rvq-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvq-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvq-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvq-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvq-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvq-do,:is(body.dark-theme,body.sky-night) .rvq-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvq-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvq-btn,:is(body.dark-theme,body.sky-night) .rvq-chip,:is(body.dark-theme,body.sky-night) .rvq-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvq-rank li.rvq-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvq-rank li.rvq-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvq-bar{background:rgba(255,178,122,.2)}
.rvq-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvq-rng{flex:1 1 auto;accent-color:#d9682b}.rvq-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvq-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvq-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvq-item{font-size:16px;color:#13294b}
.rvq-bins{display:flex;gap:6px;flex-wrap:wrap}.rvq-bins .rvq-btn[hidden]{display:none}.rvq-bin:disabled{cursor:default;opacity:.55}
.rvq-btn.rvq-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvq-btn.rvq-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvq-dots{display:flex;gap:4px;margin-top:8px}.rvq-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvq-dots i.rvq-now{box-shadow:0 0 0 2px #d9682b inset}.rvq-dots i.rvq-y{background:#1f8a4c}.rvq-dots i.rvq-x{background:#c2364f}
.rvq-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvq-sl .rvq-row{margin-top:2px}.rvq-sl .rvq-val{min-width:36px}
.rvq-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvq-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvq-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvq-out b{font-size:15px;color:#9a4a16}
.rvq-ch{display:block;width:100%;height:auto;margin-top:6px}.rvq-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvq-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvq-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvq-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvq-val,:is(body.dark-theme,body.sky-night) .rvq-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvq-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvq-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvq-n,:is(body.dark-theme,body.sky-night) .rvq-sl label,:is(body.dark-theme,body.sky-night) .rvq-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvq-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvq-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvq-dots i{background:rgba(255,255,255,.18)}
.rvq-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvq-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvq-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvq-dd circle.rvq-near{fill:#d9682b;opacity:1}
.rvq-pump{cursor:pointer;outline:none}.rvq-pump .rvq-hit{fill:transparent}.rvq-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvq-pump:hover rect,.rvq-pump:focus rect{fill:#13294b}.rvq-pump.rvq-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvq-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvq-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvq-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvq-kd{background:#2a2f3a}.rvq-kp{background:#2a78d0;border-radius:2px!important}.rvq-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvq-key2{color:#aab6c8}
.rvq-btn.rvq-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvq-btn.rvq-cur{background:#9fc3ff;color:#13294b}
.rvq-band{fill:rgba(217,104,43,.1)}.rvq-area{fill:rgba(42,120,208,.22);stroke:#2a78d0;stroke-width:1.5;stroke-linejoin:round}.rvq-dashed{fill:none;stroke:#8a98a8;stroke-dasharray:3 3}
line.rvq-now{stroke:#d9682b;stroke-width:1.5}.rvq-dot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
:is(body.dark-theme,body.sky-night) .rvq-area{fill:rgba(159,195,255,.22);stroke:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvq-band{fill:rgba(255,178,122,.12)}
:is(body.dark-theme,body.sky-night) .rvq-btn.rvq-good{background:#1f8a4c;border-color:#4cc27f;color:#fff}:is(body.dark-theme,body.sky-night) .rvq-btn.rvq-bad{background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvq-dots i.rvq-y{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvq-dots i.rvq-x{background:#ff7088}:is(body.dark-theme,body.sky-night) .rvq-dots i.rvq-now{box-shadow:0 0 0 2px #ffb27a inset}
.rvq-ring{fill:rgba(255,209,102,.3);stroke:#d9682b;stroke-width:3}
.rvq-race{display:flex;flex-direction:column;gap:6px;margin:4px 0}
.rvq-lane{display:grid;grid-template-columns:1fr auto;align-items:end;column-gap:8px;row-gap:3px;font-size:13px;font-weight:800;color:#13294b}
.rvq-lane span{line-height:1.1}.rvq-lane small{display:inline;margin-left:5px;font-size:10.5px;font-weight:700;color:#5b6b7c}
.rvq-rb{display:block;height:14px;border-radius:7px;background:#d9682b;transition:width .7s ease;grid-column:1/-1;grid-row:2;justify-self:start}
.rvq-stl,.rvq-b1{background:#2a78d0}.rvq-num{font-size:13px;color:#13294b;min-width:72px;text-align:right}
.rvq-src{font-size:11px;color:#5b6b7c;margin-top:4px}
.rvq-atl{fill:rgba(217,104,43,.25);stroke:#d9682b;stroke-width:2}.rvq-bcn{fill:rgba(42,120,208,.35);stroke:#2a78d0;stroke-width:2}
.rvq-cmp[hidden]{display:none}
:is(body.dark-theme,body.sky-night) .rvq-lane,:is(body.dark-theme,body.sky-night) .rvq-num{color:#fff}
:is(body.dark-theme,body.sky-night) .rvq-lane small,:is(body.dark-theme,body.sky-night) .rvq-src{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvq-stl,:is(body.dark-theme,body.sky-night) .rvq-b1{background:#6fa8ff}
.rvq-road{fill:#9aa3ad}.rvq-blk{fill:#e8c9a0;stroke:#b08a5a;stroke-width:1}.rvq-in{fill:#9aa3ad;transition:fill .6s}.rvq-car{fill:#c2364f;transition:opacity .5s}
.rvq-trees{opacity:0;transition:opacity .6s}.rvq-tree{fill:#2f9e5b}
.rvq-sb.rvq-on .rvq-in{fill:#bfe3b4}.rvq-sb.rvq-on .rvq-trees{opacity:1}.rvq-sb.rvq-on .rvq-cin{opacity:0}
.rvq-sbk .rvq-car,.rvq-sbk .rvq-tree{opacity:1}
:is(body.dark-theme,body.sky-night) .rvq-road,:is(body.dark-theme,body.sky-night) .rvq-in{fill:#5b6573}:is(body.dark-theme,body.sky-night) .rvq-sb.rvq-on .rvq-in{fill:#3f7a4f}
`;document.head.appendChild(s)}

window.gfPolishRvq={v:1,FIX,viewOf:S=>VIEWED.get(S),tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
