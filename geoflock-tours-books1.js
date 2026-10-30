/* GeoFlock: four Mapped books tours (big-argument books about the world, followed on the map).
   bprisoners  "Prisoners of Geography"   Tim Marshall, 2015
   bggs        "Guns, Germs, and Steel"   Jared Diamond, 1997
   bnations    "Why Nations Fail"         Daron Acemoglu and James A. Robinson, 2012
   bcollapse   "Collapse"                 Jared Diamond, 2005
   Each stop shows one of the book's claims on the map. The books' ideas are summarised in our own words and presented as
   the authors' views; where other scholars disagree, the card says so in a line. No book covers or long quotes.
   Stops use per-stop layers (on:[…]), the History map for one stop (mode:"history", sub:"<year>/<group>") and the Economy
   map for one stop (mode:"gdp"), both through the shared stopModes switch; Guns, Germs, and Steel stays on the Relief map
   and lays an empire (gfEmpire) or the climate zones (gfClimate) over it instead (geoflock-tourover.js); the ruler (gfRuler), the true-size country
   dragger (ghosts) and height cross-sections in the card (xsec).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BOOKS1_PHOTOS. */
window.GF_BOOKS1_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bprisoners:"#b07a4a",bggs:"#a5683f",bnations:"#9a5a48",bcollapse:"#8c7350"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* =====================================================================================================
   1. Prisoners of Geography (Tim Marshall, 2015)
   ===================================================================================================== */
