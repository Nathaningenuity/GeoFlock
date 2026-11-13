/* GeoFlock polish RV-K: a stop-by-stop review of four AP Human Geography tours, Why people move (hg2c), Population
   futures (hg2d), How culture spreads (hg3a) and Cultural landscapes (hg3b), each looked at on the globe, their default
   mode, at 1280×860. (Models of population, hg2b, was reviewed in geoflock-polish-rvj.js.)
   1. Fixes, keyed by tour and stop title, applied once the page has settled and again whenever one of these tours is on
      (to the stops psSteps() builds as well). Each fix says why; changed facts cite their source.
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rvc.js / -rvg.js) a fixed field
   becomes a non-configurable getter whose setter is ignored; a field already non-configurable (fixed by another file)
   is left alone. CSS classes start with "rvk-". Everything is wrapped in try/catch; Next and Back are never blocked. */
(function(){
"use strict";
if(window.gfPolishRvk)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};
const TEST=()=>!!(window.__rvkTest||/[?&]rvktest\b/.test(location.search));

/* ======================================================================== part 1: data fixes */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* a field that keeps taking new values from other scripts, but always reads back filtered */
const FILT=(S,k,fn)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvk){d.get._rvk.push(fn);return}if(d&&d.configurable===false)return;let v=S[k];const fns=[fn];
 const get=()=>fns.reduce((x,f)=>{try{return f(x)}catch(e){return x}},v);get._rvk=fns;
 Object.defineProperty(S,k,{configurable:TEST(),enumerable:true,get,set:x=>{v=x}})}catch(e){}};
/* swap one phrase in a text field, now and whenever another script sets the field again */
const RE=(S,k,a,b)=>FILT(S,k,t=>typeof t==="string"&&t.indexOf(a)>=0?t.split(a).join(b):t);
const pinText=p=>Array.isArray(p)?String(p[1]||""):String(p&&(p.text||p.label)||"");
/* drop the text pins / photo pins whose label matches (also from pins other scripts add later) */
const DROP=(S,re)=>FILT(S,"pins",P=>Array.isArray(P)?P.filter(p=>!re.test(strip(pinText(p)))):P);
const DROPPH=(S,re)=>FILT(S,"phPins",P=>Array.isArray(P)?P.filter(q=>!re.test(strip(q&&q.label))):P);
/* framing: [lon, lat, zoom] of the place the stop is about; the tour engine turns it out from under the card */
const VIEW=(S,gl,card)=>{LOCK(S,"globe",gl);if(card)LOCK(S,"card",card)};

const FIX={
 hg2c:{
  /* the Beijing West station photo sat under the map key */
  "Why people move":S=>DROPPH(S,/^Beijing/),
  /* the 300 km ruler's distance tag lay on the Lampedusa pin: closer in, the crossing fills the space beside the card */
  "Obstacles and opportunities":S=>VIEW(S,[12.9,34.2,5],"left"),
  /* the route through the jungle was a few pixels long */
  "The jungle that emptied":S=>VIEW(S,[-77.4,8.4,6],"left"),
  /* London, one end of the chain, was under the card, and the Punjab line ran into it */
  "Step by step, link by link":S=>VIEW(S,[44,36,1],"left"),
  /* the Lagos photo hung off the bottom of the globe, under the graphics notice */
  "Brain drain":S=>VIEW(S,[2,19,1.3],"left")
 },
 hg2d:{
  /* the card stood on the right, over South Korea, the headline, and the Hungary label lay across the People map's
     own buttons. index.html flies to the middle of a stop's pins, so with South Korea's pin the globe turned to the
     Arctic between the three: Europe's two examples now sit beside the card; buttons (part 3) turn the globe to South Korea and
     Singapore. Hungary: mothers of three, not only four, have paid no income tax since 1 October 2025 (Hungarian
     government; Hungary Today, "New income tax exemption for mothers of three takes effect today", 1 October 2025) */
  "Pronatalist policies":S=>{VIEW(S,[12,47,2.4],"left");DROP(S,/^South Korea$/);RE(S,"body","Hungary exempts mothers of four from income tax for life","Hungary exempts mothers of three or more from income tax for life")},
  /* Kerala sat at the globe's edge */
  "Women and fewer births":S=>VIEW(S,[64,22,1.7],"left"),
  /* the Toronto photo was under the card */
  "Choosing who comes in":S=>VIEW(S,[-85,45,1.5],"left")
 },
 hg3a:{
  /* the Nile and Mesopotamia labels were under the card's edge and Mesoamerica round the back: the stop now opens on
     the Old World hearths, and buttons (part 3) turn the globe to each of the six */
  "Cultural hearths":S=>VIEW(S,[72,28,1.1],"left"),
  /* Córdoba, one end of the ruler, was under the card and its distance tag cut in half */
  "Expansion diffusion":S=>VIEW(S,[30,33,1.15],"left"),
  /* the card stood on the right, over Paris and Milan, and the map's floating key lay across its close button */
  "Hierarchical diffusion":S=>VIEW(S,[-27,44,1.2],"left"),
  /* the stop was text only (geoflock-tourflags.js flags it so) with nothing on the map: its own example, France's
     radio quota (at least 40% of songs in French, under the 1994 amendment to the 1986 broadcasting law, "loi
     Carignon"), now has a pin, and the stop has a sorting game (part 3) */
  "Global culture, local culture":S=>{VIEW(S,[8,42,1.6],"left");FILT(S,"pins",P=>(Array.isArray(P)?P:[]).filter(p=>!/^France: 40%/.test(strip(pinText(p)))).concat([[[2.35,46.6],"France: 40% of radio songs in French","point"]]))}
 },
 hg3b:{
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvk fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
/* geoflock-polish-b.js re-patches some stops with Object.defineProperty at load + 1.5 s and 4 s after it runs; a field
   fixed here before then would make those writes throw. So the fixes start once the page has settled (6 s), or as soon
   as one of these tours is opened, whichever comes first. */
let lastKey="",ready=false;
const start=()=>{if(ready)return;ready=true;applyAll()};
if(document.readyState==="complete")setTimeout(start,6000);else addEventListener("load",()=>setTimeout(start,6000));
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}if(!ready)start();const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);

