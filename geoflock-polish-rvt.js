/* GeoFlock polish RV-T: a stop-by-stop review of four Physical Earth tours, Mountain ranges (ranges), Volcanoes
   (volcanoes), Caves and the world underground (caves) and Weather and winds (weather), each looked at on the globe,
   their default mode, at 1280×860. (People, Human origins, Island life and Special regions are reviewed in
   geoflock-polish-rvs.js.)
   1. Fixes, keyed by tour and stop title, applied whenever one of these tours is on. Each fix says why; changed facts
      cite their source. Every stop keeps its card on the left: half the stops opened it on the right, where it covered
      the place the stop is about and pushed the map key over the left of the globe.
   2. Stops you can play with (listed in DEFS at the end of part 2), and guess-first questions through
      geoflock-tourplay.js.
   The structure, helpers and engine are copied from geoflock-polish-rvq.js under "rvt" names, so the two never touch
   each other's controls. geoflock-sweep-tours*.js re-set framing on every psGo, so the fixed fields are made fixed,
   non-configurable getters whose setters are ignored; a field that is already non-configurable is left alone.
   On these stops the map key sits in the bottom right corner (about x 1014–1264, y 512–840 at 1280×860) and the zoom
   buttons at x 992–1028, y 230–425. index.html sets each photo square out from its place, away from the globe's middle,
   so a photo far from the middle lands on the card, the buttons or the key: the stops are framed so their photos sit
   near the middle, and a place too far away keeps a label instead of its photo. */
