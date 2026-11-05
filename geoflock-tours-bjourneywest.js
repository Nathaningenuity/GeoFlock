/* GeoFlock: a Mapped books tour: “Journey to the West” (16th century), and the real journey behind it.
   bjourneywest  "Journey to the West"   attributed to Wu Cheng’en, earliest surviving edition 1592
   The novel’s pilgrims (the monk Tripitaka, Monkey, Pigsy and Sandy) are set beside the real monk Xuanzang, who left
   Chang’an for India around 629 and came home in 645: the Hexi Corridor and the Gobi, Gaochang and the Flaming Mountains
   near Turpan, the Tian Shan, the Western Turks’ khan at Suyab, Samarkand, Bamiyan, Gandhara, Nalanda and Harsha’s India,
   then home over the Pamirs and along the Taklamakan. The novel is summarised in our own words; where it departs from
   history, or where scholars disagree (the author, the start year, where Monkey comes from), the card says so.
   Built like geoflock-tours-books1.js (same step helper, fields, photo maps and Tours-page cover). Stops about the 7th
   century lay that time’s states over the Relief map with gfHistYear (geoflock-booktours-relief.js) instead of
   mode:"history", which would turn the whole tour into a History-map tour (geoflock-tourhist.js). Xuanzang walks his route
   and the novel’s pilgrims walk theirs (window.gfWalkers, geoflock-walkers.js); Turpan and Ürümqi get thermometers on the
   Flaming Mountains stop (window.gfTourThermo, geoflock-tourthermo.js); height cross-sections in the card (xsec) cross the
   Turpan Depression, the Tian Shan, the Hindu Kush and the Pamirs; the ruler (gfRuler) spans the Taklamakan.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry).
   WANT_PHOTOS: [
    ["Flaming Mountains, Turpan (any photo of the red ridges)","The Flaming Mountains"],
    ["Gaochang ruins (any photo of the ruined city near Turpan)","A king who would not let him go"],
    ["Giant Wild Goose Pagoda, Xi’an (any photo)","Home with 657 texts"],
    ["Xuanzang w.jpg (the Tokyo National Museum portrait of Xuanzang with his book-carrier)","Journey to the West"],
    ["Vulture Peak, Rajgir (any photo of Gridhrakuta)","Thunderclap Monastery"],
    ["Taklamakan Desert (any photo of the dunes)","Home along the Taklamakan"],
    ["Kizil Caves (any photo)","Kucha and the icy Tian Shan"] ] */
window.GF_BJOURNEYWEST_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const ID="bjourneywest",COL="#a8603a",W=[52,5,122,50];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* places, [lon, lat] */
const P={changan:[108.94,34.27],goose:[108.96,34.22],wuwei:[102.64,37.93],guazhou:[95.78,40.52],hami:[93.51,42.83],gaochang:[89.53,42.85],turpan:[89.19,42.95],
 flame:[89.6,42.92],ayding:[89.27,42.68],urumqi:[87.62,43.83],karashahr:[86.57,42.06],kucha:[82.96,41.72],aksu:[80.26,41.17],bedel:[78.43,41.4],issyk:[77.3,42.4],
 suyab:[75.2,42.81],taraz:[71.37,42.9],tashkent:[69.24,41.3],samarkand:[66.97,39.65],irongate:[66.95,38.27],termez:[67.28,37.22],balkh:[66.9,36.76],
 bamiyan:[67.83,34.83],kapisa:[69.27,35.0],jalal:[70.45,34.43],peshawar:[71.58,34.01],taxila:[72.82,33.75],srinagar:[74.8,34.08],mathura:[77.67,27.49],
 kanauj:[79.92,27.05],prayag:[81.88,25.43],sravasti:[82.04,27.52],lumbini:[83.28,27.47],kushi:[83.89,26.74],sarnath:[83.02,25.38],bodhgaya:[84.99,24.7],
 nalanda:[85.44,25.14],vulture:[85.44,25.0],tamra:[87.92,22.3],kanchi:[79.7,12.83],valabhi:[71.88,21.88],ishkashim:[71.61,36.72],zorkul:[73.7,37.45],
 tashkurgan:[75.23,37.77],kashgar:[75.99,39.47],yarkand:[77.24,38.42],khotan:[79.92,37.11],niya:[82.7,37.07],loulan:[89.9,40.5],dunhuang:[94.66,40.14],
 huaguo:[119.27,34.64],huaian:[119.02,33.6]};
