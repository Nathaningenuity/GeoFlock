/* GeoFlock polish RW-6: a stop-by-stop review of five tours, Oceania (oceania) and the history tours The modern world
   (hmodern), Asia through time (hasia), Africa through time (hafrica) and North America through time (hnamerica), each
   looked at on its default map at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   The engine is geoflock-polish-rw4.js's, under "rw6" names so the files never touch each other's controls: frames
   looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here gets exactly its frame; fixed fields
   are non-configurable getters whose setters are ignored (a field already non-configurable is left alone). Pin lists are
   filtered through getters, photo pins wait for geoflock-portraits.js's portraits, and a stop whose photos are dropped
   gets its photo squares rebuilt. CSS classes start with "rw6-". Everything is wrapped in try/catch; Next and Back are
   never blocked. */

(function(){
"use strict";
if(window.gfPolishRw6)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw6Test or ?rw6test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw6Test||/[?&]rw6test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* the card's side: on the history tours a fixed, non-configurable getter (a stop's question switched the card to the
   right at run time otherwise, as geoflock-polish-rvm.js found); on Oceania a getter that stays configurable, since
   geoflock-tourfix-drag.js redefines some of its stops' card fields on every stop change, and a field it cannot redefine
   stops the rest of its pass */
const LOCKC=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;if(d&&d.get&&d.get._rw6&&S[k]===v)return;
 const gt=()=>v;gt._rw6=1;Object.defineProperty(S,k,{configurable:TOUR_OF.get(S)==="oceania"||!!window.__rw6Test,enumerable:true,get:gt,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rw6Test||/[?&]rw6test\b/.test(location.search)),enumerable:true,
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
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);VIEWED.set(S,g);LOCKC(S,"card",card||"left")};
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw6)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw6,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw6=1;window.psGlobeTarget=w}catch(e){}})(0);
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

FIX.oceania={
  /* Australia lay under the card and most of Polynesia (Samoa, Tonga, the Cook Islands) was round the globe's edge:
     framed further east, Australia to Samoa */
  "Oceania":S=>VIEW(S,[162,-14,1.15]),
  /* the Moon (geoflock-polish-rvd.js) started on top of Australia, hiding the city photos, though the card says to drag
     it onto Australia: it starts in the open ocean west of Australia, beside it; framed a little east, so Brisbane clears the map key */
  "Australia is most of it":S=>{VIEW(S,[133,-25,1.05]);try{const d=S.drag;if(d&&d.kind==="moon"&&!d._rw6){d.at=[103,-4];d._rw6=1}}catch(e){}},
  /* Alice Springs' label was pushed far south into the Southern Ocean and Uluru's photo onto Alice Springs' leader: the
     shading of the whole of Australia kept them off the land (the label placer keeps labels off a stop's shaded
     countries, as @@RW6FILE@@ found). The shading goes */
  "The red centre":S=>NOSHADE(S),
  /* "North of the line: too dry to farm" was pushed south of the line into the Great Australian Bight, and Orroroo's
     label into Spencer Gulf, off shaded Australia: the shading goes */
  "Goyder’s Line":S=>NOSHADE(S),
  /* the Dog Fence's and the sheep country's labels were pushed off shaded Australia into the sea, and the platypus,
     koala and wombat photos lay under the map key or off the globe's bottom edge: shading off, framed a little east
     and wider */
  "Only in Australia":S=>{NOSHADE(S);VIEW(S,[146,-30,1.6])},
  /* two Italys: the stop's own, to drag, and a second grey one on top of the reef from geoflock-tourplay.js (which
     geoflock-polish-rvd.js meant to remove; the field was set again later): only the stop's own stays. Australia's
     shading kept Cairns' label far from it: the shading goes */
  "The Great Barrier Reef":S=>{if((S.ghosts||[]).length)LOCK(S,"drag",null);NOSHADE(S)},
  /* the Canberra photo was pushed off the land into the Tasman Sea, off shaded Australia: the shading goes, and so does
     the photo (the card shows the same Parliament House); a plain "Canberra" label marks the city */
  "A capital in the bush":S=>{NOSHADE(S);DROPPH(S,/^Canberra/);ADDPIN(S,[[149.13,-35.28],"Canberra","point"])},
  /* Hunga Tonga's label hung far above its volcano, kept off shaded Tonga, and the ash cloud's photo
     (the card's own photo) sat on Nukuʻalofa: the shading and the photo go */
  "The biggest blast in a century":S=>{NOSHADE(S);DROPPH(S,/^The ash cloud/)},
  /* the card sat on the right, over the zoom buttons and Kiritimati, and the Tarawa photo lay under the map key moved to
     the left: the card goes back to the left, framed between Tarawa and Kiritimati. A "Kiribati" label sat on Kiritimati's photo
     (the map names the country): it goes */
  "All four hemispheres":S=>{DROP(S,/^Kiribati$/);VIEW(S,[-165,0,1.6])},
  /* Tuvalu, the stop's subject, lay at the globe's edge by the map key: framed on Tuvalu */
  "Tuvalu’s lucky letters":S=>VIEW(S,[-178,-5,2.66]),
  /* Nauru lay at the globe's top edge by the zoom buttons: framed further north */
  "The smallest island country":S=>VIEW(S,[163,-15,1.6]),
  "Now explore":S=>VIEW(S,[165,-12,1.15])
};


