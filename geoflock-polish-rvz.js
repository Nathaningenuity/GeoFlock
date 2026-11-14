/* GeoFlock polish RV-Z: a stop-by-stop review of four Books tours, Why Nations Fail (bnations), Collapse (bcollapse),
   Candide (bcandide) and Journey to the West (bjourneywest), each looked at on its default map (the globe), at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rvx.js (its helpers and engine, under "rvz" names so the files never touch each other's
   controls): frames looked up by tour and title (so an opening stop is right on a tour's first launch) and a
   psGlobeTarget wrapper, so a stop framed here gets exactly its frame. geoflock-sweep-tours*.js re-set framing on every
   psGo, so the fixed fields are fixed, non-configurable getters whose setters are ignored; a field already
   non-configurable is left alone. Pin lists are filtered through getters (never frozen; a getter another file already
   put on a field stays underneath), and a stop's photo pins wait for geoflock-portraits.js's portraits before they are
   edited; a stop whose photos are dropped or swapped later gets its photo squares rebuilt. CSS classes start with
   "rvz-". Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRvz)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvzTest or ?rvztest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvzTest||/[?&]rvztest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* Pin lists are filtered, not frozen: the shared photo pass (geoflock-stopphotos.js, -pinfix.js) turns text pins into
   photo pins at its own times after load, so a list copied once would keep or lose pins depending on timing. XF puts
   a getter on the field that applies this file's edits to whatever the field holds; other files' writes still go
   through (to the value underneath). Each edit has an id, so applying the fixes again does not stack them.
   A field another script already serves through its own getter (as geoflock-sweep-tours2.js and geoflock-polish-m.js
   do) keeps that getter and setter underneath, as geoflock-polish-rvs.js found. */
const XFS=new WeakMap();
let PEND=false;
const PPW=new WeakMap();/* (it waits at most about 20 s) */
const pplPending=S=>{try{const t=ps&&ps.tour,n=strip(S.title);if(!(window.GF_PORTRAITS||[]).some(p=>p.tour===t&&p.stop===n)||Object.prototype.hasOwnProperty.call(S,"_gfPpl"))return false;
 const w=(PPW.get(S)||0)+1;PPW.set(S,w);return w<70}catch(e){return false}};
const XF=(S,k,id,fn)=>{try{if(k==="phPins"&&!(XFS.get(S)||{})[k]&&pplPending(S)){PEND=true;return}let R=XFS.get(S);if(!R){R={};XFS.set(S,R)}
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;const B={v:S[k],fns:{},og:d&&d.get,os:d&&d.set};R[k]=B;
  Object.defineProperty(S,k,{configurable:!!(window.__rvzTest||/[?&]rvztest\b/.test(location.search)),enumerable:true,
   get:()=>{const pk=k==="phPins"?pplReady(S):0,bv=B.og?B.og.call(S):B.v;if(B.out&&B.at===bv&&B.atN===B.n&&B.pk===pk)return sync(S,k,B.out);let v=Array.isArray(bv)?bv.slice():(bv||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}
    if(pk)v=pplAdd(S,v);if(k==="phPins"&&B.out&&B.out.length!==v.length)setTimeout(()=>resq(S),0);B.out=v;B.at=bv;B.atN=B.n;B.pk=pk;return sync(S,k,v)},set:x=>{if(B.os)B.os.call(S,x);else B.v=x}})}
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
const pplList=S=>{try{const t=TOUR_OF.get(S),n=strip(S.title);return(window.GF_PORTRAITS||[]).filter(p=>p.tour===t&&p.stop===n)}catch(e){return[]}};
const pplOk=f=>{const m=PPOK.get(f);if(m===true)return true;const now=Date.now();if(m&&now-m<2000)return false;
 let ok=false;try{ok=PS_PHOTO_DATA.some(x=>x&&x.f===f&&x.d)}catch(e){}PPOK.set(f,ok||now);return ok};
function pplReady(S){const L=pplList(S);return L.filter(p=>pplOk(p.f)).length}
function pplAdd(S,v){const names=new Set(v.map(q=>strip(q&&q.label).toLowerCase()));
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvz)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvz,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvz=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);


