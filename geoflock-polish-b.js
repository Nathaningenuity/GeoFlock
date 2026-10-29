/* GeoFlock: polish for the older tours defined in index.html — Cities, Migration, People, Languages (culture),
   Religions (langrel), Food, Landmarks and Flags. Adds interactive gadgets (cross-sections, rulers, true-size ghosts,
   day and night, map layers, history-map stops), a few new stops, card photos and photo pins on the opening stops,
   questions for the People tour, and reframes stops whose subject sat under the card. It only patches PS_TOURS at load
   (like the ADD patches at the end of geoflock-mapsx.js); load it after the tour files. Every patch is keyed by stop
   title, so a stop that has been renamed or removed is simply skipped. All photos come from the shared library. */
(function(){
const OPEN={cities:"Cities of the world",migration:"People on the move",people:"The people map",culture:"The most spoken languages",
 langrel:"What the world believes",food:"Food of the world",landmarks:"Landmarks of the world",flags:"Flags of the world"};
const W=[-180,-58,180,80];
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
/* some stops lock fields with getters (psLock in index.html); writes go through defineProperty so they replace those */
const def=(t,k,v)=>Object.defineProperty(t,k,{configurable:true,enumerable:true,writable:true,value:v});
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(new Proxy(s,{set(t,k,v){def(t,k,v);return true}}))}catch(e){console.error(e)}};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
/* insert a new stop after the stop titled `after` (once) */
const ins=(id,after,s)=>{const t=T(id);if(!t||t.steps.some(x=>x.title===s.title))return;const i=t.steps.findIndex(x=>x.title===after);if(i<0)return;t.steps.splice(i+1,0,S(s))};
/* photo pins carry their library file; photos() turns it into the photo's index */
const PINF={};
const ph=(at,label,f)=>{if(f)PINF[label]=f;return{at,label,col:"#d9682b",icon:"photo"}};

/* card photos ("tour|title" → library file name) */
const CARD={
 "cities|A city the size of a country":"Tokyo Tower 2023.jpg",
 "cities|Capitals across a river":"Kinshasa & Brazzaville - ISS007-E-6305 lrg.jpg",
 "cities|Capitals in the clouds":"Línea Roja de Mi Teleférico en La Paz, Bolivia.jpg",
 "cities|Now explore":"Hong Kong Harbour Night 2019-06-11.jpg",
 "migration|Crossing the Mediterranean":"Migrant boats at Portopalo di Capo Passero.jpg",
 "migration|Now explore":"Italian immigrants at Ellis Island.jpg",
 "culture|One family of languages":"Reginas-Tombstone-a-relief-portrait-with-inscriptions-in-Latin-and-Palmyrene-Copyright.jpg",
 "culture|The Spanish Empire":"Madrid Gran Via Metropolis (28895522813).jpg",
 "langrel|Christianity and Rome":"Hagia Sophia Mars 2013.jpg",
 "langrel|Islam’s first century":"Damascus, Syria, The Umayyad Mosque, The Courtyard, Islamic Art.jpg",
 "langrel|Fasting from dawn to sunset":"Badshahi Mosque in Lahore ,Pakistan 03.jpg",
 "langrel|Now explore":"Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg",
 "food|Potatoes from the Andes":"Amanecer en el lago Titicaca, Puno, Perú, 2015-08-01, DD 01.JPG",
 "food|Now explore":"Colorful Spices and Teas.jpg",
 "landmarks|Now explore":"Al Khazneh Petra edit 2.jpg",
 "flags|Flags of the world":"Finland flag raising at NATO Headquarters 4 April 2023.jpg",
 "flags|The Nordic cross":"Finland flag raising at NATO Headquarters 4 April 2023.jpg",
 "flags|Not a rectangle":"Boudhanath stupa, Kathmandu 01.jpg",
 "flags|Stars and stripes":"Providence Island view of downtown Monrovia.jpg"};

