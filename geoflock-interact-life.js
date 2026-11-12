/* GeoFlock: six tour stops (life science, culture and the book tours) that the reader plays with, not just reads.
   Each one puts a layer over the globe and a small control block on the card (just under the stop's headline):
   - amigration | "The Arctic tern": a tern you drag through its year (or a month slider, or Play). Two buttons pick the way
     south, down Africa or down Brazil. The card names the month, where the bird is, and how many hours of daylight it has
     there that day, next to London's, so you can see why the tern lives in almost endless summer.
   - b80days | "The timetable": race Phileas Fogg against the clock. Drag him (or the slider, or Play) round the world; the
     card counts the days left out of 80, tells each leg as he reaches it with how far ahead or behind he is, and, after the
     Pacific, shows his diary drifting one day ahead of London's calendar: the twist of the book.
   - bbeagle | "Tortoises, mockingbirds and finches": sail the Beagle to the four islands Darwin landed on (drag the ship, click
     an island, or "Sail on"). Each landing puts that island's mockingbird in a specimen drawer on the card, coloured by kind:
     four islands, three kinds, Darwin's first real clue that species change.
   - brihla | "The Travels of Ibn Battuta": walk the whole 29-year journey with a year counter, his age and the years away from
     home; each place is told as he reaches it. The stop's own route lines give way to this one route.
   - bplagues | "From Caffa to Europe, 1346–1351": a date slider (or Play) spreads the Black Death from Caffa city by city, each
     lit on the month it was struck, with a count on the card. Click a red city to read its date and story.
   - festivals | "Hogmanay and the race to midnight": a clock slider for New Year's Eve in UTC. Cities burst into fireworks as
     their own midnight comes, from Kiritimati to American Samoa, and the globe turns to follow midnight west.
   Like geoflock-odyssey.js: a watchdog polls the tour (ps), mounts the layer in amGlobe.host when one of these stops shows in
   globe mode, redraws when the view changes, and removes everything (layer, card block, styles on body) as soon as the stop
   changes. Next and Back are never blocked, and every step is wrapped in try/catch.
   Sources are named beside each set of figures below. */
(function(){
"use strict";
if(window.gfInteractLife)return;
const RAD=180/Math.PI;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host?amGlobe:null}catch(e){return null}};
function stopKey(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return"";const S=psSteps()[ps.i];return S?ps.tour+"|"+S.title:""}catch(e){return""}}
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
const MO3=MON.map(m=>m.slice(0,3)),WD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* ======================= shared: a route with times, sampled along great circles ======================= */
/* legs: [[icon, [pt, pt, ...]], ...]; a pt is [lon,lat] or {ll,t,hold,ev}. t (the clock: days, years...) is given at some
   points and spread by distance between them; hold = wait there until that time; ev = an episode told when reached. */
function journey(legs){const pts=[],evs=[];
 legs.forEach(([ic,list],li)=>list.forEach((p,k)=>{if(li>0&&k===0&&pts.length){const q=Array.isArray(p)?{ll:p}:p,last=pts[pts.length-1];
   if(Math.abs(q.ll[0]-last.ll[0])<1e-6&&Math.abs(q.ll[1]-last.ll[1])<1e-6){Object.assign(last,{t:q.t!=null?q.t:last.t,hold:q.hold!=null?q.hold:last.hold,ev:q.ev||last.ev});last.ic=ic;return}}
  const q=Array.isArray(p)?{ll:p}:Object.assign({},p);q.ic=ic;pts.push(q)}));
 /* expand holds into a second point at the same place */
 const P=[];pts.forEach(p=>{P.push(p);if(p.hold!=null)P.push({ll:p.ll,t:p.hold,ic:p.ic,still:1})});
 const cum=[0];for(let i=1;i<P.length;i++)cum[i]=cum[i-1]+d3.geoDistance(P[i-1].ll,P[i].ll);
 let a=0;for(let i=1;i<P.length;i++)if(P[i].t!=null){for(let k=a+1;k<i;k++)P[k].t=P[a].t+(P[i].t-P[a].t)*((cum[k]-cum[a])/((cum[i]-cum[a])||1));a=i}
 const S=[];for(let i=0;i<P.length-1;i++){const A=P[i],B=P[i+1],d=d3.geoDistance(A.ll,B.ll)*RAD,m=Math.max(1,Math.ceil(d/.7)),ip=d3.geoInterpolate(A.ll,B.ll);
  for(let k=0;k<m;k++)S.push({ll:k?ip(k/m):A.ll,t:A.t+(B.t-A.t)*k/m,ic:A.ic});}
 const L=P[P.length-1];S.push({ll:L.ll,t:L.t,ic:L.ic});
 P.forEach(p=>{if(p.ev&&!p.still)evs.push(Object.assign({t:p.t,ll:p.ll},p.ev))});
 return{S,evs,t0:S[0].t,t1:L.t}}
function jAt(J,t){const S=J.S;if(t<=S[0].t)return{ll:S[0].ll,k:0,ic:S[0].ic};if(t>=S[S.length-1].t)return{ll:S[S.length-1].ll,k:S.length-1,ic:S[S.length-1].ic};
 let lo=0,hi=S.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(S[m].t<=t)lo=m;else hi=m}
 const A=S[lo],B=S[hi],f=B.t>A.t?(t-A.t)/(B.t-A.t):0;return{ll:f>0&&f<1?d3.geoInterpolate(A.ll,B.ll)(f):(f>=1?B.ll:A.ll),k:lo,ic:A.ic}}
function still(J,t,dt){const p=jAt(J,t).ll,q=jAt(J,t+dt).ll;return Math.abs(p[0]-q[0])<1e-7&&Math.abs(p[1]-q[1])<1e-7}
function evAt(J,t){let k=-1;J.evs.forEach((e,i)=>{if(e.t<=t+1e-6)k=i});return k}

/* ======================= the layer over the globe ======================= */
let A=null;/* the stop on screen: {key, M (its module), el, svg, ctl, T, playing, ...} */
function proj(ll){const g=G();if(!g)return null;try{if(!g._flat){const r=g.projection().rotate();if(d3.geoDistance([-r[0],-r[1]],ll)>Math.PI/2-.04)return null}
 const s=g.projection()(ll);if(!s||!isFinite(s[0])||!isFinite(s[1]))return null;return[s[0]+A.ox,s[1]+A.oy]}catch(e){return null}}
function pathOf(pts){let d="",pen=false,px=0,py=0;const g=G(),J=g&&g.size?g.size().w*.3:1e9;for(const ll of pts){const q=proj(ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
function viewKey(){const g=G();if(!g)return"";const hr=A.el.getBoundingClientRect();let k="";try{k=g.key?g.key():(g.rot||[]).join(",")+"/"+g.zoom+"/"+!!g._flat}catch(e){k=String(Math.random())}return k+"|"+Math.round(hr.width)+"x"+Math.round(hr.height)}

function mount(M){const g=G();if(!g)return false;
 if(A&&A.M===M&&A.el&&A.el.isConnected&&A.host===g.host)return true;
 const keep=A&&A.M===M?{T:A.T,st:A.st}:null;unmount();
 const el=document.createElement("div");el.className="gfl-layer";el.innerHTML='<svg class="gfl-svg"></svg><div class="gfl-html"></div>';
 /* under the tour card (same z-index, earlier in the page), over the map's own pins */
 let card=null;try{card=typeof ps!=="undefined"&&ps&&ps.card&&ps.card.parentNode===g.host?ps.card:null}catch(e){}g.host.insertBefore(el,card);
 A={key:M.key,M,host:g.host,el,svg:el.querySelector("svg"),html:el.querySelector(".gfl-html"),T:keep?keep.T:M.t0,st:keep?keep.st:{},playing:false,lastT:0,vk:"",dirty:true,raf:0,ox:0,oy:0};
 document.body.classList.add("gfl-on");if(M.noWalkers)document.body.classList.add("gfl-nowalk");
 try{M.mount(A)}catch(e){console.error(e)}loop();return true}
function unmount(){if(!A)return;const a=A;A=null;cancelAnimationFrame(a.raf);try{a.M.unmount&&a.M.unmount(a)}catch(e){}try{a.el.remove()}catch(e){}
 document.querySelectorAll(".gfl-ctl").forEach(c=>c.remove());document.body.classList.remove("gfl-on","gfl-nowalk")}
function loop(){if(!A)return;const a=A;a.raf=requestAnimationFrame(t=>{if(A!==a)return;try{
  if(a.playing){const dt=Math.min(.1,(t-(a.lastT||t))/1000),M=a.M;let sp=(M.t1-M.t0)/M.playSecs;if(M.fast&&M.fast(a))sp*=M.fast(a);a.T=Math.min(M.t1,a.T+dt*sp);a.dirty=true;if(a.T>=M.t1){a.playing=false;playBtn()}}
  a.lastT=t;const g=G();if(g){const hr=a.el.getBoundingClientRect(),cr=g.canvas.getBoundingClientRect();a.ox=cr.left-hr.left;a.oy=cr.top-hr.top;
   if(a.M.follow&&(a.playing||a._sl))follow(a);const vk=viewKey();if(vk!==a.vk||a.dirty){a.vk=vk;a.dirty=false;a.svg.setAttribute("width",hr.width);a.svg.setAttribute("height",hr.height);a.M.draw(a);cardUpdate()}}
 }catch(e){console.error(e)}loop()})}
/* while playing or sliding, the globe turns to keep the traveller in sight (not while the traveller itself is dragged) */
function follow(a){try{const g=G();if(!g||g._flat||!a.M.J)return;const now=performance.now();if(now-(a._fw||0)<400)return;a._fw=now;
 const ll=jAt(a.M.J(),a.T).ll,r=g.rot||[0,0],c=[-r[0],-r[1]];if(d3.geoDistance(c,ll)*RAD<32)return;
 const m=d3.geoInterpolate(c,ll)(.6),lat=Math.max(-62,Math.min(62,m[1]));g.rot=[-m[0],-lat].concat(r.length>2?[r[2]]:[]);g.request?g.request():g.render&&g.render()}catch(e){}}
function setT(t){if(!A)return;A.T=Math.max(A.M.t0,Math.min(A.M.t1,t));A.dirty=true}

/* ======================= the block on the card ======================= */
function playBtn(){const b=document.querySelector(".gfl-play");if(b&&A){b.textContent=A.playing?"❚❚":"▶";b.setAttribute("aria-label",A.playing?"Pause":"Play")}}
function ensureCard(){if(!A||typeof ps==="undefined"||!ps||!ps.card)return;if(ps.card.querySelector(".gfl-ctl"))return;const at=ps.card.querySelector(".ps-stat");if(!at)return;
 const M=A.M,c=document.createElement("div");c.className="gfl-ctl gflc-"+M.cls;
 c.innerHTML='<div class="gfl-do">'+M.instr+'</div>'+(M.top?'<div class="gfl-top"></div>':'')+
  (M.noSlider?'':'<div class="gfl-row"><button type="button" class="gfl-play" aria-label="Play">▶</button><input type="range" class="gfl-range" min="0" max="1000" step="1" value="0" aria-label="'+esc(M.sliderLabel||"Time")+'"></div>')+
  '<div class="gfl-count"></div><div class="gfl-ep"><b></b><span></span></div>'+(M.extra?'<div class="gfl-x"></div>':'')+(M.note?'<div class="gfl-note">'+M.note+'</div>':'');
 at.after(c);
 const pb=c.querySelector(".gfl-play");if(pb)pb.onclick=()=>{if(!A)return;if(A.T>=A.M.t1-1e-9)setT(A.M.t0);A.playing=!A.playing;A.lastT=0;playBtn()};
 const r=c.querySelector(".gfl-range");if(r){r.addEventListener("input",()=>{if(!A)return;A.playing=false;playBtn();A._sl=1;clearTimeout(A._slT);const a=A;A._slT=setTimeout(()=>{a._sl=0},700);setT(A.M.t0+(A.M.t1-A.M.t0)*r.value/1000)});
  ["pointerdown","mousedown","touchstart","click","keydown"].forEach(t=>r.addEventListener(t,e=>e.stopPropagation()))}
 c.addEventListener("click",e=>e.stopPropagation());
 try{M.cardInit&&M.cardInit(A,c)}catch(e){console.error(e)}A.cardSig="";cardUpdate()}
function cardUpdate(){if(!A)return;const c=document.querySelector(".gfl-ctl");if(!c)return;const M=A.M;
 const r=c.querySelector(".gfl-range");if(r&&document.activeElement!==r)r.value=Math.round((A.T-M.t0)/(M.t1-M.t0)*1000);
 let o={};try{o=M.card(A)||{}}catch(e){console.error(e)}
 const cn=c.querySelector(".gfl-count");if(o.count!=null&&cn.innerHTML!==o.count)cn.innerHTML=o.count;
 const sig=(o.head||"")+"\u0001"+(o.body||"");if(sig!==A.cardSig){A.cardSig=sig;const ep=c.querySelector(".gfl-ep");ep.querySelector("b").innerHTML=o.head||"";ep.querySelector("span").innerHTML=o.body||"";ep.classList.remove("gfl-new");void ep.offsetWidth;ep.classList.add("gfl-new")}
 const x=c.querySelector(".gfl-x");if(x&&o.extra!=null&&x._h!==o.extra){x._h=o.extra;x.innerHTML=o.extra}}

/* ======================= shared: a traveller that you drag along its route ======================= */
function travellerMount(a,o){/* o: {J:()=>journey, icon(a,ic) → svg string, hint, bubble(a) → text} */
 const s=a.svg;s.innerHTML='<path class="gfl-route"/><path class="gfl-wake-h"/><path class="gfl-wake"/><g class="gfl-evdots"></g>'+
  '<g class="gfl-trav" tabindex="0" role="slider" aria-label="'+esc(o.label||"Drag along the route")+'"><circle class="gfl-hit" r="28"/><g class="gfl-ic"></g></g>';
 a.h={route:s.querySelector(".gfl-route"),wake:s.querySelector(".gfl-wake"),wakeH:s.querySelector(".gfl-wake-h"),dots:s.querySelector(".gfl-evdots"),trav:s.querySelector(".gfl-trav"),ic:s.querySelector(".gfl-ic")};
 a.html.innerHTML='<div class="gfl-bub"></div><div class="gfl-hint">'+esc(o.hint||"Drag me")+'</div>';a.h.bub=a.html.querySelector(".gfl-bub");a.h.hint=a.html.querySelector(".gfl-hint");
 const tr=a.h.trav,M=a.M;
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();a.playing=false;playBtn();tr.classList.add("gfl-drag");a.st.touched=1;try{tr.setPointerCapture(e.pointerId)}catch(err){}
  const mv=ev=>{ev.stopPropagation();try{const J=o.J(),S=J.S,hr=a.el.getBoundingClientRect(),px=ev.clientX-hr.left,py=ev.clientY-hr.top,cur=jAt(J,a.T).k;
   let best=-1,bd=1e9;const W=Math.max(60,Math.round(S.length/8));for(let i=Math.max(0,cur-W);i<=Math.min(S.length-1,cur+W);i++){const q=proj(S[i].ll);if(!q)continue;const d=Math.hypot(q[0]-px,q[1]-py)+Math.abs(i-cur)*.08;if(d<bd){bd=d;best=i}}
   if(best<0||best===cur)return;setT(S[best].t)}catch(err){}};
  const up=()=>{tr.removeEventListener("pointermove",mv);tr.removeEventListener("pointerup",up);tr.removeEventListener("pointercancel",up);tr.classList.remove("gfl-drag")};
  tr.addEventListener("pointermove",mv);tr.addEventListener("pointerup",up);tr.addEventListener("pointercancel",up)};
 tr.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>tr.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}));
 tr.addEventListener("keydown",e=>{const st=(M.t1-M.t0)/100;if(e.key==="ArrowRight"||e.key==="ArrowUp"){setT(a.T+st);e.preventDefault()}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){setT(a.T-st);e.preventDefault()}})}
