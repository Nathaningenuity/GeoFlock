/* GeoFlock polish RV-R: a stop-by-stop review of the next History tours after Revolutions and industry: the World Wars
   (hwars), the Cold War and the end of empires (hcoldwar), the world since 1991 (hsince91) and the history of Europe
   (heurope), each looked at on the globe with the History map (their default mode) at 1280×860, once the map had
   loaded. Built on geoflock-polish-rvm.js (the first four History tours): the same helpers and engine, under "rvr"
   names so the files never touch each other's controls.
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on (to the stops psSteps() builds as
      well). Each fix says why; changed facts cite their source.
   2. Stops you can play with (listed at the start of part 2).
   3. The History map's year banner slid clear of the map key.
   geoflock-sweep-tours*.js re-set framing on every psGo, so the fixed fields are made fixed, non-configurable getters
   whose setters are ignored; a field already non-configurable (locked by another file) is left alone. Pin lists are
   filtered through getters (never frozen), so the shared photo passes still reach them. CSS classes start with "rvr-".
   Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvr)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvrTest or ?rvrtest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvrTest||/[?&]rvrtest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
  Object.defineProperty(S,k,{configurable:!!(window.__rvrTest||/[?&]rvrtest\b/.test(location.search)),enumerable:true,
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
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);if(card)LOCK(S,"card",card)};

/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>XF(S,"pins","mv"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p));
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>XF(S,"pins","area"+re,P=>P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p));
/* drop the icon pins with this icon name (and, if given, within 2° of this place) */
const DROPIC=(S,re,at)=>XF(S,"iconPins","dropic"+re+at,I=>I.filter(q=>!(q&&re.test(String(q.icon))&&(!at||Math.hypot(q.at[0]-at[0],q.at[1]-at[1])<2))));
/* add a text pin (once) */
const ADDPIN=(S,pin)=>XF(S,"pins","add"+pin[1],P=>P.some(p=>Array.isArray(p)&&strip(p[1])===pin[1])?P:P.concat([pin]));


