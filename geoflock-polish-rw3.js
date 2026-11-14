/* GeoFlock polish RW-3: a stop-by-stop review of four Books tours, Around the World in Eighty Days (b80days), Plagues and
   Peoples (bplagues), A History of the World in Twelve Maps (b12maps) and One Thousand and
   One Nights (b1001), each looked at on its default map at
   1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rw2.js and -rw1.js (their helpers and engine, under "rw3" names so the files never touch each
   other's controls): frames looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here gets exactly
   its frame; fixed fields are non-configurable getters whose setters are ignored (a field already non-configurable is
   left alone). Pin lists are filtered through getters, photo pins wait for geoflock-portraits.js's portraits, and a stop
   whose photos are dropped gets its photo squares rebuilt. CSS classes start with "rw3-". Everything is wrapped in
   try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRw3)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw3Test or ?rw3test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw3Test||/[?&]rw3test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rw3Test||/[?&]rw3test\b/.test(location.search)),enumerable:true,
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw3)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw3,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw3=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);


const FIX={};
/* take a portrait (added by geoflock-portraits.js) off a stop */
const NOPPL=(S,name)=>{const L=NOP.get(S)||[];if(!L.includes(name))L.push(name);NOP.set(S,L);DROPPH(S,new RegExp("^"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"))};


/* the stop's shaded countries go (see "Attack on the plains") */
const NOSHADE=S=>{LOCK(S,"hi",[]);LOCK(S,"hiSoft",[])};
FIX.b80days={
  /* framed on Europe to India, as the stop's first button (the buttons turn the globe round the rest of the route); a
     "New York" label hung at the globe's top edge over the map's switches, the Hong Kong harbour photo lay on the zoom
     buttons and the Gateway of India's at the globe's edge by the map key (each has a stop of its own). Bombay and Calcutta,
     whatever the frame, lay under the map key with London in sight, and New York's and San Francisco's (with the last
     spike's photo), at the globe's far edge under the card, were pushed up over the map's switches: they go, and the
     stop's buttons name them as the globe turns to them */
  "Around the World in Eighty Days":S=>{DROPPH(S,/^(Hong Kong harbour|The Gateway of India)/);DROP(S,/^(Bombay|Calcutta|New York|San Francisco)$/);DROPPH(S,/^The last spike/);VIEW(S,[32,38,1.05])},
  /* the three London places, a few streets apart, lay on one spot with their labels pushed out on long leaders, Charing
     Cross's under the map key: one label is kept (the card names Savile Row and Charing Cross), and London is framed
     clear of the key; a "United Kingdom" label on a long leader goes (geoflock-sweep-tours4.js's drop no longer held) */
  "The wager at the Reform Club":S=>{DROP(S,/^(Savile Row|Charing Cross|United Kingdom$)/);VIEW(S,[1.2,52.6,7])},
  /* the Alps photo was pushed far south of the Alps, out over the sea (the card shows Mont Blanc) */
  "Through the Alps to Brindisi":S=>{DROPPH(S,/^The Alps$/);VIEW(S,[10,45,3.2])},
  /* Bombay, where the stop arrives, lay off the globe's right edge: framed Aden to Bombay */
  "Bombay, two days early":S=>VIEW(S,[59.5,17,1.7]),
  /* Calcutta lay at the globe's edge by the map key, and the Kholby label was pushed under it by the temples photo
     beside Kholby (the next stop's card shows the temples): framed Bombay to Calcutta; the photo goes, and so does an
     "India" label on a long leader (geoflock-sweep-tours4.js's drop no longer held) */
  "A railway that wasn’t finished":S=>{DROPPH(S,/^The temples of Bundelkhand/);DROP(S,/^India$/);VIEW(S,[81.7,23,2.6])},
  /* Port Said's and Suez's labels, 37 px apart, crossed over each other: framed closer on the canal */
  "The Suez Canal":S=>VIEW(S,[32.6,30.4,7.5]),
  /* the four places, close together, had their labels pushed out on long leaders (Allahabad's far south, over the Bay
     of Bengal), the Ganges photo was pushed far west of Benares and the Kolkata photo lay by the map key: framed closer;
     both photos go (Benares and Calcutta keep their labels; the card shows the temples) */
  "Saving Aouda":S=>{DROPPH(S,/^(The Ganges at Varanasi|Kolkata today)/);DROP(S,/^India$/);VIEW(S,[84.5,24.2,5])},
  /* the Malacca Strait photo was pushed down to the globe's bottom edge, far from the strait */
  "Hong Kong and the opium den":S=>DROPPH(S,/^Ships in the Malacca/),
  /* Yokohama, where the stop ends, and Mount Fuji's photo lay at the globe's edge by the zoom buttons: framed Hong Kong
     to Yokohama */
  "By pilot boat to Shanghai":S=>VIEW(S,[128.5,30,2.4]),
  /* Yokohama lay under the card and San Francisco off the globe's right edge: framed on the whole crossing */
  "Across the Pacific":S=>VIEW(S,[-169,45,1]),
  /* Omaha lay at the globe's edge by the zoom buttons; the Promontory Summit and Salt Lake City labels, on one spot, were
     pushed far south on long leaders, and a "United States" label hung on a long leader (geoflock-sweep-tours4.js's drop
     no longer held): framed San Francisco to Omaha; the Salt Lake City and United States labels go (the card tells of Utah), and so does
     the shading of the whole country, which kept the labels away (see "Attack on the plains") */
  "The Pacific Railroad":S=>{DROP(S,/^(Salt Lake City|United States)$/);NOSHADE(S);VIEW(S,[-104.5,41,2.4])},
  /* the three labels hung far north on long leaders, in Canada, Omaha's by the zoom buttons: the label placer (psLayout,
     index.html) keeps labels off a stop's shaded countries, and here the whole United States was shaded, with every place
     inside it. The shading goes (the map's borders still show the country), so the labels sit by their places */
  "Attack on the plains":S=>{NOSHADE(S);VIEW(S,[-100,40.5,3.2])},
  /* Queenstown and the Atlantic cable's ends lay at the globe's right edge by the zoom buttons: framed New York to Ireland */
  "Missed by 45 minutes":S=>VIEW(S,[-41,47,1.4]),
  /* the globe turned to a point near the North Pole, between London and the 180° line, with London under the card: framed
     on London (the stop's buttons turn the globe to 180°, whose label no longer pulls the frame) */
  /* (and 1872 was a leap year, so 21 December was its 356th day, but the day-and-night slider counts days in a common
     year and read "22 Dec": day 355 puts the slider on 21 December, with the Sun a negligible 0.4° of its yearly path
     away) */
  "The day he gained":S=>{AREA(S,/^180°$/);LOCK(S,"gfSun",{utc:20.75,day:355});VIEW(S,[-8,40,1.1])},
  /* Hoboken's label hung at the globe's top edge over the map's switches and Amiens lay at the card's edge: framed on the
     Atlantic, Hoboken to Amiens (Colombo, on the far side, is left out of the framing). The stat's time moves into the
     stop's guess (revealed there) */
  "Racing Phileas Fogg":S=>{AREA(S,/^Colombo$/);RE(S,"stat","In 1889–90 the reporter Nellie Bly beat Fogg for real: 72 days, 6 hours and 11 minutes","In 1889–90 the reporter Nellie Bly raced Fogg for real: guess below how long she took");VIEW(S,[-35,40,0.95])},
  "Now explore":S=>VIEW(S,[48,33,1.05])
};

/* set a text pin's label above its place (index.html's label placer, psLayout, honours "above") */
const ABOVE=(S,re)=>XF(S,"pins","above"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?{at:[Array.isArray(p[0][0])?p[0][0]:p[0]],text:p[1],above:true}:p));
FIX.bplagues={
  /* the Ganges photo lay on the zoom buttons, Elmina's was pushed far south to the globe's bottom edge, and Camp
     Funston's hung at the globe's far edge under the card (each place has a stop of its own) */
  "Plagues and Peoples":S=>{DROPPH(S,/^(The Ganges at Varanasi|Elmina Castle|Camp Funston)/);VIEW(S,[40,28,1])},
  /* Olduvai Gorge's label lay under the map key: framed a little east */
  "Born among parasites":S=>VIEW(S,[28,-2,1.5]),
  /* "Turkey", "Syria" and "Iraq" labels on long leaders (the map names them) */
  "Crowds, farms and new diseases":S=>{DROP(S,/^(Turkey|Syria|Iraq|Iran)$/);VIEW(S,[41,33,3])},
  /* the Mediterranean's circle lay under the card and China's at the globe's edge by the zoom buttons: framed wider */
  "Four pools of disease":S=>VIEW(S,[64,32,0.8]),
  /* Rome lay under the card and Luoyang at the globe's edge by the zoom buttons: the stop's buttons turn the globe from
     one end of Eurasia to the other */
  "The pools meet: Rome and Han China":S=>VIEW(S,[12.5,41.9,1.8]),
  /* Pelusium lay at the globe's edge by the map key: framed a little east */
  "The Plague of Justinian":S=>VIEW(S,[25.5,37,2.4]),
  /* Yunnan, McNeill's guess, lay under the map key: framed Sarai to Yunnan */
  "The Mongols open the steppe":S=>VIEW(S,[78,38,1.35]),
  /* Caffa, where the stop begins, lay at the globe's edge by the map key and Cairo under it: framed a little east and
     wider */
  "From Caffa to Europe, 1346–1351":S=>VIEW(S,[22,44,1.7]),
  /* Ragusa's label ran under the map key: framed a little east. The stat's 30 days move into the stop's guess (revealed
     there) */
  "Forty days: the first quarantines":S=>{RE(S,"stat","made ships from plague areas wait 30 days before landing","made ships from plague areas wait before landing: guess below for how long");VIEW(S,[16.5,43.5,3.5])},
  /* Tenochtitlan and Veracruz, where the stop's story is, lay at the card's edge, and Seville at the globe's top edge by
     the search box: framed on the Caribbean and Mexico (Seville, where the route starts, is left out of the framing) */
  "Smallpox conquers Mexico":S=>{AREA(S,/^Seville$/);VIEW(S,[-78,20,1.6])},
  /* Elmina lay off the globe's right edge under the map key, with Cape Coast Castle's photo, and Saint-Domingue at the
     card's edge: the stop's buttons turn the globe between West Africa and the Caribbean; the Cape Coast photo goes (the
     card shows Elmina) */
  "Fevers that guarded Africa":S=>{DROPPH(S,/^Cape Coast Castle/);VIEW(S,[-8,11,2.2])},
  /* the stat's death toll moves into the stop's guess (revealed there) */
  "Panama: the mosquito wins, then loses":S=>RE(S,"stat","France’s attempt to dig a canal at Panama in the 1880s cost some 22,000 lives, most to yellow fever and malaria","France’s attempt to dig a canal at Panama in the 1880s ended in disaster: guess below how many lives it cost"),
  /* Jessore and Haridwar, where cholera broke out, lay off the globe's right edge: the stop's buttons follow it west
     from Bengal; the Ganges photo goes (the stop opens on Bengal, where it hung on the zoom buttons) */
  "Cholera follows the pilgrims and the armies":S=>{DROPPH(S,/^The Ganges at Varanasi/);VIEW(S,[87.5,25,2.2])},
  /* San Francisco and Sydney were round the back of the globe and Cape Town at the bottom edge under the graphics
     notice, and the Bombay photo was pushed far south of Bombay: the stop's buttons turn the globe to each port; the photo
     goes */
  "The third pandemic":S=>{DROPPH(S,/^Bombay’s waterfront/);VIEW(S,[99,23,1.6])},
  /* Camp Funston lay under the card and Freetown under the map key: framed Kansas to Brest and Freetown (83° of
     longitude apart, so at the globe's widest view Freetown sits by the key), and Freetown's label set above its place */
  "The influenza of 1918":S=>{ABOVE(S,/^Freetown$/);VIEW(S,[-46,46,1])},
  /* Merca, the last natural case, lay at the globe's edge under the map key with a "Somalia" label (the map names it):
     framed England to Somalia, Merca's label set above its place; the cowpox cartoon's photo, pushed off England onto
     Geneva, goes (Berkeley's label comes back) */
  "The end of smallpox":S=>{DROP(S,/^Somalia$/);ABOVE(S,/^Merca/);DROPPH(S,/^A cartoon of the cowpox/);VIEW(S,[44,22,1.3])},
  /* Yambuku lay at the card's edge with the Kinshasa photo and a "DR Congo" label below it, and Guangdong and Wuhan off
     the globe's right edge: the stop's buttons turn the globe between Central Africa and China; the label goes */
  "The contest goes on":S=>{DROP(S,/^DR Congo$/);VIEW(S,[22,-1,2])},
  "Now explore":S=>VIEW(S,[40,28,1])
};

FIX.b12maps={
  /* the Gyeongbokgung photo lay on the zoom buttons and the Panthéon's was stacked under the Rijksmuseum's (each has a
     stop of its own) */
  "A History of the World in Twelve Maps":S=>{DROPPH(S,/^(Gyeongbokgung Palace|The Panthéon)/);VIEW(S,[40,30,1])},
  /* an "Iraq" label on a long leader (the map names it), and Sippar's label under the map key: framed a little west */
  "The world on a clay tablet":S=>{DROP(S,/^Iraq$/);VIEW(S,[42.3,33,3])},
  /* Taprobane, Ptolemy's too-big Sri Lanka, lay under the map key and Thule at the globe's top edge: framed a little
     west */
  "Ptolemy’s Geography":S=>VIEW(S,[42,24,1.05]),
  /* Palermo, where al-Idrisi worked, had lost its label (a photo pass took it), and Ceuta's and Córdoba's labels, two
     places a few km apart, were pushed far north on long leaders through the seven climates' labels: framed closer on
     the Mediterranean, Palermo's label back and Córdoba's gone (the card shows its mosque) */
  "Al-Idrisi’s map for a Norman king":S=>{DROP(S,/^Córdoba$/);ADDPIN(S,[[13.36,38.12],"Palermo: Roger II’s court","point"]);VIEW(S,[8,36,1.6])},
  /* the Church of the Holy Sepulchre photo was pushed far south of Jerusalem, into Egypt (the card shows the map) */
  "The Hereford Mappa Mundi":S=>DROPPH(S,/^The Church of the Holy Sepulchre/),
  /* Seoul's, Kyoto's and China's labels were crowded at the globe's edge by the zoom buttons and Africa's tip was off
     the bottom edge: framed on Korea, the map's home (China's label on a long leader goes, and a "North Korea" label: the
     map names both), and Kyoto's, under the map key with Korea in sight (the card and the first button tell of
     the Kyoto copy); the stop's buttons turn the globe to the far ends of its world */
  "The Kangnido: a Korean view of the world":S=>{DROP(S,/^(China, drawn huge.*|North Korea|Kyoto: the oldest.*)$/);VIEW(S,[133,36,2])},
  /* Saint-Dié lay at the globe's edge by the zoom buttons and ‘America’ at the bottom edge: framed on the Atlantic */
  "Waldseemüller names America":S=>VIEW(S,[-35,18,1]),
  /* the Vatican photo was pushed far from Rome onto Seville's label; the stop's buttons turn the globe between the two
     lines (Ternate and the Zaragoza line, at the far end, are left out of the opening frame) */
  "Diogo Ribeiro divides the globe":S=>{DROPPH(S,/^The Vatican/);AREA(S,/^(Ternate|Zaragoza line|Tordesillas line)/);VIEW(S,[-30,25,1.1])},
  /* the Rijksmuseum photo and Blaeu's portrait hung at the globe's top edge over the map's switches, the Cape at the
     bottom edge and Batavia and Dejima round the back: the stop's buttons turn the globe to each Dutch outpost; the
     Rijksmuseum photo goes (the card shows Blaeu's map) */
  "Blaeu: maps for money":S=>{DROPPH(S,/^The Rijksmuseum/);AREA(S,/^(Batavia|Dejima)/);VIEW(S,[4.9,50,2.2])},
  /* London's label hung at the card's edge on a long leader: framed a little west */
  "Mackinder’s heartland":S=>VIEW(S,[58,50,1.15]),
  /* Brazil's true-size shape, which the card asks you to drag over the USA, lay round the back of the globe: the stop's
     buttons turn the globe between the two shapes */
  "The Peters projection":S=>VIEW(S,[10,46,1.5]),
  /* the Silicon Valley photo was pushed far out to sea (the card shows the satellite picture); framed on North America,
     Mountain View clear of the card */
  "Google Earth":S=>{DROPPH(S,/^Silicon Valley/);VIEW(S,[-105,38,1])},
  "Now explore":S=>VIEW(S,[40,30,1])
};

FIX.b1001={
  /* the Umayyad Mosque, Aleppo citadel and Al-Azhar photos were stacked at the card's edge, pushed far from their cities,
     and the Zanzibar dhow's hung at the globe's bottom edge (Damascus and Cairo have stops of their own) */
  "One Thousand and One Nights":S=>{DROPPH(S,/^(The Umayyad Mosque|The Citadel of Aleppo|Al-Azhar Mosque|A dhow off Zanzibar)/);VIEW(S,[57,25,1.3])},
  /* the Tigris photo and the Round City plan were stacked above and below Baghdad, and the Abbasid label ran off the
     globe's edge: the Tigris photo goes (the opening shows it), and the stop is framed a little east */
  "Harun al-Rashid’s Baghdad":S=>{DROPPH(S,/^The Tigris at Baghdad/);VIEW(S,[46,32,3])},
  /* "Iraq" and "Kuwait" labels on long leaders (the map names them), and Sohar and the Old Muscat photo under the map
     key: framed Basra to Muscat; the Old Muscat photo, still pushed under the key, goes (Muscat's label comes back) */
  "Basra: Sindbad sets out":S=>{DROP(S,/^(Iraq|Kuwait)$/);DROPPH(S,/^Old Muscat/);VIEW(S,[54,25.5,3])},
  /* the Gulf, where the sea road starts, lay under the card, and the Malacca ships' photo was pushed far south of the
     strait: framed the Gulf to Guangzhou and Belitung, Belitung's label set above its place, clear of the map key; the photo
     goes */
  "Sindbad’s sea road":S=>{DROPPH(S,/^Ships in the Strait/);ABOVE(S,/^Belitung/);VIEW(S,[90,12,1.2])},
  /* Madagascar lay at the card's edge, with the baobab photo below it at the bottom edge: framed a little west; the
     baobabs go (the elephant bird's photo marks Madagascar) */
  "The Roc and the valley of diamonds":S=>{DROPPH(S,/^Baobabs on Madagascar/);VIEW(S,[63,-2,1.15])},
  /* the four places, close together, had their labels pushed out on leaders round a "Sri Lanka" label (the map names it),
     with the Temple of the Tooth photo pushed far north over the sea and Galle Fort's far south: framed closer; the
     label and both photos go (Kandy's label comes back) */
  "Serendib":S=>{DROP(S,/^Sri Lanka$/);DROPPH(S,/^(The Temple of the Tooth|Galle Fort)/);VIEW(S,[80.4,7.2,8])},
  /* Ternate and Banda, where cloves and nutmeg grew, lay at the globe's right edge by the map key, an "Indonesia" label
     hung on a long leader, and the pepper photo was pushed far from India's pepper coast out to sea by the card: framed
     Sumatra to Banda; the label and the photo go */
  "Camphor, cloves and nutmeg":S=>{DROP(S,/^Indonesia$/);DROPPH(S,/^Pepper on the vine/);VIEW(S,[118,-1,1.8])},
  /* a "Syria" label on a long leader (the map names it) */
  "Damascus":S=>DROP(S,/^Syria$/),
  /* Damascus, where the caliph gives his order, lay off the globe's right edge: framed Kairouan to Damascus */
  "The City of Brass":S=>VIEW(S,[22,32,2.2]),
  /* Aleppo, Hanna Diyab's home, lay under the map key and the Grand Bazaar photo at the globe's edge: framed Paris to
     Aleppo; the photo, still pushed to the edge, goes (Istanbul's label comes back) */
  "Galland’s Nights, 1704":S=>{DROPPH(S,/^The Grand Bazaar/);VIEW(S,[24,42,2])},
  /* Hollywood was round the back of the globe: the stop's buttons turn the globe to it */
  "The tales travel on":S=>VIEW(S,[40,30,1]),
  "Now explore":S=>VIEW(S,[57,25,1.3])
};


const EARLY={};
const early=()=>{try{for(const t in EARLY){const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{const f=S&&EARLY[t][strip(S.title)];if(f)f(S)})}}catch(e){}};
early();setTimeout(early,1500);setTimeout(early,6000);addEventListener("load",()=>setTimeout(early,500));



/* Each stop's frame, by tour and title, read once from FIX at load (each fix run on a stand-in stop that has only its
   title), as geoflock-polish-rvt.js does: on a tour's very first launch index.html flies to the opening stop before the
   fixes are applied to it, so psGlobeTarget (wrapped above) finds the frame by title as well. */
const FRAMES={};
for(const t in FIX)for(const k in FIX[t]){try{const D={title:k};FIX[t][k](D);const v=VIEWED.get(D);if(v)FRAMES[t+"|"+k]=v}catch(e){}}
let OVR=null;
const viewOf=S=>{if(OVR)return OVR;const v=VIEWED.get(S);if(v)return v;try{return S&&ps&&ps.tour&&FRAMES[ps.tour+"|"+strip(S.title)]}catch(e){return null}};
const applied=new WeakSet();
/* a stop whose photo pins this file edits, and to which geoflock-portraits.js adds a portrait, waits until the portrait
   is in (see XF): if this file locked the field first, the portrait could not be added */
let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left (a tour question could flip it to the right, over the map key) */
 LOCK(S,"card","left");TOUR_OF.set(S,tour);const f=F[strip(S.title)];if(!f){applied.add(S);return}
 PEND=false;try{f(S)}catch(e){console.error("rw3 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}
 /* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when ps.tour changes */
 applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey&&!waiting)return;lastKey=k;waiting=false;
 /* and once more on the stop itself, in case another file re-set a field after the first pass */
 try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f){TOUR_OF.set(S,t);f(S)}}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins; the fixes go in when one
   of these tours opens). Only the card side is locked at load, so a tour's first stop already opens with its card on
   the left. */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
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
 /* a stop whose own game turns the globe is left to it */
 if(document.querySelector(".rw3-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw3){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw3=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw3-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw3-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw3-new");void e.offsetWidth;e.classList.add("rw3-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw3-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw3-rank"></ol><div class="rw3-pool"></div>'+
  '<div class="rw3-btns"><button type="button" class="rw3-btn rw3-undo">Undo</button><button type="button" class="rw3-btn rw3-show">Show me</button><button type="button" class="rw3-btn rw3-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw3-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw3-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw3-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw3-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw3-ok":"rw3-no"):"")+'"><span class="rw3-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw3-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw3-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw3-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw3-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw3-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw3-show").hidden=L.shown;c.querySelector(".rw3-again").hidden=!L.shown;
  if(!L.order.length)say(L,"","Tap the "+cfg.first.toLowerCase()+" first.");
  else if(!done)say(L,"",(N-L.order.length)+" to go. Next one?");
  else if(L.gave)say(L,"Here is the real order",cfg.after(-1,N));
  else say(L,right===N?"All "+N+" in the right place!":right+" of "+N+" in the right place",cfg.after(right,N))}};}