function travellerDraw(a,o){const J=o.J(),h=a.h,st=jAt(J,a.T);
 const rk=a.vk+"|"+(o.routeKey?o.routeKey(a):"");if(h._rk!==rk){h._rk=rk;h.route.setAttribute("d",o.noRoute?"":pathOf(J.S.map(s=>s.ll)));
  h.dots.innerHTML=J.evs.map((e,i)=>{const q=proj(e.ll);return q?'<circle class="gfl-evdot" data-i="'+i+'" cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="4.2"/>':""}).join("")}
 const wake=J.S.slice(0,st.k+1).map(s=>s.ll);wake.push(st.ll);const wd=pathOf(wake);h.wake.setAttribute("d",wd);h.wakeH.setAttribute("d",wd);
 const ek=evAt(J,a.T);h.dots.querySelectorAll(".gfl-evdot").forEach(d=>d.classList.toggle("gfl-reached",+d.dataset.i<=ek));
 const q=proj(st.ll);if(!q){h.trav.style.display="none";h.bub.style.display="none";h.hint.style.display="none";return}h.trav.style.display="";
 const ic=o.icon(a,st.ic);if(h._ic!==ic){h._ic=ic;h.ic.innerHTML=ic}h.trav.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");
 const b=o.bubble?o.bubble(a,ek):"";h.bub.style.display=b?"":"none";if(b){if(h.bub._b!==b){h.bub._b=b;h.bub.innerHTML=b}h.bub.style.left=q[0]+"px";h.bub.style.top=(q[1]-30)+"px"}
 h.hint.style.display=a.st.touched||a.T>a.M.t0+(a.M.t1-a.M.t0)*.01?"none":"";h.hint.style.left=(q[0]+32)+"px";h.hint.style.top=(q[1]-11)+"px"}
const EMO=(e,bg)=>'<circle r="17" class="gfl-icbg"'+(bg?' style="fill:'+bg+'"':"")+'/><text class="gfl-emo" y="7" text-anchor="middle">'+e+'</text>';

/* ======================= 1. amigration | The Arctic tern ======================= */
/* Timing and route: Egevang et al. (2010), "Tracking of Arctic terns Sterna paradisaea reveals longest animal migration",
   PNAS 107:2078–2081: terns from north-east Greenland left in late August, fed for a few weeks at a newly found stopover in the
   North Atlantic, went south along Africa or Brazil to the Weddell Sea pack ice for the southern summer, and came back in April–May
   on an S-shaped path, much faster than the way south (about 40 days, against about three months); 70,900 km a year on average.
   The waypoints are the tour's own (geoflock-tours-living.js); dates along the way are spread by distance between those stages.
   Daylight is worked out from the sun's position (the standard sunrise equation, with 0.83° for refraction and the sun's disc). */
const TERN={key:"amigration|The Arctic tern",follow:1,cls:"tern",t0:0,t1:365,playSecs:40,noWalkers:1,sliderLabel:"Month of the tern’s year",
 instr:"🐦 Drag the tern, or press ▶, to fly through its year. Pick its way south:",top:1,
 note:"Source: Egevang et al. 2010 (PNAS), terns tracked from Greenland. Daylight is worked out for the tern’s spot on that day.",
 J(){const a=this._route||"af";if(this._J&&this._J.r===a)return this._J;
  const N=d=>d;/* t = days since 1 June */
  const start=[{ll:[-20,74],t:0,hold:80,ev:{n:"Nesting in Greenland",x:"June and July in north-east Greenland: the sun never sets, and the sea is full of small fish for the chicks."}},
   [-24,66],[-30,55],{ll:[-35,46],t:N(92),hold:N(115),ev:{n:"Stopover: mid-Atlantic",x:"Late August: off south. First a few weeks feeding in a rich patch of the North Atlantic, a stopover nobody knew about until birds carried trackers."}},
   [-25,35],[-20,22],{ll:[-19,12],t:N(131),ev:{n:"Off West Africa",x:"Here the birds split. Some follow the coast of Africa, others cross to Brazil. Try both buttons."}}];
  const AF=[[-5,0],[5,-15],[12,-35],[0,-55]],SA=[[-30,0],[-38,-15],[-48,-35],[-55,-50],[-40,-62]];
  const win={ll:[-25,-68],t:N(172),hold:N(315),ev:{n:"Antarctic summer",x:"By late November: the edge of the pack ice in the Weddell Sea. It is summer here now, with daylight almost round the clock. The terns stay about five months."}};
  const back=[{ll:[-25,-68]},[-15,-50],[-10,-25],{ll:[-25,0],ev:{n:"An S across the Atlantic",x:"April: north again, on an S-shaped path that crosses from east to west near the equator, riding the winds. The trip home is much faster: about 40 days."}},[-40,20],[-45,35],[-38,48],[-30,60],
   {ll:[-20,74],t:N(356),hold:365,ev:{n:"Home in Greenland",x:"Late May: back at the colony for another Arctic summer. The tracked terns flew 70,900 km in the year on average: the longest migration known."}}];
  const J=journey([["t",start.concat(a==="af"?AF:SA,[win])],["t",back]]);J.r=a;this._J=J;return J},
 icon(){return'<g class="gfl-ternic"><path d="M-17 -2 Q-6 -16 3 -3 Q10 -14 19 -12 Q11 -6 7 1 Q2 6 -4 4 Q-11 3 -17 -2 Z" fill="#fff" stroke="#3a4651" stroke-width="1.1"/><path d="M-4 4 Q-10 9 -16 9 M-2 4 Q-6 10 -9 12" stroke="#3a4651" stroke-width="1.2" fill="none"/><path d="M6 -2 Q9 -6 13 -4 Q11 -1 7 0 Z" fill="#111"/><path d="M12 -3.5 L18 -2" stroke="#e23b2a" stroke-width="2.2" stroke-linecap="round"/></g>'},
 mount(a){this._route=a.st.route||"af";travellerMount(a,{J:()=>this.J(),hint:"Drag the tern ⟶",label:"Arctic tern: drag to fly through the year"})},
 draw(a){travellerDraw(a,{J:()=>this.J(),routeKey:()=>this._route,icon:()=>this.icon(),bubble:(a,ek)=>{const J=this.J(),e=J.evs[ek];if(!e)return"";return a.T-e.t<14||still(J,a.T,.5)?esc(e.n):""}})},
 cardInit(a,c){const t=c.querySelector(".gfl-top");t.innerHTML='<div class="gfl-seg" role="group" aria-label="Way south"><button type="button" data-r="af">Down Africa</button><button type="button" data-r="sa">Down Brazil</button></div>';
  const sync=()=>t.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.r===this._route));sync();
  t.querySelectorAll("button").forEach(b=>b.onclick=e=>{e.stopPropagation();this._route=a.st.route=b.dataset.r;a.h._rk="";a.dirty=true;sync();if(a.T<131)setT(140)})},
 fast(a){return still(this.J(),a.T,1)?3:1},
 card(a){const J=this.J(),doy=(151+Math.floor(a.T))%365,dt=new Date(Date.UTC(2025,0,1)+doy*864e5),ll=jAt(J,a.T).ll,ek=evAt(J,a.T),e=J.evs[ek]||{};
  const h=dayLen(ll[1],doy+1),hl=dayLen(51.5,doy+1),bar=v=>'<span class="gfl-bar"><i style="width:'+(v/24*100).toFixed(1)+'%"></i></span>';
  return{count:'<span class="gfl-big">'+dt.getUTCDate()+" "+MON[dt.getUTCMonth()]+'</span><span class="gfl-sub">'+latTxt(ll[1])+'</span>'+
   '<div class="gfl-day"><span>☀️ Tern’s daylight</span>'+bar(h)+'<b>'+hrs(h)+'</b></div><div class="gfl-day gfl-day2"><span>London’s</span>'+bar(hl)+'<b>'+hrs(hl)+'</b></div>',head:esc(e.n||""),body:esc(e.x||"")}}};
