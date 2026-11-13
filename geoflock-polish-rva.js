/* GeoFlock: review pass over four map tours (Population, Geography, GDP, Elevation).
   Two parts:
   1. Fixes to the stops' own data (framing, pins, wording), applied by tour and title when the tours are built and again
      whenever one of these tours starts, so later patches cannot undo them. Each fix says why. Framing is mostly about
      the tour card: it covers the left third of the globe, so a place framed in the middle of the globe ended up under
      the card or squeezed against the far edge of the globe.
   2. Guess-first questions (through geoflock-tourplay.js) on stops whose headline is a share or a number.
   3. A few stops you can play with (listed at the start of part 3). */
(function(){
"use strict";
if(window.gfPolishRva)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();

/* ======================================================================== part 1: data fixes */
/* geoflock-sweep-tours*.js re-set framing on every psGo (with a configurable defineProperty), which undid plain fixes.
   LOCK makes a field a fixed, non-configurable getter whose setter is ignored (as geoflock-polish-rvb.js does), so a
   later assignment does nothing and a later defineProperty fails quietly inside its try/catch. Only the fields named
   here, on these stops, are locked. */
const LOCK=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:false,enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]||"");LOCK(S,k,t.split(a).join(b))};
const FIX={
 pop:{
  /* Nigeria sits round the back of the globe from India, so its label poked out from under the card: show it on the
     flat map only. The US and Brazil are round the back too and already hide themselves. */
  "The most populous countries":S=>{LOCK(S,"pins",(S.pins||[]).map(p=>Array.isArray(p)&&/^Nigeria/.test(p[1])?{only:"flat",at:p[0],text:p[1],area:true}:p))},
  /* centred on the circle, India sat under the card; moved east of the card, the whole circle shows */
  "Half of humanity in one circle":S=>{LOCK(S,"globe",[94,22,1.15])},
  /* Bangladesh sat on the edge of the globe and the "drag me" tag of the crowding tool ran into the map buttons */
  "The Ganges plain and Bangladesh":S=>{LOCK(S,"globe",[84,23.5,2.3])},
  /* Java was pushed against the far edge of the globe, with Borneo cut off */
  "Java":S=>{LOCK(S,"globe",[110,-3,2.5])},
  /* the east coast, where three in four Americans live, was cut off by the edge of the globe */
  "The United States: the 100th meridian":S=>{LOCK(S,"globe",[-96,38,1.6])},
  /* Toronto and Montreal, where most Canadians live, sat right on the edge of the globe */
  "Canada hugs the border":S=>{LOCK(S,"globe",[-96,52,1.25])},
  /* the Nile pin's label used a spot by Cairo and sat on the pyramid icon */
  "Egypt is the Nile":S=>{LOCK(S,"pins",(S.pins||[]).map(p=>Array.isArray(p)&&/^95%/.test(p[1])?[[[31.2,27.2],[32.6,25.3],[31.3,26.5]],p[1],p[2]]:p))},
  /* the East African cluster (Lake Victoria, Ethiopia, Rwanda) was round the edge of the globe: the stop is about two
     corners, so frame both. Nigeria's figure now matches the population stop (UN World Population Prospects 2024:
     about 238 million in 2025). */
  "Africa’s two crowded corners":S=>{LOCK(S,"globe",[15,4,1.1]);
   LOCK(S,"pins",(S.pins||[]).map(p=>Array.isArray(p)&&/^Nigeria: about 230/.test(p[1])?[p[0],"Nigeria: about 238 million people",p[2]]:p));
   RE(S,"more","Nigeria, with about 230 million people,","Nigeria, with about 238 million people,")},
  /* Niger's label landed over India while Niger itself was under the card, and Japan is round the back of the globe
     from Niger. On the globe Italy stands in for an old population (ISTAT, 1 January 2024: 24.3% aged 65 and over;
     Japan 29.3%, Statistics Bureau of Japan, September 2024; Niger: about half under 15, UN World Population
     Prospects 2024). Japan stays on the flat map. */
  "The shape of a population":S=>{LOCK(S,"card","left");LOCK(S,"globe",[22,28,1]);
   LOCK(S,"pins",[[[8,17],"Niger: half the people are under 15","point"],{only:"flat",at:[[138,36]],text:"Japan: almost 3 in 10 are over 65",area:false},{only:"globe",at:[[12.5,42.6]],text:"Italy: almost 1 in 4 are over 65",area:false}])},
  /* Milan and the Swiss end of the banana were cut off by the edge of the globe */
  "Europe’s Blue Banana":S=>{LOCK(S,"globe",[5.5,49.5,3])},
  /* the card jumped to the right and covered Siberia, the half of Russia the stop is about */
  "Russia lives west of the Urals":S=>{LOCK(S,"card","left");LOCK(S,"globe",[68,56,1.1])},
  /* eastern Mongolia was cut off by the edge of the globe */
  "Mongolia: the emptiest country":S=>{LOCK(S,"globe",[103,46.5,2.2])},
  /* Sydney, Melbourne and Brisbane, the point of the stop, were off the edge of the globe */
  "Australia keeps to the coast":S=>{LOCK(S,"globe",[134,-27,1.4])},
  /* Brazil's Atlantic coast, the brightest part of the rim, was off the edge of the globe */
  "South America lives on its edges":S=>{LOCK(S,"globe",[-60,-18,1.2])}
 },
 gdp:{
  /* with the stop's own figures ($33,000 and $2,700 a person) Japan is about 12 times richer per person, not 13 */
  "Flip the map: money per person":S=>{RE(S,"stat","per person Japan’s is 13 times bigger","per person Japan’s is about 12 times bigger")}
 },
 geo:{
  /* the big water ball sat half under the card, and the "Pacific" label pointed at a spot under the card */
  "A planet of water":S=>{if(S.drag)LOCK(S,"drag",Object.assign({},S.drag,{at:[-138,16]}));
   LOCK(S,"pins",[[[-150,-5],"Pacific","point"],[[-30,15],"Atlantic","point"],[[75,-15],"Indian","point"]])},
  /* Antarctica, the answer, was off the bottom of the globe: frame it with southern Africa, the Sahara at the top */
  "The biggest desert is icy":S=>{LOCK(S,"globe",[25,-40,1])}
 }
};
function applyFixes(tour){try{const T=PS_TOURS[tour],F=FIX[tour];if(!T||!F)return;T.steps.forEach(S=>{const f=S&&F[strip(S.title)];if(!f||S._rvaFix)return;
  try{f(S);Object.defineProperty(S,"_rvaFix",{value:1,configurable:true,enumerable:false})}catch(e){console.error("rva fix",tour,S.title,e)}})}catch(e){}}
