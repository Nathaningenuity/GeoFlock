/* GeoFlock polish RV-M: a stop-by-stop review of the first four History tours: Ancient civilisations (hancient),
   Empires and independence (hempires), Medieval empires (hmedieval) and Revolutions and industry (hrevolutions), each
   looked at on the globe with the History map (their default mode) at 1280×860, once the map had loaded.
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours starts (to
      the stops psSteps() builds as well). Each fix says why; changed facts cite their source.
   2. Stops you can play with (listed at the start of part 2).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rvc.js / -rvj.js) the fixed fields
   are made fixed, non-configurable getters whose setters are ignored. A field that is already non-configurable (locked
   by another file) is left alone. Same structure as geoflock-polish-rvj.js, whose helpers and control styles are copied
   here under "rvm-" names so the files never touch each other's controls.
   A lesson from these tours: on the History globe, a stop with no card side set gets its card on the right, where the
   map key (top right) lies over the card's close button and the year pill moves onto the map toggles. So most stops
   here are given the card on the left, as written for the others. */
(function(){
"use strict";
if(window.gfPolishRvm)return;

const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvmTest or ?rvmtest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvmTest||/[?&]rvmtest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?strip(p[1]):strip(p&&p.text);
/* Pin lists are filtered, not frozen: the shared photo pass (geoflock-stopphotos.js, -pinfix.js) turns text pins into
   photo pins at its own times after load, so a list copied once would keep or lose pins depending on timing. XF puts
   a getter on the field that applies this file's edits to whatever the field holds; other files' writes still go
   through (to the value underneath). Each edit has an id, so applying the fixes again does not stack them. */
const XFS=new WeakMap();
const XF=(S,k,id,fn)=>{try{let R=XFS.get(S);if(!R){R={};XFS.set(S,R)}
 if(!R[k]){const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;const B={v:S[k],fns:{}};R[k]=B;
  Object.defineProperty(S,k,{configurable:!!(window.__rvmTest||/[?&]rvmtest\b/.test(location.search)),enumerable:true,
   get:()=>{let v=Array.isArray(B.v)?B.v.slice():(B.v||[]);for(const f in B.fns){try{v=B.fns[f](v)}catch(e){}}return v},set:x=>{B.v=x}})}
 R[k].fns[id]=fn}catch(e){}};
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

/* ======================================================================== part 1: data fixes */
const FIX={
 hancient:{
  /* the Hawaii and Chichén Itzá photos were round the back of the globe (both have their own stops), and the
     Shanhaiguan photo, of a Ming gate built in 1381, sat on the zoom buttons of a tour about 3000 BC */
  "Ancient civilisations":S=>DROPPH(S,/^(Hawaii|Chich|Shanhaiguan)/),
  /* Mehrgarh, the stop's other early farmers, was off the globe's edge: framed between Turkey and Pakistan */
  "Older than farming":S=>VIEW(S,[50,33,1.7],"left"),
  /* the card went to the right, where the map key covered its close button and the year pill sat on the toggles */
  "Mesopotamia: writing begins":S=>VIEW(S,[45.3,32,4.44],"left"),
  "Egypt and the pyramids":S=>VIEW(S,[31,28.4,4.75],"left"),
  "The Indus Valley":S=>VIEW(S,[70,27,3.5],"left"),
  "China’s Yellow River":S=>VIEW(S,[111,35,3],"left"),
  /* the card was sometimes switched to the right at run time (after the stop's question): kept on the left, as written */
  "The bronze faces of Shu":S=>VIEW(S,[106,31,3],"left"),
  /* the Central Asian tin pin was off the globe's edge, by the zoom buttons */
  "Ten tonnes of copper, one of tin":S=>VIEW(S,[42,40,1.45],"left"),
  /* Tyre and Byblos, where the Phoenicians came from, were off the globe's right edge; framed on the whole sea, the
     Byblos photo still hung over the zoom buttons (Tyre, a few km south, keeps its pin) */
  "The Phoenicians":S=>{DROPPH(S,/^Byblos/);VIEW(S,[11,36,1.35],"left")},
  /* the card was on the right; Marseille and the Black Sea arrows were cut off */
  "Ancient Greece":S=>VIEW(S,[18,40,2.3],"left"),
  /* Herodotus (Histories 5.52-53) gives 111 stations and 90 days on foot from Sardis to Susa; how fast the relay
     couriers were is a modern estimate (seven or nine days, depending on the source), so the text no longer gives one */
  "The Persian Empire":S=>{VIEW(S,[45,32,1.54],"left");RE(S,"more","so a message could cross it in about a week instead of three months on foot","so a message could cross it in days, where a traveller on foot took about 90 days (Herodotus counted 111 stations along the way)")},
  /* the card was on the right, over "Army turns back", the place the stop builds up to */
  "Alexander the Great":S=>VIEW(S,[48.5,33,1.3],"left"),
  /* the three labels' leaders crossed, and the Badaling photo (a Ming wall of about 1505, in a stop set in 221 BC)
     sat on the zoom buttons */
  "The first emperor":S=>{DROPPH(S,/^(Badaling|China: Great Wall)/);VIEW(S,[112.5,37,2.4],"left")},
  /* Rome was under the card: the two capitals are 8,200 km apart, too far for one view beside the card. The stop
     opens on the road's middle, Rome's photo becomes a plain label (so it no longer pulls the view west); buttons in part 2 turn the globe to each end */
  "Rome and Han China":S=>{DROPPH(S,/^Rome/);ADDPIN(S,[[[12.5,41.9]],"Rome","area"]);VIEW(S,[78,37,1.3],"left")},
  "The Roman Empire":S=>VIEW(S,[15,40,1.22],"left"),
  "Kush and Aksum":S=>VIEW(S,[35.5,16,2.8],"left"),
  /* Teotihuacan was at the globe's edge with the card on the right */
  "The Maya":S=>VIEW(S,[-94,18.3,3.4],"left"),
  /* Madagascar was round the back of the globe and Easter Island under the card: they are 14,300 km apart. The stop
     opens on Taiwan and island Southeast Asia; buttons in part 2 turn the globe to each end. The far places become
     "area" labels (or go: Madagascar has the map's own label), so they no longer pull the view's middle */
  "Sailors of two oceans":S=>{DROPPH(S,/^(Madagascar|Easter Island)/);DROP(S,/^(Madagascar|Hawaii)/);DROPPH(S,/^New Zealand/);ADDPIN(S,[[[174.8,-41]],"New Zealand","area"]);AREA(S,/^(Easter Island|New Zealand)/);ADDPIN(S,[[[-109.35,-27.12]],"Easter Island","area"]);DROPIC(S,/^canoe$/,[46.9,-19]);VIEW(S,[128,8,1.3],"left")}
 }
};
FIX.hempires={
  /* the Mecca photo sat on the zoom buttons and Córdoba's at the card's edge: both belong to the next stop */
  "Empires and independence":S=>DROPPH(S,/^(Mecca|Córdoba)/),
  /* Spain, one end of "from Spain to Pakistan", was under the card and the Baghdad photo on the zoom buttons */
  "The Arab conquests":S=>VIEW(S,[31,32,1],"left"),
  "Too big to hold: the Mongols":S=>VIEW(S,[85,42,1],"left"),
  /* Algeria, the empire's western end, was under the card */
  "The Ottoman Empire":S=>VIEW(S,[22,37,1.35],"left"),
  /* the card went to the right after the stop's question, with the map key over its close button */
  "China’s treasure fleets":S=>VIEW(S,[80,12,1],"left"),
  /* Acapulco and Manila, "from Mexico to the Philippines", were round the back of the globe or under the card (on the
     right). They are half a world apart: the stop opens on the line of 1494, and buttons in part 2 turn the globe to
     the galleon ports; their pins become "area" labels so they no longer pull the view's middle */
  "Spain and Portugal":S=>{AREA(S,/^(Acapulco|Manila)/);VIEW(S,[-40,5,1],"left")},
  /* Moscow (its photo) was under the card and Fort Ross's photo sat on the map toggles: Russia's land empire spans
     half the globe. The stop opens on Siberia, buttons turn the globe from Moscow to California, and the far places
     become plain labels */
  "An empire by land":S=>{DROPPH(S,/^(Russia: St Basil|Fort Ross)/);ADDPIN(S,[[[37.62,55.75]],"Moscow","area"]);ADDPIN(S,[[[-123.24,38.51]],"Fort Ross, 1812","area"]);AREA(S,/^Sitka/);VIEW(S,[90,50,1.2],"left")},
  "Sugar, slaves and empire":S=>VIEW(S,[-30,5,1],"left"),
  "The first colonies to break free":S=>VIEW(S,[-76,39,3],"left"),
  /* the card was on the right, where Bolívar's portrait and the Brazil photo crowded the zoom buttons */
  "Spain’s empire splits up":S=>VIEW(S,[-62,-12,1.1],"left"),
  "The British Empire":S=>VIEW(S,[30,20,1],"left"),
  /* the Lalibela church photo (built about 1200, not part of the story) hung over the zoom buttons; Adwa keeps its pin */
  "Borders drawn in Europe":S=>{DROPPH(S,/^Ethiopia/);VIEW(S,[18,3,1.04],"left")},
  "India’s independence":S=>VIEW(S,[78,23,1.8],"left"),
  "Africa’s wave of independence":S=>VIEW(S,[15,5,1.04],"left"),
  "The last colonies":S=>VIEW(S,[113.8,22.3,5.04],"left")
};
FIX.hmedieval={
  /* the Vinland photo was under the card, Angkor round the back of the globe and Great Zimbabwe on the globe's bottom
     edge: all three have their own stops (or tours); the Mongolia photo sat on the search box */
  "Medieval empires":S=>DROPPH(S,/^(Vinland|Angkor|Great Zimbabwe|Mongolia)/),
  /* the Hagia Sophia photo and Justinian's portrait hung over the zoom buttons */
  "Justinian’s Byzantium":S=>VIEW(S,[18,39,2],"left"),
  /* the Baghdad photo sat on the zoom buttons */
  "The Arab conquests and Baghdad":S=>VIEW(S,[31,32,1],"left"),
  /* the card went to the right, with the map key over its close button */
  /* (and Nara, at the far end of the stop, was off the globe's edge; the Kyoto photo then hung over the zoom buttons:
     Nara keeps its label) */
  "Tang China":S=>{DROPPH(S,/^Kyoto/);VIEW(S,[104,36,1.25],"left")},
  "Charlemagne":S=>VIEW(S,[8,47,2.5],"left"),
  "The Crusades":S=>VIEW(S,[24,40,1.45],"left"),
  /* the Lalibela photo hung off the globe's bottom edge */
  "Churches carved down into rock":S=>VIEW(S,[38,18,2.4],"left"),
  /* Mecca, the end of Mansa Musa's pilgrimage, was off the globe's edge */
  "Mansa Musa’s Mali":S=>VIEW(S,[18,21,1.35],"left"),
  /* the Tian Shan, where the plague began, was at the globe's edge */
  /* the plague slider in part 2 labels each place as the plague reaches it, so the three dated labels go */
  "The Black Death":S=>{DROP(S,/^(Messina|Cairo|Bergen)/);VIEW(S,[40,45,1.3],"left")},
  "The fall of Constantinople":S=>VIEW(S,[29,41,4.6],"left")
};
FIX.hrevolutions={
  /* the photos of Meiji Japan and Ellis Island, a world apart from Manchester and Sarajevo, turned the globe to the
     Arctic, with the card on the right; they have their own stops */
  "Revolutions and industry":S=>{DROPPH(S,/^(Meiji Japan|Ellis Island)/);VIEW(S,[10,38,1],"left")},
  /* the card was on the right, with the map key over its close button */
  "American independence":S=>VIEW(S,[-73.8,39.8,6],"left"),
  "Haiti":S=>VIEW(S,[-72.6,19,5],"left"),
  /* Simón Bolívar's portrait was pinned on Rio de Janeiro, where he never went (left over from a "Rio: Brazil's
     emperor" pin); Caracas, his home, keeps its pin. Card on the left, as for the others */
  "Latin America breaks free":S=>{DROPPH(S,/^Simón Bolívar/);VIEW(S,[-68,-10,1.1],"left")},
  /* the Wuyi Mountains and Shanghai, where the tea came from, were off the globe's right edge */
  "The great tea theft":S=>VIEW(S,[104,27,1.9],"left"),
  /* Alexandria and the Suez Canal were off the globe's edge and New Orleans under the card: the stop's three places
     are 120° apart. It opens on the Atlantic, Manchester in view, and buttons in part 2 turn the globe to each */
  "War in America, cotton in Egypt":S=>{AREA(S,/^(New Orleans|Alexandria|The Suez Canal)/);VIEW(S,[-30,40,1.1],"left")},
  /* the card was on the right, with the map key over its close button; on the left, the Tokyo photo then sat on the
     zoom buttons until the view moved east */
  "Meiji Japan":S=>VIEW(S,[138,35,4.6],"left"),
  "The Scramble for Africa":S=>VIEW(S,[15,3,1.05],"left"),
  /* New York was under the card and Mauritius and Singapore round the back of the globe: the stop opens on the
     Atlantic crossing, and buttons in part 2 turn the globe to the other routes. The Naples photo then sat on the zoom
     buttons; the shared photo pass then gave the far labels photos of their own, which
     pulled the view south, so those go too (and New York, whose photo came and went with that pass, gets a label) */
  "The great migrations":S=>{DROPPH(S,/^(Naples|Buenos Aires|Mauritius|Singapore)/);AREA(S,/^(Mauritius|Singapore|Buenos Aires)/);ADDPIN(S,[[-74.04,40.7],"New York","point"]);VIEW(S,[-36,33,1],"left")}
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvm fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps());/* and once more on the stop itself, in case another file re-set a field after the first pass */try{const S=psSteps()[ps.i],f=S&&FIX[t][strip(S.title)];if(f)f(S)}catch(e){}}catch(e){}},300);
/* applied only once one of these tours is open (by then the load-time photo passes have run): see above */