function dayLen(lat,doy){const dec=-23.44*Math.cos(2*Math.PI/365*(doy+10))/RAD,phi=lat/RAD,c=(Math.sin(-.833/RAD)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec));
 if(c<=-1)return 24;if(c>=1)return 0;return 2*Math.acos(c)*RAD/15}
function hrs(h){if(h>=23.95)return"24 h";if(h<=.05)return"0 h";const H=Math.floor(h),m=Math.round((h-H)*60);return m===60?(H+1)+" h":H+" h "+String(m).padStart(2,"0")}
function latTxt(l){return Math.abs(l).toFixed(0)+"° "+(l>=0?"N":"S")}

/* ======================= 2. b80days | The timetable ======================= */
/* Dates and hours are Verne's own, from the novel (Project Gutenberg text, ch. XIV–XXXVI): Fogg's diary (Paris 3 Oct 7:20, Turin
   4 Oct 6:35, Brindisi 5 Oct 4 pm, Suez 9 Oct 11 am "neither gained nor lost"), Bombay 20 Oct 4:30 pm, train at 8 pm, Kholby
   22 Oct 8 am, Calcutta 25 Oct 7 am "neither behind-hand nor ahead", Singapore 31 Oct 4 am (half a day early), Hong Kong 6 Nov
   1 pm "twenty-four hours behind", Yokohama the morning of 14 Nov, the 180th meridian on 23 Nov, San Francisco 3 Dec "neither
   gained nor lost a single day", train at 6 pm, Chicago 10 Dec 4 pm, New York 11 Dec 11:15 pm (the China gone three-quarters of
   an hour before), the Henrietta at 9 am on 12 Dec, Queenstown 1 am and Liverpool 11:40 am on "21 Dec", London 8:50 pm.
   The diary's dates are the local dates where Fogg is. He never put his calendar back a day when crossing 180°, so from there
   on they run one day ahead: the slider runs on London's clock (local time minus longitude/15 hours, minus that day). */
const P8={london:[-0.13,51.51],dover:[1.31,51.13],calais:[1.86,50.95],paris:[2.35,48.86],lyon:[4.85,45.76],modane:[6.67,45.2],turin:[7.68,45.07],bologna:[11.34,44.49],ancona:[13.5,43.6],brindisi:[17.94,40.64],
 portsaid:[32.3,31.26],suez:[32.55,29.97],aden:[45.03,12.79],bombay:[72.84,18.94],nasik:[73.79,19.99],jabalpur:[79.95,23.18],kholby:[80.0,24.75],allahabad:[81.85,25.44],benares:[83.0,25.32],calcutta:[88.35,22.57],
 singapore:[103.85,1.29],hongkong:[114.17,22.29],shanghai:[121.9,31.1],yokohama:[139.64,35.44],sf:[-122.42,37.77],sacramento:[-121.49,38.58],reno:[-119.81,39.53],promontory:[-112.55,41.62],ogden:[-111.97,41.22],
 cheyenne:[-104.82,41.14],kearny:[-98.98,40.65],omaha:[-95.94,41.26],chicago:[-87.63,41.88],ny:[-74.01,40.7],queenstown:[-8.29,51.85],dublin:[-6.26,53.35],liverpool:[-2.99,53.41]};
/* where the Pacific crossing (the tour's own great circle, Yokohama to San Francisco) meets 180° */
function x180(){const ip=d3.geoInterpolate([140.2,35.1],[-122.62,37.78]);let lo=0,hi=1;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(ip(m)[0]>0)lo=m;else hi=m}const q=ip(lo);return[180,q[1]]}
const D0=Date.UTC(1872,9,2,20,45);/* Wednesday 2 October 1872, 8:45 pm, London */
const fd=(mo,d,h,mi,lon,dl)=>(Date.UTC(1872,mo-1,d,h,mi)-lon/15*36e5-(dl?864e5:0)-D0)/864e5;
const FOGG={key:"b80days|The timetable",follow:1,cls:"fogg",t0:0,t1:80,playSecs:50,sliderLabel:"Day of the journey",
 instr:"🎩 Race Fogg against the clock: drag him round the world, or press ▶.",
 note:"Dates and hours are Verne’s, from the novel. The slider runs on London’s clock.",
 J(){if(this._J)return this._J;const P=P8,E=(n,x,o)=>Object.assign({n,x},o||{});
  this._J=journey([
   ["🚂",[{ll:P.london,t:0,ev:E("London, 8:45 pm","Wednesday 2 October 1872. Fogg leaves Charing Cross with Passepartout and a bag of banknotes. 80 days to go.")},P.dover,P.calais,{ll:P.paris,t:fd(10,3,7,20,P.paris[0])},P.lyon,P.modane,{ll:P.turin,t:fd(10,4,6,35,P.turin[0])},P.bologna,P.ancona,{ll:P.brindisi,t:fd(10,5,16,0,P.brindisi[0]),hold:fd(10,5,17,0,P.brindisi[0])}]],
   ["🚢",[P.brindisi,[19,39.6],[21.5,36.6],[26,34.2],[30.5,32],P.portsaid,[32.33,30.6],{ll:P.suez,t:fd(10,9,11,0,P.suez[0]),ev:E("Suez, 9 October","Exactly on his timetable: he has neither gained nor lost. A detective, Fix, decides he looks like the Bank of England robber.",{d:0})},
    [33.4,28],[35,26.2],[38.2,21],[41.2,15.8],[43.4,12.7],P.aden,[52,14],[60,16.2],[68,18.3],{ll:P.bombay,t:fd(10,20,16,30,P.bombay[0]),hold:fd(10,20,20,0,P.bombay[0]),ev:E("Bombay, 20 October","The Mongolia arrives two days early. Fogg notes the gain and has dinner.",{d:2})}]],
   ["🚂",[P.bombay,P.nasik,[76.2,21.1],P.jabalpur,{ll:P.kholby,t:fd(10,22,8,0,P.kholby[0]),ev:E("Kholby, 22 October","The line simply stops. Fogg buys an elephant for £2,000 and rides on through the forest.")}]],
   ["🐘",[P.kholby,P.allahabad]],
   ["🚂",[P.allahabad,P.benares,[85.2,24.6],[87.3,23.3],{ll:P.calcutta,t:fd(10,25,7,0,P.calcutta[0]),hold:fd(10,25,12,0,P.calcutta[0]),ev:E("Calcutta, 25 October","Exactly on time again: the two days he gained were spent crossing India.",{d:0})}]],
   ["🚢",[P.calcutta,[88.2,21.2],[89.3,19.5],[92.8,14.5],[95.6,8.9],[97.6,6.4],[99.6,3.9],[101.6,2.4],{ll:P.singapore,t:fd(10,31,4,0,P.singapore[0]),hold:fd(10,31,11,0,P.singapore[0]),ev:E("Singapore, 31 October","The Rangoon stops to take on coal, half a day ahead of time.")},
    [105.4,3],[108.3,7.5],[110.3,12.5],[112.2,18.2],{ll:P.hongkong,t:fd(11,6,13,0,P.hongkong[0]),ev:E("Hong Kong, 6 November","A storm has made him 24 hours late, and Fix drugs Passepartout, who sails for Japan without him.",{d:-1})}]],
   ["⛵",[P.hongkong,[116.5,23.2],[119.4,25.4],[121.3,28.2],[122.5,30.4],P.shanghai]],
   ["🚢",[P.shanghai,[124,31],[127.5,31.3],[129.9,31.2],[131.6,32.6],[134.8,33.3],[138,34.4],{ll:P.yokohama,t:fd(11,14,8,0,P.yokohama[0]),ev:E("Yokohama, 14 November","A pilot boat and an American steamer get him here. He finds Passepartout in a troupe of acrobats, and they board the General Grant.")}]],
   ["🚢",[P.yokohama,[140.2,35.1],{ll:x180(),t:fd(11,23,12,0,180),ev:E("23 November: crossing 180°","Halfway round. Fogg should now put his calendar back one day. He does not, and nobody notices: his diary now runs a day ahead of London’s.",{dl:1})},[-122.62,37.78],{ll:P.sf,t:fd(12,3,8,0,P.sf[0],1),hold:fd(12,3,18,0,P.sf[0],1),ev:E("San Francisco, 3 December","By his diary he has “neither gained nor lost a single day”. The train east leaves at 6 pm.")}]],
   ["🚂",[P.sf,P.sacramento,[-120.33,39.32],P.reno,[-117.7,40.9],[-115.76,40.83],P.promontory,P.ogden,[-109.2,41.6],[-105.59,41.31],P.cheyenne,[-100.77,41.12],{ll:P.kearny,ev:E("Fort Kearny","Sioux warriors attack the train. Fogg stays to rescue Passepartout, and the train leaves without them.")}]],
   ["🛷",[P.kearny,[-97.5,40.9],P.omaha]],
   ["🚂",[P.omaha,{ll:P.chicago,t:fd(12,10,16,0,P.chicago[0],1)},[-80.0,40.44],{ll:P.ny,t:fd(12,11,23,15,P.ny[0],1),hold:fd(12,12,9,0,P.ny[0],1),ev:E("New York, 11 December, 11:15 pm","The Liverpool steamer China left three-quarters of an hour ago. Next morning Fogg talks his way onto the cargo ship Henrietta.")}]],
   ["🚢",[P.ny,[-73.9,40.4],[-60,42],[-40,47.2],[-20,50.6],{ll:P.queenstown,t:fd(12,21,1,0,P.queenstown[0],1),ev:E("Queenstown, Ireland, 1 am","He has bought the Henrietta and burned her decks and cabins for fuel. On by train and mail boat.")}]],
   ["🚂",[P.queenstown,[-8.47,51.9],[-7.6,52.6],P.dublin]],
   ["🚢",[P.dublin,[-5,53.35],{ll:P.liverpool,t:fd(12,21,11,40,P.liverpool[0],1),hold:fd(12,21,15,0,P.liverpool[0],1),ev:E("Liverpool, 11:40 am","Six hours from London, with nine to spare… and Fix arrests him. The real thief was caught three days ago.")}]],
   ["🚂",[P.liverpool,[-2.2,52.9],[-1.5,52.4],{ll:P.london,t:fd(12,21,20,50,P.london[0],1),hold:80,ev:E("London, 8:50 pm","Five minutes late, Fogg believes, by his diary’s day 80. He goes home ruined… but London’s calendar says it is only Friday 20 December.",{late:1})}]]]);
  this._J.evs.push({t:80,ll:P.london,n:"The Reform Club, 8:45 pm",x:"Saturday 21 December: Passepartout finds out the real date, and Fogg walks into his club as the clock strikes 8:45. He wins!",win:1});
  return this._J},
 icon(a,ic){return EMO(ic||"🎩")},
 mount(a){travellerMount(a,{J:()=>this.J(),hint:"Drag Fogg ⟶",label:"Phileas Fogg: drag him along his route"})},
 draw(a){travellerDraw(a,{J:()=>this.J(),noRoute:1,icon:(a,ic)=>this.icon(a,ic),bubble:(a,ek)=>{const e=this.J().evs[ek];return e&&a.T-e.t<1.6?esc(e.n.split(",")[0]):""}})},
 fast(a){return still(this.J(),a.T,.05)?2.5:1},
 card(a){const J=this.J(),ek=evAt(J,a.T),e=J.evs[ek]||{},now=new Date(D0+a.T*864e5),left=Math.max(0,80-a.T),dl=a.T>=fd(11,23,12,0,180)&&!e.win;
  const ld=WD[now.getUTCDay()]+" "+now.getUTCDate()+" "+MO3[now.getUTCMonth()];
  let dlh=dl?'<div class="gfl-diary">📓 Fogg’s diary says: <b>'+(()=>{const d=new Date(now.getTime()+864e5);return WD[d.getUTCDay()]+" "+d.getUTCDate()+" "+MO3[d.getUTCMonth()]})()+'</b> <small>one day ahead</small></div>':"";
  /* how he stands against his own timetable, only where the book says so */
  let gain="";if(e.d!=null){gain='<span class="gfl-chip '+(e.d>0?"up":e.d<0?"down":"even")+'">'+(e.d>0?e.d+" days ahead":e.d<0?"a day behind":"on time")+'</span>'}
  const days=Math.floor(left),hrsL=Math.floor((left-days)*24);
  const cells=Array.from({length:80},(_,i)=>'<i class="'+(i<Math.floor(a.T)?"used":"")+'"></i>').join("");
  return{count:'<div class="gfl-clock"><span class="gfl-big">'+(e.win?"Won!":left<=0?"0 days left":days+" days "+hrsL+" h left")+'</span>'+gain+'</div><div class="gfl-cells" aria-hidden="true">'+cells+'</div>'+
   '<div class="gfl-sub">Day '+Math.min(80,Math.floor(a.T)+1)+' of 80 · London: <b>'+ld+'</b>, '+clock(now)+'</div>'+dlh,head:esc(e.n||""),body:esc(e.x||"")}}};
