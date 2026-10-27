/* GeoFlock: the Economy map (was the GDP map), "Other ▾" measure tabs, the population cartogram, and the globe's
   measure tabs placed under the tour button.
   Measures are drawn with the same colour-category system as the Politics, Culture and People maps (TH_THEMES);
   their data lives in geoflock-econ-data.js (GF_ECON_THEMES). */
(function(){
if(typeof ALLMAPS_SUBMODES==="undefined"||typeof TH_THEMES==="undefined")return;

/* ---------- 1. Economy map: the GDP map's measures plus colour-category ones ---------- */
const ECON=window.GF_ECON_THEMES||{};
Object.assign(TH_THEMES,ECON);
const ECON_SUBS=[["total","GDP"],["percapita","GDP per person"],["growth","Growth"],["export","Main export"],["currency","Currencies"],["blocs","Trade blocs"],
 ["tourism","Tourism"],["trade","Trade"],["remit","Money sent home"],["debt","Government debt"],["gini","Inequality"],["poverty","Extreme poverty"],["co2pc","CO₂ per person"],["co2tot","CO₂ in total"],["renew","Renewable energy"]];
ALLMAPS_SUBMODES.gdp=ECON_SUBS.filter(([id])=>id==="total"||id==="percapita"||TH_THEMES[id]).map(([id,label])=>({id,label}));
/* the GDP measures keep their own colours; every other Economy measure is a colour-category theme */
{const has=Set.prototype.has;TH_MODES.has=function(m){if(m==="gdp")return!!(typeof allMapsSubMode!=="undefined"&&TH_THEMES[allMapsSubMode.gdp]&&allMapsSubMode.gdp!=="total"&&allMapsSubMode.gdp!=="percapita");return has.call(this,m)}}
try{TOUR_MAPNAME.gdp="Economy map"}catch(e){}

/* number measures show just the number on hover ("2.6% a year on average (2025)"), not the band too */
{const _hv=allMapsHoverValue;allMapsHoverValue=function(code){const r=_hv.apply(this,arguments);try{const T=TH_MODES.has(allMapsColorMode)&&TH_THEMES[allMapsSubMode[allMapsColorMode]];if(r&&T&&T.num){const i=T.info&&T.info[code];if(i)return[i,r[1]]}}catch(e){}return r}}
/* main tabs per map; the rest go under "Other ▾" */
const MAIN={gdp:["total","percapita","growth","export","currency","blocs"],people:["fert","age","life","urban"],politics:["gov","free","fed","mon","clubs"],nature:["biomes","eco","realms","footprint","forest"]};
window.GF_MAIN_SUBS=MAIN;

/* rename the GDP Map button */
function rename(){document.querySelectorAll('[data-allmaps-mode="gdp"]').forEach(b=>{if(b.textContent!=="Economy Map")b.textContent="Economy Map"})}
setInterval(rename,700);document.addEventListener("DOMContentLoaded",rename);

/* ---------- 2. "Other ▾": measure tabs beyond the main ones fold into a menu ---------- */
const css=document.createElement("style");css.textContent=`
.gf-other{ position:relative; display:inline-flex; }
.gf-other > .chip{ white-space:nowrap; }
.gf-other-pop{ position:absolute; top:calc(100% + 6px); left:0; z-index:90; display:grid; grid-template-columns:repeat(2,auto); align-items:stretch; gap:2px 4px; padding:6px; background:#fff; border-radius:12px; box-shadow:0 6px 22px rgba(20,40,70,.2); }
.gf-other-pop[hidden]{ display:none; }
.gf-other-pop button{ text-align:left; border:0; background:none; border-radius:8px; padding:6px 10px; font:600 12.5px/1.2 inherit; color:inherit; cursor:pointer; white-space:nowrap; }
.gf-other-pop button:hover{ background:rgba(47,138,122,.1); }
.gf-other-pop button.active{ background:var(--accent,#2f8a7a); color:#fff; }
/* on the globe the menu opens to the right, growing upward from the Other button so it stays clear of the toolkit */
#amGlobeSubs .gf-other-pop{ left:calc(100% + 8px); top:auto; bottom:0; }
body.dark-theme .gf-other-pop, body.sky-night .gf-other-pop{ background:#1f2b3a; }
#allMapsView.globe-on #amGlobeSubs.globe-subs{ top:var(--gf-subs-top,62px) !important; }
`;document.head.appendChild(css);
function curMode(){try{return allMapsColorMode}catch(e){return""}}
function other(host){if(!host)return;const mode=curMode(),main=MAIN[mode];let box=host.querySelector(":scope > .gf-other");
 const chips=[...host.querySelectorAll(":scope > [data-allmaps-sub], :scope > [data-sub]")];
 if(!main||!chips.length){if(box)box.remove();return}
 const idOf=c=>c.dataset.allmapsSub||c.dataset.sub,rest=chips.filter(c=>!main.includes(idOf(c)));
 /* a single extra measure is just another tab, not an "Other" menu */
 if(rest.length<2){chips.forEach(c=>{if(c.dataset.sub!=="carto")c.style.display=""});if(box)box.remove();return}
 chips.forEach(c=>c.style.display=main.includes(idOf(c))?"":"none");
 const key=mode+"|"+rest.map(idOf).join(",");
 if(!box||box.dataset.k!==key){if(box)box.remove();box=document.createElement("span");box.className="gf-other";box.dataset.k=key;
  box.innerHTML='<button type="button" class="chip sub-chip gf-other-btn" aria-haspopup="true"></button><div class="gf-other-pop" hidden></div>';
  const pop=box.querySelector(".gf-other-pop"),btn=box.querySelector(".gf-other-btn");
  btn.onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden};
  document.addEventListener("click",e=>{if(!box.contains(e.target))pop.hidden=true});
  host.appendChild(box)}
 const pop=box.querySelector(".gf-other-pop"),btn=box.querySelector(".gf-other-btn");
 const act=rest.find(c=>c.classList.contains("active"));
 const want=(act?"Other: "+act.textContent:"Other")+" ▾";if(btn.textContent!==want)btn.textContent=want;btn.classList.toggle("active",!!act);
 const sig=rest.map(c=>idOf(c)+(c.classList.contains("active")?"*":"")).join(",");
 if(pop.dataset.sig!==sig){pop.dataset.sig=sig;pop.innerHTML="";rest.forEach(c=>{const b=document.createElement("button");b.type="button";b.textContent=c.textContent;b.classList.toggle("active",c.classList.contains("active"));b.onclick=e=>{e.stopPropagation();pop.hidden=true;c.click();setTimeout(tick,30)};pop.appendChild(b)})}
 if(box.parentNode!==host||host.lastElementChild!==box)host.appendChild(box)}

/* ---------- 3. Globe mode: the measure tabs start just under the tour button, wherever that ends ---------- */
function place(){const v=document.getElementById("allMapsView");if(!v||!v.classList.contains("globe-on"))return;const subs=document.getElementById("amGlobeSubs"),rel=subs&&subs.parentElement;if(!rel)return;
 const r=rel.getBoundingClientRect();let top=10;
 {const row=document.querySelector("#allMapsView .all-maps-label-controls");if(row&&row.offsetParent){const rb=row.getBoundingClientRect();if(rb.bottom>r.top-4)top=Math.max(top,Math.round(rb.bottom-r.top+10))}}
 document.querySelectorAll("#allMapsView .ps-launcher").forEach(l=>{if(!l.offsetParent)return;const b=l.getBoundingClientRect();if(b.bottom>r.top-4&&b.left<r.left+subs.offsetWidth+40)top=Math.max(top,Math.round(b.bottom-r.top+8))});
 const want=top+"px";if(v.style.getPropertyValue("--gf-subs-top")!==want)v.style.setProperty("--gf-subs-top",want)}

function tick(){try{rename();other(document.getElementById("allMapsSubModes"));other(document.getElementById("amGlobeSubs"));place()}catch(e){console.error(e)}}
setInterval(tick,300);addEventListener("resize",tick);

/* ---------- 4. Population map: Cartogram ---------- */
ALLMAPS_SUBMODES.population=(ALLMAPS_SUBMODES.population||[]).filter(s=>s.id!=="carto").concat([{id:"carto",label:"Cartogram"}]);
/* the population sub-mode is pinned to "density" (a fixed property), so the cartogram keeps its own on/off */
let carto=false;
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#allMapsSubModes [data-allmaps-sub]");if(!b||curMode()!=="population")return;carto=b.dataset.allmapsSub==="carto";setTimeout(cartoSync,0)},true);
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-allmaps-mode]");if(b){carto=false;setTimeout(cartoSync,0)}},true);
function cartoChips(){const glob=typeof amGlobeOn==="function"&&amGlobeOn();
 document.querySelectorAll('#allMapsSubModes [data-allmaps-sub], #amGlobeSubs [data-sub="carto"]').forEach(b=>{if(curMode()!=="population")return;const id=b.dataset.allmapsSub||b.dataset.sub;
  if(id==="carto"&&b.closest("#amGlobeSubs")){b.style.display="none";return}
  const want=carto?id==="carto":id==="density";if(b.classList.contains("active")!==want)b.classList.toggle("active",want)})}
{const _cfc=allMapsColorForCode;allMapsColorForCode=function(code){if(curMode()==="population"&&carto)return code==="aq"?"#ffffff":"#e4e0d6";return _cfc.apply(this,arguments)}}
const CONT_COL={Africa:"#e3a64a",Asia:"#d9675c","Europe":"#5d8fd6","North America":"#8a6fc7","South America":"#5fae6e",Oceania:"#46a7b8",Antarctica:"#bbb"};
const METRICS=[["pop","Population"],["gdp","Economy (GDP)"],["co2","CO₂"],["area","Land area"]];
let metric="pop",cv=null;
function val(c,m){try{if(m==="pop")return COUNTRY_POPULATION[c]||0;if(m==="gdp")return(COUNTRY_GDP[c]||0)*1e6;if(m==="area")return COUNTRY_AREA_KM2[c]||0;if(m==="co2"){const T=window.GF_ECON_RAW&&GF_ECON_RAW.co2tot;return T&&T[c]?T[c][0]:0}}catch(e){}return 0}
function fmt(v,m){if(m==="pop")return fmtCount(v)+" people";if(m==="gdp")return fmtMoney(v);if(m==="area")return Math.round(v).toLocaleString()+" km²";if(m==="co2")return(v>=10?Math.round(v).toLocaleString():v.toFixed(1))+" million tonnes a year";return v}
function contOf(c){const x=(typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[c])||{};if(x.r==="Americas")return/^(ar|bo|br|cl|co|ec|gy|py|pe|sr|uy|ve|fk|gf)$/.test(c)?"South America":"North America";return x.r||""}
function layout(m){const pos=COUNTRY_LABEL_POS_ALLMAPS,codes=Object.keys(pos).filter(c=>c!=="aq"&&val(c,m)>0&&COUNTRY_BY_CODE[c]);
 const tot=codes.reduce((a,c)=>a+val(c,m),0),k=Math.sqrt(2000*1001*.27/Math.PI/tot);
 const nodes=codes.map(c=>({c,v:val(c,m),r:Math.max(1.6,k*Math.sqrt(val(c,m))),x:pos[c][0],y:pos[c][1],tx:pos[c][0],ty:pos[c][1]}));
 /* circles pull toward the country's place and push apart where they overlap (no d3-force in this build) */
 for(let it=0;it<240;it++){const a=.1*(1-it/300);nodes.forEach(n=>{n.x+=(n.tx-n.x)*a;n.y+=(n.ty-n.y)*a});
  for(let i=0;i<nodes.length;i++){const A=nodes[i];for(let j=i+1;j<nodes.length;j++){const B=nodes[j],dx=B.x-A.x,dy=B.y-A.y,min=A.r+B.r+1.5;if(Math.abs(dx)>=min||Math.abs(dy)>=min)continue;let d=Math.hypot(dx,dy);if(d>=min)continue;
    if(d<1e-6){d=.01}const push=(min-d)/d*.5,wa=B.r*B.r/(A.r*A.r+B.r*B.r),wb=1-wa;A.x-=dx*push*wa;A.y-=dy*push*wa;B.x+=dx*push*wb;B.y+=dy*push*wb}}}
 return nodes}
