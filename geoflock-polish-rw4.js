/* GeoFlock polish RW-4: a stop-by-stop review of four tours, The Sixth Extinction (bextinction) from the Books shelf and
   Energy of the world (energy), Money on the map (currencies) and Conflicts and peace (conflicts) from the Power &
   economy shelf, each looked at on its default map at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rw3.js, -rw2.js and -rw1.js (their helpers and engine, under "rw4" names so the files never
   touch each other's controls): frames looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here
   gets exactly its frame; fixed fields are non-configurable getters whose setters are ignored (a field already
   non-configurable is left alone). Pin lists are filtered through getters, photo pins wait for geoflock-portraits.js's
   portraits, and a stop whose photos are dropped gets its photo squares rebuilt. CSS classes start with "rw4-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRw4)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw4Test or ?rw4test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw4Test||/[?&]rw4test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rw4Test||/[?&]rw4test\b/.test(location.search)),enumerable:true,
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw4)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw4,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw4=1;window.psGlobeTarget=w}catch(e){}})(0);
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

FIX.bextinction={
  /* the Monteverde photo lay under the card and the Bay of Naples photo was stacked by the Neanderthal's at the globe's
     edge by the zoom buttons (each place has a stop of its own) */
  "The Sixth Extinction":S=>{DROPPH(S,/^(Monteverde cloud forest|The Bay of Naples)/);VIEW(S,[-30,15,1])},
  /* El Valle and the golden frog's photo lay at the globe's edge by the map key, and "Costa Rica" and "Panama" labels
     hung on long leaders (the map names both): framed a little east; the labels go */
  "The Panamanian golden frog":S=>{DROP(S,/^(Costa Rica|Panama)$/);VIEW(S,[-81.2,9.3,5])},
  /* Paris, where Cuvier spoke (with his portrait), and the ruler's Paris end lay at the globe's top edge by the zoom buttons: framed on the
     Atlantic, Kentucky to Paris */
  "Cuvier’s mastodon":S=>VIEW(S,[-38,42,1]),
  /* St Kilda lay at the globe's edge by the zoom buttons: framed a little east; the Iceland photo, pushed off Iceland under
     Eldey's label, goes. The auk stood about 75 cm tall, not
     "almost 1 m" (Wikipedia, "Great auk": "The bird was about 75 centimetres (29.5 inches) tall") */
  "The great auk":S=>{RE(S,"stat","almost 1 m tall","about 75 cm tall");DROPPH(S,/^Iceland$/);VIEW(S,[-27,57,2])},
  /* Gubbio lay at the globe's top edge by the zoom buttons and the Drumheller photo at the card's edge, its label cut to
     "K" (the card shows the Alvarezes at the gorge): the photo goes, and the stop's buttons turn the globe between Gubbio
     and Chicxulub (opening on the crater) */
  "Gubbio: the clay at the end of the dinosaurs":S=>{DROPPH(S,/^K.Pg boundary/);VIEW(S,[-70,28,1.4])},
  /* Meishan was round the back of the globe and the Siberian Traps' label hung at the globe's top edge over the search
     box: the stop's buttons turn the globe to each site; Meishan and the Traps are left out of the opening frame */
  "The Big Five and the Anthropocene":S=>{AREA(S,/^(Meishan|Siberian Traps)/);VIEW(S,[14,47,2])},
  /* the castle's vents and the Bay of Naples photo lay on one spot, their labels pushed off on leaders: framed closer */
  "Ischia: a sea turning sour":S=>VIEW(S,[14.1,40.75,25]),
  /* One Tree and Heron Island, a few km apart, had their labels pushed out round the reef photo, and an "Australia"
     label hung on a long leader at the globe's bottom edge: framed closer, the label goes */
  "One Tree Island":S=>{DROP(S,/^Australia$/);VIEW(S,[151.3,-22.5,7])},
  /* the slash-and-burn photo was pushed far from its place: it goes, and the reserve is framed closer */
  "Islands in the Amazon":S=>{DROPPH(S,/^Slash and burn/);VIEW(S,[-60,-2.8,7])},
  /* Wayqecha's and Manu's labels were pushed far from their places round the cloud forest photo, between them (the card
     shows the forest): the photo goes, and so does the shading of the whole of Peru, which kept the labels away from their places (see "Bats
     and white-nose syndrome"); the stop is framed closer */
  "Trees climbing the Andes":S=>{DROPPH(S,/^Man[uú] cloud forest/);NOSHADE(S);VIEW(S,[-71.5,-12.55,9])},
  /* the whole United States was shaded, which kept the labels away from their caves (the label placer keeps labels off a
     stop's shaded countries, as geoflock-polish-rw4.js found), and Albany lay at the globe's edge: shading off, framed a
     little wider */
  "Bats and white-nose syndrome":S=>{NOSHADE(S);VIEW(S,[-90,42,1.7])},
  /* Sabah lay off the globe's right edge under the zoom buttons: framed a little east and wider */
  "The last Sumatran rhinos":S=>VIEW(S,[107.5,0,2.6]),
  /* the four regions are spread round the whole globe: North America's label hung over the map's switches, Madagascar's
     under the map key, Australia and New Zealand round the back, the photos at the edges. The labels, which also gave away the dates the
     stop's sort asks for, and the photos go; the sort turns the globe to each region and names it (the paw icons stay) */
  "Where people arrived, big animals vanished":S=>{DROPPH(S,/^(A moa skeleton|Ice-age animals|Woolly mammoth|Giant ground sloth|Elephant bird)/);DROP(S,/^(Australia|North America|New Zealand|Madagascar):/);VIEW(S,[95,-18,1])},
  /* the honeycreeper photo's label was cut off at the globe's bottom edge and the photo hid the ‘alalā's Hawaii label: the
     photo goes; framed a little wider */
  "The Frozen Zoo":S=>{DROPPH(S,/^A Hawaiian honeycreeper/);VIEW(S,[-136,26,1.5])},
  "Now explore":S=>VIEW(S,[-30,15,1])
};

