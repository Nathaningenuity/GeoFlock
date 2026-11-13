/* GeoFlock polish RV-O: a stop-by-stop review of the four Cities tours of AP Human Geography unit 6: A world of cities
   (hg6a), Inside the city (hg6b), Building better cities (hg6c) and Cities under pressure (hg6d), each looked at on the
   globe, their default mode, at 1280×860.
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours starts (to
      the stops psSteps() builds as well). Each fix says why; changed facts cite their source.
   2. Stops you can play with (listed at the start of part 2).
   The structure and helpers are copied from geoflock-polish-rvl.js under "rvo" names, so the two never touch each
   other's controls. geoflock-sweep-tours*.js re-set framing on every psGo, so the fixed fields are made fixed,
   non-configurable getters whose setters are ignored; a field that is already non-configurable is left alone.
   On these People map stops the map key sits in the globe's top right corner (about x 876–992, y 211–320 at 1280×860),
   and the zoom buttons below it (x 1000–1040). */
(function(){
"use strict";
if(window.gfPolishRvo)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvoTest or ?rvotest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvoTest||/[?&]rvotest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* drop the text pins / photo pins whose label matches */
const DROP=(S,re)=>{const P=S.pins||[];const Q=P.filter(p=>!re.test(pinText(p)));if(Q.length!==P.length)LOCK(S,"pins",Q)};
/* (index.html builds a stop's photo squares once per stop, by index: if the stop is already on screen, its squares are
   rebuilt so the photos match their places) */
const DROPPH=(S,re)=>{const P=S.phPins||[];const Q=P.filter(p=>!re.test(strip(p&&p.label)));if(Q.length!==P.length){LOCK(S,"phPins",Q);try{document.querySelectorAll(".ps-phpins").forEach(e=>{if(e._for===S)e.remove()})}catch(e){}}};
/* rename a text pin */
const RENAME=(S,re,txt)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[p[0],txt].concat(p.slice(2)):p))};
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine itself turns it out from under the card */
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);if(card)LOCK(S,"card",card)};

