/* GeoFlock polish RV-Y: a stop-by-stop review of four tours, Festivals and holidays (festivals), Houses of the world
   (houses), Biomes (biomes) and Forests (forests), each looked at on the globe, their default mode, at 1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left: on the right (as tour questions can flip it) it covered
      the zoom buttons and the place the stop is about.
   2. Stops you can play with (listed in DEFS at the end of part 2), and guess-first questions through
      geoflock-tourplay.js.
   The structure, helpers and engine are copied from geoflock-polish-rvv.js (itself from -rvt.js's frame-by-title
   lookup, so a tour's opening stop gets its frame on the very first launch, -rvq.js's psGlobeTarget wrapper, so a framed
   stop gets exactly its frame, and -rvr.js's pin lists filtered through getters, never frozen, a stop with a portrait
   waiting for it before its photo pins are filtered), under "rvy" names, so none of them touch each
   other's controls. A field another script already serves through its own getter keeps that getter and setter
   underneath (as geoflock-polish-rvs.js and -rvx.js do), so a stop's photos are never lost. Framing and the card side
   are fixed, non-configurable getters whose setters are ignored (the geoflock-sweep-tours*.js files re-set framing on
   every psGo); a field already non-configurable is left alone.
   On these stops the map key sits in the bottom right corner (about x 1014–1264, y 512–840 at 1280×860) and the zoom
   buttons at x 992–1028, y 230–425. */
(function(){
"use strict";
if(window.gfPolishRvy)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvyTest or ?rvytest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const TESTING=()=>!!(window.__rvyTest||/[?&]rvytest\b/.test(location.search));
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TESTING(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* Pin lists are filtered, not frozen (as in geoflock-polish-rvr.js): the shared photo passes turn text pins into photo
   pins at their own times after load, so a list copied once would keep or lose pins depending on timing. XF puts a
   getter on the field that applies this file's edits to whatever the field holds; other files' writes still go through
   (to the value underneath). Each edit has an id, so applying the fixes again does not stack them. */
const XFS=new WeakMap();
let PEND=false;
const TOUR_OF=new WeakMap(),PPOK=new Map(),PPW=new WeakMap();
/* a stop to which geoflock-portraits.js adds a portrait waits (at most about 20 s) until it is in before this file
   wraps its photo pins: wrapped first, the portrait could not be added */
const pplList=S=>{try{const t=TOUR_OF.get(S)||(ps&&ps.tour),n=strip(S.title);return(window.GF_PORTRAITS||[]).filter(p=>p.tour===t&&p.stop===n)}catch(e){return[]}};
const pplPending=S=>{try{if(!pplList(S).length||Object.prototype.hasOwnProperty.call(S,"_gfPpl"))return false;
 const w=(PPW.get(S)||0)+1;PPW.set(S,w);return w<70}catch(e){return false}};
const pplOk=f=>{const m=PPOK.get(f);if(m===true)return true;const now=Date.now();if(m&&now-m<2000)return false;
 let ok=false;try{ok=PS_PHOTO_DATA.some(x=>x&&x.f===f&&x.d)}catch(e){}PPOK.set(f,ok||now);return ok};
function pplReady(S){return pplList(S).filter(p=>pplOk(p.f)).length}
/* portraits whose pictures load later are added here, as geoflock-portraits.js would on a later redraw */
function pplAdd(S,v){const names=new Set(v.map(q=>strip(q&&q.label).toLowerCase()));
 pplList(S).forEach(p=>{if(!names.has(p.name.toLowerCase())&&pplOk(p.f))v=v.concat([{at:p.at,label:p.name,col:"#3d3466",icon:"photo",person:1}])});return v}
/* the filtered list is the same array until the value underneath or the edits change, and it is handed to
   geoflock-portraits.js as its own (S._gfPpl), so it does not try to wrap the field again */
function sync(S,k,v){if(k==="phPins"&&Object.prototype.hasOwnProperty.call(S,"_gfPpl"))try{S._gfPpl=v}catch(e){}return v}
const XF=(S,k,id,fn)=>{try{if(k==="phPins"&&!(XFS.get(S)||{})[k]&&pplPending(S)){PEND=true;return}let R=XFS.get(S);if(!R){R={};XFS.set(S,R)}
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;const B={v:S[k],fns:{},og:d&&d.get,os:d&&d.set};R[k]=B;
  Object.defineProperty(S,k,{configurable:TESTING(),enumerable:true,
   get:()=>{const pk=k==="phPins"?pplReady(S):0,bv=B.og?B.og.call(S):B.v;if(B.out&&B.at===bv&&B.atN===B.n&&B.pk===pk)return sync(S,k,B.out);let v=Array.isArray(bv)?bv.slice():(bv||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}
    if(pk)v=pplAdd(S,v);const was=B.out;B.out=v;B.at=bv;B.atN=B.n;B.pk=pk;
    /* another file swapped in a new set of photos: squares built from the old set are rebuilt */
    if(was&&k==="phPins")setTimeout(()=>{try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}},0);
    return sync(S,k,v)},set:x=>{if(B.os)B.os.call(S,x);else B.v=x}})}
 if(!R[k].fns[id]){R[k].fns[id]=fn;R[k].n=(R[k].n||0)+1;
  /* index.html builds a stop's photo squares once, by position: if the stop is already on screen, its squares are
     rebuilt so the photos match their places (as geoflock-polish-rvo.js's drop helper does) */
  if(k==="phPins")try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}}}catch(e){}};
