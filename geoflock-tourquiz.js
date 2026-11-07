/* GeoFlock: the tour quiz. A tour now ends with ONE recap question and an invitation to its quiz: 10 questions, easy to
   hard, drawn from the tour's pool (GF_TQUIZ[tour], 20-30 questions written for it; tours without one use their own tour
   questions). Kinds of question:
     • choice   four answers                                     {q,o:[4],a}
     • country  click the country on the map                       {q,pick:["br"]}
     • place    click the place on the map (scored by distance)    {q,ll:[lon,lat],km}
   Each has a level (d 1-5), a type (t: mem = from the tour, why = reasoning or mechanism, map, beyond = not in the tour,
   use = the idea used somewhere new), a short explanation (why), the stop it comes from (st) and, when it is about a
   country, that country (cc) for its Knowledge ink stamp. The first run uses the tour's best questions (best:1), later
   runs draw from the whole pool. A right answer about a country gives that country's ink stamp, at most one stamp per
   country per tour (the tour's own questions and its quiz together). The quiz runs in a wide panel beside the live map;
   the results open in a card like the country profile. Medals: gold 9+, silver 7+, bronze 5+, on the tour's tiles. */
(function(){
"use strict";
const N=10;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const st=()=>{try{const s=stats.tourQuiz=stats.tourQuiz||{};return s}catch(e){return{}}};
const stampSet=tour=>{try{const S=stats.tqStampTour=stats.tqStampTour||{};return S[tour]=S[tour]||{}}catch(e){return{}}};
const save=()=>{try{saveStats()}catch(e){}};
const tourName=id=>{const T=PS_TOURS[id];return String(T&&(T.name||T.title)||id).replace(/^Guided tour (on|of) (the )?/i,"").replace(/^\w/,c=>c.toUpperCase())};
/* ---------- the pool ---------- */
function pool(id){const P=(window.GF_TQUIZ||{})[id];if(P&&P.length>=N)return P.map((q,i)=>Object.assign({_k:id+"#"+i},q));
 /* no written quiz yet: the tour's own questions, easiest (mid-tour) first */
 const Q=typeof TOURQ!=="undefined"&&TOURQ[id];if(!Q)return P&&P.length?P.map((q,i)=>Object.assign({_k:id+"#"+i},q)):[];
 const L=[].concat((Q.mid||[]).map(q=>Object.assign({d:2,t:"mem"},q,{st:q.st||q.at})),(Q.recap||[]).map(q=>Object.assign({d:3,t:"mem"},q,{st:q.st||q.at})));
 const own=(P||[]).map((q,i)=>Object.assign({_k:id+"#"+i},q));const seen=new Set(own.map(q=>q.q));L.forEach((q,i)=>{if(!seen.has(q.q)){q._k=id+"~"+i;own.push(q)}});return own}
function available(id){return pool(id).length>=6}
function draw(id){const P=pool(id),S=st()[id]||{},first=!S.runs;let C;
 if(first&&P.filter(q=>q.best).length>=Math.min(N,P.length)*.8){C=P.filter(q=>q.best);if(C.length<N)C=C.concat(shuffle(P.filter(q=>!q.best)).slice(0,N-C.length))}
 else{/* later runs: missed questions first, then ones not seen lately, spread over the levels */const seen=S.seen||{},miss=S.miss||{};
  C=shuffle(P).sort((a,b)=>((miss[b._k]?2:0)-(seen[b._k]?1:0))-((miss[a._k]?2:0)-(seen[a._k]?1:0)));
  const byD=[1,2,3,4,5].map(d=>C.filter(q=>(q.d||3)===d)),want=[2,2,2,2,2],out=[];
  byD.forEach((L,i)=>out.push(...L.slice(0,want[i])));for(const q of C){if(out.length>=N)break;if(!out.includes(q))out.push(q)}C=out}
 return C.slice(0,N).sort((a,b)=>(a.d||3)-(b.d||3))}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* choices are shown shuffled (the right one is not always A) */
function prep(q){if(!q.o)return q;const idx=shuffle(q.o.map((_,i)=>i));return Object.assign({},q,{o:idx.map(i=>q.o[i]),a:idx.indexOf(q.a)})}
/* ---------- stamps: one per country per tour ---------- */
function stampFor(tour,code,key){try{code=String(code||"").toLowerCase();if(!code||typeof ppCredit!=="function"||!COUNTRY_BY_CODE[code])return false;const S=stampSet(tour);if(S[code])return false;
 const ok=ppCredit(code,"know",false,"tqz:"+tour+":"+code);S[code]=1;save();return ok}catch(e){return false}}
/* the tour's own questions follow the same rule */
function wrapTq(){if(typeof tqStamp!=="function"||tqStamp._gfOne)return!!(typeof tqStamp==="function");const _t=tqStamp;
 tqStamp=function(q,picked){try{const tour=ps&&ps.tour;if(tour&&typeof ppCredit==="function"){const _pc=ppCredit;let gave=false;
   ppCredit=function(code,kind,gold,key){if(kind!=="know")return _pc.apply(this,arguments);if(gave)return false;const S=stampSet(tour);if(S[code])return false;S[code]=1;save();gave=true;return _pc.call(this,code,kind,gold,"tqz:"+tour+":"+code)};
   try{return _t.apply(this,arguments)}finally{ppCredit=_pc}}}catch(e){}return _t.apply(this,arguments)};tqStamp._gfOne=1;return true}
/* ---------- end of tour: one question, then the invitation ---------- */
function wrapEnd(){if(typeof tqFor!=="function"||tqFor._gfOne)return!!(typeof tqFor==="function");const _f=tqFor;
 tqFor=function(){const r=_f.apply(this,arguments);if(r&&r.kind==="recap"&&r.list&&r.list.length>1){const L=r.list,pick=L.find(q=>q.pick)||L[Math.floor(Math.random()*L.length)];return{kind:"recap",list:[pick]}}return r};tqFor._gfOne=1;return true}
/* the last stop: its "Done" button becomes "Quiz myself", which ends the tour and opens the quiz. If the tour's own closing
   question is still to answer, the tour stays open (that question shows first) and the next press goes on to the quiz. */
function invite(){try{if(typeof ps==="undefined"||!ps||!ps.card)return;const S=psSteps();if(ps.i!==S.length-1)return;const id=ps.tour;if(!available(id))return;
 const r=st()[id]||{},m=medalOf(r.best);ps.card.querySelectorAll(".ps-next[data-ps-end]:not([data-gftq-end])").forEach(b=>{b.dataset.gftqEnd=id;b.classList.add("gftq-endbtn");
  b.textContent=(r.runs?"Quiz myself again":"Quiz myself")+" →";b.title="10 questions, from easy to hard"+(r.best!=null?" · your best: "+r.best+"/10 "+m.icon:"")})}catch(e){console.error(e)}}
document.addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest("[data-gftq-end]");if(!b)return;const id=b.dataset.gftqEnd;
 setTimeout(()=>{try{if(typeof ps==="undefined"||!ps||ps.tour!==id)start(id)}catch(err){console.error(err)}},350)},true);
