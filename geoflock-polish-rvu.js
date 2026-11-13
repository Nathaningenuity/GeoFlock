/* GeoFlock polish RV-U: a stop-by-stop review of four Ideas and culture tours, Music of the world (music), Literature
   (literature), Philosophy (philosophy) and Sports (sports), each looked at on the globe, their default mode, at
   1280×860.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left.
   2. Stops you can play with (listed in DEFS at the end of part 2).
   Built on geoflock-polish-rvr.js (its helpers and engine, under "rvu" names so the files never touch each other's
   controls), with geoflock-polish-rvq.js's psGlobeTarget wrapper: a stop framed here gets exactly its frame.
   geoflock-sweep-tours*.js re-set framing on every psGo, so the fixed fields are fixed, non-configurable getters whose
   setters are ignored; a field already non-configurable is left alone. Pin lists are filtered through getters (never
   frozen), and a stop's photo pins wait for geoflock-portraits.js's portraits before they are edited. CSS classes start
   with "rvu-". Everything is wrapped in try/catch; Next and Back are never blocked. */

(function(){
"use strict";
if(window.gfPolishRvu)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvuTest or ?rvutest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvuTest||/[?&]rvutest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* Pin lists are filtered, not frozen: the shared photo pass (geoflock-stopphotos.js, -pinfix.js) turns text pins into
   photo pins at its own times after load, so a list copied once would keep or lose pins depending on timing. XF puts
   a getter on the field that applies this file's edits to whatever the field holds; other files' writes still go
   through (to the value underneath). Each edit has an id, so applying the fixes again does not stack them. */
const XFS=new WeakMap();
let PEND=false;
const PPW=new WeakMap();/* (it waits at most about 20 s) */
const pplPending=S=>{try{const t=ps&&ps.tour,n=strip(S.title);if(!(window.GF_PORTRAITS||[]).some(p=>p.tour===t&&p.stop===n)||Object.prototype.hasOwnProperty.call(S,"_gfPpl"))return false;
 const w=(PPW.get(S)||0)+1;PPW.set(S,w);return w<70}catch(e){return false}};
const XF=(S,k,id,fn)=>{try{if(k==="phPins"&&!(XFS.get(S)||{})[k]&&pplPending(S)){PEND=true;return}let R=XFS.get(S);if(!R){R={};XFS.set(S,R)}
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;const B={v:S[k],fns:{}};R[k]=B;
  Object.defineProperty(S,k,{configurable:!!(window.__rvuTest||/[?&]rvutest\b/.test(location.search)),enumerable:true,
   get:()=>{const pk=k==="phPins"?pplReady(S):0;if(B.out&&B.at===B.v&&B.atN===B.n&&B.pk===pk)return sync(S,k,B.out);let v=Array.isArray(B.v)?B.v.slice():(B.v||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}
    if(pk)v=pplAdd(S,v);B.out=v;B.at=B.v;B.atN=B.n;B.pk=pk;return sync(S,k,v)},set:x=>{B.v=x}})}
 R[k].fns[id]=fn;R[k].n=(R[k].n||0)+1}catch(e){}};
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
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvu)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvu,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvu=1;window.psGlobeTarget=w}catch(e){}})(0);
/* rename a photo pin's label */
const PHLABEL=(S,re,txt)=>XF(S,"phPins","phl"+re,P=>P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p));
/* add an "area" label (left out of the stop's framing) */
const ADDAREA=(S,ll,txt)=>ADDPIN(S,[[ll],txt,"area"]);

