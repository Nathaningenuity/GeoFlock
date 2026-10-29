/* GeoFlock: four tours for the Power & economy shelf.
   capitals    "Capital cities"
   energy      "Energy of the world"
   currencies  "Money on the map"
   conflicts   "Conflicts and peace"
   Stops reuse what the World Maps view already draws: map layers for one stop (on:["resources"], "connections", "timezones",
   "plates", "cities"…), another map mode for one stop through the shared stopModes switch (mode:"politics"/"gdp"/"night"/
   "history"/"climate"/"satellite", with sub:"…" for the sub-map, e.g. "fed", "clubs", "percapita" or "<year>/<group>" on the
   History map), and the gadgets: the ruler (gfRuler), the country dragger (ghosts), the spotlight (holes), the height
   threshold (gfThr) and day and night (gfSun). Photos: Wikimedia Commons (licence and author in each library entry); new
   ones are listed in GF_POWER1_PHOTOS. */
window.GF_POWER1_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const TL="#5b86d6",W=[-180,-58,180,80];
const COL={capitals:"#5b86d6",energy:"#2e77b8",currencies:"#4b9bd8",conflicts:"#6a83c4"};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:TL,icon:"photo"});
const fix=s=>{if(s.G){s._hsMerged=1;s.legend=null;s.hi=s.hi||[...new Set(s.G.flatMap(g=>g.codes))];s.hiSoft=s.hiSoft||[]}return s};

/* =====================================================================================================
   1. Capital cities
   ===================================================================================================== */
const CAP=[
S({title:"Capital cities",view:W,globe:[20,20,1],
 phPins:[ph([-47.86,-15.8],"Brazil’s National Congress"),ph([149.13,-35.31],"Parliament House, Canberra"),ph([-77.01,38.89],"The US Capitol"),ph([7.53,9.08],"Aso Rock, Abuja"),ph([71.43,51.13],"Astana at night"),ph([96.18,19.77],"Uppatasanti Pagoda, Naypyidaw"),ph([-68.13,-16.5],"La Paz"),ph([106.92,47.92],"Ulaanbaatar")],
 stat:"Most countries are run from one capital city, but a few split the job between two or three",
 body:"A capital is where a country’s government sits. Many capitals grew over centuries into their country’s biggest city; others were planned on empty land, moved somewhere new, or shared out between several cities.",
 more:"This tour visits capitals built from scratch, capitals on the move, the highest and the coldest, and capitals that are not the biggest city in their country."}),
S({title:"Washington, D.C.",view:[-88,35,-70,44],globe:[-77,39,4],card:"left",hi:["us"],gfRuler:{a:[-77.01,38.89],b:[-74.0,40.71]},
 pins:[[[-77.01,38.89],"Washington, D.C.","point"],[[-75.16,39.95],"Philadelphia: capital 1790–1800","point"],[[-74.0,40.71],"New York: first capital, 1789–90","point"]],
 phPins:[ph([-77.04,38.89],"The Washington Monument")],
 stat:"Washington, D.C. was planned as a capital from the start: Congress first met there in November 1800",
 body:"In 1790 Congress agreed to build a new federal city on the Potomac River, between the northern and southern states. Pierre L’Enfant drew its grand avenues, on a diamond of land 10 miles on each side that belonged to no state.",
 more:"New York and then Philadelphia were capitals first; New York is about 330 km away (drag the ruler). The Virginia side of the diamond was handed back in 1846, and the District of Columbia still has no voting member of Congress."}),
S({title:"Canberra, the compromise",view:[134,-41,155,-29],globe:[149,-35,4],card:"left",hi:["au"],gfRuler:{a:[151.21,-33.87],b:[149.13,-35.28]},
 pins:[[[149.13,-35.28],"Canberra","point"],[[151.21,-33.87],"Sydney","point"],[[144.96,-37.81],"Melbourne: parliament until 1927","point"]],
 phPins:[ph([151.21,-33.86],"Sydney Harbour")],
 stat:"Australia’s constitution says its capital must be at least 100 miles (161 km) from Sydney",
 body:"When Australia’s colonies joined together in 1901, Sydney and Melbourne both wanted to be the capital. The compromise was a new city between them, in New South Wales but well away from Sydney. American architects Walter Burley Griffin and Marion Mahony Griffin won the competition to design it in 1912.",
 more:"Parliament met in Melbourne until 1927. Canberra is about 250 km from Sydney in a straight line (drag the ruler), safely more than the constitution’s 100 miles."}),
S({title:"Brasília: built in 41 months",view:[-64,-27,-38,-9],globe:[-47.9,-15.8,3],card:"left",hi:["br"],gfRuler:{a:[-43.2,-22.91],b:[-47.88,-15.79]},
 pins:[[[-47.88,-15.79],"Brasília","point"],[[-43.2,-22.91],"Rio de Janeiro: capital until 1960","point"],[[-46.63,-23.55],"São Paulo","point"]],
 phPins:[ph([-47.88,-15.8],"Brasília Cathedral"),ph([-43.18,-22.97],"Rio de Janeiro")],
 stat:"Brasília was built in about 41 months on an empty upland and opened on 21 April 1960",
 body:"Brazil’s capital used to be Rio de Janeiro, on the coast. President Juscelino Kubitschek built a new one far inland, to draw people and roads into the empty interior. Lúcio Costa drew the plan, shaped like an aeroplane or a bird, and Oscar Niemeyer designed its curving white buildings.",
 more:"Rio is about 930 km away (drag the ruler). Brasília is a UNESCO World Heritage Site, and around 3 million people now live in its Federal District."}),
S({title:"Federal capitals: neutral ground",view:W,globe:[0,20,1],card:"left",mode:"politics",sub:"fed",
 pins:[[[-77.01,38.89],"Washington: District of Columbia","point"],[[149.13,-35.28],"Canberra: Australian Capital Territory","point"],[[-47.88,-15.79],"Brasília: Federal District","point"],[[7.49,9.06],"Abuja: Federal Capital Territory","point"],[[77.21,28.61],"New Delhi","point"]],
 stat:"Many federations put their capital in a special territory that belongs to no single state",
 body:"In a federation, states or provinces share power with the national government. Giving the capital its own district stops any one state from controlling it: Washington, D.C., the Australian Capital Territory, Brazil’s Federal District and Nigeria’s Federal Capital Territory all work this way.",
 more:"The map now shows federations in blue. Mexico City, Kuala Lumpur and Delhi are also federal territories of their own."}),
S({title:"Abuja, in the middle",view:[-10,2,16,15],globe:[7,8.5,3.5],card:"left",hi:["ng"],on:["cities"],
 pins:[[[7.49,9.06],"Abuja","point"],[[3.38,6.52],"Lagos: capital until 1991","point"]],
 phPins:[ph([7.48,9.06],"Abuja National Mosque"),ph([3.4,6.45],"Lagos")],
 stat:"Nigeria moved its capital from Lagos to Abuja, a new city near the centre of the country, on 12 December 1991",
 body:"Lagos, on the coast, was crowded and lay in the Yoruba south. Abuja was chosen in 1976, near the middle of the country and on land not dominated by any of Nigeria’s largest peoples, as a symbol of unity.",
 more:"The city sits beneath Aso Rock, a granite dome about 400 m high that gives its name to the presidential villa. Lagos is still Nigeria’s biggest city and its business centre."}),
S({title:"Astana on the steppe",view:[52,40,82,56],globe:[71.4,48,3],card:"left",hi:["kz"],on:["timezones"],
 pins:[[[71.43,51.13],"Astana","point"],[[76.89,43.24],"Almaty: capital until 1997","point"]],
 phPins:[ph([71.4,51.0],"The steppe near Astana")],
 stat:"In 1997 Kazakhstan moved its capital nearly 1,000 km north, from Almaty to Astana",
 body:"Almaty sits in a corner of the country, squeezed against mountains near the Chinese border, with little room to grow and a risk of earthquakes. Astana, on the open steppe, was given a new skyline of towers by famous architects.",
 more:"The city has changed its name several times: Akmolinsk, Tselinograd, Akmola, Astana, Nur-Sultan from 2019 and Astana again since 2022. The time-zone layer is on: since March 2024 the whole of Kazakhstan keeps one clock."}),
S({title:"Naypyidaw: a capital of empty roads",view:[84,11,102,27],globe:[96,19.5,3.5],card:"left",hi:["mm"],gfRuler:{a:[96.16,16.8],b:[96.13,19.75]},
 pins:[[[96.13,19.75],"Naypyidaw","point"],[[96.16,16.8],"Yangon: capital until 2005","point"]],
 phPins:[ph([96.16,16.8],"Shwedagon Pagoda, Yangon")],
 stat:"Myanmar’s government moved to a brand-new capital, Naypyidaw, in November 2005",
 body:"The military government moved its ministries from Yangon to a site about 320 km to the north (the ruler), in the middle of the country. Naypyidaw, ‘abode of kings’, is huge and spread out, with roads up to 20 lanes wide that are often almost empty.",
 more:"Yangon is still Myanmar’s largest city. Naypyidaw’s Uppatasanti Pagoda is a near-copy of Yangon’s famous Shwedagon Pagoda."}),
S({title:"Putrajaya, the garden city",view:[94,-1,106,7.5],globe:[101.7,3,6],card:"left",hi:["my"],
 pins:[[[101.69,2.93],"Putrajaya","point"],[[101.69,3.15],"Kuala Lumpur","point"]],
 phPins:[ph([101.71,3.16],"Merdeka 118, Kuala Lumpur")],
 stat:"From 1999 Malaysia’s government moved its offices to Putrajaya, a new city 25 km south of Kuala Lumpur",
 body:"Kuala Lumpur was jammed with traffic, so the government built a new administrative centre on old oil-palm and rubber plantations. Putrajaya has grand domes, bridges and a large man-made lake.",
 more:"Kuala Lumpur is still officially the capital: parliament and the king’s palace are there. Putrajaya is a ‘seat of government’, a little like La Paz in Bolivia."}),
S({title:"Nusantara: a capital for Borneo",view:[93,-10,122,4],globe:[112,-3,3],card:"left",hi:["id"],gfRuler:{a:[106.85,-6.2],b:[116.7,-0.97]},
 pins:[[[116.7,-0.97],"Nusantara, East Kalimantan","point"],[[106.85,-6.2],"Jakarta","point"]],
 phPins:[ph([106.82,-6.18],"Jakarta"),ph([106.8,-6.2],"Flooded street, Jakarta")],
 stat:"Indonesia is building a new capital, Nusantara, in the forests of East Kalimantan on Borneo",
 body:"Jakarta, on Java, is crowded, polluted and sinking: parts of the north drop by more than 10 cm a year as groundwater is pumped out. A 2022 law named Nusantara, about 1,200 km away (drag the ruler), as the new capital, and the government aims to make it the ‘political capital’ by 2028.",
 more:"Building has slowed as budgets were cut, and until the president signs the order to move, Jakarta remains the capital. Critics worry about the forest and the Indigenous people who live on the site."}),
S({title:"Three capitals",view:[3,-37,34,-20],globe:[24,-29,3],card:"left",hi:["za"],gfRuler:{a:[18.42,-33.92],b:[28.19,-25.75]},
 pins:[[[28.19,-25.75],"Pretoria: the government","point"],[[18.42,-33.92],"Cape Town: parliament","point"],[[26.21,-29.12],"Bloemfontein: the appeal court","point"]],
 phPins:[ph([18.42,-33.93],"Cape Town and Table Mountain"),ph([28.05,-26.2],"Johannesburg")],
 stat:"South Africa shares its capital three ways: Pretoria for the government, Cape Town for parliament and Bloemfontein for the courts",
 body:"When four British colonies joined as the Union of South Africa in 1910, none would give up its status, so the jobs were shared out. The president works from the Union Buildings in Pretoria, while parliament sits in Cape Town.",
 more:"The Supreme Court of Appeal is in Bloemfontein, but the Constitutional Court, created in 1994, sits in Johannesburg. Cape Town and Pretoria are almost 1,300 km apart (drag the ruler)."}),
S({title:"La Paz: the highest seat of government",view:[-80,-25,-62,-9],globe:[-68,-17,4],card:"left",hi:["bo"],gfThr:{kind:"elev",v:3500},
 pins:[[[-68.13,-16.5],"La Paz, about 3,640 m","point"],[[-65.26,-19.04],"Sucre, the official capital","point"],[[-68.19,-16.51],"El Alto","point"]],
 phPins:[ph([-67.79,-16.62],"Illimani from La Paz"),ph([-68.11,-16.5],"La Paz cable car")],
 stat:"At about 3,640 m, La Paz is the highest seat of government in the world",
 body:"Bolivia’s constitution names Sucre as the capital, and the top courts sit there, but the president and parliament work in La Paz. The city fills a deep canyon cut into the Altiplano, the high plateau shown here as land above 3,500 m.",
 more:"Neighbouring El Alto, on the plateau above, is over 4,000 m up, and cable cars link the two. Among official capitals, Quito in Ecuador, at about 2,850 m, is the highest."}),
S({title:"The coldest capital",view:[80,38,124,56],globe:[105,47,2.5],card:"left",hi:["mn"],mode:"climate",
 pins:[[[106.92,47.92],"Ulaanbaatar","point"]],
 phPins:[ph([106.9,47.85],"Naadam on the steppe")],
 stat:"Ulaanbaatar, Mongolia’s capital, is the coldest capital city on Earth: over a whole year it averages below freezing",
 body:"The city sits about 1,350 m up, far from any ocean, under a huge winter high-pressure system centred over Siberia and Mongolia. January averages around −20 °C, yet summers are warm.",
 more:"Nearly half of all Mongolians live in the city, many in gers (felt tents) on its edges. Astana, Ottawa and Moscow are other famously cold capitals. The Climate map shows the cold, dry climate of the steppe."}),
S({title:"Not the biggest city",view:W,globe:[20,30,1],card:"left",on:["cities"],hi:["us","ca","au","br","ng","tr","pk","ch","nz","ma"],
 pins:[[[-75.7,45.42],"Ottawa, not Toronto","point"],[[32.85,39.93],"Ankara, not Istanbul","point"],[[73.05,33.69],"Islamabad, not Karachi","point"],[[7.45,46.95],"Bern, not Zürich","point"],[[174.78,-41.29],"Wellington, not Auckland","point"],[[-6.84,34.02],"Rabat, not Casablanca","point"]],
 phPins:[ph([-75.7,45.42],"Parliament Hill, Ottawa"),ph([32.84,39.93],"Anıtkabir, Ankara"),ph([73.04,33.73],"Faisal Mosque, Islamabad"),ph([174.78,-41.28],"The Beehive, Wellington")],
 stat:"In many countries the capital is not the largest city",
 body:"Washington is far smaller than New York, Ottawa than Toronto, and Ankara than Istanbul. Often the capital was a compromise between rival cities, or was moved away from a crowded old port to a more central or safer spot.",
 more:"Canberra, Brasília, Abuja, Islamabad, Bern (Switzerland’s ‘federal city’), Wellington and Rabat are all smaller than their country’s biggest city. The cities layer is on."}),
S({title:"Two capitals across a river",view:[13.9,-5.0,16.2,-3.6],globe:[15.3,-4.3,8],card:"left",hi:["cd","cg"],mode:"satellite",gfRuler:{a:[15.307,-4.31],b:[15.283,-4.273]},
 pins:[[[15.31,-4.33],"Kinshasa","point"],[[15.27,-4.26],"Brazzaville","point"]],
 stat:"Kinshasa and Brazzaville are the closest pair of capital cities in the world, apart from Rome and Vatican City",
 body:"They face each other across the Congo River, only a few kilometres apart (drag the ruler). Kinshasa is the capital of the Democratic Republic of the Congo, once ruled by Belgium; Brazzaville is the capital of the Republic of the Congo, once ruled by France.",
 more:"Together the two cities have about 20 million people, yet there is still no bridge between them: people cross by boat. Just upstream the river widens into the Pool Malebo, and just downstream it plunges into rapids."}),
S({title:"Now explore",view:W,globe:[20,20,1],
 stat:"Hover any country to see its name and its capital",
 body:"Try the capitals quiz to learn them all. The Governments map shows who rules from these cities, and the Geopolitics tour looks at why some places matter so much."})];

