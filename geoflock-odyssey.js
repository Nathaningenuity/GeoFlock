/* GeoFlock: "Homer's Troy and Ithaca" (Literature tour) becomes a voyage you sail yourself.
   - the route is drawn faint; Odysseus's ship sits at Troy, and dragging it (or the slider on the card, or Play) sails it along
     the voyage readers have mapped, leaving a bright wake behind
   - the fleet shrinks as the story goes: twelve ships, one after the giants, a raft after the wreck, then the Phaeacians' ship
   - Aeolus's bag of winds: the ship sails within sight of Ithaca and is blown all the way back
   - the years pass with it: about two years at sea in all, a year with Circe, seven with Calypso; home in year ten
   - each episode is named beside the ship and told on the card as it is reached
   The route is the one in geoflock-polish-l.js (the places ancient and modern readers have matched to Homer's episodes). */
(function(){
"use strict";
const TOUR="literature",TITLE="Homer’s Troy and Ithaca";
const ROUTE=[[26.24,39.96],[26.05,39.95],[25.6,40.1],[25.3,40.55],[25.52,40.88],
 [25.3,40.5],[24.75,39.3],[24.45,38.1],[23.6,36.9],[23.25,36.3],[23.05,36.05],
 [11.4,33.85],[10.95,33.82],
 [12.2,35.2],[14.6,36.45],[15.25,36.75],[15.2,37.5],
 [15.4,37.9],[15.62,38.2],[15.4,38.45],[14.95,38.5],
 [13.5,39.5],[10.2,40.9],[9.4,41.35],[9.16,41.39],
 [9.4,41.35],[10.5,41.2],[13.05,41.2],
 [13.6,40.95],[14.0,40.8],[14.2,40.6],[14.43,40.56],
 [15.0,39.8],[15.6,38.4],[15.63,38.25],[15.4,37.6],[15.2,37.0],
 [15.1,36.6],[14.6,36.2],[14.26,36.08],
 [15.5,36.4],[18,37.8],[19.5,39.2],[19.92,39.62],
 [20.2,39.3],[20.55,38.65],[20.68,38.4]];
const BLOWN=[[14.95,38.5],[15.4,38.42],[15.62,38.22],[16.6,38.0],[18.4,38.2],[20.3,38.3]];
/* the whole voyage: out to Aeolus, almost home, blown back, then on */
const AE=20;const VOY=ROUTE.slice(0,AE+1).concat(BLOWN.slice(1),BLOWN.slice(0,-1).reverse(),ROUTE.slice(AE+1));
/* the episodes, in order: where, short name, what happens, a stay (in years) and what he sails in afterwards */
const EP=[
 {ll:[26.24,39.96],n:"Troy",t:"Troy has fallen. Odysseus sets sail for home with twelve ships.",fleet:12},
 {ll:[25.52,40.88],n:"The Cicones",t:"He raids the Cicones’ town, but their counter-attack kills six men from every ship."},
 {ll:[23.05,36.05],n:"Cape Malea",t:"Rounding Cape Malea, a storm drives the fleet off course for nine days."},
 {ll:[10.95,33.82],n:"The Lotus-eaters",t:"Men who taste the lotus forget all wish to go home; he drags them back to the ships."},
 {ll:[15.2,37.5],n:"The Cyclops",t:"The one-eyed giant Polyphemus eats six men. Odysseus blinds him and escapes, and Poseidon, the Cyclops’ father, swears revenge."},
 {ll:[14.95,38.5],n:"Aeolus’s winds",t:"Aeolus, keeper of the winds, gives him every storm wind tied up in a leather bag."},
 {ll:[20.3,38.3],n:"Ithaca in sight!",t:"Ten days on, Ithaca is in sight. While he sleeps the crew open the bag, thinking it holds gold, and the winds blow them all the way back."},
 {ll:[9.16,41.39],n:"The giants",t:"In a closed harbour the giant Laestrygonians smash eleven ships with rocks. Only Odysseus’s own ship escapes.",fleet:1},
 {ll:[13.05,41.2],n:"Circe",t:"The witch Circe turns his men into pigs. He makes her turn them back, and they stay a whole year.",stay:1},
 {ll:[14.0,40.8],n:"The Underworld",t:"At the edge of the world of the dead, the prophet Tiresias tells him how to get home."},
 {ll:[14.43,40.56],n:"The Sirens",t:"His crew plug their ears with wax; he has himself tied to the mast to hear the Sirens’ song and live."},
 {ll:[15.63,38.25],n:"Scylla and Charybdis",t:"Between the whirlpool Charybdis and the monster Scylla, he loses six men to save the ship."},
 {ll:[15.2,37.0],n:"The Sun’s cattle",t:"Stranded by winds, the starving crew kill the Sun god’s cattle. Zeus wrecks the ship; everyone but Odysseus drowns.",fleet:0},
 {ll:[14.26,36.08],n:"Calypso",t:"Clinging to wreckage, he washes up on Calypso’s island. She keeps him for seven years.",stay:7},
 {ll:[19.92,39.62],n:"The Phaeacians",t:"On a raft he reaches the Phaeacians, who hear his story and sail him home in one of their magic ships.",fleet:-1},
 {ll:[20.68,38.4],n:"Ithaca: home",t:"Home after ten years at war and ten at sea, the only one of his men to return."}];
const SAIL_YEARS=2,DW_PER_YEAR=.025;/* slider length given to each year of a stay, as a share of the whole voyage */

/* ---- the voyage as points along the way, each with its slider position and year ---- */
let V=null;
function build(){if(V)return V;const P=[];const step=.12;
 for(let i=0;i<VOY.length-1;i++){const a=VOY[i],b=VOY[i+1],d=Math.hypot((b[0]-a[0])*Math.cos((a[1]+b[1])/2*Math.PI/180),b[1]-a[1]),n=Math.max(1,Math.ceil(d/step));
  for(let k=0;k<n;k++)P.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}
 P.push(VOY[VOY.length-1]);
 /* where each episode falls (in order along the way) */
 let from=0;const at=EP.map(e=>{let best=from,bd=1e9;for(let i=from;i<P.length;i++){const d=Math.hypot(P[i][0]-e.ll[0],P[i][1]-e.ll[1]);if(d<bd){bd=d;best=i}if(bd<.05&&d>1)break}from=best;return best});
 let D=0;for(let i=1;i<P.length;i++)D+=Math.hypot((P[i][0]-P[i-1][0])*Math.cos(P[i][1]*Math.PI/180),P[i][1]-P[i-1][1]);
 /* stays become a stretch of slider where the ship waits and the years go by */
 const S=[];let u=0,yr=0;const stayAt=new Map();EP.forEach((e,k)=>{if(e.stay)stayAt.set(at[k],e.stay)});
 const totalStay=EP.reduce((s,e)=>s+(e.stay||0),0),L=D*(1+totalStay*DW_PER_YEAR);
 for(let i=0;i<P.length;i++){if(i){const d=Math.hypot((P[i][0]-P[i-1][0])*Math.cos(P[i][1]*Math.PI/180),P[i][1]-P[i-1][1]);u+=d/L;yr+=d/D*SAIL_YEARS}
  S.push({ll:P[i],u,yr,i});if(stayAt.has(i)){const y=stayAt.get(i);u+=y*D*DW_PER_YEAR/L;yr+=y;S.push({ll:P[i],u,yr,i,stay:1})}}
 S[S.length-1].u=1;
 const EU=EP.map((e,k)=>{const s=S.find(x=>x.i===at[k]);return s?s.u:0});
 return V={S,EU,at}}
/* slider position → place, year, sample */
function stateAt(u){const{S}=build();u=Math.max(0,Math.min(1,u));let lo=0,hi=S.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(S[m].u<=u)lo=m;else hi=m}
 const a=S[lo],b=S[hi],f=b.u>a.u?(u-a.u)/(b.u-a.u):0;return{ll:[a.ll[0]+(b.ll[0]-a.ll[0])*f,a.ll[1]+(b.ll[1]-a.ll[1])*f],yr:a.yr+(b.yr-a.yr)*f,k:lo,f}}
function episodeAt(u){const{EU}=build();let k=0;for(let i=0;i<EU.length;i++)if(EU[i]<=u+1e-4)k=i;return k}
function fleetAt(k){let f=12;for(let i=0;i<=k;i++)if(EP[i].fleet!=null)f=EP[i].fleet;return f}

/* ---- drawing on the map ---- */
let O=null,U=0,playing=false,lastT=0,raf=0;
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function active(){try{if(typeof ps==="undefined"||!ps||ps.tour!==TOUR||ps.mode!=="globe")return false;const S=psSteps()[ps.i];return!!S&&S.title===TITLE}catch(e){return false}}
function proj(ll){const G=g();if(!G)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.05)return null}const s=G.projection()(ll);return s&&isFinite(s[0])?s:null}catch(e){return null}}
const SHIP='<g class="gfo-hull"><path d="M-17 2 Q-14 9 -6 10 L12 10 Q18 8 21 1 L17 1 Q15 5 10 6 L-8 6 Q-13 5 -14 2 Z" fill="#6b3d1e" stroke="#2c1708" stroke-width="1"/>'+
 '<path d="M-14 2 L19 1" stroke="#2c1708" stroke-width="1"/><path d="M-10 10 l-3 6 M-5 10 l-3 6 M0 10 l-3 6 M5 10 l-3 6 M10 10 l-3 6" stroke="#2c1708" stroke-width="1.1" stroke-linecap="round"/>'+
 '<path d="M2 1 V-21" stroke="#2c1708" stroke-width="1.6"/><path d="M-9 -19 Q2 -23 13 -19 L12 -3 Q2 -6 -8 -3 Z" fill="#f4ead3" stroke="#2c1708" stroke-width="1"/>'+
 '<path d="M-8.6 -14 Q2 -17 12.6 -14 M-8.3 -8.5 Q2 -11.5 12.3 -8.5" stroke="#c0392b" stroke-width="2.2" fill="none"/><path d="M19 1 Q24 -4 22 -8" stroke="#6b3d1e" stroke-width="2" fill="none"/></g>';
