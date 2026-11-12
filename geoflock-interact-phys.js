/* GeoFlock: hands-on tour stops for the physical-geography tours. Each stop below gets a layer on the Maps globe and a
   small control block on the card (right after the headline), with a one-line instruction. Everything goes when the
   stop changes or the tour ends; nothing here blocks Next or Back.
   - hazards | What a hurricane needs: drag Hurricane Katrina (2005) along its real track, or press Play. It spins
     anticlockwise, swells over warm water, shrinks over Florida, explodes to Category 5 over the warm Gulf and dies
     inland; its wake is coloured by what the sea (or land) beneath it was doing to it.
   - plates | Los Angeles is coming: drag Los Angeles (and San Diego with it) north-west along the San Andreas Fault;
     the card counts the millions of years and the kilometres still to go until it sits beside San Francisco.
   - volcanoes | The Ring of Fire: tap six famous eruptions around the Pacific in order, oldest first. Each one, once
     found, shows its year and which plate sinks beneath it.
   - weather | The Sahara feeds the Amazon: drag a cloud of Saharan dust from the Bodélé Depression across the
     Atlantic; it thins as dust falls into the sea, and the card gives the real tonnages at 15°W, 35°W and the Amazon.
   - hazards | The loudest sound: press Play or drag the clock to watch Krakatoa's 1883 bang spread at the speed of
     sound; Perth and Rodrigues light up when it reaches them, and a listener you can drag anywhere tells you how long
     the sound took to get there.
   - ice | Icebergs and the Titanic: drag an iceberg from Ilulissat round Baffin Bay and down Iceberg Alley; it melts
     as it goes, the card shows how much of it hides under water, and it ends where the Titanic sank.
   Same pattern as geoflock-odyssey.js: poll `ps`, check the stop's title, draw in amGlobe.host with amGlobe.projection(),
   redraw when the view changes. Globe mode only (the flat map is left alone). Nothing is drawn under the tour card; when
   the thing you are moving slides under the card or round the back of the globe, the globe turns to bring it back
   (amGlobe.lookAt), and the Katrina stop turns once to the Gulf of Mexico when it opens. The Ring of Fire's "Show me the
   next" button turns the globe to the next volcano and makes it pulse. */
(function(){
"use strict";
const R_KM=6371;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const km=(a,b)=>{try{return d3.geoDistance(a,b)*R_KM}catch(e){return 0}};

/* ---------------- shared helpers ---------------- */
/* a lon/lat point → [x,y] in the host's pixels, or null when it is on the far side of the globe */
function proj(L,ll){const G=g();if(!G)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.03)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 /* nothing is drawn under the tour card (the layer sits above the globe, and the card may sit over it) */
 if(B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function unproj(L,x,y){const G=g();try{const p=G.projection();if(!p.invert)return null;const ll=p.invert([x-L.ox,y-L.oy]);if(!ll||!isFinite(ll[0]))return null;
 if(!G._flat&&d3.geoDistance([-G.rot[0],-G.rot[1]],ll)>Math.PI/2-.02)return null;return ll}catch(e){return null}}
function pathOf(L,pts){let d="",pen=false,px=0,py=0;const G=g(),J=G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
/* a route: the polyline cut into short steps, with the distance in km along it */
function route(C,step){step=step||.15;const P=[];for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
  for(let k=0;k<n;k++)P.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}P.push(C[C.length-1].slice(0,2));
 const K=[0];for(let i=1;i<P.length;i++)K.push(K[i-1]+km(P[i-1],P[i]));return{P,K,total:K[K.length-1]}}
function at(R,u){const t=Math.max(0,Math.min(1,u))*R.total;let lo=0,hi=R.K.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.K[m]<=t)lo=m;else hi=m}
 const f=R.K[hi]>R.K[lo]?(t-R.K[lo])/(R.K[hi]-R.K[lo]):0,a=R.P[lo],b=R.P[hi];return{ll:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],i:lo}}
const uOf=(R,ll)=>{let b=0,bd=1e9;R.P.forEach((p,i)=>{const d=Math.hypot(p[0]-ll[0],p[1]-ll[1]);if(d<bd){bd=d;b=i}});return R.K[b]/R.total};
/* the nearest point of the route to the pointer, searched near where the marker is now */
function nearestU(L,R,px,py,u){const cur=at(R,u).i,W=Math.max(60,R.P.length>>2);let best=-1,bd=1e9;
 for(let i=Math.max(0,cur-W);i<=Math.min(R.P.length-1,cur+W);i++){const q=proj(L,R.P[i]);if(!q)continue;const d=Math.hypot(q[0]-px,q[1]-py)+Math.abs(i-cur)*.05;if(d<bd){bd=d;best=i}}
 return best<0?u:R.K[best]/R.total}
/* drag anything: calls mv(x,y) in host pixels; keeps the globe from spinning under the finger */
function draggable(L,el,mv,start){const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{el.setPointerCapture(e.pointerId)}catch(err){}
  el.classList.add("gfx-dragging");if(start)start();const m=ev=>{ev.stopPropagation();const hr=L.host.getBoundingClientRect();try{mv(ev.clientX-hr.left,ev.clientY-hr.top)}catch(err){}L.dirty=1};
  const up=()=>{el.removeEventListener("pointermove",m);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.classList.remove("gfx-dragging")};
  el.addEventListener("pointermove",m);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)};
 /* along a route, the arrow keys move it too */
 if(L.D.dur)el.addEventListener("keydown",e=>{const k=e.key,f=k==="ArrowRight"||k==="ArrowUp"?1:k==="ArrowLeft"||k==="ArrowDown"?-1:0;if(!f)return;e.preventDefault();stopPlay(L);L.u=Math.max(0,Math.min(1,L.u+f*.01));L.dirty=1});
 el.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
