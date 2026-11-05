/* GeoFlock: a Mapped books tour: Voltaire’s “Candide” (1759), followed on the map.
   bcandide   "Candide, or Optimism"   Voltaire, 1759
   The novel’s places, in the order Candide reaches them (Westphalia, Holland, Lisbon, Cádiz, Buenos Aires, Paraguay,
   El Dorado, Suriname, Bordeaux and Paris, Portsmouth, Venice, Constantinople), each set beside the real events and
   places Voltaire was mocking: the Seven Years’ War, the Lisbon earthquake of 1755, the Jesuit missions, the El Dorado
   legend, slavery on Suriname’s sugar plantations, the execution of Admiral Byng. The novel is summarised in our own
   words; Voltaire’s views are presented as his, and the cards say where scholars read the book differently or where the
   fiction departs from history. No long quotes, no book covers.
   Built like geoflock-tours-books1.js (same step helper, fields, photo maps and Tours-page cover). Stops about a past year
   lay that year’s states over the Relief map with gfHistYear (geoflock-booktours-relief.js) instead of mode:"history",
   which would turn the whole tour into a History-map tour (geoflock-tourhist.js). Ships and travellers move along the
   stops’ flow lines (window.gfWalkers, geoflock-walkers.js); the ruler (gfRuler) and the shared layers (on:[…]) as usual.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry).
   WANT_PHOTOS: [
    ["Execution of Admiral John Byng 1757.jpg (or any print of Byng’s execution)","Portsmouth: to encourage the others"],
    ["Château de Voltaire, Ferney-Voltaire (any photo of the château)","Voltaire’s own garden"],
    ["1755 Lisbon earthquake.jpg (the copper engraving of the city in ruins and the tsunami)","Lisbon, 1 November 1755"],
    ["Lake Guatavita (any photo of the lake)","The golden land"],
    ["Teatro La Fenice or Carnival of Venice (any photo)","Six kings at the Carnival"] ] */
window.GF_BCANDIDE_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const ID="bcandide",COL="#9b6a4a",W=[-100,-45,60,62];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* places, [lon, lat] */
const P={westph:[7.9,51.9],munster:[7.63,51.96],hanover:[9.73,52.37],amst:[4.9,52.37],lisbon:[-9.14,38.71],coimbra:[-8.43,40.21],cadiz:[-6.29,36.53],
 ba:[-58.38,-34.6],asun:[-57.58,-25.28],trin:[-55.71,-27.13],sanig:[-55.53,-27.26],smig:[-54.55,-28.55],para:[-55.17,5.83],bord:[-0.58,44.84],paris:[2.35,48.86],
 ports:[-1.1,50.8],mahon:[4.27,39.89],venice:[12.34,45.44],istan:[28.97,41.01],marm:[28.2,40.75],geneva:[6.14,46.2],ferney:[6.11,46.26]};
/* Candide’s whole journey, for the overview */
const ROUTE=[P.westph,P.amst,[3,51.3],[-5,49],[-9.5,44],P.lisbon,P.cadiz,[-15,28],[-30,10],[-38,-12],[-50,-30],P.ba,P.asun,P.trin,[-62,-18],[-70,-10],[-66,-2],[-58,3],P.para,[-40,20],[-20,38],[-5,45.5],P.bord,P.paris,[1.5,50],P.ports,[-5,48],[-10,40],[-8,36.3],[0,37.5],[12,38],[17,40.5],P.venice,[16,42],[19.5,39.5],[23,36.3],[26.3,39.8],P.istan];

