/* GeoFlock polish RV-C: a stop-by-stop review of four tours (Borders, Islands, Europe, Asia), looked at on the globe.
   1. Fixes, keyed "tour|stop title" and applied each time the stop opens (psGo is wrapped, as in geoflock-sweep-tours4.js,
      because other scripts reset some stop fields after load): better globe framing where a pin, label or highlight sat
      under the card, the map key or the toolbar, or round the back of the globe; a few facts corrected (sources beside
      each); the Borders tour's first stop showing the year-1000 map under a "2026" chip.
   2. Five stops you can play with, each a layer over the Maps globe and a small control block on the card, right after
      the stop's headline, with a one-line instruction (same pattern as geoflock-interact-world3.js):
      - borders | "Land nobody wants": try Egypt's border, then Sudan's. Each side wants the Halaib Triangle, so under
        either line the other side is handed Bir Tawil, and nobody claims it.
      - borders | "The island that switches": slide through the year (or Play) and watch Pheasant Island change hands
        on 1 February and 1 August.
      - islands | "Why Java, not Borneo": fill both islands with people, one dot for every million.
      - europe  | "The olive line": a city glows; is it olive-oil country or butter country?
      - asia    | "Asia’s water tower": a river glows; which sea does it reach? Seven rivers, one plateau, six seas.
   Everything goes (layer, card block, timers) as soon as the stop changes or the tour ends. Globe view only; Next and
   Back are never blocked; every step is wrapped in try/catch. CSS classes start with "rvc-". */
(function(){
"use strict";
if(window.gfPolishRVC)return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const NS="http://www.w3.org/2000/svg";
const SET=(S,k,v)=>{try{S[k]=v}catch(e){}if(S[k]!==v)try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};

/* ============================================================ 1. stop fixes
   globe: [lon, lat, zoom] of the globe view; card: which side the card sits. Checked by screenshot at 1280×860. */
const FIX={
 /* Borders */
 "borders|Most neighbours":{globe:[88,45,1.15]},                     /* the "Russia" tag sat on the map toolbar */
 "borders|Africa carved up in Berlin":{globe:[2,14,1.1],card:"left"},           /* Liberia was under the card */
 "borders|Countries inside countries":{globe:[24,5,1]},           /* Vatican tag hid the year chip, Lesotho off the bottom */
 "borders|Cut-off pieces":{globe:[30,33,1]},                      /* Kaliningrad's tag was on the toolbar, Cabinda at the edge */
 "borders|Disputed lands":{globe:[1,27,1],card:"left"},             /* Western Sahara was hidden under the card */
 "borders|France’s longest border":{globe:[-51,2.5,3.6]},            /* the border with Brazil sits in the middle of the view */
 /* Islands */
 "islands|The biggest islands":{globe:[128,-8,1.05]},                /* "drag Greenland onto Australia": the true-size Greenland sits on Australia, which was round the back */
 "islands|No snakes in Ireland":{globe:[-2,54.5,3.4]},               /* Doggerland was under the map key */
 "islands|Island countries":{globe:[-171,-1,1.6],phDrop:/^Kiribati: Tarawa$/}, /* the Gilbert Islands ring was under the card; a second Tarawa photo stood in open sea */
 /* Tristan da Cunha's surnames: the founding men "shared seven surnames: Glass, Green, Hagan, Lavarello, Repetto, Rogers,
    and Swain" (Wikipedia, "Tristan da Cunha", Demographics); "eight" counted a name that died out. */
 "islands|The loneliest island town":{rep:[["Its people share just eight surnames.","Its founding men shared just seven surnames: Glass, Green, Hagan, Lavarello, Repetto, Rogers and Swain."]]},
 /* Europe */
 "europe|Where Europe ends":{globe:[46,52,1.3],card:"left"},          /* the map key covered the Bosphorus and Black Sea tags */
 "europe|The biggest countries":{globe:[24,50,1.6],card:"left"},      /* the "Texas · drag me" tag was under the card */
 "europe|Europe’s highest mountain":{globe:[33,46,1.7]},             /* Elbrus, the point of the stop, was off the edge */
 "europe|Europe’s great rivers":{globe:[18,50,1.35]},                /* the Volga's mouth was under the map key, the Rhine under the card */
 "europe|Choirs and good government":{globe:[24,41,3.6]},            /* Calabria was under the map key */
 "europe|Cyprus is in Asia":{globe:[27,38,2.4]},                     /* Cyprus itself was under the map key */
 "europe|Greenland icy, Iceland green":{globe:[-28,67,2.2],card:"left"}, /* Erik the Red's farm was under the map key */
 /* Polar bears do not outnumber people on Svalbard: the Norwegian Polar Institute's 2015 count found about 975 bears in
    the Norwegian part of the Barents Sea, and only around 300 live on the islands all year, against about 2,500 people
    (Statistics Norway). The 2,650 figure often quoted is for the whole Barents Sea (Jon Aars, Norwegian Polar Institute). */
 "europe|Islands of the midnight sun":{rep:[["Polar bears outnumber people on the islands, so anyone leaving town must carry protection.","Polar bears roam the islands, so anyone leaving town must carry protection (people still outnumber the bears: a few hundred bears live there all year, among about 2,500 people)."]]},
 /* Asia */
 "asia|Asia’s high peaks":{globe:[92,32,1.2],card:"left"},           /* Gongga Shan was round the edge, then under the map key */
 "asia|The roof of the world":{globe:[92,32,1.2],card:"left"},
 "asia|Asia’s water tower":{globe:[78,28,1.15],card:"left"},         /* the Yangtze's mouth was under the map buttons, the Indus under the card */
 "asia|Deserts and steppe":{globe:[80,36,1.3],card:"left"},          /* the Empty Quarter was off screen, Karakum under the key */
 "asia|Birthplace of religions":{globe:[63,27,1.45]},                /* Bodh Gaya and Varanasi were off the edge */
 "asia|Asia’s giant cities":{globe:[106,14,1.3]},                    /* Jakarta's photo was off the bottom, Delhi under the card */
 "asia|Megacities":{globe:[106,14,1.3]},
 "asia|Islands of fire":{globe:[126,16,1.3]}                         /* Indonesia's photo was off the bottom */
};
/* framing is pinned: several sweep files set a stop's globe or card side from their own psGo wrappers, some of them
   running after this one, so a plain assignment would be undone. The pinned field ignores later writes. */
function pin(S,k,v){try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rvc){d.get._rvc.v=v;return}
 const box={v},get=()=>Array.isArray(box.v)?box.v.slice():box.v;get._rvc=box;Object.defineProperty(S,k,{configurable:false,enumerable:true,get,set(){}})}catch(e){SET(S,k,v)}}
