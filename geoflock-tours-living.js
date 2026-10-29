/* GeoFlock: five Living planet tours.
   biomes      "Biomes"                       tundra to rainforest, on the Nature map's biome layer (one biome lit at a time)
   forests     "Forests"                      the taiga, the Amazon and Congo, giant and ancient trees, forest loss and regrowth
   ocean       "Ocean life"                   reefs, kelp, upwelling, the deep sea and vents, whales, krill, fishing and plastic
   amigration  "Animal migration"             wildebeest, terns, godwits, monarchs, salmon, whales, eels, locusts and more
   crops       "Where our food comes from"    Vavilov’s centres: where wheat, rice, maize, potatoes, cacao and soy began
   Steps reuse what the World Maps view draws: the Nature map (nsub picks its tab, biome:<n> lights one biome), per-stop
   layers (on:[…]; resource icons are narrowed to farms and fishing on these tours), ocean currents (gfCur), the ruler
   (gfRuler) and the height threshold (gfThr). A stop with its own map mode (mode:"nature" in the crops tour) uses the
   shared per-stop switch (stopModes). Photos: Wikimedia Commons (author and licence in each library entry); new ones are in GF_LIVING_PHOTOS. */
window.GF_LIVING_PHOTOS=[{"f": "General Sherman tree looking up.jpg", "d": "photos/xb1080fc7ad1c4290.webp", "by": "Jim Bahn", "lic": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:General_Sherman_tree_looking_up.jpg", "tour": "forests", "card": "Giant trees"}, {"f": "Ancient Bristlecone Pine Forest 04 30 2022 17.jpg", "d": "photos/xbeee4e41132fd0fe.webp", "by": "Z3lvs", "lic": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Ancient_Bristlecone_Pine_Forest_04_30_2022_17.jpg", "tour": "forests", "card": "The oldest trees"}, {"f": "Blacksmoker in Atlantic Ocean.jpg", "d": "photos/xef124c0beb4bd259.webp", "by": "P. Rona / OAR/National Undersea Research Program (NURP); NOAA", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Blacksmoker_in_Atlantic_Ocean.jpg", "tour": "ocean", "card": "Life without sunlight", "pins": ["A black smoker"]}, {"f": "Bar-tailed Godwit.jpg", "d": "photos/xc386812a0a511f30.webp", "by": "Andreas Trepte", "lic": "CC BY-SA 2.5", "page": "https://commons.wikimedia.org/wiki/File:Bar-tailed_Godwit.jpg", "tour": "amigration", "card": "The godwit’s non-stop flight", "pins": ["Bar-tailed godwit"]}];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const W=[-180,-58,180,80];
const COL={biomes:"#4f9a3f",forests:"#2e7d32",ocean:"#1f8a7a",amigration:"#6a9f2a",crops:"#7a9a1f"};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
let PC="#4f9a3f";
const ph=(at,label)=>({at,label,col:PC,icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#4f9a3f"});

/* =====================================================================================================
   1. Biomes (Nature map, Biomes tab)
   RESOLVE biome numbers: 1 tropical moist forest, 4 temperate broadleaf, 6 taiga, 7 tropical savanna, 8 temperate grassland,
   11 tundra, 12 Mediterranean, 13 desert, 14 mangroves
   ===================================================================================================== */
PC=COL.biomes;
const BIOMES=[
S({title:"Biomes",view:W,globe:[20,20,1],
 phPins:[ph([93.2,52.8],"Taiga in the Sayan Mountains"),ph([34.8,-2.4],"Acacia on the Serengeti"),ph([-60,-3.2],"The Amazon from the air"),ph([-4,31.1],"Erg Chebbi, Sahara"),ph([35,48],"Ukraine’s steppe"),ph([-84.8,10.3],"Monteverde cloud forest"),ph([-94.1,58.7],"Polar bear on the tundra"),ph([18.86,-33.93],"Cape winelands")],
 stat:"Travel from the Equator to the poles and the same few kinds of landscape repeat on every continent",
 body:"Ecologists call them biomes: tundra, taiga, temperate forest, grassland, Mediterranean scrub, desert, savanna and rainforest. Each colour on this map is one biome. A biome is set mostly by two things, warmth and rain, so very different places end up looking alike.",
 more:"Kangaroos and antelope never met, but both graze open grassland; cacti in Mexico and spurges in Africa both store water in fat green stems. Similar climates shape similar living things."}),
S({title:"Why biomes follow latitude",view:W,globe:[10,10,1],on:["grid"],
 lines:[{coords:[[-180,0],[180,0]],kind:"dash"},{coords:[[-180,30],[180,30]],kind:"dash"},{coords:[[-180,-30],[180,-30]],kind:"dash"}],
 pins:[[[-62,2],"Rising air: rain every day","point"],[[13,23],"Sinking air: deserts near 30°","point"],[[125,-25],"Sinking air: deserts near 30°","point"],[[100,62],"Cold: taiga and tundra","point"]],
 stat:"Sunlight hits the Equator straight on, so rain belts and desert belts circle the globe",
 body:"Near the Equator the strong Sun heats the air, which rises, cools and drops its water as rain almost every day: that makes the rainforest belt. The air sinks again around 30° north and south, warming and drying as it falls, which is why the Sahara, Arabia and Australia’s deserts sit on the same lines.",
 more:"Farther from the Equator the Sun is lower and winters get longer, so forests give way to taiga, then treeless tundra. Look for the stripes on the map: green near the Equator, sandy colours near 30°, dark taiga and pale tundra in the far north."}),
S({title:"Tundra",view:[-170,52,-50,80],globe:[-100,66,2],card:"left",biome:11,
 pins:[[[-94.16,58.77],"Churchill, Manitoba","point"],[[-133.7,68.4],"Mackenzie delta","point"]],
 phPins:[ph([-94.1,58.7],"Polar bear on the tundra"),ph([136,71.5],"Thawing coast, Yana Bay"),ph([-22,74],"Northeast Greenland from space")],
 stat:"Where the warmest month averages less than about 10 °C, trees cannot grow: that is the tundra",
 body:"Beyond the last trees lies a land of moss, lichen, sedges and dwarf willows only a few centimetres tall. Below the surface the ground stays frozen all year (permafrost), so summer meltwater cannot drain away and the land is dotted with countless ponds.",
 more:"In the short summer the tundra explodes with life: caribou, musk oxen, lemmings and millions of nesting birds. At Churchill, on Hudson Bay, polar bears wait on the tundra each autumn for the sea to freeze."}),
S({title:"Taiga",view:[20,40,180,76],globe:[100,60,1.6],card:"left",biome:6,
 pins:[[[143.3,63.46],"Oymyakon: −67.7 °C in 1933","point"],[[129.73,62.03],"Yakutsk","point"]],
 phPins:[ph([93.2,52.8],"Taiga in the Sayan Mountains"),ph([129.73,62.03],"Yakutsk in winter"),ph([-110,60],"A moose")],
 stat:"The taiga, or boreal forest, is the biggest land biome: a belt of conifers right round the top of the world",
 body:"It runs through Scandinavia, Russia, Canada and Alaska. Spruce, pine, fir and larch keep their snow-shedding cone shape and needle leaves, ready to make food the moment the short summer comes. Siberian larches even drop their needles to survive winters near −60 °C.",
 more:"Villages in Siberia’s taiga are among the coldest places where people live: Oymyakon recorded −67.7 °C in 1933. The taiga’s cold, wet soils and peat lock away huge amounts of carbon."}),
S({title:"Temperate forest",view:[-15,35,60,62],globe:[20,50,2],card:"right",biome:4,
 pins:[[[23.85,52.75],"Białowieża Forest","point"]],
 phPins:[ph([23.85,52.75],"European bison"),ph([8.92,51.87],"Externsteine, Teutoburg Forest"),ph([-83.5,35.6],"Great Smoky Mountains")],
 stat:"Białowieża Forest, on the Poland–Belarus border, is a last piece of the old forest that once covered much of Europe",
 body:"Temperate broadleaf forests of oak, beech, maple and lime grow where summers are warm, winters cold and rain falls all year. In autumn the trees pull the green from their leaves and drop them, then rest through winter. Most of Europe, eastern North America and eastern China once looked like this.",
 more:"Most of it was cleared for farms long ago, which is why these regions have some of the world’s best farmland. In Białowieża, European bison, hunted out in the wild by the 1920s, were brought back from zoo animals in 1952."}),
S({title:"Grasslands: steppe, prairie and pampas",view:[-130,-58,140,62],globe:[60,45,1.2],card:"left",biome:8,
 pins:[[[35,48],"Steppe","point"],[[-100,43],"Prairie","point"],[[-61,-35],"Pampas","point"],[[106,47],"Mongolian steppe","point"],[[29,-26],"Highveld","point"]],
 phPins:[ph([35,48],"Ukraine’s steppe"),ph([71.4,51.1],"Steppe near Astana"),ph([88,48.5],"Kazakh eagle hunters")],
 stat:"The Eurasian steppe runs about 8,000 km, from Hungary to Mongolia and north-east China",
 body:"Grasslands grow where it is too dry for forest but too wet for desert. Fires, droughts and grazing animals keep trees out, while grasses survive because they grow from the base and keep most of their bulk in deep roots. Over thousands of years those roots built thick, black, fertile soils.",
 more:"That soil turned the Ukrainian steppe, the North American prairie and the Argentine pampas into the world’s breadbaskets. Only a few per cent of North America’s tallgrass prairie is left; the rest is fields of maize, wheat and soy."}),
S({title:"Mediterranean scrub",view:W,globe:[10,20,1],biome:12,
 pins:[[[15,40],"Mediterranean","point"],[[-120,36],"California","point"],[[-71.5,-33.5],"Central Chile","point"],[[19,-33.8],"Cape fynbos","point"],[[117,-32],"South-west Australia","point"]],
 phPins:[ph([18.86,-33.93],"Cape winelands"),ph([36.05,34.25],"Cedars of Lebanon"),ph([18.43,-34.02],"Constantia, Cape Town")],
 stat:"Five small regions with hot, dry summers and mild, wet winters hold about a fifth of all known plant species",
 body:"Look for the orange patches: around the Mediterranean, in California, central Chile, South Africa’s Cape and south-west Australia, all on the west sides of continents, 30–40° from the Equator. Tough, leathery-leaved shrubs, herbs and cork oaks survive the summer drought and the fires that come with it.",
 more:"The Cape’s fynbos alone has about 9,000 kinds of plants, most found nowhere else. People love this climate too: these are the lands of olives, grapes and wine, and of some of the world’s most expensive coasts."}),
S({title:"Deserts",view:[-25,5,75,45],globe:[20,25,1.6],card:"left",biome:13,
 phPins:[ph([-4,31.1],"Erg Chebbi, Sahara"),ph([35.42,29.57],"Wadi Rum, Jordan"),ph([15.29,-24.76],"Deadvlei, Namib"),ph([103,43],"Camels in the Gobi")],
 stat:"Deserts and dry shrublands are the biggest biome on this map, about a fifth of all land",
 body:"A desert gets less than about 250 mm of rain a year, and some years none at all. Life here is about saving water: cacti and baobabs store it in their trunks, many plants sprout, flower and seed within a few weeks of rain, and animals like fennec foxes hide from the heat by day.",
 more:"In the Namib, fog-basking beetles stand head-down on the dunes at dawn so that fog condenses on their backs and trickles into their mouths. Deserts are not always hot: the Gobi has bitter winters."}),
S({title:"Savanna",view:[-20,-35,55,20],globe:[25,-5,1.6],card:"left",biome:7,
 pins:[[[34.8,-2.3],"Serengeti","point"],[[-47,-15],"Cerrado","point"],[[-67,7],"Llanos","point"],[[132,-15],"Northern Australia","point"]],
 phPins:[ph([34.8,-2.4],"Acacia on the Serengeti"),ph([37.25,-2.65],"Elephants below Kilimanjaro"),ph([35.1,-1.5],"Zebras and wildebeest"),ph([23,-19.5],"Giraffes")],
 stat:"Tropical savanna, grass with scattered trees, covers about a sixth of the land on this map",
 body:"Savannas lie between the rainforests and the deserts, where the year splits into a wet season and a long dry one. Grass greens with the rains, then dries and burns. Many trees are fire-proofed by thick bark, and the grass feeds the greatest herds left on Earth.",
 more:"Africa’s savannas hold elephants, giraffes, zebras, wildebeest and the lions that hunt them. South America has its own: the Cerrado of Brazil and the Llanos of Venezuela and Colombia, and northern Australia has a savanna of gum trees."}),
S({title:"Tropical rainforest",view:[-100,-30,160,30],globe:[20,0,1.1],card:"left",biome:1,
 pins:[[[-62,-4],"Amazon","point"],[[23,0],"Congo basin","point"],[[114,1],"Borneo","point"],[[142,-5],"New Guinea","point"]],
 phPins:[ph([-60,-3.2],"The Amazon from the air"),ph([28.5,1.6],"Ituri rainforest, Congo"),ph([116.5,6],"Cloud over Borneo’s forest"),ph([-84,10.4],"Red-eyed tree frog")],
 stat:"Tropical forests hold perhaps half of all the kinds of plants and animals that live on land",
 body:"Rain falls almost every day and it is warm all year, so plants never stop growing. The forest is built in layers: giant emergent trees, a closed canopy 30–45 m up where most animals live, a dim understorey and a dark floor where fallen leaves rot within weeks.",
 more:"Most of the nutrients are in the living plants, not the soil, which is thin and poor. That is why cleared rainforest often makes poor farmland after a few years."}),
S({title:"Mountains: biomes stacked up",view:[27,-11,47,5],globe:[37.35,-3.07,4],card:"left",gfThr:{kind:"elev",v:3000},
 pins:[[[37.35,-3.07],"Kilimanjaro, 5,895 m","point"],[[37.31,-0.15],"Mount Kenya, 5,199 m","point"]],
 phPins:[ph([37.25,-2.65],"Elephants below Kilimanjaro"),ph([37.36,-3.08],"Kilimanjaro’s ice"),ph([-156.25,20.72],"Silversword, Haleakalā")],
 stat:"Climbing Kilimanjaro takes you from savanna to ice in about 50 km: like walking from the Equator to the Arctic",
 body:"Air cools by about 6.5 °C for every 1,000 m you climb, so mountains stack biomes on top of each other. On Kilimanjaro you pass farms and savanna, then a rainforest belt, giant heathers and moorland, an alpine desert, and finally glaciers on the summit, just 3° south of the Equator.",
 more:"Alexander von Humboldt noticed this on Ecuador’s Chimborazo in 1802 and drew the plants at each height, one of the first maps of how life follows climate. The map now shades land above 3,000 m."}),
S({title:"The human biome",view:W,globe:[20,25,1],nsub:"footprint",
 phPins:[ph([115.2,-8.4],"Rice terraces, Bali"),ph([102.2,2.3],"Oil palms, Malaysia"),ph([103,23.4],"Terraced fields, Yunnan"),ph([-98.5,38.5],"Harvesting wheat")],
 stat:"About half of the world’s habitable land is now used to farm crops or graze animals",
 body:"This tab of the Nature map shows the human footprint: green is still wild, yellow is farmed or grazed, red is heavily changed by cities, roads and intensive farms. The grasslands and temperate forests, with the best soils, have been changed the most; the tundra, taiga and deep rainforests the least.",
 more:"Some ecologists now map ‘anthromes’, human biomes such as rice villages, rangeland and cities, alongside the natural ones. Most of the farmland is used to raise animals and grow their feed."}),
S({title:"Biomes on the move",view:[-170,50,180,80],globe:[60,68,1.4],card:"left",biome:11,
 pins:[[[69,67],"Yamal: shrubs spreading","point"],[[-150,68.5],"Brooks Range: alder moving north","point"]],
 phPins:[ph([136,71.5],"Thawing coast, Yana Bay"),ph([-118.75,45.3],"A forest fire at night")],
 stat:"Satellites show much of the Arctic tundra getting greener as summers warm",
 body:"As the climate warms, the edges of biomes are moving. Shrubs are spreading across the tundra and in places trees are creeping north and up mountainsides. Warmer, drier summers also bring bigger fires to the taiga.",
 more:"Plants and animals cannot always move fast enough: a tundra flower has nowhere colder to go. Scientists also warn that if enough of the Amazon is cleared and dried out, parts of it could turn into savanna."}),
S({title:"Now explore",view:W,globe:[20,20,1],
 stat:"Click a biome in the legend to light it up, or tap the map for its card",
 body:"Find where you live: which biome is it? Try the Ecoregions tab for about a hundred famous ones, from the fynbos to the Serengeti. The Forests tour goes deeper into the woods.",
 more:"The Climate map shows the rain and warmth behind each biome."})];

/* =====================================================================================================
   2. Forests (Nature map)
   ===================================================================================================== */
PC=COL.forests;
const AMZ=["br","pe","co","ve","ec","bo","gy","sr","gf"];
const FORESTS=[
S({title:"Forests",view:W,globe:[20,20,1],nsub:"forest",
 phPins:[ph([93.2,52.8],"Siberian taiga"),ph([-73.5,-40.2],"Valdivian rainforest"),ph([-84.8,10.3],"Monteverde"),ph([89.2,21.9],"The Sundarbans"),ph([117.3,42.4],"Saihanba’s planted forest"),ph([28.5,1.6],"Ituri rainforest, Congo"),ph([116.5,6],"Cloud over Borneo’s forest")],
 stat:"Forests cover nearly a third of Earth’s land, and more than half of them are in just five countries",
 body:"This map shades each country by how much of its land is forest. Russia, Brazil, Canada, the United States and China hold most of the world’s trees, while Suriname, Gabon and Guyana are among the most wooded countries of all, mostly forest from end to end.",
 more:"Forests hold most of the animals and plants that live on land, store huge amounts of carbon and help make rain. This tour visits the biggest, the tallest, the oldest and the strangest."}),
S({title:"The taiga: the biggest forest",view:[20,40,180,76],globe:[100,60,1.6],card:"left",biome:6,
 phPins:[ph([93.2,52.8],"Siberian taiga"),ph([-110,60],"Moose in the boreal forest")],
 stat:"Russia alone holds about a fifth of all the world’s forest, most of it taiga",
 body:"The boreal forest stretches across Russia, Scandinavia, Canada and Alaska. Its trees grow slowly in the cold, but the forest is so vast that, with its peat and frozen soils, it stores more carbon than the tropical forests.",
 more:"Siberia’s commonest tree is the larch, a conifer that drops its needles every autumn. Fires are part of the taiga’s life cycle, but they are getting bigger and more frequent as summers warm."}),
S({title:"The Amazon",view:[-82,-20,-44,8],globe:[-62,-5,2],card:"left",biome:1,
 pins:[[[-60.02,-3.1],"Manaus","point"]],
 phPins:[ph([-77.8,-1],"Treetops near Tena, Ecuador"),ph([-60,-3.2],"The Amazon from the air"),ph([-57,-16.8],"Jaguar")],
 stat:"The Amazon has about 390 billion trees of about 16,000 kinds, more than any other forest",
 body:"The world’s biggest rainforest covers about 5.5 million km² in nine countries; about 60% of it is in Brazil. A single hectare can hold more kinds of trees than all of Europe. Just 227 ‘hyperdominant’ kinds make up half of all its trees, among them the Brazil nut and the açaí palm.",
 more:"Parts of the forest were shaped by people long before 1492: dark, fertile ‘terra preta’ soils and groves of useful trees mark old settlements. The river carries about a fifth of all the fresh water that flows into the world’s oceans."}),
S({title:"Forests make rain",view:[-85,-38,-30,10],globe:[-60,-14,1.7],card:"left",biome:1,
 lines:[{coords:[[-36,-2],[-48,-2.5],[-60,-3.5],[-70,-7],[-73,-11]],kind:"flow"},{coords:[[-73,-11],[-66,-16],[-61,-20],[-56,-23],[-49,-23.5]],kind:"flow"},{coords:[[-61,-20],[-60,-27],[-58.4,-34]],kind:"flow"}],
 pins:[[[-46.63,-23.55],"São Paulo","point"],[[-58.4,-34.6],"Río de la Plata farms","point"],[[-72,-9],"The Andes turn the wind south","point"]],
 phPins:[ph([-60,-2.5],"The Amazon River")],
 stat:"A big rainforest tree can give off hundreds of litres of water a day",
 body:"Trees pull water from the soil and breathe it out through their leaves. Over the Amazon this vapour makes new clouds, so the same water can rain down and rise again several times as the trade winds carry it west. Up to half of the Amazon’s rain may come from the forest itself.",
 more:"When the moist air hits the Andes it turns south. Scientists call these streams of vapour ‘flying rivers’; they bring rain to the farms of southern Brazil, Paraguay and Argentina. Cut too much forest and the rain could fail far away."}),
S({title:"The Congo",view:[5,-12,35,9],globe:[20,-1,2.6],card:"right",biome:1,
 lines:[{poly:[[15.5,2.6],[17.5,2.8],[19.5,1.8],[20.5,0.2],[19.8,-1.6],[18.2,-2.8],[16.6,-2.2],[15.8,-0.6],[15.5,2.6]],kind:"shade"}],
 pins:[[[17.8,0.2],"Cuvette Centrale peatlands","point"],[[22,-2.5],"Bonobos: only south of the river","point"]],
 phPins:[ph([16.1,2.85],"Forest elephants, Dzanga Bai"),ph([28.5,1.6],"Ituri rainforest, Congo"),ph([16.3,2.5],"Western lowland gorilla"),ph([25.2,0.5],"The Congo at Kisangani")],
 stat:"In 2017 scientists mapped a hidden peat swamp in the Congo basin holding about 30 billion tonnes of carbon",
 body:"The Congo rainforest is the second biggest on Earth, spread over six countries. Under its swamp forests lies the world’s largest tropical peatland, about 145,000 km², where waterlogged leaves have piled up for 10,000 years without rotting.",
 more:"The Congo River is so wide and deep that it splits apes into two kinds: chimpanzees live north of it, bonobos only south. Forest elephants, smaller than savanna elephants, plant the seeds of many trees in their dung."}),
S({title:"Borneo and New Guinea",view:[78,-16,157,12],globe:[130,-2,2],card:"left",
 pins:[[[117.8,4.95],"Menara, 100.8 m","point"],[[144.3,-5.8],"Papua New Guinea’s highlands","point"]],
 iconPins:[ic([117.8,4.95],"tree","#2e7d32")],
 phPins:[ph([116.9,1],"Bornean orangutan"),ph([145.5,-6.2],"Raggiana bird-of-paradise"),ph([117.9,5.4],"Bornean pygmy elephant"),ph([141,-3.5],"Goodfellow’s tree-kangaroo"),ph([118,5.9],"Proboscis monkey")],
 stat:"New Guinea has about 13,600 kinds of plants, more than any other island on Earth",
 body:"Borneo’s rainforests are ruled by dipterocarps, towering trees whose seeds spin down on wings. In 2019 climbers measured one in Sabah, a yellow meranti named Menara, at 100.8 m: the tallest tropical tree known. Borneo is also home to orangutans, pygmy elephants and the long-nosed proboscis monkey.",
 more:"New Guinea, the world’s second-largest island, has birds-of-paradise and kangaroos that live in trees. About two-thirds of its plants grow nowhere else. Much of Borneo’s lowland forest has been cleared for timber and oil palm since the 1970s."}),
S({title:"Rainforests in the cold",view:[-150,40,-112,62],globe:[-130,52,3],card:"left",biome:5,
 lines:[{coords:[[-136,58.3],[-132,56],[-128,51],[-124.5,48],[-124,44],[-124.2,41]],kind:"forest"}],
 pins:[[[-123.93,47.86],"Hoh Rain Forest","point"],[[-134,57],"Tongass","point"],[[-127.5,52.5],"Great Bear Rainforest","point"]],
 phPins:[ph([-73.5,-40.2],"Valdivian rainforest"),ph([-149.6,59.9],"Kenai Fjords, Alaska")],
 stat:"The Tongass in Alaska, the largest US national forest, is a rainforest: of spruce and cedar, not palms",
 body:"Temperate rainforests grow on cool, rainy coasts where wet ocean winds hit mountains: from Alaska to Oregon, southern Chile, New Zealand, Tasmania and Norway. The Hoh Rain Forest in Washington gets over 3.5 m of rain a year; moss and ferns cover every branch.",
 more:"These forests hold more living matter per hectare than any others, in giant trees that can live a thousand years. Chile’s Valdivian rainforest has the monkey-puzzle and the alerce, a tree that can live over 3,000 years."}),
S({title:"Giant trees",view:[-126,34,-116,43],globe:[-121,38.5,5],card:"right",
 gfRuler:{a:[-124.0,41.2],b:[-118.75,36.58]},
 pins:[[[-118.75,36.58],"General Sherman","point"],[[-124.0,41.3],"Redwood National Park","point"]],
 iconPins:[ic([-118.75,36.58],"tree","#2e7d32"),ic([-124.0,41.3],"tree","#2e7d32")],
 stat:"Hyperion, a coast redwood in California, is about 116 m tall: the tallest living tree known",
 body:"Coast redwoods drink from the summer fogs off the Pacific and grow taller than any other trees. Inland, in the Sierra Nevada, giant sequoias grow bulkier: General Sherman, about 1,500 m³ of wood, is the biggest single tree on Earth by volume.",
 more:"Hyperion’s exact spot is kept secret to protect its roots from visitors. Giant sequoias need fire: the heat opens their cones and clears the ground so the seedlings can grow."}),
S({title:"The oldest trees",view:[-125,30,-105,45],globe:[-116,38,4],card:"right",
 pins:[[[-118.17,37.38],"Ancient Bristlecone Pine Forest","point"],[[-111.75,38.52],"Pando, Utah","point"]],
 iconPins:[ic([-118.17,37.38],"tree","#2e7d32")],
 stat:"Methuselah, a bristlecone pine in California’s White Mountains, is about 4,850 years old: older than Egypt’s Great Pyramid",
 body:"Great Basin bristlecone pines grow high in the dry, cold mountains of the western United States, where little rots and few pests survive. They grow so slowly that most of a tree can die back while one thin strip of living bark keeps it alive for thousands of years.",
 more:"Pando, in Utah, is a clone of about 47,000 aspen trunks joined by one root system, perhaps many thousands of years old. In Sweden, a spruce called Old Tjikko grows from roots about 9,500 years old."}),
S({title:"Mangroves",view:[85,19,94,25],globe:[89.3,22,6],card:"left",biome:14,
 pins:[[[89.2,21.9],"Sundarbans","point"]],
 phPins:[ph([89.3,22.1],"The Sundarbans"),ph([88.9,21.8],"Bengal tiger"),ph([-16.65,13.2],"Mangroves in The Gambia")],
 stat:"The Sundarbans, shared by Bangladesh and India, is the biggest mangrove forest on Earth, about 10,000 km²",
 body:"Mangroves are trees that live in salt water, along tropical coasts and deltas. They stand on stilt roots, push breathing roots up out of the mud like snorkels, and get rid of salt through their leaves. Their tangle of roots shelters young fish and shrimp.",
 more:"Mangroves break the force of storm waves and store a lot of carbon in their muddy soils. The Sundarbans is the only mangrove forest with tigers, which swim between the islands."}),
S({title:"Cloud forests",view:[-87,7,-81,12.5],globe:[-84.8,10.3,6],card:"left",
 pins:[[[-84.8,10.3],"Monteverde","point"]],
 phPins:[ph([-84.82,10.32],"Monteverde forest"),ph([-84.7,10.46],"Arenal from Monteverde"),ph([-84.6,10.2],"Keel-billed toucan")],
 stat:"In a cloud forest, the trees drink from the clouds as they drift through the branches",
 body:"On tropical mountains, between about 1,000 and 3,000 m, clouds settle on the forest almost every day. Droplets collect on leaves, mosses and orchids and drip to the ground, adding a lot of water to what falls as rain. Branches are covered in plants that live on other plants.",
 more:"Monteverde in Costa Rica is famous for its quetzals and hummingbirds. Its golden toad, found only there, was last seen in 1989 and is now thought extinct, one of the first losses blamed partly on a changing climate."}),
S({title:"Where forests are lost",view:[-82,-25,-36,8],globe:[-58,-8,2],card:"left",nsub:"forestchg",
 lines:[{coords:[[-48,-2],[-48.5,-6],[-50.5,-9.5],[-55,-11.5],[-60,-11],[-63,-9.5],[-67,-10]],kind:"red"}],
 pins:[[[-55.5,-12],"Soy and cattle in Mato Grosso","point"],[[-63.9,-8.76],"Rondônia","point"],[[-63,-17],"Bolivia: fires in 2024","point"]],
 phPins:[ph([-55,-10],"Slash and burn"),ph([102.2,2.3],"Oil palms, Malaysia")],
 stat:"In 2024 the tropics lost about 6.7 million hectares of old-growth forest, a record, nearly the size of Panama",
 body:"This tab shows how each country’s forest has changed since 1990. Most tropical forest is cleared for farms: cattle and soy in South America, oil palm and paper in Southeast Asia, small farms in Africa. In 2024, for the first time, fires caused nearly half the loss, after a record drought.",
 more:"Brazil cut its Amazon clearing by about 80% between 2004 and 2012, showed it could be done, and has cut it sharply again since 2023. Bolivia became the second-biggest loser of tropical forest in 2024."}),
S({title:"Forests come back",view:[70,15,140,55],globe:[110,38,2],card:"left",nsub:"forestchg",
 pins:[[[117.3,42.4],"Saihanba","point"],[[109,37],"Loess Plateau","point"]],
 phPins:[ph([117.3,42.4],"Saihanba’s planted forest"),ph([38.7,9],"Planting trees in Ethiopia"),ph([-84.8,10.3],"Costa Rica’s regrown forest")],
 stat:"China has doubled its forest cover since the early 1980s, from about 12% to about 24%",
 body:"From 1962 foresters planted Saihanba, north of Beijing, on land that had turned to sandy grassland; it is now a forest of about 75,000 ha. Across China, slopes of the Loess Plateau were given back to trees and grass to stop erosion. Europe and the United States also have more forest than a century ago.",
 more:"Costa Rica cut down much of its forest by the 1980s, then paid farmers to protect and regrow it; more than half of the country is forest again. A planted forest of one kind of tree, though, holds far less life than an old natural one."}),
S({title:"Now explore",view:W,globe:[20,20,1],nsub:"forest",
 stat:"Switch between Forest cover and Forest change to see who is losing and who is gaining",
 body:"Hover any country for its numbers. Try the Biomes tab to see where each kind of forest grows, from taiga to mangroves. The Biomes tour shows the forests’ neighbours, and the Environment tour follows people and the planet.",
 more:"The Protected land tab shows how much of each country is set aside for nature."})];

/* =====================================================================================================
   3. Ocean life (relief map)
   ===================================================================================================== */
PC=COL.ocean;
const OCEAN=[
S({title:"Ocean life",view:W,globe:[-150,0,1],
 phPins:[ph([-44.8,26.1],"A black smoker"),ph([146,-18.5],"Great Barrier Reef"),ph([-40,-60],"Antarctic krill"),ph([-155.5,19.8],"Humpback whale"),ph([120,10],"Whale shark"),ph([-75,-10],"Manta ray"),ph([-149.8,-17.5],"Blacktip reef sharks"),ph([-25,-72],"Emperor penguins"),ph([-159.5,22],"Hawaiian monk seal")],
 stat:"Tiny ocean plants, phytoplankton, make about half of the oxygen we breathe",
 body:"The ocean covers 71% of the planet and makes up most of the space where life can live. Most ocean life crowds into the sunlit top 200 m and along coasts, where nutrients are rich; much of the open ocean is a blue desert.",
 more:"This tour visits coral reefs and kelp forests, the cold currents that feed great fisheries, the dark deep sea, whales, krill and the ways people are changing the sea."}),
S({title:"Coral reefs and the Coral Triangle",view:[95,-25,165,20],globe:[130,-3,1.8],card:"left",hi:["id","my","ph","pg","sb","tl"],
 lines:[{coords:[[142.5,-10.5],[145.5,-15],[147,-18.5],[150,-21.5],[152.5,-24.5]],kind:"warm"}],
 pins:[[[147,-18.5],"Great Barrier Reef, 2,300 km","point"],[[130.5,-0.5],"Raja Ampat","point"]],
 phPins:[ph([130.5,-0.8],"Reefs of the Bird’s Head"),ph([147,-18.5],"Great Barrier Reef"),ph([134.4,7.2],"Rock Islands, Palau"),ph([149,-20],"Bleached coral")],
 stat:"The six Coral Triangle countries hold about three-quarters of all the world’s kinds of reef-building coral",
 body:"Coral reefs cover well under 1% of the sea floor but shelter about a quarter of all ocean species. Each coral is a colony of tiny animals with algae living inside them; the algae make food from sunlight, which is why reefs need clear, warm, shallow water.",
 more:"When the sea gets too hot, corals push out their algae and turn white, or ‘bleach’; if the heat lasts, they die. From 2023 to 2025 about 84% of the world’s reef area was hit by bleaching, the worst event on record."}),
S({title:"Kelp forests",view:[-180,-58,180,62],globe:[-120,10,1],
 lines:[{coords:[[-125,48],[-124,42],[-122,37],[-120,34.4],[-117,32]],kind:"cold"},{coords:[[-73.5,-40],[-74.5,-48],[-70,-54]],kind:"cold"},{coords:[[17.5,-30],[18.3,-34.2],[20,-34.8]],kind:"cold"},{coords:[[145.5,-41],[147.5,-43.5],[148.3,-42]],kind:"cold"}],
 pins:[[[-121.9,36.6],"Monterey Bay","point"],[[-123.8,39.3],"Northern California: bull kelp lost","point"],[[147.8,-43],"Tasmania","point"],[[18.4,-34.2],"Great African Seaforest","point"]],
 stat:"Giant kelp, a seaweed, can grow up to about half a metre a day and reach 45 m long",
 body:"In cool, rich coastal water, kelp grows into underwater forests, held up by gas-filled floats. Fish shelter among the fronds, and sea otters dive for sea urchins and crabs. Kelp forests line the coasts of California, Chile, South Africa, Tasmania and Norway.",
 more:"Without otters to eat them, urchins can munch a forest down to bare rock. After a marine heatwave from 2014 and a sea-star die-off, northern California lost over 90% of its bull kelp; eastern Tasmania has lost about 95% of its giant kelp."}),
S({title:"Upwelling: where the fish are",view:[-135,-45,35,50],globe:[-30,-5,1],card:"left",on:["resources"],
 lines:[{coords:[[-125,47],[-122,37],[-117,32]],kind:"cold"},{coords:[[-73.5,-40],[-72,-30],[-71,-18],[-77,-12],[-81,-5]],kind:"cold"},{coords:[[-9.5,38],[-10,31],[-16,22],[-17.5,14.5]],kind:"cold"},{coords:[[18.3,-34],[16,-29],[14.5,-23],[11.8,-17]],kind:"cold"}],
 pins:[[[-123,40],"California","point"],[[-77,-12],"Humboldt (Peru–Chile)","point"],[[-17,22],"Canary","point"],[[14,-23],"Benguela","point"]],
 phPins:[ph([-15.9,23.7],"Atlantic coast, Western Sahara")],
 stat:"Upwelling zones cover about 1% of the ocean but give about a fifth of the world’s fish catch",
 body:"Along the west coasts of the Americas and Africa, winds push surface water out to sea, and cold water rises from below to replace it. It brings up nutrients from the deep that feed huge blooms of plankton, then anchovies and sardines, then seabirds, seals, whales and fishing fleets.",
 more:"Off Namibia, the cold Benguela Current makes one of the richest seas on Earth beside one of the driest deserts, the Namib. The fish icons show some of the world’s biggest fisheries."}),
S({title:"The anchoveta and El Niño",view:[-90,-22,-68,0],globe:[-78,-11,3.5],card:"left",hi:["pe"],on:["resources"],
 lines:[{coords:[[-72,-19],[-75,-15.5],[-77.5,-12],[-79.5,-8],[-81,-5]],kind:"cold"}],
 pins:[[[-76.25,-13.64],"Chincha Islands: guano","point"],[[-77.15,-12.05],"Callao","point"]],
 stat:"In 1970 Peru landed over 12 million tonnes of one small fish, the anchoveta",
 body:"Peru’s cold upwelling feeds the biggest single-species fishery on Earth. Most anchoveta are ground into fishmeal and oil for fish farms and animal feed. Seabirds that eat them made the guano islands, whose droppings, piled metres deep, were mined as fertiliser in the 1800s.",
 more:"Every few years El Niño brings warm water that shuts off the upwelling. In 1972–73 El Niño, on top of overfishing, crashed the catch; Peru now sets strict limits and closes the fishery when stocks are low."}),
S({title:"Into the deep",view:[125,0,160,25],globe:[142,12,3],card:"left",
 pins:[[[142.2,11.35],"Challenger Deep, about 10,935 m","point"],[[142,32],"Snailfish filmed at 8,336 m","point"]],
 stat:"The average ocean is about 3,700 m deep, and below about 1,000 m no sunlight reaches at all",
 body:"The deep sea is the largest living space on Earth: cold, dark and under crushing pressure. Most animals here make their own light; about three-quarters of the animals living in open water glow, to hunt, to hide or to find a mate.",
 more:"The Mariana Trench’s Challenger Deep is the deepest point, nearly 11 km down. In 2022 a snailfish was filmed at 8,336 m in a trench off Japan, the deepest fish ever seen."}),
S({title:"Life without sunlight",view:[-175,-50,5,60],globe:[-90,0,1],card:"left",on:["plates"],
 pins:[[[-86.1,0.8],"Galápagos Rift: first vents, 1977","point"],[[-109,21],"East Pacific Rise: black smokers","point"],[[-42.1,30.1],"Lost City","point"],[[-129,46],"Juan de Fuca Ridge","point"]],
 stat:"In 1977 scientists in the submersible Alvin found animals thriving around hot springs 2,500 m down",
 body:"Hydrothermal vents form along the mid-ocean ridges, where plates pull apart (shown). Seawater seeps into the hot rock and gushes out again at up to about 400 °C, full of minerals. Black ‘smokers’ build chimneys of metal sulphides as tall as houses.",
 more:"Here the food chain starts not with sunlight but with bacteria that live on chemicals in the vent water. Giant tubeworms over 2 m long, with no mouth or gut, house these bacteria inside their bodies. Some scientists think life on Earth may have begun at vents like these."}),
S({title:"The great whales",view:[-80,-72,20,-35],globe:[-30,-58,2],card:"right",
 pins:[[[-36.5,-54.28],"Grytviken whaling station, 1904–1966","point"]],
 phPins:[ph([-36.5,-54.28],"Grytviken, South Georgia"),ph([-36.6,-54.2],"King penguins at Grytviken"),ph([-60.6,-62.98],"Whalers Bay, Deception Island")],
 stat:"The blue whale, up to about 30 m long, is the biggest animal that has ever lived",
 body:"In the 1900s whalers with harpoon guns and factory ships killed nearly 3 million great whales, most of them in the Southern Ocean. Antarctic blue whales were hunted down to well under 1% of their old numbers before a worldwide ban on commercial whaling began in 1986.",
 more:"Many whales are recovering: humpbacks have come back strongly. Whales help feed the ocean: their iron-rich dung, released near the surface, fertilises the plankton that krill and fish eat."}),
S({title:"The Sargasso Sea",view:[-90,10,-20,45],globe:[-55,28,2.2],card:"left",gfCur:{ocean:1},
 lines:[{poly:[[-70,25],[-68,32],[-60,36],[-50,36],[-42,33],[-40,28],[-45,22],[-55,20],[-65,21],[-70,25]],kind:"shade"}],
 pins:[[[-55,28],"The Sargasso Sea","point"],[[-64.8,32.3],"Bermuda","point"]],
 phPins:[ph([-64.8,32.3],"Green sea turtle")],
 stat:"The Sargasso Sea is the only sea with no coast: its edges are ocean currents",
 body:"The Gulf Stream and other currents swirl clockwise round this calm patch of the North Atlantic. Golden sargassum seaweed floats here in rafts, never touching the bottom, with its own crabs, shrimps and sargassum fish. Young turtles hide in it and European and American eels come here to breed.",
 more:"Since 2011 a new belt of sargassum has bloomed each year from West Africa to the Gulf of Mexico, at times more than 8,000 km long. Rotting heaps of it now wash up on Caribbean beaches."}),
S({title:"Krill and the polar seas",view:[-180,-80,180,-45],globe:[-40,-65,1.6],card:"left",gfCur:{ocean:1},
 pins:[[[-60,-63],"Antarctic Peninsula: krill swarms","point"]],
 phPins:[ph([-40,-60],"Antarctic krill"),ph([-25,-72],"Emperor penguins"),ph([-57,-64],"A penguin leaping")],
 stat:"Antarctic krill, each about as long as your little finger, may weigh hundreds of millions of tonnes in all",
 body:"Cold water holds more oxygen and, stirred by storms, plenty of nutrients, so polar seas bloom every summer. Krill graze the plankton, and almost everything else eats krill: penguins, seals, fish and whales. A blue whale can eat many tonnes of krill in a day.",
 more:"The Antarctic Circumpolar Current, the biggest current on Earth, flows all the way round Antarctica and keeps the continent’s cold waters apart from the rest. Krill fishing is growing, mostly for fish-farm feed and health supplements."}),
S({title:"Blooms seen from space",view:[-60,40,60,80],globe:[0,62,2],card:"left",gfCur:{ocean:1},
 pins:[[[35,73],"Barents Sea blooms","point"],[[-30,58],"North Atlantic spring bloom","point"]],
 stat:"Each spring, plankton blooms in the North Atlantic are big enough to see from space",
 body:"When spring sunlight returns, phytoplankton feast on the nutrients stirred up by winter storms and multiply so fast that the sea turns milky blue-green. Satellites track the swirls of colour across thousands of kilometres.",
 more:"The smallest of them, a bacterium called Prochlorococcus, is probably the most numerous living thing that makes food from sunlight. Plankton also pull carbon dioxide from the air; when they die, some of their carbon sinks to the deep sea."}),
S({title:"Too many boats",view:[-82,36,-36,58],globe:[-52,47,3],card:"left",on:["resources"],
 lines:[{poly:[[-55,43],[-50.5,42.5],[-48,44],[-48.5,47],[-51,48],[-53,46.5],[-55,45],[-55,43]],kind:"shade"}],
 pins:[[[-52.7,47.6],"St John’s","point"],[[-50,45],"Grand Banks","point"]],
 stat:"On 2 July 1992 Canada closed the Grand Banks cod fishery, and about 30,000 people lost their work",
 body:"For 500 years the Grand Banks off Newfoundland were so full of cod that sailors said you could almost walk on them. Factory trawlers from the 1950s caught them faster than they could breed, and in the early 1990s the stock collapsed.",
 more:"Decades later it has still not fully recovered. Today more than a third of the world’s fish stocks are fished faster than they can recover, says the UN; others, like the Barents Sea cod that spawn at Lofoten in Norway, are well managed."}),
S({title:"Ocean parks",view:[-180,15,-152,32],globe:[-166,24,3],card:"right",
 lines:[{coords:[[-178,28.5],[-175.8,27.8],[-173.9,26],[-170.6,25.4],[-166.3,23.8],[-164.7,23.6],[-161.9,23.1]],kind:"dash"}],
 pins:[[[-177.37,28.21],"Midway Atoll","point"],[[-166.27,23.87],"French Frigate Shoals","point"]],
 phPins:[ph([-159.5,22],"Hawaiian monk seal")],
 stat:"Papahānaumokuākea, around the remote north-western Hawaiian islands, protects about 1.5 million km² of ocean",
 body:"Marine protected areas keep fishing boats and mining out so that life can rebuild. In Papahānaumokuākea, sacred in Native Hawaiian tradition, live monk seals, green turtles and millions of seabirds. Wisdom, a Laysan albatross on Midway, was still raising chicks in her seventies.",
 more:"Fish in well-protected reserves grow bigger and more numerous, and spill over into fished waters nearby. Countries have agreed to protect 30% of land and sea by 2030, and the High Seas Treaty of 2023 makes parks in international waters possible."}),
S({title:"Plastic seas",view:[-180,5,-110,50],globe:[-145,32,2],card:"left",gfCur:{ocean:1},
 lines:[{poly:[[-155,25],[-150,35],[-140,40],[-130,38],[-132,30],[-142,26],[-155,25]],kind:"shade"}],
 pins:[[[-142,32],"Great Pacific Garbage Patch","point"]],
 phPins:[ph([-16.5,28.3],"Plastic on a beach, Tenerife")],
 stat:"The Great Pacific Garbage Patch spreads over about 1.6 million km², three times the size of France",
 body:"Ocean currents swirl in five great gyres, and floating rubbish collects in their calm centres. The ‘patch’ is not an island of rubbish but a thin soup of plastic bits, many smaller than a fingernail. By weight almost half of it is lost fishing nets.",
 more:"Millions of tonnes of plastic reach the sea every year, mostly from rivers and coasts. Seabirds, turtles and fish mistake bits of it for food; tiny pieces are now found from the Arctic ice to the deepest trenches."}),
S({title:"Now explore",view:W,globe:[-150,0,1],
 stat:"Switch on Currents to see how the ocean moves its life around",
 body:"Turn on Resources and look for the fish icons: the great fisheries. The Nature map’s Protected land tab shows parks on land; the Seas tour names the world’s seas, and the Animal migration tour follows whales, eels and sardines.",
 more:"The Plates layer shows the ridges where hydrothermal vents form."})];

/* =====================================================================================================
   4. Animal migration (relief map)
   ===================================================================================================== */
PC=COL.amigration;
const TERN=[[-20,74],[-24,66],[-30,55],[-35,46],[-25,35],[-20,22],[-19,12]],TERN_AF=[[-19,12],[-5,0],[5,-15],[12,-35],[0,-55],[-25,-68]],TERN_SA=[[-19,12],[-30,0],[-38,-15],[-48,-35],[-55,-50],[-40,-62],[-25,-68]],
 TERN_N=[[-25,-68],[-15,-50],[-10,-25],[-25,0],[-40,20],[-45,35],[-38,48],[-30,60],[-20,74]];
const GODWIT=[[-163.5,60.8],[-170,45],[-176,25],[179,5],[177,-15],[176,-30],[175.4,-37.2]];
const MIGR=[
S({title:"Animals on the move",view:W,globe:[-30,10,1],
 lines:[{coords:TERN,kind:"flow"},{coords:TERN_AF,kind:"flow"},{coords:GODWIT,kind:"flow"},{coords:[[-80,45],[-88,38],[-96,30],[-100.27,19.6]],kind:"flow"},{coords:[[-63,-64],[-75,-40],[-82,-20],[-84.5,9]],kind:"flow"}],
 phPins:[ph([-20,70],"Arctic tern"),ph([35,-2],"Wildebeest on the move"),ph([-100.27,19.6],"Monarchs in Mexico"),ph([105.65,-10.45],"Red crabs on the march"),ph([-83,5],"Humpback whale"),ph([40,10],"A locust swarm"),ph([175.4,-37.2],"Bar-tailed godwit")],
 stat:"Every year billions of animals travel thousands of kilometres, and many make the trip without ever having done it before",
 body:"Animals migrate to follow food, water and warmth, or to reach a safe place to breed. The lines show a few of the great journeys: an Arctic tern from Greenland to Antarctica, a godwit from Alaska to New Zealand, monarchs to Mexico and humpbacks from Antarctica to Central America.",
 more:"They find the way with the Sun and stars, the Earth’s magnetic field, smells and landmarks, and some, like cranes and geese, learn routes from their parents."}),
S({title:"Wildebeest follow the rain",view:[31,-4.4,37.5,-0.6],globe:[34.9,-2.4,6],card:"right",
 lines:[{coords:[[35.0,-3.0],[34.5,-2.6],[34.1,-2.15],[34.4,-1.7],[35.0,-1.5]],kind:"flow"},{coords:[[35.0,-1.5],[35.25,-1.9],[35.3,-2.4],[35.1,-2.8],[35.0,-3.0]],kind:"flow"}],
 pins:[[[35.0,-3.0],"Calving: January–March","point"],[[34.1,-2.15],"Western corridor: May–June","point"],[[35.03,-1.55],"Mara River: July–October","point"]],
 phPins:[ph([35.03,-1.55],"Crossing the Mara River"),ph([34.8,-2.6],"Zebra and wildebeest")],
 stat:"About 1.3 million wildebeest, with hundreds of thousands of zebras and gazelles, circle the Serengeti and the Maasai Mara each year",
 body:"The herds follow the rains and fresh grass in a great clockwise loop. Early in the year they gather on the short-grass plains of the southern Serengeti, where around half a million calves are born within a few weeks. Then they move west and north into Kenya’s Maasai Mara for the dry season.",
 more:"Crossing the Mara River is the most dangerous moment: crocodiles wait in the water. About 250,000 wildebeest die on the journey each year, and their bodies feed the river."}),
S({title:"The Arctic tern",view:W,globe:[-20,0,1],card:"left",
 lines:[{coords:TERN,kind:"flow"},{coords:TERN_AF,kind:"flow"},{coords:TERN_SA,kind:"flow"},{coords:TERN_N,kind:"dash"}],
 pins:[[[-20,74],"Nesting: north-east Greenland","point"],[[-35,46],"Stopover in the mid-Atlantic","point"],[[-25,-68],"Wintering: Weddell Sea","point"]],
 phPins:[ph([-20,70],"Arctic tern"),ph([16,79.5],"A tern defends its nest")],
 stat:"Arctic terns fly about 70,000 km a year, from the Arctic to the Antarctic and back: the longest migration known",
 body:"Tiny trackers on terns nesting in Greenland showed them heading south, stopping to feed in the mid-Atlantic, then following the coast of either Africa or Brazil to the Antarctic. Coming home they take an S-shaped route across the Atlantic, riding the winds (dashed).",
 more:"Terns can live 30 years, so one bird may fly about 2.4 million km in its life: the distance to the Moon and back three times. Chasing summer at both ends, it sees more daylight than any other animal."}),
S({title:"The godwit’s non-stop flight",view:[140,-50,230,70],globe:[-175,10,1.4],card:"left",
 lines:[{coords:GODWIT,kind:"flow"},{coords:[[-163.5,60.8],[-172,42],[-180,15],[173,-5],[166,-22],[150,-38],[148.2,-41]],kind:"dash"}],
 pins:[[[-163.5,60.8],"Yukon–Kuskokwim delta, Alaska","point"],[[175.4,-37.2],"Firth of Thames, New Zealand","point"],[[148.2,-41],"Ansons Bay, Tasmania","point"]],
 stat:"In 2022 a young bar-tailed godwit flew about 13,500 km from Alaska to Tasmania in 11 days without landing",
 body:"Every autumn bar-tailed godwits fly from Alaska across the whole Pacific to New Zealand and Australia, with nowhere to stop. Before leaving they double their weight in fat and shrink their stomach and gut, which they will not need in flight.",
 more:"A godwit can’t swim or rest on the sea, so it flies day and night for over a week. The record bird (dashed) wore a satellite tag numbered 234684; it was just five months old."}),
S({title:"The East Asian–Australasian Flyway",view:[68,-48,212,72],globe:[150,15,1.2],card:"right",
 lines:[{coords:[[175,-37],[160,-20],[145,0],[130,20],[122.5,39.7]],kind:"flow"},{coords:[[122.2,-18],[120,0],[121,20],[120.8,32.5]],kind:"flow"},{coords:[[122.5,39.7],[135,50],[150,60],[175,66],[-163.5,60.8]],kind:"flow"},{coords:[[120.8,32.5],[130,50],[150,65],[160,69]],kind:"flow"}],
 pins:[[[122.5,39.7],"Yalu Jiang mudflats","point"],[[120.8,32.5],"Rudong mudflats, Jiangsu","point"],[[122.2,-18],"Roebuck Bay, Broome","point"],[[177.5,64.7],"Chukotka: spoon-billed sandpipers","point"]],
 stat:"More than 50 million waterbirds use this flyway, through 22 countries from Siberia to New Zealand",
 body:"On the way north in spring, shorebirds such as godwits, knots and curlews stop to refuel on the vast mudflats of the Yellow Sea, between China and Korea. Some feed there for weeks, eating worms and shellfish to fatten up for the last leg to the Arctic.",
 more:"The Yellow Sea has lost much of its tidal flats to sea walls, ports and fish ponds, perhaps two-thirds in 50 years, and shorebird numbers have fallen fast. Parts of the coast are now protected as a World Heritage Site."}),
S({title:"Monarch butterflies",view:[-125,12,-60,55],globe:[-95,35,1.8],card:"right",hi:["mx"],
 lines:[{coords:[[-80,45],[-88,38],[-96,30],[-100.3,19.6]],kind:"flow"},{coords:[[-97,48],[-99,38],[-100.3,19.6]],kind:"flow"}],
 pins:[[[-100.27,19.6],"Fir forests of Michoacán","point"]],
 phPins:[ph([-100.6,19.3],"Monarchs in Mexico")],
 stat:"Monarchs fly up to about 4,000 km from Canada and the US to a few mountains in central Mexico",
 body:"Every autumn millions of monarchs head south to fir forests about 3,000 m up, where they cluster on the trees through the winter. None of them has made the trip before: it takes three or four generations to get back north, so the travellers are the great-great-grandchildren of last year’s.",
 more:"Their wintering forest is measured each year: in 1996–97 the butterflies covered about 18 hectares; in 2023–24 less than 1 hectare. Milkweed, the only plant their caterpillars eat, has been lost from many farms."}),
S({title:"Salmon come home",view:[-180,40,-115,66],globe:[-150,55,2],card:"left",
 lines:[{coords:[[-150,50],[-158,55],[-157.5,58.7]],kind:"flow"},{coords:[[-140,48],[-128,49],[-123.1,49.1],[-121.5,49.4],[-119.6,50.9]],kind:"flow"},{coords:[[-165,52],[-164.8,62.5]],kind:"flow"}],
 pins:[[[-157.5,58.7],"Bristol Bay","point"],[[-119.6,50.9],"Adams River, British Columbia","point"],[[-164.8,62.5],"Yukon River","point"]],
 iconPins:[ic([-157.5,58.7],"fish","#c2364f"),ic([-119.6,50.9],"bear","#7a5230")],
 stat:"In 2022 a record of about 79 million sockeye salmon swam back into Alaska’s Bristol Bay",
 body:"Pacific salmon hatch in rivers, swim out to sea and grow there for a few years, then return to the very stream where they were born, finding it by smell. They swim upstream, leap waterfalls, spawn and die.",
 more:"Bears catch the salmon and drag them into the woods, so the forests by salmon rivers are fertilised by the sea: scientists can find ocean nitrogen in the trees. Dams and warming rivers have made many runs much smaller."}),
S({title:"Humpback whales",view:[-110,-72,-20,20],globe:[-70,-25,1.4],card:"right",
 lines:[{coords:[[-63,-64],[-75,-40],[-82,-20],[-84.5,9]],kind:"flow"},{coords:[[-36.5,-56],[-36,-35],[-38.7,-17.9]],kind:"flow"}],
 pins:[[[-84.5,9],"Breeding: Costa Rica and Panama","point"],[[-63,-64],"Feeding: Antarctic Peninsula","point"],[[-38.7,-17.9],"Abrolhos Bank, Brazil","point"]],
 phPins:[ph([-83,5],"Humpback whale")],
 stat:"Some humpbacks swim about 8,300 km between Antarctica and Costa Rica, one of the longest journeys of any mammal",
 body:"Humpbacks spend summer in cold polar seas, gorging on krill, then swim to warm, calm tropical waters to give birth and mate. While there they barely eat, living for months on their blubber.",
 more:"Male humpbacks sing long, complex songs on the breeding grounds, and the songs change from year to year, spreading from one population to another like a hit tune."}),
S({title:"Caribou on the tundra",view:[-152,63,-130,71],globe:[-141,67,4],card:"right",
 lines:[{coords:[[-136.5,64.5],[-138.5,66.5],[-140,67.6],[-142.5,68.6],[-144.5,69.7]],kind:"flow"},{coords:[[-146,69.5],[-143,67.5],[-137,65.5]],kind:"dash"}],
 pins:[[[-144.5,69.7],"Calving grounds: Arctic coastal plain","point"],[[-139.8,67.57],"Old Crow","point"]],
 stat:"Some caribou herds walk more than 1,000 km a year: the longest land migrations on Earth",
 body:"The Porcupine caribou herd, about 200,000 strong, winters in the forests of Yukon and Alaska and walks north each spring to calve on the coastal plain by the Arctic Ocean, where there are fewer wolves and fresh plants. Then they spread out across the tundra, harassed by mosquitoes.",
 more:"The Gwich’in people of Alaska and Yukon have followed and hunted this herd for thousands of years. In Eurasia the same animal, the reindeer, has been herded by people for centuries."}),
S({title:"Red crabs march to the sea",view:[101.5,-12.6,110.5,-6.4],globe:[105.65,-9.5,5],card:"left",
 pins:[[[105.68,-10.43],"Christmas Island","point"],[[106.8,-6.2],"Jakarta, Java","point"]],
 phPins:[ph([105.66,-10.47],"Red crabs on the march"),ph([105.6,-10.52],"A female with her eggs")],
 stat:"With the first wet-season rains, tens of millions of red crabs leave Christmas Island’s forest for the sea",
 body:"The crabs live in the rainforest and walk to the coast to breed. Roads close, and bridges and tunnels help them across. Females release their eggs into the sea at dawn at the turn of the high tide, around the last quarter of the Moon.",
 more:"A month later, tiny baby crabs swarm out of the sea and march back into the forest. Christmas Island belongs to Australia but lies about 350 km south of Java."}),
S({title:"Eels to the Sargasso Sea",view:[-85,10,20,62],globe:[-30,38,1.5],card:"left",gfCur:{ocean:1},
 lines:[{coords:[[5,52],[-5,48],[-20,40],[-35,34],[-50,29],[-60,27]],kind:"flow"},{coords:[[-9,53],[-20,46]],kind:"flow"},{coords:[[-60,27],[-75,32],[-65,40],[-45,46],[-25,50],[-10,51]],kind:"dash"}],
 pins:[[[-60,27],"Spawning: Sargasso Sea","point"],[[-28,38.5],"Azores","point"]],
 stat:"Every European eel was born in the Sargasso Sea, up to 6,000 km away",
 body:"Adult eels leave the rivers of Europe and swim across the Atlantic to spawn and die. Their leaf-shaped larvae drift back on the Gulf Stream (dashed), turn into see-through glass eels at the coast and swim up the rivers, where they may live for decades.",
 more:"Nobody has ever seen eels spawn. In 2022 scientists finally tracked tagged eels from the Azores all the way to the Sargasso Sea. The number of young eels reaching Europe has fallen by over 90% since the 1980s."}),
S({title:"Locust swarms",view:[-70,-5,60,32],globe:[-5,15,1.4],card:"left",
 lines:[{coords:[[-16,15.5],[-30,15],[-45,14],[-61,13.5]],kind:"red"},{coords:[[45,15],[46,9],[41,3],[38,1]],kind:"red"}],
 pins:[[[-61,13.5],"Caribbean, October 1988","point"],[[38,1],"Kenya, 2020","point"]],
 phPins:[ph([40,10],"A locust swarm")],
 stat:"In 1988 swarms of desert locusts flew about 5,000 km across the Atlantic, from West Africa to the Caribbean",
 body:"Desert locusts are usually shy grasshoppers. After rains, when crowds of them gather, they change colour and behaviour and set off in swarms that can cover hundreds of square kilometres, with 40 to 80 million locusts in each square kilometre.",
 more:"A swarm can eat as much in a day as tens of thousands of people. In 2019–2020 swarms bred in Yemen and the Horn of Africa and hit Kenya, the worst there in 70 years."}),
S({title:"The sardine run",view:[9,-37.5,35,-25],globe:[26,-32,4.5],card:"left",
 lines:[{coords:[[20,-35],[24,-34.4],[27.9,-33.2],[29.55,-31.7],[31.0,-29.9]],kind:"flow"}],
 pins:[[[20,-34.83],"Cape Agulhas","point"],[[29.55,-31.63],"Port St Johns","point"],[[31.03,-29.86],"Durban","point"]],
 stat:"Shoals of sardines over 7 km long move up South Africa’s east coast each winter",
 body:"From May to July, a tongue of cool water creeps up the Wild Coast and billions of sardines follow it. Dolphins herd them into tight bait balls, Cape gannets dive in from the air, and sharks, seals and Bryde’s whales join the feast.",
 more:"Scientists still argue about why the run happens: some of the sardines may be following cool water out of their normal range. Some years the run hardly comes at all."}),
S({title:"The biggest migration happens every night",view:[-180,-50,180,60],globe:[-150,0,1],
 stat:"Every night, billions of tonnes of small animals rise from the deep sea to the surface, then sink at dawn",
 body:"By day, krill, tiny shrimp-like animals, squid and lanternfish hide hundreds of metres down in the dark from hungry eyes. After sunset they swim up to feed on plankton near the surface, then dive again before sunrise.",
 more:"It is the largest migration on Earth by weight, and it happens in every ocean, every night. Navy sonar operators in the 1940s first noticed it as a ‘false bottom’ that rose at night."}),
S({title:"Now explore",view:W,globe:[-30,10,1],
 stat:"Pick an animal, then hover the countries on its route",
 body:"Many of these journeys cross dozens of borders, so migratory animals need countries to work together. The Ocean life tour visits the seas these animals feed in, and the Animals tour has more of the world’s wildlife.",
 more:"Switch on Currents to see the rivers in the sea that eels and turtles ride."})];

/* =====================================================================================================
   5. Where our food comes from (relief map; resource icons show where crops grow most today)
   ===================================================================================================== */
PC=COL.crops;
const CENTRES=[[[-98,19],"Mexico and Central America"],[[-71,-14],"The Andes"],[[38,36],"The Fertile Crescent"],[[38.5,9],"Ethiopia"],[[68,38],"Central Asia"],[[80,22],"India"],[[113,30],"China"],[[14,41],"The Mediterranean"]];
const CROPS=[
S({title:"Where our food comes from",view:W,globe:[20,25,1],
 pins:CENTRES.map(([at,l])=>[at,l,"point"]),
 phPins:[ph([39,37.5],"Wheat"),ph([110,25],"Rice terraces"),ph([-99,20.5],"Maize"),ph([-70,-15.5],"Andean potatoes"),ph([-77,-1],"Cacao pod"),ph([36.5,7],"Ethiopian coffee"),ph([145,-6],"Bananas"),ph([-93,16.5],"Tomatoes")],
 stat:"Of about 6,000 plants people have grown for food, just nine give two-thirds of all crop production",
 body:"Every crop began as a wild plant that someone, somewhere, chose to sow. The pins mark the ‘centres of origin’ where many of today’s crops were first farmed, from the Fertile Crescent to the Andes.",
 more:"The biggest nine are sugarcane, maize, rice, wheat, potatoes, soybeans, oil palm fruit, sugar beet and cassava. This tour follows where they and other foods began, and where they are grown most today."}),
S({title:"Vavilov’s centres",view:W,globe:[40,30,1],card:"left",
 pins:CENTRES.map(([at,l])=>[at,l,"point"]).concat([[[30.31,59.93],"Saint Petersburg: his seed bank","point"]]),
 stat:"In the 1920s and 30s Nikolai Vavilov collected seeds on five continents to find where crops were born",
 body:"The Russian botanist noticed that each crop has one region where it shows the most varieties, and argued that this is where it was first tamed. He named about eight such centres, mostly in mountains and hills far from today’s great farm belts.",
 more:"Vavilov was arrested in 1940 under Stalin and died in prison in 1943. During the 872-day siege of Leningrad his colleagues guarded the seed collection; some starved to death rather than eat the seeds."}),
S({title:"Wheat, barley and lentils",view:[16,25,55,42],globe:[40,34,3],card:"left",
 lines:[{coords:[[35,31.5],[35.8,34],[37.5,36.6],[40,37.3],[43,37],[45,35],[47,32.5],[48,30.5]],kind:"grass"}],
 pins:[[[39.8,37.7],"Karacadağ: einkorn wheat","point"],[[35.44,31.87],"Jericho","point"],[[38.4,35.87],"Abu Hureyra","point"],[[38.92,37.22],"Göbekli Tepe","point"]],
 iconPins:[ic([39.8,37.7],"wheat","#b88a1a")],
 phPins:[ph([46.1,30.96],"Ur: a city fed by barley")],
 stat:"About 10,500 years ago, farmers in the Fertile Crescent were growing wheat, barley, lentils, peas, chickpeas and flax",
 body:"This arc of hills, from the Jordan valley through south-east Turkey to the Zagros, had wild wheat and barley with big seeds. People gathered them, then sowed the best. DNA points to the Karacadağ hills in south-east Turkey as where einkorn wheat was first farmed.",
 more:"Farmers picked plants whose seeds stayed on the stalk instead of scattering, so they could harvest them; such wheat can no longer sow itself. Bread wheat came later, from a cross with a wild grass near the Caspian Sea."}),
S({title:"The world’s breadbaskets",view:[-130,-45,150,60],globe:[40,40,1.1],mode:"nature",biome:8,on:["resources"],
 pins:[[[33.5,48],"Ukraine","point"],[[-98.5,38.5],"Kansas","point"],[[-61,-35],"Pampas","point"]],
 phPins:[ph([-98.5,38.5],"Harvesting wheat"),ph([75.5,30.8],"Wheat in Punjab")],
 stat:"China, India and Russia grow the most wheat; Russia sells the most abroad",
 body:"Wheat left its cradle long ago. It grows best on the old grasslands lit up here: the steppes of Ukraine and Russia, the North American prairies, the Argentine pampas and Australia’s wheat belt, with their deep, dark soils. The wheat icons mark the great growing regions.",
 more:"Wheat is the most traded crop: about a quarter of it crosses a border. When war or drought hits one breadbasket, bread prices rise from Egypt to Indonesia."}),
S({title:"Rice from the Yangtze",view:[90,10,130,40],globe:[112,28,2.5],card:"left",on:["resources"],
 lines:[{coords:[[100.5,28],[104,29],[106.5,29.6],[110,30.6],[112,30.3],[114.3,30.6],[116,29.8],[118.8,32],[121.5,31.4]],kind:"river"}],
 pins:[[[121.35,30.02],"Hemudu: rice 7,000 years ago","point"],[[119.7,29.4],"Shangshan","point"]],
 iconPins:[ic([121.35,30.02],"rice","#b88a1a")],
 phPins:[ph([103,23.4],"Terraced fields, Yunnan"),ph([115.2,-8.4],"Rice terraces, Bali"),ph([102.3,19.9],"A paddy field in Laos")],
 stat:"Rice was tamed from wild rice in the Yangtze valley about 9,000 years ago; today China and India grow over half of it",
 body:"Villagers along the lower Yangtze gathered wild rice from marshes, then planted it in wet fields. Rice spread across Asia and became the main food of over half the world’s people. A different rice was tamed separately in West Africa, along the inner delta of the Niger, about 3,000 years ago.",
 more:"Rice plants can grow standing in water, which drowns most weeds; that is why rice fields are flooded. The rice icons show the great rice bowls, from the Mekong delta to Bangladesh."}),
S({title:"Maize from teosinte",view:[-110,12,-86,26],globe:[-100,19,4],card:"left",hi:["mx"],
 pins:[[[-100.5,18.3],"Balsas River valley","point"],[[-99.8,18.15],"Xihuatoxtla: maize 8,700 years ago","point"]],
 iconPins:[ic([-100.5,18.3],"corn","#c99a1a")],
 phPins:[ph([-99,20.5],"Maize")],
 stat:"Maize comes from teosinte, a wild grass of Mexico whose ‘cob’ held only about a dozen hard seeds",
 body:"About 9,000 years ago farmers in the Balsas River valley of south-west Mexico began choosing teosinte plants with more and softer seeds. Over thousands of years it became maize, with cobs of hundreds of kernels, which can no longer survive without people to plant it.",
 more:"Maize is now the world’s most-grown grain, over a billion tonnes a year. The United States grows about a third of it; most is fed to animals or made into fuel, not eaten by people directly."}),
S({title:"Potatoes from the Andes",view:[-82,-25,-60,-5],globe:[-71,-15,3],card:"left",hi:["pe","bo"],
 pins:[[[-69.3,-15.9],"Lake Titicaca","point"],[[-71.97,-13.53],"Cusco","point"]],
 iconPins:[ic([-69.3,-15.9],"potato","#8a5a2b")],
 phPins:[ph([-70,-15.5],"Andean potatoes")],
 stat:"Andean farmers grow about 4,000 kinds of native potato, first tamed near Lake Titicaca over 7,000 years ago",
 body:"High in the Andes, where few crops survive the frost, people tamed wild potatoes and bred them in every colour and shape. They invented chuño: potatoes frozen by night, trampled and dried by day, which keep for years.",
 more:"Potatoes reached Europe in the 1500s and fed its growing cities. Ireland came to rely on one kind; when blight struck in 1845–52, about a million people died. China now grows the most potatoes."}),
S({title:"Africa’s crops and coffee",view:[-40,-5,55,25],globe:[18,10,1.6],card:"left",on:["resources"],
 pins:[[[36,15],"Sorghum: eastern Sudan","point"],[[-2,16],"Pearl millet: the Sahel","point"],[[-4.5,14],"African rice: inner Niger delta","point"],[[38.7,9],"Teff","point"],[[36.2,7.3],"Kaffa: wild coffee","point"]],
 iconPins:[ic([36.2,7.3],"coffee","#6d4c41")],
 phPins:[ph([36.5,7],"Ethiopian coffee"),ph([44.2,15.4],"Coffee cherries, Yemen")],
 stat:"Sorghum, pearl millet, African rice, teff, yams and coffee were all first grown in Africa",
 body:"Sorghum was tamed on the plains of eastern Sudan about 5,000 years ago and is still a main grain for hundreds of millions of people. Pearl millet came from the Sahel, and teff, the tiny grain of Ethiopia’s injera bread, from the Ethiopian highlands.",
 more:"Arabica coffee grows wild in the mountain forests of south-west Ethiopia. Its seeds were first brewed into a drink in Yemen in the 1400s. Brazil now grows about a third of the world’s coffee (see the coffee icons)."}),
S({title:"Bananas and sugarcane",view:[130,-12,160,0],globe:[145,-6,3],card:"left",hi:["pg"],
 pins:[[[144.33,-5.78],"Kuk Swamp","point"]],
 iconPins:[ic([144.33,-5.78],"palm","#2e7d32")],
 phPins:[ph([145,-6],"Bananas"),ph([147,-9],"Sugarcane harvest")],
 stat:"At Kuk Swamp, in New Guinea’s highlands, people were farming bananas about 7,000 years ago",
 body:"New Guinea was one of the world’s first farming centres. Ditches and plant remains at Kuk show people draining swamps and growing bananas, taro and yams thousands of years ago. Sugarcane was also first grown in New Guinea and spread across Asia.",
 more:"In India people learned to make crystals of sugar, and our word ‘sugar’ comes from Sanskrit ‘śarkarā’. India now grows the most bananas; most of the bananas sold abroad are of one kind, the Cavendish."}),
S({title:"Chocolate from the Amazon",view:[-85,-14,-50,6],globe:[-75,-3,2.6],card:"right",on:["resources"],
 pins:[[[-79.15,-4.95],"Santa Ana–La Florida","point"]],
 iconPins:[ic([-79.15,-4.95],"cacao","#6d4c41")],
 phPins:[ph([-77,-1],"Cacao pod"),ph([-5.5,6.8],"Opening cacao pods, Côte d’Ivoire")],
 stat:"Traces in 5,300-year-old pots from Ecuador’s Amazon are the oldest signs of people using cacao",
 body:"Cacao trees grow wild in the upper Amazon. At Santa Ana–La Florida, in the forest foothills of the Andes, archaeologists found cacao residue in pots and bowls about 5,300 years old, earlier than any sign from Mexico.",
 more:"Cacao later became the sacred, frothy drink of the Olmec, Maya and Aztecs. Today about 40% of the world’s cocoa is grown in Côte d’Ivoire and much of the rest in Ghana (see the cocoa icons)."}),
S({title:"Chilli, tomatoes and beans",view:[-118,-20,-70,32],globe:[-90,10,1.8],card:"left",hi:["mx"],
 lines:[{coords:[[-80,-5],[-84,3],[-90,10],[-95,16],[-97.4,18.5]],kind:"flow"}],
 pins:[[[-97.4,18.46],"Tehuacán valley","point"],[[-80,-5],"Wild tomatoes: Peru and Ecuador","point"]],
 iconPins:[ic([-97.4,18.46],"tomato","#c2364f")],
 phPins:[ph([-93,16.5],"Tomatoes"),ph([-99,22],"Cherry tomatoes")],
 stat:"Most of the world’s chillies come from one pepper first tamed in Mexico, over 6,000 years ago",
 body:"Mexico also gave the world beans, squash, avocados and vanilla. Wild tomatoes, small as peas, grow in Peru and Ecuador; they were carried north and became big tomatoes in Mexico, where the Aztecs called them ‘tomatl’.",
 more:"Chillies spread round the world within a century of 1492, carried by Portuguese and Spanish ships; before then Indian, Thai and Korean food had no chilli. India now grows the most chillies, and China the most tomatoes."}),
S({title:"Soybeans from China",view:[-110,-40,150,60],globe:[30,20,1],card:"left",on:["resources"],
 lines:[{coords:[[-55.5,-13],[-48.5,-25.5],[-20,-32],[18,-37],[60,-25],[95,-6],[105.8,-6],[112,8],[121,30]],kind:"flow"},{coords:[[-91,41.5],[-125,40],[-160,40],[160,35],[125,33]],kind:"flow"}],
 pins:[[[118,36],"Soy first tamed: northern China","point"],[[-55.5,-13],"Mato Grosso","point"]],
 stat:"Soybeans were first farmed in China; now Brazil and the US grow most of them, and China buys most of what is traded",
 body:"Soy was tamed in northern China several thousand years ago and became tofu, soy sauce and miso. In the last 50 years it has boomed in Brazil and the American Midwest; the soy icons mark the biggest growing regions.",
 more:"About three-quarters of the world’s soy is fed to chickens, pigs and fish, not people. Soy fields have spread into Brazil’s Cerrado savanna and the edge of the Amazon."}),
S({title:"Crops far from home",view:W,globe:[0,10,1],
 lines:[{coords:[[-60,-10],[-30,-5],[0,3],[8,8]],kind:"flow"},{coords:[[36.2,7.3],[10,0],[-20,-15],[-45.5,-21.5]],kind:"flow"},{coords:[[-79,-4.9],[-50,0],[-20,4],[-6,6.5]],kind:"flow"},{coords:[[-69.3,-15.9],[-110,0],[-170,20],[150,30],[105,35]],kind:"flow"},{coords:[[144.3,-5.8],[110,5],[78,20]],kind:"flow"}],
 pins:[[[8,8],"Cassava: Nigeria grows the most","point"],[[-45.5,-21.5],"Coffee: Brazil","point"],[[-6,6.5],"Cocoa: Côte d’Ivoire","point"],[[105,35],"Potatoes: China","point"],[[78,20],"Bananas: India","point"]],
 phPins:[ph([-75.7,4.8],"Coffee in Colombia")],
 stat:"Most crops are now grown most far from where they began",
 body:"After 1492 crops crossed the oceans in both directions, in what is called the Columbian exchange. Cassava from the Amazon became a staple of Africa, and Nigeria now grows the most. Ethiopia’s coffee is grown most in Brazil, the Amazon’s cacao in West Africa and the Andes’ potato in China.",
 more:"Moving crops to new places can leave their pests and diseases behind, which is one reason they often grew better far from home."}),
S({title:"A vault for seeds",view:[-20,60,40,82],globe:[15.5,78.2,3],card:"left",
 pins:[[[15.49,78.24],"Svalbard Global Seed Vault","point"],[[36.7,36.2],"Aleppo seed bank","point"]],
 stat:"The Svalbard Global Seed Vault, dug into an Arctic mountain, holds over 1.3 million samples of seeds",
 body:"Since 2008 seed banks from around the world have sent spare copies of their seeds to this vault on Spitsbergen, kept at −18 °C in the permafrost. If a seed bank is lost to war or disaster, its seeds can be grown again.",
 more:"The first withdrawal came in 2015, when war in Syria cut off a seed bank near Aleppo that held wheat, barley and lentils from the Fertile Crescent; the seeds were regrown in Lebanon and Morocco. Wild relatives of crops hold genes that may help them survive a changing climate."}),
S({title:"Now explore",view:W,globe:[20,25,1],on:["resources"],
 stat:"Turn on Resources and pick Farms & fishing to see where food is grown today",
 body:"Compare where crops began with where they grow now. The Food tour follows dishes and drinks around the world, and the history tours tell the story of the Columbian exchange.",
 more:"The Nature map’s Human footprint tab shows how much land is farmed."})];

/* ---------- the five tours ---------- */
const fix=s=>{if(s.G){s._hsMerged=1;s.legend=null;s.hi=s.hi||[...new Set(s.G.flatMap(g=>g.codes))];s.hiSoft=s.hiSoft||[]}return s};
const TOURS={
 biomes:{name:"Guided tour on biomes",short:"Biomes",hint:"Tundra, taiga, steppe, savanna, rainforest and a mountain that climbs through them all, on the Nature map",steps:BIOMES,mode:"nature"},
 forests:{name:"Guided tour on forests",short:"Forests",hint:"The biggest forest, the tallest and oldest trees, forests that make rain, mangroves, cloud forests, loss and regrowth",steps:FORESTS,mode:"nature"},
 ocean:{name:"Guided tour on ocean life",short:"Ocean life",hint:"Coral reefs, kelp forests, cold currents full of fish, life without sunlight, whales, krill and plastic",steps:OCEAN,mode:"relief"},
 amigration:{name:"Guided tour on animal migration",short:"Animal migration",hint:"Wildebeest, a tern that flies pole to pole, a godwit’s 11-day flight, monarchs, salmon, eels and locusts",steps:MIGR,mode:"relief"},
 crops:{name:"Guided tour on where our food comes from",short:"Where food comes from",hint:"Wheat from the Fertile Crescent, maize from a wild grass, potatoes from the Andes, chocolate from the Amazon and a vault for seeds",steps:CROPS,mode:"relief"}};
const IDS=Object.keys(TOURS);
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))].filter(m=>m!==T.mode);
 PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:T.mode},group:"living",col:COL[id],steps:T.steps.map(fix),stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page, after Animals (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});const a=o.indexOf("animals");o.splice(a>=0?a+1:o.length,0,...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- the Nature map: each stop picks its tab (nsub, default Biomes) and can light one biome (biome:<n>) ---------- */
let natF=null;
function natSync(){try{if(!mine()||typeof allMapsColorMode==="undefined"||allMapsColorMode!=="nature")return;const St=psSteps()[ps.i];if(!St)return;
 const sub=St.nsub||"biomes";
 if(allMapsSubMode.nature!==sub){const b=document.querySelector('#allMapsSubModes [data-allmaps-sub="'+sub+'"]');if(b)b.click();natF=null;return}
 if(sub!=="biomes"){natF=null;return}
 const want=St.biome==null?null:St.biome,on=typeof gfNatureFocused==="function"&&gfNatureFocused();
 if(want===natF&&on===(want!=null))return;
 if(on&&typeof gfNatureShowAll==="function")gfNatureShowAll();natF=null;
 if(want!=null){const sw=document.querySelector('#populationLegend .gf-nat-sw[data-nb="'+want+'"]');if(sw){sw.click();natF=want}}}catch(e){console.error(e)}}
function natOff(){try{if(natF!=null&&typeof gfNatureShowAll==="function")gfNatureShowAll();natF=null}catch(e){}}
/* ---------- resource icons: on these tours only farms and fishing ---------- */
const RES_ALL=["fuel","metal","gem","farm","power"];let resMine=false;
function resSync(i){try{const L=window.GF_LAYERS;if(!L||!L.res)return;const St=mine()&&psSteps()[i],want=!!(St&&(St.on||[]).includes("resources"));
 const inp=typeof gfTourToggleInput==="function"?gfTourToggleInput("resources"):null,farmOnly=L.res.parts.size===1&&L.res.parts.has("farm");
 if(want){resMine=true;if(!farmOnly){L.res.parts=new Set(["farm"]);if(inp&&inp.checked)inp.dispatchEvent(new Event("change",{bubbles:true}))}}
 else if(resMine){L.res.parts=new Set(RES_ALL);resMine=false}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())resSync(i);else if(resMine)resSync(-1)}catch(e){}const r=_g.apply(this,arguments);if(mine()){[400,1300,2600,5000,8000,12000].forEach(t=>setTimeout(()=>{natSync();if(mine())resSync(ps.i)},t))}return r}}