const FIX={};
FIX.music={
  /* the Steelpan photo's point lay under the card, Seoul's round the back of the globe and Buenos Aires's and Rio's
     hung off the globe's bottom edge, their labels under the bottom bar: each has a stop of its own */
  "Music of the world":S=>{DROPPH(S,/^(Steelpan|Gangnam|Tango|Carnival)/);VIEW(S,[20,15,1])},
  /* "Rock paintings in the region show it being played at least 1,000 years ago" turned the evidence round: Wikipedia,
     "Didgeridoo" (History): "There is currently no consensus on the exact age of the didgeridoo", and studies of the
     rock art suggest it has been used "for less than 1,000 years, based on the dating of rock art paintings" */
  "The didgeridoo":S=>RE(S,"more","Rock paintings in the region show it being played at least 1,000 years ago.","Rock paintings in the region show it being played, but no one knows how old it is: the dates of the paintings suggest less than 1,000 years."),
  /* Vienna itself (the arrows' end) and the Salzburg photo were on the globe's right edge, "Habsburg lands" cut off (further out and east) */
  "Vienna, city of music":S=>VIEW(S,[14.2,48.6,4.6]),
  /* Clarksdale's label ran under the map key (the label is placed clear of the ruler's end and the Beale Street photo, far to the
     right): shortened */
  "Down the Mississippi: blues and jazz":S=>{VIEW(S,[-84,37,3]);RENAME(S,/^Clarksdale/,"Clarksdale: blues")},
  /* the "Argentina" label's line ran under the card (the map names Argentina already) */
  "Tango in Buenos Aires":S=>DROP(S,/^Argentina$/),
  /* Luanda, one end of the 5,660 km ruler, was off the globe's edge under the map key: framed on both coasts */
  "Samba and bossa nova":S=>VIEW(S,[-10,-10,1.2]),
  /* "Puerto Rico: reggaeton" ran under the map key */
  "Reggae in Kingston":S=>VIEW(S,[-70,21,1.79]),
  /* the "Mongolia" label was off the globe's edge under the map key (Mongolia is outlined) */
  "Singing two notes at once":S=>DROP(S,/^Mongolia$/),
  /* Varanasi's label ran under the map key and the sitar photo sat on the zoom buttons; the plain "India" label went.
     And Harrison did not learn the sitar from Shankar before 'Norwegian Wood': Wikipedia, "Norwegian Wood (This Bird Has
     Flown)": the sitar part was recorded in October 1965; "In June 1966, Harrison met Shankar in London and became a
     student under the master sitarist" */
  "India: sitar and film songs":S=>{VIEW(S,[87,22,2.5]);DROP(S,/^India$/);
    RE(S,"body","Ravi Shankar played it to the world, and George Harrison of the Beatles learned it from him and used it on ‘Norwegian Wood’ in 1965.","Ravi Shankar played it to the world. George Harrison of the Beatles played one on ‘Norwegian Wood’ in 1965, and in 1966 became Shankar’s student.")}
};
FIX.literature={
  /* Cartagena's photo lay under the card and Kyoto's round the back of the globe (both have stops of their own) */
  "Literature around the world":S=>{DROPPH(S,/^(Cartagena|Kyoto)/);VIEW(S,[40,30,1])},
  /* "Scylla and Charybdis" and "Ithaca: home" ran under the map key and the Troy photos crowded the zoom buttons:
     turned east a little and north up (the stop's own voyage game is left as it is) */
  "Homer’s Troy and Ithaca":S=>VIEW(S,[22.5,36.5,3.2]),
  /* the Kurukshetra photo covered the ruler's distance: closer in */
  "The Mahabharata and the Ramayana":S=>VIEW(S,[80,18,2.2]),
  /* "Saudi Arabia" repeated the Najd label beside it */
  "Weeping at the campsite":S=>DROP(S,/^Saudi Arabia$/),
  /* the Abbasid empire's label ran off the globe's right edge */
  "One Thousand and One Nights":S=>VIEW(S,[39,34,1.45]),
  /* the plain "Iceland" label repeated the map's own */
  "Sagas by the fireside":S=>DROP(S,/^Iceland$/),
  /* the Stratford photo was labelled just "Shakespeare", beside his portrait in London. And Hamlet, Macbeth and King
     Lear were not all "first played" at the Globe: King Lear's first recorded performance was before James I at
     Whitehall on 26 December 1606 (Wikipedia, "King Lear", Date and text); Wikipedia's "Globe Theatre" names Julius
     Caesar (1599) as the likely first production there */
  "Shakespeare’s London":S=>{PHLABEL(S,/^Stratford/,"Stratford-upon-Avon");
    RE(S,"body","where Hamlet, Macbeth and King Lear were first played.","where Julius Caesar was played that first autumn, and Hamlet, Macbeth and King Lear soon after.")},
  /* the plain "Japan" label sat on the dashed route */
  "Bashō’s narrow road":S=>DROP(S,/^Japan$/),
  /* the "Russia" label's line ran off to the globe's edge */
  "The great Russian novels":S=>DROP(S,/^Russia$/),
  /* Wikipedia, "Things Fall Apart": "translated into over fifty languages" (and the Achebe obituaries: more than 20
     million copies, more than 50 languages) */
  "Things Fall Apart":S=>RE(S,"stat","translated into some 60 languages","translated into more than 50 languages"),
  /* Tagore's and Mahfouz's photos were under the map key (once Europe was framed) and Han Kang's off the globe's top edge, by the search box: the buttons in
     part 2 turn the globe to each winner instead */
  "The Nobel map":S=>{DROPPH(S,/^(Tagore|Han Kang|Mahfouz)/);VIEW(S,[24,50,1.4])}
};FIX.philosophy={};FIX.sports={};

