/* GeoFlock: States & provinces drills (part of Trivia → Drills).
   Outlines: Natural Earth admin-1 (public domain), merged into regions for France, Italy, Spain and the UK,
   one small file per country in provinces/, loaded only when that country is opened. */
(function(){
if(typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LIST=[["us","US states","state"],["ca","Canada","province or territory"],["mx","Mexico","state"],["br","Brazil","state"],["ar","Argentina","province"],
 ["gb","United Kingdom","region or nation"],["fr","France","region"],["de","Germany","state"],["it","Italy","region"],["es","Spain","autonomous community"],
 ["ru","Russia","region"],["cn","China","province"],["in","India","state or territory"],["jp","Japan","prefecture"],["au","Australia","state or territory"],
 ["za","South Africa","province"],["ng","Nigeria","state"]];
const CAPS={
 us:{"Alabama":"Montgomery","Alaska":"Juneau","Arizona":"Phoenix","Arkansas":"Little Rock","California":"Sacramento","Colorado":"Denver","Connecticut":"Hartford","Delaware":"Dover","Florida":"Tallahassee","Georgia":"Atlanta","Hawaii":"Honolulu","Idaho":"Boise","Illinois":"Springfield","Indiana":"Indianapolis","Iowa":"Des Moines","Kansas":"Topeka","Kentucky":"Frankfort","Louisiana":"Baton Rouge","Maine":"Augusta","Maryland":"Annapolis","Massachusetts":"Boston","Michigan":"Lansing","Minnesota":"Saint Paul","Mississippi":"Jackson","Missouri":"Jefferson City","Montana":"Helena","Nebraska":"Lincoln","Nevada":"Carson City","New Hampshire":"Concord","New Jersey":"Trenton","New Mexico":"Santa Fe","New York":"Albany","North Carolina":"Raleigh","North Dakota":"Bismarck","Ohio":"Columbus","Oklahoma":"Oklahoma City","Oregon":"Salem","Pennsylvania":"Harrisburg","Rhode Island":"Providence","South Carolina":"Columbia","South Dakota":"Pierre","Tennessee":"Nashville","Texas":"Austin","Utah":"Salt Lake City","Vermont":"Montpelier","Virginia":"Richmond","Washington":"Olympia","West Virginia":"Charleston","Wisconsin":"Madison","Wyoming":"Cheyenne"},
 ca:{"Alberta":"Edmonton","British Columbia":"Victoria","Manitoba":"Winnipeg","New Brunswick":"Fredericton","Newfoundland and Labrador":"St. John's","Nova Scotia":"Halifax","Ontario":"Toronto","Prince Edward Island":"Charlottetown","Quebec":"Quebec City","Saskatchewan":"Regina","Northwest Territories":"Yellowknife","Nunavut":"Iqaluit","Yukon":"Whitehorse"},
 au:{"New South Wales":"Sydney","Victoria":"Melbourne","Queensland":"Brisbane","Western Australia":"Perth","South Australia":"Adelaide","Tasmania":"Hobart","Northern Territory":"Darwin","Australian Capital Territory":"Canberra"}};
const DATA={};
function load(cc){if(DATA[cc])return Promise.resolve(DATA[cc]);return fetch("provinces/"+cc+".json").then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{d.items.forEach(x=>{/* d3 wants clockwise outer rings: flip any ring that would cover more than half the globe */const fix=r=>{if(d3.geoArea({type:"Polygon",coordinates:[r]})>2*Math.PI)r.reverse()};if(x.g.type==="Polygon")x.g.coordinates.forEach(fix);else x.g.coordinates.forEach(p=>p.forEach(fix));x.f={type:"Feature",properties:{},geometry:x.g}});DATA[cc]=d;return d})}
function projFor(cc,F,W,H){const fc={type:"FeatureCollection",features:F};
 if(cc==="us")return d3.geoAlbersUsa().fitExtent([[8,8],[W-8,H-8]],fc);
 const b=d3.geoBounds(fc);let lo0=b[0][0],lo1=b[1][0];if(lo1<lo0)lo1+=360;const cl=(lo0+lo1)/2,la0=b[0][1],la1=b[1][1];
 if(cc==="ru")return d3.geoConicEqualArea().rotate([-100,0]).parallels([50,70]).fitExtent([[8,8],[W-8,H-8]],fc);
 if(Math.abs(la1-la0)>12||cc==="cn"||cc==="ca")return d3.geoConicEqualArea().rotate([-cl,0]).parallels([la0+(la1-la0)/6,la1-(la1-la0)/6]).fitExtent([[8,8],[W-8,H-8]],fc);
 return d3.geoMercator().fitExtent([[8,8],[W-8,H-8]],fc)}
const st=()=>{const t=triviaState();t.prov=t.prov||{mode:"find",len:"10",best:{}};return t.prov};
let R=null;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function start(cc,mode){const S=st();load(cc).then(d=>{const items=d.items.filter(x=>mode!=="cap"||(CAPS[cc]&&CAPS[cc][x.n]));
  const len=S.len==="all"?items.length:S.len==="endless"?Infinity:Math.min(+S.len||10,items.length);
  R={cc,mode,d,items,queue:shuffle(items.slice()),len,k:0,ok:0,miss:[],cur:null,answered:false,tries:0,done:{},t0:Date.now()};next()}).catch(e=>{console.error(e);R=null;menuMsg("Couldn’t load the map. Check your connection.")})}
function next(){if(!R)return;if(R.k>=R.len){R.end=true;render();return}if(!R.queue.length)R.queue=shuffle(R.items.slice());
 if(R.len===Infinity&&R.again&&R.again.length&&R.again[0].at<=R.k)R.cur=R.again.shift().x;else R.cur=R.queue.shift();
 R.answered=false;R.tries=0;R.wrong=null;R._vb=null;R.opts=R.mode==="name"||R.mode==="cap"?opts():null;render()}
function opts(){const c=R.cur,near=R.items.filter(x=>x!==c).map(x=>[x,Math.hypot(x.c[0]-c.c[0],x.c[1]-c.c[1])]).sort((a,b)=>a[1]-b[1]).slice(0,8).map(a=>a[0]);
 const o=[c].concat(shuffle(near).slice(0,3));return shuffle(o)}
function capOf(x){return(CAPS[R.cc]||{})[x.n]}
function finish(ok){R.answered=true;R.right=ok;R.k++;if(ok){R.ok++;R.done[R.cur.n]="ok";try{if(typeof ppCredit==="function")ppCredit(R.cc,"know",R.mode!=="find"?false:true,"pv:"+R.cc+":"+R.mode+":"+R.t0)}catch(e){}try{if(typeof xpGain==="function")xpGain(1,"drill")}catch(e){}}
 else{R.done[R.cur.n]="no";R.miss.push(R.cur);if(R.len===Infinity)(R.again=R.again||[]).push({x:R.cur,at:R.k+3})}render()}
function clickRegion(n){if(!R||R.answered||R.mode!=="find")return;const x=R.items.find(i=>i.n===n);if(!x)return;
 if(x===R.cur){finish(R.tries===0);return}R.tries++;R.wrong=x;if(R.tries>=2){finish(false);return}render()}
function menuMsg(m){R=null;render(m)}
function title(){const L=LIST.find(l=>l[0]===R.cc);return L?L[1]:R.cc}
function kind(){const L=LIST.find(l=>l[0]===R.cc);return L?L[2]:"region"}
function render(msg){const v=document.getElementById("triviaView");if(!v)return;
 if(!R){const sec=v.querySelector(".pv-sec");if(sec)sec.outerHTML=menuHTML(msg);return}
 if(R.end){const S=st(),key=R.cc+":"+R.mode,pb=S.best[key]||0,nb=R.ok>pb;if(nb&&!R._saved){S.best[key]=R.ok;try{saveStats()}catch(e){}}R._saved=1;const miss=[...new Set(R.miss.map(x=>x.n))];
  v.innerHTML='<div class="dr-wrap"><div class="pv-card pv-endc"><small>'+esc(title())+'</small><h2>'+R.ok+' / '+R.k+'</h2><p>'+(R.ok===R.k?"Perfect round.":nb?"New best!":"Best: "+pb)+'</p>'+(miss.length?'<p class="pv-missl"><small>To practise:</small> '+miss.map(esc).join(" · ")+'</p>':'')+'<div class="dr-acts"><button type="button" class="chip" id="pvBack">All drills</button><button type="button" class="chip tut-go" id="pvAgain">Again →</button></div></div></div>';
  document.getElementById("pvBack").onclick=()=>{R=null;try{renderTriviaView()}catch(e){}};document.getElementById("pvAgain").onclick=()=>start(R.cc,R.mode);return}
 const c=R.cur;let ask="",body="";
 if(R.mode==="find")ask="Where is <b>"+esc(c.n)+"</b>?";else if(R.mode==="name")ask="Which "+esc(kind())+" is highlighted?";else ask="What is the capital of the highlighted "+esc(kind().split(" ")[0])+"?";
 if(R.opts)body='<div class="dr-opts4 pv-opts">'+R.opts.map((o,i)=>{let cls="";if(R.answered){if(o===c)cls=" ok";else if(o===R.given)cls=" no"}const lab=R.mode==="cap"?capOf(o):o.n;return'<button type="button" class="dr-o'+cls+'" data-i="'+i+'"'+(R.answered?" disabled":"")+'><kbd>'+(i+1)+'</kbd>'+esc(lab)+'</button>'}).join("")+'</div>';
 const fb=R.answered?'<div class="dr-fb '+(R.right?"ok":"no")+'"><b>'+(R.right?"Right!":"Not quite.")+'</b> '+esc(c.n)+(capOf(c)?' · capital '+esc(capOf(c)):'')+'</div><button type="button" class="chip tut-go" id="pvNext">'+(R.k>=R.len?"See score →":"Next →")+'</button>':(R.wrong?'<div class="dr-fb no">That’s <b>'+esc(R.wrong.n)+'</b>. One more try.</div>':'')+'<button type="button" class="chip dr-skip" id="pvSkip">Skip <kbd>Esc</kbd></button>';
 v.innerHTML='<div class="dr-wrap pv-wrap"><div class="pv-card"><div class="dr-top"><span>'+esc(title())+(R.len===Infinity?" · endless":" · "+Math.min(R.k+(R.answered?0:1),R.len)+" of "+R.len)+'</span><span>score <b>'+R.ok+'</b></span><button type="button" class="dr-quit" id="pvQuit">End</button></div><h3>'+ask+'</h3><div class="pv-map"><svg></svg><div class="pv-zoom"><button type="button" data-z="1.6" aria-label="Zoom in">+</button><button type="button" data-z="0.625" aria-label="Zoom out">−</button></div><div class="pv-tip" hidden></div></div>'+body+fb+'</div></div>';
 drawMap(v.querySelector(".pv-map"));
 document.getElementById("pvQuit").onclick=()=>{R.len=R.k;R.end=true;render()};
 v.querySelectorAll(".pv-opts .dr-o").forEach(b=>b.onclick=()=>{const o=R.opts[+b.dataset.i];R.given=o;finish(o===c)});
 const sk=document.getElementById("pvSkip");if(sk)sk.onclick=()=>{if(!R.answered)finish(false)};const nx=document.getElementById("pvNext");if(nx){nx.onclick=next;nx.focus({preventScroll:true})}}
function drawMap(box){const svg=box.querySelector("svg"),W=box.clientWidth||700,H=box.clientHeight||440;
 const P=projFor(R.cc,R.items.map(x=>x.f),W,H),path=d3.geoPath(P),c=R.cur,show=R.mode!=="find";
 const cls=x=>{let k="pv-r";if(R.done[x.n]==="ok"&&x!==c)k+=" done";if(show&&x===c)k+=" target";if(R.answered&&x===c)k+=R.right?" right":" reveal";if(R.wrong===x)k+=" wrong";return k};
 const lab=R.items.filter(x=>(R.done[x.n]&&x!==c)||(R.answered&&x===c)||x===R.wrong);
 let h='<g class="pv-g">'+R.items.map((x,i)=>'<path class="'+cls(x)+'" data-i="'+i+'" d="'+(path(x.f)||"")+'"/>').join("");
 h+=lab.map(x=>{const p=P(x.c);return p?'<text class="pv-lab" x="'+p[0].toFixed(1)+'" y="'+p[1].toFixed(1)+'">'+esc(x.n)+'</text>':""}).join("")+'</g>';
 svg.innerHTML=h;
 /* zoom and pan by moving the viewBox */
 let vb=R._vb||[0,0,W,H];
 if(!R._vb&&(show||R.answered)&&c){const bb=path.bounds(c.f),w=bb[1][0]-bb[0][0],hh=bb[1][1]-bb[0][1];if(w<14&&hh<14){const k=Math.min(8,40/Math.max(w,hh,1)),cx=(bb[0][0]+bb[1][0])/2,cy=(bb[0][1]+bb[1][1])/2;vb=[cx-W/k/2,cy-H/k/2,W/k,H/k]}}
 const apply=()=>{svg.setAttribute("viewBox",vb.map(v=>v.toFixed(2)).join(" "));const k=W/vb[2];svg.style.setProperty("--pvk",k)};apply();
 const zoomAt=(f,mx,my)=>{const nw=Math.min(W,Math.max(W/14,vb[2]/f)),nh=nw*H/W;const px=vb[0]+(mx/W)*vb[2],py=vb[1]+(my/H)*vb[3];vb=[px-(mx/W)*nw,py-(my/H)*nh,nw,nh];clamp();apply();R._vb=vb.slice()};
 const clamp=()=>{vb[0]=Math.max(-W*.2,Math.min(W*1.2-vb[2],vb[0]));vb[1]=Math.max(-H*.2,Math.min(H*1.2-vb[3],vb[1]))};
 svg.onwheel=e=>{e.preventDefault();const r=svg.getBoundingClientRect();zoomAt(e.deltaY<0?1.25:0.8,(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)};
 let drag=null,moved=false,pts=new Map();
 svg.onpointerdown=e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,vb:vb.slice(),d0:pts.size===2?dist():0};moved=false;try{svg.setPointerCapture(e.pointerId)}catch(_){}};
 const dist=()=>{const a=[...pts.values()];return a.length<2?0:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
 svg.onpointermove=e=>{if(!drag)return;pts.set(e.pointerId,[e.clientX,e.clientY]);const r=svg.getBoundingClientRect();
  if(pts.size===2){const d=dist();if(drag.d0){const a=[...pts.values()];zoomAt(d/drag.d0,((a[0][0]+a[1][0])/2-r.left)*W/r.width,((a[0][1]+a[1][1])/2-r.top)*H/r.height);drag.d0=d;moved=true}else drag.d0=d;return}
  const dx=(e.clientX-drag.x)*drag.vb[2]/r.width,dy=(e.clientY-drag.y)*drag.vb[3]/r.height;if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>5)moved=true;if(moved){vb=[drag.vb[0]-dx,drag.vb[1]-dy,vb[2],vb[3]];clamp();apply();R._vb=vb.slice()}};
 svg.onpointerup=svg.onpointercancel=e=>{pts.delete(e.pointerId);if(!pts.size)drag=null};
 svg.onclick=e=>{if(moved)return;const t=e.target.closest&&e.target.closest("path.pv-r");if(t)clickRegion(R.items[+t.dataset.i].n)};
 const tip=box.querySelector(".pv-tip");
 svg.onmousemove=e=>{const t=e.target.closest&&e.target.closest("path.pv-r");if(!t){tip.hidden=true;return}const x=R.items[+t.dataset.i];if(R.done[x.n]||R.answered||x===R.wrong){tip.hidden=false;tip.textContent=x.n;const r=box.getBoundingClientRect();tip.style.left=(e.clientX-r.left+12)+"px";tip.style.top=(e.clientY-r.top+12)+"px"}else tip.hidden=true};
 svg.onmouseleave=()=>{tip.hidden=true};
 box.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>zoomAt(+b.dataset.z,W/2,H/2))}
