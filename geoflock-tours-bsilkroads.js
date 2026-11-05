/* GeoFlock: a Mapped books tour: Peter Frankopan’s “The Silk Roads: A New History of the World” (2015), on the map.
   bsilkroads  "The Silk Roads"   Peter Frankopan, 2015
   The book’s argument: for most of history the centre of the world was not Europe but the lands between the eastern
   Mediterranean and China, crossed by roads of silk, faith, furs, slaves, plague, silver, oil and wheat. Each stop maps one
   of its chapters, from the Persian Royal Road to China’s Belt and Road. Frankopan’s views are summarised in our own words
   and presented as his; where other historians disagree, the card says so in a line. No book covers or long quotes.
   Built like geoflock-tours-books1.js (same step helper, fields, photo maps and Tours-page cover). Stops about a past year
   lay that year’s states over the Relief map with gfHistYear (geoflock-booktours-relief.js) instead of mode:"history",
   which would turn the whole tour into a History-map tour (geoflock-tourhist.js). Caravans, ships and trains move along the
   stops’ flow lines (window.gfWalkers, geoflock-walkers.js); the ruler (gfRuler), shared layers (on:[…]) and a height
   cross-section (xsec) over the Pamirs as usual.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry).
   WANT_PHOTOS: [
    ["Silk Road map.png or any period map of the overland and sea routes","The Silk Roads"],
    ["Nestorian Stele (Xi’an Beilin Museum, any photo)","Roads of faith"],
    ["Khorgos Gateway dry port (any photo)","The new Silk Roads"],
    ["Masjed Soleyman oil well No. 1 (any photo)","The road of black gold"],
    ["Silver dirham hoard from Gotland (any photo, e.g. Spillings Hoard)","Furs, slaves and silver"],
    ["Bayt al-Hikma / al-Maqamat illustration of a library in Baghdad (any)","The rise of Islam"] ] */
window.GF_BSILKROADS_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const ID="bsilkroads",COL="#b3743f",W=[-12,0,125,58];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* places, [lon, lat] */
const P={changan:[108.94,34.27],luoyang:[112.45,34.62],dunhuang:[94.66,40.14],turpan:[89.19,42.95],kucha:[82.96,41.72],kashgar:[75.99,39.47],ferghana:[71.8,40.5],
 samarkand:[66.97,39.65],bukhara:[64.42,39.77],merv:[61.84,37.66],balkh:[66.9,36.76],herat:[62.2,34.35],kabul:[69.17,34.53],ctesiphon:[44.58,33.09],baghdad:[44.37,33.31],
 palmyra:[38.27,34.55],antioch:[36.16,36.2],damascus:[36.3,33.51],jerusalem:[35.23,31.78],acre:[35.07,32.93],alex:[29.92,31.2],istan:[28.97,41.01],venice:[12.34,45.44],
 genoa:[8.93,44.41],rome:[12.48,41.9],sardis:[28.04,38.49],susa:[48.25,32.19],persepolis:[52.89,29.93],hamadan:[48.52,34.8],mecca:[39.83,21.42],medina:[39.61,24.47],
 talas:[71.4,42.9],birka:[17.54,59.33],novgorod:[31.27,58.52],kyiv:[30.52,50.45],bolghar:[49.06,54.98],itil:[47.9,46.6],rayy:[51.43,35.6],gotland:[18.5,57.5],
 karakorum:[102.83,47.2],khanbaliq:[116.4,39.9],tabriz:[46.29,38.08],hormuz:[56.46,27.1],caffa:[35.38,45.03],messina:[15.55,38.19],marseille:[5.37,43.3],
 chuy:[74.6,42.85],sarai:[46.7,48.6],lisbon:[-9.14,38.71],seville:[-5.99,37.39],calicut:[75.78,11.25],potosi:[-65.75,-19.59],acapulco:[-99.89,16.85],manila:[120.98,14.6],
 baku:[49.87,40.41],masjed:[49.29,31.95],abadan:[48.3,30.34],kirkuk:[44.39,35.47],dammam:[50.1,26.3],stalingrad:[44.5,48.7],maikop:[40.1,44.6],grozny:[45.7,43.32],
 kharkiv:[36.23,50.0],rostov:[39.7,47.23],tehran:[51.39,35.69],chongqing:[106.55,29.56],urumqi:[87.62,43.83],khorgos:[80.42,44.2],almaty:[76.89,43.24],astana:[71.43,51.13],
 moscow:[37.62,55.75],warsaw:[21.01,52.23],duisburg:[6.76,51.43],gwadar:[62.33,25.12],piraeus:[23.63,37.94],colombo:[79.85,6.93]};
/* the overland roads, for the overview: Chang’an to the Mediterranean by the northern and southern Tarim roads */
const LAND=[P.changan,[103.83,36.06],[102.64,37.93],P.dunhuang,P.turpan,P.kucha,P.kashgar,P.ferghana,P.samarkand,P.bukhara,P.merv,[54.4,36.1],P.hamadan,P.ctesiphon,P.palmyra,P.antioch];
const LAND2=[P.dunhuang,[89.9,40.5],[82.7,37.07],[79.92,37.11],[77.24,38.42],P.kashgar];
const SEA=[[121.47,31.23],[113.26,23.13],[106,10],[103.8,1.3],[95,6],P.colombo,P.calicut,[64,20],P.hormuz,[52,27],[48.8,30.0]];
const SEA2=[P.calicut,[60,13],[50,12.6],[43.4,12.6],[38.5,19],[34.4,26.5],[32.55,29.9],P.alex];