function clock(d){let h=d.getUTCHours(),m=d.getUTCMinutes();const ap=h>=12?"pm":"am";h=h%12||12;return h+":"+String(m).padStart(2,"0")+" "+ap}

/* ======================= 3. bbeagle | Tortoises, mockingbirds and finches ======================= */
/* Where and when (Wikipedia, "Second voyage of HMS Beagle", after Keynes's edition of Darwin's Beagle diary): the Beagle reached
   the islands on 15 September 1835 and anchored at Chatham (San Cristóbal); then Charles (Floreana), where the acting governor
   Nicholas Lawson spoke of the tortoise shells; Albemarle (Isabela), landing near Tagus Cove on 1 October; then nine days ashore on
   James (Santiago); sailed for Tahiti on 20 October. Darwin's note: "I have four specimens from as many Isds.— These will be found
   to be 2 or 3 varieties." The mockingbirds as named today (John Gould described the three species in 1837): Mimus melanotis on
   San Cristóbal, M. trifasciatus on Floreana (since lost from Floreana itself, surviving on two islets off it), M. parvulus on
   Isabela and Santiago. */
const ISL=[{n:"San Cristóbal",o:"Chatham",ll:[-89.61,-0.9],when:"16 September 1835",sp:0,x:"First landing. Darwin collects a mockingbird, the San Cristóbal mockingbird."},
 {n:"Floreana",o:"Charles",ll:[-90.45,-1.27],when:"late September",sp:1,x:"The acting governor, Nicholas Lawson, says he can tell a tortoise’s island from its shell. And this mockingbird is different from the last one: from now on Darwin notes where each bird was caught."},
 {n:"Isabela",o:"Albemarle",ll:[-91.37,-0.27],when:"1 October",sp:2,x:"Near Tagus Cove he catches a third kind of mockingbird, and sees his first land iguanas."},
 {n:"Santiago",o:"James",ll:[-90.83,-0.22],when:"October: nine days ashore",sp:2,x:"Nine days camping and collecting. This mockingbird matches Isabela’s: the same kind lives on both."}];
const SPP=[{n:"San Cristóbal mockingbird",l:"Mimus melanotis",c:"#2f6fb5"},{n:"Floreana mockingbird",l:"Mimus trifasciatus",c:"#c0392b"},{n:"Galápagos mockingbird",l:"Mimus parvulus",c:"#2e8b57"}];
const BIRD=c=>'<svg viewBox="0 0 40 26" width="40" height="26" aria-hidden="true"><path d="M3 14 Q8 6 17 8 Q22 3 27 5 Q31 4 33 7 L39 7.5 L33 9.5 Q31 14 26 16 L20 17 Q14 21 3 24 Q8 19 11 17 Q5 17 3 14 Z" fill="'+c+'" stroke="#1f2a33" stroke-width=".9"/><circle cx="28.6" cy="7.3" r="1.2" fill="#fff"/><path d="M20 17 L22 23 M23 16.5 L25 23" stroke="#1f2a33" stroke-width="1"/></svg>';
const BEAGLE={key:"bbeagle|Tortoises, mockingbirds and finches",cls:"beagle",t0:0,t1:1,playSecs:1,noSlider:1,extra:1,
 instr:"⛵ Sail the Beagle to each island: drag the ship onto a numbered circle, click one, or press “Sail on”. Collect its mockingbird.",
 note:"Sources: Darwin’s Beagle diary and notes (Keynes ed.); species as named by John Gould in 1837.",
 ship:'<g class="gfl-ship"><path d="M-18 2 L18 2 L14 10 L-14 10 Z" fill="#3b2a1a" stroke="#1c120a" stroke-width="1"/><path d="M-9 2 V-20 M2 2 V-24 M12 2 V-16" stroke="#1c120a" stroke-width="1.4"/>'+
  '<path d="M-15 -17 H-3 V-11 H-15 Z M-15 -9 H-3 V-3 H-15 Z M-4 -21 H8 V-15 H-4 Z M-4 -13 H8 V-6 H-4 Z M7 -13 H17 V-8 H7 Z" fill="#f6efdc" stroke="#1c120a" stroke-width=".8"/><path d="M14 -16 L20 -19 L14 -21" fill="#c0392b"/></g>',
 /* the islands are small at the globe's closest zoom, so each gets a big numbered circle pushed out from the group's middle, with a line to the island itself */
 spots(){const P=ISL.map(s=>proj(s.ll));if(P.some(p=>!p))return null;
  /* each pushed its own way (San Cristóbal east, Floreana south, Isabela west, Santiago north), less as the islands spread out when zoomed in */
  const dir=[[.97,.24],[.2,.98],[-.97,.24],[-.1,-1]],spread=Math.max(...P.map(p=>Math.hypot(p[0]-P[0][0],p[1]-P[0][1]))),k=Math.max(0,100-spread*.6);
  return P.map((p,i)=>({p,q:[p[0]+dir[i][0]*k,p[1]+dir[i][1]*k]}))},
 shipXY(a,sp){if(a.anim){const f=a.anim.f,b=sp&&sp[a.anim.i].q,s0=a.anim.from;if(b&&s0)return[s0[0]+(b[0]-s0[0])*f,s0[1]+(b[1]-s0[1])*f]}
  if(a.st.dock>=0&&sp)return sp[a.st.dock].q;return proj(a.st.pos)},
 mount(a){a.st.got=a.st.got||[];a.st.at=a.st.at==null?-1:a.st.at;a.st.dock=a.st.dock==null?-1:a.st.dock;a.st.pos=a.st.pos||[-89.3,-2.5];
  a.svg.innerHTML='<path class="gfl-route gfl-trail"/><g class="gfl-isl"></g><g class="gfl-trav" tabindex="0" role="button" aria-label="The Beagle: drag onto an island, or press Enter to sail on"><circle class="gfl-hit" r="28"/><g class="gfl-ic"></g></g>';
  a.html.innerHTML='<div class="gfl-bub"></div><div class="gfl-hint">Drag the Beagle to island 1 ⟶</div>';
  a.h={isl:a.svg.querySelector(".gfl-isl"),trav:a.svg.querySelector(".gfl-trav"),ic:a.svg.querySelector(".gfl-ic"),trail:a.svg.querySelector(".gfl-trail"),bub:a.html.querySelector(".gfl-bub"),hint:a.html.querySelector(".gfl-hint")};
  a.h.ic.innerHTML=this.ship;const tr=a.h.trav,self=this;
  const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();a.anim=null;tr.classList.add("gfl-drag");a.st.touched=1;try{tr.setPointerCapture(e.pointerId)}catch(err){}
   const mv=ev=>{ev.stopPropagation();try{const g=G(),hr=a.el.getBoundingClientRect(),x=ev.clientX-hr.left,y=ev.clientY-hr.top;a.free=[x,y];a.st.dock=-1;const ll=g.projection().invert([x-a.ox,y-a.oy]);if(ll&&isFinite(ll[0]))a.st.pos=ll;a.dirty=true}catch(err){}};
   const up=()=>{tr.removeEventListener("pointermove",mv);tr.removeEventListener("pointerup",up);tr.removeEventListener("pointercancel",up);tr.classList.remove("gfl-drag");
    /* dropped on or near an island's circle (or the island itself): land there */
    const sp=self.spots(),q=a.free;a.free=null;if(!sp||!q){a.dirty=true;return}let best=-1,bd=46;sp.forEach((s,i)=>{const d=Math.min(Math.hypot(s.q[0]-q[0],s.q[1]-q[1]),Math.hypot(s.p[0]-q[0],s.p[1]-q[1]));if(d<bd){bd=d;best=i}});
    if(best>=0)self.land(a,best);a.dirty=true};
   tr.addEventListener("pointermove",mv);tr.addEventListener("pointerup",up);tr.addEventListener("pointercancel",up)};
  tr.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>tr.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}));
  tr.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();self.next(a)}});
  a.h.isl.addEventListener("pointerdown",e=>{const g=e.target.closest("[data-i]");if(!g)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();self.sail(a,+g.dataset.i)});
  ["mousedown","click","touchstart"].forEach(t=>a.h.isl.addEventListener(t,e=>{if(e.target.closest("[data-i]"))e.stopPropagation()},{passive:t!=="mousedown"}));
  const step=()=>{if(A!==a)return;if(a.anim){const k=Math.min(1,(performance.now()-a.anim.t0)/a.anim.dur);a.anim.f=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;a.dirty=true;if(k>=1){const i=a.anim.i;a.anim=null;self.land(a,i)}}a._bt=requestAnimationFrame(step)};a._bt=requestAnimationFrame(step)},
 unmount(a){cancelAnimationFrame(a._bt)},
 sail(a,i){a.st.touched=1;const sp=this.spots(),from=this.shipXY(a,sp);if(!sp||!from){this.land(a,i);return}a.anim={i,t0:performance.now(),dur:1100,f:0,from};a.dirty=true},
 next(a){const i=ISL.findIndex((s,k)=>!a.st.got.includes(k));this.sail(a,i<0?0:i)},
 land(a,i){a.st.at=i;a.st.dock=i;a.st.pos=ISL[i].ll.slice();if(!a.st.got.includes(i))a.st.got.push(i);a.dirty=true},
 draw(a){const h=a.h,sp=this.spots();if(!sp){h.isl.innerHTML="";h.trav.style.display="none";h.hint.style.display="none";h.bub.style.display="none";return}
  const nxI=ISL.findIndex((x,k)=>!a.st.got.includes(k));
  h.isl.innerHTML=sp.map((o,i)=>'<line class="gfl-lead" x1="'+o.p[0].toFixed(1)+'" y1="'+o.p[1].toFixed(1)+'" x2="'+o.q[0].toFixed(1)+'" y2="'+o.q[1].toFixed(1)+'"/><circle class="gfl-isldot" cx="'+o.p[0].toFixed(1)+'" cy="'+o.p[1].toFixed(1)+'" r="3"/>').join("")+
   ISL.map((s,i)=>{const q=sp[i].q,got=a.st.got.includes(i),up=q[1]<sp[i].p[1]-4;
   return'<g class="gfl-island'+(got?" got":"")+(i===nxI?" nx":"")+'" data-i="'+i+'" transform="translate('+q[0].toFixed(1)+","+q[1].toFixed(1)+')" role="button" aria-label="Sail to '+esc(s.n)+'"><circle class="ring" r="24"/>'+
    '<circle class="num" r="12"/><text class="numt" y="4.5" text-anchor="middle">'+(got?"✓":i+1)+'</text><text class="lab" x="0" y="'+(up?-31:44)+'" text-anchor="middle">'+esc(s.n)+'</text><text class="lab2" x="0" y="'+(up?-46:58)+'" text-anchor="middle">'+esc(s.o)+'</text></g>'}).join("");
  const order=a.st.got.map(i=>sp[i].q);h.trail.setAttribute("d",order.length>1?"M"+order.map(q=>q[0].toFixed(1)+" "+q[1].toFixed(1)).join("L"):"");
  const q=a.free||this.shipXY(a,sp);if(!q){h.trav.style.display="none";h.hint.style.display="none";h.bub.style.display="none";return}h.trav.style.display="";h.trav.setAttribute("transform","translate("+q[0].toFixed(1)+","+(q[1]-6).toFixed(1)+")");
  h.hint.style.display=a.st.touched?"none":"";h.hint.style.left=(q[0]+30)+"px";h.hint.style.top=(q[1]-20)+"px";
  const at=a.st.dock>=0&&!a.anim&&!a.free?ISL[a.st.dock]:null;h.bub.style.display=at?"":"none";if(at){h.bub.innerHTML=esc(at.n)+' <small>'+esc(at.when)+'</small>';h.bub.style.left=q[0]+"px";h.bub.style.top=(q[1]-36)+"px"}},
 cardInit(a,c){const x=c.querySelector(".gfl-x");x.addEventListener("click",e=>{const b=e.target.closest(".gfl-sail");if(b){e.stopPropagation();if(a.st.got.length>=ISL.length){a.st.got=[];a.st.at=-1;a.st.dock=-1;a.st.pos=[-89.3,-2.5];a.dirty=true}else this.next(a)}})},
 card(a){const got=a.st.got,at=a.st.at>=0?ISL[a.st.at]:null,kinds=new Set(got.map(i=>ISL[i].sp)).size,done=got.length>=ISL.length;
  const slots=ISL.map((s,i)=>{const g=got.includes(i),sp=SPP[s.sp];return'<div class="gfl-slot'+(g?" got":"")+'" style="--c:'+sp.c+'">'+(g?BIRD(sp.c):'<span class="q">'+(i+1)+'</span>')+'<b>'+esc(s.n)+'</b><small>'+(g?esc(sp.n):"not yet")+'</small></div>'}).join("");
  const head=done?"Four islands, three kinds":at?esc(at.n)+" ("+esc(at.o)+" Island), "+esc(at.when):"Specimen drawer: empty";
  const body=done?"Darwin wrote: “I have four specimens from as many Isds.— These will be found to be 2 or 3 varieties.” Islands in sight of each other, each with its own kind: if species never change, why? It was his first real clue.":
   at?esc(at.x):"The Beagle reached the islands on 15 September 1835. Darwin will land on four of them.";
  return{count:'<span class="gfl-big">'+got.length+' of 4 islands</span><span class="gfl-sub">'+kinds+' kind'+(kinds===1?"":"s")+' of mockingbird so far</span>',head,body,
   extra:'<div class="gfl-drawer">'+slots+'</div><button type="button" class="gfl-sail">'+(done?"↺ Start again":"⛵ Sail on to "+esc(ISL[ISL.findIndex((s,k)=>!got.includes(k))].n))+'</button>'}}};