function menuHTML(msg){const S=st();return'<div class="pv-sec"><div class="dr-head"><h2>States & provinces</h2><p>Learn the map inside a country. Click a country to start.</p></div>'+(msg?'<p class="dr-msg">'+esc(msg)+'</p>':'')+
 '<div class="dr-row pv-moderow"><span>Mode</span>'+[["find","Find it on the map"],["name","Name the highlighted one"],["cap","Capitals (US, Canada, Australia)"]].map(([k,l])=>'<button type="button" class="chip'+(S.mode===k?" active":"")+'" data-pvm="'+k+'">'+l+'</button>').join("")+'</div>'+
 '<div class="pv-grid">'+LIST.filter(l=>S.mode!=="cap"||CAPS[l[0]]).map(([cc,lab])=>{const best=S.best[cc+":"+S.mode];return'<button type="button" class="pv-tile" data-pv="'+cc+'"><img src="'+(typeof flagUrl==="function"?flagUrl(cc,"w80"):"")+'" alt=""><b>'+esc(lab)+'</b>'+(best?'<small>best '+best+'</small>':'')+'</button>'}).join("")+'</div></div>'}
function wireMenu(sec){const S=st();sec.querySelectorAll("[data-pvm]").forEach(b=>b.onclick=()=>{S.mode=b.dataset.pvm;try{saveStats()}catch(e){}sec.outerHTML=menuHTML();ensure()});
 sec.querySelectorAll("[data-pv]").forEach(b=>b.onclick=()=>{const S2=st();S2.len=(triviaState().drills||{}).len||"10";start(b.dataset.pv,S2.mode)})}
