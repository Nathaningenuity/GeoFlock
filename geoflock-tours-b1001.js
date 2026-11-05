/* GeoFlock: a Mapped books tour.
   b1001  "One Thousand and One Nights"   anonymous, collected over centuries; Antoine Galland’s French version, 1704–1717
   Each stop puts the tales’ real and imagined places on the map: Harun al-Rashid’s Baghdad, Sindbad’s sea road from Basra
   to Serendib and China, Mamluk Cairo, Damascus, Samarkand, and the road the stories themselves took to Paris. The tales
   are summarised in our own words; where the stories depart from history, or scholars disagree about their origins, the
   card says so in a line. No book covers or long quotes.
   The tour runs on the Relief map: Baghdad’s stop lays the states of 800 over it (gfHistYear, geoflock-booktours-relief.js;
   not mode:"history", which would turn the whole tour into a History-map tour, geoflock-tourhist.js); others lay one
   empire over it (gfEmpire, geoflock-tourover.js); per-stop layers (on:[…]), the ruler
   (gfRuler) and travellers along the stops' flow lines (window.gfWalkers, geoflock-walkers.js): Sindbad's ship and the
   tales on their way west.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_B1001_PHOTOS.
   WANT_PHOTOS: [
    ["Alf Layla wa-Layla manuscript fragment.jpg","Where the tales came from"],
    ["Antoine Galland.jpg","Galland’s Nights, 1704"],
    ["Sri Pada (Adam's Peak).jpg","Serendib"],
    ["Aepyornis maximus egg.jpg","The Roc and the valley of diamonds"],
    ["Bab Zuweila Cairo.jpg","Mamluk Cairo"],
    ["Belitung shipwreck ceramics.jpg","Sindbad’s sea road"]]
   (Commons names not checked: Wikimedia was rate-limiting.) */