const DROP=(S,re)=>XF(S,"pins","drop"+re,P=>P.filter(p=>!re.test(pinText(p))));
const DROPPH=(S,re)=>XF(S,"phPins","drop"+re,P=>P.filter(p=>!re.test(strip(p&&p.label))));
/* rename a text pin */
const RENAME=(S,re,txt)=>XF(S,"pins","ren"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p));
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>XF(S,"pins","mv"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p));
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>XF(S,"pins","area"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p));
/* add a text pin (once) */
const ADDPIN=(S,pin)=>XF(S,"pins","add"+pin[1],P=>P.some(p=>Array.isArray(p)&&strip(p[1])===pin[1])?P:P.concat([pin]));
/* drop the icon pins with this icon name (and, if given, within 2° of this place) */
const DROPIC=(S,re,at)=>XF(S,"iconPins","dropic"+re+at,I=>I.filter(q=>!(q&&re.test(String(q.icon))&&(!at||Math.hypot(q.at[0]-at[0],q.at[1]-at[1])<2))));
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine itself turns it out from under the card */
const VIEWED=new WeakMap();
const VIEW=(S,g)=>{LOCK(S,"globe",g);VIEWED.set(S,g)};
/* index.html's wrapper of psGlobeTarget flies to the middle of all a stop's pins, photos and icons whenever more of them
   are in sight from there. A stop framed here (on the globe, not the flat map) gets exactly its frame
   (geoflock-polish-rvq.js). */
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvy)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvy,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvy=1;window.psGlobeTarget=w}catch(e){}})(0);

const FIX={};
FIX.festivals={
 /* the Ethiopia label and the Jerusalem and Mecca pins sat under the card: framed further west */
 "Sun, Moon or both":S=>VIEW(S,[52,24,1.05]),
 /* New Orleans, Port of Spain and Oruro sat under the card, and Rio's photo at the bottom of the screen: framed on the
    Americas, where most of the stop's places are. The Rio photo, its square below the screen, goes (the card's own
    photo is Rio's parade) */
 "Carnival":S=>{DROPPH(S,/^Rio de Janeiro/);VIEW(S,[-60,8,1.05])},
 /* the Dhaka photo sat on the globe's edge and Jakarta's under the map key: framed further east */
 "Ramadan and Eid":S=>VIEW(S,[72,11,1.15]),
 /* an "India" label on a long leader across the country */
 "The biggest crowd on Earth":S=>DROP(S,/^India$/),
 /* Bangkok and Chiang Mai (Songkran) sat on the globe's edge under the map key: framed further east */
 "New year in spring":S=>VIEW(S,[80,27,1.3]),
 /* Japan and South Korea named twice, by the map and by labels; the text said "about 2,200 km" where its own ruler
    reads 2,250 km */
 "Hanami: cherry blossom time":S=>{DROP(S,/^(Japan|South Korea)$/);RE(S,"body","about 2,200 km in four months","about 2,250 km in four months")},
 /* country labels on long leaders, named by the map already */
 "Inti Raymi":S=>DROP(S,/^(Peru|Bolivia|Ecuador)$/),
 /* a Mongolia label half under the card, Mongolia named by the map already */
 "Naadam: the three games of the steppe":S=>DROP(S,/^Mongolia$/),
 /* the Munich photo sat on the zoom buttons; Germany and Spain named twice */
 "Oktoberfest and La Tomatina":S=>{DROP(S,/^(Germany|Spain)$/);VIEW(S,[6.5,44,3])},
 /* the Sumpango (Guatemala) label sat on the globe's edge, hidden */
 "Día de los Muertos":S=>VIEW(S,[-96,18.5,3]),
 /* all of the year's harvest festivals at once flew the globe to the North Pole, with Plymouth and Canada under the
    card, Seoul's and China's labels at the top of the screen and Accra's below it: the stop opens on New England, and
    buttons (part 2) turn the globe to each festival. A stray Taiwan label goes */
 "Harvest moons and Thanksgiving":S=>{DROP(S,/^Taiwan/);VIEW(S,[-75,40,1.6])},
 /* the Times Square photo sat on the zoom buttons, the Edinburgh photo (the card's own) above the globe, and the
    American Samoa label below the screen: framed on the Pacific, where the race starts and ends */
 "Hogmanay and the race to midnight":S=>{DROPPH(S,/^(Times Square|Edinburgh)/);VIEW(S,[-162,8,1])}
};