const applied=new WeakSet();
/* a stop whose photo pins this file edits, and to which geoflock-portraits.js adds a portrait, waits until the portrait
   is in (see XF): if this file locked the field first, the portrait could not be added */
let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;TOUR_OF.set(S,tour);
 PEND=false;try{f(S)}catch(e){console.error("rvu fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey&&!waiting)return;lastKey=k;waiting=false;applyTo(t,psSteps());/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f){TOUR_OF.set(S,t);f(S)}}catch(e){}}catch(e){}},300);
/* applied only once one of these tours is open (by then the load-time photo passes have run): see above */

/* The card shift, kept (as geoflock-polish-rvb.js and -rvf.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for four seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["music","literature","philosophy","sports"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".ihx-ctl[data-turns],.gh2-ctl[data-turns],.rvm-ctl[data-turns],.rvu-ctl[data-turns]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* every stop of these tours keeps its card on the left (only the side is locked at load; a tour question could flip it
   to the right, over the map key and the place the stop is about) */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);
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
function tag(L,cls){const d=document.createElement("div");d.className="rvu-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvu-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvu-new");void e.offsetWidth;e.classList.add("rvu-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvu-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvu-rank"></ol><div class="rvu-pool"></div>'+
  '<div class="rvu-btns"><button type="button" class="rvu-btn rvu-undo">Undo</button><button type="button" class="rvu-btn rvu-show">Show me</button><button type="button" class="rvu-btn rvu-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvu-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvu-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvu-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvu-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvu-ok":"rvu-no"):"")+'"><span class="rvu-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvu-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvu-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvu-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvu-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvu-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvu-show").hidden=L.shown;c.querySelector(".rvu-again").hidden=!L.shown;
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
 card(L){return'<div class="rvu-btns rvu-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvu-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvu-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvu-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvu-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvu-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvu-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvu-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
function GUESS(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvu-gq"><input type="range" class="rvu-rng" min="'+cfg.min+'" max="'+cfg.max+'" step="'+cfg.step+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rvu-gv"></b></div>'+
  '<div class="rvu-btns"><button type="button" class="rvu-btn rvu-chk">Check my guess</button><button type="button" class="rvu-btn rvu-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvu-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvu-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rvu-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvu-rng");r.disabled=!!L.done;
  c.querySelector(".rvu-gv").textContent=cfg.fmt(L.done?cfg.answer:L.v);
  c.querySelector(".rvu-chk").hidden=!!L.done;c.querySelector(".rvu-again").hidden=!L.done;
  if(L.done){r.value=cfg.answer;const off=Math.abs(L.v-cfg.answer);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(L.v)+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}

/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place; with
   mark, that place is ringed once answered, and named if markTag(item) gives a name} */
const tOf=(cfg,it)=>it&&(it[3]||(cfg.turn&&cfg.turn[it[1]]))||null;
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:!!cfg.mark,turns:!!(cfg.turn||cfg.turnItems),tip:cfg.tip,
 card(L){return'<div class="rvu-q"><span class="rvu-n"></span><b class="rvu-item"></b></div><div class="rvu-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rvu-btn rvu-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rvu-btn rvu-next" hidden>Next →</button><button type="button" class="rvu-btn rvu-again" hidden>Start again</button></div><div class="rvu-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rvu-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its item's own place (item[3]) or its right box's place */{const t=tOf(cfg,cfg.items[L.k]);if(t){c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}}this.render(L)});
  c.querySelector(".rvu-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rvu-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rvu-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rvu-item").textContent=done?"":it[0];
  c.querySelectorAll(".rvu-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rvu-good",L.wait&&i===it[1]);b.classList.toggle("rvu-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rvu-next").hidden=!(L.wait&&!done);c.querySelector(".rvu-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rvu-again").hidden=!done;
  c.querySelectorAll(".rvu-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rvu-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rvu-y":"rvu-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."));L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvu-ctag");const it=cfg.items[L.k],t=L.wait&&it?tOf(cfg,it):null,q=t?proj(L,[t[0],t[1]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvu-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvu-tdot"})}putTag(L,L.tg,q&&cfg.markTag?q:null,q&&cfg.markTag?esc(cfg.markTag(it)):"",14)}}}