/* =====================================================================================================
   2. Energy of the world
   ===================================================================================================== */
const ENERGY=[
S({title:"Energy of the world",view:W,globe:[30,25,1],
 phPins:[ph([2.5,57.5],"North Sea oil rig"),ph([-102.5,31.8],"Oil pumpjack, Permian Basin"),ph([111.0,30.82],"Three Gorges Dam"),ph([-54.59,-25.41],"Itaipu Dam"),ph([-21.2,64.11],"Nesjavellir geothermal plant"),ph([-116.6,33.9],"Wind turbines, California"),ph([56.4,26.55],"Tanker in the Strait of Hormuz"),ph([112.4,39.3],"Coal power plant, Shanxi")],
 stat:"About four-fifths of the world’s energy still comes from burning oil, coal and gas",
 body:"Energy lights our homes, moves cars and ships and runs factories. This tour visits the oil fields and the sea lanes that carry fuel, then the rivers, volcanoes, deserts and seas where cleaner power is made.",
 more:"The world is in the middle of an energy transition: solar and wind power are growing faster than any energy source before them."}),
S({title:"Lights in the dark",view:W,globe:[20,25,1],card:"left",mode:"people",sub:"hdi",
 pins:[[[20,0],"Central Africa","point"],[[18.5,13.5],"Chad: about 1 person in 10 has power","point"]],
 stat:"Around 700 million people, most of them in sub-Saharan Africa, still have no electricity at home",
 body:"Electricity runs fridges for medicine, lights for homework and pumps for clean water. Where it is missing, people cook and light their homes with wood, charcoal and kerosene, and the smoke harms their health.",
 more:"The People map now shows human development (HDI): the countries with the lowest scores, mostly in Africa, are also where the fewest people have power. Small solar panels with batteries are now bringing light to many villages beyond the grid."}),
S({title:"Ghawar, the biggest oil field",view:[36,18,56,32],globe:[49,25,4],card:"left",hi:["sa"],on:["resources"],ghosts:[{code:"lb",at:[49.25,25.0],col:"#2a78d0",label:"Lebanon, same scale"}],
 pins:[[[49.2,25.4],"Ghawar","point"],[[49.68,25.94],"Abqaiq","point"],[[50.1,26.29],"Dhahran: oil struck 1938","point"]],
 stat:"Ghawar, in Saudi Arabia, is the largest conventional oil field ever found: about 280 km long",
 body:"It was discovered in 1948 and has produced more oil than any other field on Earth. Saudi Arabia’s first big oil strike came ten years earlier, in 1938, near Dhahran, and changed the kingdom for ever.",
 more:"Lebanon is drawn over the field at its true size: drag it to compare. The resources layer shows the oil and gas fields around the Persian Gulf, the richest oil region on Earth."}),
S({title:"Chokepoints",view:[-19,-10,106,42],globe:[60,18,1.6],card:"left",on:["connections"],
 pins:[[[56.4,26.55],"Strait of Hormuz","point"],[[101.5,2.5],"Strait of Malacca","point"],[[43.4,12.6],"Bab el-Mandeb","point"],[[32.35,30.5],"Suez Canal","point"]],
 phPins:[ph([32.55,30.0],"Ever Given in the Suez Canal")],
 stat:"About a fifth of the world’s oil passes through the Strait of Hormuz, about 40 km wide at its narrowest",
 body:"A chokepoint is a narrow passage that ships cannot easily avoid. Tankers from the Persian Gulf must pass Hormuz; those bound for China, Japan and Korea then squeeze through the Strait of Malacca, past Singapore.",
 more:"Malacca carries even more oil than Hormuz. Tankers heading for Europe use the Bab el-Mandeb and the Suez Canal, or sail all the way round Africa. The connections layer shows the shipping lanes and chokepoints."}),
S({title:"Pipelines across a continent",view:[-20,40,62,64],globe:[30,53,1.8],card:"left",on:["connections"],
 pins:[[[52.3,54.9],"Almetyevsk: Druzhba begins","point"],[[14.27,53.06],"Schwedt, Germany","point"],[[13.64,54.14],"Lubmin: Nord Stream comes ashore","point"]],
 stat:"The Druzhba (‘Friendship’) pipeline, built in the 1960s, carries oil about 4,000 km from Russia into central Europe",
 body:"Pipelines are the cheapest way to move oil and gas over land. Steel pipes, mostly buried, cross plains, rivers and mountains, and pumping stations push the oil along.",
 more:"Since 2022 most European countries have cut their imports of Russian oil and gas, and in September 2022 explosions under the Baltic Sea broke the Nord Stream gas pipes. On the map, brown dashes are oil pipelines and orange ones gas."}),
S({title:"Coal: the first and the last",view:[-18,47,6,60],globe:[-2,53,4],card:"left",hi:["gb"],
 pins:[[[-0.105,51.517],"Holborn Viaduct: power station, 1882","point"],[[-1.27,52.865],"Ratcliffe-on-Soar: closed 2024","point"],[[-2.49,52.64],"Coalbrookdale","point"]],
 phPins:[ph([7.04,51.49],"Zollverein coal mine, Essen")],
 stat:"Britain opened the world’s first coal-fired public power station in 1882, and closed its last one on 30 September 2024",
 body:"Coal drove the steam engines of the Industrial Revolution, and in 1913 Britain’s mines employed over a million people. In 1882 Thomas Edison’s company lit London streets from a coal-fired power station at Holborn Viaduct.",
 more:"Worldwide, coal still makes about a third of all electricity, more than any other single source, and China burns more than half of the world’s coal."}),
S({title:"Three Gorges",view:[94,22,118,36],globe:[109,30.5,3.5],card:"left",hi:["cn"],on:["rivers","resources"],
 lines:[{coords:[[111.0,30.82],[110.4,30.95],[109.6,31.03],[108.9,30.95],[108.4,30.8],[107.7,30.2],[107.0,29.75],[106.55,29.56]],kind:"flow"}],
 pins:[[[111.0,30.82],"Three Gorges Dam","point"],[[106.55,29.56],"Chongqing","point"]],
 phPins:[ph([110.3,31.0],"The Yangtze’s gorges")],
 stat:"The Three Gorges Dam on the Yangtze is the world’s biggest power station: 22,500 megawatts",
 body:"The dam is about 2.3 km long and 181 m high. Its reservoir (the arrow) stretches roughly 600 km upstream, almost to Chongqing, and more than a million people had to move to new homes.",
 more:"It also holds back floods and lets big ships sail far inland through locks and a giant ship lift. In 2025 China began building an even bigger hydropower project on the Yarlung Tsangpo in Tibet."}),
S({title:"Itaipu, a dam for two",view:[-70,-33,-46,-18],globe:[-55,-25,4],card:"left",hi:["br","py"],on:["resources"],
 pins:[[[-54.59,-25.41],"Itaipu Dam","point"],[[-54.44,-25.69],"Iguazu Falls","point"]],
 phPins:[ph([-54.6,-25.42],"Itaipu’s spillway")],
 stat:"Itaipu, on the border of Brazil and Paraguay, made about 103 billion kWh in 2016, then a world record for one power station",
 body:"The two countries built it together on the Paraná River and share its power equally. Paraguay uses only part of its half and sells the rest to Brazil, so almost all of Paraguay’s electricity is renewable.",
 more:"China’s Three Gorges beat the record in 2020. Itaipu’s lake drowned the Guaíra Falls in 1982, once among the most powerful waterfalls in the world. The Iguazu Falls, just downstream, still thunder."}),
S({title:"Iceland: heat from below",view:[-36,61,-10,68],globe:[-19,65,4],card:"left",hi:["is"],on:["plates","resources"],
 pins:[[[-21.94,64.15],"Reykjavík","point"],[[-21.2,64.11],"Nesjavellir","point"],[[-16.8,65.7],"Krafla","point"]],
 phPins:[ph([-22.45,63.88],"The Blue Lagoon")],
 stat:"Nine in ten homes in Iceland are heated with hot water from underground",
 body:"Iceland sits on the Mid-Atlantic Ridge, where two plates pull apart and hot magma rises close to the surface. Wells bring up steam and hot water to spin turbines and to heat homes, swimming pools and greenhouses.",
 more:"Almost all of Iceland’s electricity comes from hydropower and geothermal power. Some streets and pavements in Reykjavík are warmed from below to keep them free of ice."}),
S({title:"Sunshine in the desert",view:[-50,5,40,42],globe:[0,25,2],card:"left",on:["resources"],gfSun:{utc:12,day:172},
 pins:[[[-6.87,31.03],"Noor Ouarzazate, Morocco","point"]],
 stat:"In June the noon Sun stands almost straight overhead in the Sahara, one of the sunniest places on Earth",
 body:"Morocco’s Noor Ouarzazate, opened in stages from 2016, uses curved mirrors and a tower to focus sunlight and make steam that drives turbines; tanks of molten salt store heat so it can keep working after dark.",
 more:"Cheap solar panels are now the fastest-growing source of power in history, and the biggest solar parks are in China’s deserts and India’s Thar Desert. The yellow dot marks where the Sun is overhead: drag the time on the card."}),
S({title:"Wind over the North Sea",view:[-14,50,10,60],globe:[2,55,4],card:"left",hi:["gb","de","nl","dk","be"],on:["resources"],gfRuler:{a:[-0.08,54.11],b:[1.9,54.85]},
 pins:[[[1.9,54.85],"Dogger Bank wind farm","point"],[[1.79,53.89],"Hornsea","point"],[[11.4,54.95],"Vindeby: the first, 1991","point"]],
 phPins:[ph([2.5,57.5],"North Sea oil rig")],
 stat:"Dogger Bank, a shallow sandbank in the North Sea, is the site of what is set to be the world’s largest offshore wind farm",
 body:"Winds over the North Sea are strong and steady, and the water is shallow enough to fix turbines to the seabed. Britain, Germany, the Netherlands, Denmark and Belgium have built thousands of turbines there.",
 more:"The Dogger Bank turbines stand more than 130 km off the Yorkshire coast (drag the ruler). Denmark built the world’s first offshore wind farm, at Vindeby, in 1991."}),
S({title:"France: a nuclear nation",view:[-16,40,12,53],globe:[2.5,46.5,4],card:"left",hi:["fr"],hiSoft:["de"],on:["resources"],
 pins:[[[1.88,49.54],"Flamanville: newest reactor, 2024","point"],[[0.17,46.27],"Civaux","point"],[[4.75,45.07],"Rhône valley reactors","point"]],
 stat:"In 2025 about two-thirds of France’s electricity came from nuclear power, a bigger share than any other large country",
 body:"After the oil crisis of 1973, France built dozens of reactors in about 15 years; today it has 57. Its electricity is among the lowest-carbon in Europe, and in 2025 it sold a record amount to its neighbours.",
 more:"Germany chose the other way and closed its last three reactors in April 2023. Nuclear power makes no smoke, but its waste stays dangerous for thousands of years and must be stored with great care."}),
S({title:"Norway: oil money, electric cars",view:[-25,54,35,72],globe:[10,62,2.5],card:"left",mode:"gdp",sub:"percapita",
 pins:[[[3.2,56.55],"Ekofisk: oil found 1969","point"],[[10.75,59.91],"Oslo","point"]],
 phPins:[ph([11.56,59.89],"Electric car chargers")],
 stat:"In 2025 about 96% of new cars sold in Norway were fully electric",
 body:"Norway grew rich from North Sea oil and gas, first found in 1969, and saved much of the money in a state fund now worth about 2 trillion US dollars. At home, though, it runs on hydropower, and tax breaks made electric cars cheaper than petrol ones.",
 more:"The Wealth map shows money per person: Norway is among the richest countries on Earth. Its oil fund owns small slices of thousands of companies around the world."}),
S({title:"The energy transition",view:W,globe:[60,25,1],card:"left",on:["resources"],
 pins:[[[87.6,43.8],"Xinjiang: China’s biggest solar farm","point"],[[71.9,27.5],"Bhadla solar park, India","point"]],
 stat:"In the first half of 2025, renewables made more of the world’s electricity than coal for the first time",
 body:"Solar and wind are now the cheapest new power in most places, and China installs more solar panels each year than the rest of the world combined. Batteries store the power for when the Sun sets or the wind drops.",
 more:"Oil, coal and gas still supply most of the world’s energy overall, for cars, ships, planes, factories and heating, so the change has a long way to go. Power-plant icons on the map show nuclear, hydro, solar, wind and geothermal stations."}),
S({title:"Now explore",view:W,globe:[30,25,1],on:["resources"],
 stat:"Hover any icon to see what is mined, pumped or generated there",
 body:"The Resources and Connections switches on the World Maps page show the fields, mines, power plants, pipelines and shipping lanes. The Energy and resources tour visits the metals that batteries and phones need."})];

