/* GeoFlock: the tour review, History shelf (review of 2026-10-30). One file, patched by tour id and stop title.
   - Each story gets one home tour; repeats in the other history tours are cut or re-angled (Vikings, Magellan, da Gama,
     Zheng He, Mansa Musa, Great Zimbabwe, Angkor, the Black Death, the first emperor, the Greek "frogs", Dejima, opium,
     Laos, Shenzhen, Gallipoli, the Pacific war, Yugoslavia, coast-to-coast rail).
   - "The history of Europe" and "Medieval empires" (both under 7.0) are reworked: stops cut, re-angled and reordered.
   - New stops across the shelf (see GF_RVHIST_NEW below), told place → mechanism → result, with lines, rulers,
     year-by-year borders (sub / histAnim), empire overlays on the relief tours (gfEmpire) and photo pins.
   - Tour questions follow the renamed and removed stops.
   New photos are freely licensed files from Wikimedia Commons (author, licence and page in GF_RVHIST_PHOTOS); the rest
   come from the shared library. A stop that has been renamed or removed elsewhere is simply skipped.
   Load it after the other tour files and polish patches. */
(function(){
"use strict";
/* new photos from Wikimedia Commons, added to the shared library */
window.GF_RVHIST_PHOTOS=[{"f": "Turkey.Bodrum091.jpg", "d": "photos/xa1b030d8e1834be0.webp", "by": "Georges Jansoone (JoJan)", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Turkey.Bodrum091.jpg"}, {"f": "Obelisk Eismann Fundstelle 20090908a.jpg", "d": "photos/xc3594e7a4719aefe.webp", "by": "Tigerente", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Obelisk_Eismann_Fundstelle_20090908a.jpg"}, {"f": "Chinchorro mummy, south coast of Peru or north coast of Chile, 5000-2000 BC - San Diego Museum of Man - DSC06921.JPG", "d": "photos/xb633d285112e2e93.webp", "by": "Daderot", "lic": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Chinchorro_mummy%2C_south_coast_of_Peru_or_north_coast_of_Chile%2C_5000-2000_BC_-_San_Diego_Museum_of_Man_-_DSC06921.JPG"}, {"f": "Eureka original.jpg", "d": "photos/xd0ede0bcd4990aeb.webp", "by": "Jodyrootes", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Eureka_original.jpg"}, {"f": "Glossina-morsitans.jpg", "d": "photos/x08688e58bf5dfdd4.webp", "by": "Alan R Walker", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Glossina-morsitans.jpg"}, {"f": "Geobugseon and Atakebune at Saga Prefectural Nagoya Castle Museum 260912 1.jpg", "d": "photos/x6b73aa87d4fc7102.webp", "by": "Aspere", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Geobugseon_and_Atakebune_at_Saga_Prefectural_Nagoya_Castle_Museum_260912_1.jpg"}, {"f": "Iolani Palace (51872681413).jpg", "d": "photos/xec0f84dfe5285c1b.webp", "by": "Gage Skidmore", "lic": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Iolani_Palace_%2851872681413%29.jpg"}, {"f": "Pythéas.jpg", "d": "photos/x17616ae7a1e9a20d.webp", "by": "Rvalette", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Pyth%C3%A9as.jpg"}, {"f": "DunhuangCave323.jpg", "d": "photos/x3cf1d34cb7a64491.webp", "by": "Unknown artist, Mogao Cave 323, 8th century", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:DunhuangCave323.jpg"}, {"f": "Jeanne Barret.jpg", "d": "photos/x49dea34a08f208e6.webp", "by": "Unknown artist (engraving, 1816)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Jeanne_Barret.jpg"}, {"f": "Workers with hand tools building Burma Road2.jpg", "d": "photos/x0f27ac642cd77b87.webp", "by": "US Army Signal Corps", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Workers_with_hand_tools_building_Burma_Road2.jpg"}, {"f": "ElAlameinCommonwealthWarCemetery.jpg", "d": "photos/xb0f79d3e85db4445.webp", "by": "Ian Rose", "lic": "CC BY 2.5", "page": "https://commons.wikimedia.org/wiki/File:ElAlameinCommonwealthWarCemetery.jpg"}, {"f": "Camp Century trench construction.png", "d": "photos/xe4c8a86af7508ee0.webp", "by": "US Army Corps of Engineers (CRREL)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Camp_Century_trench_construction.png"}, {"f": "Patrice Lumumba, 1960 (cropped).jpg", "d": "photos/x3bb752cd345bf6a8.webp", "by": "Unknown photographer / Anefo", "lic": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Patrice_Lumumba%2C_1960_%28cropped%29.jpg"}, {"f": "TSMC Fab5.JPG", "d": "photos/xd14d6f14b4c56692.webp", "by": "Peellden", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:TSMC_Fab5.JPG"}, {"f": "Wachturm DDR PA.JPG", "d": "photos/xcdc044a071883af6.webp", "by": "Michael Sander", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Wachturm_DDR_PA.JPG"}, {"f": "Tombeau askia.jpg", "d": "photos/x09f70930ff9c8412.webp", "by": "Gio53", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Tombeau_askia.jpg"}, {"f": "1727 company gardens Cape Town.png", "d": "photos/x1d09019bd995a42d.webp", "by": "Peter Kolb (1727)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:1727_company_gardens_Cape_Town.png"}, {"f": "Guano Mining in Chincha Islands Peru (1865) Moulton.jpg", "d": "photos/x1fffde937b4a1f1b.webp", "by": "Henry Moulton (before 1865)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Guano_Mining_in_Chincha_Islands_Peru_%281865%29_Moulton.jpg"}, {"f": "Copy of San Lorenzo Colossal Head.jpg", "d": "photos/x55e1421bc3357cf0.webp", "by": "Burkhard Mücke", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Copy_of_San_Lorenzo_Colossal_Head.jpg"}, {"f": "Lockport bartlett color crop.jpg", "d": "photos/x553ed49b1ea86f1a.webp", "by": "After W. H. Bartlett (1830s engraving)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Lockport_bartlett_color_crop.jpg"}, {"f": "Emergency hospital during Influenza epidemic, Camp Funston, Kansas - NCP 1603.jpg", "d": "photos/x245cc49271256de3.webp", "by": "Otis Historical Archives, National Museum of Health and Medicine", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Emergency_hospital_during_Influenza_epidemic%2C_Camp_Funston%2C_Kansas_-_NCP_1603.jpg"}, {"f": "British tanks in Port Said.jpg", "d": "photos/x1ec335be462fc04d.webp", "by": "Unknown photographer (British government)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:British_tanks_in_Port_Said.jpg"}, {"f": "Buddha-Vajrapani-Herakles.JPG", "d": "photos/x1b9d0d803c426c9a.webp", "by": "World Imaging", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Buddha-Vajrapani-Herakles.JPG"}, {"f": "Arab pearl divers in the Persian Gulf.jpg", "d": "photos/xb6f68537f6c450f9.webp", "by": "From G. F. Kunz, The Book of the Pearl (1908)", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Arab_pearl_divers_in_the_Persian_Gulf.jpg"}, {"f": "Новгородская грамота 109 от Жизномира к Микуле 12 век.jpg", "d": "photos/x535829deada9db63.webp", "by": "Novgorod birch-bark letter no. 109, 12th century", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D1%8F_%D0%B3%D1%80%D0%B0%D0%BC%D0%BE%D1%82%D0%B0_109_%D0%BE%D1%82_%D0%96%D0%B8%D0%B7%D0%BD%D0%BE%D0%BC%D0%B8%D1%80%D0%B0_%D0%BA_%D0%9C%D0%B8%D0%BA%D1%83%D0%BB%D0%B5_12_%D0%B2%D0%B5%D0%BA.jpg"}, {"f": "Armed guard escort on a merchant ship.jpg", "d": "photos/xd561609a5f097584.webp", "by": "Hanuma Bhakta", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Armed_guard_escort_on_a_merchant_ship.jpg"}, {"f": "Talang Tuo Inscription.jpg", "d": "photos/x292bc554c5dbedf1.webp", "by": "Gunawan Kartapranata", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Talang_Tuo_Inscription.jpg"}];

const OR="#d9682b",W=[-180,-58,180,80];
const def=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{o[k]=v}catch(_){}}};
/* photo-pin lists are locked (a getter that ignores later writes), as polish-k does, so other files cannot put back the old list */
const lock=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}})}catch(e){def(o,k,v)}};
const T=id=>{try{const t=PS_TOURS[id];return t&&Array.isArray(t.steps)?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s&&s.title===title):null};
const ph=(at,label,f)=>({at,label,col:OR,icon:"photo",_f:f});
const P=(at,label)=>[at,label,"point"];
const ic=(at,icon,col)=>({at,icon,col:col||"#c2364f"});
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,_ff:1,_rvH:1,card:"left",hiSoft:[]},o);

/* ---------- small editing helpers ---------- */
function set(id,title,o){const s=st(id,title);if(!s)return null;
 for(const k in o){if(k==="phPins"||k==="pins")lock(s,k,o[k]);else def(s,k,o[k])}
 if(o.view)def(s,"_ff",1);if(o.phPins)s._sqPruned=-1;return s}
function drop(id,title){const t=T(id);if(!t)return;const i=t.steps.findIndex(s=>s&&s.title===title);if(i>=0)t.steps.splice(i,1)}
/* the card sits over the left part of the map: widen a new stop's view westwards so that its pins and lines fall in the
   right-hand 55% of the frame (world-wide and polar views are left alone) */
function frame(s){try{const v=s.view;if(!v||(s.card&&s.card!=="left")||v[2]-v[0]>=300||v[1]<-70)return;
 const xs=[];(s.pins||[]).forEach(p=>xs.push(p[0][0]));(s.phPins||[]).forEach(q=>xs.push(q.at[0]));(s.lines||[]).forEach(l=>l.coords.forEach(c=>xs.push(c[0])));
 if(s.gfRuler){xs.push(s.gfRuler.a[0],s.gfRuler.b[0])}if(!xs.length)return;
 const lo=Math.min(...xs),hi=Math.max(...xs),w=v[2]-v[0];if(lo>=v[0]+.42*w&&hi<=v[2])return;
 const W=Math.max(w,(hi-lo)/.53),x0=lo-.42*W;s.view=[Math.max(-180,x0),v[1],Math.min(180,x0+W),v[3]]}catch(e){}}
function ins(id,after,s){const t=T(id);if(!t||t.steps.some(x=>x&&x.title===s.title))return;let i=t.steps.findIndex(x=>x&&x.title===after);
 if(i<0)i=t.steps.length-2;frame(s);t.steps.splice(i+1,0,S(s))}
const CAPKEY=(id,t)=>id+"|"+t;
function rename(id,from,to){const s=st(id,from);if(!s||st(id,to))return;def(s,"title",to);
 try{if(PS_PHOTO[CAPKEY(id,from)]!=null&&PS_PHOTO[CAPKEY(id,to)]==null)PS_PHOTO[CAPKEY(id,to)]=PS_PHOTO[CAPKEY(id,from)]}catch(e){}
 try{const C=window.PS_PHOTO_CAP;if(C&&C[CAPKEY(id,from)]&&!C[CAPKEY(id,to)])C[CAPKEY(id,to)]=C[CAPKEY(id,from)]}catch(e){}}
/* put the named stops in this order, keeping the first and last stops where they are */
function order(id,titles){const t=T(id);if(!t)return;const L=t.steps,first=L[0],last=L[L.length-1];
 const pick=titles.map(x=>L.find(s=>s&&s.title===x)).filter(Boolean);const rest=L.filter(s=>s!==first&&s!==last&&!pick.includes(s));
 const out=[first,...pick,...rest,last];L.length=0;out.forEach(s=>L.push(s))}

/* =====================================================================================================
   Ancient civilisations
   ===================================================================================================== */