if(typeof psEnd==="function"){const _e=psEnd;psEnd=function(){const was=mine();const r=_e.apply(this,arguments);if(was&&!(typeof psSwitching!=="undefined"&&psSwitching)){natOff();if(resMine){try{window.GF_LAYERS.res.parts=new Set(RES_ALL)}catch(e){}resMine=false}}return r}}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.biomes={mid:[
 {at:"Taiga",st:"Taiga",q:"Which is the biggest land biome?",o:["Tropical rainforest","Taiga (boreal forest)","Tundra","Savanna"],a:1,why:"The taiga circles the top of the world through Russia, Scandinavia, Canada and Alaska.",kc:"ru"},
 {at:"Mediterranean scrub",st:"Mediterranean scrub",q:"Which of these places does NOT have a Mediterranean climate?",o:["California","Central Chile","South Africa’s Cape","Florida"],a:3,why:"Florida has wet summers; Mediterranean places have dry summers and wet winters.",kc:"za"},
 {at:"Mountains: biomes stacked up",st:"Mountains: biomes stacked up",q:"About how much does the air cool for every 1,000 m you climb?",o:["About 1 °C","About 6.5 °C","About 15 °C","It gets warmer"],a:1,why:"That is why Kilimanjaro has glaciers just south of the Equator.",kc:"tz"}],
 recap:[
 {q:"Why are many of the world’s deserts found around 30° north and south?",o:["The ground there is sandy","Air sinks there and dries out","They are far from the sea","Mountains block the rain"],a:1,why:"Air that rose at the Equator sinks again near 30°, warming and drying as it falls.",st:"Why biomes follow latitude",kc:"eg"},
 {q:"The prairie, the pampas and the steppe are all…",o:["Deserts","Grasslands","Forests","Wetlands"],a:1,why:"Their deep, black soils made them the world’s breadbaskets.",st:"Grasslands: steppe, prairie and pampas",kc:"ar"}]};