/* ---------- the quiz ---------- */
let Z=null;
/* the map on show (the globe or the flat map): the panel sits fixed over its top-left corner */
function mapEl(){try{if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.offsetParent)return amGlobe.host}catch(e){}const w=document.getElementById("allMapsWrap");return w&&w.offsetParent?w:document.getElementById("allMapsView")||document.body}
function host(){return document.body}
function pos(){if(!Z||!Z.p||Z.p._gffMoved)return;/* moved by the reader (geoflock-floatfit.js): left there */const r=mapEl().getBoundingClientRect(),w=Math.min(440,innerWidth-24);let L=Math.max(8,r.left+12),T=Math.max(8,r.top+12);if(L+w>innerWidth-8)L=innerWidth-8-w;Z.p.style.left=L+"px";Z.p.style.top=T+"px";Z.p.style.maxHeight=Math.max(260,Math.min(innerHeight-T-12,r.height>200?r.height-24:innerHeight-T-12))+"px"}
addEventListener("resize",pos);addEventListener("scroll",pos,true);setInterval(pos,800);
function start(id,opts){try{if(typeof ps!=="undefined"&&ps)psEnd()}catch(e){}if(Z)stop(true);
 /* a run left part-way is picked up where it was left (the questions, answers and score are kept in stats); "fresh" starts over */
 const R0=st()[id]||{},C=R0.cur;let L,cur=null;
 if(!(opts&&opts.fresh)&&C&&Array.isArray(C.L)&&C.L.length&&C.k<C.L.length){L=C.L;cur=C}else{L=draw(id).map(prep);if(C){delete R0.cur;save()}}
 if(!L.length)return;Z=cur?{id,L,k:cur.k||0,score:cur.score||0,res:cur.res||[],stamps:cur.stamps||[],bonus:!!cur.bonus,resumed:true,t0:Date.now()}:{id,L,k:0,score:0,res:[],stamps:[],t0:Date.now()};
 const p=document.createElement("div");p.className="gftq";p.setAttribute("role","dialog");p.setAttribute("aria-label","Tour quiz");host().appendChild(p);Z.p=p;
 ["pointerdown","mousedown","click","wheel","keydown"].forEach(t=>p.addEventListener(t,e=>e.stopPropagation()));
 if(typeof appMode!=="undefined"&&appMode!=="allmaps"){try{switchAppMode("allmaps")}catch(e){}}
 /* the whole world in view to start */try{const g=amGlobe;if(g){if(g._flat){g.zoom=1;g.request()}else g.lookAt(g.rot?-g.rot[0]:20,10,1)}}catch(e){}
 render();pos()}
