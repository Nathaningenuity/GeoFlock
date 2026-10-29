/* GeoFlock: polish for the older tours defined in index.html — How countries are run (govmap), International relations
   (politics), Geopolitics (geopol), Borders, Special regions (regions), GDP, Transport and trade, Animals and Environment.
   Adds interactive gadgets (day and night, rulers, true-size ghosts, cross-sections, history-map stops, map layers),
   card photos for stops that had none, photo pins on the opening stops, drops photo pins that had nothing to do with the
   stop, and links each tour question to a country. It only patches PS_TOURS at load (like the ADD patches at the end of
   geoflock-mapsx.js); load it after the tour files. Every patch is keyed by stop title, so a stop that has been renamed or
   removed is simply skipped. */
(function(){
const OPEN={govmap:"How the world is run",politics:"Politics of the world",geopol:"Geopolitics",borders:"Strange borders",
 regions:"Not quite countries",gdp:"The world’s money map",transport:"Transport and trade",animals:"Animals of the world",
 environment:"People and the planet"};
const W=[-180,-58,180,80];
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(s)}catch(e){console.error(e)}};
/* insert a new stop after the stop titled `after` (once) */
const ins=(id,after,S)=>{const t=T(id);if(!t||t.steps.some(s=>s.title===S.title))return;const i=t.steps.findIndex(s=>s.title===after);if(i<0)return;S._enr=1;t.steps.splice(i+1,0,S)};
const dropPh=(s,labels)=>{if(s.phPins)s.phPins=s.phPins.filter(q=>!labels.includes(q.label))};
const relabel=(s,from,to)=>{(s.pins||[]).forEach(p=>{if(Array.isArray(p)&&p[1]===from)p[1]=to})};
const ph=(at,label)=>({at,label,col:"#d9682b",icon:"photo"});
/* a stop that uses its own map mode: let the shared per-stop switch (stopModes) handle it */
const allowMode=(id,mode)=>{const t=T(id);if(!t)return;t.stopModes=true;t.alsoOn=t.alsoOn||[];if(!t.alsoOn.includes(mode))t.alsoOn.push(mode);if(t.map&&t.map.mode&&!t.alsoOn.includes(t.map.mode))t.alsoOn.push(t.map.mode)};

/* card photos ("tour|title" → library file name), captions, and photo-pin photos (pin label → file name) */
const CARD={
 "govmap|Soldiers take over":"Pont de l'Amitié Chine-Niger - Niamey from the sky.jpg",
 "govmap|Capitals that moved":"Brasilia aerea estadionacional.jpg",
 "geopol|Cables on the seabed":"Line3174 - Shipping Containers at the terminal at Port Elizabeth, New Jersey - NOAA.jpg",
 "regions|Not quite countries":"Rock-of-Gibraltar-2011.jpg",
 "regions|America’s islands":"Flamenco Beach, Culebra Island, Puerto Rico.jpg",
 "regions|Denmark’s far north":"Tasiilaq, Greenland 02.jpg",
 "regions|France across the oceans":"Piton de La Fournaise - Paysage de l'île de La Réunion.jpg",
 "regions|Britain’s scattered pieces":"Gibraltar 03.jpg",
 "regions|The Dutch Caribbean":"Facades of Handelskade, Willemstad, Curaçao - February 2020.jpg",
 "regions|Hong Kong and Macau":"Vista del Puerto de Victoria desde Sky100, Hong Kong, 2013-08-09, DD 10.JPG",
 "regions|Taiwan":"Taipei 101 from Xiangshan 20260927 (cropped).jpg",
 "regions|Breakaway regions of Europe":"Tiraspol ljeti.jpg",
 "regions|Somaliland":"Street Market Hargeisa, Somaliland (29322262370).jpg",
 "regions|Western Sahara":"Road to Laayoune Port.jpg",
 "regions|The Kurdistan Region":"Erbil Citadel.jpg",
 "regions|Palestine":"Hisham Palace in Jericho2.jpg",
 "regions|Arctic oddities":"Longyearbyen-spisshus-2022.jpg",
 "animals|Snow leopards":"Panthera uncia - Zoo Karlsruhe.jpg",};