TOURQ.forests={mid:[
 {at:"The Congo",st:"The Congo",q:"Bonobos live only on which side of the Congo River?",o:["North","South","Both","Neither: they live in Asia"],a:1,why:"The wide river keeps them apart from chimpanzees, which live north of it.",kc:"cd"},
 {at:"Borneo and New Guinea",st:"Borneo and New Guinea",q:"Which island has the most kinds of plants?",o:["Madagascar","Borneo","New Guinea","Great Britain"],a:2,why:"About 13,600 kinds, two-thirds of them found nowhere else.",kc:"pg"},
 {at:"Giant trees",st:"Giant trees",q:"What kind of tree is Hyperion, the tallest known?",o:["A giant sequoia","A coast redwood","A eucalyptus","A Douglas fir"],a:1,why:"It is about 116 m tall, in California’s Redwood National Park.",kc:"us"}],
 recap:[
 {q:"Which country has the biggest mangrove forest, shared with India?",o:["Indonesia","Bangladesh","Brazil","Nigeria"],a:1,why:"The Sundarbans, about 10,000 km², home to Bengal tigers.",st:"Mangroves",kc:"bd"},
 {q:"What happened to Monteverde’s golden toad?",o:["It was last seen in 1989","It became the national animal","It moved to Panama","It was found in 2019"],a:0,why:"It is now thought extinct.",st:"Cloud forests",kc:"cr"},
 {q:"Which country has roughly doubled its forest cover since the early 1980s?",o:["Brazil","China","Indonesia","Nigeria"],a:1,why:"From about 12% to about 24%, with huge planting projects like Saihanba.",st:"Forests come back",kc:"cn"}]};
