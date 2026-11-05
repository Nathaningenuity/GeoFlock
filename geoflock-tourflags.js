/* GeoFlock: review flags on guided-tour stops (overnight tour review of 2026-11-05).
   A flagged stop is one the review thought weak: it repeats a stop in another tour, it is text only, or it shows little
   on the map. Nothing is removed: the owner decides. Each flag shows
   - in the tour card, a small amber "⚑ Review: <reason>" chip under the stop title;
   - in the card's stop dots, an amber ring on the flagged stops (hover for the reason), and a ⚑ after "Stop n of m";
   - on the tour cards in the tour lists, a small "⚑ n" badge on the picture (n flagged stops in that tour), and a ⚑
     after a flagged stop in the card's short list of stops (hover for the reason).
   Keys are "tour id|stop title" (the title as the card shows it). To drop one flag, delete its line; to remove all of
   them, delete this file and its <script> tag in index.html. Nothing else depends on it. */
window.GF_TOUR_FLAGS={
 "hsamerica|Brasília":"Repeats Capital cities stop 7 (Brasília); also in AP tour 2a",
 "oceania|The biggest blast in a century":"Repeats Volcanoes stop 10 (Hunga Tonga 2022, same 57 km stat)",
 "hgunpowder|1492":"Repeats Explorers stop 4 (Columbus, 1492); the next stop covers the Columbian exchange",
 "words|Hangul: an alphabet by design":"Repeats History of Asia stop 7 (Hangul, King Sejong, 1443)",
 "antarctica|Hidden under the ice":"Overlaps Lakes stop 16 (Lake Vostok under the ice)",
 "antarctica|The moving South Pole":"Repeats Time zones stop 17 (every time zone meets at the Pole); the moving marker is the only new fact",
 "amigration|Red crabs march to the sea":"Repeats Island life stop 3 (Christmas Island red crabs)",
 "space|A sea that shrank":"Repeats Lakes stop 6 (the Aral Sea); also AP tour 5d stop 4",
 "deserts|The great salt flat":"Third Salar de Uyuni stop (also South America 13 and Space 14)",
 "hrevolutions|The law of bird droppings":"Repeats Energy & resources stop 14 (the Guano Islands Act)",
 "weather|The Sahara feeds the Amazon":"Repeats Space stop 9 (Bodélé dust feeds the Amazon)",
 "ice|Ice that remembers":"Repeats History of Antarctica stop 14 (the 1.2-million-year ice core)",
 "coasts|A coast built by animals":"Repeats Oceania stop 6 (Great Barrier Reef, about 2,300 km)",
 "islandlife|Krakatoa starts again":"Stat repeats Hazards stop 9 (Krakatoa heard 4,800 km away); the regrowth story is only in the body",
 "islandlife|Islands in the sky":"Stat repeats South America stop 12 (Angel Falls, 979 m); only the tepui-as-island idea is new",
 "hsince91|The Darién Gap":"Repeats AP tour 2c stop 3 (the Darién Gap, half a million in 2023)",
 "cities|The fall line":"Third fall-line stop (also North America 7 and AP tour 6a stop 1)",
 "hg1|A coastline in the votes":"Repeats Population stop 8 (Alabama’s chalk-belt vote)",
 "namerica|The longest border":"Repeats Borders stop 1 (Canada–US, the longest border)",
 "asia|The two giants’ neighbours":"Repeats Borders stop 2 (China and Russia, 14 neighbours each); little new on the map",
 "asia|Most people":"Generic ranking that repeats Population stop 1",
 "africa|Most people":"Generic top-5 list; the Nigeria fact is already in Population stop 11",
 "hasia|Angkor":"Repeats Landmarks stop 6 (Angkor Wat, same stat)",
 "landmarks|An island only twice a day":"Repeats Islands stop 7 (Mont-Saint-Michel’s tides); only one pin on the map",
 "samerica|Europe in South America":"Repeats Borders stop 16 (France–Brazil border)",
 "oceania|Big ocean states":"Overlaps Islands stop 13 (Kiribati’s tiny land and huge sea zone)",
 "learning|Cables under the sea":"Off-topic for learning, and repeats Geopolitics stop 19 (seabed cables)",
 "cities|Money cities":"Generic fact (New York and London lead); overlaps AP tour 6a stop 8 (world cities)",
 "cities|Africa’s booming cities":"Generic; five photos but no growth figures or data on the map",
 "langrel|Holy cities":"Generic list of holy places; short text, little on the map",
 "hg3a|A shrinking world":"Repeats AP tour 1 stop 11 (time–space compression)",
 "hg3a|Global culture, local culture":"Text only: generic definition, nothing specific on the map",
 "hg3b|Two ways of judging":"Abstract definition (ethnocentrism vs relativism); the pins don’t show the idea",
 "hg3c|Acculturation and assimilation":"Text only: definition with one photo, nothing on the map",
 "hg6c|Smart growth":"Thin: one photo and a one-line definition",
 "hg6c|New urbanism":"Overlaps stop 7 (smart growth); one photo only",
 "hg6d|Squatter settlements":"Overlaps stop 6 (informal settlements) and stop 8 (disamenity zones)",
 "hg6d|Zones of abandonment":"Very short definition with one photo",
 "hg5d|Organic and local food":"Generic definition with one photo, nothing on the map",
 "hg5d|Food deserts":"Generic definition; one pin, no data shown"
};
(function(){
"use strict";
const F=window.GF_TOUR_FLAGS||{};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const flagOf=(tour,S)=>S?F[tour+"|"+strip(S.title)]||null:null;
const live=()=>{try{return typeof ps!=="undefined"&&!!ps&&!!ps.card}catch(e){return false}};
const steps=()=>{try{return psSteps()||[]}catch(e){return[]}};
const perTour={};for(const k in F){const t=k.split("|")[0];perTour[t]=(perTour[t]||0)+1}

/* styles: amber, small, readable in both themes */
const css=`
.gftf-chip{display:flex;gap:6px;align-items:flex-start;margin:2px 0 8px;padding:5px 9px;border-radius:8px;
 background:rgba(245,158,11,.13);border:1px dashed rgba(217,119,6,.65);color:#92400e;font-size:12.5px;line-height:1.35;font-weight:600}
.gftf-chip b{font-weight:800;white-space:nowrap}
html[data-theme="dark"] .gftf-chip,body.dark-theme .gftf-chip,body.sky-night .gftf-chip{background:rgba(245,158,11,.16);border-color:rgba(251,191,36,.6);color:#fcd34d}
.ps-dots i.gftf-dot{box-shadow:0 0 0 2px #f59e0b}
.ps-count .gftf-mark{margin-left:6px;color:#d97706;font-weight:800}
html[data-theme="dark"] .ps-count .gftf-mark,body.dark-theme .ps-count .gftf-mark,body.sky-night .ps-count .gftf-mark{color:#fbbf24}
.tr-sample li.gftf-li::after{content:" ⚑";color:#d97706;font-weight:800}
body.sky-night .tr-sample li.gftf-li::after,html[data-theme="dark"] .tr-sample li.gftf-li::after,body.dark-theme .tr-sample li.gftf-li::after{color:#fbbf24}
.gftf-badge{position:absolute;top:6px;right:6px;z-index:2;padding:1px 6px;border-radius:999px;background:#f59e0b;color:#3b2300;
 font:700 11px/1.5 system-ui,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.25);pointer-events:none}
`;
function addCss(){if(document.getElementById("gftf-css"))return;const st=document.createElement("style");st.id="gftf-css";st.textContent=css;(document.head||document.documentElement).appendChild(st)}

/* the open tour card: chip, header mark, dots */
function decorateCard(){if(!live())return;const card=ps.card,st=steps(),S=st[ps.i];if(!S)return;
 const r=flagOf(ps.tour,S);let chip=card.querySelector(".gftf-chip");
 if(r){const html='<b>⚑ Review:</b><span>'+esc(r)+'</span>';
  if(!chip){const t=card.querySelector(".ps-title");if(t){chip=document.createElement("div");chip.className="gftf-chip";chip.setAttribute("role","note");chip.setAttribute("data-nodark","");t.insertAdjacentElement("afterend",chip)}}
  if(chip&&chip._r!==r){chip.innerHTML=html;chip._r=r;chip.title="Flagged by the tour review: "+r}}
 else if(chip)chip.remove();
 const cnt=card.querySelector(".ps-count");if(cnt){let m=cnt.querySelector(".gftf-mark");
  if(r&&!m){m=document.createElement("span");m.className="gftf-mark";m.textContent="⚑";m.title="This stop is flagged for review";cnt.appendChild(m)}else if(!r&&m)m.remove()}
 const dots=card.querySelectorAll(".ps-dots i");dots.forEach((d,k)=>{const rr=flagOf(ps.tour,st[k]);
  if(rr){if(!d.classList.contains("gftf-dot")){d.classList.add("gftf-dot");const base=d.getAttribute("title")||strip(st[k]&&st[k].title);d.setAttribute("title",(base?base+" · ":"")+"⚑ "+rr)}}
  else if(d.classList.contains("gftf-dot"))d.classList.remove("gftf-dot")})}

/* tour cards in the tour lists: a badge on the card's picture, and a ⚑ on flagged stops in its short stop list */
function decorateLists(){document.querySelectorAll(".hx-tour[data-hx-tour],[data-tour-go]").forEach(el=>{
 if(!el.classList.contains("hx-tour")&&!el.querySelector("img,.tr-thumb-ph"))return; /* not the picture (e.g. a Start button) */
 const id=el.getAttribute("data-hx-tour")||el.getAttribute("data-tour-go");const n=perTour[id]||0;
 let b=el.querySelector(":scope > .gftf-badge");if(!n){if(b)b.remove();return}
 if(!b){if(getComputedStyle(el).position==="static")el.style.position="relative";b=document.createElement("span");b.className="gftf-badge";el.appendChild(b)}
 const txt="⚑ "+n;if(b.textContent!==txt){b.textContent=txt;b.title=n+(n>1?" stops":" stop")+" flagged for review in this tour"}
 const card=el.closest(".tr-card");if(card)card.querySelectorAll(".tr-sample li:not(.tr-more)").forEach(li=>{const r=F[id+"|"+strip(li.textContent.replace(/^⚑\s*/,""))];
  if(r&&!li.classList.contains("gftf-li")){li.classList.add("gftf-li");li.title="⚑ Review: "+r}})})}

let pend=false;function soon(){if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;try{decorateCard()}catch(e){}try{decorateLists()}catch(e){}})}
const LIST=".hx-tour,[data-tour-go]";
const relevant=m=>{const t=m.target;if(t&&t.nodeType===1&&t.closest&&t.closest(".ps-card"))return true;
 for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches&&(n.matches(LIST+",.ps-card")||n.querySelector(LIST)))return true}return false};
function start(){addCss();soon();try{new MutationObserver(muts=>{for(const m of muts){if(relevant(m)){soon();return}}}).observe(document.body,{childList:true,subtree:true})}catch(e){}
 setInterval(soon,1500)}
window.gfTourFlags={list:F,perTour,refresh:soon};
if(document.body)start();else addEventListener("DOMContentLoaded",start);
})();
