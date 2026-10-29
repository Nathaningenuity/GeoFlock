/* History map, second edition: borders from OpenHistoricalMap (CC0), with historical-basemaps (GPL-3.0) filling the
   places and periods OpenHistoricalMap does not cover yet, all clipped to Natural Earth coastlines. Each polity has its
   own start and end date, so the slider moves in small steps (10 years before 1500, 5 years to 1800, then every year)
   from 3000 BC to today, and the caption tells the story of the period rather than of one year.
   The data is split by period (history/h2-*.json) and fetched when needed. Guided tours and the eras games keep the
   older year-by-year maps (terra-atlas-history.js). */
(function(){
if(typeof histFeatures!=="function"||typeof HIST_DATA==="undefined")return;
const BASE="history/";let IDX=null;const CH={},LOADING={};
const YEARS=[];for(let b=3000;b>=10;b-=10)YEARS.push(1-b);for(let y=1;y<1500;y=y<10?10:y+10)YEARS.push(y);
for(let y=1500;y<1800;y+=5)YEARS.push(y);for(let y=1800;y<=2025;y++)YEARS.push(y);
const PERIODS=[
 [-3000,-2334,"The first cities","Sumer’s walled city-states fill southern Mesopotamia, Egypt has been one kingdom since about 3100 BC, and the cities of the Indus valley are growing. Writing, kings and taxes appear for the first time."],
 [-2334,-1600,"The first empires","Sargon of Akkad joins the Sumerian cities into what is often called the first empire. Egypt builds its great pyramids, the Indus cities trade as far as Mesopotamia, and Hammurabi rules Babylon in the 1700s BC."],
 [-1600,-1177,"Bronze Age great powers","New Kingdom Egypt, the Hittites, Mitanni, Babylon and Mycenaean Greece trade and write to each other as equals, while the Shang dynasty rules the Yellow River plain in China."],
 [-1177,-550,"Collapse and the Iron Age","Around 1177 BC many Bronze Age kingdoms fall. From the ruins come iron tools, the Phoenician alphabet and Greek city-states, and Assyria builds the largest empire yet before it falls in 612 BC. Zhou kings rule in China."],
 [-550,-323,"Persia and the Greeks","Cyrus the Great founds the Achaemenid Persian Empire around 550 BC, stretching from Egypt to the Indus. The Greek cities hold it off, and then Alexander the Great conquers all of it before he dies in 323 BC."],
 [-323,-27,"Successors, Qin and Rome","Alexander’s generals split his empire. Ashoka’s Maurya Empire covers most of India, Qin unites China in 221 BC and the Han dynasty follows, while Rome takes over the whole Mediterranean."],
 [-27,476,"The classical empires","From 27 BC Rome is ruled by emperors; at the same time the Han, Parthian (later Sasanian), Kushan and Gupta realms link Eurasia through the Silk Roads. Rome splits in two in 395, and the western half ends in 476."],
 [476,632,"After Rome","Germanic kingdoms share the old Western Empire, the Eastern Roman (Byzantine) Empire wins back Italy under Justinian, Sasanian Persia is at its height, and the Sui reunite China in 589, followed by the Tang in 618."],
 [632,800,"The caliphates","After Muhammad’s death in 632, Arab armies build a caliphate from Spain to the Indus within a century. The Abbasids found Baghdad in 762, while Tang China and the Tibetan Empire meet in Central Asia."],
 [800,1000,"Franks, Vikings and the Abbasids","Charlemagne is crowned emperor in 800, Vikings raid and settle from Russia to Iceland, the Abbasid caliphate breaks into local dynasties, and after the Tang fall in 907 the Song reunite most of China from 960."],
 [1000,1206,"Crusades and kingdoms","The Holy Roman Empire, the Seljuk Turks and Song China are the big powers; crusaders take Jerusalem in 1099, Angkor is the capital of the Khmer Empire, and gold from West Africa reaches the Mediterranean."],
 [1206,1368,"The Mongol world","Genghis Khan is proclaimed in 1206 and his heirs build the largest connected land empire in history. Kublai Khan rules China as the Yuan dynasty, Mansa Musa’s Mali is famous for its gold, and the Black Death spreads along the trade routes from 1346."],
 [1368,1492,"Ming, Timur and the Ottomans","The Ming drive the Mongols from China in 1368 and send Zheng He’s fleets across the Indian Ocean, Timur raids from Delhi to Anatolia, the Ottomans take Constantinople in 1453, and the Aztec and Inca empires grow in the Americas."],
 [1492,1648,"Oceans join the world","Columbus reaches the Caribbean in 1492. Spain conquers the Aztec and Inca empires, Portugal builds trading posts from Brazil to Japan, the Mughals take northern India from 1526, and the Peace of Westphalia ends Europe’s Thirty Years’ War in 1648."],
 [1648,1763,"Gunpowder and trade","The Qing rule China from 1644, the Mughal Empire is at its largest around 1700, Russia has reached the Pacific, and British, French and Dutch trading companies fight for colonies until the Seven Years’ War ends in 1763."],
 [1763,1815,"An age of revolutions","The United States wins independence, the French Revolution of 1789 leads to Napoleon’s empire across Europe, Haiti becomes the first state founded after a slave revolt in 1804, and the Congress of Vienna redraws Europe in 1815."],
 [1815,1871,"New nations","Most of Spanish and Portuguese America is independent by the mid-1820s, Britain rules India and forces trade on China, and Italy (1861) and Germany (1871) are unified."],
 [1871,1914,"The height of empire","European powers divide Africa among themselves after the Berlin Conference of 1884–85, and by 1914 only Ethiopia and Liberia are still independent there. Japan and the United States build overseas empires too."],
 [1914,1945,"The world wars","The First World War ends the German, Austro-Hungarian, Russian and Ottoman empires and creates new states in Europe and the Middle East. The Soviet Union forms in 1922, and the Second World War redraws the map again."],
 [1945,1991,"Cold War and the end of empires","India and Pakistan become independent in 1947 and 17 African countries in 1960 alone. The United States and the Soviet Union face each other in the Cold War until the Soviet Union breaks into 15 countries in 1991."],
 [1991,2026,"The world today","New states appear from the former Soviet Union, Yugoslavia and Czechoslovakia, the European Union grows, and South Sudan becomes the newest widely recognised country in 2011."]];
PERIODS.forEach(P=>{if(P[0]<0)P[0]+=1;if(P[1]<0)P[1]+=1});/* written as BC years above; stored as astronomical years (1 BC = 0) */
const LOOK=["the river valleys of the Tigris and Euphrates, the Nile and the Indus, where the first states appear.","Akkad in Mesopotamia and Egypt along the Nile; most of the world still lives in farming villages without states.",
 "Egypt reaching north into the Levant, and the Hittites in Anatolia.","Assyria spreading across the Fertile Crescent before its fall in 612 BC.","Persia, the largest empire the world had yet seen, from Egypt to the Indus.",
 "the Maurya Empire in India, and Rome taking the coasts of the Mediterranean.","Rome and Han China at the two ends of Eurasia around AD 100.","the Byzantine reconquest of Italy and North Africa in the 530s–550s.",
 "the caliphate stretching from Spain to Central Asia by 750.","the Frankish Empire around 800 and its split into three in 843.","the crusader states along the eastern Mediterranean after 1099.",
 "the Mongol khanates covering most of Asia by the 1280s.","the Ottomans growing around Constantinople, and the Inca along the Andes.","Spain’s and Portugal’s new lands in the Americas.",
 "Russia reaching across Siberia to the Pacific.","the United States after 1783, and Napoleon’s France around 1810.","the new republics of Latin America in the 1820s.",
 "Africa filling with colonial colours after 1885.","the new countries of central and eastern Europe after 1918.","Africa’s new countries around 1960.","the 15 countries that came out of the Soviet Union."];
const H2={years:null};let pos=YEARS.indexOf(1914),framesCache=new Map,lastFrame=[];
const useNew=()=>!!IDX&&!(typeof ps!=="undefined"&&ps);
const yLabel=y=>y<=0?(1-y)+" BC":y<1000?"AD "+y:String(y);
const yKey=y=>y<=0?"bc"+(1-y):String(y);
const period=y=>PERIODS.find(p=>y>=p[0]&&y<p[1])||PERIODS[PERIODS.length-1];
function yearObj(){const y=YEARS[pos],P=period(y);return{y:yKey(y),label:yLabel(y),cap:P[2]+". "+P[3],era:P[2],labs:labList(),yr:y}}
fetch(BASE+"h2-index.json").then(r=>r.ok?r.json():null).then(j=>{if(!j)return;IDX=j;need(YEARS[pos]);try{if(histOn())applyAllMapsColorMode(document.getElementById("allMapsWrap"))}catch(e){}}).catch(()=>{});
function chunkOf(y){if(!IDX)return-1;return IDX.chunks.findIndex(c=>y>=c[0]&&y<c[1])}
function dens(r){const o=[];for(let k=0;k<r.length;k++){const a=r[k];o.push(a);const b=r[k+1];if(!b)continue;const n=Math.floor(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])));for(let j=1;j<n;j++)o.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}return o}
function load(k){if(k<0||!IDX||k>=IDX.chunks.length||CH[k]||LOADING[k])return;LOADING[k]=fetch(BASE+IDX.chunks[k][2]).then(r=>r.json()).then(topo=>{
 const fc=topojson.feature(topo,topo.objects[Object.keys(topo.objects)[0]]);const out=[];
 fc.features.forEach(f=>{const g=f.geometry;if(!g)return;let P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:null;if(!P)return;
  P=P.map(poly=>poly.map(dens));P.forEach(poly=>{try{if(d3.geoArea({type:"Polygon",coordinates:poly})>2*Math.PI)poly.forEach(r=>r.reverse())}catch(e){}});
  f.geometry={type:"MultiPolygon",coordinates:P};f._b=d3.geoBounds(f);out.push(f)});
 out.sort((a,b)=>(a.properties.o?1:0)-(b.properties.o?1:0)||b.properties.a-a.properties.a);
 CH[k]=out;delete LOADING[k];framesCache.clear();if(useNew()&&histOn()&&chunkOf(YEARS[pos])===k){histShown=-1;histSet(pos)}}).catch(()=>{delete LOADING[k]})}
