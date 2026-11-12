/* GeoFlock: six human-geography tour stops you can play with, not just read. Each one puts things on the globe that
   you drag, plus a small control block on the card (right after the stop's headline), and teaches one idea by doing it.
   - Transport tour, "Suez: the ditch the world needs": two container ships leave Shanghai together for Rotterdam, one
     through the Suez Canal, one round the Cape of Good Hope. Press Play, drag the slider or drag a ship; change the
     ships' speed. The card counts the days and says where the slower ship is when the faster one docks.
   - Time zones tour, "The date line": every Pacific town shows its own weekday and time, coloured by date, and a plane
     you drag across the date line flips the calendar on the card a whole day, forward going west, back going east.
   - AP Human Geography 2a, "America's moving middle": slide (or drag the dot, or Play) through all 24 censuses from
     1790 to 2020 and watch the mean centre of population walk west, then south-west, with the population and why.
   - Transport tour, "Planes stop in Alaska": drag two airports anywhere; the shortest route on the globe (a great
     circle) and the line that looks straight on a flat map are drawn with their lengths, and how close the shortest
     route passes to Anchorage.
   - AP Human Geography 4d, "Concrete on two rocks": drag Okinotorishima anywhere and switch it between "rock" and
     "island" to see how much sea the law gives each: 12 nautical miles, or 200.
   - AP Human Geography 1, "Time-space compression": a sailing ship (1620), a steamship (1840), Concorde and a jet
     leave Britain together for America. Press Play: the plane lands while the Mayflower has barely left harbour.
   Everything is drawn in an overlay of the Maps globe (amGlobe.host) with amGlobe.projection(), redrawn when the view
   changes, and removed (map layer, card block, timers) as soon as the stop changes or the tour ends. Nothing here
   blocks Next/Back, and every step is wrapped so it cannot throw into the tour. Same pattern as geoflock-odyssey.js. */
(function(){
"use strict";
const RE=6371.0088,RAD=Math.PI/180,NM=1.852;/* mean Earth radius (km, IUGG); one nautical mile = 1.852 km exactly */
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtN=n=>Math.round(n).toLocaleString("en-GB");
const kmTxt=n=>fmtN(n)+" km";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const dist=(a,b)=>{try{return d3.geoDistance(a,b)*RE}catch(e){return 0}};
/* a polyline made smooth: great-circle points every `step` km, with the running distance at each */
function densify(pts,step){const P=[],K=[];let k=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],d=dist(a,b),n=Math.max(1,Math.ceil(d/(step||100))),f=d3.geoInterpolate(a,b);
  for(let j=0;j<n;j++){const p=f(j/n);if(P.length)k+=dist(P[P.length-1],p);P.push(p);K.push(k)}}
 const last=pts[pts.length-1];if(P.length)k+=dist(P[P.length-1],last);P.push(last);K.push(k);return{P,K,L:k}}
function along(R,km){km=clamp(km,0,R.L);let lo=0,hi=R.K.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.K[m]<=km)lo=m;else hi=m}
 const a=R.P[lo],b=R.P[hi],s=R.K[hi]-R.K[lo],f=s>0?(km-R.K[lo])/s:0;return{ll:d3.geoInterpolate(a,b)(f),i:lo}}
const compass=b=>["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round(((b%360)+360)%360/45)%8];
function bearing(a,b){const p1=a[1]*RAD,p2=b[1]*RAD,dl=(b[0]-a[0])*RAD;return Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))/RAD}

/* ================================================================ the shared layer */
let L=null,MOD=null,raf=0,lastT=0;
function stopNow(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;
 const t=String(S.title||"").replace(/​/g,"").trim();return MODS.find(m=>m.tour===ps.tour&&m.title===t)||null}catch(e){return null}}
function proj(ll){const G=g();if(!G||!L||!ll)return null;try{const p=G.projection();if(!G._flat){const r=p.rotate();if(d3.geoDistance([-r[0],-r[1]],ll)>Math.PI/2-.03)return null}
 const s=p(ll);return s&&isFinite(s[0])&&isFinite(s[1])?[s[0]+L.ox,s[1]+L.oy]:null}catch(e){return null}}
/* screen point (clientX/Y) to [lon,lat], only on the visible side of the globe */
function toLL(cx,cy){const G=g();if(!G)return null;try{const r=G.canvas.getBoundingClientRect(),p=G.projection(),ll=p.invert([cx-r.left,cy-r.top]);if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return null;
 if(!G._flat){const r0=p.rotate();if(d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return null}return[((ll[0]+540)%360)-180,clamp(ll[1],-89.9,89.9)]}catch(e){return null}}
function pathOf(pts){let d="",pen=false,px=0,py=0;const G=g(),J=G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
/* make an SVG group draggable without the globe turning underneath it */
function draggable(node,o){
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{node.setPointerCapture(e.pointerId)}catch(_){}node.classList.add("gfh-dragging");try{o.start&&o.start(e)}catch(_){}
  const mv=ev=>{ev.stopPropagation();try{o.move(ev);if(L)L.dirty=true}catch(err){}};
  const up=ev=>{node.removeEventListener("pointermove",mv);node.removeEventListener("pointerup",up);node.removeEventListener("pointercancel",up);node.classList.remove("gfh-dragging");try{o.end&&o.end(ev)}catch(_){}if(L)L.dirty=true};
  node.addEventListener("pointermove",mv);node.addEventListener("pointerup",up);node.addEventListener("pointercancel",up)};
 node.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>node.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
const NS="http://www.w3.org/2000/svg";
function el(tag,attrs,parent){const n=document.createElementNS(NS,tag);for(const k in attrs||{})n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n}
function place(n,q){if(!q){n.style.display="none";return false}n.style.display="";n.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")");return true}
/* the screen point of a line nearest its middle that is on the visible globe and not hidden under the tour card */
function freePt(pts){let cr=null;try{const c=ps&&ps.card,h=L.host.getBoundingClientRect();if(c&&c.offsetParent){const r=c.getBoundingClientRect();cr=[r.left-h.left-10,r.top-h.top-10,r.right-h.left+10,r.bottom-h.top+10]}}catch(e){}
 const m=pts.length>>1;for(let d=0;d<=m;d++)for(const i of[m+d,m-d]){const q=pts[i]&&proj(pts[i]);if(q&&!(cr&&q[0]>cr[0]&&q[0]<cr[2]&&q[1]>cr[1]&&q[1]<cr[3]))return q}return null}
/* a label pill on the map (HTML, so it stays crisp and readable) */
function pill(cls){const d=document.createElement("div");d.className="gfh-pill "+(cls||"");L.el.appendChild(d);return d}
function putPill(d,q,html,dx,dy,anchor){if(!q){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}
 d.style.left=(q[0]+(dx||0))+"px";d.style.top=(q[1]+(dy||0))+"px";d.style.transform=anchor==="l"?"translate(-100%,-50%)":anchor==="r"?"translate(0,-50%)":"translate(-50%,-100%)"}

function mount(m){const G=g();if(!G||!G.host||!G.canvas)return;unmount();
 const host=G.host,div=document.createElement("div");div.className="gfh-layer";div.innerHTML='<svg class="gfh-svg"></svg>';host.appendChild(div);
 L={m,host,el:div,svg:div.querySelector("svg"),ox:0,oy:0,dirty:true,key:"",st:{}};MOD=m;document.body.classList.add("gfh-on","gfh-"+m.id);
 try{m.init(L)}catch(e){console.error("interact-human",m.id,e)}
 lastT=0;loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(MOD){try{MOD.cleanup&&MOD.cleanup(L)}catch(e){}document.body.classList.remove("gfh-on","gfh-"+MOD.id)}
 if(L&&L.el)L.el.remove();L=null;MOD=null;document.querySelectorAll(".gfh-ctl").forEach(c=>c.remove())}
function draw(){if(!L)return;const G=g();if(!G||!G.canvas)return;const hr=L.host.getBoundingClientRect(),cr=G.canvas.getBoundingClientRect();L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
 L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);
 let k="";try{const p=G.projection();k=p.rotate().map(v=>v.toFixed(3)).join(",")+"|"+p.scale().toFixed(2)+"|"+p.translate().map(v=>v.toFixed(1)).join(",")+"|"+hr.width+"x"+hr.height+"|"+L.ox+","+L.oy+"|"+(G._flat?1:0)}catch(e){k=String(Date.now())}
 if(k===L.key&&!L.dirty)return;L.key=k;L.dirty=false;L.m.draw(L);try{L.m.card&&L.m.card(L)}catch(e){}}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const dt=lastT?Math.min(.1,(t-lastT)/1000):0;lastT=t;if(L.m.tick&&L.m.tick(L,dt))L.dirty=true;draw()}catch(e){console.error("interact-human",e)}loop()})}
