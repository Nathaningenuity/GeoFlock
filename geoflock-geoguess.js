/* GeoFlock: "Pin it on the map", a GeoGuessr-style way to play Where is this?
   Photos with known coordinates come from the tours' map photos (PS_SQ_LIB and each stop's phPins).
   Click where you think the photo was taken; the closer you are, the more points (up to 5,000 a round). */
(function(){
if(typeof wiRender!=="function"||typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ROUNDS=5,MAXPT=5000;
const PROJ=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
/* photos that are about a place rather than a person, a dish or an animal on its own */
const SKIP_TOURS=new Set(["explorers","animals","food","musicsport","inventions","people","flags","projections"]);
const SKIP_WORDS=/\b(portrait|statue of|food|dish|soup|stew|bread|cake|tacos?|sushi|curry|noodles?|cheese|wine|beer|coffee|tea|mosquito|flag|coin|banknote|stamp|poster|map of|diagram|logo|jersey|ball)\b/i;
let POOL=null;
function pool(){if(POOL)return POOL;const out=[],seen=new Set();const add=(at,i,label,src)=>{const P=PS_PHOTO_DATA[i];if(!P||!P.d||seen.has(i)||!at||!isFinite(at[0])||!isFinite(at[1]))return;if(SKIP_WORDS.test((label||"")+" "+(P.f||"")))return;seen.add(i);out.push({at:at.slice(),i,label:String(label||"").replace(/​/g,""),src})};
 try{(window.PS_SQ_LIB||[]).forEach(e=>add(e.at,e.img,(e.names||[])[0],"lib"))}catch(e){}
 try{for(const t in PS_TOURS){if(SKIP_TOURS.has(t)||/^hg/.test(t))continue;(PS_TOURS[t].steps||[]).forEach(S=>(S.phPins||[]).forEach(q=>{const i=(window.PS_SQ_IMG||{})[q.label];if(i!=null)add(q.at,i,q.label,t)}))}}catch(e){}
 try{const W=window.GF_WALL;if(W&&W.gameIdx)W.gameIdx.forEach(x=>add(x.at,x.i,x.label,"wall"))}catch(e){}
 POOL=out;return out}
function seeded(seed){let s=seed>>>0;return()=>{s=s+1831565813>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function countryAt(ll){try{const F=projFeatures();for(const f of F){if(f.geometry&&d3.geoContains(f,ll))return f.properties.c}}catch(e){}return null}
function km(a,b){return d3.geoDistance(a,b)*6371}
function score(d){return Math.round(MAXPT*Math.exp(-d/1500))}
const G={on:false,mode:"practice",deck:[],k:0,total:0,log:[],guess:null,done:false,vb:null};
function deal(){const P=pool();const seed=G.mode==="daily"?(typeof dailySeed==="function"?dailySeed():Math.floor(Date.now()/864e5))*104729:Math.floor(Math.random()*1e9);const R=seeded(seed);
 /* spread the five photos out: no two in the same country, and avoid two near each other */
 const L=P.slice(),pick=[],used=new Set();let tries=0;while(pick.length<ROUNDS&&L.length&&tries<500){tries++;const x=L.splice(Math.floor(R()*L.length),1)[0];const c=countryAt(x.at)||"?";if(used.has(c)||pick.some(p=>km(p.at,x.at)<800))continue;used.add(c);x.c=c;pick.push(x)}
 G.deck=pick;G.k=0;G.total=0;G.log=[];G.seed=seed;startRound()}
function startRound(){G.guess=null;G.done=false;G.vb=null;render()}
function confirm(){if(!G.guess||G.done)return;const cur=G.deck[G.k];const d=km(G.guess,cur.at),pts=score(d);G.done=true;G.d=d;G.pts=pts;G.total+=pts;G.log.push({i:cur.i,d,pts,c:cur.c,label:cur.label});
 try{if(cur.c&&cur.c!=="?"&&typeof ppCredit==="function"&&d<500)ppCredit(cur.c,"loc",d<100,"gg:"+cur.i+":"+G.seed)}catch(e){}
 if(G.k===ROUNDS-1){try{const s=ngStats("gameGeoGuess");s.played=(s.played||0)+1;if(G.total>(s.best||0)){s.best=G.total;G.newBest=true}else G.newBest=false;if(G.mode==="daily"){const D=stats.ggDaily=stats.ggDaily||{};D[dailySeed()]=G.total}saveStats()}catch(e){}}
 render()}
function render(){const v=document.getElementById("gamesView");if(!v)return;
 if(G.k>=ROUNDS||G.state==="end"){const s=(()=>{try{return ngStats("gameGeoGuess")}catch(e){return{}}})();
  v.innerHTML='<div class="game-panel gg-panel">'+(typeof ngHeader==="function"?ngHeader("Pin it on the map",(G.mode==="daily"?"Today’s five":"Practice")+" · final score"):"")+'<div class="wi-final"><b>'+G.total.toLocaleString()+'</b><small>of 25,000'+(G.newBest?" · new best!":"")+'</small></div><div class="wi-sum">'+G.log.map(l=>{const P=PS_PHOTO_DATA[l.i],C=COUNTRY_BY_CODE[l.c];return'<div class="wi-sum-i">'+(P&&P.d?'<img src="'+gfSrc(P.d)+'" alt="">':'')+'<span>'+(C?'<img class="wi-fl" src="'+flagUrl(l.c,"w40")+'" alt="">':'')+esc(l.label||(C?C.n:""))+' · '+Math.round(l.d).toLocaleString()+' km</span><b>'+l.pts.toLocaleString()+'</b></div>'}).join("")+'</div><div class="tut-actions"><button class="chip" id="ggShare">Copy score</button><button class="chip" id="ggBack">Back</button><button class="chip tut-go" id="ggAgain">Play again →</button></div></div>';
  document.getElementById("ggAgain").onclick=()=>{G.state="play";deal()};document.getElementById("ggBack").onclick=()=>{G.on=false;G.state=null;wi.state="setup";wiRender()};
  document.getElementById("ggShare").onclick=e=>{const t="Pin it on the map "+(G.mode==="daily"?"Day "+dailySeed():"Practice")+": "+G.total.toLocaleString()+"/25,000\n"+G.log.map(l=>l.pts>=4500?"🟩":l.pts>=2500?"🟨":l.pts>=800?"🟧":"🟥").join("")+"\nGeoFlock";try{navigator.clipboard.writeText(t);e.target.textContent="Copied!"}catch(_){}};G.state="end";return}
 const cur=G.deck[G.k],P=PS_PHOTO_DATA[cur.i];
 v.innerHTML='<div class="game-panel gg-panel"><div class="gg-top"><span>Round '+(G.k+1)+' of '+ROUNDS+'</span><span>score <b>'+G.total.toLocaleString()+'</b></span><button type="button" class="dr-quit" id="ggQuit">End</button></div>'+
  '<div class="gg-body"><figure class="gg-photo"><img src="'+gfSrc(P.d)+'" alt="A photo somewhere in the world"><figcaption>'+(G.done?esc(cur.label):'Where was this photo taken? Click the map.')+'</figcaption></figure>'+
  '<div class="gg-map"><svg viewBox="0 0 2000 1000"></svg><div class="pv-zoom"><button type="button" data-z="1.6" aria-label="Zoom in">+</button><button type="button" data-z="0.625" aria-label="Zoom out">−</button></div></div></div>'+
  '<div class="gg-act">'+(G.done?'<div class="dr-fb '+(G.pts>=2500?"ok":"no")+'"><b>'+Math.round(G.d).toLocaleString()+' km</b> away · <b>'+G.pts.toLocaleString()+'</b> points'+(cur.c&&COUNTRY_BY_CODE[cur.c]?' · '+esc(COUNTRY_BY_CODE[cur.c].n):'')+'</div><button type="button" class="chip tut-go" id="ggNext">'+(G.k===ROUNDS-1?"See score →":"Next photo →")+'</button>':'<button type="button" class="chip tut-go" id="ggGo"'+(G.guess?"":" disabled")+'>Guess</button><small>Click to drop a pin, then press Guess (or Enter). Scroll or pinch to zoom.</small>')+'</div></div>';
 drawMap(v.querySelector(".gg-map"),cur);
 document.getElementById("ggQuit").onclick=()=>{G.state="end";G.k=ROUNDS;render()};
 const go=document.getElementById("ggGo");if(go)go.onclick=confirm;const nx=document.getElementById("ggNext");if(nx){nx.onclick=()=>{G.k++;if(G.k>=ROUNDS){G.state="end";render()}else startRound()};nx.focus({preventScroll:true})}}
let BORDERS=null;
function borders(){if(BORDERS)return BORDERS;try{const p=d3.geoPath(PROJ);BORDERS=projFeatures().map(f=>p(f)||"").join("")}catch(e){BORDERS=""}return BORDERS}
function drawMap(box,cur){const svg=box.querySelector("svg"),W=2000,H=1000;
 let h='<image href="textures/reliefAllMaps.webp" x="0" y="-6.688" width="2000" height="1014.376" preserveAspectRatio="none"/><path d="'+borders()+'" fill="none" stroke="rgba(40,40,30,.35)" stroke-width="var(--gw,.6)"/>';
 const pin=(ll,cls)=>{const p=PROJ(ll);return p?'<g class="gg-pin '+cls+'" transform="translate('+p[0].toFixed(1)+','+p[1].toFixed(1)+')"><path d="M0,0 C-6,-9 -9,-13 -9,-18 A9,9 0 1 1 9,-18 C9,-13 6,-9 0,0Z"/><circle cy="-18" r="3.4" fill="#fff"/></g>':''};
 if(G.done){const a=PROJ(G.guess),b=PROJ(cur.at);if(a&&b)h+='<line class="gg-line" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"/>';h+=pin(cur.at,"real")}
 if(G.guess)h+=pin(G.guess,"me");
 svg.innerHTML=h;
 let vb=G.vb||[0,0,W,H];
 if(G.done&&!G._fit){G._fit=1;const a=PROJ(G.guess),b=PROJ(cur.at);if(a&&b){const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]);let w=Math.max(160,(x1-x0)*1.5),hh=w/2;if((y1-y0)*1.5>hh){hh=(y1-y0)*1.5;w=hh*2}vb=[(x0+x1)/2-w/2,(y0+y1)/2-hh/2,w,hh];G.vb=vb}}
 if(!G.done)G._fit=0;
 const apply=()=>{svg.setAttribute("viewBox",vb.map(x=>x.toFixed(2)).join(" "));const k=W/vb[2];svg.style.setProperty("--gw",(0.6/k).toFixed(3));svg.querySelectorAll(".gg-pin").forEach(g=>{const t=g.getAttribute("transform").replace(/ scale\([^)]*\)/,"");g.setAttribute("transform",t+" scale("+(1.6/k).toFixed(3)+")")});svg.querySelectorAll(".gg-line").forEach(l=>l.setAttribute("stroke-width",(3/k).toFixed(2)))};apply();
 const clamp=()=>{vb[2]=Math.min(W,vb[2]);vb[3]=vb[2]/2;vb[0]=Math.max(0,Math.min(W-vb[2],vb[0]));vb[1]=Math.max(0,Math.min(H-vb[3],vb[1]))};
 const zoomAt=(f,mx,my)=>{const nw=Math.min(W,Math.max(40,vb[2]/f)),nh=nw/2;const px=vb[0]+(mx/W)*vb[2],py=vb[1]+(my/H)*vb[3];vb=[px-(mx/W)*nw,py-(my/H)*nh,nw,nh];clamp();apply();G.vb=vb.slice()};
 const local=e=>{const r=svg.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
 svg.onwheel=e=>{e.preventDefault();const[x,y]=local(e);zoomAt(e.deltaY<0?1.3:1/1.3,x,y)};
 let drag=null,moved=false;const pts=new Map();const dist=()=>{const a=[...pts.values()];return a.length<2?0:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
 svg.onpointerdown=e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,vb:vb.slice(),d0:dist()};moved=false;try{svg.setPointerCapture(e.pointerId)}catch(_){}};
 svg.onpointermove=e=>{if(!drag)return;pts.set(e.pointerId,[e.clientX,e.clientY]);const r=svg.getBoundingClientRect();if(pts.size===2){const d=dist(),a=[...pts.values()];if(drag.d0){zoomAt(d/drag.d0,((a[0][0]+a[1][0])/2-r.left)*W/r.width,((a[0][1]+a[1][1])/2-r.top)*H/r.height);moved=true}drag.d0=d;return}
  if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>5)moved=true;if(moved){vb=[drag.vb[0]-(e.clientX-drag.x)*drag.vb[2]/r.width,drag.vb[1]-(e.clientY-drag.y)*drag.vb[3]/r.height,vb[2],vb[3]];clamp();apply();G.vb=vb.slice()}};
 svg.onpointerup=svg.onpointercancel=e=>{pts.delete(e.pointerId);if(!pts.size)drag=null};
 svg.onclick=e=>{if(moved||G.done)return;const r=svg.getBoundingClientRect();const x=vb[0]+(e.clientX-r.left)/r.width*vb[2],y=vb[1]+(e.clientY-r.top)/r.height*vb[3];const ll=PROJ.invert([x,y]);if(!ll||!isFinite(ll[0]))return;G.guess=ll;G.vb=vb.slice();render()};
 box.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>zoomAt(+b.dataset.z,W/2,H/2))}