function build(){const wrap=document.getElementById("allMapsWrap");if(!wrap)return null;let box=wrap.querySelector(":scope > .gf-carto");if(box)return box;
 box=document.createElement("div");box.className="gf-carto";
 box.innerHTML='<div class="gf-carto-bar">'+METRICS.map(([k,l])=>'<button type="button" class="chip" data-cm="'+k+'">'+l+"</button>").join("")+'</div><svg viewBox="0 0 2000 1001" preserveAspectRatio="xMidYMid meet"><g class="gf-cg"></g></svg><div class="gf-carto-tip" hidden></div><p class="gf-carto-note"></p>';
 ["pointerdown","mousedown","wheel","touchstart","dblclick"].forEach(t=>box.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 box.querySelectorAll("[data-cm]").forEach(b=>b.onclick=e=>{e.stopPropagation();metric=b.dataset.cm;draw(true)});
 const tip=box.querySelector(".gf-carto-tip");
 box.addEventListener("pointermove",e=>{const t=e.target.closest&&e.target.closest("g.gf-cn");if(!t){tip.hidden=true;return}const d=t.__data__;const r=box.getBoundingClientRect();tip.hidden=false;tip.innerHTML="<b>"+(COUNTRY_BY_CODE[d.c]||{}).n+"</b><br>"+fmt(d.v,metric);tip.style.left=(e.clientX-r.left+14)+"px";tip.style.top=(e.clientY-r.top+10)+"px"});
 box.addEventListener("pointerleave",()=>tip.hidden=true);
 box.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("g.gf-cn");if(t){const c=COUNTRY_BY_CODE[t.__data__.c];if(c)openFlagZoom(c)}});
 wrap.appendChild(box);return box}