window.GF_B1001_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={b1001:"#a0603c"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* =====================================================================================================
   One Thousand and One Nights
   ===================================================================================================== */
const NIGHTS=[
S({title:"One Thousand and One Nights",view:[-20,-25,125,55],globe:[55,25,1.3],
 phPins:[ph([44.38,33.35],"The Tigris at Baghdad"),ph([31.26,30.05],"Al-Azhar Mosque, Cairo"),ph([36.31,33.51],"The Umayyad Mosque, Damascus"),ph([66.98,39.65],"The Registan, Samarkand"),ph([80.76,7.96],"Sigiriya, Sri Lanka"),ph([37.16,36.2],"The Citadel of Aleppo"),ph([39.2,-6.16],"A dhow off Zanzibar")],
 stat:"A storyteller saves her own life by telling a king a new tale every night, and never quite finishing it",
 body:"The Nights are not one book but a river of stories, gathered over some 800 years from India, Persia, Iraq, Syria and Egypt. Their settings spread from Baghdad and Cairo to Samarkand, Sri Lanka and a dreamlike China. This tour maps the tales, and the road they took to the rest of the world.",
 more:"‘A thousand and one’ simply means ‘countless’: most old Arabic manuscripts have far fewer nights. Many of the best-known stories, such as Aladdin, were added only when the tales reached Europe."}),
S({title:"Shahrazad’s frame",view:[30,15,95,50],globe:[60,33,2],card:"left",gfEmpire:{y:600,gk:"per",name:"Sasanian Persia",at:[56,33]},
 lines:[{coords:[[44.58,33.09],[51.4,35.7],[58,37],[62.19,37.66],[66.97,39.65]],kind:"flow"}],
 pins:[[[44.58,33.09],"Ctesiphon: a Sasanian capital","point"],[[66.97,39.65],"Samarkand: Shahzaman’s kingdom","point"]],
 iconPins:[ic([44.58,33.09],"castle"),ic([66.97,39.65],"castle")],
 phPins:[ph([66.98,39.65],"The Registan, Samarkand")],
 stat:"The frame story is set in Sasanian Persia: King Shahriyar rules from the west, his brother Shahzaman from Samarkand",
 body:"Betrayed by their wives, the brothers lose faith in women, and Shahriyar marries a new bride each night and has her killed at dawn. Shahrazad, the vizier’s clever daughter, volunteers, and each night leaves her story at its most exciting moment. The map shows the Sasanian empire around AD 600; the arrow joins the two brothers’ kingdoms.",
 more:"The tales are vague about where Shahriyar’s capital was. The Registan pictured was built in the 1400s–1600s, long after the frame story is set: Samarkand was already an old Silk Road city."}),
S({title:"Where the tales came from",view:[25,5,95,45],globe:[60,25,1.6],card:"left",
 lines:[{coords:[[80,22],[70,27],[58,30],[51.4,35.5]],kind:"flow"},{coords:[[51.4,35.5],[47,34],[44.38,33.35]],kind:"flow"},{coords:[[44.38,33.35],[38,34.5],[36.31,33.51],[33,31.5],[31.24,30.04]],kind:"flow"}],
 pins:[[[80,22],"India: stories inside stories","point"],[[51.4,35.5],"Persia: the ‘Thousand Tales’","point"],[[44.38,33.35],"Baghdad: Arabic, 800s","point"],[[31.24,30.04],"Cairo: the last layer, 1300s–1500s","point"]],
 iconPins:[ic([80,22],"book"),ic([51.4,35.5],"book"),ic([44.38,33.35],"book"),ic([31.24,30.04],"book")],
 phPins:[ph([83.01,25.31],"The Ganges at Varanasi"),ph([51.68,32.66],"The Great Mosque of Isfahan")],
 stat:"The oldest scrap of the Nights, a page with its title, was written in the 800s and found in Egypt",
 body:"Scholars trace the collection in layers (the arrows). The idea of tales nested inside a frame tale is Indian. A Persian book called the Hazār Afsān, the ‘Thousand Tales’, now lost, gave the frame. In Baghdad it was translated into Arabic, and storytellers in Baghdad, Damascus and Cairo kept adding stories for centuries.",
 more:"Writers in 10th-century Baghdad, al-Masudi and Ibn al-Nadim, mention the book and its Persian origin. Scholars still argue about how much of today’s collection goes back that far."}),
S({title:"Harun al-Rashid’s Baghdad",view:[30,24,60,40],globe:[44,33,3],card:"left",gfHistYear:{y:800,focus:"isl",labels:[{gk:"isl",name:"Abbasid Caliphate",at:[53,33]}]},on:["rivers"],
 lines:[{circle:[44.38,33.35],km:60,kind:"circle"}],
 pins:[[[44.38,33.35],"Baghdad: the Round City, 762","point"],[[43.87,34.2],"Samarra","point"],[[47.81,30.51],"Basra","point"],[[44.58,33.09],"Ctesiphon’s ruins","point"]],
 iconPins:[ic([44.38,33.35],"dome")],
 phPins:[ph([44.38,33.35],"The Tigris at Baghdad")],
 stat:"Around AD 800 Baghdad may have been the biggest city in the world, capital of the Abbasid caliphs",
 body:"The shading shows the world in 800, with the Abbasid Caliphate. Its caliph, Harun al-Rashid (ruled 786–809), is the hero of many tales: he slips out at night in disguise with his vizier Jafar and his executioner Masrur to see how his people really live. Caliph al-Mansur had founded the city in 762 as a perfect circle on the Tigris.",
 more:"The real Harun was a powerful, sometimes ruthless ruler: in 803 he had Jafar, of the Barmakid family, executed. The tales turned him into a wise, generous king of a golden age. He also sent an elephant to Charlemagne."}),
S({title:"Basra: Sindbad sets out",view:[40,20,64,34],globe:[50,27,3.5],card:"left",hi:["iq","kw"],gfRuler:{a:[44.38,33.35],b:[47.81,30.51]},
 lines:[{coords:[[44.38,33.35],[45.5,32.4],[46.8,31.2],[47.81,30.51]],kind:"flow"},{coords:[[47.81,30.51],[49.5,29],[52.34,27.67],[56.3,26.6],[58.59,23.61]],kind:"flow"}],
 pins:[[[47.81,30.51],"Basra","point"],[[52.34,27.67],"Siraf","point"],[[56.75,24.36],"Sohar","point"],[[58.59,23.61],"Muscat","point"]],
 iconPins:[ic([47.81,30.51],"ship")],
 phPins:[ph([50.2,26.3],"Pearl divers in the Gulf"),ph([58.59,23.61],"Old Muscat")],
 stat:"Each of Sindbad’s seven voyages begins the same way: he leaves Baghdad, sails down to Basra and boards a ship",
 body:"Sindbad is a Baghdad merchant who grows rich, gets bored and goes to sea again. The real route ran down the Tigris to Basra (drag the ruler), then along the Gulf past ports like Siraf and Sohar (the arrows). In the 800s, ships from here really did sail all the way to China.",
 more:"The Sindbad stories were once a separate book; Galland added them to his Nights from another manuscript. A sailor is telling them, in the frame, to a poor porter who shares his name: Sindbad the Porter."}),
S({title:"Sindbad’s sea road",view:[40,-14,125,34],globe:[85,10,1.5],card:"left",
 lines:[{coords:[[58.59,23.61],[66,22],[72.5,17],[75.78,11.25],[76.6,8.89],[80.2,6.0],[88,6],[95.3,5.6],[100.4,5.7],[103.5,2.2],[106,5],[108,12],[110,18],[113.26,23.13]],kind:"flow"}],
 pins:[[[76.6,8.89],"Quilon: pepper","point"],[[100.4,5.7],"Kalah (Kedah)","point"],[[107.6,-2.75],"Belitung wreck, about 830","point"],[[113.26,23.13],"Khanfu (Guangzhou)","point"]],
 iconPins:[ic([107.6,-2.75],"ship"),ic([76.6,8.89],"spice")],
 phPins:[ph([101,2.8],"Ships in the Strait of Malacca"),ph([113.32,23.11],"Guangzhou today")],
 stat:"In the 800s Arab and Persian ships sailed a 9,000 km sea road from the Gulf to China",
 body:"Follow the ship along the monsoon route: India’s pepper coast, Sri Lanka, the Strait of Malacca and Guangzhou, which Arab sailors called Khanfu. Sindbad’s voyages are wild fantasy, but they are wrapped around real places that sailors of the time knew. A merchant’s book of 851 describes this very route.",
 more:"In 1998 divers found an Arab-style ship that sank off the Indonesian island of Belitung around 830, carrying some 60,000 pieces of Chinese pottery: the real cargo of Sindbad’s world."}),
S({title:"The Roc and the valley of diamonds",view:[25,-30,95,28],globe:[60,0,1.6],card:"left",hi:["mg"],
 lines:[{coords:[[47.81,30.51],[58,20],[60,5],[52,-10],[46.9,-19]],kind:"dash"}],
 pins:[[[46.9,-19],"Madagascar: Marco Polo’s Roc","point"],[[80.1,16.7],"The Krishna valley: India’s old diamond mines","point"],[[78.4,17.38],"Golconda","point"]],
 iconPins:[ic([80.1,16.7],"gem"),ic([46.9,-19],"paw")],
 phPins:[ph([44.42,-20.25],"Baobabs on Madagascar"),ph([78.47,17.36],"Hyderabad, near Golconda")],
 stat:"On his second voyage Sindbad ties himself to the foot of a Roc, a bird big enough to carry off elephants",
 body:"The Roc drops him in a valley of diamonds guarded by snakes. He escapes by tying himself to a lump of meat that merchants throw in for eagles to fetch. The tale of the diamond valley was told long before, and later placed in southern India, the world’s main source of diamonds until the 1700s.",
 more:"Marco Polo said the Roc lived near Madagascar. Some writers guess that Madagascar’s elephant birds, some 3 m tall, with eggs bigger than a football, inspired the legend. They died out about a thousand years ago; nobody can prove the link."}),
S({title:"Serendib",view:[70,0,90,14],globe:[80.6,7.6,5],card:"left",hi:["lk"],
 pins:[[[80.5,6.81],"Adam’s Peak","point"],[[80.4,6.68],"Ratnapura: the city of gems","point"],[[80.64,7.29],"Kandy","point"],[[79.87,6.93],"Colombo","point"]],
 iconPins:[ic([80.5,6.81],"mountain"),ic([80.4,6.68],"gem")],
 phPins:[ph([80.64,7.29],"The Temple of the Tooth, Kandy"),ph([80.22,6.03],"Galle Fort")],
 stat:"Serendib, the Arabic name for Sri Lanka, is where Sindbad finds rubies, a just king and the mountain where Adam fell to earth",
 body:"On his sixth voyage Sindbad is shipwrecked, floats on a raft through a cave and reaches Serendib, whose king sends him home with gifts for Harun al-Rashid. The island really was famous for its gems, and Muslim pilgrims climbed Adam’s Peak to see a footprint in the rock said to be Adam’s.",
 more:"Buddhists see the footprint as the Buddha’s and Hindus as Shiva’s. Serendib also gave English a word: in 1754 Horace Walpole coined ‘serendipity’ from a Persian tale about three princes of Serendip."}),
S({title:"Camphor, cloves and nutmeg",view:[70,-14,140,14],globe:[110,0,1.8],card:"left",hi:["id"],
 lines:[{coords:[[129.9,-4.53],[122,-5.5],[112,-6.5],[105.5,-4],[103.5,1.2]],kind:"flow"},{coords:[[127.38,0.79],[122,2.5],[110,2],[103.5,1.2]],kind:"flow"},{coords:[[98.4,2.0],[96,4.5],[88,6],[80.2,6.0]],kind:"flow"}],
 pins:[[[98.4,2.0],"Fansur (Barus): camphor","point"],[[127.38,0.79],"Ternate: cloves","point"],[[129.9,-4.53],"Banda: nutmeg","point"]],
 iconPins:[ic([98.4,2.0],"tree"),ic([127.38,0.79],"spice"),ic([129.9,-4.53],"spice")],
 phPins:[ph([129.9,-4.53],"Nutmeg"),ph([76.27,9.93],"Pepper on the vine")],
 stat:"Cloves and nutmeg grew only on a few tiny islands in eastern Indonesia, yet they reached Baghdad’s kitchens",
 body:"Sindbad trades in camphor, cloves, pepper and aloes wood, and on one voyage he watches men tap camphor trees on a great island. The real camphor came from Fansur, on Sumatra’s west coast; cloves from the northern Moluccas and nutmeg from the Banda Islands. Malay and Javanese ships carried them west to meet the Arab traders (the arrows).",
 more:"Few people in Baghdad had any idea where these spices grew, which kept prices high and the stories wild. Six hundred years later, Portuguese and Dutch fleets fought wars to control these same islands."}),
S({title:"Aladdin’s China",view:[60,10,140,50],globe:[105,32,1.6],card:"left",gfEmpire:{y:800,gk:"chn",name:"Tang China",at:[108,33]},
 pins:[[[113.26,23.13],"Guangzhou: Arab merchants’ quarter","point"],[[108.94,34.26],"Chang’an, the Tang capital","point"]],
 iconPins:[ic([113.26,23.13],"bulb")],
 phPins:[ph([113.32,23.11],"Guangzhou today")],
 stat:"Aladdin, a poor boy who finds a magic lamp, lives ‘in a city of China’, but his world feels like Cairo or Damascus",
 body:"China was the edge of the known world for the storytellers, a name for somewhere unimaginably far away. Aladdin’s China has a sultan, a vizier, mosques and bazaars. The real Tang China (shaded, around AD 800) did have thousands of Arab and Persian merchants living in Guangzhou.",
 more:"Aladdin is not in any known Arabic manuscript of the Nights older than Galland. He heard it in Paris in 1709 from a young Syrian, Hanna Diyab: see the stop on Galland. In 878 a rebel army sacked Guangzhou and killed many foreign merchants, and the trade moved south to Malaya."}),
S({title:"Mamluk Cairo",view:[20,20,48,38],globe:[31.3,30,4],card:"left",gfEmpire:{y:1400,gk:"maml",name:"Mamluk Sultanate",at:[34,25.5]},on:["rivers"],
 pins:[[[31.26,30.05],"Old Cairo: Bab Zuwayla and the bazaars","point"],[[31.23,30.06],"Bulaq: first printed Arabic edition, 1835","point"],[[29.92,31.2],"Alexandria","point"]],
 iconPins:[ic([31.26,30.05],"dome")],
 phPins:[ph([31.26,30.05],"Al-Azhar Mosque, Cairo")],
 stat:"Many tales were written down in Cairo under the Mamluk sultans, between the 1300s and 1500s",
 body:"The shaded empire is the Mamluk Sultanate around 1400. Tales like ‘The Hunchback’ wander through Cairo’s real streets, markets and gates. Though they are set in Harun’s Baghdad, they are full of the coins, foods and officials of Mamluk Cairo: storytellers dressed old tales in the city around them.",
 more:"The first Arabic edition printed in the Arab world came from the government press at Bulaq, in Cairo, in 1835. It became the standard text for readers in the Middle East."}),
S({title:"Damascus",view:[30,28,44,38],globe:[36.3,33.5,5],card:"left",hi:["sy"],
 pins:[[[36.31,33.51],"Damascus","point"],[[37.16,36.2],"Aleppo","point"],[[35.5,33.89],"Beirut","point"]],
 iconPins:[ic([36.31,33.51],"dome")],
 phPins:[ph([36.31,33.51],"The Umayyad Mosque, Damascus"),ph([36.31,33.5],"Old Damascus")],
 stat:"Damascus, with its gardens and rivers, is a city of lovers and merchants in the Nights",
 body:"In ‘Nur al-Din and Shams al-Din’, a young man from Basra wakes up, carried by spirits, outside a gate of Damascus. Other heroes flee there, trade there or fall in love there. The city’s great Umayyad Mosque, finished around 715, appears in the tales and still stands.",
 more:"The oldest large manuscript of the Nights, the one Galland used, was copied in Syria, probably in the 1400s. It holds 282 nights, nowhere near a thousand."}),
S({title:"The City of Brass",view:[-6,20,40,40],globe:[16,31,2.6],card:"left",
 lines:[{coords:[[36.31,33.51],[31.24,30.04],[20,31.5],[10.1,35.68]],kind:"flow"},{coords:[[10.1,35.68],[9.5,30.13],[6,27]],kind:"dash"}],
 pins:[[[36.31,33.51],"Damascus: the caliph’s order","point"],[[10.1,35.68],"Kairouan: Musa ibn Nusayr","point"],[[6,27],"The desert of the tale","point"]],
 iconPins:[ic([6,27],"tower")],
 phPins:[ph([10.1,35.68],"The Great Mosque of Kairouan"),ph([9.5,30.13],"Ghadames, in the Sahara")],
 stat:"A caliph in Damascus sends his governor of North Africa to find the brass jars in which Solomon trapped the jinn",
 body:"Musa ibn Nusayr crosses the desert and finds a city of brass, silent and perfect, its people dead in their palaces among their treasures. Musa and Abd al-Malik were real men: the Umayyad caliph in Damascus and his governor in North Africa, around AD 700. The deserted city and its warnings about the vanity of wealth are fiction.",
 more:"The arrows follow the governor’s real road west through Egypt to Kairouan; the dashed line leads into the imaginary desert of the tale."}),
S({title:"Galland’s Nights, 1704",view:[-34,27,42,57],globe:[18,42,2.2],card:"left",
 lines:[{coords:[[37.16,36.2],[35.5,33.89],[30,32],[20,35],[12,40],[5.37,43.3],[2.35,48.86]],kind:"flow"}],
 pins:[[[2.35,48.86],"Paris: Galland’s Nights, 1704–1717","point"],[[37.16,36.2],"Aleppo: Hanna Diyab’s home","point"],[[28.98,41.01],"Istanbul: Galland at the French embassy","point"]],
 iconPins:[ic([2.35,48.86],"book")],
 phPins:[ph([2.35,48.85],"Notre-Dame, Paris"),ph([28.97,41.01],"The Grand Bazaar, Istanbul")],
 stat:"Antoine Galland’s French Nights, published from 1704, brought the tales to Europe, and Europe could not get enough",
 body:"Galland, a French scholar who had lived in Istanbul, translated a Syrian manuscript and added stories from elsewhere. In 1709 he met Hanna Diyab, a young Maronite Christian from Aleppo who had travelled to Paris with a French collector (the arrow). Diyab told him Aladdin and Ali Baba, which Galland rewrote for his later volumes.",
 more:"For three centuries Diyab was almost forgotten. His own travel memoir, rediscovered in the Vatican Library, was published in English in 2021, and he is now often named as the first teller of Aladdin."}),
S({title:"The tales travel on",view:W,globe:[40,30,1],card:"left",
 lines:[{coords:[[2.35,48.86],[-0.12,51.5]],kind:"flow"},{coords:[[2.35,48.86],[13.4,52.52],[37.62,55.75]],kind:"flow"},{coords:[[-0.12,51.5],[-30,20],[0,-30],[60,-15],[88.36,22.57]],kind:"flow"},{coords:[[-0.12,51.5],[-74,40.7],[-118.24,34.05]],kind:"flow"}],
 pins:[[[-0.12,51.5],"London: English versions from 1706","point"],[[88.36,22.57],"Calcutta: Arabic edition, 1839–42","point"],[[31.23,30.06],"Bulaq, Cairo: 1835","point"],[[-118.24,34.05],"Hollywood: Aladdin, 1992","point"]],
 iconPins:[ic([-118.24,34.05],"music")],
 phPins:[ph([88.34,22.54],"Calcutta’s Victoria Memorial")],
 stat:"Within a few years of Galland, the Nights were being read in English, German and Russian; today they exist in almost every language",
 body:"Cheap English versions translated from Galland’s French appeared from 1706. Later translators, like Edward Lane and Richard Burton, worked from Arabic editions printed in Cairo and Calcutta. Films, ballets and cartoons followed: Sindbad, Ali Baba and Aladdin became world characters.",
 more:"The Nights shaped how Europeans imagined the Middle East, for good and ill: as a place of magic and luxury, but also of cruelty and idleness. Many writers in Arabic, from Naguib Mahfouz to today, have retold them in their own way."}),
S({title:"Now explore",view:[-20,-25,125,55],globe:[55,25,1.3],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch to the History map and set the year to 800 to see Harun al-Rashid’s caliphate, then to 1400 for Mamluk Cairo. Turn on Connections to see the sea lanes that still follow Sindbad’s road past Sri Lanka and Malacca. Then try Prisoners of Geography or Guns, Germs, and Steel."})];

const TOURS={
 b1001:{name:"One Thousand and One Nights",short:"The Arabian Nights",hint:"The Nights, on the map: Harun al-Rashid’s Baghdad, Sindbad’s voyages from Basra to Serendib and China, Mamluk Cairo, Damascus, and the road the tales took to Paris",steps:NIGHTS}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"800/isl") is set up as if the tour ran on that map */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- travellers along the stops’ flow lines (geoflock-walkers.js) ---------- */
const WALK={
 "b1001|Basra: Sindbad sets out":{emoji:"⛵",name:"Sindbad’s ship",size:26,per:1,float:1},
 "b1001|Sindbad’s sea road":{emoji:"⛵",name:"A ship bound for China",size:26,per:2,float:1},
 "b1001|Camphor, cloves and nutmeg":{emoji:"⛵",name:"Spice traders",size:24,per:1,float:1},
 "b1001|Where the tales came from":{emoji:"📜",name:"The tales on their way west",size:22,per:1},
 "b1001|The City of Brass":{emoji:"🐪",name:"Musa ibn Nusayr’s caravan",size:24,per:1},
 "b1001|Galland’s Nights, 1704":{emoji:"📜",name:"Hanna Diyab’s stories on their way to Paris",size:22,per:1},
 "b1001|The tales travel on":{emoji:"📖",name:"The Nights in translation",size:22,per:1}};
const addW=()=>{try{if(window.gfWalkers)for(const k in WALK)if(!gfWalkers[k])gfWalkers[k]=WALK[k]}catch(e){}};addW();addEventListener("load",addW);

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.b1001={mid:[
 {at:"Harun al-Rashid’s Baghdad",st:"Harun al-Rashid’s Baghdad",q:"Which caliph walks Baghdad’s streets in disguise in many of the tales?",o:["Al-Mansur","Harun al-Rashid","Saladin","Abd al-Malik"],a:1,why:"He ruled from 786 to 809.",kc:"iq"},
 {at:"Basra: Sindbad sets out",st:"Basra: Sindbad sets out",q:"From which port does Sindbad set sail on his voyages?",o:["Basra","Aden","Alexandria","Jeddah"],a:0,why:"He sails down the Tigris from Baghdad to Basra.",kc:"iq"},
 {at:"Serendib",st:"Serendib",q:"Serendib is an old Arabic name for which island?",o:["Madagascar","Sumatra","Sri Lanka","Zanzibar"],a:2,why:"It also gave English the word ‘serendipity’.",kc:"lk"}],
 recap:[
 {q:"In which city did Antoine Galland publish his French Nights, from 1704?",o:["Paris","London","Istanbul","Venice"],a:0,why:"Twelve volumes, 1704–1717.",st:"Galland’s Nights, 1704",kc:"fr"},
 {q:"Hanna Diyab, who first told Aladdin to Galland, came from which city?",o:["Baghdad","Cairo","Aleppo","Damascus"],a:2,why:"He met Galland in Paris in 1709.",st:"Galland’s Nights, 1704",kc:"sy"},
 {q:"Where was the first Arabic edition printed in the Arab world, in 1835?",o:["Bulaq, Cairo","Beirut","Baghdad","Tunis"],a:0,why:"At the government press in Bulaq.",st:"Mamluk Cairo",kc:"eg"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "b1001|One Thousand and One Nights":"Sunset in Baghdad, Iraq.jpg","b1001|Shahrazad’s frame":"The Ardabil Carpet - Google Art Project.jpg",
 "b1001|Where the tales came from":"Gran Mezquita de Isfahán, Isfahán, Irán, 2016-09-20, DD 23.jpg","b1001|Harun al-Rashid’s Baghdad":"001125-Kadhemiya-Baghdad-IMG 8124-2.jpg",
 "b1001|Basra: Sindbad sets out":"Kuwait City Arabian Gulf Street Dhow 2.jpg","b1001|Sindbad’s sea road":"Dhow Zanzibar-7.jpg",
 "b1001|The Roc and the valley of diamonds":"Diamonds - cubic & octahedral - Africa (8457822945).jpg","b1001|Serendib":"Sigiriya Rock Fortress View from Pidurangala Rock.jpg",
 "b1001|Camphor, cloves and nutmeg":"Colorful Spices and Teas.jpg","b1001|Aladdin’s China":"Diya Lamp.jpg",
 "b1001|Mamluk Cairo":"Cairo skyline in the morning.jpg","b1001|Damascus":"Damascus, Syria, The Umayyad Mosque, The Courtyard, Islamic Art.jpg",
 "b1001|The City of Brass":"Libya Ghadames Old Town Rooftop View.JPG","b1001|Galland’s Nights, 1704":"Citadel of Aleppo.jpg",
 "b1001|The tales travel on":"Grand Bazaar Istanbul - panoramio.jpg","b1001|Now explore":"Sail Boat Sunset Stone Town Zanzibar Oct26 OM3 1123.jpg"};
const PIN={
 "The Tigris at Baghdad":"Tigris in Baghdad 1958 04.jpg","Al-Azhar Mosque, Cairo":"Mosquée Al-Azhar.jpg","The Umayyad Mosque, Damascus":"Damascus, Syria, The Umayyad Mosque, The Courtyard, Islamic Art.jpg",
 "The Registan, Samarkand":"Registan 01.jpg","Sigiriya, Sri Lanka":"Sigiriya Rock Fortress View from Pidurangala Rock.jpg","The Citadel of Aleppo":"Citadel of Aleppo.jpg",
 "A dhow off Zanzibar":"Dhow Zanzibar-7.jpg","The Ganges at Varanasi":"Ganga aarti at Varanasi.jpg","The Great Mosque of Isfahan":"Gran Mezquita de Isfahán, Isfahán, Irán, 2016-09-20, DD 23.jpg",
 "Pearl divers in the Gulf":"Arab pearl divers in the Persian Gulf.jpg","Old Muscat":"Old Muscat City View, Muscat, Oman3.jpg","Ships in the Strait of Malacca":"Ships in the Malacca Strait.jpg",
 "Guangzhou today":"Canton Tower 20241027 (cropped).jpg","Baobabs on Madagascar":"Allée des baobabs Morondava Madagascar.jpg","Hyderabad, near Golconda":"Charminar Hyderabad 1.jpg",
 "The Temple of the Tooth, Kandy":"Dalada Maligawa Sri Lanka G.jpg","Galle Fort":"Galle Fort.jpg","Nutmeg":"Nutmeg ready.jpg","Pepper on the vine":"Black pepper vine, da Coleção Brasiliana Iconográfica.jpg",
 "Old Damascus":"Old Damascus 20.jpg","The Great Mosque of Kairouan":"Great Mosque of Kairouan Panorama - Grande Mosquée de Kairouan Panorama.jpg","Ghadames, in the Sahara":"Libya Ghadames Old Town Rooftop View.JPG",
 "Notre-Dame, Paris":"Notre-Dame de Paris, 4 October 2017.jpg","The Grand Bazaar, Istanbul":"Grand Bazaar Istanbul - panoramio.jpg","Calcutta’s Victoria Memorial":"Victoria Memorial situated in Kolkata.jpg"};
/* new photos (GF_B1001_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_B1001_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={b1001:"Dhow Zanzibar-7.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