function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.35;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}
/* a row of buttons, one per place; the stop opens on the first. places: [name, lon, lat, zoom, text] */
/* with cfg.mark, the place the globe has turned to gets a ringed dot and its name (the first place, an overview, none;
   a place given a 6th field already has the stop's own label, so it gets the ring only; a 6th field of 2: neither ring nor
   name, for an overview of a region) */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:true,tip:cfg.tip,
 card(L){return'<div class="rw3-btns rw3-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw3-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw3-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw3-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw3-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw3-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q&&f[5]!==2){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw3-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw3-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14);
  /* (rw3) a place may name its own towns, f[6] = [[lon, lat, name]], each a dot and a name tag once the globe is there */
  L.tgs=L.tgs||[];const T6=f[6]||[];T6.forEach((t,k)=>{if(!L.tgs[k])L.tgs[k]=tag(L,"rw3-ctag rw3-small");const p=proj(L,[t[0],t[1]]);if(p)svgEl(L.svg,"circle",{cx:p[0],cy:p[1],r:4.5,class:"rw3-tdot"});putTag(L,L.tgs[k],p,esc(t[2]),9)});
  for(let k=T6.length;k<L.tgs.length;k++)putTag(L,L.tgs[k],null)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw3-gq"><input type="range" class="rw3-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw3-gv"></b></div>'+
  '<div class="rw3-btns"><button type="button" class="rw3-btn rw3-chk">Check my guess</button><button type="button" class="rw3-btn rw3-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw3-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw3-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw3-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw3-rng");r.disabled=!!L.done;
  c.querySelector(".rw3-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw3-chk").hidden=!!L.done;c.querySelector(".rw3-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw3-q"><span class="rw3-n"></span><b class="rw3-item"></b></div><div class="rw3-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw3-btn rw3-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw3-btn rw3-next" hidden>Next →</button><button type="button" class="rw3-btn rw3-again" hidden>Start again</button></div><div class="rw3-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw3-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw3-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw3-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw3-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw3-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw3-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw3-good",L.wait&&i===it[1]);b.classList.toggle("rw3-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw3-next").hidden=!(L.wait&&!done);c.querySelector(".rw3-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw3-again").hidden=!done;
  c.querySelectorAll(".rw3-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw3-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw3-y":"rw3-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw3-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw3-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw3-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}



/* ======================================================================== 1. Round the world, one side at a time (b80days,
   the opening) The route circles the whole Earth: one side of the globe cannot show it all, so the buttons turn it, each naming the towns
   that the opening's own labels leave out. */
const TURN_80=TURNER({tours:["b80days"],title:"Around the World in Eighty Days",mark:true,
 tip:"Fogg’s route goes all the way round the Earth: turn the globe to follow it.",
 places:[["London to Suez",32,38,1.05,"Train and steamer from London to Brindisi, then the new Suez Canal and on across the Arabian Sea to Bombay.",2],
  ["India to Japan",112,25,1.2,"Across India by train (and elephant), then steamers by Singapore and Hong Kong to Yokohama.",2,[[72.84,18.94,"Bombay"],[88.35,22.57,"Calcutta"]]],
  ["The Pacific",-160,38,1.1,"22 days of open ocean from Yokohama to San Francisco, across the 180° line.",2,[[-122.42,37.77,"San Francisco"]]],
  ["America and home",-84,42,1.05,"The new railroad from San Francisco to New York, then the Atlantic to Ireland, Liverpool and London.",2,[[-122.42,37.77,"San Francisco"],[-74.01,40.7,"New York"]]]]});

/* ======================================================================== 2. London or the date line? (b80days, The day he
   gained) The stop's two places are half a world apart; the buttons turn the globe between them. The text is the card's own. */
const TURN_DAY=TURNER({tours:["b80days"],title:"The day he gained",
 tip:"London and the 180° line are half a world apart: turn the globe between them.",
 places:[["London, 8:45 pm",-8,40,1.1,"Night has fallen on London (the shading) as Fogg walks into the Reform Club, a day earlier than he thought."],
  ["The 180° line",175,35,1.1,"Going east, each 15° brought sunrise an hour earlier. Crossing here, Fogg should have put his calendar back a day, and did not."]]});

/* ======================================================================== 3. How long did Nellie Bly take? (b80days, Racing
   Phileas Fogg) Wikipedia, "Around the World in 72 Days": Bly left Hoboken at 9:40 am on 14 November 1889 and was back on
   25 January 1890, "72 days, 6 hours, and 11 minutes after leaving Hoboken". The stat's figure is taken out (part 1) so the
   guess comes first. */
const GUESS_BLY=GUESS({tours:["b80days"],title:"Racing Phileas Fogg",
 tip:"In 1889 a real reporter set off to beat Fogg’s 80 days, on ordinary ships and trains. How long did she take, do you think?",
 vals:[40,50,60,66,72,80,90,100,120],start:5,answer:72,close:1,fmt:v=>v+" days",
 after:"72 days, 6 hours and 11 minutes, from Hoboken on 14 November 1889 back to New Jersey on 25 January 1890: nearly eight days faster than Fogg."});

/* ======================================================================== 4. Train, ship or something stranger? (b80days,
   Now explore) A review of the tour's own legs, in the order Fogg travelled them (each from the stops above and the
   novel, Project Gutenberg #103). Each answer turns the globe there. */
const BINS_80=BINS({tours:["b80days"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Fogg used every kind of transport he could buy. How did he cross each of these stretches?",ask:"By train, by ship, or something stranger?",
 bins:["Train","Ship or boat","Something stranger"],
 items:[["Paris to Brindisi, under the Alps",0,"By rail, through the new Mont Cenis tunnel.",[8.5,45.5,2.4],"Mont Cenis"],
  ["Brindisi to Suez",1,"On the P&O steamer Mongolia, through the new canal.",[26,34.2,2.4],"Mediterranean"],
  ["Bombay to Kholby",0,"By the Great Indian Peninsula Railway, until the line stopped.",[76.2,21.1,2.6],"Bombay to Kholby"],
  ["Kholby to Allahabad",2,"On Kiouni the elephant, bought for £2,000.",[80.9,25.1,2.8],"Kholby to Allahabad"],
  ["Hong Kong up the China coast",1,"In the little pilot boat Tankadère, through a storm.",[119.4,25.4,2.4],"China coast"],
  ["Yokohama to San Francisco",1,"On the paddle steamer General Grant, 22 days.",[-170,45,1.4],"The Pacific"],
  ["Over the Sierra Nevada",0,"On the new Pacific Railroad.",[-120.33,39.32,2.6],"Sierra Nevada"],
  ["Fort Kearny to Omaha",2,"On Mudge’s sledge with a sail, over the frozen prairie.",[-97.5,40.9,2.8],"Fort Kearny to Omaha"],
  ["New York to Queenstown",1,"On the Henrietta, burning her own cabins and masts for fuel.",[-40,47.2,1.6],"The Atlantic"],
  ["Liverpool to London",0,"On a special train he hired: too late, he thought.",[-1.8,52.5,3],"Liverpool to London"]],
 after:(r,N)=>(r===N?"All right! ":"")+"Trains, steamers, an elephant, a pilot boat and a sledge with a sail: Verne’s point was that by 1872 the world was joined up enough for money and nerve to take a man all the way round."});

/* ======================================================================== 5. Two ends of Eurasia (bplagues, The pools meet:
   Rome and Han China) Rome and Luoyang are some 85° of longitude apart; the buttons turn the globe along the roads
   between them. The texts are the card's own. */
const TURN_ROME=TURNER({tours:["bplagues"],title:"The pools meet: Rome and Han China",mark:true,
 tip:"Rome and Han China lie at the two ends of Eurasia: turn the globe along the roads between them.",
 places:[["Rome",12.5,41.9,1.8,"Around AD 165 the ‘Antonine plague’, possibly smallpox, swept the Roman Empire and killed millions."],
  ["Ctesiphon",44.58,33.09,1.8,"On the roads between the empires. Roman writers blamed soldiers coming home from war in Mesopotamia for the plague.",1],
  ["Luoyang, Han China",112.45,34.62,1.8,"The Han capital, at the far end of the Silk Road. China suffered terrible epidemics in the same years, and both empires weakened over the next century.",1]]});

/* ======================================================================== 6. How long did ships wait? (bplagues, Forty days:
   the first quarantines) Wikipedia, "Quarantine": a document of 1377 says that before entering Ragusa newcomers "had to
   spend 30 days (a trentine) in a restricted place"; in 1448 the Venetian Senate "prolonged the waiting period to 40
   days, thus giving birth to the term 'quarantine'". The stat's 30 days are taken out (part 1) so the guess comes first. */
const GUESS_RAGUSA=GUESS({tours:["bplagues"],title:"Forty days: the first quarantines",
 tip:"Ragusa made ships from plague areas wait before anyone could come ashore. For how long, do you think?",
 vals:[1,3,7,14,30,40,60,90],start:2,answer:30,close:1,fmt:v=>v+(v===1?" day":" days"),
 after:"30 days, a ‘trentine’. Venice later stretched the wait to 40 days, quaranta giorni, which gave us the word quarantine."});

/* ======================================================================== 7. West Africa or the Caribbean? (bplagues, Fevers
   that guarded Africa) The stop's two shores are an ocean apart; the buttons turn the globe between them. */
const TURN_FEVER=TURNER({tours:["bplagues"],title:"Fevers that guarded Africa",mark:true,
 tip:"The same fevers guarded both sides of the Atlantic: turn the globe between them.",
 places:[["West Africa’s forts",-8,11,2.2,"Malaria and yellow fever killed most Europeans who went inland, so they kept to forts on the coast, like Elmina and Gorée."],
  ["Saint-Domingue",-72.2,19.76,2.4,"Slave ships carried the fevers and the mosquito across the ocean. In 1802 yellow fever destroyed the army Napoleon sent here, helping Haiti win its independence.",1]]});

/* ======================================================================== 8. How many died digging? (bplagues, Panama)
   Wikipedia, "Panama Canal": the French attempt's "death toll from 1881 to 1889 was estimated at over 22,000, of whom
   as many as 5,000 were French citizens"; "about 5,600 workers died from disease and accidents during the US
   construction". The stat's toll is taken out (part 1) so the guess comes first. */
const GUESS_PANAMA=GUESS({tours:["bplagues"],title:"Panama: the mosquito wins, then loses",
 tip:"In the 1880s a French company tried to dig a canal through the jungle at Panama. How many workers died, do you think?",
 vals:[500,1000,2500,5000,10000,22000,50000,100000],start:3,answer:22000,close:1,fmt:v=>v.toLocaleString("en-GB"),
 after:"Over 22,000 between 1881 and 1889, most of them to yellow fever and malaria. The Americans, who fought the mosquitoes, lost about 5,600 workers to disease and accidents in 1904–1914."});

/* ======================================================================== 9. Follow cholera west (bplagues, Cholera follows
   the pilgrims and the armies) From the Ganges delta to London is a quarter of the way round the world; the buttons
   follow it. The texts are the card's own. */
const TURN_CHOL=TURNER({tours:["bplagues"],title:"Cholera follows the pilgrims and the armies",mark:true,
 tip:"Cholera travelled a quarter of the way round the world in 15 years: follow it west.",
 places:[["Bengal, 1817",84,25,2.2,"Cholera broke out of its home in the Ganges delta, carried by British troops, merchant ships and pilgrims at the Kumbh Mela at Haridwar."],
  ["Mecca",39.83,21.42,2.2,"Pilgrims at the hajj caught it and carried it home along the sea roads.",1],
  ["Moscow, 1830",37.62,55.75,2.2,"It reached Moscow in 1830, and London two years later.",1],
  ["London, 1854",-0.13,51.51,2.4,"The doctor John Snow traced an outbreak to a single water pump on Broad Street. Fear of cholera, McNeill argues, drove cities to build clean water supplies and sewers.",1]]});

/* ======================================================================== 10. Plague on the steamships (bplagues, The third
   pandemic) The stop's ports are spread round the whole Earth; the buttons turn the globe to each. The texts are the
   card's own. */
const TURN_THIRD=TURNER({tours:["bplagues"],title:"The third pandemic",mark:true,
 tip:"Steamships carried plague to every inhabited continent: turn the globe to each port.",
 places:[["Yunnan and Hong Kong",106,23,1.6,"Plague left Yunnan in the 1850s. In Hong Kong in 1894 Alexandre Yersin found the bacterium that causes it."],
  ["Bombay, 1896",72.88,18.95,2,"India was worst hit: some 12 million people died there.",1],
  ["San Francisco, 1900",-122.42,37.77,2,"Plague settled into the ground squirrels and prairie dogs of the American West, where it still infects a few people each year.",1],
  ["Sydney, 1900",151.2,-33.86,2,"Rats aboard the steamships brought it to Australia.",1],
  ["Cape Town, 1901",18.42,-33.92,2,"By then plague had reached every inhabited continent.",1]]});

/* ======================================================================== 11. Africa and China (bplagues, The contest goes
   on) The stop's places are a third of the way round the world apart. The texts are the card's own. */
const TURN_CONTEST=TURNER({tours:["bplagues"],title:"The contest goes on",mark:true,
 tip:"New diseases have jumped from animals on both sides of the Old World: turn the globe between them.",
 places:[["Central Africa",22,-1,2,"Ebola was first identified at Yambuku in 1976, the year the book came out. HIV, which crossed from chimpanzees, spread from Kinshasa along river boats and railways from the 1920s.",2],
  ["China",113,27,2,"SARS (2002) and Covid-19 (2019) both began in China, and both travelled the world by plane.",2]]});

/* ======================================================================== 12. Plagues in order (bplagues, Now explore) The
   tour's own dates; each tap turns the globe there. */
const SORT_PLAG=SORT({tours:["bplagues"],title:"Now explore",turns:true,
 tip:"Nearly two thousand years of people against germs: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["The Antonine plague strikes Rome",165,"AD 165",0,[12.5,41.9,2.4]],["Plague at Pelusium",541,"541",0,[32.55,31.04,2.4]],
  ["The Black Death at Caffa",1346,"1346",0,[35.38,45.03,2.4]],["Ragusa’s first quarantine",1377,"1377",0,[18.09,42.64,2.6]],
  ["Smallpox reaches Mexico",1520,"1520",0,[-96.13,19.2,2.4]],["Yellow fever beats Napoleon’s army in Haiti",1802,"1802",0,[-72.2,19.76,2.4]],
  ["Cholera breaks out of Bengal",1817,"1817",0,[89.21,23.17,2.4]],["Yersin finds the plague germ in Hong Kong",1894,"1894",0,[114.17,22.28,2.4]],
  ["Influenza at Camp Funston",1918,"1918",0,[-96.78,39.07,2.2]],["The last natural case of smallpox",1977,"1977",0,[44.77,1.72,2.4]]],
 after:(r,N)=>"Every new link between peoples, from caravans to steamships and planes, opened a new door to disease; McNeill’s point is that the contest never ends."});

/* ======================================================================== 13. Two lines, half a world apart (b12maps, Diogo
   Ribeiro divides the globe) The Tordesillas line (46.6°W) and the Zaragoza line (144.5°E) are 169° of longitude apart:
   no side of the globe shows both. The texts are the card's own. */
const TURN_RIBEIRO=TURNER({tours:["b12maps"],title:"Diogo Ribeiro divides the globe",mark:true,
 tip:"Spain’s and Portugal’s two lines are half a world apart: turn the globe from one to the other.",
 places:[["The Tordesillas line",-30,25,1.1,"Drawn down the Atlantic in 1494: Portugal’s side to the east, Spain’s to the west.",2],
  ["The Zaragoza line",140,10,1.1,"In 1529 Spain sold its claim to the Moluccas, the clove and nutmeg islands, to Portugal for 350,000 ducats; the line was set about 17° east of the islands.",2]]});

/* ======================================================================== 14. The Kangnido's world (b12maps, The Kangnido)
   Korea and Africa's southern tip are some 107° of longitude apart; the buttons turn the globe across the map's world.
   The texts are the card's own. */
const TURN_KANG=TURNER({tours:["b12maps"],title:"The Kangnido: a Korean view of the world",mark:true,
 tip:"The Kangnido stretches from Korea to Africa: turn the globe across its world.",
 places:[["Korea and China",133,36,2,"Hanseong (Seoul), the map’s home. China fills the middle of the map; Korea is drawn far larger than life and Japan small. The oldest surviving copy is kept in Kyoto.",2],
  ["Alexandria",29.89,31.21,2,"The far west is there too: the Mediterranean and Alexandria’s lighthouse, from Chinese maps made under the Mongols.",1],
  ["Africa’s southern tip",20,-34.8,2,"A pointed southern tip of Africa, drawn decades before Europeans sailed round it.",1]]});

/* ======================================================================== 15. The Dutch outposts (b12maps, Blaeu: maps for
   money) Amsterdam, the Cape, Batavia and Dejima are spread half round the world. The texts are the card's own. */
const TURN_BLAEU=TURNER({tours:["b12maps"],title:"Blaeu: maps for money",mark:true,
 tip:"Blaeu’s maps followed the Dutch ships: turn the globe from Amsterdam to their outposts.",
 places:[["Amsterdam",4.9,50,2.2,"The Blaeu family were official mapmakers to the Dutch East India Company, keeping its secret charts of the route to Asia.",2],
  ["The Cape, 1652",18.42,-33.92,2.2,"The first stop on the Company’s route to Asia (the arrows).",1],
  ["Batavia",106.82,-6.13,2.2,"Batavia, today’s Jakarta, on the Company’s route to Asia.",1],
  ["Dejima, Nagasaki",129.87,32.74,2.2,"Dejima, in Nagasaki harbour, the far end of the Company’s route (the arrows).",1]]});

/* ======================================================================== 16. India over Europe, Brazil over the USA
   (b12maps, The Peters projection) The stop's two true-size shapes lie 112° of longitude apart. */
const TURN_PETERS=TURNER({tours:["b12maps"],title:"The Peters projection",
 tip:"Two true-size shapes wait to be dragged: turn the globe from one to the other.",
 places:[["India over Europe",10,46,1.5,"Drag India, at its true size, over Europe and compare."],
  ["Brazil over the USA",-96,42,1.4,"Drag Brazil, at its true size, over the United States and compare."]]});

/* ======================================================================== 15. Twelve maps in order (b12maps, Now explore)
   The tour's own dates; each tap turns the globe to where the map was made (or found). */
const SORT_12=SORT({tours:["b12maps"],title:"Now explore",turns:true,
 tip:"Put the tour’s maps in the order they were made. Each one you tap turns the globe to where it was made.",
 first:"Oldest",last:"Newest",bars:false,
 items:[["The Babylonian world map",-600,"about 600 BC",0,[44.42,32.54,2.4]],["Ptolemy’s Geography",150,"about AD 150",0,[29.92,31.2,2.4]],
  ["Al-Idrisi’s map for Roger II",1154,"1154",0,[13.36,38.12,2.4]],["The Hereford Mappa Mundi",1300,"about 1300",0,[-2.716,52.054,2.4]],
  ["The Kangnido",1402,"1402",0,[126.98,37.57,2.4]],["Waldseemüller’s ‘America’",1507,"1507",0,[6.95,48.28,2.4]],
  ["Mercator’s map for sailors",1569,"1569",0,[6.76,51.43,2.4]],["Mackinder’s heartland",1904,"1904",0,[-0.175,51.5,2.4]],
  ["The Peters projection",1973,"1973",0,[7.1,50.73,2.4]],["Google Earth",2005,"2005",0,[-122.08,37.42,2.4]]],
 after:(r,N)=>"From a clay disc with Babylon in the middle to a whole planet on a screen: Brotton’s point is that every one of them was drawn by someone, for some purpose."});

/* ======================================================================== 17. In the old manuscripts, or added later?
   (b1001, Galland's Nights, 1704) Wikipedia, "One Thousand and One Nights": "Aladdin's Lamp" and "Ali Baba and the Forty
   Thieves" first appear in Galland's translation and are in no original Arabic manuscript; Galland heard them from the
   Maronite storyteller Hanna Diab. "The Seven Voyages of Sinbad the Sailor" "had an independent existence before being
   added to the collection in later manuscripts and translations" (the tour's Basra stop: Galland added them from another
   manuscript). "The Hunchback's Tale" and "The Fisherman and the Jinni" are among the core tales of the Galland
   (Syrian) manuscript, which holds the frame story. Each answer turns the globe to Syria, where Galland's manuscript was
   copied, or to Paris, where the added tales joined the Nights. */
const BINS_1001=BINS({tours:["b1001"],title:"Galland’s Nights, 1704",mark:true,
 tip:"Galland’s Nights mixed tales from an old Syrian manuscript with tales from elsewhere. Which is each of these?",ask:"In the old Arabic manuscript, or added later?",
 bins:["In the old manuscript","Added later"],
 turn:[[37,35,2.4],[2.35,48.86,2.4]],
 items:[["Shahrazad’s frame story",0,"The frame holds the whole collection together, in every manuscript."],
  ["Aladdin and the magic lamp",1,"No Arabic manuscript older than Galland has it: Hanna Diyab, from Aleppo, told it to him in Paris in 1709."],
  ["The Fisherman and the Jinni",0,"One of the core tales of Galland’s Syrian manuscript."],
  ["Sindbad the Sailor",1,"Sindbad’s voyages were once a separate book; Galland added them from another manuscript."],
  ["Ali Baba and the Forty Thieves",1,"Another of Hanna Diyab’s tales, told to Galland in Paris."],
  ["The Hunchback",0,"One of the core tales of Galland’s Syrian manuscript, full of the streets of Mamluk Cairo."]],
 where:["Galland’s manuscript was copied in Syria.","The added tales joined the Nights in Paris."],
 after:(r,N)=>(r===N?"All right! ":"")+"Two of the most famous ‘Arabian Nights’, Aladdin and Ali Baba, first appeared in French: the Nights kept growing wherever they travelled."});

/* ======================================================================== 18. The tales go round the world (b1001, The tales
   travel on) London, Calcutta and Hollywood are spread round the globe. The texts are the card's own. */
const TURN_1001=TURNER({tours:["b1001"],title:"The tales travel on",mark:true,
 tip:"The Nights travelled from Cairo all round the world: turn the globe to follow them.",
 places:[["Europe and Cairo",40,30,1,"Cheap English versions translated from Galland’s French appeared in London from 1706; the first Arabic edition printed in the Arab world came from Bulaq, in Cairo, in 1835.",2],
  ["Calcutta",88.36,22.57,2,"Later translators, like Edward Lane and Richard Burton, worked from Arabic editions printed in Cairo and Calcutta.",1],
  ["Hollywood",-118.24,34.05,2,"Films, ballets and cartoons followed: Sindbad, Ali Baba and Aladdin became world characters.",1]]});

/* ======================================================================== 19. The Nights in order (b1001, Now explore) The
   tour's own dates (Baghdad founded 762; the Belitung wreck about 830; Galland's Nights from 1704; Hanna Diyab in Paris
   1709; Bulaq 1835; Disney's Aladdin 1992), with the Calcutta edition of 1839–42 (Wikipedia, "One Thousand and One
   Nights": "Calcutta II", 1839–1842). Each tap turns the globe there. */
const SORT_1001=SORT({tours:["b1001"],title:"Now explore",turns:true,
 tip:"Over a thousand years of the Nights: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Baghdad is founded as a round city",762,"762",0,[44.38,33.35,2.4]],["A ship sinks off Belitung with Chinese pottery",830,"about 830",0,[107.6,-2.75,2.4]],
  ["Galland’s French Nights begin to appear",1704,"1704",0,[2.35,48.86,2.4]],["Hanna Diyab tells Galland about Aladdin",1709,"1709",0,[2.35,48.86,2.4]],
  ["Bulaq prints the Nights in Arabic",1835,"1835",0,[31.23,30.06,2.4]],["The Calcutta edition is printed",1839,"1839–42",0,[88.36,22.57,2.4]],
  ["Disney’s Aladdin",1992,"1992",0,[-118.24,34.05,2.2]]],
 after:(r,N)=>"From the caliph’s Baghdad to a Hollywood cartoon: the Nights have been retold, translated and added to for more than a thousand years."});