/* =====================================================================================================
   3. Money on the map
   ===================================================================================================== */
const MONEY=[
S({title:"Money on the map",view:W,globe:[20,20,1],
 phPins:[ph([138.13,9.52],"Stone money on Yap"),ph([-74.01,40.71],"Wall Street"),ph([114.17,22.29],"Hong Kong harbour"),ph([31.05,-17.83],"Harare"),ph([-62.72,17.3],"Basseterre, St Kitts"),ph([9.45,0.39],"Libreville"),ph([-79.52,8.98],"Panama City"),ph([90.4,23.8],"A Grameen Bank branch")],
 stat:"There are about 180 official currencies in the world, and some are shared by many countries",
 body:"Money began as shells, stones and lumps of metal, then became coins, paper notes and now numbers on a phone. This tour follows money from the first coins to the countries that share a currency, and to times when money lost all its value.",
 more:"Some countries use another country’s money, and a few have printed notes worth trillions that bought almost nothing."}),
S({title:"The first coins",view:[6,30,40,44],globe:[28,38.5,4],card:"left",mode:"history",sub:"bc500/per",
 pins:[[[28.04,38.49],"Sardis, capital of Lydia","point"]],
 stat:"The first coins were made in Lydia, in today’s Turkey, around 600 BC",
 body:"They were bean-shaped lumps of electrum, a natural mix of gold and silver, stamped with a lion’s head so people could trust their weight. King Croesus, who ruled from Sardis, later made coins of pure gold and pure silver.",
 more:"Persia conquered Lydia in 546 BC and spread coins across its empire (lit on this map of 500 BC), and Greek cities soon struck their own. ‘As rich as Croesus’ is still a saying."}),
S({title:"Stone money of Yap",view:[126,0,144,16],globe:[137,9,4],card:"left",hi:["fm","pw"],gfRuler:{a:[134.48,7.34],b:[138.13,9.52]},
 pins:[[[138.13,9.52],"Yap","point"],[[134.48,7.34],"Palau: where the stones were cut","point"]],
 phPins:[ph([138.1,9.55],"Stone money in a village")],
 stat:"On Yap, in Micronesia, money can be a stone disc taller than a person",
 body:"Yapese sailors cut the limestone discs, called rai, on Palau, more than 400 km away (drag the ruler), and brought them home by canoe and raft. A stone’s value came from its size and from how dangerous its voyage had been.",
 more:"The biggest stones are never moved: everyone simply remembers who owns them, rather like money in a bank account today. Elsewhere, cowrie shells from the Maldives were used as money from West Africa to China."}),
S({title:"Paper money from China",view:[70,15,128,45],globe:[105,32,2],card:"left",mode:"history",sub:"1000/chn",
 pins:[[[104.07,30.67],"Chengdu: the first notes","point"],[[114.31,34.8],"Kaifeng, the Song capital","point"]],
 stat:"Paper money began in China: traders in Sichuan used paper notes from around the year 1000, and the government took them over in 1024",
 body:"Sichuan’s iron coins were so heavy that merchants left them with deposit shops and carried paper receipts, called jiaozi, instead. The Song government soon printed official notes from carved blocks (the Song empire is lit on this map of 1000).",
 more:"In the 1200s Marco Polo was amazed that Kublai Khan’s empire ran on paper money. Europe’s first banknotes came from Sweden, in 1661."}),
S({title:"The pound sterling",view:[-20,48,6,60],globe:[-2,53,4],card:"left",hi:["gb"],
 pins:[[[-0.088,51.514],"Bank of England, London","point"]],
 phPins:[ph([-0.08,51.51],"The City of London")],
 stat:"The pound sterling is the oldest currency still in use: about 1,200 years old",
 body:"In Anglo-Saxon England, 240 silver pennies were made from a pound weight of silver, which is where the pound comes from. The Bank of England, founded in 1694 to lend money to the king, still issues England’s banknotes.",
 more:"Britain switched to decimal money on 15 February 1971; until then a pound had 20 shillings of 12 pence each. Banks in Scotland and Northern Ireland still print their own pound notes."}),
S({title:"Amsterdam’s stock exchange",view:W,globe:[40,20,1],card:"left",mode:"history",sub:"1650/ned",
 pins:[[[4.9,52.37],"Amsterdam","point"],[[106.81,-6.13],"Batavia (Jakarta)","point"],[[129.87,32.74],"Dejima, Nagasaki","point"],[[18.42,-33.92],"Cape Town, founded 1652","point"]],
 phPins:[ph([4.89,52.36],"Amsterdam’s canals")],
 stat:"In 1602 the Dutch East India Company sold shares to the public, and Amsterdam became the first modern stock market",
 body:"Anyone could buy a share in the company’s voyages to the spice islands of Asia and sell it on to someone else. Traders met every day at an exchange building opened in 1611, and the Bank of Amsterdam (1609) let merchants pay each other without moving coins.",
 more:"The History map lights up the Dutch trading empire around 1650, with bases from the Americas to Indonesia. Stock markets today, from New York to Mumbai, still work the same way."}),
S({title:"The euro",view:[-32,34,36,62],globe:[10,48,2.5],card:"left",
 hi:["at","be","bg","hr","cy","ee","fi","fr","de","gr","ie","it","lv","lt","lu","mt","nl","pt","sk","si","es"],hiSoft:["me","xk","ad","mc","sm","va"],
 pins:[[[8.68,50.11],"European Central Bank, Frankfurt","point"]],
 phPins:[ph([2.35,48.86],"Paris"),ph([12.34,45.43],"Venice")],
 stat:"Since 1 January 2026, 21 EU countries share the euro, used by more than 350 million people",
 body:"The euro was born in 1999, and its notes and coins arrived on 1 January 2002, replacing francs, marks, lire and more. Bulgaria became the 21st member in 2026. The European Central Bank in Frankfurt sets one interest rate for them all.",
 more:"Each country puts its own design on one side of its coins, but they can be spent anywhere in the euro area. Montenegro and Kosovo use the euro without being members, and Andorra, Monaco, San Marino and Vatican City use it by agreement (paler)."}),
S({title:"The CFA francs",view:[-46,-12,22,24],globe:[0,6,2.5],card:"left",
 G:[{t:"West African CFA franc",c:"#5b86d6",codes:["bj","bf","ci","gw","ml","ne","sn","tg"]},{t:"Central African CFA franc",c:"#e3a54a",codes:["cm","cf","td","cg","gq","ga"]}],
 pins:[[[-17.45,14.69],"Dakar: West African central bank","point"],[[11.5,3.87],"Yaoundé: Central African central bank","point"]],
 phPins:[ph([-4.01,5.33],"Abidjan"),ph([9.45,0.39],"Libreville")],
 stat:"Fourteen African countries use two CFA franc currencies, both tied to the euro",
 body:"The West African CFA franc is shared by eight countries and the Central African CFA franc by six; most of them were French colonies. Created in 1945, both are fixed at 655.957 francs to one euro, a link guaranteed by France.",
 more:"Supporters say the link keeps prices steady; critics say it ties the countries too closely to France. West African leaders agreed in 2019 to replace their franc with a new currency, the eco, which has not yet arrived."}),
S({title:"The Eastern Caribbean dollar",view:[-73,10,-57,20],globe:[-62,15.5,5],card:"left",hi:["ag","dm","gd","kn","lc","vc","ai","ms"],holes:[{circle:[-62.0,15.4],km:420}],
 pins:[[[-62.72,17.3],"Basseterre: the central bank","point"]],
 phPins:[ph([-62.72,17.29],"Basseterre’s harbour"),ph([-60.99,14.01],"Castries, St Lucia")],
 stat:"Eight Caribbean islands share one currency, fixed at 2.70 Eastern Caribbean dollars to the US dollar since 1976",
 body:"Six independent countries and two British territories, Anguilla and Montserrat, share a central bank in Basseterre, on St Kitts. For small islands, sharing a currency is cheaper and safer than each running its own.",
 more:"Trade, tourism and fishing link the islands, and one dollar makes it easy to pay across them. The link to the US dollar has now held for 50 years."}),
S({title:"Dollarisation",view:W,globe:[-80,5,1.2],card:"left",hi:["ec","sv","pa","tl","fm","pw","mh"],hiSoft:["zw"],
 pins:[[[-78.47,-0.18],"Ecuador: dollar since 2000","point"],[[-89.19,13.69],"El Salvador: since 2001","point"],[[-79.52,8.98],"Panama: since 1904","point"]],
 phPins:[ph([-79.52,8.98],"Panama City"),ph([-78.51,-0.22],"Quito")],
 stat:"Ecuador, El Salvador and Panama use the US dollar as their own money",
 body:"Panama has used the dollar since 1904, alongside its own balboa coins. Ecuador gave up its currency, the sucre, for the dollar in 2000 after a banking crash and soaring prices; El Salvador followed in 2001.",
 more:"Timor-Leste, the Marshall Islands, Micronesia and Palau use it too, and in Zimbabwe (paler) most payments are made in dollars. El Salvador made bitcoin legal money in 2021, but in 2025 dropped the rule that shops must accept it."}),
S({title:"Germany, 1923",view:[-12,42,28,58],globe:[10,51,3],card:"left",mode:"history",sub:"1919",
 pins:[[[13.4,52.52],"Berlin","point"]],
 phPins:[ph([13.38,52.52],"The Reichstag, Berlin")],
 stat:"In November 1923 one US dollar cost 4.2 trillion German marks",
 body:"After the First World War, Germany owed huge reparations and printed money to pay its bills. Prices doubled every few days; workers were paid twice a day and rushed out to spend their wages before they lost their value.",
 more:"Children built towers from bundles of worthless notes, and some people burned them for heat. A new currency, the Rentenmark, ended the crisis in late 1923, but the memory still shapes how many Germans think about money."}),
S({title:"Zimbabwe’s trillion-dollar notes",view:[14,-28,40,-12],globe:[30,-19,4],card:"left",hi:["zw"],
 pins:[[[31.05,-17.83],"Harare","point"]],
 phPins:[ph([31.05,-17.83],"Harare")],
 stat:"In 2009 Zimbabwe issued a 100-trillion-dollar banknote",
 body:"By late 2008 prices in Zimbabwe were doubling about every day, after farm output collapsed and the government printed money to cover its spending. Shops changed prices several times a day, and people switched to US dollars and South African rand.",
 more:"Zimbabwe dropped its own dollar in 2009 and has since tried new currencies several times; the latest, the ZiG (‘Zimbabwe Gold’), arrived in April 2024. The record still belongs to Hungary, where in 1946 prices doubled about every 15 hours."}),
S({title:"Venezuela’s lost zeros",view:[-84,-2,-58,16],globe:[-66,8,4],card:"left",hi:["ve"],hiSoft:["co"],
 pins:[[[-66.9,10.49],"Caracas","point"]],
 phPins:[ph([-66.88,10.53],"Caracas cable car")],
 stat:"Since 2008 Venezuela has knocked 14 zeros off its currency",
 body:"Venezuela earns most of its money from oil. When oil prices fell after 2014 and production collapsed, the government printed money and prices soared; by some estimates inflation passed a million per cent in 2018.",
 more:"The bolívar lost 3 zeros in 2008, 5 in 2018 and 6 in 2021, and many shops now take US dollars. Nearly 8 million Venezuelans have left the country, many of them for neighbouring Colombia."}),
S({title:"The market never sleeps",view:W,globe:[40,30,1],card:"left",on:["timezones"],gfSun:{utc:14,day:80},
 pins:[[[-74.01,40.71],"New York","point"],[[-0.09,51.51],"London","point"],[[139.77,35.68],"Tokyo","point"],[[114.17,22.28],"Hong Kong","point"],[[103.85,1.29],"Singapore","point"],[[151.21,-33.87],"Sydney","point"]],
 phPins:[ph([-74.01,40.7],"The New York Stock Exchange"),ph([103.86,1.28],"Marina Bay, Singapore")],
 stat:"About 9.6 trillion US dollars’ worth of currencies change hands every day",
 body:"Money markets follow the Sun around the planet: trading opens in Sydney and Tokyo, moves to Hong Kong and Singapore, then London, then New York, and begins again. London handles the biggest share of the world’s currency trading.",
 more:"The time-zone layer is on, and the shading shows night and day: drag the time on the card to see which markets are open. Undersea cables carry deals between these cities in a fraction of a second."}),
S({title:"Money on a phone",view:[16,-12,46,6],globe:[37,-1,4],card:"left",hi:["ke"],hiSoft:["tz","ug","rw"],
 pins:[[[36.82,-1.29],"Nairobi","point"]],
 phPins:[ph([36.82,-1.29],"Nairobi")],
 stat:"Most adults in Kenya send and receive money by mobile phone, with M-Pesa, launched in 2007",
 body:"Pesa is Swahili for money. With M-Pesa, people keep money on their SIM card, pay with a text message and swap cash at small shops, even without a bank account. It pays school fees, wages, taxi fares and electricity bills.",
 more:"Mobile money has spread across Africa and Asia; neighbouring Tanzania, Uganda and Rwanda use it widely too (paler). Many central banks are now testing digital versions of their own currencies."}),
S({title:"Now explore",view:W,globe:[20,20,1],mode:"gdp",sub:"total",
 stat:"Hover any country to see its name and its economy",
 body:"The Wealth map shows each country’s economy, in total or per person. Which countries that share a currency are rich, and which are poor? The GDP tour explains how the world’s money is shared out."})];