const FIX={};
FIX.bnations={
  /* the opening's photos of the US–Mexico wall, the DMZ, Potosí and Shenzhen lay round the back of the globe, and the
     Gaborone monument hung half off the bottom of the screen: each has a stop of its own; Manchester and Venice stay */
  "Why Nations Fail":S=>DROPPH(S,/^(The US–Mexico|The DMZ|Cerro Rico|Three Dikgosi|Shenzhen)/),
  /* the guess on this stop asks for the gap first, so the stat no longer gives it (the game reveals the Bank of Korea's
     figure after the guess) */
  "Korea: one people, two economies":S=>RE(S,"stat","is estimated at about 29 times North Korea’s","is many times North Korea’s: guess how many below"),
  /* "Netherlands" and "United Kingdom" labels on long leaders crossed the sea beside the map's own "England" and "Dutch
     Republic" (1688) labels */
  "The Glorious Revolution":S=>DROP(S,/^(Netherlands|United Kingdom)$/),
  /* Potosí's photo hung at the globe's bottom edge: framed a little further south */
  "Silver and forced labour":S=>VIEW(S,[-74,2,1.3]),
  /* the "West: wages rise" label sat on London, under the card, and hung on a long leader at the bottom of the screen:
     it marks western Europe, so it moves to northern France, beside the card; the "East: a
     ‘second serfdom’" label, which ran under the map key, is set nearer the Elbe (still east of it) and shortened to
     "East: serfs bound" (the text names the second serfdom); framed a little wider */
  "The Black Death splits Europe":S=>{MOVE(S,/^West: wages rise/,[3,48.6]);MOVE(S,/^East: a/,[16.2,52.6]);RENAME(S,/^East: a/,"East: serfs bound");VIEW(S,[15,50,2])},
  /* Constantinople lay under the map key and Alexandria's label was lost at the globe's edge: framed further east, on
     Venice's sea routes */
  "Venice closes its doors":S=>VIEW(S,[23,38,2.4]),
  /* the France-sized ghost ("Botswana, true size", set on France) lay under the card, Botswana a speck at the bottom and
     the Gaborone photo below the screen: framed to show France and Botswana side by side; the photo goes (the card has
     the monument's picture) */
  "Botswana’s chiefs":S=>{DROPPH(S,/^Gaborone/);VIEW(S,[6,6,1.15])},
  /* Moscow, half the stop's story, was off the globe's left edge under the card, and the Russia label hung over the map
     switches at the top of the screen: framed wider, Moscow and Beijing both in view; the Russia and China labels go (the
     map names both), and Shenzhen's photo, then under the map key, too: the card has its picture */
  "Growth that cannot last?":S=>{DROP(S,/^(Russia|China)$/);DROPPH(S,/^Shenzhen/);VIEW(S,[86,42,1])},
  /* the Stockholm label hung at the top of the screen beside the search box, far from the tropics the stop is about */
  "Geography or institutions?":S=>DROP(S,/^Stockholm/)
};

FIX.bcollapse={
  /* the opening's Ahu Tongariki photo hung below the globe, Tasiilaq's at its top edge and the New Guinea highlands'
     round the back: each has a stop of its own (the stop's game turns the globe to each ending in turn) */
  "Collapse":S=>DROPPH(S,/^(Ahu Tongariki|Tasiilaq|The New Guinea)/),
  /* the card was on the right; on the left, the mainland end of the ruler lay under the map key and the magnifier's
     caption over the ruler's distance: framed east, Rapa Nui and Chile both in view; the Pitcairn label went under the
     card (Pitcairn has the next stop) */
  "Easter Island":S=>{DROP(S,/^Pitcairn$/);VIEW(S,[-90,-33,1.25])},
  /* the Pueblo Bonito label hung on a long leader down into Mexico: framed closer on the Four Corners */
  "Chaco Canyon":S=>VIEW(S,[-109.3,36.4,5.6]),
  /* the island's west, Reykjavík and the "Icelandic Commonwealth" label lay under the card: framed on the island */
  "Iceland’s blowing soil":S=>VIEW(S,[-18.6,64.9,5.4]),
  /* Bergen, the ruler's far end, lay under the map key, and a "Greenland (Denmark)" label hung on a long leader at the
     top: framed east, from L'Anse aux Meadows to Norway */
  "The Norse in Greenland":S=>{DROP(S,/^Greenland/);VIEW(S,[-11,57,1.6])},
  /* Japan sat at the globe's top edge, the Kiso and Edo labels by the map switches; Japan, Papua New Guinea and Solomon
     Islands labels on long leaders: framed wider, Japan to Tikopia */
  "Societies that succeeded":S=>{DROP(S,/^(Japan|Papua New Guinea|Solomon Islands)$/);VIEW(S,[152,12,1.2])},
  /* a Papua New Guinea label on a long leader; the map names it */
  "An oil field that saved the forest":S=>DROP(S,/^Papua New Guinea$/)
};