const NS="http://www.w3.org/2000/svg";
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function place(el,q){if(!q){el.style.display="none";return false}el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");return true}
/* an HTML label on the map */
function tag(L,cls){const d=document.createElement("div");d.className="gfx-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 /* a label that would spill onto the tour card waits out of sight */
 let hide=false;try{const B=L&&L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
/* the card's "what is happening" line */
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".gfx-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("gfx-new");void e.offsetWidth;e.classList.add("gfx-new")}
/* play / slider row: L.u from 0 to 1 over D.dur seconds */
function playerHTML(label,read){return'<div class="gfx-row"><button type="button" class="gfx-play" aria-label="Play">▶</button><input type="range" class="gfx-range" min="0" max="1000" step="1" value="0" aria-label="'+esc(label)+'"><span class="gfx-read">'+esc(read||"")+"</span></div>"}
function playBtn(L){const b=L.card&&L.card.querySelector(".gfx-play");if(b){b.textContent=L.playing?"❚❚":"▶";b.setAttribute("aria-label",L.playing?"Pause":"Play")}}
function wirePlayer(L){const c=L.card,b=c.querySelector(".gfx-play"),r=c.querySelector(".gfx-range");if(!b||!r)return;
 b.onclick=()=>{if(L.u>=1)L.u=0;L.playing=!L.playing;playBtn(L);L.dirty=1};r.addEventListener("input",()=>{L.playing=false;playBtn(L);L.u=r.value/1000;L.dirty=1})}
function syncRange(L,txt){const c=L.card;if(!c)return;const r=c.querySelector(".gfx-range");if(r&&document.activeElement!==r)r.value=Math.round(L.u*1000);const o=c.querySelector(".gfx-read");if(o&&txt!=null&&o.textContent!==txt)o.textContent=txt}
const stopPlay=L=>{if(L.playing){L.playing=false;playBtn(L)}};

/* ======================================================================== 1. Hurricane Katrina
   Track: the National Hurricane Center's best track for Katrina (HURDAT2; Knabb, Rhome & Brown, "Tropical Cyclone
   Report: Hurricane Katrina", NHC 2005), positions rounded (checked against HURDAT2 2023 release: within a few tenths of a degree). Winds at the marked moments, from the
   same report: formed as a tropical depression near the Bahamas on 23 Aug (30 knots); landfall in south Florida on
   25 Aug as a Category 1 (70 kt, about 130 km/h); peak on 28 Aug over the central Gulf, Category 5 (150 kt, about
   280 km/h, 902 hPa); landfall in south-east Louisiana on 29 Aug as a Category 3 (110 kt, about 205 km/h), then the
   Mississippi coast (105 kt); a tropical depression over Tennessee by 30 Aug. The fast growth over the Gulf came over
   the warm Loop Current (Scharroo, Smith & Lillibridge 2005, Eos 86). The storm's size on the map only follows those
   winds roughly between the marked moments; no number is shown except at them. */
const KAT=[[-75.1,23.1,30],[-75.7,23.4],[-76.2,23.8],[-76.5,24.5],[-76.9,25.4],[-77.7,26.0],[-78.4,26.1],[-79.0,26.2],[-79.6,26.2],
 [-80.1,25.9,70],[-80.3,25.9],[-81.3,25.4,65],[-82.2,25.1],[-83.3,24.6],[-84.4,24.4],[-85.9,24.8],[-86.7,25.2],[-87.7,25.7],[-88.6,26.3,150],
 [-89.2,27.2],[-89.6,28.2],[-89.6,29.3,110],[-89.6,30.2,105],[-89.6,31.1],[-89.1,32.6],[-88.6,34.1],[-88.0,35.6,30],[-87.0,37.0]];
/* what the storm is doing, by where it is along the track (from-point index in KAT) */
const KPH=[
 {from:0,c:"#3b8fd6",h:"23 Aug: born over warm water",t:"Near the Bahamas the sea is warmer than 26.5 °C. Warm, wet air rises from it and the storm feeds and grows, spinning anticlockwise as all northern storms do."},
 {from:9,c:"#9aa3ad",h:"25 Aug: Category 1 hits Florida",t:"Winds of about 130 km/h. Over land it is cut off from its fuel, the warm sea, and weakens."},
 {from:11,c:"#e8701a",h:"26–27 Aug: back over the warm Gulf",t:"Over open water again, it grows back into a strong hurricane."},
 {from:15,c:"#d2252b",h:"28 Aug: Category 5",t:"Over the Loop Current, a deep tongue of very warm water, it explodes: winds of about 280 km/h, one of the strongest Atlantic storms ever measured."},
 {from:19,c:"#e8701a",h:"29 Aug: Category 3 hits Louisiana",t:"Over cooler water near the coast it weakens a little, but still lands with winds of about 205 km/h. Its storm surge broke the levees of New Orleans."},
 {from:22,c:"#9aa3ad",h:"30 Aug: dying over land",t:"With no warm sea under it, it runs out of fuel and weakens to a tropical depression within a day."}];
const KMARK=[{k:0,n:"Born · 23 Aug"},{k:9,n:"Cat 1 · 130 km/h"},{k:18,n:"Cat 5 · 280 km/h"},{k:21,n:"Cat 3 · 205 km/h"}];
let KR=null;
function katR(){if(KR)return KR;const R=route(KAT.map(p=>[p[0],p[1]]),.12);R.uk=KAT.map(p=>uOf(R,p));/* winds at the known points, for the storm's size */
 const W=[];KAT.forEach((p,k)=>{if(p[2]!=null)W.push([R.uk[k],p[2]])});R.W=W;return KR=R}
const katWind=(R,u)=>{const W=R.W;if(u<=W[0][0])return W[0][1];for(let i=1;i<W.length;i++)if(u<=W[i][0]){const a=W[i-1],b=W[i];return a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]||1)}return W[W.length-1][1]};
const katPhase=(R,u)=>{let p=KPH[0];for(const x of KPH)if(u>=R.uk[x.from]-1e-6)p=x;return p};
const STORM='<g class="gfx-spin"><circle r="11" fill="rgba(255,255,255,.35)"/>'+
 [0,120,240].map(a=>'<path transform="rotate('+a+')" d="M0 -6 C 14 -8 24 2 22 16 C 16 6 8 2 0 2 Z" fill="rgba(255,255,255,.92)" stroke="rgba(30,40,60,.35)" stroke-width=".8"/>').join("")+
 '<circle r="4.2" fill="#2b4a6f" stroke="#fff" stroke-width="1.4"/></g>';
const HURR={tour:"hazards",title:"What a hurricane needs",dur:24,look:[-90,30,3.2],follow:1,
 tip:"Drag the hurricane along Katrina’s real 2005 track, or press ▶. Watch it grow over warm water and fade over land.",
 card:L=>playerHTML("How far along Katrina’s track","23 Aug"),
 init(L){const R=katR();L.track=svgEl(L.svg,"path",{class:"gfx-dash"});L.wake=svgEl(L.svg,"g",{});L.marks=KMARK.map(m=>({m,el:tag(L,"gfx-small")}));
  L.st=svgEl(L.svg,"g",{class:"gfx-grab",tabindex:"0","aria-label":"Hurricane Katrina: drag along its track"});svgEl(L.st,"circle",{r:30,class:"gfx-hit"});L.stI=svgEl(L.st,"g",{},STORM);
  L.bub=tag(L,"gfx-bub");L.hint=tag(L,"gfx-hint");L.ang=0;
  draggable(L,L.st,(x,y)=>{L.u=nearestU(L,R,x,y,L.u)},()=>stopPlay(L))},
 tick(L,dt){L.ang-=dt*(60+katWind(katR(),L.u)*2.2);if(L.playing){L.u=Math.min(1,L.u+dt/this.dur);if(L.u>=1){L.playing=false;playBtn(L)}L.dirty=1}
  /* the spin alone only turns the storm */if(L.stI&&L.sc)L.stI.setAttribute("transform","scale("+L.sc.toFixed(2)+") rotate("+(L.ang%360).toFixed(1)+")")},
 draw(L){const R=katR(),s=at(R,L.u),ph=katPhase(R,L.u);L.fll=s.ll;
  L.track.setAttribute("d",pathOf(L,R.P));
  /* the wake, a piece per phase */
  let h="";KPH.forEach((p,j)=>{const a=R.uk[p.from],b=j+1<KPH.length?R.uk[KPH[j+1].from]:1;if(L.u<=a)return;const i0=at(R,a).i,i1=at(R,Math.min(L.u,b)).i;const pts=R.P.slice(i0,i1+1);pts.push(at(R,Math.min(L.u,b)).ll);
   const d=pathOf(L,pts);if(d)h+='<path class="gfx-wake-halo" d="'+d+'"/><path class="gfx-wake" stroke="'+p.c+'" d="'+d+'"/>'});L.wake.innerHTML=h;
  L.marks.forEach(o=>{const uu=R.uk[o.m.k];putTag(o.el,L.u>=uu-1e-6?proj(L,KAT[o.m.k]):null,esc(o.m.n),14)});
  const q=proj(L,s.ll);place(L.st,q);const sc=.55+katWind(R,L.u)/150*1.05;L.sc=sc;L.stI.setAttribute("transform","scale("+sc.toFixed(2)+") rotate("+(L.ang%360).toFixed(1)+")");
  const bt=ph.h.split(": ")[1]||ph.h;putTag(L.bub,q,esc(bt[0].toUpperCase()+bt.slice(1)),-28-sc*20);putTag(L.hint,L.u<.003&&q?[q[0]+34,q[1]-8]:null,"Drag the storm ⟶");
  say(L,ph.h,ph.t);syncRange(L,ph.h.split(":")[0])}};

/* ======================================================================== 2. Los Angeles slides north
   The fault line is the stop's own San Andreas trace. The Pacific and North American plates pass each other at about
   5 cm a year, but that motion is shared between several faults; the San Andreas itself has slipped at an average of
   about 3.5 cm a year (Schulz & Wallace, "The San Andreas Fault", USGS general-interest publication, 1997; Wallace
   (ed.) 1990, USGS Professional Paper 1515). Los Angeles is carried along the fault at that pace; the time shown is
   the distance along the fault divided by 3.5 cm a year, which comes out close to the stop's "about 15 million years".
   San Diego, on the same plate, moves the same way. San Francisco, on the North American side, is held still. */
const SAF=[[-124.2,40.3],[-123.7,39],[-122.8,38],[-122.4,37.6],[-121.5,36.6],[-120.5,35.6],[-119,34.8],[-117.5,34.2],[-116.5,33.9],[-115.6,33]];
const LA=[-118.24,34.05],SF=[-122.42,37.77],SD=[-117.16,32.72],SAF_CM_YR=3.5;
let LR=null;
function laR(){if(LR)return LR;const F=route(SAF.slice().reverse(),.05);/* south-east → north-west */
 const near=ll=>{let b=0,bd=1e9;F.P.forEach((p,i)=>{const d=Math.hypot((p[0]-ll[0])*Math.cos(ll[1]*Math.PI/180),p[1]-ll[1]);if(d<bd){bd=d;b=i}});return b};
 const i0=near(LA),i1=near(SF),off=[LA[0]-F.P[i0][0],LA[1]-F.P[i0][1]];
 const C=F.P.slice(i0,i1+1).map(p=>[p[0]+off[0],p[1]+off[1]]);const R=route(C,.05);R.faultKm=F.K[i1]-F.K[i0];R.F=F;R.i0=i0;R.i1=i1;return LR=R}
const CITY='<circle r="9" fill="#c2364f" stroke="#fff" stroke-width="2.5"/><circle r="3" fill="#fff"/>';
const LAX={tour:"plates",title:"Los Angeles is coming",dur:20,
 tip:"Drag Los Angeles north-west along the fault, or press ▶. San Francisco stays put on the other plate.",
 card:L=>playerHTML("Millions of years from now","Today"),
 init(L){const R=laR();L.trail=svgEl(L.svg,"path",{class:"gfx-dash"});L.gapL=svgEl(L.svg,"path",{class:"gfx-gap"});L.sdTrail=svgEl(L.svg,"path",{class:"gfx-dash gfx-faint"});
  L.sd=svgEl(L.svg,"g",{class:"gfx-noev"},'<circle r="5.5" fill="#c2364f" stroke="#fff" stroke-width="2"/>');L.sdT=tag(L,"gfx-small");
  L.c=svgEl(L.svg,"g",{class:"gfx-grab",tabindex:"0","aria-label":"Los Angeles: drag north-west"});svgEl(L.c,"circle",{r:26,class:"gfx-hit"});svgEl(L.c,"g",{},CITY);
  L.lab=tag(L,"gfx-bub");L.gapT=tag(L,"gfx-small gfx-gapt");L.hint=tag(L,"gfx-hint");L.sfT=tag(L,"gfx-small");
  draggable(L,L.c,(x,y)=>{L.u=nearestU(L,R,x,y,L.u)},()=>stopPlay(L))},
 tick(L,dt){if(L.playing){L.u=Math.min(1,L.u+dt/this.dur);if(L.u>=1){L.playing=false;playBtn(L)}L.dirty=1}},
 draw(L){const R=laR(),s=at(R,L.u),moved=L.u*R.total,left=R.faultKm*(1-L.u),my=moved*1e5/SAF_CM_YR/1e6;
  const dlon=s.ll[0]-LA[0],dlat=s.ll[1]-LA[1],sd=[SD[0]+dlon,SD[1]+dlat];
  L.trail.setAttribute("d",pathOf(L,R.P.slice(0,s.i+1).concat([s.ll])));L.sdTrail.setAttribute("d",L.u>.002?pathOf(L,[SD,sd]):"");
  place(L.sd,proj(L,sd));putTag(L.sdT,proj(L,sd),"San Diego",12);
  const q=proj(L,s.ll),qs=proj(L,SF);place(L.c,q);
  L.gapL.setAttribute("d",q&&qs&&L.u<.995?"M"+q[0]+" "+q[1]+"L"+qs[0]+" "+qs[1]:"");
  putTag(L.gapT,q&&qs&&L.u<.97?[(q[0]+qs[0])/2,(q[1]+qs[1])/2]:null,fmt(left)+" km to go along the fault");
  putTag(L.lab,q,L.u<.003?"Los Angeles · today":"Los Angeles · in "+(my<1?(my*1000).toFixed(0)+" thousand":my.toFixed(1)+" million")+" years",-34);
  putTag(L.sfT,qs,"San Francisco stays put",14);putTag(L.hint,L.u<.003&&q?[q[0]+30,q[1]-8]:null,"⟵ Drag Los Angeles north-west");
  syncRange(L,L.u<.003?"Today":my.toFixed(1)+" million yrs");
  if(L.u<.003)say(L,"Today","Los Angeles sits on the Pacific plate, San Francisco on the North American one. The fault between them slips about 3.5 cm a year, about as fast as your fingernails grow.");
  else if(L.u<.999)say(L,"In "+my.toFixed(1)+" million years","Los Angeles has moved "+fmt(moved)+" km north-west. "+(my<1?"Even in a million years that is only 35 km: the plates are slow, but they never stop.":"Mountains rise and wear down along the way, but the fault keeps grinding."));
  else say(L,"In about "+Math.round(my)+" million years","Los Angeles has slid "+fmt(moved)+" km and now sits beside San Francisco, across the fault.")}};

/* ======================================================================== 3. The Ring of Fire, in order
   Places and dates from the Smithsonian Institution's Global Volcanism Program (volcano.si.edu). Facts: Tarawera rift
   about 17 km long and the lost Pink and White Terraces (GNS Science); Novarupta, the largest eruption of the 20th
   century (USGS Alaska Volcano Observatory; Hildreth & Fierstein 2012, USGS Professional Paper 1791); St Helens, the
   largest landslide in recorded history (USGS Cascades Volcano Observatory); El Chichón, about 2,000 deaths (GVP);
   Pinatubo, the second-largest eruption of the century, cooling the globe by about 0.5 °C (USGS Fact Sheet 113-97);
   Hunga Tonga–Hunga Haʻapai, a plume about 57 km high, the highest measured (Proud, Prata & Schmauß 2022, Science 378). */
const ROF=[
 {ll:[176.51,-38.23],n:"Tarawera, New Zealand",y:1886,p:"The Pacific plate sinks under the Australian plate.",t:"A crack about 17 km long split the mountain open overnight and buried the famous Pink and White Terraces."},
 {ll:[-155.16,58.27],n:"Novarupta, Alaska",y:1912,p:"The Pacific plate sinks under the North American plate.",t:"The biggest eruption of the 1900s. Ash fell for days across the Alaska Peninsula."},
 {ll:[-122.18,46.2],n:"Mount St Helens, USA",y:1980,p:"The small Juan de Fuca plate sinks under North America.",t:"Its whole north side slid away in the largest landslide in recorded history, then blasted sideways."},
 {ll:[-93.23,17.36],n:"El Chichón, Mexico",y:1982,p:"The Cocos plate sinks under the North American plate.",t:"A volcano few people knew was dangerous. Its eruption killed about 2,000 people."},
 {ll:[120.35,15.13],n:"Pinatubo, Philippines",y:1991,p:"The floor of the South China Sea sinks at the Manila Trench.",t:"The second-biggest eruption of the 1900s. Its haze cooled the whole planet by about 0.5 °C."},
 {ll:[-175.38,-20.54],n:"Hunga Tonga, Tonga",y:2022,p:"The Pacific plate sinks under the Tonga plate.",t:"An underwater blast whose plume rose about 57 km, the highest ever measured."}];
const VOL='<path d="M-13 9 L-3 -9 L3 -9 L13 9 Z" fill="#7a3b22" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M-3 -9 Q0 -14 3 -9" fill="#ff7a2a"/>';
const RING={tour:"volcanoes",title:"The Ring of Fire",
 tip:"Tap the six volcanoes in the order they erupted, oldest first. Turn the globe to find them all.",
 card:()=>'<div class="gfx-slots">'+ROF.map((_,i)=>'<span class="gfx-slot" data-i="'+i+'">?</span>').join("")+'</div><div class="gfx-row gfx-btns"><button type="button" class="gfx-btn gfx-hintb">Show me the next</button><button type="button" class="gfx-btn gfx-again">Start again</button></div>',
 init(L){L.k=0;L.miss=0;L.found=[];
  L.v=ROF.map((r,i)=>{const e=svgEl(L.svg,"g",{class:"gfx-grab gfx-vol",tabindex:"0",role:"button","aria-label":"A volcano: tap it"});svgEl(e,"circle",{r:20,class:"gfx-hit"});svgEl(e,"circle",{r:16,class:"gfx-ring"});svgEl(e,"g",{},VOL);
   const t=tag(L,"gfx-bub gfx-voltag");const hit=ev=>{ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();this.tap(L,i)};
   e.addEventListener("pointerdown",hit);["mousedown","touchstart","click","dblclick"].forEach(t=>e.addEventListener(t,ev=>ev.stopPropagation(),{passive:t!=="mousedown"}));
   e.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();this.tap(L,i)}});return{e,t}});
  L.fb=tag(L,"gfx-fb")},
 wire(L){const c=L.card;c.querySelector(".gfx-again").onclick=()=>{L.k=0;L.miss=0;L.found=[];L._said="";L.dirty=1;this.slots(L)};
  c.querySelector(".gfx-hintb").onclick=()=>{if(L.k<ROF.length){L.miss=2;L.dirty=1;turnTo(L,ROF[L.k].ll);say(L,"The next one is pulsing","Tap it to carry on.")}};this.slots(L)},
 slots(L){const c=L.card;if(!c)return;c.querySelectorAll(".gfx-slot").forEach((s,i)=>{const r=L.found[i]!=null?ROF[L.found[i]]:null;s.textContent=r?r.y:"?";s.classList.toggle("gfx-on",!!r);s.title=r?r.n:""})},
 tap(L,i){try{if(L.k>=ROF.length||L.found.includes(i))return;const q=proj(L,ROF[i].ll);
  if(i===L.k){L.found.push(i);L.k++;L.miss=0;const r=ROF[i];say(L,r.y+" · "+r.n,r.t+" "+r.p);
   if(L.k===ROF.length)setTimeout(()=>{if(L.card)say(L,"All six, 1886 to 2022","Every one sits on the Ring of Fire, above a plate that is sinking into the mantle. Water squeezed out of the sinking plate melts the rock above it, and the melt rises as volcanoes.")},2600);
   this.flash(L,q,"✓ "+r.y,"gfx-ok")}
  else{L.miss++;const later=ROF[i].y>ROF[L.k].y;this.flash(L,q,later?"Not yet: that one came later":"Already found",later?"gfx-no":"");
   if(later&&L.miss<2)say(L,"Not yet",ROF[i].n.split(",")[0]+" is more recent. Find an older eruption first.");
   const e=L.v[i].e;e.classList.remove("gfx-shake");void e.getBoundingClientRect();e.classList.add("gfx-shake");if(L.miss>=2){say(L,"Here’s a clue","The next one in order is pulsing.");turnTo(L,ROF[L.k].ll)}}
  this.slots(L);L.dirty=1}catch(e){console.error(e)}},
 flash(L,q,txt,cls){const f=L.fb;if(!q)return;f.className="gfx-fb "+(cls||"");f.textContent=txt;f.style.left=q[0]+"px";f.style.top=(q[1]-30)+"px";f.style.display="";clearTimeout(L._fbT);L._fbT=setTimeout(()=>{f.style.display="none"},2200)},
 draw(L){
  L.v.forEach((o,i)=>{const q=proj(L,ROF[i].ll);place(o.e,q);const got=L.found.includes(i);o.e.classList.toggle("gfx-got",got);o.e.classList.toggle("gfx-pulse",!got&&L.miss>=2&&i===L.k);
   putTag(o.t,got?q:null,ROF[i].y+" · "+esc(ROF[i].n.split(",")[0]),-24)});
  if(!L.found.length)say(L,"","Which erupted first? Each one you find shows its year and the plate that feeds it.")}};

