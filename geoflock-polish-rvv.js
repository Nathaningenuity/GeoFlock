/* GeoFlock polish RV-V: a stop-by-stop review of four tours, Coasts (coasts), Deserts (deserts), Ice (ice) and Art and
   architecture (art), each looked at on the globe, their default mode, at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left: on the right (as index.html put a few stops, and as tour
      questions can flip it) it covered the zoom buttons and the place the stop is about.
   2. Stops you can play with (listed in DEFS at the end of part 2), and guess-first questions through
      geoflock-tourplay.js.
   The structure, helpers and engine are copied from geoflock-polish-rvt.js (and its frame-by-title lookup, so a tour's
   opening stop gets its frame on the very first launch), geoflock-polish-rvq.js (the psGlobeTarget wrapper, so a framed
   stop gets exactly its frame) and geoflock-polish-rvr.js (pin lists filtered through getters, never frozen, and a stop
   with a portrait waits for it before its photo pins are filtered), under "rvv" names, so none of them touch each
   other's controls. Framing and the card side are fixed, non-configurable getters whose setters are ignored (the
   geoflock-sweep-tours*.js files re-set framing on every psGo); a field already non-configurable is left alone.
   On these stops the map key sits in the bottom right corner (about x 1014–1264, y 512–840 at 1280×860) and the zoom
   buttons at x 992–1028, y 230–425. */
(function(){
"use strict";
if(window.gfPolishRvv)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvvTest or ?rvvtest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const TESTING=()=>!!(window.__rvvTest||/[?&]rvvtest\b/.test(location.search));
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TESTING(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* Pin lists are filtered, not frozen (as in geoflock-polish-rvr.js): the shared photo passes turn text pins into photo
   pins at their own times after load, so a list copied once would keep or lose pins depending on timing. XF puts a
   getter on the field that applies this file's edits to whatever the field holds; other files' writes still go through
   (to the value underneath). Each edit has an id, so applying the fixes again does not stack them. */
const XFS=new WeakMap();
let PEND=false;
const TOUR_OF=new WeakMap(),PPOK=new Map(),PPW=new WeakMap();
/* a stop to which geoflock-portraits.js adds a portrait waits (at most about 20 s) until it is in before this file
   wraps its photo pins: wrapped first, the portrait could not be added */
const pplList=S=>{try{const t=TOUR_OF.get(S)||(ps&&ps.tour),n=strip(S.title);return(window.GF_PORTRAITS||[]).filter(p=>p.tour===t&&p.stop===n)}catch(e){return[]}};
const pplPending=S=>{try{if(!pplList(S).length||Object.prototype.hasOwnProperty.call(S,"_gfPpl"))return false;
 const w=(PPW.get(S)||0)+1;PPW.set(S,w);return w<70}catch(e){return false}};
const pplOk=f=>{const m=PPOK.get(f);if(m===true)return true;const now=Date.now();if(m&&now-m<2000)return false;
 let ok=false;try{ok=PS_PHOTO_DATA.some(x=>x&&x.f===f&&x.d)}catch(e){}PPOK.set(f,ok||now);return ok};
function pplReady(S){return pplList(S).filter(p=>pplOk(p.f)).length}
/* portraits whose pictures load later are added here, as geoflock-portraits.js would on a later redraw */
function pplAdd(S,v){const names=new Set(v.map(q=>strip(q&&q.label).toLowerCase()));
 pplList(S).forEach(p=>{if(!names.has(p.name.toLowerCase())&&pplOk(p.f))v=v.concat([{at:p.at,label:p.name,col:"#3d3466",icon:"photo",person:1}])});return v}
/* the filtered list is the same array until the value underneath or the edits change, and it is handed to
   geoflock-portraits.js as its own (S._gfPpl), so it does not try to wrap the field again */
function sync(S,k,v){if(k==="phPins"&&Object.prototype.hasOwnProperty.call(S,"_gfPpl"))try{S._gfPpl=v}catch(e){}return v}
const XF=(S,k,id,fn)=>{try{if(k==="phPins"&&!(XFS.get(S)||{})[k]&&pplPending(S)){PEND=true;return}let R=XFS.get(S);if(!R){R={};XFS.set(S,R)}
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;const B={v:S[k],fns:{}};R[k]=B;
  Object.defineProperty(S,k,{configurable:TESTING(),enumerable:true,
   get:()=>{const pk=k==="phPins"?pplReady(S):0;if(B.out&&B.at===B.v&&B.atN===B.n&&B.pk===pk)return sync(S,k,B.out);let v=Array.isArray(B.v)?B.v.slice():(B.v||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}
    if(pk)v=pplAdd(S,v);const was=B.out;B.out=v;B.at=B.v;B.atN=B.n;B.pk=pk;
    /* another file swapped in a new set of photos: squares built from the old set are rebuilt */
    if(was&&k==="phPins")setTimeout(()=>{try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}},0);
    return sync(S,k,v)},set:x=>{B.v=x}})}
 if(!R[k].fns[id]){R[k].fns[id]=fn;R[k].n=(R[k].n||0)+1;
  /* index.html builds a stop's photo squares once, by position: if the stop is already on screen, its squares are
     rebuilt so the photos match their places (as geoflock-polish-rvo.js's drop helper does) */
  if(k==="phPins")try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}}}catch(e){}};
const DROP=(S,re)=>XF(S,"pins","drop"+re,P=>P.filter(p=>!re.test(pinText(p))));
const DROPPH=(S,re)=>XF(S,"phPins","drop"+re,P=>P.filter(p=>!re.test(strip(p&&p.label))));
/* rename a text pin */
const RENAME=(S,re,txt)=>XF(S,"pins","ren"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p));
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>XF(S,"pins","mv"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p));
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>XF(S,"pins","area"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p));
/* add a text pin (once) */
const ADDPIN=(S,pin)=>XF(S,"pins","add"+pin[1],P=>P.some(p=>Array.isArray(p)&&strip(p[1])===pin[1])?P:P.concat([pin]));
/* drop the icon pins with this icon name (and, if given, within 2° of this place) */
const DROPIC=(S,re,at)=>XF(S,"iconPins","dropic"+re+at,I=>I.filter(q=>!(q&&re.test(String(q.icon))&&(!at||Math.hypot(q.at[0]-at[0],q.at[1]-at[1])<2))));
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine itself turns it out from under the card */
const VIEWED=new WeakMap();
const VIEW=(S,g)=>{LOCK(S,"globe",g);VIEWED.set(S,g)};
/* index.html's wrapper of psGlobeTarget flies to the middle of all a stop's pins, photos and icons whenever more of them
   are in sight from there. A stop framed here (on the globe, not the flat map) gets exactly its frame
   (geoflock-polish-rvq.js). */
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvv)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvv,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvv=1;window.psGlobeTarget=w}catch(e){}})(0);