const CAP={
 "govmap|Soldiers take over":"Niamey, Niger’s capital: soldiers seized power here in July 2023",
 "geopol|Cables on the seabed":"Ships and containers ride on top; the internet’s cables lie on the seabed below",
 "regions|Britain’s scattered pieces":"Gibraltar, a British Overseas Territory at the tip of Spain",
 "regions|Western Sahara":"The road to the port of Laayoune",
 "regions|Palestine":"Hisham’s Palace, an 8th-century ruin at Jericho",
 "animals|Snow leopards":"A snow leopard in a zoo; in the wild they are very hard to see"};
const PIN={
 "UN headquarters, New York":"Lower Manhattan from Jersey City November 2016 002.jpg",
 "Geneva: UN offices":"Arc-en-ciel sur le jet d'eau de Genève - GT 2025.jpg",
 "Bosphorus: the Black Sea’s only exit":"Bosphorus Bridge (235499411).jpeg",
 "Panama Canal":"Panama Canal Miraflores Locks.jpg",
 "Strait of Hormuz":"Tanker in the Strait of Hormuz.jpg",
 "Greenland’s ice":"Early Melt on the Greenland Ice Sheet (33354485670).jpg",
 "Lithium ponds, Atacama":"Salar de Atacama Lithium salt ponds 2018.jpg",
 "The US–Canada border cut through forest":"International Boundary (4499904895).jpg",
 "The Wagah border ceremony":"Lowering of the flags at the Wagah border.jpg",
 "Tijuana: the US–Mexico border wall":"Border Wall at Tijuana and San Diego Border.jpg",
 "Kyrenia, Northern Cyprus":"Harbour, Kyrenia, Northern Cyprus 07.jpg",
 "Faroe Islands: Saksun":"Saksun, Faroe Islands.jpg",
 "Bora Bora, French Polynesia":"Boraboraluft.jpg",
 "Bermuda":"Bermuda - Horseshoe Bay Cove.jpg",
 "Falklands: Stanley":"Houses in the hillside Stanley Falkland Islands.jpg",
 "Jersey: Mont Orgueil":"Jersey - Mont Orgueil 01.jpg",
 "Aruba: Oranjestad":"Plaza Daniel Leo, Oranjestad, Aruba - February 2020.jpg",
 "Macau: Ruins of St Paul’s":"Ruins of St. Paul, Macau, during a festival.jpg",
 "Sukhumi, Abkhazia":"Abkhazia. Sukhumi. Hotel Ritsa P9130523 2600.jpg",
 "Åland: Mariehamn":"Aerial photo of Mariehamn 2026.jpg",
 "Summit: rain in 2021":"MSF, Summit Camp Greenland, aerial photography.jpg",
 "Serengeti: wildebeest":"Serengeti wildebeest migration JF.jpg",
 "Polar bear, Svalbard":"Polar bear (Ursus maritimus) in the drift ice region north of Svalbard.jpg",
 "Giant pandas":"Pandas!! (GIANT PANDA-WOLONG-SICHUAN-CHINA) (2150600169).jpg",
 "Orangutan, Borneo":"Orangutan Kalimantan.jpg",
 "Penguins, Antarctica":"Penguin in Antarctica jumping out of the water.jpg",
 "Amazon rainforest":"Aerial view of the Amazon Rainforest.jpg",
 "Rondônia: cleared forest":"SOBREVVO EM RONDONIA DIA 07-08-2020 (FOTO BRUNO KELLY) (62) (50224604772).jpg",
 "Delhi: winter smog":"Low visibility due to Smog at New Delhi Railway station 31st Dec 2017 after 9AM DSCN8829 1.jpg",
 "Funafuti, Tuvalu ":"Tuvalu Funafuti Atoll from the Airplane.jpg",
 "Bleached coral":"Bleached Staghorn Coral.jpg",
 "Greenland: melting ice":"Early Melt on the Greenland Ice Sheet (33354485670).jpg",
 "Saihanba: planted forest":"Saihanba National Forest Park(Autumn 2011) - panoramio.jpg",
 "Yellowstone":"Radio collared gray wolf on snow.jpg",
 "Qinghai–Tibet railway: Lhasa":"Potala Palace, August 2009.jpg"};

