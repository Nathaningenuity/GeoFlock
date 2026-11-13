/* GeoFlock polish RV-L: a stop-by-stop review of the four Political geography tours of AP Human Geography unit 4:
   States, nations and boundaries (hg4a), Forces that bind and divide (hg4b), Power beyond the state (hg4c) and Lines on
   land, sea and ballot (hg4d), each looked at on the globe, their default mode, at 1280×860.
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours starts (to
      the stops psSteps() builds as well). Each fix says why; changed facts cite their source.
   2. Stops you can play with (listed at the start of part 2).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rvl.js, whose structure and helpers
   this file copies under "rvl" names so the two never touch each other's controls) the fixed fields are made fixed,
   non-configurable getters whose setters are ignored. A field that is already non-configurable is left alone.
   On every Politics map stop the tour's map key sits in the globe's top right corner (about x 714–992, y 211–394 at
   1280×860), so framing here keeps the stop's place below or left of it. */
(function(){
"use strict";
if(window.gfPolishRvl)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvlTest or ?rvltest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvlTest||/[?&]rvltest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* drop the text pins / photo pins whose label matches */
const DROP=(S,re)=>{const P=S.pins||[];const Q=P.filter(p=>!re.test(pinText(p)));if(Q.length!==P.length)LOCK(S,"pins",Q)};
const DROPPH=(S,re)=>{const P=S.phPins||[];const Q=P.filter(p=>!re.test(strip(p&&p.label)));if(Q.length!==P.length)LOCK(S,"phPins",Q)};
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
const FIX={
 hg4a:{
  /* the six photos span the world (New York, Edinburgh, the Korean DMZ, the 49th parallel, Berlin, Taipei): the globe
     turned to their middle, the North Pole; New York and the 49th parallel hung from under the card and Korea and
     Taipei off the bottom of the screen. Each has its own stop later; the two European ones are framed */
  "States, nations and boundaries":S=>{DROPPH(S,/^(UN headquarters|The Korean DMZ|The 49th|Taipei)/);VIEW(S,[4,50,1.6],"left")},
  /* Iceland and Japan, 157° of longitude apart, cannot both show beside the card: Iceland hung from under the card and
     its label sat on the map's toolbar, while Japan's label lay under the map key. Japan is framed; Iceland stays in the
     text and in the stop's game (part 2) */
  "State, nation, nation-state":S=>{DROP(S,/^Iceland/);VIEW(S,[136,35,1.5],"left")},
  /* the card was switched to the right at run time, and the United Kingdom sat at the globe's top edge, its label on
     the map-type buttons; framed lower, Tatarstan's label still lay under the map key */
  "Multinational states":S=>VIEW(S,[30,58,1.25],"left"),
  /* "North Korea" and "South Korea" were each labelled twice, by a flag tag and a plain label. The ruler's ends are the
     DMZ's two ends, 220 km apart in a straight line, while the text said it was about 250 km long "(drag the ruler)":
     the zone itself is longer because it winds (Wikipedia, "Korean Demilitarized Zone": "250 kilometers (160 mi) long and
     about 4 kilometers wide"). Both figures are now given */
  "Multistate nations":S=>{FLAGDUP(S);RE(S,"body","about 250 km long (drag the ruler)","about 250 km long as it winds, though its two ends are about 220 km apart in a straight line (drag the ruler)")},
  /* the Cappadocia photo's long label was cut to "Turkish-speaking…" under its square */
  "Swapped by religion":S=>PHLABEL(S,/^Cappadocia/,"Cappadocia"),
  /* Pakistan's pin was under the card */
  "Subsequent boundaries":S=>VIEW(S,[76,25,1.68],"left"),
  /* the Somali label sat at the globe's right edge, and, framed further east, its long text still ran under the big
     map key; shortened (the text names the four states) */
  "Superimposed boundaries":S=>{VIEW(S,[32,10,1.35],"left");RENAME(S,/^Somali people/,"Somalis: split up")},
  /* the north half of Egypt, with its "Egypt" and "25th meridian" labels, lay under the map key */
  "Geometric boundaries":S=>VIEW(S,[28,28,2.6],"left"),
  /* the "Saudi Arabia" label lay under the map key */
  "A frontier, not a line":S=>VIEW(S,[47,21,3.2],"left")
  },
 hg4b:{
  /* the seven photos span the world (Tokyo, Brussels, Edinburgh, Quebec, Hong Kong, Mostar, Mogadishu): the globe turned
     to their middle, which was Antarctica. Each has its own stop later; the three European ones are framed */
  "Forces that bind and divide":S=>{DROPPH(S,/^(Japan|Quebec|Hong Kong|Mogadishu)/);VIEW(S,[10,48,1.6],"left")},
  /* a plain "Nigeria" label repeated the map's own and hung on a long leader across the country */
  "From 3 regions to 36 states":S=>DROP(S,/^Nigeria$/),
  /* Vladivostok, the ruler's far end, sat at the globe's edge */
  "Size and distance from the capital":S=>VIEW(S,[96,50,1.05],"left"),
  /* France, the United States and India are spread round the world: the globe turned to their middle, over the Arctic,
     with the US label under the card. The stop opens on France; its game (part 2) turns the globe to each country */
  "Unitary and federal states":S=>{AREA(S,/^(USA|India)/);VIEW(S,[4,46,1.5],"left")},
  /* Greenland and Hong Kong are half a world apart: the Hong Kong photo hung from under the card and Greenland's label
     sat on the toolbar. The stop opens on Greenland, with the drag-Denmark ghost; buttons (part 2) turn the globe to
     Hong Kong, which gets a plain label in place of its photo. (Framed on Greenland itself, the card shift swung it up under the map key; aimed east of it, it lands
     in the middle) */
  "Autonomous regions":S=>{DROPPH(S,/^Hong Kong/);ADDAREA(S,[114.17,22.3],"Hong Kong");VIEW(S,[0,62,1.3],"left")},
  /* Quebec and Spain, 75° of longitude apart, cannot both show beside the card: Quebec sat at the globe's edge. The
     stop opens on Spain's two regions; buttons (part 2) turn the globe to Quebec */
  "Separatism, by ballot or by bomb":S=>{AREA(S,/^Quebec/);VIEW(S,[-1,42,3.6],"left")},
  /* Hargeisa's label lay under the map key */
  "Failed states":S=>VIEW(S,[46,7,3.6],"left")
  },
 hg4c:{
  /* the card was switched to the right at run time, and the six photos (Hargeisa, Suez, Strasbourg, Brussels, Addis
     Ababa and New York) piled up on the left under the big map key, New York round the back. Each has its own stop;
     the four in Europe, the Middle East and Ethiopia are framed beside the card (Hargeisa, next to Addis Ababa, hung
     off the globe's edge) */
  "Empires, power and unions":S=>{DROPPH(S,/^(New York|Hargeisa)/);VIEW(S,[30,30,1.2],"left")},
  /* the Ethiopia label ran under the big map key (the card shift turns the globe a long way at this zoom, so the view
     is aimed east of the middle of Africa) */
  "Colonialism and imperialism":S=>{VIEW(S,[30,5,1.1],"left");RENAME(S,/^Ethiopia/,"Ethiopia: independent")},
  /* plain "Tanzania" and "Zambia" labels repeated the map's own on long leaders, and Dar es Salaam sat by the map key */
  "China’s railway to the copper belt":S=>{DROP(S,/^(Tanzania|Zambia)$/);VIEW(S,[38,-10,3],"left")},
  /* the eastern "Rimland" label sat at the globe's edge under the big map key */
  /* framed further east, the western "Rimland" label (hung from Iraq) fell under the card; it hangs from Iran instead */
  "The heartland":S=>{VIEW(S,[95,45,1.25],"left");const P=S.pins||[];if(P.some(p=>Array.isArray(p)&&Array.isArray(p[0][0])&&p[0][0][0]===45))LOCK(S,"pins",P.map(p=>Array.isArray(p)&&Array.isArray(p[0][0])&&p[0][0][0]===45?[[[56,31]]].concat(p.slice(1)):p))},
  /* Vietnam sat at the globe's edge under the big map key: 83° of longitude from Eastern Europe, it cannot share the
     view beside the card. Its pin goes (the text names it; the map labels it) */
  "Shatterbelts":S=>{DROP(S,/^Vietnam/);VIEW(S,[62,34,1.15],"left")},
  /* the Strait of Malacca photo sat at the globe's edge under the big map key; 70° of longitude from Suez, it cannot
     share the view beside the card, so the stop frames the three choke points of its text (Suez, Bab-el-Mandeb,
     Hormuz) and Malacca stays in "Tell me more" */
  "Choke points":S=>{DROPPH(S,/^Strait of Malacca/);VIEW(S,[62,18,1.3],"left")},
  /* the African Union and ASEAN, 85° of longitude apart: the globe turned to the Indian Ocean between them, with
     ASEAN and Jakarta under the card (switched to the right at run time) and Addis Ababa at the globe's edge. The stop
     opens on Africa; buttons (part 2) turn the globe to Southeast Asia */
  "Regional unions":S=>{AREA(S,/^Jakarta/);VIEW(S,[22,5,1.3],"left")}
  },
 hg4d:{
  /* the six photos span the world (Tijuana, the Korean DMZ, Dover, Chile, Lesotho, Bolivia): Korea and Chile were round
     the back, Tijuana under the card and Lesotho and Bolivia off the bottom of the screen. Tijuana and Bolivia are
     framed (Chile's photo, at its southern tip, still fell off the bottom); the others have their own stops */
  "Lines on land, sea and ballot":S=>{DROPPH(S,/^(The Korean DMZ|Dover|Lesotho|Chile)/);VIEW(S,[-78,10,1],"left")},
  /* the "South China Sea" label lay across the ruler's far end */
  "Exclusive economic zones":S=>MOVE(S,/^South China Sea/,[115.5,15.5]),
  /* Chile, Rwanda and Poland are spread over half the world: Rwanda sat at the globe's edge and Poland under the map
     key. The stop opens on Chile and its true-size ghost; buttons (part 2) turn the globe to the other two */
  "Compact and elongated states":S=>{AREA(S,/^Compact/);VIEW(S,[-45,-15,1.1],"left")},
  /* Indonesia, 90° of longitude from southern Africa, sat at the globe's edge under the big map key, and plain
     "Namibia" and "South Africa" labels repeated the map's own on long leaders. The stop opens on southern Africa;
     buttons (part 2) turn the globe to Indonesia */
  "Fragmented, prorupted and perforated":S=>{DROP(S,/^(Namibia|South Africa)$/);AREA(S,/^Fragmented/);VIEW(S,[29,-20,2.2],"left")},
  /* the Texas label ran under the big map key, and a plain "United States" label repeated the map's own */
  "Redistricting":S=>{DROP(S,/^United States$/);VIEW(S,[-86,38,1.8],"left")},
  /* Essex County sat at the globe's edge, its label under the map key; the same doubled "United States" label */
  "Drawing the voting map":S=>{DROP(S,/^United States$/);VIEW(S,[-84,47,1.8],"left")}
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;
 /* every stop's card on the left: on the right (as some stops were switched at run time, after a tour question) it lay
    under the map key, which covered its title, and the stop's place went under the card */
 if(S.card!=="left")LOCK(S,"card","left");const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvl fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps());/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f)f(S)}catch(e){}}catch(e){}},300);
