/* GeoFlock: polish for the older history tours defined in index.html — Ancient civilisations (hancient), Explorers
   (explorers) and the seven history-by-continent tours (heurope, hasia, hafrica, hnamerica, hsamerica, hoceania,
   hantarctica). Adds interactive gadgets (rulers on the great journeys, true-size ghosts, cross-sections over the Andes,
   the Rockies and the Rift Valley, polar night, ocean currents and shipping lanes), a Machu Picchu stop, photo pins on
   the opening stops, card photos for the stops that had none, and points stops on the rebuilt History map
   (geoflock-history2.js) at the polity the text is about ("year/group", or "year/n:Name" for a polity without a group).
   It only patches PS_TOURS at load, like geoflock-polish-a.js; load it after the tour files. Every patch is keyed by stop
   title, so a stop that has been renamed or removed is simply skipped. */
(function(){
const OPEN={hancient:"Ancient civilisations",explorers:"The great journeys",heurope:"Europe’s story",hasia:"Asia’s story",
 hafrica:"Africa’s history",hnamerica:"North America’s history",hsamerica:"South America’s history",hoceania:"Oceania’s story",
 hantarctica:"Antarctica’s story"};
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(s)}catch(e){console.error(e)}};
/* insert a new stop after the stop titled `after` (once) */
const ins=(id,after,S)=>{const t=T(id);if(!t||t.steps.some(s=>s.title===S.title))return;const i=t.steps.findIndex(s=>s.title===after);if(i<0)return;t.steps.splice(i+1,0,S)};
const ph=(at,label)=>({at,label,col:"#d9682b",icon:"photo"});
/* history-map year and highlighted polity; a stop that replays years (histAnim) keeps its replay and ends on this focus */
/* applied on every run, because index.html re-applies its own year table shortly after the page loads */
const SUBS=[
 ["hasia","An alphabet invented by a king","1453/n:Joseon"],
 ["hasia","The Mughals","1700/mughal"],
 ["hafrica","Kush against Rome","bc1/n:Meroe"],
 ["hafrica","Great Zimbabwe","1400/n:Great Zimbabwe"],
 ["hafrica","The Swahili coast","1500/n:Islamic city-states"],
 ["hafrica","The Benin Bronzes","1500/n:Benin"],
 ["hafrica","The Zulu kingdom","1880/n:Zululand"],
 ["hafrica","Rwanda, 1994","1995/n:Rwanda"],
 ["hnamerica","1492","1492/n:Taino"],
 ["hnamerica","Thirteen colonies","1715"],
 ["hsamerica","Caral","bc3000/n:Norte Chico"],
 ["hsamerica","The Paraguayan War","1880/n:Paraguay"],
 ["hsamerica","Bolivia loses the sea","1850/n:Bolivia"],
 ["hsamerica","The Falklands War","1980"],
 ["hoceania","Captain Cook","1783"],
 ["hoceania","Women vote first","1895"],
 ["hoceania","War in the Pacific","1945/jpn"],
 ["hoceania","Voyagers of the open Pacific","1300"],
 ["hoceania","Easter Island’s giants","1400/n:Polynesians"]];
function subs(){SUBS.forEach(([id,title,v])=>set(id,title,s=>{if(s.sub!==v){s.sub=v;delete s.histLink;delete s._histWide}}))}

/* card photos ("tour|title" → library file name) and photo-pin photos (pin label → file name) */
const CARD={
 "hancient|Now explore":"Great Pyramid of Giza.jpg",
 "explorers|Lewis and Clark":"Rockies in the morning.jpg",
 "explorers|Now explore":"Blue Marble Western Hemisphere.jpg",
 "heurope|Now explore":"Eiffel Tower and Pont Alexandre III at night.jpg",
 "hasia|Now explore":"Sunset of the Forbidden City 2006.JPG",
 "hafrica|Now explore":"Fuerte Viejo, Stone Town, Zanzíbar, Tanzania, 2024-05-31, DD 32.jpg",
 "hnamerica|Now explore":"Pyramid of the Sun, Teotihuacan, from path to parking lot.jpg",
 "hsamerica|Machu Picchu":"80 - Machu Picchu - Juin 2009 - edit.jpg",
 "hsamerica|Now explore":"Sacsayhuamán, Cusco, Perú, 2015-07-31, DD 05.JPG",
 "hoceania|Now explore":"Rock-Islands-Palau-1-2016-sea-view-Luka-Peternel.jpg",
 "hantarctica|Now explore":"Penguin in Antarctica jumping out of the water.jpg"};