const PRIS=[
S({title:"Prisoners of Geography",view:W,globe:[40,30,1],
 phPins:[ph([37.62,55.75],"The Kremlin, Moscow"),ph([88,31.5],"The Tibetan Plateau"),ph([-90.07,29.95],"Steamboats on the Mississippi"),ph([15.3,-4.3],"The Congo at Kinshasa"),ph([86.9,27.99],"The Himalayas"),ph([126.68,37.96],"The DMZ at Panmunjom"),ph([-79.6,9.0],"The Panama Canal"),ph([-150,78],"Icebreakers in the Arctic"),ph([29.05,41.1],"The Bosporus")],
 stat:"Tim Marshall’s 2015 bestseller explains world politics in ten maps",
 body:"Marshall, a British journalist who reported from some 40 countries, argues that leaders are never free to do whatever they like: mountains, rivers, plains and seas shape their choices. This tour follows his ten regions, from Russia’s plains to the melting Arctic.",
 more:"Marshall says geography is not destiny but a set of limits that every leader must work within. Some critics feel the book gives geography too much weight compared with people, ideas and economics."}),
S({title:"Russia’s open door",view:[-48,40,62,66],globe:[25,53,2.6],card:"left",hi:["ru"],gfRuler:{a:[18.65,54.35],b:[19.94,50.06]},
 xsec:{title:"The North European Plain, Paris to Moscow",pts:[[2.35,48.86,"Paris"],[4.35,50.85,"Brussels"],[9.73,52.37],[13.4,52.52,"Berlin"],[17,52.4],[21.01,52.23,"Warsaw"],[24.5,53.2],[27.56,53.9,"Minsk"],[32.05,54.78,"Smolensk"],[35,55.3],[37.62,55.75,"Moscow"]],mark:300,note:"The dashed line marks 300 m. From Paris to Moscow the land hardly rises: no mountain range stands in an army’s way."},
 lines:[{coords:[[2.35,48.86],[13.4,52.52],[21.01,52.23],[27.56,53.9],[37.62,55.75]],kind:"flow"}],
 pins:[[[37.62,55.75],"Moscow","point"],[[21.01,52.23],"Warsaw","point"]],
 stat:"Marshall’s key to Russia: a flat plain runs from France to the Urals, and Poland is its narrowest point",
 body:"The North European Plain has no mountains to stop an invader: see the flat cross-section in this card. Between the Baltic Sea and the Carpathian Mountains it narrows to under 500 km (drag the ruler). Marshall argues that Russia’s leaders have always wanted to control or neutralise this gap.",
 more:"Poles, Swedes, the French under Napoleon in 1812 and Germans twice, in 1914 and 1941, came at Russia across this plain. Marshall reads Moscow’s wish for friendly or weak neighbours to its west through this history."}),
S({title:"The hunt for a warm-water port",view:[-89,30,150,78],globe:[60,60,1.6],card:"left",hi:["ru"],on:["connections"],
 pins:[[[33.08,68.97],"Murmansk","point"],[[131.89,43.12],"Vladivostok","point"],[[33.52,44.6],"Sevastopol","point"],[[29.05,41.12],"The Bosporus","point"],[[12.65,56.0],"Danish straits","point"]],
 iconPins:[ic([33.52,44.6],"ship"),ic([131.89,43.12],"ship"),ic([33.08,68.97],"ship")],
 phPins:[ph([29.06,41.05],"The Bosporus")],
 stat:"The world’s largest country has no major port that is ice-free all year with an open route to the oceans",
 body:"Marshall argues that Russia’s great weakness is its coastline. Most of it is frozen for months. Murmansk stays open thanks to warm Atlantic water but is far from everywhere. Ships from the Black Sea must pass the Bosporus, which Turkey controls, and ships from the Baltic must pass the narrow Danish straits.",
 more:"The shipping lanes (shown) squeeze through these chokepoints. Marshall sees Russia’s annexation of Crimea in 2014, which most countries do not recognise, as partly about keeping its Black Sea Fleet base at Sevastopol."}),
S({title:"China: a heartland and its buffers",view:[33,15,135,55],globe:[103,35,2],card:"left",hi:["cn"],
 pins:[[[113.6,34.7],"The Han heartland: the North China Plain","point"],[[91.11,29.65],"Tibet","point"],[[87.6,43.8],"Xinjiang","point"],[[111.7,40.8],"Inner Mongolia","point"],[[126.6,45.75],"Manchuria","point"]],
 phPins:[ph([116.02,40.36],"The Great Wall at Badaling"),ph([75.99,39.47],"Kashgar"),ph([110.5,30.85],"The Three Gorges")],
 stat:"Most of China’s 1.4 billion people live in the eastern lowlands, watered by the Yellow and Yangtze rivers",
 body:"Marshall describes the Han Chinese heartland as fertile plains with the sea to the east. Around it lie mountains, deserts and plateaus. He argues that Beijing treats control of Tibet, Xinjiang and Inner Mongolia as a security buffer that keeps rivals far from the heartland.",
 more:"The Tibetan Plateau is also where many of Asia’s great rivers rise, including the Yangtze and the Mekong. Many Tibetans and Uyghurs see Chinese rule differently, and these regions’ status remains a sensitive political issue."}),
S({title:"America’s lucky geography",view:[-163,22,-66,52],globe:[-95,38,2.3],card:"left",hi:["us"],on:["rivers"],
 pins:[[[-90.07,29.95],"New Orleans","point"],[[-90.2,38.63],"St Louis","point"],[[-80,40.44],"Pittsburgh: the Ohio","point"],[[-95.94,41.26],"Omaha: the Missouri","point"]],
 phPins:[ph([-90.08,29.96],"A New Orleans brass band")],
 stat:"Marshall calls the United States the luckiest country in geography: rich land, great rivers and two oceans for moats",
 body:"The Mississippi and its tributaries, the Missouri and the Ohio (shown in blue), carry cheap barges through the farmland of the Midwest down to New Orleans. Marshall argues that once the young country bought the Louisiana Territory in 1803 and controlled this river system, it was set to become a great power.",
 more:"With the Atlantic and Pacific on either side and weaker neighbours to north and south, the US has rarely had to fear invasion by land. That leaves it free to send its navy around the world."}),
S({title:"Europe’s rivers and harbours",view:[-36,35,30,60],globe:[10,48,2.6],card:"left",on:["rivers"],
 pins:[[[4.4,51.9],"Rotterdam: mouth of the Rhine","point"],[[19.04,47.5],"Budapest: on the Danube","point"],[[0,42.7],"The Pyrenees","point"],[[10,46.5],"The Alps","point"]],
 phPins:[ph([4.2,51.95],"The port of Rotterdam"),ph([19.05,47.51],"Budapest’s parliament on the Danube")],
 stat:"Western Europe’s long rivers, many of them navigable, mostly do not meet, says Marshall",
 body:"Marshall argues that Europe’s rivers, such as the Rhine and the Danube, helped trade grow, while mountains and separate river basins helped many separate nations form. Its broken coastline is full of natural harbours.",
 more:"He contrasts the flat, well-watered north with the south: Spain’s high central plateau and short rivers, he says, made it harder to grow rich than France or Germany."}),
S({title:"Africa: bigger than it looks",view:[-69,-38,55,40],globe:[18,2,1.4],card:"left",hi:["cd"],
 ghosts:[{code:"us",at:[2,22],col:"#b0563a",label:"USA, true size"},{code:"cn",at:[22,-1],col:"#a5683f",label:"China, true size"},{code:"in",at:[27,-25],col:"#8c7350",label:"India, true size"}],
 pins:[[[13.5,-5.4],"Livingstone Falls: rapids block ships from the sea","point"],[[15.3,-4.3],"Kinshasa","point"]],
 phPins:[ph([15.32,-4.3],"The Congo at Kinshasa")],
 stat:"Africa is about 30 million km²: the USA, China and India would all fit inside it",
 body:"Marshall points out that common world maps shrink Africa. Drag the three ghosts around: Africa holds them all. He argues that its rivers, though huge, are broken by waterfalls and rapids, so they cannot carry ships far inland as the Rhine or Mississippi can, and its smooth coast has few deep natural harbours.",
 more:"The Congo is the world’s deepest river, but rapids below Kinshasa stop ships coming up from the sea. Marshall also blames borders drawn by European powers, which often cut across peoples, for many of Africa’s conflicts."}),
S({title:"Lines in the sand",view:[17,24,52,42],globe:[40,32,2.8],card:"left",mode:"history",sub:"1914/ott",
 lines:[{coords:[[35.07,32.93],[38.5,33.6],[41.5,34.4],[44.39,35.47]],kind:"dash"}],
 pins:[[[35.07,32.93],"Acre","point"],[[44.39,35.47],"Kirkuk","point"],[[36.29,33.51],"Damascus","point"],[[44.36,33.31],"Baghdad","point"],[[43.13,36.34],"Mosul","point"]],
 phPins:[ph([36.31,33.51],"Old Damascus")],
 stat:"In 1916 a British and a French diplomat secretly split the Ottoman Middle East along a line, roughly from Acre to Kirkuk",
 body:"This map shows the Ottoman Empire in 1914. In the Sykes–Picot agreement, Mark Sykes and François Georges-Picot divided its Arab lands into British and French zones; the dashed line is a rough sketch of the split. Marshall argues that borders drawn this way ignored the region’s peoples, faiths and geography.",
 more:"Sykes is said to have described his line as running from the ‘e’ in Acre to the last ‘k’ in Kirkuk. The final borders of Iraq, Syria, Lebanon, Jordan and Palestine came later, at conferences after the war."}),
S({title:"India and Pakistan",view:[37,5,95,38],globe:[75,26,2.4],card:"left",hi:["in","pk"],hiSoft:["af"],
 pins:[[[67.0,24.86],"Karachi","point"],[[70.4,28.4],"The Indus valley","point"],[[71.1,34.08],"The Khyber Pass","point"],[[77.21,28.61],"Delhi","point"],[[84,28.6],"The Himalayas","point"]],
 phPins:[ph([74.31,31.59],"Badshahi Mosque, Lahore"),ph([77.24,28.66],"The Red Fort, Delhi")],
 stat:"The Himalayas wall South Asia off from China, so India and Pakistan face each other",
 body:"Marshall argues that the world’s highest mountains make a direct land war between India and China very hard, while India and Pakistan share a long border on open plains. Pakistan’s heartland is the Indus valley, close to India, which he says is why Pakistan seeks friendly influence in Afghanistan behind it.",
 more:"Both countries were born in the partition of British India in 1947, and both claim the region of Kashmir. They have fought several wars and both have nuclear weapons."}),
S({title:"Korea: Seoul within range",view:[113,32,134,44],globe:[128,38,4],card:"left",hi:["kr","kp"],hiSoft:["jp"],gfRuler:{a:[126.98,37.57],b:[126.68,37.956]},
 pins:[[[126.98,37.57],"Seoul","point"],[[125.75,39.02],"Pyongyang","point"],[[126.68,37.956],"Panmunjom, on the DMZ","point"]],
 phPins:[ph([126.99,37.55],"Seoul’s skyline")],
 stat:"Half of South Korea’s people live in and around Seoul, only about 50 km from the border",
 body:"Marshall points out that Seoul lies within range of North Korea’s artillery dug into the hills north of the DMZ (drag the ruler). That, he argues, is why neither side can easily start a war: both would pay a terrible price.",
 more:"The 1953 armistice ended the fighting of the Korean War, but no peace treaty was ever signed. Japan, a short sea crossing away, watches closely: Marshall’s chapter covers both."}),
S({title:"Latin America’s walls",view:[-113,-42,-33,14],globe:[-65,-12,1.8],card:"left",hi:["pe"],
 xsec:{title:"Peru, from Lima over the Andes into the Amazon",pts:[[-77.04,-12.05,"Lima"],[-76.6,-11.8],[-76.2,-11.6,"Ticlio pass"],[-75.9,-11.52,"La Oroya"],[-75.69,-11.42,"Tarma"],[-75.3,-10.8],[-74.9,-9.7],[-74.55,-8.38,"Pucallpa"]],mark:3000,note:"The dashed line marks 3,000 m. The real road over the Ticlio pass tops 4,800 m; the chart’s heights are smoothed."},
 pins:[[[-77.04,-12.05],"Lima","point"],[[-74.55,-8.38],"Pucallpa, Amazon","point"],[[-79.6,9.0],"Panama Canal","point"],[[-58.38,-34.6],"Buenos Aires","point"]],
 phPins:[ph([-79.59,8.99],"The Panama Canal"),ph([-62,-4],"The Amazon from above")],
 stat:"Most South Americans live near the coasts, cut off from each other by the Andes and the Amazon",
 body:"Marshall argues that Latin America’s geography works against it: the Andes rise straight behind the Pacific coast (see the cross-section) and the rainforest fills the middle, so it is hard to link the continent by road and rail. He also blames the way Spanish and Portuguese colonists ran it, for the benefit of a small elite near the coast.",
 more:"He picks out Argentina’s River Plate region, with good farmland and a navigable river system, as the region’s great natural advantage."}),
S({title:"The Arctic opens up",view:[-22,55,112,82],globe:[60,80,1.6],card:"left",hi:["ru"],hiSoft:["ca","us","no","dk","is","se","fi","gl"],
 lines:[{coords:[[33.08,69.5],[58,71],[80,74],[105,77.8],[140,75.5],[170,70],[180,67.5]],kind:"flow"}],
 pins:[[[33.08,69.2],"Murmansk","point"],[[105,77.8],"The Northern Sea Route","point"]],
 phPins:[ph([-150,80],"Icebreakers in the Arctic")],
 stat:"As the ice shrinks, a sea route along Russia’s north coast can cut the voyage from Europe to East Asia by up to about 40%",
 body:"Marshall’s last chapter looks north. Summer sea ice has shrunk a great deal since satellite records began in 1979, opening shipping lanes and seabed oil and gas. Russia has by far the longest Arctic coast and the largest fleet of icebreakers.",
 more:"Eight countries border the Arctic. Marshall argues that the ‘great game’ for its routes and resources has only just begun."}),
S({title:"Now explore",view:W,globe:[40,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch on the relief map and look for Marshall’s walls and doors: the Himalayas, the Andes, the Sahara and the flat plain from Paris to Moscow. Turn on Connections to find the world’s chokepoints. Then try the Guns, Germs, and Steel tour, another book about how geography shapes history."})];

/* =====================================================================================================
   2. Guns, Germs, and Steel (Jared Diamond, 1997)
   ===================================================================================================== */
const GGS=[
S({title:"Guns, Germs, and Steel",view:W,globe:[40,20,1],
 phPins:[ph([145.5,-6],"The New Guinea highlands"),ph([-71.98,-13.51],"Sacsayhuamán, Cusco"),ph([38.92,37.22],"Göbekli Tepe"),ph([-72.55,-13.16],"A llama at Machu Picchu"),ph([35,-1.5],"Zebras: never tamed"),ph([118.8,32.06],"Zheng He’s treasure ship"),ph([114.35,36.1],"A Chinese oracle bone"),ph([45.64,31.32],"A cuneiform tablet")],
 stat:"Jared Diamond’s 1997 book asks why some peoples conquered others, and won the 1998 Pulitzer Prize",
 body:"Diamond, an American biologist and geographer, argues that the answer lies in geography, not in any difference between peoples. Where farming began early, with good plants and animals, people built crowded societies with metal tools, writing, empires and deadly germs.",
 more:"The book is hugely popular. Many historians and anthropologists praise its big picture, while others criticise it as too deterministic, leaving too little room for the choices people and states made."}),
S({title:"Yali’s question",view:[114,-14,156,2],globe:[145,-6,3.5],card:"left",hi:["pg"],hiSoft:["id"],
 pins:[[[145.79,-5.22],"Madang","point"],[[144.33,-5.78],"Kuk Swamp: early farming","point"]],
 phPins:[ph([145.4,-6.08],"Asaro mud men")],
 stat:"In 1972 a New Guinean politician, Yali, asked Diamond why white people had so much ‘cargo’ and New Guineans so little",
 body:"‘Cargo’ meant manufactured goods: steel axes, matches, cloth, medicines. Diamond spent 25 years trying to answer Yali’s question, and this book is his answer. He insists it has nothing to do with intelligence: he found New Guineans at least as clever as Westerners.",
 more:"New Guinea’s highlanders were among the world’s first farmers, growing crops at Kuk Swamp thousands of years ago. But, Diamond argues, their crops were poor in protein and they had no big animals to tame."}),
S({title:"Cajamarca, 1532",view:[-92,-20,-66,12],globe:[-76,-8,2.5],card:"left",gfEmpire:{y:1530,gk:"inca",name:"Inca Empire"},
 lines:[{coords:[[-79.52,8.98],[-80.5,2],[-81.2,-2],[-80.45,-3.57],[-79.5,-5.5],[-78.52,-7.16]],kind:"flow"}],
 pins:[[[-78.52,-7.16],"Cajamarca","point"],[[-80.45,-3.57],"Tumbes","point"],[[-79.52,8.98],"Panama","point"],[[-71.97,-13.53],"Cusco, the Inca capital","point"]],
 iconPins:[ic([-78.52,-7.16],"swords")],
 phPins:[ph([-72.55,-13.16],"Machu Picchu")],
 stat:"Francisco Pizarro, with 168 Spaniards, captured the Inca emperor Atahualpa in front of an army of thousands",
 body:"This map shows the Inca Empire in 1530, the largest in the Americas. Diamond opens with this ambush at Cajamarca. He lists the direct reasons the Spanish won: steel swords and armour, guns, horses, writing that spread news and plans, ships, and the smallpox that had already killed the previous emperor.",
 more:"Then he asks the deeper question: why did Spaniards reach Peru, and not Incas reach Spain? The rest of the book traces the answer back over 13,000 years."}),
S({title:"A head start in the Fertile Crescent",view:[17,26,52,42],globe:[40,34,3],card:"left",hi:["iq","sy","lb","il","ps","jo"],hiSoft:["tr","ir"],on:["rivers"],
 pins:[[[35.44,31.87],"Jericho","point"],[[38.92,37.22],"Göbekli Tepe","point"],[[38.4,35.87],"Abu Hureyra","point"],[[44.95,35.55],"Jarmo","point"],[[32.83,37.67],"Çatalhöyük","point"]],
 iconPins:[ic([40,35.2],"wheat"),ic([37,33],"wheat")],
 phPins:[ph([38.92,37.22],"Göbekli Tepe")],
 stat:"By about 8500 BC people in the Fertile Crescent were farming wheat, barley, peas and lentils",
 body:"Diamond argues that this arc of hills and river valleys, from Israel to Iraq, was lucky: its wild plants included big-seeded grasses that were easy to grow, store and carry. So farming began here early, and with it villages, towns and, in time, the first cities and states.",
 more:"Its founder crops, along with sheep, goats, cattle and pigs, soon spread west into Europe and east towards India. Göbekli Tepe, its stone pillars carved some 11,600 years ago, shows how much people here were building even before farming."}),
S({title:"Farming began more than once",view:W,globe:[20,20,1],card:"left",
 pins:[[[40,35],"Fertile Crescent: wheat, barley","point"],[[112,34.5],"China: rice, millet","point"],[[144.3,-5.8],"New Guinea: taro, bananas","point"],[[-97,17.5],"Mesoamerica: maize, beans","point"],[[-72,-13],"The Andes: potatoes","point"],[[-87,37],"Eastern North America: sunflowers","point"],[[39,9],"Ethiopia: teff, coffee","point"],[[3,13],"The Sahel: sorghum","point"]],
 iconPins:[ic([40,35],"wheat"),ic([112,34.5],"rice"),ic([-97,17.5],"corn"),ic([-72,-13],"potato"),ic([39,9],"coffee"),ic([144.3,-5.8],"palm"),ic([3,13],"wheat")],
 phPins:[ph([-97.2,18.5],"Maize cobs"),ph([-70,-16],"Andean potatoes")],
 stat:"People invented farming on their own in only a handful of places, and some got far better crops than others",
 body:"Diamond counts several homelands where farming began independently, shown here. The richest packages of wild plants grew in the Fertile Crescent and China. Elsewhere, he argues, farming started later or with crops that were harder to tame: wild maize, for example, took thousands of years of breeding to give big cobs.",
 more:"Experts still argue about how many centres there were: Africa and New Guinea may have had several. From these homelands, crops spread to their neighbours."}),
S({title:"Animals worth taming",view:W,globe:[60,30,1],card:"left",
 pins:[[[45,48],"Horse: the western steppe","point"],[[39,37],"Sheep, goats, cattle, pigs","point"],[[48,20],"Dromedary camel","point"],[[64,42],"Bactrian camel","point"],[[90,33],"Yak","point"],[[85,24],"Water buffalo","point"],[[32,22],"Donkey","point"],[[-70,-15],"Llama and alpaca","point"],[[36,-1.5],"Zebra: never tamed","point"]],
 iconPins:[ic([45,48],"paw"),ic([39,37],"paw"),ic([48,20],"paw"),ic([64,42],"paw"),ic([90,33],"paw"),ic([85,24],"paw"),ic([32,22],"paw"),ic([-70,-15],"paw")],
 phPins:[ph([103,46.5],"Horse racing in Mongolia"),ph([-72.55,-13.16],"A llama at Machu Picchu")],
 stat:"Of the 14 big mammals people ever domesticated, 13 came from Eurasia; only the llama came from the Americas",
 body:"Diamond argues that few wild animals can be tamed: they must eat plants, grow fast, breed in captivity, stay calm and live in herds with a leader. Eurasia had horses, cattle, sheep, goats and pigs. Zebras, hippos and bears never made the cut.",
 more:"Big animals gave meat, milk, leather and wool, pulled ploughs and carts, and carried soldiers. Diamond borrows a line from Tolstoy to explain it: every tame animal is alike, but every untameable one fails in its own way."}),
S({title:"Eurasia lies east–west",view:[-91,10,116,60],globe:[60,35,1.6],card:"left",on:["grid"],gfRuler:{a:[38.5,36],b:[112.45,34.62]},
 lines:[{coords:[[-9,38.7],[10,40],[38.5,36],[60,37],[80,36],[100,35],[112.45,34.62]],kind:"dash"}],
 pins:[[[38.5,36],"Fertile Crescent","point"],[[112.45,34.62],"Yellow River","point"],[[-9,38.7],"Lisbon","point"]],
 phPins:[ph([75,31],"Wheat in the Punjab")],
 stat:"Eurasia’s long axis runs east–west, so crops could spread thousands of kilometres without changing climate",
 body:"Diamond’s most famous map idea: places at the same latitude share similar day lengths, seasons and climates. From the Fertile Crescent, wheat and barley spread both west to Spain and east to India and China, about 6,500 km along roughly the same latitude (drag the ruler; the grid shows the lines of latitude).",
 more:"A crop that flowers when days get long, or that needs a cold winter, does well along the same band. Along with crops went animals, tools, and ideas such as the wheel and writing."}),
S({title:"The Americas stand on end",view:[-143,-22,-58,42],globe:[-80,10,1.4],card:"left",on:["grid"],gfRuler:{a:[-97.4,18.5],b:[-71.97,-13.53]},
 lines:[{coords:[[-97.4,18.5],[-88,14],[-80,8],[-75,2],[-76,-6],[-71.97,-13.53]],kind:"dash"},{coords:[[-97.4,18.5],[-97,25],[-95,31],[-88,37]],kind:"flow"}],
 pins:[[[-97.4,18.5],"Mesoamerica","point"],[[-71.97,-13.53],"The Andes","point"],[[-88,37],"Eastern North America","point"]],
 phPins:[ph([-98,19.5],"Maize cobs"),ph([-72.55,-13.16],"A llama at Machu Picchu")],
 stat:"In the Americas the long axis runs north–south, across tropical lowlands and deserts",
 body:"Mesoamerica and the Andes are only about 4,500 km apart (drag the ruler), but crossing the grid’s lines of latitude means very different climates. Diamond argues that this slowed everything down: the llama and the potato never reached Mexico, and maize took thousands of years to adapt to the cooler, longer-day summers of North America.",
 more:"Africa also stands north–south, with the Sahara and the tropics in the way. Diamond sees the shape of the continents as one of the deepest reasons why history unfolded differently on each."}),
S({title:"Germs from the farmyard",view:[-172,-20,4,48],globe:[-50,18,1.5],card:"left",hiSoft:["es"],gfEmpire:[{y:1519,gk:"aztec",name:"Aztec Empire"},{y:1519,gk:"inca",name:"Inca Empire"}],
 lines:[{coords:[[-5.99,37.39],[-20,30],[-45,22],[-69.9,18.5]],kind:"flow"},{coords:[[-69.9,18.5],[-85,20],[-96.13,19.2]],kind:"flow"}],
 pins:[[[-69.9,18.5],"Hispaniola: smallpox arrives, 1518","point"],[[-96.13,19.2],"Veracruz, 1520","point"],[[-99.13,19.43],"Tenochtitlan","point"],[[-78.47,-0.18],"Quito","point"]],
 phPins:[ph([-99.13,19.43],"Mexico City’s Zócalo")],
 stat:"Diamond argues that germs killed far more Native Americans than Spanish swords did",
 body:"Living close to herds of animals for thousands of years, Eurasians caught diseases such as smallpox, measles and influenza, which jumped from animals to people. Survivors built up resistance; Native Americans, with few herd animals, had none. (Pictured: an 1802 cartoon of the cowpox vaccine, from a cattle disease related to smallpox.)",
 more:"Smallpox reached Mexico in 1520 and helped bring down the Aztec capital. It spread south ahead of the Spaniards and may have killed the Inca emperor Huayna Capac around 1527, starting the civil war Pizarro found. Historians’ estimates of the death toll in the Americas vary, but it was enormous."}),
S({title:"Writing was invented only a few times",view:W,globe:[40,25,1],card:"left",
 pins:[[[45.64,31.32],"Sumer: about 3200 BC","point"],[[31.92,26.18],"Egypt: about 3200 BC","point"],[[114.35,36.1],"China: by about 1200 BC","point"],[[-96.77,17.04],"Mesoamerica: by about 500 BC","point"]],
 iconPins:[ic([45.64,31.32],"scroll"),ic([114.35,36.1],"scroll"),ic([-96.77,17.04],"scroll"),ic([31.92,26.18],"scroll")],
 phPins:[ph([114.35,36.1],"A Chinese oracle bone")],
 stat:"Writing was invented from scratch in perhaps only three or four places on Earth",
 body:"Diamond argues that writing appeared only where farming fed big, organised societies that needed to keep records of taxes and stores. Sumer and Mesoamerica certainly invented it on their own; China and Egypt probably did too. Everyone else borrowed the idea or the script.",
 more:"Writing gave its users an edge: Pizarro knew from written reports how Cortés had captured the Aztec ruler. Atahualpa, whose empire kept records with knotted cords called khipu, had no such reports about the Spaniards."}),
S({title:"Why Europe, not China?",view:[-15,-8,123,45],globe:[70,25,1.4],card:"left",gfEmpire:{y:1400,gk:"chn",name:"Ming China"},
 lines:[{coords:[[118.8,32.06],[121.9,31.2],[118,24],[113,18],[109.2,13.8],[105,6],[102.25,2.2],[95,6],[80,7],[75.78,11.25]],kind:"flow"},{coords:[[75.78,11.25],[65,20],[56.45,26.6]],kind:"flow"},{coords:[[75.78,11.25],[60,6],[45.34,2.04],[40.12,-3.22]],kind:"flow"}],
 pins:[[[118.8,32.06],"Nanjing","point"],[[75.78,11.25],"Calicut","point"],[[56.45,27.1],"Hormuz","point"],[[40.12,-3.22],"Malindi","point"]],
 phPins:[ph([118.78,32.04],"Zheng He’s statue")],
 stat:"China sent huge treasure fleets to Africa in the 1400s, then one ruling faction stopped them for good",
 body:"Admiral Zheng He led seven voyages between 1405 and 1433 with ships far bigger than Columbus’s, along the routes shown. Then the court turned against them and the shipyards closed. Diamond argues that a united China could make such a decision once for everyone.",
 more:"Europe’s jagged coasts and mountains kept it split into many rival states. When one ruler said no, an explorer could ask another: Columbus was turned down by Portugal before Spain backed him in 1492."}),
S({title:"Africa’s great migration",view:[-38,-36,46,18],globe:[18,-6,1.5],card:"left",hiSoft:["cm","ng"],gfClimate:{alpha:.5},
 lines:[{coords:[[10,6],[18,3],[25,0],[30,-1.5]],kind:"flow"},{coords:[[30,-1.5],[34,-8],[33,-16],[30,-22],[28,-27]],kind:"flow"},{coords:[[10,6],[13,-2],[14,-8],[16,-14],[18,-19]],kind:"flow"}],
 pins:[[[10,6],"Bantu homeland","point"],[[30,-1.5],"Great Lakes","point"],[[28,-27],"South Africa, by about AD 300","point"]],
 phPins:[ph([30.93,-20.27],"Great Zimbabwe")],
 stat:"Bantu-speaking farmers spread from West Africa over most of the southern half of the continent",
 body:"Starting some 4,000 to 5,000 years ago, farmers speaking Bantu languages moved out from near today’s Nigeria–Cameroon border, along the arrows. They brought crops and, later, iron. The colours over the map are today’s climates: rainforest (dark blue), savanna (light blue), dry lands (orange and red) and the Cape’s dry-summer climate (yellow) in the far south-west. Diamond argues that their farming gave them the numbers to replace or absorb most of the hunter-gatherers who lived there before.",
 more:"Today some 350 million people speak Bantu languages, among them Swahili, Zulu and Kikongo. Their crops could not cross into the Cape’s winter-rain climate, which Diamond says helped Europeans settle there."}),
S({title:"Now explore",view:W,globe:[40,20,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on the grid and compare how far the continents stretch east–west and north–south. Critics such as the geographer J. M. Blaut argued that Diamond leaves too much to the environment; Acemoglu and Robinson, in Why Nations Fail, argue that institutions matter more. Try that tour next, then Collapse, Diamond’s next book."})];

/* =====================================================================================================
   3. Why Nations Fail (Daron Acemoglu and James A. Robinson, 2012)
   ===================================================================================================== */
const NAT=[
S({title:"Why Nations Fail",view:W,globe:[20,25,1],
 phPins:[ph([-117.1,32.55],"The US–Mexico border wall"),ph([126.68,37.96],"The DMZ at Panmunjom"),ph([-65.75,-19.59],"Cerro Rico, Potosí"),ph([-2.24,53.48],"A Manchester cotton mill"),ph([12.34,45.43],"Venice"),ph([25.9,-24.65],"Three Dikgosi Monument, Gaborone"),ph([114.06,22.54],"Shenzhen")],
 stat:"Acemoglu and Robinson’s 2012 book argues that rules made by people, not geography or culture, make nations rich or poor",
 body:"The economist Daron Acemoglu and the political scientist James A. Robinson call good rules ‘inclusive institutions’: secure property, fair courts, open markets and power shared widely. ‘Extractive institutions’ let a small elite squeeze wealth out of everyone else. This tour visits their examples.",
 more:"In 2024 they shared the Nobel Prize in economics with their colleague Simon Johnson for research on how institutions shape prosperity."}),
S({title:"Nogales: one town, two countries",view:[-121,29,-107.5,34.5],globe:[-110.94,31.33,6],card:"left",hi:["us","mx"],
 lines:[{coords:[[-114.81,32.49],[-111.075,31.3323],[-108.21,31.3323]],kind:"solid"}],
 pins:[[[-110.94,31.33],"The two Nogales","point"]],
 phPins:[ph([-111.2,31.333],"The US–Mexico border wall")],
 stat:"The authors found households on the US side of the fence earned about three times as much as those on the Mexican side",
 body:"The two Nogales share the same people’s ancestors, food, music, climate and diseases. Only a fence divides them (the line). The authors argue that the difference is the institutions each side lives under: US laws, courts, police and elections compared with those of Mexico.",
 more:"The book opens here. People on the US side, they note, could more easily get loans, rely on the courts and expect officials to answer to voters."}),
S({title:"Korea: one people, two economies",view:[116,31.5,134,44],globe:[127,38,4],card:"left",mode:"gdp",sub:"percapita",
 pins:[[[126.98,37.57],"Seoul","point"],[[125.75,39.02],"Pyongyang","point"],[[126.68,37.956],"The DMZ","point"]],
 phPins:[ph([126.68,37.96],"The DMZ at Panmunjom")],
 stat:"South Korea’s income per person is estimated at about 29 times North Korea’s",
 body:"This is the Economy map, coloured by income per person. In 1945 the two halves of Korea were much alike; then the peninsula was split along the 38th parallel. The authors argue that the South built inclusive markets while the North was run as an extractive dictatorship, and this is the result.",
 more:"The figure is the Bank of Korea’s estimate for 2024. Seen from space at night, the South blazes with light while the North is almost dark apart from Pyongyang. The authors use this split, like Nogales, as a ‘natural experiment’: one people, divided by a line, living under different rules."}),
S({title:"Silver and forced labour",view:[-143,-28,-55,42],globe:[-75,5,1.4],card:"left",mode:"history",sub:"1650/spa",
 pins:[[[-65.75,-19.59],"Potosí: the silver mountain","point"],[[-99.13,19.43],"Mexico City","point"],[[-76.78,37.21],"Jamestown, 1607","point"]],
 iconPins:[ic([-65.75,-19.59],"gold")],
 phPins:[ph([-99.13,19.43],"Mexico City’s Zócalo")],
 stat:"From 1573 Spain forced Andean villages to send one man in seven to work the silver mines of Potosí",
 body:"This map shows Spain’s empire in 1650. The authors argue that the Spanish conquerors built institutions to extract silver and labour from Native peoples, through forced labour such as the mita and grants of tribute. In Jamestown, the English settlers could not force the local people to work, so the Virginia Company had to offer settlers land and, from 1619, an assembly.",
 more:"A study by the economist Melissa Dell, which the book cites, found that districts of Peru once subject to the mita are still poorer today than their neighbours just outside it."}),
S({title:"The Glorious Revolution",view:[-16,49.5,6,56.5],globe:[-1,52,4],card:"left",hi:["gb"],hiSoft:["nl"],
 lines:[{coords:[[4.13,51.82],[2.5,51.3],[1.4,50.9],[-1,50.3],[-3.51,50.4]],kind:"flow"}],
 pins:[[[-0.12,51.5],"London: Parliament","point"],[[-2.24,53.48],"Manchester","point"],[[-3.51,50.4],"Brixham: William lands, 1688","point"]],
 phPins:[ph([-2.24,53.48],"A Manchester cotton mill"),ph([-0.13,51.5],"The Palace of Westminster")],
 stat:"In 1688 Parliament invited William of Orange to take England’s throne, and kings never again ruled alone",
 body:"The authors see the Glorious Revolution as a turning point: power passed to a Parliament that spoke for many groups, property became safer and new businesses could open. That, they argue, is why the Industrial Revolution began in England about 70 years later.",
 more:"The arrow shows William’s fleet from the Netherlands. The Bill of Rights of 1689 limited the Crown’s power. Inventors and mill owners in places like Manchester could keep the profits of their ideas."}),
S({title:"The Black Death splits Europe",view:[-28,42,32,62],globe:[12,51,2.4],card:"left",hi:["gb","fr","nl"],hiSoft:["pl","cz","hu","sk","by","lt","lv","ee"],
 lines:[{coords:[[15.54,50.77],[13.74,51.05],[12.3,51.9],[11.63,52.13],[10.8,53.2],[9.99,53.55],[8.8,53.9]],kind:"solid"}],
 pins:[[[11.63,52.13],"The River Elbe","point"],[[-0.12,51.5],"West: wages rise, serfdom fades","point"],[[21,52.2],"East: a ‘second serfdom’","point"]],
 phPins:[ph([14.4,50.09],"Prague")],
 stat:"The plague of 1346 to 1353 killed perhaps a third or more of Europe’s people",
 body:"With so few workers left, peasants in the west could demand higher wages and freedom, and serfdom faded away. East of the Elbe (the line), lords, who were stronger and towns weaker, tightened their grip, tying peasants to the land. The authors call such moments ‘critical junctures’: small differences send countries down different paths.",
 more:"They argue that the same shock pushed the two halves of Europe apart for centuries. Some historians think trade, towns and grain markets explain the east’s ‘second serfdom’ as much as the plague did."}),
S({title:"Venice closes its doors",view:[-15,28,36,50],globe:[16,40,2.5],card:"left",hiSoft:["it"],on:["connections"],
 pins:[[[12.34,45.43],"Venice","point"],[[28.97,41.01],"Constantinople","point"],[[29.9,31.2],"Alexandria","point"]],
 phPins:[ph([12.34,45.44],"Venice")],
 stat:"In 1297 Venice’s Great Council closed its membership to new families: the Serrata, or ‘closure’",
 body:"Medieval Venice grew rich through trade, with contracts that let young merchants without money share in voyages and rise. The authors argue that once the old families shut newcomers out of power and trade, the city’s dynamism faded, and it slowly became a museum of its own past.",
 more:"Venice’s trade routes crossed the Mediterranean to Constantinople and Alexandria; the modern shipping lanes are shown. Other historians point to new ocean routes round Africa and the rise of the Ottomans as big reasons for its decline."}),
S({title:"Botswana’s chiefs",view:[-30,-32,35,55],globe:[18,10,1.3],card:"left",hi:["bw"],
 ghosts:[{code:"bw",at:[2.5,46.5],col:"#9a5a48",label:"Botswana, true size"}],
 pins:[[[25.91,-24.65],"Gaborone","point"],[[25.38,-21.31],"Orapa diamond mine","point"]],
 iconPins:[ic([25.38,-21.31],"gem")],
 phPins:[ph([22.8,-19.3],"The Okavango Delta")],
 stat:"Botswana was one of the world’s poorest countries in 1966; it has since been one of the fastest-growing",
 body:"In 1895 three Tswana chiefs travelled to London and persuaded the British government to keep their land out of Cecil Rhodes’s company. The authors argue that Botswana kept its tradition of chiefs answering to public meetings, and after independence its leaders shared the wealth of its diamonds instead of grabbing it.",
 more:"Botswana is about as big as France: drag the ghost to compare. It has held free elections since independence; in 2024 the governing party lost power for the first time and handed it over peacefully."}),
S({title:"Growth that cannot last?",view:[-38,15,140,70],globe:[90,45,1.4],card:"left",hi:["ru","cn"],
 pins:[[[37.62,55.75],"Moscow","point"],[[114.06,22.54],"Shenzhen","point"],[[116.4,39.9],"Beijing","point"]],
 phPins:[ph([37.53,55.7],"Moscow State University")],
 stat:"The authors argue that growth under extractive institutions can be fast, but runs out",
 body:"The Soviet Union grew quickly for decades by moving millions of people from farms into factories, then stalled and broke up in 1991. In 2012 the authors argued that China’s boom, driven by a state that controls who may succeed, would slow unless its institutions became more inclusive.",
 more:"This is one of the book’s most debated claims. China has kept growing since 2012, though more slowly, and economists still argue about what this means for the theory."}),
S({title:"Geography or institutions?",view:W,globe:[20,10,1],card:"left",on:["grid"],
 lines:[{coords:[[-179,23.44],[-120,23.44],[-60,23.44],[0,23.44],[60,23.44],[120,23.44],[179,23.44]],kind:"dash"},{coords:[[-179,-23.44],[-120,-23.44],[-60,-23.44],[0,-23.44],[60,-23.44],[120,-23.44],[179,-23.44]],kind:"dash"}],
 pins:[[[18.07,59.33],"Stockholm: the Nobel Prize, 2024","point"]],
 phPins:[ph([18.07,59.33],"Stockholm")],
 stat:"Many of the world’s poorest countries lie between the tropics (dashed): is that geography, or history?",
 body:"Writers such as Jared Diamond and the economist Jeffrey Sachs stress geography: climate, disease and soils. Acemoglu and Robinson reply that the same places were often richer than Europe’s colonies in temperate lands before 1500, and that colonisers set up worse institutions where they could exploit large populations.",
 more:"Their prize-winning research supports this, but critics have questioned some of the data, and many economists think geography and institutions both matter."}),
S({title:"Now explore",view:W,globe:[20,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch to the GDP map and compare neighbours that share a border but not a history: Haiti and the Dominican Republic, Finland and Russia, Botswana and Zimbabwe. Then try the Guns, Germs, and Steel tour for the geography side of the argument."})];

/* =====================================================================================================
   4. Collapse (Jared Diamond, 2005)
   ===================================================================================================== */
const COLL=[
S({title:"Collapse",view:W,globe:[-60,20,1],
 phPins:[ph([-109.23,-27.13],"Ahu Tongariki, Rapa Nui"),ph([-89.62,17.22],"Tikal"),ph([-89.14,14.84],"Copán"),ph([-37.63,65.61],"Tasiilaq, Greenland"),ph([-55.53,51.6],"L’Anse aux Meadows"),ph([-69.88,18.47],"Santo Domingo"),ph([145.4,-6.08],"The New Guinea highlands")],
 stat:"Jared Diamond’s 2005 book asks why some societies destroyed themselves and others survived",
 body:"Diamond suggests five things to check: damage people do to their environment, climate change, hostile neighbours, the loss of friendly trading partners, and, above all, how a society responds to its problems. This tour visits his case studies, from Easter Island to Hispaniola.",
 more:"The book starts in Montana and ends with today’s world: Diamond argues that collapse is not a fate but depends on the choices a society makes."}),
S({title:"Montana: trouble in paradise",view:[-126,43,-103,49.5],globe:[-112,46.5,4],card:"left",hiSoft:["us"],
 pins:[[[-114.1,46.3],"The Bitterroot Valley","point"],[[-112.5,46.0],"Butte","point"],[[-113.99,46.87],"Missoula","point"]],
 iconPins:[ic([-112.5,46.0],"pick")],
 stat:"Diamond’s book begins in Montana, one of the emptiest and most beautiful US states",
 body:"Diamond spent many summers in the Bitterroot Valley. He shows that even this rich, modern place faces his problems: old mines leaking toxic waste, forests made fire-prone by a century of putting out every fire, salty soils, scarce water and invading weeds.",
 more:"At Butte, the Berkeley Pit, a flooded copper mine, holds a lake of acidic, metal-laden water; in 1995 a flock of snow geese died after landing on it. Diamond’s point: these are the same kinds of problems that ancient societies faced."}),
S({title:"Easter Island",view:[-140,-40,-68,-15],globe:[-100,-27,2.2],card:"left",hi:["easter"],gfRuler:{a:[-109.35,-27.12],b:[-71.62,-33.05]},
 pins:[[[-109.35,-27.12],"Rapa Nui (Easter Island)","point"],[[-130.1,-25.07],"Pitcairn","point"],[[-71.62,-33.05],"Valparaíso, Chile","point"]],
 iconPins:[ic([-109.35,-27.12],"statue")],
 phPins:[ph([-109.43,-27.2],"Motu Nui, Rapa Nui")],
 stat:"Rapa Nui’s people carved nearly 1,000 giant stone statues, called moai, on an island 3,670 km from Chile",
 body:"Diamond’s best-known case: he argues the islanders cut down all their trees, partly to move the statues, so soil eroded, canoes could no longer be built and society fell into famine and war. Drag the ruler: no one could come to help.",
 more:"This is strongly debated. Many archaeologists now argue that the population stayed small and stable, that rats ate the palm seeds, and that the real disaster came after Europeans arrived in 1722: disease and slave raids in the 1860s."}),
S({title:"Pitcairn and Henderson",view:[-145,-29,-125,-19],globe:[-131,-24,4.5],card:"left",gfRuler:{a:[-134.97,-23.12],b:[-128.33,-24.37]},
 lines:[{coords:[[-134.97,-23.12],[-130.1,-25.07]],kind:"dash"},{coords:[[-130.1,-25.07],[-128.33,-24.37]],kind:"dash"},{coords:[[-134.97,-23.12],[-131.5,-23.6],[-128.33,-24.37]],kind:"dash"}],
 pins:[[[-134.97,-23.12],"Mangareva","point"],[[-130.1,-25.07],"Pitcairn: stone for tools","point"],[[-128.33,-24.37],"Henderson: turtles and seabirds","point"]],
 phPins:[ph([-128.33,-24.37],"Henderson Island")],
 stat:"When Mangareva lost its trees, its two small trading partners lost their lifeline",
 body:"Three islands traded by canoe: Mangareva had food and pearl shell, Pitcairn had stone for tools, and Henderson had turtles and seabirds. Diamond argues that when Mangareva’s forests were cut, it could no longer build ocean-going canoes, and the voyages, hundreds of kilometres long (drag the ruler), stopped around 1500.",
 more:"The people of Pitcairn and Henderson, cut off, died out. When the Bounty mutineers landed on Pitcairn in 1790, it was empty. This is Diamond’s fourth factor: losing friendly trading partners."}),
S({title:"Chaco Canyon",view:[-124,30,-100,42],globe:[-108,36,4.5],card:"left",hiSoft:["us"],
 pins:[[[-107.96,36.06],"Chaco Canyon: Pueblo Bonito","point"],[[-108.46,37.18],"Mesa Verde","point"]],
 iconPins:[ic([-107.96,36.06],"steps")],
 phPins:[ph([-110.5,35.83],"A Hopi village on Second Mesa")],
 stat:"Pueblo Bonito, with some 600 rooms, was the largest building in North America until the 1800s",
 body:"Ancestral Puebloans built great houses of stone in this dry canyon in New Mexico between about AD 850 and 1150. Diamond argues they cut the nearby woods and depended on farming in a fragile desert; when a long drought struck in the 1100s, the system fell apart and people left.",
 more:"Mesa Verde’s cliff dwellings (pictured, in 1891), built by the same culture, were left around 1300. Their descendants, the Pueblo peoples such as the Hopi, still live in the region: they moved, rather than vanished."}),
S({title:"The Classic Maya",view:[-97,13,-87,20],globe:[-90,17,4],card:"left",mode:"history",sub:"800/maya",
 pins:[[[-89.62,17.22],"Tikal","point"],[[-89.14,14.84],"Copán","point"],[[-91.98,17.48],"Palenque","point"],[[-89.74,18.1],"Calakmul","point"]],
 iconPins:[ic([-89.62,17.22],"pyramid")],
 phPins:[ph([-89.14,14.84],"Copán"),ph([-91.98,17.48],"Palenque")],
 stat:"Between about AD 760 and 910, most of the great cities of the southern Maya lowlands were abandoned",
 body:"This map shows the Maya world around AD 800. Diamond argues that too many people farmed thin rainforest soils; forests were cleared, soil washed away, and droughts hit. Kings, busy with wars and monuments, did not tackle the real problems.",
 more:"Lake sediments do show severe droughts at the time. Maya people did not disappear: millions live in Mexico and Central America today, and northern cities such as Chichén Itzá flourished after the south declined."}),
S({title:"The Norse in Greenland",view:[-97,48,8,76],globe:[-30,64,2],card:"left",hi:["gl"],hiSoft:["is","no"],gfRuler:{a:[5.32,60.39],b:[-45.51,61.15]},
 lines:[{coords:[[5.32,60.39],[-7,62],[-14,64.5],[-22.5,65]],kind:"flow"},{coords:[[-22.5,65],[-33,63],[-43.5,60.5],[-45.51,61.15]],kind:"flow"}],
 pins:[[[-45.51,61.15],"Brattahlíð: Eastern Settlement","point"],[[-51.7,64.18],"Western Settlement","point"],[[-22.5,65],"Iceland","point"],[[5.32,60.39],"Bergen, Norway","point"],[[-55.53,51.6],"L’Anse aux Meadows","point"]],
 phPins:[ph([5.32,60.4],"Bryggen, Bergen"),ph([-55.53,51.6],"L’Anse aux Meadows")],
 stat:"Norse farmers lived in Greenland for some 450 years, then vanished in the 1400s; the Inuit stayed",
 body:"Erik the Red led settlers from Iceland around 985. Diamond argues that they clung to European ways, cattle, churches and trade with distant Norway (drag the ruler), and did not learn the Inuit’s kayaks, harpoons and seal hunting. As the climate cooled in the Little Ice Age, they starved.",
 more:"The last written record is a wedding at Hvalsey church in 1408. Recent research shows the Norse did eat a lot of seal, and that falling demand for walrus ivory in Europe also hurt them, so many scholars now see the story as more complicated."}),
S({title:"Societies that succeeded",view:[104,-16,172,42],globe:[150,10,1.4],card:"left",hi:["jp","pg"],hiSoft:["sb"],
 pins:[[[139.77,35.68],"Edo (Tokyo): the shoguns’ forests","point"],[[137.6,35.8],"Kiso valley: guarded cypress forests","point"],[[145.4,-6.0],"New Guinea highlands","point"],[[168.83,-12.3],"Tikopia","point"]],
 iconPins:[ic([137.6,35.8],"tree")],
 phPins:[ph([135.77,34.97],"Fushimi Inari, Kyoto")],
 stat:"Diamond’s success stories: Tokugawa Japan, tiny Tikopia and the New Guinea highlands",
 body:"In the 1600s Japan was losing its forests to building. The Tokugawa shoguns, from the top down, counted trees, rationed timber and planted new forests. On Tikopia, an island of under 5 km², people managed their gardens, fish and numbers carefully for some 3,000 years.",
 more:"The New Guinea highlanders, Diamond notes, farmed the same valleys for thousands of years, managing their soils from the bottom up. Japan is still about two-thirds forest."}),
S({title:"Hispaniola: one island, two paths",view:[-78.6,17.4,-68.2,20.2],globe:[-71.5,19,6],card:"left",hi:["ht"],hiSoft:["do"],
 lines:[{coords:[[-71.68,19.71],[-71.73,19.4],[-71.64,19.2],[-71.78,18.95],[-71.69,18.6],[-71.95,18.38],[-71.74,18.04]],kind:"dash"}],
 pins:[[[-72.34,18.54],"Port-au-Prince, Haiti","point"],[[-69.93,18.49],"Santo Domingo, Dominican Republic","point"]],
 phPins:[ph([-69.88,18.47],"Santo Domingo")],
 stat:"Diamond wrote that forest covered 28% of the Dominican Republic but only about 1% of Haiti",
 body:"Haiti (highlighted) and the Dominican Republic share one island. In close-up satellite photos the border can often be traced where green forest gives way to bare hills. Diamond explains why: France ran Haiti as a crowded sugar colony with many enslaved workers; Haiti’s side gets less rain; and Dominican rulers, including the dictator Trujillo, protected forests while Haiti’s were cut for farmland and charcoal.",
 more:"Later satellite studies give different figures depending on what counts as forest, but the contrast along the border is real. The two countries share one island and very different histories."}),
S({title:"Australia: mining the soil",view:[88,-42,155,-10],globe:[134,-27,2.4],card:"left",hi:["au"],on:["rivers"],
 pins:[[[138.88,-35.56],"Mouth of the Murray","point"],[[146,-31.5],"The Murray–Darling basin","point"],[[117.5,-31.5],"The Wheatbelt: salty soils","point"]],
 iconPins:[ic([117.5,-31.5],"wheat")],
 stat:"Diamond argues that modern Australia farmed its old, thin soils as if it were England",
 body:"Australia’s soils are among the poorest on Earth, worn down over millions of years. Clearing native trees let underground water rise, bringing salt to the surface. Diamond calls this ‘mining’ the soil: using up something that will not come back.",
 more:"The Murray–Darling rivers (shown in blue) water much of Australia’s farming, but in dry years so much is taken that little reaches the sea. Diamond saw Australia as a rich country starting to change course."}),
S({title:"Now explore",view:W,globe:[-60,20,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch to the Satellite map and zoom in on Hispaniola or Rapa Nui. Many archaeologists disagree with parts of Collapse: in the 2010 book Questioning Collapse, they argue that many of these peoples adapted and survived. Try Guns, Germs, and Steel next, Diamond’s earlier book."})];

const TOURS={
 bprisoners:{name:"Prisoners of Geography",short:"Prisoners of Geography",hint:"Tim Marshall’s 2015 book, on the map: Russia’s open plain, China’s buffers, America’s rivers, Africa’s true size and the Arctic",steps:PRIS},
 bggs:{name:"Guns, Germs, and Steel",short:"Guns, Germs, and Steel",hint:"Jared Diamond’s 1997 book, on the map: Cajamarca, the Fertile Crescent, tame animals, Eurasia’s east–west axis and germs",steps:GGS},
 bnations:{name:"Why Nations Fail",short:"Why Nations Fail",hint:"Acemoglu and Robinson’s 2012 book, on the map: Nogales, the two Koreas, Potosí’s silver, 1688, Venice and Botswana",steps:NAT},
 bcollapse:{name:"Collapse",short:"Collapse",hint:"Jared Diamond’s 2005 book, on the map: Montana, Easter Island, Pitcairn, Chaco Canyon, the Maya, Norse Greenland and Hispaniola",steps:COLL}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"1530/inca") is set up as if the tour ran on that map:
   the shared sub switch and key read the tour's map mode, so it is lent the stop's mode for that call only */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bprisoners={mid:[
 {at:"Russia’s open door",st:"Russia’s open door",q:"Where is the North European Plain narrowest, according to Marshall?",o:["France","Germany","Poland","Belarus"],a:2,why:"Between the Baltic Sea and the Carpathians it is under 500 km wide.",kc:"pl"},
 {at:"The hunt for a warm-water port",st:"The hunt for a warm-water port",q:"Which strait must Russia’s Black Sea ships pass to reach the Mediterranean?",o:["The Bosporus","Gibraltar","Hormuz","Malacca"],a:0,why:"Turkey controls the Bosporus and the Dardanelles.",kc:"tr"},
 {at:"Africa: bigger than it looks",st:"Africa: bigger than it looks",q:"Which river is the deepest in the world, but blocked by rapids below Kinshasa?",o:["The Nile","The Niger","The Congo","The Zambezi"],a:2,why:"Rapids stop ships coming up from the Atlantic.",kc:"cd"}],
 recap:[
 {q:"Which river system does Marshall see as the key to America’s power?",o:["The Colorado","The Mississippi","The Hudson","The Rio Grande"],a:1,why:"With the Missouri and Ohio it carries barges through the Midwest.",st:"America’s lucky geography",kc:"us"},
 {q:"About how far is Seoul from the DMZ?",o:["5 km","50 km","500 km","1,000 km"],a:1,why:"Within range of North Korea’s artillery, Marshall notes.",st:"Korea: Seoul within range",kc:"kr"},
 {q:"In 1916 Britain and France secretly divided the Ottoman Middle East in which agreement?",o:["The Treaty of Versailles","Sykes–Picot","The Balfour Declaration","Yalta"],a:1,why:"Named after Mark Sykes and François Georges-Picot.",st:"Lines in the sand",kc:"iq"}]};
TOURQ.bggs={mid:[
 {at:"Cajamarca, 1532",st:"Cajamarca, 1532",q:"Which emperor did Pizarro capture at Cajamarca in 1532?",o:["Moctezuma","Atahualpa","Pachacuti","Huáscar"],a:1,why:"The Inca emperor, in front of his army.",kc:"pe"},
 {at:"Animals worth taming",st:"Animals worth taming",q:"Which was the only big domesticated mammal from the Americas?",o:["The bison","The llama","The tapir","The jaguar"],a:1,why:"With its cousin the alpaca, from the Andes.",kc:"pe"},
 {at:"Eurasia lies east–west",st:"Eurasia lies east–west",q:"Why did crops spread easily across Eurasia, says Diamond?",o:["It is flat","Its long axis runs east–west, along similar latitudes","It has more rain","It is smaller"],a:1,why:"Same latitude means similar seasons and day lengths.",kc:"cn"}],
 recap:[
 {q:"Yali, whose question started the book, came from which country?",o:["Indonesia","Papua New Guinea","Fiji","Australia"],a:1,why:"He asked Diamond about ‘cargo’ in 1972.",st:"Yali’s question",kc:"pg"},
 {q:"Which admiral led China’s treasure fleets in the 1400s?",o:["Kublai Khan","Zheng He","Sun Tzu","Koxinga"],a:1,why:"Seven voyages, 1405–1433.",st:"Why Europe, not China?",kc:"cn"},
 {q:"Where did farming begin by about 8500 BC, with wheat and barley?",o:["The Nile delta","The Fertile Crescent","The Ganges plain","The Sahara"],a:1,why:"An arc of hills and valleys from Israel to Iraq.",st:"A head start in the Fertile Crescent",kc:"iq"}]};
TOURQ.bnations={mid:[
 {at:"Nogales: one town, two countries",st:"Nogales: one town, two countries",q:"Nogales is split between the USA and which country?",o:["Canada","Mexico","Guatemala","Cuba"],a:1,why:"Nogales, Arizona and Nogales, Sonora.",kc:"mx"},
 {at:"Silver and forced labour",st:"Silver and forced labour",q:"Potosí’s silver mountain is in which country today?",o:["Peru","Bolivia","Mexico","Chile"],a:1,why:"Cerro Rico rises above the city of Potosí.",kc:"bo"},
 {at:"Botswana’s chiefs",st:"Botswana’s chiefs",q:"What did Botswana find soon after independence in 1966?",o:["Oil","Diamonds","Gold","Copper"],a:1,why:"Its leaders used diamond wealth to build the country.",kc:"bw"}],
 recap:[
 {q:"In which year did England’s Glorious Revolution take place?",o:["1588","1688","1776","1848"],a:1,why:"Parliament invited William of Orange to take the throne.",st:"The Glorious Revolution",kc:"gb"},
 {q:"Which city closed its Great Council to new families in 1297?",o:["Genoa","Florence","Venice","Milan"],a:2,why:"The Serrata, or ‘closure’.",st:"Venice closes its doors",kc:"it"},
 {q:"Which prize did Acemoglu, Johnson and Robinson share in 2024?",o:["Peace","Economics","Literature","Physics"],a:1,why:"For studies of how institutions shape prosperity.",st:"Geography or institutions?",kc:"se"}]};
TOURQ.bcollapse={mid:[
 {at:"Easter Island",st:"Easter Island",q:"What are Easter Island’s giant stone statues called?",o:["Tiki","Moai","Ahu","Marae"],a:1,why:"They stand on platforms called ahu.",kc:"cl"},
 {at:"The Norse in Greenland",st:"The Norse in Greenland",q:"Who led the first Norse settlers to Greenland around 985?",o:["Leif Erikson","Erik the Red","Harald Hardrada","Cnut"],a:1,why:"He sailed from Iceland.",kc:"is"},
 {at:"Hispaniola: one island, two paths",st:"Hispaniola: one island, two paths",q:"Which country shares the island of Hispaniola with Haiti?",o:["Cuba","Jamaica","The Dominican Republic","Puerto Rico"],a:2,why:"Its side of the border is greener.",kc:"do"}],
 recap:[
 {q:"Tikal and Copán were cities of which civilisation?",o:["The Aztecs","The Maya","The Inca","The Olmecs"],a:1,why:"Abandoned between about 760 and 910.",st:"The Classic Maya",kc:"gt"},
 {q:"Which country’s rulers rebuilt its forests in the 1600s and 1700s?",o:["China","Japan","Korea","England"],a:1,why:"The Tokugawa shoguns managed timber from the top down.",st:"Societies that succeeded",kc:"jp"},
 {q:"Chaco Canyon’s great houses are in which US state?",o:["Arizona","Utah","New Mexico","Colorado"],a:2,why:"Pueblo Bonito had some 600 rooms.",st:"Chaco Canyon",kc:"us"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bprisoners|Prisoners of Geography":"Bosphorus Bridge (235499411).jpeg","bprisoners|Russia’s open door":"Moscow Kremlin and Bolshoy Kamenny Bridge late evening 01.JPG",
 "bprisoners|The hunt for a warm-water port":"Sevastopol, Crimea.jpg","bprisoners|China: a heartland and its buffers":"Landscape of the Tibetan Plateau.jpg",
 "bprisoners|America’s lucky geography":"America's Highways 1776–1976 - Mississippi River Steamboats.jpg","bprisoners|Europe’s rivers and harbours":"Kranhäuser Cologne, April 2018 -01.jpg",
 "bprisoners|Africa: bigger than it looks":"Kinshasa & Brazzaville - ISS007-E-6305 lrg.jpg","bprisoners|Lines in the sand":"The Great Mosque of Damascus 2, Damascus, Syria.jpg",
 "bprisoners|India and Pakistan":"Himalayas.jpg","bprisoners|Korea: Seoul within range":"Demilitarized Zone (DMZ) Joint Security Area (JSA) Looking Into North Korea (28819154694).jpg",
 "bprisoners|Latin America’s walls":"El cruce de los Andes por el Gral. San Martín.JPG","bprisoners|The Arctic opens up":"Arctic Sea Ice Minimum 2026 (SVS5677).png",
 "bprisoners|Now explore":"Strait of Gibraltar perspective.jpg",
 "bggs|Guns, Germs, and Steel":"Sunset-over-the-wheat-field-featured.jpg","bggs|Yali’s question":"Papua New Guinea (5986599443).jpg",
 "bggs|Cajamarca, 1532":"Sacsayhuamán, Cusco, Perú, 2015-07-31, DD 05.JPG","bggs|A head start in the Fertile Crescent":"Combine harvesting wheat.jpg",
 "bggs|Farming began more than once":"Terrace field yunnan china denoised.jpg","bggs|Animals worth taming":"Zebras and wildebeest Maasai Mara.jpg",
 "bggs|Eurasia lies east–west":"Camels in Gobi Desert 02.jpg","bggs|The Americas stand on end":"Corncobs.jpg",
 "bggs|Germs from the farmyard":"The cow pock.jpg","bggs|Writing was invented only a few times":"Proto cuneiform tablet OIM A12259.jpg",
 "bggs|Why Europe, not China?":"Zheng He Treasure Ship (15832736462).jpg","bggs|Africa’s great migration":"Women farmers in DR Congo.jpg",
 "bggs|Now explore":"Llama on Machu Picchu.jpg",
 "bnations|Why Nations Fail":"The HoloGlobe Project (Version 3) (SVS155 - earth night).jpg","bnations|Nogales: one town, two countries":"Border Wall at Tijuana and San Diego Border.jpg",
 "bnations|Korea: one people, two economies":"DMZ AT PANMUNJOM DPRK (NORTH KOREA)OCT 2012 (8157355503).jpg","bnations|Silver and forced labour":"Cerro Rico over Potosí, Bolivia.jpg",
 "bnations|The Glorious Revolution":"Palace of Westminster as seen from Westminster Bridge.jpg","bnations|The Black Death splits Europe":"The Triumph of Death by Pieter Bruegel the Elder.jpg",
 "bnations|Venice closes its doors":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg","bnations|Botswana’s chiefs":"Three Dikgosi Monument, Gaborone, Botswana.jpg",
 "bnations|Growth that cannot last?":"The panorama of Futian Shenzhen.jpg","bnations|Geography or institutions?":"Nobel prize medal for medicine, Sweden, 1945, to Sir Alexander Fleming (1881-1955) who discovered Penicillin. On display at the National Museum of Scotland.jpg",
 "bnations|Now explore":"Skeppsbrokajen Gamla Stan from Skeppsholmen Stockholm 2016 01.jpg",
 "bcollapse|Collapse":"Frederick Catherwood - Maya Stela at Copan, Honduras - B1979.12.689 - Yale Center for British Art.jpg","bcollapse|Easter Island":"Ahu Tongariki cropped.jpg","bcollapse|Montana: trouble in paradise":"Winter Road Montana.jpg","bcollapse|Pitcairn and Henderson":"Polynesian double-hulled and outrigger canoes.jpg","bcollapse|Chaco Canyon":"Mesa-Verde---Cliff-Palace-in 1891 - edit1.jpg",
"bcollapse|The Classic Maya":"Tikal Temple II.jpg",
 "bcollapse|The Norse in Greenland":"Tasiilaq, Greenland 02.jpg","bcollapse|Societies that succeeded":"Papua New Guinea (5986599443).jpg",
 "bcollapse|Hispaniola: one island, two paths":"Aerial view Ciudad Colonial Santo Domingo 09 2019 0067.jpg","bcollapse|Australia: mining the soil":"Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru -- 2019 -- 3688.jpg",
 "bcollapse|Now explore":"Copan Ruins - panoramio (2).jpg"};
const PIN={
 /* Prisoners of Geography */
 "The Kremlin, Moscow":"Moscow Kremlin and Bolshoy Kamenny Bridge late evening 01.JPG","The Tibetan Plateau":"Tibetan Plateau landscape.jpg",
 "Steamboats on the Mississippi":"America's Highways 1776–1976 - Mississippi River Steamboats.jpg","The Congo at Kinshasa":"A view of Congo River from Kinshasa, Democratic Republic of the Congo (DRC).jpg",
 "The Himalayas":"Everest, Himalayas.jpg","The DMZ at Panmunjom":"DMZ AT PANMUNJOM DPRK (NORTH KOREA)OCT 2012 (8157355503).jpg","The Panama Canal":"Panama Canal Miraflores Locks.jpg",
 "Icebreakers in the Arctic":"Icebreakers Louis S. St-Laurent and Healy in the Arctic Ocean.jpg","The Bosporus":"Bosphorus Bridge (235499411).jpeg",
 "The Great Wall at Badaling":"Badaling China Great-Wall-of-China-01.jpg","Kashgar":"Kashgar Old Town.jpg","The Three Gorges":"Three gorges on the Yangtze river.jpg",
 "A New Orleans brass band":"Treme Brass Band at New Orleans Jazz Fest 2014 08.jpg","The port of Rotterdam":"Shipping container stacks - Port of Rotterdam - 2017 - 6.jpg",
 "Budapest’s parliament on the Danube":"Budapest Parliament 4604.JPG","Old Damascus":"Old Damascus 20.jpg","Badshahi Mosque, Lahore":"Badshahi Mosque in Lahore ,Pakistan 03.jpg",
 "The Red Fort, Delhi":"Red Fort in Delhi 03-2016 img3.jpg","Seoul’s skyline":"Skyline view from Seoul City (South Korea).jpg","The Amazon from above":"Amazon jungle from above.jpg",
 /* Guns, Germs, and Steel */
 "The New Guinea highlands":"Papua New Guinea (5986599443).jpg","Sacsayhuamán, Cusco":"Sacsayhuamán, Cusco, Perú, 2015-07-31, DD 05.JPG","Göbekli Tepe":"Göbekli Tepe, Urfa.jpg",
 "A llama at Machu Picchu":"Llama on Machu Picchu.jpg","Zebras: never tamed":"Zebras and wildebeest Maasai Mara.jpg","Zheng He’s treasure ship":"Zheng He Treasure Ship (15832736462).jpg",
 "A Chinese oracle bone":"Shang Ox Bone Oracle Bone 03.jpg","A cuneiform tablet":"Proto cuneiform tablet OIM A12259.jpg","Asaro mud men":"Asaro Mud Man Kabiufa Papua New Guinea.jpg",
 "Machu Picchu":"80 - Machu Picchu - Juin 2009 - edit.jpg","Maize cobs":"Corncobs.jpg","Andean potatoes":"Bitter potato varieties of Solanum curtilobum.png",
 "Horse racing in Mongolia":"Naadam 2023 - Horse racing 09.jpg","Wheat in the Punjab":"Wheat field in Punjab.jpg","Mexico City’s Zócalo":"Mexico City Zocalo and Cathedral c 1950s, MAF 007305-001.jpg",
 "Zheng He’s statue":"Zheng He statue.jpg","Great Zimbabwe":"ASC Leiden - Rietveld Collection - East Africa 1975 - 05 - 033 - A wall of the ruins of Great Zimbabwe - Masvingo, Zimbabwe.jpg",
 /* Why Nations Fail */
 "The US–Mexico border wall":"Border Wall at Tijuana and San Diego Border.jpg","Cerro Rico, Potosí":"Cerro Rico over Potosí, Bolivia.jpg","A Manchester cotton mill":"Rock Hill - Manchester Cotton Mill.jpg",
 "Venice":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg","Three Dikgosi Monument, Gaborone":"Three Dikgosi Monument, Gaborone, Botswana.jpg","Shenzhen":"The panorama of Futian Shenzhen.jpg",
 "The Palace of Westminster":"Palace of Westminster as seen from Westminster Bridge.jpg","Prague":"Czech-2013-Prague-View from Charles Bridge of Prague Castle.jpg",
 "The Okavango Delta":"Okavango Delta, Botswana3.jpg","Moscow State University":"Moscow State University crop.jpg","Stockholm":"Stockholms stadshus February 2026 02.jpg",
 /* Collapse */
 "Ahu Tongariki, Rapa Nui":"Ahu Tongariki cropped.jpg","Tikal":"Tikal Temple II.jpg","Copán":"Copan Ruins - panoramio (2).jpg","Tasiilaq, Greenland":"Tasiilaq, Greenland 02.jpg",
 "L’Anse aux Meadows":"L'Anse aux Meadows, entrance to long house.jpg","Santo Domingo":"Aerial view Ciudad Colonial Santo Domingo 09 2019 0067.jpg",
 "Motu Nui, Rapa Nui":"Motu Nui Islet - Easter Island (5956399066).jpg","Palenque":"Palenque temple 1.jpg","Henderson Island":"Henderson Island-110259.jpg","A Hopi village on Second Mesa":"Hopi Village on the Second Mesa.jpg",
 "Bryggen, Bergen":"Bryggen, Bergen, Noruega, 2019-09-08, DD 115-117 PAN.jpg","Fushimi Inari, Kyoto":"Torii path with lantern at Fushimi Inari Taisha Shrine, Kyoto, Japan.jpg"};
/* new photos (GF_BOOKS1_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BOOKS1_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bprisoners:"Moscow Kremlin and Bolshoy Kamenny Bridge late evening 01.JPG",bggs:"Llama on Machu Picchu.jpg",bnations:"Cerro Rico over Potosí, Bolivia.jpg",bcollapse:"Ahu Tongariki cropped.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
