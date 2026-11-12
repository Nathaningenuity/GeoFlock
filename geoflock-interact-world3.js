/* GeoFlock: six continent and world tour stops you can play with, not just read. Each one puts a layer over the Maps
   globe and a small control block on the card (right after the stop's headline), with a one-line instruction:
   - borders | "Rivers, mountains and rulers": sort ten real borders. Each one glows on the globe in turn (or click any
     of them); say whether it follows a river, a mountain range or a ruler-straight line. It turns the right colour, the
     card says who drew it and when, and keeps the score.
   - rivers | "The longest river?": race the Nile and the Amazon from source to sea. Drag either boat (or the slider, or
     Play): both boats travel the same distance, with a running count in km. Switch the measurement between the atlas
     lengths and the 2007 Brazilian study, and the winner changes.
   - lakes | "The Great Lakes": follow a drop of water from Duluth (or from Chicago) through the lakes, down Niagara and
     out along the St. Lawrence to the sea. A staircase of lake levels on the card shows the drop falling, and a clock
     counts the years it spends, on average, in each lake.
   - pop | "The Ganges plain and Bangladesh": pick the United States, Canada or Australia and slide its crowding up to
     Bangladesh's. One dot is ten million people; the country fills up with dots and the card counts how many people it
     would hold, past everyone alive today. A true-size outline of Bangladesh, with its own 17 dots, drags anywhere.
   - namerica | "Mountains and rivers": where does the rain go? Rain falls on eight cities in turn; say which sea it
     ends in (the Pacific, the Gulf of Mexico, Hudson Bay, the Arctic, or none). A trickle then runs down the real rivers
     to the sea. Chicago and Phoenix have twists.
   - seas | "Two tides a day": run the clock (slider or Play) and the Earth turns under the Moon's two tidal bulges.
     Drag the tide gauge to any coast; the card draws its tide over a day: two highs and two lows, 12 h 25 min apart.
     Switch between spring and neap tides to add or take away the Sun's pull.
   Same pattern as geoflock-odyssey.js and geoflock-interact-earth2.js: a watchdog polls `ps`, matches the stop by tour
   and title, mounts a layer in amGlobe.host drawn with amGlobe.projection(), redraws when the view changes, and removes
   everything (layer, card block, body class, timers) as soon as the stop changes or the tour ends. Globe view only. Next
   and Back are never blocked, and every step is wrapped in try/catch. CSS classes start with "gw3-" so they never clash
   with the other interactive files. Sources are named beside each set of figures below.
   Stops already made interactive in geoflock-odyssey.js and geoflock-interact-{earth2,hist,human,human2,life,phys}.js
   are not touched; nor are stops that already have a drag-me shape (S.drag / S.ghosts), such as "Bigger than Europe". */
(function(){
"use strict";
if(window.gfInteractWorld3)return;
const R_KM=6371,DEG=Math.PI/180;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const km=(a,b)=>{try{return d3.geoDistance(a,b)*R_KM}catch(e){return 0}};
const NS="http://www.w3.org/2000/svg";

/* ---------------- shared helpers (as in geoflock-interact-earth2.js) ---------------- */
/* a lon/lat point → [x,y] in the host's pixels, or null round the back of the globe; `card` true: also null under the card */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function unproj(L,x,y){const G=g();try{const p=G.projection();if(!p.invert)return null;const ll=p.invert([x-L.ox,y-L.oy]);if(!ll||!isFinite(ll[0]))return null;
 if(!G._flat&&d3.geoDistance([-G.rot[0],-G.rot[1]],ll)>Math.PI/2-.02)return null;return ll}catch(e){return null}}
function pathOf(L,pts,close){let d="",pen=false,px=0,py=0,n=0;const G=g(),J=close?1e9:G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else{d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);n++}px=q[0];py=q[1]}
 return close&&n>1?d+"Z":d}
/* GeoJSON (polygons, circles) through the globe's own projection, so edges follow great circles and clip at the horizon;
   drawn inside a group shifted by the canvas offset (L.shift) */
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
/* a polyline cut into short steps (in degrees, so a parallel stays a parallel), with the distance in km along it */
function route(C,step){step=step||.15;const P=[];for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
  for(let k=0;k<n;k++)P.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}P.push(C[C.length-1].slice(0,2));
 const K=[0];for(let i=1;i<P.length;i++)K.push(K[i-1]+km(P[i-1],P[i]));return{P,K,total:K[K.length-1]}}
function at(R,u){const t=clamp(u,0,1)*R.total;let lo=0,hi=R.K.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.K[m]<=t)lo=m;else hi=m}
 const f=R.K[hi]>R.K[lo]?(t-R.K[lo])/(R.K[hi]-R.K[lo]):0,a=R.P[lo],b=R.P[hi];return{ll:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],i:lo}}
const uOf=(R,ll)=>{let b=0,bd=1e9;R.P.forEach((p,i)=>{const d=Math.hypot(p[0]-ll[0],p[1]-ll[1]);if(d<bd){bd=d;b=i}});return R.K[b]/R.total};
function nearestU(L,R,px,py,u){const cur=at(R,u).i,W=Math.max(60,R.P.length>>2);let best=-1,bd=1e9;
 for(let i=Math.max(0,cur-W);i<=Math.min(R.P.length-1,cur+W);i++){const q=proj(L,R.P[i]);if(!q)continue;const d=Math.hypot(q[0]-px,q[1]-py)+Math.abs(i-cur)*.05;if(d<bd){bd=d;best=i}}
 return best<0?u:R.K[best]/R.total}
/* drag anything: mv(x,y) in host pixels; the globe does not spin under the finger. Arrow keys nudge L.u (or call keys). */
function draggable(L,el,mv,start,keys,end){const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{el.setPointerCapture(e.pointerId)}catch(err){}
  el.classList.add("gw3-dragging");const hr0=L.host.getBoundingClientRect();if(start)try{start(e.clientX-hr0.left,e.clientY-hr0.top)}catch(err){}const m=ev=>{ev.stopPropagation();const hr=L.host.getBoundingClientRect();try{mv(ev.clientX-hr.left,ev.clientY-hr.top)}catch(err){}L.dirty=1};
  const up=()=>{el.removeEventListener("pointermove",m);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.classList.remove("gw3-dragging");if(end)try{end()}catch(err){}L.dirty=1};
  el.addEventListener("pointermove",m);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)};
 el.addEventListener("keydown",e=>{const k=e.key,f=k==="ArrowRight"||k==="ArrowUp"?1:k==="ArrowLeft"||k==="ArrowDown"?-1:0;if(!f)return;e.preventDefault();
  if(keys){try{keys(f)}catch(err){}}else{stopPlay(L);L.u=clamp(L.u+f*.01,0,1)}L.dirty=1});
 el.addEventListener("pointerdown",down);quiet(el)}