TOURQ.ocean={mid:[
 {at:"Coral reefs and the Coral Triangle",st:"Coral reefs and the Coral Triangle",q:"What makes corals turn white, or ‘bleach’?",o:["Too much salt","Water that is too hot","Too much sunlight on the beach","Sharks"],a:1,why:"In hot water corals push out the algae that live in them and feed them.",kc:"au"},
 {at:"The anchoveta and El Niño",st:"The anchoveta and El Niño",q:"Which country has the biggest single-species fishery, of anchoveta?",o:["Japan","Norway","Peru","Iceland"],a:2,why:"The cold upwelling off Peru feeds vast shoals.",kc:"pe"},
 {at:"Life without sunlight",st:"Life without sunlight",q:"What starts the food chain at deep-sea vents?",o:["Sunlight","Bacteria living on chemicals","Seaweed","Falling leaves"],a:1,why:"Tubeworms house these bacteria inside their bodies.",kc:"ec"}],
 recap:[
 {q:"What is special about the Sargasso Sea?",o:["It is frozen","It has no coast","It is the saltiest lake","It is in the Pacific"],a:1,why:"Its edges are ocean currents; Bermuda, a British territory, lies inside it.",st:"The Sargasso Sea",kc:"gb"},
 {q:"Which fishery collapsed in 1992?",o:["Grand Banks cod","Peru anchoveta","Bering Sea pollock","Lofoten cod"],a:0,why:"Canada closed it on 2 July 1992; about 30,000 people lost their work.",st:"Too many boats",kc:"ca"}]};