/* ======================================================================== 4. Saharan dust to the Amazon
   The path is the stop's own arrow. Tonnages are yearly averages for 2007–2013 from the CALIPSO satellite's lidar:
   Yu, Chin, Yuan et al. 2015, "The fertilizing role of African dust in the Amazon rainforest", Geophysical Research
   Letters 42 (NASA, February 2015): about 182 million tonnes a year carried west past 15°W, about 132 million tonnes
   still in the air at 35°W, about 27.7 million tonnes falling on the Amazon basin, with about 22,000 tonnes of
   phosphorus. The cloud's size on the map is scaled between those figures. */
const DUST=[[17.5,17],[8,16.5],[-4,16],[-17,14],[-30,10.5],[-43,6],[-55,0],[-62,-3]];
const DGATE=[{lon:-15,mt:182,n:"182 million tonnes a year leave Africa"},{lon:-35,mt:132,n:"132 million tonnes still in the air"}];
let DR=null;const dustR=()=>DR||(DR=route(DUST,.25));
/* the share of the dust still in the air (1 at the coast), by longitude */
const dustLeft=lon=>lon>-15?1:lon>-35?1-(1-132/182)*(-15-lon)/20:lon>-55?132/182-(132/182-.16)*(-35-lon)/20:.16;
const CLOUD='<g class="gfx-cloud">'+[[-14,2,12],[-4,-6,14],[9,-2,13],[3,7,11],[-9,8,9],[16,6,9]].map(c=>'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'"/>').join("")+"</g>";
const DUSTX={tour:"weather",title:"The Sahara feeds the Amazon",dur:22,follow:1,
 tip:"Drag the dust cloud from Chad across the Atlantic, or press ▶. Watch how much of it makes it.",
 card:()=>playerHTML("How far the dust has blown","Chad"),
 init(L){const R=dustR();L.trail=svgEl(L.svg,"path",{class:"gfx-dusttrail"});L.gates=DGATE.map(gt=>({gt,p:svgEl(L.svg,"path",{class:"gfx-gate"}),t:tag(L,"gfx-small gfx-gatet")}));
  L.fall=svgEl(L.svg,"g",{class:"gfx-noev"});L.c=svgEl(L.svg,"g",{class:"gfx-grab",tabindex:"0","aria-label":"Dust cloud: drag it west"});svgEl(L.c,"circle",{r:34,class:"gfx-hit"});L.cI=svgEl(L.c,"g",{},CLOUD);
  L.bub=tag(L,"gfx-bub");L.hint=tag(L,"gfx-hint");L.amz=tag(L,"gfx-bub gfx-amz");L.t=0;
  draggable(L,L.c,(x,y)=>{L.u=nearestU(L,R,x,y,L.u)},()=>stopPlay(L))},
 tick(L,dt){L.t+=dt;if(L.playing){L.u=Math.min(1,L.u+dt/this.dur);if(L.u>=1){L.playing=false;playBtn(L)}L.dirty=1}this.specks(L)},
 specks(L){const q=L.q,sc=L.sc||1,left=L.left||1;let h="";if(q&&L.u>.02){const n=Math.round(3+left*6);for(let k=0;k<n;k++){const ph=(L.t*.9+k/n)%1,x=q[0]+(k-n/2)*7*sc+Math.sin(k*7.3)*4,y=q[1]+10*sc+ph*34;h+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="1.8" opacity="'+(1-ph).toFixed(2)+'"/>'}}if(L.fall)L.fall.innerHTML=h},
 draw(L){const R=dustR(),s=at(R,L.u),lon=s.ll[0],left=dustLeft(lon);L.fll=s.ll;
  L.trail.setAttribute("d",pathOf(L,R.P.slice(0,s.i+1).concat([s.ll])));
  L.gates.forEach(o=>{const a=[o.gt.lon,4],b=[o.gt.lon,22],on=lon<=o.gt.lon;o.p.setAttribute("d",pathOf(L,d3.range(0,11).map(k=>[o.gt.lon,a[1]+(b[1]-a[1])*k/10])));o.p.classList.toggle("gfx-on",on);
   putTag(o.t,proj(L,[o.gt.lon,22.5]),"<b>"+o.gt.lon*-1+"°W</b>"+(on?" · "+o.gt.mt+" million t":""),-10)});
  const q=proj(L,s.ll);place(L.c,q);const sc=.8+left*.55;L.cI.setAttribute("transform","scale("+sc.toFixed(2)+")");L.cI.style.opacity=(.62+left*.38).toFixed(2);
  /* specks falling out of the cloud into the sea, more near Africa (moved every frame by specks) */
  L.q=q;L.sc=sc;L.left=left;
  const reached=lon<=-55;putTag(L.amz,reached?proj(L,[-52,-9]):null,"27.7 million tonnes a year fall on the Amazon",14);
  putTag(L.bub,q&&!reached?q:null,lon>-15?"Over the Sahara":lon>-35?"Over the Atlantic":"Nearly there",-40);putTag(L.hint,L.u<.003&&q?[q[0]-150,q[1]-8]:null,"⟵ Drag the dust west");
  syncRange(L,lon>-15?"Africa":lon>-55?"Atlantic":"Amazon");
  if(L.u<.003)say(L,"The Bodélé Depression, Chad","Winds funnelled between two mountain ranges lift fine, dried-out lake mud high into the air. The trade winds carry it west.");
  else if(lon>-15)say(L,"Crossing the Sahara","The dust rises up to several kilometres and heads for the Atlantic.");
  else if(lon>-35)say(L,"Leaving Africa: 182 million tonnes a year","That is the yearly average blown out past 15°W, measured from space by the CALIPSO satellite. Some falls into the ocean all the way across, feeding plankton.");
  else if(lon>-55)say(L,"Mid-Atlantic: 132 million tonnes still in the air","About a quarter has already fallen into the sea.");
  else say(L,"The Amazon: about 28 million tonnes a year","Only about 15% of the dust that left Africa lands on the rainforest, but it brings about 22,000 tonnes of phosphorus, roughly what rain washes out of the forest’s poor soils each year.")}};

/* ======================================================================== 5. Krakatoa's bang spreads
   The bang moves at the speed of sound near the ground, about 343 m/s (1,235 km/h) at 20 °C; real air is colder higher
   up, so the arrival times shown are approximate ("about"). Places it was heard: Rodrigues, about 4,800 km away, and
   Perth (both from the Royal Society's Krakatoa Committee report: Symons (ed.) 1888, "The Eruption of Krakatoa and
   Subsequent Phenomena"). The ring meets itself on the far side of the Earth, at the point opposite Krakatoa
   (6.1°N 74.6°W, in Colombia), after about 16 hours; barometers recorded the wave passing again and again. */
const KRK=[105.42,-6.1],SND_KMH=1235,HEARD_KM=4800,KRK_H=36;
const HEARD=[{ll:[63.4,-19.7],n:"Rodrigues"},{ll:[115.86,-31.95],n:"Perth"}];
const hm=h=>{const H=Math.floor(h),M=Math.round((h-H)*60);return M===60?(H+1)+" h":(H?H+" h ":"")+(M?M+" min":(H?"":"0 min"))};
const EAR='<circle r="13" fill="#13294b" stroke="#fff" stroke-width="2.5"/><path d="M-3 -6 a6 6 0 1 1 7 7 q-3 2 -3 5 a3 3 0 0 1 -5 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
const BANG={tour:"hazards",title:"The loudest sound",dur:24,
 tip:"Press ▶ or drag the clock to send the bang across the Earth. Drag the ear anywhere to time it.",
 card:()=>playerHTML("Hours after the explosion","0 h"),
 init(L){L.zone=svgEl(L.svg,"path",{class:"gfx-zone"});L.ring=svgEl(L.svg,"path",{class:"gfx-wave"});L.ring2=svgEl(L.svg,"path",{class:"gfx-wave gfx-wave2"});
  L.hp=HEARD.map(h=>({h,e:svgEl(L.svg,"circle",{r:9,class:"gfx-heard"}),t:tag(L,"gfx-small")}));
  L.ear=svgEl(L.svg,"g",{class:"gfx-grab",tabindex:"0","aria-label":"A listener: drag it anywhere"});svgEl(L.ear,"circle",{r:24,class:"gfx-hit"});svgEl(L.ear,"g",{},EAR);L.earT=tag(L,"gfx-bub gfx-eart");
  L.earLL=[79.86,6.93];/* Colombo, Sri Lanka, to start */L.hint=tag(L,"gfx-hint");L.anti=tag(L,"gfx-small");
  draggable(L,L.ear,(x,y)=>{const ll=unproj(L,x,y);if(ll){L.earLL=ll;L.moved=1}})},
 tick(L,dt){if(L.playing){L.u=Math.min(1,L.u+dt/this.dur);if(L.u>=1){L.playing=false;playBtn(L)}L.dirty=1}},
 draw(L){const hrs=L.u*KRK_H,r=hrs*SND_KMH,deg=r/111.195;
  const circ=a=>{if(a<=.05||a>=179.95)return"";try{const c=d3.geoCircle().center(KRK).radius(a).precision(2)();return pathOf(L,c.coordinates[0])}catch(e){return""}};
  L.zone.setAttribute("d",circ(HEARD_KM/111.195));
  const a=deg%360,a1=a<=180?a:360-a;L.ring.setAttribute("d",circ(a1));L.ring2.setAttribute("d","");
  L.hp.forEach(o=>{const d=km(KRK,o.h.ll),t=d/SND_KMH,q=proj(L,o.h.ll),on=hrs>=t;place(o.e,q);o.e.classList.toggle("gfx-on",on);putTag(o.t,on?q:null,"Heard after about "+hm(t),-40)});
  const ed=km(KRK,L.earLL),et=ed/SND_KMH,qe=proj(L,L.earLL),eon=hrs>=et;place(L.ear,qe);L.ear.classList.toggle("gfx-lit",eon);
  putTag(L.earT,qe,fmt(ed)+" km away: the bang takes about "+hm(et)+"<small>"+(ed<=HEARD_KM?"close enough to be heard":"too far to hear, but barometers felt it")+"</small>",-22);
  putTag(L.hint,!L.moved&&qe?[qe[0]+26,qe[1]+12]:null,"Drag the ear anywhere");
  putTag(L.anti,hrs>=16.2?proj(L,[-74.58,6.1]):null,"The wave meets itself here",14);
  syncRange(L,hm(hrs));
  if(hrs<.01)say(L,"10:02 am, 27 August 1883","Krakatoa blows itself apart. The pressure wave leaves at about the speed of sound, around 1,200 km an hour.");
  else if(hrs<4)say(L,"After "+hm(hrs),"The bang is "+fmt(r)+" km out. Inside the yellow dashed circle (4,800 km), people heard it as distant gunfire.");
  else if(hrs<16.2)say(L,"After "+hm(hrs),"Too faint to hear now, but the wave goes on, round the curve of the Earth.");
  else say(L,"After "+hm(hrs),"On the far side of the Earth the wave meets itself and heads back. Barometers around the world recorded it passing again and again for days.")}};

/* ======================================================================== 6. An iceberg's journey
   The path is the stop's own Labrador Current line, from Ilulissat Icefjord to the Titanic's wreck. Facts: about nine
   tenths of an iceberg lies under water, because glacier ice (about 917 kg/m³) is about 0.89 times as dense as sea
   water (about 1,025 kg/m³): 917 / 1025 = 0.895. Titanic struck the iceberg at 11:40 pm on 14 April 1912 and sank at
   2:20 am on 15 April; more than 1,500 people died (British Wreck Commissioner's Inquiry, 1912). The International Ice
   Patrol (US Coast Guard) was set up in 1914. The iceberg shrinking on the map shows that it melts; its size is not
   a measurement. */
const ICE=[[-51,69.2],[-58,72.5],[-66,70.5],[-63,64],[-58,57],[-53,51],[-50.5,46.5],[-49.95,41.73]];
const ISTOP=[{k:0,b:"Calved at Ilulissat",h:"Ilulissat Icefjord, Greenland",t:"A glacier pushes ice into the sea and it breaks off, or calves, as icebergs, some as tall as a tower block."},
 {k:1,b:"Drifting north",h:"North along Greenland’s coast",t:"The iceberg first drifts north, up the west coast of Greenland, with the current."},
 {k:2,b:"Round Baffin Bay",h:"Round Baffin Bay",t:"Then it turns west and south, round the top of Baffin Bay. Many icebergs run aground or melt on the way."},
 {k:4,b:"Labrador Current",h:"The Labrador Current",t:"A cold current carries it south down the coast of Labrador. Cold water melts it only slowly."},
 {k:6,b:"Iceberg Alley",h:"Iceberg Alley, Newfoundland",t:"In spring, icebergs pass close to the shore here. People come to watch them."},
 {k:7,b:"The Titanic sinks here",h:"11:40 pm, 14 April 1912",t:"In the shipping lanes, the Titanic hits an iceberg about here. It sinks 2 hours 40 minutes later, and more than 1,500 people die. Since 1914 the International Ice Patrol has tracked icebergs here every spring."}];
let IR=null;const iceR=()=>{if(IR)return IR;const R=route(ICE,.2);R.uk=ICE.map(p=>uOf(R,p));return IR=R};
const BERG='<path d="M-16 6 L-11 -5 L-5 -3 L-1 -15 L6 -6 L11 -8 L17 6 Z" fill="#f4fbff" stroke="#2a6fa8" stroke-width="1.6" stroke-linejoin="round"/><path d="M-1 -15 L2 -2 L6 -6" fill="none" stroke="#b9dcf2" stroke-width="1.4"/><path d="M-20 6 H21" stroke="#2a6fa8" stroke-width="1.6" stroke-dasharray="3 2"/>';
const SHIPI='<path d="M-14 0 L14 0 L10 6 L-11 6 Z" fill="#20262e"/><rect x="-8" y="-5" width="15" height="5" fill="#f2f2f2"/><rect x="-6" y="-11" width="3" height="6" fill="#e8a33a"/><rect x="0" y="-11" width="3" height="6" fill="#e8a33a"/>';
/* the card's side view: the part above water, and the nine tenths below */
function bergSide(sc){const w=180,h=130,wl=40,k=Math.max(.35,sc),cx=w/2,P=(pts)=>"M"+pts.map(p=>(cx+p[0]*k).toFixed(1)+" "+(wl+p[1]*k).toFixed(1)).join(" L")+" Z";
 /* drawn so the part above the water line is about a tenth of the whole area */
 const above=P([[-26,0],[-14,-17],[-5,-13],[0,-35],[10,-19],[26,0]]),below=P([[-26,0],[-62,30],[-50,60],[-14,78],[30,70],[64,36],[26,0]]);
 return'<svg viewBox="0 0 '+w+' '+h+'" class="gfx-side" aria-hidden="true"><rect x="0" y="'+wl+'" width="'+w+'" height="'+(h-wl)+'" fill="#2f6fae"/><path d="'+below+'" fill="#bfe1f5" opacity=".9"/><path d="'+above+'" fill="#f7fcff" stroke="#2a6fa8" stroke-width="1.2"/>'+
  '<line x1="0" y1="'+wl+'" x2="'+w+'" y2="'+wl+'" stroke="#fff" stroke-width="1.5"/><text x="6" y="'+(wl-6)+'" class="gfx-svt">1/10 above</text><text x="6" y="'+(h-8)+'" class="gfx-svt gfx-svw">9/10 hidden below</text></svg>'}
const BERGX={tour:"ice",title:"Icebergs and the Titanic",dur:24,follow:1,
 tip:"Drag the iceberg from Greenland down Iceberg Alley, or press ▶. It melts as it goes.",
 card:()=>playerHTML("How far the iceberg has drifted","Greenland")+'<div class="gfx-sidebox"></div>',
 init(L){const R=iceR();L.trailH=svgEl(L.svg,"path",{class:"gfx-icehalo"});L.trail=svgEl(L.svg,"path",{class:"gfx-icetrail"});L.ship=svgEl(L.svg,"g",{class:"gfx-noev"},SHIPI);L.shipT=tag(L,"gfx-small");
  L.b=svgEl(L.svg,"g",{class:"gfx-grab",tabindex:"0","aria-label":"Iceberg: drag it along the current"});svgEl(L.b,"circle",{r:28,class:"gfx-hit"});L.bI=svgEl(L.b,"g",{},BERG);
  L.bub=tag(L,"gfx-bub");L.hint=tag(L,"gfx-hint");L._sc=-1;
  draggable(L,L.b,(x,y)=>{L.u=nearestU(L,R,x,y,L.u)},()=>stopPlay(L))},
 tick(L,dt){if(L.playing){L.u=Math.min(1,L.u+dt/this.dur);if(L.u>=1){L.playing=false;playBtn(L)}L.dirty=1}},
 draw(L){const R=iceR(),s=at(R,L.u);L.fll=s.ll;let st=ISTOP[0];ISTOP.forEach(x=>{if(L.u>=R.uk[x.k]-.004)st=x});
  {const d=pathOf(L,R.P.slice(0,s.i+1).concat([s.ll]));L.trail.setAttribute("d",d);L.trailH.setAttribute("d",d)}
  const sc=1.35-.6*Math.pow(L.u,1.6),q=proj(L,s.ll);place(L.b,q);L.bI.setAttribute("transform","scale("+sc.toFixed(2)+")");
  const end=L.u>=R.uk[7]-.004,qs=proj(L,[-48.3,41.9]);place(L.ship,end?qs:null);putTag(L.shipT,end?qs:null,"Titanic",14);
  putTag(L.bub,q,esc(st.b),-30*sc-14);putTag(L.hint,L.u<.003&&q?[q[0]+28,q[1]-8]:null,"Drag the iceberg ⟶");
  const box=L.card&&L.card.querySelector(".gfx-sidebox"),r=Math.round(sc*20)/20;if(box&&r!==L._sc){L._sc=r;box.innerHTML=bergSide(r/1.35)}
  syncRange(L,L.u<.3?"Greenland":L.u<.6?"Baffin Bay":L.u<.88?"Labrador":"Newfoundland");say(L,st.h,st.t)}};

/* ---------------- the engine: one stop at a time ---------------- */
const DEFS=[HURR,LAX,RING,DUSTX,BANG,BERGX];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;return DEFS.find(d=>d.tour===ps.tour&&d.title===S.title)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="gfx-layer";el.innerHTML='<svg class="gfx-svg"></svg>';G.host.appendChild(el);
 L={D,host:G.host,el,svg:el.querySelector("svg"),u:0,playing:false,dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}document.body.classList.add("gfx-on");lastT=0;loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}clearTimeout(L._fbT);L=null}
 document.querySelectorAll(".gfx-ctl").forEach(c=>c.remove());document.body.classList.remove("gfx-on")}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".gfx-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at=ps.card.querySelector(".ps-stat");if(!at)return;const D=L.D,c=document.createElement("div");c.className="gfx-ctl";
 c.innerHTML='<div class="gfx-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="gfx-ep"></div>';at.after(c);L.card=c;L._said="";
 try{if(c.querySelector(".gfx-play"))wirePlayer(L);if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}playBtn(L);L.dirty=1}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);L.D.draw.call(L.D,L);follow(L)}}catch(e){console.error(e)}loop()})}
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 glide(L,[ll[0]+side*28,ll[1]*.7],zoom||G.zoom)}
function glide(L,t,z1){const G=g();const r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,[t[0],t[1]]),D=L.D;L.gliding=T0;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z1-z0)*e)}catch(err){L.gliding=0;return}L.dirty=1;if(f<1)requestAnimationFrame(step);else L.gliding=0};step()}
/* a marker that travels under the card (or round the back of the globe) brings the globe round with it */
function follow(L){if(!L.D.follow||!L.fll||L.gliding||!L.looked&&L.D.look)return;if(performance.now()-(L.lastFollow||0)<1500)return;if(proj(L,L.fll))return;
 L.lastFollow=performance.now();turnTo(L,L.fll)}
