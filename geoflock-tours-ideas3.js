/* GeoFlock: three tours for the Ideas & arts shelf.
   psychology  "Mind and place"               how geography shapes how people think and live
   words       "Words on the map"             how words, place names and scripts travel
   learning    "Learning around the world"    universities, libraries, paper, printing, literacy and the internet
   Stops reuse what the World Maps view already draws: the Culture map (mode:"culture", sub:"lang…" / "script…"), the History map
   (mode:"history", sub:"<year>/<group>"), the People and Population maps, Satellite, per-stop layers (on:["timezones","grid",
   "rivers","connections"]), the day-and-night gadget (gfSun), the ruler (gfRuler), the country dragger (ghosts), the height
   threshold (gfThr) and spotlight holes (holes). All through the shared stopModes switch.
   Photos: Wikimedia Commons (licence and author in each entry); most come from the shared library, new ones are listed in GF_IDEAS3_PHOTOS. */
window.GF_IDEAS3_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={psychology:"#9a84de",words:"#c391d9",learning:"#8f78d2"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#b79be6",icon:"photo"});

/* =====================================================================================================
   1. Mind and place
   ===================================================================================================== */
const PSY=[
S({title:"Mind and place",view:W,globe:[40,30,1],
 phPins:[ph([18.96,69.65],"Northern lights over Tromsø"),ph([102.8,23.1],"Rice terraces, Yunnan"),ph([139.7,35.66],"Shibuya Crossing, Tokyo"),ph([12.59,55.68],"Nyhavn, Copenhagen"),ph([-0.0,51.48],"The Prime Meridian, Greenwich"),ph([145.25,-15.47],"The Endeavour replica"),ph([-3.7,40.42],"Puerta del Sol, Madrid"),ph([-84.8,10.3],"Monteverde cloud forest")],
 stat:"Where you grow up can shape how you see, give directions, sleep and even sit in a café",
 body:"Psychologists once studied mostly students in a few Western countries and assumed everyone thinks the same way. When they looked around the world, they found real differences, linked to farming, language, sunlight and the shape of daily life. This tour visits the places behind those findings.",
 more:"These are averages across big groups, not rules about any one person: people within a country differ far more than countries differ from each other. Some of the ideas here are still debated by scientists."}),
S({title:"The WEIRDest people in the world",view:W,globe:[0,30,1],card:"left",hi:["us","ca","gb","ie","au","nz","il","de","fr","nl","be","ch","at","it","es","pt","se","no","dk","fi"],
 pins:[[[-87.69,42.05],"Evanston, Illinois: most fooled","point"],[[22,-22.5],"San foragers, Kalahari: hardly fooled","point"]],
 phPins:[ph([22.5,-20.5],"Okavango Delta, Botswana")],
 stat:"In one survey, 96% of people tested in top psychology journals came from Western countries home to 12% of humanity",
 body:"In 2010 three researchers in Canada pointed out that many ‘universal’ findings came from WEIRD people: Western, Educated, Industrialised, Rich and Democratic. When the same tests were tried elsewhere, results often changed.",
 more:"In the Müller-Lyer illusion, two equal lines look different lengths because of the arrowheads at their ends. In a 1960s study, people in Evanston, Illinois, were among the most fooled; San foragers in the Kalahari were hardly fooled at all, perhaps because they grew up with fewer straight walls and square corners."}),
S({title:"Rice and wheat",view:[30,5,140,60],globe:[108,32,2.2],card:"left",hi:["cn"],on:["rivers"],
 lines:[{coords:[[103.5,33.6],[106,33.7],[108.9,33.9],[111,33.6],[113.5,33],[116,32.8],[118.5,33.2],[120.5,33.8]],kind:"dash"}],
 pins:[[[116.4,39.9],"Beijing: wheat","point"],[[108.94,34.26],"Xi’an: wheat","point"],[[121.47,31.23],"Shanghai: rice","point"],[[113.26,23.13],"Guangzhou: rice","point"],[[112,34.4],"The Qinling–Huai line","area"]],
 phPins:[ph([102.8,23.1],"Rice terraces, Yunnan"),ph([126.6,45.75],"Harbin’s ice festival")],
 stat:"South of China’s Qinling–Huai line people farmed rice, north of it wheat; psychologists found the two halves think a little differently",
 body:"Rice paddies need shared canals and lots of swapped labour; wheat needs far less teamwork. In 2014 Thomas Talhelm and colleagues tested over 1,000 Han Chinese students and found that those from rice areas thought more ‘holistically’ and felt more tied to friends and family.",
 more:"In a 2018 follow-up the team counted nearly 9,000 people in cafés: in wheat-region cities people were more often sitting alone, and more likely to move a chair that blocked their way. The ‘rice theory’ is influential but still debated."}),
S({title:"Which way is north?",view:[118,-28,158,-4],globe:[145,-15,4],card:"left",hi:["au"],on:["grid"],
 pins:[[[145.11,-15.29],"Hope Vale","point"],[[145.25,-15.47],"Cooktown, on the Endeavour River","point"]],
 phPins:[ph([145.6,-16.2],"The Endeavour replica"),ph([146.5,-18.5],"The Coral Sea, Queensland")],
 stat:"Speakers of Guugu Yimithirr rarely say ‘left’ or ‘right’: they say north, south, east or west, even for a cup on a table",
 body:"Guugu Yimithirr is an Aboriginal language of Hope Vale, on Cape York in Queensland. Instead of ‘the cup is on your left’ you say ‘the cup is to your east’, so speakers keep track of the compass all the time, even indoors. Researchers found they could point to faraway places with striking accuracy.",
 more:"English took one of its first Aboriginal words from this language: in 1770 James Cook’s crew, mending their ship at the Endeavour River, wrote down gangurru, which became ‘kangaroo’."}),
S({title:"How many colours?",view:[-56,-5,150,75],globe:[90,45,1.3],card:"left",hi:["ru","jp","vn"],
 pins:[[[37.62,55.75],"Russian: goluboy and siniy","point"],[[139.69,35.69],"Japanese: ‘ao’ traffic lights","point"],[[105.85,21.03],"Vietnamese: xanh","point"]],
 phPins:[ph([135.67,35.02],"Bamboo forest, Kyoto")],
 stat:"Russian has two basic words for blue: goluboy, light blue, and siniy, dark blue",
 body:"Languages slice up the rainbow differently. In a 2007 experiment, Russian speakers were faster at telling two blues apart when they fell on either side of the goluboy–siniy line; English speakers showed no such edge. Many languages, like Vietnamese with xanh, use one word for both green and blue.",
 more:"In Japanese, green traffic lights are called ao, the old word for blue, and Japan’s ‘go’ lights are a bluish green. In 1969 Brent Berlin and Paul Kay compared 20 languages and found colour words tend to appear in a set order: black and white first, then red, then green or yellow."}),
S({title:"The map in your head",view:[-90,-40,62,84],globe:[0,30,1],card:"left",hi:["gl"],ghosts:[{code:"gl",at:[20,2],col:"#7b55c7",label:"Greenland, true size"}],
 phPins:[ph([-50,69.2],"Iceberg, Ilulissat")],
 stat:"Africa is about 14 times bigger than Greenland, yet many people guess they are about the same size",
 body:"Our mental maps are bent by the maps we grew up with. The Mercator map, made for sailors in 1569, stretches lands near the poles, so Greenland looks as big as Africa. Drag the shape of Greenland around Africa to see its true size.",
 more:"Studies of ‘mental maps’ find people also tend to draw their own region too big. Where a map is centred matters too: maps in China and Japan often put the Pacific in the middle, and some Australian maps put south at the top."}),
S({title:"One clock for all of China",view:[30,5,132,57],globe:[100,36,2],card:"left",hi:["cn"],on:["timezones"],gfSun:{utc:0,day:355},
 pins:[[[116.4,39.9],"Beijing: 8 a.m., sunrise","point"],[[75.99,39.47],"Kashgar: 8 a.m., still dark","point"]],
 phPins:[ph([75.99,39.47],"Kashgar’s old town")],
 stat:"China stretches across more than 60 degrees of longitude, but since 1949 the whole country has kept Beijing time",
 body:"At 8 a.m. on a winter morning the sun is just rising in Beijing; in Kashgar, about 3,400 km west, it is still dark and will stay dark for over two hours. Many people in Xinjiang also keep an unofficial local time, two hours behind.",
 more:"Body clocks follow the sun, not the official clock. Studies suggest people living in the late-sunset western edge of a time zone tend to sleep less than those on its eastern edge."}),
S({title:"Spain on Berlin time",view:[-38,30,18,62],globe:[2,46,3],card:"left",hi:["es"],on:["timezones"],gfSun:{utc:19.67,day:172},
 pins:[[[-3.7,40.42],"Madrid","point"],[[0,51.48],"Greenwich","point"],[[13.4,52.52],"Berlin","point"]],
 phPins:[ph([-3.7,40.42],"Puerta del Sol, Madrid")],
 stat:"Spain lies south of Britain, but since 1940 its clocks have matched Germany’s, not Britain’s",
 body:"In 1940 Franco moved Spain’s clocks forward an hour to match Germany, and they never went back. In summer the sun is highest over Madrid at about a quarter past two, which helps explain why Spaniards lunch at two and dine at nine or ten.",
 more:"On midsummer evening, the map shows the sun has set in Berlin but is still up over Spain. Spain’s government has debated moving back to London’s time zone; Portugal, next door, has kept it."}),
S({title:"Jet lag",view:[-103,-50,127,70],globe:[60,15,1],card:"left",on:["timezones"],gfRuler:{a:[115.86,-31.95],b:[-0.13,51.5]},
 pins:[[[115.86,-31.95],"Perth","point"],[[-0.13,51.5],"London","point"]],
 phPins:[ph([103.99,1.36],"A long-haul airliner")],
 stat:"Body clocks shift only about an hour a day, so a flight across seven or eight time zones can leave you out of step for a week",
 body:"Since 2018 planes have flown non-stop from Perth to London, about 14,500 km in some 17 hours (drag the ruler). Flying east is usually harder than flying west: our inner day runs a little longer than 24 hours, so staying up later is easier than going to bed earlier.",
 more:"Daylight is the strongest signal that resets the body clock, which is why travellers are told to get outside in the morning after flying east."}),
S({title:"Polar night",view:[-20,52,45,74],globe:[15,66,3],card:"left",hi:["no"],gfSun:{utc:11,day:355},on:["grid"],
 pins:[[[18.96,69.65],"Tromsø: no sunrise late Nov to mid-Jan","point"],[[8.59,59.88],"Rjukan’s sun mirrors","point"]],
 phPins:[ph([15.63,78.22],"Longyearbyen, Svalbard")],
 stat:"North of the Arctic Circle the sun does not rise at all in midwinter; in Tromsø it stays below the horizon for about seven weeks",
 body:"Short, dark days can bring low mood, and for some people seasonal affective disorder (SAD), a winter depression. It seems more common far from the equator, but not simply so: Icelanders report less of it than expected, perhaps thanks to genes or a fish-rich diet.",
 more:"Bright-light lamps are a common treatment. In 2013 Rjukan, a town in a valley so deep it gets no direct sun for about half the year, put up three giant mirrors on the mountainside to beam sunlight into its square."}),
S({title:"The happiest countries?",view:W,globe:[10,45,1],card:"left",hi:["fi","is","dk","cr","se","no","nl","il","lu","ch"],
 pins:[[[24.94,60.17],"Finland: 1st, ninth year running","point"],[[-84.09,9.93],"Costa Rica: 4th","point"]],
 phPins:[ph([12.59,55.68],"Nyhavn, Copenhagen"),ph([-84.8,10.3],"Monteverde cloud forest")],
 stat:"Finland topped the World Happiness Report in 2026 for the ninth year in a row",
 body:"The report asks about 1,000 people a year in each of more than 140 countries to rate their life from 0, the worst possible, to 10, the best possible, and averages three years. Researchers link high scores to trust, in other people and in government, as well as social support, health and freedom to make choices.",
 more:"It measures how people judge their lives, not how often they smile, and other surveys rank countries differently. The 2026 top ten were Finland, Iceland, Denmark, Costa Rica, Sweden, Norway, the Netherlands, Israel, Luxembourg and Switzerland."}),
S({title:"Crowded and lonely?",view:W,globe:[60,30,1],card:"left",mode:"people",sub:"urban",
 pins:[[[139.69,35.69],"Tokyo","point"],[[-0.13,51.5],"London","point"]],
 phPins:[ph([139.7,35.66],"Shibuya Crossing, Tokyo"),ph([-73.99,40.76],"Times Square at night")],
 stat:"In 2025 the World Health Organization estimated that about one person in six worldwide feels lonely",
 body:"More than half of humanity now lives in cities; the map shows the share in each country. Being surrounded by people is not the same as being close to them, and in many rich cities a large share of homes hold just one person. The UK appointed a minister for loneliness in 2018, and Japan did in 2021.",
 more:"The WHO links loneliness and isolation to about 871,000 deaths a year. Teenagers and young adults report it most often, not the old."}),
S({title:"Forest bathing",view:[118,27,148,44],globe:[138,36,3.5],card:"left",hi:["jp"],mode:"satellite",
 pins:[[[135.67,35.02],"Arashiyama, Kyoto","point"],[[139.69,35.69],"Tokyo","point"]],
 phPins:[ph([135.67,35.02],"Bamboo forest, Kyoto")],
 stat:"Japan’s forestry agency coined the word shinrin-yoku, ‘forest bathing’, in 1982",
 body:"Shinrin-yoku means walking slowly through a forest using all your senses. Japanese studies found lower stress hormones and blood pressure after forest walks than after city walks; about two-thirds of Japan is covered in forest.",
 more:"Many studies link green space near home with better mental health, though cause and effect are hard to untangle. In 2018 doctors in Shetland, Scotland, began giving ‘nature prescriptions’."}),
S({title:"Now explore",view:W,globe:[40,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on Time zones and Day and night, and find where the sun rises late by the clock. Which country would you guess is happiest, and why? The Words on the map tour looks at how languages travel."})];

/* =====================================================================================================
   2. Words on the map
   ===================================================================================================== */
const WORDS=[
S({title:"Words on the map",view:W,globe:[40,30,1],mode:"culture",sub:"lang",
 phPins:[ph([-2.89,53.19],"Chester’s Bridge Street"),ph([44.8,41.69],"A street sign in Tbilisi"),ph([113.54,22.19],"Macau"),ph([66.97,39.65],"The Registan, Samarkand"),ph([-78.46,0],"Mitad del Mundo, Ecuador"),ph([145.4,-6.07],"An Asaro mud man"),ph([-157.86,21.29],"Hōkūleʻa, Hawaii"),ph([21.01,52.25],"Warsaw’s Market Square")],
 stat:"People speak more than 7,000 languages, and every name on the map is a word with a story",
 body:"Words travel with traders, conquerors, missionaries and migrants, and place names keep layers of history long after the people who coined them have gone. The map shows the language family that most people in each country grow up speaking.",
 more:"A language family is a group of languages that descend from one ancestor: English, Hindi and Russian are distant cousins in the Indo-European family."}),
S({title:"Tea or chá?",view:[-123,-40,131,75],globe:[60,35,1.2],card:"left",hi:["nl","gb","fr","de","es","it","id"],hiSoft:["pt","ru","tr","ir","in","pk","sa","jp","kr"],
 lines:[{coords:[[108.94,34.26],[103.8,36.06],[94.7,40.1],[87.6,43.8],[75.99,39.47],[66.97,39.65],[59.6,36.3],[51.4,35.7],[44.4,33.3],[36.3,33.5],[28.98,41.01]],kind:"flow"},{coords:[[66.97,39.65],[58,45],[50,51],[37.62,55.75]],kind:"flow"},{coords:[[118.09,24.48],[110,12],[106.8,-6.2],[80,-8],[50,-28],[18.4,-35.5],[-5,-15],[-20,10],[-15,38],[-8,46],[4.9,52.37]],kind:"dash"}],
 pins:[[[118.09,24.48],"Xiamen (Amoy): ‘te’","point"],[[113.54,22.19],"Macau: ‘cha’","point"],[[37.62,55.75],"Russian: chai","point"],[[28.98,41.01],"Turkish: çay","point"],[[4.9,52.37],"Dutch: thee","point"],[[-9.14,38.72],"Portuguese: chá","point"],[[-0.13,51.5],"English: tea","point"]],
 phPins:[ph([113.54,22.19],"Macau"),ph([120.1,30.2],"Tea fields, Hangzhou")],
 stat:"Almost every language calls tea either ‘cha’ or ‘te’, and which one tells you how tea arrived",
 body:"Both words come from Chinese: cha in Mandarin and Cantonese, te in the Min Chinese of Fujian’s ports. Cha travelled overland along the Silk Roads (solid lines), becoming chay in Persian and chai in Russian and Hindi; te went by sea (dashed) with Dutch traders in the 1600s, becoming thé, Tee and tea.",
 more:"Portugal is the exception: its traders bought tea at Macau, where Cantonese says cha, so Portuguese has chá. The countries in strong colour say ‘te’; the paler ones say a form of ‘cha’."}),
S({title:"Borrowed words",view:W,globe:[30,30,1],card:"left",hi:["gb"],
 lines:[{coords:[[77.2,28.6],[60,38],[40,45],[20,50],[-0.13,51.5]],kind:"flow"},{coords:[[-99.13,19.43],[-70,35],[-30,47],[-0.13,51.5]],kind:"flow"},{coords:[[118.09,24.48],[90,40],[50,52],[-0.13,51.5]],kind:"flow"},{coords:[[139.69,35.69],[100,60],[40,62],[-0.13,51.5]],kind:"flow"},{coords:[[145.25,-15.47],[100,0],[60,20],[30,40],[-0.13,51.5]],kind:"flow"},{coords:[[14.42,50.09],[-0.13,51.5]],kind:"flow"},{coords:[[39.67,-4.05],[30,20],[15,40],[-0.13,51.5]],kind:"flow"},{coords:[[44.36,33.31],[25,43],[-0.13,51.5]],kind:"flow"}],
 pins:[[[77.2,28.6],"Hindi: shampoo, bungalow","point"],[[-99.13,19.43],"Nahuatl: chocolate, tomato","point"],[[118.09,24.48],"Hokkien: ketchup","point"],[[139.69,35.69],"Japanese: tsunami, emoji","point"],[[145.25,-15.47],"Guugu Yimithirr: kangaroo","point"],[[14.42,50.09],"Czech: robot","point"],[[39.67,-4.05],"Swahili: safari","point"],[[44.36,33.31],"Arabic: algebra","point"]],
 stat:"The Oxford English Dictionary lists words borrowed from more than 350 languages",
 body:"Shampoo and bungalow came into English from Hindi, chocolate and tomato from Nahuatl, the language of the Aztecs, ketchup probably from Hokkien Chinese, robot from a Czech play of 1920 and algebra from the Arabic al-jabr.",
 more:"Even everyday words like sky, egg and they were borrowed from the Vikings’ Old Norse. Words flow the other way too: French says le week-end, and Japanese says aisukurīmu for ice cream."}),
S({title:"England’s place-name layers",view:[-11,49.8,3,56.2],globe:[-1.5,53,5],card:"left",
 lines:[{coords:[[0.6,51.5],[0,51.55],[-0.05,51.8],[-0.4,52.0],[-0.47,52.14],[-1.0,52.25],[-1.4,52.5],[-1.75,52.65],[-2.3,52.75],[-2.9,53.19]],kind:"dash"}],
 pins:[[[-0.61,54.49],"Whitby","point"],[[-1.48,52.92],"Derby","point"],[[-1.08,53.96],"York (Viking Jórvík)","point"],[[-2.24,53.48],"Manchester","point"],[[-2.8,54.05],"Lancaster","point"],[[-1.13,52.64],"Leicester","point"],[[-1.31,51.06],"Winchester","point"]],
 phPins:[ph([-2.89,53.19],"Chester’s Bridge Street")],
 stat:"English place names are layers of history: -chester from Roman forts, -ham and -ton from Anglo-Saxons, -by from Vikings",
 body:"Roman army camps (Latin castra) became -chester, -caster and -cester: Manchester, Lancaster, Leicester. Anglo-Saxons added -ham, home, and -ton, farm. Danish Vikings, who ruled the ‘Danelaw’ north and east of the dashed line from the 880s, left -by, village, and -thorpe, hamlet: Whitby, Derby, Scunthorpe.",
 more:"Many river names are older still, from Celtic languages: Avon simply meant ‘river’, so the River Avon is the ‘river river’. Danes and Norwegians still say by for ‘town’, and English kept it in ‘bylaw’."}),
S({title:"The -stans",view:[10,14,100,58],globe:[64,40,2],card:"left",mode:"culture",sub:"lang/tur+iir",
 pins:[[[66.97,39.65],"Samarkand","point"]],
 phPins:[ph([66.97,39.65],"The Registan, Samarkand")],
 stat:"-stan is Persian for ‘land of’ or ‘place of’: Kazakhstan is the land of the Kazakhs",
 body:"Seven countries end in -stan: Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan, Afghanistan and Pakistan. The ending comes from Persian, an Indo-Iranian language, but four of the seven mostly speak Turkic languages: the map shows both families.",
 more:"Pakistan’s name was coined in 1933 by the student Choudhry Rahmat Ali, partly from the names of its regions (pak also means ‘pure’). The ending shares an ancient root with the English word ‘stand’. Samarkand’s great square is the Registan, ‘sandy place’."}),
S({title:"Saints and rivers",view:[-165,-50,-20,52],globe:[-80,0,1.2],card:"left",
 pins:[[[-122.42,37.77],"San Francisco","point"],[[-118.24,34.05],"Los Angeles","point"],[[-105.94,35.69],"Santa Fe","point"],[[-46.63,-23.55],"São Paulo","point"],[[-70.65,-33.45],"Santiago","point"],[[-43.2,-22.9],"Rio de Janeiro","point"],[[-57.5,-35],"Río de la Plata","point"]],
 phPins:[ph([-43.2,-22.95],"Rio de Janeiro"),ph([-65.75,-19.6],"Cerro Rico, Potosí")],
 stat:"Rio de Janeiro means ‘River of January’: Portuguese sailors entered its bay on 1 January 1502 and took it for a river mouth",
 body:"Spanish and Portuguese explorers named places after the saint’s day on which they arrived, or after saints from home: San Antonio, São Paulo, Santa Cruz. Thousands of San, Santa and São names now dot Latin America, the southern United States and the Philippines.",
 more:"Los Angeles began as the town of ‘Our Lady, Queen of the Angels’. The Río de la Plata, ‘river of silver’, was named for silver the Spanish hoped lay upstream, and it gave Argentina its name."}),
S({title:"How countries got their names",view:[-150,-50,25,32],globe:[-40,5,1],card:"left",on:["grid"],hi:["ec","ar","ve","cm","co","bo"],
 pins:[[[-78.5,-1.5],"Ecuador: ‘equator’","point"],[[-64,-34],"Argentina: ‘land of silver’","point"],[[-71.6,9.8],"Venezuela: ‘little Venice’","point"],[[12.4,5.7],"Cameroon: ‘shrimps’","point"],[[-73.5,4.5],"Colombia: Columbus","point"],[[-64.7,-17],"Bolivia: Simón Bolívar","point"]],
 phPins:[ph([-78.46,0],"Mitad del Mundo, Ecuador")],
 stat:"Ecuador is simply Spanish for ‘equator’: the line crosses the country just north of Quito",
 body:"Many countries are named after things. Argentina comes from argentum, Latin for silver; Venezuela means ‘little Venice’, for stilt houses that explorers saw on Lake Maracaibo in 1499; Cameroon comes from the camarões, shrimps, that Portuguese sailors found in the Wouri River in 1472.",
 more:"Others honour people: the Philippines King Philip II of Spain, Colombia Christopher Columbus, Bolivia Simón Bolívar, and Saudi Arabia the House of Saud. ‘America’ itself comes from the explorer Amerigo Vespucci."}),
S({title:"Writing begins",view:[-40,0,125,56],globe:[40,30,1],card:"left",hi:["iq","eg","cn"],
 pins:[[[45.64,31.32],"Uruk: cuneiform, about 3200 BC","point"],[[31.92,26.18],"Abydos, Egypt: hieroglyphs","point"],[[114.35,36.1],"Anyang: oracle bones, about 1200 BC","point"]],
 phPins:[ph([45.64,31.32],"A cuneiform tablet")],
 stat:"Writing was invented from scratch at least three times: in Mesopotamia, China and Mexico, and perhaps also in Egypt",
 body:"The oldest writing, cuneiform from Uruk around 3200 BC, began as tallies of grain and sheep pressed into clay. China’s oldest writing is on ‘oracle bones’ from Anyang, about 1200 BC; in Mexico and Central America, the Zapotecs and later the Maya were writing by around 500 BC.",
 more:"Nearly all the world’s alphabets descend from one, made by Semitic-speaking workers in Egypt around 1800 BC; it became Phoenician, then Greek, Latin, Hebrew and Arabic."}),
S({title:"Alphabets and scripts",view:W,globe:[40,30,1],card:"left",mode:"culture",sub:"script",
 phPins:[ph([44.8,41.69],"A street sign in Tbilisi")],
 stat:"More languages are written in Latin letters than in any other script",
 body:"The map shows the main script of each country’s national language. Latin letters spread with the Roman Empire and later with European colonies and missionaries; Cyrillic with Orthodox Christianity and then the Soviet Union; Arabic with Islam; Chinese characters across East Asia.",
 more:"Countries can switch: Turkey changed from Arabic to Latin letters in 1928, and Kazakhstan is moving from Cyrillic to Latin. Georgia and Armenia each have an alphabet used for no other national language."}),
S({title:"Hangul: an alphabet by design",view:[100,28,141,46],globe:[127,37,4],card:"left",mode:"culture",sub:"script/hng",
 pins:[[[126.98,37.57],"Seoul","point"]],
 phPins:[ph([126.98,37.58],"Gyeongbokgung Palace, Seoul")],
 stat:"Hangul is one of the few scripts whose inventor and date we know: King Sejong, in 1443",
 body:"Before Hangul, Koreans wrote in Chinese characters, which took years to learn. Sejong and his scholars made an alphabet of 28 letters whose shapes sketch the mouth and tongue making each sound, and he proclaimed it in 1446 so that ordinary people could read.",
 more:"Today 24 letters are used, stacked into syllable blocks. South Korea celebrates Hangul Day on 9 October, North Korea on 15 January."}),
S({title:"The most spoken languages",view:W,globe:[60,25,1],card:"left",mode:"population",
 pins:[[[-0.13,51.5],"English","point"],[[116.4,39.9],"Mandarin Chinese","point"],[[77.2,28.6],"Hindi","point"],[[-3.7,40.42],"Spanish","point"]],
 phPins:[ph([121.5,31.24],"Shanghai"),ph([72.88,19.07],"Mumbai")],
 stat:"English has about 1.5 billion speakers, but only about 390 million learned it as children",
 body:"Counting everyone who speaks a language, English comes first, then Mandarin Chinese with about 1.2 billion speakers, Hindi with about 600 million and Spanish with about 560 million (Ethnologue’s 2025 estimates). Counting only native speakers, Mandarin is far ahead, with about 990 million.",
 more:"The map shows where people live: big languages are spoken where people are many. At the other end, thousands of languages have fewer speakers than a small town."}),
S({title:"The mountain of languages",view:[26,37,57,47],globe:[44,42,4],card:"left",gfThr:{kind:"elev",v:1500},
 pins:[[[47.5,42.98],"Dagestan: over 30 languages","point"],[[44.8,41.69],"Tbilisi: Georgian","point"],[[44.51,40.18],"Yerevan: Armenian","point"]],
 phPins:[ph([41.5,43.4],"The Caucasus mountains")],
 stat:"Arab geographers called the Caucasus ‘the mountain of languages’: about 50 are spoken there",
 body:"Steep valleys kept villages apart for centuries, so languages split and survived; the map shows only land above 1,500 m. Dagestan alone, a republic of Russia on the Caspian Sea, has over 30 native languages, and Georgian and Armenian each have their own alphabet.",
 more:"Some Caucasus languages have dozens of consonants. Ubykh, whose last fluent speaker died in Turkey in 1992, had about 80 consonants and only two or three vowels."}),
S({title:"Papua New Guinea: 840 languages",view:[106,-24,172,6],globe:[145,-6,3],card:"left",hi:["pg"],hiSoft:["vu","sb"],holes:[{circle:[146,-6.5],km:850}],
 pins:[[[145.39,-6.08],"Goroka","point"],[[147.18,-9.44],"Port Moresby","point"],[[168.32,-17.73],"Vanuatu: over 100 languages","point"]],
 phPins:[ph([145.4,-6.07],"An Asaro mud man"),ph([168.32,-17.73],"Port Vila, Vanuatu")],
 stat:"Papua New Guinea has about 840 living languages, more than any other country",
 body:"Its 10 million or so people live in steep, forested valleys and on hundreds of islands, and many communities stayed small and separate for thousands of years. Neighbouring valleys can speak languages as different as English and Japanese.",
 more:"Many people also speak Tok Pisin, an English-based creole, to talk across language lines. Vanuatu, with about 300,000 people, has over 100 languages: the most per person on Earth."}),
S({title:"Endangered and revived",view:W,globe:[-150,0,1],card:"left",hi:["nz","il"],
 pins:[[[-157.86,21.31],"Hawaiian: language nests since 1984","point"],[[174.78,-41.29],"Māori: kōhanga reo since 1982","point"],[[-3.8,52.4],"Welsh: about 538,000 speakers","point"],[[35.2,31.78],"Hebrew: revived for everyday life","point"]],
 phPins:[ph([-157.86,21.29],"Hōkūleʻa, Hawaii")],
 stat:"About 40% of the world’s languages are endangered",
 body:"When children stop learning a language at home, it can vanish within a lifetime, and with it songs, place names and knowledge of plants and animals. But languages can come back: Hebrew, for centuries used mainly in prayer and writing, became the everyday language of millions in Israel.",
 more:"In New Zealand, kōhanga reo, ‘language nests’, have taught young children in Māori since 1982, and Hawaii copied them in 1984. In Wales, about 538,000 people said they could speak Welsh in the 2021 census."}),
S({title:"Esperanto",view:[-6,40,42,62],globe:[20,52,3],card:"left",hi:["pl"],
 pins:[[[21.01,52.23],"Warsaw: Esperanto’s first book, 1887","point"],[[23.16,53.13],"Białystok: Zamenhof’s home town","point"]],
 phPins:[ph([21.01,52.25],"Warsaw’s Market Square")],
 stat:"In 1887 an eye doctor in Warsaw published a new language, Esperanto, meant to be everyone’s second language",
 body:"Ludwik Zamenhof grew up in Białystok, where Poles, Jews, Russians and Germans spoke different languages and often distrusted each other. He built Esperanto to be easy: 16 basic rules, no irregular verbs, and words drawn mostly from European languages.",
 more:"He signed his first book ‘Doktoro Esperanto’, Doctor Hopeful. Estimates of speakers today range from tens of thousands to two million, and perhaps a thousand people grew up speaking it at home."}),
S({title:"Now explore",view:W,globe:[40,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Open the Culture map and try Language family and Writing system. What does the name of your town mean? The Learning around the world tour follows writing into libraries, printing and the internet."})];

/* =====================================================================================================
   3. Learning around the world
   ===================================================================================================== */
const LEARN=[
S({title:"Learning around the world",view:W,globe:[40,30,1],
 phPins:[ph([94.8,40.04],"Mogao Caves, Dunhuang"),ph([10.1,35.68],"The Great Mosque of Kairouan"),ph([31.26,30.05],"Al-Azhar, Cairo"),ph([-6.26,53.34],"The Long Room, Dublin"),ph([29.91,31.21],"The Bibliotheca Alexandrina"),ph([-3.01,16.77],"Djinguereber Mosque, Timbuktu"),ph([105.84,21.03],"Hanoi’s Temple of Literature"),ph([8.27,50],"Gutenberg’s press")],
 stat:"About 87% of adults today can read; two centuries ago only about one in eight could",
 body:"This tour visits the places where people gathered to learn: ancient libraries, the first universities, the routes that carried paper and printing, and the cables that carry the internet.",
 more:"Learning has always travelled. Monks crossed Asia to study, books were translated from Greek into Arabic and then into Latin, and today about 7 million students study in another country."}),
S({title:"Nalanda",view:[40,4,126,48],globe:[90,28,1.6],card:"left",mode:"history",sub:"600/harsha",
 lines:[{coords:[[108.94,34.26],[103.8,36.06],[94.66,40.14],[89.19,42.95],[80.3,41.2],[75.99,39.47],[69.2,41.3],[66.97,39.65],[67.83,34.82],[71.56,34.0],[74.3,31.55],[77.2,28.6],[80.95,26.85],[85.44,25.14]],kind:"dash"}],
 pins:[[[85.44,25.14],"Nalanda","point"],[[108.94,34.26],"Chang’an (Xi’an)","point"],[[84.99,24.7],"Bodh Gaya","point"]],
 phPins:[ph([94.8,40.04],"Mogao Caves, Dunhuang")],
 stat:"Nalanda, in today’s Bihar, drew students from across Asia for some 700 years",
 body:"Founded in the 400s, this Buddhist monastery-university taught philosophy, logic, grammar and medicine. The Chinese monk Xuanzang walked there from Chang’an in the 630s (dashed line), studied for years and carried hundreds of texts home.",
 more:"The map shows the kingdom of Harsha around 600; Xuanzang visited his court too. Nalanda was sacked in the 1190s; its brick ruins became a World Heritage Site in 2016, and a new Nalanda University opened nearby in 2014."}),
S({title:"The House of Wisdom",view:[-14,8,82,50],globe:[44,33,1.6],card:"left",mode:"history",sub:"800/isl",
 pins:[[[44.36,33.31],"Baghdad","point"],[[23.73,37.97],"Athens: Greek books","point"],[[77.2,28.6],"India: numerals","point"]],
 phPins:[ph([44.38,33.32],"Baghdad and the Tigris")],
 stat:"In Abbasid Baghdad, scholars translated books from Greek, Persian and Sanskrit into Arabic",
 body:"In the 800s the caliphs of Baghdad paid scholars to collect and translate books on medicine, astronomy and mathematics; this work is linked with the ‘House of Wisdom’. There al-Khwarizmi wrote the book whose title gave us ‘algebra’, and his own name gave us ‘algorithm’.",
 more:"Baghdad had paper mills by the 790s, so books were cheaper than in Europe. Many Greek works survive only because they were translated into Arabic, and later from Arabic into Latin in Spain. The map shows the Abbasid caliphate around 800."}),
S({title:"The road of paper",view:[-110,-5,124,72],globe:[50,35,1.2],card:"left",gfRuler:{a:[112.45,34.62],b:[-0.52,38.99]},
 lines:[{coords:[[112.45,34.62],[108.94,34.26],[103.8,36.06],[94.66,40.14],[87.6,43.8],[75.99,39.47],[66.97,39.65],[59.6,36.3],[51.4,35.7],[44.36,33.31],[36.29,33.51],[31.24,30.04],[20,32],[10.1,35.68],[-4.98,34.06],[-5.6,36],[-0.52,38.99]],kind:"flow"},{coords:[[10.1,35.68],[13.36,38.12],[12.9,43.34]],kind:"flow"}],
 pins:[[[112.45,34.62],"Luoyang: Cai Lun, 105 AD","point"],[[66.97,39.65],"Samarkand: 700s","point"],[[44.36,33.31],"Baghdad: 790s","point"],[[31.24,30.04],"Cairo: 900s","point"],[[-0.52,38.99],"Xàtiva: 1100s","point"],[[12.9,43.34],"Fabriano: 1200s","point"]],
 phPins:[ph([66.97,39.66],"Shah-i-Zinda, Samarkand")],
 stat:"Paper took about 1,000 years to travel from China to Europe",
 body:"In 105 AD the court official Cai Lun reported a way of making paper from tree bark, hemp, rags and old fishing nets, though simpler paper had been made in China for some 200 years before. The secret reached Samarkand in the 700s; a famous story says Chinese prisoners taken at the Battle of Talas in 751 taught it there.",
 more:"From Baghdad paper spread across the Islamic world to Spain, where Xàtiva had a paper mill by the 1100s, about 9,300 km from Luoyang as the crow flies (drag the ruler). Italian mills such as Fabriano’s, from the 1200s, added watermarks."}),
S({title:"Al-Qarawiyyin",view:[-28,24,14,44],globe:[-3,34,4],card:"left",hi:["ma"],hiSoft:["tn"],
 lines:[{coords:[[10.1,35.68],[5,36.3],[0,35.5],[-4.98,34.06]],kind:"dash"}],
 pins:[[[-4.98,34.06],"Fez","point"],[[10.1,35.68],"Kairouan","point"]],
 stat:"Al-Qarawiyyin in Fez, founded in 859, is often called the oldest university still working",
 body:"Fatima al-Fihri, the daughter of a rich merchant who had moved to Fez from Kairouan, used her inheritance to found a mosque in 859, and it grew into a great centre for law, grammar, astronomy and medicine. Its library is one of the oldest in the world still in use.",
 more:"Whether it was a ‘university’ from the start depends on the definition; it joined Morocco’s state university system in 1963. Cairo’s al-Azhar, founded in 970, is another of the oldest places of learning still open."}),
S({title:"Bologna, Paris and Oxford",view:[-30,34,22,60],globe:[4,47,3],card:"left",hi:["it","fr","gb"],hiSoft:["es"],
 lines:[{coords:[[-1.25,51.75],[0.12,52.2]],kind:"flow"},{coords:[[11.34,44.49],[11.88,45.41]],kind:"flow"}],
 pins:[[[11.34,44.49],"Bologna, 1088","point"],[[2.35,48.85],"Paris, about 1150","point"],[[-1.25,51.75],"Oxford, by 1096","point"],[[0.12,52.2],"Cambridge, 1209","point"],[[11.88,45.41],"Padua, 1222","point"],[[-5.66,40.96],"Salamanca, 1218","point"]],
 phPins:[ph([2.35,48.86],"The Panthéon, Paris")],
 stat:"The University of Bologna, traditionally dated to 1088, is the oldest university in the Western world",
 body:"In Bologna, students who came to study law banded together in a universitas, a guild, and hired their teachers, even fining them for starting late. In Paris the teachers ran things instead, and Oxford grew on the Paris model.",
 more:"When a quarrel with the townspeople drove some Oxford scholars away in 1209, they founded Cambridge; Bologna students did the same at Padua in 1222. Lectures everywhere were in Latin, so students could move between them."}),
S({title:"Exams for an empire",view:[76,8,134,48],globe:[112,32,2],card:"left",hi:["cn","vn","kr"],
 pins:[[[116.4,39.9],"Beijing: the palace exams","point"],[[105.84,21.03],"Hanoi: Temple of Literature","point"],[[126.99,37.59],"Seoul: Sungkyunkwan, 1398","point"]],
 phPins:[ph([105.84,21.03],"Hanoi’s Temple of Literature")],
 stat:"For about 1,300 years, China chose many of its officials by written exams open to almost any man",
 body:"From 605 to 1905, candidates memorised the Confucian classics and sat for days in tiny exam cells, writing essays. Passing the highest exam could lift a family into the ruling class, though few could afford the years of study it took.",
 more:"Korea and Vietnam adopted the system. Hanoi’s Temple of Literature, built in 1070, housed Vietnam’s first university from 1076. Today over 13 million students a year sit China’s university entrance exam, the gaokao."}),
S({title:"The Library of Alexandria",view:[8,20,46,43],globe:[30,31,4],card:"left",mode:"history",sub:"bc300/ptol",
 pins:[[[29.91,31.21],"Alexandria","point"],[[27.18,39.13],"Pergamon: a rival library","point"]],
 phPins:[ph([27.33,37.94],"The Library of Celsus, Ephesus")],
 stat:"The Ptolemies’ library at Alexandria set out to collect every book in the world",
 body:"Founded in the early 200s BC, it may have held hundreds of thousands of papyrus scrolls. Ships calling at Alexandria were reportedly searched for books, which were copied; the library kept the originals and gave back the copies.",
 more:"It did not burn in one great fire, but declined over centuries. Its rival at Pergamon gave its name to parchment. In 2002 Egypt opened a new library, the Bibliotheca Alexandrina, near the old site. The map shows Ptolemaic Egypt around 300 BC."}),
S({title:"The manuscripts of Timbuktu",view:[-26,5,14,28],globe:[-3,17,3.5],card:"left",mode:"history",sub:"1500/songhai",gfRuler:{a:[-3.0,16.77],b:[-8.0,12.64]},
 pins:[[[-3.0,16.77],"Timbuktu","point"],[[-8.0,12.64],"Bamako","point"],[[-4.56,13.9],"Djenné","point"]],
 phPins:[ph([-3.01,16.78],"Djinguereber Mosque, Timbuktu")],
 stat:"Timbuktu’s families kept hundreds of thousands of handwritten books, some over 700 years old",
 body:"Caravans across the Sahara brought salt, gold and books to Timbuktu. Under the Songhai Empire in the 1400s and 1500s it had schools around its great mosques, and scholars wrote and copied works on law, astronomy, medicine and poetry.",
 more:"When armed groups occupied the city in 2012, librarians smuggled some 350,000 manuscripts in trunks and boxes to Bamako, about 700 km away (drag the ruler)."}),
S({title:"Printing spreads",view:[-30,34,26,62],globe:[8,48,3],card:"left",hi:["de"],
 lines:[{coords:[[8.27,50],[11.88,45.44],[12.34,45.43]],kind:"flow"},{coords:[[8.27,50],[2.35,48.85]],kind:"flow"},{coords:[[8.27,50],[6.96,50.94],[4.4,51.2],[-0.13,51.5]],kind:"flow"},{coords:[[8.27,50],[11.08,49.45],[14.42,50.09],[19.94,50.06]],kind:"flow"},{coords:[[8.27,50],[12.65,51.87]],kind:"flow"}],
 pins:[[[8.27,50],"Mainz, about 1450","point"],[[12.34,45.43],"Venice, 1469","point"],[[2.35,48.85],"Paris, 1470","point"],[[-0.13,51.5],"Westminster, 1476","point"],[[12.65,51.87],"Wittenberg, 1517","point"]],
 phPins:[ph([8.27,50],"Gutenberg’s press"),ph([12.65,51.87],"Wittenberg")],
 stat:"In under 30 years, printing spread from Mainz to Venice, Paris and London",
 body:"Gutenberg’s metal-type press spread along the trade routes, carried by German printers who moved from town to town, and Venice became Europe’s printing capital. Books, once copied by hand, became cheap enough for students and merchants.",
 more:"In 1517 Martin Luther’s ideas, printed in Wittenberg, spread across Germany within weeks. Reading the Bible yourself became a Protestant goal, and literacy rose fastest in Protestant lands."}),
S({title:"Learning to read",view:W,globe:[0,20,1],card:"left",hi:["se","cu"],
 pins:[[[18.07,59.33],"Sweden: church reading tests","point"],[[-82.37,23.13],"Cuba: the 1961 campaign","point"]],
 phPins:[ph([-13.23,8.48],"A classroom in Sierra Leone"),ph([67.83,34.82],"Students in Bamyan")],
 stat:"In 1820 only about 12% of the world’s adults could read; today about 87% can",
 body:"Mass reading came with Protestant churches, cheap printing and, above all, free schools paid for by governments in the 1800s and 1900s. In Sweden, the church tested every household’s reading from the late 1600s, and by 1800 most Swedes could read.",
 more:"In 1961 Cuba sent about 250,000 volunteers, many of them teenagers, into the countryside and taught over 700,000 adults to read in a year. Still, about 750 million adults cannot read, two-thirds of them women."}),
S({title:"School around the world",view:W,globe:[100,20,1],card:"left",hi:["sg","jp","kr","ee","fi"],
 pins:[[[103.82,1.35],"Singapore: top in PISA 2022","point"],[[24.94,60.17],"Finland: school starts at 7","point"],[[139.69,35.69],"Japan: the year starts in April","point"],[[149.13,-35.28],"Australia: the year starts in summer","point"]],
 phPins:[ph([103.86,1.28],"Marina Bay, Singapore")],
 stat:"Children in Finland start school at seven; in England many start at four",
 body:"In the 2022 PISA tests of 15-year-olds in 81 countries and economies, Singapore came top in maths, reading and science, with Japan, Korea, Taiwan and Estonia close behind. Finland, known for short school days and little homework, also scored above the average of rich countries.",
 more:"School years follow the seasons: Japan’s starts in April, with the cherry blossom, while in Australia, Brazil and South Africa the year starts in January or February, after the long summer holidays."}),
S({title:"Cables under the sea",view:[-100,25,5,66],globe:[-35,48,2],card:"left",hi:["ie"],hiSoft:["ca"],on:["connections"],gfRuler:{a:[-10.3,51.93],b:[-53.37,47.88]},
 pins:[[[-10.3,51.93],"Valentia Island","point"],[[-53.37,47.88],"Heart’s Content","point"]],
 stat:"Undersea cables carry over 99% of the data that crosses the oceans",
 body:"Hundreds of fibre-optic cables, together well over a million kilometres long, lie on the sea floor; most are about as thick as a garden hose. Pulses of laser light carry messages, videos and calls between continents in a fraction of a second.",
 more:"The first cable across the Atlantic, from Valentia Island in Ireland to Heart’s Content in Newfoundland, about 3,000 km (drag the ruler), opened in August 1858. Queen Victoria’s 98-word greeting took about 16 hours to send, and the cable failed within a month."}),
S({title:"The internet is born",view:[-136,30,-112,42],globe:[-120,36,5],card:"left",hi:["us"],gfRuler:{a:[-118.44,34.07],b:[-122.18,37.46]},
 pins:[[[-118.44,34.07],"UCLA, Los Angeles","point"],[[-122.18,37.46],"Stanford Research Institute","point"]],
 phPins:[ph([-118.44,34.07],"The first internet message")],
 stat:"The first message on the internet’s ancestor, sent in 1969, was ‘LO’",
 body:"On 29 October 1969 a student at UCLA tried to log in to a computer at the Stanford Research Institute, about 500 km away, over the new ARPANET. The system crashed after two letters, L and O; about an hour later the full login worked.",
 more:"At CERN, near Geneva, Tim Berners-Lee invented the World Wide Web in 1989 so that physicists could share papers. The first website went online in 1991, and CERN made the web free for everyone in 1993."}),
S({title:"Studying abroad",view:W,globe:[60,30,1],card:"left",hi:["us","gb","au","de","ca"],hiSoft:["cn","in"],
 lines:[{coords:[[116.4,39.9],[150,50],[-160,50],[-100,40],[-77,38.9]],kind:"flow"},{coords:[[116.4,39.9],[60,55],[-0.13,51.5]],kind:"flow"},{coords:[[77.2,28.6],[30,40],[-0.13,51.5]],kind:"flow"},{coords:[[77.2,28.6],[110,-10],[149.13,-35.28]],kind:"flow"},{coords:[[77.2,28.6],[60,50],[13.4,52.52]],kind:"flow"},{coords:[[116.4,39.9],[130,0],[149.13,-35.28]],kind:"flow"}],
 pins:[[[116.4,39.9],"China: about a million students abroad","point"],[[77.2,28.6],"India","point"],[[-77,38.9],"United States","point"],[[-0.13,51.5],"United Kingdom","point"],[[149.13,-35.28],"Australia","point"]],
 phPins:[ph([-6.26,53.34],"The Long Room, Dublin")],
 stat:"About 7 million students study in another country, roughly three times as many as 20 years ago",
 body:"The United States hosts the most, followed by the UK, Australia, Germany and Canada. China sends the most students abroad, about a million, followed by India.",
 more:"Still, fewer than 3% of the world’s university students study outside their home country. Students have travelled for learning for a long time: Nalanda, al-Azhar and Bologna all drew them from far away."}),
S({title:"Now explore",view:W,globe:[40,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Open the History map and step through the years to watch empires, and their centres of learning, rise and fall. Turn on Connections to trace the cables yourself. The Literature tour follows the books themselves."})];

const TOURS={
 psychology:{name:"Guided tour on psychology",short:"Psychology",hint:"WEIRD psychology, rice and wheat, compass languages, colour words, time zones, polar night, happiness and loneliness",steps:PSY},
 words:{name:"Guided tour on words on the map",short:"Words on the map",hint:"Tea or chá, borrowed words, -by and -chester, the -stans, how countries got their names, scripts, Hangul, Papua New Guinea and Esperanto",steps:WORDS},
 learning:{name:"Guided tour on learning around the world",short:"Learning",hint:"Nalanda, the House of Wisdom, the road of paper, al-Qarawiyyin, Bologna, Alexandria, Timbuktu, printing, literacy and the internet’s cables",steps:LEARN}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];
 PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"ideas",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes};
 if(typeof psLock==="function")PS_TOURS[id].steps.forEach(o=>{if(o.card)psLock(o,"card",o.card)})});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.psychology={mid:[
 {at:"Rice and wheat",st:"Rice and wheat",q:"Which crop did researchers link with more ‘holistic’, group-minded thinking in southern China?",o:["Wheat","Rice","Maize","Millet"],a:1,why:"Rice paddies need shared canals and swapped labour.",kc:"cn"},
 {at:"Which way is north?",st:"Which way is north?",q:"Speakers of Guugu Yimithirr describe where things are using…",o:["Left and right","Compass directions","Hills and rivers","The time of day"],a:1,why:"They say north, south, east and west, even indoors.",kc:"au"},
 {at:"One clock for all of China",st:"One clock for all of China",q:"How many official time zones does China use?",o:["One","Two","Four","Five"],a:0,why:"The whole country keeps Beijing time.",kc:"cn"}],
 recap:[
 {q:"Russian has two basic words for which colour?",o:["Red","Green","Blue","Yellow"],a:2,why:"Goluboy is light blue and siniy dark blue.",st:"How many colours?",kc:"ru"},
 {q:"Since 1940, Spain’s clocks have matched those of…",o:["Portugal","Britain","Germany","Morocco"],a:2,why:"Franco moved them forward to Central European Time.",st:"Spain on Berlin time",kc:"es"},
 {q:"Which country topped the World Happiness Report in 2026?",o:["Denmark","Finland","Switzerland","Costa Rica"],a:1,why:"It was Finland’s ninth year in a row at the top.",st:"The happiest countries?",kc:"fi"}]};
TOURQ.words={mid:[
 {at:"Tea or chá?",st:"Tea or chá?",q:"Languages that say ‘te’ for tea mostly got it…",o:["Overland on the Silk Roads","By sea from Fujian","From India","From Japan"],a:1,why:"Dutch traders carried the Min Chinese word ‘te’ by sea.",kc:"nl"},
 {at:"The -stans",st:"The -stans",q:"What does the ending ‘-stan’ mean?",o:["Mountain","River","Land of","King"],a:2,why:"It is Persian for ‘land of’ or ‘place of’.",kc:"kz"},
 {at:"Hangul: an alphabet by design",st:"Hangul: an alphabet by design",q:"Which king created the Korean alphabet, Hangul?",o:["Sejong","Taejo","Gwanggaeto","Jeongjo"],a:0,why:"King Sejong made it in 1443 and proclaimed it in 1446.",kc:"kr"}],
 recap:[
 {q:"Which country is named after the equator?",o:["Colombia","Ecuador","Peru","Gabon"],a:1,why:"Ecuador is Spanish for ‘equator’.",st:"How countries got their names",kc:"ec"},
 {q:"Which country has the most languages, about 840?",o:["India","Nigeria","Indonesia","Papua New Guinea"],a:3,why:"Its valleys and islands kept communities apart.",st:"Papua New Guinea: 840 languages",kc:"pg"},
 {q:"In which city was Esperanto’s first book published, in 1887?",o:["Vienna","Warsaw","Paris","Prague"],a:1,why:"Ludwik Zamenhof was an eye doctor there.",st:"Esperanto",kc:"pl"}]};
TOURQ.learning={mid:[
 {at:"The House of Wisdom",st:"The House of Wisdom",q:"Al-Khwarizmi of Baghdad gave his name to which word?",o:["Algebra","Algorithm","Alchemy","Almanac"],a:1,why:"His book’s title gave us ‘algebra’, and his name ‘algorithm’.",kc:"iq"},
 {at:"Al-Qarawiyyin",st:"Al-Qarawiyyin",q:"In which city did Fatima al-Fihri found al-Qarawiyyin in 859?",o:["Cairo","Tunis","Fez","Córdoba"],a:2,why:"It is often called the oldest university still working.",kc:"ma"},
 {at:"The manuscripts of Timbuktu",st:"The manuscripts of Timbuktu",q:"In 2012, Timbuktu’s manuscripts were smuggled to safety in…",o:["Dakar","Bamako","Niamey","Algiers"],a:1,why:"Some 350,000 went south to Mali’s capital.",kc:"ml"}],
 recap:[
 {q:"Which is the oldest university in the Western world?",o:["Oxford","Paris","Salamanca","Bologna"],a:3,why:"It is traditionally dated to 1088.",st:"Bologna, Paris and Oxford",kc:"it"},
 {q:"Where did paper first come from?",o:["Egypt","China","India","Persia"],a:1,why:"Cai Lun reported his method in 105 AD.",st:"The road of paper",kc:"cn"},
 {q:"The first transatlantic cable, in 1858, ran from Ireland to…",o:["Newfoundland","Boston","Iceland","Greenland"],a:0,why:"From Valentia Island to Heart’s Content.",st:"Cables under the sea",kc:"ie"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "psychology|Mind and place":"Rice terraces, Bali.jpg","psychology|Rice and wheat":"Terrace field yunnan china denoised.jpg",
 "psychology|Which way is north?":"Eastern Grey Kangaroo Feeding edited.jpg","psychology|How many colours?":"Pacific ocean rainbow.jpg",
 "psychology|The map in your head":"024 Aerial view of Jakobshavn Glacier at Disko Bay (Greenland) Photo by Giles Laurent.jpg","psychology|One clock for all of China":"Kashgar Old Town.jpg",
 "psychology|Spain on Berlin time":"Madrid Plaza Mayor (48733706273).jpg","psychology|Jet lag":"9V-SHI - Airbus A350-941 - Singapore Airlines - 322 - VGHS.jpg",
 "psychology|Polar night":"Northern lights in Tromso.jpg","psychology|The happiest countries?":"Catedral Luterana de Helsinki, Finlandia, 2012-08-14, DD 14.JPG",
 "psychology|Crowded and lonely?":"Tokyo Shibuya Scramble Crossing 2021-04-27.jpg","psychology|Forest bathing":"Bamboo Forest, Arashiyama, Kyoto, Japan.jpg",
 "words|Words on the map":"Statue of King Sejong.jpg","words|Tea or chá?":"Tea plantations in Longjing, Hangzhou.jpg",
 "words|Borrowed words":"Colorful Spices and Teas.jpg","words|England’s place-name layers":"Red Telephone Box in Bridge Street, Chester - geograph.org.uk - 6368287.jpg",
 "words|The -stans":"Registan 01.jpg","words|Saints and rivers":"Copacabana, Rio de Janeiro, Brazil.jpg","words|How countries got their names":"Mitad del Mundo 05.jpg",
 "words|Writing begins":"Proto cuneiform tablet OIM A12259.jpg","words|Alphabets and scripts":"Old Street Sign in Tbilisi, Georgia.jpg",
 "words|Hangul: an alphabet by design":"Gyeonghoeru (Royal Banquet Hall) at Gyeongbokgung Palace, Seoul.jpg","words|The most spoken languages":"Shanghai Pudong skyline by day.jpg",
 "words|The mountain of languages":"Old Tbilisi town in Tbilisi, Georgia.jpg","words|Papua New Guinea: 840 languages":"Papua New Guinea (5986599443).jpg",
 "words|Endangered and revived":"Hōkūleʻa from the Polynesian Voyaging Center is located behind the Hawaii Convention Center.jpg","words|Esperanto":"Market Square Warsaw (22594p).jpg",
 "learning|Learning around the world":"Afghan students in Bamyan.jpg","learning|Nalanda":"Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg","learning|Al-Qarawiyyin":"Great Mosque of Kairouan Panorama - Grande Mosquée de Kairouan Panorama.jpg","learning|Bologna, Paris and Oxford":"Long Room Interior, Trinity College Dublin, Ireland - Diliff.jpg","learning|The House of Wisdom":"Sunset in Baghdad, Iraq.jpg",
 "learning|The road of paper":"Caravane Marco Polo.jpg","learning|Exams for an empire":"Hanoi Temple of Literature (cropped).jpg",
 "learning|The Library of Alexandria":"Alexandrina Library in Alexandria, Egypt. 03.jpg","learning|The manuscripts of Timbuktu":"Djinguereber Mosque, Timbuktu.jpg",
 "learning|Printing spreads":"Gutenberg's vintage printing press in the Gutenberg Museum in Mainz, Germany (48988497077).jpg","learning|Learning to read":"Girl in a classroom in Sierra Leone.jpg",
 "learning|School around the world":"Marina Bay Singapore-3499.jpg","learning|Cables under the sea":"Ireland Cliffs of Moher BW 2025-09-11 14-27-51.jpg",
 "learning|The internet is born":"The IMP Log The Very First Message Sent on the Internet (6293913865).jpg","learning|Studying abroad":"Moscow State University crop.jpg"};
const PIN={
 /* psychology */
 "Northern lights over Tromsø":"Aurora Borealis Tromsø Norway.jpg","Rice terraces, Yunnan":"Terrace field yunnan china denoised.jpg","Shibuya Crossing, Tokyo":"Shibuya Crossing, Tokyo; December 2017.jpg",
 "Nyhavn, Copenhagen":"Nyhavn, Copenhagen, 20220618 1725 7350.jpg","The Prime Meridian, Greenwich":"Tourists taking pictures at Prime Meridian monument, Greenwich Observatory, London.jpg",
 "The Endeavour replica":"HMS Bark Endeavour - Replica01.jpg","Puerta del Sol, Madrid":"Puerta del Sol, Madrid.jpg","Monteverde cloud forest":"Monteverde Cloud Forest 01.jpg",
 "Okavango Delta, Botswana":"Okavango Delta, Botswana3.jpg","Harbin’s ice festival":"Snow and Ice World festival in Harbin, China (3238519038).jpg",
 "The Coral Sea, Queensland":"Coral Sea, Queensland (483718) (9443462706).jpg","Bamboo forest, Kyoto":"Bamboo Forest, Arashiyama, Kyoto, Japan.jpg",
 "Iceberg, Ilulissat":"Iceberg in the Ilulissat Icefjord, Greenland (54067514893).jpg","Kashgar’s old town":"Kashgar Old Town.jpg",
 "A long-haul airliner":"9V-SHI - Airbus A350-941 - Singapore Airlines - 322 - VGHS.jpg","Longyearbyen, Svalbard":"Longyearbyen-spisshus-2022.jpg",
 "Times Square at night":"Times Square at Night with crowds of people.jpg","Cacao pods":"Cocoa pod.jpg",
 /* words */
 "King Sejong":"Statue of King Sejong.jpg","A street sign in Tbilisi":"Old Street Sign in Tbilisi, Georgia.jpg","Macau":"Ruins of St. Paul, Macau, during a festival.jpg",
 "The Registan, Samarkand":"Registan 01.jpg","Mitad del Mundo, Ecuador":"Mitad del Mundo 05.jpg","An Asaro mud man":"Asaro Mud Man Kabiufa Papua New Guinea.jpg",
 "Hōkūleʻa, Hawaii":"Hōkūleʻa from the Polynesian Voyaging Center is located behind the Hawaii Convention Center.jpg","Warsaw’s Market Square":"Market Square Warsaw (22594p).jpg",
 "Tea fields, Hangzhou":"Tea plantations in Longjing, Hangzhou.jpg","Chester’s Bridge Street":"Red Telephone Box in Bridge Street, Chester - geograph.org.uk - 6368287.jpg",
 "Rio de Janeiro":"Rio de Janeiro - Cristo Redentor 01.jpg","Cerro Rico, Potosí":"Cerro Rico over Potosí, Bolivia.jpg","A cuneiform tablet":"Proto cuneiform tablet OIM A12259.jpg",
 "A Maya stela at Copán":"Frederick Catherwood - Maya Stela at Copan, Honduras - B1979.12.689 - Yale Center for British Art.jpg","The Rosetta Stone":"Rosetta Stone, British Museum - rear view.jpg",
 "Gyeongbokgung Palace, Seoul":"Gyeonghoeru (Royal Banquet Hall) at Gyeongbokgung Palace, Seoul.jpg","Shanghai":"Shanghai Pudong skyline by day.jpg",
 "Mumbai":"Mumbai Skyline with Bandra–Worli Sea Link 25 July 2018 (1).jpg","The Caucasus mountains":"Sofia Massif and Sofia Glacier, Karachay-Cherkessia, Caucasus Mountains.jpg",
 "Port Vila, Vanuatu":"Port Vila Harbour, Vanuatu.jpg",
 /* learning */
 "The Long Room, Dublin":"Long Room Interior, Trinity College Dublin, Ireland - Diliff.jpg","The Bibliotheca Alexandrina":"Alexandrina Library in Alexandria, Egypt. 03.jpg",
 "Djinguereber Mosque, Timbuktu":"Djinguereber Mosque, Timbuktu.jpg","Hanoi’s Temple of Literature":"Hanoi Temple of Literature (cropped).jpg",
 "Gutenberg’s press":"Gutenberg's vintage printing press in the Gutenberg Museum in Mainz, Germany (48988497077).jpg","Bodh Gaya":"Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg",
 "Baghdad and the Tigris":"Tigris in Baghdad 1958 04.jpg","Shah-i-Zinda, Samarkand":"Shah-i-Zinda, Samarkand (Shohi-Zinda majmuasi, Samarqand, Шахи Зинда).jpg",
 "The Library of Celsus, Ephesus":"Ephesus Celsus Library Façade.jpg","Wittenberg":"Schlosskirche Wittenberg Luftbild 2024 Toni Klemm.jpg",
 "A classroom in Sierra Leone":"Girl in a classroom in Sierra Leone.jpg","Students in Bamyan":"Afghan students in Bamyan.jpg","Marina Bay, Singapore":"Marina Bay Singapore-3499.jpg",
 "Mogao Caves, Dunhuang":"Mogao Caves (54376969262).jpg","The Great Mosque of Kairouan":"Great Mosque of Kairouan Panorama - Grande Mosquée de Kairouan Panorama.jpg","Al-Azhar, Cairo":"Mosquée Al-Azhar.jpg","The Panthéon, Paris":"Pantheon of Paris 007.JPG","The first internet message":"The IMP Log The Very First Message Sent on the Internet (6293913865).jpg"};
/* new photos (GF_IDEAS3_PHOTOS) name the stops (cards:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_IDEAS3_PHOTOS||[];
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
/* stops with their own map mode and a sub-map (culture "lang/…", people "urban", history "1600/spa"): the shared helpers read
   the tour's own mode (relief), so lend them the stop's mode while they run */
const stopT=(T,S)=>T&&S&&S.mode&&T.map&&S.mode!==T.map.mode?Object.assign({},T,{map:Object.assign({},T.map,{mode:S.mode})}):T;
if(typeof psKeyInfo==="function"){const _k=psKeyInfo;psKeyInfo=function(S,T){try{if(mine())T=stopT(T,S)}catch(e){}return _k.call(this,S,T)}}
if(typeof psAutoLabels==="function"){const _a=psAutoLabels;psAutoLabels=function(S,T){try{if(mine())T=stopT(T,S)}catch(e){}return _a.call(this,S,T)}}
/* the shared sub-map switch (psSetSub) only looks at the tour's own mode, so apply a stop's sub-map here once its mode is on */
function applySub(){try{if(!mine()||psSwitching)return;const S=psSteps()[ps.i];if(!S||!S.mode||!S.sub||!allMapsColorModeOn||allMapsColorMode!==S.mode)return;const m=S.mode,[k,f]=S.sub.split("/");
 if(m==="history"){if(typeof HIST_DATA==="undefined"||!HIST_DATA)return;const i=HIST_DATA.years.findIndex(Y=>Y.y===k);if(i<0||(histIdx===i&&histFocus===(f||null)))return;
  if(histPlaying){clearInterval(histPlaying);histPlaying=null}histFocus=f||null;histSet(i)}
 else if(typeof TH_MODES!=="undefined"&&TH_MODES.has(m)){if(allMapsSubMode[m]===k&&thFocus===(f||null))return;allMapsSubMode[m]=k;thFocus=f||null;
  document.querySelectorAll("#allMapsSubModes [data-allmaps-sub]").forEach(x=>x.classList.toggle("active",x.dataset.allmapsSub===k));applyAllMapsColorMode(document.getElementById("allMapsWrap"))}
 else return;
 try{if(typeof amGlobeOn==="function"&&amGlobeOn())amGlobeSync();if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request()}catch(e){}try{if(ps&&ps.g)ps.g.render()}catch(e){}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g2=psGo;psGo=function(){const r=_g2.apply(this,arguments);try{if(mine()||psSwitching)[0,400,1500,3500,7000].forEach(t=>setTimeout(applySub,t))}catch(e){}return r}}
/* covers for the Guided tours page cards */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={psychology:"Northern lights in Tromso.jpg",words:"Old Street Sign in Tbilisi, Georgia.jpg",learning:"Long Room Interior, Trinity College Dublin, Ireland - Diliff.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
