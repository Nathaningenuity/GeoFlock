/* GeoFlock: Mapped books tour.
   b80days  "Around the World in Eighty Days"   Jules Verne, 1872 (in instalments in Le Temps; as a book in 1873)
   Each stop follows one leg of Phileas Fogg’s race, eastward from London. The novel is summarised in our own words and
   presented as Verne’s story; where the real world of 1872 differs (the railway across India was already finished, there
   were no time zones yet, there is no balloon in the book) the card says so. No book covers or long quotes.
   Stops use trains, steamers, an elephant and a sail-sledge moving along the route lines (gfWalkers, geoflock-walkers.js),
   the British Empire of 1872 laid over the relief (gfHistYear, geoflock-booktours-relief.js), the Time zones layer, day
   and night at the moment Fogg walks back into his club (gfSun), height cross-sections of the Alps and the Pacific Railroad (xsec) and
   the ruler (gfRuler).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry).
   WANT_PHOTOS: ["Reform Club - Pall Mall - London.jpg","The wager at the Reform Club"], ["Nellie Bly 2.jpg","Racing Phileas Fogg"],
   ["Frejus Rail Tunnel 1871.jpg","Through the Alps to Brindisi"], ["SS Mongolia 1865.jpg","Bombay, two days early"],
   ["Cobh Harbour.jpg","Missed by 45 minutes"], ["Liverpool Lime Street 1870s.jpg","Arrested in Liverpool"],
   ["Yokohama 1870s.jpg","By pilot boat to Shanghai"] */
window.GF_B80DAYS_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={b80days:"#8a6a3e"},W=[-180,-58,180,80],WORLD=[-170,-18,180,68];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});
/* places ([lon, lat]) */
const P={london:[-0.13,51.51],reform:[-0.132,51.507],charing:[-0.125,51.508],savile:[-0.141,51.511],dover:[1.31,51.13],calais:[1.86,50.95],paris:[2.35,48.86],modane:[6.67,45.2],turin:[7.68,45.07],
 bologna:[11.34,44.49],ancona:[13.5,43.6],brindisi:[17.94,40.64],portsaid:[32.3,31.26],suez:[32.55,29.97],aden:[45.03,12.79],bombay:[72.84,18.94],nasik:[73.79,19.99],jabalpur:[79.95,23.18],
 kholby:[80.0,24.75],allahabad:[81.85,25.44],benares:[83.0,25.32],calcutta:[88.35,22.57],singapore:[103.85,1.29],hongkong:[114.17,22.29],shanghai:[121.9,31.1],yokohama:[139.64,35.44],
 sf:[-122.42,37.77],sacramento:[-121.49,38.58],reno:[-119.81,39.53],promontory:[-112.55,41.62],slc:[-111.89,40.76],ogden:[-111.97,41.22],cheyenne:[-104.82,41.14],kearny:[-98.98,40.65],
 omaha:[-95.94,41.26],chicago:[-87.63,41.88],ny:[-74.01,40.7],queenstown:[-8.29,51.85],dublin:[-6.26,53.35],liverpool:[-2.99,53.41],valentia:[-10.3,51.92],hearts:[-53.37,47.88]};
/* the legs, kept off the land where they go by sea */
const L1=[P.london,P.dover,P.calais,P.paris,[4.85,45.76],P.modane,P.turin,P.bologna,P.ancona,P.brindisi];
const L2=[P.brindisi,[19,39.6],[21.5,36.6],[26,34.2],[30.5,32],P.portsaid,[32.33,30.6],P.suez,[33.4,28],[35,26.2],[38.2,21],[41.2,15.8],[43.4,12.7],P.aden,[52,14],[60,16.2],[68,18.3],P.bombay];
const L3a=[P.bombay,P.nasik,[76.2,21.1],P.jabalpur,P.kholby],L3b=[P.kholby,P.allahabad],L3c=[P.allahabad,P.benares,[85.2,24.6],[87.3,23.3],P.calcutta];
const L4=[P.calcutta,[88.2,21.2],[89.3,19.5],[92.8,14.5],[95.6,8.9],[97.6,6.4],[99.6,3.9],[101.6,2.4],P.singapore,[105.4,3],[108.3,7.5],[110.3,12.5],[112.2,18.2],P.hongkong];
const L5=[P.hongkong,[116.5,23.2],[119.4,25.4],[121.3,28.2],[122.5,30.4],P.shanghai];
const L6=[P.shanghai,[124,31],[127.5,31.3],[129.9,31.2],[131.6,32.6],[134.8,33.3],[138,34.4],P.yokohama];
const L7=[[140.2,35.1],[-122.62,37.78]];
const L8=[P.sf,P.sacramento,[-120.33,39.32],P.reno,[-117.7,40.9],[-115.76,40.83],P.promontory,P.ogden,[-109.2,41.6],[-105.59,41.31],P.cheyenne,[-100.77,41.12],P.kearny,P.omaha,P.chicago,[-80.0,40.44],P.ny];
const L9=[[-73.9,40.4],[-60,42],[-40,47.2],[-20,50.6],P.queenstown];
const L10=[P.queenstown,[-8.47,51.9],[-7.6,52.6],P.dublin,[-5,53.35],P.liverpool,[-2.2,52.9],[-1.5,52.4],P.london];

