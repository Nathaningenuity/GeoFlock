/* GeoFlock: the tour review, applied to the Ideas & arts shelf (Inventions, Art and architecture, Literature, Learning,
   Music, Myths and legends, Science, Maths, Words on the map). Psychology and Philosophy were rebuilt just before the
   review and are left as they are.
   - Inventions, Art, Literature and Learning (scored under 7.0) are reworked: stops reordered, duplicated stops cut,
     new stops that say why an idea or a style appeared where it did (place → mechanism → result).
   - Music, Myths, Science, Maths and Words get the review's best new stops, a few edits and de-duplications.
   - Every tour here now runs on the Relief map: stops that sat on the History map for an empire keep it as an overlay
     (gfEmpire, from geoflock-tourover.js) instead of switching maps; climate zones (gfClimate), wind and trade arrows,
     routes, rulers and day and night (gfSun) carry the new stops.
   Stops are found by tour id and title; kept stops are the very objects the other files built and patched, so their
   photos and pins stay. New photos (Wikimedia Commons, free licences, author and page listed) are in GF_RVI_PHOTOS.
   Load it after the tour files and every polish patch. */
(function(){
if(typeof PS_TOURS==="undefined")return;
const W=[-180,-58,180,80],OR="#d9682b";
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,card:"left",_ff:1},o);
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();