/* =====================================================================================================
   4. Conflicts and peace
   ===================================================================================================== */
const PEACE=[
S({title:"Conflicts and peace",view:W,globe:[20,25,1],
 phPins:[ph([-73.97,40.75],"The UN General Assembly"),ph([33.36,35.18],"The Green Line, Nicosia"),ph([126.68,37.96],"The DMZ at Panmunjom"),ph([-5.95,54.6],"A peace wall in Belfast"),ph([36.32,32.29],"Zaatari camp, Jordan"),ph([132.45,34.4],"Hiroshima Peace Memorial"),ph([-122.76,49.0],"The Peace Arch"),ph([103.15,19.43],"Plain of Jars, Laos")],
 stat:"The United Nations was founded in 1945 ‘to save succeeding generations from the scourge of war’",
 body:"Wars have shaped the map, but so has peacemaking: treaties, ceasefire lines, peacekeepers and courts. This tour visits places where people stopped fighting, lines that still divide some countries, and the long work of clearing up after war.",
 more:"Some of these places are disputed. GeoFlock shows borders and lines as they are on the ground and does not take sides in any claim."}),
S({title:"The Peace of Westphalia",view:[-12,44,20,58],globe:[8,52,4],card:"left",mode:"history",sub:"1650",gfRuler:{a:[7.63,51.96],b:[8.05,52.28]},
 pins:[[[7.63,51.96],"Münster","point"],[[8.05,52.28],"Osnabrück","point"]],
 stat:"In 1648 the Peace of Westphalia ended the Thirty Years’ War, one of the deadliest wars in Europe’s history",
 body:"For years, diplomats from across Europe negotiated in two towns, Catholic Münster and Protestant Osnabrück, about 45 km apart (drag the ruler). The treaties let rulers keep their state’s religion and recognised the Dutch Republic and Switzerland as independent.",
 more:"Westphalia is often called the birth of the modern idea that states are sovereign and equal, each ruling its own land without outside interference. The History map shows Europe around 1650."}),
S({title:"Blue helmets",view:[-84,-15,82,50],globe:[30,15,1.6],card:"left",
 pins:[[[-13.2,27.15],"MINURSO, Western Sahara","point"],[[33.36,35.17],"UNFICYP, Cyprus","point"],[[35.2,33.1],"UNIFIL, Lebanon","point"],[[35.85,33.0],"UNDOF, Golan Heights","point"],[[21.16,42.66],"UNMIK, Kosovo","point"],[[31.58,4.85],"UNMISS, South Sudan","point"],[[28.43,9.6],"UNISFA, Abyei","point"],[[18.56,4.36],"MINUSCA, Central African Republic","point"],[[29.22,-1.68],"MONUSCO, DR Congo","point"],[[74.8,34.08],"UNMOGIP, Kashmir","point"]],
 phPins:[ph([-73.97,40.75],"The UN Security Council")],
 stat:"Since 1948 more than 2 million people have served as UN peacekeepers",
 body:"Peacekeepers, called blue helmets after their headgear, come from many countries to watch over ceasefires, protect civilians and help countries hold elections. The first unarmed observers went to the Middle East in 1948, and the first armed force to Egypt’s Sinai in 1956.",
 more:"UN peacekeeping won the Nobel Peace Prize in 1988. Missions have shrunk since 2025 because of funding cuts, and the force in Lebanon (UNIFIL) is due to end at the close of 2026."}),
S({title:"Cyprus: the Green Line",view:[30.5,33.8,35.2,36.2],globe:[33.2,35.1,7],card:"left",hi:["cy"],
 lines:[{coords:[[32.7,35.17],[32.85,35.12],[33.0,35.12],[33.2,35.15],[33.3,35.18],[33.36,35.18],[33.45,35.17],[33.6,35.13],[33.75,35.09],[33.9,35.06]],kind:"red"}],
 pins:[[[33.36,35.18],"Nicosia: a divided capital","point"],[[33.62,34.92],"Larnaca","point"],[[33.32,35.34],"Kyrenia","point"]],
 phPins:[ph([33.32,35.34],"Kyrenia harbour")],
 stat:"Since 1974 a UN buffer zone, the Green Line, has run about 180 km across Cyprus",
 body:"After a coup backed by Greece’s military government and a Turkish military operation in 1974, the island was split between a Greek Cypriot south and a Turkish Cypriot north (red line). Only Turkey recognises the north as a separate state.",
 more:"UN peacekeepers have been on the island since 1964. In old Nicosia the zone is only a few metres wide in places. Since 2003 people can cross at checkpoints, and talks on reuniting the island continue on and off."}),
S({title:"Korea’s DMZ",view:[118,32,134,42],globe:[127,38,4.5],card:"left",gfRuler:{a:[126.15,37.75],b:[128.37,38.61]},
 pins:[[[126.68,37.96],"Panmunjom","point"],[[126.98,37.57],"Seoul","point"],[[125.75,39.02],"Pyongyang","point"]],
 phPins:[ph([126.68,37.95],"Panmunjom from the north")],
 stat:"The Korean War stopped in 1953 with an armistice, not a peace treaty",
 body:"Since 27 July 1953 a Demilitarized Zone about 4 km wide has run right across Korea (the ruler lies along it). At Panmunjom, soldiers of both sides stand a few metres apart, and talks between North and South have been held there many times.",
 more:"The two Koreas have grown very different: from space at night, South Korea glows with light while North Korea is mostly dark. Left alone for 70 years, the zone has become a refuge for rare animals such as red-crowned cranes."}),
S({title:"Kashmir",view:[60,28,82,40],globe:[75,34,4],card:"left",hiSoft:["in","pk","cn"],gfThr:{kind:"elev",v:5000},
 pins:[[[74.8,34.08],"Srinagar","point"],[[73.47,34.37],"Muzaffarabad","point"],[[77.1,35.4],"Siachen Glacier","point"]],
 phPins:[ph([74.57,31.6],"The Wagah border ceremony")],
 stat:"Kashmir is claimed in full by both India and Pakistan, and part of it is held by China",
 body:"Since 1947 India and Pakistan have disputed the former princely state of Jammu and Kashmir. A Line of Control, agreed in 1972, separates the parts each administers, and UN military observers have watched the ceasefire line since 1949.",
 more:"China administers Aksai Chin, in the east, which India also claims. The map shows land above 5,000 m: troops face each other on the Siachen Glacier, up to about 6,000 m high, the highest battlefield on Earth. GeoFlock does not take sides in these claims."}),
S({title:"Clearing hidden bombs",view:[86,6,112,26],globe:[103,18,4],card:"left",hi:["la"],hiSoft:["kh","vn"],
 pins:[[[103.15,19.43],"Plain of Jars","point"],[[102.6,17.97],"Vientiane","point"]],
 stat:"Laos is the most heavily bombed country per person in history",
 body:"Between 1964 and 1973, during the Vietnam War, more than 2 million tonnes of bombs fell on Laos. Millions of small cluster bomblets never exploded, and teams are still clearing them from fields and villages.",
 more:"Landmines and old bombs also lie in Cambodia, Afghanistan, Angola, Bosnia and elsewhere. The Mine Ban Treaty, signed in Ottawa in 1997, has been joined by more than 150 countries, though Finland, Poland and the Baltic states left it in 2025–26, citing security fears."}),
S({title:"Refugees: where people go",view:W,globe:[40,20,1],card:"left",hi:["co","de","tr","ug","ir"],
 lines:[{coords:[[-66.9,10.5],[-74.1,4.7]],kind:"flow"},{coords:[[37.2,36.2],[37.4,37.5]],kind:"flow"},{coords:[[69.2,34.5],[59.6,36.3]],kind:"flow"},{coords:[[69.2,34.5],[71.6,33.6]],kind:"flow"},{coords:[[25.0,13.5],[20.8,13.7]],kind:"flow"},{coords:[[32.5,15.6],[31.2,29.9]],kind:"flow"},{coords:[[31.6,4.85],[32.3,2.6]],kind:"flow"},{coords:[[30.5,50.45],[21.0,52.2]],kind:"flow"}],
 pins:[[[36.32,32.29],"Zaatari camp, Jordan","point"],[[22.77,49.78],"Przemyśl, Poland","point"]],
 phPins:[ph([36.32,32.29],"Zaatari camp"),ph([22.77,49.78],"Refugees at Przemyśl")],
 stat:"About 118 million people had been forced from their homes at the end of 2025",
 body:"Most of them never leave their own country. Of those who cross a border as refugees, about two-thirds stay in a country next door: Venezuelans in Colombia, Syrians in Türkiye, Afghans in Iran and Pakistan, Sudanese in Chad and Egypt (arrows).",
 more:"The biggest host countries at the end of 2025 were Colombia, Germany, Türkiye, Uganda and Iran (highlighted). Jordan’s Zaatari camp, opened in 2012 for Syrians, grew into a town with schools, shops and streets."}),
S({title:"Neutral ground",view:[-30,34,40,70],globe:[10,50,2],card:"left",mode:"politics",sub:"clubs",
 pins:[[[6.14,46.2],"Geneva","point"],[[7.45,46.95],"Bern","point"],[[16.37,48.21],"Vienna","point"]],
 phPins:[ph([6.16,46.21],"Geneva’s lake and fountain")],
 stat:"Switzerland’s neutrality was recognised in 1815, and it has not fought a foreign war since",
 body:"Its neutrality made Geneva a meeting place for peace: the Red Cross was founded there in 1863, the first Geneva Convention on caring for wounded soldiers was signed in 1864, and the UN has its European headquarters there today.",
 more:"This map shows who belongs to the EU and NATO. Austria, Ireland, Malta, Cyprus and Switzerland stay outside NATO, while Finland (2023) and Sweden (2024) ended long neutrality and joined it. Far away, Costa Rica abolished its army in 1948."}),
S({title:"The Good Friday Agreement",view:[-12.5,52,-3,56.5],globe:[-6.5,54.5,6],card:"left",hi:["ie"],hiSoft:["gb"],
 pins:[[[-5.93,54.6],"Belfast","point"],[[-6.26,53.35],"Dublin","point"],[[-7.31,54.99],"Derry/Londonderry","point"]],
 phPins:[ph([-5.95,54.6],"A peace wall in Belfast")],
 stat:"The Good Friday Agreement of 10 April 1998 brought peace to Northern Ireland after 30 years of the Troubles",
 body:"About 3,500 people died in the Troubles, a conflict between those who wanted Northern Ireland to stay in the United Kingdom and those who wanted it to join Ireland. The agreement set up power-sharing between the two communities, and voters North and South backed it in May 1998.",
 more:"Today people cross the border without checks, but in Belfast some ‘peace walls’ still separate neighbourhoods. John Hume and David Trimble shared the 1998 Nobel Peace Prize."}),
S({title:"Colombia’s peace deal",view:[-96,0,-64,26],globe:[-78,13,3],card:"left",hi:["co"],hiSoft:["cu"],gfRuler:{a:[-82.37,23.13],b:[-74.07,4.71]},
 pins:[[[-82.37,23.13],"Havana: the talks, 2012–16","point"],[[-74.07,4.71],"Bogotá","point"],[[-75.51,10.42],"Cartagena","point"]],
 phPins:[ph([-82.35,23.14],"Old Havana"),ph([-75.55,10.42],"Cartagena")],
 stat:"In 2016 Colombia’s government and the FARC rebels signed a peace deal after more than 50 years of war",
 body:"The talks took four years in Havana, Cuba, about 2,200 km from Bogotá (drag the ruler). Voters narrowly rejected the first deal in October 2016; a revised one was signed in November and approved by Congress.",
 more:"About 13,000 FARC members laid down their arms, and the group became a political party. President Juan Manuel Santos won the 2016 Nobel Peace Prize. Other armed groups still fight in parts of the country."}),
S({title:"Settled in court",view:[-25,0,20,56],globe:[6,30,1.8],card:"left",hi:["cm"],hiSoft:["ng","nl"],
 pins:[[[4.3,52.09],"The Peace Palace, The Hague","point"],[[8.65,4.6],"Bakassi peninsula","point"]],
 stat:"In 2002 the International Court of Justice ruled that the Bakassi peninsula belonged to Cameroon, and Nigeria handed it over peacefully",
 body:"The court, in the Peace Palace in The Hague, settles disputes between countries. Nigeria and Cameroon had clashed over the oil-rich peninsula, but after the ruling they agreed a handover, completed in 2008.",
 more:"The Peace Palace opened in 1913, paid for by the businessman Andrew Carnegie. Border quarrels from Central America to Southeast Asia have been settled by the court instead of by war."}),
S({title:"The world’s longest border",view:[-162,30,-68,62],globe:[-100,50,1.8],card:"left",hi:["us","ca"],gfRuler:{a:[-123.32,49.0],b:[-95.15,49.0]},
 pins:[[[-122.76,49.0],"The Peace Arch","point"],[[-76.5,44.2],"The Great Lakes","point"]],
 phPins:[ph([-122.76,49.0],"The Peace Arch")],
 stat:"The border between Canada and the United States, 8,891 km long, is the longest between any two countries",
 body:"For about 2,000 km it follows a straight line, the 49th parallel, agreed in 1818 and 1846 (the ruler measures it). The Rush–Bagot Agreement of 1817 limited warships on the Great Lakes, and the two countries have not fought each other since the War of 1812.",
 more:"At the Peace Arch, on the border south of Vancouver, the gates stand open under the words ‘May these gates never be closed’."}),
S({title:"Now explore",view:W,globe:[20,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"The Politics map shows alliances and how countries are governed, and the History tours tell the stories of the wars behind today’s borders. Which border near you was once fought over, and which was settled in peace?"})];

const TOURS={
 capitals:{name:"Guided tour on capital cities",short:"Capital cities",hint:"Capitals built from scratch, capitals on the move, three capitals in one country, the highest and the coldest",steps:CAP},
 energy:{name:"Guided tour on energy of the world",short:"Energy of the world",hint:"The biggest oil field, chokepoints and pipelines, giant dams, volcano heat, desert sun, North Sea wind and nuclear France",steps:ENERGY},
 currencies:{name:"Guided tour on money on the map",short:"Money on the map",hint:"The first coins, stone money, paper from China, shared currencies, the dollar abroad and money that lost its value",steps:MONEY},
 conflicts:{name:"Guided tour on conflicts and peace",short:"Conflicts and peace",hint:"Westphalia, blue helmets, the Green Line, the DMZ, Kashmir, refugees and peace deals from Belfast to Bogotá",steps:PEACE}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))].filter(m=>m!=="relief");
 PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"power",col:COL[id],steps:T.steps.map(fix),stopModes:modes.length>0,alsoOn:modes};
 if(typeof psLock==="function")PS_TOURS[id].steps.forEach(o=>{if(o.card)psLock(o,"card",o.card)})});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- a stop's sub-map (sub:"…") follows the stop's own mode, not only the tour's ----------
   The shared psSetSub reads the tour's map mode; here a stop on the Politics, History, Wealth or Population map gets its own sub. */