/* The card shift, kept (as geoflock-polish-rvb.js and -rvj.js do for theirs): psFlyGlobe (index.html) turns a stop's
   place out from under the card, but geoflock-tourload.js's "aim" turns the globe back to the stop's plain centre
   whenever it is more than 20° from it. So on these tours aim is told the stop is already aimed, and for four seconds
   after a stop opens, if the globe has come to rest away from where psFlyGlobe would put it, it flies there once more.
   A drag or zoom by the reader in that time cancels it, and so does a stop whose own buttons turn the globe. */
const MYT=new Set(Object.keys(FIX));let goAt=0,goKey="",refl=0,touched=0;
function flyTarget(){const S=psSteps()[ps.i];let[lon,lat,z]=psGlobeTarget(S);const over=psCardOver();
 if(over){const R=ps.g.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;lon-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}return[lon,lat,z]}
["pointerdown","wheel"].forEach(t=>addEventListener(t,e=>{try{if(e.target&&e.target.closest&&e.target.closest(".globe-host canvas, .globe-stage"))touched=1}catch(err){}},true));
every(()=>{try{if(typeof ps==="undefined"||!ps||!MYT.has(ps.tour)||ps.mode!=="globe"||!ps.g||typeof psGlobeTarget!=="function"||typeof psFlyGlobe!=="function")return;
 const key=ps.tour+"|"+ps.i;if(key!==goKey){goKey=key;goAt=performance.now();refl=0;touched=0}ps._gfAimed=psSteps()[ps.i];
 if(document.querySelector(".rvk-ctl[data-turned]"))return;
 const t=performance.now()-goAt;if(touched||refl>=2||t<900||t>4500||ps.g._flying)return;
 const T=flyTarget(),c=[-ps.g.rot[0],-ps.g.rot[1]];if(d3.geoDistance(c,[T[0],T[1]])>.06||Math.abs(ps.g.zoom-T[2])>.15){refl++;psFlyGlobe()}}catch(e){}},250);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS||!TP.FIND)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* Panama's National Migration Service / Ministry of Public Security: 520,085 people crossed the Darién in 2023 */
  "hg2c|The jungle that emptied":G("How many people walked through the Darién jungle in 2023?",1000,2000000,520000,"",{log:1,show:"about 520,000"}),
  /* Romania, live births: 273,687 in 1966 and 527,764 in 1967 (US Library of Congress, Romania: a country study, 1989,
     "Demographic Policy") */
  "hg2d|The decree that doubled births":G("Romania had about 274,000 births in 1966. How many in 1967, after the ban?",200000,800000,528000,"",{step:1000,show:"about 528,000"}),
  /* Statistics Bureau of Japan: 29.3% of the population 65 or older (15 September 2024) */
  "hg2d|An ageing world":G("What share of Japan’s people are 65 or older?",0,60,29,"%",{step:1,show:"about 29%"})
 };
 for(const k in GS)if(!TP.GUESS[k]&&!TP.FIND[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-polish-rvg.js / -rvj.js: a watchdog polls `ps`, matches the stop by tour and title, adds a
   control block after the stop's headline with a one-line instruction (and, for the globe ones, a layer in
   amGlobe.host), and removes everything as soon as the stop changes or the tour ends.
   - hg2c | "Push and pull": push or pull? Sort eight reasons people move.
   - hg2c | "Displaced at home": refugee, asylum seeker, displaced at home or voluntary migrant? Sort six people.
   - hg2d | "Pronatalist policies": France, Hungary, South Korea and Singapore are half a world apart; buttons turn the
            globe to each, with what its payments achieved.
   - hg2d | "Women and fewer births": pronatalist or antinatalist? Sort eight policies from the tour.
   - hg2d | "The rich country with big families": put six countries in order of children per woman.
   - hg3a | "Cultural hearths": the six hearths circle the globe; buttons turn it to each.
   - hg3a | "Expansion diffusion": drag the years from 610 to 750 and watch Muslim rule spread from Arabia.
   - hg3a | "Global culture, local culture": relocation, contagious, hierarchical or stimulus? Sort eight examples.
   - hg3b | "Folk and popular culture": folk or popular? Sort eight things. */
const NS="http://www.w3.org/2000/svg";
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvk-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+esc(head)+"</b>":"")+"<span>"+esc(text)+"</span>";e.classList.remove("rvk-new");void e.offsetWidth;e.classList.add("rvk-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
const shuffle=(a,seed)=>{let s=seed>>>0;const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
/* turn the globe to a place, beside the card (the same card-aware flight as psFlyGlobe in index.html) */
function turnGlobe(lon,lat,z){try{const G=ps&&ps.g;if(!G||ps.mode!=="globe")return;let L0=lon;const over=typeof psCardOver==="function"?psCardOver():0;
 if(over){const R=G.size().r*z,a=Math.asin(Math.min(.6,Math.abs(over)/2/R))*180/Math.PI;L0-=Math.sign(over)*a/Math.max(.35,Math.cos(lat*Math.PI/180))}
 const from=[-G.rot[0],-G.rot[1]],to=[L0,lat],ip=d3.geoInterpolate(from,to),z0=G.zoom,ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1400,t0=performance.now();
 const id=G._flyId=(G._flyId||0)+1;G._flying=true;
 const step=t=>{if(G._flyId!==id||G._dead||ps.g!==G)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(e),lift=Math.sin(Math.PI*e)*.3;
  G.zoom=Math.max(1,(z0+(z-z0)*e)*(1-lift));G.rot=[-c[0],-c[1]];G.render();if(k<1)requestAnimationFrame(step);else{G._flying=false;G._flyId++}};requestAnimationFrame(step)}catch(e){}}

/* ---------------------------------------------------------------- RANK: tap the items in order (from rvg) */
function rankDef(tour,title,o){return{tour,title,globe:false,tip:o.tip,
 card:()=>'<div class="rvk-pool"></div><div class="rvk-order"></div><div class="rvk-row"><button type="button" class="rvk-btn rvk-undo">↶ Undo</button><button type="button" class="rvk-btn rvk-reset">↺ Start again</button></div>',
 init(L){L.pick=[];L.items=shuffle(o.items.map((x,i)=>i),o.seed||7)},
 wire(L){const c=L.card;c.querySelector(".rvk-undo").onclick=()=>{if(L.pick.length&&L.pick.length<o.items.length)L.pick.pop();this.render(L)};
  c.querySelector(".rvk-reset").onclick=()=>{L.pick=[];this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const n=o.items.length,done=L.pick.length===n;
  setHTML(c.querySelector(".rvk-pool"),done?"":L.items.filter(i=>!L.pick.includes(i)).map(i=>'<button type="button" class="rvk-chip" data-i="'+i+'">'+esc(o.items[i][0])+"</button>").join(""));
  c.querySelectorAll(".rvk-chip").forEach(b=>b.onclick=()=>{L.pick.push(+b.dataset.i);this.render(L)});
  let right=0;const rows=[];for(let k=0;k<n;k++){const i=L.pick[k];if(i==null){rows.push('<div class="rvk-slot rvk-empty"><em>'+(k+1)+'</em><span>'+(k===L.pick.length?"tap the "+(k===0?o.first:"next"):"")+"</span></div>");continue}
   const ok=done&&i===k;if(ok)right++;rows.push('<div class="rvk-slot'+(done?ok?" rvk-ok":" rvk-no":"")+'"><em>'+(k+1)+"</em><span>"+esc(o.items[i][0])+"</span>"+(done?"<b>"+esc(o.items[i][1])+(ok?"":' <i>(no. '+(i+1)+")</i>")+"</b>":"")+"</div>")}
  setHTML(c.querySelector(".rvk-order"),rows.join(""));c.querySelector(".rvk-undo").disabled=!L.pick.length||done;
  if(!L.pick.length)say(L,o.head,o.intro);else if(!done)say(L,"",o.items.length-L.pick.length+" to go");
  else say(L,right+" of "+n+" in the right place"+(right===n?"!":""),o.after)}}}

/* ---------------------------------------------------------------- BIN: one item at a time; which kind is it? */
function binDef(tour,title,o){return{tour,title,globe:false,tip:o.tip,
 card:()=>'<div class="rvk-q"><span class="rvk-n"></span><b class="rvk-item"></b></div><div class="rvk-row rvk-bins">'+o.keys.map(k=>'<button type="button" class="rvk-btn rvk-bin" data-k="'+k[0]+'">'+esc(k[1])+"</button>").join("")+'</div>'+
  '<div class="rvk-dots">'+o.items.map(()=>"<i></i>").join("")+'</div><div class="rvk-row"><button type="button" class="rvk-btn rvk-next" hidden>Next ▶</button><button type="button" class="rvk-btn rvk-again" hidden>Play again</button></div>',
 init(L){L.k=0;L.res=[];L.ans=null},
 wire(L){const c=L.card;
  c.querySelectorAll(".rvk-bin").forEach(b=>b.onclick=()=>{if(L.ans||L.k>=o.items.length)return;L.ans=b.dataset.k;L.res[L.k]=L.ans===o.items[L.k][1];this.render(L)});
  c.querySelector(".rvk-next").onclick=()=>{L.k++;L.ans=null;this.render(L)};
  c.querySelector(".rvk-again").onclick=()=>{L.k=0;L.res=[];L.ans=null;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const N=o.items.length,end=L.k>=N,it=o.items[Math.min(L.k,N-1)];
  c.querySelector(".rvk-n").textContent=end?"Done":(L.k+1)+" / "+N;c.querySelector(".rvk-item").textContent=end?"":it[0];
  c.querySelectorAll(".rvk-bin").forEach(b=>{b.hidden=end;b.disabled=!!L.ans;b.classList.toggle("rvk-right",!!L.ans&&b.dataset.k===it[1]);b.classList.toggle("rvk-wrong",!!L.ans&&b.dataset.k===L.ans&&L.ans!==it[1])});
  c.querySelectorAll(".rvk-dots i").forEach((d,i)=>d.className=L.res[i]===true?"rvk-ok":L.res[i]===false?"rvk-no":i===L.k&&!end?"rvk-at":"");
  const nx=c.querySelector(".rvk-next");nx.hidden=end||!L.ans;nx.textContent=L.k===N-1?"See my score ▶":"Next ▶";c.querySelector(".rvk-again").hidden=!end;
  const name=k=>(o.keys.find(x=>x[0]===k)||[,""])[1];
  if(end){const r=L.res.filter(Boolean).length;say(L,r+" of "+N+(r===N?": all right!":""),o.done)}
  else if(!L.ans)say(L,"",o.ask);
  else if(L.ans===it[1])say(L,"Right: "+name(it[1]),it[2]);
  else say(L,"Not quite: "+name(it[1]),it[2])}}}

/* ---------------------------------------------------------------- TURN: buttons turn the globe from place to place */
function turnDef(tour,title,o){return{tour,title,globe:true,turn:true,tip:o.tip,
 card:()=>'<div class="rvk-row rvk-turn">'+o.places.map((f,i)=>'<button type="button" class="rvk-btn" data-i="'+i+'"></button>').join("")+'</div>',
 init(L){L.at=-1;L.t=0;L.ring=svgEl(L.svg,"circle",{r:"9",class:"rvk-ring"});L.tag=document.createElement("div");L.tag.className="rvk-tag rvk-new2";L.el.appendChild(L.tag)},
 tick(L,dt){L.t+=dt;if(L.at>=0)L.ring.setAttribute("r",(9+4*Math.abs(Math.sin(L.t*3))).toFixed(1))},
 draw(L){const f=L.at>=0?o.places[L.at]:null,q=f?proj(L,[f[1],f[2]]):null,qq=f?proj(L,[f[1],f[2]],1):null;
  if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1))}else L.ring.style.display="none";
  if(qq){L.tag.style.display="";if(L.tag._h!==f[0]){L.tag.textContent=f[0];L.tag._h=f[0]}L.tag.style.left=qq[0]+"px";L.tag.style.top=(qq[1]+16)+"px"}else L.tag.style.display="none"},
 wire(L){const c=L.card;c.querySelectorAll(".rvk-turn button").forEach(b=>b.onclick=()=>{const f=o.places[+b.dataset.i];L.at=+b.dataset.i;c.dataset.turned="1";turnGlobe(f[1],f[2],f[3]);this.render(L)});this.render(L)},
 render(L){const c=L.card;if(!c)return;c.querySelectorAll(".rvk-turn button").forEach(b=>{const k=+b.dataset.i;b.classList.toggle("rvk-cur",k===L.at);b.textContent=(k===L.at?"● ":"")+o.places[k][0]});
  if(L.at<0)say(L,"",o.intro);else{const f=o.places[L.at];say(L,f[0],f[4])}}}}

/* ======================================================================== hg2c: Why people move */
/* Push or pull, and which kind: the four kinds (economic, political, social, environmental) the stop's own "Tell me
   more" names, as in the AP Human Geography course outline (Topic 2.10, "Causes of Migration"). */
const PUSHPULL=binDef("hg2c","Push and pull",{tip:"Push or pull? Sort eight reasons people move.",
 keys:[["push","⬅ Push: drives people out"],["pull","➡ Pull: draws them in"]],ask:"Does this push people out of a place, or pull them towards one?",
 items:[["War breaks out in your city","push","Push, political: conflict and persecution drive people out."],
  ["Factory jobs that pay five times more","pull","Pull, economic: higher wages are the biggest pull of all."],
  ["Years of drought ruin the harvests","push","Push, environmental: when the land fails, farmers leave."],
  ["Your cousins already live there","pull","Pull, social: family and friends make a new place easier. That is how chain migration starts."],
  ["You could be jailed for your religion","push","Push, political (or cultural): persecution drives people out, often as refugees."],
  ["A safe, stable government","pull","Pull, political: safety and the rule of law draw people in."],
  ["The factory in your town has closed","push","Push, economic: no work at home."],
  ["Good schools and hospitals","pull","Pull, social: people move for their children’s future and their health."]],
 done:"Most moves have both: something pushing at home and something pulling elsewhere. A good AP answer names the kind too: economic, political, social or environmental."});
/* Refugee, asylum seeker and internally displaced person as the tour (and UNHCR) define them; "voluntary migrant" is
   the stops' other kind. The examples are the tour's own (Syria, Sudan, Ukraine, the Gulf, Nigerian doctors). */
const WHO=binDef("hg2c","Displaced at home",{tip:"Refugee, asylum seeker, displaced at home, or a voluntary migrant? Sort six people.",
 keys:[["r","Refugee"],["a","Asylum seeker"],["i","Displaced at home (IDP)"],["v","Voluntary migrant"]],ask:"Which word fits this person best?",
 items:[["A family flees fighting in Khartoum to a town elsewhere in Sudan","i","They fled but never crossed a border: internally displaced, and no foreign country is responsible for them."],
  ["A Syrian family has lived in a camp in Jordan since 2013, recognised as needing protection","r","They crossed a border to escape war and were granted protection: refugees."],
  ["A Nigerian nurse takes a better-paid job in a London hospital","v","She chose to move, for pay and career: a voluntary migrant (and part of the brain drain)."],
  ["A young man reaches Italy by boat and asks for protection; his case will take months","a","He has asked for protection and awaits an answer: an asylum seeker. If accepted, he becomes a refugee."],
  ["An Indian builder signs a two-year contract in Dubai","v","A voluntary, temporary move for work: a guest worker."],
  ["A Ukrainian mother leaves Kharkiv for Lviv, in the west of Ukraine, in 2022","i","Still inside her own country: internally displaced. Millions of others crossed into Poland and became refugees."]],
 done:"The difference is the border and the choice. Refugees and asylum seekers have crossed one to escape danger; internally displaced people have not; voluntary migrants chose to go."});

/* ======================================================================== hg2d: Population futures */
/* Pronatalist and antinatalist: every policy is from the tour's own stops (China, India, Thailand, Romania, Iran,
   Singapore, France, Hungary, South Korea). */
const NATAL=binDef("hg2d","Women and fewer births",{tip:"More babies or fewer? Sort eight real policies.",
 keys:[["pro","👶 Pronatalist: more births"],["anti","✋ Antinatalist: fewer"]],ask:"Is this policy trying to raise births or cut them?",
 items:[["China, 1980: one child per couple","anti","Antinatalist, and enforced with fines and pressure."],
  ["Hungary: mothers of three or more pay no income tax for life","pro","Pronatalist: since October 2025 for mothers of three, and since 2020 for mothers of four."],
  ["Singapore, 1970s: “Stop at Two”","anti","Antinatalist. In 1987 Singapore reversed course and began urging couples to have more."],
  ["Romania, 1966: abortion and birth control banned","pro","Pronatalist, by force: births nearly doubled in a year, at a terrible cost."],
  ["Thailand: condoms handed out by traffic police","anti","Antinatalist, by persuasion and humour rather than force."],
  ["France: generous family benefits and cheap childcare","pro","Pronatalist: France has paid families to have children for decades."],
  ["Iran, 1989: free family planning for everyone","anti","Antinatalist: with girls’ education, it cut births faster than almost anywhere."],
  ["South Korea: baby bonuses and paid parental leave","pro","Pronatalist: over $200 billion since 2006, yet births are still the world’s lowest."]],
 done:"Antinatalist policies mostly worked, especially when girls stayed in school. Pronatalist ones usually disappoint: paying for babies rarely changes how many people want."});
/* Children per woman. South Korea 0.75 in 2024 (Statistics Korea, Feb 2025); Thailand about 1.0 (the stop's own
   figure); France 1.62 in 2024 (INSEE, Jan 2025); India 2.0 (National Family Health Survey 5, 2019–21); Israel about 2.9
   (Central Bureau of Statistics, 2.89 in 2023, the stop's own figure); Niger about 6 (UN World Population Prospects
   2024). */
const TFR=rankDef("hg2d","The rich country with big families",{seed:9,first:"most children",head:"Guess the order",
 tip:"Tap the countries from the most children per woman to the fewest.",
 items:[["Niger","about 6"],["Israel","about 2.9"],["India","about 2.0"],["France","about 1.6"],["Thailand","about 1.0"],["South Korea","about 0.75"]],
 intro:"Six countries, from among the world’s poorest to some of the richest. Where do women have the most children?",
 after:"Israel is the rich world’s exception: about 2.9 children per woman, above India. Thailand and South Korea are far below the 2.1 that keeps a population steady."});
/* The tour's own pronatalist examples: France and Hungary in Europe, South Korea and Singapore in East Asia, half a
   world apart. */
/* Total fertility: France 1.62 in 2024 (INSEE, Bilan démographique 2024); Hungary 1.23 in 2011, 1.59 in 2021 and 1.38 in
   2024 (KSH, Hungarian Central Statistical Office); South Korea 0.75 in 2024 (Statistics Korea); Singapore 0.97 in 2023
   (Singapore Department of Statistics, Population in Brief 2024). Hungary's tax exemption: mothers of four since 2020,
   of three since 1 October 2025 (Hungarian government; Hungary Today, 1 October 2025). */
const PRO=turnDef("hg2d","Pronatalist policies",{tip:"Four countries that pay for babies, half a world apart. Visit each one.",
 intro:"Tap a country to turn the globe to it. Do the payments work?",
 places:[["France",2.35,46.6,2.6,"Family allowances, tax breaks and cheap childcare for decades: 1.62 children per woman in 2024, among the highest in Europe, yet still below the 2.1 that keeps a population steady."],
  ["Hungary",19.04,47.5,3,"Mothers of four pay no income tax for life, and since October 2025 mothers of three too. Fertility rose from 1.23 in 2011 to 1.59 in 2021, then fell back to 1.38 in 2024."],
  ["South Korea",127.8,36.4,3,"Over $200 billion spent since 2006, yet only 0.75 children per woman in 2024: the lowest in the world. Many Koreans point instead to long working hours and the cost of housing and schooling."],
  ["Singapore",103.82,1.35,4,"In the 1970s it told families to “Stop at Two”. In 1987 it switched to urging three or more, if they could afford it. In 2023 fertility fell to 0.97."]]});

/* ======================================================================== hg3a: How culture spreads */
/* The six hearths of the stop (and of the AP course): Mesopotamia (cities and cuneiform writing by about 3200 BCE, at
   Uruk), the Nile (hieroglyphs about 3200 BCE), the Indus (Harappa and Mohenjo-daro, about 2600 BCE), the Yellow River
   (Shang oracle-bone writing, about 1200 BCE), Mesoamerica (maize first grown about 9,000 years ago in Mexico's Balsas
   valley) and the Andes (Caral, Peru, about 2600 BCE: UNESCO, "Sacred City of Caral-Supe"). */
const HEARTHS=turnDef("hg3a","Cultural hearths",{tip:"The hearths are spread around the world. Visit each one.",
 intro:"Tap a hearth to turn the globe to it.",
 places:[["Mesopotamia",44,33,2.2,"Between the Tigris and the Euphrates: some of the first farms, the first cities, such as Uruk, and the first writing, cuneiform, by about 3200 BCE."],
  ["Nile",31.2,27,2,"Egypt’s farms lived on the river’s yearly flood; hieroglyphs appeared about 3200 BCE."],
  ["Indus",70,28,2,"Harappa and Mohenjo-daro, about 2600 BCE: planned cities with straight streets and covered drains."],
  ["Yellow River",112,35,2,"Millet farming, and China’s first writing, carved on oracle bones under the Shang, about 1200 BCE."],
  ["Mesoamerica",-96,18,2,"Maize was first grown here, in Mexico, about 9,000 years ago; later the Maya wrote whole books."],
  ["Andes",-77.5,-10.9,2,"Caral, in Peru, was a city of pyramids about 2600 BCE; the Andes also gave the world the potato."]]});
/* Islam's spread from Arabia: the year each place came under Muslim rule (Wikipedia, "Early Muslim conquests" and the
   cities' own articles): Medina 622 (the Hijra), Mecca 630, Damascus 634, Jerusalem and Ctesiphon 637, Alexandria 641,
   Kairouan founded 670, Carthage 698, Córdoba 711, Sindh 712, Samarkand 712; the advance into France was stopped at the
   Battle of Tours in 732. Conquest brought Muslim rule first; most people converted slowly, over centuries. */
const ISLAM={tour:"hg3a",title:"Expansion diffusion",globe:true,
 tip:"Drag the years and watch Islam spread out from Arabia, while staying strong at home.",
 places:[["Medina",39.61,24.47,622],["Mecca",39.83,21.42,630],["Damascus",36.29,33.51,634],["Jerusalem",35.23,31.78,637],["Ctesiphon",44.58,33.09,637],
  ["Alexandria",29.92,31.2,641],["Kairouan",10.1,35.68,670],["Carthage",10.32,36.85,698],["Córdoba",-4.78,37.88,711],["Sindh",68.4,25.4,712],["Samarkand",66.96,39.65,712],["Tours",0.69,47.39,732,1]],
 card:()=>'<div class="rvk-sl"><input type="range" class="rvk-yr" min="610" max="750" step="1" value="610" aria-label="Year"><b class="rvk-yv">610</b></div><div class="rvk-row"><button type="button" class="rvk-btn rvk-play">▶ Play</button></div>',
 init(L){L.y=610;L.dots=this.places.map(p=>svgEl(L.svg,"circle",{r:p[4]?"6":"5",class:p[4]?"rvk-stop":"rvk-dot"}));L.tags=this.places.map(()=>{const d=document.createElement("div");d.className="rvk-tag";L.el.appendChild(d);return d})},
 wire(L){const c=L.card,r=c.querySelector(".rvk-yr");r.oninput=()=>{L.play=0;L.y=+r.value;L.dirty=1;this.text(L)};
  c.querySelector(".rvk-play").onclick=()=>{if(L.y>=750)L.y=610;L.play=1};this.text(L)},
 tick(L,dt){if(!L.play)return;L.y=Math.min(750,L.y+dt*14);if(L.y>=750)L.play=0;L.dirty=1;try{const r=L.card.querySelector(".rvk-yr");r.value=Math.round(L.y)}catch(e){}this.text(L)},
 text(L){const y=Math.round(L.y),c=L.card;if(!c)return;c.querySelector(".rvk-yv").textContent=y+" CE";c.querySelector(".rvk-play").textContent=L.play?"▶ Playing…":"▶ Play";
  if(y<622)say(L,"Mecca, about 610","Muhammad begins to preach in Mecca, the hearth.");
  else if(y<632)say(L,y+": Arabia","From Medina (622) Muhammad’s followers win back Mecca in 630. He dies in 632.");
  else if(y<650)say(L,y+": Syria, Iraq and Egypt","Within 20 years Muslim armies take Damascus, Jerusalem, the Persian capital Ctesiphon and Alexandria.");
  else if(y<711)say(L,y+": across North Africa","Kairouan, in Tunisia, is founded in 670; Carthage falls in 698.");
  else if(y<732)say(L,y+": from Spain to Central Asia","In 711–712 Córdoba, Sindh and Samarkand all come under Muslim rule: over 6,000 km apart.");
  else say(L,y+": the edge","At Tours, in France, the advance is stopped in 732. About a century after 632, Muslim rule stretches from Spain to Central Asia, and Arabia is still its heart. Conversion came slowly, over centuries.")},
 draw(L){const y=L.y;this.places.forEach((p,i)=>{const on=y>=p[3],q=on?proj(L,[p[1],p[2]]):null,c=L.dots[i],t=L.tags[i];
  if(q){c.style.display="";c.setAttribute("cx",q[0].toFixed(1));c.setAttribute("cy",q[1].toFixed(1))}else c.style.display="none";
  const qq=on?proj(L,[p[1],p[2]],1):null,fresh=y-p[3]<12;if(qq&&(fresh||p[4])){t.style.display="";const h=p[0]+" "+(p[4]?"(stopped) ":"")+p[3];if(t._h!==h){t.textContent=h;t._h=h}
   t.classList.toggle("rvk-new2",fresh);t.style.left=qq[0]+"px";t.style.top=(qq[1]+8)+"px"}else t.style.display="none"})}};
/* the diffusion types as the tour defines them; the examples are the tour's own, plus three common course ones
   (döner kebab in Germany, brought by Turkish guest workers from the 1960s; a playground craze; Walmart's start in
   small Arkansas towns, the stop's own reverse-hierarchical example, is left out to keep four clear kinds) */
const DIFF=binDef("hg3a","Global culture, local culture",{tip:"Which kind of diffusion? Sort eight examples from this tour and beyond.",
 keys:[["rel","Relocation"],["con","Contagious"],["hie","Hierarchical"],["sti","Stimulus"]],ask:"How did this trait spread?",
 items:[["Portuguese reaches Brazil with settlers","rel","Relocation: the people moved and carried the language with them."],
  ["Gangnam Style passes from viewer to viewer","con","Contagious: person to person, regardless of who they are."],
  ["A new fashion goes from Paris to big cities, then small towns","hie","Hierarchical: from the most powerful places down."],
  ["McDonald’s in India sells the potato McAloo Tikki","sti","Stimulus: the idea (fast-food burgers) is kept, the trait (beef) is changed."],
  ["Turkish workers bring the döner kebab to Germany","rel","Relocation: guest workers moved, and their food came with them."],
  ["Sequoyah invents a Cherokee script after seeing English writing","sti","Stimulus: he took the idea of writing, not the English alphabet."],
  ["Early Christianity spreads through the Roman Empire’s cities first","hie","Hierarchical: city to city, along the empire’s network of power, before the countryside."],
  ["A playground game spreads from class to class","con","Contagious: by contact, from one child to the next."]],
 done:"Relocation needs people to move; the three kinds of expansion diffusion (contagious, hierarchical, stimulus) spread a trait while its hearth keeps it."});

/* ======================================================================== hg3b: Cultural landscapes */
const FOLK=binDef("hg3b","Folk and popular culture",{tip:"Folk or popular? Sort eight things.",
 keys:[["f","🏡 Folk culture"],["p","📱 Popular culture"]],ask:"Local and traditional, or widespread and fast-changing?",
 items:[["Amish families farming with horses in Pennsylvania","f","Folk: a small, rural group that changes slowly on purpose."],
  ["Blue jeans","p","Popular: worn from Lagos to Lima, spread by shops and media."],
  ["A Hallstatt-style village built in China","p","Popular: a copy, made to sell, that could stand anywhere: placelessness."],
  ["Hand-woven Navajo rugs, with patterns passed down in families","f","Folk: handmade, local, taught by elders."],
  ["A Marvel film opening the same week on every continent","p","Popular: one product, everywhere at once."],
  ["An Ethiopian coffee ceremony that takes an hour","f","Folk: a local custom with its own meaning, passed down at home."],
  ["A smartphone game played by millions","p","Popular: spread in days, through screens."],
  ["Throat singing by Tuvan herders in Siberia","f","Folk: a local art of one small people, tied to their land."]],
 done:"Folk culture spreads slowly, mostly by relocation, and gives places their own look; popular culture spreads fast, by contagious and hierarchical diffusion, and makes places look alike."});


/* ---------------------------------------------------------------- the engine: one stop at a time */
const DEFS=[PUSHPULL,WHO,NATAL,TFR,PRO,HEARTHS,ISLAM,DIFF,FOLK];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tour===ps.tour&&d.title===t);if(!D)return null;if((D.globe||D.turn)&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvk-layer";el.innerHTML='<svg class="rvk-sv"><defs><clipPath id="rvkClip"><path class="rvk-clipp" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvkClip)"></g></svg>';host.appendChild(el);
  L.el=el;L.root=el.querySelector("svg");L.svg=el.querySelector("g");L.clipP=el.querySelector(".rvk-clipp")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}lastT=0;if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvk-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvk-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvk-ctl";
 c.innerHTML='<div class="rvk-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvk-ep"></div>';
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.rot||[]).join(",")+G.zoom+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.root.setAttribute("width",hr.width);L.root.setAttribute("height",hr.height);
   L.clipP.setAttribute("d","M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z"+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvk-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvk-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvk-sv{position:absolute;left:0;top:0;overflow:visible}
.rvk-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none;background:rgba(255,255,255,.95);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvk-tag.rvk-new2{background:#13294b;color:#fff}
.rvk-ring{fill:rgba(255,209,102,.35);stroke:#d9682b;stroke-width:3}
.rvk-dot{fill:#ffd166;stroke:#13294b;stroke-width:2.5}.rvk-stop{fill:#c2364f;stroke:#fff;stroke-width:2.5}
.rvk-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvk-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvk-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvk-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvk-btn[hidden]{display:none}.rvk-btn:disabled{cursor:default;opacity:.55}
.rvk-btn.rvk-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvk-btn.rvk-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvk-btn.rvk-cur{background:#13294b;color:#fff;border-color:#13294b}
.rvk-pool{display:flex;flex-wrap:wrap;gap:6px}.rvk-pool:empty{display:none}
.rvk-chip{border:1px solid #d9682b;background:#fff4ec;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvk-chip:hover{background:#d9682b;color:#fff}
.rvk-order{display:flex;flex-direction:column;gap:3px;margin-top:8px}
.rvk-slot{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 8px;border-radius:8px;background:rgba(19,41,75,.06);min-height:24px}
.rvk-slot em{font-style:normal;font-weight:800;width:16px;opacity:.6}.rvk-slot span{flex:1 1 auto;font-weight:700}.rvk-slot b{font-weight:700;font-size:12.5px;white-space:nowrap}.rvk-slot b i{font-style:normal;opacity:.8}
.rvk-slot.rvk-empty span{font-weight:500;opacity:.6;font-style:italic}
.rvk-slot.rvk-ok{background:rgba(31,138,76,.16)}.rvk-slot.rvk-no{background:rgba(194,54,79,.13)}
.rvk-q{display:flex;align-items:baseline;gap:10px;margin:2px 0 4px;min-height:1.4em}.rvk-n{font-size:12px;font-weight:800;color:#5b6b7c;white-space:nowrap}.rvk-item{font-size:15.5px;color:#13294b;line-height:1.3}
.rvk-dots{display:flex;gap:4px;margin-top:8px}.rvk-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvk-dots i.rvk-ok{background:#1f8a4c}.rvk-dots i.rvk-no{background:#c2364f}.rvk-dots i.rvk-at{box-shadow:0 0 0 2px #ffd166}
.rvk-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvk-ep b{display:block;font-size:15px}
.rvk-ep.rvk-new{animation:rvkIn .45s ease}@keyframes rvkIn{from{opacity:.2;transform:translateY(4px)}}
.rvk-sl{display:flex;align-items:center;gap:10px;margin-top:4px}.rvk-sl input{flex:1 1 auto;accent-color:#d9682b}.rvk-sl b{min-width:64px;text-align:right;font-size:17px;color:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvk-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvk-do,:is(body.dark-theme,body.sky-night) .rvk-sl b{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvk-item{color:#fff}:is(body.dark-theme,body.sky-night) .rvk-n{color:#aab6c8}
:is(body.dark-theme,body.sky-night) .rvk-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvk-btn.rvk-cur{background:#ffb27a;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvk-chip{background:rgba(217,104,43,.18);color:#ffd2b3;border-color:#d9682b}
:is(body.dark-theme,body.sky-night) .rvk-slot{background:rgba(255,255,255,.07)}
:is(body.dark-theme,body.sky-night) .rvk-slot.rvk-ok{background:rgba(31,138,76,.35)}:is(body.dark-theme,body.sky-night) .rvk-slot.rvk-no{background:rgba(194,54,79,.3)}
:is(body.dark-theme,body.sky-night) .rvk-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}

/* ======================================================================== part 4: the People map's banner
   As geoflock-polish-rvj.js does for its tours: on People map stops a long banner ("Born in another country · 10 to
   20%, 20% or more") ran under the map key in the top right corner. On these tours it slides left until it clears
   the key (never onto the card), and is put back when the tour ends. */
let bannerMoved=null;
every(()=>{try{const on=typeof ps!=="undefined"&&ps&&MYT.has(ps.tour);const b=document.querySelector(".ps-mapbanner");
 if(bannerMoved&&(bannerMoved!==b||!on)){bannerMoved.style.translate="";bannerMoved=null}
 if(!on||!b||!b.offsetWidth)return;const k=document.querySelector(".ps-mapkey.at-right");if(b.style.translate&&bannerMoved!==b)return;b.style.translate="";bannerMoved=null;if(!k||!k.offsetWidth)return;
 const B=b.getBoundingClientRect(),K=k.getBoundingClientRect();if(!(B.right>K.left-8&&B.bottom>K.top&&B.top<K.bottom))return;
 let dx=K.left-8-B.right;try{const c=ps.card&&ps.card.getBoundingClientRect();if(c&&c.right<B.left)dx=Math.max(dx,c.right+8-B.left)}catch(e){}
 b.style.translate=Math.round(dx)+"px 0";bannerMoved=b}catch(e){}},400);

window.gfPolishRvk={v:1,FIX,stop(){IV.forEach(clearInterval);unmount()}};
})();