const STEPS=[
S({title:"The Silk Roads",view:W,globe:[65,35,1.3],card:"left",
 lines:[{coords:LAND,kind:"flow"},{coords:LAND2,kind:"dash"},{coords:SEA,kind:"dash"},{coords:SEA2,kind:"dash"}],
 pins:[[P.changan,"Chang’an","point"],[P.samarkand,"Samarkand","point"],[P.merv,"Merv","point"],[P.baghdad,"Baghdad","point"],[P.istan,"Constantinople","point"],[P.venice,"Venice","point"]],
 phPins:[ph([66.98,39.65],"The Registan, Samarkand"),ph([52.89,29.93],"Persepolis"),ph([94.8,40.04],"Mogao Caves, Dunhuang"),ph([12.34,45.43],"Venice"),ph([49.87,40.41],"Baku"),ph([107.53,47.81],"Genghis Khan’s statue")],
 stat:"Peter Frankopan’s 2015 bestseller retells world history from the lands in between: the Silk Roads",
 body:"Frankopan, an Oxford historian, argues that for most of the last 2,500 years the centre of the world was not Europe but the belt of land from the eastern Mediterranean to China, where empires, religions and goods met. The flow line is one of the overland roads; the dashed ones are its branches and the sea routes.",
 more:"The name ‘Silk Road’ was coined only in 1877, by the German geographer Ferdinand von Richthofen. Frankopan writes of many roads, each carrying something different: his chapters are ‘the road of furs’, ‘the road of slaves’, ‘the road of black gold’ and more. This tour follows them."}),
S({title:"The world’s centre",view:[25,18,95,52],globe:[60,38,2],card:"left",hi:["ir","af","tm","uz","tj","kg","kz","iq"],
 pins:[[P.merv,"Merv","point"],[P.samarkand,"Samarkand","point"],[P.balkh,"Balkh","point"],[P.baghdad,"Baghdad","point"],[P.bukhara,"Bukhara","point"]],
 phPins:[ph([61.84,37.66],"Merv’s ruins"),ph([64.41,39.78],"The Ark of Bukhara")],
 stat:"Frankopan’s ‘world’s central nervous system’: Persia, Mesopotamia and Central Asia",
 body:"Look at a map centred here, Frankopan says, and history changes shape. Cities like Merv, Balkh and Samarkand were among the largest and richest on Earth when Paris and London were small towns. Today the countries shaded here are often seen as remote or troubled; for most of history they were the crossroads of the world.",
 more:"Some reviewers praise the book for turning Western readers’ mental map around. Others feel it stretches the idea of ‘silk roads’ to cover almost everything, and that it says less about the region’s own peoples than about the empires that wanted its wealth."}),
S({title:"Persia’s royal road",view:[22,24,58,44],globe:[40,35,3],card:"left",gfHistYear:{y:-500,focus:"per",labels:[{gk:"per",name:"Persian Empire",at:[53,33.5]}]},gfRuler:{a:P.sardis,b:P.susa},
 lines:[{coords:[P.sardis,[31.99,39.65],[35.5,39.2],[38.5,38.6],[41.5,37.3],[44,36.19],[45.5,34.5],P.susa],kind:"flow"}],
 pins:[[P.sardis,"Sardis","point"],[P.susa,"Susa","point"],[P.persepolis,"Persepolis","point"]],
 iconPins:[ic([38.5,38.6],"scroll")],
 phPins:[ph([52.89,29.93],"Persepolis")],
 stat:"Frankopan begins with Persia, whose rulers built a road of about 2,500 km from Sardis to Susa",
 body:"The Achaemenid kings (coloured, about 500 BC) ruled from the Aegean to the Indus. Their Royal Road had over a hundred staging posts; ordinary travellers took some three months, while royal couriers on fresh horses relayed messages in about a week. Drag the ruler.",
 more:"The Greek historian Herodotus admired the couriers so much that his words are carved over a New York post office. Frankopan argues that Persia’s tolerance and its roads made it the model of a connected world."}),
S({title:"Silk and heavenly horses",view:[25,22,115,48],globe:[72,38,1.8],card:"left",gfHistYear:{y:-100,labels:[{gk:"chn",name:"Han China",at:[110,31]},{gk:"xiong",n:"Xiongnu",name:"Xiongnu",at:[104,46]},{gk:"per",name:"Parthia",at:[55,33]},{gk:"rom",name:"Rome"}]},
 lines:[{coords:LAND,kind:"flow"}],
 pins:[[P.changan,"Chang’an, Han capital","point"],[P.ferghana,"Ferghana: the ‘heavenly horses’","point"],[P.merv,"Merv","point"],[P.antioch,"Antioch","point"],[P.dunhuang,"Dunhuang","point"]],
 iconPins:[ic(P.ferghana,"paw"),ic(P.changan,"gem")],
 phPins:[ph([94.8,40.04],"Mogao Caves, Dunhuang")],
 stat:"In 138 BC the Han emperor sent an envoy, Zhang Qian, west to find allies; he came back with news of a whole new world",
 body:"Zhang Qian was held by the Xiongnu nomads for about ten years, escaped, and reached Central Asia. China then wanted the strong horses of Ferghana and sent armies to get them (104–101 BC). Soon Chinese silk was moving west, through Parthia, to Rome. The camels walk the road.",
 more:"Roman writers grumbled that silk drained the empire of gold and showed too much of the wearer. Few people travelled the whole way: goods passed from trader to trader, oasis to oasis. The card’s mural, painted at Dunhuang centuries later, is often said to show Zhang Qian’s departure."}),
S({title:"Roads of faith",view:[30,15,118,46],globe:[75,32,1.8],card:"left",gfHistYear:{y:100,focus:"kushan",labels:[{gk:"kushan",n:"Kushan Empire",name:"Kushan Empire",at:[72,30]}]},
 lines:[{coords:[[84.99,24.7],[77.67,27.49],[72.82,33.75],[71.58,34.01],[67.83,34.83],P.balkh,P.kashgar,P.kucha,P.turpan,P.dunhuang,P.luoyang],kind:"flow"},{coords:[P.jerusalem,[38.79,37.16],[41.22,37.07],P.ctesiphon,P.merv,P.samarkand,P.kashgar,P.dunhuang,P.changan],kind:"dash"}],
 pins:[[[84.99,24.7],"Bodh Gaya","point"],[[71.58,34.01],"Gandhara","point"],[P.luoyang,"Luoyang","point"],[P.changan,"Chang’an: a Christian stone, 781","point"],[[38.79,37.16],"Edessa","point"],[P.ctesiphon,"Ctesiphon: Mani’s home","point"]],
 iconPins:[ic(P.luoyang,"book"),ic(P.changan,"cross"),ic([71.58,34.01],"statue")],
 phPins:[ph([67.83,34.83],"Buddhas of Bamiyan"),ph([71.6,34.0],"Gandhara: Buddha and Heracles")],
 stat:"Merchants carried gods as well as goods: Buddhism reached China along these roads, and Christianity went east as far as Chang’an",
 body:"Under the Kushan kings (coloured, AD 100), Buddhism spread from India through Gandhara and over the mountains into the Tarim basin and China (flow line). Christians of the Church of the East travelled the dashed line through Persia; in 781 they set up an inscribed stone in Chang’an. Zoroastrians and the followers of Mani used the same roads.",
 more:"Frankopan argues that faiths competed in this marketplace much as goods did, borrowing from each other: Gandhara’s Buddhas wear Greek-style robes. Historians debate how far trade itself, rather than missionaries and rulers, explains the spread of religions."}),
S({title:"The rise of Islam",view:[-12,8,82,48],globe:[42,30,1.8],card:"left",gfHistYear:{y:800,focus:"isl",labels:[{gk:"isl",name:"Abbasid Caliphate",at:[46,29]},{gk:"chn",name:"Tang China"}]},
 lines:[{coords:[P.mecca,P.medina,P.damascus,P.baghdad,P.merv,P.samarkand,P.talas],kind:"dash"}],
 pins:[[P.mecca,"Mecca","point"],[P.damascus,"Damascus: Umayyad capital","point"],[P.baghdad,"Baghdad, founded 762","point"],[P.talas,"Talas, 751","point"],[P.samarkand,"Samarkand: paper","point"]],
 iconPins:[ic(P.talas,"swords"),ic(P.baghdad,"book"),ic(P.samarkand,"scroll")],
 phPins:[ph([44.37,33.31],"The Tigris at Baghdad"),ph([36.31,33.51],"The Umayyad Mosque, Damascus")],
 stat:"Within a century of the Prophet Muhammad’s death in 632, Muslim rule stretched from Spain to Central Asia",
 body:"The coloured land is the Abbasid Caliphate around 800. Frankopan describes Baghdad, founded in 762, as the wealthiest and most learned city of its age, where scholars translated Greek, Persian and Indian works. In 751 Arab and Tang armies clashed at Talas, at the meeting point of the two empires.",
 more:"A famous story says Chinese prisoners taken at Talas taught papermaking to Samarkand. Historians now doubt it: paper was probably already known in Central Asia. Either way, cheap paper spread west through the Islamic world and later into Europe."}),
S({title:"Furs, slaves and silver",view:[-2,28,62,64],globe:[32,50,1.8],card:"left",gfHistYear:{y:900,focus:"khz",labels:[{gk:"khz",name:"Khazars",at:[44,47.5]},{gk:"rus",name:"Kyivan Rus"},{gk:"isl",name:"Abbasid Caliphate",at:[45,30]}]},
 lines:[{coords:[P.birka,[20,59],[24,59.6],[28,60],[32.3,60],P.novgorod,[36,57.5],[42,56.5],P.bolghar,[48.5,51],P.itil,[50,42],[54.4,36.84],P.rayy,P.baghdad],kind:"flow"},{coords:[P.novgorod,[32.05,54.78],[30.6,52.5],P.kyiv,[33,48],[32,46.6],[30.5,44],P.istan],kind:"flow"}],
 pins:[[P.birka,"Birka","point"],[P.gotland,"Gotland: Arab silver hoards","point"],[P.bolghar,"Bolghar: Ibn Fadlan meets the Rus, 922","point"],[P.itil,"Itil, Khazar capital","point"],[P.kyiv,"Kyiv","point"]],
 iconPins:[ic(P.gotland,"gold"),ic(P.bolghar,"paw"),ic(P.itil,"person")],
 phPins:[ph([30.56,50.43],"Kyiv on the Dnieper"),ph([30.51,50.45],"St Sophia’s, Kyiv")],
 stat:"Vikings rowed down the Volga and the Dnieper to sell furs and slaves for Arab silver",
 body:"Frankopan’s ‘road of furs’ and ‘road of slaves’: Scandinavians known as the Rus took the river roads south to the Khazar khaganate (coloured) and on to the Caliphate. Tens of thousands of silver coins from Baghdad and Central Asia have been dug up in Sweden, most of all on Gotland. The ships follow the rivers.",
 more:"In 922 the Arab envoy Ibn Fadlan described the Rus traders on the Volga, tattooed and armed. Much of their trade was in captives taken from the Slav lands, which is why many scholars trace the word ‘slave’ to ‘Slav’. Kyiv grew up on the Dnieper road to Constantinople."}),
S({title:"Crusades and Italian fortunes",view:[0,26,46,50],globe:[22,38,2.4],card:"left",
 lines:[{coords:[P.venice,[13.5,44.5],[16.5,42.5],[19.3,40],[22,36.6],[25,35.7],[30,34],[34,33.2],P.acre],kind:"flow"},{coords:[P.genoa,[9,41],[12.5,38.6],P.messina,[20,35.5],[26,33],P.alex],kind:"flow"},{coords:[P.venice,[16.5,42.5],[19.3,40],[22,36.6],[24.5,37.5],[26.2,40],P.istan],kind:"dash"}],
 pins:[[P.venice,"Venice","point"],[P.genoa,"Genoa","point"],[P.acre,"Acre","point"],[P.jerusalem,"Jerusalem, taken 1099","point"],[P.alex,"Alexandria","point"],[P.istan,"Constantinople, sacked 1204","point"]],
 iconPins:[ic(P.jerusalem,"swords"),ic(P.istan,"swords"),ic(P.venice,"ship"),ic(P.genoa,"ship")],
 phPins:[ph([35.235,31.778],"The Dome of the Rock")],
 stat:"Frankopan argues that the Crusades were about trade and money as much as faith, and that Venice and Genoa won most",
 body:"The First Crusade took Jerusalem in 1099. Italian merchant cities shipped the armies east and won trading quarters, tax breaks and harbours in return. In 1204 the Fourth Crusade, steered by Venice, sacked Christian Constantinople itself. The ships sail the Italian routes.",
 more:"Historians of the Crusades still argue about motives: many stress real religious devotion. Frankopan’s point is that, either way, the money of the East flowed into Italy and helped pay for the Renaissance."}),
S({title:"The Mongol road",view:[0,15,130,58],globe:[75,42,1.4],card:"left",gfHistYear:{y:1279,focus:"mon",labels:[{gk:"mon",name:"Mongol khanates",at:[90,50]}]},
 lines:[{coords:[P.venice,[16.5,42.5],[22,36.6],[30,34.5],P.acre,[35.78,36.77],[40,38.5],P.tabriz,[52,32],[57,30],P.hormuz,[58,32],[61,35],P.balkh,[71,37],P.kashgar,[79.92,37.11],[89.9,40.5],P.dunhuang,[104,38.5],P.khanbaliq],kind:"flow"}],
 pins:[[P.karakorum,"Karakorum","point"],[P.khanbaliq,"Khanbaliq (Beijing)","point"],[P.baghdad,"Baghdad, sacked 1258","point"],[P.tabriz,"Tabriz","point"],[P.venice,"Venice","point"]],
 iconPins:[ic(P.baghdad,"swords"),ic(P.karakorum,"paw")],
 phPins:[ph([116.4,39.9],"A Catalan Atlas caravan"),ph([108,40],"Chinese paper money"),ph([130,34],"The Mongols attack Japan")],
 stat:"The Mongols built the largest land empire in history; Frankopan sees it as a great trading zone as well as a slaughterhouse",
 body:"Genghis Khan and his heirs conquered from Korea to Hungary, killed vast numbers and sacked Baghdad in 1258. But the khans also protected merchants, used paper money and moved craftsmen, doctors and ideas across Asia. Marco Polo’s caravan walks his route to the court of Kublai Khan.",
 more:"Polo’s book is full of puzzles: he never mentions tea or the Great Wall, and in 1995 the historian Frances Wood asked whether he reached China at all. Most scholars think he did. Frankopan stresses how open Mongol rule was to trade and to many religions."}),
S({title:"The Black Death",view:[-8,30,82,56],globe:[38,45,1.6],card:"left",
 lines:[{coords:[P.chuy,[68,43.5],[60,45],[52,47.5],P.sarai,[42,47.5],P.caffa],kind:"flow"},{coords:[P.caffa,[31.5,43],P.istan,[26.2,40],[24,37],[20,36],P.messina,[11.5,40],P.genoa,P.marseille],kind:"flow"}],
 pins:[[P.chuy,"Chüy valley: plague graves of 1338–39","point"],[P.caffa,"Caffa (Feodosia): the siege of 1346","point"],[P.istan,"Constantinople, 1347","point"],[P.messina,"Messina, October 1347","point"],[P.marseille,"Marseille","point"]],
 iconPins:[ic(P.chuy,"cross"),ic(P.caffa,"swords")],
 phPins:[ph([77.3,42.4],"Lake Issyk-Kul"),ph([75.25,42.75],"Burana Tower")],
 stat:"In the 1340s plague travelled the trade routes from Central Asia to Europe and killed perhaps a third or more of its people",
 body:"In 2022 scientists read the plague bacterium’s DNA from graves of 1338–39 in Kyrgyzstan’s Chüy valley, close to where the pandemic’s strain seems to have arisen. It reached the Black Sea, where the Golden Horde was besieging the Genoese port of Caffa, then sailed with the ships to Constantinople, Sicily and Italy. Follow the caravan and the galleys.",
 more:"A chronicler claimed the besiegers of Caffa hurled plague corpses over the walls; historians are unsure. Frankopan argues that the Black Death, terrible as it was, raised the wages of those who survived and helped reshape Europe’s economy."}),
S({title:"Silver: the world joins up",view:[-180,-50,180,62],globe:[-40,10,1],card:"left",gfHistYear:{y:1600,labels:[{n:"Spain",name:"Spain"},{n:"Viceroyalty of Peru",name:"Spanish America",at:[-64,-12]},{n:"Kingdom of Portugal",name:"Portugal"}]},
 lines:[{coords:[P.lisbon,[-17,20],[-22,0],[-10,-30],[18.4,-35],[32,-26],[40.12,-3.22],[60,8],P.calicut],kind:"flow"},{coords:[P.acapulco,[-130,14],[-170,13],[160,13],[135,13.5],P.manila],kind:"flow"},{coords:[P.potosi,[-70.3,-18.48],[-80,-10],[-79.5,9],[-79.9,9.35],[-70,17],[-50,25],[-25,35],P.seville],kind:"dash"}],
 pins:[[P.potosi,"Potosí: the silver mountain","point"],[P.manila,"Manila","point"],[P.acapulco,"Acapulco","point"],[P.calicut,"Calicut, 1498","point"],[P.seville,"Seville","point"]],
 iconPins:[ic(P.potosi,"gold"),ic(P.calicut,"spice"),ic(P.manila,"ship")],
 phPins:[ph([75.78,11.25],"Black pepper"),ph([121,31],"Chinese blue-and-white porcelain"),ph([-6,37.4],"A replica of the Santa María")],
 stat:"After 1492 and 1498, Europe’s ships reached Asia and the Americas, and American silver paid for Asia’s goods",
 body:"Columbus sailed west to find Asia; Vasco da Gama sailed round Africa to India’s pepper ports. Frankopan argues that Europe’s rise came from tapping the wealth of the East. From 1571 Spanish galleons carried silver from Potosí and Mexico across the Pacific to Manila, where Chinese merchants traded it for silk and porcelain.",
 more:"Historians estimate that much of the silver mined in the Americas ended up in China, which demanded it for taxes. The coloured lands are Spain’s and Portugal’s empires in 1600; the ships sail da Gama’s route and the Manila galleons’."}),
S({title:"The Great Game",view:[44,20,92,48],globe:[66,36,2.4],card:"left",gfHistYear:{y:1895,labels:[{gk:"rus",name:"Russian Empire",at:[68,45]},{gk:"brit",n:/India|Raj/,name:"British India",at:[78,23]},{gk:"per",name:"Persia"}]},gfRuler:{a:P.merv,b:P.herat},
 pins:[[P.samarkand,"Samarkand: Russian from 1868","point"],[P.merv,"Merv: Russian from 1884","point"],[P.herat,"Herat","point"],[P.kabul,"Kabul","point"],[[71.1,34.08],"Khyber Pass","point"],[[72.5,37.0],"Wakhan Corridor, 1895","point"]],
 iconPins:[ic([72.5,37.0],"mountain"),ic(P.merv,"swords")],
 phPins:[ph([64.41,39.78],"The Ark of Bukhara")],
 stat:"In the 1800s Russia pushed south into Central Asia and Britain, ruling India, feared it was coming for the Raj",
 body:"Russia (coloured) took Samarkand in 1868 and Merv in 1884, leaving it only a few hundred kilometres from Herat, which the British called a gateway to India (drag the ruler). Afghanistan was left between them as a buffer, with a thin finger of land, the Wakhan Corridor, keeping the two empires apart.",
 more:"The rivalry was nicknamed ‘the Great Game’. Frankopan argues that Britain’s worry about its routes to India drove much of its policy in Persia and the Middle East, and that the habit outlived the empire."}),
S({title:"The road of black gold",view:[34,22,64,44],globe:[49,33,3],card:"left",on:["resources"],
 pins:[[P.baku,"Baku","point"],[P.masjed,"Masjed Soleyman: oil, 1908","point"],[P.abadan,"Abadan refinery","point"],[P.kirkuk,"Kirkuk, 1927","point"],[P.dammam,"Dammam, 1938","point"],[P.hormuz,"Strait of Hormuz","point"]],
 iconPins:[ic(P.masjed,"oil"),ic(P.baku,"oil"),ic(P.kirkuk,"oil"),ic(P.dammam,"oil")],
 phPins:[ph([56.4,26.6],"A tanker in the Strait of Hormuz")],
 stat:"In 1908 British prospectors struck oil in south-west Persia; within a few years Britain’s navy depended on it",
 body:"Baku, on the Caspian, was the world’s great oil town around 1900. Then the Anglo-Persian Oil Company, the ancestor of BP, found oil at Masjed Soleyman and built a refinery at Abadan. In 1914 the British government bought a controlling share, as Churchill switched the navy from coal to oil.",
 more:"Frankopan’s ‘road of black gold’ runs through Iraq’s Kirkuk and Saudi Arabia’s Dammam to the coup of 1953, when Britain and the US helped overthrow Iran’s prime minister Mohammad Mosaddegh after he nationalised the oil industry. The Resources layer shows oil today."}),
S({title:"The road of wheat",view:[22,38,54,56],globe:[40,48,3],card:"left",hi:["ua"],
 lines:[{coords:[P.kharkiv,[38,49.2],[41.5,48.8],P.stalingrad],kind:"flow"},{coords:[P.kharkiv,P.rostov,[40.0,45.6],P.maikop,[43,43.8],P.grozny],kind:"flow"}],
 pins:[[P.kyiv,"Kyiv","point"],[P.stalingrad,"Stalingrad, 1942–43","point"],[P.maikop,"Maikop oilfields","point"],[P.grozny,"Grozny","point"],[P.baku,"Baku: the real prize","point"]],
 iconPins:[ic([33,48.5],"wheat"),ic([36,49.4],"wheat"),ic(P.baku,"oil"),ic(P.stalingrad,"swords")],
 phPins:[ph([32,48.8],"Ukraine’s steppe")],
 stat:"Frankopan argues that Hitler’s war in the east was a war for Ukraine’s grain and the Caucasus’s oil",
 body:"Nazi planners counted on feeding Germany with Ukraine’s harvests, even if it meant starving millions of Soviet citizens, a scheme historians call the Hunger Plan. In 1942 German armies drove towards Stalingrad and the oilfields of the Caucasus (the arrows), aiming in the end for Baku. They were stopped.",
 more:"The Soviet victory at Stalingrad in early 1943 turned the war. Historians agree on the importance of grain and oil in Nazi planning, though they weigh it against ideology and race war differently."}),
S({title:"1979 and after",view:[30,18,80,44],globe:[55,32,2.6],card:"left",hi:["ir","af","iq"],on:["connections"],
 pins:[[P.tehran,"Tehran: revolution, 1979","point"],[P.kabul,"Kabul: Soviet invasion, December 1979","point"],[P.baghdad,"Baghdad","point"],[P.hormuz,"Strait of Hormuz","point"]],
 iconPins:[ic(P.kabul,"swords"),ic(P.hormuz,"ship")],
 phPins:[ph([67.8,34.8],"Students in Bamyan today"),ph([44.38,33.32],"Baghdad at sunset")],
 stat:"In one year, 1979, Iran’s revolution and the Soviet invasion of Afghanistan set the region on a new course",
 body:"Frankopan’s last chapters follow the US and Britain as they tried to steer the Silk Road lands for oil and Cold War advantage: backing the shah, then arming Afghan fighters against the Soviets and backing Iraq against Iran. He argues that, again and again, these moves made the region less stable. Shipping lanes still squeeze through Hormuz.",
 more:"This is the book’s most political part, and readers who favour other foreign policies dispute some of his judgements. About a fifth of the world’s oil passes through the Strait of Hormuz."}),
S({title:"The new Silk Roads",view:[-2,0,125,58],globe:[70,40,1.3],card:"left",hi:["cn"],
 xsec:{title:"Across the Pamirs: Kashgar to the Khunjerab Pass",pts:[[P.kashgar[0],P.kashgar[1],"Kashgar"],[75.05,38.45],[75.23,37.77,"Tashkurgan"],[75.42,36.85,"Khunjerab Pass"],[74.65,36.32,"Hunza"]],mark:4000,note:"The dashed line marks 4,000 m. The Karakoram Highway, the land route of the China–Pakistan corridor, crosses here at about 4,700 m."},
 lines:[{coords:[P.chongqing,[103.83,36.06],P.urumqi,P.khorgos,P.almaty,P.astana,[61.4,55.16],P.moscow,[27.56,53.9],P.warsaw,[13.4,52.52],P.duisburg],kind:"flow"},{coords:[P.kashgar,[75.23,37.77],[74.65,36.32],[73.05,33.7],[67,24.9],P.gwadar],kind:"dash"},{coords:[[121.47,31.23],[113.9,22.3],[106,10],[103.8,1.3],[95,6],P.colombo,[60,13],[43.4,12.6],[38.5,19],[32.55,29.9],[29,33],P.piraeus],kind:"dash"}],
 pins:[[P.khorgos,"Khorgos: a dry port on the Kazakh border","point"],[P.duisburg,"Duisburg","point"],[P.gwadar,"Gwadar","point"],[P.piraeus,"Piraeus","point"],[P.astana,"Astana: the plan announced, 2013","point"]],
 iconPins:[ic(P.khorgos,"train"),ic(P.gwadar,"anchor"),ic(P.piraeus,"anchor")],
 phPins:[ph([71.5,51],"The steppe near Astana"),ph([101,2.5],"Ships in the Malacca Strait")],
 stat:"In 2013 China’s leader Xi Jinping announced a ‘Silk Road Economic Belt’: railways, ports and pipelines across Eurasia",
 body:"The Belt and Road Initiative now reaches well over 100 countries. Freight trains run from Chinese cities to Germany (the flow line); a corridor of roads crosses the Pamirs to Pakistan’s port of Gwadar (see the cross-section); Chinese firms run ports such as Piraeus in Greece. Frankopan’s closing claim: the Silk Roads are rising again.",
 more:"He expanded this in a sequel, The New Silk Roads (2018). Supporters see investment that poorer countries badly need; critics warn of debts and political leverage, though researchers have questioned the idea that China sets ‘debt traps’ on purpose."}),
S({title:"Now explore",view:W,globe:[65,35,1.3],
 lines:[{coords:LAND,kind:"dash"},{coords:SEA,kind:"dash"}],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on Connections to see today’s shipping lanes, and Resources for oil and gas. Then compare with Prisoners of Geography, which reads the same region through mountains and rivers, or follow one traveller on these roads in the Journey to the West tour."})];

/* caravans, ships and trains on the roads (geoflock-walkers.js) */
const WALK={
 "The Silk Roads":{emoji:"🐪",name:"A Silk Road caravan",size:26,per:2},
 "Persia’s royal road":{emoji:"🐎",name:"A royal courier",size:26,per:2},
 "Silk and heavenly horses":{emoji:"🐪",name:"Camels carrying silk west",size:26,per:2},
 "Roads of faith":{emoji:"🐪",name:"Monks and merchants on the road",size:26,per:1},
 "Furs, slaves and silver":{emoji:"⛵",name:"Rus traders on the rivers",size:24,per:1,float:1},
 "Crusades and Italian fortunes":{emoji:"⛵",name:"Venetian and Genoese galleys",size:24,per:1,float:1},
 "The Mongol road":{emoji:"🐪",name:"Marco Polo’s caravan",size:26,per:1,dur:20000},
 "The Black Death":{emoji:["🐪","⛵"],name:"The plague travelling with trade",size:26,per:1},
 "Silver: the world joins up":{emoji:"⛵",name:"Portuguese ships and Manila galleons",size:24,per:1,float:1},
 "The new Silk Roads":{emoji:"🚆",name:"A freight train from China to Germany",size:26,per:2}};
const addWalk=()=>{try{if(!window.gfWalkers)return;for(const t in WALK)window.gfWalkers[ID+"|"+t]=WALK[t]}catch(e){}};
addWalk();addEventListener("load",()=>setTimeout(addWalk,500));

PS_TOURS[ID]={name:"The Silk Roads",short:"The Silk Roads",hint:"Peter Frankopan’s 2015 history of the world from its centre, on the map: Persia’s road, Han silk, faiths, Vikings, Mongols, the Black Death, silver, oil and the new Belt and Road",
 map:{mode:"relief"},group:"books",col:COL,steps:STEPS,stopModes:false,alsoOn:[]};
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER,k=o.indexOf(ID);if(k>=0)o.splice(k,1);o.push(ID)}
const mine=()=>typeof ps!=="undefined"&&ps&&ps.tour===ID;

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined")TOURQ[ID]={mid:[
 {at:"Silk and heavenly horses",st:"Silk and heavenly horses",q:"Which Han envoy travelled west in 138 BC?",o:["Zheng He","Zhang Qian","Xuanzang","Ban Chao"],a:1,why:"He was held by the Xiongnu for about ten years.",kc:"cn"},
 {at:"The Black Death",st:"The Black Death",q:"In which country were plague graves of 1338–39 found that hold the pandemic’s DNA?",o:["Mongolia","Kyrgyzstan","Iran","Ukraine"],a:1,why:"In the Chüy valley, published in 2022.",kc:"kg"},
 {at:"The road of black gold",st:"The road of black gold",q:"Where was oil first struck in the Middle East, in 1908?",o:["Kirkuk","Masjed Soleyman, Persia","Dammam","Kuwait"],a:1,why:"By the company that became BP.",kc:"ir"}],
 recap:[
 {q:"Who coined the name ‘Silk Road’ in 1877?",o:["Marco Polo","Ferdinand von Richthofen","Sven Hedin","Aurel Stein"],a:1,why:"A German geographer.",st:"The Silk Roads",kc:"de"},
 {q:"Which city was founded as the Abbasid capital in 762?",o:["Damascus","Cairo","Baghdad","Samarkand"],a:2,why:"On the Tigris.",st:"The rise of Islam",kc:"iq"},
 {q:"Which city did the Fourth Crusade sack in 1204?",o:["Jerusalem","Constantinople","Alexandria","Acre"],a:1,why:"A Christian city, sacked by a crusade steered by Venice.",st:"Crusades and Italian fortunes",kc:"tr"}]}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "The Silk Roads":"Caravane Marco Polo.jpg",
 "The world’s centre":"Registan 01.jpg",
 "Persia’s royal road":"Persepolis – Gate of All Nations 02.jpg",
 "Silk and heavenly horses":"DunhuangCave323.jpg",
 "Roads of faith":"Mogao Caves (54376969262).jpg",
 "The rise of Islam":"Damascus, Syria, The Umayyad Mosque, The Courtyard, Islamic Art.jpg",
 "Furs, slaves and silver":"Kyiv Pechersk Lavra - View from the Dnieper River.jpg",
 "Crusades and Italian fortunes":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg",
 "The Mongol road":"Genghis Khan Equestrian Statue, photo by Vaiz Ha.jpg",
 "The Black Death":"The Triumph of Death by Pieter Bruegel the Elder.jpg",
 "Silver: the world joins up":"Cerro Rico over Potosí, Bolivia.jpg",
 "The Great Game":"Khyber Pass.jpg",
 "The road of black gold":"Flame towers from Baku boulevard.JPG",
 "The road of wheat":"Steppe grassland in Ukraine.jpg",
 "1979 and after":"Tanker in the Strait of Hormuz.jpg",
 "The new Silk Roads":"Trans-Siberian train on the steppe.jpg",
 "Now explore":"Camels in Gobi Desert 02.jpg"};