const PIN={
 "Göbekli Tepe: before farming":"Göbekli Tepe, Urfa.jpg","Giza: the Great Pyramid":"Great Sphinx of Giza (أبو الهول).jpg",
 "Mohenjo-daro: a planned city":"Mohenjo-daro.jpg","Xi’an: the terracotta army":"51714-Terracota-Army.jpg",
 "Rome: the Colosseum":"Colosseum in Rome-April 2007-1- copie 2B.jpg","Chichén Itzá: Maya city":"Chichen Itza 3.jpg",
 "Aksum: giant stelae":"Stelae in Main Stelae Field - Axum (Aksum) - Ethiopia - 02 (8702223458).jpg",
 "Athens: the Parthenon":"Attica 06-13 Athens 35 Parthenon.jpg","Pont du Gard: Roman aqueduct":"Pont du Gard BLS.jpg",
 "Florence: Renaissance dome":"Florence Cathedral seen from Piazzale Michelangelo night dllu.jpg","Oslo: a Viking ship":"Osebergskipet 2016.jpg",
 "Manchester: cotton mills":"Rock Hill - Manchester Cotton Mill.jpg","Berlin: Brandenburg Gate":"Brandenburger Tor nachts.jpg",
 "Ur: a ziggurat":"Ancient ziggurat at Ali Air Base Iraq 2005.jpg","Sanchi: a Buddhist stupa":"Stupa 1, Sanchi 02.jpg",
 "Delhi: the Red Fort":"Red Fort in Delhi 03-2016 img3.jpg","Angkor Wat at sunrise":"Angkor Wat Sunrise (209237385).jpeg",
 "Xi’an: clay soldiers":"Terracotta Warriors (2661111239).jpg","Shanghai today":"Pudong Shanghai November 2017 panorama.jpg",
 "Meroë: Kush’s pyramids":"Sudan Meroe Pyramids 30sep2005 2.jpg","Timbuktu: mud-brick mosque":"Djinguereber Mosque, Timbuktu.jpg",
 "Great Zimbabwe: stone walls":"ASC Leiden - Rietveld Collection - East Africa 1975 - 05 - 033 - A wall of the ruins of Great Zimbabwe - Masvingo, Zimbabwe.jpg",
 "Zanzibar: a dhow":"Dhow Zanzibar-7.jpg","Abu Simbel: Ramesses II":"Templo de Ramsés II, Abu Simbel, Egipto, 2022-04-02, DD 03.jpg",
 "Olduvai Gorge: early tools":"Viewing platform at Olduvai Gorge Museum.jpg",
 "Mesa Verde: cliff houses":"Mesa-Verde---Cliff-Palace-in 1891 - edit1.jpg","Cahokia: Monks Mound":"Monks Mound in July.JPG",
 "Tenochtitlan: the Aztec capital":"Model of Tenochtitlan-2.jpg","St Augustine: Spanish fort":"San Pablo Bastion, Castillo de San Marcos.jpg",
 "Gettysburg, 1863":"Gettysburg Battlefield, Pennsylvania, US (09).jpg","Washington: the Capitol":"US Capitol west side.JPG",
 "Caral: 5,000-year-old city":"Huaca Caral 10.jpg","Nazca: desert drawings":"Líneas de Nazca, Nazca, Perú, 2015-07-29, DD 52.JPG",
 "Machu Picchu: Inca city":"Machu Picchu, Perú, 2015-07-30, DD 47.JPG","Potosí: the silver mountain":"Cerro ricco.jpg",
 "Brasília: a new capital":"Brazilian National Congress.jpg","Monte Verde: 14,500 years ago":"Monte Verde 3.JPG",
 "Kakadu: rock art":"Kakadu (AU), Kakadu National Park, Ubirr Rock Art -- 2019 -- 4169.jpg","Sydney Cove, 1792":"View of Sydney Cove 1792.jpg",
 "Waitangi: the Treaty House":"00 27 0577 Waitangi, New Zealand - Treaty House.jpg","Bikini Atoll":"Bikini Atoll, Marshall Islands (35055478541).jpg",
 "Gallipoli: Anzac Cove":"View of Anzac Cove - Gallipoli Peninsula - Dardanelles - Turkey - 01 (5734713946).jpg",
 "Endurance, 1915":"Endurance trapped in pack ice.jpg","Grytviken: old whaling station":"Grytviken Harbour, Island of South Georgia, United Kingdom.jpg",
 "McMurdo: the biggest base":"McMurdo Station From The Foot Of Observation Hill.jpg","Halley: the ozone hole station":"Halley VI Antarctic Research Station - Science modules.jpg",
 "Cape Denison: Mawson’s hut":"Mawsons Hut at Cape Denison.jpg","Cape Crozier: emperor penguins":"Halley Emperor Penguin Colony in 1999.jpg",
 "Deception Island: cruise ships":".0 1439 volcanic island Deception Island (Antarctica) - cruise ship of the Hurtigruten.jpg"};

