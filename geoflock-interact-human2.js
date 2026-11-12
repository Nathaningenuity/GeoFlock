/* GeoFlock: six more human-geography, history and book tour stops you can play with, not just read. Each one puts things
   on the globe that you drag or click, plus a small control block on the card (right after the stop's headline).
   - AP Human Geography 5a, "The Columbian Exchange": twelve crops, animals and one germ arrive one by one in the middle
     of the Atlantic. Drag each to the side it came from (or use the two buttons). Right or wrong, it then flies to its real
     homeland and across the ocean to where it became famous: maize to Africa, potatoes to Ireland, horses to the Plains.
   - Cities tour, "The biggest cities": where does a city end? Guess which of the seven biggest cities was biggest under
     the UN's older count, then watch the bubbles shrink and swap places as the count switches between 2025 and 2018.
   - Religions tour, "Christianity moved south": drag a cross from Madrid to where you think the centre of all the world's
     Christians was in 2010, check your guess, then play 1910 to 2010 and watch the regions swell and shrink.
   - Medieval empires tour, "The Arab conquests and Baghdad": first guess how long the armies took to get from Arabia to Spain, then slide (or
     Play) from 622 to 762 and watch the conquests spread from Medina, with where they were stopped, up to the founding of Baghdad.
   - The Silk Roads, "Silk and heavenly horses": pass a bale of silk from Chang'an to Rome. Drag it (or Play); it changes
     hands at each frontier, Chinese, oasis, Sogdian, Parthian, Palmyrene and Roman, and the card counts the hands.
   - Journey to the West, "Alone across the Gobi": walk Xuanzang and his old red horse past the five beacon towers. Watch
     the water bag; when it spills, choose whether to turn back; then count the days without water until the horse finds
     the pool.
   Same pattern as geoflock-interact-human.js and geoflock-odyssey.js: a layer in amGlobe.host placed with
   amGlobe.projection(), redrawn when the view changes, and removed (map layer, card block, timers) as soon as the stop
   changes or the tour ends. Only on the globe view. Nothing here blocks Next/Back, and every step is wrapped in try/catch.
   Stops already made interactive in geoflock-odyssey.js and geoflock-interact-{hist,human,life,phys}.js are not touched. */
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
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{node.setPointerCapture(e.pointerId)}catch(_){}node.classList.add("gh2-dragging");if(L)L.userTurned=true;try{o.start&&o.start(e)}catch(_){}
  const mv=ev=>{ev.stopPropagation();try{o.move(ev);if(L)L.dirty=true}catch(err){}};
  const up=ev=>{node.removeEventListener("pointermove",mv);node.removeEventListener("pointerup",up);node.removeEventListener("pointercancel",up);node.classList.remove("gh2-dragging");try{o.end&&o.end(ev)}catch(_){}if(L)L.dirty=true};
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
function pill(cls){const d=document.createElement("div");d.className="gh2-pill "+(cls||"");L.el.appendChild(d);return d}
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
/* hide a stop's own pins or lines on the globe while this layer draws them itself */
function hideOwn(tour,title,keepLine,keepPin){let n=0;const t0=setInterval(()=>{try{const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[tour],s=T&&T.steps&&T.steps.find(x=>clean(x.title)===title);
 if(s&&!s._gh2){s._gh2=1;let lines=s.lines,pins=s.pins;const on=()=>{try{return ps&&ps.tour===tour&&ps.mode==="globe"}catch(e){return false}};
  if(keepLine)Object.defineProperty(s,"lines",{configurable:true,enumerable:true,get(){return on()&&Array.isArray(lines)?lines.filter(keepLine):lines},set(v){lines=v}});
  if(keepPin)Object.defineProperty(s,"pins",{configurable:true,enumerable:true,get(){return on()&&Array.isArray(pins)?pins.filter(keepPin):pins},set(v){pins=v}})}
 if(s||++n>120)clearInterval(t0)}catch(e){clearInterval(t0)}},500)}

function mount(m){const G=g();if(!G||!G.host||!G.canvas)return;unmount();
 const host=G.host,div=document.createElement("div");div.className="gh2-layer";div.innerHTML='<svg class="gh2-svg"></svg>';host.appendChild(div);
 L={m,host,el:div,svg:div.querySelector("svg"),ox:0,oy:0,dirty:true,key:"",st:{}};MOD=m;
 const cv=G.canvas,onCv=()=>{if(L)L.userTurned=true};try{cv.addEventListener("pointerdown",onCv,true);cv.addEventListener("wheel",onCv,{capture:true,passive:true})}catch(e){}
 L.offCv=()=>{try{cv.removeEventListener("pointerdown",onCv,true);cv.removeEventListener("wheel",onCv,{capture:true})}catch(e){}};document.body.classList.add("gh2-on","gh2-"+m.id);
 try{m.init(L)}catch(e){console.error("interact-human2",m.id,e)}
 lastT=0;loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(MOD){try{MOD.cleanup&&MOD.cleanup(L)}catch(e){}document.body.classList.remove("gh2-on","gh2-"+MOD.id)}
 if(L&&L.offCv)L.offCv();if(L&&L.el)L.el.remove();L=null;MOD=null;document.querySelectorAll(".gh2-ctl").forEach(c=>c.remove())}
function draw(){if(!L)return;const G=g();if(!G||!G.canvas)return;const hr=L.host.getBoundingClientRect(),cr=G.canvas.getBoundingClientRect();L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
 L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);
 let k="";try{const p=G.projection();k=p.rotate().map(v=>v.toFixed(3)).join(",")+"|"+p.scale().toFixed(2)+"|"+p.translate().map(v=>v.toFixed(1)).join(",")+"|"+hr.width+"x"+hr.height+"|"+L.ox+","+L.oy+"|"+(G._flat?1:0)}catch(e){k=String(Date.now())}
 if(k===L.key&&!L.dirty)return;L.key=k;L.dirty=false;try{L.m.draw(L)}catch(e){console.error("interact-human2 draw",e)}try{L.c&&L.c.isConnected&&L.m.card&&L.m.card(L)}catch(e){}}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const dt=lastT?Math.min(.1,(t-lastT)/1000):0;lastT=t;if(L.m.tick&&L.m.tick(L,dt))L.dirty=true;draw()}catch(e){console.error("interact-human2",e)}loop()})}