const CAP={
 "The Silk Roads":"A caravan on the Catalan Atlas, 1375",
 "The world’s centre":"The Registan, Samarkand",
 "Persia’s royal road":"The Gate of All Nations, Persepolis",
 "Silk and heavenly horses":"Mogao Cave 323, Dunhuang: a Tang mural often read as Zhang Qian’s mission",
 "Roads of faith":"The Mogao Caves at Dunhuang, carved by Buddhists from the 4th century",
 "The rise of Islam":"The Umayyad Mosque, Damascus, finished in 715",
 "Furs, slaves and silver":"Kyiv’s Pechersk Lavra above the Dnieper",
 "Crusades and Italian fortunes":"The Doge’s Palace, Venice",
 "The Mongol road":"Genghis Khan’s statue near Ulaanbaatar, built 2008",
 "The Black Death":"The Triumph of Death, by Pieter Bruegel the Elder, about 1562",
 "Silver: the world joins up":"Cerro Rico above Potosí, Bolivia",
 "The Great Game":"The Khyber Pass, between Afghanistan and Pakistan",
 "The road of black gold":"Baku’s Flame Towers",
 "The road of wheat":"Steppe grassland in Ukraine",
 "1979 and after":"A tanker in the Strait of Hormuz",
 "The new Silk Roads":"A train crossing the steppe",
 "Now explore":"Camels in the Gobi"};