/* Xuanzang’s route: out by the northern oasis road and the Western Turks’ lands, home over the Pamirs and the southern road */
const OUT=[P.changan,[105.7,34.6],[103.83,36.06],P.wuwei,[100.45,38.93],[98.5,39.75],P.guazhou,[94.6,41.6],P.hami,P.gaochang,P.karashahr,P.kucha,P.aksu,P.bedel,[77.6,42.15],P.issyk,P.suyab,P.taraz,P.tashkent,P.samarkand,P.irongate,P.termez,P.balkh,P.bamiyan,P.kapisa,P.jalal,P.peshawar,P.taxila,P.srinagar,[76.0,31.5],P.mathura,P.kanauj,P.sravasti,P.lumbini,P.kushi,P.sarnath,P.bodhgaya,P.nalanda];
const HOME=[P.prayag,P.kanauj,[75.6,31.3],P.taxila,[72.3,34.0],P.kapisa,[69.6,36.0],[70.5,37.0],P.ishkashim,P.zorkul,P.tashkurgan,P.kashgar,P.yarkand,P.khotan,P.niya,[86.5,39.0],P.loulan,P.dunhuang,P.guazhou,P.wuwei,[103.83,36.06],P.changan];
const INDIA=[P.nalanda,P.tamra,[85.8,20.3],[82.2,17.0],P.kanchi,[75.5,15.5],[74.0,19.5],P.valabhi,[73.5,24.5],[77.5,25.5],P.nalanda];

