/* GeoFlock: Drills, a Trivia mode for practising one country fact at a time (currency, language, demonym,
   phone code, largest city, landmark, national animal). Uses DRILL_FACTS from geoflock-drills.js and the
   main page's helpers (triviaState, COUNTRIES, flagUrl, ppCredit, xpGain, wireGameTypeahead). */
(function(){
if(typeof DRILL_FACTS==="undefined"||typeof COUNTRIES==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[’'`ʻ]/g,"").replace(/[^a-z0-9+ ]+/g," ").replace(/\s+/g," ").trim();
const lev=(a,b)=>{if(a===b)return 0;const m=a.length,n=b.length;if(!m||!n)return m||n;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]};
const close=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return false;if(a===b)return true;const L=Math.max(a.length,b.length);return L>=5&&lev(a,b)<=(L>=10?2:1)};
const F=c=>DRILL_FACTS[c],NAME=c=>(COUNTRY_BY_CODE[c]||{}).n||c;
/* currency answers: the full name, the name without its country word ("yen"), and anything in brackets ("yuan") */
const curAlts=v=>{const a=[v.cur];const br=/\(([^)]+)\)/.exec(v.cur);if(br)a.push(br[1],v.cur.replace(/\s*\(.*\)/,""));const w=v.cur.replace(/\s*\(.*\)/,"").split(" ");if(w.length>1)a.push(w.slice(1).join(" "),w[w.length-1]);return a};
const shared=(k)=>{const m={};COUNTRIES.forEach(c=>{const v=F(c.c);if(v)(m[k(v)]=m[k(v)]||[]).push(c.c)});return m};
/* the seven drills: what the question shows, what the answer is, and which directions make sense */
const DRILLS=[
 {id:"cur",name:"Currency",icon:"💰",ex:"Japan → yen",both:true,
  fwd:{ask:c=>"What is the currency of "+NAME(c)+"?",ans:c=>F(c).cur,alts:c=>curAlts(F(c)),hint:c=>F(c).sym+" · "+F(c).iso,key:c=>F(c).cur},
  rev:{ask:c=>"Which country uses the "+F(c).cur+"?",sub:c=>F(c).sym+" · "+F(c).iso,ok:c=>shared(v=>v.cur)[F(c).cur].length===1}},
 {id:"lang",name:"Official language",icon:"🗣️",ex:"Brazil → Portuguese",both:false,
  fwd:{ask:c=>"Name an official language of "+NAME(c),ans:c=>F(c).lang[0],alts:c=>F(c).lang,all:c=>F(c).lang,key:c=>F(c).lang[0]}},
 {id:"dem",name:"Demonym",icon:"🧑",ex:"Netherlands → Dutch",both:true,
  fwd:{ask:c=>"What are people from "+NAME(c)+" called?",ans:c=>F(c).dem,alts:c=>[F(c).dem],key:c=>F(c).dem},
  rev:{ask:c=>"Where do the people called “"+F(c).dem+"” come from?",ok:c=>shared(v=>v.dem)[F(c).dem].length===1}},
 {id:"call",name:"Phone code",icon:"📞",ex:"Germany → +49",both:true,
  fwd:{ask:c=>"What is the phone code of "+NAME(c)+"?",ans:c=>"+"+F(c).call,alts:c=>["+"+F(c).call,F(c).call],key:c=>F(c).call},
  rev:{ask:c=>"Which country has the phone code +"+F(c).call+"?",ok:c=>shared(v=>v.call)[F(c).call].length===1}},
 {id:"city",name:"Largest city",icon:"🏙️",ex:"Turkey → Istanbul",both:true,
  fwd:{ask:c=>"What is the largest city in "+NAME(c)+"?",ans:c=>F(c).city,alts:c=>[F(c).city],key:c=>F(c).city},
  rev:{ask:c=>"Which country’s largest city is "+F(c).city+"?",ok:()=>true}},
 {id:"lm",name:"Famous landmark",icon:"🏛️",ex:"Machu Picchu → Peru",both:false,revOnly:true,
  rev:{ask:c=>"Which country is home to "+F(c).lm+"?",ok:()=>true}},
 {id:"an",name:"National animal",icon:"🦁",ex:"Australia → kangaroo",both:false,
  fwd:{ask:c=>"What is the national animal of "+NAME(c)+"?",ans:c=>F(c).an,alts:c=>[F(c).an,F(c).an.replace(/\s*\(.*\)/,"")],key:c=>F(c).an,need:c=>!!F(c).an}}];
const REG=[["all","All"],["common","Common"],["Europe","Europe"],["Asia","Asia"],["Africa","Africa"],["Americas","Americas"],["Oceania","Oceania"]];
const st=()=>{const t=triviaState();t.drills=t.drills||{dir:{},region:"all",style:"choice",len:10,best:{},seen:{}};return t.drills};
let R=null;/* the round being played */
function pool(D,dir){const S=st();let L=COUNTRIES.filter(c=>F(c.c));if(S.region==="common")L=L.filter(c=>typeof COMMON_MAP_CODES!=="undefined"&&COMMON_MAP_CODES.has(c.c));else if(S.region!=="all")L=L.filter(c=>c.r===S.region);
 const side=dir==="rev"?D.rev:D.fwd;L=L.filter(c=>(!side.need||side.need(c.c))&&(!side.ok||side.ok(c.c)));return L.map(c=>c.c)}
function dirOf(D){if(D.revOnly)return"rev";if(!D.both)return"fwd";return st().dir[D.id]==="rev"?"rev":"fwd"}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* four choices; wrong ones are real answers from the same region where possible, and never another right answer */
function choices(D,dir,c,P){const reg=(COUNTRY_BY_CODE[c]||{}).r;if(dir==="rev"){const near=shuffle(P.filter(x=>x!==c&&(COUNTRY_BY_CODE[x]||{}).r===reg)),far=shuffle(COUNTRIES.map(x=>x.c).filter(x=>x!==c&&F(x)));const o=[c];for(const x of near.concat(far)){if(o.length>=4)break;if(!o.includes(x))o.push(x)}return shuffle(o).map(x=>({v:x,label:NAME(x),flag:x}))}
 const side=D.fwd,right=side.ans(c),bad=new Set((side.all?side.all(c):[right]).map(norm));const seen=new Set([norm(right)]);const o=[{v:right,label:right}];
 const cands=shuffle(COUNTRIES.map(x=>x.c).filter(x=>x!==c&&F(x)&&(!side.need||side.need(x)))).sort((a,b)=>((COUNTRY_BY_CODE[a]||{}).r===reg?0:1)-((COUNTRY_BY_CODE[b]||{}).r===reg?0:1));
 for(const x of cands){if(o.length>=4)break;const opts=side.all?side.all(x):[side.ans(x)];const pick=opts[Math.floor(Math.random()*opts.length)];const n=norm(pick);if(seen.has(n)||bad.has(n))continue;seen.add(n);o.push({v:pick,label:pick})}
 return shuffle(o)}
function start(D){const S=st(),dir=dirOf(D),P=pool(D,dir);if(!P.length){R=null;render("No countries to ask in this region.");return}
 const len=S.len==="all"?P.length:S.len==="endless"?Infinity:Math.min(+S.len||10,P.length);
 R={D,dir,P,queue:shuffle(P.slice()),len,k:0,ok:0,miss:[],log:[],cur:null,answered:false,t0:Date.now(),style:S.style};next()}
function next(){if(!R)return;if(R.k>=R.len){R.done=true;render();return}
 if(!R.queue.length)R.queue=shuffle(R.P.slice());
 /* endless practice brings missed ones back a few questions later */
 if(R.len===Infinity&&R.again&&R.again.length&&R.again[0].at<=R.k){R.cur=R.again.shift().c}else R.cur=R.queue.shift();
 R.answered=false;R.given=null;R.opts=R.style==="choice"?choices(R.D,R.dir,R.cur,R.P):null;render()}
function answer(given,ok){if(!R||R.answered)return;R.answered=true;R.given=given;R.right=ok;R.k++;const c=R.cur;
 if(ok){R.ok++;try{if(typeof ppCredit==="function")ppCredit(c,"know",R.style==="type","dr:"+R.D.id+":"+R.t0)}catch(e){}try{if(typeof xpGain==="function")xpGain(R.style==="type"?2:1,"drill")}catch(e){}}
 else{R.miss.push(c);if(R.len===Infinity){(R.again=R.again||[]).push({c,at:R.k+3})}}
 R.log.push({c,ok});const S=st();S.seen[R.D.id+":"+c]=(S.seen[R.D.id+":"+c]||0)+1;try{saveStats()}catch(e){}render()}
function skip(){if(!R||R.answered||R.done)return;answer("",false)}
function checkTyped(txt){const D=R.D,c=R.cur;if(R.dir==="rev")return false;const side=D.fwd;return side.alts(c).some(a=>close(txt,a))}
function rightLabel(){const D=R.D,c=R.cur;if(R.dir==="rev")return NAME(c);const side=D.fwd;return side.all?side.all(c).join(" · "):side.ans(c)}
function factLine(c){const v=F(c);const D=R.D;if(D.id==="cur")return v.cur+" · "+v.sym+" · "+v.iso;if(D.id==="lang")return"Official: "+v.lang.join(", ");if(D.id==="dem")return"People: "+v.dem;if(D.id==="call")return"Phone code +"+v.call;if(D.id==="city")return"Largest city: "+v.city+(v.city===(COUNTRY_BY_CODE[c].caps||[])[0]?" (also the capital)":"");if(D.id==="lm")return v.lm;if(D.id==="an")return"National animal: "+v.an;return""}
function render(msg){const v=document.getElementById("triviaView");if(!v)return;const S=st();
 if(!R||msg){v.innerHTML='<div class="dr-wrap"><div class="dr-head"><h2>Drills</h2><p>One fact, every country. Pick a drill and practise it until it sticks.</p></div>'+(msg?'<p class="dr-msg">'+esc(msg)+'</p>':'')+
  '<div class="dr-grid">'+DRILLS.map(D=>{const both=D.both;const d=dirOf(D);return'<div class="dr-tile" data-d="'+D.id+'"><button type="button" class="dr-go" data-go="'+D.id+'"><span class="dr-ic">'+D.icon+'</span><b>'+D.name+'</b><small>'+esc(D.ex)+'</small></button>'+(both?'<div class="dr-dir"><button type="button" data-dir="fwd" class="'+(d==="fwd"?"on":"")+'">Country → '+D.name.toLowerCase()+'</button><button type="button" data-dir="rev" class="'+(d==="rev"?"on":"")+'">'+D.name+' → country</button></div>':'<div class="dr-dir one">'+(D.revOnly?"Landmark → country":"Country → "+D.name.toLowerCase())+'</div>')+'</div>'}).join("")+'</div>'+
  '<div class="dr-opts"><div class="dr-row"><span>Region</span>'+REG.map(([k,l])=>'<button type="button" class="chip'+(S.region===k?" active":"")+'" data-reg="'+k+'">'+l+'</button>').join("")+'</div>'+
  '<div class="dr-row"><span>Answer</span><button type="button" class="chip'+(S.style==="choice"?" active":"")+'" data-sty="choice">Multiple choice</button><button type="button" class="chip'+(S.style==="type"?" active":"")+'" data-sty="type">Type it</button><small>typing earns gold stamp credit</small></div>'+
  '<div class="dr-row"><span>Length</span>'+[["10","10"],["20","20"],["all","Every country"],["endless","Endless practice"]].map(([k,l])=>'<button type="button" class="chip'+(String(S.len)===k?" active":"")+'" data-len="'+k+'">'+l+'</button>').join("")+'</div></div></div>';
  v.querySelectorAll("[data-dir]").forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.closest(".dr-tile").dataset.d;S.dir[id]=b.dataset.dir;saveStats();render()});
  v.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>start(DRILLS.find(D=>D.id===b.dataset.go)));
  v.querySelectorAll("[data-reg]").forEach(b=>b.onclick=()=>{S.region=b.dataset.reg;saveStats();render()});
  v.querySelectorAll("[data-sty]").forEach(b=>b.onclick=()=>{S.style=b.dataset.sty;saveStats();render()});
  v.querySelectorAll("[data-len]").forEach(b=>b.onclick=()=>{S.len=b.dataset.len;saveStats();render()});return}
 const D=R.D,c=R.cur,side=R.dir==="rev"?D.rev:D.fwd;
 if(R.done){const key=D.id+":"+R.dir+":"+S.region+":"+S.style,pb=S.best[key]||0,nb=R.ok>pb;if(nb&&!R._saved){S.best[key]=R.ok;saveStats()}R._saved=1;const miss=[...new Set(R.miss)];
  v.innerHTML='<div class="dr-wrap"><div class="dr-card dr-end"><small>'+esc(D.name)+'</small><h2>'+R.ok+' / '+R.k+'</h2><p>'+(R.ok===R.k?"Perfect round.":nb?"New best!":"Best: "+pb)+'</p>'+(miss.length?'<div class="dr-miss"><small>To practise</small>'+miss.map(m=>'<div><img src="'+flagUrl(m,"w40")+'" alt=""><b>'+esc(NAME(m))+'</b><span>'+esc(factLine(m))+'</span></div>').join("")+'</div>':'')+'<div class="dr-acts"><button type="button" class="chip" id="drBack">All drills</button><button type="button" class="chip tut-go" id="drAgain">Again →</button></div></div></div>';
  document.getElementById("drBack").onclick=()=>{R=null;render()};document.getElementById("drAgain").onclick=()=>start(D);document.getElementById("drAgain").focus();return}
 const showFlag=R.dir==="fwd";const prompt=side.ask(c);const sub=R.dir==="rev"&&side.sub?side.sub(c):"";
 let body="";
 if(R.style==="choice"){body='<div class="dr-opts4">'+R.opts.map((o,i)=>{let cls="";if(R.answered){const isRight=R.dir==="rev"?o.v===c:(D.fwd.all?D.fwd.all(c).map(norm).includes(norm(o.v)):norm(o.v)===norm(D.fwd.ans(c)));if(isRight)cls=" ok";else if(o.v===R.given)cls=" no"}return'<button type="button" class="dr-o'+cls+'" data-i="'+i+'"'+(R.answered?" disabled":"")+'><kbd>'+(i+1)+'</kbd>'+(o.flag?'<img src="'+flagUrl(o.flag,"w40")+'" alt="">':'')+esc(o.label)+'</button>'}).join("")+'</div>'}
 else body=R.answered?'':'<div class="dr-type"><div class="game-input-wrap"><input id="drIn" class="global-search-input" autocomplete="off" spellcheck="false" placeholder="'+(R.dir==="rev"?"Which country?":"Type the answer…")+'"><div class="suggestions" id="drSug"></div></div></div>';
 const fb=R.answered?'<div class="dr-fb '+(R.right?"ok":"no")+'"><b>'+(R.right?"Right!":"Not quite.")+'</b> '+esc(NAME(c))+': '+esc(R.dir==="rev"?factLine(c):rightLabel())+(R.dir==="fwd"&&D.fwd.hint?' <small>'+esc(D.fwd.hint(c))+'</small>':'')+'</div><button type="button" class="chip tut-go" id="drNext">'+(R.k>=R.len?"See score →":"Next →")+'</button>':'<button type="button" class="chip dr-skip" id="drSkip">Skip <kbd>Esc</kbd></button>';
 v.innerHTML='<div class="dr-wrap"><div class="dr-card"><div class="dr-top"><span>'+esc(D.name)+(R.len===Infinity?" · endless":" · "+Math.min(R.k+(R.answered?0:1),R.len)+" of "+R.len)+'</span><span>score <b>'+R.ok+'</b></span><button type="button" class="dr-quit" id="drQuit">End</button></div>'+
  (showFlag?'<img class="dr-flag" src="'+flagUrl(c,"w320")+'" alt="">':'')+'<h3>'+esc(prompt)+'</h3>'+(sub?'<p class="dr-sub">'+esc(sub)+'</p>':'')+body+fb+'</div></div>';
 const q=document.getElementById("drQuit");if(q)q.onclick=()=>{R.len=R.k;R.done=true;render()};
 v.querySelectorAll(".dr-o").forEach(b=>b.onclick=()=>{const o=R.opts[+b.dataset.i];const ok=R.dir==="rev"?o.v===c:(D.fwd.all?D.fwd.all(c).map(norm).includes(norm(o.v)):norm(o.v)===norm(D.fwd.ans(c)));answer(o.v,ok)});
 const sk=document.getElementById("drSkip");if(sk)sk.onclick=skip;const nx=document.getElementById("drNext");if(nx){nx.onclick=next;nx.focus({preventScroll:true})}
 const inp=document.getElementById("drIn");if(inp){if(R.dir==="rev"&&typeof wireGameTypeahead==="function"){try{wireGameTypeahead("drIn","drSug",typeof gameCountries==="function"?gameCountries():COUNTRIES,x=>answer(x,x===c))}catch(e){}}
  else inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.stopPropagation();const t=inp.value.trim();if(!t)return;answer(t,checkTyped(t))}});inp.focus({preventScroll:true})}}
