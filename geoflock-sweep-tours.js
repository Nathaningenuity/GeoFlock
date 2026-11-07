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
 /* Geography: the stop is about Antarctica, which the flat map cannot show (it ends near 60°S): this one stop opens on
    the globe, turned so the Sahara and Antarctica are both in sight */
 /* Elevation: Beringia was half under the card (Chukotka side): the whole land bridge beside it */
 "elev|Land the sea swallowed":S=>FRAME(S,-178,63,3,[147,53,-150,73]),
 "geo|The biggest desert is icy":S=>{SET(S,"autoGlobe",1);SET(S,"globe",[22,-32,1])},
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
};
function text(S,key){const X=TXT[key];if(!X||S._gfSwT===X)return;S._gfSwT=X;
 ["title","stat","body","more"].forEach(k=>{const v=X[k];if(typeof v==="string")SET(S,k,v)});
 (X.re||[]).forEach(([k,a,b])=>{if(typeof S[k]==="string"&&S[k].includes(a))SET(S,k,S[k].split(a).join(b))})}
function apply(S){try{if(!S||typeof ps==="undefined"||!ps)return;const key=ps.tour+"|"+S.title;text(S,key);const f=FIX[key];if(f&&S._gfSwF!==f){S._gfSwF=f;f(S)}}catch(e){console.error(e)}}
/* text fixes also before a stop opens (stop lists and search show titles and stats) */
function textAll(){try{if(typeof PS_TOURS==="undefined")return;for(const k in TXT){const i=k.indexOf("|"),T=PS_TOURS[k.slice(0,i)];if(!T)continue;const S=(T.steps||[]).find(s=>s&&(s.title===k.slice(i+1)||s._gfSwT===TXT[k]));if(S)text(S,k)}}catch(e){}}
window.gfSweepTours={FIX,TXT,apply};
if(window._gfSwInstalled){textAll();return}window._gfSwInstalled=1;
function wrap(){if(typeof psGo!=="function")return false;if(psGo._gfSw)return true;const _g=psGo;
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];window.gfSweepTours.apply(S)}catch(e){}return _g.apply(this,arguments)};psGo._gfSw=1;return true}
let n=0;const t=setInterval(()=>{if(wrap()||++n>80)clearInterval(t)},500);
[0,2000,6000,12000].forEach(ms=>setTimeout(()=>{try{window.gfSweepTours&&textAll()}catch(e){}},ms));
})();