function hancient(){
 set("hancient","Mesopotamia: writing begins",{
  more:"The first texts were not stories but accounts: sacks of grain, jars of beer and sheep. Mesopotamians counted in sixties, which is where our 60 seconds, 60 minutes and 360 degrees come from. In a hot, flat land, irrigation water evaporates and leaves its salt behind: temple records seem to show farmers in the south switching from wheat to hardier barley over the centuries, though how far this weakened Sumer is still argued over."});
 set("hancient","Egypt and the pyramids",{
  body:"Rain almost never falls in Egypt. Instead, the Nile’s yearly flood watered and fertilised a strip of land only a few kilometres wide in most places, and the deserts on both sides kept invaders out. That ribbon of farmland fed a kingdom ruled by pharaohs for about 3,000 years. The Great Pyramid of Giza was built about 2560 BC."});
 set("hancient","The Phoenicians",{
  more:"Their letters stood for sounds, not words, so they were far easier to learn than hieroglyphs or cuneiform. Our word “alphabet” comes from their first two letters, aleph (ox) and bet (house), through Greek alpha and beta. Tyre grew rich on a purple dye made from sea snails, worn by kings. Carthage later became Rome’s great rival."});
 set("hancient","Ancient Greece",{
  stat:"In Athens, many officials were chosen by lottery, not by vote",
  body:"Greece’s mountains split the land into small valleys cut off from each other, so it became hundreds of city-states, like Athens and Sparta, not one kingdom. Each looked to the sea, and sent settlers all over the Mediterranean and the Black Sea (arrows). In about 508 BC Athens began the first known democracy: citizens voted on laws themselves, and many officials were picked by lot, so that any citizen might serve.",
  more:"Only free men counted as citizens: women, slaves and foreigners could not vote. Long before, the Minoans of Crete had built great palaces like Knossos, about 4,000 years ago. The Greeks gave us the Olympic Games, theatre, and the words “democracy”, “politics” and “philosophy”."});
 /* the first emperor: the Asia history tour keeps the army and the wall; here, the idea of one standard for everything */
 set("hancient","The first emperor",{
  stat:"China’s first emperor made every cart axle the same width, so wheels fitted the ruts on every road",
  body:"In 221 BC the king of Qin conquered his rivals and united China. Then he made it work as one country: one script, one set of coins and weights, and one width for cart axles, so carts could run in the same ruts along new roads from his capital (dashed; the straight road north ran about 700 km).",
  more:"One script meant that officials across China could read the same orders even when they spoke different languages, and Chinese characters still work that way today. His own dynasty fell within four years of his death, but the idea of one China under one ruler lasted over 2,000 years.",
  lines:[{coords:[[108.72,34.35],[108.9,36.2],[109.3,38.3],[109.9,40.6]],kind:"dash"},{coords:[[108.72,34.35],[111.5,34.7],[114.5,36.6],[118.3,36.85]],kind:"dash"},{coords:[[108.72,34.35],[110.5,32.4],[112,30.3],[113,28.2]],kind:"dash"}],
  pins:[P([108.72,34.35],"Xianyang, the Qin capital"),P([109.9,40.6],"End of the Straight Road"),P([118.3,36.85],"Linzi, last rival to fall, 221 BC")]});
 set("hancient","The Maya",{
  stat:"In 2018, lasers fired from planes found over 60,000 hidden buildings under the Guatemalan jungle",
  body:"From about 250 to 900 AD, Maya cities like Tikal rose out of the rainforest, with stone pyramids, ball courts and kings whose deeds were carved in a full writing system. The laser scans showed the cities were far bigger and busier than anyone thought, joined by raised roads and ringed by terraced and drained fields that could feed millions.",
  more:"The Maya were using a zero centuries before Europe was. In 378 AD a warlord from Teotihuacan, a city of perhaps 100,000 people near today’s Mexico City, arrived at Tikal, about 1,000 km away (arrow), and put a new king on its throne. Many southern Maya cities were abandoned in the 800s and 900s, but millions of Maya people still live in the region and speak Mayan languages."});
 ins("hancient","China’s Yellow River",{title:"The bronze faces of Shu",sub:"bc1000/chn",view:[90,20,124,42],globe:[106,31,3],
  lines:[{coords:[[103,32.9],[105.5,32.8],[107.8,32.2],[109.2,31],[108.9,29.6],[107.6,28.4],[105.3,28],[103.6,28.7],[102.9,30.3],[103,32.9]],kind:"dash"}],
  pins:[P([104.2,30.99],"Sanxingdui"),P([114.35,36.1],"Anyang: the Shang kings"),P([106.1,29.3],"Sichuan Basin, ringed by mountains")],
  stat:"About 3,000 years ago, a lost kingdom in Sichuan cast bronze masks over a metre wide, with eyes sticking out on stalks",
  body:"At Sanxingdui, pits found in 1986 held giant bronze masks, a standing figure 2.6 m tall and a bronze tree almost 4 m high. Nothing like them was known from the kingdoms of the Yellow River (shaded). The Sichuan Basin is ringed by mountains (dashed), and that isolation let a quite separate civilisation grow there.",
  more:"The Tang poet Li Bai wrote that “the road to Shu is harder than climbing to the blue sky”. No writing has been found at Sanxingdui, so we still don’t know who these people were or what they called themselves."});
 ins("hancient","The bronze faces of Shu",{title:"Ten tonnes of copper, one of tin",sub:"bc1500/egy",view:[-12,22,72,58],globe:[30,37,1.6],
  lines:[{coords:[[33.2,35.05],[31.5,35.6],[29.68,36.13]],kind:"flow"},{coords:[[29.68,36.13],[27,36.6],[24.5,37.2],[22.75,37.73]],kind:"flow"},
   {coords:[[68.5,39.4],[60,37.5],[52,35.7],[44,33.3],[38,34.5],[35.6,34.6],[33.2,35.05]],kind:"dash"},{coords:[[34.7,37.4],[33.6,36.2],[33.2,35.05]],kind:"dash"},
   {coords:[[20,54.6],[19,49],[17,45],[19.5,40],[22.75,37.73]],kind:"dash"},{coords:[[32.6,25.7],[32,29],[33.2,35.05]],kind:"dash"}],
  pins:[P([33.2,35.05],"Cyprus: copper"),P([68.5,39.4],"Central Asia: tin?"),P([34.7,37.4],"Taurus Mountains: tin?"),P([20,54.6],"Baltic amber"),P([32.6,25.7],"Egypt: Nefertiti’s scarab"),P([22.75,37.73],"Mycenae")],
  iconPins:[ic([29.68,36.13],"ship","#2a78d0")],
  phPins:[ph([29.68,36.13],"Uluburun: the wreck’s copper ingots","ULUBURUN")],
  stat:"A ship that sank off Turkey about 3,300 years ago carried about 10 tonnes of copper and 1 tonne of tin: the recipe for bronze",
  body:"Bronze is about nine parts copper to one part tin, and the two are rarely mined in the same place. Copper came from Cyprus, but tin had to come from far away: tests on the wreck’s tin point to mines in Turkey and Central Asia, and some scientists argue for Britain (dashed lines). So the Bronze Age depended on long-distance shipping, and when that trade broke down around 1200 BC, amid drought, war and raiders, palace kingdoms from Greece to the Levant collapsed within a few decades.",
  more:"A sponge diver spotted the wreck in 1982. It also held ebony, ivory, glass ingots, amber from the Baltic and a gold scarab with Nefertiti’s name: a whole Mediterranean economy on one boat."});
 /* questions */
 TQ("hancient",q=>{q.recap=(q.recap||[]).map(x=>x.st==="The first emperor"&&/terracotta|well/i.test(x.q+x.why+x.o.join())?
  {q:"What did China’s first emperor make the same width all over the country?",o:["Cart axles","City gates","Rice fields","Canal locks"],a:0,why:"One axle width meant carts could run in the same ruts on every road.",st:"The first emperor"}:x)});
}

/* =====================================================================================================
   The history of Europe (rework)
   ===================================================================================================== */
function heurope(){
 drop("heurope","Yugoslavia breaks apart");   /* the world-since-1991 tour tells it */
 drop("heurope","The Black Death");           /* Medieval empires tells it, from its Central Asian start */
 drop("heurope","Spain’s year of 1492");      /* Columbus has three other homes; the slot goes to the Hanse */
 set("heurope","Rome falls, nations rise",{
  more:"Lombardy is named after the Lombards and Burgundy after the Burgundians. The Vandals crossed to North Africa and sacked Rome again in 455, which is why we call wreckers “vandals”. The eastern half of the empire, ruled from Constantinople, lasted almost 1,000 years more."});
 set("heurope","The Vikings",{
  stat:"Vikings founded Dublin, gave Normandy its name and may have given Russia its name too",
  body:"From 793, when they raided the monastery of Lindisfarne in England, Norse ships sailed out of Scandinavia’s fjords. Their shallow longships could cross open sea and also row far up rivers, so the same crews raided and traded from Dublin to the Volga, and down Russia’s rivers towards Constantinople. The ruler measures Norway to Dublin.",
  more:"Dublin began as a Viking trading town in 841, and Normandy, in France, is named after these “Northmen”. Swedish Vikings known as the Rus’ helped found the first Russian state at Kyiv and Novgorod. Viking warriors, the Varangian Guard, protected the emperors in Constantinople. Westward, they settled Iceland and Greenland.",
  gfRuler:{a:[5.32,60.39],b:[-6.26,53.35]},
  pins:[P([-6.26,53.35],"Dublin, founded 841"),P([0.5,49.2],"Normandy"),P([-1.8,55.68],"Lindisfarne, 793"),P([30.5,50.45],"Kyiv"),P([31.27,58.52],"Novgorod")]});
 set("heurope","The Industrial Revolution",{
  stat:"Britain’s first factory towns grew where coal, fast rivers and seaports lay close together",
  body:"Britain sat on coal near the surface, close to rivers and the sea, so fuel and raw cotton could be moved cheaply by canal and coastal ship. From about 1760 the first mills grew where coal, water power and ports met, around Manchester and Liverpool, and the same pattern spread to the coalfields (resource icons) of Belgium and Germany’s Ruhr.",
  more:"No place in Britain is more than about 115 km from the sea, which kept heavy coal cheap to move. Steam engines were first built to pump water out of coal mines; only later did they drive mills, ships and trains. Manchester grew more than tenfold in about 80 years.",
  phPins:[{at:[-2.24,53.48],label:"Manchester",col:OR,icon:"photo"}]});
 set("heurope","The Turks at Vienna",{
  stat:"In 1683 an Ottoman army besieged Vienna for two months, and its defeat began the long Ottoman retreat from Europe",
  body:"After taking Constantinople in 1453, the Ottoman Turks conquered the Balkans and most of Hungary. In 1683 a huge army camped outside Vienna’s walls. On 12 September a relief army led by Poland’s King Jan Sobieski broke the siege with one of the largest cavalry charges in history, and within 16 years the Ottomans had lost Hungary. Replay the map from 1650 to 1715.",
  sub:"1650/ott",histAnim:["1650","1700","1715"],histAnimLabel:"↻ Replay 1650 to 1715"});
 /* new stops */
 ins("heurope","Europe’s first artists",{title:"The Iceman",sub:"bc3000",view:[2,40,24,52],globe:[11,46.7,5],
  hi:["it","at"],pins:[P([11.35,46.5],"Bolzano: his museum")],
  phPins:[ph([10.84,46.78],"Tisenjoch: the stone marking where Ötzi lay","OTZI")],iconPins:[ic([10.84,46.78],"snow","#5b8fc7")],
  stat:"A man murdered in the Alps 5,300 years ago was found in 1991, and Italy and Austria argued over whose he was",
  body:"Hikers found Ötzi in melting ice on a mountain pass, 3,210 m up. The cold had freeze-dried him, along with his copper axe, his bow, his grass cape and his last meal of ibex meat. Surveyors found he lay about 90 m inside Italy, so he now lies in a freezer in Bolzano.",
  more:"In 2001 an X-ray found a stone arrowhead in his shoulder: he had been shot from behind. He has more than 60 tattoos, mostly lines over his joints, perhaps as a treatment for pain."});
 ins("heurope","The Vikings",{title:"The Hanseatic League",sub:"1400",view:[-14,46,40,64],globe:[14,56,2.6],
  lines:[{coords:[[-0.1,51.5],[3.22,51.21],[6.5,53.6],[8.8,53.6],[9.99,53.55]],kind:"flow"},{coords:[[10.69,53.87],[13,54.6],[18.3,57.64],[24.1,56.95]],kind:"flow"},{coords:[[18.3,57.64],[22,59.4],[24.75,59.44],[28,59.7],[31.27,58.52]],kind:"flow"},{coords:[[5.32,60.39],[7,57.5],[10.5,57.7],[11,55.5],[10.69,53.87]],kind:"flow"},{coords:[[9.99,53.55],[10.69,53.87]],kind:"amber"}],
  pins:[P([-0.1,51.5],"London: the Steelyard"),P([3.22,51.21],"Bruges"),P([9.99,53.55],"Hamburg"),P([18.3,57.64],"Visby"),P([24.1,56.95],"Riga"),P([31.27,58.52],"Novgorod")],
  phPins:[ph([10.69,53.87],"Lübeck: the Holstentor","Holstentor in Lübeck Frontseite - Zuschnitt.jpg"),ph([5.32,60.39],"Bergen: Bryggen’s wharf","Bryggen, Bergen, Noruega, 2019-09-08, DD 115-117 PAN.jpg")],
  stat:"Hamburg’s number plates still start “HH”, for “Hanseatic City of Hamburg”, over 500 years after the league’s peak",
  body:"From the 1200s, merchant towns around the North Sea and the Baltic, led by Lübeck, banded together to protect their ships and their trade in grain, timber, furs, salt and herring. A short land link from Hamburg to Lübeck (amber) joined the two seas. At its height the Hanse linked nearly 200 towns, from London to Novgorod, and could even fight wars against kings.",
  more:"Lufthansa takes its name from it. Its wooden warehouses at Bryggen, in Bergen, still stand, and Swedish, Danish and Norwegian are full of Low German words that Hanse merchants brought."});
 ins("heurope","The Turks at Vienna",{title:"The Lisbon earthquake",sub:"1783",view:[-30,30,6,46],globe:[-9,38,4],
  lines:[{coords:[[-10.5,36.6],[-9.6,38.2],[-9.14,38.71]],kind:"red"},{coords:[[-10.5,36.6],[-7.5,36.4],[-6.3,36.53]],kind:"red"},{coords:[[-10.5,36.6],[-8.5,34.5],[-6.84,34.02]],kind:"red"}],
  pins:[P([-10.5,36.6],"Epicentre, under the Atlantic (roughly)"),P([-6.3,36.53],"Cádiz"),P([-6.84,34.02],"Rabat")],
  phPins:[ph([-9.14,38.71],"Lisbon: the rebuilt Baixa","Arco Triunfal da Rua Augusta, Plaza del Comercio, Lisboa, Portugal, 2012-05-12, DD 02.JPG")],
  stat:"On All Saints’ Day 1755 an earthquake, a tsunami and fires destroyed Lisbon while its churches were full",
  body:"A huge earthquake under the Atlantic struck on the morning of 1 November. Survivors who fled to the riverside were swept away by a tsunami (red), and candles lit for the holy day started fires that burned for days. Tens of thousands of people died in the city. Thinkers across Europe, Voltaire among them, asked how a good God could allow it.",
  more:"The chief minister, Pombal, sent a questionnaire to every parish asking what people had felt and seen, an early step towards the science of earthquakes. The centre was rebuilt on a grid, with a wooden frame inside the walls, among the first buildings designed to survive quakes."});
 ins("heurope","Two new countries",{title:"The cloud from Chernobyl",sub:"1985/ussr",view:[-8,42,48,66],globe:[24,55,2.2],
  lines:[{coords:[[30.1,51.39],[27,53.5],[23,56],[20.5,58.6],[18.17,60.4]],kind:"flow"},{coords:[[30.1,51.39],[25,51.5],[19,50.5],[13,48.5],[9,47]],kind:"flow"}],
  pins:[P([30.1,51.39],"Chernobyl, 26 April 1986"),P([18.17,60.4],"Forsmark: alarms, 28 April")],
  gfRuler:{a:[30.1,51.39],b:[18.17,60.4]},
  phPins:[ph([30.05,51.4],"Pripyat, empty since 1986","A bird's eye view of the town of Pripyat (02710022).jpg")],
  stat:"The world found out about Chernobyl when radiation set off alarms at a Swedish nuclear plant, over 1,000 km away",
  body:"On 26 April 1986 a reactor exploded at Chernobyl, in Soviet Ukraine, and the winds carried radioactive dust north-west, then across much of Europe (arrows). The Soviet government said nothing. Two days later a worker’s shoes set off the radiation alarms at Sweden’s Forsmark plant; once the Swedes found the dust was not their own, they traced it to the Soviet Union, which then admitted the accident.",
  more:"The town of Pripyat, home to about 49,000 people, was emptied and is still abandoned. Without people, the exclusion zone has filled with wolves, elk and even Przewalski’s horses, released there in the 1990s."});
 ins("heurope","The cloud from Chernobyl",{title:"The death strip turned green",sub:"1985",view:[-10,34,48,72],globe:[20,55,1.8],
  lines:[{coords:[[30.8,69.8],[29,67.5],[29.8,64],[27.8,61.5],[28,60.5]],kind:"dash"},{coords:[[28,59.5],[24,57.5],[21,56],[18,55],[13,54.5],[10.9,54]],kind:"dash"},
   {coords:[[10.9,54],[10.6,53.4],[11.2,52.8],[10.9,52.4],[10.4,51.6],[10,51.2],[10.06,50.73],[10.8,50.4],[11.9,50.3],[12.1,50.2],[13.8,48.8],[15,48.9],[16.9,48.6],[17.1,48],[16.5,47.8],[16.1,46.9],[15.6,46.5],[13.6,46.4],[13.7,45.6]],kind:"dash"},
   {coords:[[19.4,42.2],[20.6,41.1],[21,40.8],[23,41.4],[24.5,41.6],[26.2,41.7],[28,42]],kind:"dash"}],
  pins:[P([30.8,69.8],"Barents Sea"),P([28,42],"Black Sea")],
  phPins:[ph([10.06,50.73],"Point Alpha: an East German watchtower","POINTALPHA")],
  stat:"The Iron Curtain’s no-man’s-land is now a wildlife corridor about 12,500 km long, from the Arctic to the Black Sea",
  body:"For 40 years, the strip along the border between East and West (dashed) was fenced, mined and empty of people. Left alone, it became a refuge for rare birds, insects and plants. After 1989, conservationists set out to protect the whole line as the European Green Belt.",
  more:"In Germany alone the “Grünes Band” runs about 1,400 km. In parts of the Balkans, old minefields are still being cleared."});
 order("heurope",["Europe’s first artists","The Iceman","Greeks round a pond","Built by Rome","Rome falls, nations rise","The Vikings","The Hanseatic League","The Renaissance","Print and protest","The Turks at Vienna","The Lisbon earthquake","Napoleon’s Europe","The Industrial Revolution","Two new countries","The cloud from Chernobyl","The death strip turned green","Charlemagne’s Europe again"]);
 TQ("heurope",q=>{
  q.mid=(q.mid||[]).map(x=>x.st==="The Black Death"?{at:"The Renaissance",q:"Hamburg’s car number plates start with HH. What does it stand for?",o:["Hanseatic City of Hamburg","Hamburg Harbour","High Hamburg","Holy Hamburg"],a:0,why:"Hamburg was a leading town of the Hanseatic League, the merchant towns of the North Sea and Baltic.",st:"The Hanseatic League"}:x);
  q.recap=(q.recap||[]).map(x=>x.st==="The Vikings"?{q:"Which region of France is named after the Vikings, the “Northmen”?",o:["Brittany","Normandy","Burgundy","Provence"],a:1,why:"Viking settlers on the lower Seine gave Normandy its name.",st:"The Vikings"}:
   x.st==="Yugoslavia breaks apart"?{q:"How did the world first learn of the Chernobyl accident in 1986?",o:["A Soviet news broadcast","Radiation alarms at a Swedish nuclear plant","A US spy satellite","A letter from Kyiv"],a:1,why:"A worker’s shoes set off the alarms at Forsmark, in Sweden, two days later.",st:"The cloud from Chernobyl"}:x)});
}