/* keys: 1–4 pick, Esc skips, Enter goes on */
document.addEventListener("keydown",e=>{if(!R||R.done)return;const v=document.getElementById("triviaView");if(!v||!v.querySelector(".dr-card"))return;
 if(e.key==="Escape"&&!R.answered){e.preventDefault();skip();return}
 if(e.key==="Enter"&&R.answered&&!(e.target&&e.target.id==="drIn")){const nx=document.getElementById("drNext");if(nx){e.preventDefault();nx.click()}return}
 if(!R.answered&&R.style==="choice"&&/^[1-4]$/.test(e.key)&&!(document.activeElement&&/input|textarea/i.test(document.activeElement.tagName))){const b=v.querySelectorAll(".dr-o")[+e.key-1];if(b)b.click()}});
/* the Drills tab, right after Trivia's own quiz tab */
{const _te=tvTabsEnsure;tvTabsEnsure=function(nav){_te.apply(this,arguments);if(nav&&!nav.querySelector('[data-appmode="drills"]')){const q=nav.querySelector('[data-appmode="quiz"]');const html='<button class="tab-btn" type="button" data-appmode="drills" id="tvDrTab">Drills</button>';if(q)q.insertAdjacentHTML("afterend",html);else nav.insertAdjacentHTML("beforeend",html)}const q=nav&&nav.querySelector('[data-appmode="quiz"]');if(q&&q.textContent.trim()==="Quiz")q.textContent="Trivia"}}
{const _wt=wireTvAppModeSwitch;wireTvAppModeSwitch=function(nav){const r=_wt.apply(this,arguments);try{if(triviaState().fcMode==="drills")nav.querySelectorAll("[data-appmode]").forEach(b=>b.classList.toggle("active",b.dataset.appmode==="drills"))}catch(e){}return r}}
{const _rt=renderTriviaView;renderTriviaView=function(){if(triviaState().fcMode==="drills"){try{fcCloseSheet()}catch(e){}return render()}return _rt.apply(this,arguments)}}
/* the phone codes block is new in Names & Languages */
try{const W=TRIVIA_TOPICS.find(t=>t.id==="words");if(W&&!W.blocks.some(b=>b.id==="codes"))W.blocks.push({id:"codes",name:"Phone codes"});W.blurb="What countries and their people are called, what they speak, and their phone codes"}catch(e){}
try{const E=TRIVIA_TOPICS.find(t=>t.id==="economy");if(E)E.blurb="Crops, mining, money and currencies"}catch(e){}
const css=document.createElement("style");css.textContent=`
.dr-wrap{ max-width:880px; margin:8px auto 30px; padding:0 12px; }
.dr-head{ text-align:center; margin:4px 0 14px; } .dr-head h2{ margin:0 0 4px; } .dr-head p{ margin:0; opacity:.75; }
.dr-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:12px; }
.dr-tile{ background:rgba(255,255,255,.85); border-radius:18px; box-shadow:0 4px 16px rgba(20,40,70,.08); padding:10px; display:flex; flex-direction:column; gap:8px; }
.dr-go{ display:grid; grid-template-columns:auto 1fr; grid-template-rows:auto auto; column-gap:10px; align-items:center; text-align:left; border:0; background:none; cursor:pointer; padding:6px; border-radius:12px; font:inherit; color:inherit; }
.dr-go:hover{ background:rgba(201,90,128,.08); } .dr-ic{ grid-row:span 2; font-size:28px; } .dr-go b{ font-size:16px; } .dr-go small{ opacity:.7; }
.dr-dir{ display:flex; gap:6px; flex-wrap:wrap; } .dr-dir button{ flex:1; border:1px solid rgba(0,0,0,.12); background:#fff; border-radius:999px; padding:5px 8px; font:600 12px inherit; cursor:pointer; color:inherit; }
.dr-dir button.on{ background:var(--mc,#c95a80); border-color:var(--mc,#c95a80); color:#fff; } .dr-dir.one{ font-size:12px; opacity:.65; padding:4px 6px; }
.dr-opts{ margin-top:16px; display:grid; gap:8px; } .dr-row{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; } .dr-row > span{ font:800 11px inherit; letter-spacing:.08em; text-transform:uppercase; opacity:.6; width:70px; } .dr-row small{ opacity:.6; }
.dr-card{ background:rgba(255,255,255,.9); border-radius:22px; box-shadow:0 6px 22px rgba(20,40,70,.1); padding:18px; text-align:center; }
.dr-top{ display:flex; justify-content:space-between; align-items:center; gap:10px; font-size:13px; opacity:.85; margin-bottom:10px; } .dr-quit{ border:0; background:none; cursor:pointer; color:inherit; text-decoration:underline; }
.dr-flag{ height:96px; max-width:80%; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,.18); object-fit:contain; }
.dr-card h3{ font-size:22px; margin:12px 0 6px; } .dr-sub{ margin:0 0 8px; opacity:.7; }
.dr-opts4{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; } .dr-o{ display:flex; align-items:center; gap:8px; border:1.5px solid rgba(0,0,0,.12); background:#fff; border-radius:14px; padding:12px; font:600 15px inherit; cursor:pointer; text-align:left; color:inherit; }
.dr-o img{ width:28px; border-radius:3px; } .dr-o kbd{ font-size:11px; opacity:.5; } .dr-o.ok{ background:#dff3df; border-color:#3fae4a; } .dr-o.no{ background:#fbe1e1; border-color:#d0453f; }
.dr-type{ max-width:420px; margin:12px auto; } .dr-fb{ margin:10px auto; max-width:560px; padding:10px 12px; border-radius:12px; } .dr-fb.ok{ background:#e6f5e6; } .dr-fb.no{ background:#fbe8e8; } .dr-fb small{ display:block; opacity:.7; margin-top:2px; }
.dr-skip kbd{ font-size:10px; opacity:.6; } .dr-end h2{ font-size:42px; margin:6px 0; } .dr-miss{ text-align:left; margin:12px auto; max-width:560px; display:grid; gap:6px; } .dr-miss > div{ display:grid; grid-template-columns:28px auto 1fr; gap:8px; align-items:center; font-size:14px; } .dr-miss img{ width:28px; border-radius:3px; } .dr-miss span{ opacity:.75; }
.dr-acts{ display:flex; gap:8px; justify-content:center; margin-top:10px; } .dr-msg{ text-align:center; color:#b4406b; }
body.sky-night .dr-tile, body.sky-night .dr-card, body.dark-theme .dr-tile, body.dark-theme .dr-card{ background:rgba(30,34,60,.9); }
body.sky-night .dr-o, body.sky-night .dr-dir button, body.dark-theme .dr-o, body.dark-theme .dr-dir button{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.15); }
@media (max-width:560px){ .dr-opts4{ grid-template-columns:1fr; } .dr-row > span{ width:100%; } }`;
document.head.appendChild(css);
window.drillsOpen=()=>{const t=triviaState();t.fcMode="drills";saveStats();try{switchAppMode("trivia")}catch(e){}};
})();