function applyFix(S,tour,soft){try{if(!S)return;const X=FIX[tour+"|"+S.title];if(!X)return;
 const put=soft?(S,k,v)=>{const d=Object.getOwnPropertyDescriptor(S,k);if(!(d&&d.get&&d.get._rvc))SET(S,k,v)}:pin;
 if(X.globe)put(S,"globe",X.globe);if(X.card)put(S,"card",X.card);
 if(X.phDrop&&Array.isArray(S.phPins)){const L=S.phPins.filter(q=>!(q&&X.phDrop.test(String(q.label||"").replace(/\u200b/g,""))));if(L.length!==S.phPins.length)SET(S,"phPins",L)}
 (X.rep||[]).forEach(([a,b])=>["stat","body","more"].forEach(k=>{if(typeof S[k]==="string"&&S[k].includes(a))SET(S,k,S[k].split(a).join(b))}))}catch(e){}}
/* the Borders tour opens on the history map at 2026, but when the tour starts from scratch the map underneath can still
   be the year 1000 (the newer history map loads after the tour's first psSetSub). Set the stop's year again once the
   stop has settled, if the map is not showing it. */
function yearCheck(i){try{if(typeof ps==="undefined"||!ps||ps.i!==i)return;const T=PS_TOURS[ps.tour],S=psSteps()[i];
 if(!T||!T.map||T.map.mode!=="history"||!S||!S.sub||typeof histYear!=="function"||typeof psSetSub!=="function")return;
 const y=String(S.sub).split("/")[0],Y=histYear();if(Y&&Y.y!==y)psSetSub(S.sub)}catch(e){}}
function wrapGo(){if(typeof psGo!=="function")return false;if(psGo._rvc)return true;const _g=psGo;
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];applyFix(S,ps&&ps.tour)}catch(e){}const r=_g.apply(this,arguments);
  try{const at=ps&&ps.i;[900,2500].forEach(t=>setTimeout(()=>yearCheck(at),t))}catch(e){}return r};psGo._rvc=1;return true}
/* fixes on the data too, for the first stop shown (plain values here: other files still set up these stops at load) */
function applyAll(){try{for(const t of["borders","islands","europe","asia"]){const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>applyFix(S,t,1))}}catch(e){}}
{let n=0;const t=setInterval(()=>{const ok=wrapGo();if(ok)applyAll();if(ok&&n>20||++n>90)clearInterval(t)},500)}
/* when a tour starts on its first stop, psGo is not always called: check the year there too */
setInterval(()=>{try{if(typeof ps!=="undefined"&&ps&&ps.tour==="borders"&&ps.i===0&&!ps._rvcY){ps._rvcY=1;[1200,3000,6000].forEach(t=>setTimeout(()=>yearCheck(0),t))}}catch(e){}},700);

/* ============================================================ 2. interactive stops: shared helpers */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function quiet(el){["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function tag(L,cls){const d=document.createElement("div");d.className="rvc-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 /* a tag that would fall on the card slides sideways off it, if there is room; otherwise it hides */
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;
  if(!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])){const toR=B[2]+4-x0,toL=B[0]-4-(x0+r.width);
   const dx=Math.abs(toR)<=Math.abs(toL)&&x0+toR+r.width<h.width-4||x0+toL<4?toR:toL;
   if(Math.abs(dx)<r.width+60&&x0+dx>=4&&x0+dx+r.width<=h.width-4)d.style.left=(q[0]+dx)+"px";else hide=true}}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvc-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvc-new");void e.offsetWidth;e.classList.add("rvc-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
function polysOf(f){if(!f||!f.geometry)return[];const P=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.type==="MultiPolygon"?f.geometry.coordinates:[];
 return P.map(c=>({type:"Polygon",coordinates:c})).filter(p=>{const a=d3.geoArea(p);p.a=a;return a>0&&a<2*Math.PI})}
