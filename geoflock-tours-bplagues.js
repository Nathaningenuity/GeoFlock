/* GeoFlock: a Mapped books tour.
   bplagues  "Plagues and Peoples"   William H. McNeill, 1976
   Each stop shows one of the book's claims on the map. McNeill's ideas are summarised in our own words and presented as his
   views; where later research (ancient DNA above all) has changed the picture, the card says so in a line. No book covers
   or long quotes.
   The tour runs on the Relief map. Stops about a past year lay that year’s states over it with gfHistYear
   (geoflock-booktours-relief.js) instead of mode:"history", which would turn the whole tour into a History-map tour
   (geoflock-tourhist.js); others lay one empire (gfEmpire) or the climate zones (gfClimate) over it (geoflock-tourover.js).
   Disease circles use lines {circle,km}; the spread of plague, cholera and ships along routes uses the shared walkers
   (window.gfWalkers, geoflock-walkers.js), which move along the stop's "flow" lines; diagrams in the card come from the
   shared library (PS_DIAG: deadly, hearths, silkroad, panama, dtm); the ruler (gfRuler).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BPLAGUES_PHOTOS.
   WANT_PHOTOS: [
    ["Kaffa (Feodosia) Genoese fortress.jpg","From Caffa to Europe, 1346–1351"],
    ["Lazzaretto Vecchio Venezia.jpg","Forty days: the first quarantines"],
    ["Yersinia pestis.jpg","The third pandemic"],
    ["John Snow memorial and pub.jpg","Cholera follows the pilgrims and the armies"],
    ["Ali Maow Maalin.jpg","The end of smallpox"]]
   (Commons names not checked: Wikimedia was rate-limiting.) */
window.GF_BPLAGUES_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bplagues:"#8f5e4a"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* =====================================================================================================
   Plagues and Peoples (William H. McNeill, 1976)
   ===================================================================================================== */
