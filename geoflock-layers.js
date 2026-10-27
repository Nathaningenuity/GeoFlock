/* GeoFlock: map layers on the Maps page — Resources (mines, fields, farms, power plants), Connections (shipping lanes,
   chokepoints, ports, undersea cables, pipelines, busiest flights) and Hazards (volcanoes, great earthquakes, cyclone
   paths, tsunamis). Each is a folded switch: the switch turns the layer on, its ▾ picks what to show. Currents keeps its own
   switch; Day & night is hidden for now.
   Drawn on the flat map as an SVG layer (icons keep the same size on screen when zooming) and on the globe's overlay.
   Data: geoflock-layers-data.js (GF_LAYER_DATA). */
(function(){
if(typeof renderAllMapsView!=="function"||typeof d3==="undefined")return;
const D=window.GF_LAYER_DATA||{resources:[],connections:{},hazards:{}};
const NS="http://www.w3.org/2000/svg";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- what each layer holds ---------- */
const RES_KIND={oil:["🛢️","Oil"],gas:["🔥","Natural gas"],coal:["⚫","Coal"],iron:["🔩","Iron ore"],copper:["🟠","Copper"],gold:["🪙","Gold"],silver:["🥈","Silver"],diamond:["💎","Diamonds"],lithium:["🔋","Lithium"],uranium:["☢️","Uranium"],aluminium:["🥫","Bauxite (aluminium)"],rare:["🧲","Rare earths"],nickel:["⚙️","Nickel"],cobalt:["🔵","Cobalt"],potash:["🌱","Potash (fertiliser)"],
 coffee:["☕","Coffee"],cocoa:["🍫","Cocoa"],tea:["🍵","Tea"],rice:["🍚","Rice"],wheat:["🌾","Wheat"],soy:["🫘","Soybeans"],palm:["🌴","Palm oil"],sugar:["🍬","Sugar cane"],cotton:["🧶","Cotton"],rubber:["🛞","Rubber"],fish:["🐟","Fishing"],
 nuclear:["⚛️","Nuclear power"],hydro:["💧","Hydropower dam"],solar:["☀️","Solar farm"],wind:["💨","Wind farm"],geothermal:["♨️","Geothermal power"]};
const RES_GROUPS=[["fuel","Oil, gas & coal","#7a4b2a",["oil","gas","coal"]],["metal","Metals & minerals","#6d7f95",["iron","copper","aluminium","nickel","cobalt","lithium","uranium","rare","potash","silver"]],["gem","Gold & diamonds","#d4a514",["gold","diamond"]],["farm","Farms & fishing","#4f9a3f",["coffee","cocoa","tea","rice","wheat","soy","palm","sugar","cotton","rubber","fish"]],["power","Power plants","#2f86c9",["nuclear","hydro","solar","wind","geothermal"]]];
const groupOf=k=>RES_GROUPS.find(g=>g[3].includes(k));
const CON_PARTS=[["lanes","Shipping lanes"],["choke","Chokepoints"],["ports","Big ports"],["cables","Undersea internet cables"],["pipes","Pipelines"],["flights","Busiest flights"]];
const HAZ_PARTS=[["volc","Volcanoes"],["quakes","Great earthquakes"],["cyc","Cyclone paths"],["tsu","Tsunamis"]];
const L={res:{on:false,parts:new Set(RES_GROUPS.map(g=>g[0]))},con:{on:false,parts:new Set(CON_PARTS.map(p=>p[0]))},haz:{on:false,parts:new Set(HAZ_PARTS.map(p=>p[0]))}};
window.GF_LAYERS=L;

/* volcano: a red triangle with a notch for the crater (peaks are brown triangles); centred on 0,0, about 18 units across */
const VOLC_D="M-9,7L-2.6,-8.4L-1,-6.4L1,-6.4L2.6,-8.4L9,7Z",PEAK_D="M0,-9.5L8.5,7L-8.5,7Z";
try{if(typeof SPOT_SVG!=="undefined"){SPOT_SVG.volcano='<svg viewBox="-11 -11 22 22"><path d="'+VOLC_D+'" fill="#d63a2a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';SPOT_SVG.mountain='<svg viewBox="-11 -11 22 22"><path d="'+PEAK_D+'" fill="#6d4b2f" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'}}catch(e){}
/* every drawable thing: {t:"pt"|"line", ll|line, icon, col, n, f, sz} */
function items(){const out=[];
 if(L.res.on)(D.resources||[]).forEach(r=>{const g=groupOf(r.k);if(!g||!L.res.parts.has(g[0]))return;const K=RES_KIND[r.k]||["•",r.k];out.push({t:"pt",ll:r.ll,icon:K[0],col:g[2],n:r.n,f:(K[1]+(r.c&&typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[r.c]?" · "+COUNTRY_BY_CODE[r.c].n:""))+(r.f?". "+r.f:""),lay:"res"})});
 if(L.con.on){const C=D.connections||{},P=L.con.parts;
  if(P.has("lanes"))(C.lanes||[]).forEach(x=>out.push({t:"line",line:x.line,col:"#1f6fb8",w:1+(x.w||1)*.8,dash:"",n:x.n,f:"Shipping lane",op:.75,lay:"con"}));
  if(P.has("cables"))(C.cables||[]).forEach(x=>out.push({t:"line",line:x.line,col:"#8a4fc7",w:1.2,dash:"",n:x.n,f:"Undersea internet cable"+(x.f?". "+x.f:"")+". Route: © TeleGeography, CC BY-SA 4.0",op:.8,lay:"con"}));
  if(P.has("pipes"))(C.pipelines||[]).forEach(x=>out.push({t:"line",line:x.line,col:x.k==="gas"?"#e07b1a":"#5a3a22",w:2,dash:"6 3",n:x.n,f:(x.k==="gas"?"Gas pipeline":"Oil pipeline")+(x.f?". "+x.f:""),op:.95,lay:"con"}));
  if(P.has("flights"))(C.flights||[]).forEach(x=>out.push({t:"line",line:[x.a,x.b],geo:true,col:"#d63b6a",w:1.4,dash:"2 4",n:"✈ "+x.n,f:x.f||"One of the world’s busiest flight routes",op:.9,lay:"con"}));
  if(P.has("choke"))(C.chokepoints||[]).forEach(x=>out.push({t:"pt",ll:x.ll,icon:"⚠️",col:"#d9534f",n:x.n,f:"Chokepoint. "+(x.f||""),lay:"con"}));
  if(P.has("ports"))(C.ports||[]).forEach(x=>out.push({t:"pt",ll:x.ll,icon:"⚓",col:"#1f6fb8",n:"Port of "+x.n,f:x.f||"",lay:"con",sz:.9}))}
 if(L.haz.on){const H=D.hazards||{},P=L.haz.parts;
  if(P.has("cyc"))(H.cyclones||[]).forEach(x=>{out.push({t:"line",line:x.line,col:"#3a7bd5",w:2.4,dash:"",n:x.n,f:"Typical cyclone path"+(x.f?". "+x.f:""),op:.8,arrow:true,lay:"haz"});if(x.line&&x.line[0])out.push({t:"pt",ll:x.line[0],icon:"🌀",col:"#3a7bd5",n:x.n,f:x.f||"Where these storms often begin",lay:"haz",sz:.9})});
  if(P.has("volc"))(H.volcanoes||[]).forEach(x=>out.push({t:"pt",tri:"volc",ll:x.ll,icon:"",col:"#c0392b",n:x.n,f:"Volcano"+(x.c&&typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[x.c]?" · "+COUNTRY_BY_CODE[x.c].n:"")+(x.f?". "+x.f:""),lay:"haz",sz:.85}));
  if(P.has("quakes"))(H.quakes||[]).forEach(x=>out.push({t:"pt",ll:x.ll,icon:"",ring:true,mag:x.m||8,col:"#e0482f",n:x.n,f:x.f||"",lay:"haz"}));
  if(P.has("tsu"))(H.tsunami||[]).forEach(x=>out.push({t:"pt",ll:x.ll,icon:"🌊",col:"#1c8fb0",n:x.n,f:"Tsunami"+(x.f?". "+x.f:""),lay:"haz",sz:.9}))}
 return out}

/* icons that would sit on top of each other are nudged apart (their true spot stays marked by a small dot) */
function spread(P,minD){for(let it=0;it<6;it++){let moved=false;for(let i=0;i<P.length;i++){const A=P[i];for(let j=i+1;j<P.length;j++){const B=P[j],md=(A.r+B.r)*minD,dx=B.x-A.x,dy=B.y-A.y;if(Math.abs(dx)>=md||Math.abs(dy)>=md)continue;let d=Math.hypot(dx,dy);if(d>=md)continue;moved=true;
  let ux,uy;if(d<1e-3){const a=(i*2.4+j)%6.283;ux=Math.cos(a);uy=Math.sin(a);d=0}else{ux=dx/d;uy=dy/d}const push=(md-d)/2;A.x-=ux*push;A.y-=uy*push;B.x+=ux*push;B.y+=uy*push}}if(!moved)break}return P}
/* ---------- flat map ---------- */
const proj=()=>typeof GLOBE_ROBINSON!=="undefined"?GLOBE_ROBINSON:d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
let sig="";
function svgEl(){const w=document.getElementById("allMapsWrap");return w&&w.querySelector(":scope > svg")}
function drawFlat(force){const svg=svgEl();if(!svg)return;let g=svg.querySelector(":scope > g.gf-layers");const any=L.res.on||L.con.on||L.haz.on;
 if(!any){if(g)g.remove();sig="";return}
 const s=JSON.stringify([L.res.on,[...L.res.parts],L.con.on,[...L.con.parts],L.haz.on,[...L.haz.parts]]);
 if(g&&!force&&s===sig)return;sig=s;
 if(!g){g=document.createElementNS(NS,"g");g.setAttribute("class","gf-layers");g.setAttribute("data-spin","no")}
 const lab=svg.querySelector(":scope > g.map-labels");if(lab){if(g.nextElementSibling!==lab)svg.insertBefore(g,lab)}else if(g.parentNode!==svg)svg.appendChild(g);
 const P=proj(),path=d3.geoPath(P),its=items();let lines="",pts="";
 its.forEach((it,i)=>{if(it.t==="line"){const geo=it.geo?{type:"LineString",coordinates:it.line}:{type:"LineString",coordinates:it.line};const d=path(geo);if(!d)return;
   lines+='<path class="gf-ly-hit" data-i="'+i+'" d="'+d+'"/><path class="gf-ly-line" d="'+d+'" style="stroke:'+it.col+';stroke-width:'+it.w+';stroke-opacity:'+(it.op||1)+(it.dash?";stroke-dasharray:"+it.dash:"")+'"/>'}
  else{const p=P(it.ll);if(!p)return;const x=p[0].toFixed(1),y=p[1].toFixed(1);
   if(it.ring){const r=Math.max(4,(it.mag-6.5)*4);pts+='<g class="gf-ly-pt" data-i="'+i+'" data-x="'+x+'" data-y="'+y+'"><circle r="'+r+'" style="fill:'+it.col+';fill-opacity:.28;stroke:'+it.col+';stroke-width:1.6"/><circle r="2.2" style="fill:'+it.col+'"/></g>'}
   else if(it.tri)pts+='<g class="gf-ly-pt gf-ly-tri" data-i="'+i+'" data-x="'+x+'" data-y="'+y+'" data-sz="'+(it.sz||1)+'"><path d="'+VOLC_D+'" style="fill:#d63a2a;stroke:#fff;stroke-width:1.4;stroke-linejoin:round"/></g>'
   else pts+='<g class="gf-ly-pt" data-i="'+i+'" data-x="'+x+'" data-y="'+y+'" data-sz="'+(it.sz||1)+'"><circle r="9" style="fill:#fff;stroke:'+it.col+';stroke-width:1.8"/><text text-anchor="middle" dy=".36em" font-size="10.5">'+it.icon+"</text></g>"}});
 g._items=its;g.innerHTML='<g class="gf-ly-lines">'+lines+'</g><g class="gf-ly-pts">'+pts+"</g>";scale(svg)}
/* icons keep their size on screen */
function scale(svg){const g=svg&&svg.querySelector(":scope > g.gf-layers");if(!g)return;const vb=svg.viewBox&&svg.viewBox.baseVal,w=svg.getBoundingClientRect().width;if(!vb||!w)return;
 /* icons grow at about half the zoom rate (like the capitals and landform icons) */
 const z=Math.max(1,2000/vb.width),k=Math.max(.05,vb.width/w)*(w<600?.85:1)*Math.min(2.2,.66*Math.pow(z,.5));if(g._k===k)return;g._k=k;
 const els=[...g.querySelectorAll(".gf-ly-pt")],P=els.map(e=>({e,x:+e.dataset.x,y:+e.dataset.y,r:(e.dataset.sz?9:Math.max(4,9))*k*(+e.dataset.sz||1)}));spread(P,1.02);
 P.forEach(o=>{const e=o.e,s=k*(+e.dataset.sz||1),dx=o.x-e.dataset.x,dy=o.y-e.dataset.y;e.setAttribute("transform","translate("+o.x.toFixed(2)+","+o.y.toFixed(2)+") scale("+s.toFixed(3)+")");
  let t=e.querySelector(".gf-ly-true");if(Math.hypot(dx,dy)>o.r*.3){if(!t){t=document.createElementNS(NS,"path");t.setAttribute("class","gf-ly-true");e.insertBefore(t,e.firstChild)}t.setAttribute("d","M0,0L"+(-dx/s).toFixed(2)+","+(-dy/s).toFixed(2));}else if(t)t.remove()})}
const watched=new WeakSet;
function watch(){const svg=svgEl();if(!svg||watched.has(svg))return;watched.add(svg);let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;scale(svg)})}).observe(svg,{attributes:true,attributeFilter:["viewBox"]})}

