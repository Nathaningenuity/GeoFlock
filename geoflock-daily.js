/* GeoFlock: "Today's challenges" on Home — the day's shared puzzles in one place, with a streak. */
(function(){
if(typeof renderHome!=="function"||typeof dailySeed!=="function")return;
function doneOn(day){try{return(stats.wiDaily||{})[day]!=null||(stats.ggDaily||{})[day]!=null||((stats.dailyDone||{})[day]||0)>0}catch(e){return false}}
function streak(){let n=0,d=dailySeed();if(!doneOn(d))d--;while(doneOn(d)){n++;d--}return n}
function mark(id){try{const D=stats.dailyDone=stats.dailyDone||{},k=dailySeed();D[k]=(D[k]||0)|({globle:1,flagpie:2}[id]||4);saveStats()}catch(e){}}
function open(id){try{switchAppMode("games")}catch(e){}
 if(id==="pin"||id==="type"){activeGame="whereis";try{wi.mode="daily";wi.state="setup";if(window.gfGeoGuess)gfGeoGuess.G.pref=id==="pin"?"pin":"type";stats.ggPref=id==="pin"?"pin":"type"}catch(e){}}
 else activeGame=id;
 try{renderChrome();renderGamesView()}catch(e){console.error(e)}
 if(id==="globle"||id==="flagpie"){try{if(id==="globle"&&typeof startGloble==="function"&&!(globle.daily&&globle.target))startGloble(true);if(id==="flagpie"&&typeof startFlagpie==="function"&&!flagpie.daily)startFlagpie(true)}catch(e){console.error(e)}}
 window.scrollTo({top:0})}
/* tick Globle and Flagpie only when today's daily round is finished */
[["recordGlobleWin","globle"],["recordGlobleGiveUp","globle"],["fpFinish","flagpie"]].forEach(([f,id])=>{if(typeof window[f]!=="function")return;const o=window[f];window[f]=function(){const r=o.apply(this,arguments);try{if((id==="globle"?globle:flagpie).daily)mark(id)}catch(e){}return r}});
function html(){const day=dailySeed(),wiS=(stats.wiDaily||{})[day],ggS=(stats.ggDaily||{})[day],dd=(stats.dailyDone||{})[day]||0,n=streak();
 const L=[["pin","📍","Pin it on the map",ggS!=null?ggS.toLocaleString()+" pts":"Today’s five photos",ggS!=null],["type","📷","Where is this?",wiS!=null?wiS.toLocaleString()+" pts":"Name today’s five",wiS!=null],["globle","🌍","Globle","Today’s hidden country",!!(dd&1)],["flagpie","🥧","Flagpie","Today’s flag",!!(dd&2)]],k=L.filter(x=>x[4]).length;
 return'<div class="dc-strip" id="dcCard"><div class="dc-h"><b>Daily challenges</b><small>'+k+'/4 today · same puzzles for everyone</small><span class="dc-streak" title="Days in a row with at least one daily challenge">🔥 '+n+' day'+(n===1?"":"s")+'</span></div><div class="dc-rows">'+
  L.map(([id,ic,t,sub,done])=>'<button type="button" class="dc-row'+(done?" ok":"")+'" data-dc="'+id+'"><span class="dc-ic">'+ic+'</span><span class="dc-t"><b>'+t+'</b><small>'+sub+'</small></span><span class="dc-st">'+(done?"✓":"Play")+'</span></button>').join("")+'</div></div>'}
const _rh=renderHome;renderHome=function(){const r=_rh.apply(this,arguments);try{const sec=document.querySelector("#homeView .hi-today");if(sec){const old=document.getElementById("dcCard");if(old)old.remove();sec.insertAdjacentHTML("beforeend",html());sec.querySelectorAll("[data-dc]").forEach(b=>b.onclick=()=>open(b.dataset.dc))}}catch(e){console.error(e)}return r};
try{if(typeof appMode!=="undefined"&&appMode==="home")renderHome()}catch(e){}
const css=document.createElement("style");css.textContent=`
.dc-strip{ margin-top:12px; } .dc-h{ display:flex; gap:10px; align-items:baseline; margin:0 2px 8px; } .dc-h small{ opacity:.65; font-size:12px; } .dc-streak{ margin-left:auto; font-weight:800; font-size:13px; }
.dc-rows{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.dc-row{ display:grid; grid-template-columns:28px 1fr auto; gap:8px; align-items:center; border:1px solid rgba(255,255,255,.7); background:rgba(255,255,255,.62); border-radius:16px; padding:9px 12px; cursor:pointer; font:inherit; color:inherit; text-align:left; box-shadow:0 2px 10px rgba(20,40,70,.05); }
.dc-row:hover{ background:#fff; } .dc-ic{ font-size:19px; text-align:center; } .dc-t b{ display:block; font-size:13.5px; } .dc-t small{ opacity:.7; font-size:12px; }
.dc-st{ font-weight:800; font-size:12px; padding:3px 10px; border-radius:999px; background:#e8701a; color:#fff; } .dc-row.ok .dc-st{ background:#3fae4a; }
@media (max-width:900px){ .dc-rows{ grid-template-columns:1fr 1fr; } } @media (max-width:600px){ .dc-rows{ grid-template-columns:1fr; gap:6px; } .dc-row{ padding:7px 12px; } .dc-t small{ display:inline; margin-left:6px; } .dc-t b{ display:inline; } } @media (max-width:420px){ .dc-h small{ display:none; } }
body.sky-night .dc-row, body.dark-theme .dc-row{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.1); } body.sky-night .dc-row:hover, body.dark-theme .dc-row:hover{ background:rgba(255,255,255,.12); }`;
document.head.appendChild(css);
})();