/* the run so far, kept so that leaving the quiz does not lose it */
function keep(){try{const S=st(),R=S[Z.id]=S[Z.id]||{};R.cur={L:Z.L,k:Z.res[Z.k]!=null?Z.k+1:Z.k,score:Z.score,res:Z.res,stamps:Z.stamps,bonus:!!Z.bonus,at:Date.now()}}catch(e){}}
/* starting over is offered only once the pass mark (6/10) is out of reach: 5 wrong */
function lost(){if(!Z)return false;let n=0;for(let i=0;i<10;i++)if(Z.res[i]!=null)n++;return Z.score+(10-n)<6}
function overBtn(){return lost()?'<button type="button" class="gftq-over" title="You can no longer reach 6/10 on this run">↺ Start over</button>':""}
function wireOver(p){const b=p.querySelector(".gftq-over");if(b)b.onclick=()=>{const id=Z.id;stop(true);start(id,{fresh:1})}}
function stop(silent){if(!Z)return;try{gfPickQ=null}catch(e){}unarmPlace();if(Z.p)Z.p.remove();clearMark();Z=null}
function dots(){return'<div class="gftq-dots">'+Z.L.slice(0,10).map((q,i)=>{const r=Z.res[i];return'<i class="'+(i===Z.k?"cur ":"")+(r==null?"":r>=1?"ok":r>0?"half":"no")+'"></i>'}).join("")+"</div>"}
const TYPE={mem:"From the tour",why:"Why?",map:"On the map",beyond:"Beyond the tour",use:"Use the idea"};
/* on a map question the panel must not sit on the answer: if the place is under it, move to the other side of the map */
function dodge(q){if(!Z||!Z.p)return;Z.p.classList.toggle("gftq-mapq",!!(q.pick||q.ll));let ll=q.ll;try{if(!ll&&q.pick){const c=COUNTRY_CENTROIDS[q.pick[0]];if(c)ll=[c[1],c[0]]}}catch(e){}
 const go=()=>{if(!Z||!Z.p)return;pos();if(!ll)return;try{const g=amGlobe,r=g.canvas.getBoundingClientRect(),xy=g.projection()(ll);if(!xy)return;const x=r.left+xy[0],y=r.top+xy[1],a=Z.p.getBoundingClientRect();
  if(x>a.left-40&&x<a.right+40&&y>a.top-40&&y<a.bottom+40){const m=mapEl().getBoundingClientRect();Z.p.style.left=Math.max(8,Math.min(innerWidth-a.width-8,m.right-a.width-12))+"px"}}catch(e){}};
 setTimeout(go,80);setTimeout(go,700)}
function render(){const q=Z.L[Z.k],p=Z.p;const lvl=q.d||3;
 p.innerHTML='<div class="gftq-h"><span>'+esc(tourName(Z.id))+' · quiz</span><button type="button" class="gftq-x" aria-label="Close">×</button></div>'+dots()+
  '<div class="gftq-meta"><span>'+(Z.k>=10?'<b class="gftq-bonus">⭐ Bonus question: get it right for '+(Math.round(Z.score)>=7?'gold':'silver')+'</b>':'Question '+(Z.k+1)+' of 10')+'</span><span class="gftq-lv">'+"●".repeat(Math.min(5,lvl))+"○".repeat(5-Math.min(5,lvl))+'</span><span class="gftq-t">'+esc(TYPE[q.t]||"")+'</span></div>'+
  '<p class="gftq-q">'+esc(q.q)+'</p>'+(q.img?'<img class="gftq-img" alt="" src="'+esc(q.img)+'">':"")+
  (q.pick?'<div class="gftq-act">📍 Drop a pin on the country</div>':q.ll?'<div class="gftq-act">📍 Click the place on the map</div>':'<div class="gftq-o">'+q.o.map((o,j)=>'<button type="button" data-j="'+j+'"><i>'+"ABCD"[j]+'</i>'+esc(o)+'</button>').join("")+'</div>')+
  (Z.resumed&&Z.k>0&&Z.res[Z.k]==null?'<div class="gftq-resume">Picking up where you left off: '+Math.round(Z.score*10)/10+' so far.</div>':"")+
  '<div class="gftq-f"><button type="button" class="gftq-skip">Skip</button>'+overBtn()+'</div>';Z.resumed=false;
 p.querySelector(".gftq-x").onclick=()=>{stop()};p.querySelector(".gftq-skip").onclick=()=>answer(0,null,true);wireOver(p);
 p.querySelectorAll(".gftq-o button").forEach(b=>b.onclick=()=>answer(+b.dataset.j===q.a?1:0,+b.dataset.j));
 try{gfPickQ=null}catch(e){}unarmPlace();clearMark();
 /* a map question starts with the whole world in view */
 if(q.pick||q.ll)try{const g=amGlobe;if(g._flat){g.zoom=1;g.request()}else g.lookAt(g.rot?-g.rot[0]:20,15,1)}catch(e){}
 dodge(q);
 /* a country question works like a place question: drop a pin, see which country it is in, then confirm */
 if(q.pick)armPlace(ll=>{const c=pendC||cAt(ll),code=c&&c.code,name=c&&c.name;answer(code&&q.pick.includes(String(code).toLowerCase())?1:0,code?{code,name}:{code:"",name:"the sea"})},true);
 if(q.ll)armPlace(ll=>{const km=d3.geoDistance(ll,q.ll)*6371,R=q.km||300;answer(km<=R?1:km<=R*3?.5:0,{ll,km})})}