function need(y){const k=chunkOf(y);load(k);load(k+1);if(k>0)load(k-1)}
function frame(){const y=YEARS[pos];if(framesCache.has(pos))return framesCache.get(pos);const k=chunkOf(y);need(y);if(!CH[k])return lastFrame;const t=y+.5;
 const fr=CH[k].filter(f=>{const p=f.properties;if(!(p.s<=t&&t<p.e))return false;if(p.h)for(const r of p.h)if(t>=r[0]&&t<r[1])return false;return true});
 if(framesCache.size>60)framesCache.clear();framesCache.set(pos,fr);lastFrame=fr;return fr}
const keyOf=p=>p.gk&&HIST_DATA.groups[p.gk]?"g:"+p.gk:"n:"+p.n;
const keyName=k=>KN[k]||(k.startsWith("g:")?HIST_DATA.groups[k.slice(2)][0]:k.slice(2));
function labList(){const seen=new Set,L=[];frame().slice().sort((a,b)=>b.properties.a-a.properties.a).forEach(f=>{const p=f.properties;if(!p.n||seen.has(p.n)||p.a<(p.k===0?40:3))return;if(histFocus&&keyOf(p)!==histFocus)return;seen.add(p.n);L.push([keyOf(p),p.n,p.l[0],p.l[1],p.k===0?Math.min(p.a,60):p.a])});return L}
let KN={};/* a group with one member alive is named after that member (Denmark in 1000 is not yet "Denmark–Norway") */
function powers(){const m=new Map,mem={};frame().forEach(f=>{const p=f.properties;if(p.k===0||!p.n)return;const k=keyOf(p);m.set(k,(m.get(k)||0)+p.a);(mem[k]=mem[k]||new Set).add(p.n)});KN={};for(const k in mem)if(k.startsWith("g:")&&mem[k].size===1)KN[k]=[...mem[k]][0];return[...m].sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0])}
const W=(name,fn)=>{const old=window[name]||eval(name);const f=function(){return useNew()?fn.apply(this,arguments):old.apply(this,arguments)};try{eval(name+"=f")}catch(e){window[name]=f}};
W("histFeatures",()=>frame());
W("histYear",()=>yearObj());
W("histLabelList",()=>labList());
W("histFill",p=>{if(histFocus&&keyOf(p)!==histFocus)return p.k===0?"#f1ece2":"#e6e1d6";if(p.k===0||!p.c)return p.k===0?HIST_LAND:"hsl(200,28%,80%)";return p.c});
W("histDescribe",f=>{const p=f.properties;let s=p.n||"Unnamed";if(p.k===0)return s+" — peoples without a state";const G=p.gk&&HIST_DATA.groups[p.gk];if(G&&G[0]!==p.n&&!KN["g:"+p.gk]&&!/^(Russia|China|India|Persia|Germany|Italy|Japan|Egypt)$/.test(G[0]))s+=" — "+G[0];
 if(p.o){const a=Math.floor(p.s),b=p.e>=9999?null:Math.floor(p.e);s+=" ("+(b==null?"since "+yLabel(a):yLabel(a).replace(/^AD /,"")+"–"+yLabel(b).replace(/^AD /,""))+")"}return s});