/* The card shift, kept (as geoflock-polish-rvb.js and -rvf.js do for theirs): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for four seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["hancient","hempires","hmedieval","hrevolutions"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".ihx-ctl[data-turns],.gh2-ctl[data-turns],.rvm-ctl[data-turns]"))return;
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
function tag(L,cls){const d=document.createElement("div");d.className="rvm-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvm-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvm-new");void e.offsetWidth;e.classList.add("rvm-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvm-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvm-rank"></ol><div class="rvm-pool"></div>'+
  '<div class="rvm-btns"><button type="button" class="rvm-btn rvm-undo">Undo</button><button type="button" class="rvm-btn rvm-show">Show me</button><button type="button" class="rvm-btn rvm-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvm-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvm-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvm-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvm-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvm-ok":"rvm-no"):"")+'"><span class="rvm-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvm-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvm-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvm-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvm-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvm-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvm-show").hidden=L.shown;c.querySelector(".rvm-again").hidden=!L.shown;
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
function TURNER(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,turns:true,tip:cfg.tip,
 card(L){return'<div class="rvm-btns rvm-turn">'+cfg.places.map((f,i)=>'<button type="button" class="rvm-btn" data-i="'+i+'"></button>').join("")+'</div>'},
 wire(L){const c=L.card;L.at=0;c.querySelectorAll(".rvm-turn button").forEach(b=>b.onclick=()=>{const f=cfg.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turns="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvm-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvm-cur",k===L.at);b.textContent=k===L.at?"● "+cfg.places[k][0]:"Turn to "+cfg.places[k][0].replace(/^The /,"the ")});
  const f=cfg.places[L.at];say(L,f[0],f[4])}}}

/* ======================================================================== part 2: stops you can play with
   Same pattern as geoflock-polish-rvj.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (the card scrolls to it), and removes everything as soon
   as the stop changes or the tour ends. Next and Back are never blocked; every step is wrapped in try/catch.
   - hancient | "Alexander the Great": march with Alexander from Pella in 334 BC to his death in Babylon in 323 BC. Drag
                the slider (or Play): the route draws itself, each battle and city is told as you reach it, and the card
                counts the kilometres.
   - hancient | "Rome and Han China": the two capitals are 8,200 km apart; buttons turn the globe along the road.
   - hancient | "Sailors of two oceans": from Taiwan to Madagascar and Easter Island, 14,300 km apart; buttons turn
                the globe to each.
   - hempires | "Spain and Portugal": from the line of 1494 to Potosí, Acapulco and Manila; buttons turn the globe.
   - hempires | "An empire by land": from Moscow across Siberia to Okhotsk, Alaska and Fort Ross; buttons turn the globe.
   - hempires | "Africa’s wave of independence": put eight countries in the order they won independence.
   - hmedieval | "The Black Death": a year slider (or Play) from 1346 to 1350; each place lights up the year the
                 plague reached it.
   - hmedieval | "Now explore": put eight moments from the tour in order.
   - hrevolutions | "Latin America breaks free": put seven countries in the order they broke free.
   - hrevolutions | "War in America, cotton in Egypt" and "The great migrations": the places are oceans apart;
                    buttons turn the globe to each. */