const FIX={};
FIX.coasts={
 /* the Sundarbans photo sat on the globe's right edge between the zoom buttons and the map key (it has its own stop) */
 "Coasts":S=>{DROPPH(S,/^The Sundarbans/);VIEW(S,[20,30,1])},
 /* the Geirangerfjord photo sat on the ruler's distance label, hiding its first figures (the place keeps its label, and
    its photo is on the opening stop) */
 "Fjords":S=>DROPPH(S,/^Geirangerfjord/),
 /* the card was on the right, over the zoom buttons; an Egypt label hung on a long leader to the bottom of the globe */
 "A delta named after a letter":S=>DROP(S,/^Egypt$/),
 /* an India label hung on a long leader under the card */
 "The biggest delta":S=>DROP(S,/^India$/),
 /* the Kill Devil Hills label ran into the map key */
 "Islands of sand":S=>VIEW(S,[-73.6,35.5,6]),
 /* the White Cliffs of Dover photo sat under the map key: framed further south, so Dover and Moher sit above it */
 "White cliffs and high cliffs":S=>VIEW(S,[-1.5,50.2,4.8]),
 /* Wikipedia, "Holderness": "at least 23 towns and villages" lost "since the Roman era", not "around 30 ... since the
    Middle Ages" */
 "The coast that eats villages":S=>RE(S,"body","around 30 villages recorded since the Middle Ages have fallen into the sea","at least 23 towns and villages have fallen into the sea since Roman times"),
 /* Wikipedia, "Chesil Beach": the stones grade from "around 5 cm long" at the Portland (Chiswell) end to pea-sized at
    West Bay, not to "fist-sized". The two end labels, a few pixels apart at the globe's closest zoom, sat on the wrong
    sides of each other (the east end's label to the west): the pebble game (part 2) shows both ends */
 "Pebbles that tell you where you are":S=>{RE(S,"stat","fist-sized in the east","about 5 cm long in the east");DROP(S,/^(West end|East end)/)},
 /* the card was on the right, over the zoom buttons. A second stack fell in 2009 (Wikipedia, "The Twelve Apostles
    (Victoria)": "Another collapsed in 2009, leaving seven remaining stacks") */
 "The Twelve Apostles":S=>RE(S,"more","collapsed into the sea.","collapsed into the sea, and another fell in 2009.")
};
FIX.deserts={
 /* the Erg Chebbi and Tassili photos sat on the card's edge, their pins under it, and the Namib's below the screen (each
    has its own stop); turned out from under the card, the globe showed Uyuni's and the Atacama's photos on its bottom
    edge (their own stops too), and the Gobi's camels at its top edge (the Gobi has its own stop). Framed on the Sahara
    and Arabia */
 "Deserts":S=>{DROPPH(S,/^(Erg Chebbi|Tassili|Dune 45|Salar de Uyuni|Valle de la Luna|Camels in the Gobi)/);VIEW(S,[45,34,1])},
 /* the Gobi's label sat on the globe's right edge, hidden; framed further east, its label ran into the stop's Gobi
    thermometer, so it moves to the western Gobi */
 "Not heat, but rain":S=>{MOVE(S,/^Gobi/,[97,40]);VIEW(S,[80,33,1.4])},
 /* the Tropic of Capricorn photo (the card's own) hung below the screen, and the Kalahari's label at its bottom */
 "Deserts on the tropics":S=>{DROPPH(S,/^Tropic of Capricorn/);VIEW(S,[16,4,1])},
 /* the card was on the right, over the zoom buttons; the Rainy Chilean coast label and the Torres del Paine photo hung
    at the bottom of the screen, an Argentina label on a long leader */
 "Behind the mountains":S=>{DROP(S,/^Argentina$/);VIEW(S,[-67.5,-47,2.6])},
 /* labels on long leaders round the Gobi: the China label sat under the map key; the country labels go */
 "The Gobi":S=>DROP(S,/^(China|Mongolia)$/),
 /* an "Antarctica" label hung below the screen */
 "The biggest desert is cold":S=>DROP(S,/^Antarctica/),
 /* the Tassili photo (the card's own) sat on the ruler's distance and the United States shape's tag; the Gilf Kebir label
    ran into the map key. The United States shape's tag sat on the ruler's distance label, both at 12° E: the shape
    starts a little further north (it can be dragged anywhere) */
 "The Sahara":S=>{DROPPH(S,/^Tassili/);XF(S,"ghosts","usN",G=>G.map(x=>x&&x.code==="us"&&Array.isArray(x.at)&&x.at[1]<24?Object.assign({},x,{at:[x.at[0],25]}):x));VIEW(S,[16,22,1.8])},
 /* Saudi Arabia named twice, by the map and by a label */
 "The Empty Quarter":S=>DROP(S,/^Saudi Arabia$/),
 /* a Bolivia label on a long leader across the Altiplano */
 "The great salt flat":S=>DROP(S,/^Bolivia$/),
 /* the China label sat under the map key, on the globe's edge */
 "The Taklamakan":S=>DROP(S,/^China$/),
 /* Kerman's label sat under the map key and Nizwa's photo at the bottom of the screen; Iran named twice */
 "Oases and qanats":S=>{DROP(S,/^Iran$/);VIEW(S,[64,28,3])},
 /* Bilma's label and Agadez's photo sat under the map key; country labels on long leaders */
 "People of the desert":S=>{DROP(S,/^(Mali|Niger|Algeria|Libya)$/);VIEW(S,[8,19,2.4])},
 /* the Senegal label sat under the card and Djibouti's off the globe's edge, by the map key: framed on the western
    Sahel, the Wall's line running on east; the Djibouti label goes (the text names both ends) */
 "Making deserts, and stopping them":S=>{DROP(S,/^Djibouti$/);VIEW(S,[14,14,1.3])}
};
FIX.ice={
 /* Kilimanjaro's photo sat under the map key, the Biafo Glacier's on the globe's edge and Yakutsk's above it (each has
    its own stop) */
 "Ice":S=>{DROPPH(S,/^(Kilimanjaro|Biafo|Yakutsk)/);VIEW(S,[2,58,1.2])},
 /* an "Antarctica" label hung under the card at the bottom of the screen, and the Ross Ice Shelf's ran under the map key */
 "Antarctica’s ice sheet":S=>{DROP(S,/^Antarctica/);VIEW(S,[140,-80,1.9])},
 /* the Andes' and New Guinea's ice sat round the back of the globe or under the card: buttons (part 2) turn the globe
    to each */
 "Ice on the equator":S=>VIEW(S,[30,-3,1.2]),
 /* the Gangotri and Khumbu labels ran under the map key */
 "The Third Pole":S=>VIEW(S,[90,32,2.2]),
 /* the Karakoram label ran into the map key */
 "The glaciers that aren’t shrinking":S=>VIEW(S,[79,36,6]),
 /* the icebreakers' photo pin sat under the card */
 "The frozen ocean":S=>DROPPH(S,/^Icebreakers/),
 /* the Iceberg Alley label ran under the map key, the Titanic's photo beside it; the Ilulissat icebergs photo sat on
    the iceberg game's "Calved at Ilulissat" tag */
 "Icebergs and the Titanic":S=>{DROPPH(S,/^Ilulissat icebergs/);VIEW(S,[-46,56,2])},
 /* a Russia label sat under the card */
 "Ground that never thaws":S=>DROP(S,/^Russia$/),
 /* Chicago and the thick North American ice sat under the card, their labels floating over the Atlantic: the stop
    opens on Europe, and buttons (part 2) turn the globe from Berlin to Chicago and the other places the ice shaped */
 "The last ice age":S=>{DROP(S,/^(Chicago|Ice up to)/);VIEW(S,[10,55,1.3])},
 /* the card was on the right, over the zoom buttons */
 "Valleys the ice dug":S=>VIEW(S,[168.5,-44.5,6]),
 /* the Little Dome C label sat on the zoom buttons; an "Antarctica" label hung below the screen */
 "Ice that remembers":S=>{DROP(S,/^Antarctica/);VIEW(S,[125,-77,3.57])}
};
FIX.art={
 /* the Lascaux and Sagrada Família photos sat under the card and Hōryū-ji's on the zoom buttons (each has its own stop);
    in the later set of opening photos, the Taj Mahal's sat on the zoom buttons (it has its own stop) */
 "Art and architecture":S=>{DROPPH(S,/^(Lascaux|Sagrada|Hōryū-ji|The Taj Mahal)/);VIEW(S,[40,25,1])},
 /* with the card on the left (it was on the right, over the zoom buttons), Ur and Uruk sat on the globe's far edge:
    framed on Giza, Meroë and Mesopotamia together */
 "Pyramids and ziggurats":S=>VIEW(S,[42,26,2.3]),
 /* Japan named twice, by the map and by a label at the end of a long leader */
 "Pagodas that dance":S=>DROP(S,/^Japan$/),
 /* with the card on the left (it was on the right, over the zoom buttons), the Strasbourg and Milan photos sat under
    the map key */
 "Gothic cathedrals":S=>VIEW(S,[8,49,4.2]),
 /* Bamiyan, the lapis mines and the Afghanistan label sat on the globe's right edge, hidden: framed on the whole road
    from Afghanistan to Venice */
 "The blue from one valley":S=>{DROP(S,/^Afghanistan$/);RENAME(S,/^Bamiyan/,"Bamiyan’s murals");VIEW(S,[57,36,1.1])},
 /* an Italy label sat between Venice and Florence */
 "Venice paints on canvas":S=>DROP(S,/^Italy$/),
 /* the plaque's photo hung below the screen (the card's own photo shows Benin's bronzes) */
 "The Benin Bronzes":S=>DROPPH(S,/^A Benin Bronze plaque/),
 /* country labels piled on Paris at the card's edge and on Edo: Paris and Edo keep theirs */
 "The Great Wave":S=>DROP(S,/^(France|Netherlands|Japan)$/),
 /* the Chicago and New York photos sat under the card, Shibam's and Dubai's on the globe's edge by the map key: the
    stop is framed on Chicago, where skyscrapers were born (the tall-buildings game, part 2, takes in the rest) */
 "Skyscrapers":S=>VIEW(S,[-82,40,1.8]),
 /* country labels on long leaders, named by the map already */
 "The Alhambra":S=>DROP(S,/^(Spain|Morocco)$/),
 "The Forbidden City":S=>DROP(S,/^China$/),
 "Dots in the desert":S=>DROP(S,/^Australia$/)
};

