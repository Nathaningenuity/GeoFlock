/* GeoFlock: the Library. Two shelves in one window, opened from the book button in the top bar or the Toolkit:
   - Dictionary: geography terms of every kind (physical, climate, biogeography, water, population, culture, language,
     political, economic, agriculture, urban, maps and methods, environment, historical geography), defined in our own
     words, with an example and, where there is one, a "Show on the map" that opens the right map at the right place.
     Data: geoflock-dict-data.js (GF_DICT, GF_DICT_CATS).
   - Stops: single stops from the guided tours, like songs from a playlist: search, filter by shelf or map, play one.
     A stop opens on its own map; when another map is showing, a small box offers to switch first. Stops flagged for
     review (GF_TOUR_FLAGS) and the tours' "Now explore" endings are left out. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const MAPN={relief:"Relief",satellite:"Satellite",elevation:"Elevation",population:"Population",gdp:"Economy",climate:"Climate",politics:"Politics",culture:"Culture",people:"People",nature:"Nature",history:"History",night:"City Lights"};
let box=null,tab="dict",q="",cat="all",shelf="all",mapF="all",openT=null;

/* ---------- map helpers ---------- */
/* open the Maps page and the wanted map, waiting until each is really there */
function whenReady(test,cb,max){let n=0;const t=setInterval(()=>{n++;let ok=false;try{ok=test()}catch(e){}if(ok||n>(max||200)){clearInterval(t);if(ok)cb()}},150)}
const mapReady=()=>typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent&&!!document.querySelector("[data-allmaps-mode]");
function goMap(mode,cb){try{if(appMode!=="allmaps")switchAppMode("allmaps")}catch(e){}
 whenReady(mapReady,()=>{try{const chip=document.querySelector('[data-allmaps-mode="'+mode+'"]');if(chip&&allMapsColorMode!==mode)chip.click()}catch(e){}
  whenReady(()=>allMapsColorMode===mode,()=>{if(cb)setTimeout(cb,500)},200)})}
function flyLL(ll,z){try{const G=amGlobe;if(!G)return;z=z||4;
 if(!G._flat){const from=[-G.rot[0],-G.rot[1]],z0=G.zoom,st=performance.now(),D=900,ip=d3.geoInterpolate(from,ll),zTo=Math.max(1,Math.min(9,z));
  const step=n=>{const k=Math.min(1,(n-st)/D),s=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,c=ip(s);G.rot=[-c[0],-c[1]];G.zoom=Math.exp(Math.log(z0)+(Math.log(zTo)-Math.log(z0))*s);G.render();if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);return}
 const w=document.getElementById("allMapsWrap");if(!w||!w._panZoom||typeof GLOBE_ROBINSON==="undefined")return;const p=GLOBE_ROBINSON(ll);if(!p)return;const W=2000/Math.pow(1.9,Math.max(0,z-1));
 const bx={x:p[0]-W/2,y:p[1]-W/4,w:W,h:W/2};try{typeof pzFly==="function"?pzFly(w,bx):w._panZoom.setBox(bx)}catch(e){w._panZoom.setBox(bx)}}catch(e){console.error(e)}}
/* a marker at the place for a few seconds */
function ping(ll,label){try{const G=amGlobe;if(!G)return;const h=G.host;let m=h.querySelector(".gflib-ping");if(m)m.remove();m=document.createElement("div");m.className="gflib-ping";m.innerHTML="<i></i><span>"+esc(label)+"</span>";h.appendChild(m);
 const t0=performance.now();const tick=()=>{if(!m.isConnected)return;const q=G.projection()(ll),c=G.canvas.getBoundingClientRect(),hr=h.getBoundingClientRect();if(q){m.style.left=(c.left-hr.left+q[0])+"px";m.style.top=(c.top-hr.top+q[1])+"px"}if(performance.now()-t0<9000)requestAnimationFrame(tick);else m.remove()};tick()}catch(e){}}

/* ---------- dictionary ---------- */
const D=()=>Array.isArray(window.GF_DICT)?GF_DICT:[];
const CATS=()=>window.GF_DICT_CATS||{};
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function dictList(){const Q=norm(q);let L=D().filter(e=>cat==="all"||e.c===cat||(cat==="sim"&&window.gfSimLib&&gfSimLib.has(e.t)));
 if(Q){const sc=e=>{const t=norm(e.t);if(t===Q||(e.a||[]).some(a=>norm(a)===Q))return 0;if(t.startsWith(Q))return 1;if(t.includes(Q)||(e.a||[]).some(a=>norm(a).includes(Q)))return 2;if(norm(e.d).includes(Q))return 3;return 9};L=L.map(e=>[sc(e),e]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]||a[1].t.localeCompare(b[1].t)).map(x=>x[1])}
 else L=L.slice().sort((a,b)=>a.t.localeCompare(b.t));return L}