if(typeof psSetSub==="function"){const _ss=psSetSub;psSetSub=function(sub){try{if(mine()&&sub){const St=psSteps()[ps.i],T=PS_TOURS[ps.tour],m=St&&St.mode;
 if(m==="gdp"||m==="population"||m==="people"){if(typeof allMapsSubMode!=="undefined"&&allMapsSubMode[m]!==sub){allMapsSubMode[m]=sub;document.querySelectorAll("#allMapsSubModes [data-allmaps-sub]").forEach(x=>x.classList.toggle("active",x.dataset.allmapsSub===sub));try{applyAllMapsColorMode(document.getElementById("allMapsWrap"))}catch(e){}try{if(typeof amGlobeOn==="function"&&amGlobeOn())amGlobeSync()}catch(e){}try{if(ps.g)ps.g.render()}catch(e){}}return}
 if(m&&T&&T.map&&T.map.mode!==m){const m0=T.map.mode;T.map.mode=m;try{return _ss.apply(this,arguments)}finally{T.map.mode=m0}}}}catch(e){console.error(e)}return _ss.apply(this,arguments)}}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.capitals={mid:[
 {at:"Canberra, the compromise",st:"Canberra, the compromise",q:"Canberra was built as a compromise between which two cities?",o:["Perth and Adelaide","Sydney and Melbourne","Brisbane and Darwin","Sydney and Brisbane"],a:1,why:"Both wanted to be the capital, so a new city was built between them.",kc:"au"},
 {at:"Brasília: built in 41 months",st:"Brasília: built in 41 months",q:"Which city was Brazil’s capital before Brasília?",o:["São Paulo","Salvador","Rio de Janeiro","Belo Horizonte"],a:2,why:"Brasília replaced Rio on 21 April 1960.",kc:"br"},
 {at:"Astana on the steppe",st:"Astana on the steppe",q:"From which city did Kazakhstan move its capital to Astana in 1997?",o:["Almaty","Tashkent","Bishkek","Shymkent"],a:0,why:"Almaty, in the far south-east, is still the biggest city.",kc:"kz"},
 {at:"La Paz: the highest seat of government",st:"La Paz: the highest seat of government",q:"Which city does Bolivia’s constitution name as the capital?",o:["La Paz","Santa Cruz","Sucre","Cochabamba"],a:2,why:"The government works in La Paz, but Sucre is the official capital.",kc:"bo"}],
 recap:[
 {q:"Which country is building a new capital called Nusantara?",o:["Malaysia","Indonesia","the Philippines","Brunei"],a:1,why:"On Borneo, about 1,200 km from Jakarta.",st:"Nusantara: a capital for Borneo",kc:"id"},
 {q:"Which country has three capitals: Pretoria, Cape Town and Bloemfontein?",o:["Namibia","Botswana","South Africa","Zimbabwe"],a:2,why:"The government, parliament and appeal court sit in different cities.",st:"Three capitals",kc:"za"},
 {q:"Which is the coldest national capital?",o:["Ottawa","Moscow","Reykjavík","Ulaanbaatar"],a:3,why:"Mongolia’s capital averages below freezing over a year.",st:"The coldest capital",kc:"mn"},
 {q:"Nigeria’s capital moved from Lagos to…",o:["Kano","Abuja","Ibadan","Port Harcourt"],a:1,why:"A planned city near the centre of the country, from 1991.",st:"Abuja, in the middle",kc:"ng"}]};