/* the piece of a country's outline that contains a point (an island of a many-island country) */
function pieceAt(code,ll){return polysOf(feat(code)).find(p=>{try{return d3.geoContains(p,ll)}catch(e){return false}})||null}
function rng(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* n points spread evenly by area over a list of polygons */
function sampleIn(P,n,seed){const R=rng(seed),tot=P.reduce((s,p)=>s+p.a,0),out=[];P.forEach((p,j)=>{
  const want=j===P.length-1?n-out.length:Math.round(n*p.a/tot),b=d3.geoBounds(p);let x0=b[0][0],x1=b[1][0];if(x1<x0)x1+=360;const s0=Math.sin(b[0][1]*Math.PI/180),s1=Math.sin(b[1][1]*Math.PI/180);
  for(let k=0,tries=0;k<want&&tries<want*200;tries++){let lon=x0+R()*(x1-x0);if(lon>180)lon-=360;const pt=[lon,Math.asin(s0+R()*(s1-s0))*180/Math.PI];if(d3.geoContains(p,pt)){out.push(pt);k++}}});
 for(let i=out.length-1;i>0;i--){const j=Math.floor(R()*(i+1)),t=out[i];out[i]=out[j];out[j]=t}return out}
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*28/z,ll[1]*(1-.3/Math.max(1,z))],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}

/* ============================================================ A. Land nobody wants (Bir Tawil)
   Wikipedia, "Bir Tawil" and "Halaib Triangle": the 1899 Anglo-Egyptian agreement set the border at the 22nd parallel;
   in 1902 Britain drew a separate administrative line that gave Bir Tawil (grazing land of the Ababda, south of the
   parallel) to Egypt and the Halaib Triangle (north of it, on the Red Sea, about 20,580 km²) to Sudan. Egypt claims the
   1899 line, Sudan the 1902 line; both include Halaib, neither Bir Tawil (about 2,060 km²). The shapes are the stop's own
   (its Halaib outline and its Bir Tawil "hole"), drawn roughly. */
const HALAIB=[[34.09,22],[36.89,22],[36.86,22.06],[36.78,22.16],[36.68,22.26],[36.57,22.35],[36.45,22.46],[36.32,22.58],[36.2,22.7],[36.06,22.83],[35.92,22.95],[35.78,23.06],[35.65,23.14],[35.42,22.96],[35.12,22.72],[34.8,22.47],[34.47,22.24],[34.09,22]];
const BIRT=[[33.18,22],[34.09,22],[34.05,21.95],[33.98,21.88],[33.88,21.8],[33.76,21.74],[33.62,21.72],[33.5,21.75],[33.38,21.82],[33.27,21.91],[33.18,22]];
const ring=c=>{const r=c.slice();const a=r[0],b=r[r.length-1];if(a[0]!==b[0]||a[1]!==b[1])r.push(a);return r};
const polyGeo=c=>{const r=ring(c);let p={type:"Polygon",coordinates:[r]};if(d3.geoArea(p)>2*Math.PI)p={type:"Polygon",coordinates:[r.slice().reverse()]};return p};
const EGY={n:"Egypt",c:"#d9682b",f:"🇪🇬"},SUD={n:"Sudan",c:"#2e9d5b",f:"🇸🇩"};
const LINE1899=[[31,22],[37.2,22]];
const LINE1902=[[31,22],[33.18,22]].concat(BIRT.slice(0,-1).reverse().slice(0,-1)).concat([[34.09,22]]).concat(HALAIB.slice(1,-1).reverse().filter(p=>p[1]>22.001)).concat([[36.89,22],[37.2,22]]);
const BIRTW={tour:"borders",title:"Land nobody wants",look:[[34.9,22.3],11],
 tip:"Pick a border. Who gets the Halaib Triangle, and who gets Bir Tawil?",
 card:()=>'<div class="rvc-row rvc-btns"><button type="button" class="rvc-btn" data-l="1899">📏 Egypt’s border (1899)</button><button type="button" class="rvc-btn" data-l="1902">〰 Sudan’s border (1902)</button></div><div class="rvc-own"></div>',
 init(L){L.line=null;L.seen={};const cp=svgEl(L.geo,"clipPath",{id:"rvcLand"});L.land=svgEl(cp,"path",{});const G=svgEl(L.geo,"g",{"clip-path":"url(#rvcLand)"});L.gH=svgEl(G,"path",{class:"rvc-area"});L.gB=svgEl(G,"path",{class:"rvc-area"});L.gL=svgEl(G,"path",{class:"rvc-bline"});
  L.hT=tag(L,"rvc-small");L.bT=tag(L,"rvc-small");L.hint=tag(L,"rvc-hint")},
 wire(L){L.card.querySelectorAll(".rvc-btn").forEach(b=>b.onclick=()=>{L.line=b.dataset.l;L.seen[L.line]=1;L._said="";L.dirty=1})},
 draw(L){const own=L.line==="1899"?{h:EGY,b:SUD}:L.line==="1902"?{h:SUD,b:EGY}:null;
  /* the shapes are rough: keep them on the map's own land */
  try{L.land.setAttribute("d",geoD(feat("eg"))+geoD(feat("sd")))}catch(e){}
  L.gH.setAttribute("d",geoD(polyGeo(HALAIB)));L.gB.setAttribute("d",geoD(polyGeo(BIRT)));
  const nobody=L.seen["1899"]&&L.seen["1902"];
  L.gH.style.fill=own?own.h.c:"rgba(255,255,255,.35)";L.gB.style.fill=own?own.b.c:nobody?"rgba(255,255,255,.9)":"rgba(255,255,255,.35)";
  L.gB.classList.toggle("rvc-pulse",!own||nobody);
  L.gL.setAttribute("d",L.line?geoD({type:"LineString",coordinates:L.line==="1899"?LINE1899:LINE1902}):"");
  putTag(L,L.hT,proj(L,[35.7,22.7],1),own?"Halaib → "+own.h.f+" "+own.h.n:"Halaib Triangle",-34);
  putTag(L,L.bT,proj(L,[33.6,21.82],1),own?"Bir Tawil → "+own.b.f+" "+own.b.n:"Bir Tawil",10);
  putTag(L,L.hint,!L.line?proj(L,[35.2,21.1],1):null,"Pick a border on the card",0);
  if(L.card){L.card.querySelectorAll(".rvc-btn").forEach(b=>b.classList.toggle("rvc-on",b.dataset.l===L.line));
   setHTML(L.card.querySelector(".rvc-own"),own?'<div class="rvc-score"><span class="rvc-chip" style="background:'+own.h.c+'">Halaib, about 20,580 km²: '+own.h.n+'</span><span class="rvc-chip" style="background:'+own.b.c+'">Bir Tawil, about 2,060 km²: '+own.b.n+"</span></div>":"")}
  if(!L.line)say(L,"Two borders, one desert","Egypt and Sudan each say a different line is the real border. Try both and see what each country would get.");
  else if(nobody)say(L,"So nobody claims Bir Tawil","Each country picks the line that gives it Halaib: the bigger piece, with a coast and towns. Taking Bir Tawil would mean accepting the other line, and losing Halaib. So both say Bir Tawil belongs to the other, and nobody claims it.");
  else if(L.line==="1899")say(L,"Egypt’s border: straight along 22° N","Agreed in 1899. Everything north of the parallel, Halaib too, is Egypt’s; Bir Tawil, south of it, is Sudan’s. This is the line Egypt claims. Now try Sudan’s.");
  else say(L,"Sudan’s border: the 1902 line","In 1902 Britain drew a line for running the land day to day: Halaib went to Sudan, and Bir Tawil, grazing land of a tribe from the north, to Egypt. This is the line Sudan claims. "+(L.seen["1899"]?"":"Now try Egypt’s."))}};