const RAFT='<g class="gfo-hull"><path d="M-14 4 L14 4 L12 10 L-12 10 Z" fill="#8a5a2b" stroke="#2c1708" stroke-width="1"/><path d="M-9 4 V10 M-3 4 V10 M3 4 V10 M9 4 V10" stroke="#2c1708" stroke-width=".9"/>'+
 '<path d="M0 4 V-14" stroke="#2c1708" stroke-width="1.4"/><path d="M0 -13 L10 -6 L0 -2 Z" fill="#e9dcc0" stroke="#2c1708" stroke-width=".9"/></g>';
function mount(){const G=g();if(!G||!G.host)return;if(O&&O.host===G.host&&O.el.isConnected)return;unmount(true);
 const el=document.createElement("div");el.className="gfo-layer";
 el.innerHTML='<svg class="gfo-svg"><path class="gfo-route"/><path class="gfo-wake-halo"/><path class="gfo-wake"/><g class="gfo-ship" tabindex="0" role="slider" aria-label="Odysseus’s ship: drag to sail"><circle class="gfo-hit" r="26"/><g class="gfo-flip"></g><g class="gfo-badge"><rect x="10" y="-30" width="28" height="16" rx="8"/><text x="24" y="-18.5" text-anchor="middle"></text></g></g></svg><div class="gfo-bub"></div><div class="gfo-hint">Drag the ship ⟶</div>';
 G.host.appendChild(el);O={host:G.host,el,svg:el.querySelector("svg"),ship:el.querySelector(".gfo-ship"),flip:el.querySelector(".gfo-flip"),badge:el.querySelector(".gfo-badge"),bub:el.querySelector(".gfo-bub"),hint:el.querySelector(".gfo-hint"),kind:"",hd:1};
 wireDrag();document.body.classList.add("gfo-on");loop()}