(function(){
"use strict";
if(window.gfPolishRvt)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvtTest or ?rvttest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvtTest||/[?&]rvttest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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
const VIEWED=new WeakMap();
const VIEW=(S,g,card)=>{LOCK(S,"globe",g);VIEWED.set(S,g);if(card)LOCK(S,"card",card)};
/* index.html's wrapper of psGlobeTarget flies to the middle of all a stop's pins, photos and icons whenever more of them
   are in sight from there; on these tours that turned the globe to points half a world apart (Three grains to the North
   Atlantic, Coffee to the Gulf of Guinea). A stop framed here (on the globe, not the flat map) gets exactly its frame. */
(function wrapGT(n){try{if(typeof window.psGlobeTarget!=="function"){if(n<60)setTimeout(()=>wrapGT(n+1),500);return}if(window.psGlobeTarget._rvt)return;const g0=window.psGlobeTarget;
 const w=function(S){try{const R=window.gfPolishRvt,v=S&&R&&R.viewOf&&R.viewOf(S);if(v&&ps&&ps.g&&!ps.g._flat&&R.tours.has(ps.tour))return v.slice()}catch(e){}return g0.apply(this,arguments)};w._rvt=1;window.psGlobeTarget=w}catch(e){}})(0);

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
/* drop the icon pins at one place ([lon, lat], within half a degree) */
const DROPICON2=(S,ll)=>{const P=S.iconPins||[];const Q=P.filter(p=>!(p&&p.at&&Math.abs(p.at[0]-ll[0])<.5&&Math.abs(p.at[1]-ll[1])<.5));if(Q.length!==P.length)LOCK(S,"iconPins",Q)};
const FIX={
 ranges:{
  /* nine photos round the world: Aconcagua, the Rockies, Kosciuszko and Denali round the back, the Matterhorn and
     Kilimanjaro under the card, the Drakensberg below the screen and Everest (once the globe turned out from under the
     card) on the zoom buttons. Each has its own stop; the opening keeps Everest and the Urals, framed beside the card
     (the frame suits the globe turned out from under the card or not) */
  "Mountains of the world":S=>{DROPPH(S,/^(Aconcagua|Hallett|The Matterhorn|Kilimanjaro|Drakensberg|Mount Kosciuszko|Denali)/);VIEW(S,[80,35,1])},
  /* the card was on the right, over the Yangtze's mouth, and the map key over the Salween's; with the card on the left
     the three river mouths sat on the globe's right edge */
  "Three rivers, three seas":S=>VIEW(S,[104,24,1.7]),
  /* Aconcagua's photo sat below the screen */
  "The Andes":S=>VIEW(S,[-68,-24,1.6]),
  /* the stop asks "How high is the highest peak of the Ural Mountains?" before showing its headline, but the peak's
     pin gave the answer away; the Kazakhstan label sat under the map key (the steppes are in the stop's text) */
  "Where Europe meets Asia":S=>{RENAME(S,/^Narodnaya/,"Narodnaya: top peak");DROP(S,/^Kazakhstan$/);VIEW(S,[60,59,2.4])},
  /* the Drakensberg photo sat below the screen and the Simien photo above the globe */
  "Africa’s high ground":S=>VIEW(S,[30,-6,1.3]),
  /* "perhaps higher, perhaps higher": a phrase repeated */
  "Old mountains: the Appalachians":S=>RE(S,"body","perhaps higher, perhaps higher,","perhaps higher,"),
  /* Scotland, half the stop, sat on the globe's right edge */
  "Scotland’s mountains are in America":S=>VIEW(S,[-27,50,1.2]),
  /* Vinson is in the Ellsworth Mountains, not the Transantarctic range (Wikipedia, "Vinson Massif"), and its label hung
     below the screen; it has its place on the Seven Summits stop */
  "The range that holds back the ice":S=>DROP(S,/^Vinson/),
  /* Everest on the zoom buttons, Aconcagua on the globe's edge, Denali and Kosciuszko round the back: the summits are on
     seven continents. Buttons (part 2) turn the globe to each; the stop opens on Asia, Europe and Africa */
  "The top of each continent":S=>{DROPPH(S,/^(Denali|Mount Kosciuszko)/);VIEW(S,[62,22,1])}
 },
 volcanoes:{
  /* eight photos round the world: Kīlauea, Arenal and Reykjanes round the back, Etna and Nyiragongo under the card and
     Yasur on the globe's edge. Each has its own stop (Yasur and Arenal are in no stop, and are left out); the opening
     keeps Fuji and Anak Krakatau, beside the card */
  "Volcanoes":S=>DROPPH(S,/^(Kīlauea|Etna|Nyiragongo|Arenal|Reykjanes|Mount Yasur)/),
  /* the Mayon and Bromo photos sat under the card and Mount St Helens's on the search box: the Pacific is wider than the
     half of the globe beside the card, and the stop's game turns the globe round it. Mayon and St Helens have stops of
     their own (Bromo is on the card's photo). The Indonesia and Philippines labels sat under the card too */
  "The Ring of Fire":S=>{DROPPH(S,/^(Mayon|Mount Bromo|Mount St Helens)/);DROP(S,/^(Indonesia|Philippines)$/)},
  /* Hawaii sat in the bottom right corner, the Kīlauea photo under the map key (Kīlauea keeps its label) */
  "Mauna Loa: a giant shield":S=>{DROPPH(S,/^Kīlauea/);VIEW(S,[-155.8,20.4,5.5])},
  /* two photos of Fuji, one on the zoom buttons, and Mayon's photo at the bottom of the screen */
  "Steep cones: stratovolcanoes":S=>{DROPPH(S,/^Mount Fuji 3,776/);VIEW(S,[132,24,2])},
  /* the field-of-cones label ran into the map key */
  "A volcano born in a cornfield":S=>VIEW(S,[-101.2,19.6,6]),
  /* the caldera's label ran into the map key */
  "Yellowstone’s supervolcano":S=>VIEW(S,[-108,44,4.2]),
  /* Tonga was at the bottom of the screen, its photo (the card's own) below it, and Alaska's label above the globe */
  "The biggest bang in a century":S=>{DROPPH(S,/^Hunga Tonga/);VIEW(S,[-165,18,1])},
  /* the India label hung under the map key; the lava plateau sat on the globe's right edge */
  "Floods of lava: the Deccan Traps":S=>{DROP(S,/^India$/);VIEW(S,[82,19,2.6])},
  /* Java's label and Bromo's photo sat on the globe's right edge, the Iceland photos and label on the card and the map
     toggles, California and Taupō round the back. Buttons (part 2) turn the globe to each place; the stop opens on Kenya */
  "Living with volcanoes":S=>{DROPPH(S,/^(Geothermal power|The Blue Lagoon|Mount Bromo)/);DROP(S,/^(Iceland|Indonesia|Philippines)$/);VIEW(S,[45,5,1])}
 },
 caves:{},
 weather:{}
};

const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left: on the right (as some stops were switched at run time, after a tour question) it lay
    under the map key, which covered its title, and the stop's place went under the card
    (locked even where it already says "left", or a later file flips it, as happened on "Swapped by religion") */
 LOCK(S,"card","left");const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvt fix",tour,S.title,e)}})}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}/* every tick (cheap: each stop is fixed once), since on a tour's first launch psSteps() can still be the old list when ps.tour changes */applyTo(t,psSteps());const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f)f(S)}catch(e){}}catch(e){}},300);
/* (not at page load: other files fill in these stops' photos after load by assigning S.phPins, which a locked field
   would ignore, so the stops lost all their photos; the fixes go in when one of these tours opens) */
/* Only the card side is locked at load, so a tour's first stop already opens with its card on the left */
const cardsLeft=()=>{try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>{if(S)LOCK(S,"card","left")})})}catch(e){}};
cardsLeft();setTimeout(cardsLeft,1500);setTimeout(cardsLeft,6000);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvf.js and -rvl.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for eight seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["ranges","volcanoes","caves","weather"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=0;refl=0;touched=0}goAt++;ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".gc3-ctl,.ge2-ctl,.rvt-ctl[data-turns]"))return;
 /* counted in ticks of this 250 ms check, not in clock time: a tour's first launch can block the page for many seconds while its map loads, which used up the whole window before the globe had even moved */
 if(touched||refl>=2||goAt<4||goAt>32||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);
