/* GeoFlock polish RW-5: a stop-by-stop review of six tours, Population (pop), Elevation (elev), Map projections
   (projections), History (timeline), Words on the map (words) and Learning around the world (learning), each looked at
   on its default map at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rw4.js (its helpers and engine, under "rw5" names so the files never touch each other's
   controls): frames looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here gets exactly its
   frame; fixed fields are non-configurable getters whose setters are ignored (a field already non-configurable is left
   alone). Pin lists are filtered through getters, photo pins wait for geoflock-portraits.js's portraits, and a stop
   whose photos are dropped gets its photo squares rebuilt. CSS classes start with "rw5-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRw5)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw5Test or ?rw5test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw5Test||/[?&]rw5test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false){inPlace(S,k,id,fn);return}const B={v:S[k],fns:{},og:d&&d.get,os:d&&d.set};R[k]=B;
  Object.defineProperty(S,k,{configurable:!!(window.__rw5Test||/[?&]rw5test\b/.test(location.search)),enumerable:true,
   get:()=>{const pk=k==="phPins"?pplReady(S):0,bv=B.og?B.og.call(S):B.v;if(B.out&&B.at===bv&&B.atN===B.n&&B.pk===pk&&B.out.length===B.ol&&(!bv||bv.length===B.bl))return sync(S,k,B.out);let v=Array.isArray(bv)?bv.slice():(bv||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}
    if(pk)v=pplAdd(S,v);if(k==="phPins"&&B.out&&B.out.length!==v.length)setTimeout(()=>resq(S),0);B.out=v;B.ol=v.length;B.bl=bv&&bv.length;B.at=bv;B.atN=B.n;B.pk=pk;return sync(S,k,v)},set:x=>{if(B.os)B.os.call(S,x);else B.v=x}})}
 R[k].fns[id]=fn;R[k].n=(R[k].n||0)+1;if(k==="phPins")resq(S)}catch(e){}};
/* a list another file has already locked (a non-configurable getter handing back one fixed array, as
   geoflock-polish-rva.js's LOCK does) cannot be wrapped: the edit is made on that array itself, once per edit */
const INPL=new WeakMap();
function inPlace(S,k,id,fn){try{const a=S[k];if(!Array.isArray(a)||S[k]!==a)return;let done=INPL.get(a);if(!done){done=new Set();INPL.set(a,done)}if(done.has(id))return;
 const out=fn(a.slice());if(Array.isArray(out)){a.splice(0,a.length,...out);done.add(id);if(k==="phPins")resq(S)}}catch(e){}}
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw5)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw5,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw5=1;window.psGlobeTarget=w}catch(e){}})(0);
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
/* rename any pin (a text pin or an object pin) whose text matches */
const PINTXT=(S,re,txt)=>XF(S,"pins","ptx"+re,P=>P.map(p=>Array.isArray(p)?(re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p):(p&&re.test(strip(p.text))?Object.assign({},p,{text:txt}):p)));
/* move a photo pin */
const PHMOVE=(S,re,ll)=>XF(S,"phPins","phm"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{at:ll}):p));