/* ---------- globe ---------- */
function globe(){try{if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}
if(typeof GlobeView!=="undefined"){const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){
 try{if((L.res.on||L.con.on||L.haz.on)&&typeof amGlobe!=="undefined"&&this===amGlobe){const its=items(),path=d3.geoPath(p,ctx),c=[-this.rot[0],-this.rot[1]],pts=[];ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
  its.forEach(it=>{if(it.t!=="line")return;ctx.beginPath();path({type:"LineString",coordinates:it.line});ctx.strokeStyle=it.col;ctx.globalAlpha=it.op||1;ctx.lineWidth=it.w*1.1;ctx.setLineDash(it.dash?it.dash.split(" ").map(Number):[]);ctx.stroke()});
  ctx.setLineDash([]);ctx.globalAlpha=1;ctx.textAlign="center";ctx.textBaseline="middle";
  const zk=Math.min(2.2,.85*Math.pow(Math.max(1,this.zoom||1),.5)),vis=[];its.forEach(it=>{if(it.t!=="pt"||d3.geoDistance(it.ll,c)>Math.PI/2-.03)return;const q=p(it.ll);if(q)vis.push({it,q,x:q[0],y:q[1],r:7.5*zk*(it.sz||1)})});spread(vis,.72);/* small icons may overlap a little */vis.forEach(o=>{if(this._gfLayHot===o.it)o.r*=1.3});
  vis.forEach(o=>{const it=o.it,q=[o.x,o.y];if(Math.hypot(o.x-o.q[0],o.y-o.q[1])>2){ctx.strokeStyle="rgba(20,30,50,.6)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(o.q[0],o.q[1]);ctx.lineTo(o.x,o.y);ctx.stroke();ctx.fillStyle="rgba(20,30,50,.75)";ctx.beginPath();ctx.arc(o.q[0],o.q[1],1.8,0,7);ctx.fill()}
   if(it.tri){const r=o.r;ctx.save();ctx.translate(q[0],q[1]);ctx.scale(r/9,r/9);ctx.fillStyle="#d63a2a";ctx.strokeStyle="#fff";ctx.lineWidth=1.4*9/r;ctx.lineJoin="round";const P2=new Path2D(VOLC_D);ctx.fill(P2);ctx.stroke(P2);ctx.restore()}
   else if(it.ring){const r=Math.max(4,(it.mag-6.5)*4)*Math.min(2.2,Math.pow(Math.max(1,this.zoom||1),.5));ctx.fillStyle=it.col;ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(q[0],q[1],r,0,7);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=it.col;ctx.lineWidth=1.6;ctx.stroke();ctx.beginPath();ctx.arc(q[0],q[1],2.2,0,7);ctx.fill()}
   else{const r=o.r;ctx.fillStyle="#fff";ctx.strokeStyle=it.col;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(q[0],q[1],r,0,7);ctx.fill();ctx.stroke();ctx.font=(9*zk*(it.sz||1))+"px system-ui, 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";ctx.fillStyle="#222";ctx.fillText(it.icon,q[0],q[1]+.5)}
   pts.push([q[0],q[1],it])});
  this._gfLayPts=pts;ctx.restore()}else if(this._gfLayPts)this._gfLayPts=null}catch(e){console.error(e)}return _dm.apply(this,arguments)}}

/* ---------- tooltip (flat and globe) ---------- */
let tip=null;
function showTip(it,x,y){if(!tip){tip=document.createElement("div");tip.className="gf-ly-tip";document.body.appendChild(tip)}document.body.classList.add("gf-ly-tipping");tip.innerHTML="<b>"+esc(it.n)+"</b>"+(it.f?"<span>"+esc(it.f)+"</span>":"");tip.style.display="block";
 const w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.min(innerWidth-w-8,x+14)+"px";tip.style.top=Math.max(8,y+16+h>innerHeight?y-h-10:y+16)+"px"}
function hideTip(){if(tip)tip.style.display="none";document.body.classList.remove("gf-ly-tipping")}
document.addEventListener("pointermove",e=>{const t=e.target;
 if(t&&t.closest){const el=t.closest(".gf-layers .gf-ly-pt, .gf-layers .gf-ly-hit");if(el){const g=el.closest("g.gf-layers"),it=g&&g._items&&g._items[+el.dataset.i];if(it){showTip(it,e.clientX,e.clientY);return}}
  if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._gfLayPts&&amGlobe.host&&amGlobe.host.contains(t)){const cv=amGlobe.host.querySelector("canvas.globe-canvas")||amGlobe.host,r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,bd=12;amGlobe._gfLayPts.forEach(([x,y,it])=>{const d=Math.hypot(x-mx,y-my);if(d<bd){bd=d;best=it}});if(amGlobe._gfLayHot!==best){amGlobe._gfLayHot=best;globe()}if(best){showTip(best,e.clientX,e.clientY);return}}}
 try{if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._gfLayHot){amGlobe._gfLayHot=null;globe()}}catch(er){}hideTip()},{passive:true});