/* ======================================================================== 1. What makes the sound? (music, Gamelan)
   The four families of the Hornbostel–Sachs system (Wikipedia, "Hornbostel–Sachs"): idiophones "produce their sounds by
   means of the actual body of the instrument vibrating" (a gong is its example 111.241), membranophones by "a tightly
   stretched membrane", chordophones by strings "stretched between fixed points", aerophones by "vibrating air" (free
   reeds, as in the accordion and the bandoneón, are aerophones, 412.13). Each instrument is one this tour visits; each
   answer turns the globe to its home. */
const BINS_INST=BINS({tours:["music"],title:"Gamelan",turnItems:true,mark:true,markTag:it=>it[4],
 tip:"A gamelan’s gongs ring all over. What makes the sound in each of this tour’s instruments?",ask:"What vibrates to make the sound?",
 bins:["Air blown in","Strings","A drum skin","The whole instrument"],
 items:[["The Hohle Fels flute",0,"Air vibrating inside the bone tube: a wind instrument (an aerophone).",[9.75,48.38,4.5],"Hohle Fels"],
  ["The steelpan",3,"The dented steel itself rings when it is struck, like a bell (an idiophone).",[-61.51,10.66,4.5],"Port of Spain"],
  ["The kora",1,"Its 21 strings are plucked (a chordophone).",[-15.6,13.45,4],"The Gambia"],
  ["The dùndún talking drum",2,"The stretched leather drumskin vibrates; squeezing the cords tightens it (a membranophone).",[3.93,7.85,4],"Oyo"],
  ["The bandoneón",0,"Its bellows push air past metal reeds (an aerophone, like the accordion).",[-58.38,-34.6,4],"Buenos Aires"],
  ["A gamelan gong",3,"The bronze gong itself vibrates when struck (an idiophone).",[110.37,-7.8,3.5],"Yogyakarta"],
  ["The sitar",1,"Its played strings, and the sympathetic strings that ring along (a chordophone).",[83,25.32,2.5],"Varanasi"],
  ["The didgeridoo",0,"The player’s buzzing lips make the air in the hollow trunk vibrate (an aerophone).",[135,-12.5,2],"Arnhem Land"]],
 after:(r,N)=>(r===N?"Every one right. ":"")+"Musicologists sort every instrument in the world into these four families (the Hornbostel–Sachs system), named after what vibrates: air, strings, a skin, or the instrument’s own body."});

/* ======================================================================== 2. Put the music in order (music, Now explore)
   The dates are the tour's own: the Hohle Fels flute over 35,000 years old (Conard et al., Nature 460, 2009: "more than
   35,000 years ago"), tango the 1880s, jazz around 1900, steelpan the 1930s–40s, bossa nova the late 1950s, reggae the
   1960s, Fela Kuti's Afrobeat the 1970s, Gangnam Style 2012. */
const SORT_MUS=SORT({tours:["music"],title:"Now explore",tip:"Put eight of the tour’s sounds in the order they were born.",
 first:"Oldest",last:"Newest",bars:false,
 items:[["The Hohle Fels flute",-35000,"over 35,000 years ago"],["Tango",1880,"1880s"],["Jazz",1900,"about 1900"],["Steelpan",1935,"1930s–40s"],
  ["Bossa nova",1958,"late 1950s"],["Reggae",1965,"1960s"],["Fela Kuti’s Afrobeat",1972,"1970s"],["Gangnam Style",2012,"2012"]],
 after:(r,N)=>"From bone flutes in an Ice Age cave to a video watched a billion times: more than 35,000 years, and every one of these sounds still played today."});

