/* GeoFlock: Mapped books tour.
   brihla  "The Travels of Ibn Battuta"   the Rihla, dictated to Ibn Juzayy in Fez, 1355
   Each stop follows one stretch of the journey on the map, in the order the book tells it. The book is summarised in our own
   words and presented as Ibn Battuta’s own account; where historians doubt it (the China chapters, the trip to Bulghar,
   borrowed passages, dates) the card says so. No book covers or long quotes.
   The tour runs on the Relief map; stops about a year lay that year's states over it (gfHistYear, from
   geoflock-booktours-relief.js, as the other book tours do), with route lines that a
   traveller walks along (kind:"flow", registered in gfWalkers from geoflock-walkers.js), dashed lines for doubted legs, a
   thermometer at Taghaza (gfTourThermo from geoflock-tourthermo.js), the ruler (gfRuler) and a height cross-section (xsec).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry).
   WANT_PHOTOS: ["Tanger 2.jpg","Tangier, 1325"], ["Kilwa Kisiwani Great Mosque.jpg","Down the Swahili coast"],
   ["Adams Peak.jpg","Judge of the Maldives"], ["Kaiyuan Temple Quanzhou.jpg","China: the far edge of the world"],
   ["Ibn Battuta Mall China Court.jpg","Now explore"], ["Calicut 1572.jpg","Shipwreck at Calicut"],
   ["Ruins of Taghaza.jpg","Across the Sahara for salt"] */
window.GF_BRIHLA_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={brihla:"#a0703a"},W=[-180,-58,180,80],ROUTE=[-22,-14,126,58];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});
/* places on the way ([lon, lat]) */
const P={tangier:[-5.81,35.78],tlemcen:[-1.32,34.88],bejaia:[5.08,36.75],tunis:[10.17,36.81],tripoli:[13.19,32.89],alex:[29.92,31.2],cairo:[31.24,30.04],aydhab:[36.49,22.33],
 gaza:[34.47,31.5],jerus:[35.23,31.78],damascus:[36.29,33.51],tabuk:[36.57,28.38],medina:[39.61,24.47],mecca:[39.83,21.42],jeddah:[39.17,21.54],
 najaf:[44.32,32.0],basra:[47.78,30.5],isfahan:[51.67,32.65],shiraz:[52.53,29.59],baghdad:[44.36,33.31],tabriz:[46.29,38.08],mosul:[43.13,36.34],
 aden:[45.03,12.79],zeila:[43.47,11.35],mogadishu:[45.34,2.04],mombasa:[39.67,-4.05],kilwa:[39.51,-8.96],zafar:[54.09,17.02],qalhat:[59.37,22.7],hormuz:[56.46,27.1],
 alanya:[32.0,36.54],konya:[32.49,37.87],sinop:[35.15,42.03],kaffa:[35.38,45.03],azov:[39.42,47.1],beshtau:[43.05,44.1],bulghar:[49.08,54.98],sarai:[47.1,46.7],const:[28.98,41.01],
 urgench:[59.15,42.33],bukhara:[64.42,39.77],samarkand:[66.97,39.65],termez:[67.28,37.22],balkh:[66.9,36.76],kunduz:[68.86,36.73],kabul:[69.17,34.53],ghazni:[68.42,33.55],
 indus:[68.6,26.4],multan:[71.47,30.2],delhi:[77.21,28.61],daulat:[75.21,19.94],koil:[78.08,27.88],gwalior:[78.18,26.22],cambay:[72.62,22.31],honavar:[74.44,14.28],calicut:[75.78,11.25],
 male:[73.51,4.17],puttalam:[79.83,8.04],adams:[80.5,6.81],sonargaon:[90.6,23.65],sylhet:[91.87,24.9],samudra:[97.15,5.18],quanzhou:[118.58,24.9],guangzhou:[113.26,23.13],hangzhou:[120.16,30.27],beijing:[116.4,39.9],
 aleppo:[37.16,36.2],homs:[36.72,34.73],gibraltar:[-5.35,36.14],ronda:[-5.17,36.74],malaga:[-4.42,36.72],granada:[-3.59,37.18],
 fez:[-4.98,34.03],sijilmasa:[-4.27,31.28],taghaza:[-5.0,23.6],walata:[-7.03,17.29],niani:[-8.33,11.37],timbuktu:[-3.0,16.77],gao:[-0.04,16.27],takedda:[6.4,17.4],tuat:[-0.29,27.87]};
/* sea lanes kept off the land */
const SEA_EAFR=[P.aden,[44.2,11.9],P.zeila,[46.5,11.8],[51.4,12.1],[51.6,10.4],[49.6,6.5],[47.2,3.6],P.mogadishu,[43.2,-0.6],[41.3,-2.6],P.mombasa,[40.1,-6.1],P.kilwa];
const SEA_BACK=[P.kilwa,[41.5,-5.5],[46.5,0.5],[52.5,8.5],[55.4,14.5],P.zafar,[57.5,18.6],[59.6,21.6],P.qalhat,[59.8,23.7],[57.7,25.6],P.hormuz];
const SEA_CHINA=[P.sonargaon,[90.4,22],[91,19],[93.5,14],[95.5,8.5],P.samudra,[99.5,4.1],[101.6,2.5],[103.9,1.15],[105.5,3],[108.5,8.5],[110.5,13.5],[112,18.5],[115.5,22],P.quanzhou];