/* a tap on an icon shows its note instead of opening the country under it */
document.addEventListener("click",e=>{const el=e.target.closest&&e.target.closest(".gf-layers .gf-ly-pt");if(el){e.stopPropagation();e.preventDefault();const g=el.closest("g.gf-layers"),it=g._items[+el.dataset.i];if(it)showTip(it,e.clientX,e.clientY)}},true);

/* ---------- Currents ▾: ocean currents, air currents, storm tracks (Day and night hidden for now) ---------- */
try{if(typeof GF_EIM_ITEMS!=="undefined"){for(let k=GF_EIM_ITEMS.length-1;k>=0;k--)if(GF_EIM_ITEMS[k][0]==="daynight")GF_EIM_ITEMS.splice(k,1)}
 if(typeof gfEIM==="function")gfEIM().sel.daynight=0;
 if(typeof gfEimOn==="function"){const _on=gfEimOn;gfEimOn=function(k){if(k==="daynight")return false;return _on.apply(this,arguments)}}}catch(e){console.error(e)}

/* ---------- switches: folded groups ---------- */
const st=document.createElement("style");st.textContent=`
g.gf-layers .gf-ly-line{ fill:none; vector-effect:non-scaling-stroke; pointer-events:none; }
g.gf-layers .gf-ly-hit{ fill:none; stroke:transparent; stroke-width:9; vector-effect:non-scaling-stroke; pointer-events:stroke; }
g.gf-layers .gf-ly-pt{ cursor:pointer; }
g.gf-layers .gf-ly-pt circle{ vector-effect:non-scaling-stroke; }
g.gf-layers .gf-ly-true{ stroke:rgba(20,30,50,.6); stroke-width:1; vector-effect:non-scaling-stroke; fill:none; }
g.gf-layers .gf-ly-pt:hover circle:first-child{ stroke-width:3 !important; }
.gf-ly-tip{ position:fixed; z-index:9999; pointer-events:none; max-width:280px; background:rgba(16,28,48,.94); color:#fff; font-size:12.5px; line-height:1.35; padding:7px 10px; border-radius:9px; box-shadow:0 4px 14px rgba(0,0,0,.25); display:none; }
.gf-ly-tip b{ display:block; font-size:13px; }
/* while an icon's note is showing, the country tooltip under it steps aside */
body.gf-ly-tipping .map-territory-tooltip, body.gf-ly-tipping .globe-tip{ visibility:hidden !important; }
.gf-ly-tip span{ display:block; opacity:.88; margin-top:2px; }
#allMapsView .all-maps-label-controls{ position:relative; z-index:80; }
#allMapsView .all-maps-label-controls > #globalSearchWrap{ margin-left:auto; }
/* the switch rows (and their ▾ menus) sit above the tour button and map controls */
#allMapsView .controls-row.all-maps-controls{ z-index:30 !important; }
.gf-eim-pop [data-eim="daynight"]{ display:none !important; }
.gf-ss-line{ display:flex; align-items:center; gap:4px; }
.lf-item .gf-ly-dot{ width:9px; height:9px; border-radius:50%; margin-left:auto; flex:none; }
.gf-fold-pop .gf-ly-chk{ display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; cursor:pointer; }
.gf-fold-pop .gf-ly-chk i{ width:10px; height:10px; border-radius:50%; display:inline-block; }
.gf-fold-pop .gf-ly-chk em{ font-style:normal; opacity:.75; }
`;document.head.appendChild(st);
const DEF=[["res","Resources",RES_GROUPS.map(g=>[g[0],g[1],g[2]])],["con","Connections",CON_PARTS.map(p=>[p[0],p[1],{lanes:"#1f6fb8",choke:"#d9534f",ports:"#1f6fb8",cables:"#8a4fc7",pipes:"#5a3a22",flights:"#d63b6a"}[p[0]]])],["haz","Hazards",HAZ_PARTS.map(p=>[p[0],p[1],{volc:"#c0392b",quakes:"#e0482f",cyc:"#3a7bd5",tsu:"#1c8fb0"}[p[0]]])]];
/* built like the Landforms switch: switch, ▾, and a "Show — All · None" checklist floating over the page */
function makeFold(id,name,parts){const g=document.createElement("span");g.className="lf-control gf-ly-fold";g.dataset.g=name;g.dataset.ly=id;
 g.innerHTML='<label class="switch"><input type="checkbox"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">'+name+'</span></label><button type="button" class="lf-caret" aria-haspopup="true" aria-expanded="false" title="Choose what to show">▾</button><div class="lf-pop" role="menu" hidden><div class="lf-pop-head"><span>Show</span><span><button type="button" class="lf-all">All</button> · <button type="button" class="lf-none">None</button></span></div>'+
  parts.map(([k,l,c])=>'<button type="button" class="lf-item on" role="menuitemcheckbox" aria-checked="true" data-p="'+k+'"><i aria-hidden="true"></i>'+l+'<b class="gf-ly-dot" style="background:'+c+'"></b></button>').join("")+"</div>";
 const pop=g.querySelector(".lf-pop"),car=g.querySelector(".lf-caret"),main=g.querySelector("label.switch input");
 car.onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden;car.setAttribute("aria-expanded",String(!pop.hidden))};
 document.addEventListener("click",e=>{if(!g.contains(e.target)){pop.hidden=true;car.setAttribute("aria-expanded","false")}});
 main.onchange=()=>{L[id].on=main.checked;L[id].auto=false;if(main.checked&&!L[id].parts.size)parts.forEach(p=>L[id].parts.add(p[0]));redraw()};
 pop.querySelectorAll("[data-p]").forEach(c=>c.onclick=e=>{e.stopPropagation();const k=c.dataset.p;L[id].parts.has(k)?L[id].parts.delete(k):L[id].parts.add(k);L[id].on=L[id].parts.size>0;L[id].auto=false;redraw()});
 pop.querySelector(".lf-all").onclick=e=>{e.stopPropagation();parts.forEach(p=>L[id].parts.add(p[0]));L[id].on=true;L[id].auto=false;redraw()};
 pop.querySelector(".lf-none").onclick=e=>{e.stopPropagation();L[id].parts.clear();L[id].on=false;L[id].auto=false;redraw()};
 return g}