/* ======================================================================== 1. Alexander's march (hancient)
   Places and dates: Encyclopaedia Britannica, "Alexander the Great" (Granicus May 334 BC, Issus November 333, the
   seven-month siege of Tyre 332, Alexandria founded 331, Gaugamela 1 October 331, Persepolis 330, Sogdiana and
   Maracanda 329-327, the Hydaspes 326, the mutiny at the Hyphasis (Beas) 326, down the Indus and through the Gedrosian
   desert 325, the Susa weddings 324, death at Babylon 10 or 13 June 323), and Arrian, Anabasis. Distances are great-circle
   lines between the stops (mean Earth radius 6,371 km): his real roads were longer. */
const RE_KM=6371.0088;
const MARCH_P=[
 ["Pella","Spring 334 BC",22.52,40.76,"Alexander sets out from Macedon to invade the Persian Empire."],
 ["The Granicus","May 334 BC",27.25,40.2,"His first victory over the Persians, at a river crossing in what is now Turkey."],
 ["Issus","November 333 BC",36.2,36.85,"He beats the Persian king, Darius III, himself. Darius flees."],
 ["Tyre","332 BC",35.2,33.27,"The island city holds out for seven months before it falls."],
 ["Alexandria","331 BC",29.92,31.2,"Egypt lets him in without a fight. He founds Alexandria, the greatest of his cities."],
 ["Gaugamela","October 331 BC",43.5,36.57,"The decisive battle: Darius’s great army is broken."],
 ["Babylon","331 BC",44.42,32.54,"Babylon opens its gates to him."],
 ["Persepolis","330 BC",52.89,29.93,"The Persian kings’ palace city is taken, and burned."],
 ["Maracanda (Samarkand)","329 BC",66.97,39.65,"Two hard years of fighting in Central Asia."],
 ["The Hydaspes","326 BC",73.6,32.9,"He beats King Porus and his war elephants in what is now Pakistan."],
 ["The Beas","326 BC",75.3,31.6,"His exhausted army refuses to go any further. He turns back."],
 ["The Indus delta","325 BC",68.4,25.4,"He sails down the Indus to the sea."],
 ["The Gedrosian desert","325 BC",63,26,"The march home through the desert of what is now Baluchistan kills many of his men."],
 ["Susa","324 BC",48.26,32.19,"Back in Persia. He and his officers marry Persian noblewomen in a mass wedding."],
 ["Babylon","June 323 BC",44.42,32.54,"He falls ill and dies in Babylon, aged 32, eleven years after setting out."]];