/* ======================= 4. brihla | The Travels of Ibn Battuta ======================= */
/* Places are the tour's own (geoflock-tours-brihla.js). Years: those the tour and the Rihla give (left Tangier June 1325, aged
   21; Mecca 1326; Iraq and Persia 1327; East Africa about 1330; the Indus in September 1333 by his own date; about seven years
   in Delhi; sent to China in 1341; left the Maldives in 1344; China about 1345; Damascus in July 1348; home in 1349; Granada
   1350; the Sahara and Mali 1352–53; Fez 1354), with Ross Dunn's "The Adventures of Ibn Battuta" (1986) for the order of the
   years between. Born in February 1304. The dates from 1327 to 1333 are disputed and are marked "about". The doubted trips
   (Bulghar, Beijing) are left out. */
const PB={tangier:[-5.81,35.78],tlemcen:[-1.32,34.88],bejaia:[5.08,36.75],tunis:[10.17,36.81],tripoli:[13.19,32.89],alex:[29.92,31.2],cairo:[31.24,30.04],gaza:[34.47,31.5],jerus:[35.23,31.78],damascus:[36.29,33.51],
 tabuk:[36.57,28.38],medina:[39.61,24.47],mecca:[39.83,21.42],jeddah:[39.17,21.54],najaf:[44.32,32.0],basra:[47.78,30.5],isfahan:[51.67,32.65],shiraz:[52.53,29.59],baghdad:[44.36,33.31],tabriz:[46.29,38.08],mosul:[43.13,36.34],
 aden:[45.03,12.79],zeila:[43.47,11.35],mogadishu:[45.34,2.04],mombasa:[39.67,-4.05],kilwa:[39.51,-8.96],zafar:[54.09,17.02],qalhat:[59.37,22.7],hormuz:[56.46,27.1],latakia:[35.78,35.52],
 alanya:[32.0,36.54],konya:[32.49,37.87],sinop:[35.15,42.03],kaffa:[35.38,45.03],azov:[39.42,47.1],beshtau:[43.05,44.1],sarai:[47.1,46.7],cnst:[28.98,41.01],
 urgench:[59.15,42.33],bukhara:[64.42,39.77],samarkand:[66.97,39.65],termez:[67.28,37.22],balkh:[66.9,36.76],kunduz:[68.86,36.73],kabul:[69.17,34.53],ghazni:[68.42,33.55],indus:[68.6,26.4],multan:[71.47,30.2],delhi:[77.21,28.61],
 koil:[78.08,27.88],gwalior:[78.18,26.22],daulat:[75.21,19.94],cambay:[72.62,22.31],honavar:[74.44,14.28],calicut:[75.78,11.25],male:[73.51,4.17],puttalam:[79.83,8.04],adams:[80.5,6.81],
 sonargaon:[90.6,23.65],samudra:[97.15,5.18],quanzhou:[118.58,24.9],guangzhou:[113.26,23.13],gibraltar:[-5.35,36.14],ronda:[-5.17,36.74],malaga:[-4.42,36.72],granada:[-3.59,37.18],
 fez:[-4.98,34.03],sijilmasa:[-4.27,31.28],taghaza:[-5.0,23.6],walata:[-7.03,17.29],niani:[-8.33,11.37],timbuktu:[-3.0,16.77],gao:[-0.04,16.27],takedda:[6.4,17.4],tuat:[-0.29,27.87]};