function applyAll(){Object.keys(FIX).forEach(applyFixes)}
let lastTour=null;
setInterval(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(t&&FIX[t]&&t!==lastTour)applyFixes(t);lastTour=t||null}catch(e){}},400);
try{applyAll()}catch(e){}setTimeout(applyAll,1500);setTimeout(applyAll,6000);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. The answers are the stops' own
   figures (see each stop's text for the source). */
function addGuesses(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS)return false;const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const A={
  "pop|Russia lives west of the Urals":G("What share of Russians live west of the Ural Mountains?",0,100,74,"%",{step:1,show:"about three in four (74%)"}),
  "pop|The United States: the 100th meridian":G("What share of Americans in the lower 48 states live east of the 100th meridian?",0,100,76,"%",{step:1,show:"about three in four (76%)"}),
  "gdp|If the world shared equally":G("If the world’s output were shared out equally, how much would each person get a year?",1000,100000,14000,"dollars",{log:1,show:"about $14,000"}),
  "gdp|Norway saved its oil money":G("How much is Norway’s oil fund worth, for every Norwegian?",1000,1000000,300000,"dollars",{log:1,show:"over $300,000"}),
  "pop|Australia keeps to the coast":G("What share of Australians live within 50 km of the sea?",0,100,85,"%",{step:1,show:"about 85%"})
 };
 for(const k in A)if(!TP.GUESS[k])TP.GUESS[k]=A[k];return true}catch(e){return false}}
