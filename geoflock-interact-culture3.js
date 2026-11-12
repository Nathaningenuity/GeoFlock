/* GeoFlock: six more culture-side tour stops you can play with, not just read. Each one puts things on the Maps globe that
   you click or drag, plus a small control block on the card (right after the stop's headline) with a one-line instruction:
   - Food tour, "Tea, or chai?": ten languages' words for tea pop up on the map, from Russian "chai" to Dutch "thee". Did
     each word come over land or by sea? Pick one and watch the word travel from China along its road; the trick one is
     Portuguese "chá", which came by sea from Macau.
   - Landmarks tour, "The race for the sky": a year slider (or Play) from 1880 to today. Each record tower rises where it was
     built, a crown jumps to the tallest, from Cologne's cathedral to New York, Chicago, Kuala Lumpur, Taipei and Dubai; the
     card counts how long each held it and draws the skyline so far. Click any tower for its name.
   - Energy and resources tour, "Oil under the ground": click the barrel of the country you think has the most oil. Then the
     barrels grow into bars, and switch between oil under the ground, oil pumped a day and how many years it would last.
   - Inventions tour, "China's Four Great Inventions": guess how long paper took to reach Europe's first mill, then slide (or
     Play) from 105 to 1700 and watch paper spread from Luoyang to Samarkand, Baghdad, Cairo, Spain, Italy and America.
   - Migration tour, "One in thirty": how many people in 100 were born abroad, in seven countries? Drag the slider and watch a
     grid of 100 people fill, then check; rings on the map show the real share once guessed.
   - Money tour, "The euro": guess how many countries started the euro in 1999, then slide (or Play) to 2026: a coin drops
     on each capital the year it joins, the countries that use it without being in the EU appear when the cash comes in
     2002, and the six EU members that keep their own money stay grey.
   Same pattern as geoflock-odyssey.js and geoflock-interact-human2.js: a watchdog polls `ps`, matches the stop by tour and
   title, mounts a layer in amGlobe.host drawn with amGlobe.projection(), redraws when the view changes, and removes
   everything (layer, card block, body class, timers) as soon as the stop changes or the tour ends. Globe view only. Next
   and Back are never blocked, and every step is wrapped in try/catch. CSS classes start with "gc3-". Sources are named
   beside each set of figures below. Stops already made interactive in geoflock-odyssey.js and the other
   geoflock-interact-*.js files are not touched. */
(function(){
"use strict";
const RE=6371.0088,RAD=Math.PI/180;/* mean Earth radius (km, IUGG) */
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const fmtN=n=>Math.round(n).toLocaleString("en-GB");
const kmTxt=n=>fmtN(Math.round(n/10)*10)+" km";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const dist=(a,b)=>{try{return d3.geoDistance(a,b)*RE}catch(e){return 0}};
function densify(pts,step){const P=[],K=[];let k=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],d=dist(a,b),n=Math.max(1,Math.ceil(d/(step||100))),f=d3.geoInterpolate(a,b);
  for(let j=0;j<n;j++){const p=f(j/n);if(P.length)k+=dist(P[P.length-1],p);P.push(p);K.push(k)}}
 const last=pts[pts.length-1];if(P.length)k+=dist(P[P.length-1],last);P.push(last);K.push(k);return{P,K,L:k}}
function along(R,km){km=clamp(km,0,R.L);let lo=0,hi=R.K.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.K[m]<=km)lo=m;else hi=m}
 const a=R.P[lo],b=R.P[hi],s=R.K[hi]-R.K[lo],f=s>0?(km-R.K[lo])/s:0;return{ll:d3.geoInterpolate(a,b)(f),i:lo}}
/* the km along a route nearest to a pointer position (screen), or null */
function nearestKm(L,R,ev){const hr=L.host.getBoundingClientRect(),px=ev.clientX-hr.left,py=ev.clientY-hr.top;let best=-1,bd=1e9;
 R.P.forEach((p,i)=>{const q=proj(p);if(!q)return;const d=Math.hypot(q[0]-px,q[1]-py);if(d<bd){bd=d;best=i}});return best>=0?R.K[best]:null}

/* ================================================================ the shared layer */
let L=null,MOD=null,raf=0,lastT=0;
const MODS=[];
function stopNow(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;
 const t=clean(S.title);return MODS.find(m=>m.tour===ps.tour&&m.title===t)||null}catch(e){return null}}
function proj(ll){const G=g();if(!G||!L||!ll)return null;try{const p=G.projection();if(!G._flat){const r=p.rotate();if(d3.geoDistance([-r[0],-r[1]],ll)>Math.PI/2-.03)return null}
 const s=p(ll);return s&&isFinite(s[0])&&isFinite(s[1])?[s[0]+L.ox,s[1]+L.oy]:null}catch(e){return null}}
function toLL(cx,cy){const G=g();if(!G)return null;try{const r=G.canvas.getBoundingClientRect(),p=G.projection(),ll=p.invert([cx-r.left,cy-r.top]);if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return null;
 if(!G._flat){const r0=p.rotate();if(d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return null}return[((ll[0]+540)%360)-180,clamp(ll[1],-89.9,89.9)]}catch(e){return null}}
function pathOf(pts){let d="",pen=false,px=0,py=0;const G=g(),J=G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
const stopAll=e=>{e.stopPropagation()};
/* an SVG group you can drag without the globe turning underneath it */
function draggable(node,o){
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{node.setPointerCapture(e.pointerId)}catch(_){}node.classList.add("gc3-dragging");if(L)L.userTurned=true;try{o.start&&o.start(e)}catch(_){}
  const mv=ev=>{ev.stopPropagation();try{o.move(ev);if(L)L.dirty=true}catch(err){}};
  const up=ev=>{node.removeEventListener("pointermove",mv);node.removeEventListener("pointerup",up);node.removeEventListener("pointercancel",up);node.classList.remove("gc3-dragging");try{o.end&&o.end(ev)}catch(_){}if(L)L.dirty=true};
  node.addEventListener("pointermove",mv);node.addEventListener("pointerup",up);node.addEventListener("pointercancel",up)};
 node.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>node.addEventListener(t,stopAll,{passive:t!=="mousedown"}))}
/* an SVG group you can click (or tap) without the globe taking the press */
function clickable(node,fn){node.addEventListener("pointerdown",e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()});
 node.addEventListener("pointerup",e=>{e.stopPropagation();try{fn(e)}catch(err){}if(L)L.dirty=true});
 node.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();try{fn(e)}catch(err){}if(L)L.dirty=true}});
 ["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>node.addEventListener(t,stopAll,{passive:t!=="mousedown"}))}
const NS="http://www.w3.org/2000/svg";
function el(tag,attrs,parent){const n=document.createElementNS(NS,tag);for(const k in attrs||{})n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n}
function place(n,q,sc){if(!q){n.style.display="none";return false}n.style.display="";n.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")"+(sc?" scale("+sc+")":""));return true}
function pill(cls){const d=document.createElement("div");d.className="gc3-pill "+(cls||"");L.el.appendChild(d);return d}
function putPill(d,q,html,dx,dy,anchor){if(!q||!html){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}
 d.style.left=(q[0]+(dx||0))+"px";d.style.top=(q[1]+(dy||0))+"px";d.style.transform=anchor==="l"?"translate(-100%,-50%)":anchor==="r"?"translate(0,-50%)":anchor==="c"?"translate(-50%,-50%)":"translate(-50%,-100%)"}
/* turn the globe a step (fraction k) towards putting a place in the middle of the part of the globe not covered by the card
   (and, if given, towards a zoom); true if it moved */
function nudgeTo(lon,lat,k,zoom){try{const G=g();if(!G||G._flat||!Array.isArray(G.rot))return false;
 const p=G.projection(),cr=G.canvas.getBoundingClientRect(),cd=ps.card&&ps.card.offsetParent?ps.card.getBoundingClientRect():null;
 let x0=cr.left,x1=cr.right;if(cd){if(cd.left+cd.width/2<cr.left+cr.width/2)x0=Math.max(x0,cd.right);else x1=Math.min(x1,cd.left)}
 const tx=(x0+x1)/2-cr.left,ty=cr.height/2,r=p.rotate();let q=p([lon,lat]);if(!q||d3.geoDistance([lon,lat],[-r[0],-r[1]])>1.4)q=[cr.width*(((lon+r[0]+540)%360-180)>0?1.2:-.2),ty];
 const sc=p.scale()*RAD,dl=clamp((tx-q[0])/(sc*Math.max(.3,Math.cos(lat*RAD))),-30,30),dp=clamp((q[1]-ty)/sc,-20,20);
 let zd=false;if(zoom&&isFinite(G.zoom)&&Math.abs(G.zoom-zoom)>.05){zd=true;G.zoom+=(zoom-G.zoom)*k}
 if(!zd&&Math.abs(dl)<.02&&Math.abs(dp)<.02)return false;G.rot=[G.rot[0]+dl*k,G.rot[1]+dp*k].concat(G.rot.slice(2));(G.request||G.render).call(G);return true}catch(e){return false}}
/* follow a moving thing: only when it nears the globe's edge or slips behind the card */
function follow(ll,lim){try{const G=g(),p=G&&G.projection();if(!G||G._flat||!p||!ll)return false;const r=p.rotate(),d=d3.geoDistance(ll,[-r[0],-r[1]])/RAD;
 let hidden=false;try{const q=proj(ll),cd=ps.card&&ps.card.offsetParent?ps.card.getBoundingClientRect():null,hr=L.host.getBoundingClientRect();if(q&&cd){const x=hr.left+q[0],y=hr.top+q[1];hidden=x>cd.left-30&&x<cd.right+40&&y>cd.top-30&&y<cd.bottom+30}}catch(e){}
 if(d<(lim||40)&&!hidden)return false;return nudgeTo(ll[0],ll[1],.08)}catch(e){return false}}