function findIdx(f){try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined")return;for(const k in CARD){const i=findIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};for(const l in PIN){const i=findIdx(PIN[l]);if(i>=0)PS_SQ_IMG[l]=i}}catch(e){console.error(e)}}

function patch(){
/* ───────── Ancient civilisations ───────── */
if(T("hancient")&&!T("hancient")._polD){T("hancient")._polD=1;
 set("hancient","Ancient civilisations",s=>{s.phPins=[ph([38.92,37.22],"Göbekli Tepe: before farming"),ph([31.13,29.98],"Giza: the Great Pyramid"),ph([68.14,27.33],"Mohenjo-daro: a planned city"),
  ph([109.27,34.38],"Xi’an: the terracotta army"),ph([12.49,41.89],"Rome: the Colosseum"),ph([-88.57,20.68],"Chichén Itzá: Maya city"),ph([38.72,14.13],"Aksum: giant stelae")]});
 set("hancient","The Phoenicians",s=>{s.gfRuler={a:[35.2,33.27],b:[-6.29,36.53]};
  s.body="From cities like Tyre and Byblos in what is now Lebanon, Phoenician traders sailed the whole Mediterranean, founding ports like Carthage and Cádiz. The ruler measures Tyre to Cádiz: about 3,800 km, in ships powered by oars and a single sail."});
 set("hancient","The Persian Empire",s=>{s.gfRuler={a:[28.04,38.49],b:[48.25,32.19]};
  s.body="Cyrus the Great founded it in about 550 BC, and under Darius it covered about 5.5 million km². The ruler spans its Royal Road, from Sardis to Susa: about 2,000 km straight, 2,700 km along the road, which royal riders covered in about a week."});
/* frame the subject in the right part of the map, clear of the card */
 set("hancient","The Indus Valley",s=>{s.view=[46,17,84,37]});
 set("hancient","China’s Yellow River",s=>{s.view=[92,24,128,46]});
 set("hancient","Kush and Aksum",s=>{s.view=[12,4,48,27]});
 set("hancient","Sailors of two oceans",s=>{s.gfRuler={a:[113.9,0],b:[46.9,-19]};
  s.body="Starting from Taiwan about 5,000 years ago, Austronesian sailors in outrigger canoes spread through the Philippines and Indonesia, then east across the Pacific and west across the Indian Ocean. The ruler measures Borneo to Madagascar: about 7,600 km of open ocean."});
}
/* ───────── Explorers (relief map) ───────── */
if(T("explorers")&&!T("explorers")._polD){T("explorers")._polD=1;
 set("explorers","Columbus, 1492",s=>{s.on=["currents"];s.view=[-128,-2,-2,52];s.gfRuler={a:[-17.1,28.1],b:[-74.5,24.05]};
  s.body="He first sailed south to the Canary Islands, where the trade winds blow steadily from the east and the ocean currents flow west with them (arrows). Riding them, his three ships crossed about 5,700 km of open sea (ruler) and reached the Bahamas on 12 October 1492."});
 set("explorers","The Vikings got there first",s=>{s.view=[-125,35,22,75]});
 set("explorers","Around the world",s=>{s.gfRuler={a:[-75,-52.5],b:[144.7,13.4]};
  s.body="Ferdinand Magellan led five Spanish ships west, through a strait at the tip of South America, then across the Pacific to Guam: over 14,000 km of open ocean (ruler). He was killed in the Philippines in 1521; Juan Sebastián Elcano brought one ship home in 1522."});
 set("explorers","Zheng He’s treasure fleets",s=>{s.on=["connections"];
  s.body="Between 1405 and 1433, Zheng He led seven great voyages for the Ming emperors, across the Indian Ocean to Arabia and East Africa, with up to about 27,000 men. Today’s busiest shipping lanes (blue) still follow his route through the Strait of Malacca."});
 set("explorers","Marco Polo",s=>{s.gfRuler={a:[12.33,45.44],b:[116.4,39.9]};
  s.body="In 1271 he set out with his father and uncle along the Silk Road to the court of Kublai Khan, the Mongol ruler of China, whose capital stood where Beijing is now: about 7,900 km from Venice as the crow flies (ruler). He served the khan for years, then came home by sea."});
 set("explorers","Ibn Battuta",s=>{s.gfRuler={a:[-5.8,35.77],b:[118.59,24.9]};
  s.body="He left Tangier, Morocco, in 1325, aged 21, to make the pilgrimage to Mecca, and kept going for about 29 years. The ruler measures Tangier to Quanzhou, in China: about 11,000 km. His zigzag journeys added up to roughly ten times that."});
 set("explorers","Sailing by the stars",s=>{s.gfRuler={a:[-155.5,19.6],b:[-149.43,-17.65]};
  s.body="The Hōkūleʻa, a copy of an ancient double-hulled canoe, sailed from Hawaii to Tahiti, about 4,200 km (ruler), steered by Mau Piailug, a navigator from Micronesia, who read the stars, swells and birds. It proved Polynesians could have found Hawaii on purpose."});
 set("explorers","Captain Cook",s=>{s.gfRuler={a:[-4.14,50.37],b:[-149.43,-17.65]};
  s.body="On three voyages between 1768 and 1779, Cook charted New Zealand and Australia’s east coast and crossed the Antarctic Circle. His first voyage went from Plymouth to Tahiti, over 15,000 km in a straight line (ruler) and much further round South America."});
 set("explorers","Lewis and Clark",s=>{s.xsec={title:"Along their route, St Louis to the Pacific",pts:[[-90.2,38.63,"St Louis"],[-94.6,39.1],[-96,41.3],[-100.8,46.8],[-101.27,47.3,"Fort Mandan"],[-104,47.9],[-108.5,47.7],[-111.3,47.5],[-112.5,45.6],[-113.44,44.97,"Lemhi Pass"],[-114.6,46.63],[-116.2,46.45],[-117.0,46.4],[-119.5,46.0],[-121.18,45.6],[-122.8,46.1],[-123.88,46.13,"Pacific"]],mark:2247,
   note:"The dashed line marks 2,247 m, Lemhi Pass on the Continental Divide. Heights are smoothed, and the line follows the route only roughly."};
  s.body="After the US bought the vast Louisiana territory from France, President Jefferson sent an expedition up the Missouri River to find a route to the Pacific. Move along the chart: the plains rise slowly for over 2,000 km, then the Rocky Mountains block the way."});
}
/* ───────── Europe ───────── */
if(T("heurope")&&!T("heurope")._polD){T("heurope")._polD=1;
 set("heurope","Europe’s story",s=>{s.phPins=[ph([23.73,37.97],"Athens: the Parthenon"),ph([4.54,43.95],"Pont du Gard: Roman aqueduct"),ph([11.26,43.77],"Florence: Renaissance dome"),
  ph([10.7,59.9],"Oslo: a Viking ship"),ph([-2.24,53.48],"Manchester: cotton mills"),ph([13.38,52.52],"Berlin: Brandenburg Gate")];s.view=[-60,30,48,70]});
 set("heurope","Rome falls, nations rise",s=>{s.view=[-45,28,38,62]});
 set("heurope","The Black Death",s=>{s.view=[-55,30,45,66]});
 set("heurope","The Renaissance",s=>{s.view=[-2,35,22,48]});
 set("heurope","The Vikings",s=>{s.gfRuler={a:[5.32,60.39],b:[-55.53,51.6]};
  s.body="From 793, when they raided the monastery of Lindisfarne in England, Norse ships sailed from Scandinavia to Iceland, Greenland and Newfoundland, and down Russia’s rivers towards Constantinople. The ruler measures Norway to Newfoundland: about 3,800 km."});
 set("heurope","Napoleon’s Europe",s=>{s.gfRuler={a:[2.35,48.86],b:[37.62,55.75]};
  s.more="In 1812 he marched on Moscow, about 2,500 km from Paris (ruler), with an army of over 400,000 men; only a small fraction came back. He was finally beaten at Waterloo in 1815 and died in exile on Saint Helena, in the South Atlantic. His Napoleonic Code still shapes the laws of many countries, and the metric system spread with his armies."});
 set("heurope","The Industrial Revolution",s=>{s.on=["resources"];
  s.body="From about 1760, British inventors harnessed coal and steam to power machines. Factories, railways and smoky cities grew up on the coalfields (black icons) of Britain, Belgium and Germany’s Ruhr."});
}
/* ───────── Asia ───────── */
if(T("hasia")&&!T("hasia")._polD){T("hasia")._polD=1;
 set("hasia","Asia’s story",s=>{s.phPins=[ph([46.1,30.96],"Ur: a ziggurat"),ph([77.74,23.48],"Sanchi: a Buddhist stupa"),ph([109.27,34.38],"Xi’an: clay soldiers"),
  ph([103.87,13.41],"Angkor Wat at sunrise"),ph([77.24,28.66],"Delhi: the Red Fort"),ph([121.5,31.24],"Shanghai today")]});
 set("hasia","The first emperor",s=>{s.gfRuler={a:[119.75,40.0],b:[98.22,39.8]};
  s.more="Farmers digging a well near Xi’an found the Terracotta Army in 1974; the emperor’s own tomb has still not been opened. Most of the Great Wall you can visit today (amber) was built much later, under the Ming: from Shanhaiguan to Jiayuguan is about 1,800 km in a straight line (ruler), but all its sections and branches add up to about 21,000 km."});
 set("hasia","Gandhi and the princes",s=>{s.gfRuler={a:[72.58,23.06],b:[72.8,20.89]};
  s.more="On the Salt March, Gandhi walked about 390 km from his ashram in Ahmedabad to the sea at Dandi (the ruler measures the straight line, about 240 km) to make salt, breaking a British tax. Almost all the princes joined India or Pakistan, but Hyderabad, the richest, was taken over by India’s army in 1948. Kashmir’s ruler joined India during fighting with forces from Pakistan, and the region has been divided and disputed ever since."});
 set("hasia","Shenzhen’s rise",s=>{s.on=["connections"];
  s.more="Shenzhen is home to firms like Huawei, Tencent and BYD, and its port, with Hong Kong and Guangzhou next door, is one of the busiest in the world (shipping lanes in blue). Deng summed up his approach: “It doesn’t matter whether a cat is black or white, as long as it catches mice.” Xiamen, Shantou and Zhuhai were the other first zones."});
}
/* ───────── Africa ───────── */
if(T("hafrica")&&!T("hafrica")._polD){T("hafrica")._polD=1;
 set("hafrica","Africa’s history",s=>{s.phPins=[ph([35.35,-2.99],"Olduvai Gorge: early tools"),ph([31.63,22.34],"Abu Simbel: Ramesses II"),ph([33.75,16.94],"Meroë: Kush’s pyramids"),
  ph([-3.0,16.77],"Timbuktu: mud-brick mosque"),ph([30.93,-20.27],"Great Zimbabwe: stone walls"),ph([39.19,-6.16],"Zanzibar: a dhow")]});
 set("hafrica","Where we began",s=>{s.xsec={title:"Across the Great Rift Valley in Kenya",pts:[[34.3,-0.45,"Lake Victoria"],[35.0,-0.45],[35.6,-0.45,"Mau Escarpment"],[36.1,-0.45,"Rift floor"],[36.6,-0.45,"Aberdares"],[37.3,-0.45],[38.0,-0.45]],mark:1800,
   note:"The dashed line marks 1,800 m. The rift floor sits between two high walls. Heights are smoothed."};
  s.body="Older human relatives lived along East Africa’s Great Rift Valley for millions of years, like “Lucy”, found in Ethiopia. Move along the chart to cross the rift: lakes and fossil beds lie on its floor. But the oldest known Homo sapiens bones were found at Jebel Irhoud, in Morocco."});
 set("hafrica","Mansa Musa’s gold",s=>{s.gfRuler={a:[-3.0,16.77],b:[31.24,30.04]};
  s.body="In the 1300s, the Mali Empire controlled much of West Africa’s gold. On his pilgrimage to Mecca in 1324, Mansa Musa crossed the Sahara to Cairo, about 3,900 km from Timbuktu (ruler), and gave away so much gold there that its price fell for years."});
 set("hafrica","Carving up Africa",s=>{s.ghosts=[{code:"be",at:[23.5,-2.5],col:"#8a63cf",label:"Belgium, true size"}];
  s.body="After the Berlin Conference of 1884–85, European powers divided Africa. France took the most land (blue), Britain the most people (red), and King Leopold II ran the Congo as his private property. Drag Belgium across the Congo to compare."});
}
/* ───────── North America ───────── */
if(T("hnamerica")&&!T("hnamerica")._polD){T("hnamerica")._polD=1;
 set("hnamerica","North America’s history",s=>{s.phPins=[ph([-108.47,37.17],"Mesa Verde: cliff houses"),ph([-90.06,38.66],"Cahokia: Monks Mound"),ph([-99.13,19.43],"Tenochtitlan: the Aztec capital"),
  ph([-81.31,29.9],"St Augustine: Spanish fort"),ph([-77.23,39.81],"Gettysburg, 1863"),ph([-77.01,38.89],"Washington: the Capitol")]});
 set("hnamerica","Coast to coast by rail",s=>{s.gfRuler={a:[-95.94,41.26],b:[-121.49,38.58]};
  s.body="The Central Pacific built east from Sacramento and the Union Pacific west from Omaha, about 2,200 km apart (ruler); the track itself was about 2,860 km. They met at Promontory Summit, Utah, where a golden spike was hammered in on 10 May 1869."});
 set("hnamerica","1867: two big deals",s=>{s.ghosts=[{code:"r:alaska",at:[-98,40],col:"#8a63cf",label:"Alaska, true size"}];
  s.body="Russia sold Alaska for $7.2 million, and critics called it “Seward’s Folly”. Drag Alaska over the other states: it is about a fifth of their size. That same year, on 1 July, four British colonies united as Canada (outlined)."});
}
/* ───────── South America ───────── */
if(T("hsamerica")&&!T("hsamerica")._polD){T("hsamerica")._polD=1;
 set("hsamerica","South America’s history",s=>{s.phPins=[ph([-77.52,-10.89],"Caral: 5,000-year-old city"),ph([-75.13,-14.74],"Nazca: desert drawings"),ph([-72.55,-13.16],"Machu Picchu: Inca city"),
  ph([-65.75,-19.62],"Potosí: the silver mountain"),ph([-47.86,-15.8],"Brasília: a new capital"),ph([-73.2,-41.5],"Monte Verde: 14,500 years ago")]});
 set("hsamerica","The Inca roads",s=>{s.gfRuler={a:[-77.28,1.21],b:[-72.4,-35.3]};s.hi=[];s.hiSoft=[];delete s.legend;delete s.G;s.view=[-112,-40,-48,6];
  s.stat="The Inca Empire stretched about 4,000 km along the Andes, tied together by 30,000 km of roads";
  s.body="The ruler spans the empire, from southern Colombia to central Chile. Its roads crossed deserts and mountain passes, with rope bridges over gorges, and relay runners called chasquis could carry a message up to about 240 km in a day."});
 ins("hsamerica","The Inca roads",{title:"Machu Picchu",view:[-80,-17,-66,-9],globe:[-72.5,-13.2,4],card:"left",hi:["pe"],sub:"1500/inca",
  pins:[[[-72.545,-13.163],"Machu Picchu","point"],[[-71.97,-13.53],"Cusco, the capital","point"]],
  xsec:{title:"From the Pacific over the Andes to Machu Picchu",pts:[[-76.2,-13.7,"Pacific"],[-75.4,-13.6],[-74.5,-13.5],[-73.6,-13.35],[-72.95,-13.25],[-72.545,-13.163,"Machu Picchu"],[-72.3,-12.9],[-72.0,-12.5,"Amazon lowlands"]],mark:2430,
   note:"The dashed line marks 2,430 m, the height of Machu Picchu. Heights are smoothed, so the narrow river gorges look shallower than they are."},
  stat:"Machu Picchu sits on a ridge 2,430 m up, between the high Andes and the Amazon rainforest",
  body:"The emperor Pachacuti had it built around 1450, probably as a royal estate. Move along the chart: from the dry coast the Andes rise to over 4,000 m, and Machu Picchu perches on their eastern slope, where the land falls away towards the Amazon.",
  more:"The Spanish never found it. Farmers living nearby knew it well, and in 1911 a local guide led the American explorer Hiram Bingham there, who made it famous. Its stones were cut to fit so tightly without mortar that they have survived many earthquakes."});
 set("hsamerica","Pizarro and Atahualpa",s=>{s.ghosts=[{code:"es",at:[-62,-12],col:"#8a63cf",label:"Spain, true size"}];s.view=[-104,-24,-48,10];
  s.body="The Inca Empire, about four times the size of Spain (drag it), had just been torn apart by a civil war between Atahualpa and his brother Huáscar, and by smallpox, which arrived from Europe before the Spanish did."});
 set("hsamerica","The liberators",s=>{s.xsec={title:"San Martín’s crossing, Mendoza to Santiago",pts:[[-68.84,-32.89,"Mendoza"],[-69.3,-32.6],[-69.75,-32.6],[-70.1,-32.8,"Andes pass"],[-70.5,-32.9],[-70.65,-33.45,"Santiago"]],mark:3500,
   note:"The dashed line marks 3,500 m. His columns crossed passes even higher than the smoothed heights show."}});
 set("hsamerica","Brasília",s=>{s.gfRuler={a:[-43.2,-22.9],b:[-47.88,-15.79]}});
/* frame the subject in the right part of the map, clear of the card */
 set("hsamerica","Sugar and slavery",s=>{s.view=[-110,-40,25,12]});
 set("hsamerica","The new arrivals",s=>{s.view=[-100,-50,-30,-10]});
 set("hsamerica","Brasília",s=>{s.view=[-75,-30,-30,-5]});
 set("hsamerica","Years of military rule",s=>{s.view=[-110,-56,-25,13]});
 set("hsamerica","The Falklands War",s=>{s.view=[-95,-58,-45,-38]});
}
/* ───────── Oceania ───────── */
if(T("hoceania")&&!T("hoceania")._polD){T("hoceania")._polD=1;
 set("hoceania","Oceania’s story",s=>{s.phPins=[ph([132.9,-12.4],"Kakadu: rock art"),ph([151.21,-33.86],"Sydney Cove, 1792"),ph([174.07,-35.27],"Waitangi: the Treaty House"),
  ph([165.38,11.6],"Bikini Atoll"),ph([131.04,-25.34],"Uluru")]});
 set("hoceania","Voyagers of the open Pacific",s=>{s.gfRuler={a:[-149.43,-17.65],b:[-109.35,-27.1]};
  s.body="About 3,000 years ago, the Lapita people sailed east from near New Guinea to Fiji, Tonga and Samoa. Much later their descendants reached Hawaii, Rapa Nui (Easter Island), about 4,000 km from Tahiti (ruler), and, around 1250 to 1300 AD, New Zealand, the last."});
 set("hoceania","Easter Island’s giants",s=>{s.gfRuler={a:[-109.35,-27.1],b:[-130.1,-25.07]};
  s.body="Rapa Nui, or Easter Island, lies about 3,500 km from Chile, and over 2,000 km from Pitcairn, the nearest inhabited island (ruler). Its people carved the moai from volcanic rock at one quarry, Rano Raraku, and moved them across the island."});
 set("hoceania","The oldest living culture",s=>{s.view=[95,-44,160,-8]});
 set("hoceania","The First Fleet",s=>{s.gfRuler={a:[-1.09,50.8],b:[151.21,-33.86]};
  s.body="Eleven ships carried about 1,400 people, over half of them convicts, from England to Sydney Cove: about 17,000 km in a straight line (ruler), and far more by sea. The British flag was raised there on 26 January 1788, now Australia Day."});
}
/* ───────── Antarctica (relief map, globe) ───────── */
if(T("hantarctica")&&!T("hantarctica")._polD){T("hantarctica")._polD=1;
 set("hantarctica","Antarctica’s story",s=>{s.phPins=[ph([166.67,-77.85],"McMurdo: the biggest base"),ph([-52.3,-68.7],"Endurance, 1915"),ph([-36.5,-54.28],"Grytviken: old whaling station"),
  ph([-26.2,-75.6],"Halley: the ozone hole station"),ph([142.66,-67.01],"Cape Denison: Mawson’s hut"),ph([-60.6,-62.95],"Deception Island: cruise ships")]});
 set("hantarctica","The unknown southern land",s=>{s.ghosts=[{code:"au",at:[60,-80],col:"#8a63cf",label:"Australia, true size"}];s.globe=[60,-60,1.1];
  s.more="Antarctica means “opposite the Bear”: the Arctic is named after arktos, Greek for bear, after the Great Bear constellation. When explorers found Australia instead, it took the old name, which just means “southern”. The real southern continent lay much further south: drag Australia onto it and see that Antarctica is almost twice as big."});
 set("hantarctica","The first winter",s=>{s.gfSun={utc:12,day:172};
  s.body="The Belgian ship Belgica was frozen into the sea ice west of the Antarctic Peninsula for about a year. In June the Sun never rises over most of Antarctica (dark): move the date to see the polar night come and go. In the long darkness, the crew fell ill with scurvy."});
 set("hantarctica","Race to the Pole",s=>{s.gfRuler={a:[-164,-78.5],b:[0,-90]};
  s.body="Norway’s Roald Amundsen set out from the Bay of Whales with skis and dog sleds, about 1,300 km from the Pole (ruler), and reached it on 14 December 1911. Britain’s Robert Falcon Scott, starting from Ross Island, arrived on 17 January 1912 to find a Norwegian tent."});
 set("hantarctica","Endurance",s=>{s.gfRuler={a:[-55.2,-61.1],b:[-37.3,-54.17]};
  s.body="Endurance was trapped in the Weddell Sea in 1915 and sank that November. The men drifted on the ice and rowed to Elephant Island; then Shackleton and five others sailed a 7 m lifeboat about 1,300 km (ruler) across the stormy Southern Ocean to South Georgia for help."});
 set("hantarctica","Reading the ice",s=>{s.xsec={title:"From the coast up the ice sheet to Vostok",pts:[[110.5,-66.3,"Casey (coast)"],[110,-70],[108.5,-74],[106.8,-78.46,"Vostok"]],mark:3488,
   note:"The dashed line marks 3,488 m, the ice surface at Vostok. Almost all of this height is ice: the rock below is near sea level."};
  s.body="Snow piles up year after year and turns to ice, trapping tiny bubbles of air. Move along the chart: the ice sheet rises to about 3,500 m at Vostok. Drilling cores through it lets scientists read the climate of the past."});
}
}
function run(){patch();subs();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