const FIX={};
FIX.hwars={
  /* the UN General Assembly photo sat under the card and the Pearl Harbor one round the back of the globe; both (and
     Hiroshima's, on the globe's edge) have stops of their own. Opened on Europe beside the card */
  "A world at war":S=>{DROPPH(S,/^(UN General Assembly|USS Arizona|Genbaku)/);VIEW(S,[28,42,1.15],"left")},
  /* framed on the whole of Europe, from London to St Petersburg, for the slider in part 2 (the July Crisis) */
  "A shot in Sarajevo":S=>VIEW(S,[16.5,51,2.6],"left"),
  /* the front ran off the globe's right edge before it reached Switzerland: framed on the whole line */
  "The Western Front":S=>VIEW(S,[4.6,49.3,5.2],"left"),
  /* the card flipped to the right after the stop's question: kept on the left, the straits in the middle of the view (6 is the globe's closest zoom) */
  "Gallipoli":S=>VIEW(S,[26.9,40.3,6],"left"),
  /* the card was on the right, with the map key over its close button */
  "Four empires fall":S=>VIEW(S,[20,52,1.77],"left"),
  /* Boston's label and the Camp Funston photo were under the card: Kansas and Brest are 7,000 km apart. The stop opens
     on the Atlantic and buttons in part 2 turn the globe to each place; Boston becomes a plain label (Kansas has its
     button; the card's own picture is the same Camp Funston flu ward) */
  "Why “Spanish” flu?":S=>{DROPPH(S,/^Camp Funston/);AREA(S,/^Boston/);VIEW(S,[-25,35,1.2],"left")},
  /* the Wall Street photo hung off the globe's edge under the card (it is the card's own picture too) */
  "Crash and dictators":S=>{DROPPH(S,/^Wall Street/);VIEW(S,[8,44,1.6],"left")},
  "Blitzkrieg":S=>VIEW(S,[10,52,2.31],"left"),
  /* Berlin, one end of the 2,200 km ruler, was off the globe's edge with the card on the right. And the invasion force:
     "more than 3,000,000 German soldiers", with "650,000 troops from Germany's allies (Finland and Romania)", "more
     than 3,500,000 troops" in all (US Holocaust Memorial Museum, Holocaust Encyclopedia, "Invasion of the Soviet
     Union, June 1941") */
  /* the Commonwealth war cemetery photo (the card's own picture) hung off the bottom of the ruler, its label cut off */
  "The line that couldn’t be outflanked":S=>DROPPH(S,/^El Alamein/),
  /* Japan was under the card; Singapore is 10,800 km from Pearl Harbor, too far for one view beside the card, and its
     label floated off the globe: buttons in part 2 turn the globe to it and the other battles instead */
  "War in the Pacific":S=>{DROP(S,/^Singapore/);VIEW(S,[170,17,1.1],"left")},
  /* the card flipped to the right (after the stop's question), over Shanghai and with the map key on its close button */
  "The road and the Hump":S=>VIEW(S,[107,28,2.4],"left"),
  /* the card was on the right, with Nagasaki on the globe's edge and the map key over the card's close button.
     "well over 100,000" undersold it: the Radiation Effects Research Foundation (RERF, "Frequently asked questions")
     estimates the deaths within two to four months at 90,000–166,000 in Hiroshima and 60,000–80,000 in Nagasaki */
  "Hiroshima and Nagasaki":S=>{VIEW(S,[134,35,4.61],"left");RE(S,"body","By the end of 1945 they had killed well over 100,000 people, most of them civilians.","Within four months they had killed somewhere between 150,000 and 250,000 people, most of them civilians.")},
  /* the card was on the right (the map key over its close button). The beaches photo was labelled only "Utah" (its
     label cut short), one of the five: it becomes a plain "The five beaches" label (the card's own photo is Omaha) */
  "D-Day":S=>{DROPPH(S,/^Five beaches/);ADDPIN(S,[[-0.75,49.34],"The five beaches","point"]);VIEW(S,[-0.9,50,6],"left")},
  /* the map key names Germany, Poland and Japan, but Germany and Poland were under the card: turned west a little */
  "The human cost":S=>VIEW(S,[62,42,1],"left"),
  /* the card was on the right (the map key over its title) and only the US of the five permanent members was in view:
     the stop opens on the Atlantic. San Francisco's label then pointed under the card, so it goes (the text names it) */
  "The United Nations":S=>{DROP(S,/^San Francisco/);VIEW(S,[-25,40,1],"left")},
  "Stalingrad":S=>{VIEW(S,[30,52,2],"left");RE(S,"body","about 3 million German and allied troops","more than 3.5 million German and allied troops")}
};
FIX.hcoldwar={
  /* the Havana photo sat over Europe (its point under the card), Apollo 11's hung off the globe's bottom edge, the
     Wagah border's sat on the zoom buttons and Panmunjom and Bikini were round the back: all have stops of their own.
     Opened on Europe and the Soviet Union beside the card */
  "Two superpowers":S=>{DROPPH(S,/^(Havana|Apollo|Wagah|Panmunjom|Bikini|Ho Chi Minh|Black Star)/);VIEW(S,[45,45,1],"left")},
  /* Stettin's label lay under Copenhagen's and the cities of the stop's game were crowded together: closer in */
  "The Iron Curtain":S=>VIEW(S,[17,49,2.4],"left"),
  /* the card was on the right (the map key over its close button) and the Checkpoint Charlie photo (the card's picture
     on the two stops before) covered the ruler's "258 km"; the Berlin Wall photo stays */
  "Berlin divided":S=>{DROPPH(S,/^Checkpoint Charlie/);VIEW(S,[11,51.5,6],"left")},
  /* the card was on the right, with the map key over its close button, and Pakistan's label on the globe's edge */
  "Partition of India":S=>VIEW(S,[80,25,1.8],"left"),
  /* Taipei was on the globe's edge */
  "China’s revolution":S=>VIEW(S,[112,31,1.6],"left"),
  /* the Port Said photo hung at the globe's right edge: the view moved east a little */
  "Suez, 1956":S=>VIEW(S,[34.5,30.5,4.35],"left"),
  /* the card was on the right, with the map key over its title */
  "The Year of Africa":S=>VIEW(S,[15,5,1.05],"left"),
  /* the card was on the right, over Baikonur and Gagarin; the Apollo 11 photo hung off the globe's edge and Buzz Aldrin's
     sat in the middle of the Atlantic. Baikonur and Cape Canaveral are 143° of longitude apart: the stop opens on
     Baikonur's side, and each answer of the "who was first?" game in part 2 turns the globe to the launch site */
  "The space race":S=>{DROPPH(S,/^(Apollo 11|Buzz Aldrin)/);AREA(S,/^Cape Canaveral/);VIEW(S,[25,40,1],"left")},
  /* the card was on the right, with the map key over its close button */
  "Afghanistan, 1979":S=>VIEW(S,[68,34,3],"left"),
  /* the card was on the right, with Gdańsk and Hungary's border on the globe's far edge */
  "The Wall falls":S=>VIEW(S,[18,51,2.2],"left")
};
const applied=new WeakSet();
/* a stop whose photo pins this file edits, and to which geoflock-portraits.js adds a portrait, waits until the portrait
   is in (see XF): if this file locked the field first, the portrait could not be added */
