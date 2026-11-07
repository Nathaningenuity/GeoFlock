/* GeoFlock: Trivia Jeopardy, dealt from the bigger question bank.
   - Fresh categories (on by default): every board picks six parts from six different topics, each with enough
     questions to run from easy to hard. Your own columns, or columns by continent, are kept when you choose them.
   - Each row is one step harder: 200 is a level-1 question, 1,000 a level-5 one. No question, and no answer, comes up
     twice on a board.
   - Specials: a few cells hold a new kind of clue (a photo, a map pin, higher or lower, an outline, matching…), marked
     with their icon; two Daily Doubles on a full board.
   - A miss leaves a quiet dot on the board, not a cross. When the board is finished: a review of every clue, with
     the answers, the why, the places on a map, XP and stamps, "Practise the ones I missed" and "Same topics, harder".
   Uses the main page's Jeopardy (jpDeal, jpRender…) and the new kinds of question in geoflock-trivia-modes.js. */
(function(){
if(typeof jpDeal!=="function"||typeof jp==="undefined"||!window.gfTriviaModes)return;
const M=window.gfTriviaModes,esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const SHORT={"nature:water":"Seas & Rivers","nature:terrain":"Mountains","nature:islands":"Islands","nature:wildlife":"Wildlife","geo:size":"Big & Small","geo:population":"People","geo:location":"Where Is It?","geo:borders":"Borders","geo:flags":"Flags","geo:cities":"Cities",
 "history:ancient":"Ancient World","history:colonial":"Empires","history:modern":"Modern History","politics:government":"Who Rules","politics:capitals":"Capitals","politics:international":"World Stage","culture:food":"Food & Drink","culture:sport":"Sport & Music","culture:landmarks":"Landmarks","culture:festivals":"Festivals",
 "words:names":"Old Names","words:language":"Languages","economy:farming":"Farming","economy:mining":"Mining & Energy","economy:money":"Money & Trade"};
/* which new kinds of clue suit a topic */
const SPEC={geo:[["pin",["landmark","capital"]],["outline",null],["hl",["pop","area"]],["photo",null]],nature:[["hl",["peak","river"]],["pin",["peak"]],["photo",null],["order",["peak","river"]]],politics:[["match",["capital"]],["pin",["capital"]],["odd",["eu","monarchy"]]],
 culture:[["photo",null],["pin",["landmark"]]],history:[["photo",null],["pin",["landmark"]]],economy:[["hl",["pop","area"]],["order",["pop","area"]]],words:[["odd",["spanish","portuguese"]],["match",["flag"]]]};
const ansKey=q=>q.x?"x:"+String(q.x.n).toLowerCase():"c:"+q.a[0];
const regOf=()=>jp.cont?{t:c=>tvInConts(c,[jp.cont])||jp.cont==="Oceania"&&c==="aq"}:null;
function isDefault(){try{const D=jpDefaultCols();return jp.cols.length===D.length&&jp.cols.every((c,i)=>!c.custom&&c.blocks.join()===D[i].blocks.join())}catch(e){return false}}
const fresh=()=>jp.by==="theme"&&jp.fresh!==false&&isDefault();
function coverage(qs){const ds=new Set(qs.map(q=>q.d||3));return[1,2,3,4,5].filter(d=>ds.has(d)||ds.has(d-1)&&ds.has(d+1)).length}
function freshColumns(){const byT={};jpBlocks().filter(b=>SHORT[b.id]).forEach(b=>{const qs=jpPoolOf([b.id]);if(qs.length>=10&&coverage(qs)>=4)(byT[b.topic]=byT[b.topic]||[]).push({name:SHORT[b.id],qs,topic:b.topic,id:b.id})});
 const topics=shuffle(Object.keys(byT));/* geography and nature most of the time */topics.sort((a,b)=>((b==="geo"||b==="nature")-(a==="geo"||a==="nature"))*(Math.random()<.7?1:0));
 return topics.slice(0,6).map(t=>pick(byT[t]))}
function fill(cols){const used=new Set(),ans=new Set(),up=jp.hard?1:0;
 return cols.filter(c=>c.qs.length>=5).map(c=>({name:c.name,topic:c.topic||(c.qs[0]&&c.qs[0].s),cells:[0,1,2,3,4].map(r=>{const d=Math.min(5,r+1+up);
  const free=c.qs.filter(q=>!used.has(q.id)&&!ans.has(ansKey(q)));const by=k=>shuffle(free.filter(q=>Math.abs((q.d||3)-d)===k)).sort((a,b)=>(b.q||3)-(a.q||3));
  const q=by(0)[0]||by(1)[0]||by(2)[0]||free[0];if(!q)return null;used.add(q.id);ans.add(ansKey(q));return{q,v:jp.scale*(r+1),done:false}})}))}
function specials(board){const reg=regOf(),n=board.length>=5?4:2,cols=shuffle(board.map((c,i)=>i)).slice(0,n);const seen=new Set();
 cols.forEach((ci,k)=>{const col=board[ci],r=1+k%3,cell=col.cells[r];if(!cell)return;const opts=SPEC[col.topic]||SPEC.geo;for(let t=0;t<6;t++){const [type,subs]=pick(opts);if(seen.has(type)&&t<4)continue;
   const q=M.genOne({type,subs},{reg,d:Math.min(5,r+1+(jp.hard?1:0)),avoid:seen});if(q){seen.add(type);cell.sp=q;break}}})}
jpDeal=function(){try{const cols=fresh()?freshColumns():jpColumns();const board=fill(cols);if(board.length<2)throw new Error("too few columns");jp.board=board;specials(board);
  if(jp.dd){const all=[];board.forEach(c=>c.cells.forEach((x,j)=>{if(x&&j>=2)all.push(x)}));shuffle(all);const nd=board.length>=5?2:1;const cs=new Set();all.forEach(x=>{if(cs.size<nd){const ci=board.findIndex(c=>c.cells.includes(x));if(!cs.has(ci)){cs.add(ci);x.dd=true}}})}
  jp.scores=[0,0,0,0];jp.turn=0;jp.open=null;jp.state="board";jp.newBest=false;jp._xp0=M.xpNow();jp._st0=M.stampsTotal();jp._reviewed=false;jpSaveCfg();jpRender()}
 catch(e){console.error(e);jp.hard=false;return _deal.apply(this,arguments)}};
const _deal=(()=>{let f=null;return function(){/* the old deal, as a fallback */const cols=jpColumns().filter(c=>c.qs.length>=5);jp.board=fill(cols);jp.scores=[0,0,0,0];jp.turn=0;jp.open=null;jp.state="board";jpSaveCfg();jpRender()}})();
/* remember "fresh categories" */
{const _s=jpSaveCfg;jpSaveCfg=function(){const r=_s.apply(this,arguments);try{stats.jpCfg.fresh=jp.fresh!==false;saveStats()}catch(e){}return r}}
{const _l=jpLoadCfg;jpLoadCfg=function(){const was=jp._loaded;const r=_l.apply(this,arguments);if(!was)try{const c=stats.jpCfg||{};if(c.fresh===false)jp.fresh=false}catch(e){}return r}}
{const _su=jpSetup;jpSetup=function(v){const r=_su.apply(this,arguments);try{if(jp.by==="theme"&&!v.querySelector("#jp2Fresh")){const g=v.querySelector(".jp-colgrid");const html='<label class="jp2-fresh"><input type="checkbox" id="jp2Fresh"'+(jp.fresh!==false?" checked":"")+'> <span><b>Fresh categories every board</b><small>Six parts of six different topics, from easy to hard. Edit a column below to use your own instead.</small></span></label>';
  if(g)g.insertAdjacentHTML("beforebegin",html);const b=v.querySelector("#jp2Fresh");if(b)b.onchange=()=>{jp.fresh=b.checked;jpSaveCfg()}}}catch(e){console.error(e)}return r}}
/* a special clue: one of the new kinds of question, inside the clue window */
{const _h=jpClueHTML;jpClueHTML=function(){const o=jp.open;if(!o||!o.x||!o.x.sp||o.stage==="wager")return _h.apply(this,arguments);const val=o.x.dd?o.wager:o.x.v;const T=M.TYPES[o.x.sp.type];
 return'<div class="game-modal-backdrop jp-bd"><div class="game-modal jp-modal jp2-sp"><div class="jp-mh"><span>'+esc(o.cat)+' · '+(T?T.icon+" "+esc(T.name):"Special")+'</span><b>'+val.toLocaleString()+'</b>'+(!o.spRes?'<button class="jp-leave" id="jpLeave" title="Opened the wrong one? Put it back (Esc)">← Back to board</button>':'')+'</div><div class="jp2-box" id="jp2Sp"></div><div id="jp2Res"></div></div></div>'}}
{const _w=jpWireClue;jpWireClue=function(){const o=jp.open;if(o&&o.x){o.x._tries=o.tries}if(!o||!o.x||!o.x.sp||o.stage==="wager")return _w.apply(this,arguments);
 const val=o.x.dd?o.wager:o.x.v,box=document.getElementById("jp2Sp"),res=document.getElementById("jp2Res");const L=document.getElementById("jpLeave");if(L)L.onclick=()=>{jp.open=null;jpRender()};
 const close=()=>{o.x.done=true;jp.open=null;jpRender()};
 const show=R=>{const ok=R.sc>=.6,close2=R.sc>=.3&&!ok;res.innerHTML='<div class="jp-res '+(ok?"good":close2?"pass":"bad")+'">'+(ok?"+"+val.toLocaleString():close2?"Close: no points either way":"−"+val.toLocaleString())+'</div>'+(!ok&&R.right?'<p class="jp-why">The answer: '+R.right+'</p>':'')+(R.why?'<p class="jp-why">'+esc(R.why)+'</p>':'')+'<div class="jp-acts"><button class="jp-btn gold" id="jpBack">Back to the board →</button></div>';
  M.wireLinks(res);const b=document.getElementById("jpBack");b.onclick=close;b.focus({preventScroll:true});const l=document.getElementById("jpLeave");if(l)l.remove()};
 M.TYPES[o.x.sp.type].render(o.x.sp,box,R=>{if(o.spRes)return;R=Object.assign({sc:0},R);o.spRes=R;o.x.rres=R;const ok=R.sc>=.6,close2=R.sc>=.3&&!ok;jp.scores[jp.turn]+=ok?val:close2?0:-val;o.x.res=ok?"ok":close2?"":"bad";
  try{M.credit(o.x.sp,R,"jp");M.noteMistake(o.x.sp,R.sc)}catch(e){}const sc=document.querySelectorAll(".jp-sc b")[jp.turn];if(sc){sc.textContent=jp.scores[jp.turn].toLocaleString();sc.classList.toggle("neg",jp.scores[jp.turn]<0)}show(R)},{});
 if(o.spRes)show(o.spRes)}}
/* the board: quiet dots for misses, icons on the special cells, the review when it is finished */
{const _r=jpRender;jpRender=function(){const r=_r.apply(this,arguments);try{const v=jpHost();if(!v||!jp.board)return r;
 v.querySelectorAll(".jp-cell").forEach(b=>{if(b.dataset.i==null)return;const x=jp.board[+b.dataset.i]&&jp.board[+b.dataset.i].cells[+b.dataset.r];if(!x)return;
  if(x.done){const i=b.querySelector("i");if(i&&x.res==="bad"){i.textContent="•";b.classList.add("jp2-miss")}}else if(x.sp){const T=M.TYPES[x.sp.type];b.classList.add("jp2-spc");b.insertAdjacentHTML("afterbegin",'<em class="jp2-ic" title="'+esc(T.name)+'">'+T.icon+'</em>')}});
 if(jp.state==="end"){const e=v.querySelector(".jp-end");if(e&&!e.querySelector("#jp2Rev")){e.insertAdjacentHTML("beforeend",'<button class="jp-btn ghost" id="jp2Rev">See the review</button>');e.querySelector("#jp2Rev").onclick=review}
  if(!jp._reviewed){jp._reviewed=true;setTimeout(review,900)}}}catch(e){console.error(e)}return r}}
function review(){const rows=[],missed=[];jp.board.forEach(c=>c.cells.forEach(x=>{if(!x||!x.done)return;
  if(x.sp&&x.rres){rows.push(Object.assign(M.rowOf(x.sp,x.rres),{label:esc(c.name)+" · "+M.rowOf(x.sp,x.rres).label}));if(x.rres.sc<.6)missed.push(x.sp);return}
  const q=x.q,ok=x.res==="ok",right=q.x?esc(q.x.n):M.cLink(q.a[0]),tries=x._tries||[];const cs=q.x?(q.kc||[]):q.a;
  rows.push({label:esc(c.name)+" · "+esc(jpClue(q)),yours:ok?right:tries.length?tries.map(esc).join(", "):"Passed",right,why:q.w||"",sc:ok?1:0,ll:cs[0]?M.centroid(cs[0]):null,icon:""});
  M.noteMistake(M.textQ(q),ok?1:0);if(!ok)missed.push(M.textQ(q))}));
 const right=rows.filter(r=>r.sc>=.6).length,s=v4Stat("gameJeopardy",{played:0,best:0});
 M.showResults({title:"Trivia Jeopardy",score:right,max:rows.length,rows,xp:jp._xp0!=null?M.xpNow()-jp._xp0:0,stamps:jp._st0!=null?M.stampsTotal()-jp._st0:0,
  extra:'<p class="tm-rextra">'+(jp.players===1?'Final score <b>'+jp.scores[0].toLocaleString()+'</b>'+(jp.newBest?' · a new best!':' · best '+(s.best||0).toLocaleString()):jp.names.slice(0,jp.players).map((n,i)=>esc(n)+' <b>'+jp.scores[i].toLocaleString()+'</b>').join(' · '))+'</p>',
  buttons:[missed.length?{l:"Practise the ones I missed",f:()=>M.practise(missed)}:null,{l:"New board",main:1,f:()=>{jp.hard=false;jpDeal()}},{l:"Same topics, harder",f:()=>{jp.hard=true;jpDeal()}},{l:"Back to the board",f:()=>jpRender()}].filter(Boolean)})}
const css=document.createElement("style");css.textContent=`
.jp2-fresh{ display:flex; align-items:flex-start; gap:10px; background:rgba(255,255,255,.75); border-radius:16px; padding:10px 14px; margin:4px 0 12px; cursor:pointer; } .jp2-fresh input{ margin-top:4px; width:18px; height:18px; accent-color:#c9853a; } .jp2-fresh span{ display:flex; flex-direction:column; gap:2px; } .jp2-fresh small{ opacity:.7; }
.jp-cell{ position:relative; } .jp2-ic{ position:absolute; top:4px; left:6px; font-style:normal; font-size:13px; line-height:1; opacity:.9; } .jp-cell.done.jp2-miss i{ opacity:.35; font-style:normal; }
.jp2-sp{ max-width:760px !important; width:min(760px,96vw) !important; } .jp2-box{ text-align:left; padding:4px 2px 0; max-height:none; } .jp2-box .tm-q{ font-size:19px; } .jp2-box .tm-map svg{ max-height:44vh; } .jp2-box .tm-photo img{ max-height:36vh; }
.jp-h span{ hyphens:auto; -webkit-hyphens:auto; overflow-wrap:normal; word-break:normal; }
body.sky-night .jp2-fresh{ background:rgba(30,34,60,.85); }
@media (max-width:640px){ .jp-board{ gap:4px !important; } .jp-h{ padding:4px 2px !important; min-height:46px; } .jp-h span{ font-size:8.6px !important; letter-spacing:0 !important; line-height:1.15; } .jp-cell span{ font-size:15px; } .jp2-ic{ font-size:10px; top:2px; left:3px; }
 .jp2-sp{ width:100vw !important; max-height:100dvh; overflow-y:auto; border-radius:18px 18px 0 0 !important; } .jp2-box .tm-map svg{ max-height:40vh; } }`;
document.head.appendChild(css);
})();