function findIdx(f){try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined")return;for(const k in CARD){const i=findIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_PHOTO_CAP=window.PS_PHOTO_CAP||{};for(const k in CAP)PS_PHOTO_CAP[k]=CAP[k];
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};for(const l in PIN){const i=findIdx(PIN[l]);if(i>=0)PS_SQ_IMG[l]=i}
 try{if(typeof GF_SQ_FILE!=="undefined")for(const l in PIN)if(!GF_SQ_FILE[l])GF_SQ_FILE[l]=PIN[l]}catch(e){}}catch(e){console.error(e)}}

/* "Country: landmark" photo pins that the shared enrichment put at a country's centre, where they are off the stop's subject */
const OFF=["China: Great Wall of China","United States: Grand Canyon","Germany: Neuschwanstein Castle","Indonesia: Borobudur","Brazil: Christ the Redeemer, Rio",
 "Malaysia: Petronas Towers","Brunei: Omar Ali Saifuddien Mosque","Pakistan: K2","Australia: Sydney Opera House","Switzerland: A spring meadow in the Swiss Alps",
 "Philippines: The Chocolate Hills of Bohol","France: The Eiffel Tower at night","United Kingdom: Big Ben and Westminster","Russia: St Basil’s Cathedral, Moscow",
 "Norway: Geirangerfjord","Italy: Colosseum","India: Taj Mahal"];
function dropOff(id,keep){const t=T(id);if(!t)return;t.steps.forEach(s=>{if(!s.phPins)return;if(keep&&keep.includes(s.title))return;dropPh(s,OFF)})}

/* country inked by each tour question (kc), by the stop the question is about */
const KC={govmap:{"One king, fifteen countries":"ca","You must vote":"au","Ruled by one party":"cn","Capitals that moved":"br","Kings who are elected":"my"},
 politics:{"Five with a veto":"fr","Countries in question":"cy","NATO":"fi","The newest countries":"ss","Peaceful splits":"sk"},
 geopol:{"Chokepoints":"ir","Upstream holds the tap":"et","What lies underneath":"cd","The South China Sea":"ph","The Red Sea shortcut":"dj","Rivers you can’t sail up":"cd"},
 borders:{"Most neighbours":"cn","Landlocked":"et","Land nobody wants":"sd","The whisky war island":"ca","France’s longest border":"br","A lake without a border":"ch"},
 regions:{"Hong Kong and Macau":"hk","Somaliland":"sml","Denmark’s far north":"gl"},
 gdp:{"States bigger than countries":"ru","Africa, and the power of exchange rates":"ng","Norway saved its oil money":"no","Two giants":"cn","The richest per person":"lu","The Global South":"br"},
 transport:{"The busiest airports":"us","The Trans-Siberian":"ru","The railway to the sky":"cn","The box that changed the world":"us","The Suez Canal blocked":"eg","More bikes than people":"nl"},
 animals:{"The deadliest animal":"ng","Pandas":"cn","Lions outside Africa":"in","The Amazon":"br","Pole to pole":"gl"},
 environment:{"Palm oil and Borneo":"id","Greenland’s ice":"gl","Costa Rica regrows":"cr","Carbon negative":"bt","Electric Norway":"no","The wolves return":"us"}};