/* move a text pin (an "area" pin keeps its [[lon,lat]] form) */
const MOVE=(S,re,ll)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))?[Array.isArray(p[0]&&p[0][0])?[ll]:ll].concat(p.slice(1)):p))};
/* turn a point pin into an "area" label: index.html's framing (gfSubjectPts) then leaves it out of the stop's middle */
const AREA=(S,re)=>{const P=S.pins||[];if(!P.some(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"))return;LOCK(S,"pins",P.map(p=>Array.isArray(p)&&re.test(strip(p[1]))&&p[2]!=="area"?[[p[0]],p[1],"area"]:p))};
/* rename a photo pin's label (the short label under the photo square) */
const PHLABEL=(S,re,txt)=>{const P=S.phPins||[];if(!P.some(p=>p&&re.test(strip(p.label))))return;LOCK(S,"phPins",P.map(p=>p&&re.test(strip(p.label))?Object.assign({},p,{label:txt}):p))};
/* add an "area" label (left out of the stop's framing, shown whenever it is on the visible side of the globe) */
const ADDAREA=(S,ll,txt)=>{const P=S.pins||[];if(P.some(p=>pinText(p)===txt))return;LOCK(S,"pins",P.concat([[[ll],txt,"area"]]))};
/* a country named twice, by its flag tag and again by a plain label: the plain label goes (as geoflock-sweep-tours3.js
   does for its own tours) */
const FLAGDUP=S=>{try{const F=S.flagTags;if(!Array.isArray(F)||!F.length)return;const N=new Set(F.map(f=>strip(f&&f.name).toLowerCase()));
 const P=S.pins||[];const Q=P.filter(p=>!(Array.isArray(p)&&N.has(pinText(p).toLowerCase())));if(Q.length!==P.length)LOCK(S,"pins",Q)}catch(e){}};
/* drop the icon pins with this icon name */
const DROPICON=(S,re)=>{const P=S.iconPins||[];const Q=P.filter(p=>!re.test(String(p&&p.icon)));if(Q.length!==P.length)LOCK(S,"iconPins",Q)};
const FIX={
 hg6a:{
  /* the five photos span the world (Tokyo, Istanbul, Lagos, New York, Bangkok): New York hung from under the card,
     Tokyo was round the back and Bangkok at the globe's edge. All three have their own stops later; Istanbul and Lagos
     are framed beside the card */
  "A world of cities":S=>{DROPPH(S,/^(Tokyo|New York|Bangkok)/);VIEW(S,[30,25,1.1])},
  /* an anchor icon left over from the Bosphorus (29°E, 41°N) belonged to another stop, and pulled nothing but clutter */
  "Where the ships stopped":S=>{DROPICON(S,/anchor/)},
  /* Atlanta and Barcelona, 86° of longitude apart, cannot both show beside the card: Atlanta sat at the globe's edge and
     Barcelona (and its label) under the card, which a tour question had switched to the right. The stop opens on
     Atlanta; buttons (part 2) turn the globe to Barcelona */
  "Transport shapes cities":S=>{AREA(S,/^Barcelona/);VIEW(S,[-84.4,33.75,2.6])},
  /* Lagos, 100° of longitude from the Asian megacities, sat under the card (its photo also opens the tour and the
     informal settlements stop of Cities under pressure); the Asian ones are framed beside the card */
  "Megacities":S=>{DROPPH(S,/^Lagos/);VIEW(S,[112,15,1.15])},
  /* the Jacksonville label ran under the zoom buttons and Miami's photo sat low on the globe */
  "The biggest city that isn’t":S=>VIEW(S,[-81.4,28.2,4.5]),
  /* Boston's photo sat under the zoom buttons */
  "Megalopolis and metacity":S=>VIEW(S,[-74.6,40.6,4.2]),
  /* New York, London, Paris and Tokyo: the globe turned to their middle, over the Arctic, with Tokyo under the card and
     New York at the bottom of the screen; framed on the North Atlantic, London's photo went under the map key. The stop
     opens on London and Paris (the card's own photo is Wall Street); buttons (part 2) turn the globe to New York, Tokyo
     and Dubai */
  "World cities":S=>{DROPPH(S,/^(Tokyo|New York)/);VIEW(S,[-6,47,1.5])},
  /* New York's pin sat at the globe's right edge, by the zoom buttons */
  "The rank-size rule":S=>VIEW(S,[-92,38,1.6]),
  "The gravity model":S=>VIEW(S,[-90,40,1.6])
 },
 hg6b:{
  /* the six photos span the world (Chicago, Los Angeles, Mexico City, Lagos, Jakarta, New York): the globe turned to the
     Atlantic, with Lagos and Jakarta round the back and Los Angeles under the card. Lagos and Jakarta have their own
     stops later; the four in North America are framed beside the card */
  "Inside the city":S=>{DROPPH(S,/^(Lagos|Jakarta)/);VIEW(S,[-92,30,1.2])}
 },
 hg6c:{
  /* the six photos span the world (Shanghai, London, Tysons, the Texas suburbs, Portland, Seaside): the globe turned to
     the Atlantic between them, with Shanghai round the back and the American four at the globe's edge (the card, on the
     right, covered the rest). Shanghai and London have their own stops later; the American four are framed */
  "Building better cities":S=>{DROPPH(S,/^(Shanghai|London)/);VIEW(S,[-93,36,1.15])}
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left: on the right (as some stops were switched at run time, after a tour question) it lay
    under the map key, which covered its title, and the stop's place went under the card
    (locked even where it already says "left", or a later file flips it, as happened on "Swapped by religion") */
 LOCK(S,"card","left");const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvo fix",tour,S.title,e)}})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps());/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f)f(S)}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins, which a locked field
   would ignore, so the stops lost all their photos; the fixes go in when one of these tours opens) */
/* Only the card side is locked at load, so a tour's first stop already opens with its card on the left */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvf.js and -rvl.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for four seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["hg6a","hg6b","hg6c","hg6d"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".gc3-ctl,.ge2-ctl,.rvo-ctl[data-turns]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same four seconds: psGo is wrapped to start the clock again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvo){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvo=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rvo-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvo-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvo-new");void e.offsetWidth;e.classList.add("rvo-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvo-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvo-rank"></ol><div class="rvo-pool"></div>'+
  '<div class="rvo-btns"><button type="button" class="rvo-btn rvo-undo">Undo</button><button type="button" class="rvo-btn rvo-show">Show me</button><button type="button" class="rvo-btn rvo-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvo-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvo-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvo-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvo-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvo-ok":"rvo-no"):"")+'"><span class="rvo-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvo-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvo-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvo-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvo-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvo-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvo-show").hidden=L.shown;c.querySelector(".rvo-again").hidden=!L.shown;
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
 return{tours:cfg.tours,title:cfg.title,globe:false,turns:!!cfg.turns,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvo-q"><span class="rvo-n"></span><b class="rvo-item"></b></div><div class="rvo-bins">'+cfg.kinds.map(k=>'<button type="button" class="rvo-btn rvo-bin" data-k="'+k[0]+'">'+esc(k[1])+'</button>').join("")+'</div>'+
  '<div class="rvo-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div><div class="rvo-btns"><button type="button" class="rvo-btn rvo-next" hidden>Next ▶</button><button type="button" class="rvo-btn rvo-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;const N=cfg.items.length;
  c.querySelectorAll(".rvo-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=N)return;L.ans=b.dataset.k;L.res[L.k]=OK(cfg.items[L.k]).includes(L.ans);const at=cfg.items[L.k][3];if(cfg.turns&&at)turnGlobe(at[0],at[1],at[2]);this.render(L)});
  c.querySelector(".rvo-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvo-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,end=L.k>=N,it=cfg.items[Math.min(L.k,N-1)],ok=OK(it);
  c.querySelector(".rvo-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvo-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvo-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvo-good",!!L.ans&&ok.includes(b.dataset.k));b.classList.toggle("rvo-bad",!!L.ans&&b.dataset.k===L.ans&&!ok.includes(L.ans))});
  c.querySelectorAll(".rvo-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvo-y":L.res[i]===false?"rvo-x":i===L.k&&!end?"rvo-now":"");
  c.querySelector(".rvo-next").hidden=end||!L.ans;c.querySelector(".rvo-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvo-again").hidden=!end;
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
 card(L){return(cfg.extra?cfg.extra.card(L):"")+'<div class="rvo-btns rvo-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvo-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 init(L){L.at=-1;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvo-ring"});L.tag=tag(L,"rvo-ctag");L.anim=1},
 draw(L){const f=L.at>=0?cfg.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  putTag(L,L.tag,f&&!L._dup?proj(L,[f[1],f[2]],1):null,f?esc(f[0]):null,16)},
 wire(L){const c=L.card;c.querySelectorAll(".rvo-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});
  if(cfg.extra)try{cfg.extra.wire.call(this,L)}catch(e){console.error(e)}this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvo-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvo-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+cfg.places[k][0]});
  if(L.over)return;if(L.at<0)say(L,"",cfg.intro);else{const f=cfg.places[L.at];say(L,f[0],f[4])}}}}

/* ======================================================================== hg6a: A world of cities */

/* ---- The railway city: Chicago against St Louis, census by census.
   US Census Bureau, Gibson (1998), "Population of the 100 largest cities and other urban places in the United States:
   1790 to 1990", Population Division Working Paper 27, tables 7–12 (city populations and ranks):
   Chicago 1840 4,470 (92nd), 1850 29,963 (24th), 1860 112,172 (9th), 1870 298,977 (5th), 1880 503,185 (4th),
   1890 1,099,850 (2nd); St Louis 16,469 (24th), 77,860 (8th), 160,773 (8th), 310,864 (4th), 350,518 (6th), 451,770 (5th). */
const RAILD=[[1840,4470,92,16469,24],[1850,29963,24,77860,8],[1860,112172,9,160773,8],[1870,298977,5,310864,4],[1880,503185,4,350518,6],[1890,1099850,2,451770,5]];
const ord=n=>n+(n%100>10&&n%100<14?"th":["th","st","nd","rd"][n%10]||"th");
const RAILN={1840:"St Louis, the steamboat port on the Mississippi, is almost four times the size of Chicago.",1850:"Both are growing fast; St Louis is still well ahead.",
 1860:"Chicago has caught up a long way: the railways from the East now meet at the tip of Lake Michigan.",1870:"Neck and neck: only about 12,000 people apart.",
 1880:"Chicago has overtaken the river city.",1890:"Chicago has passed a million: more than twice St Louis, and second only to New York."};
const RAIL={tours:["hg6a"],title:"The railway city",globe:false,tip:"Race the railway city against the river city: drag through the censuses.",
 card(L){return'<div class="rvo-race"><div class="rvo-lane"><span>Chicago <small>railway city</small></span><i class="rvo-rb rvo-chi"></i><b class="rvo-num rvo-nc"></b></div><div class="rvo-lane"><span>St Louis <small>river city</small></span><i class="rvo-rb rvo-stl"></i><b class="rvo-num rvo-ns"></b></div></div>'+
  '<div class="rvo-row"><input type="range" class="rvo-rng" min="0" max="5" step="1" value="0" aria-label="Census year"><b class="rvo-val"></b></div><div class="rvo-btns"><button type="button" class="rvo-btn rvo-play">▶ Play</button></div><div class="rvo-src">US census counts of each city</div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvo-rng");L.k=0;const stop=()=>{clearInterval(L.iv);L.iv=0;c.querySelector(".rvo-play").textContent="▶ Play"};
  r.oninput=()=>{L.k=+r.value;stop();this.render(L)};
  c.querySelector(".rvo-play").onclick=()=>{if(L.iv){stop();return}if(L.k>=5)L.k=0;r.value=L.k;this.render(L);c.querySelector(".rvo-play").textContent="❚❚ Pause";
   L.iv=setInterval(()=>{if(!c.isConnected){stop();return}L.k=Math.min(5,L.k+1);r.value=L.k;this.render(L);if(L.k>=5)stop()},1300)};this.render(L)},
 off(L){clearInterval(L.iv)},
 render(L){const c=L.card;if(!c)return;const d=RAILD[L.k],M=1100000;
  c.querySelector(".rvo-chi").style.width=Math.max(1.5,d[1]/M*100).toFixed(1)+"%";c.querySelector(".rvo-stl").style.width=Math.max(1.5,d[3]/M*100).toFixed(1)+"%";
  c.querySelector(".rvo-nc").textContent=fmt(d[1]);c.querySelector(".rvo-ns").textContent=fmt(d[3]);c.querySelector(".rvo-val").textContent=d[0];
  say(L,d[0]+": Chicago "+ord(d[2])+", St Louis "+ord(d[4])+" among US cities",RAILN[d[0]])}};

/* ---- Transport shapes cities: guess, then turn the globe from Atlanta to Barcelona.
   Alain Bertaud's comparison (Streetsblog USA, 3 Sep 2014, "Wowza: scale maps of Barcelona and Atlanta show the waste of
   sprawl": "the urbanized area of Atlanta is 26.5 times that of Barcelona", for "almost the same population";
   NYU Marron Institute, "Reducing pollution & congestion in Atlanta": Atlanta's built-up area 4,280 km², at 6 people per
   hectare, against Barcelona's 171). The circles are drawn to those areas (4,280 and 4,280 ÷ 26.5 ≈ 162 km²). */
const SPRAWL=TURNER({tours:["hg6a"],title:"Transport shapes cities",tip:"Guess first: how many Barcelonas would fit in Atlanta’s built-up area?",
 intro:"Two cities with about the same number of people. Then turn the globe to see each one.",
 places:[["Atlanta",-84.39,33.75,3,"Built for the car: about 6 people per hectare, spread over 4,280 km² of roads, lawns and car parks."],
  ["Barcelona",2.17,41.39,3,"Built before the car: about 171 people per hectare, in blocks of flats along a dense grid."]],
 extra:{card(L){return'<div class="rvo-row"><input type="range" class="rvo-rng rvo-gs" min="1" max="50" step="1" value="5" aria-label="Your guess"><b class="rvo-val rvo-gv"></b></div>'+
   '<div class="rvo-btns"><button type="button" class="rvo-btn rvo-chk">Check my guess</button></div><svg class="rvo-ch rvo-cmp" viewBox="0 0 300 128" hidden role="img" aria-label="Atlanta and Barcelona built-up areas to scale">'+
   '<circle class="rvo-atl" cx="78" cy="62" r="56"/><circle class="rvo-bcn" cx="236" cy="62" r="10.9"/><text class="rvo-tx" x="78" y="66" text-anchor="middle">Atlanta 4,280 km²</text><text class="rvo-tx" x="236" y="90" text-anchor="middle">Barcelona</text><text class="rvo-tx" x="236" y="102" text-anchor="middle">about 162 km²</text></svg>'},
  wire(L){const c=L.card,r=c.querySelector(".rvo-gs"),v=c.querySelector(".rvo-gv");const sh=()=>{v.textContent=r.value+" Barcelona"+(r.value==="1"?"":"s")};r.oninput=()=>{sh()};sh();
   c.querySelector(".rvo-chk").onclick=()=>{const g=+r.value;c.querySelector(".rvo-cmp").removeAttribute("hidden");c.querySelector(".rvo-chk").hidden=true;r.disabled=true;L.over=1;
    const off=Math.abs(g-26.5);say(L,"About 26 and a half"+(off<=3?": great guess!":off<=8?": close.":" (you guessed "+g+")"),"Same population, but Atlanta’s car-built sprawl covers 26.5 times the ground of compact Barcelona. Now turn the globe to each one.");
    c.querySelectorAll(".rvo-turn button").forEach(b=>b.addEventListener("click",()=>{L.over=0;SPRAWL.render(L)}))}}}});

/* ---- The biggest city that isn't: city limits against the metro area.
   US Census 2020, via Wikipedia ("Jacksonville, Florida": 949,611, total area 874.46 sq mi = 2,264.84 km²; "Miami": 442,241,
   total area 56.07 sq mi = 145.23 km²; "Jacksonville metropolitan area": 1,605,848; "Miami metropolitan area":
   6,138,333). */
const JAXD={city:[["Jacksonville",949611],["Miami",442241]],metro:[["Jacksonville",1605848],["Miami",6138333]]};
const JAX={tours:["hg6a"],title:"The biggest city that isn’t",globe:false,tip:"Which is bigger? Switch between two ways of counting a city.",
 card(L){return'<div class="rvo-btns rvo-tog"><button type="button" class="rvo-btn" data-m="city">City limits</button><button type="button" class="rvo-btn" data-m="metro">Metro area</button></div><div class="rvo-race"><div class="rvo-lane"><span class="rvo-l0"></span><i class="rvo-rb rvo-b0"></i><b class="rvo-num rvo-n0"></b></div><div class="rvo-lane"><span class="rvo-l1"></span><i class="rvo-rb rvo-b1"></i><b class="rvo-num rvo-n1"></b></div></div><div class="rvo-src">US Census 2020</div>'},
 wire(L){const c=L.card;L.m="city";c.querySelectorAll(".rvo-tog button").forEach(b=>b.onclick=()=>{L.m=b.dataset.m;this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;const D=JAXD[L.m],M=Math.max(D[0][1],D[1][1])*1.02;c.querySelectorAll(".rvo-tog button").forEach(b=>b.classList.toggle("rvo-cur",b.dataset.m===L.m));
  D.forEach((d,i)=>{c.querySelector(".rvo-l"+i).textContent=d[0];c.querySelector(".rvo-b"+i).style.width=Math.max(1.5,d[1]/M*100).toFixed(1)+"%";c.querySelector(".rvo-n"+i).textContent=fmt(d[1])});
  if(L.m==="city")say(L,"City limits: Jacksonville wins, about 2 to 1","Jacksonville’s limits take in its whole county, about 2,265 km²; Miami’s cover only about 145 km², less than a fifteenth of that.");
  else say(L,"Metro area: Miami wins, nearly 4 to 1","Count the suburbs tied to each city by commuting, and Miami’s region holds over 6 million people to Jacksonville’s 1.6 million.")}};

/* ---- World cities: turn the globe from one to the next. GaWC (Globalization and World Cities Research Network) 2024
   ranking, via Wikipedia: Alpha++ London and New York; Alpha+ Beijing, Dubai, Hong Kong, Paris, Shanghai, Singapore,
   Sydney and Tokyo. */
const WORLDC=TURNER({tours:["hg6a"],title:"World cities",tip:"World cities are far apart. Turn the globe from one to the next.",
 intro:"Researchers at the GaWC network rank cities by how many offices of global banks, law and accounting firms and ad agencies they hold.",
 places:[["London",-0.12,51.5,2.6,"One of only two cities in GaWC’s top class, Alpha++ (2024)."],["New York",-74,40.7,2.6,"The other Alpha++ city: Wall Street and its stock exchanges."],
  ["Tokyo",139.7,35.7,2.6,"Alpha+, with Paris, Singapore, Hong Kong, Shanghai, Beijing, Dubai and Sydney."],["Dubai",55.3,25.2,2.6,"Alpha+: it rose fast as a hub for flights, trade and finance between Europe, Asia and Africa."]]});

/* ---- Central place theory: where would you go for it? Christaller's own idea (threshold and range), with everyday
   examples; no figures. Where two answers are fair, both count. */
const CPT=CLASSIFY({tours:["hg6a"],title:"Central place theory",below:true,
 tip:"Where is the nearest place you could get it? Think threshold and range.",ask:"Village, market town or big city?",
 kinds:[["v","Village","a village"],["t","Market town","a market town"],["c","Big city","a big city"]],
 items:[["A fresh loaf of bread","v","Everyone buys bread often, so a baker needs few customers (a low threshold) and nobody travels far for it (a short range)."],
  ["A heart surgeon","c","Only a big city has enough people around it to keep a heart surgeon busy: a huge threshold, and patients travel a long way."],
  ["A secondary school","t","It needs more pupils than one village has, so it serves the villages around a town."],
  ["An opera house","c","Few people go, and rarely, so it needs millions within reach: only the biggest centres have one."],
  ["A petrol station",["v","t"],"Drivers fill up often and won’t go far for it, so a small place can support one."],
  ["A shoe shop","t","People buy shoes now and then and will drive to the nearest town for a choice."],
  ["A hospital with an emergency department",["t","c"],"It needs tens of thousands of people around it: a large town or a city."],
  ["An international airport","c","Only a big city draws enough travellers, from far around, to fill the flights."]],
 end:()=>"Low-threshold goods are everywhere; high-threshold ones only in the few big centres. That is why Christaller’s map has many villages, fewer towns and one city."});

/* ======================================================================== hg6b: Inside the city */
/* ---- Which model fits? A review of the tour's own models and its own cities (each answer turns the globe there):
   Burgess (1925) and Hoyt (1939) from Chicago, Harris and Ullman (1945) from Los Angeles, Harris's galactic city (1997)
   around Washington, Griffin and Ford (1980) from Mexico City, de Blij's African city from Lagos and McGee's Southeast
   Asian city from Jakarta. */
const MODELS=CLASSIFY({tours:["hg6b"],title:"The Southeast Asian city",turns:true,below:true,
 tip:"Review: which model fits each city? Each answer turns the globe there.",ask:"Which model of the city fits best?",
 kinds:[["con","Concentric zones","the concentric zone model"],["sec","Sector","the sector model"],["mn","Multiple nuclei","the multiple nuclei model"],["gal","Galactic","the galactic city model"],
  ["lat","Latin American","the Latin American city model"],["afr","African","the African city model"],["sea","Southeast Asian","the Southeast Asian city model"]],
 items:[["Jakarta: grew round the Dutch port of Batavia, with a Chinese merchants’ quarter beside it","sea","McGee’s model: the old colonial port at the centre, with Western and “alien” commercial zones beside it.",[106.81,-6.15,4]],
  ["Los Angeles: an old downtown, and other centres round the airport and the port","mn","Harris and Ullman: a car city that grew round several nuclei, not one.",[-118.3,33.95,4]],
  ["Mexico City: rich homes along the Paseo de la Reforma, squatter settlements on the fringe","lat","Griffin and Ford: an elite spine from the old plaza, and rings that grow poorer outward.",[-99.15,19.43,4]],
  ["Washington: office towers at Tysons, where highways meet the Capital Beltway","gal","The galactic city: edge cities orbit the old downtown, linked by the ring road.",[-77.15,38.9,4]],
  ["Chicago’s North Shore: a high-income wedge running out along the lake","sec","Hoyt’s sectors: the rich follow the most attractive direction, here the lakeshore.",[-87.7,42.05,4]],
  ["Lagos: a colonial business district, a traditional centre and huge open-air markets","afr","De Blij’s African city has three CBDs: colonial, traditional and market.",[3.39,6.46,4]],
  ["Chicago in the 1920s: the Loop, ringed by factories, then workers’ homes, then commuter suburbs","con","Burgess’s rings, drawn from Chicago itself.",[-87.63,41.88,4]]],
 end:(r,N)=>"Each model was drawn from one city, so each fits its own region best, and no real city fits one exactly."});
/* ---- Chicago's pattern or Paris's? The contrast the stop itself draws (Burgess's Chicago, two stops back, against
   Paris and its banlieues); no new facts. */
const INOUT=CLASSIFY({tours:["hg6b"],title:"Rich in the middle",below:true,
 tip:"Inside out: does each one fit Chicago’s pattern or Paris’s?",ask:"Chicago’s pattern or Paris’s?",
 kinds:[["chi","Chicago (Burgess)","Chicago’s pattern"],["par","Paris","Paris’s pattern"]],
 items:[["The richest families live in grand flats right in the centre","par","Paris kept wealth at the centre: palaces, culture and good transport made it prestigious."],
  ["Social housing towers rise in the suburbs beyond the ring road","par","The banlieues beyond the Périphérique hold Paris’s big estates of high-rise social housing."],
  ["The well-off commute in from big houses on the edge","chi","Burgess’s outer ring: the commuter zone, where the better-off live."],
  ["Run-down housing and factories crowd round downtown","chi","Burgess’s zone of transition, next to the CBD, where newcomers arrive first."],
  ["Strict planning keeps towers out of the old centre","par","Paris held its old centre to a low, even height; the towers went up outside it."],
  ["Newcomers start near the centre and move outward as they get richer","chi","Burgess’s city grows by newcomers arriving in the middle and moving out."]],
 end:()=>"Same pieces, opposite places: in Chicago’s model wealth rises outward; in Paris it falls outward."});

/* ======================================================================== hg6c: Building better cities */
/* ---- Howard's three magnets: the words on his own diagram (Garden Cities of To-morrow, 1902; transcribed on Wikimedia
   Commons, "Howard-three-magnets.png"): Town "Closing out of nature. Social opportunity. Isolation of crowds. Places of
   amusement."; Country "Lack of society. Beauty of nature. Hands out of work. Land lying idle."; Town-Country "Beauty of
   nature. Social opportunity. Fields and parks of easy access. Low rents, high wages." */
const MAGNETS=CLASSIFY({tours:["hg6c"],title:"The garden city",below:true,
 tip:"Howard’s three magnets: which one did he write each phrase on?",ask:"Town, country, or town-country?",
 kinds:[["t","Town","the town"],["c","Country","the country"],["tc","Town-country","the town-country (garden city)"]],
 items:[["“Lack of society”","c","Fresh air, but lonely: Howard’s country magnet."],
  ["“Closing out of nature”","t","The crowded town shuts out green space and sky."],
  ["“Isolation of crowds”","t","You can be lonely among thousands in the town."],
  ["“Low rents, high wages”","tc","The garden city’s promise: town wages with country rents."],
  ["“Hands out of work”","c","Farm work was shrinking, so the country could not offer jobs."],
  ["“Places of amusement”","t","The town’s pull: theatres, music halls, shops."],
  ["“Fields and parks of easy access”","tc","Every garden city home was meant to be a short walk from open land."],
  ["“Land lying idle”","c","Howard’s country: plenty of land, little use made of it."],
  ["“Beauty of nature”",["c","tc"],"Howard wrote it on both: the country has it, and the garden city keeps it."]],
 end:()=>"Each magnet pulls and pushes. Howard’s answer was a third magnet with the best of both, and Letchworth was its test."});

/* ---- Superblock: before and after. Barcelona's first superblock (superilla), in Poblenou in 2016: nine blocks with
   through traffic kept to the edge roads and the inner streets limited to 10 km/h for residents and deliveries (WHO,
   "Barcelona: using urban design to improve urban health"; Naider, "The first superblock in Barcelona"). Eixample
   blocks are about 113 m across, as the stop says. */
const SUPER={tours:["hg6c"],title:"Superblocks",globe:false,tip:"Make a superblock: take the cars off the inside streets.",
 card(L){const B=[],S=[],T=[],C=[];const x0=10,y0=10,b=40,s=12,P=k=>x0+s+k*(b+s);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)B.push('<rect class="rvo-blk" x="'+P(i)+'" y="'+P(j)+'" width="'+b+'" height="'+b+'" rx="7"/>');
  /* inner streets: the two between the columns and the two between the rows, inside the outer ring */
  for(let k=1;k<3;k++){const q=P(k)-s;S.push('<rect class="rvo-in" x="'+q+'" y="'+(y0+s)+'" width="'+s+'" height="'+(3*b+2*s)+'"/>','<rect class="rvo-in" x="'+(x0+s)+'" y="'+q+'" width="'+(3*b+2*s)+'" height="'+s+'"/>');
   for(let m=0;m<3;m++){T.push('<circle class="rvo-tree" cx="'+(q+s/2)+'" cy="'+(P(m)+b/2)+'" r="4"/>','<circle class="rvo-tree" cx="'+(P(m)+b/2)+'" cy="'+(q+s/2)+'" r="4"/>');
    C.push('<rect class="rvo-car rvo-cin" x="'+(q+3)+'" y="'+(P(m)+8+m*6)+'" width="6" height="10" rx="2"/>','<rect class="rvo-car rvo-cin" x="'+(P(m)+6+m*7)+'" y="'+(q+3)+'" width="10" height="6" rx="2"/>')}}
  const W=3*b+4*s;[[x0+30,y0+3,10,6],[x0+100,y0+3,10,6],[x0+3,y0+60,6,10],[x0+W-9,y0+90,6,10],[x0+70,y0+W-9,10,6],[x0+140,y0+W-9,10,6],[x0+W-9,y0+25,6,10]].forEach(r=>C.push('<rect class="rvo-car" x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" rx="2"/>'));
  return'<div class="rvo-sb"><svg class="rvo-ch" viewBox="0 0 300 200" role="img" aria-label="Nine city blocks, before and after a superblock">'+
   '<rect class="rvo-road" x="'+x0+'" y="'+y0+'" width="'+W+'" height="'+W+'" rx="4"/>'+S.join("")+B.join("")+'<g class="rvo-trees">'+T.join("")+'</g>'+C.join("")+
   '<text class="rvo-tx" x="'+(x0+W/2)+'" y="'+(y0+W+14)+'" text-anchor="middle">nine blocks, each about 113 m across</text>'+
   '<g class="rvo-sbk"><rect class="rvo-car" x="200" y="40" width="10" height="6" rx="2"/><text class="rvo-tx" x="216" y="46">car</text><rect class="rvo-blk" x="200" y="60" width="10" height="10" rx="2"/><text class="rvo-tx" x="216" y="69">block of flats</text>'+
   '<circle class="rvo-tree" cx="205" cy="88" r="4"/><text class="rvo-tx" x="216" y="91">trees and play</text></g></svg></div>'+
   '<div class="rvo-btns rvo-tog"><button type="button" class="rvo-btn" data-m="0">Before</button><button type="button" class="rvo-btn" data-m="1">Superblock</button></div>'},
 wire(L){const c=L.card;L.m=0;c.querySelectorAll(".rvo-tog button").forEach(b=>b.onclick=()=>{L.m=+b.dataset.m;this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelector(".rvo-sb").classList.toggle("rvo-on",!!L.m);c.querySelectorAll(".rvo-tog button").forEach(b=>b.classList.toggle("rvo-cur",+b.dataset.m===L.m));
  if(!L.m)say(L,"Before: every street is a road","Cars cut through on all twelve inner street stretches as well as round the edge.");
  else say(L,"After: the inside goes to people","Through traffic stays on the edge roads. Inside, only residents and deliveries drive, at 10 km/h; the crossings become squares."+" The first, in Poblenou in 2016, gained four new squares.")}};

/* ---- Brownfield or greenfield? The stop's own Olympic Park and Levittown (stop 1, on Long Island farmland), with
   general cases. */
const BROWN=CLASSIFY({tours:["hg6c"],title:"Brownfields",below:true,
 tip:"Brownfield or greenfield? Sort six building sites.",ask:"Is it a brownfield or a greenfield site?",
 kinds:[["b","Brownfield","a brownfield site"],["g","Greenfield","a greenfield site"]],
 items:[["London’s 2012 Olympic Park, on old rail yards and dumps","b","Used, polluted land, cleaned up and reused: the stop’s own example."],
  ["Flats on the site of an old gasworks","b","Old industrial land, often polluted, so it must be cleaned first."],
  ["A new estate of houses on a farmer’s fields","g","Land never built on before: cheaper to build, but the countryside is lost."],
  ["Levittown, built on Long Island farmland after 1947","g","Postwar suburbs spread over fields: greenfield growth, as in sprawl."],
  ["A shopping centre on a closed steelworks","b","Reusing an old industrial site spares a field somewhere else."],
  ["Offices on woodland cleared beside a motorway junction","g","Never built on before, so it is greenfield, even though it is next to a road."]],
 end:()=>"Brownfields cost more to clean but spare the countryside; that is why smart growth puts them first."});
const DEFS=[RAIL,SPRAWL,JAX,WORLDC,CPT,MODELS,INOUT,MAGNETS,SUPER,BROWN];

let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvo-layer rvo-layer";el.innerHTML='<svg class="rvo-sv"><defs><clipPath id="rvoDisc"><path class="rvo-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvoDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvo-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvo-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvo-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvo-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvo-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvo-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvo-ctl"))unmount()}catch(e){}},300);
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
.rvo-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvo-sv{position:absolute;left:0;top:0;overflow:visible}
.rvo-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvo-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvo-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvo-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvo-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvo-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvo-btn[hidden]{display:none}
.rvo-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvo-ep b{display:block;font-size:15px}
.rvo-ep.rvo-new{animation:rvoIn .45s ease}@keyframes rvoIn{from{opacity:.2;transform:translateY(4px)}}
.rvo-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvo-sortq i{font-style:normal}
.rvo-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvo}
.rvo-rank li{position:relative;counter-increment:rvo;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvo-rank li::before{content:counter(rvo);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvo-rank li.rvo-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvo-rank li.rvo-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvo-nm{flex:1 1 auto;z-index:1}.rvo-v{z-index:1;font-weight:800;white-space:nowrap}
.rvo-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvo-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvo-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvo-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvo-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvo-do,:is(body.dark-theme,body.sky-night) .rvo-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvo-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvo-btn,:is(body.dark-theme,body.sky-night) .rvo-chip,:is(body.dark-theme,body.sky-night) .rvo-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvo-rank li.rvo-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvo-rank li.rvo-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvo-bar{background:rgba(255,178,122,.2)}
.rvo-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvo-rng{flex:1 1 auto;accent-color:#d9682b}.rvo-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvo-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvo-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvo-item{font-size:16px;color:#13294b}
.rvo-bins{display:flex;gap:6px;flex-wrap:wrap}.rvo-bins .rvo-btn[hidden]{display:none}.rvo-bin:disabled{cursor:default;opacity:.55}
.rvo-btn.rvo-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvo-btn.rvo-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvo-dots{display:flex;gap:4px;margin-top:8px}.rvo-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvo-dots i.rvo-now{box-shadow:0 0 0 2px #d9682b inset}.rvo-dots i.rvo-y{background:#1f8a4c}.rvo-dots i.rvo-x{background:#c2364f}
.rvo-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvo-sl .rvo-row{margin-top:2px}.rvo-sl .rvo-val{min-width:36px}
.rvo-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvo-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvo-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvo-out b{font-size:15px;color:#9a4a16}
.rvo-ch{display:block;width:100%;height:auto;margin-top:6px}.rvo-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvo-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvo-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvo-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvo-val,:is(body.dark-theme,body.sky-night) .rvo-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvo-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvo-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvo-n,:is(body.dark-theme,body.sky-night) .rvo-sl label,:is(body.dark-theme,body.sky-night) .rvo-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvo-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvo-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvo-dots i{background:rgba(255,255,255,.18)}
.rvo-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvo-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvo-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvo-dd circle.rvo-near{fill:#d9682b;opacity:1}
.rvo-pump{cursor:pointer;outline:none}.rvo-pump .rvo-hit{fill:transparent}.rvo-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvo-pump:hover rect,.rvo-pump:focus rect{fill:#13294b}.rvo-pump.rvo-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvo-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvo-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvo-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvo-kd{background:#2a2f3a}.rvo-kp{background:#2a78d0;border-radius:2px!important}.rvo-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvo-key2{color:#aab6c8}
.rvo-btn.rvo-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvo-btn.rvo-cur{background:#9fc3ff;color:#13294b}
.rvo-band{fill:rgba(217,104,43,.1)}.rvo-area{fill:rgba(42,120,208,.22);stroke:#2a78d0;stroke-width:1.5;stroke-linejoin:round}.rvo-dashed{fill:none;stroke:#8a98a8;stroke-dasharray:3 3}
line.rvo-now{stroke:#d9682b;stroke-width:1.5}.rvo-dot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
:is(body.dark-theme,body.sky-night) .rvo-area{fill:rgba(159,195,255,.22);stroke:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvo-band{fill:rgba(255,178,122,.12)}
:is(body.dark-theme,body.sky-night) .rvo-btn.rvo-good{background:#1f8a4c;border-color:#4cc27f;color:#fff}:is(body.dark-theme,body.sky-night) .rvo-btn.rvo-bad{background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvo-dots i.rvo-y{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvo-dots i.rvo-x{background:#ff7088}:is(body.dark-theme,body.sky-night) .rvo-dots i.rvo-now{box-shadow:0 0 0 2px #ffb27a inset}
.rvo-ring{fill:rgba(255,209,102,.3);stroke:#d9682b;stroke-width:3}
.rvo-race{display:flex;flex-direction:column;gap:6px;margin:4px 0}
.rvo-lane{display:grid;grid-template-columns:1fr auto;align-items:end;column-gap:8px;row-gap:3px;font-size:13px;font-weight:800;color:#13294b}
.rvo-lane span{line-height:1.1}.rvo-lane small{display:inline;margin-left:5px;font-size:10.5px;font-weight:700;color:#5b6b7c}
.rvo-rb{display:block;height:14px;border-radius:7px;background:#d9682b;transition:width .7s ease;grid-column:1/-1;grid-row:2;justify-self:start}
.rvo-stl,.rvo-b1{background:#2a78d0}.rvo-num{font-size:13px;color:#13294b;min-width:72px;text-align:right}
.rvo-src{font-size:11px;color:#5b6b7c;margin-top:4px}
.rvo-atl{fill:rgba(217,104,43,.25);stroke:#d9682b;stroke-width:2}.rvo-bcn{fill:rgba(42,120,208,.35);stroke:#2a78d0;stroke-width:2}
.rvo-cmp[hidden]{display:none}
:is(body.dark-theme,body.sky-night) .rvo-lane,:is(body.dark-theme,body.sky-night) .rvo-num{color:#fff}
:is(body.dark-theme,body.sky-night) .rvo-lane small,:is(body.dark-theme,body.sky-night) .rvo-src{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvo-stl,:is(body.dark-theme,body.sky-night) .rvo-b1{background:#6fa8ff}
.rvo-road{fill:#9aa3ad}.rvo-blk{fill:#e8c9a0;stroke:#b08a5a;stroke-width:1}.rvo-in{fill:#9aa3ad;transition:fill .6s}.rvo-car{fill:#c2364f;transition:opacity .5s}
.rvo-trees{opacity:0;transition:opacity .6s}.rvo-tree{fill:#2f9e5b}
.rvo-sb.rvo-on .rvo-in{fill:#bfe3b4}.rvo-sb.rvo-on .rvo-trees{opacity:1}.rvo-sb.rvo-on .rvo-cin{opacity:0}
.rvo-sbk .rvo-car,.rvo-sbk .rvo-tree{opacity:1}
:is(body.dark-theme,body.sky-night) .rvo-road,:is(body.dark-theme,body.sky-night) .rvo-in{fill:#5b6573}:is(body.dark-theme,body.sky-night) .rvo-sb.rvo-on .rvo-in{fill:#3f7a4f}
`;document.head.appendChild(s)}

window.gfPolishRvo={v:1,FIX,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