let waiting=false;
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;TOUR_OF.set(S,tour);
 PEND=false;try{f(S)}catch(e){console.error("rvr fix",tour,S.title,e)}if(PEND)waiting=true;else applied.add(S)})}
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
const MYT=new Set(["hwars","hcoldwar","hsince91","heurope"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".ihx-ctl[data-turns],.gh2-ctl[data-turns],.rvm-ctl[data-turns],.rvr-ctl[data-turns]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

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
function tag(L,cls){const d=document.createElement("div");d.className="rvr-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvr-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvr-new");void e.offsetWidth;e.classList.add("rvr-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvr-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvr-rank"></ol><div class="rvr-pool"></div>'+
  '<div class="rvr-btns"><button type="button" class="rvr-btn rvr-undo">Undo</button><button type="button" class="rvr-btn rvr-show">Show me</button><button type="button" class="rvr-btn rvr-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvr-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvr-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvr-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvr-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvr-ok":"rvr-no"):"")+'"><span class="rvr-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvr-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvr-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvr-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvr-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvr-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvr-show").hidden=L.shown;c.querySelector(".rvr-again").hidden=!L.shown;
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
 card(L){return'<div class="rvr-btns rvr-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvr-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvr-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvr-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvr-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4]);L.dirty=1},
 draw(L){if(!L.svg)return;L.svg.innerHTML="";if(!L.tg)L.tg=tag(L,"rvr-ctag");const f=cfg.places[L.at||0],q=L.at?proj(L,[f[1],f[2]]):null;
  if(q){svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:11,class:"rvr-tring"});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvr-tdot"})}putTag(L,L.tg,f[5]?null:q,esc(f[0]),14)}}}


/* ---------------- guess first, then see: drag the slider to your guess, then check it ----------------
   cfg: {tours, title, tip, min, max, step, start, fmt(v) → text, answer, close (how near counts as "close"), after → text} */
function GUESS(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvr-gq"><input type="range" class="rvr-rng" min="'+cfg.min+'" max="'+cfg.max+'" step="'+cfg.step+'" value="'+cfg.start+'" aria-label="Your guess"><b class="rvr-gv"></b></div>'+
  '<div class="rvr-btns"><button type="button" class="rvr-btn rvr-chk">Check my guess</button><button type="button" class="rvr-btn rvr-again" hidden>Guess again</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvr-rng");L.v=+cfg.start;L.done=false;
  r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvr-chk").onclick=()=>{L.done=true;this.render(L)};
  c.querySelector(".rvr-again").onclick=()=>{L.done=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvr-rng");r.disabled=!!L.done;
  c.querySelector(".rvr-gv").textContent=cfg.fmt(L.done?cfg.answer:L.v);
  c.querySelector(".rvr-chk").hidden=!!L.done;c.querySelector(".rvr-again").hidden=!L.done;
  if(L.done){r.value=cfg.answer;const off=Math.abs(L.v-cfg.answer);say(L,(off<=cfg.close?"Close! ":"")+"You said "+cfg.fmt(L.v)+"; it was "+cfg.fmt(cfg.answer),cfg.after)}
  else{r.value=L.v;say(L,"","Drag to your guess, then check it.")}}}}

/* ---------------- which side? one item at a time, tap a box ----------------
   cfg: {tours, title, tip, bins:[names], items:[[text, bin index, why]], after(nRight, N) → text, and optionally
   turn:[[lon,lat,zoom] per box] and where:[text per box]: each answer turns the globe to its box's place} */
function BINS(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turn,tip:cfg.tip,
 card(L){return'<div class="rvr-q"><span class="rvr-n"></span><b class="rvr-item"></b></div><div class="rvr-bins">'+cfg.bins.map((b,i)=>'<button type="button" class="rvr-btn rvr-bin" data-b="'+i+'">'+esc(b)+'</button>').join("")+
  '<button type="button" class="rvr-btn rvr-next" hidden>Next →</button><button type="button" class="rvr-btn rvr-again" hidden>Start again</button></div><div class="rvr-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div>'},
 wire(L){const c=L.card;L.k=0;L.ans=[];L.wait=false;
  c.querySelectorAll(".rvr-bin").forEach(b=>b.onclick=()=>{if(L.wait||L.k>=cfg.items.length)return;L.ans[L.k]=+b.dataset.b;L.wait=true;
   /* each answer turns the globe to its right box's place */if(cfg.turn){const t=cfg.turn[cfg.items[L.k][1]];c.dataset.turns="1";turnGlobe(t[0],t[1],t[2])}this.render(L)});
  c.querySelector(".rvr-next").onclick=()=>{L.k++;L.wait=false;this.render(L)};
  c.querySelector(".rvr-again").onclick=()=>{L.k=0;L.ans=[];L.wait=false;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,done=L.k>=N,it=cfg.items[Math.min(L.k,N-1)];
  c.querySelector(".rvr-n").textContent=done?"":(L.k+1)+" of "+N;c.querySelector(".rvr-item").textContent=done?"":it[0];
  c.querySelectorAll(".rvr-bin").forEach(b=>{const i=+b.dataset.b;b.hidden=done;b.disabled=L.wait;b.classList.toggle("rvr-good",L.wait&&i===it[1]);b.classList.toggle("rvr-bad",L.wait&&i===L.ans[L.k]&&i!==it[1])});
  c.querySelector(".rvr-next").hidden=!(L.wait&&!done);c.querySelector(".rvr-next").textContent=L.k===N-1?"See my score →":"Next →";c.querySelector(".rvr-again").hidden=!done;
  c.querySelectorAll(".rvr-dots i").forEach((d,i)=>{d.className=i===L.k&&!done?"rvr-now":(L.ans[i]==null||(i===L.k&&!L.wait)?"":(L.ans[i]===cfg.items[i][1]?"rvr-y":"rvr-x"))});
  const right=L.ans.filter((a,i)=>a===cfg.items[i][1]).length;
  if(done)say(L,right+" of "+N+" right",cfg.after(right,N));
  else if(L.wait)say(L,L.ans[L.k]===it[1]?"Right: "+esc(cfg.bins[it[1]]):"No: it was "+esc(cfg.bins[it[1]]),esc(it[2])+(cfg.where?" "+esc(cfg.where[it[1]]):""));
  else say(L,"",esc(cfg.ask||"Tap your answer."))}}}

/* ======================================================================== part 2: stops you can play with
   Same pattern as geoflock-polish-rvm.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (the card scrolls to it), and removes everything as soon
   as the stop changes or the tour ends. Next and Back are never blocked; every step is wrapped in try/catch.
   - hwars | "A shot in Sarajevo": a day slider (or Play) from the shot on 28 June 1914 to 12 August: each declaration
             of war is drawn as an arrow between capitals as it happens.
   - hwars | "Why “Spanish” flu?": Kansas, Brest, Freetown, Boston and Madrid are an ocean apart; buttons turn the
             globe to each and ring it.
   - hwars | "War in the Pacific": Pearl Harbor and Singapore are 10,800 km apart; buttons turn the globe from one
             battle to the next, in order, and ring it.
   - hwars | "Now explore": put eight moments of the two wars in order.
   - hcoldwar | "Partition of India": guess how many people had to move, then see.
   - hcoldwar | "The space race": eight firsts: the Soviet Union or the United States?
   - hcoldwar | "Now explore": put eight moments of the Cold War in order.
   - hsince91 | "Europe grows together": a year slider (or Play) from 1993 to 2020; each capital lights up as its
                country joins the EU (and London greys out in 2020).
   - hsince91 | "Brexit": guess the Leave vote, then see.
   - hsince91 | "Now explore": put eight moments since 1991 in order. */
const RE_KM=6371.0088;

/* ======================================================================== 1. Across the Pacific (hwars)
   Dates: Pearl Harbor 7 December 1941 and Midway June 1942 (the stop's own); the fall of Singapore, 15 February 1942,
   about 80,000 British, Indian, Australian and local troops taken prisoner (Wikipedia, "Fall of Singapore", citing
   Farrell 2005 and others); Guadalcanal, 7 August 1942 to 9 February 1943 (Wikipedia, "Guadalcanal campaign");
   Okinawa, 1 April to 22 June 1945, local authorities count at least 149,425 Okinawans killed or missing (Wikipedia,
   "Battle of Okinawa"). 10,800 km is the great-circle distance from Pearl Harbor to Singapore. */
const TURN_PAC=TURNER({tours:["hwars"],mark:true,title:"War in the Pacific",tip:"The Pacific war was fought across a third of the globe. Turn it from battle to battle, in order.",
 places:[["The Pacific",170,17,1.1,"From Hawaii to Burma, Japan’s war reached across a third of the planet."],
  ["Pearl Harbor",-157.95,21.36,1.6,"7 December 1941: Japanese carrier planes hit the US Pacific Fleet in Hawaii, killing about 2,400 Americans.",1],
  ["Singapore",103.82,1.35,1.6,"15 February 1942: Britain’s great naval base surrenders, 10,800 km from Pearl Harbor. About 80,000 British, Indian and Australian soldiers became prisoners."],
  ["Midway",-177.37,28.21,1.6,"June 1942: US planes sink four Japanese aircraft carriers. Japan never again attacked across the Pacific.",1],
  ["Guadalcanal",160,-9.5,1.6,"August 1942 to February 1943: six months of fighting for one island and its airfield. The first big Allied push back.",1],
  ["Okinawa",127.8,26.3,1.6,"April to June 1945: the last great battle, on Japan’s doorstep. Tens of thousands of soldiers died, and well over 100,000 Okinawans were killed or went missing.",1]]});

/* ======================================================================== 2. Put the world wars in order (hwars)
   The dates are the tour's own stops: Sarajevo 28 June 1914, the Somme 1 July 1916, the armistice 11 November 1918,
   the Wall Street Crash October 1929, Hitler chancellor January 1933, Poland invaded 1 September 1939, Pearl Harbor
   7 December 1941, D-Day 6 June 1944. */
const SORT_WW=SORT({tours:["hwars"],title:"Now explore",
 tip:"Before you go: put these eight moments in order, earliest first.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Pearl Harbor attacked",1941.93,"7 Dec 1941"],["Shot in Sarajevo",1914.49,"28 Jun 1914"],["D-Day landings",1944.43,"6 Jun 1944"],["Wall Street Crash",1929.82,"Oct 1929"],
  ["First day of the Somme",1916.5,"1 Jul 1916"],["Germany invades Poland",1939.67,"1 Sep 1939"],["Hitler takes power",1933.08,"Jan 1933"],["Armistice: the guns stop",1918.86,"11 Nov 1918"]],
 after:(r,N)=>"Just 21 years separate the armistice of 1918 from the invasion of Poland in 1939: the Depression and the dictators came in between. Drag the History map’s timeline to watch it happen."});

/* ======================================================================== 3. From a shot to a world war (hwars)
   Dates: Wikipedia, "July Crisis" (the ultimatum 23 July, war on Serbia 28 July, Russia's general mobilisation 30 July)
   and "Declarations of war during World War I" (Germany on Russia 1 August, on France 3 August, on Belgium 4 August;
   Britain on Germany 4 August; Austria-Hungary on Russia 6 August; France and Britain on Austria-Hungary 12 August).
   Day 0 is 28 June 1914. The arrows join capitals (Russia's was St Petersburg). */
/* (the 4th field marks the places the stop already labels, which get no second tag) */
const CAP={vie:[16.37,48.21,"Vienna",1],bel:[20.46,44.82,"Belgrade",1],spb:[30.32,59.94,"St Petersburg"],ber:[13.4,52.52,"Berlin",1],par:[2.35,48.86,"Paris"],bru:[4.35,50.85,"Brussels"],lon:[-0.13,51.51,"London"],sar:[18.43,43.86,"Sarajevo",1]};
const JULY_E=[[0,"28 June","sar",null,"In Sarajevo, Gavrilo Princip shoots Archduke Franz Ferdinand, heir to Austria-Hungary’s throne."],
 [25,"23 July","vie","bel","Austria-Hungary, backed by Germany, sends Serbia an ultimatum it is meant to refuse."],
 [30,"28 July","vie","bel","Austria-Hungary declares war on Serbia."],
 [32,"30 July","spb",null,"Russia, Serbia’s protector, orders its whole army to get ready for war."],
 [34,"1 August","ber","spb","Germany, Austria-Hungary’s ally, declares war on Russia."],
 [36,"3 August","ber","par","Germany declares war on France, Russia’s ally."],
 [37,"4 August","ber","bru","Germany invades neutral Belgium on its way to France…"],
 [37.01,"4 August","lon","ber","…so Britain declares war on Germany."],
 [39,"6 August","vie","spb","Austria-Hungary declares war on Russia."],
 [45,"12 August","par","vie","France and Britain declare war on Austria-Hungary. In 45 days, one shot has pulled five of Europe’s great powers into war."],
 [45.01,"12 August","lon","vie",""]];
const JULY={tours:["hwars"],title:"A shot in Sarajevo",globe:true,
 tip:"Watch one shot become a world war: drag the slider, or press Play.",
 card(L){return'<div class="rvr-row"><button type="button" class="rvr-btn rvr-play" style="flex:0 0 auto">▶ Play</button><input type="range" class="rvr-rng" min="0" max="450" value="0" aria-label="Days after the shot"></div>'},
 init(L){L.t=0;L.playing=0},
 wire(L){const c=L.card,r=c.querySelector(".rvr-rng"),pb=c.querySelector(".rvr-play");
  r.oninput=()=>{L.playing=0;L.t=+r.value/10;this.render(L)};
  pb.onclick=()=>{if(L.playing){L.playing=0;this.render(L);return}if(L.t>=44.99)L.t=0;L.playing=1;L.last=performance.now();L.anim=1;this.render(L)};
  this.render(L)},
 off(L){L.playing=0},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvr-rng");if(document.activeElement!==r)r.value=Math.round(L.t*10);
  c.querySelector(".rvr-play").textContent=L.playing?"❚❚ Pause":(L.t>=44.99?"↻ Again":"▶ Play");
  const hit=JULY_E.filter(e=>e[0]<=L.t+1e-9&&e[4]),last=hit[hit.length-1];
  const at=hit.filter(e=>e[0]===last[0]||Math.abs(e[0]-last[0])<.02).map(e=>e[4]).join(" ");
  say(L,esc(last[1])+' 1914 <span class="rvr-km">day '+Math.floor(last[0])+"</span>",esc(at));L.dirty=1},
 draw(L){if(L.playing){const now=performance.now(),dt=Math.min(.1,(now-L.last)/1000);L.last=now;
   /* the quiet weeks pass quickly, the declarations slowly */L.t=Math.min(45,L.t+dt*(L.t<24?12:2.2));if(L.t>=45)L.playing=0;this.render(L)}
  L.anim=L.playing?1:0;L.svg.innerHTML="";const on={};
  JULY_E.forEach(e=>{if(e[0]>L.t+1e-9)return;on[e[2]]=1;if(e[3])on[e[3]]=1;if(!e[3])return;
   const a=CAP[e[2]],b=CAP[e[3]],ip=d3.geoInterpolate([a[0],a[1]],[b[0],b[1]]),k=Math.min(1,(L.t-e[0])*1.5+.15),pts=[];for(let j=0;j<=24;j++)pts.push(ip(j/24*k));
   svgEl(L.svg,"path",{d:pathOf(L,pts),class:e[1]==="23 July"?"rvr-jult":"rvr-jul"});
   const q1=proj(L,pts[pts.length-1]),q0=proj(L,pts[pts.length-3]);if(q1&&q0&&e[1]!=="23 July"){const an=Math.atan2(q1[1]-q0[1],q1[0]-q0[0]),s=9;
    svgEl(L.svg,"path",{d:"M"+q1[0].toFixed(1)+" "+q1[1].toFixed(1)+"L"+(q1[0]-s*Math.cos(an-.45)).toFixed(1)+" "+(q1[1]-s*Math.sin(an-.45)).toFixed(1)+"L"+(q1[0]-s*Math.cos(an+.45)).toFixed(1)+" "+(q1[1]-s*Math.sin(an+.45)).toFixed(1)+"Z",class:"rvr-julh"})}});
  if(!L.tags){L.tags={};for(const k in CAP)L.tags[k]=tag(L,"rvr-ctag rvr-small")}
  for(const k in CAP){const p=CAP[k],q=proj(L,[p[0],p[1]]);if(q&&on[k])svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:5,class:"rvr-juld"});putTag(L,L.tags[k],on[k]&&!p[3]?q:null,esc(p[2]),8)}}};