TOURQ.amigration={mid:[
 {at:"The Arctic tern",st:"The Arctic tern",q:"Which bird has the longest yearly migration?",o:["The swallow","The Arctic tern","The emperor penguin","The ostrich"],a:1,why:"About 70,000 km a year, pole to pole and back; some of the tracked birds nested in Iceland.",kc:"is"},
 {at:"The godwit’s non-stop flight",st:"The godwit’s non-stop flight",q:"Where do Alaska’s bar-tailed godwits fly non-stop to?",o:["Mexico","Japan","New Zealand and Australia","Hawaii"],a:2,why:"Across the whole Pacific, with nowhere to land.",kc:"nz"},
 {at:"Monarch butterflies",st:"Monarch butterflies",q:"Where do eastern monarch butterflies spend the winter?",o:["Florida","Mountain forests in Mexico","Cuba","Brazil"],a:1,why:"Fir forests about 3,000 m up in central Mexico.",kc:"mx"}],
 recap:[
 {q:"Where are all European eels born?",o:["The Baltic Sea","The Mediterranean","The Sargasso Sea","The North Sea"],a:2,why:"Up to 6,000 km from the rivers where they grow up; in 2022 eels were tracked there from Portugal’s Azores.",st:"Eels to the Sargasso Sea",kc:"pt"},
 {q:"The wildebeest migration loops between the Serengeti and which reserve?",o:["Kruger","Maasai Mara","Okavango","Etosha"],a:1,why:"The Maasai Mara, in Kenya, across the Mara River.",st:"Wildebeest follow the rain",kc:"ke"},
 {q:"Which coast has the sardine run?",o:["South Africa’s east coast","Chile","Japan","Portugal"],a:0,why:"From May to July, up the Wild Coast towards Durban.",st:"The sardine run",kc:"za"}]};