/* Each stop's frame, by tour and title, read once from FIX at load (each fix run on a stand-in stop that has only its
   title). On a tour's very first launch index.html flies to the opening stop before the fixes above are applied to it
   (they go in when the tour opens, a tick later), so psGlobeTarget (wrapped above) finds the frame by title as well
   (as geoflock-polish-rvt.js does). */
const FRAMES={};
for(const t in FIX)for(const k in FIX[t]){try{const D={title:k};FIX[t][k](D);const v=VIEWED.get(D);if(v)FRAMES[t+"|"+k]=v}catch(e){}}
const viewOf=S=>{const v=VIEWED.get(S);if(v)return v;try{return S&&ps&&ps.tour&&FRAMES[ps.tour+"|"+strip(S.title)]}catch(e){return null}};
const applied=new WeakSet();let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left */
 LOCK(S,"card","left");const f=F[strip(S.title)];if(!f){applied.add(S);return}TOUR_OF.set(S,tour);
 PEND=false;try{f(S)}catch(e){console.error("rvy fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}
 /* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when
    ps.tour changes; a stop waiting for its portrait is tried again */
 waiting=false;applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;
 /* and once more on the stop itself, in case another file re-set a field after the first pass */
 try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f){TOUR_OF.set(S,t);PEND=false;f(S)}}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins; the fixes go in when one
   of these tours opens.) Only the card side is locked at load, so a tour's first stop already opens with its card on
   the left */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);

/* The card shift, kept (as geoflock-polish-rvt.js does for its tours): geoflock-tourload.js's "aim" turns the globe
   back to the stop's plain centre whenever it is more than 20° from it, undoing psFlyGlobe's turn out from under the
   card. Here aim is told the stop is already aimed, and for a while after a stop opens (counted in ticks, since a
   first launch can block the page for many seconds), if the globe has come to rest away from where psFlyGlobe would put
   it, it flies there once more. A drag or zoom by the reader cancels it. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=0;refl=0;touched=0}goAt++;ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe is left to it */
 if(document.querySelector(".rvy-ctl[data-turns]"))return;
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same window: psGo is wrapped to start the clock again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvy){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvy=1;window.psGo=w}catch(e){}})(0);

/* ======================================================================== part 2: stops you can play with
   (the list is in DEFS below) */
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
function tag(L,cls){const d=document.createElement("div");d.className="rvy-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvy-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvy-new");void e.offsetWidth;e.classList.add("rvy-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvy-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvy-rank"></ol><div class="rvy-pool"></div>'+
  '<div class="rvy-btns"><button type="button" class="rvy-btn rvy-undo">Undo</button><button type="button" class="rvy-btn rvy-show">Show me</button><button type="button" class="rvy-btn rvy-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvy-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvy-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvy-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvy-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvy-ok":"rvy-no"):"")+'"><span class="rvy-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvy-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvy-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvy-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvy-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvy-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvy-show").hidden=L.shown;c.querySelector(".rvy-again").hidden=!L.shown;
  if(!L.order.length)say(L,"","Tap the "+cfg.first.toLowerCase()+" first.");
  else if(!done)say(L,"",(N-L.order.length)+" to go. Next one?");
  else if(L.gave)say(L,"Here is the real order",cfg.after(-1,N));
  else say(L,right===N?"All "+N+" in the right place!":right+" of "+N+" in the right place",cfg.after(right,N))}};}


/* ---------------- a one-at-a-time sorting quiz: which kind is it? ----------------
   cfg: {tours, title, tip, kinds:[[key, button text, name in the answer]], items:[[text, key or [keys that count], why]],
   turns (an item's 4th entry, [lon, lat, zoom], is where the globe turns once it is answered), ask (the
   question under each item), below (after the stop's text: a review), end(right, N) → closing text}. An item may fit more than one kind: any of them
   counts, and all of them light up. */
