/* GeoFlock: the tour review applied to the Physical Earth shelf (Elevation, Climate, Rivers, Lakes, Seas & oceans, Islands,
   Plate tectonics, Natural hazards, Mountain ranges, Volcanoes, Caves, Weather and winds, Coasts, Deserts, Ice).
   - Each story gets one home tour: repeats are cut or trimmed (the Andes, the mid-ocean ridge, the ice-age sea, fjords,
     Fundy, Mawsynram, Maracaibo, Tornado Alley, Hawaii's hot spot, Vesuvius, Death Valley's record, the Titanic), and
     the figures that disagreed are made the same (Kilimanjaro over 80%, Mawsynram 11.9 m, Arctic ice once).
   - New stops (place, then why, then what it led to), drawn on the Relief map with lines, rings, rulers, cross-sections,
     the height slider and the sea-level slider; the Islands tour is reworked and re-ordered.
   - Tour questions follow the new and renamed stops.
   Patches go by tour id and stop title, so a renamed or removed stop is simply skipped. Everything is re-applied at
   0, 1.5, 5 and 12 s (and on load) because some tours rebuild their steps late; every step is idempotent.
   Photos: the shared library (PS_PHOTO_DATA) plus new Wikimedia Commons files in GF_RVPHYS_PHOTOS (author, licence, page). */
(function(){
window.GF_RVPHYS_PHOTOS=[{"f": "3Falls Niagara.jpg", "d": "photos/xcf72e0051565b75d.webp", "by": "Saffron Blaze", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:3Falls_Niagara.jpg"}, {"f": "Dry Falls.jpg", "d": "photos/x981269a8889e8951.webp", "by": "Ikiwaner", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Dry_Falls.jpg"}, {"f": "Lituya Bay overview.jpg", "d": "photos/xd12f2c1fc7f26b35.webp", "by": "D.J. Miller, United States Geological Survey", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Lituya_Bay_overview.jpg"}, {"f": "Dune du Pilat - Atlantique.jpg", "d": "photos/xae1e61e3a2e65bf9.webp", "by": "Jörg Braukmann", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Dune_du_Pilat_-_Atlantique.jpg"}];
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
/* psLock style: a getter that ignores later writes (some tour files put their own photo-pin list back) */
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const TT=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&Array.isArray(t.steps)&&t.steps.length?t:null}catch(e){return null}};
const st=(id,title)=>{const t=TT(id);return t?t.steps.find(s=>s&&s.title===title):null};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const OR="#d9682b";
const ph=(at,label,f)=>({at,label,col:OR,icon:"photo",_f:f});
const P=(at,label)=>[at,label,"point"];
const A=(pts,label)=>[pts,label,"area"];
/* change a stop: writes go through defineProperty (some fields are locked getters); a new view is locked and marked _ff */
const lockv=(t,k,v)=>Object.defineProperty(t,k,{configurable:true,enumerable:true,get(){return v},set(){}});
function set(id,title,f){const s=st(id,title);if(!s)return null;try{f(new Proxy(s,{set(t,k,v){
  if(k==="view"){lockv(t,k,v);def(t,"_ff",1)}else if(k==="phPins"){lock(t,k,v);def(t,"_sqPruned",-1)}else def(t,k,v);return true},
  deleteProperty(t,k){try{def(t,k,undefined);delete t[k]}catch(e){}return true}}))}catch(e){console.error("review-phys",id,title,e)}return s}
/* replace a piece of text in a stop field (only if it is still there) */
function rep(id,title,k,from,to){const s=st(id,title);if(!s||typeof s[k]!=="string")return;const v=s[k];if(v.indexOf(from)<0)return;def(s,k,v.split(from).join(to))}
function rename(id,from,to){const s=st(id,from);if(!s||st(id,to))return;def(s,"title",to);
 try{if(typeof PS_PHOTO!=="undefined"&&PS_PHOTO[id+"|"+from]!=null&&PS_PHOTO[id+"|"+to]==null)PS_PHOTO[id+"|"+to]=PS_PHOTO[id+"|"+from]}catch(e){}}
function rm(id,title){const t=TT(id);if(!t)return;const i=t.steps.findIndex(s=>s&&s.title===title);if(i>=0)t.steps.splice(i,1)}
/* insert a new stop after the stop titled `after` (once); a new stop always has its own view */
function ins(id,after,o){const t=TT(id);if(!t||t.steps.some(x=>x&&x.title===o.title))return;let i=t.steps.findIndex(x=>x&&x.title===after);
 if(i<0)i=t.steps.length-2;const s=S(Object.assign({_ff:1},o));const ph0=s.phPins;delete s.phPins;if(ph0)lock(s,"phPins",ph0);t.steps.splice(i+1,0,s)}
/* put the stops of a tour in this order (titles); stops not named keep their place after the named ones, before "Now explore" */
function order(id,titles){const t=TT(id);if(!t)return;const by=new Map(t.steps.map(s=>[s.title,s]));const out=[];
 titles.forEach(x=>{if(by.has(x)){out.push(by.get(x));by.delete(x)}});const last=t.steps[t.steps.length-1];
 t.steps.forEach(s=>{if(by.has(s.title)&&s!==last)out.push(s)});if(by.has(last.title))out.push(last);
 if(out.length===t.steps.length&&out.some((s,i)=>s!==t.steps[i]))t.steps.splice(0,t.steps.length,...out)}