FIX.energy={
  /* the pumpjack and Itaipu photos lay under the card and the Nesjavellir photo at the globe's top edge by the map's
     switches (each place has a stop of its own) */
  "Energy of the world":S=>{DROPPH(S,/^(Oil pumpjack|Itaipu Dam|Nesjavellir)/);VIEW(S,[30,25,1])},
  /* Dhahran's label ran under the map key and a "Saudi Arabia" label hung on a long leader (the map names it): framed a
     little east, the label goes */
  "Ghawar, the biggest oil field":S=>{DROP(S,/^Saudi Arabia$/);VIEW(S,[56,26,4])},
  /* a "Saudi Arabia" label on a long leader (the map names it) */
  "Burning oil to stay cool":S=>DROP(S,/^Saudi Arabia$/),
  /* Almetyevsk, where Druzhba begins, lay at the globe's edge by the zoom buttons: framed a little east */
  "Pipelines across a continent":S=>VIEW(S,[35,54,1.8]),
  /* the whole of Britain was shaded, which pushed the labels far from their places (the label placer keeps labels off a
     stop's shaded countries, as geoflock-polish-rw4.js found), with a "United Kingdom" label on a leader, and the
     Zollverein photo lay at the globe's edge by the map key: shading, label and photo go; framed closer */
  "Coal: the first and the last":S=>{NOSHADE(S);DROP(S,/^United Kingdom$/);DROPPH(S,/^Zollverein/);VIEW(S,[-1.4,52.4,6])},
  /* Chongqing's label was pushed far south, off shaded China: the shading goes */
  "Three Gorges":S=>NOSHADE(S),
  /* the Iguazu Falls label ran under the map key, kept off shaded Brazil and Paraguay: shading off, framed a little east */
  "Itaipu, a dam for two":S=>{NOSHADE(S);VIEW(S,[-53.6,-25.3,4])},
  /* the labels were pushed off shaded Iceland: the shading goes. The stat's share moves into the stop's guess (revealed
     there) */
  "Iceland: heat from below":S=>{NOSHADE(S);RE(S,"stat","Nine in ten homes in Iceland are heated with hot water from underground","Iceland heats its homes with hot water from underground: guess below how many of them")},
  /* Vindeby lay off the globe's edge under the zoom buttons and the offshore wind farm photo was pushed far inland onto
     England; five countries were shaded, keeping the labels off the coasts: framed a little east, the photo and the
     shading go */
  "Wind over the North Sea":S=>{NOSHADE(S);DROPPH(S,/^Offshore wind farm/);VIEW(S,[5,55,4.6])},
  /* "France" and "Germany" labels on leaders (the map names them), and Flamanville's pushed far off shaded France */
  "France: a nuclear nation":S=>{NOSHADE(S);DROP(S,/^(France|Germany)$/)},
  /* Dinorwig's and the upper lake's labels, 2 km apart, were pushed far west onto the card's edge, off shaded Britain,
     with a "United Kingdom" label: the shading and that label go, the upper lake's label too (the card's cross-section
     shows it), and the stop is framed closer */
  "The kettle surge":S=>{NOSHADE(S);DROP(S,/^(United Kingdom|Marchlyn Mawr.*)$/);VIEW(S,[-3.9,53.1,9])},
  /* the east's label ran under the map key, off shaded Japan, with a "Japan" label: framed a little east, the shading and
     the label go */
  "One country, two frequencies":S=>{NOSHADE(S);DROP(S,/^Japan$/);VIEW(S,[142,37,3.5])},
  /* Xinjiang's label hung at the globe's top edge and Bhadla's ran under the map key: framed closer on Asia */
  "The energy transition":S=>VIEW(S,[85,33,1.5]),
  "Now explore":S=>VIEW(S,[30,25,1])
};
FIX.currencies={};
FIX.conflicts={};


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
 PEND=false;try{f(S)}catch(e){console.error("rw4 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rw4-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw4){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw4=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw4-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw4-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw4-new");void e.offsetWidth;e.classList.add("rw4-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw4-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw4-rank"></ol><div class="rw4-pool"></div>'+
  '<div class="rw4-btns"><button type="button" class="rw4-btn rw4-undo">Undo</button><button type="button" class="rw4-btn rw4-show">Show me</button><button type="button" class="rw4-btn rw4-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw4-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw4-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw4-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw4-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw4-ok":"rw4-no"):"")+'"><span class="rw4-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw4-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw4-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw4-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw4-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw4-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw4-show").hidden=L.shown;c.querySelector(".rw4-again").hidden=!L.shown;
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
 card(L){return'<div class="rw4-btns rw4-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw4-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw4-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw4-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw4-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw4-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q&&f[5]!==2){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw4-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw4-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14);
  /* (rw4) a place may name its own towns, f[6] = [[lon, lat, name]], each a dot and a name tag once the globe is there */
  L.tgs=L.tgs||[];const T6=f[6]||[];T6.forEach((t,k)=>{if(!L.tgs[k])L.tgs[k]=tag(L,"rw4-ctag rw4-small");const p=proj(L,[t[0],t[1]]);if(p)svgEl(L.svg,"circle",{cx:p[0],cy:p[1],r:4.5,class:"rw4-tdot"});putTag(L,L.tgs[k],p,esc(t[2]),9)});
  for(let k=T6.length;k<L.tgs.length;k++)putTag(L,L.tgs[k],null)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw4-gq"><input type="range" class="rw4-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw4-gv"></b></div>'+
  '<div class="rw4-btns"><button type="button" class="rw4-btn rw4-chk">Check my guess</button><button type="button" class="rw4-btn rw4-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw4-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw4-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw4-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw4-rng");r.disabled=!!L.done;
  c.querySelector(".rw4-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw4-chk").hidden=!!L.done;c.querySelector(".rw4-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw4-q"><span class="rw4-n"></span><b class="rw4-item"></b></div><div class="rw4-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw4-btn rw4-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw4-btn rw4-next" hidden>Next →</button><button type="button" class="rw4-btn rw4-again" hidden>Start again</button></div><div class="rw4-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw4-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw4-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw4-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw4-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw4-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw4-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw4-good",L.wait&&i===it[1]);b.classList.toggle("rw4-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw4-next").hidden=!(L.wait&&!done);c.querySelector(".rw4-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw4-again").hidden=!done;
  c.querySelectorAll(".rw4-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw4-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw4-y":"rw4-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw4-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw4-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw4-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}




/* ---------------- a sorting game that rings each place it turns the globe to ----------------
   as SORT (above), each item's 5th field [lon, lat, zoom] the place a tap turns the globe to and its 6th field the name
   tagged there; the place of the last item tapped gets a ringed dot and its name */
function SORTM(cfg){const D=SORT(cfg);D.globe=true;const r0=D.render;
 D.render=function(L){r0.call(this,L);L.dirty=1};
 D.draw=function(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw4-ctag");const k=L.order&&L.order.length&&!L.gave?L.order[L.order.length-1]:null,it=k==null?null:cfg.items[k],
  q=it&&it[4]?proj(L,[it[4][0],it[4][1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw4-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw4-tdot"})}putTag(L,L.tg,q,esc(it&&it[5]||""),14)};
 return D}

/* ======================================================================== 1. Gubbio and the crater (bextinction, Gubbio)
   The gorge and the crater are some 100° of longitude apart; the buttons turn the globe between them. The texts are the
   card's own. */
const TURN_GUBBIO=TURNER({tours:["bextinction"],title:"Gubbio: the clay at the end of the dinosaurs",mark:true,
 tip:"The clue and the crater are an ocean apart: turn the globe from one to the other.",
 places:[["Chicxulub",-70,28,1.4,"In 1991 the asteroid’s crater was identified here, some 180 km wide (the small circle), over 9,000 km from Gubbio (the ruler).",2],
  ["Gubbio",12.58,43.36,2.4,"In the Bottaccione gorge, Walter and Luis Alvarez found the thin clay layer full of iridium, a metal rare on Earth but common in asteroids.",1]]});

/* ======================================================================== 2. The Big Five's rocks (bextinction, The Big
   Five and the Anthropocene) Scotland and China are 123° of longitude apart. The texts are the card's own. */
const TURN_BIG5=TURNER({tours:["bextinction"],title:"The Big Five and the Anthropocene",mark:true,
 tip:"The rocks that record the great extinctions are spread across the world: turn the globe to them.",
 places:[["Dob’s Linn and Gubbio",14,47,2,"At Dob’s Linn, in Scotland, tiny fossils called graptolites vanish at the first great extinction, 445 million years ago; at Gubbio a thin clay marks the end of the dinosaurs, 66 million years ago.",2],
  ["The Siberian Traps",95,59,2.2,"Giant volcanic eruptions here changed the air and the sea at the end of the Permian.",1],
  ["Meishan",121,28,2.2,"The rocks at Meishan, in China, mark the worst of the five, the end-Permian, 252 million years ago: roughly nine in ten species in the sea died.",1]]});

/* ======================================================================== 3. Who arrived, what vanished (bextinction, Where
   people arrived, big animals vanished) The stop's own dates; each tap turns the globe to the region and rings it. */
const SORT_ARRIVE=SORTM({tours:["bextinction"],title:"Where people arrived, big animals vanished",turns:true,
 tip:"Kolbert’s case: the giants vanished soon after people arrived. Put the losses in order, oldest first; each tap turns the globe there.",
 first:"Longest ago",last:"Most recent",bars:false,
 items:[["Australia’s giant kangaroos and wombats",-45000,"about 45,000 years ago",0,[134,-25,1.6],"Australia"],
  ["North America’s mammoths and mastodons",-11000,"about 13,000 years ago",0,[-100,42,1.4],"North America"],
  ["Madagascar’s elephant birds",1000,"about 1,000 years ago",0,[46.9,-19,2],"Madagascar"],
  ["New Zealand’s moas",1400,"about 600 years ago",0,[172,-43,2],"New Zealand"]],
 after:(r,N)=>"People reached Australia long before the Americas, and the islands of Madagascar and New Zealand last of all: the extinctions follow the same order. Many scientists think a changing climate played a part too, especially on the continents."});

/* ======================================================================== 4. Gone, or hanging on? (bextinction, Now
   explore) A review of the tour's animals, each answer from the stops above, except the golden toad's (Wikipedia, "Golden
   toad": last seen on 15 May 1989, declared extinct by the IUCN in 2004). Each answer turns the globe there. */
const BINS_EXT=BINS({tours:["bextinction"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Kolbert met animals already gone and animals clinging on. Which is each of these?",ask:"Gone for ever, or still hanging on?",
 bins:["Gone for ever","Still hanging on"],
 items:[["Panama’s golden frog",1,"It survives only in captivity, rescued just ahead of the chytrid fungus.",[-80.13,8.6,4],"El Valle"],
  ["The great auk",0,"The last known pair was killed on Eldey, off Iceland, in 1844.",[-22.96,63.74,3],"Eldey"],
  ["The golden toad of Monteverde",0,"Last seen in 1989; the IUCN declared it extinct in 2004.",[-84.8,10.3,4],"Monteverde"],
  ["The Sumatran rhino",1,"Perhaps a few dozen are left; a few calves have been born at Way Kambas.",[105.77,-4.93,3],"Way Kambas"],
  ["The nēnē, Hawaii’s goose",1,"Down to about 30 birds in the 1950s, it now numbers in the thousands.",[-159.5,22.05,3],"Hawaii"],
  ["The mastodon",0,"Its bones at Big Bone Lick showed Cuvier that whole species could vanish.",[-84.75,38.88,2.4],"Big Bone Lick"],
  ["The ‘alalā, Hawaii’s crow",1,"Gone from the wild in 2002, it is bred in captivity and released again.",[-155.3,19.5,3],"Hawaii"],
  ["The moa",0,"New Zealand’s giant birds were gone by about 1400.",[172,-43,2.2],"New Zealand"]],
 after:(r,N)=>(r===N?"All right! ":"")+"Every animal still hanging on is there because people worked to save it: Kolbert’s hope is that the ingenuity driving the extinction can also slow it."});

/* ======================================================================== 5. Iceland's hot water (energy, Iceland: heat from
   below) Wikipedia, "Geothermal power in Iceland": "at least 90% of all homes in Iceland are heated with geothermal
   energy". The stat's share is taken out (part 1) so the guess comes first. */
const GUESS_ICE=GUESS({tours:["energy"],title:"Iceland: heat from below",
 tip:"Hot water from under the ground warms Icelanders’ homes. How many homes, do you think?",
 vals:[10,25,40,50,60,75,90],start:2,answer:90,close:1,fmt:v=>v+"%",
 after:"At least nine in ten homes. Iceland sits on a plate boundary, where hot rock lies close to the surface."});

/* ======================================================================== 6. Fossil, renewable or nuclear? (energy, Now
   explore) A review of the tour's own places; each answer turns the globe there. */
const BINS_EN=BINS({tours:["energy"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"The tour visited every kind of power. Which kind is each of these?",ask:"Fossil fuel, renewable or nuclear?",
 bins:["Fossil fuel","Renewable","Nuclear"],
 items:[["Three Gorges Dam",1,"Falling water from the Yangtze: the world’s biggest power station.",[111,30.82,3],"Three Gorges"],
  ["Ghawar",0,"The largest conventional oil field ever found.",[49.2,25.4,3],"Ghawar"],
  ["Ratcliffe-on-Soar",0,"Britain’s last coal-fired power station, closed in 2024.",[-1.27,52.87,3.5],"Ratcliffe-on-Soar"],
  ["Flamanville",2,"France’s newest reactor, 2024.",[1.88,49.54,3.5],"Flamanville"],
  ["Dogger Bank",1,"Wind turbines on a sandbank far out in the North Sea.",[1.9,54.85,3.5],"Dogger Bank"],
  ["Nesjavellir",1,"Steam and hot water from under Iceland.",[-21.2,64.11,3],"Nesjavellir"],
  ["The Druzhba pipeline",0,"It carries Russian oil about 4,000 km into central Europe.",[52.3,54.9,2.4],"Almetyevsk"],
  ["Civaux",2,"One of France’s 57 reactors.",[0.17,46.27,3.5],"Civaux"],
  ["Noor Ouarzazate",1,"Mirrors focus the Saharan sunshine.",[-6.87,31.03,3],"Noor Ouarzazate"]],
 after:(r,N)=>(r===N?"All right! ":"")+"Oil, coal and gas still supply most of the world’s energy, but the renewables are growing fastest of all."});


const DEFS=[TURN_GUBBIO,TURN_BIG5,SORT_ARRIVE,BINS_EXT,GUESS_ICE,BINS_EN];



let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw4-layer rw4-layer";el.innerHTML='<svg class="rw4-sv"><defs><clipPath id="rw4Disc"><path class="rw4-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw4Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw4-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw4-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw4-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw4-ctl";
 c.innerHTML='<div class="rw4-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw4-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw4-ctl"))unmount()}catch(e){}},300);
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
.rw4-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw4-sv{position:absolute;left:0;top:0;overflow:visible}
.rw4-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw4-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw4-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw4-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw4-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw4-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw4-btn[hidden]{display:none}
.rw4-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw4-ep b{display:block;font-size:15px}
.rw4-ep.rw4-new{animation:rw4In .45s ease}@keyframes rw4In{from{opacity:.2;transform:translateY(4px)}}
.rw4-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw4-sortq i{font-style:normal}
.rw4-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw4}
.rw4-rank li{position:relative;counter-increment:rw4;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw4-rank li::before{content:counter(rw4);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw4-rank li.rw4-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw4-rank li.rw4-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw4-nm{flex:1 1 auto;z-index:1}.rw4-v{z-index:1;font-weight:800;white-space:nowrap}
.rw4-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw4-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw4-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw4-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw4-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw4-do,:is(body.dark-theme,body.sky-night) .rw4-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw4-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw4-btn,:is(body.dark-theme,body.sky-night) .rw4-chip,:is(body.dark-theme,body.sky-night) .rw4-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw4-rank li.rw4-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw4-rank li.rw4-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw4-bar{background:rgba(255,178,122,.2)}
.rw4-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw4-rng{flex:1 1 auto;accent-color:#d9682b}.rw4-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw4-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw4-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw4-item{font-size:16px;color:#13294b}
.rw4-bins{display:flex;gap:6px;flex-wrap:wrap}.rw4-bins .rw4-btn[hidden]{display:none}.rw4-bin:disabled{cursor:default;opacity:.55}
.rw4-btn.rw4-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw4-btn.rw4-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw4-dots{display:flex;gap:4px;margin-top:8px}.rw4-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw4-dots i.rw4-now{box-shadow:0 0 0 2px #d9682b inset}.rw4-dots i.rw4-y{background:#1f8a4c}.rw4-dots i.rw4-x{background:#c2364f}
.rw4-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw4-sl .rw4-row{margin-top:2px}.rw4-sl .rw4-val{min-width:36px}
.rw4-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw4-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw4-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw4-out b{font-size:15px;color:#9a4a16}
.rw4-ch{display:block;width:100%;height:auto;margin-top:6px}.rw4-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw4-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw4-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw4-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw4-val,:is(body.dark-theme,body.sky-night) .rw4-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw4-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw4-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw4-n,:is(body.dark-theme,body.sky-night) .rw4-sl label,:is(body.dark-theme,body.sky-night) .rw4-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw4-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw4-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw4-dots i{background:rgba(255,255,255,.18)}
.rw4-btn.rw4-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw4-btn.rw4-cur{background:#9fc3ff;color:#13294b}
.rw4-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw4-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw4-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw4-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw4-ep b .rw4-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw4-ep b .rw4-km{color:#ffb27a}
.rw4-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw4-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw4-small{font-size:11.5px!important;padding:2px 7px!important}
.rw4-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw4-gq .rw4-rng{flex:1 1 auto}.rw4-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw4-julh{fill:#c2364f}.rw4-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw4-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw4-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw4-gv{color:#ffb27a}
.rw4-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw4-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw4-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw4-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw4-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw4-clk{font-size:18px}.rw4-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw4-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw4-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw4-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw4-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw4-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw4-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw4-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw4-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw4-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw4-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw4-pig{color:#1f8a4c}
.rw4-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw4-mlg line,.rw4-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw4-mlg .rw4-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw4-mlg line,:is(body.dark-theme,body.sky-night) .rw4-mlg path,:is(body.dark-theme,body.sky-night) .rw4-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw4-mlg .rw4-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw4-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw4-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw4-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw4-pig{color:#4cc27f}
.rw4-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw4-kbw{fill:#7fb3e0}
.rw4-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw4-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw4-kbb.rw4-kbok{stroke:#f2b33d}.rw4-kbb.rw4-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw4-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw4-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw4-ctl .rw4-btn.rw4-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw4-ctl .rw4-btn.rw4-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw4-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw4={v:1,FIX,XFS,viewOf,tours:MYT,tryView(v){OVR=v||null},L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
