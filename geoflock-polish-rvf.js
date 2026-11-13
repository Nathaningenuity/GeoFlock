/* GeoFlock polish RV-F: a stop-by-stop review of four theme tours: Energy and resources (resources), People on the
   move (migration), Inventions (inventions) and People and the planet (environment), each looked at on the globe, their
   default mode, at 1280×860.
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours starts (to
      the stops psSteps() builds as well). Mostly framing: the tour card covers the left third of the globe and the map
      key the lower right, so places named in the text sat under one or the other, or round the back of the globe. Each
      fix says why; changed facts cite their source.
   2. Guess-first and find-it questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rvc.js / -rvd.js) the fixed fields
   are made fixed, non-configurable getters whose setters are ignored. A field that is already non-configurable (locked
   by another file) is left alone. */
(function(){
"use strict";
if(window.gfPolishRvf)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvfTest or ?rvftest, set only by a test page, keep the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!(window.__rvfTest||/[?&]rvftest\b/.test(location.search)),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
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

const FIX={
 resources:{
  /* the card sat on the right and the map key, moved left, covered India, the second user; card left, and a little
     further out so the "Inner Mongolia coalfields" label clears the key */
  "China and coal":S=>VIEW(S,[100,31,1.25],"left"),
  /* the card sat on the right, over Kazakhstan's own photo, and the map key then covered western Europe; the "Cigar
     Lake" label hung at the top edge of the globe for a mine round the back of it (Canada stays in the text) */
  "Uranium":S=>{VIEW(S,[40,42,1.15],"left");DROP(S,/^Cigar Lake/);
   /* its icon too: the framing script (gfSubjectPts in index.html) turned the globe to the middle of all the stop's
      icons, so this one pulled the view up over the Arctic */
   const I=(S.iconPins||[]).filter(q=>!(q&&q.at&&Math.abs(q.at[0]+104.5)<.1));if(I.length!==(S.iconPins||[]).length)LOCK(S,"iconPins",I)},
  /* card on the right, map key on the left: the "Johannesburg: built on gold" label ran under the key */
  "Gold":S=>VIEW(S,[32,-28,3],"left"),
  /* Botswana, the stop's subject, and the Jwaneng photo were under the card (the view was centred on the Indian Ocean) */
  "Diamonds":S=>VIEW(S,[12,-14,1.2],"left"),
  /* the "Zambia’s Copperbelt" label ran under the map key */
  "Congo’s cobalt":S=>VIEW(S,[32,-9,2.3]),
  /* the "Ganzhou: heavy rare earths" label ran under the map key */
  "Rare earths aren’t rare":S=>VIEW(S,[121,32,1.5]),
  /* the alumina's starting point, São Luís in Brazil, was off the bottom of the screen, so the arrow came from nowhere;
     further out, both ends show, and Iceland comes down from under the toolbar */
  "Frozen electricity":S=>VIEW(S,[-38,36,1.15],"left"),
  /* the long "Western Sahara (disputed...)" label hung off the bottom of the globe */
  "Phosphate":S=>VIEW(S,[-9.5,26.5,4.3])
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvf fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);
try{applyAll()}catch(e){}setTimeout(applyAll,1500);setTimeout(applyAll,6000);

/* The card shift, kept (as geoflock-polish-rvb.js does for its four tours): psFlyGlobe (index.html) turns a stop's place
   out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre whenever it
   is more than 20° from it, which the shift often is at low zoom. So on these four tours the same stop landed under the
   card or beside it depending on timing. Here aim is told the stop is already aimed, and for four seconds after a stop
   opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more. A drag or
   zoom by the reader in that time cancels it. */
const MYT=new Set(["resources","migration","inventions","environment"]);let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 /* a stop whose own game turns the globe (the oil barrels, the coral reef) is left to it */
 if(document.querySelector(".gc3-ctl,.ge2-ctl,.rvf-ctl[data-turns]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first, find it
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first, or arms the map for a tap. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const F=(q,ll,km,name,o)=>Object.assign({q,ll,km,name},o||{});
 const GS={
  /* World Gold Council, "How much gold has been mined?" (above-ground stocks, end of 2024): about 216,265 t. Gold's
     density is 19.32 t/m³, so the volume is about 11,200 m³, a cube about 22.4 m on each side (the stop's own figure) */
  "resources|Gold":G("All the gold ever mined, melted into one cube: how long would each side be?",1,1000,22,"m",{log:1,show:"about 22 m"}),
  /* USGS Mineral Commodity Summaries 2025, cobalt: DR Congo about 220,000 t of a world 290,000 t in 2024, 76% */
  "resources|Congo’s cobalt":G("What share of the world’s cobalt is dug up in DR Congo?",0,100,75,"%",{step:1,show:"about three-quarters"}),
  /* China's National Bureau of Statistics, 2024 migrant workers monitoring report: 299.73 million */
  "migration|China moves to the cities":G("How many migrant workers have left China’s villages for jobs in its cities?",1,1000,300,"million",{log:1,show:"about 300 million"}),
  /* Pew Research Center / US Census Bureau American Community Survey 2023: about 10.9 million Mexican-born people in the US */
  "migration|Mexico to the US":G("How many people born in Mexico live in the United States?",1,50,11,"million",{step:.5,show:"about 11 million"}),
  /* Deryabina et al., "Long-term census data reveal abundant wildlife populations at Chernobyl", Current Biology 25 (2015):
     wolves about seven times as abundant as in four comparable uninhabited reserves */
  "environment|Chernobyl’s accidental wildlife park":G("Inside the Chernobyl zone, how many times as common are wolves as in nearby nature reserves?",1,20,7,"times",{step:.5,show:"about 7 times"})
 };
 const FS={
  /* Chincha Islands: 13.64° S, 76.40° W, about 20 km off Pisco, Peru */
  "resources|Islands claimed for bird droppings":F("Find the Chincha Islands, the guano islands off the coast of Peru.",[-76.4,-13.64],90,"The Chincha Islands")
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];
 for(const k in FS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.FIND[k]=FS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvd.js: a watchdog polls `ps`, matches the stop by tour and title, adds a control
   block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in amGlobe.host drawn
   with amGlobe.projection()), and removes everything as soon as the stop changes or the tour ends. Next and Back are
   never blocked; every step is wrapped in try/catch. CSS classes start with "rvf-".
   - resources | "Rare earths aren’t rare": sort six elements from most common in Earth's crust to rarest. */
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
function tag(L,cls){const d=document.createElement("div");d.className="rvf-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvf-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvf-new");void e.offsetWidth;e.classList.add("rvf-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ---------------- a sorting game: tap the items in order ----------------
   cfg: {tours, title, tip, items:[[name, value, shown text, note]], desc (biggest first), log (log-scale bars),
   bars (default true), first/last (the ends' words), unit, after(nRight, N) → closing text} */
function SORT(cfg){return{tours:cfg.tours,title:cfg.title,globe:false,tip:cfg.tip,
 card(L){return'<div class="rvf-sortq"><span>'+esc(cfg.first)+'</span><i>→</i><span>'+esc(cfg.last)+'</span></div><ol class="rvf-rank"></ol><div class="rvf-pool"></div>'+
  '<div class="rvf-btns"><button type="button" class="rvf-btn rvf-undo">Undo</button><button type="button" class="rvf-btn rvf-show">Show me</button><button type="button" class="rvf-btn rvf-again" hidden>Start again</button></div>'},
 wire(L){const c=L.card;L.order=[];L.shown=false;
  /* a fixed shuffle (so it never starts in the right order): every other item from the end */
  const idx=cfg.items.map((_,i)=>i),mix=[];for(let i=0;i<idx.length;i++)mix.push(i%2?idx[idx.length-1-(i>>1)]:idx[i>>1]);L.mix=mix.reverse();
  c.querySelector(".rvf-undo").onclick=()=>{if(L.shown)return;L.order.pop();this.render(L)};
  c.querySelector(".rvf-show").onclick=()=>{L.order=this.truth();L.shown=true;L.gave=true;this.render(L)};
  c.querySelector(".rvf-again").onclick=()=>{L.order=[];L.shown=false;L.gave=false;this.render(L)};
  this.render(L)},
 truth(){return cfg.items.map((_,i)=>i).sort((a,b)=>cfg.desc?cfg.items[b][1]-cfg.items[a][1]:cfg.items[a][1]-cfg.items[b][1])},
 render(L){const c=L.card;if(!c)return;const N=cfg.items.length,T=this.truth(),done=L.order.length===N;if(done)L.shown=true;
  const V=cfg.items.map(x=>x[1]),lo=Math.min.apply(null,V),hi=Math.max.apply(null,V);
  const w=v=>cfg.log?8+92*(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo)):8+92*(v-lo)/((hi-lo)||1);
  let right=0;
  setHTML(c.querySelector(".rvf-rank"),L.order.map((k,pos)=>{const it=cfg.items[k],ok=T[pos]===k||cfg.items[T[pos]][1]===it[1];if(ok)right++;
   return'<li class="'+(L.shown?(ok?"rvf-ok":"rvf-no"):"")+'"><span class="rvf-nm">'+esc(it[0])+'</span>'+(L.shown?'<span class="rvf-v">'+esc(it[2])+'</span>'+(cfg.bars!==false?'<i class="rvf-bar" style="width:'+w(it[1]).toFixed(1)+'%"></i>':''):'')+'</li>'}).join(""));
  const pool=c.querySelector(".rvf-pool");pool.innerHTML="";L.mix.filter(k=>!L.order.includes(k)).forEach(k=>{const b=document.createElement("button");b.type="button";b.className="rvf-chip";b.textContent=cfg.items[k][0];
   b.onclick=()=>{if(L.shown)return;L.order.push(k);this.render(L)};pool.appendChild(b)});
  c.querySelector(".rvf-undo").hidden=L.shown||!L.order.length;c.querySelector(".rvf-show").hidden=L.shown;c.querySelector(".rvf-again").hidden=!L.shown;
  if(!L.order.length)say(L,"","Tap the "+cfg.first.toLowerCase()+" first.");
  else if(!done)say(L,"",(N-L.order.length)+" to go. Next one?");
  else if(L.gave)say(L,"Here is the real order",cfg.after(-1,N));
  else say(L,right===N?"All "+N+" in the right place!":right+" of "+N+" in the right place",cfg.after(right,N))}};}

/* ======================================================================== 1. Rare earths: how rare?
   Crust abundances, mg per kg (= grams per tonne): CRC Handbook of Chemistry and Physics, "Abundance of elements in the
   earth's crust and in the sea": cerium 66.5, copper 60, neodymium 41.5, lead 14, tin 2.3, gold 0.004. */
const RARE=SORT({tours:["resources"],title:"Rare earths aren’t rare",
 tip:"Which is most common in Earth’s rocks? Tap them in order, most common first.",first:"Most common",last:"Rarest",desc:true,log:true,
 items:[["Cerium (a rare earth)",66.5,"66 g"],["Copper",60,"60 g"],["Neodymium (a rare earth)",41.5,"42 g"],["Lead",14,"14 g"],["Tin",2.3,"2.3 g"],["Gold",.004,"0.004 g"]],
 after:(n,N)=>"Two ‘rare’ earths beat lead and tin, and cerium is as common as copper. What is rare is a rich, easy deposit, and the skill to separate the 17 rare earths from each other. (Grams in a tonne of average crust rock.)"});

/* ---------------- the engine: one stop at a time ---------------- */
/* ======================================================================== 2. Sail against steam (Atlantic crossing)
   Liverpool to New York along the stop's own arrow. Crossing times are the stop's own: "over a month under sail" and
   "about a week" by steamship. A westbound sailing packet of the 1840s typically took five to six weeks (Norway
   Heritage, "Life at sea: the sailing ship era"); a steam liner of the 1900s, about a week. Here 35 and 7 days. */
const SAIL_D=35,STEAM_D=7,DAY_S=.4;/* seconds of animation per day at sea */
const ATL=[[-3,53.4],[-20,51],[-45,46],[-74,40.7]];
function densify(pts,n){const P=[];for(let i=0;i<pts.length-1;i++){const f=d3.geoInterpolate(pts[i],pts[i+1]);for(let k=0;k<n;k++)P.push(f(k/n))}P.push(pts[pts.length-1]);return P}
const RACE={tours:["migration"],title:"The great Atlantic crossing",globe:true,
 tip:"Race them! A sailing ship and a steamship leave Liverpool for New York on the same day.",
 card(L){return'<div class="rvf-lanes"><div class="rvf-lane"><span>⛵ Sailing ship, 1840s</span><i><b class="rvf-sl"></b></i><em class="rvf-sd">day 0</em></div>'+
  '<div class="rvf-lane"><span>🚢 Steamship, 1900s</span><i><b class="rvf-st"></b></i><em class="rvf-td">day 0</em></div></div>'+
  '<div class="rvf-btns"><button type="button" class="rvf-btn rvf-go">Race! ▶</button><button type="button" class="rvf-btn rvf-reset">Back to Liverpool</button></div>'},
 init(L){L.day=0;L.run=false;L.P=densify(ATL,24);L.trail=svgEl(L.svg,"g",{});L.boats=svgEl(L.svg,"g",{});L.tS=tag(L,"rvf-ctag rvf-boat");L.tT=tag(L,"rvf-ctag rvf-boat rvf-steam")},
 off(L){L.run=false;cancelAnimationFrame(L.af)},
 wire(L){const c=L.card;c.querySelector(".rvf-go").onclick=()=>{if(L.day>=SAIL_D)L.day=0;L.run=true;L.t0=performance.now()-L.day*DAY_S*1000;this.tick(L)};
  c.querySelector(".rvf-reset").onclick=()=>{L.run=false;L.day=0;this.render(L)};this.render(L)},
 tick(L){if(!L.run||!L.card||!L.card.isConnected)return;L.day=Math.min(SAIL_D,(performance.now()-L.t0)/1000/DAY_S);this.render(L);if(L.day>=SAIL_D){L.run=false;this.render(L);return}L.af=requestAnimationFrame(()=>this.tick(L))},
 at(L,f){const P=L.P,x=clamp(f,0,1)*(P.length-1),i=Math.min(P.length-2,Math.floor(x));return d3.geoInterpolate(P[i],P[i+1])(x-i)},
 render(L){const c=L.card;if(!c)return;const d=L.day,fs=d/SAIL_D,ft=Math.min(1,d/STEAM_D);
  c.querySelector(".rvf-sl").style.width=(fs*100).toFixed(1)+"%";c.querySelector(".rvf-st").style.width=(ft*100).toFixed(1)+"%";
  c.querySelector(".rvf-sd").textContent=fs>=1?"New York!":"day "+Math.floor(d);c.querySelector(".rvf-td").textContent=ft>=1?"New York!":"day "+Math.floor(d);
  c.querySelector(".rvf-go").textContent=L.run?"Racing…":d>=SAIL_D?"Race again ▶":d>0?"Go on ▶":"Race! ▶";
  if(d===0)say(L,"","One day at sea passes in under half a second. Who gets to New York first, and how much later is the other?");
  else if(d<STEAM_D)say(L,"Day "+Math.floor(d),"Both ships are out on the Atlantic.");
  else if(d<SAIL_D)say(L,"The steamship is in New York after about a week","The sailing ship is only "+Math.round(fs*100)+"% of the way across. Its passengers still have weeks of cramped, stormy sea ahead.");
  else say(L,"The sailing ship arrives after about five weeks","By then the steamship could have crossed the Atlantic and come back twice. Shorter, cheaper, safer crossings let millions go, and many come home again.");
  L.dirty=1},
 draw(L){const fs=L.day/SAIL_D,ft=Math.min(1,L.day/STEAM_D);
  const part=f=>{const n=Math.max(1,Math.round(f*(L.P.length-1)));return L.P.slice(0,n).concat([this.at(L,f)])};
  setHTML(L.trail,(fs>0?'<path d="'+pathOf(L,part(fs))+'" class="rvf-wake rvf-wsail"/>':'')+(ft>0?'<path d="'+pathOf(L,part(ft))+'" class="rvf-wake rvf-wsteam"/>':''));
  let h="";const qs=proj(L,this.at(L,fs)),qt=proj(L,this.at(L,ft));if(qs)h+='<circle cx="'+qs[0].toFixed(1)+'" cy="'+qs[1].toFixed(1)+'" r="6" class="rvf-bt rvf-bsail"/>';if(qt)h+='<circle cx="'+qt[0].toFixed(1)+'" cy="'+qt[1].toFixed(1)+'" r="6" class="rvf-bt rvf-bsteam"/>';setHTML(L.boats,h);
  /* the two tags sit above and below their boats so they never cover each other */
  putTag(L,L.tS,proj(L,this.at(L,fs),1),"⛵",-34);putTag(L,L.tT,proj(L,this.at(L,ft),1),"🚢",10)}};

/* ======================================================================== 3. Where do Niueans live?
   Niue: 1,681 people at the 2022 census (Niue Statistics Office). New Zealand: 34,944 people of Niuean ethnicity at the
   2023 census (Stats NZ, 2023 Census ethnic group summaries). So about 5 Niueans in 100 live on Niue: about 20 times as
   many live in New Zealand. */
const NIUE_HOME=1681,NIUE_NZ=34944,NIUE_PCT=Math.round(NIUE_HOME/(NIUE_HOME+NIUE_NZ)*100);
const NIUE={tours:["migration"],title:"Niue lives in Auckland",globe:false,
 tip:"Out of every 100 Niueans, how many live on Niue itself? Drag, then check.",
 card(L){return'<div class="rvf-dots" aria-hidden="true">'+Array.from({length:100},()=>"<i></i>").join("")+'</div>'+
  '<div class="rvf-row"><input type="range" class="rvf-rng" min="0" max="100" step="1" value="50" aria-label="Niueans in 100 who live on Niue"><b class="rvf-val"></b></div>'+
  '<div class="rvf-key"><span><i class="rvf-kh"></i>on Niue</span><span><i class="rvf-kn"></i>in New Zealand</span></div>'+
  '<div class="rvf-btns"><button type="button" class="rvf-btn rvf-chk">Check</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvf-rng");L.v=50;L.done=false;r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvf-chk").onclick=()=>{if(L.done){L.done=false;c.querySelector(".rvf-chk").textContent="Check";this.render(L);return}L.done=true;c.querySelector(".rvf-chk").textContent="Try again";this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const v=L.done?NIUE_PCT:L.v;c.querySelectorAll(".rvf-dots i").forEach((d,i)=>d.className=i<v?"rvf-h":"");
  c.querySelector(".rvf-val").textContent=(L.done?NIUE_PCT:L.v)+" in 100";
  if(!L.done)say(L,"","Each dot is one Niuean. Orange ones live on the island.");
  else{const off=Math.abs(L.v-NIUE_PCT);say(L,(off<=3?"Spot on! ":off<=15?"Close. ":"")+"Only about "+NIUE_PCT+" in 100","You guessed "+L.v+". About "+fmt(NIUE_HOME)+" people live on Niue (2022 census), but "+fmt(NIUE_NZ)+" people in New Zealand are Niuean (2023 census): about 20 times as many.")}}};

/* ======================================================================== 4. Shorter than a jumbo jet
   Orville Wright's first flight, 17 December 1903: 12 seconds, 120 ft (36.6 m); the fourth flight that day, Wilbur's,
   852 ft (260 m) in 59 seconds (Smithsonian National Air and Space Museum, "The 1903 Wright Flyer"). Boeing 747-400
   wingspan 64.4 m (Boeing, 747-400 airport planning document). */
const WRIGHT1=36.6,WRIGHT4=260,JUMBO=64.4,FMAX=100;
const FLIGHT={tours:["inventions"],title:"Taking to the air",globe:false,
 tip:"How far did the first powered flight go? Drag the little plane along the jumbo jet’s wings.",
 card(L){const X=m=>(10+m/FMAX*280).toFixed(1);
  return'<svg class="rvf-jet" viewBox="0 0 300 120" role="img" aria-label="A jumbo jet seen from above, 64 m from wingtip to wingtip, with a scale in metres">'+
  '<path class="rvf-jb" d="M'+X(JUMBO/2-3)+' 8 L'+X(JUMBO/2+3)+' 8 L'+X(JUMBO/2+3)+' 46 L'+X(JUMBO)+' 64 L'+X(JUMBO)+' 70 L'+X(JUMBO/2+3)+' 62 L'+X(JUMBO/2+2)+' 92 L'+X(JUMBO/2+11)+' 100 L'+X(JUMBO/2+11)+' 104 L'+X(JUMBO/2)+' 100 L'+X(JUMBO/2-11)+' 104 L'+X(JUMBO/2-11)+' 100 L'+X(JUMBO/2-2)+' 92 L'+X(JUMBO/2-3)+' 62 L'+X(0)+' 70 L'+X(0)+' 64 L'+X(JUMBO/2-3)+' 46 Z"/>'+
  '<line class="rvf-span" x1="'+X(0)+'" x2="'+X(JUMBO)+'" y1="78" y2="78"/><text class="rvf-st2" x="'+X(JUMBO/2)+'" y="89" text-anchor="middle">747 wingspan 64 m</text>'+
  [0,20,40,60,80,100].map(m=>'<line class="rvf-tk" x1="'+X(m)+'" x2="'+X(m)+'" y1="110" y2="114"/><text class="rvf-st2" x="'+X(m)+'" y="119" text-anchor="middle">'+m+' m</text>').join("")+
  '<line class="rvf-tk" x1="'+X(0)+'" x2="'+X(FMAX)+'" y1="110" y2="110"/>'+
  '<line class="rvf-fl rvf-real" x1="'+X(0)+'" x2="'+X(WRIGHT1)+'" y1="36" y2="36"/><line class="rvf-fl rvf-mine" x1="'+X(0)+'" y1="28" y2="28"/>'+
  '<text class="rvf-pl" y="31" text-anchor="middle">✈</text></svg>'+
  '<div class="rvf-row"><input type="range" class="rvf-rng" min="0" max="'+FMAX+'" step="1" value="80" aria-label="Your guess, metres"><b class="rvf-val"></b></div>'+
  '<div class="rvf-btns"><button type="button" class="rvf-btn rvf-chk">Land it here</button></div>'},
 wire(L){const c=L.card,r=c.querySelector(".rvf-rng");L.v=80;L.done=false;r.oninput=()=>{if(L.done)return;L.v=+r.value;this.render(L)};
  c.querySelector(".rvf-chk").onclick=()=>{L.done=!L.done;c.querySelector(".rvf-chk").textContent=L.done?"Try again":"Land it here";this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const X=m=>10+m/FMAX*280;const pl=c.querySelector(".rvf-pl");pl.setAttribute("x",X(L.v).toFixed(1));
  c.querySelector(".rvf-mine").setAttribute("x2",X(L.v).toFixed(1));c.querySelector(".rvf-real").style.opacity=L.done?1:0;c.querySelector(".rvf-val").textContent=L.v+" m";
  if(!L.done)say(L,"","The jet is drawn to scale: wingtip to wingtip is 64 m.");
  else{const off=Math.abs(L.v-WRIGHT1);say(L,(off<=5?"Spot on! ":off<=15?"Close! ":"")+"About 37 m, in 12 seconds","You said "+L.v+" m. The first flight (green) would fit between a jumbo jet’s wingtips with about 27 m to spare. Later that day Wilbur flew 260 m in 59 seconds, and the age of flying had begun.")}}};

/* ======================================================================== 5. Inventions in order (the tour's last stop)
   Dates are the tour's own: wheeled carts about 3500 BC; rubber balls at El Manatí about 1600 BC; the Diamond Sutra,
   the oldest dated printed book, 868; Newcomen's engine 1712; Jenner's vaccine 1796; Bell's telephone patent 1876;
   Fleming's penicillin 1928; the Web proposed 1989. */
const yr=y=>y<0?"about "+(-y)+" BC":String(y);
const TIMELINE=SORT({tours:["inventions"],title:"Now explore",
 tip:"How well do you know the tour? Put these in order, oldest first.",first:"Oldest",last:"Newest",desc:false,bars:false,
 items:[["The telephone",1876,yr(1876)],["The wheel",-3500,yr(-3500)],["The World Wide Web",1989,yr(1989)],["A printed book",868,yr(868)],["Bouncy rubber balls",-1600,yr(-1600)],["The steam engine",1712,yr(1712)],["Penicillin",1928,yr(1928)],["The first vaccine",1796,yr(1796)]],
 after:(n,N)=>"Over 5,000 years separate the first and the last, and the last five came in under 300 years."});

/* ======================================================================== 6. Norway goes electric
   Fully electric cars as a share of new passenger cars sold in Norway, rounded: OFV (Opplysningsrådet for
   veitrafikken), yearly registration statistics, as tabulated by the Norwegian EV Association (elbil.no):
   2014 12.5%, 2015 17.1%, 2016 15.7%, 2017 20.8%, 2018 31.2%, 2019 42.4%, 2020 54.3%, 2021 64.5%, 2022 79.3%,
   2023 82.4%, 2024 88.9%, 2025 95.9%. */
const EV={2014:12.5,2015:17.1,2016:15.7,2017:20.8,2018:31.2,2019:42.4,2020:54.3,2021:64.5,2022:79.3,2023:82.4,2024:88.9,2025:95.9};
const NORWAY={tours:["environment"],title:"Electric Norway",globe:false,
 tip:"Slide through the years. In which year were more than half of Norway’s new cars electric for the first time?",
 card(L){return'<div class="rvf-cars" aria-hidden="true">'+Array.from({length:100},()=>"<i></i>").join("")+'</div>'+
  '<div class="rvf-row"><input type="range" class="rvf-rng" min="2014" max="2025" step="1" value="2014" aria-label="Year"><b class="rvf-val"></b></div>'+
  '<div class="rvf-key"><span><i class="rvf-ke"></i>electric</span><span><i class="rvf-kp"></i>petrol, diesel or hybrid</span></div>'},
 wire(L){const r=L.card.querySelector(".rvf-rng");L.y=2014;L.seen=false;r.oninput=()=>{L.y=+r.value;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const p=EV[L.y],n=Math.round(p);c.querySelectorAll(".rvf-cars i").forEach((d,i)=>d.className=i<n?"rvf-e":"");
  c.querySelector(".rvf-val").textContent=L.y+": "+Math.round(p)+"%";
  if(L.y===2020){L.seen=true;say(L,"Yes: 2020","For the first time, more than half the new cars sold in Norway, "+Math.round(p)+" in 100, were fully electric.")}
  else if(L.y===2025)say(L,"2025: "+Math.round(p)+" in 100","Petrol and diesel cars have almost vanished from Norway’s showrooms."+(L.seen?"":" Now go back: when did electric first pass half?"))
  else if(L.y<2020)say(L,L.y+": "+Math.round(p)+" in 100",L.seen?"Electric cars were still a minority of new cars.":"Not yet half. Keep sliding.")
  else say(L,L.y+": "+Math.round(p)+" in 100",L.seen?"Every year since 2020 the share has gone up.":"Past half already. Was it the first year? Slide back to check.")}};

/* ======================================================================== 7. CO₂ per person, in order
   The stop's own list (rough 2023 values, Global Carbon Budget via Our World in Data): Qatar about 35–40 t, Saudi
   Arabia about 18, United States about 14, China about 9, world about 5, India about 2. The numbers only set the order;
   the card shows the list's own words. */
const CO2=SORT({tours:["environment"],title:"Per person, the Gulf",
 tip:"Who emits the most CO₂ per person in a year? Tap them in order, most first.",first:"Most",last:"Least",desc:true,log:false,
 items:[["China",9,"about 9 t"],["Qatar",37.5,"about 35–40 t"],["India",2,"about 2 t"],["United States",14,"about 14 t"],["World average",5,"about 5 t"],["Saudi Arabia",18,"about 18 t"]],
 after:(n,N)=>"Per person, someone in Qatar emits over 15 times as much as someone in India. China, the biggest emitter in total, is under the US per person."});

const DEFS=[RARE,RACE,NIUE,FLIGHT,TIMELINE,NORWAY,CO2];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if(D.globe&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvf-layer";el.innerHTML='<svg class="rvf-sv"><defs><clipPath id="rvfDisc"><path class="rvf-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvfDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvf-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvf-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvf-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvf-ctl";
 c.innerHTML='<div class="rvf-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvf-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty||L.anim){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvf-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvf-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvf-sv{position:absolute;left:0;top:0;overflow:visible}
.rvf-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvf-ctag{background:#13294b;color:#fff;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvf-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvf-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvf-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rvf-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvf-btn[hidden]{display:none}
.rvf-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvf-ep b{display:block;font-size:15px}
.rvf-ep.rvf-new{animation:rvfIn .45s ease}@keyframes rvfIn{from{opacity:.2;transform:translateY(4px)}}
.rvf-sortq{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#5b6b7c;margin-bottom:4px}.rvf-sortq i{font-style:normal}
.rvf-rank{list-style:none;margin:0 0 6px;padding:0;counter-reset:rvf}
.rvf-rank li{position:relative;counter-increment:rvf;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 30px;margin:3px 0;border-radius:8px;background:#fff;border:1px solid rgba(19,41,75,.14);font-size:13px;font-weight:700;color:#13294b;overflow:hidden}
.rvf-rank li::before{content:counter(rvf);position:absolute;left:8px;font-weight:800;color:#9a4a16}
.rvf-rank li.rvf-ok{border-color:#1f8a4c;box-shadow:inset 3px 0 0 #1f8a4c}.rvf-rank li.rvf-no{border-color:#c2364f;box-shadow:inset 3px 0 0 #c2364f}
.rvf-nm{flex:1 1 auto;z-index:1}.rvf-v{z-index:1;font-weight:800;white-space:nowrap}
.rvf-bar{position:absolute;left:0;top:0;bottom:0;background:rgba(217,104,43,.16);transition:width .5s}
.rvf-pool{display:flex;flex-wrap:wrap;gap:5px}
.rvf-chip{border:1px dashed rgba(19,41,75,.35);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:5px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvf-chip:hover{border-style:solid;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvf-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvf-do,:is(body.dark-theme,body.sky-night) .rvf-rank li::before{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvf-sortq{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvf-btn,:is(body.dark-theme,body.sky-night) .rvf-chip,:is(body.dark-theme,body.sky-night) .rvf-rank li{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.22)}
:is(body.dark-theme,body.sky-night) .rvf-rank li.rvf-ok{border-color:#4cc27f;box-shadow:inset 3px 0 0 #4cc27f}:is(body.dark-theme,body.sky-night) .rvf-rank li.rvf-no{border-color:#ff7088;box-shadow:inset 3px 0 0 #ff7088}
:is(body.dark-theme,body.sky-night) .rvf-bar{background:rgba(255,178,122,.2)}
.rvf-boat{font-size:15px;padding:2px 6px}.rvf-steam{background:#9a4a16}
.rvf-bt{stroke:#fff;stroke-width:2.5}.rvf-bsail{fill:#13294b}.rvf-bsteam{fill:#d9682b}
.rvf-wake{fill:none;stroke-width:3.5;stroke-linecap:round}.rvf-wsail{stroke:#13294b;stroke-dasharray:2 6}.rvf-wsteam{stroke:#d9682b}
.rvf-lanes{display:grid;gap:6px}.rvf-lane{display:grid;grid-template-columns:150px 1fr 70px;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
.rvf-lane i{display:block;height:10px;border-radius:5px;background:rgba(19,41,75,.1);overflow:hidden}.rvf-lane b{display:block;height:100%;width:0;background:#13294b;border-radius:5px}.rvf-lane b.rvf-st{background:#d9682b}
.rvf-lane em{font-style:normal;text-align:right;color:#9a4a16;white-space:nowrap}
.rvf-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvf-rng{flex:1 1 auto;accent-color:#d9682b}.rvf-val{min-width:84px;text-align:right;font-size:15px;color:#9a4a16;white-space:nowrap}
.rvf-dots,.rvf-cars{display:grid;grid-template-columns:repeat(20,1fr);gap:3px;margin:2px 0 4px}
.rvf-dots i,.rvf-cars i{display:block;aspect-ratio:1;border-radius:50%;background:#3b7bd4;transition:background .2s}.rvf-dots i.rvf-h{background:#d9682b}
.rvf-cars i{border-radius:3px;background:#9aa7b6}.rvf-cars i.rvf-e{background:#1f9a5a}
.rvf-key{display:flex;gap:14px;font-size:12px;font-weight:700;color:#5b6b7c;margin-top:4px}.rvf-key i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
.rvf-kh{background:#d9682b}.rvf-kn{background:#3b7bd4}.rvf-ke{background:#1f9a5a;border-radius:2px!important}.rvf-kp{background:#9aa7b6;border-radius:2px!important}
.rvf-jet{display:block;width:100%;height:auto;border-radius:10px;background:linear-gradient(#eaf4fb,#fff)}
.rvf-jb{fill:#c9d3de;stroke:#6b7c90;stroke-width:1}.rvf-span{stroke:#6b7c90;stroke-width:1;stroke-dasharray:3 2}
.rvf-st2{font:700 8.5px system-ui,sans-serif;fill:#13294b}.rvf-tk{stroke:#13294b;stroke-width:1}
.rvf-fl{stroke-width:4;stroke-linecap:round}.rvf-mine{stroke:#d9682b}.rvf-real{stroke:#1f9a5a;transition:opacity .4s}
.rvf-pl{font-size:14px;fill:#13294b}
:is(body.dark-theme,body.sky-night) .rvf-lane i{background:rgba(255,255,255,.15)}:is(body.dark-theme,body.sky-night) .rvf-lane b{background:#9fc3ff}
:is(body.dark-theme,body.sky-night) .rvf-lane em,:is(body.dark-theme,body.sky-night) .rvf-val{color:#ffb27a}:is(body.dark-theme,body.sky-night) .rvf-key{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvf-jet{background:linear-gradient(#1d2b44,#14203a)}:is(body.dark-theme,body.sky-night) .rvf-jb{fill:#55657c;stroke:#9fb0c6}
:is(body.dark-theme,body.sky-night) .rvf-st2,:is(body.dark-theme,body.sky-night) .rvf-pl{fill:#e8eefc}:is(body.dark-theme,body.sky-night) .rvf-tk{stroke:#e8eefc}
:is(body.dark-theme,body.sky-night) .rvf-cars i{background:#5d6b7c}:is(body.dark-theme,body.sky-night) .rvf-cars i.rvf-e{background:#3fcf7f}`;document.head.appendChild(s)}

window.gfPolishRvf={v:1,FIX,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