const MARCH_KM=(()=>{const K=[0];for(let i=1;i<MARCH_P.length;i++)K.push(K[i-1]+d3.geoDistance([MARCH_P[i-1][2],MARCH_P[i-1][3]],[MARCH_P[i][2],MARCH_P[i][3]])*RE_KM);return K})();
const MARCH={tours:["hancient"],title:"Alexander the Great",globe:true,
 tip:"March with Alexander: drag the slider, or press Play.",
 card(L){return'<div class="rvm-row"><button type="button" class="rvm-btn rvm-play" style="flex:0 0 auto">▶ Play</button><input type="range" class="rvm-rng" min="0" max="'+((MARCH_P.length-1)*100)+'" value="0" aria-label="Along the march"></div>'},
 init(L){L.t=0;L.playing=0},
 wire(L){const c=L.card,r=c.querySelector(".rvm-rng"),pb=c.querySelector(".rvm-play");
  r.oninput=()=>{L.playing=0;L.t=+r.value/100;this.render(L)};
  pb.onclick=()=>{if(L.playing){L.playing=0;this.render(L);return}if(L.t>=MARCH_P.length-1.001)L.t=0;L.playing=1;L.last=performance.now();L.anim=1;this.render(L)};
  this.render(L)},
 off(L){L.playing=0},
 pos(t){const i=Math.min(MARCH_P.length-2,Math.floor(t)),f=t-i,a=MARCH_P[i],b=MARCH_P[i+1];return{i,f,ll:d3.geoInterpolate([a[2],a[3]],[b[2],b[3]])(f),km:MARCH_KM[i]+(MARCH_KM[i+1]-MARCH_KM[i])*f}},
 render(L){const c=L.card;if(!c)return;const N=MARCH_P.length-1,t=clamp(L.t,0,N),P=this.pos(t),k=Math.min(N,Math.round(t)),e=MARCH_P[k];
  const r=c.querySelector(".rvm-rng");if(document.activeElement!==r)r.value=Math.round(t*100);
  c.querySelector(".rvm-play").textContent=L.playing?"❚❚ Pause":(t>=N-.001?"↻ Again":"▶ Play");
  say(L,esc(e[0])+", "+esc(e[1])+' <span class="rvm-km">'+fmt(Math.round(P.km/10)*10)+" km marched</span>",esc(e[4])+(k===N?" In straight lines his march was over "+fmt(Math.floor(MARCH_KM[N]/1000)*1000)+" km; the real roads were far longer.":""));L.dirty=1},
 draw(L){const G=g();if(!G)return;const N=MARCH_P.length-1;
  if(L.playing){const now=performance.now(),dt=Math.min(.1,(now-L.last)/1000);L.last=now;L.t=Math.min(N,L.t+dt*.9);if(L.t>=N)L.playing=0;this.render(L)}
  L.anim=L.playing?1:0;
  const t=clamp(L.t,0,N),P=this.pos(t);L.svg.innerHTML="";
  const all=[];MARCH_P.forEach((p,i)=>{if(i){const ip=d3.geoInterpolate([MARCH_P[i-1][2],MARCH_P[i-1][3]],[p[2],p[3]]);for(let j=1;j<=12;j++)all.push({ll:ip(j/12),t:i-1+j/12})}else all.push({ll:[p[2],p[3]],t:0})});
  svgEl(L.svg,"path",{d:pathOf(L,all.map(q=>q.ll)),class:"rvm-mfut"});
  svgEl(L.svg,"path",{d:pathOf(L,all.filter(q=>q.t<=t).map(q=>q.ll).concat([P.ll])),class:"rvm-mpast"});
  MARCH_P.forEach((p,i)=>{if(i>t+.001)return;const q=proj(L,[p[2],p[3]]);if(q)svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:4,class:"rvm-mdot"})});
  const q=proj(L,P.ll);if(q)svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:8,class:"rvm-mme"});
  if(!L.tg)L.tg=tag(L,"rvm-ctag");const k=Math.min(N,Math.round(t)),e=MARCH_P[k];putTag(L,L.tg,t>.05?q:null,esc(e[0]),12)}};

