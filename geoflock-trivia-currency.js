/* GeoFlock: harder currency questions in Trivia. "Which country uses the Russian ruble?" gave the answer away in the
   currency's own name. The country's name is taken out of the currency: "uses a currency called the ruble" (any country
   whose currency is called that is right: Russia or Belarus). Where many countries share the name (dollar, dinar, peso,
   franc, pound, rupee, shilling) the question asks for the currency code instead ("NAD"). One level harder either way. */
(function(){
function run(){try{if(typeof TRIVIA_Q==="undefined"||typeof DRILL_FACTS==="undefined"||run.done)return!!run.done;
 const esc=w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const KEEP={"Pound sterling":"pound sterling","Convertible mark":"convertible mark","Renminbi (yuan)":"renminbi (yuan)","Zimbabwe Gold":"ZiG (Zimbabwe Gold)"};
 const core=c=>{const F=DRILL_FACTS[c];if(!F||!F.cur)return null;if(KEEP[F.cur])return KEEP[F.cur];
  let w=F.cur.split(" ");/* drop the leading place words: "South Sudanese pound" -> "pound", "UAE dirham" -> "dirham" */
  while(w.length>1&&/^[A-ZÀ-Ý]/.test(w[0]))w.shift();let out=w.join(" ");
  [F.dem].concat(String(F.dem||"").split(/[ \/]/)).filter(x=>x&&x.length>2).forEach(x=>{out=out.replace(new RegExp("\\b"+esc(x)+"\\b","i"),"").trim()});
  return(out||F.cur).toLowerCase()};
 const Q=TRIVIA_Q.filter(q=>q&&q.b==="money"&&q.dr&&Array.isArray(q.a)&&q.a.length===1&&/as its currency$/.test(q.t||""));
 const by={};Q.forEach(q=>{const k=core(q.a[0]);if(k)(by[k]=by[k]||[]).push(q.a[0])});
 Q.forEach(q=>{const c=q.a[0],k=core(c),F=DRILL_FACTS[c];if(!k)return;const same=by[k]||[c];
  if(/^euro$/.test(k))return;
  if(same.length<=3){q.t="uses a currency called the "+k;q.a=same.slice()}
  else if(F.iso){q.t="has a currency with the code "+F.iso}
  else return;
  q.d=Math.min(5,(q.d||3)+1);q._curHard=1});
 run.done=true;return true}catch(e){console.error(e);return false}}
if(!run()){let n=0;const t=setInterval(()=>{if(run()||++n>60)clearInterval(t)},500)}
})();
