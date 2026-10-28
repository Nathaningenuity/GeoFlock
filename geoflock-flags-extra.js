/* GeoFlock: Flags study extras — "Flag stories" (the flags tour, as cards in the Flags section) and "Flag history" (a timeline).
   Hooks into the Flags study region row the same way Flag Families does. */
(function(){
if(typeof renderChrome!=="function"||typeof renderActiveView!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fl=(c,w)=>typeof flagUrl==="function"?flagUrl(c,w||"w160"):"";
let view=null;/* null, "stories" or "history" */
/* a timeline of flags; years are when the flag (or idea) first appears in the record */
const HIST=[
 {y:"c. 3000 BC",t:"Standards before flags",d:"Egyptian armies carried vexilloids: poles topped with carved emblems of gods or animals. They did the job of a flag before cloth flags existed.",ic:"🏺"},
 {y:"c. 100 BC",t:"The Roman vexillum",d:"Roman cavalry flew a square of cloth hung from a crossbar. The study of flags, vexillology, is named after it.",ic:"🛡️"},
 {y:"1219",t:"The Dannebrog",d:"Legend says Denmark's red flag with a white cross fell from the sky during a battle in Estonia. It is the oldest national flag still in use, certainly flown by the 1300s, and the model for every Nordic cross.",c:["dk"]},
 {y:"1339",t:"The Swiss cross",d:"Swiss fighters wore a white cross at the Battle of Laupen. Today's square red flag with a white cross grew out of the banner of Schwyz.",c:["ch"]},
 {y:"1606",t:"The first Union Flag",d:"When England and Scotland shared a king, their crosses of St George and St Andrew were combined into one flag.",c:["gb"]},
 {y:"1630s",t:"The first tricolour",d:"The Dutch rebels' orange, white and blue stripes slowly turned red, white and blue. Three bold stripes became the most copied flag design in the world.",c:["nl"]},
 {y:"1777",t:"Stars and Stripes",d:"The US Congress chose 13 stripes and 13 stars for the 13 states. A star is added for each new state; the 50-star flag dates from 1960.",c:["us"]},
 {y:"1794",t:"The French tricolour",d:"Blue, white and red became France's national flag during the Revolution. It inspired tricolours from Italy to Ireland to Mexico.",c:["fr","it","ie","mx"]},
 {y:"1801",t:"The Union Jack takes its shape",d:"St Patrick's saltire was added for Ireland, giving the Union Flag the design still flown today and found in the corner of other flags.",c:["gb","au","nz","fj","tv"]},
 {y:"1810s–20s",t:"Flags of Latin American independence",d:"New republics chose new flags. Simón Bolívar's yellow, blue and red lives on in Colombia, Ecuador and Venezuela; the blue and white of the River Plate in Argentina and Uruguay.",c:["co","ec","ve","ar","uy"]},
 {y:"1848",t:"Pan-Slavic colours",d:"A Slavic congress in Prague adopted white, blue and red, the colours of Russia's flag, as a symbol of Slavic unity.",c:["ru","rs","sk","si","hr","cz"]},
 {y:"1870",t:"The Rising Sun disc",d:"Japan made the red disc on white the flag for its ships. It only became the official national flag by law in 1999.",c:["jp"]},
 {y:"1916",t:"Pan-Arab colours",d:"The Arab Revolt against the Ottomans flew black, green, white and red. They live on in the flags of Jordan, Palestine, Iraq, Kuwait, the UAE and more.",c:["jo","ps","iq","kw","ae","sd"]},
 {y:"1920",t:"Red, black and green",d:"Marcus Garvey's movement made red, black and green the colours of African freedom. Kenya and Malawi use them.",c:["ke","mw"]},
 {y:"1957",t:"Ghana's black star",d:"Ghana, the first sub-Saharan colony to win independence, took Ethiopia's green, gold and red. Dozens of African flags followed.",c:["gh","et","sn","ml","cm","gn"]},
 {y:"1960",t:"The Year of Africa",d:"Seventeen African countries became independent in a single year, and 17 new flags were raised.",c:["ng","cd","ci","sn","td","ne"]},
 {y:"1965",t:"The Maple Leaf",d:"Canada replaced its Red Ensign with the red maple leaf after a long national debate.",c:["ca"]},
 {y:"1994",t:"A flag for a new South Africa",d:"Designed in a few weeks for the first democratic election, its Y shape stands for different peoples coming together.",c:["za"]},
 {y:"2025",t:"Syria changes its flag",d:"After the fall of the Assad government, Syria adopted the green, white and black flag with three red stars that had been flown by the opposition.",c:["sy"]}];
function storiesHTML(){const T=(typeof PS_TOURS!=="undefined"&&PS_TOURS.flags)||{steps:[]};const steps=T.steps.slice(1).filter(s=>s.title&&s.title!=="Now explore");
 return'<div class="fx-wrap"><div class="fx-head"><h2>Flag stories</h2><p>Why flags look alike: shared religions, revolutions and empires.</p></div>'+
 steps.map((S,i)=>{const L=(S.hi||[]).filter(c=>COUNTRY_BY_CODE[c]).slice(0,12);return'<article class="fx-card"><div class="fx-flags">'+L.map(c=>'<img src="'+fl(c,"w160")+'" alt="'+esc(COUNTRY_BY_CODE[c].n)+'" title="'+esc(COUNTRY_BY_CODE[c].n)+'" loading="lazy">').join("")+'</div><h3>'+esc(S.title)+'</h3>'+(S.stat?'<p class="fx-stat">'+esc(S.stat)+'</p>':'')+'<p>'+esc(S.body||"")+'</p>'+(S.more?'<details><summary>Tell me more</summary><p>'+esc(S.more)+'</p></details>':'')+'</article>'}).join("")+'</div>'}
/* the oldest entries show the real thing: the standards carved on the Narmer Palette, and the one Roman vexillum that survives */
const HPIC={"Standards before flags":{src:"flags-extra/h-narmer.webp",cap:"Standard-bearers on the Narmer Palette, Egypt, c. 3100 BC: poles topped with a jackal and falcons",cr:"Photo: public domain, via Wikimedia Commons",page:"https://commons.wikimedia.org/wiki/File:Narmer_Palette.jpg"},
 "The Roman vexillum":{src:"flags-extra/h-vexillum.webp",cap:"The only Roman vexillum that survives (3rd century AD, Pushkin Museum, Moscow)",cr:"Photo: public domain, via Wikimedia Commons",page:"https://commons.wikimedia.org/wiki/File:Vexillum-Pushkin_Museum_of_Fine_Arts.png"}};
function histMap(t){const M=HPIC[t];if(!M)return"";return'<figure class="fx-hmap"><img src="'+M.src+'" alt="'+esc(M.cap)+'" loading="lazy"><figcaption>'+esc(M.cap)+' · <a href="'+M.page+'" target="_blank" rel="noopener">'+esc(M.cr)+'</a></figcaption></figure>'}
function historyHTML(){return'<div class="fx-wrap"><div class="fx-head"><h2>A short history of flags</h2><p>From painted standards to the flags of new countries.</p></div><ol class="fx-tl">'+
 HIST.map(h=>'<li><span class="fx-y">'+esc(h.y)+'</span><div class="fx-tlc"><h3>'+(h.ic?'<span class="fx-ic">'+h.ic+'</span> ':'')+esc(h.t)+'</h3><p>'+esc(h.d)+'</p>'+histMap(h.t)+(h.c?'<div class="fx-flags sm">'+h.c.filter(c=>COUNTRY_BY_CODE[c]).map(c=>'<img src="'+fl(c,"w80")+'" alt="'+esc(COUNTRY_BY_CODE[c].n)+'" title="'+esc(COUNTRY_BY_CODE[c].n)+'" loading="lazy">').join("")+'</div>':'')+'</div></li>').join("")+'</ol></div>'}
function show(){const v=document.getElementById("studyView");if(!v)return;v.style.display="";v.innerHTML=view==="stories"?storiesHTML():historyHTML();
 v.querySelectorAll(".fx-map").forEach(b=>b.onclick=()=>{const i=+b.dataset.step;try{switchAppMode("allmaps")}catch(e){}setTimeout(()=>{try{psLaunchTour("flags");setTimeout(()=>{try{psGo(i)}catch(e){}},400)}catch(e){console.error(e)}},350)})}
{const _rc=renderChrome;renderChrome=function(){const r=_rc.apply(this,arguments);try{const row=document.getElementById("regionRow");if(appMode!=="flag"||activeTab!=="study"){view=null;return r}
 if(row){[["__stories__","Flag stories","stories"],["__history__","Flag history","history"]].forEach(([k,lab,id])=>{let b=row.querySelector('[data-r="'+k+'"]');if(!b){b=document.createElement("button");b.className="chip";b.dataset.r=k;b.textContent=lab;b.onclick=()=>{view=id;try{ffInStudy=false}catch(e){}renderChrome();renderActiveView()};row.appendChild(b)}b.classList.toggle("active",view===id)});
  /* the three Flags extras sit on their own row below the regions */
  const fam=row.querySelector('[data-r="__families__"]')||row.querySelector('[data-r="__stories__"]');if(fam&&!row.querySelector(".fx-break")){const br=document.createElement("span");br.className="fx-break";br.style.cssText="flex-basis:100%;width:100%;height:0";row.insertBefore(br,fam)}
  ["__families__","__stories__","__history__"].forEach(k=>{const b=row.querySelector('[data-r="'+k+'"]');if(b)row.appendChild(b)});
  if(view)row.querySelectorAll('.chip.active:not([data-r="__stories__"]):not([data-r="__history__"])').forEach(x=>x.classList.remove("active"));
  row.querySelectorAll('.chip:not([data-r="__stories__"]):not([data-r="__history__"])').forEach(x=>{if(!x._fx){x._fx=1;x.addEventListener("click",()=>{view=null},true)}})}}catch(e){console.error(e)}return r}}
{const _rav=renderActiveView;renderActiveView=function(){const r=_rav.apply(this,arguments);try{if(view&&appMode==="flag"&&activeTab==="study")show()}catch(e){console.error(e)}return r}}
const css=document.createElement("style");css.textContent=`
.fx-wrap{ max-width:900px; margin:6px auto 30px; padding:0 12px; } .fx-head{ text-align:center; margin-bottom:14px; } .fx-head h2{ margin:0 0 4px; } .fx-head p{ margin:0; opacity:.75; }
.fx-card{ background:rgba(255,255,255,.88); border-radius:20px; box-shadow:0 4px 16px rgba(20,40,70,.08); padding:16px 18px; margin:0 0 14px; }
.fx-card h3{ margin:10px 0 4px; } .fx-stat{ font-weight:700; color:#b4406b; margin:0 0 6px; } .fx-card p{ margin:0 0 6px; line-height:1.5; } .fx-card details{ margin:4px 0 8px; } .fx-card summary{ cursor:pointer; font-weight:700; opacity:.8; }
.fx-flags{ display:flex; flex-wrap:wrap; gap:8px; } .fx-flags img{ height:42px; border-radius:4px; box-shadow:0 1px 5px rgba(0,0,0,.22); } .fx-flags.sm img{ height:26px; }
.fx-tl{ list-style:none; margin:0; padding:0 0 0 8px; border-left:3px solid rgba(201,90,128,.35); }
.fx-tl li{ position:relative; display:grid; grid-template-columns:92px 1fr; gap:12px; padding:0 0 18px 14px; } .fx-tl li::before{ content:""; position:absolute; left:-9.5px; top:4px; width:14px; height:14px; border-radius:50%; background:#c95a80; box-shadow:0 0 0 3px #fff; }
.fx-hmap{ margin:10px 0 4px; max-width:240px; } .fx-hmap img{ width:100%; height:auto; display:block; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,.12); } .fx-hmap a{ color:inherit; } .fx-hmap svg{ width:100%; height:auto; display:block; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,.12); } .fx-hmap figcaption{ font-size:12px; color:#6a7684; margin-top:4px; }
.fx-y{ font-weight:800; color:#b4406b; font-size:14px; padding-top:1px; } .fx-tlc{ background:rgba(255,255,255,.88); border-radius:16px; box-shadow:0 3px 12px rgba(20,40,70,.07); padding:10px 14px; } .fx-tlc h3{ margin:0 0 4px; font-size:16px; } .fx-tlc p{ margin:0 0 6px; line-height:1.45; } .fx-ic{ font-size:18px; }
body.sky-night .fx-card, body.sky-night .fx-tlc, body.dark-theme .fx-card, body.dark-theme .fx-tlc{ background:rgba(30,34,60,.9); }
@media (max-width:560px){ .fx-tl li{ grid-template-columns:1fr; gap:4px; } }`;
document.head.appendChild(css);
})();
