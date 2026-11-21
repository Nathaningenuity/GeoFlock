/* GeoFlock: studying and quizzing (internally "practice"). Four top-bar pills, each in its subject's colour: Places, Flags,
   Capitals and Other. Places, Flags and Capitals open straight on the tab used last for that subject (Quiz the first time).
   "Other" holds Landforms (first, and the default) and the country-fact drills (currency, language, demonym, cities, landmarks,
   animals, phone codes, states…), switched with a row of green chips at the top of the page; it remembers the one picked last.
   The drills run inside the Trivia page's view (that is where they live), flagged by window._prOther.
   Keys 1–4 switch between Places, Flags, Capitals and Other while on a Study page. */
(function(){
if(typeof switchAppMode!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IC=p=>'<svg class="mode-icon gf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
/* the four pills; Other wears the Landforms green */
const PILLS=[
 {k:"map",id:"appModePlacesBtn",n:"Places",c:"#7cd2f0",d:"#1f7fa6",alt:2,t:"Places — where every country is, and its shape: study, flashcards and quizzes",
  ic:'<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'},
 {k:"flag",id:"appModeFlagsBtn",n:"Flags",c:"#f2a7bd",d:"#b8476f",alt:3,t:"Flags — every national flag: study, flashcards and quizzes",
  ic:'<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.3 2A6 6 0 0 0 20 3v11a6 6 0 0 1-4.7 1c-2.3 0-4.3-2-7.3-2a6 6 0 0 0-4 1.5"/>'},
 {k:"capital",id:"appModeCapitalsBtn",n:"Capitals",c:"#a99ae6",d:"#5b48b0",alt:4,t:"Capitals — every capital city, both ways round: study, flashcards and quizzes",
  ic:'<circle cx="12" cy="12" r="10"/><path d="m12 6.5 1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 14.7l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"/>'},
 {k:"other",id:"appModeOtherBtn",n:"Other",c:"#6fcb6a",d:"#2f7d2b",alt:7,t:"Other — landforms, plus currencies, languages, demonyms, cities, landmarks, animals and states (Alt+7)",
  ic:'<path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.1 15.4c1.8-.9 3.5-.9 5.3 0s3.5.9 5.3 0 3.4-.9 5.2 0"/>'}];
const OTHER=PILLS[3];
const TABBED=["map","flag","capital"];
const PS=()=>{stats.practice=stats.practice||{last:"map",seen:false,dl:"cur",tab:"study",reg:"all"};const P=stats.practice;if(!P.tabs||typeof P.tabs!=="object")P.tabs={};if(P.oth!=="drill")P.oth="landforms";return P};
const save=()=>{try{saveStats()}catch(e){}};
const isOther=()=>!!window._prOther&&appMode==="trivia";
const inModels=()=>!!window._gfModels;
const inPractice=()=>isOther()||["map","flag","capital","landforms"].includes(appMode);
const curSubj=()=>isOther()||appMode==="landforms"?"other":appMode;

const css=document.createElement("style");css.textContent=`
#appModeMapBtn,#appModeFlagBtn,#appModeCapitalBtn,#appModeLandformsBtn{ display:none !important; }
${PILLS.map(p=>`#${p.id},body.sky-theme #${p.id}{ --c:${p.c}; --mc:${p.d}; }`).join("\n")}
body.sky-theme #appModeAllMapsBtn{ --c:#8fd1c4; } #appModeApBtn{ --mc:#24609a !important; } body.sky-theme #appModeApBtn{ --c:#7ab4e2 !important; }
body.sky-theme #appModeTriviaBtn{ --c:#e9b07a; } body.sky-theme #appModeGamesBtn{ --c:#e3cc63; }
/* nine pills: a little tighter so they sit on one line at 1280 px and up */
@media (min-width:761px){
 .topbar nav.tabs.app-mode-tabs{ gap:3px !important; }
 body.sky-theme .topbar .app-mode-tabs .tab-btn, .topbar .app-mode-tabs .tab-btn{ padding-left:9px !important; padding-right:9px !important; gap:5px !important; }
 .topbar .app-mode-tabs .tab-btn .gf-ico{ width:14px; height:14px; }
}
@media (min-width:761px) and (max-width:1366px){
 .topbar nav.tabs.app-mode-tabs{ gap:2px !important; }
 body.sky-theme .topbar .app-mode-tabs .tab-btn, .topbar .app-mode-tabs .tab-btn{ padding-left:6px !important; padding-right:6px !important; gap:4px !important; }
 .topbar .app-mode-tabs .tab-btn .gf-ico{ width:13px; height:13px; }
}
@media (min-width:761px) and (max-width:1320px){
 .topbar nav.tabs.app-mode-tabs{ gap:1px !important; }
 body.sky-theme .topbar .app-mode-tabs .tab-btn, .topbar .app-mode-tabs .tab-btn{ padding-left:5px !important; padding-right:5px !important; gap:3px !important; font-size:11.5px !important; }
 .topbar .app-mode-tabs .tab-btn .gf-ico{ width:12px; height:12px; }
}
/* still too tight (a long XP count, a narrow window): drop the pill icons before anything has to scroll */
@media (min-width:761px){ .topbar nav.app-mode-tabs.pr-tight .tab-btn .gf-ico{ display:none !important; } }
body.pr-other #triviaModeTabs{ display:none !important; }
/* Other wears its green on the page too (the drills run in the Trivia view, which is orange) */
body.pr-other[data-mode="trivia"]{ --mc:${OTHER.d}; }
/* the region row's dropdowns (pick sub-regions) open over the quiz below, never under it */
#regionRow,#subRegionRow{ position:relative; z-index:90; }
.sub-pop-wrap.open{ z-index:91; }
/* Other: Landforms and the country-fact drills, one row of green chips at the top of the page */
.pr-subj{ --c:${OTHER.c}; --d:${OTHER.d}; display:flex !important; flex-wrap:wrap; justify-content:center; gap:6px; margin:8px auto 10px; padding:0 8px; max-width:1100px; }
.pr-subj button{ font:inherit; font-weight:700; font-size:13.5px; display:inline-flex; align-items:center; gap:6px; padding:6px 14px 7px; border-radius:999px; border:2px solid var(--c);
 background:rgba(255,255,255,.6); color:var(--d); cursor:pointer; transition:background .15s; }
.pr-subj button:hover{ background:color-mix(in srgb,var(--c) 30%,#fff); }
.pr-subj button.on{ background:var(--c); color:#14361a; }

.pr-subj .pr-sep{ width:2px; align-self:stretch; margin:4px 4px; border-radius:2px; background:color-mix(in srgb,var(--c) 55%,transparent); }
body.dark .pr-subj button, body.sky-night .pr-subj button{ background:rgba(20,26,38,.55); color:var(--c); }
body.dark .pr-subj button:hover, body.sky-night .pr-subj button:hover{ background:color-mix(in srgb,var(--c) 22%,rgba(20,26,38,.7)); }
body.dark .pr-subj button.on, body.sky-night .pr-subj button.on{ background:var(--c); color:#10240f; }
@media (max-width:760px){ .pr-subj{ flex-wrap:nowrap; justify-content:flex-start; overflow-x:auto; scrollbar-width:none; padding:0 12px 2px; } .pr-subj::-webkit-scrollbar{ display:none; }
 .pr-subj button{ flex:none; font-size:12.5px; padding:5px 11px 6px; } .pr-subj .pr-sep{ flex:none; } }
body[data-mode="landforms"] #mainContent > #prSubj:not(.pr-off){ display:flex !important; }
.pr-subj.pr-off{ display:none !important; }
/* Other's drills */
.pro{ max-width:980px; margin:0 auto; padding:0 12px 40px; }
.pro-tabs{ display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:0 0 12px; }
.pro-tools{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; margin:0 0 14px; }
.pro-tools input{ font:inherit; padding:7px 12px; border-radius:999px; border:1px solid rgba(0,0,0,.15); min-width:min(300px,100%); }
.pro-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:8px; }
.pro-card{ display:flex; gap:10px; align-items:center; background:rgba(255,255,255,.75); border-radius:12px; padding:9px 11px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
body.sky-night .pro-card{ background:rgba(30,38,54,.8); }
.pro-card img{ width:38px; height:26px; object-fit:cover; border-radius:3px; box-shadow:0 0 0 1px rgba(0,0,0,.12); flex:none; }
.pro-card b{ display:block; font-size:13.5px; } .pro-card span{ display:block; font-size:13px; opacity:.85; }
.pro-go{ text-align:center; margin:22px 0; } .pro-go p{ opacity:.75; margin:0 0 12px; }
.pro-mcard{ display:flex !important; flex-direction:column; align-items:stretch !important; padding:8px !important; gap:8px; }
.pro-mcard .pro-cap{ display:flex; align-items:center; gap:10px; padding:0 4px 2px; }
/* every flag in the same 3:2 box with a 1px hairline, so light flags (Cyprus, Japan) keep their edge */
.pro-mcard .pro-cap img{ width:30px !important; height:20px !important; object-fit:contain; border-radius:2px; flex:none; box-shadow:none !important; border:1px solid rgb(0 0 0 / .18); box-sizing:content-box; background:transparent; }
body.sky-night .pro-mcard .pro-cap img{ border-color:rgb(255 255 255 / .28); }
.pro-or{ margin:12px 0 8px !important; font-size:12px; } .pro-alt{ background:#fff !important; color:#2b3566 !important; border:2px solid #e3b77c !important; } .pro-alt small{ display:block; font-weight:500; font-size:11.5px; opacity:.7; }
body.sky-night .pro-alt{ background:#253049 !important; color:#e8ecf6 !important; }
.pro-count{ text-align:center; font-size:12.5px; opacity:.65; margin:0 0 10px; }
`;document.head.appendChild(css);

/* ---------- the four top-bar pills ---------- */
function addPills(){if(document.getElementById(PILLS[0].id))return true;const after=document.getElementById("appModeApBtn")||document.getElementById("appModeAllMapsBtn");if(!after)return false;
 after.insertAdjacentHTML("afterend",PILLS.map(p=>'<button class="tab-btn" id="'+p.id+'" type="button" data-pr-pill="'+p.k+'" title="'+esc(p.t)+'">'+IC(p.ic)+'<span class="tb-l">'+p.n+'</span></button>').join(""));
 PILLS.forEach(p=>{document.getElementById(p.id).onclick=()=>openPill(p.k)});return true}

/* last-used tab of Places, Flags and Capitals: noted whenever the page is drawn, except while a subject is being switched to
   (switchAppMode always draws Study first) */
let quiet=0;
function note(){if(quiet||window._prOther||!TABBED.includes(appMode)||typeof activeTab!=="string")return;const P=PS();if(P.tabs[appMode]!==activeTab){P.tabs[appMode]=activeTab;save()}}
function lastTab(s){const t=PS().tabs[s];return t&&document.querySelector('nav.tabs:not(.app-mode-tabs) .tab-btn[data-tab="'+t+'"]')?t:"quiz"}
function openPill(k){closeChooser();
 if(k==="other"){if(PS().oth==="drill")go("other",true);else go("landforms",true);scrollTo(0,0);return}
 if(appMode===k&&!window._prOther){sync();return}
 quiet++;try{go(k,true)}finally{quiet--}
 const t=lastTab(k);if(activeTab!==t){activeTab=t;try{renderChrome();renderActiveView()}catch(e){console.error(e)}}
 sync();scrollTo(0,0)}
window.gfPracticeOpen=openPill;

/* ---------- moving between subjects ---------- */
function go(s,fromPill){const P=PS();P.last=s;P.seen=true;
 if(s==="other"){P.oth="drill";save();window._prOther=true;if(appMode!=="trivia")switchAppMode("trivia");else{applyAppMode();renderChrome();renderActiveView()}try{triviaState().fcMode="quiz"}catch(e){}renderOther();sync();scrollTo(0,0);return}
 if(s==="landforms")P.oth="landforms";save();
 window._prOther=false;if(appMode!==s)switchAppMode(s);else{try{applyAppMode();renderChrome();renderActiveView()}catch(e){}}sync()}
window.gfPracticeGo=go;

/* ---------- Other's chips: Landforms first, then each country-fact drill ---------- */
function tabsEl(){let el=document.getElementById("prSubj");if(!el){el=document.createElement("div");el.id="prSubj";el.className="pr-subj";el.setAttribute("role","tablist");el.setAttribute("aria-label","Other: choose a topic");
  const w=document.querySelector(".wrap");if(!w)return null;w.insertBefore(el,w.firstChild)}return el}
function sync(){const oth=appMode==="landforms"||(isOther()&&!inModels());document.body.classList.toggle("pr-other",isOther());
 PILLS.forEach(p=>{const b=document.getElementById(p.id);if(b)b.classList.toggle("active",p.k==="other"?oth:(appMode===p.k&&!window._prOther))});
 const tv=document.getElementById("appModeTriviaBtn");if(tv)tv.classList.toggle("active",appMode==="trivia"&&!window._prOther);
 const el=tabsEl();if(!el)return;el.classList.toggle("pr-off",!oth);if(!oth)return;
 const cur=appMode==="landforms"?"landforms":PS().dl,L=[{id:"landforms",name:"Landforms",icon:"⛰️"}].concat(drills());
 const html=L.map((x,i)=>'<button type="button" role="tab" aria-selected="'+(x.id===cur)+'" class="'+(x.id===cur?"on":"")+(i?"":" pr-lf")+'" data-pro="'+x.id+'"><span aria-hidden="true">'+x.icon+'</span>'+esc(x.name)+'</button>').join("");
 if(el._h!==html){el.innerHTML=html;el._h=html;el.querySelectorAll("[data-pro]").forEach(b=>b.onclick=()=>{const id=b.dataset.pro;
   if(id==="landforms"){if(appMode!=="landforms")go("landforms");return}
   const P=PS();P.dl=id;P.oth="drill";save();if(isOther()){try{triviaState().fcMode="quiz"}catch(e){}renderOther();scrollTo(0,0)}else go("other")})}
 if(isOther()&&!inModels()){const t=document.getElementById("headerTitle"),st=document.getElementById("headerSubtitle");if(t)t.textContent="Other";if(st)st.textContent="one fact, every country: currencies, languages, demonyms and more"}}
window.gfPracticeSync=sync;

/* the old first-time chooser is gone; kept as a no-op for anything that still calls it */
function closeChooser(){if(window._prChoosing){window._prChoosing=false;document.body.classList.remove("pr-choosing")}}

/* ---------- Other: the country-fact drills ---------- */
const REG=["all","Europe","Asia","Africa","Americas","Oceania"];
const OTABS=[["study","Study"],["flashcards","Flashcards"],["quiz","Quiz"],["speed","Speed Round"]];
function drills(){const D=window.gfDrills;const L=D?D.list().slice():[];L.push({id:"call",name:"Phone code",icon:"📞"});
 if(window.gfProvinces)L.push({id:"pv",name:"States & provinces",icon:"🗺️",noFlash:true});return L}
function factText(id,v){if(!v)return null;switch(id){case"cur":return typeof gfCurLabel==="function"?gfCurLabel(v):v.cur;case"lang":return(v.lang||[]).join(", ");case"dem":return v.dem;case"city":return v.city;case"lm":return v.lm;case"an":return v.an;case"call":return v.call?"+"+v.call:null}return null}
function renderOther(){const v=document.getElementById("triviaView");if(!v||!isOther())return;sync();const P=PS(),L=drills();if(!L.find(x=>x.id===P.dl))P.dl=L[0]?L[0].id:"cur";
 const D=L.find(x=>x.id===P.dl)||{};let tab=P.tab;if(D.noStudy&&tab==="study")tab="quiz";if(D.noFlash&&(tab==="flashcards"||tab==="speed"))tab=D.noStudy?"quiz":"study";
 const tabs='<nav class="tabs pro-tabs">'+OTABS.map(([k,l])=>{const off=(k==="study"&&D.noStudy)||((k==="flashcards"||k==="speed")&&D.noFlash);return'<button type="button" class="tab-btn'+(tab===k?" active":"")+'" data-prt="'+k+'"'+(off?' disabled title="Not for this one"':'')+'>'+l+'</button>'}).join("")+'</nav>';
 let body="";
 if(tab==="study"&&D.id==="pv"){body='<div class="pro-go"><p>Pick a country and learn its states or provinces on the map.</p><button type="button" class="tv-go" id="proStart">Open the map →</button></div>'}
 else if(tab==="study"){const q=(P.q||"").toLowerCase(),rows=COUNTRIES.filter(c=>(!REG.includes(P.reg)||P.reg==="all"||c.r===P.reg)).map(c=>({c,t:factText(D.id,(typeof DRILL_FACTS!=="undefined"?DRILL_FACTS:{})[c.c])})).filter(o=>o.t&&(!q||o.c.n.toLowerCase().includes(q)||String(o.t).toLowerCase().includes(q))).sort((a,b)=>a.c.n.localeCompare(b.c.n));
  const fl=c=>{try{return flagUrl(c,"w80")}catch(e){return"https://flagcdn.com/w80/"+c+".png"}};
  body='<div class="pro-tools">'+REG.map(r=>'<button type="button" class="chip'+(P.reg===r?" active":"")+'" data-prr="'+r+'">'+(r==="all"?"All":r)+'</button>').join("")+'<input type="search" id="proQ" placeholder="Search a country or a '+esc(D.name.toLowerCase())+'…" value="'+esc(P.q||"")+'"></div>'+
   '<div class="pro-count">'+rows.length+' countries</div><div class="pro-grid">'+rows.map(o=>{const M=window.gfDrillMedia&&D.id!=="call"?gfDrillMedia.html(D.id,o.c.c,"",{zoom:true}):"";
   return M?'<div class="pro-card pro-mcard">'+M+'<div class="pro-cap"><img src="'+fl(o.c.c)+'" alt="" loading="lazy"><div><b>'+esc(o.c.n)+'</b><span>'+esc(o.t)+'</span></div></div></div>':'<div class="pro-card"><img src="'+fl(o.c.c)+'" alt="" loading="lazy"><div><b>'+esc(o.c.n)+'</b><span>'+esc(o.t)+'</span></div></div>'}).join("")+'</div>'}
 else{const what={flashcards:"Flashcards are for practice: no stamps and no scores.",quiz:"Ten questions. Choose the answer, or type it.",speed:"Sixty seconds, four choices a question. A wrong answer only costs you time."}[tab];
  body='<div class="pro-go"><p>'+what+'</p><button type="button" class="tv-go" id="proStart">▶ Start '+esc(D.name)+'</button>'+
   /* Language also has the "which language is this?" quiz: a line of text to recognise */
   (D.id==="lang"&&tab==="quiz"&&window.gfLangId?'<p class="pro-or">or</p><button type="button" class="tv-go pro-alt" id="proLangId">✍️ Which language is this? <small>read a line, name the language</small></button>':'')+'</div>'}
 v.innerHTML='<div class="pro">'+tabs+body+'</div>';
 v.querySelectorAll("[data-prt]").forEach(b=>b.onclick=()=>{P.tab=b.dataset.prt;saveStats();renderOther()});
 v.querySelectorAll("[data-prr]").forEach(b=>b.onclick=()=>{P.reg=b.dataset.prr;saveStats();renderOther()});
 const qi=v.querySelector("#proQ");if(qi)qi.oninput=()=>{P.q=qi.value;clearTimeout(qi._t);qi._t=setTimeout(()=>{const pos=qi.selectionStart;renderOther();const n=document.getElementById("proQ");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}},180)};
 const s=v.querySelector("#proStart");if(s)s.onclick=()=>startDrill(D.id,tab);
 /* no extra "Start" page: picking a topic or a tab goes straight in. Coming back out of a drill (its Back button) lands
    here without starting again; Language's quiz keeps its page because it offers two different quizzes */
 if(s&&!window._proBack&&!(D.id==="lang"&&tab==="quiz")){setTimeout(()=>{if(document.getElementById("proStart")===s)startDrill(D.id,tab)},0)}
 window._proBack=false;const li=v.querySelector("#proLangId");if(li)li.onclick=()=>startDrill("langid",tab)}
addEventListener("click",e=>{if(e.target.closest&&e.target.closest("[data-pro],[data-prt],#appModeOtherBtn"))window._proBack=false},true);
function startDrill(id,tab){window._proBack=true;const t=triviaState();try{_speedEndAt=0}catch(e){}
 if(id==="langid"){const v=document.getElementById("triviaView");v.innerHTML='<div class="li-wrap" id="prLang"></div>';gfLangId.round(v.querySelector("#prLang"),{n:10,title:"Which language?",back:()=>renderOther(),backLabel:"Other",level:"all"});scrollTo(0,0);return}
 if(id==="pv"){const S=gfDrills.st();S.pv=true;t.fcMode="drills";saveStats();renderTriviaView();scrollTo(0,0);return}
 try{gfDrills.st().region=REG.includes(PS().reg)?PS().reg:"all"}catch(e){}
 gfDrills.start(id,tab==="speed"?"speed":tab==="flashcards"?"flash":"normal");scrollTo(0,0)}
/* drills and their back buttons come home to Other, not to Trivia */
{const _rt=renderTriviaView;renderTriviaView=function(){if(isOther()&&triviaState().fcMode!=="drills"){renderOther();return}return _rt.apply(this,arguments)}}
new MutationObserver(()=>{if(!isOther())return;document.querySelectorAll("#triviaView button").forEach(b=>{const t=b.textContent;if(/←\s*Trivia/.test(t))b.textContent=t.replace(/Trivia/,"Other")})}).observe(document.getElementById("triviaView")||document.body,{childList:true,subtree:true});

/* ---------- keep everything in step ---------- */
{const _sm=switchAppMode;switchAppMode=function(m){closeChooser();if(m!=="trivia")window._prOther=false;if(["map","flag","capital","landforms"].includes(m)){const P=PS();P.last=m;P.seen=true;if(m==="landforms")P.oth="landforms"}
  quiet++;let r;try{r=_sm.apply(this,arguments)}finally{quiet--}sync();return r}}
{const _rc=renderChrome;renderChrome=function(){const r=_rc.apply(this,arguments);try{note()}catch(e){}return r}}
{const tb=document.getElementById("appModeTriviaBtn");if(tb)tb.onclick=()=>{closeChooser();if(isOther()){window._prOther=false;try{triviaState().fcMode="quiz"}catch(e){}applyAppMode();renderChrome();renderActiveView();sync();scrollTo(0,0)}else switchAppMode("trivia")}}
{const _am=applyAppMode;applyAppMode=function(){const r=_am.apply(this,arguments);sync();return r}}
{const _ra=renderActiveView;renderActiveView=function(){const r=_ra.apply(this,arguments);try{if(isOther()&&triviaState().fcMode!=="drills")renderOther();sync()}catch(e){}return r}}
/* Trivia keeps its quizzes; the country-fact drills now live under Other in the top bar */
{const _rt=renderTriviaView;renderTriviaView=function(){const r=_rt.apply(this,arguments);try{if(!isOther()){const f=document.querySelector("#triviaView .tvh-facts");if(f){const h=f.previousElementSibling;if(h&&h.classList.contains("tvh-h"))h.remove();
  f.outerHTML='<p class="pr-moved tvh-note">Country facts (currency, language, demonym and more) are now under <a href="#" id="prMoved">Other</a> in the top bar.</p>';const a=document.getElementById("prMoved");if(a)a.onclick=e=>{e.preventDefault();go("other",true)}}}}catch(e){}return r}}

/* keys 1–4 switch between Places, Flags, Capitals and Other while on a Study page (quizzes use the number keys for answers) */
document.addEventListener("keydown",e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||!/^[1-4]$/.test(e.key)||!inPractice()||inModels())return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
 const studying=isOther()?(PS().tab==="study"&&triviaState().fcMode!=="drills"):appMode==="landforms"?!!document.querySelector('#landformsView [data-lfm="study"].active'):activeTab==="study";if(!studying)return;
 const s=PILLS[+e.key-1];if(s&&s.k!==curSubj()){e.preventDefault();openPill(s.k)}});
/* Alt+7 opens Other (Alt+2, 3 and 4 are Places, Flags and Capitals, in the main shortcut list) */
document.addEventListener("keydown",e=>{if(e.defaultPrevented||!e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.code!=="Digit7")return;const b=document.getElementById(OTHER.id);if(b){e.preventDefault();b.click()}});
/* the shortcut list: the number keys on a Study page */
try{if(typeof SHORTCUT_SHEET!=="undefined"&&!SHORTCUT_SHEET.some(g=>g[0]==="Studying"))SHORTCUT_SHEET.splice(1,0,["Studying",[["1 … 4","on a Study page: Places, Flags, Capitals, Other"]]])}catch(e){}

/* nine pills in one line: if they do not fit beside the progress bar, the icons go (see .pr-tight) */
function fit(){const n=document.querySelector(".topbar nav.app-mode-tabs");if(!n)return;n.classList.remove("pr-tight");if(innerWidth>760&&n.scrollWidth>n.clientWidth+1)n.classList.add("pr-tight")}
{let q=0;const later=()=>{cancelAnimationFrame(q);q=requestAnimationFrame(fit)};addEventListener("resize",later);
 const watch=()=>{const g=document.getElementById("gmBar"),n=document.querySelector(".topbar nav.app-mode-tabs");if(!g||!n||typeof ResizeObserver!=="function")return false;new ResizeObserver(later).observe(g);new ResizeObserver(later).observe(n);later();return true};
 if(!watch())addEventListener("load",watch);setTimeout(later,1500)}
if(!addPills()){const t=setInterval(()=>{if(addPills()){clearInterval(t);sync()}},200)}sync();
})();
/* Places and Capitals maps: one "Labels ▾" switch (country + ocean labels in its menu), small carets like All Maps,
   and the search bar on the same row */
(function(){
const st=document.createElement("style");st.textContent=`
#studyView .study-toolbar-actions{ flex-wrap:wrap; align-items:center; column-gap:10px; }
#studyView .study-toolbar-actions .switch{ gap:6px; }
#studyView .lf-caret,#studyView .gf-fcaret{ font-size:10px !important; padding:0 1px !important; margin-left:2px !important; width:auto !important; min-width:0 !important; }
#studyView .lf-control,#studyView .gf-fold{ gap:0 !important; }
#studyView .global-search-wrap.in-toolbar{ margin-left:auto; }
#studyView .global-search-wrap.in-toolbar{ flex:0 1 150px; min-width:120px; }
#studyView .global-search-wrap.in-toolbar .global-search-input{ width:100%; min-width:0; }`;document.head.appendChild(st);
const labOf=sw=>{const l=sw.querySelector(".switch-label");return l?l.textContent.trim():""};
function fold(){const row=document.querySelector("#studyView .study-toolbar-actions");if(!row)return;
 const sws=["Country labels","Ocean labels"].map(m=>[...row.querySelectorAll("label.switch")].find(sw=>labOf(sw)===m)).filter(Boolean);if(sws.length<2)return;
 let g=row.querySelector('.gf-fold[data-g="Labels"]');
 if(!g){g=document.createElement("span");g.className="gf-fold";g.dataset.g="Labels";g.innerHTML='<label class="switch gf-fsw"><input type="checkbox"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Labels</span></label><button type="button" class="gf-fcaret" aria-haspopup="true" aria-expanded="false" title="Choose which labels to show">▾</button><div class="gf-fold-pop" hidden></div>';
  sws[0].parentNode.insertBefore(g,sws[0]);const pop=g.querySelector(".gf-fold-pop"),car=g.querySelector(".gf-fcaret"),main=g.querySelector("input");
  car.onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden;car.setAttribute("aria-expanded",String(!pop.hidden))};
  document.addEventListener("click",e=>{if(!g.contains(e.target))pop.hidden=true});
  main.onchange=()=>{const want=main.checked;g._sws.forEach(sw=>{const i=sw.querySelector("input");if(i&&i.checked!==want){i.checked=want;i.dispatchEvent(new Event("change",{bubbles:true}))}})}}
 const pop=g.querySelector(".gf-fold-pop");sws.forEach(sw=>{if(sw.parentNode!==pop)pop.appendChild(sw)});g._sws=sws;
 const main=g.querySelector("input"),any=sws.some(sw=>{const i=sw.querySelector("input");return i&&i.checked});if(main.checked!==any)main.checked=any}
new MutationObserver(()=>{try{fold()}catch(e){}}).observe(document.getElementById("studyView")||document.body,{childList:true,subtree:true});
setInterval(()=>{try{fold()}catch(e){}},600);
})();
