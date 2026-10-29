/* GeoFlock: polish for the continent tours defined in index.html — Europe, Asia, Africa, North America, South America,
   Oceania and Antarctica (the "Regions" shelf). Adds interactive gadgets (height cross-sections, rulers, true-size ghosts,
   day and night, plate boundaries, ocean currents), card photos for stops that had none, more photo pins on the opening
   stops, and reframes stops whose subject sat under the card. It only patches PS_TOURS at load (like geoflock-polish-a.js);
   load it after the tour files. Every patch is keyed by stop title, so a stop that has been renamed or removed is skipped. */
(function(){
const OPEN={europe:"Europe",asia:"Asia",africa:"Africa",namerica:"North America",samerica:"South America",oceania:"Oceania",antarctica:"Antarctica"};
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(s)}catch(e){console.error(e)}};
const ph=(at,label)=>({at,label,col:"#d9682b",icon:"photo"});
const addPh=(s,list)=>{s.phPins=s.phPins||[];list.forEach(p=>{if(!s.phPins.some(q=>q.label===p.label))s.phPins.push(p)})};

/* card photos ("tour|title" → library file name) and photo-pin photos (pin label → file name) */
const CARD={
 "europe|Now explore":"Bay of Kotor from Lepetani's road.jpg",
 "asia|Now explore":"Bagan, Myanmar, Htilominlo Temple and other Buddhist stupas in Bagan plain.jpg",
 "africa|The roundest and the squarest":"Beach in Freetown, Sierra Leone (14176784751).jpg",
 "africa|Now explore":"Okavango Delta, Botswana3.jpg",
 "namerica|Now explore":"Valley View Yosemite August 2013 002.jpg",
 "samerica|Now explore":"A view towards Torres Del Paine.jpg",
 "oceania|Now explore":"Bora Bora (16542797633).jpg",
 "antarctica|Now explore":"Coastal mountains - Antarctic Peninsula.jpg"};
const PIN={"Pine Island Glacier":"Pine Island Glacier, Antarctica (ASTER).jpg","Emperor penguins":"EmperorPenguinColonyClose.jpg"};