document.addEventListener("keydown",e=>{if(!G.on||G.state==="end")return;const v=document.getElementById("gamesView");if(!v||!v.querySelector(".gg-panel"))return;if(e.key==="Enter"){if(!G.done&&G.guess){e.preventDefault();confirm()}else if(G.done){const nx=document.getElementById("ggNext");if(nx){e.preventDefault();nx.click()}}}});
/* add the choice to Where is this?'s setup screen, and take over its view while a pin game is running */
{const _wr=wiRender;wiRender=function(){if(G.on&&wi.state!=="setup"){return render()}const r=_wr.apply(this,arguments);try{if(wi.state==="setup"){const v=document.getElementById("gamesView"),act=v&&v.querySelector(".tut-actions");if(act&&!v.querySelector("#ggStyle")){act.insertAdjacentHTML("beforebegin",'<div class="level-picker" id="ggStyle"><span class="gg-lab">Answer by</span><button class="chip'+(G.pref!=="pin"?" active":"")+'" data-s="type">Typing the country</button><button class="chip'+(G.pref==="pin"?" active":"")+'" data-s="pin">Pinning it on the map 📍</button></div>'+(G.pref==="pin"?'<div class="level-note">Click where you think the photo was taken. Up to 5,000 points a photo; the closer, the more.'+((stats.ggDaily||{})[dailySeed()]!=null&&wi.mode==="daily"?' Today: <b>'+stats.ggDaily[dailySeed()].toLocaleString()+'</b>':'')+'</div>':''));
 v.querySelectorAll("#ggStyle [data-s]").forEach(b=>b.onclick=()=>{G.pref=b.dataset.s;try{stats.ggPref=G.pref;saveStats()}catch(e){}wiRender()});
 const go=document.getElementById("wiGo");if(go&&G.pref==="pin")go.onclick=()=>{G.on=true;G.state="play";G.mode=wi.mode==="daily"?"daily":"practice";wi.state="play";deal()}}}}catch(e){console.error(e)}return r}}