/* Each stop's frame, by tour and title, read once from FIX at load (each fix run on a stand-in stop that has only its
   title). On a tour's very first launch index.html flies to the opening stop before the fixes above are applied to it
   (they go in when the tour opens, a tick later), so psGlobeTarget (wrapped above) finds the frame by title as well
   (as geoflock-polish-rvt.js does). */
const FRAMES={};
for(const t in FIX)for(const k in FIX[t]){try{const D={title:k};FIX[t][k](D);const v=VIEWED.get(D);if(v)FRAMES[t+"|"+k]=v}catch(e){}}
const viewOf=S=>{const v=VIEWED.get(S);if(v)return v;try{return S&&ps&&ps.tour&&FRAMES[ps.tour+"|"+strip(S.title)]}catch(e){return null}};
const applied=new WeakSet();let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left */
 LOCK(S,"card","left");const f=F[strip(S.title)];if(!f){applied.add(S);return}TOUR_OF.set(S,tour);
 PEND=false;try{f(S)}catch(e){console.error("rvv fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}
 /* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when
    ps.tour changes; a stop waiting for its portrait is tried again */
 waiting=false;applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;
 /* and once more on the stop itself, in case another file re-set a field after the first pass */
 try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f){TOUR_OF.set(S,t);PEND=false;f(S)}}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins; the fixes go in when one
   of these tours opens.) Only the card side is locked at load, so a tour's first stop already opens with its card on
   the left */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);