const DEFS=[TURN_80,TURN_DAY,GUESS_BLY,BINS_80,TURN_ROME,GUESS_RAGUSA,TURN_FEVER,GUESS_PANAMA,TURN_CHOL,TURN_THIRD,TURN_CONTEST,SORT_PLAG,TURN_RIBEIRO,TURN_KANG,TURN_BLAEU,TURN_PETERS,SORT_12,BINS_1001,TURN_1001,SORT_1001];


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw3-layer rw3-layer";el.innerHTML='<svg class="rw3-sv"><defs><clipPath id="rw3Disc"><path class="rw3-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw3Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw3-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw3-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw3-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw3-ctl";
 c.innerHTML='<div class="rw3-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw3-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw3-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});
/* the card scrolls: bring the new controls into view (the headline stays just above them), as geoflock-polish-rvi.js does */
let scrolled=null;
function showCtl(c){setTimeout(()=>{try{let sc=c.parentElement;while(sc&&sc!==document.body){const o=getComputedStyle(sc).overflowY;if(/auto|scroll/.test(o)&&sc.scrollHeight>sc.clientHeight+4)break;sc=sc.parentElement}
 if(!sc||sc===document.body)return;const r=c.getBoundingClientRect(),b=sc.getBoundingClientRect();if(r.bottom>b.bottom){scrolled=sc;sc.scrollTop+=Math.min(r.top-b.top-70,r.bottom-b.bottom+8)}}catch(e){}},900)}