function entry(e,open){const C=CATS();return'<article class="gflib-e'+(open?" open":"")+'" data-t="'+esc(e.t)+'"><h3><button type="button" class="gflib-et">'+esc(e.t)+'</button><span class="gflib-cat c-'+esc(e.c)+'">'+esc(C[e.c]||e.c)+'</span></h3>'+
 (open?(window.gfDictVis?gfDictVis.visual(e):'')+'<p>'+esc(e.d)+'</p>'+(e.e?'<p class="gflib-ex"><b>Example:</b> '+esc(e.e)+'</p>':'')+
  ((e.s&&e.s.length)?'<p class="gflib-see">See also: '+e.s.map(s=>'<button type="button" class="gflib-link" data-go="'+esc(s)+'">'+esc(s)+'</button>').join(" · ")+'</p>':'')+
  (e.m&&e.m.at?'<button type="button" class="gflib-map" data-map="'+esc(e.t)+'">🗺️ Show on the '+esc(MAPN[e.m.map]||"")+' map</button>':''):'<p class="gflib-short">'+esc(String(e.d).split(/(?<=\.)\s/)[0])+'</p>')+'</article>'}
function dictHTML(){const C=CATS(),L=dictList(),n=D().length;
 if(!n)return'<p class="gflib-empty">The dictionary is loading…</p>';
 const lim=q?120:Math.min(L.length,cat==="all"?160:400);
 let letters="";if(!q&&cat==="all"){const S=new Set(L.map(e=>e.t[0].toUpperCase()));letters='<div class="gflib-az">'+[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(l=>'<button type="button" data-az="'+l+'"'+(S.has(l)?"":" disabled")+'>'+l+'</button>').join("")+'</div>'}
 return'<div class="gflib-chips"><button type="button" data-cat="all" class="'+(cat==="all"?"on":"")+'">All <i>'+n+'</i></button>'+Object.keys(C).map(k=>'<button type="button" data-cat="'+k+'" class="c-'+k+(cat===k?" on":"")+'">'+esc(C[k])+' <i>'+D().filter(e=>e.c===k).length+'</i></button>').join("")+(window.gfSimLib?'<button type="button" data-cat="sim" class="c-sim'+(cat==="sim"?" on":"")+'">▶ With simulation <i>'+gfSimLib.count()+'</i></button>':'')+'</div>'+letters+
  '<div class="gflib-list">'+(L.length?L.slice(0,lim).map(e=>entry(e,openT===e.t||L.length===1)).join(""):'<p class="gflib-empty">No term matches “'+esc(q)+'”.</p>')+(L.length>lim?'<p class="gflib-more">'+(L.length-lim)+' more: type to narrow, or pick a letter or a category.</p>':'')+'</div>'}
function showTerm(t){const e=D().find(x=>x.t===t);if(!e)return;open("dict");tab="dict";q=t;cat="all";openT=t;render();setTimeout(()=>{const a=box&&box.querySelector('.gflib-e[data-t="'+CSS.escape(t)+'"]');if(a)a.scrollIntoView({block:"center"})},30)}
function termOnMap(t){const e=D().find(x=>x.t===t);if(!e||!e.m)return;close();goMap(e.m.map||"relief",()=>{flyLL(e.m.at,e.m.z||4);setTimeout(()=>ping(e.m.at,e.t),950)})}

/* ---------- stops ---------- */
let STOPS=null;
function shelves(){try{return typeof GF_SHELVES!=="undefined"?GF_SHELVES:null}catch(e){return null}}
function buildStops(){if(STOPS)return STOPS;STOPS=[];let flags={};try{flags=window.GF_TOUR_FLAGS||{}}catch(e){}
 let SH=null;try{SH=window.GF_TOUR_SHELF_OF||null}catch(e){}
 Object.keys(typeof PS_TOURS!=="undefined"?PS_TOURS:{}).forEach(id=>{const T=PS_TOURS[id];if(!T||!T.steps||T.group==="_retired"||/^hg\d/.test(id)&&false)return;
  T.steps.forEach((S,i)=>{const ti=clean(S.title);if(!ti||i===0&&T.steps.length>3||/^now explore/i.test(ti)||S.q||S.quiz)return;if(flags[id+"|"+ti])return;if(!clean(S.stat)&&!clean(S.body))return;
   STOPS.push({id,i,title:ti,stat:clean(S.stat),tour:clean(T.short||T.name),col:T.col||"#4f7fb8",group:T.group||"",map:S.mode||(T.map&&T.map.mode)||"relief",also:T.alsoOn||[],ph:S.ph||S.photo||null})})});
 return STOPS}
function stopList(){const Q=norm(q);return buildStops().filter(s=>(shelf==="all"||s.group===shelf)&&(mapF==="all"||s.map===mapF)&&(!Q||norm(s.title+" "+s.stat+" "+s.tour).includes(Q)))}
const GROUPN={start:"Start here",physical:"Physical Earth",living:"Living planet",culture:"People & culture",ideas:"Ideas & arts",power:"Power & economy",history:"History",cont:"Continents",books:"Mapped books",aphg:"AP Human Geography"};
function stopsHTML(){const A=buildStops(),L=stopList(),groups=[...new Set(A.map(s=>s.group))].filter(g=>GROUPN[g]),maps=[...new Set(A.map(s=>s.map))].filter(m=>MAPN[m]);const lim=150;
 return'<div class="gflib-chips"><button type="button" data-sh="all" class="'+(shelf==="all"?"on":"")+'">All shelves</button>'+groups.map(g=>'<button type="button" data-sh="'+g+'" class="'+(shelf===g?"on":"")+'">'+GROUPN[g]+'</button>').join("")+'</div>'+
  '<div class="gflib-chips sm"><button type="button" data-mf="all" class="'+(mapF==="all"?"on":"")+'">Any map</button>'+maps.map(m=>'<button type="button" data-mf="'+m+'" class="'+(mapF===m?"on":"")+'">'+MAPN[m]+'</button>').join("")+'</div>'+
  '<p class="gflib-count">'+L.length.toLocaleString()+' stops'+(L.length>lim?' · showing the first '+lim+': search or filter to find more':'')+'</p>'+
  '<div class="gflib-stops">'+L.slice(0,lim).map(s=>'<button type="button" class="gflib-s" data-sid="'+s.id+'|'+s.i+'" style="--c:'+esc(s.col)+'"><span class="gflib-play">▶</span><span class="gflib-st"><b>'+esc(s.title)+'</b><small>'+esc(s.stat)+'</small><em>'+esc(s.tour)+' · stop '+(s.i+1)+' · '+esc(MAPN[s.map]||s.map)+' map</em></span></button>').join("")+'</div>'}
function playStop(id,i){const T=PS_TOURS[id];if(!T)return;const S=T.steps[i];const need=S.mode||(T.map&&T.map.mode)||"relief";
 const here=typeof appMode!=="undefined"&&appMode==="allmaps"&&typeof allMapsColorMode!=="undefined"?allMapsColorMode:null;
 const go=()=>{close();try{if(appMode!=="allmaps")switchAppMode("allmaps")}catch(e){}whenReady(mapReady,()=>{try{psLaunchTour(id)}catch(e){console.error(e);return}let n=0;const w=setInterval(()=>{n++;try{if(typeof ps!=="undefined"&&ps&&ps.tour===id){clearInterval(w);/* let the tour finish opening, then jump (again if it reset itself) */if(i>0){setTimeout(()=>{try{psGo(i)}catch(e){}},900);setTimeout(()=>{try{if(ps&&ps.tour===id&&ps.i!==i)psGo(i)}catch(e){}},2200)}}}catch(e){}if(n>200)clearInterval(w)},150)})};
 if(here===need||(T.alsoOn||[]).includes(here)||!S.mode&&here&&(T.alsoOn||[]).includes(here)){go();return}
 confirmBox('This stop is on the <b>'+esc(MAPN[need]||need)+' map</b>'+(here?' (you are on the '+esc(MAPN[here]||here)+' map)':'')+'. Go there and play it?',"Go to the "+(MAPN[need]||need)+" map",go)}
function confirmBox(html,yes,cb){const m=document.createElement("div");m.className="gflib-ask";m.innerHTML='<div class="gflib-askc"><p>'+html+'</p><div><button type="button" class="y">'+esc(yes)+'</button><button type="button" class="n">Not now</button></div></div>';document.body.appendChild(m);
 m.querySelector(".y").onclick=()=>{m.remove();cb()};m.querySelector(".n").onclick=()=>m.remove();m.addEventListener("click",e=>{if(e.target===m)m.remove()})}

/* ---------- the window ---------- */
function open(t){tab=t||tab;if(!box){box=document.createElement("div");box.className="gflib";box.innerHTML='<div class="gflib-c" role="dialog" aria-label="Library"></div>';document.body.appendChild(box);
 box.addEventListener("click",e=>{if(e.target===box)close()});box.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();close()}})}
 box.hidden=false;document.body.classList.add("gflib-open");render();setTimeout(()=>{const i=box.querySelector(".gflib-q");if(i)i.focus()},30)}