function CLASSIFY(cfg){const OK=it=>Array.isArray(it[1])?it[1]:[it[1]];const nm=k=>{const x=cfg.kinds.find(q=>q[0]===k);return x?(x[2]||x[1]):k};
 return{tours:cfg.tours,title:cfg.title,globe:!!cfg.turns,turns:!!cfg.turns,below:!!cfg.below,tip:cfg.tip,
 /* (where answers turn the globe, a pulsing ring marks the place, with its name unless the stop labels that spot) */
 init(L){L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvy-ring"});L.tag=tag(L,"rvy-ctag");L.anim=1},
 draw(L){const it=L.ans&&L.k<cfg.items.length?cfg.items[L.k]:null,at=it&&it[3],q=at?proj(L,[at[0],at[1]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  let dup=false;if(at)try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-at[0])<.6&&Math.abs(ll[1]-at[1])<.6})}catch(e){}
  putTag(L,L.tag,at&&!dup?proj(L,[at[0],at[1]],1):null,it?esc(it[0]):null,16)},
 card(L){return'<div class="rvy-q"><span class="rvy-n"></span><b class="rvy-item"></b></div><div class="rvy-bins">'+cfg.kinds.map(k=>'<button type="button" class="rvy-btn rvy-bin" data-k="'+k[0]+'">'+esc(k[1])+'</button>').join("")+'</div>'+
  '<div class="rvy-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div><div class="rvy-btns"><button type="button" class="rvy-btn rvy-next" hidden>Next ▶</button><button type="button" class="rvy-btn rvy-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;const N=cfg.items.length;
  c.querySelectorAll(".rvy-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=N)return;L.ans=b.dataset.k;L.res[L.k]=OK(cfg.items[L.k]).includes(L.ans);const at=cfg.items[L.k][3];if(cfg.turns&&at)turnGlobe(at[0],at[1],at[2]);this.render(L)});
  c.querySelector(".rvy-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvy-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,end=L.k>=N,it=cfg.items[Math.min(L.k,N-1)],ok=OK(it);
  c.querySelector(".rvy-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvy-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvy-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvy-good",!!L.ans&&ok.includes(b.dataset.k));b.classList.toggle("rvy-bad",!!L.ans&&b.dataset.k===L.ans&&!ok.includes(L.ans))});
  c.querySelectorAll(".rvy-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvy-y":L.res[i]===false?"rvy-x":i===L.k&&!end?"rvy-now":"");
  c.querySelector(".rvy-next").hidden=end||!L.ans;c.querySelector(".rvy-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvy-again").hidden=!end;
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": a perfect score!":r>=N-2?": well done.":""),cfg.end(r,N))}
  else if(!L.ans)say(L,"",cfg.ask);
  else if(ok.includes(L.ans))say(L,"Right: "+(ok.length>1?ok.map(nm).join(" and "):nm(L.ans)),it[2]);
  else say(L,"Not quite: "+ok.map(nm).join(" and "),it[2])}}}


function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.35;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}
/* a row of buttons, one per place; the stop opens on the first. places: [name, lon, lat, zoom, text] */

/* ---------------- buttons that turn the globe from place to place (as in geoflock-polish-rvk.js) ----------------
   cfg: {tours, title, tip, intro, places:[[name, lon, lat, zoom, text]], extra:{card(L), wire(L)} (more controls under the
   buttons)}. A pulsing ring marks the place turned to, with a name tag unless the stop already labels that spot. */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:true,turns:true,tip:cfg.tip,
 card(L){return(cfg.extra?cfg.extra.card(L):"")+'<div class="rvy-btns rvy-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvy-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 init(L){L.at=-1;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvy-ring"});L.tag=tag(L,"rvy-ctag");L.anim=1},
 draw(L){const f=L.at>=0?cfg.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  putTag(L,L.tag,f&&!L._dup?proj(L,[f[1],f[2]],1):null,f?esc(f[0]):null,16)},
 wire(L){const c=L.card;c.querySelectorAll(".rvy-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});
  if(cfg.extra)try{cfg.extra.wire.call(this,L)}catch(e){console.error(e)}this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvy-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvy-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+cfg.places[k][0]});
  if(L.over)return;if(L.at<0)say(L,"",cfg.intro);else{const f=cfg.places[L.at];say(L,f[0],f[4])}}}}


/* ======================================================================== festivals */
/* ---- Sun, Moon or both: slide through the years and watch Ramadan walk backwards round the calendar, while Christmas
   stays put and Lunar New Year stays in its four-week band. Ramadan's first day: 18 February 2026, 8 February 2027,
   28 January 2028 (Umm al-Qura calendar, Wikipedia, "Ramadan", table "Ramadan dates between 2024 and 2028"); later
   years are counted on in lunar years of 354.37 days (12 synodic months of 29.53 days, Wikipedia, "Islamic calendar"
   and "Lunar month"), so a date can be a day out from the one announced when the new crescent is seen. Lunar New Year
   falls "between 21 January and 20 February" (the stop's own text). The daylight shown is for London (51.5° N), from
   the standard sunrise equation, cos h = −tan φ tan δ, with the Sun's declination δ = 23.44° sin(360°(day − 81)/365)
   (Wikipedia, "Sunrise equation"): the hours a fast from dawn to sunset lasts are a little longer. */