function answer(v,how,skipped){if(!Z)return;const q=Z.L[Z.k],p=Z.p;try{gfPickQ=null}catch(e){}unarmPlace();Z.res[Z.k]=v;Z.score+=v;
 const S=st(),R=S[Z.id]=S[Z.id]||{};R.seen=R.seen||{};R.miss=R.miss||{};R.seen[q._k]=Date.now();if(v>=1)delete R.miss[q._k];else R.miss[q._k]=1;
 let stamp="";if(v>=1){const codes=[].concat(q.cc||[],q.pick&&how&&how.code?[String(how.code).toLowerCase()]:[]);for(const c of codes){if(stampFor(Z.id,c)){Z.stamps.push(c);stamp=c;break}}}
 /* show the answer: the right choice, or the place on the map */
 p.querySelectorAll(".gftq-o button").forEach(b=>{const j=+b.dataset.j;b.disabled=true;if(j===q.a)b.classList.add("ok");else if(how===j)b.classList.add("no")});
 let res="";if(q.ll){mark(q.ll);res=how&&how.km!=null?'You were <b>'+Math.round(how.km).toLocaleString()+' km</b> away':""}
 if(q.pick){const nm=q.pick.map(c=>(COUNTRY_BY_CODE[c]||{}).n||c).join(" or ");res=how&&how.name?'You clicked <b>'+esc(how.name)+'</b>'+(v>=1?"":" · it was <b>"+esc(nm)+"</b>"):"It was <b>"+esc(nm)+"</b>";try{amGlobe.flyTo(q.pick[0])}catch(e){}}
 const back=q.st?'<button type="button" class="gftq-back">Back to this stop</button>':"";
 const f=p.querySelector(".gftq-f");f.innerHTML='<div class="gftq-why '+(v>=1?"ok":v>0?"half":"no")+'"><b>'+(skipped?"Skipped.":v>=1?"Right!":v>0?"Close!":"Not quite.")+'</b> '+(res?res+". ":"")+esc(q.why||"")+
  (stamp?'<span class="gftq-stamp">Ink stamp: '+esc((COUNTRY_BY_CODE[stamp]||{}).n||stamp)+'</span>':"")+'</div><div class="gftq-acts">'+back+overBtn()+'<button type="button" class="gftq-next">'+(Z.k+1<Z.L.length?"Next →":"See your score →")+'</button></div>';
 const ma=p.querySelector(".gftq-act");if(ma)ma.remove();p.querySelector(".gftq-dots").outerHTML=dots();
 f.querySelector(".gftq-next").onclick=()=>{if(++Z.k<Z.L.length)render();else if(bonus()){keep();save();render()}else finish()};
 const b=f.querySelector(".gftq-back");if(b)b.onclick=()=>goStop(Z.id,q.st);wireOver(f);keep();save()}
function goStop(id,title){const keep=Z;stop(true);try{psLaunchTour(id);setTimeout(()=>{try{const i=psSteps().findIndex(s=>s.title===title);if(i>=0)psGo(i)}catch(e){}},900)}catch(e){console.error(e)}}
function medalOf(s){return s==null?{icon:"",name:""}:s>=8?{icon:"🥇",name:"Gold"}:s>=6?{icon:"🥈",name:"Silver"}:s>=5?{icon:"🥉",name:"Bronze"}:{icon:"",name:""}}
/* one point short of the next level (5 → silver at 6, 7 → gold at 8): one bonus question, worth that point */
function bonus(){try{if(Z.bonus||Z.L.length!==10)return false;const sc=Math.round(Z.score*10)/10;if(sc!==5&&sc!==7)return false;
 const used=new Set(Z.L.map(q=>q._k||q.q)),P=pool(Z.id).filter(q=>!used.has(q._k||q.q));if(!P.length)return false;
 const pick=P.slice().sort((a,b)=>Math.abs((a.d||3)-3)-Math.abs((b.d||3)-3))[Math.floor(Math.random()*Math.min(4,P.length))];
 Z.L.push(prep(pick));Z.bonus=true;return true}catch(e){console.error(e);return false}}