function close(){if(box){box.hidden=true;document.body.classList.remove("gflib-open")}}
function render(){if(!box)return;const c=box.querySelector(".gflib-c");const focus=document.activeElement&&document.activeElement.classList.contains("gflib-q"),pos=focus?document.activeElement.selectionStart:null;
 c.innerHTML='<header><div class="gflib-tabs"><button type="button" data-tab="dict" class="'+(tab==="dict"?"on":"")+'">📖 Dictionary</button><button type="button" data-tab="stops" class="'+(tab==="stops"?"on":"")+'">🎧 Stops</button><button type="button" data-tab="pics" class="'+(tab==="pics"?"on":"")+'">🖼️ Pictures</button>'+(window.gfSimLib?'<button type="button" data-tab="sims" class="'+(tab==="sims"?"on":"")+'">▶ Simulations</button>':'')+'</div>'+
  '<input class="gflib-q" type="search" placeholder="'+(tab==="dict"?"Search a term, e.g. gerrymandering, monsoon, isogloss…":tab==="sims"?"Search simulations, e.g. tides, plates, migration…":tab==="pics"?"Search pictures, e.g. fjord, delta, Sahara…":"Search stops, e.g. Nile, monsoon, Silk Road…")+'" value="'+esc(q)+'"><button type="button" class="gflib-x" aria-label="Close">×</button></header>'+
  '<div class="gflib-body">'+(tab==="dict"?dictHTML():tab==="sims"&&window.gfSimLib?gfSimLib.html(q):tab==="pics"?(window.gfDictVis?gfDictVis.picsHTML(q):''):stopsHTML())+'</div>';
 const qi=c.querySelector(".gflib-q");qi.oninput=()=>{q=qi.value;openT=null;render()};if(focus){qi.focus();try{qi.setSelectionRange(pos,pos)}catch(e){}}
 c.querySelector(".gflib-x").onclick=close;
 c.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;q="";render()});
 c.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{cat=b.dataset.cat;openT=null;render()});
 c.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{shelf=b.dataset.sh;render()});
 c.querySelectorAll("[data-mf]").forEach(b=>b.onclick=()=>{mapF=b.dataset.mf;render()});
 c.querySelectorAll("[data-az]").forEach(b=>b.onclick=()=>{const a=[...c.querySelectorAll(".gflib-e")].find(x=>x.dataset.t[0].toUpperCase()===b.dataset.az);if(a)a.scrollIntoView({block:"start",behavior:"smooth"});else{q=b.dataset.az;render()}});
 c.querySelectorAll(".gflib-et").forEach(b=>b.onclick=()=>{const t=b.closest(".gflib-e").dataset.t;openT=openT===t?null:t;const sc=c.querySelector(".gflib-body").scrollTop;render();c.querySelector(".gflib-body").scrollTop=sc});
 c.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showTerm(b.dataset.go));
 c.querySelectorAll("[data-map]").forEach(b=>b.onclick=()=>termOnMap(b.dataset.map));
 c.querySelectorAll("[data-sid]").forEach(b=>b.onclick=()=>{const [id,i]=b.dataset.sid.split("|");playStop(id,+i)});
 try{if(window.gfDictVis)gfDictVis.wire(c,{showTerm,goMap,flyLL,ping,close})}catch(e){console.error(e)}
 try{if(window.gfSimLib)gfSimLib.wire(c,{showTerm})}catch(e){console.error(e)}}

