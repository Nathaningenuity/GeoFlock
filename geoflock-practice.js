/* GeoFlock: Study & Quiz (internally "practice"). Places, Flags, Capitals and Landforms share one top-bar pill, with coloured subject tabs attached to the
   top of the page, plus "Other": the country-fact drills (currency, language, demonym…) with Study, Flashcards, Quiz and Speed Round.
   Switching subject keeps the tab (Study / Flashcards / Quiz…) and the region, like turning a dial. The big chooser shows only
   the first time; after that it opens on the subject used last. Keys 1–5 switch subject while studying.
   "Other" runs inside the Trivia page's view (that is where the drills live), flagged by window._prOther. */
(function(){
if(typeof switchAppMode!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SUBJ=[{k:"map",n:"Places",c:"#7cd2f0",d:"#1f7fa6",ic:"📍",b:"Where every country is, and its shape"},{k:"flag",n:"Flags",c:"#f2a7bd",d:"#b8476f",ic:"🏳️",b:"Every national flag"},
 {k:"capital",n:"Capitals",c:"#a99ae6",d:"#5b48b0",ic:"⭐",b:"Every capital city, both ways round"},{k:"landforms",n:"Landforms",c:"#6fcb6a",d:"#2f7d2b",ic:"⛰️",b:"Mountains, deserts, islands, seas and rivers"},
 {k:"other",n:"Other",c:"#e2bd8a",d:"#94632a",ic:"💰",b:"Currencies, languages, demonyms, cities, landmarks, animals, states"}];
const PS=()=>{stats.practice=stats.practice||{last:"map",seen:false,dl:"cur",tab:"study",reg:"all"};return stats.practice};
const isOther=()=>!!window._prOther&&appMode==="trivia";
const inPractice=()=>isOther()||["map","flag","capital","landforms"].includes(appMode);
const curSubj=()=>isOther()?"other":appMode;

/* ---------- the top-bar pill ---------- */
const css=document.createElement("style");css.textContent=`
#appModeMapBtn,#appModeFlagBtn,#appModeCapitalBtn,#appModeLandformsBtn{ display:none !important; }
#appModePracticeBtn{ --mc:#b8476f; } #appModePracticeBtn .tb-s{ display:none; }
@media (max-width:1180px) and (min-width:761px){ #appModePracticeBtn .tb-l{ display:none; } #appModePracticeBtn .tb-s{ display:inline; } }
body.sky-theme #appModePracticeBtn{ --c:#e7a6bd; }
body.sky-theme #appModeAllMapsBtn{ --c:#8fd1c4; } #appModeApBtn{ --mc:#2a6fb0 !important; } body.sky-theme #appModeApBtn{ --c:#8fc3ea !important; }
body.sky-theme #appModeTriviaBtn{ --c:#e9b07a; } body.sky-theme #appModeGamesBtn{ --c:#e3cc63; }
body.pr-other #triviaModeTabs{ display:none !important; }
/* the region row's dropdowns (pick sub-regions) open over the quiz below, never under it */
#regionRow,#subRegionRow{ position:relative; z-index:90; }
.sub-pop-wrap.open{ z-index:91; }
/* subject tabs: attached to the top of the page, not floating pills */
.pr-subj{ display:flex !important; justify-content:center; gap:4px; margin:6px auto 14px; padding:0 8px; border-bottom:2px solid var(--pr-c,#e7a6bd); max-width:980px; }
.pr-subj button{ font:inherit; font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px; padding:9px 18px 8px; border:2px solid var(--c); border-bottom:none;
 border-radius:12px 12px 0 0; background:rgba(255,255,255,.55); color:var(--d); cursor:pointer; margin-bottom:-2px; position:relative; transition:background .15s; }
.pr-subj button:hover{ background:color-mix(in srgb,var(--c) 30%,#fff); }
.pr-subj button.on{ background:var(--c); color:#1d2433; border-bottom:2px solid var(--c); }
.pr-subj button kbd{ font:600 10px/1 inherit; opacity:.5; border:1px solid currentColor; border-radius:4px; padding:1px 3px; }
.pr-subj button.on kbd{ opacity:.45; }
body.dark .pr-subj button{ background:rgba(20,26,38,.5); color:var(--c); } body.dark .pr-subj button.on{ background:var(--c); color:#141a26; }
@media (max-width:760px){ .pr-subj{ gap:2px; padding:0 2px; overflow-x:auto; justify-content:flex-start; scrollbar-width:none; } .pr-subj button{ padding:7px 10px 6px; font-size:12.5px; flex:none; } .pr-subj button kbd,.pr-subj .pr-ic{ display:none; } }
body[data-mode="landforms"] #mainContent > #prSubj:not(.pr-off){ display:flex !important; }
.pr-subj.pr-off{ display:none !important; }
/* the first-time chooser: a page of its own */
#prChoose{ display:none; }
body.pr-choosing #mainContent > :not(#prChoose){ display:none !important; }
body.pr-choosing #mainContent > #prChoose{ display:block !important; }
.pr-choose-box{ max-width:820px; margin:18px auto 40px; padding:8px 16px; }
.pr-choose-box h2{ margin:0 0 6px; font-size:28px; text-align:center; } .pr-choose-box>p{ margin:0 0 22px; opacity:.75; text-align:center; }
.pr-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.pr-grid button{ font:inherit; text-align:left; border:2px solid var(--c); background:color-mix(in srgb,var(--c) 22%,#fff); border-radius:18px; padding:18px; cursor:pointer; color:#1d2433; transition:background .15s,transform .15s; }
.pr-grid button:hover{ background:var(--c); transform:translateY(-2px); }
.pr-grid b{ display:block; font-size:19px; margin:8px 0 3px; } .pr-grid small{ opacity:.8; font-size:13.5px; line-height:1.4; display:block; } .pr-grid .pr-big{ font-size:30px; }
.pr-choose-box .pr-note{ font-size:12.5px; opacity:.65; margin:16px 0 0; text-align:center; }
/* Other */
.pro{ max-width:980px; margin:0 auto; padding:0 12px 40px; }
.pro-tabs{ display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:0 0 12px; }
.pro-drills{ display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin:0 0 12px; }
.pro-drills .chip{ display:inline-flex; gap:6px; align-items:center; }
.pro-tools{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; margin:0 0 14px; }
.pro-tools input{ font:inherit; padding:7px 12px; border-radius:999px; border:1px solid rgba(0,0,0,.15); min-width:220px; }
.pro-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:8px; }
.pro-card{ display:flex; gap:10px; align-items:center; background:rgba(255,255,255,.75); border-radius:12px; padding:9px 11px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
body.sky-night .pro-card{ background:rgba(30,38,54,.8); }
.pro-card img{ width:38px; height:26px; object-fit:cover; border-radius:3px; box-shadow:0 0 0 1px rgba(0,0,0,.12); flex:none; }
.pro-card b{ display:block; font-size:13.5px; } .pro-card span{ display:block; font-size:13px; opacity:.85; }
.pro-go{ text-align:center; margin:22px 0; } .pro-go p{ opacity:.75; margin:0 0 12px; }
.pro-mcard{ display:flex !important; flex-direction:column; align-items:stretch !important; padding:8px !important; gap:8px; }
.pro-mcard .pro-cap{ display:flex; align-items:center; gap:10px; padding:0 4px 2px; } .pro-mcard .pro-cap img{ width:30px !important; height:auto !important; border-radius:3px; flex:none; }
.pro-or{ margin:12px 0 8px !important; font-size:12px; } .pro-alt{ background:#fff !important; color:#2b3566 !important; border:2px solid #e3b77c !important; } .pro-alt small{ display:block; font-weight:500; font-size:11.5px; opacity:.7; }
body.sky-night .pro-alt{ background:#253049 !important; color:#e8ecf6 !important; }
.pro-count{ text-align:center; font-size:12.5px; opacity:.65; margin:0 0 10px; }
`;document.head.appendChild(css);

/* an open book */
const icon='<svg class="mode-icon gf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5z"/><path d="M12 6v13.5"/></svg>';
function addPill(){if(document.getElementById("appModePracticeBtn"))return true;const after=document.getElementById("appModeApBtn")||document.getElementById("appModeAllMapsBtn");if(!after)return false;
 after.insertAdjacentHTML("afterend",'<button class="tab-btn" id="appModePracticeBtn" type="button" title="Study & Quiz — places, flags, capitals, landforms and more: study, flashcards and quizzes">'+icon+'<span class="tb-l">Study &amp; Quiz</span><span class="tb-s">Study</span></button>');
 document.getElementById("appModePracticeBtn").onclick=()=>{const P=PS();if(!P.seen)chooser();else go(P.last||"map",true)};return true}

/* ---------- moving between subjects, keeping the tab and the region ---------- */
const TABN={study:"Study",flashcards:"Flashcards",flash:"Flashcards",quiz:"Quiz",speed:"Speed Round",pgames:"Games"};
function snapshot(){const s=curSubj();
 if(s==="landforms"){const v=document.getElementById("landformsView"),t=v&&v.querySelector("[data-lfm].active"),r=v&&v.querySelector("[data-lfr].active");return{tab:t?t.textContent.trim():"Study",reg:r?r.dataset.lfr:"all"}}
 if(s==="other"){const P=PS();return{tab:TABN[P.tab]||"Study",reg:P.reg}}
 return{tab:TABN[activeTab]||"Study",reg:activeRegion==="All"?"all":activeRegion,sub:activeSub}}
function clickTab(label,sel){const b=[...document.querySelectorAll(sel)].find(x=>x.offsetParent&&x.textContent.trim()===label);if(b&&!b.classList.contains("active"))b.click();return!!b}
function restore(s,snap){if(!snap)return;
 if(s==="landforms"){setTimeout(()=>{try{clickTab(snap.tab,"#landformsView [data-lfm]");const r=document.querySelector('#landformsView [data-lfr="'+(snap.reg==="all"?"all":snap.reg)+'"]');if(r&&!r.classList.contains("active"))r.click()}catch(e){}},0);return}
 if(s==="other"){const P=PS(),t=Object.keys(TABN).find(k=>TABN[k]===snap.tab&&["study","flashcards","quiz","speed"].includes(k));if(t)P.tab=t;if(snap.reg)P.reg=snap.reg;return}
 const tab=Object.keys(TABN).find(k=>TABN[k]===snap.tab&&document.querySelector('nav.tabs .tab-btn[data-tab="'+k+'"]'));
 const reg=snap.reg==="all"?"All":snap.reg,okReg=reg==="All"||[...document.querySelectorAll("#regionRow [data-r]")].some(b=>b.dataset.r===reg);
 let ch=false;if(tab&&tab!==activeTab){activeTab=tab;ch=true}if(okReg&&reg!==activeRegion){activeRegion=reg;activeSub="All";ch=true}
 if(ch){try{renderChrome();renderActiveView()}catch(e){console.error(e)}}}
function go(s,fromPill){const P=PS(),snap=inPractice()&&!fromPill?snapshot():null;P.last=s;P.seen=true;try{saveStats()}catch(e){}
 if(s==="other"){window._prOther=true;if(appMode!=="trivia")switchAppMode("trivia");else{applyAppMode();renderChrome();renderActiveView()}restore(s,snap);try{triviaState().fcMode="quiz"}catch(e){}renderOther();sync();scrollTo(0,0);return}
 window._prOther=false;if(appMode!==s)switchAppMode(s);else{try{applyAppMode();renderChrome();renderActiveView()}catch(e){}}restore(s,snap);sync()}
window.gfPracticeGo=go;

/* ---------- the subject tabs ---------- */
function tabsEl(){let el=document.getElementById("prSubj");if(!el){el=document.createElement("div");el.id="prSubj";el.className="pr-subj";el.setAttribute("role","tablist");el.setAttribute("aria-label","Practice subject");
  const w=document.querySelector(".wrap");if(!w)return null;w.insertBefore(el,w.firstChild)}return el}
function sync(){const p=document.getElementById("appModePracticeBtn"),on=inPractice();document.body.classList.toggle("pr-other",isOther());
 if(window._prChoosing){document.querySelectorAll(".app-mode-tabs .tab-btn.active").forEach(b=>b.classList.remove("active"));if(p)p.classList.add("active");const el=tabsEl();if(el)el.classList.add("pr-off");return}if(p)p.classList.toggle("active",on);const tv=document.getElementById("appModeTriviaBtn");if(tv)tv.classList.toggle("active",appMode==="trivia"&&!isOther());
 const el=tabsEl();if(!el)return;el.classList.toggle("pr-off",!on);if(!on)return;const cur=curSubj(),C=SUBJ.find(x=>x.k===cur);el.style.setProperty("--pr-c",C?C.c:"#e7a6bd");
 const html=SUBJ.map((x,i)=>'<button type="button" role="tab" aria-selected="'+(x.k===cur)+'" class="'+(x.k===cur?"on":"")+'" data-prs="'+x.k+'" style="--c:'+x.c+';--d:'+x.d+'" title="'+esc(x.b)+' (key '+(i+1)+')"><span class="pr-ic" aria-hidden="true">'+x.ic+'</span>'+x.n+' <kbd>'+(i+1)+'</kbd></button>').join("");
 if(el._h!==html){el.innerHTML=html;el._h=html;el.querySelectorAll("[data-prs]").forEach(b=>b.onclick=()=>{if(b.dataset.prs!==curSubj())go(b.dataset.prs)})}
 if(isOther()){const t=document.getElementById("headerTitle"),st=document.getElementById("headerSubtitle");if(t)t.textContent="Other";if(st)st.textContent="one fact, every country: currencies, languages, demonyms and more"}}
window.gfPracticeSync=sync;

/* ---------- the first-time chooser ---------- */
function chooser(){const w=document.getElementById("mainContent");if(!w)return;/* nothing (a map above all) is left hidden underneath: start from the quiet home page */if(appMode!=="home")switchAppMode("home");let d=document.getElementById("prChoose");
 if(!d){d=document.createElement("div");d.id="prChoose";w.insertBefore(d,w.firstChild)}
 d.innerHTML='<div class="pr-choose-box"><h2>What would you like to study first?</h2><p>Each one has Study, Flashcards and a Quiz. You can switch any time with the coloured tabs at the top of the page.</p><div class="pr-grid">'+
  SUBJ.map(x=>'<button type="button" data-prs="'+x.k+'" style="--c:'+x.c+'"><span class="pr-big" aria-hidden="true">'+x.ic+'</span><b>'+x.n+'</b><small>'+esc(x.b)+'</small></button>').join("")+
  '</div><p class="pr-note">Next time, Study &amp; Quiz opens straight on the one you used last.</p></div>';
 d.onclick=e=>{const b=e.target.closest("[data-prs]");if(b){closeChooser();go(b.dataset.prs,true)}};
 window._prChoosing=true;document.body.classList.add("pr-choosing");sync();scrollTo(0,0)}
function closeChooser(){if(!window._prChoosing)return;window._prChoosing=false;document.body.classList.remove("pr-choosing");sync()}

/* ---------- Other: the country-fact drills ---------- */
const REG=["all","Europe","Asia","Africa","Americas","Oceania"];
const OTABS=[["study","Study"],["flashcards","Flashcards"],["quiz","Quiz"],["speed","Speed Round"]];
function drills(){const D=window.gfDrills;const L=D?D.list().slice():[];L.push({id:"call",name:"Phone code",icon:"📞"});
 if(window.gfProvinces)L.push({id:"pv",name:"States & provinces",icon:"🗺️",noFlash:true});return L}
function factText(id,v){if(!v)return null;switch(id){case"cur":return v.cur+(v.sym?" ("+v.sym+")":"");case"lang":return(v.lang||[]).join(", ");case"dem":return v.dem;case"city":return v.city;case"lm":return v.lm;case"an":return v.an;case"call":return v.call?"+"+v.call:null}return null}
function renderOther(){const v=document.getElementById("triviaView");if(!v||!isOther())return;sync();const P=PS(),L=drills();if(!L.find(x=>x.id===P.dl))P.dl=L[0]?L[0].id:"cur";
 const D=L.find(x=>x.id===P.dl)||{};let tab=P.tab;if(D.noStudy&&tab==="study")tab="quiz";if(D.noFlash&&(tab==="flashcards"||tab==="speed"))tab=D.noStudy?"quiz":"study";
 const tabs='<nav class="tabs pro-tabs">'+OTABS.map(([k,l])=>{const off=(k==="study"&&D.noStudy)||((k==="flashcards"||k==="speed")&&D.noFlash);return'<button type="button" class="tab-btn'+(tab===k?" active":"")+'" data-prt="'+k+'"'+(off?' disabled title="Not for this one"':'')+'>'+l+'</button>'}).join("")+'</nav>';
 const chips='<div class="pro-drills">'+L.map(x=>'<button type="button" class="chip'+(x.id===P.dl?" active":"")+'" data-prd="'+x.id+'"><span aria-hidden="true">'+x.icon+'</span>'+esc(x.name)+'</button>').join("")+'</div>';
 let body="";
 if(tab==="study"&&D.id==="pv"){body='<div class="pro-go"><p>Pick a country and learn its states or provinces on the map.</p><button type="button" class="tv-go" id="proStart">Open the map →</button></div>'}
 else if(tab==="study"){const q=(P.q||"").toLowerCase(),rows=COUNTRIES.filter(c=>(!REG.includes(P.reg)||P.reg==="all"||c.r===P.reg)).map(c=>({c,t:factText(D.id,(typeof DRILL_FACTS!=="undefined"?DRILL_FACTS:{})[c.c])})).filter(o=>o.t&&(!q||o.c.n.toLowerCase().includes(q)||String(o.t).toLowerCase().includes(q))).sort((a,b)=>a.c.n.localeCompare(b.c.n));
  const fl=c=>{try{return flagUrl(c,"w80")}catch(e){return"https://flagcdn.com/w80/"+c+".png"}};
  body='<div class="pro-tools">'+REG.map(r=>'<button type="button" class="chip'+(P.reg===r?" active":"")+'" data-prr="'+r+'">'+(r==="all"?"All":r)+'</button>').join("")+'<input type="search" id="proQ" placeholder="Search a country or a '+esc(D.name.toLowerCase())+'…" value="'+esc(P.q||"")+'"></div>'+
   '<div class="pro-count">'+rows.length+' countries</div><div class="pro-grid">'+rows.map(o=>{const M=window.gfDrillMedia&&D.id!=="call"?gfDrillMedia.html(D.id,o.c.c):"";
   return M?'<div class="pro-card pro-mcard">'+M+'<div class="pro-cap"><img src="'+fl(o.c.c)+'" alt="" loading="lazy"><div><b>'+esc(o.c.n)+'</b><span>'+esc(o.t)+'</span></div></div></div>':'<div class="pro-card"><img src="'+fl(o.c.c)+'" alt="" loading="lazy"><div><b>'+esc(o.c.n)+'</b><span>'+esc(o.t)+'</span></div></div>'}).join("")+'</div>'}
 else{const what={flashcards:"Flashcards are for practice: no stamps and no scores.",quiz:"Ten questions. Choose the answer, or type it.",speed:"Sixty seconds, four choices a question. A wrong answer only costs you time."}[tab];
  body='<div class="pro-go"><p>'+what+'</p><button type="button" class="tv-go" id="proStart">▶ Start '+esc(D.name)+'</button>'+
   /* Language also has the "which language is this?" quiz: a line of text to recognise */
   (D.id==="lang"&&tab==="quiz"&&window.gfLangId?'<p class="pro-or">or</p><button type="button" class="tv-go pro-alt" id="proLangId">✍️ Which language is this? <small>read a line, name the language</small></button>':'')+'</div>'}
 v.innerHTML='<div class="pro">'+tabs+chips+body+'</div>';
 v.querySelectorAll("[data-prt]").forEach(b=>b.onclick=()=>{P.tab=b.dataset.prt;saveStats();renderOther()});
 v.querySelectorAll("[data-prd]").forEach(b=>b.onclick=()=>{P.dl=b.dataset.prd;saveStats();renderOther()});
 v.querySelectorAll("[data-prr]").forEach(b=>b.onclick=()=>{P.reg=b.dataset.prr;saveStats();renderOther()});
 const qi=v.querySelector("#proQ");if(qi)qi.oninput=()=>{P.q=qi.value;clearTimeout(qi._t);qi._t=setTimeout(()=>{const pos=qi.selectionStart;renderOther();const n=document.getElementById("proQ");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}},180)};
 const s=v.querySelector("#proStart");if(s)s.onclick=()=>startDrill(D.id,tab);const li=v.querySelector("#proLangId");if(li)li.onclick=()=>startDrill("langid",tab)}
function startDrill(id,tab){const t=triviaState();try{_speedEndAt=0}catch(e){}
 if(id==="langid"){const v=document.getElementById("triviaView");v.innerHTML='<div class="li-wrap" id="prLang"></div>';gfLangId.round(v.querySelector("#prLang"),{n:10,title:"Which language?",back:()=>renderOther(),backLabel:"Other",level:"all"});scrollTo(0,0);return}
 if(id==="pv"){const S=gfDrills.st();S.pv=true;t.fcMode="drills";saveStats();renderTriviaView();scrollTo(0,0);return}
 try{gfDrills.st().region=REG.includes(PS().reg)?PS().reg:"all"}catch(e){}
 gfDrills.start(id,tab==="speed"?"speed":tab==="flashcards"?"flash":"normal");scrollTo(0,0)}
/* drills and their back buttons come home to Other, not to Trivia */
{const _rt=renderTriviaView;renderTriviaView=function(){if(isOther()&&triviaState().fcMode!=="drills"){renderOther();return}return _rt.apply(this,arguments)}}
new MutationObserver(()=>{if(!isOther())return;document.querySelectorAll("#triviaView button").forEach(b=>{const t=b.textContent;if(/←\s*Trivia/.test(t))b.textContent=t.replace(/Trivia/,"Other")})}).observe(document.getElementById("triviaView")||document.body,{childList:true,subtree:true});

/* ---------- keep everything in step ---------- */
{const _sm=switchAppMode;switchAppMode=function(m){closeChooser();if(m!=="trivia")window._prOther=false;if(["map","flag","capital","landforms"].includes(m)){const P=PS();P.last=m;P.seen=true}
  const r=_sm.apply(this,arguments);sync();return r}}
{const tb=document.getElementById("appModeTriviaBtn");if(tb)tb.onclick=()=>{closeChooser();if(isOther()){window._prOther=false;try{triviaState().fcMode="quiz"}catch(e){}applyAppMode();renderChrome();renderActiveView();sync();scrollTo(0,0)}else switchAppMode("trivia")}}
{const _am=applyAppMode;applyAppMode=function(){const r=_am.apply(this,arguments);sync();return r}}
{const _ra=renderActiveView;renderActiveView=function(){const r=_ra.apply(this,arguments);try{if(isOther()&&triviaState().fcMode!=="drills")renderOther();sync()}catch(e){}return r}}
/* Trivia keeps its quizzes; the country-fact drills now live in Study & Quiz › Other */
{const _rt=renderTriviaView;renderTriviaView=function(){const r=_rt.apply(this,arguments);try{if(!isOther()){const f=document.querySelector("#triviaView .tvh-facts");if(f){const h=f.previousElementSibling;if(h&&h.classList.contains("tvh-h"))h.remove();
  f.outerHTML='<p class="pr-moved tvh-note">Country facts (currency, language, demonym and more) are now in <a href="#" id="prMoved">Study &amp; Quiz › Other</a>.</p>';const a=document.getElementById("prMoved");if(a)a.onclick=e=>{e.preventDefault();go("other",true)}}}}catch(e){}return r}}

/* keys 1–5 switch subject while studying (quizzes use the number keys for answers) */
document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey||!/^[1-5]$/.test(e.key)||!inPractice())return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
 const studying=isOther()?(PS().tab==="study"&&triviaState().fcMode!=="drills"):curSubj()==="landforms"?!!document.querySelector('#landformsView [data-lfm="study"].active'):activeTab==="study";if(!studying)return;
 const s=SUBJ[+e.key-1];if(s&&s.k!==curSubj()){e.preventDefault();go(s.k)}});

if(!addPill()){const t=setInterval(()=>{if(addPill()){clearInterval(t);sync()}},200)}sync();
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