const STEPS=[
S({title:"Candide",view:W,globe:[-20,20,1],
 lines:[{coords:ROUTE,kind:"dash"}],
 pins:[[P.westph,"Westphalia","point"],[P.lisbon,"Lisbon","point"],[P.trin,"Paraguay","point"],[P.para,"Suriname","point"],[P.venice,"Venice","point"],[P.istan,"Constantinople","point"]],
 phPins:[ph(P.munster,"Münster’s town hall, Westphalia"),ph([-9.137,38.709],"Rua Augusta Arch, Lisbon"),ph([-55.72,-27.12],"Jesuit mission of Trinidad"),ph([-55.15,5.83],"Fort Zeelandia, Paramaribo"),ph([12.34,45.43],"Venice"),ph([28.98,41.01],"Hagia Sophia")],
 stat:"Voltaire’s short, savage comic novel of 1759 sends its hero round the Atlantic world and back",
 body:"Young Candide is taught that this is ‘the best of all possible worlds’. Then he is thrown out of a German castle, flogged, shipwrecked, robbed and nearly eaten. The dashed line is his journey. At every stop Voltaire tests that cheerful idea against wars, earthquakes, inquisitors and slavery.",
 more:"Voltaire published it anonymously in January 1759, as a translation by a made-up ‘Doctor Ralph’. It was banned in Geneva and Paris, and sold all the faster for it. This tour sets each of the novel’s places beside the real events Voltaire was mocking."}),
S({title:"Westphalia: the best of all possible castles",view:[-2,46,22,56],globe:[8,51,4],card:"left",gfHistYear:{y:1755,focus:"hre",labels:[{gk:"hre",name:"Holy Roman Empire",at:[13.5,49.2]}]},
 pins:[[P.westph,"Westphalia: Baron Thunder-ten-tronckh’s castle (fictional)","point"],[P.hanover,"Hanover: home of Leibniz","point"],[P.munster,"Münster","point"]],
 iconPins:[ic(P.hanover,"book")],
 phPins:[ph([9.74,52.38],"Gottfried Wilhelm Leibniz")],
 stat:"The story starts in a castle that is grand only to its owners, in a small corner of the Holy Roman Empire",
 body:"The coloured patchwork is the Holy Roman Empire in 1755: hundreds of states, big and tiny. Candide’s tutor Pangloss teaches that everything happens for the best. Voltaire is mocking the optimism of the German philosopher Leibniz, who worked for the rulers of Hanover, and of his popularisers.",
 more:"Leibniz argued that God must have chosen the best world possible, evil included. Philosophers point out that Pangloss is a cartoon: Leibniz never said that every single misfortune is good. Voltaire, who travelled through Westphalia in 1750, makes the castle’s pride as small as its corner of the map."}),
S({title:"Bulgars and Abares",view:[-6,44,26,57],globe:[10,51,3.5],card:"left",
 pins:[[[11.9,51.25],"Rossbach: Prussians beat the French, 1757","point"],[[16.77,51.12],"Leuthen: Prussians beat the Austrians, 1757","point"],[[13.06,52.4],"Potsdam: Frederick the Great’s court","point"],[P.paris,"Paris","point"]],
 iconPins:[ic([11.9,51.25],"swords"),ic([16.77,51.12],"swords")],
 lines:[{coords:[[13.06,52.4],[11.9,51.25]],kind:"dash"},{coords:[P.paris,[6,49.5],[9.5,50.5],[11.9,51.25]],kind:"dash"}],
 stat:"Thrown out of the castle, Candide is tricked into the army of the ‘Bulgars’ and marched into a pointless battle",
 body:"Readers have long taken the Bulgars to be Prussians and their enemies, the ‘Abares’, to be the French: the two were fighting the Seven Years’ War (1756–63) while Voltaire wrote. He calls the battle a ‘heroic butchery’ in which both kings give thanks to God. Swords mark real battlefields of 1757.",
 more:"Voltaire knew the Prussian army close up: from 1750 to 1753 he lived at the court of King Frederick the Great at Potsdam, until the two fell out. The novel never names a real battle, so the sites shown here are examples, not the book’s."}),
S({title:"Holland, then a ship for Lisbon",view:[-20,34,12,56],globe:[-4,45,3],card:"left",
 lines:[{coords:[P.amst,[3.5,52],[1.5,51],[-3,49.5],[-6,48.5],[-9.5,44],[-10,40.5],P.lisbon],kind:"flow"}],
 pins:[[P.amst,"Holland","point"],[P.lisbon,"Lisbon","point"]],
 iconPins:[ic([-10.2,40.2],"storm")],
 phPins:[ph([4.9,52.37],"Amsterdam’s canals")],
 stat:"In Holland a kind Anabaptist, Jacques, takes Candide in, then sails with him and Pangloss for Lisbon",
 body:"The Dutch Republic was Europe’s great trading nation and its freest printing house; Voltaire had many of his own books printed there. Jacques the Anabaptist is one of the few truly good people in the novel. Off Lisbon a storm wrecks their ship, and Jacques drowns saving the sailor who had just pushed him.",
 more:"Pangloss stops Candide from diving in after him, explaining that the harbour of Lisbon was made on purpose for this Anabaptist to drown in. The ship on the map follows their voyage."}),
S({title:"Lisbon, 1 November 1755",view:[-21,31,1,44],globe:[-10,38,4],card:"left",on:["plates"],gfRuler:{a:[-10.8,36.3],b:P.lisbon},
 lines:[{coords:[[-10.8,36.3],P.cadiz],kind:"dash"},{coords:[[-10.8,36.3],[-9.24,32.3]],kind:"dash"},{coords:[[-10.8,36.3],[-16.92,32.65]],kind:"dash"}],
 pins:[[P.lisbon,"Lisbon","point"],[[-10.8,36.3],"Epicentre: probably about here, under the sea","point"],[P.cadiz,"Cádiz: tsunami","point"],[[-9.24,32.3],"Safi, Morocco: tsunami","point"],[[-16.92,32.65],"Madeira: tsunami","point"]],
 iconPins:[ic([-10.8,36.3],"crack"),ic([-9.14,38.71],"flame")],
 phPins:[ph([-9.14,38.71],"Lisbon on the Tagus")],
 stat:"On All Saints’ Day 1755 one of the strongest earthquakes in European history destroyed Lisbon",
 body:"The shaking came mid-morning, with churches full for the holy day. Fires burned for days, and a tsunami swept up the Tagus. Perhaps 30,000 to 50,000 people died in Lisbon alone; estimates vary widely. Candide and Pangloss stagger ashore into the ruins.",
 more:"Seismologists put its size at about magnitude 8.5 to 9 and its source out in the Atlantic, near the boundary of the African and Eurasian plates (shown), but still argue over which fault broke. The disaster shook Europe’s faith that God had ordered everything for the best: Voltaire answered it first in his Poem on the Lisbon Disaster (1756), then in Candide. The arch in the photo crowns the new Lisbon built on a grid after the quake."}),
S({title:"An auto-da-fé to stop the earthquakes",view:[-14,36.3,-3,42.6],globe:[-8.5,39.5,6],card:"left",gfRuler:{a:P.coimbra,b:P.lisbon},
 pins:[[P.lisbon,"Lisbon: the auto-da-fé","point"],[P.coimbra,"Coimbra: its university ‘decides’ in the novel","point"]],
 iconPins:[ic([-9.14,38.71],"flame"),ic([-8.43,40.21],"scroll")],
 stat:"In the novel the wise men of Coimbra decide that burning a few people slowly will prevent further earthquakes",
 body:"So the Inquisition holds an auto-da-fé, a public ceremony of judgement and punishment. Pangloss is hanged for speaking his mind and Candide is flogged; that same day the earth shakes again. Voltaire’s target is a church that answers disaster with cruelty.",
 more:"The Inquisition did hold an auto-da-fé in Lisbon in June 1756. Historians note that most of the condemned were not burned, but the ceremony was real, and so was the debate over whether the earthquake was God’s punishment."}),
S({title:"The old woman’s story",view:[-14,28,44,60],globe:[18,45,2],card:"left",
 lines:[{coords:[[12.89,41.84],[11.5,41],[6,39.5],[0,37.2],[-6.8,34.04],[-5.55,33.9],[3.06,36.75],[10.18,36.8],[13.19,32.89],[20,33],[29.92,31.2],[27.14,38.42],[28.97,41.01],[33,43.5],[39.42,47.11],[37.62,55.75],[24.1,56.95],[12.1,54.09],[11.47,53.9],[12.37,51.34],[9.48,51.31],[5.12,52.09],[4.49,52.16],[4.3,52.08],[4.48,51.92]],kind:"flow"}],
 pins:[[[12.89,41.84],"Palestrina: her mother’s palace","point"],[[-6.8,34.04],"Salé: the pirates’ port","point"],[[3.06,36.75],"Algiers","point"],[[39.42,47.11],"Azov: the siege","point"],[[37.62,55.75],"Moscow","point"],[[4.48,51.92],"Rotterdam","point"]],
 iconPins:[ic([39.42,47.11],"swords"),ic([-6.8,34.04],"ship")],
 phPins:[ph([28.98,41.02],"Istanbul’s Grand Bazaar")],
 stat:"The old woman who rescues Cunégonde has been sold, enslaved and starved from Morocco to Moscow",
 body:"She says she was born a pope’s daughter. Pirates from Salé seized her and took her to Morocco, torn by civil war after the death of its sultan Moulay Ismail in 1727. Then she was sold on through Algiers, Tunis, Tripoli, Alexandria, Smyrna and Constantinople, besieged at Azov, and passed through Russia and northern Europe to Holland. Follow her on the map.",
 more:"Moroccan corsairs, the slave markets of the Mediterranean and the Russian sieges of Azov were all real. Her moral is one of the book’s darkest jokes: she has wanted to kill herself a hundred times, and still loves life."}),
S({title:"From Cádiz to Buenos Aires",view:[-72,-40,0,42],globe:[-30,0,1.4],card:"left",gfHistYear:{y:1755,focus:"spa",labels:[{n:"Viceroyalty of Peru",name:"Viceroyalty of Peru",at:[-62,-22]},{n:"Spain",name:"Spain"}]},
 lines:[{coords:[P.cadiz,[-10,33],[-16,28],[-25,15],[-32,2],[-36,-10],[-42,-22],[-50,-31],[-55,-35],P.ba],kind:"flow"}],
 pins:[[P.cadiz,"Cádiz","point"],[P.ba,"Buenos Aires","point"]],
 iconPins:[ic(P.cadiz,"anchor")],
 phPins:[ph([-58.38,-34.6],"Buenos Aires today")],
 stat:"Wanted for murder in Lisbon, Candide sails from Cádiz as a captain sent to fight the Jesuits of Paraguay",
 body:"The coloured lands are Spain’s empire in 1755: the River Plate then belonged to the vast Viceroyalty of Peru. In Buenos Aires a pompous governor with an endless string of names takes a fancy to Cunégonde, and the law catches up with Candide. He flees inland with his clever servant Cacambo.",
 more:"Spain really was sending troops against the missions: under the Treaty of Madrid of 1750 it had swapped seven Jesuit mission towns to Portugal, and Guaraní who refused to leave fought the Guaraní War of 1754–56."}),
S({title:"The Jesuits of Paraguay",view:[-68,-35,-44,-17],globe:[-56,-27,4],card:"left",hi:["py"],hiSoft:["ar","br"],
 pins:[[P.trin,"Trinidad mission","point"],[P.sanig,"San Ignacio Miní","point"],[P.smig,"São Miguel das Missões","point"],[P.asun,"Asunción","point"]],
 iconPins:[ic(P.trin,"cross"),ic(P.sanig,"cross"),ic(P.smig,"cross")],
 phPins:[ph([-57.58,-25.28],"Asunción")],
 stat:"Cacambo, who has worked for the Jesuits, sums up their state: the fathers own everything, the people nothing",
 body:"Jesuits ran some thirty mission towns, or reductions, for the Guaraní people from the early 1600s until Spain expelled the order in 1767; at their peak they held well over 100,000 people. In the novel the mission commander turns out to be Cunégonde’s brother. They quarrel, and Candide runs him through.",
 more:"Historians still argue over the missions: they shielded the Guaraní from slave raiders and forced labour, but under the strict rule of priests. Voltaire himself was not consistent; elsewhere he wrote of them with some admiration. Their red sandstone ruins are World Heritage Sites."}),
S({title:"The golden land",view:[-82,-20,-46,12],globe:[-66,-4,2],card:"left",
 lines:[{coords:[[-70,-12],[-66.5,-6],[-62,-1],[-58,3],P.para],kind:"flow"},{coords:[[-61.7,10.6],[-62.5,8.5],[-64.5,7.6],[-66,6.5]],kind:"dash"}],
 pins:[[[-73.78,4.98],"Lake Guatavita: the gilded king of the legend","point"],[[-63.5,8.1],"Raleigh’s Orinoco, 1595","point"],[[-61.5,3.5],"‘Lake Parima’: on maps until about 1800","point"],[[-71.97,-13.52],"Cusco: the Incas’ old capital","point"],[P.para,"Suriname","point"]],
 iconPins:[ic([-73.78,4.98],"gold"),ic([-70,-12],"gem")],
 phPins:[ph([-66.5,4],"The Orinoco")],
 stat:"In El Dorado, children play with gold nuggets, there are no priests or prisons, and nobody is ever sued",
 body:"Lost in the wilds, Candide and Cacambo drift through a cave into a hidden valley, home of the Incas’ heirs. It is the one happy country in the book. Yet they leave, wanting to be rich in Europe, with a hundred red sheep loaded with gold; most of them die on the way to Suriname (the sheep on the map).",
 more:"The legend began with a Muisca rite at Lake Guatavita, where a new ruler was covered in gold dust. Spaniards, and in 1595 Walter Raleigh, hunted for the golden city up the Orinoco; mapmakers drew a great ‘Lake Parima’ that Alexander von Humboldt showed was not there. Voltaire uses the dream as a mirror to Europe."}),
S({title:"Suriname: the price of sugar",view:[-66,-10,18,20],globe:[-36,8,2],card:"left",hi:["sr"],
 lines:[{coords:[[-1.35,5.08],[-15,4],[-30,4.5],[-45,5.5],P.para],kind:"dash"},{coords:[[11.85,-4.65],[0,-2],[-20,1],[-40,4],P.para],kind:"dash"}],
 pins:[[P.para,"Paramaribo, Suriname","point"],[[-1.35,5.08],"Elmina, Gold Coast","point"],[[11.85,-4.65],"Loango coast","point"]],
 iconPins:[ic([-55.4,5.6],"person")],
 phPins:[ph([-56,5.4],"Sugar cane")],
 stat:"Outside Paramaribo Candide meets an enslaved man missing a hand and a leg: the price, he says, of Europe’s sugar",
 body:"The Dutch colony of Suriname grew sugar on plantations worked by tens of thousands of enslaved Africans, brought across the Atlantic along routes like the dashed lines. He lost his hand in a sugar mill, and his leg was cut off as punishment for running away. Here Candide gives up on Pangloss’s optimism for good.",
 more:"This short scene is the book’s sharpest attack on slavery, and one of the first in a bestseller. Voltaire’s own record is mixed: some of his other writings repeat the racial prejudices of his age, and historians still argue over how far his fortune touched colonial trade."}),
S({title:"Bordeaux and Paris",view:[-60,30,12,56],globe:[-20,42,1.8],card:"left",
 lines:[{coords:[P.para,[-45,15],[-30,30],[-15,40],[-5,44.5],P.bord],kind:"flow"},{coords:[P.bord,[0.7,46.6],P.paris],kind:"dash"}],
 pins:[[P.bord,"Bordeaux","point"],[P.paris,"Paris","point"],[[-0.56,44.69],"La Brède: Montesquieu’s château","point"]],
 phPins:[ph([-0.55,44.68],"La Brède, near Bordeaux")],
 stat:"Candide sails home with Martin, a scholar who believes the world is mostly evil, and is fleeced in Paris",
 body:"At Bordeaux the Academy studies the one red sheep that survived. In Paris Candide falls ill and is surrounded by doctors, card-sharps, a bad play, worse critics and a fake marquise. Voltaire, the most famous Parisian writer of his day, settles scores with his literary enemies.",
 more:"Martin balances Pangloss: one sees good everywhere, the other evil. Montesquieu, author of The Spirit of the Laws, had been a member of the Bordeaux Academy until his death in 1755."}),
S({title:"Portsmouth: to encourage the others",view:[-12,36,14,55],globe:[-2,46,2.6],card:"left",gfRuler:{a:P.mahon,b:P.ports},
 lines:[{coords:[P.mahon,[2,41],[-3,37],[-9,38],[-10,43],[-6,48.5],P.ports],kind:"dash"}],
 pins:[[P.ports,"Portsmouth: Byng shot, 14 March 1757","point"],[P.mahon,"Port Mahon, Minorca: lost in 1756","point"]],
 iconPins:[ic(P.ports,"ship"),ic(P.mahon,"swords")],
 stat:"Off Portsmouth Candide watches an English admiral shot on his own deck for not killing enough of the enemy",
 body:"This really happened. Admiral John Byng failed to relieve Minorca from a French attack in 1756, the island was lost, and in March 1757 he was executed by firing squad in Portsmouth harbour. In the novel someone explains that in England it is good to kill an admiral now and then, to encourage the others.",
 more:"Voltaire had tried to help Byng, passing on a letter from the French commander praising his conduct. The line ‘pour encourager les autres’ became a proverb. Candide is so disgusted he will not even set foot in England."}),
S({title:"Six kings at the Carnival",view:[-6,36,36,62],globe:[16,47,2.2],card:"left",
 lines:[{coords:[P.venice,P.istan],kind:"dash"},{coords:[P.venice,[30.32,59.94]],kind:"dash"},{coords:[P.venice,[21.01,52.23]],kind:"dash"},{coords:[P.venice,[9.0,42.2]],kind:"dash"},{coords:[P.venice,[-3.19,55.95]],kind:"dash"}],
 pins:[[P.venice,"Venice","point"],[[12.08,45.42],"The Brenta: Pococurante’s villa","point"],[P.istan,"Sultan Ahmed III, deposed 1730","point"],[[30.32,59.94],"Ivan VI, deposed 1741","point"],[[21.01,52.23],"Augustus III and Stanisław of Poland","point"],[[9.0,42.2],"Theodore, king of Corsica, 1736","point"],[[-3.19,55.95],"Charles Edward Stuart","point"]],
 phPins:[ph([12.34,45.43],"St Mark’s, Venice")],
 stat:"At a Carnival supper in Venice, Candide dines with six kings who have all lost their thrones",
 body:"They are real people, only gathered at one table: an Ottoman sultan, a Russian tsar deposed as a baby, two kings of Poland, the Stuart prince who failed to win Britain’s crown, and a German adventurer once crowned king of Corsica. The dashed lines lead to the thrones they lost.",
 more:"In Venice Candide also visits Senator Pococurante, who owns every great book and painting and enjoys none of them. Not even the rich and powerful, Voltaire suggests, are happy."}),
S({title:"A garden by Constantinople",view:[22,36,36,44.5],globe:[29,41,4.5],card:"left",gfHistYear:{y:1755,focus:"ott",labels:[{gk:"ott",name:"Ottoman Empire",at:[33,39.2]}]},
 lines:[{coords:[P.venice,[16,42],[19.5,39.5],[23,36.3],[26.1,38.5],[26.3,40.1],P.istan],kind:"flow"}],
 pins:[[P.istan,"Constantinople","point"],[P.marm,"The Propontis (Sea of Marmara)","point"]],
 iconPins:[ic([29.2,40.9],"tree")],
 phPins:[ph([29.0,41.04],"A ferry on the Bosporus")],
 stat:"The book ends on a small farm near Constantinople, with one plain lesson: we must cultivate our garden",
 body:"Candide buys back Cunégonde, now ugly and bad-tempered, from the shore of the Sea of Marmara, and the survivors settle on a little farm. A wise old Turk tells them that work keeps away three great evils: boredom, vice and want. Pangloss still talks, but they all get on with the gardening.",
 more:"What the garden means is the book’s great open question. Some read it as a retreat from the world, others as a call to useful work and practical reform. The coloured land is the Ottoman Empire in 1755."}),
S({title:"Voltaire’s own garden",view:[4.5,45.6,7.5,46.8],globe:[6.12,46.23,7],card:"left",gfRuler:{a:P.geneva,b:P.ferney},
 lines:[{coords:[P.geneva,[2.35,48.86]],kind:"dash"},{coords:[P.geneva,[4.9,52.37]],kind:"dash"},{coords:[P.geneva,[-0.13,51.5]],kind:"dash"}],
 pins:[[P.geneva,"Geneva: Les Délices, where he wrote Candide","point"],[P.ferney,"Ferney: his estate from 1759","point"]],
 iconPins:[ic(P.ferney,"tree"),ic(P.geneva,"book")],
 stat:"Voltaire wrote Candide in 1758 at his house in Geneva, then bought an estate just across the French border",
 body:"Drag the ruler: Ferney is only a few kilometres from Geneva, so Voltaire could slip into Switzerland if the French police came, or into France if Geneva’s did. Candide came out in Geneva, Paris, Amsterdam and London at almost the same moment, and more than a dozen editions appeared in its first year.",
 more:"At Ferney Voltaire really did cultivate his garden: he planted trees, drained marshes, built houses and brought in watchmakers, turning a poor village into a thriving town. It is now called Ferney-Voltaire."}),
S({title:"Now explore",view:W,globe:[-20,20,1],
 lines:[{coords:ROUTE,kind:"dash"}],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch on Plates and look again at the Atlantic off Portugal, where the Lisbon earthquake began. Then follow the dashed route and ask, at each stop, whether Voltaire was fair. Then try the Journey to the West tour: another journey across the world, made by a monk in search of wisdom rather than happiness."})];

/* ships, sheep and the old woman move along the stops’ flow lines (geoflock-walkers.js) */
const WALK={
 "Holland, then a ship for Lisbon":{emoji:"⛵",name:"Jacques the Anabaptist’s ship",size:26,per:1,float:1},
 "The old woman’s story":{emoji:"👵",name:"The old woman, sold from port to port",size:26,per:1,dur:16000},
 "From Cádiz to Buenos Aires":{emoji:"⛵",name:"Candide’s ship for Buenos Aires",size:26,per:1,float:1},
 "The golden land":{emoji:"🐑",name:"El Dorado’s red sheep, loaded with gold",size:24,per:2},
 "Bordeaux and Paris":{emoji:"⛵",name:"The French ship home",size:26,per:1,float:1},
 "A garden by Constantinople":{emoji:"⛵",name:"Candide sails for Constantinople",size:26,per:1,float:1}};
const addWalk=()=>{try{if(!window.gfWalkers)return;for(const t in WALK)window.gfWalkers[ID+"|"+t]=WALK[t]}catch(e){}};
addWalk();addEventListener("load",()=>setTimeout(addWalk,500));

PS_TOURS[ID]={name:"Candide",short:"Candide",hint:"Voltaire’s 1759 novel, on the map: Westphalia, the Lisbon earthquake, Paraguay’s Jesuit missions, El Dorado, Suriname, Venice and a garden by Constantinople",
 map:{mode:"relief"},group:"books",col:COL,steps:STEPS,stopModes:false,alsoOn:[]};
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER,k=o.indexOf(ID);if(k>=0)o.splice(k,1);o.push(ID)}
const mine=()=>typeof ps!=="undefined"&&ps&&ps.tour===ID;

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined")TOURQ[ID]={mid:[
 {at:"Lisbon, 1 November 1755",st:"Lisbon, 1 November 1755",q:"On which holy day did the Lisbon earthquake strike in 1755?",o:["Christmas Day","Easter Sunday","All Saints’ Day","Good Friday"],a:2,why:"1 November: the churches were full.",kc:"pt"},
 {at:"The Jesuits of Paraguay",st:"The Jesuits of Paraguay",q:"Which people lived in the Jesuit missions of Paraguay?",o:["The Inca","The Guaraní","The Maya","The Mapuche"],a:1,why:"Some thirty mission towns, until 1767.",kc:"py"},
 {at:"Suriname: the price of sugar",st:"Suriname: the price of sugar",q:"Which European country ruled Suriname when Candide was written?",o:["France","Britain","The Netherlands","Portugal"],a:2,why:"It was a Dutch plantation colony.",kc:"sr"}],
 recap:[
 {q:"Which philosopher’s optimism does Pangloss parody?",o:["Descartes","Leibniz","Kant","Locke"],a:1,why:"Leibniz argued this is the best of all possible worlds.",st:"Westphalia: the best of all possible castles",kc:"de"},
 {q:"Where was Admiral Byng executed in 1757?",o:["Plymouth","Portsmouth","Gibraltar","Minorca"],a:1,why:"On his own ship’s deck in Portsmouth harbour.",st:"Portsmouth: to encourage the others",kc:"gb"},
 {q:"Near which city does Candide finally settle on a small farm?",o:["Venice","Cairo","Constantinople","Smyrna"],a:2,why:"By the Sea of Marmara, then called the Propontis.",st:"A garden by Constantinople",kc:"tr"}]}}catch(e){}