/* ======================================================================== 4. Where did the deadly wave start? (hwars)
   The stop's own facts (Spain's uncensored papers; an early outbreak at Camp Funston, Kansas, in March 1918), and the
   deadly second wave breaking out almost at once in three Atlantic ports at the end of August 1918: Brest, where
   American troops landed, Freetown, a coaling port, and Boston (H. Phillips, "Influenza pandemic", 1914-1918-online
   International Encyclopedia of the First World War; J. M. Barry, "The Great Influenza", 2004). */
const TURN_FLU=TURNER({tours:["hwars"],mark:true,title:"Why “Spanish” flu?",tip:"The flu crossed the Atlantic with the troops. Turn the globe to follow it.",
 places:[["The Atlantic",-25,35,1.2,"In late August 1918 a far deadlier wave broke out almost at once in three ports on the Atlantic: Brest, Freetown and Boston."],
  ["Kansas",-96.78,39.07,1.6,"One early outbreak, in March 1918, was at Camp Funston, an army camp where young men trained before shipping to France."],
  ["Brest",-4.49,48.39,1.8,"The French port where hundreds of thousands of American soldiers landed.",1],
  ["Freetown",-13.23,8.48,1.8,"A coaling port in Sierra Leone. The flu struck the dock workers loading coal onto ships first.",1],
  ["Boston",-71.06,42.36,1.8,"Sailors at Boston’s naval barracks fell sick at the end of August, and the second wave spread across the United States.",1],
  ["Madrid",-3.7,40.42,1.8,"Spain was not at war, so its papers reported the flu freely, and the name stuck.",1]]});