function findIdx(f){try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined")return;for(const k in CARD){const i=findIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};for(const l in PIN){const i=findIdx(PIN[l]);if(i>=0)PS_SQ_IMG[l]=i}}catch(e){console.error(e)}}

function patch(){
/* ───────── Europe ───────── */
if(T("europe")&&!T("europe").steps._polE){T("europe").steps._polE=1;
 set("europe","Europe’s highest mountain",s=>{
  s.xsec={title:"Across the Caucasus, over Elbrus",pts:[[41.97,45.04,"Stavropol"],[42.2,44.2],[42.44,43.35,"Elbrus"],[42.6,42.8],[42.7,42.27,"Kutaisi"]],
   note:"Heights are smoothed, so the peak looks lower than it is: Elbrus’s real summit is 5,642 m, Mont Blanc’s 4,806 m."};
  s.body="Elbrus, 5,642 m, stands in the Caucasus (red): move along the chart to cross the range. Mont Blanc, 4,806 m, is the highest peak in the Alps (green), which arc through eight countries, from France to Slovenia."});
 set("europe","Russia, cut off from Russia",s=>{s.gfRuler={a:[22.79,54.36],b:[23.51,53.95]};
  s.body="You can’t get from Kaliningrad to the rest of Russia by land without crossing another country. The ruler spans the Suwałki Gap: about 65 km of Polish–Lithuanian border between Kaliningrad and Belarus, Russia’s ally.";
  s.more="It was the German city of Königsberg until 1945. After the Second World War the Soviet Union took the city and renamed it; its German population fled or was expelled. When Lithuania became independent in 1991, Kaliningrad was cut off. It is home to Russia’s Baltic Fleet, and trains to it from Russia cross Lithuania with special transit papers."});
 /* the Bosphorus sat at the card's edge: widen the frame westward so Istanbul is in the open part of the map */
 set("europe","A city on two continents",s=>{s.view=[13,36.6,37,45.4]});
 /* one recap question pointed at a stop ("Ideas that changed the world") that the tour no longer has */
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.europe;if(Q)(Q.recap||[]).forEach((q,i)=>{if(q.st==="Ideas that changed the world")Q.recap[i]={q:"What does Europe’s “olive line” roughly mark?",
  o:["The border of the EU","Where the Mediterranean climate ends","The crest of the Alps","The edge of the Roman Empire"],a:1,why:"Olive trees need long, dry summers and die in hard frosts, so they grow only where the climate is Mediterranean.",st:"The olive line"}})}catch(e){}
 set("europe","Greenland icy, Iceland green",s=>{s.on=["currents"];
  s.body="About 80% of Greenland lies under an ice sheet. Iceland is warmed by the North Atlantic Current (on the map), so it has green coasts, and only about a tenth of it is glacier; a cold current runs down Greenland’s east coast instead."});
}
/* ───────── Asia ───────── */
if(T("asia")&&!T("asia").steps._polE){T("asia").steps._polE=1;
 set("asia","The roof of the world",s=>{
  s.xsec={title:"From India’s plains over Everest and across Tibet",pts:[[85.1,25.6,"Patna"],[86.0,27.0],[86.93,27.99,"Everest"],[87.6,29.3],[88.6,31.0,"Tibet"],[88.0,33.5],[87.2,35.6,"Kunlun"],[86.2,38.0,"Taklamakan"]],mark:4500,
   note:"The dashed line marks 4,500 m, the Tibetan Plateau’s average height. Heights are smoothed: Everest’s real summit is 8,849 m."};
  s.body="The Himalaya, the Karakoram and their neighbours hold all of them, including all 14 peaks over 8,000 m. Move along the chart: from India’s plains the land leaps up over Everest and stays above 4,500 m across Tibet, then drops to the Taklamakan desert."});
 set("asia","Siberia",s=>{s.gfRuler={a:[60.6,56.84],b:[131.89,43.12]};s.view=[-30,5,180,85];s.globe=[84,52,0.95];
  s.body="It is Russia east of the Urals: forest, bog and frozen tundra, with Lake Baikal, the deepest lake on Earth. The ruler crosses it from Yekaterinburg, in the Urals, to Vladivostok on the Pacific: about 5,100 km in a straight line.";
  s.more="Siberia is bigger than any country on Earth except Russia itself, and its taiga is the largest forest on Earth. In Oymyakon it has been −67.7 °C, and under much of Siberia the ground stays frozen all year. The Trans-Siberian Railway winds about 9,300 km from Moscow to Vladivostok and takes about a week. Its great rivers, the Ob, Yenisei and Lena, flow north to the Arctic."});
 set("asia","The Ring of Fire",s=>{s.on=["plates"];s.view=[62,-15,172,60];s.globe=[112,18,1.1];
  s.body="Around the edge of the Pacific, ocean plates dive under the continents (the plate edges are drawn on the map). This causes most of the world’s earthquakes and about three-quarters of its active volcanoes."});
 set("asia","Two Koreas",s=>{s.gfRuler={a:[126.98,37.57],b:[126.68,37.96]};
  s.body="After the Second World War, Korea was divided near the 38th parallel between Soviet and American control. The Korean War (1950–53) ended in a ceasefire, not a peace treaty. The ruler shows how close Seoul is to the border: about 50 km.";
  s.more="Today South Korea is one of the world’s richest, most connected countries, and North Korea one of the poorest and most closed: satellite photos at night show the South lit up and the North almost dark. The Demilitarized Zone between them, about 4 km wide and 250 km long, has hardly been entered since 1953, and has become an accidental nature reserve for cranes, bears and leopard cats. Seoul and its region are home to about half of South Koreans."});
}
/* ───────── Africa ───────── */
if(T("africa")&&!T("africa").steps._polE){T("africa").steps._polE=1;
 set("africa","The Sahara is mostly rock",s=>{delete s.drag;s.gfRuler={a:[-14.5,26.1],b:[34.2,26.1]};s.view=[-58,8,38,40];s.globe=[-3,23,1.9];
  s.body="It is the largest hot desert on Earth, about 9 million km². The ruler spans it from the Atlantic to the Red Sea: about 4,800 km. Sand seas cover only about a quarter of it; the rest is rock, gravel and mountains."});
 set("africa","The roof of Africa",s=>{s.view=[21,-12,45,6];
  s.xsec={title:"From Lake Victoria over Kilimanjaro to the sea",pts:[[33.8,-2.0,"Lake Victoria"],[35.0,-2.4],[36.0,-2.6,"Rift Valley"],[36.7,-2.85],[37.36,-3.07,"Kilimanjaro"],[38.5,-3.6],[39.66,-4.05,"Mombasa"]],
   note:"Heights are smoothed: Kilimanjaro’s real summit is 5,895 m."};
  s.body="At 5,895 m, it rises straight out of the plains of Tanzania with no range around it. Move along the chart: west of it the land dips into the Great Rift Valley, where Africa is slowly splitting apart."});
 /* Sierra Leone sat under the card's edge */
 set("africa","The roundest and the squarest",s=>{s.view=[-30,0,40,35];s.globe=[-2,16,1.45]});
 set("africa","The real southern tip",s=>{s.gfRuler={a:[18.47,-34.36],b:[20.0,-34.83]};s.view=[8,-38.65,28,-29.85];s.globe=[16,-33.8,5.2];
  s.body="Cape Agulhas, about 150 km to the southeast (measured by the ruler), is the true southern tip, and officially where the Atlantic and Indian Oceans meet."});
}
/* ───────── North America ───────── */
if(T("namerica")&&!T("namerica").steps._polE){T("namerica").steps._polE=1;
 set("namerica","North America",s=>addPh(s,[ph([-151,63.07],"Denali 6,190 m"),ph([-110.83,44.46],"Old Faithful"),ph([-26.5,70.9],"Greenland: An iceberg in Føhn Fjord, East Greenland")]));
 set("namerica","The longest border",s=>{s.gfRuler={a:[-95.15,49],b:[-123.03,49]};s.view=[-160,38,-75,72];s.globe=[-113,51,1.6];
  s.body="It includes the border with Alaska. Across the prairies it follows a straight line, the 49th parallel, agreed in 1818 and 1846: the ruler measures that stretch, about 2,000 km."});
 set("namerica","Mountains and rivers",s=>{
  s.xsec={title:"From San Francisco over the Rockies to Kansas",pts:[[-122.4,37.78,"San Francisco"],[-120.5,37.9],[-119.4,37.85],[-116.5,39.0],[-111.9,40.76,"Salt Lake City"],[-108.5,40.0],[-106.1,39.6],[-104.99,39.74,"Denver"],[-101,39.0],[-97.5,38.5,"Kansas"]],mark:1609,
   note:"The dashed line marks one mile, 1,609 m: Denver’s height. Heights are smoothed."};
  s.body="Move along the chart from San Francisco: up the Sierra Nevada, across high desert basins, over the Rockies and gently down the Great Plains. The Mississippi and Missouri drain the middle, about 40% of the lower 48 states.";
  s.more="North America’s highest peak is Denali in Alaska, 6,190 m. The western mountains rose as the Pacific plates pushed against the continent, and they are still earthquake country. The low, old Appalachians run down the east. The Great Plains are some of the flattest farmland on Earth: Kansas really is, measurably, flatter than a pancake."});
 set("namerica","The dinosaur-killer crater",s=>{s.gfRuler={a:[-90.37,21.3],b:[-88.63,21.3]};
  s.body="About 66 million years ago a rock about 10 km across struck the Yucatán Peninsula. It left the Chicxulub crater, about 180 km wide (the ruler spans it), now buried under the ground and sea."});
 set("namerica","Smaller than Texas",s=>{const E=st("europe","The biggest countries");const poly=E&&E.drag&&E.drag.poly;
  if(poly){s.ghosts=[{poly,at:[-86.2,13.6],rot:-20,col:"#e0592a",label:"Texas, true size"}];
   s.body="Guatemala, Belize, Honduras, El Salvador, Nicaragua, Costa Rica and Panama cover about 520,000 km². Texas alone is about 695,000 km²: drag its outline over them to compare."}});
}
/* ───────── South America ───────── */
if(T("samerica")&&!T("samerica").steps._polE){T("samerica").steps._polE=1;
 set("samerica","South America",s=>addPh(s,[ph([-62.54,5.97],"Angel Falls, 979 m"),ph([-67.5,-20.2],"Salar de Uyuni"),ph([-60.02,-3.1],"Manaus​"),
  ph([-71.97,-13.53],"Cusco: the Inca capital"),ph([-73.05,-50.5],"Argentina: Perito Moreno Glacier")]));
 set("samerica","The Andes",s=>{
  s.xsec={title:"From the Pacific over Aconcagua to the pampas",pts:[[-71.62,-33.05,"Valparaíso"],[-70.8,-32.85],[-70.01,-32.65,"Aconcagua"],[-69.3,-32.8],[-68.84,-32.89,"Mendoza"],[-67.5,-33.1],[-66.34,-33.3,"San Luis"]],mark:4000,
   note:"The dashed line marks 4,000 m. Heights are smoothed: Aconcagua’s real summit is 6,961 m."};
  s.body="They run the whole length of the continent through seven countries. Move along the chart from the Pacific over Aconcagua, 6,961 m, the highest mountain anywhere outside Asia, and down to the flat pampas of Argentina."});
 set("samerica","The Amazon",s=>{
  s.xsec={title:"Down the Amazon from Iquitos to the Atlantic",pts:[[-73.25,-3.75,"Iquitos"],[-70.0,-4.2,"Leticia"],[-65.5,-3.3],[-60.02,-3.1,"Manaus"],[-54.7,-2.45,"Santarém"],[-51.5,-1.5],[-50.0,-0.3,"Mouth"]],
   note:"The line follows the river only roughly, and shows the land beside it. Heights are smoothed."};
  s.body="The forest covers about 5.5 million km² across nine countries, and the river carries about a fifth of all the river water that reaches the sea. Move along the chart: the land is so flat that Iquitos, in Peru, over 3,000 km upstream, is only about 100 m above sea level."});
 set("samerica","The far south",s=>{s.gfRuler={a:[-67.27,-55.98],b:[-61.0,-62.6]};s.view=[-88,-64,-48,-38];s.globe=[-64,-57.5,2.5];
  s.body="Its tip, Cape Horn, is at 56°S. The ruler measures across the stormy Drake Passage to Antarctica’s South Shetland Islands: about 800 km. Patagonia, shared by Argentina and Chile, is a land of steppe, glaciers and wind."});
}
/* ───────── Oceania ───────── */
if(T("oceania")&&!T("oceania").steps._polE){T("oceania").steps._polE=1;
 set("oceania","The Great Barrier Reef",s=>{/* the engine’s stop fixes draw Italy over the reef at tour start; the text now says so */
  s.body="It runs for about 2,300 km along Australia’s northeast coast, made of nearly 3,000 separate reefs built by tiny coral animals. Its marine park covers about 344,000 km², more than Italy: drag Italy’s outline to compare."});
 set("oceania","The Southern Alps",s=>{
  s.xsec={title:"Across the South Island at Aoraki / Mount Cook",pts:[[169.82,-43.42,"Sea"],[170.14,-43.6,"Aoraki"],[170.2,-44.0,"Lake Pukaki"],[170.7,-44.3],[171.25,-44.4,"Timaru"]],
   note:"Heights are smoothed: Aoraki’s real summit is 3,724 m."};
  s.body="The Southern Alps rise along the Alpine Fault (red), where the Pacific and Australian plates grind sideways and push together. Move along the chart: the land shoots up from the Tasman Sea to Aoraki in about 30 km, then slopes gently east.";
  s.more="Matching rocks on the two sides of the fault now lie about 480 km apart. Seventeen peaks top 3,000 m; the highest is Aoraki / Mount Cook, 3,724 m. The mountains are still being pushed up about as fast as rain and ice wear them down. Wet westerly winds hit them head on: near the main ridge up to 15,000 mm of rain can fall in a year, while 30 km east it is about 1,000 mm. The fault last broke in about 1717, in a magnitude 8 quake; a 2021 study put the chance of the next one within 50 years at about 75%."});
 set("oceania","Big ocean states",s=>{s.ghosts=[{code:"in",at:[-148,-10],col:"#c62828",label:"India, true size"}];
  s.body="Kiribati’s 33 islands add up to 811 km² of land. But each island claims the sea for 200 nautical miles (370 km) around it, so Kiribati controls about 3.4 million km² of ocean (blue), a little more than India’s land: drag India to compare."});
}
/* ───────── Antarctica (globe) ───────── */
if(T("antarctica")&&!T("antarctica").steps._polE){T("antarctica").steps._polE=1;
 set("antarctica","Antarctica",s=>addPh(s,[ph([166.67,-77.85],"McMurdo: the biggest station"),ph([0,-89.99],"South Pole: new marker each year"),ph([-60.6,-62.95],"Deception Island"),
  ph([-26.2,-75.6],"Halley station"),ph([106.84,-78.46],"Vostok station"),ph([-100,-75.2],"Pine Island Glacier")]));
 set("antarctica","Coldest, driest, windiest, highest",s=>{
  s.xsec={title:"From the coast at Mirny to the South Pole",pts:[[93.0,-66.55,"Mirny"],[100,-72.5],[106.84,-78.46,"Vostok"],[106.84,-84.5],[106.84,-89.9,"South Pole"]],mark:2500,
   note:"The dashed line marks 2,500 m, the continent’s average height. Almost all of this height is ice."};
  s.body="The coldest air ever measured, −89.2 °C, was at Vostok station in 1983. Move along the chart from the coast: the ice climbs to over 3,000 m, and the high, thin air is part of why it is so cold.";
  s.more="Inland it gets so little snow that it counts as the largest desert on Earth. Its average height, about 2,500 m, is more than any other continent’s, because of the thick ice. At Commonwealth Bay the wind averages about 80 km/h through the year. Satellites have measured snow surfaces near −98 °C on the high plateau."});
 set("antarctica","The moving South Pole",s=>{s.gfSun={utc:12,day:355};
  s.body="The ice sheet slides about 10 m a year, so a new marker is put at the true pole each New Year’s Day. The map shows the Sun in late December: all of Antarctica is in daylight. Move the date to June to see the long polar night.";
  s.more="At the pole, the sun rises once and sets once a year: six months of daylight, then six months of night. The station there keeps New Zealand time, because its flights come from Christchurch. Roald Amundsen’s Norwegian team reached the pole first, in December 1911, a month ahead of Robert Falcon Scott, whose team died on the way back."});
}
}
function run(){patch();photos()}
/* some tours have their steps array rebuilt late (e.g. index.html's mod_O block), so the guard sits on the steps array and the patch re-runs a few times after load */
run();addEventListener("load",()=>{[1500,4000,8000,12000,20000].forEach(t=>setTimeout(run,t))});[4000,8000,12000,20000].forEach(t=>setTimeout(run,t));
})();