if(!addGuesses()){let n=0;const iv=setInterval(()=>{if(addGuesses()||++n>40)clearInterval(iv)},500)}

/* the floating map key of a tour stop (.ps-mapkey.at-right, e.g. "The two big clusters / Also crowded") sat on top of
   the globe's full-screen and zoom buttons: keep it left of that column */
{const s=document.createElement("style");s.textContent="@media (min-width:701px){body .ps-mapkey.at-right{right:88px!important}}";document.head.appendChild(s)}


/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-interact-world3.js: a watchdog polls `ps`, matches the stop by tour and title, mounts a layer
   in amGlobe.host (for the globe ones) drawn with amGlobe.projection(), adds a control block after the stop's headline
   with a one-line instruction, and removes everything (layer, card block, body class, timers) as soon as the stop
   changes or the tour ends. Next and Back are never blocked; every step is wrapped in try/catch. CSS classes start
   with "rva-".
   - geo | "Further north than you think": which city is further north? Pick one; the globe turns to the pair and draws
     the parallels through both.
   - gdp | "Two giants": stack other economies against the US. Tap countries (or "Fill it for me") and watch the bar
     fill; the countries light up on the globe. Uses the GDP map's own figures (COUNTRY_GDP, World Bank, current US$). */
const NS="http://www.w3.org/2000/svg";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};

