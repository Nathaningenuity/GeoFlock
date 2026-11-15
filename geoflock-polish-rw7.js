/* GeoFlock polish RW-7: a stop-by-stop review of six tours, each looked at on its default map (the globe) at 1280×860:
   South America's history (hsamerica), Oceania's story (hoceania), Antarctica's story (hantarctica), Music and sport
   (musicsport), Religion, language and change (hg3c) and Gunpowder and sail (hgunpowder).
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   The engine is geoflock-polish-rw4.js's, copied under "rw7" names so the files never touch each other's controls:
   frames looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here gets exactly its frame; fixed
   fields are non-configurable getters whose setters are ignored (a field already non-configurable is left alone). Pin
   lists are filtered through getters, photo pins wait for geoflock-portraits.js's portraits, and a stop whose photos
   are dropped gets its photo squares rebuilt. CSS classes start with "rw7-". Everything is wrapped in try/catch; Next
   and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRw7)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw7Test or ?rw7test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw7Test||/[?&]rw7test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rw7Test||/[?&]rw7test\b/.test(location.search)),enumerable:true,
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw7)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw7,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw7=1;window.psGlobeTarget=w}catch(e){}})(0);
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

FIX.hsamerica={
  /* the Monte Verde photo sat at the globe's bottom edge, on the test bar: framed a little further south */
  "Monte Verde":S=>VIEW(S,[-68,-31,1.15]),
  /* a "Peru" label on a long leader across the sea, and Caral was a small spot at the bottom: framed closer on Caral */
  "Caral":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-77.3,-11.2,6])},
  /* a "Peru" label on a leader, and the Nazca photo at the globe's bottom edge: framed closer on the lines */
  "The Nazca lines":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-75.1,-14.8,6])},
  /* the Cusco and Q'eswachaka photos lay on top of each other over the "Inca Empire" label, and the roads ran off the
     globe's bottom edge into Chile: the Cusco photo goes (Cusco has its photo at the next stop) and the stop is framed
     a little wider and further south */
  "The Inca roads":S=>{DROPPH(S,/^Cusco$/);VIEW(S,[-71,-17,1.5])},
  /* a "Peru" label hung at the globe's bottom edge and the Cusco photo sat on the map's switches: the label goes and
     the stop is framed from Panama down to Cusco */
  "Pizarro and Atahualpa":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-74,-5,2.4])},
  /* the Potosí photo ran off the globe's bottom edge and Seville's off its top right: framed with the whole silver
     route in sight; the "Bolivia" label goes */
  "The silver mountain":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-40,0,1])},
  /* the card sat on the right, over Africa and the slave ships' routes: card left, framed from Brazil to Angola; the
     "Brazil" label goes */
  "Brazil’s sugar coast":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-18,-10,1.15])},
  /* the card sat on the right over the continent's east: card left */
  "The liberators":S=>VIEW(S,[-68,-14,1.3]),
  "Brazil stayed whole":S=>VIEW(S,[-60,-20,1.1]),
  /* the card sat on the right and the globe was cut by the screen's left edge; four country labels hung on leaders */
  "The Paraguayan War":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-57.5,-27,3])},
  /* the card sat on the right and Bolivia's lost coast lay at the globe's left edge */
  "Bolivia loses the sea":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-68.8,-20.5,4])},
  /* Ceylon and Singapore were round the back of the globe and Santarém's label under the card: the stop's buttons turn
     the globe along the seeds' journey (part 2) */
  "The rubber boom":S=>VIEW(S,[-40,15,1]),
  /* the card sat on the right, three country labels hung on leaders and Patagonia was off the globe */
  "The new arrivals":S=>{NOCOUNTRY(S,SAM);VIEW(S,[-56,-31,1.9])},
  /* the Christ the Redeemer photo hid Salvador's label (Rio has its own label): it goes, and the stop is framed so all
     three capitals show */
  "Brasília":S=>{DROPPH(S,/^Brazil: Christ the Redeemer/);NOCOUNTRY(S,SAM);VIEW(S,[-44,-18,3])},
  /* the card sat on the right, over the eastern half of the continent */
  "Years of military rule":S=>VIEW(S,[-62,-22,1.1]),
  /* the distance moves into the stop's guess (part 2): great-circle distance London (51.51° N, 0.13° W) to Stanley
     (51.69° S, 57.85° W) is about 12,690 km */
  "The Falklands War":S=>{RE(S,"stat","fought a 74-day war over islands about 12,700 km from London","fought a 74-day war over islands far out in the South Atlantic: guess below how far they are from London");VIEW(S,[-62,-50,3.5])}
};

