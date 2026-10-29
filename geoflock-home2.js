/* GeoFlock: the Home page's "Today" row, three bigger cards.
   1. Where is this? A wallpaper-sized photo of the day (from the country photo set, GF_WALL.game) to guess at once, four countries to pick from.
   2. Country of the day: its photo, flag, a line of facts and one piece of trivia.
   3. Daily quests: today's Daily 5 first, then the day's quests with their progress.
   hiRender (index.html) calls hiToday2() for the row and hiToday2Wire() once the page is in place. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const T=f=>{try{return f()}catch(e){return null}};
const dayNum=()=>T(()=>v4DayNum())||Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const src=d=>T(()=>gfSrc(d))||d;
function wallPhoto(f){const W=window.GF_WALL;if(!W)return null;return W.photos.find(p=>p.f===f)||null}
const nameOf=c=>T(()=>COUNTRIES.find(x=>x.c===c).n)||c;
/* today's photo and its four choices (the right country and three from the same region) */
let GQ=null;
function guessToday(){const day=dayNum();if(GQ&&GQ.day===day)return GQ;const W=window.GF_WALL;if(!W||!W.game||!W.game.length)return null;
 const r=rng(day*7919+13);let g=null;for(let k=0;k<20&&!g;k++){const c=W.game[Math.floor(r()*W.game.length)];if(wallPhoto(c[2])&&T(()=>COUNTRIES.find(x=>x.c===c[4])))g=c}if(!g)return null;
 const P=wallPhoto(g[2]),me=T(()=>COUNTRIES.find(x=>x.c===g[4]));
 const same=T(()=>COUNTRIES.filter(x=>x.c!==g[4]&&x.r===me.r))||[],all=T(()=>COUNTRIES.filter(x=>x.c!==g[4]))||[];
 const pick=[];const from=same.length>=3?same:all;while(pick.length<3&&from.length){const x=from[Math.floor(r()*from.length)];if(!pick.includes(x.c))pick.push(x.c)}
 const opts=[g[4],...pick];for(let i=opts.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
 GQ={day,c:g[4],cap:g[3],at:[g[0],g[1]],src:src(P.d),by:P.by||"",lic:P.lic||"",opts};return GQ}
function guessState(){const S=T(()=>stats);const day=dayNum();const h=S&&S.homeGuess;return h&&h.day===day?h.pick:null}
function guessHTML(){const G=guessToday();if(!G)return"";const p=guessState(),done=p!=null,ok=done&&p===G.c;
 const cr=[G.by,G.lic].filter(Boolean).join(" · ");
 return'<div class="h2-card h2-guess'+(done?" done":"")+'"><img class="h2-guess-img" src="'+esc(G.src)+'" alt="Today’s photo: where is this?" loading="lazy">'+
  '<div class="h2-guess-top"><span class="h2-tag">📷 Where is this?</span><span class="h2-cr" title="Photo: '+esc(cr||"Wikimedia Commons")+'">ⓘ</span></div>'+
  '<div class="h2-guess-foot">'+(done?'<div class="h2-guess-res"><b>'+(ok?"✓ Right! ":"✗ It’s ")+(ok?"":esc(nameOf(G.c))+". ")+'</b><span>'+esc(G.cap)+'</span></div>':'<div class="h2-guess-q">Guess today’s photo</div>')+
  '<div class="h2-opts">'+G.opts.map(c=>'<button type="button" data-hg="'+c+'"'+(done?" disabled":"")+' class="'+(done&&c===G.c?"ok":done&&c===p?"no":"")+'"><img src="'+esc(T(()=>flagUrl(c,"w40"))||"")+'" alt="">'+esc(nameOf(c))+'</button>').join("")+'</div>'+
  (done?'<button type="button" class="h2-more" data-hgmore>Play today’s five photos →</button>':'')+'</div></div>'}
/* country of the day */
function codHTML(cod){if(!cod)return"";const p=T(()=>COUNTRY_PROFILES[cod.c])||{};const W=window.GF_WALL;
 const pr=W&&W.profile&&W.profile.find(x=>x[0]===cod.c),P=pr&&wallPhoto(pr[1]);
 const facts=Array.isArray(p.trivia)?p.trivia:[],fact=facts.length?facts[Math.floor(Date.now()/864e5)%facts.length]:"";
 const line=[p.capital?"Capital "+p.capital:"",p.subregion||p.continent||"",p.population?p.population+" people":""].filter(Boolean).join(" · ");
 return'<button type="button" class="h2-card h2-cod" id="hiCod">'+(P?'<span class="h2-cod-ph"><img src="'+esc(src(P.d))+'" alt="" loading="lazy"></span>':'<span class="h2-cod-ph none"></span>')+
  '<span class="h2-cod-body"><span class="h2-cod-h"><img class="h2-cod-flag" src="'+esc(T(()=>flagUrl(cod.c,"w160"))||"")+'" alt=""><span><small>Country of the day</small><b>'+esc(cod.n)+'</b></span></span>'+
  (line?'<span class="h2-cod-line">'+esc(line)+'</span>':'')+(fact?'<span class="h2-cod-fact">'+esc(fact)+'</span>':'')+'<span class="h2-link">Open its profile →</span></span></button>'}
/* daily quests, the Daily 5 first */
function questsHTML(q,d5done){const rows=[];
 rows.push('<button type="button" class="h2-q'+(d5done?" ok":"")+'" id="hiD5"><span class="h2-q-ic d5">5</span><span class="h2-q-t"><b>Daily 5</b><small>'+(d5done?"Done today":"Five quick questions, new every day")+'</small></span><span class="h2-q-st">'+(d5done?"✓":"Play")+'</span></button>');
 (q.ids||[]).filter(id=>id!=="d5").forEach(id=>{const Q=T(()=>QUESTS.find(x=>x.id===id));if(!Q)return;const done=(q.done||[]).includes(id),n=done?Q.n:(T(()=>questProgress(Q))||0);
  rows.push('<button type="button" class="h2-q'+(done?" ok":"")+'" data-hq="'+esc(id)+'"><span class="h2-q-ic">'+(done?"✓":"★")+'</span><span class="h2-q-t"><b>'+esc(Q.text)+'</b><i><u style="width:'+Math.round(100*n/Math.max(1,Q.n))+'%"></u></i></span><span class="h2-q-n">'+n+'/'+Q.n+'</span></button>')});
 const dn=(q.done||[]).length,tot=(q.ids||[]).length||3;
 return'<div class="h2-card h2-quests"><div class="h2-quests-h"><b>Daily quests</b><button type="button" id="hiQuests" class="h2-link">'+dn+'/'+tot+' done · details</button></div>'+rows.join("")+'<small class="h2-quests-f">New quests and a new Daily 5 every day</small></div>'}
/* tour of the day: one guided tour picked for today (the same for everyone), preferring ones not finished yet */
function todTour(){try{const S=window.gfTourShelves||[],ids=[];S.forEach(r=>{if(r[0]==="books")return;r[3].forEach(id=>{const T=PS_TOURS[id];if(T&&T.group!=="_retired"&&(T.steps||[]).length>4&&!ids.includes(id))ids.push(id)})});if(!ids.length)return null;
 const r=rng(dayNum()*104729+7),order=ids.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 const done=id=>{try{const o=(stats.tourProg||{})[id];return!!(o&&o.done)}catch(e){return false}};return order.find(id=>!done(id))||order[0]}catch(e){return null}}
function todHTML(){const id=todTour();if(!id)return"";const T=PS_TOURS[id],cov=T&&(TOUR_THUMBS[id]||""),sh=(window.gfTourShelves||[]).find(r=>r[3].includes(id)),n=(T.steps||[]).length;
 const P=T&&(stats.tourProg||{})[id],prog=P&&P.max>0&&!P.done?" · you’re on stop "+(P.max+1):"";
 return'<button type="button" class="h2-card h2-tod" data-tod="'+esc(id)+'">'+(cov?'<span class="h2-tod-img"><img src="'+esc(cov)+'" alt="" loading="lazy"></span>':'')+
  '<span class="h2-tod-t"><small>🧭 Tour of the day'+(sh?' · '+esc(sh[1]):'')+'</small><b>'+esc((n0=>n0.charAt(0).toUpperCase()+n0.slice(1))(String(T.name||T.short).replace(/^guided tour (on|of)\s+/i,"")))+'</b><em>'+esc(T.hint||"")+'</em><span class="h2-tod-m">'+n+' stops · about '+Math.max(5,Math.round(n*0.7))+' minutes'+prog+'</span></span><span class="h2-tod-go">Start the tour →</span></button>'}
window.hiToday2=function(o){return'<div class="h2-today">'+guessHTML()+codHTML(o.cod)+questsHTML(o.q||{ids:[],done:[]},o.d5done)+'</div>'+todHTML()};
window.hiToday2Wire=function(v){
 v.querySelectorAll("[data-hg]").forEach(b=>b.onclick=()=>{const G=guessToday();if(!G||guessState()!=null)return;
  try{stats.homeGuess={day:G.day,pick:b.dataset.hg};if(b.dataset.hg===G.c&&typeof xpGain==="function")xpGain(10,"photo of the day");saveStats()}catch(e){}
  const card=v.querySelector(".h2-guess");if(card){const t=document.createElement("div");t.innerHTML=guessHTML();card.replaceWith(t.firstChild);hiToday2Wire(v)}});
 const m=v.querySelector("[data-hgmore]");if(m)m.onclick=()=>{try{if(window.gfDailyOpen)gfDailyOpen("type");else switchAppMode("games")}catch(e){}};
 /* the five stamps are buttons: say so under them */
 const row=v.querySelector(".gf-flock-row");if(row&&!v.querySelector(".gf-flock-tip"))row.insertAdjacentHTML("afterend",'<div class="gf-flock-tip">👆 Tap a stamp to start testing yourself</div>');
 v.querySelectorAll("[data-hq]").forEach(b=>b.onclick=()=>{try{questsOpen()}catch(e){}});
 v.querySelectorAll("[data-tod]").forEach(b=>b.onclick=()=>{try{psLaunchTour(b.dataset.tod)}catch(e){console.error(e)}})};
/* first-day quests: simple practice goals instead of the random mix */
(function(){try{
 if(typeof finalizeAnswer==="function"&&!finalizeAnswer._h2){const _f=finalizeAnswer;finalizeAnswer=function(){try{const m=typeof appMode!=="undefined"?appMode:"";if(m==="flag"||m==="map"||m==="capital"){const A=stats.modeAns=stats.modeAns||{};A[m]=(A[m]||0)+1}}catch(e){}return _f.apply(this,arguments)};finalizeAnswer._h2=1}
 if(typeof QUESTS!=="undefined"&&!QUESTS.find(q=>q.id==="flag10")){
  QUESTS.push({id:"flag10",text:"Answer 10 flag questions",n:10,ctr:()=>((stats.modeAns||{}).flag||0)},{id:"loc10",text:"Answer 10 location questions (find countries on the map)",n:10,ctr:()=>((stats.modeAns||{}).map||0)},
   {id:"tour5",text:"See 5 stops of a guided tour",n:5,ctr:()=>Object.values(stats.tourProg||{}).reduce((n,o)=>n+((o&&o.max)||0),0)})}
 const DAY1=["flag10","loc10","tour5"];
 function day1(){try{const t=gmDayKey();if(stats.firstQuestDay==null)stats.firstQuestDay=(stats.totalAnswered||0)<30?t:"before";return stats.firstQuestDay===t}catch(e){return false}}
 if(typeof questToday==="function"&&!questToday._h2){const _q=questToday;questToday=function(){try{const q=questState(),day=gmDayKey();
   if(day1()&&(q.day!==day||(!(q.done||[]).length&&(q.ids||[]).join()!==DAY1.join()))){q.day=day;q.ids=DAY1.slice();q.done=[];q.ev={};q.base={};q.ids.forEach(id=>{const Q=QUESTS.find(x=>x.id===id);if(Q&&Q.ctr&&!Q.abs)q.base[id]=Q.ctr()})}}catch(e){}return _q.apply(this,arguments)};questToday._h2=1}
}catch(e){console.error(e)}})();
/* "Explore the maps" opens the relief map and starts the geography tour */
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#hiMapsBtn");if(!t)return;e.preventDefault();e.stopImmediatePropagation();
 try{switchAppMode("allmaps");scrollTo({top:0});setTimeout(()=>{try{const r=document.querySelector('[data-allmaps-mode="relief"]');if(r&&!r.classList.contains("active"))r.click()}catch(er){}try{psLaunchTour("geo")}catch(er){}},150)}catch(er){console.error(er)}},true);