try{applyAll()}catch(e){}setTimeout(applyAll,1500);setTimeout(applyAll,6000);

/* The card shift, kept (as geoflock-polish-rvb.js, -rvf.js and -rvl.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for four seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["hg4a","hg4b","hg4c","hg4d"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".gc3-ctl,.ge2-ctl,.rvl-ctl[data-turns]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: stops you can play with
   Same pattern as geoflock-polish-rvl.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction, and removes everything as soon as the stop changes or
   the tour ends. Next and Back are never blocked; every step is wrapped in try/catch. CSS classes start with "rvl-".
   - hg4a | "State, nation, nation-state": nation-state, multinational state, multistate nation or stateless nation?
   - hg4a | "Swapped by religion": six families in 1923: sent to Greece, sent to Turkey, or allowed to stay?
   - hg4a | "The border that melted": name the type of eight real boundaries (some are two types at once).
   - hg4b | "Unitary and federal states": unitary or federal? Each answer turns the globe to the country.
   - hg4b | "Balkanisation": put Yugoslavia's seven successors in order of independence.
   - hg4b | "Autonomous regions", "Separatism, by ballot or by bomb": buttons turn the globe between places half a world
            apart (Greenland and Hong Kong; Spain and Quebec).
   - hg4c | "The end of empires": drag (or play) through 1945–2011 and watch UN membership grow from 51 to 193.
   - hg4c | "Bigger than states": EU with the euro, EU with its own money, or outside? Sort nine countries.
   - hg4c | "Military alliances": put nine NATO members in the order they joined.
   - hg4c | "Regional unions": buttons turn the globe between the African Union and ASEAN.
   - hg4d | "How a border is made": put the four stages (defined, delimited, demarcated, administered) in order.
   - hg4d | "Compact and elongated states", "Fragmented, prorupted and perforated": buttons turn the globe between
            shapes half a world apart (Chile, Rwanda, Poland; southern Africa and Indonesia).
   - hg4d | "Enclaves and exclaves": enclave or exclave? Sort seven places.
   - hg4d | "Landlocked states": guess how many countries have no coast first (geoflock-tourplay.js). */
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
function tag(L,cls){const d=document.createElement("div");d.className="rvl-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvl-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvl-new");void e.offsetWidth;e.classList.add("rvl-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,below:!!cfg.below,tip:cfg.tip,
 card(L){return'<div class="rvl-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvl-rank"></ol><div class="rvl-pool"></div>'+
  '<div class="rvl-btns"><button type="button" class="rvl-btn rvl-undo">Undo</button><button type="button" class="rvl-btn rvl-show">Show me</button><button type="button" class="rvl-btn rvl-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvl-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvl-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvl-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvl-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvl-ok":"rvl-no"):"")+'"><span class="rvl-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvl-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvl-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvl-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvl-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvl-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvl-show").hidden=L.shown;c.querySelector(".rvl-again").hidden=!L.shown;
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
 card(L){return'<div class="rvl-q"><span class="rvl-n"></span><b class="rvl-item"></b></div><div class="rvl-bins">'+cfg.kinds.map(k=>'<button type="button" class="rvl-btn rvl-bin" data-k="'+k[0]+'">'+esc(k[1])+'</button>').join("")+'</div>'+
  '<div class="rvl-dots">'+cfg.items.map(()=>"<i></i>").join("")+'</div><div class="rvl-btns"><button type="button" class="rvl-btn rvl-next" hidden>Next ▶</button><button type="button" class="rvl-btn rvl-again" hidden>Play again</button></div>'},
 wire(L){const c=L.card;L.k=0;L.res=[];L.ans=null;const N=cfg.items.length;
  c.querySelectorAll(".rvl-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=N)return;L.ans=b.dataset.k;L.res[L.k]=OK(cfg.items[L.k]).includes(L.ans);const at=cfg.items[L.k][3];if(cfg.turns&&at)turnGlobe(at[0],at[1],at[2]);this.render(L)});
  c.querySelector(".rvl-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvl-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,end=L.k>=N,it=cfg.items[Math.min(L.k,N-1)],ok=OK(it);
  c.querySelector(".rvl-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvl-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvl-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvl-good",!!L.ans&&ok.includes(b.dataset.k));b.classList.toggle("rvl-bad",!!L.ans&&b.dataset.k===L.ans&&!ok.includes(L.ans))});
  c.querySelectorAll(".rvl-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvl-y":L.res[i]===false?"rvl-x":i===L.k&&!end?"rvl-now":"");
  c.querySelector(".rvl-next").hidden=end||!L.ans;c.querySelector(".rvl-next").textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvl-again").hidden=!end;
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": a perfect score!":r>=N-2?": well done.":""),cfg.end(r,N))}
  else if(!L.ans)say(L,"",cfg.ask);
  else if(ok.includes(L.ans))say(L,"Right: "+(ok.length>1?ok.map(nm).join(" and "):nm(L.ans)),it[2]);
  else say(L,"Not quite: "+ok.map(nm).join(" and "),it[2])}}}

