/* GeoFlock polish RW-8: a stop-by-stop review of the guided tours, each stop looked at on its default map (the globe)
   at 1280×860, after the reviews in geoflock-polish-rw5.js, -rw6.js and -rw8.js.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with or look at more closely (listed in DEFS at the end of part 2).
   The engine is geoflock-polish-rw8.js's, copied under "rw8" names so the files never touch each other's controls:
   frames looked up by tour and title and a psGlobeTarget wrapper (this file's wraps the others', so a stop framed here
   gets exactly its frame, also where an earlier file locked the stop's "globe" field); fixed fields are non-configurable
   getters whose setters are ignored (a field already non-configurable is left alone). Pin lists are filtered through
   getters, photo pins wait for geoflock-portraits.js's portraits, and a stop whose photos are dropped gets its photo
   squares rebuilt. CSS classes start with "rw8-". Everything is wrapped in try/catch; Next and Back are never blocked. */


(function(){
"use strict";
if(window.gfPolishRw8)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw8Test or ?rw8test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw8Test||/[?&]rw8test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* Pin lists are filtered, not frozen: the shared photo pass (geoflock-stopphotos.js, -pinfix.js) turns text pins into
   photo pins at its own times after load, so a list copied once would keep or lose pins depending on timing. XF puts
   a getter on the field that applies this file's edits to whatever the field holds; other files' writes still go
   through (to the value underneath). Each edit has an id, so applying the fixes again does not stack them.
   A field another script already serves through its own getter (as geoflock-sweep-tours2.js and geoflock-polish-m.js
   do) keeps that getter and setter underneath, as geoflock-polish-rvs.js found. */
/* (the cached list is also recomputed when it, or the list underneath, has changed length in place: some files push
   restored pins straight into the array a stop's pins field hands them) */
const XFS=new WeakMap();
let PEND=false;
const PPW=new WeakMap();/* (it waits at most about 20 s) */
const pplPending=S=>{try{const t=ps&&ps.tour,n=strip(S.title);if(!(window.GF_PORTRAITS||[]).some(p=>p.tour===t&&p.stop===n)||Object.prototype.hasOwnProperty.call(S,"_gfPpl"))return false;
 const w=(PPW.get(S)||0)+1;PPW.set(S,w);return w<70}catch(e){return false}};
const XF=(S,k,id,fn)=>{try{if(k==="phPins"&&!(XFS.get(S)||{})[k]&&pplPending(S)){PEND=true;return}let R=XFS.get(S);if(!R){R={};XFS.set(S,R)}
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;const B={v:S[k],fns:{},og:d&&d.get,os:d&&d.set};R[k]=B;
  Object.defineProperty(S,k,{configurable:!!(window.__rw8Test||/[?&]rw8test\b/.test(location.search)),enumerable:true,
   get:()=>{const pk=k==="phPins"?pplReady(S):0,bv=B.og?B.og.call(S):B.v;if(B.out&&B.at===bv&&B.atN===B.n&&B.pk===pk&&B.out.length===B.ol&&(!bv||bv.length===B.bl))return sync(S,k,B.out);let v=Array.isArray(bv)?bv.slice():(bv||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}
    if(pk)v=pplAdd(S,v);if(k==="phPins"&&B.out&&B.out.length!==v.length)setTimeout(()=>resq(S),0);B.out=v;B.ol=v.length;B.bl=bv&&bv.length;B.at=bv;B.atN=B.n;B.pk=pk;return sync(S,k,v)},set:x=>{if(B.os)B.os.call(S,x);else B.v=x}})}
 R[k].fns[id]=fn;R[k].n=(R[k].n||0)+1;if(k==="phPins")resq(S)}catch(e){}};
/* index.html builds a stop's photo squares once, by position in the list (as geoflock-polish-rvo.js found): when this
   file changes the list of a stop already drawn, its squares are rebuilt, or a dropped photo's square stays and every
   label after it slides onto the wrong place */
function resq(S){try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}}
/* The getter hands back the same array until the value underneath or the edits change. geoflock-portraits.js adds the
   people's round portraits by wrapping phPins itself, and does so again whenever S.phPins is not its own list
   (S._gfPpl): so the filtered list is also stored there, which tells it the stop is done (otherwise it tried to redefine
   the locked field on every redraw and logged an error each time). Its portraits are kept: they are in the value
   underneath. */
/* and, as geoflock-portraits.js would on a later redraw, the stop's portraits whose pictures have loaded since are
   added here (a locked field can no longer be re-wrapped by it) */
const TOUR_OF=new WeakMap(),PPOK=new Map();
/* a stop's portrait taken off the map (NOPPL): left out here, and never added back by the step below */
const NOP=new WeakMap();
const pplList=S=>{try{const t=TOUR_OF.get(S),n=strip(S.title);return(window.GF_PORTRAITS||[]).filter(p=>p.tour===t&&p.stop===n)}catch(e){return[]}};
const pplOk=f=>{const m=PPOK.get(f);if(m===true)return true;const now=Date.now();if(m&&now-m<2000)return false;
 let ok=false;try{ok=PS_PHOTO_DATA.some(x=>x&&x.f===f&&x.d)}catch(e){}PPOK.set(f,ok||now);return ok};
function pplReady(S){const L=pplList(S);return L.filter(p=>pplOk(p.f)).length}
function pplAdd(S,v){const names=new Set(v.map(q=>strip(q&&q.label).toLowerCase()));(NOP.get(S)||[]).forEach(n=>names.add(n.toLowerCase()));
 pplList(S).forEach(p=>{if(!names.has(p.name.toLowerCase())&&pplOk(p.f))v=v.concat([{at:p.at,label:p.name,col:"#3d3466",icon:"photo",person:1}])});return v}
function sync(S,k,v){if(k==="phPins"&&Object.prototype.hasOwnProperty.call(S,"_gfPpl"))try{S._gfPpl=v}catch(e){}return v}
const DROP=(S,re)=>XF(S,"pins","drop"+re,P=>P.filter(p=>!re.test(pinText(p))));
const DROPPH=(S,re)=>XF(S,"phPins","drop"+re,P=>P.filter(p=>!re.test(strip(p&&p.label))));
/* rename a text pin */
const RENAME=(S,re,txt)=>XF(S,"pins","ren"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p));
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine itself turns it out from under the card */

/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>XF(S,"pins","mv"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p));
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>XF(S,"pins","area"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p));
/* drop the icon pins with this icon name (and, if given, within 2° of this place) */
const DROPIC=(S,re,at)=>XF(S,"iconPins","dropic"+re+at,I=>I.filter(q=>!(q&&re.test(String(q.icon))&&(!at||Math.hypot(q.at[0]-at[0],q.at[1]-at[1])<2))));
/* add a text pin (once) */
const ADDPIN=(S,pin)=>XF(S,"pins","add"+pin[1],P=>P.some(p=>Array.isArray(p)&&strip(p[1])===pin[1])?P:P.concat([pin]));


/* index.html's wrapper of psGlobeTarget flies to the middle of all a stop's pins, photos and icons whenever more of them
   are in sight from there, which on stops with places far apart turned the globe to a point between them (as
   geoflock-polish-rvq.js found). A stop framed here (on the globe, not the flat map) gets exactly its frame. */
const VIEWED=new WeakMap();
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);VIEWED.set(S,g);LOCK(S,"card",card||"left")};
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw8)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw8,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw8=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);