function sync(){document.querySelectorAll(".gf-ly-fold").forEach(g=>{const S=L[g.dataset.ly],m=g.querySelector("label.switch input");if(m.checked!==S.on)m.checked=S.on;g.querySelectorAll("[data-p]").forEach(c=>{const v=S.parts.has(c.dataset.p);c.classList.toggle("on",v);c.setAttribute("aria-checked",String(v))})})}
function redraw(){sync();drawFlat(true);globe();try{legendSync()}catch(e){}}
const labOf=sw=>{const l=sw.querySelector(".switch-label");return l?l.textContent.trim():""};
function mount(){const row=document.querySelector("#allMapsView .all-maps-label-controls");if(!row)return;
 /* Currents stays its own switch (with its ▾); Day & night is hidden for now (and kept off) */
 const sw=n=>[...document.querySelectorAll("#allMapsView label.switch")].find(s=>labOf(s)===n);
 const dn=sw("Day & night");if(dn){if(dn.style.display!=="none")dn.style.display="none";const i=dn.querySelector("input");if(i&&i.checked){i.checked=false;i.dispatchEvent(new Event("change",{bubbles:true}))}}
 const cur=sw("Currents"),eim=row.querySelector(":scope > .gf-eim");
 /* order: … Resources, Connections, Hazards, Currents, then the search box on the right */
 const ctl=document.getElementById("gfEimCtl"),search=row.querySelector(":scope > #globalSearchWrap"),list=DEF.map(([id,name,parts])=>row.querySelector('.gf-ly-fold[data-ly="'+id+'"]')||makeFold(id,name,parts));
 if(ctl&&ctl.parentNode===row)list.push(ctl);
 const stop=search||null;list.forEach(el=>{if(el.parentNode!==row||el.nextElementSibling!==(list[list.indexOf(el)+1]||stop))row.insertBefore(el,stop)});
 sync()}