/* ---------- thermometers: none on this tour ---------- */

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "Candide":"Christoph Bernhard Francke - Bildnis des Philosophen Leibniz (ca. 1695).jpg",
 "Westphalia: the best of all possible castles":"Münster, Historisches Rathaus -- 2014 -- 6855.jpg",
 "Holland, then a ship for Lisbon":"KeizersgrachtReguliersgrachtAmsterdam.jpg",
 "Lisbon, 1 November 1755":"Arco Triunfal da Rua Augusta, Plaza del Comercio, Lisboa, Portugal, 2012-05-12, DD 02.JPG",
 "An auto-da-fé to stop the earthquakes":"View of Lisbon and Tejo - 01.jpg",
 "The old woman’s story":"Sunshine on mosque Hassan II in Casablanca, Morocco - Flickr - Milamber's portfolio.jpg",
 "From Cádiz to Buenos Aires":"Santa Maria replica ship.jpg",
 "The Jesuits of Paraguay":"Clock tower - Jesuit Reduction of Trinidad - Paraguay.JPG",
 "The golden land":"Rio Orinoco e Canal do Cassiquiare, Venezuela.jpg",
 "Suriname: the price of sugar":"Fort Zeelandia top view (photo 5) located at Abraham Crijnssenweg 1 paramaribo, suriname.jpg",
 "Bordeaux and Paris":"Notre-Dame de Paris, 4 October 2017.jpg",
 "Six kings at the Carnival":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg",
 "A garden by Constantinople":"Hagia Sophia Mars 2013.jpg",
 "Now explore":"Paramaribo, houses in typical Surinamese style.JPG"};