/* ============================================================ B. The island that switches (Pheasant Island)
   Wikipedia, "Pheasant Island": a condominium set up by the Treaty of the Pyrenees (1659); it is under Spanish
   administration from 1 February to 31 July and under French administration from 1 August to 31 January. The naval
   commanders of San Sebastián and Bayonne take turns as its governor. Position: 43.3431° N, 1.7636° W. */
const PHE=[-1.7636,43.3431],MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PHEAS={tour:"borders",title:"The island that switches",dur:12,loop:1,look:[[-1.77,43.34],12],
 tip:"Slide through the year (or press ▶). Whose island is it today?",
 card:()=>'<div class="rvc-row"><button type="button" class="rvc-play" aria-label="Play">▶</button><input type="range" class="rvc-range" min="0" max="364" step="1" value="0" aria-label="Day of the year"><span class="rvc-read"></span></div><div class="rvc-cal"></div>',
 init(L){L.d=10;L.mk=svgEl(L.svg,"g",{});L.ring=svgEl(L.mk,"circle",{r:"16",class:"rvc-ring"});L.dot=svgEl(L.mk,"circle",{r:"5",class:"rvc-dot"});L.fl=tag(L,"rvc-bub")},
 wire(L){const c=L.card,b=c.querySelector(".rvc-play"),r=c.querySelector(".rvc-range");
  b.onclick=()=>{L.playing=!L.playing;b.textContent=L.playing?"❚❚":"▶";b.setAttribute("aria-label",L.playing?"Pause":"Play")};
  r.addEventListener("input",()=>{L.playing=false;b.textContent="▶";L.d=+r.value;L.dirty=1})},
 tick(L,dt){if(L.playing){L.d=(L.d+dt*365/this.dur)%365;L.dirty=1}L.t=(L.t||0)+dt;try{L.ring.setAttribute("r",(14+4*Math.sin(L.t*4)).toFixed(1))}catch(e){}},
 draw(L){const d=Math.floor(L.d),dt=new Date(2026,0,1+d),m=dt.getMonth(),es=m>=1&&m<=6,who=es?{n:"Spain",f:"🇪🇸",c:"#c8102e"}:{n:"France",f:"🇫🇷",c:"#0055a4"};
  const q=proj(L,PHE);if(q){L.mk.style.display="";L.mk.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")")}else L.mk.style.display="none";
  L.ring.style.stroke=who.c;putTag(L,L.fl,proj(L,PHE,1),who.f+" "+who.n+"’s island today",-30);L.fl.style.background=who.c;
  if(L.card){const r=L.card.querySelector(".rvc-range");if(r&&document.activeElement!==r)r.value=d;const o=L.card.querySelector(".rvc-read");const s=dt.getDate()+" "+MON[m];if(o&&o.textContent!==s)o.textContent=s;
   setHTML(L.card.querySelector(".rvc-cal"),'<div class="rvc-months">'+MON.map((n,i)=>{const e=i>=1&&i<=6;return'<i class="'+(e?"rvc-es":"rvc-fr")+(i===m?" rvc-now":"")+'">'+n+"</i>"}).join("")+'</div><div class="rvc-note">🇪🇸 1 February to 31 July · 🇫🇷 1 August to 31 January</div>')}
  if(m===1&&dt.getDate()<=8||m===7&&dt.getDate()<=8)say(L,"Handover day: 1 "+(m===1?"February":"August"),"The island passes to "+who.n+". In practice a naval commander from "+(es?"San Sebastián":"Bayonne")+" takes over as governor: a border that moves on the calendar, not on the map.");
  else say(L,who.f+" "+who.n+"’s, until 1 "+(es?"August":"February"),"Six months each, every year since the peace treaty was signed here in 1659. Nobody lives on the island, so the swap changes little on the ground: it is a symbol that two old enemies share the river.")}};