const STEPS=[
S({title:"Journey to the West",view:W,globe:[85,32,1.6],card:"left",
 lines:[{coords:OUT,kind:"flow"},{coords:HOME,kind:"flow"}],
 pins:[[P.changan,"Chang’an (Xi’an)","point"],[P.turpan,"Turpan","point"],[P.samarkand,"Samarkand","point"],[P.nalanda,"Nalanda","point"],[P.kashgar,"Kashgar","point"]],
 phPins:[ph([108.95,34.26],"The walls of Xi’an"),ph([94.8,40.04],"Mogao Caves, Dunhuang"),ph([66.98,39.65],"The Registan, Samarkand"),ph([67.83,34.83],"Buddhas of Bamiyan"),ph([85.44,25.14],"Nalanda"),ph([75.99,39.47],"Kashgar")],
 stat:"One of China’s four great classic novels grew out of a real monk’s 16-year walk to India and back",
 body:"In about 629 the Buddhist monk Xuanzang slipped out of the Tang capital to find the true scriptures in India. He came home in 645 with hundreds of texts and a famous account of the lands he saw. Some 950 years later, a 100-chapter comic novel turned him into a timid monk guarded by a magical monkey. Watch him walk his route.",
 more:"The novel’s earliest surviving edition was printed in Nanjing in 1592, without an author’s name. Since the 1920s it has usually been credited to Wu Cheng’en (about 1500–1582), but scholars still debate it. Xuanzang’s own record, the Great Tang Records on the Western Regions (646), is still read by archaeologists and historians."}),
S({title:"Monkey, Pigsy and Sandy",view:[60,10,125,46],globe:[100,32,1.8],card:"left",
 lines:[{coords:[P.changan,P.dunhuang,P.flame,P.kucha,P.kashgar,[72,36],P.peshawar,P.kanauj,P.vulture],kind:"dash"}],
 pins:[[P.huaguo,"Huaguo Shan: Monkey’s Flower-Fruit Mountain (claimed)","point"],[P.huaian,"Huai’an: home of Wu Cheng’en","point"],[P.changan,"Chang’an: the emperor sends Tripitaka","point"],[P.vulture,"Vulture Peak: the Buddha’s ‘Thunderclap Monastery’","point"]],
 iconPins:[ic(P.huaguo,"paw"),ic(P.huaian,"book")],
 phPins:[ph([108.5,33.8],"Monkeys of the Qinling Mountains")],
 stat:"In the novel, the monk Tripitaka needs three monstrous disciples and a dragon-horse to survive 81 ordeals",
 body:"Sun Wukong, the Monkey King, was born from a stone egg, learned 72 transformations and wrecked Heaven before the Buddha trapped him under a mountain for 500 years. Pigsy (Zhu Bajie) is greedy and lazy, Sandy (Sha Wujing) is a quiet river ogre, and a dragon-prince serves as the monk’s white horse. Watch them walk.",
 more:"Where Monkey comes from is an old argument. Hu Shi thought he was borrowed from Hanuman, the monkey hero of India’s Ramayana; Lu Xun pointed to Chinese monkey legends. Many scholars now see a mix of both. Lianyungang, near Wu Cheng’en’s home town, claims the real Flower-Fruit Mountain."}),
S({title:"Leaving Chang’an against orders",view:[90,26,120,44],globe:[106,35,3.4],card:"left",gfHistYear:{y:640,focus:"chn",labels:[{gk:"chn",name:"Tang China",at:[112,30.5]}]},
 lines:[{coords:[P.changan,[105.7,34.6],[103.83,36.06],P.wuwei],kind:"flow"}],
 pins:[[P.changan,"Chang’an","point"],[P.goose,"Giant Wild Goose Pagoda (built 652)","point"],[[103.83,36.06],"Lanzhou","point"],[P.wuwei,"Liangzhou (Wuwei)","point"]],
 phPins:[ph([108.96,34.22],"Xi’an’s city walls")],
 stat:"Chang’an, with perhaps a million people, was one of the biggest cities on Earth when Xuanzang left it",
 body:"The new Tang dynasty (coloured) had banned travel beyond its frontier, and Xuanzang’s request to go was refused. He went anyway, travelling by night and hiding from patrols. The novel turns this round: there the emperor Taizong himself sends the monk off with a golden begging bowl and a farewell feast.",
 more:"Sources disagree on the year he left: most say 629, some 627. Today’s Xi’an stands on the old capital; its massive walls in the photo were rebuilt under the Ming dynasty in the 1300s, long after Xuanzang."}),
S({title:"Alone across the Gobi",view:[88,36,106,45],globe:[96,41,3.8],card:"left",
 lines:[{coords:[P.wuwei,[100.45,38.93],[98.5,39.75],P.guazhou,[94.6,41.6],P.hami],kind:"flow"}],
 pins:[[P.guazhou,"Guazhou and the Jade Gate frontier","point"],[P.hami,"Hami (Yiwu)","point"],[[94.6,41.6],"The Mohe-yanqi desert","point"],[[98.29,39.8],"Jiayuguan","point"]],
 iconPins:[ic([94.6,41.6],"sun")],
 phPins:[ph([98.29,39.8],"Jiayuguan fort")],
 stat:"Past the last watchtowers Xuanzang dropped his water bag and went four nights and five days without a drink",
 body:"Beyond Guazhou only five beacon towers guarded the road. Sneaking past them, he crossed the stony Gobi alone with an old red horse. Lost and dying of thirst, he lay down and prayed; at night the horse found grass and a pool. This stretch of the Hexi Corridor was the doorway from China to the west.",
 more:"The story comes from his biography, written by his disciples. The fort of Jiayuguan in the photo was built by the Ming in 1372, but it guards the same narrow corridor between mountains and desert."}),
S({title:"A king who would not let him go",view:[84,39,98,46],globe:[90,43,4.5],card:"left",
 lines:[{coords:[P.hami,[91.5,43],P.gaochang],kind:"flow"}],
 pins:[[P.gaochang,"Gaochang","point"],[P.hami,"Hami","point"],[P.turpan,"Turpan","point"]],
 iconPins:[ic(P.gaochang,"gold")],
 stat:"The king of Gaochang loved the monk’s preaching so much that he refused to let him leave",
 body:"Qu Wentai, king of this rich oasis state, wanted Xuanzang as his kingdom’s teacher for life. Xuanzang went on hunger strike until the king gave in. Then Qu Wentai became his sworn brother and sent him off with gold, silver, silk, horses, servants and letters to two dozen rulers along the road.",
 more:"Gaochang’s mud-brick ruins still stand east of Turpan. The kingdom did not last: in 640, while Xuanzang was in India, the Tang conquered it."}),
S({title:"The Flaming Mountains",view:[80,38.5,97,47],globe:[89,43,4.2],card:"left",
 xsec:{title:"From Ürümqi over the Tian Shan into the Turpan Depression",pts:[[P.urumqi[0],P.urumqi[1],"Ürümqi"],[88.15,43.37,"Dabancheng"],[88.6,43.12],[P.turpan[0],P.turpan[1],"Turpan"],[P.ayding[0],P.ayding[1],"Ayding Lake"]],mark:0,note:"The dashed line marks sea level. Ayding Lake, about 154 m below the sea, is the lowest point in China; averaged heights read a little high."},
 pins:[[P.flame,"The Flaming Mountains","point"],[P.turpan,"Turpan","point"],[P.ayding,"Ayding Lake","point"],[P.urumqi,"Ürümqi","point"]],
 iconPins:[ic(P.flame,"flame")],
 stat:"The one place in the novel you can still visit: a ridge of red rock in one of the hottest places in China",
 body:"In the novel, flames 800 li wide block the pilgrims’ road. Monkey must trick a magic palm-leaf fan out of Princess Iron Fan to put them out, and is tricked back more than once. The real Flaming Mountains glow red in the afternoon sun at the edge of the Turpan Depression, which sinks below sea level (see the cross-section).",
 more:"Click the two thermometers and compare their climate charts: Turpan, in its sunken basin, is far hotter in summer than Ürümqi on the other side of the mountains. Turpan’s farmers water their famous grapes with karez, underground canals that bring snowmelt from the Tian Shan."}),
S({title:"Kucha and the icy Tian Shan",view:[72,38,88,45.5],globe:[80,42,3.6],card:"left",
 xsec:{title:"From Aksu over the Bedel Pass to Lake Issyk-Kul",pts:[[P.aksu[0],P.aksu[1],"Aksu"],[79.6,41.25],[79,41.35],[P.bedel[0],P.bedel[1],"Bedel Pass"],[78,41.75],[77.6,42.15,"Barskoon"],[77.5,42.4,"Issyk-Kul"]],mark:4000,note:"The dashed line marks 4,000 m. The pass itself is about 4,280 m; averaged heights read lower."},
 lines:[{coords:[P.karashahr,P.kucha,P.aksu,P.bedel,[77.6,42.15],P.issyk],kind:"flow"}],
 pins:[[P.kucha,"Kucha","point"],[[82.5,41.79],"Kizil Caves","point"],[P.bedel,"Bedel Pass","point"],[P.issyk,"Lake Issyk-Kul","point"]],
 iconPins:[ic(P.bedel,"snow")],
 phPins:[ph([77.3,42.4],"Lake Issyk-Kul")],
 stat:"Crossing the glaciers of the Tian Shan took seven days and killed a good part of his party",
 body:"First he stayed in Kucha, a Buddhist kingdom famous for its music and its painted cave temples at Kizil. Then he turned north over the ice. His biography says that three or four in every ten of his companions died of cold. Beyond the pass lay the great lake Issyk-Kul, which never freezes.",
 more:"Most historians place his crossing at the Bedel Pass, though not all agree. The cross-section shows how the road climbs from the Tarim basin to over 4,000 m."}),
S({title:"The khan of the Western Turks",view:[64,36,84,48],globe:[74,42,3.4],card:"left",gfHistYear:{y:640,focus:"gok",labels:[{gk:"gok",name:"Turkic khaganates",at:[76,46]}]},
 lines:[{coords:[P.issyk,P.suyab,P.taraz,P.tashkent],kind:"flow"}],
 pins:[[P.suyab,"Suyab (near Tokmak)","point"],[P.taraz,"Talas (Taraz)","point"],[P.tashkent,"Chach (Tashkent)","point"]],
 iconPins:[ic(P.suyab,"person")],
 phPins:[ph([75.25,42.75],"Burana Tower")],
 stat:"At Suyab the most powerful ruler of Central Asia, the khan of the Western Turks, received the monk in a great tent",
 body:"The Western Turkic khaganate (coloured) then ruled the steppe and the oasis cities from the Tian Shan to the Oxus. Its khan, Tong Yabghu, sat in a tent decorated with gold flowers, served the monk vegetarian food and gave him an interpreter and letters for the road south.",
 more:"This meeting is one reason some scholars think he set out in 627, not 629: Tong Yabghu is usually said to have been murdered in 628. Suyab’s ruins lie at Ak-Beshim, near Tokmak in Kyrgyzstan; the Burana Tower nearby is a later minaret, of the 11th century."}),
S({title:"Samarkand and the Iron Gate",view:[58,33,76,44],globe:[67,38.5,3.8],card:"left",
 lines:[{coords:[P.tashkent,P.samarkand,P.irongate,P.termez,P.balkh],kind:"flow"}],
 pins:[[P.samarkand,"Samarkand","point"],[P.irongate,"The Iron Gate pass","point"],[P.termez,"Termez, on the Oxus","point"],[P.balkh,"Balkh","point"]],
 iconPins:[ic(P.samarkand,"gem")],
 phPins:[ph([66.98,39.66],"Shah-i-Zinda, Samarkand")],
 stat:"In Samarkand, a rich city of Sogdian merchants, the king and people followed the Zoroastrian fire religion",
 body:"Sogdians were the great traders of the Silk Road, and Samarkand was their capital. Xuanzang says that when his two young monks entered a temple, locals chased them with fire; the king punished the attackers and soon asked to hear the monk preach. South of the city the road squeezes through a narrow gorge called the Iron Gate.",
 more:"Balkh, ‘the mother of cities’, was full of Buddhist monasteries when he passed. The Registan and Shah-i-Zinda in today’s Samarkand were built centuries later, under Timur and his successors."}),
S({title:"The giant Buddhas of Bamiyan",view:[62,31,76,39],globe:[68,35,4.5],card:"left",
 xsec:{title:"From Balkh over the Hindu Kush to Bamiyan and Kapisa",pts:[[P.balkh[0],P.balkh[1],"Balkh"],[67.4,36.2],[67.6,35.5],[P.bamiyan[0],P.bamiyan[1],"Bamiyan"],[68.4,34.85,"Shibar pass"],[P.kapisa[0],P.kapisa[1],"Kapisa (Bagram)"]],mark:3000,note:"The dashed line marks 3,000 m. The real passes reach more than 3,000 m; averaged heights read lower."},
 lines:[{coords:[P.balkh,P.bamiyan,P.kapisa,P.jalal],kind:"flow"}],
 pins:[[P.bamiyan,"Bamiyan","point"],[P.kapisa,"Kapisa","point"]],
 iconPins:[ic(P.bamiyan,"statue")],
 phPins:[ph([67.9,34.82],"Students in Bamyan")],
 stat:"Xuanzang saw two colossal Buddhas carved into Bamiyan’s cliff, their golden colour shining in the sun",
 body:"His description, written 1,400 years ago, is one of the best records of the two statues, about 55 m and 38 m tall. He crossed the Hindu Kush to reach them, through snow and robbers. In March 2001 the Taliban blew them up; only the empty niches remain.",
 more:"Xuanzang also wrote of a third, reclining Buddha nearly 300 m long near Bamiyan. Archaeologists have been searching for it for years; it has not been found."}),
S({title:"Gandhara and Kashmir",view:[64,29,82,38.5],globe:[73,34,4.2],card:"left",
 lines:[{coords:[P.jalal,P.peshawar,P.taxila,P.srinagar],kind:"flow"}],
 pins:[[P.peshawar,"Peshawar (Purushapura)","point"],[P.taxila,"Taxila","point"],[P.srinagar,"Kashmir: two years of study","point"],[[71.1,34.08],"Khyber Pass","point"]],
 iconPins:[ic(P.srinagar,"book"),ic(P.taxila,"scroll")],
 phPins:[ph([71.1,34.08],"The Khyber Pass")],
 stat:"Gandhara, where Greek and Indian art had met, was already in decline when Xuanzang arrived",
 body:"Down through the Khyber Pass he reached Peshawar, the old capital of the Kushan king Kanishka, and found its great stupa and many monasteries half deserted. He spent about two years studying in Kashmir. The statue in the photo, from Gandhara, shows the Buddha guarded by a figure modelled on the Greek hero Heracles.",
 more:"Gandhara’s Buddhist art blended Greek, Persian and Indian styles after Alexander’s conquests. Many of its monasteries had been ruined in invasions of the 5th and 6th centuries."}),
S({title:"Harsha’s India",view:[72,20,92,32],globe:[82,26,3.4],card:"left",gfHistYear:{y:640,focus:"harsha",labels:[{gk:"harsha",name:"Harsha’s kingdom",at:[80.5,28.6]}]},
 lines:[{coords:[P.mathura,P.kanauj,P.sravasti,P.lumbini,P.kushi,P.sarnath,P.bodhgaya],kind:"flow"}],
 pins:[[P.kanauj,"Kanauj: Harsha’s capital","point"],[P.prayag,"Prayag: Harsha’s great giving","point"],[P.lumbini,"Lumbini: the Buddha’s birthplace","point"],[P.bodhgaya,"Bodh Gaya: his enlightenment","point"],[P.sarnath,"Sarnath: his first sermon","point"],[P.kushi,"Kushinagar: his death","point"]],
 iconPins:[ic(P.kanauj,"person"),ic(P.prayag,"gold")],
 phPins:[ph([83.28,27.47],"Lumbini"),ph([83.01,25.31],"The Ganges at Varanasi")],
 stat:"Xuanzang visited every place linked with the Buddha’s life, and became the guest of north India’s greatest king",
 body:"King Harsha ruled much of the Ganges plain from Kanauj. In 643 he held a great assembly there, where Xuanzang, it is said, debated for days without being defeated. At Prayag, where the Ganges meets the Yamuna, the king gave away his treasure to monks, Brahmins and the poor every five years; Xuanzang saw it happen.",
 more:"His records of the Buddhist holy places, with distances and directions, guided British archaeologists such as Alexander Cunningham when they searched for the sites in the 1800s."}),
S({title:"Nalanda",view:[77,10,94,30],globe:[84,22,3],card:"left",gfRuler:{a:P.nalanda,b:P.kanchi},
 lines:[{coords:INDIA,kind:"flow"}],
 pins:[[P.nalanda,"Nalanda","point"],[P.kanchi,"Kanchipuram","point"],[P.tamra,"Tamralipti, a seaport","point"],[P.valabhi,"Valabhi","point"]],
 iconPins:[ic(P.nalanda,"book")],
 phPins:[ph([84.99,24.7],"Bodh Gaya")],
 stat:"At Nalanda, the greatest Buddhist university, thousands of monks studied, and Xuanzang stayed about five years",
 body:"He studied Yogacara philosophy and Sanskrit under the aged abbot Shilabhadra, and was honoured as one of the university’s leading teachers. He also toured India, south as far as Kanchipuram (drag the ruler) and west to Gujarat: follow the loop.",
 more:"Xuanzang says some 10,000 people lived at Nalanda; modern historians think that is generous. The monastery was sacked around 1200 and abandoned. Its ruins are a World Heritage Site, and a new Nalanda University opened nearby in 2014."}),
S({title:"Over the Pamirs",view:[66,34,82,41.5],globe:[74,37.5,4],card:"left",
 xsec:{title:"From the Wakhan over the Pamirs to Kashgar",pts:[[P.ishkashim[0],P.ishkashim[1],"Ishkashim"],[72.5,37.0],[P.zorkul[0],P.zorkul[1],"Lake Zorkul"],[74.5,37.55],[P.tashkurgan[0],P.tashkurgan[1],"Tashkurgan"],[75.05,38.45],[P.kashgar[0],P.kashgar[1],"Kashgar"]],mark:4000,note:"The dashed line marks 4,000 m. Kashgar lies at about 1,300 m, at the foot of the ‘Roof of the World’."},
 lines:[{coords:[P.taxila,[72.3,34.0],P.kapisa,[69.6,36.0],[70.5,37.0],P.ishkashim,P.zorkul,P.tashkurgan,P.kashgar],kind:"flow"}],
 pins:[[P.zorkul,"Lake Zorkul: the ‘Great Dragon Lake’?","point"],[P.tashkurgan,"Tashkurgan","point"],[P.kashgar,"Kashgar","point"],[[72.43,34.05],"The Indus crossing: texts lost","point"]],
 iconPins:[ic(P.zorkul,"mountain"),ic([72.43,34.05],"scroll")],
 phPins:[ph([75.4,37.4],"The Pamir highway")],
 stat:"Coming home in 643–44 with an elephant and his books, he climbed through the Wakhan onto the Pamirs",
 body:"On the Indus a boat overturned and about 50 manuscripts were lost. Then he crossed the high Pamirs, where he describes a great lake between snowy mountains, then Tashkurgan and Kashgar. The cross-section shows the climb onto the ‘Roof of the World’.",
 more:"His ‘Great Dragon Lake’ is often identified with Lake Zorkul, on today’s border between Tajikistan and Afghanistan, but scholars disagree. The novel has its own river disaster on the way home, with an old turtle and soaked scriptures (see Thunderclap Monastery)."}),
S({title:"Home along the Taklamakan",view:[72,33,112,44],globe:[90,39,2.6],card:"left",gfRuler:{a:[78.5,38.9],b:[88.4,39.4]},
 lines:[{coords:[P.kashgar,P.yarkand,P.khotan,P.niya,[86.5,39],P.loulan,P.dunhuang,P.guazhou,P.wuwei,[103.83,36.06],P.changan],kind:"flow"}],
 pins:[[P.khotan,"Khotan: waiting for the emperor’s pardon","point"],[P.niya,"Niya","point"],[P.dunhuang,"Dunhuang","point"],[P.changan,"Chang’an, 645","point"],[[83.5,39],"The Taklamakan","point"]],
 iconPins:[ic([83.5,39],"sun")],
 phPins:[ph([94.8,40.04],"Mogao Caves, Dunhuang"),ph([94.81,40.05],"A Tang mural in the Mogao Caves")],
 stat:"The Taklamakan, about 1,000 km across, is one of the largest sand deserts on Earth (drag the ruler)",
 body:"Xuanzang took the southern road around it, from oasis to oasis. At Khotan he wrote to the emperor to confess that he had left without permission, and waited months for an answer. It was a warm welcome: in 645 crowds lined Chang’an’s streets to see him and his 657 texts.",
 more:"Emperor Taizong asked him to become an official; he chose to translate instead, and with a team turned some 75 works into Chinese before his death in 664. The Giant Wild Goose Pagoda in Xi’an was built in 652 to hold his books."}),
S({title:"Thunderclap Monastery",view:[82,22.5,89,27.5],globe:[85.4,25,6],card:"left",gfRuler:{a:P.nalanda,b:P.vulture},
 pins:[[P.vulture,"Vulture Peak, Rajgir","point"],[P.nalanda,"Nalanda","point"],[P.bodhgaya,"Bodh Gaya","point"]],
 iconPins:[ic(P.vulture,"mountain")],
 phPins:[ph([84.99,24.7],"Bodh Gaya")],
 stat:"The novel’s pilgrims end their 14 years at Vulture Peak, a real hill a short walk from Nalanda",
 body:"In the novel the Buddha lives on Vulture Peak in the Thunderclap Monastery. The first scriptures the pilgrims receive have blank pages, because they would not pay a fee; they have to go back and hand over the begging bowl. On the way home one last ordeal, a dunking in a river by an old turtle, makes the number of sufferings up to 81. Then all of them are rewarded with holy ranks.",
 more:"The real Vulture Peak, near Rajgir, is where the Buddha is said to have preached many sermons, and Xuanzang climbed it. The novel’s jokes about greedy monks are part of what makes it a satire as well as an adventure."}),
S({title:"Now explore",view:W,globe:[85,32,1.6],
 lines:[{coords:OUT,kind:"dash"},{coords:HOME,kind:"dash"}],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch to the Elevation map and trace Xuanzang’s route: the Gobi, the Tian Shan, the Hindu Kush, the Pamirs and the Taklamakan. Then try The Silk Roads tour, Peter Frankopan’s history of the routes Xuanzang walked."})];

/* Xuanzang walks his route; the novel’s pilgrims walk theirs (geoflock-walkers.js) */
const MONK={skin:"#d2a274",dark:"#a87850",hair:"#c99a6c",cloth:"#b5652a",wide:1.05};
const NOVEL=[P.changan,P.dunhuang,P.flame,P.kucha,P.kashgar,[72,36],P.peshawar,P.kanauj,P.vulture];
const WALK={
 "Journey to the West":{fig:MONK,name:"Xuanzang",size:44,per:1,dur:22000},
 "Monkey, Pigsy and Sandy":{emoji:["🧔","🐷","🐴","🐒"],name:"Tripitaka’s pilgrims: Sandy, Pigsy, the white horse and Monkey",size:26,per:1,dur:20000,lines:[NOVEL,NOVEL,NOVEL,NOVEL]},
 "Leaving Chang’an against orders":{fig:MONK,name:"Xuanzang, travelling by night",size:46,per:1},
 "Alone across the Gobi":{fig:MONK,name:"Xuanzang and his old red horse",size:46,per:1},
 "Kucha and the icy Tian Shan":{fig:MONK,name:"Xuanzang",size:46,per:1},
 "Samarkand and the Iron Gate":{fig:MONK,name:"Xuanzang",size:46,per:1},
 "Over the Pamirs":{fig:MONK,name:"Xuanzang on his way home",size:46,per:1},
 "Home along the Taklamakan":{emoji:"🐪",name:"Xuanzang’s caravan, loaded with books",size:26,per:1}};
const addWalk=()=>{try{if(!window.gfWalkers)return;for(const t in WALK)window.gfWalkers[ID+"|"+t]=WALK[t]}catch(e){}};
/* thermometers (geoflock-tourthermo.js): Turpan in its basin against Ürümqi over the mountains */
const THERMO={"The Flaming Mountains":[[P.turpan[0],P.turpan[1],"Turpan"],[P.urumqi[0],P.urumqi[1],"Ürümqi"]]};
const addThermo=()=>{try{if(!window.gfTourThermo)return;for(const t in THERMO)window.gfTourThermo[ID+"|"+t]=THERMO[t]}catch(e){}};
addWalk();addThermo();addEventListener("load",()=>setTimeout(()=>{addWalk();addThermo()},500));

PS_TOURS[ID]={name:"Journey to the West",short:"Journey to the West",hint:"The 16th-century novel and the real monk behind it, on the map: Xuanzang’s walk from Chang’an to India and back, 629–645, past the Flaming Mountains, Samarkand, Bamiyan and Nalanda",
 map:{mode:"relief"},group:"books",col:COL,steps:STEPS,stopModes:false,alsoOn:[]};
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER,k=o.indexOf(ID);if(k>=0)o.splice(k,1);o.push(ID)}
const mine=()=>typeof ps!=="undefined"&&ps&&ps.tour===ID;

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined")TOURQ[ID]={mid:[
 {at:"The Flaming Mountains",st:"The Flaming Mountains",q:"Near which oasis city are the real Flaming Mountains?",o:["Kashgar","Turpan","Dunhuang","Khotan"],a:1,why:"At the edge of the Turpan Depression.",kc:"cn"},
 {at:"Samarkand and the Iron Gate",st:"Samarkand and the Iron Gate",q:"Samarkand is in which country today?",o:["Kazakhstan","Uzbekistan","Tajikistan","Afghanistan"],a:1,why:"It was the capital of the Sogdian merchants.",kc:"uz"},
 {at:"Nalanda",st:"Nalanda",q:"What was Nalanda?",o:["A royal palace","A Buddhist university","A fortress","A trading port"],a:1,why:"Xuanzang studied there for about five years.",kc:"in"}],
 recap:[
 {q:"What is the name of the Monkey King in Journey to the West?",o:["Zhu Bajie","Sun Wukong","Sha Wujing","Erlang Shen"],a:1,why:"Zhu Bajie is Pigsy and Sha Wujing is Sandy.",st:"Monkey, Pigsy and Sandy",kc:"cn"},
 {q:"In which country were the giant Buddhas of Bamiyan?",o:["Pakistan","Afghanistan","Iran","India"],a:1,why:"The Taliban destroyed them in 2001.",st:"The giant Buddhas of Bamiyan",kc:"af"},
 {q:"Which mountain lake did Xuanzang pass after crossing the Tian Shan?",o:["Issyk-Kul","Baikal","Balkhash","Qinghai"],a:0,why:"In today’s Kyrgyzstan; it never freezes.",st:"Kucha and the icy Tian Shan",kc:"kg"}]}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "Journey to the West":"Mogao Caves (54376969262).jpg",
 "Monkey, Pigsy and Sandy":"Golden Snub-nosed Monkeys, Qinling Mountains - China.jpg",
 "Leaving Chang’an against orders":"Xi'an city walls (59626).jpg",
 "Alone across the Gobi":"Camels in Gobi Desert 02.jpg",
 "Kucha and the icy Tian Shan":"Lake Issyk-Kul, Kyrgyzstan.jpg",
 "The khan of the Western Turks":"Burana Tower, Kyrgyzstan.jpg",
 "Samarkand and the Iron Gate":"Registan 01.jpg",
 "The giant Buddhas of Bamiyan":"Buddhas of Bamiyan D39.jpg",
 "Gandhara and Kashmir":"Buddha-Vajrapani-Herakles.JPG",
 "Harsha’s India":"Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg",
 "Nalanda":"Temple 3 - Sariputta Stupa - Nalanda Mahavihara (10).jpg",
 "Over the Pamirs":"Border Pamir highway China.jpg",
 "Home along the Taklamakan":"DunhuangCave323.jpg",
 "Thunderclap Monastery":"Buddha in Sarnath Museum (Dhammajak Mutra).jpg",
 "Now explore":"Kashgar Old Town.jpg"};
