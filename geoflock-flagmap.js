/* GeoFlock: two things for the Flags subject of Study & Quiz.
   1. "Flag map": a chip on the Flags study region row (next to Flag families, Flags tour and Flag history). It draws the world
      (Robinson, from the same PROJ_WORLD shapes as World Maps → Projections) with every country filled by its own flag: the flag
      image is clipped to the country's outline and stretched over the country's bounding box. A country's far-off parts
      (Alaska, Hawaii, French Guiana, Svalbard…) get a flag of their own sized to themselves; nearby islands share the main one.
      Overseas departments and parts the data counts as the owning country (countsAs) carry the owner's flag.
      Wheel / pinch / buttons zoom, drag pans, hover names the country, click opens its flag card.
   2. First visits: the first time Study & Quiz is opened (localStorage gfFirstStudy) it opens on Flags › Study instead of the
      subject chooser; the first time a Quiz tab is opened there (gfFirstQuiz) it goes to Flags › Quiz and starts the flags quiz.
   A patch file: wraps renderChrome and renderActiveView after load, like geoflock-flags-extra.js. */
(function(){
if(typeof renderChrome!=="function"||typeof renderActiveView!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const SVGNS="http://www.w3.org/2000/svg";
let on=false;

/* ---------- which flag each shape carries ---------- */
/* parts of a country in law (French overseas departments, the Caribbean Netherlands) wear the owner's flag */
const INTEGRAL={gf:"fr",gp:"fr",mq:"fr",re:"fr",yt:"fr",bonaire:"nl",saba:"nl",statia:"nl",wake:"us",midway:"us",johnston:"us",hm:"au",bv:"no"};
function ownerCode(info){if(!info||!info.owner)return null;const n=info.owner.replace(/^the /,"");const c=COUNTRIES.find(x=>x.n===n||x.n.replace(/^the /,"")===n);return c?c.c:null}
function flagCodeFor(p){const c=p.c;if(!c)return p.dimAs||null;if(c==="aq")return null;
 if(INTEGRAL[c])return INTEGRAL[c];
 if(typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[c])return c;
 const T=typeof TERRITORY_INFO!=="undefined"?TERRITORY_INFO[c]:null;
 if(T&&T.countsAs)return T.countsAs;
 if(/^[a-z]{2}$/.test(c))return c;/* an ISO territory (Greenland, Puerto Rico…) has its own flag */
 return ownerCode(T)}
function nameFor(p){const c=p.c;let n=p.n||c;try{if(c&&typeof projName==="function")n=projName(c,p.n)}catch(e){}
 const T=c&&typeof TERRITORY_INFO!=="undefined"?TERRITORY_INFO[c]:null;if(T&&T.owner&&!(typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[c]))n+=" ("+T.owner.replace(/^the /,"")+")";return n}

/* ---------- geometry: polygons grouped per flag ---------- */
let built=null;
function build(){if(built)return built;
 const feats=projFeatures().filter(f=>f.geometry);
 const pr=(d3.geoRobinson?d3.geoRobinson():d3.geoNaturalEarth1()).precision(.2);
 const W=1000;pr.fitWidth(W,{type:"Sphere"});const path=d3.geoPath(pr);
 const byFlag=new Map(),hits=[];let y0=Infinity,y1=-Infinity;
 feats.forEach(f=>{const p=f.properties||{};const fc=flagCodeFor(p);const polys=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.type==="MultiPolygon"?f.geometry.coordinates:[];
  const d=path(f);if(!d)return;hits.push({d,name:nameFor(p),code:p.c,fc});
  if(p.c!=="aq"){const b=path.bounds(f);if(isFinite(b[0][1])){y0=Math.min(y0,b[0][1]);y1=Math.max(y1,b[1][1])}}
  if(!fc)return;let L=byFlag.get(fc);if(!L)byFlag.set(fc,L=[]);
  polys.forEach(poly=>{const g={type:"Polygon",coordinates:poly};const b=path.bounds(g);if(!isFinite(b[0][0]))return;L.push({g,b,a:Math.abs(path.area(g))})})});
 /* cluster: start from the largest polygon left, take in every polygon whose box comes within a margin of the group's box, repeat until stable */
 const groups=[];
 byFlag.forEach((L,fc)=>{let rest=L.slice().sort((a,b)=>b.a-a.a);
  while(rest.length){const m=rest.shift();let B=[m.b[0].slice(),m.b[1].slice()];const mem=[m];const diag=Math.hypot(B[1][0]-B[0][0],B[1][1]-B[0][1]);const pad=Math.min(10,Math.max(2.5,diag*.2));
   let grew=true;while(grew){grew=false;rest=rest.filter(q=>{if(q.b[0][0]<=B[1][0]+pad&&q.b[1][0]>=B[0][0]-pad&&q.b[0][1]<=B[1][1]+pad&&q.b[1][1]>=B[0][1]-pad){mem.push(q);B[0][0]=Math.min(B[0][0],q.b[0][0]);B[0][1]=Math.min(B[0][1],q.b[0][1]);B[1][0]=Math.max(B[1][0],q.b[1][0]);B[1][1]=Math.max(B[1][1],q.b[1][1]);grew=true;return false}return true})}
   groups.push({fc,B,d:mem.map(q=>path(q.g)).join(""),a:mem.reduce((s,q)=>s+q.a,0)})}});
 groups.sort((a,b)=>b.a-a.a);/* small ones last, on top */
 const sphere=path({type:"Sphere"}),grat=path(d3.geoGraticule10());
 y0=Math.max(0,y0-8);y1=y1+8;
 return built={W,y0,H:y1-y0,groups,hits,sphere,grat}}

/* ---------- the view ---------- */
const css=document.createElement("style");css.textContent=`
.fm-wrap{ max-width:1200px; margin:4px auto 30px; padding:0 12px; }
.fm-head{ text-align:center; margin-bottom:10px; } .fm-head h2{ margin:0 0 4px; } .fm-head p{ margin:0; opacity:.75; font-size:14px; }
.fm-box{ position:relative; border-radius:18px; overflow:hidden; background:#bfe3f6; box-shadow:0 4px 16px rgba(20,40,70,.12); touch-action:none; user-select:none; -webkit-user-select:none; }
.fm-box svg{ display:block; width:100%; height:auto; cursor:grab; } .fm-box.drag svg{ cursor:grabbing; }
.fm-sea{ fill:#bfe3f6; } .fm-grat{ fill:none; stroke:#fff; stroke-opacity:.55; stroke-width:.6; vector-effect:non-scaling-stroke; }
.fm-sph{ fill:none; stroke:#8fbfdc; stroke-width:1; vector-effect:non-scaling-stroke; }
.fm-hit{ fill:transparent; stroke:#2a3340; stroke-opacity:.75; stroke-width:.55; vector-effect:non-scaling-stroke; stroke-linejoin:round; }
.fm-hit.fm-ice{ fill:#f4f8fb; } .fm-hit.fm-noflag{ fill:#e7e2d4; }
.fm-hit.on{ stroke:#fff; stroke-opacity:1; stroke-width:2.2; fill:rgba(255,255,255,.12); }
.fm-tip{ position:absolute; pointer-events:none; background:rgba(22,28,40,.92); color:#fff; font-size:13px; font-weight:700; padding:5px 9px; border-radius:8px; white-space:nowrap; display:none; align-items:center; gap:7px; transform:translate(-50%,calc(-100% - 12px)); z-index:3; }
.fm-tip img{ height:16px; border-radius:2px; }
.fm-ctl{ position:absolute; right:10px; top:10px; display:flex; flex-direction:column; gap:6px; z-index:2; }
.fm-ctl button{ width:34px; height:34px; border-radius:10px; border:none; background:rgba(255,255,255,.92); box-shadow:0 1px 5px rgba(0,0,0,.2); font:700 18px/1 inherit; cursor:pointer; color:#1d2433; }
.fm-ctl button:hover{ background:#fff; }
.fm-load{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; opacity:.7; }
body.dark .fm-box, body.dark .fm-sea{ background:#3f6a88; fill:#3f6a88; } body.dark .fm-grat{ stroke-opacity:.18; } body.dark .fm-hit{ stroke:#11161f; }
@media (max-width:760px){ .fm-box{ border-radius:12px; } .fm-head p{ font-size:13px; } }
`;document.head.appendChild(css);

function flagHref(fc){try{return flagUrl(fc,"w640")}catch(e){return"https://flagcdn.com/w640/"+fc+".png"}}
function show(){const v=document.getElementById("studyView");if(!v)return;v.style.display="";
 v.innerHTML='<div class="fm-wrap"><div class="fm-head"><h2>Flag map of the world</h2><p>Every country wearing its own flag. Scroll or pinch to zoom, drag to move, hover for a name, click for the flag.</p></div>'+
  '<div class="fm-box" id="fmBox"><div class="fm-load">Drawing the flags…</div></div></div>';
 const ready=typeof flagsReady!=="undefined"&&flagsReady&&flagsReady.then?flagsReady:Promise.resolve();
 ready.catch(()=>{}).then(()=>{const box=document.getElementById("fmBox");if(!box||!on)return;try{draw(box)}catch(e){console.error(e);box.innerHTML='<div class="fm-load">The map could not be drawn.</div>'}})}

function draw(box){const M=build();const W=M.W,H=M.H,y0=M.y0;
 let h='<svg xmlns="'+SVGNS+'" viewBox="0 '+y0.toFixed(1)+' '+W+' '+H.toFixed(1)+'" role="img" aria-label="World map with each country filled by its flag"><defs>';
 M.groups.forEach((g,i)=>{h+='<clipPath id="fmc'+i+'"><path d="'+g.d+'"/></clipPath>'});
 h+='</defs><rect class="fm-sea" x="-5000" y="-5000" width="11000" height="11000"/><g id="fmG"><path class="fm-grat" d="'+M.grat+'"/><path class="fm-sph" d="'+M.sphere+'"/>';
 M.hits.forEach(t=>{if(!t.fc)h+='<path class="fm-hit '+(t.code==="aq"?"fm-ice":"fm-noflag")+'" d="'+t.d+'"/>'});
 M.groups.forEach((g,i)=>{const[[x0,yA],[x1,yB]]=g.B;const w=Math.max(x1-x0,.3),hh=Math.max(yB-yA,.3);
  h+='<image href="'+esc(flagHref(g.fc))+'" x="'+x0.toFixed(2)+'" y="'+yA.toFixed(2)+'" width="'+w.toFixed(2)+'" height="'+hh.toFixed(2)+'" preserveAspectRatio="none" clip-path="url(#fmc'+i+')"/>'});
 M.hits.forEach((t,i)=>{h+='<path class="fm-hit'+(t.fc?"":" fm-x")+'" data-i="'+i+'" d="'+t.d+'"'+(t.fc?"":' style="fill:transparent"')+'/>'});
 h+='</g></svg><div class="fm-ctl"><button type="button" data-z="in" title="Zoom in" aria-label="Zoom in">+</button><button type="button" data-z="out" title="Zoom out" aria-label="Zoom out">−</button><button type="button" data-z="reset" title="Whole world" aria-label="Whole world" style="font-size:15px">⟲</button></div><div class="fm-tip" id="fmTip"></div>';
 box.innerHTML=h;
 const svg=box.querySelector("svg"),G=box.querySelector("#fmG"),tip=box.querySelector("#fmTip");
 /* zoom and pan in the svg's own units */
 const Z={k:1,x:0,y:0};
 /* keep the map covering the frame: x in [W(1-k),0], y so that [y0,y0+H] stays covered */
 const clamp=()=>{Z.k=Math.max(1,Math.min(60,Z.k));Z.x=Math.min(0,Math.max(W-W*Z.k,Z.x));const yHi=y0-y0*Z.k,yLo=(y0+H)-(y0+H)*Z.k;Z.y=Math.min(yHi,Math.max(yLo,Z.y))};
 const apply=()=>{clamp();G.setAttribute("transform","translate("+Z.x.toFixed(2)+","+Z.y.toFixed(2)+") scale("+Z.k.toFixed(4)+")");svg.style.setProperty("--k",Z.k)};
 const toSvg=(cx,cy)=>{const r=svg.getBoundingClientRect();return[cx-r.left,cy-r.top].map((v,i)=>i?y0+v*H/r.height:v*W/r.width)};
 const zoomAt=(sx,sy,f)=>{const k2=Math.max(1,Math.min(60,Z.k*f));const ff=k2/Z.k;Z.x=sx-(sx-Z.x)*ff;Z.y=sy-(sy-Z.y)*ff;Z.k=k2;apply()};
 svg.addEventListener("wheel",e=>{e.preventDefault();const[sx,sy]=toSvg(e.clientX,e.clientY);zoomAt(sx,sy,Math.exp(-e.deltaY*(e.deltaMode===1?.05:.0018)))},{passive:false});
 box.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>{const z=b.dataset.z;if(z==="reset"){Z.k=1;Z.x=0;Z.y=0;apply();return}zoomAt(W/2,y0+H/2,z==="in"?1.8:1/1.8)});
 const P=new Map();let moved=0,pinch=null,last=null;
 svg.addEventListener("pointerdown",e=>{svg.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(P.size===2){const[a,b]=[...P.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])}}else last=[e.clientX,e.clientY];box.classList.add("drag")});
 svg.addEventListener("pointermove",e=>{if(!P.has(e.pointerId)){hover(e);return}P.set(e.pointerId,[e.clientX,e.clientY]);const r=svg.getBoundingClientRect(),u=W/r.width;
  if(P.size===2&&pinch){const[a,b]=[...P.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);const[sx,sy]=toSvg((a[0]+b[0])/2,(a[1]+b[1])/2);if(pinch.d>0)zoomAt(sx,sy,d/pinch.d);pinch.d=d;moved=99;return}
  if(!last)return;const dx=e.clientX-last[0],dy=e.clientY-last[1];moved+=Math.abs(dx)+Math.abs(dy);last=[e.clientX,e.clientY];Z.x+=dx*u;Z.y+=dy*u;apply();tip.style.display="none"});
 const up=e=>{const was=P.has(e.pointerId);P.delete(e.pointerId);if(P.size<2)pinch=null;if(P.size===1){last=[...P.values()][0]}else last=null;if(!P.size)box.classList.remove("drag");
  if(was&&e.type==="pointerup"&&moved<6&&!P.size){const el=document.elementFromPoint(e.clientX,e.clientY);const t=el&&el.closest&&el.closest(".fm-hit[data-i]");if(t){const H=M.hits[+t.dataset.i];const c=H&&typeof COUNTRY_BY_CODE!=="undefined"&&(COUNTRY_BY_CODE[H.code]||COUNTRY_BY_CODE[H.fc]);if(c&&typeof openFlagZoom==="function")openFlagZoom(c)}}};
 svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
 let cur=null;
 function hover(e){const t=e.target.closest&&e.target.closest(".fm-hit[data-i]");if(cur&&cur!==t){cur.classList.remove("on");cur=null}
  if(!t){tip.style.display="none";return}if(cur!==t){cur=t;t.classList.add("on");G.appendChild(t);const H=M.hits[+t.dataset.i];tip.innerHTML=(H.fc?'<img src="'+esc(flagHref(H.fc))+'" alt="">':"")+esc(H.name)}
  const r=box.getBoundingClientRect();tip.style.display="flex";tip.style.left=(e.clientX-r.left)+"px";tip.style.top=(e.clientY-r.top)+"px"}
 svg.addEventListener("pointerleave",()=>{if(cur){cur.classList.remove("on");cur=null}tip.style.display="none"});
 apply()}