/* the same stop opened again (Back, a dot, a link) gets the same four seconds: psGo is wrapped to start the clock again */
(function wrapGo(n){try{if(typeof window.psGo!=="function"||window.psGo._rvt){if(n<40)setTimeout(()=>wrapGo(n+1),500);return}const g0=window.psGo;
 const w=function(){goKey="";return g0.apply(this,arguments)};w._rvt=1;window.psGo=w}catch(e){}})(0);

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
function tag(L,cls){const d=document.createElement("div");d.className="rvt-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvt-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvt-new");void e.offsetWidth;e.classList.add("rvt-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvt-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvt-rank"></ol><div class="rvt-pool"></div>'+
  '<div class="rvt-btns"><button type="button" class="rvt-btn rvt-undo">Undo</button><button type="button" class="rvt-btn rvt-show">Show me</button><button type="button" class="rvt-btn rvt-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvt-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvt-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvt-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvt-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvt-ok":"rvt-no"):"")+'"><span class="rvt-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvt-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvt-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvt-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvt-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvt-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvt-show").hidden=L.shown;c.querySelector(".rvt-again").hidden=!L.shown;
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
 card(L){return'<div class="rvt-q"><span class="rvt-n"></span><b class="rvt-item"></b></div><div class="rvt-bins">'+cfg.kinds.map(k=>'<button type="button" class="rvt-btn rvt-bin" data-k="'+k[0]+'">'+esc(k[1])+'</button>').join("")+'</div>'+
  '<div class="rvt-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div><div class="rvt-btns"><button type="button" class="rvt-btn rvt-next" hidden>Next ▶</button><button type="button" class="rvt-btn rvt-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;const N=cfg.items.length;
  c.querySelectorAll(".rvt-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=N)return;L.ans=b.dataset.k;L.res[L.k]=OK(cfg.items[L.k]).includes(L.ans);const at=cfg.items[L.k][3];if(cfg.turns&&at)turnGlobe(at[0],at[1],at[2]);this.render(L)});
  c.querySelector(".rvt-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvt-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,end=L.k>=N,it=cfg.items[Math.min(L.k,N-1)],ok=OK(it);
  c.querySelector(".rvt-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvt-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvt-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvt-good",!!L.ans&&ok.includes(b.dataset.k));b.classList.toggle("rvt-bad",!!L.ans&&b.dataset.k===L.ans&&!ok.includes(L.ans))});
  c.querySelectorAll(".rvt-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvt-y":L.res[i]===false?"rvt-x":i===L.k&&!end?"rvt-now":"");
  c.querySelector(".rvt-next").hidden=end||!L.ans;c.querySelector(".rvt-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvt-again").hidden=!end;
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
 card(L){return(cfg.extra?cfg.extra.card(L):"")+'<div class="rvt-btns rvt-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvt-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 init(L){L.at=-1;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvt-ring"});L.tag=tag(L,"rvt-ctag");L.anim=1},
 draw(L){const f=L.at>=0?cfg.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(performance.now()/330))).toFixed(1))}else L.ring.style.display="none";
  if(f&&L._tf!==f){L._tf=f;L._dup=false;try{const S=psSteps()[ps.i],P=[].concat(S.pins||[],S.phPins||[]);L._dup=P.some(p=>{let ll=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(ll&&ll[0]))ll=ll[0];return ll&&Math.abs(ll[0]-f[1])<.6&&Math.abs(ll[1]-f[2])<.6})}catch(e){}}
  putTag(L,L.tag,f&&!L._dup?proj(L,[f[1],f[2]],1):null,f?esc(f[0]):null,16)},
 wire(L){const c=L.card;c.querySelectorAll(".rvt-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});
  if(cfg.extra)try{cfg.extra.wire.call(this,L)}catch(e){console.error(e)}this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvt-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvt-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+cfg.places[k][0]});
  if(L.over)return;if(L.at<0)say(L,"",cfg.intro);else{const f=cfg.places[L.at];say(L,f[0],f[4])}}}}

/* ======================================================================== ranges */
/* ---- The top of each continent: turn the globe to each of the Seven Summits (heights from the stop's own list;
   Wikipedia, "Seven Summits": Vinson in the Ellsworth Mountains; Puncak Jaya, 4,884 m, counted by some lists instead
   of Kosciuszko, as the stop's own "more" says). They are spread over every continent, so they cannot all be seen at
   once. */
const SUMMITS=TURNER({tours:["ranges"],title:"The top of each continent",tip:"The Seven Summits are on seven continents. Turn the globe to each one.",
 intro:"Pick a summit to fly there. Which would you climb first?",
 places:[["Everest",86.925,27.988,2.2,"Asia, 8,849 m, on the border of Nepal and China: the highest of all."],
  ["Aconcagua",-70.011,-32.653,2.2,"South America, 6,961 m, in Argentina’s Andes: the highest mountain outside Asia."],
  ["Denali",-151.007,63.069,2.2,"North America, 6,190 m, in Alaska."],
  ["Kilimanjaro",37.355,-3.066,2.2,"Africa, 5,895 m: a lone volcano you can walk up."],
  ["Elbrus",42.439,43.352,2.2,"Europe, 5,642 m, in the Caucasus, in Russia (if the Caucasus are counted as Europe)."],
  ["Vinson",-85.617,-78.525,2.2,"Antarctica, 4,892 m, in the Ellsworth Mountains: one of the hardest to reach."],
  ["Kosciuszko",148.263,-36.456,2.2,"Australia, 2,228 m: some lists count Puncak Jaya in New Guinea, 4,884 m, instead."]]});