/* ======================================================================================================== */
function patch(){
/* ───────────── Elevation ───────────── */
ins("elev","Everest isn’t the tallest mountain",{title:"Sea level isn’t level",view:[30,-38,165,32],globe:[95,-5,1.5],card:"right",
 stat:"South of India, the sea surface sits about 100 m lower than it would on a perfectly smooth Earth",
 body:"Gravity is not exactly the same everywhere. Under this part of the Indian Ocean there is less mass deep inside the Earth, so gravity is a little weaker, and the water drifts away to where it pulls harder, leaving a dip of about 106 m (the ring). Ships sail down into it and out again without noticing, because the slope is spread over thousands of kilometres.",
 more:"This lumpy ‘sea level’ is called the geoid. Its highest bulge, about 85 m up, is around New Guinea. The heights on this map, Everest’s 8,849 m included, are measured from it, not from a perfect ball.",
 lines:[{circle:[78,3],km:1500,kind:"circle"},{circle:[78,3],km:700,kind:"circle"}],
 pins:[P([78,3],"Indian Ocean low: about 106 m below"),P([142,-4],"New Guinea high: about 85 m above")]});
ins("elev","Cities that climbed to keep cool",{title:"Where states can’t climb",view:[86,13,114,31],globe:[100.5,22,3.6],card:"left",gfThr:{kind:"elev",v:1000},
 stat:"For centuries, the hills of mainland South-East Asia sheltered millions of people beyond the reach of the lowland kingdoms",
 body:"Rice kingdoms grew on flat, wet valley floors, where harvests were easy to count and tax. Every hundred metres of steep, forested slope made armies and tax collectors slower, so hill peoples could stay out of reach, and some moved uphill on purpose. The historian Willem van Schendel named this upland block ‘Zomia’. The slider lights land over 1,000 m: the old capitals sit in the valleys between.",
 more:"The political scientist James Scott argued in 2009 that hill farming, oral traditions and scattered villages were partly ways of staying ungoverned. Many historians think he went too far, but the basic pattern, states in the valleys and refuges in the hills, is widely accepted. Tens of millions of people from hill peoples such as the Hmong, Akha and Karen live across these uplands today.",
 pins:[A([[100,25],[103,23.5],[98.5,22.5]],"Uplands over 1,000 m: ‘Zomia’"),P([96.08,21.97],"Mandalay: a valley kingdom"),P([100.57,14.35],"Ayutthaya, on the Chao Phraya"),P([105.85,21.03],"Hanoi, on the Red River delta")],
 phPins:[ph([101.2,23.3],"Hill farms in the Yunnan uplands","Swidden agriculture in Yunnan Province uplands.JPG")]});
rm("elev","The longest mountain range on land");
set("elev","The ocean’s hidden spine",s=>{
 s.body="The Mid-Atlantic Ridge runs down the middle of the Atlantic, where two plates pull apart: follow the lighter blue line on the sea floor. The ridge rises 2 to 3 km above the ocean floor, yet its crest is still usually 2 km or more under the waves.";
 s.more="It is part of a chain of underwater mountains about 65,000 km long that winds through every ocean. Iceland is where the ridge finally breaks the surface, which is why it has so many volcanoes and hot springs; the Azores, Ascension and Tristan da Cunha are lower peaks that just reach the air.";
 s.phPins=[];s.iconPins=[{at:[-19.67,63.99],icon:"volcano",col:"#c2364f"}]});
set("elev","The lowest land on Earth",s=>{
 if(!/105 km/.test(s.body))s.body="It is the lowest dry land on Earth. It sits on a crack where Arabia slides north past Africa, by about 105 km so far; where the crack steps sideways, the ground between is pulled apart and sinks into a deep trough. Move along the chart from the coast over the hills of Jerusalem and down into it.";
 if(!/no outlet/.test(s.more||""))s.more="The lake has no outlet, so water leaves only by evaporating, which has made it nearly ten times saltier than the ocean. "+(s.more||"")});
rep("elev","The roof of the world","more"," It even pushed old seabed into the sky. The rock at the top of Everest is limestone that formed under an ancient sea, and it holds fossils of sea creatures.","");
rep("elev","Low and high, neighbours","more"," It also holds the record for the hottest air temperature ever measured, 56.7°C in 1913.","");
set("elev","Living in thin air",s=>{if(!/Beamon/.test(s.more||""))s.more=(s.more||"")+" Thin air helps some athletes: at the 1968 Olympics in Mexico City, 2,240 m up, Bob Beamon long-jumped 8.90 m, 55 cm past the world record, partly because the air pushed back less. His record stood for almost 23 years."});

/* ───────────── Climate ───────────── */
rm("climate","The biggest desert is icy");
rename("climate","The monsoon and the wettest place","Monsoon climates");
set("climate","Monsoon climates",s=>{
 s.stat="Across South and East Asia, one swing of the wind gives a wet summer and a dry winter";
 s.body="Every summer the land heats up faster than the sea, so warm air rises over it and moist ocean air is pulled in, bringing months of rain. In winter the winds reverse and blow dry air off the land. That one swing makes three climates with the same rhythm.";
 s.more="Only monsoon (mid blue), savanna (light blue) and dry-winter subtropical (pale green) climates are lit: all have a wet summer and a dry winter. The arrow traces the summer wind off the Bay of Bengal. Over a billion people depend on the monsoon for farming and drinking water, so a late or weak monsoon can mean drought, and a strong one floods. The Weather and winds tour follows the rain to the wettest place on Earth.";
 s.phPins=[];s.iconPins=[]});
ins("climate","Same line, different worlds",{title:"The coldest winter is a summer",view:[-127.5,34.6,-116.5,41.2],globe:[-122,38,6],card:"left",
 stat:"In July, San Francisco’s afternoons average about 20 °C, while Sacramento, 120 km inland, bakes at about 34 °C",
 body:"In summer, winds along the coast push the surface water offshore, and cold water wells up from the deep to replace it, chilling the air above into fog. Inland, hot air over the Central Valley rises and sucks that cool, foggy sea air in through the only big gap in the coastal hills, the Golden Gate (the blue arrow). Summer is San Francisco’s foggiest season.",
 more:"The line ‘The coldest winter I ever spent was a summer in San Francisco’ is usually credited to Mark Twain, but there is no evidence he said it. The fog keeps a daily rhythm: it pours in through the Golden Gate in the evening and often burns off by midday.",
 lines:[{coords:[[-124.6,37.55],[-123.4,37.7],[-122.48,37.81],[-122.2,38.0],[-121.8,38.3],[-121.5,38.55]],kind:"cold"}],
 pins:[P([-122.42,37.77],"San Francisco: July afternoons ~20 °C"),P([-121.49,38.58],"Sacramento: ~34 °C"),P([-124.3,38.9],"Cold water wells up offshore"),A([[-121.2,37.6],[-120.6,38.6],[-121.6,39.6]],"Central Valley: hot air rises")],
 phPins:[ph([-122.478,37.82],"The Golden Gate","Golden Gate Bridge as seen from Marshall’s Beach, March 2018.jpg")]});
rep("climate","The fastest-warming place","more","as it is now, about 40% smaller","as it is now, far smaller");

/* opening stops: drop photo pins for stories this shelf no longer tells there, and keep figures in line */
set("climate","The world’s climates",s=>{const L=s.phPins||[];if(L.some(q=>/11,800/.test(q.label)))s.phPins=L.map(q=>{if(!/11,800/.test(q.label))return q;try{const M=window.PS_SQ_IMG;if(M&&M[q.label]!=null)M["Mawsynram: the wettest place"]=M[q.label]}catch(e){}return Object.assign({},q,{label:"Mawsynram: the wettest place"})})});
set("coasts","Coasts",s=>{const L=s.phPins||[];if(L.some(q=>/Jakarta/.test(q.label)))s.phPins=L.filter(q=>!/Jakarta/.test(q.label))});
set("hazards","Natural hazards",s=>{const L=s.phPins||[];if(L.some(q=>/^Vesuvius/.test(q.label)))s.phPins=L.filter(q=>!/^Vesuvius/.test(q.label))});

/* ───────────── Rivers ───────────── */
ins("rivers","The Amazon",{title:"The Amazon once flowed west",view:[-84,-18,-44,6],globe:[-65,-5,2.2],card:"right",
 stat:"Before the Andes rose, much of the Amazon basin drained west, towards the Pacific",
 body:"As the Andes were pushed up, they blocked the old western exits. For millions of years the water pooled in a vast swamp and lake system across the western Amazon, the Pebas wetland. Roughly 10 million years ago it finally overflowed to the east, and the river has run to the Atlantic ever since (the blue arrow).",
 more:"The proof is in mud: sand worn from the Andes starts to turn up in the Amazon’s fan on the sea floor off Brazil only around 9 to 10 million years ago, though some studies argue for later. The old wetland was sometimes reached by the sea, one reason the Amazon’s freshwater stingrays have sea-going ancestors.",
 lines:[{coords:[[-58,-3.5],[-66,-3.2],[-73,-2.6],[-78.5,-2],[-81,-1.8]],kind:"dash"},{coords:[[-72,-3.8],[-66,-3.6],[-60,-3.1],[-54.5,-2.3],[-50,-0.6]],kind:"flow"}],
 pins:[A([[-74,-3],[-68,-6],[-71,-8.5]],"Pebas wetland, ~20–10 million years ago"),P([-76.5,-1.5],"Long ago: water drained west"),P([-75.5,-12],"The Andes rise and block the way")]});
rm("rivers","Downhill to the sea");
rename("rivers","The flood that made Egypt","The Nile’s slow fall and summer flood");
set("rivers","The Nile’s slow fall and summer flood",s=>{
 s.stat="North of Khartoum the Nile falls less than 400 m in about 3,000 km, and before 1970 nine-tenths of its water came in three summer months";
 s.body="Across the desert the river barely slopes; its last steps are six rocky rapids, the cataracts, which kept boats out and made Aswan Egypt’s old southern border. Each summer, monsoon rain in Ethiopia’s highlands swelled it into a flood that spread rich silt over the fields. Slide through the year, then switch to after the dam."});
ins("rivers","How a river makes a lake",{title:"The waterfall that walks backwards",view:[-79.75,42.85,-78.45,43.4],globe:[-79.06,43.12,9],card:"left",
 stat:"Niagara Falls has moved about 11 km upstream in the last 12,500 years",
 body:"The river drops over a hard cap of rock that sits on softer shale. Spray and swirling water scour out the soft layer underneath, the hard lip breaks off, and the falls step back. Behind them they have left the Niagara Gorge, the dashed line, running back to the cliff where they began.",
 more:"The falls once retreated about a metre a year, but today much of the river is diverted to hydroelectric plants, which has slowed the wearing away greatly. In 1969 engineers dammed off the American Falls for about five months to study the rock, and visitors walked on the dry riverbed.",
 lines:[{coords:[[-79.045,43.158],[-79.05,43.14],[-79.058,43.12],[-79.06,43.105],[-79.068,43.09],[-79.075,43.08]],kind:"dash"}],
 pins:[P([-79.04,43.162],"Queenston: where the falls began, ~12,500 years ago")],
 phPins:[ph([-79.074,43.079],"Niagara Falls today","3Falls Niagara.jpg")]});
rename("rivers","Cradles of civilization","Cradles of civilisation");
set("rivers","Cradles of civilisation",s=>{
 s.stat="The first great civilisations all grew up beside rivers";
 s.body="All four rivers ran through dry land, so farmers depended on the yearly flood and on canals. Sharing a canal needed someone to organise the work, settle disputes and record who was owed what: early kings, laws and writing grew out of that.";
 if(typeof s.more==="string")s.more=s.more.replace(/civilization/g,"civilisation")});

/* ───────────── Lakes ───────────── */
rm("lakes","Lake of lightning");
set("lakes","The deepest and oldest lake",s=>{
 s.stat="Lake Baikal holds more fresh water than all five Great Lakes put together";
 s.body="It is over 1,600 m deep and about 25 million years old, the deepest and oldest lake on Earth. It covers less area than Lake Superior, but its depth lets it hold about 23,600 km³ of water."});
rename("lakes","Land of a thousand lakes","Lakes scraped by ice");
set("lakes","Lakes scraped by ice",s=>{
 s.stat="Canada has more lakes than the rest of the world combined, and Finland has about 188,000";
 s.body="Ice-age glaciers scraped hollows into hard, old rock, the Canadian and Baltic shields, and the hollows filled with water. That is why lakes crowd the north and are rare further south.";
 s.more="Zoom in on either: thousands of long lakes lined up in the direction the ice moved. Finland’s Lake Saimaa is so maze-like that its shoreline is about 15,000 km long, and it has its own rare seal. In Lake Huron, Manitoulin Island, the largest island in any lake, has over 100 lakes of its own; one of them, Lake Mindemoya, has an island too: an island in a lake on an island in a lake.";
 s.view=[-135,40,45,74];s.globe=[-40,60,1.2];s.hi=["fi","ca"];
 s.pins=[A([[26,62.5],[27,63]],"Finland: about 188,000 lakes"),A([[-95,57],[-88,53],[-105,60]],"The Canadian Shield")]});
rm("lakes","Canada’s lakes");
ins("lakes","Lakes that disappeared",{title:"The lake that emptied in days",view:[-125,44.3,-110,50.2],globe:[-117,47,4],card:"left",
 stat:"At the end of the last ice age, a lake holding about as much water as Lakes Erie and Ontario together burst through an ice dam again and again, draining in days each time",
 body:"A tongue of the ice sheet blocked a river valley in Idaho and backed up Glacial Lake Missoula across western Montana. When the water got deep enough, it floated the ice dam and broke it, and the whole lake roared across Washington (the arrows), scouring the land to bare rock. Then the ice moved forward, the dam re-formed, and it happened again, probably dozens of times.",
 more:"In the 1920s the geologist J Harlen Bretz argued that a giant flood had carved this land, and other geologists mocked him for decades. Evidence like Dry Falls, a dry cliff about 5.5 km wide and 120 m high, and ripple marks taller than houses won them over. In 1979, aged 96, he received geology’s top US award.",
 lines:[{coords:[[-116.35,48.1],[-117.3,47.65],[-118.4,47.35],[-119.2,46.75],[-120.6,45.7],[-122.6,45.6],[-123.9,46.2]],kind:"flow"},{coords:[[-116.35,48.1],[-117.6,47.9],[-119.0,47.7],[-119.6,47.2]],kind:"flow"}],
 pins:[A([[-114,47],[-114.5,47.5],[-113.5,46.7]],"Glacial Lake Missoula"),P([-116.35,48.1],"The ice dam"),P([-121,46.2],"The floods pour down the Columbia")],
 phPins:[ph([-119.36,47.61],"Dry Falls: a waterfall with no river","Dry Falls.jpg")]});
ins("lakes","Lakes made by people",{title:"A lake made by mistake",view:[-119.2,31.3,-112.4,35.1],globe:[-115.8,33.3,6],card:"left",
 stat:"California’s largest lake was made by accident in 1905, when the Colorado River broke into an irrigation canal",
 body:"The Salton Sink is a basin below sea level. When a flood burst through a badly built canal intake near the Mexican border, most of the Colorado River turned and poured downhill into the basin (the arrow) for almost two years, until railway crews blocked the breach. It left a lake about 50 km long in the desert.",
 more:"With no outlet and mostly farm run-off to feed it, the lake has grown saltier than the ocean and is shrinking, exposing dusty, polluted shores. Hot, salty water deep under the area is now being tested as a source of lithium for batteries.",
 lines:[{coords:[[-114.72,32.72],[-115.1,32.68],[-115.45,32.85],[-115.6,33.05],[-115.75,33.22]],kind:"flow"}],
 pins:[P([-115.8,33.3],"Salton Sea, about 70 m below sea level"),P([-114.72,32.72],"1905: the river breaks into a canal")],
 phPins:[ph([-115.95,33.4],"The Salton Sea","Salton Sea.jpg")]});
ins("lakes","Deadly lakes",{title:"A tsunami on Lake Geneva",view:[5.55,45.95,7.55,46.75],globe:[6.55,46.4,8],card:"left",
 stat:"In 563 AD a collapse at the eastern end of Lake Geneva sent a tsunami racing about 70 km to the city of Geneva",
 body:"A mountainside fell into the Rhône valley where the river enters the lake. The shock set off a slide of the river’s soft delta mud along the lakebed, which pushed up a wave several metres high that ran the whole length of the long, narrow lake (the dashed line). Chroniclers wrote that it swept away villages and killed many people in Geneva.",
 more:"For centuries the story was treated as legend, until a 2012 survey of the lakebed found a layer of slid mud, metres thick, from the same time. The model suggests the wave reached Geneva about an hour later. A similar collapse could happen again, and around a million people live by the shore.",
 lines:[{coords:[[6.88,46.39],[6.7,46.44],[6.5,46.47],[6.3,46.42],[6.2,46.3],[6.15,46.21]],kind:"dash"}],
 pins:[P([6.88,46.385],"563 AD: the Rhône delta slides"),P([6.15,46.205],"Geneva: hit about an hour later")],
 phPins:[ph([6.927,46.414],"Chillon, at the lake’s eastern end","001 Chateau de Chillon and Dents du Midi Photo by Giles Laurent.jpg")]});

/* ───────────── Seas & oceans ───────────── */
rm("seas","When the sea was 120 m lower");
set("seas","Two tides a day",s=>{
 s.stat="Most coasts get two high tides a day, but some places, like parts of the Gulf of Mexico, get only one";
 s.more="The two bulges come round about every 24 hours 50 minutes, because the Moon moves on a little each day. The shape and size of a sea can favour one of them, which is why some coasts get one high tide a day. The biggest tides of all are in the Coasts tour.";
 s.view=[-100,15,-50,52];s.globe=[-80,30,2.2];s.pins=[P([-89,28.5],"Parts of the Gulf of Mexico: one tide a day"),P([-64.4,45.3],"Bay of Fundy: two, and the biggest")]});
set("seas","The deep ocean",s=>{
 s.more="Only 27 people had been to the bottom of the trench by 2022, about twice the 12 who have walked on the Moon. Below about 1,000 m no sunlight reaches at all, yet life is everywhere, from glowing fish to giant squid. Sound travels so well about 1 km down, in a layer called the SOFAR channel, that whale calls can carry across whole ocean basins. The trench lies at the edge of the Philippine Sea, usually counted as the biggest sea on Earth, about 5 million km²."});
rep("seas","The melting Arctic","more","Summer sea ice has shrunk by about 40% since 1979, and the Arctic","The Arctic");
set("seas","Rivers in the sea",s=>{
 s.body="Warm currents (red) flow away from the equator, cold ones (blue) flow towards it, so the oceans carry heat around the planet. Winds and the Earth’s spin turn them into giant loops called gyres in every ocean basin.";
 s.more="The Gulf Stream helps keep western Europe mild, while cold currents along the west coasts of South America and Africa help make deserts there. The Gulf Stream alone carries more water than all the world’s rivers combined. Deep down, a slower ‘conveyor belt’ of cold, salty water takes about 1,000 years to circle the globe: the next stop shows where it starts.";
 s.phPins=[]});
ins("seas","14 km from Africa",{title:"When the Mediterranean dried up",view:[-14,27,42,47.5],globe:[15,37,2],card:"left",
 stat:"About 6 million years ago the Mediterranean was cut off from the Atlantic and largely dried out, leaving salt over a kilometre thick",
 body:"The Mediterranean loses more water to evaporation than its rivers bring in, so it depends on the Atlantic flowing in at Gibraltar. When plate movements closed that gateway, the sea shrank into a deep basin of salty lakes, kilometres below today’s sea level. About 5.3 million years ago the Atlantic broke back through and refilled it (the arrow).",
 more:"One study suggests the refill may have taken only months to a couple of years, with water pouring in at about a thousand times the flow of the Amazon; others think it was slower. The buried salt was found by a drilling ship in 1970.",
 lines:[{coords:[[-11,36.2],[-7,36],[-5.6,35.95],[-3,36.2],[0,36.8]],kind:"flow"}],
 pins:[P([-5.6,35.95],"Gibraltar: the gate closed ~6 million years ago"),A([[18,34.5],[24,35.5],[12,38]],"Salt over 1 km thick under the sea floor")],
 phPins:[ph([-5.35,36.0],"The Strait of Gibraltar today","Strait of Gibraltar perspective.jpg")]});
ins("seas","Rivers in the sea",{title:"The biggest waterfall is underwater",view:[-52,55,-2,72.5],globe:[-27,65,3],card:"right",
 stat:"Under the sea between Greenland and Iceland, cold water plunges about 3.5 km: the biggest waterfall on Earth",
 body:"Very cold, heavy water from the Arctic piles up behind an undersea ridge. Where it spills over (the blue arrow), it pours down the slope towards the deep Atlantic floor, carrying millions of cubic metres a second, over a thousand times the flow of Niagara.",
 more:"You would never see it from a ship: it is water falling through water. This sinking helps drive the slow ‘conveyor belt’ that circles the oceans, and it works partly because the North Atlantic is salty. The trade winds carry water vapour from the Atlantic across narrow Central America and drop it as rain into the Pacific, so the Atlantic keeps getting saltier, and heavier when it cools. The fresher North Pacific has no such deep sinking.",
 lines:[{coords:[[-19,69.5],[-24,67.5],[-27,66.1],[-30.5,64.4],[-35,62],[-40,59.5]],kind:"cold"}],
 pins:[P([-27,66.1],"Denmark Strait: the water spills over a ridge"),P([-36,61],"…and sinks about 3.5 km to the deep floor")]});

/* ───────────── Islands (rework) ───────────── */
rm("islands","One island, three countries");rm("islands","Islands on a conveyor belt");rm("islands","The alien-looking island");rm("islands","An island of 1,000 languages");
set("islands","The biggest islands",s=>{if(!/two pieces/.test(s.more||""))
 s.more="Greenland, about 2.1 million km², is bigger than Mexico. Borneo is the only island split between three countries: Indonesia, Malaysia and Brunei, which is itself in two pieces. Honshu, Japan’s main island, is seventh, and Great Britain, about 209,000 km², ninth, after Sumatra, Honshu and Canada’s Victoria Island."});
set("islands","Three kinds of islands",s=>{if(!/hot spot/.test(s.more||""))s.more=(s.more||"")+" Volcanic islands over a hot spot form in a line, like Hawaii’s, each one carried off by the moving plate as a new one rises (the Plate tectonics tour shows it)."});
set("islands","An island in a lake on an island",s=>{
 s.more="Lake Toba is the largest volcanic lake on Earth, about 100 km long. Samosir rose as magma pushed the floor of the collapsed volcano back up, and today it is covered in farms and villages."});
rename("islands","The most crowded islands","Why Java, not Borneo");
set("islands","Why Java, not Borneo",s=>{
 s.stat="Java has about 150 million people and Borneo about 23 million, though Borneo is about six times bigger";
 s.body="Java’s volcanoes keep laying down fresh, fertile ash. Borneo has no active volcanoes, and millions of years of heavy rain have washed the nutrients out of its old soils. So Java could feed dense rice-farming villages, and Borneo could not.";
 s.more="Java is the most populous island on Earth, holding more than half of Indonesia’s people on land about the size of England. The same pattern runs across Indonesia: the crowded islands, such as Java and Bali, are the volcanic ones.";
 s.view=[100,-10,122,8];s.globe=[111,-2,3];delete s.list;s.hi=[];
 s.pins=[P([113.9,0.8],"Borneo: ~23 million people, old washed-out soils"),P([109.5,-7.0],"Java: ~150 million people")];
 s.phPins=[ph([110.44,-7.54],"Merapi and Merbabu: Java’s volcanoes","Merbabu&Merapi.JPG"),ph([112.95,-7.94],"Bromo and Semeru, east Java","Mount Bromo at sunrise, showing its volcanoes and Mount Semeru (background).jpg")];
 s.iconPins=[{at:[110.44,-7.54],icon:"erupt",col:"#c2364f"},{at:[112.92,-8.11],icon:"erupt",col:"#c2364f"},{at:[107.6,-7.2],icon:"erupt",col:"#c2364f"}]});
set("islands","Island countries",s=>{
 s.stat="Tiny Kiribati has about 800 km² of land, yet it controls about 3.4 million km² of ocean";
 s.body="Every island earns its country a zone reaching 200 nautical miles, about 370 km, out to sea, where only that country may fish or mine. Kiribati’s 33 islands are spread so widely that their zones together are bigger than India (the rings show 370 km around three of its island groups).";
 s.more="About 47 countries are made only of islands, from Indonesia, with about 17,000, to Nauru, a single island of 21 km². Being an island shaped their history too: Britain and Japan were hard to invade and built strong navies.";
 s.view=[-180,-22,-145,14];s.globe=[-168,-1,2.3];delete s.list;s.hi=["ki"];s.card="right";
 s.lines=[{circle:[173.0,1.4],km:370,kind:"circle"},{circle:[-171.7,-3.7],km:370,kind:"circle"},{circle:[-157.4,1.9],km:370,kind:"circle"}];
 s.pins=[P([173.0,1.4],"Gilbert Islands"),P([-171.7,-3.7],"Phoenix Islands"),P([-157.4,1.9],"Line Islands")];
 s.phPins=[ph([172.98,1.35],"Tarawa, Kiribati’s capital","ISS-53 Tarawa, Kiribati.jpg")]});
ins("islands","The most islands",{title:"No snakes in Ireland",view:[-24,49,4,59.5],globe:[-5,54,4],card:"left",gfSea:-60,gfSeaUI:true,
 stat:"Britain has three kinds of native snake. Ireland, next door, has none",
 body:"After the last ice age, animals spread north again as the ice melted, over land that is now under the sea. Rising seas probably cut Ireland off from Britain before snakes got that far, while Britain stayed joined to Europe for thousands of years more. The map shows the sea 60 m lower than today: Britain is still part of Europe, Ireland is already an island. Slide the sea back up.",
 more:"Ireland also has no native moles, and its only native land reptile is a small lizard. Legend says St Patrick drove the snakes out, but there were none to drive. Some scientists think Ireland had no land link at all after the ice age.",
 pins:[P([-8,53.4],"Ireland: no snakes"),P([-1.8,52.5],"Britain: adder, grass snake, smooth snake"),P([3,54.6],"Doggerland: dry land then")],
 phPins:[ph([-2.5,51.3],"The adder, Britain’s native viper","Vipera berus.jpg")]});
ins("islands","No snakes in Ireland",{title:"An island only at high tide",view:[-2.45,48.42,-0.95,48.88],globe:[-1.51,48.64,10],card:"left",
 stat:"The bay around Mont-Saint-Michel has tides of up to about 14 m, so the rock is sometimes an island and sometimes a hill in the sand",
 body:"The bay is wide, shallow and shaped like a funnel, which makes the tide rise and fall a lot. At low tide the sea pulls back by kilometres, leaving sand flats. When it returns it moves fast over the flat sand, and walkers caught out on the flats have drowned or been stuck in quicksand.",
 more:"A causeway built in 1879 trapped sand and mud, and the Mont was slowly turning into ordinary land. A dam on the river now flushes the sand away, and in 2014 the causeway was replaced by a bridge on stilts, so at the highest tides the sea can surround it again.",
 pins:[],
 phPins:[ph([-1.511,48.636],"Mont-Saint-Michel","Mont St Michel at sunrise.jpg")]});
ins("islands","An island only at high tide",{title:"The island that buys sand",view:[103.55,1.15,104.15,1.5],globe:[103.85,1.33,9],card:"left",
 stat:"Singapore has imported more sand than any other country, about 517 million tonnes in 20 years, to build new land",
 body:"It is a small island with no hinterland, so the only way to get more land is to make it, by filling in the sea. Its land has grown from about 580 km² in 1960 to about 730 km². The sand came mostly from its neighbours, and Indonesia, Malaysia, Cambodia and Vietnam later limited or banned sand exports, partly because their own islands and riverbanks were being dredged away.",
 more:"Changi Airport, Marina Bay and Jurong Island, made by joining seven small islands, all stand on reclaimed land. To need less sand, Singapore is now also building a Dutch-style polder, land kept dry by a dyke and pumps.",
 pins:[P([103.99,1.36],"Changi, Jurong Island, Marina Bay: all on new land")],
 phPins:[ph([103.859,1.283],"Marina Bay: built on new land","Marina Bay Singapore-3499.jpg")]});
ins("islands","Why Java, not Borneo",{title:"The island where many see no colour",view:[148,-2,172,14],globe:[160.7,6.2,5],card:"left",
 stat:"On Pingelap, about one person in ten to twenty is born completely colour-blind, compared with about one in 30,000 in most places",
 body:"Around 1775 a typhoon and the famine after it left only about 20 survivors on this remote atoll, and one of them carried a rare gene for total colour blindness. With so few ancestors and almost no newcomers, the gene spread through the families that rebuilt the island.",
 more:"Biologists call this a ‘founder effect’, and it is strongest on isolated islands. The neurologist Oliver Sacks wrote about Pingelap in The Island of the Colorblind (1996). People with this condition see best in dim light, and many islanders fish at night.",
 lines:[{circle:[160.7,6.21],km:60,kind:"circle"}],
 pins:[P([160.7,6.21],"Pingelap: about 250 people"),P([158.2,6.9],"Pohnpei, the nearest big island")]});
order("islands",["Islands","The biggest islands","Three kinds of islands","Island born in 1963","An island in a lake on an island","The most islands",
 "No snakes in Ireland","An island only at high tide","The island that buys sand","Why Java, not Borneo","The island where many see no colour",
 "Penguins on the equator","The loneliest island town","Island countries","Tiny island, two nations","The island that wasn’t","Now explore"]);

/* ───────────── Plate tectonics ───────────── */
rep("plates","The Andes","more","Aconcagua, at 6,961 m, is the highest mountain outside Asia. ","");
ins("plates","Japan’s four plates",{title:"The earthquake Japan wrote down",view:[-180,22,-112,58],globe:[-165,44,1.3],card:"left",
 stat:"At about 9 pm on 26 January 1700, a magnitude-9 earthquake struck the coast of what is now Washington and Oregon, and Japan recorded its tsunami",
 body:"Off the Pacific Northwest, the small Juan de Fuca plate dives under North America along the Cascadia fault, which can lock for centuries and then slip all at once. Nobody there wrote things down in 1700, but villages in Japan recorded a tsunami that arrived with no earthquake felt (the dashed line). Scientists matched it to ‘ghost forests’ of dead cedars on the Washington coast, killed when the land dropped and seawater flooded in.",
 more:"Tree rings in the dead trees show they died between the 1699 and 1700 growing seasons, and Native American stories tell of a great shaking and flooding. Cascadia has done this many times before and will again, so the region now builds tsunami towers and warning systems.",
 lines:[{coords:[[-125.5,46],[-140,44.5],[-160,42.5],[-179.9,41]],kind:"dash"},{coords:[[179.9,41],[165,40.2],[150,39.8],[142.2,39.6]],kind:"dash"},
  {coords:[[-125.2,40.4],[-125.4,42.5],[-125.2,44.5],[-125.0,46.5],[-125.6,48.5],[-127.5,50.2]],kind:"red"}],
 pins:[P([-124.1,46.9],"Ghost forests, Washington coast"),P([-126.5,44],"Cascadia fault"),P([141.95,39.64],"Japan: a tsunami with no earthquake, 1700")]});
ins("plates","Los Angeles is coming",{title:"An earthquake in the middle of a plate",view:[-99,31,-80,42],globe:[-89.6,36.6,4],card:"left",
 stat:"In 1811–12 three huge earthquakes struck the Mississippi valley, about 2,000 km from the nearest plate edge",
 body:"Deep under the river lies an old crack in the continent, a failed rift where North America began to split apart hundreds of millions of years ago and then stopped (between the dashed lines). Pressure across the whole plate still squeezes this weak zone, and now and then it gives way.",
 more:"Witnesses said the Mississippi ran backwards for a while, and land sank to form Reelfoot Lake in Tennessee. The old, cold rock in the middle of a plate carries shaking far, so the quakes were felt across much of the eastern United States.",
 lines:[{coords:[[-91.4,34.6],[-89.6,37.4]],kind:"dash"},{coords:[[-89.9,34.2],[-88.2,37.0]],kind:"dash"}],
 pins:[P([-89.59,36.59],"New Madrid, Missouri"),P([-89.41,36.38],"Reelfoot Lake: made in 1811–12"),A([[-90.2,35.5],[-89.2,36.7],[-90.6,35.9]],"Reelfoot Rift, buried deep")]});

/* ───────────── Natural hazards ───────────── */
rm("hazards","Same storm, three names");
set("hazards","What a hurricane needs",s=>{
 s.stat="A hurricane needs sea water of at least 26.5 °C and room to spin, so none ever form on the equator";
 s.body="Warm water is the storm’s fuel. The Earth’s spin makes it turn, and that spin is too weak right at the equator. Strong winds high up can tear a young storm apart. Change the sea temperature and see.";
 s.more="The same storms are called hurricanes in the Atlantic and eastern Pacific, typhoons in the north-west Pacific and cyclones in the Indian Ocean and South Pacific. They turn anticlockwise north of the equator and clockwise south of it."});
rm("hazards","Vesuvius and Pompeii");
ins("hazards","China’s great floods",{title:"The town that ignored the map",view:[-77.6,3.7,-73.3,6.3],globe:[-75.1,4.9,7],card:"left",
 stat:"In 1985 a small eruption of Nevado del Ruiz killed over 23,000 people in the town of Armero, about 50 km away",
 body:"The eruption itself was not large, but it melted part of the volcano’s ice cap. The meltwater mixed with ash and loose rock into lahars, fast rivers of mud that raced down the river valleys (the arrow) and buried the town hours later, at night. A hazard map published weeks before had shown Armero in danger.",
 more:"Warnings were confused and the town was not evacuated. A photograph of a trapped 13-year-old girl, Omayra Sánchez, was seen around the world. It was the second-deadliest eruption of the 20th century, after Mount Pelée in 1902, and it changed how volcano warnings are given.",
 lines:[{coords:[[-75.32,4.89],[-75.2,4.88],[-75.08,4.9],[-74.98,4.94],[-74.9,4.965]],kind:"flow"}],
 pins:[P([-75.32,4.89],"Nevado del Ruiz: the ice cap melted"),P([-74.9,4.965],"Armero, buried in 1985")],
 phPins:[ph([-74.9,4.965],"Armero’s ruins today","Armero ruins.jpg")]});
set("hazards","Tornado Alley",s=>{
 s.body="Over the flat Great Plains, warm Gulf air and cold northern air clash with nothing in between (move along the chart), so the US gets more violent tornadoes than anywhere else. Most deaths come from the strongest few, which can flatten whole streets in minutes.";
 s.more="Some of the fastest winds ever measured, about 480 km/h, were in Oklahoma tornadoes near Moore in 1999 and El Reno in 2013. Radar now lets forecasters warn towns minutes before a tornado arrives, and many Oklahoma homes have storm shelters. The deadliest tornado on record, though, struck crowded villages in Bangladesh in 1989, killing about 1,300 people."});
set("hazards","Fire seasons",s=>{
 s.stat="In 2023 Canada’s wildfires burned more than twice the area of its previous worst year";
 if(typeof s.body==="string")s.body=s.body.replace("About 15 million hectares burned","About 17 million hectares burned")});
ins("hazards","When mountains fall",{title:"The tallest wave ever",view:[-138.5,58.3,-136.6,59.0],globe:[-137.55,58.65,9],card:"left",
 stat:"In 1958 a wave in an Alaskan bay ran 524 m up a mountainside, higher than the Empire State Building",
 body:"An earthquake knocked about 30 million cubic metres of rock into the head of this narrow, steep-sided fjord. With nowhere to spread out, the water surged up the slope opposite, stripping the forest bare up to 524 m, then rushed out to sea (the arrow).",
 more:"Three fishing boats were anchored in the bay. Two sank and two people died, but a father and his seven-year-old son rode the wave on their boat and survived. The pale ‘trimline’ where the forest was torn away could be traced on the slopes for decades.",
 lines:[{coords:[[-137.47,58.66],[-137.53,58.645],[-137.6,58.625],[-137.68,58.61],[-137.78,58.6]],kind:"flow"}],
 pins:[P([-137.46,58.665],"Rockfall, and forest stripped up to 524 m")],
 phPins:[ph([-137.52,58.66],"Lituya Bay in 1958: the pale shores are stripped forest","Lituya Bay overview.jpg")]});

/* ───────────── Mountain ranges ───────────── */
rm("ranges","The longest range is underwater");
rep("ranges","The Andes","more","Because the Earth bulges at the equator, the top of Chimborazo in Ecuador is the point on land farthest from the centre of the Earth, even though Everest is higher above sea level.",
 "The Andes also carry one of the longest borders on Earth, about 5,300 km between Chile and Argentina, set in 1881 mostly along the line where rivers split towards the two oceans.");
rep("ranges","Old mountains: the Appalachians","body","as high as the Alps,","as high as the Alps, perhaps higher,");
ins("ranges","The Himalaya",{title:"A river older than the Himalaya",view:[83.5,25.3,91,30.6],globe:[87.2,27.8,5.5],card:"left",gfThr:{kind:"elev",v:5000},
 stat:"The Arun River starts in Tibet and cuts straight through the Himalaya, because it was there before the mountains",
 body:"As India pushed into Asia, the Himalaya rose slowly, millimetres a year. The Arun kept cutting down about as fast as the land rose beneath it, like a saw held still while the wood is pushed up into it. Now it runs through a gorge thousands of metres deep between some of the world’s highest peaks. The slider lights land over 5,000 m: the river slips through the wall.",
 more:"Geologists call this an ‘antecedent’ river. The Indus, the Sutlej and the Brahmaputra also slice through the range, which is why Himalayan rivers can start on the dry Tibetan side yet reach the sea in Pakistan, India and Bangladesh.",
 lines:[{coords:[[86.0,28.75],[86.6,28.55],[87.0,28.2],[87.2,27.9],[87.25,27.6],[87.2,27.25],[87.15,26.9],[87.0,26.6]],kind:"river"}],
 pins:[P([86.3,28.85],"Starts on the dry Tibetan side"),P([87.09,27.89],"Makalu 8,485 m"),P([88.15,27.7],"Kangchenjunga 8,586 m"),P([87.25,27.45],"The Arun’s gorge")]});
ins("ranges","A river older than the Himalaya",{title:"Three rivers, three seas",view:[86,9,124,34],globe:[100,25,2.6],card:"right",
 stat:"In the Hengduan Mountains three great rivers run side by side, less than 100 km apart, then end in three different seas",
 body:"These ranges run north to south, unlike most of Asia’s, because India’s push crumpled the land at its eastern corner. The Yangtze, the Mekong and the Salween are squeezed into parallel gorges up to 3,000 m deep. Then they split apart, reaching the East China Sea, the South China Sea and the Andaman Sea.",
 more:"The deep, cut-off valleys make this one of the richest places for plants outside the tropics. Plant hunters such as George Forrest brought rhododendrons, primulas and lilies from here to European gardens.",
 lines:[{coords:[[98.6,30.5],[98.7,29],[98.8,28],[98.85,27],[98.9,26],[98.6,25],[98.3,24],[98.4,23],[97.9,21.5],[97.7,19.5],[97.6,17.5],[97.6,16.4]],kind:"river"},
  {coords:[[98.8,30.5],[98.95,29],[99.05,28],[99.2,27],[99.3,26],[99.9,25],[100.3,23],[101.1,21.8],[102.1,20],[104.6,17.3],[105.8,15.1],[105.9,11.6],[106.4,10.3]],kind:"river"},
  {coords:[[99.1,30.5],[99.2,29],[99.4,28],[99.7,27.2],[100.1,26.9],[100.3,27.6],[101.0,28.0],[102.0,26.6],[103.0,26.3],[104.6,28.8],[106.5,29.5],[110.0,30.8],[114.3,30.6],[117.0,30.7],[121.5,31.4]],kind:"river"}],
 pins:[P([98.95,27.6],"Three rivers, under 100 km apart"),P([97.4,16.0],"Salween → Andaman Sea"),P([106.8,9.6],"Mekong → South China Sea"),P([121.8,31.6],"Yangtze → East China Sea")]});
ins("ranges","Old mountains: the Appalachians",{title:"Scotland’s mountains are in America",view:[-95,22,25,72],globe:[-35,50,1.3],card:"right",
 stat:"The Scottish Highlands and the Appalachians are pieces of one old mountain range, torn apart when the Atlantic opened",
 body:"Over 400 million years ago, colliding continents pushed up a long chain of mountains, which later sat in the middle of the supercontinent Pangaea. When Pangaea split, the Atlantic opened down the chain (the dashed lines are its pieces). They now sit in eastern North America, Ireland, Scotland and Norway, with smaller parts in Greenland and north-west Africa.",
 more:"Hikers have followed the same old rocks across the ocean: the International Appalachian Trail now has sections in Greenland, Scotland, Ireland, Scandinavia and Morocco.",
 lines:[{coords:[[-86,33.5],[-81,37],[-77,40.5],[-73,43.5],[-69,45.8],[-65,47.5],[-59,48.6],[-55.5,50.5]],kind:"dash"},
  {coords:[[-9.8,52.3],[-7,54.2],[-5,56.5],[-3.5,58.3],[5.5,61],[9,63.5],[14,67],[18,69.3]],kind:"dash"}],
 pins:[P([-4.5,57],"Scottish Highlands"),P([-80,37.5],"Appalachians"),P([-30,47],"The Atlantic opened down the middle")],
 phPins:[ph([-5.0,56.67],"Glen Coe, in the Highlands","Glen Coe.jpg")]});

/* ───────────── Volcanoes ───────────── */
rm("volcanoes","Krakatoa and Tambora");
set("volcanoes","Pinatubo cools the planet",s=>{if(!/Tambora/.test(s.more||""))s.more=(s.more||"")+" The same thing happened on a larger scale after Tambora in 1815, which brought ‘the year without a summer’ (the Natural hazards tour tells that story)."});
set("volcanoes","Vesuvius and Pompeii",s=>{if(!/red zone/.test(s.more||""))s.more="Vesuvius last erupted in 1944. Around 700,000 people now live in the official ‘red zone’ closest to the crater, and Naples has evacuation plans ready. Just west of the city, the Campi Flegrei is a huge, restless caldera whose ground has been slowly rising again."});
ins("volcanoes","Steep cones: stratovolcanoes",{title:"A volcano born in a cornfield",view:[-104.2,18.4,-100.3,20.6],globe:[-102.25,19.49,7],card:"left",
 stat:"On 20 February 1943 a farmer watched the ground crack open in his cornfield, and within a year a volcano over 300 m tall stood there",
 body:"Dionisio Pulido was ploughing when the ground swelled, hissed and began to throw out ash and rock. The new volcano grew for nine years, to 424 m, and its lava buried two villages. This part of Mexico is a field of over a thousand small cones fed by the ocean plate diving under Mexico, and Paricutín is the newest.",
 more:"The church tower of San Juan Parangaricutiro still sticks out of the black lava. It was the first time scientists could watch a volcano from its birth to its end.",
 pins:[A([[-101.6,19.75],[-101.0,20.0],[-101.4,19.4]],"Over a thousand small cones")],
 phPins:[ph([-102.251,19.493],"Paricutín, born 1943","Paricutin.jpg")]});
ins("volcanoes","Pinatubo cools the planet",{title:"The biggest bang in a century",view:[-180,-60,-95,72],globe:[-160,10,1.15],card:"right",
 stat:"In January 2022 an undersea volcano in Tonga threw its plume about 57 km high, the highest ever measured",
 body:"The eruption happened just under the sea surface, and seawater flashing into steam made it far more explosive. Its pressure wave circled the Earth several times, was heard in Alaska, about 10,000 km away (the outer ring), and set off tsunamis across the Pacific.",
 more:"Unlike Pinatubo, it hardly cooled the planet. It blasted so much water vapour into the stratosphere, about a tenth more than was there before, that it may even have warmed the Earth slightly for a few years.",
 lines:[{circle:[-175.39,-20.55],km:3000,kind:"circle"},{circle:[-175.39,-20.55],km:10000,kind:"circle"}],
 pins:[P([-175.39,-20.55],"Hunga Tonga–Hunga Haʻapai"),P([-149.9,61.2],"Heard in Alaska, ~10,000 km away")],
 phPins:[ph([-175.39,-20.55],"The eruption from space, 15 January 2022","Hunga Tonga eruption 2022.jpg")]});
ins("volcanoes","Mount St Helens",{title:"The prisoner who survived",view:[-62.7,13.9,-60.0,15.4],globe:[-61.1,14.75,8],card:"left",
 stat:"In 1902 a glowing avalanche of hot gas and ash from Mount Pelée killed about 28,000 people in minutes, and one of the few survivors was in a prison cell",
 body:"Pelée’s sticky magma blocked its own vent, then burst out as a cloud of gas and ash hotter than an oven and faster than a car (the arrow). It swept down onto Saint-Pierre, then Martinique’s biggest town, and destroyed it almost at once. The geologist who studied it named these clouds nuées ardentes; today they are called pyroclastic flows, the deadliest thing a volcano does.",
 more:"Ludger Sylbaris survived, badly burned, in a thick-walled cell, and later toured with the Barnum & Bailey circus. It is often said that officials discouraged people from leaving because of an election, though historians debate how much that mattered.",
 lines:[{coords:[[-61.168,14.81],[-61.172,14.79],[-61.176,14.77],[-61.18,14.745]],kind:"flow"}],
 pins:[P([-61.168,14.812],"Mount Pelée")],
 phPins:[ph([-61.18,14.742],"Saint-Pierre under Mount Pelée today","Saint-Pierre (Martinique) avec Montage Pelée.JPG")]});

/* ───────────── Caves ───────────── */
rep("caves","The first art galleries","more","a painting of a pig there is at least 45,500 years old","a scene of people and a pig there, dated in 2024, is at least 51,200 years old");
ins("caves","Ha Long Bay: karst in the sea",{title:"Stalactites underwater",view:[-89.6,16.3,-86.2,18.7],globe:[-87.535,17.316,8],card:"left",gfSea:-120,gfSeaUI:true,
 stat:"About 40 m under the sea in Belize’s Great Blue Hole hang stalactites, which can only grow in air",
 body:"The Blue Hole is a round sinkhole about 300 m across and over 120 m deep. It formed as a dry cave in the ice ages, when the sea was far lower (as the map shows now), and its roof later fell in. As the ice melted the sea rose and flooded it, drowning the stalactites that had grown in the dry cave. Slide the sea back up.",
 more:"Jacques Cousteau made it famous in 1971. Even deeper blue holes have since been found, including Taam Ja’ in Mexico, which goes down more than 420 m.",
 pins:[P([-87.8,17.6],"The reef: dry land in the ice age")],
 phPins:[ph([-87.535,17.316],"The Great Blue Hole","Belize Blue Hole (TMP) (16912331906).jpg")]});
ins("caves","Rivers underground",{title:"Trapped by the monsoon",view:[98.9,19.7,100.9,21.0],globe:[99.87,20.38,9],card:"left",
 stat:"In 2018 twelve boys and their football coach were trapped for 18 days when monsoon rain flooded the cave they were exploring",
 body:"In karst, rain drains straight down into caves, so an early monsoon downpour can fill passages within hours. The team walked into Tham Luang in dry weather; the water rose behind them and trapped them on a ledge about 4 km in. Divers found them after nine days, and they were brought out, sedated, through flooded passages.",
 more:"A former Thai Navy SEAL, Saman Kunan, died taking air tanks into the cave. Engineers pumped out vast amounts of water and diverted streams on the mountain above to keep the level down.",
 pins:[P([99.868,20.382],"Tham Luang: rain on the mountain drains into the cave")],
 phPins:[ph([99.868,20.382],"The entrance to Tham Luang","Tham Luang cave.jpg")]});

/* ───────────── Weather and winds ───────────── */
set("weather","Where air masses collide",s=>{
 s.stat="Over the Great Plains three kinds of air meet, with no mountains in between to keep them apart";
 s.more="Along the ‘dryline’, where moist Gulf air meets dry desert air, storms can explode in an afternoon; forecasters watch it every spring. The Natural hazards tour follows the tornadoes that result."});
ins("weather","Belts of wind",{title:"The Sahara feeds the Amazon",view:[-78,-16,36,30],globe:[-20,8,1.3],card:"left",
 stat:"Every year, winds carry tens of millions of tonnes of Saharan dust across the Atlantic, and some of it fertilises the Amazon",
 body:"The Bodélé Depression in Chad is the dried-up bed of a giant old lake, covered in fine, light lake mud. Strong winds funnelled between two mountain ranges blast it into the air, and the trade winds carry it west (the arrow). Rainforest soils are poor, and the phosphorus in the dust helps replace what the rain washes away.",
 more:"Satellite measurements suggest the dust brings about 22,000 tonnes of phosphorus to the Amazon each year, roughly what the forest loses. The same dust turns Caribbean skies hazy and feeds plankton in the Atlantic.",
 lines:[{coords:[[17.5,17],[8,16.5],[-4,16],[-17,14],[-30,10.5],[-43,6],[-55,0],[-62,-3]],kind:"flow"}],
 pins:[P([17.5,17],"Bodélé Depression: old lakebed dust"),A([[-65,-4],[-58,-2],[-62,-8]],"The Amazon: fed by the dust")],
 phPins:[ph([17.5,17.4],"Dust blowing off the Bodélé, from space","Bodele depression dust.jpg")]});
ins("weather","Where the big storms are born",{title:"The ‘divine wind’",view:[119,24,141,40],globe:[130,32,4],card:"left",
 stat:"Two Mongol invasions of Japan, in 1274 and 1281, were wrecked by storms the Japanese called kamikaze, ‘divine wind’",
 body:"Japan lies in the path of typhoons that curve north out of the warm western Pacific in late summer (the dashed track). The 1281 invasion fleet, one of the largest ever sent across the sea before modern times, was anchored off Kyushu in August, the heart of the typhoon season, when a storm destroyed much of it.",
 more:"Underwater archaeologists at Takashima found that many of the ships were flat-bottomed river boats with weak hulls, rushed into service, so weather and bad shipbuilding together sank the invasion. The 1274 storm is less certain than the 1281 one.",
 lines:[{coords:[[134,17],[130.5,22.5],[128.8,27.5],[129.4,31.5],[130.4,34.5],[133,37.5]],kind:"dash"},{coords:[[129.05,35.1],[129.4,34.6],[129.7,33.9],[130.2,33.62]],kind:"flow"}],
 pins:[P([130.36,33.62],"Hakata Bay"),P([129.75,33.37],"Takashima: wrecks of the 1281 fleet")],
 phPins:[ph([130.3,33.7],"Samurai and Mongols, a scroll of about 1293","Hakata bay Mongol invasion scroll.jpg")]});
ins("weather","Warm winds off the mountains",{title:"The snowiest city on Earth",view:[127,33,147,46.5],globe:[138,40,3.5],card:"left",
 stat:"Aomori, in northern Japan, gets about 8 m of snow a year, more than any other city its size",
 body:"In winter, freezing, dry winds blow out of Siberia across the Sea of Japan (blue arrows). A warm current from the south (red) keeps the sea relatively mild, so the air soaks up moisture as it crosses. When it hits the mountains along Japan’s west side, it is forced up and dumps the water as heavy snow.",
 more:"On the Tateyama Kurobe Alpine Route, ploughs cut a road through snow walls up to about 20 m high each spring. The same ‘lake-effect’ snow buries towns downwind of North America’s Great Lakes.",
 lines:[{coords:[[130.5,45],[134,42],[137.5,40.3],[140,39.2]],kind:"cold"},{coords:[[133,46.5],[136.5,43.6],[139.5,41.8]],kind:"cold"},{coords:[[129.5,34.2],[133,36.3],[136.5,38.2],[139.3,40.6]],kind:"warm"}],
 pins:[P([140.74,40.82],"Aomori: ~8 m of snow a year"),P([137.6,36.58],"Tateyama: snow walls ~20 m")],
 phPins:[ph([137.6,36.58],"Snow walls on the Tateyama Kurobe road","Yuki-no-Otani snow wall.jpg")]});
ins("weather","Drinking the fog",{title:"A cloud 1,000 km long",view:[129,-22.5,149,-9.5],globe:[140,-16,4],card:"left",
 stat:"On spring mornings near Burketown, a single tube-shaped cloud up to 1,000 km long can roll in from the sea",
 body:"Sea breezes blow onto the Cape York Peninsula from both coasts and meet over the middle in the evening (the arrows). The collision sends a wave through the cool, still air over the Gulf of Carpentaria overnight, and the wave lifts the air enough to make a rolling band of cloud: the Morning Glory (the dashed line).",
 more:"Glider pilots come from around the world to ride the rising air at the front of the cloud, as surfers ride a wave. It appears most reliably in September and October.",
 lines:[{coords:[[145.8,-15],[144.4,-15.2],[143.2,-15.4]],kind:"flow"},{coords:[[140.2,-14.5],[141.2,-14.8],[142.3,-15.1]],kind:"flow"},{coords:[[141.2,-12.8],[140.4,-14.6],[139.3,-16.6],[138.6,-18.2]],kind:"dash"}],
 pins:[P([139.55,-17.74],"Burketown"),P([142.6,-14.2],"Cape York Peninsula: the breezes meet")],
 phPins:[ph([139.6,-17.6],"The Morning Glory","Morning Glory cloud.jpg")]});

/* ───────────── Coasts ───────────── */
rm("coasts","Sinking cities, rising seas");
set("coasts","Fjords",s=>{
 s.body="Fjords are valleys carved by glaciers during the ice ages and then flooded by the sea. Inland they can be over 1,000 m deep, far deeper than the sea outside their mouths. The orange line measures Norway straight; drag its ends."});
rep("coasts","Land from the sea","more","About a quarter of the country lies below sea level. ","");
ins("coasts","Islands of sand",{title:"Europe’s walking dune",view:[-1.75,44.35,-0.75,44.85],globe:[-1.21,44.59,10],card:"left",
 stat:"Europe’s tallest sand dune, over 100 m high, is creeping inland by a few metres a year and burying a pine forest",
 body:"Strong westerly winds blow sand off a huge offshore sandbank and up the dune’s gentle seaward slope (the arrow). The sand then slides down the steep landward side, so the whole dune slowly moves towards the forest.",
 more:"German bunkers from the Second World War, built on top of the dune, have tumbled down to the beach as it moved. Roads and a campsite have had to be shifted.",
 lines:[{coords:[[-1.36,44.585],[-1.29,44.588],[-1.22,44.59],[-1.17,44.592]],kind:"flow"}],
 pins:[P([-1.15,44.6],"The pine forest being buried")],
 phPins:[ph([-1.213,44.59],"From the dune: the sandbank that feeds it","Dune du Pilat - Atlantique.jpg")]});
ins("coasts","White cliffs and high cliffs",{title:"The coast that eats villages",view:[-1.75,53.25,0.75,54.35],globe:[-0.05,53.85,8],card:"left",
 stat:"The Holderness coast loses about 2 m of land a year, one of the fastest-eroding coasts in Europe",
 body:"The cliffs here are not rock but boulder clay, soft rubble dumped by ice-age glaciers. North Sea waves wash it away easily, and around 30 villages recorded since the Middle Ages have fallen into the sea. Waves carry the loose material south (the arrow) and build Spurn Point, a thin spit curling across the mouth of the Humber.",
 more:"Further south, Dunwich in Suffolk was once one of England’s busiest ports. Storms and erosion destroyed it, and its churches fell over the cliff one by one.",
 lines:[{coords:[[-0.2,54.08],[-0.08,53.92],[0.03,53.77],[0.1,53.65],[0.12,53.58]],kind:"flow"}],
 pins:[P([0.11,53.585],"Spurn Point: the clay, rebuilt as a spit")],
 phPins:[ph([-0.02,53.82],"Holderness: cliffs of soft clay","Holderness coast erosion.jpg")]});
ins("coasts","The coast that eats villages",{title:"Pebbles that tell you where you are",view:[-3.25,50.38,-2.15,50.82],globe:[-2.6,50.64,9],card:"left",
 stat:"On Chesil Beach the pebbles grow steadily from pea-sized in the west to fist-sized in the east",
 body:"Waves drive the shingle along this 29 km bank (the dashed line), and the biggest waves reach its eastern end, near Portland. They can shift big stones there, while further west only small ones move easily. Over thousands of years, most likely in this way, the pebbles have sorted themselves by size along the beach.",
 more:"Fishermen and smugglers landing in the dark were said to tell where they were by the size of the pebbles underfoot. The bank traps a lagoon, the Fleet, behind it.",
 lines:[{coords:[[-2.76,50.705],[-2.69,50.685],[-2.62,50.655],[-2.55,50.62],[-2.49,50.59],[-2.455,50.57]],kind:"dash"}],
 pins:[P([-2.76,50.708],"West end: pea-sized"),P([-2.445,50.56],"East end, Portland: fist-sized")],
 phPins:[ph([-2.6,50.65],"Chesil Beach and the Fleet","Chesil Beach.jpg")]});

/* ───────────── Deserts ───────────── */
rename("deserts","Lowest, hottest, driest","Death Valley’s heat trap");
set("deserts","Death Valley’s heat trap",s=>{
 s.stat="Death Valley is a deep, narrow basin walled in by mountains, which makes it one of the hottest places on Earth";
 s.body="Wet Pacific air loses its rain on the Sierra Nevada and the ranges after it, so the valley gets almost none: move along the chart. Air that sinks into the deep valley is squeezed and warms; the bare ground heats it further, and the steep walls keep it from escaping. That is why the hottest air temperature on record anywhere was measured here.";
 s.view=[-123.2,34.8,-115.4,38];s.globe=[-119,36.4,5];
 s.pins=[P([-116.85,36.35],"Death Valley, below sea level"),P([-117.56,36.68],"Racetrack Playa"),P([-118.6,37.2],"Sierra Nevada: the rain falls here")];
 s.xsec={title:"From the Pacific into Death Valley",below:true,pts:[[-121.9,36.6,"Pacific"],[-120.5,36.6],[-119.6,36.6,"Central Valley"],[-118.6,36.6,"Sierra Nevada"],[-118.1,36.55,"Owens Valley"],[-117.6,36.45],[-117.15,36.35,"Panamints"],[-116.85,36.35,"Death Valley"],[-116.4,36.4]],
  note:"Range after range stands between the Pacific and Death Valley, each one wringing out more rain. The chart smooths the heights (about 11 km averages): the valley floor really dips below sea level."}});
rep("deserts","The great salt flat","body"," After rain, a thin sheet of water turns it into a giant mirror.","");
set("deserts","The oldest desert",s=>{s.stat="The Namib has been dry for at least 55 million years, and some estimates say 80 million, probably longer than any other desert"});
ins("deserts","The oldest desert",{title:"When the driest desert flowers",view:[-76,-32.5,-66,-23.5],globe:[-71,-28,5],card:"left",
 stat:"In some years the Atacama, the driest non-polar desert on Earth, is covered in pink, purple and yellow flowers",
 body:"In El Niño years, warmer water off the coast lets a little more rain fall on the southern Atacama. Seeds and bulbs that have lain in the ground for years sprout and flower within weeks, before the ground dries out again. Chileans call it the desierto florido, the flowering desert.",
 more:"Over 200 kinds of plants take part, including the pink pata de guanaco (‘guanaco’s paw’). Recent strong blooms came in 2015, 2017 and 2021–22.",
 pins:[P([-70.33,-27.37],"Copiapó"),A([[-71,-28],[-70.6,-27.4],[-71.2,-28.8]],"The flowering desert, in El Niño years"),P([-73.5,-27],"Warmer sea in El Niño years")],
 phPins:[ph([-70.9,-28.1],"The flowering desert","desierto florido Atacama.jpg")]});
ins("deserts","The Empty Quarter",{title:"Hotter than an oven floor",view:[53,26.5,64,34.5],globe:[58.6,30.4,5],card:"left",
 stat:"Satellites have measured the ground in Iran’s Lut Desert at over 70 °C, the hottest land surface on Earth",
 body:"Air temperature records are taken in the shade, but bare ground in the sun gets far hotter. Part of the Lut is covered in dark volcanic pebbles that soak up sunlight, and it lies in a sunken basin with almost no plants, water or cloud to cool it.",
 more:"One dark plateau is called Gandom Beriyan, ‘toasted wheat’, from a story that a load of wheat left there was roasted by the heat. Wind has carved the Lut’s clay into long ridges called kaluts, some as tall as a tall building.",
 pins:[P([57.75,30.6],"Gandom Beriyan: dark stones, the hottest ground"),A([[59.1,30.4],[59.4,31],[58.9,29.9]],"Kaluts: wind-carved ridges")],
 phPins:[ph([59.2,30.4],"The kaluts of the Lut","Lut desert kalut.jpg")]});

/* ───────────── Ice ───────────── */
rep("ice","Ice on the equator","body","Kilimanjaro has lost about 85% of the ice it had in 1912.","Kilimanjaro has lost over 80% of the ice it had in 1912.");
rep("ice","If Greenland melted","more","Melting it all would take many centuries, but the sea has already risen about 20 cm since 1900.","Melting it all would take many centuries.");
set("ice","The last ice age",s=>{
 s.body="So much snow piled up that ice sheets up to 3 km thick spread over most of Canada and northern Europe, as far south as the sites of Chicago and Berlin. The dashed lines show roughly where the ice ended. (The Elevation tour shows the land that the lower ice-age sea uncovered.)";
 s.more="The ice scraped out the hollows of the Great Lakes, piled up hills of rubble such as Long Island, and dropped boulders the size of houses across the plains. Freed of the weight, northern Canada and Scandinavia are still slowly rising, by up to about 1 cm a year around the Gulf of Bothnia.";
 delete s.gfSea;delete s.gfSeaUI;
 if(Array.isArray(s.pins))s.pins=s.pins.filter(p=>!/Doggerland/.test(Array.isArray(p)?p[1]:(p&&p.text)||""))});
ins("ice","The Third Pole",{title:"The glaciers that aren’t shrinking",view:[69,31.5,83,39.5],globe:[76,36,4.5],card:"left",
 stat:"While most mountain glaciers are melting, many in the Karakoram have held steady or even grown",
 body:"Scientists call it the ‘Karakoram anomaly’. The best explanation is that these mountains get much of their snow in winter, from westerly storms, rather than from the summer monsoon, and extra winter snow and cloudier summers keep the ice fed. Its glaciers also ‘surge’, suddenly racing forward after years of quiet.",
 more:"In 1953 the Kutiah Glacier surged about 12 km in roughly three months, the fastest glacier advance on record. Recent studies suggest the anomaly may be weakening.",
 lines:[{coords:[[60,37],[66,36.5],[71,36],[74,35.8]],kind:"flow"}],
 pins:[A([[75.5,36],[77,35.6],[74.5,36.4]],"Karakoram: glaciers holding steady"),P([64,37.4],"Winter storms from the west")],
 phPins:[ph([76.51,35.74],"Concordia: glaciers meet below K2","Concordia (Karakoram).jpg")]});
ins("ice","Ground that never thaws",{title:"Driving on lakes",view:[-121,60.2,-103,67.6],globe:[-111.5,64.3,4],card:"left",
 stat:"Each winter Canada builds a road up to about 600 km long, mostly across frozen lakes, to reach diamond mines, and it lasts only about two months",
 body:"The mines are far beyond any permanent road, so each January crews plough and flood the lake ice, about 85% of the route, until it is thick enough for loaded trucks. Drivers keep to strict speed limits: a heavy truck going too fast pushes a wave through the water under the ice, and the wave can crack the ice ahead of it.",
 more:"Warmer winters are shortening the season, and more supplies now have to be flown in. A TV series made the drivers famous as ‘ice road truckers’.",
 lines:[{coords:[[-113.35,62.55],[-112.6,63.2],[-111.8,63.9],[-110.9,64.5],[-110.4,64.8],[-110.8,65.3],[-110.7,65.7]],kind:"dash"}],
 pins:[P([-114.37,62.45],"Yellowknife"),P([-110.4,64.75],"Diamond mines"),P([-110.7,65.75],"Contwoyto Lake: the road’s end")],
 phPins:[ph([-112.2,63.6],"The winter road across the lakes","Tibbitt Contwoyto winter road.jpg")]});
ins("ice","Valleys the ice dug",{title:"When a volcano melts a glacier",view:[-20.5,63.2,-14.5,65.1],globe:[-17.3,64.2,7],card:"left",
 stat:"In 1996 an eruption under Iceland’s biggest glacier filled a hidden lake of meltwater, which then burst out and swept away part of the main ring road",
 body:"Grímsvötn is a volcano buried under hundreds of metres of ice. When it erupts, or just runs hot, it melts the ice from below, and the water collects in a lake trapped under the glacier. When the water grows deep enough to lift the ice, it bursts out in a flood Icelanders call a jökulhlaup (the arrow).",
 more:"In 1996 the flood briefly carried tens of thousands of cubic metres of water a second and dumped icebergs the size of houses on the plain below. Twisted girders from a destroyed bridge now stand by the road as a monument.",
 lines:[{coords:[[-17.33,64.42],[-17.3,64.28],[-17.25,64.12],[-17.2,63.98],[-17.15,63.85]],kind:"flow"}],
 pins:[P([-17.33,64.42],"Grímsvötn, under the ice"),P([-17.2,63.95],"Skeiðarársandur: the flood plain")],
 phPins:[ph([-17.27,63.98],"The bridge girders left by the 1996 flood","Skeidara bridge girder.jpg")]});
}