function finish(){if(Z.L.length>10){Z.score=Math.min(10,Z.score)}const sc=Math.round(Z.score*10)/10,S=st(),R=S[Z.id]=S[Z.id]||{};R.runs=(R.runs||0)+1;delete R.cur;const prev=R.best;R.best=Math.max(R.best||0,sc);save();
 try{if(typeof xpGain==="function")xpGain(Math.round(sc*3),"tour quiz")}catch(e){}
 const m=medalOf(sc),miss=Z.L.map((q,i)=>[q,Z.res[i]]).filter(([,r])=>!(r>=1));
 const card=document.createElement("div");card.className="gftq-res";card.innerHTML='<div class="gftq-rbox" role="dialog" aria-label="Quiz results"><button type="button" class="gftq-x" aria-label="Close">×</button>'+
  '<div class="gftq-rh">'+(m.icon?'<span class="gftq-medal">'+m.icon+'</span>':"")+'<div><small>'+esc(tourName(Z.id))+' · tour quiz</small><b>'+sc+' / 10</b><span>'+(sc>=8?"Mastered!":sc>=6?"Passed: very good.":sc>=5?"Good going.":sc>=3?"A start: a second run gets easier.":"Every run teaches something: try again.")+(prev!=null&&sc>prev?" New best!":"")+'</span></div></div>'+
  (Z.stamps.length?'<div class="gftq-rs"><small>Ink stamps earned</small>'+Z.stamps.map(c=>'<span>'+esc((COUNTRY_BY_CODE[c]||{}).n||c)+'</span>').join("")+'</div>':"")+
  (miss.length?'<div class="gftq-rm"><small>To look at again</small>'+miss.map(([q])=>'<div><p>'+esc(q.q)+'</p><em>'+esc(q.o?q.o[q.a]:q.pick?q.pick.map(c=>(COUNTRY_BY_CODE[c]||{}).n||c).join(" or "):"")+'</em>'+(q.st?'<button type="button" data-st="'+esc(q.st)+'">Back to this stop</button>':"")+'</div>').join("")+'</div>':"")+
  '<div class="gftq-ra"><button type="button" class="gftq-again">Another round</button><button type="button" class="gftq-done">Done</button></div></div>';
 const id=Z.id;stop(true);document.body.appendChild(card);
 const close=()=>card.remove();card.querySelector(".gftq-x").onclick=close;card.querySelector(".gftq-done").onclick=close;card.onclick=e=>{if(e.target===card)close()};
 card.querySelector(".gftq-again").onclick=()=>{close();start(id)};card.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{close();goStop(id,b.dataset.st)})}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const r=document.querySelector(".gftq-res");if(r){r.remove();return}if(Z&&!e.defaultPrevented){stop()}}});
/* ---------- clicking a place on the map ---------- */
let placeCb=null,downAt=null;
let pendC=null,placeCountry=false;
/* the country under a point: the map's own hit test at that point on the screen */
/* the country a point is in, from the country shapes themselves (works on every map, whatever it colours) */
let CF=null;function cAt(ll){try{if(!CF)CF=projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c);let best=null;
 for(const f of CF){if(d3.geoContains(f,ll)){const a=d3.geoArea(f);if(!best||a<best.a)best={f,a}}}if(!best)return null;
 const code=String(best.f.properties.c).toLowerCase();return{code,name:(COUNTRY_BY_CODE[code]||{}).n||code.toUpperCase()}}catch(e){return null}}
function armPlace(cb,country){placeCb=cb;placeCountry=!!country;pendC=null;pendLL=null;document.body.classList.add("gftq-placing")}
function unarmPlace(){placeCb=null;document.body.classList.remove("gftq-placing")}
function llAt(x,y){try{const g=amGlobe,r=g.canvas.getBoundingClientRect(),ll=g.projection().invert([x-r.left,y-r.top]);return ll&&isFinite(ll[0])?ll:null}catch(e){return null}}
document.addEventListener("pointerdown",e=>{if(placeCb)downAt=[e.clientX,e.clientY]},true);
document.addEventListener("click",e=>{if(!placeCb||!downAt)return;try{if(!amGlobe||Z&&Z.p&&Z.p.contains(e.target)||e.target.closest&&e.target.closest("button,.gfk-tray,.gfk-panel"))return;const r=amGlobe.canvas.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return}catch(er){return}
 if(Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>6)return;const ll=llAt(e.clientX,e.clientY);if(!ll)return;e.stopPropagation();e.preventDefault();
 /* drop (or move) your pin; nothing is marked until you confirm it */
 pendLL=ll;window._gftqPinT=Date.now();if(placeCountry)pendC=cAt(ll);let m=marks.find(x=>x.classList.contains("you"));if(m){m._ll=ll;place(m);m.classList.remove("drop");void m.offsetWidth;m.classList.add("drop")}else{markYou(ll);m=marks[marks.length-1];if(m){m.innerHTML=PIN;m.classList.add("drop")}}
 confirmUI()},true);
/* while a pin is being placed, a click on a country drops the pin: no country profile opens */
(function hookFz(){if(typeof openFlagZoom!=="function"){setTimeout(hookFz,800);return}if(openFlagZoom._gftq)return;const _f=openFlagZoom;
 openFlagZoom=function(){if(placeCb||document.body.classList.contains("gftq-placing")||Date.now()-(window._gftqPinT||0)<800)return;return _f.apply(this,arguments)};openFlagZoom._gftq=1})();