/* ======================================================================== 3. Nobel winners round the globe (literature)
   The stop's own winners, from the Nobel Prize site (nobelprize.org, "All Nobel Prizes in Literature"): Tagore 1913
   (Calcutta), Mahfouz 1988 (Cairo), Walcott 1992 (born in Castries, Saint Lucia), Han Kang 2024 (Seoul), and Anne
   Carson 2026, born in Toronto, "for her bold and inventive oeuvre that, in playful dialogue with the classical
   tradition, has created new forms for contemporary literature" (nobelprize.org, "Nobel Prize in Literature 2026",
   announced 8 October 2026). Tagore's and Han Kang's photos fell under the map key and off the globe's top edge. */
const TURN_NOBEL=TURNER({tours:["literature"],mark:true,title:"The Nobel map",tip:"Winners come from all over the globe. Turn it from Stockholm to each one.",
 places:[["Stockholm",18.07,59.33,1.4,"The prizes are handed out here every 10 December, the day Alfred Nobel died.",1],
  ["Kolkata: Tagore, 1913",88.36,22.57,2,"Rabindranath Tagore, poet of Bengal, was the first winner from outside Europe. He wrote the national anthems of both India and Bangladesh."],
  ["Cairo: Mahfouz, 1988",31.24,30.04,2.5,"Naguib Mahfouz set his novels in the streets of old Cairo; he was the first winner writing in Arabic.",1],
  ["Saint Lucia: Walcott, 1992",-60.99,14.01,3,"Derek Walcott, born in Castries, retold Homer in the Caribbean in his long poem Omeros. With the economist Arthur Lewis, Saint Lucia has two Nobel winners for about 180,000 people."],
  ["Seoul: Han Kang, 2024",126.98,37.57,2.5,"Han Kang was the first winner from South Korea."],
  ["Toronto: Anne Carson, 2026",-79.38,43.65,2.5,"The newest winner, a poet born in Toronto who translates ancient Greek: the prize praised her “playful dialogue with the classical tradition”."]]});

/* ======================================================================== 4. Which season? (literature, Bashō)
   Season words (kigo), from Wikipedia, "Kigo": the frog "is a kigo for spring" (in Bashō's old-pond haiku), "the moon
   (tsuki) is an autumn kigo", cherry blossoms "a common spring kigo"; rainy season and fireworks are among its summer
   examples. Red maple leaves (momiji) and snow are the stop's own autumn and winter words. */
const BINS_KIGO=BINS({tours:["literature"],title:"Bashō’s narrow road",tip:"Every haiku names its season. Which season does each word stand for?",ask:"Spring, summer, autumn or winter?",
 bins:["Spring","Summer","Autumn","Winter"],
 items:[["A frog",0,"Frogs sing in spring: Bashō’s old-pond haiku, with its jumping frog, is a spring poem."],
  ["The moon",2,"Just “the moon”, with no season given, always means the bright, clear moon of autumn."],
  ["The rainy season",1,"Tsuyu, the plum rains, falls in early summer, in June and July."],
  ["Snow",3,"A winter word, of course."],
  ["Cherry blossom",0,"Japan’s best-known spring word: people picnic under the blossom."],
  ["Fireworks",1,"Japan’s big firework displays are held on summer nights."],
  ["Red maple leaves",2,"Momiji: the maples turn red in autumn."]],
 after:(r,N)=>"Poets keep almanacs (saijiki) with thousands of season words, so a single word sets the whole scene of a three-line poem."});

/* ======================================================================== 5. Put the stories in order (literature, Now explore)
   The tour's own dates: Gilgamesh poems from about 2100 BC, Homer perhaps around 700 BC, Imru' al-Qais in the 500s AD,
   Genji around 1008, the Divine Comedy about 1308–1321, Don Quixote 1605, Crime and Punishment 1866, Things Fall Apart
   1958. */
const SORT_LIT=SORT({tours:["literature"],title:"Now explore",tip:"Put eight of the tour’s stories in the order they were written.",
 first:"Oldest",last:"Newest",bars:false,
 items:[["The Epic of Gilgamesh",-2100,"from about 2100 BC"],["Homer’s Odyssey",-700,"perhaps about 700 BC"],["Imru’ al-Qais’s ode",550,"500s AD"],
  ["The Tale of Genji",1008,"about 1008"],["Dante’s Divine Comedy",1315,"about 1308–1321"],["Don Quixote",1605,"1605"],
  ["Crime and Punishment",1866,"1866"],["Things Fall Apart",1958,"1958"]],
 after:(r,N)=>"About 4,000 years from Gilgamesh’s clay tablets to Achebe’s novel, and all eight are still read today."});

