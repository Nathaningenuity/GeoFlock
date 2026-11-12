/* GeoFlock: six history tour stops you can play with, on the globe.
   - explorers | "Around the world": sail Magellan's fleet yourself (drag the ship, the slider, or Play). The date runs
     from September 1519 to September 1522, the five ships drop out one by one, and each event is told as you reach it.
     The globe turns to follow the ship.
   - hmedieval | "The Mongol Empire": a year slider from 1206 to 1294. Each city or battle lights up the year it fell, with a
     ray back to Karakorum; red crosses mark where the Mongols were stopped. The card counts places taken and the reach.
   - hcoldwar | "The Iron Curtain": sort ten cities. For each one (pulsing on the map, or click any dot), say which side it
     was on in 1955: East, West, neutral, or split. Each answer explains why.
   - hgunpowder | "1492": two years after Columbus, Spain and Portugal split the world. Drag your own north-south line down
     the Atlantic and see which places each crown gets, then reveal the real line of 1494 and how far off you were.
   - hrevolutions | "The Suez Canal": race two ships from London to Bombay, one through the canal and one round Africa, at
     the same speed. Distances are measured along the two routes drawn on the stop.
   - hoceania | "Voyagers of the open Pacific": a year slider from 1400 BC to 1300 AD. Islands appear when people first
     reached them, with the length of each long jump, and the 1,800-year "long pause" in between.
   Like geoflock-odyssey.js: a layer in amGlobe.host placed with amGlobe.projection(), a control block on the card right after
   .ps-stat, redrawn when the view changes, and everything removed when the stop changes. Only on the globe view.
   Nothing here blocks Next/Back, and every step is wrapped in try/catch. */
(function(){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const R_KM=6371;
const kmBetween=(a,b)=>d3.geoDistance(a,b)*R_KM;
const fmtKm=v=>(Math.round(v/10)*10).toLocaleString("en-GB")+" km";
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH=["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ================= the shared machinery ================= */
const DEFS=[];
let cur=null,L=null,raf=0,lastKey="",ver=0,lastT=0;
const dirty=()=>{ver++};
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function prj(){try{const G=g();return G&&G.projection?G.projection():null}catch(e){return null}}
/* a place → canvas pixels (null when it is on the far side of the globe) */
function P(ll){try{const G=g(),p=prj();if(!p)return null;if(!G._flat){const r=p.rotate();if(d3.geoDistance(ll,[-r[0],-r[1]])>Math.PI/2-.03)return null}const s=p(ll);return s&&isFinite(s[0])&&isFinite(s[1])?s:null}catch(e){return null}}
/* lines drawn by d3 with the globe's own projection, so they bend and clip like the globe's */
function geoPath(o){try{const p=prj();return p?(d3.geoPath(p)(o)||""):""}catch(e){return""}}
const lineD=c=>c&&c.length>1?geoPath({type:"LineString",coordinates:c}):"";
/* a screen point → a place (null off the globe) */
function unproj(cx,cy){try{const G=g(),p=prj(),r=G.canvas.getBoundingClientRect(),ll=p.invert([cx-r.left,cy-r.top]);if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return null;
 if(!G._flat){const ro=p.rotate();if(d3.geoDistance(ll,[-ro[0],-ro[1]])>Math.PI/2-.004)return null}return ll}catch(e){return null}}
/* turn the globe a little towards a place, if it is getting near the edge (used while sailing round the world) */
function follow(ll,limitDeg){try{const G=g(),p=prj();if(!G||G._flat||!p||!G.rot)return;const r=p.rotate(),c=[-r[0],-r[1]],d=d3.geoDistance(ll,c)*180/Math.PI;if(d<(limitDeg||45))return;
 const off0=G.rot[0]-r[0],off1=G.rot[1]-r[1];let want0=-ll[0],dl=want0-r[0];dl=((dl+540)%360)-180;const want1=-Math.max(-40,Math.min(40,ll[1]));
 const k=d>80?.35:.08;G.rot=[G.rot[0]+dl*k,G.rot[1]+(want1-r[1])*k];if(Math.abs(off1)>90)G.rot[1]=r[1]+off1;G.render()}catch(e){}}

/* keep a place in sight: turn the globe if it is round the back, near the edge, or hidden behind the tour card */
function keepVisible(ll){try{const G=g(),p=prj();if(!G||G._flat||!p||!G.rot)return true;const r=p.rotate();
 if(d3.geoDistance(ll,[-r[0],-r[1]])*180/Math.PI>58){follow(ll,58);return false}
 const q=P(ll),cd=ps&&ps.card&&ps.card.offsetParent?ps.card.getBoundingClientRect():null;if(!q||!cd)return true;const cr=G.canvas.getBoundingClientRect(),x=cr.left+q[0],y=cr.top+q[1];
 if(x>cd.left-24&&x<cd.right+40&&y>cd.top-24&&y<cd.bottom+24){const left=cd.left+cd.width/2<cr.left+cr.width/2;G.rot=[G.rot[0]+(left?4:-4),G.rot[1]];G.render();return false}return true}catch(e){return true}}
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;const t=clean(S.title);
 return DEFS.find(d=>d.tour===ps.tour&&d.title===t)||null}catch(e){return null}}
function mount(def){const G=g();if(!G||!G.host||!G.canvas)return;if(L&&L.host===G.host&&L.el.isConnected)return;if(L)L.el.remove();
 const el=document.createElement("div");el.className="ihx-layer ihx-"+def.id;
 el.innerHTML='<svg class="ihx-svg"><g class="ihx-g">'+(def.svg||"")+'</g></svg><div class="ihx-html">'+(def.html||"")+'</div>';
 G.host.appendChild(el);L={host:G.host,el,svg:el.querySelector(".ihx-svg"),gg:el.querySelector(".ihx-g"),hh:el.querySelector(".ihx-html")};L.q=s=>el.querySelector(s);
 try{def.mount&&def.mount(L)}catch(e){console.error(e)}lastKey="";document.body.classList.add("ihx-on");if(!raf)loop()}
function leave(){try{if(cur&&cur.leave)cur.leave()}catch(e){}if(cur)cur.playing=false;if(L){L.el.remove();L=null}cancelAnimationFrame(raf);raf=0;
 document.querySelectorAll(".ihx-ctl").forEach(c=>c.remove());document.body.classList.remove("ihx-on");cur=null}
function ensureCard(def){try{if(!ps.card||ps.card.querySelector(".ihx-ctl"))return;const at=ps.card.querySelector(".ps-stat");if(!at)return;
 const c=document.createElement("div");c.className="ihx-ctl ihx-c-"+def.id;c.innerHTML=def.card;at.after(c);
 c.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight")e.stopPropagation()});/* arrow keys move the slider, not the tour */
 try{def.wire(c)}catch(e){console.error(e)}dirty()}catch(e){}}
const C=s=>document.querySelector(".ihx-ctl "+s);
function loop(){raf=requestAnimationFrame(t=>{raf=0;if(!L||!cur)return;const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
 if(cur.playing&&cur.tick){try{cur.tick(dt)}catch(e){cur.playing=false}}try{draw()}catch(e){console.error(e)}loop()})}
function draw(){const G=g();if(!G||!G.canvas)return;const hr=L.host.getBoundingClientRect(),cr=G.canvas.getBoundingClientRect(),ox=cr.left-hr.left,oy=cr.top-hr.top,p=prj();
 const key=(p?p.rotate().map(v=>v.toFixed(3)).join(",")+","+p.scale().toFixed(2)+","+p.translate().join(","):"")+"|"+hr.width+"x"+hr.height+"|"+ox+","+oy+"|"+ver;
 if(key===lastKey)return;lastKey=key;
 L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);L.gg.setAttribute("transform","translate("+ox+","+oy+")");L.hh.style.transform="translate("+ox+"px,"+oy+"px)";
 cur.draw(L)}
setInterval(()=>{try{const d=activeDef();if(d!==cur){leave();if(d){cur=d;cur.playing=false;try{d.reset()}catch(e){}}}if(cur){mount(cur);ensureCard(cur)}}catch(e){}},300);
addEventListener("resize",()=>{lastKey=""});