function eraHTML(){const N=YEARS.length;return PERIODS.map(P=>{let a=YEARS.findIndex(y=>y>=P[0]),b=YEARS.findIndex(y=>y>=P[1]);if(b<0)b=N-1;const on=YEARS[pos]>=P[0]&&YEARS[pos]<P[1];
 return`<span class="hist-era${on?" on":""}" style="left:${(a/(N-1)*100).toFixed(2)}%;width:${((b-a)/(N-1)*100).toFixed(2)}%" data-hy="${a}" title="${P[2]}">${P[2]}</span>`}).join("")}
function ticksHTML(){const N=YEARS.length;return[-2999,-1999,-999,1,500,1000,1500,1800,1900,2000].map(y=>{const i=YEARS.findIndex(v=>v>=y);return`<button type="button" class="hist-tick key${i===pos?" on":""}" data-hy="${i}" style="left:${(i/(N-1)*100).toFixed(2)}%" aria-label="${yLabel(YEARS[i])}"><b></b><span>${yLabel(YEARS[i])}</span></button>`}).join("")}
W("histLegendHTML",()=>{const Y=yearObj(),N=YEARS.length,fr=frame();const keys=powers().map(k=>{const f=fr.find(x=>keyOf(x.properties)===k);return`<span class="legend-swatch th-sw${histFocus===k?" is-on":""}" data-hg="${k.replace(/"/g,"&quot;")}" role="button" tabindex="0"><i style="background:${f&&f.properties.c||"#ccc"}"></i>${keyName(k)}</span>`}).join("");
 const loading=!CH[chunkOf(YEARS[pos])];
 return`<div class="hist-bar">
      <button type="button" class="hist-btn" data-hstep="-1" aria-label="Earlier">‹</button>
      <button type="button" class="hist-btn hist-play" aria-label="${histPlaying?"Pause":"Play through history"}">${histPlaying?"❚❚":"▶"}</button>
      <div class="hist-track hist2"><div class="hist-eras">${eraHTML()}</div><input type="range" class="hist-range" min="0" max="${N-1}" step="1" value="${pos}" aria-label="Year" aria-valuetext="${Y.label}"><div class="hist-ticks">${ticksHTML()}</div></div>
      <button type="button" class="hist-btn" data-hstep="1" aria-label="Later">›</button>
    </div>
    <div class="hist-cap"><b>${Y.label}</b> ${loading?"Loading borders…":"<i>"+period(YEARS[pos])[2]+"</i> · "+pRange(period(YEARS[pos]))}</div>
    <span class="legend-swatches th-swatches hist-keys">${keys}${fr.some(f=>f.properties.k===0)?`<span class="legend-swatch"><i style="background:${HIST_LAND}"></i>No state</span>`:""}</span>
    <span class="legend-note">Hover to name a state; click it for its story. Click a coloured name to show it alone; use ← → to step through time. Borders: OpenHistoricalMap contributors (CC0), with gaps filled from historical-basemaps by A. Ourednik (GPL-3.0); coastlines from Natural Earth. Borders before about 1500 are approximate, and many early states had no fixed borders at all.</span>`});
