/* GeoFlock sweep (quizzes, games, home, library): small fixes found in the overnight sweep, plus a richer
   end-of-quiz screen for the Study & Quiz quizzes (flags, capitals, places: find on map flat and globe, outlines),
   the part breaks between them, Daily 5 and "Where is this?".
   The results screen: a score ring and a short encouraging line, every question of the round with your answer next
   to the right one (gently: "you said X · it's Y", no crosses), the right one with its flag or outline and its name
   opening the country profile, "Practise the ones I missed", "Play again" and "Next part", the progress pills the
   app already adds, and a small map of where the round's countries are. Loads last. */
(function(){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const has=n=>{try{return typeof window[n]==="function"}catch(e){return false}};
const wrap=(n,f)=>{if(!has(n))return false;const o=window[n];window[n]=f(o);return true};
const CBC=c=>{try{return COUNTRY_BY_CODE[c]||null}catch(e){return null}};
const nameOf=c=>{const x=CBC(c);return x?x.n:""};

/* ================= styles ================= */
const css=`
.gfsq-head{display:flex;align-items:center;gap:16px;justify-content:center;margin:2px 0 6px;text-align:left}
.gfsq-ring{position:relative;width:84px;height:84px;flex:0 0 84px}
.gfsq-ring svg{width:84px;height:84px;transform:rotate(-90deg)}
.gfsq-ring circle{fill:none;stroke-width:8}
.gfsq-ring .bg{stroke:rgba(127,127,127,.18)}
.gfsq-ring .fg{stroke:#2f9e6e;stroke-linecap:round;transition:stroke-dashoffset .8s ease}
.gfsq-ring b{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 22px/1 'Fraunces',serif}
.gfsq-ring b small{font:600 10px/1.2 inherit;font-family:inherit;opacity:.65;margin-top:3px}
.gfsq-hl h2{margin:0 0 2px!important;font-size:24px!important}
.gfsq-hl p{margin:0;font-size:14px;opacity:.82;max-width:34ch}
.gfsq-sec{margin:14px 0 6px;font:700 11px/1.2 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;opacity:.6;text-align:left}
.gfsq-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px;text-align:left;max-height:340px;overflow:auto;padding:2px}
.gfsq-row{display:flex;align-items:center;gap:9px;padding:6px 9px;border-radius:12px;background:rgba(127,127,127,.08);border:1px solid rgba(127,127,127,.14);min-width:0}
.gfsq-row.miss{background:rgba(232,160,60,.12);border-color:rgba(232,160,60,.32)}
.gfsq-th{flex:0 0 44px;width:44px;height:30px;display:flex;align-items:center;justify-content:center}
.gfsq-th img{max-width:44px;max-height:30px;border-radius:3px;box-shadow:0 0 0 1px rgba(0,0,0,.12)}
.gfsq-th svg{max-width:44px;max-height:30px;width:44px;height:30px}
.gfsq-th svg path{fill:currentColor!important;stroke:none!important}
.gfsq-row .gfsq-th{color:#2f9e6e}.gfsq-row.miss .gfsq-th{color:#d9822b}
.gfsq-tx{min-width:0;flex:1;line-height:1.25}
.gfsq-nm{all:unset;cursor:pointer;font-weight:700;font-size:14px;border-bottom:1px dotted currentColor}
.gfsq-nm:hover,.gfsq-nm:focus-visible{color:#2f7fc1}
.gfsq-cap{display:block;font-size:12px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gfsq-said{display:block;font-size:12px;color:#a35a12}
.gfsq-ok{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#2f9e6e;opacity:.8}
.gfsq-row.miss .gfsq-ok{background:#e8a03c}
.gfsq-map{margin:12px auto 2px;max-width:480px}
.gfsq-map svg{width:100%;height:auto;display:block;border-radius:12px;background:rgba(80,140,200,.12)}
.gfsq-map .l{fill:rgba(127,127,127,.28);stroke:none}
.gfsq-map .k{fill:#2f9e6e}.gfsq-map .m{fill:#e8a03c}
.gfsq-map .d{stroke:#fff;stroke-width:1.2}
.gfsq-key{font-size:11px;opacity:.7;margin-top:4px;display:flex;gap:12px;justify-content:center}
.gfsq-key i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:middle}
.gfsq-sub{font-size:12px;opacity:.7}
.summary-card.gfsq .missed-list,.summary-card.gfsq #sumMissedAll,.summary-card.gfsq .gfsq-old{display:none!important}
.summary-card.gfsq{width:min(760px,94vw)}
.summary-card.gfsq>.eyebrow{display:none}
body.sky-night .gfsq-said{color:#ffc27a}
body.sky-night .gfsq-row{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.sky-night .gfsq-row.miss{background:rgba(232,160,60,.14);border-color:rgba(232,160,60,.35)}
body.sky-night .gfsq-map .l{fill:rgba(255,255,255,.22)}
body.sky-night .gfsq-map .d{stroke:#1b2433}
body.sky-night .gfsq-nm:hover{color:#8cc8ff}
.d5-review .gfsq-said,.wi-sum .gfsq-said{display:block;font-weight:400}
.d5-review>div.gfsq-d5{display:flex;align-items:center;gap:8px;text-align:left}
.d5-review>div.gfsq-d5 img{width:34px;border-radius:3px}
.gfsq-more{margin-top:6px;text-align:left}.gfsq-more>summary{cursor:pointer;font-size:13px;font-weight:600;opacity:.8;padding:4px 2px}.gfsq-more>.gfsq-list{margin-top:4px}
.gfsq-enc{text-align:center;font-size:14px;opacity:.85;margin:4px 0 8px}
@media (max-width:520px){.gfsq-head{gap:10px}.gfsq-ring,.gfsq-ring svg{width:68px;height:68px;flex-basis:68px}.gfsq-ring b{font-size:18px}
 .gfsq-hl h2{font-size:20px!important}.gfsq-list{grid-template-columns:1fr;max-height:none}}
`;
function addCss(){if(document.getElementById("gfsqCss"))return;const s=document.createElement("style");s.id="gfsqCss";s.textContent=css;document.head.appendChild(s)}
addCss();

/* ================= shared pieces ================= */
function cheer(pct){
 if(pct>=100)return"A perfect round. Every single one.";
 if(pct>=90)return"Superb: almost all of them.";
 if(pct>=75)return"Great work, most of these are yours now.";
 if(pct>=50)return"Good going: more than half, and the rest are below to learn.";
 if(pct>=25)return"A start. Each one you look at below sticks a little better.";
 return"Every expert started here. Have a look at the answers below, then try again.";}
function ring(n,tot,sub){const pct=tot?Math.round(100*n/tot):0,R=36,C=2*Math.PI*R;
 return'<div class="gfsq-ring" role="img" aria-label="'+n+" of "+tot+' correct"><svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="'+R+'"/><circle class="fg" cx="42" cy="42" r="'+R+'" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-pct/100)).toFixed(1)+'"/></svg><b>'+pct+"%<small>"+esc(sub||"")+"</small></b></div>"}
function head(n,tot,title,sub){const pct=tot?Math.round(100*n/tot):0;
 return'<div class="gfsq-head">'+ring(n,tot,n+"/"+tot)+'<div class="gfsq-hl"><h2>'+esc(title)+"</h2><p>"+esc(cheer(pct))+"</p>"+(sub?'<p class="gfsq-sub">'+sub+"</p>":"")+"</div></div>"}

/* a small world map: land in grey, the round's countries in green (right) or amber (missed), with a dot each */
let landCache=null;
function miniMap(items){try{
 if(typeof d3==="undefined"||!d3.geoRobinson||!has("projFeatures")||!items.length)return"";
 const W=600,H=300,P=d3.geoRobinson().scale(96).translate([W/2,H/2+8]),path=d3.geoPath(P),F=projFeatures();
 if(!landCache){let s="";F.forEach(f=>{if(f.geometry&&f.properties&&f.properties.c!=="aq"){s+=path(f)||""}});landCache=s}
 const st=new Map(items.map(x=>[x.c,x.ok]));let hi="";
 F.forEach(f=>{const c=f.properties&&f.properties.c;if(f.geometry&&st.has(c))hi+='<path class="'+(st.get(c)?"k":"m")+'" d="'+(path(f)||"")+'"/>'});
 let dots="";items.forEach(x=>{const ll=(typeof COUNTRY_CENTROIDS!=="undefined"&&COUNTRY_CENTROIDS[x.c]);if(!ll)return;const q=P([ll[1],ll[0]]);if(!q)return;
  dots+='<circle class="d '+(x.ok?"k":"m")+'" cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3.4"><title>'+esc(nameOf(x.c))+"</title></circle>"});
 const anyMiss=items.some(x=>!x.ok),anyOk=items.some(x=>x.ok);
 return'<div class="gfsq-map"><svg viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Where this round\'s countries are"><path class="l" d="'+landCache+'"/>'+hi+dots+"</svg>"+
  '<div class="gfsq-key">'+(anyOk?'<span><i style="background:#2f9e6e"></i>got it</span>':"")+(anyMiss?'<span><i style="background:#e8a03c"></i>to practise</span>':"")+"</div></div>"}catch(e){return""}}

function thumb(c,kind){try{
 if(kind==="outline"&&has("countryOutlineSVG"))return'<span class="gfsq-th">'+countryOutlineSVG(c,"gfsq-olsvg")+"</span>";
 return'<span class="gfsq-th"><img src="'+flagUrl(c,"w80")+'" alt="" loading="lazy"></span>'}catch(e){return'<span class="gfsq-th"></span>'}}

/* one row: right answer with picture and profile link; a miss says gently what you said */
function row(x,kind,rightLabel,saidLabel,note){
 const nm=nameOf(x.c);const cap=rightLabel&&rightLabel!==nm?rightLabel:"";
 return'<div class="gfsq-row'+(x.ok?"":" miss")+'">'+thumb(x.c,kind)+'<span class="gfsq-tx"><button type="button" class="gfsq-nm" data-gfsq-prof="'+esc(x.c)+'" title="Open the profile of '+esc(nm)+'">'+esc(nm)+"</button>"+
  (cap?'<span class="gfsq-cap">'+esc(cap)+"</span>":"")+
  (!x.ok?'<span class="gfsq-said">'+(saidLabel?"you said "+esc(saidLabel)+" · it’s "+esc(rightLabel||nm):"skipped · it’s "+esc(rightLabel||nm))+(note?" · "+esc(note):"")+"</span>":(x.retry?'<span class="gfsq-said" style="color:inherit;opacity:.7">got it on the second try</span>':""))+
  '</span><i class="gfsq-ok" aria-hidden="true"></i></div>'}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-gfsq-prof]");if(!b)return;const c=CBC(b.dataset.gfsqProf);if(c&&has("openFlagZoom")){e.preventDefault();openFlagZoom(c)}});

/* ================= Study & Quiz rounds ================= */
/* what the player answered, caught at the moment of answering */
let said=null;
const btnLabel=b=>{if(!b)return"";return[...b.childNodes].filter(n=>!(n.classList&&(n.classList.contains("opt-key")||n.tagName==="KBD"))).map(n=>n.textContent).join("").trim()};
wrap("handleAnswer",o=>function(btn){said={label:btnLabel(btn)};return o.apply(this,arguments)});
wrap("submitOutlineChoice",o=>function(btn){said={label:btnLabel(btn)};return o.apply(this,arguments)});
wrap("submitTypeAnswer",o=>function(code,label){said={code:code,label:label};return o.apply(this,arguments)});
wrap("submitOutlineAnswer",o=>function(code){said={code:code};return o.apply(this,arguments)});
wrap("handleMapClick",o=>function(el,code){said={code:code};return o.apply(this,arguments)});
wrap("qzAnswer",o=>function(code){said={code:code};return o.apply(this,arguments)});
wrap("skipTypeAnswer",o=>function(){said={skip:true};return o.apply(this,arguments)});
wrap("skipMultiBlank",o=>function(){said={skip:true};return o.apply(this,arguments)});
wrap("finalizeMultiBlank",o=>function(t,inputs){try{said={label:[...(inputs||[])].map(i=>i.value).filter(Boolean).join(" / ")}}catch(e){}return o.apply(this,arguments)});
wrap("finalizeMultiChoice",o=>function(){try{said={label:(typeof multiSelected!=="undefined"?[...multiSelected].join(" / "):"")}}catch(e){}return o.apply(this,arguments)});
wrap("fobAnswer",o=>function(t,ll){try{said={ll:ll}}catch(e){}return o.apply(this,arguments)});
wrap("finalizeAnswer",o=>function(target,ok){try{if(typeof round!=="undefined"&&round&&target){const L=round._gfsq||(round._gfsq=[]);
  L.push({c:target.c,ok:!!ok,said:said,part:round.pp?round.pp.part:0,carry:!!(round.pp&&round.pp.isCarry)})}}catch(e){}said=null;return o.apply(this,arguments)});

function kindNow(){try{return appMode==="map"?"outline":"flag"}catch(e){return"flag"}}
function rightLabel(c){const x=CBC(c);if(!x)return"";try{if(appMode==="capital"&&has("answerLabel"))return answerLabel(x)}catch(e){}return x.n}
function saidLabel(s){if(!s||s.skip)return"";if(s.label)return s.label;if(s.code){const x=CBC(s.code);if(x){try{return appMode==="capital"&&has("answerLabel")?answerLabel(x):x.n}catch(e){return x.n}}return String(s.code).toUpperCase()}
 if(s.ll){try{const F=projFeatures();for(const f of F){if(f.geometry&&d3.geoContains(f,s.ll)){const x=CBC(f.properties.c);return x?"a spot in "+x.n:"that spot"}}}catch(e){}return"a spot in the sea"}return""}
/* the log of a round, one item per country: first try decides; a miss later fixed is noted */
function items(L){const by=new Map(),out=[];L.forEach(e=>{let it=by.get(e.c);if(!it){it={c:e.c,ok:e.ok,said:e.ok?null:e.said,retry:false,tries:1};by.set(e.c,it);out.push(it)}else{it.tries++;if(!it.ok&&e.ok)it.fixed=true}});return out}
function fromRound(r){/* a round restored from storage has no log: rebuild from the queue and the misses */
 const n=Math.min(r.queue.length,r.idx+(r.answered?1:0)),miss=new Set((r.missed||[]).map(c=>c.c));return r.queue.slice(0,n).map(c=>({c:c.c,ok:!miss.has(c.c),said:null}))}
function reviewHTML(list,kind,title){if(!list.length)return"";
 const misses=list.filter(x=>!x.ok),hits=list.filter(x=>x.ok);
 const R=x=>row(x,kind,rightLabel(x.c),saidLabel(x.said),x.fixed?"you got it later":x.back?"it comes back later in this round":"");
 /* the misses first; a long run of right answers folds away under one line */
 const fold=misses.length&&hits.length>4;
 return'<div class="gfsq-sec">'+esc(title||"Your answers")+(misses.length?" · "+misses.length+" to practise":"")+"</div>"+
  '<div class="gfsq-list">'+misses.map(R).join("")+(fold?"":hits.map(R).join(""))+"</div>"+
  (fold?'<details class="gfsq-more"><summary>The '+hits.length+" you got right</summary>"+'<div class="gfsq-list">'+hits.map(R).join("")+"</div></details>":"")}

/* the next region chip after the one in use (Common → Europe → Asia …), for "Next part" */
function nextRegionBtn(){try{const L=[...document.querySelectorAll("#quizView button[data-r], button.chip[data-r]")].filter(b=>b.offsetParent&&b.dataset.r!=="__custom__");
 const i=L.findIndex(b=>b.classList.contains("active"));if(i<0)return null;const n=L.slice(i+1).find(b=>b.dataset.r!=="All");return n||null}catch(e){return null}}

function decorateSummary(){const card=document.querySelector("#quizView .summary-card");if(!card||card.classList.contains("gfsq")||typeof round==="undefined"||!round||!round.queue)return;
 card.classList.add("gfsq");const kind=kindNow();
 const L=(round._gfsq&&round._gfsq.length)?items(round._gfsq):fromRound(round);
 const tot=round.queue.length,sc=round.score;
 /* the old score lines and missed chips give way to the new head and the review */
 const eb=card.querySelector(":scope > .eyebrow"),h2=card.querySelector(":scope > h2");
 [...card.children].forEach(ch=>{if(ch.tagName==="DIV"&&!ch.className&&/font-family/.test(ch.getAttribute("style")||""))ch.classList.add("gfsq-old")});
 if(h2)h2.classList.add("gfsq-old");
 const title=round.ended?"Round ended early":sc===tot?"Perfect round!":"Round complete";
 const html=head(sc,tot,title,"")+reviewHTML(L,kind)+miniMap(L);
 if(eb)eb.insertAdjacentHTML("afterend",html);else card.insertAdjacentHTML("afterbegin",html);
 /* buttons: clearer names, and Next part (the next region) when there is one */
 const acts=card.parentNode&&card.parentNode.querySelector(".round-actions");
 if(acts){const a=acts.querySelector("#againBtn");if(a&&!round.isReviewPool)a.textContent="Play again";
  const m=acts.querySelector("#retryMissedBtn");if(m)m.textContent="Practise the ones I missed ("+round.missed.length+")";
  const nb=nextRegionBtn();if(nb&&!round.customPool&&!round.isReviewPool&&!acts.querySelector("#gfsqNext")){const b=document.createElement("button");b.type="button";b.className="ghost-btn";b.id="gfsqNext";b.textContent="Next part: "+nb.textContent.trim()+" →";b.onclick=()=>{nb.click();setTimeout(()=>{try{if(typeof round!=="undefined"&&(!round.queue||!round.queue.length)&&has("startRound"))startRound()}catch(e){}},60)};acts.appendChild(b)}}
}
wrap("renderSummary",o=>function(){const r=o.apply(this,arguments);try{decorateSummary()}catch(e){console.error(e)}return r});

/* the break between parts: the same review for this part, the map, and plain button names */
wrap("partsBreakHTML",o=>function(r){let h=o.apply(this,arguments);try{const pp=r.pp,k=pp.part;const kind=kindNow();
 let L=(r._gfsq||[]).filter(e=>e.part===k);L=items(L);
 const back=new Set((pp.carry||[]).filter(x=>x.part===k).map(x=>x.c));L.forEach(x=>{if(!x.ok&&back.has(x.c))x.back=true});
 if(!L.length)return h;const sz=L.length,sc=L.filter(x=>x.ok).length;
 const add=head(sc,sz,"Part "+k+" of "+pp.n+" done","")+reviewHTML(L,kind,"This part")+miniMap(L);
 h=h.replace('<div class="summary-card part-card">','<div class="summary-card part-card gfsq">');
 h=h.replace(/<h2>[^<]*<\/h2>/,add);
 h=h.replace(/<div class="part-sub">[^<]*<\/div>/g,"");
 h=h.replace(/Continue to Part (\d+) →/,"Next part ($1 of "+pp.n+") →");
 h=h.replace(/Retry the (\d+) you missed first/,"Practise the $1 I missed first");
}catch(e){console.error(e)}return h});

/* ================= Daily 5 ================= */
/* the pick of each question is kept for the day, so the result can say what you answered */
const D5K="gfsqD5Picks";
function d5Picks(){try{return JSON.parse(localStorage.getItem(D5K)||"{}")}catch(e){return{}}}
wrap("ppD5Credit",o=>function(q,ok){try{if(typeof d5!=="undefined"&&d5){const P=d5Picks(),k=String(d5.day);if(!P[k])P[k]=[];const j=d5.qs.indexOf(q);if(j>=0)P[k][j]=d5.picked;Object.keys(P).sort().slice(0,-3).forEach(x=>delete P[x]);localStorage.setItem(D5K,JSON.stringify(P))}}catch(e){}return o.apply(this,arguments)});
wrap("d5Render",o=>function(){const r=o.apply(this,arguments);try{const v=document.getElementById("d5Host"),rv=v&&v.querySelector(".d5-review");if(!rv||rv.dataset.gfsq)return r;rv.dataset.gfsq="1";
 const qs=d5.qs,rec=d5Rec().rec,P=d5Picks()[String(d5.day)]||[],n=qs.length,score=rec.ans.filter(Boolean).length;
 const lab=(q,c)=>{try{return q.kind==="cap"?v4Cap(c):nameOf(c)}catch(e){return nameOf(c)}};
 rv.innerHTML=qs.map((q,j)=>{const ok=!!rec.ans[j],p=P[j];return'<div class="gfsq-d5 '+(ok?"ok":"no")+'"><img src="'+flagUrl(q.a,"w80")+'" alt=""><span style="flex:1"><span>'+esc(q.label)+'</span><br><button type="button" class="gfsq-nm" data-gfsq-prof="'+esc(q.a)+'">'+esc(lab(q,q.a))+"</button>"+
  (!ok&&p&&p!==q.a?'<span class="gfsq-said">you said '+esc(lab(q,p))+" · it’s "+esc(lab(q,q.a))+"</span>":"")+'</span><i class="gfsq-ok" style="background:'+(ok?"#2f9e6e":"#e8a03c")+'"></i></div>'}).join("");
 const fin=v.querySelector(".sp-final");if(fin&&!v.querySelector(".gfsq-enc"))fin.insertAdjacentHTML("afterend",'<p class="gfsq-enc">'+esc(cheer(Math.round(100*score/n)))+"</p>");
 const m=miniMap(qs.map((q,j)=>({c:q.a,ok:!!rec.ans[j]})));if(m)rv.insertAdjacentHTML("afterend",m);
}catch(e){console.error(e)}return r});

/* ================= Where is this? ================= */
/* each photo's guesses are kept in its log line, so the score sheet can say what you guessed first */
wrap("wiRender",o=>function(){const r=o.apply(this,arguments);try{if(typeof wi==="undefined"||wi.state!=="end")return r;const v=document.getElementById("gamesView"),s=v&&v.querySelector(".wi-sum");if(!s||s.dataset.gfsq)return r;s.dataset.gfsq="1";
 const rows=[...s.querySelectorAll(".wi-sum-i")];wi.log.forEach((l,j)=>{const el=rows[j];if(!el)return;const sp=el.querySelector("span");if(!sp)return;const c=CBC(l.c);if(!c)return;
  sp.innerHTML='<img class="wi-fl" src="'+flagUrl(l.c,"w40")+'" alt=""><button type="button" class="gfsq-nm" data-gfsq-prof="'+esc(l.c)+'">'+esc(c.n)+"</button>"+(!l.ok&&l.g1&&l.g1!==l.c?'<span class="gfsq-said">you said '+esc(nameOf(l.g1))+" · it’s "+esc(c.n)+"</span>":"")});
 const fin=v.querySelector(".wi-final");if(fin&&!v.querySelector(".gfsq-enc")){const pct=Math.round(100*(wi.total||0)/25000);fin.insertAdjacentHTML("afterend",'<p class="gfsq-enc">'+esc(cheer(Math.min(100,pct+10)))+"</p>")}
 const m=miniMap(wi.log.map(l=>({c:l.c,ok:!!l.ok})));if(m)s.insertAdjacentHTML("afterend",m);
}catch(e){console.error(e)}return r});
wrap("wiFinish",o=>function(){try{if(typeof wi!=="undefined"&&wi.guesses){wi._g1=wi.guesses.length?wi.guesses[0].c:null}}catch(e){}const r=o.apply(this,arguments);try{const l=wi.log[wi.log.length-1];if(l&&l.g1===undefined)l.g1=wi._g1}catch(e){}return r});

})();
