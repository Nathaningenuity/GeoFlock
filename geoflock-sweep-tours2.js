/* GeoFlock tour sweep 2: the People & culture and Ideas & arts shelves, stop by stop.
   Tours: cities, migration, people, culture, langrel, food, sports, musicsport, festivals, houses, landmarks, flags,
   art, music, literature, philosophy, mythology, science, maths, psychology, inventions, words, learning.
   Each entry is keyed "tour|stop title" and is applied when the stop is shown (psGo is wrapped, as in
   geoflock-polish-m.js), so it wins over the tour files and the earlier patch files. Fields:
     body / stat / more / sub      card text
     view / globe / mode / on / card / hi / hiSoft / lines / legend / keyLabel / iconPins / gfRuler   set as given
     pins       the stop's map labels, replaced;   pinsDrop: RegExp of labels to drop;   pinsAdd: labels to add
     pinsMove   {label:[lon,lat]} to move a label
     phDrop     RegExp of photo-pin labels to drop;   phAdd: photo pins to add ({at,label,f,d,by,lic,page});
     phMove     {label:[lon,lat]} to move a photo pin;   phLabel {old:new} to rename one
     phDup      true: of photo pins with the same label, keep only the one with a picture
     iconDrop   true (all icon pins) or a RegExp of icon names
     fn(S)      anything else */
(function(){
"use strict";
const SET=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};
const CL=v=>v==null?v:JSON.parse(JSON.stringify(v));
function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f);
 if(i<0){PS_PHOTO_DATA.push({f:x.f,d:x.d,by:x.by,lic:x.lic,page:x.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
const has=q=>!!(q&&(q._f||q.img!=null&&q.img>=0||q._gfImg!=null));
const lab=q=>Array.isArray(q)?String(q[1]||""):String(q&&q.label||"");
const P={};
window.GF_SWEEP2=P;
const KEYS=["body","stat","more","sub","view","globe","mode","on","card","hi","hiSoft","lines","legend","keyLabel","iconPins","gfRuler","pins","flatView"];
function photos(S,X){
 /* photo pins: the stop's own list, less the dropped ones, plus ours; kept whatever other scripts set the list to later */
 const mine=(X.phAdd||[]).map(x=>{const i=libAdd(x);return{at:x.at,label:x.label,col:x.col||"#d9682b",icon:"photo",_f:x.f,img:i}});
 const fix=L=>(Array.isArray(L)?L:[]).filter(q=>q&&!(X.phDrop&&X.phDrop.test(lab(q)))&&!mine.some(m=>m.label===q.label)).map(q=>{
   if(X.phMove&&X.phMove[q.label]){q=Object.assign({},q,{at:X.phMove[q.label].slice()})}
   if(X.phLabel&&X.phLabel[q.label]){q=Object.assign({},q,{label:X.phLabel[q.label]})}return q})
  .filter((q,i,A)=>!X.phDup||!A.some((o,j)=>j!==i&&o.label===q.label&&(has(o)&&!has(q)||has(o)===has(q)&&j<i))).concat(mine);
 if(S._gfS2p){(X.phAdd||[]).forEach(libAdd);return}S._gfS2p=1;
 /* a renamed pin keeps its picture: pictures are looked up by label (PS_SQ_IMG), so the new label gets the old one's */
 const relink=b=>{if(!X.phLabel)return;try{const M=window.PS_SQ_IMG=window.PS_SQ_IMG||{};(Array.isArray(b)?b:[]).forEach(q=>{const nl=q&&X.phLabel[q.label];if(!nl||M[nl]!=null)return;
  const v=M[q.label]!=null?M[q.label]:q.img!=null&&q.img>=0?q.img:q._gfImg;if(v!=null)M[nl]=v;try{if(typeof GF_SQ_FILE!=="undefined"&&GF_SQ_FILE[q.label]&&!GF_SQ_FILE[nl])GF_SQ_FILE[nl]=GF_SQ_FILE[q.label]}catch(e){}})}catch(e){}};
 const d=Object.getOwnPropertyDescriptor(S,"phPins");let base=d&&("value" in d)?d.value:S.phPins;let cache=null,ck=null;
 const get0=d&&d.get?d.get.bind(S):null,set0=d&&d.set?d.set.bind(S):null;
 try{Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,
  get(){const b=get0?get0():base;if(ck!==b||!cache){ck=b;cache=fix(b)}relink(b);return cache},
  set(v){if(set0)set0(v);else base=v;ck=null}})}catch(e){}
 S._sqPruned=-1}
function apply(tour,S){const X=P[tour+"|"+S.title];if(!X)return;
 try{KEYS.forEach(k=>{if(k in X)SET(S,k,CL(X[k]))});
  if(X.pinsDrop||X.pinsAdd||X.pinsMove){let L=(Array.isArray(S.pins)?S.pins:[]).filter(q=>!(X.pinsDrop&&X.pinsDrop.test(lab(q))));
   if(X.pinsMove)L=L.map(q=>Array.isArray(q)&&X.pinsMove[q[1]]?[X.pinsMove[q[1]].slice()].concat(q.slice(1)):q);
   if(X.pinsAdd)L=L.filter(q=>!X.pinsAdd.some(a=>a[1]===lab(q))).concat(CL(X.pinsAdd));SET(S,"pins",L)}
  if(X.iconDrop&&Array.isArray(S.iconPins))SET(S,"iconPins",X.iconDrop===true?[]:S.iconPins.filter(q=>!X.iconDrop.test(q.icon)));
  if(X.phAdd||X.phDrop||X.phMove||X.phLabel||X.phDup)photos(S,X);
  if(X.fn)X.fn(S)}catch(e){console.error(e)}}
function cur(){try{return typeof ps!=="undefined"&&ps&&ps.tour}catch(e){return null}}
function wrapGo(){if(typeof psGo!=="function"||typeof psSteps!=="function")return false;if(psGo._gfS2)return true;const _g=psGo;
 psGo=function(i){try{const t=cur();if(t){const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];if(S)apply(t,S)}}catch(e){console.error(e)}return _g.apply(this,arguments)};psGo._gfS2=1;return true}