/* put the section under the drill tiles whenever the Drills menu is showing */
function ensure(){if(R)return;const v=document.getElementById("triviaView");if(!v)return;const opts=v.querySelector(".dr-wrap > .dr-opts");if(!opts||v.querySelector(".dr-card"))return;let sec=v.querySelector(".pv-sec");if(!sec){opts.insertAdjacentHTML("afterend",menuHTML());sec=v.querySelector(".pv-sec")}if(!sec._w){sec._w=1;wireMenu(sec)}}
new MutationObserver(()=>{try{ensure()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});
{const _rt=renderTriviaView;renderTriviaView=function(){if(R&&triviaState().fcMode==="drills"){return render()}return _rt.apply(this,arguments)}}
document.addEventListener("keydown",e=>{if(!R||R.end)return;const v=document.getElementById("triviaView");if(!v||!v.querySelector(".pv-card"))return;
 if(e.key==="Escape"&&!R.answered){e.preventDefault();finish(false);return}
 if(e.key==="Enter"&&R.answered){const nx=document.getElementById("pvNext");if(nx){e.preventDefault();nx.click()}return}
 if(!R.answered&&R.opts&&/^[1-4]$/.test(e.key)){const b=v.querySelectorAll(".pv-opts .dr-o")[+e.key-1];if(b)b.click()}});
const css=document.createElement("style");css.textContent=`
.pv-sec{ margin-top:26px; }
.pv-moderow{ justify-content:center; margin-bottom:10px; }
.pv-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
.pv-tile{ display:flex; flex-direction:column; align-items:center; gap:4px; border:0; background:rgba(255,255,255,.85); border-radius:16px; box-shadow:0 4px 14px rgba(20,40,70,.08); padding:12px 8px; cursor:pointer; font:inherit; color:inherit; }
.pv-tile:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(20,40,70,.14); } .pv-tile img{ height:30px; border-radius:3px; box-shadow:0 1px 4px rgba(0,0,0,.2); } .pv-tile b{ font-size:14px; } .pv-tile small{ opacity:.6; font-size:11px; }
.pv-wrap{ max-width:1000px; } .pv-card{ background:rgba(255,255,255,.92); border-radius:22px; box-shadow:0 6px 22px rgba(20,40,70,.1); padding:16px; text-align:center; } .pv-card h3{ font-size:20px; margin:6px 0 10px; }
.pv-map{ position:relative; height:min(62vh,520px); background:linear-gradient(#e7f2fa,#d8e9f5); border-radius:16px; overflow:hidden; touch-action:none; } .pv-map svg{ width:100%; height:100%; display:block; cursor:pointer; }
.pv-r{ fill:#f3ead7; stroke:#8a7a5c; stroke-width:calc(.8px / var(--pvk,1)); transition:fill .15s; } .pv-r:hover{ fill:#fff3c9; }
.pv-r.done{ fill:#cfe8cf; } .pv-r.target{ fill:#ffb14a; stroke:#a85a00; } .pv-r.right{ fill:#5cc06b; stroke:#2f7a3a; } .pv-r.reveal{ fill:#ffb14a; stroke:#a85a00; animation:pvPulse 1s ease-in-out 3; } .pv-r.wrong{ fill:#f08a84; }
@keyframes pvPulse{ 50%{ fill:#ffd79a; } }
.pv-lab{ font:700 calc(12px / var(--pvk,1)) system-ui,sans-serif; fill:#1f2a33; stroke:#fff; stroke-width:calc(3px / var(--pvk,1)); paint-order:stroke; text-anchor:middle; dominant-baseline:middle; pointer-events:none; }
.pv-zoom{ position:absolute; right:10px; top:10px; display:flex; flex-direction:column; gap:6px; } .pv-zoom button{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.18); font-size:18px; cursor:pointer; color:#1f2a33; }
.pv-tip{ position:absolute; pointer-events:none; background:#1f2a33; color:#fff; font-size:12px; padding:3px 8px; border-radius:6px; }
.pv-endc h2{ font-size:42px; margin:6px 0; } .pv-missl{ max-width:640px; margin:8px auto; }
body.sky-night .pv-tile, body.sky-night .pv-card, body.dark-theme .pv-tile, body.dark-theme .pv-card{ background:rgba(30,34,60,.9); }
body.sky-night .pv-map, body.dark-theme .pv-map{ background:linear-gradient(#16223a,#101a2e); }`;
document.head.appendChild(css);
window.gfProvinces={start:start,LIST:LIST};
})();
