/* GeoFlock polish RV-X: a stop-by-stop review of four Ideas and culture tours, Myths and legends (mythology), Science
   (science), Maths (maths) and Psychology and place (psychology), each looked at on the globe, their default mode, at
   1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rvx.js (its helpers and engine, under "rvx" names so the files never touch each other's
   controls), with geoflock-polish-rvt.js's frames looked up by tour and title (so an opening stop is right on a tour's
   first launch) and geoflock-polish-rvq.js's psGlobeTarget wrapper: a stop framed here gets exactly its frame.
   geoflock-sweep-tours*.js re-set framing on every psGo, so the fixed fields are fixed, non-configurable getters whose
   setters are ignored; a field already non-configurable is left alone. Pin lists are filtered through getters (never
   frozen), and a stop's photo pins wait for geoflock-portraits.js's portraits before they are edited; a stop whose
   photos are dropped gets its photo squares rebuilt. geoflock-polish-m.js's photo getter stays underneath. CSS classes
   start with "rvx-". Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRvx)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvxTest or ?rvxtest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvxTest||/[?&]rvxtest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rvxTest||/[?&]rvxtest\b/.test(location.search)),enumerable:true,
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvx)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvx,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvx=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);

const FIX={};
FIX.mythology={
  /* Uluru's, Mount Fuji's, Teotihuacan's and Kīlauea's photos lay round the back of the globe (their squares hung at its
     edge): each has a stop of its own */
  "Myths and legends":S=>DROPPH(S,/^(Uluru|Mount Fuji|Teotihuacan|Kīlauea)/),
  /* Hattusa's photo and the "Hittites, 1500 BC" label lay under the map key: framed further east */
  "Troy":S=>VIEW(S,[31.5,39.4,3.6]),
  /* the epicentre, Simeulue, Banda Aceh's photo and the ruler's distance were piled on top of one another, the island
     itself a speck; an "Indonesia" label sat far off on the globe's edge. Framed close on the island and the ruler;
     Banda Aceh's photo (the card's own), which still lay on the ruler, goes: the ruler's end marks the city.
     "Most counts give seven deaths" goes from the text: the stop's game asks for a guess first, then gives it */
  "The word that saved an island":S=>{DROP(S,/^Indonesia$/);DROPPH(S,/^Banda Aceh/);RE(S,"body","Most counts give seven deaths on Simeulue; along","Along");VIEW(S,[95.9,4.1,10])},
  /* China, India and Nepal labels on long leaders crossed the map, India's at the bottom of the screen */
  "Mount Kailash":S=>DROP(S,/^(China|India|Nepal)$/),
  /* the 36 km loch was a sliver: framed closer on the Great Glen; the United Kingdom label on a long leader went */
  "Loch Ness":S=>{DROP(S,/^United Kingdom$/);VIEW(S,[-4.8,57.1,8])},
  /* the islands were specks in a wide ocean: framed closer */
  "Pele’s islands":S=>VIEW(S,[-157.4,20.7,8.5]),
  /* the Tenochtitlan label sat on top of the "Aztec Empire, 1500" label; the Templo Mayor photo, in the old city's
     centre, marks the place (its label is left alone: pictures are looked up by label, so a renamed photo pin lost its
     picture and the app's pruner dropped the stop's photos) */
  "Where the gods were born":S=>DROP(S,/^Tenochtitlan/),
  /* Zambia and Zimbabwe labels on long leaders: the map names both countries already */
  "The river god and the dam":S=>DROP(S,/^(Zambia|Zimbabwe)$/)
};
FIX.science={
  /* the opening's card was on the right (over the zoom buttons) and the map key on the left: the card goes left like the
     rest, framed on Europe beside it. Samarkand's photo then lay under the map key, the Galápagos and Apollo 11 photos
     under the card and on the globe's edge, Halley VI round the back: each has a stop of its own */
  "Where science happened":S=>{DROPPH(S,/^(The Registan|A Galápagos|Apollo|Halley)/);VIEW(S,[12,32,1.15])},
  /* a China label on a long leader hung off the globe's edge by the map key */
  "Zhang Heng’s earthquake detector":S=>DROP(S,/^China$/),
  /* Basra's label ran under the map key: framed further east */
  "Ibn al-Haytham and light":S=>VIEW(S,[51,29.5,2.6]),
  /* Darwin's portrait sat on top of the San Cristóbal photo and the ruler's distance: the photo goes (the ruler's end
     marks San Cristóbal), and the stop is framed closer, so the distance sits clear of the portrait */
  "Darwin in the Galápagos":S=>{DROPPH(S,/^San Cristóbal/);VIEW(S,[-85.5,-1,4.6])},
  /* Warsaw's photo lay under the map key and the France label hung on a long leader: framed further east, the country
     labels go (the ruler joins the two cities) */
  "Marie Curie":S=>{DROP(S,/^(France|Poland)$/);VIEW(S,[21,50.5,3.1])},
  /* Sobral lay under the card and Príncipe under the map key: the 5,340 km ruler is now wholly in view */
  "The eclipse that tested Einstein":S=>VIEW(S,[-6,2,1.15]),
  /* a Gabon label on a long leader; the map names it */
  "The natural nuclear reactor":S=>DROP(S,/^Gabon$/),
  /* the card was on the right; framed for the stop's game, Cape Canaveral to Kourou beside the card; the French Guiana
     label repeated Kourou's */
  "Launching into space":S=>{DROP(S,/^French Guiana/);VIEW(S,[-62,18,1.3])}
};
FIX.maths={
  /* the Kerala backwaters photo hung on the globe's right edge, by the map key: it has a stop of its own */
  "Maths":S=>DROPPH(S,/^The Kerala/),
  /* an Egypt label on a long leader, and the map names Egypt */
  "The flood that invented geometry":S=>DROP(S,/^Egypt$/),
  /* two photos on the same point at Alexandria, one covering the "Ptolemaic Egypt, 300 BC" label: the card's own
     library photo is Alexandria, so its square goes */
  "Euclid’s Alexandria":S=>DROPPH(S,/^Alexandria$/),
  /* the Jiankang label ran under the map key and a China label hung on a long leader: framed further east */
  "Zu Chongzhi and π":S=>{DROP(S,/^China$/);VIEW(S,[118.5,31.5,3.1])},
  /* India (Bhinmal, Gwalior) lay off the globe's right edge under the map key; Italy, Iraq and Algeria labels on long
     leaders: framed wider, from Béjaïa to Gwalior */
  "Zero and algebra go west":S=>{DROP(S,/^(Italy|Iraq|Algeria|India)$/);VIEW(S,[60,32,1])},
  /* an Iran label on a long leader at the bottom of the screen */
  "Tiles ahead of their time":S=>DROP(S,/^Iran$/),
  /* France and Spain labels on long leaders crossed the ruler */
  "The metre and the meridian":S=>DROP(S,/^(France|Spain)$/),
  /* the three hilltops were a dot, their labels stacked far off on long leaders: framed close on the triangle */
  "Gauss’s giant triangle":S=>{DROP(S,/^Germany$/);VIEW(S,[10.25,51.35,12])},
  /* the card was on the right and Tokyo off the globe's edge: framed over the pole side of the great circle */
  "Great circles":S=>VIEW(S,[75,60,1])
};
FIX.psychology={
  /* the opening's photos of Yunnan and Sapporo lay round the back of the globe, Phoenix and Tenejapa on its left edge
     under the card, the Kalahari below the screen: each has a stop of its own; Tromsø, Bern and Land's End stay */
  "From the land to the mind":S=>DROPPH(S,/^(Rice terraces|Sapporo|Phoenix|Musicians from Tenejapa|The Kalahari)/),
  /* Shanghai's photo lay under the map key and a China label hung on a long leader: framed further east */
  "Rice south, wheat north":S=>{DROP(S,/^China$/);VIEW(S,[116.5,32,2.6])},
  /* Tromsø, the stop's place, was off the globe's right edge under the map key: framed to show it and Florida */
  "Winter in Tromsø":S=>VIEW(S,[-22,55,1.15]),
  /* a United States label at the globe's right edge, under the map key */
  "Heat and tempers":S=>DROP(S,/^United States$/),
  /* the Evanston label hung at the top of the screen over the map switches, half a world from the Kalahari photo; the
     text names Evanston, and the stop's game tests the reader instead. Framed on the Kalahari, whose San photo hung
     at the globe's bottom edge */
  "A world of right angles":S=>{DROP(S,/^Evanston/);VIEW(S,[22,-12,1.3])},
  /* a United Kingdom label at the globe's right edge, under the map key */
  "Blue space":S=>DROP(S,/^United Kingdom$/)
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
 PEND=false;try{f(S)}catch(e){console.error("rvx fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
 if(document.querySelector(".rvx-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the count again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvx){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvx=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rvx-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvx-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvx-new");void e.offsetWidth;e.classList.add("rvx-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,tip:cfg.tip,
 card(L){return'<div class="rvx-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvx-rank"></ol><div class="rvx-pool"></div>'+
  '<div class="rvx-btns"><button type="button" class="rvx-btn rvx-undo">Undo</button><button type="button" class="rvx-btn rvx-show">Show me</button><button type="button" class="rvx-btn rvx-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvx-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvx-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvx-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvx-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvx-ok":"rvx-no"):"")+'"><span class="rvx-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvx-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvx-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvx-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvx-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);const t=cfg.items[k][4];if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvx-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvx-show").hidden=L.shown;c.querySelector(".rvx-again").hidden=!L.shown;
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
 card(L){return'<div class="rvx-btns rvx-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvx-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvx-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvx-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvx-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvx-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvx-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvx-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
/* (cfg.vals: the slider steps through these values instead of min..max; the answer is one of them, and "close" counts
   steps) */
function GUESS(cfg){const VS=cfg.vals,val=i=>VS?VS[i]:i,AI=VS?VS.indexOf(cfg.answer):cfg.answer;
 return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvx-gq"><input type="range" class="rvx-rng" min="'+(VS?0:cfg.min)+'" max="'+(VS?VS.length-1:cfg.max)+'" step="'+(VS?1:cfg.step)+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rvx-gv"></b></div>'+
  '<div class="rvx-btns"><button type="button" class="rvx-btn rvx-chk">Check my guess</button><button type="button" class="rvx-btn rvx-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvx-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvx-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rvx-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvx-rng");r.disabled=!!L.done;
  c.querySelector(".rvx-gv").textContent=cfg.fmt(val(L.done?AI:L.v));
  c.querySelector(".rvx-chk").hidden=!!L.done;c.querySelector(".rvx-again").hidden=!L.done;
  if(L.done){r.value=AI;const off=Math.abs(L.v-AI);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(val(L.v))+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}
/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rvx-q"><span class="rvx-n"></span><b class="rvx-item"></b></div><div class="rvx-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rvx-btn rvx-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rvx-btn rvx-next" hidden>Next →</button><button type="button" class="rvx-btn rvx-again" hidden>Start again</button></div><div class="rvx-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rvx-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rvx-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rvx-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rvx-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rvx-item").textContent=done?"":it[0];
  c.querySelectorAll(".rvx-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rvx-good",L.wait&&i===it[1]);b.classList.toggle("rvx-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rvx-next").hidden=!(L.wait&&!done);c.querySelector(".rvx-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rvx-again").hidden=!done;
  c.querySelectorAll(".rvx-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rvx-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rvx-y":"rvx-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvx-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvx-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvx-tdot"})}putTag(L,L.tg,q&&cfg.markTag&&cfg.markTag(it)?q:null,q&&cfg.markTag?esc(cfg.markTag(it)||""):"",14)}}}

/* ======================================================================== 1. What makes the sound? (music, Gamelan)
   The four families of the Hornbostel–Sachs system (Wikipedia, "Hornbostel–Sachs"): idiophones "produce their sounds by
   means of the actual body of the instrument vibrating" (a gong is its example 111.241), membranophones by "a tightly
   stretched membrane", chordophones by strings "stretched between fixed points", aerophones by "vibrating air" (free
   reeds, as in the accordion and the bandoneón, are aerophones, 412.13). Each instrument is one this tour visits; each
   answer turns the globe to its home. */

/* ======================================================================== 1. How many died? (mythology, smong)
   Wikipedia, "Simeulue": in 2004 "only seven residents on Simeulue died, while the remaining 70,000 survived" (between
   70,000 and 75,000 survivors); the 1907 tsunami "led to the death of more than 50% (some report as high as 70%) of the
   Simeulue population". The stop's own text no longer gives the number (see FIX). */
const GUESS_SMONG=GUESS({tours:["mythology"],title:"The word that saved an island",
 tip:"About 70,000 people lived on Simeulue when the wave came. How many of them do you think died?",
 vals:[0,1,3,7,15,30,70,150,300,700,1500,3000,7000,15000,30000,50000,70000],start:8,answer:7,close:1,
 fmt:v=>v.toLocaleString("en-GB")+(v===1?" person":" people"),
 after:"Seven, out of about 70,000. In 1907 a tsunami had killed more than half the island’s people; the word smong, sung to children ever since, sent everyone uphill in 2004."});

/* ======================================================================== 2. What lies behind the story? (mythology, Now explore)
   A review of the tour's own stops: each story and the real thing the stop ties it to (Thera's eruption, Mount Olympus,
   Stonehenge's bluestones, Surtsey, the 2004 tsunami, Uluru, Mount Mazama, the Mesopotamian floods, Teotihuacan).
   Each answer turns the globe there. */
const BINS_MYTH=BINS({tours:["mythology"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Myths often hold a real place or event. What real thing lies behind each story on this tour?",ask:"A volcano, the sea, a mountain or rock, or something people built?",
 bins:["A volcano","The sea or a flood","A mountain or rock","Something people built"],
 items:[["Zeus’s home",2,"Mount Olympus, Greece’s highest mountain, 2,918 m.",[22.35,40.09,4],"Mount Olympus"],
  ["Plato’s sunken Atlantis",0,"Thera blew apart about 3,600 years ago, and the sea poured in; it may have helped inspire Plato’s story.",[25.4,36.4,4],"Thera"],
  ["Merlin’s magic stones",3,"Stonehenge: people dragged its bluestones about 220 km from Wales.",[-1.83,51.18,4],"Stonehenge"],
  ["Surtr the fire giant",0,"Surtsey, the volcanic island that rose from the sea in 1963, is named after him.",[-20.6,63.3,4],"Surtsey"],
  ["Smong",1,"The word warns of tsunamis: if the ground shakes and the sea draws back, run uphill.",[96.1,2.6,4],"Simeulue"],
  ["Kuniya and Liru’s battle",2,"Their marks are on the rock of Uluru, 348 m high.",[131.04,-25.34,3.5],"Uluru"],
  ["Llao and Skell’s war",0,"Mount Mazama blew out so much rock that it collapsed, leaving Crater Lake.",[-122.1,42.94,4],"Crater Lake"],
  ["Utnapishtim’s boat",1,"Mesopotamia’s rivers flooded often; the tablet was found at Nineveh.",[43.15,36.36,3.5],"Nineveh"],
  ["The Fifth Sun",3,"Teotihuacan, a ruined city of pyramids, built by people centuries before the Aztecs found it.",[-98.84,19.69,4],"Teotihuacan"]],
 after:(r,N)=>(r===N?"Every one right. ":"")+"Three of the stories may remember an eruption, two the sea. The stories change as they are retold, but the places are still there to visit."});

/* ======================================================================== 3. Find Jamaica by the clock (science, Greenwich)
   The Earth turns 360° in 24 hours, 15° an hour, so each 4 minutes between local noon and Greenwich noon is 1° of
   longitude. H4's trial voyage of 1761–62 went to Jamaica and the watch lost only about 5 seconds (the stop's own text). Port Royal is at 17.94° N, 76.84° W (Wikipedia, "Port Royal"):
   307 minutes, 5 h 07 min, after Greenwich noon. Five seconds of time are 0.021° of longitude, about 2.2 km there. */
const PR=[-76.84,17.94],PRM=Math.round(-PR[0]*4);
const hm=m=>{const h=12+Math.floor(m/60),mm=m%60;return(h>12?h-12:h)+":"+String(mm).padStart(2,"0")+(h>=12?" pm":" am")};
const LONGCLOCK={tours:["science"],title:"Greenwich and longitude",globe:true,turns:true,
 tip:"Sail H4 to Jamaica! The watch keeps Greenwich time. Slide it to the Greenwich time when the Sun is highest where the ship is, and find Port Royal.",
 card(L){return'<div class="rvx-row"><input type="range" class="rvx-rng" min="0" max="420" step="1" value="0" aria-label="Greenwich time at local noon"><b class="rvx-val"></b></div>'+
  '<div class="rvx-btns"><button type="button" class="rvx-btn rvx-again">Back to Greenwich</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvx-rng");L.m=0;c.dataset.turns="1";turnGlobe(-40,30,1);
  r.oninput=()=>{L.m=+r.value;this.render(L)};c.querySelector(".rvx-again").onclick=()=>{L.m=0;r.value=0;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const m=L.m,lon=m/4,ok=Math.abs(m-PRM)<=3;L.ok=ok;
  c.querySelector(".rvx-val").textContent=hm(m);
  if(!m)say(L,"Noon at Greenwich, 0°","The Sun is highest over London at 12:00 on the watch. Sail west: the Sun reaches its highest later and later.");
  else if(ok)say(L,"Land ho! Port Royal, Jamaica: "+lon.toFixed(1)+"° W","Local noon at about 5:07 pm Greenwich time: 307 minutes, so 307 ÷ 4 = 76.8°. H4 lost only about 5 seconds on the way, an error of about 2 km here. Before such clocks, ships could be wrong by hundreds of km.");
  else say(L,"Noon here at "+hm(m)+" Greenwich time",(Math.floor(m/60)?Math.floor(m/60)+" h ":"")+(m%60)+" min after Greenwich noon: every 4 minutes is one degree, so you are "+lon.toFixed(1)+"° west."+(m<PRM?" Keep sailing west.":" Too far west: you have passed Jamaica."));
  L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";const lon=-(L.m||0)/4,mer=x=>{const P=[];for(let la=-8;la<=62;la+=2)P.push([x,la]);return pathOf(L,P)};
  svgEl(L.svg,"path",{d:mer(0),class:"rvx-mer0"});if(L.m)svgEl(L.svg,"path",{d:mer(lon),class:"rvx-mer"});
  const t=proj(L,PR);if(t)svgEl(L.svg,"circle",{cx:t[0],cy:t[1],r:L.ok?13:9,class:L.ok?"rvx-tring":"rvx-goal"});
  const q=proj(L,[lon,L.m?PR[1]:51.48]);if(!L.tg)L.tg=tag(L,"rvx-ctag");if(q)svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:6,class:"rvx-ship"});
  putTag(L,L.tg,q,L.m?(L.ok?"Port Royal!":"H4 · "+(-lon).toFixed(1)+"° W"):"Greenwich",12)}};

/* ======================================================================== 4. The free push (science, Launching into space)
   The ground's eastward speed is the equator's (the stop's own 1,670 km/h) times the cosine of the latitude. Launch site
   latitudes from Wikipedia: Baikonur Cosmodrome 45.97° N, 63.31° E; Kennedy Space Center LC-39A (Apollo 11) 28.61° N,
   80.60° W; Guiana Space Centre (Kourou) 5.24° N, 52.77° W. */
const push=lat=>Math.round(1670*Math.cos(lat*Math.PI/180)/10)*10;
const TURN_LAUNCH=TURNER({tours:["science"],mark:true,title:"Launching into space",tip:"How big a push does the Earth’s spin give each launch site? Turn the globe to each.",
 places:[["The equator",-25,8,1.2,"The ground here moves east at about 1,670 km/h. A rocket fired eastwards keeps that speed for free; at the poles it is zero."],
  ["Baikonur",63.31,45.97,2,"46° N: Sputnik and Gagarin went up from here. The spin gives about "+push(45.97).toLocaleString("en-GB")+" km/h."],
  ["Cape Canaveral",-80.6,28.61,2.2,"28.6° N: Apollo 11’s pad. The spin gives about "+push(28.61).toLocaleString("en-GB")+" km/h, and rockets fly east over the sea.",1],
  ["Kourou",-52.77,5.24,2.2,"5° N: Europe’s spaceport. The spin gives about "+push(5.24).toLocaleString("en-GB")+" km/h, almost all of the equator’s.",1]]});

/* ======================================================================== 5. Put the discoveries in order (science, Now explore)
   The tour's own dates: Zhang Heng's detector AD 132, Ibn al-Haytham's Book of Optics about 1011–1021, Ulugh Beg's
   observatory the 1420s, Galileo's moons of Jupiter 1610, Darwin in the Galápagos 1835, the Curies' polonium and
   radium 1898, the eclipse 1919, CERN's Higgs boson 2012. Each tap turns the globe to the place. */
const SORT_SCI=SORT({tours:["science"],title:"Now explore",turns:true,tip:"Put eight of the tour’s discoveries in the order they happened. Each one you tap turns the globe there.",
 first:"Earliest",last:"Latest",bars:false,
 items:[["Zhang Heng’s earthquake detector",132,"AD 132",0,[112.45,34.62,2]],["Ibn al-Haytham’s Book of Optics",1016,"about 1011–1021",0,[31.24,30.05,2]],
  ["Ulugh Beg’s observatory",1425,"1420s",0,[66.98,39.67,2]],["Galileo sees Jupiter’s moons",1610,"1610",0,[11.88,45.41,2]],
  ["Darwin in the Galápagos",1835,"1835",0,[-90.5,-0.7,2]],["The Curies find radium",1898,"1898",0,[2.35,48.85,2]],
  ["The eclipse tests Einstein",1919,"1919",0,[7.42,1.61,2]],["CERN finds the Higgs boson",2012,"2012",0,[6.05,46.23,2]]],
 after:(r,N)=>"Almost 1,900 years from a bronze jar in Luoyang to a 27 km ring under Geneva, on four continents."});

/* ======================================================================== 6. Share it out (maths, Counting in sixties)
   Plain arithmetic: 60 has twelve divisors (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60), 10 only four (1, 2, 5, 10). */
const BINS_SIXTY=BINS({tours:["maths"],title:"Counting in sixties",
 tip:"Why sixty? Share a pile of 10 loaves, or of 60, between friends. Which piles split evenly, with no loaf cut?",ask:"Which piles share out evenly?",
 bins:["10 and 60","Only 60","Neither"],
 items:[["Between 3 friends",1,"60 ÷ 3 = 20, but 10 ÷ 3 leaves one over."],["Between 5 friends",0,"10 ÷ 5 = 2 and 60 ÷ 5 = 12: five goes into both."],
  ["Between 7 friends",2,"Seven goes into neither: 60 ÷ 7 leaves 4 over."],["Between 4 friends",1,"60 ÷ 4 = 15, but 10 ÷ 4 leaves two over."],
  ["Between 2 friends",0,"Halves are easy in both."],["Between 12 friends",1,"60 ÷ 12 = 5: a dozen shares work only with sixty."],
  ["Between 8 friends",2,"60 ÷ 8 = 7 and a half: no good."],["Between 6 friends",1,"60 ÷ 6 = 10, but 10 ÷ 6 does not work."]],
 after:(r,N)=>"Sixty splits evenly 12 ways (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60); ten only 4 ways. That is why the hour still has 60 minutes."});

/* ======================================================================== 7. Squeeze π (maths, Zu Chongzhi)
   Liu Hui's method: a regular polygon of n sides inside a circle of diameter 1 has perimeter n·sin(180°/n), which
   creeps up on π as n doubles. Wikipedia, "Zu Chongzhi": he used Liu Hui's algorithm "to inscribe a 12,288-gon" (and
   elsewhere a 24,576-sided polygon), reaching π between 3.1415926 and 3.1415927. Computed here, not looked up. */
const PIDIG=Math.PI.toFixed(10);
const PIPOLY={tours:["maths"],title:"Zu Chongzhi and π",globe:false,
 tip:"Do it Zu’s way: fit a polygon inside a circle 1 unit across and measure round it. Double the sides until you match his seven decimals.",
 card(L){return'<svg class="rvx-pi" viewBox="0 0 200 150"><circle cx="100" cy="75" r="68" class="rvx-pic"/><path class="rvx-pip"/><line x1="32" y1="75" x2="168" y2="75" class="rvx-pid"/><text x="100" y="70" class="rvx-pit">1</text></svg>'+
  '<div class="rvx-row"><input type="range" class="rvx-rng" min="0" max="12" step="1" value="0" aria-label="Doublings"><b class="rvx-val"></b></div><div class="rvx-pinum"></div>'},
 wire(L){const r=L.card.querySelector(".rvx-rng");L.k=0;r.oninput=()=>{L.k=+r.value;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=6*Math.pow(2,L.k),v=n*Math.sin(Math.PI/n),s=v.toFixed(10);let d=0;while(d<s.length&&s[d]===PIDIG[d])d++;
  const dec=Math.max(0,d-2),show=Math.min(n,400);let P="";for(let i=0;i<=show;i++){const a=2*Math.PI*i/show-Math.PI/2;P+=(i?"L":"M")+(100+68*Math.cos(a)).toFixed(2)+" "+(75+68*Math.sin(a)).toFixed(2)}
  c.querySelector(".rvx-pip").setAttribute("d",P+"Z");c.querySelector(".rvx-val").textContent=n.toLocaleString("en-GB")+" sides";
  c.querySelector(".rvx-pinum").innerHTML='Round the polygon: <b><span class="rvx-pig">'+s.slice(0,d)+'</span>'+s.slice(d)+'</b>';
  if(dec>=7)say(L,"Seven decimals: 3.1415926…","Zu reached this around AD 480 with polygons of 12,288 and 24,576 sides, worked out by hand. Each doubling makes the gap about four times smaller, but the circle is never quite reached.");
  else say(L,dec?dec+" decimal place"+(dec>1?"s":"")+" right":"Not even one decimal yet",n===6?"A hexagon’s sides each equal the radius, so it measures exactly 3. Slide to double the sides.":"Double again: the polygon hugs the circle more tightly.")}};

/* ======================================================================== 8. Rice or wheat? (psychology)
   China's rice–wheat divide follows the Qinling–Huaihe line, "corresponding roughly to the 33rd parallel north", "the
   division between ... rice or wheat production areas" (Wikipedia, "Qinling–Huaihe Line"); rice to the south
   (Talhelm et al., Science, 2014, the stop's study). City latitudes from Wikipedia. Each answer turns the globe there. */
const BINS_RICE=BINS({tours:["psychology"],title:"Rice south, wheat north",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Rice south, wheat north of the line near 33° N. Which did each city’s farmland traditionally grow?",ask:"Rice or wheat?",
 bins:["Rice","Wheat"],
 items:[["Shijiazhuang",1,"38° N, far north of the line, on the North China Plain: wheat.",[114.51,38.04,3],"Shijiazhuang"],
  ["Nanchang",0,"29° N, by Poyang Lake: Jiangxi is paddy country.",[115.86,28.68,3],"Nanchang"],
  ["Guangzhou",0,"23° N, in the warm, wet south: rice, often two harvests a year.",[113.26,23.13,3],"Guangzhou"],
  ["Xi’an",1,"34° N, just north of the Qinling mountains: wheat, and its famous hand-pulled noodles.",[108.94,34.34,3],"Xi’an"],
  ["Zhengzhou",1,"35° N, on the North China Plain: wheat.",[113.63,34.75,3],"Zhengzhou"],
  ["Chengdu",0,"31° N, in the Sichuan basin: irrigated rice fields since ancient times.",[104.07,30.67,3],"Chengdu"],
  ["Jinan",1,"37° N: wheat, on the plain of the Yellow River.",[117,36.67,3],"Jinan"],
  ["Changsha",0,"28° N: Hunan is one of China’s great rice provinces.",[112.94,28.23,3],"Changsha"]],
 after:(r,N)=>"The line is a rule of thumb, but it is sharp enough that Talhelm’s team compared counties right on either side of it."});

/* ======================================================================== 9. Equal or not? (psychology, A world of right angles)
   The Müller-Lyer illusion itself: two lines of the same length, one with arrowheads, one with arrow tails (the stop's
   own picture and text). You set the lower line until the two look equal; the gap is the size of the illusion for you. */
const MULLER={tours:["psychology"],title:"A world of right angles",globe:false,
 tip:"Try it on yourself: drag the slider until the lower line looks exactly as long as the upper one.",
 card(L){return'<svg class="rvx-ml" viewBox="0 0 280 120"><g class="rvx-mlg"></g></svg><div class="rvx-row"><input type="range" class="rvx-rng" min="90" max="200" step="1" value="118" aria-label="Lower line length"></div>'+
  '<div class="rvx-btns"><button type="button" class="rvx-btn rvx-chk">They look equal</button><button type="button" class="rvx-btn rvx-again" hidden>Try again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvx-rng");L.v=118;L.done=false;r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvx-chk").onclick=()=>{L.done=true;this.render(L)};c.querySelector(".rvx-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const T=160,cx=140,f=14,line=(y,len,head)=>{const a=cx-len/2,b=cx+len/2,s=head?1:-1;
   return'<line x1="'+a+'" y1="'+y+'" x2="'+b+'" y2="'+y+'"/><path d="M'+(a+s*f)+' '+(y-f)+'L'+a+' '+y+'L'+(a+s*f)+' '+(y+f)+'M'+(b-s*f)+' '+(y-f)+'L'+b+' '+y+'L'+(b-s*f)+' '+(y+f)+'"/>'};
  let h=line(32,T,true)+line(88,L.v,false);
  if(L.done)h+='<line class="rvx-mlx" x1="'+(cx-T/2)+'" y1="8" x2="'+(cx-T/2)+'" y2="112"/><line class="rvx-mlx" x1="'+(cx+T/2)+'" y1="8" x2="'+(cx+T/2)+'" y2="112"/>';
  c.querySelector(".rvx-mlg").innerHTML=h;const r=c.querySelector(".rvx-rng");r.disabled=L.done;c.querySelector(".rvx-chk").hidden=L.done;c.querySelector(".rvx-again").hidden=!L.done;
  const pc=Math.round((T-L.v)/T*100);
  if(!L.done)say(L,"","The lines change, the arrows stay. Press the button when they look the same.");
  else if(pc>=3)say(L,"Fooled by "+pc+"%","You made the lower line "+pc+"% shorter than the upper one, yet they looked equal (the dashed guides show the real ends). In the 1960s study, students in Evanston were fooled most; San foragers in the Kalahari hardly at all.");
  else if(pc<=-3)say(L,"You went the other way: "+(-pc)+"% longer","Most people raised among square buildings make the arrow-tailed line shorter, not longer. The dashed guides show the real ends.");
  else say(L,"Almost exact: within "+Math.abs(pc)+"%","Your eyes were hardly fooled, like the San foragers in the Kalahari in the 1960s study. The dashed guides show the real ends.")}};

/* ======================================================================== 10. Which route? (psychology, Now explore)
   A review: the opening stop's four routes from the land to the mind (making a living; the body; what the senses and
   words practise; who moves there), and the tour's own stops. Each answer turns the globe to the stop's place. */
const BINS_ROUTE=BINS({tours:["psychology"],title:"Now explore",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"The tour began with four routes from the land to the mind. Which route does each stop follow?",ask:"Which route?",
 bins:["Making a living","The body","What the senses practise","Who moves there"],
 items:[["Rice farmers swapping days of work",0,"Making a living: paddies need shared canals and neighbours.",[113,30,2.2],"Southern China"],
  ["Hokkaido’s independent streak",3,"Who moves there: families who chose an open, cold frontier.",[142.5,43.3,2.5],"Hokkaido"],
  ["Winter in Tromsø",1,"The body: the dark months act on mood, though culture changes how strongly.",[18.96,69.65,2.5],"Tromsø"],
  ["Uphill and downhill in Tenejapa",2,"The senses and words: the slope of the land gives the words for direction.",[-92.4,16.8,3],"Tenejapa"],
  ["Herders answering an insult",0,"Making a living: a herd can be stolen in one night, so a tough name protects it.",[-86,36,2.2],"The American South"],
  ["Hot days at the ballpark",1,"The body: heat makes tempers shorter.",[-112.07,33.45,2.5],"Phoenix"],
  ["The carpentered world",2,"The senses: eyes trained on square corners read the arrows as corners.",[-87.69,42.05,2.5],"Evanston"],
  ["Frontier counties of the West",3,"Who moves there: the frontier was a filter first, then a school.",[-104.82,41.14,2.5],"Wyoming"]],
 after:(r,N)=>"Four routes, and none of them fixes what any one person is like: each shifts the averages a little, and culture carries the habit on."});

/* ======================================================================== 11. Walk the seven bridges (maths, Königsberg)
   The puzzle as the stop gives it: four pieces of land (north bank, south bank, the Kneiphof island, the eastern land),
   two bridges from the island to each bank, one from the island to the east, one from each bank to the east. Euler's
   rule: a walk crossing every bridge once allows at most two pieces of land with an odd number of bridges; here the
   counts are 5, 3, 3 and 3. */
const KB_LAND=[["the north bank",140,18],["the south bank",140,152],["the island",98,85],["the east",236,85]];
const KB_BR=[[0,2,"M78 38V67"],[0,2,"M120 38V67"],[1,2,"M78 103V132"],[1,2,"M120 103V132"],[2,3,"M147 85H196"],[0,3,"M236 38V64"],[1,3,"M236 106V132"]];
const KONIG={tours:["maths"],title:"The bridges of Königsberg",globe:false,
 tip:"Try Euler’s puzzle: start on any piece of land and cross every bridge exactly once.",
 card(L){return'<svg class="rvx-kb" viewBox="0 0 280 170"><rect x="0" y="36" width="280" height="98" class="rvx-kbw"/>'+
  '<rect x="0" y="0" width="280" height="38" class="rvx-kbl" data-l="0"/><rect x="0" y="132" width="280" height="38" class="rvx-kbl" data-l="1"/>'+
  '<ellipse cx="98" cy="85" rx="50" ry="18" class="rvx-kbl" data-l="2"/><path d="M196 64H280V106H196Q186 85 196 64Z" class="rvx-kbl" data-l="3"/>'+
  KB_BR.map((b,i)=>'<path d="'+b[2]+'" class="rvx-kbb" data-b="'+i+'"/>').join("")+'<g class="rvx-kbn"></g><circle r="8" class="rvx-kbme" cx="-20" cy="-20"/></svg>'+
  '<div class="rvx-btns"><button type="button" class="rvx-btn rvx-again">Start again</button><button type="button" class="rvx-btn rvx-show">Count the bridges</button></div>'},
 wire(L){const c=L.card;L.at=-1;L.used=[];L.count=false;
  c.querySelectorAll(".rvx-kbl").forEach(e=>e.addEventListener("click",()=>{if(L.at<0){L.at=+e.dataset.l;this.render(L)}}));
  c.querySelectorAll(".rvx-kbb").forEach(e=>e.addEventListener("click",()=>{const i=+e.dataset.b,b=KB_BR[i];if(L.at<0||L.used.includes(i)||(b[0]!==L.at&&b[1]!==L.at))return;
   L.used.push(i);L.at=b[0]===L.at?b[1]:b[0];this.render(L)}));
  c.querySelector(".rvx-again").onclick=()=>{L.at=-1;L.used=[];this.render(L)};c.querySelector(".rvx-show").onclick=()=>{L.count=!L.count;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;
  c.querySelectorAll(".rvx-kbb").forEach(e=>{const i=+e.dataset.b,b=KB_BR[i],u=L.used.includes(i);e.classList.toggle("rvx-kbu",u);e.classList.toggle("rvx-kbok",!u&&L.at>=0&&(b[0]===L.at||b[1]===L.at))});
  const me=c.querySelector(".rvx-kbme"),P=L.at>=0?KB_LAND[L.at]:null;me.setAttribute("cx",P?P[1]:-20);me.setAttribute("cy",P?P[2]:-20);
  c.querySelector(".rvx-kbn").innerHTML=L.count?KB_LAND.map((l,k)=>{const n=KB_BR.filter(b=>b[0]===k||b[1]===k).length;return'<text x="'+(l[1]+(k===3?0:26))+'" y="'+(l[2]+4)+'" class="rvx-kbt">'+n+'</text>'}).join(""):"";
  c.querySelector(".rvx-show").textContent=L.count?"Hide the counts":"Count the bridges";
  const k=L.used.length,left=L.at>=0&&KB_BR.some((b,i)=>!L.used.includes(i)&&(b[0]===L.at||b[1]===L.at));
  if(L.at<0)say(L,"","Tap a piece of land to start your walk.");
  else if(left)say(L,k?k+" of 7 bridges crossed":"You are on "+KB_LAND[L.at][0],"Tap a glowing bridge to cross it.");
  else say(L,"Stuck on "+KB_LAND[L.at][0]+" after "+k+" of 7","Everyone gets stuck. Each time you pass through a piece of land you use two bridges, one in and one out, so only the start and the end may have an odd number. Count them: here all four are odd (5, 3, 3 and 3), so no walk can work.")}};

/* ======================================================================== 12. Land or sea underneath? (maths, Antipodes)
   The antipode of (longitude, latitude) is (longitude ± 180°, −latitude), as the stop says. City coordinates from
   Wikipedia; the antipodes worked out from them: London → 179.9° E, 51.5° S (the Pacific south-east of New Zealand);
   Honolulu → 22.1° E, 21.3° S (Botswana); Tokyo → 40.3° W, 35.7° S (the South Atlantic); New York → 106.0° E, 40.7° S
   (the Indian Ocean south-west of Australia); Shanghai → 58.5° W, 31.2° S (north-east Argentina); Delhi → 102.8° W,
   28.6° S (the South Pacific); Hong Kong → 65.8° W, 22.3° S (the Andes of north-west Argentina). Madrid and northern
   China are left out: the stop's text gives them. */
const BINS_ANTI=BINS({tours:["maths"],title:"Antipodes",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"Dig straight down through the middle of the Earth. Do you come out on land, or in the sea?",ask:"Land or sea on the far side?",
 bins:["Land","Sea"],
 items:[["From London",1,"Sea: the cold Pacific south-east of New Zealand, not far from its Antipodes Islands.",[179.87,-51.51,2.4],"Under London"],
  ["From Honolulu",0,"Land: Botswana, in the Kalahari. A Pacific island’s far side is in the middle of Africa.",[22.14,-21.31,2.4],"Under Honolulu"],
  ["From Tokyo",1,"Sea: the South Atlantic, off Uruguay.",[-40.31,-35.69,2.4],"Under Tokyo"],
  ["From New York",1,"Sea: the Indian Ocean, south-west of Australia.",[106,-40.71,2.4],"Under New York"],
  ["From Shanghai",0,"Land: north-east Argentina, near the border with Uruguay.",[-58.53,-31.23,2.4],"Under Shanghai"],
  ["From Delhi",1,"Sea: the South Pacific, not far from Easter Island.",[-102.79,-28.61,2.4],"Under Delhi"],
  ["From Hong Kong",0,"Land: the Andes of north-west Argentina, by the Bolivian border.",[-65.83,-22.32,2.4],"Under Hong Kong"]],
 after:(r,N)=>"Most places have sea on the far side: the Earth is mostly ocean, and only about 15% of land lies opposite other land. South America and East Asia are the big pair."});

const DEFS=[GUESS_SMONG,BINS_MYTH,LONGCLOCK,TURN_LAUNCH,SORT_SCI,BINS_SIXTY,PIPOLY,KONIG,BINS_ANTI,BINS_RICE,MULLER,BINS_ROUTE];


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvx-layer rvx-layer";el.innerHTML='<svg class="rvx-sv"><defs><clipPath id="rvxDisc"><path class="rvx-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvxDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvx-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvx-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvx-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvx-ctl";
 c.innerHTML='<div class="rvx-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvx-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvx-ctl"))unmount()}catch(e){}},300);
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
.rvx-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvx-sv{position:absolute;left:0;top:0;overflow:visible}
.rvx-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvx-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvx-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvx-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvx-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvx-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvx-btn[hidden]{display:none}
.rvx-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvx-ep b{display:block;font-size:15px}
.rvx-ep.rvx-new{animation:rvxIn .45s ease}@keyframes rvxIn{from{opacity:.2;transform:translateY(4px)}}
.rvx-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvx-sortq i{font-style:normal}
.rvx-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvx}
.rvx-rank li{position:relative;counter-increment:rvx;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvx-rank li::before{content:counter(rvx);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvx-rank li.rvx-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvx-rank li.rvx-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvx-nm{flex:1 1 auto;z-index:1}.rvx-v{z-index:1;font-weight:800;white-space:nowrap}
.rvx-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvx-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvx-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvx-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvx-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvx-do,:is(body.dark-theme,body.sky-night) .rvx-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvx-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvx-btn,:is(body.dark-theme,body.sky-night) .rvx-chip,:is(body.dark-theme,body.sky-night) .rvx-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvx-rank li.rvx-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvx-rank li.rvx-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvx-bar{background:rgba(255,178,122,.2)}
.rvx-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvx-rng{flex:1 1 auto;accent-color:#d9682b}.rvx-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvx-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvx-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvx-item{font-size:16px;color:#13294b}
.rvx-bins{display:flex;gap:6px;flex-wrap:wrap}.rvx-bins .rvx-btn[hidden]{display:none}.rvx-bin:disabled{cursor:default;opacity:.55}
.rvx-btn.rvx-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvx-btn.rvx-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvx-dots{display:flex;gap:4px;margin-top:8px}.rvx-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvx-dots i.rvx-now{box-shadow:0 0 0 2px #d9682b inset}.rvx-dots i.rvx-y{background:#1f8a4c}.rvx-dots i.rvx-x{background:#c2364f}
.rvx-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvx-sl .rvx-row{margin-top:2px}.rvx-sl .rvx-val{min-width:36px}
.rvx-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvx-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvx-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvx-out b{font-size:15px;color:#9a4a16}
.rvx-ch{display:block;width:100%;height:auto;margin-top:6px}.rvx-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvx-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvx-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvx-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvx-val,:is(body.dark-theme,body.sky-night) .rvx-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvx-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvx-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvx-n,:is(body.dark-theme,body.sky-night) .rvx-sl label,:is(body.dark-theme,body.sky-night) .rvx-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvx-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvx-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvx-dots i{background:rgba(255,255,255,.18)}
.rvx-btn.rvx-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvx-btn.rvx-cur{background:#9fc3ff;color:#13294b}
.rvx-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rvx-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rvx-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rvx-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvx-ep b .rvx-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rvx-ep b .rvx-km{color:#ffb27a}
.rvx-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rvx-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rvx-small{font-size:11.5px!important;padding:2px 7px!important}
.rvx-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rvx-gq .rvx-rng{flex:1 1 auto}.rvx-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rvx-julh{fill:#c2364f}.rvx-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rvx-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rvx-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rvx-gv{color:#ffb27a}
.rvx-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rvx-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rvx-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rvx-tring{fill:none;stroke:#d9682b;stroke-width:3}.rvx-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
.rvx-clk{font-size:18px}.rvx-mer0{fill:none;stroke:#13294b;stroke-width:2;opacity:.6}.rvx-mer{fill:none;stroke:#d9682b;stroke-width:3;stroke-dasharray:6 5}
.rvx-goal{fill:none;stroke:#13294b;stroke-width:2.5;stroke-dasharray:3 3}.rvx-ship{fill:#d9682b;stroke:#fff;stroke-width:2.5}
.rvx-pi{display:block;width:170px;height:auto;margin:2px auto 0}.rvx-pic{fill:none;stroke:#8a98a8;stroke-width:2}.rvx-pip{fill:rgba(217,104,43,.12);stroke:#d9682b;stroke-width:1.6;stroke-linejoin:round}
.rvx-pid{stroke:#13294b;stroke-width:1.5;stroke-dasharray:3 3}.rvx-pit{font:800 12px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
.rvx-pinum{margin-top:6px;font-size:13px;color:#5b6b7c}.rvx-pinum b{font-size:17px;color:#13294b;font-variant-numeric:tabular-nums;letter-spacing:.02em}.rvx-pig{color:#1f8a4c}
.rvx-ml{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0}.rvx-mlg line,.rvx-mlg path{fill:none;stroke:#13294b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rvx-mlg .rvx-mlx{stroke:#c2364f;stroke-width:1.5;stroke-dasharray:4 4}
:is(body.dark-theme,body.sky-night) .rvx-mlg line,:is(body.dark-theme,body.sky-night) .rvx-mlg path,:is(body.dark-theme,body.sky-night) .rvx-pid{stroke:#e8eef8}
:is(body.dark-theme,body.sky-night) .rvx-mlg .rvx-mlx{stroke:#ff7088}:is(body.dark-theme,body.sky-night) .rvx-pit{fill:#e8eef8}
:is(body.dark-theme,body.sky-night) .rvx-pinum{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rvx-pinum b{color:#fff}:is(body.dark-theme,body.sky-night) .rvx-pig{color:#4cc27f}
.rvx-kb{display:block;width:100%;max-width:300px;height:auto;margin:2px auto 0;border-radius:10px;overflow:hidden}.rvx-kbw{fill:#7fb3e0}
.rvx-kbl{fill:#e9dfc4;stroke:#b9a77a;stroke-width:1;cursor:pointer}.rvx-kbb{fill:none;stroke:#8a6a3a;stroke-width:9;stroke-linecap:round;cursor:pointer}
.rvx-kbb.rvx-kbok{stroke:#f2b33d}.rvx-kbb.rvx-kbu{stroke:#d9682b;stroke-dasharray:2 4;stroke-width:6;cursor:default}
.rvx-kbme{fill:#c2364f;stroke:#fff;stroke-width:3;transition:cx .4s,cy .4s}.rvx-kbt{font:800 15px system-ui,sans-serif;fill:#13294b;text-anchor:middle}
:is(body.dark-theme,body.sky-night) .rvx-ctl .rvx-btn.rvx-good{opacity:1;background:#1f8a4c;border-color:#4cc27f;color:#fff}
:is(body.dark-theme,body.sky-night) .rvx-ctl .rvx-btn.rvx-bad{opacity:1;background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvx-kbt{fill:#13294b}
`;document.head.appendChild(s)}

window.gfPolishRvx={v:1,FIX,XFS,viewOf,tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