/* The card shift, kept (as geoflock-polish-rvt.js does for its tours): geoflock-tourload.js's "aim" turns the globe
   back to the stop's plain centre whenever it is more than 20° from it, undoing psFlyGlobe's turn out from under the
   card. Here aim is told the stop is already aimed, and for a while after a stop opens (counted in ticks, since a
   first launch can block the page for many seconds), if the globe has come to rest away from where psFlyGlobe would put
   it, it flies there once more. A drag or zoom by the reader cancels it. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=0;refl=0;touched=0}goAt++;ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe is left to it */
 if(document.querySelector(".rvv-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the clock again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvv){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvv=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rvv-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvv-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvv-new");void e.offsetWidth;e.classList.add("rvv-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvv-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvv-rank"></ol><div class="rvv-pool"></div>'+
  '<div class="rvv-btns"><button type="button" class="rvv-btn rvv-undo">Undo</button><button type="button" class="rvv-btn rvv-show">Show me</button><button type="button" class="rvv-btn rvv-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvv-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvv-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvv-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvv-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvv-ok":"rvv-no"):"")+'"><span class="rvv-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvv-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvv-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvv-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvv-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvv-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvv-show").hidden=L.shown;c.querySelector(".rvv-again").hidden=!L.shown;
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
 return{tours:cfg.tours,title:cfg.title,globe:!!cfg.turns,turns:!!cfg.turns,below:!!cfg.below,tip:cfg.tip,
 /* (where answers turn the globe, a pulsing ring marks the place, with its name unless the stop labels that spot) */
 init(L){L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvv-ring"});L.tag=tag(L,"rvv-ctag");L.anim=1},
 draw(L){const it=L.ans&&L.k<cfg.items.length?cfg.items[L.k]:null,at=it&&it[3],q=at?proj(L,[at[0],at[1]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  let dup=false;if(at)try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-at[0])<.6&&Math.abs(ll[1]-at[1])<.6})}catch(e){}
  putTag(L,L.tag,at&&!dup?proj(L,[at[0],at[1]],1):null,it?esc(it[0]):null,16)},
 card(L){return'<div class="rvv-q"><span class="rvv-n"></span><b class="rvv-item"></b></div><div class="rvv-bins">'+cfg.kinds.map(k=>'<button type="button" class="rvv-btn rvv-bin" data-k="'+k[0]+'">'+esc(k[1])+'</button>').join("")+'</div>'+
  '<div class="rvv-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div><div class="rvv-btns"><button type="button" class="rvv-btn rvv-next" hidden>Next ▶</button><button type="button" class="rvv-btn rvv-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;const N=cfg.items.length;
  c.querySelectorAll(".rvv-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=N)return;L.ans=b.dataset.k;L.res[L.k]=OK(cfg.items[L.k]).includes(L.ans);const at=cfg.items[L.k][3];if(cfg.turns&&at)turnGlobe(at[0],at[1],at[2]);this.render(L)});
  c.querySelector(".rvv-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvv-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,end=L.k>=N,it=cfg.items[Math.min(L.k,N-1)],ok=OK(it);
  c.querySelector(".rvv-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvv-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvv-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvv-good",!!L.ans&&ok.includes(b.dataset.k));b.classList.toggle("rvv-bad",!!L.ans&&b.dataset.k===L.ans&&!ok.includes(L.ans))});
  c.querySelectorAll(".rvv-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvv-y":L.res[i]===false?"rvv-x":i===L.k&&!end?"rvv-now":"");
  c.querySelector(".rvv-next").hidden=end||!L.ans;c.querySelector(".rvv-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvv-again").hidden=!end;
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
 card(L){return(cfg.extra?cfg.extra.card(L):"")+'<div class="rvv-btns rvv-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvv-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 init(L){L.at=-1;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvv-ring"});L.tag=tag(L,"rvv-ctag");L.anim=1},
 draw(L){const f=L.at>=0?cfg.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  putTag(L,L.tag,f&&!L._dup?proj(L,[f[1],f[2]],1):null,f?esc(f[0]):null,16)},
 wire(L){const c=L.card;c.querySelectorAll(".rvv-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});
  if(cfg.extra)try{cfg.extra.wire.call(this,L)}catch(e){console.error(e)}this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvv-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvv-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+cfg.places[k][0]});
  if(L.over)return;if(L.at<0)say(L,"",cfg.intro);else{const f=cfg.places[L.at];say(L,f[0],f[4])}}}}


/* ======================================================================== coasts */
/* ---- Pebbles that tell you where you are: land on Chesil Beach in the dark, feel a pebble, and say where you are.
   Wikipedia, "Chesil Beach": "The beach runs for a length of 29 kilometres (18 mi) from West Bay to the Isle of
   Portland"; the stones grade from "around 5 cm long at the south or eastern Chiswell end to pea-sized at the north or
   western end at West Bay"; people landing at night "are said to have been able to work out their location based on
   the pebbles' size". The grading is drawn as steady between a pea (taken as about 0.6 cm) and 5 cm, as the stop says;
   the beach's line is the stop's own dashed line. */
const CH_LINE=[[-2.76,50.705],[-2.69,50.685],[-2.62,50.655],[-2.55,50.62],[-2.49,50.59],[-2.455,50.57]];
const CH_KM=29,CH_A=.6,CH_B=5,CH_ROUNDS=[.82,.18,.5,.97];
const chSize=f=>CH_A+(CH_B-CH_A)*f;
/* a point f (0 = West Bay, 1 = Chiswell) along the line, in the card's drawing (x: 20–300, y: 20–100) */
function chPt(f){const P=CH_LINE.map(p=>[p[0]*Math.cos(50.64*Math.PI/180),p[1]]);const x0=P[0][0],x1=P[P.length-1][0],y0=P[0][1],y1=P[P.length-1][1];
 const W=Math.min(280/(x1-x0),88/(y0-y1)),xm=(x0+x1)/2;const Q=P.map(p=>[160+(p[0]-xm)*W,24+(y0-p[1])*W]);let L=[0];for(let i=1;i<Q.length;i++)L.push(L[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));
 const t=clamp(f,0,1)*L[L.length-1];let i=1;while(i<Q.length-1&&L[i]<t)i++;const k=(t-L[i-1])/((L[i]-L[i-1])||1);return[Q[i-1][0]+(Q[i][0]-Q[i-1][0])*k,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*k,Q]}
const CHESIL={tours:["coasts"],title:"Pebbles that tell you where you are",globe:false,
 tip:"It is dark, and you have just landed on Chesil Beach. Feel the pebble, then slide to where you think you are.",
 card(L){const Q=chPt(0)[2];return'<svg class="rvv-chs" viewBox="0 0 320 132" role="img" aria-label="Chesil Beach from West Bay to Portland">'+
  '<path class="rvv-sea" d="M0 0H320V132H0Z"/><path class="rvv-land" d="M'+(Q[0][0]-60).toFixed(0)+' 0H320V'+(Q[Q.length-1][1]-6).toFixed(0)+'L'+Q.map(q=>(q[0]+7).toFixed(1)+" "+(q[1]-7).toFixed(1)).reverse().join("L")+'L'+(Q[0][0]-60).toFixed(0)+' '+(Q[0][1]-2).toFixed(0)+'Z"/>'+
  '<path class="rvv-fleet" d="M'+Q.slice(1).map(q=>(q[0]+3).toFixed(1)+" "+(q[1]-5).toFixed(1)).join("L")+'"/>'+
  '<path class="rvv-bank" d="M'+Q.map(q=>q[0].toFixed(1)+" "+q[1].toFixed(1)).join("L")+'"/>'+
  '<text class="rvv-chl" x="'+(Q[0][0]-6).toFixed(0)+'" y="'+(Q[0][1]-6).toFixed(0)+'" text-anchor="end">West Bay</text><text class="rvv-chl" x="'+(Q[Q.length-1][0]+12).toFixed(0)+'" y="'+(Q[Q.length-1][1]+4).toFixed(0)+'">Portland</text><text class="rvv-chl rvv-chf" x="'+(Q[2][0]+22).toFixed(0)+'" y="'+(Q[2][1]-4).toFixed(0)+'">the Fleet</text><text class="rvv-chl rvv-chf" x="'+(Q[2][0]-40).toFixed(0)+'" y="'+(Q[2][1]+30).toFixed(0)+'">sea</text>'+
  '<g class="rvv-chme"><circle r="7"/></g><g class="rvv-chtrue" style="display:none"><circle r="7"/></g></svg>'+
  '<div class="rvv-chrow"><div class="rvv-peb"><svg viewBox="0 0 90 70"><ellipse class="rvv-pebs" cx="45" cy="35" rx="10" ry="7"/></svg><span class="rvv-pebt"></span></div>'+
  '<div class="rvv-chc"><input type="range" class="rvv-rng" min="0" max="1000" value="500" aria-label="Where along the beach"><div class="rvv-btns"><button type="button" class="rvv-btn rvv-go">I landed here</button><button type="button" class="rvv-btn rvv-nx" hidden>Next pebble ▶</button></div></div></div>'},
 wire(L){const c=L.card;L.r=0;L.f=.5;L.res=[];L.lock=false;const rg=c.querySelector(".rvv-rng");
  rg.oninput=()=>{if(L.lock)return;L.f=rg.value/1000;this.render(L)};
  c.querySelector(".rvv-go").onclick=()=>{if(L.lock)return;L.lock=true;L.res[L.r]=Math.abs(L.f-CH_ROUNDS[L.r])*CH_KM;this.render(L)};
  c.querySelector(".rvv-nx").onclick=()=>{L.r++;if(L.r>=CH_ROUNDS.length){L.r=0;L.res=[]}L.lock=false;L.f=.5;rg.value=500;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const tf=CH_ROUNDS[L.r],s=chSize(tf),me=chPt(L.f),tr=chPt(tf);
  c.querySelector(".rvv-chme").setAttribute("transform","translate("+me[0].toFixed(1)+" "+me[1].toFixed(1)+")");
  const T=c.querySelector(".rvv-chtrue");T.style.display=L.lock?"":"none";T.setAttribute("transform","translate("+tr[0].toFixed(1)+" "+tr[1].toFixed(1)+")");
  /* the pebble drawn at its real size, about 1 cm = 12 px, so a pea is a dot and the biggest fill the box */
  const e=c.querySelector(".rvv-pebs");e.setAttribute("rx",(s*12/2*1.25).toFixed(1));e.setAttribute("ry",(s*12/2*.85).toFixed(1));
  c.querySelector(".rvv-pebt").textContent="Pebble "+(L.r+1)+" of "+CH_ROUNDS.length+": about "+(s<1?"the size of a pea":s.toFixed(1)+" cm long");
  c.querySelector(".rvv-go").hidden=L.lock;const nx=c.querySelector(".rvv-nx");nx.hidden=!L.lock;nx.textContent=L.r===CH_ROUNDS.length-1?"Play again":"Next pebble ▶";c.querySelector(".rvv-rng").disabled=L.lock;
  const km=f=>Math.round(f*CH_KM);
  if(!L.lock)say(L,"","The pebbles grow from pea-sized at West Bay to about 5 cm at Portland. Slide your marker, then land.");
  else{const d=L.res[L.r];const head=d<2.5?"Spot on! Only "+d.toFixed(1)+" km out":d<6?"Close: "+Math.round(d)+" km out":"You were "+Math.round(d)+" km out";
   let txt="You landed about "+km(tf)+" km from West Bay (the orange ring).";
   if(L.r===CH_ROUNDS.length-1){const tot=L.res.reduce((a,b)=>a+b,0)/L.res.length;txt+=" On average you were "+tot.toFixed(1)+" km from where you thought, on a beach 29 km long: the smugglers' trick works."}
   say(L,head,txt)}}};

/* ---- The biggest tides: run the clock through one tide at Hopewell Rocks. Wikipedia, "Bay of Fundy": "The tidal
   range in the Bay of Fundy is about 16 metres", tides "semidiurnal ... with about 6 hours and 13 minutes between each
   high and low tide". The rise is drawn as a smooth wave between low and high water (real tides are not exactly
   that smooth), so the water rises fastest, about 4 m an hour, half-way between them. The rock and the walker are
   drawn to one scale (a walker taken as 1.7 m tall). */
const TIDE_P=12.42,TIDE_R=16;
const FUNDY={tours:["coasts"],title:"The biggest tides",globe:false,
 tip:"Drag the clock through one tide at Hopewell Rocks. When can you walk round the rocks, and when must you paddle?",
 card(L){return'<svg class="rvv-tide" viewBox="0 0 320 170" role="img" aria-label="Water level at Hopewell Rocks">'+
  '<path class="rvv-sky" d="M0 0H320V170H0Z"/><path class="rvv-water" d="M0 170H320V170H0Z"/>'+
  '<path class="rvv-floor" d="M0 160Q80 154 160 158T320 156V170H0Z"/>'+
  /* a flowerpot rock, about 18 m to the trees (Wikipedia, "Hopewell Rocks": "They stand 12–21 metres (40–70 ft) tall"; at high tide the water "can be as high as 16 metres"): a narrow neck, wider and topped with trees */
  '<path class="rvv-rock" d="M150 160C152 128 148 100 140 80C132 64 128 52 132 42H198C202 52 198 64 190 80C182 100 178 128 180 160Z"/><path class="rvv-tree" d="M128 44Q134 26 150 32Q160 18 174 30Q190 24 200 44Z"/>'+
  '<g class="rvv-hk"></g><line class="rvv-hm" x1="38" x2="300" y1="0" y2="0"/><text class="rvv-hl" x="36" y="0" text-anchor="end"></text>'+
  '<g class="rvv-walk"><circle cx="0" cy="-15.5" r="2.4"/><path d="M0 -13V-6M0 -6L-2.5 0M0 -6L2.5 0M-3 -11L3 -11"/></g>'+
  '<g class="rvv-kay"><path d="M-15 0Q0 5 15 0Q0 -2 -15 0Z"/><circle cx="0" cy="-6" r="2.4"/><path d="M0 -4V-1M-8 -7L8 2"/></g></svg>'+
  '<div class="rvv-row"><span class="rvv-val rvv-clock"></span><input type="range" class="rvv-rng" min="0" max="745" step="1" value="0" aria-label="Hours since low tide"><button type="button" class="rvv-btn rvv-play" style="flex:0 0 auto">▶ Play</button></div>'},
 h(t){return TIDE_R/2*(1-Math.cos(2*Math.PI*t/TIDE_P))},
 wire(L){const c=L.card,r=c.querySelector(".rvv-rng"),pb=c.querySelector(".rvv-play");L.t=0;
  r.oninput=()=>{L.t=r.value/60;stopP();this.render(L)};
  const stopP=()=>{if(L.tm){clearInterval(L.tm);L.tm=0;pb.textContent="▶ Play"}};
  pb.onclick=()=>{if(L.tm){stopP();return}if(L.t>=TIDE_P-.05)L.t=0;pb.textContent="❚❚ Pause";L.tm=setInterval(()=>{if(!c.isConnected){stopP();return}L.t=Math.min(TIDE_P,L.t+.1);r.value=Math.round(L.t*60);this.render(L);if(L.t>=TIDE_P)stopP()},60)};
  L.off=()=>stopP();this.render(L)},
 off(L){try{if(L.tm)clearInterval(L.tm)}catch(e){}},
 render(L){const c=L.card;if(!c)return;const t=L.t,h=this.h(t),Y=v=>160-v*6.5;/* 1 m = 6.5 px: the rock stands about 18 m to its trees, so at high tide its top stays dry */
  const y=Y(h);c.querySelector(".rvv-water").setAttribute("d","M0 "+y.toFixed(1)+"Q80 "+(y-2).toFixed(1)+" 160 "+y.toFixed(1)+"T320 "+y.toFixed(1)+"V170H0Z");
  c.querySelector(".rvv-hm").setAttribute("y1",y.toFixed(1));c.querySelector(".rvv-hm").setAttribute("y2",y.toFixed(1));
  const hl=c.querySelector(".rvv-hl");hl.setAttribute("y",(y+4).toFixed(1));hl.textContent=h.toFixed(1)+" m";
  const hk=c.querySelector(".rvv-hk");if(!hk.childNodes.length)hk.innerHTML=[0,4,8,12,16].map(v=>'<line x1="40" x2="46" y1="'+Y(v)+'" y2="'+Y(v)+'"/>').join("");
  const walk=c.querySelector(".rvv-walk"),kay=c.querySelector(".rvv-kay"),wet=h>1.2;
  walk.style.display=wet?"none":"";walk.setAttribute("transform","translate(214 158)");kay.style.display=wet?"":"none";kay.setAttribute("transform","translate(222 "+(y+1).toFixed(1)+")");
  const hh=Math.floor(t),mm=Math.round((t-hh)*60);c.querySelector(".rvv-clock").textContent=(hh+(mm===60?1:0))+" h "+String(mm===60?0:mm).padStart(2,"0");
  const rate=TIDE_R/2*2*Math.PI/TIDE_P*Math.sin(2*Math.PI*t/TIDE_P);/* m an hour */
  const ph=t<.4||t>TIDE_P-.4?"Low tide":Math.abs(t-TIDE_P/2)<.4?"High tide":rate>0?"Rising":"Falling";
  say(L,ph+": the sea is "+h.toFixed(1)+" m above low water",
   ph==="Low tide"?"Walk on the sea floor round the flowerpot rocks. In about 6 hours 13 minutes the water will be about 16 m higher.":
   ph==="High tide"?"Only the tree-topped tops of the rocks are dry: the beach you walked on is under some 16 m of sea. Get a kayak!":
   (rate>0?"Rising":"Falling")+" about "+Math.abs(rate).toFixed(1)+" m an hour, "+Math.round(Math.abs(rate)*100/60)+" cm a minute"+(wet?": too deep to walk, so paddle.":": you can still walk, but keep an eye on the water."))}};

/* ---- Review on the last stop: what built each coast? (the tour's own stops: Norway's fjords dug by glaciers; the Nile
   and the Ganges–Brahmaputra deltas built of river mud; the Outer Banks, Spurn Point, Chesil Beach and the Twelve
   Apostles shaped by waves; the Great Barrier Reef built by coral animals; Flevoland drained by the Dutch). Each
   answer turns the globe there. */
const WHOCOAST=CLASSIFY({tours:["coasts"],title:"Now explore",turns:true,below:true,
 tip:"Review: what built each coast? Each answer turns the globe there.",ask:"Ice, rivers, waves, animals or people?",
 kinds:[["ice","Ice","glaciers"],["riv","Rivers","rivers"],["wav","Waves","the waves"],["ani","Animals","animals"],["ppl","People","people"]],
 items:[["Sognefjord, Norway","ice","Glaciers dug the valley far below sea level; the sea flooded in when the ice melted.",[6.5,61.15,2.6]],
  ["The Nile delta","riv","Mud dropped by the Nile as it slows down at the sea, in the shape of a Δ.",[31,30.9,2.6]],
  ["The Outer Banks","wav","Ribbons of sand piled up by the waves, rolling slowly towards the mainland.",[-75.6,35.6,2.6]],
  ["Spurn Point","wav","Clay washed off the Holderness cliffs and carried south by the waves.",[0.11,53.6,2.6]],
  ["The Great Barrier Reef","ani","About 2,900 reefs built by tiny coral animals.",[146.8,-18.5,2.2]],
  ["The Ganges–Brahmaputra delta","riv","Mud carried down from the Himalaya: the biggest delta of all.",[89.5,22.5,2.6]],
  ["Flevoland","ppl","Pumped dry by the Dutch in the 1950s and 60s: the largest artificial island in the world.",[5.5,52.5,2.6]],
  ["Chesil Beach","wav","The waves sorted its pebbles by size along 29 km of shingle.",[-2.6,50.64,2.6]],
  ["The Twelve Apostles","wav","Caves became arches, and arches fell, leaving stacks of limestone.",[143.1,-38.66,2.6]]],
 end:()=>"Waves wear coasts back and move the sand along; rivers build them out; ice dug the fjords; and coral animals and people have made new land too."});

/* ======================================================================== deserts */
/* ---- Not heat, but rain: put the deserts in order of size (Wikipedia, "List of deserts by area": Antarctic 14,200,000
   km², Arctic 13,900,000, Sahara 9,200,000, Arabian 2,330,000, Gobi 1,295,000, Kalahari 900,000, Taklamakan 337,000,
   Namib 81,000). The two biggest are frozen, which is this stop's point. */
const DSIZE=SORT({tours:["deserts"],title:"Not heat, but rain",below:true,desc:true,log:true,
 tip:"Put these deserts in order of size, biggest first.",first:"Biggest",last:"Smallest",
 items:[["Antarctica",14.2,"14.2 million km²"],["The Arctic",13.9,"13.9 million km²"],["The Sahara",9.2,"9.2 million km²"],["The Arabian Desert",2.33,"2.3 million km²"],
  ["The Gobi",1.295,"1.3 million km²"],["The Kalahari",.9,"900,000 km²"],["The Taklamakan",.337,"337,000 km²"],["The Namib",.081,"81,000 km²"]],
 after:(r,N)=>"The two biggest deserts are the frozen ones: what makes a desert is how little rain or snow falls, not the heat."});

/* ---- Review on the last stop: why is each desert dry? The reasons are the tour's own (the Sahara, the Kalahari and
   Arabia under the sinking air near the tropics; Patagonia and Death Valley in rain shadows; the Gobi behind the
   Himalaya and far from the sea; the Taklamakan walled in by mountains, far from any ocean; the Namib and the Atacama
   beside cold currents; Antarctica's air too cold to hold water). The Atacama also lies in the Andes' rain shadow
   (Wikipedia, "Atacama Desert"), so both count. Each answer turns the globe there. */
const WHYDRY=CLASSIFY({tours:["deserts"],title:"Now explore",turns:true,below:true,
 tip:"Review: why is each desert dry? Each answer turns the globe there.",ask:"What keeps the rain away?",
 kinds:[["sink","Sinking air","sinking air near the tropics"],["shadow","Mountains block the rain","a rain shadow"],["far","Far from the sea","being far from any sea"],["cold","A cold current","a cold ocean current"],["ice","Too cold for snow","air too cold to hold water"]],
 items:[["The Sahara","sink","Air that rose over the rainforests sinks again near the Tropic of Cancer, warming and drying out.",[12,22,1.8]],
  ["Patagonia","shadow","The Andes catch the westerly winds’ rain on Chile’s side.",[-69,-45,2.2]],
  ["The Namib","cold","The cold Benguela Current chills the air so it cannot rise and rain: fog comes instead.",[15,-24,2.2]],
  ["The Taklamakan",["far","shadow"],"Walled in by mountains and further from the sea than almost anywhere: both count.",[83,39,2.2]],
  ["Antarctica","ice","The air is so cold it holds almost no water: about 50 mm a year falls on the high plateau.",[100,-80,1.6]],
  ["The Gobi",["shadow","far"],"Behind the Himalaya and the Tibetan Plateau, and far from the sea: both count.",[103,43,2.2]],
  ["The Kalahari","sink","It lies under the sinking air near the Tropic of Capricorn.",[22,-23,2.2]],
  ["Death Valley","shadow","Pacific air drops its rain on the Sierra Nevada first.",[-117,36.4,2.2]],
  ["The Atacama",["cold","shadow"],"The cold Humboldt Current offshore, and the Andes blocking the east: both count.",[-69.5,-24,2.2]],
  ["The Rub’ al Khali","sink","Arabia sits in the same belt of sinking air as the Sahara.",[50,20,2.2]]],
 end:()=>"Sinking air, mountains, distance from the sea, cold currents and cold itself: most deserts have one or two of these at once."});

/* ======================================================================== ice */
/* ---- Ice on the equator: turn the globe to each of the tropics' ice fields. The stop's own facts (Kilimanjaro over
   80% lost since 1912; Venezuela's last glacier, 2024; Chacaltaya gone by 2009), and Wikipedia: "Quelccaya Ice Cap"
   (once "considered the largest ice area of the tropics", 42.8 km² in 2009, about 30% of its area lost 1979–2014);
   "Puncak Jaya" (4,884 m; "a total glaciated area of 0.165 ± 0.008 km² in 2024", "a loss of total glacier surface
   area of ~99% since ~1850", expected to disappear "by the beginning of the 2030s"); "Humboldt Glacier" (Venezuela's
   last, reclassified as an ice field in 2024); "Rwenzori Mountains" (the "Mountains of the Moon"). */
const EQICE=TURNER({tours:["ice"],title:"Ice on the equator",tip:"Ice near the equator, on three continents. Turn the globe to each.",
 intro:"Pick a mountain to fly there. Which one has the least ice left?",
 places:[["Kilimanjaro",37.355,-3.066,2.4,"Tanzania, 5,895 m: it has lost over 80% of the ice it had in 1912."],
  ["Mount Kenya",37.31,-0.15,2.4,"Kenya: its glaciers sit just 17 km south of the equator."],
  ["Rwenzori",29.87,0.39,2.4,"The ‘Mountains of the Moon’ on the Uganda–Congo border, with some of Africa’s last glaciers."],
  ["Venezuela",-70.99,8.55,2.4,"The Humboldt Glacier, the country’s last, shrank too small to count as a glacier in 2024."],
  ["Quelccaya",-70.82,-13.93,2.4,"Peru: once the largest ice area in the tropics, 43 km² in 2009; it lost about 30% of its area from 1979 to 2014."],
  ["Chacaltaya",-68.13,-16.35,2.4,"Bolivia: once the highest ski area in the world. By 2009 its glacier was gone."],
  ["Puncak Jaya",137.16,-4.08,2.4,"New Guinea, 4,884 m: about 99% of its ice has gone since 1850, and the rest may vanish by the early 2030s."]]});

/* ---- The last ice age: turn the globe from the ice's edge in Europe to North America and the marks the ice left
   (all from the stop's own text: Berlin at the ice edge, Chicago under it, ice up to 3 km thick, the Great Lakes'
   hollows scraped out, Long Island a hill of rubble, the land round the Gulf of Bothnia still rising up to about 1 cm
   a year). */
const ICEAGE=TURNER({tours:["ice"],title:"The last ice age",tip:"Turn the globe across the ice-age world, 20,000 years ago.",
 intro:"The dashed lines show roughly where the ice ended. Pick a place.",
 places:[["Berlin",13.4,52.52,2,"At the ice edge: the Scandinavian ice sheet reached about this far south."],
  ["Gulf of Bothnia",20,63,2,"Under the thickest European ice. Freed of its weight, the land here is still rising, by up to about 1 cm a year."],
  ["Chicago",-87.63,41.88,2,"Under the ice: the North American ice sheet reached past the site of the city."],
  ["Hudson Bay",-85,58,1.8,"Here the ice was up to about 3 km thick, ten times the height of the Eiffel Tower."],
  ["The Great Lakes",-84,45,2,"The ice scraped out their hollows; they filled with meltwater as it retreated."],
  ["Long Island",-73,40.8,2.2,"A hill of rubble pushed up and left behind at the ice’s edge."]]});

/* ---- Review on the last stop: would it raise the sea if it melted? From the tour's own text: Greenland's ice about 7
   m and Antarctica's about 58 m; "ice that already floats, such as sea ice, does not raise the sea when it melts"
   (icebergs float too); mountain glaciers such as the Aletsch and the Third Pole's sit on land. Each answer turns the
   globe there. */
const RAISE=CLASSIFY({tours:["ice"],title:"Now explore",turns:true,below:true,
 tip:"Review: if this ice melted, would the sea rise? Each answer turns the globe there.",ask:"Would the sea rise?",
 kinds:[["y","Yes, the sea rises","the sea rises"],["n","No, it already floats","it already floats"]],
 items:[["Greenland’s ice sheet","y","Yes, by about 7 m: it sits on land, so its meltwater adds to the sea.",[-42,72,1.8]],
  ["The Aletsch Glacier","y","Yes, a little: mountain glaciers sit on land too.",[8,46.5,2.4]],
  ["Sea ice at the North Pole","n","No: it is frozen seawater, already floating, like an ice cube in a glass.",[0,85,1.6]],
  ["An iceberg in Iceberg Alley","n","No: it already floats, nine-tenths under water.",[-52,48,2]],
  ["Antarctica’s ice sheet","y","Yes, by about 58 m if it all melted, which would take many centuries.",[100,-80,1.6]],
  ["The Third Pole’s glaciers","y","Yes: they sit on land. First they swell the rivers, then the rivers run lower.",[85,32,2]]],
 end:()=>"Ice on land raises the sea when it melts; ice that already floats does not. But melting sea ice still matters: dark water soaks up more sunlight."});

/* ======================================================================== art */
/* ---- Skyscrapers: put the tour's tall buildings in order of height. Burj Khalifa 828 m, Shibam's towers about 30 m
   (the stop's own text); Tokyo Skytree 634 m and Sagrada Família 172.5 m (the tour's own stops); the Great Pyramid
   146.6 m when built and Lincoln Cathedral's spire "reputedly" 160 m, 1311–1548 (Wikipedia, "List of tallest
   buildings and structures"); Florence's dome and lantern 114.5 m (Wikipedia, "Florence Cathedral"); the Home
   Insurance Building 42.1 m when built in 1885 (Wikipedia, "Home Insurance Building"). */
const TALL=SORT({tours:["art"],title:"Skyscrapers",below:true,desc:true,log:true,
 tip:"Put the tour’s tall buildings in order of height, tallest first.",first:"Tallest",last:"Shortest",
 items:[["Burj Khalifa, Dubai (2010)",828,"828 m"],["Tokyo Skytree (2012)",634,"634 m"],["Sagrada Família, Barcelona (2026)",172.5,"172.5 m"],["Lincoln Cathedral’s spire (1311)",160,"about 160 m"],
  ["The Great Pyramid (about 2560 BC)",146.6,"146.6 m"],["Florence’s dome (1436)",114.5,"114.5 m"],["Home Insurance Building, Chicago (1885)",42.1,"42 m"],["Shibam’s mud towers (1500s)",30,"up to about 30 m"]],
 after:(r,N)=>"For nearly 4,000 years stone tombs and cathedrals held the record. Steel frames and lifts let the first skyscraper, only 42 m tall, start a race that has gone twenty times higher."});

/* ---- Review on the last stop: why does it look like that? The tour's opening names the reasons (the stone, clay and
   colours at hand, a damp climate, earthquakes, beliefs about what may be shown), and its stops give each answer:
   Ur's mud brick and Egypt's stone, the brass of melted-down manillas in Benin, Japan's swaying pagodas and Tokyo
   Skytree's central column, Venice's oil on canvas, and Papunya's dots hiding sacred designs. Each answer turns the
   globe there. */
const WHYART=CLASSIFY({tours:["art"],title:"Now explore",turns:true,below:true,
 tip:"Review: why does each work look the way it does? Each answer turns the globe there.",ask:"What shaped it?",
 kinds:[["mat","What was at hand","what was at hand"],["clim","The climate","the climate"],["eq","Earthquakes","earthquakes"],["bel","Beliefs","beliefs"]],
 items:[["The Ziggurat of Ur, of mud brick","mat","Mesopotamia’s river plain has almost no stone, so its builders used mud brick, skinned with baked brick set in tar.",[46.1,30.96,2.4]],
  ["Hōryū-ji’s loosely stacked pagoda","eq","Its storeys sway in opposite directions in a quake, soaking up the shaking.",[135.73,34.61,2.4]],
  ["Venice’s oil paintings on canvas","clim","Damp, salty air made frescoes flake, so Venetian painters turned to canvas.",[12.34,45.44,2.4]],
  ["Papunya’s fields of dots","bel","Some designs are sacred and secret, so artists hid them under dots.",[131.9,-23.2,2.2]],
  ["The pyramids of Giza, of stone","mat","The Nile is lined with limestone cliffs, so Egypt built in stone.",[31.13,29.98,2.4]],
  ["Tokyo Skytree’s central column","eq","Its designers borrowed the pagodas’ central post, the shinbashira, to ride out quakes.",[139.81,35.71,2.4]],
  ["Benin’s brass heads","mat","Much of the metal was European brass, paid in manillas, which the casters melted down.",[5.63,6.34,2.4]]],
 end:()=>"Artists use what their land gives them, build for the ground they stand on and the air they breathe, and show (or hide) what their beliefs allow."});


/* ---------------- guess first (geoflock-tourplay.js veils the headline and asks for an estimate) ----------------
   The Twelve Apostles: Wikipedia, "The Twelve Apostles (Victoria)": "Seven of the original nine stacks remain
   standing" (one fell in 2005, another in 2009). Death Valley: 56.7 °C at Furnace Creek, 10 July 1913, the highest air
   temperature on record (WMO Archive of Weather and Climate Extremes; Wikipedia, "Death Valley"). The Great
   Pyramid: "the tallest man-made structure in the world for more than 3,800 years" (Wikipedia, "Great Pyramid of
   Giza"), the stop's own figure. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const GS={"coasts|The Twelve Apostles":{q:"Despite the name, how many of the Twelve Apostles’ stacks are still standing?",min:0,max:12,ans:7,unit:"stacks",step:1,show:"seven: there were only ever nine, and two have fallen since 2005"},
  "deserts|Death Valley’s heat trap":{q:"The hottest air temperature ever recorded was measured here, in 1913. How hot was it?",min:20,max:70,ans:56.7,unit:"°C",step:0.5,show:"56.7 °C, at Furnace Creek on 10 July 1913"},
  "art|Pyramids and ziggurats":{q:"For how many years was the Great Pyramid the tallest building on Earth?",min:100,max:5000,ans:3800,unit:"years",step:100,show:"about 3,800 years, until Lincoln Cathedral’s spire rose higher, about 1311"}/*@@GS@@*/};
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}
{const s=document.createElement("style");s.textContent=`
.rvv-chs,.rvv-tide{display:block;width:100%;height:auto;border-radius:10px;border:1px solid rgba(19,41,75,.12);margin-top:4px}
.rvv-sea{fill:#9cc8e8}.rvv-land{fill:#d9cfa6}.rvv-fleet{fill:none;stroke:#bfe0f3;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.rvv-bank{fill:none;stroke:#8f8a7c;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.rvv-chl{font:800 11px system-ui,sans-serif;fill:#13294b}.rvv-chf{font-weight:700;font-style:italic;fill:#2a5f8a}
.rvv-chme circle{fill:#fff;stroke:#13294b;stroke-width:3}.rvv-chtrue circle{fill:rgba(255,209,102,.5);stroke:#d9682b;stroke-width:3}
.rvv-chrow{display:flex;gap:10px;align-items:center;margin-top:8px}.rvv-chc{flex:1 1 auto}.rvv-chc .rvv-rng{width:100%}
.rvv-peb{flex:0 0 112px;text-align:center}.rvv-peb svg{display:block;width:90px;height:70px;margin:0 auto;background:#efe9da;border-radius:10px}
.rvv-pebs{fill:#8a8478;stroke:#5f5a50;stroke-width:1}.rvv-pebt{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c;line-height:1.2;margin-top:3px}
.rvv-rng{accent-color:#d9682b}
.rvv-sky{fill:#e3f0f8}.rvv-water{fill:rgba(42,120,208,.55)}.rvv-floor{fill:#b28a63}.rvv-rock{fill:#9b5a3c;stroke:#6e3e28;stroke-width:1.2}.rvv-tree{fill:#3f8a4b}
.rvv-hk line,.rvv-hm{stroke:#13294b;stroke-width:1.2}.rvv-hm{stroke-dasharray:4 3;opacity:.6}.rvv-hl{font:800 11px system-ui,sans-serif;fill:#13294b}
.rvv-walk circle,.rvv-kay circle{fill:#13294b}.rvv-walk path,.rvv-kay path{stroke:#13294b;stroke-width:1.6;fill:none;stroke-linecap:round}.rvv-kay path:first-child{fill:#d9682b;stroke:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvv-pebt{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvv-chs,:is(body.dark-theme,body.sky-night) .rvv-tide{border-color:rgba(255,255,255,.18)}
`;document.head.appendChild(s)}