FIX.pop={
  /* the stop's share moves into its guess (revealed there): the body and the equator's label gave it away. Wikipedia,
     "Northern Hemisphere": "approximately 6.4 billion people live somewhere in the northern hemisphere, which is around
     87.0% of the Earth's total human population" */
  "The world lives in the north":S=>{RE(S,"body","87% of people live north of the equator.","How many people live north of the equator? Guess below.");PINTXT(S,/^87% of people live north/,"The equator")},
  /* the circle's western half (India and Bangladesh) lay under the card: framed further east and a little wider, so the
     whole circle shows beside the card */
  "Half of humanity in one circle":S=>VIEW(S,[100,22,1]),
  /* a "United States" label on a long leader (the map names it) */
  "The United States: the 100th meridian":S=>DROP(S,/^United States$/),
  /* the line's western half, the Prairies and British Columbia, lay under the card, and a "Canada" label hung on a long
     leader at the card's edge: the label goes, and the line is framed beside the card */
  "Canada hugs the border":S=>{DROP(S,/^Canada$/);VIEW(S,[-92,50,1.3])},
  /* "100 million around Lake Victoria" and "more live around Lake Victoria than in Germany" (83 million): Wikipedia,
     "Lake Victoria", speaks of "the 45 million people living within the catchment area"; other counts (NASA, the World
     Bank) are lower still */
  "Africa’s two crowded corners":S=>{RE(S,"stat","and more live around Lake Victoria than in Germany","and about 45 million live in Lake Victoria’s basin");RENAME(S,/^100 million around Lake Victoria$/,"About 45 million in Lake Victoria’s basin")},
  /* the curve was small in the middle of western Europe: framed closer */
  "Europe’s Blue Banana":S=>VIEW(S,[6,50,3.4]),
  /* European Russia, Moscow and the Urals line lay under the card, and the line's label under the Moscow photo; the
     shading of all of Russia kept the labels off their places: shading off, framed beside the card */
  "Russia lives west of the Urals":S=>{NOSHADE(S);VIEW(S,[70,57,1.3])},
  /* "Camels in the Gobi" stood in the middle of Mongolia, far north of the Gobi: moved into the desert */
  "Mongolia: the emptiest country":S=>PHMOVE(S,/^Mongolia: Gobi Desert/,[104.5,43.6]),
  /* every country of the continent was shaded, which pushed Lima's label onto a long leader and the Brasília photo far
     south of Brasília (the label placer keeps labels off a stop's shaded countries) */
  "South America lives on its edges":S=>NOSHADE(S),
  "Now explore":S=>{}
};

FIX.elev={
  /* the card stood on the right, over the map's zoom buttons, and New Guinea's high lay under it: card on the left (every
     stop's), framed between the two */
  "Sea level isn’t level":S=>VIEW(S,[108,-2,1.05]),
  /* the Challenger Deep photo's label was cut to "Challenger Deep ~10" (the card gives the depth) */
  "Deeper than Everest is tall":S=>PHLABEL(S,/^Challenger Deep/,"Challenger Deep"),
  /* "Antarctica — no permanent population", a population label on the Antarctic Peninsula, said nothing about height */
  "The highest continent":S=>DROP(S,/^Antarctica — no permanent population/),
  /* Quito, the stop's headline, lay at the globe's right edge by the map key: framed further south and east */
  "Cities that climbed to keep cool":S=>VIEW(S,[-84,6,1.7]),
  /* the whole of the Netherlands was shaded, which pushed every label out over the North Sea and England, and the
     country was small in the middle of the globe: shading off, framed closer */
  "A country below the sea":S=>{NOSHADE(S);VIEW(S,[5.4,52.3,18])},
  /* the Maldives lay on the card's edge and Tuvalu, half a world away, round the back: the stop opens on the Maldives
     and its buttons turn the globe to Tuvalu and back */
  "Countries that could disappear":S=>VIEW(S,[73.4,2.5,2.2]),
  /* the card stood on the right, over the zoom buttons, and the Azores' label was pushed into the Caribbean: card on the
     left, framed on the ridge from Iceland to Tristan da Cunha */
  "The ocean’s hidden spine":S=>VIEW(S,[-24,18,1]),
  /* the Rockies lay under the card, their label at its edge; the Sydney Opera House photo has nothing to do with old
     mountains: framed beside the card, the photo goes */
  "Old mountains, young mountains":S=>{DROPPH(S,/^Australia: Sydney Opera House/);VIEW(S,[-92,40,2])},
  "Old mountains are low mountains":S=>{DROPPH(S,/^Australia: Sydney Opera House/);VIEW(S,[-92,40,2])},
  "Now explore":S=>{}
};

/* The projections tour runs on the projection lab's own engine (ptGo in index.html), which turns each map to its stop's
   "rot" (d3 rotate: [λ, φ] puts longitude −λ in the middle). The card covers the map's left third, so these stops
   are turned a little west, bringing the countries they are about out from under it. */