const NOTES={pop:"Each circle is a country, sized by how many people live there. Source: World Bank.",gdp:"Each circle is a country, sized by the size of its economy (GDP in US dollars). Source: World Bank.",co2:"Each circle is a country, sized by the carbon dioxide it puts out each year from fuel and industry. Source: Our World in Data.",area:"Each circle is a country, sized by its land area. Compare with Population to see which countries are crowded or empty."};
function draw(anim){const box=build();if(!box)return;box.querySelectorAll("[data-cm]").forEach(b=>b.classList.toggle("active",b.dataset.cm===metric));box.querySelector(".gf-carto-note").textContent=NOTES[metric];
 const nodes=layout(metric),g=box.querySelector("g.gf-cg"),NS="http://www.w3.org/2000/svg",have=new Map([...g.children].map(e=>[e.__data__.c,e]));
 const keep=new Set(nodes.map(n=>n.c));have.forEach((e,c)=>{if(!keep.has(c)){e.__to={x:e.__cur.x,y:e.__cur.y,r:0}}});
 nodes.forEach(d=>{let e=have.get(d.c);if(!e){e=document.createElementNS(NS,"g");e.setAttribute("class","gf-cn");const ci=document.createElementNS(NS,"circle");ci.setAttribute("fill",CONT_COL[contOf(d.c)]||"#aaa");const t=document.createElementNS(NS,"text");t.setAttribute("text-anchor","middle");t.setAttribute("dy",".35em");e.append(ci,t);g.appendChild(e);e.__cur={x:d.tx,y:d.ty,r:0}}
  e.__data__=d;e.__from={...e.__cur};e.__to={x:d.x,y:d.y,r:d.r};const n=(COUNTRY_BY_CODE[d.c]||{}).n||d.c,t=e.querySelector("text");
  t.textContent=d.r>34?n:d.r>13?d.c.toUpperCase():"";t.setAttribute("font-size",(d.r>34?Math.max(10,Math.min(30,d.r*2.4/n.length)):Math.min(18,d.r*.8)).toFixed(1))});
 [...g.children].forEach(e=>{if(!e.__from)e.__from={...e.__cur}});
 const T=anim?1100:0,t0=performance.now(),ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;cancelAnimationFrame(box._raf);
 const step=now=>{const k=T?Math.min(1,(now-t0)/T):1,q=ease(k);[...g.children].forEach(e=>{const a=e.__from,b=e.__to;const c={x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,r:a.r+(b.r-a.r)*q};e.__cur=c;e.setAttribute("transform","translate("+c.x.toFixed(1)+","+c.y.toFixed(1)+")");e.firstChild.setAttribute("r",Math.max(0,c.r).toFixed(1));e.lastChild.style.opacity=k<1?0:1});
  if(k<1)box._raf=requestAnimationFrame(step);else[...g.children].forEach(e=>{e.__from=null;if(!keep.has(e.__data__.c))e.remove()})};
 box._raf=requestAnimationFrame(step)}