FIX.hasia={
  /* the Terracotta Army photo hung at the globe's edge by the zoom buttons and Borobudur's off its bottom right: framed
     further east */
  "Asia’s story":S=>VIEW(S,[114,22,1]),
  /* the Badaling photo hung at the globe's edge over the zoom buttons and a "China" label on a long leader at its bottom
     edge (the map names the empire): framed a little east, the label goes. The stat's figure moves into the stop's
     guess (revealed there) */
  "The emperor’s clay army":S=>{DROP(S,/^China$/);VIEW(S,[118,38,2.63]);RE(S,"stat","was buried with about 8,000 life-size clay soldiers","was buried with an army of life-size clay soldiers: guess below how many")},
  /* the Harappa and Mohenjo-daro photos hung at the globe's right edge, under the map buttons: framed further east */
  "The first cities":S=>VIEW(S,[66,28,1.6]),
  /* Nara, where the arrows end, was at the globe's edge under the map key: framed further east */
  "Buddhism spreads":S=>VIEW(S,[108,20,1.18]),
  /* Luoyang, where the arrows end, was off the globe's right edge, and the Bamiyan photo's label was cut to "Buddhas":
     framed further east, the label shortened to the place */
  "When the Buddha looked Greek":S=>{PHLABEL(S,/^Bamiyan/,"Bamiyan");VIEW(S,[90,36,1.8])},
  /* the card was on the right, over the zoom buttons, and the globe had turned to the Pacific, with Spain, where the
     stat begins, round the back; a "Saudi Arabia" label hung on Mecca's photo (the map names the land): the card goes
     left, framed from Spain to the Indus, the label goes. Only Saudi Arabia was shaded, with the key calling it the
     Umayyad Caliphate, which stretched from Spain to the Indus: the shading goes, and the map's own borders of 700 show
     the caliphate */
  "Islam’s rapid spread":S=>{DROP(S,/^Saudi Arabia$/);NOSHADE(S);VIEW(S,[40,28,1])},
  /* today's "Thailand", "Laos", "Vietnam" and "Cambodia" labels hung on long leaders (one under the map key), over the
     map's own names and the Khmer Empire's: they go */
  "Angkor":S=>DROP(S,/^(Thailand|Laos|Vietnam|Cambodia)$/),
  /* "North Korea" and "South Korea" labels, on a map of 1453, covered the kingdom's own name, Joseon, and "Japan" and
     "Vietnam" labels hung under the zoom buttons and off the globe: they go */
  "An alphabet invented by a king":S=>DROP(S,/^(North Korea|South Korea|Japan|Vietnam)$/),
  /* the card was on the right, over the zoom buttons: it goes left, framed on India */
  "The Mughals":S=>VIEW(S,[84,24,1.8]),
  /* the Edo photo hung at the globe's edge by the zoom buttons, beside a "Japan" label (the map names it): framed a
     little east, the label goes */
  "Japan closes, then opens":S=>{DROP(S,/^Japan$/);VIEW(S,[139,34.5,3.6])},
  /* the card was on the right, and Calcutta, where the arrow starts, was off the globe; "China" and "Hong Kong (China)"
     labels on leaders repeated the map key and the photo: the card goes left, framed from Calcutta to Shanghai, the
     labels go, and so does Shanghai's text label, a second label beside its photo */
  "Opium and Hong Kong":S=>{DROP(S,/^(China|Hong Kong \(China\)|Shanghai: opened 1842)$/);VIEW(S,[113,24,1.9])},
  /* the card was on the right, over the zoom buttons: it goes left, framed on India */
  "Gandhi and the princes":S=>VIEW(S,[80,23,2.33]),
  /* "Vietnam" and "Cambodia" labels on long leaders (the map names them; "Vietnam" pointed at the North): they go */
  "The Vietnam War":S=>DROP(S,/^(Vietnam|Cambodia)$/),
  /* Japan, the first "miracle", lay at the globe's edge by the map key, and Hong Kong was labelled "(China)" on a map of
     1970, when it was British: framed further east, the label is plain "Hong Kong"; Tokyo's photo, under the zoom buttons beside its own label, goes. Singapore, the stat's subject, had no label: it
     gets one */
  "Asian miracles":S=>{RENAME(S,/^Hong Kong \(China\)$/,"Hong Kong");DROPPH(S,/^Tokyo/);ADDPIN(S,[[103.82,1.35],"Singapore","point"]);VIEW(S,[126,20,1.45])},
  /* the card was on the right, over Afghanistan and the zoom buttons: it goes left, framed from Iran to Afghanistan */
  "1979: a turning year":S=>VIEW(S,[64,33,2.6]),
  "Now explore":S=>VIEW(S,[95,28,1])
};