W("histSet",i=>{pos=Math.max(0,Math.min(YEARS.length-1,i|0));histIdx=pos;need(YEARS[pos]);const fr=frame();if(histFocus&&!fr.some(f=>keyOf(f.properties)===histFocus))histFocus=null;histHotI=null;histRender();
 const legend=document.getElementById("populationLegend");if(legend&&histOn()){const r=legend.querySelector(".hist-range");if(r&&r.closest(".hist2")){const t=document.createElement("div");t.innerHTML=histLegendHTML();[".hist-cap",".hist-keys",".hist-eras",".hist-ticks"].forEach(sel=>{const a=legend.querySelector(sel),b=t.querySelector(sel);if(a&&b&&a.innerHTML!==b.innerHTML)a.innerHTML=b.innerHTML});
  const pb=legend.querySelector(".hist-play"),pn=t.querySelector(".hist-play");if(pb&&pn){pb.innerHTML=pn.innerHTML;pb.setAttribute("aria-label",pn.getAttribute("aria-label"))}r.setAttribute("aria-valuetext",yearObj().label);if(+r.value!==pos)r.value=pos}else legend.innerHTML=histLegendHTML();legend.classList.toggle("has-th",!!histFocus)}try{histStorySync()}catch(e){}});
W("histPlay",()=>{if(histPlaying){histStop();histSet(pos);return}if(pos>=YEARS.length-1)pos=0;const step=()=>{if(!histOn()||pos>=YEARS.length-1){histStop();histSet(pos);return}if(!CH[chunkOf(YEARS[pos+1])])return;histSet(pos+1)};histPlaying=setInterval(step,typeof histStoryDelay==="function"?histStoryDelay():140);step()});
const pRange=P=>yLabel(P[0]).replace(/^AD /,"")+"–"+(P[1]>=2026?"today":yLabel(P[1]).replace(/^AD /,""));
/* the story card tells the story of the period the slider is in; its arrows jump between periods */
W("histStoryHTML",()=>{const y=YEARS[pos],i=PERIODS.indexOf(period(y)),P=PERIODS[i],e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 return`<div class="hs-head"><span class="hs-era">${e(pRange(P))} · period ${i+1} of ${PERIODS.length}</span><button type="button" class="hs-x" data-hs="close" aria-label="Hide the story" title="Hide the story">×</button></div>
    <div class="hs-year">${e(yLabel(y))}</div>
    <div class="hs-body"><h3>${e(P[2])}</h3><p>${e(P[3])}</p><p class="hs-look">Look for: ${e(LOOK[i]||"")}</p></div>
    <div class="hs-bar"><i></i></div>
    <div class="hs-ctl">
      <button type="button" data-hs="prev" aria-label="Previous period">‹</button>
      <button type="button" class="hs-play" data-hs="play">${histPlaying?"❚❚ Pause":pos>=YEARS.length-1?"↺ From the start":"▶ Play through time"}</button>
      <button type="button" data-hs="next" aria-label="Next period">›</button>
      <button type="button" class="hs-speed" data-hs="speed" title="Speed">${typeof histStorySpeed!=="undefined"?histStorySpeed:1}×</button>
    </div>`});
