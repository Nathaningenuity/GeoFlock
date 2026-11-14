/* GeoFlock polish RW-1: a stop-by-stop review of four Books tours, The Silk Roads (bsilkroads), The World Is Flat (bflat),
   The World Is Spiky (bspiky) and The Voyage of the Beagle (bbeagle), each looked at on its default map (the globe), at
   1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rw1.js (its helpers and engine, under "rw1" names so the files never touch each other's
   controls): frames looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here gets exactly its frame;
   fixed fields are non-configurable getters whose setters are ignored (a field already non-configurable is left alone).
   Pin lists are filtered through getters (a getter another file already put on a field stays underneath), photo pins wait
   for geoflock-portraits.js's portraits, and a stop whose photos are dropped gets its photo squares rebuilt. CSS classes
   start with "rw1-". Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRw1)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw1Test or ?rw1test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw1Test||/[?&]rw1test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rw1Test||/[?&]rw1test\b/.test(location.search)),enumerable:true,
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw1)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw1,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw1=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);


const FIX={};
/* take a portrait (added by geoflock-portraits.js) off a stop */
const NOPPL=(S,name)=>{const L=NOP.get(S)||[];if(!L.includes(name))L.push(name);NOP.set(S,L);DROPPH(S,new RegExp("^"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"))};

FIX.bsilkroads={
  /* Frankopan's portrait, pinned at Oxford, hung above the globe over the map's switches (Oxford is far round the back of
     a view of the roads): it goes from the map; Venice to Chang'an framed on the open side of the card, and the Genghis
     Khan statue's and Mogao Caves' photos, then by the zoom buttons, go (each has a stop of its own) */
  "The Silk Roads":S=>{NOPPL(S,"Peter Frankopan");DROPPH(S,/^(Genghis Khan|Mogao Caves)/);VIEW(S,[70,42,1])},
  /* the Samarkand and Balkh labels ran under the map key and Merv's hung on a long leader: framed further west and closer;
     the shaded countries' name labels, on long leaders up to the search box, go (the map names them), and so does Bukhara's
     (its photo names it) */
  "The world’s centre":S=>{DROP(S,/^(Bukhara|Iran|Iraq|Afghanistan|Turkmenistan|Uzbekistan|Tajikistan|Kyrgyzstan|Kazakhstan)$/);VIEW(S,[67,36,2.2])},
  /* Susa, Persepolis and the "Persian Empire" label lay under the map key: framed east, Sardis to Persepolis */
  "Persia’s royal road":S=>VIEW(S,[49,32.1,2.1]),
  /* Chang'an and Dunhuang, where the stop's silk game starts, sat on the globe's right edge, the game's "carried by" bubble
     beside the zoom buttons: framed east, Chang'an to Merv in view */
  "Silk and heavenly horses":S=>VIEW(S,[96,38,2]),
  /* Bodh Gaya and the Kushan label lay by the map key and Luoyang and Chang'an, where the roads end, off the globe: framed
     east and wider */
  "Roads of faith":S=>VIEW(S,[87,34,1]),
  /* Baghdad, Talas and Samarkand lay off the globe's right edge or under the map key, and the Tigris photo was pushed down
     into the Red Sea: framed east, Mecca to Talas */
  "The rise of Islam":S=>VIEW(S,[61.1,29.9,1.7]),
  /* Itil, Bolghar's leader and the Abbasid label lay under the map key; two photos of Kyiv crowded the "Kyivan Rus" label:
     framed east, Birka to Baghdad; St Sophia's goes (the card shows Kyiv too) */
  "Furs, slaves and silver":S=>{DROPPH(S,/^St Sophia/);VIEW(S,[45,51.6,2.2])},
  /* Jerusalem, Acre and Alexandria lay under the map key (the Dome of the Rock photo was lost there): framed east */
  "Crusades and Italian fortunes":S=>VIEW(S,[33.5,36,2]),
  /* the card opened on the right, over the zoom buttons, and Venice was off the globe: framed Venice to Khanbaliq; the
     Japan photo, then off the globe's right edge, and the Catalan Atlas caravan by the zoom buttons (the opening's card
     photo) go */
  "The Mongol road":S=>{DROPPH(S,/^(The Mongols attack Japan|A Catalan Atlas)/);VIEW(S,[74,48,1])},
  /* the card opened on the right and the map key slid left over Constantinople; Messina and Marseille were under it, and
     two photos (Burana and Issyk-Kul) were pushed far from the Chüy valley: framed Marseille to the Chüy; Issyk-Kul goes */
  "The Black Death":S=>{DROPPH(S,/^Lake Issyk/);VIEW(S,[56,41.5,1])},
  /* the Potosí label sat under the card: framed further east and south (the stop's buttons turn the globe round the route) */
  "Silver: the world joins up":S=>VIEW(S,[-35,0,0.95]),
  /* the Ark of Bukhara photo was pushed onto the Merv–Herat ruler (Bukhara is not in this stop's story), and the mountain
     icon covered the Wakhan Corridor label, the swords Merv's */
  "The Great Game":S=>{DROPPH(S,/^The Ark of Bukhara/);DROPIC(S,/^(mountain|swords)$/);VIEW(S,[70.6,35.8,4.5])},
  /* the Strait of Hormuz label was lost and the tanker photo lay on the map key's edge: framed a little wider */
  "The road of black gold":S=>VIEW(S,[54.8,31.9,3.8]),
  /* Baku, "the real prize", lay off the globe's right edge: framed east, Kyiv to Baku; the steppe photo, pushed out into
     the Black Sea, goes (the card shows the steppe) */
  "The road of wheat":S=>{DROPPH(S,/^Ukraine’s steppe/);VIEW(S,[47.4,44,3])},
  /* Kabul and the Bamyan photo lay under the map key; "Iran", "Iraq" and "Afghanistan" labels on long leaders (the map names
     them, and shades them); Kabul's label, which ran to the map key, shortened. The share of the world's oil through Hormuz moves into the stop's guess (it is revealed there) */
  "1979 and after":S=>{DROP(S,/^(Iran|Iraq|Afghanistan)$/);RENAME(S,/^Kabul: Soviet invasion/,"Kabul: Soviet invasion, 1979");RE(S,"more"," About a fifth of the world’s oil passes through the Strait of Hormuz.","");VIEW(S,[72,30,2.1])},
  /* the Duisburg label hung over the map's switches, Piraeus's was pushed onto Iran and the Malacca photo lay at the bottom
     edge over the toolkit: framed Duisburg to Chongqing; the Malacca photo and the "China" label (the map shades it) go */
  "The new Silk Roads":S=>{DROP(S,/^China$/);DROPPH(S,/^Ships in the Malacca/);VIEW(S,[59.5,42.3,1])}
};
/* card-photo captions that no longer match their photo: geoflock-books-photos.js later gave these stops a new card photo,
   but the tour's own caption for the old one stayed (index.html shows PS_PHOTO_CAP under the card's photo) */
const CAPS={};
/* the card shows the Nestorian Stele (Commons "Nestorian stele 1.jpg"), not the Mogao Caves: the stone the stop's text
   tells of, set up in Chang'an in 781 (Britannica, "Nestorian monument"), now in Xi'an's Forest of Steles museum */
CAPS["bsilkroads|Roads of faith"]="The ‘Nestorian Stele’, set up by Christians in Chang’an in 781";
const setCaps=()=>{try{window.PS_PHOTO_CAP=window.PS_PHOTO_CAP||{};for(const k in CAPS)PS_PHOTO_CAP[k]=CAPS[k]}catch(e){}};
setCaps();setTimeout(setCaps,1500);setTimeout(setCaps,6000);addEventListener("load",()=>setTimeout(setCaps,2000));

FIX.bflat={
  /* three photos (Shanghai's skyline, Shenzhen and the Yangshan containers) were piled on each other by the zoom buttons:
     they go (the China stop has Shenzhen and Yangshan; the card shows Shanghai); Friedman's portrait at Bangalore and the tech park's photo
     lay by the map key, and the Berlin Wall photo at the globe's top edge: framed east and closer, Bangalore to Shanghai (the Wall
     has its own stop) */
  "The World Is Flat":S=>{DROPPH(S,/^(Shenzhen|Containers at Yangshan|The Berlin Wall|Shanghai)/);VIEW(S,[105,22,1.2])},
  /* the Electronics City label ran under the map key; an "India" label on a long leader (the map names it) */
  "Bangalore: the field is levelled":S=>{DROP(S,/^India$/);VIEW(S,[84,15,4.2])},
  /* the card opened on the right, over the zoom buttons (every stop's card is locked left below) */
  "Three ages of globalisation":S=>VIEW(S,[-31,49.1,1.4]),
  /* Singapore, the cables' far end, lay under the map key: framed east, Alexandria to Singapore (Bude's label, at the cables'
     European end, then hung over the map's switches at the globe's edge, and goes; the lines still start there) */
  "Fibre under the sea":S=>{DROP(S,/^Bude/);VIEW(S,[90,20,1])},
  /* an "India" label on a long leader by the map key (the map names and shades it) */
  "Y2K: India’s big break":S=>DROP(S,/^India$/),
  /* a "China" label on a long leader (the map names and shades it); Shenzhen and Dongguan sat at the card's edge;
     Geneva, half a world away, is left out of the framing (its label shows when the globe turns there) */
  "China joins the world’s factory floor":S=>{DROP(S,/^China$/);AREA(S,/^Geneva/);VIEW(S,[117,27,2.6])},
  /* Taiwan and the Philippines lay under the map key, Korea's label over the search box and Japan off the globe */
  "The Dell laptop and peace":S=>VIEW(S,[127.9,17.3,1.4]),
  /* Tokyo, the ruler's far end, lay under the map key */
  "Dalian: Japan’s back office":S=>VIEW(S,[136.7,35.7,3]),
  /* Salt Lake City's label hung at the top of the screen and Cape Girardeau's by the map key; a "United States" label
     on a long leader (the map names it) and the US Capitol photo, then off the globe's edge, go */
  "Drive-through orders from far away":S=>{DROP(S,/^United States$/);DROPPH(S,/^The US Capitol/);VIEW(S,[-93.3,37.3,2.5])},
  /* Bihar and Bangalore, half the stop's story, were round the back of the globe: framed from the Sahel to Bihar */
  "The unflat world":S=>VIEW(S,[52.5,18,1.2]),
  /* Barcelona lay under the map key: framed on the Atlantic, Toronto to Barcelona. The phone-call share moves into the
     stop's guess (revealed there) */
  "Is the world really flat?":S=>{RE(S,"stat","found that only about 2% of phone-call minutes were international","asked how much of what we do really crosses borders: guess below");VIEW(S,[-35,46,1.3])}
};

FIX.bspiky={
  /* the card opened on the right and the globe looked down on the North Pole (index.html flew to the middle of pins from
     San Francisco to Tokyo), Tokyo, Shanghai and Hong Kong photos hanging below the globe: framed on the Atlantic, New York
     to London and Lagos; the Asian photos and the San Francisco label go (they have stops of their own) */
  "The World Is Spiky":S=>{DROP(S,/^(San Francisco Bay|Tokyo|Shanghai)$/);DROPPH(S,/^(Shibuya|Shanghai at night|Hong Kong at night)/);VIEW(S,[-12,38,1])},
  /* Tokyo and Shanghai sat by the zoom buttons */
  "Where people are":S=>VIEW(S,[90,25,1]),
  /* the globe looked down from high over the Arctic, the US north-east and Central Africa at its edges: framed on the
     Atlantic (Japan, then at the top edge, is left out of the framing) */
  "Read the lights":S=>{AREA(S,/^Japan$/);VIEW(S,[-12,35,1])},
  /* the Boston photo lay on the zoom buttons */
  "Bos-Wash: one long city":S=>VIEW(S,[-71.4,40,5.5]),
  /* the Shinjuku photo lay on the zoom buttons */
  "Greater Tokyo: the tallest peak":S=>VIEW(S,[138,34,5]),
  /* the card opened on the right, over the zoom buttons, and the banana's labels ran off the globe's left edge */
  "Europe’s banana":S=>VIEW(S,[7.6,47.5,4.2]),
  /* the Seoul photo lay on the zoom buttons and North Korea's label at the top edge */
  "Asia’s rising peaks":S=>VIEW(S,[124.8,30,3.2]),
  /* the stop's turning buttons start on East Asia */
  "Where new ideas come from":S=>VIEW(S,[133,28.3,2]),
  /* an "India" label on a long leader at the globe's edge (the map names it), Bihar's beside it */
  "India: peaks, not a plain":S=>{DROP(S,/^India$/);VIEW(S,[82.8,19.5,3.4])},
  /* the Bay Area label lay under the card */
  "The peaks of science":S=>VIEW(S,[-40,48,1.05]),
  /* the Cairo photo lay by the zoom buttons and Soweto's below the globe: framed a little wider */
  "Africa’s lights":S=>VIEW(S,[28,2,1]),
  /* New York and its Times Square photo lay off the globe's right edge; a "United States" label on a long leader (the map
     names it) */
  "Who’s your city?":S=>{DROP(S,/^United States$/);VIEW(S,[-86,36,1.3])},
  /* the card opened on the right, over the zoom buttons; "United States" and "Canada" labels on long leaders; framed
     a little further east; Toronto's label, which ran under the map key, shortened (Florida has lived there since 2007) */
  "The creative class":S=>{DROP(S,/^(United States|Canada)$/);RENAME(S,/^Toronto: Florida/,"Toronto: Florida’s home");VIEW(S,[-82,39,1.25])},
  /* New York's label hung over the map's switches at the globe's top edge */
  "Peaks pull apart":S=>VIEW(S,[-13,45,1]),
  /* New York lay under the card, Tokyo by the zoom buttons and the Singapore photo by the map key: framed from London to
     Tokyo; New York's label, then over the map's switches at the globe's top edge, and the Singapore photo go (the
     flights still run to New York) */
  "Flat and spiky at once":S=>{DROPPH(S,/^Singapore/);DROP(S,/^New York$/);VIEW(S,[42,35,1])}
};

FIX.bbeagle={
  /* Darwin's portrait (at Plymouth) hung over the search box and the Plymouth and Falmouth labels at the top edge; the
     Ushuaia photo lay below the globe, Table Mountain's by the map key and the tortoise's and Aconcagua's under the card:
     framed a little further south and east; those four photos go (each place has its own stop) */
  "The Voyage of the Beagle":S=>{DROPPH(S,/^(Ushuaia|Table Mountain|A Galápagos giant tortoise|Aconcagua)/);VIEW(S,[-25,15,1])},
  /* the Plymouth, Shrewsbury and Cambridge labels were stacked by the search box */
  "Plymouth, 1831: a young man joins":S=>VIEW(S,[1,32,1.7]),
  /* the Porto Praya label ran under the map key */
  "Cape Verde: rocks that rose":S=>VIEW(S,[-21.8,14.8,6]),
  /* the Salvador label ran under the map key and the Sugarloaf photo lay at the bottom edge; a "Brazil" label on a long
     leader (the map names it) */
  "Bahia: into the rainforest":S=>{DROP(S,/^Brazil$/);VIEW(S,[-37,-17.5,3])},
  /* the Punta Alta label, the stop's own place, ran under the map key: framed east, and the label shortened (the stat
     gives the month); "Argentina" and "Uruguay" labels on long leaders, one by the map key */
  "Giant bones at Punta Alta":S=>{DROP(S,/^(Argentina|Uruguay)$/);RENAME(S,/^Punta Alta: fossils/,"Punta Alta: fossils, 1832");VIEW(S,[-55,-37.5,3.2])},
  /* the Wulaia label ran under the map key and the Falklands' penguin photo lay beside it; "Argentina" and "Chile" labels
     hung far off the globe */
  "Tierra del Fuego":S=>{DROP(S,/^(Argentina|Chile)$/);VIEW(S,[-61,-54.5,3.4])},
  /* the Santa Cruz mouth's label ran to the map key; an "Argentina" label on a long leader */
  "Patagonia: a land that rose":S=>{DROP(S,/^Argentina$/);VIEW(S,[-66.5,-48.5,3])},
  /* a "Chile" label on a long leader at the top */
  "The earthquake at Concepción":S=>DROP(S,/^Chile$/),
  /* "Chile" and "Argentina" labels on long leaders, one by the map key */
  "Seashells on the Andes":S=>DROP(S,/^(Chile|Argentina)$/),
  /* Ecuador's thermometer and label lay at the map key's edge */
  "Galápagos: islands of difference":S=>VIEW(S,[-85,-1.5,3]),
  /* the stop's sailing game draws its own numbered islands: the stop's island labels and four photos lay on top of the
     game's circles (its mockingbirds are in the game's drawer), and its "drag the Beagle" hint ran under the map key */
  "Tortoises, mockingbirds and finches":S=>{DROP(S,/^(Floreana|San Cristóbal|Santiago|Isabela)/);DROPPH(S,/^(A Galápagos giant tortoise|A ground finch|A blue-footed booby|A San Cristóbal mockingbird)/);VIEW(S,[-88.3,-0.6,6])},
  /* Tahiti lay off the globe's right edge, under the map key */
  "Tahiti and New Zealand":S=>VIEW(S,[-168,-28,1.5]),
  /* an "Australia" label on a long leader (the map names it) */
  "Australia: a strange continent":S=>DROP(S,/^Australia$/),
  /* the Bikini photo lay on the zoom buttons: framed wider, Cocos to Enewetak; the
     coral's depth at Enewetak moves into the stop's guess (it is revealed there) */
  "Coral atolls: Cocos (Keeling)":S=>{DROPPH(S,/^Bikini/);RE(S,"more","drilled into Enewetak atoll and hit volcanic rock under more than a kilometre of coral: Darwin was right.","drilled into Enewetak atoll to test Darwin’s idea: if he was right, they would find old coral all the way down to the sunken volcano.");VIEW(S,[134,-4,1.1])},
  /* the Mauritius photo lay by the map key and Falmouth's label at the top: framed east and a little wider; the Mauritius
     photo, still by the key, goes (its label comes back in its place) */
  "Home by the Cape":S=>{DROPPH(S,/^Mauritius/);ADDPIN(S,[[57.5,-20.16],"Mauritius","point"]);VIEW(S,[30,4,1])},
  /* the card opened on the right, over the zoom buttons; London and Ternate are too far apart to show at once (the stop's
     buttons turn the globe between them) */
  "From the Beagle to the Origin":S=>VIEW(S,[0.05,51.33,3])
};


/* Each stop's frame, by tour and title, read once from FIX at load (each fix run on a stand-in stop that has only its
   title), as geoflock-polish-rvt.js does: on a tour's very first launch index.html flies to the opening stop before the
   fixes are applied to it, so psGlobeTarget (wrapped above) finds the frame by title as well. */
const FRAMES={};
for(const t in FIX)for(const k in FIX[t]){try{const D={title:k};FIX[t][k](D);const v=VIEWED.get(D);if(v)FRAMES[t+"|"+k]=v}catch(e){}}
const viewOf=S=>{const v=VIEWED.get(S);if(v)return v;try{return S&&ps&&ps.tour&&FRAMES[ps.tour+"|"+strip(S.title)]}catch(e){return null}};
const applied=new WeakSet();
/* a stop whose photo pins this file edits, and to which geoflock-portraits.js adds a portrait, waits until the portrait
   is in (see XF): if this file locked the field first, the portrait could not be added */
let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left (a tour question could flip it to the right, over the map key) */
 LOCK(S,"card","left");TOUR_OF.set(S,tour);const f=F[strip(S.title)];if(!f){applied.add(S);return}
 PEND=false;try{f(S)}catch(e){console.error("rw1 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rw1-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw1){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw1=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw1-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw1-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw1-new");void e.offsetWidth;e.classList.add("rw1-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw1-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw1-rank"></ol><div class="rw1-pool"></div>'+
  '<div class="rw1-btns"><button type="button" class="rw1-btn rw1-undo">Undo</button><button type="button" class="rw1-btn rw1-show">Show me</button><button type="button" class="rw1-btn rw1-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw1-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw1-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw1-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw1-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw1-ok":"rw1-no"):"")+'"><span class="rw1-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw1-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw1-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw1-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw1-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw1-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw1-show").hidden=L.shown;c.querySelector(".rw1-again").hidden=!L.shown;
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
   a place given a 6th field already has the stop's own label, so it gets the ring only) */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:true,tip:cfg.tip,
 card(L){return'<div class="rw1-btns rw1-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw1-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw1-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw1-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw1-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw1-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw1-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw1-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw1-gq"><input type="range" class="rw1-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw1-gv"></b></div>'+
  '<div class="rw1-btns"><button type="button" class="rw1-btn rw1-chk">Check my guess</button><button type="button" class="rw1-btn rw1-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw1-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw1-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw1-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw1-rng");r.disabled=!!L.done;
  c.querySelector(".rw1-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw1-chk").hidden=!!L.done;c.querySelector(".rw1-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw1-q"><span class="rw1-n"></span><b class="rw1-item"></b></div><div class="rw1-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw1-btn rw1-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw1-btn rw1-next" hidden>Next →</button><button type="button" class="rw1-btn rw1-again" hidden>Start again</button></div><div class="rw1-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw1-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw1-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw1-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw1-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw1-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw1-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw1-good",L.wait&&i===it[1]);b.classList.toggle("rw1-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw1-next").hidden=!(L.wait&&!done);c.querySelector(".rw1-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw1-again").hidden=!done;
  c.querySelectorAll(".rw1-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw1-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw1-y":"rw1-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw1-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw1-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw1-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}


/* ======================================================================== 1. Follow the silver (bsilkroads, Silver: the
   world joins up) The places are the stop's own; the words are the stop's text (Frankopan; da Gama at Calicut 1498; the
   Manila galleons; Chinese demand for silver as tax). The globe can show one ocean at a time, so the buttons turn it. */
const TURN_SILVER=TURNER({tours:["bsilkroads"],title:"Silver: the world joins up",mark:true,
 tip:"Follow the silver round the world: each button turns the globe.",
 places:[["The whole route",-35,0,0.95,"Potosí’s silver went two ways: east over the Atlantic to Spain, and west over the Pacific to Asia."],
  ["Potosí",-65.75,-19.59,2.4,"The silver mountain, in the Andes of today’s Bolivia. Its silver was carried down to the Pacific coast and shipped north.",1],
  ["Seville",-5.99,37.39,3,"The treasure fleets brought American silver home to Spain, which spent much of it on Asia’s goods.",1],
  ["Calicut",75.78,11.25,2.4,"Vasco da Gama sailed round Africa to India’s pepper ports in 1498: Europe could now buy in Asia directly.",1],
  ["Manila",120.98,14.6,2,"From 1571 galleons crossed the Pacific from Acapulco to Manila, where Chinese merchants traded silk and porcelain for silver.",1],
  ["China",113.26,23.13,2,"Much of the silver ended in China, which demanded it for taxes: American silver paid for Asia’s goods."]]});

/* ======================================================================== 2. How much of the world's oil? (bsilkroads,
   1979 and after) US Energy Information Administration, Today in Energy, 16 June 2025, "Amid regional conflict, the Strait
   of Hormuz remains critical oil chokepoint": flows averaged 20 million barrels a day in 2024, about 20% of world petroleum
   liquids consumption. The stop's own "about a fifth" line is taken out of its text (part 1) so the guess comes first. */
const GUESS_HORMUZ=GUESS({tours:["bsilkroads"],title:"1979 and after",
 tip:"Tankers squeeze through the narrow Strait of Hormuz. What share of all the oil the world uses passes through it, do you think?",
 vals:[1,2,5,10,15,20,30,40,50,60],start:2,answer:20,close:1,fmt:v=>v+"%",
 after:"In 2024 about 20 million barrels a day went through, about a fifth of the oil the world uses (US Energy Information Administration). No wonder the powers Frankopan writes about watch this strait so closely."});

/* ======================================================================== 3. The roads in order (bsilkroads, Now explore)
   The tour's own dates: the Royal Road about 500 BC; Zhang Qian 138 BC; Talas 751; Ibn Fadlan 922; plague at Messina 1347;
   Russia takes Merv 1884; oil at Masjed Soleyman 1908; the Belt announced in Astana 2013. Each tap turns the globe there. */
const SORT_SILK=SORT({tours:["bsilkroads"],title:"Now explore",turns:true,
 tip:"2,500 years of roads: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Persia’s Royal Road",-500,"about 500 BC",0,[40.5,35,2.4]],["Zhang Qian sets out west",-138,"138 BC",0,[108.94,34.27,2.4]],
  ["Arab and Tang armies clash at Talas",751,"751",0,[71.4,42.9,2.4]],["Ibn Fadlan meets the Rus on the Volga",922,"922",0,[49.06,54.98,2.4]],
  ["The plague ships reach Messina",1347,"1347",0,[15.55,38.19,2.4]],["Russia takes Merv",1884,"1884",0,[61.84,37.66,2.4]],
  ["Oil struck at Masjed Soleyman",1908,"1908",0,[49.29,31.95,2.4]],["China’s new Silk Road announced in Astana",2013,"2013",0,[71.43,51.13,2.4]]],
 after:(r,N)=>"Silk, faith, furs, plague, empire, oil: the goods changed, but the roads kept running through the same lands in between."});

/* ======================================================================== 4. Turn between the two clocks (bflat, Working
   while America sleeps) New York and Bangalore are about 150° of longitude apart, too far to show at once. The times are
   the stop's own map: 3 a.m. Greenwich time on 20 March, when New York keeps summer time (UTC−4) and India UTC+5:30. */
const TURN_SLEEPS=TURNER({tours:["bflat"],title:"Working while America sleeps",mark:true,
 tip:"New York and Bangalore are half a world apart: turn the globe from one to the other.",
 places:[["The map at the start",10,25,1,"3 a.m. in London: the night side covers the Americas, while the day is beginning in India."],
  ["New York",-74,40.7,2.2,"11 p.m.: offices are dark. Work e-mailed to India now arrives as the day there begins."],
  ["Bangalore",77.59,12.97,2.2,"8.30 in the morning: the working day starts on the files New York sent at bedtime, done by its breakfast.",1]]});

/* ======================================================================== 5. How global are phone calls? (bflat, Is the world
   really flat?) Pankaj Ghemawat, "Actually, the world isn't flat" (TED, 2012) and World 3.0 (2011): only about 2% of
   voice-calling minutes were international (about 6% counting internet calls). The stat's own figure is taken out (part 1)
   so the guess comes first. */
const GUESS_CALLS=GUESS({tours:["bflat"],title:"Is the world really flat?",
 tip:"If the world were flat, calling Mumbai would be as normal as calling the next town. What share of all phone-call minutes are international, do you think?",
 vals:[1,2,5,10,15,20,30,40,50],start:5,answer:2,close:1,fmt:v=>v+"%",
 after:"Only about 2% of voice-calling minutes were international, Ghemawat found (about 6% counting internet calls). Most calls, like most trade and most people, stay close to home: the world is only ‘semi-globalised’."});

/* ======================================================================== 6. The flatteners in order (bflat, Now explore)
   The tour's own dates: Columbus 1492; the first lasting Atlantic cable 1866; the Berlin Wall 9 November 1989; Netscape's
   shares 9 August 1995; the Y2K work before 1 January 2000; China in the WTO 11 December 2001; Nilekani's remark 2004. */
const SORT_FLAT=SORT({tours:["bflat"],title:"Now explore",turns:true,
 tip:"From Globalisation 1.0 to 3.0: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Columbus sails from Palos",1492,"1492",0,[-6.89,37.23,2.4]],["The first lasting Atlantic telegraph cable",1866,"1866",0,[-10.3,51.9,2.4]],
  ["The Berlin Wall comes down",1989,"1989",0,[13.38,52.52,2.4]],["Netscape sells its first shares",1995,"1995",0,[-122.08,37.39,2.4]],
  ["Firms rush to fix the Y2K bug in India",1999,"before 2000",0,[78,20,2.2]],["China joins the WTO",2001,"2001",0,[114.06,22.54,2.4]],
  ["Nilekani: the field is being levelled",2004,"2004",0,[77.59,12.97,2.4]]],
 after:(r,N)=>"First countries, then companies, then people with a computer: Friedman’s three ages of globalisation, one flattener at a time."});

/* ======================================================================== 7. Then and now (bspiky, Where new ideas come from)
   The stop's own clusters. WIPO, Global Innovation Index 2025, science and technology cluster ranking: 1 Shenzhen–Hong
   Kong–Guangzhou, 2 Tokyo–Yokohama, 3 San Jose–San Francisco (Tokyo–Yokohama was first the year before). Florida's 2005
   patent peaks were in the US and Japan (the stop's text). The two sides of the Pacific cannot show at once. */
const TURN_IDEAS=TURNER({tours:["bspiky"],title:"Where new ideas come from",mark:true,
 tip:"Florida’s 2005 peaks against today’s: turn the globe across the Pacific.",
 places:[["East Asia",128,30,1.6,"Today’s tallest idea peaks are here. In WIPO’s 2025 ranking of science and technology clusters, the top two are in East Asia."],
  ["San Jose–San Francisco",-122,37.4,2.6,"Silicon Valley: one of Florida’s 2005 peaks, and third in WIPO’s 2025 ranking, the highest outside East Asia.",1],
  ["Boston–Cambridge",-71.1,42.37,2.6,"Harvard, MIT and their spin-offs: another of the American peaks on Florida’s 2005 map.",1],
  ["Tokyo–Yokohama",139.64,35.44,2.6,"Japan’s great peak in 2005, and still near the top: first in WIPO’s ranking until 2024, second in 2025.",1],
  ["Shenzhen–Hong Kong–Guangzhou",114.06,22.54,2.6,"Barely a peak in 2005; first in WIPO’s 2025 ranking. Peaks can rise, and fast.",1]]});

/* ======================================================================== 8. Bright, dim or dark? (bspiky, Now explore)
   A review of what the tour's stops say about the night lights: Bos-Wash's lights hardly break; South Korea glows end to
   end, North Korea is almost completely dark; the Nile valley shines like a thread and Gauteng glows; Lagos is far dimmer
   than its crowds would suggest; Central Africa is dark. Each answer turns the globe there. */
const BINS_SPIKY=BINS({tours:["bspiky"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"From space at night, which places blaze, which are dim for their crowds, and which are dark?",ask:"Bright, dim for its crowds, or dark?",
 bins:["Bright","Dim for its crowds","Dark"],
 items:[["Boston to Washington",0,"Bright: the lights hardly break for 630 km.",[-74,40.7,3],"Bos-Wash"],
  ["North Korea",2,"Dark: almost no lights, right next to South Korea.",[127,40,3],"North Korea"],
  ["Lagos",1,"Dim for its crowds: one of the world’s biggest cities, far dimmer than its size would suggest.",[3.4,6.45,3],"Lagos"],
  ["The Nile valley",0,"Bright: it shines like a thread through the dark desert.",[31.2,27,3],"The Nile"],
  ["Central Africa",2,"Dark: across much of Africa about 600 million people have no power at home.",[22,0,2.4],"Central Africa"],
  ["South Korea",0,"Bright: it glows from end to end.",[127.8,36.5,3],"South Korea"],
  ["Gauteng, South Africa",0,"Bright: Johannesburg and Pretoria glow.",[28.1,-26,3],"Gauteng"]],
 after:(r,N)=>(r===N?"All right. ":"")+"Light follows money, not just people: Florida’s spikes, seen from space."});

/* ======================================================================== 9. How deep is the coral? (bbeagle, Coral atolls:
   Cocos (Keeling)) The 1952 drill holes at Enewetak reached volcanic rock at about 1.27 km (Parry Island) and 1.41 km
   (Elugelab) below the surface (USGS: Ladd and Schlanger, Professional Paper 260-Y, 1960; and the 1952 seismic study
   quoting the drill depths, 4,170 and 4,610 ft). The stop's own "more than a kilometre" is taken out (part 1). */
const GUESS_CORAL=GUESS({tours:["bbeagle"],title:"Coral atolls: Cocos (Keeling)",
 tip:"Reef corals grow only in the top few tens of metres of the sea. In 1952 drills went down through Enewetak atoll: how deep was the coral rock before they hit the old volcano, do you think?",
 vals:[0.01,0.05,0.1,0.25,0.5,1,1.4,2,5],start:2,answer:1.4,close:1,fmt:v=>v<1?Math.round(v*1000)+" m":v.toLocaleString("en-GB")+" km",
 after:"The deepest hole hit volcanic rock about 1.4 km down (the other about 1.3 km). Coral that grew in shallow water now lies over a kilometre deep: the island sank, and the coral kept growing up, just as Darwin said."});

/* ======================================================================== 10. Two men, one idea (bbeagle, From the Beagle to
   the Origin) The stop's own places and dates: Down House from 1842; Wallace's letter from Ternate, 1858; the papers read
   at the Linnean Society, London, 1 July 1858; the Origin 24 November 1859. */
const TURN_ORIGIN=TURNER({tours:["bbeagle"],title:"From the Beagle to the Origin",mark:true,
 tip:"Two naturalists on opposite sides of the world: turn the globe between them.",
 places:[["Down House",0.05,51.33,3,"Darwin’s home from 1842. He had the idea of natural selection by 1838, and spent 20 years testing it.",1],
  ["Ternate",127.38,0.79,2.4,"In 1858 Alfred Russel Wallace, collecting in the islands of south-east Asia, sent Darwin a letter with the same idea.",1],
  ["London",-0.13,51.51,3,"1 July 1858: both men’s papers were read together at the Linnean Society. The Origin followed on 24 November 1859.",1]]});

/* ======================================================================== 11. The voyage in order (bbeagle, Now explore)
   The tour's own dates: Cape Verde January 1832; Bahia 28 February 1832; Punta Alta September 1832; Wulaia January 1833;
   up the Santa Cruz May 1834; Concepción 20 February 1835; the Galápagos 15 September 1835; Sydney January 1836;
   Falmouth 2 October 1836. Each tap turns the globe there. */
const SORT_BEAGLE=SORT({tours:["bbeagle"],title:"Now explore",turns:true,
 tip:"Five years round the world: put the Beagle’s stops in order. Each one you tap turns the globe there.",
 first:"First",last:"Last",bars:false,
 items:[["Cape Verde: seashells in a cliff",1,"January 1832",0,[-23.51,14.92,2.4]],["Bahia: into the rainforest",2,"February 1832",0,[-38.51,-12.97,2.4]],
  ["Punta Alta: giant bones",3,"September 1832",0,[-62.07,-38.88,2.4]],["Tierra del Fuego: the Fuegians go home",4,"January 1833",0,[-68.15,-55.05,2.4]],
  ["Up the Santa Cruz river",5,"May 1834",0,[-71.2,-50.2,2.4]],["The earthquake at Concepción",6,"February 1835",0,[-73.05,-36.83,2.4]],
  ["The Galápagos",7,"September 1835",0,[-90.5,-0.7,2.4]],["Sydney",8,"January 1836",0,[151.21,-33.86,2.4]],["Home to Falmouth",9,"October 1836",0,[-5.07,50.15,2.4]]],
 after:(r,N)=>"From Bahia (February 1832) to the Galápagos (October 1835): over three and a half of the five years were spent round South America, whose coasts the Beagle had come to chart."});


const DEFS=[TURN_SILVER,GUESS_HORMUZ,SORT_SILK,TURN_SLEEPS,GUESS_CALLS,SORT_FLAT,TURN_IDEAS,BINS_SPIKY,GUESS_CORAL,TURN_ORIGIN,SORT_BEAGLE];


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw1-layer rw1-layer";el.innerHTML='<svg class="rw1-sv"><defs><clipPath id="rw1Disc"><path class="rw1-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw1Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw1-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw1-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw1-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw1-ctl";
 c.innerHTML='<div class="rw1-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw1-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw1-ctl"))unmount()}catch(e){}},300);
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
.rw1-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw1-sv{position:absolute;left:0;top:0;overflow:visible}
.rw1-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw1-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw1-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw1-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw1-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw1-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw1-btn[hidden]{display:none}
.rw1-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw1-ep b{display:block;font-size:15px}
.rw1-ep.rw1-new{animation:rw1In .45s ease}@keyframes rw1In{from{opacity:.2;transform:translateY(4px)}}
.rw1-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw1-sortq i{font-style:normal}
.rw1-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw1}
.rw1-rank li{position:relative;counter-increment:rw1;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw1-rank li::before{content:counter(rw1);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw1-rank li.rw1-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw1-rank li.rw1-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw1-nm{flex:1 1 auto;z-index:1}.rw1-v{z-index:1;font-weight:800;white-space:nowrap}
.rw1-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw1-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw1-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw1-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw1-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw1-do,:is(body.dark-theme,body.sky-night) .rw1-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw1-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw1-btn,:is(body.dark-theme,body.sky-night) .rw1-chip,:is(body.dark-theme,body.sky-night) .rw1-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw1-rank li.rw1-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw1-rank li.rw1-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw1-bar{background:rgba(255,178,122,.2)}
.rw1-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw1-rng{flex:1 1 auto;accent-color:#d9682b}.rw1-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw1-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw1-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw1-item{font-size:16px;color:#13294b}
.rw1-bins{display:flex;gap:6px;flex-wrap:wrap}.rw1-bins .rw1-btn[hidden]{display:none}.rw1-bin:disabled{cursor:default;opacity:.55}
.rw1-btn.rw1-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw1-btn.rw1-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw1-dots{display:flex;gap:4px;margin-top:8px}.rw1-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw1-dots i.rw1-now{box-shadow:0 0 0 2px #d9682b inset}.rw1-dots i.rw1-y{background:#1f8a4c}.rw1-dots i.rw1-x{background:#c2364f}
.rw1-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw1-sl .rw1-row{margin-top:2px}.rw1-sl .rw1-val{min-width:36px}
.rw1-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw1-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw1-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw1-out b{font-size:15px;color:#9a4a16}
.rw1-ch{display:block;width:100%;height:auto;margin-top:6px}.rw1-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw1-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw1-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw1-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw1-val,:is(body.dark-theme,body.sky-night) .rw1-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw1-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw1-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw1-n,:is(body.dark-theme,body.sky-night) .rw1-sl label,:is(body.dark-theme,body.sky-night) .rw1-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw1-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw1-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw1-dots i{background:rgba(255,255,255,.18)}
.rw1-btn.rw1-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw1-btn.rw1-cur{background:#9fc3ff;color:#13294b}
.rw1-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw1-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw1-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw1-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw1-ep b .rw1-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw1-ep b .rw1-km{color:#ffb27a}
.rw1-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw1-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw1-small{font-size:11.5px!important;padding:2px 7px!important}
.rw1-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw1-gq .rw1-rng{flex:1 1 auto}.rw1-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw1-julh{fill:#c2364f}.rw1-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw1-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw1-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw1-gv{color:#ffb27a}
.rw1-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw1-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw1-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw1-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw1-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw1-clk{font-size:18px}.rw1-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw1-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw1-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw1-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw1-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw1-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw1-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw1-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw1-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw1-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw1-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw1-pig{color:#1f8a4c}
.rw1-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw1-mlg line,.rw1-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw1-mlg .rw1-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw1-mlg line,:is(body.dark-theme,body.sky-night) .rw1-mlg path,:is(body.dark-theme,body.sky-night) .rw1-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw1-mlg .rw1-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw1-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw1-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw1-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw1-pig{color:#4cc27f}
.rw1-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw1-kbw{fill:#7fb3e0}
.rw1-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw1-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw1-kbb.rw1-kbok{stroke:#f2b33d}.rw1-kbb.rw1-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw1-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw1-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw1-ctl .rw1-btn.rw1-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw1-ctl .rw1-btn.rw1-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw1-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw1={v:1,FIX,XFS,viewOf,tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