function unmount(keep){if(O){O.el.remove();O=null}cancelAnimationFrame(raf);raf=0;playing=false;document.body.classList.remove("gfo-on");if(!keep){const c=document.querySelector(".gfo-ctl");if(c)c.remove()}}
function pathOf(pts){let d="",pen=false,px=0,py=0;const G=g(),J=G?G.size().w*.3:1e9;for(const ll of pts){const q=proj(ll);if(!q){pen=false;continue}const x=q[0]+O.ox,y=q[1]+O.oy;
  if(!pen||Math.abs(x-px)+Math.abs(y-py)>J){d+="M"+x.toFixed(1)+" "+y.toFixed(1);pen=true}else d+="L"+x.toFixed(1)+" "+y.toFixed(1);px=x;py=y}return d}
let lastKey="";
function draw(){if(!O)return;const G=g();const hr=O.host.getBoundingClientRect(),cr=G.canvas.getBoundingClientRect();O.ox=cr.left-hr.left;O.oy=cr.top-hr.top;
 O.svg.setAttribute("width",hr.width);O.svg.setAttribute("height",hr.height);
 const key=(G.key?G.key():G.rot.join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+U.toFixed(5);if(key===lastKey)return;lastKey=key;
 const{S}=build(),st=stateAt(U);
 if(!O._route||O._rk!==key.split("|U")[0]){O.svg.querySelector(".gfo-route").setAttribute("d",pathOf(S.map(s=>s.ll)))}
 const wake=S.slice(0,st.k+1).map(s=>s.ll);wake.push(st.ll);const wd=pathOf(wake);O.svg.querySelector(".gfo-wake").setAttribute("d",wd);O.svg.querySelector(".gfo-wake-halo").setAttribute("d",wd);
 const q=proj(st.ll);if(!q){O.ship.style.display="none";O.bub.style.display="none";return}O.ship.style.display="";
 const x=q[0]+O.ox,y=q[1]+O.oy;
 /* heading: from a point a little behind to a little ahead */
 const a=proj(stateAt(Math.max(0,U-.004)).ll),b=proj(stateAt(Math.min(1,U+.004)).ll);if(a&&b&&Math.hypot(b[0]-a[0],b[1]-a[1])>1)O.hd=b[0]>=a[0]?1:-1;
 const ek=episodeAt(U),fl=fleetAt(ek),kind=fl===0?"raft":"ship";if(kind!==O.kind){O.flip.innerHTML=kind==="raft"?RAFT:SHIP;O.kind=kind}
 O.flip.setAttribute("transform","scale("+O.hd+",1)");O.ship.setAttribute("transform","translate("+x.toFixed(1)+","+y.toFixed(1)+")");
 O.badge.style.display=fl>1?"":"none";O.badge.querySelector("text").textContent="×"+fl;
 /* the episode just reached, beside the ship */
 const{EU}=build(),E=EP[ek],near=U-EU[ek]<.035||(S[st.k]&&S[st.k].stay);O.bub.style.display=near?"":"none";
 if(near){const yrs=E.stay?' <small>'+(E.stay===1?"a year":E.stay+" years")+'</small>':"";O.bub.innerHTML=E.n+yrs;O.bub.style.left=x+"px";O.bub.style.top=(y-46)+"px"}
 O.hint.style.display=U<.002?"":"none";O.hint.style.left=(x+30)+"px";O.hint.style.top=(y-8)+"px";
 card(st,ek)}
function loop(){if(!O)return;raf=requestAnimationFrame(t=>{if(playing){const dt=Math.min(.1,(t-(lastT||t))/1000);U=Math.min(1,U+dt/45);if(U>=1){playing=false;btn()}}lastT=t;try{draw()}catch(e){console.error(e)}loop()})}

/* ---- dragging the ship ---- */
function wireDrag(){const sh=O.ship;
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();playing=false;btn();sh.classList.add("gfo-drag");try{sh.setPointerCapture(e.pointerId)}catch(err){}
  const mv=ev=>{ev.stopPropagation();const{S}=build(),hr=O.host.getBoundingClientRect(),px=ev.clientX-hr.left,py=ev.clientY-hr.top,cur=stateAt(U).k;
   /* the nearest point of the voyage near where the ship is now (the route crosses itself, so not a jump to the other side) */
   let best=-1,bd=1e9;const W=90;for(let i=Math.max(0,cur-W);i<=Math.min(S.length-1,cur+W);i++){const q=proj(S[i].ll);if(!q)continue;const d=Math.hypot(q[0]+O.ox-px,q[1]+O.oy-py)+Math.abs(i-cur)*.15;if(d<bd){bd=d;best=i}}
   if(best<0)return;/* through a stay: forward drags pass it, backward ones come back to its start */U=S[best].u;if(S[best+1]&&S[best+1].stay&&best>=cur)U=S[best+1].u};
  const up=ev=>{sh.removeEventListener("pointermove",mv);sh.removeEventListener("pointerup",up);sh.removeEventListener("pointercancel",up);sh.classList.remove("gfo-drag")};
  sh.addEventListener("pointermove",mv);sh.addEventListener("pointerup",up);sh.addEventListener("pointercancel",up)};
 sh.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>sh.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}));
 sh.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowUp"){U=Math.min(1,U+.01);e.preventDefault()}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){U=Math.max(0,U-.01);e.preventDefault()}})}