/* ======================================================================== 5. Who got there first? (hcoldwar)
   Wikipedia, "Timeline of the Space Race": Sputnik 1, 4 October 1957 (USSR); Laika on Sputnik 2, 3 November 1957
   (USSR); Gagarin on Vostok 1, 12 April 1961 (USSR); Tereshkova on Vostok 6, 16 June 1963 (USSR); the first spacewalk,
   Voskhod 2, 18 March 1965 (USSR); Mariner 4, the first successful Mars flyby, 14 July 1965 (USA); Apollo 8, the first
   people to orbit the Moon, December 1968 (USA); Apollo 11, the first people on the Moon, 20 July 1969 (USA). The
   Soviet flights all left from Baikonur, the American ones from Cape Canaveral and the Kennedy Space Center beside it
   (NASA; Wikipedia, "Baikonur Cosmodrome"); each answer turns the globe there. */
const BINS_SPACE=BINS({tours:["hcoldwar"],title:"The space race",tip:"Who got there first: the Soviet Union or the United States? Eight firsts.",ask:"Tap the side you think got there first.",
 turn:[[63.3,45.96,1.5],[-80.6,28.5,1.5]],where:["It flew from Baikonur, in today’s Kazakhstan.","It flew from Florida, at Cape Canaveral."],
 bins:["Soviet Union","United States"],
 items:[["The first satellite in orbit",0,"Sputnik 1, 4 October 1957: a beeping metal ball that shocked America."],
  ["The first people to walk on the Moon",1,"Apollo 11, July 1969: Neil Armstrong and Buzz Aldrin."],
  ["The first person in space",0,"Yuri Gagarin, 12 April 1961, once round the Earth in 108 minutes."],
  ["The first animal to orbit the Earth",0,"The dog Laika, on Sputnik 2 in November 1957. She did not survive."],
  ["The first people to fly round the Moon",1,"Apollo 8, at Christmas 1968, took the famous Earthrise photo."],
  ["The first woman in space",0,"Valentina Tereshkova, in June 1963. The first American woman, Sally Ride, flew 20 years later."],
  ["The first spacecraft to fly past Mars",1,"Mariner 4, July 1965, sent back the first close-up photos of another planet."],
  ["The first spacewalk",0,"Alexei Leonov floated outside his capsule for about 12 minutes in March 1965."]],
 after:(r,N)=>"The Soviet Union won most of the early firsts; the United States won the race to the Moon, the prize that mattered most to both."});

