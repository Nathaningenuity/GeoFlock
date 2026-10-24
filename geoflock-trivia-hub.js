/* GeoFlock: the Trivia page as a menu. Click a quiz to start it.
   - Quizzes: General Geography, Landforms & nature, History, Culture, … (the main typed-answer quiz, one topic at a time;
     a topic's parts start just that part), then the country-fact quizzes (currency, language, demonym, major city,
     landmark, national animal) from geoflock-drills-ui.js, and States & provinces.
   - "Play as": Quiz, Speed round (60 seconds, four choices) or Flashcards (practice only: no stamps, no scores).
   - Custom mix opens the old page for picking several topics or continents.
   The Library, Drills, Flashcards and Speed Round tabs are gone; Lists and Jeopardy stay. */
(function(){
if(typeof renderTriviaHome!=="function"||typeof TRIVIA_TOPICS==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ORDER=["geo","nature","history","culture","politics","economy","words","classic","identify"];
const PLAY=[["quiz","Quiz"],["speed","Speed round<span class=\"tvh-long\"> · 60 s</span>"],["flash","Flashcards"]];
const hub=()=>{const t=triviaState();if(!t.hub||typeof t.hub!=="object")t.hub={play:"quiz"};return t.hub};
try{const N=TRIVIA_TOPICS.find(t=>t.id==="nature");if(N)N.name="Landforms & Nature"}catch(e){}
const speedOK=id=>id!=="classic"&&id!=="identify";
function nav(){const q=document.querySelector('[data-appmode="quiz"]');return q&&q.parentElement}
function navSync(){const n=nav();if(n&&typeof wireTvAppModeSwitch==="function")try{wireTvAppModeSwitch(n)}catch(e){}}
/* start a topic (or one part of it) in the chosen way */
/* a new start: drop the guard that swallows Enter/Space for a few seconds after a speed round */
const fresh=()=>{try{_speedEndAt=0}catch(e){}};
function go(id,block){fresh();const st=triviaState(),H=hub();
 if(H.play==="flash"){st.fcMode="cards";saveStats();try{fcSelectQuick(id,block||null)}catch(e){fcSelectQuick(id)}navSync();renderTriviaView();scrollTo(0,0);return}
 if(H.play==="speed"){if(!speedOK(id))return;ts.topic=id;st.fcMode="speed";saveStats();navSync();tsStart();scrollTo(0,0);return}
 st.mode="topics";st.cats=[id];if(tvBlocksOf(id).length)st.blocks[id]=block?[block]:tvBlocksOf(id);saveStats();triviaStart();scrollTo(0,0)}
function goFact(id){fresh();const H=hub();if(!window.gfDrills)return;gfDrills.start(id,H.play==="speed"?"speed":H.play==="flash"?"flash":"normal");navSync();scrollTo(0,0)}
function renderHub(){const st=triviaState(),H=hub(),v=document.getElementById("triviaView");if(!v)return;const play=H.play;
 const tile=c=>{const off=play==="speed"&&!speedOK(c.id),n=triviaPool(c.id).length;
  const meta=play==="speed"?(off?"Not in speed rounds":"Best "+(((tsState().best)||{})[c.id]||0)+" in 60 s"):play==="flash"?n+" cards":(c.blocks.length?"Score <b>"+tvTopicScore(c.id).toFixed(2)+"</b> · ":"")+n+" questions · "+tvDoneIn(triviaPool(c.id).map(q=>q.id))+" done";
  const parts=play!=="speed"&&c.blocks.length?'<div class="tvh-parts">'+c.blocks.map(b=>'<button type="button" class="tvh-part" data-cat="'+c.id+'" data-block="'+b.id+'" title="Just '+esc(b.name)+'">'+tvIcon(c.id+":"+b.id)+'<span>'+esc(b.name)+'</span></button>').join("")+'</div>':'';
  return'<div class="tvh-tile'+(off?" off":"")+'" style="'+tvTopicColorVars(c.id)+'"><button type="button" class="tvh-go" data-cat="'+c.id+'"'+(off?" disabled":"")+'><span class="tv-icon-wrap">'+tvIcon(c.id)+'</span><span class="tvh-t"><b>'+esc(c.name)+'</b><small>'+esc(c.blurb)+'</small><em>'+meta+'</em></span><span class="tvh-arrow" aria-hidden="true">›</span></button>'+(parts?'<button type="button" class="tvh-more" aria-expanded="false">Parts ▾</button>':'')+parts+'</div>'};
 const topics=ORDER.map(id=>TRIVIA_TOPICS.find(t=>t.id===id)).filter(Boolean).concat(TRIVIA_TOPICS.filter(t=>!ORDER.includes(t.id)));
 const D=window.gfDrills,S=D?D.st():{};
 const facts=D?D.list().map(x=>{const b=play==="quiz"?D.best(x.id):0;return'<button type="button" class="tvh-fact" data-fact="'+x.id+'"><span class="tvh-fi" aria-hidden="true">'+x.icon+'</span><span class="tvh-t"><b>'+esc(x.name)+'</b><small>'+esc(D.DIRNAME(x,D.dirOf(x)))+'</small>'+(b?'<em>best '+b+'</em>':'')+'</span></button>'}).join("")+(play==="quiz"&&window.gfProvinces?'<button type="button" class="tvh-fact" data-pv="1"><span class="tvh-fi" aria-hidden="true">🗺️</span><span class="tvh-t"><b>States & provinces</b><small>Learn the map inside a country</small></span></button>':''):'';
 v.innerHTML='<div class="tv-wrap tvh">'+tvNerdHTML(st)+
  '<div class="tvh-bar"><div class="tvh-row"><span class="tv-lab">Play as</span><div class="tv-mode" role="tablist">'+PLAY.map(([k,l])=>'<button type="button" role="tab" class="tv-mode-btn'+(play===k?" on":"")+'" data-play="'+k+'" aria-selected="'+(play===k)+'">'+l+'</button>').join("")+'</div></div>'+
  (play==="quiz"?'<div class="tvh-row"><span class="tv-lab">Questions</span>'+TRIVIA_COUNT_PRESETS.map(n=>'<button type="button" class="chip'+(st.count===n?" active":"")+'" data-n="'+n+'">'+n+'</button>').join("")+'</div>':
   play==="speed"?'<p class="tvh-note">Sixty seconds, four choices a question. A wrong answer only costs you time.</p>':'<p class="tvh-note">Flashcards are for practice: no stamps and no scores.</p>')+
  '</div>'+
  '<h2 class="tvh-h">Quizzes</h2><div class="tvh-grid">'+topics.map(tile).join("")+(play==="quiz"?'<button type="button" class="tvh-tile tvh-custom" id="tvhCustom"><b>＋ Custom mix</b><small>Several topics at once, or questions by continent</small></button>':'')+'</div>'+
  (facts?'<h2 class="tvh-h">Country facts'+(play==="quiz"?'<span class="tvh-ans"><span class="tv-lab">Answer</span><button type="button" class="chip'+(S.style!=="type"?" active":"")+'" data-sty="choice">Multiple choice</button><button type="button" class="chip'+(S.style==="type"?" active":"")+'" data-sty="type">Fill in the blank</button></span>':'')+'</h2><div class="tvh-facts">'+facts+'</div>':'')+
  '</div>';
 v.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>{H.play=b.dataset.play;saveStats();renderHub()});
 v.querySelectorAll(".tvh-bar [data-n]").forEach(b=>b.onclick=()=>{st.count=+b.dataset.n;saveStats();renderHub()});
 v.querySelectorAll(".tvh-go").forEach(b=>b.onclick=()=>go(b.dataset.cat));
 /* phones: a topic's parts fold away behind a small button */
 v.querySelectorAll(".tvh-more").forEach(b=>b.onclick=()=>{const t=b.closest(".tvh-tile"),o=!t.classList.contains("open");t.classList.toggle("open",o);b.setAttribute("aria-expanded",o);b.textContent=o?"Parts ▴":"Parts ▾"});
 v.querySelectorAll(".tvh-part").forEach(b=>b.onclick=()=>go(b.dataset.cat,b.dataset.block));
 v.querySelectorAll("[data-fact]").forEach(b=>b.onclick=()=>goFact(b.dataset.fact));
 v.querySelectorAll("[data-sty]").forEach(b=>b.onclick=()=>{S.style=b.dataset.sty;saveStats();renderHub()});
 const pv=v.querySelector("[data-pv]");if(pv)pv.onclick=()=>{S.pv=true;st.fcMode="drills";saveStats();navSync();renderTriviaView();scrollTo(0,0)};
 const cu=document.getElementById("tvhCustom");if(cu)cu.onclick=()=>{H.custom=true;saveStats();renderTriviaView();scrollTo(0,0)};
 /* until 15 questions are answered, the player can say how much they already know */
 try{if(play==="quiz"&&(st.n||0)<15&&typeof TV_START_CHOICES!=="undefined"){const g=tvGeneral();v.querySelector(".tvh-bar").insertAdjacentHTML("beforebegin",'<div class="tv-startlv" id="tvStartLv"><span>Where do you want to start?</span>'+TV_START_CHOICES.map(([lv,name])=>'<button type="button" class="chip'+(Math.abs(g-lv)<.01?" active":"")+'" data-slv="'+lv+'">'+esc(name)+' <small>'+lv.toFixed(1)+'</small></button>').join("")+'<em>You can change this until you’ve answered 15 questions; after that the questions follow how you do.</em></div>');
  v.querySelectorAll("[data-slv]").forEach(b=>b.onclick=()=>{st.g=+b.dataset.slv;saveStats();renderHub()})}}catch(e){console.error(e)}
 try{skpRender()}catch(e){}}
/* the Trivia page: the menu, or the old picker for a custom mix (with a way back) */
{const _h=renderTriviaHome;renderTriviaHome=function(){const H=hub();if(!H.custom)return renderHub();const r=_h.apply(this,arguments);
 try{const w=document.querySelector("#triviaView .tv-wrap");if(w&&!document.getElementById("tvhBack")){w.insertAdjacentHTML("afterbegin",'<button type="button" class="chip tvh-back" id="tvhBack">← All quizzes</button>');document.getElementById("tvhBack").onclick=()=>{H.custom=false;saveStats();renderTriviaView()}}}catch(e){}return r}}
/* a "← Trivia" button on the flashcards and speed-round screens, which no longer have tabs of their own */
function backBtn(){const v=document.getElementById("triviaView");if(!v||document.getElementById("tvhHome"))return;const b=document.createElement("button");b.type="button";b.className="chip tvh-back";b.id="tvhHome";b.textContent="← Trivia";
 b.onclick=()=>{try{clearInterval(ts.timer);ts.state="setup"}catch(e){}const st=triviaState();st.fcMode="quiz";saveStats();navSync();renderTriviaView()};v.prepend(b)}
{const _f=renderFlashcards;renderFlashcards=function(){const r=_f.apply(this,arguments);try{backBtn()}catch(e){}return r}}
{const _t=tsRender;tsRender=function(){const st=triviaState();
 /* "Change topic" now means back to the Trivia page */
 if(ts.state==="setup"&&st.fcMode==="speed"){st.fcMode="quiz";saveStats();navSync();return renderTriviaView()}
 const r=_t.apply(this,arguments);try{const b=document.getElementById("tsBack");if(b)b.textContent="← Trivia";if(ts.state!=="play")backBtn()}catch(e){}return r}}
/* tabs: Trivia, Lists and Jeopardy. Old Library / Drills / Flashcards / Speed Round states open the Trivia page */
{const _rv=renderTriviaView;renderTriviaView=function(){try{const st=triviaState();if(st.fcMode==="library"){st.fcMode="quiz"}if(st.fcMode==="speed"&&ts.state==="setup")st.fcMode="quiz"}catch(e){}return _rv.apply(this,arguments)}}
{const _w=wireTvAppModeSwitch;wireTvAppModeSwitch=function(n){const r=_w.apply(this,arguments);try{const m=triviaState().fcMode;if(["cards","speed","drills","library"].includes(m))n.querySelectorAll("[data-appmode]").forEach(b=>b.classList.toggle("active",b.dataset.appmode==="quiz"));
 const q=n.querySelector('[data-appmode="quiz"]');if(q){const o=q.onclick;q.onclick=()=>{const H=hub();H.custom=false;try{clearInterval(ts.timer);ts.state="setup"}catch(e){}if(typeof o==="function")o()}}}catch(e){}return r}}
const css=document.createElement("style");css.textContent=`
#triviaView [data-appmode="library"], [data-appmode="library"].tab-btn, [data-appmode="drills"].tab-btn, [data-appmode="cards"].tab-btn, [data-appmode="speed"].tab-btn{ display:none !important; }
.tvh .tvh-bar{ display:flex; flex-wrap:wrap; gap:10px 22px; align-items:center; justify-content:space-between; background:rgba(255,255,255,.72); border-radius:20px; padding:12px 16px; margin:14px 0 6px; box-shadow:0 3px 14px rgba(20,40,70,.06); }
.tvh-row{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; } .tvh-row .tv-lab{ margin-right:4px; } .tvh-note{ margin:0; font-size:13px; opacity:.75; }
.tvh-h{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; font-size:20px; margin:22px 2px 10px; }
.tvh-ans{ display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; } .tvh-ans .tv-lab{ margin-right:2px; }
.tvh-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:12px; }
.tvh-tile{ border-radius:22px; background:color-mix(in srgb, var(--tf,#ddd) 22%, rgba(255,255,255,.88)); border:2px solid color-mix(in srgb, var(--tf,#ccc) 70%, transparent); padding:6px; display:flex; flex-direction:column; gap:4px; }
.tvh-tile.off{ opacity:.45; } .tvh-go{ display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; width:100%; text-align:left; background:none; border:0; border-radius:16px; padding:8px 10px; cursor:pointer; font:inherit; color:inherit; }
.tvh-go:not([disabled]):hover{ background:color-mix(in srgb, var(--tf,#ddd) 30%, transparent); } .tvh-go[disabled]{ cursor:default; }
.tvh-go .tv-icon-wrap{ width:44px; height:44px; border-radius:14px; display:grid; place-items:center; background:var(--tf,#ddd); color:var(--td,#333); flex:none; }
.tvh-t{ display:flex; flex-direction:column; gap:2px; min-width:0; } .tvh-t b{ font-size:17px; } .tvh-t small{ font-size:12.5px; opacity:.75; } .tvh-t em{ font-style:normal; font-size:12px; color:var(--td,#555); }
.tvh-arrow{ font-size:26px; opacity:.45; } .tvh-go:hover .tvh-arrow{ opacity:.9; }
.tvh-parts{ display:flex; flex-wrap:wrap; gap:6px; padding:0 8px 8px; } .tvh-part{ display:inline-flex; align-items:center; gap:5px; border:1px solid color-mix(in srgb, var(--td,#999) 30%, transparent); background:rgba(255,255,255,.7); border-radius:999px; padding:4px 10px; font:600 12.5px inherit; cursor:pointer; color:inherit; }
.tvh-part:hover{ background:#fff; } .tvh-part .tv-icon{ width:14px; height:14px; }
.tvh-custom{ align-items:flex-start; justify-content:center; padding:16px 18px; cursor:pointer; font:inherit; color:inherit; border-style:dashed; background:rgba(255,255,255,.55); text-align:left; } .tvh-custom b{ font-size:16px; } .tvh-custom small{ opacity:.7; } .tvh-custom:hover{ background:rgba(255,255,255,.85); }
.tvh-facts{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:10px; }
.tvh-fact{ display:flex; align-items:center; gap:12px; text-align:left; border:0; background:rgba(255,255,255,.85); border-radius:18px; box-shadow:0 3px 12px rgba(20,40,70,.07); padding:12px 14px; cursor:pointer; font:inherit; color:inherit; }
.tvh-fact:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(20,40,70,.13); } .tvh-fi{ font-size:28px; } .tvh-fact .tvh-t b{ font-size:15.5px; }
.tvh-back{ margin:4px 0 8px; }
body.sky-night .tvh .tvh-bar, body.dark-theme .tvh .tvh-bar, body.sky-night .tvh-fact, body.dark-theme .tvh-fact{ background:rgba(30,34,60,.85); }
body.sky-night .tvh-tile, body.dark-theme .tvh-tile{ background:color-mix(in srgb, var(--tf,#444) 16%, rgba(30,34,60,.9)); } body.sky-night .tvh-part, body.dark-theme .tvh-part{ background:rgba(255,255,255,.06); }
.tvh-more{ display:none; }
/* phones: everything compact, two topics a row, parts folded away */
@media (max-width:640px){
 .tvh.tv-wrap{ padding-left:10px; padding-right:10px; }
 .tvh .tv-nerd{ padding:12px 14px; } .tvh .tv-nerd-num{ font-size:34px !important; } .tvh .tv-nerd-main{ gap:12px; } .tvh .tv-nerd-foot{ font-size:11px; } .tvh .tv-nerd-foot .tv-muted, .tvh .tv-nerd-foot small{ display:none; }
 .tvh .tv-startlv{ display:flex; flex-wrap:nowrap; justify-content:flex-start !important; overflow-x:auto; gap:6px; padding:10px 12px; align-items:center; scrollbar-width:none; } .tvh .tv-startlv::-webkit-scrollbar{ display:none; }
 .tvh .tv-startlv > span{ flex:none; font-size:13px; } .tvh .tv-startlv .chip{ flex:none; } .tvh .tv-startlv em{ display:none; }
 .tvh .tvh-bar{ padding:10px; gap:8px; margin-top:10px; } .tvh-row{ width:100%; flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; } .tvh-row::-webkit-scrollbar{ display:none; }
 .tvh-row > .tv-lab{ flex:none; } .tvh-row .chip{ flex:none; padding:6px 12px; } .tvh .tv-mode{ flex:1; display:flex; } .tvh .tv-mode-btn{ flex:1; font-size:13px; padding:7px 6px; white-space:nowrap; } .tvh-note{ font-size:12px; }
 .tvh-h{ font-size:17px; margin:16px 2px 8px; } .tvh-ans{ width:100%; } .tvh-ans .chip{ padding:5px 10px; font-size:12px; }
 .tvh-grid{ grid-template-columns:1fr 1fr; gap:8px; }
 .tvh-tile{ border-radius:18px; padding:4px; } .tvh-go{ grid-template-columns:1fr; gap:6px; padding:8px; align-items:start; }
 .tvh-go .tv-icon-wrap{ width:36px; height:36px; border-radius:11px; } .tvh-t b{ font-size:15px; line-height:1.2; } .tvh-t small{ display:none; } .tvh-t em{ font-size:11px; } .tvh-arrow{ display:none; }
 .tvh-more{ display:block; align-self:flex-start; margin:0 8px 6px; border:0; background:none; padding:2px 0; font:700 12px inherit; color:var(--td,#555); cursor:pointer; }
 .tvh-tile:not(.open) .tvh-parts{ display:none; } .tvh-parts{ padding:0 6px 6px; gap:5px; } .tvh-part{ font-size:12px; padding:4px 8px; }
 .tvh-long{ display:none; }
 /* the Jeopardy score keeper floats over the menu on a phone; it is only needed in Jeopardy */
 body:has(#triviaView:not(.tv-jp-on)) #skGadget{ display:none !important; }
 .tvh{ padding-bottom:70px; }
 /* fact quizzes: the top line wraps, the switch gets its own row */
 .dr-wrap{ padding:0 8px; } .dr-card{ padding:12px; border-radius:18px; } .dr-top{ flex-wrap:wrap; row-gap:6px; font-size:12px; }
 .dr-top > span:first-child{ flex:1 1 100%; text-align:left; } .dr-swap{ order:5; } .dr-flag{ height:72px; } .dr-card h3{ font-size:19px; margin:8px 0 4px; } .dr-o{ padding:10px 12px; font-size:15px; } .dr-opts4{ gap:6px; margin:8px 0; }
 .tvh-custom{ padding:12px; } .tvh-custom b{ font-size:15px; } .tvh-custom small{ font-size:12px; }
 .tvh-facts{ grid-template-columns:repeat(3,1fr); gap:8px; }
 .tvh-fact{ flex-direction:column; align-items:center; text-align:center; gap:4px; padding:10px 6px; border-radius:16px; } .tvh-fi{ font-size:26px; } .tvh-fact .tvh-t{ align-items:center; } .tvh-fact .tvh-t b{ font-size:13.5px; } .tvh-fact .tvh-t small{ display:block; font-size:10.5px; } .tvh-fact .tvh-t em{ font-size:10.5px; }
}}`;
document.head.appendChild(css);
})();
