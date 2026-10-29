/* GeoFlock: three People & culture tours.
   sports     "Sports around the world"   football and the World Cup, cricket, baseball, hockey, rugby, runners, sumo, takraw, the Tour,
                                           the Olympics, Formula One, where sports were invented and surfing (takes over the sport stops
                                           of the old Music & sport tour, which retires once the music and sports tours both exist)
   festivals  "Festivals and holidays"    calendars, Lunar New Year, Carnival, Ramadan and Eid, Holi and Diwali, Christmas and Easter,
                                           spring new years, hanami, Inti Raymi, Oktoberfest, Día de Muertos, harvests, fire and ice, New Year
   houses     "Houses of the world"       how climate and materials shape homes, on the climate map
   Steps reuse what the World Maps view draws: the religions map (mode "culture", sub "rel/…") on the festival stops about faiths,
   the climate map, per-stop layers (on:[…]), the day-and-night gadget (gfSun), the ruler (gfRuler), the sea-level slider (gfSea) and height cross-sections in the card (xsec).
   A stop with its own map mode uses the shared per-stop switch (stopModes). Photos: Wikimedia Commons (author and licence in
   each library entry); new ones are listed in GF_CULT_PHOTOS. */
window.GF_CULT_PHOTOS=[{"f": "Sepak Takraw Bangkok.jpg", "d": "photos/xc793823d7f539c47.webp", "by": "Robertpollai", "lic": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Sepak_Takraw_Bangkok.jpg", "tour": "sports", "card": "Sepak takraw", "pins": ["Sepak takraw"]},
 {"f": "New Zealand national rugby 20191101a5.jpg", "d": "photos/x89725b4764bb7b95.webp", "by": "江戸村のとくぞう", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:New_Zealand_national_rugby_20191101a5.jpg", "tour": "sports", "card": "Rugby in the South Pacific and southern Africa", "pins": ["The haka at the 2019 World Cup, Tokyo"]},
 {"f": "Diwali Diyas 1.jpg", "d": "photos/xf49c17b18b37889e.webp", "by": "Alokjain19883105", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Diwali_Diyas_1.jpg", "tour": "festivals", "pins": ["Diwali lamps"]},
 {"f": "Snow and Ice World festival in Harbin, China (3238519038).jpg", "d": "photos/xc9e6b477d0fb50b7.webp", "by": "Rincewind42 from China", "lic": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Snow_and_Ice_World_festival_in_Harbin,_China_(3238519038).jpg", "tour": "festivals", "card": "Fire and ice in midwinter", "pins": ["Harbin’s ice city"]}];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const W=[-180,-58,180,80];
/* People & culture shelf pink, a shade per tour so pins and lines stay readable on the map */
const COL={sports:"#d6457f",festivals:"#e0609a",houses:"#c24f7f"};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
let PC=COL.sports;
const ph=(at,label,icon)=>({at,label,col:PC,icon:icon||"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||PC});

/* =====================================================================================================
   1. Sports around the world
   ===================================================================================================== */
PC=COL.sports;
const SPORTS=[
S({title:"Sports around the world",view:W,globe:[20,20,1],spin:100,
 phPins:[ph([-43.23,-22.91],"Maracanã, Rio de Janeiro"),ph([-0.17,51.53],"Lord’s, London"),ph([-83.74,42.27],"College ice hockey, Michigan"),ph([-0.17,43.45],"The Tour de France in the Pyrenees"),ph([7.42,43.74],"The Monaco Grand Prix"),ph([21.63,37.64],"The stadium at Olympia"),ph([66.5,34.3],"Buzkashi, Afghanistan")],
 stat:"Where a sport is loved is a map of history, climate and empire",
 body:"Football is played almost everywhere, but cricket follows the old British Empire, baseball follows American sailors and soldiers, and ice hockey follows the cold. This tour visits the places where the world’s favourite sports were born and where they are strongest today.",
 more:"Some sports never left home: buzkashi, in which riders fight over a goat’s carcass, is Afghanistan’s national game."}),
S({title:"The world’s game",view:[-150,-58,45,72],globe:[-25,10,1],card:"left",hi:["br","de","it","ar","fr","uy","gb","es"],
 list:[["Brazil","5"],["Germany","4"],["Italy","4"],["Argentina","3"],["France","2"],["Uruguay","2"],["England","1"],["Spain","1"]],
 pins:[[[-0.12,51.51],"London: the rules, 1863","point"]],
 phPins:[ph([2.12,41.38],"Camp Nou, Barcelona"),ph([-0.28,51.56],"Wembley Stadium"),ph([11.62,48.22],"Allianz Arena, Munich")],
 stat:"Only eight countries won the first 22 World Cups, and Brazil won the most",
 body:"Football’s modern rules were written in a London pub in 1863, when the Football Association was founded. British sailors, engineers and students carried the game round the world, and it is now the most played and watched sport on Earth.",
 more:"Up to 2022 every World Cup winner came from Europe or South America (shaded, with their titles in the list). In much of the world the game is called by its English name: fútbol, futebol, futbol."}),
S({title:"World Cup hosts",view:W,globe:[-20,20,1],card:"left",spin:85,
 G:[{t:"Hosted the men’s World Cup, 1930–2026",c:"#d6457f",codes:["uy","it","fr","br","ch","se","cl","gb","mx","de","ar","es","us","jp","kr","za","ru","qa","ca"]},{t:"New hosts in 2030 and 2034",c:"#d6457f|pale",codes:["ma","pt","py","sa"]}],
 pins:[[[-99.15,19.3],"Estadio Azteca","point"],[[-74.07,40.81],"MetLife Stadium: the 2026 final","point"],[[28.0,-26.2],"Johannesburg: Africa’s first, 2010","point"],[[51.5,25.3],"Qatar, 2022","point"]],
 phPins:[ph([-43.23,-22.91],"Maracanã, Rio de Janeiro")],
 stat:"The 2026 World Cup was the first with 48 teams, and the first shared by three countries",
 body:"The United States, Canada and Mexico hosted 104 matches in 16 cities, and the final was played at MetLife Stadium, near New York, on 19 July 2026. All but three of the 23 World Cups have been held in Europe or the Americas.",
 more:"About 200,000 people crammed into Rio’s Maracanã for the deciding match of 1950, when Uruguay stunned Brazil. The 2030 World Cup, 100 years after the first, will be shared by Spain, Portugal and Morocco, with three opening games in Uruguay, Argentina and Paraguay; Saudi Arabia hosts in 2034."}),
S({title:"Cricket and the Commonwealth",view:W,spin:-40,globe:[60,10,1],card:"left",hi:["gb","ie","in","pk","lk","bd","af","au","nz","za","zw"],hiSoft:["jm","tt","bb","gy","ag","lc","gd","vc","kn","dm"],
 pins:[[[88.34,22.56],"Eden Gardens, Kolkata","point"],[[144.98,-37.82],"Melbourne Cricket Ground","point"]],
 phPins:[ph([-0.17,51.53],"Lord’s, London")],
 stat:"Cricket is played mostly in lands once ruled by Britain, and most of its fans are in South Asia",
 body:"British soldiers, traders and teachers took cricket round their empire. Of the 12 full members of the International Cricket Council, only Afghanistan was never under British rule; many Afghans learned the game in refugee camps in Pakistan.",
 more:"India’s Premier League is one of the richest sports leagues in the world, and India–Pakistan matches are among the most watched sporting events anywhere. The West Indies team is drawn from about a dozen Caribbean countries (pale). Cricket returns to the Olympics at Los Angeles 2028."}),
S({title:"Baseball’s map",view:W,spin:-150,globe:[-30,25,1],card:"left",hi:["us","jp","do","cu","kr"],hiSoft:["ve","tw","pr","mx","pa","ni","ca"],
 pins:[[[-69.3,18.46],"San Pedro de Macorís","point"],[[135.36,34.72],"Koshien Stadium","point"]],
 phPins:[ph([132.46,34.4],"Baseball in Hiroshima")],
 stat:"Baseball rules the US, Japan, Cuba, the Dominican Republic and South Korea, but few other places",
 body:"Baseball spread with American sailors, soldiers and teachers from the 1870s. Japan, which learned it then, won three of the first five World Baseball Classics, and its national high-school tournament at Koshien Stadium fills the stands every summer.",
 more:"About one in ten Major League players comes from the Dominican Republic, and the town of San Pedro de Macorís alone has produced dozens. Japan’s Shohei Ohtani, who both pitches and hits, is one of the most famous athletes on Earth."}),
S({title:"Ice hockey and the cold north",view:W,spin:120,globe:[-30,55,1],card:"left",on:["grid"],
 hi:["ca","us","ru","se","fi","cz","sk","ch","lv","de"],
 lines:[{coords:[[-180,45],[180,45]],kind:"dash"}],
 pins:[[[-73.57,45.5],"Montreal: first indoor game, 1875","point"],[[24.94,60.17],"Helsinki","point"],[[14.42,50.09],"Prague","point"],[[-35,45],"45° north","point"]],
 phPins:[ph([-83.74,42.27],"College ice hockey, Michigan")],
 stat:"The first organised indoor ice hockey game was played in Montreal on 3 March 1875",
 body:"Hockey grew on the frozen lakes and ponds of Canada, and the countries that are best at it all have long, snowy winters. Look at the dashed line, 45° north: almost all the hockey heartlands lie north of it, where lakes freeze hard every winter.",
 more:"Up to 2022, Canada had won the men’s Olympic title nine times, more than any other country. The National Hockey League has 32 teams in the US and Canada and draws players from Sweden, Finland, Russia, Czechia, Slovakia and beyond. In Finland, Czechia and Latvia hockey is the national passion, and world championship games empty the streets."}),
S({title:"Rugby in the South Pacific and southern Africa",view:W,spin:-40,globe:[120,-25,1],card:"left",hi:["nz","za","fj","ws","to","au"],hiSoft:["gb","ie","fr","ar","jp"],
 list:[["South Africa","4"],["New Zealand","3"],["Australia","2"],["England","1"]],
 pins:[[[28.06,-26.2],"Ellis Park: the 1995 final","point"],[[174.74,-36.88],"Eden Park, Auckland","point"],[[178.44,-18.14],"Suva, Fiji","point"]],
 phPins:[ph([139.61,35.66],"The haka at the 2019 World Cup, Tokyo")],
 stat:"South Africa and New Zealand have won seven of the ten Rugby World Cups between them",
 body:"Rugby began at Rugby School in England in the 1800s and spread through the British Empire. In New Zealand, Fiji, Samoa and Tonga it is the national game, and before matches the All Blacks perform the haka, a Māori challenge, while Pacific teams answer with their own war dances.",
 more:"Fiji won Olympic gold in rugby sevens in 2016 and again at the Tokyo Games of 2021: its first Olympic medals of any kind. In 1995 Nelson Mandela, in a Springbok shirt, handed the World Cup to South Africa’s captain at Ellis Park, a moment remembered as a sign of a nation coming together."}),
S({title:"Runners from the highlands",view:[29,-6,44,11],globe:[37,2,4],card:"left",hi:["ke","et"],
 xsec:{title:"Kenya from the coast to Lake Victoria",pts:[[39.67,-4.05,"Mombasa"],[36.82,-1.29,"Nairobi"],[36.35,-0.77],[35.51,.67,"Iten"],[34.76,-.09,"Kisumu"]],mark:2000,note:"The dashed line marks 2,000 m. Iten sits on the Rift Valley’s western wall, high above the valley floor."},
 lines:[{coords:[[39.67,-4.05],[36.82,-1.29],[36.35,-0.77],[35.51,.67],[34.76,-.09]],kind:"dash"}],
 pins:[[[35.5,.67],"Iten: Home of Champions","point"],[[39.25,7.53],"Bekoji, Ethiopia","point"],[[38.75,9],"Addis Ababa","point"]],
 phPins:[ph([35.5,.67],"Runners in Iten")],
 stat:"From 2003 to 2023, every men’s marathon world record was set by a Kenyan or an Ethiopian",
 body:"Many top distance runners grow up in Kenya’s Rift Valley and Ethiopia’s highlands, 2,000 to 2,500 m up (the chart shows the climb), where thin air builds stamina. Iten, a small town at about 2,400 m, calls itself the ‘Home of Champions’.",
 more:"In 1960 Ethiopia’s Abebe Bikila won the Olympic marathon in Rome running barefoot. In 2019 Kenya’s Eliud Kipchoge became the first person to run a marathon distance in under two hours, in Vienna, though not in an official race."}),
S({title:"Sumo",view:[75,25,150,52],globe:[130,38,2],card:"left",hi:["jp"],hiSoft:["mn"],
 lines:[{coords:[[106.9,47.9],[115,44],[125,40],[133,37],[139.79,35.7]],kind:"flow"}],
 pins:[[[139.79,35.7],"Ryōgoku Kokugikan, Tokyo","point"],[[135.5,34.66],"Osaka","point"],[[136.9,35.18],"Nagoya","point"],[[130.4,33.59],"Fukuoka","point"],[[106.9,47.9],"Mongolia","point"]],
 phPins:[ph([139.79,35.7],"A sumo bout, Tokyo")],
 stat:"Japan holds six grand sumo tournaments a year: three in Tokyo and one each in Osaka, Nagoya and Fukuoka",
 body:"Sumo grew out of Shinto rituals and was performed at Japan’s imperial court over 1,000 years ago. Two wrestlers face each other in a ring 4.55 m across; you lose if you step out or touch the ground with anything but the soles of your feet.",
 more:"Wrestlers live and train together in ‘stables’ and wear their hair in a topknot. Since the 1990s many of the best have come from Mongolia, where wrestling is a national sport: Hakuhō won a record 45 top-division tournaments."}),
S({title:"Sepak takraw",view:[70,-11,128,24],globe:[108,6,2],card:"left",hi:["th","my","id","la","mm","vn","ph","sg","bn","kh"],
 pins:[[[100.5,13.75],"Bangkok","point"],[[101.69,3.14],"Kuala Lumpur","point"]],
 phPins:[ph([100.5,13.75],"Sepak takraw")],
 stat:"Sepak takraw is volleyball played with the feet, knees, chest and head",
 body:"Played across Southeast Asia for centuries, it got its name from the Malay ‘sepak’, to kick, and the Thai ‘takraw’, a woven ball. Players spike the ball over the net with somersaulting overhead kicks.",
 more:"The ball was traditionally woven from rattan; today it is usually plastic. Sepak takraw has been part of the Asian Games since 1990, and Thailand has won most of the gold medals. Myanmar’s chinlone, a gentler cousin, is played in a circle with no net and no opponents."}),
S({title:"The Tour de France",view:[-15,40.5,11,51.8],globe:[3,46,4],card:"left",hi:["fr"],
 xsec:{title:"Height along a typical Tour",pts:[[2.17,41.39,"Barcelona"],[1.5,42.4],[.15,42.91,"Tourmalet"],[-.4,43.3],[1.44,43.6,"Toulouse"],[3.09,45.78],[5.28,44.17,"Ventoux"],[6.07,45.09,"Alpe d’Huez"],[6.6,45.7],[5.04,47.32],[2.35,48.87,"Paris"]],mark:1500,note:"The dashed line marks 1,500 m. The real passes are higher than this coarse chart shows: the Tourmalet road tops out at 2,115 m."},
 lines:[{coords:[[2.17,41.39],[1.5,42.4],[.15,42.91],[-.4,43.3],[1.44,43.6],[3.09,45.78],[5.28,44.17],[6.07,45.09],[6.6,45.7],[5.04,47.32],[2.35,48.87]],kind:"dash"}],
 pins:[[[2.35,48.87],"Paris: the Champs-Élysées","point"],[[.15,42.91],"Col du Tourmalet","point"],[[6.07,45.09],"Alpe d’Huez","point"],[[5.28,44.17],"Mont Ventoux","point"],[[2.17,41.39],"Barcelona: the 2026 start","point"]],
 phPins:[ph([-.17,43.45],"The Tour de France in the Pyrenees")],
 stat:"The Tour de France covers about 3,500 km in three weeks, in 21 day-long stages",
 body:"The newspaper L’Auto started the Tour in 1903 to sell more papers, and its yellow pages gave the leader’s yellow jersey its colour. The route changes every year but usually climbs both the Pyrenees and the Alps and ends in Paris (a typical loop is drawn; the chart shows its ups and downs).",
 more:"The Tour often starts abroad: in 2026 it set off from Barcelona. Since 1975 it has usually finished on the Champs-Élysées; in 2024 it ended in Nice instead, because Paris was getting ready for the Olympics."}),
S({title:"The Olympic map",view:W,globe:[20,15,1],card:"left",spin:15,hi:["sn"],hiSoft:["gr","fr","us","gb","se","be","nl","de","fi","au","it","jp","mx","ca","ru","kr","es","cn","br"],
 pins:[[[23.74,37.97],"Athens: 1896 and 2004","point"],[[-17.45,14.7],"Dakar: Youth Olympics 2026","point"],[[2.35,48.86],"Paris: 1900, 1924, 2024","point"],[[-118.24,34.05],"Los Angeles 2028","point"],[[153,-27.5],"Brisbane 2032","point"],[[-43.2,-22.9],"Rio 2016","point"]],
 phPins:[ph([21.63,37.64],"The stadium at Olympia"),ph([23.74,37.97],"Panathenaic Stadium, Athens"),ph([-73.55,45.56],"Montreal’s Olympic Stadium")],
 stat:"Every inhabited continent has hosted the Summer Olympics except Africa",
 body:"The ancient Games were held at Olympia, in Greece, for over 1,000 years. The modern Olympics began in Athens in 1896; London and Paris have each hosted the Summer Games three times, and Los Angeles will be next to do so, in 2028.",
 more:"Africa’s first Olympic event is the Youth Olympic Games in Dakar, Senegal, from 31 October to 13 November 2026. Rio de Janeiro, in 2016, is still the only South American host; Brisbane hosts in 2032."}),
S({title:"Formula One",view:W,globe:[20,25,1],card:"left",spin:30,
 pins:[[[-1.02,52.08],"Silverstone: the first race, 1950","point"],[[7.42,43.74],"Monaco","point"],[[103.86,1.29],"Singapore: the first night race, 2008","point"],[[-46.7,-23.7],"São Paulo","point"],[[136.54,34.84],"Suzuka","point"],[[144.97,-37.85],"Melbourne","point"],[[28.08,-26],"Kyalami: Africa’s last race, 1993","point"]],
 phPins:[ph([7.42,43.74],"The Monaco Grand Prix")],
 stat:"The first Formula One World Championship race was held at Silverstone, in England, on 13 May 1950",
 body:"Formula One now races about two dozen Grands Prix a year on five continents, from Melbourne to Las Vegas. Monaco’s street race, first run in 1929, squeezes the cars between harbour, hotels and a tunnel.",
 more:"Africa has had no Grand Prix since South Africa’s at Kyalami in 1993. Many of the teams build their cars in England, in the ‘Motorsport Valley’ around Silverstone; Ferrari builds its cars at Maranello, in Italy."}),
S({title:"Where sports were invented",view:W,spin:35,globe:[-30,45,1],card:"left",
 pins:[[[-72.58,42.1],"Springfield: basketball, 1891","point"],[[-72.61,42.21],"Holyoke: volleyball, 1895","point"],[[139.7,35.7],"Tokyo: judo, 1882","point"],[[-2.8,56.34],"St Andrews: golf","point"],[[-.21,51.43],"Wimbledon: lawn tennis, 1877","point"],[[-73.57,45.5],"Montreal: ice hockey","point"]],
 phPins:[ph([-72.58,42.1],"James Naismith, inventor of basketball")],
 stat:"Basketball and volleyball were both invented in Massachusetts, in towns just 12 km apart",
 body:"In 1891 James Naismith, a Canadian teacher at a YMCA college in Springfield, invented basketball to keep students busy indoors in winter, nailing peach baskets to the balcony. In 1895, in nearby Holyoke, William G. Morgan invented a gentler game he called ‘mintonette’: volleyball.",
 more:"Judo was created in Tokyo in 1882 by Kanō Jigorō, who turned old jujutsu fighting into a sport and a way to train body and mind; it joined the Olympics at Tokyo in 1964. Golf grew up in Scotland, and lawn tennis held its first championship at Wimbledon in 1877."}),
S({title:"Surfing from Hawaii",view:W,spin:130,globe:[-150,10,1.5],card:"left",hi:["us","pf"],gfRuler:{a:[2.35,48.86],b:[-149.27,-17.85]},
 lines:[{coords:[[-157.83,21.28],[-140,30],[-122.03,36.96]],kind:"flow"}],
 pins:[[[-158.05,21.66],"Pipeline, North Shore","point"],[[-149.27,-17.85],"Teahupoʻo, Tahiti: Olympic surfing, 2024","point"],[[-122.03,36.96],"Santa Cruz: surfing reaches California, 1885","point"],[[-117.59,33.38],"Trestles: Los Angeles 2028","point"]],
 phPins:[ph([-157.83,21.28],"Waikiki, Hawaii"),ph([-149.27,-17.85],"Teahupoʻo’s wave")],
 stat:"At the Paris 2024 Olympics, the surfing was held in Tahiti, about 15,700 km from Paris",
 body:"Polynesians rode waves for centuries; in Hawaii, surfing, or heʻe nalu, was a sport of chiefs and commoners alike. It faded in the 1800s, then came back at Waikiki in the early 1900s. The ruler measures Paris to Teahupoʻo.",
 more:"Duke Kahanamoku, a Hawaiian Olympic swimming champion, showed off surfing in Australia in 1914–15 and in California, and three Hawaiian princes had already surfed at Santa Cruz in 1885. Surfing joined the Olympics at Tokyo; at Los Angeles 2028 it will be held at Trestles, in California."}),
S({title:"Now explore",view:W,globe:[20,20,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Look for the sports you play on the map: which countries share your favourite? The Olympic and World Cup host cities make a good start.",
 more:"The Festivals and holidays tour shows how people celebrate round the year."})];

/* =====================================================================================================
   2. Festivals and holidays (the faith stops use the religions map: mode "culture", sub "rel/…")
   ===================================================================================================== */
PC=COL.festivals;
const FEST=[
S({title:"Festivals and holidays",view:W,globe:[40,20,1],spin:85,
 phPins:[ph([-43.2,-22.91],"Carnival in Rio"),ph([77.38,27.65],"Holi in Barsana"),ph([-99.13,19.43],"A Día de Muertos altar"),ph([-74,40.71],"Lunar New Year in New York"),ph([39.83,21.42],"Pilgrims at the Kaaba"),ph([-61.51,10.65],"Steelpans at Trinidad’s Carnival")],
 stat:"Every culture marks its year with festivals of light, colour, food, fire, water and remembering",
 body:"Some festivals follow the Sun, some the Moon and some both, which is why their dates move around. Many began as religious or farming feasts, and many are now enjoyed by everyone, whatever their beliefs.",
 more:"This tour travels through the year, from Lunar New Year to New Year’s Eve, with stops on the religions map for festivals of faith."}),
S({title:"Sun, Moon or both",view:[-80,-5,140,55],globe:[60,25,1.2],card:"left",
 G:[{t:"Lunar calendar: Islamic festivals",c:"#2f8a63",codes:["sa"]},{t:"Lunisolar: Hebrew",c:"#9c88d1",codes:["il"]},{t:"Lunisolar: Hindu and Buddhist",c:"#f0a35e",codes:["in","np","lk"]},{t:"Lunisolar: Chinese",c:"#c92a2a",codes:["cn","tw","vn","kr"]},{t:"Solar, with its own new year",c:"#e0609a",codes:["ir","et"]}],
 pins:[[[39.83,21.42],"Mecca","point"],[[35.22,31.78],"Jerusalem","point"],[[38.75,9.03],"Ethiopia: new year on 11 September","point"]],
 stat:"Twelve months by the Moon make only about 354 days, 11 short of a year by the Sun",
 body:"The calendar most of the world uses is solar, so its holidays stay in the same season. The Islamic calendar follows the Moon alone, so its festivals move about 11 days earlier each year and go right round the seasons in about 33 years.",
 more:"Lunisolar calendars, like the Chinese, Hebrew and Hindu ones, add an extra month about once every three years to keep step with the Sun. That is why Lunar New Year, Passover and Diwali move by weeks but stay in their season."}),
S({title:"Lunar New Year",view:[55,0,150,50],globe:[115,30,1.5],card:"left",hi:["cn","tw","vn","kr"],hiSoft:["sg","my","kp"],
 lines:[{coords:[[113.26,23.13],[109,26],[106.55,29.56]],kind:"flow"},{coords:[[121.47,31.23],[119,31.6],[117.27,31.86]],kind:"flow"},{coords:[[114.06,22.54],[114,26],[112.94,28.23]],kind:"flow"},{coords:[[116.4,39.9],[115,37],[113.65,34.76]],kind:"flow"}],
 pins:[[[116.4,39.9],"Beijing","point"],[[105.85,21.03],"Hanoi: Tết","point"],[[126.98,37.57],"Seoul: Seollal","point"]],
 phPins:[ph([-74,40.71],"Lunar New Year in New York")],
 stat:"The travel rush round Chinese New Year is the largest yearly movement of people on Earth",
 body:"Lunar New Year falls on the second new moon after the winter solstice, between 21 January and 20 February; in 2026 the Year of the Horse began on 17 February. Families gather for a reunion dinner, hang red lanterns, give money in red envelopes and set off fireworks.",
 more:"Officials counted about 9 billion trips by road, rail and air in the 40-day travel season, as workers head home from the coastal cities (arrows). Vietnam celebrates Tết and Korea Seollal, and Chinese communities from Singapore to San Francisco hold dragon and lion dances."}),
S({title:"Carnival",view:[-140,-38,45,62],globe:[-40,10,1],card:"left",hi:["br","tt","it"],hiSoft:["us","bo","de"],
 pins:[[[-43.2,-22.91],"Rio de Janeiro","point"],[[-61.51,10.65],"Port of Spain","point"],[[12.34,45.43],"Venice","point"],[[-90.07,29.95],"New Orleans: Mardi Gras","point"],[[-67.11,-17.97],"Oruro, Bolivia","point"],[[6.96,50.94],"Cologne","point"]],
 phPins:[ph([-43.2,-22.91],"Carnival in Rio"),ph([-61.51,10.65],"Steelpans at Trinidad’s Carnival"),ph([12.34,45.43],"Venice")],
 stat:"Rio’s samba schools parade through the Sambadrome, a 700 m avenue built for Carnival",
 body:"Carnival is the feast before Lent, the 40 days of fasting before Easter, so its date moves with Easter; in 2026 it peaked in mid-February. Rio’s samba schools spend all year on floats, costumes and songs for their parade, judged like a competition.",
 more:"Venice is famous for its masks, worn since the Middle Ages. Trinidad’s Carnival grew from the celebrations of freed Africans after slavery ended, and Trinidad gave the world a new instrument for it: the steelpan, hammered from oil drums."}),
S({title:"Ramadan and Eid",view:[-80,-12,145,50],globe:[50,20,1.2],card:"left",mode:"culture",sub:"rel/sun+shi+ibd",
 pins:[[[39.83,21.42],"Mecca","point"],[[106.83,-6.17],"Jakarta","point"],[[90.41,23.81],"Dhaka","point"],[[31.24,30.04],"Cairo","point"]],
 phPins:[ph([39.83,21.42],"Pilgrims at the Kaaba"),ph([90.41,23.81],"Shopping before Eid, Dhaka")],
 stat:"During Ramadan, Muslims around the world fast from dawn to sunset for a month",
 body:"Ramadan is the ninth month of the Islamic lunar calendar, and it begins when the new crescent moon is seen. Each evening families break the fast together with a meal called iftar, and the month ends with Eid al-Fitr, a festival of prayers, new clothes, visits and sweets.",
 more:"Because the calendar follows the Moon, Ramadan comes about 11 days earlier each year: it began in mid-February in 2026 and will begin in early January in 2030. Eid al-Adha, about ten weeks later, falls during the Hajj, the pilgrimage to Mecca. The map shows where most people are Muslim."}),
S({title:"Holi and Diwali",view:[50,5,98,36],globe:[80,22,2.2],card:"left",mode:"culture",sub:"rel/hin",
 pins:[[[82.2,26.8],"Ayodhya","point"],[[77.38,27.65],"Barsana","point"],[[83.01,25.31],"Varanasi","point"],[[85.32,27.71],"Kathmandu: Tihar","point"]],
 phPins:[ph([77.39,27.72],"Lathmar Holi in Nandgaon"),ph([83.01,25.31],"Evening prayers at Varanasi"),ph([82.2,26.8],"Diwali lamps")],
 stat:"Diwali, the festival of lights, was added to UNESCO’s list of the world’s living heritage in 2025",
 body:"Diwali comes in October or November, on the new moon of the month of Kartik. Homes are lit with clay oil lamps and fireworks, doorsteps are decorated with coloured rangoli patterns, and families share sweets to celebrate light over darkness.",
 more:"Many Hindus remember the god Rama’s return home to Ayodhya; Sikhs and Jains celebrate their own festivals at the same time. Holi, at the full moon in February or March, welcomes spring with bonfires and then a day of throwing coloured powder and water. The map shows where most people are Hindu."}),
S({title:"Christmas and Easter",view:W,globe:[20,20,1],card:"left",spin:-20,mode:"culture",sub:"rel/cat+prot+orth+chr",gfSun:{utc:1.9,day:359},
 pins:[[[35.2,31.7],"Bethlehem","point"],[[11.08,49.45],"Nuremberg’s Christmas market","point"],[[39.04,12.03],"Lalibela: Christmas on 7 January","point"],[[151.27,-33.89],"Sydney: Christmas on the beach","point"],[[139.7,35.7],"Japan: Christmas fried chicken","point"]],
 phPins:[ph([11.08,49.45],"A Christmas market"),ph([38.76,9.03],"Holy Trinity Cathedral, Addis Ababa")],
 stat:"Christmas comes in midsummer in Australia, and on 7 January in much of the Orthodox world",
 body:"Christians, about a third of the world’s people, celebrate the birth of Jesus on 25 December. Many Orthodox churches, in Russia, Serbia, Georgia, Egypt and Ethiopia, follow the older Julian calendar, now 13 days behind, so their Christmas falls on 7 January. The map shows noon in Sydney on Christmas Day: night (shaded) covers the far north, while the far south has daylight round the clock.",
 more:"Easter mixes Sun and Moon: it is the first Sunday after the first full moon on or after 21 March, so it falls between 22 March and 25 April (in 2026 on 5 April; Orthodox Easter a week later). Christmas is also a holiday for many non-Christians: in Japan a fried-chicken dinner is a popular tradition. The map shows where most people are Christian."}),
S({title:"New year in spring",view:[-30,0,112,48],globe:[70,28,1.4],card:"left",gfSun:{utc:15,day:79},
 G:[{t:"Nowruz: new year at the March equinox",c:"#e0609a",codes:["ir","af","tj","uz","tm","kz","kg","az"]},{t:"Songkran and its cousins, in mid-April",c:"#e0609a|pale",codes:["th","la","mm","kh","lk"]}],
 pins:[[[51.39,35.69],"Tehran","point"],[[67.11,36.71],"Mazar-i-Sharif","point"],[[100.5,13.75],"Bangkok","point"],[[98.98,18.79],"Chiang Mai","point"]],
 phPins:[ph([51.39,35.69],"A Nowruz table"),ph([100.5,13.75],"Songkran water fights")],
 stat:"Nowruz begins at the exact moment of the March equinox, when the day-and-night line runs from pole to pole",
 body:"Nowruz, ‘new day’, is a 3,000-year-old Persian new year kept by about 300 million people from Turkey and the Caucasus to Central Asia. Families set a table with seven things whose Persian names begin with ‘s’, and Iran’s calendar starts its year on that day.",
 more:"In mid-April, when the Sun enters Aries in the old Indian zodiac, Thailand celebrates Songkran: water poured gently over elders’ hands has grown into giant street water fights, and Laos, Myanmar, Cambodia and Sri Lanka hold their new years too. The map shows 3 p.m. UTC on 20 March 2026, close to the equinox: the Sun has just set over Iran."}),
S({title:"Hanami: cherry blossom time",view:[110,24,148,46],globe:[136,35,3],card:"left",hi:["jp"],hiSoft:["kr"],gfRuler:{a:[127.68,26.21],b:[141.35,43.06]},
 lines:[{coords:[[127.68,26.21],[130.4,33.59],[135.76,35.01],[139.69,35.69],[140.87,38.27],[141.35,43.06]],kind:"flow"}],
 pins:[[[127.68,26.21],"Okinawa: late January","point"],[[139.69,35.69],"Tokyo: late March","point"],[[140.87,38.27],"Sendai: mid-April","point"],[[141.35,43.06],"Sapporo: early May","point"],[[128.69,35.15],"Jinhae, Korea","point"]],
 phPins:[ph([138.75,35.5],"Cherry blossom and Mount Fuji"),ph([135.78,35],"Lanterns in Kyoto")],
 stat:"Kyoto’s records of cherry blossom dates go back about 1,200 years, and 2021’s bloom was the earliest in them",
 body:"Hanami means ‘flower viewing’: in spring, friends and families picnic under the cherry trees, and parks hang lanterns for viewing at night. Japan’s weather service tracks the ‘cherry blossom front’ as it moves north, from Okinawa in January to Hokkaido in May (arrow): about 2,200 km in four months, as the ruler shows.",
 more:"Warmer springs are making the blossoms open earlier; in Kyoto they peaked on 26 March 2021. In 1912 Tokyo gave Washington, D.C., about 3,000 cherry trees, which now draw crowds of their own every spring."}),
S({title:"Inti Raymi",view:[-95,-26,-58,-2],globe:[-72,-14,3],card:"left",hi:["pe"],hiSoft:["bo","ec"],gfSun:{utc:23,day:175},
 pins:[[[-71.97,-13.52],"Cusco","point"],[[-68.67,-16.55],"Tiwanaku: the Andean new year","point"]],
 phPins:[ph([-71.98,-13.51],"Inti Raymi at Sacsayhuamán")],
 stat:"Inti Raymi, on 24 June, honours the Sun just after the shortest day of the southern year",
 body:"The Incas held their great festival of the Sun, Inti, in Cusco at the June solstice, when the Sun is lowest in the southern sky. The Spanish banned it in the 1500s; it was revived in 1944 and is now staged in Quechua at the fortress of Sacsayhuamán, above the city.",
 more:"Here it is 6 p.m. in Cusco on 24 June, and the Sun has already set (the shaded part of the map). In Bolivia, people greet the Andean new year at sunrise on 21 June at the ancient city of Tiwanaku, a national holiday since 2009."}),
S({title:"Oktoberfest and La Tomatina",view:[-25,35,20,55],globe:[2,45,3],card:"left",hi:["de","es"],
 pins:[[[11.55,48.13],"Munich: Theresienwiese","point"],[[-.79,39.42],"Buñol","point"]],
 phPins:[ph([11.55,48.13],"Oktoberfest, Munich"),ph([-.79,39.42],"La Tomatina, Buñol")],
 stat:"About 6 million people visit Munich’s Oktoberfest, which mostly takes place in September",
 body:"Oktoberfest began with horse races to celebrate a royal wedding in October 1810, on a meadow named after the bride, Therese. Today it runs for about 16 days, from late September into early October, with beer tents, rides and Bavarian music, and has copies from Canada to Brazil.",
 more:"On the last Wednesday of August, the small Spanish town of Buñol holds La Tomatina: for one hour, about 20,000 people throw over 100 tonnes of overripe tomatoes at each other. It began with a scuffle in the town square in 1945."}),
S({title:"Día de los Muertos",view:[-118,12,-86,33],globe:[-100,21,3],card:"left",hi:["mx"],hiSoft:["gt"],
 pins:[[[-99.13,19.43],"Mexico City","point"],[[-101.65,19.57],"Janitzio, Lake Pátzcuaro","point"],[[-90.73,14.65],"Sumpango, Guatemala: giant kites","point"]],
 phPins:[ph([-99.13,19.43],"A Día de Muertos altar"),ph([-98.95,20.27],"An altar in Actopan, Hidalgo")],
 stat:"On 1 and 2 November, families in Mexico welcome back the souls of the dead",
 body:"Families build home altars, ofrendas, with photos, candles, sugar skulls, pan de muerto bread and the dead person’s favourite food, and orange marigolds whose colour and scent are said to guide the souls home. Many spend the night in decorated cemeteries.",
 more:"The festival blends Indigenous traditions with the Catholic days of All Saints and All Souls, and is on UNESCO’s heritage list. Mexico City’s big parade only began in 2016, inspired by the opening of a James Bond film. In Guatemala, Sumpango flies giant kites to send messages to the dead."}),
S({title:"Harvest moons and Thanksgiving",view:W,globe:[20,30,1],card:"left",spin:55,hi:["us","ca","kr","cn"],hiSoft:["tw","vn","in","gh"],
 pins:[[[-70.66,41.96],"Plymouth: the harvest feast of 1621","point"],[[-75.7,45.42],"Canada: October","point"],[[126.98,37.57],"Seoul: Chuseok","point"],[[121.47,31.23],"Mid-Autumn Festival","point"],[[80.27,13.08],"Tamil Nadu: Pongal","point"],[[-.19,5.6],"Accra: Homowo","point"]],
 phPins:[ph([126.98,37.57],"Songpyeon for Chuseok")],
 stat:"Canada gives thanks on the second Monday of October, the United States on the fourth Thursday of November",
 body:"Thanksgiving in the US remembers a harvest feast shared in 1621 by English settlers at Plymouth and the Wampanoag people; Canada’s, earlier in autumn, fits its earlier harvest. In both, families travel home for a big dinner, often of roast turkey.",
 more:"In East Asia the harvest festival falls on the full moon of the eighth lunar month: China’s Mid-Autumn Festival, with mooncakes and lanterns, and Korea’s Chuseok, when families visit ancestral homes. Tamil Nadu celebrates Pongal in January, and the Ga people of Accra hold Homowo, ‘hooting at hunger’."}),
S({title:"Fire and ice in midwinter",view:[-100,35,145,68],globe:[60,55,1],card:"left",hi:["gb","cn"],hiSoft:["jp","se"],
 pins:[[[-1.15,60.15],"Lerwick, Shetland: Up Helly Aa","point"],[[126.63,45.75],"Harbin","point"],[[141.35,43.06],"Sapporo Snow Festival","point"],[[20.62,67.85],"The Icehotel, Sweden","point"]],
 phPins:[ph([-1.15,60.15],"Up Helly Aa, Lerwick"),ph([126.63,45.75],"Harbin’s ice city"),ph([20.62,67.85],"Inside the Icehotel")],
 stat:"Harbin builds a whole city of ice each winter, from blocks cut out of the frozen Songhua River",
 body:"In Harbin, in north-east China, January nights average about −24 °C. Since 1985 its Ice and Snow Festival has turned river ice into castles, slides and towers lit from inside in every colour.",
 more:"On the last Tuesday of January in Lerwick, Shetland, about 1,000 torch-carrying ‘guizers’ drag a replica Viking longship through the streets and set it on fire, remembering the islands’ Norse past. Sweden’s Icehotel builds new rooms from the ice of the Torne River every winter, and they melt away every spring."}),
S({title:"Hogmanay and the race to midnight",view:W,globe:[0,30,1],card:"left",spin:165,on:["timezones"],hi:["gb"],hiSoft:["ki","as"],
 pins:[[[-157.4,1.87],"Kiritimati: first to the new year","point"],[[-3.19,55.95],"Edinburgh: Hogmanay","point"],[[-73.99,40.76],"Times Square","point"],[[-170.7,-14.28],"American Samoa: among the last","point"]],
 phPins:[ph([-157.4,1.87],"Kiritimati from the air"),ph([-73.99,40.76],"Times Square at night")],
 stat:"Kiribati’s Kiritimati sees in the new year first; American Samoa, 25 hours later, is among the last",
 body:"Midnight sweeps round the world one time zone at a time, and the fireworks follow it. In Scotland, New Year’s Eve is Hogmanay: crowds sing ‘Auld Lang Syne’, and the first visitor across the doorstep after midnight, the ‘first-foot’, brings gifts for luck.",
 more:"New Year was long Scotland’s biggest winter holiday; Christmas only became a public holiday there in 1958. In Spain people eat 12 grapes on the 12 strokes of midnight, and in Japan temple bells ring 108 times."}),
S({title:"Now explore",view:W,globe:[40,20,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Which festivals does your family keep, and when do they fall this year? Switch to the religions map to see where each faith is strongest, or turn on time zones to follow midnight round the world.",
 more:"The Houses of the world tour shows how people live, from igloos to houseboats."})];

/* =====================================================================================================
   3. Houses of the world (on the climate map; the city stops turn on the cities layer)
   ===================================================================================================== */
PC=COL.houses;
const HOUSES=[
S({title:"Houses of the world",view:W,globe:[40,20,1],spin:60,
 phPins:[ph([106.8,47.6],"A Mongolian ger"),ph([48.63,15.93],"The mud tower houses of Shibam"),ph([-69.97,-15.82],"Uros reed islands"),ph([2.42,6.47],"Ganvié, a town on stilts"),ph([4.89,52.37],"Amsterdam’s canal houses"),ph([34.84,38.63],"Uçhisar, Cappadocia"),ph([8.2,56.5],"A thatched cottage in Denmark"),ph([76.4,9.5],"Kerala’s houseboats"),ph([114.17,22.3],"Hong Kong at night")],
 stat:"Before central heating and air conditioning, every home had to suit its climate, using what lay close at hand",
 body:"The map is coloured by climate. Desert homes have thick walls and small windows, rainy places have steep roofs, the flooded tropics build on stilts, and herders carry their homes with them. Snow, mud, reeds, timber, stone and felt all make good houses.",
 more:"This tour visits homes from the Arctic to the equator, and ends in the crowded cities where most people now live."}),
S({title:"Snow houses",view:[-175,48,-20,82],globe:[-70,68,1.3],card:"left",hi:["ca","gl"],gfSun:{utc:17,day:355},
 pins:[[[-81.8,69.38],"Igloolik","point"],[[-68.52,63.75],"Iqaluit","point"]],
 phPins:[ph([-81.8,69.38],"Building an igloo")],
 stat:"With a small lamp and body heat, an igloo can be more than 30 °C warmer inside than out",
 body:"In Inuktitut, iglu means any house. Inuit in the central Canadian Arctic built snow-block domes as winter homes and hunters still build them as shelters: snow is full of trapped air, so it insulates well. The entrance tunnel sits low to trap cold air, and the sleeping platform sits high where warm air gathers.",
 more:"Here it is midwinter, 21 December: north of the Arctic Circle the Sun does not rise. Today most Inuit live in wooden houses in towns, but children still learn to build igloos. In Sweden the Icehotel builds new rooms from river ice every winter."}),
S({title:"Yurts and gers",view:[20,30,125,56],globe:[90,45,1.6],card:"left",hi:["mn","kg","kz"],hiSoft:["tm","uz","tj"],
 pins:[[[106.92,47.92],"Ulaanbaatar’s ger districts","point"],[[75.12,41.85],"Song-Köl, Kyrgyzstan","point"]],
 phPins:[ph([106.8,47.6],"A Mongolian ger"),ph([75.12,41.85],"Yurts at Song-Köl")],
 stat:"A Mongolian family can take down its ger, pack it on a truck or a few camels and put it up again in a few hours",
 body:"Herders on the Central Asian steppe live in round tents of felt, made from their sheep’s wool, over a folding wooden lattice and roof poles. The round shape stands up to the steppe winds, and the felt keeps out winters of −40 °C.",
 more:"Kyrgyzstan’s flag shows the tunduk, the wooden crown at the top of a yurt. Around half of Ulaanbaatar’s people live in ‘ger districts’ on the city’s edges, in gers and small houses, without the piped water and heating of the flats in the centre."}),
S({title:"Houses on stilts",view:W,spin:40,globe:[40,0,1],card:"left",hi:["bj","bn","kh","pe"],hiSoft:["my","id","ph","th","vn","mm","br"],
 pins:[[[2.42,6.47],"Ganvié, Benin","point"],[[114.94,4.88],"Kampong Ayer, Brunei","point"],[[103.83,13.25],"Tonlé Sap, Cambodia","point"],[[-73.24,-3.76],"Belén, Iquitos, Peru","point"]],
 phPins:[ph([2.42,6.47],"Ganvié, a town on stilts"),ph([114.94,4.88],"Kampong Ayer, Brunei"),ph([103.83,13.25],"A floating village on Tonlé Sap")],
 stat:"Ganvié, on Lake Nokoué in Benin, is a town of 20,000 or more people living in houses on stilts",
 body:"In the hot, wet tropics, raising a house on stilts keeps it above floods, lets breezes cool the floor and keeps out snakes and pests. The space underneath can shelter boats, animals or a workshop.",
 more:"Brunei’s Kampong Ayer is a whole water town of wooden houses joined by boardwalks. On Cambodia’s Tonlé Sap, a lake that swells several times over in the monsoon, and on the Amazon, where rivers rise by 10 m or more, some homes float on rafts instead."}),
S({title:"Building with earth",view:W,spin:95,globe:[-20,28,1],card:"left",hi:["us","ml","ye"],
 pins:[[[-105.55,36.44],"Taos Pueblo, New Mexico","point"],[[-4.56,13.91],"Djenné, Mali","point"],[[48.63,15.93],"Shibam, Yemen","point"]],
 phPins:[ph([48.63,15.93],"The mud tower houses of Shibam"),ph([-4.56,13.91],"Djenné’s mud-brick mosque"),ph([-105.55,36.44],"Taos Pueblo"),ph([-110.6,35.84],"A Hopi village on Second Mesa")],
 stat:"Shibam’s mud-brick tower houses rise five to eleven storeys, earning it the name ‘Manhattan of the desert’",
 body:"In hot, dry places, thick walls of sun-dried mud brick (adobe) or rammed earth soak up the day’s heat slowly and give it back at night, keeping rooms cool by day and warm after dark. Taos Pueblo, in New Mexico, has been lived in for about 1,000 years.",
 more:"In Djenné, Mali, townspeople replaster the Great Mosque, the world’s largest mud-brick building, every year. Shibam’s towers, mostly rebuilt since the 1500s, stand packed inside a wall against floods and raiders; the town is a World Heritage Site."}),
S({title:"Living underground",view:[-80,22,120,50],globe:[55,36,1.2],card:"left",hi:["tn","tr","cn"],
 pins:[[[10,33.54],"Matmata, Tunisia","point"],[[34.73,38.37],"Derinkuyu underground city","point"],[[109.49,36.6],"Yan’an: yaodong","point"]],
 phPins:[ph([34.84,38.63],"Uçhisar, Cappadocia"),ph([10,33.54],"A pit house in Matmata"),ph([109.49,36.6],"Yaodong cave homes")],
 stat:"Tens of millions of people in northern China still live in yaodong, homes dug into the soft yellow loess",
 body:"A few metres underground the temperature hardly changes all year, so caves are cool in summer and warm in winter. In Matmata, in southern Tunisia, Amazigh (Berber) families dug round courtyard pits with rooms in the walls; one of them played Luke Skywalker’s home in Star Wars.",
 more:"In Cappadocia, in Turkey, people carved homes, churches and whole underground cities into soft volcanic rock; Derinkuyu goes down about 85 m. On China’s Loess Plateau, yaodong are dug into hillsides or around sunken courtyards."}),
S({title:"The round houses of Fujian",view:[104,17,128,32],globe:[117,25,3],card:"left",hi:["cn"],
 pins:[[[117.06,24.59],"Tianluokeng tulou","point"],[[116.98,24.66],"Yongding","point"]],
 phPins:[ph([117.06,24.59],"Tianluokeng tulou")],
 stat:"A single Fujian tulou could house a whole clan, sometimes several hundred people",
 body:"From the 1100s to the 1900s, Hakka and other families in the hills of south-west Fujian built huge round or square homes of rammed earth, three to five storeys high. Every room faces an inner courtyard, with the family shrine in the middle.",
 more:"With one gate and windows only on the upper floors, a tulou was a fortress against bandits; its earth walls, over a metre thick at the base, keep it cool in summer. The cluster at Tianluokeng is nicknamed ‘four dishes and a soup’. Forty-six tulou became a World Heritage Site in 2008."}),
S({title:"Toraja tongkonan",view:[112,-8,126,1],globe:[120,-3,3.5],card:"left",hi:["id"],
 xsec:{title:"Sulawesi from the coast to Tana Toraja",pts:[[119.62,-4.01,"Parepare"],[119.9,-2.97,"Rantepao"],[120.19,-2.99,"Palopo"]],mark:1000,note:"Tana Toraja’s valleys lie high in Sulawesi’s mountains, cooler and rainier than the coast; the peaks round them pass 2,000 m."},
 pins:[[[119.9,-2.97],"Rantepao, Tana Toraja","point"]],
 phPins:[ph([119.9,-2.97],"Tongkonan houses, Tana Toraja")],
 stat:"Toraja tongkonan houses have huge saddle-shaped roofs that sweep up at both ends",
 body:"In the mountains of Sulawesi, in Indonesia (the chart shows the climb from the coast), Toraja families build their ancestral houses, tongkonan, on wooden piles, traditionally facing north. A tongkonan belongs to a whole extended family and is the heart of its ceremonies, from weddings to funerals.",
 more:"Rows of buffalo horns on the front post record ceremonies held by the family. Smaller houses opposite, built the same way, are rice barns."}),
S({title:"Ndebele painted houses",view:[14,-35,36,-20],globe:[27,-27,4],card:"left",hi:["za"],
 pins:[[[28.7,-25.43],"KwaMhlanga","point"],[[29.36,-25.77],"Botshabelo","point"]],
 phPins:[ph([28.7,-25.43],"A painted Ndebele house")],
 stat:"Ndebele women paint their homes with bold geometric patterns, a skill passed from mother to daughter",
 body:"In South Africa’s Mpumalanga and Gauteng, Ndebele homesteads are decorated with bright, symmetrical designs, outlined in black. The tradition grew in the 1900s as a way for Ndebele families to show who they were.",
 more:"Artists once used natural clays and ochres, and later bright bought paints. The painter Esther Mahlangu took the patterns round the world; in 1991 she even painted a BMW racing car."}),
S({title:"Maasai homes",view:[24,-9,44,3],globe:[36,-2,4],card:"left",hi:["ke","tz"],
 pins:[[[35.1,-1.5],"Maasai Mara","point"],[[35.5,-3.2],"Ngorongoro","point"]],
 phPins:[ph([35.1,-1.5],"A Maasai homestead"),ph([36.8,-2.6],"A Maasai dancer")],
 stat:"Maasai women build their families’ houses from branches, mud and cow dung",
 body:"On the savannas of southern Kenya and northern Tanzania, Maasai herders traditionally live in an enkang, often called a manyatta: a ring of low, loaf-shaped houses inside a fence of thorn bushes. At night the cattle stay in the middle, safe from lions and hyenas.",
 more:"Plaster of dung and mud dries hard and keeps out the rain, and the houses are easy to rebuild when families move to find fresh grass. Many Maasai now live in towns or in houses with iron roofs."}),
S({title:"Steep roofs for rain and snow",view:[-110,20,145,62],globe:[60,45,1],card:"left",hi:["gb","ie","dk","jp"],
 pins:[[[136.91,36.26],"Shirakawa-go","point"],[[1.1,52.4],"Norfolk","point"]],
 phPins:[ph([8.2,56.5],"A thatched cottage in Denmark"),ph([136.91,36.26],"Shirakawa-go’s farmhouses"),ph([1.1,52.4],"A Norfolk village")],
 stat:"In Shirakawa-go, Japan, thatched roofs as steep as hands joined in prayer shed metres of snow",
 body:"Where it rains or snows a lot, roofs are steep so water and snow slide off. Thatch of reeds or straw, common in England, Ireland and Denmark, sheds rain and keeps a house warm; a good reed roof can last 50 years.",
 more:"Japan’s old farmhouses, minka, were built of timber, earth and paper with heavy thatched roofs. In the snowy mountain villages of Shirakawa-go and Gokayama the attics, under roofs called gasshō, ‘praying hands’, were used to raise silkworms, and villagers still rethatch them together."}),
S({title:"The Dutch canal house",view:[0,50.7,7.5,53.7],globe:[4.9,52.3,6],card:"left",hi:["nl"],gfSea:1,gfSeaUI:true,
 pins:[[[4.89,52.37],"Amsterdam","point"],[[4.48,52.16],"Leiden","point"]],
 phPins:[ph([4.89,52.37],"Amsterdam’s canal houses")],
 stat:"Amsterdam’s canal houses are tall and narrow, with a hook at the top to hoist furniture through the windows",
 body:"Merchants of the 1600s and 1700s built along the canals, where every metre of waterfront was precious, so plots were narrow and deep. The staircases inside are too steep and narrow for furniture, so it goes up on a rope from the beam at the top.",
 more:"Amsterdam is built on soggy ground, much of it at or below sea level: the blue shows land that would flood without dykes if the sea rose 1 m (try the slider). So every old house stands on wooden piles; the Royal Palace on Dam Square rests on 13,659 of them."}),
S({title:"Cities of towers",view:[85,-4,126,28],globe:[110,12,2.5],card:"left",on:["cities"],hi:["hk","sg"],
 pins:[[[114.17,22.3],"Hong Kong","point"],[[103.85,1.29],"Singapore","point"],[[114.19,22.33],"Kowloon Walled City, pulled down 1993–94","point"]],
 phPins:[ph([114.17,22.3],"Hong Kong at night"),ph([103.9,1.31],"Singapore’s shophouses")],
 stat:"About three in four Singaporeans live in flats built by the government’s Housing and Development Board",
 body:"Where land is scarce, homes go up. Hong Kong has more skyscrapers than any other city, and about 45% of its people live in public rental or subsidised flats. Singapore’s public housing estates come with their own schools, markets and parks, and most families own their flats.",
 more:"Older Singapore lived in two- or three-storey shophouses, with a shop below and the family above. Hong Kong’s Kowloon Walled City, pulled down in 1993–94, packed about 33,000 people into 2.6 hectares: perhaps the most crowded place there has ever been."}),
S({title:"Informal settlements",view:W,spin:100,globe:[0,0,1],card:"left",on:["cities"],hi:["in","ke","br","co"],
 pins:[[[72.86,19.04],"Dharavi, Mumbai","point"],[[36.79,-1.31],"Kibera, Nairobi","point"],[[27.86,-26.25],"Soweto, Johannesburg","point"],[[-43.25,-22.99],"Rocinha, Rio de Janeiro","point"],[[-75.55,6.29],"Medellín’s cable cars","point"]],
 phPins:[ph([72.86,19.04],"Dharavi, Mumbai")],
 stat:"More than a billion people live in informal settlements, neighbourhoods built by their residents without formal planning or title",
 body:"When cities grow faster than housing can be built, newcomers build homes for themselves on spare land: favelas in Brazil, Kibera in Nairobi, Dharavi in Mumbai. Many lack secure water, sanitation or legal title, yet they are busy neighbourhoods with shops, schools and workshops.",
 more:"Dharavi’s recycling, pottery and leather workshops sell their goods across India. Many cities now upgrade settlements rather than clear them, bringing water, sewers and title deeds; Medellín, in Colombia, built cable cars to link its hillside neighbourhoods to the metro."}),
S({title:"Homes on the water",view:W,spin:70,globe:[20,20,1],card:"left",hi:["in","nl","pe","bo"],
 pins:[[[76.4,9.5],"Kerala backwaters","point"],[[74.86,34.11],"Dal Lake, Srinagar","point"],[[4.89,52.37],"Amsterdam","point"],[[-69.97,-15.82],"Lake Titicaca","point"]],
 phPins:[ph([76.4,9.5],"Kerala’s houseboats"),ph([-69.97,-15.82],"Uros reed islands"),ph([105.78,10.03],"A floating market, Cần Thơ")],
 stat:"The Uros people of Lake Titicaca live on islands they build themselves from totora reeds",
 body:"The reeds at the bottom of each island slowly rot, so islanders keep adding fresh layers on top. In Kerala, in southern India, old rice barges called kettuvallam have become houseboats on the backwaters, and Amsterdam has about 2,500 houseboats moored along its canals.",
 more:"On Srinagar’s Dal Lake, carved wooden houseboats date from the 1800s. In the Netherlands, new floating homes are built to rise and fall with the water."}),
S({title:"Now explore",view:W,globe:[40,20,1],
 stat:"Find your own climate on the map: which of these homes would suit it?",
 body:"Hover the map to see each climate. Switch to the population map to see where the world’s biggest cities are growing, and where most people now live in flats and towers.",
 more:"The Cities tour looks more closely at how cities grow."})];

/* ---------- the three tours ---------- */
const fix=s=>{if(s.G){s._hsMerged=1;s.legend=null;s.hi=s.hi||[...new Set(s.G.flatMap(g=>g.codes))];s.hiSoft=s.hiSoft||[]}return s};
const TOURS={
 sports:{name:"Guided tour on sports around the world",short:"Sports",hint:"The World Cup, cricket, baseball, hockey, rugby, highland runners, sumo, takraw, the Tour de France, the Olympics and surfing",steps:SPORTS,mode:"relief"},
 festivals:{name:"Guided tour on festivals and holidays",short:"Festivals",hint:"Lunar New Year, Carnival, Ramadan, Diwali, Christmas, Nowruz, cherry blossom, Día de Muertos and the race to midnight",steps:FEST,mode:"relief"},
 houses:{name:"Guided tour on houses of the world",short:"Houses",hint:"Igloos, gers, stilt houses, mud skyscrapers, cave homes, painted houses, canal houses and towers, on the climate map",steps:HOUSES,mode:"climate"}};
const IDS=Object.keys(TOURS);
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))].filter(m=>m!==T.mode);
 PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:T.mode},group:"culture",col:COL[id],steps:T.steps.map(fix),stopModes:modes.length>0,alsoOn:modes};
 /* the shared tidy-up resets card sides; lock the ones these stops set */
 if(typeof psLock==="function")PS_TOURS[id].steps.forEach(o=>{if(o.card)psLock(o,"card",o.card)})});
/* on the Tours page, after Food (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});const a=o.indexOf("food");o.splice(a>=0?a+1:o.length,0,...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.sports={mid:[
 {at:"World Cup hosts",st:"World Cup hosts",q:"Which three countries shared the 2026 World Cup?",o:["Spain, Portugal and Morocco","The US, Canada and Mexico","Japan, South Korea and China","Brazil, Argentina and Uruguay"],a:1,why:"It was the first World Cup with 48 teams; the final was played near New York.",kc:"mx"},
 {at:"Ice hockey and the cold north",st:"Ice hockey and the cold north",q:"In which city was the first organised indoor ice hockey game played, in 1875?",o:["Boston","Montreal","Stockholm","Moscow"],a:1,why:"At the Victoria Skating Rink, on 3 March 1875.",kc:"ca"},
 {at:"Runners from the highlands",st:"Runners from the highlands",q:"Why do so many champion distance runners come from Kenya’s Rift Valley and Ethiopia’s highlands?",o:["They live by the sea","They grow up 2,000 m or more above sea level","It never rains there","They play cricket"],a:1,why:"Thin air at altitude builds stamina.",kc:"ke"},
 {at:"Sepak takraw",st:"Sepak takraw",q:"In sepak takraw, which can players NOT use to hit the ball?",o:["Feet","Head","Hands","Knees"],a:2,why:"It is like volleyball played with the feet, knees, chest and head.",kc:"th"}],
 recap:[
 {q:"Which country has won the most Rugby World Cups?",o:["New Zealand","England","South Africa","Australia"],a:2,why:"Four titles: 1995, 2007, 2019 and 2023.",st:"Rugby in the South Pacific and southern Africa",kc:"za"},
 {q:"Basketball was invented in 1891 in which US town?",o:["Springfield, Massachusetts","Chicago","Los Angeles","New York"],a:0,why:"By James Naismith, a Canadian teacher at a YMCA college.",st:"Where sports were invented",kc:"us"},
 {q:"Where was the surfing held at the Paris 2024 Olympics?",o:["Biarritz","Hawaii","Tahiti","Portugal"],a:2,why:"At Teahupoʻo, about 15,700 km from Paris.",st:"Surfing from Hawaii",kc:"pf"},
 {q:"Many of sumo’s top wrestlers since the 1990s have come from which country?",o:["Mongolia","Brazil","China","Russia"],a:0,why:"Hakuhō, from Mongolia, won a record 45 top-division tournaments.",st:"Sumo",kc:"mn"}]};
TOURQ.festivals={mid:[
 {at:"Sun, Moon or both",st:"Sun, Moon or both",q:"Why does Ramadan come about 11 days earlier each year?",o:["Its calendar follows the Moon","Leap years","Daylight saving time","It follows the stars"],a:0,why:"Twelve lunar months make about 354 days.",kc:"sa"},
 {at:"Holi and Diwali",st:"Holi and Diwali",q:"Which festival is called the festival of lights?",o:["Holi","Diwali","Songkran","Hanami"],a:1,why:"Homes are lit with clay oil lamps and fireworks.",kc:"in"},
 {at:"New year in spring",st:"New year in spring",q:"Nowruz, the Persian new year, begins at which moment?",o:["The March equinox","The full moon","The first snow","Midnight on 1 January"],a:0,why:"It starts at the exact moment of the equinox.",kc:"ir"},
 {at:"Día de los Muertos",st:"Día de los Muertos",q:"Which flowers decorate altars for Mexico’s Day of the Dead?",o:["Tulips","Marigolds","Cherry blossoms","Lotuses"],a:1,why:"Their colour and scent are said to guide souls home.",kc:"mx"}],
 recap:[
 {q:"Which country invented the steelpan for its Carnival?",o:["Jamaica","Brazil","Trinidad and Tobago","Cuba"],a:2,why:"It is hammered from oil drums.",st:"Carnival",kc:"tt"},
 {q:"In which city do people throw tomatoes at La Tomatina?",o:["Munich","Buñol","Venice","Seville"],a:1,why:"On the last Wednesday of August.",st:"Oktoberfest and La Tomatina",kc:"es"},
 {q:"Inti Raymi honours the Sun in which city?",o:["Cusco","Mexico City","Quito","La Paz"],a:0,why:"On 24 June, at the Inca fortress of Sacsayhuamán.",st:"Inti Raymi",kc:"pe"},
 {q:"Which place sees in each new year first?",o:["New Zealand","Japan","Kiribati’s Kiritimati","Samoa’s Apia"],a:2,why:"Its time zone is 14 hours ahead of UTC.",st:"Hogmanay and the race to midnight",kc:"ki"}]};
TOURQ.houses={mid:[
 {at:"Yurts and gers",st:"Yurts and gers",q:"Which country’s flag shows the crown of a yurt?",o:["Mongolia","Kazakhstan","Kyrgyzstan","Turkmenistan"],a:2,why:"It is called the tunduk.",kc:"kg"},
 {at:"Houses on stilts",st:"Houses on stilts",q:"Ganvié, a town of houses on stilts in a lake, is in which country?",o:["Benin","Brunei","Peru","Cambodia"],a:0,why:"On Lake Nokoué, near Cotonou.",kc:"bj"},
 {at:"Building with earth",st:"Building with earth",q:"Which town’s mud-brick towers earned it the name ‘Manhattan of the desert’?",o:["Djenné","Shibam","Taos","Timbuktu"],a:1,why:"Its tower houses rise five to eleven storeys.",kc:"ye"},
 {at:"The round houses of Fujian",st:"The round houses of Fujian",q:"What are Fujian’s round tulou made of?",o:["Bamboo","Rammed earth","Snow","Steel"],a:1,why:"Earth walls over a metre thick at the base.",kc:"cn"}],
 recap:[
 {q:"Where do people live in pit houses dug into the ground, one of which appeared in Star Wars?",o:["Matmata, Tunisia","Cappadocia, Turkey","Shibam, Yemen","Taos, USA"],a:0,why:"Amazigh (Berber) families dug round courtyard pits.",st:"Living underground",kc:"tn"},
 {q:"Why do Amsterdam’s canal houses have a hook at the top?",o:["For flags","To hoist furniture","For bells","To catch rain"],a:1,why:"The stairs are too steep and narrow for furniture.",st:"The Dutch canal house",kc:"nl"},
 {q:"The Uros build their island homes from what?",o:["Bamboo","Reeds","Ice","Mud"],a:1,why:"Totora reeds on Lake Titicaca.",st:"Homes on the water",kc:"pe"}]};
}}catch(e){}

/* ---------- photos: card photos by "tour|stop", photo pins by label (Commons file names) ---------- */
const CARD={
 "sports|Sports around the world":"Maracanã stadium.jpg","sports|The world’s game":"Camp Nou aerial.jpg","sports|World Cup hosts":"Maracanã stadium.jpg",
 "sports|Cricket and the Commonwealth":"Cricket at Lord's (16545553043).jpg","sports|Baseball’s map":"Hiroshima Municipal Baseball Stadium 2009.JPG",
 "sports|Runners from the highlands":"Mount Kenya Peaks.jpg","sports|Ice hockey and the cold north":"Yost Ice Arena, Michigan Ice Hockey Game During Intermission.jpg","sports|The Tour de France":"Peloton during Simacourbe climb of Tour de France 2024 stage 13.jpg",
 "sports|The Olympic map":"Ancient Olympia Stadium in Greece (51224128585).jpg","sports|Formula One":"2013 Monaco Grand Prix - Sunday.jpg","sports|Surfing from Hawaii":"Waikiki and Diamond Head.jpg",
 "festivals|Festivals and holidays":"Latvian Song festival 2008.jpg","festivals|Lunar New Year":"Dragon dance meets bird at NYC Lunar New Year parade (52336)e.jpg","festivals|Carnival":"Carnival in Rio de Janeiro.jpg",
 "festivals|Ramadan and Eid":"Pilgrims begin this year's Hajj rituals with a circumambulation of the Kaaba (2025) (2).jpg","festivals|Holi and Diwali":"Barsana Holi Festival.jpg",
 "festivals|Christmas and Easter":"Panoramic View of the Holy Trinity Cathedral, Addis Ababa, Ethiopia (3435906326).jpg","festivals|Hanami: cherry blossom time":"Lake Kawaguchiko Sakura Mount Fuji 4.JPG",
 "festivals|Día de los Muertos":"Ofrenda Día de Muertos Zócalo 2014.jpg","festivals|Fire and ice in midwinter":"ICEHOTEL Main Hall (2014) by Alessandro Falca & AnnaSofia Mååg.jpg",
 "festivals|Hogmanay and the race to midnight":"Castle, City of Edinburgh (IMG 20190628 180330).jpg","festivals|Sun, Moon or both":"Supplicating Pilgrim at Masjid Al Haram. Mecca, Saudi Arabia.jpg",
 "houses|Houses of the world":"Mongolian Ger.jpg","houses|Snow houses":"ICEHOTEL Main Hall (2014) by Alessandro Falca & AnnaSofia Mååg.jpg","houses|Yurts and gers":"Mongolian Ger.jpg",
 "houses|Houses on stilts":"Ganvié fishing village on stilts in Benin DSC 2926 (10281995914) (2).jpg","houses|Building with earth":"Medieval Mud-Skyscrapers of Shibam, Hadramawt Valley (2286363119).jpg",
 "houses|Living underground":"Castle Uçhisar in Cappadocia.jpg","houses|Maasai homes":"A Maasai dancer jumping high.jpg","houses|Steep roofs for rain and snow":"Thatched cottage in the sand dunes by Denmark.jpg",
 "houses|The Dutch canal house":"Water reflection of canal houses at blue hour in Damrak Amsterdam the Netherlands.jpg","houses|Cities of towers":"Hong Kong Harbour Night 2019-06-11.jpg",
 "houses|Homes on the water":"Kerala backwaters, Houseboats, India.jpg","sports|Where sports were invented":"Cardiff Judo Group (1448810).jpg","festivals|Inti Raymi":"Sacsayhuamán, Cusco, Perú, 2015-07-31, DD 05.JPG","festivals|New year in spring":"Persepolis – Gate of All Nations 02.jpg","festivals|Oktoberfest and La Tomatina":"Weisswurst+pretzels+bavarian mustard, beergarden, Düll brewery.jpg","houses|Informal settlements":"Soweto township.jpg"};
const PIN={
 "Maracanã, Rio de Janeiro":"Maracanã stadium.jpg","Lord’s, London":"Cricket at Lord's (16545553043).jpg","Baseball in Hiroshima":"Hiroshima Municipal Baseball Stadium 2009.JPG",
 "College ice hockey, Michigan":"Yost Ice Arena, Michigan Ice Hockey Game During Intermission.jpg","The Tour de France in the Pyrenees":"Peloton during Simacourbe climb of Tour de France 2024 stage 13.jpg",
 "The Monaco Grand Prix":"2013 Monaco Grand Prix - Sunday.jpg","The stadium at Olympia":"Ancient Olympia Stadium in Greece (51224128585).jpg","Waikiki, Hawaii":"Waikiki and Diamond Head.jpg",
 "Buzkashi, Afghanistan":"Buzkashi, national sport.jpg","Camp Nou, Barcelona":"Camp Nou aerial.jpg","Wembley Stadium":"London Wembley.jpg","Allianz Arena, Munich":"Allianz Arena 2008-02-09.jpg",
 "Panathenaic Stadium, Athens":"Panathenaic Stadium - panoramio (1).jpg","Beijing’s ‘Bird’s Nest’":"Beijing China Beijing-National-Stadium-01.jpg","Montreal’s Olympic Stadium":"Olympic Stadium Montreal (23761669).jpeg",
 "Carnival in Rio":"Carnival in Rio de Janeiro.jpg","Holi in Barsana":"Barsana Holi Festival.jpg","Lathmar Holi in Nandgaon":"Lathmar Holi 2022 in Nandgaon, Uttar Pradesh (edited).jpg","A Día de Muertos altar":"Ofrenda Día de Muertos Zócalo 2014.jpg",
 "An altar in Actopan, Hidalgo":"Day of the Dead altar in Actopan, Hidalgo (2023). 05.jpg","Lunar New Year in New York":"Dragon dance meets bird at NYC Lunar New Year parade (52336)e.jpg",
 "Evening prayers at Varanasi":"Ganga aarti at Varanasi.jpg","Cherry blossom and Mount Fuji":"Lake Kawaguchiko Sakura Mount Fuji 4.JPG","Steelpans at Trinidad’s Carnival":"Steelpan Instruments at Trinidad and Tobago Carnival.jpg",
 "Kiritimati from the air":"Kiritimati from the air.jpg","Times Square at night":"Times Square at Night with crowds of people.jpg","Pilgrims at the Kaaba":"Pilgrims begin this year's Hajj rituals with a circumambulation of the Kaaba (2025) (2).jpg",
 "Shopping before Eid, Dhaka":"Crowd in shopping before Eid-ul-Fitr 02.jpg","Holy Trinity Cathedral, Addis Ababa":"Panoramic View of the Holy Trinity Cathedral, Addis Ababa, Ethiopia (3435906326).jpg",
 "Lanterns in Kyoto":"Yasaka-dori early morning with street lanterns and the Tower of Yasaka (Hokan-ji Temple), Kyoto, Japan.jpg","Inside the Icehotel":"ICEHOTEL Main Hall (2014) by Alessandro Falca & AnnaSofia Mååg.jpg",
"Venice":"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg",
 "A Mongolian ger":"Mongolian Ger.jpg","The mud tower houses of Shibam":"Medieval Mud-Skyscrapers of Shibam, Hadramawt Valley (2286363119).jpg","Uros reed islands":"Islas flotantes de los Uros, Lago Titicaca, Perú, 2015-08-01, DD 37.JPG",
 "Ganvié, a town on stilts":"Ganvié fishing village on stilts in Benin DSC 2926 (10281995914) (2).jpg","Amsterdam’s canal houses":"Colorful canal houses at golden hour in Damrak avenue Amsterdam the Netherlands.jpg",
 "Uçhisar, Cappadocia":"Castle Uçhisar in Cappadocia.jpg","A thatched cottage in Denmark":"Thatched cottage in the sand dunes by Denmark.jpg","Kerala’s houseboats":"Kerala backwaters, Houseboats, India.jpg",
 "Hong Kong at night":"Hong Kong Night Skyline.jpg","Yurts at Song-Köl":"Yurt Camp in Song kol region.jpg","Kampong Ayer, Brunei":"Kampong Ayer, Brunei in January 2026 (DSCF1416).jpg",
 "A floating village on Tonlé Sap":"The floating village-Tonle Sap lake.jpg","Djenné’s mud-brick mosque":"The Great Mosque of Djenné in Mali is the largest mud brick building in the world. (32931594225).jpg",
 "A Hopi village on Second Mesa":"Hopi Village on the Second Mesa.jpg","A Maasai dancer":"A Maasai dancer jumping high.jpg","A Norfolk village":"Banham village from the air.jpg",
 "Singapore’s shophouses":"Colorful shophouses in Koon Seng Road, Singapore.jpg","A floating market, Cần Thơ":"Can Tho, Vietnam, Floating Market, Boats.jpg"};
/* captions where a card photo shows the setting rather than the stop's subject itself */
try{window.PS_PHOTO_CAP=window.PS_PHOTO_CAP||{};Object.assign(PS_PHOTO_CAP,{"sports|Where sports were invented":"Judo, created in Tokyo in 1882, practised in Cardiff","festivals|Inti Raymi":"The walls of Sacsayhuamán, where Inti Raymi is staged","houses|Snow houses":"Sweden’s Icehotel, rebuilt from river ice every winter","festivals|New year in spring":"Persepolis, Iran: ancient Persia’s royal city, linked in legend with Nowruz","festivals|Oktoberfest and La Tomatina":"Weisswurst, pretzels and mustard in a Bavarian beer garden","houses|Informal settlements":"Self-built homes in Soweto, Johannesburg"})}catch(e){}
const PHOTOS=window.GF_CULT_PHOTOS||[];
/* new photos name their tour, their card stop and/or their pin labels */
PHOTOS.forEach(p=>{if(p.card&&p.tour)CARD[p.tour+"|"+p.card]=p.f;(p.pins||[]).forEach(l=>PIN[l]=p.f)});
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
const findP=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d)||PHOTOS.find(x=>x.f===f)||null}catch(e){return null}};
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St){const want=CARD[ps.tour+"|"+St.title];if(want){const p=findP(want);if(p)return p}}}catch(e){}return _pf.apply(this,arguments)}}
try{if(typeof GF_SQ_FILE!=="undefined")Object.assign(GF_SQ_FILE,PIN)}catch(e){}
/* photo pins: one of each subject a tour, never the stop's own card photo; registered just before each stop draws */
const KEEP=new Map();
IDS.forEach(id=>{const steps=PS_TOURS[id].steps,cards={};steps.forEach(St=>{St.phPins=(St.phPins||[]).filter(q=>PIN[q.label]);if(CARD[id+"|"+St.title])cards[St.title]=CARD[id+"|"+St.title]});
 if(window.gfOneOfEach)gfOneOfEach(steps,PIN,cards,4,8);steps.forEach(St=>KEEP.set(St,(St.phPins||[]).map(q=>Object.assign({},q))))});
function prep(St){try{const K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 const labs=new Set(K.map(q=>q.label));if(St._restored)St._restored=St._restored.filter(r=>!labs.has(r[1]));if(St.pins)St.pins=St.pins.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));if(St._pins0)St._pins0=St._pins0.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));St._sqPruned=-1;return true}}catch(e){console.error(e)}}
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* covers for the Guided tours page cards */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={sports:"Maracanã stadium.jpg",festivals:"Carnival in Rio de Janeiro.jpg",houses:"Medieval Mud-Skyscrapers of Shibam, Hadramawt Valley (2286363119).jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