/* ======================================================================== 6. How many moved? (hcoldwar)
   The stop's own figures: about 15 million people moved at Partition in 1947, and between 200,000 and 2 million were
   killed. */
const GUESS_PART=GUESS({tours:["hcoldwar"],title:"Partition of India",tip:"Guess first: how many people had to leave their homes when British India was split?",
 min:0.5,max:30,step:0.5,start:3,fmt:v=>(v<1?Math.round(v*1000)+" thousand":(+v).toLocaleString("en-GB")+" million"),answer:15,close:3,
 after:"Hindus and Sikhs fled to India and Muslims to Pakistan, in one of the largest migrations in history. Somewhere between 200,000 and 2 million people were killed on the way."});

/* ======================================================================== 7. Put the Cold War in order (hcoldwar)
   The tour's own dates: the Berlin airlift 1948, Korea invaded June 1950, Suez 1956, Sputnik 1957, the Berlin Wall
   built 13 August 1961, the Cuban Missile Crisis October 1962, Saigon falls 30 April 1975, the Wall opens 9 November
   1989. */
const SORT_CW=SORT({tours:["hcoldwar"],title:"Now explore",
 tip:"Before you go: put these eight moments of the Cold War in order, earliest first.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Cuban Missile Crisis",1962.8,"Oct 1962"],["Berlin airlift",1948.5,"1948–49"],["Saigon falls",1975.33,"Apr 1975"],["North Korea invades the South",1950.48,"Jun 1950"],
  ["The Berlin Wall opens",1989.86,"Nov 1989"],["Sputnik launched",1957.76,"Oct 1957"],["The Berlin Wall is built",1961.62,"Aug 1961"],["Suez crisis",1956.85,"Nov 1956"]],
 after:(r,N)=>"Berlin opens and closes the story: the airlift of 1948, the Wall of 1961 and its fall in 1989. Drag the History map’s timeline to watch the empires’ colours drain away."});

/* ======================================================================== 8. The EU grows (hsince91)
   Membership: European Union, "History of the EU" / "EU enlargement" (europa.eu): the 12 members when the Maastricht
   Treaty came into force in November 1993; Austria, Finland and Sweden on 1 January 1995; Cyprus, Czechia, Estonia,
   Hungary, Latvia, Lithuania, Malta, Poland, Slovakia and Slovenia on 1 May 2004; Bulgaria and Romania on 1 January
   2007; Croatia on 1 July 2013; the United Kingdom left on 31 January 2020. Dots are on the capitals. */
