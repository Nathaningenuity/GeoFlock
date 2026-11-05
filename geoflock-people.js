/* GeoFlock: the People counter, a Toolkit tool (it replaces the Population map's old "Count people" button).
   How many people live inside an area: click a country, or draw one (lasso, polygon, circle, box, "around a place"), or
   let a circle grow from a point until it holds a target (100 million … half of humanity). Each area shows its people,
   size, density, share of the world, the countries and main cities inside and a country of about the same population.
   Areas can be cut by one or more lines into parts, or split in half with one click; two or more areas are compared in a
   ranked chart. Works on every map; the Population map opens it (not drawing). Drawing starts only from a tool button and
   is always cancellable: Esc, a right-click or the same button again. One drawing tool at a time (gfOneTool).
   People: GHS-POP 2025 (European Commission JRC, CC BY 4.0) summed over 0.1° cells (about 11 km), so small shapes and
   coasts are approximate. */
(function(){
if(typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent?amGlobe:null}catch(e){return null}};
const mapMode=()=>{try{return appMode==="allmaps"?allMapsColorMode:null}catch(e){return null}};
const R_KM=6371;

/* ---------- the people grid (0.1°) ---------- */
let POP=null,popP=null,WORLD=0;const W=3600,H=1800,STEP=.1;
function load(){if(popP)return popP;popP=new Promise((ok,no)=>{const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 const d=x.getImageData(0,0,W,H).data,a=new Float32Array(W*H);let t=0;for(let i=0,j=0;i<a.length;i++,j+=4){const v=(d[j]<<8)|d[j+1];a[i]=v?Math.pow(10,v/4096)-1:0;t+=a[i]}POP=a;WORLD=t;c.width=0;ok(a)}catch(e){no(e)}};im.onerror=no;im.src="textures/POP_GRID_0p1.png"});return popP}
/* which country each cell is in (drawn once, the first time it is needed); cells on a border stay 0 */
let CIDX=null,CODES=[];
function countryGrid(){if(CIDX)return CIDX;try{const F=projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c);const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});
 const pr=d3.geoEquirectangular().scale(W/(2*Math.PI)).translate([W/2,H/2]).precision(.2),path=d3.geoPath(pr,x);CODES=[null];
 F.forEach(f=>{const id=CODES.length;CODES.push(String(f.properties.c).toLowerCase());x.fillStyle="rgb("+(id>>8)+","+(id&255)+",255)";x.beginPath();path(f);x.fill()});
 const d=x.getImageData(0,0,W,H).data,a=new Uint16Array(W*H);for(let i=0,j=0;i<a.length;i++,j+=4)if(d[j+2]===255&&d[j+3]===255)a[i]=(d[j]<<8)|d[j+1];CIDX=a;c.width=0}catch(e){console.error(e);CIDX=new Uint16Array(1)}return CIDX}

/* rings (arrays of [lon,lat]) → the cells inside */
function mask(rings){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;rings.forEach(r=>r.forEach(([lo,la])=>{x0=Math.min(x0,lo);x1=Math.max(x1,lo);y0=Math.min(y0,la);y1=Math.max(y1,la)}));
 const c0=Math.max(0,Math.floor((x0+180)/STEP)),c1=Math.min(W-1,Math.ceil((x1+180)/STEP)),r0=Math.max(0,Math.floor((90-y1)/STEP)),r1=Math.min(H-1,Math.ceil((90-y0)/STEP));
 const w=c1-c0+1,h=r1-r0+1;if(w<1||h<1)return null;const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d",{willReadFrequently:true});x.fillStyle="#fff";x.beginPath();
 rings.forEach(r=>r.forEach(([lo,la],i)=>{const px=(lo+180)/STEP-c0,py=(90-la)/STEP-r0;i?x.lineTo(px,py):x.moveTo(px,py)}));x.fill("evenodd");
 const d=x.getImageData(0,0,w,h).data;cv.width=0;return{c0,r0,w,h,d,at:(i,j)=>d[(j*w+i)*4+3]>=128}}
/* the count of an area: total, centre, parts (by the side of each cutting line), countries */
function count(A){const m=mask(A.rings);if(!m||!POP)return null;const cuts=A.cuts||[],nc=cuts.length,CI=countryGrid();
 let tot=0,cx=0,cy=0;const parts={},cty={};
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.at(i,j))continue;const gi=(m.r0+j)*W+(m.c0+i),v=POP[gi];if(!v)continue;const lo=(m.c0+i+.5)*STEP-180,la=90-(m.r0+j+.5)*STEP;tot+=v;cx+=lo*v;cy+=la*v;
  const ci=CI.length>1?CI[gi]:0;cty[ci]=(cty[ci]||0)+v;
  if(nc){let k="";for(const s of cuts){k+=((s[1][0]-s[0][0])*(la-s[0][1])-(s[1][1]-s[0][1])*(lo-s[0][0]))>0?"1":"0"}const P=parts[k]||(parts[k]={v:0,x:0,y:0});P.v+=v;P.x+=lo*v;P.y+=la*v}}
 const P=Object.keys(parts).map(k=>({k,v:parts[k].v,c:[parts[k].x/parts[k].v,parts[k].y/parts[k].v]})).filter(p=>p.v>0).sort((a,b)=>b.v-a.v);
 const C=Object.keys(cty).filter(k=>+k>0).map(k=>({c:CODES[+k],v:cty[k]})).filter(o=>o.c).sort((a,b)=>b.v-a.v);
 return{tot,c:tot?[cx/tot,cy/tot]:null,parts:P,countries:C,m}}