/* ---------- the chip on the Flags study row ---------- */
{const _rc=renderChrome;renderChrome=function(){const r=_rc.apply(this,arguments);try{const row=document.getElementById("regionRow");
  if(appMode!=="flag"||activeTab!=="study"){on=false;return r}
  if(row){let b=row.querySelector('[data-r="__flagmap__"]');if(!b){b=document.createElement("button");b.className="chip";b.dataset.r="__flagmap__";b.textContent="🗺️ Flag map";b.title="The world map with every country filled by its flag";
    b.onclick=()=>{on=true;try{ffInStudy=false}catch(e){}renderChrome();renderActiveView()}}
   /* right after the divider, the first of the Flags extras */
   const sep=row.querySelector(".fx-sep");if(sep){if(sep.nextSibling!==b)row.insertBefore(b,sep.nextSibling)}else if(b.parentNode!==row)row.appendChild(b);
   b.classList.toggle("active",on);
   if(on)row.querySelectorAll('.chip.active:not([data-r="__flagmap__"])').forEach(x=>x.classList.remove("active"));
   row.querySelectorAll('.chip:not([data-r="__flagmap__"])').forEach(x=>{if(!x._fm){x._fm=1;x.addEventListener("click",()=>{on=false},true)}})}}catch(e){console.error(e)}return r}}
{const _rav=renderActiveView;renderActiveView=function(){const r=_rav.apply(this,arguments);try{if(on&&appMode==="flag"&&activeTab==="study")show()}catch(e){console.error(e)}return r}}