const EU_C=[["Brussels",4.35,50.85,1993],["Paris",2.35,48.86,1993],["Berlin",13.4,52.52,1993],["Rome",12.5,41.9,1993],["Luxembourg",6.13,49.61,1993],["Amsterdam",4.9,52.37,1993],
 ["Copenhagen",12.57,55.68,1993],["Dublin",-6.26,53.35,1993],["London",-0.13,51.51,1993,2020.08],["Athens",23.73,37.98,1993],["Madrid",-3.7,40.42,1993],["Lisbon",-9.14,38.72,1993],
 ["Vienna",16.37,48.21,1995],["Helsinki",24.94,60.17,1995],["Stockholm",18.07,59.33,1995],
 ["Nicosia",33.38,35.17,2004.33],["Prague",14.42,50.08,2004.33],["Tallinn",24.75,59.44,2004.33],["Budapest",19.04,47.5,2004.33],["Riga",24.11,56.95,2004.33],["Vilnius",25.28,54.69,2004.33],
 ["Valletta",14.51,35.9,2004.33],["Warsaw",21.01,52.23,2004.33],["Bratislava",17.11,48.15,2004.33],["Ljubljana",14.51,46.06,2004.33],
 ["Sofia",23.32,42.7,2007],["Bucharest",26.1,44.43,2007],["Zagreb",15.98,45.81,2013.5]];
const EU_STEP=[[1993.8,"1993","The Maastricht Treaty creates the European Union, with 12 members."],[1995,"1995","Austria, Finland and Sweden join."],
 [2004.33,"1 May 2004","Ten countries join on one day, eight of them from behind the old Iron Curtain."],[2007,"2007","Bulgaria and Romania join."],[2013.5,"2013","Croatia joins: 28 members."],[2020.08,"2020","The United Kingdom leaves, the first country ever to do so: 27 members."]];
const EUG={tours:["hsince91"],title:"Europe grows together",globe:true,
 tip:"Watch the EU grow: drag the slider, or press Play.",
 card(L){return'<div class="rvr-row"><button type="button" class="rvr-btn rvr-play" style="flex:0 0 auto">▶ Play</button><input type="range" class="rvr-rng" min="19938" max="20210" value="19938" aria-label="Year"></div>'},
 init(L){L.t=1993.8;L.playing=0},
 wire(L){const c=L.card,r=c.querySelector(".rvr-rng"),pb=c.querySelector(".rvr-play");
  r.oninput=()=>{L.playing=0;L.t=+r.value/10;this.render(L)};
  pb.onclick=()=>{if(L.playing){L.playing=0;this.render(L);return}if(L.t>=2020.99)L.t=1993.8;L.playing=1;L.last=performance.now();L.anim=1;this.render(L)};
  this.render(L)},
 off(L){L.playing=0},
 n(t){return EU_C.filter(c=>c[3]<=t+1e-6&&!(c[4]&&c[4]<=t+1e-6)).length},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvr-rng");if(document.activeElement!==r)r.value=Math.round(L.t*10);
  c.querySelector(".rvr-play").textContent=L.playing?"❚❚ Pause":(L.t>=2020.99?"↻ Again":"▶ Play");
  const s=EU_STEP.filter(e=>e[0]<=L.t+1e-6).pop()||EU_STEP[0];
  say(L,esc(s[1])+' <span class="rvr-km">'+this.n(L.t)+" members</span>",esc(s[2]));L.dirty=1},
 draw(L){if(L.playing){const now=performance.now(),dt=Math.min(.1,(now-L.last)/1000);L.last=now;L.t=Math.min(2021,L.t+dt*3);if(L.t>=2021)L.playing=0;this.render(L)}
  L.anim=L.playing?1:0;L.svg.innerHTML="";if(!L.tags)L.tags=EU_C.map(()=>tag(L,"rvr-ctag rvr-small"));
  EU_C.forEach((p,i)=>{const q=proj(L,[p[1],p[2]]);const inn=p[3]<=L.t+1e-6,out=p[4]&&p[4]<=L.t+1e-6,fresh=inn&&!out&&L.t-p[3]<1.2&&p[3]>1994;
   if(q&&inn){if(fresh){const age=(L.t-p[3])/1.2;svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:(6+16*(1-age)).toFixed(1),class:"rvr-eur",opacity:(1-age).toFixed(2)})}
    svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:out?5:6,class:out?"rvr-euo":"rvr-eud"})}
   putTag(L,L.tags[i],(fresh||(out&&L.t-p[4]<1.5))?q:null,esc(p[0]),9)})}};

/* ======================================================================== 9. How close was Brexit? (hsince91)
   The stop's own result: 51.9% Leave to 48.1% Remain, 23 June 2016 (Electoral Commission). */
const GUESS_BREXIT=GUESS({tours:["hsince91"],title:"Brexit",tip:"Guess first: what share of voters chose Leave in 2016?",
 min:30,max:70,step:0.5,start:65,fmt:v=>(+v).toFixed(1)+"%",answer:51.9,close:3,
 after:"Leave won by under four percentage points: about 17.4 million votes to 16.1 million. England and Wales voted Leave; Scotland and Northern Ireland voted Remain."});

/* ======================================================================== 10. Put the years since 1991 in order (hsince91)
   The tour's own dates: the Soviet flag lowered 25 December 1991, Srebrenica July 1995, 11 September 2001, Lehman
   Brothers 15 September 2008, South Sudan 9 July 2011, the Brexit vote 23 June 2016, the pandemic declared 11 March
   2020, Russia's full-scale invasion of Ukraine 24 February 2022. */