const CHINA_SEA=[PB.sonargaon,[90.4,22],[91,19],[93.5,14],[95.5,8.5],PB.samudra,[99.5,4.1],[101.6,2.5],[103.9,1.15],[105.5,3],[108.5,8.5],[110.5,13.5],[112,18.5],[115.5,22],PB.quanzhou];
const IBN={key:"brihla|The Travels of Ibn Battuta",cls:"ibn",t0:1325.45,t1:1354.1,playSecs:60,noWalkers:1,hideLines:1,sliderLabel:"Year of the journey",
 instr:"🐪 Walk with Ibn Battuta: drag him along the road, or press ▶. Watch the years go by.",
 note:"Years as the Rihla and historians give them; from 1327 to 1333 they are uncertain. Doubted side trips are left out.",
 J(){if(this._J)return this._J;const P=PB,E=(n,x)=>({n,x}),C="🐪",S="⛵";
  this._J=journey([
   [C,[{ll:P.tangier,t:1325.45,ev:E("Tangier, June 1325","Aged 21, he sets out alone to make the pilgrimage to Mecca, “like a bird leaving its nest”.")},P.tlemcen,P.bejaia,P.tunis,P.tripoli,[20.07,32.12],[23.96,32.08],[27.2,31.35],
    {ll:P.alex,t:1326.3,ev:E("Alexandria, 1326","He sees the ancient Pharos lighthouse, already damaged.")},{ll:P.cairo,ev:E("Cairo","Capital of the Mamluk sultans and one of the biggest cities on Earth: “the mother of cities”.")},
    P.gaza,P.jerus,{ll:P.damascus,t:1326.6,ev:E("Damascus","He spends Ramadan studying with its scholars, then joins the pilgrim caravan south.")},P.tabuk,P.medina,{ll:P.mecca,t:1326.85,ev:E("Mecca, 1326","His first Hajj. Instead of going home, he decides to keep travelling.")}]],
   [C,[P.mecca,[42,26.5],{ll:P.najaf,ev:E("Iraq and Persia, 1327","Najaf, Basra, Isfahan, Shiraz, then Baghdad and Tabriz with the Mongol Ilkhan’s travelling camp.")},P.basra,[49.5,31.3],P.isfahan,P.shiraz,[49,31.5],P.baghdad,{ll:P.tabriz,t:1327.5},P.mosul,P.baghdad,[42.5,28],
    {ll:P.mecca,t:1327.85,hold:1330.6,ev:E("Mecca again","Years of study in the holy city. How many is disputed: his dates here do not quite add up.")}]],
   [S,[P.mecca,P.jeddah,[41,17],[43,13.4],{ll:P.aden,ev:E("Aden","Yemen’s great port, and a ship south along the coast of Africa.")},[44.2,11.9],P.zeila,[46.5,11.8],[51.4,12.1],[51.6,10.4],[49.6,6.5],[47.2,3.6],P.mogadishu,[43.2,-0.6],[41.3,-2.6],P.mombasa,[40.1,-6.1],
    {ll:P.kilwa,t:1330.95,ev:E("Kilwa, about 1330","The far end of the Swahili coast, rich from the gold trade, and one of the best-built towns he knew.")},[41.5,-5.5],[46.5,.5],[52.5,8.5],[55.4,14.5],P.zafar,[57.5,18.6],[59.6,21.6],P.qalhat,[59.8,23.7],[57.7,25.6],{ll:P.hormuz,ev:E("Hormuz","Back north with the monsoon winds, by Oman to the mouth of the Persian Gulf.")}]],
   [C,[P.hormuz,[50,25],{ll:P.mecca,t:1332.1},P.medina,P.damascus,P.latakia]],
   [S,[P.latakia,{ll:P.alanya,t:1332.4,ev:E("Anatolia, about 1332","Across the Turkish emirates of Anatolia, welcomed in lodge after lodge.")}]],
   [C,[P.alanya,P.konya,P.sinop]],
   [S,[P.sinop,P.kaffa]],
   [C,[P.kaffa,P.azov,{ll:P.beshtau,ev:E("The Golden Horde","He rides with Özbeg Khan’s vast moving camp, a city of wagons and tents.")},[38,47],[33,47.5],[29,46.3],[28.5,44.2],[27.7,42.6],{ll:P.cnst,ev:E("Constantinople","He travels with a Byzantine princess going home, and meets the emperor: a rare Muslim view of the Christian capital.")},
    [28.5,44.2],[33,47.5],[40,48.4],P.sarai,P.urgench,P.bukhara,{ll:P.samarkand,ev:E("Samarkand","Bukhara and Samarkand still bear the scars of Genghis Khan’s armies, a century before.")},P.termez,P.balkh,P.kunduz,
    {ll:[69.7,35.6],ev:E("Over the Hindu Kush","Deep snow on the pass: felt is laid down for the camels to walk on.")},P.kabul,P.ghazni,[68.8,30],{ll:P.indus,t:1333.7,ev:E("The Indus, September 1333","By his own date, he reaches India.")},P.multan,[74.5,30],
    {ll:P.delhi,t:1334.2,hold:1341.6,ev:E("Delhi: a judge for the sultan","Muhammad bin Tughluq gives him a huge salary and keeps him about seven years, between dazzling gifts and terrifying cruelty.")}]],
   [C,[P.delhi,{ll:P.koil,ev:E("Ambassador to China, 1341","The sultan sends him with rich gifts to the Mongol emperor of China. Near Koil, rebels capture him; he escapes.")},P.gwalior,[77.6,24.8],[75.3,22.6],P.daulat,[73.8,21],P.cambay]],
   [S,[P.cambay,[72.4,21],[72.6,19],[73.2,16.5],[74.1,14.6],P.honavar,[75.1,12.6],{ll:P.calicut,t:1342.0,ev:E("Shipwreck at Calicut","A storm wrecks the junk with the gifts; the ship with his belongings sails off without him.")},[75,8.5],[73.8,5.5],
    {ll:P.male,t:1343.3,hold:1344.2,ev:E("Judge of the Maldives","About nine months as chief judge of islands that trade cowrie shells as money. He leaves in 1344.")},[76,5.6],[79.2,7.2],P.puttalam]],
   [C,[P.puttalam,[80.1,7.4],{ll:P.adams,t:1344.4,ev:E("Adam’s Peak, Ceylon","He climbs the sacred mountain to see the giant footprint on its summit.")},P.puttalam]],
   [S,[P.puttalam,[79.6,9.3],[80.6,10.1],[82.5,11],[85,13.5],[88,18],[89.6,21.5],{ll:P.sonargaon,ev:E("Bengal","Then a junk east, by Sumatra, towards China.")}].concat(CHINA_SEA.slice(1,-1),[{ll:P.quanzhou,t:1345.8,ev:E("Quanzhou, about 1345","“Zaitun”, the biggest harbour he had ever seen. He marvels at paper money, porcelain and safe roads.")}])],
   [C,[P.quanzhou,[116.6,23.4],{ll:P.guangzhou,ev:E("Guangzhou","The southern edge of the Mongol empire of China. (Whether he went on north to Beijing is doubted.)")},[116.6,23.4],P.quanzhou]],
   [S,CHINA_SEA.slice(1).reverse().concat([[95.5,6],[85,5.5],[80.5,5.4],[77.5,7.2],{ll:P.calicut,t:1347.0},[70,13],[62,15],[57.5,16.8],P.zafar,[57.5,18.6],[59.6,21.6],P.qalhat,[59.8,23.7],[57.7,25.6],P.hormuz,[52,27.5],[49.5,29.4],P.basra])],
   [C,[P.basra,{ll:P.baghdad,t:1348.0},{ll:P.damascus,t:1348.55,ev:E("Damascus, July 1348","Heading home, he walks into the Black Death: he says 2,400 people died here in a single day.")},P.jerus,P.gaza,P.cairo,
    [32.65,25.7],[35.4,23.4],[38.5,22.6],{ll:P.mecca,ev:E("Mecca: a last Hajj","His last pilgrimage, then west for home.")},P.medina,P.tabuk,P.gaza,P.cairo,P.alex,[27.2,31.35],[23.96,32.08],[20.07,32.12],P.tripoli,P.tunis,P.bejaia,P.tlemcen,
    {ll:P.fez,t:1349.85,ev:E("Fez, 1349: home","24 years after leaving. Both his parents have died.")},{ll:P.tangier,ev:E("Tangier","He visits his mother’s grave.")},P.gibraltar,P.ronda,P.malaga,{ll:P.granada,t:1350.3,ev:E("Granada, 1350","The last Muslim kingdom of Spain, where the Alhambra palaces were going up.")},P.malaga,P.gibraltar,P.tangier,
    {ll:P.fez,t:1350.8},{ll:P.sijilmasa,t:1351.8},[-4.6,27.5],{ll:P.taghaza,t:1352.1,ev:E("Taghaza, 1352","Across the Sahara with a salt caravan: a town where even the houses and the mosque are built of salt.")},[-6.2,20.5],P.walata,[-7.8,14],
    {ll:P.niani,t:1352.45,hold:1353.1,ev:E("The court of Mali","He meets Mansa Sulayman, brother of Mansa Musa, and laughs at his welcome gift; but he praises Mali’s safe roads.")},[-6.5,13.5],[-4.2,14.5],{ll:P.timbuktu,ev:E("Timbuktu","Down the Niger by Timbuktu and Gao.")},[-1.5,16.9],P.gao,[3,17.6],P.takedda,P.tuat,P.sijilmasa,
    {ll:P.fez,t:1354.1,ev:E("Fez, 1354: journey’s end","The sultan orders his story written down. It is finished in 1355: the Rihla.")}]]]);
  return this._J},
 icon(a,ic){return EMO(ic||"🐪")},
 mount(a){travellerMount(a,{J:()=>this.J(),hint:"Drag Ibn Battuta ⟶",label:"Ibn Battuta: drag along his journey"})},
 draw(a){travellerDraw(a,{J:()=>this.J(),icon:(a,ic)=>this.icon(a,ic),bubble:(a,ek)=>{const e=this.J().evs[ek];if(!e)return"";return a.T-e.t<.25||still(this.J(),a.T,.02)?esc(e.n.split(",")[0].split(":")[0]):""}})},
 fast(a){return still(this.J(),a.T,.02)?3.5:1},
 card(a){const J=this.J(),ek=evAt(J,a.T),e=J.evs[ek]||{},y=Math.floor(a.T),abt=a.T>1327.8&&a.T<1333.7,away=a.T-1325.45,age=Math.floor(a.T-1304.12);
  const places=J.evs.filter(x=>x.t<=a.T+1e-6).length;
  return{count:'<span class="gfl-big">'+(abt?"about ":"")+y+'</span><span class="gfl-sub">aged '+age+' · '+(a.T<1349.85?Math.floor(away)+" year"+(Math.floor(away)===1?"":"s")+" from home":"home again")+'</span>'+
   '<div class="gfl-bar gfl-yrs" title="1325 to 1354"><i style="width:'+((a.T-1325.45)/(1354.1-1325.45)*100).toFixed(1)+'%"></i></div><div class="gfl-sub2">'+places+' of '+J.evs.length+' places on this map · 1325 → 1354</div>',head:esc(e.n||""),body:esc(e.x||"")}}};

/* ======================= 5. bplagues | From Caffa to Europe, 1346–1351 ======================= */
/* Dates (Wikipedia, "Black Death" and its country articles, which follow Benedictow, "The Black Death 1346–1353", Ziegler and
   Byrne): Caffa besieged 1346; Constantinople 1347; Alexandria autumn 1347; Messina October 1347; Marseille November 1347;
   Genoa, Venice and Pisa January 1348; Florence March 1348; Tunis and Lyon April 1348; Siena May 1348; Paris, Bordeaux, Rouen and
   Weymouth June 1348; Damascus July 1348; Rome August 1348; Cairo late summer 1348; London autumn 1348; Vienna May 1349; Bergen
   probably August 1349; Trondheim autumn 1349; Lübeck and Hamburg early summer 1350; Visby (Gotland) May–July 1350; Pskov spring
   1352. A season is placed in its middle month. */
const BD=[["Caffa",35.38,45.03,1346.5,"1346","A Mongol army besieging the Genoese port is struck by plague. Genoese ships flee across the Black Sea."],
 ["Constantinople",28.98,41.01,1347.4,"1347","The capital of the Byzantine Empire. The emperor’s 13-year-old son is among the dead."],
 ["Alexandria",29.92,31.2,1347.8,"autumn 1347","Carried by sea from Constantinople, in a single merchant ship."],
 ["Messina",15.55,38.19,1347.79,"October 1347","Twelve Genoese galleys bring the plague to Sicily; it spreads all over the island."],
 ["Marseille",5.37,43.3,1347.87,"November 1347","A ship from Italy brings it to France."],
 ["Genoa",8.93,44.41,1348.04,"January 1348","Galleys from Caffa reach Genoa and Venice."],["Venice",12.34,45.44,1348.04,"January 1348","Galleys from Caffa reach Genoa and Venice."],
 ["Pisa",10.4,43.72,1348.07,"January 1348","A few weeks later Pisa: the gateway to northern Italy."],["Florence",11.25,43.77,1348.2,"March 1348","It stays until July. Boccaccio sets his Decameron here, ten young people fleeing the plague."],
 ["Tunis",10.17,36.81,1348.29,"April 1348","By ship from Sicily."],["Lyon",4.84,45.76,1348.29,"April 1348","Up the Rhône valley from Marseille."],["Siena",11.33,43.32,1348.37,"May 1348","The chronicler Agnolo di Tura buries five of his own children."],
 ["Bordeaux",-0.58,44.84,1348.45,"June 1348","On the Atlantic coast."],["Paris",2.35,48.86,1348.45,"June 1348","By the end of the year, half of Paris’s 100,000 people have died."],["Rouen",1.1,49.44,1348.48,"June 1348","On the feast of St John, 24 June."],
 ["Weymouth",-2.46,50.61,1348.45,"June 1348","A seaman from Gascony brings it to England."],["Damascus",36.29,33.51,1348.54,"July 1348","The traveller Ibn Battuta is here, and sees the whole city pray together for it to end."],
 ["Rome",12.5,41.9,1348.62,"August 1348",""],["Cairo",31.24,30.04,1348.62,"late summer 1348","The largest city in the Mediterranean world: more than a third of its people die."],
 ["London",-0.13,51.51,1348.79,"autumn 1348","By the summer of 1349 it covers all England."],["Vienna",16.37,48.21,1349.37,"May 1349","It lasts until September and kills about a third of the city."],
 ["Bergen",5.32,60.39,1349.62,"probably August 1349","A ship from England brings it to Norway."],["Trondheim",10.4,63.43,1349.79,"autumn 1349","North from Bergen."],
 ["Lübeck",10.69,53.87,1350.45,"early summer 1350","Northern Germany at last."],["Hamburg",9.99,53.55,1350.45,"early summer 1350",""],["Visby",18.29,57.64,1350.5,"May–July 1350","On Gotland, in the middle of the Baltic Sea, on the way to Sweden."],
 ["Pskov",28.33,57.82,1352.3,"spring 1352","The first outbreak recorded in Russia."]].map(([n,lon,lat,t,lab,x])=>({n,ll:[lon,lat],t,lab,x}));