/* clicks on our shapes never reach the globe's own handlers (which would spin it or pick a country) */
function quiet(el){["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function place(el,q,extra){if(!q){el.style.display="none";return false}el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")"+(extra||""));return true}
function tag(L,cls){const d=document.createElement("div");d.className="gw3-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".gw3-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("gw3-new");void e.offsetWidth;e.classList.add("gw3-new")}
function playerHTML(label,read){return'<div class="gw3-row"><button type="button" class="gw3-play" aria-label="Play">▶</button><input type="range" class="gw3-range" min="0" max="1000" step="1" value="0" aria-label="'+esc(label)+'"><span class="gw3-read">'+esc(read||"")+"</span></div>"}
function playBtn(L){const b=L.card&&L.card.querySelector(".gw3-play");if(b){b.textContent=L.playing?"❚❚":"▶";b.setAttribute("aria-label",L.playing?"Pause":"Play")}}
function wirePlayer(L){const c=L.card,b=c.querySelector(".gw3-play"),r=c.querySelector(".gw3-range");if(!b||!r)return;
 b.onclick=()=>{if(L.u>=1&&!L.D.loop)L.u=0;L.playing=!L.playing;playBtn(L);L.dirty=1};r.addEventListener("input",()=>{L.playing=false;playBtn(L);L.u=r.value/1000;L.dirty=1})}
function syncRange(L,txt){const c=L.card;if(!c)return;const r=c.querySelector(".gw3-range");if(r&&document.activeElement!==r)r.value=Math.round(L.u*1000);const o=c.querySelector(".gw3-read");if(o&&txt!=null&&o.textContent!==txt)o.textContent=txt}
const stopPlay=L=>{if(L.playing){L.playing=false;playBtn(L)}};
function advance(L,dt,dur,loop){if(!L.playing)return;L.u+=dt/dur;if(L.u>=1){if(loop)L.u-=1;else{L.u=1;L.playing=false;playBtn(L)}}L.dirty=1}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
/* country outlines: the app's own map features (projFeatures(), properties.c = ISO code) */
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
function polysOf(f){if(!f||!f.geometry)return[];const P=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.type==="MultiPolygon"?f.geometry.coordinates:[];
 return P.map(c=>({type:"Polygon",coordinates:c})).filter(p=>{const a=d3.geoArea(p);p.a=a;return a>0&&a<2*Math.PI})}
const bigPoly=f=>polysOf(f).sort((a,b)=>b.a-a.a)[0]||null;
/* move a shape on the sphere without changing its size: its centre c goes to t (as psDragGeom in index.html does) */
function mover(c,t){const r0=d3.geoRotation([-c[0],-c[1]]),r1=d3.geoRotation([-t[0],-t[1]]);return p=>r1.invert(r0(p))}
const moveGeom=(G0,c,t)=>{const mv=mover(c,t);return{type:"Polygon",coordinates:G0.coordinates.map(r=>r.map(mv))}};
/* a repeatable random number list, so the same dots come back every time */
function rng(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* n points spread evenly by area inside a country's bigger pieces (pieces under 1% of it are skipped) */
function sampleIn(f,n,seed){const R=rng(seed),P=polysOf(f),tot=P.reduce((s,p)=>s+p.a,0),out=[];P.filter(p=>p.a>tot*.01).forEach(p=>{
  const want=Math.round(n*p.a/tot),b=d3.geoBounds(p);let x0=b[0][0],x1=b[1][0];if(x1<x0)x1+=360;const s0=Math.sin(b[0][1]*DEG),s1=Math.sin(b[1][1]*DEG);
  for(let k=0,tries=0;k<want&&tries<want*60;tries++){let lon=x0+R()*(x1-x0);if(lon>180)lon-=360;const pt=[lon,Math.asin(s0+R()*(s1-s0))/DEG];if(d3.geoContains(p,pt)){out.push(pt);k++}}});
 for(let i=out.length-1;i>0;i--){const j=Math.floor(R()*(i+1)),t=out[i];out[i]=out[j];out[j]=t}return out}

/* ======================================================================== 1. Rivers, mountains and rulers
   Kind of each border and who set it: CIA World Factbook country entries ("Boundaries"/"Land boundaries") and the
   treaties named. France–Spain along the Pyrenees: Treaty of the Pyrenees, 1659. US–Mexico along the Rio Grande: Treaty
   of Guadalupe Hidalgo, 1848; the river makes 1,254 miles (2,018 km) of the border (International Boundary and Water
   Commission). Egypt–Sudan along 22° N: Anglo-Egyptian agreement of 1899; about 1,200 km (the stop's own figure).
   US–Canada along 49° N: Convention of 1818 (Lake of the Woods to the Rockies) and Oregon Treaty, 1846 (on to the
   Pacific). Chile–Argentina along the Andes: Boundary Treaty of 1881 ("the highest peaks that divide the waters").
   Egypt–Libya along 25° E: Italian–Egyptian agreement of 1925. Namibia–Botswana along 20° E and 21° E: Anglo-German
   (Heligoland–Zanzibar) Agreement of 1890. Romania–Bulgaria along the Danube: Treaty of Berlin, 1878. Nepal–China along
   the Himalaya: China–Nepal Boundary Treaty of 1961; the line crosses the summit of Everest. Zambia–Zimbabwe along the
   Zambezi (over Victoria Falls and through Lake Kariba): set as the boundary between the British territories of Northern
   and Southern Rhodesia (1911 order in council; Zambia and Zimbabwe kept it). The lines are traced roughly; the
   Pyrenees, Rio Grande, 22° N, 25° E and 49° N lines are the stop's own. */
const BKIND={river:{n:"River",c:"#2f8fe0",ic:"〰"},mtn:{n:"Mountains",c:"#8a5a2b",ic:"⛰"},ruler:{n:"Ruler line",c:"#d23c5a",ic:"📏"}};
const BORD=[
 {n:"France and Spain",k:"mtn",C:[[-1.8,43.35],[-0.7,42.85],[.7,42.7],[1.7,42.5],[3.2,42.43]],t:"The crest of the Pyrenees, agreed in the Treaty of the Pyrenees in 1659. A mountain wall is easy to see, and easy to defend."},
 {n:"The United States and Mexico",k:"river",C:[[-106.5,31.8],[-104.5,29.5],[-103,29],[-101.5,29.8],[-99.5,27.5],[-97.4,25.9]],t:"The Rio Grande, since 1848: about 2,000 km of the border is the river. Rivers wander, so the two countries have had to swap little pieces of land when it moved."},
 {n:"Egypt and Sudan",k:"ruler",C:[[25,22],[31.3,22],[36.9,22]],t:"The 22nd parallel, drawn by Britain and Egypt in 1899: about 1,200 km as straight as a ruler, across empty desert."},
 {n:"Canada and the United States",k:"ruler",C:[[-123.3,49],[-95.15,49]],t:"The 49th parallel, agreed in 1818 and carried to the Pacific in 1846, when the prairies were barely mapped. It runs straight for over 2,000 km."},
 {n:"Chile and Argentina",k:"mtn",C:[[-67.2,-22.8],[-68.3,-24.5],[-68.6,-26.5],[-69,-28],[-69.8,-30],[-70,-32.6],[-70.1,-34],[-70.6,-36],[-71.1,-38],[-71.6,-40],[-71.9,-42],[-71.7,-44],[-71.8,-46],[-72.6,-48.5],[-73.4,-50],[-72.3,-51]],t:"The Andes, by the treaty of 1881: the line follows the highest peaks that split the rivers flowing west to the Pacific from those flowing east."},
 {n:"Egypt and Libya",k:"ruler",C:[[25,22],[25,29],[25,31.6]],t:"The 25th meridian east, agreed between Italy (then ruling Libya) and Egypt in 1925: a straight line north–south through the Sahara."},
 {n:"Namibia and Botswana",k:"ruler",C:[[20,-24.75],[20,-22],[21,-22],[21,-18.3]],t:"Lines of longitude, 20° and 21° east, agreed between Britain and Germany in 1890 across the Kalahari, which neither had mapped."},
 {n:"Romania and Bulgaria",k:"river",C:[[22.68,44.22],[22.98,43.82],[23.6,43.8],[24.4,43.72],[24.9,43.7],[25.4,43.63],[25.95,43.86],[26.5,44.05],[27.27,44.12]],t:"The Danube, since the Treaty of Berlin in 1878. A wide river is a clear line, and for a long time only ferries crossed it here."},
 {n:"Nepal and China",k:"mtn",C:[[81.03,30.2],[81.6,30.42],[82.2,30.05],[83,29.3],[83.6,29.2],[84.2,28.9],[85,28.6],[85.4,28.3],[86,28.1],[86.93,27.99],[87.6,27.85],[88.1,27.88]],t:"The crest of the Himalaya, settled by treaty in 1961. The line runs over the top of Mount Everest, so half the summit is in each country."},
 {n:"Zambia and Zimbabwe",k:"river",C:[[25.26,-17.79],[25.86,-17.93],[26.6,-17.95],[27.4,-17.3],[28,-16.9],[28.76,-16.52],[29.6,-15.85],[30.42,-15.62]],t:"The Zambezi, over Victoria Falls and through Lake Kariba. It was the line between two British colonies, and the new countries kept it."}];
const SORTB={tour:"borders",title:"Rivers, mountains and rulers",
 tip:"A border glows on the globe. Is it a river, mountains or a ruler line? Tap your answer (or tap any border to pick it).",
 card:()=>'<div class="gw3-row gw3-btns">'+Object.keys(BKIND).map(k=>'<button type="button" class="gw3-btn gw3-kind" data-k="'+k+'"><i style="background:'+BKIND[k].c+'"></i>'+BKIND[k].ic+" "+BKIND[k].n+"</button>").join("")+'</div><div class="gw3-score"></div>',
 init(L){L.ans={};L.cur=0;L.t=0;L.lines=BORD.map((b,i)=>{const R=route(b.C,.2),gg=svgEl(L.clip,"g",{class:"gw3-bl"});
   const hit=svgEl(gg,"path",{class:"gw3-bhit"}),sh=svgEl(gg,"path",{class:"gw3-bsh"}),p=svgEl(gg,"path",{class:"gw3-bline"});
   hit.addEventListener("pointerdown",e=>{e.stopPropagation();e.preventDefault();this.pick(L,i)});quiet(hit);return{b,R,gg,p,sh,hit,mid:at(R,.5).ll,t:tag(L,"gw3-small")}});
  L.bub=tag(L,"gw3-bub")},
 pick(L,i){L.cur=i;L._said="";const o=L.lines[i];turnTo(L,o.mid,2.2);L.dirty=1},
 wire(L){L.card.querySelectorAll(".gw3-kind").forEach(b=>b.onclick=()=>{const i=L.cur,o=BORD[i];if(L.ans[i])return;L.ans[i]={k:b.dataset.k,ok:b.dataset.k===o.k};L.just=i;L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L||!L.el.isConnected)return;const n=BORD.findIndex((x,j)=>!L.ans[j]);if(n>=0)this.pick(L,n)},2600)});
  setTimeout(()=>{if(L&&L.el.isConnected&&L.D===this)this.pick(L,0)},900)},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;const o=L.lines[L.cur];if(o&&!L.ans[L.cur])o.p.style.strokeWidth=(5+2.5*Math.sin(L.t*5)).toFixed(1)},
 draw(L){let right=0,done=0;L.lines.forEach((o,i)=>{const a=L.ans[i],d=pathOf(L,o.R.P),cur=i===L.cur;o.p.setAttribute("d",d);o.sh.setAttribute("d",d);o.hit.setAttribute("d",d);
   o.p.style.stroke=a?BKIND[o.b.k].c:cur?"#ffd166":"rgba(255,255,255,.75)";if(!(cur&&!a))o.p.style.strokeWidth=a?"4.5":"3";o.p.style.strokeDasharray=a||cur?"":"6 5";o.gg.classList.toggle("gw3-curb",cur);
   if(a){done++;if(a.ok)right++}putTag(L,o.t,a&&!cur?proj(L,o.mid,1):null,a?(a.ok?"✓ ":"✗ ")+BKIND[o.b.k].ic+" "+esc(o.b.n):null,-30)});
  const o=L.lines[L.cur],a=L.ans[L.cur];putTag(L,L.bub,proj(L,o.mid,1),a?(a.ok?"Right! ":"No: ")+BKIND[o.b.k].ic+" "+BKIND[o.b.k].n:esc(o.b.n)+": river, mountains or ruler?",-16);
  if(L.card){L.card.querySelectorAll(".gw3-kind").forEach(b=>{b.disabled=!!a;b.classList.toggle("gw3-right",!!a&&b.dataset.k===o.b.k);b.classList.toggle("gw3-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   const rl=BORD.filter((b,i)=>L.ans[i]&&b.k==="ruler").length;
   setHTML(L.card.querySelector(".gw3-score"),'<div class="gw3-dots">'+BORD.map((b,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"gw3-ok":"gw3-no":"")+(i===L.cur?" gw3-at":"")+'" title="'+esc(b.n)+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+" sorted · "+(BORD.length-done)+" to go</span>")}
  if(done===BORD.length)say(L,"All ten sorted: "+right+" right","Three rivers, three mountain ranges and four ruler lines. The rivers and mountains were old frontiers people could see and defend. Every ruler line was drawn by faraway powers, across deserts and prairies they had hardly mapped, in 1818, 1890, 1899 and 1925.");
  else if(a)say(L,(a.ok?"Right: ":"Not quite: ")+BKIND[o.b.k].n.toLowerCase(),o.b.t);
  else say(L,o.b.n,"Look at the glowing line. Does it wiggle like a river, follow a range of peaks, or run dead straight?")}};

/* ======================================================================== 2. The longest river?
   Lengths: Encyclopaedia Britannica, "Nile River" (about 4,132 miles, 6,650 km) and "Amazon River" (about 4,000 miles,
   6,400 km). The Brazilian National Institute for Space Research (INPE) study of 2007, as reported at the time: Amazon
   6,992 km (from the Apurímac headwaters near Nevado Mismi, Peru), Nile 6,852 km. The drawn lines are the app's own river
   lines (ALLMAPS_RIVERS: the Kagera, White Nile and Nile; the Ucayali and Amazonas), joined source to sea and thinned to
   one point every ~35 km, with the delta and estuary ends added (Cairo to Rosetta; past Macapá). Those generalised lines
   are shorter than the real, winding rivers, so the boats move in proportion: a boat that has gone x km is drawn x/length
   of the way along its line. Places on the way (Lake Victoria, Khartoum, Aswan, Iquitos, Manaus) are put where the line
   passes them, so their km counts are approximate. The Sudd (White Nile) and the Blue Nile's water: the stop's own text. */
const NILE=[[29.3,-2.3],[29.59,-2.98],[29.9,-3.09],[30.01,-3.36],[30.39,-3.09],[30.44,-2.77],[30.77,-2.46],[30.88,-2.14],[30.81,-1.56],[30.51,-1.21],[30.67,-1.05],[31.01,-1.14],[31.41,-1.24],[31.65,-1],[32.29,-.79],[32.74,-.55],[33.13,.16],[33.19,.43],[32.89,1.31],[32.61,1.45],[32.24,1.67],[32.28,1.83],[32.3,2.2],[31.95,2.33],[31.37,2.19],[31.52,2.48],[31.39,2.8],[31.62,3.36],[31.94,3.53],[31.59,4.1],[31.52,4.61],[31.77,5.3],[31.77,5.7],[31.46,6.36],[31.15,6.83],[30.77,7.15],[30.55,7.52],[30.51,7.88],[30.33,8.14],[30.34,8.48],[30.22,8.82],[30.32,9.15],[30.46,9.49],[30.85,9.52],[31.35,9.37],[31.64,9.5],
 /* from Malakal north (thinned from the same data) */[31.7,10.3],[32.05,11.1],[32.4,12.2],[32.6,13.2],[32.55,14.5],[32.53,15.6],[32.9,16.6],[33.6,17.7],[33.95,18.2],[33.7,18.6],[32.9,19.3],[32.2,19.0],[31.6,18.4],[31.0,18.3],[30.5,19.0],[30.4,19.9],[30.6,20.8],[31.2,21.8],[31.9,22.6],[32.6,23.5],[32.9,24.1],[32.75,25.4],[32.4,25.9],[31.9,26.2],[31.4,27.1],[30.9,27.8],[30.8,28.6],[31.15,29.6],[31.16,30.15],[31.0,30.55],[30.7,31.0],[30.42,31.46]];
const AMAZ=[[-71.69,-15.52],[-71.67,-15.34],[-72.2,-14.2],[-72.9,-13.4],[-73.5,-12.6],[-73.9,-11.8],[-74.1,-11.1],[-73.9,-10.5],[-74.3,-9.6],[-74.6,-8.4],[-74.4,-7.6],[-74.6,-6.6],[-74.3,-5.6],[-73.75,-4.6],[-73.25,-3.75],[-72.5,-3.5],[-71.8,-3.9],[-70.9,-4.0],[-70.0,-4.3],[-69.4,-4.1],
 [-68.6,-3.6],[-67.9,-3.2],[-67.26,-2.62],[-66.92,-2.73],[-66.53,-2.43],[-66.21,-2.46],[-65.9,-2.49],[-65.56,-2.59],[-65.29,-2.75],[-64.91,-3.13],[-64.46,-3.52],[-63.85,-3.84],[-63.45,-3.87],[-63.15,-4.07],[-62.86,-3.94],[-62.54,-3.85],[-61.89,-3.95],[-61.47,-3.68],[-61.04,-3.61],[-60.75,-3.4],[-60.28,-3.3],[-59.96,-3.24],[-59.58,-3.11],[-58.98,-3.27],[-58.55,-3.21],[-58.18,-3.12],[-57.88,-2.78],[-57.61,-2.48],[-57.24,-2.53],[-56.76,-2.58],[-56.28,-2.21],[-55.98,-2],[-55.67,-1.93],[-55.38,-2.08],[-55.05,-2.17],[-54.69,-2.18],[-54.47,-2.44],[-54.06,-2.27],[-53.84,-1.96],[-53.36,-1.84],[-52.87,-1.61],[-52.66,-1.55],[-51.6,-.9],[-51.1,-.1],[-50.2,.3]];
const RMEAS=[{n:"Atlases",src:"Britannica",nile:6650,amz:6400},{n:"2007 Brazilian study",src:"INPE",nile:6852,amz:6992}];
const RSTOP={nile:[{ll:[33.19,.43],n:"Lake Victoria",t:"Out of Lake Victoria, the White Nile’s famous source. But this boat set off higher up, on the Kagera in the hills of Rwanda and Burundi."},
  {ll:[30.5,8.2],n:"The Sudd",t:"The Sudd, a vast swamp: the White Nile loses about half its water here to the sun."},
  {ll:[32.53,15.6],n:"Khartoum",t:"Khartoum: the Blue Nile joins, bringing most of the water, down from Ethiopia’s highlands."},
  {ll:[32.9,24.1],n:"Aswan",t:"Aswan and Egypt: now the Nile crosses the Sahara with no rivers joining at all."}],
 amz:[{ll:[-73.25,-3.75],n:"Iquitos",t:"Iquitos, the biggest city in the world you cannot reach by road. The Ucayali has met the Marañón: from here it is the Amazon."},
  {ll:[-60,-3.2],n:"Manaus",t:"Manaus: the dark Rio Negro joins. Below here the Amazon can be over 10 km wide in the wet season."},
  {ll:[-51.1,-.1],n:"The mouth",t:"The mouth is so wide that where the river ends is itself a question: which channel do you follow, and where does the river become sea?"}]};
let RVR=null;const rvR=()=>RVR||(RVR={nile:route(NILE,.1),amz:route(AMAZ,.1)});
const BOAT='<path d="M-11 2 L11 2 L7 8 L-7 8 Z" fill="#fff4dc" stroke="#13294b" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 2 L0 -13 L9 0 Z" fill="#fff" stroke="#13294b" stroke-width="1.4" stroke-linejoin="round"/>';
const LONGR={tour:"rivers",title:"The longest river?",dur:20,follow:1,
 tip:"Race them: drag either boat downstream (or press ▶). Both boats travel the same distance from their sources. Tap 👁 to watch the other river.",
 card:()=>playerHTML("Distance from the source (km)","0 km")+'<div class="gw3-race"></div><div class="gw3-row gw3-btns">'+RMEAS.map((m,i)=>'<button type="button" class="gw3-btn gw3-meas" data-i="'+i+'">'+esc(m.n)+"</button>").join("")+"</div>",
 init(L){const R=rvR();L.m=0;L.u=0;L.max=7000;L.foc="nile";
  L.r=["nile","amz"].map(k=>{const o={k,R:R[k],line:svgEl(L.clip,"path",{class:"gw3-rv"}),done:svgEl(L.clip,"path",{class:"gw3-rvdone gw3-"+k}),
    end:svgEl(L.clip,"g",{class:"gw3-noev"},'<circle r="6" fill="#13294b" stroke="#fff" stroke-width="2"/>'),src:svgEl(L.clip,"g",{class:"gw3-noev"},'<circle r="5" fill="#fff" stroke="#13294b" stroke-width="2"/>'),
    b:svgEl(L.clip,"g",{class:"gw3-grab",tabindex:"0","aria-label":(k==="nile"?"Nile":"Amazon")+" boat: drag it downstream"}),t:tag(L,"gw3-bub"+(k==="amz"?" gw3-green":"")),st:tag(L,"gw3-small")};
   svgEl(o.b,"circle",{r:22,class:"gw3-hit"});svgEl(o.b,"g",{},BOAT);
   draggable(L,o.b,(x,y)=>{const f=nearestU(L,o.R,x,y,this.frac(L,k));L.u=clamp(f*this.len(L,k)/L.max,0,1)},()=>{stopPlay(L);L.foc=k});return o});
  L.hint=tag(L,"gw3-hint")},
 len(L,k){return RMEAS[L.m][k]},
 frac(L,k){return clamp(L.u*L.max/this.len(L,k),0,1)},
 wire(L){L.card.querySelectorAll(".gw3-meas").forEach(b=>b.onclick=()=>{L.m=+b.dataset.i;L._said="";L.dirty=1});
  /* the two rivers are a third of the globe apart: 👁 turns the globe to the other boat, and it is followed from then on */
  L.card.addEventListener("click",e=>{const w=e.target.closest&&e.target.closest(".gw3-watch");if(!w)return;L.foc=w.dataset.k;const o=L.r.find(r=>r.k===L.foc);if(o)turnTo(L,at(o.R,this.frac(L,o.k)).ll,1.4);L.dirty=1})},
 tick(L,dt){advance(L,dt,this.dur)},
 draw(L){const d=L.u*L.max,M=RMEAS[L.m];let last=null;
  L.r.forEach(o=>{const f=this.frac(L,o.k),s=at(o.R,f);o.line.setAttribute("d",pathOf(L,o.R.P));o.done.setAttribute("d",pathOf(L,o.R.P.slice(0,s.i+1).concat([s.ll])));
   place(o.src,proj(L,o.R.P[0]));place(o.end,proj(L,o.R.P[o.R.P.length-1]));place(o.b,proj(L,s.ll),f>=1?" scale(1.25)":"");
   const nm=o.k==="nile"?"Nile":"Amazon",L0=this.len(L,o.k);putTag(L,o.t,proj(L,s.ll,1),f>=1?nm+": the sea! "+fmt(L0)+" km":nm+" · "+fmt(Math.min(d,L0))+" km",-20);
   if(o.k===L.foc)L.fll=s.ll;RSTOP[o.k].forEach(p=>{if(f>=uOf(o.R,p.ll)-.003)last=p})});
  const qn=proj(L,NILE[0],1);putTag(L,L.hint,L.u<.003&&qn?[qn[0]+18,qn[1]+6]:null,"Drag the boats downstream");
  syncRange(L,fmt(d)+" km");
  if(L.card){L.card.querySelectorAll(".gw3-meas").forEach(b=>b.classList.toggle("gw3-on",+b.dataset.i===L.m));
   const bar=(k,nm,c)=>{const L0=M[k],f=Math.min(d,L0)/7000;return'<div class="gw3-lane"><button type="button" class="gw3-watch'+(L.foc===k?" gw3-on":"")+'" data-k="'+k+'" aria-label="Watch the '+nm+'">👁</button><span>'+nm+'</span><div class="gw3-track"><i style="width:'+(f*100).toFixed(1)+"%;background:"+c+'"></i><em style="left:'+(L0/7000*100).toFixed(1)+'%"></em></div><b>'+(d>=L0?fmt(L0)+" km 🏁":fmt(d)+" km")+"</b></div>"};
   setHTML(L.card.querySelector(".gw3-race"),bar("nile","Nile","#2f8fe0")+bar("amz","Amazon","#2e9d5b")+'<div class="gw3-note">'+esc(M.n)+" ("+esc(M.src)+"): Nile "+fmt(M.nile)+" km · Amazon "+fmt(M.amz)+" km</div>")}
  const a=M.nile,b=M.amz,lo=Math.min(a,b),win=a>b?"Nile":"Amazon",lose=a>b?"Amazon":"Nile";
  if(d>=Math.max(a,b))say(L,"The "+win+" wins by "+fmt(Math.abs(a-b))+" km",L.m===0?"By the atlas figures the Nile is longer. Now switch to the 2007 Brazilian study, which followed the Amazon to a farther source in the Andes of Peru, and race again.":"Measured from the Apurímac’s farthest source, the Amazon comes out longer. Same rivers, different starting points: there is no single right answer, which is why atlases still argue.");
  else if(d>=lo)say(L,"The "+lose+" has reached the sea!","At "+fmt(lo)+" km the "+lose+" is done, and the "+win+" still has "+fmt(Math.abs(a-b))+" km to go.");
  else if(last)say(L,last.n,last.t);
  else say(L,"Two sources, one question","The Nile boat starts on the Kagera in the hills of Rwanda and Burundi; the Amazon boat high in the Andes of Peru, about 160 km from the Pacific. Both have about 6,500 km to go.")}};

/* ======================================================================== 3. The Great Lakes
   Lake levels and average retention times: US EPA and Environment Canada, "The Great Lakes: An Environmental Atlas and
   Resource Book" (3rd ed., 1995), Physical features table: elevation Superior 183 m, Michigan 176 m, Huron 176 m, Erie
   173 m, Ontario 74 m; retention time Superior 191 years, Michigan 99, Huron 22, Erie 2.6, Ontario 6. A retention time is
   a lake's volume divided by its outflow: the average time water stays. Adding them up gives a rough average journey,
   not the trip of any one drop. Niagara: Horseshoe Falls about 57 m high (Niagara Parks Commission); the rest of the
   99 m from Erie to Ontario is rapids and the gorge. The route is traced roughly along the lakes and connecting rivers. */
const GL_SUP=[[-92.1,46.75],[-90.5,47.15],[-88.5,47.55],[-86.5,47.0],[-85.0,46.75],[-84.6,46.5],[-84.35,46.5],[-84.1,46.25],[-83.9,46.05],[-83.6,45.95]];
const GL_MIC=[[-87.6,41.9],[-87.2,43.0],[-86.7,44.5],[-85.8,45.5],[-84.75,45.8],[-84.2,45.75],[-83.6,45.95]];
const GL_DOWN=[[-83.0,45.4],[-82.4,44.5],[-82.2,43.5],[-82.42,43.0],[-82.45,42.7],[-82.7,42.45],[-83.1,42.2],[-83.15,42.0],[-82.5,41.8],[-81.5,42.0],[-80.0,42.4],[-79.0,42.85],[-79.05,43.08],[-79.07,43.26],[-78.5,43.5],[-77.5,43.7],[-76.4,44.15],[-75.6,44.6],[-74.7,45.0],[-73.55,45.5],[-72.5,46.2],[-71.2,46.8],[-69.5,47.8],[-67.5,49.0],[-64.5,49.7]];
/* stretches of the trip: where each starts (a point on the route), the lake level there (m) and years spent there */
const GL_SEG=[{at:[-92.1,46.75],lake:"Superior",z:183,yr:191},{at:[-84.35,46.5],lake:"St. Marys River",z:183,riv:1},{at:[-87.6,41.9],lake:"Michigan",z:176,yr:99,mic:1},
 {at:[-83.0,45.4],lake:"Huron",z:176,yr:22},{at:[-82.42,43.0],lake:"St. Clair and Detroit rivers",z:176,riv:1},{at:[-82.5,41.8],lake:"Erie",z:173,yr:2.6},{at:[-79.0,42.85],lake:"Niagara",z:173,riv:1},
 {at:[-78.5,43.5],lake:"Ontario",z:74,yr:6},{at:[-76.4,44.15],lake:"St. Lawrence",z:74,riv:1},{at:[-64.5,49.7],lake:"The Atlantic",z:0,sea:1}];
const GLTXT={Superior:"Lake Superior: the biggest, coldest and highest of the lakes, 183 m above the sea. A drop stays here about 191 years on average.",
 Michigan:"Lake Michigan, the only one wholly in the US. Water stays about 99 years before it slips out at the Straits of Mackinac.",
 "St. Marys River":"Out of Superior down the St. Marys River: the rapids at Sault Ste. Marie drop about 7 m, and ships use locks.",
 Huron:"Lake Huron, at the same level as Michigan: the two are really one lake joined at Mackinac. About 22 years here.",
 "St. Clair and Detroit rivers":"Down the St. Clair River, across little Lake St. Clair and down the Detroit River, past Detroit and Windsor.",
 Erie:"Lake Erie, the shallowest: its water is replaced in only about 2.6 years.",
 Niagara:"Niagara! Between Erie and Ontario the water falls about 99 m, 57 m of it in one leap over the Horseshoe Falls.",
 Ontario:"Lake Ontario, 74 m above the sea. About 6 years here.",
 "St. Lawrence":"Out along the St. Lawrence, past Montreal and Quebec City, sinking the last 74 m to the sea.",
 "The Atlantic":"The Gulf of St. Lawrence and the Atlantic. The drop has reached the sea."};
let GLR={};const glR=m=>GLR[m]||(GLR[m]=(()=>{const C=(m?GL_MIC:GL_SUP).concat(GL_DOWN),R=route(C,.05);R.seg=GL_SEG.filter(s=>m?!(s.lake==="Superior"||s.lake==="St. Marys River"):!s.mic).map(s=>Object.assign({u:uOf(R,s.at)},s));return R})());
const DROPI='<path d="M0 -12 C 6 -4 8 0 8 3 A8 8 0 0 1 -8 3 C -8 0 -6 -4 0 -12 Z" fill="#2f8fe0" stroke="#fff" stroke-width="2"/><circle cx="-2.5" cy="1" r="2" fill="#fff" opacity=".8"/>';
const GLAKES={tour:"lakes",title:"The Great Lakes",dur:24,follow:1,
 tip:"Drag the water drop downstream (or press ▶) from Lake Superior to the sea. Watch it fall and count the years.",
 card:()=>'<div class="gw3-row gw3-btns"><button type="button" class="gw3-btn gw3-start" data-m="0">Start in Superior</button><button type="button" class="gw3-btn gw3-start" data-m="1">Start in Michigan</button></div>'+playerHTML("How far the drop has gone","Superior")+'<div class="gw3-stair"></div>',
 init(L){L.m=0;L.u=0;L.trail=svgEl(L.clip,"path",{class:"gw3-glt"});L.d=svgEl(L.clip,"g",{class:"gw3-grab",tabindex:"0","aria-label":"Water drop: drag it downstream"});svgEl(L.d,"circle",{r:22,class:"gw3-hit"});svgEl(L.d,"g",{},DROPI);
  L.bub=tag(L,"gw3-bub");L.hint=tag(L,"gw3-hint");draggable(L,L.d,(x,y)=>{L.u=nearestU(L,glR(L.m),x,y,L.u)},()=>stopPlay(L))},
 wire(L){L.card.querySelectorAll(".gw3-start").forEach(b=>b.onclick=()=>{L.m=+b.dataset.m;L.u=0;L.playing=false;playBtn(L);L._said="";L.dirty=1})},
 tick(L,dt){advance(L,dt,this.dur)},
 /* where the drop is: which stretch, how far through it, and the years so far */
 state(L){const R=glR(L.m),S=R.seg;let k=0;for(let i=0;i<S.length;i++)if(L.u>=S[i].u-.0005)k=i;let yrs=0;
  S.forEach((s,i)=>{if(!s.yr)return;const e=i+1<S.length?S[i+1].u:1;yrs+=s.yr*clamp((L.u-s.u)/((e-s.u)||1),0,1)});return{R,S,k,s:S[k],yrs}},
 draw(L){const st=this.state(L),R=st.R,s=at(R,L.u);L.fll=s.ll;L.trail.setAttribute("d",pathOf(L,R.P.slice(0,s.i+1).concat([s.ll])));place(L.d,proj(L,s.ll));
  const q=proj(L,s.ll,1);putTag(L,L.bub,q,esc(st.s.lake)+" · "+(st.yrs<10?st.yrs.toFixed(1):fmt(st.yrs))+" years",-22);putTag(L,L.hint,L.u<.003&&q?[q[0]+20,q[1]+4]:null,"Drag me downstream ⟶");
  syncRange(L,st.s.lake);
  if(L.card){L.card.querySelectorAll(".gw3-start").forEach(b=>b.classList.toggle("gw3-on",+b.dataset.m===L.m));
   /* the staircase: each stretch a step at its level, the drop drawn on it */
   const W=300,H=96,x=u=>8+u*(W-16),y=z=>12+(1-z/190)*(H-30);let dd="",lab="";
   st.S.forEach((sg,i)=>{const e=i+1<st.S.length?st.S[i+1].u:1;if(sg.sea)return;const z1=i+1<st.S.length?st.S[i+1].z:0;
    dd+=(i?"L":"M")+x(sg.u).toFixed(1)+" "+y(sg.z).toFixed(1)+"L"+x(e).toFixed(1)+" "+y(sg.riv?z1:sg.z).toFixed(1);
    if(sg.yr)lab+='<text x="'+x((sg.u+e)/2).toFixed(1)+'" y="'+(y(sg.z)-4).toFixed(1)+'" text-anchor="middle">'+esc(sg.lake)+" "+sg.z+" m</text>"});
   const fz=(()=>{const i=st.k,sg=st.S[i],e=i+1<st.S.length?st.S[i+1].u:1,z1=i+1<st.S.length?st.S[i+1].z:0;return sg.riv?sg.z+(z1-sg.z)*clamp((L.u-sg.u)/((e-sg.u)||1),0,1):sg.z})();
   const svg='<svg viewBox="0 0 '+W+" "+H+'" class="gw3-stsvg"><path d="'+dd+"L"+x(1)+" "+y(0)+"L"+x(1)+" "+H+"L"+x(0)+" "+H+'Z" class="gw3-stfill"/><path d="'+dd+'" class="gw3-stline"/><line x1="0" x2="'+W+'" y1="'+y(0)+'" y2="'+y(0)+'" class="gw3-sea0"/><text x="'+(W-4)+'" y="'+(y(0)-3)+'" text-anchor="end">sea level</text>'+lab+
    '<g transform="translate('+x(L.u).toFixed(1)+","+(y(fz)-7).toFixed(1)+') scale(.75)">'+DROPI+"</g></svg>";
   const tot=st.S.reduce((a,b)=>a+(b.yr||0),0);
   setHTML(L.card.querySelector(".gw3-stair"),'<div class="gw3-bartitle">Height above the sea, from the lake to the ocean</div>'+svg+'<div class="gw3-yrs"><span>Years on the way, on average</span><b>'+(st.yrs<10?st.yrs.toFixed(1):fmt(st.yrs))+"</b><small>of about "+fmt(tot)+"</small></div>")}
  if(st.s.sea)say(L,"The sea, after about "+fmt(st.yrs)+" years",L.m?"From Lake Michigan the trip takes about 130 years: Michigan’s 99, then Huron, Erie and Ontario. Superior is slower still: try starting there.":"About 220 years from Duluth to the ocean, nearly 200 of them in Lake Superior alone. Lakes this big are slow to fill and slow to clean: what goes into them stays a very long time.");
  else say(L,st.s.lake==="Superior"&&L.u<.003?"A drop of rain lands on Lake Superior":esc(st.s.lake),GLTXT[st.s.lake]||"")}};

/* ======================================================================== 4. The Ganges plain and Bangladesh
   Bangladesh: 169,828,911 people (Bangladesh Bureau of Statistics, Population and Housing Census 2022) on 147,570 km²
   (BBS), about 1,150 per km². United States: 331,449,281 (US Census Bureau, 2020 Census), total area 3,796,742 sq mi,
   9,833,520 km² (Census Bureau). Canada: 36,991,981 (Statistics Canada, 2021 Census), 9,984,670 km² (Statistics Canada).
   Australia: 25,422,788 (Australian Bureau of Statistics, 2021 Census), 7,688,287 km² (Geoscience Australia). Iowa:
   145,746 km² (56,272 sq mi), 3,190,369 people (US Census Bureau, 2020). World: about 8.2 billion in 2024 (United
   Nations, World Population Prospects 2024). One dot is 10 million people, spread evenly at random over the country:
   the dots show how many, not where people live. Outlines are the app's own map features. */
const BD={pop:169828911,area:147570};const DENS_BD=BD.pop/BD.area;const WORLD=8.2e9;
const PCTRY=[{c:"us",n:"United States",pop:331449281,area:9833520,at:[-93.5,42.0],look:[-98,40],tag:[-112,47],zoom:1.6,spot:"Iowa",spotT:"Iowa is almost exactly the same size as Bangladesh, 145,746 km², and has 3.2 million people. Bangladesh has 170 million."},
 {c:"ca",n:"Canada",pop:36991981,area:9984670,at:[-106,54],look:[-100,57],tag:[-115,64],zoom:1.4},
 {c:"au",n:"Australia",pop:25422788,area:7688287,at:[134,-25],look:[134,-26],tag:[124,-19],zoom:1.7}];
const PERDOT=1e7,DOTMAX=1250;
const CROWD={tour:"pop",title:"The Ganges plain and Bangladesh",
 tip:"Pick a country, then slide it up to Bangladesh’s crowding. One dot is 10 million people. Drag Bangladesh around too.",
 card:()=>'<div class="gw3-row gw3-btns">'+PCTRY.map((p,i)=>'<button type="button" class="gw3-btn gw3-ctry" data-i="'+i+'">'+esc(p.n)+"</button>").join("")+'</div><div class="gw3-row gw3-sl2"><span>As now</span><input type="range" class="gw3-crowd" min="0" max="1000" step="1" value="0" aria-label="How crowded"><span>As Bangladesh</span></div><div class="gw3-big"></div>',
 init(L){L.ci=-1;L.s=0;L.dots={};L.ctry=svgEl(L.clip,"g",{class:"gw3-noev"});L.shift=svgEl(L.clip,"g",{});L.cOut=svgEl(L.shift,"path",{class:"gw3-cout"});
  L.bd=svgEl(L.shift,"path",{class:"gw3-bd gw3-grab",tabindex:"0","aria-label":"Bangladesh at true size: drag it anywhere"});L.bdDots=svgEl(L.clip,"g",{class:"gw3-noev"});
  const f=feat("bd");L.bdG=f?bigPoly(f):null;L.bdC=L.bdG?d3.geoCentroid(L.bdG):[90.3,23.8];L.bdAt=L.bdC.slice();L.bdPts=f?sampleIn(f,17,7):[];
  L.bdT=tag(L,"gw3-small gw3-bdt");L.cT=tag(L,"gw3-bub");L.hint=tag(L,"gw3-hint");
  let off=[0,0];draggable(L,L.bd,(x,y)=>{const ll=unproj(L,x-off[0],y-off[1]);if(ll){L.bdAt=ll;L.moved=1}},(x,y)=>{const q=proj(L,L.bdAt);off=q?[x-q[0],y-q[1]]:[0,0]},
   f=>{L.bdAt=[L.bdAt[0]+f*2,L.bdAt[1]];L.moved=1})},
 choose(L,i){L.ci=i;L.s=0;L._said="";const P=PCTRY[i];if(!L.dots[P.c]){const f=feat(P.c);L.dots[P.c]=f?sampleIn(f,DOTMAX,11+i):[]}
  L.bdAt=P.at.slice();L.moved=0;const r=L.card&&L.card.querySelector(".gw3-crowd");if(r)r.value=0;turnTo(L,P.look,P.zoom);L.dirty=1},
 wire(L){L.card.querySelectorAll(".gw3-ctry").forEach(b=>b.onclick=()=>this.choose(L,+b.dataset.i));
  const r=L.card.querySelector(".gw3-crowd");r.addEventListener("input",()=>{if(L.ci<0)this.choose(L,0);L.s=r.value/1000;L.dirty=1})},
 dens(L){const P=PCTRY[L.ci],d0=P.pop/P.area;return d0*Math.pow(DENS_BD/d0,L.s)},
 draw(L){const G=g();L.shift.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");
  if(L.bdG){const gm=moveGeom(L.bdG,L.bdC,L.bdAt);L.bd.setAttribute("d",geoD(gm));const mv=mover(L.bdC,L.bdAt);let h="";L.bdPts.forEach(p=>{const q=proj(L,mv(p));if(q)h+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3.2" class="gw3-bddot"/>'});L.bdDots.innerHTML=h;
   const qb=proj(L,L.bdAt,1);putTag(L,L.bdT,qb,"Bangladesh · 170 million",18);putTag(L,L.hint,!L.moved&&L.ci<0&&qb?[qb[0]+30,qb[1]-30]:null,"Drag me anywhere ⟶")}
  let pop=0;if(L.ci>=0){const P=PCTRY[L.ci],d=this.dens(L);pop=d*P.area;const n=Math.min(DOTMAX,Math.round(pop/PERDOT)),pts=L.dots[P.c]||[];let h="";
   for(let i=0;i<Math.min(n,pts.length);i++){const q=proj(L,pts[i]);if(q)h+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="2.6"/>'}L.ctry.innerHTML='<g class="gw3-pdots">'+h+"</g>";
   L.cOut.setAttribute("d",geoD(feat(P.c)));putTag(L,L.cT,proj(L,P.tag,1),esc(P.n)+" · "+(pop>=1e9?(pop/1e9).toFixed(1)+" billion":fmt(pop/1e6)+" million"),-30)}
  else{L.ctry.innerHTML="";L.cOut.setAttribute("d","");putTag(L,L.cT,null)}
  if(!L.card)return;L.card.querySelectorAll(".gw3-ctry").forEach(b=>b.classList.toggle("gw3-on",+b.dataset.i===L.ci));
  const r=L.card.querySelector(".gw3-crowd");if(r&&document.activeElement!==r)r.value=Math.round(L.s*1000);
  if(L.ci<0){setHTML(L.card.querySelector(".gw3-big"),'<div class="gw3-note">Bangladesh: '+fmt(DENS_BD)+" people per km², countryside included. Its 17 dots fit in that small outline.</div>");
   say(L,"Pick a country to fill","Bangladesh is about the size of Iowa, yet it has more people than Russia. How many would a big country hold if it were as crowded?");return}
  const P=PCTRY[L.ci],d=this.dens(L),w=Math.min(1,pop/(WORLD*1.45));
  setHTML(L.card.querySelector(".gw3-big"),'<div class="gw3-bign"><b>'+(pop>=1e9?(pop/1e9).toFixed(2)+" billion":fmt(pop/1e6)+" million")+"</b><span>people at "+fmt(d)+" per km²</span></div>"+
   '<div class="gw3-track gw3-wtrack"><i style="width:'+(w*100).toFixed(1)+'%"></i><em style="left:'+(WORLD/(WORLD*1.45)*100).toFixed(1)+'%"></em></div><div class="gw3-note">The line is everyone alive today, about 8.2 billion.</div>');
  if(L.s<.01)say(L,P.n+" today: "+fmt(P.pop/1e6)+" million people",(P.spot?P.spotT+" ":"")+"Now slide it up to Bangladesh’s crowding.");
  else if(pop>WORLD)say(L,"More than the whole world!","As crowded as Bangladesh, "+P.n+" would hold "+(pop/1e9).toFixed(1)+" billion people: more than everyone alive today, about 8.2 billion. That is how crowded the Ganges delta is, villages almost shoulder to shoulder on rich river silt.");
  else say(L,"Filling up…","At "+fmt(d)+" people per km², "+P.n+" would hold "+(pop/1e9>=1?(pop/1e9).toFixed(1)+" billion":fmt(pop/1e6)+" million")+" people. Keep going.")}};

/* ======================================================================== 5. Where does the rain go? (Mountains and rivers)
   Where each city's rain ends up: USGS "Watersheds and drainage basins" and the National Atlas of the United States
   (major river basins), Natural Resources Canada, Atlas of Canada (drainage basins: Hudson Bay, Arctic, Pacific).
   Denver: South Platte, Platte, Missouri, Mississippi. Pittsburgh: the Ohio, then the Mississippi. Salt Lake City: the
   Jordan River into the Great Salt Lake, in the Great Basin, which has no outlet to the sea (USGS). Boise: Boise River,
   Snake, Columbia. Calgary: Bow, South Saskatchewan, Saskatchewan, Lake Winnipeg, Nelson, Hudson Bay. Yellowknife: Great
   Slave Lake, Mackenzie, Beaufort Sea (Arctic Ocean). Chicago: the Chicago River was reversed in 1900 through the
   Sanitary and Ship Canal into the Des Plaines and Illinois rivers and the Mississippi (Metropolitan Water Reclamation
   District of Greater Chicago); before that it ran into Lake Michigan. Phoenix: Salt, Gila and Colorado rivers to the Gulf
   of California; since the 1960s the Colorado has seldom reached the sea, its water used up on the way (US Bureau of
   Reclamation; the 2014 "pulse flow" briefly reconnected it). The Mississippi basin drains about 41% of the lower 48
   states (the stop's "about 40%"; National Park Service). Routes are traced roughly along the rivers. */
const SEAS={pac:{n:"Pacific",c:"#2e9d5b"},gulf:{n:"Gulf of Mexico",c:"#2f8fe0"},hud:{n:"Hudson Bay",c:"#7a5cc2"},arc:{n:"Arctic Ocean",c:"#5fb7d6"},none:{n:"Never reaches the sea",c:"#c28a2e"}};
const MISS_LOW=[[-90.2,38.8],[-89.5,37.0],[-90.0,35.1],[-91.1,33.0],[-91.4,31.0],[-90.1,29.95],[-89.4,29.0]];
const RAIN=[
 {n:"Denver",a:"gulf",C:[[-104.99,39.74],[-104.0,40.4],[-102.6,41.0],[-100.8,41.1],[-98.4,40.9],[-96.6,41.0],[-95.88,41.05],[-95.0,39.7],[-94.6,39.1],[-93.0,38.8],[-91.5,38.7]].concat(MISS_LOW),
  t:"Down the South Platte, the Platte and the Missouri into the Mississippi, and out into the Gulf of Mexico. Rain on the east side of the Rockies goes east."},
 {n:"Salt Lake City",a:"none",C:[[-111.89,40.76],[-112.0,40.9],[-112.5,41.1]],t:"Into the Great Salt Lake, and no farther. The Great Basin has no river out to the sea: water only leaves by drying up, which is why the lake is salty."},
 {n:"Boise",a:"pac",C:[[-116.2,43.62],[-116.95,43.8],[-116.9,44.5],[-116.9,45.5],[-117.04,46.42],[-118.0,46.6],[-119.05,46.23],[-120.0,45.7],[-121.2,45.6],[-122.7,45.6],[-123.4,46.2],[-124.05,46.25]],t:"Down the Snake River through Hells Canyon into the Columbia, and out to the Pacific: west of the Continental Divide."},
 {n:"Calgary",a:"hud",C:[[-114.07,51.05],[-112.5,50.0],[-110.7,50.04],[-109.0,50.7],[-106.7,52.1],[-105.3,53.2],[-102.0,53.8],[-101.25,53.82],[-99.3,53.2],[-98.5,53.0],[-97.9,53.9],[-96.0,55.5],[-94.5,56.4],[-92.6,57.0]],t:"The Bow and the Saskatchewan carry it across the prairies to Lake Winnipeg, and the Nelson River takes it to Hudson Bay. Over a third of Canada drains into Hudson Bay."},
 {n:"Yellowknife",a:"arc",C:[[-114.37,62.45],[-115.5,61.8],[-117.4,61.3],[-121.3,61.9],[-123.6,64.9],[-126.8,65.3],[-128.7,66.2],[-130.5,67.5],[-133.7,68.3],[-135.0,69.2]],t:"Across Great Slave Lake and down the Mackenzie, Canada’s longest river, north to the Arctic Ocean."},
 {n:"Pittsburgh",a:"gulf",C:[[-80.0,40.44],[-80.6,40.6],[-80.7,39.9],[-81.5,39.3],[-82.6,38.6],[-84.5,39.1],[-85.76,38.25],[-87.6,37.95],[-88.4,37.1],[-89.17,37.0]].concat(MISS_LOW.slice(2)),t:"The Ohio River starts right here and joins the Mississippi at Cairo, Illinois: east of the Appalachians’ crest it would have gone to the Atlantic instead."},
 {n:"Chicago",a:"gulf",C:[[-87.63,41.88],[-88.0,41.7],[-88.1,41.53],[-88.7,41.3],[-89.6,40.7],[-90.4,39.6],[-90.2,38.97]].concat(MISS_LOW),t:"A trick! Chicago sits on Lake Michigan, but in 1900 engineers turned the Chicago River round to carry the city’s sewage away from its drinking water. Now it flows to the Mississippi and the Gulf of Mexico."},
 {n:"Phoenix",a:"pac",alt:"none",C:[[-112.07,33.45],[-112.6,33.2],[-113.6,32.9],[-114.6,32.7],[-114.8,32.0],[-114.8,31.6],[-114.75,31.4]],t:"The Salt and Gila rivers join the Colorado, which flows to the Gulf of California, part of the Pacific. But today farms and cities use up the Colorado, and it seldom reaches the sea at all: both answers count."}];
const RAINX={tour:"namerica",title:"Mountains and rivers",
 tip:"Rain falls on a city. Where does it end up? Tap a sea (or tap any city to pick it), then watch it flow.",
 card:()=>'<div class="gw3-row gw3-btns">'+Object.keys(SEAS).map(k=>'<button type="button" class="gw3-btn gw3-sea" data-k="'+k+'"><i style="background:'+SEAS[k].c+'"></i>'+esc(SEAS[k].n)+"</button>").join("")+'</div><div class="gw3-score"></div>',
 init(L){L.ans={};L.cur=0;L.t=0;L.trails=svgEl(L.clip,"g",{class:"gw3-noev"});L.flow=svgEl(L.clip,"path",{class:"gw3-flow"});L.drop=svgEl(L.clip,"g",{class:"gw3-noev"},'<g transform="scale(.8)">'+DROPI+"</g>");
  L.c=RAIN.map((r,i)=>{const e=svgEl(L.clip,"g",{class:"gw3-grab gw3-city",tabindex:"0","aria-label":r.n});svgEl(e,"circle",{r:16,class:"gw3-hit"});svgEl(e,"g",{},'<circle r="7" class="gw3-cdot"/>');
   e.addEventListener("pointerdown",ev=>{ev.stopPropagation();ev.preventDefault();this.pick(L,i)});quiet(e);return{r,e,R:route(r.C,.08),t:tag(L,"gw3-small")}});
  L.rain=svgEl(L.clip,"g",{class:"gw3-noev gw3-rainf"});L.bub=tag(L,"gw3-bub")},
 pick(L,i){L.cur=i;L._said="";turnTo(L,L.c[i].r.C[0],1.6);L.dirty=1},
 wire(L){L.card.querySelectorAll(".gw3-sea").forEach(b=>b.onclick=()=>{const i=L.cur,r=RAIN[i];if(L.ans[i])return;const k=b.dataset.k;L.ans[i]={k,ok:k===r.a||k===r.alt,f:0};L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L||!L.el.isConnected)return;const n=RAIN.findIndex((x,j)=>!L.ans[j]);if(n>=0)this.pick(L,n)},4200)});
  setTimeout(()=>{if(L&&L.el.isConnected&&L.D===this)this.pick(L,0)},900)},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;const a=L.ans[L.cur];if(a&&a.f<1){a.f=Math.min(1,a.f+dt/2.6);L.dirty=1}
  const o=L.c[L.cur],q=o&&proj(L,o.r.C[0]);let h="";if(q&&!a){for(let k=0;k<9;k++){const ph=(L.t*1.3+k/9)%1,x=q[0]+(k-4)*4+Math.sin(k*3.7)*2,y=q[1]-46+ph*36;h+='<path d="M'+x.toFixed(1)+" "+y.toFixed(1)+'l-1.5 5" opacity="'+(1-ph).toFixed(2)+'"/>'}}L.rain.innerHTML=h},
 draw(L){let th="",right=0,done=0;L.c.forEach((o,i)=>{const a=L.ans[i],cur=i===L.cur;place(o.e,proj(L,o.r.C[0]),cur?" scale(1.3)":"");o.e.classList.toggle("gw3-curc",cur);
   if(a){done++;if(a.ok)right++;const f=a.f,s=at(o.R,f),col=SEAS[o.r.a].c;const d=pathOf(L,o.R.P.slice(0,s.i+1).concat([s.ll]));th+='<path d="'+d+'" class="gw3-fsh"/><path d="'+d+'" stroke="'+col+'" class="gw3-ftr"/>';
    if(cur){place(L.drop,f<1?proj(L,s.ll):null," translate(0,-6)")}}
   putTag(L,o.t,proj(L,o.r.C[0],1),(a?(a.ok?"✓ ":"✗ "):"")+esc(o.r.n),12)});L.trails.innerHTML=th;
  const o=L.c[L.cur],a=L.ans[L.cur];if(!a||a.f>=1)place(L.drop,null);
  const end=o.r.C[o.r.C.length-1];putTag(L,L.bub,a&&a.f>=1?proj(L,end,1):!a?proj(L,o.r.C[0],1):null,a?SEAS[o.r.a].n+(o.r.a==="none"?"":" 🌊"):"Rain on "+esc(o.r.n)+": where does it go?",a?-14:-58);
  if(L.card){L.card.querySelectorAll(".gw3-sea").forEach(b=>{b.disabled=!!a;b.classList.toggle("gw3-right",!!a&&(b.dataset.k===o.r.a||b.dataset.k===o.r.alt));b.classList.toggle("gw3-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   setHTML(L.card.querySelector(".gw3-score"),'<div class="gw3-dots">'+RAIN.map((r,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"gw3-ok":"gw3-no":"")+(i===L.cur?" gw3-at":"")+'" title="'+esc(r.n)+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+" · "+(RAIN.length-done)+" to go</span>")}
  if(done===RAIN.length)say(L,"All eight: "+right+" right","Mountain crests split the rain: the Continental Divide along the Rockies sends it west to the Pacific or east to the Gulf, and farther north it runs to Hudson Bay or the Arctic. The Mississippi and its branches drain about 40% of the lower 48 states.");
  else if(a)say(L,(a.ok?"Right: ":"Not quite: ")+SEAS[o.r.a].n,o.r.t);
  else say(L,"Rain on "+o.r.n,"Which way does the land slope here? Think of the nearest mountains and the big rivers.")}};

/* ======================================================================== 6. Two tides a day
   NOAA National Ocean Service, "Tides and Water Levels" (tutorial): the Moon's gravity and the Earth–Moon system's
   rotation raise two bulges of water, one under the Moon and one on the far side; a place turns through both in a "tidal
   day" of 24 hours 50 minutes, so most coasts get two high tides 12 hours 25 minutes apart. The Sun's tide-raising force
   is about 46% of the Moon's: when Sun and Moon line up (new and full Moon) the tides add up to spring tides, at right
   angles (quarter Moons) they partly cancel to neap tides. The bulges here are the simple "equilibrium tide" (height
   ∝ cos 2× the angle from the point under the Moon), with the Moon over the Equator: a picture of the idea. Real tides are
   shaped by coasts and ocean basins, so their size and timing differ from place to place, and some coasts, such as parts of the
   Gulf of Mexico, get one high tide a day (NOAA, "Types and causes of tidal cycles"); no heights are given. The gauge starts
   in the Bay of Fundy only as a place on the stop's own view. */
const TDAY=24+50/60,SUNF=.46;
const TIDES={tour:"seas",title:"Two tides a day",dur:24,loop:1,
 tip:"Press ▶ or drag the clock: the Earth turns under the Moon’s two bulges of water. Drag the tide gauge to any coast.",
 card:()=>playerHTML("Hours","0:00")+'<div class="gw3-row gw3-btns"><button type="button" class="gw3-btn gw3-sun" data-s="0">Moon only</button><button type="button" class="gw3-btn gw3-sun" data-s="1">Spring tide</button><button type="button" class="gw3-btn gw3-sun" data-s="2">Neap tide</button></div><div class="gw3-tcurve"></div>',
 init(L){L.u=0;L.sun=0;L.gp=[-66.2,44.9];L.shift=svgEl(L.clip,"g",{"clip-path":"url(#gw3Disc)"});
  /* the bulges are kept inside the globe's disc (orthographic: centre = translate, radius = scale) */
  L.disc=svgEl(svgEl(L.svg.querySelector("defs"),"clipPath",{id:"gw3Disc"}),"circle",{r:0});L.b1=svgEl(L.shift,"path",{class:"gw3-bulge"});L.b2=svgEl(L.shift,"path",{class:"gw3-bulge"});
  L.sb=svgEl(L.shift,"path",{class:"gw3-sbulge"});L.moon=svgEl(L.clip,"g",{class:"gw3-noev"},'<circle r="13" fill="#e9e6d8" stroke="#8a8670" stroke-width="2"/><circle cx="-4" cy="-3" r="3" fill="#cfcab3"/><circle cx="4" cy="4" r="2" fill="#cfcab3"/>');
  L.gauge=svgEl(L.clip,"g",{class:"gw3-grab",tabindex:"0","aria-label":"Tide gauge: drag it to a coast"});svgEl(L.gauge,"circle",{r:22,class:"gw3-hit"});L.gI=svgEl(L.gauge,"g",{});
  L.mT=tag(L,"gw3-small");L.fT=tag(L,"gw3-small gw3-ghost");L.gT=tag(L,"gw3-bub");L.hint=tag(L,"gw3-hint");
  let off=[0,0];draggable(L,L.gauge,(x,y)=>{const ll=unproj(L,x-off[0],y-off[1]);if(ll){L.gp=ll;L.moved=1}},(x,y)=>{stopPlay(L);const q=proj(L,L.gp);off=q?[x-q[0],y-q[1]]:[0,0]},f=>{L.gp=[L.gp[0]+f*3,L.gp[1]];L.moved=1})},
 wire(L){L.card.querySelectorAll(".gw3-sun").forEach(b=>b.onclick=()=>{L.sun=+b.dataset.s;L._said="";L.dirty=1})},
 tick(L,dt){advance(L,dt,this.dur,1)},
 /* the point under the Moon at hour h (it moves west a full turn per tidal day), and under the Sun (per 24 h) */
 moonLon(h){return((-70-360*h/TDAY)%360+540)%360-180},
 sunLon(L,h){const off=L.sun===2?90:0;return((-70+off-360*h/24)%360+540)%360-180},
 level(L,ll,h){const am=d3.geoDistance(ll,[this.moonLon(h),0]);let v=Math.cos(2*am);if(L.sun){const as=d3.geoDistance(ll,[this.sunLon(L,h),0]);v+=SUNF*Math.cos(2*as)}return v},
 draw(L){const h=L.u*TDAY,ml=this.moonLon(h),sub=[ml,0],anti=[ml>0?ml-180:ml+180,0];L.shift.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");
  try{const P=g().projection(),t=P.translate();L.disc.setAttribute("cx",t[0]);L.disc.setAttribute("cy",t[1]);L.disc.setAttribute("r",g()._flat?1e5:P.scale())}catch(e){}
  const circ=(c,r)=>{try{return d3.geoCircle().center(c).radius(r).precision(2)()}catch(e){return null}};
  L.b1.setAttribute("d",geoD(circ(sub,45)));L.b2.setAttribute("d",geoD(circ(anti,45)));
  if(L.sun){const sl=this.sunLon(L,h);L.sb.setAttribute("d",geoD(circ([sl,0],45))+geoD(circ([sl>0?sl-180:sl+180,0],45)))}else L.sb.setAttribute("d","");
  place(L.moon,proj(L,sub));putTag(L,L.mT,proj(L,sub,1),"🌙 Moon overhead: high tide",18);putTag(L,L.fT,proj(L,anti,1),"far side: high tide too",0);
  const lv=this.level(L,L.gp,h),mx=L.sun===1?1+SUNF:1,rel=lv/mx;
  L.gI.innerHTML='<rect x="-7" y="-30" width="14" height="30" rx="3" class="gw3-gbox"/><rect x="-5" y="'+(-15-rel*13).toFixed(1)+'" width="10" height="'+(15+rel*13).toFixed(1)+'" class="gw3-gfill"/><circle r="5" cy="2" fill="#13294b" stroke="#fff" stroke-width="2"/>';
  place(L.gauge,proj(L,L.gp));const qg=proj(L,L.gp,1);putTag(L,L.gT,qg,rel>.5?"High tide":rel<-.5?"Low tide":lv>this.level(L,L.gp,h-.2)?"Rising":"Falling",-38);
  putTag(L,L.hint,!L.moved&&qg?[qg[0]+18,qg[1]+6]:null,"Drag the gauge to a coast");
  const hh=Math.floor(h),mm=Math.floor((h-hh)*60);syncRange(L,hh+":"+String(mm).padStart(2,"0"));
  if(L.card){L.card.querySelectorAll(".gw3-sun").forEach(b=>b.classList.toggle("gw3-on",+b.dataset.s===L.sun));
   /* this place's tide over one tidal day, with the highs marked */
   const W=300,H=86,N=120,x=t=>8+t/TDAY*(W-16),y=v=>H/2-v/(1+SUNF)*(H/2-12);let d="",hi=[];let prev=this.level(L,L.gp,-TDAY/N),cur=this.level(L,L.gp,0);
   for(let k=0;k<=N;k++){const t=k*TDAY/N,nx=this.level(L,L.gp,t+TDAY/N);d+=(k?"L":"M")+x(t).toFixed(1)+" "+y(cur).toFixed(1);if(cur>prev&&cur>=nx&&k<N)hi.push(t);prev=cur;cur=nx}
   const lab=hi.slice(0,2).map(t=>{const mn=Math.round(t*60),a=Math.floor(mn/60),b=mn%60;return'<g transform="translate('+x(t).toFixed(1)+","+(y(this.level(L,L.gp,t))-6).toFixed(1)+')"><text text-anchor="middle">High '+a+":"+String(b).padStart(2,"0")+"</text></g>"}).join("");
   setHTML(L.card.querySelector(".gw3-tcurve"),'<div class="gw3-bartitle">The tide at the gauge over one day (24 h 50 min)</div><svg viewBox="0 0 '+W+" "+H+'" class="gw3-stsvg"><line x1="8" x2="'+(W-8)+'" y1="'+H/2+'" y2="'+H/2+'" class="gw3-sea0"/><path d="'+d+'" class="gw3-tline"/>'+lab+
    '<line x1="'+x(h).toFixed(1)+'" x2="'+x(h).toFixed(1)+'" y1="4" y2="'+(H-4)+'" class="gw3-now"/><circle cx="'+x(h).toFixed(1)+'" cy="'+y(lv).toFixed(1)+'" r="4.5" class="gw3-nowdot"/></svg>'+
    (hi.length>=2?'<div class="gw3-note">Two highs, '+(()=>{const g2=hi[1]-hi[0],a=Math.floor(g2);return a+" h "+Math.round((g2-a)*60)+" min"})()+" apart</div>":""))}
  if(L.sun===1)say(L,"Spring tide: Sun and Moon in line","At new and full Moon the Sun’s smaller bulges (its pull is about 46% of the Moon’s) line up with the Moon’s: higher highs and lower lows. Nothing to do with spring the season: the tide ‘springs up’.");
  else if(L.sun===2)say(L,"Neap tide: Sun and Moon at right angles","At half Moon the Sun’s bulges sit between the Moon’s and fill in the lows: the smallest tides of the month. Spring and neap tides take turns about every week.");
  else if(L.u<.004&&!L.moved)say(L,"Why two tides, not one?","The Moon pulls the near-side ocean towards it into one bulge. The far side is pulled least, so it gets left behind as a second bulge. Press ▶ and watch a coast turn through both.");
  else say(L,rel>.5?"High tide at the gauge":rel<-.5?"Low tide at the gauge":"The tide is "+(lv>this.level(L,L.gp,h-.2)?"coming in":"going out"),"The Earth turns once a day, but the Moon moves on in its orbit too, so it takes 24 hours 50 minutes to come back overhead. Two bulges in that time: high tide about every 12 hours 25 minutes. Real coasts bend this simple rhythm: parts of the Gulf of Mexico get only one high tide a day.")}};

/* ---------------- the engine: one stop at a time (as in geoflock-interact-earth2.js) ---------------- */
const DEFS=[SORTB,LONGR,GLAKES,CROWD,RAINX,TIDES];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;return DEFS.find(d=>d.tour===ps.tour&&d.title===S.title)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="gw3-layer";el.innerHTML='<svg class="gw3-svg"><defs><clipPath id="gw3Clip"><path class="gw3-clipp" clip-rule="evenodd"/></clipPath></defs><g class="gw3-clipg" clip-path="url(#gw3Clip)"></g></svg>';G.host.appendChild(el);
 const svg=el.querySelector("svg");L={D,host:G.host,el,svg,clip:svg.querySelector(".gw3-clipg"),clipP:svg.querySelector(".gw3-clipp"),u:0,playing:false,dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}document.body.classList.add("gw3-on");lastT=0;loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".gw3-ctl").forEach(c=>c.remove());document.body.classList.remove("gw3-on")}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".gw3-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="gw3-ctl";
 c.innerHTML='<div class="gw3-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="gw3-ep"></div>';at0.after(c);L.card=c;L._said="";
 try{if(c.querySelector(".gw3-play"))wirePlayer(L);if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}playBtn(L);L.dirty=1}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);
   /* everything drawn in the SVG is kept off the tour card by an even-odd clip */
   L.clipP.setAttribute("d","M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z"+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L);follow(L)}}catch(e){console.error(e)}loop()})}
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1;glide(L,[ll[0]+side*28/z,ll[1]*(1-.3/Math.max(1,z))],z)}
function glide(L,t,z1){const G=g();const r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,[t[0],t[1]]),D=L.D;L.gliding=T0;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z1-z0)*e)}catch(err){L.gliding=0;return}L.dirty=1;if(f<1)requestAnimationFrame(step);else L.gliding=0};step()}
function follow(L){if(!L.D.follow||!L.fll||L.gliding||!L.looked&&L.D.lookTo)return;if(performance.now()-(L.lastFollow||0)<1500)return;if(proj(L,L.fll,1))return;
 L.lastFollow=performance.now();turnTo(L,L.fll)}