FIX.projections={};
const PROT={
  /* Greenland's own place, where the ghost is to be dragged back to, lay under the card: turned so Greenland sits in the
     middle and Africa to its right */
  "Greenland vs Africa":[35,0],
  /* Alaska, the stop's subject, lay under the card (only its ghost on Brazil showed) */
  "Alaska vs Brazil":[105,0],
  /* the Americas lay under the card on these three whole-world maps: turned a little west, the cut still runs through
     the Pacific east of Australia */
  "True sizes, odd shapes":[20,0],
  "A better compromise":[20,0],
  "The map drawn by eye":[20,0]
};
const protApply=()=>{try{const T=PS_TOURS.projections;if(T&&T.steps)T.steps.forEach(S=>{const r=S&&PROT[strip(S.title)];if(r)LOCK(S,"rot",r)})}catch(e){}};
protApply();setTimeout(protApply,1500);setTimeout(protApply,6000);addEventListener("load",()=>setTimeout(protApply,500));

FIX.timeline={};

FIX.words={
  /* Amsterdam, London and Lisbon, where 'te' and 'chá' arrived, lay under the card, their labels pushed onto leaders
     over Turkey and the Arctic: the stop's game turns the globe to each language's home (the labels stay) */
  /* a "United Kingdom" label on a leader (the map names it, and the lines show where the words came to) */
  "Borrowed words":S=>DROP(S,/^United Kingdom$/),
  /* Iraq, Egypt and China were shaded, which pushed the Uruk photo onto Eritrea and the Abydos label off Egypt;
     Anyang was at the globe's edge and Mexico, the third birthplace, round the back: shading off, and the stop's buttons
     turn the globe to each place where writing began */
  "Writing begins":S=>{NOSHADE(S);VIEW(S,[38,29,2.2])},
  /* "North Korea" and "South Korea" labels sat on the map's own names */
  "Hangul: an alphabet by design":S=>DROP(S,/^(North|South) Korea$/),
  /* Dagestan's label hung far from its place and the Tbilisi photo was pushed onto Azerbaijan: framed closer */
  "The mountain of languages":S=>VIEW(S,[45,42.3,5.5]),
  /* a "Papua New Guinea" label on a leader into Indonesia (the map names it), and Vanuatu and the Solomon Islands off
     the globe's edge: the label goes; framed further east */
  "Papua New Guinea: 840 languages":S=>{DROP(S,/^Papua New Guinea$/);VIEW(S,[153,-9,2.4])},
  /* the globe looked at the empty Pacific: Wales and Israel were round the back and New Zealand at the bottom edge by
     the map's notices; the stop's buttons turn the globe to each language (the far ones are left out of the opening
     frame), and the "New Zealand" and "Israel" labels go (the map names them) */
  "Endangered and revived":S=>{NOSHADE(S);DROP(S,/^(New Zealand|Israel)$/);AREA(S,/^(Welsh|Hebrew)/);VIEW(S,[-170,-8,1.1])},
  /* a "Poland" label on the map's own name, and the shading of Poland pushed the photos off their places */
  "Esperanto":S=>{NOSHADE(S);DROP(S,/^Poland$/)},
  "Now explore":S=>{}
};