/* a stop whose action happens off to one side (under the card) turns the globe there once, after the tour's own move has
   settled; if the reader has already turned the globe themselves, it is left alone */
function look(){if(!L||!L.D.look||L.looked)return;const G=g();if(!G||!G.lookAt)return;const k=(G.rot||[]).map(v=>v.toFixed(2)).join(",")+"|"+(+G.zoom).toFixed(2);
 if(k!==L.lastRot){L.lastRot=k;L.still=0;return}if(++L.still<3)return;L.looked=1;glide(L,L.D.look,L.D.look[2])}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard();look()}else if(L||document.querySelector(".gfx-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.gfx-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.gfx-svg{position:absolute;left:0;top:0;overflow:visible}
.gfx-grab{pointer-events:all;cursor:grab;touch-action:none;outline:none}.gfx-grab.gfx-dragging{cursor:grabbing}
.gfx-noev{pointer-events:none}
.gfx-hit{fill:rgba(255,255,255,.001);stroke:none}
.gfx-grab>g{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gfx-grab:hover>g,.gfx-grab:focus-visible>g{filter:drop-shadow(0 0 5px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gfx-dash{fill:none;stroke:rgba(255,255,255,.75);stroke-width:1.8;stroke-dasharray:4 5}.gfx-faint{stroke:rgba(255,255,255,.5)}
.gfx-wake-halo{fill:none;stroke:rgba(255,255,255,.85);stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.gfx-wake{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.gfx-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.gfx-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.gfx-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.gfx-hint{transform:none;background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:gfxNudge 1.4s ease-in-out infinite}
@keyframes gfxNudge{50%{transform:translateX(6px)}}
.gfx-gap{fill:none;stroke:#ffd166;stroke-width:2.2;stroke-dasharray:2 5;stroke-linecap:round}
.gfx-gapt{transform:translate(-50%,-50%);color:#7a4b00}
.gfx-vol .gfx-ring{fill:rgba(255,255,255,.18);stroke:#fff;stroke-width:2}
.gfx-vol.gfx-got .gfx-ring{fill:rgba(255,140,40,.55);stroke:#ffd166}
.gfx-vol.gfx-pulse .gfx-ring{animation:gfxPulse 1s ease-in-out infinite}
@keyframes gfxPulse{50%{stroke-width:7;stroke:#ffd166}}
.gfx-vol.gfx-shake>g{animation:gfxShake .45s}
@keyframes gfxShake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.gfx-voltag{font-size:13px;background:#7a3b22}
.gfx-fb{position:absolute;transform:translate(-50%,-100%);background:#fff;color:#13294b;font-weight:900;font-size:15px;padding:6px 12px;border-radius:10px;box-shadow:0 3px 12px rgba(0,0,0,.35);pointer-events:none;white-space:nowrap}
.gfx-fb.gfx-ok{background:#1f8a4c;color:#fff}.gfx-fb.gfx-no{background:#c2364f;color:#fff}
.gfx-dusttrail{fill:none;stroke:rgba(214,150,70,.75);stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.gfx-cloud circle{fill:#d9a25e;stroke:rgba(120,70,20,.45);stroke-width:1}
.gfx-layer .gfx-noev circle{fill:#c98a3e}
.gfx-gate{fill:none;stroke:rgba(255,255,255,.55);stroke-width:2;stroke-dasharray:3 4}.gfx-gate.gfx-on{stroke:#ffd166;stroke-width:3;stroke-dasharray:none}
.gfx-gatet{transform:translate(-50%,-100%)}
.gfx-amz{background:#1f7a3c}
.gfx-zone{fill:none;stroke:#ffd166;stroke-width:2.5;stroke-dasharray:6 5}
.gfx-wave{fill:none;stroke:#ff5a36;stroke-width:4;stroke-linejoin:round;filter:drop-shadow(0 0 4px rgba(255,90,54,.8))}
.gfx-heard{fill:rgba(255,255,255,.4);stroke:#fff;stroke-width:2}.gfx-heard.gfx-on{fill:#ff5a36;stroke:#ffd166;stroke-width:3}
.gfx-ear.gfx-lit circle:first-child,.gfx-grab.gfx-lit>g>circle{fill:#ff5a36}
.gfx-eart{font-size:13px;text-align:center}.gfx-eart small{display:block;font-weight:700;font-size:11.5px;color:#ffd166}
.gfx-icehalo{fill:none;stroke:#174d80;stroke-width:8;stroke-linecap:round;stroke-linejoin:round;opacity:.8}.gfx-icetrail{fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.gfx-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.gfx-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.gfx-row{display:flex;align-items:center;gap:10px}
.gfx-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gfx-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.gfx-read{flex:0 0 auto;font-weight:800;font-size:12.5px;color:#9a4a16;white-space:nowrap;min-width:64px;text-align:right}
.gfx-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.gfx-ep b{display:block;font-size:15px}
.gfx-ep.gfx-new{animation:gfxIn .45s ease}@keyframes gfxIn{from{opacity:.2;transform:translateY(4px)}}
.gfx-slots{display:flex;gap:6px;flex-wrap:wrap}
.gfx-slot{flex:1 1 0;min-width:0;text-align:center;font-weight:900;font-size:15px;padding:6px 0;border-radius:8px;background:rgba(19,41,75,.08);color:rgba(19,41,75,.45)}
.gfx-slot.gfx-on{background:#d9682b;color:#fff}
.gfx-btns{margin-top:8px;gap:8px}
.gfx-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:13px;padding:6px 10px;border-radius:999px;cursor:pointer}
.gfx-sidebox{margin-top:8px}.gfx-side{display:block;width:100%;max-width:240px;height:auto;margin:0 auto;border-radius:8px;background:#cfe6f7}
.gfx-svt{font:800 11px system-ui,sans-serif;fill:#13294b}.gfx-svw{fill:#fff}
body.gfx-on .ps-leaders{opacity:.5}
body.dark-theme .gfx-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark-theme .gfx-do,body.dark-theme .gfx-read{color:#ffb27a}
body.dark-theme .gfx-slot{background:rgba(255,255,255,.1);color:rgba(255,255,255,.5)}
body.dark-theme .gfx-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}`;document.head.appendChild(s)}
window.gfInteractPhys={v:4,set:u=>{if(L){L.u=Math.max(0,Math.min(1,u));L.dirty=1}},get:()=>L?{title:L.D.title,u:L.u}:null,tap:i=>{if(L&&L.D.tap)L.D.tap(L,i)}};
})();