/* a stop whose action sits off to one side turns the globe there once, after the tour's own move has settled */
function look(){if(!L||!L.D.lookTo||L.looked)return;const G=g();if(!G||!G.lookAt)return;const k=(G.rot||[]).map(v=>v.toFixed(2)).join(",")+"|"+(+G.zoom).toFixed(2);
 if(k!==L.lastRot){L.lastRot=k;L.still=0;return}if(++L.still<3)return;L.looked=1;turnTo(L,L.D.lookTo[0],L.D.lookTo[1])}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard();look()}else if(L||document.querySelector(".gw3-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.gw3-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.gw3-svg{position:absolute;left:0;top:0;overflow:visible}
.gw3-grab{pointer-events:all;cursor:grab;touch-action:none;outline:none}.gw3-grab.gw3-dragging{cursor:grabbing}
.gw3-noev{pointer-events:none}
.gw3-hit{fill:rgba(255,255,255,.001);stroke:none}
.gw3-grab>g{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gw3-grab:hover>g,.gw3-grab:focus-visible>g{filter:drop-shadow(0 0 5px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.gw3-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.gw3-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.gw3-green{background:#1f7a45}
.gw3-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.gw3-ghost{background:rgba(255,255,255,.75);font-weight:700;font-style:italic}
.gw3-hint{transform:none;background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:gw3Nudge 1.4s ease-in-out infinite}
@keyframes gw3Nudge{50%{transform:translateX(6px)}}
.gw3-bhit{fill:none;stroke:rgba(255,255,255,.001);stroke-width:18;pointer-events:stroke;cursor:pointer}
.gw3-bsh{fill:none;stroke:rgba(10,20,40,.55);stroke-width:7;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.gw3-bline{fill:none;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.gw3-curb .gw3-bsh{stroke-width:11}
.gw3-rv{fill:none;stroke:rgba(255,255,255,.55);stroke-width:3;stroke-dasharray:4 4;pointer-events:none}
.gw3-rvdone{fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.gw3-rvdone.gw3-nile{stroke:#2f8fe0}.gw3-rvdone.gw3-amz{stroke:#2e9d5b}
.gw3-glt{fill:none;stroke:#2f8fe0;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.85;pointer-events:none}
.gw3-cout{fill:none;stroke:#ffd166;stroke-width:2;pointer-events:none}
.gw3-bd{fill:rgba(217,104,43,.35);stroke:#d9682b;stroke-width:2.5;stroke-linejoin:round}
.gw3-bddot{fill:#d9682b;stroke:#fff;stroke-width:1.2}
.gw3-pdots circle{fill:#ffd166;stroke:#7a4b10;stroke-width:.8}
.gw3-bdt{transform:translate(-50%,0)}
.gw3-cdot{fill:#fff;stroke:#13294b;stroke-width:2.5}.gw3-curc .gw3-cdot{fill:#ffd166}
.gw3-rainf path{stroke:#4aa3ff;stroke-width:2;stroke-linecap:round}
.gw3-fsh{fill:none;stroke:rgba(10,20,40,.5);stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.gw3-ftr{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.gw3-bulge{fill:rgba(47,143,224,.32);stroke:#7fc4ff;stroke-width:2;pointer-events:none}
.gw3-sbulge{fill:rgba(255,200,80,.18);stroke:#ffc061;stroke-width:1.6;stroke-dasharray:5 4;pointer-events:none}
.gw3-gbox{fill:rgba(255,255,255,.9);stroke:#13294b;stroke-width:1.6}.gw3-gfill{fill:#2f8fe0}
.gw3-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.gw3-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.gw3-row{display:flex;align-items:center;gap:10px}
.gw3-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.gw3-range,.gw3-sl2 input{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.gw3-sl2{margin-top:8px;font-size:11.5px;font-weight:700;opacity:.9}.gw3-sl2 span{flex:0 0 auto}
.gw3-read{flex:0 0 auto;font-weight:800;font-size:12.5px;color:#9a4a16;white-space:nowrap;min-width:64px;text-align:right}
.gw3-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.gw3-ep b{display:block;font-size:15px}
.gw3-ep.gw3-new{animation:gw3In .45s ease}@keyframes gw3In{from{opacity:.2;transform:translateY(4px)}}
.gw3-btns{margin-top:8px;gap:6px;flex-wrap:wrap}
.gw3-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.gw3-btn i{display:inline-block;width:10px;height:10px;border-radius:50%}
.gw3-btn.gw3-on{background:#13294b;color:#fff;border-color:#13294b}
.gw3-btn:disabled{cursor:default;opacity:.55}.gw3-btn.gw3-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.gw3-btn.gw3-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.gw3-score{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:12.5px}
.gw3-dots{display:flex;gap:4px}.gw3-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.gw3-dots i.gw3-ok{background:#1f8a4c}.gw3-dots i.gw3-no{background:#c2364f}.gw3-dots i.gw3-at{box-shadow:0 0 0 2px #ffd166}
.gw3-race{margin-top:8px;display:flex;flex-direction:column;gap:5px}
.gw3-lane{display:flex;align-items:center;gap:8px;font-size:12.5px}.gw3-lane span{flex:0 0 56px;font-weight:800}.gw3-watch{flex:0 0 auto;width:28px;height:24px;border-radius:8px;border:1px solid rgba(19,41,75,.2);background:#fff;cursor:pointer;font-size:13px;padding:0}.gw3-watch.gw3-on{background:#ffd166;border-color:#d9a400}.gw3-lane b{flex:0 0 92px;text-align:right}
.gw3-track{position:relative;flex:1 1 auto;height:10px;border-radius:6px;background:rgba(19,41,75,.12)}
.gw3-track i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;transition:width .15s}
.gw3-track em{position:absolute;top:-3px;width:3px;height:16px;margin-left:-1.5px;background:#13294b}
.gw3-wtrack{margin-top:6px}.gw3-wtrack i{background:linear-gradient(90deg,#ffd166,#d9682b)}
.gw3-note{font-size:12px;opacity:.8;margin-top:3px}
.gw3-bign{display:flex;align-items:baseline;gap:8px;margin-top:8px}.gw3-bign b{font-size:20px;color:#9a4a16}.gw3-bign span{font-size:12.5px}
.gw3-bartitle{font-size:12px;font-weight:700;opacity:.75;margin:8px 0 2px}
.gw3-stsvg{display:block;width:100%;height:auto}.gw3-stsvg text{font-size:9.5px;font-weight:700;fill:#13294b}
.gw3-stfill{fill:rgba(47,143,224,.18)}.gw3-stline{fill:none;stroke:#2f8fe0;stroke-width:2.5;stroke-linejoin:round}
.gw3-sea0{stroke:#13294b;stroke-width:1;stroke-dasharray:3 3;opacity:.5}
.gw3-tline{fill:none;stroke:#2f8fe0;stroke-width:2.5}.gw3-now{stroke:#d9682b;stroke-width:1.5}.gw3-nowdot{fill:#d9682b;stroke:#fff;stroke-width:1.5}
.gw3-yrs{display:flex;align-items:baseline;gap:8px;font-size:12.5px}.gw3-yrs b{font-size:20px;color:#1d6fc0}.gw3-yrs small{opacity:.7}
body.gw3-on .ps-leaders{opacity:.5}
body.dark-theme .gw3-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark-theme .gw3-do,body.dark-theme .gw3-read,body.dark-theme .gw3-bign b{color:#ffb27a}
body.dark-theme .gw3-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
body.dark-theme .gw3-btn.gw3-on{background:#fff;color:#13294b}
body.dark-theme .gw3-track,body.dark-theme .gw3-dots i{background:rgba(255,255,255,.15)}
body.dark-theme .gw3-track em{background:#fff}
body.dark-theme .gw3-stsvg text{fill:#fff}body.dark-theme .gw3-sea0{stroke:#fff}`;document.head.appendChild(s)}
window.gfInteractWorld3={v:1,set:u=>{if(L){L.u=clamp(u,0,1);L.dirty=1}},get:()=>L?{title:L.D.title,u:L.u}:null,L:()=>L};
})();