TOURQ.crops={mid:[
 {at:"Wheat, barley and lentils",st:"Wheat, barley and lentils",q:"Where were wheat and barley first farmed?",o:["The Fertile Crescent","The Nile delta","The Ganges plain","The Yangtze valley"],a:0,why:"About 10,500 years ago, in the arc of hills from the Jordan valley to the Zagros.",kc:"tr"},
 {at:"Maize from teosinte",st:"Maize from teosinte",q:"Maize comes from which wild plant?",o:["Wild rice","Teosinte","Sorghum","Bamboo"],a:1,why:"A wild grass of south-west Mexico with only about a dozen hard seeds per ‘cob’.",kc:"mx"},
 {at:"Chocolate from the Amazon",st:"Chocolate from the Amazon",q:"The oldest signs of people using cacao come from which country?",o:["Mexico","Ecuador","Côte d’Ivoire","Spain"],a:1,why:"From 5,300-year-old pots at Santa Ana–La Florida, in Ecuador’s Amazon.",kc:"ec"}],
 recap:[
 {q:"Coffee grows wild in the forests of which country?",o:["Brazil","Colombia","Ethiopia","Vietnam"],a:2,why:"Arabica coffee comes from south-west Ethiopia’s mountain forests.",st:"Africa’s crops and coffee",kc:"et"},
 {q:"Where were bananas being farmed about 7,000 years ago?",o:["Kuk Swamp, New Guinea","Jamaica","Ecuador","Hawaii"],a:0,why:"Kuk is now a World Heritage Site.",st:"Bananas and sugarcane",kc:"pg"},
 {q:"Which seeds were the first ever taken out of the Svalbard seed vault?",o:["Rice from the Philippines","Wheat, barley and lentils for a seed bank from near Aleppo","Potatoes from Peru","Maize from Mexico"],a:1,why:"In 2015, after war in Syria cut off the seed bank.",st:"A vault for seeds",kc:"sy"}]};
}}catch(e){}