/* ---- Old mountains: young or old? The ranges and their ages are the tour's own (the Himalaya rising since India hit
   Asia about 50 million years ago; the Appalachians from about 480 million years ago; the Urals about 300 million; the
   Andes squeezed up by the Nazca plate still diving under South America; the Alps the crumple zone of Africa still
   pushing north; the Scottish Highlands over 400 million years ago, in the same chain as the Appalachians; the Rockies
   80 to 55 million years ago). "Young" here means risen in the last 100 million years. */
const YOUNGOLD=CLASSIFY({tours:["ranges"],title:"Old mountains: the Appalachians",turns:true,below:true,
 tip:"Young and sharp, or old and worn down? Each answer turns the globe to the range.",ask:"Young, or old?",
 kinds:[["y","Young and sharp","young"],["o","Old and worn","old"]],
 items:[["The Himalaya","y","Young: they began rising when India hit Asia about 50 million years ago, and they are still rising.",[84,29,1.8]],
  ["The Urals","o","Old: they formed about 300 million years ago, when Europe and Siberia collided, and have been worn low ever since.",[60,60,1.8]],
  ["The Scottish Highlands","o","Old: they rose over 400 million years ago, in the same chain as the Appalachians.",[-4.5,57,2.6]],
  ["The Andes","y","Young: the Nazca plate is still diving under South America, squeezing them up and feeding their volcanoes.",[-70,-20,1.6]],
  ["The Alps","y","Young: Africa is still pushing north into Europe, and the Alps are the crumple zone.",[10,46,2.6]],
  ["The Appalachians","o","Old: they began rising about 480 million years ago, before there were trees on land.",[-80,37,2]],
  ["The Rockies","y","Young, for mountains: they rose about 80 to 55 million years ago.",[-108,42,1.8]]],
 end:()=>"Height is a clue to age. Young ranges are tall and sharp; old ones have had hundreds of millions of years of rain and ice to wear them down."});

/* ---- Review on the last stop: each range's highest peak, highest first (the heights of the tour's own pins and text:
   Everest 8,849 m, Aconcagua 6,961 m, Mont Blanc 4,806 m, Ras Dashen 4,550 m, Mount Elbert 4,401 m, Toubkal 4,167 m,
   Kosciuszko 2,228 m, Mount Mitchell 2,037 m, Narodnaya 1,895 m). */
const RTOP=SORT({tours:["ranges"],title:"Now explore",below:true,desc:true,
 tip:"Review: put the ranges in order of their highest peak, highest first.",first:"Highest",last:"Lowest",
 items:[["The Himalaya",8849,"Everest, 8,849 m"],["The Andes",6961,"Aconcagua, 6,961 m"],["The Alps",4806,"Mont Blanc, 4,806 m"],
  ["Ethiopian Highlands",4550,"Ras Dashen, 4,550 m"],["The Rockies",4401,"Mount Elbert, 4,401 m"],["The Atlas",4167,"Toubkal, 4,167 m"],
  ["Great Dividing Range",2228,"Kosciuszko, 2,228 m"],["The Appalachians",2037,"Mount Mitchell, 2,037 m"],["The Urals",1895,"Narodnaya, 1,895 m"]],
 after:(r,N)=>"The young ranges, pushed up by plates that are still colliding, top the list; the Appalachians and the Urals, hundreds of millions of years old, have been worn down to the bottom."});

/* ======================================================================== volcanoes */
/* ---- Steep cones: shield or stratovolcano? Wikipedia: "Mount Fuji" (an active stratovolcano), "Mayon" (a
   stratovolcano, "the most active volcano in the country"), "Mauna Loa" and "Kīlauea" (shield volcanoes), "Mount
   Vesuvius" (a somma–stratovolcano), "Erta Ale" (a continuously active basaltic shield volcano), "Mount St. Helens" (an
   active stratovolcano). Notes from the tour's own stops. Each answer turns the globe there. */