/* ======================================================================================================== */
/* tour questions */
function quiz(){if(typeof TOURQ==="undefined")return;const Q=(id)=>TOURQ[id];
 const fix=(id,pred,o)=>{const q=Q(id);if(!q)return;[].concat(q.mid||[],q.recap||[]).forEach(x=>{if(pred(x))Object.assign(x,o)})};
 fix("elev",x=>x.st==="The longest mountain range on land",{st:"Sea level isn’t level",q:"Why does the sea surface dip about 106 m south of India?",o:["Gravity is slightly weaker there","Strong winds push the water away","The sea floor has cracked open","Rivers drain the water away"],a:0,why:"Less mass deep inside the Earth makes gravity a little weaker, so the water drifts away."});
 fix("climate",x=>x.st==="The monsoon and the wettest place",{at:"Monsoon climates",st:"Monsoon climates",q:"Why does the summer monsoon blow in from the sea?",o:["The land heats up faster than the sea","The sea is warmer than the land in summer","Mountains push the air north","The Earth’s tilt reverses the winds"],a:0,why:"Warm air rises over the hot land and moist ocean air is pulled in to replace it."});
 fix("climate",x=>x.st==="The biggest desert is icy",{st:"The coldest winter is a summer",q:"Why are San Francisco’s summers so cool and foggy?",o:["Cold water wells up offshore and the hot valley inland pulls the fog in","It is further north than Sacramento","Snow melts off the Sierra Nevada","Winds blow in from the Arctic"],a:0,why:"Upwelling chills the sea air, and rising hot air in the Central Valley sucks it in through the Golden Gate."});
 fix("lakes",x=>x.st==="Lake of lightning",{st:"The lake that emptied in days",q:"What happened each time the ice dam of Glacial Lake Missoula broke?",o:["The whole lake drained in a few days","The lake froze solid","The lake turned salty","A volcano erupted"],a:0,why:"The floods scoured Washington down to bare rock, again and again."});
 fix("hazards",x=>x.st==="Same storm, three names",{st:"What a hurricane needs"});
 fix("ranges",x=>x.st==="The longest range is underwater",{st:"A river older than the Himalaya",q:"Why does the Arun River cut straight through the Himalaya?",o:["It was there before the mountains rose","It follows a crack made by one earthquake","People dug it as a canal","It flows underground beneath them"],a:0,why:"It kept cutting down as fast as the land rose: an ‘antecedent’ river."});
 fix("coasts",x=>x.st==="Sinking cities, rising seas",{st:"Pebbles that tell you where you are",q:"How do Chesil Beach’s pebbles change along the beach?",o:["They grow from pea-sized in the west to fist-sized in the east","They are all the same size","They shrink towards the east","They change colour from white to black"],a:0,why:"The biggest waves reach the eastern end, where they can move the biggest stones."});
 fix("ice",x=>x.st==="The last ice age"&&/sea/.test(x.q),{q:"Why are northern Canada and Scandinavia still slowly rising?",o:["The weight of the ice sheets is gone","Volcanoes are pushing them up","The sea is falling there","Two plates are colliding under them"],a:0,why:"The land is springing back now that kilometres of ice no longer press it down."});
 const I=Q("islands");if(I&&!I._rvPhys){I._rvPhys=1;
  I.mid=[{at:"An island in a lake on an island",st:"Island born in 1963",q:"How did Surtsey, off Iceland, appear in 1963?",o:["An undersea volcano built it","A glacier left it behind","Coral grew it","People built it"],a:0,why:"An eruption under the sea went on for over three years and built a new island."},
   {at:"An island only at high tide",st:"No snakes in Ireland",q:"Why does Ireland have no native snakes?",o:["Rising seas probably cut it off before snakes arrived","St Patrick drove them out","It is too cold for snakes","Farmers killed them all"],a:0,why:"After the ice age the seas cut Ireland off first, while Britain stayed joined to Europe longer."},
   {at:"Penguins on the equator",st:"Why Java, not Borneo",q:"Why can Java feed far more people than Borneo?",o:["Its volcanoes keep renewing the soil","It is bigger","It gets more rain","It is closer to the equator"],a:0,why:"Fresh volcanic ash keeps Java’s soils fertile; Borneo’s old soils are washed out."}];
  I.recap=[{q:"What is the world’s biggest island, not counting Australia?",o:["Borneo","Madagascar","Great Britain","Greenland"],a:3,why:"Greenland is the biggest island, and Great Britain is only ninth.",st:"The biggest islands"},
   {q:"Why are so many people on Pingelap colour-blind?",o:["A typhoon left about 20 survivors, one carrying a rare gene","The sunlight there damages the eyes","They eat a fish that causes it","It is a recent infection"],a:0,why:"With so few ancestors, the gene spread: a ‘founder effect’.",st:"The island where many see no colour"},
   {q:"How does tiny Kiribati control about 3.4 million km² of ocean?",o:["Each island earns a zone 200 nautical miles out to sea","It bought it","It sits on a sunken continent","Its islands are very large"],a:0,why:"Its 33 islands are spread so widely that their zones add up to more than India’s area.",st:"Island countries"},
   {q:"What did scientists find where Sandy Island was mapped?",o:["A coral reef","Open ocean about 1,400 m deep","A small volcano","A sandbar"],a:1,why:"The island never existed; it was probably a whaling ship’s 1876 mistake.",st:"The island that wasn’t"}]}
}