/* =====================================================================================================
   The history of Asia
   ===================================================================================================== */
function hasia(){
 /* Shenzhen’s rise merges into Asian miracles (the world-since-1991 tour keeps the Shenzhen growth figure) */
 drop("hasia","Shenzhen’s rise");
 set("hasia","Asian miracles",{
  body:"After World War II Japan (red) rebuilt so fast that by 1968 it had the world’s second-largest economy. South Korea, Taiwan, Hong Kong and Singapore, the “Four Asian Tigers”, followed, building factories for export, and from 1980 China copied them, starting with special economic zones like Shenzhen, next to Hong Kong.",
  more:"Lee Kuan Yew wept on television when Singapore was separated from Malaysia; today it is one of the richest countries in the world per person. In 1960 South Korea was about as poor per person as many African countries. China’s Deng Xiaoping summed up his approach: “It doesn’t matter whether a cat is black or white, as long as it catches mice.”",
  pins:[P([121.56,25.04],"Taipei"),P([139.7,35.68],"Tokyo"),P([114.06,22.54],"Shenzhen: zone from 1980")]});
 set("hasia","Opium and Hong Kong",{
  stat:"Britain took Hong Kong Island in 1842, and in 1898 leased the land behind it for 99 years: that is why it all went back in 1997",
  body:"British merchants were smuggling opium grown in British India into China. When China tried to stop them, Britain went to war, and the 1842 Treaty of Nanjing gave it Hong Kong Island and opened Shanghai and other ports to foreign trade. Kowloon followed in 1860, and in 1898 the much larger New Territories were leased for 99 years.",
  more:"Because most of the colony stood on leased land, Britain handed all of Hong Kong back to China when the lease ran out in 1997, under the promise of “one country, two systems”. Portugal returned nearby Macau in 1999. In China, the years from 1839 are remembered as the “century of humiliation”."});
 set("hasia","The Vietnam War",{
  stat:"Vietnam’s long, thin shape made it easy to split at the 17th parallel, and hard to cut the trail that ran down beside it through Laos",
  body:"From 1955 to 1975, communist North Vietnam fought to unite the country against the South, which the United States backed. At its narrowest Vietnam is only about 50 km wide, so the North sent fighters and supplies around the dividing line (red), down the Ho Chi Minh Trail through the mountains of Laos and Cambodia (arrow).",
  more:"US planes dropped over 2 million tonnes of bombs on Laos trying to cut the trail, and unexploded bombs still kill people there. The war ended when the North took Saigon in 1975; the city was renamed Ho Chi Minh City. Today Vietnam and the US are major trading partners."});
 set("hasia","Angkor",{
  body:"Built in the early 1100s by the Khmer king Suryavarman II, it began as a Hindu temple to Vishnu and later became Buddhist. Around it lay Angkor, capital of an empire covering much of mainland Southeast Asia (pale). Its reservoirs and canals stored monsoon rain for the long dry season; when decades of drought, broken by violent floods, wrecked them in the 1300s and 1400s, the capital was largely abandoned.",
  more:"Monks never fully left Angkor Wat, and the temple has been on Cambodia’s flag, in one form or another, since the 1850s."});
 ins("hasia","Buddhism spreads",{title:"When the Buddha looked Greek",sub:"100/kushan",view:[52,22,122,48],globe:[80,36,2],
  lines:[{coords:[[72.79,33.75],[70.5,34.4],[68.2,34.8],[66.9,36.76]],kind:"flow"},{coords:[[66.9,36.76],[69.5,38.6],[71.5,40.5],[75.99,39.47],[80,40.5],[88,42.8],[94.66,40.14],[103.8,36.06],[108.94,34.27],[112.45,34.62]],kind:"flow"}],
  pins:[P([72.79,33.75],"Taxila, Gandhara"),P([66.9,36.76],"Balkh: Greek Bactria"),P([94.66,40.14],"Dunhuang"),P([112.45,34.62],"Luoyang: Buddhism reaches China")],
  phPins:[ph([67.83,34.83],"Bamiyan: the Buddhas, before 2001","Buddhas of Bamiyan D39.jpg")],
  stat:"Some of the earliest statues of the Buddha wear Greek-style robes and wavy hair, thanks to Alexander the Great",
  body:"After Alexander’s conquests, Greek kings ruled for about 300 years in what are now Afghanistan and Pakistan. In this region, Gandhara, sculptors who carved people the Greek way met the Buddhist faith, and under the Kushan kings (shaded), who held this crossroads of the Silk Road, they made Buddhas that look like Greek gods. Monks and traders carried the style east to China, Korea and Japan (arrows).",
  more:"The giant Buddhas of Bamiyan, in Afghanistan, 55 m and 38 m tall, grew from the same tradition. The Taliban blew them up in 2001."});
 ins("hasia","Opium and Hong Kong",{title:"From pearls to oil",sub:"1930",view:[40,18,62,33],globe:[51,26,4],
  pins:[P([50.55,26.03],"Jebel Dukhan: oil, 1932"),P([47.98,29.37],"Kuwait"),P([51.53,25.29],"Doha")],
  iconPins:[ic([50.55,26.03],"oil","#333")],
  phPins:[ph([50.61,26.25],"Muharraq: the pearling town","PEARL")],
  stat:"Before oil, the Gulf’s richest trade was pearls, and it collapsed just before oil was found",
  body:"The warm, shallow waters of the Gulf were full of pearl oysters, and divers from Bahrain, Kuwait and Qatar held their breath for a minute or more to gather them. In the 1920s and 1930s, Japanese cultured pearls and then the Great Depression wrecked the trade. In 1932 oil was struck in Bahrain, the first on the Arab side of the Gulf, and a new economy took over.",
  more:"Divers wore clips of turtle shell on their noses and tied stones to their feet to sink fast. Bahrain’s “Pearling Path”, through old Muharraq, is now a World Heritage Site."});
 TQ("hasia",q=>{(q.mid||[]).forEach(x=>{if(x.at==="Shenzhen’s rise")x.at="Asian miracles"});
  q.recap=(q.recap||[]).map(x=>x.st==="Shenzhen’s rise"?Object.assign({},x,{st:"Asian miracles"}):x)});
}

/* =====================================================================================================
   The history of Africa
   ===================================================================================================== */