const PLAGUE={key:"bplagues|From Caffa to Europe, 1346–1351",cls:"plague",t0:1346.3,t1:1352.6,playSecs:42,sliderLabel:"Month and year",
 instr:"🐀 Drag the slider, or press ▶, to watch the Black Death spread. Click a red city to read about it.",
 note:"Dates from historians’ records (Benedictow, Ziegler, Byrne). A season is shown in its middle month.",
 mount(a){a.svg.innerHTML='<g class="gfl-bd"></g>';a.st.pick=a.st.pick==null?-1:a.st.pick;const self=this,g=a.svg.querySelector(".gfl-bd");
  g.addEventListener("pointerdown",e=>{const c=e.target.closest("[data-i]");if(!c)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const i=+c.dataset.i;a.st.pick=i;if(BD[i].t>a.T+1e-6){a.playing=false;playBtn();setT(BD[i].t)}a.dirty=true});
  ["mousedown","click","touchstart"].forEach(t=>g.addEventListener(t,e=>{if(e.target.closest("[data-i]"))e.stopPropagation()},{passive:t!=="mousedown"}))},
 draw(a){const g=a.svg.querySelector(".gfl-bd");let lo="",hi="",lab="";const T=a.T;
  const cand=[];BD.forEach((c,i)=>{const p=proj(c.ll);if(!p)return;const on=T>=c.t-1e-6,age=(T-c.t)*12,x=p[0].toFixed(1),y=p[1].toFixed(1);
   if(on){const r=Math.min(30,7+age*2.2);lo+='<circle class="gfl-bd-halo" cx="'+x+'" cy="'+y+'" r="'+r.toFixed(1)+'"/>';
    hi+='<g class="gfl-bd-c on'+(age<2.5?" new":"")+(a.st.pick===i?" pick":"")+'" data-i="'+i+'" transform="translate('+x+","+y+')"><circle class="hit" r="14"/><circle class="dot" r="6"/>'+(age<2.5?'<circle class="pulse" r="6"/>':"")+'</g>';
    const big=age<2.5||a.st.pick===i||i===0;cand.push({big,p,c,i,t:esc(c.n)+(big?" · "+esc(c.lab):"")})}
   else hi+='<g class="gfl-bd-c" data-i="'+i+'" transform="translate('+x+","+y+')"><circle class="hit" r="12"/><circle class="dot0" r="3.6"/></g>'});
  /* names: the newest and the picked first, then the rest where they do not overlap */
  const box=[];cand.sort((u,v)=>(v.big-u.big)||(v.c.t-u.c.t)).forEach(o=>{const w=o.t.replace(/&[^;]+;/g,"x").length*(o.big?7.6:6.6),b=[o.p[0]+9,o.p[1]-9,o.p[0]+11+w,o.p[1]+6];
   if(box.some(q=>b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]))return;box.push(b);lab+='<text class="gfl-bd-l'+(o.big?" big":"")+'" x="'+(o.p[0]+10).toFixed(1)+'" y="'+(o.p[1]+4).toFixed(1)+'">'+o.t+'</text>'});
  g.innerHTML=lo+hi+lab},
 card(a){const T=a.T,on=BD.filter(c=>c.t<=T+1e-6),yr=Math.floor(T),mo=Math.min(11,Math.floor((T-yr)*12));
  const pick=a.st.pick>=0&&BD[a.st.pick].t<=T+1e-6?BD[a.st.pick]:null,last=pick||on.slice().sort((x,y)=>x.t-y.t).pop();
  return{count:'<span class="gfl-big">'+MON[mo]+" "+yr+'</span><span class="gfl-sub">'+on.length+' of '+BD.length+' cities struck</span><div class="gfl-bar gfl-red"><i style="width:'+(on.length/BD.length*100).toFixed(1)+'%"></i></div>',
   head:last?esc(last.n)+", "+esc(last.lab):"",body:last?esc(last.x||"Struck "+last.lab+"."):""}},
 unmount(){}};

/* ======================= 6. festivals | Hogmanay and the race to midnight ======================= */
/* Offsets from UTC in force on 31 December (IANA time zone database): Kiritimati +14; Samoa and Tonga +13 (Samoa moved across
   the date line at the end of 29 December 2011, skipping the 30th); New Zealand +13 in summer; Sydney +11 in summer, Brisbane
   +10 (no summer time); Tokyo and Seoul +9; Beijing, Singapore and Perth +8; Bangkok and Jakarta +7; Dhaka +6; Kathmandu +5:45;
   India +5:30; Karachi +5; Dubai +4; Tehran +3:30; Moscow and Nairobi +3; Cairo and Johannesburg +2; Paris, Berlin and Lagos +1;
   London, Edinburgh and Reykjavík 0; Praia (Cape Verde) −1; Rio and Buenos Aires −3; St John's −3:30; New York −5; Chicago and
   Mexico City −6; Denver −7; Los Angeles −8; Anchorage −9; Honolulu −10; American Samoa −11; Howland Island (nobody lives
   there) −12. T = hours after 00:00 UTC on 31 December. */
const NY=[["Kiritimati",-157.4,1.87,14,"Kiribati moved its eastern islands to this side of the date line in 1995. They see the new year first."],["Apia, Samoa",-171.76,-13.83,13,"Samoa jumped across the date line in 2011, skipping 30 December, to share its week with Australia and New Zealand."],
 ["Nukuʻalofa, Tonga",-175.2,-21.14,13,""],["Auckland",174.76,-36.85,13,"Summer time in New Zealand: the first big city to celebrate."],["Sydney",151.21,-33.87,11,"Fireworks over the Harbour Bridge."],["Brisbane",153.03,-27.47,10,"Queensland has no summer time, so it waits an hour longer than Sydney."],
 ["Tokyo",139.69,35.69,9,"In Japan, temple bells ring 108 times."],["Seoul",126.98,37.57,9,""],["Beijing",116.4,39.9,8,"China marks 1 January, but its great festival is the Lunar New Year, weeks later."],["Singapore",103.82,1.35,8,""],["Perth",115.86,-31.95,8,""],
 ["Bangkok",100.5,13.75,7,""],["Jakarta",106.85,-6.2,7,""],["Dhaka",90.41,23.81,6,""],["Kathmandu",85.32,27.72,5.75,"Nepal’s clocks are 5 hours 45 minutes ahead of UTC: one of the few with a quarter hour."],["Delhi",77.21,28.61,5.5,"All of India keeps one time, 5½ hours ahead of UTC."],
 ["Karachi",67.0,24.86,5,""],["Dubai",55.27,25.2,4,""],["Tehran",51.39,35.69,3.5,"Iran’s own new year, Nowruz, comes in March, at the spring equinox."],["Moscow",37.62,55.75,3,""],["Nairobi",36.82,-1.29,3,""],
 ["Cairo",31.24,30.04,2,""],["Johannesburg",28.05,-26.2,2,""],["Paris",2.35,48.86,1,""],["Berlin",13.4,52.52,1,""],["Lagos",3.38,6.52,1,""],
 ["Edinburgh",-3.19,55.95,0,"Hogmanay! Crowds sing ‘Auld Lang Syne’, and the first visitor over the doorstep, the ‘first-foot’, brings luck."],["London",-0.13,51.51,0,""],["Reykjavík",-21.9,64.15,0,""],["Praia, Cape Verde",-23.51,14.93,-1,""],
 ["Rio de Janeiro",-43.2,-22.9,-3,""],["Buenos Aires",-58.38,-34.6,-3,""],["St John’s",-52.71,47.56,-3.5,"Newfoundland is 3½ hours behind UTC."],["New York",-73.99,40.76,-5,"The ball drops in Times Square."],
 ["Chicago",-87.63,41.88,-6,""],["Mexico City",-99.13,19.43,-6,""],["Denver",-104.99,39.74,-7,""],["Los Angeles",-118.24,34.05,-8,""],["Anchorage",-149.9,61.22,-9,""],["Honolulu",-157.86,21.31,-10,""],
 ["Pago Pago, American Samoa",-170.7,-14.28,-11,"Among the last. Its neighbour Samoa celebrated a whole day ago."],["Howland Island",-176.62,.81,-12,"Nobody lives here: the very last place on Earth to reach the new year."]].map(([n,lon,lat,o,x])=>({n,ll:[lon,lat],o,x,m:24-o}));
const MIDNIGHT={key:"festivals|Hogmanay and the race to midnight",cls:"ny",t0:9.75,t1:36.25,playSecs:52,sliderLabel:"Time on New Year’s Eve (UTC)",
 instr:"🎆 Drag the clock, or press ▶: watch midnight race west round the world. The globe follows it.",
 note:"Clocks as set on New Year’s Eve. UTC is the world’s reference time (London’s winter time).",
 mount(a){a.svg.innerHTML='<g class="gfl-nyc"></g>';a.st.follow=true;a._rotAt=0},
 draw(a){const g=a.svg.querySelector(".gfl-nyc"),T=a.T;let s="",l="";
  /* turn the globe to follow midnight (where the sun is lowest) while playing or dragging the clock */
  try{const gl=G();if(gl&&!gl._flat&&a.st.follow&&(a.playing||a._sl)){const now=performance.now();if(now-a._rotAt>350){a._rotAt=now;let lon=((24-T)*15)%360;if(lon>180)lon-=360;if(lon<-180)lon+=360;
   const r=gl.rot||[0,0];let dl=-lon-r[0];dl=((dl+540)%360)-180;if(Math.abs(dl)>3){gl.rot=[r[0]+dl,-5].concat(r.length>2?[r[2]]:[]);gl.request?gl.request():gl.render&&gl.render()}}}}catch(e){}
  NY.forEach((c,i)=>{const p=proj(c.ll);if(!p)return;const d=T-c.m,x=p[0].toFixed(1),y=p[1].toFixed(1);
   if(d>=0){const fresh=d<1;s+='<g class="gfl-nyc-c on'+(fresh?" fresh":"")+'" transform="translate('+x+","+y+')">'+(fresh?burst(i):"")+'<circle class="dot" r="5"/></g>';
    if(fresh)l+='<text class="gfl-ny-l big" x="'+(p[0]+9).toFixed(1)+'" y="'+(p[1]-8).toFixed(1)+'">'+esc(c.n.split(",")[0])+' 🎉</text>'}
   else{s+='<g class="gfl-nyc-c" transform="translate('+x+","+y+')"><circle class="dot0" r="3.5"/></g>';if(c.m-T<1.01&&c.m-T>0)l+='<text class="gfl-ny-l soon" x="'+(p[0]+8).toFixed(1)+'" y="'+(p[1]+4).toFixed(1)+'">'+esc(c.n.split(",")[0])+' · '+mins(c.m-T)+'</text>'}});
  g.innerHTML=s+l},

 card(a){const T=a.T,day=T<24?"31 Dec":"1 Jan",h=((T%24)+24)%24,H=Math.floor(h+1e-9),M=Math.round((h-H)*60)%60;
  const done=NY.filter(c=>T>=c.m-1e-9),last=done.length?done.reduce((x,y)=>y.m>x.m||(y.m===x.m&&y.x&&!x.x)?y:x):null,nx=NY.filter(c=>c.m>T+1e-9).sort((x,y)=>x.m-y.m)[0];
  const same=last?NY.filter(c=>c.m===last.m).map(c=>c.n.split(",")[0]):[];const off=o=>"UTC"+(o>=0?"+":"−")+Math.floor(Math.abs(o))+(Math.abs(o)%1?":"+String(Math.round(Math.abs(o)%1*60)).padStart(2,"0"):"");
  let body=last?esc(last.x||("Midnight in "+same.join(", ")+".")):"Kiritimati, in Kiribati, is 14 hours ahead of UTC: the first place to see the new year.";
  if(last&&last.n.startsWith("Pago")){const km=Math.round(d3.geoDistance(NY[1].ll,last.ll)*6371/10)*10;body=esc("Among the last. Its neighbour Samoa, only about "+km.toLocaleString("en-GB")+" km away, celebrated a whole day ago.")}
  return{count:'<span class="gfl-big">'+String(H).padStart(2,"0")+":"+String(M).padStart(2,"0")+' <small>UTC, '+day+'</small></span><span class="gfl-sub">'+done.length+' of '+NY.length+' places in the new year'+(nx?' · next: '+esc(nx.n.split(",")[0])+' in '+mins(nx.m-T):"")+'</span>'+
   '<div class="gfl-bar gfl-gold"><i style="width:'+(done.length/NY.length*100).toFixed(1)+'%"></i></div>',head:last?"Midnight in "+esc(same.slice(0,3).join(", "))+" ("+off(last.o)+")":"Not yet midnight anywhere",body}}};
function burst(i){let s='<g class="gfl-burst" style="--d:'+((i%4)*.17).toFixed(2)+'s">';const cols=["#ffd34d","#ff6b6b","#7ee0ff","#b98bff","#7dff9a"];for(let k=0;k<10;k++){const an=k/10*Math.PI*2;s+='<line x1="0" y1="0" x2="'+(Math.cos(an)*16).toFixed(1)+'" y2="'+(Math.sin(an)*16).toFixed(1)+'" stroke="'+cols[(k+i)%5]+'"/>'}return s+'</g>'}
function mins(h){const m=Math.round(h*60);return m>=60?Math.floor(m/60)+" h "+(m%60?String(m%60).padStart(2,"0")+" min":""):m+" min"}