/* once, soon after the stop opens, turn the globe so a place sits in the open part of the view beside the card */
function aimOnce(st,dt,lon,lat,zoom){if(st.aim>=3.2||(L&&L.userTurned))return false;try{const G=g();if(G&&G._flying)return false}catch(e){}st.aim=(st.aim||0)+dt;if(st.aim<.8)return false;return nudgeTo(lon,lat,.2,zoom)}
function mount(m){const G=g();if(!G||!G.host||!G.canvas)return;unmount();
 const host=G.host,div=document.createElement("div");div.className="gc3-layer";div.innerHTML='<svg class="gc3-svg"></svg>';host.appendChild(div);
 L={m,host,el:div,svg:div.querySelector("svg"),ox:0,oy:0,dirty:true,key:"",st:{}};MOD=m;
 const cv=G.canvas,onCv=()=>{if(L)L.userTurned=true};try{cv.addEventListener("pointerdown",onCv,true);cv.addEventListener("wheel",onCv,{capture:true,passive:true})}catch(e){}
 L.offCv=()=>{try{cv.removeEventListener("pointerdown",onCv,true);cv.removeEventListener("wheel",onCv,{capture:true})}catch(e){}};document.body.classList.add("gc3-on","gc3-"+m.id);
 try{m.init(L)}catch(e){console.error("interact-culture3",m.id,e)}
 lastT=0;loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(MOD){try{MOD.cleanup&&MOD.cleanup(L)}catch(e){}document.body.classList.remove("gc3-on","gc3-"+MOD.id)}
 if(L&&L.offCv)L.offCv();if(L&&L.el)L.el.remove();L=null;MOD=null;document.querySelectorAll(".gc3-ctl").forEach(c=>c.remove())}
function draw(){if(!L)return;const G=g();if(!G||!G.canvas)return;const hr=L.host.getBoundingClientRect(),cr=G.canvas.getBoundingClientRect();L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
 L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);
 let k="";try{const p=G.projection();k=p.rotate().map(v=>v.toFixed(3)).join(",")+"|"+p.scale().toFixed(2)+"|"+p.translate().map(v=>v.toFixed(1)).join(",")+"|"+hr.width+"x"+hr.height+"|"+L.ox+","+L.oy+"|"+(G._flat?1:0)}catch(e){k=String(Date.now())}
 if(k===L.key&&!L.dirty)return;L.key=k;L.dirty=false;try{L.m.draw(L)}catch(e){console.error("interact-culture3 draw",e)}try{L.c&&L.c.isConnected&&L.m.card&&L.m.card(L)}catch(e){}}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const dt=lastT?Math.min(.1,(t-lastT)/1000):0;lastT=t;if(L.m.tick&&L.m.tick(L,dt))L.dirty=true;draw()}catch(e){console.error("interact-culture3",e)}loop()})}