/* ============================================================ C. Why Java, not Borneo
   Java: about 150 million people (Indonesia's 2020 census counted 151.6 million on Java, Statistics Indonesia) on about
   128,300 km²; Borneo: about 23 million people on about 743,300 km² (Wikipedia, "Java" and "Borneo"). People per km²
   worked out from these: Java about 1,170, Borneo about 31. One dot is a million people, spread at random over each
   island (the map's own outlines: Java is Indonesia's island piece around 110° E, 7° S; Borneo is the pieces of
   Indonesia, Malaysia and Brunei on it), so where a dot falls means nothing. */
const JAVA={tour:"islands",title:"Why Java, not Borneo",
 tip:"Press Fill: one dot for every million people. Which island fills up?",
 card:()=>'<div class="rvc-row"><button type="button" class="rvc-btn rvc-go">👥 Fill with people</button><button type="button" class="rvc-btn rvc-reset">↺</button></div><div class="rvc-bars"></div>',
 init(L){L.f=0;L.go=false;const G=svgEl(L.svg,"g",{class:"rvc-pdots"});L.dg=G;
  try{const jv=pieceAt("id",[110,-7.3]),bi=pieceAt("id",[114,0]),bm=pieceAt("my",[113.5,3]),bn=pieceAt("bn",[114.7,4.6]);
   L.J=sampleIn([jv].filter(Boolean),150,7);L.B=sampleIn([bi,bm,bn].filter(Boolean),23,11)}catch(e){L.J=[];L.B=[]}
  L.Jd=L.J.map(()=>svgEl(G,"circle",{r:"3.2",class:"rvc-jd"}));L.Bd=L.B.map(()=>svgEl(G,"circle",{r:"3.2",class:"rvc-bd"}));
  L.jT=tag(L,"rvc-small");L.bT=tag(L,"rvc-small")},
 wire(L){const c=L.card;c.querySelector(".rvc-go").onclick=()=>{L.go=true;if(L.f>=1)L.f=0;L._said=""};c.querySelector(".rvc-reset").onclick=()=>{L.go=false;L.f=0;L._said="";L.dirty=1}},
 tick(L,dt){if(L.go&&L.f<1){L.f=Math.min(1,L.f+dt/6);L.dirty=1;if(L.f>=1)L.go=false}},
 draw(L){const nJ=Math.round(L.f*L.J.length),nB=Math.round(L.f*L.B.length);
  const put=(arr,els,n)=>els.forEach((e,i)=>{const q=i<n?proj(L,arr[i]):null;if(q){e.style.display="";e.setAttribute("cx",q[0].toFixed(1));e.setAttribute("cy",q[1].toFixed(1))}else e.style.display="none"});
  put(L.J,L.Jd,nJ);put(L.B,L.Bd,nB);
  putTag(L,L.jT,proj(L,[110.5,-8.6],1),"Java: "+nJ+" million",8);putTag(L,L.bT,proj(L,[114,1.8],1),"Borneo: "+nB+" million",-30);
  if(L.card){const W=1170,b=31;setHTML(L.card.querySelector(".rvc-bars"),'<div class="rvc-bartitle">People per km²</div><div class="rvc-lane"><span>Java</span><div class="rvc-track"><i style="width:'+(L.f*100).toFixed(1)+'%;background:#d9682b"></i></div><b>'+fmt(W*L.f)+'</b></div><div class="rvc-lane"><span>Borneo</span><div class="rvc-track"><i style="width:'+(L.f*b/W*100).toFixed(2)+'%;background:#2e9d5b"></i></div><b>'+fmt(b*L.f)+"</b></div>")}
  if(L.f<=0)say(L,"Borneo is about six times bigger…","…so which island do you think holds more people? Press Fill and watch.");
  else if(L.f<1)say(L,"Filling up…","Java: "+nJ+" million. Borneo: "+nB+" million.");
  else say(L,"Java is about 38 times as crowded","About 1,170 people per km² on Java, about 31 on Borneo. Java’s volcanoes keep renewing its soil, so its rice fields have fed dense villages for centuries; Borneo’s old, rain-washed soils never could.")}};

/* ============================================================ D. The olive line
   Which side of the stop's own line (its rough northern limit of olive growing) each city lies on; all eight are far
   from the line, so the answer does not depend on how roughly it is drawn. */