const areaKm2=rings=>{try{let A=0;rings.forEach((r,i)=>{let a=d3.geoArea({type:"Polygon",coordinates:[r]});if(a>2*Math.PI)a=4*Math.PI-a;A+=i?-a:a});return Math.abs(A)*R_KM*R_KM}catch(e){return 0}};
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+" billion":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" million":n>=1e3?Math.round(n/1e3).toLocaleString()+" thousand":Math.round(n).toLocaleString();
const fmtS=n=>n>=1e9?(n/1e9).toFixed(1)+" bn":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" m":n>=1e3?Math.round(n/1e3)+"k":Math.round(n)+"";
const cname=c=>{try{return(COUNTRY_BY_CODE[c]||{}).n||c.toUpperCase()}catch(e){return c}};
/* the country with about as many people */
function likeCountry(n){try{let best=null,bd=1e9;for(const c in COUNTRY_POPULATION){const p=COUNTRY_POPULATION[c];if(!p)continue;const d=Math.abs(Math.log(p/n));if(d<bd){bd=d;best=c}}return best&&bd<.35?best:null}catch(e){return null}}
/* the main cities inside an area (the map's city list, most important first) */
let CITYLL=null;function cities(){if(CITYLL)return CITYLL;CITYLL=[];try{const PJ=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);(typeof ALLMAPS_CITIES!=="undefined"?ALLMAPS_CITIES:[]).forEach(r=>{const ll=PJ.invert([r[3],r[4]]);if(ll&&isFinite(ll[0]))CITYLL.push({n:String(r[0]).replace(/\s+/g," "),t:r[1],cap:r[2]===1,ll})});CITYLL.sort((a,b)=>a.t-b.t||b.cap-a.cap)}catch(e){}return CITYLL}
function citiesIn(m,max){const out=[];if(!m)return out;for(const c of cities()){const i=Math.floor((c.ll[0]+180)/STEP)-m.c0,j=Math.floor((90-c.ll[1])/STEP)-m.r0;if(i>=0&&j>=0&&i<m.w&&j<m.h&&m.at(i,j)){out.push(c);if(out.length>=max)break}}return out}

/* ---------- state ---------- */
const COLS=["#c2491f","#2f6fb0","#2e8b57","#8a4fc8","#d4a017","#c2185b"],PART=["#1f5fa8","#e07b2e","#2e8b57","#9c3fb5","#c9a227","#d1495b","#3a9aa8","#6d5d4b"];
let on=false,tool=null,areas=[],sel=-1,panel=null,ov=null,raf=0,drawing=null,poly=null,growT=1e9,placeQ="",placeKm=200,busy=false;
const nextCol=()=>{const used=new Set(areas.map(a=>a.col));return COLS.find(c=>!used.has(c))||COLS[areas.length%COLS.length]};
function addArea(A){A.col=A.col||nextCol();A.cuts=A.cuts||[];A.km2=A.km2||areaKm2(A.rings);if(areas.length>=6)areas.shift();areas.push(A);sel=areas.length-1;recount(A);render()}
function recount(A){if(!POP){load().then(()=>{areas.forEach(a=>a.res=count(a));render()});return}A.res=count(A)}

/* ---------- tools ---------- */
const TOOLS=[["country","🗺️","Country","Click a country"],["lasso","✏️","Lasso","Drag round an area; let go to close it"],["poly","⬠","Polygon","Click the corners; click the first corner, double-click or press Enter to finish"],["circle","◯","Circle","Drag out from the centre"],["box","▭","Box","Drag a box"],["place","📍","Around a place","Type a place and a distance"],["grow","🎯","Grow","Click a centre: a circle grows until it holds the target"],["split","✂️","Split","Draw lines across the picked area to cut it into parts"]];
function setTool(t){if(tool===t||!t){tool=null;drawing=null;poly=null;sync();render();return}tool=t;drawing=null;poly=null;if(t!=="place"&&t!=="country")try{gfOneTool.claim("people")}catch(e){}if(t==="country")try{gfOneTool.claim("people")}catch(e){}sync();render()}
try{gfOneTool.on("people",()=>{if(!tool)return;tool=null;drawing=null;poly=null;sync();render()})}catch(e){}
function sync(){const g=G();if(g)g.host.classList.toggle("gfpp-draw",!!(on&&tool&&tool!=="place"));document.querySelectorAll(".gfk-people,.gfpp-ico").forEach(b=>b.classList.toggle("on",on))}

/* ---------- the panel ---------- */
function mount(){const g=G();if(!g)return null;const h=g.host;if(getComputedStyle(h).position==="static")h.style.position="relative";
 if(!ov||ov.parentNode!==h){if(ov)ov.remove();ov=document.createElement("canvas");ov.className="gfpp-ov";h.appendChild(ov)}
 if(!panel||(panel.parentNode!==h&&!panel._float)){if(panel)panel.remove();panel=document.createElement("div");panel.className="gfpp";h.appendChild(panel);
  panel.addEventListener("pointerdown",e=>{if(!e.target.closest(".gfpp-h")||e.target.closest("button"))return;e.preventDefault();e.stopPropagation();const r=panel.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;
   if(!panel._float){panel._float=1;document.body.appendChild(panel);panel.classList.add("gfpp-float");panel.style.left=r.left+"px";panel.style.top=r.top+"px"}
   const mv=ev=>{const w=panel.offsetWidth;panel.style.left=Math.max(60-w,Math.min(innerWidth-60,ev.clientX-dx))+"px";panel.style.top=Math.max(0,Math.min(innerHeight-40,ev.clientY-dy))+"px"};
   const up=()=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true)};addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)},true);
  ["pointerdown","click","wheel","dblclick","keydown"].forEach(t=>panel.addEventListener(t,e=>e.stopPropagation()))}
 return panel}