const SHIELD=CLASSIFY({tours:["volcanoes"],title:"Steep cones: stratovolcanoes",turns:true,below:true,
 tip:"Wide, gentle shield, or steep cone? Each answer turns the globe to the volcano.",ask:"Shield, or steep cone?",
 kinds:[["sh","Shield: wide and gentle","a shield volcano"],["st","Steep cone","a stratovolcano, a steep cone"]],
 items:[["Mount Fuji","st","Layer upon layer of lava and ash; it last erupted in 1707, dropping ash on Edo, now Tokyo.",[138.73,35.36,2.4]],
  ["Mayon","st","Often called the most perfect cone on Earth; it has erupted about 50 times in the last 400 years.",[123.685,13.257,2.4]],
  ["Mauna Loa","sh","Runny basalt lava spread far before it cooled, building the biggest active volcano on Earth.",[-155.6,19.48,2.4]],
  ["Vesuvius","st","Sticky, gassy magma and violent blasts, like the one that buried Pompeii in 79 AD.",[14.426,40.821,2.4]],
  ["Kīlauea","sh","Mauna Loa’s neighbour, a shield too; it erupted almost without a break from 1983 to 2018.",[-155.29,19.41,2.4]],
  ["Erta Ale","sh","A low basalt shield in Ethiopia’s Afar, with one of the world’s few lasting lava lakes.",[40.67,13.6,2.4]],
  ["Mount St Helens","st","A steep cone in the Cascade Range, until its north side slid away in 1980.",[-122.18,46.2,2.4]]],
 end:()=>"Runny basalt lava spreads into wide shields, over hot spots and rifts; sticky, gassy magma, where plates dive under each other, piles up steep cones that can explode."});

/* ---- Living with volcanoes: turn the globe to each place the stop names (Java, Iceland and Olkaria from the stop's
   own text; Wikipedia, "The Geysers": "the world's largest geothermal field"; "Wairakei Power Station", near Taupō:
   commissioned in 1958). */
const LIVING=TURNER({tours:["volcanoes"],title:"Living with volcanoes",tip:"Five places that live with volcanoes, round the world. Turn the globe to each.",
 intro:"Volcanoes give as well as take: soil, heat and power. Pick a place.",
 places:[["Java",110,-7.5,2,"About 45 active volcanoes, and over 150 million people, many farming the rich soil their ash makes."],
  ["Iceland",-21.4,64.04,2.2,"About nine homes in ten are heated with hot water piped from the ground."],
  ["Kenya",36.3,-0.88,2.2,"Power stations along the Rift at Olkaria make about 40% of the country’s electricity."],
  ["California",-122.76,38.79,2.2,"The Geysers, north of San Francisco, is the world’s largest geothermal field."],
  ["New Zealand",176.1,-38.63,2.2,"Wairakei, near Lake Taupō, has made electricity from volcanic steam since 1958."]]});

/* ---- Review on the last stop: why is each volcano there? The reasons are the tour's own (Hawaii and Yellowstone over
   hot spots; Iceland on a mid-ocean ridge and a hot spot at once; the ocean plate diving under Mexico feeding
   Paricutín's field; the Pacific's ocean plates diving under Japan and the Cascades, the Ring of Fire; East Africa
   tearing apart along the Rift). Erta Ale: Wikipedia, "Afar Triangle" (the Afar, where the African and Arabian plates
   pull apart). */
const WHYV=CLASSIFY({tours:["volcanoes"],title:"Now explore",turns:true,below:true,
 tip:"Review: why is each volcano where it is? Each answer turns the globe there.",ask:"Plates diving, plates pulling apart, or a hot spot?",
 kinds:[["dive","Plates diving under","plates diving under each other"],["apart","Plates pulling apart","plates pulling apart"],["hot","A hot spot","a hot spot"]],
 items:[["Mount Fuji","dive","Ocean plates dive under Japan, part of the Ring of Fire.",[138.73,35.36,2]],
  ["Paricutín","dive","The ocean plate diving under Mexico feeds a field of over a thousand small cones.",[-102.25,19.49,2]],
  ["Mauna Loa","hot","Hawaii sits over a hot spot in the middle of the Pacific plate.",[-155.6,19.48,2]],
  ["Kilimanjaro","apart","East Africa is slowly tearing apart along the Great Rift Valley, and volcanoes line the cracks.",[37.36,-3.07,2]],
  ["Yellowstone","hot","A hot spot like Hawaii’s, but under a continent.",[-110.6,44.6,2]],
  ["Mount St Helens","dive","The ocean plate dives under North America here, feeding the Cascade volcanoes.",[-122.18,46.2,2]],
  ["Iceland",["apart","hot"],"Both: Iceland sits on a mid-ocean ridge and a hot spot at once.",[-19,64.9,2]],
  ["Erta Ale","apart","In the Afar, where Africa and Arabia are pulling apart.",[40.67,13.6,2]]],
 end:()=>"Most volcanoes sit where plates dive under each other or pull apart; a few, like Hawaii and Yellowstone, sit over hot spots far from any plate edge."});

/* ======================================================================== caves */
/* ---- Review on the last stop: how was each cave made? (the tour's own stops: Mammoth Cave and Son Doong carved in
   limestone by water; Carlsbad dissolved from below by sulphuric acid; Kazumura and Thurston lava tubes; Benagil and
   Fingal's Cave cut by the sea; Postojna, the karst cave that gave karst its name). Each answer turns the globe there. */