function ensureCard(){try{if(!L||typeof ps==="undefined"||!ps||!ps.card)return;if(ps.card.querySelector(".gc3-ctl"))return;const at=ps.card.querySelector(".ps-stat");if(!at)return;
 const c=document.createElement("div");c.className="gc3-ctl gc3-c-"+L.m.id;c.innerHTML='<div class="gc3-do">'+L.m.instr+'</div>'+L.m.html();at.after(c);
 ["pointerdown","mousedown","touchstart","wheel"].forEach(t=>c.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 c.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight")e.stopPropagation()});/* arrow keys move the slider, not the tour */
 L.c=c;try{L.m.wire(L,c)}catch(e){console.error("interact-culture3 wire",e)}L.dirty=true}catch(e){console.error("interact-culture3 card",e)}}
const q$=sel=>L&&L.c?L.c.querySelector(sel):null;
function setTxt(sel,t){const n=q$(sel);if(n&&n.textContent!==t)n.textContent=t}
function setHTML(sel,h){const n=q$(sel);if(n&&n._h!==h){n.innerHTML=h;n._h=h}}
function playBtn(on){const b=q$(".gc3-play");if(b){b.textContent=on?"❚❚":"▶";b.setAttribute("aria-label",on?"Pause":"Play")}}
function range(sel,v,max){const r=q$(sel);if(r&&document.activeElement!==r)r.value=Math.round(v*(max||1000))}
function flash(sel){const n=q$(sel);if(!n)return;n.classList.remove("gc3-flash");void n.offsetWidth;n.classList.add("gc3-flash")}
const playRow=(lab,val)=>'<div class="gc3-row"><button type="button" class="gc3-play" aria-label="Play">▶</button><input type="range" class="gc3-range gc3-u" min="0" max="1000" value="0" aria-label="'+lab+'"><span class="gc3-big gc3-val">'+val+'</span></div>';
/* hide a stop's own lines, pins or icon pins on the globe while this layer draws them itself (keep: a filter, per field) */
function hideOwn(tour,title,keep){let n=0;const t0=setInterval(()=>{try{const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[tour],s=T&&T.steps&&T.steps.find(x=>clean(x.title)===title);
 if(s&&!s._gc3){s._gc3=1;const on=()=>{try{return ps&&ps.tour===tour&&ps.mode==="globe"}catch(e){return false}};
  Object.keys(keep).forEach(f=>{let v=s[f];Object.defineProperty(s,f,{configurable:true,enumerable:true,get(){return on()&&Array.isArray(v)?v.filter(keep[f]):v},set(x){v=x}})})}
 if(s||++n>120)clearInterval(t0)}catch(e){clearInterval(t0)}},500)}
const fmt1=n=>n.toLocaleString("en-GB",{maximumFractionDigits:1});
/* a ring (donut) slice from 12 o'clock, for a share 0..1 */
function ringD(r,f){f=clamp(f,0,.9999);if(f<=0)return"";const a=f*2*Math.PI,x=r*Math.sin(a),y=-r*Math.cos(a);return"M0 "+(-r)+"A"+r+" "+r+" 0 "+(f>.5?1:0)+" 1 "+x.toFixed(2)+" "+y.toFixed(2)}
/* an HTML pill on the map that can be clicked without the globe taking the press */
function hotPill(cls,fn){const d=pill("gc3-hot "+(cls||""));d.setAttribute("role","button");d.tabIndex=0;
 d.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()});
 d.addEventListener("pointerup",e=>{e.stopPropagation();try{fn(e)}catch(err){}if(L)L.dirty=true});
 d.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();try{fn(e)}catch(err){}if(L)L.dirty=true}});
 ["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>d.addEventListener(t,stopAll,{passive:t!=="mousedown"}));return d}
const sizeK=()=>{const G=g();return G&&G.size?clamp(G.size().h/900,.7,1.3):1};

/* ================================================================ 1. Tea, or chai? The word follows the road
   The two families of words and why: Ö. Dahl, "Tea", chapter 138 of The World Atlas of Language Structures Online
   (WALS, wals.info/chapter/138): 110 of its 230 languages use a word from Sinitic "cha", 84 one from Min Nan "te"; the
   Dutch traded through Amoy (Xiamen) and spread "thee" across Europe; the Portuguese, the first European tea traders
   (16th century), bought it via Macao, where Cantonese says "cha", hence "chá"; Malay "teh". V. H. Mair and E. Hoh,
   "The True History of Tea" (2009): the "chai" forms travelled the overland Silk Road to Central Asia and Persia,
   where they took a Persian ending. Each language's word is its standard dictionary form. The routes are sketches of
   the land roads (caravans through Central Asia, and across Mongolia and Siberia to Russia) and of the Dutch and
   Portuguese sea route round the Cape; waypoints chosen to stay on land or at sea. */
const T_LAND=[[108.9,34.3],[103.8,36.1],[94.7,40.1],[87.6,43.8],[75.99,39.47],[66.96,39.65]];
const T_PER=T_LAND.concat([[59.6,36.3],[51.39,35.69]]),T_TUR=T_PER.concat([[44.4,38.5],[32.85,39.93]]);
const T_SEA=[[118.1,24.5],[114,19],[109,11],[104.5,1.5],[98,5.5],[80,5],[60,-15],[45,-33],[20,-36],[5,-20],[-12,0],[-25,15],[-12,40],[-12,44],[-5,48.5],[3,51.5]];
const TEA=[
 {n:"Russian",w:"чай",lat:"chai",how:"land",ll:[37.62,55.75],r:[[108.9,34.3],[111.7,40.8],[106.9,47.9],[104.3,52.3],[82.9,55.0],[60.6,56.8],[37.62,55.75]],
  t:"Tea reached Russia by camel caravan across Mongolia and Siberia, and the northern Chinese word ‘cha’ came with it."},
 {n:"English",w:"tea",how:"sea",ll:[-0.13,51.5],r:T_SEA.concat([[1.6,51.2],[-0.13,51.5]]),
  t:"Dutch ships brought tea, and the word ‘thee’, from Xiamen on the Fujian coast, where people say ‘te’. English later changed the vowel."},
 {n:"Persian",w:"چای",lat:"chāy",how:"land",ll:[51.39,35.69],r:T_PER,
  t:"‘Cha’ came along the Silk Road to Persia, which gave it a Persian ending: chāy. Its neighbours took this ‘chai’ form from here."},
 {n:"Dutch",w:"thee",how:"sea",ll:[4.9,52.37],r:T_SEA.concat([[4.9,52.37]]),
  t:"The Dutch bought their tea in Xiamen, where the local Min language says ‘te’. Dutch ships then spread the word round most of Europe."},
 {n:"Turkish",w:"çay",how:"land",ll:[32.85,39.93],r:T_TUR,
  t:"Turkish has the Persian form, çay: the word came over land along the caravan roads."},
 {n:"Finnish",w:"tee",how:"sea",ll:[24.94,60.17],r:T_SEA.concat([[8,57.5],[11.5,57.7],[12.7,56.0],[14.5,55.2],[19.5,56.5],[21.5,59.4],[24.94,60.17]]),
  t:"Finland borders Russia, yet it says ‘tee’, like Swedish ‘te’: its word came the sea way, from western Europe, not over land."},
 {n:"Hindi",w:"चाय",lat:"chāy",how:"land",ll:[77.21,28.61],r:T_LAND.concat([[69.2,34.5],[74.3,31.5],[77.21,28.61]]),
  t:"Hindi and Urdu say chāy, the Persian form, which came over the mountains from Central Asia and Persia."},
 {n:"Malay",w:"teh",how:"sea",ll:[102.25,2.2],r:T_SEA.slice(0,4).concat([[102.25,2.2]]),
  t:"Fujian traders sailed to these ports, so Malay and Indonesian say ‘teh’. The Dutch may even have picked up their word here."},
 {n:"Greek",w:"τσάι",lat:"tsai",how:"land",ll:[23.73,37.98],r:T_TUR.concat([[29,41],[26.5,40.3],[23.73,37.98]]),
  t:"Greek ‘tsai’ is the overland word too: it came through Greece’s neighbours to the east."},
 {n:"Portuguese",w:"chá",how:"sea",ll:[-9.14,38.72],r:[[113.55,22.2]].concat(T_SEA.slice(1,12),[[-15,35],[-9.14,38.72]]),
  t:"The trick one! Tea came to Portugal by sea, but the Portuguese, Europe’s first tea traders, bought it in Macau, where Cantonese says ‘cha’. So: chá."}];
const tea={id:"tea",tour:"food",title:"Tea, or chai?",
 instr:"🍵 Each language’s word for tea is shown on the map. Did the word come over land, or by sea? Pick one, and watch it travel.",
 init(L){const s=L.st;s.i=0;s.res=[];s.fly=null;s.last=null;
  s.R=TEA.map(it=>densify(it.r,80));
  s.paths=TEA.map(it=>({h:el("path",{class:"gc3-arc-halo"},L.svg),p:el("path",{class:"gc3-arc gc3-"+it.how},L.svg)}));
  s.dots=TEA.map(it=>({c:el("circle",{r:6,class:"gc3-teadot gc3-"+it.how},L.svg),lab:pill("gc3-chip")}));
  s.cup=el("g",{class:"gc3-cup"},L.svg);el("circle",{r:13},s.cup);const t=el("text",{"text-anchor":"middle",y:5.5},s.cup);t.textContent="🍵";
  s.ring=el("circle",{r:14,class:"gc3-qring"},L.svg);s.q=pill("gc3-big-pill");
  s.zL=hotPill("gc3-zone gc3-zland",()=>tea.answer(L,"land"));s.zS=hotPill("gc3-zone gc3-zsea",()=>tea.answer(L,"sea"));
  s.oL=pill("gc3-chip");s.oS=pill("gc3-chip")},
 answer(L,how){const s=L.st;if(s.i>=TEA.length)return;s.fly=null;/* answering again finishes the last word's trip at once */s.res[s.i]=how===TEA[s.i].how;s.last=s.i;s.fly={i:s.i,t:0};s.i++;L.dirty=true;flash(".gc3-out")},
 tick(L,dt){const s=L.st;let a=aimOnce(s,dt,62,40,1);/* keep the language being asked about out from under the card */if(!s.fly&&s.i<TEA.length&&(s.aim||0)>=3.2&&follow(TEA[s.i].ll,62))a=true;if(!s.fly)return a;s.fly.t+=dt;if(s.fly.t>=2.2)s.fly=null;return true},
 draw(L){const s=L.st;
  TEA.forEach((it,i)=>{const P=s.paths[i],D=s.dots[i],done=i<s.i,fl=s.fly&&s.fly.i===i,R=s.R[i];let f=done?1:0;if(fl)f=ease(Math.min(1,s.fly.t/1.9));
   if(done){const km=f*R.L,pts=R.P.filter((p,k)=>R.K[k]<=km);pts.push(along(R,km).ll);const d=pathOf(pts);P.p.setAttribute("d",d);P.h.setAttribute("d",d);
    if(fl)place(s.cup,proj(along(R,km).ll))}else{P.p.setAttribute("d","");P.h.setAttribute("d","")}
   const q=done&&f>=1?proj(it.ll):null;place(D.c,q);D.c.classList.toggle("gc3-bad",done&&s.res[i]===false);
   putPill(D.lab,q,"<b>"+esc(it.w)+"</b>"+(it.lat?" <small>"+esc(it.lat)+"</small>":""),0,-8,"")});
  if(!s.fly)place(s.cup,null);
  const cur=s.i<TEA.length&&!s.fly?TEA[s.i]:null,cq=cur?proj(cur.ll):null;place(s.ring,cq);
  putPill(s.q,cq,cur?esc(cur.n)+": “"+esc(cur.w)+"”"+(cur.lat?" ("+esc(cur.lat)+")":"")+" ?":"",0,-18,"");
  const open=s.i<TEA.length&&!s.fly;putPill(s.zL,open?proj([84,47]):null,"⛰ Over land",0,0,"c");putPill(s.zS,open?proj([80,-4]):null,"⛵ By sea",0,0,"c");
  putPill(s.oL,proj(T_LAND[0]),"cha",-6,0,"l");putPill(s.oS,proj(T_SEA[0]),"te",6,0,"r")},
 html(){return'<div class="gc3-seg gc3-teab"><button type="button" data-h="land">⛰ Over land</button><button type="button" data-h="sea">⛵ By sea</button></div>'+
  '<div class="gc3-row gc3-small"><span class="gc3-prog"></span><span class="gc3-score"></span></div><div class="gc3-out"></div>'+
  '<div class="gc3-keys"><span><i style="background:#d9480f"></i>came over land</span><span><i style="background:#1971c2"></i>came by sea</span></div>'+
  '<div class="gc3-note">Sources: Östen Dahl, “Tea”, World Atlas of Language Structures (WALS) chapter 138; Mair and Hoh, The True History of Tea (2009). Routes are sketches.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gc3-teab button").forEach(b=>b.onclick=()=>{if(s.i>=TEA.length){s.i=0;s.res=[];s.last=null;L.dirty=true;return}tea.answer(L,b.dataset.h)})},
 card(L){const s=L.st,n=s.res.filter(Boolean).length,done=s.i>=TEA.length;
  setTxt(".gc3-prog",done?"All "+TEA.length+" done":(s.i+1)+" of "+TEA.length+": "+TEA[s.i].n);setTxt(".gc3-score",s.i?"✓ "+n+" right":"");
  const bs=L.c.querySelectorAll(".gc3-teab button");if(bs.length===2){bs[0].textContent=done?"↺ Play again":"⛰ Over land";bs[1].style.display=done?"none":""}
  let o;if(s.last==null)o="Tea comes from China. Inland, people say <b>cha</b>; on the Fujian coast, where Dutch ships loaded it, they say <b>te</b>. Russian says <b>чай (chai)</b>: did its word come over land, or by sea?";
  else{const it=TEA[s.last],ok=s.res[s.last];o='<b class="'+(ok?"gc3-ok":"gc3-no")+'">'+(ok?"✓ Right: ":"✗ Not this time: ")+esc(it.n)+" “"+esc(it.w)+"” came "+(it.how==="land"?"over land":"by sea")+".</b> "+esc(it.t)}
  if(done)o+='<div class="gc3-sum">You got <b>'+n+" of "+TEA.length+"</b>. The rule: words like <b>cha, chai, chay</b> travelled the caravan roads; <b>te, tea, thé, tee</b> sailed from Fujian with the Dutch. Portugal is the exception that proves it: by sea, but from Macau.</div>";
  setHTML(".gc3-out",o)}};
MODS.push(tea);
hideOwn("food","Tea, or chai?",{lines:()=>false,pins:()=>false,iconPins:()=>false,hi:()=>false,G:()=>false});/* the stop's three arrows and its two colours of countries are the answers: each route and word is drawn here once it is guessed */

/* ================================================================ 2. The race for the sky: the crown moves round the world
   Record holders and years: Wikipedia, "History of the world's tallest buildings" (table "Years as tallest", heights
   as given there, which follow the Council on Tall Buildings and Urban Habitat, CTBUH); the Singer Building's 187 m is
   its roof height (Wikipedia, "Singer Building"). The other six of today's tallest are the stop's own list, with their
   completion years from CTBUH. The North Tower of the World Trade Center fell on 11 September 2001. The Eiffel Tower
   (300 m in 1889) is a tower, not a building, so it is drawn only as a yardstick. */
const SKY=[
 {n:"Cologne Cathedral",c:"Cologne",y:1880,h:157,ll:[6.958,50.941],rec:1},
 {n:"Ulm Minster",c:"Ulm",y:1890,h:162,ll:[9.992,48.399],rec:1},
 {n:"Philadelphia City Hall",c:"Philadelphia",y:1894,h:167,ll:[-75.164,39.953],rec:1},
 {n:"Singer Building",c:"New York",y:1908,h:187,ll:[-74.0099,40.7096],rec:1,dx:-24},
 {n:"Metropolitan Life Tower",c:"New York",y:1909,h:213,ll:[-73.9873,40.7414],rec:1,dx:-16},
 {n:"Woolworth Building",c:"New York",y:1913,h:241,ll:[-74.0083,40.7124],rec:1,dx:-8},
 {n:"40 Wall Street",c:"New York",y:1930,h:283,ll:[-74.0092,40.7069],rec:1,dx:0},
 {n:"Chrysler Building",c:"New York",y:1930.5,h:319,ll:[-73.9755,40.7516],rec:1,dx:8},
 {n:"Empire State Building",c:"New York",y:1931,h:381,ll:[-73.9857,40.7484],rec:1,dx:16},
 {n:"World Trade Center",c:"New York",y:1970,h:417,ll:[-74.0134,40.7127],rec:1,dx:24,gone:2001.7},
 {n:"Sears (Willis) Tower",c:"Chicago",y:1973,h:442,ll:[-87.636,41.879],rec:1},
 {n:"Petronas Towers",c:"Kuala Lumpur",y:1998,h:452,ll:[101.712,3.158],rec:1,dx:-5},
 {n:"Taipei 101",c:"Taipei",y:2004,h:508,ll:[121.565,25.034],rec:1},
 {n:"Burj Khalifa",c:"Dubai",y:2010,h:828,ll:[55.274,25.197],rec:1},
 {n:"Makkah Clock Royal Tower",c:"Mecca",y:2012,h:601,ll:[39.826,21.419]},
 {n:"One World Trade Center",c:"New York",y:2014,h:541,ll:[-74.0134,40.713],dx:32},
 {n:"Shanghai Tower",c:"Shanghai",y:2015,h:632,ll:[121.5055,31.2335]},
 {n:"Ping An Finance Centre",c:"Shenzhen",y:2017,h:599,ll:[114.05,22.537]},
 {n:"Lotte World Tower",c:"Seoul",y:2017,h:555,ll:[127.1025,37.5126]},
 {n:"Merdeka 118",c:"Kuala Lumpur",y:2023,h:679,ll:[101.7003,3.1417],dx:5}];
const SKY_Y0=1880,SKY_Y1=2025,EIFFEL={y:1889,h:300,ll:[2.2945,48.8584]};
function skyAt(Y){const up=SKY.map((b,i)=>i).filter(i=>SKY[i].y<=Y&&!(SKY[i].gone&&SKY[i].gone<=Y));let top=-1;up.forEach(i=>{if(SKY[i].rec&&(top<0||SKY[i].h>SKY[top].h))top=i});return{up,top}}
const sky={id:"sky",tour:"landmarks",title:"The race for the sky",
 instr:"🏙 Press ▶ or slide from 1880 to today: each tower rises where it was built, and the 👑 jumps to the tallest.",
 init(L){const s=L.st;s.Y=SKY_Y0;s.play=false;s.sel=-1;s.lastTop=-1;s.was=new Set();
  s.ef=el("g",{class:"gc3-eiffel"},L.svg);s.efR=el("rect",{x:-3,width:6},s.ef);s.efL=pill("gc3-chip gc3-dim");
  s.b=SKY.map((b,i)=>{const gg=el("g",{class:"gc3-handle gc3-tower",tabindex:"0","aria-label":b.n},L.svg);const r=el("rect",{x:-3.5,width:7,rx:1.5},gg);const hit=el("rect",{x:-7,width:14,class:"gc3-hit"},gg);
   clickable(gg,()=>{s.sel=s.sel===i?-1:i});return{gg,r,hit}});
  s.crown=el("text",{class:"gc3-crown","text-anchor":"middle"},L.svg);s.crown.textContent="👑";s.top=pill("gc3-big-pill");s.selL=pill("gc3-chip")},
 tick(L,dt){const s=L.st;let ch=aimOnce(s,dt,-25,40,1);if(s.play){s.Y=Math.min(SKY_Y1,s.Y+dt*6);if(s.Y>=SKY_Y1){s.play=false;playBtn(false)}ch=true}
  const t=skyAt(s.Y).top;if(t>=0&&(s.play||s.drag)&&follow(SKY[t].ll,38))ch=true;return ch},
 draw(L){const s=L.st,k=sizeK(),px=.15*k,{up,top}=skyAt(s.Y);
  SKY.forEach((b,i)=>{const o=s.b[i],on=up.includes(i);let q=on?proj(b.ll):null;
   if(q){q=[q[0]+(b.dx||0)*k,q[1]];const grow=clamp((s.Y-b.y)/2.5,0,1),hh=b.h*px*ease(grow);o.r.setAttribute("y",(-hh).toFixed(1));o.r.setAttribute("height",hh.toFixed(1));o.hit.setAttribute("y",(-hh-6).toFixed(1));o.hit.setAttribute("height",(hh+10).toFixed(1))}
   place(o.gg,q);o.gg.classList.toggle("gc3-top",i===top);o.gg.classList.toggle("gc3-rec",!!b.rec);o.gg.classList.toggle("gc3-picked",i===s.sel)});
  const eq=s.Y>=EIFFEL.y?proj(EIFFEL.ll):null;if(eq){const hh=EIFFEL.h*px;s.efR.setAttribute("y",-hh);s.efR.setAttribute("height",hh)}place(s.ef,eq);putPill(s.efL,eq&&top<9?eq:null,"Eiffel Tower 300 m <small>(a tower, not a building)</small>",8,-EIFFEL.h*px+6,"r");
  const T=top>=0?SKY[top]:null;let tq=T?proj(T.ll):null;if(tq)tq=[tq[0]+(T.dx||0)*k,tq[1]-T.h*px*ease(clamp((s.Y-T.y)/2.5,0,1))];
  if(tq){s.crown.style.display="";s.crown.setAttribute("x",tq[0]);s.crown.setAttribute("y",tq[1]-4)}else s.crown.style.display="none";
  putPill(s.top,tq,T?esc(T.n)+" <small>"+T.h+" m</small>":"",0,-26,"");
  const S=s.sel>=0&&s.sel!==top&&up.includes(s.sel)?SKY[s.sel]:null;let sq=S?proj(S.ll):null;if(sq)sq=[sq[0]+(S.dx||0)*k,sq[1]-S.h*px];
  putPill(s.selL,sq,S?"<b>"+esc(S.n)+"</b> <small>"+esc(S.c)+", "+Math.floor(S.y)+"</small> "+S.h+" m":"",0,-6,"")},
 html(){return playRow("Year","1880")+'<div class="gc3-crownbox"><b></b><span></span></div><div class="gc3-skyline"></div><div class="gc3-out"></div>'+
  '<div class="gc3-note">Bar height shows height in metres; click a tower for its name. Record holders: Wikipedia, “History of the world’s tallest buildings” (CTBUH heights).</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gc3-play").onclick=()=>{if(s.Y>=SKY_Y1)s.Y=SKY_Y0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gc3-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.Y=SKY_Y0+r.value/1000*(SKY_Y1-SKY_Y0);s.drag=true;L.dirty=true});r.addEventListener("change",()=>{s.drag=false})},
 card(L){const s=L.st,{up,top}=skyAt(s.Y),T=SKY[top];range(".gc3-u",(s.Y-SKY_Y0)/(SKY_Y1-SKY_Y0));setTxt(".gc3-val",String(Math.floor(s.Y)));
  /* how long it has held the crown so far, and when it lost it */
  const next=SKY.filter(b=>b.rec&&b.y>T.y&&b.h>T.h).sort((a,b)=>a.y-b.y)[0];const held=next?Math.floor(next.y)-Math.floor(T.y):Math.floor(s.Y)-Math.floor(T.y);
  setHTML(".gc3-crownbox b","👑 "+esc(T.n)+", "+esc(T.c)+" · "+T.h+" m");
  setHTML(".gc3-crownbox span",next?"Tallest from "+Math.floor(T.y)+" to "+Math.floor(next.y)+": "+held+" year"+(held===1?"":"s"):"Tallest since "+T.y+(held>0?": "+held+" years and counting":""));
  if(top!==s.lastTop){s.lastTop=top;flash(".gc3-crownbox")}
  const mx=828,list=up.slice().sort((a,b)=>SKY[a].y-SKY[b].y);
  setHTML(".gc3-skyline",list.map(i=>{const b=SKY[i];return'<i class="'+(i===top?"on":"")+'" title="'+esc(b.n)+'" style="height:'+(100*b.h/mx).toFixed(1)+'%"></i>'}).join(""));
  let o;const Y=s.Y;
  if(Y<1894)o="In 1880 the tallest buildings on Earth were <b>cathedrals</b>, in Germany. Their spires had been the record holders for centuries.";
  else if(Y<1908)o="A city hall in <b>Philadelphia</b> takes the lead: the first time in centuries that the tallest building is not a church, and the record crosses the Atlantic.";
  else if(Y<1931)o="Steel frames and lifts start a race in <b>New York</b>. In 1930 the Chrysler Building beat 40 Wall Street by hiding its spire inside the tower and raising it at the last minute.";
  else if(Y<1973)o="The <b>Empire State Building</b> keeps the crown for 39 years, longer than any other skyscraper so far.";
  else if(Y<1998)o="Chicago’s <b>Sears Tower</b> rules for 25 years. Then the crown leaves America for the first time since 1894.";
  else if(Y<2010)o="Asia takes over: <b>Kuala Lumpur</b> in 1998, then <b>Taipei</b>. The World Trade Center’s towers fell in 2001.";
  else o="<b>Burj Khalifa</b> beats the old record by 320 m. Of the seven tallest buildings today, only one is in America; the rest are in Asia and the Middle East.";
  setHTML(".gc3-out",o)}};
MODS.push(sky);

/* ================================================================ 3. Oil under the ground: the most oil is not the most pumped
   Proven reserves, billion barrels: OPEC Annual Statistical Bulletin 2025, except Canada, from the US Energy Information
   Administration (EIA, 2021 data), because OPEC's count leaves out Canada's oil sands (both as tabulated in Wikipedia,
   "List of countries by proven oil reserves"). These match the stop's own rounded list. Production, crude oil and lease
   condensate, thousand barrels a day: EIA, January 2026 (Wikipedia, "List of countries by oil production"). "Years it
   would last" is simply reserves ÷ (production × 365): not a forecast, since reserves change as oil is found and
   prices and technology change. Barrels sit on each country's main oil region (the Gulf ones spread out to be clickable). */
const OIL=[
 {n:"Venezuela",ll:[-64,8.5],r:303.2,p:805},{n:"Saudi Arabia",ll:[44.5,23.5],side:"l",r:267.2,p:10110},{n:"Iran",ll:[54,32.5],side:"r",r:208.6,p:4030},
 {n:"Canada",ll:[-111.5,57],r:170.0,p:5059},{n:"Iraq",ll:[43.5,33.5],side:"l",r:145.0,p:4391},{n:"UAE",ll:[54.5,23.8],side:"r",r:113.0,p:4010},
 {n:"Kuwait",ll:[47.8,29.4],side:"l",r:101.5,p:2660},{n:"Russia",ll:[73,61],r:80.0,p:10027},{n:"Libya",ll:[18,28.5],r:48.4,p:1398},
 {n:"United States",ll:[-102.5,31.8],r:45.0,p:13246}];
const OM=[{k:"r",lab:"🛢 Under the ground",u:" bn barrels",v:o=>o.r,f:v=>fmt1(v)},{k:"p",lab:"⛽ Pumped a day",u:" million a day",v:o=>o.p/1000,f:v=>fmt1(v)},
 {k:"y",lab:"⏳ Years it would last",u:" years",v:o=>o.r*1e9/(o.p*1e3*365),f:v=>fmtN(v)}];
const oil={id:"oil",tour:"resources",title:"Oil under the ground",
 instr:"🛢 Which country has the most oil underground? Click its barrel on the map. Then compare what each one pumps.",
 init(L){const s=L.st;s.guess=null;s.m=0;s.u=0;s.from=null;
  s.o=OIL.map((c,i)=>{const gg=el("g",{class:"gc3-handle gc3-barrel",tabindex:"0","aria-label":c.n},L.svg);
   const bar=el("rect",{x:-6,width:12,rx:2,class:"gc3-obar"},gg);el("rect",{x:-8,y:-9,width:16,height:18,rx:3,class:"gc3-drum"},gg);el("path",{d:"M-8 -3 H8 M-8 3 H8",class:"gc3-drumline"},gg);
   const hit=el("rect",{x:-11,width:22,class:"gc3-hit"},gg);clickable(gg,()=>oil.pick(L,i));return{gg,bar,hit,lab:pill("gc3-chip")}})},
 pick(L,i){const s=L.st;if(s.guess==null){s.guess=i;s.u=0;flash(".gc3-out")}},
 vals(m){const M=OM[m];return OIL.map(M.v)},
 tick(L,dt){const s=L.st;let ch=aimOnce(s,dt,-15,32,1);/* after a switch, turn once towards where that measure is biggest */if(s.go&&!L.userTurned){s.go.t+=dt;if(s.go.t>2.5||!nudgeTo(s.go.ll[0],s.go.ll[1],.12))s.go=null;else ch=true}if(s.guess!=null&&s.u<1){s.u=Math.min(1,s.u+dt*1.3);ch=true}return ch},
 draw(L){const s=L.st,k=sizeK(),shown=s.guess!=null,V=this.vals(s.m),mx=Math.max.apply(null,V),P=s.from?s.from:V.map(()=>0),
  M=OM[s.m];
  OIL.forEach((c,i)=>{const o=s.o[i],q=proj(c.ll);place(o.gg,q);const v=lerp(P[i]/(s.fromMx||mx),V[i]/mx,ease(s.u)),hh=shown?Math.max(2,110*k*v):0;
   o.bar.setAttribute("y",(-9-hh).toFixed(1));o.bar.setAttribute("height",hh.toFixed(1));o.hit.setAttribute("y",(-12-hh).toFixed(1));o.hit.setAttribute("height",(24+hh).toFixed(1));
   o.gg.classList.toggle("gc3-picked",s.guess===i);o.gg.classList.toggle("gc3-best",shown&&V[i]===mx);
   /* the five Gulf barrels are close together: their labels go out to the sides */
   putPill(o.lab,q,shown?"<b>"+esc(c.n)+"</b><span>"+M.f(V[i])+"</span>":esc(c.n)+" ?",c.side==="l"?-10:c.side==="r"?10:0,c.side?-hh-4:-14-hh,c.side||"")})},
 html(){return'<div class="gc3-out"></div><div class="gc3-seg gc3-omb" hidden>'+OM.map((m,i)=>'<button type="button" data-m="'+i+'"'+(i?'':' class="on"')+'>'+m.lab+'</button>').join("")+'</div><div class="gc3-ranks"></div>'+
  '<div class="gc3-note">Reserves: OPEC Annual Statistical Bulletin 2025 (Canada: US EIA, with its oil sands). Pumped: crude oil, US EIA, January 2026. Years = reserves ÷ a year’s pumping, not a forecast.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gc3-omb button").forEach(b=>b.onclick=()=>{const m=+b.dataset.m;if(m===s.m)return;s.from=oil.vals(s.m);s.fromMx=Math.max.apply(null,s.from);s.m=m;s.u=0;s.go={t:0,ll:m===1?[-45,40]:[-15,32]};flash(".gc3-out");L.dirty=true})},
 card(L){const s=L.st;const seg=q$(".gc3-omb");if(seg)seg.hidden=s.guess==null;
  L.c.querySelectorAll(".gc3-omb button").forEach(b=>b.classList.toggle("on",+b.dataset.m===s.m));
  if(s.guess==null){setHTML(".gc3-out","Ten countries hold most of the world’s oil. Which has the <b>most</b> under the ground? Click a barrel.");setHTML(".gc3-ranks","");return}
  const V=this.vals(s.m),M=OM[s.m],ord=OIL.map((c,i)=>i).sort((a,b)=>V[b]-V[a]),mx=V[ord[0]];
  const ok=s.guess===0,g0='<b class="'+(ok?"gc3-ok":"gc3-no")+'">'+(ok?"✓ Yes: Venezuela, about 300 billion barrels.":"✗ Not "+esc(OIL[s.guess].n)+": it is Venezuela, about 300 billion barrels.")+"</b> ";
  const tx=[g0+"Now press <b>Pumped a day</b>: does the country with the most oil pump the most?",
   "The <b>United States</b> pumps the most, over 13 million barrels a day, from shale rock it cracks open by fracking. Venezuela, with the most oil of all, pumps less than a million: its thick, tar-like oil is hard to get out, and its oil industry has shrunk sharply.",
   "At today’s rate Venezuela’s oil would last about <b>a thousand years</b>; America’s about nine. That isn’t what will really happen: companies keep finding more oil, and new tools make more of it worth pumping."][s.m];
  setHTML(".gc3-out",tx);
  setHTML(".gc3-ranks",ord.map((i,r)=>'<div><span>'+(r+1)+". "+esc(OIL[i].n)+'</span><i><b style="width:'+(100*V[i]/mx).toFixed(1)+'%"></b></i><em>'+M.f(V[i])+"</em></div>").join("")+'<div class="gc3-unit">'+esc(M.u.trim())+"</div>")}};
MODS.push(oil);
hideOwn("resources","Oil under the ground",{pins:()=>false,iconPins:()=>false});/* its Orinoco, Alberta and Ghawar markers sit under the barrels */

/* ================================================================ 4. Paper's slow road west
   Years and places: Wikipedia, "History of paper", after T. H. Tsien, "Paper and Printing" (Science and Civilisation in
   China 5:1, 1985) for Cai Lun in 105; Wilkinson (2012) for Damjing in Japan, 610; J. Bloom, "Paper Before Print"
   (2001), who thinks the story of Chinese prisoners taken at Talas (751) teaching Samarkand is unlikely to be true;
   R. I. Burns (1996) for Baghdad's mills of 794-795 and Xàtiva; first recorded mill in Iberia at Xàtiva, 1056; Fez about
   1100; Troyes by 1348; Ulman Stromer's mill at Nuremberg, 1390, the first north of the Alps; John Tate's at Hertford,
   about 1490; Mexico by 1575; William Rittenhouse's mill near Philadelphia, 1690. Fabriano's mills are dated to 1276,
   the year usually given (Dard Hunter, "Papermaking", 1947). Korea "4th century" is drawn at 350. The lines show the
   general direction the craft spread, not recorded journeys. */
const PAP=[
 {n:"Luoyang",y:105,yl:"105",ll:[112.45,34.62],p:-1,t:"The court official Cai Lun reports a better way to make paper, from bark, hemp, rags and old fishing nets. Paper itself is older, but this is the date China remembers."},
 {n:"Korea",y:350,yl:"300s",ll:[127,38.5],p:0,t:"Paper reaches Korea in the 300s."},
 {n:"Japan",y:610,yl:"610",ll:[135.8,34.5],p:1,t:"A Korean monk, Damjing, teaches papermaking in Japan."},
 {n:"Samarkand",y:751,yl:"751",ll:[66.96,39.65],p:0,via:[[94.66,40.14],[75.99,39.47]],t:"Legend says Chinese prisoners taken at the Battle of Talas taught Samarkand to make paper. Historians doubt it: paper had travelled the Silk Road before. Either way, Samarkand paper becomes famous."},
 {n:"Baghdad",y:793,yl:"793",ll:[44.37,33.31],p:3,t:"Baghdad, the caliphs’ capital, starts making paper. Government clerks switch from parchment, and books become cheaper."},
 {n:"Cairo",y:900,yl:"by 900",ll:[31.23,30.01],p:4,t:"In Egypt, paper replaces papyrus, used there for some 4,000 years."},
 {n:"Xàtiva, Spain",y:1056,yl:"1056",ll:[-0.52,38.99],p:5,via:[[10.1,35.7]],t:"Muslim Spain has Europe’s first recorded paper mill, at Xàtiva: about 950 years after Cai Lun."},
 {n:"Fez",y:1100,yl:"c. 1100",ll:[-5.0,34.03],p:5,via:[[10.1,35.7]],t:"Fez in Morocco makes paper."},
 {n:"Fabriano, Italy",y:1276,yl:"1276",ll:[12.9,43.34],p:6,t:"Italian mills at Fabriano add watermarks and harder, smoother paper. Italy becomes the paper-maker for Christian Europe."},
 {n:"Troyes, France",y:1348,yl:"by 1348",ll:[4.07,48.3],p:8,t:"France makes its own paper."},
 {n:"Nuremberg",y:1390,yl:"1390",ll:[11.08,49.45],p:8,t:"Ulman Stromer opens the first paper mill north of the Alps. Sixty years later, Gutenberg starts printing in Mainz: cheap paper made the printed book possible."},
 {n:"Hertford, England",y:1490,yl:"c. 1490",ll:[-0.08,51.8],p:9,t:"John Tate opens England’s first paper mill."},
 {n:"Mexico",y:1575,yl:"by 1575",ll:[-99.13,19.43],p:6,t:"Spanish settlers make paper in Mexico, the first in the Americas."},
 {n:"Philadelphia",y:1690,yl:"1690",ll:[-75.19,40.03],p:10,t:"William Rittenhouse, a papermaker from the Rhineland, opens the first paper mill in the English colonies."}];
const PAP_Y0=100,PAP_Y1=1700;
const paper={id:"paper",tour:"inventions",title:"China’s Four Great Inventions",
 instr:"📜 Follow paper out of China. First a guess: how long until Europe had its first paper mill?",
 init(L){const s=L.st;s.Y=PAP_Y0;s.play=false;s.guess=null;s.last=-1;
  s.R=PAP.map(e=>e.p<0?null:densify([PAP[e.p].ll].concat(e.via||[],[e.ll]),80));
  s.lines=PAP.map(e=>e.p<0?null:{h:el("path",{class:"gc3-arc-halo"},L.svg),p:el("path",{class:"gc3-arc gc3-paper"},L.svg)});
  s.pts=PAP.map(()=>{const gg=el("g",{class:"gc3-pt"},L.svg);el("circle",{class:"gc3-glow",r:13},gg);el("circle",{r:5.5},gg);return gg});s.labs=PAP.map(()=>pill("gc3-chip"));
  s.scroll=el("text",{class:"gc3-emo","text-anchor":"middle"},L.svg);s.scroll.textContent="📜"},
 tick(L,dt){const s=L.st;let ch=aimOnce(s,dt,60,38,1);if(s.play){s.Y=Math.min(PAP_Y1,s.Y+dt*60);if(s.Y>=PAP_Y1){s.play=false;playBtn(false)}ch=true}
  if(s.guess!=null&&(s.play||s.drag)){let k=0;PAP.forEach((e,i)=>{if(e.y<=s.Y)k=i});if(follow(PAP[k].ll,40))ch=true}return ch},
 draw(L){const s=L.st,on=s.guess!=null;let head=null;
  PAP.forEach((e,i)=>{const lit=on&&e.y<=s.Y,q=lit?proj(e.ll):null,fresh=lit&&s.Y-e.y<60;place(s.pts[i],q);s.pts[i].classList.toggle("gc3-fresh",fresh);
   putPill(s.labs[i],q,"<b>"+esc(e.n)+"</b> <small>"+esc(e.yl)+"</small>",0,-10,"");
   const ln=s.lines[i];if(!ln)return;/* the line grows over the 50 years before the place is reached */
   const f=on?clamp((s.Y-(e.y-50))/50,0,1):0,R=s.R[i];if(f>0){const km=f*R.L,pts=R.P.filter((p,k)=>R.K[k]<=km);pts.push(along(R,km).ll);const d=pathOf(pts);ln.p.setAttribute("d",d);ln.h.setAttribute("d",d);if(f<1)head=along(R,km).ll}
   else{ln.p.setAttribute("d","");ln.h.setAttribute("d","")}});
  const hq=head?proj(head):null;if(hq){s.scroll.style.display="";s.scroll.setAttribute("x",hq[0]);s.scroll.setAttribute("y",hq[1]+7)}else s.scroll.style.display="none"},
 html(){return'<div class="gc3-seg gc3-pg"><button type="button" data-g="100">about 100 years</button><button type="button" data-g="400">about 400 years</button><button type="button" data-g="950">about 950 years</button></div>'+
  '<div class="gc3-reveal" hidden>'+playRow("Year","105")+'</div><div class="gc3-astat"></div><div class="gc3-ev"><b></b><span></span></div>'+
  '<div class="gc3-note">Dates: Tsien (1985), Bloom, Paper Before Print (2001), Burns (1996), via Wikipedia “History of paper”. Lines show the direction paper spread, not exact journeys.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gc3-pg button").forEach(b=>b.onclick=()=>{if(s.guess!=null)return;s.guess=+b.dataset.g;b.classList.add("on");c.querySelector(".gc3-reveal").hidden=false;
   c.querySelectorAll(".gc3-pg button").forEach(x=>{x.disabled=true;if(x.dataset.g==="950")x.classList.add("gc3-right")});s.Y=PAP_Y0;s.play=true;lastT=0;playBtn(true);L.dirty=true});
  c.querySelector(".gc3-play").onclick=()=>{if(s.Y>=PAP_Y1)s.Y=PAP_Y0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gc3-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.Y=PAP_Y0+r.value/1000*(PAP_Y1-PAP_Y0);s.drag=true;L.dirty=true});r.addEventListener("change",()=>{s.drag=false})},
 card(L){const s=L.st;range(".gc3-u",(s.Y-PAP_Y0)/(PAP_Y1-PAP_Y0));setTxt(".gc3-val",String(Math.max(105,Math.floor(s.Y))));
  if(s.guess==null){setHTML(".gc3-astat","Cai Lun improved paper in China in <b>105 AD</b>. How long did it take to reach Europe’s first paper mill?");setTxt(".gc3-ev b","");setTxt(".gc3-ev span","");return}
  const n=PAP.filter(e=>e.y<=s.Y).length,ok=s.guess===950;
  setHTML(".gc3-astat",'<b class="'+(ok?"gc3-ok":"gc3-no")+'">'+(ok?"✓ Right: about 950 years":"✗ It took about 950 years")+"</b> (105 to 1056, Xàtiva in Spain). Paper has reached <b>"+n+" of "+PAP.length+"</b> places.");
  let k=0;PAP.forEach((e,i)=>{if(e.y<=s.Y)k=i});if(k!==s.last){s.last=k;const E=PAP[k];setTxt(".gc3-ev b",E.yl+" · "+E.n);setTxt(".gc3-ev span",E.t);flash(".gc3-ev")}}};
MODS.push(paper);
hideOwn("inventions","China’s Four Great Inventions",{lines:()=>false});/* its Silk Road arrow: the growing lines here replace it */

/* ================================================================ 5. One in thirty: how many of 100 were born abroad?
   Shares of people living in a country who were born in another one (where birthplace is unknown, citizenship), 2024:
   UN DESA, International Migrant Stock 2024 (as tabulated in Wikipedia, "List of sovereign states and dependent
   territories by immigrant population"). World: about 304 million, 3.7% (UN DESA 2024; the stop's own figure). */
const MIG=[
 {n:"United States",ll:[-98,39],p:15.3,t:"About 15 in 100. The US is home to more people born abroad than any other country, about 50 million, but it is a big country."},
 {n:"Japan",ll:[138.5,36.5],p:2.8,t:"Under 3 in 100. Japan has let in few migrants, though the number is now rising as its people age."},
 {n:"Australia",ll:[134,-25],p:29.4,t:"Almost 30 in 100: nearly one Australian in three was born in another country."},
 {n:"Germany",ll:[10.4,51.1],p:21.3,t:"About 21 in 100, more than in the US. Many came as ‘guest workers’ from Turkey and southern Europe, and more recently from Poland, Syria and Ukraine."},
 {n:"China",ll:[104,35],p:0.12,t:"About 1 in 1,000. In a country of 1.4 billion, newcomers from abroad hardly show at all."},
 {n:"Singapore",ll:[103.82,1.35],p:46.5,t:"Nearly half! This small, rich city-state draws workers and their families from Malaysia, China, India and beyond."},
 {n:"United Kingdom",ll:[-2,53.5],p:17.1,t:"About 17 in 100, from India, Poland, Pakistan, Romania, Ireland and many other places."}];
const mig={id:"mig",tour:"migration",title:"One in thirty",
 instr:"🧳 Out of 100 people living there, how many were born abroad? Drag the slider to guess, then check. Click a ring on the map to pick a country.",
 init(L){const s=L.st;s.i=0;s.g=10;s.res={};s.touched=false;
  s.r=MIG.map((m,i)=>{const gg=el("g",{class:"gc3-handle gc3-ring",tabindex:"0","aria-label":m.n},L.svg);el("circle",{r:17,class:"gc3-rbg"},gg);const a=el("path",{class:"gc3-rarc"},gg);
   const t=el("text",{"text-anchor":"middle",y:4.5,class:"gc3-rtx"},gg);clickable(gg,()=>{s.i=i;s.g=s.res[i]?s.res[i].g:10;s.touched=false;flash(".gc3-out")});return{gg,a,t,lab:pill("gc3-chip")}})},
 tick(L,dt){const s=L.st;if(s.st0==null)s.st0=0;s.st0+=dt;/* bring the chosen country into view */let ch=false;if(s.st0>.8&&!L.userTurned){const m=MIG[s.i];if(s.aimed!==s.i){if(nudgeTo(m.ll[0],m.ll[1],.12,1))ch=true;else s.aimed=s.i}}return ch},
 draw(L){const s=L.st;
  MIG.forEach((m,i)=>{const o=s.r[i],q=proj(m.ll),R=s.res[i];place(o.gg,q);o.gg.classList.toggle("gc3-picked",i===s.i);
   o.a.setAttribute("d",R?ringD(13,m.p/100):"");const tx=R?(m.p<1?"<1":String(Math.round(m.p))):"?";if(o.t.textContent!==tx)o.t.textContent=tx;
   putPill(o.lab,q,esc(m.n),0,-20,"")})},
 html(){return'<div class="gc3-row"><b class="gc3-mign"></b><span class="gc3-big gc3-migv"></span></div><input type="range" class="gc3-range gc3-mgs" min="0" max="100" value="10" aria-label="Your guess, out of 100">'+
  '<div class="gc3-grid"></div><div class="gc3-row gc3-mbtn"><button type="button" class="gc3-go gc3-chk">Check</button><button type="button" class="gc3-go gc3-next" hidden>Next place ›</button></div>'+
  '<div class="gc3-out"></div><div class="gc3-keys"><span><i style="background:#f59f00"></i>your guess</span><span><i style="background:#7048e8"></i>really born abroad</span></div>'+
  '<div class="gc3-note">Born in another country, 2024: UN DESA, International Migrant Stock 2024. The world average is 3.7%: about one in thirty.</div>'},
 wire(L,c){const s=L.st;let h="";for(let k=0;k<100;k++)h+="<i></i>";c.querySelector(".gc3-grid").innerHTML=h;
  const r=c.querySelector(".gc3-mgs");r.addEventListener("input",()=>{if(s.res[s.i])return;s.g=+r.value;s.touched=true;L.dirty=true});
  c.querySelector(".gc3-chk").onclick=()=>{if(s.res[s.i])return;s.res[s.i]={g:s.g};flash(".gc3-out");L.dirty=true};
  c.querySelector(".gc3-next").onclick=()=>{L.userTurned=false;let j=-1;for(let k=1;k<=MIG.length;k++){const x=(s.i+k)%MIG.length;if(!s.res[x]){j=x;break}}if(j<0){s.res={};j=0}s.i=j;s.g=10;s.touched=false;L.dirty=true}},
 card(L){const s=L.st,m=MIG[s.i],R=s.res[s.i];setTxt(".gc3-mign",m.n);setTxt(".gc3-migv",R?(m.p<1?"under 1":Math.round(m.p))+" in 100":s.g+" in 100");
  const r=q$(".gc3-mgs");if(r){r.disabled=!!R;if(document.activeElement!==r)r.value=R?R.g:s.g}
  const real=R?Math.round(m.p):-1,gv=R?R.g:s.g,cells=L.c.querySelectorAll(".gc3-grid i");
  cells.forEach((c,k)=>{const cls=(R&&k<real?"r ":"")+(k<gv?"g":"");if(c.className!==cls)c.className=cls});
  const ck=q$(".gc3-chk"),nx=q$(".gc3-next");if(ck)ck.hidden=!!R;const done=Object.keys(s.res).length;if(nx){nx.hidden=!R;nx.textContent=done>=MIG.length?"↺ Play again":"Next place ›"}
  let o;if(!R)o=s.i===0&&!done?"Worldwide, about <b>1 person in 30</b> lives outside the country they were born in. What about <b>"+esc(m.n)+"</b>? Drag the slider: each dot is one person.":"Your guess for <b>"+esc(m.n)+"</b>: "+s.g+" in 100.";
  else{const off=Math.abs(R.g-m.p);o='<b class="'+(off<=5?"gc3-ok":"gc3-no")+'">'+(off<=2?"✓ Spot on!":off<=5?"✓ Close!":"You guessed "+R.g+": off by "+Math.round(off)+".")+"</b> "+esc(m.t);
   if(done>=MIG.length){const sc=MIG.filter((x,i)=>Math.abs(s.res[i].g-x.p)<=5).length;o+='<div class="gc3-sum">Within 5 on <b>'+sc+" of "+MIG.length+"</b>. Rich places that need workers have many people from abroad; big, crowded countries like China and India very few.</div>"}}
  setHTML(".gc3-out",o)}};
MODS.push(mig);


/* ================================================================ 6. The euro: watch it spread
   Who joined and when (each on 1 January): Wikipedia, "Eurozone" (from the European Central Bank's list): the eleven of
   1999; Greece 2001; Slovenia 2007; Cyprus and Malta 2008; Slovakia 2009; Estonia 2011; Latvia 2014; Lithuania 2015;
   Croatia 2023; Bulgaria 2026. The six EU members that keep their own money: Czechia, Denmark (a legal opt-out),
   Hungary, Poland, Romania, Sweden. Notes and coins arrived on 1 January 2002 (the stop's own text), when Montenegro and
   Kosovo switched to the euro on their own; Andorra, Monaco, San Marino and Vatican City use it by agreement (drawn here
   from 2002, when the cash came, without claiming the date of each agreement). Coins sit on each capital. */
const EU=[
 ["Austria",[16.37,48.21],1999],["Belgium",[4.35,50.85],1999],["Finland",[24.94,60.17],1999],["France",[2.35,48.86],1999],["Germany",[13.4,52.52],1999],
 ["Ireland",[-6.26,53.35],1999],["Italy",[12.5,41.9],1999],["Luxembourg",[6.13,49.61],1999],["Netherlands",[4.9,52.37],1999],["Portugal",[-9.14,38.72],1999],
 ["Spain",[-3.7,40.42],1999],["Greece",[23.73,37.98],2001],["Slovenia",[14.51,46.06],2007],["Cyprus",[33.38,35.17],2008],["Malta",[14.51,35.9],2008],
 ["Slovakia",[17.11,48.15],2009],["Estonia",[24.75,59.44],2011],["Latvia",[24.11,56.95],2014],["Lithuania",[25.28,54.69],2015],["Croatia",[15.98,45.81],2023],
 ["Bulgaria",[23.32,42.7],2026]].map(a=>({n:a[0],ll:a[1],y:a[2],k:"eu"}));
const EU_OUT=[["Czechia",[14.42,50.08],"koruna"],["Denmark",[12.57,55.68],"krone"],["Hungary",[19.04,47.5],"forint"],["Poland",[21.01,52.23],"złoty"],["Romania",[26.1,44.43],"leu"],["Sweden",[18.07,59.33],"krona"]]
 .map(a=>({n:a[0],ll:a[1],cur:a[2],k:"out"}));
const EU_EXT=[["Montenegro",[19.26,42.44],"on its own"],["Kosovo",[21.17,42.66],"on its own"],["Andorra",[1.52,42.51],"by agreement"],["Monaco",[7.42,43.74],"by agreement"],
 ["San Marino",[12.45,43.94],"by agreement"],["Vatican City",[12.45,41.9],"by agreement"]].map(a=>({n:a[0],ll:a[1],y:2002,how:a[2],k:"ext"}));
const EU_ALL=EU.concat(EU_EXT,EU_OUT);
const EU_EV=[{y:1999,t:"Eleven countries lock their old money together and the euro is born, at first only in banks and on screens."},
 {y:2001,t:"Greece joins, the twelfth member."},
 {y:2002,t:"Notes and coins arrive on 1 January: francs, marks, lire, pesetas and drachmas are gone. Montenegro and Kosovo, which had used the German mark, switch to the euro on their own."},
 {y:2007,t:"Slovenia is the first of the countries that joined the EU in 2004 to take the euro."},{y:2008,t:"Cyprus and Malta join."},{y:2009,t:"Slovakia joins."},
 {y:2011,t:"Estonia joins, the first country that was once part of the Soviet Union."},{y:2014,t:"Latvia joins."},{y:2015,t:"Lithuania joins: all three Baltic states now use the euro."},
 {y:2023,t:"Croatia joins, eight years after anyone else."},{y:2026,t:"Bulgaria becomes the 21st member on 1 January 2026. Six EU countries still keep their own money."}];
const EU_Y0=1998,EU_Y1=2026;
const euro={id:"euro",tour:"currencies",title:"The euro",
 instr:"💶 First a guess: how many countries started the euro in 1999? Then slide (or Play) to 2026 and watch it spread.",
 init(L){const s=L.st;s.Y=EU_Y0;s.play=false;s.guess=null;s.last=-1;
  s.c=EU_ALL.map(c=>{const gg=el("g",{class:"gc3-coin gc3-"+c.k},L.svg);el("circle",{class:"gc3-cglow",r:15},gg);el("circle",{class:"gc3-cbody",r:c.k==="ext"?6.5:8.5},gg);
   const t=el("text",{"text-anchor":"middle",y:c.k==="ext"?3:3.6,class:"gc3-ctx"},gg);t.textContent=c.k==="out"?"":"€";return{gg,lab:pill("gc3-chip"+(c.k==="out"?" gc3-row1":""))}})},
 tick(L,dt){const s=L.st;let ch=aimOnce(s,dt,14,49,2.1);if(s.play){s.Y=Math.min(EU_Y1+.99,s.Y+dt*1.6);if(s.Y>=EU_Y1+.99){s.play=false;playBtn(false)}ch=true}return ch},
 draw(L){const s=L.st,y=Math.floor(s.Y),on=s.guess!=null;
  EU_ALL.forEach((c,i)=>{const o=s.c[i],lit=c.k==="out"||(on&&c.y<=y),q=lit?proj(c.ll):null,fresh=c.k!=="out"&&lit&&y===c.y;place(o.gg,q);o.gg.classList.toggle("gc3-fresh",fresh);
   const lab=c.k==="out"?esc(c.n)+" <small>"+esc(c.cur)+"</small>":fresh?"<b>"+esc(c.n)+"</b> <small>"+c.y+"</small>":"";
   putPill(o.lab,lab?q:null,lab,0,c.k==="out"?-10:-12,"")})},
 html(){return'<div class="gc3-seg gc3-eug"><button type="button" data-g="6">6</button><button type="button" data-g="11">11</button><button type="button" data-g="21">21</button></div>'+
  '<div class="gc3-reveal" hidden>'+playRow("Year","1998")+'</div><div class="gc3-astat"></div><div class="gc3-ev"><b></b><span></span></div>'+
  '<div class="gc3-keys"><span><i style="background:#f2c94c"></i>euro member</span><span><i style="background:#fff;box-shadow:0 0 0 2px #f2c94c inset"></i>uses it, not in the EU</span><span><i style="background:#adb5bd"></i>EU, own money</span></div>'+
  '<div class="gc3-note">Years each country joined: the European Central Bank’s list (Wikipedia, “Eurozone”). Coins sit on capitals.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gc3-eug button").forEach(b=>b.onclick=()=>{if(s.guess!=null)return;s.guess=+b.dataset.g;b.classList.add("on");c.querySelector(".gc3-reveal").hidden=false;
   c.querySelectorAll(".gc3-eug button").forEach(x=>{x.disabled=true;if(x.dataset.g==="11")x.classList.add("gc3-right")});s.Y=1999;s.play=true;lastT=0;playBtn(true);L.dirty=true});
  c.querySelector(".gc3-play").onclick=()=>{if(s.Y>=EU_Y1)s.Y=EU_Y0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gc3-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.Y=EU_Y0+r.value/1000*(EU_Y1+.99-EU_Y0);L.dirty=true})},
 card(L){const s=L.st,y=Math.floor(s.Y);range(".gc3-u",(s.Y-EU_Y0)/(EU_Y1+.99-EU_Y0));setTxt(".gc3-val",String(y));
  if(s.guess==null){setHTML(".gc3-astat","Before 1999 every country had its own money: francs, marks, lire, pesetas… How many countries swapped theirs for the euro <b>at the start</b>?");setTxt(".gc3-ev b","");setTxt(".gc3-ev span","");return}
  const n=EU.filter(c=>c.y<=y).length,ok=s.guess===11;
  setHTML(".gc3-astat",'<b class="'+(ok?"gc3-ok":"gc3-no")+'">'+(ok?"✓ Right: 11.":"✗ It was 11.")+"</b> In <b>"+y+"</b>: <b>"+n+" of 27</b> EU countries use the euro.");
  let k=-1;EU_EV.forEach((e,i)=>{if(e.y<=y)k=i});if(k!==s.last){s.last=k;const E=EU_EV[k];setTxt(".gc3-ev b",E?E.y+"":"1998");setTxt(".gc3-ev span",E?E.t:"No euro yet: each country has its own money.");flash(".gc3-ev")}}};