/* ---- on the card: play, a slider, the year and the episode ---- */
function btn(){const b=document.querySelector(".gfo-play");if(b){b.textContent=playing?"❚❚":"▶";b.setAttribute("aria-label",playing?"Pause":"Sail")}}
function ensureCard(){if(typeof ps==="undefined"||!ps||!ps.card)return;if(ps.card.querySelector(".gfo-ctl"))return;const at=ps.card.querySelector(".ps-stat");if(!at)return;
 const c=document.createElement("div");c.className="gfo-ctl";
 c.innerHTML='<div class="gfo-row"><button type="button" class="gfo-play" aria-label="Sail">▶</button><input type="range" class="gfo-range" min="0" max="1000" step="1" value="0" aria-label="How far along the voyage"><span class="gfo-yr">Year 1</span></div>'+
  '<div class="gfo-ep"><b></b><span></span></div><div class="gfo-tip">⛵ Drag the ship on the map, or press ▶, to sail Odysseus home.</div>';
 at.after(c);c.querySelector(".gfo-play").onclick=()=>{if(U>=1)U=0;playing=!playing;lastT=0;btn()};
 const r=c.querySelector(".gfo-range");r.addEventListener("input",()=>{playing=false;btn();U=r.value/1000});lastKey=""}
let lastEp=-1;
function card(st,ek){const c=document.querySelector(".gfo-ctl");if(!c)return;const r=c.querySelector(".gfo-range");if(document.activeElement!==r)r.value=Math.round(U*1000);
 const y=Math.max(1,Math.min(10,Math.ceil(st.yr-1e-6)));c.querySelector(".gfo-yr").textContent=U>=1?"Year 10 · home":"Year "+y;
 if(ek!==lastEp){lastEp=ek;c.querySelector(".gfo-ep b").textContent=EP[ek].n;c.querySelector(".gfo-ep span").textContent=EP[ek].t;c.querySelector(".gfo-ep").classList.remove("gfo-new");void c.offsetWidth;c.querySelector(".gfo-ep").classList.add("gfo-new")}}