const RM0=Date.UTC(2026,1,18),RM_LY=354.367*864e5,RM_N=34;
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],MONL=["January","February","March","April","May","June","July","August","September","October","November","December"];
const doy=d=>{const D=new Date(d);return(d-Date.UTC(D.getUTCFullYear(),0,1))/864e5};
function dayLen(d,lat){const dec=23.44*Math.sin(2*Math.PI*(doy(d)-81)/365)*Math.PI/180,x=-Math.tan(lat*Math.PI/180)*Math.tan(dec);return 24/Math.PI*Math.acos(clamp(x,-1,1))}
const RAMADAN={tours:["festivals"],title:"Sun, Moon or both",globe:false,
 tip:"Slide through the years: watch Ramadan move round the calendar while Christmas stays put.",
 card(L){const R=60,cx=80,cy=74;let s='<svg class="rvy-yr" viewBox="0 0 160 148" role="img" aria-label="The year as a ring of months">';
  s+='<circle class="rvy-yrr" cx="'+cx+'" cy="'+cy+'" r="'+R+'"/>';
  const ang=f=>2*Math.PI*f-Math.PI/2,pt=(f,r)=>[cx+r*Math.cos(ang(f)),cy+r*Math.sin(ang(f))];
  const arc=(f0,f1,r)=>{const a=pt(f0,r),b=pt(f1,r),big=(f1-f0)>.5?1:0;return"M"+a[0].toFixed(1)+" "+a[1].toFixed(1)+"A"+r+" "+r+" 0 "+big+" 1 "+b[0].toFixed(1)+" "+b[1].toFixed(1)};
  /* seasons in the north, as a pale inner ring */
  [[.97,.22,"rvy-win"],[.22,.47,"rvy-spr"],[.47,.72,"rvy-sum"],[.72,.97,"rvy-aut"]].forEach(q=>{s+='<path class="'+q[2]+'" d="'+(q[0]>q[1]?arc(q[0],1,R-14)+arc(0,q[1],R-14).replace(/^M/,"L"):arc(q[0],q[1],R-14))+'"/>'});
  for(let m=0;m<12;m++){const a=pt(m/12,R-2),b=pt(m/12,R+2),t=pt((m+.5)/12,R+9);s+='<line class="rvy-yrt" x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'"/><text class="rvy-yrm" x="'+t[0].toFixed(1)+'" y="'+(t[1]+3).toFixed(1)+'" text-anchor="middle">'+MON[m][0]+'</text>'}
  const yf=(m,d)=>(Date.UTC(2026,m,d)-Date.UTC(2026,0,1))/(365*864e5);
  s+='<path class="rvy-lny" d="'+arc(yf(0,21),yf(1,20),R)+'"/>';
  const xm=pt(yf(11,25),R);s+='<circle class="rvy-xmas" cx="'+xm[0].toFixed(1)+'" cy="'+xm[1].toFixed(1)+'" r="5"/>';
  s+='<path class="rvy-ram" d=""/><text class="rvy-yrc" x="'+cx+'" y="'+(cy-4)+'" text-anchor="middle"></text><text class="rvy-yrd" x="'+cx+'" y="'+(cy+12)+'" text-anchor="middle"></text></svg>';
  L.arc=arc;L.yf0=Date.UTC(2026,0,1);
  return'<div class="rvy-yrw">'+s+'<div class="rvy-yrk"><span><i class="rvy-k1"></i>Ramadan (Moon)</span><span><i class="rvy-k2"></i>Christmas (Sun)</span><span><i class="rvy-k3"></i>Lunar New Year (both)</span><span><i class="rvy-k4"></i>Summer in the north</span></div></div>'+
  '<div class="rvy-row"><input type="range" class="rvy-rng" min="0" max="'+RM_N+'" value="0" aria-label="Year"><b class="rvy-val"></b></div>'},
 wire(L){const c=L.card,rg=c.querySelector(".rvy-rng");L.k=0;L.seen=new Set([0]);rg.oninput=()=>{L.k=+rg.value;L.seen.add(L.k);this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const t0=RM0+L.k*RM_LY,t1=t0+29.5*864e5,D=new Date(t0),y=D.getUTCFullYear();
  const f=t=>{const d=new Date(t),y0=Date.UTC(d.getUTCFullYear(),0,1);return(t-y0)/(Date.UTC(d.getUTCFullYear()+1,0,1)-y0)};
  let a=f(t0),b=f(t1);const p=c.querySelector(".rvy-ram");
  p.setAttribute("d",b>a?L.arc(a,b,60):L.arc(a,1,60)+L.arc(0,b,60).replace(/^M/,"M"));
  c.querySelector(".rvy-yrc").textContent=y;c.querySelector(".rvy-yrd").textContent="starts ~"+D.getUTCDate()+" "+MON[D.getUTCMonth()];
  c.querySelector(".rvy-val").textContent=y;
  const mid=t0+15*864e5,h=dayLen(mid,51.5),m=new Date(mid).getUTCMonth(),sea=[0,1,11].includes(m)?"winter":[2,3,4].includes(m)?"spring":[5,6,7].includes(m)?"summer":"autumn";
  const two=new Date(t0+RM_LY).getUTCFullYear()===y?" And another Ramadan begins before "+y+" is out!":"";
  const hh=Math.floor(h),mm=Math.round((h-hh)*60);
  const head="Ramadan "+y+": from about "+D.getUTCDate()+" "+MONL[D.getUTCMonth()];
  let txt="That is "+sea+" in the north. In London the Sun is up for about "+hh+" h "+(mm<10?"0":"")+mm+" min a day in the middle of the month, so the fast lasts at least that long."+two;
  if(L.k===0)txt="Ramadan comes about 11 days earlier every year. Slide on: when will it fall in midsummer, with the longest fasts?";
  else if(L.seen.size>=RM_N-2||L.k===RM_N)txt+=" In "+(RM_N-1)+" years or so Ramadan goes right round the seasons, while Christmas never moves.";
  say(L,head,txt)}};

/* ---- Harvest moons and Thanksgiving: turn the globe to each harvest festival (all from the stop's own text) */
const HARVEST=TURNER({tours:["festivals"],title:"Harvest moons and Thanksgiving",tip:"Harvests come at different times round the world. Turn the globe to each festival.",
 intro:"Pick a festival to fly there.",
 places:[["Plymouth, US",-70.66,41.96,2.2,"The fourth Thursday of November: remembering the harvest feast of 1621, shared by English settlers and the Wampanoag people."],
  ["Canada",-75.7,45.42,1.8,"The second Monday of October: further north, the harvest is earlier."],
  ["Accra",-0.19,5.6,2.4,"Homowo, ‘hooting at hunger’: the harvest festival of the Ga people."],
  ["Tamil Nadu",78.7,11.1,2.2,"Pongal, in January: the harvest festival of South India’s Tamil people."],
  ["China",116.4,39.9,1.8,"The Mid-Autumn Festival, on the full moon of the eighth lunar month: mooncakes and lanterns."],
  ["Seoul",126.98,37.57,2.4,"Chuseok, on the same full moon: families visit their ancestral homes."]]});

/* ---- Review on the last stop: does the Sun, the Moon or both set each festival's date? From the tour's own text:
   Christmas (25 December), Thanksgiving and Nowruz (the March equinox) and Inti Raymi (24 June, the solstice) follow
   the Sun; the Islamic calendar, and so both Eids, the Moon alone; Lunar New Year, Diwali, Chuseok (the eighth lunar
   month of a lunisolar calendar) and Easter (the first Sunday after the first full moon on or after 21 March) both. */
const SUNMOON=CLASSIFY({tours:["festivals"],title:"Now explore",turns:true,below:true,
 tip:"Review: what sets each festival’s date? Each answer turns the globe there.",ask:"The Sun, the Moon, or both?",
 kinds:[["sun","The Sun","the Sun"],["moon","The Moon","the Moon"],["both","Both","both the Sun and the Moon"]],
 items:[["Christmas","sun","25 December in the solar calendar, every year: so in Australia it always comes in midsummer.",[35.2,31.7,2.2]],
  ["Lunar New Year","both","The second new moon after the winter solstice: the Moon picks the day, the Sun the season.",[116.4,39.9,2]],
  ["Eid al-Fitr, the end of Ramadan","moon","The Islamic calendar follows the Moon alone, so Eid comes about 11 days earlier each year.",[106.83,-6.17,2.2]],
  ["Easter","both","The first Sunday after the first full moon on or after 21 March: the equinox and the Moon together.",[35.23,31.78,2.2]],
  ["Nowruz","sun","It begins at the exact moment of the March equinox.",[51.39,35.69,2.2]],
  ["Inti Raymi","sun","24 June, just after the June solstice, when the Sun is lowest in the southern sky.",[-71.97,-13.52,2.2]],
  ["Eid al-Adha, during the Hajj","moon","Like all Islamic festivals, it moves right round the seasons in about 33 years.",[39.83,21.42,2.2]],
  ["Diwali","both","The new moon of the month of Kartik, in a calendar that adds an extra month to keep step with the Sun: always October or November.",[82.2,26.8,2.2]],
  ["Thanksgiving in the US","sun","The fourth Thursday of November, by the solar calendar.",[-70.66,41.96,2.2]],
  ["Chuseok","both","The full moon of the eighth lunar month, in a calendar kept in step with the Sun.",[126.98,37.57,2.2]]],
 end:(r,N)=>"Festivals that follow the Sun keep their season; those that follow the Moon alone move through the year; lunisolar ones wander by a few weeks but stay in their season."});

/* ---------------- guess first (geoflock-tourplay.js veils the headline and asks for an estimate) ----------------
   Kumbh Mela: "more than 660 million (66 crores) people had taken a dip in the river" by 26 February, over the 45 days
   from 13 January to 26 February 2025 (Wikipedia, "2025 Prayag Maha Kumbh Mela"; The Economist doubted the official
   figures). The stop's headline says "over 600 million visits in six weeks"; its other text gives no number. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const GS={"festivals|The biggest crowd on Earth":{q:"How many dips in the river did officials count at the 2025 Kumbh Mela, in six weeks?",min:0,max:1500,ans:660,unit:"million",step:10,show:"about 660 million, by the official count from 13 January to 26 February 2025: more than the population of the whole European Union"}/*@@GS@@*/};
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}
{const s=document.createElement("style");s.textContent=`
.rvy-yrw{display:flex;gap:10px;align-items:center}.rvy-yr{flex:0 0 150px;width:150px;height:auto}
.rvy-yrr{fill:#fff;stroke:rgba(19,41,75,.18);stroke-width:1}.rvy-yrt{stroke:#8a98a8;stroke-width:1}.rvy-yrm{font:800 8.5px system-ui,sans-serif;fill:#5b6b7c}
.rvy-win,.rvy-spr,.rvy-aut{fill:none;stroke:transparent}.rvy-sum{fill:none;stroke:rgba(255,193,7,.45);stroke-width:7}
.rvy-lny{fill:none;stroke:#c2364f;stroke-width:6;stroke-linecap:round;opacity:.75}.rvy-xmas{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvy-ram{fill:none;stroke:#1f8a4c;stroke-width:10;stroke-linecap:round;transition:d .3s}
.rvy-yrc{font:800 17px system-ui,sans-serif;fill:#13294b}.rvy-yrd{font:700 9.5px system-ui,sans-serif;fill:#5b6b7c}
.rvy-yrk{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:700;color:#5b6b7c}.rvy-yrk i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px}
.rvy-k1{background:#1f8a4c}.rvy-k2{background:#2a78d0}.rvy-k3{background:#c2364f}.rvy-k4{background:rgba(255,193,7,.6)}
:is(body.dark-theme,body.sky-night) .rvy-yrr{fill:rgba(255,255,255,.06);stroke:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvy-yrc{fill:#fff}:is(body.dark-theme,body.sky-night) .rvy-yrm,:is(body.dark-theme,body.sky-night) .rvy-yrd{fill:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvy-yrk{color:#aab6c8}:is(body.dark-theme,body.sky-night) .rvy-ram{stroke:#4cc27f}
`;document.head.appendChild(s)}

