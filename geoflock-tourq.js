/* GeoFlock tour questions.
   - A question is asked when you leave the stop named in its "at". Some pointed at an earlier stop than the one they are
     about ("st"), so they came before you had seen the answer (the panda question in the animals tour). Those now wait
     for their own stop.
   - A right answer inks one country's Knowledge stamp: the country named in the question's "kc" when it has one. */
(function(){
if(typeof TOURQ==="undefined"||typeof tqFor!=="function")return;
const fixed=new Set();
function order(tour){if(fixed.has(tour))return;fixed.add(tour);const Q=TOURQ[tour],T=PS_TOURS[tour];if(!Q||!T)return;
 const titles=T.steps.map(s=>s.title);
 (Q.mid||[]).forEach(q=>{const st=String(q.st||"").split("|").pop(),is=titles.indexOf(st),ia=titles.indexOf(q.at);
  if(is>=0&&(ia<0||is>ia))q.at=st})}
const _f=tqFor;tqFor=function(tour){try{order(tour)}catch(e){console.error(e)}return _f.apply(this,arguments)};
if(typeof tqStamp==="function"){const _s=tqStamp;tqStamp=function(q,picked){try{if(!picked&&q&&q.kc&&typeof ppCredit==="function"&&COUNTRY_BY_CODE[q.kc]){ppCredit(q.kc,"know",false,"tq:"+q.q);return}}catch(e){}return _s.apply(this,arguments)}}
window.gfTourQ={order};
})();