/* ---------- the map key gets a second page, "Layers", explaining the symbols of the layers that are on ---------- */
let lgPage=1,lgSig="";
function dotIcon(icon,col){return'<svg viewBox="-11 -11 22 22" width="20" height="20"><circle r="9" fill="#fff" stroke="'+col+'" stroke-width="1.8"/><text text-anchor="middle" dy=".36em" font-size="10.5">'+icon+"</text></svg>"}
function lineIcon(col,w,dash){return'<svg viewBox="0 0 26 12" width="26" height="12"><path d="M1 6 Q8 1 13 6 T25 6" fill="none" stroke="'+col+'" stroke-width="'+w+'"'+(dash?' stroke-dasharray="'+dash+'"':"")+' stroke-linecap="round"/></svg>'}
function layersKey(){const row=(ic,t)=>'<span class="gf-lk-row">'+ic+"<span>"+t+"</span></span>";let h="";
 if(L.res.on){const have=new Set((D.resources||[]).map(r=>r.k));RES_GROUPS.forEach(([gk,gl,col,kinds])=>{if(!L.res.parts.has(gk))return;const ks=kinds.filter(k=>have.has(k));if(!ks.length)return;
   h+='<div class="gf-lk-sec"><b>'+gl+"</b>"+ks.map(k=>row(dotIcon(RES_KIND[k][0],col),RES_KIND[k][1])).join("")+"</div>"})}
 if(L.con.on){const P=L.con.parts,r=[];if(P.has("lanes"))r.push(row(lineIcon("#1f6fb8",3),"Shipping lane (thicker = busier)"));if(P.has("choke"))r.push(row(dotIcon("⚠️","#d9534f"),"Chokepoint: a narrow sea passage"));if(P.has("ports"))r.push(row(dotIcon("⚓","#1f6fb8"),"Big port"));
  if(P.has("cables"))r.push(row(lineIcon("#8a4fc7",1.4),"Undersea internet cable"));if(P.has("pipes")){r.push(row(lineIcon("#5a3a22",2,"6 3"),"Oil pipeline"));r.push(row(lineIcon("#e07b1a",2,"6 3"),"Gas pipeline"))}if(P.has("flights"))r.push(row(lineIcon("#d63b6a",1.6,"2 4"),"Busy flight route"));
  if(r.length)h+='<div class="gf-lk-sec"><b>Connections</b>'+r.join("")+"</div>"}
 if(L.haz.on){const P=L.haz.parts,r=[];if(P.has("volc"))r.push(row('<svg viewBox="-11 -11 22 22" width="20" height="20"><path d="'+VOLC_D+'" fill="#d63a2a" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>',"Volcano"));
  if(P.has("quakes"))r.push(row('<svg viewBox="-11 -11 22 22" width="20" height="20"><circle r="8" fill="#e0482f" fill-opacity=".28" stroke="#e0482f" stroke-width="1.6"/><circle r="2.2" fill="#e0482f"/></svg>',"Great earthquake (bigger ring = stronger)"));
  if(P.has("cyc"))r.push(row(lineIcon("#3a7bd5",2.4),"Usual cyclone path, starting at 🌀"));if(P.has("tsu"))r.push(row(dotIcon("🌊","#1c8fb0"),"Big tsunami"));
  if(r.length)h+='<div class="gf-lk-sec"><b>Hazards</b>'+r.join("")+"</div>"}
 return h}