/* ======================================================================== 1. Which kind of place? (hg4a)
   The four terms of the stop's own diagram, sorted with the tour's own examples (Iceland, Japan, the UK, Russia, the
   Kurds, the Koreans, from this and the next stops; the Tibetans and Belgium, from the "Stateless nations" stop and the
   next tour). The Kurds count as either a stateless or a multistate nation: they are both. */
const NATIONS=CLASSIFY({tours:["hg4a"],title:"State, nation, nation-state",
 tip:"Use the diagram: which kind is each of these?",ask:"Nation-state, multinational state, multistate nation or stateless nation?",
 kinds:[["ns","Nation-state","a nation-state"],["mn","Multinational state","a multinational state"],["ms","Multistate nation","a multistate nation"],["sl","Stateless nation","a stateless nation"]],
 items:[["Iceland: almost everyone is Icelandic and speaks Icelandic","ns","One nation fills one state, with almost no one left out: as close to a nation-state as it gets."],
  ["The United Kingdom: English, Scots, Welsh and Northern Irish","mn","One state holds four nations, each with its own identity (and its own football team)."],
  ["Koreans: one language and history, split between two countries","ms","One nation, two states: North and South Korea, divided since 1945."],
  ["The Kurds: 30 to 40 million people across Turkey, Iraq, Iran and Syria",["sl","ms"],"A nation with no state of its own, so they are a stateless nation; spread over four states, they are a multistate nation too. Both count."],
  ["Japan: one main language and a strong shared identity","ns","Nearly everyone shares one language and identity: a near nation-state."],
  ["Russia: around 190 ethnic groups","mn","Tatars, Chechens and many more live in one state, some with their own republics."],
  ["The Tibetans: a people inside China, with no state of their own","sl","A nation without a state: Tibet is a region of China."],
  ["Belgium: Dutch-speaking Flemings and French-speaking Walloons","mn","Two main nations share one state (the next tour looks at how that strains it)."]],
 end:()=>"A state is a country with borders; a nation is a people. Nation-state: one fits the other. Multinational: one state, many nations. Multistate: one nation, many states. Stateless: a nation with none."});