/* the Knowledge stamp opens Trivia: point at "Start mixed trivia" */
function nudgeMix(){let n=0;const t=setInterval(()=>{const b=document.getElementById("tvhMixGo");if(!b){if(++n>40)clearInterval(t);return}clearInterval(t);
 b.classList.add("h2-nudge");try{b.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){}
 if(!document.getElementById("h2NudgeTip")){const tip=document.createElement("div");tip.id="h2NudgeTip";tip.className="h2-nudge-tip";tip.textContent="Start here: a mix of questions from every topic";b.parentNode.style.position=b.parentNode.style.position||"relative";b.insertAdjacentElement("afterend",tip)}
 const done=()=>{b.classList.remove("h2-nudge");const tp=document.getElementById("h2NudgeTip");if(tp)tp.remove()};b.addEventListener("click",done,{once:true});setTimeout(done,9000)},150)}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest('.gf-st[data-gfgo="know"]');if(t)nudgeMix()},true);
const css=document.createElement("style");css.textContent=`
.h2-today{ display:grid; grid-template-columns:1.35fr 1fr 1fr; gap:14px; align-items:stretch; }
.h2-card{ position:relative; border-radius:20px; overflow:hidden; min-height:268px; border:1px solid rgba(255,255,255,.75); background:rgba(255,255,255,.66); box-shadow:0 4px 18px rgba(20,40,70,.07); font:inherit; color:inherit; text-align:left; }
.h2-link{ font-weight:700; font-size:12.5px; color:#1f7f78; background:none; border:0; padding:0; cursor:pointer; font-family:inherit; }
/* the photo to guess */
.h2-guess{ background:#1d2a3a; color:#fff; display:flex; flex-direction:column; justify-content:space-between; }
.h2-guess-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.h2-guess::after{ content:""; position:absolute; inset:0; background:linear-gradient(rgba(0,0,0,.35),transparent 30%,transparent 45%,rgba(0,0,0,.72)); pointer-events:none; }
.h2-guess-top,.h2-guess-foot{ position:relative; z-index:1; padding:12px 14px; }
.h2-guess-top{ display:flex; justify-content:space-between; align-items:center; }
.h2-tag{ font-weight:800; font-size:13px; background:rgba(0,0,0,.4); padding:4px 10px; border-radius:999px; backdrop-filter:blur(4px); }
.h2-cr{ width:20px; height:20px; border-radius:50%; background:rgba(0,0,0,.45); font:700 12px/20px system-ui,sans-serif; text-align:center; opacity:.7; cursor:help; }
.h2-guess-q{ font-weight:800; font-size:18px; text-shadow:0 1px 4px rgba(0,0,0,.6); margin-bottom:8px; }
.h2-guess-res{ margin-bottom:8px; text-shadow:0 1px 4px rgba(0,0,0,.6); font-size:14px; line-height:1.35; } .h2-guess-res b{ font-size:16px; }
.h2-opts{ display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.h2-opts button{ display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:12px; border:1px solid rgba(255,255,255,.55); background:rgba(255,255,255,.9); color:#16324f; font:700 13.5px/1.2 inherit; font-family:inherit; cursor:pointer; text-align:left; min-width:0; }
.h2-opts button img{ width:22px; height:15px; object-fit:cover; border-radius:2px; box-shadow:0 0 0 1px rgba(0,0,0,.12); flex:none; }
.h2-opts button:hover:not(:disabled){ background:#fff; transform:translateY(-1px); }
.h2-opts button:disabled{ cursor:default; opacity:.8; } .h2-opts button.ok{ background:#3fae4a; color:#fff; opacity:1; border-color:#3fae4a; } .h2-opts button.no{ background:#d9534f; color:#fff; opacity:1; border-color:#d9534f; }
.h2-more{ margin-top:8px; width:100%; padding:8px; border-radius:12px; border:0; background:#e8701a; color:#fff; font:800 13.5px inherit; font-family:inherit; cursor:pointer; }
/* country of the day */
.h2-cod{ display:flex; flex-direction:column; padding:0; cursor:pointer; }
.h2-cod:hover{ transform:translateY(-1px); box-shadow:0 8px 24px rgba(20,40,70,.12); }
.h2-cod-ph{ display:block; height:112px; overflow:hidden; flex:none; background:linear-gradient(135deg,#8fd1c4,#7cb4e8); } .h2-cod-ph img{ width:100%; height:100%; object-fit:cover; display:block; }
.h2-cod-body{ display:flex; flex-direction:column; gap:6px; padding:0 14px 12px; flex:1; }
.h2-cod-h{ display:flex; align-items:flex-end; gap:10px; margin-top:-18px; }
.h2-cod-flag{ width:58px; height:39px; object-fit:cover; border-radius:6px; box-shadow:0 0 0 2px #fff, 0 3px 8px rgba(0,0,0,.2); flex:none; position:relative; }
.h2-cod-h small{ display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; opacity:.6; } .h2-cod-h b{ font-size:18px; line-height:1.15; }
.h2-cod-line{ font-size:12.5px; opacity:.75; }
.h2-cod-fact{ font-size:13px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.h2-cod .h2-link{ margin-top:auto; }
/* quests */
.h2-quests{ padding:12px 14px; display:flex; flex-direction:column; gap:7px; }
.h2-quests-h{ display:flex; align-items:baseline; justify-content:space-between; } .h2-quests-h b{ font-size:16px; }
.h2-q{ display:grid; grid-template-columns:30px 1fr auto; gap:9px; align-items:center; padding:8px 10px; border-radius:14px; border:1px solid rgba(22,50,79,.08); background:rgba(255,255,255,.75); font:inherit; color:inherit; text-align:left; cursor:pointer; }
.h2-q:hover{ background:#fff; }
.h2-q-ic{ width:30px; height:30px; border-radius:10px; display:grid; place-items:center; font-weight:800; background:#fde7c8; color:#b0600f; } .h2-q-ic.d5{ background:#e8701a; color:#fff; font-size:16px; }
.h2-q.ok .h2-q-ic{ background:#3fae4a; color:#fff; }
.h2-q-t b{ display:block; font-size:13px; line-height:1.25; } .h2-q-t small{ font-size:11.5px; opacity:.7; }
.h2-q-t i{ display:block; height:5px; border-radius:3px; background:rgba(22,50,79,.1); margin-top:5px; overflow:hidden; } .h2-q-t i u{ display:block; height:100%; background:#e8a01a; text-decoration:none; }
.h2-q.ok .h2-q-t i u{ background:#3fae4a; }
.h2-q-st{ font-weight:800; font-size:12px; padding:3px 10px; border-radius:999px; background:#e8701a; color:#fff; } .h2-q.ok .h2-q-st{ background:#3fae4a; }
.h2-q-n{ font-weight:800; font-size:12px; opacity:.7; }
.h2-quests-f{ margin-top:auto; font-size:11.5px; opacity:.6; }
body.sky-night .h2-card:not(.h2-guess), body.dark-theme .h2-card:not(.h2-guess){ background:rgba(28,36,62,.72); border-color:rgba(255,255,255,.12); color:#e8ecf6; }
body.sky-night .h2-card:not(.h2-guess) :is(b,small,em,.h2-cod-line,.h2-cod-fact,.h2-q-n){ color:inherit; } body.sky-night .h2-cod-h small{ opacity:.75; }
body.sky-night .h2-q, body.dark-theme .h2-q{ background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.1); } body.sky-night .h2-q:hover{ background:rgba(255,255,255,.13); }
body.sky-night .h2-link{ color:#8fe0d6; } body.sky-night .h2-q-t i{ background:rgba(255,255,255,.12); } body.sky-night .h2-cod-flag{ box-shadow:0 0 0 2px #2a3550, 0 3px 8px rgba(0,0,0,.3); }
.gf-flock-tip{ font-size:12.5px; font-weight:700; opacity:.72; margin-top:6px; }
.h2-nudge{ animation:h2Pulse 1.1s ease-in-out infinite; } @keyframes h2Pulse{ 0%,100%{ box-shadow:0 0 0 0 rgba(232,112,26,.55); } 50%{ box-shadow:0 0 0 10px rgba(232,112,26,0); } }
.h2-nudge-tip{ display:inline-block; margin:8px 0 0 4px; padding:6px 12px; border-radius:10px; background:#16324f; color:#fff; font:700 13px/1.3 inherit; font-family:inherit; position:relative; animation:h2TipIn .3s ease-out; }
.h2-nudge-tip::before{ content:""; position:absolute; left:22px; top:-6px; border:6px solid transparent; border-top:0; border-bottom-color:#16324f; } @keyframes h2TipIn{ from{ opacity:0; transform:translateY(-4px); } }
.h2-tod{ display:grid; grid-template-columns:220px 1fr auto; gap:18px; align-items:center; width:100%; min-height:0; margin-top:14px; padding:0 18px 0 0; cursor:pointer; }
.h2-tod:hover{ transform:translateY(-1px); box-shadow:0 8px 24px rgba(20,40,70,.12); }
.h2-tod-img{ display:block; height:124px; overflow:hidden; } .h2-tod-img img{ width:100%; height:100%; object-fit:cover; display:block; }
.h2-tod-t{ display:flex; flex-direction:column; gap:4px; padding:12px 0; min-width:0; } .h2-tod-t small{ font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#c25a10; }
.h2-tod-t b{ font-size:19px; line-height:1.2; } .h2-tod-t em{ font-style:normal; font-size:13.5px; opacity:.78; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; } .h2-tod-m{ font-size:12px; opacity:.6; }
.h2-tod-go{ padding:10px 16px; border-radius:999px; background:#2f8f86; color:#fff; font-weight:800; font-size:14px; white-space:nowrap; }
body.sky-night .h2-tod-t small{ color:#ffb27a; }
@media (max-width:640px){ .h2-tod{ grid-template-columns:96px 1fr; padding:0 12px 0 0; } .h2-tod-img{ height:100%; min-height:110px; } .h2-tod-go{ grid-column:1 / -1; margin:0 12px 12px; text-align:center; } }
@media (max-width:980px){ .h2-today{ grid-template-columns:1fr 1fr; } .h2-guess{ grid-column:1 / -1; min-height:300px; } }
@media (max-width:640px){ .h2-today{ grid-template-columns:1fr; } .h2-card{ min-height:0; } .h2-guess{ min-height:330px; } }`;
document.head.appendChild(css);
try{if(typeof appMode!=="undefined"&&appMode==="home"&&typeof renderHome==="function")renderHome()}catch(e){}
})();