const ccss=document.createElement("style");ccss.textContent=`
#allMapsWrap > .gf-carto{ position:absolute; inset:0; z-index:4; background:#eef3f6; display:flex; flex-direction:column; border-radius:inherit; overflow:hidden; }
#allMapsWrap > .gf-carto[hidden]{ display:none; }
.gf-carto-bar{ display:flex; gap:6px; justify-content:center; flex-wrap:wrap; padding:8px 8px 0; }
.gf-carto svg{ flex:1; width:100%; min-height:0; }
.gf-carto g.gf-cn{ cursor:pointer; }
.gf-carto g.gf-cn circle{ stroke:#fff; stroke-width:1.5; }
.gf-carto g.gf-cn:hover circle{ stroke:#1d2a3a; stroke-width:3; }
.gf-carto g.gf-cn text{ fill:#1d2a3a; font-weight:700; pointer-events:none; paint-order:stroke; stroke:rgba(255,255,255,.55); stroke-width:2px; }
.gf-carto-tip{ position:absolute; pointer-events:none; background:rgba(16,28,48,.92); color:#fff; font-size:12.5px; padding:6px 9px; border-radius:8px; white-space:nowrap; }
.gf-carto-note{ margin:0; padding:4px 12px 8px; font-size:12.5px; text-align:center; opacity:.8; }
body.dark-theme #allMapsWrap > .gf-carto{ background:#16212e; }
body.dark-theme .gf-carto g.gf-cn text{ fill:#eef; stroke:rgba(0,0,0,.4); }
`;document.head.appendChild(ccss);
let shown=false;
function cartoSync(){cartoChips();const on=curMode()==="population"&&carto&&typeof appMode!=="undefined"&&appMode==="allmaps"&&!(typeof amGlobeOn==="function"&&amGlobeOn());
 const wrap=document.getElementById("allMapsWrap");if(!wrap)return;let box=wrap.querySelector(":scope > .gf-carto");
 if(on&&!shown){box=build();box.hidden=false;draw(false);shown=true}else if(!on&&shown){if(box)box.hidden=true;shown=false}
 const leg=document.getElementById("populationLegend");if(leg)leg.classList.toggle("gf-carto-hide",on)}