function hafrica(){
 ins("hafrica","Carthage against Rome",{title:"A town built of salt",sub:"1300/mali",view:[-24,6,14,34],globe:[-5,21,2.6],
  lines:[{coords:[[-4.98,23.6],[-4.3,20.5],[-3.5,18.2],[-3,16.77]],kind:"flow"},{coords:[[-10.7,13.4],[-7,14.5],[-3,16.77],[-4.5,20],[-4.98,23.6],[-4.6,27.5],[-4.25,31.28]],kind:"dash"}],
  pins:[P([-3,16.77],"Timbuktu"),P([-4.25,31.28],"Sijilmasa: gold to the north"),P([-10.7,13.4],"Bambuk: gold fields")],
  iconPins:[ic([-10.7,13.4],"gold","#c99a1a")],
  stat:"In the Sahara’s salt-mining town of Taghaza, even the houses and the mosque were built of salt",
  body:"West Africa had gold but little salt, which people in its hot climate badly needed. The Sahara had salt but no gold. So camel caravans carried slabs of salt south to Timbuktu (arrow) and gold north (dashed), and the empires of Ghana and Mali grew rich by taxing the trade in between.",
  more:"Ibn Battuta stayed at Taghaza in 1352. He wrote that its roofs were made of camel skins and that every bit of food had to be brought in. Camel caravans still carry salt slabs from Taoudenni, a later mine further south."});
 ins("hafrica","The Benin Bronzes",{title:"The fly that stopped the horse",sub:"1700",view:[-34,0,18,24],globe:[0,10,3],
  lines:[{coords:[[-13,9.6],[-9,8.7],[-5,8.2],[-2,8.2],[1,8.4],[3.5,8.7],[6.5,8.3],[9,7.5],[12,6.8]],kind:"dash"}],
  pins:[P([4.1,8.97],"Old Oyo: horsemen"),P([-0.2,16.27],"Gao: Songhai"),P([-1.62,6.69],"Kumasi: Asante"),P([5.63,6.34],"Benin City")],
  iconPins:[ic([4.1,8.97],"swords")],
  phPins:[ph([2,7.5],"A tsetse fly","TSETSE")],
  stat:"A fly decided where West Africa’s horse-riding empires could go",
  body:"Tsetse flies, common in the wet forests near the coast (south of the dashed line), carry a disease that kills horses and cattle. So the great cavalry empires, such as Mali, Songhai and Oyo, ruled the drier grasslands to the north but stopped near where the forest began. Forest kingdoms such as Asante and Benin fought on foot.",
  more:"The tsetse also stopped farmers from using oxen to pull ploughs across much of Africa. It infects people too, causing sleeping sickness. Oyo’s rulers even bought their horses from the north, because they could not breed them in the tsetse belt."});
 ins("hafrica","The Atlantic slave trade",{title:"A colony that began as a vegetable garden",sub:"1700/ned",view:[-40,-48,120,58],globe:[18,-20,1.2],
  lines:[{coords:[[4.9,52.37],[-5,45],[-18,25],[-25,5],[-20,-20],[0,-35],[18.42,-33.93]],kind:"flow"},{coords:[[18.42,-33.93],[40,-38],[70,-36],[95,-25],[106.8,-6.2]],kind:"flow"}],
  pins:[P([4.9,52.37],"Amsterdam"),P([106.8,-6.2],"Batavia (Jakarta)")],
  phPins:[ph([18.42,-33.93],"Cape Town: the Company’s Garden in 1727","COMPGARDEN")],
  stat:"European settlement in South Africa began in 1652 as a garden to grow vegetables for passing ships",
  body:"Dutch East India Company ships sailing to Asia (arrows) lost many sailors to scurvy, a disease caused by a lack of fresh food. So the company sent Jan van Riebeeck to the Cape, about halfway along the route, to grow vegetables and trade for cattle. Within a few years, settler farmers began spreading inland onto the grazing lands of the Khoekhoe.",
  more:"The Company’s Garden is still a park in central Cape Town. Afrikaans grew out of the Dutch spoken there by settlers, enslaved people brought from Asia and Africa, and the Khoekhoe."});
}

/* =====================================================================================================
   The history of North America
   ===================================================================================================== */
function hnamerica(){
 set("hnamerica","Digging the Panama Canal",{
  stat:"The Panama Canal was finally built only after doctors proved that mosquitoes spread yellow fever",
  body:"Before it opened in 1914, ships had to sail around Cape Horn (dashed). A French attempt in the 1880s failed, as yellow fever and malaria killed perhaps 22,000 workers. By 1900 doctors had shown that mosquitoes carried yellow fever, so the US Army doctor William Gorgas drained swamps, screened windows and oiled ponds, and by 1906 yellow fever was gone from the canal zone.",
  more:"The canal cut the sea trip from New York to San Francisco by more than half. In 1903 the US backed Panama’s break from Colombia, then built the canal and ran the zone around it. The US handed the canal to Panama on 31 December 1999."});
 ins("hnamerica","The first Americans",{title:"The rubber people",sub:"bc1000/n:Olmec",view:[-104,12,-84,25],globe:[-95,18,4],
  lines:[{coords:[[-95.05,18.4],[-94.9,18.1],[-94.76,17.75]],kind:"dash"}],
  pins:[P([-94.04,18.1],"La Venta"),P([-95.05,18.45],"Tuxtla mountains: the basalt"),P([-94.66,17.5],"El Manatí: rubber balls")],
  phPins:[ph([-94.76,17.75],"San Lorenzo: a colossal head (copy)","OLMEC")],
  stat:"Over 3,000 years ago, the Olmecs were making bouncing rubber balls, and carving stone heads that weigh many tonnes",
  body:"In the wet lowlands of Mexico’s Gulf coast, the Olmecs built the first great civilisation of Mesoamerica, from about 1400 BC. They hauled basalt boulders from the Tuxtla mountains, dozens of kilometres away (dashed), to carve 17 known colossal heads, probably portraits of their rulers.",
  more:"“Olmec” is an Aztec word meaning “rubber people”. They mixed latex from rubber trees with the juice of a morning-glory vine to make balls that bounced, and the ball game they played spread across Mesoamerica."});
 ins("hnamerica","The Louisiana Purchase",{title:"The canal that made New York",sub:"1815/usa",view:[-86,37,-68,47],globe:[-76,42,4],
  lines:[{coords:[[-78.88,42.89],[-78.0,43.15],[-77.61,43.16],[-76.15,43.05],[-75.23,43.1],[-74.86,43.04],[-74.2,42.85],[-73.75,42.65]],kind:"flow"},{coords:[[-73.75,42.65],[-73.95,41.7],[-74,40.71]],kind:"flow"}],
  pins:[P([-78.88,42.89],"Buffalo, on Lake Erie"),P([-73.75,42.65],"Albany, on the Hudson"),P([-74.86,43.04],"Little Falls: the gap"),P([-75.17,39.95],"Philadelphia"),P([-71.06,42.36],"Boston")],
  phPins:[ph([-78.69,43.17],"Lockport: the canal’s locks, 1830s","ERIE")],
  stat:"When the Erie Canal opened in 1825, the cost of shipping goods from the Great Lakes to New York fell by about 90%",
  body:"The Appalachian mountains walled off the Atlantic coast from the interior, but the Mohawk Valley was the one low gap through them. A canal 584 km long through it linked Lake Erie to the Hudson River (arrows). Midwestern grain now flowed east through New York, which overtook Philadelphia and Boston to become America’s greatest city.",
  more:"Critics mocked it as “Clinton’s Ditch”, after the governor who pushed it. Towns along its route, such as Buffalo, Rochester and Syracuse, boomed."});
}

/* =====================================================================================================
   The history of South America
   ===================================================================================================== */
function hsamerica(){
 rename("hsamerica","Sugar and slavery","Brazil’s sugar coast");
 set("hsamerica","The silver mountain",{
  more:"Indigenous men were forced to work in the mines under a system called the mita, and many thousands died. At about 4,000 m, Potosí was one of the highest big cities on Earth: food and firewood all had to be hauled up by llama. In Spanish, “vale un Potosí”, “it’s worth a Potosí”, still means something is priceless."});
 ins("hsamerica","Monte Verde",{title:"Mummies older than Egypt’s",sub:"bc5000",view:[-82,-30,-60,-10],globe:[-70,-19,4],
  pins:[P([-70.15,-19.0],"Camarones valley"),P([-70.4,-23.65],"Antofagasta")],
  phPins:[ph([-70.32,-18.48],"Arica: a Chinchorro mummy","CHINCHORRO")],
  stat:"The Chinchorro people of the Atacama coast were mummifying their dead about 7,000 years ago, roughly 2,000 years before Egypt",
  body:"These fishing people took bodies apart, rebuilt them with sticks, reeds and clay, added wigs and painted masks, and coated them black or red. Unlike in Egypt, they did this for everyone, even babies. In one of the driest deserts on Earth, hundreds have survived.",
  more:"Arsenic in the local water may have caused many stillbirths and child deaths, and one theory is that grief over them inspired the practice. The sites became a World Heritage Site in 2021."});
 ins("hsamerica","Bolivia loses the sea",{title:"The rubber boom",sub:"1900",view:[-82,-25,112,56],globe:[-30,10,1],
  lines:[{coords:[[-54.7,-2.43],[-48,0],[-35,10],[-20,30],[-8,45],[-0.29,51.48]],kind:"flow"},{coords:[[-0.29,51.48],[-8,40],[-18,20],[-15,0],[10,-30],[20,-36],[45,-25],[70,-5],[79.86,6.93],[95,5],[103.8,1.35]],kind:"flow"}],
  pins:[P([-54.7,-2.43],"Santarém: seeds taken, 1876"),P([-0.29,51.48],"Kew Gardens, London"),P([79.86,6.93],"Ceylon"),P([103.8,1.35],"Singapore")],
  phPins:[ph([-60.02,-3.13],"Manaus: the Teatro Amazonas","Noite no Teatro Amazonas (cropped).jpg")],
  stat:"Rubber money built an opera house deep in the Amazon, and smuggled seeds wiped out the boom",
  body:"The best rubber trees grew wild only in the Amazon, so as bicycles and then cars spread, the river port of Manaus grew rich, and in 1896 it opened an opera house built with European marble and glass. But in 1876 a Briton, Henry Wickham, had shipped about 70,000 rubber seeds to London (arrows). Their seedlings started plantations in British Asia, and by about 1913 these were outselling the Amazon.",
  more:"Tappers collecting the rubber, many of them Indigenous people, were often worked in brutal conditions. In 1928 Henry Ford built an American-style town in the Amazon, Fordlândia, to grow rubber, but leaf blight killed his tightly packed trees. Long before, in 1542, the Spanish explorer Orellana described crowded towns along the Amazon; nobody believed him, but laser scans from planes have since found towns with causeways and reservoirs hidden under the forest of Bolivia."});
 TQ("hsamerica",q=>{[].concat(q.mid||[],q.recap||[]).forEach(x=>{if(x.st==="Sugar and slavery")x.st="Brazil’s sugar coast";if(x.at==="Sugar and slavery")x.at="Brazil’s sugar coast"})});
}

/* =====================================================================================================
   The history of Oceania
   ===================================================================================================== */
function hoceania(){
 rename("hoceania","War in the Pacific","Bombs on Darwin");
 rename("hoceania","Gallipoli","The Anzac legend");
 set("hoceania","The Anzac legend",{
  stat:"Every 25 April, Australians and New Zealanders gather at dawn to remember a landing that failed",
  body:"On 25 April 1915, Australian and New Zealand troops, the ANZACs, sailed from Albany, trained in Egypt and landed at Gallipoli, in Ottoman Turkey; after eight months they withdrew. The defeat became a founding story for both young countries. Anzac Day dawn services, held at the hour of the landing, now draw huge crowds at home and at Anzac Cove itself.",
  more:"About 8,700 Australians and 2,800 New Zealanders died there, and far more Ottoman soldiers. Words carved at Anzac Cove in 1985 and credited to Atatürk tell the mothers of the fallen that “there is no difference between the Johnnies and the Mehmets”; historians doubt he ever said them, but they are read at the services every year."});
 set("hoceania","Captain Cook",{
  stat:"A Tahitian navigator, Tupaia, guided Cook’s ship and spoke for him with the Māori",
  body:"Cook came to Tahiti in 1769 to watch Venus cross the Sun. Tupaia, a priest and navigator from Raiatea, joined the Endeavour, drew from memory a chart of about 70 islands, and in New Zealand could talk with Māori, whose language was close to his own. In 1770 Cook charted Australia’s east coast and claimed it for Britain.",
  more:"At Botany Bay two Gweagal men stood on the shore and tried to warn the strangers off; Cook’s men fired on them and took their spears, four of which a Cambridge college handed back to the La Perouse Aboriginal community in 2024. Tupaia died of disease in Batavia later in 1770."});
 ins("hoceania","Voyagers of the open Pacific",{title:"Maps made of sticks",sub:"1880",view:[155,-2,178,16],globe:[169,8,4],
  pins:[P([167.73,8.72],"Kwajalein"),P([165.37,11.6],"Bikini"),P([169.6,5.92],"Jaluit")],
  phPins:[ph([171.38,7.09],"Majuro: a stick chart","(Marshall Islands stick chart, Meddo type). LOC 2010586181.jpg")],
  stat:"Marshall Islands navigators mapped ocean swells with sticks tied together, and shells for islands",
  body:"The Marshalls are scattered rings of coral only a metre or two above the sea, invisible until you are almost on them. But islands bend and bounce the ocean swells, which a skilled navigator could feel through the hull of a canoe. Marshallese navigators made charts of these swell patterns from palm ribs and shells, memorised them on land and did not carry them at sea.",
  more:"Navigators kept the charts secret, passing them on only within families. They are one of the few kinds of map anywhere that show waves, not land."});
 ins("hoceania","The Treaty of Waitangi",{title:"Gold and the Eureka Stockade",sub:"1850/brit",view:[128,-46,158,-24],globe:[144,-37,4],
  pins:[P([144.28,-36.76],"Bendigo"),P([144.96,-37.81],"Melbourne"),P([143.65,-36.78],"Moliagul: the Welcome Stranger, 1869")],
  iconPins:[ic([143.85,-37.56],"gold","#c99a1a")],
  phPins:[ph([143.85,-37.56],"Ballarat: the Eureka flag","EUREKA")],
  stat:"Gold found in 1851 nearly tripled Australia’s population in ten years",
  body:"Gold strikes near Ballarat and Bendigo brought people from Britain, Ireland, America and China. Miners angry at costly licences and police raids built a wooden stockade at Eureka in 1854. Soldiers stormed it and about 30 people died, most of them miners, but within a year the miners had won the vote.",
  more:"The Welcome Stranger, found in 1869, was one of the largest gold nuggets ever found, about 70 kg. Fear of Chinese miners fed the later “White Australia” policy."});
 ins("hoceania","Women vote first",{title:"A kingdom overthrown",sub:"1880/n:Kingdom of Hawaii",view:[-163,17,-152,24],globe:[-157.5,20.5,5],
  pins:[P([-155.5,19.6],"Hawaiʻi, the Big Island")],
  phPins:[ph([-157.86,21.31],"Honolulu: ʻIolani Palace","IOLANI")],
  stat:"Hawaii’s royal palace had electric lights before the White House did",
  body:"Kamehameha united the islands into one kingdom by 1810. Later in the century, American sugar planters grew powerful, and in 1893, backed by US marines, they overthrew Queen Liliʻuokalani. The US annexed Hawaii in 1898, and it became the 50th state in 1959.",
  more:"ʻIolani Palace is the only royal palace in the US. In 1993 Congress formally apologised for the overthrow."});
 ins("hoceania","Bombs on Darwin",{title:"The cult of John Frum",sub:"1945",view:[158,-24,176,-10],globe:[168,-17,4],
  pins:[P([169.5,-19.52],"Sulphur Bay"),P([167.17,-15.51],"Espiritu Santo: a big US base"),P([168.32,-17.73],"Port Vila")],
  phPins:[ph([169.44,-19.53],"Tanna: Mount Yasur, above Sulphur Bay","Lava trails at Mount Yasur Volcano, Tanna, Vanuatu (49181693888).jpg")],
  stat:"On one Pacific island, villagers raise the US flag every 15 February for “John Frum”, a figure who may never have been a real person",
  body:"On Tanna, a movement grew from the late 1930s around John Frum, a figure said to promise wealth and freedom from missionaries and colonial rule. When American troops arrived in Vanuatu, then the New Hebrides, during World War II with seemingly endless cargo, the movement grew. Followers still march with bamboo “rifles” on John Frum Day.",
  more:"Another village on Tanna honoured Britain’s Prince Philip as a spirit of the island, and mourned him when he died in 2021."});
 TQ("hoceania",q=>{[].concat(q.mid||[],q.recap||[]).forEach(x=>{["at","st"].forEach(k=>{if(x[k]==="War in the Pacific")x[k]="Bombs on Darwin";if(x[k]==="Gallipoli")x[k]="The Anzac legend"})})});
}