/* ======================= the watchdog ======================= */
const MODS=[TERN,FOGG,BEAGLE,IBN,PLAGUE,MIDNIGHT],BYKEY={};MODS.forEach(m=>{BYKEY[m.key]=m});
/* stops that hand their own route lines over to ours (the moving travellers of geoflock-walkers.js go with them) */
function prep(){let ok=true;MODS.forEach(m=>{if(!m.hideLines)return;try{const[t,ti]=m.key.split("|"),T=PS_TOURS[t],s=T&&T.steps.find(x=>x.title===ti);if(!s){ok=false;return}if(s._gfl)return;s._gfl=1;
  let orig=s.lines;Object.defineProperty(s,"lines",{configurable:true,enumerable:true,get(){try{if(typeof ps!=="undefined"&&ps&&ps.mode==="globe")return[]}catch(e){}return orig},set(v){orig=v}})}catch(e){ok=false}});return ok}
{let n=0;const t0=setInterval(()=>{try{if(typeof PS_TOURS!=="undefined"&&(prep()||++n>120))clearInterval(t0)}catch(e){if(++n>120)clearInterval(t0)}},500)}
function tick(){try{const k=stopKey(),M=BYKEY[k];if(!M){if(A)unmount();return}
  if(A&&A.M!==M)unmount();mount(M);ensureCard()}catch(e){console.error(e)}}
setInterval(tick,300);
/* react at once when the stop changes or the tour ends, not only on the next poll */
{let n=0;const done={};const w=setInterval(()=>{try{["psGo","psEnd"].forEach(f=>{const o=window[f];if(typeof o==="function"&&!done[f]){done[f]=1;const x=function(){const r=o.apply(this,arguments);try{tick();setTimeout(tick,0)}catch(e){}return r};window[f]=x}});if(++n>40||done.psGo&&done.psEnd)clearInterval(w)}catch(e){clearInterval(w)}},500)}
addEventListener("resize",()=>{if(A)A.dirty=true});

{const s=document.createElement("style");s.textContent=`
.gfl-layer{position:absolute;inset:0;pointer-events:none;z-index:7}
.gfl-svg{position:absolute;left:0;top:0;overflow:visible}.gfl-html{position:absolute;inset:0}
body.gfl-nowalk .hw-lay{display:none}body.gfl-on .ps-leaders{opacity:.5}
.gfl-route{fill:none;stroke:rgba(255,255,255,.75);stroke-width:1.8;stroke-dasharray:4 5}
.gfl-wake-h{fill:none;stroke:rgba(255,255,255,.9);stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.gfl-wake{fill:none;stroke:#d9682b;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
.gfl-evdot{fill:#fff;stroke:#9a4a16;stroke-width:1.6}.gfl-evdot.gfl-reached{fill:#d9682b;stroke:#fff}
.gfl-trav{pointer-events:all;cursor:grab;touch-action:none;outline:none}.gfl-trav.gfl-drag{cursor:grabbing}
.gfl-hit{fill:rgba(255,255,255,.001)}.gfl-icbg{fill:#fff;stroke:#d9682b;stroke-width:2.5;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}
.gfl-emo{font-size:20px;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;pointer-events:none}
.gfl-trav:hover .gfl-icbg,.gfl-trav:focus-visible .gfl-icbg{stroke-width:4}
.gfl-ternic,.gfl-ship{filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}.gfl-ternic{transform:scale(1.25)}.gfl-ship{transform:scale(1.15)}
.gfl-trav:hover .gfl-ternic,.gfl-trav:hover .gfl-ship{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.5))}
.gfl-bub{position:absolute;transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:13.5px;padding:5px 11px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.3);pointer-events:none}
.gfl-bub small{font-weight:700;color:#ffc58a;margin-left:4px}
.gfl-hint{position:absolute;background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:gflNudge 1.4s ease-in-out infinite;pointer-events:none;white-space:nowrap}
@keyframes gflNudge{50%{transform:translateX(6px)}}
.gfl-ctl{margin:10px 0 6px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.14);font-size:14px;line-height:1.4}
.gfl-do{font-weight:700;font-size:13.5px;margin-bottom:8px;color:#13294b}
.gfl-row{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.gfl-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gfl-play:focus-visible,.gfl-seg button:focus-visible,.gfl-sail:focus-visible{outline:3px solid #13294b;outline-offset:2px}
.gfl-range{flex:1 1 auto;min-width:0;accent-color:#d9682b;height:28px}
.gfl-big{display:block;font-weight:800;font-size:21px;line-height:1.2;color:#9a4a16}.gfl-big small{font-size:13px;font-weight:700;opacity:.8}
.gfl-sub{display:block;font-weight:700;font-size:13px;opacity:.85}.gfl-sub2{font-size:12px;opacity:.75;margin-top:2px}
.gfl-ep{margin-top:8px}.gfl-ep b{display:block;font-size:15px;margin-bottom:1px}.gfl-ep span{display:block}
.gfl-ep.gfl-new{animation:gflIn .45s ease}@keyframes gflIn{from{opacity:.2;transform:translateY(4px)}}
.gfl-note{margin-top:8px;font-size:11.5px;opacity:.65}
.gfl-bar{display:inline-block;position:relative;height:9px;border-radius:5px;background:rgba(19,41,75,.13);overflow:hidden;vertical-align:middle}
.gfl-bar i{position:absolute;left:0;top:0;bottom:0;background:#e9a23b;border-radius:5px}
div.gfl-bar{display:block;margin-top:5px;width:100%}.gfl-red i{background:#b3261e}.gfl-gold i{background:#d9a21b}.gfl-yrs i{background:#a0703a}
.gfl-day{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:13px}.gfl-day span:first-child{flex:0 0 112px;font-weight:700}.gfl-day .gfl-bar{flex:1 1 auto}.gfl-day b{flex:0 0 62px;text-align:right}
.gfl-day2{opacity:.7}
.gfl-seg{display:inline-flex;border:1.5px solid #d9682b;border-radius:999px;overflow:hidden;margin-bottom:8px}
.gfl-seg button{border:0;background:transparent;color:#9a4a16;font-weight:800;font-size:13px;padding:6px 14px;cursor:pointer}.gfl-seg button.on{background:#d9682b;color:#fff}
.gfl-clock{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gfl-chip{font-weight:800;font-size:12.5px;padding:2px 9px;border-radius:999px;background:#e6edf5;color:#13294b}.gfl-chip.up{background:#dff3e4;color:#1e6b34}.gfl-chip.down{background:#fde2e0;color:#a2271c}
.gfl-cells{display:grid;grid-template-columns:repeat(40,1fr);gap:1.5px;margin:6px 0 4px}.gfl-cells i{height:7px;border-radius:2px;background:rgba(19,41,75,.13)}.gfl-cells i.used{background:#d9682b}
.gfl-diary{margin-top:4px;font-size:13px;color:#a2271c}.gfl-diary small{font-weight:700;opacity:.8}
.gfl-drawer{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.gfl-slot{border:1.5px dashed rgba(19,41,75,.3);border-radius:10px;padding:5px 4px;text-align:center;font-size:11.5px;line-height:1.2;min-height:76px}
.gfl-slot.got{border:2px solid var(--c);background:color-mix(in srgb,var(--c) 10%,transparent);animation:gflIn .45s ease}
.gfl-slot b{display:block;font-size:12px;margin-top:2px}.gfl-slot small{display:block;opacity:.8}.gfl-slot .q{display:block;font-size:20px;font-weight:800;opacity:.35;height:26px}
.gfl-sail{margin-top:8px;border:0;border-radius:999px;background:#d9682b;color:#fff;font-weight:800;font-size:13.5px;padding:8px 14px;cursor:pointer}
.gfl-island{pointer-events:all;cursor:pointer}.gfl-island .ring{fill:rgba(255,255,255,.12);stroke:#fff;stroke-width:2;stroke-dasharray:4 4}
.gfl-island.nx .ring{stroke:#ffd34d;stroke-width:3;animation:gflSpin 6s linear infinite}.gfl-island.got .ring{stroke:#7dff9a;stroke-dasharray:none}
@keyframes gflSpin{to{stroke-dashoffset:-48}}
.gfl-island .num{fill:#13294b;stroke:#fff;stroke-width:1.5}.gfl-island.got .num{fill:#1e6b34}.gfl-island .numt{fill:#fff;font:800 12px system-ui,sans-serif}
.gfl-island .lab,.gfl-ny-l,.gfl-bd-l{font:800 14px system-ui,sans-serif;fill:#fff;paint-order:stroke;stroke:rgba(10,20,35,.85);stroke-width:3.5px;stroke-linejoin:round}
.gfl-island .lab2{font:700 11.5px system-ui,sans-serif;fill:#fff;paint-order:stroke;stroke:rgba(10,20,35,.8);stroke-width:3px;font-style:italic}
.gfl-trail{stroke:#ffd34d;stroke-dasharray:6 5;stroke-width:2.4}
.gfl-lead{stroke:#fff;stroke-width:1.6;opacity:.9}.gfl-isldot{fill:#ffd34d;stroke:#13294b;stroke-width:1.2}
.gfl-bd-halo{fill:rgba(179,38,30,.22);stroke:rgba(179,38,30,.45);stroke-width:1}
.gfl-bd-c{pointer-events:all;cursor:pointer}.gfl-bd-c .hit{fill:rgba(255,255,255,.001)}.gfl-bd-c .dot{fill:#b3261e;stroke:#fff;stroke-width:1.8}.gfl-bd-c .dot0{fill:#fff;stroke:#555;stroke-width:1.2}
.gfl-bd-c.pick .dot{stroke:#ffd34d;stroke-width:3}
.gfl-bd-c .pulse{fill:none;stroke:#ff3b30;stroke-width:2.5;animation:gflPulse 1.2s ease-out infinite}
@keyframes gflPulse{from{r:6;opacity:1}to{r:22;opacity:0}}
.gfl-bd-l{font-size:12px;stroke-width:3px}.gfl-bd-l.big{font-size:14px}
.gfl-nyc-c .dot{fill:#ffd34d;stroke:#7a5200;stroke-width:1.5}.gfl-nyc-c .dot0{fill:rgba(255,255,255,.85);stroke:#333;stroke-width:1}
.gfl-burst line{stroke-width:2.6;stroke-linecap:round;transform-origin:0 0;animation:gflBurst 1.1s ease-out infinite;animation-delay:var(--d)}
@keyframes gflBurst{0%{transform:scale(.15);opacity:1}70%{opacity:1}100%{transform:scale(1.5);opacity:0}}
.gfl-ny-l.big{font-size:15px}.gfl-ny-l.soon{font-size:12px;font-weight:700;opacity:.9}
@media (prefers-reduced-motion:reduce){.gfl-hint,.gfl-burst line,.gfl-bd-c .pulse,.gfl-island.nx .ring{animation:none}}
body.dark-theme .gfl-ctl,body.sky-night .gfl-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14)}
body.dark-theme .gfl-do,body.sky-night .gfl-do{color:#e8eef7}body.dark-theme .gfl-big,body.sky-night .gfl-big{color:#ffb27a}
body.dark-theme .gfl-bar,body.sky-night .gfl-bar,body.dark-theme .gfl-cells i,body.sky-night .gfl-cells i{background:rgba(255,255,255,.15)}
body.dark-theme .gfl-seg button,body.sky-night .gfl-seg button{color:#ffb27a}body.dark-theme .gfl-seg button.on,body.sky-night .gfl-seg button.on{color:#fff}
body.dark-theme .gfl-slot,body.sky-night .gfl-slot{border-color:rgba(255,255,255,.3)}body.dark-theme .gfl-diary,body.sky-night .gfl-diary{color:#ff9d92}`;document.head.appendChild(s)}
window.gfInteractLife={mods:MODS,get:()=>A?{key:A.key,T:A.T,st:A.st}:null,set:t=>setT(t),journey,jAt};
})();
