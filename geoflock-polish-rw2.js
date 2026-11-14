/* GeoFlock polish RW-2: a stop-by-stop review of four Books tours, The Travels of Ibn Battuta (brihla), The Most Remote
   Places (bremote), Prisoners of Geography (bprisoners) and Guns, Germs, and Steel (bggs), each looked at on its default
   map at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rw1.js (its helpers and engine, under "rw2" names so the files never touch each other's
   controls): frames looked up by tour and title and a psGlobeTarget wrapper, so a stop framed here gets exactly its frame;
   fixed fields are non-configurable getters whose setters are ignored (a field already non-configurable is left alone).
   Pin lists are filtered through getters (a getter another file already put on a field stays underneath), photo pins wait
   for geoflock-portraits.js's portraits, and a stop whose photos are dropped gets its photo squares rebuilt. CSS classes
   start with "rw2-". Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRw2)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rw2Test or ?rw2test, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rw2Test||/[?&]rw2test\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rw2Test||/[?&]rw2test\b/.test(location.search)),enumerable:true,
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rw2)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRw2,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rw2=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);


const FIX={};
/* take a portrait (added by geoflock-portraits.js) off a stop */
const NOPPL=(S,name)=>{const L=NOP.get(S)||[];if(!L.includes(name))L.push(name);NOP.set(S,L);DROPPH(S,new RegExp("^"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"))};


FIX.brihla={
  /* Tangier lay under the card, the Qutb Minar photo on the zoom buttons, Quanzhou and the West Lake photo at the globe's
     right edge by the map key and the dhow photo at the bottom edge: framed Tangier to Delhi and Kilwa (Quanzhou, at the
     far end, is round the globe's edge; the review on the last stop turns the globe there); those three photos go, and so does Shah-i-Zinda's, which the new frame put on the zoom
     buttons. The "Tangier: home" label lay under the walking game's own "Tangier" bubble (Delhi, the Swahili coast and China have stops of their own). The
     distance moves into the guess on "A book from memory" (it is revealed there) */
  "The Travels of Ibn Battuta":S=>{DROP(S,/^Tangier: home$/);DROPPH(S,/^(The Qutb Minar|West Lake|A dhow off|Shah-i-Zinda)/);RE(S,"stat","travelled some 117,000 km, probably farther","travelled across the Muslim world and beyond, probably farther");VIEW(S,[30.5,15.3,1])},
  /* Alexandria, where the stop's road ends, and the Cairo photo lay off the globe's right edge: framed Tangier to
     Alexandria; the Cairo photo, then pushed under the map key, goes (the next stop shows Cairo), and so does a "Morocco"
     label on a long leader (the map names it) */
  "Tangier, 1325":S=>{DROPPH(S,/^Cairo on the Nile/);DROP(S,/^Morocco$/);VIEW(S,[16.9,34.4,2.05])},
  /* Hormuz, Zafar's road home and the Old Muscat photo lay off the globe's top right edge: framed Kilwa to Hormuz */
  "Down the Swahili coast":S=>VIEW(S,[51.5,8.2,2.05]),
  /* the Ark of Bukhara photo was pushed far south of Bukhara, onto the road to Balkh (the card shows Samarkand) */
  "Over the Hindu Kush":S=>DROPPH(S,/^The Ark of Bukhara/),
  /* framed closer, the Indus to Daulatabad, so the ruler's two ends and Multan are clear of each other; the Old Delhi
     photo sat on the ruler's distance (the card shows the Qutb Minar) */
  "Judge in Delhi":S=>{DROPPH(S,/^Old Delhi/);VIEW(S,[74.3,24.7,4])},
  /* the Western Ghats photo hung at the globe's bottom edge and Delhi was off the top: framed Delhi to Calicut; the photo,
     still pushed below Calicut to the bottom edge, goes */
  "Shipwreck at Calicut":S=>{DROPPH(S,/^The Western Ghats/);VIEW(S,[76.7,19.6,4.2])},
  /* the Temple of the Tooth photo lay on the zoom buttons and the atoll photo was pushed far out to sea, away from the
     Maldives (the card shows Malé): framed Calicut to Sri Lanka, closer; the atoll photo goes */
  "Judge of the Maldives":S=>{DROPPH(S,/^A Maldives atoll/);VIEW(S,[78.4,6.8,4.5])},
  /* a "Spain" label on a long leader (the map names it) */
  "Granada, 1350":S=>DROP(S,/^Spain$/),
  /* Fez and a "Morocco" label sat at the card's edge (the map names Morocco): framed on the old world, Fez in sight; the label goes. The
     stop's guess asks how far he had travelled */
  "A book from memory":S=>{DROP(S,/^Morocco$/);VIEW(S,[32,13.8,1.1])},
  "Now explore":S=>VIEW(S,[40,25,1])
};
/* Text fixes to a tour's opening stop are also made at page load: on a tour's first launch its opening card is drawn
   before the fixes above go in (the per-stop fix then finds the text already changed and leaves it) */
const EARLY={brihla:{"The Travels of Ibn Battuta":S=>RE(S,"stat","travelled some 117,000 km, probably farther","travelled across the Muslim world and beyond, probably farther")}};
const early=()=>{try{for(const t in EARLY){const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{const f=S&&EARLY[t][strip(S.title)];if(f)f(S)})}}catch(e){}};
early();setTimeout(early,1500);setTimeout(early,6000);addEventListener("load",()=>setTimeout(early,500));

/* The Most Remote Places (geoflock-tours-bremote.js). geoflock-polish-m.js centres each island stop on its island (globe
   zoom 5) and drops the pins next to it, so several islands were left as a bare ring with no name: their names come back
   (added once here, as text pins, beside the ring). Its centring also took the first island ring on the opening and
   "Now explore" stops (which ring all sixteen islands), so both opened close in on St Kilda, the opening's card on the
   right over the zoom buttons: both are framed on the Pacific, as the tour meant (its own globe field), cards left. Where the island's own pin
   survived (whichever file got to the stop first), it is swapped for the one added here, so the name shows once. */
const RI={lonely:[82.25,77.48],tromelin:[54.52,-15.89],pingelap:[160.7,6.22],pukapuka:[-165.85,-10.88],floreana:[-90.43,-1.28],clipperton:[-109.22,10.3]};
FIX.bremote={
  /* framed on the eastern Pacific, Howland to Floreana (the stop's buttons turn the globe to the other oceans); the Rapa Nui
     photo lay under the map key and Christmas Island's label and photo hung at the globe's far edge below the card (each
     has a stop of its own); Rapa Nui, whose photo it was, gets its name back as a label */
  "Atlas of Remote Islands":S=>{DROPPH(S,/^(Ahu Tongariki|Red crabs on Christmas)/);AREA(S,/^Christmas Island$/);ADDPIN(S,[[-109.35,-27.12],"Rapa Nui","point"]);VIEW(S,[-133,-3,1])},
  /* a "Russia" label on a long leader, off the globe's bottom edge */
  "Lonely Island":S=>{DROP(S,/^(Russia|Lonely Island \(Uyed.*)$/);ADDPIN(S,[RI.lonely,"Lonely Island","point"])},
  /* the stat's "nearest land" moves into the stop's guess (revealed there) */
  "Bouvet Island":S=>RE(S,"stat","Bouvet is often called the remotest island on Earth: about 1,700 km from the nearest land, the coast of Antarctica","Bouvet is often called the remotest island on Earth: how far is it to the nearest land? Guess below"),
  "Tromelin":S=>ADDPIN(S,[RI.tromelin,"Tromelin","point"]),
  /* a "Micronesia" label sat on Pohnpei's (geoflock-sweep-tours4.js's drop of it no longer held) */
  "Pingelap":S=>{DROP(S,/^(Micronesia|Pingelap)$/);ADDPIN(S,[RI.pingelap,"Pingelap","point"])},
  /* geoflock-eyezoom.js's round close-up of the island, set to its right, lay under the map key: the island framed a
     little left of the open side's middle (at the same zoom) so the close-up clears the key */
  "Christmas Island":S=>VIEW(S,[109.7,-10.49,5]),
  "Rapa Nui":S=>VIEW(S,[-104.85,-27.12,5]),
  /* a "Papua New Guinea" label lay under the card */
  "Takuu":S=>DROP(S,/^Papua New Guinea$/),
  /* "Papua New Guinea" and "Kiribati" labels hung off the globe's edges */
  "Howland":S=>DROP(S,/^(Papua New Guinea|Kiribati)$/),
  /* a "Cook Islands" label hung off the globe's bottom edge, with Rarotonga's */
  "Pukapuka":S=>{DROP(S,/^(Cook Islands|Rarotonga)/);ADDPIN(S,[RI.pukapuka,"Pukapuka","point"])},
  /* the Henderson Island photo was pushed up onto the zoom buttons (the card shows Pitcairn) */
  "Pitcairn":S=>DROPPH(S,/^Henderson Island/),
  "Floreana":S=>{DROP(S,/^(Post Office Bay|Santa Cruz)$/);ADDPIN(S,[RI.floreana,"Floreana","point"])},
  /* Manzanillo's and a "Mexico" label hung at the top edge, over the map's switches */
  "Clipperton":S=>{DROP(S,/^(Manzanillo|Mexico$)/);ADDPIN(S,[RI.clipperton,"Clipperton","point"])},
  "Now explore":S=>VIEW(S,[-133,-3,1])
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
 PEND=false;try{f(S)}catch(e){console.error("rw2 fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rw2-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rw2){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rw2=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rw2-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rw2-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rw2-new");void e.offsetWidth;e.classList.add("rw2-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rw2-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rw2-rank"></ol><div class="rw2-pool"></div>'+
  '<div class="rw2-btns"><button type="button" class="rw2-btn rw2-undo">Undo</button><button type="button" class="rw2-btn rw2-show">Show me</button><button type="button" class="rw2-btn rw2-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rw2-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rw2-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rw2-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rw2-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rw2-ok":"rw2-no"):"")+'"><span class="rw2-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rw2-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rw2-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rw2-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rw2-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rw2-undo").hidden=L.shown||!L.order.length;c.querySelector(".rw2-show").hidden=L.shown;c.querySelector(".rw2-again").hidden=!L.shown;
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
 card(L){return'<div class="rw2-btns rw2-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rw2-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rw2-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rw2-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rw2-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw2-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw2-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw2-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rw2-gq"><input type="range" class="rw2-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rw2-gv"></b></div>'+
  '<div class="rw2-btns"><button type="button" class="rw2-btn rw2-chk">Check my guess</button><button type="button" class="rw2-btn rw2-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rw2-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rw2-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rw2-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rw2-rng");r.disabled=!!L.done;
  c.querySelector(".rw2-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rw2-chk").hidden=!!L.done;c.querySelector(".rw2-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rw2-q"><span class="rw2-n"></span><b class="rw2-item"></b></div><div class="rw2-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rw2-btn rw2-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rw2-btn rw2-next" hidden>Next →</button><button type="button" class="rw2-btn rw2-again" hidden>Start again</button></div><div class="rw2-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rw2-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rw2-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rw2-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rw2-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rw2-item").textContent=done?"":it[0];
  c.querySelectorAll(".rw2-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rw2-good",L.wait&&i===it[1]);b.classList.toggle("rw2-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rw2-next").hidden=!(L.wait&&!done);c.querySelector(".rw2-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rw2-again").hidden=!done;
  c.querySelectorAll(".rw2-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rw2-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rw2-y":"rw2-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rw2-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rw2-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rw2-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}



/* ======================================================================== 1. How far did he go? (brihla, A book from memory)
   Ross E. Dunn, author of The Adventures of Ibn Battuta, keynote at UCLA (UCLA Center for Chinese Studies, article 21336):
   "Ibn Battuta traveled more than 73,000 miles, by my count" (about 117,000 km, the figure the tour's opening gave; it is
   taken out of the opening's stat in part 1 so the guess comes first). Earth's equatorial radius 6,378.137 km (NASA Earth
   Fact Sheet), so once round the equator is about 40,075 km: 117,000 km is nearly three times round. */
const GUESS_RIHLA=GUESS({tours:["brihla"],title:"A book from memory",
 tip:"He dictated 29 years of journeys from memory. How far had he travelled in all, by land and sea, do you think?",
 vals:[5000,10000,20000,40000,60000,80000,117000,150000,250000],start:2,answer:117000,close:1,fmt:v=>v.toLocaleString("en-GB")+" km",
 after:"About 117,000 km (73,000 miles, by the historian Ross Dunn’s count): nearly three times round the Earth at the equator, on foot, by camel, horse, wagon and ship."});

/* ======================================================================== 2. The journey in order (brihla, Now explore)
   The tour's own dates: Tangier June 1325; Mecca 1326; the Indus September 1333; the shipwreck at Calicut 1341; Quanzhou
   around 1345; Damascus in the plague, July 1348; Granada 1350; across the Sahara 1352; the book finished in Fez 1355. */
const SORT_RIHLA=SORT({tours:["brihla"],title:"Now explore",turns:true,
 tip:"Twenty-nine years on the road: put his journey in order. Each one you tap turns the globe there.",
 first:"First",last:"Last",bars:false,
 items:[["He leaves Tangier",1325,"1325",0,[-5.81,35.78,2.6]],["His first Hajj at Mecca",1326,"1326",0,[39.83,21.42,2.6]],
  ["He reaches the Indus",1333,"1333",0,[68.6,26.4,2.6]],["Shipwreck at Calicut",1341,"1341",0,[75.78,11.25,2.6]],
  ["China: Quanzhou’s harbour",1345,"about 1345",0,[118.58,24.9,2.4]],["The plague in Damascus",1348,"1348",0,[36.29,33.51,2.6]],
  ["Granada and the Alhambra",1350,"1350",0,[-3.59,37.18,2.6]],["Across the Sahara for salt",1352,"1352",0,[-5,23.6,2.4]],
  ["The book is finished in Fez",1355,"1355",0,[-4.98,34.03,2.6]]],
 after:(r,N)=>"East as far as China, then home, then off again to Spain and Mali: few people before the age of steam ever saw so much of the world."});

/* ======================================================================== 3. One ocean at a time (bremote, Atlas of Remote
   Islands) The rings mark the tour's sixteen islands, spread over every ocean: one side of the globe cannot show them all. */
const TURN_REMOTE=TURNER({tours:["bremote"],title:"Atlas of Remote Islands",
 tip:"The sixteen rings are spread round the whole Earth: turn the globe one ocean at a time.",
 places:[["The eastern Pacific",-133,-3,1,"Howland, Pukapuka, Napuka, Pitcairn, Rapa Nui, Floreana and Clipperton, scattered across the biggest ocean."],
  ["The western Pacific",168,15,1.2,"Semisopochnoi in the Aleutians, Pingelap in Micronesia and Takuu off Bougainville."],
  ["The Atlantic",-19.6,-7.4,0.9,"St Kilda off Scotland, Tristan da Cunha in the middle of the South Atlantic and Bouvet near the ice."],
  ["The Indian Ocean",83.8,-18.4,1.3,"Tromelin, east of Madagascar, and Christmas Island, south of Java."],
  ["The Arctic",82,72,1.6,"Lonely Island, in the frozen Kara Sea north of Siberia."]]});

/* ======================================================================== 4. How far to the nearest land? (bremote, Bouvet
   Island) Wikipedia, "Bouvet Island": it "lies 1,700 km north of the Princess Astrid Coast of Queen Maud Land, Antarctica";
   the nearest inhabited place is Tristan da Cunha, about 2,260 km to the north-west; South Africa's coast is 2,520 km away.
   The stat's own "about 1,700 km" is taken out (part 1) so the guess comes first. */
const GUESS_BOUVET=GUESS({tours:["bremote"],title:"Bouvet Island",
 tip:"Bouvet sits alone in the stormy Southern Ocean. How far is it to the nearest land of any kind, do you think?",
 vals:[100,250,500,1000,1700,2500,4000,6000],start:2,answer:1700,close:1,fmt:v=>v.toLocaleString("en-GB")+" km",
 after:"About 1,700 km, to the ice coast of Queen Maud Land in Antarctica. The nearest people live even farther off: Tristan da Cunha, about 2,260 km away, and South Africa’s coast is 2,520 km."});

/* ======================================================================== 5. Island stories in order (bremote, Now explore)
   The tour's own dates: Bouvet sighted 1739; Tromelin's wreck 1761; Byron at Napuka 1765; the Bounty burnt at Pitcairn
   1790; the slave raiders at Rapa Nui 1862; Clipperton's last man killed 1917; St Kilda left 1930; Earhart lost near
   Howland 1937; Lonely Island's station empty from 1996. Each tap turns the globe there. */
const SORT_REMOTE=SORT({tours:["bremote"],title:"Now explore",turns:true,
 tip:"Two and a half centuries of island stories: put them in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Bouvet is sighted, then lost for decades",1739,"1739",0,[3.36,-54.42,2.4]],["The wreck on Tromelin",1761,"1761",0,[54.52,-15.89,2.4]],
  ["Byron’s ‘Islands of Disappointment’",1765,"1765",0,[-141.25,-14.17,2.4]],["The Bounty is burnt at Pitcairn",1790,"1790",0,[-130.1,-25.07,2.4]],
  ["Slave raiders reach Rapa Nui",1862,"1862",0,[-109.35,-27.12,2.4]],["Clipperton’s forgotten garrison",1917,"1917",0,[-109.22,10.3,2.4]],
  ["The last St Kildans leave",1930,"1930",0,[-8.57,57.81,2.4]],["Earhart vanishes on the way to Howland",1937,"1937",0,[-176.62,0.81,2.4]],
  ["Lonely Island’s weather station shuts",1996,"1996",0,[82.25,77.48,2.4]]],
 after:(r,N)=>"Sighted, wrecked on, fought over, abandoned: Schalansky’s point is that even the remotest specks of land have human stories, and often dark ones."});


const DEFS=[GUESS_RIHLA,SORT_RIHLA,TURN_REMOTE,GUESS_BOUVET,SORT_REMOTE];

let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rw2-layer rw2-layer";el.innerHTML='<svg class="rw2-sv"><defs><clipPath id="rw2Disc"><path class="rw2-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rw2Disc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rw2-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rw2-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rw2-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rw2-ctl";
 c.innerHTML='<div class="rw2-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rw2-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rw2-ctl"))unmount()}catch(e){}},300);
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
.rw2-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rw2-sv{position:absolute;left:0;top:0;overflow:visible}
.rw2-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rw2-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rw2-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rw2-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rw2-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rw2-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw2-btn[hidden]{display:none}
.rw2-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rw2-ep b{display:block;font-size:15px}
.rw2-ep.rw2-new{animation:rw2In .45s ease}@keyframes rw2In{from{opacity:.2;transform:translateY(4px)}}
.rw2-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rw2-sortq i{font-style:normal}
.rw2-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rw2}
.rw2-rank li{position:relative;counter-increment:rw2;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rw2-rank li::before{content:counter(rw2);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rw2-rank li.rw2-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rw2-rank li.rw2-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rw2-nm{flex:1 1 auto;z-index:1}.rw2-v{z-index:1;font-weight:800;white-space:nowrap}
.rw2-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rw2-pool{display:flex;flex-wrap:wrap;gap:5px}
.rw2-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rw2-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rw2-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rw2-do,:is(body.dark-theme,body.sky-night) .rw2-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw2-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw2-btn,:is(body.dark-theme,body.sky-night) .rw2-chip,:is(body.dark-theme,body.sky-night) .rw2-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rw2-rank li.rw2-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rw2-rank li.rw2-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rw2-bar{background:rgba(255,178,122,.2)}
.rw2-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rw2-rng{flex:1 1 auto;accent-color:#d9682b}.rw2-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rw2-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rw2-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rw2-item{font-size:16px;color:#13294b}
.rw2-bins{display:flex;gap:6px;flex-wrap:wrap}.rw2-bins .rw2-btn[hidden]{display:none}.rw2-bin:disabled{cursor:default;opacity:.55}
.rw2-btn.rw2-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rw2-btn.rw2-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rw2-dots{display:flex;gap:4px;margin-top:8px}.rw2-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rw2-dots i.rw2-now{box-shadow:0 0 0 2px #d9682b inset}.rw2-dots i.rw2-y{background:#1f8a4c}.rw2-dots i.rw2-x{background:#c2364f}
.rw2-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rw2-sl .rw2-row{margin-top:2px}.rw2-sl .rw2-val{min-width:36px}
.rw2-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rw2-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rw2-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rw2-out b{font-size:15px;color:#9a4a16}
.rw2-ch{display:block;width:100%;height:auto;margin-top:6px}.rw2-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rw2-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rw2-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rw2-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rw2-val,:is(body.dark-theme,body.sky-night) .rw2-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rw2-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rw2-item{color:#fff}:is(body.dark-theme,body.sky-night) .rw2-n,:is(body.dark-theme,body.sky-night) .rw2-sl label,:is(body.dark-theme,body.sky-night) .rw2-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rw2-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rw2-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rw2-dots i{background:rgba(255,255,255,.18)}
.rw2-btn.rw2-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rw2-btn.rw2-cur{background:#9fc3ff;color:#13294b}
.rw2-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rw2-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rw2-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rw2-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rw2-ep b .rw2-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rw2-ep b .rw2-km{color:#ffb27a}
.rw2-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rw2-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rw2-small{font-size:11.5px!important;padding:2px 7px!important}
.rw2-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rw2-gq .rw2-rng{flex:1 1 auto}.rw2-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rw2-julh{fill:#c2364f}.rw2-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rw2-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rw2-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rw2-gv{color:#ffb27a}
.rw2-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rw2-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rw2-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rw2-tring{fill:none;stroke:#d9682b;stroke-width:3}.rw2-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rw2-clk{font-size:18px}.rw2-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rw2-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rw2-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rw2-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rw2-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rw2-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rw2-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rw2-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rw2-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rw2-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rw2-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rw2-pig{color:#1f8a4c}
.rw2-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rw2-mlg line,.rw2-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rw2-mlg .rw2-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rw2-mlg line,:is(body.dark-theme,body.sky-night) .rw2-mlg path,:is(body.dark-theme,body.sky-night) .rw2-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw2-mlg .rw2-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rw2-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rw2-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rw2-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rw2-pig{color:#4cc27f}
.rw2-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rw2-kbw{fill:#7fb3e0}
.rw2-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rw2-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rw2-kbb.rw2-kbok{stroke:#f2b33d}.rw2-kbb.rw2-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rw2-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rw2-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rw2-ctl .rw2-btn.rw2-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rw2-ctl .rw2-btn.rw2-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rw2-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRw2={v:1,FIX,XFS,viewOf,tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