/* =====================================================================================================
   The history of Antarctica (relief map)
   ===================================================================================================== */
function hantarctica(){
 set("hantarctica","Reading the ice",{
  stat:"In 2025 drillers pulled up Antarctic ice at least 1.2 million years old: the longest unbroken record of Earth’s climate",
  body:"Snow piles up year after year and turns to ice, trapping tiny bubbles of air: samples of the air itself. Move along the chart: the ice sheet rises to about 3,500 m at Vostok. Near Dome C, a European team drilled 2.8 km down to ice older than any cored before.",
  more:"The cores show that carbon dioxide is now far higher than at any time in the last 800,000 years. Vostok station, built by the Soviet Union in 1957, recorded the coldest air ever measured, −89.2 °C, in 1983. Russian drillers reached the lake hidden under it in 2012.",
  pins:[P([122.5,-75.3],"Little Dome C: the 1.2-million-year core")]});
 ins("hantarctica","Race to the Pole",{title:"Fossils on the sledge",view:[-180,-90,180,-70],globe:[170,-83,3],flatViewW:[140,-90,220,-72],
  lines:[{coords:[[160,-89.9],[163,-86],[171,-83.5],[169,-80],[169.5,-79.6]],kind:"red"}],
  pins:[P([170,-84],"Beardmore Glacier: the fossils"),P([169.5,-79.6],"Scott’s last tent, March 1912"),P([166.4,-77.6],"Ross Island")],
  phPins:[ph([175,-84.5],"Glossopteris root, fossil from Antarctica","GLOSSO")],
  stat:"Scott’s dying team kept hauling 16 kg of rocks, and those rocks proved Antarctica was once warm",
  body:"On the way back from the Pole, Scott’s men collected rocks near the Beardmore Glacier and dragged them on their sledge to the end. They held fossils of Glossopteris, a seed fern also found in India, Africa, South America and Australia: evidence that these lands had once been joined in one great southern continent, Gondwana.",
  more:"Antarctica drifted over the South Pole over many millions of years, and froze over only about 34 million years ago. Coal seams and dinosaur bones have since been found there too."});
 ins("hantarctica","A continent for science",{title:"Babies for a claim",view:[-100,-90,-10,-55],globe:[-58,-70,2.2],
  lines:[{coords:[[-25,-60],[-25,-89.9]],kind:"dash"},{coords:[[-74,-60],[-74,-89.9]],kind:"dash"},{coords:[[-53,-60],[-53,-89.9]],kind:"amber"},{coords:[[-90,-60],[-90,-89.9]],kind:"amber"},{coords:[[-20,-60],[-20,-89.9]],kind:"red"},{coords:[[-80,-60],[-80,-89.9]],kind:"red"}],
  pins:[P([-58.97,-62.2],"Villa Las Estrellas (Chile)"),P([-25,-62],"Argentina’s claim"),P([-90,-63],"Chile’s claim"),P([-80,-74],"Britain’s claim")],
  phPins:[ph([-56.99,-63.4],"An Argentine base on the Peninsula","ESPERANZA")],
  stat:"In 1978 Argentina flew a pregnant woman to Antarctica so that the first baby born there would be Argentine",
  body:"Argentina (blue dashes), Chile (amber) and Britain (red) all claim the Antarctic Peninsula, and their wedges overlap. Argentina tried to strengthen its claim with families: Emilio Palma was born at Esperanza Base on 7 January 1978. Chile answered with its own baby in 1984. Under the 1959 treaty, none of this changes any claim.",
  more:"Eleven babies have been born in Antarctica, all Argentine or Chilean. Earlier, in 1939, a German expedition dropped metal darts marked with swastikas from planes to claim a slice of the ice; nothing came of it."});
}

/* =====================================================================================================
   Explorers (relief map)
   ===================================================================================================== */
function explorers(){
 drop("explorers","Top and bottom");
 set("explorers","Race to the poles",{
  body:"Amundsen’s Norwegian team reached the South Pole on 14 December 1911. Who first reached the North Pole is still argued about.",
  more:"Robert Peary, Matthew Henson and four Inuit men said they reached the North Pole in 1909, but their records don’t quite add up, and a rival, Frederick Cook, claimed 1908. In 1926 Amundsen flew over the North Pole in the airship Norge, the first visit to it that no one disputes."});
 ins("explorers","Out of Africa",{title:"The man nobody believed",view:[-40,30,30,72],globe:[-5,52,1.8],
  lines:[{coords:[[5.37,43.3],[3,41],[-1,37.5],[-5.6,36],[-9.5,37],[-9.6,41],[-9,43.5],[-5,48.4],[-5.6,50],[-5.5,53],[-6,55.6],[-5,58.6],[-3,59.2]],kind:"dash"},{coords:[[-3,59.2],[-8,62],[-18,64.5]],kind:"dash",dim:true},{coords:[[-3,59.2],[2,61],[6,62.5]],kind:"dash",dim:true}],
  pins:[P([-5.6,50.1],"Cornwall: the tin trade"),P([-18,64.8],"Thule? Iceland"),P([6,62.7],"Thule? Norway")],
  phPins:[ph([5.37,43.3],"Marseille: Pytheas’s statue","PYTHEAS")],
  stat:"About 2,300 years ago a Greek sailor from Marseille described the midnight sun and a frozen sea, and was called a liar",
  body:"Around 325 BC Pytheas sailed out past Gibraltar, round Britain and north to a land he called Thule (dashed: one likely route). There, he said, the sun barely set in summer, and the sea turned into something like jelly. Later Greek writers mocked him, because the far north they imagined could not be like that.",
  more:"His book is lost; we know it only from the writers who sneered at it. Thule may have been Iceland or Norway, and “Ultima Thule” came to mean the edge of the world."});
 ins("explorers","The man nobody believed",{title:"The envoy who opened the Silk Road",view:[24,20,122,54],globe:[85,39,2],
  gfEmpire:[{y:-119,gk:"chn",name:"Han China"},{y:-119,gk:"xiong",name:"Xiongnu",col:"#7a5a3a"}],
  lines:[{coords:[[108.94,34.27],[103.8,36.06],[100.4,38.9],[94.66,40.14],[89,42.9],[82,41.5],[75.99,39.47],[71.5,40.5],[67,39.65],[66.9,36.76]],kind:"flow"},{coords:[[66.9,36.76],[73,37.6],[80,37.1],[88,38.5],[94.66,40.14]],kind:"dash"}],
  pins:[P([108.94,34.27],"Chang’an, about 138 BC"),P([71.5,40.5],"Ferghana: the “heavenly horses”"),P([66.9,36.76],"Bactria")],
  phPins:[ph([94.66,40.14],"Dunhuang: Zhang Qian takes leave of the emperor","ZHANGQIAN")],
  stat:"China’s first envoy to the West was captured, held for ten years, married, escaped and kept going",
  body:"In about 138 BC the Han emperor sent Zhang Qian west to find allies against the Xiongnu horsemen (brown). They captured him, but after about ten years, and a Xiongnu wife, he escaped and reached Ferghana and Bactria in Central Asia. Captured again on the way back (dashed), he came home 13 years after setting out, with one of his roughly 100 companions.",
  more:"He told of tall “heavenly horses” in Ferghana; the emperor later sent armies to get them. The routes Zhang Qian opened became the Silk Road."});
 ins("explorers","Captain Cook",{title:"The first woman to sail round the world",view:W,globe:[-40,-15,1],
  lines:[{coords:[[-4.49,48.39],[-15,30],[-30,0],[-43.17,-22.91],[-56,-35],[-67,-50],[-70.9,-53.5],[-80,-45],[-110,-25],[-149.5,-17.6],[-175,-14],[160,-10],[150,-4],[130,-3],[106.8,-6.2],[80,-15],[57.5,-20.2]],kind:"flow"}],
  pins:[P([-149.5,-17.6],"Tahiti, 1768"),P([57.5,-20.2],"Mauritius: left behind"),P([-4.49,48.39],"Brest, 1766")],
  phPins:[ph([-43.17,-22.91],"Jeanne Baret, dressed as a sailor","BARET")],
  stat:"The first woman known to sail round the world did it disguised as a man",
  body:"In 1766 Jeanne Baret joined the French expedition of Louis-Antoine de Bougainville as the assistant to its botanist, dressed as a man named Jean. She collected thousands of plant specimens along the way; in Brazil they found the bright vine now called bougainvillea.",
  more:"Her secret came out in the Pacific, and she was left behind on Mauritius with the botanist. She reached France in about 1775, completing the circle. A plant was named after her in 2012."});
 ins("explorers","Lewis and Clark",{title:"The lost Franklin expedition",view:[-140,58,-50,80],globe:[-95,72,2.6],
  lines:[{coords:[[-60,72],[-70,74],[-80,74.2],[-91.8,74.7],[-95.5,73],[-97,71],[-98.6,70.1]],kind:"dash"}],
  pins:[P([-91.8,74.7],"Beechey Island: first winter"),P([-98.6,70.1],"Trapped in the ice, 1846"),P([-98.87,68.24],"Erebus found, 2014"),P([-98.8,68.95],"Terror found, 2016")],
  phPins:[ph([-80,74.3],"HMS Erebus and Terror","H.M. Ships Erebus and Terror in the Ross Sea (by John Edward Davis).jpg")],
  stat:"All 129 men of Franklin’s Arctic expedition died, and Inuit stories led searchers to the wrecks about 170 years later",
  body:"In 1845 Britain sent two ships, Erebus and Terror, to find the Northwest Passage over the top of Canada. They got stuck in the sea ice off King William Island, and every man died. For over a century, searchers who ignored Inuit accounts found little.",
  more:"Guided by Inuit oral history, searchers found Erebus in 2014. Terror was found in 2016, after an Inuk hunter told them he had seen a mast sticking out of the ice years before."});
}

/* =====================================================================================================
   Medieval empires (rework)
   ===================================================================================================== */