const OCITY=[{n:"Amsterdam",ll:[4.9,52.37],s:"n"},{n:"Rome",ll:[12.5,41.9],s:"s"},{n:"Madrid",ll:[-3.7,40.42],s:"s"},{n:"Berlin",ll:[13.4,52.52],s:"n"},
 {n:"Athens",ll:[23.73,37.98],s:"s"},{n:"London",ll:[-.13,51.51],s:"n"},{n:"Marseille",ll:[5.37,43.3],s:"s"},{n:"Vienna",ll:[16.37,48.21],s:"n"}];
const OLIVE={tour:"europe",title:"The olive line",
 tip:"A city glows. Olive-oil country or butter country? Tap your answer.",
 card:()=>'<div class="rvc-row rvc-btns"><button type="button" class="rvc-btn rvc-k" data-k="s">🫒 Olive oil (south)</button><button type="button" class="rvc-btn rvc-k" data-k="n">🧈 Butter (north)</button></div><div class="rvc-score"></div>',
 init(L){L.cur=0;L.ans={};L.t=0;const G=svgEl(L.svg,"g",{});L.dots=OCITY.map(()=>{const c=svgEl(G,"circle",{r:"6",class:"rvc-cdot"});c.style.pointerEvents="all";c.style.cursor="pointer";quiet(c);return c});
  L.dots.forEach((c,i)=>c.addEventListener("pointerdown",e=>{e.stopPropagation();e.preventDefault();L.cur=i;L._said="";L.dirty=1}));L.tags=OCITY.map(()=>tag(L,"rvc-small"));L.bub=tag(L,"rvc-bub")},
 wire(L){L.card.querySelectorAll(".rvc-k").forEach(b=>b.onclick=()=>{const i=L.cur;if(L.ans[i])return;L.ans[i]={k:b.dataset.k,ok:b.dataset.k===OCITY[i].s};L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L||!L.el.isConnected)return;const n=OCITY.findIndex((x,j)=>!L.ans[j]);if(n>=0){L.cur=n;L._said="";L.dirty=1}},1800)})},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;const c=L.dots[L.cur];if(c&&!L.ans[L.cur])c.setAttribute("r",(6+2.5*Math.sin(L.t*5)).toFixed(1))},
 draw(L){let right=0,done=0;OCITY.forEach((o,i)=>{const a=L.ans[i],q=proj(L,o.ll),c=L.dots[i];if(q){c.style.display="";c.setAttribute("cx",q[0].toFixed(1));c.setAttribute("cy",q[1].toFixed(1))}else c.style.display="none";
   c.style.fill=a?(o.s==="s"?"#6b8e23":"#f2c94c"):i===L.cur?"#ffd166":"#fff";if(i!==L.cur||a)c.setAttribute("r","6");if(a){done++;if(a.ok)right++}
   putTag(L,L.tags[i],a&&i!==L.cur?proj(L,o.ll,1):null,a?(a.ok?"✓ ":"✗ ")+(o.s==="s"?"🫒 ":"🧈 ")+o.n:null,9)});
  const o=OCITY[L.cur],a=L.ans[L.cur];putTag(L,L.bub,proj(L,o.ll,1),a?(a.ok?"Right! ":"No: ")+(o.s==="s"?"🫒 olive oil":"🧈 butter"):o.n+": olive oil or butter?",-14);
  if(L.card){L.card.querySelectorAll(".rvc-k").forEach(b=>{b.disabled=!!a;b.classList.toggle("rvc-right",!!a&&b.dataset.k===o.s);b.classList.toggle("rvc-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   setHTML(L.card.querySelector(".rvc-score"),'<div class="rvc-dots">'+OCITY.map((x,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"rvc-ok":"rvc-no":"")+(i===L.cur?" rvc-at":"")+'" title="'+esc(x.n)+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+"</span>")}
  if(done===OCITY.length)say(L,"All eight: "+right+" right","Every city south of the line has the long, dry summers and mild winters olive trees need; north of it, frost kills them, and the green pastures suited cows instead. Cooking followed the climate.");
  else if(a)say(L,(a.ok?"Right: ":"Not quite: ")+o.n+" is "+(o.s==="s"?"south":"north")+" of the line",o.s==="s"?"Dry summers, mild winters: olive country.":"Too cold in winter for olive trees, and green enough for dairy cows.");
  else say(L,o.n,"Is it south of the orange line, where olives grow, or north of it?")}};

/* ============================================================ E. Asia's water tower: which sea?
   Where each river reaches the sea (Encyclopaedia Britannica articles on each river): the Yangtze, the East China Sea at
   Shanghai; the Yellow River, the Bohai Sea; the Mekong, the South China Sea through its delta in Vietnam; the Ganges and
   the Brahmaputra join in Bangladesh and reach the Bay of Bengal together; the Indus, the Arabian Sea near Karachi; the
   Salween, the Andaman Sea (Gulf of Martaban) at Mawlamyine. The rivers are the app's own river lines. */
const SEAS={ecs:"East China Sea",boh:"Bohai Sea",scs:"South China Sea",bob:"Bay of Bengal",ara:"Arabian Sea",and:"Andaman Sea"};
const RIV=[{n:"Yangtze",s:"ecs",m:[121.9,31.4]},{n:"Indus",s:"ara",m:[67.4,23.9]},{n:"Mekong",s:"scs",m:[106.6,9.7]},{n:"Ganges",s:"bob",m:[89.6,21.9]},
 {n:"Yellow",s:"boh",m:[119.2,37.75]},{n:"Salween",s:"and",m:[97.6,16.4]},{n:"Brahmaputra",s:"bob",m:[90.6,22.4]}];
const RIVQ={tour:"asia",title:"Asia’s water tower",
 tip:"A river glows. Which sea does it reach? Tap the sea.",
 card:()=>'<div class="rvc-row rvc-btns">'+Object.keys(SEAS).map(k=>'<button type="button" class="rvc-btn rvc-k" data-k="'+k+'">'+SEAS[k]+"</button>").join("")+'</div><div class="rvc-score"></div>',
 init(L){L.cur=0;L.ans={};L.t=0;let O=null;try{O=globeOverlays()}catch(e){}
  L.rv=RIV.map(r=>{const f=O&&(O.rivers||[]).find(x=>x.n===r.n),gg=svgEl(L.geo,"g",{}),sh=svgEl(gg,"path",{class:"rvc-rsh"}),p=svgEl(gg,"path",{class:"rvc-rline"});return{r,f,sh,p,m:svgEl(L.svg,"circle",{r:"6",class:"rvc-mouth"}),t:tag(L,"rvc-small")}});
  L.bub=tag(L,"rvc-bub")},
 wire(L){L.card.querySelectorAll(".rvc-k").forEach(b=>b.onclick=()=>{const i=L.cur;if(L.ans[i])return;L.ans[i]={k:b.dataset.k,ok:b.dataset.k===RIV[i].s};L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L||!L.el.isConnected)return;const n=RIV.findIndex((x,j)=>!L.ans[j]);if(n>=0){L.cur=n;L._said="";L.dirty=1}},2400)})},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;const o=L.rv[L.cur];if(o&&!L.ans[L.cur])o.p.style.strokeWidth=(4+2*Math.sin(L.t*5)).toFixed(1)},
 draw(L){let right=0,done=0;L.rv.forEach((o,i)=>{const a=L.ans[i],cur=i===L.cur,d=o.f?geoD(o.f):"";o.p.setAttribute("d",d);o.sh.setAttribute("d",d);
   o.p.style.stroke=a?(a.ok?"#1f8a4c":"#c2364f"):cur?"#ffd166":"rgba(255,255,255,.0)";o.sh.style.display=cur||a?"":"none";if(!(cur&&!a))o.p.style.strokeWidth="3.5";
   const q=a?proj(L,o.r.m):null;if(q){o.m.style.display="";o.m.setAttribute("cx",q[0].toFixed(1));o.m.setAttribute("cy",q[1].toFixed(1))}else o.m.style.display="none";
   if(a){done++;if(a.ok)right++}putTag(L,o.t,a&&!cur?proj(L,o.r.m,1):null,a?(a.ok?"✓ ":"✗ ")+o.r.n+" → "+SEAS[o.r.s]:null,9)});
  const o=L.rv[L.cur],a=L.ans[L.cur];putTag(L,L.bub,proj(L,a?o.r.m:[91,31.5],1),a?(a.ok?"Right! ":"No: ")+"the "+o.r.n+" reaches the "+SEAS[o.r.s]:"The "+o.r.n+": which sea?",-14);
  if(L.card){L.card.querySelectorAll(".rvc-k").forEach(b=>{b.disabled=!!a;b.classList.toggle("rvc-right",!!a&&b.dataset.k===o.r.s);b.classList.toggle("rvc-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   setHTML(L.card.querySelector(".rvc-score"),'<div class="rvc-dots">'+RIV.map((x,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"rvc-ok":"rvc-no":"")+(i===L.cur?" rvc-at":"")+'" title="'+esc(x.n)+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+"</span>")}
  if(done===RIV.length)say(L,"Seven rivers, one plateau, six seas: "+right+" right","From the same high plateau, rivers run east to the Pacific, south to the Indian Ocean and west round the Himalaya. Their valleys and deltas are where most of Asia’s people live, in at least ten countries.");
  else if(a)say(L,(a.ok?"Right: ":"Not quite: ")+"the "+SEAS[o.r.s],o.r.n==="Brahmaputra"?"The Brahmaputra flows east along the Himalaya, turns south round their end and joins the Ganges in Bangladesh: they reach the Bay of Bengal together, through the world’s biggest delta.":o.r.n==="Ganges"?"Down the plain of northern India, past Varanasi, to the Bay of Bengal, joined by the Brahmaputra in Bangladesh.":"Follow the glowing line from the plateau to the dot where it meets the sea.");
  else say(L,"The "+o.r.n,"Follow the glowing line down from the plateau. Where does it meet the sea?")}};

/* ============================================================ the engine: one stop at a time */
const DEFS=[BIRTW,PHEAS,JAVA,OLIVE,RIVQ];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;return DEFS.find(d=>d.tour===ps.tour&&d.title===S.title)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="rvc-layer";el.innerHTML='<svg class="rvc-svg"><defs><clipPath id="rvcClip"><path class="rvc-clipp" clip-rule="evenodd"/></clipPath></defs><g class="rvc-clipg" clip-path="url(#rvcClip)"></g></svg>';G.host.appendChild(el);
 const svg=el.querySelector("svg");const cg=svg.querySelector(".rvc-clipg");L={D,host:G.host,el,svg:cg,geo:svgEl(cg,"g",{}),root:svg,clipP:svg.querySelector(".rvc-clipp"),dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}lastT=0;loop();
 /* a stop whose place is tiny turns the globe in closer, once the tour's own move has settled */
 if(D.look){const L0=L;setTimeout(()=>{if(L===L0&&L.el.isConnected)turnTo(L,D.look[0],D.look[1])},1600)}}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}L=null}document.querySelectorAll(".rvc-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".rvc-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvc-ctl";
 c.innerHTML='<div class="rvc-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvc-ep"></div>';at0.after(c);L.card=c;L._said="";
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.rot||[]).join(",")+G.zoom+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.root.setAttribute("width",hr.width);L.root.setAttribute("height",hr.height);
   /* shapes drawn with the globe's projection (geoD) sit in L.geo, shifted by the canvas offset; points from proj() are
      already in the host's pixels. Everything is kept off the tour card by an even-odd clip. */
   L.geo.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");
   L.clipP.setAttribute("d","M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z"+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvc-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvc-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvc-svg{position:absolute;left:0;top:0;overflow:visible}
.rvc-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvc-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.rvc-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvc-hint{transform:translate(-50%,-50%);background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:rvcNudge 1.4s ease-in-out infinite}
@keyframes rvcNudge{50%{margin-top:-5px}}
.rvc-area{stroke:#fff;stroke-width:2;fill-opacity:.85;transition:fill .4s}
.rvc-area.rvc-pulse{animation:rvcPulse 1.3s ease-in-out infinite}@keyframes rvcPulse{50%{fill-opacity:.35}}
.rvc-bline{fill:none;stroke:#13294b;stroke-width:4;stroke-linejoin:round;stroke-linecap:round;filter:drop-shadow(0 0 2px #fff)}
.rvc-ring{fill:rgba(255,255,255,.25);stroke-width:3.5}.rvc-dot{fill:#fff;stroke:#13294b;stroke-width:2}
.rvc-jd{fill:#d9682b;stroke:#fff;stroke-width:1}.rvc-bd{fill:#2e9d5b;stroke:#fff;stroke-width:1}
.rvc-cdot{stroke:#13294b;stroke-width:2.5}
.rvc-rsh{fill:none;stroke:rgba(10,20,40,.55);stroke-width:8;stroke-linecap:round;stroke-linejoin:round}
.rvc-rline{fill:none;stroke-linecap:round;stroke-linejoin:round}
.rvc-mouth{fill:#ffd166;stroke:#13294b;stroke-width:2}
.rvc-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvc-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvc-row{display:flex;align-items:center;gap:10px}
.rvc-btns{gap:6px;flex-wrap:wrap}
.rvc-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.rvc-btn.rvc-reset{flex:0 0 auto}
.rvc-btn.rvc-on{background:#13294b;color:#fff;border-color:#13294b}
.rvc-btn:disabled{cursor:default;opacity:.55}.rvc-btn.rvc-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvc-btn.rvc-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvc-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.rvc-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.rvc-read{flex:0 0 auto;font-weight:800;font-size:12.5px;color:#9a4a16;white-space:nowrap;min-width:48px;text-align:right}
.rvc-months{display:flex;gap:2px;margin-top:8px}.rvc-months i{flex:1;font-style:normal;text-align:center;font-size:10.5px;font-weight:700;padding:3px 0;border-radius:4px;color:#fff;opacity:.55}
.rvc-months i.rvc-es{background:#c8102e}.rvc-months i.rvc-fr{background:#0055a4}.rvc-months i.rvc-now{opacity:1;box-shadow:0 0 0 2px #ffd166}
.rvc-note{font-size:12px;opacity:.8;margin-top:4px}
.rvc-score{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:12.5px}
.rvc-chip{color:#fff;font-weight:700;font-size:12px;padding:3px 9px;border-radius:999px}
.rvc-dots{display:flex;gap:4px}.rvc-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvc-dots i.rvc-ok{background:#1f8a4c}.rvc-dots i.rvc-no{background:#c2364f}.rvc-dots i.rvc-at{box-shadow:0 0 0 2px #ffd166}
.rvc-bars{margin-top:8px;display:flex;flex-direction:column;gap:5px}
.rvc-bartitle{font-size:12px;font-weight:700;opacity:.75}
.rvc-lane{display:flex;align-items:center;gap:8px;font-size:12.5px}.rvc-lane span{flex:0 0 52px;font-weight:800}.rvc-lane b{flex:0 0 48px;text-align:right}
.rvc-track{position:relative;flex:1 1 auto;height:10px;border-radius:6px;background:rgba(19,41,75,.12)}
.rvc-track i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;min-width:2px}
.rvc-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvc-ep b{display:block;font-size:15px}
.rvc-ep.rvc-new{animation:rvcIn .45s ease}@keyframes rvcIn{from{opacity:.2;transform:translateY(4px)}}
:is(body.dark-theme,body.sky-night) .rvc-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvc-do,:is(body.dark-theme,body.sky-night) .rvc-read{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvc-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvc-btn.rvc-on{background:#fff;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvc-track,:is(body.dark-theme,body.sky-night) .rvc-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}
window.gfPolishRVC={v:1,FIX,L:()=>L};
})();