/* ---------- ways in: the top bar and the Toolkit ---------- */
const BOOK='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/></svg>';
function addTop(){if(document.getElementById("gfLibBtn"))return;const a=document.getElementById("acctBtn");if(!a)return;const b=document.createElement("button");b.id="gfLibBtn";b.type="button";b.className="theme-toggle gflib-top";b.title="Library: geography dictionary and single tour stops";b.setAttribute("aria-label","Library");b.innerHTML=BOOK;b.onclick=()=>open("dict");a.parentNode.insertBefore(b,a)}
const ART='<svg viewBox="0 0 100 100" class="gfk-art"><ellipse cx="50" cy="91" rx="36" ry="5" fill="#000" opacity=".18"/><g stroke="#3a2412" stroke-width="2"><rect x="14" y="22" width="20" height="64" rx="3" fill="#b4406b"/><rect x="36" y="16" width="18" height="70" rx="3" fill="#2f6fb0"/><rect x="56" y="26" width="16" height="60" rx="3" fill="#2e8b57"/><rect x="73" y="30" width="14" height="56" rx="3" fill="#d4a017" transform="rotate(8 80 58)"/></g><g stroke="#fff" stroke-width="2" opacity=".75"><line x1="18" y1="32" x2="30" y2="32"/><line x1="40" y1="28" x2="50" y2="28"/><line x1="59" y1="36" x2="69" y2="36"/></g></svg>';
function addSlot(){const felt=document.querySelector("#gfKit .gfk-felt");if(!felt||felt.querySelector(".gfk-library"))return;const b=document.createElement("button");b.type="button";b.className="gfk-slot gfk-library";b.title="Library: geography dictionary and single tour stops";b.setAttribute("aria-label","Library");b.innerHTML=ART+"<span>Library</span>";b.onclick=e=>{e.stopPropagation();open()};felt.appendChild(b)}
setInterval(()=>{addTop();addSlot()},800);addTop();
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&box&&!box.hidden){close()}});