function hmedieval(){
 drop("hmedieval","Great Zimbabwe");             /* the Africa history tour tells it */
 drop("hmedieval","Zheng He’s treasure fleets"); /* the Explorers tour tells it */
 set("hmedieval","Vikings across the Atlantic",{
  stat:"Iceland’s chiefs began meeting in 930 at the Althing, one of the oldest parliaments in the world",
  body:"From the 790s Norse seafarers raided and traded from Scandinavia. They settled empty Iceland from about 874, and with no king there, its chiefs met each summer in an open-air assembly, the Althing, in a rift valley at Þingvellir, to make laws and settle feuds.",
  more:"From Iceland they sailed on to Greenland from about 985, and to Newfoundland, where wood cut with metal tools has been dated to 1021. The Norse in Greenland held on for about 450 years, then vanished in the 1400s.",
  phPins:[ph([-21.12,64.26],"Þingvellir: where the Althing met","Thingvellir, Iceland (21677114683).jpg"),{at:[-55.53,51.6],label:"L’Anse aux Meadows, about 1021",col:OR,icon:"photo"}]});
 set("hmedieval","Angkor",{
  more:"Its kings ruled what is now Cambodia and parts of Thailand, Laos and Vietnam (pale). Reservoirs like this one are why Angkor could feed so many people; why it was abandoned is told in the Asia history tour."});
 set("hmedieval","Mansa Musa’s Mali",{
  stat:"The medieval empire of Ghana lay about 800 km north-west of today’s Ghana",
  body:"West Africa’s gold built two great empires. First came Ghana, whose name the modern country took in 1957 although the two never overlapped; then Mali, which by the 1300s stretched from the Atlantic coast to beyond the bend of the Niger. Replay the map from 1000 to 1300. On his pilgrimage to Mecca in 1324, Mansa Musa gave away so much gold that its price in Cairo fell.",
  sub:"1300/mali",histAnim:["1000","1100","1200","1300"],histAnimLabel:"↻ Replay Ghana to Mali"});
 ins("hmedieval","The Arab conquests and Baghdad",{title:"The kingdom of the strait",sub:"1000/n:Srivijaya Empire",view:[78,-14,124,24],globe:[103,2,2.6],
  lines:[{coords:[[80.3,13.1],[88,9],[95,6.5],[100,3.2],[103,1.2],[104.76,-2.99]],kind:"flow"},{coords:[[104.76,-2.99],[106,-1],[108,4],[110,12],[113.26,23.13]],kind:"flow"},{coords:[[104.76,-2.99],[105.8,-6]],kind:"flow"}],
  pins:[P([100.8,2.6],"Strait of Malacca"),P([105.8,-6],"Sunda Strait"),P([79.84,10.78],"The Cholas, raiders in 1025"),P([113.26,23.13],"Guangzhou")],
  phPins:[ph([104.76,-2.99],"Palembang: a Srivijaya inscription, 684","SRIVIJAYA")],
  stat:"For about 600 years, a Sumatran kingdom grew rich by controlling the sea lane between India and China",
  body:"Ships sailing between China and India rode the monsoon winds, which reverse with the seasons, so they had to wait in the Malacca and Sunda straits for the wind to change. Srivijaya, based at Palembang, controlled both straits, taxed the traffic and made its ports the place to wait.",
  more:"In 671 the Chinese monk Yijing stopped there to study Sanskrit, and wrote that over 1,000 monks lived in the city. In 1025 the Chola kings of south India sent a fleet to raid it."});
 ins("hmedieval","Tang China",{title:"Rice from Champa",sub:"1000/chn",view:[96,8,126,38],globe:[113,24,2.8],
  lines:[{coords:[[109.22,13.77],[111,17],[115,21.5],[119.3,26.08]],kind:"flow"},{coords:[[119.3,26.08],[119.5,29],[118.8,32.05]],kind:"flow"}],
  pins:[P([109.22,13.77],"Champa: the fast rice"),P([119.3,26.08],"Fujian"),P([118.8,32.05],"The Yangtze"),P([114.3,34.8],"Kaifeng, the Song capital")],
  stat:"In 1012 a Chinese emperor had fast-ripening rice from Vietnam handed out to farmers, part of a boom that took China past 100 million people",
  body:"Champa rice, from what is now central Vietnam, ripened fast and coped with drought. Emperor Zhenzong had seed sent from Fujian to farmers along the Yangtze and the Huai (arrows), where it helped many fields grow two harvests a year. Under the Song dynasty China’s population passed 100 million, and its cities, paper money and printing boomed.",
  more:"The Song capital Kaifeng may have had about a million people. More food meant more people free to work in trade and crafts, which is how a change in farming can power a whole economy."});
 ins("hmedieval","The Crusades",{title:"Churches carved down into rock",sub:"1279/n:Ethiopia",view:[24,6,52,36],globe:[38,20,2.6],
  lines:[{coords:[[39.04,12.03],[38,16],[36,20],[34.5,25],[34.3,29],[35.2,31.78]],kind:"dash"}],
  pins:[P([35.2,31.78],"Jerusalem: taken by Saladin, 1187"),P([38.72,14.13],"Aksum")],
  phPins:[ph([39.04,12.03],"Lalibela: the church of St George","Lalibela, san giorgio, esterno 24.jpg")],
  stat:"Around 1200, Ethiopians carved 11 churches downward out of solid rock, as a “New Jerusalem”",
  body:"King Lalibela, of Ethiopia’s Zagwe dynasty, had churches cut down into the soft volcanic rock, each one a single piece. After Saladin took Jerusalem in 1187 the pilgrimage there grew harder (dashed), and Lalibela’s churches were meant to be a holy city at home: even a stream there is called the Jordan.",
  more:"The cross-shaped church of St George is cut about 12 m down into the ground. Pilgrims still crowd the churches for Ethiopian Christmas, every January."});
 ins("hmedieval","The Mongol Empire",{title:"Letters on birch bark",sub:"1200/n:Principality of Novgorod",view:[8,50,50,66],globe:[30,58,2.6],
  lines:[{coords:[[31.27,58.52],[29.5,59.9],[24,59.6],[18.3,57.64],[13,54.6],[10.69,53.87]],kind:"flow"}],
  pins:[P([18.3,57.64],"Gotland"),P([10.69,53.87],"Lübeck")],
  phPins:[ph([31.27,58.52],"Novgorod: a birch-bark letter, 1100s","ONFIM")],
  stat:"In medieval Novgorod ordinary people wrote notes on birch bark, and a boy named Onfim doodled himself as a knight",
  body:"Novgorod was a rich trading city of the Russian forests, linked to the Baltic (arrow). Since 1951, archaeologists have dug up over 1,000 letters scratched onto birch bark: shopping lists, debts, love letters and school exercises. The city’s wet clay soil kept out the air and preserved them.",
  more:"Onfim, aged about six or seven, did his alphabet homework around 1260, then drew himself on horseback spearing an enemy. Novgorod was run partly by a town assembly, the veche, and the Mongols never sacked it."});
 ins("hmedieval","The Black Death",{title:"The mud-brick city in the desert",sub:"1400/n:Chimú Empire",view:[-92,-20,-68,2],globe:[-79,-8,3.4],
  pins:[P([-78.0,-7.7],"Andean rivers: canal water")],
  phPins:[ph([-79.07,-8.11],"Chan Chan","Chan chan view1.jpg")],
  stat:"Chan Chan, capital of the Chimú, was the biggest city of the Americas built of mud brick",
  body:"On Peru’s desert coast it almost never rains, so mud brick lasts for centuries. From about 900 AD the Chimú dug canals to bring water from Andean rivers onto the desert, and built a capital of walled palaces covering about 20 km². The Inca conquered them around 1470.",
  more:"Chan Chan is a World Heritage Site in danger: El Niño years bring rare heavy rains that melt its walls."});
 order("hmedieval",["Justinian’s Byzantium","The Arab conquests and Baghdad","The kingdom of the strait","Tang China","Charlemagne","Vikings across the Atlantic","Rice from Champa","Angkor","The Crusades","Churches carved down into rock","The Mongol Empire","Letters on birch bark","Mansa Musa’s Mali","The Black Death","The mud-brick city in the desert","The fall of Constantinople"]);
 TQ("hmedieval",q=>{q.mid=(q.mid||[]).map(x=>x.st==="Vikings across the Atlantic"?{at:"Vikings across the Atlantic",q:"Iceland’s open-air parliament, first held in 930, is called what?",o:["The Duma","The Althing","The Cortes","The Diet"],a:1,why:"Iceland’s chiefs met at the Althing, at Þingvellir, from 930.",st:"Vikings across the Atlantic"}:x)});
}

/* =====================================================================================================
   The age of gunpowder and sea
   ===================================================================================================== */
function hgunpowder(){
 drop("hgunpowder","Round the world");          /* the Explorers tour tells Magellan */
 set("hgunpowder","Round Africa to India",{
  stat:"Within 15 years of da Gama, Portugal held ports from Mozambique to Goa and Malacca, controlling sea lanes with guns on ships",
  body:"Portuguese captains worked their way down Africa’s coast for decades, and in 1498 Vasco da Gama reached Calicut, in India. Trade across the Indian Ocean had been mostly open; the Portuguese brought ships armed with cannon, seized Goa (1510), Malacca (1511) and Hormuz (1515), and made other ships buy passes to trade."});
 set("hgunpowder","1492",{
  stat:"In 1492 three small Spanish ships crossed the Atlantic in about five weeks from the Canary Islands",
  body:"Columbus sailed west looking for a short way to Asia, and reached an island in the Bahamas on 12 October. He made four voyages, and died in 1506 insisting he had reached the Indies."});
 set("hgunpowder","Japan closes its doors",{
  stat:"After 1600 Japan’s shoguns kept the peace for over 250 years, and their capital Edo grew to about a million people",
  more:"Only Chinese and Dutch traders could trade, at Nagasaki. Edo, the shogun’s capital, grew to about a million people, one of the largest cities in the world, partly because every lord had to spend every other year there."});
 ins("hgunpowder","The Columbian exchange",{title:"Where “china” was made",sub:"1600/chn",view:[-25,-42,125,58],globe:[60,15,1],
  lines:[{coords:[[117.18,29.27],[116,26],[113.55,22.2]],kind:"flow"},{coords:[[113.55,22.2],[108,12],[101,2.7],[95,5],[80,6],[60,-10],[40,-30],[20,-36],[0,-15],[-15,15],[-15,35],[-9.14,38.71],[4.9,52.37]],kind:"flow"}],
  pins:[P([117.25,29.4],"Gaoling hill: kaolin"),P([113.55,22.2],"Macau"),P([4.9,52.37],"Amsterdam"),P([13.47,51.16],"Meissen, 1710")],
  stat:"Europe couldn’t make porcelain for centuries, and learned how only after a king locked up an alchemist",
  body:"Jingdezhen sat near deposits of a fine white clay, kaolin, named after a nearby hill, Gaoling. Fired very hot, it made thin, hard, white porcelain. Portuguese and then Dutch ships carried millions of pieces to Europe (arrows), where it was simply called “china”.",
  more:"Around 1708, Johann Böttger, an alchemist held by Saxony’s ruler because he had claimed he could make gold, worked out the secret instead. The Meissen factory opened in 1710."});
 ins("hgunpowder","Silver and the Manila galleons",{title:"The guns that crossed the Sahara",sub:"1530/songhai",view:[-22,6,16,36],globe:[-4,22,2.6],
  lines:[{coords:[[-7.99,31.63],[-6,29],[-5,26],[-4.98,23.6],[-3.5,20],[-1.5,17.5],[-0.2,16.6]],kind:"flow"}],
  pins:[P([-7.99,31.63],"Marrakesh"),P([-0.2,16.6],"Tondibi, 1591"),P([-3,16.77],"Timbuktu")],
  iconPins:[ic([-0.2,16.6],"swords")],
  phPins:[ph([-0.04,16.29],"Gao: the Tomb of Askia, Songhai’s ruler","ASKIA")],
  stat:"In 1591 a Moroccan army with guns crossed the Sahara and destroyed Songhai, West Africa’s largest empire",
  body:"Morocco wanted the gold and salt trade that Songhai (shaded) controlled. Its sultan sent about 4,000 men, many of them musketeers, on a march of months across the desert (arrow). At Tondibi, near Gao, their guns routed a much larger Songhai army armed with spears, bows and cavalry.",
  more:"Songhai is said to have driven a herd of cattle at the Moroccans, but the gunfire turned the cattle back. The Moroccan commander, Judar Pasha, had been born in Spain."});
 ins("hgunpowder","The guns that crossed the Sahara",{title:"Turtle ships",sub:"1600/n:Korea",view:[118,30,142,43],globe:[129,36,3.6],
  lines:[{coords:[[129.87,33.53],[129.04,35.1],[128.6,35.87],[127.5,36.8],[126.98,37.57],[126.3,38.5],[125.75,39.03]],kind:"red"},{coords:[[127.66,34.76],[128.1,34.8],[128.48,34.77]],kind:"flow"}],
  pins:[P([129.87,33.53],"Nagoya: Hideyoshi’s base"),P([129.04,35.1],"Busan: the landing, 1592"),P([125.75,39.03],"Pyongyang"),P([128.48,34.77],"Hansan Island, 1592")],
  iconPins:[ic([128.48,34.77],"ship","#2a78d0")],
  phPins:[ph([129.87,33.53],"Nagoya museum: models of a turtle ship and a Japanese warship","TURTLE")],
  stat:"When Japan invaded Korea in 1592, Admiral Yi Sun-sin beat its navy with ships whose roofs were covered in spikes",
  body:"Japan’s ruler Hideyoshi sent a huge army, well armed with muskets copied from the Portuguese, to conquer Korea and then China. On land it swept north (red). But Yi’s fleet, led by armoured “turtle ships”, wrecked Japan’s supply ships off the south coast, and the invasion stalled.",
  more:"Yi was killed in his last battle, in 1598, and is said to have ordered: “Don’t let them know I am dead.” Whether the turtle ships were plated with iron is still argued over."});
 order("hgunpowder",["The Ottomans at their height","Safavids and Mughals","Round Africa to India","1492","The Columbian exchange","Aztecs and Inca fall","Where “china” was made","Silver and the Manila galleons","The guns that crossed the Sahara","Turtle ships","The Atlantic slave trade","The Dutch East India Company","Japan closes its doors","Qing China","Russia across Siberia"]);
 TQ("hgunpowder",q=>{q.recap=(q.recap||[]).map(x=>x.st==="Round the world"?{q:"Whose fleet, led by armoured “turtle ships”, stopped Japan’s navy in 1592?",o:["Zheng He’s","Admiral Yi Sun-sin’s","Hideyoshi’s","Vasco da Gama’s"],a:1,why:"Yi’s fleet wrecked Japan’s supply ships, and the invasion of Korea stalled.",st:"Turtle ships"}:
  x.st==="Japan closes its doors"?{q:"Which battle in 1600 made the Tokugawa family masters of Japan?",o:["Tondibi","Sekigahara","Hansan","Chaldiran"],a:1,why:"After Sekigahara, Tokugawa Ieyasu became shogun, and his family ruled for over 250 years.",st:"Japan closes its doors"}:x)});
}