/* ======================================================================== 2. Along the Silk Road (hancient)
   The texts are the stop's own facts (Hou Hanshu for 166 AD and Gan Ying; Pliny, Natural History 12.84, on silk and
   gold). 8,200 km is the great-circle distance from Rome to Luoyang. */
const TURN_SILK=TURNER({tours:["hancient"],title:"Rome and Han China",tip:"Rome and Luoyang are 8,200 km apart, too far for one view. Turn the globe along the road.",
 places:[["Central Asia",78,37,1.3,"Silk passed from trader to trader across Central Asia, so few, if any, people ever made the whole journey."],
  ["Rome",12.5,41.9,1.5,"Rich Romans paid fortunes for silk, and the writer Pliny complained that the empire’s gold was draining east."],
  ["Kashgar",76,39.5,1.6,"An oasis at the western end of the Taklamakan desert, where the roads round it meet before the mountain passes west."],
  ["Luoyang",112.45,34.62,1.5,"The Han capital. Chinese records say visitors from the Roman emperor reached the court here in 166 AD, though they were probably merchants."]]});

/* ======================================================================== 3. Two oceans (hancient)
   The texts are the stop's own facts; 14,300 km is the great-circle distance from Madagascar to Easter Island. */
const TURN_SAIL=TURNER({tours:["hancient"],title:"Sailors of two oceans",tip:"Madagascar and Easter Island are 14,300 km apart. Turn the globe to follow the sailors.",
 places:[["Taiwan",128,8,1.3,"The start, about 5,000 years ago. From here outrigger canoes spread south through the Philippines and Indonesia."],
  ["Madagascar",47,-19,1.4,"The far west. Malagasy, spoken in Madagascar, is closest to languages of Borneo, about 7,000 km away."],
  ["New Zealand",174.8,-41,1.4,"Polynesians, the sailors’ descendants, reached New Zealand, Hawaii and Easter Island between about 1000 and 1300 AD."],
  ["Easter Island",-109.35,-27.12,1.4,"The far east. Polynesians grew the sweet potato, from South America, long before Columbus, so they probably reached the Americas too."]]});

/* ======================================================================== 4. Mexico to Manila (hempires)
   The texts are the stop's own facts (the 1494 Treaty of Tordesillas line; the Manila galleons, 1565-1815; Potosí's
   silver). Acapulco and Manila are 14,300 km apart across the Pacific (great circle). */
const TURN_SUN=TURNER({tours:["hempires"],title:"Spain and Portugal",tip:"Spain’s empire ran from Mexico to the Philippines, half a world apart. Turn the globe to follow it.",
 places:[["The line of 1494",-40,5,1,"Spain and Portugal split the newly reached lands with a line down the Atlantic: Spain west of it, Portugal east."],
  ["Potosí",-65.75,-19.58,1.4,"Silver from mines like Potosí, in Bolivia, paid for Chinese silk and porcelain."],
  ["Acapulco",-99.9,16.8,1.4,"From 1565 to 1815, Spanish galleons sailed from here to Manila: the first regular trade route across the Pacific."],
  ["Manila",120.97,14.6,1.4,"The galleons’ other end, 14,300 km away. The Philippines are named after Spain’s King Philip II."]]});