/* ======================================================================== 2. Who had to move in 1923? (hg4a)
   The Convention Concerning the Exchange of Greek and Turkish Populations, signed at Lausanne on 30 January 1923:
   Article 1 orders the compulsory exchange of "Turkish nationals of the Greek Orthodox religion established in Turkish
   territory" and "Greek nationals of the Moslem religion established in Greek territory"; Article 2 exempts "the Greek
   inhabitants of Constantinople" (settled there before 30 October 1918) and "the Moslem inhabitants of Western Thrace".
   The Turkish-speaking Orthodox Christians of Cappadocia (the Karamanlides) and the Greek-speaking Muslims of Crete are
   the stop's own examples. */
const SWAP=CLASSIFY({tours:["hg4a"],title:"Swapped by religion",
 tip:"You are a 1923 official. Where does each family have to go?",ask:"Sent to Greece, sent to Turkey, or allowed to stay?",
 kinds:[["gr","Sent to Greece","sent to Greece"],["tr","Sent to Turkey","sent to Turkey"],["stay","Allowed to stay","allowed to stay"]],
 items:[["Orthodox Christians in Cappadocia, Turkey, who speak only Turkish","gr","Religion decided, not language: Orthodox Christians in Turkey had to go to Greece, even if they spoke no Greek."],
  ["Muslims in Crete, Greece, who speak Greek at home","tr","Muslims in Greece had to go to Turkey, even though Greek was their own language."],
  ["Muslims in Thessaloniki, Greece, who speak Turkish","tr","Muslims in Greece were sent to Turkey."],
  ["Greek Orthodox Christians in Constantinople (Istanbul)","stay","The treaty let the Greeks of Constantinople stay, as long as they had settled there before 30 October 1918."],
  ["Greek-speaking Orthodox Christians on Turkey’s Black Sea coast","gr","Orthodox Christians in Turkey had to leave, though their families had lived there for centuries."],
  ["Muslims in Western Thrace, in north-east Greece","stay","In return for Istanbul’s Greeks, the Muslims of Western Thrace could stay. Their community still lives there today."]],
 end:()=>"The rule was religion: Orthodox Christians in Turkey went to Greece, Muslims in Greece went to Turkey. Only the Greeks of Istanbul and the Muslims of Western Thrace were exempt, as hostages for each other."});

/* ======================================================================== 3. Name that boundary (hg4a)
   The tour's own boundary types and examples (the 49th parallel, Partition, the Berlin Wall, the 22nd parallel, the
   Alpine watershed, the Somali lands), plus the Rio Grande (the US–Mexico border along the river, set by the Treaty of
   Guadalupe Hidalgo, 1848) and Hadrian's Wall (built from AD 122, the northern frontier of Roman Britain). Egypt's 22nd
   parallel border was set by Britain and Egypt in the Anglo-Egyptian condominium agreement of 19 January 1899, so it
   is superimposed as well as geometric. Borders are often two types at once, and either answer counts. */
const BTYPES=CLASSIFY({tours:["hg4a"],title:"The border that melted",below:true,
 tip:"Review: name the type of each boundary. Some are two types at once.",ask:"Which type of boundary is it?",
 kinds:[["ante","Antecedent","antecedent"],["subs","Subsequent","subsequent"],["sup","Superimposed","superimposed"],["relic","Relic","relic"],["geo","Geometric","geometric"],["phys","Physical","physical"]],
 items:[["The US–Canada border along the 49th parallel, agreed in 1846 before most settlers came",["ante","geo"],"Antecedent, because it came before most people settled, and geometric, because it follows a line of latitude."],
  ["The India–Pakistan border, drawn in 1947 between Muslim- and Hindu-majority areas","subs","Subsequent: drawn after people settled, along a cultural line (so also called consequent)."],
  ["Hadrian’s Wall, across northern England","relic","A relic: it marked the edge of Roman Britain and no longer divides anything."],
  ["Egypt’s border with Sudan along the 22nd parallel",["geo","sup"],"Geometric, a line of latitude, and superimposed: Britain and Egypt drew it in 1899."],
  ["The Rio Grande between Texas and Mexico","phys","Physical: the border follows the river."],
  ["The borders that split the Somali people between four states","sup","Superimposed by colonial powers, who cared little who lived there."],
  ["The line of the Berlin Wall, still marked in the streets","relic","A relic: the wall fell in 1989, but its line can still be traced."],
  ["The Italy–Switzerland border along the Alpine watershed","phys","Physical: it follows the mountain crest where meltwater divides, which is why it moved when the glacier melted."]],
 end:()=>"Antecedent and subsequent say when a border was drawn; superimposed says who drew it; geometric and physical say what it follows; relic says it no longer works. So one border can be two types."});
