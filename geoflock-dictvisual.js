/* GeoFlock: pictures in the dictionary. Opening a term shows, in order of preference: its photo (GF_DICT_IMG, Wikimedia
   Commons, credited), a small diagram drawn here for ideas a photo cannot show (the demographic transition, a population
   pyramid, a rain shadow, latitude and longitude, the rank-size rule, von Thünen's rings), or a little map of its example
   place drawn from the map's own country shapes. The library's Pictures tab lists every photo (terms and famous places,
   GF_ICONIC) and can be searched; a picture opens its term, or for a place shows it large with a button to fly the map there. */
(function(){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const IMG=()=>window.GF_DICT_IMG||{},ICON=()=>window.GF_ICONIC||[];
const credit=P=>'<small class="gfdv-cr">'+esc(P.by||"")+(P.lic?" · "+esc(P.lic):"")+'</small>';
/* ---------- diagrams ---------- */
const AX='stroke="#7a6a55" stroke-width="1.2" fill="none"';
const DIAG={
 "Demographic transition model":()=>{const st=[[0,"High birth and death rates; slow growth"],[1,"Death rate falls: fast growth"],[2,"Birth rate falls: growth slows"],[3,"Both low: little growth"],[4,"Births below deaths: decline"]];
  return'<div class="gfdv-dg gfdv-dtm"><svg viewBox="0 0 320 170"><path '+AX+' d="M30 10V140H310"/>'+
   '<path d="M30 40 C80 40 120 40 140 70 S190 115 230 118 S290 120 310 125" stroke="#d0573a" stroke-width="2.6" fill="none"/>'+
   '<path d="M30 46 C60 46 80 100 110 112 S200 118 310 112" stroke="#2f6f8f" stroke-width="2.6" fill="none"/>'+
   '<path d="M30 132 C120 130 150 90 200 60 S280 38 310 40" stroke="#2e9b5f" stroke-width="2" stroke-dasharray="5 4" fill="none"/>'+
   [0,1,2,3,4].map(i=>'<rect class="gfdv-st" data-s="'+i+'" x="'+(30+i*56)+'" y="10" width="56" height="130" fill="#e8a24a" opacity="0"/>').join("")+
   [1,2,3,4].map(i=>'<line x1="'+(30+i*56)+'" y1="10" x2="'+(30+i*56)+'" y2="140" stroke="#cdbfa6" stroke-dasharray="3 3"/>').join("")+
   [0,1,2,3,4].map(i=>'<text x="'+(58+i*56)+'" y="155" text-anchor="middle" font-size="10" fill="#5a4a36">'+(i+1)+'</text>').join("")+
   '<text x="36" y="34" font-size="9.5" fill="#d0573a">birth rate</text><text x="96" y="124" font-size="9.5" fill="#2f6f8f">death rate</text><text x="236" y="52" font-size="9.5" fill="#2e9b5f">population</text></svg>'+
   '<label class="gfdv-sl">Stage <input type="range" min="1" max="5" value="2"><b></b></label><p class="gfdv-cap" data-st=\''+esc(JSON.stringify(st.map(x=>x[1])))+'\'></p></div>'},
 "Population pyramid":()=>{const young=[9,8.6,8.2,7.8,7.2,6.5,5.6,4.6,3.6,2.6,1.6,.8],old=[5.6,5.8,6,6.2,6.5,6.8,6.9,6.8,6.4,5.6,4.4,3];
  const bars=(A,y0,lab)=>'<g transform="translate(0,'+y0+')">'+A.map((v,i)=>{const y=120-i*10;return'<rect x="'+(80-v*8)+'" y="'+y+'" width="'+v*8+'" height="8.5" fill="#2f6f8f"/><rect x="82" y="'+y+'" width="'+v*7.6+'" height="8.5" fill="#d0573a"/>'}).join("")+'<text x="81" y="142" text-anchor="middle" font-size="10" fill="#5a4a36">'+lab+'</text></g>';
  return'<div class="gfdv-dg"><svg viewBox="0 0 330 160">'+bars(young,0,"Young, growing (e.g. Niger)")+'<g transform="translate(170,0)">'+bars(old,0,"Older, shrinking (e.g. Japan)").replace(/translate\(0,0\)/,"")+'</g><text x="4" y="12" font-size="9" fill="#2f6f8f">men</text><text x="128" y="12" font-size="9" fill="#d0573a">women</text></svg><p class="gfdv-cap">Each bar is an age group, youngest at the bottom: a wide base means many children.</p></div>'},
 "Rain shadow":()=>'<div class="gfdv-dg"><svg viewBox="0 0 320 150"><path d="M0 140 L90 140 L160 40 L230 140 L320 140 Z" fill="#b9a27a"/><path d="M0 140 L90 140 L125 90 L60 140Z" fill="#6aa86a"/><path d="M200 100 L230 140 L320 140 L320 140Z" fill="#e2c98c"/>'+
  '<path d="M10 70 C60 70 110 40 150 25" stroke="#2f6f8f" stroke-width="2" fill="none" marker-end="url(#gfa)"/><path d="M175 30 C215 45 250 80 310 95" stroke="#c7853a" stroke-width="2" fill="none" marker-end="url(#gfa)"/>'+
  '<g fill="#fff" stroke="#9fb3c8"><ellipse cx="105" cy="45" rx="26" ry="12"/><ellipse cx="128" cy="38" rx="20" ry="10"/></g>'+[95,105,115,125].map(x=>'<line x1="'+x+'" y1="60" x2="'+(x-4)+'" y2="76" stroke="#2f6f8f" stroke-width="1.5"/>').join("")+
  '<defs><marker id="gfa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5a4a36"/></marker></defs><text x="8" y="62" font-size="10" fill="#2f6f8f">moist wind</text><text x="58" y="132" font-size="10" fill="#fff">wet side</text><text x="240" y="132" font-size="10" fill="#7a5a2a">dry side</text></svg><p class="gfdv-cap">Air rises over the mountains, cools and drops its rain; it comes down the far side dry and warm.</p></div>',
 "Latitude":()=>'<div class="gfdv-dg"><svg viewBox="0 0 320 160"><circle cx="110" cy="80" r="68" fill="#a9cbe5" stroke="#5a4a36"/>'+[-60,-30,0,30,60].map(a=>{const y=80-68*Math.sin(a*Math.PI/180),w=68*Math.cos(a*Math.PI/180);return'<ellipse cx="110" cy="'+y.toFixed(1)+'" rx="'+w.toFixed(1)+'" ry="'+(w*.18).toFixed(1)+'" fill="none" stroke="'+(a?"#2f6f8f":"#d0573a")+'" stroke-width="'+(a?1.2:2)+'"/><text x="'+(185)+'" y="'+(y+3).toFixed(1)+'" font-size="10" fill="#5a4a36">'+(a?Math.abs(a)+"°"+(a>0?"N":"S"):"0° Equator")+'</text>'}).join("")+'</svg><p class="gfdv-cap">Latitude: how far north or south of the Equator, from 0° to 90° at the poles.</p></div>',
 "Longitude":()=>'<div class="gfdv-dg"><svg viewBox="0 0 320 160"><circle cx="110" cy="80" r="68" fill="#a9cbe5" stroke="#5a4a36"/>'+[-60,-30,0,30,60].map(a=>{const rx=Math.abs(68*Math.sin(a*Math.PI/180));return'<ellipse cx="110" cy="80" rx="'+rx.toFixed(1)+'" ry="68" fill="none" stroke="'+(a?"#2f6f8f":"#d0573a")+'" stroke-width="'+(a?1.2:2)+'"/>'}).join("")+'<text x="185" y="40" font-size="10" fill="#d0573a">0°: Greenwich</text><text x="185" y="58" font-size="10" fill="#5a4a36">0–180° east</text><text x="185" y="74" font-size="10" fill="#5a4a36">0–180° west</text></svg><p class="gfdv-cap">Longitude: how far east or west of the prime meridian through Greenwich.</p></div>',
 "Rank-size rule":()=>{const P=[1,.5,.333,.25,.2,.167,.143,.125];return'<div class="gfdv-dg"><svg viewBox="0 0 320 150"><path '+AX+' d="M30 10V130H310"/>'+P.map((p,i)=>'<rect x="'+(40+i*33)+'" y="'+(130-p*110)+'" width="24" height="'+(p*110)+'" fill="#2f6f8f"/><text x="'+(52+i*33)+'" y="143" text-anchor="middle" font-size="9" fill="#5a4a36">'+(i+1)+'</text>').join("")+'<text x="44" y="16" font-size="9.5" fill="#5a4a36">biggest city = 1</text><text x="140" y="60" font-size="9.5" fill="#5a4a36">2nd is ½, 3rd is ⅓…</text></svg><p class="gfdv-cap">The nth-largest city has about 1/n of the biggest city’s people.</p></div>'},
 "Von Thünen model":()=>{const R=[["#5a4a36","City"],["#7fb069","Dairy, market gardens"],["#2e7d32","Forest (fuel, timber)"],["#d9c26a","Grain"],["#c7a27a","Ranching"]];
  return'<div class="gfdv-dg"><svg viewBox="0 0 320 150">'+R.slice().reverse().map((r,i)=>'<circle cx="80" cy="75" r="'+(66-i*14)+'" fill="'+r[0]+'"/>').join("")+R.map((r,i)=>'<rect x="170" y="'+(18+i*24)+'" width="14" height="14" fill="'+r[0]+'"/><text x="190" y="'+(29+i*24)+'" font-size="10.5" fill="#3d2a16">'+r[1]+'</text>').join("")+'</svg><p class="gfdv-cap">Farther from the market, transport costs more, so land use changes ring by ring.</p></div>'}
};
/* ---------- the little map ---------- */
function mini(e){if(!e.m||!e.m.at)return"";return'<div class="gfdv-mm"><canvas width="560" height="300" data-ll="'+e.m.at.join(",")+'" data-z="'+(e.m.z||4)+'"></canvas><small>'+esc(e.e?String(e.e).split(/[;:,(]/)[0]:"On the map")+'</small></div>'}
function drawMini(cv){try{if(cv._done)return;const F=(window.amGlobe&&amGlobe.features)||(typeof projFeatures==="function"?projFeatures():null);if(!F||!F.length||typeof d3==="undefined")return;cv._done=1;
 const ll=cv.dataset.ll.split(",").map(Number),z=+cv.dataset.z||4,W=cv.width,H=cv.height,x=cv.getContext("2d");
 const p=d3.geoOrthographic().rotate([-ll[0],-ll[1]]).translate([W/2,H/2]).scale(Math.min(4000,H*.45*Math.pow(1.55,z-1))).clipAngle(90),path=d3.geoPath(p,x);
 x.fillStyle="#a9cbe5";x.fillRect(0,0,W,H);let here=null;for(const f of F){try{if(d3.geoContains(f,ll)){here=f;break}}catch(er){}}
 x.beginPath();F.forEach(f=>path(f));x.fillStyle="#efe6d2";x.fill();x.strokeStyle="#b9ab90";x.lineWidth=.8;x.stroke();
 if(here){x.beginPath();path(here);x.fillStyle="#f2c879";x.fill();x.strokeStyle="#8a5a2b";x.lineWidth=1.4;x.stroke()}
 const s=p(ll);if(s){x.beginPath();x.arc(s[0],s[1],9,0,2*Math.PI);x.fillStyle="rgba(208,87,58,.25)";x.fill();x.beginPath();x.arc(s[0],s[1],5,0,2*Math.PI);x.fillStyle="#d0573a";x.fill();x.strokeStyle="#fff";x.lineWidth=2;x.stroke()}}catch(er){}}
function visual(e){const P=IMG()[e.t];if(P&&P.d)return'<figure class="gfdv-fig"><img loading="lazy" alt="'+esc(e.t)+'" src="'+esc(P.d)+'"><figcaption>'+esc(P.caption||"")+credit(P)+'</figcaption></figure>';
 if(DIAG[e.t])return DIAG[e.t]();return mini(e)}
/* ---------- the Pictures tab ---------- */
function allPics(){const L=[];const D=(window.GF_DICT||[]);Object.entries(IMG()).forEach(([t,P])=>{if(P&&P.d)L.push({kind:"term",t,P,cap:P.caption||t})});ICON().forEach(P=>{if(P&&P.d)L.push({kind:"place",t:P.name||P.caption,P,cap:P.caption||P.name})});return L}
function picsHTML(q){const Q=String(q||"").toLowerCase().trim(),L=allPics().filter(x=>!Q||(x.t+" "+x.cap).toLowerCase().includes(Q));
 if(!allPics().length)return'<p class="gflib-empty">Pictures are on their way.</p>';
 return'<div class="gfdv-grid">'+(L.length?L.map((x,i)=>'<button type="button" class="gfdv-tile" data-pk="'+esc(x.kind)+'" data-pt="'+esc(x.t)+'"><img loading="lazy" alt="" src="'+esc(x.P.d)+'"><span>'+esc(x.t)+'</span></button>').join(""):'<p class="gflib-empty">No picture matches “'+esc(q)+'”.</p>')+'</div>'}
function big(P,api){const el=document.createElement("div");el.className="gfdv-lb";el.innerHTML='<div class="gfdv-lbox"><button type="button" class="gfdv-lx" aria-label="Close">×</button><img alt="" src="'+esc(P.d)+'"><div><b>'+esc(P.name||"")+'</b><p>'+esc(P.caption||"")+'</p>'+credit(P)+(P.ll?'<button type="button" class="gfdv-go">🗺️ Fly there on the map</button>':'')+'</div></div>';
 document.body.appendChild(el);const x=()=>el.remove();el.onclick=ev=>{if(ev.target===el)x()};el.querySelector(".gfdv-lx").onclick=x;
 const g=el.querySelector(".gfdv-go");if(g)g.onclick=()=>{x();try{api.close();api.goMap("satellite",()=>{api.flyLL(P.ll,6);setTimeout(()=>api.ping(P.ll,P.name),950)})}catch(e){}}}
function wire(c,api){c.querySelectorAll(".gfdv-mm canvas").forEach(drawMini);
 c.querySelectorAll(".gfdv-dtm").forEach(d=>{const sl=d.querySelector("input"),b=d.querySelector("b"),cap=d.querySelector(".gfdv-cap"),T=JSON.parse(cap.dataset.st);const up=()=>{const v=+sl.value;b.textContent=v;cap.textContent=T[v-1];d.querySelectorAll(".gfdv-st").forEach(r=>r.setAttribute("opacity",+r.dataset.s===v-1?.22:0))};sl.oninput=up;up()});
 c.querySelectorAll(".gfdv-tile").forEach(b=>b.onclick=()=>{const k=b.dataset.pk,t=b.dataset.pt;if(k==="term")api.showTerm(t);else{const P=ICON().find(x=>(x.name||x.caption)===t);if(P)big(P,api)}})}
window.gfDictVis={visual,picsHTML,wire,DIAG};
{const s=document.createElement("style");s.textContent=`
.gfdv-fig{margin:4px 0 10px}.gfdv-fig img{display:block;width:100%;max-height:260px;object-fit:cover;border-radius:10px}.gfdv-fig figcaption{font-size:12.5px;color:#6a5a44;margin-top:4px}
.gfdv-cr{display:block;font-size:10.5px;color:#9a8a72}
.gfdv-mm{margin:4px 0 10px}.gfdv-mm canvas{display:block;width:100%;max-width:420px;height:auto;border-radius:10px;border:1px solid #d8ccb4}.gfdv-mm small{font-size:11.5px;color:#7a6a55}
.gfdv-dg{margin:4px 0 10px;padding:8px;border-radius:10px;background:#fbf6ea;border:1px solid #e3d6bc}.gfdv-dg svg{display:block;width:100%;max-width:440px;height:auto}.gfdv-cap{font-size:12.5px;color:#5a4a36;margin:4px 0 0}
.gfdv-sl{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:#5a4a36}.gfdv-sl input{flex:1;max-width:240px}
.gfdv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}.gfdv-tile{border:0;padding:0;border-radius:12px;overflow:hidden;background:#fff;cursor:pointer;text-align:left;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.gfdv-tile img{display:block;width:100%;height:100px;object-fit:cover}.gfdv-tile span{display:block;padding:6px 8px;font-size:12.5px;font-weight:700;color:#3d2a16}
.gfdv-lb{position:fixed;inset:0;z-index:3100;background:rgba(10,8,6,.7);display:flex;align-items:center;justify-content:center;padding:16px}
.gfdv-lbox{position:relative;max-width:min(980px,100%);max-height:92vh;overflow:auto;background:#fffaf0;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}.gfdv-lbox img{max-width:100%;max-height:68vh;object-fit:contain;border-radius:10px;align-self:center}
.gfdv-lx{position:absolute;top:8px;right:10px;border:0;background:rgba(255,250,240,.9);border-radius:50%;width:32px;height:32px;font-size:20px;cursor:pointer}
.gfdv-go{margin-top:8px;border:0;border-radius:999px;padding:7px 14px;font-weight:800;background:#2f6f8f;color:#fff;cursor:pointer}`;document.head.appendChild(s)}
})();