W("histStoryDelay",()=>140/(typeof histStorySpeed!=="undefined"?histStorySpeed:1));
document.addEventListener("click",e=>{if(!useNew())return;const b=e.target.closest&&e.target.closest(".hist-story [data-hs=prev], .hist-story [data-hs=next]");if(!b)return;e.stopPropagation();histStop();
 const i=PERIODS.indexOf(period(YEARS[pos])),j=b.dataset.hs==="next"?Math.min(PERIODS.length-1,i+1):(YEARS[pos]>PERIODS[i][0]+(PERIODS[i][1]-PERIODS[i][0])*.15?i:Math.max(0,i-1));const k=YEARS.findIndex(v=>v>=PERIODS[j][0]);histSet(k<0?0:k)},true);
/* drawing on the globe and the flat map */
W("histGlobeDraw",(ctx,p,gv)=>{if(!histOn()||!gv||gv!==amGlobe)return;const path=d3.geoPath(p,ctx),feats=frame(),flat=!!gv._flat,ctr=[-gv.rot[0],-gv.rot[1]];
 ctx.save();ctx.lineJoin="round";try{if(typeof histReliefOn==="function"&&histReliefOn())ctx.globalAlpha=.55}catch(e){}
 feats.forEach(f=>{if(!flat){const b=f._b;let x1=b[1][0];if(x1<b[0][0])x1+=360;if(x1-b[0][0]<170){const c=[(b[0][0]+x1)/2,(b[0][1]+b[1][1])/2],r=Math.max(d3.geoDistance(c,b[0]),d3.geoDistance(c,b[1]),d3.geoDistance(c,[b[0][0],b[1][1]]),d3.geoDistance(c,[x1,b[0][1]]));if(d3.geoDistance(c,ctr)-r>1.6)return}}
  ctx.beginPath();path(f);ctx.fillStyle=histFill(f.properties);ctx.fill();if(f.properties.k!==0){ctx.lineWidth=f.properties.o?.55:.45;ctx.strokeStyle="rgba(60,45,30,.42)";ctx.stroke()}});
 ctx.globalAlpha=1;if(histHotI!=null&&feats[histHotI]){ctx.beginPath();path(feats[histHotI]);ctx.lineWidth=2;ctx.strokeStyle="#fff";ctx.stroke()}
 const placed=[],k=gv.ls?gv.ls():1;ctx.textAlign="center";ctx.textBaseline="middle";labList().forEach(([gid,nm,lon,lat,area])=>{if(!flat&&d3.geoDistance([lon,lat],ctr)>1.35)return;const q=p([lon,lat]);if(!q||!isFinite(q[0]))return;
  const fs=(area>600?15:area>150?13:area>40?11.5:10.5)*k;ctx.font=`800 ${fs}px 'Nunito Sans', system-ui, sans-serif`;const w=ctx.measureText(nm).width,bx=[q[0]-w/2,q[1]-fs*.6,q[0]+w/2,q[1]+fs*.6];if(placed.some(o=>!(bx[2]<o[0]||bx[0]>o[2]||bx[3]<o[1]||bx[1]>o[3])))return;placed.push(bx);
  ctx.lineWidth=3;ctx.strokeStyle="rgba(255,255,255,.85)";ctx.strokeText(nm,q[0],q[1]);ctx.fillStyle="#2a2118";ctx.fillText(nm,q[0],q[1])});ctx.restore()});