setInterval(cartoSync,300);
{const s=document.createElement("style");s.textContent="#populationLegend.gf-carto-hide{display:none !important}";document.head.appendChild(s)}
})();
/* GeoFlock: number measures use smooth colour gradients instead of a few colour bands (Economy, Nature and People
   measures), the map key always stays on the right (also for gradient keys like GDP), and the floating key always has
   a "Show all" button where a colour can be picked out. */
(function(){
if(typeof TH_THEMES==="undefined")return;
const hex=c=>{c=c.replace("#","");return[0,2,4].map(i=>parseInt(c.slice(i,i+2),16))};
const mix=(a,b,t)=>"#"+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,"0")).join("");
/* People measures: the numbers are in each country's note ("1.61 children per woman (2024)"); the band edges in the
   band names ("1.5 to 2.1") */
["fert","age","life","urban","mig","farm"].forEach(k=>{const T=TH_THEMES[k];if(!T||T.grad||!T.info)return;try{
 const ed=T.cats.slice(1).map(c=>parseFloat(String(c[1]).match(/-?[\d.]+/)));if(ed.some(isNaN)||ed.some((v,i)=>i&&v<=ed[i-1]))return;
 const vals={};Object.entries(T.info).forEach(([c,s])=>{const m=String(s).match(/-?[\d.]+/);if(m)vals[c]=parseFloat(m[0])});
 const v=Object.values(vals).sort((a,b)=>a-b);if(v.length<50)return;const lo=Math.min(v[Math.floor(v.length*.02)],ed[0]),hi=Math.max(v[Math.floor(v.length*.98)-1],ed[ed.length-1]);
 const unit=/%/.test(T.cats[0][1])?"%":"";const f=x=>(Math.abs(x)<10?+x.toFixed(1):Math.round(x))+unit;
 T.grad={vals,edges:[Math.max(0,lo)].concat(ed,[hi]),labels:[Math.max(0,lo)].concat(ed,[hi]).map(f)}}catch(e){}});