function hint(){const T=TOOLS.find(t=>t[0]===tool);if(!tool)return areas.length?"Pick another tool to add an area, or ✂️ Split to cut the picked one.":"Pick a tool, then mark an area on the map.";
 if(tool==="split")return areas[sel]?"Drag a line across <b>"+esc(areas[sel].name)+"</b>. Each line cuts it again. Esc stops.":"Mark an area first.";
 if(tool==="grow")return"Click a centre. The circle grows until it holds <b>"+fmtS(growT>=WORLD/2-1?WORLD/2:growT)+"</b> people.";
 return T[3]+". Esc or a right-click cancels."}
function areaCard(A,i){const r=A.res;let h='<div class="gfpp-area'+(i===sel?" sel":"")+'" data-a="'+i+'" style="--c:'+A.col+'"><div class="gfpp-at"><i></i><b contenteditable="true" spellcheck="false" data-nm="'+i+'">'+esc(A.name)+'</b><button type="button" data-del="'+i+'" title="Remove this area">✕</button></div>';
 if(!r){h+='<p class="gfpp-hint">Counting…</p></div>';return h}
 const dens=A.km2?r.tot/A.km2:0,share=WORLD?r.tot/WORLD*100:0,like=likeCountry(r.tot);
 h+='<p class="gfpp-big">'+fmt(r.tot)+' people</p><p class="gfpp-sub">'+(A.km2?Math.round(A.km2).toLocaleString()+' km² · '+(dens>=10?Math.round(dens).toLocaleString():dens.toFixed(1))+' per km² · ':'')+(share>=.01?share.toFixed(share>=1?1:2):"<0.01")+'% of the world'+(share>=.5?' (1 in '+Math.round(100/share)+')':'')+'</p>';
 if(like&&!(A.code&&A.code===like))h+='<p class="gfpp-like">About as many people as <b>'+esc(cname(like))+'</b></p>';
 if(i===sel){
  if(r.parts&&r.parts.length>1){h+='<div class="gfpp-bar">'+r.parts.map((p,k)=>'<span style="width:'+(p.v/r.tot*100)+'%;background:'+PART[k%PART.length]+'" title="Part '+(k+1)+': '+fmt(p.v)+'">'+(p.v/r.tot>.14?Math.round(p.v/r.tot*100)+'%':'')+'</span>').join("")+'</div><ol class="gfpp-parts">'+r.parts.map((p,k)=>'<li style="--p:'+PART[k%PART.length]+'"><i></i>'+fmt(p.v)+' <small>'+(p.v/r.tot*100).toFixed(1)+'%</small></li>').join("")+'</ol>'}
  const C=r.countries.filter(o=>o.v/r.tot>.002).slice(0,6);if(C.length>1||(C.length===1&&!A.code))h+='<p class="gfpp-k">Countries</p><ul class="gfpp-cty">'+C.map(o=>'<li><span>'+esc(cname(o.c))+'</span><b>'+fmtS(o.v)+'</b></li>').join("")+(r.countries.length>C.length?'<li class="more">+ '+(r.countries.length-C.length)+' more</li>':'')+'</ul>';
  const ci=citiesIn(r.m,6);if(ci.length)h+='<p class="gfpp-k">Main cities inside</p><p class="gfpp-cities">'+ci.map(c=>(c.cap?'★ ':'')+esc(c.n)).join(" · ")+'</p>';
  h+='<div class="gfpp-acts"><button type="button" data-half>Split in half</button>'+(A.cuts.length?'<button type="button" data-uncut>Clear cuts</button>':'')+'</div>'}
 return h+'</div>'}
function compare(){if(areas.length<2||areas.some(a=>!a.res))return"";const L=areas.map((a,i)=>({a,i,v:a.res.tot})).sort((x,y)=>y.v-x.v),mx=L[0].v||1;
 return'<div class="gfpp-cmp"><p class="gfpp-k">Compared</p>'+L.map(o=>'<div class="gfpp-cr"><span>'+esc(o.a.name)+'</span><i style="width:'+Math.max(2,o.v/mx*100)+'%;background:'+o.a.col+'"></i><b>'+fmtS(o.v)+'</b></div>').join("")+'</div>'}