/* =====================================================================================================
   The Travels of Ibn Battuta (the Rihla, 1355)
   ===================================================================================================== */
const RIHLA=[
S({title:"The Travels of Ibn Battuta",view:ROUTE,globe:[50,25,1.2],gfHistYear:{y:1330,labels:[{gk:"mali",name:"Mali"},{n:"Mamluk Sultanate"},{n:"Sultanate of Delhi",name:"Delhi Sultanate"},{n:"Khanate of the Golden Horde",name:"Golden Horde"},{n:"Great Khanate",name:"Yuan China"}]},
 lines:[{coords:[P.tangier,P.tunis,P.alex,P.cairo,P.damascus,P.medina,P.mecca],kind:"flow"},{coords:[P.mecca,P.jeddah,[41,17],[43,13.4],P.aden].concat(SEA_EAFR.slice(1)),kind:"flow"},
  {coords:[P.const,P.kaffa,P.sarai,P.urgench,P.bukhara,P.samarkand,P.balkh,P.kabul,P.multan,P.delhi],kind:"flow"},{coords:[P.calicut,P.male,[80,6.2],[85,10],[89.5,19.5]].concat(SEA_CHINA.slice(2)),kind:"flow"},
  {coords:[P.fez,P.sijilmasa,P.taghaza,P.walata,P.niani],kind:"flow"}],
 pins:[[P.tangier,"Tangier: home","point"],[P.mecca,"Mecca","point"],[P.delhi,"Delhi","point"],[P.quanzhou,"Quanzhou","point"],[P.kilwa,"Kilwa","point"],[P.timbuktu,"Timbuktu","point"]],
 phPins:[ph([39.83,21.42],"Pilgrims at the Kaaba"),ph([77.18,28.52],"The Qutb Minar, Delhi"),ph([39.2,-6.16],"A dhow off Zanzibar"),ph([-3.0,16.77],"The Djinguereber Mosque, Timbuktu"),ph([66.98,39.66],"Shah-i-Zinda, Samarkand"),ph([120.15,30.25],"West Lake, Hangzhou")],
 stat:"Between 1325 and 1354 a young legal scholar from Tangier travelled some 117,000 km, probably farther than anyone before the age of steam",
 body:"Back in Morocco, Ibn Battuta dictated his memories to a court scholar, Ibn Juzayy, on the sultan’s orders. The book, known as the Rihla (‘journey’), follows him across the Muslim world of the 1300s and beyond: some 40 of today’s countries. This tour follows him in the order he tells it; the colours show the states of 1330.",
 more:"Its full title promises a gift to those who enjoy the wonders of cities and the marvels of travel. It was little known outside the Muslim world until French scholars published it with a translation in the 1850s. Historians treat it as a priceless but imperfect source: told from memory decades later, with some passages borrowed from other writers."}),
S({title:"Tangier, 1325",view:[-37.9,27,35,42],globe:[11,34,2.6],card:"left",hi:["ma"],
 lines:[{coords:[P.tangier,P.tlemcen,P.bejaia,P.tunis,[11,35],P.tripoli,[20.07,32.12],[23.96,32.08],[27.2,31.35],P.alex],kind:"flow"}],
 pins:[[P.tangier,"Tangier","point"],[P.tlemcen,"Tlemcen","point"],[P.tunis,"Tunis","point"],[P.tripoli,"Tripoli","point"],[P.alex,"Alexandria","point"]],
 phPins:[ph([31.24,30.04],"Cairo on the Nile")],
 stat:"He left home in June 1325, aged 21, to make the pilgrimage to Mecca, and did not see Tangier again for 24 years",
 body:"Ibn Battuta came from a Berber family of judges and legal scholars. He says he set out alone, like a bird leaving its nest, and wept at leaving his parents. Caravans of merchants and pilgrims carried him east along the North African coast; on the way he fell ill with fever and married for the first time.",
 more:"The Hajj, the pilgrimage to Mecca, is a duty for every Muslim who is able to make it. Crossing North Africa took him about ten months. By the time he came home, in 1349, both his parents had died."}),
S({title:"Alexandria and Cairo",view:[13.9,20.5,41,33.5],globe:[31,28,3.6],card:"left",on:["rivers"],
 lines:[{coords:[P.alex,[30.5,31],P.cairo,[31.5,28],[32.65,25.7],[33.3,25],[35.4,23.4],P.aydhab],kind:"flow"},{coords:[P.cairo,[32.3,30.9],P.gaza],kind:"flow"}],
 pins:[[P.alex,"Alexandria: the Pharos","point"],[P.cairo,"Cairo","point"],[P.aydhab,"Aydhab: the way blocked","point"]],
 iconPins:[ic(P.alex,"lighthouse")],
 phPins:[ph([31.25,30.05],"Cairo on the Nile")],
 stat:"Cairo, capital of the Mamluk sultans, was one of the biggest cities on Earth; he calls it the mother of cities",
 body:"In Alexandria he saw the ancient Pharos lighthouse, already damaged; when he passed again in 1349 it was a ruin. A holy man there told him he would travel to India and China and meet the man’s three brothers on the way. Ibn Battuta says he met them all.",
 more:"He meant to sail down the Red Sea from the port of Aydhab, but a revolt there closed the way, so he went back down the Nile and turned north to Syria instead (the arrows)."}),
S({title:"Damascus to Mecca",view:[16,17,47,37],globe:[37,28,3],card:"left",gfHistYear:{y:1326,focus:"maml",labels:[{gk:"maml",name:"Mamluk Sultanate"}]},
 lines:[{coords:[P.gaza,P.jerus,P.damascus],kind:"flow"},{coords:[P.damascus,[36.1,32.6],[35.73,30.2],P.tabuk,[37.9,26.6],P.medina,[39.4,23.2],P.mecca],kind:"flow"}],
 pins:[[P.jerus,"Jerusalem","point"],[P.damascus,"Damascus","point"],[P.medina,"Medina","point"],[P.mecca,"Mecca","point"]],
 iconPins:[ic([39.83,21.42],"dome")],
 phPins:[ph([36.31,33.51],"The Umayyad Mosque, Damascus"),ph([39.61,24.47],"The Prophet’s Mosque, Medina")],
 stat:"In 1326 he crossed the desert with the great Syrian pilgrim caravan and reached Mecca, the first of several Hajj journeys",
 body:"The colours show the states of 1326: the Mamluk Sultanate (strongest) ruled Egypt, Syria and the holy cities of Arabia. Ibn Battuta spent Ramadan in Damascus, studying with its scholars, then joined the caravan south by Tabuk and Medina to Mecca.",
 more:"Being a pilgrim and a scholar of Islamic law was his passport. Across the Muslim world, judges, Sufi lodges and rulers gave him food, lodging, gifts and jobs, and he would rely on that welcome for the next 28 years."}),
S({title:"Iraq and Persia",view:[18.6,18,62,41],globe:[48,30,2.6],card:"left",gfHistYear:{y:1327,focus:"mon",labels:[{n:/^Il-?khanate$/,name:"The Ilkhans"},{n:"Mamluk Sultanate"}]},
 lines:[{coords:[P.mecca,[42,26.5],P.najaf,P.basra,[49.5,31.3],P.isfahan,P.shiraz],kind:"flow"},{coords:[P.shiraz,[49,31.5],P.baghdad,P.tabriz],kind:"flow"},{coords:[P.tabriz,P.mosul,P.baghdad,[42.5,28],P.mecca],kind:"flow"}],
 pins:[[P.najaf,"Najaf","point"],[P.basra,"Basra","point"],[P.isfahan,"Isfahan","point"],[P.shiraz,"Shiraz","point"],[P.baghdad,"Baghdad","point"],[P.tabriz,"Tabriz","point"]],
 phPins:[ph([52.55,29.61],"Tilework in Shiraz")],
 stat:"Instead of going home, he set off to see Iraq and Persia, then ruled by the Mongol Ilkhans",
 body:"The colours show the states of 1327, the Mongol khanates strongest. He visited the shrine of Ali at Najaf and the great cities of Isfahan and Shiraz. In Baghdad, still scarred by the Mongol sack of 1258, he joined the travelling camp of the Ilkhan Abu Sa’id and rode with it towards Tabriz.",
 more:"Travel had become an end in itself. He says he made it a rule, as far as he could, never to take the same road twice. Then he went back to Mecca and, by his account, stayed to study for some time; historians disagree about how long, and his dates for the next few years do not quite add up."}),
S({title:"Down the Swahili coast",view:[8.2,-13,64,30],globe:[46,8,1.9],card:"left",
 lines:[{coords:[P.jeddah,[41,17],[43,13.4],P.aden],kind:"flow"},{coords:SEA_EAFR,kind:"flow"},{coords:SEA_BACK,kind:"flow"}],
 pins:[[P.aden,"Aden","point"],[P.zeila,"Zeila","point"],[P.mogadishu,"Mogadishu","point"],[P.mombasa,"Mombasa","point"],[P.kilwa,"Kilwa","point"],[P.zafar,"Zafar","point"],[P.hormuz,"Hormuz","point"]],
 iconPins:[ic([41,-6.6],"ship"),ic([52,9.5],"ship")],
 phPins:[ph([58.59,23.61],"Old Muscat"),ph([45.36,2.03],"Mogadishu’s Lido Beach")],
 stat:"Around 1330 he sailed with the monsoon winds to the trading cities of East Africa, as far south as Kilwa",
 body:"From Aden, Yemen’s great port, he sailed to Zeila, which he found the dirtiest town in the world, and Mogadishu, where the sultan fed his guests lavishly. Kilwa, he wrote, was one of the most beautiful and best-built towns he knew, rich from the gold trade with the lands to its south.",
 more:"The monsoon blows from the north-east in winter and from the south-west in summer, so ships could sail down this coast and back within a year. He came home by Oman and Hormuz, at the mouth of the Persian Gulf. Historians are unsure whether this voyage took place in 1328 or 1330."}),
S({title:"The Golden Horde and Constantinople",view:[2.2,35,58,59],globe:[40,46,2.4],card:"left",gfHistYear:{y:1333,focus:"mon",labels:[{n:"Khanate of the Golden Horde",name:"The Golden Horde",at:[45,51]},{n:"Eastern Roman Empire",name:"Byzantine Empire",at:[27,40.2]}]},
 lines:[{coords:[P.alanya,P.konya,P.sinop,P.kaffa,P.azov,P.beshtau],kind:"flow"},{coords:[P.beshtau,[38,47],[33,47.5],[29,46.3],[28.5,44.2],[27.7,42.6],P.const],kind:"flow"},{coords:[P.const,[28.5,44.2],[33,47.5],[40,48.4],P.sarai],kind:"flow"},
  {coords:[P.beshtau,[46,49],P.bulghar],kind:"dash"}],
 pins:[[P.konya,"Konya","point"],[P.kaffa,"Kaffa (Feodosia)","point"],[P.beshtau,"Özbeg Khan’s camp","point"],[P.const,"Constantinople","point"],[P.sarai,"Sarai, the Horde’s capital","point"],[P.bulghar,"Bulghar: a doubted side trip","point"]],
 phPins:[ph([28.98,41.01],"Hagia Sophia"),ph([45.5,50.5],"Riders of the steppe")],
 stat:"On his way to India he crossed the Black Sea to the Golden Horde, the Mongol khanate of the western steppe",
 body:"He rode with the vast moving camp of Özbeg Khan, a city of wagons and tents. When one of the khan’s wives, a Byzantine princess, went home to Constantinople to give birth, he went with her and met the emperor Andronikos III: a rare view of the Christian capital by a Muslim writer.",
 more:"He was struck by the respect and freedom that Turkic and Mongol women enjoyed. His side trip north to Bulghar on the Volga (dashed), to see its short summer nights, is doubted by many historians: the timing hardly fits."}),
S({title:"Over the Hindu Kush",view:[43.9,29.5,78,45],globe:[66,37,3],card:"left",
 xsec:{title:"Across the Hindu Kush, Kunduz to Kabul",pts:[[68.86,36.73,"Kunduz"],[68.7,36.13,"Baghlan"],[69.25,35.85],[69.6,35.7,"Andarab"],[69.82,35.66,"Khawak pass"],[69.75,35.45],[69.6,35.3,"Panjshir"],[69.17,35.01,"Charikar"],[69.17,34.53,"Kabul"]],mark:3000,note:"The dashed line marks 3,000 m. His route probably crossed by the Khawak pass, about 3,850 m high; the chart’s heights are smoothed."},
 lines:[{coords:[P.urgench,P.bukhara,P.samarkand,P.termez,P.balkh,P.kunduz,[69.7,35.6],P.kabul,P.ghazni,[68.8,30],P.indus],kind:"flow"}],
 pins:[[P.urgench,"Urgench","point"],[P.bukhara,"Bukhara","point"],[P.samarkand,"Samarkand","point"],[P.balkh,"Balkh","point"],[P.kabul,"Kabul","point"],[P.indus,"The Indus, 1333","point"]],
 phPins:[ph([64.41,39.78],"The Ark of Bukhara"),ph([66.99,39.66],"Shah-i-Zinda, Samarkand")],
 stat:"He crossed the Hindu Kush in snow, and explains its name: so many enslaved people from India died of cold here",
 body:"Bukhara and Samarkand still bore the scars of Genghis Khan’s armies a century before, and Balkh lay in ruins. On the pass, he says, the snow was so deep that felt was laid down for the camels to walk on (see the cross-section). He reached the Indus, by his own date, in September 1333.",
 more:"At the Chagatai khan’s camp near Samarkand he was received by Tarmashirin, a recent convert to Islam. Shah-i-Zinda, the street of tombs he visited in Samarkand, still stands, though most of its tiled mausoleums were built after his time."}),
S({title:"Judge in Delhi",view:[39.3,10,92,36.5],globe:[76,24,2.2],card:"left",gfHistYear:{y:1335,focus:"delhi",labels:[{n:"Sultanate of Delhi",name:"Delhi Sultanate"}]},gfRuler:{a:[77.21,28.61],b:[75.21,19.94]},
 lines:[{coords:[P.indus,P.multan,[74.5,30],P.delhi],kind:"flow"}],
 pins:[[P.multan,"Multan","point"],[P.delhi,"Delhi","point"],[P.daulat,"Daulatabad","point"]],
 iconPins:[ic([77.185,28.524],"tower")],
 phPins:[ph([77.24,28.66],"Old Delhi")],
 stat:"Sultan Muhammad bin Tughluq made him a judge of Delhi on a huge salary, and kept him for about seven years",
 body:"The colours show the states of 1335: the Delhi Sultanate (strongest) ruled most of India. Ibn Battuta describes the sultan’s dazzling gifts and his terrifying cruelty side by side. He ran up great debts, fell under suspicion after visiting a disgraced holy man, and feared for his life.",
 more:"A few years before, the sultan had ordered Delhi’s people to move to a new capital at Daulatabad, about 950 km to the south (drag the ruler), and Ibn Battuta found much of Delhi empty. He admired the Qutb Minar, the great minaret of Delhi’s mosque, which still stands."}),
S({title:"Shipwreck at Calicut",view:[51.9,6,86,31],globe:[75,19,2.6],card:"left",
 lines:[{coords:[P.delhi,P.koil,P.gwalior,[77.6,24.8],[75.3,22.6],P.daulat,[73.8,21],P.cambay],kind:"flow"},{coords:[P.cambay,[72.4,21],[72.6,19],[73.2,16.5],[74.1,14.6],P.honavar,[75.1,12.6],P.calicut],kind:"flow"}],
 pins:[[P.koil,"Koil: attacked by rebels","point"],[P.cambay,"Cambay","point"],[P.calicut,"Calicut","point"]],
 iconPins:[ic([75.5,11.0],"ship")],
 phPins:[ph([75.9,12.3],"The Western Ghats in the monsoon")],
 stat:"In 1341 the sultan sent him as ambassador to the Mongol emperor of China; the mission ended in a storm off Calicut",
 body:"The embassy set out with rich gifts and an escort of horsemen. Near Koil rebels attacked, and Ibn Battuta was captured and nearly killed before he escaped. At Calicut, great Chinese junks were waiting. A storm wrecked the junk carrying the gifts, and everyone on board died; the smaller ship with his belongings sailed on without him.",
 more:"Calicut traded pepper with the whole Indian Ocean. He describes Chinese junks with up to twelve sails and crews of a thousand men. Afraid to go back to the sultan empty-handed, he drifted along the Malabar coast."}),
S({title:"Judge of the Maldives",view:[59.4,-2,85,13],globe:[77,5,3.6],card:"left",hi:["mv"],hiSoft:["lk"],
 lines:[{coords:[P.calicut,[75,8.5],[73.8,5.5],P.male],kind:"flow"},{coords:[P.male,[76,5.6],[79.2,7.2],P.puttalam],kind:"flow"},{coords:[P.puttalam,[80.1,7.4],P.adams],kind:"flow"}],
 pins:[[P.male,"Malé","point"],[P.puttalam,"Puttalam","point"],[P.adams,"Adam’s Peak","peak"]],
 phPins:[ph([73.2,3.3],"A Maldives atoll"),ph([80.64,7.29],"Kandy’s Temple of the Tooth")],
 stat:"He spent about nine months as chief judge of the Maldives, whose islanders traded cowrie shells as money",
 body:"The Maldivians were Muslims, and a trained judge was welcome. Ibn Battuta married into leading families and tried to enforce strict law, such as punishing men who missed Friday prayers. That made him enemies, and in 1344 he left. Cowries from these atolls served as money as far away as Bengal and West Africa.",
 more:"He sailed on to Ceylon (Sri Lanka) and climbed Adam’s Peak, 2,243 m, a mountain sacred to Muslims, Buddhists and Hindus, to see the giant footprint on its summit. The Temple of the Tooth in Kandy came later; the island’s capitals then lay elsewhere."}),
S({title:"China: the far edge of the world",view:[62.9,-2,128,44],globe:[108,22,1.7],card:"left",gfHistYear:{y:1345,focus:"mon",labels:[{n:"Great Khanate",name:"Yuan China (the Great Khanate)",at:[112,33]}]},
 lines:[{coords:[P.sonargaon,P.sylhet],kind:"flow"},{coords:SEA_CHINA,kind:"flow"},{coords:[P.quanzhou,[116.6,23.4],P.guangzhou],kind:"flow"},{coords:[P.quanzhou,[119.3,27.2],P.hangzhou,[119,34],[117.3,37.2],P.beijing],kind:"dash"}],
 pins:[[P.sylhet,"Sylhet","point"],[P.samudra,"Samudra, Sumatra","point"],[P.quanzhou,"Quanzhou (Zaitun)","point"],[P.guangzhou,"Guangzhou","point"],[P.hangzhou,"Hangzhou (Khansa)","point"],[P.beijing,"Beijing: did he get this far?","point"]],
 iconPins:[ic([116,20.8],"ship")],
 phPins:[ph([120.1,30.3],"Tea fields near Hangzhou")],
 stat:"Around 1345 he reached Quanzhou, which he called Zaitun: the biggest harbour he had ever seen",
 body:"He describes paper money, coal burnt as fuel, fine porcelain and roads so well guarded that a traveller was safe alone. Hangzhou, he says, was the largest city on Earth. He claims he then went on to the Mongol capital, Khanbaliq, today’s Beijing (dashed).",
 more:"These are the most doubted pages of the Rihla. They are short and vague, the dates do not fit, and he reports that the Great Khan had just been killed in a civil war, which did not happen. Many historians accept Quanzhou and Guangzhou but doubt he ever reached Beijing."}),
S({title:"The Black Death",view:[18.2,25.5,43,39],globe:[35,32,4.2],card:"left",
 lines:[{coords:[P.aleppo,P.homs,P.damascus,P.jerus,P.gaza,[32.3,30.9],P.cairo],kind:"flow"}],
 pins:[[P.aleppo,"Aleppo","point"],[P.damascus,"Damascus, July 1348","point"],[P.gaza,"Gaza","point"],[P.cairo,"Cairo","point"]],
 phPins:[ph([36.31,33.51],"Old Damascus")],
 stat:"Heading home in 1348, he walked into the Black Death; in Damascus, he says, 2,400 people died in a single day",
 body:"The plague, spread by fleas on rats along the trade routes, had reached Egypt and Syria the year before. He describes the people of Damascus fasting for three days, then walking out together, Muslims, Christians and Jews, to pray for it to end. For Cairo he gives a far higher figure, surely an exaggeration.",
 more:"Historians think the plague killed about a third of the people of Egypt and Syria. Back in Morocco a year later, he learnt that his mother had died of it a few months before. (Pictured: Bruegel’s Triumph of Death, painted in the 1560s.)"}),
S({title:"Granada, 1350",view:[-15.5,34.5,0,39.5],globe:[-4.5,37,6],card:"left",hiSoft:["es"],
 lines:[{coords:[P.tangier,[-5.5,35.95],P.gibraltar,[-5.3,36.5],P.ronda,[-4.9,36.5],P.malaga,[-4.0,37.0],P.granada],kind:"flow"}],
 pins:[[P.gibraltar,"Gibraltar","point"],[P.ronda,"Ronda","point"],[P.malaga,"Málaga","point"],[P.granada,"Granada","point"]],
 iconPins:[ic([-3.588,37.176],"castle")],
 phPins:[ph([-3.59,37.18],"The Alhambra’s carved ceilings")],
 stat:"In 1350 he crossed to Granada, the last Muslim kingdom in Spain, while its rulers were building the palaces of the Alhambra",
 body:"Castile’s king, Alfonso XI, had just died of the plague while besieging Gibraltar. Ibn Battuta toured Ronda and Málaga and met the scholars of Granada; among them, it seems, was Ibn Juzayy, the young poet who would later write down his book.",
 more:"Most of the Alhambra’s famous palaces were built under Yusuf I, who ruled when Ibn Battuta came, and his son Muhammad V. Granada held out until 1492."}),
S({title:"Across the Sahara for salt",view:[-31.3,13,9,37],globe:[-4,25,2.6],card:"left",
 lines:[{coords:[P.fez,[-4.6,32.6],P.sijilmasa,[-4.6,27.5],P.taghaza,[-6.2,20.5],P.walata],kind:"flow"}],
 pins:[[P.fez,"Fez","point"],[P.sijilmasa,"Sijilmasa","point"],[P.taghaza,"Taghaza: houses of salt","point"],[P.walata,"Walata","point"]],
 iconPins:[ic([-4.6,27.5],"dune")],
 phPins:[ph([-12.36,20.46],"Chinguetti, a caravan town")],
 stat:"In 1352 he crossed the Sahara with a caravan: 25 days to Taghaza, where the houses and mosque were built of salt",
 body:"At Taghaza enslaved workers cut slabs of rock salt, and nothing grew: all food was brought in by camel. Beyond lay the hardest stretch, where the caravan sent a scout ahead to Walata so that water could be brought out to meet it. The thermometer shows Taghaza’s usual temperature today.",
 more:"Desert salt was traded south for West African gold; a load of salt, he says, sold in Mali for many times its price. At Walata, the first town of the empire of Mali, he disliked the officials’ manners and was startled by how freely women and men mixed."}),
S({title:"The court of Mali",view:[-32.4,6.5,11,24],globe:[-4,15,2.8],card:"left",gfHistYear:{y:1352,focus:"mali",labels:[{gk:"mali",name:"Empire of Mali"}]},
 lines:[{coords:[P.walata,[-7.8,14],P.niani],kind:"flow"},{coords:[P.niani,[-6.5,13.5],[-4.2,14.5],P.timbuktu,[-1.5,16.9],P.gao,[3,17.6],P.takedda],kind:"flow"}],
 pins:[[P.niani,"Mali’s capital? (one guess: Niani)","point"],[P.timbuktu,"Timbuktu","point"],[P.gao,"Gao","point"],[P.takedda,"Takedda: copper","point"]],
 iconPins:[ic([-8.33,11.37],"gold","#c99a1a")],
 phPins:[ph([-4.56,13.9],"The Niger River"),ph([-3.01,16.78],"Timbuktu’s manuscripts")],
 stat:"At Mali’s capital he met Mansa Sulayman, brother of the famous Mansa Musa, and was unimpressed by his welcome gift",
 body:"He had hoped for gold like the wealth Mansa Musa had scattered in Cairo in 1324. Instead he was sent bread, beef fried in shea butter and yoghurt, and he laughed at it. Yet he praised Mali’s safety: travellers, he says, had nothing to fear from thieves, and people were strict about their prayers.",
 more:"Historians still argue about where Mali’s capital lay; the dot shows only one guess. He came home by Timbuktu, then a modest town whose great mosque had been built for Mansa Musa, and Gao on the Niger, and on to Takedda, where copper bars were used as money. Then a messenger from the sultan of Morocco called him home."}),
S({title:"A book from memory",view:ROUTE,globe:[50,25,1.2],card:"left",hi:["ma"],gfRuler:{a:P.tangier,b:P.quanzhou},
 lines:[{coords:[P.takedda,P.tuat,P.sijilmasa,P.fez],kind:"flow"}],
 pins:[[P.fez,"Fez, 1354–1355","point"],[P.quanzhou,"Quanzhou","point"]],
 phPins:[ph([-12.36,20.46],"A Saharan manuscript")],
 stat:"In Fez he dictated his journey to Ibn Juzayy, who turned it into polished prose and finished it in 1355",
 body:"The sultan, Abu Inan, ordered the book. Ibn Battuta had lost his notes to pirates and the sea, so he worked largely from memory, up to 30 years after the events. Ibn Juzayy added poems and, scholars have found, copied passages from an earlier traveller, Ibn Jubayr, who had described Damascus and Mecca in the 1180s.",
 more:"Some doubted him in his own time: the historian Ibn Khaldun tells how people in Fez whispered that his tales of India were lies. Drag the ruler from Tangier to Quanzhou: over 11,000 km in a straight line. Ibn Battuta died in Morocco around 1368."}),
S({title:"Now explore",view:W,globe:[50,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Open the History map at 1300 and find the states he crossed: the Mamluks, the Mongol khanates, the Delhi Sultanate and Mali. Then try the Explorers tour to compare him with Marco Polo and Zheng He, or the Around the World in Eighty Days tour for a much faster journey."})];

const TOURS={brihla:{name:"The Travels of Ibn Battuta",short:"Ibn Battuta’s Travels",hint:"The Rihla of 1355, on the map: from Tangier to Mecca, Delhi, the Maldives, China and across the Sahara to Mali",steps:RIHLA}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub is set up as if the tour ran on that map (as in geoflock-tours-books1.js) */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- travellers on the route lines (geoflock-walkers.js) and a thermometer at Taghaza (geoflock-tourthermo.js) ---------- */
const CAMEL="🐪",SHIP="⛵";
const WALK={"The Travels of Ibn Battuta":{emoji:[CAMEL,SHIP,CAMEL,SHIP,CAMEL],name:"Ibn Battuta on the road",per:1},
 "Tangier, 1325":{emoji:CAMEL,name:"Ibn Battuta’s caravan"},"Alexandria and Cairo":{emoji:CAMEL,name:"Ibn Battuta on the road",per:1},
 "Damascus to Mecca":{emoji:CAMEL,name:"The Syrian pilgrim caravan"},"Iraq and Persia":{emoji:CAMEL,name:"Ibn Battuta’s caravan",per:1},
 "Down the Swahili coast":{emoji:SHIP,name:"A dhow on the monsoon",float:1,per:1},"The Golden Horde and Constantinople":{emoji:["⛵",CAMEL,CAMEL],name:"Ibn Battuta on the steppe",per:1},
 "Over the Hindu Kush":{emoji:CAMEL,name:"Ibn Battuta’s caravan",per:1},"Judge in Delhi":{emoji:CAMEL,name:"Ibn Battuta’s caravan",per:1},
 "Shipwreck at Calicut":{emoji:[CAMEL,SHIP],name:"The sultan’s embassy",per:1},"Judge of the Maldives":{emoji:[SHIP,SHIP,"🚶"],name:"Ibn Battuta at sea",per:1},
 "China: the far edge of the world":{emoji:["🚶",SHIP,SHIP],name:"Ibn Battuta at sea",per:1},"The Black Death":{emoji:CAMEL,name:"Ibn Battuta on the road",per:1},
 "Granada, 1350":{emoji:"🐎",name:"Ibn Battuta in al-Andalus",per:1},"Across the Sahara for salt":{emoji:CAMEL,name:"The salt caravan",per:3},
 "The court of Mali":{emoji:CAMEL,name:"Ibn Battuta in Mali",per:1},"A book from memory":{emoji:CAMEL,name:"Ibn Battuta going home",per:1}};
const THERMO={"Across the Sahara for salt":[[P.taghaza[0],P.taghaza[1],"Taghaza"],[P.fez[0],P.fez[1],"Fez"]]};
function addMovers(){try{const Wk=window.gfWalkers;if(Wk)for(const t in WALK)Wk["brihla|"+t]=Object.assign({size:26,per:2},WALK[t]);
 const Th=window.gfTourThermo;if(Th)for(const t in THERMO)Th["brihla|"+t]=THERMO[t]}catch(e){console.error(e)}}
addMovers();addEventListener("load",()=>setTimeout(addMovers,0));

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.brihla={mid:[
 {at:"Damascus to Mecca",st:"Damascus to Mecca",q:"Which city was the goal of Ibn Battuta’s first journey in 1325?",o:["Jerusalem","Mecca","Baghdad","Cairo"],a:1,why:"He set out to make the Hajj, the pilgrimage to Mecca.",kc:"sa"},
 {at:"Judge in Delhi",st:"Judge in Delhi",q:"Which ruler made Ibn Battuta a judge in Delhi?",o:["Akbar","Muhammad bin Tughluq","Timur","Babur"],a:1,why:"The Sultan of Delhi kept him for about seven years.",kc:"in"},
 {at:"Judge of the Maldives",st:"Judge of the Maldives",q:"What did the Maldives trade as money?",o:["Salt","Cowrie shells","Pepper","Silver coins"],a:1,why:"Cowries from the atolls were used as money as far away as West Africa.",kc:"mv"}],
 recap:[
 {q:"What were the houses of Taghaza built from?",o:["Mud","Salt","Stone","Wood"],a:1,why:"Rock salt was mined there and traded south for gold.",st:"Across the Sahara for salt",kc:"ml"},
 {q:"Mansa Sulayman of Mali was the brother of which famous ruler?",o:["Sundiata","Mansa Musa","Sonni Ali","Askia Muhammad"],a:1,why:"Mansa Musa had made his famous pilgrimage in 1324.",st:"The court of Mali",kc:"ml"},
 {q:"Who wrote down Ibn Battuta’s book in Fez?",o:["Ibn Khaldun","Ibn Juzayy","Ibn Jubayr","Ibn Sina"],a:1,why:"He finished it in 1355, on the sultan’s orders.",st:"A book from memory",kc:"ma"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "brihla|The Travels of Ibn Battuta":"Caravane Marco Polo.jpg","brihla|Tangier, 1325":"Strait of Gibraltar perspective.jpg",
 "brihla|Alexandria and Cairo":"Philip Galle - Lighthouse of Alexandria (Pharos of Alexandria) - 1572.jpg",
 "brihla|Damascus to Mecca":"Pilgrims begin this year's Hajj rituals with a circumambulation of the Kaaba (2025) (2).jpg",
 "brihla|Iraq and Persia":"Sunset in Baghdad, Iraq.jpg","brihla|Down the Swahili coast":"Dhow Zanzibar-7.jpg",
 "brihla|The Golden Horde and Constantinople":"Hagia Sophia Mars 2013.jpg",
 "brihla|Over the Hindu Kush":"Shah-i-Zinda, Samarkand (Shohi-Zinda majmuasi, Samarqand, Шахи Зинда).jpg",
 "brihla|Judge in Delhi":"Qutb Minar 2022.jpg","brihla|Shipwreck at Calicut":"Kuwait City Arabian Gulf Street Dhow 2.jpg",
 "brihla|Judge of the Maldives":"Male City Aerial, The Capital city of Maldives - panoramio.jpg","brihla|China: the far edge of the world":"West Lake, Hangzhou 2025.jpg",
 "brihla|The Black Death":"The Triumph of Death by Pieter Bruegel the Elder.jpg","brihla|Granada, 1350":"View of Albaicín from Alhambra. Granada, Spain.jpg",
 "brihla|Across the Sahara for salt":"Camel Tour on Erg Chebbi riding across the dunes.jpg","brihla|The court of Mali":"Djinguereber Mosque, Timbuktu.jpg",
 "brihla|A book from memory":"29610-Fez (28134041211) (qarawiyyin crop).jpg","brihla|Now explore":"Sahara satellite hires.jpg"};
const PIN={
 "Pilgrims at the Kaaba":"Supplicating Pilgrim at Masjid Al Haram. Mecca, Saudi Arabia.jpg","The Qutb Minar, Delhi":"Qutb Minar 2022.jpg","A dhow off Zanzibar":"Sail Boat Sunset Stone Town Zanzibar Oct26 OM3 1123.jpg",
 "The Djinguereber Mosque, Timbuktu":"Djinguereber Mosque, Timbuktu.jpg","Shah-i-Zinda, Samarkand":"Shah-i-Zinda, Samarkand (Shohi-Zinda majmuasi, Samarqand, Шахи Зинда).jpg","West Lake, Hangzhou":"West Lake, Hangzhou 2025.jpg",
 "Cairo on the Nile":"Cairo skyline, Nile River, Egypt.jpg","The Umayyad Mosque, Damascus":"Damascus, Syria, The Umayyad Mosque, The Courtyard, Islamic Art.jpg",
 "The Prophet’s Mosque, Medina":"Mezquita del Profeta, Medina, Arabia Saudita, 2025-05-22, DD 01.jpg","Tilework in Shiraz":"Nasir ol Molk Mosque (31233739431).jpg",
 "Old Muscat":"Old Muscat City View, Muscat, Oman3.jpg","Mogadishu’s Lido Beach":"Mogadishu banner Lido Beach.jpg","Hagia Sophia":"Hagia Sophia Mars 2013.jpg",
 "Riders of the steppe":"Jeźdźcy na stepie przed rozpoczęciem lokalnego festiwalu Naadam (01).jpg","The Ark of Bukhara":"Ark of Bukhara 2023.9.jpg",
 "Old Delhi":"Red Fort in Delhi 03-2016 img3.jpg","The Western Ghats in the monsoon":"Western Ghats in the monsoon.jpg","A Maldives atoll":"Maldives-Vakarufalhi.JPG",
 "Kandy’s Temple of the Tooth":"Dalada Maligawa Sri Lanka G.jpg","Tea fields near Hangzhou":"Tea plantations in Longjing, Hangzhou.jpg","Old Damascus":"Old Damascus 20.jpg",
 "The Alhambra’s carved ceilings":"Toit salle Abencerrages Alhambra Espagne.jpg","Chinguetti, a caravan town":"Chinguetti-Vue Goblale Vieille ville.jpg",
 "The Niger River":"Niger River View, Djenne (6861797).jpg","Timbuktu’s manuscripts":"Timbuktu-manuscripts-astronomy-mathematics.jpg","A Saharan manuscript":"Chinguetti-Manuscrit (3).jpg"};
/* new photos (GF_BRIHLA_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BRIHLA_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={brihla:"Djinguereber Mosque, Timbuktu.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