const PLAG=[
S({title:"Plagues and Peoples",view:W,globe:[40,25,1],
 phPins:[ph([28.98,41.01],"Hagia Sophia, Constantinople"),ph([-99.13,19.43],"A model of Tenochtitlan"),ph([-1.35,5.08],"Elmina Castle"),ph([83.01,25.31],"The Ganges at Varanasi"),ph([-96.78,39.07],"Camp Funston, 1918"),ph([18.11,42.64],"The walls of Dubrovnik"),ph([114.17,22.28],"Hong Kong harbour")],
 stat:"William McNeill’s 1976 book retells world history as a contest between people and their germs",
 body:"McNeill, a historian at the University of Chicago, argues that epidemics are not random disasters on the edge of history. They decided wars, emptied continents, and shaped where empires could and could not grow. This tour follows his story from Africa to the age of vaccines.",
 more:"The book was one of the first to put disease at the centre of world history, and it inspired a whole field. Some of its guesses, especially about where plagues began, have since been tested with DNA from ancient skeletons: the card says where."}),
S({title:"Born among parasites",view:[-26,-36,62,24],globe:[22,-4,1.5],card:"left",gfClimate:{alpha:.45,box:[-20,-36,58,24]},
 pins:[[[35.35,-2.99],"Olduvai Gorge: early humans","point"],[[22,3],"The tsetse belt: sleeping sickness","point"],[[2,8],"Malaria at its worst","point"]],
 iconPins:[ic([35.35,-2.99],"person")],
 phPins:[ph([34.83,-2.33],"The Serengeti")],
 stat:"McNeill argues that our ancestors evolved in tropical Africa alongside a crowd of parasites that evolved with them",
 body:"The colours are today’s climates: the warm, wet tropics (blue) hold the most kinds of parasite. McNeill suggests that early humans lived in a rough balance with malaria, sleeping sickness and worms, which kept their numbers down. Leaving the tropics for cooler lands meant leaving many of these enemies behind.",
 more:"He calls germs ‘microparasites’, living off us from inside. The card’s chart shows that the mosquito, carrier of malaria, still kills more people than any other animal."}),
S({title:"Crowds, farms and new diseases",view:[16,22,62,44],globe:[42,33,3],card:"left",hi:["iq"],hiSoft:["sy","tr","ir"],on:["rivers"],
 pins:[[[45.64,31.32],"Uruk","point"],[[35.44,31.87],"Jericho","point"],[[32.83,37.67],"Çatalhöyük","point"],[[44.42,32.54],"Babylon","point"]],
 iconPins:[ic([40,35.6],"wheat"),ic([45.64,31.32],"temple")],
 phPins:[ph([45.64,31.32],"Uruk’s ziggurat")],
 stat:"Farming packed people into villages and cities, next to their animals and their own waste",
 body:"McNeill argues that the first cities of Mesopotamia were perfect breeding grounds for new diseases, many caught from cattle, sheep and pigs. Measles, he notes, needs a crowd of several hundred thousand people to keep going; below that it burns out. Only cities could feed it.",
 more:"He adds a second kind of parasite: ‘macroparasites’, the rulers, soldiers and tax collectors who lived off what farmers grew. Germs and governments, in his story, both learned not to kill their hosts too fast."}),
S({title:"Four pools of disease",view:[-22,0,135,56],globe:[60,32,1.3],card:"left",
 lines:[{circle:[13,41],km:950,kind:"circle"},{circle:[44,33],km:900,kind:"circle"},{circle:[81,25],km:1000,kind:"circle"},{circle:[113,34],km:1000,kind:"circle"}],
 pins:[[[13,41],"The Mediterranean","point"],[[44,33],"The Middle East","point"],[[81,25],"India","point"],[[113,34],"China","point"]],
 phPins:[ph([83.01,25.31],"The Ganges at Varanasi")],
 stat:"By about 500 BC, McNeill sees four great ‘civilised disease pools’ across Eurasia",
 body:"Each of these crowded regions (circled) had its own mix of germs, which its people had slowly learned to live with. Children caught them and most survived, so they were childhood diseases. Contact between the pools was rare, so each was a danger to the others.",
 more:"McNeill describes this balance as dangerous: when travellers or armies linked two pools, a disease that was mild at home could be deadly to people who had never met it."}),
S({title:"The pools meet: Rome and Han China",view:[-12,4,128,52],globe:[60,32,1.3],card:"left",gfEmpire:[{y:150,gk:"rom",name:"Roman Empire",at:[14,47.5]},{y:150,gk:"chn",name:"Han China",at:[110,37]}],
 lines:[{coords:[[112.45,34.62],[103.83,36.06],[94.66,40.14],[75.99,39.47],[62.19,37.66],[44.58,33.09],[36.16,36.2],[12.5,41.9]],kind:"flow"},{coords:[[113.26,23.13],[105,9],[80,6.5],[60,13],[43.3,12.6],[34,27],[29.9,31.2]],kind:"flow"}],
 pins:[[[12.5,41.9],"Rome: plague of AD 165","point"],[[112.45,34.62],"Luoyang, the Han capital","point"],[[44.58,33.09],"Ctesiphon","point"]],
 phPins:[ph([12.49,41.89],"The Colosseum, Rome")],
 stat:"Around AD 165 a great plague swept the Roman Empire; China suffered terrible epidemics in the same years",
 body:"By land along the Silk Road and by sea through the Indian Ocean (the arrows), traders now linked the two ends of Eurasia. McNeill argues that this let diseases cross between the pools: the ‘Antonine plague’, possibly smallpox, killed millions of Romans, and both empires weakened over the next century.",
 more:"Roman writers blamed soldiers coming home from Mesopotamia. Historians still argue about what the disease was and how many it killed: estimates range from a few per cent of the empire to a quarter."}),
S({title:"The Plague of Justinian",view:[-8,22,48,50],globe:[22,37,2.4],card:"left",gfEmpire:{y:541,gk:"byz",name:"Eastern Roman Empire",at:[33,38.5]},
 lines:[{coords:[[32.55,31.04],[29.9,31.2],[27,34.5],[26.2,39.2],[28.98,41.01]],kind:"flow"},{coords:[[28.98,41.01],[23,37],[18,38.5],[15.55,38.19],[12.5,41.9]],kind:"flow"},{coords:[[15.55,38.19],[9,40.5],[5.37,43.3]],kind:"flow"}],
 pins:[[[32.55,31.04],"Pelusium, 541","point"],[[28.98,41.01],"Constantinople, 542","point"],[[5.37,43.3],"Marseille","point"]],
 phPins:[ph([28.98,41.01],"Hagia Sophia, Constantinople")],
 stat:"In 541 bubonic plague appeared at Pelusium in Egypt; the next spring it struck Constantinople",
 body:"The plague came by ship, with rats and their fleas, and followed the trade routes round the Mediterranean (the arrows). McNeill argues that it wrecked Emperor Justinian’s dream of rebuilding the Roman Empire, and that later outbreaks weakened both Byzantium and Persia just before the Arab conquests.",
 more:"McNeill could only guess that this was bubonic plague. DNA from 6th-century graves in Germany and elsewhere has since confirmed it: the bacterium Yersinia pestis. Justinian himself caught it and survived."}),
S({title:"The Mongols open the steppe",view:[-5,14,122,58],globe:[85,40,1.5],card:"left",gfHistYear:{y:1279,focus:"mon",labels:[{gk:"mon",name:"Mongol khanates",at:[95,48]}]},
 lines:[{coords:[[100.2,25.6],[102,32],[104,38],[106.9,47.9]],kind:"dash"},{coords:[[74.6,42.8],[69,43.5],[60,45.5],[51.5,46.7],[47.1,46.9]],kind:"dash"}],
 pins:[[[100.2,25.6],"Yunnan: McNeill’s guess","point"],[[74.6,42.8],"Chüy valley: graves of 1338–39","point"],[[47.1,46.9],"Sarai, the Golden Horde","point"],[[102.83,47.2],"Karakorum","point"]],
 phPins:[ph([75.25,42.75],"The Burana Tower, Chüy valley"),ph([77.3,42.4],"Lake Issyk-Kul")],
 stat:"In 1279 the Mongol Empire stretched from Korea to Hungary, and caravans crossed the steppe in safety",
 body:"The shading shows the states of 1279. McNeill’s boldest guess was that Mongol armies, invading Yunnan in the 1250s, picked up plague from wild rodents there and carried it north to the burrowing animals of the steppe (dashed). From there, he argues, it spread along the Mongol roads.",
 more:"Ancient DNA tells a different story: in 2022, plague DNA was found in graves dated 1338–39 near Lake Issyk-Kul in Kyrgyzstan, and the strain sits at the root of the Black Death’s family tree. The steppe idea holds, but the Yunnan route does not."}),
S({title:"From Caffa to Europe, 1346–1351",view:[-18,28,52,64],globe:[16,46,2],card:"left",
 lines:[{coords:[[35.38,45.03],[32,43.5],[28.98,41.01]],kind:"flow"},{coords:[[28.98,41.01],[25.5,38.5],[22,36.3],[15.55,38.19]],kind:"flow"},{coords:[[15.55,38.19],[10.5,40.5],[8.4,42.6],[5.37,43.3]],kind:"flow"},{coords:[[5.37,43.3],[4.8,45.76],[2.35,48.86],[-0.12,51.5]],kind:"flow"},{coords:[[-0.12,51.5],[2.5,55],[5.32,60.39]],kind:"flow"},{coords:[[15.55,38.19],[12.3,41],[11.25,43.77]],kind:"flow"},{coords:[[28.98,41.01],[29.9,31.2],[31.24,30.04]],kind:"flow"},{coords:[[11.25,43.77],[11.5,48.1],[13.4,52.5],[24,54.5],[37.62,55.75]],kind:"flow"}],
 pins:[[[35.38,45.03],"Caffa, 1346","point"],[[15.55,38.19],"Messina, October 1347","point"],[[11.25,43.77],"Florence, 1348","point"],[[-0.12,51.5],"London, 1348","point"],[[5.32,60.39],"Bergen, 1349","point"],[[37.62,55.75],"Moscow, 1352","point"],[[31.24,30.04],"Cairo, 1348","point"]],
 phPins:[ph([11.26,43.77],"Florence’s cathedral")],
 stat:"The Black Death killed perhaps a third to a half of the people of Europe and the Middle East",
 body:"In 1346 a Mongol army besieging the Genoese port of Caffa, in Crimea, was struck by plague. Genoese galleys carried it on to Constantinople, Messina and Marseille (follow the rats along the arrows). By 1351 it had reached Scandinavia and Russia. McNeill sees it as the moment the steppe’s disease reached the crowded cities of the west.",
 more:"A chronicler, Gabriele de’ Mussis, wrote that the Mongols threw corpses over Caffa’s walls. Many historians doubt that this is how the plague got out: rats and fleas in the grain ships are enough. Cairo, Damascus and the Islamic world suffered as badly as Europe."}),
S({title:"Forty days: the first quarantines",view:[0,36,32,49],globe:[15,43,3.5],card:"left",gfRuler:{a:[18.09,42.64],b:[12.34,45.43]},
 pins:[[[18.09,42.64],"Ragusa (Dubrovnik): 30 days, 1377","point"],[[12.35,45.39],"Venice’s lazaretto, 1423","point"],[[5.37,43.3],"Marseille: the last great outbreak, 1720","point"]],
 iconPins:[ic([18.09,42.64],"anchor"),ic([12.35,45.39],"anchor")],
 phPins:[ph([12.34,45.44],"Venice")],
 stat:"In 1377 Ragusa, today’s Dubrovnik, made ships from plague areas wait 30 days before landing",
 body:"Venice later stretched the wait to 40 days, quaranta giorni, which gave us the word quarantine, and built an island hospital, the lazaretto. McNeill argues that such rules, enforced by city governments, slowly pushed plague out of western Europe, even though no one yet knew about germs.",
 more:"The last great plague of western Europe struck Marseille in 1720, when a ship’s cargo was let in too soon. Plague kept returning to the Ottoman lands and Russia for another century."}),
S({title:"Smallpox conquers Mexico",view:[-118,-2,-2,42],globe:[-60,22,1.5],card:"left",gfHistYear:{y:1519,labels:[{gk:"aztec",name:"Aztec Empire"},{gk:"inca",name:"Inca Empire"}]},
 lines:[{coords:[[-5.99,37.39],[-17,28.5],[-40,22],[-60,19],[-69.9,18.47]],kind:"flow"},{coords:[[-69.9,18.47],[-80,20.5],[-90,21],[-96.13,19.2]],kind:"flow"}],
 pins:[[[-69.9,18.47],"Hispaniola: smallpox, 1518","point"],[[-96.13,19.2],"Veracruz, 1520","point"],[[-99.13,19.43],"Tenochtitlan","point"],[[-5.99,37.39],"Seville","point"]],
 phPins:[ph([-99.13,19.43],"A model of Tenochtitlan")],
 stat:"In 1520 smallpox reached Mexico; within a year it had killed perhaps a third of the Aztec capital",
 body:"The shading shows the Aztec and Inca empires on the eve of conquest. McNeill argues that Cortés won with a few hundred men because smallpox fought on his side: it killed the emperor Cuitláhuac and countless warriors during the siege of Tenochtitlan, while the Spaniards, who had had it as children, stayed well.",
 more:"Measles, influenza and typhus followed. Estimates of how many people lived in the Americas in 1492, and how many died, still vary enormously, but most historians agree the losses were among the greatest in history."}),
S({title:"Fevers that guarded Africa",view:[-100,-10,20,35],globe:[-40,12,1.4],card:"left",
 lines:[{coords:[[-1.35,5.08],[-15,5],[-35,8],[-55,13],[-72.2,19.76]],kind:"flow"},{coords:[[-17.4,14.67],[-35,16],[-55,17],[-72.2,19.76]],kind:"flow"}],
 pins:[[[-1.35,5.08],"Elmina","point"],[[-17.4,14.67],"Gorée","point"],[[-72.2,19.76],"Saint-Domingue (Haiti), 1802","point"]],
 iconPins:[ic([-72.2,19.76],"swords")],
 phPins:[ph([-17.4,14.67],"The House of Slaves, Gorée"),ph([-1.24,5.1],"Cape Coast Castle")],
 stat:"For centuries malaria and yellow fever killed most Europeans who went inland in West Africa",
 body:"McNeill argues that tropical fevers kept Europeans in forts on the coast, like Elmina, and that slave ships carried the same diseases, and the mosquito Aedes aegypti, across to the Caribbean (the arrows). In 1802 yellow fever destroyed the army Napoleon sent to retake Saint-Domingue, helping Haiti win its independence.",
 more:"West Africans who had survived childhood infections had some resistance; newcomers had none. Only quinine, used widely from the 1850s, opened Africa’s interior to European armies."}),
S({title:"Panama: the mosquito wins, then loses",view:[-86,4,-74,14],globe:[-79.6,9,6],card:"left",hi:["pa"],
 lines:[{coords:[[-79.92,9.36],[-79.75,9.2],[-79.65,9.05],[-79.55,8.95]],kind:"red"}],
 pins:[[[-79.65,9.05],"Culebra Cut","point"],[[-79.92,9.36],"Colón","point"],[[-79.52,8.98],"Panama City","point"]],
 phPins:[ph([-79.65,9.05],"Digging the Culebra Cut, 1904")],
 stat:"France’s attempt to dig a canal at Panama in the 1880s cost some 22,000 lives, most to yellow fever and malaria",
 body:"In 1900 Walter Reed’s team in Havana proved that mosquitoes spread yellow fever. When the USA took over the canal in 1904, William Gorgas drained pools, screened windows and fumigated houses. Yellow fever vanished from the Canal Zone, and the canal (red) opened in 1914. McNeill presents this as a turning point: knowing how a disease spreads let people beat it.",
 more:"The card’s diagram shows why the canal mattered: it cut the sea route from New York to San Francisco by more than half."}),
S({title:"Cholera follows the pilgrims and the armies",view:[-14,8,100,60],globe:[45,33,1.3],card:"left",
 lines:[{coords:[[89.21,23.17],[83,25.3],[78.16,29.95]],kind:"flow"},{coords:[[89.21,23.17],[80,15],[72.88,19.08],[58.4,23.6],[47.8,30.5]],kind:"flow"},{coords:[[47.8,30.5],[48.03,46.35],[37.62,55.75],[21,52.2],[13.4,52.5],[-0.12,51.5]],kind:"flow"},{coords:[[72.88,19.08],[55,15],[39.83,21.42]],kind:"flow"}],
 pins:[[[89.21,23.17],"Jessore, Bengal, 1817","point"],[[78.16,29.95],"Haridwar: the Kumbh Mela","point"],[[39.83,21.42],"Mecca: the hajj","point"],[[37.62,55.75],"Moscow, 1830","point"],[[-0.13,51.51],"London: Broad Street, 1854","point"]],
 phPins:[ph([83.01,25.31],"The Ganges at Varanasi")],
 stat:"Cholera broke out of its home in the Ganges delta in 1817 and reached Europe within 15 years",
 body:"Cholera spreads through dirty water. McNeill shows it riding the new connections of the 19th century: British troops, merchant ships, and pilgrims at the great gatherings of Haridwar and Mecca (the arrows). It reached Moscow in 1830 and London in 1832.",
 more:"In 1854 the doctor John Snow traced a London outbreak to a single water pump on Broad Street. McNeill argues that fear of cholera, more than any other disease, drove cities to build clean water supplies and sewers."}),
S({title:"The third pandemic",view:[-140,-42,165,52],globe:[90,15,1.1],card:"left",
 lines:[{coords:[[100.2,25.6],[108.3,22.8],[113.26,23.13],[114.17,22.28]],kind:"flow"},{coords:[[114.17,22.28],[104,2],[80,5.5],[72.88,18.95]],kind:"flow"},{coords:[[114.17,22.28],[140,30],[180,35],[-122.42,37.77]],kind:"flow"},{coords:[[114.17,22.28],[118,5],[130,-12],[151.2,-33.86]],kind:"flow"},{coords:[[72.88,18.95],[60,0],[40,-25],[18.42,-33.92]],kind:"flow"}],
 pins:[[[100.2,25.6],"Yunnan, 1850s","point"],[[114.17,22.28],"Hong Kong, 1894","point"],[[72.88,18.95],"Bombay, 1896","point"],[[-122.42,37.77],"San Francisco, 1900","point"],[[151.2,-33.86],"Sydney, 1900","point"],[[18.42,-33.92],"Cape Town, 1901","point"]],
 phPins:[ph([72.83,18.92],"Bombay’s waterfront")],
 stat:"Plague left Yunnan in the 1850s and, aboard steamships, reached every inhabited continent by 1900",
 body:"In Hong Kong in 1894, Alexandre Yersin found the bacterium that causes plague, later named after him. Steamships carried infected rats to ports round the world (follow them along the arrows). India was worst hit: some 12 million people died there.",
 more:"McNeill tells how he learned that plague can live for ever in wild rodents: it settled into ground squirrels and prairie dogs in the American West, where it still infects a few people each year. A pneumonic outbreak in Manchuria in 1910–11 began among marmot hunters."}),
S({title:"The influenza of 1918",view:[-118,-2,28,60],globe:[-40,25,1.2],card:"left",
 lines:[{coords:[[-96.78,39.07],[-85,40],[-74,40.7]],kind:"flow"},{coords:[[-74,40.7],[-40,45],[-4.49,48.39]],kind:"flow"},{coords:[[-4.49,48.39],[-15,25],[-13.23,8.48]],kind:"flow"},{coords:[[-4.49,48.39],[-30,45],[-71.06,42.36]],kind:"flow"}],
 pins:[[[-96.78,39.07],"Camp Funston, Kansas, March 1918","point"],[[-4.49,48.39],"Brest, France","point"],[[-13.23,8.48],"Freetown","point"],[[-71.06,42.36],"Boston","point"]],
 stat:"The 1918 flu killed tens of millions of people, more than the First World War that spread it",
 body:"One of the first recorded outbreaks was at an army camp in Kansas. Troopships carried the virus to France, and a deadlier second wave broke out almost at once in Brest, Freetown and Boston (the arrows). McNeill notes how quickly it went round a world tied together by railways and steamships.",
 more:"Where it began is still debated: Kansas, the British army camps in France, and China have all been suggested. Western Samoa lost about a fifth of its people; American Samoa, next door, closed its port and lost none."}),
S({title:"The end of smallpox",view:[-30,-12,60,58],globe:[20,25,1.4],card:"left",hi:["so"],
 lines:[{coords:[[-2.46,51.69],[10,40],[30,20],[44.77,1.72]],kind:"dash"}],
 pins:[[[-2.46,51.69],"Berkeley: Jenner’s vaccine, 1796","point"],[[44.77,1.72],"Merca: the last natural case, 1977","point"],[[6.14,46.2],"Geneva: the WHO","point"]],
 phPins:[ph([-2.46,51.69],"A cartoon of the cowpox vaccine, 1802")],
 stat:"In 1977 a hospital cook in Merca, Somalia, became the last person to catch smallpox in the wild",
 body:"Edward Jenner showed in 1796 that cowpox could protect people against smallpox. A worldwide campaign led by the World Health Organization tracked down the last cases, village by village; smallpox was declared gone in 1980. The card’s chart shows what falling death rates did to population growth.",
 more:"McNeill’s book appeared in 1976, while the campaign was still running. The cook, Ali Maow Maalin, recovered and later worked to end polio. Smallpox is still the only human disease ever wiped out."}),
S({title:"The contest goes on",view:[-20,-25,130,45],globe:[60,10,1.2],card:"left",hi:["cd"],
 pins:[[[15.3,-4.3],"Kinshasa: HIV spreads, 1920s","point"],[[22.42,2.82],"Yambuku: Ebola, 1976","point"],[[113.26,23.13],"Guangdong: SARS, 2002","point"],[[114.3,30.59],"Wuhan: Covid-19, 2019","point"]],
 iconPins:[ic([15.3,-4.3],"person"),ic([114.3,30.59],"person")],
 phPins:[ph([15.32,-4.3],"The Congo at Kinshasa")],
 stat:"McNeill warned that new diseases would keep jumping from animals into a crowded, connected world",
 body:"He was right. Ebola was first identified in 1976, the year the book came out. HIV, which crossed from chimpanzees, spread from Kinshasa along river boats and railways from the 1920s. SARS and Covid-19 both began in China and travelled by plane.",
 more:"In later editions McNeill added a note on AIDS. His view was that people and germs will never reach a final peace: every change in how we live, travel and farm opens new doors to infection."}),
S({title:"Now explore",view:W,globe:[40,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch to the History map and set the year to 1300, then 1400: find the Mongol khanates that carried plague west. Turn on Connections to see today’s shipping lanes, the routes rats and fleas once followed. Then try Guns, Germs, and Steel, which builds on McNeill’s idea of germs from the farmyard."})];

const TOURS={
 bplagues:{name:"Plagues and Peoples",short:"Plagues and Peoples",hint:"William H. McNeill’s 1976 book, on the map: disease pools, the Black Death, smallpox in Mexico, cholera, the 1918 flu and the end of smallpox",steps:PLAG}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"1279/mon") is set up as if the tour ran on that map */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- diagrams in the card (shared library) ---------- */
try{if(typeof PS_DIAG!=="undefined"&&typeof DG!=="undefined"){const D={"bplagues|Born among parasites":"deadly","bplagues|Crowds, farms and new diseases":"hearths","bplagues|The pools meet: Rome and Han China":"silkroad","bplagues|Panama: the mosquito wins, then loses":"panama","bplagues|The end of smallpox":"dtm"};for(const k in D)if(DG[D[k]])PS_DIAG[k]=D[k]}}catch(e){}

/* ---------- travellers along the stops’ flow lines (geoflock-walkers.js) ---------- */
const WALK={
 "bplagues|The Plague of Justinian":{emoji:"🐀",name:"Rats and their fleas, aboard the grain ships",size:22,per:2},
 "bplagues|From Caffa to Europe, 1346–1351":{emoji:"🐀",name:"Plague on the move",size:22,per:1},
 "bplagues|Smallpox conquers Mexico":{emoji:"⛵",name:"Spanish ships",size:26,per:2,float:1},
 "bplagues|Fevers that guarded Africa":{emoji:"⛵",name:"Slave ships, carrying mosquitoes and fevers",size:24,per:2,float:1},
 "bplagues|Cholera follows the pilgrims and the armies":{emoji:"💧",name:"Cholera on the move",size:20,per:2},
 "bplagues|The third pandemic":{emoji:"🐀",name:"Rats aboard steamships",size:22,per:2},
 "bplagues|The influenza of 1918":{emoji:"🚢",name:"Troopships",size:24,per:2,float:1}};
const addW=()=>{try{if(window.gfWalkers)for(const k in WALK)if(!gfWalkers[k])gfWalkers[k]=WALK[k]}catch(e){}};addW();addEventListener("load",addW);

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bplagues={mid:[
 {at:"The Plague of Justinian",st:"The Plague of Justinian",q:"Where did the Plague of Justinian first appear, in 541?",o:["Rome","Pelusium, Egypt","Athens","Antioch"],a:1,why:"It reached Constantinople the next spring.",kc:"eg"},
 {at:"From Caffa to Europe, 1346–1351",st:"From Caffa to Europe, 1346–1351",q:"Caffa, where the Black Death reached Genoese ships, is in which region?",o:["Sicily","Crimea","Cyprus","Anatolia"],a:1,why:"Today’s Feodosia, on the Black Sea.",kc:"ua"},
 {at:"Forty days: the first quarantines",st:"Forty days: the first quarantines",q:"Which city first made ships wait before landing, in 1377?",o:["Venice","Ragusa (Dubrovnik)","Genoa","Marseille"],a:1,why:"Thirty days at first; Venice later made it forty.",kc:"hr"}],
 recap:[
 {q:"Which disease helped Cortés take the Aztec capital?",o:["Plague","Smallpox","Cholera","Malaria"],a:1,why:"It killed the emperor Cuitláhuac in 1520.",st:"Smallpox conquers Mexico",kc:"mx"},
 {q:"Where did cholera break out of its old home in 1817?",o:["The Nile delta","Bengal","Java","Yunnan"],a:1,why:"From the Ganges delta it spread along trade and army routes.",st:"Cholera follows the pilgrims and the armies",kc:"bd"},
 {q:"In which country was the last natural case of smallpox, in 1977?",o:["India","Bangladesh","Somalia","Ethiopia"],a:2,why:"A hospital cook in Merca, who recovered.",st:"The end of smallpox",kc:"so"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bplagues|Plagues and Peoples":"The Triumph of Death by Pieter Bruegel the Elder.jpg","bplagues|Born among parasites":"Serengeti wildebeest migration JF.jpg",
 "bplagues|Crowds, farms and new diseases":"Uruk ziggurat (2).jpg","bplagues|Four pools of disease":"Ganga aarti at Varanasi.jpg",
 "bplagues|The pools meet: Rome and Han China":"Kashgar Old Town.jpg","bplagues|The Plague of Justinian":"Hagia Sophia Mars 2013.jpg",
 "bplagues|The Mongols open the steppe":"Lake Issyk-Kul, Kyrgyzstan.jpg","bplagues|From Caffa to Europe, 1346–1351":"The Triumph of Death by Pieter Bruegel the Elder.jpg",
 "bplagues|Forty days: the first quarantines":"Walls of Dubrovnik-3.jpg","bplagues|Smallpox conquers Mexico":"Model of Tenochtitlan-2.jpg",
 "bplagues|Fevers that guarded Africa":"Elmina Castle - Ghana.jpg","bplagues|Panama: the mosquito wins, then loses":"Aktie Canal de Panama 1880.jpg",
 "bplagues|Cholera follows the pilgrims and the armies":"Tower of London from the Shard (8515883950).jpg","bplagues|The third pandemic":"Hong Kong Harbour Night 2019-06-11.jpg",
 "bplagues|The influenza of 1918":"Emergency hospital during Influenza epidemic, Camp Funston, Kansas - NCP 1603.jpg","bplagues|The end of smallpox":"Mothers and babies waiting for vaccination.jpg",
 "bplagues|The contest goes on":"Congo River from Kinshasa in Democratic Republic of the Congo (DRC).jpg","bplagues|Now explore":"Sultanahmet ferry on the Bosphorus in Istanbul, Turkey 001.jpg"};
const PIN={
 "Hagia Sophia, Constantinople":"Hagia Sophia Mars 2013.jpg","A model of Tenochtitlan":"Model of Tenochtitlan-2.jpg","Elmina Castle":"Elmina Castle - Ghana.jpg",
 "The Ganges at Varanasi":"Ganga aarti at Varanasi.jpg","Camp Funston, 1918":"Emergency hospital during Influenza epidemic, Camp Funston, Kansas - NCP 1603.jpg",
 "The walls of Dubrovnik":"Walls of Dubrovnik-3.jpg","Hong Kong harbour":"Hong Kong Harbour Night 2019-06-11.jpg","The Serengeti":"Serengeti wildebeest migration JF.jpg",
 "Uruk’s ziggurat":"Uruk ziggurat (2).jpg","The Colosseum, Rome":"Colosseum in Rome-April 2007-1- copie 2B.jpg",
 "The Burana Tower, Chüy valley":"Burana Tower, Kyrgyzstan.jpg","Lake Issyk-Kul":"Lake Issyk-Kul, Kyrgyzstan.jpg","Florence’s cathedral":"Florence Duomo from Michelangelo hill.jpg",
 "Venice":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg","The House of Slaves, Gorée":"A balcony of the House of Slaves in Gorée.jpg",
 "Cape Coast Castle":"Cape Coast Castle.jpg","Digging the Culebra Cut, 1904":"Labourers at work on the panama canal at Culebra Cut 1904.jpg",
"Bombay’s waterfront":"Mumbai 03-2016 31 Gateway of India.jpg",
 "A cartoon of the cowpox vaccine, 1802":"The cow pock.jpg","The Congo at Kinshasa":"A view of Congo River from Kinshasa, Democratic Republic of the Congo (DRC).jpg"};
/* new photos (GF_BPLAGUES_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BPLAGUES_PHOTOS||[];
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
/* cover for the Guided tours page card */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bplagues:"The Triumph of Death by Pieter Bruegel the Elder.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