const CAP={
 "Candide":"Leibniz, about 1695: the philosopher whose optimism Candide mocks",
 "Westphalia: the best of all possible castles":"Münster’s town hall, where part of the Peace of Westphalia was signed in 1648",
 "Holland, then a ship for Lisbon":"Amsterdam’s canals",
 "Lisbon, 1 November 1755":"The Rua Augusta Arch, gateway to the Lisbon rebuilt after the earthquake",
 "An auto-da-fé to stop the earthquakes":"Lisbon and the Tagus today",
 "The old woman’s story":"Morocco’s Atlantic coast at Casablanca, south of the pirate port of Salé",
 "From Cádiz to Buenos Aires":"A replica of a Spanish ship of the age of sail (Columbus’s Santa María)",
 "The Jesuits of Paraguay":"The ruins of the Jesuit mission of Trinidad, Paraguay",
 "The golden land":"Where the Orinoco meets the Casiquiare, in the lands of the El Dorado legend",
 "Suriname: the price of sugar":"Fort Zeelandia, Paramaribo, the colony’s Dutch stronghold",
 "Bordeaux and Paris":"Notre-Dame de Paris",
 "Six kings at the Carnival":"The Doge’s Palace, Venice",
 "A garden by Constantinople":"Hagia Sophia, Istanbul, then the Ottoman capital",
 "Now explore":"Old wooden houses in Paramaribo"};