function legendSync(){const lg=document.getElementById("populationLegend");if(!lg)return;const body=layersKey();let tabs=lg.querySelector(":scope > .gf-lk-tabs"),p2=lg.querySelector(":scope > .gf-lk-p2");
 if(!body){if(tabs)tabs.remove();if(p2)p2.remove();lg.classList.remove("gf-lk-on2","gf-lk-has");lgPage=1;lgSig="";return}
 lg.classList.add("gf-lk-has");
 if(!tabs){tabs=document.createElement("div");tabs.className="gf-lk-tabs";tabs.innerHTML='<button type="button" data-lkp="1">Map key</button><button type="button" data-lkp="2">Layers</button>';tabs.onclick=e=>{const b=e.target.closest("[data-lkp]");if(!b)return;e.stopPropagation();lgPage=+b.dataset.lkp;legendSync();try{flkSync(true)}catch(er){}};lg.insertBefore(tabs,lg.firstChild)}
 else if(lg.firstChild!==tabs)lg.insertBefore(tabs,lg.firstChild);
 if(!p2){p2=document.createElement("div");p2.className="gf-lk-p2";lg.appendChild(p2);lgSig=""}
 if(lgSig!==body){lgSig=body;p2.innerHTML=body}
 tabs.querySelectorAll("[data-lkp]").forEach(b=>b.classList.toggle("on",+b.dataset.lkp===lgPage));lg.classList.toggle("gf-lk-on2",lgPage===2)}
{const st=document.createElement("style");st.textContent=`
#populationLegend > .gf-lk-tabs{ display:flex; gap:4px; width:100%; flex-basis:100%; margin:0 0 6px; }
#populationLegend > .gf-lk-tabs button{ border:1px solid var(--line,rgba(0,0,0,.12)); background:var(--surface,#fff); color:inherit; border-radius:999px; padding:4px 11px; font:700 12px/1 inherit; cursor:pointer; }
#populationLegend > .gf-lk-tabs button.on{ background:var(--accent,#2f8a7a); border-color:transparent; color:#fff; }
#populationLegend.gf-lk-on2 > :not(.gf-lk-tabs):not(.gf-lk-p2){ display:none !important; }
#populationLegend:not(.gf-lk-on2) > .gf-lk-p2{ display:none !important; }
#populationLegend > .gf-lk-p2{ display:flex; flex-wrap:wrap; gap:10px 22px; width:100%; flex-basis:100%; }
.gf-lk-sec{ display:flex; flex-direction:column; gap:3px; min-width:170px; }
.gf-lk-sec > b{ font-size:12px; text-transform:uppercase; letter-spacing:.06em; opacity:.7; margin-bottom:2px; }
.gf-lk-row{ display:flex; align-items:center; gap:8px; font-size:12.5px; }
.gf-lk-row svg{ flex:none; }
`;document.head.appendChild(st)}
/* Resources come on by themselves on the Economy map's Main export (and go again when leaving it, unless you turned them on) */
let lastMode=null;
function modeWatch(){let m="";try{m=appMode==="allmaps"?allMapsColorMode+(allMapsColorMode==="gdp"?":"+allMapsSubMode.gdp:""):""}catch(e){}if(m===lastMode)return;const prev=lastMode;lastMode=m;
 if(m==="gdp:export"&&!L.res.on){L.res.on=true;L.res.auto=true;redraw()}else if(prev==="gdp:export"&&L.res.auto){L.res.on=false;L.res.auto=false;redraw()}}