/* wrapped after geoflock-polish-m.js has wrapped it, so these run first and its fixes still follow; checked again later in case
   a later script replaced psGo without keeping the wrapper */
let n=0;const t=setInterval(()=>{wrapGo();if(++n>80)clearInterval(t)},700);
/* text: also written into the tour data straight away, so lists, search and quizzes that read the cards see it */
function text(){try{for(const k in P){const X=P[k],i=k.indexOf("|"),T=PS_TOURS[k.slice(0,i)];if(!T)continue;
 const S=(T.steps||[]).find(s=>s&&s.title===k.slice(i+1));if(!S)continue;["body","stat","more","sub"].forEach(f=>{if(f in X&&S[f]!==X[f])SET(S,f,X[f])})}}catch(e){}}
[0,1500,4000,9000,15000].forEach(ms=>setTimeout(text,ms));

/* ================================ People & culture ================================ */

/* ---- Sports ---- */
Object.assign(P,{
 "sports|The world’s game":{stat:"Only eight countries won the first 22 World Cups; Brazil won the most"},
 "sports|The jump into thin air":{stat:"At the 1968 Olympics, 2,240 m up in Mexico City, Bob Beamon long-jumped 8.90 m: 55 cm further than anyone before"},
 "sports|The Olympic map":{more:"Africa’s first Olympic event is the Youth Olympic Games in Dakar, Senegal, held from 31 October to 13 November 2026. Rio de Janeiro, in 2016, is still the only South American host; Brisbane hosts in 2032."},
 "sports|Runners from the highlands":{stat:"Every men’s marathon world record set from 2003 to 2023 went to a Kenyan or an Ethiopian"},
});
/* ---- Festivals ---- */
Object.assign(P,{
 "festivals|Welcome back, Sun":{stat:"Longyearbyen goes about four months without the Sun, and celebrates when its rays first touch the old hospital steps, around 8 March"},
 "festivals|The biggest crowd on Earth":{stat:"The 2025 Kumbh Mela at Prayagraj counted over 600 million visits in six weeks: among the largest gatherings in history"},
});
/* ---- Houses ---- */
Object.assign(P,{
 /* a Leiden label on a stop about Amsterdam, and two Amsterdam photos on the same spot */
 "houses|The Dutch canal house":{pinsDrop:/^Leiden$/,phDrop:/^Amsterdam$/},
 /* two Hong Kong photos on the same spot */
 "houses|Cities of towers":{phDrop:/^Hong Kong$/},
 "houses|Cities built by their people":{stat:"Over a billion people live in informal settlements: neighbourhoods built by the people who live there, without planning permission or deeds"},
 /* the turf farm the card names, which had only a text label */
 "houses|Houses made of grass":{pinsDrop:/^Glaumbær$/,phAdd:[{at:[-19.51,65.61],label:"Glaumbær: a turf farm, now a museum",col:"#d9682b",f:"Turf houses in Glaumbær open-air museum, Iceland, 20240715 1430 0924.jpg",d:"photos/s2glaumbaer.webp",by:"Jakub Hałun",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:Turf_houses_in_Glaumb%C3%A6r_open-air_museum,_Iceland,_20240715_1430_0924.jpg"}]},
 "houses|Snow houses":{stat:"With a small lamp and body heat, the inside of an igloo can be over 30 °C warmer than the air outside"},
});
/* ---- Landmarks ---- */
const LIB={
 stone1:{f:"Stonehenge from the north.jpg",d:"@057c2846f4914c3f",by:"Sumit Surai",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Stonehenge_from_the_north.jpg"},
 angkor1:{f:"Angkor Wat with its reflection (cropped).jpg",d:"@93cddba34de5857c",by:"Satdeep Gill",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Angkor_Wat_with_its_reflection_(cropped).jpg"},
 liberty1:{f:"Statue of Liberty, NY.jpg",d:"@1321c473a53e9b64",by:"William Warby",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Statue_of_Liberty,_NY.jpg"},
 taj1:{f:"Aks The Reflection Taj Mahal.jpg",d:"@1fecb26cdb4d4189",by:"Antrix3",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Aks_The_Reflection_Taj_Mahal.jpg"},
};
const ph=(k,at,label,col)=>Object.assign({at,label,col},LIB[k]);
Object.assign(P,{
 /* a photo of Big Ben on a Stonehenge stop: the stones themselves instead of the temple icon */
 "landmarks|Stonehenge":{phDrop:/^(United Kingdom: Big Ben|Stonehenge$)/,phAdd:[ph("stone1",[-1.826,51.179],"Stonehenge")]},
 /* the pyramid three times on one spot: icon pin, photo pin and icon */
 "landmarks|The pyramids of Giza":{phDrop:/^Great Pyramid of Giza$/,iconDrop:true},
 "landmarks|Angkor Wat":{phDrop:/^Angkor Wat$/,iconDrop:true,phAdd:[ph("angkor1",[103.867,13.4125],"Angkor Wat")]},
 "landmarks|Machu Picchu":{phDrop:/^Machu Picchu$/,iconDrop:true},
 "landmarks|The Taj Mahal":{phDrop:/^Taj Mahal, Agra$/,iconDrop:true,phAdd:[ph("taj1",[78.042,27.175],"The Taj Mahal, Agra")]},
 "landmarks|The Statue of Liberty":{view:[-136,8,6,66],phDrop:/^(Statue of Liberty|United States: Grand Canyon)$/,iconDrop:true,phAdd:[ph("liberty1",[-74.0445,40.6892],"The Statue of Liberty")],
  more:"It travelled in about 350 pieces packed in over 200 crates, and was put back together on its island in New York harbour. The green coating, called a patina, formed as the copper weathered and now protects it, so when officials talked of painting it, people objected. Its full name is “Liberty Enlightening the World”."},
 "landmarks|The Eiffel Tower":{phDrop:/^Eiffel Tower$/,iconDrop:true},
 "landmarks|The tower that leans to survive":{stat:"Pisa’s tower began to lean in 1178, five years into building; the same soft ground has helped it ride out at least four strong earthquakes"},
});
/* ---- Flags ---- */
Object.assign(P,{
 "flags|Pan-African colours":{more:"Because Ethiopia had kept its freedom, its colours came to stand for independence. A second family uses red, black and green, from Marcus Garvey’s movement in the 1920s: Kenya and Malawi fly those. Bolivia and Lithuania use green, gold and red too, by coincidence."},
 "flags|Pan-Arab colours":{stat:"Red, white, black and green, the colours of the 1916 Arab Revolt, live on in a dozen flags"},
});

/* ---- Languages and writing ---- */
Object.assign(P,{
 "culture|The Spanish Empire":{stat:"Spanish began in one corner of Spain; its empire carried it across the Americas, and 20 countries now speak it"},
 "culture|Portuguese: the colony outgrew the country":{stat:"Brazil has 20 times as many people as Portugal, so most Portuguese speakers are Brazilian"},
 "culture|Iceland can still read its sagas":{stat:"Icelanders can read their 800-year-old sagas with little help; English speakers need a translation for Chaucer, written 150 years later"},
 "culture|Tones need wet air?":{stat:"Languages with many tones, like Cantonese, are rare in deserts and cold, dry places; linguists argue about why"},
});
/* ---- Religions ---- */
/* the Ethiopian and Nepali years worked out for today's date (Ethiopia's year begins on 11 September, Nepal's in mid-April) */
function calYears(){const d=new Date(),y=d.getFullYear(),m=d.getMonth(),dd=d.getDate();
 return{eth:(m>8||m===8&&dd>=11)?y-7:y-8,nep:(m>3||m===3&&dd>=14)?y+57:y+56,y}}
Object.assign(P,{
 /* the key read "undefined" */
 "langrel|Hindu India, Hindu Bali":{view:[-40,-35,185,40],keyLabel:"Where most people are Hindu"},
 "langrel|It isn’t 2026 everywhere":{fn:S=>{const c=calYears();SET(S,"stat","In Ethiopia’s calendar it is now "+c.eth+"; in Nepal’s it is already "+c.nep)}},
 "langrel|Holy cities":{view:[-48,8,89,52],more:"Millions of pilgrims visit every year: nearly 2 million make the Hajj to Mecca, where only Muslims may enter."},
});
/* ---- Food ---- */
Object.assign(P,{
 /* the rice cradle was labelled twice, and wheat and maize had both a label and an icon at the same spot */
 "food|Three grains, three cradles":{pinsDrop:/^(Yangtze: rice|Wheat: the Fertile Crescent|Maize: southern Mexico)$/},
 "food|Maize without the recipe":{stat:"Maize left Mexico without its cooking method, and in the US South a disease spread that struck about 3 million people"},
 "food|The Spice Islands":{view:[-119,-40,135,50],hi:["id"],
  body:"The Maluku Islands, the “Spice Islands”, were the only source of cloves, and the tiny Banda Islands the only source of nutmeg. Drag the ruler: the Bandas are about 12,500 km from Venice.",
  more:"Spices passed through many traders’ hands on the way to Europe, growing dearer each time; by some accounts nutmeg was worth more than its weight in gold. The Dutch took the Bandas by force in 1621, killing, enslaving or driving out most of the islanders. In 1667 a peace treaty let the Dutch keep Run, a tiny nutmeg island, while the English kept Manhattan. Black pepper first came from India’s Malabar Coast, but today Vietnam exports the most, about 250,000 tonnes a year."},
});

/* ---- Cities ---- */
Object.assign(P,{
 /* the Levant, where most of these cities are, sat under the card: the view is now centred on it, Varanasi still in */
 "cities|The oldest cities":{view:[-12,14,89,47],globe:[40,30,1.5],
  body:"Some cities have been lived in, on and off, since the first farmers. Jericho, Damascus, Aleppo and Byblos, in the Middle East, are among the oldest; Athens and Varanasi, in India, have been lived in for over 3,000 years."},
 "cities|The lowest bridge on the Thames":{stat:"London stands where the Romans could bridge the Thames as close to the sea as possible"},
 "cities|Paris was built from its own underground":{view:[1.0,48.4,3.7,49.3],globe:[2.33,48.85,9],
  stat:"Paris dug its building stone from under its own streets; the old quarries now hold the bones of about 6 million Parisians"},
 "cities|The fall line":{stat:"Trenton, Philadelphia, Baltimore, Washington, Richmond and Augusta all stand on one geological line"},
 /* close enough to see Manhattan, so Midtown and the Downtown towers are two places, not one dot */
 "cities|The bedrock myth":{view:[-74.32,40.62,-73.66,40.86],globe:[-73.99,40.74,40],
  stat:"Manhattan’s skyscrapers skip the stretch between Downtown and Midtown, and guides often blame deep bedrock; economists found that is mostly a myth"},
 "cities|Money cities":{stat:"New York and London are the world’s two biggest money centres"},
 /* the ship icons sat under the Ningbo and Qingdao photos */
 "cities|The busiest ports":{iconDrop:true,
  body:"Shanghai is the busiest of all, handling over 50 million containers a year (counted in TEU: one TEU is one standard 20-foot box). Singapore is second, and Ningbo, Qingdao, Shenzhen, Guangzhou and Tianjin are all in the top ten. The blue shipping lanes on the map link them to the world."},
 /* Monaco and the Vatican were under the card */
 "cities|Countries that are a city":{view:[-62,-12,122,62],globe:[40,25,1]},
 /* the map showed five photos and no numbers: the labels now carry the figures the card gives */
 "cities|Africa’s booming cities":{view:[-36,-36,60,38],globe:[15,5,1.35],
  phLabel:{"Lagos":"Lagos: about 17 million","Kinshasa":"Kinshasa: about 17 million","Cairo":"Cairo: Africa’s biggest city","Dar es Salaam":"Dar es Salaam: 50 million by 2100?"},
  body:"Africa’s cities are growing faster than any others: their populations are young, and people keep moving in from the countryside to find work."},
 "cities|Cities at the extremes":{stat:"Yakutsk’s January averages below −35 °C; Kuwait City’s summer days often pass 45 °C"},
});
/* ---- Migration ---- */
Object.assign(P,{
 "migration|America the magnet":{view:[-156,20,-70,53],phDrop:/Grand Canyon/},
 "migration|Mexico to the US":{phDrop:/Grand Canyon/},
 /* Moraine Lake is a fine view, but says nothing about newcomers */
 "migration|Built by newcomers":{phDrop:/^Canada: Moraine Lake/},
 "migration|Nine in ten from abroad":{view:[-13,0,124,42],stat:"In the UAE and Qatar, nearly nine in ten people are foreigners",
  more:"Because most of the workers are men who come alone, the UAE and Qatar have more than two men for every woman, the most lopsided ratios in the world. Indians are the largest group in the UAE, around 3.5 million, though estimates vary. Most foreign workers can never become citizens, however long they stay. Many work under kafala, a system that ties a worker to one employer, the ‘sponsor’; several Gulf states have loosened it in recent years."},
 "migration|India’s diaspora":{stat:"India has the biggest diaspora, about 18 million people, and receives more money from them than any country does",
  body:"In 2024 Indians abroad sent home about $130 billion, a world record. They work as engineers in California, doctors in Britain and builders in the Gulf. (A diaspora is a people scattered far from its homeland.)"},
 /* Chengdu, where the ruler starts, sat under the card */
 "migration|China moves to the cities":{view:[88,18,124,45],globe:[110,31,2.85]},
 /* Warsaw and Berlin were under the card */
 "migration|Ukraine, 2022":{view:[-3,42,35,57],card:"left"},
 "migration|Fleeing Syria":{view:[-10,26,43,58],stat:"Syria’s war, from 2011, drove over 6 million people abroad: one of the largest refugee crises since World War II"},
 "migration|Crossing the Mediterranean":{stat:"From North Africa to Europe can be under 200 km by sea, yet it is one of the world’s deadliest migration routes"},
 "migration|The Philippines works abroad":{stat:"About one Filipino in ten lives or works abroad, as nurses, carers, builders and sailors"},
 "migration|Lebanon’s global family":{stat:"Far more people of Lebanese descent live abroad than in Lebanon itself, perhaps several times more"},
});
/* ---- People ---- */
Object.assign(P,{
 "people|Too few to replace":{stat:"About two in three people live where families are too small to replace their parents"},
 "people|Switzerland, land of newcomers":{
  more:"Most of Switzerland’s newcomers come from elsewhere in Europe, especially Italy, Germany, Portugal and France, drawn by high wages. In the UAE nearly nine in ten people were born abroad, and in Qatar about three in four. At the other extreme, China, India and Indonesia, home to over a third of humanity, have almost no immigrants."},
 "people|Machines, not hands":{stat:"Only about 2 in 100 American workers farm, yet the US grows nearly a third of the world’s maize (corn)"},
 "people|From short to tallest":{stat:"In the mid-1800s Dutch men were shorter than most Europeans; today they are the tallest on Earth, about 1.83 m"},
});

/* ---- Music and sport (not on any shelf at present, kept tidy all the same) ---- */
/* generic country photos (the Grand Canyon, Neuschwanstein, Mount Fuji...) that said nothing about music or sport */
const GENERIC=/^(Brazil: Christ the Redeemer, Rio|Germany: Neuschwanstein Castle|Argentina: Perito Moreno Glacier|United States: Grand Canyon|Japan: Mount Fuji|Dominican Republic: Santo Domingo|Nigeria: Zuma Rock|Kenya: Maasai Mara|Senegal: Gorée Island|Jamaica: Dunn’s River Falls)$/;
Object.assign(P,{
 "musicsport|Football conquers the world":{phDrop:GENERIC},
 "musicsport|Three hosts, 48 teams":{phDrop:GENERIC},
 "musicsport|Africa’s first Olympics":{phDrop:GENERIC,stat:"Dakar, in Senegal, hosts the Youth Olympic Games from 31 October to 13 November 2026: the first Olympic event ever held in Africa"},
 "musicsport|Jamaica’s big sound":{phDrop:GENERIC},
 "musicsport|Where baseball went":{phDrop:GENERIC},
 "musicsport|Lagos and Mumbai":{phDrop:GENERIC},
 "musicsport|East Africa’s runners":{phDrop:GENERIC},
});

/* ================================ Ideas & arts ================================ */
/* ---- Art and architecture ---- */
Object.assign(P,{
 /* plain labels that sat on top of photo pins of the same places */
 "art|Pyramids and ziggurats":{pinsDrop:/^(Ur|Meroë)$/},
 "art|The Parthenon":{phDrop:/^The Acropolis, Athens$/},
 "art|The Alhambra":{pinsDrop:/^Córdoba$/,phDrop:/^Granada from the Alhambra$/},
 "art|The Forbidden City":{pinsDrop:/^Terracotta Army/,phDrop:/^Forbidden City, Beijing$/},
 "art|Renaissance Florence":{pinsDrop:/^(Venice|Rome: St Peter’s and the Sistine Chapel)$/,phLabel:{"St Peter’s, Rome":"Rome: St Peter’s and the Sistine Chapel"}},
 "art|Mughal style: the Taj Mahal":{pinsDrop:/^Lahore$/,phDrop:/^Agra$/,phLabel:{"Badshahi Mosque, Lahore":"Lahore: the Badshahi Mosque"}},
 "art|Gaudí’s Barcelona":{pinsDrop:/^Casa Batlló$/},
 "art|Skyscrapers":{pinsDrop:/^(New York|Kuala Lumpur|Shibam’s mud towers)$/,phLabel:{"Shibam, Yemen":"Shibam’s mud towers"}},
 /* Edo and Mount Fuji fell off the right-hand edge of the map; now Japan and Paris are both in view, clear of the card */
 "art|The Great Wave":{view:[-110,0,152,74],globe:[70,45,1]},
 "art|Pagodas that dance":{stat:"Japan’s wooden pagodas have stood through centuries of earthquakes; the one at Hōryū-ji is about 1,300 years old"},
 "art|The blue from one valley":{view:[-37,18,74,58],stat:"For centuries Europe’s finest blue paint came from one set of mines in north-east Afghanistan"},
 "art|Dots in the desert":{stat:"One of the world’s best-known art movements began in 1971, with a mural on a school wall in a remote desert settlement"},
});
/* ---- Music ---- */
Object.assign(P,{
 "music|Steelpan from Trinidad":{phDup:true},
 "music|Reggae in Kingston":{phDrop:/^Kingston$/},
 "music|Samba and bossa nova":{phDrop:/^Christ the Redeemer, Rio$/},
 "music|Afrobeats from Lagos":{stat:"In 2023 Rema’s ‘Calm Down’ became the first song by an African artist to top a billion plays on Spotify"},
 "music|K-pop":{stat:"South Korea’s ‘Gangnam Style’ was the first YouTube video to reach a billion views, in 2012"},
});
/* ---- Literature ---- */
Object.assign(P,{
 "literature|The Tale of Genji":{phDrop:/^Kyoto$/},
 "literature|Dante’s journey":{phDrop:/^Florence$/},
 "literature|The great Russian novels":{pinsDrop:/^Moscow$/},
 "literature|Weeping at the campsite":{body:"In the dry steppes and deserts of Arabia (rusty red and orange on the climate map), Bedouin herders moved with the rains and the grass, so tribes camped together for a season and then went their separate ways. That is why the classical ode, the qasida, opens with the poet at the traces of an old camp, hearth stones half buried in sand, weeping for a beloved whose tribe has moved on. Then he rides off across the desert on his camel."},
 "literature|Homer’s Troy and Ithaca":{body:"The Iliad tells of the Trojan War; the Odyssey follows Odysseus on his ten-year voyage home. The Lotus-eaters, the Cyclops, the bag of winds, the giants who sink eleven of his ships, the witch Circe, the Underworld, the Sirens, Scylla and Charybdis: each danger waits on its own island or strait. He spends seven years on Calypso’s island before the Phaeacians carry him home. A sea full of islands suits such a story: an archipelago is a plot already cut into chapters.",
  stat:"Troy to Ithaca is about 500 km as the crow flies; Odysseus’s way home, as readers have mapped it, is over 5,000 km and takes him ten years"},
});
/* ---- Philosophy ---- */
Object.assign(P,{
 "philosophy|Córdoba: reason and revelation":{body:"Ibn Rushd (Averroes, born 1126) and Moses Maimonides (born 1138) both grew up in Córdoba, in al-Andalus, where Muslims, Jews and Christians lived side by side. Both tried to square reason with revelation. Ibn Rushd argued that truth cannot contradict truth, so careful reasoning and the Qur’an must agree; Maimonides, that where the Bible seems to clash with reason, it should be read as a metaphor. The question can’t be avoided when rival scriptures share one city."},
 "philosophy|Fragmentation: Greece’s many constitutions":{stat:"Aristotle’s school collected 158 constitutions to compare: Greece’s mountains and islands supplied the sample"},
});
/* ---- Mythology ---- */
Object.assign(P,{
 "mythology|Merlin’s stones":{phDup:true},
 /* Uluru has nothing to do with the drowned coasts of this stop */
 "mythology|Stories that remember the sea":{phDrop:/^Uluru$/},
 "mythology|Mount Kailash":{stat:"Mount Kailash is sacred to four religions, and nobody has ever climbed it"},
});
/* ---- Science ---- */
Object.assign(P,{
 "science|Ibn al-Haytham and light":{phDrop:/^Cairo$/},
 "science|Galileo’s telescope":{pinsDrop:/^Florence$/,phLabel:{"Florence’s cathedral":"Florence: his last years"}},
 "science|Greenwich and longitude":{phDup:true,phDrop:/^Greenwich’s prime meridian$/},
 "science|The natural nuclear reactor":{stat:"About 2 billion years ago a natural nuclear reactor started up by itself underground in Gabon, and ran on and off for hundreds of thousands of years"},
});
/* ---- Maths ---- */
Object.assign(P,{
 "maths|Counting in sixties":{pinsDrop:/^Babylon$/},
 "maths|Eratosthenes measures the Earth":{phDrop:/^The Nile at Aswan$/},
});
/* ---- Psychology: places the cards name, which had no label on the map ---- */
Object.assign(P,{
 "psychology|Hokkaido’s frontier":{pinsAdd:[[[142.6,43.5],"Hokkaido: settled in the late 1800s","point"]]},
 "psychology|Winter in Tromsø":{pinsAdd:[[[-82.53,27.34],"Sarasota, Florida: 1.4%","point"]]},
 "psychology|Heat and tempers":{pinsAdd:[[[-112.07,33.45],"Phoenix: summer days above 40 °C","point"]]},
 "psychology|A world of right angles":{pinsAdd:[[[21.5,-21.5],"Kalahari: San foragers, hardly fooled","point"]]},
 "psychology|City minds":{pinsAdd:[[[12.57,55.68],"Copenhagen","point"]]},
 "psychology|Rice south, wheat north":{pinsAdd:[[[116.4,39.9],"Beijing: wheat","point"],[[121.47,31.23],"Shanghai: rice","point"]]},
});
/* ---- Inventions ---- */
Object.assign(P,{
 /* generic country photos (the Great Wall, a Seoul palace, Big Ben) that had nothing to do with the stops */
 "inventions|China’s Four Great Inventions":{phDrop:/^(China: Great Wall of China|South Korea: Gyeongbokgung Palace)$/},
 "inventions|The first vaccine":{view:[-58,-5,73,58],phDrop:/^United Kingdom: Big Ben/},
 "inventions|The first computers":{view:[-147,30,18,60],pinsDrop:/^Berlin: Z3, 1941$/,iconDrop:/^statue$/},
 "inventions|Burrs, bricks and pens":{view:[-27,36,45,68],card:"left",pinsDrop:/^(Switzerland: Velcro|Billund: Lego, 1958|Moscow: Tetris, 1984)$/},
 "inventions|The first bouncing balls":{stat:"About 3,600 years ago people in Mexico were making rubber balls that bounced, some 3,000 years before any European saw rubber"},
});
/* ---- Words ---- */
Object.assign(P,{
 "words|Papua New Guinea: 840 languages":{pinsDrop:/^(Goroka|Vanuatu: over 100 languages)$/,phLabel:{"An Asaro mud man":"Goroka: an Asaro mud man","Port Vila, Vanuatu":"Vanuatu: over 100 languages"}},
 "words|Saints and rivers":{pinsDrop:/^Rio de Janeiro$/},
});
/* ---- Learning ---- */
Object.assign(P,{
});

/* ---- framing: views that keep each stop's places clear of the card (the card covers the left two-fifths of the map
   on a laptop screen), centred on the subject ---- */
Object.assign(P,{
 "cities|The biggest cities":{view:[23,-12,144,46]},
 "migration|Called in to rebuild":{view:[-162,8,34,62]},
 "people|Russia’s missing men":{view:[-8,22,95,75]},
 "culture|Europe’s odd ones out":{view:[-52,33,62,71]},
 "culture|How the world writes":{view:[-22,16,58,52]},
 "culture|Sign languages have borders too":{view:[-135,8,8,64]},
 "langrel|Catholicism moved west":{view:[-168,-56,16,62]},
 "langrel|The Reformation went south":{view:[-140,-36,20,72]},
 "langrel|Two homes for most Jews":{view:[-161,15,40,62]},
 "langrel|The most Muslim countries are not Arab":{view:[-24,-14,124,44],card:"left"},
 "langrel|Buddhism left home":{view:[12,-12,140,50]},
 "langrel|Sikhism’s Punjab":{view:[-210,-8,92,72]},
 "langrel|Waiting for the vultures":{view:[35,12,80,32]},
 "food|Chocolate moved to Africa":{view:[-168,-30,10,40]},
 "food|The first noodles":{view:[-85,-5,141,58]},
 "food|Dishes that travelled":{view:[-230,-10,19,65]},
 "festivals|Carnival":{view:[-172,-38,16,62]},
 "festivals|Holi and Diwali":{view:[64,19.9,92,33.1]},
 "landmarks|The race for the sky":{view:[-29,-10,126,45]},
 "flags|Maps on flags":{view:[2.5,30,41,48]},
 "art|The first artists":{view:[-105,-35,128,65]},
 "music|Vienna, city of music":{view:[-3,44,18.5,54.5]},
 "music|Down the Mississippi: blues and jazz":{view:[-112,24,-62,47],card:"left"},
 "literature|One Thousand and One Nights":{view:[-47,8,68,60]},
 "maths|Zero and algebra go west":{view:[-55,4,82,56]},
 "inventions|The wheel":{view:[-20,25,54,58]},
 "inventions|Who called first?":{view:[-142,33,0,62],card:"left"},
 "inventions|Taking to the air":{view:[-157,28,10,55]},
 "inventions|A lucky mould":{view:[-163,25,5,60]},
 "words|Words named after places":{view:[-48,26,46,58]},
});

})();