FIX.hafrica={
  /* the opening photo, labelled "Fort Jesus, Mombasa", hung from Timbuktu (each place has a stop of its own): it goes;
     framed a little west, so the Horn of Africa clears the map buttons */
  "Africa’s history":S=>{DROPPH(S,/^(Timbuktu|Fort Jesus)/);VIEW(S,[14,3,1.04])},
  /* the Jebel Irhoud skull's photo was labelled only "300,000 years" and hung at the globe's top edge, and Hadar's
     label at its right edge by the map buttons: framed a little wider, the photo named */
  "Where we began":S=>{PHLABEL(S,/^Jebel Irhoud/,"Jebel Irhoud");VIEW(S,[22,4,1.15])},
  /* an "Egypt" label hung on a long leader over the map's own "Egypt" */
  "Abu Simbel":S=>DROP(S,/^Egypt$/),
  /* a "Sudan" label hung on a long leader (the stop is about Kush, named on the map as Meroë) */
  "Kush against Rome":S=>DROP(S,/^Sudan$/),
  /* Taghaza, the salt town the stop is named for, was not on the map: it gets a pin (Wikipedia, "Taghaza": 23°36′N
     5°00′W) */
  "A town built of salt":S=>ADDPIN(S,[[-5,23.6],"Taghaza: houses of salt","point"]),
  /* Mecca, where the pilgrimage went, was round the globe's edge and the Cairo photo lay on the zoom buttons: framed
     further east, Mali to Mecca */
  "Mansa Musa’s gold":S=>VIEW(S,[26,22,1.15]),
  /* the Oman photo lay on the zoom buttons, Gujarat round the globe's edge, and Kilwa and the dhow photo off its bottom
     edge: framed east and wider, from Kilwa to Gujarat */
  "The Swahili coast":S=>VIEW(S,[52,2,1.25]),
  /* the photo of Porto-Novo, capital of the other Benin, was labelled only "Great Mosque" */
  "Two Benins":S=>PHLABEL(S,/^Porto-Novo/,"Porto-Novo, Benin’s capital"),
  /* Ouidah and Luanda, where the ships left from, lay at the globe's right edge by the map buttons: framed a little
     east */
  "What the slave trade cost Africa":S=>VIEW(S,[-22,2,1]),
  /* the globe turned to the middle of the Sahara, with the Cape, the stop's subject, at its bottom edge and its photo
     off it, and Batavia round the back: the stop's buttons turn the globe along the Company's route (Batavia is left
     out of the opening frame), and the garden's photo, the card's own plan of 1727 again, hung off the globe's bottom
     edge: it goes */
  "A colony that began as a vegetable garden":S=>{AREA(S,/^Batavia/);DROPPH(S,/^Cape Town/);VIEW(S,[24,-27,1.5])},
  /* the Leopold cartoon's label was cut to "Cartoon of King": it is named */
  "Carving up Africa":S=>PHLABEL(S,/^Congo/,"Leopold’s Congo"),
  /* a "South Africa" label on a leader (the map names it) and Venda's at the globe's edge by the map buttons: the label
     goes, framed a little east */
  "Apartheid’s fake countries":S=>{DROP(S,/^South Africa$/);VIEW(S,[28.5,-28,3.8])},
  /* a "Rwanda" label sat on the map's own "Rwanda" */
  "Rwanda, 1994":S=>DROP(S,/^Rwanda$/),
  "Now explore":S=>VIEW(S,[18,3,1.04])
};

