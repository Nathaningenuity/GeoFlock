/* GeoFlock: the Trivia page. Click a quiz to start it.
   - At the top: Start mixed trivia, with the number of questions, the difficulty (easier / just right / harder) and
     "Adjust the mix": how often each big section, and each of its parts, comes up (defaults below), and how often a bonus
     question appears.
   - Quizzes: Classics, General Geography, Landforms & Nature, Culture, History, Politics & Economy (one topic each; a topic's
     parts start just that part). Old country names belong to Politics & Economy, a little less often than the rest.
   - Country facts: currency, language, which language (from a line of text), demonym, major city, landmark, national animal,
     phone code, States & provinces.
   - "Play as": Quiz, Speed round (60 seconds, four choices) or Flashcards (practice only: no stamps, no scores).
   - Leaving: "← Trivia" on every quiz screen goes back to this page; the quiz waits, and a banner offers to resume it.
     Nothing unanswered is counted wrong (End round no longer counts the open question).
   - Bonus questions now and then: a photo, guess the number, a flag's colours, a scrambled name, or a language.
   The question engine is the main page's (triviaStart, triviaNextQuestion…); this file chooses what it is given. */
(function(){
if(typeof renderTriviaHome!=="function"||typeof TRIVIA_TOPICS==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* the big sections; cats: topic → its parts ("*" = all) */
const SECTIONS=[
 {id:"classic",name:"Classics",blurb:"The iconic facts, not always the easy ones",icon:"classic",cats:{classic:null}},
 {id:"geo",name:"General Geography",blurb:"Size, people, place, borders, flags and cities",icon:"geo",cats:{geo:"*"}},
 {id:"nature",name:"Landforms & Nature",blurb:"Seas, rivers, mountains, islands, climate and wildlife",icon:"nature",cats:{nature:"*"}},
 {id:"culture",name:"Culture",blurb:"Food, music, sport, festivals, landmarks and languages",icon:"culture",cats:{culture:"*",words:["language"]}},
 {id:"history",name:"History",blurb:"Ancient ruins and empires to modern revolutions",icon:"history",cats:{history:"*"}},
 {id:"poleco",name:"Politics & Economy",blurb:"Governments, capitals, alliances, old country names, money and trade",icon:"politics",cats:{politics:"*",economy:"*",words:["names"]}}];
/* in mixed trivia only */
const EXTRAS=[{id:"identify",name:"Identify",blurb:"Name a country from its flag, shape, place or capital",icon:"identify",cats:{identify:"*"}},
 {id:"codes",name:"Phone codes",blurb:"Which country dials +81?",icon:"words",cats:{words:["codes"]}}];
const ALL=SECTIONS.concat(EXTRAS);
const DEF_SEC={identify:.6,codes:.3},DEF_BLOCK={"words:names":.6};
const BLOCK_NAME={"words:names":"Past country names","words:language":"Languages","words:codes":"Phone codes"};
const STEPS=[[0,"Off"],[.3,"Rarely"],[.6,"Less"],[1,"Normal"],[1.8,"More"],[3,"Lots"]];
const DIFF=[[-1,"Easier"],[0,"Just right"],[1,"Harder"]];
const BONUS=[[0,"Off"],[.05,"Rare"],[.1,"Sometimes"],[.2,"Often"]];
const PLAY=[["quiz","Quiz"],["speed","Speed round<span class=\"tvh-long\"> · 60 s</span>"],["flash","Flashcards"]];
const hub=()=>{const t=triviaState();if(!t.hub||typeof t.hub!=="object")t.hub={play:"quiz"};const H=t.hub;H.w=H.w||{};H.bw=H.bw||{};if(typeof H.diff!=="number")H.diff=0;if(typeof H.bonus!=="number")H.bonus=.05;return H};
try{const N=TRIVIA_TOPICS.find(t=>t.id==="nature");if(N)N.name="Landforms & Nature"}catch(e){}
const secW=id=>{const v=hub().w[id];return typeof v==="number"?v:DEF_SEC[id]!=null?DEF_SEC[id]:1};
const blkW=k=>{const v=hub().bw[k];return typeof v==="number"?v:DEF_BLOCK[k]!=null?DEF_BLOCK[k]:1};
const keysOf=S=>Object.entries(S.cats).flatMap(([c,bs])=>c==="classic"?["classic"]:(bs==="*"?tvBlocksOf(c):bs).map(b=>c+":"+b));
const secOf=k=>{const c=k.split(":")[0];return ALL.find(S=>keysOf(S).includes(k))||ALL.find(S=>S.cats[c])};
const blockName=k=>{if(BLOCK_NAME[k])return BLOCK_NAME[k];const[c,b]=k.split(":");const T=TRIVIA_CAT_BY_ID[c];const B=T&&T.blocks.find(x=>x.id===b);return B?B.name:b};
/* what to hand the question engine: topics and their parts */
function spec(secs,only,mix){const cats=[],blocks={};secs.forEach(S=>{if(mix&&secW(S.id)<=0)return;keysOf(S).forEach(k=>{if(only&&k!==only)return;if(blkW(k)<=0&&!only)return;if(k==="classic"){if(!cats.includes("classic"))cats.push("classic");return}
  const[c,b]=k.split(":");if(!cats.includes(c))cats.push(c);(blocks[c]=blocks[c]||[]).includes(b)||blocks[c].push(b)})});return{cats,blocks}}
let mixActive=false,inSel=false;
/* how often each part comes up: the engine's own votes × the player's weights (and, in mixed trivia, the section's) */
{const _v=tvBlockVotes;tvBlockVotes=function(k){const base=_v.apply(this,arguments);try{let m=blkW(k);if(mixActive){const S=secOf(k);if(S)m*=secW(S.id)}return base*Math.max(m,0)}catch(e){return base}}}
{const _u=tvUserWeight;tvUserWeight=function(t){if(mixActive)return t==="classic"?secW("classic"):1;return _u.apply(this,arguments)}}
/* difficulty: the engine aims at the player's level; "easier"/"harder" moves that aim while it picks a question */
{const _n=triviaNextQuestion;triviaNextQuestion=function(){inSel=true;try{return _n.apply(this,arguments)}finally{inSel=false}}}
{const _b=tvBlockLevel;tvBlockLevel=function(){const r=_b.apply(this,arguments);if(!inSel)return r;const d=hub().diff||0;return Math.max(1,Math.min(5,r+d*.75))}}
/* the speed round's "Politics & Economy" covers both topics */
if(typeof tsPool==="function"){const _p=tsPool;tsPool=function(){if(ts.topic==="poleco")return TRIVIA_Q.filter(q=>(q.s==="politics"||q.s==="economy")&&!q.k&&(q.x||q.a.length===1)&&q.t);return _p.apply(this,arguments)}}
function nav(){const q=document.querySelector('[data-appmode="quiz"]');return q&&q.parentElement}
function navSync(){const n=nav();if(n&&typeof wireTvAppModeSwitch==="function")try{wireTvAppModeSwitch(n)}catch(e){}}
/* a new start: drop the guard that swallows Enter/Space for a few seconds after a speed round */
const fresh=()=>{try{_speedEndAt=0}catch(e){}};
function begin(sp,mix,secId){const st=triviaState();if(!sp.cats.length)return;mixActive=!!mix;st.mode="topics";st.cats=sp.cats;st.blocks=Object.assign({},st.blocks||{},sp.blocks);saveStats();
 triviaStart();try{if(trivia.run){trivia.run.mix=!!mix;trivia.run.sec=secId||null}}catch(e){}scrollTo(0,0)}
function startMixed(){fresh();begin(spec(ALL,null,true),true,null)}
function go(id,key){fresh();const st=triviaState(),H=hub(),S=SECTIONS.find(x=>x.id===id);if(!S)return;
 if(H.play==="flash"){const src=key?key.split(":")[0]:id==="poleco"?"politics":id;st.fcMode="cards";saveStats();try{fcSelectQuick(src==="classic"?"classic":src,key&&key!=="classic"?key.split(":")[1]:null)}catch(e){fcSelectQuick(src)}navSync();renderTriviaView();scrollTo(0,0);return}
 if(H.play==="speed"){if(id==="classic")return;ts.topic=id==="poleco"?"poleco":id;st.fcMode="speed";saveStats();navSync();tsStart();scrollTo(0,0);return}
 begin(spec([S],key||null,false),false,id)}
function goFact(id){fresh();const H=hub();if(id==="langid")return langRound();if(!window.gfDrills)return;gfDrills.start(id,H.play==="speed"?"speed":H.play==="flash"?"flash":"normal");navSync();scrollTo(0,0)}
/* "Which language?" in Trivia: a round of ten */
function langRound(){const v=document.getElementById("triviaView");if(!v||!window.gfLangId)return;mixActive=false;v.innerHTML='<div class="li-wrap" id="tvhLang"></div>';
 gfLangId.round(v.querySelector("#tvhLang"),{n:10,title:"Which language?",back:()=>renderTriviaView(),backLabel:"Trivia",level:hub().diff>0?"all":"easy"});scrollTo(0,0)}
const paused=()=>{try{const r=trivia.run;return r&&trivia.view!=="play"&&trivia.view!=="done"&&r.idx<r.total&&r.items&&r.items.length?r:null}catch(e){return null}};
function seg(list,cur,attr,extra){return'<span class="tvh-seg"'+(extra||"")+'>'+list.map(([x,l])=>'<button type="button" class="'+(Math.abs(cur-x)<1e-6?"on":"")+'" '+attr+'="'+x+'">'+l+'</button>').join("")+'</span>'}
function mixPanel(){const H=hub();const changed=Object.keys(H.w).length||Object.keys(H.bw).length;
 const row=(S,extra)=>{const ks=keysOf(S).filter(k=>k!=="classic");return'<div class="tvh-mrow" style="'+tvTopicColorVars(S.cats.classic!==undefined?"classic":Object.keys(S.cats)[0])+'"><div class="tvh-mhead"><span class="tvh-mname"><span class="tv-icon-wrap">'+tvIcon(S.icon)+'</span>'+esc(S.name)+(extra?' <small>'+extra+'</small>':'')+'</span>'+seg(STEPS,secW(S.id),"data-sw",' data-s="'+S.id+'"')+'</div>'+
  (ks.length>1?'<details class="tvh-mparts"><summary>Parts</summary>'+ks.map(k=>'<div class="tvh-mpart"><span>'+esc(blockName(k))+'</span>'+seg(STEPS,blkW(k),"data-bw",' data-k="'+k+'"')+'</div>').join("")+'</details>':'')+'</div>'};
 return'<details class="tvh-mix"'+(H.mixOpen?" open":"")+'><summary>Adjust the mix'+(changed?' <em>custom</em>':'')+'</summary><div class="tvh-mixbody">'+SECTIONS.map(S=>row(S)).join("")+EXTRAS.map(S=>row(S,"only in mixed trivia")).join("")+
  '<div class="tvh-mrow tvh-bonusrow"><div class="tvh-mhead"><span class="tvh-mname">★ Bonus questions <small>a photo, guess the number, a flag’s colours, a scrambled name, a language</small></span>'+seg(BONUS,H.bonus,"data-bonus")+'</div></div>'+
  '<p class="tvh-mnote">“More” and “Lots” make a section come up about twice or three times as often; “Off” leaves it out.'+(changed?' <button type="button" class="tv-link" id="tvhMixReset">Back to the usual mix</button>':'')+'</p></div></details>'}
function renderHub(){const st=triviaState(),H=hub(),v=document.getElementById("triviaView");if(!v)return;const play=H.play;
 const P=paused();
 const tile=S=>{const off=play==="speed"&&S.id==="classic";const ks=keysOf(S),qids=new Set();ks.forEach(k=>triviaPool(k).forEach(q=>qids.add(q.id)));const n=qids.size;
  const scs=Object.keys(S.cats).filter(c=>c!=="words"&&c!=="classic").map(c=>tvTopicScore(c));const sc=scs.length?scs.reduce((a,b)=>a+b,0)/scs.length:null;
  const meta=play==="speed"?(off?"Not in speed rounds":"Best "+(((tsState().best)||{})[S.id==="poleco"?"poleco":S.id]||0)+" in 60 s"):play==="flash"?n+" cards":(sc!=null?"Score <b>"+sc.toFixed(2)+"</b> · ":"")+n+" questions · "+tvDoneIn([...qids])+" done";
  const parts=play!=="speed"&&ks.length>1?'<div class="tvh-parts">'+ks.map(k=>'<button type="button" class="tvh-part" data-sec="'+S.id+'" data-key="'+k+'" title="Just '+esc(blockName(k))+'">'+tvIcon(BLOCK_NAME[k]?"words":k)+'<span>'+esc(blockName(k))+'</span></button>').join("")+'</div>':'';
  const tc=S.cats.classic!==undefined?"classic":Object.keys(S.cats)[0];
  return'<div class="tvh-tile'+(off?" off":"")+'" style="'+tvTopicColorVars(tc)+'"><button type="button" class="tvh-go" data-sec="'+S.id+'"'+(off?" disabled":"")+'><span class="tv-icon-wrap">'+tvIcon(S.icon)+'</span><span class="tvh-t"><b>'+esc(S.name)+'</b><small>'+esc(S.blurb)+'</small><em>'+meta+'</em></span><span class="tvh-arrow" aria-hidden="true">›</span></button>'+(parts?'<button type="button" class="tvh-more" aria-expanded="false">Parts ▾</button>':'')+parts+'</div>'};
 const D=window.gfDrills,DS=D?D.st():{};
 const fact=(id,icon,name,sub,best)=>'<button type="button" class="tvh-fact" data-fact="'+id+'"><span class="tvh-fi" aria-hidden="true">'+icon+'</span><span class="tvh-t"><b>'+esc(name)+'</b><small>'+esc(sub)+'</small>'+(best?'<em>best '+best+'</em>':'')+'</span></button>';
 let facts="";if(D){const L=D.list(),byId=Object.fromEntries(L.map(x=>[x.id,x]));const one=id=>{const x=byId[id];return x?fact(x.id,x.icon,x.name,D.DIRNAME(x,D.dirOf(x)),play==="quiz"?D.best(x.id):0):""};
  facts=one("cur")+one("lang")+(play==="quiz"&&window.gfLangId?fact("langid","✍️","Which language?","Name it from a line of text",((stats.langId||{}).best||{})[H.diff>0?"all":"easy"]||0):"")+one("dem")+one("city")+one("lm")+one("an")+
   fact("call","📞","Phone code",(()=>{try{return D.DIRNAME({id:"call"},D.dirOf({id:"call",both:true,def:"fwd"}))}catch(e){return"Country → phone code"}})(),play==="quiz"?D.best("call"):0)+
   (play==="quiz"&&window.gfProvinces?'<button type="button" class="tvh-fact" data-pv="1"><span class="tvh-fi" aria-hidden="true">🗺️</span><span class="tvh-t"><b>States & provinces</b><small>Learn the map inside a country</small></span></button>':'')}
 const count=st.count||25;
 v.innerHTML='<div class="tv-wrap tvh">'+
  (P?'<div class="tvh-resume"><span><b>Quiz in progress</b> · question '+Math.min(P.idx+1,P.total)+' of '+P.total+'</span><button type="button" class="tv-go" id="tvhResume">Resume →</button><button type="button" class="tv-link" id="tvhDrop">Discard it</button></div>':'')+
  '<div class="tvh-hero"><div class="tvh-herorow"><button type="button" class="tv-go tvh-mixgo" id="tvhMixGo">▶ Start mixed trivia <small>'+count+' questions</small></button>'+
   '<div class="tvh-heroopts"><div class="tvh-row"><span class="tv-lab">Questions</span>'+TRIVIA_COUNT_PRESETS.map(n=>'<button type="button" class="chip'+(count===n?" active":"")+'" data-n="'+n+'">'+n+'</button>').join("")+'</div>'+
   '<div class="tvh-row"><span class="tv-lab">Difficulty</span>'+seg(DIFF,H.diff,"data-diff")+'</div></div></div>'+mixPanel()+'</div>'+
  tvNerdHTML(st)+
  '<div class="tvh-bar"><div class="tvh-row"><span class="tv-lab">Play as</span><div class="tv-mode" role="tablist">'+PLAY.map(([k,l])=>'<button type="button" role="tab" class="tv-mode-btn'+(play===k?" on":"")+'" data-play="'+k+'" aria-selected="'+(play===k)+'">'+l+'</button>').join("")+'</div></div>'+
  (play==="quiz"?'<p class="tvh-note">Pick a topic below, or a part of one.</p>':play==="speed"?'<p class="tvh-note">Sixty seconds, four choices a question. A wrong answer only costs you time.</p>':'<p class="tvh-note">Flashcards are for practice: no stamps and no scores.</p>')+'</div>'+
  '<h2 class="tvh-h">Quizzes</h2><div class="tvh-grid">'+SECTIONS.map(tile).join("")+(play==="quiz"?'<button type="button" class="tvh-tile tvh-custom" id="tvhCustom"><b>＋ Custom mix</b><small>Your own choice of topics, or questions by continent</small></button>':'')+'</div>'+
  (facts?'<h2 class="tvh-h">Country facts'+(play==="quiz"?'<span class="tvh-ans"><span class="tv-lab">Answer</span><button type="button" class="chip'+(DS.style!=="type"?" active":"")+'" data-sty="choice">Multiple choice</button><button type="button" class="chip'+(DS.style==="type"?" active":"")+'" data-sty="type">Fill in the blank</button></span>':'')+'</h2><div class="tvh-facts">'+facts+'</div>':'')+
  '</div>';
 const rr=()=>{saveStats();renderHub()};
 const g=id=>document.getElementById(id);
 if(g("tvhResume"))g("tvhResume").onclick=()=>{trivia.view="play";renderTriviaView();scrollTo(0,0)};
 if(g("tvhDrop"))g("tvhDrop").onclick=()=>{trivia.run=null;trivia.view="home";renderHub()};
 g("tvhMixGo").onclick=startMixed;
 v.querySelectorAll(".tvh-hero [data-n]").forEach(b=>b.onclick=()=>{st.count=+b.dataset.n;rr()});
 v.querySelectorAll("[data-diff]").forEach(b=>b.onclick=()=>{H.diff=+b.dataset.diff;rr()});
 v.querySelectorAll("[data-sw]").forEach(b=>b.onclick=()=>{const id=b.parentElement.dataset.s,x=+b.dataset.sw;
  /* at least one section stays on */if(x<=0&&ALL.filter(S=>S.id!==id&&secW(S.id)>0).length===0)return;H.w[id]=x;H.mixOpen=true;rr()});
 v.querySelectorAll("[data-bw]").forEach(b=>b.onclick=()=>{H.bw[b.parentElement.dataset.k]=+b.dataset.bw;H.mixOpen=true;rr()});
 v.querySelectorAll("[data-bonus]").forEach(b=>b.onclick=()=>{H.bonus=+b.dataset.bonus;H.mixOpen=true;rr()});
 const mr=g("tvhMixReset");if(mr)mr.onclick=()=>{H.w={};H.bw={};H.bonus=.05;rr()};
 const mx=v.querySelector(".tvh-mix");if(mx)mx.addEventListener("toggle",()=>{H.mixOpen=mx.open;saveStats()});
 v.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>{H.play=b.dataset.play;rr()});
 v.querySelectorAll(".tvh-go").forEach(b=>b.onclick=()=>go(b.dataset.sec));
 /* phones: a topic's parts fold away behind a small button */
 v.querySelectorAll(".tvh-more").forEach(b=>b.onclick=()=>{const t=b.closest(".tvh-tile"),o=!t.classList.contains("open");t.classList.toggle("open",o);b.setAttribute("aria-expanded",o);b.textContent=o?"Parts ▴":"Parts ▾"});
 v.querySelectorAll(".tvh-part").forEach(b=>b.onclick=()=>go(b.dataset.sec,b.dataset.key));
 v.querySelectorAll("[data-fact]").forEach(b=>b.onclick=()=>goFact(b.dataset.fact));
 v.querySelectorAll("[data-sty]").forEach(b=>b.onclick=()=>{DS.style=b.dataset.sty;rr()});
 const pv=v.querySelector("[data-pv]");if(pv)pv.onclick=()=>{DS.pv=true;st.fcMode="drills";saveStats();navSync();renderTriviaView();scrollTo(0,0)};
 const cu=g("tvhCustom");if(cu)cu.onclick=()=>{mixActive=false;H.custom=true;saveStats();renderTriviaView();scrollTo(0,0)};
 /* until 15 questions are answered, the player can say how much they already know */
 try{if((st.n||0)<15&&typeof TV_START_CHOICES!=="undefined"){const gl=tvGeneral();v.querySelector(".tvh-bar").insertAdjacentHTML("beforebegin",'<div class="tv-startlv" id="tvStartLv"><span>Where do you want to start?</span>'+TV_START_CHOICES.map(([lv,name])=>'<button type="button" class="chip'+(Math.abs(gl-lv)<.01?" active":"")+'" data-slv="'+lv+'">'+esc(name)+' <small>'+lv.toFixed(1)+'</small></button>').join("")+'<em>You can change this until you’ve answered 15 questions; after that the questions follow how you do.</em></div>');
  v.querySelectorAll("[data-slv]").forEach(b=>b.onclick=()=>{st.g=+b.dataset.slv;rr()})}}catch(e){console.error(e)}
 try{skpRender()}catch(e){}}
/* the Trivia page: the menu, or the old picker for a custom mix (with a way back) */
{const _h=renderTriviaHome;renderTriviaHome=function(){const H=hub();if(!H.custom)return renderHub();mixActive=false;const r=_h.apply(this,arguments);
 try{const w=document.querySelector("#triviaView .tv-wrap");if(w&&!document.getElementById("tvhBack")){w.insertAdjacentHTML("afterbegin",'<button type="button" class="chip tvh-back" id="tvhBack">← All quizzes</button>');document.getElementById("tvhBack").onclick=()=>{H.custom=false;saveStats();renderTriviaView()}}}catch(e){}return r}}
/* during a quiz: "← Trivia" (the quiz waits), "End round" without counting the open question, quick difficulty nudges, the bonus tally */
function toast(msg){let t=document.getElementById("tvhToast");if(!t){t=document.createElement("div");t.id="tvhToast";t.className="tvh-toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2200)}
{const _p=renderTriviaPlay;renderTriviaPlay=function(){const r=_p.apply(this,arguments);try{const v=document.getElementById("triviaView"),bar=v&&v.querySelector(".tv-bar"),run=trivia.run;if(!bar||!run)return r;
 bar.insertAdjacentHTML("afterbegin",'<button type="button" class="chip tvh-pause" id="tvhPause" title="Back to the Trivia page; this quiz waits for you">← Trivia</button>');
 document.getElementById("tvhPause").onclick=()=>{trivia.view="home";renderTriviaView();scrollTo(0,0)};
 if(run.bonus)bar.insertAdjacentHTML("beforeend",'<span class="tvh-btally">★ bonus <b>+'+(run.bonus%1?run.bonus.toFixed(1):run.bonus)+'</b></span>');
 const q=document.getElementById("tvQuit");if(q){const orig=q.onclick;q.onclick=e=>{if(trivia.answered||!run.items.length)return orig&&orig.call(q,e);
  /* the open question is simply left out */if(run.idx===0){trivia.run=null;trivia.view="home";return renderTriviaView()}run.items.pop();run.total=run.idx;trivia.view="done";renderTriviaView()}}
 const H=hub(),card=v.querySelector(".tv-qcard");if(card&&!v.querySelector(".tvh-nudge")){card.insertAdjacentHTML("afterend",'<div class="tvh-nudge"><button type="button" class="tv-link" data-nudge="-1">Too hard?</button> · <button type="button" class="tv-link" data-nudge="1">Too easy?</button></div>');
  v.querySelectorAll("[data-nudge]").forEach(b=>b.onclick=()=>{const d=+b.dataset.nudge;H.diff=Math.max(-1.5,Math.min(1.5,(H.diff||0)+d*.5));saveStats();toast(d>0?"The next questions will be a little harder.":"The next questions will be a little easier.")})}}catch(e){console.error(e)}return r}}
{const _d=renderTriviaDone;renderTriviaDone=function(){const r=_d.apply(this,arguments);try{const v=document.getElementById("triviaView"),w=v&&v.querySelector(".tv-wrap"),run=trivia.run;if(!w)return r;
 w.insertAdjacentHTML("afterbegin",'<button type="button" class="chip tvh-back" id="tvhDone">← Trivia</button>');document.getElementById("tvhDone").onclick=()=>{trivia.run=null;trivia.view="home";renderTriviaView();scrollTo(0,0)};
 if(run&&run.bonus){const h=w.querySelector("h2,.tv-score,.tv-done-score");const html='<p class="tvh-bdone">★ Bonus questions: <b>+'+(run.bonus%1?run.bonus.toFixed(1):run.bonus)+'</b></p>';if(h)h.insertAdjacentHTML("afterend",html);else w.insertAdjacentHTML("beforeend",html)}}catch(e){console.error(e)}return r}}
/* ---------- bonus questions ---------- */
const BONUS_KINDS={classic:["photo","flagpie"],geo:["photo","flagpie","scramble","pop"],nature:["peak","photo"],culture:["lang","photo"],history:[],poleco:["flagpie"]};
const ALL_KINDS=["photo","flagpie","scramble","pop","peak","lang"];
function kindsFor(run){const k=run.mix?ALL_KINDS:(BONUS_KINDS[run.sec]||[]);return k.filter(x=>x!=="lang"||window.gfLangId).filter(x=>x!=="photo"||window.gfGeoGuess).filter(x=>x!=="flagpie"||typeof FLAGPIE_PIES!=="undefined")}
{const _t=triviaNext;triviaNext=function(){try{const run=trivia.run,H=hub();
 if(run&&!run.fixed&&run.idx>=1&&run.idx+1<run.total&&!run._inBonus){const ks=kindsFor(run),p=run.mix?H.bonus:Math.min(H.bonus,.05);
  if(ks.length&&p>0&&(run.idx-(run._lastB==null?-9:run._lastB))>=3&&Math.random()<p){run._lastB=run.idx;const self=this,args=arguments;return showBonus(ks[Math.floor(Math.random()*ks.length)],run,()=>_t.apply(self,args))}}}catch(e){console.error(e)}return _t.apply(this,arguments)}}
const cname=c=>(COUNTRY_BY_CODE[c]||{}).n||c;
function sameRegion(c,n,pool){const r=(COUNTRY_BY_CODE[c]||{}).r;const near=shuffle((pool||COUNTRIES.map(x=>x.c)).filter(x=>x!==c&&COUNTRY_BY_CODE[x]&&COUNTRY_BY_CODE[x].r===r));const far=shuffle((pool||COUNTRIES.map(x=>x.c)).filter(x=>x!==c&&!near.includes(x)));return near.concat(far).slice(0,n)}
let PHOTOS=null;function photos(){if(PHOTOS)return PHOTOS;PHOTOS=[];try{const F=projFeatures();(gfGeoGuess.pool()||[]).forEach(p=>{const P=PS_PHOTO_DATA[p.i];if(!P||!P.d)return;let c=null;for(const f of F){if(f.geometry&&d3.geoContains(f,p.at)){c=f.properties.c;break}}if(c&&COUNTRY_BY_CODE[c])PHOTOS.push({i:p.i,c,label:p.label})})}catch(e){console.error(e)}return PHOTOS}
function showBonus(kind,run,cont){const v=document.getElementById("triviaView");if(!v)return cont();run._inBonus=true;
 v.innerHTML='<div class="tv-wrap tv-play tvh-bonus"><div class="tv-bar"><button type="button" class="chip tvh-pause" id="tvhBPause">← Trivia</button><span class="tvh-bstar">★ Bonus question</span><span>Score <b>'+(run.score%1?run.score.toFixed(1):run.score)+'</b>'+(run.bonus?' · bonus +'+run.bonus:'')+'</span><button type="button" class="tv-link" id="tvhBSkip">Skip</button></div><div class="tvh-bbox" id="tvhBBox"></div></div>';
 const box=document.getElementById("tvhBBox");let done=false;
 const finish=pts=>{if(done)return;done=true;run._inBonus=false;if(pts)run.bonus=(run.bonus||0)+pts;cont()};
 document.getElementById("tvhBSkip").onclick=()=>finish(0);
 /* leaving during a bonus: the quiz waits on the question just answered */
 document.getElementById("tvhBPause").onclick=()=>{run._inBonus=false;trivia.view="home";renderTriviaView();scrollTo(0,0)};
 try{BONUS_DO[kind](box,finish)}catch(e){console.error(e);finish(0)}}
/* a question with four buttons; ok(i) says whether option i is right */
function mc(box,headHTML,opts,ok,explain,finish){let picked=-1;const draw=()=>{box.innerHTML='<div class="tv-card tvh-bcard">'+headHTML+'<div class="tvh-bopts">'+opts.map((o,i)=>{let c="";if(picked>=0){if(ok(i))c=" ok";else if(i===picked)c=" no"}return'<button type="button" class="tvh-bo'+c+'" data-i="'+i+'"'+(picked>=0?" disabled":"")+'><kbd>'+(i+1)+'</kbd>'+o+'</button>'}).join("")+'</div>'+
  (picked>=0?'<div class="tvh-bfb '+(ok(picked)?"ok":"no")+'"><b>'+(ok(picked)?"Right! +1 bonus":"Not this time.")+'</b> '+explain+'</div><div class="tv-actions"><button type="button" class="tv-go" id="tvhBNext">Continue →</button></div>':'')+'</div>';
  box.querySelectorAll(".tvh-bo").forEach(b=>b.onclick=()=>{if(picked>=0)return;picked=+b.dataset.i;draw()});const n=box.querySelector("#tvhBNext");if(n){n.focus({preventScroll:true});n.onclick=()=>finish(ok(picked)?1:0)}};draw();
 keyHandler=k=>{if(picked<0&&/^[1-4]$/.test(k)){const b=box.querySelectorAll(".tvh-bo")[+k-1];if(b){b.click();return true}}if(picked>=0&&k==="Enter"){const n=box.querySelector("#tvhBNext");if(n){n.click();return true}}return false}}
let keyHandler=null;
document.addEventListener("keydown",e=>{if(!keyHandler||!document.querySelector(".tvh-bonus"))return;if(e.target&&/input|textarea/i.test(e.target.tagName))return;if(keyHandler(e.key)){e.preventDefault();e.stopPropagation()}},true);
const fmtN=n=>n>=1e9?(n/1e9).toFixed(n>=1e10?0:1)+" billion":n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+" million":n>=1e3?Math.round(n/1e3)+" thousand":String(Math.round(n));
/* guess the number: a slider; full point within 15% (population) or 7% (heights), half within 40% / 15% */
function guess(box,headHTML,o,finish){let val=o.start,done=false,pts=0;const draw=()=>{const sv=o.toSlider(val);box.innerHTML='<div class="tv-card tvh-bcard">'+headHTML+
  '<div class="tvh-guess"><output>'+esc(o.fmt(val))+'</output><input type="range" min="0" max="1000" step="1" value="'+Math.round(sv*1000)+'"'+(done?" disabled":"")+' aria-label="Your guess"></div>'+
  (done?'<div class="tvh-bfb '+(pts?"ok":"no")+'"><b>'+(pts===1?"Spot on! +1 bonus":pts?"Close enough: +½ bonus":"Not close this time.")+'</b> The answer is '+esc(o.fmt(o.answer))+'. '+(o.note||"")+'</div><div class="tv-actions"><button type="button" class="tv-go" id="tvhBNext">Continue →</button></div>':
   '<div class="tv-actions"><button type="button" class="tv-go" id="tvhBLock">Lock it in</button></div>')+'</div>';
  const r=box.querySelector("input[type=range]"),out=box.querySelector("output");if(r&&!done)r.oninput=()=>{val=o.fromSlider(+r.value/1000);out.textContent=o.fmt(val)};
  const l=box.querySelector("#tvhBLock");if(l)l.onclick=()=>{done=true;pts=o.score(val);draw()};const n=box.querySelector("#tvhBNext");if(n){n.focus({preventScroll:true});n.onclick=()=>finish(pts)}};draw();
 keyHandler=k=>{if(k==="Enter"){const b=box.querySelector("#tvhBNext,#tvhBLock");if(b){b.click();return true}}return false}}
const BONUS_DO={
 photo(box,finish){const P=photos();if(!P.length)return finish(0);const p=P[Math.floor(Math.random()*P.length)],D=PS_PHOTO_DATA[p.i];const opts=shuffle([p.c].concat(sameRegion(p.c,3)));
  mc(box,'<div class="tv-card-meta"><span>★ Bonus · Where is this?</span></div><div class="tv-q">Which country is this?</div><figure class="tvh-bphoto"><img src="'+gfSrc(D.d)+'" alt="A photo somewhere in the world"><figcaption>'+esc(D.by||"")+(D.lic?" · "+esc(D.lic):"")+'</figcaption></figure>',
   opts.map(c=>'<img class="tvh-bflag" src="'+flagUrl(c,"w40")+'" alt="">'+esc(cname(c))),i=>opts[i]===p.c,esc(p.label?p.label+", ":"")+esc(cname(p.c))+".",finish)},
 flagpie(box,finish){const codes=Object.keys(FLAGPIE_PIES).filter(c=>COUNTRY_BY_CODE[c]&&(FLAGPIE_PIES[c]||[]).filter(x=>x[1]>=.5).length>=2);const c=codes[Math.floor(Math.random()*codes.length)];const opts=shuffle([c].concat(sameRegion(c,3,codes)));
  mc(box,'<div class="tv-card-meta"><span>★ Bonus · Flag pie</span></div><div class="tv-q">These are the colours of a flag, by share. Whose flag?</div><div class="tvh-bpie">'+fpPieSVG(c,170)+'</div>',
   opts.map(x=>esc(cname(x))),i=>opts[i]===c,'<img class="tvh-bflag lg" src="'+flagUrl(c,"w160")+'" alt=""> '+esc(cname(c))+'.',finish)},
 scramble(box,finish){const L=COUNTRIES.filter(x=>/^[A-Za-z ]{5,13}$/.test(x.n)&&x.n.split(" ").length<=2);const C=L[Math.floor(Math.random()*L.length)];let mix;do{mix=shuffle(C.n.toUpperCase().replace(/ /g,"").split("")).join("")}while(mix===C.n.toUpperCase().replace(/ /g,""));
  let done=false,ok=false;const norm=s=>String(s||"").toLowerCase().replace(/[^a-z]/g,"");
  const draw=()=>{box.innerHTML='<div class="tv-card tvh-bcard"><div class="tv-card-meta"><span>★ Bonus · Scramble</span></div><div class="tv-q">Unscramble the country</div><div class="tvh-tiles">'+mix.split("").map(ch=>'<span>'+ch+'</span>').join("")+'</div>'+
   (done?'<div class="tvh-bfb '+(ok?"ok":"no")+'"><b>'+(ok?"Right! +1 bonus":"It was "+esc(C.n)+".")+'</b> <img class="tvh-bflag" src="'+flagUrl(C.c,"w40")+'" alt=""></div><div class="tv-actions"><button type="button" class="tv-go" id="tvhBNext">Continue →</button></div>':
    '<div class="tvh-btype"><input id="tvhBIn" class="type-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the country…"><button type="button" class="tv-go" id="tvhBOk">Check</button><button type="button" class="tv-link" id="tvhBGive">Give up</button></div>')+'</div>';
   const i=box.querySelector("#tvhBIn");if(i){i.focus({preventScroll:true});const check=()=>{if(!i.value.trim())return;ok=norm(i.value)===norm(C.n);done=true;draw()};i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();e.stopPropagation();check()}};box.querySelector("#tvhBOk").onclick=check;box.querySelector("#tvhBGive").onclick=()=>{done=true;ok=false;draw()}}
   const n=box.querySelector("#tvhBNext");if(n){n.focus({preventScroll:true});n.onclick=()=>finish(ok?1:0)}};draw();
  keyHandler=k=>{if(k==="Enter"&&done){const n=box.querySelector("#tvhBNext");if(n){n.click();return true}}return false}},
 pop(box,finish){const L=COUNTRIES.filter(x=>COUNTRY_POPULATION[x.c]>=1e6);const C=L[Math.floor(Math.random()*L.length)],ans=COUNTRY_POPULATION[C.c];const lo=5.5,hi=9.3;
  guess(box,'<div class="tv-card-meta"><span>★ Bonus · Close enough</span></div><div class="tv-q">How many people live in '+esc(C.n)+'?</div><img class="tvh-bflag lg" src="'+flagUrl(C.c,"w160")+'" alt="">',
   {start:Math.pow(10,7),answer:ans,fmt:fmtN,toSlider:x=>(Math.log10(x)-lo)/(hi-lo),fromSlider:s=>Math.pow(10,lo+s*(hi-lo)),score:g=>{const e=Math.abs(Math.log(g/ans));return e<=Math.log(1.15)?1:e<=Math.log(1.4)?.5:0}},finish)},
 peak(box,finish){const L=((typeof LANDFORM_DATA!=="undefined"&&LANDFORM_DATA.peaks)||[]).filter(p=>p[4]<=2&&p[1]>500);if(!L.length)return finish(0);const p=L[Math.floor(Math.random()*L.length)],ans=p[1];
  guess(box,'<div class="tv-card-meta"><span>★ Bonus · Close enough</span></div><div class="tv-q">How high is '+esc(p[0])+'?</div>',
   {start:3000,answer:ans,fmt:x=>Math.round(x/10)*10+" m",toSlider:x=>x/9000,fromSlider:s=>s*9000,score:g=>{const e=Math.abs(g-ans)/ans;return e<=.07?1:e<=.15?.5:0},note:"(Mount Everest, the highest, is 8,849 m.)"},finish)},
 lang(box,finish){const h=gfLangId.one(box,pts=>finish(pts),hub().diff>0?"all":"easy");keyHandler=k=>h.key(k)}};
window.gfTriviaBonus={kinds:ALL_KINDS,show:(k,run,cont)=>showBonus(k,run||trivia.run,cont||(()=>{}))};
/* a "← Trivia" button on the flashcards and speed-round screens, which no longer have tabs of their own */
function backBtn(){const v=document.getElementById("triviaView");if(!v||document.getElementById("tvhHome"))return;const b=document.createElement("button");b.type="button";b.className="chip tvh-back";b.id="tvhHome";b.textContent="← Trivia";
 b.onclick=()=>{try{clearInterval(ts.timer);ts.state="setup"}catch(e){}const st=triviaState();st.fcMode="quiz";saveStats();navSync();renderTriviaView()};v.prepend(b)}
{const _f=renderFlashcards;renderFlashcards=function(){const r=_f.apply(this,arguments);try{backBtn()}catch(e){}return r}}
{const _t=tsRender;tsRender=function(){const st=triviaState();
 /* "Change topic" now means back to the Trivia page */
 if(ts.state==="setup"&&st.fcMode==="speed"){st.fcMode="quiz";saveStats();navSync();return renderTriviaView()}
 const r=_t.apply(this,arguments);try{const b=document.getElementById("tsBack");if(b)b.textContent="← Trivia";backBtn()}catch(e){}return r}}
/* tabs: Trivia, Lists and Jeopardy. Old Library / Drills / Flashcards / Speed Round states open the Trivia page */
{const _rv=renderTriviaView;renderTriviaView=function(){try{const st=triviaState();if(st.fcMode==="library"){st.fcMode="quiz"}if(st.fcMode==="speed"&&ts.state==="setup")st.fcMode="quiz"}catch(e){}return _rv.apply(this,arguments)}}
{const _w=wireTvAppModeSwitch;wireTvAppModeSwitch=function(n){const r=_w.apply(this,arguments);try{const m=triviaState().fcMode;if(["cards","speed","drills","library"].includes(m))n.querySelectorAll("[data-appmode]").forEach(b=>b.classList.toggle("active",b.dataset.appmode==="quiz"));
 /* the Trivia tab always leads to the Trivia page; a quiz in progress waits */
 const q=n.querySelector('[data-appmode="quiz"]');if(q){const o=q.onclick;q.onclick=()=>{const H=hub();H.custom=false;try{clearInterval(ts.timer);ts.state="setup"}catch(e){}try{if(trivia.view==="play"||trivia.view==="done"){if(trivia.view==="done")trivia.run=null;trivia.view="home"}}catch(e){}if(typeof o==="function")o()}}}catch(e){}return r}}
const css=document.createElement("style");css.textContent=`
#triviaView [data-appmode="library"], [data-appmode="library"].tab-btn, [data-appmode="drills"].tab-btn, [data-appmode="cards"].tab-btn, [data-appmode="speed"].tab-btn{ display:none !important; }
.tvh-resume{ display:flex; flex-wrap:wrap; align-items:center; gap:10px 14px; background:#fff6e8; border:1.5px solid #f0c27a; border-radius:18px; padding:10px 14px; margin:6px 0 12px; } .tvh-resume .tv-go{ padding:8px 16px; font-size:14px; }
.tvh-hero{ background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,244,230,.9)); border-radius:24px; padding:16px; margin:6px 0 14px; box-shadow:0 6px 22px rgba(20,40,70,.08); }
.tvh-herorow{ display:flex; flex-wrap:wrap; align-items:center; gap:14px 22px; }
.tvh-mixgo{ font-size:19px !important; padding:14px 24px !important; display:flex; flex-direction:column; align-items:flex-start; line-height:1.15; } .tvh-mixgo small{ font-size:12px; font-weight:600; opacity:.85; }
.tvh-heroopts{ display:flex; flex-direction:column; gap:8px; flex:1; min-width:250px; }
.tvh-seg{ display:inline-flex; border:1px solid rgba(0,0,0,.14); border-radius:999px; overflow:hidden; background:#fff; } .tvh-seg button{ border:0; background:none; padding:5px 11px; font:600 12.5px inherit; cursor:pointer; color:inherit; } .tvh-seg button.on{ background:var(--mc,#e8701a); color:#fff; }
.tvh-mix{ margin-top:12px; } .tvh-mix > summary{ cursor:pointer; font-weight:800; font-size:14px; list-style:none; display:inline-flex; gap:6px; align-items:center; } .tvh-mix > summary::before{ content:"▸"; transition:transform .2s; } .tvh-mix[open] > summary::before{ transform:rotate(90deg); } .tvh-mix summary em{ font-style:normal; font-size:11px; background:#f0c27a; border-radius:999px; padding:1px 8px; }
.tvh-mixbody{ display:grid; gap:6px; margin-top:10px; } .tvh-mrow{ background:color-mix(in srgb, var(--tf,#ddd) 18%, #fff); border-radius:14px; padding:6px 10px; } .tvh-mhead{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px; }
.tvh-mname{ display:flex; align-items:center; gap:8px; font-weight:700; font-size:14px; } .tvh-mname small{ font-weight:500; opacity:.65; font-size:11.5px; } .tvh-mname .tv-icon-wrap{ width:26px; height:26px; border-radius:8px; display:grid; place-items:center; background:var(--tf,#ddd); color:var(--td,#333); } .tvh-mname .tv-icon{ width:16px; height:16px; }
.tvh-mparts summary{ cursor:pointer; font-size:12px; font-weight:700; opacity:.75; margin:4px 0 0 34px; } .tvh-mpart{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:4px; margin:4px 0 0 34px; font-size:13px; } .tvh-mpart .tvh-seg button{ padding:3px 8px; font-size:11.5px; }
.tvh-bonusrow{ background:#fff8e6; } .tvh-mnote{ font-size:12px; opacity:.7; margin:4px 2px 0; }
.tvh .tvh-bar{ display:flex; flex-wrap:wrap; gap:10px 22px; align-items:center; justify-content:space-between; background:rgba(255,255,255,.72); border-radius:20px; padding:12px 16px; margin:14px 0 6px; box-shadow:0 3px 14px rgba(20,40,70,.06); }
.tvh-row{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; } .tvh-row .tv-lab{ margin-right:4px; min-width:76px; } .tvh-note{ margin:0; font-size:13px; opacity:.75; }
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
.tvh-back{ margin:4px 0 8px; } .tvh-pause{ padding:4px 12px !important; font-size:13px !important; margin-right:4px; }
.tvh-nudge{ text-align:center; font-size:12.5px; opacity:.75; margin:6px 0 0; } .tvh-btally{ font-size:13px; color:#b0700a; }
.tvh-toast{ position:fixed; left:50%; bottom:24px; transform:translate(-50%,20px); background:#1f2a33; color:#fff; padding:9px 16px; border-radius:999px; font-size:14px; opacity:0; pointer-events:none; transition:.25s; z-index:9999; } .tvh-toast.on{ opacity:1; transform:translate(-50%,0); }
.tvh-bstar{ color:#b0700a; font-weight:800; } .tvh-bcard{ text-align:center; } .tvh-bcard .tv-q{ margin:6px 0 12px; }
.tvh-bopts{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:10px 0; } .tvh-bo{ display:flex; align-items:center; gap:8px; border:1.5px solid rgba(0,0,0,.12); background:#fff; border-radius:14px; padding:11px 12px; font:600 15px inherit; cursor:pointer; text-align:left; color:inherit; }
.tvh-bo kbd{ font-size:11px; opacity:.5; } .tvh-bo.ok{ background:#dff3df; border-color:#3fae4a; } .tvh-bo.no{ background:#fbe1e1; border-color:#d0453f; }
.tvh-bflag{ width:26px; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,.2); vertical-align:middle; } .tvh-bflag.lg{ width:120px; margin:4px auto 8px; display:block; }
.tvh-bfb{ margin:8px auto; max-width:560px; padding:10px 12px; border-radius:12px; text-align:left; } .tvh-bfb.ok{ background:#e6f5e6; } .tvh-bfb.no{ background:#fbe8e8; } .tvh-bfb .tvh-bflag.lg{ display:inline-block; width:60px; margin:0 6px 0 0; vertical-align:middle; }
.tvh-bphoto{ margin:0 auto; max-width:620px; } .tvh-bphoto img{ width:100%; max-height:360px; object-fit:cover; border-radius:14px; display:block; } .tvh-bphoto figcaption{ font-size:11px; opacity:.6; margin-top:3px; text-align:right; }
.tvh-bpie{ display:flex; justify-content:center; margin:4px 0 8px; } .tvh-bpie svg{ width:170px; height:170px; filter:drop-shadow(0 3px 8px rgba(0,0,0,.18)); }
.tvh-tiles{ display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin:6px 0 12px; } .tvh-tiles span{ width:38px; height:44px; display:grid; place-items:center; border-radius:9px; background:#fff3d6; border:1.5px solid #e9c779; font:800 20px inherit; box-shadow:0 2px 0 #e9c779; }
.tvh-btype{ display:flex; flex-wrap:wrap; justify-content:center; gap:8px; align-items:center; } .tvh-btype input{ max-width:300px; }
.tvh-guess{ max-width:520px; margin:6px auto 4px; } .tvh-guess output{ display:block; font:800 26px inherit; margin-bottom:8px; } .tvh-guess input{ width:100%; accent-color:#e8701a; }
body.sky-night .tvh-hero, body.dark-theme .tvh-hero{ background:rgba(30,34,60,.9); } body.sky-night .tvh-mrow, body.dark-theme .tvh-mrow{ background:rgba(255,255,255,.06); } body.sky-night .tvh-seg, body.dark-theme .tvh-seg, body.sky-night .tvh-bo, body.dark-theme .tvh-bo{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.15); }
body.sky-night .tvh-resume, body.dark-theme .tvh-resume{ background:rgba(240,194,122,.12); }
body.sky-night .tvh .tvh-bar, body.dark-theme .tvh .tvh-bar, body.sky-night .tvh-fact, body.dark-theme .tvh-fact{ background:rgba(30,34,60,.85); }
body.sky-night .tvh-tile, body.dark-theme .tvh-tile{ background:color-mix(in srgb, var(--tf,#444) 16%, rgba(30,34,60,.9)); } body.sky-night .tvh-part, body.dark-theme .tvh-part{ background:rgba(255,255,255,.06); }
.tvh-more{ display:none; }
/* phones: everything compact, two topics a row, parts folded away */
@media (max-width:640px){
 .tvh.tv-wrap{ padding-left:10px; padding-right:10px; }
 .tvh-hero{ padding:12px; } .tvh-mixgo{ width:100%; align-items:center !important; } .tvh-heroopts{ min-width:0; width:100%; }
 .tvh-heroopts .tvh-row{ flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; } .tvh-heroopts .tvh-row::-webkit-scrollbar{ display:none; } .tvh-heroopts .tvh-row > *{ flex:none; } .tvh-row .tv-lab{ min-width:0; }
 .tvh-mpart, .tvh-mparts summary{ margin-left:0; } .tvh-seg button{ padding:5px 8px; font-size:11.5px; }
 .tvh .tv-nerd{ padding:12px 14px; } .tvh .tv-nerd-num{ font-size:34px !important; } .tvh .tv-nerd-main{ gap:12px; } .tvh .tv-nerd-foot{ font-size:11px; } .tvh .tv-nerd-foot .tv-muted, .tvh .tv-nerd-foot small{ display:none; }
 .tvh .tv-startlv{ display:flex; flex-wrap:nowrap; justify-content:flex-start !important; overflow-x:auto; gap:6px; padding:10px 12px; align-items:center; scrollbar-width:none; } .tvh .tv-startlv::-webkit-scrollbar{ display:none; }
 .tvh .tv-startlv > span{ flex:none; font-size:13px; } .tvh .tv-startlv .chip{ flex:none; } .tvh .tv-startlv em{ display:none; }
 .tvh .tvh-bar{ padding:10px; gap:8px; margin-top:10px; } .tvh-bar .tvh-row{ width:100%; flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; } .tvh-bar .tvh-row::-webkit-scrollbar{ display:none; }
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
 .tvh-bopts{ grid-template-columns:1fr; } .tvh-pause{ order:-1; }
}`;
document.head.appendChild(css);
})();