function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.35;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}
/* a row of buttons, one per place; the stop opens on the first. places: [name, lon, lat, zoom, text] */
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:true,tip:cfg.tip,
 card(L){return'<div class="rvl-btns rvl-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvl-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvl-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvl-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvl-cur",k===L.at);b.textContent=(k===L.at?"● ":"Turn to ")+cfg.places[k][0]});
  const f=cfg.places[L.at];say(L,f[0],f[4])}}}

/* ======================================================================== 4. Unitary or federal? (hg4b)
   The stop's own eight countries: unitary France, China and Japan; federal United States, Germany, India, Brazil and
   Nigeria. Each answer turns the globe to the country, where the map (Federal or unitary) colours it. */
const UNIFED=CLASSIFY({tours:["hg4b"],title:"Unitary and federal states",turns:true,below:true,
 tip:"Unitary or federal? Each answer turns the globe to the country.",ask:"Is power held at the centre, or shared with states?",
 kinds:[["u","Unitary","unitary"],["f","Federal","federal"]],
 items:[["France","u","Paris runs the country; its regions and départements have only the powers the centre lends them.",[2.5,46.5,2]],
  ["United States","f","The 50 states have their own constitutions, laws and courts.",[-98,39,1.6]],
  ["China","u","Huge, but run from Beijing: its provinces answer to the centre.",[104,35,1.5]],
  ["India","f","28 states with their own elected governments: a federation for a big, diverse country.",[79,22,1.8]],
  ["Germany","f","16 Länder run schools, police and much more.",[10.4,51,2.6]],
  ["Japan","u","Its 47 prefectures carry out what Tokyo decides.",[138,36.5,2]],
  ["Brazil","f","26 states and a federal district, each with its own governor.",[-52,-10,1.5]],
  ["Nigeria","f","36 states, carved out to keep any one region from breaking away (two stops on).",[8,9.5,2.2]]],
 end:()=>"Big or very mixed countries tend to be federal; smaller, more uniform ones unitary. But China, huge and varied, is run from the centre."});

/* ======================================================================== 5. Seven countries from one (hg4b)
   Dates of independence (Wikipedia, "Breakup of Yugoslavia", and each country's article): Slovenia and Croatia
   declared independence on 25 June 1991, (North) Macedonia on 8 September 1991 (its referendum, now Independence
   Day), Bosnia and Herzegovina on 3 March 1992, Montenegro on 3 June 2006 and Serbia on 5 June 2006, after Montenegro
   left their union, and Kosovo on 17 February 2008 (recognised by about half the UN's members). */
const YUGO=SORT({tours:["hg4b"],title:"Balkanisation",
 tip:"Yugoslavia became seven countries. Put them in order of independence, first to last.",first:"First to go",last:"Last",desc:false,bars:false,
 items:[["Kosovo",2008.13,"17 Feb 2008"],["Slovenia",1991.48,"25 Jun 1991"],["Montenegro",2006.42,"3 Jun 2006"],["Bosnia and Herzegovina",1992.17,"3 Mar 1992"],["Serbia",2006.43,"5 Jun 2006"],["North Macedonia",1991.69,"8 Sep 1991"],["Croatia",1991.48,"25 Jun 1991"]],
 after:(n,N)=>"Slovenia and Croatia left on the same day in 1991, and war followed in Croatia and then Bosnia. The last pieces split off peacefully: Montenegro by referendum in 2006, leaving Serbia on its own, and then Kosovo, whose independence Serbia still rejects."});

/* ======================================================================== 6. Half a world apart (hg4b)
   Greenland and Hong Kong, and Quebec and Spain, cannot share one view beside the card. The texts are the stops' own;
   the Quebec margin is from the official 1995 result (Directeur général des élections du Québec: No 2,362,648,
   Yes 2,308,360, a gap of 54,288 votes). */
const TURN_AUTO=TURNER({tours:["hg4b"],title:"Autonomous regions",tip:"Two kinds of self-rule, half a world apart. Turn the globe from one to the other.",
 places:[["Greenland",0,62,1.3,"Wide self-government within the Kingdom of Denmark. Drag the purple Denmark, at its true size, across it."],
  ["Hong Kong",114.17,22.3,3,"Back in China since 1997 under “one country, two systems”; since the 2020 National Security Law its separate freedoms have been sharply narrowed."]]});
const TURN_SEP=TURNER({tours:["hg4b"],title:"Separatism, by ballot or by bomb",tip:"Turn the globe between Spain’s two separatist regions and Quebec.",
 places:[["Catalonia and the Basque Country",-1,42,3.6,"Catalonia’s 2017 vote was ruled illegal by Spain’s courts. In the Basque Country, ETA killed over 800 people before it dissolved in 2018."],
  ["Quebec",-71.2,47,2.4,"In 1995 Quebec voted to stay in Canada by about 50.6% to 49.4%: a gap of only about 54,000 votes out of 4.7 million."]]});

/* ======================================================================== 7. A world of new states (hg4c)
   United Nations, "Growth in United Nations membership, 1945–present" (un.org/en/about-us/growth-in-un-membership):
   members at the end of each year in which the total changed. 51 founders in 1945; 16 admitted together in 1955;
   17 in 1960, 16 of them in Africa; 20 in 1991–92 as the Soviet Union and Yugoslavia broke up; South Sudan, the 193rd,
   in 2011. */