function ensureCard(){try{if(!L||typeof ps==="undefined"||!ps||!ps.card)return;if(ps.card.querySelector(".gh2-ctl"))return;const at=ps.card.querySelector(".ps-stat");if(!at)return;
 const c=document.createElement("div");c.className="gh2-ctl gh2-c-"+L.m.id;c.innerHTML='<div class="gh2-do">'+L.m.instr+'</div>'+L.m.html();at.after(c);
 ["pointerdown","mousedown","touchstart","wheel"].forEach(t=>c.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 c.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight")e.stopPropagation()});/* arrow keys move the slider, not the tour */
 L.c=c;try{L.m.wire(L,c)}catch(e){console.error("interact-human2 wire",e)}L.dirty=true}catch(e){console.error("interact-human2 card",e)}}
const q$=sel=>L&&L.c?L.c.querySelector(sel):null;
function setTxt(sel,t){const n=q$(sel);if(n&&n.textContent!==t)n.textContent=t}
function setHTML(sel,h){const n=q$(sel);if(n&&n._h!==h){n.innerHTML=h;n._h=h}}
function playBtn(on){const b=q$(".gh2-play");if(b){b.textContent=on?"❚❚":"▶";b.setAttribute("aria-label",on?"Pause":"Play")}}
function range(sel,v,max){const r=q$(sel);if(r&&document.activeElement!==r)r.value=Math.round(v*(max||1000))}
function flash(sel){const n=q$(sel);if(!n)return;n.classList.remove("gh2-flash");void n.offsetWidth;n.classList.add("gh2-flash")}
const playRow=(lab,val)=>'<div class="gh2-row"><button type="button" class="gh2-play" aria-label="Play">▶</button><input type="range" class="gh2-range gh2-u" min="0" max="1000" value="0" aria-label="'+lab+'"><span class="gh2-big gh2-val">'+val+'</span></div>';

/* ================================================================ 1. The Columbian Exchange: sort it across the Atlantic
   Which way each went: N. Nunn and N. Qian, "The Columbian Exchange: A History of Disease, Food, and Ideas", Journal of
   Economic Perspectives 24:2 (2010), Table 1; A. W. Crosby, "The Columbian Exchange" (1972).
   Where each was first tamed: maize from teosinte in the Balsas valley of south-west Mexico about 9,000 years ago
   (Matsuoka et al., PNAS 2002; Piperno et al., PNAS 2009); potato in the Andes of southern Peru near Lake Titicaca
   (Spooner et al., PNAS 2005); chilli in east-central Mexico (Kraft et al., PNAS 2014); cacao in the upper Amazon of
   south-east Ecuador, about 5,300 years ago (Zarrillo et al., Nature Ecology & Evolution 2018); cassava in the south-west
   Amazon of Brazil (Olsen and Schaal, PNAS 1999); einkorn wheat near Karacadağ, south-east Turkey (Heun et al., Science
   1997); sugar cane in New Guinea; coffee in the highland forests of south-west Ethiopia; the modern horse on the
   lower Volga–Don steppe about 4,200 years ago (Librado et al., Nature 2021); cattle from aurochs in the northern
   Fertile Crescent about 10,500 years ago (Bollongino et al., Mol. Biol. Evol. 2012). Smallpox reached Hispaniola in
   1518 and Mexico in 1520 (Crosby 1972). Biggest growers today (Nigeria for cassava, Brazil for sugar cane and coffee,
   Côte d'Ivoire for cacao): FAOSTAT. Tomatoes were first grown as a crop in Mexico, from wild plants of the Andes.
   Hearth coordinates are approximate centres of those areas. */
const CX=[
 {n:"Maize",e:"🌽",from:"am",h:[-100.5,18.3],hn:"south-west Mexico",to:[34,-13.5],tn:"Malawi",
  t:"Maize was bred from a wild grass, teosinte, in south-west Mexico about 9,000 years ago. Portuguese ships took it to Africa, where it is now the main food across much of the east and south."},
 {n:"Wheat",e:"🌾",from:"ow",h:[39.8,37.6],hn:"south-east Turkey",to:[-98.5,38.5],tn:"Kansas",
  t:"Wheat was first farmed in the Fertile Crescent. The Spanish brought it to the Americas, and the Great Plains of the US and Canada became one of the world’s breadbaskets."},
 {n:"Potato",e:"🥔",from:"am",h:[-69.5,-15.5],hn:"the Andes, by Lake Titicaca",to:[-8,53.2],tn:"Ireland",
  t:"Potatoes were first farmed high in the Andes, near Lake Titicaca. In Ireland they became the main food of the poor, until blight struck in the 1840s and a million people died."},
 {n:"Horse",e:"🐎",from:"ow",h:[44,49],hn:"the Volga–Don steppe",to:[-101,42],tn:"the Great Plains",
  t:"Horses had died out in the Americas at the end of the last ice age. Today’s horses were tamed on the steppe north of the Caspian; the Spanish brought them back, and peoples like the Lakota and Comanche became horse riders of the Plains."},
 {n:"Tomato",e:"🍅",from:"am",h:[-96.7,17.1],hn:"Mexico",to:[14.25,40.85],tn:"Naples",
  t:"Wild tomatoes grow in the Andes, and people in Mexico made them a crop. Italy had none before the 1500s; now it is hard to imagine its cooking without them."},
 {n:"Sugar cane",e:"🎋",from:"ow",h:[145,-6],hn:"New Guinea",to:[-35,-8],tn:"north-east Brazil",
  t:"Sugar cane was first grown in New Guinea and reached the Mediterranean through India and the Arab world. Columbus took cane to Hispaniola in 1493. Plantations worked by enslaved Africans followed; Brazil now grows the most."},
 {n:"Cacao",e:"🍫",from:"am",h:[-79,-4.9],hn:"the upper Amazon, Ecuador",to:[-5.5,7.5],tn:"Côte d’Ivoire",
  t:"Chocolate’s cacao tree comes from the upper Amazon: traces 5,300 years old were found in Ecuador. Today most cacao grows in West Africa, and Côte d’Ivoire grows the most."},
 {n:"Coffee",e:"☕",from:"ow",h:[36.8,7.7],hn:"the forests of Ethiopia",to:[-46,-21],tn:"Brazil",
  t:"Coffee comes from the highland forests of Ethiopia and was first drunk in Yemen. It reached the Americas in the 1700s; Brazil now grows more than any other country."},
 {n:"Chilli",e:"🌶️",from:"am",h:[-97.5,19.5],hn:"east-central Mexico",to:[100.5,13.75],tn:"Thailand",
  t:"Chillies were tamed in Mexico. Portuguese ships carried them to India and South-East Asia in the 1500s: Thai and Indian cooking had no chillies before then."},
 {n:"Cattle",e:"🐄",from:"ow",h:[38.5,37],hn:"the Fertile Crescent",to:[-61,-35],tn:"the Argentine pampas",
  t:"Cattle were tamed from wild aurochs in the Fertile Crescent about 10,500 years ago. In the Americas they spread over the grasslands, and the pampas of Argentina became cattle country."},
 {n:"Cassava",e:"🍠",from:"am",h:[-63,-10.5],hn:"the south-west Amazon, Brazil",to:[7.5,8],tn:"Nigeria",
  t:"Cassava (manioc) was first grown in the south-west Amazon. Portuguese traders brought it to Africa, and Nigeria now grows more than any other country."},
 {n:"Smallpox",e:"🦠",from:"ow",h:[-5.99,37.39],hn:"ships from Europe",to:[-99.13,19.43],tn:"Tenochtitlan",
  t:"The worst passenger was a germ. Smallpox, new to the Americas, reached Hispaniola in 1518 and Mexico in 1520, where it killed huge numbers in Tenochtitlan months before Cortés’s final siege. Measles and flu followed."}];
const CX_DOCK=[-30,21];
const colex={id:"colex",tour:"hg5a",title:"The Columbian Exchange",
 instr:"🌽 Where did it come from? Drag each one to its side of the Atlantic.",
 init(L){const s=L.st;s.i=0;s.res=[];s.fly=null;s.last=null;s.pos=null;
  s.arcG=el("g",{},L.svg);s.arcs=CX.map(it=>({h:el("path",{class:"gh2-arc-halo"},s.arcG),p:el("path",{class:"gh2-arc gh2-"+it.from},s.arcG),R:densify([it.h,it.to],80)}));
  s.dots=CX.map(it=>{const gg=el("g",{class:"gh2-cxdone"},L.svg);el("circle",{r:13,class:"gh2-cxbg gh2-"+it.from},gg);const t=el("text",{"text-anchor":"middle",y:5,class:"gh2-emo-s"},gg);t.textContent=it.e;
   const hd=el("circle",{r:4,class:"gh2-hearth gh2-"+it.from},L.svg);return{gg,hd,lab:pill("gh2-chip")}});
  s.tok=el("g",{class:"gh2-handle gh2-tok",tabindex:"0","aria-label":"Drag to the side of the Atlantic it came from"},L.svg);el("circle",{r:30,class:"gh2-tokbg"},s.tok);s.tokT=el("text",{"text-anchor":"middle",y:10,class:"gh2-emo"},s.tok);
  s.lab=pill("gh2-big-pill");s.zA=pill("gh2-zone");s.zB=pill("gh2-zone");s.hint=pill("gh2-hint");
  draggable(s.tok,{start:()=>{s.moved=true},move:ev=>{const ll=toLL(ev.clientX,ev.clientY);if(ll)s.pos=ll},end:()=>{const ll=s.pos;s.pos=null;if(!ll)return;const side=ll[0]<-34?"am":ll[0]>-26?"ow":null;if(side)colex.answer(L,side,ll)}})},
 answer(L,side,ll){const s=L.st;if(s.fly||s.i>=CX.length)return;const it=CX[s.i];s.res[s.i]=side===it.from;s.last=s.i;s.fly={i:s.i,t:0,from:ll||CX_DOCK};s.i++;s.moved=true;L.dirty=true;flash(".gh2-out")},
 tick(L,dt){const s=L.st;/* the Americas and Africa both in view, clear of the card */const a=aimOnce(s,dt,-40,12);if(!s.fly)return a;s.fly.t+=dt;if(s.fly.t>=2.4)s.fly=null;return true},
 draw(L){const s=L.st;
  CX.forEach((it,i)=>{const a=s.arcs[i],D=s.dots[i],done=i<s.i,fl=s.fly&&s.fly.i===i;let f=done?1:0,at=null;
   if(fl){const t=s.fly.t;if(t<.7){f=0;at=d3.geoInterpolate(s.fly.from,it.h)(ease(t/.7))}else{f=ease(Math.min(1,(t-.7)/1.5));at=along(a.R,f*a.R.L).ll}}
   if(done&&f>0){const pts=a.R.P.filter((p,k)=>a.R.K[k]<=f*a.R.L);pts.push(along(a.R,f*a.R.L).ll);const d=pathOf(pts);a.p.setAttribute("d",d);a.h.setAttribute("d",d)}else{a.p.setAttribute("d","");a.h.setAttribute("d","")}
   place(D.hd,done?proj(it.h):null);
   const q=done?proj(at||it.to):null;place(D.gg,q,fl?1.25:1);D.gg.classList.toggle("gh2-bad",done&&s.res[i]===false);
   putPill(D.lab,!fl&&q?q:null,esc(it.n)+" <small>→ "+esc(it.tn)+"</small>",0,-15,"")});
  const cur=s.i<CX.length&&!s.fly?CX[s.i]:null;const q=cur?proj(s.pos||CX_DOCK):null;place(s.tok,q);if(cur&&s.tokT.textContent!==cur.e)s.tokT.textContent=cur.e;
  putPill(s.lab,q,cur?esc(cur.n):"",0,-34,"");putPill(s.hint,!s.moved&&q?q:null,"⟵ drag me ⟶",0,48,"c");
  putPill(s.zA,s.i<CX.length?proj([-52,10]):null,"⟵ From the Americas",0,0,"c");putPill(s.zB,s.i<CX.length?proj([12,24]):null,"From Africa, Europe or Asia ⟶",0,0,"c")},
 html(){return'<div class="gh2-seg gh2-cxb"><button type="button" data-s="am">⟵ The Americas</button><button type="button" data-s="ow">Africa, Europe, Asia ⟶</button></div>'+
  '<div class="gh2-row gh2-small"><span class="gh2-prog"></span><span class="gh2-score"></span></div><div class="gh2-out"></div>'+
  '<div class="gh2-keys"><span><i style="background:#e8590c"></i>from the Americas</span><span><i style="background:#2b8a3e"></i>from Africa, Europe or Asia</span></div>'+
  '<div class="gh2-note">Each one flies to where it was first tamed, then to where it matters most today. Sources: Nunn and Qian (2010), Crosby (1972), FAOSTAT.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gh2-cxb button").forEach(b=>b.onclick=()=>{if(s.i>=CX.length){s.i=0;s.res=[];s.last=null;L.dirty=true;return}colex.answer(L,b.dataset.s,null)})},
 card(L){const s=L.st,n=s.res.filter(Boolean).length,done=s.i>=CX.length;setTxt(".gh2-prog",done?"All 12 sorted":(s.i+1)+" of "+CX.length+": "+CX[s.i].n);setTxt(".gh2-score",s.i?"✓ "+n+" right":"");
  const bs=L.c.querySelectorAll(".gh2-cxb button");if(bs.length===2){bs[0].textContent=done?"↺ Play again":"⟵ The Americas";bs[1].style.display=done?"none":""}
  let o;if(s.last==null)o="Before 1492 none of these crossed the Atlantic. Is <b>"+esc(CX[0].n.toLowerCase())+"</b> from the Americas, or from the Old World?";
  else{const it=CX[s.last],ok=s.res[s.last];o='<b class="'+(ok?"gh2-ok":"gh2-no")+'">'+(ok?"✓ Right: ":"✗ Not quite: ")+esc(it.n)+" is from "+(it.from==="am"?"the Americas":"the Old World")+" ("+esc(it.hn)+").</b> "+esc(it.t)}
  if(done)o+='<div class="gh2-sum">You placed <b>'+n+" of "+CX.length+"</b> right. Orange lines went east from the Americas, green lines went west. Most of the world’s favourite foods are less than 530 years old where they are eaten.</div>";
  setHTML(".gh2-out",o)}};
MODS.push(colex);
hideOwn("hg5a","The Columbian Exchange",null,()=>false);/* its three pins ("Mexico: maize, tomatoes"…) would give the answers away; the tokens land there instead */

/* ================================================================ 2. The biggest cities: where does a city end?
   2025: UN DESA, World Urbanization Prospects 2025, which draws every city's edge the same way from satellite maps of
   built-up land (the "degree of urbanisation"); the rounded figures are the stop's own list.
   2018: UN DESA, World Urbanization Prospects: The 2018 Revision, File 12 (urban agglomerations, thousands, 2018), which
   uses each country's own definition of the city (city proper, urban agglomeration or metropolitan area). */
const CT=[["Jakarta",[106.85,-6.2],42,10.517],["Dhaka",[90.4,23.8],37,19.578],["Tokyo",[139.69,35.69],33,37.468],["Delhi",[77.2,28.6],30,28.514],
 ["Shanghai",[121.47,31.23],30,25.582],["Guangzhou",[113.26,23.13],28,12.638],["Cairo",[31.24,30.04],26,20.076]];
const ctN=(c,u)=>lerp(c[2],c[3],ease(u));
const megac={id:"megac",tour:"cities",title:"The biggest cities",
 instr:"🏙 Under the UN’s older count (2018), which of these seven was the biggest? Click a city.",
 init(L){const s=L.st;s.u=0;s.tg=0;s.guess=null;
  s.b=CT.map((c,i)=>{const gg=el("g",{class:"gh2-handle gh2-city",tabindex:"0","aria-label":c[0]},L.svg);el("circle",{r:10,class:"gh2-cbub"},gg);el("circle",{r:2.5,class:"gh2-ccore"},gg);
   clickable(gg,()=>megac.pick(L,i));return{gg,c:gg.firstChild,lab:pill("gh2-chip gh2-clab")}})},
 pick(L,i){const s=L.st;if(s.guess==null){s.guess=i;s.tg=1;flash(".gh2-out")}},
 tick(L,dt){const s=L.st;let ch=false;if(s.u!==s.tg){const d=dt*.55;s.u=s.tg>s.u?Math.min(s.tg,s.u+d):Math.max(s.tg,s.u-d);ch=true}
  /* Cairo and Tokyo are far apart: turn the globe once so all seven are in view beside the card */
  if(aimOnce(s,dt,66,20,1))ch=true;
  return ch},
 order(u){return CT.map((c,i)=>i).sort((a,b)=>ctN(CT[b],u)-ctN(CT[a],u))},
 draw(L){const s=L.st,ord=this.order(s.u),G=g(),k=G&&G.size?clamp(G.size().h/900,.7,1.3):1;
  CT.forEach((c,i)=>{const o=s.b[i],q=proj(c[1]),n=ctN(c,s.u);place(o.gg,q);o.c.setAttribute("r",(3.9*Math.sqrt(n)*k).toFixed(1));
   o.gg.classList.toggle("gh2-picked",s.guess===i);const rk=ord.indexOf(i)+1,r=3.9*Math.sqrt(n)*k;
   putPill(o.lab,q,'<b>#'+rk+" "+esc(c[0])+"</b><span>"+(s.u===0?"~"+c[2]:s.u===1?n.toFixed(1):n.toFixed(0))+" million</span>",0,-r-3,"")})},
 html(){return'<div class="gh2-seg gh2-ctb"><button type="button" data-u="0" class="on">2025 count: same rule everywhere</button><button type="button" data-u="1">2018 count: each country’s own edges</button></div>'+
  '<div class="gh2-out"></div><div class="gh2-ranks"></div>'+
  '<div class="gh2-note">Bubble area shows people. 2025: UN World Urbanization Prospects 2025 (the stop’s list). 2018: UN World Urbanization Prospects, 2018 revision.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gh2-ctb button").forEach(b=>b.onclick=()=>{s.tg=+b.dataset.u;if(s.guess==null&&s.tg===1)s.guess=-1;L.dirty=true})},
 card(L){const s=L.st,ord=this.order(s.u);L.c.querySelectorAll(".gh2-ctb button").forEach(b=>b.classList.toggle("on",+b.dataset.u===s.tg));
  let o;if(s.guess==null)o="Today Jakarta comes first. But under the UN’s <b>older</b> count, one of these seven led the world. Which one? Click its bubble.";
  else{const ok=s.guess===2,lead=s.guess>=0?'<b class="'+(ok?"gh2-ok":"gh2-no")+'">'+(ok?"✓ Yes: Tokyo.":"✗ "+esc(CT[s.guess][0])+" was not: it was Tokyo.")+"</b> ":"";
   o=s.tg===1?lead+"In the 2018 count Tokyo led with <b>37.5 million</b>, and <b>Jakarta had only 10.5 million</b>, seventh of these seven. Nobody moved: Indonesia counted only the city itself, while the new count includes all the built-up land around it.":
    lead+"In the 2025 count every city’s edge is drawn the same way, from satellite maps of where buildings stand. Jakarta grows fourfold; Tokyo, already counted as a whole region, shrinks."}
  setHTML(".gh2-out",o);
  const mx=42;setHTML(".gh2-ranks",ord.map((i,r)=>{const c=CT[i],n=ctN(c,s.u);return'<div><span>'+(r+1)+". "+esc(c[0])+'</span><i><b style="width:'+(100*n/mx).toFixed(1)+'%"></b></i><em>'+(s.u===0?"~"+c[2]:n.toFixed(1))+" M</em></div>"}).join(""))}};
MODS.push(megac);
hideOwn("cities","The biggest cities",null,()=>false);/* its Jakarta/Dhaka/New Delhi pins sit under the bubbles, which carry their own labels */

/* ================================================================ 3. Christianity moved south: guess where its middle went
   Shares of the world's Christians by region, 1910 and 2010, and their numbers (about 600 million in 1910, 2.18 billion in
   2010): Pew Research Center, "Global Christianity" (December 2011), rounded to whole per cent. The centre of gravity,
   near Madrid in 1910 and south of Timbuktu in 2010: T. M. Johnson and K. R. Ross, "Atlas of Global Christianity"
   (2009); the points are the stop's own pins. The 2020 figures (31% and 22%) are the stop's own, from Pew (2025).
   Bubbles sit at a rough middle of each region. */
const CR_REG=[{n:"Europe",ll:[18,50],a:66,b:26},{n:"The Americas",ll:[-44,-6],a:27,b:37},{n:"Africa south of the Sahara",ll:[22,-3],a:1,b:24},
 {n:"Asia and the Pacific",ll:[78,22],a:5,b:13},{n:"Middle East and North Africa",ll:[38,28],a:1,b:1}];
const CR_TOT=[600,2180],CR_A=[-3.7,40.4],CR_B=[-2.6,13.6];
const christ={id:"christ",tour:"langrel",title:"Christianity moved south",
 instr:"✝ Drag the cross from Madrid to where you think the middle of the Christian world was in 2010.",
 init(L){const s=L.st;s.g=CR_A.slice();s.ph="guess";s.u=0;s.play=false;s.moved=false;
  s.bub=CR_REG.map(r=>({c:el("circle",{class:"gh2-rbub"},L.svg),lab:pill("gh2-chip")}));
  s.lineH=el("path",{class:"gh2-arc-halo"},L.svg);s.line=el("path",{class:"gh2-arc gh2-cr"},L.svg);s.miss=el("path",{class:"gh2-miss"},L.svg);
  s.real=el("g",{class:"gh2-real"},L.svg);el("circle",{r:9},s.real);s.realLab=pill("gh2-big-pill");s.startLab=pill("gh2-chip");
  s.h=el("g",{class:"gh2-handle gh2-cross",tabindex:"0","aria-label":"Your guess: drag"},L.svg);el("circle",{r:24,class:"gh2-hit"},s.h);
  el("path",{d:"M-3.5 -16 H3.5 V-7 H11 V0 H3.5 V16 H-3.5 V0 H-11 V-7 H-3.5 Z",class:"gh2-crossic"},s.h);s.hLab=pill("gh2-chip");s.hint=pill("gh2-hint");
  draggable(s.h,{start:()=>{s.moved=true},move:ev=>{if(s.ph!=="guess")return;const ll=toLL(ev.clientX,ev.clientY);if(ll)s.g=ll}})},
 tick(L,dt){const s=L.st;const a=aimOnce(s,dt,-10,18,1.05);if(!s.play)return a;s.u=Math.min(1,s.u+dt/6);if(s.u>=1){s.play=false;playBtn(false)}return true},
 draw(L){const s=L.st,shown=s.ph!=="guess",u=ease(s.u),G=g(),k=G&&G.size?clamp(G.size().h/900,.7,1.3):1;
  CR_REG.forEach((r,i)=>{const o=s.bub[i],q=shown?proj(r.ll):null,sh=lerp(r.a,r.b,u),nm=sh/100*lerp(CR_TOT[0],CR_TOT[1],u),rad=Math.max(3,1.15*Math.sqrt(nm)*k);
   if(q){o.c.style.display="";o.c.setAttribute("cx",q[0]);o.c.setAttribute("cy",q[1]);o.c.setAttribute("r",rad.toFixed(1))}else o.c.style.display="none";
   putPill(o.lab,q,"<b>"+esc(r.n)+"</b><span>"+Math.round(sh)+"%</span>",0,-rad-2,"")});
  const pts=densify([CR_A,CR_B],60).P,cut=Math.max(1,Math.round(u*(pts.length-1))),dl=shown?pathOf(pts.slice(0,cut+1)):"";s.line.setAttribute("d",dl);s.lineH.setAttribute("d",dl);
  const cq=shown?proj(d3.geoInterpolate(CR_A,CR_B)(u)):null;place(s.real,cq);putPill(s.realLab,cq,shown?(s.u>=1?"2010: the real middle":"Middle of the Christian world, "+Math.round(1910+100*s.u)):"",0,-14,"");
  putPill(s.startLab,proj(CR_A),shown||!s.moved?"":"1910: near Madrid",12,0,"r");
  const hq=shown&&!s.moved?null:proj(s.g);place(s.h,hq);putPill(s.hLab,hq,s.moved?"Your guess":"",0,40,"");putPill(s.hint,!s.moved&&hq?hq:null,"Drag me ⟶ 2010?",18,24,"r");
  s.miss.setAttribute("d",shown&&s.moved?pathOf(densify([s.g,CR_B],60).P):"")},
 html(){return'<button type="button" class="gh2-go gh2-check">Check my guess</button><div class="gh2-reveal" hidden>'+playRow("1910 to 2010","1910")+'</div><div class="gh2-out"></div>'+
  '<div class="gh2-note">Bubble area shows the number of Christians in each region. Shares: Pew Research Center (2011), rounded. The middle point: Johnson and Ross, Atlas of Global Christianity (2009).</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gh2-check").onclick=()=>{s.ph="shown";s.u=0;s.play=true;lastT=0;c.querySelector(".gh2-check").hidden=true;c.querySelector(".gh2-reveal").hidden=false;playBtn(true);flash(".gh2-out");L.dirty=true};
  c.querySelector(".gh2-play").onclick=()=>{if(s.u>=1)s.u=0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gh2-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.u=r.value/1000;L.dirty=true})},
 card(L){const s=L.st;if(s.ph==="guess"){setHTML(".gh2-out","In <b>1910</b> two Christians in three lived in Europe, and the middle of them all was near <b>Madrid</b>. A century later, where was it? Drag the cross, then check.");return}
  range(".gh2-u",s.u);setTxt(".gh2-val",String(Math.round(1910+100*s.u)));const off=dist(s.g,CR_B);
  let o=s.moved?"Your guess was <b>"+kmTxt(off)+"</b> from the real middle"+(off<500?": very close!":off<1500?": not bad.":".")+" ":"";
  o+=s.u<1?"Watch the bubbles: Christians grew from about <b>600 million</b> to <b>2.2 billion</b>, but almost all the growth was in the south.":
   "By 2010 the middle was <b>south of Timbuktu</b>, in Mali, about 3,000 km south of Madrid. Europe had a quarter of the world’s Christians, Africa south of the Sahara almost as many; by 2020 Africa had overtaken it (31% to 22%).";
  setHTML(".gh2-out",o)}};
MODS.push(christ);
hideOwn("langrel","Christianity moved south",()=>false,()=>false);/* the stop's own arrow and "2010" pin are the answer: drawn here after the guess */

/* ================================================================ 4. The Arab conquests: from Medina to Spain and the Indus
   Years: H. Kennedy, "The Great Arab Conquests" (2007), and Encyclopaedia Britannica ("Islamic world", "Umayyad dynasty",
   "Battle of Tours", "Battle of Talas", "Baghdad"). The year 711 for Spain and Sindh matches the Asia tour's own stop. Coordinates are
   today's towns at or nearest each place; "stop" marks where an Arab army was turned back. */
const AR_HOME=[39.61,24.47];/* Medina */
const AR=[
 {y:622,ll:[39.61,24.47],n:"Medina",t:"Muhammad and his followers leave Mecca for Medina, the Hijra: year 1 of the Muslim calendar."},
 {y:630,ll:[39.83,21.42],n:"Mecca",t:"Mecca surrenders to Muhammad."},
 {y:632,ll:null,n:"Muhammad dies",t:"Muhammad dies in Medina, with much of Arabia united behind him. The caliphs, his successors, lead the armies out of Arabia."},
 {y:635,ll:[36.29,33.51],n:"Damascus",t:"Damascus, a great city of the Byzantine Empire, surrenders."},
 {y:636,ll:[35.95,32.8],n:"Yarmuk",t:"At the Yarmuk River the Byzantine army is crushed: Syria is lost to Constantinople for good."},
 {y:637,ll:[44.58,33.09],n:"Ctesiphon",t:"The capital of Persia’s Sasanian empire falls."},
 {y:638,ll:[35.23,31.78],n:"Jerusalem",t:"Jerusalem surrenders to the caliph Umar."},
 {y:641,ll:[31.23,30.01],n:"Fustat (Cairo)",t:"Egypt is taken; a new garrison town, Fustat, grows into Cairo. Alexandria follows."},
 {y:642,ll:[48.37,34.19],n:"Nahavand",t:"The last big Persian army is beaten in the Zagros mountains."},
 {y:651,ll:[61.84,37.66],n:"Merv",t:"The last Persian king, Yazdegerd III, is killed near Merv: the Sasanian empire is gone."},
 {y:661,ll:null,n:"The Umayyads",t:"The Umayyad caliphs rule from Damascus."},
 {y:670,ll:[10.1,35.68],n:"Kairouan",t:"Kairouan is founded as a base for the war in North Africa."},
 {y:698,ll:[10.32,36.85],n:"Carthage",t:"Carthage, the last Byzantine stronghold in Africa, falls."},
 {y:711,ll:[-5.35,36.14],n:"Gibraltar",t:"Tariq ibn Ziyad crosses into Spain; the rock is still named after him, Jabal Tariq. The same year another army reaches Sindh, in today’s Pakistan."},
 {y:711,ll:[67.5,24.8],n:"Sindh",t:""},
 {y:711,ll:[-4.02,39.86],n:"Toledo",t:""},
 {y:712,ll:[66.96,39.65],n:"Samarkand",t:"In Central Asia, Samarkand is taken."},
 {y:717,ll:[28.98,41.01],n:"Constantinople",t:"A huge siege of Constantinople fails (717–718): the Byzantine Empire survives.",stop:1},
 {y:732,ll:[0.4,46.75],n:"Tours",t:"Between Tours and Poitiers, Charles Martel’s Franks defeat an Arab army: the furthest north it got.",stop:1},
 {y:750,ll:null,n:"The Abbasids",t:"The Abbasids overthrow the Umayyads."},
 {y:751,ll:[72.2,42.5],n:"Talas",t:"At the Talas River an Abbasid army beats Tang China’s: Central Asia stays with the caliphate."},
 {y:762,ll:[44.37,33.31],n:"Baghdad",t:"The caliph al-Mansur founds Baghdad, a round city on the Tigris, as the new capital of an empire from Spain to Central Asia."}];
const AR_Y0=622,AR_Y1=762;
const conq={id:"conq",tour:"hmedieval",title:"The Arab conquests and Baghdad",
 instr:"⚔ First a guess: how long after Muhammad died (632) did Arab armies reach Spain?",
 init(L){const s=L.st;s.Y=AR_Y0;s.play=false;s.guess=null;s.last=-1;
  s.rays=AR.map(e=>e.ll&&!e.stop?el("path",{class:"gh2-ray"},L.svg):null);
  s.pts=AR.map(e=>{if(!e.ll)return null;const gg=el("g",{class:e.stop?"gh2-x":"gh2-pt"},L.svg);if(e.stop){el("circle",{r:10},gg);el("path",{d:"M-5 -5 L5 5 M5 -5 L-5 5"},gg)}else{el("circle",{class:"gh2-glow",r:12},gg);el("circle",{r:5.5},gg)}return gg});
  s.labs=AR.map(e=>e.ll?pill("gh2-chip gh2-alab"):null);s.home=el("g",{class:"gh2-home"},L.svg);el("circle",{r:8},s.home);const t=el("text",{y:4,"text-anchor":"middle"},s.home);t.textContent="★"},
 tick(L,dt){const s=L.st;const a=aimOnce(s,dt,28,32);if(!s.play)return a;s.Y=Math.min(AR_Y1,s.Y+dt*5);if(s.Y>=AR_Y1){s.play=false;playBtn(false)}return true},
 draw(L){const s=L.st,y=Math.floor(s.Y+1e-6);
  AR.forEach((e,i)=>{if(!e.ll)return;const on=e.y<=y,fresh=on&&y-e.y<5,q=on?proj(e.ll):null;
   if(s.rays[i]){s.rays[i].setAttribute("d",on?pathOf(densify([AR_HOME,e.ll],80).P):"");s.rays[i].classList.toggle("gh2-ray-new",fresh)}
   place(s.pts[i],q);if(s.pts[i])s.pts[i].classList.toggle("gh2-fresh",fresh);
   putPill(s.labs[i],q&&(fresh||e.stop||e.n==="Gibraltar"||e.n==="Samarkand"||e.n==="Sindh"||e.n==="Baghdad")?q:null,(e.stop?"✋ ":"")+esc(e.n)+" "+e.y,0,-11,"")});
  place(s.home,proj(AR_HOME))},
 html(){return'<div class="gh2-seg gh2-arg"><button type="button" data-g="10">about 10 years</button><button type="button" data-g="80">about 80 years</button><button type="button" data-g="300">about 300 years</button></div>'+
  '<div class="gh2-reveal" hidden>'+playRow("Year","622")+'</div><div class="gh2-big gh2-astat"></div><div class="gh2-ev"><b></b><span></span></div>'+
  '<div class="gh2-note">Years: Hugh Kennedy, The Great Arab Conquests (2007); Encyclopaedia Britannica. ✋ marks where an army was turned back.</div>'},
 wire(L,c){const s=L.st;c.querySelectorAll(".gh2-arg button").forEach(b=>b.onclick=()=>{if(s.guess!=null)return;s.guess=+b.dataset.g;b.classList.add("on");c.querySelector(".gh2-reveal").hidden=false;
   c.querySelectorAll(".gh2-arg button").forEach(x=>{x.disabled=true;if(x.dataset.g==="80")x.classList.add("gh2-right")});s.Y=AR_Y0;s.play=true;lastT=0;playBtn(true);L.dirty=true});
  c.querySelector(".gh2-play").onclick=()=>{if(s.Y>=AR_Y1)s.Y=AR_Y0;s.play=!s.play;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gh2-u");r.addEventListener("input",()=>{s.play=false;playBtn(false);s.Y=AR_Y0+r.value/1000*(AR_Y1-AR_Y0);L.dirty=true})},
 card(L){const s=L.st,y=Math.floor(s.Y+1e-6);range(".gh2-u",(s.Y-AR_Y0)/(AR_Y1-AR_Y0));setTxt(".gh2-val",String(y));
  if(s.guess==null){setHTML(".gh2-astat","");setTxt(".gh2-ev b","");setTxt(".gh2-ev span","");return}
  let n=0,far=0,farN="";AR.forEach(e=>{if(e.ll&&!e.stop&&e.y<=y&&e.y>=632&&e.n!=="Baghdad"){n++;const d=dist(AR_HOME,e.ll);if(d>far){far=d;farN=e.n}}});
  const g0=s.guess===80?'<b class="gh2-ok">✓ Right: 79 years</b> (632 to 711). ':'<b class="gh2-no">✗ It was 79 years</b> (632 to 711). ';
  setHTML(".gh2-astat",g0+(n?'<br><b>'+n+'</b> places taken'+(far?' · farthest: <b>'+esc(farN)+'</b>, '+kmTxt(far)+' from Medina':''):""));
  let k=0;AR.forEach((e,i)=>{if(e.y<=y&&e.t)k=i});if(k!==s.last){s.last=k;const E=AR[k];setTxt(".gh2-ev b",E.y+" · "+E.n);setTxt(".gh2-ev span",E.t);flash(".gh2-ev")}}};
MODS.push(conq);
hideOwn("hmedieval","The Arab conquests and Baghdad",()=>false,p=>!/Mecca|Samarkand/.test(String(p&&p[1])));/* its two arrows and Mecca/Samarkand pins: the rays and dots here replace them */

/* ================================================================ 5. Silk and heavenly horses: pass the silk along
   Route: the stop's own line (Chang'an to Antioch), then by sea from Seleucia, Antioch's port, to Puteoli, the port where
   eastern goods for Rome landed, and on to Rome. Who carried it where, around 100 BC to AD 200: V. Hansen, "The Silk Road:
   A New History" (2012); P. Frankopan, "The Silk Roads" (2015). The Parthians "wished to control the trade in multi-coloured
   Chinese silks, and so blocked the way", and in AD 97 told the Han envoy Gan Ying that the sea crossing west could take
   three months to two years: Hou Hanshu 88 (J. Hill's translation, "The Western Regions according to the Hou Hanshu").
   "India, China and Arabia take 100 million sesterces a year from our empire": Pliny the Elder, Natural History 12.84.
   Silk clothes "that hide nothing": Seneca, On Benefits 7.9. Distances are measured along the drawn route. */
const SR_SEA=[[35.93,36.12],[33,35],[28,35.6],[23,36],[19,37.6],[15.62,38.2],[14.9,39.8],[14.12,40.82],[12.5,41.9]];
const SR_HANDS=[
 {at:"Chang’an",ll:[108.94,34.27],who:"Han Chinese merchants",ic:"🐫",t:"Silk is woven in China. Han merchants and soldiers take it west through the Hexi Corridor, guarded by the new frontier walls."},
 {at:"Dunhuang",ll:[94.66,40.14],who:"traders of the Tarim oases",ic:"🐫",t:"At Dunhuang, China ends. The bale is sold on to traders of the oasis kingdoms round the Taklamakan desert, oasis to oasis."},
 {at:"Kashgar",ll:[75.99,39.47],who:"Sogdian and Bactrian merchants",ic:"🐫",t:"Over the Pamirs at Kashgar it changes hands again: Central Asian merchants carry it through Ferghana, the land of the ‘heavenly horses’, to Samarkand and Bukhara."},
 {at:"Merv",ll:[61.84,37.66],who:"Parthian merchants",ic:"🐫",t:"At Merv the Parthian empire begins. The Parthians kept the trade to themselves: Chinese records say they blocked the way so that China and Rome could not trade directly."},
 {at:"Ctesiphon",ll:[44.58,33.09],who:"Palmyrene caravans",ic:"🐫",t:"From the Parthian capital, caravans from the desert city of Palmyra take it across the Syrian desert to Rome’s side of the Euphrates."},
 {at:"Antioch",ll:[36.16,36.2],who:"Greek and Roman shippers",ic:"⛵",t:"In Roman Antioch it is loaded on a ship for Italy."},
 {at:"Rome",ll:[12.5,41.9],who:"",ic:"",t:"Rome at last. Pliny grumbled that India, China and Arabia took 100 million sesterces a year from the empire, and Seneca that silk clothes hid nothing."}];
const silk={id:"silk",tour:"bsilkroads",title:"Silk and heavenly horses",
 instr:"🐫 Drag the bale of silk (or press ▶) from Chang’an to Rome, and see who carries it.",
 init(L){const s=L.st;s.km=0;s.play=false;s.moved=false;s.last=-1;let B=null;
  try{const S=psSteps()[ps.i],ln=(S.lines||[]).find(x=>x&&Array.isArray(x.coords)&&x.coords.length>8);if(ln)B=ln.coords}catch(e){}
  if(!B)B=SR_HANDS.slice(0,6).map(h=>h.ll);
  s.R=densify(B.concat(SR_SEA),40);s.hk=SR_HANDS.map(h=>{let b=0,bd=1e9;s.R.P.forEach((p,i)=>{const d=dist(p,h.ll);if(d<bd){bd=d;b=i}});return s.R.K[b]});
  s.seaKm=(()=>{let b=0,bd=1e9;s.R.P.forEach((p,i)=>{const d=dist(p,SR_SEA[0]);if(d<bd){bd=d;b=i}});return s.R.K[b]})();
  s.trailH=el("path",{class:"gh2-arc-halo"},L.svg);s.trail=el("path",{class:"gh2-arc gh2-silk"},L.svg);
  s.hdots=SR_HANDS.map(()=>el("circle",{r:6,class:"gh2-hand"},L.svg));s.hlab=SR_HANDS.map(()=>pill("gh2-chip"));
  s.b=el("g",{class:"gh2-handle gh2-bale",tabindex:"0","aria-label":"Bale of silk: drag along the road"},L.svg);el("circle",{r:24,class:"gh2-hit"},s.b);
  s.bIc=el("text",{"text-anchor":"middle",y:-6,class:"gh2-emo-s"},s.b);
  el("rect",{x:-11,y:0,width:22,height:13,rx:3,class:"gh2-silkbox"},s.b);el("path",{d:"M-11 4 H11 M-11 9 H11",class:"gh2-silkline"},s.b);
  s.lab=pill("gh2-big-pill");s.hint=pill("gh2-hint");
  draggable(s.b,{start:()=>{s.play=false;s.moved=true;s.drag=true;playBtn(false)},end:()=>{s.drag=false},move:ev=>{const k=nearestKm(L,s.R,ev);if(k!=null)s.km=k}})},
 hand(s){let k=0;s.hk.forEach((h,i)=>{if(s.km>=h-1)k=i});return k},
 tick(L,dt){const s=L.st;let ch=false;if(s.play){s.km=Math.min(s.R.L,s.km+dt*s.R.L/32);if(s.km>=s.R.L){s.play=false;playBtn(false)}ch=true}
  if((s.play||s.drag)&&follow(along(s.R,s.km).ll,34))ch=true;
  return ch},
 draw(L){const s=L.st,a=along(s.R,s.km),pts=s.R.P.slice(0,a.i+1);pts.push(a.ll);const d=pathOf(pts);s.trail.setAttribute("d",d);s.trailH.setAttribute("d",d);
  const k=this.hand(s);SR_HANDS.forEach((h,i)=>{const q=proj(h.ll);if(q){s.hdots[i].style.display="";s.hdots[i].setAttribute("cx",q[0]);s.hdots[i].setAttribute("cy",q[1])}else s.hdots[i].style.display="none";
   s.hdots[i].classList.toggle("on",i<=k);putPill(s.hlab[i],q,esc(h.at),0,-8,"")});
  const q=proj(a.ll);place(s.b,q);const H=SR_HANDS[k],ic=s.km>=s.seaKm&&s.km<s.R.L-1?"⛵":s.km>=s.R.L-1?"":"🐫";if(s.bIc.textContent!==ic)s.bIc.textContent=ic;
  putPill(s.lab,q,s.km>=s.R.L-1?"Sold in Rome ✓":"carried by "+esc(H.who),0,-34,"");putPill(s.hint,!s.moved&&!s.play&&q?q:null,"⟵ drag me west",-26,8,"l")},
 html(){return playRow("Along the road","0 km")+'<div class="gh2-stats"><div><b class="gh2-nh">0</b><small>times sold on</small></div><div><b class="gh2-km">0 km</b><small>travelled</small></div><div><b class="gh2-who">Han</b><small>carrying it now</small></div></div>'+
  '<div class="gh2-ev"><b></b><span></span></div><div class="gh2-note">Who carried silk where, about 100 BC to AD 200: Hansen (2012), Frankopan (2015), the Hou Hanshu; Pliny, Natural History 12.84; Seneca, On Benefits 7.9. Distance is along the drawn road and sea route.</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gh2-play").onclick=()=>{if(s.km>=s.R.L-1)s.km=0;s.play=!s.play;s.moved=true;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gh2-u");r.addEventListener("input",()=>{s.play=false;s.moved=true;playBtn(false);s.km=r.value/1000*s.R.L;L.dirty=true})},
 card(L){const s=L.st,k=this.hand(s),done=s.km>=s.R.L-1;range(".gh2-u",s.km/s.R.L);setTxt(".gh2-val",kmTxt(s.km));setTxt(".gh2-nh",String(Math.min(5,k)));setTxt(".gh2-km",kmTxt(s.km));
  setTxt(".gh2-who",done?"sold":SR_HANDS[k].who.split(" ")[0].replace("traders","Oasis"));
  if(k!==s.last){s.last=k;const H=SR_HANDS[k];setTxt(".gh2-ev b",H.at+(H.who?" → "+H.who:""));setTxt(".gh2-ev span",H.t+(done?" The bale changed hands five times in "+kmTxt(s.R.L)+": nobody carried it the whole way, and each one added a price.":""));flash(".gh2-ev")}}};
MODS.push(silk);
hideOwn("bsilkroads","Silk and heavenly horses",null,p=>/Ferghana/.test(String(p&&p[1])));/* Chang'an, Dunhuang, Merv and Antioch are labelled here as the places where the silk changes hands */

/* ================================================================ 6. Alone across the Gobi: Xuanzang's water bag
   The story: Huili and Yancong, "A Biography of the Tripiṭaka Master of the Great Ci'en Monastery of the Great Tang"
   (7th century; S. Beal, "The Life of Hiuen-Tsiang", 1911; Li Rongxi, BDK, 1995), book 1: beyond Guazhou five beacon
   towers stood 100 li apart, with water only at the towers; at the first an arrow nearly hit him as he drew water, and the
   captain let him go; at the fourth he was told to pass the fifth by and make for the Wild Horse Spring; lost in the
   Mo-he-yan desert, 800 li of sand with no birds, beasts, water or grass, he dropped his water bag and it spilt; he turned
   back east, then turned west again, vowing he would rather die going west than live going back east; four nights and
   five days without a drop of water; on the fifth night a cool wind woke him, and his horse led him to grass and a pool.
   Then on to Yiwu (Hami). The towers and the spring are placed along the stop's own line for the story, not mapped. */
const GB_PTS=[[95.78,40.52],[94.6,41.6],[93.51,42.83]];
const GB_TW=[.07,.14,.21,.28,.35],GB_SPILL=.46,GB_POOL=.9,GB_REFILL=[0,.07,.28];
const gobi={id:"gobi",tour:"bjourneywest",title:"Alone across the Gobi",
 instr:"🐎 Lead Xuanzang west past the beacon towers: drag him, or press ▶. Watch his water.",
 init(L){const s=L.st;s.f=0;s.play=false;s.chose=null;s.back=0;s.moved=false;s.R=densify(GB_PTS,8);
  s.trailH=el("path",{class:"gh2-arc-halo"},L.svg);s.trail=el("path",{class:"gh2-arc gh2-walk"},L.svg);
  s.tw=GB_TW.map((f,i)=>{const gg=el("g",{class:"gh2-tower"+(i===4?" gh2-skip":"")},L.svg);el("path",{d:"M-5 0 L-3 -16 H3 L5 0 Z"},gg);el("path",{d:"M-4 -16 H4 V-19 H-4 Z",class:"gh2-tw-top"},gg);return{gg,lab:pill("gh2-chip")}});
  s.pool=el("g",{class:"gh2-pool"},L.svg);el("ellipse",{rx:11,ry:6},s.pool);s.poolLab=pill("gh2-chip");s.spillDot=el("circle",{r:4,class:"gh2-spill"},L.svg);
  s.m=el("g",{class:"gh2-handle gh2-monk",tabindex:"0","aria-label":"Xuanzang: drag along the road"},L.svg);el("circle",{r:24,class:"gh2-hit"},s.m);s.mFig=el("g",{},s.m);
  s.mFig.innerHTML='<path d="M-14 2 Q-12 -6 -2 -6 L8 -6 L12 -12 L15 -11 L14 -4 L10 -2 L10 6 L8 6 L8 0 L-8 0 L-9 6 L-11 6 L-11 0 Z" fill="#a0442a" stroke="#3b1a0e" stroke-width="1"/>'+
   '<path d="M-3 -6 L-1 -18 L3 -18 L5 -6 Z" fill="#e8a33a" stroke="#6b3d0e" stroke-width="1"/><circle cx="1" cy="-21" r="3.4" fill="#f1c9a0" stroke="#6b3d0e" stroke-width="1"/>';
  s.lab=pill("gh2-big-pill");s.hint=pill("gh2-hint");
  draggable(s.m,{start:()=>{s.play=false;s.moved=true;playBtn(false)},move:ev=>{const k=nearestKm(L,s.R,ev);if(k!=null)s.f=gobi.lim(s,k/s.R.L)}})},
 lim(s,f){return s.chose?f:Math.min(f,GB_SPILL)},
 water(f,s){if(f>=GB_POOL)return 1;if(s&&s.chose)return 0;if(f>=GB_SPILL)return 0;let r=0;GB_REFILL.forEach(x=>{if(x<=f)r=x});return clamp(1-(f-r)*2.6,0,1)},
 day(f){return f<GB_SPILL?0:Math.min(5,1+Math.floor((f-GB_SPILL)/(GB_POOL-GB_SPILL)*5))},
 tick(L,dt){const s=L.st;if(aimOnce(s,dt,94.65,41.65,16)&&!s.play&&!s.back)return true;if(s.back>0){s.back-=dt;s.f=Math.max(GB_SPILL-.07,s.f-dt*.05);if(s.back<=0){s.back=0;s.play=true;playBtn(true)}return true}
  if(!s.play)return false;s.f=this.lim(s,s.f+dt/28);if(s.f>=1||(!s.chose&&s.f>=GB_SPILL)){s.play=false;playBtn(false)}return true},
 draw(L){const s=L.st,km=s.f*s.R.L,a=along(s.R,km),pts=s.R.P.slice(0,a.i+1);pts.push(a.ll);const d=pathOf(pts);s.trail.setAttribute("d",d);s.trailH.setAttribute("d",d);
  GB_TW.forEach((f,i)=>{const q=proj(along(s.R,f*s.R.L).ll);place(s.tw[i].gg,q);putPill(s.tw[i].lab,q,(i===4?"5th tower (avoided)":(i+1)+(["st","nd","rd","th"][i])+" tower"),i%2?12:-12,-10,i%2?"r":"l")});
  const pl=d3.geoInterpolate(along(s.R,GB_POOL*s.R.L).ll,[93.6,41.9])(.5),pq=s.f>=GB_POOL-.04?proj(pl):null;place(s.pool,pq);putPill(s.poolLab,pq,"grass and a pool",14,0,"r");
  place(s.spillDot,s.f>=GB_SPILL?proj(along(s.R,GB_SPILL*s.R.L).ll):null);
  const q=proj(a.ll),w=this.water(s.f,s),dd=this.day(s.f);place(s.m,q);s.mFig.setAttribute("transform","scale(-1,1)"+(dd>=4&&s.f<GB_POOL?" rotate(-8)":""));s.mFig.style.opacity=dd&&s.f<GB_POOL?String(1-dd*.08):"1";
  putPill(s.lab,q,s.f>=1?"Hami (Yiwu) ✓":!s.chose&&s.f>=GB_SPILL-1e-3?"💧 Spilt!":dd&&s.f<GB_POOL?"Day "+dd+" without water":"💧 "+Math.round(w*100)+"%",0,-30,"");putPill(s.hint,!s.moved&&q?q:null,"Drag me ⟶",16,14,"r")},
 html(){return playRow("Along the road","Guazhou")+'<div class="gh2-water"><span>Water bag</span><i><b></b></i><em></em></div>'+
  '<div class="gh2-seg gh2-gbc" hidden><button type="button" data-c="back">Turn back east, to the tower</button><button type="button" data-c="on">Keep going west</button></div>'+
  '<div class="gh2-out"></div><div class="gh2-note">From his biography by his disciples Huili and Yancong (translated by Beal, 1911, and Li Rongxi, 1995). Towers and spring are placed for the story, not mapped.</div>'},
 wire(L,c){const s=L.st;c.querySelector(".gh2-play").onclick=()=>{if(s.f>=1)s.f=0;s.play=!s.play;s.moved=true;lastT=0;playBtn(s.play)};
  const r=c.querySelector(".gh2-u");r.addEventListener("input",()=>{s.play=false;s.moved=true;playBtn(false);s.f=gobi.lim(s,r.value/1000);L.dirty=true});
  c.querySelectorAll(".gh2-gbc button").forEach(b=>b.onclick=()=>{if(s.chose||s.f<GB_SPILL-1e-3)return;s.chose=b.dataset.c;if(s.chose==="back")s.back=1.6;else{s.play=true;playBtn(true)}lastT=0;flash(".gh2-out");L.dirty=true})},
 card(L){const s=L.st,f=s.f,w=this.water(f,s),dd=this.day(f);range(".gh2-u",f);
  setTxt(".gh2-val",f>=1?"Hami":f<.04?"Guazhou":!s.chose&&f>=GB_SPILL-1e-3?"Spilt!":dd&&f<GB_POOL?"Day "+dd:"Gobi");const wb=q$(".gh2-water b");if(wb){wb.style.width=(100*w)+"%";wb.classList.toggle("low",w<.3)}setTxt(".gh2-water em",Math.round(w*100)+"%");
  const ch=q$(".gh2-gbc");if(ch)ch.hidden=!(f>=GB_SPILL-1e-3&&!s.chose);
  let o;if(s.chose==="back"&&s.back>0)o="He turns back east, towards the 4th tower and its water…";
  else if(f<GB_TW[0]-.01)o="Night, at Guazhou: the frontier is closed and travel west is forbidden. Xuanzang slips out with one guide, who soon leaves him, and an old red horse that knows the road.";
  else if(f<GB_TW[1]-.01)o="<b>1st tower.</b> As he fills his bag at the tower’s pool an arrow nearly hits him. The captain, a Buddhist, lets him go on and fills his bag again.";
  else if(f<GB_TW[3]-.01)o="Past the 2nd and 3rd towers in the dark. The bag is getting lighter.";
  else if(f<GB_TW[4]-.01)o="<b>4th tower.</b> A relative of the first captain gives him water and warns him: the soldiers at the fifth are rough. Go round it, to the Wild Horse Spring.";
  else if(f<GB_SPILL-.005&&!s.chose)o="He looks for the spring and cannot find it. Ahead lies 800 <i>li</i> of desert: no birds, no beasts, no water, no grass.";
  else if(!s.chose)o="<b>Disaster: lifting the bag to drink, he drops it, and the water soaks into the sand.</b> The 4th tower is behind him. What should he do?";
  else if(f<GB_POOL)o=(s.chose==="back"?"He did turn back, as you chose. Then he stopped: ‘I would rather die going west than go back east and live.’ He turned the horse west again. ":"He went on, as you chose, though first he too turned back, then changed his mind: ‘I would rather die going west than go back east and live.’ ")+
   (dd?"<b>Day "+dd+" with no water.</b>"+(dd>=4?" He and the horse can barely stand; on the fifth night he lies down in the sand.":""):"");
  else if(f<1)o="<b>On the fifth night a cool wind wakes him.</b> The horse sets off its own way, and leads him to green grass and a pool: four nights and five days without water, and they are saved.";
  else o="He reaches Hami (Yiwu), the first oasis kingdom of the west. The road to India, and to the legend of the Monkey King, lies ahead.";
  setHTML(".gh2-out",o)}};
MODS.push(gobi);

/* ---- watch the tour: mount on the right stop, clean up as soon as it changes ---- */
setInterval(()=>{try{const m=stopNow();if(m){if(MOD!==m||!L||!L.el.isConnected||L.host!==(g()&&g().host))mount(m);ensureCard()}else if(MOD)unmount()}catch(e){try{unmount()}catch(_){}}},300);
addEventListener("resize",()=>{if(L)L.dirty=true});

{const s=document.createElement("style");s.textContent=`
.gh2-layer{position:absolute;inset:0;pointer-events:none;z-index:6}/* under the tour card (z 7), over the globe */
.gh2-svg{position:absolute;left:0;top:0;overflow:visible}
.gh2-handle{pointer-events:all;cursor:grab;touch-action:none;outline:none}.gh2-handle.gh2-dragging{cursor:grabbing}.gh2-city{cursor:pointer}
.gh2-hit{fill:rgba(255,255,255,.001);stroke:none}
.gh2-handle:focus-visible{filter:drop-shadow(0 0 4px #fff)}
.gh2-pill{position:absolute;white-space:nowrap;pointer-events:none;font:700 13px/1.25 system-ui,sans-serif;color:#13294b;background:rgba(255,255,255,.95);padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.28)}
.gh2-pill small{font-weight:600;opacity:.75}
.gh2-big-pill{background:#13294b;color:#fff;font-size:14px;font-weight:800;padding:5px 12px}
.gh2-chip{display:flex;flex-direction:column;align-items:center;padding:3px 9px;border-radius:10px;font-size:12px}.gh2-chip b{font-size:12.5px}.gh2-chip span{font-weight:800;font-size:12.5px}
.gh2-hint{background:#fff7ec;color:#9a4a16;font-weight:800;font-size:13px;animation:gh2Nudge 1.4s ease-in-out infinite}
@keyframes gh2Nudge{50%{margin-left:6px}}
.gh2-zone{background:rgba(19,41,75,.82);color:#fff;font-size:13.5px;font-weight:800;padding:6px 13px}
.gh2-tokbg{fill:#fff;stroke:#e8590c;stroke-width:3;filter:drop-shadow(0 3px 4px rgba(0,0,0,.45))}
.gh2-emo{font-size:30px;pointer-events:none}.gh2-emo-s{font-size:15px;pointer-events:none}
.gh2-cxbg{fill:#fff;stroke-width:2.5}.gh2-cxbg.gh2-am{stroke:#e8590c}.gh2-cxbg.gh2-ow{stroke:#2b8a3e}.gh2-bad .gh2-cxbg{stroke-dasharray:3 2}
.gh2-hearth{stroke:#fff;stroke-width:1.5}.gh2-hearth.gh2-am{fill:#e8590c}.gh2-hearth.gh2-ow{fill:#2b8a3e}
.gh2-arc-halo{fill:none;stroke:rgba(255,255,255,.85);stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.gh2-arc{fill:none;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}.gh2-arc.gh2-am{stroke:#e8590c}.gh2-arc.gh2-ow{stroke:#2b8a3e}
.gh2-arc.gh2-cr{stroke:#7048e8;stroke-width:4}.gh2-arc.gh2-silk{stroke:#c2255c;stroke-width:4}.gh2-arc.gh2-walk{stroke:#d9682b;stroke-width:4;stroke-dasharray:2 6}
.gh2-cbub{fill:rgba(232,89,12,.42);stroke:#e8590c;stroke-width:2.5;transition:fill .2s}.gh2-ccore{fill:#13294b}.gh2-city:hover .gh2-cbub{fill:rgba(232,89,12,.62)}
.gh2-picked .gh2-cbub{stroke:#13294b;stroke-width:4}
.gh2-rbub{fill:rgba(112,72,232,.35);stroke:#7048e8;stroke-width:2.5}
.gh2-crossic{fill:#f8f9fa;stroke:#7048e8;stroke-width:2.2;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.gh2-real circle{fill:#7048e8;stroke:#fff;stroke-width:3}.gh2-miss{fill:none;stroke:#13294b;stroke-width:2;stroke-dasharray:5 5}
.gh2-ray{fill:none;stroke:rgba(43,138,62,.6);stroke-width:1.8}.gh2-ray.gh2-ray-new{stroke:#2b8a3e;stroke-width:3}
.gh2-pt circle{fill:#2b8a3e;stroke:#fff;stroke-width:2}.gh2-pt .gh2-glow{fill:rgba(43,138,62,.25);stroke:none;opacity:0}.gh2-pt.gh2-fresh .gh2-glow{opacity:1;animation:gh2Pulse 1.2s ease-in-out infinite}
@keyframes gh2Pulse{50%{transform:scale(1.5);opacity:.3}}
.gh2-x circle{fill:#c92a2a;stroke:#fff;stroke-width:2}.gh2-x path{stroke:#fff;stroke-width:2.6;stroke-linecap:round}
.gh2-home circle{fill:#13294b;stroke:#fff;stroke-width:2}.gh2-home text{fill:#ffd43b;font-size:11px}
.gh2-hand{fill:#fff;stroke:#c2255c;stroke-width:2.5}.gh2-hand.on{fill:#c2255c;stroke:#fff}
.gh2-silkbox{fill:#f783ac;stroke:#7a1f3d;stroke-width:1.2;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}.gh2-silkline{stroke:#ffd8e6;stroke-width:1.2}
.gh2-tower path{fill:#b08a5a;stroke:#4a3420;stroke-width:1}.gh2-tower .gh2-tw-top{fill:#e8590c}.gh2-tower.gh2-skip{opacity:.6}
.gh2-pool ellipse{fill:#4dabf7;stroke:#2b8a3e;stroke-width:3}.gh2-spill{fill:#4dabf7;stroke:#fff;stroke-width:1.5}
.gh2-monk{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gh2-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12);font-size:13.5px;line-height:1.4}
.gh2-do{font-weight:800;font-size:14px;color:#9a4a16;margin-bottom:8px}
.gh2-row{display:flex;align-items:center;gap:10px}.gh2-row.gh2-small{margin-top:8px;font-size:12.5px;justify-content:space-between;font-weight:700}
.gh2-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gh2-range{flex:1 1 auto;min-width:0;accent-color:#d9682b;cursor:pointer}
.gh2-big{flex:0 0 auto;font-weight:800;font-size:16px;color:#9a4a16;white-space:nowrap;min-width:58px;text-align:right}
.gh2-astat{display:block;text-align:left;font-size:13.5px;white-space:normal;margin-top:8px;color:inherit;font-weight:600}
.gh2-out{margin-top:8px;font-size:14px;line-height:1.4}
.gh2-ok{color:#2b8a3e}.gh2-no{color:#c92a2a}
.gh2-sum{margin-top:6px;padding:6px 9px;border-radius:8px;background:rgba(43,138,62,.1)}
.gh2-note{margin-top:6px;font-size:11.5px;opacity:.68;line-height:1.35}
.gh2-seg{display:flex;gap:6px;flex-wrap:wrap}.gh2-seg button{flex:1 1 0;min-width:0;border:1px solid rgba(19,41,75,.25);background:#fff;color:#13294b;border-radius:999px;padding:7px 10px;font:700 12.5px system-ui,sans-serif;cursor:pointer}
.gh2-seg button.on{background:#e8590c;border-color:#e8590c;color:#fff}.gh2-seg button.gh2-right{box-shadow:0 0 0 2px #2b8a3e inset}.gh2-seg button:disabled{cursor:default}
.gh2-seg+.gh2-reveal,.gh2-seg+.gh2-out{margin-top:8px}.gh2-reveal{margin-top:8px}
.gh2-go{width:100%;border:0;border-radius:999px;background:#7048e8;color:#fff;font:800 14px system-ui,sans-serif;padding:8px 12px;cursor:pointer}
.gh2-keys{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12.5px;font-weight:700}.gh2-keys i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
.gh2-ranks{margin-top:8px;display:grid;gap:4px}.gh2-ranks div{display:grid;grid-template-columns:100px 1fr 52px;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
.gh2-ranks i{height:9px;border-radius:5px;background:rgba(19,41,75,.12);overflow:hidden}.gh2-ranks i b{display:block;height:100%;background:#e8590c;border-radius:5px}.gh2-ranks em{font-style:normal;text-align:right}
.gh2-ev{margin-top:8px;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.7);border-left:4px solid #2b8a3e}.gh2-ev:empty{display:none}.gh2-ev b{display:block;font-size:13.5px}.gh2-ev span{font-size:13px}
.gh2-c-silk .gh2-ev{border-left-color:#c2255c}
.gh2-flash{animation:gh2Flash .6s ease}@keyframes gh2Flash{0%{background:#fff3bf}100%{}}
.gh2-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px;text-align:center}.gh2-stats b{display:block;font-size:15px;color:#13294b;white-space:nowrap}.gh2-stats small{font-size:11px;opacity:.7}
.gh2-water{margin-top:9px;display:grid;grid-template-columns:72px 1fr 40px;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
.gh2-water i{height:12px;border-radius:6px;background:rgba(19,41,75,.12);overflow:hidden}.gh2-water i b{display:block;height:100%;width:100%;background:#4dabf7;border-radius:6px;transition:width .2s}.gh2-water i b.low{background:#e03131}.gh2-water em{font-style:normal;text-align:right}
.gh2-gbc{margin-top:8px}.gh2-gbc[hidden],.gh2-reveal[hidden],.gh2-go[hidden]{display:none}
body.dark-theme .gh2-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}body.dark-theme .gh2-do,body.dark-theme .gh2-big{color:#ffb27a}
body.dark-theme .gh2-stats b{color:#e9eef6}body.dark-theme .gh2-ev{background:rgba(255,255,255,.08)}
body.dark-theme .gh2-ranks i,body.dark-theme .gh2-water i{background:rgba(255,255,255,.14)}body.dark-theme .gh2-ok{color:#69db7c}body.dark-theme .gh2-no{color:#ff8787}`;document.head.appendChild(s)}
window.gfInteractHuman2={mods:MODS,state:()=>L&&L.st,redraw:()=>{if(L)L.dirty=true}};
})();