const PIN={
 "The Registan, Samarkand":"Registan 01.jpg","Persepolis":"Persepolis – Gate of All Nations 02.jpg","Mogao Caves, Dunhuang":"Mogao Caves (54376969262).jpg",
 "Venice":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg","Baku":"BAKU AT NIGHT .RED TOWERS.באקו בלילה מגדלים באדום.jpg",
 "Genghis Khan’s statue":"Genghis Khan Equestrian Statue, photo by Vaiz Ha.jpg","Merv’s ruins":"Turkmenistan Merv city.jpg","The Ark of Bukhara":"Ark of Bukhara 2023.9.jpg",
 "Buddhas of Bamiyan":"Buddhas of Bamiyan D39.jpg","Gandhara: Buddha and Heracles":"Buddha-Vajrapani-Herakles.JPG","The Tigris at Baghdad":"Tigris in Baghdad 1958 04.jpg",
 "The Umayyad Mosque, Damascus":"Damascus, Syria, The Umayyad Mosque, The Courtyard, Islamic Art.jpg","Kyiv on the Dnieper":"The three merry fellows. Dnieper River in Kyiv. Ukraine.jpg",
 "St Sophia’s, Kyiv":"80-391-9014 Kyiv Sofia 2 RB 24.jpg","The Dome of the Rock":"Jerusalem-2013-Temple Mount-Dome of the Rock & Chain 02.jpg",
 "A Catalan Atlas caravan":"Caravane Marco Polo.jpg","Chinese paper money":"Hue-tzu (Song Dynasty government issue), 1023 - John E. Sandrock.jpg",
 "The Mongols attack Japan":"Kikuchi Yoosai - Mongol Invasion (mōko shūrai) - Tokyo National Museum.jpg","Lake Issyk-Kul":"Lake Issyk-Kul, Kyrgyzstan.jpg",
 "Burana Tower":"Burana Tower, Kyrgyzstan.jpg","Black pepper":"Black pepper vine, da Coleção Brasiliana Iconográfica.jpg",
 "Chinese blue-and-white porcelain":"Yuan Underglaze Blue Jingdezhen Porcelain.jpg","A replica of the Santa María":"Santa Maria replica ship.jpg",
 "A tanker in the Strait of Hormuz":"Tanker in the Strait of Hormuz.jpg","Ukraine’s steppe":"Steppe grassland in Ukraine.jpg",
 "Students in Bamyan today":"Afghan students in Bamyan.jpg","Baghdad at sunset":"Sunset in Baghdad, Iraq.jpg",
 "The steppe near Astana":"Astana-steppe-7748.jpg","Ships in the Malacca Strait":"Ships in the Malacca Strait.jpg"};