/* ---------- photos: card photos by "tour|stop", photo pins by label (Commons file names) ---------- */
const CARD={
 "biomes|Biomes":"Blue Marble Western Hemisphere.jpg","biomes|Why biomes follow latitude":"Sahara satellite hires.jpg","biomes|Tundra":"Polar Bear - Churchill, Manitoba (40585701364).jpg",
 "biomes|Taiga":"Ergaki, Siberian pine forest, Spruce forest, Taiga wilderness, Sayan Mountains, Siberia, Russia.jpg","biomes|Temperate forest":"European bison (Bison bonasus) male Białowieza.jpg",
 "biomes|Grasslands: steppe, prairie and pampas":"Steppe grassland in Ukraine.jpg","biomes|Mediterranean scrub":"Vineyards of Stellenbosch.jpg","biomes|Deserts":"Erg Chebbi in the evening light.jpg",
 "biomes|Savanna":"Acacia tree on a sunrise safari at the Serengeti National Park, Tanzania.jpg","biomes|Tropical rainforest":"Aerial view of the Amazon Rainforest.jpg",
 "biomes|Mountains: biomes stacked up":"Kilimanjaro from Amboseli.jpg","biomes|The human biome":"Combine harvesting wheat.jpg","biomes|Biomes on the move":"Ice melt on Yana Bay, northern Russia (MODIS 2019-06-22).jpg",
 "forests|Forests":"Amazon jungle from above.jpg","forests|The taiga: the biggest forest":"Ergaki, Siberian pine forest, Spruce forest, Taiga wilderness, Sayan Mountains, Siberia, Russia.jpg",
 "forests|The Amazon":"Amazon rainforest treetops in Tena, Ecuador.jpg","forests|Forests make rain":"Aerial view of the Amazon Rainforest.jpg","forests|The Congo":"Rainforest - Ituri (20874628148).jpg",
 "forests|Borneo and New Guinea":"Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 4.jpg","forests|Rainforests in the cold":"Valdivian rainforest.jpg",
 "forests|Mangroves":"Sunrise reflections over the mangroves, Makasutu, The Gambia - 2012.jpg","forests|Cloud forests":"Monteverde Cloud Forest 01.jpg",
 "forests|Where forests are lost":"Slash and burn in the rainforest.jpg","forests|Forests come back":"Saihanba National Forest Park(Autumn 2011) - panoramio.jpg",
 "ocean|Ocean life":"Whale Shark AdF.jpg","ocean|Coral reefs and the Coral Triangle":"Reefscape in the Bird's Head Seascape.jpg","ocean|Upwelling: where the fish are":"Atlantic Ocean in Western Sahara.jpg",
 "ocean|The great whales":"Grytviken Harbour, Island of South Georgia, United Kingdom.jpg","ocean|Krill and the polar seas":"Antarctic krill (Euphausia superba).jpg",
 "ocean|Too many boats":"Reine Lofoten 2009.JPG","ocean|Ocean parks":"Hawaiian monk seal - Neomonachus schauinslandi - Poipu beach, Kauai.jpg","ocean|Plastic seas":"004 Beach pollution in Tenerife - Atlantic Ocean beach plastic garbage debris.jpg",
 "amigration|Animals on the move":"Serengeti wildebeest migration JF.jpg","amigration|Wildebeest follow the rain":"Western white-bearded wildebeest (Connochaetes taurinus mearnsi) Mara River crossing 2c.jpg",
 "amigration|The Arctic tern":"Arctic tern (Sterna paradisaea) juvenile in flight Blonduos.jpg","amigration|Monarch butterflies":"Monarc Butterfly Reserve4, Michoacan, Mexico.JPG",
 "amigration|Humpback whales":"Humpback Whale-Megaptera novaeangliae (16793944076).jpg","amigration|Red crabs march to the sea":"Christmas Island Crabs on annual migration.JPG",
 "amigration|Locust swarms":"Desert Locust swarm.jpg",
 "crops|Where our food comes from":"Sunset-over-the-wheat-field-featured.jpg","crops|Wheat, barley and lentils":"Ziggarat of Ur 001.jpg","crops|The world’s breadbaskets":"Unload wheat by the combine Claas Lexion 584.jpg",
 "crops|Rice from the Yangtze":"Terrace field yunnan china denoised.jpg","crops|Maize from teosinte":"Corncobs.jpg","crops|Potatoes from the Andes":"Bitter potato varieties of Solanum curtilobum.png",
 "crops|Africa’s crops and coffee":"Coffee ceremony of Ethiopia and Eritrea 1.jpg","crops|Bananas and sugarcane":"Developing banana fruit.jpg","crops|Chocolate from the Amazon":"Cocoa pod.jpg",
 "crops|Chilli, tomatoes and beans":"Grape tomatoes on the vine at Ljubljana Central Market.JPG","crops|Crops far from home":"Breaking open cocoa pods in Ivory Coast.png"};