function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 for(const k in CARD){const i=libIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const id in OPEN){const t=T(id);if(!t)continue;t.steps.forEach(s=>(s.phPins||[]).forEach(q=>{const f=PINF[q.label];if(!f||q.img!=null)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}}))}}catch(e){console.error(e)}}

function patch(){
/* ───────── Cities ───────── */
if(T("cities")&&!T("cities")._polB){T("cities")._polB=1;
 set("cities","Cities of the world",s=>{s.phPins=[ph([139.7,35.69],"Tokyo","Tokyo Shibuya Scramble Crossing 2021-04-27.jpg"),ph([3.4,6.45],"Lagos","Lagos skyline.jpg"),
  ph([-74.01,40.71],"New York","Wall Street - New York Stock Exchange.jpg"),ph([31.24,30.04],"Cairo","Cairo skyline, Nile River, Egypt.jpg"),
  ph([72.88,19.08],"Mumbai","Mumbai Skyline with Bandra–Worli Sea Link 25 July 2018 (1).jpg"),ph([-43.2,-22.9],"Rio de Janeiro","Copacabana, Rio de Janeiro, Brazil.jpg")];
  s.body="In 1950 fewer than a third of people lived in towns and cities; today it is over half, and by 2050 it may be two-thirds. Most of the growth is in Asia and Africa. The dots on the map are cities."});
 ins("cities","The biggest cities",{title:"A city the size of a country",view:[128,30.5,148,41],globe:[139.7,35.7,4.5],card:"left",
  ghosts:[{code:"me",at:[139.9,35.75],col:"#8a63cf",label:"Montenegro, true size"}],
  pins:[[[139.69,35.69],"Tokyo","point"]],
  stat:"Greater Tokyo is about the size of Montenegro, but has about 60 times as many people",
  body:"The purple shape is Montenegro at its true size, laid over Tokyo: drag it around to compare. Tokyo and its three neighbouring prefectures cover about 13,500 km² and are home to about 37 million people; Montenegro, about the same size, has about 620,000.",
  more:"That is more people than live in all of Australia. Tokyo’s railways move them: Shinjuku station, used by about 3.5 million people a day, is the busiest railway station on Earth."});
 set("cities","The busiest ports",s=>{s.on=["connections"];s.view=[80,-2,138,42];
  s.body="Shanghai is the busiest of all, handling over 50 million containers a year (counted in TEU, a standard 20-foot box). Singapore is second, and Ningbo, Qingdao, Shenzhen, Guangzhou and Tianjin are all in the top ten. The blue shipping lanes on the map link them to the world."});
 ins("cities","Divided cities",{title:"Capitals across a river",view:[13.9,-5.25,16.3,-3.55],globe:[15.3,-4.3,8],card:"left",hi:["cd","cg"],on:["rivers"],
  gfRuler:{a:[15.31,-4.32],b:[15.28,-4.265]},
  stat:"Kinshasa and Brazzaville, the capitals of two countries, face each other across the Congo River",
  body:"Apart from Rome and Vatican City, no two capitals are closer: the ruler measures only about 7 km between their centres. There is no bridge, so people cross by boat.",
  more:"Kinshasa, with roughly 17 million people, is about seven times the size of Brazzaville. Just downstream, the river plunges through a string of rapids on its way to the Atlantic, which is why ships cannot sail up to the two cities from the sea."});
 set("cities","Capitals in the clouds",s=>{s.view=[-71.6,-17.9,-66.6,-15.1];s.globe=[-68.1,-16.5,6];s.card="left";delete s.spin;s.phPins=[];
  s.pins=[[[-68.15,-16.5],"La Paz ~3,600 m","point"],[[-68.19,-16.51],"El Alto ~4,000 m","point"]];
  s.xsec={title:"From El Alto down into La Paz and up to Illimani",pts:[[-68.21,-16.51,"El Alto"],[-68.17,-16.5],[-68.135,-16.497,"La Paz centre"],[-68.1,-16.52],[-68.07,-16.545,"Zona Sur"],[-67.95,-16.59],[-67.85,-16.62],[-67.79,-16.64,"Illimani"]],mark:3600,
   note:"The dashed line marks 3,600 m. El Alto sits on the flat Altiplano; La Paz fills a deep canyon below it, and the snowy peak of Illimani towers over both."};
  s.body="It is the highest seat of government in the world. The city fills a canyon below El Alto, a fast-growing city on the high plain above: move along the chart to see the drop. Cable cars carry commuters between the two.";
  s.more="La Paz’s cable-car network, opened from 2014, is the longest and highest urban cable-car system on Earth. Quito, in Ecuador, at about 2,850 m, is the highest official capital, and Bogotá is about 2,600 m up. Visitors often get altitude sickness on arrival."});
 set("cities","Now explore",s=>{s.body="Hover any country to see its name and neighbours. The Cities switch in the map options shows more cities; the People map shows how much of each country lives in towns."});
}
/* ───────── Migration ───────── */
if(T("migration")&&!T("migration")._polB){T("migration")._polB=1;
 set("migration","People on the move",s=>{s.phPins=[ph([-74.04,40.7],"Ellis Island, New York","Italian immigrants at Ellis Island.jpg"),ph([-117.1,32.54],"Tijuana–San Diego border","Border Wall at Tijuana and San Diego Border.jpg"),
  ph([55.27,25.2],"Dubai","Dubai Marina Skyline.jpg"),ph([36.32,32.29],"Zaatari camp, Jordan","Zaatari Refugee Camp John Green 18.png"),
  ph([22.77,49.78],"Przemyśl, Poland","Ukrainian refugees at Przemyśl returning home.jpg"),ph([120.98,14.6],"Manila","Sunset in Manila Bay, Manila, Philippines.jpg")]});
 set("migration","Mexico to the US",s=>{s.view=[-146,8,-76,50];s.globe=[-104,28,2.2];s.card="left";delete s.spin;
  s.gfRuler={a:[-99.13,19.43],b:[-118.24,34.05]};
  s.body="Mexicans in the US sent home about $65 billion in 2024, more than Mexico earns from selling oil abroad. Drag the ruler: Mexico City to Los Angeles is about 2,500 km."});
 set("migration","The great Atlantic crossing",s=>{s.gfRuler={a:[-2.99,53.4],b:[-74.0,40.7]};
  s.body="Hunger, poverty and persecution pushed them out; cheap land and factory jobs pulled them in. Most went to the US, but millions went to Canada, Argentina and Brazil. Drag the ruler: Liverpool to New York is about 5,300 km, a week by steamship."});
 set("migration","China moves to the cities",s=>{s.gfRuler={a:[104.07,30.67],b:[114.06,22.54]};
  s.body="Since the 1980s, young villagers from inland provinces such as Sichuan, Henan and Anhui have moved to factories and building sites on the coast, the largest migration in history. Drag the ruler: Chengdu, in Sichuan, to the factory city of Shenzhen is about 1,350 km."});
 ins("migration","Fleeing Syria",{title:"Crossing the Mediterranean",view:[-14,26,30,48],globe:[12,36,3],card:"left",
  gfRuler:{a:[10.76,34.74],b:[12.6,35.5]},
  G:[{t:"Where most boats arrive",c:"#7b4fc9",codes:["it","gr","es"]},{t:"Where many boats leave from",c:"#7b4fc9|pale",codes:["ly","tn","tr","ma"]}],
  lines:[{coords:[[13.2,32.9],[12.9,34.3],[12.6,35.5]],kind:"flow"},{coords:[[26.6,38.9],[26.4,39.1]],kind:"flow"},{coords:[[-5.8,35.6],[-5.6,36.0]],kind:"flow"}],
  pins:[[[12.6,35.5],"Lampedusa, Italy","point"],[[10.76,34.74],"Sfax, Tunisia","point"],[[13.19,32.89],"Tripoli, Libya","point"],[[26.3,39.1],"Lesbos, Greece","point"],[[-5.6,35.95],"Strait of Gibraltar: 14 km","point"]],
  stat:"The sea crossing to Europe from North Africa can be under 200 km, but it is one of the world’s deadliest migration routes",
  body:"Most people cross in crowded small boats: from Libya and Tunisia to Italy, from Turkey to Greece, or from Morocco to Spain. Drag the ruler: Sfax, in Tunisia, to the Italian island of Lampedusa is under 200 km.",
  more:"Since 2014 more than 32,000 people have died or gone missing on Mediterranean crossings, the UN’s migration agency (IOM) estimates. Many come from West Africa, Egypt, Bangladesh, Syria and Afghanistan, escaping war or looking for work. European governments disagree about sea rescues and about how to share out the people who arrive."});
 set("migration","Now explore",s=>{s.body="Hover any country to see its name and neighbours. The People map’s Migrants layer shows what share of each country was born abroad. The cultures tour shows how migrants carried their languages with them."});
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.migration;if(Q&&!Q._polB){Q._polB=1;(Q.recap=Q.recap||[]).push({q:"Which Italian island, closer to Tunisia than to Sicily, is a main landing point for boats crossing the Mediterranean?",o:["Lampedusa","Sardinia","Malta","Crete"],a:0,why:"Lampedusa lies under 200 km from Sfax, in Tunisia.",st:"Crossing the Mediterranean",kc:"it"})}}catch(e){}
}
/* ───────── People ───────── */
if(T("people")&&!T("people")._polB){T("people")._polB=1;
 set("people","The people map",s=>{s.phPins=[ph([139.7,35.69],"Tokyo","Shibuya Crossing, Tokyo; December 2017.jpg"),ph([90.4,23.8],"Dhaka","Garment workers rally in Dhaka.jpg"),
  ph([15.3,-4.32],"Kinshasa","Boulevard du 30 juin, Kinshasa.jpg"),ph([7.99,16.97],"Agadez, Niger","Niger, Agadez (28), grand mosque, old city.jpg"),
  ph([-21.9,64.15],"Reykjavík","View of Reykjavík from Hallgrímskirkja, 20230507 1229 5733.jpg"),ph([126.98,37.57],"Seoul","Skyline view from Seoul City (South Korea).jpg")]});
 set("people","Tomorrow’s biggest city",s=>{s.on=["cities"]});
 try{if(typeof TOURQ!=="undefined"&&!TOURQ.people)TOURQ.people={mid:[
  {at:"South Korea, the lowest on Earth",st:"South Korea, the lowest on Earth",q:"About how many children does the average woman in South Korea have?",o:["About 0.75","About 1.5","About 2.1","About 3"],a:0,why:"South Korea has the lowest rate on Earth, far below the 2.1 needed to replace each generation.",kc:"kr"},
  {at:"Japan buys more nappies for adults",st:"Japan buys more nappies for adults",q:"Since 2011, Japan has sold more nappies for…",o:["babies","adults","hospitals","pets"],a:1,why:"Half of all Japanese are over 49, and births keep falling.",kc:"jp"},
  {at:"Russia’s missing men",st:"Russia’s missing men",q:"In Russia, women live about how much longer than men?",o:["About 1 year","About 3 years","About 10 years","About 20 years"],a:2,why:"Drinking, smoking, accidents and heart disease hit Russian men hardest.",kc:"ru"}],
 recap:[
  {q:"About how many children per woman does a population need to replace itself?",o:["1.5","2.1","3","4"],a:1,why:"The extra 0.1 covers children who die young.",st:"Too few to replace",kc:"cn"},
  {q:"Which country went from about 7 children per woman to about 2 in 50 years, while still poor?",o:["Pakistan","Bangladesh","Niger","Nigeria"],a:1,why:"Door-to-door health workers, schooling for girls and factory jobs for women all helped.",st:"Bangladesh’s quiet revolution",kc:"bd"},
  {q:"Which country tops the UN’s Human Development Index?",o:["Norway","Switzerland","Iceland","Japan"],a:2,why:"Iceland, with fewer people than Bristol, came first in the latest index.",st:"Top of the class",kc:"is"}]}}catch(e){}
}
/* ───────── Languages ───────── */
if(T("culture")&&!T("culture")._polB){const t=T("culture");t._polB=1;t.stopModes=true;
 set("culture","Spanish: one country to twenty",s=>{s.title="The Spanish Empire";s.mode="history";s.sub="1783/spa";delete s.keyLabel;s.bannerNote="The Spanish Empire, 1783";
  s.stat="Spanish began in one corner of Spain; its empire carried it across the Americas, and it is now spoken in 20 countries";
  s.body="The map shows the Spanish Empire in 1783, near its greatest extent. When its colonies broke away in the 1800s, they kept the language, which is why Spanish is spoken from Mexico to Argentina.";
  s.more="Mexico now has nearly three times as many Spanish speakers as Spain, and about 45 million people in the United States speak Spanish at home (US Census Bureau, 2024). Equatorial Guinea is the only Spanish-speaking country in Africa. Brazil, the giant in the middle, speaks Portuguese: see the next stop."});
 set("culture","Madagascar speaks Bornean",s=>{s.view=[-14,-34,128,18];s.globe=[80,-10,1.4];s.card="left";delete s.spin;
  s.gfRuler={a:[47.52,-18.91],b:[114.59,-3.32]};
  s.stat="Malagasy’s closest relatives are spoken in Borneo, over 7,000 km away";
  s.body="Sailors from what is now Indonesia crossed the Indian Ocean around 1,500 years ago and settled the island. Drag the ruler: Antananarivo to southern Borneo is about 7,500 km."});
 set("culture","A thousand languages",s=>{s.view=[102,-15,160,6];s.globe=[145,-6,3];s.card="left";delete s.spin;
  s.xsec={title:"Across the highlands of Papua New Guinea",pts:[[147.0,-6.73,"Lae"],[146.4,-6.45],[145.87,-6.29,"Kainantu"],[145.39,-6.08,"Goroka"],[144.97,-6.02],[144.23,-5.86,"Mount Hagen"],[143.65,-6.15,"Mendi"],[142.95,-5.85,"Tari"]],mark:1500,
   note:"The dashed line marks 1,500 m. Steep ridges cut the highlands into separate valleys; outsiders only learned in the 1930s that about a million people lived there."};
  s.body="Mountains, jungle and islands kept groups apart for thousands of years, so each valley grew its own language: move along the chart to cross the ridges. Indonesia has about 700 languages, Nigeria about 500 and India about 450."});
 set("culture","Cyrillic: Russian letters",s=>{s.gfRuler={a:[26.8,43.16],b:[106.9,47.92]};
  s.body="The Cyrillic alphabet was created in Bulgaria about 1,100 years ago, for Slavic languages. It spread with the Russian Empire and the Soviet Union: drag the ruler, it reached Mongolia, about 6,000 km away."});
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.culture;if(Q)[].concat(Q.mid||[],Q.recap||[]).forEach(q=>{if(q.st==="Spanish: one country to twenty")q.st="The Spanish Empire";if(q.at==="Spanish: one country to twenty")q.at="The Spanish Empire"})}catch(e){}
}
/* ───────── Religions ───────── */
if(T("langrel")&&!T("langrel")._polB){const t=T("langrel");t._polB=1;t.stopModes=true;
 ins("langrel","What the world believes",{title:"Christianity and Rome",mode:"history",sub:"300/rom",view:[-50,12,60,60],globe:[20,38,1.6],card:"left",
  pins:[[[35.23,31.78],"Jerusalem","point"],[[12.49,41.89],"Rome","point"],[[28.98,41.01],"Constantinople (Istanbul)","point"]],
  stat:"In 380 Christianity became the official religion of the Roman Empire",
  body:"Christianity began in the first century AD, in Roman Judea. It spread along the empire’s roads and sea routes, and after Emperor Constantine became a Christian in 312, it grew fast. The map shows the empire around 300, just before Constantine.",
  more:"From Rome and Constantinople, missionaries later carried the faith to the peoples beyond the borders: the Irish, Germans, Slavs and Russians. Rome became the centre of the Catholic Church, Constantinople of the Orthodox churches."});
 ins("langrel","Christianity and Rome",{title:"Islam’s first century",mode:"history",sub:"800/isl",view:[-75,0,90,60],globe:[35,30,1.4],card:"left",
  pins:[[[39.83,21.42],"Mecca","point"],[[44.37,33.31],"Baghdad, capital from 762","point"],[[36.31,33.51],"Damascus","point"],[[-4.78,37.88],"Córdoba","point"]],
  stat:"Within about 120 years of Muhammad’s death in 632, Muslim rulers governed from Spain to Central Asia",
  body:"Arab armies conquered the Persian Empire and much of the Byzantine Empire. The map shows the Caliphate, ruled from Baghdad, in 800; Muslim Spain was ruled separately from Córdoba.",
  more:"Conquest did not mean everyone converted at once: most people in these lands became Muslim slowly, over several centuries. Arabic, the language of the Quran, became the language of government and learning, which is why so many of these countries speak Arabic today."});
 ins("langrel","Sunni and Shia",{title:"Fasting from dawn to sunset",sub:"rel",view:[-70,-15,120,75],globe:[40,30,1],
  gfSun:{utc:20,day:166,city:["Oslo",2]},
  pins:[[[10.75,59.91],"Oslo: about 20 hours","point"],[[106.85,-6.2],"Jakarta: about 13 hours","point"],[[39.83,21.42],"Mecca: about 15 hours","point"]],
  stat:"When Ramadan falls in June, a fast in Oslo lasts about 20 hours, but one in Jakarta only about 13",
  body:"In the month of Ramadan, Muslims eat and drink nothing from dawn to sunset. The map shows 10 pm in Oslo in June: the Sun is still up there, while Mecca and Jakarta are already dark. Move the time and date to see the days change.",
  more:"The Islamic calendar follows the Moon, so Ramadan comes about 11 days earlier each year and moves through all the seasons; in 2017 it fell in June, and in 2026 in February and March, when days everywhere are closer to 12 hours. Where the Sun barely sets, many Muslims follow the times of Mecca or of the nearest city with a normal day."});
 set("langrel","Now explore",s=>{s.body="Hover any country to see its name and neighbours. Click any colour in the key to see one religion on its own, or switch to Languages above the map."});
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.langrel;if(Q&&!Q._polB){Q._polB=1;(Q.recap||[]).forEach(q=>{if(q.st==="Hinduism and Buddhism"){q.st="Hindu India, Hindu Bali";q.why="About 95% of the world’s Hindus live in India."}});
  (Q.mid=Q.mid||[]).push({at:"Fasting from dawn to sunset",st:"Fasting from dawn to sunset",q:"Why is a June Ramadan fast much longer in Oslo than in Jakarta?",o:["Oslo’s mosques set different rules","Summer days are much longer far from the equator","Jakarta is in a different time zone","Ramadan is shorter in the south"],a:1,why:"Near the Arctic, June days last about 20 hours; near the equator, about 12.",kc:"no"});
  Q.recap.push({q:"In which year did Christianity become the official religion of the Roman Empire?",o:["AD 33","312","380","1054"],a:2,why:"Constantine became a Christian in 312; in 380 it became the state religion.",st:"Christianity and Rome",kc:"it"})}}catch(e){}
}
/* ───────── Food ───────── */
if(T("food")&&!T("food")._polB){T("food")._polB=1;
 set("food","Food of the world",s=>{s.phPins=[ph([38.7,7.5],"Ethiopia: coffee","Coffee ceremony of Ethiopia and Eritrea 1.jpg"),ph([102.8,23.1],"Yunnan: rice terraces","Terrace field yunnan china denoised.jpg"),
  ph([-5.5,7.5],"Côte d’Ivoire: cocoa","Breaking open cocoa pods in Ivory Coast.png"),ph([-70,-15.8],"Andes: potatoes","Bitter potato varieties of Solanum curtilobum.png"),
  ph([80.7,7],"Sri Lanka: tea","Sri Lanka-Tea plantation-15.jpg"),ph([14.25,40.85],"Naples: pizza","L&B Spumoni Gardens pizza (41436).jpg"),ph([129.9,-4.5],"Banda Islands: nutmeg","Nutmeg ready.jpg")]});
 set("food","Potatoes from the Andes",s=>{s.xsec={title:"From the Pacific up to Lake Titicaca",pts:[[-71.34,-17.64,"Ilo (coast)"],[-71.1,-17.4],[-70.93,-17.19,"Moquegua"],[-70.7,-16.9],[-70.45,-16.5],[-70.2,-16.1],[-70.02,-15.84,"Puno, Lake Titicaca"]],mark:3800,
   note:"The dashed line marks 3,800 m, the height of Lake Titicaca. Few crops grow this high and cold, but potatoes do."};
  s.body="Potatoes were first farmed near Lake Titicaca, high in the Andes, about 8,000 years ago: move along the chart to climb there from the coast. The Incas freeze-dried them into chuño, which keeps for years."});
 set("food","The Spice Islands",s=>{s.gfRuler={a:[129.9,-4.5],b:[12.34,45.44]};
  s.body="The Maluku Islands, the “Spice Islands”, were the only source of cloves, and the tiny Banda Islands of nutmeg. Drag the ruler: the Bandas are about 12,500 km from Venice, and spices passed through many traders’ hands on the way, growing dearer each time."});
 set("food","One banana for the world",s=>{s.on=["connections"];
  s.more="Until the 1950s the world ate a different banana, the Gros Michel, until a fungus called Panama disease wiped it out on the plantations. A new strain of the same disease now threatens the Cavendish. India grows the most bananas but eats nearly all of them; Ecuador sells the most abroad, in refrigerated ships along shipping lanes like those on the map."});
 set("food","The food giants",s=>{s.ghosts=[{code:"nl",at:[-98,39],col:"#e8590c",label:"Netherlands, true size"}];
  s.body="The United States and Brazil export food on a giant scale. The Netherlands keeps up with high-tech greenhouses and by trading food through Rotterdam, Europe’s biggest port. The orange shape in the US is the Netherlands at its true size: drag it to compare."});
}
/* ───────── Landmarks ───────── */
if(T("landmarks")&&!T("landmarks")._polB){T("landmarks")._polB=1;
 set("landmarks","Landmarks of the world",s=>{s.phPins=[ph([117.23,40.68],"The Great Wall","Great Wall of China July 2006.JPG"),ph([31.13,29.98],"The pyramids of Giza","All Gizah Pyramids.jpg"),
  ph([78.04,27.17],"The Taj Mahal","Taj Mahal, Agra, India edit2.jpg"),ph([-72.55,-13.16],"Machu Picchu","80 - Machu Picchu - Juin 2009 - edit.jpg"),
  ph([2.29,48.86],"The Eiffel Tower","Paris - The Eiffel Tower in spring - 2307.jpg"),ph([151.21,-33.86],"Sydney Opera House","Sydney Opera House - Dec 2008.jpg"),
  ph([-43.21,-22.95],"Christ the Redeemer","Rio de Janeiro - Cristo Redentor 01.jpg")]});
 set("landmarks","The Great Wall",s=>{s.gfRuler={a:[119.75,40.0],b:[98.21,39.8]};
  s.body="All its walls together run about 21,000 km, built and rebuilt over 2,000 years. The Ming wall that most visitors see winds about 8,850 km, yet its two ends are only about 1,800 km apart: drag the ruler."});
 set("landmarks","The Statue of Liberty",s=>{s.view=[-125,8,12,66];s.globe=[-35,42,1.1];
  s.gfRuler={a:[2.35,48.86],b:[-74.04,40.69]};
  s.body="France gave the statue to the United States for the 100th anniversary of American independence, and it was unveiled in 1886. It was built in Paris and shipped about 5,800 km across the Atlantic: drag the ruler."});
 set("landmarks","Machu Picchu",s=>{s.view=[-81,-18,-66,-9];s.globe=[-72.3,-13.3,5];delete s.spin;
  s.xsec={title:"From Cusco down the Sacred Valley to Machu Picchu",pts:[[-71.97,-13.52,"Cusco"],[-72.03,-13.42],[-72.12,-13.31,"Urubamba"],[-72.26,-13.26,"Ollantaytambo"],[-72.4,-13.2],[-72.545,-13.163,"Machu Picchu"]],mark:2430,
   note:"The dashed line marks 2,430 m, the height of Machu Picchu: lower and warmer than Cusco, on a ridge high above the Urubamba river."};
  s.body="The Incas built it around 1450, on a ridge 2,430 m up in the Andes, probably as an estate for the emperor Pachacuti. Move along the chart: it lies lower than Cusco, the Inca capital, where the forest begins."});
 set("landmarks","Stonehenge",s=>{s.lines=(s.lines||[]).filter(l=>!(l.coords&&l.coords[0]&&l.coords[0][1]>56));
  s.gfRuler={a:[-3.3,57.6],b:[-1.83,51.18]};
  s.more="In 2024 scientists showed that the 6-tonne Altar Stone came from north-east Scotland: drag the ruler, it is over 700 km away. The giant sarsen stones came from about 25 km to the north. The stones line up with the sunrise at midsummer and the sunset at midwinter."});
}
/* ───────── Flags ───────── */
if(T("flags")&&!T("flags")._polB){T("flags")._polB=1;
 set("flags","The Union Jack in the corner",s=>{s.gfRuler={a:[-0.13,51.51],b:[174.78,-41.29]};
  s.body="Australia, New Zealand, Tuvalu and Fiji keep the Union Jack in the top corner, a sign of their past in the British Empire, though they lie on the far side of the world: drag the ruler, London to Wellington is about 18,800 km."});
 set("flags","Stars and stripes",s=>{s.lines=[];s.gfRuler={a:[-76.29,36.85],b:[-10.8,6.3]};s.view=[-100,-12,20,52];s.globe=[-40,22,1.2];
  s.body="Liberia was founded from 1822 by free Black Americans, many of them formerly enslaved, who sailed about 7,400 km from the US: drag the ruler. Its flag has eleven red and white stripes and one star. Malaysia’s has 14 stripes and a crescent."});
 set("flags","Suns on flags",s=>{s.gfSun={utc:20.75,day:80,city:["Tokyo",9]};
  s.body="Japan’s red disc is the rising sun: its name, Nihon, means “origin of the sun”, because it lies east of China, towards the sunrise. The map shows dawn reaching Japan. Argentina and Uruguay share the “Sun of May”, with a face."});
 set("flags","Not a rectangle",s=>{s.xsec={title:"Nepal, from the plains to Everest",pts:[[85.92,26.73,"Janakpur"],[86.1,27.0],[86.35,27.35],[86.6,27.6],[86.93,27.99,"Everest"],[87.1,28.3,"Tibet"]],mark:3000,
   note:"In under 200 km, Nepal climbs from under 100 m on the plains to 8,849 m at the top of Everest, the world’s highest point."};
  s.body="Nepal is the only country whose flag isn’t four-sided. Its two triangles are often said to stand for the peaks of the Himalayas: move along the chart to cross them."});
}
}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