/* ---------------- shared helpers (as in geoflock-interact-world3.js) ---------------- */
/* when zoomed in, the globe's sphere (projection scale) is bigger than the disc that is drawn (amGlobe.size().r): L.disc
   is that visible disc, in host pixels; points outside it are hidden like points round the back */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb,D=L.disc;if(D&&Math.hypot(x-D[0],y-D[1])>D[2]-1)return null;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function pathOf(L,pts){let d="",pen=false,px=0,py=0;const G=g(),J=G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function place(el,q){if(!q){el.style.display="none";return false}el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");return true}
function tag(L,cls){const d=document.createElement("div");d.className="rva-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rva-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rva-new");void e.offsetWidth;e.classList.add("rva-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ======================================================================== 1. Which is further north?
   City coordinates (city centres, rounded to 0.01°): New York 40.71° N 74.01° W; Rome 41.90° N 12.50° E; London 51.51° N
   0.13° W; Calgary 51.05° N 114.07° W; Paris 48.86° N 2.35° E; Seattle 47.61° N 122.33° W; Madrid 40.42° N 3.70° W;
   Venice 45.44° N 12.34° E; Montreal 45.50° N 73.57° W. */
const C=(n,lon,lat)=>({n,ll:[lon,lat]});
const PAIRS={
 lat:[[C("New York",-74.01,40.71),C("Rome",12.50,41.90),"Rome is further north than New York, yet far milder in winter."],
  [C("Calgary",-114.07,51.05),C("London",-0.13,51.51),"London is a little north of Calgary, and its winters are about 12 °C warmer."],
  [C("Seattle",-122.33,47.61),C("Paris",2.35,48.86),"Paris is north of Seattle, and almost level with the US–Canada border along 49° N."],
  [C("Venice",12.34,45.44),C("Montreal",-73.57,45.50),"A tie, almost: Montreal is a hair further north. Montreal gets about 2 m of snow a winter; Venice hardly any."]]};
function pairDef(title,axis){const P=PAIRS[axis],word=axis==="lon"?"east":"north";
 return{tours:["geo"],title,globe:true,
  tip:"Which city is further "+word+"? Tap your answer.",
  card(L){return'<div class="rva-q"></div><div class="rva-btns rva-ans"></div><div class="rva-score"><span class="rva-dots">'+P.map(()=>"<i></i>").join("")+'</span><button type="button" class="rva-btn rva-next" hidden>Next pair →</button></div>'},
  init(L){L.k=0;L.res=[];L.sh=svgEl(L.svg,"g",{});L.lines=svgEl(L.sh,"g",{});L.dots=svgEl(L.sh,"g",{});L.tA=tag(L,"rva-ctag");L.tB=tag(L,"rva-ctag");L.tLa=tag(L,"rva-ltag");L.tLb=tag(L,"rva-ltag")},
  wire(L){this.ask(L)},
  ask(L){const c=L.card;if(!c)return;const p=P[L.k];L.ans=null;
   setHTML(c.querySelector(".rva-q"),"<b>Pair "+(L.k+1)+" of "+P.length+":</b> which is further "+word+"?");
   const box=c.querySelector(".rva-ans");box.innerHTML="";[0,1].forEach(j=>{const b=document.createElement("button");b.type="button";b.className="rva-btn";b.textContent=p[j].n;b.onclick=()=>this.pick(L,j);box.appendChild(b)});
   c.querySelector(".rva-next").hidden=true;this.dots(L);say(L,"","Guess first, then the globe draws the "+(axis==="lon"?"meridians":"parallels")+" through both.");
   const m=d3.geoInterpolate(p[0].ll,p[1].ll)(.5),dd=d3.geoDistance(p[0].ll,p[1].ll);turnTo(L,m,clamp(.75/Math.sin(Math.min(1.4,dd/2+.2)),1,3.2));L.dirty=1},
  pick(L,j){if(L.ans!=null)return;const p=P[L.k],ax=axis==="lon"?0:1,right=p[0].ll[ax]>p[1].ll[ax]?0:1;L.ans=j;L.res[L.k]=j===right;
   const bs=L.card.querySelectorAll(".rva-ans .rva-btn");bs.forEach((b,i)=>{b.disabled=true;if(i===right)b.classList.add("rva-right");else if(i===j)b.classList.add("rva-wrong")});
   const f=v=>Math.abs(v).toFixed(2)+"° "+(axis==="lon"?(v<0?"W":"E"):(v<0?"S":"N"));
   say(L,(j===right?"Yes! ":"Not quite: ")+p[right].n+", at "+f(p[right].ll[ax]),p[2]+" ("+p[1-right].n+": "+f(p[1-right].ll[ax])+".)");
   const nx=L.card.querySelector(".rva-next");nx.hidden=false;nx.textContent=L.k<P.length-1?"Next pair →":"Start again ↺";nx.onclick=()=>{if(L.k<P.length-1)L.k++;else{L.k=0;L.res=[]}this.ask(L)};this.dots(L);L.dirty=1},
  dots(L){const d=L.card&&L.card.querySelectorAll(".rva-dots i");if(!d)return;d.forEach((e,i)=>{e.className=L.res[i]===true?"rva-ok":L.res[i]===false?"rva-no":i===L.k?"rva-at":""});
   const n=L.res.filter(x=>x===true).length,done=L.res.filter(x=>x!=null).length;if(done===P.length&&L.ans!=null)say(L,n+" out of "+P.length+"!",n>=3?"Sharp eyes: most people trust the map’s picture of the continents, which is exactly what fools them.":"You are in good company: the usual picture of the continents puts the Americas one above the other and Europe level with the US.")},
  draw(L){const p=P[L.k];if(!p)return;L.sh.setAttribute("transform","");
   let lh="";if(L.ans!=null){p.forEach&&[0,1].forEach(j=>{const v=p[j].ll[axis==="lon"?0:1],pts=[];if(axis==="lon")for(let a=-75;a<=80;a+=1)pts.push([v,a]);else for(let a=-180;a<=180;a+=1)pts.push([a,v]);
     lh+='<path d="'+pathOf(L,pts)+'" class="rva-mer rva-m'+j+'"/>'})}setHTML(L.lines,lh);
   let dh="";[0,1].forEach(j=>{const q=proj(L,p[j].ll);if(q)dh+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="6" class="rva-city rva-m'+j+'"/>'});setHTML(L.dots,dh);
   const qa=proj(L,p[0].ll,1),qb=proj(L,p[1].ll,1),side=qa&&qb&&(axis==="lon"?qa[1]<qb[1]:qa[0]<qb[0]);
   putTag(L,L.tA,qa,esc(p[0].n),axis==="lon"?(side?-30:10):10);putTag(L,L.tB,qb,esc(p[1].n),axis==="lon"?(side?10:-30):10);
   const f=v=>Math.abs(v).toFixed(1)+"°"+(axis==="lon"?(v<0?"W":"E"):(v<0?"S":"N"));
   if(L.ans!=null&&axis==="lat"){putTag(L,L.tLa,null);putTag(L,L.tLb,null)}
   else if(L.ans!=null){/* label each meridian near the equator-side end of its own city */
    putTag(L,L.tLa,proj(L,[p[0].ll[0],p[0].ll[1]+(p[0].ll[1]>p[1].ll[1]?6:-6)],1),f(p[0].ll[0]),0);putTag(L,L.tLb,proj(L,[p[1].ll[0],p[1].ll[1]+(p[1].ll[1]>p[0].ll[1]?6:-6)],1),f(p[1].ll[0]),0)}
   else{putTag(L,L.tLa,null);putTag(L,L.tLb,null)}}}}
const NORTHQ=pairDef("Further north than you think","lat");

/* ======================================================================== 2. Stack up to the US
   Every figure is the GDP map's own: COUNTRY_GDP (index.html), World Bank, current US$, mostly 2025 (some 2024). */
const AFRICA=["dz","ao","bj","bw","bf","bi","cm","cv","cf","td","km","cg","cd","ci","dj","eg","gq","er","sz","et","ga","gm","gh","gn","gw","ke","ls","lr","ly","mg","mw","ml","mr","mu","ma","mz","na","ne","ng","rw","st","sn","sc","sl","so","za","ss","sd","tz","tg","tn","ug","zm","zw"];
const CHIPS=[["cn","China"],["de","Germany"],["jp","Japan"],["gb","UK"],["in","India"],["fr","France"],["it","Italy"],["ca","Canada"],["br","Brazil"],["ru","Russia"],["kr","South Korea"],["mx","Mexico"],["af1","All of Africa"]];
const PAL=["#d9682b","#e3a33b","#2e9d5b","#7a5cc2","#c2364f","#2f8fe0","#8a6d3b","#4fa3a5","#b0567d","#5b6b7c","#9bbf3a","#e07a9a","#6b4f2a"];
const gdpOf=c=>{try{const G=typeof COUNTRY_GDP!=="undefined"?COUNTRY_GDP:null;if(!G)return 0;if(c==="af1")return AFRICA.reduce((s,k)=>s+(G[k]||0),0);return G[c]||0}catch(e){return 0}};
const tn=v=>"$"+(v/1e6).toLocaleString("en-GB",{maximumFractionDigits:1,minimumFractionDigits:1})+" trillion";
const STACK={tours:["gdp"],title:"Two giants",globe:true,
 tip:"Tap economies to stack them against the US. How many does it take?",
 card(L){return'<div class="rva-chips">'+CHIPS.map((c,i)=>'<button type="button" class="rva-chip" data-c="'+c[0]+'"><i style="background:'+PAL[i]+'"></i>'+c[1]+"</button>").join("")+'</div>'+
  '<div class="rva-bars"><div class="rva-blab">United States <b class="rva-us"></b></div><div class="rva-track"><i class="rva-usbar"></i></div><div class="rva-blab">Your stack <b class="rva-mine"></b></div><div class="rva-track rva-stack"></div></div>'+
  '<div class="rva-btns"><button type="button" class="rva-btn rva-fill">Fill it for me</button><button type="button" class="rva-btn rva-clear">Clear</button></div>'},
 init(L){L.sel=[];L.fills=svgEl(L.svg,"g",{})},
 off(L){clearInterval(L.auto)},
 wire(L){const c=L.card;c.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{clearInterval(L.auto);this.toggle(L,b.dataset.c)});
  c.querySelector(".rva-clear").onclick=()=>{clearInterval(L.auto);L.sel=[];this.render(L)};
  c.querySelector(".rva-fill").onclick=()=>{clearInterval(L.auto);L.sel=[];this.render(L);const order=CHIPS.map(x=>x[0]).filter(k=>k!=="af1").sort((a,b)=>gdpOf(b)-gdpOf(a));let i=0;
   L.auto=setInterval(()=>{try{if(!L||!L.card||!L.card.isConnected){clearInterval(L.auto);return}if(this.sum(L)>=gdpOf("us")||i>=order.length){clearInterval(L.auto);return}L.sel.push(order[i++]);this.render(L)}catch(e){clearInterval(L.auto)}},650)};
  this.render(L)},
 sum(L){return L.sel.reduce((s,k)=>s+gdpOf(k),0)},
 toggle(L,k){const i=L.sel.indexOf(k);if(i>=0)L.sel.splice(i,1);else L.sel.push(k);this.render(L)},
 render(L){const c=L.card;if(!c)return;const us=gdpOf("us"),s=this.sum(L),mx=Math.max(us,s)*1.04;
  c.querySelectorAll("[data-c]").forEach(b=>b.classList.toggle("rva-on",L.sel.includes(b.dataset.c)));
  c.querySelector(".rva-us").textContent=tn(us);c.querySelector(".rva-mine").textContent=L.sel.length?tn(s)+" · "+Math.round(s/us*100)+"%":"empty";
  c.querySelector(".rva-usbar").style.width=(us/mx*100).toFixed(1)+"%";
  setHTML(c.querySelector(".rva-stack"),L.sel.map(k=>{const i=CHIPS.findIndex(x=>x[0]===k);return'<i style="width:'+(gdpOf(k)/mx*100).toFixed(2)+"%;background:"+PAL[i]+'" title="'+esc(CHIPS[i][1])+'"></i>'}).join("")+'<em style="left:'+(us/mx*100).toFixed(1)+'%"></em>');
  const n=L.sel.length,names=L.sel.map(k=>CHIPS.find(x=>x[0]===k)[1]);
  if(!n)say(L,"","The US makes about a quarter of the world’s output. Start with China, the second biggest: how far does it get you?");
  else if(s>=us)say(L,"Past the US with "+n+(n===1?" economy":" economies"),names.join(", ")+": "+tn(s)+". "+(L.sel.includes("cn")&&n<=4?"Even China plus the next biggest economies only just catch up: the US is bigger than the next three put together.":"It took "+n+" economies to pass the US on its own."));
  else if(n===1&&L.sel[0]==="af1")say(L,"All of Africa: "+tn(s),"54 countries and about 1.5 billion people make "+Math.round(s/us*100)+"% of what the US makes, with over four times as many people.");
  else say(L,tn(s)+": "+Math.round(s/us*100)+"% of the US",n===1&&L.sel[0]==="cn"?"China, the second-biggest economy, makes about "+Math.round(s/us*100)+"% as much as the US. Add more.":"Still "+tn(us-s)+" short. Add more.");
  L.dirty=1},
 draw(L){let h="";L.sel.forEach(k=>{const i=CHIPS.findIndex(x=>x[0]===k),codes=k==="af1"?AFRICA:[k];codes.forEach(cc=>{const f=feat(cc);if(f)h+='<path d="'+geoD(f)+'" fill="'+PAL[i]+'" class="rva-cfill"/>'})});
  const fu=feat("us");if(fu)h+='<path d="'+geoD(fu)+'" class="rva-usout"/>';L.fills.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");setHTML(L.fills,h)}};

/* ---------------- the engine: one stop at a time (as in geoflock-interact-world3.js) ---------------- */
const DEFS=[NORTHQ,STACK];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if(D.globe&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,u:0,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rva-layer";el.innerHTML='<svg class="rva-sv"><defs><clipPath id="rvaDisc"><path class="rva-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvaDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rva-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}document.body.classList.add("rva-on");if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rva-ctl").forEach(c=>c.remove());document.body.classList.remove("rva-on")}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rva-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rva-ctl";
 c.innerHTML='<div class="rva-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rva-ep"></div>';at0.after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   /* everything is drawn inside the visible disc and kept off the tour card (an even-odd hole) */
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!L||!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*28/z,ll[1]*(1-.3/Math.max(1,z))],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rva-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rva-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rva-sv{position:absolute;left:0;top:0;overflow:visible}
.rva-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rva-ctag{background:#13294b;color:#fff;font-weight:800;font-size:13px;padding:3px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rva-ltag{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12px;padding:2px 8px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rva-city{stroke:#fff;stroke-width:2.5}.rva-city.rva-m0,.rva-mer.rva-m0{fill:#d9682b;stroke:#d9682b}.rva-city.rva-m1{fill:#2f8fe0}.rva-city{stroke:#fff}
.rva-mer{fill:none;stroke-width:2.5;stroke-dasharray:7 5}.rva-mer.rva-m0{fill:none}.rva-mer.rva-m1{stroke:#2f8fe0}
.rva-cfill{opacity:.72;stroke:#fff;stroke-width:.6}.rva-usout{fill:rgba(19,41,75,.12);stroke:#13294b;stroke-width:2}
.rva-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rva-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rva-q{font-size:14px;margin-bottom:2px}
.rva-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.rva-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rva-btn.rva-on{background:#13294b;color:#fff;border-color:#13294b}
.rva-btn:disabled{cursor:default;opacity:.55}.rva-btn.rva-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rva-btn.rva-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rva-score{display:flex;align-items:center;gap:10px;margin-top:8px}.rva-score .rva-btn{flex:0 0 auto}
.rva-dots{display:flex;gap:4px;flex:1 1 auto}.rva-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rva-dots i.rva-ok{background:#1f8a4c}.rva-dots i.rva-no{background:#c2364f}.rva-dots i.rva-at{box-shadow:0 0 0 2px #ffd166}
.rva-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rva-ep b{display:block;font-size:15px}
.rva-ep.rva-new{animation:rvaIn .45s ease}@keyframes rvaIn{from{opacity:.2;transform:translateY(4px)}}
.rva-chips{display:flex;flex-wrap:wrap;gap:5px}
.rva-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12px;padding:4px 9px;border-radius:999px;cursor:pointer;font-family:inherit}
.rva-chip i{display:inline-block;width:9px;height:9px;border-radius:50%}.rva-chip.rva-on{background:#13294b;color:#fff;border-color:#13294b}
.rva-bars{margin-top:10px}.rva-blab{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:4px 0 2px}.rva-blab b{color:#9a4a16}
.rva-track{position:relative;height:14px;border-radius:7px;background:rgba(19,41,75,.1);display:flex;overflow:visible}
.rva-usbar{display:block;height:100%;border-radius:7px;background:#13294b;transition:width .3s}
.rva-stack i{display:block;height:100%;transition:width .3s}.rva-stack i:first-child{border-radius:7px 0 0 7px}
.rva-stack em{position:absolute;top:-3px;width:2px;height:20px;margin-left:-1px;background:#13294b}
body.dark-theme .rva-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark-theme .rva-do,body.dark-theme .rva-blab b{color:#ffb27a}
body.dark-theme .rva-btn,body.dark-theme .rva-chip{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
body.dark-theme .rva-btn.rva-on,body.dark-theme .rva-chip.rva-on{background:#fff;color:#13294b}
body.dark-theme .rva-track,body.dark-theme .rva-dots i{background:rgba(255,255,255,.15)}body.dark-theme .rva-usbar{background:#9fc3ff}body.dark-theme .rva-stack em{background:#fff}`;document.head.appendChild(s)}

window.gfPolishRva={v:1,FIX,L:()=>L};
})();