TOURQ.energy={mid:[
 {at:"Ghawar, the biggest oil field",st:"Ghawar, the biggest oil field",q:"In which country is Ghawar, the largest conventional oil field?",o:["Iraq","Kuwait","Saudi Arabia","Iran"],a:2,why:"It is about 280 km long and was found in 1948.",kc:"sa"},
 {at:"Chokepoints",st:"Chokepoints",q:"About a fifth of the world’s oil passes through which strait?",o:["Gibraltar","Hormuz","Bosporus","Dover"],a:1,why:"Tankers leaving the Persian Gulf have no other sea route.",kc:"om"},
 {at:"Iceland: heat from below",st:"Iceland: heat from below",q:"How are most homes in Iceland heated?",o:["Coal","Wood","Hot water from underground","Nuclear power"],a:2,why:"Iceland sits on the Mid-Atlantic Ridge, with hot rock close to the surface.",kc:"is"},
 {at:"France: a nuclear nation",st:"France: a nuclear nation",q:"About how much of France’s electricity comes from nuclear power?",o:["A tenth","A third","Two-thirds","All of it"],a:2,why:"France has 57 reactors.",kc:"fr"}],
 recap:[
 {q:"Which two countries share the Itaipu Dam?",o:["Brazil and Argentina","Brazil and Paraguay","Argentina and Uruguay","Paraguay and Bolivia"],a:1,why:"It stands on the Paraná River on their border.",st:"Itaipu, a dam for two",kc:"py"},
 {q:"Which country closed its last coal power station in 2024, 142 years after opening the first?",o:["Germany","The United Kingdom","France","Poland"],a:1,why:"Ratcliffe-on-Soar closed on 30 September 2024.",st:"Coal: the first and the last",kc:"gb"},
 {q:"In which country were about 96% of new cars sold in 2025 fully electric?",o:["China","Netherlands","Norway","Iceland"],a:2,why:"Tax breaks made electric cars cheaper than petrol ones.",st:"Norway: oil money, electric cars",kc:"no"}]};