/* ---------- new photos (Wikimedia Commons), added to the shared library ---------- */
window.GF_RVI_PHOTOS=[{"f": "Nashtifan Asbaad.jpg", "d": "photos/x6badfd5595b43b43.webp", "by": "MorvaridiMeraj", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Nashtifan_Asbaad.jpg"},
 {"f": "Farm Strips Honeyhall and Hall Floor Off Acre Edge Road, Laxton - geograph.org.uk - 4245914.jpg", "d": "photos/xd9843a81e0f22743.webp", "by": "Jo and Steve Turner", "lic": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Farm_Strips_Honeyhall_and_Hall_Floor_Off_Acre_Edge_Road%2C_Laxton_-_geograph.org.uk_-_4245914.jpg"},
 {"f": "Yuan Underglaze Blue Jingdezhen Porcelain.jpg", "d": "photos/xb56202350e2fa43e.webp", "by": "Gary Lee Todd", "lic": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Yuan_Underglaze_Blue_Jingdezhen_Porcelain.jpg"},
 {"f": "Castilla elastica Bark Scar.jpg", "d": "photos/xdcad3cef9ed5cfc7.webp", "by": "Dacrycarpus", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Castilla_elastica_Bark_Scar.jpg"},
 {"f": "Portrait of Pope Paul III with Camauro (by Titian) - National Museum of Capodimonte.jpg", "d": "photos/xb4d1140a4cc17025.webp", "by": "Titian (1543, Museo di Capodimonte, Naples)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Portrait_of_Pope_Paul_III_with_Camauro_%28by_Titian%29_-_National_Museum_of_Capodimonte.jpg"},
 {"f": "Alice Springs Australia.jpg", "d": "photos/x3c3321fb69bb7858.webp", "by": "Johannes Püller", "lic": "CC BY-SA 2.0 AT", "page": "https://commons.wikimedia.org/wiki/File:Alice_Springs_Australia.jpg"},
 {"f": "Lapis Lazuli from Afghanistan.jpg", "d": "photos/x3241c272688f3f36.webp", "by": "Guy Courtois", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Lapis_Lazuli_from_Afghanistan.jpg"},
 {"f": "Sassoferrato - Jungfrun i bön.jpg", "d": "photos/x135c24109d437479.webp", "by": "Sassoferrato (1640–50, National Gallery, London)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Sassoferrato_-_Jungfrun_i_b%C3%B6n.jpg"},
 {"f": "Horyuji June 2019.jpg", "d": "photos/x6abf6fcc850c676c.webp", "by": "Cun Cun", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Horyuji_June_2019.jpg"},
 {"f": "Haasts Bluff, NT photographed in 2011. 02.JPG", "d": "photos/x33d3e8a54c602112.webp", "by": "Ellen Rae", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Haasts_Bluff%2C_NT_photographed_in_2011._02.JPG"},
 {"f": "Talking drum from western part of Nigeria, West Africa.jpg", "d": "photos/x0a3677af19ebc87d.webp", "by": "Bamidele S. Ajayi", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Talking_drum_from_western_part_of_Nigeria%2C_West_Africa.jpg"},
 {"f": "Gabon Geology Oklo.svg", "d": "photos/x08c044847a059e60.webp", "by": "MesserWoland (after the US Department of Energy)", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Gabon_Geology_Oklo.svg"},
 {"f": "Crater lake oregon.jpg", "d": "photos/x703d887680a8902e.webp", "by": "Zainubrazvi", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Crater_lake_oregon.jpg"},
 {"f": "Jan Verkolje - Antonie van Leeuwenhoek.jpg", "d": "photos/xb27a2368bdcd4243.webp", "by": "Jan Verkolje (about 1680, Rijksmuseum)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Jan_Verkolje_-_Antonie_van_Leeuwenhoek.jpg"},
 {"f": "Rhind Mathematical Papyrus.jpg", "d": "photos/x6ebf080c261e6dd2.webp", "by": "Egyptian scribe Ahmes (about 1550 BC, British Museum)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Rhind_Mathematical_Papyrus.jpg"},
 {"f": "Carl Friedrich Gauss 1840 by Jensen.jpg", "d": "photos/xcd046e8221bb906a.webp", "by": "Christian Albrecht Jensen (1840)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Carl_Friedrich_Gauss_1840_by_Jensen.jpg"},
 {"f": "A typical London taxi in Earl's Court, 2024.jpg", "d": "photos/x778d6c1a86cfda90.webp", "by": "Hotolmo22", "lic": "CC0", "page": "https://commons.wikimedia.org/wiki/File:A_typical_London_taxi_in_Earl%27s_Court%2C_2024.jpg"},
 {"f": "Basho by Kinkoku c1820.jpg", "d": "photos/x49d8e02bcfd1f66d.webp", "by": "Yokoi Kinkoku (about 1820)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Basho_by_Kinkoku_c1820.jpg"},
 {"f": "Darb-i Imam shrine spandrel.JPG", "d": "photos/xcfc0138de22f6d4e.webp", "by": "Unknown artisans, 1453 (photo: Wikimedia Commons)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Darb-i_Imam_shrine_spandrel.JPG"},
 {"f": "Yurtakonsert med Tyva Kyzy (41573199210).jpg", "d": "photos/xe8e1ba4920551d39.webp", "by": "Riddu Riđđu", "lic": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Yurtakonsert_med_Tyva_Kyzy_%2841573199210%29.jpg"},
 {"f": "Barranco de Arure, La Gomera.jpg", "d": "photos/x50d587bdf22d3ab5.webp", "by": "GerritR", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Barranco_de_Arure%2C_La_Gomera.jpg"}];
const PHOTOS=window.GF_RVI_PHOTOS;
let _mN=-1;function mergePh(){try{if(typeof PS_PHOTO_DATA!=="undefined"&&PS_PHOTO_DATA.length===_mN)return;if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)});_mN=PS_PHOTO_DATA.length}catch(e){}}
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")mergePh();else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
const _li=new Map();const libIdx=f=>{try{if(!f)return -1;const c=_li.get(f);if(c!=null&&PS_PHOTO_DATA[c]&&PS_PHOTO_DATA[c].f===f)return c;mergePh();const i=PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d);if(i>=0)_li.set(f,i);return i}catch(e){return -1}};

/* ---------- empires: the History-map group of a stop, drawn over the Relief map ---------- */
const EMP={sum:"Sumer",hit:"Hittites",ptol:"Ptolemaic Egypt",harsha:"Harsha’s kingdom",isl:"Abbasid Caliphate",songhai:"Songhai Empire",
 mughal:"Mughal Empire",ah:"Habsburg lands",timur:"Timurid Empire",maya:"Maya states",aztec:"Aztec Empire",chn:"China"};
const yr=k=>/^bc/.test(k)?1-(+k.slice(2)):+k;
function toRelief(s){try{if(!s||s.mode!=="history")return;const sub=String(s.sub||"");const [yk,gk]=sub.split("/");
  if(gk&&EMP[gk]&&!s.gfEmpire&&!s._rvNoEmp)def(s,"gfEmpire",{y:yr(yk),gk,name:EMP[gk]});
  ["mode","sub","bannerNote"].forEach(k=>{try{delete s[k]}catch(e){}if(s[k]!==undefined)def(s,k,undefined)})}catch(e){console.error("review-ideas relief",e)}}

/* ---------- text helpers ---------- */
const pt=(at,t)=>[at,t,"point"],area=(at,t)=>[at,t,"area"];
/* edits: e(fields) sets the given fields on a kept stop (null deletes) */
const e=o=>s=>{for(const k in o){if(o[k]===null){try{delete s[k]}catch(x){}if(s[k]!==undefined)def(s,k,undefined)}else def(s,k,o[k])}};
const both=(...f)=>s=>f.forEach(g=>g(s));
const addMore=(txt,front)=>s=>def(s,"more",front?txt+" "+(s.more||""):(s.more||"")+" "+txt);

/* ======================================================================================================
   PLAN: for each tour, the stops in their new order. A string keeps the stop of that title (["title", edit] edits it,
   ["old title", edit, "new title"] renames it); an object is a new stop. Stops not listed are cut.
   Photo pins: PH["tour|title"] = {set:true?, pins:[[lon,lat], label, file]} (set replaces the stop's photo pins).
   Card photos: CARD["tour|title"] = file.
   ====================================================================================================== */
const PLAN={},PH={},CARD={},TQ={};

/* ---------------------------------- Inventions ---------------------------------- */
PLAN.inventions={hint:"The wheel, rubber balls, China’s great inventions, Persian windmills, the heavy plough, porcelain, steam, vaccines, flight, penicillin, computers and the internet",
order:[
 ["Where ideas were born",e({body:"This tour visits the places where great inventions first appeared, from the wheel to Wi-Fi, and asks why there: a wind that never changes, a heavy soil, a hill of white clay, a tree with bouncy sap, cheap coal. Many inventions had several inventors in different places, so expect a few arguments.",
  more:"Writing and the numbers we count with have their own stories, in the Words on the map and Maths tours."})],
 "The wheel",
 S({title:"The first bouncing balls",view:[-105,13.5,-89,23.5],globe:[-94.5,18,4.5],hiSoft:["mx"],gfClimate:{alpha:.5,box:[-112,6,-80,30]},
  pins:[pt([-94.76,17.75],"San Lorenzo, an Olmec city"),area([-93.2,16.4],"Hot, wet lowlands: rubber trees")],
  stat:"About 3,600 years ago people in Mexico were making rubber balls that bounced, some 3,000 years before Europeans saw rubber",
  body:"Rubber trees grow wild in the hot, wet lowlands along the Gulf of Mexico (the blue climate zones on the map: hot and wet all year). People there found that mixing the tree’s milky sap with juice from a morning-glory vine turned sticky goo into tough, bouncy rubber, and by changing the mix they made balls, sandal soles and bands. Balls from about 1600 BC have been found in the waterlogged spring at El Manatí.",
  more:"The balls were for a sacred ball game played across Mexico and Central America for thousands of years. The Aztecs later called the people of this coast the Olmec, ‘the rubber people’. In 1999 scientists at MIT tested the old recipe and it worked. Charles Goodyear patented his way of toughening rubber, vulcanisation, only in 1844."}),
 ["China’s Four Great Inventions",e({gfEmpire:{y:1000,gk:"chn",name:"Song China"}})],
 S({title:"Windmills of the 120-day wind",view:[49,27,67,39],globe:[60.5,33,4],hi:["ir"],hiSoft:["af"],
  lines:[{coords:[[58.6,38.2],[59.6,36.4],[60.4,34.6],[61.0,32.6],[61.5,30.6]],kind:"flow"},{coords:[[61.3,37.8],[61.6,35.8],[61.8,33.6],[62.0,31.4]],kind:"flow"},{coords:[[56.4,37.4],[57.6,35.3],[58.6,33.2]],kind:"flow"}],
  pins:[pt([61.49,31.03],"Zabol, in the Sistan basin"),area([60.9,36.9],"The summer wind blows from the north")],
  stat:"Windmills still turn at Nashtifan in eastern Iran, driven by the ‘wind of 120 days’",
  body:"Every summer, from about May to September, a strong wind blows from the north down eastern Iran into the Sistan basin, almost always from the same direction (arrows). People there built windmills whose sails turn flat, like a revolving door, on an upright shaft, set behind tall mud walls that steer the wind onto one side of the sails, and used them to grind grain.",
  more:"Arab and Persian geographers described Sistan’s windmills over 1,000 years ago. A mill that catches the wind on one side only suits a place where the wind never changes direction. Europe’s windmills, with upright sails turned to face the wind, appear in the late 1100s and may be a separate invention. About 30 mills stand at Nashtifan, and a few still grind."}),
 S({title:"The heavy plough and the furlong",view:[-26,34,24,62],globe:[6,50,2.2],gfClimate:{alpha:.5,box:[-32,28,46,68]},
  pins:[area([14.5,40.6],"Dry summers, light soils: the scratch-plough"),area([12,52.6],"Wet, heavy clay: the heavy plough")],
  stat:"A ‘furlong’ was a ‘furrow long’: the length of one furrow, about as far as an ox team could plough before it needed a rest",
  body:"The light scratch-plough of the dry Mediterranean only scratches a groove, and it could not cope with the heavy, wet clay soils of northern Europe. The heavy plough had an iron blade and a board that turned the soil right over, which also drained it, but it needed a team of up to eight oxen. Few farmers owned eight, so villages pooled their animals, and because such a long team was hard to turn, fields were laid out in long, thin strips.",
  more:"Laxton, in Nottinghamshire, is the last village in England still farming its open fields in strips. Some economists argue the heavy plough helped shift Europe’s people and wealth north, to the clay lands, though how much is debated. The colours on the map are today’s climate zones: yellow for the dry Mediterranean summers in the south, green for rain all year round in the north."}),
 S({title:"Porcelain from one hill",view:[106,25,124,34],globe:[117,30,4.5],hi:["cn"],on:["rivers"],
  lines:[{coords:[[117.21,29.29],[116.9,29.15],[116.5,29.05],[116.2,29.3],[116.1,29.72]],kind:"flow"},{coords:[[116.1,29.72],[117.0,30.5],[118.8,32.05],[120.5,31.8],[121.5,31.3]],kind:"flow"}],
  pins:[pt([117.45,29.5],"Gaoling: the kaolin hill")],
  stat:"English calls porcelain ‘china’, and its clay, kaolin, is named after Gaoling, a hill near Jingdezhen",
  body:"Jingdezhen had everything porcelain needs close together: white kaolin clay and ‘porcelain stone’ in the hills around it, pine forests to fire kilns to about 1,300 °C, and rivers to float the fragile pots down to Poyang Lake and the Yangtze (arrows). It became the emperors’ porcelain town, and its blue-and-white wares travelled as far as Europe and East Africa.",
  more:"The blue came from cobalt, at first carried all the way from Persia. Europeans tried for centuries to copy porcelain; in Saxony, Johann Böttger found the recipe around 1708, and the Meissen factory opened in 1710, but by then the name ‘china’ had stuck."}),
 ["The steam engine",e({body:"Thomas Newcomen’s engine, first set up at a coal mine near Dudley in 1712, wasted huge amounts of fuel, but at a coal mine fuel was almost free. British wages were also high, so a machine that did the work of men and horses paid for itself. In the 1760s James Watt, in Glasgow, added a separate condenser that used far less coal, and steam engines spread to factories, ships and trains.",
  more:"The historian Robert Allen argues that this mix of cheap coal and dear labour is why the Industrial Revolution began in Britain rather than in France or China; others stress science and Britain’s laws and institutions. Watt invented the word ‘horsepower’ to sell his engines, and the watt is named after him. The first public railway to use steam engines opened between Stockton and Darlington in 1825."})],
 "The first vaccine","Who called first?","Taking to the air","A lucky mould","The first computers","Burrs, bricks and pens",
 ["The internet and the Web",e({title:"From LO to Wi-Fi",view:W,globe:[-40,35,1],card:"left",gfRuler:null,hi:["us","ch","jp","au","se","fi"],hiSoft:null,G:null,legend:null,
   lines:[{coords:[[-118.44,34.07],[-120.5,35.8],[-122.18,37.46]],kind:"flow"}],
   pins:[pt([-122.18,37.46],"Stanford Research Institute"),pt([6.05,46.23],"CERN: the Web, 1989"),pt([24.94,60.17],"Helsinki: Linux, 1991"),pt([13.19,55.7],"Lund: Bluetooth"),pt([137.03,35.02],"Japan: the QR code, 1994"),pt([151.2,-33.87],"Australia: Wi-Fi’s patent")],
   stat:"The first message on the internet’s ancestor, in 1969, was ‘LO’: the computer crashed before ‘LOGIN’",
   body:"ARPANET linked a computer at UCLA, in Los Angeles, to one at Stanford Research Institute, about 500 km away. In 1989 Tim Berners-Lee, at CERN near Geneva, proposed the World Wide Web: the internet is the network, the Web the pages and links on top of it. Wi-Fi rests on a patent from Australia’s science agency, CSIRO, for untangling radio echoes indoors, and the QR code was invented in 1994 to track Toyota car parts.",
   more:"Bluetooth, from Ericsson in Sweden, is named after Harald Bluetooth, a Danish king of the 900s, and its logo joins his initials in runes. Linux, which runs most of the world’s servers and lies under Android, began as a student project in Helsinki in 1991. The first mobile phone call was made on a New York street in 1973."}),"From LO to Wi-Fi"],
 "Now explore"]};
PH["inventions|Where ideas were born"]={set:true,pins:[[[14.5,45.95],"The oldest wooden wheel","Ljubljana Marshes Wheel with axle (oldest wooden wheel yet discovered).jpg"],
 [[60.17,34.43],"Nashtifan’s windmills","@nashtifan"],[[117.21,29.29],"Jingdezhen porcelain","@jingdezhen"],
 [[-2.08,52.51],"The steam engine","Newcomen atmospheric engine (Heat Engines, 1913).jpg"],[[-75.19,39.95],"ENIAC, Philadelphia","ENIAC-changing a tube.jpg"],
 [[-118.44,34.07],"The internet’s first message","The IMP Log The Very First Message Sent on the Internet (6293913865).jpg"],[[9.11,55.73],"Lego, Billund","Lego bricks.jpg"]]};
PH["inventions|Windmills of the 120-day wind"]={set:true,pins:[[[60.17,34.43],"Nashtifan: the windmills","@nashtifan"]]};
PH["inventions|The heavy plough and the furlong"]={set:true,pins:[[[-0.92,53.2],"Laxton: strips still farmed","@laxton"]]};
PH["inventions|Porcelain from one hill"]={set:true,pins:[[[117.21,29.29],"Jingdezhen: blue-and-white","@jingdezhen"]]};
PH["inventions|The first bouncing balls"]={set:true,pins:[[[-94.68,17.95],"Gulf lowlands: a tapped rubber tree","@rubber"]]};
CARD["inventions|Windmills of the 120-day wind"]="@nashtifan";CARD["inventions|From LO to Wi-Fi"]="The IMP Log The Very First Message Sent on the Internet (6293913865).jpg";CARD["inventions|The heavy plough and the furlong"]="@laxton";
CARD["inventions|Porcelain from one hill"]="@jingdezhen";CARD["inventions|The first bouncing balls"]="@rubber";
TQ.inventions={mid:[
 {at:"Windmills of the 120-day wind",st:"Windmills of the 120-day wind",q:"Why do Nashtifan’s windmills only need to catch the wind on one side?",o:["The wind there almost never changes direction","The sails are too heavy to turn","Walls block wind from the south","They only work at night"],a:0,why:"The summer ‘wind of 120 days’ blows from the north, day after day.",kc:"ir"},
 {at:"Taking to the air",st:"Taking to the air",q:"How long was the Wright brothers’ first flight in 1903?",o:["12 seconds","12 minutes","About an hour","2 seconds"],a:0,why:"Orville flew about 37 m at Kitty Hawk.",kc:"us"},
 {at:"From LO to Wi-Fi",st:"A lucky mould",q:"How was penicillin discovered in 1928?",o:["Fleming tested it on soldiers","It was found in a melon","Mould grew on a dish left out","A lab fire exposed it"],a:2,why:"Fleming noticed the mould had killed bacteria around it.",kc:"gb"}],
 recap:[
 {q:"Why was the QR code created?",o:["To pay bills","To store music","To sell tickets","To track car parts"],a:3,why:"It was invented in Japan in 1994 to track Toyota car parts.",st:"From LO to Wi-Fi",kc:"jp"},
 {q:"The word ‘kaolin’, the clay that makes porcelain, comes from…",o:["A hill near Jingdezhen","A Dutch merchant","A Persian word for white","A river in Korea"],a:0,why:"Gaoling, close to China’s porcelain town.",st:"Porcelain from one hill",kc:"cn"},
 {q:"What inspired Velcro?",o:["Burrs stuck to a dog","Spider webs","Bird feathers","Seashells"],a:0,why:"George de Mestral copied the tiny hooks he saw under a microscope.",st:"Burrs, bricks and pens",kc:"ch"}]};

/* ---------------------------------- Art and architecture ---------------------------------- */
PLAN.art={hint:"Cave art, pyramids and ziggurats, the Parthenon, earthquake-proof pagodas, Gothic light, the Alhambra, lapis blue, Florence and Venice, the Taj Mahal, the Great Wave, Benin brass, Gaudí, skyscrapers and desert dot painting",
order:[
 ["Art and architecture",e({body:"This tour visits the places where people made their greatest pictures and buildings, and asks why they look the way they do there: the stone, clay and colours at hand, a damp climate, earthquakes, and beliefs about what may be shown.",
  more:"Every culture on Earth has made art. Many of the buildings on this tour are UNESCO World Heritage Sites, protected as treasures for everyone. The Landmarks tour visits more famous buildings."})],
 "The first artists",
 ["Pyramids and ziggurats",e({body:"Egypt’s pharaohs built pyramids as tombs; the Great Pyramid of Khufu, finished around 2560 BC, rose 146 m. In Mesopotamia people built ziggurats, stepped temple towers, at the heart of cities like Ur and Uruk. Each used what its land gave: the Nile is lined with limestone cliffs, so Egypt built in stone; Mesopotamia’s river plain has almost no stone, so its towers are mud brick, with a skin of baked brick set in tar."})],
 ["The Parthenon",addMore("Its marble was quarried on Mount Pentelikon, about 16 km away, and hauled down to Athens on sledges and carts.",true)],
 S({title:"Pagodas that dance",view:[124,30,144,42],globe:[137,36,3],hi:["jp"],on:["plates"],
  pins:[pt([139.81,35.71],"Tokyo Skytree, 634 m")],
  stat:"Japan’s wooden pagodas have stood through centuries of earthquakes; Hōryū-ji’s is about 1,300 years old",
  body:"Japan sits where four of Earth’s plates meet (the lines on the map), so it shakes constantly. Its pagodas are built as stacked storeys that are not tied tightly to one another, around a tall central post, the shinbashira. In a quake the storeys sway in opposite directions, like a wriggling snake, and the shaking is soaked up instead of breaking the building.",
  more:"Records suggest hardly any pagoda has ever been brought down by an earthquake, though many burned. Hōryū-ji, near Nara, has some of the oldest wooden buildings in the world. The designers of Tokyo Skytree gave it a concrete central column inspired by the shinbashira."}),
 "Gothic cathedrals","The Alhambra","The Forbidden City",
 S({title:"The blue from one valley",view:[-20,20,80,56],globe:[42,37,1.6],hi:["af"],
  lines:[{coords:[[70.79,36.2],[68.9,36.7],[66.9,36.75],[62.2,36.6],[58.8,36.2],[54,36],[51.4,35.7],[48.5,34.8],[44.4,33.3],[41,34.5],[38.2,35.9],[37.16,36.2],[35.8,36.1]],kind:"dash"},{coords:[[35.8,36.1],[30,35],[24,35.5],[19.5,38.5],[17,41.5],[13.5,44.5],[12.33,45.44]],kind:"dash"}],
  pins:[pt([67.83,34.82],"Bamiyan: ultramarine murals, about 650"),pt([12.33,45.44],"Venice: where the blue entered Europe")],
  stat:"For centuries Europe’s finest blue paint came from one set of mines in the mountains of north-east Afghanistan",
  body:"Ultramarine was made by grinding lapis lazuli, a blue stone dug at Sar-i Sang in the Kokcha valley for over 6,000 years. It travelled so far (dashed line) that its name means ‘from beyond the sea’, and it could cost more than gold. So painters saved it for what mattered most, very often the robe of the Virgin Mary, which is one reason she is so often shown in blue.",
  more:"Some of the earliest known paintings made with ultramarine are Buddhist cave murals at Bamiyan, also in Afghanistan, from around the 600s. In 1824 a French society offered a prize for a cheap artificial version; Jean-Baptiste Guimet won it in 1828, and painters no longer had to pay for the stone."}),
 "Renaissance Florence",
 S({title:"Venice paints on canvas",view:[3,40.5,17,47.5],globe:[12,44,4.5],hi:["it"],
  pins:[pt([11.26,43.77],"Florence: frescoes on the walls")],
  stat:"Venice’s damp, salty air spoiled wall paintings, so its painters turned to oil on canvas, and canvas spread across Europe",
  body:"Elsewhere in Italy the great works were frescoes, painted into wet plaster on walls. Venice is built on islands in a lagoon, and damp and salt crept into its walls, so plaster crumbled and frescoes flaked. By about 1500 Venetian painters such as Giorgione and Titian were working in oil on big canvases, in a seafaring city that made sailcloth.",
  more:"Canvas could be rolled up, shipped and sold abroad, which helped Venetian pictures travel. Oil paint also allowed the deep, glowing colours Venice is famous for. Florence’s frescoes, by contrast, are still on the walls where they were painted."}),
 ["The Benin Bronzes",addMore("Much of the metal came from Europe: Portuguese and later Dutch traders paid for pepper, ivory and enslaved people with brass rings called manillas, which the casters melted down.",true)],
 ["The Taj Mahal",both(e({gfEmpire:{y:1650,gk:"mughal",name:"Mughal Empire",at:[78.5,22.5]}}),addMore("Its four-part garden copies the Persian walled ‘paradise garden’; an old Persian word for such a garden, pairidaeza, gave us the word ‘paradise’.",true))],
 ["The Great Wave",addMore("The wave’s deep blue is Prussian blue, a pigment made in Berlin around 1706 and brought to Japan by Dutch and Chinese traders: a European blue that came back to Europe in a Japanese print.")],
 "Gaudí’s Barcelona",
 ["Skyscrapers",e({stat:"Skyscrapers were born in Chicago, out of a great fire and the price of land",
  body:"After the Great Fire of 1871 cleared central Chicago, land in the rebuilt business district grew so expensive that the only way to get more floor space was up. Steel frames, which carry a building’s weight instead of its walls, and safe electric lifts made it possible. The 10-storey Home Insurance Building of 1885 is often called the first skyscraper.",
  more:"Towers still go up where land is dearest, in the hearts of big cities: the Burj Khalifa in Dubai, 828 m tall, has been the tallest since 2010. Shibam in Yemen had mud-brick tower houses up to about 30 m tall in the 1500s: the ‘Manhattan of the desert’."})],
 S({title:"Dots in the desert",view:[112,-33,142,-14],globe:[132,-23.5,3],hi:["au"],gfClimate:{alpha:.45,box:[100,-42,156,-6]},
  pins:[pt([133.88,-23.7],"Alice Springs")],
  stat:"One of the world’s best-known art movements began in 1971 with a mural on a school wall in a remote desert settlement",
  body:"Papunya was a government settlement where several desert peoples, among them Pintupi, Luritja and Warlpiri, had been moved. In 1971 a teacher, Geoffrey Bardon, encouraged older men to paint a Honey Ant Dreaming on the school wall. Soon they were painting their ancestral stories in acrylic paint on board and canvas: designs once made in sand, on bodies and on ceremonial objects.",
  more:"Some designs are sacred and secret, so artists began to hide them under fields of dots, the style the world now knows. Desert painting became a big art market; in 2007 the National Gallery of Australia bought Clifford Possum Tjapaltjarri’s Warlugulong for 2.4 million Australian dollars."}),
 ["Now explore",e({body:"Switch to the Satellite map and zoom in on Giza or the Forbidden City: the great buildings show up from space. The Landmarks tour visits more famous places, and the Music and Literature tours follow other arts around the world."})]]};
PH["art|Art and architecture"]={set:true,pins:[[[1.17,45.05],"Lascaux, about 17,000 years old","@lascaux"],[[31.13,29.98],"Giza","@giza"],[[23.73,37.97],"The Acropolis, Athens","@acropolis"],
 [[135.73,34.61],"Hōryū-ji’s pagoda","@horyuji"],[[78.04,27.17],"Agra","@agra"],[[2.17,41.4],"Sagrada Família","@sagrada"],[[55.27,25.2],"Dubai: Burj Khalifa","@burj"]]};
PH["art|Pagodas that dance"]={set:true,pins:[[[135.73,34.61],"Hōryū-ji: the pagoda","@horyuji"],[[139.81,35.71],"Tokyo Skytree","Tokyo Skytree 2014 Ⅲ.jpg"]]};
PH["art|The blue from one valley"]={set:true,pins:[[[70.79,36.2],"Sar-i Sang: lapis lazuli","@lapis"],[[12.48,41.9],"Rome: ultramarine for the Virgin’s robe","@virgin"]]};
PH["art|Venice paints on canvas"]={set:true,pins:[[[12.34,45.43],"Titian, master of Venice’s oil on canvas","@titian"]]};
PH["art|Dots in the desert"]={set:true,pins:[[[131.92,-23.21],"Papunya’s desert country","@papunya"]]};
CARD["art|Pagodas that dance"]="@horyuji";CARD["art|The blue from one valley"]="@lapis";CARD["art|Venice paints on canvas"]="@titian";CARD["art|Dots in the desert"]="@papunya";
TQ.art={mid:[
 {at:"The first artists",st:"The first artists",q:"Where is the oldest known cave art, a hand stencil at least 67,800 years old?",o:["Lascaux, France","Altamira, Spain","Sulawesi, Indonesia","Kakadu, Australia"],a:2,why:"It was found on Muna, an island off Sulawesi.",kc:"id"},
 {at:"Pagodas that dance",st:"Pagodas that dance",q:"What helps Japan’s wooden pagodas survive earthquakes?",o:["Deep stone foundations","Loose storeys swaying round a central post","Steel cables","Very thick walls"],a:1,why:"The storeys sway in opposite directions around the shinbashira, soaking up the shaking.",kc:"jp"},
 {at:"Venice paints on canvas",st:"Venice paints on canvas",q:"Why did Venice’s painters turn from frescoes to oil on canvas?",o:["The Pope ordered it","Damp, salty air spoiled wall paintings","Canvas was cheaper than paint","Venice had no walls"],a:1,why:"Plaster crumbled in the lagoon’s damp, and canvas could also be shipped abroad.",kc:"it"}],
 recap:[
 {q:"Where did Europe’s finest blue paint, ultramarine, come from?",o:["Mines in north-east Afghanistan","Sea snails in Lebanon","A plant in India","Copper mines in Cyprus"],a:0,why:"Lapis lazuli from Sar-i Sang, ground into paint.",st:"The blue from one valley",kc:"af"},
 {q:"Who built the Taj Mahal, as a tomb for his wife?",o:["Akbar","Shah Jahan","Babur","Ashoka"],a:1,why:"The Mughal emperor built it at Agra for Mumtaz Mahal.",st:"The Taj Mahal",kc:"in"},
 {q:"Why did Papunya’s painters cover parts of their pictures with dots?",o:["To hide sacred designs","Brushes were scarce","To copy French painters","To show rain"],a:0,why:"Some designs were secret, so dots veiled them.",st:"Dots in the desert",kc:"au"}]};

/* ---------------------------------- Literature ---------------------------------- */
PLAN.literature={hint:"Gilgamesh, Homer, India’s epics, desert odes, the Nights, Genji, Iceland’s sagas, Dante, Shakespeare, Don Quixote, Bashō’s road, Russian novels, Achebe, García Márquez and the Nobel map",
order:[
 ["Literature around the world",e({body:"Stories are older than writing: people told them aloud for thousands of years. This tour visits the places where some of the world’s best-loved stories were made, and asks how the land and the way of life there shaped them: a sea full of islands, a desert of moving camps, an island with no king, a country of sharp seasons."})],
 "The Epic of Gilgamesh","Homer’s Troy and Ithaca","The Mahabharata and the Ramayana",
 S({title:"Weeping at the campsite",view:[22,10,62,36],globe:[46,23,2.4],hiSoft:["sa"],gfClimate:{alpha:.45,box:[8,2,76,44]},
  pins:[area([44,24.5],"Najd, central Arabia"),pt([39.83,21.42],"Mecca")],
  stat:"The great early Arabic odes all open in the same place: an abandoned desert campsite where the poet’s beloved once lived",
  body:"In the dry steppe and desert of Arabia (red and orange on the climate map laid over it), Bedouin herders had to keep moving with the rains and the grass, so tribes camped together for a season and then went their separate ways. The classical ode, the qasida, begins with the poet stopping at the traces of an old camp, hearth stones and tent trenches half buried in sand, and weeping for the beloved whose tribe has moved on. Then he rides off across the desert on his camel.",
  more:"The most famous, by the prince Imru’ al-Qais in the 500s, opens ‘Stop, let us weep at the memory of a beloved and a dwelling’. A legend says the best odes were hung on the Kaaba in Mecca, hence their name, the Mu’allaqat, ‘the hung ones’; historians doubt it. Poets went on opening odes at ruined camps for centuries, even in cities far from the desert."}),
 "One Thousand and One Nights","The Tale of Genji",
 S({title:"Sagas by the fireside",view:[-32,62.5,-12,67.3],globe:[-19,65,5],hi:["is"],gfSun:{utc:16,day:355},
  pins:[pt([-21.29,64.66],"Reykholt: Snorri Sturluson’s farm")],
  stat:"Icelanders can still read their sagas, written down about 800 years ago, without much trouble",
  body:"Iceland was settled from the 870s by farmers with no king. Quarrels went each summer to the Althing, an open-air assembly at Þingvellir, so the sagas are full of feuds, lawsuits and revenge. On scattered farms through the long, dark winters (the map shows a December afternoon), families held the kvöldvaka, the ‘evening wake’: while everyone spun wool and mended tools, one person read the sagas aloud.",
  more:"Cut off on an island, Icelandic changed so little that it is still close to the Old Norse of the sagas. Most were written down in the 1200s and 1300s; Snorri Sturluson, who also recorded the Norse myths, lived at Reykholt. Today Icelanders give each other books on Christmas Eve: the jólabókaflóð, the ‘Christmas book flood’."}),
 ["Dante’s journey",addMore("Italy was split into rival city-states, each with its own dialect. Dante’s Tuscan won partly because Florence’s bankers and merchants carried it everywhere, and because Petrarch and Boccaccio wrote in it too.")],
 ["Shakespeare’s London",addMore("The playhouses stood just outside the City of London’s control, on Bankside in Southwark and in Shoreditch, because the City’s leaders disliked plays and the crowds they drew.")],
 "Don Quixote’s La Mancha",
 S({title:"Bashō’s narrow road",view:[130,33,144,41.5],globe:[139,37.5,3.6],hi:["jp"],
  lines:[{coords:[[139.8,35.68],[139.6,36.75],[140.23,37.05],[140.87,38.27],[141.06,38.37],[141.11,38.99],[140.75,38.8],[140.4,38.6],[140.44,38.31],[140.3,38.75],[139.84,38.91],[139.9,39.2],[139.84,38.91],[139.5,38.4],[139.0,37.9],[138.5,37.3],[137.86,37.04],[137.2,36.75],[136.65,36.56],[136.22,36.06],[136.06,35.65],[136.62,35.36]],kind:"dash"}],
  pins:[pt([139.8,35.68],"Edo: the start"),pt([141.06,38.37],"Matsushima"),pt([139.9,39.2],"Kisakata"),pt([136.62,35.36],"Ōgaki: the end")],
  stat:"In 1689 the poet Bashō walked about 2,400 km through northern Japan in some 150 days, and turned the journey into haiku",
  body:"Japan’s seasons are sharply marked: cherry blossom, the rainy season, cicadas, red maples, snow. So every haiku is expected to hold a ‘season word’, a kigo, and poets keep almanacs listing thousands of them. In his travel diary, The Narrow Road to the Deep North, Bashō mixes prose with haiku about the places he passed (dashed line).",
  more:"At Hiraizumi, where a great warrior clan had been wiped out five centuries earlier, he wrote: ‘Summer grasses: all that remains of warriors’ dreams.’ A few years before, in Edo (today’s Tokyo), he had written his most famous haiku, about a frog jumping into an old pond."}),
 "The great Russian novels","Things Fall Apart","Magical realism in Colombia",
 ["The Nobel map",addMore("Per person, the record belongs to Saint Lucia: about 180,000 people and two winners, the poet Derek Walcott (literature, 1992) and the economist Arthur Lewis (1979).")],
 ["Now explore",e({body:"Where was your favourite book written? Find it on the map. The Mapped books shelf follows famous journeys in books, the Learning tour follows printing and libraries, and the Philosophy tour visits the thinkers behind many of these stories."})]]};
PH["literature|Weeping at the campsite"]={set:true,pins:[[[58.6,22.0],"Arabian sands: Wahiba, Oman","@bedouin"]]};
PH["literature|Sagas by the fireside"]={set:true,pins:[[[-21.13,64.26],"Þingvellir: the Althing’s rift","Almannagjá rift at Þingvellir National Park.jpg"]]};
PH["literature|Bashō’s narrow road"]={set:true,pins:[[[139.8,35.68],"Bashō, with his frog haiku","@basho"]]};
CARD["literature|Weeping at the campsite"]="@bedouin";CARD["literature|Sagas by the fireside"]="Almannagjá rift at Þingvellir National Park.jpg";CARD["literature|Bashō’s narrow road"]="@basho";
TQ.literature={mid:[
 {at:"The Epic of Gilgamesh",st:"The Epic of Gilgamesh",q:"What was the Epic of Gilgamesh first written on?",o:["Papyrus","Clay tablets","Silk","Bamboo strips"],a:1,why:"In cuneiform, pressed into clay with a reed.",kc:"iq"},
 {at:"Sagas by the fireside",st:"Sagas by the fireside",q:"Why are Iceland’s sagas so full of lawsuits and feuds?",o:["Iceland had no king, and quarrels went to an open-air assembly","Its writers were all lawyers","They were copied from Roman law books","The church ordered it"],a:0,why:"Disputes were settled at the Althing at Þingvellir.",kc:"is"},
 {at:"Bashō’s narrow road",st:"Bashō’s narrow road",q:"What must every haiku traditionally contain?",o:["A rhyme","A season word","A place name","Seventeen different words"],a:1,why:"The kigo, from Japan’s sharply marked seasons.",kc:"jp"}],
 recap:[
 {q:"How does the classical Arabic ode, the qasida, usually begin?",o:["At a royal court","At an abandoned desert campsite","On a ship","In a garden"],a:1,why:"Bedouin tribes camped together for a season, then moved on.",st:"Weeping at the campsite",kc:"sa"},
 {q:"What does Don Quixote attack, thinking they are giants?",o:["Castles","Windmills","Trees","Ships"],a:1,why:"The windmills of La Mancha still stand.",st:"Don Quixote’s La Mancha",kc:"es"},
 {q:"Chinua Achebe, author of Things Fall Apart, came from which country?",o:["Ghana","Nigeria","Kenya","South Africa"],a:1,why:"He was an Igbo writer from Ogidi.",st:"Things Fall Apart",kc:"ng"}]};

/* ---------------------------------- Learning ---------------------------------- */
PLAN.learning={hint:"Alexandria, Nalanda, exams for an empire, the road of paper, al-Qarawiyyin, the first universities, Timbuktu, print and reading, undersea cables, school by radio, camel libraries and London’s Knowledge",
order:[
 ["Learning around the world",e({body:"This tour visits the places where people gathered to learn, from ancient libraries and the first universities to the routes that carried paper and printing. Then it shows how distance and terrain still shape learning today: lessons by radio across the outback, libraries on camels, and a city so tangled it changes its taxi drivers’ brains.",
  more:"Learning has always travelled. Monks crossed Asia to study, books were translated from Greek into Arabic and then into Latin, and today millions of students study in another country."})],
 "The Library of Alexandria","Nalanda","Exams for an empire",
 ["The road of paper",e({more:"Baghdad had paper mills by the 790s, so books there were far cheaper than parchment ones in Europe, and the caliphs paid scholars to translate Greek, Persian and Sanskrit works into Arabic; many Greek books survive only because of it. From Baghdad paper spread across the Islamic world to Spain, where Xàtiva had a paper mill by the 1100s, about 9,300 km from Luoyang as the crow flies (drag the ruler). Italian mills such as Fabriano’s, from the 1200s, added watermarks."})],
 "Al-Qarawiyyin","Bologna, Paris and Oxford","The manuscripts of Timbuktu",
 ["Printing spreads",e({title:"Print, Protestants and reading",
  stat:"Sweden’s church tested every household’s reading from the late 1600s, and by 1800 most Swedes could read",
  body:"Gutenberg’s press spread from Mainz along the trade routes, carried by printers who moved from town to town, and Venice became Europe’s printing capital. Luther’s ideas, printed in Wittenberg in 1517, crossed Germany within weeks, and reading the Bible yourself became a Protestant goal. Free schools paid for by governments in the 1800s and 1900s did the rest: in 1820 only about 12% of the world’s adults could read.",
  more:"In 1961 Cuba sent about 250,000 volunteers, many of them teenagers, into the countryside and taught over 700,000 adults to read in a year. Still, about 750 million adults cannot read, two-thirds of them women.",
  pins:[pt([12.34,45.43],"Venice, 1469"),pt([2.35,48.85],"Paris, 1470"),pt([-0.13,51.5],"Westminster, 1476"),pt([12.65,51.87],"Wittenberg, 1517"),pt([18.07,59.33],"Sweden: church reading tests")],
  view:[-30,34,30,64]}),"Print, Protestants and reading"],
 "Cables under the sea","School around the world",
 S({title:"School by radio",view:[109,-37,147,-11],globe:[134,-24,2.6],hi:["au"],
  ghosts:[{code:"gb",at:[142,-22],col:"#c62828",label:"United Kingdom"}],
  pins:[pt([133.88,-23.7],"Alice Springs: the teacher’s studio")],
  stat:"Alice Springs School of the Air teaches children spread over more than a million square kilometres of the outback",
  body:"Children on remote cattle stations can live hundreds of kilometres from the nearest school. From 1951 they had lessons by two-way radio, borrowing the Royal Flying Doctor Service’s radio network: a teacher in Alice Springs, pupils answering from kitchen tables across the desert. Today the lessons run over satellite internet.",
  more:"Parents or tutors supervise the work at home, and classmates meet in person only a few times a year. The red shape is the United Kingdom at the same scale: drag it around the outback to compare."}),
 S({title:"Libraries on camels",view:[30.5,-6,44.5,6],globe:[39.6,-0.4,4],hi:["ke"],gfClimate:{alpha:.45,box:[24,-12,52,12]},
  pins:[pt([39.65,-0.45],"Garissa"),pt([36.82,-1.29],"Nairobi")],
  stat:"In north-east Kenya the library comes to its readers on the back of a camel",
  body:"Around Garissa, in Kenya’s dry north-east (red and orange on the climate map laid over it), many families are herders who move with their animals to find grazing, so a library in one place would rarely be near them. Since 1996 Kenya’s national library service has loaded boxes of books onto camels, walked them out to the camps, set up a library under a tree and come back a couple of weeks later.",
  more:"Camels can cross sand and dry riverbeds where vans get stuck. In Colombia a teacher, Luis Soriano, did the same with two donkeys, Alfa and Beto: the ‘Biblioburro’."}),
 S({title:"The Knowledge",view:[-0.87,51.32,0.38,51.7],globe:[-0.12,51.5,40],hi:["gb"],
  gfRuler:{a:[-0.1246,51.5073],b:[0.015,51.5073]},
  pins:[pt([-0.1246,51.5073],"Charing Cross")],
  stat:"To drive a London black cab you must learn about 25,000 streets within six miles of Charing Cross, and it changes your brain",
  body:"London grew without a plan, as a tangle of old villages that merged, so there is no simple grid to learn. Would-be cabbies spend three or four years riding the streets on mopeds to learn ‘the Knowledge’, then are examined on routes from memory. In 2000 the neuroscientist Eleanor Maguire scanned their brains: the back of the hippocampus, a part used for finding your way, was bigger in taxi drivers, and bigger the longer they had driven.",
  more:"A later study followed trainees: those who passed grew more grey matter there; those who failed or gave up did not. A city laid out on a grid, like Manhattan, needs no such test. The ruler shows six miles, about 10 km, from Charing Cross."}),
 ["Now explore",e({body:"Turn on Connections to trace the undersea cables yourself, or open the History map and step through the years to watch empires, and their centres of learning, rise and fall. The Literature tour follows the books themselves, and the Inventions tour the internet."})]]};
PH["learning|Print, Protestants and reading"]={pins:[[[18.07,59.33],"Stockholm","@stockholm"]]};
PH["learning|School by radio"]={set:true,pins:[[[133.88,-23.7],"School of the Air, Alice Springs","@sota"]]};
PH["learning|The Knowledge"]={set:true,pins:[[[-0.13,51.51],"A London black cab","@cab"]]};
PH["learning|The road of paper"]={pins:[[[44.36,33.31],"Baghdad","@baghdad"]]};
CARD["learning|School by radio"]="@sota";CARD["learning|Print, Protestants and reading"]="Gutenberg Bible, Lenox Copy, New York Public Library, 2009. Pic 01.jpg";CARD["learning|The Knowledge"]="@cab";
TQ.learning={mid:[
 {at:"Al-Qarawiyyin",st:"Al-Qarawiyyin",q:"In which city did Fatima al-Fihri found al-Qarawiyyin in 859?",o:["Cairo","Tunis","Fez","Córdoba"],a:2,why:"It is often called the oldest university still working.",kc:"ma"},
 {at:"The manuscripts of Timbuktu",st:"The manuscripts of Timbuktu",q:"In 2012, Timbuktu’s manuscripts were smuggled to safety in…",o:["Dakar","Bamako","Niamey","Algiers"],a:1,why:"Some 350,000 went south to Mali’s capital.",kc:"ml"},
 {at:"School by radio",st:"School by radio",q:"How did outback children first take part in School of the Air lessons, from 1951?",o:["By post only","By two-way radio","By television","By flying to Alice Springs"],a:1,why:"They borrowed the Royal Flying Doctor Service’s radio network.",kc:"au"}],
 recap:[
 {q:"Which is the oldest university in the Western world?",o:["Oxford","Paris","Salamanca","Bologna"],a:3,why:"It is traditionally dated to 1088.",st:"Bologna, Paris and Oxford",kc:"it"},
 {q:"Where did paper first come from?",o:["Egypt","China","India","Persia"],a:1,why:"Cai Lun reported his method in 105 AD.",st:"The road of paper",kc:"cn"},
 {q:"What did scans show in London taxi drivers’ brains?",o:["A bigger part used for finding the way","Smaller memories","Faster reflexes","No difference"],a:0,why:"The back of the hippocampus was larger, the more so the longer they had driven.",st:"The Knowledge",kc:"gb"}]};

/* ---------------------------------- Music ---------------------------------- */
PLAN.music={order:[
 "Music of the world","The oldest instruments","The didgeridoo","The kora and the griots",
 S({title:"Drums that talk",view:[-9,3,11,15],globe:[4,8,3.6],hi:["ng"],hiSoft:["bj"],
  pins:[pt([3.93,7.85],"Oyo"),pt([3.9,7.38],"Ibadan")],
  stat:"A Yoruba talking drum can ‘speak’ whole phrases, because in Yoruba the pitch of a word changes its meaning",
  body:"Yoruba has three tones: the same syllable means different things said high, middle or low. The hourglass-shaped dùndún drum has leather cords down its sides; squeezing them under the arm tightens the drumskin and raises the pitch, so a drummer can copy the rise and fall of speech closely enough for listeners to recognise names, praise poems and messages.",
  more:"Drum languages grew up in tonal languages, which are common in West and Central Africa. A drum loses the consonants, so drummers add stock phrases to avoid mix-ups: in one Congolese drum language, ‘moon’ is drummed as ‘the moon looks down at the earth’."}),
 "Steelpan from Trinidad",
 ["Vienna, city of music",both(e({gfEmpire:{y:1783,gk:"ah",name:"Habsburg lands"}}),addMore("Vienna also stood where the Danube trade route met the roads from Germany, Hungary, Bohemia and Italy, and its music borrowed dances and tunes from all of them, from the country Ländler to Hungarian ‘gypsy’ tunes."))],
 ["Down the Mississippi: blues and jazz",addMore("Up in the Appalachian mountains, valleys cut off by steep slopes and poor roads kept old English and Scottish ballads that had died out in England; the song collector Cecil Sharp wrote down hundreds there in 1916–18. Mixed with the African-American banjo, they grew into old-time, bluegrass and country music.")],
 "Tango in Buenos Aires","Samba and bossa nova","Reggae in Kingston","Flamenco",
 S({title:"Singing two notes at once",view:[78,45,104,57],globe:[95,51,3.4],hiSoft:["mn"],
  pins:[pt([94.45,51.72],"Kyzyl, capital of Tuva")],
  stat:"Tuvan throat singers can sing a low drone and a high, whistling melody at the same time, with one voice",
  body:"Every note the voice makes holds fainter, higher notes inside it, called overtones. Herders on the open grasslands and mountains of Tuva, north of Mongolia, learned to shape the throat and mouth so that single overtones ring out like a whistle above the drone. Singers say the style began by copying the landscape: wind, rivers, birdsong and the beat of a horse’s hooves, carried across the empty steppe.",
  more:"The physicist Richard Feynman spent years trying to get permission to visit Tuva, then part of the Soviet Union; the invitation arrived just after he died in 1988. Mongolian throat singing, khöömei, is on UNESCO’s list of living heritage."}),
 "India: sitar and film songs","Gamelan","Afrobeats from Lagos","K-pop","Now explore"]};
PH["music|Drums that talk"]={set:true,pins:[[[3.93,7.85],"Dùndún talking drums","@dundun"]]};
PH["music|Singing two notes at once"]={set:true,pins:[[[94.45,51.72],"Tyva Kyzy, throat singers from Tuva","@tuva"]]};
CARD["music|Drums that talk"]="@dundun";CARD["music|Singing two notes at once"]="@tuva";

/* ---------------------------------- Myths and legends ---------------------------------- */
PLAN.mythology={order:[
 "Myths and legends","Mount Olympus and Delphi",
 ["Troy",e({body:"Heinrich Schliemann began digging the mound of Hisarlik in 1871 and found nine cities built on top of one another. One that burned around 1200 BC may be the Troy of the legend, but which layer, if any, is Homer’s city is still argued over.",gfEmpire:{y:-1499,gk:"hit",name:"Hittites"}})],
 "Thera and Atlantis",["The flood",e({_rvNoEmp:1})],"Stories that remember the sea",
 S({title:"The word that saved an island",view:[89.5,0,99.5,7.5],globe:[96,3.5,4],hiSoft:["id"],
  gfRuler:{a:[95.85,3.32],b:[95.32,5.55]},
  pins:[pt([95.85,3.32],"Epicentre, 26 December 2004"),pt([95.32,5.55],"Banda Aceh")],
  stat:"In 2004 the tsunami reached Simeulue first, yet only a handful of its people died, thanks to one word",
  body:"After a deadly tsunami in 1907, islanders passed down one word, smong, in lullabies and stories: if the ground shakes hard and the sea draws back, run to the hills. When the great earthquake of 26 December 2004 struck just off the island, people ran uphill at once. Most counts give seven deaths on Simeulue; along the nearby coast of Sumatra, where no such story was told, tens of thousands died.",
  more:"The UN’s disaster agency now uses smong as an example of how local knowledge can save lives. It is proof of this tour’s opening idea: a story can carry the memory of a real event, and a warning, across generations. The ruler runs from the epicentre to Banda Aceh."}),
 "Uluru","Mount Kailash","Fire and ice in the Norse myths","Loch Ness","Stonehenge","Pele’s islands",
 S({title:"A war that made a lake",view:[-128,40.5,-118,46.5],globe:[-121.5,43.5,4.5],
  pins:[pt([-121.06,43.37],"Fort Rock Cave: sandals under the ash")],
  stat:"Klamath stories of a battle between two spirits may remember the eruption that made Crater Lake, about 7,700 years ago",
  body:"Mount Mazama, a volcano in the Cascades, blew out so much rock that its top collapsed, leaving a hole about 9 km across that slowly filled with rain and snow. It is now the deepest lake in the United States, about 594 m. Klamath stories tell of Llao, chief of the world below, fighting Skell, chief of the world above, hurling fire from the mountain until Llao’s mountain fell in on him.",
  more:"People certainly saw it: sagebrush sandals found in Fort Rock Cave, about 100 km away, lay under the eruption’s ash. If the story does remember it, it is one of the oldest oral memories known, though stories change as they are retold."}),
 "Mount Fuji","Where the gods were born",
 S({title:"The river god and the dam",view:[21.3,-21,31.3,-13],globe:[28,-17,4],hi:["zm","zw"],on:["rivers"],
  pins:[pt([27.5,-17.2],"Lake Kariba")],
  stat:"When floods smashed the half-built Kariba Dam in 1957 and 1958, many Tonga people said the river god Nyami Nyami was angry",
  body:"The Tonga of the Zambezi valley believed Nyami Nyami, a serpent-like river spirit, lived in the gorge at Kariba. The dam would drown the valley, and about 57,000 Tonga were moved from their homes, many to poorer land. Then came huge floods, in 1957 and again in 1958, which swept away roads, bridges and parts of the works.",
  more:"The engineers finished the dam anyway, and the lake behind it filled over the following years. Nyami Nyami carvings, a snake with a fish’s head, are sold all along the Zambezi, and some people still blame tremors near the lake on him."}),
 "Now explore"]};
PH["mythology|A war that made a lake"]={set:true,pins:[[[-122.1,42.94],"Crater Lake and Wizard Island","@craterlake"]]};
PH["mythology|The river god and the dam"]={set:true,pins:[[[28.76,-16.52],"The Kariba Dam","KaribaDam.jpg"]]};
CARD["mythology|A war that made a lake"]="@craterlake";CARD["mythology|The river god and the dam"]="KaribaDam.jpg";

/* ---------------------------------- Science ---------------------------------- */
PLAN.science={order:[
 "Where science happened","Zhang Heng’s earthquake detector","Ibn al-Haytham and light","Ulugh Beg’s observatory","Galileo’s telescope",
 S({title:"A draper’s tiny animals",view:[-7,49.5,7,55.5],globe:[2.5,52,4.5],hi:["nl"],
  lines:[{coords:[[4.36,52.01],[2.5,51.8],[0.5,51.6],[-0.12,51.51]],kind:"dash"}],
  pins:[pt([-0.12,51.51],"London: the Royal Society")],
  stat:"The first person to see bacteria was a Delft cloth merchant, using the kind of lens drapers used to count threads",
  body:"Delft’s cloth trade used magnifying glasses to check how finely cloth was woven. Antonie van Leeuwenhoek, a draper, became obsessed with grinding ever tinier and stronger lenses, some magnifying over 200 times. In 1676 he wrote to the Royal Society in London that a drop of water was swarming with ‘animalcules’, living things far too small for anyone to have seen before.",
  more:"The Royal Society doubted him until Robert Hooke built a microscope good enough to see them too, in 1677. Leeuwenhoek was born in Delft in 1632, the same year and town as the painter Johannes Vermeer."}),
 "Greenwich and longitude","Darwin in the Galápagos","Humboldt on Chimborazo","Marie Curie","The eclipse that tested Einstein","Mapping the ocean floor",
 S({title:"The natural nuclear reactor",view:[0,-8,20,6],globe:[12,-1,3.5],hi:["ga"],
  pins:[pt([9.45,0.39],"Libreville")],
  stat:"About 2 billion years ago a natural nuclear reactor switched itself on underground in Gabon, and ran on and off for hundreds of thousands of years",
  body:"In 1972 French scientists noticed that uranium from the Oklo mine held slightly too little uranium-235, the kind that splits in a reactor. The reason: 2 billion years ago all uranium held much more U-235, about as much as reactor fuel today, and groundwater seeping through the ore slowed the neutrons down just as the water in a power station does. The ore ‘went critical’: a chain reaction started by itself.",
  more:"When the reaction heated up, the water boiled away and it stopped; when the rock cooled and water seeped back, it started again, roughly half an hour on and a few hours off. Today natural uranium holds too little U-235 for this to happen anywhere. Scientists study Oklo to see how nuclear waste moves through rock over very long times."}),
 ["CERN",e({more:"In 2012 CERN announced the discovery of the Higgs boson, predicted almost 50 years before. The ring is so big that it runs under farms and villages in both France and Switzerland, and CERN’s member countries share its cost."})],
 "Launching into space","Dark skies",
 S({title:"The curve from a volcano",view:[-161.5,17.5,-152.5,23.5],globe:[-157,20,5],hiSoft:["us"],
  pins:[pt([-155.47,19.82],"Maunakea")],
  stat:"Since 1958 carbon dioxide in the air has been measured on Mauna Loa: from about 315 parts per million then to over 420 now",
  body:"Charles David Keeling chose a site 3,400 m up a volcano in the middle of the Pacific, far from cities, forests and factories, so the air would show the average for the whole planet. His record, the Keeling Curve, climbs every year, and also wiggles: CO₂ falls each northern summer as the plants of the great northern continents grow, and rises again each winter. It is the Earth breathing.",
  more:"The Southern Hemisphere has much less land, so the northern seasons win. When Mauna Loa erupted in 2022 and lava cut the road and power line to the observatory, the measurements moved for a while to Maunakea next door. The Climate tour shows what the extra carbon dioxide is doing."}),
 "Now explore"]};
PH["science|A draper’s tiny animals"]={set:true,pins:[[[4.36,52.01],"Delft: Leeuwenhoek","@leeuwenhoek"]]};
PH["science|The natural nuclear reactor"]={set:true,pins:[[[13.16,-1.4],"Oklo: the fossil reactor","@oklo"]]};
PH["science|The curve from a volcano"]={set:true,pins:[[[-155.58,19.54],"Mauna Loa Observatory","@maunaloa"]]};
CARD["science|A draper’s tiny animals"]="@leeuwenhoek";CARD["science|The natural nuclear reactor"]="@oklo";CARD["science|The curve from a volcano"]="@maunaloa";
TQ.science={mid:[
 {at:"Ulugh Beg’s observatory",st:"Ulugh Beg’s observatory",q:"In which city did Ulugh Beg build his observatory?",o:["Baghdad","Samarkand","Isfahan","Delhi"],a:1,why:"In the 1420s, in today’s Uzbekistan.",kc:"uz"},
 {at:"Darwin in the Galápagos",st:"Darwin in the Galápagos",q:"The Galápagos Islands belong to which country?",o:["Peru","Chile","Ecuador","Colombia"],a:2,why:"They lie about 1,000 km off Ecuador’s coast.",kc:"ec"},
 {at:"The natural nuclear reactor",st:"The natural nuclear reactor",q:"What switched Oklo’s natural reactor on and off?",o:["Earthquakes","Groundwater seeping in and boiling away","Lightning","Volcanic heat"],a:1,why:"Water slowed the neutrons; when it boiled off, the reaction stopped.",kc:"ga"}],
 recap:[
 {q:"Marie Curie was born in which city?",o:["Paris","Vienna","Warsaw","Prague"],a:2,why:"She moved from Warsaw to Paris in 1891.",st:"Marie Curie",kc:"pl"},
 {q:"Why does the Keeling Curve dip every northern summer?",o:["Factories close for holidays","Plants on the big northern continents are growing","The ocean warms","Volcanoes rest"],a:1,why:"Most land, and so most plants, is in the Northern Hemisphere.",st:"The curve from a volcano",kc:"us"},
 {q:"Which observatory marks longitude 0°?",o:["Paris","Greenwich","Washington","Uppsala"],a:1,why:"It was chosen at a conference in 1884.",st:"Greenwich and longitude",kc:"gb"}]};

/* ---------------------------------- Maths ---------------------------------- */
const ZERO_LINES=[{coords:[[72.27,25],[66,26],[58,27],[50,30],[44.36,33.31]],kind:"flow"},{coords:[[44.36,33.31],[36,32],[30,31],[20,32],[10,34],[5.08,36.75]],kind:"flow"},{coords:[[5.08,36.75],[8,40],[10.4,43.72]],kind:"flow"}];
PLAN.maths={order:[
 "Maths","Counting in sixties",
 S({title:"The flood that invented geometry",view:[23,21,37,32.5],globe:[32,26,4],hi:["eg"],on:["rivers"],
  pins:[pt([32.64,25.7],"Thebes (Luxor)"),pt([31.2,30.05],"Memphis, near Cairo"),area([32.85,26.6],"The flood plain: fields re-measured every year")],
  stat:"‘Geometry’ means ‘earth-measuring’, and the Greek historian Herodotus said it began because the Nile kept washing field boundaries away",
  body:"Each summer the Nile flooded its valley and buried the fields under fresh mud, wiping out the markers between them. Farmers paid tax according to the size of their land, so royal surveyors, the ‘rope-stretchers’, measured the fields out again every year with knotted ropes. Working out the areas of oddly shaped plots, over and over, is where the Greeks believed geometry came from.",
  more:"The Rhind Papyrus, copied around 1550 BC and bought in Luxor in 1858, teaches how to find the areas of fields, triangles and circles; its rule for a circle works out at π ≈ 3.16. The Rivers tour shows how the flood made Egypt."}),
 "Euclid’s Alexandria","Eratosthenes measures the Earth","Zu Chongzhi and π","The Maya and zero",
 ["Zero travels west",e({title:"Zero and algebra go west",view:[-28,6,80,54],globe:[40,30,1.6],lines:ZERO_LINES,
  gfEmpire:{y:800,gk:"isl",name:"Abbasid Caliphate",at:[46,30]},
  pins:[pt([72.27,25],"Bhinmal: Brahmagupta, 628"),pt([5.08,36.75],"Béjaïa: Fibonacci learns the digits"),pt([60.62,41.38],"Khwarazm, al-Khwarizmi’s homeland")],
  stat:"The digits 0 to 9 were invented in India, and the words ‘algebra’ and ‘algorithm’ come from one man in Baghdad",
  body:"Indian mathematicians wrote any number with ten signs, the value of each set by its place, with zero holding empty places; in 628 Brahmagupta, at Bhinmal, wrote the first rules for sums with zero as a number. Scholars in Abbasid Baghdad took the digits up, and around 820 al-Khwarizmi wrote a book on solving equations by al-jabr, ‘restoring’, and another on the Indian digits, which in Latin turned his name into ‘Algoritmi’.",
  more:"Young Leonardo of Pisa, later called Fibonacci, learned the digits in Béjaïa, in today’s Algeria, where his father ran a trading post; his book Liber Abaci, 1202, spread them through Europe, where they were called ‘Arabic numerals’. A zero carved in 876 on a temple at Gwalior is one of the oldest in India still to be seen."}),"Zero and algebra go west"],
 "The Kerala school",
 S({title:"Tiles ahead of their time",view:[37,25,59,40],globe:[52,33,3],hi:["ir"],
  stat:"Tiles on a shrine built in Isfahan in 1453 follow a pattern Western mathematicians described only in the 1970s",
  body:"Islamic religious art avoids pictures of people, so craftsmen made ever more complicated geometric patterns. Using a set of five tile shapes, called girih tiles, they built patterns that never exactly repeat. In 2007 two physicists, Peter Lu and Paul Steinhardt, showed that the pattern on the Darb-i Imam shrine is very nearly a perfect ‘quasicrystal’ pattern, like the Penrose tilings Roger Penrose worked out in 1974.",
  more:"Real crystals with this kind of never-repeating order were found in a metal alloy in 1982 by Dan Shechtman, who won the 2011 Nobel Prize in Chemistry. Nobody knows whether the Isfahan craftsmen understood the maths or found it by eye and skill."}),
 "The bridges of Königsberg","The metre and the meridian",
 S({title:"Gauss’s giant triangle",view:[6.3,49.8,12.5,53],globe:[10.2,51.4,6],hi:["de"],
  lines:[{coords:[[10.6156,51.7991],[9.7716,51.4826],[10.4683,50.8517],[10.6156,51.7991]],kind:"dash"}],
  pins:[pt([10.6156,51.7991],"Brocken, 1,141 m"),pt([9.7716,51.4826],"Hoher Hagen"),pt([10.4683,50.8517],"Inselsberg")],
  stat:"To map the Kingdom of Hanover, Carl Friedrich Gauss measured a triangle between three hilltops, its longest side over 100 km",
  body:"In the 1820s Gauss surveyed Hanover by sighting from peak to peak, here the Brocken, the Hoher Hagen and the Inselsberg (dashed), flashing sunlight between them with a mirror device he invented, the heliotrope. Working out how to map a curved Earth, he proved that a surface’s curvature can be measured from inside it, without ever stepping off it.",
  more:"His ‘remarkable theorem’ (1827) is the deep reason no flat map can be right everywhere: see Mercator’s stretched map. A popular story says he used the big triangle to test whether space itself is curved; historians doubt it, but Einstein later built his theory of gravity on maths that grew from Gauss’s."}),
 "Great circles","Mercator’s stretched map","Antipodes","The coastline paradox","Now explore"]};
PH["maths|The flood that invented geometry"]={set:true,pins:[[[32.64,25.7],"The Rhind Papyrus, bought in Luxor","@rhind"]]};
PH["maths|Zero and algebra go west"]={set:true,pins:[[[78.17,26.23],"Gwalior: the temple where a zero was carved in 876","876 CE monolithic rock Chaturbhuj Hindu Temple Gwalior Fort, Zero Inscription 2.jpg"],
 [[44.36,33.31],"Baghdad: al-Khwarizmi’s algebra","Image-Al-Kitāb al-muḫtaṣar fī ḥisāb al-ğabr wa-l-muqābala.jpg"],[[10.4,43.72],"Pisa: Fibonacci","Liber abbaci magliab f124r.jpg"]]};
PH["maths|Tiles ahead of their time"]={set:true,pins:[[[51.68,32.66],"Darb-i Imam, Isfahan","@darbimam"]]};
PH["maths|Gauss’s giant triangle"]={set:true,pins:[[[9.94,51.53],"Gauss, in Göttingen","@gauss"]]};
CARD["maths|The flood that invented geometry"]="@rhind";CARD["maths|Tiles ahead of their time"]="@darbimam";CARD["maths|Gauss’s giant triangle"]="@gauss";
CARD["maths|Zero and algebra go west"]="Image-Al-Kitāb al-muḫtaṣar fī ḥisāb al-ğabr wa-l-muqābala.jpg";
TQ.maths={mid:[
 {at:"The flood that invented geometry",st:"The flood that invented geometry",q:"Why did Egypt’s surveyors have to measure the fields again every year?",o:["The Nile flood washed the boundary markers away","Farmers kept moving house","The pharaoh changed each year","Sand dunes buried them"],a:0,why:"Tax depended on the size of each field, so the plots were measured out after every flood.",kc:"eg"},
 {at:"Zero and algebra go west",st:"Zero and algebra go west",q:"The word ‘algorithm’ comes from the name of a scholar who worked in…",o:["Cairo","Damascus","Baghdad","Córdoba"],a:2,why:"Al-Khwarizmi, around 820; in Latin he became ‘Algoritmi’.",kc:"iq"},
 {at:"The bridges of Königsberg",st:"The bridges of Königsberg",q:"Königsberg, Euler’s city of seven bridges, is now called…",o:["Gdańsk","Kaliningrad","Vilnius","Riga"],a:1,why:"It has been Kaliningrad, in Russia, since 1946.",kc:"ru"}],
 recap:[
 {q:"Where were the digits 0 to 9 invented?",o:["Arabia","Greece","India","China"],a:2,why:"They reached Europe through Baghdad and North Africa.",st:"Zero and algebra go west",kc:"in"},
 {q:"Tiles on an Isfahan shrine of 1453 make a pattern that…",o:["Repeats every metre","Never exactly repeats","Spells a poem","Maps the stars"],a:1,why:"Almost a perfect quasicrystal pattern, described in the West only in the 1970s.",st:"Tiles ahead of their time",kc:"ir"},
 {q:"What is the antipode of Spain?",o:["Australia","New Zealand","Chile","South Africa"],a:1,why:"Madrid’s far side is on New Zealand’s North Island.",st:"Antipodes",kc:"nz"}]};

/* ---------------------------------- Words on the map ---------------------------------- */
PLAN.words={order:[
 "Words on the map","Tea or chá?","Borrowed words","England’s place-name layers","The -stans","Saints and rivers","How countries got their names",
 S({title:"Words named after places",view:[-27,27,45,57],globe:[15,42,2],
  lines:[{coords:[[18.22,47.6],[16.37,48.21],[11.5,48.5],[7,49],[2.35,48.86],[-0.13,51.5]],kind:"flow"}],
  pins:[pt([18.22,47.6],"Kocs → coach"),pt([4.36,43.84],"Nîmes → denim"),pt([8.93,44.41],"Genoa (Gênes) → jeans"),pt([43.13,36.34],"Mosul → muslin"),pt([22.93,37.94],"Corinth → currant"),pt([-5.81,35.77],"Tangier → tangerine"),pt([23.97,38.15],"Marathon")],
  stat:"The word ‘coach’ comes from Kocs, a Hungarian village whose light, fast carriages were famous in the 1400s",
  body:"The ‘cart of Kocs’, kocsi szekér, was copied across Europe, and its name travelled with it (arrow): Kutsche in German, coche in French, coach in English. Many everyday words hide a place name like this: denim is serge de Nîmes, cloth from Nîmes in France; jeans comes from Gênes, the French name for Genoa, whose sailors wore the cloth; muslin is named after Mosul in Iraq.",
  more:"Currants are from Corinth, tangerines from Tangier and the marathon from the plain of Marathon in Greece. The bikini took its name from Bikini Atoll in the Pacific, where nuclear bombs were tested in 1946. It is the reverse of the stop before: here things are named after places."}),
 "Writing begins","Alphabets and scripts","Hangul: an alphabet by design","The mountain of languages",
 S({title:"A language you whistle",view:[-18.6,27.75,-16.7,28.45],globe:[-17.24,28.1,30],hiSoft:["es"],
  pins:[pt([-17.11,28.09],"San Sebastián de La Gomera")],
  stat:"On La Gomera people can ‘speak’ Spanish by whistling, and be understood across valleys several kilometres wide",
  body:"La Gomera is a round volcanic island cut by deep ravines, called barrancos. Walking to the next farm could take hours, and a shout does not carry far, but a whistle does. So shepherds turned spoken Spanish into whistles, Silbo Gomero, keeping the rise and fall of its vowels and consonants, and sent messages from ridge to ridge.",
  more:"When roads and phones arrived it nearly died out, so since 1999 every schoolchild on the island has learned it, and UNESCO listed it in 2009. Whistled languages turn up in other steep or forested places too, such as the mountains of north-east Turkey and the Pyrenees."}),
 ["Papua New Guinea: 840 languages",e({body:"Steep valleys, tropical crops that grow all year round and little need to trade far for food let each small group feed itself and live on its own for thousands of years, so languages split apart and stayed apart. Its 10 million or so people live in forested valleys and on hundreds of islands, and neighbouring valleys can speak languages as different as English and Japanese.",
  more:"Many people also speak Tok Pisin, an English-based creole, to talk across language lines. Across the world, language diversity is highest in the tropics, where long growing seasons let small groups be self-sufficient. Vanuatu, with about 300,000 people, has over 100 languages: the most per person on Earth."})],
 "Endangered and revived","Esperanto","Now explore"]};
PH["words|A language you whistle"]={set:true,pins:[[[-17.25,28.12],"La Gomera’s ravines","@gomera"]]};
CARD["words|A language you whistle"]="@gomera";
TQ.words={mid:[
 {at:"Tea or chá?",st:"Tea or chá?",q:"Languages that say ‘te’ for tea mostly got it…",o:["Overland on the Silk Roads","By sea from Fujian","From India","From Japan"],a:1,why:"Dutch traders carried the Min Chinese word ‘te’ by sea.",kc:"nl"},
 {at:"Words named after places",st:"Words named after places",q:"The English word ‘coach’ comes from…",o:["A Hungarian village","A French king","A Latin word for wheel","A German city"],a:0,why:"Kocs, whose fast carriages were famous in the 1400s.",kc:"hu"},
 {at:"A language you whistle",st:"A language you whistle",q:"Why did shepherds on La Gomera start whistling Spanish?",o:["To call their sheep","Deep ravines made walking slow and shouts did not carry","Speaking was banned","To scare birds"],a:1,why:"A whistle carries across valleys several kilometres wide.",kc:"es"}],
 recap:[
 {q:"Which country is named after the equator?",o:["Colombia","Ecuador","Peru","Gabon"],a:1,why:"Ecuador is Spanish for ‘equator’.",st:"How countries got their names",kc:"ec"},
 {q:"Which country has the most languages, about 840?",o:["India","Nigeria","Indonesia","Papua New Guinea"],a:3,why:"Its valleys and islands let small groups live apart.",st:"Papua New Guinea: 840 languages",kc:"pg"},
 {q:"Which king created the Korean alphabet, Hangul?",o:["Sejong","Taejo","Gwanggaeto","Jeongjo"],a:0,why:"King Sejong made it in 1443 and proclaimed it in 1446.",st:"Hangul: an alphabet by design",kc:"kr"}]};

/* photos named by key (@name) in the stops above: the files in GF_RVI_PHOTOS or the shared library */
const F={"nashtifan": "Nashtifan Asbaad.jpg", "laxton": "Farm Strips Honeyhall and Hall Floor Off Acre Edge Road, Laxton - geograph.org.uk - 4245914.jpg", "jingdezhen": "Yuan Underglaze Blue Jingdezhen Porcelain.jpg", "rubber": "Castilla elastica Bark Scar.jpg", "titian": "Portrait of Pope Paul III with Camauro (by Titian) - National Museum of Capodimonte.jpg", "sota": "Alice Springs Australia.jpg", "lapis": "Lapis Lazuli from Afghanistan.jpg", "virgin": "Sassoferrato - Jungfrun i bön.jpg", "horyuji": "Horyuji June 2019.jpg", "papunya": "Haasts Bluff, NT photographed in 2011. 02.JPG", "dundun": "Talking drum from western part of Nigeria, West Africa.jpg", "oklo": "Gabon Geology Oklo.svg", "craterlake": "Crater lake oregon.jpg", "leeuwenhoek": "Jan Verkolje - Antonie van Leeuwenhoek.jpg", "rhind": "Rhind Mathematical Papyrus.jpg", "gauss": "Carl Friedrich Gauss 1840 by Jensen.jpg", "cab": "A typical London taxi in Earl's Court, 2024.jpg", "basho": "Basho by Kinkoku c1820.jpg", "darbimam": "Darb-i Imam shrine spandrel.JPG", "tuva": "Yurtakonsert med Tyva Kyzy (41573199210).jpg", "gomera": "Barranco de Arure, La Gomera.jpg", "lascaux": "Lascaux painting.jpg", "giza": "All Gizah Pyramids.jpg", "acropolis": "Parthenon from west.jpg", "agra": "Taj Mahal, Agra, India edit2.jpg", "sagrada": "Simetría na Sagrada Familia. Barcelona B30.jpg", "burj": "Burj Khalifa (16260269606).jpg", "stockholm": "Stockholms stadshus February 2026 02.jpg", "baghdad": "Sunset in Baghdad, Iraq.jpg", "bedouin": "Camels in Wahiba Sands 03.jpg", "maunaloa": "Mauna Loa.jpg"};
const file=f=>f&&f[0]==="@"?F[f.slice(1)]:f;

/* ======================================================================================================
   engine
   ====================================================================================================== */
const IDS=Object.keys(PLAN),NEWT=new Set(),CACHE={};
IDS.forEach(id=>{CACHE[id]=new Map();PLAN[id].order.forEach(x=>{if(x&&typeof x==="object"&&!Array.isArray(x))NEWT.add(id+"|"+x.title)})});
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
function build(id){const T=PS_TOURS[id];if(!T||!T.steps||T.steps._rvIdeas)return false;
 const cur=new Map(T.steps.map(s=>[strip(s.title),s]));const C=CACHE[id];const out=[];
 PLAN[id].order.forEach(x=>{try{let s=null;
  if(typeof x==="string")s=cur.get(x)||C.get(x);
  else if(Array.isArray(x)){const [from,fn,to]=x;s=cur.get(from)||(to&&cur.get(to))||C.get(to||from);
   if(s&&fn&&!s._rvE){fn(s);s._rvE=1}}
  else s=x;
  if(!s){console.warn("review-ideas: no stop",id,x);return}
  C.set(strip(s.title),s);if(Array.isArray(x)&&x[2])C.set(x[0],s);out.push(s)}catch(err){console.error("review-ideas",id,err)}});
 if(out.length<5)return false;
 for(const k in T.steps)if(/^_/.test(k))try{out[k]=T.steps[k]}catch(err){}
 out._rvIdeas=1;out._gfHist=1;T.steps=out;
 if(PLAN[id].hint)T.hint=PLAN[id].hint;return true}
function relief(id){const T=PS_TOURS[id];if(!T||!T.steps)return;T.steps.forEach(toRelief);
 try{if(T.map&&T.map.mode==="history")T.map=Object.assign({},T.map,{mode:"relief"})}catch(err){}
 const modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];T.stopModes=modes.length>0;T.alsoOn=modes}
/* photo pins carry their own picture (_gfImg); the label is registered in PS_SQ_IMG so the shared pruning keeps it */
function pins(id){const T=PS_TOURS[id];if(!T||!T.steps)return;
 T.steps.forEach(s=>{const k=id+"|"+strip(s.title),P=PH[k];if(!P||s._rvPh)return;
  const add=[];let ok=true;P.pins.forEach(([at,label,f])=>{const i=libIdx(file(f));if(i<0){ok=false;return}
   window.PS_SQ_IMG=window.PS_SQ_IMG||{};if(PS_SQ_IMG[label]==null)PS_SQ_IMG[label]=i;add.push({at,label,col:OR,icon:"photo",_gfImg:i,img:i})});
  if(!ok&&typeof PS_PHOTO_DATA==="undefined")return;
  const labs=new Set(add.map(q=>strip(q.label)));
  const keep=P.set?[]:(s.phPins||[]).filter(q=>q&&!labs.has(strip(q.label))).map(q=>Object.assign({},q));
  const arr=keep.concat(add);s._rvPh=1;lock(s,"phPins",arr);s._sqPruned=-1;
  /* a text pin naming the same place as a new photo pin gives way to it */
  if(Array.isArray(s.pins)){const np=s.pins.filter(p=>!labs.has(strip(Array.isArray(p)?p[1]:p&&p.text)));if(np.length!==s.pins.length)def(s,"pins",np)}})}
function regPins(St){try{(St&&St.phPins||[]).forEach(q=>{if(q&&q._gfImg!=null){window.PS_SQ_IMG=window.PS_SQ_IMG||{};if(PS_SQ_IMG[q.label]==null)PS_SQ_IMG[q.label]=q._gfImg}})}catch(err){}}
function cards(){try{if(typeof PS_PHOTO==="undefined")return;for(const k in CARD){const i=libIdx(file(CARD[k]));if(i>=0)PS_PHOTO[k]=i}}catch(err){}}
function quiz(){try{if(typeof TOURQ==="undefined")return;for(const id in TQ)TOURQ[id]=TQ[id]}catch(err){}}
function run(){try{mergePh();IDS.forEach(id=>{try{build(id);relief(id);pins(id)}catch(err){console.error("review-ideas",id,err)}});cards();quiz()}catch(err){console.error("review-ideas",err)}}
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St){const k=ps.tour+"|"+strip(St.title);if(CARD[k]){const i=libIdx(file(CARD[k]));if(i>=0)return PS_PHOTO_DATA[i]}}}catch(err){}return _pf.apply(this,arguments)}}
if(typeof psLaunchTour==="function"){const _l=psLaunchTour;psLaunchTour=function(id){try{if(IDS.includes(id))run()}catch(err){}return _l.apply(this,arguments)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine()){const St=psSteps()[i];toRelief(St);regPins(St)}}catch(err){}return _g.apply(this,arguments)}}
run();addEventListener("load",()=>setTimeout(run,1500));[1500,5000,12000,16000].forEach(ms=>setTimeout(run,ms));
window.gfReviewIdeas={PLAN,PH,CARD,run};
})();