const DAYS=[
S({title:"Around the World in Eighty Days",view:WORLD,globe:[60,30,1],gfHistYear:{y:1872,focus:"brit",labels:[{n:"British Raj",name:"British India"}]},
 lines:[L1,L2,L3a.concat([P.allahabad]),L3c,L4,L5,L6,L7,L8,L9,L10].map(c=>({coords:c,kind:"flow"})),
 pins:[[P.london,"London","point"],[P.suez,"Suez","point"],[P.bombay,"Bombay","point"],[P.calcutta,"Calcutta","point"],[P.hongkong,"Hong Kong","point"],[P.yokohama,"Yokohama","point"],[P.sf,"San Francisco","point"],[P.ny,"New York","point"]],
 phPins:[ph([72.83,18.92],"The Gateway of India, Mumbai"),ph([114.17,22.29],"Hong Kong harbour"),ph([-112.55,41.62],"The last spike, 1869"),ph([138.73,35.36],"Mount Fuji")],
 stat:"Jules Verne’s 1872 novel sends a punctual Englishman round the world in 80 days for a bet of £20,000",
 body:"Phileas Fogg sets off with his new French valet, Passepartout, chased by a detective who thinks he is a bank robber. Verne wrote just after the Suez Canal and the first railroad across the United States opened in 1869, which made such a trip possible on paper. The colours show the British Empire of 1872, along much of the route.",
 more:"It first ran in instalments in the Paris newspaper Le Temps from November 1872 and became one of Verne’s best-loved books. One famous thing is missing: Fogg never goes up in a balloon. That was added by the 1956 film."}),
S({title:"The wager at the Reform Club",view:[-6.4,50.7,2.6,52.4],globe:[-0.13,51.5,8],card:"left",hi:["gb"],
 pins:[[P.reform,"The Reform Club, Pall Mall","point"],[[-0.142,51.53],"Savile Row: Fogg’s house","point"],[[-0.12,51.49],"Charing Cross station, 8:45 pm","point"]],
 iconPins:[ic([-0.105,51.506],"train")],
 phPins:[ph([-0.1246,51.5007],"Big Ben")],
 stat:"On 2 October 1872 Fogg bets half his fortune that he can be back in his club by 8:45 pm on 21 December",
 body:"Fogg is rich, silent and as regular as a clock. When members of the Reform Club argue over a newspaper’s claim that the world can now be circled in 80 days, he bets £20,000 that he can do it, and leaves from Charing Cross station that same evening at 8:45.",
 more:"That morning he hired Passepartout, a former acrobat and fireman, after sacking his old servant for bringing shaving water two degrees too cool. The same week a thief stole £55,000 from the Bank of England, and the description sent out sounds a lot like Fogg."}),
S({title:"The timetable",view:WORLD,globe:[60,30,1],card:"left",
 lines:[L1,L2,L3a.concat(L3b.slice(1),L3c.slice(1)),L4,L5.concat(L6.slice(1)),L7,L8,L9.concat(L10.slice(1))].map(c=>({coords:c,kind:"dash"})),
 pins:[[[16,43],"London to Suez: 7 days","point"],[[60,15.5],"Suez to Bombay: 13","point"],[[80,24],"Bombay to Calcutta: 3","point"],[[98,6],"Calcutta to Hong Kong: 13","point"],[[127,31],"Hong Kong to Yokohama: 6","point"],[[-170,45],"Yokohama to San Francisco: 22","point"],[[-105,41],"San Francisco to New York: 7","point"],[[-35,48],"New York to London: 9","point"]],
 stat:"The newspaper’s timetable: 7 + 13 + 3 + 13 + 6 + 22 + 7 + 9 = 80 days",
 body:"Rail and steamer from London to Suez, a steamer to Bombay, the train across India, steamers to Hong Kong, Yokohama and San Francisco, the railroad to New York and a liner home. The plan (dashed) leaves no time at all for storms, missed connections or accidents.",
 more:"Fogg’s fellow members point out that one late train or ship would sink him. He replies that he will allow for the unforeseen too. The figures add up to exactly 80 days, which is the joke."}),
S({title:"Through the Alps to Brindisi",view:[-19.4,38,24,53.5],globe:[8,46,3],card:"left",
 xsec:{title:"Over the Fréjus pass, Chambéry to Turin",pts:[[5.92,45.57,"Chambéry"],[6.35,45.28,"St-Jean-de-Maurienne"],[6.67,45.2,"Modane"],[6.69,45.14,"The tunnel"],[6.71,45.08,"Bardonecchia"],[7.05,45.14,"Susa"],[7.68,45.07,"Turin"]],mark:1300,note:"The dashed line marks 1,300 m, about the height of the railway at the middle of its tunnel; the mountain above it rises to some 2,900 m. Heights are smoothed."},
 lines:[{coords:L1,kind:"flow"}],
 pins:[[P.paris,"Paris","point"],[P.modane,"The Mont Cenis tunnel","point"],[P.turin,"Turin","point"],[P.brindisi,"Brindisi","point"]],
 phPins:[ph([6.86,45.83],"The Alps")],
 stat:"Fogg crosses the Alps by the new Mont Cenis rail tunnel, opened in 1871, on his way to Brindisi",
 body:"Train to Dover, steamer to Calais, then rail by Paris and Turin to Brindisi, at the heel of Italy, where the mail steamer for Egypt waits. The tunnel, nearly 14 km long, saves the old climb over the mountains: see the cross-section. Fogg does not care to look at any of the sights.",
 more:"The tunnel, also called the Fréjus tunnel, took 14 years to dig. Once the Suez Canal opened, Brindisi became the fast route for the mail between Britain and India."}),
S({title:"The Suez Canal",view:[16.8,25,40,34.5],globe:[32.4,30.5,5],card:"left",hiSoft:["eg"],
 lines:[{coords:L2.slice(3,10),kind:"flow"}],
 pins:[[P.portsaid,"Port Said","point"],[P.suez,"Suez: Fix is waiting","point"]],
 iconPins:[ic([32.45,30.0],"ship")],
 stat:"The Suez Canal, opened in 1869, cut about 8,000 km off the voyage from Britain to India",
 body:"At Suez a Scotland Yard detective, Fix, is watching the ships with a description of the Bank of England robber. Fogg fits it. Fix decides to stay with him until an arrest warrant, sent after them by telegraph, can catch up.",
 more:"Before the canal, ships sailed right round Africa, or passengers crossed Egypt overland between steamers. The canal is 164 km long and needs no locks, because the Mediterranean and the Red Sea are at almost the same level."}),
S({title:"Bombay, two days early",view:[2.5,5,80,32],globe:[56,18,2.2],card:"left",gfRuler:{a:P.aden,b:P.bombay},
 lines:[{coords:L2.slice(7),kind:"flow"}],
 pins:[[P.aden,"Aden: coaling","point"],[P.bombay,"Bombay","point"]],
 stat:"The steamer Mongolia brings Fogg to Bombay on 20 October, two days ahead of his timetable",
 body:"The Mongolia, a real steamer of the P&O line, stops at Aden for coal, then crosses about 3,000 km of the Arabian Sea (drag the ruler). In Bombay Passepartout goes sightseeing, walks into a temple without taking off his shoes, and is beaten up by its priests: trouble that will catch up with them later.",
 more:"Fogg, meanwhile, notes the gain in his diary and has dinner. Aden was a British coaling station, where steamers took on fuel on the way to India."}),
S({title:"A railway that wasn’t finished",view:[57.9,16.5,92,29.5],globe:[80,23,3],card:"left",hi:["in"],
 lines:[{coords:L3a,kind:"flow"},{coords:L3b,kind:"flow"},{coords:L3c,kind:"flow"}],
 pins:[[P.bombay,"Bombay","point"],[P.kholby,"Kholby: the line ends","point"],[P.allahabad,"Allahabad","point"],[P.calcutta,"Calcutta","point"]],
 phPins:[ph([79.93,24.85],"The temples of Bundelkhand")],
 stat:"About 80 km short of Allahabad the line simply stops, so Fogg buys an elephant for £2,000",
 body:"The newspaper had said the line across India was finished; in the novel, the last stretch through the forest has not been built. Fogg pays a fortune for an elephant, Kiouni, and hires a young Parsi as its driver, and they ride on through the jungle.",
 more:"In reality the railway from Bombay to Calcutta had been joined at Jabalpur in March 1870, so the gap is Verne’s own invention, and a fine excuse for an elephant."}),
S({title:"Saving Aouda",view:[67.2,20,92,28.5],globe:[83,24,3.6],card:"left",hi:["in"],
 lines:[{coords:L3b,kind:"flow"},{coords:L3c,kind:"flow"}],
 pins:[[[80.6,25.0],"Bundelkhand: the pyre","point"],[P.allahabad,"Allahabad","point"],[P.benares,"Benares","point"],[P.calcutta,"Calcutta","point"]],
 phPins:[ph([83.01,25.31],"The Ganges at Varanasi"),ph([88.34,22.54],"Kolkata today")],
 stat:"In the forest they rescue a young widow, Aouda, about to be burnt on her husband’s funeral pyre",
 body:"Passepartout hides on the pyre and rises up as if the dead man has come back to life, and in the confusion they escape with her on the elephant. Aouda, an educated Parsi woman, travels with them from then on. In Calcutta the priests from Bombay have Passepartout tried for the temple, and Fogg pays £2,000 bail to keep moving.",
 more:"Sati, the burning of widows, had been banned in British India since 1829 and was by then very rare. Verne sets the scene in a region ruled by Indian princes and paints India with the exotic clichés of his time."}),
S({title:"Hong Kong and the opium den",view:[62,-6,124,30],globe:[104,12,1.9],card:"left",gfHistYear:{y:1872,focus:"brit",labels:[{n:"British Raj",name:"British India"}]},
 lines:[{coords:L4,kind:"flow"}],
 pins:[[P.singapore,"Singapore","point"],[P.hongkong,"Hong Kong","point"]],
 phPins:[ph([101,2.9],"Ships in the Malacca Strait")],
 stat:"Fix gets Passepartout drunk in a Hong Kong opium den, so he sails for Yokohama alone and Fogg misses the boat",
 body:"The steamer Rangoon, slowed by a storm, reaches Hong Kong late. Fix’s warrant still has not come, and he needs Fogg kept on British soil. He tells Passepartout the truth and asks for help; when that fails, he drugs him. Passepartout staggers onto the Carnatic without telling his master that it sails early.",
 more:"Singapore and Hong Kong were British colonies, coaling stations on the route to the east. Britain had taken Hong Kong in the first Opium War of 1839–1842."}),
S({title:"By pilot boat to Shanghai",view:[91.8,19,143,40],globe:[126,30,2.6],card:"left",
 lines:[{coords:L5,kind:"flow"},{coords:L6,kind:"flow"}],
 pins:[[P.hongkong,"Hong Kong","point"],[P.shanghai,"Shanghai","point"],[P.yokohama,"Yokohama","point"]],
 phPins:[ph([138.73,35.36],"Mount Fuji")],
 stat:"Fogg hires a little pilot boat, the Tankadère, and races up the China coast through a storm",
 body:"The boat cannot reach Shanghai in time, so at the river mouth it fires a signal gun and the American steamer for Yokohama stops to pick them up. In Yokohama Fogg finds Passepartout, penniless, performing in a troupe of acrobats, with a long false nose.",
 more:"Japan had opened Yokohama to foreign traders only in 1859, and it was the main port for foreigners. Steamers to San Francisco left from here."}),
S({title:"Across the Pacific",view:[52.7,8,248,64],globe:[-170,40,1.5],card:"left",on:["timezones"],gfRuler:{a:P.yokohama,b:P.sf},
 lines:[{coords:L7,kind:"flow"}],
 pins:[[P.yokohama,"Yokohama","point"],[P.sf,"San Francisco","point"],[[180,48],"Crossing 180°","point"]],
 phPins:[ph([-122.48,37.82],"The Golden Gate")],
 stat:"The steamer General Grant takes 22 days to cross about 8,300 km of open Pacific",
 body:"Steamers of the Pacific Mail company had run between San Francisco and Yokohama since 1867, on a route that curves north, the shortest way across a globe (drag the ruler). Halfway over, the ship crosses the 180° meridian, where today the calendar changes (see the Time zones layer). Fogg seems not to notice: remember that.",
 more:"They land on 3 December. San Francisco was a city of gold-rush fortunes, and Fogg is caught up in a street brawl at a political meeting before the train leaves."}),
S({title:"The Pacific Railroad",view:[-147.3,32,-90,48],globe:[-108,41,2.6],card:"left",hiSoft:["us"],
 xsec:{title:"The Pacific Railroad, San Francisco to Omaha",pts:[[-122.27,37.8,"Oakland"],[-121.49,38.58,"Sacramento"],[-120.33,39.32,"Sierra Nevada"],[-119.81,39.53,"Reno"],[-117.7,40.9],[-115.76,40.83,"Elko"],[-112.55,41.62,"Promontory"],[-111.97,41.22,"Ogden"],[-109.2,41.6,"Green River"],[-105.4,41.13,"Sherman Summit"],[-104.82,41.14,"Cheyenne"],[-100.77,41.12,"North Platte"],[-95.94,41.26,"Omaha"]],mark:2000,note:"The dashed line marks 2,000 m. The line’s highest point, Sherman Summit in Wyoming, is about 2,510 m; heights are smoothed."},
 lines:[{coords:L8.slice(0,14),kind:"flow"}],
 pins:[[P.sf,"San Francisco","point"],[P.promontory,"Promontory Summit: the last spike","point"],[P.slc,"Salt Lake City","point"],[P.omaha,"Omaha","point"]],
 phPins:[ph([-105.69,40.31],"The Rocky Mountains")],
 stat:"The first railroad across the United States had been completed at Promontory Summit, Utah, only in May 1869",
 body:"A journey of months by wagon now took about a week. Fogg’s train crosses the Sierra Nevada and the Rockies (see the cross-section), waits hours while a herd of bison crosses the line, and races over a shaky bridge, which collapses behind it. In Utah a Mormon preacher lectures the passengers.",
 more:"The Central Pacific built east from Sacramento, much of it with Chinese workers; the Union Pacific built west from Omaha. Their tracks met at Promontory Summit, where a golden spike was driven in to mark the join."}),
S({title:"Attack on the plains",view:[-115.2,37,-92,44.5],globe:[-99,41,4.5],card:"left",hiSoft:["us"],
 lines:[{coords:L8.slice(9,13),kind:"flow"},{coords:[P.kearny,[-97.5,40.9],P.omaha],kind:"flow"}],
 pins:[[P.kearny,"Fort Kearny","point"],[P.omaha,"Omaha","point"],[P.cheyenne,"Cheyenne","point"]],
 phPins:[ph([-101,42.2],"American bison")],
 stat:"Sioux warriors attack the train in Nebraska; Fogg frees the captives, then crosses the snow by sail-sledge",
 body:"Passepartout climbs under the carriages to uncouple the engine and stops the train by Fort Kearny, but he and two others are carried off, and Fogg leads soldiers to free them. The train has gone, so an American named Mudge offers a sledge with a sail, which blows them across the frozen prairie to Omaha.",
 more:"Plains peoples did fight the railroads, which brought soldiers, settlers and hunters onto their land and helped destroy the bison herds. Verne’s raid is a stock scene of the adventure stories of his day, not a real event."}),
S({title:"Missed by 45 minutes",view:[-139.5,34,0,58],globe:[-40,47,1.8],card:"left",
 lines:[{coords:L8.slice(13),kind:"flow"},{coords:L9,kind:"flow"},{coords:[P.valentia,[-30,51.5],P.hearts],kind:"dash"}],
 pins:[[P.ny,"New York","point"],[P.queenstown,"Queenstown (Cobh)","point"],[P.valentia,"Valentia: the Atlantic cable","point"]],
 phPins:[ph([-10.3,51.92],"The Atlantic telegraph station")],
 stat:"The Cunard liner China left New York 45 minutes before Fogg arrived, so he hired the cargo steamer Henrietta, then took it over",
 body:"Its captain would sail only to Bordeaux, so Fogg bribed the crew, locked the captain in his cabin and steered for Liverpool. When the coal ran out, he bought the ship and burned its cabins, masts and decks to keep the engines turning, and they reached Queenstown in Ireland.",
 more:"Since 1866 a telegraph cable had run under the Atlantic from Valentia Island to Newfoundland (dashed), so news crossed in minutes while Fogg took nine days."}),
S({title:"Arrested in Liverpool",view:[-20,50.4,2.5,55.6],globe:[-4.5,53,4.5],card:"left",hiSoft:["gb","ie"],
 lines:[{coords:L10,kind:"flow"}],
 pins:[[P.queenstown,"Queenstown","point"],[P.dublin,"Dublin","point"],[P.liverpool,"Liverpool, 21 December","point"],[P.london,"London","point"]],
 stat:"Fix finally arrests Fogg at Liverpool on the last day; the real thief had been caught three days before",
 body:"By express train to Dublin and fast mail boat across the Irish Sea, Fogg lands at Liverpool before noon on 21 December, nine hours from his deadline. Fix arrests him, and by the time the mistake is found the London train has gone. Fogg knocks Fix down, hires a special train, and reaches London at 8:50 pm: five minutes late, he believes.",
 more:"He goes home to Savile Row a ruined man. That evening Aouda tells him she loves him, and he sends Passepartout to ask a clergyman to marry them the next day, a Monday."}),
S({title:"The day he gained",view:W,globe:[0,30,1.1],card:"left",gfSun:{utc:20.75,day:356},on:["timezones"],
 lines:[{coords:[[180,-60],[180,75]],kind:"dash"}],
 pins:[[P.reform,"The Reform Club, 8:45 pm","point"],[[180,30],"180°","point"]],
 stat:"Travelling east, Fogg met each sunrise a little earlier; going all the way round, he saw one more than London did",
 body:"At the clergyman’s, Passepartout learns it is only Saturday, not Sunday. Each 15° east moved sunrise an hour earlier, so Fogg had counted 80 days while London counted 79. Passepartout runs, and Fogg walks into the club as the clock strikes 8:45. The shading shows night at that moment.",
 more:"In 1872 there were no time zones: each town kept its own sun time. US railways adopted standard time zones in 1883, and in 1884 a conference in Washington chose Greenwich as the prime meridian. The zones shown are today’s. Passepartout, who never reset his family watch, had been on London time all along."}),
S({title:"Racing Phileas Fogg",view:WORLD,globe:[60,30,1],card:"left",
 lines:[{coords:[[-74.03,40.74],[-50,44],[-20,49],[-1.4,50.9]],kind:"flow"},{coords:[[-1.4,50.9],[-0.13,51.51],[1.31,51.13],[2.3,49.89],[4.85,45.76],P.turin,P.brindisi],kind:"flow"},
  {coords:L2.slice(0,14).concat([[52,13.5],[65,10],[75,7.5],[79.85,6.93],[85,6],[93,6],[97.5,6.2],[100.33,5.42],[101.6,2.4],P.singapore,[105.4,3],[108.3,7.5],[110.3,12.5],[112.2,18.2],P.hongkong,[116.5,23.2],[121,27],[126,31],[129.9,31.2],[131.6,32.6],[134.8,33.3],[138,34.4],P.yokohama]),kind:"flow"},
  {coords:L7,kind:"flow"},{coords:L8.slice(0,6).concat([P.promontory,P.ogden,[-109.2,41.6],P.cheyenne,P.omaha,P.chicago,[-80,40.44],[-74.03,40.74]]),kind:"flow"}],
 pins:[[[-74.03,40.74],"Hoboken: start and finish","point"],[[2.3,49.89],"Amiens: tea with Verne","point"],[[79.85,6.93],"Colombo","point"]],
 stat:"In 1889–90 the reporter Nellie Bly beat Fogg for real: 72 days, 6 hours and 11 minutes",
 body:"Bly, of the New York World, left Hoboken in November 1889 going east, almost entirely on ordinary ships and trains (the route), and stopped in Amiens to meet Verne. A rival magazine sent Elizabeth Bisland off westward the same day; she took 76 days.",
 more:"The American George Francis Train claimed an 80-day trip in 1870 and may have given Verne the idea, and Thomas Cook led the first round-the-world tourist party in 1872–73. By 1911, using the new Trans-Siberian Railway, the record was under 40 days."}),
S({title:"Now explore",view:W,globe:[60,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on the Time zones layer and count the hours between London and San Francisco. Then try the Travels of Ibn Battuta tour, a journey round the known world that took 29 years instead of 80 days."})];

const TOURS={b80days:{name:"Around the World in Eighty Days",short:"Around the World in 80 Days",hint:"Jules Verne’s 1872 novel, on the map: Suez, an elephant across India, Hong Kong, the Pacific Railroad, the Atlantic and the day Fogg gained",steps:DAYS}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- travellers on the route lines (geoflock-walkers.js) ---------- */
const TR="🚂",ST="🚢";
const WALK={"Around the World in Eighty Days":{emoji:[TR,ST,TR,TR,ST,"⛵",ST,ST,TR,ST,TR],name:"Phileas Fogg on his way",per:1},
 "Through the Alps to Brindisi":{emoji:TR,name:"The train to Brindisi",per:1},"The Suez Canal":{emoji:ST,name:"The Mongolia",per:1,float:1},
 "Bombay, two days early":{emoji:ST,name:"The Mongolia",per:1,float:1},"A railway that wasn’t finished":{emoji:[TR,"🐘",TR],name:"Fogg’s train, then the elephant Kiouni",per:1},
 "Saving Aouda":{emoji:["🐘",TR],name:"The elephant Kiouni",per:1},"Hong Kong and the opium den":{emoji:ST,name:"The Rangoon",per:1,float:1},
 "By pilot boat to Shanghai":{emoji:["⛵",ST],name:"The Tankadère",per:1,float:1},"Across the Pacific":{emoji:ST,name:"The General Grant",per:1,float:1},
 "The Pacific Railroad":{emoji:TR,name:"The Pacific Railroad",per:2},"Attack on the plains":{emoji:[TR,"⛵"],name:"The train, then Mudge’s sail-sledge",per:1},
 "Missed by 45 minutes":{emoji:[TR,ST],name:"The Henrietta",per:1},"Arrested in Liverpool":{emoji:TR,name:"Fogg’s express",per:1},
 "Racing Phileas Fogg":{emoji:[ST,TR,ST,ST,TR],name:"Nellie Bly on her way",per:1}};
function addMovers(){try{const Wk=window.gfWalkers;if(Wk)for(const t in WALK)Wk["b80days|"+t]=Object.assign({size:26,per:2},WALK[t])}catch(e){console.error(e)}}
addMovers();addEventListener("load",()=>setTimeout(addMovers,0));

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.b80days={mid:[
 {at:"The Suez Canal",st:"The Suez Canal",q:"Which canal, opened in 1869, made Fogg’s route to India possible?",o:["The Panama Canal","The Suez Canal","The Kiel Canal","The Corinth Canal"],a:1,why:"It joins the Mediterranean to the Red Sea.",kc:"eg"},
 {at:"A railway that wasn’t finished",st:"A railway that wasn’t finished",q:"How does Fogg cross the gap in the Indian railway?",o:["By balloon","On an elephant","By river boat","On horseback"],a:1,why:"He buys the elephant Kiouni for £2,000.",kc:"in"},
 {at:"The Pacific Railroad",st:"The Pacific Railroad",q:"Where was the first railroad across the USA completed in 1869?",o:["Chicago","Promontory Summit, Utah","Denver","Sacramento"],a:1,why:"The Central Pacific and Union Pacific met there.",kc:"us"}],
 recap:[
 {q:"In which London club does Fogg make his bet?",o:["The Athenaeum","The Reform Club","The Garrick","White’s"],a:1,why:"On Pall Mall, on 2 October 1872.",st:"The wager at the Reform Club",kc:"gb"},
 {q:"Why does Fogg arrive a day early without knowing it?",o:["His watch was wrong","He travelled east round the world","The ship was fast","The bet was changed"],a:1,why:"Going east, he counted one more sunrise than London did.",st:"The day he gained",kc:"gb"},
 {q:"Who went round the world in 72 days in 1889–90?",o:["Nellie Bly","Amelia Earhart","Thomas Cook","Elizabeth Bisland"],a:0,why:"A reporter for the New York World.",st:"Racing Phileas Fogg",kc:"us"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "b80days|Around the World in Eighty Days":"Big Ben at sunset - 2014-10-27 17-30.jpg","b80days|The wager at the Reform Club":"Trafalgar Square, London 2 - Jun 2009.jpg",
 "b80days|The timetable":"British Empire map - The India and Colonial Exhibition, London (1886) - BL.jpg","b80days|Through the Alps to Brindisi":"Mont Blanc Massif (2022-08-16).jpg",
 "b80days|The Suez Canal":"Container Ship 'Ever Given' stuck in the Suez Canal, Egypt - March 24th, 2021 cropped.jpg","b80days|Bombay, two days early":"Mumbai 03-2016 31 Gateway of India.jpg",
 "b80days|A railway that wasn’t finished":"Asian elephant walking in Tad Lo river at golden hour, Bolaven Plateau, Laos.jpg","b80days|Saving Aouda":"1 Khajuraho.jpg",
 "b80days|Hong Kong and the opium den":"Hong Kong Harbour Night 2019-06-11.jpg","b80days|By pilot boat to Shanghai":"Lake Kawaguchiko Sakura Mount Fuji 4.JPG",
 "b80days|Across the Pacific":"San Francisco (CA, USA), Golden Gate Bridge -- 2022 -- 3023 (bw).jpg","b80days|The Pacific Railroad":"East and West Shaking hands at the laying of last rail Union Pacific Railroad - Restoration.jpg",
 "b80days|Attack on the plains":"American bison k5680-1.jpg","b80days|Missed by 45 minutes":"Brooklyn Bridge and the Lower Manhattan skyline from Pebble Beach, New York.jpg",
 "b80days|Arrested in Liverpool":"Ha'penny Bridge & River Liffey, Dublin (507194) (32094198423).jpg","b80days|The day he gained":"Feet on prime meridian greenwich observatory.jpg",
 "b80days|Racing Phileas Fogg":"Grand Central Terminal clock.jpg","b80days|Now explore":"Dover White Cliffs 4.jpg"};
const PIN={
 "The Gateway of India, Mumbai":"Mumbai 03-2016 31 Gateway of India.jpg","Hong Kong harbour":"Vista del Puerto de Victoria desde Sky100, Hong Kong, 2013-08-09, DD 10.JPG",
 "The last spike, 1869":"East and West Shaking hands at the laying of last rail Union Pacific Railroad - Restoration.jpg","Mount Fuji":"Chureito Pagoda and Mount Fuji 2023-03-07.jpg",
 "Big Ben":"Big Ben at sunset - 2014-10-27 17-30.jpg","The Alps":"BerneseAlps.JPG","The temples of Bundelkhand":"1 Khajuraho.jpg",
 "The Ganges at Varanasi":"Ganga aarti at Varanasi.jpg","Kolkata today":"Victoria Memorial situated in Kolkata.jpg","Ships in the Malacca Strait":"Ships in the Malacca Strait.jpg",
 "The Golden Gate":"San Francisco (CA, USA), Golden Gate Bridge -- 2022 -- 3023 (bw).jpg","The Rocky Mountains":"Hallett Peak, Rocky Mountain NP.jpg","American bison":"American bison k5680-1.jpg",
 "The Atlantic telegraph station":"Ireland Valentia Island telegraph.JPG"};
const PHOTOS=window.GF_B80DAYS_PHOTOS||[];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
PHOTOS.forEach(p=>{(p.cards||[]).forEach(k=>CARD[k]=p.f);(p.pins||[]).forEach(l=>PIN[l]=p.f)});
const findP=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d)||PHOTOS.find(x=>x.f===f)||null}catch(e){return null}};
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St){const want=CARD[ps.tour+"|"+St.title];if(want){const p=findP(want);if(p)return p}}}catch(e){}return _pf.apply(this,arguments)}}
try{if(typeof GF_SQ_FILE!=="undefined")for(const k in PIN)if(!GF_SQ_FILE[k])GF_SQ_FILE[k]=PIN[k]}catch(e){}
const KEEP=new Map();IDS.forEach(id=>PS_TOURS[id].steps.forEach(St=>{St.phPins=(St.phPins||[]).filter(q=>PIN[q.label]&&PIN[q.label]!==CARD[id+"|"+St.title]);KEEP.set(St,St.phPins.map(q=>Object.assign({},q)))}));
function prep(St){try{const K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 const labs=new Set(K.map(q=>q.label));if(St._restored)St._restored=St._restored.filter(r=>!labs.has(r[1]));if(St.pins)St.pins=St.pins.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));if(St._pins0)St._pins0=St._pins0.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));St._sqPruned=-1;return true}}catch(e){console.error(e)}}
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* cover for the Guided tours page card */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={b80days:"East and West Shaking hands at the laying of last rail Union Pacific Railroad - Restoration.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