FIX.hnamerica={
  /* a Fort Sumter photo hung from Florida on the opening map, and after it a Viñales Valley photo from Cuba (each has a
     stop or a tour of its own): they go; framed a little east, so the west coast clears the card */
  "North America’s history":S=>{DROPPH(S,/^(Fort Sumter|Cuba|Viñales)/);VIEW(S,[-92,40,1])},
  /* the White Sands footprints, the stat's subject, were round the globe's edge: framed between Beringia and New
     Mexico */
  "The first Americans":S=>VIEW(S,[-128,48,1.1]),
  /* La Venta, the Tuxtla mountains and El Manatí, all within about 1°, had their labels pushed out round the Olmec
     name: framed closer */
  "The rubber people":S=>VIEW(S,[-94.6,18,8]),
  /* a "United States" label (and the whole country shaded) on a map of 1100, and Cahokia far away in a wide view: the
     shading and the label go, framed on the Mississippi */
  "Cahokia":S=>{NOSHADE(S);DROP(S,/^United States$/);VIEW(S,[-89,38.6,3.4])},
  /* today's "Mexico" label hung on a long leader on the map of 1500 */
  "The Aztecs":S=>DROP(S,/^Mexico$/),
  /* the San Salvador photo, the card's own painting again, was pushed off its island onto Cuba (Columbus's portrait
     marks the landing): it goes */
  "The Taíno meet Columbus":S=>DROPPH(S,/^San Salvador/),
  /* today's "Mexico" label hung on a leader on the map of 1500 */
  "Cortés and the smallpox":S=>DROP(S,/^Mexico$/),
  /* St Augustine, the stat's subject, was off the globe's right edge: framed further east */
  "Spain in the US":S=>VIEW(S,[-94,32,1.8]),
  /* the card was on the right, over the zoom buttons: it goes left, framed on the coast */
  "Thirteen colonies":S=>VIEW(S,[-73,40,3]),
  /* St Louis sat at the globe's right edge and New Orleans' photo at its bottom edge: framed a little east */
  "The Louisiana Purchase":S=>VIEW(S,[-93,38,2.2]),
  /* New York, the city the canal made, was not named on the map, where the Hudson's arrow ends: it gets a label. Philadelphia's, 130 km away, pushed it off its place, and goes (the card names the city) */
  "The canal that made New York":S=>{ADDPIN(S,[[-74.01,40.71],"New York","point"]);DROP(S,/^Philadelphia$/);VIEW(S,[-75.6,41.7,6.2])},
  /* the Cherokee homeland's photo sat at the globe's edge by the map buttons: framed a little east */
  "The Trail of Tears":S=>VIEW(S,[-86,34.5,3.6]),
  /* today's "Mexico" label hung on a leader over the map's own name, and Texas, part of the land lost, lay at the
     globe's edge: the label goes, framed a little east (the Mexico City photo, then cut off at the globe's bottom
     edge, goes too) */
  "Mexico loses half":S=>{DROP(S,/^Mexico$/);DROPPH(S,/^Mexico City/);VIEW(S,[-103,31,2.4])},
  /* the Gettysburg photo lay on the zoom buttons and Lincoln's portrait out at sea: framed a little east */
  "The Civil War":S=>VIEW(S,[-83,36,2.08]),
  /* the card was on the right and Sacramento, where the line starts, was off the globe: the card goes left, framed
     coast to coast */
  "Coast to coast by rail":S=>VIEW(S,[-106,40,2.7]),
  /* the card was on the right, over Ottawa: it goes left, framed from Alaska to Ottawa. Ottawa's photo, half a
     continent from Alaska, hung by the map buttons whatever the frame: a plain label marks the new capital instead */
  "1867: two big deals":S=>{DROPPH(S,/^Ottawa/);ADDPIN(S,[[-75.7,45.42],"Ottawa","point"]);VIEW(S,[-108,54,1.05])},
  /* Cape Horn's label was cut off at the globe's bottom edge: framed further south */
  "Digging the Panama Canal":S=>VIEW(S,[-64,-20,1]),
  /* a "United States" label sat on the map's own, Guam's and the Northern Marianas' hung behind the card, and American
     Samoa's and the Virgin Islands' at the globe's edges: those go, and Puerto Rico's label loses its "(United States)"
     (the key says the pale places are US territories) */
  "A superpower":S=>{DROP(S,/^(United States|Guam|Northern Mariana|American Samoa|U\.S\. Virgin)/);RENAME(S,/^Puerto Rico/,"Puerto Rico");VIEW(S,[-95,30,1])},
  "Now explore":S=>VIEW(S,[-92,40,1])
};
/* The modern world (hmodern) is retired (geoflock-tourshelves.js takes it off the shelves; its stops live on in the
   world wars, Cold War and since-1991 tours): nothing here */