const OCE=["Australia","New Zealand","Finland","Norway","Papua New Guinea","Fiji","Vanuatu","Samoa","Tonga"];
FIX.hoceania={
  /* an "Australia" label on a long leader (the map names it) */
  "The oldest living culture":S=>NOCOUNTRY(S,OCE),
  /* the card sat on the right, over the eastern Pacific, Rapa Nui and South America, where the voyages end: card left */
  "Voyagers of the open Pacific":S=>VIEW(S,[-160,-12,1]),
  /* the card sat on the right, over Chile, which the stop measures Rapa Nui's distance from */
  "Easter Island’s giants":S=>VIEW(S,[-112,-27,1.3]),
  /* Portsmouth and Rio were round the back of the globe and Sydney Cove's photo at its bottom edge: the stop's buttons
     follow the fleet (part 2), opening on the whole route's far end, Sydney */
  "The First Fleet":S=>VIEW(S,[-10,10,1]),
  /* a "New Zealand" label on a leader across the South Island (the map names it) */
  "The Treaty of Waitangi":S=>{NOCOUNTRY(S,OCE);VIEW(S,[173.5,-40.5,3.5])},
  /* Ballarat, Bendigo, Melbourne and Moliagul lay within 1.5° of each other at a whole-continent zoom, their labels piled
     up on one spot: framed close on the goldfields */
  "Gold and the Eureka Stockade":S=>VIEW(S,[144.3,-37.2,13]),
  /* the card sat on the right and New Zealand, the stop's subject, was off the globe's bottom edge; the card's list of
     dates moves into the stop's sorting game (part 2), and the country labels go */
  "Women vote first":S=>{NOCOUNTRY(S,OCE);LOCK(S,"list",[]);VIEW(S,[160,-38,1.4])},
  /* the Big Island's label covered the map's "Hawaiian Kingdom" (the stop is about Honolulu) */
  "A kingdom overthrown":S=>DROP(S,/^Hawaiʻi, the Big Island$/),
  /* the card sat on the right, with "Australia" and "New Zealand" labels on long leaders */
  "Federation":S=>{NOCOUNTRY(S,OCE);VIEW(S,[150,-32,1.5])},
  /* Albany was at the globe's bottom edge and Gallipoli's photo under the card: the stop's buttons follow the troopships
     (part 2) */
  "The Anzac legend":S=>VIEW(S,[80,0,1]),
  /* the card sat on the right, Darwin was off the globe's left edge and Sydney off its bottom */
  "Bombs on Darwin":S=>VIEW(S,[146,-20,1.35]),
  /* the card sat on the right, over Moruroa: framed so the Australian sites clear the card and Moruroa stays in sight */
  "Nuclear tests":S=>VIEW(S,[168,-12,1.05]),
  "New Pacific nations":S=>VIEW(S,[172,-10,1.1])
};