const FIX={};
/* take a portrait (added by geoflock-portraits.js) off a stop */
const NOPPL=(S,name)=>{const L=NOP.get(S)||[];if(!L.includes(name))L.push(name);NOP.set(S,L);DROPPH(S,new RegExp("^"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"))};


/* the stop's shaded countries go (see "Attack on the plains") */
const NOSHADE=S=>{LOCK(S,"hi",[]);LOCK(S,"hiSoft",[])};
const ABOVE=(S,re)=>XF(S,"pins","above"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?{at:[Array.isArray(p[0][0])?p[0][0]:p[0]],text:p[1],above:true}:p));


/* the country labels that other files add to a stop's pins ("Peru", "Brazil" and the like) hung on long leaders, often off
   the globe or over the map's own country names: the map already names every country */
const NOCOUNTRY=(S,list)=>DROP(S,new RegExp("^("+list.join("|")+")$"));
const SAM=["Peru","Bolivia","Brazil","Argentina","Uruguay","Paraguay","Chile","Colombia","Ecuador","Venezuela"];

FIX.geo={
  /* the Greenland photo and marker 1 sat on the map's switches at the globe's top edge: framed a little further north */
  "The world’s best surprises":S=>VIEW(S,[22,30,1]),
  /* Mauna Kea and Chimborazo, two of the stop's three mountains, were round the back of the globe: it opens on
     Everest and the stop's buttons turn to the other two (part 2) */
  "Everest isn’t the tallest mountain":S=>VIEW(S,[87,28,1.6]),
  /* Calgary's pin lay under the card and its label hung on a long leader over the map's switches */
  "Further north than you think":S=>DROP(S,/^Calgary/),
  /* the tree-kangaroo photo sat under the map key and Lombok's label against it: framed a little further west */
  "The Wallace Line":S=>VIEW(S,[120,-5,1.7]),
  /* most of France's lands were round the back of the globe, the Caribbean label on the card's edge: the stop's buttons
     turn the globe to each (part 2) */
  "France: the most time zones":S=>VIEW(S,[-20,12,1]),
  /* the line ran off the globe: its end, Kamchatka, was off the globe's edge and the Madagascar photo below the screen:
     framed from Pakistan to Madagascar, and the stop's buttons follow the line (part 2) */
  "The longest straight line at sea":S=>VIEW(S,[58,-4,1.25]),
  /* an "Australia" label on a long leader under the Moon (the map names it): it goes; framed a little further east so
     Steep Point's label sits nearer its place */
  "Wider than the Moon":S=>{DROP(S,/^Australia$/);VIEW(S,[137,-26,2])}
};

FIX.pop={
  /* China's label hung on a long leader over the search box at the globe's top right: framed further east */
  "The most populous countries":S=>VIEW(S,[92,24,1.1])
};

FIX.climate={
  /* the Congo was at the globe's edge and Indonesia round the back: it opens on the Amazon and the stop's buttons turn
     the globe along the rain belt (part 2) */
  "The rain belt":S=>VIEW(S,[-61,-4,1.6]),
  /* the Sonoran's label hung over the map's switches from a pin under the card, and the Namib photo was below the
     screen: framed on the Equator between the two belts; the Sonoran label goes (the more text names it) */
  "The desert belts":S=>{DROP(S,/^Sonoran$/);VIEW(S,[14,3,1])},
  /* the globe turned to the empty Pacific halfway between the two records, Death Valley at its top edge and Vostok at
     its bottom: it opens on Death Valley, and the stop's buttons turn to Vostok (part 2) */
  "The hottest and coldest ever recorded":S=>VIEW(S,[-116.87,36.46,2])
};

FIX.africa={
  /* the card sat on the right and the map key on the left, over the Great Rift Valley's label: card left */
  "The roof of Africa":S=>VIEW(S,[37,-2,3.48])
};

FIX.europe={
  /* the western half of the line, from Gibraltar to the Bosphorus, lay under the card, and the Atlantic's label hung
     over the map's switches: framed further west */
  "Where Europe ends":S=>VIEW(S,[30,50,1.2])
};

FIX.plates={
  /* the St Helens photo sat on the map's switches, Kīlauea under the card and Chaitén below the screen: the stop opens
     on North America and its buttons turn to each volcano (part 2) */
  "Why some volcanoes explode":S=>VIEW(S,[-100,12,1])
};

FIX.antarctica={
  /* the krill photo sat on the map's switches at the globe's top edge, the penguin label under the map key: framed
     between the krill sea and the penguin coast, over the pole */
  "Life at the edge":S=>VIEW(S,[20,-78,1.3])
};

FIX.explorers={
  /* the Hawaii photo sat on the map's switches at the globe's top edge: framed a little further north */
  "Captain Cook":S=>VIEW(S,[-170,-12,1]),
  /* Brest's label sat at the globe's top edge, against the map's switches: framed a little further north */
  "The first woman to sail round the world":S=>VIEW(S,[-10,-2,1])
};

FIX.hantarctica={
  /* the South Georgia photo sat on the map's switches at the globe's top edge; turned to the side, the square (set out
     from the globe's middle) landed on the zoom buttons instead: on this opening overview the photo goes (South
     Georgia has its own stops later), and the polar view is drawn a little smaller */
  "Antarctica’s story":S=>{DROPPH(S,/South Georgia/);VIEW(S,[-40,-90,1.35])}
};

FIX.food={
  /* Ireland's label sat over the search box at the globe's top edge: framed a little further north (geoflock-polish-
     rvq.js's frame was [-30,-5,1]) */
  "From Titicaca to Ireland":S=>VIEW(S,[-30,10,1])
};

FIX.migration={
  /* the Naples photo sat on the zoom buttons at the globe's right edge, 90° east of New York: no frame beside the card
     holds both ends of the crossing and Naples, so the photo goes (Italy's emigrants are in the stop's text) */
  "The great Atlantic crossing":S=>DROPPH(S,/^Naples$/),
  /* the Beirut photo sat on the zoom buttons at the globe's edge, Mexico City's against the card and Sydney round the
     back: it opens on Lebanon and West Africa, and the stop's buttons turn to each community (part 2) */
  "Lebanon’s global family":S=>VIEW(S,[22,20,1.3]),
  /* the Auckland label sat under the map key and Toronto and Vancouver were round the back: it opens on Australia, and
     the stop's buttons turn to New Zealand and Canada (part 2) */
  "Built by newcomers":S=>VIEW(S,[140,-30,1.5])
};

FIX.hazards={
  /* the globe looked at the Atlantic: East Africa's swarms and the Maasai Mara photo were at its right edge under the
     map key, and the Caribbean under the card: it opens on the desert locust's Sahel, and the stop's buttons turn to
     the two plagues (part 2) */
  "Plagues of locusts":S=>VIEW(S,[14,12,1.4])
};

FIX.animals={
  /* the Arctic tern photo sat on the map's switches at the globe's top edge, the Antarctic terns below the screen and
     the monarchs round the back: it opens on the Serengeti and the stop's buttons follow each journey (part 2) */
  "Great journeys":S=>VIEW(S,[35,-1.5,1.8]),
  /* the okapi and Grauer's gorilla photos sat under the map key: framed a little further east */
  "The Congo rainforest":S=>VIEW(S,[24,-1,3.2])
};

FIX.inventions={
  /* the globe turned to the Arctic, with the Nashtifan and Jingdezhen photos on the map's switches: framed on the
     northern lands where the tour's inventions were born */
  "Where ideas were born":S=>VIEW(S,[30,25,1])
};

FIX.flags={
  /* Liberia's flag sat at the globe's right edge by the map key and Malaysia, the third flag of the stop, was round the
     back: framed further east, and the stop's buttons turn to Liberia and Malaysia (part 2); the "United States" label,
     whose pin is then under the card, hung over the map's switches and goes (the flag pictures name it) */
  "Stars and stripes":S=>{DROP(S,/^United States$/);VIEW(S,[-28,20,1.1])},
  /* Switzerland and Vatican City, the two square flags shaded on the globe, were off its edge: the stop's buttons
     turn to them (part 2) */
  "Not a rectangle":S=>VIEW(S,[85,28,2.2])
};

FIX.langrel={
  /* the globe looked down on the Arctic (geoflock-polish-rvh.js's frame, made for a card on the right): with the card
     on the left, Brampton, Canada and the US lay under it and Amritsar at the globe's edge under the map key. It opens
     on Punjab, and the stop's buttons turn to Britain and Canada (part 2) */
  "Sikhism’s Punjab":S=>VIEW(S,[74.88,31.62,2.2])
};

FIX.gdp={
  /* the globe looked at the empty North Pacific halfway between the two giants: the US lay under the card (on the
     right, beside the map's side panel), China at the globe's left edge and the New York photo on the zoom buttons. It
     opens on the US, the card kept on the right, and the stop's buttons turn to China (part 2) */
  "Two giants":S=>VIEW(S,[-95,38,1.4],"right"),
  /* China, the stop's subject, was at the globe's right edge and Italy's label below the card: it opens on China, and
     the stop's buttons turn to Italy (part 2) */
  "China’s rise":S=>VIEW(S,[105,33,1.6])
};

FIX.borders={
  /* the card sat on the right, over Ohio and the Ambassador Bridge, and the "Canada" and "United States" labels hung on
     long leaders off the globe's edges: card left, framed from Vancouver to Ohio; the two country labels go (the map
     names them) */
  "Borders still stop trade":S=>{DROP(S,/^(Canada|United States)$/);VIEW(S,[-96,46,1.8])},
  /* the Vatican photo sat on the year banner and the map's switches at the globe's top edge, Lesotho's below the
     screen: it opens on Italy, and the stop's buttons turn to Lesotho (part 2) */
  "Countries inside countries":S=>VIEW(S,[12.5,42.5,3])
};

FIX.samerica={
  /* the Washington photo sat on the map's switches at the globe's top edge: framed a little further north
     (geoflock-polish-rvd.js's frame was [-75,2,1]) */
  "Further east than you think":S=>VIEW(S,[-75,14,1]),
  /* Brazil, the stop's subject, lay at the globe's right edge with the drag-me outline of the US under the map key:
     framed on Brazil (Chile and Ecuador, with no border, still show to its west) */
  "Brazil is half the continent":S=>VIEW(S,[-58,-15,1.1])
};

FIX.time={
  /* the globe looked down on the Arctic: Kaliningrad's and Moscow's labels lay on the card and Vladivostok's on the
     zoom buttons. It opens on European Russia, and the stop's buttons turn east clock by clock (part 2) */
  "Russia: eleven clocks":S=>VIEW(S,[50,58,1.4])
};

FIX.words={
  /* Dagestan's label hung on a long leader across Georgia, far from its place, and the Tbilisi photo was pushed onto
     Azerbaijan: the label sits right above Dagestan, framed a little closer and further east */
  "The mountain of languages":S=>{ABOVE(S,/^Dagestan/);VIEW(S,[45.6,42.2,6.5])},
  /* the globe looked at the Pacific off Central America: San Francisco under the card, São Paulo, Rio and the Río de
     la Plata off the globe's bottom edge, though the stop is about Rio: framed on South America, and the stop's buttons
     turn the globe north to the Spanish names in the United States (part 2) */
  "Saints and rivers":S=>VIEW(S,[-52,-22,1.5])
};

FIX.learning={
  /* the 9.7 km ruler was a few pixels long, framed on all of Britain (the globe's frame was capped at a country's
     size): framed on central London, where the six-mile ring (part 2) fills the view, the ruler is its radius (north,
     clear of the cab photo below the pin); the Charing Cross label is put above its pin in geoflock-polish-rw5.js */
  "The Knowledge":S=>{LOCK(S,"gfRuler",{a:[-0.1246,51.5073],b:[-0.1246,51.5941]});VIEW(S,[-0.1,51.5,140])}
};

FIX.hgunpowder={
  /* Banda and the nutmeg photo were round the back of the globe, Cape Town at its bottom edge: framed on the route
     across the Indian Ocean, and the stop's buttons turn the globe to each place (part 2) */
  "The Dutch East India Company":S=>VIEW(S,[66,-16,1])
};


/* ---- (rw8, second pass) the tours the first pass did not reach: arts, sport, festivals, houses, capitals, food and
   the ocean, each stop looked at on the globe at 1280×860 ---- */
FIX.music={
  /* the Rio photo sat at the very bottom of the screen: framed a little further south */
  "Samba and bossa nova":S=>VIEW(S,[-12,-15,1.2]),
  /* Lagos, the stop's subject, sat at the globe's right edge and Accra in the middle: framed a little further east */
  "Afrobeats from Lagos":S=>VIEW(S,[1,7,3])
};
FIX.art={
  /* the stop is about the hand stencil on Muna, off Sulawesi, which was round the back of the globe (the opening frame
     looked at Arabia, with the Lascaux photo on the map's switches): it opens on Sulawesi, and the stop's buttons turn
     to Europe's painted caves (part 2) */
  "The first artists":S=>VIEW(S,[121,-3,2.2]),
  /* Benin City, the stop's subject, sat at the bottom of the screen: framed a little wider */
  "The Benin Bronzes":S=>VIEW(S,[3,22,1.25]),
  /* Edo and Mount Fuji were at the globe's top-right edge by the zoom buttons and Paris under the card: it opens on Japan,
     and the stop's buttons turn to Paris and Berlin (part 2) */
  "The Great Wave":S=>VIEW(S,[139,36,3])
};
FIX.sports={
  /* Johannesburg and Qatar, two of the hosts named, were round the back: the stop's buttons turn to them (part 2) */
  "World Cup hosts":S=>VIEW(S,[-78,30,1.3]),
  /* Koshien was round the back: the buttons turn to the Caribbean and Japan (part 2) */
  "Baseball’s map":S=>VIEW(S,[-68,28,1.4]),
  /* Ellis Park was round the back: the buttons turn to Johannesburg and to Rugby School (part 2) */
  "Rugby in the South Pacific and southern Africa":S=>VIEW(S,[170,-24,1.6]),
  /* the globe looked at the Sahara: the Silverstone photo sat on the map's switches at its top edge and Singapore,
     Suzuka and Melbourne were round the back. It opens on Silverstone and Monaco, and the buttons follow the season
     (part 2) */
  "Formula One":S=>VIEW(S,[5,47.5,2.8]),
  /* the Springfield photo sat at the globe's top-right edge by the zoom buttons and Tokyo was round the back: it opens
     on Massachusetts, and the buttons turn to the other birthplaces (part 2) */
  "Where sports were invented":S=>VIEW(S,[-72.6,42.6,3.2])
};
FIX.festivals={
  /* the Holi photo sat on the zoom buttons at the globe's edge and the New York one under the card: on this opening
     overview both go (each festival has its own stop later) */
  "Festivals and holidays":S=>{DROPPH(S,/^Holi in Barsana$/);DROPPH(S,/^Lunar New Year in New York$/)},
  /* Cologne and Venice were round the back: the stop's buttons turn to each Carnival (part 2) */
  "Carnival":S=>VIEW(S,[-60,8,1.05]),
  /* the Dhaka photo sat on the zoom buttons and Jakarta off the globe's edge: framed a little further east, and the
     buttons turn to Mecca, Dhaka and Jakarta (part 2) */
  "Ramadan and Eid":S=>VIEW(S,[99,16,1]),
  /* Sydney and Japan were round the back: the buttons turn to each Christmas (part 2) */
  "Christmas and Easter":S=>VIEW(S,[20,20,1]),
  /* Chiang Mai's label sat under the map key: framed a little further east */
  "New year in spring":S=>VIEW(S,[86,28,1.4]),
  /* the Munich photo sat on the zoom buttons: framed further east */
  "Oktoberfest and La Tomatina":S=>VIEW(S,[10,45,3]),
  /* the Sapporo photo and the Japan label sat on the map's switches and the search box at the globe's top edge, Harbin
     at its edge: it opens on Harbin, the stop's subject, and the buttons turn to Sweden and Shetland (part 2) */
  "Fire and ice in midwinter":S=>VIEW(S,[133,45,2.4])
};
FIX.ranges={
  /* the Gotthard and Ötzi labels sat under the map key at the globe's right edge: framed a little further east and wider */
  "The Alps":S=>VIEW(S,[12.5,46.1,5.2])
};
FIX.deserts={
  /* Australia's deserts and the Sonoran were round the back: the stop's buttons turn along both tropics (part 2) */
  "Deserts on the tropics":S=>VIEW(S,[16,4,1]),
  /* the labels of the Chilean coast, the steppe and the ice field ran under the map key: framed further east */
  "Behind the mountains":S=>VIEW(S,[-63,-47,2.6])
};
FIX.ice={
  /* the "Winter storms from the west" label hung on the card's edge, its pin far off under the card: the label sits
     on the storms' way in, at the Karakoram's western end */
  "The glaciers that aren’t shrinking":S=>{MOVE(S,/^Winter storms from the west/,[71.5,37]);VIEW(S,[79,36,6])},
  /* the photo of an iceberg off west Greenland sat on the map's switches at the globe's top edge: framed a little
     further north and wider */
  "Icebergs and the Titanic":S=>VIEW(S,[-48,58,1.75])
};
FIX.hwars={
  /* China, one of the five permanent members the stop lights up, was round the back: the stop's buttons turn to each
     (part 2) */
  "The United Nations":S=>VIEW(S,[-25,40,1])
};
FIX.hcoldwar={
  /* the stop names both superpowers, but the United States was round the back: the stop's buttons turn to it (part 2) */
  "Two superpowers":S=>VIEW(S,[45,45,1]),
  /* the Algiers label hung on a leader over the card's edge: it sits right above its place */
  "The Year of Africa":S=>{ABOVE(S,/^Algiers/);VIEW(S,[15,5,1.05])},
  /* a "United States" label hung over the year banner at the globe's top edge (the map names it) */
  "The space race":S=>{NOCOUNTRY(S,["United States"]);VIEW(S,[25,40,1])},
  /* Bandung, where the movement first met, was round the back: the stop's buttons turn to it (part 2) */
  "Neither East nor West":S=>VIEW(S,[40,15,1])
};
FIX.hsince91={
  /* the Northern Ireland label hung on a long leader to the globe's edge, under the map key: it sits right above its
     place */
  "Brexit":S=>ABOVE(S,/^Northern Ireland/)
};
FIX.hg4c={
  /* the Brussels photo sat against the map key at the globe's right edge: framed a little further east */
  "Empires, power and unions":S=>VIEW(S,[36,30,1.2])
};
FIX.houses={
  /* the Hong Kong photos sat at the globe's top-right edge by the zoom buttons: framed a little further east */
  "Cities of towers":S=>VIEW(S,[112,9,1.7])
};
FIX.capitals={
  /* the Sydney Harbour photo sat at the globe's right edge by the zoom buttons: drawn a little smaller */
  "Canberra, the compromise":S=>VIEW(S,[149.5,-35,3.3])
};
FIX.crops={
  /* Kansas lay under the card and the pampas round the back: the stop's buttons turn to each breadbasket (part 2) */
  "The world’s breadbaskets":S=>VIEW(S,[40,49,2]),
  /* the stop is about China, Brazil and the US, but the globe looked at Africa: China round the back, Mato Grosso under
     the card. It opens on northern China, and the buttons turn to Brazil and the Midwest (part 2) */
  "Soybeans from China":S=>VIEW(S,[118,36,2.2])
};
FIX.ocean={
  /* the Lost City photo sat on the zoom buttons at the globe's edge: it opens on the Galápagos Rift, and the buttons turn
     along the ridges (part 2) */
  "Life without sunlight":S=>VIEW(S,[-92,8,1.7])
};

const EARLY={};
const early=()=>{try{for(const t in EARLY){const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{const f=S&&EARLY[t][strip(S.title)];if(f)f(S)})}}catch(e){}};
early();setTimeout(early,1500);setTimeout(early,6000);addEventListener("load",()=>setTimeout(early,500));




/* Each stop's frame, by tour and title, read once from FIX at load (each fix run on a stand-in stop that has only its
   title), as geoflock-polish-rvt.js does: on a tour's very first launch index.html flies to the opening stop before the
   fixes are applied to it, so psGlobeTarget (wrapped above) finds the frame by title as well. */
const FRAMES={},SIDE={};
for(const t in FIX)for(const k in FIX[t]){try{const D={title:k};FIX[t][k](D);const v=VIEWED.get(D);if(v)FRAMES[t+"|"+k]=v;SIDE[t+"|"+k]=D.card||"left"}catch(e){}}
let OVR=null;
const viewOf=S=>{if(OVR)return OVR;const v=VIEWED.get(S);if(v)return v;try{return S&&ps&&ps.tour&&FRAMES[ps.tour+"|"+strip(S.title)]}catch(e){return null}};
const applied=new WeakSet();
/* a stop whose photo pins this file edits, and to which geoflock-portraits.js adds a portrait, waits until the portrait
   is in (see XF): if this file locked the field first, the portrait could not be added */
let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* (rw8) only the stops fixed here get their card side locked (the left, unless the fix's VIEW names the right): these tours' other stops keep their own side (some
    tours, like the seas tour, put the card on the right with the map key on the left, and their frames are made for it) */
 TOUR_OF.set(S,tour);const f=F[strip(S.title)];if(!f){applied.add(S);return}LOCK(S,"card",SIDE[tour+"|"+strip(S.title)]||"left");
 PEND=false;try{f(S)}catch(e){console.error("rw8 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}
 /* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when ps.tour changes */
 applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey&&!waiting)return;lastKey=k;waiting=false;
 /* and once more on the stop itself, in case another file re-set a field after the first pass */
 try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f){TOUR_OF.set(S,t);f(S)}}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins; the fixes go in when one
   of these tours opens). Only the card side is locked at load, so a tour's first stop already opens with its card on
   the left. */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S&&FIX[t][strip(S.title)])LOCK(S,"card",SIDE[t+"|"+strip(S.title)]||"left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvt.js and -rvu.js do for theirs): psFlyGlobe (index.html) turns a
   stop's place out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre
   whenever it is more than 20° from it. Here aim is told the stop is already aimed, and for eight seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more (counted in
   ticks of this check, not clock time: a tour's first launch can block the page for many seconds). A drag or zoom by
   the reader in that time cancels it. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=0;refl=0;touched=0}goAt++;ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe is left to it (also another review file's game: these tours' other stops
    carry buttons from geoflock-polish-rvl.js, -rvn.js, -rvu.js and others, which a re-aim here would undo) */
 if(document.querySelector('[data-turns]:not(.rw8-ctl),[data-turned],.gc3-ctl,.ge2-ctl'))return;
 if(document.querySelector(".rw8-ctl[data-turns]")){
  /* (rw8) a turn the game asked for can be cut off half way on a busy page (another file's flight takes over, as seen on
     the Culture map): if the globe has come to rest away from the place asked for, it turns there again, at most twice,
     unless the reader has dragged or zoomed the globe since */
  const T=TT;if(T&&T.key===key&&!touched&&!ps.g._flying&&T.tries<2&&Date.now()-T.at>2500){const c=[-ps.g.rot[0],-ps.g.rot[1]];
   if(d3.geoDistance(c,[T.to[0],T.to[1]])>.06){T.tries++;T.at=Date.now();turnGlobe(T.ll[0],T.ll[1],T.ll[2],1)}}return}
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw8){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw8=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw8-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw8-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw8-new");void e.offsetWidth;e.classList.add("rw8-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw8-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw8-rank"></ol><div class="rw8-pool"></div>'+
  '<div class="rw8-btns"><button type="button" class="rw8-btn rw8-undo">Undo</button><button type="button" class="rw8-btn rw8-show">Show me</button><button type="button" class="rw8-btn rw8-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw8-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw8-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw8-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw8-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw8-ok":"rw8-no"):"")+'"><span class="rw8-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw8-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw8-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw8-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw8-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw8-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw8-show").hidden=L.shown;c.querySelector(".rw8-again").hidden=!L.shown;
  if(!L.order.length)say(L,"","Tap the "+cfg.first.toLowerCase()+" first.");
  else if(!done)say(L,"",(N-L.order.length)+" to go. Next one?");
  else if(L.gave)say(L,"Here is the real order",cfg.after(-1,N));
  else say(L,right===N?"All "+N+" in the right place!":right+" of "+N+" in the right place",cfg.after(right,N))}};}