/* ======================================================================== 5. Across Siberia (hempires)
   The stop's own facts: east over the Urals from the 1580s, the Pacific at Okhotsk in 1639, Russian America (Sitka),
   Fort Ross in California in 1812, Alaska sold in 1867. */
const TURN_RUS=TURNER({tours:["hempires"],title:"An empire by land",tip:"Russia’s empire stretched half way round the world. Turn the globe from Moscow to California.",
 places:[["Siberia",90,50,1.2,"From the 1580s Russian fur traders pushed east over the Urals, from one river to the next."],
  ["Moscow",37.62,55.75,1.5,"The start. Every new land was joined to the homeland, so Siberia is still Russia."],
  ["Okhotsk",143.3,59.4,1.5,"Russians reached the Pacific here in 1639."],
  ["Alaska",-145,60,1.3,"Russian America, run from Sitka. Too far away to defend, it was sold to the United States in 1867 for $7.2 million."],
  ["Fort Ross",-123.24,38.51,1.6,"Russia’s furthest outpost, built in California in 1812."]]});

/* ======================================================================== 6. Who was free first? (hempires)
   Independence dates: Encyclopaedia Britannica's country articles (Libya 24 December 1951, Ghana 6 March 1957, Nigeria
   1 October 1960, Algeria 5 July 1962, Kenya 12 December 1963, Angola 11 November 1975, Zimbabwe 18 April 1980,
   Namibia 21 March 1990). */
const SORT_AFR=SORT({tours:["hempires"],title:"Africa’s wave of independence",
 tip:"Put these countries in the order they won independence, earliest first.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Ghana",1957.18,"1957 · Britain"],["Nigeria",1960.75,"1960 · Britain"],["Algeria",1962.51,"1962 · France"],
  ["Kenya",1963.95,"1963 · Britain"],["Libya",1951.98,"1951 · after Italy"],["Angola",1975.86,"1975 · Portugal"],
  ["Zimbabwe",1980.3,"1980 · Britain"],["Namibia",1990.22,"1990 · South Africa"]],
 after:(r,N)=>"Libya was first, in 1951: it came out of Italian rule after World War II through the UN. Algeria won its freedom from France only after an eight-year war. Portugal held on longest, until 1975, and the last were ruled by white minorities: Zimbabwe until 1980 and Namibia, run by South Africa, until 1990."});

/* ======================================================================== 7. The plague's march (hmedieval)
   Arrival dates: O. J. Benedictow, "The Black Death 1346-1353: the complete history" (2004), and Encyclopaedia
   Britannica, "Black Death": Kaffa 1346, Constantinople 1347, Messina October 1347, Marseille November 1347, Florence
   spring 1348, Paris 1348, London autumn 1348, Bergen 1349; Cairo 1348 is the stop's own. Only the years are shown; the
   months only order the dots. */
const BD_P=[["Kaffa",1346.7,35.38,45.03,"1346","The plague reaches the Black Sea port of Kaffa, from the Mongol lands to the east."],
 ["Constantinople",1347.5,28.98,41.01,"1347","It travels on by ship to the Byzantine capital."],
 ["Messina",1347.8,15.55,38.19,"1347","Genoese ships bring it to Sicily."],
 ["Marseille",1347.9,5.37,43.3,"1347","And to the south of France."],
 ["Florence",1348.25,11.25,43.77,"1348","Boccaccio set his Decameron among Florentines fleeing this plague."],
 ["Cairo",1348.3,31.24,30.04,"1348","The biggest city of the Islamic world is struck too."],
 ["Paris",1348.5,2.35,48.86,"1348","Overland, it moves along the roads and rivers."],
 ["London",1348.85,-0.12,51.5,"1348","By ship across the Channel."],
 ["Bergen",1349.6,5.32,60.39,"1349","A ship from England carries it to Norway."]];
const BD={tours:["hmedieval"],title:"The Black Death",globe:true,
 tip:"Follow the plague: drag the slider, or press Play.",
 card(L){return'<div class="rvm-row"><button type="button" class="rvm-btn rvm-play" style="flex:0 0 auto">▶ Play</button><input type="range" class="rvm-rng" min="13460" max="13500" value="13460" aria-label="Year"></div>'},
 init(L){L.t=1346;L.playing=0},
 wire(L){const c=L.card,r=c.querySelector(".rvm-rng"),pb=c.querySelector(".rvm-play");
  r.oninput=()=>{L.playing=0;L.t=+r.value/10;this.render(L)};
  pb.onclick=()=>{if(L.playing){L.playing=0;this.render(L);return}if(L.t>=1349.99)L.t=1346;L.playing=1;L.last=performance.now();L.anim=1;this.render(L)};
  this.render(L)},
 off(L){L.playing=0},
 render(L){const c=L.card;if(!c)return;const r=c.querySelector(".rvm-rng");if(document.activeElement!==r)r.value=Math.round(L.t*10);
  c.querySelector(".rvm-play").textContent=L.playing?"❚❚ Pause":(L.t>=1349.99?"↻ Again":"▶ Play");
  const hit=BD_P.filter(p=>p[1]<=L.t),last=hit[hit.length-1];
  if(!last)say(L,Math.floor(L.t)+"","The plague is still in Central Asia.");
  else say(L,esc(last[0])+", "+last[4]+' <span class="rvm-km">'+hit.length+" of "+BD_P.length+" places</span>",esc(last[5])+(hit.length===BD_P.length?" Within four years it had swept across Europe, North Africa and the Middle East, killing perhaps a third to half of Europe’s people.":""));L.dirty=1},
 draw(L){if(L.playing){const now=performance.now(),dt=Math.min(.1,(now-L.last)/1000);L.last=now;L.t=Math.min(1350,L.t+dt*.5);if(L.t>=1350)L.playing=0;this.render(L)}
  L.anim=L.playing?1:0;L.svg.innerHTML="";if(!L.tags)L.tags=BD_P.map(()=>tag(L,"rvm-ctag rvm-small"));
  BD_P.forEach((p,i)=>{const q=proj(L,[p[2],p[3]]);const on=p[1]<=L.t;if(q&&on){const age=Math.min(1,(L.t-p[1])*2);svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:(6+18*(1-age)).toFixed(1),class:"rvm-bdr",opacity:(1-age).toFixed(2)});svgEl(L.svg,"circle",{cx:q[0],cy:q[1],r:6,class:"rvm-bd"})}
   putTag(L,L.tags[i],on?q:null,esc(p[0]),9)})}};

