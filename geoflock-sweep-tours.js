/* GeoFlock: tour sweep (Start here, Physical Earth and Living planet shelves).
   Every stop of these tours was opened in the app and looked at; the fixes below are applied each time a stop opens
   (other scripts reset some stop fields after load), keyed by "tour|stop title", as in geoflock-polish-m.js.
     FIX  framing (view / globe), pins, map mode and other per-stop changes
     TXT  wording: a stop's stat, body or "Tell me more" text replaced (whole field), or {re:[[old,new],...]} edits */
(function(){
"use strict";
const SET=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};
/* frame a stop: centre [lon,lat] and globe zoom, plus a matching view box for the flat map */
const FRAME=(S,lon,lat,z,view)=>{SET(S,"globe",[lon,lat,z]);if(view){SET(S,"view",view);if(S.flatView)SET(S,"flatView",view)}};
/* keep the card on the left at this stop (see "the tour card stands on the right" below: S.card is reset by other scripts) */
const LEFT=S=>SET(S,"_gfSwLeft",1);
const dropPins=(S,re)=>{if(Array.isArray(S.pins)){const L=S.pins.filter(q=>!(Array.isArray(q)&&re.test(String(q[1]))));if(L.length!==S.pins.length)SET(S,"pins",L)}};
const FIX={
 /* Population: Java was framed on Borneo with Java itself cut off at the bottom edge */
 "pop|Java":S=>FRAME(S,105,-4,3.4,[90,-10.5,120,2.5]),
 /* Population: Nigeria and Lagos were half under the card */
 "pop|Africa’s two crowded corners":S=>FRAME(S,8,3,1.6,[-31,-12,46,18]),
 /* Population: London and Manchester, the banana's top end, were under the card */
 "pop|Europe’s Blue Banana":S=>FRAME(S,-1,50,3.5,[-16,42.5,14,57]),
 /* Population: the whole of Russia shows, European Russia beside the card instead of under it */
 "pop|Russia lives west of the Urals":S=>FRAME(S,45,58,1.2,[-95,35,185,78]),
 /* Elevation: Beringia was half under the card (Chukotka side): the whole land bridge beside it */
 "elev|Land the sea swallowed":S=>FRAME(S,-178,63,3,[147,53,-150,73]),
 /* Animal migration: routes that ran along the left of the map, under the card */
 "amigration|Eels to the Sargasso Sea":S=>FRAME(S,-60,36,1.5,[-138,10,20,62]),
 "amigration|Locust swarms":S=>FRAME(S,-60,17,1.3,[-161,-5,42,40]),
 /* Geography: the stop is about Antarctica, which the flat map cannot show (it ends near 60°S): this one stop opens on
    the globe, turned so the Sahara and Antarctica are both in sight */
 "geo|The biggest desert is icy":S=>{SET(S,"autoGlobe",1);SET(S,"globe",[22,-32,1])},
 /* Climate: Calgary and Winnipeg, the cold half of the comparison, were under the card */
 "climate|London is mild for its latitude":S=>FRAME(S,-60,47,1.8,[-205,25,12,66]),
 /* Climate: the Arctic cannot be seen on the flat map (only its southern edge, along the top): this stop opens on the
    globe, looking down on the Arctic Ocean */
 "climate|The fastest-warming place":S=>{SET(S,"autoGlobe",1);SET(S,"globe",[-30,78,1.3])},
 /* Animals: the lions of Africa were under the card; Africa now sits beside it, with India and the tigers' Asia */
 "animals|Tigers and lions":S=>FRAME(S,40,10,1.2,[-120,-38,145,58]),
 /* Crops: Madagascar was half under the card */
 "crops|Vanilla by hand":S=>FRAME(S,47,-18,4,[28,-27,60,-8]),
 /* stops where a right-hand card would sit on the subject: the card stays on the left */
 "pop|South America lives on its edges":S=>LEFT(S),
 "crops|The world’s breadbaskets":S=>LEFT(S),
 /* Forests: the moisture's path starts over the Atlantic and ends at the Andes; a right-hand card covered both ends */
 "forests|Forests make rain":S=>{LEFT(S);FRAME(S,-62,-14,2,[-124,-38,-28,12])},
 /* Forests: Methuselah's White Mountains were at the card's edge */
 "forests|The oldest trees":S=>{LEFT(S);FRAME(S,-116,38,3.5,[-136,30,-105,45])},
 /* Island life: Socotra itself was under the right-hand card (only Yemen showed) */
 "islandlife|Socotra":S=>{LEFT(S);FRAME(S,51,12.5,6,[42,8.5,57,16.5])},
 /* Island life: Guam, where the snake struck, was under the card; Mauritius and Guam now both beside it */
 "islandlife|Strangers from the ships":S=>{LEFT(S);FRAME(S,95,0,1.5,[-2,-26,150,24])},
 /* Ice: the ice road runs north-east from Yellowknife, under the right-hand card; card on the left, road beside it */
 "ice|Driving on lakes":S=>{LEFT(S);FRAME(S,-114,64,4,[-130,60.2,-103,67.6])},
 /* Islands: the Galápagos themselves were under the card (only mainland Ecuador showed beside it) */
 "islands|Penguins on the equator":S=>FRAME(S,-90.5,-1,5,[-103,-7,-84,4]),
 /* Islands: Ireland and Tristan da Cunha sat at the card's edge */
 "islands|No snakes in Ireland":S=>FRAME(S,-9,54.5,4,[-28,49,6,60]),
 "islands|The loneliest island town":S=>FRAME(S,-8,-27,2.4,[-44,-45,22,-8]),
 /* Islands: the Line Islands ring was under the right-hand card; all three island groups now beside a left-hand card */
 "islands|Island countries":S=>{LEFT(S);FRAME(S,176,-2,2,[140,-16,-148,12])},
 /* Lakes: the Caspian, the Great Lakes' Superior and Michigan, and the Missoula floods' path were half under the card */
 "lakes|The biggest lake is called a sea":S=>FRAME(S,46,42,3,[28,34,64,50]),
 "lakes|The Great Lakes":S=>FRAME(S,-88,45.5,4,[-104,40,-74,50]),
 "lakes|Lakes in a crack":S=>FRAME(S,29,-6,2.6,[17,-17,42,6]),
 "lakes|The lake that emptied in days":S=>FRAME(S,-120,47,4,[-131,44.3,-110,50.2]),
 /* Lakes: Finland was under the right-hand card; card left, Canada's shield and Finland both beside it */
 "lakes|Lakes scraped by ice":S=>{LEFT(S);FRAME(S,-60,58,1.1,[-205,38,42,74])},
 /* Earth at night: Lagos and Nigeria's lights, which the text names, were under the card */
 "night|The dim continent":S=>SET(S,"globe",[10,2,1.4]),
/*@FIX*/
};
const TXT={
 "projections|Now explore":{re:[["body","Drag countries is now on.","Dragging countries is now on."]]},
 /* Time zones: Eucla's 45-minute clock was told twice, two stops apart (it stays on "Australia: three zones") */
 "time|Half and quarter hours":{re:[["more","parts of Australia; Australia’s Eucla, a tiny town, unofficially keeps its own 45-minute zone.","parts of Australia."]]},
 /* stat lines that ran to three lines on the card: shorter, with what was cut moved into the text */
 "plates|The earthquake Japan wrote down":{stat:"In 1700 a magnitude-9 earthquake struck the coast of today’s Washington and Oregon, and Japan wrote down its tsunami",
  re:[["body","Off the Pacific Northwest,","It struck at about 9 pm on 26 January 1700. Off the Pacific Northwest,"]]},
 "lakes|The lake that emptied in days":{stat:"At the end of the last ice age, a lake as big as Erie and Ontario together burst through an ice dam, again and again"},
 "ice|Driving on lakes":{stat:"Each winter Canada builds a road about 600 km long, mostly over frozen lakes, and it lasts only about two months",
  re:[["body","The mines are far beyond any permanent road, so","It leads to diamond mines far beyond any permanent road, so"]]},
 "ice|When a volcano melts a glacier":{stat:"In 1996 an eruption under Iceland’s biggest glacier filled a hidden lake that burst out and washed away part of the ring road"},
 "volcanoes|The prisoner who survived":{stat:"In 1902 a glowing cloud from Mount Pelée killed about 28,000 people in minutes; one of the few survivors was in a prison cell"},
 "animals|Up in the Andes":{stat:"The Andes are the longest mountain range on land, and their high grasslands have animals built for thin, cold air",
  re:[["body","High in the Andes, above about 3,500 m,","They run about 7,000 km down South America. Above about 3,500 m,"]]},
 "animals|Tigers and lions":{stat:"India is the only country with both wild tigers and wild lions"},
 "biomes|The Pantanal: a flooded savanna":{stat:"The Pantanal, the largest tropical wetland on Earth, is mostly under water each wet season, yet in 2020 a quarter of it burned"},
 "ocean|Ocean parks":{stat:"Papahānaumokuākea, around the remote north-western Hawaiian islands, protects about as much ocean as Mongolia has land",
  re:[["body","Drag Mongolia’s outline over the islands to see how big the park is.","The park covers about 1.5 million km²: drag Mongolia’s outline over the islands to compare."]]},
 /* Population: the card and "Tell me more" both opened with the same sentence */
 "pop|China’s Hu line":{re:[["more","That is about 1.3 billion people, on less than half of China. ","They live on less than half of China’s land. "]]},
 /* a sentence without a verb */
 "pop|Europe’s Blue Banana":{body:"Counts run from about 110 to 145 million, depending on where the line is drawn. It stretches from Manchester to Milan and follows the Rhine, Europe’s busiest trade route for centuries."},
 /* a stat line two lines long: the capitals move into the text */
 "pop|Central America faces the Pacific":{stat:"People crowd the Pacific side and the highlands; the Caribbean side is nearly empty",
  re:[["body","A chain of volcanoes (dashed)","All five capitals of the old Central American federation are on the Pacific side or up in the highlands. A chain of volcanoes (dashed)"]]},
 /* a sentence without a verb */
 "geo|The river with the most water":{re:[["body","More than the next seven biggest rivers combined, and by some measures","That is more than the next seven biggest rivers combined. By some measures"]]},
 /* the climate map's colours as they now look (ice cap is white, hot desert rusty red) */
 "geo|The biggest desert is icy":{re:[["more","Only ice cap (dark grey) and hot desert (red) are lit.","Only the ice caps (white) and the hot deserts (rusty red) are coloured in."]]},
 /* a list with no verb opened the card */
 "climate|Fjords: carved on windy west coasts":{re:[["body","Norway, southern Chile, British Columbia and Alaska, New Zealand’s Fiordland. Westerly","They line the coasts of Norway, southern Chile, British Columbia and Alaska, and New Zealand’s Fiordland. Westerly"]]},
 /* the stat line and the text said the same words ("with no mountains in between to keep them apart") */
 "weather|Where air masses collide":{stat:"Over the Great Plains three kinds of air meet head-on"},
 /* Lakes: the stat and the text both said "bigger than Germany" */
 "lakes|The biggest lake is called a sea":{re:[["body","At about 371,000 km², it is bigger than Germany: drag Germany over it to compare.","It covers about 371,000 km²: drag Germany over it to compare."]]},
 /* "They" had nothing to point back to */
 "lakes|Lakes in a crack":{re:[["body","They fill a crack in Africa’s crust,","It and its neighbours fill a crack in Africa’s crust,"]]},
 /* "All four rivers" before the card had named them */
 "rivers|Cradles of civilisation":{re:[["body","All four rivers ran through dry land,","The Nile, the Tigris and Euphrates, the Indus and the Yellow River all ran through dry land,"]]},
 /* "perhaps higher, perhaps higher, perhaps higher": another script adds the two words each time it runs */
 "ranges|Old mountains: the Appalachians":{fix:[["body",/(perhaps higher, )+/g,"perhaps higher, "]]},
 /* the text repeated the stat line word for word */
 "hazards|Now explore":{re:[["body","Hover any country to see its name and neighbours. Try the","Try the"]]},
 "environment|Now explore":{re:[["body","Hover any country to see its name and neighbours. Try the","Try the"]]},
/*@TXT*/
};
function text(S,key){const X=TXT[key];if(!X)return;
 /* pattern fixes run every time (another script may write the text again) */
 (X.fix||[]).forEach(([k,re,b])=>{if(typeof S[k]==="string"){const v=S[k].replace(re,b);if(v!==S[k])SET(S,k,v)}});
 if(S._gfSwT===X)return;S._gfSwT=X;
 ["title","stat","body","more"].forEach(k=>{const v=X[k];if(typeof v==="string")SET(S,k,v)});
 (X.re||[]).forEach(([k,a,b])=>{if(typeof S[k]==="string"&&S[k].includes(a))SET(S,k,S[k].split(a).join(b))})}
function apply(S){try{if(!S||typeof ps==="undefined"||!ps)return;const key=ps.tour+"|"+S.title;text(S,key);const f=FIX[key];if(f&&S._gfSwF!==f){S._gfSwF=f;f(S)}}catch(e){console.error(e)}}
/* text fixes also before a stop opens (stop lists and search show titles and stats) */
function textAll(){try{if(typeof PS_TOURS==="undefined")return;for(const k in TXT){const i=k.indexOf("|"),T=PS_TOURS[k.slice(0,i)];if(!T)continue;const S=(T.steps||[]).find(s=>s&&(s.title===k.slice(i+1)||s._gfSwT===TXT[k]));if(S)text(S,k)}}catch(e){}}
window.gfSweepTours={FIX,TXT,apply};
/* the Toolkit tray floats over the map's bottom left corner, where a tall tour card has its Back button: the card is
   made just short enough to end above the tray (its text scrolls, as it already does when the map is small) */
window.gfSweepTours.kitGap=()=>{try{const c=typeof ps!=="undefined"&&ps&&ps.card,k=document.getElementById("gfKit");if(!c||!c.isConnected)return;
 let cap=0;if(k&&k.offsetParent!==null){const cr=c.getBoundingClientRect(),kr=k.getBoundingClientRect(),host=c.offsetParent?c.offsetParent.clientHeight:900;
  const natural=cr.top+Math.min(c.scrollHeight,480,host-24);
  if(kr.width&&kr.right>cr.left+8&&kr.left<cr.right-8&&kr.top<natural+4&&kr.top>cr.top+180)cap=Math.floor(kr.top-cr.top-8)}
 if((c._gfMh||0)!==cap){c._gfMh=cap;if(cap)c.style.setProperty("max-height",cap+"px","important");else c.style.removeProperty("max-height")}}catch(e){}};
/* the tour card stands on the right when the stop asks for it (S.card:"right") or when most of its pins are on the left
   (psCardSide), as the stops were written for; since tours moved into the flat-globe map (#amGlobeHost) it had stayed
   on the left, because the rule that moves it only named #allMapsWrap. Restored on the tours of these shelves; the few
   stops where the right-hand card would cover the subject are kept on the left (LEFT in FIX) */
const MINE=new Set(["geo","pop","projections","space","night","time","elev","plates","climate","weather","rivers","lakes","seas","coasts","islands","deserts","ice","ranges","volcanoes","hazards","caves","animals","biomes","forests","ocean","amigration","environment","islandlife","humans","crops"]);
window.gfSweepTours.side=()=>{try{const c=typeof ps!=="undefined"&&ps&&ps.card;if(!c)return;const S=psSteps()[ps.i],on=MINE.has(ps.tour)&&c.classList.contains("ps-right")&&!(S&&S._gfSwLeft);if(c.classList.contains("gf-sw-right")!==on)c.classList.toggle("gf-sw-right",on);const lf=MINE.has(ps.tour)&&!!(S&&S._gfSwLeft);if(c.classList.contains("gf-sw-left")!==lf)c.classList.toggle("gf-sw-left",lf)}catch(e){}};
if(!document.getElementById("gfSwCss")){const st=document.createElement("style");st.id="gfSwCss";st.textContent="#amGlobeHost .ps-card.ps-over.ps-right.gf-sw-right:not(.ps-free):not([style*=\"left\"]){left:auto;right:58px}.ps-card.ps-over.ps-right.gf-sw-left:not(.ps-free):not([style*=\"left\"]){left:5px!important;right:auto!important}";document.head.appendChild(st)}
if(window._gfSwInstalled){textAll();return}window._gfSwInstalled=1;
function wrap(){if(typeof psGo!=="function")return false;if(psGo._gfSw)return true;const _g=psGo;
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];window.gfSweepTours.apply(S)}catch(e){}const r=_g.apply(this,arguments);try{window.gfSweepTours.side()}catch(e){}return r};psGo._gfSw=1;return true}
let n=0;const t=setInterval(()=>{if(wrap()||++n>80)clearInterval(t)},500);
setInterval(()=>{try{window.gfSweepTours.side();window.gfSweepTours.kitGap()}catch(e){}},400);
/* Biomes, Forests and Animals tours light one biome by pressing its swatch in the Nature key; since a swatch press also
   opens the biome's card (a full-screen panel over a blurred map), a press made by a tour, not a person, closes it again */
document.addEventListener("click",e=>{try{if(!e.isTrusted&&e.target&&e.target.closest&&e.target.closest(".gf-nat-sw")&&typeof ps!=="undefined"&&ps)
 setTimeout(()=>document.querySelectorAll(".gf-nat-back").forEach(x=>x.remove()),0)}catch(err){}},true);
[0,2000,6000,12000,20000,30000].forEach(ms=>setTimeout(()=>{try{window.gfSweepTours&&textAll()}catch(e){}},ms));
})();