const CAP={
 "Journey to the West":"The Mogao Caves at Dunhuang, a Buddhist shrine on the road Xuanzang took home",
 "Monkey, Pigsy and Sandy":"Golden snub-nosed monkeys in the Qinling Mountains, south of Xi’an",
 "Leaving Chang’an against orders":"Xi’an’s walls, rebuilt under the Ming on the site of Tang Chang’an",
 "Alone across the Gobi":"Camels in the Gobi",
 "Kucha and the icy Tian Shan":"Lake Issyk-Kul and the Tian Shan, Kyrgyzstan",
 "The khan of the Western Turks":"The Burana Tower, an 11th-century minaret near the ruins of Suyab",
 "Samarkand and the Iron Gate":"The Registan, Samarkand, built long after Xuanzang’s visit",
 "The giant Buddhas of Bamiyan":"Bamiyan’s cliff and its Buddha niches",
 "Gandhara and Kashmir":"The Buddha with Vajrapani, shown as Heracles: Gandhara, 2nd century",
 "Harsha’s India":"Votive stupas at Bodh Gaya, where the Buddha found enlightenment",
 "Nalanda":"The Sariputta Stupa at Nalanda",
 "Over the Pamirs":"The Pamir highway near the Chinese border",
 "Home along the Taklamakan":"A Mogao cave painting from about the 8th century",
 "Thunderclap Monastery":"A 5th-century Buddha from Sarnath",
 "Now explore":"Kashgar’s old town"};