function gradT(){try{const T=thTheme();return T&&T.grad?T:null}catch(e){return null}}
function gradColor(T,v){const E=T.grad.edges,P=T.cats.map(c=>hex(c[2])),n=E.length-1;let i=0;while(i<n-1&&v>=E[i+1])i++;
 let f=(v-E[i])/((E[i+1]-E[i])||1);f=Math.max(0,Math.min(1,f));const t=Math.max(0,Math.min(1,(i+f)/n))*(P.length-1),j=Math.min(P.length-2,Math.floor(t));return mix(P[j],P[j+1],t-j)}
{const _c=thColor;thColor=function(code){const T=gradT();if(T&&code!=="aq"){const info=typeof TERRITORY_INFO!=="undefined"&&TERRITORY_INFO[code],dc=info&&info.countsAs||code,v=T.grad.vals[code]!=null?T.grad.vals[code]:T.grad.vals[dc];if(v!=null)return gradColor(T,v)}return _c.apply(this,arguments)}}
{const _l=thLegendHTML;thLegendHTML=function(){const T=gradT();if(!T)return _l.apply(this,arguments);
 return legendBarHTML(T.title+(T.grad.unit?' <small style="font-weight:600;opacity:.65">('+T.grad.unit+")</small>":""),T.cats.map(c=>c[2]),T.grad.labels)+'<span class="legend-note">'+T.note+" Grey: no data.</span>"}}

/* the map key on the right: always there on the Maps page (also for gradient keys), and with "Show all" */
/* flkSync shows the key only for some kinds of key and only once the key under the map has scrolled away; here it is
   asked with the key reported as off screen, and gradient keys count too */
if(typeof flkSync==="function"){const _f=flkSync;flkSync=function(){const lg=document.getElementById("populationLegend");let undo=null;
 if(lg){if(lg.querySelector(".legend-gradient-bar")&&!lg.querySelector(":scope > .gf-lg-mark")){const m=document.createElement("span");m.className="legend-gradient gf-lg-mark";m.style.display="none";lg.appendChild(m)}
  lg.getBoundingClientRect=()=>({top:-9999,bottom:-9998,height:1,left:0,right:0,width:0,x:0,y:-9999});undo=()=>{delete lg.getBoundingClientRect}}
 let r;try{r=_f.apply(this,arguments)}finally{if(undo)undo()}try{showAll();layersPage()}catch(e){}return r}}