function render(){const p=mount();if(!p)return;if(!on){p.remove();panel=null;return}
 const T=TOOLS.map(t=>'<button type="button" data-t="'+t[0]+'" class="'+(tool===t[0]?"on":"")+'" title="'+esc(t[2]+": "+t[3])+'"'+(t[0]==="split"&&!areas.length?" disabled":"")+'><i>'+t[1]+'</i>'+t[2]+'</button>').join("");
 let ex="";
 if(tool==="place")ex='<form class="gfpp-place"><input type="search" placeholder="A city or country, e.g. Lagos" value="'+esc(placeQ)+'" list="gfppList"><input type="number" min="5" max="5000" step="5" value="'+placeKm+'" aria-label="Distance in km"> km<button type="submit">Count</button><datalist id="gfppList">'+cities().slice(0,900).map(c=>'<option value="'+esc(c.n)+'">').join("")+'</datalist></form>';
 if(tool==="grow")ex='<div class="gfpp-seg">'+[[1e8,"100 million"],[5e8,"500 million"],[1e9,"1 billion"],[1e12,"Half of humanity"]].map(([v,l])=>'<button type="button" data-g="'+v+'" class="'+(growT===v?"on":"")+'">'+l+'</button>').join("")+'</div>';
 p.innerHTML='<div class="gfpp-h" title="Drag to move"><b>👥 People counter</b>'+(areas.length?'<button type="button" class="gfpp-clr" title="Remove every area">Clear</button>':'')+'<button type="button" class="gfpp-x" aria-label="Close">×</button></div>'+
  '<div class="gfpp-tools">'+T+'</div>'+ex+'<p class="gfpp-hint'+(tool?" act":"")+'">'+hint()+'</p>'+(busy?'<p class="gfpp-hint">Growing the circle…</p>':'')+
  (POP?'':'<p class="gfpp-hint">Loading the people grid…</p>')+'<div class="gfpp-list">'+areas.map(areaCard).join("")+'</div>'+compare()+
  '<p class="gfpp-src">People: GHS-POP 2025 (European Commission JRC, CC BY 4.0), counted in cells about 11 km across, so small areas and coasts are approximate.</p>';
 p.querySelector(".gfpp-x").onclick=stop;const cl=p.querySelector(".gfpp-clr");if(cl)cl.onclick=()=>{areas=[];sel=-1;if(tool==="split")tool=null;render()};
 p.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>setTool(b.dataset.t));
 p.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{growT=+b.dataset.g;render()});
 p.querySelectorAll("[data-a]").forEach(d=>d.addEventListener("click",e=>{if(e.target.closest("button,[contenteditable]"))return;sel=+d.dataset.a;render()}));
 p.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{areas.splice(+b.dataset.del,1);sel=Math.min(sel,areas.length-1);render()});
 p.querySelectorAll("[data-nm]").forEach(b=>{b.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();b.blur()}};b.onblur=()=>{const A=areas[+b.dataset.nm];if(A){A.name=b.textContent.trim()||A.name;render()}}});
 const hf=p.querySelector("[data-half]");if(hf)hf.onclick=()=>half(areas[sel]);
 const uc=p.querySelector("[data-uncut]");if(uc)uc.onclick=()=>{const A=areas[sel];if(A){A.cuts=[];recount(A);render()}};
 const f=p.querySelector(".gfpp-place");if(f){const [q,k]=f.querySelectorAll("input");f.onsubmit=e=>{e.preventDefault();placeQ=q.value;placeKm=Math.max(5,Math.min(5000,+k.value||200));aroundPlace(placeQ,placeKm)};setTimeout(()=>q.focus(),0)}}
/* split in half: a north–south line at the people's median longitude */
function half(A){if(!A||!A.res||!POP)return;const m=A.res.m;const col=new Float64Array(m.w);let tot=0;for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.at(i,j))continue;const v=POP[(m.r0+j)*W+(m.c0+i)];col[i]+=v;tot+=v}
 let acc=0,ci=0;for(;ci<m.w;ci++){acc+=col[ci];if(acc>=tot/2)break}const lo=(m.c0+ci+.5)*STEP-180;let la0=90,la1=-90;A.rings.forEach(r=>r.forEach(q=>{la0=Math.min(la0,q[1]);la1=Math.max(la1,q[1])}));
 A.cuts=[[[lo,la1+1],[lo,la0-1]]];recount(A);render()}
function circleRing(c,km){const deg=km/R_KM*180/Math.PI;return d3.geoCircle().center(c).radius(Math.min(179,deg)).precision(Math.max(.5,deg/60))().coordinates[0]}
function aroundPlace(q,km){q=String(q||"").trim().toLowerCase();if(!q)return;let ll=null,name=null;const c=cities().find(c=>c.n.toLowerCase()===q)||cities().find(c=>c.n.toLowerCase().startsWith(q));
 if(c){ll=c.ll;name=c.n}else{try{for(const code in COUNTRY_BY_CODE){const C=COUNTRY_BY_CODE[code];if(C&&C.n&&C.n.toLowerCase()===q){const f=projFeatures().find(f=>String(f.properties.c).toLowerCase()===code);if(f){ll=d3.geoCentroid(f);name=C.n}break}}}catch(e){}}
 if(!ll){const p=panel&&panel.querySelector(".gfpp-hint");if(p)p.textContent="Couldn’t find “"+q+"”. Try a city name from the list.";return}
 addArea({rings:[circleRing(ll,km)],name:"Within "+km.toLocaleString()+" km of "+name,kind:"circle",c:ll,km});fly(ll)}