FIX.learning={
  /* the Seoul photo sat on the map's zoom buttons: framed a little wider */
  "Exams for an empire":S=>VIEW(S,[114,31,1.7]),
  /* Kairouan, where Fatima al-Fihri's family came from, was off the globe's right edge (only the dashed line showed),
     and Morocco and Tunisia were shaded: shading off, framed wider, Fez to Kairouan */
  "Al-Qarawiyyin":S=>{NOSHADE(S);VIEW(S,[5,34,3])},
  /* "United Kingdom", "France", "Spain" and "Italy" labels on leaders (the map names them), the shading of the four
     countries that pushed the town labels away, and Bologna's label under the map key: labels and shading go, framed
     further east */
  "Bologna, Paris and Oxford":S=>{NOSHADE(S);DROP(S,/^(United Kingdom|France|Spain|Italy)$/);VIEW(S,[10,47,3])},
  /* a "Germany" label on a leader (the map names it) and the shading of Germany; the Stockholm photo hung over the map's
     switches at the top (the Sweden pin is on Stockholm): label, shading and photo go */
  "Print, Protestants and reading":S=>{NOSHADE(S);DROP(S,/^Germany$/);DROPPH(S,/^Stockholm$/);VIEW(S,[10,50,2.6])},
  /* the globe looked at the middle of Canada, shaded, with the cable's two ends at its top edge by the map's switches,
     and "Ireland" and "Canada" labels on leaders: framed on the Atlantic between the two ends, labels and shading go */
  "Cables under the sea":S=>{NOSHADE(S);DROP(S,/^(Ireland|Canada)$/);VIEW(S,[-32,50,2.2])},
  /* Finland's label hung over the map's switches at the globe's top edge and Australia was off its bottom: the stop's
     buttons turn the globe from country to country (the far ones are left out of the opening frame) */
  "School around the world":S=>{NOSHADE(S);AREA(S,/^(Finland|Japan|Australia):/);VIEW(S,[104,12,1.6])},
  /* an "Australia" label on a long leader (the map names it) */
  "School by radio":S=>DROP(S,/^Australia$/),
  /* a "Kenya" label on a long leader across Garissa's (the map names it) */
  "Libraries on camels":S=>DROP(S,/^Kenya$/),
  /* a "United Kingdom" label on a leader (the map names it), and the whole of Britain shown though the stop is about
     10 km of London: label and shading go, framed on London */
  "The Knowledge":S=>{NOSHADE(S);DROP(S,/^United Kingdom$/);VIEW(S,[-0.13,51.5,40])},
  "Now explore":S=>VIEW(S,[40,30,1])
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
 PEND=false;try{f(S)}catch(e){console.error("rw5 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rw5-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw5){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw5=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw5-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw5-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw5-new");void e.offsetWidth;e.classList.add("rw5-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw5-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw5-rank"></ol><div class="rw5-pool"></div>'+
  '<div class="rw5-btns"><button type="button" class="rw5-btn rw5-undo">Undo</button><button type="button" class="rw5-btn rw5-show">Show me</button><button type="button" class="rw5-btn rw5-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw5-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw5-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw5-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw5-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw5-ok":"rw5-no"):"")+'"><span class="rw5-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw5-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw5-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw5-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw5-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw5-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw5-show").hidden=L.shown;c.querySelector(".rw5-again").hidden=!L.shown;
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
 card(L){return'<div class="rw5-btns rw5-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw5-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw5-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw5-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw5-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw5-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q&&f[5]!==2){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw5-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw5-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14);
  /* (rw5) a place may name its own towns, f[6] = [[lon, lat, name]], each a dot and a name tag once the globe is there */
  L.tgs=L.tgs||[];const T6=f[6]||[];T6.forEach((t,k)=>{if(!L.tgs[k])L.tgs[k]=tag(L,"rw5-ctag rw5-small");const p=proj(L,[t[0],t[1]]);if(p)svgEl(L.svg,"circle",{cx:p[0],cy:p[1],r:4.5,class:"rw5-tdot"});putTag(L,L.tgs[k],p,esc(t[2]),9)});
  for(let k=T6.length;k<L.tgs.length;k++)putTag(L,L.tgs[k],null)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw5-gq"><input type="range" class="rw5-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw5-gv"></b></div>'+
  '<div class="rw5-btns"><button type="button" class="rw5-btn rw5-chk">Check my guess</button><button type="button" class="rw5-btn rw5-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw5-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw5-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw5-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw5-rng");r.disabled=!!L.done;
  c.querySelector(".rw5-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw5-chk").hidden=!!L.done;c.querySelector(".rw5-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw5-q"><span class="rw5-n"></span><b class="rw5-item"></b></div><div class="rw5-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw5-btn rw5-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw5-btn rw5-next" hidden>Next →</button><button type="button" class="rw5-btn rw5-again" hidden>Start again</button></div><div class="rw5-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw5-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw5-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw5-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw5-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw5-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw5-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw5-good",L.wait&&i===it[1]);b.classList.toggle("rw5-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw5-next").hidden=!(L.wait&&!done);c.querySelector(".rw5-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw5-again").hidden=!done;
  c.querySelectorAll(".rw5-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw5-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw5-y":"rw5-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw5-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw5-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw5-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}




/* ---------------- a sorting game that rings each place it turns the globe to ----------------
   as SORT (above), each item's 5th field [lon, lat, zoom] the place a tap turns the globe to and its 6th field the name
   tagged there; the place of the last item tapped gets a ringed dot and its name */
function SORTM(cfg){const D=SORT(cfg);D.globe=true;const r0=D.render;
 D.render=function(L){r0.call(this,L);L.dirty=1};
 D.draw=function(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw5-ctag");const k=L.order&&L.order.length&&!L.gave?L.order[L.order.length-1]:null,it=k==null?null:cfg.items[k],
  q=it&&it[4]?proj(L,[it[4][0],it[4][1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw5-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw5-tdot"})}putTag(L,L.tg,q,esc(it&&it[5]||""),14)};
 return D}
/* ======================================================================== 1. North of the equator (pop, The world lives in
   the north) Wikipedia, "Northern Hemisphere": "approximately 6.4 billion people live somewhere in the northern
   hemisphere, which is around 87.0% of the Earth's total human population", and it "contains 67.3% of Earth's land".
   The share is taken out of the body and the equator's label (part 1) so the guess comes first. */
const GUESS_NORTH=GUESS({tours:["pop"],title:"The world lives in the north",
 tip:"The equator cuts the world in half. What share of all people live north of it, do you think?",
 vals:[50,60,70,80,87,95],start:1,answer:87,close:1,fmt:v=>v+"%",
 after:"About 87%, nearly nine in ten. Two-thirds of the land is in the north too, and the most crowded parts of it: China, India, Europe."});

/* ======================================================================== 2. The Maldives and Tuvalu (elev, Countries that
   could disappear) The two countries are over 100° of longitude apart; the buttons turn the globe between them. The
   texts are the card's own. */
const TURN_LOW=TURNER({tours:["elev"],title:"Countries that could disappear",mark:true,
 tip:"The two lowest countries are half a world apart: turn the globe from one to the other.",
 places:[["The Maldives",73.4,2.5,2.2,"About 1,200 coral islands; the highest natural point is only about 2.4 m. A raised island, Hulhumalé, about 2 m above the sea, is being built as a safer place to live.",1],
  ["Tuvalu",179.2,-8.5,2.4,"Nine small islands that reach only about 4.6 m at their highest. In 2023 Tuvalu signed a treaty with Australia letting some citizens move there each year.",1]]});

/* ======================================================================== 3. Cha or te? (words, Tea or chá?) Each
   language's word is the stop's own (its pins and its text), except Indonesian teh: WALS Online, chapter 138, "Tea"
   (Östen Dahl): "teh" in Malay/Indonesian and the languages of former Dutch colonies, from the Amoy (Min) form the Dutch
   adopted; the Portuguese, trading through Macao, took Cantonese chá. Each answer turns the globe to the language's
   home. */
const BINS_TEA=BINS({tours:["words"],title:"Tea or chá?",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Cha came overland, te came by sea. Which family is each word for tea in?",ask:"A cha word or a te word?",
 bins:["Cha (overland)","Te (by sea)"],
 items:[["Russian: chai",0,"Tea reached Russia overland, from China.",[37.62,55.75,2.2],"Moscow"],
  ["Dutch: thee",1,"Dutch ships bought tea at Xiamen (Amoy), where the local Min Chinese says te.",[4.9,52.37,2.6],"Amsterdam"],
  ["French: thé",1,"It came by sea, through the Dutch trade.",[2.35,48.86,2.6],"Paris"],
  ["Turkish: çay",0,"Overland, along the Silk Roads.",[28.98,41.01,2.4],"Istanbul"],
  ["Portuguese: chá",0,"The odd one out: Portugal came by sea too, but its traders bought tea at Macau, where Cantonese says cha.",[-9.14,38.72,2.6],"Lisbon"],
  ["English: tea",1,"From the Dutch trade; English once said it more like ‘tay’.",[-0.13,51.5,2.6],"London"],
  ["Hindi: chai",0,"Overland, like Persian chay.",[77.2,28.6,2.2],"Delhi"],
  ["Indonesian: teh",1,"The Dutch traded here, bringing the te word with them.",[106.85,-6.2,2.2],"Jakarta"],
  ["German: Tee",1,"By sea, from the Dutch.",[13.4,52.52,2.6],"Berlin"]],
 after:(r,N)=>(r===N?"All right! ":"")+"The word tells you the road: cha travelled with caravans across Asia, te with Dutch ships from the port of Xiamen."});

/* ======================================================================== 4. Where writing began (words, Writing begins)
   The texts are the card's own, Oaxaca's place from Wikipedia, "Zapotec script": San José Mogote's Monument 3, "dated
   to before 500 BCE", and the inscriptions of Monte Albán, both in Oaxaca. */
const TURN_WRITE=TURNER({tours:["words"],title:"Writing begins",mark:true,
 tip:"Writing was invented in places far apart: turn the globe to each one.",
 places:[["Mesopotamia and Egypt",38,29,2.2,"Cuneiform, from Uruk around 3200 BC, began as tallies of grain and sheep pressed into clay; Egypt’s hieroglyphs may have been invented on their own too.",2],
  ["Anyang, China",114.35,36.1,3,"China’s oldest writing is on ‘oracle bones’ from Anyang, about 1200 BC.",1],
  ["Oaxaca, Mexico",-96.77,17.04,3,"In Mexico and Central America, the Zapotecs and later the Maya were writing by around 500 BC: some of the oldest carvings are in the valley of Oaxaca."]]});

/* ======================================================================== 5. Languages coming back (words, Endangered and
   revived) The places are half a world apart; the texts are the card's own. */
const TURN_REVIVE=TURNER({tours:["words"],title:"Endangered and revived",mark:true,
 tip:"Languages are coming back all over the world: turn the globe to each one.",
 places:[["Hawaii and New Zealand",-170,-8,1.1,"In New Zealand, kōhanga reo, ‘language nests’, have taught young children in Māori since 1982, and Hawaii copied them in 1984.",2],
  ["Wales",-3.8,52.4,3,"About 538,000 people said they could speak Welsh in the 2021 census.",1],
  ["Israel",35.2,31.78,3,"Hebrew, for centuries used mainly in prayer and writing, became the everyday language of millions in Israel.",1]]});

/* ======================================================================== 6. School around the world (learning) The
   countries are spread round the globe; the texts are the card's own. */
const TURN_SCHOOL=TURNER({tours:["learning"],title:"School around the world",mark:true,
 tip:"School is different everywhere: turn the globe from country to country.",
 places:[["Singapore",103.82,1.35,2,"In the 2022 PISA tests of 15-year-olds in 81 countries and economies, Singapore came top in maths, reading and science.",1],
  ["Finland and England",10,57,2.2,"Children in Finland start school at seven; in England many start at four. Finland, known for short school days and little homework, also scored above the average of rich countries.",2],
  ["Japan",139.69,35.69,2.4,"Japan’s school year starts in April, with the cherry blossom; Japan was close behind Singapore in PISA 2022.",1],
  ["Australia",134,-27,1.6,"In Australia, Brazil and South Africa the school year starts in January or February, after the long summer holidays.",2]]});

/* ======================================================================== 7. Places of learning in order (learning, Now
   explore) The tour's own dates; each tap turns the globe there and names the place. */
const SORT_LEARN=SORTM({tours:["learning"],title:"Now explore",turns:true,
 tip:"Over 2,000 years of learning: put the tour’s moments in order, oldest first. Each one you tap turns the globe there.",
 first:"Longest ago",last:"Most recent",bars:false,
 items:[["The Library of Alexandria is founded",-250,"early 200s BC",0,[29.91,31.21,2.4],"Alexandria"],["Nalanda is founded",450,"400s",0,[85.44,25.14,2.4],"Nalanda"],
  ["China’s exams for officials begin",605,"605",0,[116.4,39.9,2.2],"China"],["Fatima al-Fihri founds al-Qarawiyyin",859,"859",0,[-4.98,34.06,2.4],"Fez"],
  ["Bologna’s university begins",1088,"1088",0,[11.34,44.49,2.4],"Bologna"],["Gutenberg prints at Mainz",1450,"about 1450",0,[8.27,50,2.4],"Mainz"],
  ["School of the Air goes on the radio",1951,"1951",0,[133.88,-23.7,2],"Alice Springs"],["Kenya’s camel libraries set out",1996,"1996",0,[39.65,-0.45,2.4],"Garissa"]],
 after:(r,N)=>"From scrolls to radio waves: learning has always found a way to travel to the people who want it."});

const DEFS=[GUESS_NORTH,TURN_LOW,BINS_TEA,TURN_WRITE,TURN_REVIVE,TURN_SCHOOL,SORT_LEARN];




let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw5-layer rw5-layer";el.innerHTML='<svg class="rw5-sv"><defs><clipPath id="rw5Disc"><path class="rw5-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw5Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw5-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw5-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw5-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw5-ctl";
 c.innerHTML='<div class="rw5-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw5-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw5-ctl"))unmount()}catch(e){}},300);
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
.rw5-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw5-sv{position:absolute;left:0;top:0;overflow:visible}
.rw5-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw5-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw5-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw5-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw5-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw5-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw5-btn[hidden]{display:none}
.rw5-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw5-ep b{display:block;font-size:15px}
.rw5-ep.rw5-new{animation:rw5In .45s ease}@keyframes rw5In{from{opacity:.2;transform:translateY(4px)}}
.rw5-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw5-sortq i{font-style:normal}
.rw5-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw5}
.rw5-rank li{position:relative;counter-increment:rw5;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw5-rank li::before{content:counter(rw5);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw5-rank li.rw5-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw5-rank li.rw5-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw5-nm{flex:1 1 auto;z-index:1}.rw5-v{z-index:1;font-weight:800;white-space:nowrap}
.rw5-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw5-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw5-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw5-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw5-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw5-do,:is(body.dark-theme,body.sky-night) .rw5-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw5-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw5-btn,:is(body.dark-theme,body.sky-night) .rw5-chip,:is(body.dark-theme,body.sky-night) .rw5-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw5-rank li.rw5-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw5-rank li.rw5-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw5-bar{background:rgba(255,178,122,.2)}
.rw5-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw5-rng{flex:1 1 auto;accent-color:#d9682b}.rw5-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw5-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw5-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw5-item{font-size:16px;color:#13294b}
.rw5-bins{display:flex;gap:6px;flex-wrap:wrap}.rw5-bins .rw5-btn[hidden]{display:none}.rw5-bin:disabled{cursor:default;opacity:.55}
.rw5-btn.rw5-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw5-btn.rw5-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw5-dots{display:flex;gap:4px;margin-top:8px}.rw5-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw5-dots i.rw5-now{box-shadow:0 0 0 2px #d9682b inset}.rw5-dots i.rw5-y{background:#1f8a4c}.rw5-dots i.rw5-x{background:#c2364f}
.rw5-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw5-sl .rw5-row{margin-top:2px}.rw5-sl .rw5-val{min-width:36px}
.rw5-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw5-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw5-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw5-out b{font-size:15px;color:#9a4a16}
.rw5-ch{display:block;width:100%;height:auto;margin-top:6px}.rw5-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw5-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw5-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw5-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw5-val,:is(body.dark-theme,body.sky-night) .rw5-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw5-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw5-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw5-n,:is(body.dark-theme,body.sky-night) .rw5-sl label,:is(body.dark-theme,body.sky-night) .rw5-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw5-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw5-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw5-dots i{background:rgba(255,255,255,.18)}
.rw5-btn.rw5-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw5-btn.rw5-cur{background:#9fc3ff;color:#13294b}
.rw5-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw5-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw5-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw5-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw5-ep b .rw5-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw5-ep b .rw5-km{color:#ffb27a}
.rw5-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw5-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw5-small{font-size:11.5px!important;padding:2px 7px!important}
.rw5-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw5-gq .rw5-rng{flex:1 1 auto}.rw5-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw5-julh{fill:#c2364f}.rw5-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw5-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw5-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw5-gv{color:#ffb27a}
.rw5-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw5-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw5-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw5-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw5-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw5-clk{font-size:18px}.rw5-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw5-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw5-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw5-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw5-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw5-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw5-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw5-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw5-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw5-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw5-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw5-pig{color:#1f8a4c}
.rw5-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw5-mlg line,.rw5-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw5-mlg .rw5-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw5-mlg line,:is(body.dark-theme,body.sky-night) .rw5-mlg path,:is(body.dark-theme,body.sky-night) .rw5-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw5-mlg .rw5-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw5-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw5-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw5-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw5-pig{color:#4cc27f}
.rw5-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw5-kbw{fill:#7fb3e0}
.rw5-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw5-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw5-kbb.rw5-kbok{stroke:#f2b33d}.rw5-kbb.rw5-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw5-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw5-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw5-ctl .rw5-btn.rw5-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw5-ctl .rw5-btn.rw5-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw5-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw5={v:1,FIX,XFS,viewOf,tours:MYT,tryView(v){OVR=v||null},L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