const UNM=[[1945,51],[1946,55],[1947,57],[1948,58],[1949,59],[1950,60],[1955,76],[1956,80],[1957,82],[1960,99],[1961,104],[1962,110],[1963,113],[1964,115],[1965,117],[1966,122],[1967,123],[1968,126],[1970,127],[1971,132],[1973,135],[1974,138],[1975,144],[1976,147],[1977,149],[1978,151],[1979,152],[1980,154],[1981,157],[1983,158],[1984,159],[1991,166],[1992,179],[1993,184],[1994,185],[1999,188],[2000,189],[2002,191],[2006,192],[2011,193]];
const unAt=y=>{let n=UNM[0][1];for(const r of UNM){if(r[0]<=y)n=r[1];else break}return n};
const UNNOTE=[[1945,"51 founding members, many of them still colonial powers."],[1955,"16 states let in together in one deal, after years of Cold War vetoes."],
 [1957,"Ghana and Malaya join: the end of empires is under way."],[1960,"The Year of Africa: 17 new members in one year, 16 of them African."],[1961,"Decolonisation rolls on through Africa, the Caribbean and the Pacific."],
 [1976,"The last big wave: Portugal’s colonies, Angola and Mozambique among them, are now in."],[1984,"Growth slows: few colonies are left."],
 [1991,"The Soviet Union and Yugoslavia break up: 20 new members in two years."],[1993,"Membership is nearly complete."],[2011,"South Sudan becomes the 193rd and newest member."]];
const UNGROW={tours:["hg4c"],title:"The end of empires",globe:false,
 tip:"Drag through the years and watch the world fill with new states.",
 card(L){const X=y=>16+(y-1945)/(2011-1945)*276,Y=n=>86-n/200*78;let d="M"+X(1945)+" 86";for(let y=1945;y<=2011;y++)d+="L"+X(y).toFixed(1)+" "+Y(unAt(y)).toFixed(1);d+="L"+X(2011)+" 86Z";
  return'<svg class="rvl-ch" viewBox="0 0 300 100" role="img" aria-label="UN member states, 1945 to 2011"><rect class="rvl-band" x="'+X(1956).toFixed(1)+'" y="8" width="'+(X(1976)-X(1956)).toFixed(1)+'" height="78"/><text class="rvl-tx" x="'+X(1966).toFixed(1)+'" y="16" text-anchor="middle">Africa’s wave</text><path class="rvl-area" d="'+d+'"/><path class="rvl-ax" d="M16 8V86H292"/><path class="rvl-dashed" d="M16 '+Y(51).toFixed(1)+'H292"/>'+
  '<line class="rvl-now" x1="0" x2="0" y1="8" y2="86"/><circle class="rvl-dot" r="4"/><text class="rvl-tx" x="16" y="97">1945</text><text class="rvl-tx" x="292" y="97" text-anchor="end">2011</text><text class="rvl-tx" x="20" y="'+(Y(51)-3).toFixed(1)+'">51 founders</text></svg>'+
  '<div class="rvl-row"><input type="range" class="rvl-rng rvl-yr" min="1945" max="2011" step="1" value="1945" aria-label="Year"><b class="rvl-val rvl-yv"></b></div>'+
  '<div class="rvl-btns"><button type="button" class="rvl-btn rvl-play">▶ Play</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvl-yr");L.y=1945;r.oninput=()=>{L.y=+r.value;stop();this.render(L)};
  const stop=()=>{clearInterval(L.iv);L.iv=0;c.querySelector(".rvl-play").textContent="▶ Play"};
  c.querySelector(".rvl-play").onclick=()=>{if(L.iv){stop();return}if(L.y>=2011)L.y=1945;c.querySelector(".rvl-play").textContent="❚❚ Pause";
   L.iv=setInterval(()=>{if(!c.isConnected){stop();return}L.y=Math.min(2011,L.y+1);r.value=L.y;this.render(L);if(L.y>=2011)stop()},140)};
  L.off=()=>clearInterval(L.iv);this.render(L)},
 off(L){clearInterval(L.iv)},
 render(L){const c=L.card;if(!c)return;const y=L.y,n=unAt(y),X=16+(y-1945)/(2011-1945)*276,Yv=86-n/200*78;
  c.querySelector(".rvl-yv").textContent=y+": "+n;const ln=c.querySelector(".rvl-now");ln.setAttribute("x1",X.toFixed(1));ln.setAttribute("x2",X.toFixed(1));
  const dt=c.querySelector(".rvl-dot");dt.setAttribute("cx",X.toFixed(1));dt.setAttribute("cy",Yv.toFixed(1));
  let note=UNNOTE[0][1];for(const q of UNNOTE)if(q[0]<=y)note=q[1];
  say(L,n+" UN members in "+y+(n>51?" ("+(n-51)+" more than in 1945)":""),note)}};

/* ======================================================================== 8. In the club? (hg4c)
   EU membership and the euro as of 2026 (European Union, "EU countries" and "Countries using the euro",
   european-union.europa.eu): Germany and Ireland have used the euro since 1999 (notes and coins 2002); Croatia since
   1 January 2023; Poland (złoty), Sweden (krona) and Denmark (krone, by an opt-out agreed in 1992) are EU members with
   their own currencies; Norway voted no to joining in 1972 and 1994; Switzerland is outside, tied by bilateral deals;
   the UK left on 31 January 2020. */
const EUQ=CLASSIFY({tours:["hg4c"],title:"Bigger than states",below:true,
 tip:"In the club? Sort nine European countries.",ask:"In the EU and using the euro, in the EU with its own money, or outside?",
 kinds:[["e","EU + euro","in the EU, using the euro"],["o","EU, own money","in the EU with its own currency"],["n","Not in the EU","outside the EU"]],
 items:[["Germany","e","A founder of the EU’s forerunner in 1957, and of the euro."],["Norway","n","Norwegians voted no to joining twice, in 1972 and 1994, but it is in the single market through the European Economic Area."],
  ["Poland","o","An EU member since 2004 that still pays in złoty."],["Croatia","e","The newest EU member, since 2013, and it switched to the euro in 2023."],
  ["United Kingdom","n","It left in 2020 after the 2016 Brexit vote."],["Sweden","o","An EU member that has kept its krona."],
  ["Switzerland","n","Surrounded by EU members, but outside, tied by dozens of separate deals."],["Ireland","e","Euro since 1999, and an EU member since 1973."],
  ["Denmark","o","It negotiated the right to keep the krone in 1992."]],
 end:()=>"Pooling sovereignty comes in layers: the single market, then a shared currency. Some states take all of it, some part, and some stay out."});