FIX.bcandide={
  /* the "Holy Roman Empire" label ran under the map key: framed a little further east */
  "Westphalia: the best of all possible castles":S=>VIEW(S,[11,51.3,5]),
  /* Leuthen's label ran under the map key: framed further east */
  "Bulgars and Abares":S=>VIEW(S,[15.5,51,3.5]),
  /* the Buenos Aires photo hung below the globe, over the toolkit: framed wider and further south, Cádiz to the Plate */
  "From Cádiz to Buenos Aires":S=>VIEW(S,[-32,-8,1.15]),
  /* Paraguay and Argentina labels on long leaders crossed the missions' own labels; the map names both */
  "The Jesuits of Paraguay":S=>DROP(S,/^(Paraguay|Argentina|Brazil)$/),
  /* the slave routes ran off the globe's right edge: Elmina and the Loango coast, the routes' African ends, were out of
     sight. Framed on the Atlantic crossing from Elmina to Paramaribo; the Loango coast's label, which would then sit under
     the map key, goes (its route still shows), and "Elmina, Gold Coast" is shortened to "Elmina" for the same reason */
  "Suriname: the price of sugar":S=>{DROP(S,/^Loango/);RENAME(S,/^Elmina/,"Elmina");VIEW(S,[-18,4,1])},
  /* Bordeaux and Paris were specks on a view of half the Atlantic: framed on France (the sheep's voyage from Suriname is
     the stop before) */
  "Bordeaux and Paris":S=>VIEW(S,[-1,46.5,3.4]),
  /* Constantinople and the Ottoman Empire's label lay under the map key: framed on the city */
  "A garden by Constantinople":S=>VIEW(S,[28,40.8,4])
};