/* the floating key follows the Map key / Layers pages of the key under the map */
function layersPage(){const el=typeof flkEl==="function"&&flkEl(),lg=document.getElementById("populationLegend");if(!el||!lg)return;const body=el.querySelector(".flk-body"),h=el.querySelector(".flk-h");if(!body||!h)return;
 const p2=body.querySelector(".gf-lk-p2"),has=!!lg.querySelector(":scope > .gf-lk-p2"),two=lg.classList.contains("gf-lk-on2");let t=h.querySelector(".flk-lk");
 if(!has){if(t)t.remove();if(p2)p2.remove();return}
 if(!t){t=document.createElement("button");t.type="button";t.className="flk-all flk-lk";t.onclick=e=>{e.stopPropagation();const b=lg.querySelector('[data-lkp="'+(lg.classList.contains("gf-lk-on2")?1:2)+'"]');if(b)b.click();setTimeout(()=>flkSync(true),40)};h.insertBefore(t,h.querySelector(".flk-fold"))}
 t.textContent=two?"Map key":"Layers";
 [...body.children].forEach(c=>{if(c.classList.contains("gf-lk-tabs"))c.style.display="none";else c.style.display=two===c.classList.contains("gf-lk-p2")?"":"none"});
 if(p2){p2.style.flexDirection="column";p2.style.gap="8px"}}

function picked(){let m="";try{m=allMapsColorMode}catch(e){}
 if(m==="climate")return typeof climateSelection!=="undefined";
 try{if(TH_MODES.has(m)&&!gradT())return true}catch(e){}
 return !!(window.gfNatureFocusable&&gfNatureFocusable())}
function showAll(){const el=typeof flkEl==="function"&&flkEl();if(!el||el.style.display==="none")return;const h=el.querySelector(".flk-h");if(!h)return;let b=h.querySelector(".flk-all");
 if(!picked()){if(b)b.remove();return}
 if(!b){b=document.createElement("button");b.type="button";b.className="flk-all";b.textContent="Show all";b.title="Show every colour again";
  b.onclick=e=>{e.stopPropagation();let m="";try{m=allMapsColorMode}catch(er){}const w=document.getElementById("allMapsWrap");
   try{if(m==="climate"){climateSelection.clear();applyClimateSelection()}else if(window.gfNatureFocusable&&gfNatureFocusable())gfNatureShowAll();else{thFocus=null;applyAllMapsColorMode(w)}}catch(er){console.error(er)}
   try{amGlobe&&amGlobe.render()}catch(er){}setTimeout(()=>flkSync(true),40)};
  const fold=h.querySelector(".flk-fold");h.insertBefore(b,fold||null)}
 let on=false;try{const m=allMapsColorMode;on=m==="climate"?climateSelection.size>0:window.gfNatureFocusable&&gfNatureFocusable()?gfNatureFocused():!!thFocus}catch(e){}b.classList.toggle("on",on)}
const st=document.createElement("style");st.textContent=`
.flk-h .flk-all{ margin-left:auto; margin-right:6px; border:1px solid var(--line,rgba(0,0,0,.12)); background:var(--surface,#fff); color:inherit; border-radius:999px; padding:4px 10px; font:700 11.5px/1 inherit; cursor:pointer; opacity:.7; }
.flk-body .legend-river i, .legend-river i{ height:0 !important; background:none !important; border:none !important; border-top:2px solid #2f7ab8 !important; border-radius:0 !important; width:18px; }
.flk-h .flk-all.on{ background:var(--accent,#2f8a7a); color:#fff; border-color:transparent; opacity:1; }
`;document.head.appendChild(st);
})();