MODS.push(euro);

/* ---- watch the tour: mount on the right stop, clean up as soon as it changes ---- */
setInterval(()=>{try{const m=stopNow();if(m){if(MOD!==m||!L||!L.el.isConnected||L.host!==(g()&&g().host))mount(m);ensureCard()}else if(MOD)unmount()}catch(e){try{unmount()}catch(_){}}},300);
addEventListener("resize",()=>{if(L)L.dirty=true});

{const s=document.createElement("style");s.textContent=`
.gc3-layer{position:absolute;inset:0;pointer-events:none;z-index:6}/* under the tour card (z 7), over the globe */
.gc3-svg{position:absolute;left:0;top:0;overflow:visible}
.gc3-handle{pointer-events:all;cursor:pointer;touch-action:none;outline:none}
.gc3-hit{fill:rgba(255,255,255,.001);stroke:none}
.gc3-handle:focus-visible{filter:drop-shadow(0 0 4px #fff)}
.gc3-pill{position:absolute;white-space:nowrap;pointer-events:none;font:700 13px/1.25 system-ui,sans-serif;color:#13294b;background:rgba(255,255,255,.95);padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.28)}
.gc3-pill small{font-weight:600;opacity:.75}
.gc3-hot{pointer-events:all;cursor:pointer}
.gc3-big-pill{background:#13294b;color:#fff;font-size:14px;font-weight:800;padding:5px 12px}.gc3-big-pill small{color:#ffd8a8;opacity:1}
.gc3-chip{display:flex;flex-direction:column;align-items:center;padding:3px 9px;border-radius:10px;font-size:12px}.gc3-chip b{font-size:12.5px}.gc3-chip span{font-weight:800;font-size:12.5px;color:#9a4a16}
.gc3-dim{opacity:.8;font-weight:600;flex-direction:row;gap:4px}
.gc3-zone{color:#fff;font-size:14.5px;font-weight:800;padding:8px 15px;border:2px solid #fff;animation:gc3Bob 1.6s ease-in-out infinite}
.gc3-zone:hover,.gc3-zone:focus-visible{filter:brightness(1.15);outline:none}
.gc3-zland{background:#d9480f}.gc3-zsea{background:#1971c2}
@keyframes gc3Bob{50%{margin-top:-4px}}
.gc3-arc-halo{fill:none;stroke:rgba(255,255,255,.85);stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.gc3-arc{fill:none;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}.gc3-arc.gc3-land{stroke:#d9480f}.gc3-arc.gc3-sea{stroke:#1971c2}.gc3-arc.gc3-paper{stroke:#a86b1d;stroke-width:3}
.gc3-teadot{stroke:#fff;stroke-width:2}.gc3-teadot.gc3-land{fill:#d9480f}.gc3-teadot.gc3-sea{fill:#1971c2}.gc3-teadot.gc3-bad{stroke:#13294b;stroke-dasharray:3 2}
.gc3-cup circle{fill:#fff;stroke:#2b8a3e;stroke-width:2.5;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}.gc3-cup text{font-size:15px}
.gc3-qring{fill:rgba(255,212,59,.35);stroke:#f59f00;stroke-width:3;animation:gc3Pulse 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes gc3Pulse{50%{transform:scale(1.35);opacity:.55}}
.gc3-tower rect:first-child{fill:#8d99ae;stroke:#2b2d42;stroke-width:1}.gc3-tower.gc3-rec rect:first-child{fill:#adb5bd}
.gc3-tower.gc3-top rect:first-child{fill:#f59f00;stroke:#7a4a00}.gc3-tower:hover rect:first-child,.gc3-tower.gc3-picked rect:first-child{stroke:#e8590c;stroke-width:2.2}
.gc3-tower{filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))}
.gc3-eiffel rect{fill:none;stroke:#fff;stroke-width:1.6;stroke-dasharray:3 3}
.gc3-crown{font-size:20px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}
.gc3-drum{fill:#343a40;stroke:#fff;stroke-width:1.5}.gc3-drumline{stroke:#adb5bd;stroke-width:1.2}
.gc3-obar{fill:rgba(52,58,64,.82);stroke:#fff;stroke-width:1}.gc3-best .gc3-obar{fill:#e8590c}
.gc3-barrel:hover .gc3-drum,.gc3-barrel.gc3-picked .gc3-drum{stroke:#f59f00;stroke-width:3}
.gc3-pt circle{fill:#a86b1d;stroke:#fff;stroke-width:2}.gc3-pt .gc3-glow{fill:rgba(245,159,0,.3);stroke:none;opacity:0}.gc3-pt.gc3-fresh .gc3-glow{opacity:1;animation:gc3Pulse 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.gc3-emo{font-size:22px;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))}
.gc3-rbg{fill:#fff;stroke:#13294b;stroke-width:2;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}.gc3-rarc{fill:none;stroke:#7048e8;stroke-width:6}
.gc3-rtx{font:800 12px system-ui,sans-serif;fill:#13294b;pointer-events:none}
.gc3-ring.gc3-picked .gc3-rbg{stroke:#f59f00;stroke-width:4}.gc3-ring:hover .gc3-rbg{stroke:#f59f00}
.gc3-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12);font-size:13.5px;line-height:1.4}
.gc3-do{font-weight:800;font-size:14px;color:#9a4a16;margin-bottom:8px}
.gc3-row{display:flex;align-items:center;gap:10px}.gc3-row.gc3-small{margin-top:8px;font-size:12.5px;justify-content:space-between;font-weight:700}
.gc3-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gc3-range{flex:1 1 auto;min-width:0;accent-color:#d9682b;cursor:pointer}.gc3-mgs{width:100%;margin:6px 0 2px;accent-color:#f59f00}
.gc3-big{flex:0 0 auto;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap;min-width:58px;text-align:right}
.gc3-mign{flex:1 1 auto;font-size:15px}
.gc3-astat{margin-top:8px;font-size:13.5px}
.gc3-out{margin-top:8px;font-size:14px;line-height:1.4}
.gc3-ok{color:#2b8a3e}.gc3-no{color:#c92a2a}
.gc3-sum{margin-top:6px;padding:6px 9px;border-radius:8px;background:rgba(43,138,62,.1)}
.gc3-note{margin-top:6px;font-size:11.5px;opacity:.68;line-height:1.35}
.gc3-small2{font-style:normal;font-size:12px;opacity:.75;display:block;margin-top:4px}
.gc3-seg{display:flex;gap:6px;flex-wrap:wrap}.gc3-seg[hidden]{display:none}.gc3-seg button{flex:1 1 0;min-width:0;border:1px solid rgba(19,41,75,.25);background:#fff;color:#13294b;border-radius:999px;padding:7px 10px;font:700 12.5px system-ui,sans-serif;cursor:pointer}
.gc3-seg button.on{background:#e8590c;border-color:#e8590c;color:#fff}.gc3-seg button.gc3-right{box-shadow:0 0 0 2px #2b8a3e inset}.gc3-seg button:disabled{cursor:default}
.gc3-out+.gc3-seg{margin-top:8px}.gc3-reveal{margin-top:8px}.gc3-reveal[hidden],.gc3-go[hidden]{display:none}
.gc3-go{flex:1 1 0;border:0;border-radius:999px;background:#7048e8;color:#fff;font:800 14px system-ui,sans-serif;padding:8px 12px;cursor:pointer}
.gc3-mbtn{margin-top:8px}
.gc3-keys{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12.5px;font-weight:700}.gc3-keys i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
.gc3-ranks{margin-top:8px;display:grid;gap:4px}.gc3-ranks div{display:grid;grid-template-columns:112px 1fr 52px;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
.gc3-ranks i{height:9px;border-radius:5px;background:rgba(19,41,75,.12);overflow:hidden}.gc3-ranks i b{display:block;height:100%;background:#e8590c;border-radius:5px}.gc3-ranks em{font-style:normal;text-align:right}
.gc3-ranks .gc3-unit{display:block;text-align:right;font-size:11.5px;opacity:.7;font-weight:600}
.gc3-ev{margin-top:8px;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.7);border-left:4px solid #a86b1d}.gc3-ev:empty{display:none}.gc3-ev b{display:block;font-size:13.5px}.gc3-ev span{font-size:13px}
.gc3-crownbox{margin-top:8px;padding:7px 10px;border-radius:9px;background:rgba(245,159,0,.12);border-left:4px solid #f59f00}.gc3-crownbox b{display:block;font-size:14px}.gc3-crownbox span{font-size:12.5px}
.gc3-skyline{margin-top:8px;height:64px;display:flex;align-items:flex-end;gap:2px;border-bottom:2px solid rgba(19,41,75,.35)}
.gc3-skyline i{flex:1 1 0;max-width:16px;background:#adb5bd;border-radius:2px 2px 0 0}.gc3-skyline i.on{background:#f59f00}
.gc3-grid{display:grid;grid-template-columns:repeat(20,1fr);gap:2px;margin-top:8px}.gc3-grid i{aspect-ratio:1;border-radius:50%;background:rgba(19,41,75,.15)}
.gc3-grid i.g{box-shadow:0 0 0 2px #f59f00 inset;background:rgba(245,159,0,.3)}.gc3-grid i.r{background:#7048e8}
.gc3-flash{animation:gc3Flash .6s ease}@keyframes gc3Flash{0%{background:#fff3bf}100%{}}
body.dark-theme .gc3-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}body.dark-theme .gc3-do,body.dark-theme .gc3-big{color:#ffb27a}
body.dark-theme .gc3-ok{color:#69db7c}body.dark-theme .gc3-no{color:#ff8787}

.gc3-coin .gc3-cbody{fill:#f2c94c;stroke:#8a6d00;stroke-width:1.5;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}.gc3-coin.gc3-ext .gc3-cbody{fill:#fff;stroke:#c99a06;stroke-width:2}
.gc3-coin.gc3-out .gc3-cbody{fill:#adb5bd;stroke:#495057}.gc3-ctx{font:900 10px system-ui,sans-serif;fill:#5c4300;pointer-events:none}.gc3-ext .gc3-ctx{font-size:8px}
.gc3-coin .gc3-cglow{fill:rgba(242,201,76,.45);stroke:none;opacity:0}.gc3-coin.gc3-fresh .gc3-cglow{opacity:1;animation:gc3Pulse 1.1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.gc3-row1{flex-direction:row;gap:4px;padding:2px 8px;font-size:11.5px;opacity:.9}
`;document.head.appendChild(s)}
window.gfInteractCulture3={mods:MODS,state:()=>L&&L.st,redraw:()=>{if(L)L.dirty=true}};
})();