/* dragging something on the map without turning the globe */
function dragger(el,o){const stop=e=>e.stopPropagation();
 el.addEventListener("pointerdown",e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{el.setPointerCapture(e.pointerId)}catch(x){}
  el.classList.add("ihx-dragging");try{o.start&&o.start(e)}catch(x){}
  const mv=ev=>{ev.stopPropagation();try{o.move(ev.clientX,ev.clientY)}catch(x){}dirty()};
  const up=()=>{el.removeEventListener("pointermove",mv);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.classList.remove("ihx-dragging");try{o.end&&o.end()}catch(x){}dirty()};
  el.addEventListener("pointermove",mv);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)});
 ["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,stop,{passive:true}))}
const clickable=(el,fn)=>{el.addEventListener("pointerdown",e=>{e.stopPropagation();e.stopImmediatePropagation()});["mousedown","touchstart","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 el.addEventListener("click",e=>{e.stopPropagation();try{fn(e)}catch(x){}dirty()})};

/* a route cut into small steps along great circles, each with its distance from the start (km) and its waypoint number */
function sampleRoute(pts,step){step=step||.012;const S=[{ll:pts[0],d:0,w:0}];let D=0;
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],ang=d3.geoDistance(a,b),n=Math.max(1,Math.ceil(ang/step)),f=d3.geoInterpolate(a,b);
  for(let k=1;k<=n;k++){D+=ang/n*R_KM;S.push({ll:k===n?b:f(k/n),d:D,w:k===n?i:-1})}}return S}
/* where along the samples a value (key "d" or "t") falls: the sample before, and the point itself */
function along(S,key,v){let lo=0,hi=S.length-1;if(v<=S[0][key])return{k:0,ll:S[0].ll};if(v>=S[hi][key])return{k:hi,ll:S[hi].ll};
 while(hi-lo>1){const m=(lo+hi)>>1;if(S[m][key]<=v)lo=m;else hi=m}const a=S[lo],b=S[hi],f=b[key]>a[key]?(v-a[key])/(b[key]-a[key]):0;
 return{k:lo,ll:f>0?d3.geoInterpolate(a.ll,b.ll)(f):a.ll}}
/* the sample nearest the pointer, looking only near the current one (routes cross themselves) */
function nearestSample(S,curK,cx,cy,W){const G=g(),r=G.canvas.getBoundingClientRect(),px=cx-r.left,py=cy-r.top;let best=-1,bd=1e9;
 for(let i=Math.max(0,curK-W);i<=Math.min(S.length-1,curK+W);i++){const q=P(S[i].ll);if(!q)continue;const d=Math.hypot(q[0]-px,q[1]-py)+Math.abs(i-curK)*.12;if(d<bd){bd=d;best=i}}return best}

/* replace a stop's own lines (and some pins) while this file draws its own, on the globe only; flat maps keep them */
function hideOwn(tour,title,keepLine,keepPin){let n=0;const t0=setInterval(()=>{try{const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[tour],s=T&&T.steps&&T.steps.find(x=>clean(x.title)===title);
 if(s&&!s._ihx){s._ihx=1;let lines=s.lines,pins=s.pins;const on=()=>{try{return ps&&ps.tour===tour&&ps.mode==="globe"}catch(e){return false}};
  Object.defineProperty(s,"lines",{configurable:true,enumerable:true,get(){return on()&&Array.isArray(lines)?lines.filter(keepLine||(()=>false)):lines},set(v){lines=v}});
  if(keepPin)Object.defineProperty(s,"pins",{configurable:true,enumerable:true,get(){return on()&&Array.isArray(pins)?pins.filter(keepPin):pins},set(v){pins=v}})}
 if(s||++n>120)clearInterval(t0)}catch(e){clearInterval(t0)}},500)}

/* a play button + slider row for the card */
const playRow=(label,aria)=>'<div class="ihx-row"><button type="button" class="ihx-play" aria-label="Play">▶</button><input type="range" class="ihx-range" min="0" max="1000" step="1" value="0" aria-label="'+esc(aria)+'"><span class="ihx-val">'+esc(label)+'</span></div>';
function wirePlay(c,def,get,set){const b=c.querySelector(".ihx-play"),r=c.querySelector(".ihx-range");
 b.onclick=()=>{if(get()>=1)set(0);def.playing=!def.playing;lastT=0;btn(def)};
 r.addEventListener("input",()=>{def.playing=false;btn(def);set(r.value/1000);dirty()})}
function btn(def){const b=C(".ihx-play");if(b){b.textContent=def.playing?"❚❚":"▶";b.setAttribute("aria-label",def.playing?"Pause":"Play")}}
function syncRange(u){const r=C(".ihx-range");if(r&&document.activeElement!==r)r.value=Math.round(u*1000)}
function setText(sel,t){const e=C(sel);if(e&&e.textContent!==t)e.textContent=t}
function setHTML(sel,h){const e=C(sel);if(e&&e.innerHTML!==h)e.innerHTML=h}
function flash(sel){const e=C(sel);if(!e)return;e.classList.remove("ihx-new");void e.offsetWidth;e.classList.add("ihx-new")}
/* a label in the HTML layer at a canvas point */
function place(el,q,dx,dy){if(!el)return;if(!q){el.style.display="none";return}el.style.display="";el.style.left=(q[0]+(dx||0)).toFixed(1)+"px";el.style.top=(q[1]+(dy||0)).toFixed(1)+"px"}

const SHIP='<g class="ihx-hull"><path d="M-15 2 Q-12 8 -5 9 L11 9 Q16 7 18 1 Z" fill="#6b3d1e" stroke="#2c1708" stroke-width="1"/>'+
 '<path d="M1 1 V-20" stroke="#2c1708" stroke-width="1.5"/><path d="M-9 -18 Q1 -21 11 -18 L10 -4 Q1 -6 -8 -4 Z" fill="#f4ead3" stroke="#2c1708" stroke-width="1"/>'+
 '<path d="M-7 -11 L9 -11 M1 -17 V-5" stroke="#c0392b" stroke-width="2"/></g>';
const STEAMER='<g class="ihx-hull"><path d="M-16 1 L17 1 L13 8 L-13 8 Z" fill="#33414f" stroke="#111" stroke-width="1"/><rect x="-10" y="-5" width="18" height="6" fill="#f2efe6" stroke="#111" stroke-width=".8"/>'+
 '<rect x="-3" y="-15" width="5" height="10" fill="#c0392b" stroke="#111" stroke-width=".8"/><path d="M-1 -16 q-6 -4 -12 -2" stroke="rgba(90,90,90,.6)" stroke-width="3" fill="none" stroke-linecap="round"/></g>';

/* ================= 1. Magellan and Elcano: around the world =================
   Dates and events: Antonio Pigafetta's journal (Pigafetta sailed with the fleet) as given in L. Bergreen, "Over the Edge of
   the World" (2003), and Encyclopaedia Britannica, "Ferdinand Magellan". Dates are those the crew kept (Julian calendar).
   Only the waypoints with a date are fixed; between them the date is spread along the way, so it is shown by month only.
   The crew: "about 250" set out (the stop's own figure; the muster rolls give 237 to about 270), and 18 came home. */
const MG={id:"magellan",tour:"explorers",title:"Around the world"};
{const D=(s)=>{const[y,m,d]=s.split("-").map(Number);return(Date.UTC(y,m-1,d)-Date.UTC(1519,8,20))/864e5};
 /* [lon, lat, date if known] */
 const WP=[[-6.36,36.78,"1519-09-20"],[-10,33],[-16.3,28.2,"1519-09-26"],[-16.3,28.2,"1519-10-03"],[-20,20],[-22,10],[-27,2],[-33,-6],[-38,-15],
  [-43.15,-22.95,"1519-12-13"],[-47,-27],[-52,-33.5],[-56.5,-35.3],[-57.5,-38.5],[-62,-41.5],[-64.5,-45],[-66.5,-47.5],
  [-67.72,-49.31,"1520-03-31"],[-67.72,-49.31,"1520-08-24"],[-68.25,-50.15,"1520-08-26"],[-68.25,-50.15,"1520-10-18"],[-68.35,-52.33,"1520-10-21"],
  [-69.5,-52.55],[-70.4,-53.0],[-70.95,-53.6],[-71.3,-53.9],[-72.3,-53.6],[-73.4,-53.05],[-74.7,-52.72,"1520-11-28"],
  [-76.5,-48],[-78,-40],[-82,-32],[-95,-25],[-115,-17],[-138.6,-15],[-155,-8],[-170,0],[175,8],[160,12.5],
  [144.7,13.4,"1521-03-06"],[135,12],[125.75,10.7,"1521-03-16"],[125.05,9.95],[123.92,10.32,"1521-04-07"],[123.99,10.28,"1521-04-27"],[124.15,9.55],
  [123.2,8.9],[121.5,8.8],[119,8.6],[117,7.6],[114.95,5.0,"1521-07-09"],[116.5,6.8],[119.5,6.0],[122,6.3],[125,5.0],[126.5,3.0],
  [127.4,0.68,"1521-11-08"],[127.4,0.68,"1521-12-21"],[126,-2],[125.5,-6],[124.7,-10.6,"1522-01-26"],[124.7,-10.6,"1522-02-11"],[118,-15],[100,-25],[75,-36],[45,-40],[25,-37],
  [18.4,-35.0,"1522-05-16"],[11,-25],[3,-12],[-10,0],[-18,8],[-23.6,14.9,"1522-07-09"],[-28,22],[-25,32],[-14,36.5],[-6.36,36.78,"1522-09-06"]];
 /* events: at a waypoint (w) or on a date; ships = how many are left afterwards */
 const EV=[
  {w:0,n:"Sanlúcar, Spain · Sep 1519",t:"Five ships and about 250 men set out to reach the Spice Islands by sailing west.",ships:5},
  {w:2,n:"Canary Islands",t:"A last stop for water, wood and food before the open Atlantic."},
  {w:9,n:"Rio de Janeiro bay · Dec 1519",t:"They rest and trade on the coast of Brazil."},
  {w:12,n:"Río de la Plata",t:"A wide opening to the west! But the water turns fresh: it is a river mouth, not the way through."},
  {w:17,n:"San Julián · Mar 1520",t:"Winter: they camp here for five months. Three captains mutiny, and Magellan crushes the mutiny."},
  {date:"1520-05-15",at:17,n:"The Santiago is wrecked · May 1520",t:"Sent ahead to scout the coast, the smallest ship is wrecked in a storm. Her crew survive.",ships:4,lost:"Santiago"},
  {w:21,n:"The strait! · 21 Oct 1520",t:"At a cape Magellan names for the Virgins, a channel opens to the west: the strait that now bears his name."},
  {w:25,n:"The San Antonio turns back · Nov 1520",t:"In the maze of channels, the biggest ship, with much of the food, slips away and sails home to Spain.",ships:3,lost:"San Antonio"},
  {w:28,n:"A new ocean · 28 Nov 1520",t:"After 38 days in the strait they reach open sea. It looks so calm that Magellan calls it the Pacific."},
  {w:34,n:"Starving",t:"No fresh food for weeks: the crew eat biscuit full of worms, leather, sawdust and rats, and many die of scurvy."},
  {w:39,n:"Guam · 6 Mar 1521",t:"Land at last, 98 days after leaving the strait."},
  {w:41,n:"The Philippines · Mar 1521",t:"They reach islands where Magellan’s Malay servant Enrique can make himself understood."},
  {w:44,n:"Mactan · 27 Apr 1521",t:"Magellan is killed on the beach fighting the warriors of Lapulapu, a local chief."},
  {w:45,n:"The Concepción burns · May 1521",t:"Too few men are left to sail three ships, so they burn the Concepción.",ships:2,lost:"Concepción"},
  {w:50,n:"Brunei · Jul 1521",t:"Lost without Magellan, they wander for months before finding the way to the Spice Islands."},
  {w:56,n:"The Spice Islands · 8 Nov 1521",t:"At Tidore they fill the ships with cloves, worth a fortune in Europe."},
  {w:57,n:"The Trinidad stays · Dec 1521",t:"The Trinidad is leaking and stays to be mended (the Portuguese later seize her). Juan Sebastián Elcano sails the Victoria home alone.",ships:1,lost:"Trinidad"},
  {w:60,n:"Timor",t:"Then straight across the Indian Ocean, far south, to keep away from Portuguese ships."},
  {w:67,n:"Round the Cape of Good Hope · May 1522",t:"Weeks of storms at Africa’s southern tip; men keep dying of hunger and scurvy."},
  {w:72,n:"Cape Verde · Jul 1522",t:"The Portuguese seize 13 men who went ashore for food. And ashore it is Thursday, but their log says Wednesday: sailing west round the world, they have lost a day."},
  {w:76,n:"Home · 6 Sep 1522",t:"18 men on one battered ship: the first voyage round the world, after almost three years.",men:18}];
 const SHIPS=["Trinidad","San Antonio","Concepción","Victoria","Santiago"];
 const TOTAL=D("1522-09-06");
 let S=null,EVT=null;
 function build(){if(S)return;S=sampleRoute(WP.map(w=>[w[0],w[1]]),.012);
  /* dates at the dated waypoints, spread by distance between them */
  const fix=[];S.forEach((s,j)=>{if(s.w>=0&&WP[s.w][2]&&!fix.some(f=>f.w===s.w)){s.t=D(WP[s.w][2]);fix.push({j,w:s.w})}});
  for(let k=0;k<fix.length-1;k++){const a=S[fix[k].j],b=S[fix[k+1].j];for(let j=fix[k].j+1;j<fix[k+1].j;j++)S[j].t=b.d>a.d?a.t+(b.t-a.t)*(S[j].d-a.d)/(b.d-a.d):a.t}
  EVT=EV.map(e=>{let t;if(e.date)t=D(e.date);else{const s=S.find(x=>x.w===e.w);t=s?s.t:0}const at=S.find(x=>x.w===(e.at!=null?e.at:e.w));return Object.assign({},e,{tt:t,ll:at?at.ll:WP[0]})})}
 let T=0,lastEv=-1,follows=false;
 const evAt=t=>{let k=0;EVT.forEach((e,i)=>{if(e.tt<=t+1e-6)k=i});return k};
 const shipsAt=t=>{let n=5;const lost=[];EVT.forEach(e=>{if(e.tt<=t+1e-6&&e.ships!=null){n=e.ships;if(e.lost)lost.push(e.lost)}});return{n,lost}};
 const dateOf=t=>{const d=new Date(Date.UTC(1519,8,20)+Math.round(t)*864e5);return MON[d.getUTCMonth()]+" "+d.getUTCFullYear()};
 Object.assign(MG,{
  svg:'<path class="ihx-route"/><path class="ihx-wake-halo"/><path class="ihx-wake"/><g class="ihx-evdots"></g><g class="ihx-ship" tabindex="0" role="slider" aria-label="The fleet: drag to sail"><circle class="ihx-hit" r="26"/><g class="ihx-flip">'+SHIP+'</g><g class="ihx-badge"><rect x="9" y="-31" width="26" height="16" rx="8"/><text x="22" y="-19.5" text-anchor="middle"></text></g></g>',
  html:'<div class="ihx-bub"></div><div class="ihx-hint">Drag the ship ⟶</div>',
  card:'<div class="ihx-tip">⛵ Drag the ship, or press ▶, to sail round the world.</div>'+playRow("Sep 1519","How far into the voyage")+
   '<div class="ihx-fleet"></div><div class="ihx-ev"><b></b><span></span></div>',
  reset(){build();T=0;lastEv=-1;follows=false},
  mount(L){build();const sh=L.q(".ihx-ship");
   dragger(sh,{start(){MG.playing=false;btn(MG);follows=false},move(cx,cy){const k=along(S,"t",T).k,b=nearestSample(S,k,cx,cy,60);if(b<0)return;let j=b;if(j>=k&&S[j+1]&&S[j+1].d===S[j].d)j++;T=S[j].t}});
   sh.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowUp"){T=Math.min(TOTAL,T+7);e.preventDefault();dirty()}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){T=Math.max(0,T-7);e.preventDefault();dirty()}});
   /* event spots along the way: small dots, so you can see what is coming */
   L.q(".ihx-evdots").innerHTML=EVT.map(()=>'<circle r="3.6"/>').join("")},
  wire(c){wirePlay(c,MG,()=>T/TOTAL,u=>{T=u*TOTAL;follows=true});lastEv=-1},
  tick(dt){T=Math.min(TOTAL,T+dt*TOTAL/50);follows=true;if(T>=TOTAL){MG.playing=false;btn(MG)}dirty()},
  draw(L){const st=along(S,"t",T);
   if(follows&&keepVisible(st.ll)&&!MG.playing)follows=false;
   L.q(".ihx-route").setAttribute("d",lineD(S.map(s=>s.ll)));
   const wake=S.slice(0,st.k+1).map(s=>s.ll);wake.push(st.ll);const wd=lineD(wake);L.q(".ihx-wake").setAttribute("d",wd);L.q(".ihx-wake-halo").setAttribute("d",wd);
   const dots=L.q(".ihx-evdots").children;EVT.forEach((e,i)=>{const q=P(e.ll),c=dots[i];if(!c)return;if(!q){c.style.display="none";return}c.style.display="";c.setAttribute("cx",q[0]);c.setAttribute("cy",q[1]);c.setAttribute("class",e.tt<=T?"ihx-evd-done":"ihx-evd")});
   const q=P(st.ll),sh=L.q(".ihx-ship"),fl=shipsAt(T),ek=evAt(T),E=EVT[ek];
   if(!q){sh.style.display="none";L.q(".ihx-bub").style.display="none";L.q(".ihx-hint").style.display="none"}
   else{sh.style.display="";sh.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");
    const a=P(along(S,"t",Math.max(0,T-6)).ll),b=P(along(S,"t",Math.min(TOTAL,T+6)).ll);if(a&&b&&Math.abs(b[0]-a[0])>1)L.q(".ihx-flip").setAttribute("transform","scale("+(b[0]>=a[0]?1:-1)+",1)");
    L.q(".ihx-badge").style.display=fl.n>1?"":"none";L.q(".ihx-badge text").textContent="×"+fl.n;
    const near=T-E.tt<25,bub=L.q(".ihx-bub");if(near){bub.textContent=E.n.split(" · ")[0];place(bub,q,0,-40)}else bub.style.display="none";
    place(L.q(".ihx-hint"),T<1?q:null,28,-10)}
   /* the card */
   syncRange(T/TOTAL);setText(".ihx-val",T>=TOTAL?"Sep 1522 · home":dateOf(T));
   const men=T>=TOTAL?"18 men":"about 250 men set out";
   setHTML(".ihx-fleet",'<div class="ihx-ships">'+SHIPS.map(n=>'<span class="'+(fl.lost.includes(n)?"ihx-lost":"")+'" title="'+esc(n)+'">⛵<i>'+esc(n)+'</i></span>').join("")+'</div><div class="ihx-big"><b>'+fl.n+'</b> of 5 ships · '+men+'</div>');
   if(ek!==lastEv){lastEv=ek;setText(".ihx-ev b",E.n);setText(".ihx-ev span",E.t);flash(".ihx-ev")}}});
 DEFS.push(MG);hideOwn(MG.tour,MG.title,null,null)}

/* ================= 2. The Mongol Empire, year by year =================
   Years: Encyclopaedia Britannica ("Mongol empire", "Genghis Khan", "Kublai Khan") and D. Morgan, "The Mongols" (2nd ed., 2007).
   Coordinates are today's towns at or nearest each place. "stop" = where a Mongol army was defeated or turned back. */
const MO={id:"mongols",tour:"hmedieval",title:"The Mongol Empire"};
{const KK=[102.84,47.2];/* Karakorum, capital from 1235 */
 const EV=[
  {y:1206,ll:[110.6,48.8],n:"Onon River",t:"Temüjin is proclaimed Genghis Khan, ruler of all the Mongol tribes."},
  {y:1209,ll:[106.27,38.47],n:"Western Xia",t:"The Tangut kingdom of Western Xia submits."},
  {y:1215,ll:[116.4,39.9],n:"Zhongdu (Beijing)",t:"The northern Chinese capital of the Jin falls."},
  {y:1218,ll:[75.99,39.47],n:"Kashgar",t:"The Qara Khitai empire in Central Asia is taken."},
  {y:1220,ll:[64.42,39.77],n:"Bukhara",t:"The Khwarazmian empire is destroyed: Bukhara and Samarkand fall."},
  {y:1220,ll:[66.96,39.65],n:"Samarkand",t:""},
  {y:1221,ll:[61.84,37.66],n:"Merv",t:"Merv, Nishapur and Urgench, some of the greatest cities of the time, are wiped out."},
  {y:1221,ll:[58.8,36.21],n:"Nishapur",t:""},
  {y:1221,ll:[59.53,42.33],n:"Urgench",t:""},
  {y:1223,ll:[37.75,47.35],n:"Kalka River",t:"A raiding army crushes the princes of the Rus’ and goes home again."},
  {y:1227,ll:null,n:"Genghis Khan dies",t:"Genghis Khan dies while destroying Western Xia. His son Ögedei follows him."},
  {y:1234,ll:[114.36,33.0],n:"Caizhou",t:"The last Jin emperor falls: all of northern China is Mongol."},
  {y:1236,ll:[50.4,54.97],n:"Volga Bulgaria",t:"Batu’s great campaign to the west begins."},
  {y:1237,ll:[39.74,54.63],n:"Ryazan",t:"The Rus’ cities fall one by one: Ryazan, then Vladimir."},
  {y:1238,ll:[40.41,56.13],n:"Vladimir",t:""},
  {y:1240,ll:[30.52,50.45],n:"Kyiv",t:"Kyiv is stormed and burned."},
  {y:1241,ll:[16.16,51.21],n:"Legnica",t:"Polish and Hungarian armies are destroyed at Legnica and Mohi."},
  {y:1241,ll:[20.98,47.98],n:"Mohi",t:""},
  {y:1242,ll:null,n:"Back from Europe",t:"News comes that Ögedei has died. The armies pull back from Europe and never return."},
  {y:1243,ll:[38.6,40.1],n:"Köse Dağ",t:"The Seljuk Turks of Anatolia are beaten and become subjects."},
  {y:1256,ll:[50.59,36.44],n:"Alamut",t:"Hulagu takes the mountain fortress of the Assassins."},
  {y:1258,ll:[44.37,33.31],n:"Baghdad",t:"Baghdad is sacked and the last Abbasid caliph killed."},
  {y:1259,ll:[126.49,37.75],n:"Korea",t:"After decades of war, Goryeo Korea submits."},
  {y:1260,ll:[36.29,33.51],n:"Damascus",t:"Aleppo and Damascus fall…"},
  {y:1260,ll:[35.36,32.55],n:"Ain Jalut",t:"…but at Ain Jalut Egypt’s Mamluks beat a Mongol army. The empire splits into four khanates as Kublai fights his brother for the throne.",stop:1},
  {y:1271,ll:null,n:"The Yuan dynasty",t:"Kublai Khan rules China as emperor, from Khanbaliq (Beijing)."},
  {y:1273,ll:[112.14,32.04],n:"Xiangyang",t:"After a siege of about five years, the key Song fortress falls."},
  {y:1274,ll:[130.4,33.6],n:"Japan",t:"An invasion of Japan fails; a second, in 1281, is wrecked by a typhoon, the ‘kamikaze’ or divine wind.",stop:1},
  {y:1276,ll:[120.16,30.27],n:"Hangzhou",t:"The Song capital surrenders."},
  {y:1279,ll:[113.07,22.2],n:"Yamen",t:"The last Song forces are destroyed at sea: all of China is Mongol."},
  {y:1288,ll:[106.75,20.9],n:"Bạch Đằng",t:"Đại Việt (Vietnam) destroys a Mongol fleet with stakes hidden in the river.",stop:1},
  {y:1294,ll:null,n:"Kublai Khan dies",t:"Kublai Khan, the last great khan, dies. The four khanates go their own ways."}];
 const Y0=1206,Y1=1294;let Y=Y0,lastEv=-1,follows=false;
 const evAt=y=>{let k=0;EV.forEach((e,i)=>{if(e.y<=y&&e.t)k=i});return k};
 Object.assign(MO,{
  svg:'<g class="ihx-rays"></g><g class="ihx-pts"></g><g class="ihx-home"><circle r="8"/><text y="4" text-anchor="middle">★</text></g>',
  html:EV.map((e,i)=>e.ll?'<div class="ihx-lab ihx-mlab" data-i="'+i+'"></div>':"").join(""),
  card:'<div class="ihx-tip">🐎 Slide through the years, or press ▶, to watch the conquests spread.</div>'+playRow("1206","Year")+
   '<div class="ihx-big ihx-mstat"></div><div class="ihx-ev"><b></b><span></span></div>',
  reset(){Y=Y0;lastEv=-1;follows=false},
  mount(L){L.q(".ihx-rays").innerHTML=EV.map(e=>e.ll&&!e.stop?'<path/>':'<path style="display:none"/>').join("");
   L.q(".ihx-pts").innerHTML=EV.map(e=>e.ll?(e.stop?'<g class="ihx-x"><circle r="10"/><path d="M-5 -5 L5 5 M5 -5 L-5 5"/></g>':'<g class="ihx-pt"><circle class="ihx-glow" r="12"/><circle r="5.5"/></g>'):'<g style="display:none"></g>').join("")},
  wire(c){wirePlay(c,MO,()=>(Y-Y0)/(Y1-Y0),u=>{Y=Y0+u*(Y1-Y0);follows=true});lastEv=-1},
  tick(dt){Y=Math.min(Y1,Y+dt*3.2);follows=true;if(Y>=Y1){MO.playing=false;btn(MO)}dirty()},
  draw(L){const y=Math.floor(Y+1e-6);if(follows){let la=null;EV.forEach(e=>{if(e.ll&&e.y<=y)la=e.ll});if(la&&keepVisible(la)&&!MO.playing)follows=false}const rays=L.q(".ihx-rays").children,pts=L.q(".ihx-pts").children;let n=0,far=0,farN="";
   EV.forEach((e,i)=>{if(!e.ll)return;const on=e.y<=y,fresh=on&&y-e.y<4,q=P(e.ll),pt=pts[i],ray=rays[i],lab=L.q('.ihx-mlab[data-i="'+i+'"]');
    if(!e.stop&&on){n++;const d=kmBetween(KK,e.ll);if(d>far){far=d;farN=e.n}}
    if(ray&&!e.stop){ray.style.display=on?"":"none";if(on){ray.setAttribute("d",lineD([KK,e.ll]));ray.setAttribute("class",fresh?"ihx-ray ihx-ray-new":"ihx-ray")}}
    if(pt){if(!on||!q){pt.style.display="none"}else{pt.style.display="";pt.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");pt.classList.toggle("ihx-fresh",fresh)}}
    if(lab){const show=on&&(fresh||e.stop);if(show&&q){lab.textContent=(e.stop?"✋ ":"")+e.n+" "+e.y;lab.classList.toggle("ihx-lab-stop",!!e.stop);place(lab,q,0,-12)}else lab.style.display="none"}});
   const hq=P(KK),home=L.q(".ihx-home");if(hq){home.style.display="";home.setAttribute("transform","translate("+hq[0].toFixed(1)+","+hq[1].toFixed(1)+")")}else home.style.display="none";
   syncRange((Y-Y0)/(Y1-Y0));setText(".ihx-val",String(y));
   setHTML(".ihx-mstat",'<b>'+n+'</b> places taken'+(far?' · farthest: <b>'+esc(farN)+'</b>, '+fmtKm(far)+' from Karakorum':''));
   const ek=evAt(y);if(ek!==lastEv){lastEv=ek;const E=EV[ek];setText(".ihx-ev b",E.y+" · "+E.n);setText(".ihx-ev span",E.t);flash(".ihx-ev")}}});
 DEFS.push(MO)}

/* ================= 3. The Iron Curtain: which side? =================
   Sides in 1955: NATO members (nato.int: Denmark a founder in 1949, Greece 1952, West Germany May 1955); the Warsaw Pact,
   signed in Warsaw on 14 May 1955 (Poland, Czechoslovakia, Hungary, Romania, Bulgaria, Albania, East Germany, the USSR);
   Austria made neutral by the State Treaty of 15 May 1955; Yugoslavia's break with Stalin in 1948 (Britannica). */
const IC={id:"curtain",tour:"hcoldwar",title:"The Iron Curtain"};
{const SIDE={E:["East","Soviet bloc","#c62828"],W:["West","with NATO","#1f5fbf"],N:["Neutral","neither side","#6b7280"],S:["Split","both sides","#7b3fa0"]};
 const CITY=[
  {n:"Prague",p:"l",ll:[14.42,50.08],a:"E",w:"Communists seized power in Czechoslovakia in 1948, and it was a founder of the Warsaw Pact."},
  {n:"Vienna",p:"b",ll:[16.37,48.21],a:"N",w:"Like Berlin, Vienna was shared by four armies after 1945. In 1955 they all left, and Austria promised to stay neutral."},
  {n:"Berlin",p:"t",ll:[13.4,52.52],a:"S",w:"Deep inside East Germany, it was cut in two: Soviet East Berlin, and West Berlin, held by the US, Britain and France. The Wall came in 1961."},
  {n:"Hamburg",p:"l",ll:[9.99,53.55],a:"W",w:"Hamburg was in West Germany, which joined NATO in May 1955. The border was only about 50 km away."},
  {n:"Warsaw",p:"r",ll:[21.01,52.23],a:"E",w:"Communist Poland: the Soviet alliance signed here in 1955 is called the Warsaw Pact."},
  {n:"Budapest",p:"r",ll:[19.04,47.5],a:"E",w:"Communist Hungary. In 1956 Hungarians rose up, and Soviet tanks crushed them."},
  {n:"Belgrade",p:"r",ll:[20.46,44.82],a:"N",w:"Yugoslavia was communist, but Tito broke with Stalin in 1948 and joined neither bloc. Belgrade hosted the first summit of ‘non-aligned’ countries in 1961."},
  {n:"Helsinki",p:"t",ll:[24.94,60.17],a:"N",w:"Finland stayed out of both alliances, though it had to keep on good terms with its giant neighbour."},
  {n:"Copenhagen",p:"t",ll:[12.57,55.68],a:"W",w:"Denmark was one of the twelve countries that founded NATO in 1949."},
  {n:"Athens",p:"t",ll:[23.73,37.98],a:"W",w:"Greece joined NATO in 1952, after a civil war in which communists were defeated."}];
 let ans={},curI=0,last=null;
 const score=()=>CITY.reduce((s,c,i)=>s+(ans[i]&&ans[i]===c.a?1:0),0),done=()=>Object.keys(ans).length;
 function pick(i){curI=i;last=null;renderCard()}
 function answer(k){if(ans[curI])return;ans[curI]=k;last={i:curI,k};renderCard()}
 function nextOpen(){for(let s=1;s<=CITY.length;s++){const i=(curI+s)%CITY.length;if(!ans[i])return i}return-1}
 function renderCard(){const c=document.querySelector(".ihx-c-curtain");if(!c)return;const city=CITY[curI],a=ans[curI];
  c.querySelector(".ihx-q").innerHTML=done()>=CITY.length&&!last?'<b>All ten sorted: '+score()+' right.</b> Click any city to read about it again.':'Which side was <b>'+esc(city.n)+'</b> on in 1955?';
  c.querySelectorAll(".ihx-side").forEach(b=>{const k=b.dataset.k;b.disabled=!!a;b.classList.toggle("ihx-right",!!a&&k===city.a);b.classList.toggle("ihx-wrong",!!a&&k===a&&a!==city.a)});
  const fb=c.querySelector(".ihx-fb");if(a){const ok=a===city.a;fb.style.display="";fb.innerHTML='<b>'+(ok?"✓ Right: ":"✗ Not quite: ")+esc(city.n)+' was '+(city.a==="S"?"split between both sides":SIDE[city.a][0]+" ("+SIDE[city.a][1]+")")+'.</b> '+esc(city.w)+(nextOpen()>=0?' <button type="button" class="ihx-next">Next city →</button>':'');
   const nb=fb.querySelector(".ihx-next");if(nb)nb.onclick=()=>pick(nextOpen());flash(".ihx-fb")}else fb.style.display="none";
  c.querySelector(".ihx-score").textContent=done()+" of "+CITY.length+" sorted · "+score()+" right";dirty()}
 Object.assign(IC,{
  svg:'<g class="ihx-cities">'+CITY.map((c,i)=>'<g class="ihx-city" data-i="'+i+'"><circle class="ihx-ring" r="16"/><circle class="ihx-dot" r="8"/><text y="4.5" text-anchor="middle">?</text></g>').join("")+'</g>',
  html:CITY.map((c,i)=>'<div class="ihx-lab ihx-clab ihx-at-'+c.p+'" data-i="'+i+'">'+esc(c.n)+'</div>').join(""),
  card:'<div class="ihx-tip">🧭 Pick a side for each city (or click a dot on the map).</div><div class="ihx-q"></div>'+
   '<div class="ihx-sides">'+Object.keys(SIDE).map(k=>'<button type="button" class="ihx-side" data-k="'+k+'" style="--c:'+SIDE[k][2]+'"><b>'+SIDE[k][0]+'</b><small>'+SIDE[k][1]+'</small></button>').join("")+'</div>'+
   '<div class="ihx-fb"></div><div class="ihx-score"></div>',
  reset(){ans={};curI=0;last=null},
  mount(L){L.el.querySelectorAll(".ihx-city").forEach(el=>clickable(el,()=>pick(+el.dataset.i)))},
  wire(c){c.querySelectorAll(".ihx-side").forEach(b=>b.onclick=()=>answer(b.dataset.k));renderCard()},
  draw(L){CITY.forEach((c,i)=>{const el=L.q('.ihx-city[data-i="'+i+'"]'),lab=L.q('.ihx-clab[data-i="'+i+'"]'),q=P(c.ll);if(!q){el.style.display="none";lab.style.display="none";return}
   el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");const a=ans[i];
   el.querySelector(".ihx-dot").style.fill=a?SIDE[c.a][2]:"#fff";el.querySelector("text").textContent=a?(a===c.a?"✓":"✗"):"?";el.querySelector("text").style.fill=a?"#fff":"#13294b";
   el.classList.toggle("ihx-cur",i===curI);const o={l:[-12,0],r:[12,0],t:[0,-13],b:[0,13]}[c.p];place(lab,q,o[0],o[1]);lab.classList.toggle("ihx-lab-cur",i===curI)})}});
 DEFS.push(IC)}

/* ================= 4. After 1492: draw the line of 1494 (the "1492" stop of Gunpowder and sail) =================
   The Treaty of Tordesillas (7 June 1494) set the line 370 leagues west of the Cape Verde Islands. The league's length was
   never agreed, so the line's place is given as "about 46°37′W" (Britannica, "Treaty of Tordesillas"; the stop's own line is
   at 46.6°W). The year before, the pope had drawn it only 100 leagues west of the Azores and Cape Verde (bull Inter caetera,
   1493); Portugal pushed it west. Cabral reached Brazil in April 1500. */
const TD={id:"tordesillas",tour:"hgunpowder",title:"1492"};
{const REAL=-(46+37/60);
 const PL=[{n:"Azores",ll:[-25.67,37.74]},{n:"Cape Verde Islands",ll:[-23.6,15.1]},{n:"Brazil’s eastern tip",ll:[-34.79,-7.15]},{n:"Rio de Janeiro",ll:[-43.2,-22.9]},
  {n:"Mouth of the Amazon",ll:[-50.0,-0.2]},{n:"Buenos Aires",ll:[-58.38,-34.6]},{n:"Havana",ll:[-82.37,23.13]},{n:"Lima",ll:[-77.04,-12.05]}];
 let lon=-28,shown=false,moved=false;
 const deg=v=>Math.abs(v).toFixed(1).replace(/\.0$/,"")+"°"+(v<0?"W":"E");
 const meridian=x=>{const c=[];for(let la=72;la>=-60;la-=4)c.push([x,la]);return c};
 Object.assign(TD,{
  svg:'<path class="ihx-real-halo"/><path class="ihx-real"/><g class="ihx-tline"><path class="ihx-thit"/><path class="ihx-tshow"/></g><g class="ihx-tpl">'+PL.map(()=>'<circle r="7"/>').join("")+'</g>',
  html:'<div class="ihx-grip">⟷ drag the line</div><div class="ihx-lab ihx-side-l">◀ Spain</div><div class="ihx-lab ihx-side-r">Portugal ▶</div><div class="ihx-lab ihx-real-lab">1494: 370 leagues west of Cape Verde</div>'+PL.map((p,i)=>'<div class="ihx-lab ihx-plab" data-i="'+i+'">'+esc(p.n)+'</div>').join(""),
  card:'<div class="ihx-tip">📜 In 1494 Spain and Portugal split the new lands with a line. Drag the purple line: west is Spain’s, east is Portugal’s. Where did they put it?</div>'+
   '<div class="ihx-big ihx-tlon"></div><div class="ihx-split"></div><div class="ihx-row2"><button type="button" class="ihx-btn ihx-reveal">Show the real line of 1494</button></div><div class="ihx-fb"></div>',
  reset(){lon=-28;shown=false;moved=false},
  mount(L){dragger(L.q(".ihx-tline"),{move(cx,cy){const ll=unproj(cx,cy);if(ll){lon=Math.max(-100,Math.min(10,ll[0]));moved=true}}})},
  wire(c){c.querySelector(".ihx-reveal").onclick=()=>{shown=!shown;dirty();TD.card_()}},
  card_(){const fb=C(".ihx-fb"),b=C(".ihx-reveal");if(!fb)return;if(b)b.textContent=shown?"Hide the real line":"Show the real line of 1494";
   if(!shown){fb.style.display="none";return}fb.style.display="";const off=lon-REAL,km=Math.abs(off)*111.32;
   fb.innerHTML='<b>The real line: about 46°37′W</b>, 370 leagues west of the Cape Verde Islands. '+(Math.abs(off)<1.5?'You were spot on!':'Yours is '+Math.abs(off).toFixed(1)+'° too far '+(off>0?"east":"west")+', about '+fmtKm(km)+' at the equator.')+
    ' The pope’s line of 1493 was only 100 leagues out; Portugal pushed it west, and so Brazil’s bulge fell on Portugal’s side. When Cabral landed there in 1500, it became Portuguese: that is why Brazilians speak Portuguese.';flash(".ihx-fb")},
  draw(L){const m=meridian(lon),d=lineD(m);L.q(".ihx-thit").setAttribute("d",d);L.q(".ihx-tshow").setAttribute("d",d);
   const rd=shown?lineD(meridian(REAL)):"";L.q(".ihx-real").setAttribute("d",rd);L.q(".ihx-real-halo").setAttribute("d",rd);
   const gq=P([lon,24]);place(L.q(".ihx-grip"),gq,0,0);place(L.q(".ihx-side-l"),P([lon,42]),-58,0);place(L.q(".ihx-side-r"),P([lon,42]),64,0);
   place(L.q(".ihx-real-lab"),shown?P([REAL,52]):null,0,0);
   const dots=L.q(".ihx-tpl").children,sp=[],po=[];
   PL.forEach((p,i)=>{const q=P(p.ll),c=dots[i],lab=L.q('.ihx-plab[data-i="'+i+'"]'),port=p.ll[0]>lon;(port?po:sp).push(p.n);
    if(!q){c.style.display="none";lab.style.display="none";return}c.style.display="";c.setAttribute("cx",q[0]);c.setAttribute("cy",q[1]);c.setAttribute("class",port?"ihx-pt-p":"ihx-pt-s");
    lab.className="ihx-lab ihx-plab "+(port?"ihx-plab-p":"ihx-plab-s");place(lab,q,0,-10)});
   setHTML(".ihx-tlon",'Your line: <b>'+deg(lon)+'</b>'+(moved?"":' <small>(drag it on the map)</small>'));
   setHTML(".ihx-split",'<div class="ihx-col ihx-col-s"><b>Spain gets</b>'+(sp.length?sp.map(esc).join(", "):"none of these")+'</div><div class="ihx-col ihx-col-p"><b>Portugal gets</b>'+(po.length?po.map(esc).join(", "):"none of these")+'</div>')}});
 DEFS.push(TD);
 /* the stop has no 1494 line of its own, so nothing to hide: this file draws the real line when asked */
}

/* ================= 5. The Suez Canal: a race to Bombay =================
   The two routes are the stop's own (London to Bombay round the Cape of Good Hope, and through the canal). Distances are
   measured along them on the globe, so they are only as exact as those lines; the stop's own figure is "about 40%" shorter.
   The canal opened on 17 November 1869 and was 164 km long (Suez Canal Authority; Britannica). */
const SZ={id:"suez",tour:"hrevolutions",title:"The Suez Canal"};
{const CAPE=[[-0.1,51.5],[-9,45],[-12,30],[-20,15],[-12,0],[5,-25],[18.5,-35.5],[35,-30],[50,-15],[60,5],[72.88,18.94]];
 const SUEZ=[[-0.1,51.5],[-9,45],[-9.5,38],[-5.35,36],[10,37.5],[25,34],[32.3,31.26],[32.55,29.97],[38,20],[43.4,12.6],[50,13],[60,16],[72.88,18.94]];
 let A=null,B=null,X=0,LA=0,LB=0;/* X: km each ship has sailed */
 function build(){if(A)return;A=sampleRoute(CAPE,.01);B=sampleRoute(SUEZ,.01);LA=A[A.length-1].d;LB=B[B.length-1].d}
 Object.assign(SZ,{
  svg:'<path class="ihx-wake-halo ihx-wa"/><path class="ihx-wake ihx-cape"/><path class="ihx-wake-halo ihx-wb"/><path class="ihx-wake ihx-suez"/>'+
   '<g class="ihx-ship ihx-sa"><circle class="ihx-hit" r="24"/>'+STEAMER+'</g><g class="ihx-ship ihx-sb"><circle class="ihx-hit" r="24"/>'+STEAMER+'</g>',
  html:'<div class="ihx-lab ihx-la">Round Africa</div><div class="ihx-lab ihx-lb">Via Suez</div><div class="ihx-hint">Drag a ship ⟶</div>',
  card:'<div class="ihx-tip">🚢 Two ships, same speed, London to Bombay: press ▶ or drag one.</div>'+playRow("0 km","Distance sailed")+
   '<div class="ihx-race"><div class="ihx-lane ihx-lane-b"><span>Via Suez</span><div class="ihx-bar"><i></i></div><em></em></div><div class="ihx-lane ihx-lane-a"><span>Round Africa</span><div class="ihx-bar"><i></i></div><em></em></div></div><div class="ihx-fb"></div>',
  reset(){build();X=0},
  mount(L){build();const drag=(S,L0)=>({start(){SZ.playing=false;btn(SZ)},move(cx,cy){const k=along(S,"d",Math.min(X,L0)).k,b=nearestSample(S,k,cx,cy,80);if(b>=0)X=S[b].d}});
   dragger(L.q(".ihx-sa"),drag(A,LA));dragger(L.q(".ihx-sb"),drag(B,LB))},
  wire(c){wirePlay(c,SZ,()=>X/LA,u=>{X=u*LA})},
  tick(dt){X=Math.min(LA,X+dt*LA/30);if(X>=LA){SZ.playing=false;btn(SZ)}dirty()},
  draw(L){const a=along(A,"d",Math.min(X,LA)),b=along(B,"d",Math.min(X,LB));
   const wa=A.slice(0,a.k+1).map(s=>s.ll).concat([a.ll]),wb=B.slice(0,b.k+1).map(s=>s.ll).concat([b.ll]);
   const da=lineD(wa),db=lineD(wb);L.q(".ihx-cape").setAttribute("d",da);L.q(".ihx-wa").setAttribute("d",da);L.q(".ihx-suez").setAttribute("d",db);L.q(".ihx-wb").setAttribute("d",db);
   [[".ihx-sa",a,A,LA,".ihx-la"],[".ihx-sb",b,B,LB,".ihx-lb"]].forEach(([sel,st,S,L0,lab])=>{const q=P(st.ll),el=L.q(sel);if(!q){el.style.display="none";L.q(lab).style.display="none";return}
    el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");
    const p0=P(along(S,"d",Math.max(0,Math.min(X,L0)-150)).ll),p1=P(along(S,"d",Math.min(L0,X+150)).ll);if(p0&&p1&&Math.abs(p1[0]-p0[0])>1)el.querySelector(".ihx-hull").setAttribute("transform","scale("+(p1[0]>=p0[0]?1:-1)+",1)");
    L.q(lab).textContent=(sel===".ihx-sa"?"Round Africa":"Via Suez")+(X>=L0?" ✓ Bombay!":"");place(L.q(lab),q,0,-26)});
   place(L.q(".ihx-hint"),X<1?P(SUEZ[0]):null,30,-30);
   syncRange(X/LA);setText(".ihx-val",fmtKm(X));
   const lane=(sel,L0)=>{const f=Math.min(1,X/L0),e=C(sel+" i");if(e)e.style.width=(f*100).toFixed(1)+"%";setText(sel+" em",X>=L0?"arrived · "+fmtKm(L0):fmtKm(L0-Math.min(X,L0))+" to go")};
   lane(".ihx-lane-b",LB);lane(".ihx-lane-a",LA);
   const fb=C(".ihx-fb");if(fb){if(X>=LB){fb.style.display="";setHTML(".ihx-fb",'<b>Through the canal: '+fmtKm(LB)+'. Round Africa: '+fmtKm(LA)+'.</b> The 164 km canal, opened in 1869, cuts the voyage by about '+Math.round((1-LB/LA)*100)+'%. '+(X<LA?'When the Suez ship reaches Bombay, the other is still off '+(a.ll[1]<-20?"southern Africa":"Africa")+'.':''))}else fb.style.display="none"}}});
 DEFS.push(SZ)}

/* ================= 6. Voyagers of the open Pacific: who got where, when =================
   Lapita settlement: P. V. Kirch, "On the Road of the Winds" (2nd ed., 2017): Bismarck Archipelago about 1350 BC; Vanuatu
   and Fiji about 1000 BC; Tonga about 900 BC (Nukuleka, dated by Burley et al., PLoS ONE 2012, to about 2,840 years ago);
   Samoa about 800 BC. East Polynesia: Wilmshurst et al., PNAS 108 (2011): Society Islands AD 1025–1120, then Hawaii,
   Rapa Nui and New Zealand AD 1190–1290 (New Zealand given as about 1250–1300, as on the stop). Each island appears at the
   start of its range. Distances are measured on the globe between the places shown. */
const PV={id:"pacific",tour:"hoceania",title:"Voyagers of the open Pacific"};
{const IS=[
  {n:"Bismarck Archipelago",p:"t",ll:[150.5,-3.5],y:-1350,d:"about 1350 BC",t:"The Lapita people, known for their finely stamped pottery, live in the islands off New Guinea."},
  {n:"Vanuatu",p:"l",ll:[168.3,-17.7],y:-1000,d:"about 1000 BC",f:0,t:"Lapita canoes sail far out of sight of land, beyond any island people had reached before."},
  {n:"Fiji",p:"t",ll:[177.4,-18.0],y:-1000,d:"about 1000 BC",f:1,t:""},
  {n:"Tonga",p:"b",ll:[-175.2,-21.1],y:-900,d:"about 900 BC",f:2,t:"They reach Tonga…"},
  {n:"Samoa",p:"t",ll:[-172.0,-13.85],y:-800,d:"about 800 BC",f:3,t:"…and Samoa. Then, for about 1,800 years, nobody goes further east: ‘the long pause’. Their Polynesian culture grows up here."},
  {n:"Tahiti (Society Islands)",p:"t",ll:[-151.5,-16.6],y:1025,d:"about 1025–1120 AD",f:4,t:"At last Polynesians sail east again, to the Society Islands."},
  {n:"Hawaii",p:"t",ll:[-155.5,19.6],y:1190,d:"about 1190–1290 AD",f:5,t:"Within a few generations they find every last corner of the triangle: Hawaii, Rapa Nui…"},
  {n:"Rapa Nui (Easter Island)",p:"t",ll:[-109.35,-27.1],y:1190,d:"about 1190–1290 AD",f:5,t:""},
  {n:"New Zealand (Aotearoa)",p:"r",ll:[174.8,-36.8],y:1250,d:"about 1250–1300 AD",f:5,t:"…and New Zealand, the last large land on Earth to be settled."}];
 const Y0=-1400,Y1=1300;let Y=Y0,lastEv=-1,follows=false;
 const yr=y=>y<0?(-y)+" BC":y+" AD";
 const evAt=y=>{let k=-1;IS.forEach((e,i)=>{if(e.y<=y&&e.t)k=i});return k};
 Object.assign(PV,{
  svg:'<g class="ihx-arcs">'+IS.map(()=>'<path/>').join("")+'</g><g class="ihx-isl">'+IS.map(()=>'<g><circle class="ihx-glow" r="13"/><circle class="ihx-dotp" r="6"/></g>').join("")+'</g>',
  html:IS.map((e,i)=>'<div class="ihx-lab ihx-ilab ihx-at-'+e.p+'" data-i="'+i+'"></div><div class="ihx-lab ihx-km" data-i="'+i+'"></div>').join(""),
  card:'<div class="ihx-tip">🛶 Slide through the years, or press ▶, to see who got where, when.</div>'+playRow("1400 BC","Year")+
   '<div class="ihx-big ihx-pstat"></div><div class="ihx-ev"><b></b><span></span></div>',
  reset(){Y=Y0;lastEv=-2;follows=false},
  wire(c){wirePlay(c,PV,()=>(Y-Y0)/(Y1-Y0),u=>{Y=Y0+u*(Y1-Y0);follows=true});lastEv=-2},
  tick(dt){Y=Math.min(Y1,Y+dt*90);follows=true;if(Y>=Y1){PV.playing=false;btn(PV)}dirty()},
  draw(L){if(follows){let la=null;IS.forEach(e=>{if(e.y<=Y)la=e.ll});if(la&&keepVisible(la)&&!PV.playing)follows=false}const arcs=L.q(".ihx-arcs").children,dots=L.q(".ihx-isl").children;let n=0,longest=0;
   IS.forEach((e,i)=>{const on=e.y<=Y,q=P(e.ll),dot=dots[i],lab=L.q('.ihx-ilab[data-i="'+i+'"]'),kl=L.q('.ihx-km[data-i="'+i+'"]');if(on)n++;
    if(q){dot.style.display="";dot.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");dot.setAttribute("class",on?(Y-e.y<120?"ihx-on ihx-fresh":"ihx-on"):"ihx-off")}else dot.style.display="none";
    if(on&&q){const fr=Y-e.y<300,h=esc(e.n)+(fr?'<small>'+esc(e.d)+'</small>':'');if(lab.innerHTML!==h)lab.innerHTML=h;lab.classList.toggle("ihx-lab-cur",fr);const o={l:[-12,0],r:[12,0],t:[0,-12],b:[0,12]}[e.p];place(lab,q,o[0],o[1])}else lab.style.display="none";
    const arc=arcs[i];if(e.f!=null&&on){const a=IS[e.f].ll,dist=kmBetween(a,e.ll);longest=Math.max(longest,dist);arc.setAttribute("d",lineD([a,e.ll]));arc.setAttribute("class","ihx-arc");
     const mid=d3.geoInterpolate(a,e.ll)(.5),mq=P(mid);if(dist>3000&&mq){kl.textContent=fmtKm(Math.round(dist/100)*100);place(kl,mq,0,0)}else kl.style.display="none"}else{arc.setAttribute("d","");kl.style.display="none"}});
   syncRange((Y-Y0)/(Y1-Y0));setText(".ihx-val",yr(Math.round(Y/10)*10||10));
   setHTML(".ihx-pstat",'<b>'+n+'</b> of '+IS.length+' island groups reached'+(longest?' · longest jump: <b>'+fmtKm(Math.round(longest/100)*100)+'</b> of open sea':''));
   const ek=evAt(Y);if(ek!==lastEv){lastEv=ek;if(ek<0){setText(".ihx-ev b","Before the voyages");setText(".ihx-ev span","East of the Solomon Islands, no one has ever lived on the Pacific’s islands.")}else{const E=IS[ek];setText(".ihx-ev b",E.d+" · "+E.n);setText(".ihx-ev span",E.t)}flash(".ihx-ev")}}});
 DEFS.push(PV);hideOwn(PV.tour,PV.title,null,null)}

/* ================= styles ================= */
{const s=document.createElement("style");s.textContent=`
.ihx-layer{position:absolute;inset:0;pointer-events:none;z-index:6}/* under the tour card (7) */
.ihx-svg{position:absolute;left:0;top:0;overflow:visible}.ihx-html{position:absolute;left:0;top:0;width:0;height:0}
.ihx-route{fill:none;stroke:rgba(255,255,255,.6);stroke-width:1.6;stroke-dasharray:4 5}
.ihx-wake-halo{fill:none;stroke:rgba(255,255,255,.85);stroke-width:5.5;stroke-linecap:round;stroke-linejoin:round}
.ihx-wake{fill:none;stroke:#d9682b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.ihx-wake.ihx-cape{stroke:#7a4fd0}.ihx-wake.ihx-suez{stroke:#d9682b}
.ihx-ship{pointer-events:all;cursor:grab;touch-action:none;outline:none}.ihx-ship.ihx-dragging{cursor:grabbing}
.ihx-hit{fill:rgba(255,255,255,.001)}.ihx-hull{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.ihx-ship:hover .ihx-hull,.ihx-ship:focus-visible .ihx-hull{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.ihx-badge rect{fill:#13294b}.ihx-badge text{fill:#fff;font:800 10.5px system-ui,sans-serif}
.ihx-evd{fill:#fff;stroke:#13294b;stroke-width:1.4}.ihx-evd-done{fill:#d9682b;stroke:#fff;stroke-width:1.4}
.ihx-bub{position:absolute;transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:13.5px;padding:5px 11px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.ihx-hint,.ihx-grip{position:absolute;background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);white-space:nowrap;animation:ihxNudge 1.4s ease-in-out infinite}
.ihx-grip{transform:translate(-50%,-50%);color:#4a2a7a}
@keyframes ihxNudge{50%{margin-left:6px}}
.ihx-lab{position:absolute;transform:translate(-50%,-100%);background:rgba(255,255,255,.95);color:#13294b;font:800 13px/1.15 system-ui,sans-serif;padding:3px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.ihx-lab small{display:block;font-weight:700;font-size:11px;color:#9a4a16;text-align:center}
.ihx-lab-stop{background:#c62828;color:#fff}.ihx-lab-home{background:#13294b;color:#fff}
.ihx-ray{fill:none;stroke:rgba(214,120,30,.55);stroke-width:1.6}.ihx-ray-new{stroke:#e8701a;stroke-width:2.6}
.ihx-pt circle:not(.ihx-glow){fill:#e8701a;stroke:#fff;stroke-width:2}.ihx-glow{fill:rgba(232,112,26,0)}
.ihx-fresh .ihx-glow{fill:rgba(232,112,26,.35);animation:ihxPulse 1.2s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ihxPulse{from{transform:scale(.5);opacity:1}to{transform:scale(1.6);opacity:0}}
.ihx-x circle{fill:#c62828;stroke:#fff;stroke-width:2}.ihx-x path{stroke:#fff;stroke-width:2.6;stroke-linecap:round}
.ihx-home circle{fill:#13294b;stroke:#fff;stroke-width:2}.ihx-home text{fill:#ffd166;font:800 11px system-ui,sans-serif}
.ihx-city{pointer-events:all;cursor:pointer}.ihx-city .ihx-dot{stroke:#13294b;stroke-width:2}.ihx-city text{font:900 11px system-ui,sans-serif;pointer-events:none}
.ihx-city .ihx-ring{fill:rgba(255,255,255,.001);stroke:none}.ihx-city.ihx-cur .ihx-ring{fill:rgba(255,209,102,.35);stroke:#ffb703;stroke-width:3;animation:ihxRing 1.3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ihxRing{50%{transform:scale(1.25)}}
.ihx-clab{font-size:11.5px;padding:2px 7px}.ihx-at-l{transform:translate(-100%,-50%)}.ihx-at-r{transform:translate(0,-50%)}.ihx-at-b{transform:translate(-50%,0)}.ihx-lab-cur{background:#ffb703;color:#13294b;font-size:14.5px}
.ihx-tline{pointer-events:all;cursor:ew-resize;touch-action:none}.ihx-thit{fill:none;stroke:rgba(255,255,255,.001);stroke-width:26}
.ihx-tshow{fill:none;stroke:#4a2a7a;stroke-width:3.5;filter:drop-shadow(0 0 2px #fff)}.ihx-tline:hover .ihx-tshow,.ihx-tline.ihx-dragging .ihx-tshow{stroke-width:5}
.ihx-real{fill:none;stroke:#f6c445;stroke-width:3;stroke-dasharray:8 5}.ihx-real-halo{fill:none;stroke:rgba(0,0,0,.45);stroke-width:5.5}
.ihx-real-lab{background:#f6c445;color:#3b2a00;transform:translate(-50%,-50%)}
.ihx-side-l,.ihx-side-r{transform:translate(-50%,-50%);font-size:14px}.ihx-side-l{background:#c8102e;color:#fff}.ihx-side-r{background:#1f7a3f;color:#fff}
.ihx-pt-s{fill:#c8102e;stroke:#fff;stroke-width:2}.ihx-pt-p{fill:#1f7a3f;stroke:#fff;stroke-width:2}
.ihx-plab{font-size:12px}.ihx-plab-s{border:2px solid #c8102e}.ihx-plab-p{border:2px solid #1f7a3f}
.ihx-arc{fill:none;stroke:#d9682b;stroke-width:2.6;stroke-dasharray:7 5;stroke-linecap:round;filter:drop-shadow(0 0 2px rgba(255,255,255,.9))}
.ihx-isl .ihx-dotp{fill:#d9682b;stroke:#fff;stroke-width:2}.ihx-isl .ihx-off .ihx-dotp{fill:rgba(255,255,255,.35);stroke:rgba(255,255,255,.85);stroke-dasharray:3 2}
.ihx-km{transform:translate(-50%,-50%);background:#13294b;color:#fff;font-size:12px}
body.ihx-on .ps-leaders{opacity:.5}
.ihx-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12);font-size:14px;line-height:1.4}
.ihx-tip{font-weight:700;font-size:13.5px;color:#9a4a16;margin-bottom:8px}
.ihx-row{display:flex;align-items:center;gap:10px}
.ihx-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.ihx-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.ihx-val{flex:0 0 auto;font-weight:800;font-size:15px;color:#13294b;white-space:nowrap;min-width:4.5em;text-align:right}
.ihx-big{margin-top:8px;font-size:14px}.ihx-big b{font-size:18px;color:#d9682b}.ihx-big small{opacity:.7}
.ihx-ships{display:flex;gap:4px;margin-top:8px}.ihx-ships span{flex:1;text-align:center;font-size:20px;line-height:1;transition:opacity .3s}
.ihx-ships i{display:block;font-style:normal;font-size:9.5px;font-weight:700;opacity:.8;margin-top:2px;white-space:nowrap}
.ihx-ships .ihx-lost{opacity:.25;filter:grayscale(1)}.ihx-ships .ihx-lost i{text-decoration:line-through}
.ihx-ev{margin-top:8px}.ihx-ev b{display:block;font-size:14.5px}
.ihx-new{animation:ihxIn .45s ease}@keyframes ihxIn{from{opacity:.2;transform:translateY(4px)}}
.ihx-q{font-size:15px;margin-bottom:8px}
.ihx-sides{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.ihx-side{border:2px solid var(--c);background:#fff;color:var(--c);border-radius:10px;padding:6px 4px;cursor:pointer;font:inherit;line-height:1.15}
.ihx-side b{display:block;font-size:15px}.ihx-side small{font-size:11px;opacity:.85}
.ihx-side:hover:not(:disabled){background:var(--c);color:#fff}.ihx-side:disabled{cursor:default;opacity:.45}
.ihx-side.ihx-right{background:var(--c);color:#fff;opacity:1}.ihx-side.ihx-wrong{opacity:1;text-decoration:line-through}
.ihx-fb{margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.75);font-size:13.5px}
.ihx-fb:empty{display:none}
.ihx-next,.ihx-btn{border:0;background:#13294b;color:#fff;font:800 13px system-ui,sans-serif;padding:6px 12px;border-radius:999px;cursor:pointer;margin-top:6px}
.ihx-score{margin-top:6px;font-size:12.5px;font-weight:700;opacity:.75}
.ihx-split{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;font-size:13px}
.ihx-col{padding:6px 8px;border-radius:8px}.ihx-col b{display:block;font-size:13.5px}.ihx-col-s{background:rgba(200,16,46,.1);border-left:4px solid #c8102e}.ihx-col-p{background:rgba(31,122,63,.1);border-left:4px solid #1f7a3f}
.ihx-row2{margin-top:4px}
.ihx-race{margin-top:8px;display:grid;gap:6px}
.ihx-lane{display:grid;grid-template-columns:6.5em 1fr;align-items:center;gap:2px 8px;font-size:13px;font-weight:700}
.ihx-lane em{grid-column:2;font-style:normal;font-size:12px;opacity:.8}
.ihx-bar{height:10px;border-radius:5px;background:rgba(19,41,75,.12);overflow:hidden}.ihx-bar i{display:block;height:100%;width:0}
.ihx-lane-a .ihx-bar i{background:#7a4fd0}.ihx-lane-b .ihx-bar i{background:#d9682b}
body.dark-theme .ihx-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark-theme .ihx-val{color:#fff}body.dark-theme .ihx-tip{color:#ffb27a}
body.dark-theme .ihx-fb{background:rgba(0,0,0,.25)}body.dark-theme .ihx-side{background:transparent}
body.dark-theme .ihx-side:not(.ihx-right){color:#fff}`;document.head.appendChild(s)}
window.gfInteractHist={defs:DEFS,current:()=>cur};
})();
/* The "Empires & independence" tour (hempires) is linked from the home page but was missing from PS_TOUR_ORDER, so starting it
   fell back to the first history tour (Ancient civilisations). Put it back, right after hancient, once the page has finished
   rebuilding the order list. */
(function(){function fix(){try{if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined"||!PS_TOURS.hempires)return;if(PS_TOUR_ORDER.includes("hempires"))return;const i=PS_TOUR_ORDER.indexOf("hancient");PS_TOUR_ORDER.splice(i>=0?i+1:PS_TOUR_ORDER.length,0,"hempires")}catch(e){}}
 fix();document.addEventListener("DOMContentLoaded",fix);addEventListener("load",()=>{fix();setTimeout(fix,1500);setTimeout(fix,6000)});
 try{if(typeof psStart==="function"){const _s=psStart;psStart=function(){fix();return _s.apply(this,arguments)}}}catch(e){}})();