setInterval(()=>{try{mount();modeWatch();watch();drawFlat(false);legendSync()}catch(e){console.error(e)}},500);
})();
/* Switch rows: slimmer ▾ buttons so one more switch fits on the first row; every ▾ menu (Labels, Plates, Resources,
   Connections, Hazards, Currents) opens when the pointer is over its name, like Landforms, and a click on ▾ pins it.
   The Satellite map's clouds are a round button with the zoom buttons; Deep Time no longer pushes the page down. */
(function(){
const st=document.createElement("style");st.textContent=`
#allMapsView .all-maps-label-controls .lf-caret, #allMapsView .all-maps-label-controls .gf-fcaret{ padding:2px 1px !important; font-size:9px !important; margin-left:-2px !important; min-width:0 !important; }
#allMapsView .all-maps-label-controls .lf-control, #allMapsView .all-maps-label-controls .gf-fold{ gap:0 !important; }
#allMapsView #amCloudsSw{ display:none !important; }
/* switch menus above the floating map key; switch names stay readable over the globe's dark space background */
body.gf-menu-open .flk{ opacity:0 !important; pointer-events:none !important; transition:opacity .15s; }

#allMapsView.globe-on .all-maps-label-controls .switch-label{ text-shadow:0 0 3px #fff,0 0 6px #fff,0 0 10px rgba(255,255,255,.9); }
.globe-btns [data-g="gfclouds"]{ display:inline-flex; align-items:center; justify-content:center; background:#fff4d6 !important; color:#b07a10 !important; border:1.5px solid #f0c860 !important; }
.globe-btns [data-g="gfclouds"].on{ background:#f2b632 !important; color:#fff !important; border-color:#f2b632 !important; }
.globe-btns [data-g="gfclouds"] svg{ width:18px; height:18px; }
/* Deep Time: the search row of other pages stays hidden on the Maps page */
body:has(#allMapsView:not([hidden]):not([style*="display: none"])) #mainContent > .stat-search-row{ display:none !important; }
`;document.head.appendChild(st);
const canHover=window.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches;
/* a menu that would run off the right edge opens leftward instead */
function fit(pop){pop.style.left="";pop.style.right="";requestAnimationFrame(()=>{const r=pop.getBoundingClientRect();if(r.right>innerWidth-8){pop.style.left="auto";pop.style.right="0"}})}
document.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest("#allMapsView .all-maps-label-controls .lf-caret, #allMapsView .all-maps-label-controls .gf-fcaret");if(c){const pop=c.parentNode.querySelector(".lf-pop, .gf-fold-pop");if(pop)setTimeout(()=>fit(pop),0)}},true);
function hoverMenu(ctrl){if(!canHover||ctrl._gfHov)return;const pop=ctrl.querySelector(":scope > .lf-pop, :scope > .gf-fold-pop"),car=ctrl.querySelector(":scope > .lf-caret, :scope > .gf-fcaret");if(!pop||!car)return;ctrl._gfHov=1;let t=0,pinned=false;
 const open=()=>{clearTimeout(t);fit(pop);document.querySelectorAll("#allMapsView .all-maps-label-controls .lf-pop, #allMapsView .all-maps-label-controls .gf-fold-pop").forEach(o=>{if(o!==pop&&!o.closest("#lfCtl, .lf-control:not(.gf-ly-fold):not(#gfEimCtl)"))o.hidden=true});pop.hidden=false;car.setAttribute("aria-expanded","true")};
 ctrl.addEventListener("mouseenter",open);ctrl.addEventListener("mouseleave",()=>{clearTimeout(t);if(!pinned)t=setTimeout(()=>{pop.hidden=true;car.setAttribute("aria-expanded","false")},280)});
 car.addEventListener("click",()=>{pinned=!pop.hidden||!pinned;setTimeout(()=>{pinned=!pop.hidden},0)},true);
 document.addEventListener("click",e=>{if(!ctrl.contains(e.target))pinned=false})}