let pendLL=null;const PIN='<svg viewBox="0 0 24 34" width="26" height="36"><path d="M12 33C12 33 2 19 2 12a10 10 0 0 1 20 0c0 7-10 21-10 21z" fill="#e8601c" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>';
function confirmUI(){try{if(!Z||!Z.p)return;const a=Z.p.querySelector(".gftq-act");if(!a)return;
 if(placeCountry){a.innerHTML='📍 Your pin is in <b>'+esc(pendC?pendC.name:"the sea")+'</b>. Is this the country you mean? <button type="button" class="gftq-ok">Yes, confirm ✓</button> <small>(or click the map again to move it)</small>'}
 let b=a.querySelector(".gftq-ok");
 if(!b||placeCountry){if(!placeCountry)a.innerHTML='📍 Your pin is down: click the map again to move it, then <button type="button" class="gftq-ok">Confirm my pin ✓</button>';b=a.querySelector(".gftq-ok");
  b.onclick=e=>{e.stopPropagation();if(!pendLL||!placeCb)return;const cb=placeCb,ll=pendLL;placeCb=null;pendLL=null;a.textContent="📍 Pin confirmed";cb(ll)}}}catch(e){}}
/* markers: where you clicked, and where it is */
let marks=[];
function clearMark(){marks.forEach(m=>m.remove());marks=[];try{amGlobe.cfg._gftqMarks=null;amGlobe.request()}catch(e){}}
function addMark(ll,cls){try{const h=amGlobe.host,el=document.createElement("div");el.className="gftq-mk "+cls;h.appendChild(el);el._ll=ll;marks.push(el);place(el)}catch(e){}}
function place(el){try{const s=amGlobe.projection()(el._ll),r=amGlobe.canvas.getBoundingClientRect(),hr=amGlobe.host.getBoundingClientRect();if(!s){el.style.display="none";return}el.style.display="";el.style.left=(r.left-hr.left+s[0])+"px";el.style.top=(r.top-hr.top+s[1])+"px"}catch(e){}}
setInterval(()=>marks.forEach(place),120);
function markYou(ll){addMark(ll,"you")}
function mark(ll){addMark(ll,"it");try{const g=amGlobe;if(g._flat){g.zoom=1;g.request()}else{const d=d3.geoDistance([-g.rot[0],-g.rot[1]],ll);if(d>.5)g.lookAt(ll[0],ll[1],Math.min(g.zoom||1,1.6))}}catch(e){}}
/* ---------- the quiz on the tours' tiles and lists ---------- */
function decorate(){try{document.querySelectorAll("[data-tour]").forEach(el=>{const id=el.dataset.tour,r=st()[id];if(!r||r.best==null||el.querySelector(".gftq-tile"))return;const m=medalOf(r.best);if(!m.icon)return;
  const b=document.createElement("span");b.className="gftq-tile";b.title="Tour quiz: best "+r.best+"/10";b.textContent=m.icon;el.appendChild(b)})}catch(e){}}
/* the mark on a tour's picture: ✓ finished, ★ finished and quiz passed (6+), 👑 mastered (quiz 8+) */
function levelMarks(){try{document.querySelectorAll("#toursView .tr-card").forEach(c=>{const t=c.querySelector(".tr-thumb[data-tour-go]"),m=c.querySelector(".tr-done");if(!t||!m)return;const r=st()[t.dataset.tourGo]||{},b=r.best;
  const L=b>=8?["👑","Mastered: tour finished and quiz 8/10 or more","l3"]:b>=6?["★","Passed: tour finished and quiz 6/10 or more","l2"]:["✓","Finished","l1"];
  if(m.dataset.lv!==L[2]){m.dataset.lv=L[2];m.textContent=L[0];m.title=L[1];m.className="tr-done gftq-"+L[2]}})}catch(e){}}
setInterval(levelMarks,800);
function cards(){try{document.querySelectorAll("#toursView .tr-card .tr-foot").forEach(f=>{const had=f.querySelector(".gftq-go");if(had){const r=st()[had.dataset.gftqGo]||{},part=r.cur&&r.cur.k>0&&r.cur.k<(r.cur.L||[]).length,first=had.firstChild;
   const want=part?"Resume quiz":f.classList.contains("gftq-done")?"Quiz myself":"Quiz";if(first&&first.nodeType===3&&first.textContent.trim()!==want)first.textContent=want+(had.querySelector("small")?" ":"");return}const go=f.querySelector(".tr-go[data-tour-go]");if(!go)return;
  const id=go.dataset.tourGo;if(!available(id))return;const r=st()[id]||{},m=medalOf(r.best),done=/Finished/.test((f.querySelector(".tr-progtxt")||{}).textContent||"");
  const q=document.createElement("button");q.type="button";q.className="gftq-go"+(done?" lead":"");q.dataset.gftqGo=id;
  const part=r.cur&&r.cur.k>0&&r.cur.k<(r.cur.L||[]).length;q.innerHTML=(part?"Resume quiz":done?"Quiz myself":"Quiz")+(m.icon?' <small>'+m.icon+"</small>":"");q.title="The tour quiz: 10 questions, from easy to hard"+(r.best!=null?" · your best: "+r.best+"/10":"");
  q.onclick=e=>{e.stopPropagation();start(id)};
  if(done){f.classList.add("gftq-done");go.textContent="Replay";go.classList.add("gftq-second")}go.before(q)})}catch(e){console.error(e)}}