const PIN={
 "Taiga in the Sayan Mountains":"Ergaki, Siberian pine forest, Spruce forest, Taiga wilderness, Sayan Mountains, Siberia, Russia.jpg","Siberian taiga":"Ergaki, Siberian pine forest, Spruce forest, Taiga wilderness, Sayan Mountains, Siberia, Russia.jpg",
 "Acacia on the Serengeti":"Acacia tree on a sunrise safari at the Serengeti National Park, Tanzania.jpg","The Amazon from the air":"Aerial view of the Amazon Rainforest.jpg",
 "Erg Chebbi, Sahara":"Erg Chebbi in the evening light.jpg","Ukraine’s steppe":"Steppe grassland in Ukraine.jpg","Monteverde cloud forest":"Monteverde Cloud Forest 01.jpg","Monteverde":"Monteverde Cloud Forest 01.jpg",
 "Polar bear on the tundra":"Polar Bear - Churchill, Manitoba (40585701364).jpg","Cape winelands":"Vineyards of Stellenbosch.jpg","Thawing coast, Yana Bay":"Ice melt on Yana Bay, northern Russia (MODIS 2019-06-22).jpg",
 "Northeast Greenland from space":"Earth from Space- Northeast Greenland National Park ESA512867.jpg","Yakutsk in winter":"Russia, Saha, Jakutskaj, Yakutsk - 203-й микрорайон (Якутск) WMID4617167.jpg",
 "A moose":"Bull Moose (Alces alces) (29771391948).jpg","Moose in the boreal forest":"Bull Moose (Alces alces) (29771391948).jpg","European bison":"European bison (Bison bonasus) male Białowieza.jpg",
 "Externsteine, Teutoburg Forest":"Externsteine pano.jpg","Great Smoky Mountains":"Meadow in the Smoky Mountains (41923p).jpg","Steppe near Astana":"Astana-steppe-7748.jpg","Kazakh eagle hunters":"Kazakh Eagle Hunters.JPG",
 "Cedars of Lebanon":"Forest of The cedars of God.jpg","Constantia, Cape Town":"Constantia Winelands Cultural Landscape. Buitenverwachting and Vineyards.jpg",
 "Wadi Rum, Jordan":"Wadi rum desert.jpg","Deadvlei, Namib":"054e Dead camel thorn tree in Deadvlei Photo by Giles Laurent.jpg","Camels in the Gobi":"Camels in Gobi Desert 02.jpg",
 "Elephants below Kilimanjaro":"Elephants at Amboseli national park against Mount Kilimanjaro.jpg","Zebras and wildebeest":"Zebras and wildebeest Maasai Mara.jpg","Giraffes":"Three giraffes 01.jpg",
 "Ituri rainforest, Congo":"Rainforest - Ituri (20874628148).jpg","Cloud over Borneo’s forest":"Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 4.jpg",
 "Red-eyed tree frog":"Red eyed tree frog edit2.jpg","Kilimanjaro’s ice":"Snow and Ice on Kilimanjaro-1993.jpg",
 "Silversword, Haleakalā":"Silversword in Bloom, Haleakala, Maui, Hawaii.jpg","Rice terraces, Bali":"Rice terraces, Bali.jpg","Oil palms, Malaysia":"Oil Palm Plantations in Melaka.jpg",
 "Terraced fields, Yunnan":"Terrace field yunnan china denoised.jpg","Harvesting wheat":"Combine harvesting wheat.jpg","A forest fire at night":"Lick Fire on the Umatilla National Forest burning at night.jpg",
 "Valdivian rainforest":"Valdivian rainforest.jpg","The Sundarbans":"Tourist Boat in Sundarbans, West Bengal, India 03.jpg","Saihanba’s planted forest":"Saihanba National Forest Park(Autumn 2011) - panoramio.jpg",
 "Treetops near Tena, Ecuador":"Amazon rainforest treetops in Tena, Ecuador.jpg","Jaguar":"Jaguar (Panthera onca palustris) female Piquiri River 2.JPG","The Amazon River":"Amazon River - 2018.jpg",
 "Forest elephants, Dzanga Bai":"African forest elephants at Dzanga Bai, Central African Republic.jpg","Western lowland gorilla":"Western lowland silverback resting in Dzanga-Sangha National Park.jpg",
 "The Congo at Kisangani":"Sunset over the river Congo in Kisangani.jpg","Bornean orangutan":"Bornean orangutan.jpg","Raggiana bird-of-paradise":"Raggiana Bird-of-paradise 0A2A5379.jpg",
 "Bornean pygmy elephant":"Pygmy Elephant (Elephas maximus borneensis) (8071012817).jpg","Goodfellow’s tree-kangaroo":"Goodfellow's tree-kangaroo (Dendrolagus goodfellowi) in Caversham Wildlife Park, September 2023 11.jpg",
 "Proboscis monkey":"Proboscis monkey (Nasalis larvatus) female Labuk Bay.jpg","Kenai Fjords, Alaska":"Holgate Glacier, Kenai Fjords NP, Alaska.jpg",
 "Bengal tiger":"Bengal tiger (Panthera tigris tigris) female 3.jpg","Mangroves in The Gambia":"Sunrise reflections over the mangroves, Makasutu, The Gambia - 2012.jpg",
 "Monteverde forest":"Monteverde bosque.jpg","Arenal from Monteverde":"Arenal Volcano as seen from Monteverde.jpg","Keel-billed toucan":"Keel-billed toucan (Ramphastos sulfuratus sulfuratus) on foxtail palm (Wodyetia bifurcata) Cayo.jpg",
 "Slash and burn":"Slash and burn in the rainforest.jpg","Planting trees in Ethiopia":"Planting trees in Ethiopia.jpg","Costa Rica’s regrown forest":"Monteverde Reserve Costa Rica 02.jpg",
 "Great Barrier Reef":"Aerial View of Great Barrier Reef (Ank Kumar) 05.jpg","Antarctic krill":"Antarctic krill (Euphausia superba).jpg","Humpback whale":"Humpback Whale-Megaptera novaeangliae (16793944076).jpg",
 "Whale shark":"Whale Shark AdF.jpg","Manta ray":"Giant oceanic manta ray.jpg","Blacktip reef sharks":"Blacktip reef sharks (Carcharhinus melanopterus) Moorea.jpg","Emperor penguins":"EmperorPenguinColonyClose.jpg",
 "Hawaiian monk seal":"Hawaiian monk seal - Neomonachus schauinslandi - Poipu beach, Kauai.jpg","Reefs of the Bird’s Head":"Reefscape in the Bird's Head Seascape.jpg",
 "Rock Islands, Palau":"Rock-Islands-Palau-1-2016-aerial-view-Luka-Peternel.jpg","Bleached coral":"Bleached Staghorn Coral.jpg","Atlantic coast, Western Sahara":"Atlantic Ocean in Western Sahara.jpg",
 "Grytviken, South Georgia":"Grytviken Harbour, Island of South Georgia, United Kingdom.jpg","King penguins at Grytviken":"King Penguin at Grytviken Whaling Station (5663077741).jpg",
 "Whalers Bay, Deception Island":"Deception Islands - Whalers Bay.jpg","Green sea turtle":"Green turtle on a reef.jpg","A penguin leaping":"Penguin in Antarctica jumping out of the water.jpg",
 "Lofoten: cod still thrive":"Reine Lofoten 2009.JPG","Plastic on a beach, Tenerife":"004 Beach pollution in Tenerife - Atlantic Ocean beach plastic garbage debris.jpg",
 "Arctic tern":"Arctic tern (Sterna paradisaea) juvenile in flight Blonduos.jpg","A tern defends its nest":"Arctic tern (Sterna paradisaea) attacking, Amsterdam island, Svalbard.jpg",
 "Wildebeest on the move":"Serengeti wildebeest migration JF.jpg","Crossing the Mara River":"Western white-bearded wildebeest (Connochaetes taurinus mearnsi) Mara River crossing 2c.jpg","Zebra and wildebeest":"Zebra and Wildebeest July 2024.jpg",
 "Monarchs in Mexico":"Monarc Butterfly Reserve4, Michoacan, Mexico.JPG","Red crabs on the march":"Christmas Island Crabs on annual migration.JPG","A female with her eggs":"Christmas island red crabs - female with eggs chris bray-2.jpg",
 "A locust swarm":"Desert Locust swarm.jpg",
 "Wheat":"Sunset-over-the-wheat-field-featured.jpg","Rice terraces":"Terrace field yunnan china denoised.jpg","Maize":"Corncobs.jpg","Andean potatoes":"Bitter potato varieties of Solanum curtilobum.png",
 "Cacao pod":"Cocoa pod.jpg","Ethiopian coffee":"Ethiopian Coffee Ceremony Set.jpg","Bananas":"Developing banana fruit.jpg","Tomatoes":"Grape tomatoes on the vine at Ljubljana Central Market.JPG",
 "Ur: a city fed by barley":"Ziggarat of Ur 001.jpg","Wheat in Punjab":"Wheat field in Punjab.jpg","A paddy field in Laos":"Water reflection of a boy feeding hay to a cow in a paddy field at golden hour in Laos.jpg",
 "Coffee cherries, Yemen":"Yemeni Coffee Cherries Closeup.jpg","Sugarcane harvest":"Harvest Sugar Cane 5.jpg","Opening cacao pods, Côte d’Ivoire":"Breaking open cocoa pods in Ivory Coast.png",
 "Cherry tomatoes":"Cocktail tomatoes at Campbell farmer's market.jpg","Coffee in Colombia":"Coffee tree in Hacienda Guayabal, Colombia.jpg"};
const PHOTOS=window.GF_LIVING_PHOTOS||[];
/* new photos name their tour, their card stop and/or their pin labels */
PHOTOS.forEach(p=>{if(p.card&&p.tour)CARD[p.tour+"|"+p.card]=p.f;(p.pins||[]).forEach(l=>PIN[l]=p.f)});
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
try{const TP=window.GF_TOUR_PH,lib=TP&&TP.photos||[];if(lib.length){if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));lib.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")lib.forEach(p=>GF_EXTRA_PHOTOS.push(p))}}catch(e){}
const findP=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d)||PHOTOS.find(x=>x.f===f)||null}catch(e){return null}};
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St){const want=CARD[ps.tour+"|"+St.title];if(want){const p=findP(want);if(p)return p}}}catch(e){}return _pf.apply(this,arguments)}}
try{if(typeof GF_SQ_FILE!=="undefined")Object.assign(GF_SQ_FILE,PIN)}catch(e){}
/* photo pins: one of each subject a tour, never the stop's own card photo; registered just before each stop draws */
const KEEP=new Map();
IDS.forEach(id=>{const steps=PS_TOURS[id].steps,cards={};steps.forEach(St=>{St.phPins=(St.phPins||[]).filter(q=>PIN[q.label]);if(CARD[id+"|"+St.title])cards[St.title]=CARD[id+"|"+St.title]});
 if(window.gfOneOfEach)gfOneOfEach(steps,PIN,cards,5,8);steps.forEach(St=>KEEP.set(St,(St.phPins||[]).map(q=>Object.assign({},q))))});
function prep(St){try{const K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 const labs=new Set(K.map(q=>q.label));if(St._restored)St._restored=St._restored.filter(r=>!labs.has(r[1]));if(St.pins)St.pins=St.pins.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));if(St._pins0)St._pins0=St._pins0.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));St._sqPruned=-1;return true}}catch(e){console.error(e)}}
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* covers for the Guided tours page cards */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={biomes:"Acacia tree on a sunrise safari at the Serengeti National Park, Tanzania.jpg",forests:"Valdivian rainforest.jpg",ocean:"Reefscape in the Bird's Head Seascape.jpg",amigration:"Western white-bearded wildebeest (Connochaetes taurinus mearnsi) Mara River crossing 2c.jpg",crops:"Corncobs.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