function fly(ll){try{const g=G();if(g&&g.flyTo)g.flyTo(ll)}catch(e){}}
/* grow: the smallest circle round a point that holds the target */
function grow(c){if(!POP||busy)return;const target=growT>=1e12?WORLD/2:growT;busy=true;render();
 setTimeout(()=>{let lo=5,hi=19000,best=null,res=null;for(let k=0;k<22;k++){const mid=Math.sqrt(lo*hi),A={rings:[circleRing(c,mid)],cuts:[]},r=count(A);if(!r)break;if(r.tot>=target){hi=mid;best=mid;res=r}else lo=mid;if(hi/lo<1.01)break}
  busy=false;if(!best){render();return}const lab=growT>=1e12?"Half of humanity":fmtS(target)+" people";addArea({rings:[circleRing(c,best)],name:lab+" within "+Math.round(best).toLocaleString()+" km",kind:"circle",c,km:best})},30)}

/* ---------- the map: pointer ---------- */
const inUI=e=>e.target.closest&&e.target.closest(".gfpp,.globe-btns,.gfk-tray,.gfk-panel,.gf-xs,.gfth,.ps-card,button,a,input,select,textarea");
function local(e){const g=G(),r=g.canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
function inv(q){const g=G();if(!g)return null;try{const ll=g.projection().invert(q);if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return null;if(!g._flat){const ro=g.projection().rotate();if(d3.geoDistance(ll,[-ro[0],-ro[1]])>Math.PI/2)return null}return ll}catch(e){return null}}
function eat(e){e.stopImmediatePropagation();e.preventDefault();eatUntil=Date.now()+450}let eatUntil=0;
function cancel(){drawing=null;poly=null}
function down(e){if(!on||!tool||tool==="place"||inUI(e))return;const g=G();if(!g||!g.host.contains(e.target))return;
 if(e.button===2){if(drawing||poly){eat(e);cancel()}return}if(e.button)return;
 if(tool==="country"){drawing={k:"click",x:e.clientX,y:e.clientY,id:e.pointerId};return}
 if(tool==="grow"){drawing={k:"click",x:e.clientX,y:e.clientY,id:e.pointerId};return}
 if(tool==="poly"){eat(e);return}
 if(tool==="split"&&!areas[sel])return;
 eat(e);drawing={k:tool,pts:[local(e)],id:e.pointerId}}
function move(e){const g=G();if(!on||!g)return;if(poly){poly.hover=local(e)}if(!drawing||e.pointerId!==drawing.id||drawing.k==="click")return;eat(e);const p=local(e);
 if(drawing.k==="lasso"){const l=drawing.pts[drawing.pts.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>4)drawing.pts.push(p)}else drawing.pts[1]=p}
function up(e){const g=G();if(!on||!g)return;
 if(tool==="poly"&&!drawing&&e.button===0&&!inUI(e)&&g.host.contains(e.target)){eat(e);const p=local(e);if(!poly)poly={pts:[]};const f=poly.pts[0];
  if(poly.pts.length>=3&&f&&Math.hypot(p[0]-f[0],p[1]-f[1])<10){finishPoly();return}const l=poly.pts[poly.pts.length-1];if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>3)poly.pts.push(p);return}
 if(!drawing||e.pointerId!==drawing.id)return;const D=drawing;drawing=null;
 if(D.k==="click"){if(Math.hypot(e.clientX-D.x,e.clientY-D.y)>5)return;
  if(tool==="grow"){const ll=inv(local(e));if(!ll)return;eat(e);grow(ll);return}
  if(window.gfClickGuard&&!gfClickGuard.ok(e))return;const h=g.hit&&g.hit(e.clientX,e.clientY),code=h&&h.code;if(!code)return;eat(e);
  let rings=[];try{projFeatures().filter(f=>f.geometry&&String(f.properties.c).toLowerCase()===code).forEach(f=>{const G2=f.geometry,P=G2.type==="Polygon"?[G2.coordinates]:G2.type==="MultiPolygon"?G2.coordinates:[];P.forEach(pl=>pl.forEach(r=>rings.push(r)))})}catch(_){}if(!rings.length)return;
  let km2=0;try{km2=COUNTRY_AREA_KM2[code]||0}catch(_){}addArea({rings,name:cname(code),code,kind:"country",km2});return}
 eat(e);const pts=D.pts;
 if(D.k==="split"){if(pts.length<2||Math.hypot(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1])<10)return;const a=inv(pts[0]),b=inv(pts[1]);if(!a||!b)return;const A=areas[sel];if(!A)return;A.cuts.push([a,b]);recount(A);render();return}
 if(D.k==="lasso"){if(pts.length<6)return;const ring=pts.map(inv).filter(Boolean);if(ring.length<4)return;ring.push(ring[0]);addArea({rings:[ring],name:"Your area "+(areas.length+1),kind:"free"});return}
 if(D.k==="circle"){if(pts.length<2)return;const c=inv(pts[0]),b=inv(pts[1]);if(!c||!b)return;const km=d3.geoDistance(c,b)*R_KM;if(km<5)return;addArea({rings:[circleRing(c,km)],name:"Circle of "+Math.round(km).toLocaleString()+" km",kind:"circle",c,km});return}
 if(D.k==="box"){if(pts.length<2)return;const [p0,p1]=pts,x0=Math.min(p0[0],p1[0]),x1=Math.max(p0[0],p1[0]),y0=Math.min(p0[1],p1[1]),y1=Math.max(p0[1],p1[1]);if(x1-x0<8||y1-y0<8)return;
  const ring=[];const N=24;for(let k=0;k<=N;k++)ring.push([x0+(x1-x0)*k/N,y0]);for(let k=1;k<=N;k++)ring.push([x1,y0+(y1-y0)*k/N]);for(let k=1;k<=N;k++)ring.push([x1-(x1-x0)*k/N,y1]);for(let k=1;k<=N;k++)ring.push([x0,y1-(y1-y0)*k/N]);
  const R=ring.map(inv).filter(Boolean);if(R.length<8)return;R.push(R[0]);addArea({rings:[R],name:"Box "+(areas.length+1),kind:"box"});return}}