/* ======================================================================== 8. Put the Middle Ages in order (hmedieval)
   The years are the tour's own stops: Hagia Sophia finished in 537, Baghdad founded in 762, Charlemagne crowned in 800,
   the Althing in 930, Jerusalem taken in 1099, Baghdad sacked in 1258, Mansa Musa in Cairo in 1324, Constantinople
   taken in 1453. */
const SORT_MED=SORT({tours:["hmedieval"],title:"Now explore",
 tip:"Before you go: put these eight moments from the tour in order, earliest first.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Mongols sack Baghdad",1258,"1258"],["Hagia Sophia finished",537,"537"],["Constantinople falls",1453,"1453"],["Charlemagne crowned",800,"800"],
  ["Mansa Musa in Cairo",1324,"1324"],["Baghdad founded",762,"762"],["Crusaders take Jerusalem",1099,"1099"],["Iceland’s Althing first meets",930,"930"]],
 after:(r,N)=>"Baghdad was founded in 762 and sacked by the Mongols almost 500 years later, in 1258. Drag the timeline to watch it happen."});

/* ======================================================================== 9. Who broke free first? (hrevolutions)
   Independence dates: Encyclopaedia Britannica's country articles (Paraguay May 1811, Argentina 9 July 1816, Chile
   12 February 1818, Mexico 1821, Brazil 7 September 1822, Bolivia 6 August 1825; Cuba, lost by Spain in 1898,
   independent in 1902). */
const SORT_LAT=SORT({tours:["hrevolutions"],title:"Latin America breaks free",
 tip:"Put these countries in the order they broke free, earliest first.",first:"Earliest",last:"Latest",desc:false,bars:false,
 items:[["Mexico",1821.7,"1821"],["Cuba",1902.4,"1902"],["Paraguay",1811.4,"1811"],["Brazil",1822.7,"1822, from Portugal"],["Chile",1818.1,"1818"],["Bolivia",1825.6,"1825"],["Argentina",1816.5,"1816"]],
 after:(r,N)=>"Most of Spain’s mainland empire broke away in 15 years, from 1810 to 1825; Bolivia, named after Bolívar, was among the last. Brazil split from Portugal almost without a fight. Cuba stayed Spanish until 1898."});

/* ======================================================================== 10. Cotton across the Atlantic (hrevolutions)
   The stop's own facts: the Union blockade of 1861, Lancashire's cotton famine, Egypt's cotton boom, the Suez shares
   sold in 1875 and the occupation of 1882. "Most" of the cotton: about three-quarters of Britain's raw cotton came from
   the American South in 1860 (S. Beckert, "Empire of Cotton", 2014). */
const TURN_COT=TURNER({tours:["hrevolutions"],title:"War in America, cotton in Egypt",tip:"The cotton went from America, then Egypt, to Manchester. Turn the globe to follow it.",
 places:[["The Atlantic",-30,40,1.1,"Before 1861 most of Lancashire’s cotton crossed the Atlantic from the American South."],
  ["New Orleans",-90.07,29.95,1.6,"In 1861 the Union blockaded the South’s ports, and the cotton stopped."],
  ["Manchester",-2.24,53.48,2,"The mills ran short of cotton, putting hundreds of thousands out of work. Many workers backed the North anyway."],
  ["Alexandria",29.92,31.2,1.6,"Egypt’s ruler pushed Nile Delta farmers to grow cotton. When prices crashed, Egypt fell into debt and, in 1882, under British rule."]]});

/* ======================================================================== 11. Leaving home (hrevolutions)
   The stop's own facts (Irish famine and emigration; Italians, Germans, Poles, Scandinavians and Jews to the Americas;
   Ellis Island from 1892; Indian contract labourers to Mauritius; Chinese workers to Southeast Asia). */
const TURN_MIG=TURNER({tours:["hrevolutions"],title:"The great migrations",tip:"Turn the globe to follow the migrants.",
 places:[["The Atlantic",-36,33,1,"Cheap steamships carried Europeans across the ocean: more than 50 million left for the Americas and Australia between 1815 and 1930."],
  ["New York",-74.04,40.7,1.8,"About 12 million people entered the US through Ellis Island after it opened in 1892."],
  ["Buenos Aires",-58.38,-34.6,1.6,"Argentina took millions of migrants, many of them Italians."],
  ["Mauritius",57.5,-20.16,1.5,"Over a million Indians went abroad as contract labourers, to Mauritius, the Caribbean, Fiji and South Africa."],
  ["Singapore",103.85,1.29,1.6,"Chinese workers went to Southeast Asia, as well as to California."]]});