/* ======================================================================================================== */
/* photos: new Commons files join the shared library; card photos and photo-pin pictures are looked up by file name */
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function merge(){try{if(typeof PS_PHOTO_DATA==="undefined")return;const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_RVPHYS_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(!(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")&&typeof GF_EXTRA_PHOTOS!=="undefined")GF_RVPHYS_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
/* card photos: "tour|title" → library file (also the stops whose old card photo no longer fits) */
const CARD={
 "elev|Where states can’t climb":"Swidden agriculture in Yunnan Province uplands.JPG",
 "climate|The coldest winter is a summer":"Golden Gate Bridge as seen from Marshall’s Beach, March 2018.jpg",
 "rivers|The waterfall that walks backwards":"3Falls Niagara.jpg",
 "lakes|The lake that emptied in days":"Dry Falls.jpg",
 "lakes|A lake made by mistake":"Salton Sea.jpg",
 "lakes|A tsunami on Lake Geneva":"001 Chateau de Chillon and Dents du Midi Photo by Giles Laurent.jpg",
 "seas|When the Mediterranean dried up":"Strait of Gibraltar perspective.jpg",
 "seas|Rivers in the sea":"Staring Down Hurricane Florence.jpg",
 "islands|An island only at high tide":"Mont St Michel at sunrise.jpg",
 "islands|The island that buys sand":"Marina Bay Singapore-3499.jpg",
 "islands|Why Java, not Borneo":"Mount Bromo at sunrise, showing its volcanoes and Mount Semeru (background).jpg",
 "islands|Island countries":"ISS-53 Tarawa, Kiribati.jpg",
 "islands|No snakes in Ireland":"Vipera berus.jpg",
 "hazards|The town that ignored the map":"Armero ruins.jpg",
 "hazards|The tallest wave ever":"Lituya Bay overview.jpg",
 "ranges|Scotland’s mountains are in America":"Glen Coe.jpg",
 "volcanoes|A volcano born in a cornfield":"Paricutin.jpg",
 "volcanoes|The biggest bang in a century":"Hunga Tonga eruption 2022.jpg",
 "volcanoes|The prisoner who survived":"Saint-Pierre (Martinique) avec Montage Pelée.JPG",
 "caves|Stalactites underwater":"Belize Blue Hole (TMP) (16912331906).jpg",
 "caves|Trapped by the monsoon":"Tham Luang cave.jpg",
 "weather|The Sahara feeds the Amazon":"Bodele depression dust.jpg",
 "weather|The ‘divine wind’":"Hakata bay Mongol invasion scroll.jpg",
 "weather|The snowiest city on Earth":"Yuki-no-Otani snow wall.jpg",
 "weather|A cloud 1,000 km long":"Morning Glory cloud.jpg",
 "coasts|Europe’s walking dune":"Dune du Pilat - Atlantique.jpg",
 "coasts|The coast that eats villages":"Holderness coast erosion.jpg",
 "coasts|Pebbles that tell you where you are":"Chesil Beach.jpg",
 "deserts|When the driest desert flowers":"desierto florido Atacama.jpg",
 "deserts|Hotter than an oven floor":"Lut desert kalut.jpg",
 "ice|The glaciers that aren’t shrinking":"Concordia (Karakoram).jpg",
 "ice|Driving on lakes":"Tibbitt Contwoyto winter road.jpg",
 "ice|When a volcano melts a glacier":"Skeidara bridge girder.jpg"};
/* stops whose old card photo showed a story they no longer tell */
const CARD_FORCE={"seas|Rivers in the sea":1,"islands|Island countries":1,"islands|Why Java, not Borneo":1};
const TOURS=["elev","climate","rivers","lakes","seas","islands","plates","hazards","ranges","volcanoes","caves","weather","coasts","deserts","ice"];
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};const L=s.phPins;if(!Array.isArray(L))return;
 /* drop a new photo pin whose picture is not in the library (so it never shows an empty frame) */
 const bad=L.filter(q=>q&&q._f&&libIdx(q._f)<0);if(bad.length){const keep=L.filter(q=>!bad.includes(q));lock(s,"phPins",keep);def(s,"_sqPruned",-1)}
 (s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 for(const k in CARD){const i=libIdx(CARD[k]);if(i<0)continue;if(PS_PHOTO[k]==null||CARD_FORCE[k])PS_PHOTO[k]=i}
 TOURS.forEach(id=>{const t=TT(id);if(t)t.steps.forEach(reg)})}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&TOURS.includes(ps.tour)){const S0=psSteps()[i];if(S0)reg(S0)}}catch(e){}return _g.apply(this,arguments)}}

function run(){try{patch()}catch(e){console.error("review-phys",e)}try{quiz()}catch(e){console.error(e)}photos()}
run();addEventListener("load",()=>setTimeout(run,1500));[1500,5000,12000].forEach(t=>setTimeout(run,t));
})();
