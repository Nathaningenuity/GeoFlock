/* GeoFlock: the Tours page's shelves. Eight subject shelves plus Regions, in a set order; a shelf with no tours yet
   (Mapped books, until its tours exist) stays hidden. Tours not listed here keep their own shelf (AP Human Geo has its own page). */
(function(){
if(typeof TOUR_GROUPS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const SHELVES=[
 ["start","Start here","What the maps show, how maps can mislead, and the Earth seen whole",["geo","pop","projections","space","night","time"]],
 ["physical","Physical Earth","Height, plates, climate, water, islands and the forces that shape the land",["elev","plates","climate","rivers","lakes","seas","islands","hazards"]],
 ["living","Living planet","Animals, ecosystems, island life and where we came from",["animals","environment","islandlife","humans"]],
 ["culture","People & culture","Cities, migration, languages, religions, food, sport, landmarks and flags",["cities","migration","people","culture","langrel","food","musicsport","landmarks","flags"]],
 ["ideas","Ideas & arts","What people made and thought, and where it spread",["inventions"]],
 ["power","Power & economy","Governments, alliances, borders, money, trade and resources",["politics","govmap","geopol","borders","regions","gdp","transport","resources"]],
 ["history","History","World history from the first cities to today, the explorers, then one tour for each continent",["hancient","hempires","hmodern","explorers","heurope","hasia","hafrica","hnamerica","hsamerica","hoceania","hantarctica"]],
 ["cont","Regions","Seven tours, one for each continent",["europe","asia","africa","namerica","samerica","oceania","antarctica"]],
 ["books","Mapped books","Famous books about the world, followed on the map",[]]];
function apply(){try{
 const own=new Set(SHELVES.map(s=>s[0]));
 /* the shelves, in order; any other shelf (AP Human Geo) stays after them */
 const rest=TOUR_GROUPS.filter(g=>!own.has(g[0])&&!["maps","water","lines","nature","world"].includes(g[0]));
 TOUR_GROUPS.splice(0,TOUR_GROUPS.length,...SHELVES.map(s=>[s[0],s[1],s[2]]),...rest);
 const listed=[];SHELVES.forEach(s=>s[3].forEach(k=>{if(PS_TOURS[k]){PS_TOURS[k].group=s[0];listed.push(k)}}));
 /* tours left on a retired shelf go to the closest new one */
 const MOVE={maps:"power",water:"physical",lines:"power",nature:"living",world:"culture"};
 Object.keys(PS_TOURS).forEach(k=>{const g=PS_TOURS[k].group;if(MOVE[g]&&!listed.includes(k))PS_TOURS[k].group=MOVE[g]});
 const others=PS_TOUR_ORDER.filter(k=>!listed.includes(k));PS_TOUR_ORDER.splice(0,PS_TOUR_ORDER.length,...listed,...others);
 /* the shorter names this layout wants */
 const NM={night:"Earth at night",culture:"Languages",langrel:"Religions",politics:"International relations",govmap:"Politics",regions:"Special regions"};
 for(const k in NM)if(PS_TOURS[k])PS_TOURS[k].short=NM[k];
}catch(e){console.error(e)}}
window.gfTourShelves=SHELVES;
/* ---------- shelf tabs at the top of the Tours page: All, or one shelf at a time (remembered) ---------- */
const COL={start:"#6ed0c8",physical:"#c9a06a",living:"#7cc77a",culture:"#f2a7bd",ideas:"#b79be6",power:"#8fb6f2",history:"#e9b07a",cont:"#7cd2f0",books:"#d9b98a"};
const css=document.createElement("style");css.textContent=`
.tr-shelf-tabs{ display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin:4px auto 14px; max-width:1100px; }
.tr-shelf-tabs button{ font:inherit; font-weight:700; font-size:13.5px; display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:999px; cursor:pointer;
 border:2px solid var(--c); background:rgba(255,255,255,.6); color:#24304a; transition:background .15s; }
.tr-shelf-tabs button:hover{ background:color-mix(in srgb,var(--c) 30%,#fff); }
.tr-shelf-tabs button.on{ background:var(--c); }
.tr-shelf-tabs button i{ font-style:normal; font-weight:600; font-size:11.5px; opacity:.6; }
body.dark .tr-shelf-tabs button{ background:rgba(20,26,38,.55); color:#e8ecf3; } body.dark .tr-shelf-tabs button.on{ background:var(--c); color:#141a26; }
.tr-sec.tr-off{ display:none !important; }
@media (max-width:760px){ .tr-shelf-tabs{ flex-wrap:nowrap; overflow-x:auto; justify-content:flex-start; scrollbar-width:none; padding:0 8px; } .tr-shelf-tabs button{ flex:none; font-size:12.5px; padding:6px 11px; } }`;
document.head.appendChild(css);
let SEL="all";try{SEL=localStorage.getItem("gfTourShelf")||"all"}catch(e){}
function tabs(){const v=document.getElementById("toursView");if(!v)return;const w=v.querySelector(".tr-wrap");if(!w)return;
 const secs=[...w.querySelectorAll(":scope > section.tr-sec")],byName=Object.fromEntries(SHELVES.map(x=>[x[1],x[0]]));
 secs.forEach(sec=>{const h=sec.querySelector("h3");sec.dataset.g=h&&byName[h.textContent.trim()]||"other"});
 const present=SHELVES.filter(x=>secs.some(sec=>sec.dataset.g===x[0]));if(!present.some(x=>x[0]===SEL))SEL="all";
 let nav=w.querySelector(".tr-shelf-tabs");if(!nav){nav=document.createElement("nav");nav.className="tr-shelf-tabs";nav.setAttribute("aria-label","Kinds of tour");const bar=w.querySelector(".ts-bar");if(bar)w.insertBefore(nav,bar);else return}
 const n=g=>secs.filter(sec=>sec.dataset.g===g).reduce((a,sec)=>a+sec.querySelectorAll(".tr-grid > *").length,0);
 nav.innerHTML='<button type="button" data-sh="all" style="--c:#c4ccd8" class="'+(SEL==="all"?"on":"")+'">All tours</button>'+present.map(x=>'<button type="button" data-sh="'+x[0]+'" style="--c:'+(COL[x[0]]||"#c4ccd8")+'" class="'+(SEL===x[0]?"on":"")+'" title="'+x[2].replace(/"/g,"&quot;")+'">'+x[1]+' <i>'+n(x[0])+'</i></button>').join("");
 nav.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{SEL=b.dataset.sh;try{localStorage.setItem("gfTourShelf",SEL)}catch(e){}tabs();const q=w.querySelector(".ts-in");if(q&&q.value){q.value="";q.dispatchEvent(new Event("input",{bubbles:true}))}});
 filter()}
function filter(){const w=document.querySelector("#toursView .tr-wrap");if(!w)return;const q=w.querySelector(".ts-in"),searching=!!(q&&q.value.trim());
 w.querySelectorAll(":scope > section.tr-sec").forEach(sec=>sec.classList.toggle("tr-off",!searching&&SEL!=="all"&&sec.dataset.g!==SEL));
 if(q&&!q._gfSh){q._gfSh=1;q.addEventListener("input",()=>setTimeout(filter,0))}}
if(typeof renderToursView==="function"){const _rt=renderToursView;renderToursView=function(){const r=_rt.apply(this,arguments);try{tabs()}catch(e){console.error(e)}return r}}
if(typeof toursRegroup==="function"){const _r=toursRegroup;toursRegroup=function(){const r=_r.apply(this,arguments);apply();return r}}
apply();setTimeout(apply,0);document.addEventListener("DOMContentLoaded",()=>setTimeout(apply,400));
})();