FIX.hmodern={};


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
 LOCKC(S,"card","left");TOUR_OF.set(S,tour);const f=F[strip(S.title)];if(!f){applied.add(S);return}
 PEND=false;try{f(S)}catch(e){console.error("rw6 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}
 /* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when ps.tour changes */
 applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey&&!waiting)return;lastKey=k;waiting=false;
 /* and once more on the stop itself, in case another file re-set a field after the first pass */
 try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f){TOUR_OF.set(S,t);f(S)}}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins; the fixes go in when one
   of these tours opens). Only the card side is locked at load, so a tour's first stop already opens with its card on
   the left. */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S){TOUR_OF.set(S,t);LOCKC(S,"card","left")}})})}catch(e){}};
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
 if(document.querySelector(".rw6-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw6){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw6=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw6-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw6-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw6-new");void e.offsetWidth;e.classList.add("rw6-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw6-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw6-rank"></ol><div class="rw6-pool"></div>'+
  '<div class="rw6-btns"><button type="button" class="rw6-btn rw6-undo">Undo</button><button type="button" class="rw6-btn rw6-show">Show me</button><button type="button" class="rw6-btn rw6-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;/* (rw6) and not "given up": a card rebuilt after "Show me" starts afresh */L.gave=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw6-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw6-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw6-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw6-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw6-ok":"rw6-no"):"")+'"><span class="rw6-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw6-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw6-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw6-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw6-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw6-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw6-show").hidden=L.shown;c.querySelector(".rw6-again").hidden=!L.shown;
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
 card(L){return'<div class="rw6-btns rw6-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw6-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw6-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw6-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw6-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw6-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q&&f[5]!==2){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw6-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw6-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14);
  /* (rw6) a place may name its own towns, f[6] = [[lon, lat, name]], each a dot and a name tag once the globe is there */
  L.tgs=L.tgs||[];const T6=f[6]||[];T6.forEach((t,k)=>{if(!L.tgs[k])L.tgs[k]=tag(L,"rw6-ctag rw6-small");const p=proj(L,[t[0],t[1]]);if(p)svgEl(L.svg,"circle",{cx:p[0],cy:p[1],r:4.5,class:"rw6-tdot"});putTag(L,L.tgs[k],p,esc(t[2]),9)});
  for(let k=T6.length;k<L.tgs.length;k++)putTag(L,L.tgs[k],null)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw6-gq"><input type="range" class="rw6-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw6-gv"></b></div>'+
  '<div class="rw6-btns"><button type="button" class="rw6-btn rw6-chk">Check my guess</button><button type="button" class="rw6-btn rw6-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw6-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw6-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw6-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw6-rng");r.disabled=!!L.done;
  c.querySelector(".rw6-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw6-chk").hidden=!!L.done;c.querySelector(".rw6-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw6-q"><span class="rw6-n"></span><b class="rw6-item"></b></div><div class="rw6-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw6-btn rw6-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw6-btn rw6-next" hidden>Next →</button><button type="button" class="rw6-btn rw6-again" hidden>Start again</button></div><div class="rw6-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw6-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw6-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw6-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw6-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw6-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw6-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw6-good",L.wait&&i===it[1]);b.classList.toggle("rw6-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw6-next").hidden=!(L.wait&&!done);c.querySelector(".rw6-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw6-again").hidden=!done;
  c.querySelectorAll(".rw6-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw6-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw6-y":"rw6-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw6-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw6-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw6-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}




/* ---------------- a sorting game that rings each place it turns the globe to ----------------
   as SORT (above), each item's 5th field [lon, lat, zoom] the place a tap turns the globe to and its 6th field the name
   tagged there; the place of the last item tapped gets a ringed dot and its name */
function SORTM(cfg){const D=SORT(cfg);D.globe=true;const r0=D.render;
 D.render=function(L){r0.call(this,L);L.dirty=1};
 D.draw=function(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw6-ctag");const k=L.order&&L.order.length&&!L.gave?L.order[L.order.length-1]:null,it=k==null?null:cfg.items[k],
  q=it&&it[4]?proj(L,[it[4][0],it[4][1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw6-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw6-tdot"})}putTag(L,L.tg,q,esc(it&&it[5]||""),14)};
 return D}

/* ======================================================================== 1. Three island worlds (oceania, Now explore)
   Which group is each island country in? The groups are the tour's own (stops "Oceania" and "The Polynesian
   triangle": Melanesia includes New Guinea, the Solomon Islands, Vanuatu and Fiji; Micronesia Palau, Guam, the Marshall
   Islands, Kiribati and Nauru; Polynesia the triangle, Samoa, Tonga, Tuvalu, New Zealand and Hawaii). Each answer turns
   the globe to the country's capital. */
const BINS_OCE=BINS({tours:["oceania"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Melanesia, Micronesia or Polynesia? Sort the island countries; each answer turns the globe there.",ask:"Which island world is it in?",
 bins:["Melanesia","Micronesia","Polynesia"],
 items:[["Samoa",2,"Samoa lies inside the Polynesian triangle.",[-171.76,-13.83,2.4],"Samoa"],
  ["Palau",1,"Palau is one of the “small islands” far to the north-west.",[134.48,7.5,2.4],"Palau"],
  ["Fiji",0,"Fiji is usually counted in Melanesia, though its people share a lot with Tonga and Samoa.",[178.44,-18.14,2.4],"Fiji"],
  ["Tuvalu",2,"Tuvalu’s atolls are Polynesian.",[179.19,-8.52,2.4],"Tuvalu"],
  ["Solomon Islands",0,"The Solomons lie east of New Guinea, in Melanesia.",[159.95,-9.43,2.4],"Solomon Islands"],
  ["Marshall Islands",1,"The Marshalls are low atolls in Micronesia.",[171.38,7.09,2.4],"Marshall Islands"],
  ["Tonga",2,"Tonga is Polynesian, near the triangle’s western side.",[-175.2,-21.14,2.4],"Tonga"],
  ["Guam",1,"Guam, a US territory, is in Micronesia.",[144.79,13.44,2.4],"Guam"],
  ["Vanuatu",0,"Vanuatu is in Melanesia, between the Solomons and New Caledonia.",[168.32,-17.73,2.4],"Vanuatu"],
  ["Nauru",1,"Tiny Nauru is in Micronesia, just south of the equator.",[166.93,-0.53,2.4],"Nauru"],
  ["New Zealand",2,"Aotearoa New Zealand is the triangle’s south-western corner.",[174.78,-41.29,2.2],"New Zealand"],
  ["Papua New Guinea",0,"New Guinea is the heart of Melanesia.",[147.18,-9.44,2.2],"Papua New Guinea"]],
 after:(r,N)=>(r===N?"All right! ":"")+"Polynesia is the big triangle, Micronesia the small islands, most of them north of the equator, and Melanesia the bigger, higher islands from New Guinea to Fiji."});


/* ======================================================================== 2. How big an army? (hasia, The emperor's clay
   army) Wikipedia, "Terracotta Army": "Estimates from 2007 were that the three pits containing the Terracotta Army hold
   more than 8,000 soldiers"; found on 29 March 1974 by farmers digging a well. The stat's figure is taken out (part 1)
   so the guess comes first. */
const GUESS_CLAY=GUESS({tours:["hasia"],title:"The emperor’s clay army",
 tip:"China’s first emperor was buried with an army of life-size clay soldiers. How many, do you think?",
 vals:[80,300,800,2000,8000,30000],start:2,answer:8000,close:0,fmt:v=>"about "+v.toLocaleString("en-GB"),
 after:"More than 8,000, each with its own face, in three pits beside the tomb. Farmers digging a well found the first of them in March 1974."});

/* ======================================================================== 3. Asia in order (hasia, Now explore) The
   tour's own dates; each tap turns the globe there and names the place. */
const SORT_ASIA=SORTM({tours:["hasia"],title:"Now explore",turns:true,
 tip:"Five thousand years of Asia: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Writing is invented in Sumer",-3200,"about 3200 BC",0,[45.64,31.32,2.4],"Uruk"],["Qin Shi Huang unites China",-221,"221 BC",0,[109.27,34.38,2.2],"Xi’an"],
  ["Muslim armies reach Sindh",711,"711",0,[67.5,24.8,2.4],"Sindh"],["Angkor Wat is built",1110,"early 1100s",0,[103.87,13.41,2.4],"Angkor"],
  ["King Sejong’s alphabet, Hangul",1443,"1443",0,[126.98,37.57,2.4],"Seoul"],["Babur founds the Mughal Empire",1526,"1526",0,[76.97,29.39,2.4],"Panipat"],
  ["Japan shuts out most foreigners",1635,"1630s",0,[129.85,32.74,2.4],"Dejima, Nagasaki"],["Britain takes Hong Kong Island",1842,"1842",0,[114.17,22.3,2.4],"Hong Kong"],
  ["Oil is struck in Bahrain",1932,"1932",0,[50.55,26.03,2.4],"Bahrain"],["India becomes independent",1947,"1947",0,[77.2,28.6,2.4],"Delhi"],
  ["Singapore is pushed out of Malaysia",1965,"1965",0,[103.82,1.35,2.4],"Singapore"],["Iran’s revolution",1979,"1979",0,[51.39,35.69,2.4],"Tehran"]],
 after:(r,N)=>"From clay tablets to oil wells: most of the world’s people have lived in Asia through all of it."});

/* ======================================================================== 4. On horseback or on foot? (hafrica, The fly
   that stopped the horse) The tour's own text: the tsetse fly, common in the wet forests near the coast, kills horses,
   so the cavalry empires (Mali, Songhai, Oyo) ruled the drier grasslands to the north, and the forest kingdoms (Asante,
   Benin) fought on foot. Each answer turns the globe to the kingdom's city (Timbuktu for Mali, Gao for Songhai, Old Oyo,
   Kumasi for Asante, Benin City). */
const BINS_HORSE=BINS({tours:["hafrica"],title:"The fly that stopped the horse",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Was each kingdom an army of horsemen or of foot soldiers? Think where the tsetse fly lives.",ask:"Horsemen or foot soldiers?",
 bins:["On horseback","On foot"],
 items:[["Mali",0,"Mali ruled the dry grasslands of the Sahel, where horses could live.",[-3,16.77,3],"Timbuktu, Mali"],
  ["Asante",1,"Kumasi lay in the forest, deep in the tsetse belt: Asante fought on foot.",[-1.62,6.69,3],"Kumasi, Asante"],
  ["Songhai",0,"Gao, on the Niger at the edge of the desert, was cavalry country.",[-0.2,16.27,3],"Gao, Songhai"],
  ["Oyo",0,"Oyo’s horsemen ruled the open savanna, though its rulers had to buy their horses from the north.",[4.1,8.97,3],"Old Oyo"],
  ["Benin",1,"Benin City stood in the forest near the coast, where the tsetse killed horses.",[5.63,6.34,3],"Benin City"]],
 after:(r,N)=>(r===N?"All right! ":"")+"The line between them is roughly where the dry grassland meets the forest: a fly drew a border across West Africa."});

/* ======================================================================== 5. Africa in order (hafrica, Now explore) The
   tour's own dates; each tap turns the globe there and names the place. */
const SORT_AFR=SORTM({tours:["hafrica"],title:"Now explore",turns:true,
 tip:"Over 3,000 years of Africa’s story: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Ramesses II carves Abu Simbel",-1250,"about 1250 BC",0,[31.63,22.34,2.4],"Abu Simbel"],["Hannibal crosses the Alps",-218,"218 BC",0,[6.9,45.2,2.4],"The Alps"],
  ["Kush raids Roman Egypt",-25,"about 25 BC",0,[32.9,24.09,2.4],"Aswan"],["Great Zimbabwe is begun",1100,"about 1100",0,[30.93,-20.27,2.4],"Great Zimbabwe"],
  ["Mansa Musa’s gold reaches Cairo",1324,"1324",0,[31.24,30.04,2.4],"Cairo"],["A vegetable garden at the Cape",1652,"1652",0,[18.42,-33.93,2.4],"Cape Town"],
  ["The Zulu win at Isandlwana",1879,"1879",0,[30.65,-28.36,2.4],"Isandlwana"],["Ethiopia wins at Adwa",1896,"1896",0,[38.9,14.17,2.4],"Adwa"],
  ["Ghana becomes independent",1957,"1957",0,[-0.19,5.6,2.4],"Accra"],["South Sudan is born",2011,"2011",0,[31.58,4.85,2.4],"Juba"]],
 after:(r,N)=>"From pharaohs to the newest country on Earth: Africa’s history is far older and richer than most maps show."});

/* ======================================================================== 5b. Along the Company's route (hafrica, A colony
   that began as a vegetable garden) Amsterdam, the Cape and Batavia are spread round half the globe; the buttons follow
   the ships. The texts are the card's own. */
const TURN_VOC_AF=TURNER({tours:["hafrica"],title:"A colony that began as a vegetable garden",mark:true,
 tip:"Follow a Dutch East India Company ship: turn the globe along its route.",
 places:[["The Cape",18.42,-33.93,1.5,"About halfway along the route, Jan van Riebeeck planted the Company’s Garden in 1652 to grow vegetables for passing ships.",1],
  ["Amsterdam",4.9,52.37,1.8,"The ships set out from the Netherlands, many of their sailors soon sick with scurvy for lack of fresh food.",1],
  ["Batavia",106.8,-6.2,1.8,"Batavia, today’s Jakarta, the Company’s base in Asia at the end of the voyage.",1]]});

/* ======================================================================== 6. Was it ever Mexico? (hnamerica, Mexico loses
   half) The tour's own text: Texas broke away from Mexico in 1836, and after the war of 1846–48 Mexico gave up
   California, Nevada, Utah and most of Arizona and New Mexico; Florida went from Spain to the US in 1819 ("Spain in the
   US"), Louisiana was bought from France in 1803 ("The Louisiana Purchase") and Alaska from Russia in 1867 ("1867: two
   big deals"); Mexico was independent only from 1821. Each answer turns the globe to the state. */
const BINS_MEX=BINS({tours:["hnamerica"],title:"Mexico loses half",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Which of today’s US states were once part of Mexico? Each answer turns the globe there.",ask:"Once part of Mexico, or never?",
 bins:["Once part of Mexico","Never Mexican"],
 items:[["California",0,"Mexico gave it up in 1848, nine days after gold was found at Sutter’s Mill.",[-119.4,37.2,2.6],"California"],
  ["Florida",1,"Spain handed Florida to the US in 1819, two years before Mexico was independent.",[-81.7,28.1,2.6],"Florida"],
  ["Nevada",0,"Part of what Mexico gave up after the war of 1846–48.",[-116.6,39.3,2.6],"Nevada"],
  ["Texas",0,"Texas broke away from Mexico in 1836 and joined the US in 1845.",[-99.3,31.4,2.6],"Texas"],
  ["Louisiana",1,"The US bought it from France in 1803.",[-92,31,2.6],"Louisiana"],
  ["Utah",0,"Part of what Mexico gave up in 1848.",[-111.7,39.3,2.6],"Utah"],
  ["Alaska",1,"Russia sold it to the US in 1867.",[-152,62,2],"Alaska"],
  ["New Mexico",0,"Most of it was Mexican until 1848, and it kept the name.",[-106.1,34.4,2.6],"New Mexico"]],
 after:(r,N)=>(r===N?"All right! ":"")+"About half of Mexico’s land became part of the US, which is why so many places in the Southwest have Spanish names."});

/* ======================================================================== 7. North America in order (hnamerica, Now explore)
   The tour's own dates; each tap turns the globe there and names the place. */
const SORT_NAM=SORTM({tours:["hnamerica"],title:"Now explore",turns:true,
 tip:"Over 3,000 years of North America: put the tour’s moments in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["The Olmecs carve giant heads",-1400,"from about 1400 BC",0,[-94.04,18.1,2.4],"La Venta"],["Cahokia at its peak",1050,"about 1050",0,[-90.06,38.66,2.4],"Cahokia"],
  ["Tenochtitlan is founded",1325,"1325",0,[-99.13,19.43,2.4],"Tenochtitlan"],["Columbus lands in the Bahamas",1492,"1492",0,[-74.5,24.05,2.4],"San Salvador"],
  ["Spain builds St Augustine",1565,"1565",0,[-81.31,29.9,2.4],"St Augustine"],["Independence is declared",1776,"1776",0,[-75.16,39.95,2.4],"Philadelphia"],
  ["The Louisiana Purchase",1803,"1803",0,[-90.07,29.95,2.4],"New Orleans"],["The Erie Canal opens",1825,"1825",0,[-78.88,42.89,2.4],"Buffalo"],
  ["Gold at Sutter’s Mill",1848,"1848",0,[-120.89,38.8,2.4],"Sutter’s Mill"],["The golden spike",1869,"1869",0,[-112.55,41.62,2.4],"Promontory Summit"],
  ["The Panama Canal opens",1914,"1914",0,[-79.7,9.1,2.4],"Panama"]],
 after:(r,N)=>"From Olmec rubber balls to a canal between two oceans: North America’s map was made and remade many times."});


const DEFS=[BINS_OCE,GUESS_CLAY,SORT_ASIA,BINS_HORSE,SORT_AFR,TURN_VOC_AF,BINS_MEX,SORT_NAM];



let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw6-layer rw6-layer";el.innerHTML='<svg class="rw6-sv"><defs><clipPath id="rw6Disc"><path class="rw6-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw6Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw6-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw6-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw6-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw6-ctl";
 c.innerHTML='<div class="rw6-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw6-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw6-ctl"))unmount()}catch(e){}},300);
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
.rw6-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw6-sv{position:absolute;left:0;top:0;overflow:visible}
.rw6-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw6-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw6-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw6-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw6-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw6-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw6-btn[hidden]{display:none}
.rw6-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw6-ep b{display:block;font-size:15px}
.rw6-ep.rw6-new{animation:rw6In .45s ease}@keyframes rw6In{from{opacity:.2;transform:translateY(4px)}}
.rw6-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw6-sortq i{font-style:normal}
.rw6-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw6}
.rw6-rank li{position:relative;counter-increment:rw6;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw6-rank li::before{content:counter(rw6);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw6-rank li.rw6-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw6-rank li.rw6-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw6-nm{flex:1 1 auto;z-index:1}.rw6-v{z-index:1;font-weight:800;white-space:nowrap}
.rw6-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw6-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw6-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw6-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw6-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw6-do,:is(body.dark-theme,body.sky-night) .rw6-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw6-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw6-btn,:is(body.dark-theme,body.sky-night) .rw6-chip,:is(body.dark-theme,body.sky-night) .rw6-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw6-rank li.rw6-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw6-rank li.rw6-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw6-bar{background:rgba(255,178,122,.2)}
.rw6-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw6-rng{flex:1 1 auto;accent-color:#d9682b}.rw6-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw6-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw6-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw6-item{font-size:16px;color:#13294b}
.rw6-bins{display:flex;gap:6px;flex-wrap:wrap}.rw6-bins .rw6-btn[hidden]{display:none}.rw6-bin:disabled{cursor:default;opacity:.55}
.rw6-btn.rw6-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw6-btn.rw6-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw6-dots{display:flex;gap:4px;margin-top:8px}.rw6-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw6-dots i.rw6-now{box-shadow:0 0 0 2px #d9682b inset}.rw6-dots i.rw6-y{background:#1f8a4c}.rw6-dots i.rw6-x{background:#c2364f}
.rw6-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw6-sl .rw6-row{margin-top:2px}.rw6-sl .rw6-val{min-width:36px}
.rw6-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw6-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw6-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw6-out b{font-size:15px;color:#9a4a16}
.rw6-ch{display:block;width:100%;height:auto;margin-top:6px}.rw6-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw6-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw6-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw6-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw6-val,:is(body.dark-theme,body.sky-night) .rw6-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw6-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw6-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw6-n,:is(body.dark-theme,body.sky-night) .rw6-sl label,:is(body.dark-theme,body.sky-night) .rw6-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw6-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw6-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw6-dots i{background:rgba(255,255,255,.18)}
.rw6-btn.rw6-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw6-btn.rw6-cur{background:#9fc3ff;color:#13294b}
.rw6-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw6-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw6-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw6-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw6-ep b .rw6-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw6-ep b .rw6-km{color:#ffb27a}
.rw6-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw6-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw6-small{font-size:11.5px!important;padding:2px 7px!important}
.rw6-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw6-gq .rw6-rng{flex:1 1 auto}.rw6-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw6-julh{fill:#c2364f}.rw6-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw6-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw6-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw6-gv{color:#ffb27a}
.rw6-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw6-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw6-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw6-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw6-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw6-clk{font-size:18px}.rw6-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw6-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw6-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw6-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw6-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw6-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw6-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw6-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw6-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw6-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw6-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw6-pig{color:#1f8a4c}
.rw6-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw6-mlg line,.rw6-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw6-mlg .rw6-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw6-mlg line,:is(body.dark-theme,body.sky-night) .rw6-mlg path,:is(body.dark-theme,body.sky-night) .rw6-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw6-mlg .rw6-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw6-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw6-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw6-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw6-pig{color:#4cc27f}
.rw6-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw6-kbw{fill:#7fb3e0}
.rw6-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw6-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw6-kbb.rw6-kbok{stroke:#f2b33d}.rw6-kbb.rw6-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw6-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw6-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw6-ctl .rw6-btn.rw6-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw6-ctl .rw6-btn.rw6-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw6-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw6={v:1,FIX,XFS,viewOf,tours:MYT,tryView(v){OVR=v||null},L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