/* ======================================================================== 9. NATO grows east (hg4c)
   Dates of accession (NATO, "NATO member countries", nato.int): founders, among them the US, 1949; Turkey (and
   Greece) 1952; West Germany 1955; Spain 1982; Poland (with Czechia and Hungary) 1999; Estonia (with six others) 2004;
   North Macedonia 2020; Finland 4 April 2023; Sweden 7 March 2024. */
const NATOQ=SORT({tours:["hg4c"],title:"Military alliances",below:true,
 tip:"NATO began with 12 members. Put these in the order they joined.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Poland",1999,"1999"],["Sweden",2024.2,"2024"],["United States",1949,"1949 (founder)"],["Spain",1982,"1982"],["Finland",2023.3,"2023"],["Turkey",1952,"1952"],["Estonia",2004,"2004"],["West Germany",1955,"1955"],["North Macedonia",2020,"2020"]],
 after:(n,N)=>"From 12 founders to 32 members: after the Cold War, NATO grew east into the old Soviet bloc, and Russia’s attacks on Ukraine pushed Finland and Sweden to give up decades of neutrality."});

/* the African Union and ASEAN cannot share a view beside the card; the texts are the stop's own */
const TURN_UNION=TURNER({tours:["hg4c"],title:"Regional unions",tip:"Two regional clubs, an ocean apart. Turn the globe from one to the other.",
 places:[["The African Union",22,5,1.3,"55 members, with its headquarters in Addis Ababa. It promotes trade and sends peacekeepers, as it has in Somalia."],
  ["ASEAN",112,8,1.6,"Southeast Asia’s club, from Myanmar to the Philippines, with its secretariat in Jakarta. It works by consensus."]]});

/* ======================================================================== 10. How a border is made (hg4d)
   The four stages of a boundary as the stop (and the AP Human Geography course) gives them, after Stephen B. Jones,
   "Boundary-Making" (1945), whose first stage he called allocation: defined in a treaty, delimited on a map, demarcated on the ground, administered. The US–Mexico
   examples: the Treaty of Guadalupe Hidalgo (1848) and the Gadsden Purchase (1853) defined the line; joint boundary
   commissions surveyed and mapped it (1849–55) and set the stone and iron monuments along it (1890s); guards and
   customs posts run it today. */
const STAGES=SORT({tours:["hg4d"],title:"How a border is made",below:true,
 tip:"Put the four stages of making the US–Mexico border in order.",first:"First",last:"Last",desc:false,bars:false,
 items:[["Demarcated: monuments, fences and walls go up on the ground",3,"on the ground"],["Defined: a treaty describes where the line runs",1,"in words"],["Administered: guards and customs control who and what crosses",4,"day to day"],["Delimited: surveyors draw the line on a map",2,"on a map"]],
 after:(n,N)=>"Words, then a map, then the ground, then people. For the US and Mexico: treaties in 1848 and 1853, surveys and maps in the 1850s, stone and iron monuments in the 1890s, and walls and border guards today."});

/* the shapes of states, half a world apart; texts are the stops' own */
const TURN_SHAPE=TURNER({tours:["hg4d"],title:"Compact and elongated states",tip:"Turn the globe to each shape.",
 places:[["Chile: elongated",-45,-15,1.1,"Over 4,000 km long but on average under 200 km wide. Drag the purple Chile, at its true size, onto Africa."],
  ["Rwanda: compact",30,-2,2.4,"Roughly round: no part of the country is far from the centre."],["Poland: compact",19,52,2.4,"Roughly round, so its regions are all close to Warsaw."]]});
const TURN_FRAG=TURNER({tours:["hg4d"],title:"Fragmented, prorupted and perforated",tip:"Turn the globe from southern Africa to Indonesia.",
 places:[["Namibia and South Africa",29,-20,2.2,"Namibia’s Caprivi Strip is a long arm, a proruption; South Africa is perforated by Lesotho, which it surrounds."],
  ["Indonesia: fragmented",118,-2,1.6,"About 17,000 islands, spread over more than 5,000 km of sea, to be held together as one state."]]});

/* ======================================================================== 11. Enclave or exclave? (hg4d)
   The stop's own examples (Lesotho, Vatican City, San Marino, Kaliningrad) and three more textbook exclaves: Alaska,
   separated from the rest of the US by Canada; Cabinda, separated from the rest of Angola by a strip of DR Congo; and
   Nakhchivan, separated from the rest of Azerbaijan by Armenia. */
const ENCL=CLASSIFY({tours:["hg4d"],title:"Enclaves and exclaves",below:true,
 tip:"Surrounded, or cut off? Sort seven places.",ask:"Is it an enclave or an exclave?",
 kinds:[["en","Enclave","an enclave"],["ex","Exclave","an exclave"]],
 items:[["Lesotho","en","A whole country surrounded by one other, South Africa."],["Kaliningrad","ex","A piece of Russia cut off from the rest, between Poland and Lithuania."],
  ["Vatican City","en","The world’s smallest country, surrounded by the city of Rome."],["Alaska","ex","Part of the US, cut off from the other 48 mainland states by Canada."],
  ["San Marino","en","A small country entirely surrounded by Italy."],["Cabinda","ex","A province of Angola, cut off from the rest by a strip of DR Congo along the Congo River."],
  ["Nakhchivan","ex","Part of Azerbaijan, cut off from the rest by Armenia."]],
 end:()=>"Enclave: surrounded by another state. Exclave: a piece of a state cut off from the main part. Lesotho is surrounded; Kaliningrad is cut off."});