const PIN={
 "Münster’s town hall, Westphalia":"Münster, Historisches Rathaus -- 2014 -- 6855.jpg","Rua Augusta Arch, Lisbon":"Arco Triunfal da Rua Augusta, Plaza del Comercio, Lisboa, Portugal, 2012-05-12, DD 02.JPG",
 "Jesuit mission of Trinidad":"Clock tower - Jesuit Reduction of Trinidad - Paraguay.JPG","Fort Zeelandia, Paramaribo":"Fort Zeelandia top view (photo 5) located at Abraham Crijnssenweg 1 paramaribo, suriname.jpg",
 "Venice":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg","Hagia Sophia":"Hagia Sophia Mars 2013.jpg",
 "Gottfried Wilhelm Leibniz":"Christoph Bernhard Francke - Bildnis des Philosophen Leibniz (ca. 1695).jpg","Amsterdam’s canals":"Water reflection of canal houses at blue hour in Damrak Amsterdam the Netherlands.jpg",
 "Lisbon on the Tagus":"View of Lisbon and Tejo - 01.jpg","Istanbul’s Grand Bazaar":"Grand Bazaar Istanbul - panoramio.jpg","Buenos Aires today":"Obelisco de Buenos Aires, Diagonal Norte, Avenida Corrientes.jpg",
 "Asunción":"00 3819 Asunción - Paraguay (Südamerika).jpg","The Orinoco":"Panoramica del rio orinoco en amazonas.JPG",
 "Sugar cane":"Harvest Sugar Cane 5.jpg","La Brède, near Bordeaux":"Château de La Brède en Gironde.jpg",
 "St Mark’s, Venice":"Venezia Basilica di San Marco Fassade 2.jpg","A ferry on the Bosporus":"Sultanahmet ferry on the Bosphorus in Istanbul, Turkey 001.jpg"};
const PHOTOS=window.GF_BCANDIDE_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C="Clock tower - Jesuit Reduction of Trinidad - Paraguay.JPG";
 const set=()=>{if(TOUR_THUMBS[ID])return;const p=findP(C);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[ID]=p.d};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