FIX.bjourneywest={
  /* the road's east end, Chang'an, lay at the globe's edge under the map key: framed a little wider and further east */
  "Journey to the West":S=>VIEW(S,[96,32,1.3]),
  /* the Huaguo Shan and Huai'an labels ran under the map key: framed further east and a little wider */
  "Monkey, Pigsy and Sandy":S=>VIEW(S,[121,30,1.3]),
  /* Hami's label ran under the map key: framed further east */
  "A king who would not let him go":S=>VIEW(S,[92.5,43,6]),
  /* Kashmir's label ran under the map key: framed further east */
  "Gandhara and Kashmir":S=>VIEW(S,[75,34,5.16]),
  /* the Kushinagar and Sarnath labels ran under the map key: framed further east */
  "Harsha’s India":S=>VIEW(S,[84.5,26,4.25]),
  /* the Nalanda photo and the Tamralipti label lay under the map key: framed a little wider, Valabhi to Tamralipti */
  "Nalanda":S=>VIEW(S,[86,20,2.6]),
  /* the Mogao Caves photo lay on the zoom buttons: framed wider; the "Chang'an, 645" label, then at the globe's edge
     under the map key, goes (the text tells of his welcome there) */
  "Home along the Taklamakan":S=>{DROP(S,/^Chang’an, 645/);VIEW(S,[92,37.5,1.9])}
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
 PEND=false;try{f(S)}catch(e){console.error("rvz fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rvz-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvz){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvz=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rvz-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvz-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvz-new");void e.offsetWidth;e.classList.add("rvz-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rvz-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvz-rank"></ol><div class="rvz-pool"></div>'+
  '<div class="rvz-btns"><button type="button" class="rvz-btn rvz-undo">Undo</button><button type="button" class="rvz-btn rvz-show">Show me</button><button type="button" class="rvz-btn rvz-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvz-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvz-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvz-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvz-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvz-ok":"rvz-no"):"")+'"><span class="rvz-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvz-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvz-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvz-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvz-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvz-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvz-show").hidden=L.shown;c.querySelector(".rvz-again").hidden=!L.shown;
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
 card(L){return'<div class="rvz-btns rvz-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvz-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvz-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvz-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvz-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvz-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvz-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvz-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvz-gq"><input type="range" class="rvz-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rvz-gv"></b></div>'+
  '<div class="rvz-btns"><button type="button" class="rvz-btn rvz-chk">Check my guess</button><button type="button" class="rvz-btn rvz-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvz-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvz-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rvz-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvz-rng");r.disabled=!!L.done;
  c.querySelector(".rvz-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rvz-chk").hidden=!!L.done;c.querySelector(".rvz-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rvz-q"><span class="rvz-n"></span><b class="rvz-item"></b></div><div class="rvz-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rvz-btn rvz-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rvz-btn rvz-next" hidden>Next →</button><button type="button" class="rvz-btn rvz-again" hidden>Start again</button></div><div class="rvz-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rvz-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rvz-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rvz-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rvz-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rvz-item").textContent=done?"":it[0];
  c.querySelectorAll(".rvz-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rvz-good",L.wait&&i===it[1]);b.classList.toggle("rvz-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rvz-next").hidden=!(L.wait&&!done);c.querySelector(".rvz-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rvz-again").hidden=!done;
  c.querySelectorAll(".rvz-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rvz-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rvz-y":"rvz-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvz-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvz-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvz-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}


/* ======================================================================== 1. How many times richer? (bnations, Korea)
   Bank of Korea estimate for 2024 (reported by the Korea Times, 29 August 2025, "N. Korean economy logs fastest growth in
   8 years in 2024: BOK", and Asia Economy): North Korea's gross national income per person 1.72 million won, South
   Korea's 50.12 million won, about 29 times as much (3.4%). */
const GUESS_KOREA=GUESS({tours:["bnations"],title:"Korea: one people, two economies",
 tip:"In 1945 the two halves of Korea were much alike. How many times richer per person is the South today, do you think?",
 vals:[1,1.5,2,3,5,8,12,18,29,45,70,100],start:3,answer:29,close:1,
 fmt:v=>v===1?"the same":v.toLocaleString("en-GB")+" times",
 after:"The Bank of Korea put 2024 income per person at about 50.1 million won in the South and 1.7 million in the North: the South about 29 times richer, a gap made in under 80 years by one line on the map."});

/* ======================================================================== 2. Critical junctures in order (bnations,
   Geography or institutions?) The tour's own dates: Venice's Serrata 1297; the Black Death 1346–53; the Potosí mita
   from 1573; the Glorious Revolution 1688; the first Muslim-run Ottoman press 1727; the convicts' lawsuit at Sydney
   1788; the three Tswana chiefs in London 1895; Siaka Stevens's railway closure in the 1970s. Each tap turns the globe
   to the place. */
const SORT_NAT=SORT({tours:["bnations"],title:"Geography or institutions?",turns:true,
 tip:"The places stay put; the rules change. Put the tour’s turning points in order. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Venice closes its Great Council",1297,"1297",0,[12.34,45.44,3]],["The Black Death",1346,"1346–53",0,[14.4,50.09,3]],
  ["Spain’s mita at Potosí",1573,"from 1573",0,[-65.75,-19.59,2.6]],["The Glorious Revolution",1688,"1688",0,[-0.12,51.5,3]],
  ["The first Muslim-run Ottoman press",1727,"1727",0,[28.98,41.01,3]],["Two convicts sue at Sydney",1788,"1788",0,[151.21,-33.86,2.6]],
  ["Three Tswana chiefs go to London",1895,"1895",0,[25.91,-24.65,2.6]],["Sierra Leone’s railway torn up",1975,"1970s",0,[-11.74,7.96,3]]],
 after:(r,N)=>"Almost 700 years, and every one of them a choice about rules, made in a place whose climate and soil did not change."});

/* ======================================================================== 3. Inclusive or extractive? (bnations, Now explore)
   A review of the tour's own stops, in the book's two words: inclusive institutions (power and chances spread widely)
   and extractive ones (a few take from the many). Each answer turns the globe there. */
const BINS_NAT=BINS({tours:["bnations"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Inclusive or extractive? Sort the tour’s examples the way Acemoglu and Robinson would.",ask:"Inclusive or extractive?",
 bins:["Inclusive","Extractive"],
 items:[["The mita sends one man in seven to Potosí’s mines",1,"Extractive: forced labour for silver that went to Spain.",[-65.75,-19.59,2.6],"Potosí"],
  ["Parliament limits the Crown after 1688",0,"Inclusive: power shared among many groups; property safer.",[-0.12,51.5,3],"London"],
  ["Jamestown’s settlers get land and an assembly",0,"Inclusive: the Virginia Company had to offer settlers rights to keep them working.",[-76.78,37.21,3],"Jamestown"],
  ["Venice’s old families shut out newcomers",1,"Extractive: the Serrata closed power and trade to new families.",[12.34,45.44,3],"Venice"],
  ["Lords tie peasants to the land east of the Elbe",1,"Extractive: the ‘second serfdom’ after the Black Death.",[21,52.2,3],"East of the Elbe"],
  ["Convicts take a ship’s captain to court, and win",0,"Inclusive: even prisoners could use the law.",[151.21,-33.86,2.6],"Sydney"],
  ["Botswana’s leaders share the diamond wealth",0,"Inclusive: chiefs answering to public meetings, then free elections.",[25.38,-21.31,2.6],"Botswana"],
  ["A ruler tears up the railway to his rivals’ lands",1,"Extractive: Siaka Stevens would rather the country stay poor than lose power.",[-11.74,7.96,3],"Sierra Leone"]],
 after:(r,N)=>(r===N?"Every one right. ":"")+"Now switch to the GDP map and see where those paths have led: compare Haiti and the Dominican Republic, Finland and Russia, Botswana and Zimbabwe."});

/* ======================================================================== 4. When did each one fall? (bcollapse, Collapse)
   The tour's own dates: the southern Maya lowland cities abandoned between about AD 760 and 910; Chaco Canyon left after
   the long drought of the 1100s; Mesa Verde's cliff dwellings left around 1300; the last written record of Norse
   Greenland, a wedding at Hvalsey church, 1408 (the colony gone in the 1400s); the canoe voyages to Pitcairn and
   Henderson stopped around 1500; the slave raids on Rapa Nui in the 1860s. Each tap turns the globe there. */
const SORT_COL=SORT({tours:["bcollapse"],title:"Collapse",turns:true,
 tip:"Before you set off: put six of the tour’s endings in order, oldest first. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["The southern Maya cities are abandoned",835,"about 760–910",0,[-89.62,17.22,2.4]],["Chaco Canyon’s great houses are left",1150,"after the drought of the 1100s",0,[-107.96,36.06,2.4]],
  ["Mesa Verde’s cliff dwellings are left",1300,"around 1300",0,[-108.49,37.18,2.4]],["The last record of Norse Greenland",1408,"1408",0,[-45.78,60.82,2.2]],
  ["The canoes stop sailing to Pitcairn and Henderson",1500,"around 1500",0,[-130.1,-25.07,2.4]],["Slave raids strike Rapa Nui",1862,"the 1860s",0,[-109.35,-27.12,2.4]]],
 after:(r,N)=>"A thousand years of endings, on three oceans. Diamond asks the same five questions of every one: let the tour show you which answers fit."});

/* ======================================================================== 5. Which of Diamond's factors? (bcollapse, Now explore)
   The opening stop's five-point framework (damage people do to their environment, climate change, hostile neighbours,
   loss of friendly trading partners, a society's response), applied as each stop of the tour applies it: Pitcairn and
   Henderson ("Diamond's fourth factor: losing friendly trading partners"), Iceland's soil, Chaco's drought, Tokugawa
   Japan's forests, Easter Island's trees, Greenland's Little Ice Age, the Norse's trade with Norway, the Dutch polders.
   Each answer turns the globe there. */
const BINS_COL=BINS({tours:["bcollapse"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Diamond’s checklist again. Which factor is each of these?",ask:"Which of Diamond’s factors?",
 bins:["Damage to the land","Climate change","Lost trading partners","How a society responds"],
 items:[["Mangareva’s canoes stop coming",2,"Without trees for canoes, Mangareva stopped sailing, and Pitcairn and Henderson were cut off.",[-130.1,-25.07,2.6],"Pitcairn"],
  ["Sheep strip Iceland’s light soil",0,"Damage to the land: the birch woods and the soil blew away.",[-19,64.9,3],"Iceland"],
  ["A long drought in the 1100s",1,"Climate change: Chaco Canyon’s farming could not survive it.",[-107.96,36.06,3],"Chaco Canyon"],
  ["The shoguns count and replant trees",3,"A response: Tokugawa Japan saved its forests from the top down.",[139.77,35.68,3],"Edo"],
  ["The palm forests are cut down",0,"Damage to the land, in Diamond’s telling, though many archaeologists now blame rats and, later, Europeans.",[-109.35,-27.12,2.6],"Rapa Nui"],
  ["The Little Ice Age",1,"Climate change: Greenland grew colder, and the Norse farms failed.",[-45.51,61.15,2.6],"Greenland"],
  ["Ships from Norway grow rare",2,"Lost trading partners: Europe wanted less walrus ivory, and the Norse depended on Norway.",[5.32,60.39,3],"Bergen"],
  ["Neighbours run the pumps together",3,"A response: in the polders rich and poor drown together, so they cooperate.",[4.64,51.88,3],"Kinderdijk"]],
 after:(r,N)=>(r===N?"Every one right. ":"")+"Diamond’s fifth factor matters most: Greenland’s Norse and Japan’s shoguns faced hard times, but only one changed course."});

/* ======================================================================== 6. Retrace Candide's journey (bcandide, A garden by
   Constantinople) The novel's order, as the tour's stops give it (Candide, 1759): the castle in Westphalia (ch. 1),
   Holland (ch. 3), Lisbon (ch. 5), Buenos Aires (ch. 13), El Dorado (ch. 17–18), Suriname (ch. 19), Portsmouth (ch. 23),
   Venice (ch. 24–26), then the garden by Constantinople. Each tap turns the globe there. */
const SORT_CAND=SORT({tours:["bcandide"],title:"A garden by Constantinople",turns:true,
 tip:"The garden is the end of the road. Can you put Candide’s journey back in order? Each place you tap turns the globe there.",
 first:"First",last:"Last",bars:false,
 items:[["The castle in Westphalia",1,"ch. 1",0,[7.9,51.9,2.6]],["Holland and the kind Jacques",2,"ch. 3",0,[4.9,52.37,2.6]],
  ["Lisbon in ruins",3,"ch. 5",0,[-9.14,38.71,2.6]],["Buenos Aires and the governor",4,"ch. 13",0,[-58.38,-34.6,2]],
  ["El Dorado",5,"ch. 17–18",0,[-63,4,2]],["Suriname",6,"ch. 19",0,[-55.17,5.83,2]],
  ["Portsmouth: an admiral shot",7,"ch. 23",0,[-1.1,50.8,2.6]],["Venice and the six kings",8,"ch. 24–26",0,[12.34,45.44,2.6]]],
 after:(r,N)=>"Three continents and two oceans, and the answer is a small farm on the Sea of Marmara: ‘we must cultivate our garden’."});

/* ======================================================================== 7. Real or made up? (bcandide, Now explore)
   A review of the tour's own stops: the Lisbon earthquake (1 November 1755), the Jesuit missions, Admiral Byng's
   execution (March 1757) and the Seven Years' War are real; the baron's castle and El Dorado are Voltaire's; the six
   kings are real people at an invented supper; the Suriname scene sets an invented man in a real system of slavery. */
const BINS_CAND=BINS({tours:["bcandide"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Voltaire mixed real events with pure invention. Which is which?",ask:"Real, made up, or a made-up scene in real history?",
 bins:["Real","Made up","Real history, made-up scene"],
 items:[["An earthquake destroys Lisbon on All Saints’ Day",0,"Real: 1 November 1755, one of Europe’s strongest earthquakes.",[-9.14,38.71,3],"Lisbon"],
  ["Baron Thunder-ten-tronckh’s castle",1,"Made up: a castle grand only to its owners.",[7.9,51.9,3],"Westphalia"],
  ["Six kings who have lost their thrones dine together",2,"The kings were real, among them Ahmed III and Ivan VI; the supper in Venice is Voltaire’s joke.",[12.34,45.44,3],"Venice"],
  ["Children play with gold nuggets in the street",1,"Made up: El Dorado, the one happy country in the book.",[-63,4,2.4],"El Dorado"],
  ["An admiral is shot on his own deck",0,"Real: Admiral John Byng, Portsmouth, March 1757.",[-1.1,50.8,3],"Portsmouth"],
  ["‘Bulgars’ and ‘Abares’ fight a heroic butchery",2,"Readers take them for the Prussians and French of the Seven Years’ War; the battle itself is invented.",[11.9,51.25,3],"Rossbach"],
  ["Priests run mission towns for the Guaraní",0,"Real: some thirty Jesuit reductions, until Spain expelled the order in 1767.",[-55.71,-27.13,3],"Trinidad mission"],
  ["A man who lost a hand in a sugar mill",2,"The man is Voltaire’s, but Suriname’s plantations, worked by enslaved Africans, were real.",[-55.17,5.83,3],"Suriname"]],
 after:(r,N)=>(r===N?"Every one right. ":"")+"Voltaire’s trick: put invented people into real disasters, and ask whether this is the best of all possible worlds."});

/* ======================================================================== 8. Retrace Xuanzang's road out (bjourneywest, Home
   along the Taklamakan) The tour's own stops, in his order: the Jade Gate frontier at Guazhou, Gaochang, Kucha, Suyab,
   Samarkand, Bamiyan, Kashmir, Nalanda. Each tap turns the globe there. */
const SORT_XZ=SORT({tours:["bjourneywest"],title:"Home along the Taklamakan",turns:true,
 tip:"Before he heads home: put the stops on his road out in order. Watch the globe; the road was anything but straight.",
 first:"First",last:"Last",bars:false,
 items:[["The Jade Gate frontier",1,"past the watchtowers",0,[95.78,40.52,2.4]],["Gaochang",2,"the king who would not let him go",0,[89.53,42.85,2.4]],
  ["Kucha",3,"before the icy Tian Shan",0,[82.96,41.72,2.4]],["Suyab",4,"the khan’s great tent",0,[75.2,42.81,2.4]],
  ["Samarkand",5,"the Sogdians’ capital",0,[66.97,39.65,2.4]],["Bamiyan",6,"the giant Buddhas",0,[67.83,34.83,2.4]],
  ["Kashmir",7,"two years of study",0,[74.8,34.08,2.4]],["Nalanda",8,"about five years",0,[85.44,25.14,2.4]]],
 after:(r,N)=>"North round the Tian Shan, west to Samarkand, then back south-east over the Hindu Kush: mountains and safe roads, not straight lines, set his route."});

/* ======================================================================== 9. History or novel? (bjourneywest, Now explore)
   A review of the tour's own stops: the real journey (his biography and the Great Tang Records) against the 1592 novel. */
const BINS_XZ=BINS({tours:["bjourneywest"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Did it happen to the real monk, or only in the novel?",ask:"The real Xuanzang, or the novel?",
 bins:["The real journey","Only in the novel"],
 items:[["He sets out against the emperor’s orders",0,"The real journey: travel beyond the frontier was banned, so he went by night.",[108.94,34.27,3],"Chang’an"],
  ["The emperor sends him off with a golden bowl",1,"Only in the novel, which turns his escape round.",[108.94,34.27,3],"Chang’an"],
  ["A magic palm-leaf fan puts out the flames",1,"Only in the novel: Monkey tricks it out of Princess Iron Fan.",[89.6,42.92,3],"Flaming Mountains"],
  ["A king refuses to let him leave",0,"The real journey: he went on hunger strike until Qu Wentai of Gaochang gave in.",[89.53,42.85,3],"Gaochang"],
  ["Three or four in ten of his party die of cold",0,"The real journey: crossing the glaciers of the Tian Shan.",[78.43,41.4,3],"Bedel Pass"],
  ["The first scriptures have blank pages",1,"Only in the novel: the pilgrims would not pay a fee.",[85.44,25,3],"Vulture Peak"],
  ["A boat overturns and manuscripts are lost",0,"The real journey: about 50 on the Indus, on his way home.",[72.43,34.05,3],"The Indus"],
  ["An old turtle dunks the pilgrims in a river",1,"Only in the novel: the last of the 81 ordeals.",null,""]],
 after:(r,N)=>(r===N?"Every one right. ":"")+"The novel keeps the real road, and fills it with monsters."});

const DEFS=[GUESS_KOREA,SORT_NAT,BINS_NAT,SORT_COL,BINS_COL,SORT_CAND,BINS_CAND,SORT_XZ,BINS_XZ];


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvz-layer rvz-layer";el.innerHTML='<svg class="rvz-sv"><defs><clipPath id="rvzDisc"><path class="rvz-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvzDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvz-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvz-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvz-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvz-ctl";
 c.innerHTML='<div class="rvz-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvz-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvz-ctl"))unmount()}catch(e){}},300);
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
.rvz-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvz-sv{position:absolute;left:0;top:0;overflow:visible}
.rvz-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvz-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvz-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvz-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvz-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvz-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvz-btn[hidden]{display:none}
.rvz-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvz-ep b{display:block;font-size:15px}
.rvz-ep.rvz-new{animation:rvzIn .45s ease}@keyframes rvzIn{from{opacity:.2;transform:translateY(4px)}}
.rvz-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvz-sortq i{font-style:normal}
.rvz-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvz}
.rvz-rank li{position:relative;counter-increment:rvz;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvz-rank li::before{content:counter(rvz);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvz-rank li.rvz-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvz-rank li.rvz-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvz-nm{flex:1 1 auto;z-index:1}.rvz-v{z-index:1;font-weight:800;white-space:nowrap}
.rvz-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvz-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvz-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvz-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvz-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvz-do,:is(body.dark-theme,body.sky-night) .rvz-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvz-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvz-btn,:is(body.dark-theme,body.sky-night) .rvz-chip,:is(body.dark-theme,body.sky-night) .rvz-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvz-rank li.rvz-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvz-rank li.rvz-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvz-bar{background:rgba(255,178,122,.2)}
.rvz-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvz-rng{flex:1 1 auto;accent-color:#d9682b}.rvz-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvz-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvz-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvz-item{font-size:16px;color:#13294b}
.rvz-bins{display:flex;gap:6px;flex-wrap:wrap}.rvz-bins .rvz-btn[hidden]{display:none}.rvz-bin:disabled{cursor:default;opacity:.55}
.rvz-btn.rvz-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvz-btn.rvz-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvz-dots{display:flex;gap:4px;margin-top:8px}.rvz-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvz-dots i.rvz-now{box-shadow:0 0 0 2px #d9682b inset}.rvz-dots i.rvz-y{background:#1f8a4c}.rvz-dots i.rvz-x{background:#c2364f}
.rvz-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvz-sl .rvz-row{margin-top:2px}.rvz-sl .rvz-val{min-width:36px}
.rvz-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvz-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvz-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvz-out b{font-size:15px;color:#9a4a16}
.rvz-ch{display:block;width:100%;height:auto;margin-top:6px}.rvz-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvz-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvz-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvz-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvz-val,:is(body.dark-theme,body.sky-night) .rvz-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvz-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvz-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvz-n,:is(body.dark-theme,body.sky-night) .rvz-sl label,:is(body.dark-theme,body.sky-night) .rvz-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvz-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvz-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvz-dots i{background:rgba(255,255,255,.18)}
.rvz-btn.rvz-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvz-btn.rvz-cur{background:#9fc3ff;color:#13294b}
.rvz-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rvz-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rvz-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rvz-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvz-ep b .rvz-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rvz-ep b .rvz-km{color:#ffb27a}
.rvz-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rvz-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rvz-small{font-size:11.5px!important;padding:2px 7px!important}
.rvz-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rvz-gq .rvz-rng{flex:1 1 auto}.rvz-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rvz-julh{fill:#c2364f}.rvz-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rvz-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rvz-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rvz-gv{color:#ffb27a}
.rvz-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rvz-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rvz-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rvz-tring{fill:none;stroke:#d9682b;stroke-width:3}.rvz-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rvz-clk{font-size:18px}.rvz-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rvz-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rvz-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rvz-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rvz-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rvz-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rvz-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rvz-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rvz-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rvz-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rvz-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rvz-pig{color:#1f8a4c}
.rvz-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rvz-mlg line,.rvz-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rvz-mlg .rvz-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rvz-mlg line,:is(body.dark-theme,body.sky-night) .rvz-mlg path,:is(body.dark-theme,body.sky-night) .rvz-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rvz-mlg .rvz-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rvz-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rvz-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rvz-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rvz-pig{color:#4cc27f}
.rvz-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rvz-kbw{fill:#7fb3e0}
.rvz-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rvz-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rvz-kbb.rvz-kbok{stroke:#f2b33d}.rvz-kbb.rvz-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rvz-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rvz-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rvz-ctl .rvz-btn.rvz-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rvz-ctl .rvz-btn.rvz-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvz-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRvz={v:1,FIX,XFS,viewOf,tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
