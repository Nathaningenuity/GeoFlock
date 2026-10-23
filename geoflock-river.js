/* GeoFlock: "Trace the River" — follow a great river from source to sea by clicking the countries it flows through, in order.
   Where a river forms a border, both countries on its banks belong to the same step and can be clicked in either order. */
(function(){
if(typeof NEW_GAMES==="undefined"||typeof ALLMAPS_RIVERS==="undefined"||typeof d3==="undefined"||typeof projFeatures!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nm=c=>(COUNTRY_BY_CODE[c]||{}).n||c.toUpperCase();
/* unrotated, so it lines up with the relief picture and the river paths (the Maps page projection can be spun) */
const PROJ=d3.geoRobinson().scale(318.31).translate([1e3,500.5]),W=2000,H=1000,ROUNDS=5;
/* steps from source to mouth; src/sea are [lon,lat] for the markers */
const RIVERS=[
 {n:"Danube",parts:["Danube"],steps:[["de"],["at"],["sk","hu"],["hr","rs"],["ro","bg"],["md","ua"]],src:[8.2,48],sea:[29.7,45.2],fact:"The Danube flows through or along ten countries, more than any other river, and past four capitals: Vienna, Bratislava, Budapest and Belgrade."},
 {n:"Rhine",parts:["Rhine"],steps:[["ch"],["li","at"],["de","fr"],["nl"]],src:[8.7,46.6],sea:[4.1,51.98],fact:"Rotterdam, at the Rhine’s mouth, is Europe’s busiest port; barges carry goods up the river as far as Basel in Switzerland."},
 {n:"Mekong",parts:["Mekong"],steps:[["cn"],["mm","la"],["th"],["kh"],["vn"]],src:[94.7,33.4],sea:[106.6,9.7],fact:"The Mekong feeds the biggest freshwater fishery in the world. Vietnam’s Mekong Delta grows about half the country’s rice."},
 {n:"Nile",parts:["Nile","White Nile"],steps:[["ug"],["ss"],["sd"],["eg"]],src:[33.2,0.45],sea:[31.2,31.5],fact:"From Lake Victoria the White Nile crosses the Sudd swamps, meets the Blue Nile at Khartoum, then crosses the Sahara with no rain at all to Egypt."},
 {n:"Niger",parts:["Niger"],steps:[["gn"],["ml"],["ne"],["bj"],["ng"]],src:[-10.7,9.1],sea:[6.1,4.3],fact:"The Niger starts only about 250 km from the Atlantic but flows inland, away from the sea, curving through the Sahara past Timbuktu."},
 {n:"Amazon",parts:["Amazonas","Ucayali"],steps:[["pe"],["co"],["br"]],src:[-71.8,-15.5],sea:[-50,-0.2],fact:"The Amazon carries about a fifth of all the river water flowing into the world’s oceans. It touches Colombia only at the port of Leticia."},
 {n:"Congo",parts:["Congo"],steps:[["cd"],["cg"],["ao"]],src:[26,-11],sea:[12.3,-6],fact:"The Congo crosses the equator twice and is the deepest river ever measured, over 220 m deep in places. Its mouth lies between DR Congo and Angola."},
 {n:"Zambezi",parts:["Zambezi"],steps:[["zm"],["ao"],["na","bw"],["zw"],["mz"]],src:[24.3,-11.4],sea:[36.3,-18.8],fact:"The Zambezi plunges over Victoria Falls on the border of Zambia and Zimbabwe, then fills Lake Kariba, one of the largest reservoirs on Earth."},
 {n:"Indus",parts:["Indus"],steps:[["cn"],["in"],["pk"]],src:[81.2,31.2],sea:[67.4,24],fact:"The Indus rises in Tibet, crosses Ladakh in India, then carries the water that most of Pakistan’s farms depend on."},
 {n:"Brahmaputra",parts:["Brahmaputra"],steps:[["cn"],["in"],["bd"]],src:[82.2,30.3],sea:[91,22.6],fact:"In Tibet it is the Yarlung Tsangpo, which cuts one of the deepest canyons on Earth around the Himalaya before turning south into India."},
 {n:"Euphrates",parts:["Euphrates"],steps:[["tr"],["sy"],["iq"]],src:[41,39.8],sea:[48.5,30.0],fact:"The Euphrates joins the Tigris in southern Iraq to form the Shatt al-Arab, which flows into the Persian Gulf."},
 {n:"Dnieper",parts:["Dnieper"],steps:[["ru"],["by"],["ua"]],src:[33.4,55.9],sea:[31.9,46.6],fact:"The Dnieper flows through Kyiv, and a chain of dams turned much of its length in Ukraine into large reservoirs."},
 {n:"Oder",parts:["Oder"],steps:[["cz"],["pl"],["de"]],src:[17.6,49.6],sea:[14.3,53.9],fact:"Since 1945 the Oder and its tributary the Neisse have formed most of the border between Germany and Poland."},
 {n:"Orange",parts:["Orange"],steps:[["ls"],["za"],["na"]],src:[28.9,-29.2],sea:[16.5,-28.6],fact:"It rises in the mountains of Lesotho, crosses South Africa and forms the border with Namibia before reaching the Atlantic."},
 {n:"Paraná",parts:["Paraná"],steps:[["br"],["py"],["ar"]],src:[-50.9,-20.1],sea:[-58.4,-34.3],fact:"The Paraná powers the Itaipu Dam on the Brazil–Paraguay border, then joins the Uruguay River to form the Río de la Plata."},
 {n:"Senegal",parts:["Sénégal","Bafing"],steps:[["gn"],["ml"],["mr","sn"]],src:[-10.4,10.5],sea:[-16.5,15.9],fact:"For its last 800 km the Senegal River forms the border between Senegal and Mauritania, before reaching the sea at Saint-Louis."},
 {n:"Irtysh",parts:["Irtysh"],steps:[["cn"],["kz"],["ru"]],src:[89.5,47.1],sea:[69,61],fact:"The Irtysh starts in the Altai mountains of China and is longer than the Ob, the river it flows into."}];
const R={on:false,deck:[],k:0,log:[],cur:null,vb:null};
function stats_(){try{return ngStats("gameRiver")}catch(e){return{}}}
let FEAT=null,BORD="";
function feats(){if(FEAT)return FEAT;const p=d3.geoPath(PROJ);FEAT=projFeatures().filter(f=>f.properties&&f.properties.c).map(f=>({c:f.properties.c,d:p(f)||"",ctr:p.centroid(f)}));BORD=FEAT.map(f=>f.d).join("");return FEAT}
function riverD(r){return ALLMAPS_RIVERS.filter(([n])=>r.parts.includes(n)).map(([,d])=>d).join("")}
function deal(){const L=RIVERS.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[L[i],L[j]]=[L[j],L[i]]}R.deck=L.slice(0,ROUNDS);R.k=0;R.log=[];start()}
function start(){const r=R.deck[R.k];R.cur={r,step:0,found:{},miss:0,stepMiss:0,shown:{},msg:"",done:false};R.vb=null;render()}
function clickC(c){const C=R.cur;if(!C||C.done)return;const r=C.r,st=r.steps[C.step];
 if(C.found[c]||C.shown[c]){return}
 if(st.includes(c)){C.found[c]=C.stepMiss?"late":"ok";C.msg="";try{if(!C.stepMiss&&typeof ppCredit==="function")ppCredit(c,"loc",false,"rv:"+r.n+":"+c)}catch(e){}advance();return}
 if(r.steps.slice(C.step+1).some(s=>s.includes(c))){C.msg=nm(c)+" is on the river, but further downstream. Where does it flow first?";flash(c,"later");return}
 C.miss++;C.stepMiss++;C.msg=C.stepMiss>=3?"":"Not "+nm(c)+". "+(C.stepMiss===2?"Hint: look just "+(C.step?"downstream of "+nm(r.steps[C.step-1][0]):"around the green source marker")+".":"Follow the blue line.");
 flash(c,"bad");if(C.stepMiss>=3){st.forEach(x=>{if(!C.found[x])C.shown[x]=1});C.msg="It was "+st.filter(x=>C.shown[x]).map(nm).join(" and ")+".";advance(true)}}
function advance(){const C=R.cur,st=C.r.steps[C.step];if(!st.every(x=>C.found[x]||C.shown[x])){render();return}
 C.step++;C.stepMiss=0;if(C.step>=C.r.steps.length){C.done=true;const pts=Math.max(0,100-15*C.miss-Object.keys(C.shown).length*10);C.pts=pts;R.log.push({n:C.r.n,pts});
  if(R.k===ROUNDS-1){try{const s=stats_();s.played=(s.played||0)+1;const tot=R.log.reduce((a,x)=>a+x.pts,0);if(tot>(s.best||0)){s.best=tot;R.newBest=true}else R.newBest=false;saveStats();if(typeof xpGain==="function")xpGain(Math.round(tot/25))}catch(e){}}}
 render()}
function flash(c,cls){const p=document.querySelector('#rvMap path[data-c="'+c+'"]');if(!p)return;p.classList.remove("bad","later");void p.getBBox();p.classList.add(cls);setTimeout(()=>p.classList.remove(cls),900);const m=document.getElementById("rvMsg");if(m)m.textContent=R.cur.msg}
function setup(){const v=document.getElementById("gamesView");const s=stats_();
 v.innerHTML='<div class="game-panel rv-panel"><div class="game-head"><h2>Trace the River</h2><p>follow a river from source to sea</p></div><div class="tut-body"><p>A great river is drawn in blue, with a green dot at its source. Click the countries it flows through, in order, until it reaches the sea.</p><p>Where the river forms a border, click both countries on its banks. Three misses and the answer is shown.</p><p class="level-note">Five rivers a round, up to 100 points each.'+(s.best?' Best: <b>'+s.best+'</b>':'')+'</p></div><div class="tut-actions"><button class="chip tut-go" id="rvGo">Start →</button></div></div>';
 document.getElementById("rvGo").onclick=()=>{R.on=true;deal()}}
function render(){const v=document.getElementById("gamesView");if(!v)return;if(!R.on)return setup();const C=R.cur,r=C.r;feats();
 const total=R.log.reduce((a,x)=>a+x.pts,0);
 const chips=r.steps.map((st,i)=>'<span class="rv-step'+(i<C.step?" done":i===C.step&&!C.done?" now":"")+'">'+st.map(c=>C.found[c]||C.shown[c]?'<b class="'+(C.shown[c]?"shown":C.found[c])+'">'+esc(nm(c))+'</b>':'<i>?</i>').join('<span class="rv-or">/</span>')+'</span>').join('<span class="rv-arrow">→</span>');
 v.innerHTML='<div class="game-panel rv-panel"><div class="rv-top"><b>'+(R.k+1)+' / '+ROUNDS+'</b><span>Trace the <b>'+esc(r.n)+'</b></span><span class="rv-score">'+total+' pts</span><button class="chip small" id="rvQuit">Quit</button></div>'+
  '<div class="rv-steps">'+chips+'<span class="rv-arrow">→</span><span class="rv-sea">🌊 sea</span></div>'+
  '<div class="rv-map" id="rvMapBox"><svg id="rvMap" viewBox="0 0 2000 1000" preserveAspectRatio="xMidYMid meet"></svg><div class="rv-zoom"><button class="chip small" data-z="1.4">+</button><button class="chip small" data-z="0.7">−</button></div></div>'+
  '<p class="rv-msg" id="rvMsg">'+esc(C.msg||(C.done?"":"Where does the "+r.n+" "+(C.step?"flow next?":"start?")))+'</p>'+
  (C.done?'<div class="rv-end"><p><b>'+C.pts+' points.</b> '+esc(r.fact)+'</p>'+(R.k<ROUNDS-1?'<button class="chip tut-go" id="rvNext">Next river →</button>':'<p class="rv-total">Round total: <b>'+total+'</b> of '+ROUNDS*100+(R.newBest?' · new best!':'')+'</p><button class="chip tut-go" id="rvAgain">Play again →</button>')+'</div>':'')+'</div>';
 drawMap();
 document.getElementById("rvQuit").onclick=()=>{R.on=false;setup()};
 const nx=document.getElementById("rvNext");if(nx)nx.onclick=()=>{R.k++;start()};
 const ag=document.getElementById("rvAgain");if(ag)ag.onclick=deal}
function drawMap(){const svg=document.getElementById("rvMap"),C=R.cur,r=C.r,F=feats();
 const lit=c=>C.found[c]?"found":C.shown[c]?"shown":"";
 let h='<image href="textures/reliefAllMaps.webp" x="0" y="-6.688" width="2000" height="1014.376" preserveAspectRatio="none"/>';
 h+='<g class="rv-cs">'+F.map(f=>'<path data-c="'+f.c+'" class="'+lit(f.c)+'" d="'+f.d+'"/>').join("")+'</g>';
 const rd=riverD(r);h+='<path class="rv-case" d="'+rd+'"/><path class="rv-line" d="'+rd+'"/>';
 const S=PROJ(r.src),M=PROJ(r.sea);if(S)h+='<circle class="rv-src" cx="'+S[0].toFixed(1)+'" cy="'+S[1].toFixed(1)+'" r="5"/>';if(M&&C.done)h+='<circle class="rv-mouth" cx="'+M[0].toFixed(1)+'" cy="'+M[1].toFixed(1)+'" r="5"/>';
 h+=F.filter(f=>lit(f.c)).map(f=>'<text class="rv-lab" x="'+f.ctr[0].toFixed(1)+'" y="'+f.ctr[1].toFixed(1)+'">'+esc(nm(f.c))+'</text>').join("");
 svg.innerHTML=h;
 /* the river data may start or end a little short of the true source or mouth: put the markers on the drawn line */
 try{const L=svg.querySelector(".rv-line"),len=L.getTotalLength(),n=Math.min(600,Math.ceil(len/2)),P=[];for(let i=0;i<=n;i++){const q=L.getPointAtLength(len*i/n);P.push([q.x,q.y])}
  const snap=(cls,xy)=>{const c=svg.querySelector("."+cls);if(!c||!xy)return;let b=null,bd=1e9;P.forEach(q=>{const d=Math.hypot(q[0]-xy[0],q[1]-xy[1]);if(d<bd){bd=d;b=q}});if(b){c.setAttribute("cx",b[0].toFixed(1));c.setAttribute("cy",b[1].toFixed(1))}};snap("rv-src",S);snap("rv-mouth",M)}catch(e){}
 /* frame the river with room around it */
 let vb=R.vb;if(!vb){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const pts=[S,M].filter(Boolean);try{const bb=svg.querySelector(".rv-line").getBBox();pts.push([bb.x,bb.y],[bb.x+bb.width,bb.y+bb.height])}catch(e){}
  pts.forEach(p=>{if(!isFinite(p[0]))return;x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});
  let w=Math.max(200,(x1-x0)*1.6),hh=Math.max(110,(y1-y0)*1.45);if(w/hh>2)hh=w/2;else w=hh*2;vb=[(x0+x1)/2-w/2,(y0+y1)/2-hh/2,w,hh];R.vb=vb}
 /* --rk is screen pixels per map unit, so lines and labels keep their on-screen size at any zoom */
 const apply=()=>{svg.setAttribute("viewBox",vb.map(x=>x.toFixed(2)).join(" "));const pw=svg.clientWidth||svg.getBoundingClientRect().width||W/2;svg.style.setProperty("--rk",(Math.min(pw,(svg.clientHeight||pw/2)*2)/vb[2]).toFixed(4));R.vb=vb.slice()};apply();
 const zoomAt=(f,mx,my)=>{const nw=Math.min(W,Math.max(40,vb[2]/f)),nh=nw/2,px=vb[0]+mx*vb[2],py=vb[1]+my*vb[3];vb=[px-mx*nw,py-my*nh,nw,nh];apply()};
 svg.onwheel=e=>{e.preventDefault();const b=svg.getBoundingClientRect();zoomAt(e.deltaY<0?1.25:0.8,(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height)};
 document.querySelectorAll(".rv-zoom [data-z]").forEach(b=>b.onclick=()=>zoomAt(+b.dataset.z,.5,.5));
 let drag=null,moved=false;const pts=new Map();const dist=()=>{const a=[...pts.values()];return a.length<2?0:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
 svg.onpointerdown=e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,vb:vb.slice(),d0:pts.size===2?dist():0};moved=false};
 svg.onpointermove=e=>{if(!drag)return;pts.set(e.pointerId,[e.clientX,e.clientY]);const b=svg.getBoundingClientRect();
  if(pts.size===2){const d=dist();if(drag.d0){const a=[...pts.values()];zoomAt(d/drag.d0,((a[0][0]+a[1][0])/2-b.left)/b.width,((a[0][1]+a[1][1])/2-b.top)/b.height);drag.d0=d;moved=true}else drag.d0=d;return}
  if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>5){moved=true;try{svg.setPointerCapture(e.pointerId)}catch(_){}}
  if(moved){const k=vb[2]/b.width;vb=[drag.vb[0]-(e.clientX-drag.x)*k,drag.vb[1]-(e.clientY-drag.y)*k,vb[2],vb[3]];apply()}};
 svg.onpointerup=svg.onpointercancel=e=>{pts.delete(e.pointerId);if(!pts.size)drag=null};
 svg.onclick=e=>{if(moved)return;const t=e.target.closest&&e.target.closest("path[data-c]");if(t)clickC(t.dataset.c)}}
NEW_GAMES.push(["river","Trace the River",render]);
try{GH_INFO.river=["route","Follow a river from source to sea","#2a7fc0"]}catch(e){}
const css=document.createElement("style");css.textContent=`
.rv-panel{ max-width:1100px; margin:0 auto; }
.rv-top{ display:flex; gap:12px; align-items:center; margin:4px 0 8px; } .rv-top .rv-score{ margin-left:auto; font-weight:800; }
.rv-steps{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin:0 0 8px; font-size:13px; }
.rv-step{ display:inline-flex; gap:4px; align-items:center; padding:4px 10px; border-radius:999px; background:rgba(255,255,255,.7); border:1px solid rgba(0,0,0,.08); }
.rv-step.now{ border-color:#2a7fc0; box-shadow:0 0 0 2px rgba(42,127,192,.25); } .rv-step i{ font-style:normal; opacity:.5; } .rv-step b.ok{ color:#1d7a3e; } .rv-step b.late{ color:#b26a00; } .rv-step b.shown{ color:#b4233c; }
.rv-or{ opacity:.4; } .rv-arrow{ opacity:.45; } .rv-sea{ opacity:.7; }
.rv-map{ position:relative; height:min(56vh,520px); border-radius:16px; overflow:hidden; background:#cfe3f1; touch-action:none; }
.rv-map svg{ width:100%; height:100%; display:block; cursor:pointer; }
.rv-zoom{ position:absolute; right:10px; top:10px; display:flex; flex-direction:column; gap:6px; }
#rvMap .rv-cs path{ fill:rgba(255,255,255,0) !important; stroke:rgba(40,40,30,.45) !important; stroke-width:calc(.8px / var(--rk,1)) !important; transition:fill .2s; }
#rvMap .rv-cs path:hover{ fill:rgba(255,255,255,.28) !important; }
#rvMap .rv-cs path.found{ fill:rgba(46,160,90,.42) !important; } #rvMap .rv-cs path.shown{ fill:rgba(214,69,93,.38) !important; }
#rvMap .rv-cs path.bad{ fill:rgba(214,40,60,.55) !important; } #rvMap .rv-cs path.later{ fill:rgba(240,170,40,.5) !important; }
#rvMap .rv-case{ fill:none !important; stroke:#fff !important; stroke-width:calc(6px / var(--rk,1)) !important; stroke-linecap:round; stroke-linejoin:round; pointer-events:none; opacity:.9; }
#rvMap .rv-line{ fill:none !important; stroke:#1f6fd1 !important; stroke-width:calc(3px / var(--rk,1)) !important; stroke-linecap:round; stroke-linejoin:round; pointer-events:none; }
#rvMap .rv-src{ fill:#2fae5a; stroke:#fff; stroke-width:calc(2px / var(--rk,1)); r:calc(6px / var(--rk,1)); pointer-events:none; } #rvMap .rv-mouth{ fill:#1f6fd1; stroke:#fff; stroke-width:calc(2px / var(--rk,1)); r:calc(6px / var(--rk,1)); pointer-events:none; }
#rvMap .rv-lab{ font:700 calc(12px / var(--rk,1)) system-ui,sans-serif; text-anchor:middle; fill:#14261a; paint-order:stroke; stroke:rgba(255,255,255,.9); stroke-width:calc(3px / var(--rk,1)); pointer-events:none; }
.rv-msg{ min-height:1.4em; margin:8px 0 0; font-weight:600; } .rv-end{ margin-top:8px; } .rv-end p{ margin:0 0 8px; line-height:1.5; }
body.sky-night .rv-step, body.dark-theme .rv-step{ background:rgba(255,255,255,.08); }`;
document.head.appendChild(css);
window.gfRiver={RIVERS,R};
})();