/* the old drag handler counts the old frames, so the new map handles its own drag on the slider */
document.addEventListener("pointerdown",e=>{if(!useNew()||!histOn()||e.button>0)return;const tr=e.target.closest&&e.target.closest(".hist-track.hist2");if(!tr)return;const r=tr.querySelector(".hist-range");if(!r)return;
 if(e.target.closest("[data-hy]")&&e.target!==r)return;e.stopPropagation();if(e.target!==r)e.preventDefault();r.focus();histStop();const legend=tr.closest("#populationLegend");legend&&legend.classList.add("hist-dragging");window.HIST_DRAG=true;
 const N=YEARS.length,at=x=>{const b=r.getBoundingClientRect();return Math.round(Math.max(0,Math.min(1,(x-b.left)/b.width))*(N-1))};
 const mv=ev=>{const i=at(ev.clientX);if(i!==pos){r.value=i;histSet(i)}};const up=()=>{document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);legend&&legend.classList.remove("hist-dragging");window.HIST_DRAG=false};
 document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);mv(e)},true);
/* when a tour hands the map back, show the new map at the year it was on */
let wasNew=null;setInterval(()=>{const n=useNew();if(n!==wasNew){wasNew=n;if(n){histIdx=pos;histFocus=null}histShown=-1;framesCache.clear();try{if(histOn()){const legend=document.getElementById("populationLegend");if(legend)legend.innerHTML=histLegendHTML();histRender()}}catch(e){}}},500);
const st=document.createElement("style");st.textContent=`.hist-track.hist2 .hist-era{font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:clip}.hist-track.hist2 .hist-tick span{white-space:nowrap}.hist-cap i{font-style:normal;font-weight:800}.hist-track.hist2 .hist-era:not(.on){color:transparent}.hist-track.hist2 .hist-era.on{overflow:visible;z-index:2}`;document.head.appendChild(st);
window.GF_HIST2={years:YEARS,periods:PERIODS,go:y=>{const i=YEARS.findIndex(v=>v>=y);histSet(i<0?YEARS.length-1:i)}};
})();