function cloudBtn(){const g=typeof amGlobe!=="undefined"&&amGlobe;if(!g||!g.host)return;const bar=g.host.querySelector(".globe-btns");if(!bar)return;let b=bar.querySelector('[data-g="gfclouds"]');
 if(!b){b=document.createElement("button");b.type="button";b.dataset.g="gfclouds";b.title="Clouds: NASA’s real cloud cover";b.setAttribute("aria-label","Show or hide clouds");
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 18h10.5a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.6 9.1 4.5 4.5 0 0 0 7 18z"/></svg>';
  b.addEventListener("click",e=>{e.stopPropagation();e.preventDefault();const v=!cloudsOn();const i=document.getElementById("amCloudsToggle");if(i){i.checked=v;i.dispatchEvent(new Event("change",{bubbles:true}))}else{globePrefs().clouds=v;saveStats();if(v)cloudsLoad();try{cloudFlatSync()}catch(er){}try{g.request()}catch(er){}}PIC_RESET();sync2()},true);bar.appendChild(b)}
 const sat=typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="satellite";b.style.display=sat?"":"none";if(!g._gfCloudCfg){g._gfCloudCfg=1;g.cfg.clouds=()=>typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="satellite"&&cloudsOn()?1:0}if(sat&&cloudsOn()&&!g._gfCloudLoad){g._gfCloudLoad=1;try{const pr=cloudsLoad();if(pr&&pr.then)pr.then(()=>{try{g.request()}catch(e){}})}catch(e){}}b.classList.toggle("on",!!(typeof cloudsOn==="function"&&cloudsOn()))}
function PIC_RESET(){setTimeout(()=>{try{amGlobe.request()}catch(e){}},120)}
function sync2(){try{cloudBtn()}catch(e){}}
setInterval(()=>{try{document.body.classList.toggle("gf-menu-open",[...document.querySelectorAll("#allMapsView .all-maps-label-controls .lf-pop, #allMapsView .all-maps-label-controls .gf-fold-pop")].some(p=>!p.hidden&&p.offsetParent));document.querySelectorAll("#allMapsView .all-maps-label-controls .gf-ly-fold, #allMapsView .all-maps-label-controls .gf-fold, #gfEimCtl").forEach(hoverMenu);sync2()}catch(e){}},250);
})();