/* ---------------- the engine: one stop at a time ---------------- */
const DEFS=[MARCH,TURN_SILK,TURN_SAIL,TURN_SUN,TURN_RUS,SORT_AFR,BD,SORT_MED,SORT_LAT,TURN_COT,TURN_MIG];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if((D.globe||D.turns)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvm-layer rvm-layer";el.innerHTML='<svg class="rvm-sv"><defs><clipPath id="rvmDisc"><path class="rvm-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvmDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvm-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;try{if(scrolled&&scrolled.isConnected)scrolled.scrollTop=0}catch(e){}scrolled=null;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvm-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvm-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvm-ctl";
 c.innerHTML='<div class="rvm-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvm-ep"></div>';
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
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvm-ctl"))unmount()}catch(e){}},300);
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
.rvm-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvm-sv{position:absolute;left:0;top:0;overflow:visible}
.rvm-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvm-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvm-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvm-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvm-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvm-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvm-btn[hidden]{display:none}
.rvm-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvm-ep b{display:block;font-size:15px}
.rvm-ep.rvm-new{animation:rvmIn .45s ease}@keyframes rvmIn{from{opacity:.2;transform:translateY(4px)}}
.rvm-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvm-sortq i{font-style:normal}
.rvm-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvm}
.rvm-rank li{position:relative;counter-increment:rvm;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvm-rank li::before{content:counter(rvm);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvm-rank li.rvm-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvm-rank li.rvm-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvm-nm{flex:1 1 auto;z-index:1}.rvm-v{z-index:1;font-weight:800;white-space:nowrap}
.rvm-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvm-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvm-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvm-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvm-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvm-do,:is(body.dark-theme,body.sky-night) .rvm-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvm-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvm-btn,:is(body.dark-theme,body.sky-night) .rvm-chip,:is(body.dark-theme,body.sky-night) .rvm-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvm-rank li.rvm-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvm-rank li.rvm-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvm-bar{background:rgba(255,178,122,.2)}
.rvm-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvm-rng{flex:1 1 auto;accent-color:#d9682b}.rvm-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvm-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px;min-height:1.4em}.rvm-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvm-item{font-size:16px;color:#13294b}
.rvm-bins{display:flex;gap:6px;flex-wrap:wrap}.rvm-bins .rvm-btn[hidden]{display:none}.rvm-bin:disabled{cursor:default;opacity:.55}
.rvm-btn.rvm-good{opacity:1;background:#1f8a4c;border-color:#1f8a4c;color:#fff}.rvm-btn.rvm-bad{opacity:1;background:#c2364f;border-color:#c2364f;color:#fff}
.rvm-dots{display:flex;gap:4px;margin-top:8px}.rvm-dots i{width:12px;height:12px;border-radius:50%;background:rgba(19,41,75,.14)}.rvm-dots i.rvm-now{box-shadow:0 0 0 2px #d9682b inset}.rvm-dots i.rvm-y{background:#1f8a4c}.rvm-dots i.rvm-x{background:#c2364f}
.rvm-sl label{display:block;font-size:12.5px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvm-sl .rvm-row{margin-top:2px}.rvm-sl .rvm-val{min-width:36px}
.rvm-out{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.rvm-out div{background:#fff;border:1px solid rgba(19,41,75,.14);border-radius:10px;padding:5px 9px}.rvm-out span{display:block;font-size:11.5px;font-weight:700;color:#5b6b7c}.rvm-out b{font-size:15px;color:#9a4a16}
.rvm-ch{display:block;width:100%;height:auto;margin-top:6px}.rvm-ax{fill:none;stroke:#8a98a8;stroke-width:1}.rvm-c{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.rvm-tx{font:700 9px system-ui,sans-serif;fill:#5b6b7c}.rvm-end{fill:#9a4a16;font-size:10px}
:is(body.dark-theme,body.sky-night) .rvm-val,:is(body.dark-theme,body.sky-night) .rvm-out b{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvm-end{fill:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvm-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvm-n,:is(body.dark-theme,body.sky-night) .rvm-sl label,:is(body.dark-theme,body.sky-night) .rvm-out span{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvm-out div{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}:is(body.dark-theme,body.sky-night) .rvm-tx{fill:#aab6c8}:is(body.dark-theme,body.sky-night) .rvm-dots i{background:rgba(255,255,255,.18)}
.rvm-btn.rvm-cur{background:#13294b;color:#fff;border-color:#13294b}:is(body.dark-theme,body.sky-night) .rvm-btn.rvm-cur{background:#9fc3ff;color:#13294b}
.rvm-mfut{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:3 5;opacity:.45}
.rvm-mpast{fill:none;stroke:#c2364f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.rvm-mdot{fill:#fff;stroke:#c2364f;stroke-width:2}.rvm-mme{fill:#d9682b;stroke:#fff;stroke-width:3}
.rvm-ep b .rvm-km{display:inline;font-size:12.5px;font-weight:800;color:#9a4a16;margin-left:6px;white-space:nowrap}:is(body.dark-theme,body.sky-night) .rvm-ep b .rvm-km{color:#ffb27a}
.rvm-bd{fill:#2a2f3a;stroke:#fff;stroke-width:2}.rvm-bdr{fill:none;stroke:#c2364f;stroke-width:3}
.rvm-small{font-size:11.5px!important;padding:2px 7px!important}
`;document.head.appendChild(s)}

window.gfPolishRvm={v:1,FIX,XFS,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