function finishPoly(){if(!poly||poly.pts.length<3){poly=null;return}const R=poly.pts.map(inv).filter(Boolean);poly=null;if(R.length<3)return;R.push(R[0]);addArea({rings:[R],name:"Polygon "+(areas.length+1),kind:"poly"})}
if(!window._gfPpL){window._gfPpL=1;addEventListener("pointerdown",down,true);addEventListener("pointermove",move,true);addEventListener("pointerup",up,true);
 addEventListener("click",e=>{if(on&&Date.now()<eatUntil){e.stopImmediatePropagation();e.preventDefault()}},true);
 addEventListener("dblclick",e=>{if(on&&tool==="poly"&&poly){e.stopImmediatePropagation();e.preventDefault();finishPoly()}},true);
 addEventListener("contextmenu",e=>{if(on&&tool&&(drawing||poly)){e.preventDefault();cancel()}},true);
 addEventListener("keydown",e=>{if(!on)return;if(e.target.closest&&e.target.closest("input,textarea,[contenteditable]"))return;
  if(e.key==="Enter"&&poly){e.preventDefault();finishPoly();return}
  if(e.key==="Escape"){if(drawing||poly){cancel();e.stopImmediatePropagation();return}if(tool){setTool(null);e.stopImmediatePropagation()}}},true)}

/* ---------- drawing over the map ---------- */
function loop(){cancelAnimationFrame(raf);if(!on)return;raf=requestAnimationFrame(loop);const g=G();if(!g||!ov)return;const c=g.canvas,r=c.getBoundingClientRect(),hr=g.host.getBoundingClientRect(),dpr=(window.gfDpr?gfDpr():Math.min(2,devicePixelRatio||1));
 if(ov.width!==Math.round(r.width*dpr)||ov.height!==Math.round(r.height*dpr)){ov.width=Math.round(r.width*dpr);ov.height=Math.round(r.height*dpr);ov.style.width=r.width+"px";ov.style.height=r.height+"px"}
 ov.style.left=(r.left-hr.left)+"px";ov.style.top=(r.top-hr.top)+"px";const x=ov.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);const pr=g.projection();
 const vis=ll=>{if(g._flat)return true;const ro=pr.rotate();return d3.geoDistance(ll,[-ro[0],-ro[1]])<Math.PI/2};
 const ringPath=R=>{let pen=false,last=null;R.forEach(ll=>{const q=vis(ll)&&pr(ll);if(!q||!isFinite(q[0])){pen=false;return}if(pen&&last&&Math.abs(q[0]-last[0])>r.width/2)pen=false;pen?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);pen=true;last=q})};
 areas.forEach((A,i)=>{x.beginPath();A.rings.forEach(ringPath);x.globalAlpha=i===sel?.16:.1;x.fillStyle=A.col;x.fill("evenodd");x.globalAlpha=1;x.lineJoin="round";x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=i===sel?5:4;x.stroke();x.strokeStyle=A.col;x.lineWidth=i===sel?2.6:1.8;x.stroke();
  A.cuts.forEach(s=>{const q1=pr(s[0]),q2=pr(s[1]);if(!q1||!q2)return;x.setLineDash([8,6]);x.strokeStyle="#fff";x.lineWidth=5;x.beginPath();x.moveTo(q1[0],q1[1]);x.lineTo(q2[0],q2[1]);x.stroke();x.strokeStyle="#1d2433";x.lineWidth=2.3;x.stroke();x.setLineDash([])});
  const res=A.res;if(!res)return;
  const lab=(ll,t,col)=>{if(!ll||!vis(ll))return;const q=pr(ll);if(!q)return;x.font="800 12.5px system-ui,sans-serif";const w=x.measureText(t).width+14;x.fillStyle=col;x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(q[0]-w/2,q[1]-11,w,22,11):x.rect(q[0]-w/2,q[1]-11,w,22);x.fill();x.stroke();x.fillStyle="#fff";x.textAlign="center";x.textBaseline="middle";x.fillText(t,q[0],q[1]+.5)};
  if(res.parts&&res.parts.length>1)res.parts.forEach((p,k)=>lab(p.c,fmtS(p.v)+" · "+Math.round(p.v/res.tot*100)+"%",PART[k%PART.length]));else lab(res.c,fmtS(res.tot),A.col)});
 /* the shape being drawn */
 x.setLineDash([6,5]);x.strokeStyle="#1d2433";x.lineWidth=2;
 if(drawing&&drawing.pts){const P=drawing.pts;x.beginPath();
  if(drawing.k==="lasso"){P.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]))}
  else if(P[1]){if(drawing.k==="circle"){const rr=Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1]);x.arc(P[0][0],P[0][1],rr,0,2*Math.PI);const a=inv(P[0]),b=inv(P[1]);if(a&&b){x.stroke();x.beginPath();x.setLineDash([]);x.font="800 12px system-ui";x.fillStyle="#1d2433";x.fillText(Math.round(d3.geoDistance(a,b)*R_KM).toLocaleString()+" km",P[0][0]+6,P[0][1]-6)}}
   else if(drawing.k==="box")x.rect(Math.min(P[0][0],P[1][0]),Math.min(P[0][1],P[1][1]),Math.abs(P[1][0]-P[0][0]),Math.abs(P[1][1]-P[0][1]));
   else{x.moveTo(P[0][0],P[0][1]);x.lineTo(P[1][0],P[1][1])}}
  x.stroke()}
 if(poly&&poly.pts.length){x.beginPath();poly.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));if(poly.hover)x.lineTo(poly.hover[0],poly.hover[1]);x.stroke();x.setLineDash([]);poly.pts.forEach((p,i)=>{x.beginPath();x.arc(p[0],p[1],i?3.5:5.5,0,2*Math.PI);x.fillStyle=i?"#fff":"#1d2433";x.fill();x.strokeStyle="#1d2433";x.lineWidth=1.5;x.stroke()})}
 x.setLineDash([])}