const DEFS=[RAMADAN,HARVEST,SUNMOON];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvy-layer rvy-layer";el.innerHTML='<svg class="rvy-sv"><defs><clipPath id="rvyDisc"><path class="rvy-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvyDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvy-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvy-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvy-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvy-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvy-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvy-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");
 /* a review game (D.below) goes after the stop's text, so it is read first */
 const bd=D.below&&ps.card.querySelector(".ps-body");if(bd&&bd.parentNode===at0.parentNode){const mo=bd.nextElementSibling;(mo&&mo.matches("details.ps-more")?mo:bd).after(c)}else(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty||L.anim){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvy-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

/* ======================================================================== part 3: the map's banner
   The banner at the top of the globe ("System of government") is centred, and on the Politics map it touched the map
   key in the top right corner (copied from geoflock-polish-rvl.js, where People map banners ran under it). On these tours it is slid left until it clears the
   key (never under the card), and put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;const k=document.querySelector(".ps-mapkey.at-right");b.style.translate="";bannerMoved=null;if(!k||!k.offsetWidth)return;
 const B=b.getBoundingClientRect(),K=k.getBoundingClientRect();if(!(B.right>K.left-8&&B.bottom>K.top&&B.top<K.bottom))return;
 let dx=K.left-8-B.right;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

{const s=document.createElement("style");s.textContent=`
.rvy-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvy-sv{position:absolute;left:0;top:0;overflow:visible}
.rvy-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvy-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvy-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvy-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvy-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvy-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvy-btn[hidden]{display:none}
.rvy-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvy-ep b{display:block;font-size:15px}
.rvy-ep.rvy-new{animation:rvyIn .45s ease}@keyframes rvyIn{from{opacity:.2;transform:translateY(4px)}}
.rvy-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvy-sortq i{font-style:normal}
.rvy-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvy}
.rvy-rank li{position:relative;counter-increment:rvy;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvy-rank li::before{content:counter(rvy);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvy-rank li.rvy-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvy-rank li.rvy-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvy-nm{flex:1 1 auto;z-index:1}.rvy-v{z-index:1;font-weight:800;white-space:nowrap}
.rvy-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvy-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvy-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvy-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvy-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvy-do,:is(body.dark-theme,body.sky-night) .rvy-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvy-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvy-btn,:is(body.dark-theme,body.sky-night) .rvy-chip,:is(body.dark-theme,body.sky-night) .rvy-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvy-rank li.rvy-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvy-rank li.rvy-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvy-bar{background:rgba(255,178,122,.2)}
.rvy-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvy-rng{flex:1 1 auto;accent-color:#d9682b}.rvy-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvy-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvy-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvy-item{font-size:16px;color:#13294b}
.rvy-bins{display:flex;gap:6px;flex-wrap:wrap}.rvy-bins .rvy-btn[hidden]{display:none}.rvy-bin:disabled{cursor:default;opacity:.55}
.rvy-btn.rvy-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvy-btn.rvy-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvy-dots{display:flex;gap:4px;margin-top:8px}.rvy-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvy-dots i.rvy-now{box-shadow:0 0 0 2px #d9682b inset}.rvy-dots i.rvy-y{background:#1f8a4c}.rvy-dots i.rvy-x{background:#c2364f}
.rvy-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvy-sl .rvy-row{margin-top:2px}.rvy-sl .rvy-val{min-width:36px}
.rvy-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvy-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvy-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvy-out b{font-size:15px;color:#9a4a16}
.rvy-ch{display:block;width:100%;height:auto;margin-top:6px}.rvy-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvy-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvy-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvy-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvy-val,:is(body.dark-theme,body.sky-night) .rvy-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvy-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvy-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvy-n,:is(body.dark-theme,body.sky-night) .rvy-sl label,:is(body.dark-theme,body.sky-night) .rvy-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvy-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvy-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvy-dots i{background:rgba(255,255,255,.18)}
.rvy-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvy-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvy-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvy-dd circle.rvy-near{fill:#d9682b;opacity:1}
.rvy-pump{cursor:pointer;outline:none}.rvy-pump .rvy-hit{fill:transparent}.rvy-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvy-pump:hover rect,.rvy-pump:focus rect{fill:#13294b}.rvy-pump.rvy-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvy-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvy-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvy-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvy-kd{background:#2a2f3a}.rvy-kp{background:#2a78d0;border-radius:2px!important}.rvy-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvy-key2{color:#aab6c8}
.rvy-btn.rvy-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvy-btn.rvy-cur{background:#9fc3ff;color:#13294b}
.rvy-band{fill:rgba(217,104,43,.1)}.rvy-area{fill:rgba(42,120,208,.22);stroke:#2a78d0;stroke-width:1.5;stroke-linejoin:round}.rvy-dashed{fill:none;stroke:#8a98a8;stroke-dasharray:3 3}
line.rvy-now{stroke:#d9682b;stroke-width:1.5}.rvy-dot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
:is(body.dark-theme,body.sky-night) .rvy-area{fill:rgba(159,195,255,.22);stroke:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvy-band{fill:rgba(255,178,122,.12)}
:is(body.dark-theme,body.sky-night) .rvy-btn.rvy-good{background:#1f8a4c;border-color:#4cc27f;color:#fff}:is(body.dark-theme,body.sky-night) .rvy-btn.rvy-bad{background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvy-dots i.rvy-y{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvy-dots i.rvy-x{background:#ff7088}:is(body.dark-theme,body.sky-night) .rvy-dots i.rvy-now{box-shadow:0 0 0 2px #ffb27a inset}
.rvy-ring{fill:rgba(255,209,102,.3);stroke:#d9682b;stroke-width:3}
.rvy-race{display:flex;flex-direction:column;gap:6px;margin:4px 0}
.rvy-lane{display:grid;grid-template-columns:1fr auto;align-items:end;column-gap:8px;row-gap:3px;font-size:13px;font-weight:800;color:#13294b}
.rvy-lane span{line-height:1.1}.rvy-lane small{display:inline;margin-left:5px;font-size:10.5px;font-weight:700;color:#5b6b7c}
.rvy-rb{display:block;height:14px;border-radius:7px;background:#d9682b;transition:width .7s ease;grid-column:1/-1;grid-row:2;justify-self:start}
.rvy-stl,.rvy-b1{background:#2a78d0}.rvy-num{font-size:13px;color:#13294b;min-width:72px;text-align:right}
.rvy-src{font-size:11px;color:#5b6b7c;margin-top:4px}
.rvy-atl{fill:rgba(217,104,43,.25);stroke:#d9682b;stroke-width:2}.rvy-bcn{fill:rgba(42,120,208,.35);stroke:#2a78d0;stroke-width:2}
.rvy-cmp[hidden]{display:none}
:is(body.dark-theme,body.sky-night) .rvy-lane,:is(body.dark-theme,body.sky-night) .rvy-num{color:#fff}
:is(body.dark-theme,body.sky-night) .rvy-lane small,:is(body.dark-theme,body.sky-night) .rvy-src{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvy-stl,:is(body.dark-theme,body.sky-night) .rvy-b1{background:#6fa8ff}
.rvy-road{fill:#9aa3ad}.rvy-blk{fill:#e8c9a0;stroke:#b08a5a;stroke-width:1}.rvy-in{fill:#9aa3ad;transition:fill .6s}.rvy-car{fill:#c2364f;transition:opacity .5s}
.rvy-trees{opacity:0;transition:opacity .6s}.rvy-tree{fill:#2f9e5b}
.rvy-sb.rvy-on .rvy-in{fill:#bfe3b4}.rvy-sb.rvy-on .rvy-trees{opacity:1}.rvy-sb.rvy-on .rvy-cin{opacity:0}
.rvy-sbk .rvy-car,.rvy-sbk .rvy-tree{opacity:1}
:is(body.dark-theme,body.sky-night) .rvy-road,:is(body.dark-theme,body.sky-night) .rvy-in{fill:#5b6573}:is(body.dark-theme,body.sky-night) .rvy-sb.rvy-on .rvy-in{fill:#3f7a4f}
.rvy-ship{fill:#fff;stroke:#13294b;stroke-width:3}.rvy-arrow{fill:none;stroke:#d9682b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
:is(body.dark-theme,body.sky-night) .rvy-ship{stroke:#9fc3ff}
/* while a guess-first question hides a stop's headline, the measuring ruler's distance label (index.html's .psc-lab)
   is hidden too: on the Andes and Mammoth Cave stops it showed the very answer being guessed */
body:has(.ps-card.tp-veil) .psc-lab{visibility:hidden}
`;document.head.appendChild(s)}


window.gfPolishRvy={v:1,FIX,viewOf,tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