const css=document.createElement("style");css.textContent=`
.gflib{ position:fixed; inset:0; z-index:3000; background:rgba(10,16,32,.45); display:flex; align-items:flex-start; justify-content:center; padding:5vh 12px; }
.gflib[hidden]{ display:none; }
.gflib-c{ width:min(860px,100%); max-height:88vh; display:flex; flex-direction:column; background:#fbfaf6; color:#1d2433; border-radius:18px; box-shadow:0 20px 60px rgba(0,0,0,.35); overflow:hidden; font:14px/1.45 system-ui,sans-serif; }
body.sky-night .gflib-c{ background:#1b2340; color:#e8ecf6; }
.gflib-c header{ display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid rgba(0,0,0,.08); }
body.sky-night .gflib-c header{ border-color:rgba(255,255,255,.1); }
.gflib-tabs{ display:flex; gap:4px; background:rgba(0,0,0,.06); border-radius:999px; padding:3px; flex:none; } body.sky-night .gflib-tabs{ background:rgba(255,255,255,.08); }
.gflib-tabs button{ border:0; background:none; color:inherit; border-radius:999px; padding:6px 12px; font:700 13px system-ui; cursor:pointer; } .gflib-tabs button.on{ background:#2f6fb0; color:#fff; }
.gflib-q{ flex:1; min-width:0; border:1px solid rgba(0,0,0,.15); border-radius:999px; padding:8px 14px; font:14px system-ui; background:#fff; color:#1d2433; }
body.sky-night .gflib-q{ background:#121a33; color:#e8ecf6; border-color:rgba(255,255,255,.15); }
.gflib-x{ border:0; background:none; font-size:24px; line-height:1; cursor:pointer; color:inherit; opacity:.7; }
.gflib-body{ overflow:auto; padding:10px 14px 18px; }
.gflib-chips{ display:flex; flex-wrap:wrap; gap:5px; margin:0 0 8px; } .gflib-chips button{ border:1px solid rgba(0,0,0,.14); background:none; color:inherit; border-radius:999px; padding:4px 10px; font:700 12px system-ui; cursor:pointer; }
.gflib-chips button i{ font-style:normal; opacity:.55; font-weight:600; } .gflib-chips button.on{ background:#1d2433; color:#fff; border-color:#1d2433; } body.sky-night .gflib-chips button{ border-color:rgba(255,255,255,.18); } body.sky-night .gflib-chips button.on{ background:#e8ecf6; color:#1b2340; }
.gflib-chips.sm button{ padding:3px 9px; font-size:11.5px; }
.gflib-az{ display:flex; flex-wrap:wrap; gap:2px; margin:0 0 8px; } .gflib-az button{ border:0; background:none; color:inherit; font:800 12px system-ui; width:24px; height:24px; border-radius:6px; cursor:pointer; } .gflib-az button:hover{ background:rgba(47,111,176,.15); } .gflib-az button:disabled{ opacity:.25; cursor:default; }
.gflib-e{ border-bottom:1px solid rgba(0,0,0,.07); padding:8px 2px; } body.sky-night .gflib-e{ border-color:rgba(255,255,255,.08); }
.gflib-e h3{ margin:0; display:flex; align-items:center; gap:8px; font-size:15px; } .gflib-et{ border:0; background:none; color:inherit; font:800 15px system-ui; padding:0; cursor:pointer; text-align:left; } .gflib-et:hover{ text-decoration:underline; }
.gflib-cat{ font:700 10.5px system-ui; text-transform:uppercase; letter-spacing:.04em; opacity:.6; }
.gflib-e p{ margin:4px 0 0; } .gflib-short{ opacity:.75; font-size:13px; } .gflib-ex{ font-size:13.5px; } .gflib-see{ font-size:13px; opacity:.9; }
.gflib-link{ border:0; background:none; color:#2f6fb0; font:600 13px system-ui; padding:0; cursor:pointer; text-decoration:underline; } body.sky-night .gflib-link{ color:#8fc0ff; }
.gflib-map{ margin-top:6px; border:0; background:#2f6fb0; color:#fff; border-radius:999px; padding:5px 12px; font:700 12.5px system-ui; cursor:pointer; }
.gflib-e.open{ background:rgba(47,111,176,.06); border-radius:10px; padding:10px; }
.gflib-empty,.gflib-more,.gflib-count{ opacity:.65; font-size:13px; }
.gflib-stops{ display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:8px; }
.gflib-s{ display:flex; gap:10px; align-items:flex-start; text-align:left; border:1px solid rgba(0,0,0,.08); border-left:4px solid var(--c); background:rgba(255,255,255,.7); color:inherit; border-radius:12px; padding:9px 10px; cursor:pointer; font:inherit; }
body.sky-night .gflib-s{ background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.1); border-left-color:var(--c); }
.gflib-s:hover{ box-shadow:0 3px 12px rgba(0,0,0,.12); } .gflib-play{ flex:none; width:28px; height:28px; border-radius:50%; background:var(--c); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; }
.gflib-st{ display:flex; flex-direction:column; gap:2px; min-width:0; } .gflib-st b{ font-size:13.5px; } .gflib-st small{ font-size:12px; opacity:.8; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; } .gflib-st em{ font-style:normal; font-size:11px; opacity:.6; }
.gflib-ask{ position:fixed; inset:0; z-index:3100; background:rgba(10,16,32,.4); display:flex; align-items:center; justify-content:center; padding:16px; }
.gflib-askc{ background:#fbfaf6; color:#1d2433; border-radius:16px; padding:18px 20px; max-width:380px; box-shadow:0 14px 40px rgba(0,0,0,.35); font:14.5px/1.45 system-ui; } body.sky-night .gflib-askc{ background:#1b2340; color:#e8ecf6; }
.gflib-askc div{ display:flex; gap:8px; margin-top:12px; } .gflib-askc button{ border:0; border-radius:999px; padding:7px 14px; font:700 13px system-ui; cursor:pointer; } .gflib-askc .y{ background:#2f6fb0; color:#fff; } .gflib-askc .n{ background:rgba(0,0,0,.08); color:inherit; }
.gflib-ping{ position:absolute; z-index:35; pointer-events:none; transform:translate(-50%,-50%); }
.gflib-ping i{ display:block; width:18px; height:18px; border-radius:50%; border:3px solid #e8762a; background:rgba(232,118,42,.3); animation:gflibP 1.2s ease-out infinite; }
.gflib-ping span{ position:absolute; left:50%; bottom:22px; transform:translateX(-50%); white-space:nowrap; background:#1d2433; color:#fff; font:800 12px system-ui; padding:3px 9px; border-radius:999px; }
@keyframes gflibP{ 0%{ box-shadow:0 0 0 0 rgba(232,118,42,.6); } 100%{ box-shadow:0 0 0 16px rgba(232,118,42,0); } }
@media (max-width:640px){ .gflib-c header{ flex-wrap:wrap; } .gflib-q{ order:3; flex-basis:100%; } }`;document.head.appendChild(css);
window.gfLibrary={open,close,showTerm,playStop,stops:buildStops};
})();