const HOWCAVE=CLASSIFY({tours:["caves"],title:"Now explore",turns:true,below:true,
 tip:"Review: what made each cave? Each answer turns the globe there.",ask:"What made it?",
 kinds:[["rain","Water dissolving rock","water dissolving limestone"],["acid","Acid from below","sulphuric acid from below"],["lava","Lava","a river of lava"],["sea","Sea waves","the sea’s waves"]],
 items:[["Mammoth Cave, Kentucky","rain","Rivers of rainwater carved level after level of passages in the limestone, under a hard sandstone cap.",[-86.1,37.19,2.4]],
  ["Carlsbad Caverns, New Mexico","acid","Gas from the oil fields below made sulphuric acid, which ate out huge rooms in an ancient reef.",[-104.44,32.15,2.4]],
  ["Benagil, Portugal","sea","Waves armed with sand and pebbles cut it into the cliffs; its roof has a hole open to the sky.",[-8.43,37.09,2.4]],
  ["Kazumura Cave, Hawaii","lava","A lava tube: a crust cooled over a river of lava, and the lava drained away.",[-155.1,19.55,2.4]],
  ["Son Doong, Vietnam","rain","A river dissolved the limestone; where the roof fell in, a forest grows inside.",[106.29,17.46,2.4]],
  ["Fingal’s Cave, Scotland","sea","The sea cut it into columns of cooled lava: the rock is lava, but the waves made the cave.",[-6.34,56.43,2.4]],
  ["Postojna Cave, Slovenia","rain","Rain soaking into the Kras plateau’s limestone, the place that gave karst its name.",[14.2,45.78,2.4]],
  ["Thurston Lava Tube, Hawaii","lava","Another lava tube, on Kīlauea; visitors walk right through it.",[-155.24,19.41,2.4]]],
 end:()=>"Most caves are dissolved out of limestone by water, but lava, the sea and even acid rising from below make them too."});

/* ======================================================================== weather */
/* ---- Belts of wind: sail a ship from the Arctic to the Southern Ocean down the middle of the Atlantic and see which
   wind fills its sails. Bands from NOAA JetStream, "Global Atmospheric Circulations" (air at low latitudes moves
   towards the equator; high pressure at about 30° N/S; westerly winds between 35° and 60° N/S; polar easterlies
   moving out from the polar highs) and the stop's own pins (doldrums, trade winds, horse latitudes, westerlies).
   The bands shift with the seasons, so the edges are rounded. */