/* ---------------- guess first (geoflock-tourplay.js veils the headline and asks for an estimate) ----------------
   Wikipedia, "Landlocked country": "As of 2026, there are 44 landlocked countries" (UN members and observers). */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const GS={"hg4d|Landlocked states":{q:"How many of the world’s countries have no coast at all?",min:0,max:100,ans:44,unit:"",step:1,show:"44"}};
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}
const DEFS=[NATIONS,SWAP,BTYPES,UNIFED,YUGO,TURN_AUTO,TURN_SEP,UNGROW,EUQ,NATOQ,TURN_UNION,STAGES,TURN_SHAPE,TURN_FRAG,ENCL];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvl-layer rvl-layer";el.innerHTML='<svg class="rvl-sv"><defs><clipPath id="rvlDisc"><path class="rvl-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvlDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvl-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvl-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvl-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvl-ctl";if(D.turns)c.dataset.turns="1";
 c.innerHTML='<div class="rvl-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvl-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvl-ctl"))unmount()}catch(e){}},300);
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
.rvl-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvl-sv{position:absolute;left:0;top:0;overflow:visible}
.rvl-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvl-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvl-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvl-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvl-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvl-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvl-btn[hidden]{display:none}
.rvl-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvl-ep b{display:block;font-size:15px}
.rvl-ep.rvl-new{animation:rvlIn .45s ease}@keyframes rvlIn{from{opacity:.2;transform:translateY(4px)}}
.rvl-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvl-sortq i{font-style:normal}
.rvl-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvl}
.rvl-rank li{position:relative;counter-increment:rvl;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvl-rank li::before{content:counter(rvl);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvl-rank li.rvl-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvl-rank li.rvl-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvl-nm{flex:1 1 auto;z-index:1}.rvl-v{z-index:1;font-weight:800;white-space:nowrap}
.rvl-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvl-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvl-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvl-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvl-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvl-do,:is(body.dark-theme,body.sky-night) .rvl-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvl-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvl-btn,:is(body.dark-theme,body.sky-night) .rvl-chip,:is(body.dark-theme,body.sky-night) .rvl-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvl-rank li.rvl-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvl-rank li.rvl-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvl-bar{background:rgba(255,178,122,.2)}
.rvl-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvl-rng{flex:1 1 auto;accent-color:#d9682b}.rvl-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvl-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvl-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvl-item{font-size:16px;color:#13294b}
.rvl-bins{display:flex;gap:6px;flex-wrap:wrap}.rvl-bins .rvl-btn[hidden]{display:none}.rvl-bin:disabled{cursor:default;opacity:.55}
.rvl-btn.rvl-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvl-btn.rvl-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvl-dots{display:flex;gap:4px;margin-top:8px}.rvl-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvl-dots i.rvl-now{box-shadow:0 0 0 2px #d9682b inset}.rvl-dots i.rvl-y{background:#1f8a4c}.rvl-dots i.rvl-x{background:#c2364f}
.rvl-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvl-sl .rvl-row{margin-top:2px}.rvl-sl .rvl-val{min-width:36px}
.rvl-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvl-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvl-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvl-out b{font-size:15px;color:#9a4a16}
.rvl-ch{display:block;width:100%;height:auto;margin-top:6px}.rvl-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvl-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvl-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvl-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvl-val,:is(body.dark-theme,body.sky-night) .rvl-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvl-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvl-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvl-n,:is(body.dark-theme,body.sky-night) .rvl-sl label,:is(body.dark-theme,body.sky-night) .rvl-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvl-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvl-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvl-dots i{background:rgba(255,255,255,.18)}
.rvl-snow{display:block;width:100%;height:auto;border-radius:10px;background:#f4efe3;border:1px solid rgba(19,41,75,.12)}
.rvl-st{fill:none;stroke:#b9ad95;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.rvl-dd circle{fill:#2a2f3a;opacity:.75;transition:fill .25s}.rvl-dd circle.rvl-near{fill:#d9682b;opacity:1}
.rvl-pump{cursor:pointer;outline:none}.rvl-pump .rvl-hit{fill:transparent}.rvl-pump rect{fill:#2a78d0;stroke:#fff;stroke-width:1.5}
.rvl-pump:hover rect,.rvl-pump:focus rect{fill:#13294b}.rvl-pump.rvl-on rect{fill:#d9682b;stroke:#13294b;stroke-width:2}
.rvl-pl{font:800 10px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#f4efe3;stroke-width:3px}
.rvl-key2{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:5px}.rvl-key2 i{display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;border-radius:50%}
.rvl-kd{background:#2a2f3a}.rvl-kp{background:#2a78d0;border-radius:2px!important}.rvl-kn{background:#d9682b}
:is(body.dark-theme,body.sky-night) .rvl-key2{color:#aab6c8}
.rvl-btn.rvl-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvl-btn.rvl-cur{background:#9fc3ff;color:#13294b}
.rvl-band{fill:rgba(217,104,43,.1)}.rvl-area{fill:rgba(42,120,208,.22);stroke:#2a78d0;stroke-width:1.5;stroke-linejoin:round}.rvl-dashed{fill:none;stroke:#8a98a8;stroke-dasharray:3 3}
line.rvl-now{stroke:#d9682b;stroke-width:1.5}.rvl-dot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
:is(body.dark-theme,body.sky-night) .rvl-area{fill:rgba(159,195,255,.22);stroke:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvl-band{fill:rgba(255,178,122,.12)}
:is(body.dark-theme,body.sky-night) .rvl-btn.rvl-good{background:#1f8a4c;border-color:#4cc27f;color:#fff}:is(body.dark-theme,body.sky-night) .rvl-btn.rvl-bad{background:#c2364f;border-color:#ff7088;color:#fff}
:is(body.dark-theme,body.sky-night) .rvl-dots i.rvl-y{background:#4cc27f}:is(body.dark-theme,body.sky-night) .rvl-dots i.rvl-x{background:#ff7088}:is(body.dark-theme,body.sky-night) .rvl-dots i.rvl-now{box-shadow:0 0 0 2px #ffb27a inset}
`;document.head.appendChild(s)}

window.gfPolishRvl={v:1,FIX,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