/* the control block on the card, rebuilt if the card is redrawn */
function ensureCard(){try{if(!L||typeof ps==="undefined"||!ps||!ps.card)return;if(ps.card.querySelector(".gfh-ctl"))return;const at=ps.card.querySelector(".ps-stat");if(!at)return;
 const c=document.createElement("div");c.className="gfh-ctl gfh-c-"+L.m.id;c.innerHTML='<div class="gfh-do">'+L.m.instr+'</div>'+L.m.html();at.after(c);
 ["pointerdown","mousedown","touchstart","wheel"].forEach(t=>c.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 L.c=c;L.m.wire(L,c);L.dirty=true}catch(e){console.error("interact-human card",e)}}
const q$=(sel)=>L&&L.c?L.c.querySelector(sel):null;
function setTxt(sel,t){const n=q$(sel);if(n&&n.textContent!==t)n.textContent=t}
function setHTML(sel,h){const n=q$(sel);if(n&&n._h!==h){n.innerHTML=h;n._h=h}}
function playBtn(on){const b=q$(".gfh-play");if(b){b.textContent=on?"❚❚":"▶";b.setAttribute("aria-label",on?"Pause":"Play")}}
function range(sel,v,max){const r=q$(sel);if(r&&document.activeElement!==r)r.value=Math.round(v*(max||1000))}

/* icons, drawn round 0,0 */
const SHIP_C='<g class="gfh-hull"><path d="M-20 0 L20 0 L16 8 L-17 8 Z" fill="#23384f" stroke="#0d1b2a" stroke-width="1"/><path d="M-20 0 L20 0 L19 2.4 L-19.5 2.4 Z" fill="#c0392b"/>'+
 '<rect x="-15" y="-6" width="6" height="6" fill="#e8590c" stroke="#0d1b2a" stroke-width=".6"/><rect x="-9" y="-6" width="6" height="6" fill="#2a78d0" stroke="#0d1b2a" stroke-width=".6"/><rect x="-3" y="-6" width="6" height="6" fill="#f2c94c" stroke="#0d1b2a" stroke-width=".6"/>'+
 '<rect x="3" y="-6" width="6" height="6" fill="#3a9a5b" stroke="#0d1b2a" stroke-width=".6"/><rect x="-12" y="-12" width="6" height="6" fill="#2a78d0" stroke="#0d1b2a" stroke-width=".6"/><rect x="-6" y="-12" width="6" height="6" fill="#e8590c" stroke="#0d1b2a" stroke-width=".6"/>'+
 '<rect x="0" y="-12" width="6" height="6" fill="#c0392b" stroke="#0d1b2a" stroke-width=".6"/><rect x="11" y="-11" width="6" height="11" fill="#f4f1ea" stroke="#0d1b2a" stroke-width=".7"/></g>';
const PLANE='<g class="gfh-hull"><path d="M18 0 C18 -2 15 -3 12 -3 L4 -3 L-6 -14 L-10 -14 L-4 -3 L-12 -3 L-16 -8 L-19 -8 L-16 0 L-19 8 L-16 8 L-12 3 L-4 3 L-10 14 L-6 14 L4 3 L12 3 C15 3 18 2 18 0 Z" fill="#fff" stroke="#13294b" stroke-width="1.4" stroke-linejoin="round"/></g>';
const SAIL='<g class="gfh-hull"><path d="M-13 1 Q-11 7 -5 8 L9 8 Q14 6 15 0 Z" fill="#6b3d1e" stroke="#2c1708" stroke-width="1"/><path d="M0 1 V-17" stroke="#2c1708" stroke-width="1.4"/>'+
 '<path d="M-9 -15 Q0 -18 9 -15 L8 -3 Q0 -5 -8 -3 Z" fill="#f4ead3" stroke="#2c1708" stroke-width="1"/></g>';
const STEAM='<g class="gfh-hull"><path d="M-16 0 L17 0 L13 8 L-14 8 Z" fill="#1d1d1d" stroke="#000" stroke-width="1"/><rect x="-10" y="-5" width="18" height="5" fill="#f4f1ea" stroke="#333" stroke-width=".7"/>'+
 '<rect x="-2" y="-14" width="5" height="9" fill="#d9682b" stroke="#333" stroke-width=".7"/><rect x="-2" y="-14" width="5" height="2.5" fill="#1d1d1d"/><path d="M-12 0 V-16 M12 0 V-14" stroke="#4a3a2a" stroke-width="1.1"/><path d="M4 -16 q4 -4 9 -3" stroke="#9aa" stroke-width="2" fill="none" opacity=".7"/></g>';

/* ================================================================ 1. Suez or the Cape: a race of two container ships
   Routes: the stop's own blue (Suez) and red (Cape) lines, so the ships sail exactly what the map shows; the Cape ship
   follows the blue line to Sri Lanka, the red one round Africa, and the blue one again from Portugal to Rotterdam.
   Distances are measured along those lines (about 19,000 km and 26,400 km: the stop's "about 7,000 km" saving).
   A knot is one nautical mile (1.852 km) an hour; 16 knots is an illustrative cruising speed for a big container ship. */
const SUEZ_FALLBACK=[[121.8,31],[119.5,24],[112,12],[104,1.2],[98,5.5],[80.5,5.5],[60,12],[50,12.5],[43.4,12.6],[38,20],[32.5,30],[25,33.5],[10,37.5],[-5.6,36],[-10,40],[-5,48.5],[1.5,50.5],[4.1,51.95]];
const CAPE_FALLBACK=[[80.5,5.5],[60,-10],[40,-30],[18.5,-36],[8,-25],[-5,-5],[-18,10],[-18,28],[-11,40]];
const SEA_NAMES=[[[121.8,31],"leaving Shanghai"],[[119.5,24],"in the Taiwan Strait"],[[112,12],"in the South China Sea"],[[104,1.2],"passing Singapore"],[[98,5.5],"in the Strait of Malacca"],[[80.5,5.5],"south of Sri Lanka"],
 [[62,11],"in the Arabian Sea"],[[46,12.5],"in the Gulf of Aden"],[[38,20],"in the Red Sea"],[[32.5,30],"in the Suez Canal"],[[22,34],"in the Mediterranean"],[[-5.6,36],"at Gibraltar"],[[-10,40],"off Portugal"],[[-6,47],"in the Bay of Biscay"],
 [[0,50.3],"in the English Channel"],[[4.1,51.95],"in Rotterdam"],[[62,-9],"in the Indian Ocean"],[[40,-30],"off South Africa"],[[18.5,-36],"rounding the Cape of Good Hope"],[[8,-25],"off Namibia"],
 [[-5,-5],"in the South Atlantic"],[[-17,10],"off West Africa"],[[-17,27],"off the Canary Islands"]];
const suez={id:"suez",tour:"transport",title:"Suez: the ditch the world needs",
 instr:"⛴ Press ▶ to race two ships from Shanghai to Rotterdam, or drag either ship.",
 init(L){const s=L.st;s.T=0;s.kn=16;s.play=false;let B=SUEZ_FALLBACK,C=CAPE_FALLBACK;
  try{const S=psSteps()[ps.i],ln=(S.lines||[]).filter(x=>x&&x.coords);if(ln[0]&&ln[0].coords.length>8)B=ln[0].coords;if(ln[1]&&ln[1].coords.length>3)C=ln[1].coords}catch(e){}
  const j0=B.findIndex(p=>Math.abs(p[0]-C[0][0])<.01&&Math.abs(p[1]-C[0][1])<.01),end=C[C.length-1];
  let j1=-1,bd=1e9;B.forEach((p,i)=>{const d=dist(p,end);if(i>j0&&d<bd){bd=d;j1=i}});
  const capePts=j0>=0&&j1>0?B.slice(0,j0+1).concat(C.slice(1),B.slice(j1)):B.slice(0,6).concat(CAPE_FALLBACK.slice(1),B.slice(14));
  s.R=[{n:"Via Suez",cls:"a",R:densify(B,60)},{n:"Via the Cape",cls:"b",R:densify(capePts,60)}];
  const sv=L.svg;s.R.forEach(r=>{r.halo=el("path",{class:"gfh-wake-halo"},sv);r.wake=el("path",{class:"gfh-wake gfh-"+r.cls},sv)});
  s.R.forEach(r=>{const gg=el("g",{class:"gfh-handle gfh-ship",tabindex:"0","aria-label":r.n+": drag to sail"},sv);el("circle",{r:24,class:"gfh-hit"},gg);r.flip=el("g",{},gg);r.flip.innerHTML=SHIP_C;r.g=gg;r.lab=pill("gfh-"+r.cls);
   draggable(gg,{start:()=>{s.play=false;playBtn(false)},move:ev=>{const hr=L.host.getBoundingClientRect(),px=ev.clientX-hr.left,py=ev.clientY-hr.top;let best=-1,bd=1e9;
     r.R.P.forEach((p,i)=>{const q=proj(p);if(!q)return;const d=Math.hypot(q[0]-px,q[1]-py);if(d<bd){bd=d;best=i}});if(best>=0)s.T=r.R.K[best]/suez.kmDay(s)}})});
  s.hint=pill("gfh-hint");s.onCv=()=>{s.userMoved=true};try{g().canvas.addEventListener("pointerdown",s.onCv,true)}catch(e){}},
 kmDay:s=>s.kn*NM*24,
 days(s,i){return s.R[i].R.L/this.kmDay(s)},
 tick(L,dt){const s=L.st;if(!s.play)return false;s.T+=dt*3.2;const mx=this.days(s,1);if(s.T>=mx){s.T=mx;s.play=false;playBtn(false)}
  /* while playing, the globe turns gently to keep both ships in view beside the card (until the reader turns it) */
  try{const G=g();if(G&&!G._flat&&!s.userMoved&&Array.isArray(G.rot)){const km=s.T*this.kmDay(s),a=along(s.R[0].R,km).ll,b=along(s.R[1].R,km).ll,mid=d3.geoInterpolate(a,b)(.5);
   const right=ps.card&&ps.card.classList.contains("ps-right"),lon=mid[0]+(right?28:-28),lat=clamp(mid[1],-20,30);let dl=((-lon-G.rot[0])%360+540)%360-180;const k=Math.min(1,dt*1.2);
   G.rot=[G.rot[0]+dl*k,G.rot[1]+(-lat-G.rot[1])*k].concat(G.rot.slice(2));(G.request||G.render).call(G)}}catch(e){}
  return true},
 cleanup(L){try{const G=g();if(G&&L.st.onCv)G.canvas.removeEventListener("pointerdown",L.st.onCv,true)}catch(e){}},
 draw(L){const s=L.st;s.R.forEach((r,i)=>{const km=s.T*this.kmDay(s),a=along(r.R,km),pts=r.R.P.slice(0,a.i+1);pts.push(a.ll);const d=pathOf(pts);r.wake.setAttribute("d",d);r.halo.setAttribute("d",d);
   const q=proj(a.ll);place(r.g,q);if(q){const b=proj(r.R.P[Math.min(r.R.P.length-1,a.i+2)]),f=proj(r.R.P[Math.max(0,a.i-1)]);if(b&&f&&Math.abs(b[0]-f[0])>.5)r.hd=b[0]>=f[0]?1:-1;r.flip.setAttribute("transform","scale("+(r.hd||-1)+",1)")}
   const done=km>=r.R.L-1,dd=Math.round(this.days(s,i));putPill(r.lab,q,(done?"✓ ":"")+'<b>'+r.n+'</b> · '+(done?"docked, day "+dd:"day "+Math.floor(s.T)),0,i?30:-22,i?"":"")});
  const q0=proj(s.R[0].R.P[0]);putPill(s.hint,s.T<.05&&q0?q0:null,"Drag a ship ⟶",34,-48,"r")},
 html(){return'<div class="gfh-row"><button type="button" class="gfh-play" aria-label="Play">▶</button><input type="range" class="gfh-range gfh-t" min="0" max="1000" value="0" aria-label="Days at sea"><span class="gfh-big gfh-day">Day 0</span></div>'+
  '<div class="gfh-bars"><div class="gfh-bar gfh-a"><span>Via Suez</span><i><b></b></i><em></em></div><div class="gfh-bar gfh-b"><span>Via the Cape</span><i><b></b></i><em></em></div></div>'+
  '<div class="gfh-out"></div><div class="gfh-row gfh-small"><span>Speed</span><input type="range" class="gfh-range gfh-kn" min="10" max="24" step="1" value="16" aria-label="Speed in knots"><span class="gfh-knv">16 knots</span></div>'+
  '<div class="gfh-note">Distances are measured along the routes drawn on the map. 16 knots (about 30 km/h) is a typical cruising speed for a big container ship today; try faster or slower.</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gfh-play").onclick=()=>{if(s.T>=this.days(s,1)-1e-6)s.T=0;s.play=!s.play;s.userMoved=false;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gfh-t");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.T=r.value/1000*this.days(s,1);L.dirty=true});
  const k=c.querySelector(".gfh-kn");k.addEventListener("input",()=>{const d0=s.T*this.kmDay(s);s.kn=+k.value;s.T=d0/this.kmDay(s);L.dirty=true})},
 card(L){const s=L.st,D0=this.days(s,0),D1=this.days(s,1);range(".gfh-t",s.T/D1);setTxt(".gfh-day","Day "+Math.floor(s.T));setTxt(".gfh-knv",s.kn+" knots");
  const km=s.T*this.kmDay(s);[0,1].forEach(i=>{const R=s.R[i].R,b=q$(i?".gfh-b":".gfh-a");if(!b)return;b.querySelector("b").style.width=(100*Math.min(1,km/R.L))+"%";
   const t=kmTxt(Math.round(R.L/100)*100)+" · "+Math.round(this.days(s,i))+" days";if(b.querySelector("em").textContent!==t)b.querySelector("em").textContent=t});
  const where=ll=>{let n="",bd=1e9;SEA_NAMES.forEach(([p,t])=>{const d=dist(p,ll);if(d<bd){bd=d;n=t}});return n};
  const capeAt=along(s.R[1].R,km).ll,gap=Math.round(D1-D0),xtra=Math.round((s.R[1].R.L-s.R[0].R.L)/100)*100;let o;
  if(s.T<.05)o="Both ships are loaded in Shanghai. The Cape route is about <b>"+kmTxt(xtra)+"</b> longer.";
  else if(km<s.R[0].R.L)o="The Suez ship is "+where(along(s.R[0].R,km).ll)+"; the Cape ship is "+where(capeAt)+".";
  else if(km<s.R[1].R.L)o="<b>The Suez ship has docked in Rotterdam.</b> The Cape ship is "+where(capeAt)+", still "+Math.max(1,Math.ceil(D1-s.T))+" days from port.";
  else o="Both have docked. Going round Africa cost <b>"+gap+" more days</b> at sea: more fuel, more crew wages, and goods arriving later.";
  setHTML(".gfh-out",o)}};

/* ================================================================ 2. The date line: drag a plane across it
   Times come from the browser's own time-zone database (Intl, IANA zones), so each town's weekday and clock are real;
   the moment is the one the stop's world clock shows (gfDNG.state.t), or now. The line is the same simplified
   International Date Line as geoflock-search-more.js (east round Russia's tip, west of the Aleutians, east round
   Kiribati, between Samoa and American Samoa, east of Tonga and New Zealand's Chatham Islands). */
const IDL=[[180,90],[180,75],[-169,68.3],[-169,65.5],[-169.5,63],[180,55],[170,51.5],[180,47.5],[180,5],[-150,5],[-150,-11],[-171,-11],[-171.7,-15],[-172.5,-20],[-172.5,-45],[180,-51.2],[180,-90]];
/* town, IANA zone, [lon,lat], which side its label goes */
const TOWNS=[["Kiritimati","Pacific/Kiritimati",[-157.4,1.87],"l"],["Honolulu","Pacific/Honolulu",[-157.86,21.31],"r"],["Tarawa","Pacific/Tarawa",[173.03,1.33],"l"],
 ["Apia, Samoa","Pacific/Apia",[-171.76,-13.83],"l"],["Pago Pago, American Samoa","Pacific/Pago_Pago",[-170.7,-14.28],"r"],["Nukuʻalofa, Tonga","Pacific/Tongatapu",[-175.2,-21.14],"l"],
 ["Alofi, Niue","Pacific/Niue",[-169.92,-19.06],"r"],["Avarua, Cook Islands","Pacific/Rarotonga",[-159.78,-21.21],"r"],["Majuro","Pacific/Majuro",[171.38,7.09],"l"],
 ["Funafuti, Tuvalu","Pacific/Funafuti",[179.2,-8.52],"l"],["Suva, Fiji","Pacific/Fiji",[178.44,-18.14],"l"],["Papeete, Tahiti","Pacific/Tahiti",[-149.57,-17.54],"r"],
 ["Anadyr","Asia/Anadyr",[177.5,64.73],"l"],["Nome, Alaska","America/Nome",[-165.41,64.5],"r"]];
const l360=lon=>(lon%360+360)%360;
/* the date line's longitude (0–360) at a latitude; a place east of it is on the earlier date */
function idlAt(lat){for(let i=0;i<IDL.length-1;i++){const a=IDL[i],b=IDL[i+1];if(a[1]===b[1])continue;const hi=Math.max(a[1],b[1]),lo=Math.min(a[1],b[1]);
  if(lat<=hi&&lat>=lo){const f=(lat-a[1])/(b[1]-a[1]);return l360(a[0])+(l360(b[0])-l360(a[0]))*f}}return 180}
const eastOfIdl=ll=>{const x=l360(ll[0]);return x>idlAt(ll[1])&&x<330};
const fmtCache={};
function tzParts(zone,t){try{const f=fmtCache[zone]||(fmtCache[zone]=new Intl.DateTimeFormat("en-GB",{timeZone:zone,weekday:"long",day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false}));
 const o={};f.formatToParts(new Date(t)).forEach(p=>o[p.type]=p.value);o.key=o.year+"-"+o.month+"-"+String(o.day).padStart(2,"0");o.hm=(o.hour==="24"?"00":o.hour)+":"+o.minute;return o}catch(e){return null}}
const DATE_COLS=["#1971c2","#e8590c","#7b4fd6"];
const dateline={id:"dateline",tour:"time",title:"The date line",
 instr:"✈ Drag the plane across the yellow line and watch the date on the card jump.",
 init(L){const s=L.st;s.at=[-163,13];s.cross=0;s.lastSide=null;s.msg="";const P=densify(IDL.map(p=>[p[0],clamp(p[1],-85,85)]),150).P;s.idl=P;
  s.lineH=el("path",{class:"gfh-idl-halo"},L.svg);s.line=el("path",{class:"gfh-idl"},L.svg);s.lab=pill("gfh-idl-lab");
  s.towns=TOWNS.map(T=>{const dot=el("circle",{r:4.5,class:"gfh-town"},L.svg);return{T,dot,p:pill("gfh-chip")}});
  const gg=el("g",{class:"gfh-handle gfh-plane",tabindex:"0","aria-label":"Plane: drag across the date line"},L.svg);el("circle",{r:24,class:"gfh-hit"},gg);s.fl=el("g",{},gg);s.fl.innerHTML=PLANE;s.g=gg;s.hint=pill("gfh-hint");
  draggable(gg,{move:ev=>{const ll=toLL(ev.clientX,ev.clientY);if(ll)s.at=ll}})},
 /* the live time, unless the reader has moved the world clock's Sun to another moment */
 now(){const n=Date.now();try{const t=window.gfDNG&&gfDNG.state&&gfDNG.state.t;if(isFinite(t)&&t>0&&Math.abs(t-n)>15*60000)return t}catch(e){}return n},
 tick(L){const s=L.st,t=this.now(),m=Math.floor(t/60000);if(m!==s.min){s.min=m;return true}return false},
 sideInfo(L){const s=L.st,t=this.now(),east=eastOfIdl(s.at);let best=null,bd=1e9;TOWNS.forEach(T=>{if(eastOfIdl(T[2])!==east)return;const d=dist(T[2],s.at);if(d<bd){bd=d;best=T}});return{east,T:best,p:best?tzParts(best[1],t):null}},
 draw(L){const s=L.st,t=this.now(),d=pathOf(s.idl);s.line.setAttribute("d",d);s.lineH.setAttribute("d",d);
  putPill(s.lab,proj([180,30]),"International Date Line",8,0,"r");
  const parts=s.towns.map(o=>tzParts(o.T[1],t)),keys=[...new Set(parts.filter(Boolean).map(p=>p.key))].sort();s.keys=keys;s.parts=parts;
  s.towns.forEach((o,i)=>{const q=proj(o.T[2]);place(o.dot,q);const p=parts[i];if(!p){o.p.style.display="none";return}const col=DATE_COLS[keys.indexOf(p.key)%3];o.dot.setAttribute("fill",col);
   putPill(o.p,q,'<b>'+esc(o.T[0])+'</b><span style="color:'+col+'">'+esc(p.weekday.slice(0,3))+" "+p.hm+'</span>',o.T[3]==="l"?-9:9,0,o.T[3])});
  const q=proj(s.at);place(s.g,q);putPill(s.hint,s.cross?null:q,"Drag me ⟵",-30,-30,"l");
  /* which way is the plane pointing: towards the line */
  s.fl.setAttribute("transform",eastOfIdl(s.at)?"scale(-1,1)":"");
  const I=this.sideInfo(L);if(s.lastSide!==null&&I.east!==s.lastSide){s.cross++;s.msg=I.east?"You flew <b>east</b> across the line: the calendar goes <b>back a day</b>. You get to live "+(I.p?I.p.weekday:"it")+" again!":"You flew <b>west</b> across the line: the calendar jumps <b>forward a day</b>, straight to "+(I.p?I.p.weekday:"tomorrow")+".";
   const sh=q$(".gfh-cal");if(sh){sh.classList.remove("gfh-flip");void sh.offsetWidth;sh.classList.add("gfh-flip")}}s.lastSide=I.east},
 html(){return'<div class="gfh-calrow"><div class="gfh-cal"><small></small><b></b><span></span></div><div class="gfh-calx"><div class="gfh-tm"></div><div class="gfh-like"></div></div></div><div class="gfh-out"></div><div class="gfh-keys"></div>'+
  '<div class="gfh-note">Times are each town’s real clock, from your browser’s time-zone database: now, or the moment you set on the world clock above. The line is simplified.</div>'},
 wire(){},
 card(L){const s=L.st,I=this.sideInfo(L);if(I.p){setTxt(".gfh-cal small",I.p.weekday);setTxt(".gfh-cal b",I.p.day);setTxt(".gfh-cal span",I.p.month);setTxt(".gfh-tm",I.p.hm);
   setHTML(".gfh-like","on the plane: "+(I.east?"east":"west")+" of the line,<br>same clock as "+esc(I.T[0]));const col=DATE_COLS[(s.keys||[]).indexOf(I.p.key)%3]||DATE_COLS[0];const c=q$(".gfh-cal");if(c)c.style.setProperty("--cal",col)}
  setHTML(".gfh-out",s.msg||"West of the line it is always a day later than just east of it. Kiritimati and Honolulu share the same clock time, a day apart.");
  if(s.parts){const seen={};let h="";s.parts.forEach(p=>{if(p&&!seen[p.key]){seen[p.key]=1}});(s.keys||[]).slice().reverse().forEach(k=>{const p=s.parts.find(x=>x&&x.key===k);h+='<span><i style="background:'+DATE_COLS[s.keys.indexOf(k)%3]+'"></i>'+esc(p.weekday+" "+p.day+" "+p.month)+'</span>'});
   setHTML(".gfh-keys",h+(s.keys.length>2?'<em>Three dates at once! For a couple of hours a day, the Pacific holds three different dates.</em>':""))}}};

/* ================================================================ 3. America's moving middle
   The 24 mean centres of population, 1790–2020, are the stop's own line (US Census Bureau, "Centers of Population").
   Populations are the official census totals (US Census Bureau, decennial censuses), in millions. */
const MID=[[-76.18,39.28],[-76.93,39.27],[-77.62,39.19],[-78.55,39.09],[-79.28,38.96],[-80.3,39.03],[-81.32,38.98],[-82.81,39],[-83.59,39.2],[-84.66,39.07],[-85.55,39.2],[-85.81,39.16],
 [-86.54,39.17],[-86.72,39.17],[-87.14,39.06],[-87.38,38.95],[-88.37,38.8],[-89.21,38.6],[-89.71,38.46],[-90.57,38.14],[-91.22,37.87],[-91.81,37.7],[-92.17,37.52],[-92.33,37.42]];
const POP=[3.9,5.3,7.2,9.6,12.9,17.1,23.2,31.4,38.6,50.2,63.0,76.2,92.2,106.0,123.2,132.2,151.3,179.3,203.3,226.5,248.7,281.4,308.7,331.4];
/* what moved it, by the census year from which each note applies */
const MIDNOTE=[[1790,"The new nation hugs the Atlantic coast; the centre sits near Chestertown, Maryland, by Chesapeake Bay."],
 [1800,"Settlers pour over the Appalachians into the Ohio valley, and the centre marches west every decade."],
 [1850,"The Gold Rush fills California, and railways and the Homestead Act (1862) pull farmers onto the Great Plains."],
 [1890,"The 1890 census says there is no longer a clear frontier line. The westward march begins to slow."],
 [1910,"Millions of immigrants settle in the big cities of the North-east and Midwest, holding the centre back in Indiana."],
 [1950,"After the Second World War, air conditioning, interstate highways and new jobs in the Sun Belt pull people south and west."],
 [1980,"In 1980 the centre crosses the Mississippi for the first time, at De Soto, Missouri."],
 [2000,"Texas, Florida and Arizona keep growing fastest, so the centre now drifts south-west as much as west."],
 [2020,"2020: near Hartville, Missouri, a town of about 600 people deep in the Ozarks."]];
const middle={id:"middle",tour:"hg2a",title:"America’s moving middle",
 instr:"⚖ Drag the orange dot, the slider or ▶ to move through 24 censuses.",
 init(L){const s=L.st;s.U=0;s.play=false;s.cum=[0];for(let i=1;i<MID.length;i++)s.cum.push(s.cum[i-1]+dist(MID[i-1],MID[i]));
  s.trailH=el("path",{class:"gfh-wake-halo"},L.svg);s.trail=el("path",{class:"gfh-wake gfh-mid"},L.svg);s.dots=MID.map((p,i)=>el("circle",{r:i%5===0||i===23?3.6:2.4,class:"gfh-cdot"},L.svg));
  const gg=el("g",{class:"gfh-handle gfh-centre",tabindex:"0","aria-label":"Centre of population: drag along the line"},L.svg);el("circle",{r:24,class:"gfh-hit"},gg);el("circle",{r:11,class:"gfh-c1"},gg);el("path",{d:"M-6 0H6M0 -6V6",class:"gfh-c2"},gg);s.g=gg;
  s.lab=pill("gfh-big-pill");s.hint=pill("gfh-hint");
  draggable(gg,{start:()=>{s.play=false;playBtn(false)},move:ev=>{const hr=L.host.getBoundingClientRect(),px=ev.clientX-hr.left,py=ev.clientY-hr.top;let best=s.U,bd=1e9;
    for(let i=0;i<MID.length-1;i++){const a=proj(MID[i]),b=proj(MID[i+1]);if(!a||!b)continue;const vx=b[0]-a[0],vy=b[1]-a[1],l2=vx*vx+vy*vy||1,f=clamp(((px-a[0])*vx+(py-a[1])*vy)/l2,0,1),d=Math.hypot(a[0]+vx*f-px,a[1]+vy*f-py);if(d<bd){bd=d;best=i+f}}s.U=best}})},
 tick(L,dt){const s=L.st;if(!s.play)return false;s.U+=dt*1.6;if(s.U>=23){s.U=23;s.play=false;playBtn(false)}return true},
 posAt(U){const i=Math.min(22,Math.floor(U)),f=U-i;return d3.geoInterpolate(MID[i],MID[i+1])(f)},
 draw(L){const s=L.st,k=Math.floor(s.U+1e-6),pts=MID.slice(0,k+1);const at=this.posAt(s.U);pts.push(at);const d=pathOf(pts);s.trail.setAttribute("d",d);s.trailH.setAttribute("d",d);
  s.dots.forEach((c,i)=>{const q=proj(MID[i]);place(c,q);c.classList.toggle("gfh-past",i<=k)});
  const q=proj(at);place(s.g,q);const yr=1790+10*Math.round(s.U);putPill(s.lab,q,yr+" · "+POP[Math.round(s.U)].toFixed(1)+" million people",0,-18);putPill(s.hint,s.U<.01?q:null,"Drag me west ⟶",-26,18,"l")},
 html(){return'<div class="gfh-row"><button type="button" class="gfh-play" aria-label="Play">▶</button><input type="range" class="gfh-range gfh-u" min="0" max="23" step="0.01" value="0" aria-label="Census year"><span class="gfh-big gfh-yr">1790</span></div>'+
  '<svg class="gfh-spark" viewBox="0 0 240 46" preserveAspectRatio="none"></svg><div class="gfh-stats"><div><b class="gfh-pop"></b><small>people counted</small></div><div><b class="gfh-km"></b><small>travelled, decade by decade</small></div><div><b class="gfh-dir"></b><small>this decade</small></div></div>'+
  '<div class="gfh-out"></div><div class="gfh-note">Source: US Census Bureau, centres of population and census totals, 1790–2020.</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gfh-play").onclick=()=>{if(s.U>=23)s.U=0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gfh-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.U=+r.value;L.dirty=true});
  let h="";POP.forEach((p,i)=>{const bh=p/331.4*40;h+='<rect x="'+(i*10+1)+'" y="'+(44-bh).toFixed(1)+'" width="8" height="'+bh.toFixed(1)+'" data-i="'+i+'"/>'});c.querySelector(".gfh-spark").innerHTML=h},
 card(L){const s=L.st,i=Math.round(s.U);const r=q$(".gfh-u");if(r&&document.activeElement!==r)r.value=s.U;setTxt(".gfh-yr",String(1790+10*i));setTxt(".gfh-pop",POP[i].toFixed(1)+" m");
  const k=Math.floor(s.U),f=s.U-k,km=k>=23?s.cum[23]:s.cum[k]+(s.cum[k+1]-s.cum[k])*f;setTxt(".gfh-km",kmTxt(Math.round(km/10)*10));
  setTxt(".gfh-dir",i?Math.round(dist(MID[i-1],MID[i]))+" km "+compass(bearing(MID[i-1],MID[i])):"start");
  const sp=q$(".gfh-spark");if(sp&&sp._i!==i){sp._i=i;sp.querySelectorAll("rect").forEach(n=>n.classList.toggle("on",+n.dataset.i===i))}
  let n="";MIDNOTE.forEach(([y,t])=>{if(1790+10*i>=y)n=t});setHTML(".gfh-out",n)}};

/* ================================================================ 4. Planes stop in Alaska: great circle or flat-map line
   Airport positions are their published reference points (rounded). The great circle is the shortest path on a sphere
   (d3.geoInterpolate); the "flat-map straight line" is a rhumb line, which crosses every meridian at the same angle and
   is the straight line of a Mercator map. Lengths use the mean Earth radius, so they are within about 0.5% of the
   distances airlines quote. */
const AIRPORTS=[["Hong Kong",[113.92,22.31]],["Memphis",[-89.98,35.04]],["Anchorage",[-149.99,61.17]],["Shanghai",[121.81,31.14]],["Chicago",[-87.9,41.98]],["Tokyo",[140.39,35.77]],
 ["New York",[-73.78,40.64]],["Los Angeles",[-118.41,33.94]],["London",[-0.45,51.47]],["Seoul",[126.45,37.46]],["Singapore",[103.99,1.36]],["Seattle",[-122.31,47.45]],["Dubai",[55.36,25.25]],
 ["Frankfurt",[8.57,50.03]],["Sydney",[151.18,-33.95]],["Louisville",[-85.74,38.17]],["Taipei",[121.23,25.08]],["Beijing",[116.6,40.08]]];
const AP=n=>AIRPORTS.find(a=>a[0]===n)[1];
const PRESETS=[["Hong Kong","Memphis"],["Shanghai","Chicago"],["Tokyo","New York"],["London","Los Angeles"]];
function rhumb(a,b,n){const y=p=>Math.log(Math.tan(Math.PI/4+clamp(p,-89,89)*RAD/2)),iy=v=>(2*Math.atan(Math.exp(v))-Math.PI/2)/RAD;let dl=b[0]-a[0];if(dl>180)dl-=360;if(dl<-180)dl+=360;
 const y1=y(a[1]),y2=y(b[1]),P=[];for(let i=0;i<=n;i++){const f=i/n;P.push([((a[0]+dl*f+540)%360)-180,iy(y1+(y2-y1)*f)])}return P}
function rhumbKm(a,b){const p1=a[1]*RAD,p2=b[1]*RAD,dp=p2-p1;let dl=Math.abs(b[0]-a[0])*RAD;if(dl>Math.PI)dl=2*Math.PI-dl;
 const dpsi=Math.log(Math.tan(Math.PI/4+p2/2)/Math.tan(Math.PI/4+p1/2)),qq=Math.abs(dpsi)>1e-12?dp/dpsi:Math.cos(p1);return Math.hypot(dp,qq*dl)*RE}
const alaska={id:"alaska",tour:"transport",title:"Planes stop in Alaska",
 instr:"✈ Drag either airport. Orange is the shortest way round the globe.",
 init(L){const s=L.st;s.A=AP("Hong Kong").slice();s.B=AP("Memphis").slice();s.nA="Hong Kong";s.nB="Memphis";
  s.rhH=el("path",{class:"gfh-rh-halo"},L.svg);s.rh=el("path",{class:"gfh-rh"},L.svg);s.gcH=el("path",{class:"gfh-wake-halo"},L.svg);s.gc=el("path",{class:"gfh-gc"},L.svg);
  s.anc=el("circle",{r:5,class:"gfh-anc"},L.svg);s.ancL=pill("gfh-chip gfh-ancl");s.gcL=pill("gfh-gcl");s.rhL=pill("gfh-rhl");
  ["A","B"].forEach(k=>{const gg=el("g",{class:"gfh-handle gfh-port",tabindex:"0","aria-label":"Airport: drag"},L.svg);el("circle",{r:22,class:"gfh-hit"},gg);el("circle",{r:9,class:"gfh-p1"},gg);el("circle",{r:3.5,class:"gfh-p2"},gg);
   s["g"+k]=gg;s["l"+k]=pill("gfh-big-pill");draggable(gg,{move:ev=>{const ll=toLL(ev.clientX,ev.clientY);if(!ll)return;s[k]=ll;s.moved=1;let nm="",bd=250;AIRPORTS.forEach(a=>{const d=dist(a[1],ll);if(d<bd){bd=d;nm=a[0]}});s["n"+k]=nm||"Your airport"}})});
  s.hint=pill("gfh-hint")},
 draw(L){const s=L.st,f=d3.geoInterpolate(s.A,s.B),G=[];for(let i=0;i<=160;i++)G.push(f(i/160));s.G=G;const R=rhumb(s.A,s.B,160);
  const gd=pathOf(G),rd=pathOf(R);s.gc.setAttribute("d",gd);s.gcH.setAttribute("d",gd);s.rh.setAttribute("d",rd);s.rhH.setAttribute("d",rd);
  s.gk=dist(s.A,s.B);s.rk=rhumbKm(s.A,s.B);const anc=AP("Anchorage");s.ak=Math.min(...G.map(p=>dist(p,anc)));
  putPill(s.gcL,freePt(G),"Shortest: "+kmTxt(Math.round(s.gk/10)*10),0,-10);putPill(s.rhL,freePt(R),"Straight on a flat map: "+kmTxt(Math.round(s.rk/10)*10),0,30);
  const qa=proj(anc);place(s.anc,qa);putPill(s.ancL,qa,"<b>Anchorage</b><span>"+(s.ak<60?"on the route":kmTxt(Math.round(s.ak/10)*10)+" off the route")+"</span>",-9,0,"l");
  const qA=proj(s.A),qB=proj(s.B);place(s.gA,qA);place(s.gB,qB);putPill(s.lA,qA,esc(s.nA),0,-14);putPill(s.lB,qB,esc(s.nB),0,-14);putPill(s.hint,s.moved?null:qB,"Drag me ⟷",14,20,"r")},
 html(){return'<div class="gfh-presets">'+PRESETS.map((p,i)=>'<button type="button" data-i="'+i+'">'+p[0]+" – "+p[1]+'</button>').join("")+'</div>'+
  '<div class="gfh-legend"><div><i class="gfh-sw-gc"></i><span>Shortest route (great circle)</span><b class="gfh-gk"></b></div><div><i class="gfh-sw-rh"></i><span>Looks straight on a flat map</span><b class="gfh-rk"></b></div></div>'+
  '<div class="gfh-out"></div><div class="gfh-note">On a globe the shortest path between two places is part of a great circle. On a flat Mercator map it looks curved, and the line that looks straight is longer.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gfh-presets button").forEach(b=>b.onclick=()=>{const p=PRESETS[+b.dataset.i];s.A=AP(p[0]).slice();s.B=AP(p[1]).slice();s.nA=p[0];s.nB=p[1];s.moved=1;L.dirty=true})},
 card(L){const s=L.st;setTxt(".gfh-gk",kmTxt(Math.round(s.gk/10)*10));setTxt(".gfh-rk",kmTxt(Math.round(s.rk/10)*10));const ex=s.rk-s.gk,pc=s.gk>0?ex/s.gk*100:0;
  const a=ex<20?"Here the two lines almost agree: short or north–south trips barely bend.":"The flat-map line is <b>"+kmTxt(Math.round(ex/10)*10)+" longer</b> ("+Math.round(pc)+"%).",
   b=s.ak<300?" The shortest route passes <b>right by Anchorage</b>: a natural place to refuel.":" The shortest route passes "+kmTxt(Math.round(s.ak/10)*10)+" from Anchorage.";
  setHTML(".gfh-out",s.gk<50?"Move the airports apart.":a+b);
  if(s.nA!=="Hong Kong"||s.nB!=="Memphis")s.moved=1}};

/* ================================================================ 5. Concrete on two rocks: rock or island?
   UN Convention on the Law of the Sea (1982): territorial sea up to 12 nautical miles (art. 3); EEZ up to 200
   nautical miles (art. 57); "rocks which cannot sustain human habitation or economic life of their own shall have no
   exclusive economic zone" (art. 121.3). Areas are spherical caps on a sphere of the mean Earth radius. Japan's area:
   377,975 km² (Statistics Bureau of Japan). Okinotorishima: about 20.42° N, 136.08° E. */
const TS_KM=12*NM,EEZ_KM=200*NM,JAPAN=377975;
const cap=r=>2*Math.PI*RE*RE*(1-Math.cos(r/RE));
const rocks={id:"rocks",tour:"hg4d",title:"Concrete on two rocks",
 instr:"🪨 Is it a rock or an island? Switch it, and drag it anywhere.",
 init(L){const s=L.st;s.at=[136.08,20.42];s.island=true;s.eez=el("path",{class:"gfh-eez"},L.svg);s.ts=el("path",{class:"gfh-ts"},L.svg);
  const gg=el("g",{class:"gfh-handle gfh-rock",tabindex:"0","aria-label":"The rock: drag it"},L.svg);el("circle",{r:24,class:"gfh-hit"},gg);
  const rg=el("g",{transform:"scale(1.6)"},gg);el("path",{d:"M-11 5 L-8 -4 L-2 -8 L5 -6 L10 -1 L11 5 Z",class:"gfh-rk1"},rg);el("path",{d:"M-13 5 H13",class:"gfh-rk2"},rg);s.g=gg;s.lab=pill("gfh-big-pill");s.eL=pill("gfh-chip gfh-eezl");s.tL=pill("gfh-chip");s.hint=pill("gfh-hint");
  draggable(gg,{move:ev=>{const ll=toLL(ev.clientX,ev.clientY);if(ll){s.at=ll;s.moved=1}}})},
 draw(L){const s=L.st,c=d3.geoCircle().center(s.at).precision(2);const e=c.radius(EEZ_KM/RE/RAD)().coordinates[0],t=c.radius(TS_KM/RE/RAD)().coordinates[0];
  s.eez.setAttribute("d",s.island?pathOf(e)+"Z":"");s.ts.setAttribute("d",pathOf(t)+"Z");const q=proj(s.at);place(s.g,q);
  putPill(s.lab,q,s.island?"An island":"Just a rock",0,48);
  const top=proj([s.at[0],s.at[1]+EEZ_KM/111.2]);putPill(s.eL,s.island?top:null,"<b>200 nautical miles</b><span>exclusive economic zone</span>",0,-4);
  putPill(s.tL,proj([s.at[0]+TS_KM/111.2/Math.cos(s.at[1]*RAD),s.at[1]]),"<b>12 nm</b>",8,0,"r");putPill(s.hint,s.moved?null:q,"Drag me ⟶",-26,0,"l")},
 html(){return'<div class="gfh-seg"><button type="button" data-v="0">It’s a rock</button><button type="button" data-v="1">It’s an island</button></div>'+
  '<div class="gfh-bigline"><b class="gfh-area"></b><small>km² of sea that only this country may fish, drill and mine</small></div>'+
  '<div class="gfh-bars"><div class="gfh-bar gfh-a"><span>This sea</span><i><b></b></i><em class="gfh-ae"></em></div><div class="gfh-bar gfh-b"><span>All of Japan</span><i><b></b></i><em>377,975 km²</em></div></div>'+
  '<div class="gfh-out"></div><div class="gfh-note">Law of the Sea (1982): every coast gets 12 nautical miles of territorial sea; an island also gets a 200-nautical-mile exclusive economic zone, but “rocks which cannot sustain human habitation or economic life” do not.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gfh-seg button").forEach(b=>b.onclick=()=>{s.island=b.dataset.v==="1";L.dirty=true})},
 card(L){const s=L.st,a=s.island?cap(EEZ_KM):cap(TS_KM),mx=Math.max(a,JAPAN);setTxt(".gfh-area",fmtN(Math.round(a/100)*100));setTxt(".gfh-ae",fmtN(Math.round(a/100)*100)+" km²");
  q$(".gfh-seg")&&L.c.querySelectorAll(".gfh-seg button").forEach(b=>b.classList.toggle("on",(b.dataset.v==="1")===s.island));
  const ba=q$(".gfh-a b"),bb=q$(".gfh-b b");if(ba)ba.style.width=(100*a/mx)+"%";if(bb)bb.style.width=(100*JAPAN/mx)+"%";
  setHTML(".gfh-out",s.island?"As an island it claims a circle of sea <b>"+Math.round((cap(EEZ_KM)/JAPAN-1)*100)+"% bigger than the whole of Japan</b>. That is why Japan has armoured the rocks in concrete.":
   "As a rock it keeps only its 12-mile territorial sea: <b>about "+Math.round(cap(EEZ_KM)/cap(TS_KM))+" times less</b> than as an island. This is what China and South Korea argue.")}};

/* ================================================================ 6. Time–space compression: four crossings race
   Mayflower: Plymouth, 6 September 1620, to Cape Cod, 11 November: 66 days (Bradford, Of Plymouth Plantation).
   Britannia, Cunard's first steamship: Liverpool, 4 July 1840, to Boston via Halifax in about 14 days 8 hours (Cunard).
   Concorde, London–New York, 1977–2003: about 3½ hours (British Airways). A jet today, London–Boston: about 7 hours (the
   stop's own figure). Routes are drawn as great circles between the ports. */
const TRIPS=[{n:"Mayflower",y:"1620",r:"Plymouth → Cape Cod",pts:[[-4.14,50.37],[-70.19,42.05]],h:66*24,ic:SAIL,col:"#8a5a2b"},
 {n:"Britannia, steamship",y:"1840",r:"Liverpool → Halifax → Boston",pts:[[-2.98,53.4],[-63.57,44.65],[-71.06,42.36]],h:14*24+8,ic:STEAM,col:"#2a78d0"},
 {n:"Jet airliner",y:"today",r:"London → Boston",pts:[[-0.45,51.47],[-71.01,42.37]],h:7,ic:PLANE,col:"#3a9a5b"},
 {n:"Concorde",y:"1977–2003",r:"London → New York",pts:[[-0.45,51.47],[-73.78,40.64]],h:3.5,ic:PLANE,col:"#c2255c"}];
const T_MIN=.25,T_MAX=66*24;/* the slider runs on a log scale, from 15 minutes to 66 days */
const hrsAt=u=>u<=0?0:T_MIN*Math.pow(T_MAX/T_MIN,u);
function durTxt(h){if(h<1)return Math.round(h*60)+" min";if(h<48){const H=Math.floor(h),M=Math.round((h-H)*60);return H+" h"+(M&&H<10?" "+M+" min":"")}const d=Math.floor(h/24),H=Math.round(h-d*24);return d+" days"+(H?" "+H+" h":"")}
const tsc={id:"tsc",tour:"hg1",title:"Time–space compression",
 instr:"⏱ Press ▶: all four leave Britain together. Who reaches America first?",
 init(L){const s=L.st;s.u=0;s.play=false;s.T=TRIPS.map(t=>{const R=densify(t.pts,80),wk=el("path",{class:"gfh-wake",style:"stroke:"+t.col},L.svg),gg=el("g",{class:"gfh-vessel"},L.svg),fl=el("g",{},gg);fl.innerHTML=t.ic;
   return{t,R,wk,gg,fl,lab:pill("gfh-chip")}})},
 tick(L,dt){const s=L.st;if(!s.play)return false;s.u+=dt/16;if(s.u>=1){s.u=1;s.play=false;playBtn(false)}return true},
 draw(L){const s=L.st,h=hrsAt(s.u);s.T.forEach((o,i)=>{const f=Math.min(1,h/o.t.h),a=along(o.R,f*o.R.L),pts=o.R.P.slice(0,a.i+1);pts.push(a.ll);o.wk.setAttribute("d",f>0?pathOf(pts):"");
  const q=proj(a.ll);place(o.gg,q);if(q)o.fl.setAttribute("transform","scale(-1,1)"+(o.t.ic===PLANE?" scale(.85)":""));
  putPill(o.lab,q,'<b style="color:'+o.t.col+'">'+o.t.y+'</b><span>'+(f>=1?"arrived ✓":esc(o.t.n.split(",")[0]))+'</span>',0,[-24,50,-24,50][i],"")})},
 html(){return'<div class="gfh-row"><button type="button" class="gfh-play" aria-label="Play">▶</button><input type="range" class="gfh-range gfh-u" min="0" max="1000" value="0" aria-label="Time since leaving"><span class="gfh-big gfh-clock">0 min</span></div>'+
  '<div class="gfh-trips">'+TRIPS.map((t,i)=>'<div class="gfh-trip" data-i="'+i+'"><span><b style="color:'+t.col+'">'+t.y+'</b> '+esc(t.n)+'<small>'+esc(t.r)+'</small></span><i><b style="background:'+t.col+'"></b></i><em>'+durTxt(t.h)+'</em></div>').join("")+
  '<div class="gfh-trip on"><span><b style="color:#7b4fd6">today</b> A message<small>by undersea cable</small></span><i><b style="background:#7b4fd6;width:100%"></b></i><em>under 1 s</em></div></div>'+
  '<div class="gfh-out"></div><div class="gfh-note">The slider’s clock speeds up as it goes (15 minutes to 66 days), so even the Mayflower gets there.</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gfh-play").onclick=()=>{if(s.u>=1)s.u=0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gfh-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.u=r.value/1000;L.dirty=true})},
 card(L){const s=L.st,h=hrsAt(s.u);range(".gfh-u",s.u);setTxt(".gfh-clock",durTxt(h));
  TRIPS.forEach((t,i)=>{const n=q$('.gfh-trip[data-i="'+i+'"]');if(!n)return;const f=Math.min(1,h/t.h);n.querySelector("i b").style.width=(100*f)+"%";n.classList.toggle("on",f>=1)});
  let o;if(h<=0)o="Same ocean, same distance. Only the technology changes.";else if(h<3.5)o="The Concorde is over the Atlantic; the sailing ship is still in sight of England.";
  else if(h<7)o="<b>Concorde has landed in New York.</b> The jet is still over Canada.";else if(h<14*24+8)o="<b>Both planes have landed.</b> The steamship needs "+durTxt(14*24+8-h)+" more.";
  else if(h<T_MAX)o="Cunard’s Britannia has reached Boston. The Mayflower is still at sea: "+durTxt(T_MAX-h)+" to go.";else o="The Mayflower arrives after 66 days. The same crossing now takes an afternoon, and a message less than a second: the world has <b>shrunk in time</b>, not in kilometres.";
  setHTML(".gfh-out",o)}};

const MODS=[suez,dateline,middle,alaska,rocks,tsc];

/* ---- watch the tour: mount on the right stop, clean up as soon as it changes ---- */
setInterval(()=>{try{const m=stopNow();if(m){if(MOD!==m||!L||!L.el.isConnected||L.host!==(g()&&g().host))mount(m);ensureCard()}else if(MOD)unmount()}catch(e){try{unmount()}catch(_){}}},300);
addEventListener("resize",()=>{if(L)L.dirty=true});

{const s=document.createElement("style");s.textContent=`
.gfh-layer{position:absolute;inset:0;pointer-events:none;z-index:6}/* under the tour card (z 7), over the globe */
.gfh-svg{position:absolute;left:0;top:0;overflow:visible}
.gfh-handle{pointer-events:all;cursor:grab;touch-action:none;outline:none}.gfh-handle.gfh-dragging{cursor:grabbing}
.gfh-hit{fill:rgba(255,255,255,.001);stroke:none}
.gfh-hull{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gfh-handle:hover .gfh-hull,.gfh-handle:focus-visible .gfh-hull{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gfh-wake-halo{fill:none;stroke:rgba(255,255,255,.85);stroke-width:6.5;stroke-linecap:round;stroke-linejoin:round}
.gfh-wake{fill:none;stroke:#d9682b;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}
.gfh-wake.gfh-a{stroke:#1864ab}.gfh-wake.gfh-b{stroke:#c92a2a}.gfh-wake.gfh-mid{stroke:#e8590c;stroke-width:4}
.gfh-pill{position:absolute;white-space:nowrap;pointer-events:none;font:700 13px/1.25 system-ui,sans-serif;color:#13294b;background:rgba(255,255,255,.95);padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.28)}
.gfh-pill.gfh-a{color:#1864ab}.gfh-pill.gfh-b{color:#c92a2a}.gfh-pill b{font-weight:800}
.gfh-big-pill{background:#13294b;color:#fff;font-size:14px;font-weight:800;padding:5px 12px}
.gfh-chip{display:flex;flex-direction:column;align-items:center;padding:3px 9px;border-radius:10px;font-size:12px}.gfh-chip b{font-size:12.5px}.gfh-chip span{font-weight:800;font-size:13px}
.gfh-hint{background:#fff7ec;color:#9a4a16;font-weight:800;font-size:13px;animation:gfhNudge 1.4s ease-in-out infinite}
@keyframes gfhNudge{50%{margin-left:6px}}
.gfh-idl{fill:none;stroke:#ffd43b;stroke-width:3.4;stroke-dasharray:9 6}.gfh-idl-halo{fill:none;stroke:rgba(0,0,0,.55);stroke-width:6}
.gfh-idl-lab{background:#ffd43b;color:#3b2f00;font-weight:800}
.gfh-town{stroke:#fff;stroke-width:1.6}
.gfh-cdot{fill:#fff;stroke:#9a4a16;stroke-width:1.2;opacity:.75}.gfh-cdot.gfh-past{fill:#e8590c;stroke:#fff;opacity:1}
.gfh-c1{fill:#e8590c;stroke:#fff;stroke-width:3;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}.gfh-c2{stroke:#fff;stroke-width:2}
.gfh-gc{fill:none;stroke:#f76707;stroke-width:4;stroke-linecap:round}.gfh-rh{fill:none;stroke:#fff;stroke-width:3;stroke-dasharray:8 7}.gfh-rh-halo{fill:none;stroke:rgba(19,41,75,.6);stroke-width:5.5}
.gfh-gcl{background:#f76707;color:#fff;font-weight:800}.gfh-rhl{background:#13294b;color:#fff}
.gfh-p1{fill:#13294b;stroke:#fff;stroke-width:3}.gfh-p2{fill:#fff}.gfh-anc{fill:#f76707;stroke:#fff;stroke-width:2}
.gfh-eez{fill:rgba(232,89,12,.2);stroke:#e8590c;stroke-width:3}.gfh-ts{fill:rgba(19,41,75,.5);stroke:#fff;stroke-width:2}
.gfh-rk1{fill:#8d8d8d;stroke:#333;stroke-width:1.2}.gfh-rk2{stroke:#c9c9c9;stroke-width:4;stroke-linecap:round}
.gfh-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12);font-size:13.5px;line-height:1.4}
.gfh-do{font-weight:800;font-size:14px;color:#9a4a16;margin-bottom:8px}
.gfh-row{display:flex;align-items:center;gap:10px}.gfh-row.gfh-small{margin-top:8px;font-size:12.5px}
.gfh-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gfh-range{flex:1 1 auto;min-width:0;accent-color:#d9682b;cursor:pointer}
.gfh-big{flex:0 0 auto;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap;min-width:58px;text-align:right}
.gfh-knv{font-weight:800;white-space:nowrap}
.gfh-bars{margin-top:9px;display:grid;gap:6px}
.gfh-bar{display:grid;grid-template-columns:88px 1fr auto;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
.gfh-bar i{height:10px;border-radius:6px;background:rgba(19,41,75,.12);overflow:hidden}.gfh-bar i b{display:block;height:100%;width:0;border-radius:6px}
.gfh-bar.gfh-a i b{background:#1864ab}.gfh-bar.gfh-b i b{background:#c92a2a}.gfh-bar em{font-style:normal;font-weight:700;white-space:nowrap}
.gfh-out{margin-top:8px;font-size:14px;line-height:1.4}
.gfh-note{margin-top:6px;font-size:11.5px;opacity:.68;line-height:1.35}
.gfh-calrow{display:flex;align-items:center;gap:14px}
.gfh-cal{--cal:#1971c2;flex:0 0 auto;width:92px;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.18);text-align:center;color:#13294b}
.gfh-cal small{display:block;background:var(--cal);color:#fff;font-weight:800;font-size:13px;padding:3px 0}.gfh-cal b{display:block;font-size:34px;line-height:1.1}.gfh-cal span{display:block;font-size:12px;font-weight:700;padding-bottom:4px}
.gfh-cal.gfh-flip{animation:gfhFlip .55s ease}@keyframes gfhFlip{0%{transform:rotateX(0)}50%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}
.gfh-tm{font-size:26px;font-weight:800;color:#13294b}.gfh-like{font-size:12.5px;opacity:.8}
.gfh-keys{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12.5px;font-weight:700}.gfh-keys i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}.gfh-keys em{flex-basis:100%;font-style:normal;font-weight:600;color:#7b4fd6}
.gfh-spark{display:block;width:100%;height:46px;margin-top:8px}.gfh-spark rect{fill:rgba(232,89,12,.35)}.gfh-spark rect.on{fill:#e8590c}
.gfh-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px;text-align:center}.gfh-stats b{display:block;font-size:15px;color:#13294b}.gfh-stats small{font-size:11px;opacity:.7}
.gfh-presets{display:flex;flex-wrap:wrap;gap:6px}.gfh-presets button,.gfh-seg button{border:1px solid rgba(19,41,75,.25);background:#fff;color:#13294b;border-radius:999px;padding:4px 10px;font:700 12px system-ui,sans-serif;cursor:pointer}
.gfh-legend{margin-top:9px;display:grid;gap:5px}.gfh-legend div{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;font-size:13px}.gfh-legend b{font-size:14px}
.gfh-sw-gc{height:4px;background:#f76707;border-radius:2px}.gfh-sw-rh{height:0;border-top:3px dashed #13294b}
.gfh-seg{display:flex;gap:6px}.gfh-seg button{flex:1;padding:7px 10px;font-size:13px}.gfh-seg button.on{background:#e8590c;border-color:#e8590c;color:#fff}
.gfh-bigline{margin-top:8px}.gfh-bigline b{font-size:28px;color:#13294b;display:block;line-height:1.1}.gfh-bigline small{font-size:12px;opacity:.75}
.gfh-trips{margin-top:9px;display:grid;gap:7px}.gfh-trip{display:grid;grid-template-columns:1fr 70px auto;align-items:center;gap:8px;font-size:12.5px}
.gfh-trip small{display:block;font-size:11px;opacity:.7}.gfh-trip i{height:9px;border-radius:5px;background:rgba(19,41,75,.12);overflow:hidden}.gfh-trip i b{display:block;height:100%;width:0}
.gfh-trip em{font-style:normal;font-weight:800;white-space:nowrap;min-width:64px;text-align:right}.gfh-trip.on em::after{content:" ✓";color:#2b8a3e}
body.dark-theme .gfh-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}body.dark-theme .gfh-do,body.dark-theme .gfh-big{color:#ffb27a}
body.dark-theme .gfh-tm,body.dark-theme .gfh-stats b,body.dark-theme .gfh-bigline b{color:#e9eef6}
body.dark-theme .gfh-bar i,body.dark-theme .gfh-trip i{background:rgba(255,255,255,.14)}`;document.head.appendChild(s)}
window.gfInteractHuman={mods:MODS,state:()=>L&&L.st,redraw:()=>{if(L)L.dirty=true}};
})();