const DEFS=[CHESIL,FUNDY,WHOCOAST,DSIZE,WHYDRY,EQICE,ICEAGE,RAISE,TALL,WHYART];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvv-layer rvv-layer";el.innerHTML='<svg class="rvv-sv"><defs><clipPath id="rvvDisc"><path class="rvv-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvvDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvv-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvv-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvv-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvv-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvv-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvv-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvv-ctl"))unmount()}catch(e){}},300);
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
.rvv-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvv-sv{position:absolute;left:0;top:0;overflow:visible}
.rvv-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvv-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvv-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvv-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvv-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvv-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvv-btn[hidden]{display:none}
.rvv-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvv-ep b{display:block;font-size:15px}
.rvv-ep.rvv-new{animation:rvvIn .45s ease}@keyframes rvvIn{from{opacity:.2;transform:translateY(4px)}}
.rvv-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvv-sortq i{font-style:normal}
.rvv-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvv}
.rvv-rank li{position:relative;counter-increment:rvv;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvv-rank li::before{content:counter(rvv);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvv-rank li.rvv-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvv-rank li.rvv-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvv-nm{flex:1 1 auto;z-index:1}.rvv-v{z-index:1;font-weight:800;white-space:nowrap}
.rvv-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvv-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvv-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvv-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvv-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvv-do,:is(body.dark-theme,body.sky-night) .rvv-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvv-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvv-btn,:is(body.dark-theme,body.sky-night) .rvv-chip,:is(body.dark-theme,body.sky-night) .rvv-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvv-rank li.rvv-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvv-rank li.rvv-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvv-bar{background:rgba(255,178,122,.2)}
.rvv-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvv-rng{flex:1 1 auto;accent-color:#d9682b}.rvv-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvv-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvv-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvv-item{font-size:16px;color:#13294b}
.rvv-bins{display:flex;gap:6px;flex-wrap:wrap}.rvv-bins .rvv-btn[hidden]{display:none}.rvv-bin:disabled{cursor:default;opacity:.55}
.rvv-btn.rvv-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvv-btn.rvv-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvv-dots{display:flex;gap:4px;margin-top:8px}.rvv-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvv-dots i.rvv-now{box-shadow:0 0 0 2px #d9682b inset}.rvv-dots i.rvv-y{background:#1f8a4c}.rvv-dots i.rvv-x{background:#c2364f}
.rvv-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvv-sl .rvv-row{margin-top:2px}.rvv-sl .rvv-val{min-width:36px}
.rvv-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvv-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvv-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvv-out b{font-size:15px;color:#9a4a16}
.rvv-ch{display:block;width:100%;height:auto;margin-top:6px}.rvv-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvv-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvv-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvv-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvv-val,:is(body.dark-theme,body.sky-night) .rvv-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvv-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvv-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvv-n,:is(body.dark-theme,body.sky-night) .rvv-sl label,:is(body.dark-theme,body.sky-night) .rvv-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvv-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvv-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvv-dots i{background:rgba(255,255,255,.18)}
.rvv-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvv-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvv-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvv-dd circle.rvv-near{fill:#d9682b;opacity:1}
.rvv-pump{cursor:pointer;outline:none}.rvv-pump .rvv-hit{fill:transparent}.rvv-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvv-pump:hover rect,.rvv-pump:focus rect{fill:#13294b}.rvv-pump.rvv-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvv-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvv-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvv-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvv-kd{background:#2a2f3a}.rvv-kp{background:#2a78d0;border-radius:2px!important}.rvv-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvv-key2{color:#aab6c8}
.rvv-btn.rvv-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvv-btn.rvv-cur{background:#9fc3ff;color:#13294b}
.rvv-band{fill:rgba(217,104,43,.1)}.rvv-area{fill:rgba(42,120,208,.22);stroke:#2a78d0;stroke-width:1.5;stroke-linejoin:round}.rvv-dashed{fill:none;stroke:#8a98a8;stroke-dasharray:3 3}
line.rvv-now{stroke:#d9682b;stroke-width:1.5}.rvv-dot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
:is(body.dark-theme,body.sky-night) .rvv-area{fill:rgba(159,195,255,.22);stroke:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvv-band{fill:rgba(255,178,122,.12)}
:is(body.dark-theme,body.sky-night) .rvv-btn.rvv-good{background:#1f8a4c;border-color:#4cc27f;color:#fff}:is(body.dark-theme,body.sky-night) .rvv-btn.rvv-bad{background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvv-dots i.rvv-y{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvv-dots i.rvv-x{background:#ff7088}:is(body.dark-theme,body.sky-night) .rvv-dots i.rvv-now{box-shadow:0 0 0 2px #ffb27a inset}
.rvv-ring{fill:rgba(255,209,102,.3);stroke:#d9682b;stroke-width:3}
.rvv-race{display:flex;flex-direction:column;gap:6px;margin:4px 0}
.rvv-lane{display:grid;grid-template-columns:1fr auto;align-items:end;column-gap:8px;row-gap:3px;font-size:13px;font-weight:800;color:#13294b}
.rvv-lane span{line-height:1.1}.rvv-lane small{display:inline;margin-left:5px;font-size:10.5px;font-weight:700;color:#5b6b7c}
.rvv-rb{display:block;height:14px;border-radius:7px;background:#d9682b;transition:width .7s ease;grid-column:1/-1;grid-row:2;justify-self:start}
.rvv-stl,.rvv-b1{background:#2a78d0}.rvv-num{font-size:13px;color:#13294b;min-width:72px;text-align:right}
.rvv-src{font-size:11px;color:#5b6b7c;margin-top:4px}
.rvv-atl{fill:rgba(217,104,43,.25);stroke:#d9682b;stroke-width:2}.rvv-bcn{fill:rgba(42,120,208,.35);stroke:#2a78d0;stroke-width:2}
.rvv-cmp[hidden]{display:none}
:is(body.dark-theme,body.sky-night) .rvv-lane,:is(body.dark-theme,body.sky-night) .rvv-num{color:#fff}
:is(body.dark-theme,body.sky-night) .rvv-lane small,:is(body.dark-theme,body.sky-night) .rvv-src{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvv-stl,:is(body.dark-theme,body.sky-night) .rvv-b1{background:#6fa8ff}
.rvv-road{fill:#9aa3ad}.rvv-blk{fill:#e8c9a0;stroke:#b08a5a;stroke-width:1}.rvv-in{fill:#9aa3ad;transition:fill .6s}.rvv-car{fill:#c2364f;transition:opacity .5s}
.rvv-trees{opacity:0;transition:opacity .6s}.rvv-tree{fill:#2f9e5b}
.rvv-sb.rvv-on .rvv-in{fill:#bfe3b4}.rvv-sb.rvv-on .rvv-trees{opacity:1}.rvv-sb.rvv-on .rvv-cin{opacity:0}
.rvv-sbk .rvv-car,.rvv-sbk .rvv-tree{opacity:1}
:is(body.dark-theme,body.sky-night) .rvv-road,:is(body.dark-theme,body.sky-night) .rvv-in{fill:#5b6573}:is(body.dark-theme,body.sky-night) .rvv-sb.rvv-on .rvv-in{fill:#3f7a4f}
.rvv-ship{fill:#fff;stroke:#13294b;stroke-width:3}.rvv-arrow{fill:none;stroke:#d9682b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
:is(body.dark-theme,body.sky-night) .rvv-ship{stroke:#9fc3ff}
/* while a guess-first question hides a stop's headline, the measuring ruler's distance label (index.html's .psc-lab)
   is hidden too: on the Andes and Mammoth Cave stops it showed the very answer being guessed */
body:has(.ps-card.tp-veil) .psc-lab{visibility:hidden}
`;document.head.appendChild(s)}


window.gfPolishRvv={v:1,FIX,viewOf,tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