function patch(){
/* ───────── How countries are run (Politics map) ───────── */
if(T("govmap")&&!T("govmap")._polC){T("govmap")._polC=1;
 set("govmap","How the world is run",s=>{s.phPins=[ph([12.45,41.9],"Vatican: the Pope rules alone"),ph([57.53,22.93],"Oman: the sultan makes the laws"),
  ph([-82.38,23.12],"Cuba: one party since 1965"),ph([-21.1,64.25],"Iceland’s parliament first met here in 930"),ph([-5.28,6.82],"Yamoussoukro’s giant basilica")]});
 set("govmap","One king, fifteen countries",s=>{s.gfSun={utc:0,day:355};
  s.body="Canada, Australia, New Zealand and Jamaica are fully independent, yet share Britain’s monarch. His 15 realms are spread so widely that the sun never sets on all of them at once: move the clock and some realm is always in daylight.";});
 set("govmap","Capitals that moved",s=>{s.gfRuler={a:[76.9,43.24],b:[71.45,51.17]};
  s.body="Countries sometimes build a new capital in the middle of the country, to unite it and spread out development. Brazil, Nigeria, Kazakhstan and Myanmar all did it. The ruler measures how far Kazakhstan moved its capital, from Almaty in the far south-east to Astana: about 970 km."});
}
/* ───────── International relations (Politics map) ───────── */
if(T("politics")&&!T("politics")._polC){T("politics")._polC=1;
 set("politics","Politics of the world",s=>{s.phPins=[ph([-73.97,40.75],"UN headquarters, New York"),ph([6.14,46.2],"Geneva: UN offices"),
  ph([20.9,42.6],"Kosovo"),ph([30.25,7.3],"South Sudan: Cattle at a camp near Imehejek"),ph([103.82,1.35],"Singapore: left Malaysia in 1965")]});
 set("politics","Borders without passports",s=>{s.gfRuler={a:[-9.14,38.72],b:[24.94,60.17]};
  s.body="In the Schengen area, 29 countries have no routine checks at their shared borders: the ruler measures Lisbon to Helsinki, over 3,300 km without a passport check. Ireland stays out to keep its open border with the UK."});
}
/* ───────── Geopolitics (relief) ───────── */
if(T("geopol")&&!T("geopol")._polC){T("geopol")._polC=1;
 set("geopol","Geopolitics",s=>{s.phPins=[ph([28.98,41.05],"Bosphorus: the Black Sea’s only exit"),ph([-79.9,9.1],"Panama Canal"),ph([56.3,26.6],"Strait of Hormuz"),
  ph([-42,72],"Greenland’s ice"),ph([-68.3,-23.5],"Lithium ponds, Atacama")]});
 set("geopol","The open plain",s=>{s.xsec={title:"The North European Plain, Paris to Moscow",pts:[[2.35,48.86,"Paris"],[4.35,50.85,"Brussels"],[9.73,52.37],[13.4,52.52,"Berlin"],[17,52.4],[21.01,52.23,"Warsaw"],[24.5,53.2],[27.56,53.9,"Minsk"],[32.05,54.78,"Smolensk"],[35,55.3],[37.62,55.75,"Moscow"]],mark:300,
  note:"The dashed line marks 300 m. From Paris to Moscow the land hardly rises: no mountain range stands in an army’s way."};
  s.body="The North European Plain has no mountains or seas to stop an army: move along the chart from Paris to Moscow and the land stays low all the way. Napoleon marched across it in 1812 and Germany in 1941; Russian armies have used it the other way."});
 set("geopol","Russia and warm water",s=>{s.on=["currents"];s.view=[-50,40,140,82];s.globe=[40,62,1.3];s.spin=0;
  s.body="Much of Russia’s coast freezes in winter. Its warmer ports sit on seas whose exits other countries control. The one big exception is Murmansk: follow the warm current on the map, the Gulf Stream’s last reach, round Norway to its ice-free harbour."});
 set("geopol","Chokepoints",s=>{s.on=["connections"]});
 set("geopol","The strait that closed",s=>{s.on=["connections"]});
 set("geopol","The Red Sea shortcut",s=>{s.on=["connections"];s.gfRuler={a:[43.47,12.67],b:[43.33,12.48]};relabel(s,"Bab-el-Mandeb: about 30 km wide","Bab-el-Mandeb: about 26 km wide");
  s.body="Ships between Asia and Europe squeeze through the Bab-el-Mandeb, about 26 km wide (see the ruler), then the Suez Canal. From late 2023 Yemen’s Houthis fired on passing ships, and many lines switched to the route round Africa, about 10 days longer."});
 set("geopol","The Malacca dilemma",s=>{s.on=["connections"]});
 set("geopol","The first island chain",s=>{s.gfRuler={a:[119.79,25.45],b:[120.92,24.85]};
  s.body="From Japan through Taiwan and the Philippines to Indonesia, a line of islands fences in China’s seas. Strategists call it the first island chain. The ruler measures the Taiwan Strait at its narrowest: about 130 km, four times the English Channel."});
 set("geopol","What lies underneath",s=>{s.on=["resources"]});
 set("geopol","Cables on the seabed",s=>{s.on=["connections"];
  s.body="Satellites carry less than 1%. The cables, shown on the map, come ashore in only a few places, and many lines between Europe and Asia squeeze across Egypt and down the Red Sea, so one dragged anchor can slow the internet for millions."});
}
/* ───────── Borders (relief; two stops on the History map) ───────── */
if(T("borders")&&!T("borders")._polC){T("borders")._polC=1;
 set("borders","Strange borders",s=>{s.phPins=[ph([-95,49.2],"The US–Canada border cut through forest"),ph([74.57,31.6],"The Wagah border ceremony"),
  ph([-117.1,32.54],"Tijuana: the US–Mexico border wall"),ph([33.32,35.34],"Kyrenia, Northern Cyprus"),ph([28.2,-29.6],"Lesotho, inside South Africa"),ph([0.5,42.7],"Pyrenees: a mountain border")]});
 set("borders","The longest borders",s=>{s.view=[-180,22,-40,76];s.globe=[-100,52,1.5];s.spin=0;s.gfRuler={a:[-123.3,49],b:[-95.15,49]};
  s.body="Canada and the US share about 8,900 km of border, counting Alaska. The ruler measures its straightest part, along the 49th parallel: about 2,000 km without a bend. The longest unbroken land border is Russia and Kazakhstan’s, about 7,600 km."});
 set("borders","Rivers, mountains and rulers",s=>{s.gfRuler={a:[25,22],b:[36.88,22]};
  s.body="Old borders often follow nature: the Pyrenees between Spain and France, the Rio Grande between the US and Mexico. Straight lines were usually drawn by distant powers: the ruler follows the Egypt–Sudan border, about 1,200 km along the 22nd parallel."});
 allowMode("borders","history");
 ins("borders","Rivers, mountains and rulers",{title:"Africa carved up in Berlin",mode:"history",sub:"1914",view:[-20,-36,52,38],globe:[18,3,1.2],card:"left",
  pins:[[[13.4,52.52],"Berlin, 1884–85","point"],[[38.75,9.0],"Ethiopia: stayed independent","point"],[[-10.8,6.3],"Liberia: stayed independent","point"]],
  stat:"In 1884–85 European powers met in Berlin to set rules for dividing Africa. No African was invited",
  body:"The map shows Africa in 1914, 30 years later: every colour is a European empire, and only Ethiopia and Liberia were still independent. Many of the lines drawn then are still Africa’s borders today.",
  more:"Fourteen countries came to the conference. They mostly agreed rules for claiming the coast and the Congo, and the race for the interior followed. Most African countries became independent around 1960 and agreed in 1964 to keep the colonial borders, so as not to start wars over redrawing them."});
 ins("borders","Africa carved up in Berlin",{title:"Europe before the First World War",mode:"history",sub:"1914/ah",view:[-12,34,48,66],globe:[18,50,2],card:"left",
  pins:[[[16.37,48.21],"Vienna: capital of Austria-Hungary","point"],[[21.01,52.23],"Warsaw: ruled from St Petersburg","point"],[[28.98,41.01],"Istanbul: Ottoman capital","point"]],
  stat:"In 1914 four empires ruled central and eastern Europe; by 1923 all four were gone",
  body:"Austria-Hungary (highlighted), Germany, Russia and the Ottoman Empire held most of the region. When they fell after the war, new countries such as Poland, Czechoslovakia, Yugoslavia and the Baltic states appeared on the map.",
  more:"Poland had been split between Russia, Germany and Austria since 1795. Many of the new borders were argued over for decades, and several changed again after 1945 and after 1991."});
 set("borders","So close, never touching",s=>{s.gfRuler={a:[87.33,49.1],b:[87.81,49.17]};s.lines=(s.lines||[]).filter(l=>!(l.coords&&l.coords[0]&&l.coords[0][0]===87.33));
  s.body="Drag the ruler: the gap is only about 37 km. A short stretch of border where Russia and China meet, about 55 km long, keeps the two apart."});
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.borders;if(Q)(Q.mid||[]).forEach(q=>{if(q.at==="Rivers, mountains and rulers")q.at="Europe before the First World War"})}catch(e){}
}
/* ───────── Special regions (relief) ───────── */
if(T("regions")&&!T("regions")._polC){T("regions")._polC=1;
 set("regions","Denmark’s far north",s=>{s.view=[-125,52,0,84];s.globe=[-35,70,1.6];s.ghosts=[{code:"dk",at:[-38,70],col:"#8a63cf",label:"Denmark, true size"}];
  s.phPins=[ph([-6.95,62.1],"Faroe Islands: Saksun")];
  s.body="Greenland and the Faroe Islands belong to the Kingdom of Denmark but govern most of their own affairs, with their own parliaments and flags. Drag Denmark around Greenland: Greenland is about 50 times bigger, with about 57,000 people."});
 set("regions","France across the oceans",s=>{s.phPins=[ph([-151.74,-16.5],"Bora Bora, French Polynesia")]});
 set("regions","Britain’s scattered pieces",s=>{s.view=[-95,8,10,60];s.globe=[-40,35,1.4];s.phPins=[ph([-64.78,32.3],"Bermuda"),ph([-2.02,49.2],"Jersey: Mont Orgueil")]});
 set("regions","The Dutch Caribbean",s=>{s.phPins=[ph([-70.03,12.52],"Aruba: Oranjestad")]});
 set("regions","Hong Kong and Macau",s=>{s.phPins=[ph([113.54,22.2],"Macau: Ruins of St Paul’s")]});
 set("regions","Breakaway regions of Europe",s=>{s.phPins=[ph([33.32,35.34],"Kyrenia, Northern Cyprus"),ph([41.02,43.0],"Sukhumi, Abkhazia")]});
 set("regions","Western Sahara",s=>{s.view=[-30,19,-2,30];s.ghosts=[{code:"gb",at:[-12.5,24.5],col:"#8a63cf",label:"United Kingdom, true size"}];
  s.body="Western Sahara is mostly controlled by Morocco and claimed by the Sahrawi Arab Democratic Republic, and the UN lists it as a non-self-governing territory. Drag the UK over it: at about 266,000 km², the territory is a little bigger."});
 set("regions","Arctic oddities",s=>{s.gfSun={utc:11,day:355};s.phPins=[ph([19.94,60.1],"Åland: Mariehamn")];
  s.body="Svalbard is an Arctic archipelago under Norwegian sovereignty, governed by the 1920 Svalbard Treaty. It is so far north that the sun does not rise from late October to mid-February: move the date and watch the polar night end. Åland, further south, is an autonomous, demilitarised region of Finland."});
}
/* ───────── GDP (GDP map) ───────── */
if(T("gdp")&&!T("gdp")._polC){T("gdp")._polC=1;
 set("gdp","Flip the map: money per person",s=>dropPh(s,["India: Taj Mahal"]));
 dropOff("gdp",["India and the UK","China’s rise"]);
}
/* ───────── Transport and trade (relief) ───────── */
if(T("transport")&&!T("transport")._polC){T("transport")._polC=1;
 set("transport","The Suez Canal blocked",s=>{if(!s.on)s.on=["connections"]});
 set("transport","The long way round",s=>{if(!s.on)s.on=["connections"]});
 set("transport","The Trans-Siberian",s=>{s.on=["timezones"];s.view=[-35,30,140,72];s.spin=0;
  s.body="The journey takes about a week and passes along the shore of Lake Baikal. The time-zone bands on the map show why clocks are a puzzle: Moscow and Vladivostok are seven hours apart, and the line crosses eight time zones."});
 set("transport","The railway to the sky",s=>{s.view=[74,26,106,40];s.spin=0;s.xsec={title:"The Qinghai–Tibet railway, Xining to Lhasa",pts:[[101.78,36.62,"Xining"],[100,37.3],[97.4,37.4],[94.9,36.4,"Golmud"],[94.05,35.6],[93.0,35.0],[92.5,34.2],[91.6,32.9,"Tanggula"],[91.9,31.5],[91.1,30.3],[91.13,29.65,"Lhasa"]],mark:4000,
  note:"The dashed line marks 4,000 m. Heights are smoothed and the line follows the railway only roughly: the real pass is 5,072 m."};
  s.body="The Qinghai–Tibet railway opened in 2006. Move along the chart: after Golmud the line climbs onto the plateau and stays above 4,000 m for about 960 km, so the carriages pump in extra oxygen."});
 set("transport","North Sea to Black Sea",s=>{s.on=["rivers"]});
 dropOff("transport");
}
/* ───────── Animals (relief) ───────── */
if(T("animals")&&!T("animals")._polC){T("animals")._polC=1;
 set("animals","Animals of the world",s=>{s.on=["grid"];s.phPins=[ph([-62,-4],"Amazon rainforest"),ph([34.8,-2.4],"Serengeti: wildebeest"),ph([20,79],"Polar bear, Svalbard"),
  ph([103.5,31],"Giant pandas"),ph([114,0.5],"Orangutan, Borneo"),ph([0,-70],"Penguins, Antarctica")];
  s.body="Warm, wet tropical forests near the equator (the middle grid line) hold far more kinds of animals than cold or dry places. A single hectare of Amazon forest can have more kinds of trees than all of Europe."});
 set("animals","Pole to pole",s=>{s.gfSun={utc:12,day:172};
  s.body="It nests in the Arctic summer, then flies to Antarctica for the southern summer. Move the date: in June the Arctic is lit all day, in December Antarctica is, so the tern sees more daylight than any other animal."});
 set("animals","Monarch butterflies",s=>dropPh(s,["Monarchs wintering in Mexico"]));
 set("animals","Snow leopards",s=>dropPh(s,["Snow leopard"]));
 dropOff("animals");
}
/* ───────── Environment (relief) ───────── */
if(T("environment")&&!T("environment")._polC){T("environment")._polC=1;
 dropOff("environment");
 set("environment","People and the planet",s=>{s.phPins=[ph([-63,-10.5],"Rondônia: cleared forest"),ph([-42,72],"Greenland: melting ice"),ph([77.2,28.61],"Delhi: winter smog"),
  ph([179.2,-8.52],"Funafuti, Tuvalu "),ph([147,-18],"Bleached coral"),ph([117.3,42.4],"Saihanba: planted forest")]});
 set("environment","The biggest emitters",s=>{s.on=["resources"];
  s.body="Burning coal, oil and gas (the icons on the map show where they are dug up) releases carbon dioxide (CO₂), the main gas warming the planet. Just five emitters, four countries and the EU, release about 60% of it."});
 set("environment","Per person, the Gulf",s=>{s.on=["resources"];dropPh(s,["Qatar: Doha"])});
 set("environment","Three green lungs",s=>{s.on=["grid"]});
 set("environment","Vanishing glaciers",s=>dropPh(s,["Pico Humboldt: Venezuela’s last glacier, gone"]));
 set("environment","If all the ice melted",s=>{dropPh(s,["the Netherlands"]);
  s.body="Blue shows land the sea would reach: most of the Netherlands and Denmark, northern Germany, London, Venice and the Po valley. Drag the slider to try smaller rises, and wait a few seconds for the map to repaint."});
 set("environment","Electric Norway",s=>{s.on=["resources"];
  s.body="Norway made electric cars cheaper with tax breaks, free parking and cheap tolls. Petrol cars have almost disappeared from its showrooms, even though, as the map’s oil and gas fields show, Norway got rich selling fossil fuels."});
 set("environment","The wolves return",s=>{dropPh(s,["Yellowstone"]);s.phPins=(s.phPins||[]).concat([ph([-110.5,44.6],"Yellowstone")])});
}
/* tour questions: tie each one to a country (kc) when it has none */
try{if(typeof TOURQ!=="undefined")for(const id in KC){const Q=TOURQ[id];if(!Q)continue;
 if(id==="geopol")[...(Q.mid||[]),...(Q.recap||[])].forEach(q=>{if(q.st==="Small but strategic")q.st="The Red Sea shortcut"});
 if(id==="regions")(Q.recap||[]).forEach(q=>{if(q.kc==="hk")q.st="Hong Kong and Macau";else if(q.kc==="sml")q.st="Somaliland";else if(q.kc==="gl")q.st="Denmark’s far north"});
 [...(Q.mid||[]),...(Q.recap||[])].forEach(q=>{if(!q.kc&&KC[id][q.st])q.kc=KC[id][q.st]})}}catch(e){console.error(e)}
}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