/* =====================================================================================================
   Revolutions and industry
   ===================================================================================================== */
function hrevolutions(){
 drop("hrevolutions","Coast to coast by rail");  /* the North America history tour tells it */
 set("hrevolutions","The Scramble for Africa",{
  stat:"Quinine against malaria, steamships up rivers and the machine gun let Europe take almost all of Africa in about 30 years",
  body:"In 1870 Europe ruled about a tenth of Africa, mostly coasts: malaria killed so many Europeans that West Africa was called the “white man’s grave”. Then quinine, from the bark of a South American tree, cut the death rate, steamships carried soldiers far up the rivers, and the machine gun let small armies beat large ones. At the Berlin Conference of 1884–85, with no Africans invited, the powers set rules for sharing out the continent. Replay the map from 1880 to 1914.",
  more:"An English poet, Hilaire Belloc, summed it up in 1898: “Whatever happens, we have got / The Maxim gun, and they have not.” Ethiopia kept its freedom by crushing an Italian army at Adwa in 1896, partly with modern rifles of its own, and Liberia stayed independent too.",
  histAnimLabel:"↻ Replay 1880 to 1914"});
 ins("hrevolutions","The Opium Wars",{title:"The great tea theft",sub:"1850/chn",view:[66,12,126,40],globe:[100,26,2.2],
  lines:[{coords:[[117.68,27.72],[119.3,26.08],[121.47,31.23]],kind:"flow"},{coords:[[121.47,31.23],[118,24],[114.17,22.3],[108,12],[101,2.7],[95,8],[88.36,22.57],[88.26,27.04]],kind:"flow"},{coords:[[88.36,22.57],[83,25.3],[79.5,29.4]],kind:"flow"}],
  pins:[P([117.68,27.72],"Wuyi Mountains: the tea districts"),P([121.47,31.23],"Shanghai"),P([88.36,22.57],"Calcutta"),P([79.5,29.4],"Kumaon: the new gardens")],
  stat:"In 1848 a Scottish botanist, disguised as a Chinese official, smuggled about 20,000 tea plants out of China",
  body:"Britain bought huge amounts of tea from China and wanted its own supply. Robert Fortune shaved his head, wore Chinese clothes and visited tea districts closed to foreigners. He shipped seedlings, seeds and skilled Chinese tea workers to the Himalayan foothills of British India (arrows).",
  more:"He moved the plants in sealed glass cases that kept them alive at sea. India became the world’s second-biggest tea producer, and many of its early tea gardens grew from his Chinese plants."});
 ins("hrevolutions","The great tea theft",{title:"The year of revolutions",sub:"1850",view:[-12,34,30,58],globe:[10,47,2.6],
  lines:[{coords:[[13.36,38.12],[9,41],[5,44],[2.35,48.86]],kind:"flow"},{coords:[[2.35,48.86],[8,48.5],[16.37,48.21]],kind:"flow"},{coords:[[2.35,48.86],[8,51],[13.4,52.52]],kind:"flow"},{coords:[[16.37,48.21],[19.04,47.5]],kind:"flow"},{coords:[[16.37,48.21],[12,46.5],[9.19,45.46]],kind:"flow"}],
  pins:[P([13.36,38.12],"Palermo, 12 January"),P([2.35,48.86],"Paris, February"),P([16.37,48.21],"Vienna, 13 March"),P([13.4,52.52],"Berlin, 18 March"),P([9.19,45.46],"Milan, 18 March"),P([19.04,47.5],"Pest, 15 March")],
  stat:"In 1848 revolutions broke out in dozens of European cities within weeks, and in Italian “a 48” still means chaos",
  body:"A revolt in Palermo in January spread to Paris in February, then to Vienna, Berlin, Milan, Budapest and beyond (arrows), carried by newspapers, railways and the telegraph. People wanted votes, constitutions and nations of their own. Almost all of the revolutions were crushed within a year.",
  more:"Some changes stuck: Austria freed its serfs, and France gave the vote to all men. The Communist Manifesto came out the same February."});
 ins("hrevolutions","The year of revolutions",{title:"The law of bird droppings",sub:"1850/n:Peru",view:[-96,-30,-56,4],globe:[-77,-13,3],
  lines:[{coords:[[-82,-30],[-79,-20],[-78,-12],[-80,-4]],kind:"dash"}],
  pins:[P([-77.04,-12.05],"Lima"),P([-81,-25],"Cold, fish-rich current")],
  phPins:[ph([-76.4,-13.64],"Chincha Islands: loading guano, 1860s","GUANO")],
  stat:"Under a US law of 1856, Americans could claim any unclaimed island covered in bird droppings, and some are still US territory",
  body:"Off Peru, a cold current (dashed) brings up water rich in nutrients and huge shoals of fish, which feed millions of seabirds, and it almost never rains to wash their droppings away. On the Chincha Islands guano piled up tens of metres deep, and it became the best fertiliser of the age, feeding Europe’s farms and the industrial cities. Peru’s government lived off it for decades.",
  more:"America’s Guano Islands Act led to claims on about 100 islands. A few in the Pacific and the Caribbean, such as Baker, Howland and Navassa, are still US territories because of it."});
 ins("hrevolutions","The law of bird droppings",{title:"War in America, cotton in Egypt",sub:"1850/n:Egypt",view:[-96,14,42,60],globe:[-25,36,1.4],
  lines:[{coords:[[-90.07,29.95],[-80,27],[-60,35],[-30,45],[-10,50],[-2.98,53.4]],kind:"dash"},{coords:[[29.92,31.2],[20,34],[5,37],[-6,36],[-10,44],[-6,50],[-2.98,53.4]],kind:"flow"}],
  pins:[P([29.92,31.2],"Alexandria: cotton for Lancashire"),P([-90.07,29.95],"New Orleans: blockaded, 1861"),P([-2.24,53.48],"Manchester: mills short of cotton"),P([32.3,30.6],"The Suez Canal")],
  stat:"The US Civil War cut Britain off from Southern cotton, so Egypt planted it everywhere and ended up under British rule",
  body:"In 1861 the Union blockaded the South’s ports (dashed), and Lancashire’s mills ran short of cotton, putting hundreds of thousands out of work. Prices soared, and Egypt’s ruler pushed farmers in the Nile Delta to grow cotton (arrow). When the war ended, prices crashed, Egypt fell deep into debt and sold its Suez Canal shares to Britain in 1875. In 1882 British troops occupied the country.",
  more:"Many Lancashire workers backed the North anyway, and Abraham Lincoln wrote to thank the working men of Manchester. A statue of him stands in the city."});
 order("hrevolutions",["American independence","The French Revolution","Haiti","Latin America breaks free","The Industrial Revolution","The Opium Wars","The great tea theft","The year of revolutions","The law of bird droppings","War in America, cotton in Egypt","The Suez Canal","Meiji Japan","The Scramble for Africa","The great migrations","The world in 1914"]);
}

/* =====================================================================================================
   The World Wars
   ===================================================================================================== */
function hwars(){
 ins("hwars","Four empires fall",{title:"Why “Spanish” flu?",sub:"1919",view:[-112,-12,40,62],globe:[-35,35,1.2],
  pins:[P([-3.7,40.42],"Madrid: news without censors"),P([-4.49,48.39],"Brest"),P([-13.23,8.48],"Freetown"),P([-71.06,42.36],"Boston: the deadly second wave, August 1918")],
  phPins:[ph([-96.78,39.07],"Camp Funston, Kansas: a flu ward, 1918","FLU")],
  stat:"The flu of 1918 was called “Spanish” only because Spain’s newspapers were free to report it",
  body:"Countries at war censored news of the disease to protect morale. Spain was neutral, so its papers reported it freely, especially when the king fell ill, and the world assumed it had started there. Troop ships and trains carried it everywhere; it probably killed about 50 million people worldwide, more than the war itself.",
  more:"Where it really began is still debated; one early outbreak was at an army camp in Kansas in March 1918. In Spain it was called the “French flu”."});
 ins("hwars","Stalingrad",{title:"The line that couldn’t be outflanked",sub:"1938/ita",view:[8,25,36,42],globe:[24,32,3],
  lines:[{coords:[[28.95,30.85],[28.85,30.55],[28.7,30.29]],kind:"red"},{coords:[[14.27,40.85],[13.19,32.9]],kind:"dash"},{coords:[[13.19,32.9],[20.07,32.12],[23.96,32.08],[27.2,31.35],[28.6,30.8]],kind:"dash"}],
  gfRuler:{a:[28.95,30.85],b:[28.7,30.29]},
  pins:[P([27.6,29.6],"Qattara Depression: impassable"),P([23.96,32.08],"Tobruk"),P([29.92,31.2],"Alexandria"),P([13.19,32.9],"Tripoli: fuel from Italy")],
  phPins:[ph([28.98,30.83],"El Alamein: the Commonwealth war cemetery","ALAMEIN")],
  stat:"At El Alamein the desert war stopped where the sea and an impassable depression left a gap only about 60 km wide",
  body:"In the open Western Desert, armies could always swing round each other’s flank. But at El Alamein the Qattara Depression, a huge sunken basin of salt marsh and soft sand, comes within about 60 km of the sea (ruler). In 1942 the British held this gap, and in November their victory there turned the war in North Africa.",
  more:"Rommel’s German and Italian army was also starved of fuel, which had to cross the Mediterranean and then come hundreds of kilometres by road (dashed). Churchill later wrote: “Before Alamein we never had a victory. After Alamein we never had a defeat.”"});
 ins("hwars","War in the Pacific",{title:"The road and the Hump",sub:"1938/jpn",view:[84,14,116,34],globe:[100,25,3],
  lines:[{coords:[[97.75,22.93],[98.07,24.08],[99.17,25.12],[100.23,25.6],[101.5,25.1],[102.71,25.04]],kind:"flow"},{coords:[[95.12,27.48],[98,27.2],[100.3,26.5],[102.71,25.04]],kind:"dash"}],
  pins:[P([97.75,22.93],"Lashio: railhead in Burma"),P([102.71,25.04],"Kunming"),P([95.12,27.48],"Assam: the Hump flights began here"),P([121.47,31.23],"Shanghai, taken 1937")],
  phPins:[ph([98.07,24.08],"Building the Burma Road by hand","BURMAROAD")],
  stat:"When Japan cut China off from the sea, about 200,000 Chinese workers built a 1,100 km mountain road, mostly by hand",
  body:"After 1937 Japan took China’s coast and ports. China’s lifeline became the Burma Road (arrow), winding over the mountains from Burma to Kunming. When Japan closed that too in 1942, Allied pilots flew supplies over the eastern end of the Himalaya, “the Hump” (dashed), one of the most dangerous air routes of the war.",
  more:"Hundreds of planes were lost over the Hump, and their wrecks became landmarks for later pilots. The war in China began in 1937, earlier than in Europe, and killed perhaps 15 to 20 million Chinese."});
}

/* =====================================================================================================
   The Cold War and the end of empires
   ===================================================================================================== */
function hcoldwar(){
 set("hcoldwar","The space race",{
  more:"Soviet rockets flew from Baikonur, now in Kazakhstan; Apollo launched from Cape Canaveral in Florida. Valentina Tereshkova became the first woman in space in 1963. The rockets were close cousins of the missiles built to carry bombs."});
 ins("hcoldwar","NATO and the Warsaw Pact",{title:"A city under the ice",sub:"1960",view:[-112,62,-18,84],globe:[-55,76,3],
  pins:[P([-68.7,76.53],"Thule Air Base")],
  phPins:[ph([-61.13,77.17],"Camp Century: a tunnel being roofed","CAMPCENTURY")],
  stat:"In 1959 the US Army built a nuclear-powered base in tunnels under Greenland’s ice",
  body:"Camp Century, about 240 km from the US base at Thule, had a portable nuclear reactor and a secret purpose: to test whether missiles could be hidden in tunnels under the ice, within range of the Soviet Union across the Arctic, the shortest way between the two superpowers. The moving ice squeezed the tunnels shut, and it was abandoned in 1967.",
  more:"Its waste was left buried in the ice, which could melt out as the climate warms. Soil from the bottom of a 1966 ice core drilled there, looked at again decades later, held plant fossils: proof that Greenland had been free of ice within the last million years."});
 ins("hcoldwar","The Korean War",{title:"Suez, 1956",sub:"1955",view:[22,24,42,36],globe:[32,30,3.6],
  lines:[{coords:[[34.4,31.3],[33.6,30.8],[32.6,30.5]],kind:"flow"},{coords:[[33.5,34.5],[32.6,32.5],[32.3,31.3]],kind:"flow"}],
  pins:[P([32.55,30.0],"The Suez Canal"),P([33.8,30.0],"Sinai"),P([31.24,30.04],"Cairo")],
  iconPins:[ic([32.3,31.26],"swords")],
  phPins:[ph([32.3,31.26],"Port Said: British tanks, November 1956","SUEZ")],
  stat:"In 1956 Britain and France invaded Egypt to seize back the Suez Canal, and the United States forced them to leave",
  body:"Egypt’s leader Nasser nationalised the canal in July 1956. Israel, Britain and France secretly planned an attack: Israel struck across Sinai, and British and French troops landed around Port Said (arrows). The US, angry at not being told, refused to support Britain’s currency, and the invaders withdrew. Britain’s prime minister resigned within two months.",
  more:"Egypt sank dozens of ships to block the canal, and it stayed shut until 1957. The UN sent its first big peacekeeping force to keep the sides apart. It was the moment Britain and France learned they were no longer superpowers."});
 ins("hcoldwar","The Year of Africa",{title:"The uranium from Congo",sub:"1960/new",view:[4,-22,40,6],globe:[24,-8,3],
  lines:[{coords:[[26.59,-11.05],[24,-10],[20,-8],[16,-6.5],[13.45,-5.82]],kind:"dash"}],
  pins:[P([27.48,-11.66],"Élisabethville (Lubumbashi): Katanga’s capital"),P([15.31,-4.32],"Léopoldville (Kinshasa)"),P([13.45,-5.82],"Matadi: the port")],
  iconPins:[ic([26.59,-11.05],"pick","#8a6a3a")],
  phPins:[ph([15.31,-4.32],"Patrice Lumumba, 1960","LUMUMBA")],
  stat:"Most of the uranium for the Hiroshima bomb came from one mine in the Belgian Congo",
  body:"Shinkolobwe held uranium ore far richer than any other known mine. That made Congo’s southern province, Katanga, a Cold War prize. When Congo became independent in 1960, Katanga, backed by Belgian mining interests, tried to break away, and the crisis drew in the UN, the US and the Soviet Union.",
  more:"Congo’s first prime minister, Patrice Lumumba, was overthrown and murdered in Katanga in 1961, with Belgian involvement; the US had also plotted to remove him. Shinkolobwe was officially sealed in 2004."});
 order("hcoldwar",["The Iron Curtain","Berlin divided","NATO and the Warsaw Pact","A city under the ice","Partition of India","China’s revolution","The Korean War","Suez, 1956","The Year of Africa","The uranium from Congo","Vietnam","The Cuban Missile Crisis","The space race","Neither East nor West","Afghanistan, 1979","The Wall falls","The end of the Soviet Union"]);
}

