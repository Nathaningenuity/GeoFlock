/* GeoFlock: "Try it" on tour stops. Where a toolkit gadget shows the stop's idea better than words, the stop gets a
   button that opens that gadget already set up: the shovel cutting through the right line, thermometers standing in
   the right towns, Greenland lifted for dragging, the sea level panel open, the ruler laid out. One press, and the
   reader is doing it, not just reading about it. */
(function(){
"use strict";
const T=window.gfToolkit,X=()=>window.gfCrossSection,TH=()=>window.gfThermo;
let OPEN=null;
const shovel=(v)=>()=>{OPEN="shovel";try{const x=X();x.start();setTimeout(()=>{try{x.pick(v)}catch(e){}},400)}catch(e){console.error(e)}};
const thermo=(list)=>()=>{OPEN="thermo";try{TH().setAuto(list)}catch(e){console.error(e)}};
const sea=()=>()=>{OPEN="sea";try{gfToolkit.seaPanel();clear()}catch(e){}};
/* a panel opened from the card should not sit on top of the card */
function clear(){setTimeout(()=>{try{const p=document.getElementById("gfkSea"),c=ps&&ps.card;if(!p||!c)return;const a=p.getBoundingClientRect(),b=c.getBoundingClientRect();if(a.right<b.left||a.left>b.right||a.bottom<b.top||a.top>b.bottom)return;
 const x=b.right+14<innerWidth-a.width?b.right+14:Math.max(8,b.left-a.width-14);p.style.position="fixed";p.style.left=x+"px";p.style.right="auto";p.style.top=Math.max(70,Math.min(innerHeight-a.height-12,b.top))+"px";p.style.bottom="auto"}catch(e){}},60)}
const ruler=()=>()=>{OPEN="ruler";try{const h=document.getElementById("allMapsWrap"),g=window.amGlobe;const r=(g&&g.host&&g.host.offsetParent?g.host:h).getBoundingClientRect();gfToolkit.dropTool("ruler",r.left+r.width*.5,r.top+r.height*.78)}catch(e){}};
const lift=(ll)=>()=>{OPEN="dragger";try{const s=gfToolkit.toScreen(ll);if(s)gfToolkit.dropTool("dragger",s[0],s[1])}catch(e){console.error(e)}};
const TRY={
 "geo|Deeper than Everest is tall":["Slice down into the Mariana Trench",shovel("p5")],
 "geo|Africa is splitting":["Slice across the East African Rift",shovel("p3")],
 "geo|Everest isn’t the tallest mountain":["Slice up to the roof of the world",shovel("p1")],
 "geo|South America is east of North America":["Lay the ruler from Miami to Lima",ruler(),"Click Miami, then Lima"],
 "elev|Deeper than Everest is tall":["Slice down into the Mariana Trench",shovel("p5")],
 "elev|The lowest land on Earth":["Slice through the Dead Sea rift",shovel("p8")],
 "elev|The roof of the world":["Slice up to the roof of the world",shovel("p1")],
 "elev|Countries that could disappear":["Raise the sea and watch islands go under",sea()],
 "elev|A country below the sea":["Raise the sea over the Netherlands",sea()],
 "elev|The ocean’s hidden spine":["Slice across the Atlantic ridge",shovel("p4")],
 "seas|If all the ice melted":["Raise the sea by 70 m",sea()],
 "ice|If Greenland melted":["Raise the sea by 7 m",sea()],
 "plates|The Atlantic is growing":["Slice across the Atlantic ridge",shovel("p4")],
 "plates|Africa is splitting":["Slice across the East African Rift",shovel("p3")],
 "plates|Where the Pacific sinks":["Slice down into the Mariana Trench",shovel("p5")],
 "plates|Squeezing up the Andes":["Slice from the Andes to the Atlantic",shovel("p0")],
 "ranges|The Andes":["Slice from the Andes to the Atlantic",shovel("p0")],
 "ranges|The Alps":["Slice over the Alps",shovel("p7")],
 "ranges|The Himalaya":["Slice up to the roof of the world",shovel("p1")],
 "ranges|Rain shadows":["Compare both sides with thermometers",thermo([[-122.3,47.6,"Seattle"],[-117.4,47.7,"Spokane"]]),"Wet on the windward side, dry behind the mountains"],
 "ranges|Old mountains: the Appalachians":["Slice from the Rockies to the Appalachians",shovel("p6")],
 "rivers|The Amazon":["Follow the Amazon from source to sea",shovel("rAmazon")],
 "rivers|The Nile’s slow fall and summer flood":["Follow the Nile from source to sea",shovel("rNile")],
 "rivers|China’s great river":["Follow the Yangtze from source to sea",shovel("rYangtze")],
 "rivers|The Mississippi system":["Follow the Mississippi from source to sea",shovel("rMississippi")],
 "climate|Five Mediterraneans":["Drop thermometers in all five",thermo([[-118.2,34.05,"Los Angeles"],[-70.65,-33.45,"Santiago"],[18.42,-33.92,"Cape Town"],[115.86,-31.95,"Perth"],[12.5,41.9,"Rome"]]),"Hot dry summers, mild wet winters, on five continents"],
 "climate|Same line, different worlds":["Compare two towns on the same latitude",thermo([[-0.13,51.5,"London"],[-114.07,51.05,"Calgary"]])],
 "climate|London is mild for its latitude":["Compare London with Calgary",thermo([[-0.13,51.5,"London"],[-114.07,51.05,"Calgary"]])],
 "climate|Monsoon climates":["Drop a thermometer in Mumbai",thermo([[72.88,19.08,"Mumbai"]]),"See how almost all the rain falls in four months"],
 "climate|The driest place, and the Andes’ trick":["Compare the Atacama and the Amazon",thermo([[-70.4,-23.65,"Antofagasta"],[-60.02,-3.12,"Manaus"]])],
 "climate|The coldest places people live":["Drop a thermometer in Yakutsk",thermo([[129.73,62.03,"Yakutsk"]])],
 "climate|Two islands, two currents":["Compare the two islands",thermo([[-21.9,64.15,"Reykjavík"],[-51.7,64.18,"Nuuk"]])],
 "deserts|Not heat, but rain":["Compare a hot and a cold desert",thermo([[32.9,24.1,"Aswan"],[106.9,43.6,"Gobi"]])],
 "deserts|Death Valley’s heat trap":["Drop a thermometer in Death Valley",thermo([[-116.87,36.46,"Death Valley"]])],
 "weather|The wettest place":["Drop a thermometer in Mawsynram",thermo([[91.58,25.3,"Mawsynram"]])],
 "pop|China’s Hu line":["Lay the ruler along the Hu line",ruler(),"Click Heihe in the far north-east, then Tengchong near Myanmar"],
 "africa|Room for three giants":["Lift the United States and drop it on Africa",lift([-98,39]),"Then lift China and India too"],
 "samerica|Brazil is half the continent":["Lift Brazil and drag it over Europe",lift([-52,-10])],
 "projections|Greenland vs Africa":["Lift Greenland and drop it on Africa",lift([-42,72]),"Watch it shrink as it moves south"],
 "projections|Russia’s real size":["Lift Russia and drag it to the Equator",lift([100,62])],
 "projections|Alaska vs Brazil":["Lift Alaska and drop it on Brazil",lift([-152,64])],
 "projections|The shortest way is curved":["Lay the ruler from London to Tokyo",ruler(),"Click London, then Tokyo: the line bends over the Arctic"],
 "volcanoes|Iceland: fire and ice":["Slice across Iceland on the ridge",shovel("p9")],
 "volcanoes|Kilimanjaro and the Rift":["Slice across the East African Rift",shovel("p3")],
 "plates|Hawaii on a conveyor belt":["Measure the island chain with the ruler",ruler(),"Click the Big Island, then Kauaʻi: about 500 km, made over 5 million years"],
 "seas|14 km from Africa":["Measure the Strait of Gibraltar",ruler(),"Click Tarifa in Spain, then the Moroccan coast"],
 "seas|The deep ocean":["Slice down into the Mariana Trench",shovel("p5")],
 "islands|Penguins on the equator":["Drop a thermometer on the Galápagos",thermo([[-90.3,-0.74,"Puerto Ayora"]]),"Cool water from the south keeps it mild on the Equator"],
 "ice|Ice on the equator":["Compare a peak town with the coast",thermo([[-78.5,-0.22,"Quito"],[-79.9,-2.19,"Guayaquil"]]),"Same latitude, 2,800 m apart: the higher you go, the colder"],
 "elev|Living in thin air":["Compare La Paz with the Amazon lowland",thermo([[-68.15,-16.5,"La Paz"],[-63.18,-17.8,"Santa Cruz"]])],
 "elev|Cities that climbed to keep cool":["Compare Bogotá with the Caribbean coast",thermo([[-74.07,4.71,"Bogotá"],[-74.8,10.96,"Barranquilla"]])],
 "deserts|The Gobi":["Drop a thermometer in the Gobi",thermo([[106.9,43.6,"Dalanzadgad"]]),"A desert with winters far below freezing"],
 "deserts|The Sahara":["Drop a thermometer in the middle of the Sahara",thermo([[5.5,22.8,"Tamanrasset"]])],
 "deserts|Behind the mountains":["Compare both sides of the Andes",thermo([[-72.6,-41.5,"Puerto Montt"],[-69.2,-41.1,"Patagonian steppe"]])],
 "weather|The snowiest city on Earth":["Drop a thermometer in Aomori",thermo([[140.74,40.82,"Aomori"]])],
 "weather|The monsoon":["Compare Mumbai and Delhi",thermo([[72.88,19.08,"Mumbai"],[77.2,28.6,"Delhi"]])],
 "biomes|Tundra":["Drop a thermometer on the tundra",thermo([[-156.8,71.3,"Utqiaġvik"]])],
 "biomes|Taiga":["Drop a thermometer in the taiga",thermo([[129.73,62.03,"Yakutsk"]])],
 "biomes|Savanna":["Drop a thermometer on the savanna",thermo([[36.8,-1.3,"Nairobi"],[34.8,-2.3,"Serengeti"]]),"A wet season and a long dry one"],
 "biomes|Tropical rainforest":["Drop a thermometer in the rainforest",thermo([[-60.02,-3.12,"Manaus"]]),"Hot and wet all year: almost no seasons"],
 "biomes|Mediterranean scrub":["Drop thermometers in all five",thermo([[-118.2,34.05,"Los Angeles"],[-70.65,-33.45,"Santiago"],[18.42,-33.92,"Cape Town"],[115.86,-31.95,"Perth"],[12.5,41.9,"Rome"]])],
 "biomes|Why biomes follow latitude":["Drop thermometers from the Equator to the Arctic",thermo([[-60.02,-3.12,"Manaus"],[-99.1,19.4,"Mexico City"],[-90.07,29.95,"New Orleans"],[-87.6,41.9,"Chicago"],[-114.4,62.45,"Yellowknife"]])],
 "environment|A treaty for a sinking nation":["Raise the sea over Tuvalu",sea(),"Tuvalu’s highest ground is about 4.5 m"],
 "environment|Greenland is melting":["Raise the sea by 7 m",sea()],
 "maths|Eratosthenes measures the Earth":["Measure Alexandria to Aswan",ruler(),"Click Alexandria, then Aswan: about 840 km, one fiftieth of the way round"],
 "maths|Great circles":["Lay the ruler from New York to Tokyo",ruler(),"Click New York, then Tokyo"],
 "maths|Mercator’s stretched map":["Lift Greenland and drag it south",lift([-42,72])],
 "borders|The longest borders":["Measure Canada’s border with the ruler",ruler(),"Click Vancouver, then Montreal"],
 "geopol|Chokepoints":["Measure the Strait of Hormuz",ruler(),"Click either shore: about 40 km at its narrowest"],
 "climate|The hottest and coldest ever recorded":["Compare Death Valley and Yakutsk",thermo([[-116.87,36.46,"Death Valley"],[129.73,62.03,"Yakutsk"]])],
 "samerica|Further east than you think":["Lay the ruler from Miami to Lima",ruler(),"Click Miami, then Lima"]
};
function add(){try{if(typeof ps==="undefined"||!ps||!ps.card)return;const S=psSteps()[ps.i];if(!S)return;const k=ps.tour+"|"+S.title,v=TRY[k]||(S.gfFrom&&TRY[S.gfFrom]);if(!v)return;if(S.drag&&v[1]&&String(v[0]).startsWith("Lift"))return;
 if(ps.card.querySelector(".gftry"))return;const b=document.createElement("button");b.type="button";b.className="gftry";b.innerHTML='<span>🧰 Try it</span>'+v[0];
 b.onclick=()=>{try{v[1]()}catch(e){}if(v[2])hint(v[2]);b.classList.add("done")};const t=ps.card.querySelector(".ps-stat")||ps.card.querySelector(".ps-title");if(t&&t.parentNode)t.parentNode.insertBefore(b,t.nextSibling);else ps.card.appendChild(b)}catch(e){}}
function hint(t){let m=document.querySelector(".gftry-hint");if(!m){m=document.createElement("div");m.className="gftry-hint";document.body.appendChild(m)}m.textContent=t;m.classList.add("on");clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove("on"),5000)}
setInterval(add,600);
/* what a "Try it" opened is put away when the stop changes or the tour ends */
function tidy(){const o=OPEN;OPEN=null;if(!o)return;try{if(o==="shovel")gfCrossSection.stop();else if(o==="thermo")gfThermo.clearAuto();else if(o==="dragger"||o==="ruler")gfToolkit.putAway(o);else if(o==="sea"){const p=document.getElementById("gfkSea");if(p)p.remove()}}catch(e){}}
let wrapped=0;const w=setInterval(()=>{if(wrapped||typeof psGo!=="function")return;wrapped=1;clearInterval(w);const _g=psGo;psGo=function(i){if(OPEN&&typeof ps!=="undefined"&&ps&&i!==ps.i)tidy();return _g.apply(this,arguments)};const _e=psEnd;psEnd=function(){tidy();return _e.apply(this,arguments)}},500);
window.gfTourTry={TRY};
{const s=document.createElement("style");s.textContent=`
.gftry{display:flex;align-items:center;gap:8px;width:100%;margin:8px 0;padding:8px 12px;border:2px dashed #c7853a;border-radius:12px;background:#fff7ea;color:#5a3a12;font:inherit;font-size:13.5px;font-weight:700;text-align:left;cursor:pointer}
.gftry span{flex:0 0 auto;padding:2px 8px;border-radius:999px;background:#c7853a;color:#fff;font-size:12px}.gftry:hover{background:#ffeed4}.gftry.done{border-style:solid;opacity:.85}
.gftry-hint{position:fixed;left:50%;bottom:90px;transform:translateX(-50%) translateY(10px);z-index:2500;padding:9px 16px;border-radius:12px;background:#2a2014;color:#fff6e6;font-weight:700;font-size:14px;opacity:0;pointer-events:none;transition:.25s}
.gftry-hint.on{opacity:1;transform:translateX(-50%)}`;document.head.appendChild(s)}
})();