setInterval(cards,700);
setInterval(()=>{decorate();invite()},1500);
let n=0;const t=setInterval(()=>{const a=wrapTq(),b=wrapEnd();if(typeof psGo==="function"&&!psGo._gftq){const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);setTimeout(invite,300);setTimeout(invite,1200);return r};psGo._gftq=1}if(a&&b&&psGo._gftq||++n>60)clearInterval(t)},500);
window.gfTourQuiz={start,stop,pool,draw,available,_z:()=>Z};
{const s=document.createElement("style");s.textContent=`
.tr-done.gftq-l2{background:#c9a227!important;color:#fff!important}.tr-done.gftq-l3{background:linear-gradient(135deg,#f7d774,#d99a1e)!important;font-size:17px!important}
.gftq-bonus{color:#c26a00}
.gftq-resume{margin:4px 0 8px;padding:6px 10px;border-radius:9px;background:rgba(217,104,43,.1);color:#9a4a16;font-size:13px;font-weight:600}
.gftq .gftq-over{padding:7px 12px;border-radius:999px;border:1.5px solid rgba(127,127,127,.4);background:transparent;color:inherit;font:inherit;font-weight:700;font-size:13px;cursor:pointer;margin-left:8px}
.gftq .gftq-over:hover{background:rgba(127,127,127,.12)}
.tr-foot.gftq-done .tr-prog,.tr-foot.gftq-done .tr-progtxt{display:none}
.tr-foot.gftq-done{background:none!important;box-shadow:none!important;padding:0!important;flex-wrap:wrap;gap:8px}.tr-foot.gftq-done>.gftq-go,.tr-foot.gftq-done>.tr-go{flex:1 1 auto;margin-left:0!important;justify-content:center;text-align:center;min-width:0}
.tr-foot .gftq-go,.tr-foot .tr-go.gftq-second{max-width:100%;box-sizing:border-box}
.tr-foot .gftq-go{margin-left:auto;padding:7px 11px;border-radius:999px;border:1.5px solid var(--tc,#d9682b);background:transparent;color:var(--tc,#d9682b);font:inherit;font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap}
.tr-foot .gftq-go+.tr-go,.tr-foot .tr-go+.gftq-go{margin-left:6px}.tr-foot .gftq-go:hover{background:rgba(217,104,43,.1)}
.tr-foot .gftq-go.lead{background:var(--tc,#d9682b);color:#fff;border-color:transparent}.tr-foot .gftq-go small{font-weight:700;opacity:.9}
.tr-foot .tr-go.gftq-second{padding-left:12px!important;padding-right:12px!important;background:transparent!important;color:inherit!important;opacity:.75;box-shadow:none!important;border:1.5px solid rgba(127,127,127,.35)!important}
.gftq-endbtn{background:linear-gradient(135deg,#e8743b,#d9682b)!important;color:#fff!important}
.gftq-inv{display:flex;align-items:center;gap:10px;margin:10px 0 6px;padding:10px 12px;border-radius:12px;background:linear-gradient(135deg,#fff3d6,#ffe2b8);color:#5a3a12}
.gftq-inv div{flex:1;display:flex;flex-direction:column;line-height:1.25}.gftq-inv b{font-size:14px}.gftq-inv span{font-size:12px;opacity:.85}
.gftq-inv button{border:0;border-radius:999px;padding:8px 14px;font-weight:800;background:#e8601c;color:#fff;cursor:pointer;white-space:nowrap}
.gftq{position:fixed;left:12px;top:12px;z-index:900;width:440px;max-width:calc(100% - 24px);max-height:calc(100% - 24px);overflow:auto;padding:14px 16px 14px;border-radius:16px;background:#fffaf0;color:#2a2014;box-shadow:0 14px 40px rgba(10,20,40,.38);font-family:inherit}
.gftq-h{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#a0522d}
.gftq-x{border:0;background:none;font-size:22px;line-height:1;color:#8a7458;cursor:pointer}
.gftq-dots{display:flex;gap:5px;margin:8px 0 6px}.gftq-dots i{flex:1;height:6px;border-radius:3px;background:#eadfc8}.gftq-dots i.cur{background:#e8a24a}.gftq-dots i.ok{background:#2e9b5f}.gftq-dots i.half{background:#d9b23a}.gftq-dots i.no{background:#d0573a}
.gftq-meta{display:flex;gap:10px;align-items:center;font-size:12px;color:#8a7458}.gftq-lv{letter-spacing:1px;color:#e8a24a}.gftq-t{margin-left:auto;font-weight:700}
.gftq-q{font-size:17px;font-weight:700;line-height:1.35;margin:8px 0 10px}
.gftq-img{display:block;max-width:100%;max-height:180px;border-radius:10px;margin:0 auto 10px}
.gftq-o{display:flex;flex-direction:column;gap:7px}.gftq-o button{display:flex;gap:10px;align-items:center;text-align:left;border:2px solid #eadfc8;background:#fff;border-radius:12px;padding:9px 11px;font:inherit;font-size:14.5px;cursor:pointer;color:#2a2014}
.gftq-o button:hover:not(:disabled){border-color:#e8a24a}.gftq-o button i{font-style:normal;font-weight:800;color:#a0522d;width:16px}
.gftq-o button.ok{border-color:#2e9b5f;background:#e8f6ee}.gftq-o button.no{border-color:#d0573a;background:#fbe9e4}.gftq-o button:disabled{cursor:default}
.gftq-act{padding:12px;border-radius:12px;background:#eef5ff;color:#1d4f8a;font-weight:700;text-align:center}
.gftq-f{margin-top:10px}.gftq-skip{border:0;background:none;color:#8a7458;font:inherit;font-size:13px;cursor:pointer;text-decoration:underline}
.gftq-why{padding:10px 12px;border-radius:12px;font-size:14px;line-height:1.45}.gftq-why.ok{background:#e8f6ee}.gftq-why.no{background:#fbe9e4}.gftq-why.half{background:#fbf3d8}
.gftq-stamp{display:inline-block;margin-top:6px;padding:2px 9px;border-radius:999px;border:1.5px dashed #a0522d;color:#a0522d;font-size:12px;font-weight:800}
.gftq-acts{display:flex;justify-content:flex-end;gap:8px;margin-top:10px;position:sticky;bottom:-14px;z-index:3;padding:10px 0 12px;background:linear-gradient(to bottom,rgba(255,250,240,0),#fffaf0 35%)}/* Next stays in view while the panel scrolls */.gftq-acts button{border:0;border-radius:999px;padding:8px 16px;font-weight:800;cursor:pointer}
.gftq-next{background:#e8601c;color:#fff}.gftq-back{background:#f0e6d2;color:#5a3a12}
body.gftq-placing .globe-host canvas{cursor:crosshair!important}
.gftq-mk{position:absolute;z-index:30;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;pointer-events:none}
.gftq-mk.you{width:26px;height:36px;margin:-36px 0 0 -13px;border-radius:0;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))}.gftq-mk.you.drop{animation:gftqDrop .38s cubic-bezier(.3,1.6,.5,1)}@keyframes gftqDrop{0%{transform:translateY(-40px);opacity:0}60%{opacity:1}100%{transform:none}}
.gftq-ok{margin-left:6px;border:0;border-radius:999px;padding:7px 14px;background:#e8601c;color:#fff;font:inherit;font-weight:800;cursor:pointer}.gftq-mk.it{background:#2e9b5f;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.35),0 0 0 10px rgba(46,155,95,.25)}
.gftq-res{position:fixed;inset:0;z-index:3000;background:rgba(10,16,30,.45);display:flex;align-items:center;justify-content:center;padding:16px}
.gftq-rbox{position:relative;width:520px;max-width:100%;max-height:90vh;overflow:auto;background:#fffaf0;color:#2a2014;border-radius:18px;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.gftq-rbox .gftq-x{position:absolute;top:10px;right:12px}
.gftq-rh{display:flex;gap:14px;align-items:center}.gftq-medal{font-size:46px}.gftq-rh div{display:flex;flex-direction:column}.gftq-rh small{color:#a0522d;font-weight:800;text-transform:uppercase;font-size:11px}.gftq-rh b{font-size:30px}.gftq-rh span{color:#5a4a36}
.gftq-rs,.gftq-rm{margin-top:14px}.gftq-rs small,.gftq-rm small{display:block;font-weight:800;color:#8a7458;text-transform:uppercase;font-size:11px;margin-bottom:6px}
.gftq-rs span{display:inline-block;margin:0 6px 6px 0;padding:3px 10px;border-radius:999px;border:1.5px dashed #a0522d;color:#a0522d;font-weight:800;font-size:12.5px}
.gftq-rm>div{padding:8px 0;border-top:1px solid #eadfc8}.gftq-rm p{margin:0;font-weight:700;font-size:14px}.gftq-rm em{display:block;color:#2e7d4f;font-style:normal;font-size:13.5px}.gftq-rm button{margin-top:4px;border:0;background:#f0e6d2;color:#5a3a12;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer}
.gftq-ra{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.gftq-ra button{border:0;border-radius:999px;padding:9px 18px;font-weight:800;cursor:pointer}.gftq-again{background:#e8601c;color:#fff}.gftq-done{background:#f0e6d2;color:#5a3a12}
.gftq-tile{position:absolute;top:6px;right:6px;font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))}
@media (max-width:640px){.gftq{left:8px;right:8px;width:auto;top:8px;max-height:55%}}`;document.head.appendChild(s)}
})();