const BELTS={tours:["weather"],title:"Belts of wind",globe:true,tip:"Drag the slider to sail north or south down the Atlantic. Which wind fills your sails?",
 card(L){return'<div class="rvt-row"><span class="rvt-val rvt-lat"></span><input type="range" class="rvt-rng" min="-70" max="70" step="1" value="45" aria-label="Latitude"></div><div class="rvt-src">The arrow shows which way the wind blows.</div>'},
 band(lat){const a=Math.abs(lat),N=lat>=0;
  if(a<5)return["The doldrums",null,"Calm, sticky air rising over the equator: sailing ships could sit here for weeks without wind."];
  if(a<25)return[N?"North-east trade winds":"South-east trade winds",N?[-1,-.55]:[-1,.55],"Steady winds blowing back towards the equator, bent west by the spinning Earth. Columbus rode them to the Caribbean in 1492."];
  if(a<35)return["The horse latitudes",null,"Sinking, dry air and light winds, about 30° from the equator: many deserts lie under this belt."];
  if(a<60)return["The westerlies",N?[1,.45]:[1,-.45],N?"Winds from the south-west carry storms towards Europe: Columbus sailed home on them.":"Winds from the north-west, with almost no land to stop them: the Roaring Forties."];
  return["Polar easterlies",N?[-1,-.4]:[-1,.4],"Cold air flowing out from the poles, from the east."]},
 init(L){L.lat=45;L.ship=svgEl(L.svg,"circle",{r:"8",class:"rvt-ship"});L.ar=svgEl(L.svg,"path",{class:"rvt-arrow"});L.tag=tag(L,"rvt-ctag")},
 draw(L){const ll=[-30,L.lat],q=proj(L,ll);if(!q){L.ship.style.display="none";L.ar.setAttribute("d","");putTag(L,L.tag,null);return}
  L.ship.style.display="";L.ship.setAttribute("cx",q[0].toFixed(1));L.ship.setAttribute("cy",q[1].toFixed(1));const b=this.band(L.lat);
  if(b[1]){const k=7,a=proj(L,[ll[0]-b[1][0]*k,ll[1]-b[1][1]*k]),z=proj(L,[ll[0]+b[1][0]*k,ll[1]+b[1][1]*k]);
   if(a&&z){const dx=z[0]-a[0],dy=z[1]-a[1],n=Math.hypot(dx,dy)||1,ux=dx/n,uy=dy/n;L.ar.setAttribute("d","M"+a[0].toFixed(1)+" "+a[1].toFixed(1)+"L"+z[0].toFixed(1)+" "+z[1].toFixed(1)+"M"+(z[0]-12*ux+7*uy).toFixed(1)+" "+(z[1]-12*uy-7*ux).toFixed(1)+"L"+z[0].toFixed(1)+" "+z[1].toFixed(1)+"L"+(z[0]-12*ux-7*uy).toFixed(1)+" "+(z[1]-12*uy+7*ux).toFixed(1))}else L.ar.setAttribute("d","")}else L.ar.setAttribute("d","");
  putTag(L,L.tag,proj(L,ll,1),esc(b[0]),14)},
 wire(L){const c=L.card,r=c.querySelector(".rvt-rng");r.oninput=()=>{L.lat=+r.value;L.dirty=1;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const v=L.lat;c.querySelector(".rvt-lat").textContent=Math.abs(v)+"° "+(v>0?"N":v<0?"S":"");const b=this.band(v);say(L,b[0],b[2])}};

/* ---------------- guess first (geoflock-tourplay.js veils the headline and asks for an estimate) ----------------
   Mawsynram: about 11,871 mm a year (Wikipedia, "Mawsynram"), the stop's own 11.9 m. Commonwealth Bay: the stop's own
   figure, winds averaging about 80 km/h over the year (Wikipedia, "Commonwealth Bay"). Naica: "the largest crystals
   ... 12 m in length" (Wikipedia, "Cave of the Crystals"), as the stop's headline says. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const GS={"weather|The wettest place":{q:"About how much rain falls on Mawsynram in an average year? (London gets about 0.6 m.)",min:1,max:30,ans:11.9,unit:" m",step:0.1,show:"about 11.9 m, as deep as a four-storey building"},
  "weather|The windiest place":{q:"Averaged over a whole year, about how fast does the wind blow at Commonwealth Bay?",min:5,max:200,ans:80,unit:" km/h",step:5,show:"about 80 km/h, as fast as a car on a main road, all year round"},
  "caves|Cave of the Crystals":{q:"How long are the biggest crystals in Naica’s Cave of the Crystals?",min:1,max:50,ans:12,unit:" m",step:1,show:"up to about 12 m, as long as a bus"}};
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

const DEFS=[SUMMITS,YOUNGOLD,RTOP,SHIELD,LIVING,WHYV,HOWCAVE,BELTS];


let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvt-layer rvt-layer";el.innerHTML='<svg class="rvt-sv"><defs><clipPath id="rvtDisc"><path class="rvt-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvtDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvt-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvt-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvt-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvt-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvt-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvt-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvt-ctl"))unmount()}catch(e){}},300);
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
.rvt-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvt-sv{position:absolute;left:0;top:0;overflow:visible}
.rvt-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvt-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvt-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvt-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvt-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvt-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvt-btn[hidden]{display:none}
.rvt-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvt-ep b{display:block;font-size:15px}
.rvt-ep.rvt-new{animation:rvtIn .45s ease}@keyframes rvtIn{from{opacity:.2;transform:translateY(4px)}}
.rvt-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvt-sortq i{font-style:normal}
.rvt-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvt}
.rvt-rank li{position:relative;counter-increment:rvt;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvt-rank li::before{content:counter(rvt);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvt-rank li.rvt-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvt-rank li.rvt-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvt-nm{flex:1 1 auto;z-index:1}.rvt-v{z-index:1;font-weight:800;white-space:nowrap}
.rvt-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvt-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvt-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvt-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvt-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvt-do,:is(body.dark-theme,body.sky-night) .rvt-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvt-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvt-btn,:is(body.dark-theme,body.sky-night) .rvt-chip,:is(body.dark-theme,body.sky-night) .rvt-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvt-rank li.rvt-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvt-rank li.rvt-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvt-bar{background:rgba(255,178,122,.2)}
.rvt-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvt-rng{flex:1 1 auto;accent-color:#d9682b}.rvt-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvt-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvt-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvt-item{font-size:16px;color:#13294b}
.rvt-bins{display:flex;gap:6px;flex-wrap:wrap}.rvt-bins .rvt-btn[hidden]{display:none}.rvt-bin:disabled{cursor:default;opacity:.55}
.rvt-btn.rvt-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvt-btn.rvt-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvt-dots{display:flex;gap:4px;margin-top:8px}.rvt-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvt-dots i.rvt-now{box-shadow:0 0 0 2px #d9682b inset}.rvt-dots i.rvt-y{background:#1f8a4c}.rvt-dots i.rvt-x{background:#c2364f}
.rvt-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvt-sl .rvt-row{margin-top:2px}.rvt-sl .rvt-val{min-width:36px}
.rvt-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvt-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvt-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvt-out b{font-size:15px;color:#9a4a16}
.rvt-ch{display:block;width:100%;height:auto;margin-top:6px}.rvt-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvt-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvt-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvt-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvt-val,:is(body.dark-theme,body.sky-night) .rvt-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvt-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvt-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvt-n,:is(body.dark-theme,body.sky-night) .rvt-sl label,:is(body.dark-theme,body.sky-night) .rvt-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvt-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvt-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvt-dots i{background:rgba(255,255,255,.18)}
.rvt-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvt-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvt-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvt-dd circle.rvt-near{fill:#d9682b;opacity:1}
.rvt-pump{cursor:pointer;outline:none}.rvt-pump .rvt-hit{fill:transparent}.rvt-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvt-pump:hover rect,.rvt-pump:focus rect{fill:#13294b}.rvt-pump.rvt-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvt-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvt-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvt-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvt-kd{background:#2a2f3a}.rvt-kp{background:#2a78d0;border-radius:2px!important}.rvt-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvt-key2{color:#aab6c8}
.rvt-btn.rvt-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvt-btn.rvt-cur{background:#9fc3ff;color:#13294b}
.rvt-band{fill:rgba(217,104,43,.1)}.rvt-area{fill:rgba(42,120,208,.22);stroke:#2a78d0;stroke-width:1.5;stroke-linejoin:round}.rvt-dashed{fill:none;stroke:#8a98a8;stroke-dasharray:3 3}
line.rvt-now{stroke:#d9682b;stroke-width:1.5}.rvt-dot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
:is(body.dark-theme,body.sky-night) .rvt-area{fill:rgba(159,195,255,.22);stroke:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvt-band{fill:rgba(255,178,122,.12)}
:is(body.dark-theme,body.sky-night) .rvt-btn.rvt-good{background:#1f8a4c;border-color:#4cc27f;color:#fff}:is(body.dark-theme,body.sky-night) .rvt-btn.rvt-bad{background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvt-dots i.rvt-y{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvt-dots i.rvt-x{background:#ff7088}:is(body.dark-theme,body.sky-night) .rvt-dots i.rvt-now{box-shadow:0 0 0 2px #ffb27a inset}
.rvt-ring{fill:rgba(255,209,102,.3);stroke:#d9682b;stroke-width:3}
.rvt-race{display:flex;flex-direction:column;gap:6px;margin:4px 0}
.rvt-lane{display:grid;grid-template-columns:1fr auto;align-items:end;column-gap:8px;row-gap:3px;font-size:13px;font-weight:800;color:#13294b}
.rvt-lane span{line-height:1.1}.rvt-lane small{display:inline;margin-left:5px;font-size:10.5px;font-weight:700;color:#5b6b7c}
.rvt-rb{display:block;height:14px;border-radius:7px;background:#d9682b;transition:width .7s ease;grid-column:1/-1;grid-row:2;justify-self:start}
.rvt-stl,.rvt-b1{background:#2a78d0}.rvt-num{font-size:13px;color:#13294b;min-width:72px;text-align:right}
.rvt-src{font-size:11px;color:#5b6b7c;margin-top:4px}
.rvt-atl{fill:rgba(217,104,43,.25);stroke:#d9682b;stroke-width:2}.rvt-bcn{fill:rgba(42,120,208,.35);stroke:#2a78d0;stroke-width:2}
.rvt-cmp[hidden]{display:none}
:is(body.dark-theme,body.sky-night) .rvt-lane,:is(body.dark-theme,body.sky-night) .rvt-num{color:#fff}
:is(body.dark-theme,body.sky-night) .rvt-lane small,:is(body.dark-theme,body.sky-night) .rvt-src{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvt-stl,:is(body.dark-theme,body.sky-night) .rvt-b1{background:#6fa8ff}
.rvt-road{fill:#9aa3ad}.rvt-blk{fill:#e8c9a0;stroke:#b08a5a;stroke-width:1}.rvt-in{fill:#9aa3ad;transition:fill .6s}.rvt-car{fill:#c2364f;transition:opacity .5s}
.rvt-trees{opacity:0;transition:opacity .6s}.rvt-tree{fill:#2f9e5b}
.rvt-sb.rvt-on .rvt-in{fill:#bfe3b4}.rvt-sb.rvt-on .rvt-trees{opacity:1}.rvt-sb.rvt-on .rvt-cin{opacity:0}
.rvt-sbk .rvt-car,.rvt-sbk .rvt-tree{opacity:1}
:is(body.dark-theme,body.sky-night) .rvt-road,:is(body.dark-theme,body.sky-night) .rvt-in{fill:#5b6573}:is(body.dark-theme,body.sky-night) .rvt-sb.rvt-on .rvt-in{fill:#3f7a4f}
.rvt-ship{fill:#fff;stroke:#13294b;stroke-width:3}.rvt-arrow{fill:none;stroke:#d9682b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
:is(body.dark-theme,body.sky-night) .rvt-ship{stroke:#9fc3ff}
/* while a guess-first question hides a stop's headline, the measuring ruler's distance label (index.html's .psc-lab)
   is hidden too: on the Andes and Mammoth Cave stops it showed the very answer being guessed */
body:has(.ps-card.tp-veil) .psc-lab{visibility:hidden}
`;document.head.appendChild(s)}

window.gfPolishRvt={v:1,FIX,viewOf:S=>VIEWED.get(S),tours:MYT,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