TOURQ.currencies={mid:[
 {at:"The first coins",st:"The first coins",q:"The first coins were made in Lydia. Which country is it in today?",o:["Greece","Egypt","Turkey","Iran"],a:2,why:"Its capital, Sardis, is in western Turkey.",kc:"tr"},
 {at:"Paper money from China",st:"Paper money from China",q:"Which country first used paper money?",o:["Italy","China","India","Sweden"],a:1,why:"The jiaozi notes of Sichuan, around the year 1000.",kc:"cn"},
 {at:"The euro",st:"The euro",q:"Which country became the 21st member of the euro in 2026?",o:["Poland","Romania","Bulgaria","Czechia"],a:2,why:"It joined on 1 January 2026.",kc:"bg"},
 {at:"Dollarisation",st:"Dollarisation",q:"Which South American country uses the US dollar as its own money?",o:["Peru","Ecuador","Chile","Bolivia"],a:1,why:"It gave up the sucre in 2000.",kc:"ec"}],
 recap:[
 {q:"What is the oldest currency still in use?",o:["The US dollar","The Swiss franc","The pound sterling","The Japanese yen"],a:2,why:"It goes back about 1,200 years.",st:"The pound sterling",kc:"gb"},
 {q:"Which country printed a 100-trillion-dollar note in 2009?",o:["Venezuela","Zimbabwe","Hungary","Argentina"],a:1,why:"Prices there were doubling about every day in late 2008.",st:"Zimbabwe’s trillion-dollar notes",kc:"zw"},
 {q:"M-Pesa, a way to pay by mobile phone, began in which country?",o:["Nigeria","South Africa","Kenya","India"],a:2,why:"It was launched in 2007; pesa is Swahili for money.",st:"Money on a phone",kc:"ke"},
 {q:"In which city did the first modern stock market begin, in 1602?",o:["London","Venice","Amsterdam","Antwerp"],a:2,why:"People bought and sold shares in the Dutch East India Company.",st:"Amsterdam’s stock exchange",kc:"nl"}]};
TOURQ.conflicts={mid:[
 {at:"The Peace of Westphalia",st:"The Peace of Westphalia",q:"Which war did the Peace of Westphalia end in 1648?",o:["The Hundred Years’ War","The Thirty Years’ War","The Seven Years’ War","The Napoleonic Wars"],a:1,why:"It was signed at Münster and Osnabrück, in today’s Germany.",kc:"de"},
 {at:"Cyprus: the Green Line",st:"Cyprus: the Green Line",q:"What is Cyprus’s Green Line?",o:["A railway","A UN buffer zone","A river","A hiking trail"],a:1,why:"It has divided the island since 1974.",kc:"cy"},
 {at:"Korea’s DMZ",st:"Korea’s DMZ",q:"How did the Korean War stop in 1953?",o:["With a peace treaty","With an armistice","With a referendum","It never stopped"],a:1,why:"An armistice is a ceasefire; no peace treaty has been signed.",kc:"kr"}],
 recap:[
 {q:"Which country is the most heavily bombed per person in history?",o:["Vietnam","Laos","Cambodia","Afghanistan"],a:1,why:"More than 2 million tonnes of bombs fell on it in 1964–73.",st:"Clearing hidden bombs",kc:"la"},
 {q:"In which city were the Colombian peace talks held?",o:["Bogotá","Havana","Oslo","Caracas"],a:1,why:"From 2012 to 2016, about 2,200 km from Bogotá.",st:"Colombia’s peace deal",kc:"co"},
 {q:"Where was the Red Cross founded, in 1863?",o:["Vienna","Paris","Geneva","Oslo"],a:2,why:"Neutral Switzerland became a meeting place for peace.",st:"Neutral ground",kc:"ch"},
 {q:"Which two countries share the world’s longest international border?",o:["Russia and China","Canada and the United States","Chile and Argentina","Russia and Kazakhstan"],a:1,why:"It is 8,891 km long.",st:"The world’s longest border",kc:"ca"}]};
}}catch(e){}

/* ---------- photos: card photos by "tour|stop", photo pins by label (Commons file names) ---------- */
const CARD={
 "capitals|Capital cities":"Brazilian National Congress.jpg","capitals|Washington, D.C.":"US Capitol west side.JPG","capitals|Canberra, the compromise":"Parliament House at dusk, Canberra ACT.jpg",
 "capitals|Brasília: built in 41 months":"Brasilia aerea estadionacional.jpg","capitals|Federal capitals: neutral ground":"United States Capitol.jpg","capitals|Abuja, in the middle":"Aso Rock as seen from the IBB golf course in Abuja, Nigeria.jpg",
 "capitals|Astana on the steppe":"Night at Esil District, Astana (P1190721).jpg","capitals|Naypyidaw: a capital of empty roads":"Naypyidaw -- Uppatasanti Pagoda Plaza at sunset.JPG",
 "capitals|Putrajaya, the garden city":"Kuala Lumpur Malaysia-Istana Negara-Jalan-Duta-03.jpg","capitals|Nusantara: a capital for Borneo":"Jakarta skyline 2.jpg",
 "capitals|Three capitals":"Cape Town (ZA), Wale Street -- 2024 -- 3544.jpg","capitals|La Paz: the highest seat of government":"Panorama La Paz, Bolivia (24473584779).jpg",
 "capitals|The coldest capital":"Ulaanbaatar skyline from Sukhbaatar square in 2025.jpg","capitals|Not the biggest city":"Centre Block - Parliament Hill.jpg",
 "energy|Energy of the world":"North Sea oil rig.jpg","energy|Lights in the dark":"Europe at Night 2014-2015 (SVS30693 - france night lights 201410-201504).tiff","energy|Ghawar, the biggest oil field":"Oil pumpjack in the Permian Basin.jpg",
 "energy|Chokepoints":"Tanker in the Strait of Hormuz.jpg","energy|Pipelines across a continent":"Oil pumpjack in the Permian Basin.jpg","energy|Coal: the first and the last":"Shuozhou coal power plant.JPG",
 "energy|Three Gorges":"ThreeGorgesDam-China2009.jpg","energy|Itaipu, a dam for two":"Itaipu Dam 4084 filtered (1).jpg","energy|Iceland: heat from below":"1990 wurde das Geothermiekraftwerk Nesjavellir fertiggestellt. 03.jpg",
 "energy|Sunshine in the desert":"Sahara satellite hires.jpg","energy|Wind over the North Sea":"Wind turbines along North Middle Road, Essex County, Ontario, 2025-06-29.jpg","energy|France: a nuclear nation":"Nuclear power station cooling towers.jpg",
 "energy|Norway: oil money, electric cars":"Tesla charging stations insperia2.jpg","energy|The energy transition":"Wind turbines in southern California.jpg",
 "currencies|Money on the map":"Yap Stone Money.jpg","currencies|Stone money of Yap":"Yap Stone Money.jpg","currencies|The pound sterling":"Tower of London from the Shard (8515883950).jpg",
 "currencies|Amsterdam’s stock exchange":"KeizersgrachtReguliersgrachtAmsterdam.jpg","currencies|The CFA francs":"Le Plateau depuis le Pont ADO – Abidjan.jpg","currencies|The Eastern Caribbean dollar":"St. Kitts Basseterre Port Zante.jpg",
 "currencies|Dollarisation":"Panama City Skyline 2017.jpg","currencies|Germany, 1923":"Reichstag building Berlin view from west before sunset.jpg","currencies|Zimbabwe’s trillion-dollar notes":"Harare Skyline.jpg",
 "currencies|Venezuela’s lost zeros":"Teleferico de Caracas Warairarepano cablecar Avila Venezuela 4.jpg","currencies|The market never sleeps":"Wall Street - New York Stock Exchange.jpg","currencies|Money on a phone":"KICC nairobi kenya.jpg",
 "currencies|The euro":"European Parliament Strasbourg Hemicycle - Diliff.jpg",
 "conflicts|Conflicts and peace":"United Nations General Assembly Hall (3).jpg","conflicts|Blue helmets":"UN Security Council Nov 16 2023.jpg","conflicts|Cyprus: the Green Line":"Nicosia Green Line 31.JPG",
 "conflicts|Korea’s DMZ":"Demilitarized Zone (DMZ) Joint Security Area (JSA) Looking Into North Korea (28819154694).jpg","conflicts|Clearing hidden bombs":"20171115 Plain of Jars Laos 2540 DxO.jpg",
 "conflicts|Refugees: where people go":"Zaatari Refugee Camp John Green 18.png","conflicts|Neutral ground":"Arc-en-ciel sur le jet d'eau de Genève - GT 2025.jpg","conflicts|The Good Friday Agreement":"Belfast peace wall.jpg",
 "conflicts|Colombia’s peace deal":"Cerro de Monserrate en Bogotá.JPG","conflicts|The world’s longest border":"Peace-Arch-3614 edit.jpg","conflicts|Kashmir":"Lowering of the flags at the Wagah border.jpg"};