/* ======================================================================== part 3: the History map's year banner
   (as geoflock-polish-rvj.js does for the People map) the banner at the top of the globe ("400 BC · Greek city-states")
   follows the stop's place, and with the card on the left it ran under the map key in the top right corner. On these
   tours it is slid left until it clears the key (never under the card), and put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;const k=document.querySelector(".ps-mapkey.at-right");b.style.translate="";bannerMoved=null;if(!k||!k.offsetWidth)return;
 const B=b.getBoundingClientRect(),K=k.getBoundingClientRect();if(!(B.right>K.left-8&&B.bottom>K.top&&B.top<K.bottom))return;
 let dx=K.left-8-B.right;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

{const s=document.createElement("style");s.textContent=`
.rw3-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw3-sv{position:absolute;left:0;top:0;overflow:visible}
.rw3-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw3-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw3-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw3-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw3-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw3-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw3-btn[hidden]{display:none}
.rw3-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw3-ep b{display:block;font-size:15px}
.rw3-ep.rw3-new{animation:rw3In .45s ease}@keyframes rw3In{from{opacity:.2;transform:translateY(4px)}}
.rw3-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw3-sortq i{font-style:normal}
.rw3-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw3}
.rw3-rank li{position:relative;counter-increment:rw3;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw3-rank li::before{content:counter(rw3);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw3-rank li.rw3-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw3-rank li.rw3-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw3-nm{flex:1 1 auto;z-index:1}.rw3-v{z-index:1;font-weight:800;white-space:nowrap}
.rw3-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw3-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw3-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw3-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw3-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw3-do,:is(body.dark-theme,body.sky-night) .rw3-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw3-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw3-btn,:is(body.dark-theme,body.sky-night) .rw3-chip,:is(body.dark-theme,body.sky-night) .rw3-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw3-rank li.rw3-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw3-rank li.rw3-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw3-bar{background:rgba(255,178,122,.2)}
.rw3-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw3-rng{flex:1 1 auto;accent-color:#d9682b}.rw3-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw3-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw3-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw3-item{font-size:16px;color:#13294b}
.rw3-bins{display:flex;gap:6px;flex-wrap:wrap}.rw3-bins .rw3-btn[hidden]{display:none}.rw3-bin:disabled{cursor:default;opacity:.55}
.rw3-btn.rw3-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw3-btn.rw3-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw3-dots{display:flex;gap:4px;margin-top:8px}.rw3-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw3-dots i.rw3-now{box-shadow:0 0 0 2px #d9682b inset}.rw3-dots i.rw3-y{background:#1f8a4c}.rw3-dots i.rw3-x{background:#c2364f}
.rw3-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw3-sl .rw3-row{margin-top:2px}.rw3-sl .rw3-val{min-width:36px}
.rw3-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw3-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw3-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw3-out b{font-size:15px;color:#9a4a16}
.rw3-ch{display:block;width:100%;height:auto;margin-top:6px}.rw3-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw3-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw3-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw3-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw3-val,:is(body.dark-theme,body.sky-night) .rw3-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw3-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw3-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw3-n,:is(body.dark-theme,body.sky-night) .rw3-sl label,:is(body.dark-theme,body.sky-night) .rw3-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw3-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw3-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw3-dots i{background:rgba(255,255,255,.18)}
.rw3-btn.rw3-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw3-btn.rw3-cur{background:#9fc3ff;color:#13294b}
.rw3-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw3-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw3-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw3-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw3-ep b .rw3-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw3-ep b .rw3-km{color:#ffb27a}
.rw3-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw3-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw3-small{font-size:11.5px!important;padding:2px 7px!important}
.rw3-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw3-gq .rw3-rng{flex:1 1 auto}.rw3-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw3-julh{fill:#c2364f}.rw3-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw3-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw3-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw3-gv{color:#ffb27a}
.rw3-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw3-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw3-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw3-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw3-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw3-clk{font-size:18px}.rw3-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw3-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw3-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw3-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw3-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw3-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw3-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw3-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw3-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw3-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw3-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw3-pig{color:#1f8a4c}
.rw3-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw3-mlg line,.rw3-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw3-mlg .rw3-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw3-mlg line,:is(body.dark-theme,body.sky-night) .rw3-mlg path,:is(body.dark-theme,body.sky-night) .rw3-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw3-mlg .rw3-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw3-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw3-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw3-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw3-pig{color:#4cc27f}
.rw3-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw3-kbw{fill:#7fb3e0}
.rw3-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw3-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw3-kbb.rw3-kbok{stroke:#f2b33d}.rw3-kbb.rw3-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw3-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw3-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw3-ctl .rw3-btn.rw3-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw3-ctl .rw3-btn.rw3-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw3-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw3={v:1,FIX,XFS,viewOf,tours:MYT,tryView(v){OVR=v||null},L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