/* =====================================================================================================
   The world since 1991
   ===================================================================================================== */
function hsince91(){
 set("hsince91","A new world",{
  more:"This tour follows the big events from the break-up of the Soviet Union to today: from Europe and the Middle East to the Horn of Africa, Taiwan’s chip factories and the jungle between Colombia and Panama. Contested places stay neutral here: the map shows what is on the ground and says who disputes it."});
 ins("hsince91","One country becomes fifteen",{title:"Giving up the bomb",sub:"1995/n:Ukraine",view:[18,38,92,58],globe:[50,49,1.8],
  lines:[{coords:[[31.1,47.98],[34,49],[37.6,55.75]],kind:"dash"},{coords:[[78,50.4],[60,53],[45,55],[37.6,55.75]],kind:"dash"}],
  pins:[P([31.1,47.98],"Pervomaisk: a missile base, now a museum"),P([30.52,50.45],"Kyiv"),P([78,50.4],"Semipalatinsk test site, Kazakhstan"),P([27.56,53.9],"Minsk"),P([37.6,55.75],"Moscow: warheads sent back")],
  iconPins:[ic([31.1,47.98],"rocket","#5b6b7c")],
  stat:"When the Soviet Union broke up, Ukraine had the world’s third-largest stock of nuclear weapons, and gave them all up",
  body:"Soviet missiles were left in Ukraine, Kazakhstan and Belarus. In the Budapest Memorandum of 1994, the US, Britain and Russia promised to respect Ukraine’s borders, and by 1996 its warheads had been sent to Russia to be taken apart (dashed). Kazakhstan did the same, and closed the Soviet test site where 456 nuclear tests had been carried out.",
  more:"After Russia took Crimea in 2014 and invaded in 2022, many Ukrainians felt the promises had been broken. The debate shapes how other countries think about giving up nuclear weapons."});
 ins("hsince91","The rise of China",{title:"The chip island",sub:"2015/n:Taiwan",view:[108,16,132,32],globe:[121,24,4],
  gfRuler:{a:[121.0,24.8],b:[119.79,25.5]},
  pins:[P([121.56,25.04],"Taipei"),P([120.3,22.6],"Kaohsiung"),P([119.79,25.5],"Pingtan, Fujian")],
  phPins:[ph([121.0,24.78],"Hsinchu: a TSMC chip factory","TSMC")],
  stat:"One company in Taiwan makes about 90% of the world’s most advanced computer chips",
  body:"TSMC was founded in 1987 in Hsinchu to make chips that other companies design. It became so good at it that phones, cars and AI around the world now depend on factories on one island, about 150 km across the strait from mainland China (ruler). Some call this Taiwan’s “silicon shield”.",
  more:"Chip factories need huge amounts of very clean water. In a drought in 2021 Taiwan stopped irrigating about 74,000 hectares of rice fields, and chipmakers hauled in water by truck."});
 ins("hsince91","The 2008 crash",{title:"Pirates of the Gulf of Aden",sub:"2010/n:Somalia",view:[30,-2,72,24],globe:[48,11,2.6],
  lines:[{coords:[[32.5,30.6],[33.5,27.5],[38,21],[42,15],[43.4,12.6],[46,12.2],[50,12.4],[54,13],[60,15],[66,20]],kind:"flow"}],
  pins:[P([43.4,12.6],"Bab-el-Mandeb strait"),P([49.82,7.98],"Eyl: a pirate base"),P([32.5,30.6],"The Suez Canal")],
  iconPins:[ic([48,12],"ship","#2a78d0")],
  phPins:[ph([51,11],"Armed guards on a cargo ship","PIRATES")],
  stat:"Around 2009–2011, Somali pirates in small boats were hijacking giant cargo ships for million-dollar ransoms",
  body:"Somalia had no working government after 1991, and it has a long coastline beside one of the busiest shipping lanes on Earth, the route to the Suez Canal (arrow). Fishermen and gangs began seizing passing ships. Attacks peaked in 2011, then fell sharply once navies patrolled and ships carried armed guards.",
  more:"The 2009 hijacking of the Maersk Alabama became the film Captain Phillips. Attacks rose again from late 2023, as navies turned to the Red Sea."});
 ins("hsince91","COVID-19",{title:"The Darién Gap",sub:"2020",view:[-96,-6,-60,26],globe:[-78,8,3],
  lines:[{coords:[[-76.78,8.42],[-77.3,8.2],[-77.8,8.6],[-78.5,9.0],[-79.52,8.98],[-83,10],[-86.25,12.13],[-90.5,14.6]],kind:"flow"}],
  pins:[P([-76.78,8.42],"Necoclí, Colombia"),P([-79.52,8.98],"Panama City"),P([-66.9,10.5],"Caracas")],
  phPins:[ph([-77.6,8.1],"The Darién Gap","Jungle path in the Darién Gap.jpg")],
  stat:"In 2023 over half a million people walked through a roadless jungle between Colombia and Panama, trying to reach the US",
  body:"The Darién Gap is the only break in the road from Alaska to Argentina: dense rainforest, swamps and mountains with no road at all. As people fled Venezuela’s economic collapse and hardship elsewhere, it became a route on foot for migrants heading north (arrow), though it takes days and many have died.",
  more:"Crossings rose from a few thousand a year before 2021 to about 520,000 in 2023, many of them children, then fell sharply after 2024."});
}

/* ---------- tour questions ---------- */
function TQ(id,f){try{const Q=typeof TOURQ!=="undefined"&&TOURQ&&TOURQ[id];if(!Q||Q._rvH)return;Q._rvH=1;f(Q)}catch(e){console.error(e)}}

/* ---------- photos ---------- */
const libIdx=f=>{try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}};
/* placeholder keys used above → the Commons file finally chosen (filled in when the photo exists) */
const FILE={"ULUBURUN": "Turkey.Bodrum091.jpg", "OTZI": "Obelisk Eismann Fundstelle 20090908a.jpg", "CHINCHORRO": "Chinchorro mummy, south coast of Peru or north coast of Chile, 5000-2000 BC - San Diego Museum of Man - DSC06921.JPG", "EUREKA": "Eureka original.jpg", "TSETSE": "Glossina-morsitans.jpg", "TURTLE": "Geobugseon and Atakebune at Saga Prefectural Nagoya Castle Museum 260912 1.jpg", "IOLANI": "Iolani Palace (51872681413).jpg", "PYTHEAS": "Pythéas.jpg", "ZHANGQIAN": "DunhuangCave323.jpg", "BARET": "Jeanne Barret.jpg", "BURMAROAD": "Workers with hand tools building Burma Road2.jpg", "ALAMEIN": "ElAlameinCommonwealthWarCemetery.jpg", "CAMPCENTURY": "Camp Century trench construction.png", "LUMUMBA": "Patrice Lumumba, 1960 (cropped).jpg", "TSMC": "TSMC Fab5.JPG", "POINTALPHA": "Wachturm DDR PA.JPG", "ASKIA": "Tombeau askia.jpg", "COMPGARDEN": "1727 company gardens Cape Town.png", "GUANO": "Guano Mining in Chincha Islands Peru (1865) Moulton.jpg", "OLMEC": "Copy of San Lorenzo Colossal Head.jpg", "ERIE": "Lockport bartlett color crop.jpg", "FLU": "Emergency hospital during Influenza epidemic, Camp Funston, Kansas - NCP 1603.jpg", "SUEZ": "British tanks in Port Said.jpg", "GANDHARA": "Buddha-Vajrapani-Herakles.JPG", "PEARL": "Arab pearl divers in the Persian Gulf.jpg", "ONFIM": "Новгородская грамота 109 от Жизномира к Микуле 12 век.jpg", "PIRATES": "Armed guard escort on a merchant ship.jpg", "SRIVIJAYA": "Talang Tuo Inscription.jpg", "GLOSSO": "Vertebraria sp. (fossil plant root) (Permian; Antarctica) (49063648122).jpg", "ESPERANZA": "Argentine research station Antarctic Peninsula.png"};
const fileOf=k=>FILE[k]||k;
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_RVHIST_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")merge();else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_RVHIST_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
/* card photos for new and re-angled stops ("tour|title" → file or placeholder key) */
const CARD={"hasia|When the Buddha looked Greek":"GANDHARA","hgunpowder|Turtle ships":"TURTLE"};
const TOURS=["hancient","heurope","hasia","hafrica","hnamerica","hsamerica","hoceania","hantarctica","explorers","hmedieval","hgunpowder","hrevolutions","hwars","hcoldwar","hsince91"];
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(fileOf(f));if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 for(const k in CARD){const i=libIdx(fileOf(CARD[k]));if(i>=0)PS_PHOTO[k]=i}
 /* a new stop with a photo pin and no card photo shows the pin’s photo on its card too */
 TOURS.forEach(id=>{const t=T(id);if(!t)return;t.steps.forEach(s=>{if(!s||!s._rvH)return;reg(s);const k=id+"|"+s.title;if(PS_PHOTO[k]!=null)return;
  const q=(s.phPins||[]).find(q=>q&&q._f&&libIdx(fileOf(q._f))>=0);if(q)PS_PHOTO[k]=libIdx(fileOf(q._f))})});
 TOURS.forEach(id=>{const t=T(id);if(t)t.steps.forEach(s=>{if(s&&!s._rvH)reg(s)})})}catch(e){console.error(e)}}
/* on the new stops only: a photo pin whose picture is missing from the library is dropped (before the tour opens) */
function prunePins(){TOURS.forEach(id=>{const t=T(id);if(!t)return;t.steps.forEach(s=>{if(!s||!s._rvH||!Array.isArray(s.phPins))return;
 if(s.phPins.some(q=>q&&q._f&&libIdx(fileOf(q._f))<0)){const keep=s.phPins.filter(q=>!(q&&q._f&&libIdx(fileOf(q._f))<0));lock(s,"phPins",keep);s._sqPruned=-1}})})}

/* ---------- run ---------- */
const FN={hancient,heurope,hasia,hafrica,hnamerica,hsamerica,hoceania,hantarctica,explorers,hmedieval,hgunpowder,hrevolutions,hwars,hcoldwar,hsince91};
function apply(id){const t=T(id);if(!t||t.steps._rvH)return;t.steps._rvH=1;try{FN[id]()}catch(e){console.error("review-hist",id,e)}}
/* small fixes that other files may undo, re-applied on every run */
function fixups(){try{const s=st("hgunpowder","Japan closes its doors");if(s&&(s.phPins||[]).some(q=>q&&/Dejima/.test(q.label)))lock(s,"phPins",s.phPins.filter(q=>q&&!/Dejima/.test(q.label)))}catch(e){}}
let late=false;
function run(){merge();TOURS.forEach(apply);photos();fixups();if(late)prunePins()}
function hook(){if(typeof psLaunchTour!=="function"||psLaunchTour._rvH)return false;const _l=psLaunchTour;
 psLaunchTour=function(id){try{if(FN[id]){apply(id);photos();fixups();if(late)prunePins()}}catch(e){}return _l.apply(this,arguments)};psLaunchTour._rvH=1;return true}
if(!hook()){const k=setInterval(()=>{if(hook())clearInterval(k)},300)}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&FN[ps.tour]){const S0=psSteps()[i];if(S0)reg(S0)}}catch(e){}return _g.apply(this,arguments)}}
run();[0,1500,5000].forEach(ms=>setTimeout(run,ms));setTimeout(()=>{late=true;run()},12000);
window.GF_RVHIST={run,FILE,CARD};
})();
