/* GeoFlock: four more Mapped books tours (books about the world, followed on the map).
   b1493      "1493"                                     Charles C. Mann, 2011
   bpivot     "The Geographical Pivot of History"        Halford Mackinder, 1904
   bseapower  "The Influence of Sea Power upon History"  Alfred Thayer Mahan, 1890
   bliemaps   "How to Lie with Maps"                     Mark Monmonier, 1991
   Each stop shows one of the book's claims on the map. The books' ideas are summarised in our own words and presented as
   the authors' views; where other scholars disagree, the card says so in a line. No book covers or long quotes.
   Stops use per-stop layers (on:[…]), history-map stops (mode:"history", sub:"<year>/<group>"), the Population and Economy
   maps (mode:"population" / mode:"gdp") through the shared stopModes switch, the ruler (gfRuler), the true-size country
   dragger (ghosts), the population threshold slider (gfThr), day and night (gfSun) and a height cross-section (xsec).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BOOKS2_PHOTOS. */
window.GF_BOOKS2_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={b1493:"#a8703c",bpivot:"#8f6a45",bseapower:"#7a6a55",bliemaps:"#b3864f"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* =====================================================================================================
   1. 1493 (Charles C. Mann, 2011)
   ===================================================================================================== */
const M1493=[
S({title:"1493",view:W,globe:[-30,15,1],
 phPins:[ph([-69.9,18.5],"Santo Domingo"),ph([-65.75,-19.59],"Cerro Rico, Potosí"),ph([120.97,14.59],"Manila Bay"),ph([-5.99,37.39],"Seville Cathedral"),ph([-75.2,-12.07],"Potatoes at a Peruvian market"),ph([-1.35,5.08],"Elmina Castle"),ph([-5.3,7.5],"Cocoa pods, Côte d’Ivoire"),ph([110.5,30.85],"The Three Gorges"),ph([-60.02,-3.13],"Manaus opera house")],
 stat:"Charles C. Mann’s 2011 book tells what happened after Columbus: the world’s living things began to mix",
 body:"Mann, an American science journalist, follows the Columbian Exchange: the swapping of crops, animals, germs, people and silver between the Americas and the rest of the world after 1492. He argues it was the biggest ecological upheaval since the dinosaurs died out, and that it made the first truly global economy.",
 more:"The historian Alfred Crosby coined the term ‘Columbian Exchange’ in 1972. Mann’s earlier book, 1491, described the Americas before Columbus; this one follows the aftermath around the world."}),
S({title:"La Isabela, 1494",view:[-121,8,-2,46],globe:[-40,26,1.8],card:"left",hi:["do"],hiSoft:["ht","es"],gfRuler:{a:[-6.29,36.53],b:[-71.08,19.89]},
 lines:[{coords:[[-6.29,36.53],[-12,32],[-17.1,28.1]],kind:"flow"},{coords:[[-17.1,28.1],[-35,22],[-50,17],[-61.35,15.4]],kind:"flow"},{coords:[[-61.35,15.4],[-65,17.5],[-69,19.4],[-71.08,19.89]],kind:"flow"}],
 pins:[[[-6.29,36.53],"Cádiz: 17 ships sail, 1493","point"],[[-17.1,28.1],"La Gomera, Canary Islands","point"],[[-71.08,19.89],"La Isabela","point"]],
 iconPins:[ic([-71.08,19.89],"ship")],
 phPins:[ph([-69.86,18.48],"The Columbus Lighthouse, Santo Domingo")],
 stat:"Columbus’s second voyage brought some 1,500 men, with horses, pigs, cattle, sugar cane and wheat",
 body:"Mann begins on the north coast of Hispaniola, at La Isabela, the colony Columbus founded in early 1494. Its ships carried Europe’s farm animals and plants across about 6,500 km of ocean (drag the ruler), along with insects, weeds and germs that nobody chose to bring.",
 more:"La Isabela failed within a few years, but the pigs it let loose ran wild and multiplied, and the sugar cane it brought became the Caribbean’s great plantation crop."}),
S({title:"Tobacco, worms and bees",view:[-86,33,-68,41],globe:[-77,37,4],card:"left",hiSoft:["us"],on:["rivers"],
 pins:[[[-76.78,37.21],"Jamestown, 1607","point"],[[-76.3,37.6],"Chesapeake Bay","point"]],
 iconPins:[ic([-76.78,37.21],"leaf")],
 stat:"In 1612 John Rolfe planted Caribbean tobacco at Jamestown, and Virginia’s first boom began",
 body:"England’s first lasting colony in America almost starved, until settlers found a crop that Europe would pay for. Mann shows how tobacco ate up land, which is why the colonists kept pushing onto Native American fields and forests.",
 more:"The colonists also brought, without meaning to, European earthworms, which reshaped forest soils where the ice age had wiped out native worms, and honeybees, which arrived in the 1620s. Native Americans called the bees ‘white man’s flies’."}),
S({title:"Mosquitoes draw a line",view:[-105,25,-72,43],globe:[-80,33,3],card:"left",hiSoft:["us"],
 lines:[{coords:[[-80.52,39.72],[-79,39.72],[-77.5,39.72],[-75.79,39.72]],kind:"dash"}],
 pins:[[[-79.93,32.78],"Charleston","point"],[[-78.2,39.72],"The Mason–Dixon line","point"],[[-90.07,29.95],"New Orleans","point"]],
 stat:"Mann notes that the deadliest kind of malaria thrived roughly south of the Mason–Dixon line, where slavery was legal",
 body:"Ships also carried two African and European diseases, malaria and yellow fever, which spread through the warm, wet lowlands of the Americas. Many West Africans had inherited some protection; Europeans had little. Mann argues this made planters even keener to use enslaved Africans in these regions.",
 more:"The dashed line is the Mason–Dixon line, long the border between slave and free states in the east. Mann stresses that disease did not cause slavery, which was a human choice; historians debate how much it shaped where slavery spread."}),
S({title:"The silver mountain",view:[-102,-36,-50,2],globe:[-74,-17,1.9],card:"left",mode:"history",sub:"1600/spa",
 xsec:{title:"From the port of Arica up to Potosí",pts:[[-70.32,-18.48,"Arica"],[-69.9,-18.6],[-69.3,-18.8],[-68.6,-19.0,"Altiplano"],[-67.8,-19.2],[-67.0,-19.4],[-66.3,-19.5],[-65.75,-19.59,"Potosí"]],mark:4000,note:"The dashed line marks 4,000 m. Potosí sits at about 4,000 m, high above the Pacific port that shipped its silver."},
 pins:[[[-65.75,-19.59],"Potosí: Cerro Rico","point"],[[-70.32,-18.48],"Arica","point"],[[-77.04,-12.05],"Lima","point"],[[-58.38,-34.6],"Buenos Aires","point"]],
 iconPins:[ic([-65.75,-19.59],"gold")],
 stat:"After 1545 Potosí’s mountain of silver turned a remote Andean slope into one of the world’s biggest cities",
 body:"This map shows Spain’s empire around 1600. Indigenous miners, many forced to work under the mita labour draft, dug silver out of Cerro Rico, and llamas and mules carried it to the coast (see the climb in the cross-section). Mann calls this silver the fuel of the first global economy.",
 more:"By the early 1600s Potosí may have had some 160,000 people, nearly as many as London. Much of its silver went to Spain, and much of the rest crossed the Pacific."}),
S({title:"The Manila galleons",view:[15,-30,265,62],globe:[-170,20,1.2],card:"left",on:["currents"],gfRuler:{a:[-99.89,16.85],b:[120.97,14.59]},
 lines:[{coords:[[-99.89,16.85],[-120,13.5],[-145,13],[-170,13],[165,13.2],[144.75,13.45],[130,12.8],[124.3,12.6],[120.97,14.59]],kind:"flow"},{coords:[[120.97,14.59],[124.5,15],[132,24],[141,34],[155,39],[175,40],[-165,40],[-145,40],[-128,40.5],[-118,34],[-108,23],[-99.89,16.85]],kind:"dash"}],
 pins:[[[-99.89,16.85],"Acapulco","point"],[[120.97,14.59],"Manila, founded 1571","point"],[[144.75,13.45],"Guam","point"]],
 iconPins:[ic([-150,13],"ship"),ic([-160,40],"ship")],
 phPins:[ph([120.97,14.59],"Intramuros, Manila")],
 stat:"From 1565 to 1815 Spanish galleons sailed between Acapulco and Manila, carrying silver west and silks east",
 body:"Mann dates the birth of world trade to 1571, when Spain founded Manila. Ships took American silver about 14,000 km across the Pacific (drag the ruler) to buy Chinese silk and porcelain. China wanted silver because its rulers had begun to collect taxes in it.",
 more:"Going west, ships rode the trade winds near the tropics. Coming back, they first sailed north, to catch the westerly winds and the Kuroshio current (on the map), a route found by Andrés de Urdaneta in 1565. The return trip could take four to six months."}),
S({title:"Sweet potatoes on China’s hills",view:[94,12,125,36],globe:[110,28,2.4],card:"left",hi:["cn"],on:["rivers"],
 lines:[{coords:[[120.97,14.59],[120.5,19],[119.3,26.08]],kind:"flow"}],
 pins:[[[119.3,26.08],"Fuzhou: sweet potato, 1593","point"],[[117.82,24.45],"Moon Harbour (Yuegang)","point"],[[113.5,29.5],"Hills of the Yangtze basin","point"]],
 iconPins:[ic([113.5,29.5],"potato"),ic([111,27],"corn")],
 phPins:[ph([110.5,30.85],"The Three Gorges")],
 stat:"American crops let farmers settle China’s steep hills, and its population roughly doubled in the 1700s",
 body:"Sweet potatoes came from Manila to Fujian in the 1590s, and maize followed. Both grow on dry, steep slopes where rice cannot. Mann describes poor migrants clearing the hills of the Yangtze basin to plant them, until the bare slopes washed away into the rivers, worsening floods.",
 more:"Historians still argue about how much of China’s population boom, from roughly 150 to over 300 million people in the 1700s, came from American crops. China is now the world’s largest grower of sweet potatoes."}),
S({title:"The potato conquers Europe",view:[-100,-26,-56,-2],globe:[-70,-14,3.5],card:"left",hi:["pe","bo"],on:["lakes"],
 pins:[[[-69.4,-15.8],"Lake Titicaca","point"],[[-71.97,-13.53],"Cusco","point"]],
 iconPins:[ic([-69.4,-15.8],"potato")],
 phPins:[ph([-69.6,-15.85],"Lake Titicaca"),ph([-70.4,-16.5],"Andean potatoes")],
 stat:"Potatoes were first farmed in the Andes near Lake Titicaca, thousands of years before they reached Europe",
 body:"Andean farmers grew thousands of kinds of potato. Spanish ships brought the plant to Europe around 1570. Mann argues that this cheap, filling crop, which gives more food per field than wheat, helped Europe’s population boom and so its rise to world power.",
 more:"One study by the economists Nathan Nunn and Nancy Qian credited the potato with about a quarter of the growth in the Old World’s population and cities between 1700 and 1900."}),
S({title:"Guano and the Great Famine",view:[-138,-60,-2,58],globe:[-35,22,1.4],card:"left",hi:["ie"],hiSoft:["pe"],
 lines:[{coords:[[-76.24,-13.64],[-80,-25],[-76,-45],[-67,-56.3],[-55,-45],[-35,-20],[-28,5],[-25,25],[-12,45],[-6,50.5]],kind:"flow"}],
 pins:[[[-76.24,-13.64],"Chincha Islands: guano","point"],[[-8,53.4],"Ireland","point"]],
 iconPins:[ic([-76.24,-13.64],"ship")],
 stat:"In 1845 a potato disease struck Ireland; about a million people died and as many again emigrated",
 body:"From the 1840s ships carried guano, seabird droppings dug from islands off Peru, to fertilise Europe’s fields, sailing all the way around Cape Horn (the arrow). Mann suggests the potato blight, a fungus-like organism from the Americas, may have crossed the Atlantic in such cargoes.",
 more:"Irish farm workers depended on the potato above all else, so when the crop rotted, famine followed. Scientists still debate exactly where the blight came from and how it reached Europe."}),
S({title:"Rubber leaves the Amazon",view:[-173,-25,108,62],spin:32,globe:[20,20,1.3],card:"left",hiSoft:["br","my","th","id","lk"],
 lines:[{coords:[[-54.7,-2.44],[-40,3],[-25,20],[-12,40],[-0.29,51.48]],kind:"flow"},{coords:[[-0.29,51.48],[-6,36],[11,32],[32.3,31.2],[43.3,12.6],[60,12],[79.86,6.93]],kind:"flow"},{coords:[[79.86,6.93],[95,5.5],[103.82,1.35]],kind:"flow"}],
 pins:[[[-54.7,-2.44],"Santarém: seeds collected, 1876","point"],[[-0.29,51.48],"Kew Gardens, London","point"],[[79.86,6.93],"Colombo, Ceylon","point"],[[103.82,1.35],"Singapore","point"],[[-60.02,-3.13],"Manaus","point"]],
 iconPins:[ic([101.5,4],"tree")],
 phPins:[ph([-60.0,-3.1],"The Meeting of the Waters, Manaus")],
 stat:"In 1876 Henry Wickham shipped about 70,000 rubber-tree seeds from the Amazon to London",
 body:"Wild rubber trees made the Amazon rich: the opera house in Manaus was built with rubber money. Then seedlings raised at Kew Gardens went to British colonies in Ceylon and Malaya. Mann explains why the plantations thrived there: the trees had left behind the leaf blight that kills them in South America.",
 more:"Today Thailand and Indonesia grow most of the world’s natural rubber. Henry Ford’s attempt to build rubber plantations in the Amazon, at Fordlândia from 1928, was ruined by the blight."}),
S({title:"American crops in Africa",view:[-92,-40,36,25],globe:[10,-5,1.6],card:"left",hi:["ng","ci","gh"],
 lines:[{coords:[[-38.5,-12.97],[-25,-8],[-10,0],[0,4],[6.5,4.3]],kind:"flow"}],
 pins:[[[6.5,6.5],"Nigeria: world’s biggest cassava grower","point"],[[-5.3,7.5],"Côte d’Ivoire: cocoa","point"],[[-38.5,-12.97],"Salvador, Brazil","point"],[[-1.35,5.08],"Elmina","point"]],
 iconPins:[ic([8,8],"potato"),ic([-5.3,7.5],"cacao"),ic([30,-15],"corn")],
 phPins:[ph([-1.35,5.08],"Elmina Castle"),ph([-5.3,6.6],"Cocoa pods, Côte d’Ivoire")],
 stat:"Cassava, maize and cocoa from the Americas are now among Africa’s most important crops",
 body:"Portuguese ships brought cassava and maize from Brazil to West Africa in the 1500s, on the same routes that carried enslaved Africans the other way. Mann notes that these hardy crops spread across the continent. Today Nigeria grows more cassava than any other country.",
 more:"Cocoa, first farmed in Mesoamerica, now grows mostly in West Africa: Côte d’Ivoire and Ghana produce over half the world’s supply. Maize is the most widely grown staple food in Africa south of the Sahara."}),
S({title:"Now explore",view:W,globe:[-30,15,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on Resources and Connections to see how far today’s crops, metals and shipping lanes still follow the routes of the Columbian Exchange. Then try the Guns, Germs, and Steel tour for the deeper history Mann builds on, or Mahan’s The Influence of Sea Power upon History."})];

/* =====================================================================================================
   2. The Geographical Pivot of History (Halford Mackinder, 1904)
   ===================================================================================================== */
const PIVOT=[
S({title:"The Geographical Pivot of History",view:W,globe:[70,40,1],
 phPins:[ph([37.62,55.75],"The Kremlin, Moscow"),ph([71.4,51.15],"The steppe near Astana"),ph([104.5,51.9],"Lake Baikal"),ph([107.4,47.8],"Genghis Khan statue, Mongolia"),ph([-0.13,51.5],"The Palace of Westminster"),ph([37.3,-0.15],"Mount Kenya"),ph([116.02,40.36],"The Great Wall at Badaling"),ph([60,56.5],"The Trans-Siberian in the Urals")],
 stat:"In 1904 the British geographer Halford Mackinder said the key to world power lay deep inside Eurasia",
 body:"Mackinder read his paper to the Royal Geographical Society in London on 25 January 1904. He argued that the vast interior of Eurasia, out of reach of ships, was the ‘pivot’ of world history, and that railways would let whoever held it challenge the great sea powers.",
 more:"Mackinder taught geography at Oxford, ran the London School of Economics and in 1899 led the first ascent of Mount Kenya. His short paper became one of the founding texts of geopolitics."}),
S({title:"The pivot area",view:[-36,15,145,78],globe:[80,55,1.4],card:"left",mode:"history",sub:"1905/rus",
 pins:[[[37.62,55.75],"Moscow","point"],[[131.89,43.12],"Vladivostok","point"],[[60,62],"Siberia","point"],[[66,46],"The Turan lowland","point"],[[95,47],"Mongolia","point"]],
 phPins:[ph([92.8,52.8],"Siberian taiga, Sayan Mountains")],
 stat:"Mackinder’s pivot area: northern and central Eurasia, almost all of it inside the Russian Empire in 1904",
 body:"This is the map of 1905. Mackinder pointed out that the heart of Eurasia is huge, flat or rolling, and far from the open ocean. Sea powers like Britain could not reach it, while a land power there could strike in any direction.",
 more:"He also argued that the ‘Columbian epoch’, 400 years of Europeans exploring and claiming the world from the sea, had just ended: nearly all land was now claimed, so every big event would be felt everywhere."}),
S({title:"Riders from the steppe",view:[-45,20,108,65],globe:[70,47,1.6],card:"left",mode:"history",sub:"1279/mon",gfRuler:{a:[19.5,47],b:[102.83,47.2]},
 pins:[[[102.83,47.2],"Karakorum","point"],[[19.5,47],"The Hungarian plain","point"]],
 phPins:[ph([103,46.5],"Horse racing in Mongolia"),ph([88,48.5],"Kazakh eagle hunters")],
 stat:"A belt of grassland, the steppe, runs about 6,000 km from Hungary to Mongolia",
 body:"This map shows the Mongol Empire in 1279. Mackinder argued that for 1,000 years horse-riding peoples from the steppe, Huns, Avars, Turks and Mongols, swept out into Europe, the Middle East, India and China. Drag the ruler along their highway of grass.",
 more:"Mackinder thought much of European history was shaped by having to resist pressure from Asia’s steppe. Historians today see the nomads as traders and empire-builders, not only raiders."}),
S({title:"Rivers that lead nowhere",view:[-18,30,135,78],globe:[80,58,1.6],card:"left",on:["rivers","lakes"],
 pins:[[[73,67],"The Ob flows to the Arctic","point"],[[127,71],"The Lena","point"],[[47.8,46.3],"The Volga ends in the Caspian","point"],[[60,45],"The Aral Sea","point"]],
 phPins:[ph([126.5,72.4],"The Lena delta"),ph([58.95,43.77],"Stranded ships, Aral Sea")],
 stat:"The great rivers of inner Eurasia flow into a frozen ocean or into lakes with no outlet",
 body:"Mackinder noticed that the Ob, the Yenisei and the Lena run north into the Arctic, which is iced up for much of the year, while the Volga, the Amu Darya and the Syr Darya end in the Caspian and Aral seas. None of them gives ships a way in from the open ocean.",
 more:"That, he argued, is what makes the pivot area a natural fortress. Compare Europe’s Rhine or China’s Yangtze, which carry ships straight to the sea."}),
S({title:"Far from any sea",view:[52,16,116,50],globe:[88,40,2.2],card:"left",hi:["cn"],hiSoft:["kz","mn"],gfRuler:{a:[87.62,43.83],b:[89.5,21.9]},
 pins:[[[87.62,43.83],"Ürümqi","point"],[[89.5,21.9],"Bay of Bengal","point"]],
 phPins:[ph([79.1,43.35],"Charyn Canyon, Kazakhstan")],
 stat:"Ürümqi, in western China, is about 2,500 km from the nearest ocean, farther than any other big city",
 body:"Near Ürümqi lies Eurasia’s ‘pole of inaccessibility’, the point on land farthest from any sea. Drag the ruler to the coast. Mackinder’s point: a navy, however strong, cannot reach the middle of this continent.",
 more:"Rain clouds from the oceans rarely reach this far, so much of the region is desert and dry grassland, the steppe that fed the horses of its riders."}),
S({title:"Railways change the game",view:[-36,25,141,70],globe:[85,52,1.5],card:"left",hi:["ru"],gfRuler:{a:[37.62,55.75],b:[131.89,43.12]},
 lines:[{coords:[[37.62,55.75],[49.6,58.6],[56.25,58],[60.6,56.84],[65.5,57.15],[73.37,54.98],[82.92,55.03],[92.87,56.01],[104.3,52.29],[107.6,51.83],[113.5,52.03],[127.5,50.25],[135.07,48.48],[131.89,43.12]],kind:"solid"}],
 pins:[[[37.62,55.75],"Moscow","point"],[[131.89,43.12],"Vladivostok","point"],[[104.3,52.29],"Irkutsk","point"]],
 iconPins:[ic([82.92,55.03],"train")],
 phPins:[ph([104.5,51.9],"Lake Baikal")],
 stat:"The Trans-Siberian Railway, begun in 1891, runs 9,289 km from Moscow to Vladivostok",
 body:"Mackinder argued that railways would do for land power what steamships had done for sea power. Armies and goods could now cross Eurasia in days, not months. The line was nearly finished when he spoke in 1904; the ruler shows the straight-line distance.",
 more:"A few weeks after his talk, Russia and Japan went to war in Manchuria, and Russia rushed troops east along the still-unfinished line. The railway was completed in 1916."}),
S({title:"Inner and outer crescents",view:W,globe:[70,30,1],card:"left",hi:["de","at","tr","in","cn","ir"],hiSoft:["gb","za","au","jp","ca","us"],
 pins:[[[10,51],"Inner crescent: Germany","point"],[[78,22],"Inner crescent: India","point"],[[105,33],"Inner crescent: China","point"],[[-2,54],"Outer crescent: Britain","point"],[[138,36],"Outer crescent: Japan","point"],[[134,-25],"Outer crescent: Australia","point"],[[24,-30],"Outer crescent: South Africa","point"]],
 stat:"Mackinder ringed the pivot with an ‘inner crescent’ of lands on the Eurasian edge and an ‘outer crescent’ beyond the seas",
 body:"The inner crescent (strongly shaded) included Germany, the Ottoman lands, Persia, India and China. The outer crescent (lightly shaded) was the island and overseas world: Britain, Japan, Australia, South Africa, Canada and the United States.",
 more:"His fear was that a land power in the pivot, perhaps allied with Germany, could push out into the inner crescent and build a fleet there, threatening the sea powers."}),
S({title:"The World-Island",view:[-180,-58,180,80],globe:[50,25,1.1],card:"left",
 pins:[[[60,30],"Europe, Asia and Africa: one landmass","point"]],
 phPins:[ph([29.05,41.1],"The Bosporus")],
 stat:"Europe, Asia and Africa form one great landmass that holds more than eight in ten of the world’s people",
 body:"In 1919 Mackinder called this landmass the ‘World-Island’. He argued it was bound to hold most of the world’s people and resources, so whoever united it could outbuild any sea power. Africa and Eurasia are joined at Suez, and only narrow straits split Europe from Asia and Africa.",
 more:"The Americas and Australia were, in his picture, islands off the World-Island’s shores."}),
S({title:"Who rules East Europe",view:[0,42,34,62],globe:[25,52,2.2],card:"left",mode:"history",sub:"1919/new",
 pins:[[[13.4,52.52],"Berlin","point"],[[37.62,55.75],"Moscow","point"],[[21.01,52.23],"Warsaw","point"],[[24.11,56.95],"Riga","point"],[[25.28,54.69],"Vilnius","point"],[[14.42,50.08],"Prague","point"]],
 phPins:[ph([25.29,54.69],"Vilnius Cathedral"),ph([24.75,59.44],"Tallinn’s old town")],
 stat:"In 1919 Mackinder wrote: who rules East Europe commands the Heartland, and the Heartland commands the World-Island",
 body:"This map shows Europe in 1919, after the First World War, with the newly independent states in their own colour. In his book Democratic Ideals and Reality, Mackinder, now calling the pivot the ‘Heartland’, urged the peacemakers to keep this belt of new countries between Germany and Russia strong.",
 more:"His formula ends: who rules the World-Island commands the world. It is the most quoted line in geopolitics, and also one of the most criticised as too simple."}),
S({title:"Containing the Heartland",view:[-98,0,145,75],globe:[60,40,1.2],card:"left",mode:"history",sub:"1955/ussr",
 pins:[[[4.35,50.85],"NATO, 1949","point"],[[139.7,35.7],"US–Japan alliance","point"],[[72.8,33.7],"Pakistan","point"],[[39,39],"Türkiye","point"]],
 phPins:[ph([13.39,52.51],"Checkpoint Charlie, 1963")],
 stat:"During the Cold War the Soviet Union held most of Mackinder’s Heartland",
 body:"This map shows 1955. American strategists, following the scholar Nicholas Spykman, argued that the ‘Rimland’, Mackinder’s inner crescent, mattered most, so the United States built alliances all around the Soviet Union’s edges. Historians still debate how far Mackinder’s map shaped the policy of containment.",
 more:"In 1943, aged 82, Mackinder updated his idea, pairing the Heartland with a North Atlantic ‘midland ocean’ linking America and Western Europe. In the 1930s German writers such as Karl Haushofer had twisted his ideas to justify conquest, which Mackinder regretted."}),
S({title:"New railways across the steppe",view:[-69,15,112,62],globe:[65,45,1.4],card:"left",hiSoft:["cn","kz","ru","by","pl","de"],on:["connections"],
 lines:[{coords:[[106.55,29.56],[103.8,36.06],[94.7,40.1],[87.62,43.83],[80.4,44.2],[76.9,43.25],[71.4,51.15],[61.4,55.16],[49.1,55.8],[37.62,55.75],[27.56,53.9],[23.69,52.08],[21.01,52.23],[13.4,52.52],[6.76,51.43]],kind:"flow"}],
 pins:[[[106.55,29.56],"Chongqing","point"],[[80.4,44.2],"Khorgos: border dry port","point"],[[6.76,51.43],"Duisburg","point"]],
 iconPins:[ic([71.4,51.15],"train")],
 phPins:[ph([121.9,30.6],"Yangshan port, Shanghai")],
 stat:"Since 2011 freight trains have run from China to Europe across the old pivot area, in about two to three weeks",
 body:"Ships still carry most trade between China and Europe, but rail is faster. China’s Belt and Road plan has paid for railways, ports and pipelines across Central Asia. Many commentators say Mackinder’s ideas are back in fashion.",
 more:"Others argue that air power, missiles, the internet and global trade make any single ‘pivot’ far less important than in 1904."}),
S({title:"Now explore",view:W,globe:[70,40,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on Rivers and look for the ones that never reach an open sea. Switch to the History map and watch the steppe empires come and go. Then compare Mackinder with the man he was answering: try The Influence of Sea Power upon History, Mahan’s case for the sea."})];

/* =====================================================================================================
   3. The Influence of Sea Power upon History (Alfred Thayer Mahan, 1890)
   ===================================================================================================== */
const SEA=[
S({title:"The Influence of Sea Power upon History",view:W,globe:[0,25,1],
 phPins:[ph([-5.35,36.14],"The Strait of Gibraltar"),ph([-79.6,9.0],"The Panama Canal"),ph([32.55,30.0],"The Ever Given in the Suez Canal"),ph([56.4,26.6],"A tanker in the Strait of Hormuz"),ph([103.86,1.28],"Singapore’s Marina Bay"),ph([14.51,35.9],"Valletta, Malta"),ph([18.42,-33.92],"Table Mountain, Cape Town"),ph([114.17,22.29],"Hong Kong harbour"),ph([-61.76,17.0],"Nelson’s Dockyard, Antigua")],
 stat:"Alfred Thayer Mahan’s 1890 book argued that nations become great by controlling the sea",
 body:"Mahan, a US Navy captain who taught at the Naval War College in Newport, Rhode Island, studied the wars of 1660 to 1783. He argued that Britain won its empire through sea power: a strong battle fleet, a big merchant navy, colonies and bases around the world.",
 more:"The book became a sensation. Theodore Roosevelt praised it, Germany’s Kaiser Wilhelm II said he was devouring it, and Japan’s naval officers studied it. This tour follows its ideas around the map."}),
S({title:"The gift of an island",view:[-25,34,9,58],globe:[-2,49,3.5],card:"left",hi:["gb"],hiSoft:["fr"],
 lines:[{coords:[[-4.49,48.39],[-9.5,45],[-10,40],[-9.5,37],[-6.5,36.1],[-5.4,35.95],[-2,36.4],[2,38.5],[5.93,43.12]],kind:"dash"}],
 pins:[[[-1.09,50.8],"Portsmouth","point"],[[-4.14,50.37],"Plymouth","point"],[[-4.49,48.39],"Brest: French Atlantic fleet","point"],[[5.93,43.12],"Toulon: French Mediterranean fleet","point"]],
 iconPins:[ic([-1.09,50.8],"ship"),ic([-4.49,48.39],"ship"),ic([5.93,43.12],"ship")],
 phPins:[ph([-0.13,51.5],"The Palace of Westminster")],
 stat:"Mahan listed six things that make sea power, and put geography first",
 body:"His six elements were a country’s position, its coastline and harbours, its size, its population, its people’s character and its government. Britain, an island with no land border to guard, could spend on its navy. France had to keep a big army, and split its fleet between Brest and Toulon (the dashed route around Spain).",
 more:"Mahan argued that France’s fleets could only join up by sailing past Gibraltar, which Britain held. Geography gave Britain a head start that France never overcame."}),
S({title:"Trade, ships and colonies",view:[-72,-42,112,60],globe:[50,10,1.2],card:"left",mode:"history",sub:"1650/ned",
 lines:[{coords:[[4.9,52.37],[-5,47],[-15,30],[-20,10],[-10,-15],[5,-30],[18.42,-33.92]],kind:"flow"},{coords:[[18.42,-33.92],[40,-35],[70,-32],[95,-15],[106.85,-6.2]],kind:"flow"}],
 pins:[[[4.9,52.37],"Amsterdam","point"],[[18.42,-33.92],"Cape Town, 1652","point"],[[106.85,-6.2],"Batavia (Jakarta)","point"],[[80.22,6.03],"Galle","point"]],
 phPins:[ph([18.42,-33.92],"Table Mountain, Cape Town")],
 stat:"Mahan saw sea power as a chain: trade pays for ships, ships need colonies and bases, and navies protect it all",
 body:"His story begins in 1660, when the small Dutch Republic ran the world’s richest sea trade (this map shows 1650). England fought three wars against the Dutch and gradually took over their role. Mahan argued that a navy depends on a strong merchant fleet and a busy trade to pay for it.",
 more:"The Dutch Republic had few people and long land borders to defend, so, Mahan argued, it could not keep up with England at sea for long."}),
S({title:"Gibraltar",view:[-8.5,35.2,-4.5,36.9],globe:[-5.4,36,6],card:"left",hiSoft:["es","ma"],on:["connections"],gfRuler:{a:[-5.6044,36.0019],b:[-5.4777,35.9126]},
 pins:[[[-5.35,36.14],"Gibraltar","point"],[[-5.31,35.89],"Ceuta","point"],[[-5.81,35.78],"Tangier","point"]],
 iconPins:[ic([-5.35,36.14],"ship")],
 phPins:[ph([-5.81,35.78],"The Strait of Gibraltar")],
 stat:"An English and Dutch force captured Gibraltar in 1704, and Britain has held it ever since",
 body:"The strait is only about 14 km wide at its narrowest (drag the ruler), and every ship between the Atlantic and the Mediterranean must pass it. Mahan argued that bases at chokepoints like this let a navy control trade far from home.",
 more:"Spain gave up Gibraltar in the Treaty of Utrecht of 1713 but has long asked for it back; it is a British Overseas Territory. The shipping lanes on the map still funnel through the strait."}),
S({title:"The battle that freed America",view:[-95,16,-66,40],globe:[-74,28,3],card:"left",hiSoft:["us"],
 lines:[{coords:[[-72.2,19.76],[-71,22.5],[-72,27],[-74.5,33],[-75.9,36.9]],kind:"flow"}],
 pins:[[[-75.9,36.95],"Battle of the Chesapeake, 5 Sept 1781","point"],[[-76.51,37.24],"Yorktown","point"],[[-72.2,19.76],"Cap-Français: de Grasse sails","point"]],
 iconPins:[ic([-75.9,36.95],"swords")],
 stat:"In 1781 a French fleet blocked the Chesapeake, trapping a British army at Yorktown",
 body:"The French admiral de Grasse sailed north from the Caribbean (the arrow) and beat back a British fleet at the mouth of Chesapeake Bay. Cut off from help by sea, General Cornwallis surrendered at Yorktown, and the American Revolution was won.",
 more:"Mahan used this as his last great example: for once, Britain lost control of the sea at the decisive spot, and lost its American colonies. His book ends with the peace of 1783."}),
S({title:"Coaling stations",view:[-96,-45,119,55],globe:[55,10,1.2],card:"left",mode:"history",sub:"1890/brit",
 pins:[[[-5.35,36.14],"Gibraltar","point"],[[14.51,35.9],"Malta","point"],[[45.03,12.79],"Aden","point"],[[18.42,-33.92],"Cape Town","point"],[[103.82,1.35],"Singapore","point"],[[114.17,22.29],"Hong Kong","point"],[[79.86,6.93],"Colombo","point"]],
 iconPins:[ic([45.03,12.79],"ship"),ic([103.82,1.35],"ship"),ic([14.51,35.9],"ship")],
 phPins:[ph([103.86,1.28],"Singapore’s Marina Bay")],
 stat:"In 1890, the year of Mahan’s book, Britain ruled a chain of ports that linked its empire",
 body:"This map shows the British Empire in 1890. Steamships needed coal every few thousand kilometres, so navies needed friendly ports along their routes. Mahan pointed to Britain’s chain of bases, from Gibraltar and Malta to Aden, Singapore and Hong Kong, as the backbone of its power.",
 more:"A British admiral, John Fisher, later called a handful of such bases the keys that lock up the world. Mahan urged the United States to win bases of its own."}),
S({title:"Mahan’s advice to America",view:[59,-20,207,45],globe:[170,20,1.2],card:"left",mode:"history",sub:"1900/usa",
 pins:[[[-157.86,21.31],"Hawaii, annexed 1898","point"],[[144.75,13.45],"Guam, 1898","point"],[[120.97,14.59],"The Philippines, 1898","point"],[[-171.7,-14.3],"American Samoa, 1900","point"]],
 iconPins:[ic([-157.95,21.36],"ship"),ic([144.75,13.45],"ship")],
 phPins:[ph([144.8,13.5],"Tumon Bay, Guam")],
 stat:"Within a decade of Mahan’s book the United States had battleships and Pacific islands",
 body:"Mahan urged the US to build a modern fleet, annex Hawaii and dig a canal across Central America. In 1898 it annexed Hawaii and, after war with Spain, took Guam, the Philippines and Puerto Rico. This map shows 1900.",
 more:"Theodore Roosevelt, a friend of Mahan’s, became president in 1901 and sent 16 battleships, the ‘Great White Fleet’, around the world in 1907 to 1909. People in the Philippines and Hawaii had not been asked; many resisted American rule."}),
S({title:"The Panama Canal",view:[-81.5,8.3,-78.6,9.9],globe:[-79.7,9.1,7],card:"left",hi:["pa"],on:["connections"],gfRuler:{a:[-79.9,9.36],b:[-79.57,8.95]},
 pins:[[[-79.9,9.36],"Colón: Atlantic","point"],[[-79.57,8.95],"Panama City: Pacific","point"],[[-79.84,9.17],"Gatún Lake","point"]],
 phPins:[ph([-79.6,8.99],"Panama Canal Miraflores Locks"),ph([-79.67,9.08],"Digging the Culebra Cut, 1904")],
 stat:"The canal opened in 1914 and cut a New York to San Francisco voyage from about 20,900 km to 8,400 km",
 body:"Mahan argued that a canal would let one American fleet move quickly between the Atlantic and the Pacific instead of sailing around South America. The United States built it from 1904 to 1914, across the narrowest part of the isthmus (drag the ruler; the canal itself is 82 km long).",
 more:"The US ran the canal until it was handed to Panama at the end of 1999. Ships climb 26 m through locks to Gatún Lake and back down the other side."}),
S({title:"The naval race",view:[-14,50,11,62],globe:[5,56,3.3],card:"left",hi:["gb","de"],
 pins:[[[5.9,56.7],"Battle of Jutland, 1916","point"],[[-2.97,58.9],"Scapa Flow: British fleet","point"],[[8.1,53.53],"Wilhelmshaven: German fleet","point"]],
 iconPins:[ic([5.9,56.7],"swords")],
 phPins:[ph([2,57],"An oil rig in the North Sea")],
 stat:"Inspired partly by Mahan, Germany built a battle fleet to rival Britain’s, and the two raced to build battleships",
 body:"Kaiser Wilhelm II wanted a navy fit for a world power. Britain answered with HMS Dreadnought in 1906 and many more battleships. In 1916 the two fleets met once in full at Jutland, the biggest battleship battle of the First World War.",
 more:"Britain lost more ships and men, but the German fleet rarely left port again, and Britain’s blockade kept squeezing Germany. Many historians see the naval race as one cause of the rivalry that led to war."}),
S({title:"Carriers replace battleships",view:[132,-10,252,50],globe:[190,22,1.2],card:"left",gfSun:{utc:18.3,day:341,city:["Pearl Harbor",-10.5]},
 pins:[[[-157.95,21.36],"Pearl Harbor, 7 Dec 1941","point"],[[-177.37,28.21],"Midway, June 1942","point"]],
 iconPins:[ic([-177.37,28.21],"swords")],
 stat:"At Pearl Harbor and Midway, aircraft from carriers, not battleships’ guns, decided the battles",
 body:"Japan’s navy, which had studied Mahan closely, attacked the US fleet at Pearl Harbor at 7:48 in the morning on 7 December 1941 (day and night on the map). Six months later, at Midway, US carrier planes sank four Japanese carriers.",
 more:"Mahan’s idea of a decisive clash between battle fleets lived on, but the big gun gave way to the aircraft carrier. Today navies are built around carriers and submarines."}),
S({title:"Chokepoints today",view:[-21,-15,106,42],globe:[70,15,1.6],card:"left",on:["connections"],
 pins:[[[56.4,26.6],"Strait of Hormuz","point"],[[101,2.8],"Strait of Malacca","point"],[[43.4,12.6],"Bab-el-Mandeb","point"],[[32.55,30.0],"Suez Canal","point"]],
 iconPins:[ic([56.4,26.6],"oil"),ic([101,2.8],"oil")],
 phPins:[ph([32.56,30.2],"The Ever Given in the Suez Canal"),ph([103.86,1.28],"Singapore’s Marina Bay")],
 stat:"About a fifth of the world’s oil passes through the Strait of Hormuz; even more passes Malacca",
 body:"Mahan’s chokepoints still matter. Most world trade travels by sea, along the shipping lanes shown, and much of it squeezes through a few narrow passages. When the Ever Given container ship blocked the Suez Canal for six days in 2021, it held up hundreds of ships.",
 more:"Navies patrol these straits to keep them open. Since 2023, attacks on ships near Bab-el-Mandeb have sent many vessels the long way around Africa."}),
S({title:"Bases far from home",view:[40,10,47,13.6],globe:[43,12,4],card:"left",hi:["dj"],hiSoft:["ye","er"],on:["connections"],gfRuler:{a:[43.33,12.47],b:[43.47,12.69]},
 pins:[[[43.15,11.59],"Djibouti City","point"],[[43.4,12.58],"Bab-el-Mandeb","point"]],
 iconPins:[ic([43.15,11.59],"ship")],
 phPins:[ph([43.15,11.6],"A mosque in Djibouti")],
 stat:"Tiny Djibouti, beside the Bab-el-Mandeb strait, hosts military bases of several of the world’s powers",
 body:"The strait is about 30 km wide at its narrowest (drag the ruler). The United States, France, Japan, Italy and China all keep forces in Djibouti; China opened its first overseas base there in 2017. It is a very Mahanian idea: a fleet needs bases near the sea lanes it guards.",
 more:"China now has the world’s largest navy by number of ships, while the US Navy is the largest by tonnage and has the most aircraft carriers."}),
S({title:"Now explore",view:W,globe:[0,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on Connections to see today’s shipping lanes and ports, and find the narrow straits they squeeze through. Then try The Geographical Pivot of History: Mackinder argued in 1904 that the age of sea power was ending and that land power in Eurasia would matter more."})];

/* =====================================================================================================
   4. How to Lie with Maps (Mark Monmonier, 1991)
   ===================================================================================================== */
const LIE=[
S({title:"How to Lie with Maps",view:W,globe:[20,30,1],
 phPins:[ph([-51.1,69.2],"Iceberg, Ilulissat"),ph([7.1,62.1],"Geirangerfjord"),ph([90.38,23.76],"Bangladesh’s parliament"),ph([-0.12,51.5],"The London Eye"),ph([76.51,35.88],"K2, Karakoram"),ph([150,-18],"The Coral Sea"),ph([37.54,55.75],"Moscow City"),ph([25.85,-17.92],"Victoria Falls")],
 stat:"Mark Monmonier’s 1991 book shows that every map has to bend the truth, and how to spot when it goes too far",
 body:"Monmonier, a geography professor at Syracuse University in New York, argues that lying with maps is not just easy but necessary: a map that showed everything would be as big and as messy as the world. Every map selects, simplifies and distorts. The trick is to know how.",
 more:"The book, now in its third edition (2018), is used in classrooms everywhere. This tour uses GeoFlock’s own maps and tools to show its lessons."}),
S({title:"White lies: leaving things out",view:[-16,56,34,72],globe:[14,64,3],card:"left",hi:["no"],gfRuler:{a:[7.05,57.98],b:[25.78,71.17]},
 pins:[[[7.05,57.98],"Lindesnes: the southern tip","point"],[[25.78,71.17],"North Cape","point"]],
 phPins:[ph([7.1,62.1],"Geirangerfjord")],
 stat:"Norway’s coast is about 1,700 km from end to end, but over 100,000 km long counting every fjord and island",
 body:"Monmonier explains that a small world map must leave things out and smooth coastlines. On this map Norway has a few dozen bends; in reality it has thousands of fjords and about 240,000 islands. Drag the ruler: the straight line is nothing like the real coast.",
 more:"The more you zoom out, the more detail must go. Cartographers call this generalisation, and Monmonier calls it the map’s necessary white lies."}),
S({title:"Mercator’s big north",view:[-180,-58,180,80],globe:[30,30,1.2],card:"left",hi:["ru"],ghosts:[{code:"ru",at:[21,2],col:"#b0563a",label:"Russia, true size"}],
 pins:[[[6.76,51.43],"Duisburg: Mercator’s map, 1569","point"]],
 phPins:[ph([-51.1,69.2],"Iceberg, Ilulissat")],
 stat:"On the Mercator map Russia looks bigger than Africa; Africa is really almost twice as big",
 body:"Monmonier explains that every projection, every way of flattening the globe, distorts something. Mercator’s map of 1569 keeps compass directions true for sailors, but swells lands near the poles. Russia has been dragged here onto Africa at its true size: drag it north and watch it grow.",
 more:"Even the Robinson map used here enlarges the far north a little. Russia is about 17 million km², Africa about 30 million."}),
S({title:"The Peters projection fight",view:[-91,-5,102,72],globe:[30,40,1.3],card:"left",hi:["in"],ghosts:[{code:"in",at:[14,53],col:"#a5683f",label:"India, true size"}],
 pins:[[[78,22],"India","point"]],
 phPins:[ph([77.24,28.66],"The Red Fort, Delhi")],
 stat:"India is about three-quarters the size of the whole European Union; many world maps make it look much smaller",
 body:"In 1973 the German historian Arno Peters promoted an equal-area world map, saying Mercator made rich northern countries look too important. Monmonier agrees about Mercator but criticises Peters: the projection was not new, and it badly squashes shapes. Drag India over Europe to compare.",
 more:"In 1989 seven North American geography groups called on publishers to stop using rectangular world maps altogether. The map you are using is the Robinson projection, a compromise that bends a little of everything."}),
S({title:"Where you draw the line",view:[-37,-10,125,60],globe:[60,30,1.2],card:"left",mode:"population",gfThr:{kind:"pop",v:100},
 pins:[[[78,25],"The Ganges plain","point"],[[113,32],"Eastern China","point"],[[31.2,30],"The Nile valley","point"]],
 phPins:[ph([139.7,35.66],"Shibuya crossing, Tokyo")],
 stat:"Change one number, the cut-off between colours, and the same data tells a different story",
 body:"This is the Population map. The slider in the card hides every place below a chosen density: drag it from 2 to 2,500 people per km². Monmonier shows how a mapmaker who picks the class breaks can make a problem look huge or tiny, without changing a single figure.",
 more:"Honest maps say how their colours were chosen. Monmonier suggests looking at the legend before the picture."}),
S({title:"Big land, few people",view:[-48,0,155,78],globe:[90,45,1.3],card:"left",mode:"population",hi:["bd"],ghosts:[{code:"bd",at:[100,62],col:"#2e7d32",label:"Bangladesh, true size"}],
 pins:[[[90.4,23.8],"Bangladesh: about 175 million people","point"],[[37.62,55.75],"Russia: about 145 million","point"]],
 phPins:[ph([37.54,55.75],"Moscow City")],
 stat:"Bangladesh has more people than Russia, on less than one percent of Russia’s land",
 body:"On most maps size is what catches the eye, so huge, empty countries look important. Monmonier warns that maps of elections or populations by area can mislead this way. Bangladesh has been placed in Siberia at its true size (the green shape): drag it around Russia.",
 more:"A cartogram solves this by redrawing each country in proportion to its people or votes instead of its land, so Bangladesh grows and Russia shrinks."}),
S({title:"Totals: the biggest look biggest",view:[-88,-10,102,70],globe:[60,35,1.2],card:"left",mode:"gdp",sub:"total",hi:["in","gb"],
 pins:[[[78,22],"India","point"],[[-2,54],"United Kingdom","point"]],
 phPins:[ph([-0.07,51.51],"The Tower of London")],
 stat:"India’s whole economy is now about as big as the United Kingdom’s",
 body:"This is the Economy map, coloured by each country’s total GDP, the value of everything it produces in a year. Big, populous countries come out dark, and India and the UK look alike. Monmonier warns that colouring areas by totals, not rates, mostly shows where the most people are.",
 more:"Next stop: the same data divided by population."}),
S({title:"Rates: the map flips",view:[-88,-10,102,70],globe:[60,35,1.2],card:"left",mode:"gdp",sub:"percapita",hi:["in","gb"],
 pins:[[[78,22],"India","point"],[[-2,54],"United Kingdom","point"]],
 phPins:[ph([103.86,1.28],"Singapore’s Marina Bay")],
 stat:"Per person, the UK’s economy is about 20 times India’s",
 body:"Same countries, same source, divided by the number of people: now small rich countries such as Singapore and Switzerland are darkest, and India is pale. Neither map lies, Monmonier would say, but each answers a different question.",
 more:"Monmonier’s rule: when you map counts by area, ask whether a rate, such as per person or per km², would be fairer."}),
S({title:"Maps as propaganda",view:[-180,-58,180,80],globe:[70,50,1.2],card:"left",mode:"history",sub:"1955/ussr",
 pins:[[[37.62,55.75],"Moscow","point"]],
 phPins:[ph([13.39,52.51],"Checkpoint Charlie, 1963")],
 stat:"Cold War maps often painted the Soviet Union a menacing red on projections that made it look even larger",
 body:"This History map shows 1955. Monmonier collects propaganda maps from many countries: big blocks of red, arrows pointing at neighbours, and projections that swell the far north. Russia’s Arctic lands, already huge, grow even more on Mercator.",
 more:"Colour carries feelings: red for danger, green for growth. Monmonier asks readers to notice what a map wants them to feel, not just what it shows."}),
S({title:"Lines that depend on who draws them",view:[65,30,84,39],globe:[76,33,3.5],card:"left",hi:["in","pk"],hiSoft:["cn"],
 pins:[[[74.8,34.08],"Srinagar","point"],[[74.3,35.9],"Gilgit","point"],[[79.5,35.2],"Aksai Chin","point"]],
 phPins:[ph([74.6,36.3],"Hunza Valley"),ph([76.5,35.75],"Concordia, Karakoram")],
 stat:"India, Pakistan and China each print a different border in Kashmir on their own maps",
 body:"Kashmir is divided between areas administered by India, Pakistan and China, and each country’s official maps show its own claims. Monmonier notes that governments often control how borders appear in atlases. Online map services may even show different lines depending on the country you view them from.",
 more:"Many atlases draw disputed borders as dashed lines or add a note. Wherever borders are disputed, it is worth asking whose map you are looking at."}),
S({title:"The Tube map bends London",view:[-1.6,51.3,0.6,51.9],globe:[-0.15,51.52,9],card:"left",gfRuler:{a:[-0.607,51.674],b:[0.251,51.559]},
 pins:[[[-0.607,51.674],"Amersham","point"],[[0.251,51.559],"Upminster","point"],[[-0.128,51.511],"Leicester Square and Covent Garden","point"]],
 phPins:[ph([-0.12,51.5],"The London Eye")],
 stat:"Harry Beck’s 1933 Tube map ignored real distances, and it is one of the most loved maps ever drawn",
 body:"Beck drew the Underground like an electrical circuit: straight lines, neat angles, evenly spaced stations, with the centre stretched and the suburbs squeezed. Monmonier calls this a useful lie. On the map, Leicester Square and Covent Garden look a normal stop apart; they are about 260 m apart.",
 more:"The network itself stretches about 60 km from Amersham to Upminster (drag the ruler). Beck’s style has been copied by metro maps all over the world."}),
S({title:"Islands that never were",view:[150,-27,170,-15],globe:[158,-20,3.5],card:"left",hiSoft:["au","nc"],
 pins:[[[159.93,-19.22],"‘Sandy Island’ (does not exist)","point"],[[166.45,-22.27],"Nouméa, New Caledonia","point"]],
 iconPins:[ic([159.93,-19.22],"ship")],
 phPins:[ph([150,-18],"The Coral Sea")],
 stat:"‘Sandy Island’ sat on maps of the Coral Sea for over a century; in 2012 scientists sailed there and found open ocean",
 body:"Monmonier warns that mapmakers copy from each other, so one mistake can live for generations. Sandy Island, probably a misreported sighting from the 1800s, was even on digital world maps until a research ship found water about 1,400 m deep there.",
 more:"Some errors are deliberate: mapmakers have invented ‘trap streets’ and even towns, such as Agloe in New York State, to catch anyone copying their work."}),
S({title:"Now explore",view:W,globe:[20,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Try the Projections page to see the same world on different maps, and the country dragger in the toolkit to compare true sizes. Switch between the Population and Economy maps and ask what each colour scheme hides. Then try the guided tour on map projections."})];

const TOURS={
 b1493:{name:"1493",short:"1493",hint:"Charles C. Mann’s 2011 book, on the map: La Isabela, Potosí’s silver, the Manila galleons, potatoes, guano, rubber and American crops in Africa and China",steps:M1493},
 bpivot:{name:"The Geographical Pivot of History",short:"The Pivot of History",hint:"Halford Mackinder’s 1904 paper, on the map: the Heartland, the steppe, rivers that lead nowhere, railways and the World-Island",steps:PIVOT},
 bseapower:{name:"The Influence of Sea Power upon History",short:"Sea Power",hint:"Alfred Thayer Mahan’s 1890 book, on the map: Gibraltar, the Chesapeake, coaling stations, Panama, Jutland and today’s chokepoints",steps:SEA},
 bliemaps:{name:"How to Lie with Maps",short:"How to Lie with Maps",hint:"Mark Monmonier’s 1991 book, on the map: generalisation, Mercator, Peters, class breaks, totals vs rates, propaganda and phantom islands",steps:LIE}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"1600/spa") is set up as if the tour ran on that map:
   the shared sub switch and key read the tour's map mode, so it is lent the stop's mode for that call only */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.b1493={mid:[
 {at:"La Isabela, 1494",st:"La Isabela, 1494",q:"La Isabela, Columbus’s colony of 1494, was on which island?",o:["Cuba","Hispaniola","Jamaica","Puerto Rico"],a:1,why:"On the north coast of today’s Dominican Republic.",kc:"do"},
 {at:"The silver mountain",st:"The silver mountain",q:"Potosí’s silver mountain, Cerro Rico, is in which country today?",o:["Peru","Mexico","Bolivia","Chile"],a:2,why:"Silver was found there in 1545.",kc:"bo"},
 {at:"The Manila galleons",st:"The Manila galleons",q:"Spanish galleons carried American silver from Acapulco to which city?",o:["Macau","Manila","Batavia","Nagasaki"],a:1,why:"Founded by Spain in 1571; Chinese merchants met the galleons there.",kc:"ph"}],
 recap:[
 {q:"Where were potatoes first farmed?",o:["Ireland","The Andes","Mexico","Spain"],a:1,why:"Near Lake Titicaca, thousands of years ago.",st:"The potato conquers Europe",kc:"pe"},
 {q:"Which country grows the most cassava, a crop from the Americas?",o:["Brazil","Nigeria","India","Indonesia"],a:1,why:"Cassava reached West Africa on Portuguese ships in the 1500s.",st:"American crops in Africa",kc:"ng"},
 {q:"Which crop did John Rolfe plant at Jamestown in 1612?",o:["Cotton","Sugar cane","Tobacco","Rice"],a:2,why:"It became Virginia’s first great export.",st:"Tobacco, worms and bees",kc:"us"}]};
TOURQ.bpivot={mid:[
 {at:"Riders from the steppe",st:"Riders from the steppe",q:"Karakorum, the Mongol capital, is in which country today?",o:["Kazakhstan","China","Mongolia","Russia"],a:2,why:"In the grassland of central Mongolia.",kc:"mn"},
 {at:"Rivers that lead nowhere",st:"Rivers that lead nowhere",q:"Into which sea does the Volga flow?",o:["The Black Sea","The Baltic","The Caspian","The Arctic Ocean"],a:2,why:"The Caspian has no outlet to the ocean.",kc:"ru"},
 {at:"Railways change the game",st:"Railways change the game",q:"The Trans-Siberian Railway runs from Moscow to which Pacific port?",o:["Vladivostok","Murmansk","Irkutsk","Magadan"],a:0,why:"9,289 km of track.",kc:"ru"}],
 recap:[
 {q:"Which big city is farthest from any ocean?",o:["Ulaanbaatar","Ürümqi","Almaty","Kabul"],a:1,why:"About 2,500 km from the nearest coast.",st:"Far from any sea",kc:"cn"},
 {q:"In 1919 Mackinder wrote that whoever rules which region commands the Heartland?",o:["East Europe","Western Europe","The Middle East","China"],a:0,why:"From his book Democratic Ideals and Reality.",st:"Who rules East Europe",kc:"pl"},
 {q:"Which mountain did Mackinder’s expedition climb first, in 1899?",o:["Kilimanjaro","Mount Kenya","Elbrus","Mont Blanc"],a:1,why:"He was a mountaineer as well as a geographer.",st:"The Geographical Pivot of History",kc:"ke"}]};
TOURQ.bseapower={mid:[
 {at:"Gibraltar",st:"Gibraltar",q:"In which year did an English and Dutch force capture Gibraltar?",o:["1588","1704","1805","1914"],a:1,why:"Spain ceded it in the Treaty of Utrecht, 1713.",kc:"gb"},
 {at:"The battle that freed America",st:"The battle that freed America",q:"Which navy blocked the Chesapeake in 1781, trapping the British at Yorktown?",o:["The Spanish","The Dutch","The French","The American"],a:2,why:"Admiral de Grasse’s fleet.",kc:"fr"},
 {at:"The Panama Canal",st:"The Panama Canal",q:"In which year did the Panama Canal open?",o:["1869","1904","1914","1999"],a:2,why:"Built by the United States from 1904.",kc:"pa"}],
 recap:[
 {q:"Which territories did the United States take in 1898?",o:["Cuba and Jamaica","Hawaii, Guam, the Philippines and Puerto Rico","Alaska and Samoa","Panama and Nicaragua"],a:1,why:"Hawaii was annexed; the rest came from the war with Spain.",st:"Mahan’s advice to America",kc:"us"},
 {q:"Where did the British and German battle fleets meet in 1916?",o:["Trafalgar","Jutland","Tsushima","Midway"],a:1,why:"The biggest battleship battle of the First World War.",st:"The naval race",kc:"dk"},
 {q:"Which small country beside the Bab-el-Mandeb hosts bases of several world powers?",o:["Eritrea","Djibouti","Oman","Somalia"],a:1,why:"China opened its first overseas base there in 2017.",st:"Bases far from home",kc:"dj"}]};
TOURQ.bliemaps={mid:[
 {at:"Mercator’s big north",st:"Mercator’s big north",q:"Which is bigger in area?",o:["Russia","Africa","They are the same","It depends on the map"],a:1,why:"Africa is about 30 million km², Russia about 17 million.",kc:"ru"},
 {at:"Big land, few people",st:"Big land, few people",q:"Which country has more people than Russia on less than 1% of its land?",o:["Bangladesh","Belgium","South Korea","Sri Lanka"],a:0,why:"About 175 million people on about 148,000 km².",kc:"bd"},
 {at:"The Tube map bends London",st:"The Tube map bends London",q:"Who designed the 1933 London Underground map?",o:["Gerardus Mercator","Harry Beck","Arno Peters","Arthur Robinson"],a:1,why:"He drew it like an electrical circuit.",kc:"gb"}],
 recap:[
 {q:"Which country has a coastline over 100,000 km long counting fjords and islands?",o:["Norway","Chile","Greece","Ireland"],a:0,why:"Though it is only about 1,700 km from end to end.",st:"White lies: leaving things out",kc:"no"},
 {q:"Which phantom island was ‘undiscovered’ in the Coral Sea in 2012?",o:["Sandy Island","Hy-Brasil","Frisland","Bermeja"],a:0,why:"A research ship found ocean about 1,400 m deep.",st:"Islands that never were",kc:"nc"},
 {q:"Per person, roughly how many times bigger is the UK’s economy than India’s?",o:["2 times","5 times","About 20 times","100 times"],a:2,why:"Even though their total economies are about the same size.",st:"Rates: the map flips",kc:"in"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "b1493|1493":"Landing of Columbus (2).jpg","b1493|La Isabela, 1494":"Santa Maria replica ship.jpg",
 "b1493|Mosquitoes draw a line":"Charleston Harbor - Fort Sumter 01.jpg","b1493|The silver mountain":"Cerro Rico over Potosí, Bolivia.jpg",
 "b1493|The Manila galleons":"Ortelius - Maris Pacifici 1589.jpg","b1493|Sweet potatoes on China’s hills":"Terrace field yunnan china denoised.jpg",
 "b1493|The potato conquers Europe":"Mercado Modelo de Huancayo Peru- Solanum tuberosum varieties IV.jpg",
 "b1493|Guano and the Great Famine":"Horrors of the emigrant ship-scene in the hold of the \"James Foster, Jun.\" LCCN92522099.tif",
 "b1493|Rubber leaves the Amazon":"Noite no Teatro Amazonas (cropped).jpg","b1493|American crops in Africa":"Women farmers in DR Congo.jpg",
 "b1493|Now explore":"Dried Cacao Pod Held in Hand.jpg",
 "bpivot|The Geographical Pivot of History":"Steppe grassland in Ukraine.jpg","bpivot|The pivot area":"Ergaki, Siberian pine forest, Spruce forest, Taiga wilderness, Sayan Mountains, Siberia, Russia.jpg",
 "bpivot|Riders from the steppe":"Mongolian Goats with Genghis Khan Equestrian Statue.jpg","bpivot|Rivers that lead nowhere":"Arctic Peatlands – Lena Delta (arctic-peatlands-lena-delta).jpg",
 "bpivot|Far from any sea":"Lake Balkhash. Mynaral village. 15.jpg","bpivot|Railways change the game":"Trans-Siberian train on the steppe.jpg",
 "bpivot|Inner and outer crescents":"British Empire map - The India and Colonial Exhibition, London (1886) - BL.jpg","bpivot|The World-Island":"The HoloGlobe Project (Version 3) (SVS155 - earth night).jpg",
 "bpivot|Who rules East Europe":"Warsaw, Old Town Square.jpg","bpivot|Containing the Heartland":"2018 NATO Summit in Brussels (29510554308).jpg",
 "bpivot|New railways across the steppe":"VL 85-022 container train.jpg","bpivot|Now explore":"Astana-steppe-7748.jpg",
 "bseapower|The Influence of Sea Power upon History":"Antigua English Harbour Nelson's Dockyard 2.jpg","bseapower|The gift of an island":"HMS Bark Endeavour - Replica01.jpg",
 "bseapower|Trade, ships and colonies":"Galle Fort.jpg","bseapower|Gibraltar":"Strait of Gibraltar perspective.jpg",
 "bseapower|The battle that freed America":"Early European ship - Google Art Project.jpg","bseapower|Coaling stations":"Panorama of Valletta.jpg",
 "bseapower|Mahan’s advice to America":"Waikiki and Diamond Head.jpg","bseapower|The Panama Canal":"Locomotives Tow Container Ship through Miraflores Locks - Panama Canal.jpg",
 "bseapower|The naval race":"North Sea oil rig.jpg","bseapower|Carriers replace battleships":"USS Arizona Memorial (aerial view).jpg",
 "bseapower|Chokepoints today":"Tanker in the Strait of Hormuz.jpg","bseapower|Bases far from home":"MAERSK HANOI Container Ship (Port Koper SIKOP, 2023).jpg",
 "bseapower|Now explore":"Shanghai-Yangshan-Port-Containers2013-01.JPG",
 "bliemaps|How to Lie with Maps":"(Marshall Islands stick chart, Meddo type). LOC 2010586181.jpg","bliemaps|White lies: leaving things out":"Lofoten, Norway (Unsplash).jpg",
 "bliemaps|Mercator’s big north":"Earth from Space- Northeast Greenland National Park ESA512867.jpg","bliemaps|The Peters projection fight":"Tourists taking pictures at Prime Meridian monument, Greenwich Observatory, London.jpg",
 "bliemaps|Where you draw the line":"Tokyo Shibuya Scramble Crossing 2021-04-27.jpg","bliemaps|Big land, few people":"National Assembly of Bangladesh (জাতীয় সংসদ ভবন).jpg",
 "bliemaps|Totals: the biggest look biggest":"Tower of London from the Shard (8515883950).jpg","bliemaps|Rates: the map flips":"Marina Bay Singapore-3499.jpg",
 "bliemaps|Maps as propaganda":"Berlin - Checkpoint Charlie 1963.jpg","bliemaps|Lines that depend on who draws them":"K2 2006b.jpg",
 "bliemaps|The Tube map bends London":"London Underground Train leaving Boston Manor Station - geograph.org.uk - 3099074.jpg","bliemaps|Islands that never were":"Coral Sea, Queensland (483718) (9443462706).jpg",
 "bliemaps|Now explore":"Ortelius - Maris Pacifici 1589.jpg"};
const PIN={
 /* 1493 */
 "Santo Domingo":"Aerial view Ciudad Colonial Santo Domingo 09 2019 0067.jpg","Cerro Rico, Potosí":"Cerro Rico over Potosí, Bolivia.jpg","Manila Bay":"Sunset in Manila Bay, Manila, Philippines.jpg",
 "Seville Cathedral":"Sevilla Cathedral - Southeast.jpg","Potatoes at a Peruvian market":"Mercado Modelo de Huancayo Peru- Solanum tuberosum varieties IV.jpg","Elmina Castle":"Elmina Castle - Ghana.jpg",
 "Cocoa pods, Côte d’Ivoire":"Breaking open cocoa pods in Ivory Coast.png","The Three Gorges":"Three gorges on the Yangtze river.jpg","Manaus opera house":"Noite no Teatro Amazonas (cropped).jpg",
 "The Columbus Lighthouse, Santo Domingo":"Santo Domingo.El Faro a Colón.20170402.jpg","Intramuros, Manila":"Baluartillo de San José, Manila, Filipinas, 2023-08-26, DD 41.jpg",
 "Lake Titicaca":"Amanecer en el lago Titicaca, Puno, Perú, 2015-08-01, DD 01.JPG","Andean potatoes":"Bitter potato varieties of Solanum curtilobum.png",
 "The Meeting of the Waters, Manaus":"The Meeting of the Waters, Manaus, Brazil.jpg",
 /* The Geographical Pivot of History */
 "The Kremlin, Moscow":"Moscow Kremlin and Bolshoy Kamenny Bridge late evening 01.JPG","The steppe near Astana":"Astana-steppe-7748.jpg","Lake Baikal":"Baikal, Cape Burhan, Olkhon Island, Lake Baikal, Russia.jpg",
 "Genghis Khan statue, Mongolia":"Mongolian Goats with Genghis Khan Equestrian Statue.jpg","The Palace of Westminster":"Palace of Westminster as seen from Westminster Bridge.jpg","Mount Kenya":"Mount Kenya Peaks.jpg",
 "The Great Wall at Badaling":"Badaling China Great-Wall-of-China-01.jpg","The Trans-Siberian in the Urals":"The iron bridge on stone pillars. Ural. Trans-Siberian Railroad.jpg",
 "Siberian taiga, Sayan Mountains":"Ergaki, Siberian pine forest, Spruce forest, Taiga wilderness, Sayan Mountains, Siberia, Russia.jpg","Horse racing in Mongolia":"Naadam 2023 - Horse racing 09.jpg",
 "Kazakh eagle hunters":"Kazakh Eagle Hunters.JPG","The Lena delta":"Arctic Peatlands – Lena Delta (arctic-peatlands-lena-delta).jpg","Stranded ships, Aral Sea":"Stranded ships at Moynaq, Aral Sea.jpg",
 "Charyn Canyon, Kazakhstan":"Charyn Canyon, Kazakhstan 03.jpg","The Bosporus":"Bosphorus Bridge (235499411).jpeg","Vilnius Cathedral":"Vilnius Cathedral Exterior 2, Vilnius, Lithuania - Diliff.jpg",
 "Tallinn’s old town":"Tallinna vanalinn päikesetõusu ajal.jpg","Checkpoint Charlie, 1963":"Berlin - Checkpoint Charlie 1963.jpg","Yangshan port, Shanghai":"Shanghai-Yangshan-Port-Containers2013-01.JPG",
 /* The Influence of Sea Power upon History */
 "The Strait of Gibraltar":"Strait of Gibraltar perspective.jpg","The Panama Canal":"Panama Canal Miraflores Locks.jpg","The Ever Given in the Suez Canal":"Container Ship 'Ever Given' stuck in the Suez Canal, Egypt - March 24th, 2021 cropped.jpg",
 "A tanker in the Strait of Hormuz":"Tanker in the Strait of Hormuz.jpg","Singapore’s Marina Bay":"Marina Bay Sands and illuminated polyhedral building Louis Vuitton over the water at blue hour with pink clouds in Singapore.jpg",
 "Valletta, Malta":"Panorama of Valletta.jpg","Table Mountain, Cape Town":"Cape Town (ZA), Table Mountain -- 2024 -- 2825.jpg","Hong Kong harbour":"Hong Kong Harbour Night 2019-06-11.jpg",
 "Nelson’s Dockyard, Antigua":"Antigua English Harbour Nelson's Dockyard 2.jpg","Tumon Bay, Guam":"Sailboat with Two Lovers Point in Tumon Bay, Guam.jpg",
 "Panama Canal Miraflores Locks":"Panama Canal Miraflores Locks.jpg","Digging the Culebra Cut, 1904":"Labourers at work on the panama canal at Culebra Cut 1904.jpg",
 "An oil rig in the North Sea":"North Sea oil rig.jpg","A mosque in Djibouti":"Djibouti mosque.JPG",
 /* How to Lie with Maps */
 "Iceberg, Ilulissat":"Iceberg in the Ilulissat Icefjord, Greenland (54067514893).jpg","Geirangerfjord":"Geirangerfjord from Ørnesvingen, 2013 June.jpg",
 "Bangladesh’s parliament":"National Assembly of Bangladesh (10).jpg","The London Eye":"London-Eye-2009.JPG","K2, Karakoram":"K2 2006b.jpg","The Coral Sea":"Coral Sea, Queensland (483718) (9443462706).jpg",
 "Moscow City":"Moscow-city (8293712287).jpg","Victoria Falls":"Victoria Falls from the Zimbabwe side.jpg","The Red Fort, Delhi":"Red Fort in Delhi 03-2016 img3.jpg",
 "Shibuya crossing, Tokyo":"Shibuya Crossing, Tokyo; December 2017.jpg","The Tower of London":"Tower of London from the Shard (8515883950).jpg",
 "Hunza Valley":"Hunza Valley, view from Eagle's Nest.jpg","Concordia, Karakoram":"Concordia (Karakoram).jpg"};
/* new photos (GF_BOOKS2_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BOOKS2_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={b1493:"Cerro Rico over Potosí, Bolivia.jpg",bpivot:"Trans-Siberian train on the steppe.jpg",bseapower:"Strait of Gibraltar perspective.jpg",bliemaps:"(Marshall Islands stick chart, Meddo type). LOC 2010586181.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