/* ---- the stop itself: no drawn route of its own (the ship's layer draws it, faint), leaders fainter ---- */
function prep(){try{const T=PS_TOURS[TOUR],s=T&&T.steps.find(x=>x.title===TITLE);if(!s||!s._polL||s._gfo)return!!(s&&s._gfo);s._gfo=1;
  Object.defineProperty(s,"lines",{configurable:true,enumerable:true,writable:true,value:[]});return true}catch(e){return false}}
let n=0;const t0=setInterval(()=>{if(prep()||++n>80)clearInterval(t0)},500);
let wasOn=false;setInterval(()=>{const on=active();if(on){if(!wasOn){U=0;lastEp=-1;playing=false}mount();ensureCard()}else if(wasOn||O)unmount();wasOn=on},300);
addEventListener("resize",()=>{lastKey=""});

{const s=document.createElement("style");s.textContent=`
.gfo-layer{position:absolute;inset:0;pointer-events:none;z-index:24}
.gfo-svg{position:absolute;left:0;top:0;overflow:visible}
.gfo-route{fill:none;stroke:rgba(255,255,255,.55);stroke-width:1.6;stroke-dasharray:4 5}
.gfo-wake-halo{fill:none;stroke:rgba(255,255,255,.85);stroke-width:5.5;stroke-linecap:round;stroke-linejoin:round}
.gfo-wake{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.gfo-ship{pointer-events:all;cursor:grab;touch-action:none;outline:none}.gfo-ship.gfo-drag{cursor:grabbing}
.gfo-hit{fill:rgba(255,255,255,.001);stroke:none}
.gfo-ship .gfo-hull{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gfo-ship:hover .gfo-hull,.gfo-ship:focus-visible .gfo-hull{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gfo-badge rect{fill:#13294b}.gfo-badge text{fill:#fff;font:800 10.5px system-ui,sans-serif}
.gfo-bub{position:absolute;transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:13px;padding:5px 11px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.gfo-bub small{font-weight:700;color:#ffc58a;margin-left:4px}
.gfo-hint{position:absolute;background:rgba(255,255,255,.95);color:#9a4a16;font-weight:800;font-size:12.5px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:gfoNudge 1.4s ease-in-out infinite}
@keyframes gfoNudge{50%{transform:translateX(6px)}}
body.gfo-on .ps-leaders{opacity:.45}
.gfo-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.gfo-row{display:flex;align-items:center;gap:10px}
.gfo-play{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gfo-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.gfo-yr{flex:0 0 auto;font-weight:800;font-size:12.5px;color:#9a4a16;white-space:nowrap}
.gfo-ep{margin-top:8px;font-size:14px;line-height:1.4}.gfo-ep b{display:block;font-size:14.5px}
.gfo-ep.gfo-new{animation:gfoIn .45s ease}@keyframes gfoIn{from{opacity:.2;transform:translateY(4px)}}
.gfo-tip{margin-top:6px;font-size:12px;opacity:.7}
body.dark-theme .gfo-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}body.dark-theme .gfo-yr{color:#ffb27a}`;document.head.appendChild(s)}
window.gfOdyssey={build,stateAt,set:u=>{U=u;lastKey=""},get:()=>U};
})();