/* the games bar renders Where is this? through its own saved reference, so redraw once through the hooked one */
if(typeof renderGamesView==="function"){const _rg=renderGamesView;renderGamesView=function(){const r=_rg.apply(this,arguments);try{if(activeGame==="whereis"&&(G.on&&wi.state!=="setup"||wi.state==="setup"&&!document.getElementById("ggStyle")))wiRender()}catch(e){console.error(e)}return r}}
try{G.pref=stats.ggPref||"type"}catch(e){}
const css=document.createElement("style");css.textContent=`
.game-panel.gg-panel{ width:auto; max-width:min(1100px,calc(100vw - 32px)); margin-left:auto; margin-right:auto; box-sizing:border-box; overflow:hidden; } .gg-body > *{ min-width:0; } .gg-top{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px; font-size:14px; }
.gg-body{ display:grid; grid-template-columns:minmax(0,2fr) minmax(0,3fr); gap:12px; align-items:stretch; }
.gg-photo{ margin:0; border-radius:16px; overflow:hidden; background:#000; display:flex; flex-direction:column; } .gg-photo img{ width:100%; flex:1; min-height:220px; max-height:440px; object-fit:cover; } .gg-photo figcaption{ background:rgba(0,0,0,.75); color:#fff; font-size:13px; padding:6px 10px; }
.gg-map{ position:relative; border-radius:16px; overflow:hidden; background:#9cc7e6; aspect-ratio:2/1; touch-action:none; } .gg-map svg{ width:100%; height:100%; display:block; cursor:crosshair; }
.gg-pin path{ stroke:#fff; stroke-width:1.6; } .gg-pin.me path{ fill:#e8701a; } .gg-pin.real path{ fill:#2f9e44; } .gg-line{ stroke:#1d3047; stroke-dasharray:6 4; }
.gg-act{ display:flex; align-items:center; justify-content:center; gap:12px; margin-top:12px; flex-wrap:wrap; } .gg-act small{ opacity:.7; } .gg-act .dr-fb{ margin:0; }
.gg-lab{ font:800 11px inherit; letter-spacing:.08em; text-transform:uppercase; opacity:.6; margin-right:6px; }
@media (max-width:760px){ .gg-body{ grid-template-columns:1fr; } .gg-photo img{ max-height:260px; } }`;
document.head.appendChild(css);
window.gfGeoGuess={pool,G};
})();