/* ---------- first visits: Study opens on Flags, the first Quiz is the flags quiz ---------- */
const prSeen=()=>{try{return!!(stats.practice&&stats.practice.seen)}catch(e){return false}};
const inPractice=()=>(!!window._prOther&&appMode==="trivia")||["map","flag","capital","landforms"].includes(appMode);
function flagsQuiz(){const q=()=>{const b=[...document.querySelectorAll('nav.tabs .tab-btn[data-tab="quiz"]')].find(x=>x.offsetParent);if(b)b.click();else{activeTab="quiz";try{quizSection="standard"}catch(e){}renderChrome();renderActiveView()}};
 if(appMode!=="flag"||window._prOther){if(typeof gfPracticeGo==="function")gfPracticeGo("flag",true);else switchAppMode("flag")}setTimeout(q,0)}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#appModePracticeBtn, nav.tabs .tab-btn[data-tab=\"quiz\"], #landformsView [data-lfm=\"quiz\"], [data-prt=\"quiz\"]");if(!t)return;
 if(t.id==="appModePracticeBtn"){if(LS.get("gfFirstStudy"))return;LS.set("gfFirstStudy","1");if(prSeen())return;/* someone who has used Study before keeps the usual behaviour */
  e.preventDefault();e.stopImmediatePropagation();
  if(typeof gfPracticeGo==="function")gfPracticeGo("flag",true);else switchAppMode("flag");
  if(activeTab!=="study"){activeTab="study";renderChrome();renderActiveView()}scrollTo(0,0);return}
 if(!inPractice()||LS.get("gfFirstQuiz"))return;LS.set("gfFirstQuiz","1");
 if(appMode==="flag"&&!window._prOther&&t.matches('nav.tabs .tab-btn[data-tab="quiz"]'))return;/* already the flags quiz: let the tab start it */
 e.preventDefault();e.stopImmediatePropagation();flagsQuiz()},true);
window.gfFlagMap={open(){if(typeof gfPracticeGo==="function")gfPracticeGo("flag",true);activeTab="study";on=true;renderChrome();renderActiveView()}};
})();