const PIN={
 "The walls of Xi’an":"Xi'an city walls (59626).jpg","Mogao Caves, Dunhuang":"Mogao Caves (54376969262).jpg","The Registan, Samarkand":"Registan 01.jpg",
 "Buddhas of Bamiyan":"Buddhas of Bamiyan D39.jpg","Nalanda":"Temple 3 - Sariputta Stupa - Nalanda Mahavihara (10).jpg","Kashgar":"Kashgar Old Town.jpg",
 "Monkeys of the Qinling Mountains":"Golden Snub-nosed Monkeys, Qinling Mountains - China.jpg","Xi’an’s city walls":"Xi'an city walls (59626).jpg",
 "Jiayuguan fort":"JiayuguanFort.jpg","Lake Issyk-Kul":"Lake Issyk-Kul, Kyrgyzstan.jpg","Burana Tower":"Burana Tower, Kyrgyzstan.jpg",
 "Shah-i-Zinda, Samarkand":"Shah-i-Zinda, Samarkand (Shohi-Zinda majmuasi, Samarqand, Шахи Зинда).jpg","Students in Bamyan":"Afghan students in Bamyan.jpg",
 "The Khyber Pass":"Khyber Pass.jpg","Lumbini":"Lumbini Maya Devi Temple 1.jpg","The Ganges at Varanasi":"Varanasi Munshi Ghat3.jpg",
 "Bodh Gaya":"Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg","The Pamir highway":"Border Pamir highway China.jpg",
 "A Tang mural in the Mogao Caves":"DunhuangCave323.jpg"};
const PHOTOS=window.GF_BJOURNEYWEST_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C="Mogao Caves (54376969262).jpg";
 const set=()=>{if(TOUR_THUMBS[ID])return;const p=findP(C);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[ID]=p.d};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