/* ---------- on and off ---------- */
function start(o){const g=G();if(!g)return;on=true;load().then(()=>{areas.forEach(a=>a.res=count(a));render()}).catch(()=>{});mount();if(o&&o.tool)setTool(o.tool);else{tool=null;sync()}render();loop()}
function stop(){on=false;tool=null;drawing=null;poly=null;if(panel){panel.remove();panel=null}if(ov){ov.remove();ov=null}cancelAnimationFrame(raf);sync()}
/* off the Maps page: close */
setInterval(()=>{try{if(on&&(appMode!=="allmaps"||!G()))stop()}catch(e){}},800);
/* the Population map opens it (not drawing); leaving the Population map closes it if that map opened it */
let autoOn=false,lastM=null;setInterval(()=>{try{const m=mapMode();if(m===lastM)return;const prev=lastM;lastM=m;if(typeof ps!=="undefined"&&ps)return;
 if(m==="population"&&!on){setTimeout(()=>{if(mapMode()==="population"&&!on){autoOn=true;start()}},350)}else if(prev==="population"&&on&&autoOn){autoOn=false;stop()}}catch(e){}},400);

/* ---------- the Toolkit slot and a quick button on the Population map ---------- */
const ART='<svg viewBox="0 0 100 100" class="gfk-art"><ellipse cx="50" cy="92" rx="36" ry="5" fill="#000" opacity=".18"/><g stroke="#4a2e14" stroke-width="2.2"><circle cx="30" cy="38" r="11" fill="#e8b98a"/><path d="M12 84c0-14 8-26 18-26s18 12 18 26z" fill="#2f6fb0"/><circle cx="70" cy="38" r="11" fill="#c98b5a"/><path d="M52 84c0-14 8-26 18-26s18 12 18 26z" fill="#c2491f"/><circle cx="50" cy="30" r="12.5" fill="#f1cfa5"/><path d="M29 86c0-16 9-30 21-30s21 14 21 30z" fill="#2e8b57"/></g><g font-family="Georgia,serif" font-weight="800" font-size="13" fill="#fff" text-anchor="middle"><text x="50" y="80">123</text></g></svg>';
function addSlot(){const felt=document.querySelector("#gfKit .gfk-felt");if(!felt||felt.querySelector(".gfk-people"))return;
 const b=document.createElement("button");b.type="button";b.className="gfk-slot gfk-people";b.title="People counter: how many people live in an area";b.setAttribute("aria-label","People counter");
 b.innerHTML=ART+"<span>People</span>";b.onclick=e=>{e.stopPropagation();if(on){autoOn=false;stop()}else{autoOn=false;start({tool:"lasso"})}};
 const th=felt.querySelector(".gfk-thermo");if(th&&th.nextSibling)felt.insertBefore(b,th.nextSibling);else felt.appendChild(b);sync()}
setInterval(addSlot,700);addSlot();
const ICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/></svg>';
setInterval(()=>{try{const g=G(),btns=g&&g.host.querySelector(".globe-btns");if(!btns)return;let b=btns.querySelector(".gfpp-ico");const want=mapMode()==="population";
 if(!want){if(b)b.remove();return}if(!b){b=document.createElement("button");b.type="button";b.className="gfpp-ico";b.title="People counter";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();if(on){autoOn=false;stop()}else start()};btns.appendChild(b)}b.classList.toggle("on",on)}catch(e){}},600);