const PHOTOS=window.GF_BSILKROADS_PHOTOS||[];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
const findP=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d)||PHOTOS.find(x=>x.f===f)||null}catch(e){return null}};
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St){const want=CARD[St.title];if(want){const p=findP(want);if(p)return p}}}catch(e){}return _pf.apply(this,arguments)}}
try{window.PS_PHOTO_CAP=window.PS_PHOTO_CAP||{};for(const t in CAP)if(!PS_PHOTO_CAP[ID+"|"+t])PS_PHOTO_CAP[ID+"|"+t]=CAP[t]}catch(e){}
try{if(typeof GF_SQ_FILE!=="undefined")for(const k in PIN)if(!GF_SQ_FILE[k])GF_SQ_FILE[k]=PIN[k]}catch(e){}
/* photo pins (never the stop's own card photo again): each stop's pins are registered just before it draws, so the shared pruning never drops them */
const KEEP=new Map();STEPS.forEach(St=>{St.phPins=(St.phPins||[]).filter(q=>PIN[q.label]&&PIN[q.label]!==CARD[St.title]);KEEP.set(St,St.phPins.map(q=>Object.assign({},q)))});
function prep(St){try{const K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 const labs=new Set(K.map(q=>q.label));if(St._restored)St._restored=St._restored.filter(r=>!labs.has(r[1]));if(St.pins)St.pins=St.pins.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));if(St._pins0)St._pins0=St._pins0.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));St._sqPruned=-1;return true}}catch(e){console.error(e)}}
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* cover for the Guided tours page card */
try{if(typeof TOUR_THUMBS!=="undefined"){const C="Caravane Marco Polo.jpg";
 const set=()=>{if(TOUR_THUMBS[ID])return;const p=findP(C);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[ID]=p.d};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