let TT=null;
function turnGlobe(lon,lat,z,again){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 /* (rw8) remembered, so the check above can finish a turn that was cut off */
 if(!again)TT={key:ps.tour+"|"+ps.i,ll:[lon,lat,z],to:[L0,lat],at:Date.now(),tries:0};else if(TT)TT.to=[L0,lat];
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.35;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}
/* a row of buttons, one per place; the stop opens on the first. places: [name, lon, lat, zoom, text] */
/* with cfg.mark, the place the globe has turned to gets a ringed dot and its name (the first place, an overview, none;
   a place given a 6th field already has the stop's own label, so it gets the ring only; a 6th field of 2: neither ring nor
   name, for an overview of a region) */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:true,tip:cfg.tip,
 card(L){return'<div class="rw8-btns rw8-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw8-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw8-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw8-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw8-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw8-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q&&f[5]!==2){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw8-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw8-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14);
  /* (rw8) a place may name its own towns, f[6] = [[lon, lat, name]], each a dot and a name tag once the globe is there */
  L.tgs=L.tgs||[];const T6=f[6]||[];T6.forEach((t,k)=>{if(!L.tgs[k])L.tgs[k]=tag(L,"rw8-ctag rw8-small");const p=proj(L,[t[0],t[1]]);if(p)svgEl(L.svg,"circle",{cx:p[0],cy:p[1],r:4.5,class:"rw8-tdot"});putTag(L,L.tgs[k],p,esc(t[2]),9)});
  for(let k=T6.length;k<L.tgs.length;k++)putTag(L,L.tgs[k],null)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw8-gq"><input type="range" class="rw8-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw8-gv"></b></div>'+
  '<div class="rw8-btns"><button type="button" class="rw8-btn rw8-chk">Check my guess</button><button type="button" class="rw8-btn rw8-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw8-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw8-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw8-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw8-rng");r.disabled=!!L.done;
  c.querySelector(".rw8-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw8-chk").hidden=!!L.done;c.querySelector(".rw8-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw8-q"><span class="rw8-n"></span><b class="rw8-item"></b></div><div class="rw8-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw8-btn rw8-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw8-btn rw8-next" hidden>Next →</button><button type="button" class="rw8-btn rw8-again" hidden>Start again</button></div><div class="rw8-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw8-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw8-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw8-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw8-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw8-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw8-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw8-good",L.wait&&i===it[1]);b.classList.toggle("rw8-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw8-next").hidden=!(L.wait&&!done);c.querySelector(".rw8-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw8-again").hidden=!done;
  c.querySelectorAll(".rw8-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw8-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw8-y":"rw8-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw8-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw8-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw8-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}




/* ---------------- a sorting game that rings each place it turns the globe to ----------------
   as SORT (above), each item's 5th field [lon, lat, zoom] the place a tap turns the globe to and its 6th field the name
   tagged there; the place of the last item tapped gets a ringed dot and its name */
function SORTM(cfg){const D=SORT(cfg);D.globe=true;const r0=D.render;
 D.render=function(L){r0.call(this,L);L.dirty=1};
 D.draw=function(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw8-ctag");const k=L.order&&L.order.length&&!L.gave?L.order[L.order.length-1]:null,it=k==null?null:cfg.items[k],
  q=it&&it[4]?proj(L,[it[4][0],it[4][1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw8-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw8-tdot"})}putTag(L,L.tg,q,esc(it&&it[5]||""),14)};
 return D}



/* ======================================================================== 1. Follow a Company ship (hgunpowder, The Dutch
   East India Company) The Cape and the Banda Islands are 111° of longitude apart, more than the globe shows beside the
   card: the stop opens on the route across the Indian Ocean and the buttons follow the ships. The texts are the card's
   own. */
const TURN_VOC=TURNER({tours:["hgunpowder"],title:"The Dutch East India Company",mark:true,
 tip:"Follow a Company ship from Amsterdam to the Spice Islands with the buttons.",
 places:[["The route",66,-16,1,"Round the Cape, east on the westerly winds of the ‘Roaring Forties’, then north for Java.",2],
  ["Amsterdam",4.9,52.37,2,"The VOC, founded in 1602, was the first company to sell shares to the public; its ships set out from the Netherlands."],
  ["Cape Town",18.42,-33.92,2.2,"From 1652 the Company’s halfway station. From here the ships sailed east in the strong westerly winds.",1],
  ["The Batavia wreck",113.8,-28.5,2.2,"Ships that turned north too late were wrecked on Australia’s west coast, like the Batavia in 1629.",1],
  ["Batavia",106.81,-6.13,2.4,"Batavia, today’s Jakarta, the Company’s base in Asia, from which it took over the spice trade.",1],
  ["The Banda Islands",129.9,-4.53,2.4,"In 1621 the VOC conquered the Banda Islands, the world’s only source of nutmeg, killing or enslaving most of their people.",1]]});

/* ======================================================================== 2. Inside the six miles? (learning, The Knowledge)
   The 9.7 km ruler was a few pixels long on the whole of Britain: the stop now opens close on central London with the
   six-mile ring round Charing Cross drawn (TfL: the Knowledge covers some 25,000 streets "within a six-mile radius of
   Charing Cross", tfl.gov.uk, Learn the Knowledge of London), and asks which places lie inside it. The distances are
   great-circle distances from the stop's Charing Cross pin to each place's coordinates on English Wikipedia (fetched
   2026-11): Buckingham Palace 1.2 km, Tower of London 3.6, Lord's 4.0, Emirates Stadium 5.5, Hampstead Heath 6.3,
   Canary Wharf 7.3, Royal Observatory Greenwich 8.5, Hampton Court Palace 18.6, Heathrow Airport 23.4; six miles is
   9.66 km. */
const KNOW_C=[-0.1246,51.5073],KNOW_R=9.656/6371.0088*180/Math.PI;
const KNOW=BINS({tours:["learning"],title:"The Knowledge",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"The ring is six miles from Charing Cross. Is each place inside it? Each answer turns the globe there.",ask:"Inside the six miles, or outside?",
 bins:["Inside","Outside"],
 items:[["The Tower of London",0,"About 3.6 km from Charing Cross.",[-0.0761,51.5081,150],"Tower of London"],
  ["Heathrow Airport",1,"About 23 km west, far outside the ring.",[-0.4614,51.4775,50],"Heathrow Airport"],
  ["Hampstead Heath",0,"About 6.3 km north of Charing Cross.",[-0.1608,51.5603,150],"Hampstead Heath"],
  ["The Royal Observatory, Greenwich",0,"About 8.5 km: just inside.",[-0.0147,51.477,150],"Greenwich"],
  ["Hampton Court Palace",1,"About 19 km up the Thames: outside.",[-0.3375,51.4033,60],"Hampton Court"],
  ["Canary Wharf",0,"About 7.3 km east, inside.",[-0.0225,51.505,150],"Canary Wharf"]],
 after:(r,N)=>"Every street inside the ring, about 25,000 of them, and the quickest way between any two: that is the Knowledge."});
/* the ring is always drawn (named below it while it is big enough); the place an answer turns to is ringed and named
   as in BINS */
{const d0=KNOW.draw;KNOW.draw=function(L){d0.call(this,L);try{const ring=d3.geoCircle().center(KNOW_C).radius(KNOW_R).precision(2)().coordinates[0];
 const d=pathOf(L,ring);if(d)L.svg.insertBefore(svgEl(L.svg,"path",{d,class:"rw8-kring"}),L.svg.firstChild);
 const q=proj(L,KNOW_C);if(q)svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:4,class:"rw8-tdot"});
 if(!L.rt)L.rt=tag(L,"rw8-ctag rw8-small");const bot=proj(L,[KNOW_C[0],KNOW_C[1]-KNOW_R]);putTag(L,L.rt,bot&&q&&bot[1]-q[1]>60?bot:null,"6 miles from Charing Cross",6)}catch(e){}};
 /* (the ring follows the globe as it turns) */const w0=KNOW.wire;KNOW.wire=function(L){w0.call(this,L);L.dirty=1}}

/* ======================================================================== 3. Saints north and south (words, Saints and
   rivers) The stop's names run from San Francisco to the Río de la Plata, 73° of latitude: it opens on South America
   and the buttons turn north. The texts are the card's own. */
const TURN_SAINTS=TURNER({tours:["words"],title:"Saints and rivers",mark:true,
 tip:"Turn the globe between the saints’ names of South and North America.",
 places:[["South America",-52,-22,1.5,"Rio de Janeiro, ‘River of January’: Portuguese sailors entered its bay on 1 January 1502 and took it for a river mouth.",2],
  ["North America",-114,35,2,"Los Angeles began as the town of ‘Our Lady, Queen of the Angels’. San and Santa names dot the southern United States too.",2]]});

/* ======================================================================== 4. Three mountains (geo, Everest isn’t the
   tallest mountain) The texts are the card's own. */
const TURN_PEAKS=TURNER({tours:["geo"],title:"Everest isn’t the tallest mountain",mark:true,
 tip:"Highest, tallest, farthest out: turn the globe to each mountain.",
 places:[["Everest",86.925,27.988,1.6,"Everest’s 8,849 m above sea level beats every other peak; K2, the runner-up, is 8,611 m.",1],
  ["Mauna Kea",-155.468,19.821,2.2,"Only about 4,207 m of it rises above the waves, but from its base on the Pacific floor it is over 10,000 m tall.",1],
  ["Chimborazo",-78.817,-1.469,2.2,"Almost on the equator, where Earth bulges, its summit is about 2 km farther from Earth’s centre than Everest’s, though it is only 6,263 m above the sea.",1]]});

/* ======================================================================== 5. France round the world (geo, France: the most
   time zones) Each place's standard time is its zone in the IANA time zone database (Europe/Paris, America/Martinique,
   America/Cayenne, Indian/Reunion, Indian/Kerguelen, Pacific/Noumea, Pacific/Tahiti). */
const TURN_FRANCE=TURNER({tours:["geo"],title:"France: the most time zones",mark:true,
 tip:"Turn the globe to France’s lands around the world.",
 places:[["The Atlantic",-20,12,1,"Metropolitan France, the Caribbean islands and French Guiana face each other across the Atlantic.",2],
  ["Metropolitan France",2.35,46.6,2.4,"Paris keeps UTC+1 in winter.",1],
  ["The Caribbean islands",-61.3,15.6,2.4,"Guadeloupe and Martinique: UTC−4, five hours behind Paris in winter.",1],
  ["French Guiana",-53,4,2.4,"In South America: UTC−3.",1],
  ["Réunion",55.5,-21.1,2.4,"In the Indian Ocean: UTC+4.",1],
  ["Kerguelen",69.4,-49.3,2.4,"Far south in the Indian Ocean: UTC+5.",1],
  ["New Caledonia",165.5,-21.3,2.4,"In the South Pacific: UTC+11.",1],
  ["French Polynesia",-149.5,-17.6,2.4,"Tahiti keeps UTC−10, eleven hours behind Paris in winter.",1]]});

/* ======================================================================== 6. Along the line (geo, The longest straight
   line at sea) The texts are the card's own. */
const TURN_LINE=TURNER({tours:["geo"],title:"The longest straight line at sea",mark:true,
 tip:"Follow the line round the world with the buttons.",
 places:[["The start",58,-4,1.25,"The line leaves Sonmiani, in Pakistan, and heads south-west.",2],
  ["Madagascar",42,-16.5,1.8,"It slips between Africa and Madagascar.",1],
  ["The Drake Passage",-63,-58.5,1.6,"It squeezes between South America and Antarctica.",1],
  ["The Pacific",-125,-5,1.1,"Then it crosses the whole Pacific.",2],
  ["Kamchatka",163,59.1,1.8,"It ends on the coast of Kamchatka, in Russia.",1]]});

/* ======================================================================== 7. Round the rain belt (climate, The rain belt)
   The texts are the card's own. */
const TURN_RAIN=TURNER({tours:["climate"],title:"The rain belt",mark:true,
 tip:"Turn the globe along the rain belt to the three great rainforests.",
 places:[["The Amazon",-61,-4,1.6,"The Amazon holds the biggest of the rainforests that sit along the equator.",1],
  ["The Congo basin",21,-0.5,1.6,"Africa’s rainforest. Many places in the rain belt get over 2,000 mm of rain a year.",1],
  ["Indonesia and New Guinea",118,-2,1.4,"The islands of Indonesia and New Guinea hold the third great block of tropical rainforest.",1]]});

/* ======================================================================== 8. The two records (climate, The hottest and
   coldest ever recorded) The texts are the card's own. */
const TURN_RECORDS=TURNER({tours:["climate"],title:"The hottest and coldest ever recorded",mark:true,
 tip:"Turn the globe from the hottest record to the coldest.",
 places:[["Death Valley",-116.87,36.46,2,"A deep, narrow basin below sea level, ringed by mountains: hot air gets trapped and keeps heating. 56.7 °C in 1913.",1],
  ["Vostok station",106.84,-78.46,1.8,"3,500 m up on the East Antarctic Ice Sheet, in months of polar night: −89.2 °C in 1983.",1]]});

/* ======================================================================== 9. Four volcanoes (plates, Why some volcanoes
   explode) The kinds of magma are the stop's own labels; the texts are the card's own. */
const TURN_VOLC=TURNER({tours:["plates"],title:"Why some volcanoes explode",mark:true,
 tip:"From runny to stiff: turn the globe to each volcano.",
 places:[["Kīlauea",-155.29,19.41,2.4,"Runny basalt lets gas bubble out, so Hawaii’s volcanoes ooze lava. Volcanoes over hotspots tend to erupt basalt.",1],
  ["Soufrière Hills",-62.18,16.72,2.4,"Andesite, richer in silica: where one plate dives under another, water from the sinking plate melts rock richer in silica.",1],
  ["Mount St Helens",-122.18,46.2,2.4,"On the Ring of Fire, which has the most explosive volcanoes: stiff magma traps the gas until it blasts free, as here in 1980.",1],
  ["Chaitén",-72.65,-42.83,2.4,"Rhyolite, the most silica-rich of the four magmas here, and the stiffest.",1]]});

/* ======================================================================== 10. The Lebanese abroad (migration, Lebanon’s
   global family) The texts are the card's own. */
const TURN_LEB=TURNER({tours:["migration"],title:"Lebanon’s global family",mark:true,
 tip:"Turn the globe to Lebanese communities around the world.",
 places:[["Beirut",35.5,33.9,2.2,"Lebanese have emigrated since the 1800s, escaping hunger, war and a lack of jobs, and trading all over the world.",1],
  ["Abidjan",-4.02,5.35,2.2,"Lebanese traders settled across West Africa, from Senegal to Ivory Coast.",1],
  ["São Paulo",-46.63,-23.55,2,"Brazil says it has millions of people of Lebanese descent, though estimates vary widely. Michel Temer, its president from 2016 to 2018, is the son of Lebanese parents.",1],
  ["Mexico City",-99.13,19.43,2,"Carlos Slim, one of the world’s richest men, was born in Mexico to a Lebanese father.",1],
  ["Sydney",151.2,-33.87,2,"Lebanese also settled in Australia, Canada and the US.",1]]});

/* ======================================================================== 11. Three countries of newcomers (migration,
   Built by newcomers) The texts are the card's own. */
const TURN_NEW=TURNER({tours:["migration"],title:"Built by newcomers",mark:true,
 tip:"Turn the globe between the countries in the stop.",
 places:[["Australia",140,-30,1.5,"About three in ten Australians were born abroad; the biggest groups were born in England, India and China.",2],
  ["New Zealand",174.76,-36.85,2.4,"New Zealand also has nearly three in ten people born overseas.",1],
  ["Canada",-100,50,1.4,"About a quarter of Canadians were born abroad, and nearly half of Toronto’s people. Canada invented the points system in 1967.",2]]});

/* ======================================================================== 12. Two plagues (hazards, Plagues of locusts)
   The texts are the card's own. */
const TURN_LOC=TURNER({tours:["hazards"],title:"Plagues of locusts",mark:true,
 tip:"Turn the globe to two great locust plagues.",
 places:[["The Sahel",14,12,1.4,"After good rains, desert locusts crowd together, change colour and form swarms of up to 80 million per km².",2],
  ["East Africa",38,1,2.2,"In 2019–21, swarms in East Africa were the worst Kenya had seen in 70 years.",1],
  ["The Caribbean",-61,13.5,1.8,"In 1988 swarms flew across the Atlantic from West Africa to the Caribbean, about 5,000 km, in roughly ten days.",1]]});

/* ======================================================================== 13. Three journeys (animals, Great journeys)
   The texts are the card's own. */
const TURN_MIG=TURNER({tours:["animals"],title:"Great journeys",mark:true,
 tip:"Follow three great journeys with the buttons.",
 places:[["The Serengeti",35.03,-1.55,1.8,"About two million wildebeest, zebras and gazelles walk a loop of about 800 km following the rains.",1],
  ["Michoacán",-100.3,19.6,2,"Monarch butterflies fly up to about 4,000 km to a few fir-covered mountains in Mexico.",1],
  ["The Arctic",-20,74,1.5,"The Arctic tern flies about 70,000 km a year, chasing summer at both ends of the Earth: it nests in the far north…",1],
  ["Off Antarctica",5,-66,1.5,"…and spends the southern summer off Antarctica.",1]]});

/* ======================================================================== 14. Three striped flags (flags, Stars and
   stripes) The texts are the card's own. */
const TURN_STRIPES=TURNER({tours:["flags"],title:"Stars and stripes",mark:true,
 tip:"Turn the globe to the three flags.",
 places:[["The Atlantic",-28,20,1.1,"The US flag has 13 stripes for the original colonies and 50 stars for today’s states.",2],
  ["Liberia",-10.8,6.3,2.4,"Founded from 1822 by free Black Americans; its flag has eleven red and white stripes and one star.",1],
  ["Malaysia",102,4,2.2,"Malaysia’s flag has 14 stripes and a crescent."]]});

/* ======================================================================== 15. Not four-sided, not oblong (flags, Not a
   rectangle) The texts are the card's own. */
const TURN_SQUARE=TURNER({tours:["flags"],title:"Not a rectangle",mark:true,
 tip:"Turn the globe from the one flag that isn’t four-sided to the two square ones.",
 places:[["Nepal",84,28.4,2.2,"Nepal is the only country whose flag isn’t four-sided: two triangles, one on top of the other.",1],
  ["Switzerland",8.2,46.8,3,"Two flags are square instead of rectangular: Switzerland’s…"],
  ["Vatican City",12.45,41.9,3.4,"…and Vatican City’s."]]});

/* ======================================================================== 16. Punjab and beyond (langrel, Sikhism’s
   Punjab) The texts are the card's own. */
const TURN_SIKH8=TURNER({tours:["langrel"],title:"Sikhism’s Punjab",mark:true,
 tip:"Turn the globe from Punjab to two big Sikh communities abroad.",
 places:[["Amritsar",74.88,31.62,2.2,"The Golden Temple is the holiest place; its free kitchen, the langar, feeds tens of thousands of visitors a day, whatever their faith.",1],
  ["Southall, London",-0.38,51.51,2.6,"Many Sikhs moved to Britain.",1],
  ["Brampton, near Toronto",-79.8,43.7,2.4,"Canada’s 2021 census counted about 770,000 Sikhs, the second-largest community after India: about 2.1% of Canadians.",1]]});

/* ======================================================================== 17. The two giants (gdp, Two giants) and China
   and Italy (gdp, China’s rise) The texts are the cards' own. */
const TURN_GIANTS=TURNER({tours:["gdp"],title:"Two giants",mark:true,
 tip:"Turn the globe between the two giants.",
 places:[["The United States",-95,38,1.4,"The US makes about a quarter of the world’s output.",1],
  ["China",105,33,1.4,"China makes about a sixth.",1]]});
const TURN_RISE=TURNER({tours:["gdp"],title:"China’s rise",mark:true,
 tip:"Turn the globe between China and Italy.",
 places:[["China",105,33,1.6,"For about 30 years China grew by nearly 10% a year.",1],
  ["Italy",12.5,42.5,2.4,"In 1990 Italy’s economy was bigger than China’s.",1]]});

/* ======================================================================== 18. Enclaved (borders, Countries inside
   countries) The texts are the card's own. */
const TURN_ENCL=TURNER({tours:["borders"],title:"Countries inside countries",mark:true,
 tip:"Turn the globe to the three countries surrounded by one other.",
 places:[["Italy",12.5,42.5,3,"Vatican City and San Marino are surrounded by Italy.",2],
  ["Lesotho",28.2,-29.6,3,"Lesotho is surrounded by South Africa.",1]]});

/* ======================================================================== 19. Across Russia (time, Russia: eleven clocks)
   The zones are the stop's own labels; the texts are the card's own. */
const TURN_RUSSIA=TURNER({tours:["time"],title:"Russia: eleven clocks",mark:true,
 tip:"Cross Russia clock by clock with the buttons.",
 places:[["Kaliningrad",20.51,54.71,2.2,"UTC+2. When it is 9 a.m. here on the Baltic Sea…",1],
  ["Moscow",37.62,55.75,2.2,"UTC+3. Until 2018 all Russia’s trains ran on Moscow time.",1],
  ["Novosibirsk",82.92,55.03,2,"UTC+7.",1],
  ["Vladivostok",131.89,43.12,2.2,"UTC+10: a train ticket bought here once showed a time seven hours off.",1],
  ["Kamchatka",158.65,53.02,2.2,"UTC+12. …it is already 7 p.m. here on the Pacific.",1]]});

/*@@DEFS@@*/

const DEFS=[TURN_VOC,KNOW,TURN_SAINTS,TURN_PEAKS,TURN_FRANCE,TURN_LINE,TURN_RAIN,TURN_RECORDS,TURN_VOLC,TURN_LEB,TURN_NEW,TURN_LOC,TURN_MIG,TURN_STRIPES,TURN_SQUARE,TURN_SIKH8,TURN_GIANTS,TURN_RISE,TURN_ENCL,TURN_RUSSIA];



/* ======================================================================== (second pass) buttons that turn the globe to
   far places. The texts are the cards' own, unless a source is named. */
const TURN_CAVEART=TURNER({tours:["art"],title:"The first artists",mark:true,
 tip:"Turn the globe from the oldest cave art to Europe’s painted caves.",
 places:[["Muna, Sulawesi",122.7,-4.9,2.2,"Someone pressed a hand against a cave wall and blew red pigment over it, at least 67,800 years ago: the oldest dated cave art yet found."],
  ["Lascaux and Chauvet, France",3,44.7,4.2,"Lascaux is painted with about 600 animals, made some 17,000 years ago; Chauvet’s lions and rhinos are around 36,000 years old.",1]]});
const TURN_WAVE=TURNER({tours:["art"],title:"The Great Wave",mark:true,
 tip:"Follow the Great Wave from Edo to Paris, and its blue back to Berlin.",
 places:[["Edo (Tokyo)",139.77,35.68,3,"Hokusai, then about 70, made The Great Wave around 1831 for his Thirty-six Views of Mount Fuji.",1],
  ["Paris",2.35,48.86,3,"When Japan opened to trade in the 1850s, prints reached Paris, about 9,700 km away, and inspired Monet, Degas and Van Gogh.",1],
  ["Berlin",13.4,52.52,3,"The wave’s deep blue is Prussian blue, a pigment made in Berlin around 1706: a European blue that came back to Europe in a Japanese print."]]});
const TURN_WCUP=TURNER({tours:["sports"],title:"World Cup hosts",mark:true,
 tip:"Turn the globe to the World Cups held far from here.",
 places:[["North America, 2026",-78,30,1.3,"The United States, Canada and Mexico hosted 104 matches in 16 cities; the final was at MetLife Stadium, near New York, on 19 July 2026.",2],
  ["Rio de Janeiro, 1950",-43.23,-22.91,2.6,"About 200,000 people crammed into Rio’s Maracanã for the deciding match of 1950, when Uruguay stunned Brazil."],
  ["Johannesburg, 2010",28,-26.2,2.6,"Africa’s first World Cup.",1],
  ["Qatar, 2022",51.5,25.3,2.8,"The first World Cup held in the Arab world.",1],
  ["Spain, Portugal and Morocco, 2030",-5,37,2.2,"The 2030 World Cup, 100 years after the first, will be shared by three countries on two continents.",2]]});
const TURN_BASEBALL=TURNER({tours:["sports"],title:"Baseball’s map",mark:true,
 tip:"Turn the globe to baseball’s other homes.",
 places:[["The United States",-68,28,1.4,"Baseball spread with American sailors, soldiers and teachers from the 1870s.",2],
  ["San Pedro de Macorís",-69.3,18.46,3.2,"About one in ten Major League players comes from the Dominican Republic, and this town alone has produced dozens.",1],
  ["Koshien, Japan",135.36,34.72,3,"Japan won three of the first five World Baseball Classics, and its high-school tournament at Koshien Stadium fills the stands every summer.",1]]});
const TURN_RUGBY=TURNER({tours:["sports"],title:"Rugby in the South Pacific and southern Africa",mark:true,
 tip:"Turn the globe from the Pacific to South Africa and to where the game began.",
 places:[["The South Pacific",170,-24,1.6,"In New Zealand, Fiji, Samoa and Tonga rugby is the national game.",2],
  ["Johannesburg",28.06,-26.2,2.8,"In 1995 Nelson Mandela, in a Springbok shirt, handed the World Cup to South Africa’s captain at Ellis Park.",1],
  ["Rugby, England",-1.26,52.37,3.2,"Rugby began at Rugby School in England in the 1800s and spread through the British Empire."]]});
const TURN_F1=TURNER({tours:["sports"],title:"Formula One",mark:true,
 tip:"Follow the Formula One season round the world.",
 places:[["Silverstone and Monaco",5,47.5,2.8,"The first World Championship race was at Silverstone on 13 May 1950; Monaco’s street race was first run in 1929.",2],
  ["Singapore",103.86,1.29,3,"The first night race, 2008.",1],
  ["Melbourne",144.97,-37.85,3,"Formula One now races about two dozen Grands Prix a year on five continents, from Melbourne…",1],
  ["Las Vegas",-115.17,36.11,3,"…to Las Vegas."],
  ["Kyalami, South Africa",28.08,-26,3,"Africa has had no Grand Prix since South Africa’s at Kyalami in 1993.",1]]});
const TURN_INVENT=TURNER({tours:["sports"],title:"Where sports were invented",mark:true,
 tip:"Turn the globe to the birthplaces of four more sports.",
 places:[["Springfield and Holyoke",-72.6,42.6,3.2,"Basketball (Springfield, 1891) and volleyball (Holyoke, 1895) were invented just 12 km apart.",2],
  ["Montreal",-73.57,45.5,3.2,"The first organised indoor ice hockey game was played in Montreal on 3 March 1875.",1],
  ["Wimbledon",-0.21,51.43,3.4,"Lawn tennis held its first championship at Wimbledon in 1877.",1],
  ["Tokyo",139.7,35.7,3,"Judo was created in Tokyo in 1882 by Kanō Jigorō; it joined the Olympics at Tokyo in 1964.",1]]});
const TURN_CARNIVAL=TURNER({tours:["festivals"],title:"Carnival",mark:true,
 tip:"Turn the globe from Carnival to Carnival.",
 places:[["The Americas",-60,8,1.05,"Carnival is the feast before Lent, so its date moves with Easter; in 2026 it peaked in mid-February.",2],
  ["Rio de Janeiro",-43.2,-22.91,2.8,"Rio’s samba schools spend all year on floats, costumes and songs for their parade through the Sambadrome."],
  ["Port of Spain",-61.51,10.65,3,"Trinidad’s Carnival grew from the celebrations of freed Africans after slavery ended, and gave the world the steelpan.",1],
  ["Venice",12.34,45.43,3.4,"Venice is famous for its masks, worn since the Middle Ages.",1],
  ["Cologne",6.96,50.94,3.4,"In Germany’s Rhineland, Carnival is the ‘fifth season’ of the year.",1]]});
const TURN_EID=TURNER({tours:["festivals"],title:"Ramadan and Eid",mark:true,
 tip:"Turn the globe to Ramadan from Mecca to Jakarta.",
 places:[["From Morocco to Indonesia",99,16,1,"Ramadan begins when the new crescent moon is seen; each evening families break the fast together with a meal called iftar.",2],
  ["Mecca",39.83,21.42,3,"Eid al-Adha, about ten weeks after Ramadan, falls during the Hajj, the pilgrimage to Mecca.",1],
  ["Dhaka",90.41,23.81,3,"The month ends with Eid al-Fitr, a festival of prayers, new clothes, visits and sweets.",1],
  ["Jakarta",106.83,-6.17,2.8,"Indonesia has more Muslims than any other country; Jakarta’s Istiqlal is South-East Asia’s biggest mosque.",1]]});
const TURN_XMAS=TURNER({tours:["festivals"],title:"Christmas and Easter",mark:true,
 tip:"Turn the globe to four very different Christmases.",
 places:[["Noon in London, 25 December",20,20,1,"The far north stays dark all day, while Antarctica, in midsummer, has daylight round the clock.",2],
  ["Bethlehem",35.2,31.7,3.4,"Christians, about a third of the world’s people, celebrate the birth of Jesus on 25 December.",1],
  ["Lalibela, Ethiopia",39.04,12.03,3.4,"Many Orthodox churches follow the older Julian calendar, now 13 days behind, so their Christmas falls on 7 January.",1],
  ["Sydney",151.27,-33.89,2.8,"Christmas comes in midsummer in Australia.",1],
  ["Japan",139.7,35.7,2.8,"In Japan a fried-chicken dinner is a popular Christmas tradition.",1]]});
const TURN_ICE=TURNER({tours:["festivals"],title:"Fire and ice in midwinter",mark:true,
 tip:"Turn the globe from Harbin’s ice city to Europe’s midwinter fire and ice.",
 places:[["Harbin",133,45,2.4,"In Harbin, in north-east China, January nights average about −24 °C. Since 1985 its Ice and Snow Festival has turned river ice into castles, slides and towers.",1],
  ["Jukkasjärvi, Sweden",20.62,67.85,3,"Sweden’s Icehotel builds new rooms from the ice of the Torne River every winter, and they melt away every spring.",1],
  ["Lerwick, Shetland",-1.15,60.15,3.4,"On the last Tuesday of January, about 1,000 torch-carrying ‘guizers’ drag a replica Viking longship through the streets and set it on fire.",1]]});
const TURN_WHEAT=TURNER({tours:["crops"],title:"The world’s breadbaskets",mark:true,
 tip:"Turn the globe to each of the world’s breadbaskets.",
 places:[["Ukraine and Russia",40,49,2,"The steppes of Ukraine and Russia: Russia sells more wheat abroad than any other country.",2],
  ["The North American prairies",-98.5,42,2,"The prairies of the US and Canada, with their deep, dark soils.",2],
  ["The Argentine pampas",-61,-35,2.4,"The pampas, Argentina’s old grasslands.",1],
  ["Australia’s wheat belt",117.5,-31.5,2.4,"Part of Australia’s wheat belt, in Western Australia."],
  ["China and India",95,31,1.6,"China and India grow even more wheat than Russia.",2]]});
const TURN_SOY=TURNER({tours:["crops"],title:"Soybeans from China",mark:true,
 tip:"Turn the globe from soy’s homeland to where most of it grows now.",
 places:[["Northern China",118,36,2.2,"Soy was tamed in northern China several thousand years ago and became tofu, soy sauce and miso.",1],
  ["Mato Grosso, Brazil",-55.5,-13,2.4,"In the last 50 years soy has boomed in Brazil; its fields have spread into the Cerrado savanna and the edge of the Amazon.",1],
  ["The American Midwest",-92,41,2.4,"The US is the other giant grower; China buys most of the soy that is traded."]]});
const TURN_VENTS=TURNER({tours:["ocean"],title:"Life without sunlight",mark:true,
 tip:"Turn the globe along the ridges to three vent fields.",
 places:[["Galápagos Rift",-86.1,0.8,2.4,"In 1977 scientists in the submersible Alvin found animals thriving around hot springs 2,500 m down.",1],
  ["East Pacific Rise",-109,21,2.4,"Black ‘smokers’ build chimneys of metal sulphides as tall as houses.",1],
  ["Lost City, mid-Atlantic",-42.1,30.1,2.4,"Vents form along the mid-ocean ridges, where plates pull apart.",1]]});
DEFS.push(TURN_CAVEART,TURN_WAVE,TURN_WCUP,TURN_BASEBALL,TURN_RUGBY,TURN_F1,TURN_INVENT,TURN_CARNIVAL,TURN_EID,TURN_XMAS,TURN_ICE,TURN_WHEAT,TURN_SOY,TURN_VENTS);

const TURN_TROPICS=TURNER({tours:["deserts"],title:"Deserts on the tropics",mark:true,
 tip:"Turn the globe along the two tropics to the deserts round the back.",
 places:[["Africa and Arabia",16,4,1,"That belt holds the Sahara, Arabia and the Kalahari.",2],
  ["Australia’s deserts",128,-25,1.8,"Australia is the driest inhabited continent: about 70% of it is desert or dry scrub, and most Australians live along the wetter coasts.",1],
  ["The Sonoran Desert",-112,30,2.2,"The great hot deserts sit around the Tropics of Cancer and Capricorn, roughly 20° to 30° from the equator: in North America too.",1]]});
DEFS.push(TURN_TROPICS);

/* the permanent members' seats: China's passed from the Republic of China to the People's Republic in 1971 (UN General
   Assembly resolution 2758), the Soviet Union's to Russia in December 1991 (Wikipedia, "United Nations Security
   Council") */
const TURN_P5=TURNER({tours:["hwars"],title:"The United Nations",mark:true,
 tip:"Turn the globe to the five permanent members of the Security Council.",
 places:[["The Atlantic",-25,40,1,"Five winners of the war became permanent members of the Security Council, each with a veto.",2],
  ["The United States",-98,39,1.5,"The UN’s headquarters are in New York, and its Charter was signed in San Francisco in June 1945.",2],
  ["Britain and France",-1,50,2.6,"Britain and France, two of the five permanent members.",2],
  ["The Soviet Union",60,56,1.3,"The Soviet Union’s seat passed to Russia in December 1991.",2],
  ["China",105,34,1.5,"China’s seat was held by the government in Taipei until 1971, when it passed to Beijing.",2]]});
const TURN_SUPER=TURNER({tours:["hcoldwar"],title:"Two superpowers",mark:true,
 tip:"Turn the globe between the two superpowers.",
 places:[["The Soviet Union",45,45,1,"The Soviet Union and its allies in Eastern Europe.",2],
  ["The United States",-98,39,1.4,"They never fought each other directly, so the long stand-off was called the Cold War.",2]]});
const TURN_NAM=TURNER({tours:["hcoldwar"],title:"Neither East nor West",mark:true,
 tip:"Turn the globe from Belgrade to Bandung, where the new countries first met.",
 places:[["The non-aligned world",40,15,1,"Many new countries did not want to pick a side in the Cold War.",2],
  ["Belgrade, 1961",20.46,44.82,2.6,"25 countries met in Belgrade in 1961 to found the Non-Aligned Movement.",1],
  ["Bandung, 1955",107.61,-6.92,2.6,"Six years earlier, the new countries of Asia and Africa had met at Bandung, in Indonesia.",1]]});
DEFS.push(TURN_P5,TURN_SUPER,TURN_NAM);


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw8-layer rw8-layer";el.innerHTML='<svg class="rw8-sv"><defs><clipPath id="rw8Disc"><path class="rw8-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw8Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw8-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw8-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw8-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw8-ctl";
 c.innerHTML='<div class="rw8-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw8-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);showCtl(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty||L.anim){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw8-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});
/* the card scrolls: bring the new controls into view (the headline stays just above them), as geoflock-polish-rvi.js does */
let scrolled=null;
function showCtl(c){setTimeout(()=>{try{let sc=c.parentElement;while(sc&&sc!==document.body){const o=getComputedStyle(sc).overflowY;if(/auto|scroll/.test(o)&&sc.scrollHeight>sc.clientHeight+4)break;sc=sc.parentElement}
 if(!sc||sc===document.body)return;const r=c.getBoundingClientRect(),b=sc.getBoundingClientRect();if(r.bottom>b.bottom){scrolled=sc;sc.scrollTop+=Math.min(r.top-b.top-70,r.bottom-b.bottom+8)}}catch(e){}},900)}


{const s=document.createElement("style");s.textContent=`
.rw8-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw8-sv{position:absolute;left:0;top:0;overflow:visible}
.rw8-kring{fill:rgba(242,179,61,.10);stroke:#d9682b;stroke-width:3;stroke-dasharray:8 5}
.rw8-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw8-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw8-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw8-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw8-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw8-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw8-btn[hidden]{display:none}
.rw8-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw8-ep b{display:block;font-size:15px}
.rw8-ep.rw8-new{animation:rw8In .45s ease}@keyframes rw8In{from{opacity:.2;transform:translateY(4px)}}
.rw8-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw8-sortq i{font-style:normal}
.rw8-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw8}
.rw8-rank li{position:relative;counter-increment:rw8;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw8-rank li::before{content:counter(rw8);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw8-rank li.rw8-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw8-rank li.rw8-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw8-nm{flex:1 1 auto;z-index:1}.rw8-v{z-index:1;font-weight:800;white-space:nowrap}
.rw8-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw8-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw8-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw8-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw8-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw8-do,:is(body.dark-theme,body.sky-night) .rw8-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw8-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw8-btn,:is(body.dark-theme,body.sky-night) .rw8-chip,:is(body.dark-theme,body.sky-night) .rw8-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw8-rank li.rw8-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw8-rank li.rw8-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw8-bar{background:rgba(255,178,122,.2)}
.rw8-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw8-rng{flex:1 1 auto;accent-color:#d9682b}.rw8-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw8-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw8-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw8-item{font-size:16px;color:#13294b}
.rw8-bins{display:flex;gap:6px;flex-wrap:wrap}.rw8-bins .rw8-btn[hidden]{display:none}.rw8-bin:disabled{cursor:default;opacity:.55}
.rw8-btn.rw8-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw8-btn.rw8-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw8-dots{display:flex;gap:4px;margin-top:8px}.rw8-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw8-dots i.rw8-now{box-shadow:0 0 0 2px #d9682b inset}.rw8-dots i.rw8-y{background:#1f8a4c}.rw8-dots i.rw8-x{background:#c2364f}
.rw8-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw8-sl .rw8-row{margin-top:2px}.rw8-sl .rw8-val{min-width:36px}
.rw8-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw8-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw8-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw8-out b{font-size:15px;color:#9a4a16}
.rw8-ch{display:block;width:100%;height:auto;margin-top:6px}.rw8-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw8-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw8-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw8-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw8-val,:is(body.dark-theme,body.sky-night) .rw8-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw8-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw8-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw8-n,:is(body.dark-theme,body.sky-night) .rw8-sl label,:is(body.dark-theme,body.sky-night) .rw8-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw8-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw8-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw8-dots i{background:rgba(255,255,255,.18)}
.rw8-btn.rw8-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw8-btn.rw8-cur{background:#9fc3ff;color:#13294b}
.rw8-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw8-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw8-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw8-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw8-ep b .rw8-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw8-ep b .rw8-km{color:#ffb27a}
.rw8-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw8-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw8-small{font-size:11.5px!important;padding:2px 7px!important}
.rw8-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw8-gq .rw8-rng{flex:1 1 auto}.rw8-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw8-julh{fill:#c2364f}.rw8-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw8-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw8-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw8-gv{color:#ffb27a}
.rw8-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw8-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw8-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw8-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw8-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw8-clk{font-size:18px}.rw8-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw8-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw8-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw8-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw8-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw8-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw8-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw8-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw8-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw8-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw8-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw8-pig{color:#1f8a4c}
.rw8-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw8-mlg line,.rw8-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw8-mlg .rw8-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw8-mlg line,:is(body.dark-theme,body.sky-night) .rw8-mlg path,:is(body.dark-theme,body.sky-night) .rw8-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw8-mlg .rw8-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw8-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw8-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw8-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw8-pig{color:#4cc27f}
.rw8-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw8-kbw{fill:#7fb3e0}
.rw8-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw8-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw8-kbb.rw8-kbok{stroke:#f2b33d}.rw8-kbb.rw8-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw8-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw8-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw8-ctl .rw8-btn.rw8-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw8-ctl .rw8-btn.rw8-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw8-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw8={v:1,FIX,XFS,viewOf,tours:MYT,tryView(v){OVR=v||null},L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();