const css=document.createElement("style");css.textContent=`
.gfpp-ov{ position:absolute; left:0; top:0; pointer-events:none; z-index:30; }
.globe-host.gfpp-draw canvas{ cursor:crosshair !important; }
.gfpp-ico{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; color:#b3401f; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }
.gfpp-ico.on{ background:#c2491f; color:#fff; }
.gfpp{ position:absolute; left:12px; top:60px; width:318px; max-height:calc(100% - 80px); overflow:auto; z-index:41; background:rgba(255,255,255,.97); border-radius:14px; box-shadow:0 6px 24px rgba(0,0,0,.25); padding:10px 12px; font:13px/1.4 system-ui,sans-serif; color:#1d2433; }
.gfpp.gfpp-float{ position:fixed; z-index:1200; max-height:calc(100vh - 20px); }
body.sky-night .gfpp{ background:rgba(24,31,52,.97); color:#e8ecf3; }
.gfpp-h{ display:flex; align-items:center; gap:6px; cursor:move; margin-bottom:6px; } .gfpp-h b{ font-size:14px; flex:1; }
.gfpp-h button{ border:0; background:none; cursor:pointer; color:inherit; } .gfpp-x{ font-size:19px; opacity:.7; } .gfpp-clr{ font:700 11.5px system-ui; opacity:.7; text-decoration:underline; }
.gfpp-tools{ display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin-bottom:6px; }
.gfpp-tools button{ display:flex; flex-direction:column; align-items:center; gap:1px; border:1px solid rgba(194,73,31,.25); background:rgba(194,73,31,.05); border-radius:9px; padding:4px 2px; font:700 10.5px system-ui; color:inherit; cursor:pointer; }
.gfpp-tools button i{ font-style:normal; font-size:15px; line-height:1.1; } .gfpp-tools button.on{ background:#c2491f; color:#fff; border-color:#c2491f; } .gfpp-tools button:disabled{ opacity:.4; cursor:default; }
.gfpp-hint{ font-size:12.3px; opacity:.85; margin:4px 0; } .gfpp-hint.act{ background:rgba(194,73,31,.1); border-radius:8px; padding:5px 8px; opacity:1; }
.gfpp-place{ display:flex; gap:4px; align-items:center; margin:2px 0 4px; font-size:12px; } .gfpp-place input[type=search]{ flex:1; min-width:0; } .gfpp-place input{ border:1px solid #ccd3dd; border-radius:7px; padding:4px 6px; font:12.5px system-ui; } .gfpp-place input[type=number]{ width:62px; }
.gfpp-place button{ border:0; background:#c2491f; color:#fff; border-radius:7px; padding:5px 9px; font:700 12px system-ui; cursor:pointer; }
.gfpp-seg{ display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 4px; } .gfpp-seg button{ border:1px solid rgba(194,73,31,.3); background:none; color:inherit; border-radius:999px; padding:3px 9px; font:700 11.5px system-ui; cursor:pointer; } .gfpp-seg button.on{ background:#c2491f; color:#fff; }
.gfpp-area{ border-left:4px solid var(--c); background:rgba(0,0,0,.03); border-radius:8px; padding:6px 8px; margin:6px 0; cursor:pointer; } .gfpp-area.sel{ background:rgba(0,0,0,.055); box-shadow:inset 0 0 0 1px rgba(0,0,0,.06); }
body.sky-night .gfpp-area{ background:rgba(255,255,255,.04); } body.sky-night .gfpp-area.sel{ background:rgba(255,255,255,.08); }
.gfpp-at{ display:flex; align-items:center; gap:6px; } .gfpp-at i{ width:10px; height:10px; border-radius:50%; background:var(--c); flex:none; } .gfpp-at b{ flex:1; font-size:13px; outline:none; } .gfpp-at b:focus{ text-decoration:underline dotted; }
.gfpp-at button{ border:0; background:none; cursor:pointer; color:inherit; opacity:.5; } .gfpp-at button:hover{ opacity:1; }
.gfpp-big{ font-size:20px; font-weight:800; color:var(--c); margin:2px 0 0; } .gfpp-sub{ font-size:11.5px; opacity:.75; margin:0 0 3px; } .gfpp-like{ font-size:12px; margin:2px 0; }
.gfpp-k{ font:800 10.5px system-ui; text-transform:uppercase; letter-spacing:.05em; opacity:.6; margin:7px 0 2px; }
.gfpp-cty{ list-style:none; margin:0; padding:0; font-size:12px; } .gfpp-cty li{ display:flex; justify-content:space-between; gap:8px; padding:1px 0; } .gfpp-cty li.more{ opacity:.6; }
.gfpp-cities{ font-size:12px; margin:0; }
.gfpp-bar{ display:flex; height:20px; border-radius:6px; overflow:hidden; margin:6px 0 3px; font:700 10.5px system-ui; color:#fff; } .gfpp-bar span{ display:flex; align-items:center; justify-content:center; overflow:hidden; white-space:nowrap; }
.gfpp-parts{ margin:0; padding:0 0 0 2px; list-style:none; font-size:12px; } .gfpp-parts li{ display:flex; align-items:center; gap:6px; } .gfpp-parts i{ width:9px; height:9px; border-radius:2px; background:var(--p); } .gfpp-parts small{ opacity:.65; }
.gfpp-acts{ margin-top:6px; display:flex; gap:5px; } .gfpp-acts button{ border:1px solid rgba(0,0,0,.15); background:none; color:inherit; border-radius:999px; padding:3px 10px; font:700 11.5px system-ui; cursor:pointer; }
.gfpp-cmp{ margin-top:6px; } .gfpp-cr{ display:grid; grid-template-columns:96px 1fr 46px; align-items:center; gap:6px; font-size:11.5px; margin:2px 0; } .gfpp-cr span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .gfpp-cr i{ height:10px; border-radius:5px; display:block; } .gfpp-cr b{ text-align:right; }
.gfpp-src{ font-size:10.3px; opacity:.55; margin:6px 0 0; }`;document.head.appendChild(css);
/* the old Count people tool's helpers, still used by the toolkit's shape labels */
window.gfPopCount={load,count:rings=>count({rings,cuts:[]})};
window.gfPeople={start,stop,setTool,areas:()=>areas,count:(rings)=>{const A={rings,cuts:[]};return count(A)},load};
})();