FIX.hantarctica={
  /* the card sat on the right, over half of Cook's circle and his portrait */
  "Cook circles the ice":S=>VIEW(S,[-60,-90,1.6]),
  /* Bellingshausen's sighting, the first of the three, was not on the map at all: the stop's buttons turn the globe to
     each sighting (part 2), opening on all three */
  "First sight of land":S=>VIEW(S,[-30,-66,1.6]),
  /* South Georgia's label ran under the map key; a second "South Georgia (United Kingdom)" label doubled the Grytviken
     photo's */
  "Seals and whales":S=>{DROP(S,/^South Georgia/);VIEW(S,[-44,-61,3])},
  /* the card sat on the right */
  "The first winter":S=>VIEW(S,[-80,-90,1.6]),
  "Race to the Pole":S=>VIEW(S,[180,-84,2.6]),
  /* the card sat on the right and the map key, pushed left, hid Elephant Island and Shackleton's portrait */
  "Endurance":S=>VIEW(S,[-45,-63,2.4]),
  /* the twelve signers are all round the world: the stop's game turns the globe to them (part 2); opening with
     Antarctica in sight */
  "A continent for science":S=>VIEW(S,[20,-45,1]),
  /* the card sat on the right and the Drake Passage lay under the map key */
  "Tourists on the ice":S=>VIEW(S,[-66,-60,3.2])
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
 PEND=false;try{f(S)}catch(e){console.error("rw7 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rw7-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw7){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw7=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw7-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw7-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw7-new");void e.offsetWidth;e.classList.add("rw7-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw7-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw7-rank"></ol><div class="rw7-pool"></div>'+
  '<div class="rw7-btns"><button type="button" class="rw7-btn rw7-undo">Undo</button><button type="button" class="rw7-btn rw7-show">Show me</button><button type="button" class="rw7-btn rw7-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw7-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw7-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw7-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw7-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw7-ok":"rw7-no"):"")+'"><span class="rw7-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw7-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw7-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw7-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw7-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw7-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw7-show").hidden=L.shown;c.querySelector(".rw7-again").hidden=!L.shown;
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
 card(L){return'<div class="rw7-btns rw7-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw7-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw7-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw7-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw7-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw7-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q&&f[5]!==2){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw7-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw7-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14);
  /* (rw7) a place may name its own towns, f[6] = [[lon, lat, name]], each a dot and a name tag once the globe is there */
  L.tgs=L.tgs||[];const T6=f[6]||[];T6.forEach((t,k)=>{if(!L.tgs[k])L.tgs[k]=tag(L,"rw7-ctag rw7-small");const p=proj(L,[t[0],t[1]]);if(p)svgEl(L.svg,"circle",{cx:p[0],cy:p[1],r:4.5,class:"rw7-tdot"});putTag(L,L.tgs[k],p,esc(t[2]),9)});
  for(let k=T6.length;k<L.tgs.length;k++)putTag(L,L.tgs[k],null)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw7-gq"><input type="range" class="rw7-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw7-gv"></b></div>'+
  '<div class="rw7-btns"><button type="button" class="rw7-btn rw7-chk">Check my guess</button><button type="button" class="rw7-btn rw7-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw7-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw7-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw7-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw7-rng");r.disabled=!!L.done;
  c.querySelector(".rw7-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw7-chk").hidden=!!L.done;c.querySelector(".rw7-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw7-q"><span class="rw7-n"></span><b class="rw7-item"></b></div><div class="rw7-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw7-btn rw7-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw7-btn rw7-next" hidden>Next →</button><button type="button" class="rw7-btn rw7-again" hidden>Start again</button></div><div class="rw7-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw7-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw7-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw7-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw7-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw7-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw7-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw7-good",L.wait&&i===it[1]);b.classList.toggle("rw7-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw7-next").hidden=!(L.wait&&!done);c.querySelector(".rw7-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw7-again").hidden=!done;
  c.querySelectorAll(".rw7-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw7-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw7-y":"rw7-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw7-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw7-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw7-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}




/* ---------------- a sorting game that rings each place it turns the globe to ----------------
   as SORT (above), each item's 5th field [lon, lat, zoom] the place a tap turns the globe to and its 6th field the name
   tagged there; the place of the last item tapped gets a ringed dot and its name */
function SORTM(cfg){const D=SORT(cfg);D.globe=true;const r0=D.render;
 D.render=function(L){r0.call(this,L);L.dirty=1};
 D.draw=function(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw7-ctag");const k=L.order&&L.order.length&&!L.gave?L.order[L.order.length-1]:null,it=k==null?null:cfg.items[k],
  q=it&&it[4]?proj(L,[it[4][0],it[4][1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw7-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw7-tdot"})}putTag(L,L.tg,q,esc(it&&it[5]||""),14)};
 return D}


/* ======================================================================== 1. Follow the seeds (hsamerica, The rubber boom)
   Santarém, Kew and Ceylon are some 135° of longitude apart; the buttons follow the seeds. The texts are the card's
   own. */
const TURN_RUBBER=TURNER({tours:["hsamerica"],title:"The rubber boom",mark:true,
 tip:"The seeds went halfway round the world: follow them with the buttons.",
 places:[["The Amazon",-57,-3,2.2,"The best rubber trees grew wild only here; Manaus grew rich, and in 1896 opened an opera house built with European marble and glass.",2,[[-60.02,-3.13,"Manaus"]]],
  ["Kew Gardens, London",-0.29,51.48,2.4,"In 1876 Henry Wickham shipped about 70,000 rubber seeds from Santarém to Kew, where seedlings were raised.",1],
  ["Ceylon and Singapore",92,4,1.7,"The seedlings started plantations in British Asia, and by about 1913 these were outselling the Amazon.",2,[[79.86,6.93,"Ceylon"],[103.8,1.35,"Singapore"]]]]});

/* ======================================================================== 2. How far? (hsamerica, The Falklands War)
   Great-circle distances worked out from the places' coordinates: London (51.51° N, 0.13° W) to Stanley (51.69° S,
   57.85° W) about 12,690 km; Stanley to Río Gallegos, on Argentina's coast (51.62° S, 69.22° W), about 780 km. The
   stat's figure is taken out (part 1) so the guess comes first. */
const GUESS_FALK=GUESS({tours:["hsamerica"],title:"The Falklands War",
 tip:"Britain sent a fleet to take the islands back. How far is Stanley from London, do you think?",
 vals:[1000,3000,6000,9000,12700,16000,20000],start:2,answer:12700,close:0,fmt:v=>v.toLocaleString("en-GB")+" km",
 after:"About 12,700 km: the fleet sailed for weeks. Argentina’s coast is only about 780 km away."});

/* ======================================================================== 3. South America in order (hsamerica, Now explore)
   The tour's own dates; each tap turns the globe there and names the place. */
const SORT_SAM=SORTM({tours:["hsamerica"],title:"Now explore",turns:true,
 tip:"From the first campers to the Falklands: put the tour’s moments in order, oldest first. Each tap turns the globe there.",
 first:"Longest ago",last:"Most recent",bars:false,
 items:[["People camp at Monte Verde",-12500,"about 14,500 years ago",0,[-73.2,-41.5,2.4],"Monte Verde"],
  ["The Chinchorro mummify their dead",-5000,"about 7,000 years ago",0,[-70.3,-18.5,2.6],"Arica"],
  ["Caral’s pyramids rise",-2700,"4,500–5,000 years ago",0,[-77.52,-10.89,2.6],"Caral"],
  ["The Nazca draw in the desert",0,"about 2,000 years ago",0,[-75.13,-14.72,2.6],"Nazca"],
  ["Pizarro captures Atahualpa",1532,"1532",0,[-78.52,-7.16,2.6],"Cajamarca"],
  ["San Martín crosses the Andes",1817,"1817",0,[-68.83,-32.89,2.4],"Mendoza"],
  ["Bolivia loses its coast",1879,"1879–84",0,[-70.4,-23.65,2.6],"Antofagasta"],
  ["Brasília opens",1960,"1960",0,[-47.88,-15.79,2.4],"Brasília"],
  ["The Falklands War",1982,"1982",0,[-57.85,-51.69,2.4],"Stanley"]],
 after:(r,N)=>"About 14,000 years of history: people reached the far south of the continent long before the first cities rose, and the cities thousands of years before the Inca."});

/* ======================================================================== 4. Follow the First Fleet (hoceania, The First
   Fleet) Wikipedia, "First Fleet": "The fleet finally left Portsmouth, England on 13 May 1787"; "The Fleet reached Rio de
   Janeiro on 5 August and stayed for a month"; it left on 4 September and reached Table Bay "on 13 October"; the first
   ships reached Botany Bay on 18 January 1788 and the fleet moved to Sydney Cove on 26 January. */
const TURN_FLEET=TURNER({tours:["hoceania"],title:"The First Fleet",mark:true,
 tip:"Eight months at sea: follow the eleven ships with the buttons.",
 places:[["Portsmouth",-1.1,50.8,2.2,"13 May 1787: eleven ships leave Portsmouth with about 1,400 people, over half of them convicts.",1],
  ["Rio de Janeiro",-43.2,-22.9,2,"5 August 1787: after stopping at Tenerife, the fleet crosses the Atlantic to Rio, and stays a month.",1],
  ["Cape Town",18.4,-33.9,2,"13 October 1787: the last stop before the long run east across the Indian Ocean.",1],
  ["Sydney Cove",151.2,-33.86,2.2,"January 1788: the first ships reach Botany Bay on the 18th; on the 26th the British flag is raised at Sydney Cove.",1]]});

/* ======================================================================== 5. Albany to Gallipoli (hoceania, The Anzac
   legend) The three places are some 90° of longitude apart; the texts are the card's own, with the convoy's dates from
   the Australian War Memorial (awm.gov.au, "Dig deeper: the first convoy"): it left King George Sound, Albany, on 1
   November 1914 and reached Alexandria on 3 December 1914. */
const TURN_ANZAC=TURNER({tours:["hoceania"],title:"The Anzac legend",mark:true,
 tip:"The ANZACs went halfway round the world: follow them with the buttons.",
 places:[["Albany",117.9,-35,2.2,"1 November 1914: the first convoy of Australian and New Zealand troops sails from Albany, in Western Australia.",1],
  ["Egypt",31.2,30.05,2.4,"3 December 1914: the convoy reaches Alexandria, and the troops train in camps in Egypt.",1],
  ["Gallipoli",26.3,40.2,3,"On 25 April 1915 they landed at Gallipoli, in Ottoman Turkey; after eight months they withdrew. About 8,700 Australians and 2,800 New Zealanders died there.",1]]});

/* ======================================================================== 6. Who voted first? (hoceania, Women vote first)
   The years are the card's own list (taken off the card in part 1 so the game comes first); each tap turns the globe
   there. */
const SORT_VOTE=SORTM({tours:["hoceania"],title:"Women vote first",turns:true,
 tip:"Where did women win the vote in national elections first? Put these in order, earliest first; each tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["New Zealand",1893,"1893",0,[172,-41,2],"New Zealand"],["Australia",1902,"1902",0,[134,-25,1.6],"Australia"],
  ["Finland",1906,"1906",0,[26,63,2],"Finland"],["Norway",1913,"1913",0,[10,61,2],"Norway"],
  ["United Kingdom",1918,"1918 (some), 1928 (all)",0,[-2,53.5,2.2],"United Kingdom"],["United States",1920,"1920",0,[-98,39,1.6],"United States"]],
 after:(r,N)=>"New Zealand was first, in 1893, and Australia next; in Europe and North America women won the vote only in the 1900s."});

/* ======================================================================== 7. Three sightings (hantarctica, First sight of
   land) Bellingshausen's position: Wikipedia, "Fabian Gottlieb von Bellingshausen": on 27 January 1820 (New Style) his
   expedition saw the ice "at a point with coordinates 69º21'28"S 2º14'50"W". The other texts are the card's own. */
const TURN_SIGHT=TURNER({tours:["hantarctica"],title:"First sight of land",mark:true,
 tip:"Three expeditions, one year: turn the globe to each sighting, in order.",
 places:[["All three",-30,-66,1.6,"Bellingshausen’s sighting was far to the east of the other two: about 55° of longitude away.",2],
  ["Bellingshausen",-2.25,-69.36,2.6,"27 January 1820: the Russian expedition led by Bellingshausen sees an ice shelf. He may not have known he was looking at a continent."],
  ["Bransfield",-57,-63.5,3,"30 January 1820: three days later, Britain’s Edward Bransfield sights the Antarctic Peninsula.",1],
  ["Palmer",-61.5,-64.5,3,"November 1820: the American sealer Nathaniel Palmer sees it too.",1]]});

/* ======================================================================== 8. The race (hantarctica, Race to the Pole)
   A date slider moves both teams along the stop's own routes. Dates: Wikipedia, "Amundsen's South Pole expedition":
   the polar party left Framheim, on the Bay of Whales, on 19 October 1911, reached the Pole on 14 December 1911 and was
   back at Framheim on 25 January 1912. Wikipedia, "Terra Nova expedition": Scott's main party "left Cape Evans on 1
   November", reached the Pole on 17 January 1912; the last diary entry is dated 29 March 1912, "11 miles (18 km) south
   of One Ton Depot" (the stop's "Scott's last tent" pin). Between these dates each team is drawn as if it moved at a
   steady pace: the real days were very uneven, which the card says. */
const RACE=(function(){const DAY=864e5,T0=Date.UTC(1911,9,19),T1=Date.UTC(1912,2,29),N=Math.round((T1-T0)/DAY);
 const d=(y,m,dd)=>Math.round((Date.UTC(y,m-1,dd)-T0)/DAY);
 const A=[[-164,-78.5],[-163.5,-82],[-165,-85.3],[-162,-88],[-160,-89.9]],S0=[[166.4,-77.6],[169,-80],[171,-83.5],[163,-86],[160,-89.9]];
 const SB=S0.slice(1).reverse().concat([[169.5,-79.6]]);
 const along=(P,f)=>{f=clamp(f,0,1);const L=[];let tot=0;for(let i=1;i<P.length;i++){const s=d3.geoDistance(P[i-1],P[i]);L.push(s);tot+=s}
  let t=f*tot;for(let i=0;i<L.length;i++){if(t<=L[i]||i===L.length-1)return d3.geoInterpolate(P[i],P[i+1])(L[i]?Math.min(1,t/L[i]):0);t-=L[i]}return P[P.length-1]};
 const Aat=k=>k<=d(1911,12,14)?along(A,k/d(1911,12,14)):k<=d(1912,1,25)?along(A.slice().reverse(),(k-d(1911,12,14))/(d(1912,1,25)-d(1911,12,14))):A[0];
 const Sat=k=>k<d(1911,11,1)?S0[0]:k<=d(1912,1,17)?along(S0,(k-d(1911,11,1))/(d(1912,1,17)-d(1911,11,1))):along(SB,(k-d(1912,1,17))/(N-d(1912,1,17)));
 const EV=[[0,"19 October 1911","Amundsen’s five men leave the Bay of Whales with four sledges and 52 dogs. Scott has not set out yet."],
  [d(1911,11,1),"1 November 1911","Scott’s main party leaves Cape Evans, on Ross Island, with ponies and dogs."],
  [d(1911,12,14),"14 December 1911","Amundsen’s team reaches the South Pole."],
  [d(1912,1,17),"17 January 1912","Scott reaches the Pole, 34 days later, and finds a Norwegian tent."],
  [d(1912,1,25),"25 January 1912","Amundsen is safely back at the Bay of Whales. Scott’s men are still high on the plateau."],
  [N,"29 March 1912","Scott’s last three men die in their tent, about 18 km from a supply depot."]];
 const fmtD=k=>new Date(T0+k*DAY).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
 return{tours:["hantarctica"],title:"Race to the Pole",globe:true,
  tip:"Drag the days, or press play, to watch the race to the Pole.",
  card(L){return'<div class="rw7-gq"><button type="button" class="rw7-btn rw7-play" aria-label="Play">▶</button><input type="range" class="rw7-rng" min="0" max="'+N+'" step="1" value="0" aria-label="Date"><b class="rw7-gv"></b></div>'+
   '<div class="rw7-race"><span class="rw7-ra">Amundsen</span><span class="rw7-rs">Scott</span></div><div class="rw7-note">Each team is drawn moving at a steady pace between the dates known; the real days were very uneven.</div>'},
  wire(L){const c=L.card,r=c.querySelector(".rw7-rng"),pb=c.querySelector(".rw7-play");L.k=0;L.playing=false;
   r.oninput=()=>{L.k=+r.value;L.playing=false;this.render(L)};
   pb.onclick=()=>{if(L.playing){L.playing=false;this.render(L);return}if(L.k>=N)L.k=0;L.playing=true;let t0=performance.now();
    const step=t=>{if(!L.playing||!L.card||!L.card.isConnected){L.playing=false;return}L.k=Math.min(N,L.k+(t-t0)/1000*12);t0=t;if(L.k>=N)L.playing=false;this.render(L);if(L.playing)requestAnimationFrame(step)};requestAnimationFrame(step);this.render(L)};
   this.render(L)},
  off(L){L.playing=false},
  render(L){const c=L.card;if(!c)return;const k=Math.round(L.k),r=c.querySelector(".rw7-rng");r.value=k;c.querySelector(".rw7-gv").textContent=fmtD(k);
   c.querySelector(".rw7-play").textContent=L.playing?"❚❚":"▶";
   let e=EV[0];EV.forEach(x=>{if(x[0]<=k)e=x});say(L,e[1],e[2]);L.dirty=1},
  draw(L){if(!L.svg)return;L.svg.innerHTML="";const k=L.k||0;
   if(!L.ta){L.ta=tag(L,"rw7-ctag rw7-small rw7-tA");L.ts=tag(L,"rw7-ctag rw7-small rw7-tS")}
   const qp=proj(L,[0,-90]);if(qp)svgEl(L.svg,"circle",{cx:qp[0],cy:qp[1],r:7,class:"rw7-pole"});
   const a=proj(L,Aat(k)),s=proj(L,Sat(k));
   if(a)svgEl(L.svg,"circle",{cx:a[0],cy:a[1],r:8,class:"rw7-mA"});if(s)svgEl(L.svg,"circle",{cx:s[0],cy:s[1],r:8,class:"rw7-mS"});
   putTag(L,L.ta,a,"Amundsen",12);putTag(L,L.ts,s,"Scott",12)}}})();

/* ======================================================================== 9. Signed in 1959? (hantarctica, A continent for
   science) Wikipedia, "Antarctic Treaty System": the 12 original signatories (Argentina, Australia, Belgium, Chile,
   France, Japan, New Zealand, Norway, South Africa, the Soviet Union, the United Kingdom and the United States), and the
   year others became parties, and "58" parties as of 2024: China 1983, India 1983, Brazil 1975, West Germany 1979, Canada 1988. Each answer turns
   the globe to the country. */
const BINS_TREATY=BINS({tours:["hantarctica"],title:"A continent for science",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Twelve countries signed the treaty in 1959; dozens joined later. Which is each of these?",ask:"Signed in 1959, or joined later?",
 bins:["Signed in 1959","Joined later"],
 items:[["Norway",0,"One of the twelve.",[10,62,1.8],"Norway"],
  ["China",1,"It joined in 1983.",[104,35,1.4],"China"],
  ["Japan",0,"One of the twelve.",[138,37,1.8],"Japan"],
  ["India",1,"It joined in 1983.",[79,22,1.6],"India"],
  ["Brazil",1,"It joined in 1975.",[-52,-10,1.4],"Brazil"],
  ["South Africa",0,"One of the twelve.",[24,-29,1.8],"South Africa"],
  ["Belgium",0,"One of the twelve.",[4.5,50.6,2.2],"Belgium"],
  ["Germany",1,"West Germany joined in 1979.",[10.4,51.2,2],"Germany"],
  ["Australia",0,"One of the twelve.",[134,-25,1.6],"Australia"],
  ["Canada",1,"It joined in 1988.",[-100,58,1.4],"Canada"]],
 after:(r,N)=>(r===N?"All right! ":"")+"The twelve were the countries with bases in Antarctica in 1957–58. By 2024, 58 countries had joined the treaty."});

/* ======================================================================== 10. Up the river (musicsport, Born in the American
   South) The stop's own places and texts: the music follows its line from New Orleans up the Mississippi to Chicago,
   and on to the Bronx. */
const TURN_SOUTH=TURNER({tours:["musicsport"],title:"Born in the American South",mark:true,
 tip:"Follow the music up the Mississippi: each button turns the globe to where a sound was born.",
 places:[["New Orleans",-90.07,29.95,4,"Jazz: African American musicians created it in New Orleans around 1900.",1],
  ["The Mississippi Delta",-90.57,34.2,4,"The blues grew up in the cotton country of the Mississippi Delta.",1],
  ["Memphis",-90.05,35.15,4,"Memphis gave the world rock and roll, and Elvis Presley, in the 1950s.",1],
  ["Chicago",-87.63,41.88,4,"Millions of Black Americans moved north in the Great Migration and took the blues with them; in Chicago it went electric.",1],
  ["The Bronx",-73.87,40.84,4,"Hip hop began at block parties in the Bronx, New York, in the 1970s.",1]]});

/* ======================================================================== 11. Where did it begin? (musicsport, Now explore)
   A review of the tour's own stops; each answer turns the globe to the place the card names. */
const BINS_MS=BINS({tours:["musicsport"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"The tour found where the world’s favourite sounds and sports began. Where did each of these start?",ask:"Which part of the world?",
 bins:["The Americas","Europe or Africa","Asia"],
 items:[["Reggae",0,"It grew up in Kingston, Jamaica, in the 1960s.",[-76.79,18,2.6],"Kingston"],
  ["Judo",2,"It was invented in Tokyo in 1882.",[139.7,35.7,2.6],"Tokyo"],
  ["Tango",0,"It was born in the ports of the Río de la Plata in the late 1800s.",[-57.5,-35,2.4],"Río de la Plata"],
  ["Afrobeats",1,"It comes from Lagos, in Nigeria.",[3.38,6.52,2.6],"Lagos"],
  ["The Beatles",1,"They formed in Liverpool in 1960.",[-2.98,53.41,2.8],"Liverpool"],
  ["Chess",2,"It began in India about 1,500 years ago, as chaturanga.",[78,22,2],"India"],
  ["Hip hop",0,"It began at block parties in the Bronx, New York, in the 1970s.",[-73.87,40.84,2.6],"The Bronx"],
  ["Taekwondo",2,"It was developed in South Korea in the 1950s.",[127,37.57,2.6],"South Korea"],
  ["Football’s modern rules",1,"They were written in England in 1863.",[-0.13,51.51,2.8],"London"],
  ["Capoeira",0,"It comes from enslaved Africans in Brazil.",[-38.5,-12.97,2.4],"Bahia"]],
 after:(r,N)=>(r===N?"All right! ":"")+"Each began in one place, and then travelled with sailors, migrants, soldiers, records and now the internet."});

/* ======================================================================== 12. Two kinds of faith (hg3c, Two kinds of faith)
   The card's own sorting (Christianity, Islam and Buddhism universalising; Hinduism, Shinto and Judaism ethnic); each
   answer turns the globe to the faith's hearth, as pinned on the stop. */
const BINS_FAITH=BINS({tours:["hg3c"],title:"Two kinds of faith",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Does each faith seek converts everywhere, or belong mainly to one people? Sort them.",ask:"Universalising or ethnic?",
 bins:["Universalising","Ethnic"],
 items:[["Christianity",0,"About 2.4 billion followers; it offers its message to all and spread by conversion.",[35.2,31.8,2.6],"Jerusalem"],
  ["Islam",0,"About 2 billion followers; it spread by conversion from its hearth in Arabia.",[39.8,21.4,2.6],"Mecca"],
  ["Hinduism",1,"Tied to one people and homeland: it spread mainly when believers migrated, as Indian workers did to Mauritius, Fiji and Trinidad.",[83,25.3,2.6],"Varanasi"],
  ["Buddhism",0,"It began in northern India but lives on mostly in East and Southeast Asia, carried by converts.",[83.3,27.5,2.6],"Lumbini"],
  ["Shinto",1,"Japan’s own faith, tied to its people and land.",[138,36,2.4],"Japan"],
  ["Judaism",1,"Tied to one people and a homeland.",[35.2,31.8,2.6],"Jerusalem"]],
 after:(r,N)=>(r===N?"All right! ":"")+"Universalising faiths spread far from their hearths by conversion; ethnic faiths stay mostly where their people live, and move when they migrate."});

/* ======================================================================== 13. Acculturation or assimilation? (hg3c,
   Acculturation and assimilation) The card's own definitions, tried on simple made-up examples (the first two are the
   card's own). */
const BINS_ACC=BINS({tours:["hg3c"],title:"Acculturation and assimilation",
 tip:"Try the two ideas on some families. Has each adopted the new culture while keeping its own, or lost its own?",ask:"Acculturation or assimilation?",
 bins:["Acculturation","Assimilation"],
 items:[["A family speaks English at work and their home language at home",0,"They have adopted a trait of the new culture and kept their own."],
  ["Great-grandchildren of Italian immigrants speak only English",1,"The original language is largely lost."],
  ["A newcomer learns the local language but still cooks and celebrates as at home",0,"New traits added, old ones kept."],
  ["After three generations, a family keeps none of its old festivals or language",1,"The original culture has largely gone."],
  ["Children of immigrants watch local TV, then pray at their parents’ temple",0,"Two cultures side by side in one family."]],
 after:(r,N)=>(r===N?"All right! ":"")+"Acculturation adds; assimilation replaces. Many families pass from the first to the second over a few generations."});

/* ======================================================================== 14. Portugal's sea road in order (hgunpowder,
   Round Africa to India) The stop's own dates (its pins and photos); each tap turns the globe there. */
const SORT_PORT=SORTM({tours:["hgunpowder"],title:"Round Africa to India",turns:true,
 tip:"Portugal worked its way round Africa to Asia, port by port. Put the steps in order; each tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["A castle at Elmina, West Africa",1482,"1482",0,[-1.35,5.08,2.4],"Elmina"],["Round the Cape of Good Hope",1488,"1488",0,[18.47,-34.36,2.4],"Cape of Good Hope"],
  ["Vasco da Gama reaches Calicut",1498,"1498",0,[75.8,11.25,2.4],"Calicut"],["Goa is seized",1510,"1510",0,[73.82,15.5,2.4],"Goa"],
  ["Malacca is seized",1511,"1511",0,[102.25,2.19,2.4],"Malacca"],["Hormuz is seized",1515,"1515",0,[56.46,27.06,2.4],"Hormuz"],
  ["A trading post at Macau",1557,"1557",0,[113.54,22.19,2.4],"Macau"]],
 after:(r,N)=>"In 75 years Portugal reached from West Africa to China: mostly by holding fortified ports and controlling the sea lanes with guns on ships."});

/* ======================================================================== 15. From the Americas, or to them? (hgunpowder,
   The Columbian exchange) The card's own lists: maize, potatoes, tomatoes, chillies and cacao went from the Americas;
   wheat, sugar cane, coffee, horses, cattle and pigs, and smallpox, went to them. */
const BINS_EXCH=BINS({tours:["hgunpowder"],title:"The Columbian exchange",
 tip:"After 1492 ships carried plants, animals and germs both ways. Which way did each go?",ask:"Which way across the Atlantic?",
 bins:["From the Americas","To the Americas"],turn:[[-80,5,1.2],[0,28,1.2]],
 items:[["Potatoes",0,"From the Andes. The potato later helped Europe’s population grow."],
  ["Maize",0,"From Mexico and Central America; it became a staple across Africa."],
  ["Horses",1,"Europeans brought them west across the Atlantic."],
  ["Chillies",0,"Before 1492 there were no chillies in India."],
  ["Wheat",1,"It came from the Old World."],
  ["Smallpox",1,"New to the Americas, it killed a huge share of their peoples in the 1500s."],
  ["Tomatoes",0,"Before 1492 there were no tomatoes in Italy."],
  ["Coffee",1,"It came from the Old World."],
  ["Cattle",1,"Brought by Europeans from the Old World."],
  ["Cacao",0,"Chocolate’s bean comes from the Americas."]],
 after:(r,N)=>(r===N?"All right! ":"")+"The exchange changed what the whole world eats, but the germs did the most harm."});

/* ======================================================================== 16. Silver round the world (hgunpowder, Silver
   and the Manila galleons) Potosí, Acapulco and Manila are 174° of longitude apart; the texts are the card's own. */
const TURN_GALLEON=TURNER({tours:["hgunpowder"],title:"Silver and the Manila galleons",mark:true,
 tip:"Follow the silver halfway round the world with the buttons.",
 places:[["Potosí",-65.75,-19.58,2.2,"In 1545 the Spanish found a mountain of silver at Potosí, in today’s Bolivia, and forced Indigenous workers to mine it."],
  ["Acapulco",-99.9,16.85,2.2,"Much of the silver went north to Acapulco, in Mexico. From 1565 to 1815 a galleon sailed from here to Manila every year.",1],
  ["Manila",120.97,14.6,2.2,"Over 14,000 km of open ocean later, Chinese merchants traded silk and porcelain for the silver at Manila. Ming China collected its taxes in silver.",1]]});


/* styles for this file's own controls (the race) */
{const s=document.createElement("style");s.textContent=`
.rw7-play{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer;font-family:inherit}
.rw7-race{display:flex;gap:14px;margin-top:6px;font-size:12.5px;font-weight:800}.rw7-race span::before{content:"";display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:5px;vertical-align:-1px;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)}
.rw7-ra{color:#1f4fb4}.rw7-ra::before{background:#1f4fb4}.rw7-rs{color:#c2364f}.rw7-rs::before{background:#c2364f}
.rw7-note{margin-top:4px;font-size:11.5px;color:#5b6b7c}
.rw7-mA{fill:#1f4fb4;stroke:#fff;stroke-width:3}.rw7-mS{fill:#c2364f;stroke:#fff;stroke-width:3}.rw7-pole{fill:#fff;stroke:#13294b;stroke-width:2.5}
.rw7-tag.rw7-tA{background:#1f4fb4}.rw7-tag.rw7-tS{background:#c2364f}
:is(body.dark-theme,body.sky-night) .rw7-ra{color:#9fc3ff}:is(body.dark-theme,body.sky-night) .rw7-rs{color:#ff8a9e}:is(body.dark-theme,body.sky-night) .rw7-note{color:#aab6c8}
`;document.head.appendChild(s)}

const DEFS=[TURN_RUBBER,GUESS_FALK,SORT_SAM,TURN_FLEET,TURN_ANZAC,SORT_VOTE,TURN_SIGHT,RACE,BINS_TREATY,TURN_SOUTH,BINS_MS,BINS_FAITH,BINS_ACC,SORT_PORT,BINS_EXCH,TURN_GALLEON];



let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw7-layer rw7-layer";el.innerHTML='<svg class="rw7-sv"><defs><clipPath id="rw7Disc"><path class="rw7-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw7Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw7-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw7-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw7-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw7-ctl";
 c.innerHTML='<div class="rw7-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw7-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw7-ctl"))unmount()}catch(e){}},300);
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
.rw7-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw7-sv{position:absolute;left:0;top:0;overflow:visible}
.rw7-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw7-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw7-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw7-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw7-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw7-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw7-btn[hidden]{display:none}
.rw7-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw7-ep b{display:block;font-size:15px}
.rw7-ep.rw7-new{animation:rw7In .45s ease}@keyframes rw7In{from{opacity:.2;transform:translateY(4px)}}
.rw7-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw7-sortq i{font-style:normal}
.rw7-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw7}
.rw7-rank li{position:relative;counter-increment:rw7;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw7-rank li::before{content:counter(rw7);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw7-rank li.rw7-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw7-rank li.rw7-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw7-nm{flex:1 1 auto;z-index:1}.rw7-v{z-index:1;font-weight:800;white-space:nowrap}
.rw7-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw7-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw7-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw7-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw7-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw7-do,:is(body.dark-theme,body.sky-night) .rw7-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw7-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw7-btn,:is(body.dark-theme,body.sky-night) .rw7-chip,:is(body.dark-theme,body.sky-night) .rw7-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw7-rank li.rw7-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw7-rank li.rw7-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw7-bar{background:rgba(255,178,122,.2)}
.rw7-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw7-rng{flex:1 1 auto;accent-color:#d9682b}.rw7-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw7-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw7-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw7-item{font-size:16px;color:#13294b}
.rw7-bins{display:flex;gap:6px;flex-wrap:wrap}.rw7-bins .rw7-btn[hidden]{display:none}.rw7-bin:disabled{cursor:default;opacity:.55}
.rw7-btn.rw7-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw7-btn.rw7-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw7-dots{display:flex;gap:4px;margin-top:8px}.rw7-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw7-dots i.rw7-now{box-shadow:0 0 0 2px #d9682b inset}.rw7-dots i.rw7-y{background:#1f8a4c}.rw7-dots i.rw7-x{background:#c2364f}
.rw7-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw7-sl .rw7-row{margin-top:2px}.rw7-sl .rw7-val{min-width:36px}
.rw7-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw7-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw7-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw7-out b{font-size:15px;color:#9a4a16}
.rw7-ch{display:block;width:100%;height:auto;margin-top:6px}.rw7-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw7-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw7-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw7-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw7-val,:is(body.dark-theme,body.sky-night) .rw7-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw7-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw7-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw7-n,:is(body.dark-theme,body.sky-night) .rw7-sl label,:is(body.dark-theme,body.sky-night) .rw7-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw7-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw7-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw7-dots i{background:rgba(255,255,255,.18)}
.rw7-btn.rw7-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw7-btn.rw7-cur{background:#9fc3ff;color:#13294b}
.rw7-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw7-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw7-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw7-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw7-ep b .rw7-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw7-ep b .rw7-km{color:#ffb27a}
.rw7-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw7-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw7-small{font-size:11.5px!important;padding:2px 7px!important}
.rw7-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw7-gq .rw7-rng{flex:1 1 auto}.rw7-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw7-julh{fill:#c2364f}.rw7-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw7-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw7-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw7-gv{color:#ffb27a}
.rw7-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw7-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw7-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw7-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw7-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw7-clk{font-size:18px}.rw7-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw7-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw7-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw7-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw7-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw7-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw7-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw7-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw7-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw7-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw7-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw7-pig{color:#1f8a4c}
.rw7-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw7-mlg line,.rw7-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw7-mlg .rw7-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw7-mlg line,:is(body.dark-theme,body.sky-night) .rw7-mlg path,:is(body.dark-theme,body.sky-night) .rw7-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw7-mlg .rw7-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw7-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw7-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw7-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw7-pig{color:#4cc27f}
.rw7-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw7-kbw{fill:#7fb3e0}
.rw7-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw7-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw7-kbb.rw7-kbok{stroke:#f2b33d}.rw7-kbb.rw7-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw7-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw7-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw7-ctl .rw7-btn.rw7-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw7-ctl .rw7-btn.rw7-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw7-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw7={v:1,FIX,XFS,viewOf,tours:MYT,tryView(v){OVR=v||null},L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