const PIN={
 /* capitals */
 "Brazil’s National Congress":"Brazilian National Congress.jpg","Parliament House, Canberra":"Parliament House at dusk, Canberra ACT.jpg","The US Capitol":"United States Capitol.jpg",
 "Aso Rock, Abuja":"Aso Rock as seen from the IBB golf course in Abuja, Nigeria.jpg","Astana at night":"Night at Esil District, Astana (P1190721).jpg","Uppatasanti Pagoda, Naypyidaw":"Naypyidaw -- Uppatasanti Pagoda Plaza at sunset.JPG",
 "La Paz":"Panorama La Paz, Bolivia (24473584779).jpg","Ulaanbaatar":"Ulaanbaatar skyline from Sukhbaatar square in 2025.jpg","The Washington Monument":"Washington Monument 2022.jpg",
 "Sydney Harbour":"Sydney Opera House and Harbour Bridge Dusk (3) 2019-06-21.jpg","Brasília Cathedral":"Catedral Metropolitana de Brasília - Brasília - 20150603150521.jpg","Rio de Janeiro":"Copacabana, Rio de Janeiro, Brazil.jpg",
 "Abuja National Mosque":"Abuja National Mosque.jpg","Lagos":"Lagos skyline.jpg","The steppe near Astana":"Astana-steppe-7748.jpg","Shwedagon Pagoda, Yangon":"Shwedagon Zedi Daw Yangon 4.jpg",
 "Merdeka 118, Kuala Lumpur":"Merdeka PNB 118, Kuala Lumpur.jpg","Jakarta":"Jakarta Panorama.jpg","Flooded street, Jakarta":"Banjir Jakarta Perumahan di Tanjung Duren 1 Januari 2020.jpg",
 "Cape Town and Table Mountain":"Cape Town (ZA), Table Mountain -- 2024 -- 2825.jpg","Johannesburg":"Johannesburg-city-skyline-night.jpg","Illimani from La Paz":"Illimani from the outskirts La Paz.jpg",
 "La Paz cable car":"Línea Roja de Mi Teleférico en La Paz, Bolivia.jpg","Naadam on the steppe":"Festiwal Naadam na stepie na obrzeżach Ułan Bator 35.JPG","Parliament Hill, Ottawa":"Centre Block - Parliament Hill.jpg",
 "Anıtkabir, Ankara":"Anıtkabir in Ankara Turkey by Mardetanha edited.JPG","Faisal Mosque, Islamabad":"Faisal Mosque, Shah Faisal Ave, E-8, Islamabad, Islamabad Capital Territory 44000.jpg","The Beehive, Wellington":"Beehive, Wellington, New Zealand.jpg",
 /* energy */
 "North Sea oil rig":"North Sea oil rig.jpg","Oil pumpjack, Permian Basin":"Oil pumpjack in the Permian Basin.jpg","Three Gorges Dam":"ThreeGorgesDam-China2009.jpg","Itaipu Dam":"Itaipu Dam 4084 filtered (1).jpg",
 "Nesjavellir geothermal plant":"1990 wurde das Geothermiekraftwerk Nesjavellir fertiggestellt. 03.jpg","Wind turbines, California":"Wind turbines in southern California.jpg","Tanker in the Strait of Hormuz":"Tanker in the Strait of Hormuz.jpg",
 "Coal power plant, Shanxi":"Shuozhou coal power plant.JPG","Ever Given in the Suez Canal":"Container Ship 'Ever Given' stuck in the Suez Canal, Egypt - March 24th, 2021 cropped.jpg","Zollverein coal mine, Essen":"Zollverein Coal Mine, Essen.jpg",
 "The Yangtze’s gorges":"Three gorges on the Yangtze river.jpg","Itaipu’s spillway":"Usina Hidroelétrica Itaipu Binacional - Itaipu Dam (17174796329).jpg","The Blue Lagoon":"Blue Lagoon with Þorbjörn, Iceland, 20230430 1626 3692.jpg",
 "Solar panels":"Baldock Solar Highway aerial 3 (7264413934).jpg","Cooling towers":"Nuclear power station cooling towers.jpg","Electric car chargers":"Tesla charging stations insperia2.jpg",
 /* money */
 "Stone money on Yap":"Yap Stone Money.jpg","Wall Street":"Wall Street - New York Stock Exchange.jpg","Hong Kong harbour":"Hong Kong Harbour Night 2019-06-11.jpg","Harare":"Harare Skyline.jpg",
 "Basseterre, St Kitts":"St. Kitts Basseterre Port Zante.jpg","Libreville":"Libreville1.jpg","Panama City":"Panama City Skyline.jpg","A Grameen Bank branch":"Grameen Bank branch.jpg",
 "Stone money in a village":"Community house of Yorlap (Yap Islands) with stone money made in Palau NOAA.jpg","The City of London":"Tower of London from the Shard (8515883950).jpg","Amsterdam’s canals":"Colorful canal houses at golden hour in Damrak avenue Amsterdam the Netherlands.jpg",
 "Paris":"Pantheon of Paris 007.JPG","Venice":"Rialto 2025 4.jpg","Abidjan":"Le Plateau depuis le Pont ADO – Abidjan.jpg","Basseterre’s harbour":"St. Kitts Basseterre Port Zante.jpg","Castries, St Lucia":"CastriesStLucia.JPG",
 "Quito":"Iglesia de San Francisco, Quito, Ecuador, 2015-07-22, DD 217-219 HDR.JPG","The Reichstag, Berlin":"Reichstag building Berlin view from west before sunset.jpg","Caracas cable car":"Teleferico de Caracas Warairarepano cablecar Avila Venezuela 4.jpg",
 "The New York Stock Exchange":"New York Stock Exchange August 2017 02.jpg","Marina Bay, Singapore":"Marina Bay Singapore-3499.jpg","Nairobi":"KICC nairobi kenya.jpg",
 /* conflicts */
 "The UN General Assembly":"United Nations General Assembly Hall (3).jpg","The Green Line, Nicosia":"Nicosia Green Line 31.JPG","The DMZ at Panmunjom":"Demilitarized Zone (DMZ) Joint Security Area (JSA) Looking Into North Korea (28819154694).jpg",
 "A peace wall in Belfast":"Belfast peace wall.jpg","Zaatari camp, Jordan":"Zaatari Refugee Camp John Green 18.png","Hiroshima Peace Memorial":"Genbaku Dome04-r.JPG","The Peace Arch":"Peace-Arch-3614 edit.jpg",
 "Plain of Jars, Laos":"20171115 Plain of Jars Laos 2540 DxO.jpg","The UN Security Council":"UN Security Council Nov 16 2023.jpg","Kyrenia harbour":"Harbour, Kyrenia, Northern Cyprus 07.jpg",
 "Panmunjom from the north":"DMZ AT PANMUNJOM DPRK (NORTH KOREA)OCT 2012 (8157355503).jpg","The Wagah border ceremony":"Lowering of the flags at the Wagah border.jpg","Zaatari camp":"Zaatari Refugee Camp John Green 18.png",
 "Refugees at Przemyśl":"Ukrainian refugees at Przemyśl returning home.jpg","Geneva’s lake and fountain":"Arc-en-ciel sur le jet d'eau de Genève - GT 2025.jpg","Old Havana":"Old Square, Havana.jpg","Cartagena":"Front of Cartagena Colombia Old Town Cathedral.jpg"};
/* new photos (GF_POWER1_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_POWER1_PHOTOS||[];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
PHOTOS.forEach(p=>{(p.cards||[]).forEach(k=>CARD[k]=p.f);(p.pins||[]).forEach(l=>PIN[l]=p.f)});
const findP=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d)||PHOTOS.find(x=>x.f===f)||null}catch(e){return null}};
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St){const want=CARD[ps.tour+"|"+St.title];if(want){const p=findP(want);if(p)return p}}}catch(e){}return _pf.apply(this,arguments)}}
try{if(typeof GF_SQ_FILE!=="undefined")for(const k in PIN)if(!GF_SQ_FILE[k])GF_SQ_FILE[k]=PIN[k]}catch(e){}
/* photo pins (never the stop's own card photo again): each stop's pins are registered just before it draws, so the shared pruning never drops them */
const KEEP=new Map();IDS.forEach(id=>PS_TOURS[id].steps.forEach(St=>{St.phPins=(St.phPins||[]).filter(q=>PIN[q.label]&&PIN[q.label]!==CARD[id+"|"+St.title]);KEEP.set(St,St.phPins.map(q=>Object.assign({},q)))}));
function prep(St){try{const K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 const labs=new Set(K.map(q=>q.label));if(St._restored)St._restored=St._restored.filter(r=>!labs.has(r[1]));if(St.pins)St.pins=St.pins.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));if(St._pins0)St._pins0=St._pins0.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));St._sqPruned=-1;return true}}catch(e){console.error(e)}}
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* covers for the Guided tours page cards */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={capitals:"Brazilian National Congress.jpg",energy:"ThreeGorgesDam-China2009.jpg",currencies:"Yap Stone Money.jpg",conflicts:"Peace-Arch-3614 edit.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