const SORT_91=SORT({tours:["hsince91"],title:"Now explore",
 tip:"Before you go: put these eight moments in order, earliest first.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Lehman Brothers collapses",2008.71,"Sep 2008"],["The Soviet Union ends",1991.98,"Dec 1991"],["COVID-19 declared a pandemic",2020.19,"Mar 2020"],["Attacks of 11 September",2001.69,"Sep 2001"],
  ["The UK votes to leave the EU",2016.48,"Jun 2016"],["Srebrenica massacre",1995.53,"Jul 1995"],["Russia invades Ukraine",2022.15,"Feb 2022"],["South Sudan independent",2011.52,"Jul 2011"]],
 after:(r,N)=>"Three decades, from the end of one superpower to the biggest war in Europe since 1945. Drag the History map’s timeline: most borders have barely moved since 1995."});

/* ---------------- the engine: one stop at a time ---------------- */
const DEFS=[TURN_PAC,SORT_WW,JULY,TURN_FLU,BINS_SPACE,GUESS_PART,SORT_CW,EUG,GUESS_BREXIT,SORT_91];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvr-layer rvr-layer";el.innerHTML='<svg class="rvr-sv"><defs><clipPath id="rvrDisc"><path class="rvr-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvrDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvr-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvr-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvr-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvr-ctl";
 c.innerHTML='<div class="rvr-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvr-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvr-ctl"))unmount()}catch(e){}},300);
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
.rvr-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvr-sv{position:absolute;left:0;top:0;overflow:visible}
.rvr-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvr-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvr-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvr-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvr-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvr-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvr-btn[hidden]{display:none}
.rvr-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvr-ep b{display:block;font-size:15px}
.rvr-ep.rvr-new{animation:rvrIn .45s ease}@keyframes rvrIn{from{opacity:.2;transform:translateY(4px)}}
.rvr-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvr-sortq i{font-style:normal}
.rvr-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvr}
.rvr-rank li{position:relative;counter-increment:rvr;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvr-rank li::before{content:counter(rvr);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvr-rank li.rvr-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvr-rank li.rvr-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvr-nm{flex:1 1 auto;z-index:1}.rvr-v{z-index:1;font-weight:800;white-space:nowrap}
.rvr-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvr-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvr-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvr-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvr-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvr-do,:is(body.dark-theme,body.sky-night) .rvr-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvr-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvr-btn,:is(body.dark-theme,body.sky-night) .rvr-chip,:is(body.dark-theme,body.sky-night) .rvr-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvr-rank li.rvr-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvr-rank li.rvr-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvr-bar{background:rgba(255,178,122,.2)}
.rvr-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvr-rng{flex:1 1 auto;accent-color:#d9682b}.rvr-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvr-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvr-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvr-item{font-size:16px;color:#13294b}
.rvr-bins{display:flex;gap:6px;flex-wrap:wrap}.rvr-bins .rvr-btn[hidden]{display:none}.rvr-bin:disabled{cursor:default;opacity:.55}
.rvr-btn.rvr-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvr-btn.rvr-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvr-dots{display:flex;gap:4px;margin-top:8px}.rvr-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvr-dots i.rvr-now{box-shadow:0 0 0 2px #d9682b inset}.rvr-dots i.rvr-y{background:#1f8a4c}.rvr-dots i.rvr-x{background:#c2364f}
.rvr-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvr-sl .rvr-row{margin-top:2px}.rvr-sl .rvr-val{min-width:36px}
.rvr-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvr-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvr-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvr-out b{font-size:15px;color:#9a4a16}
.rvr-ch{display:block;width:100%;height:auto;margin-top:6px}.rvr-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvr-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvr-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvr-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvr-val,:is(body.dark-theme,body.sky-night) .rvr-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvr-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvr-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvr-n,:is(body.dark-theme,body.sky-night) .rvr-sl label,:is(body.dark-theme,body.sky-night) .rvr-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvr-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvr-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvr-dots i{background:rgba(255,255,255,.18)}
.rvr-btn.rvr-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvr-btn.rvr-cur{background:#9fc3ff;color:#13294b}
.rvr-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rvr-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rvr-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rvr-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvr-ep b .rvr-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rvr-ep b .rvr-km{color:#ffb27a}
.rvr-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rvr-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rvr-small{font-size:11.5px!important;padding:2px 7px!important}
.rvr-gq{display:flex;align-items:center;gap:10px;margin-top:6px}.rvr-gq .rvr-rng{flex:1 1 auto}.rvr-gv{min-width:92px;text-align:right;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap}
.rvr-julh{fill:#c2364f}.rvr-juld{fill:#fff;stroke:#c2364f;stroke-width:2.5}
.rvr-jul{fill:none;stroke:#c2364f;stroke-width:3.5;stroke-linecap:round}.rvr-jult{fill:none;stroke:#c2364f;stroke-width:2.5;stroke-dasharray:4 5;opacity:.8}
:is(body.dark-theme,body.sky-night) .rvr-gv{color:#ffb27a}
.rvr-eud{fill:#1f4fb4;stroke:#ffd84a;stroke-width:2.5}.rvr-eur{fill:none;stroke:#ffd84a;stroke-width:3}.rvr-euo{fill:#fff;stroke:#8a98a8;stroke-width:2;stroke-dasharray:2 2}
.rvr-tring{fill:none;stroke:#d9682b;stroke-width:3}.rvr-tdot{fill:#d9682b;stroke:#fff;stroke-width:2}
`;document.head.appendChild(s)}

window.gfPolishRvr={v:1,FIX,XFS,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