const DEFS=[BINS_INST,SORT_MUS,TURN_NOBEL,BINS_KIGO,SORT_LIT];

let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvu-layer rvu-layer";el.innerHTML='<svg class="rvu-sv"><defs><clipPath id="rvuDisc"><path class="rvu-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvuDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvu-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvu-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvu-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvu-ctl";
 c.innerHTML='<div class="rvu-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvu-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvu-ctl"))unmount()}catch(e){}},300);
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
.rvu-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvu-sv{position:absolute;left:0;top:0;overflow:visible}
.rvu-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvu-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvu-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvu-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvu-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvu-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvu-btn[hidden]{display:none}
.rvu-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvu-ep b{display:block;font-size:15px}
.rvu-ep.rvu-new{animation:rvuIn .45s ease}@keyframes rvuIn{from{opacity:.2;transform:translateY(4px)}}
.rvu-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvu-sortq i{font-style:normal}
.rvu-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvu}
.rvu-rank li{position:relative;counter-increment:rvu;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvu-rank li::before{content:counter(rvu);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvu-rank li.rvu-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvu-rank li.rvu-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvu-nm{flex:1 1 auto;z-index:1}.rvu-v{z-index:1;font-weight:800;white-space:nowrap}
.rvu-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvu-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvu-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvu-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvu-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvu-do,:is(body.dark-theme,body.sky-night) .rvu-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvu-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvu-btn,:is(body.dark-theme,body.sky-night) .rvu-chip,:is(body.dark-theme,body.sky-night) .rvu-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvu-rank li.rvu-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvu-rank li.rvu-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvu-bar{background:rgba(255,178,122,.2)}
.rvu-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvu-rng{flex:1 1 auto;accent-color:#d9682b}.rvu-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvu-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvu-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvu-item{font-size:16px;color:#13294b}
.rvu-bins{display:flex;gap:6px;flex-wrap:wrap}.rvu-bins .rvu-btn[hidden]{display:none}.rvu-bin:disabled{cursor:default;opacity:.55}
.rvu-btn.rvu-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvu-btn.rvu-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvu-dots{display:flex;gap:4px;margin-top:8px}.rvu-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvu-dots i.rvu-now{box-shadow:0 0 0 2px #d9682b inset}.rvu-dots i.rvu-y{background:#1f8a4c}.rvu-dots i.rvu-x{background:#c2364f}
.rvu-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvu-sl .rvu-row{margin-top:2px}.rvu-sl .rvu-val{min-width:36px}
.rvu-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvu-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvu-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvu-out b{font-size:15px;color:#9a4a16}
.rvu-ch{display:block;width:100%;height:auto;margin-top:6px}.rvu-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvu-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvu-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvu-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvu-val,:is(body.dark-theme,body.sky-night) .rvu-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvu-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvu-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvu-n,:is(body.dark-theme,body.sky-night) .rvu-sl label,:is(body.dark-theme,body.sky-night) .rvu-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvu-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvu-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvu-dots i{background:rgba(255,255,255,.18)}
.rvu-btn.rvu-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvu-btn.rvu-cur{background:#9fc3ff;color:#13294b}
.rvu-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rvu-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rvu-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rvu-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvu-ep b .rvu-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rvu-ep b .rvu-km{color:#ffb27a}
.rvu-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rvu-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rvu-small{font-size:11.5px!important;padding:2px 7px!important}
.rvu-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rvu-gq .rvu-rng{flex:1 1 auto}.rvu-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rvu-julh{fill:#c2364f}.rvu-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rvu-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rvu-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rvu-gv{color:#ffb27a}
.rvu-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rvu-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rvu-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rvu-tring{fill:none;stroke:#d9682b;stroke-width:3}.rvu-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
`;document.head.appendChild(s)}

window.gfPolishRvu={v:1,FIX,XFS,viewOf:S=>VIEWED.get(S),tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
