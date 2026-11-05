/* GeoFlock: Mapped books tour.
   bremote  "Atlas of Remote Islands: Fifty Islands I Have Never Set Foot On and Never Will"   Judith Schalansky, 2009
   Sixteen of the atlas’s fifty islands, one per stop, each shown far from everywhere else. The book is summarised in our
   own words and presented as the author’s view; her short pages mix research with imagined scenes, and the cards keep to
   the historical record (saying where it is uncertain). No book covers or long quotes.
   Every island is far too small to see at the scale of its stop, so each one is ringed (lines:{circle,km,kind:"outline"},
   and ringKm on its photo pins, the rule of geoflock-smallplaces.js) and labelled beside the ring, never covered by a marker;
   a ruler (gfRuler) measures the gap to the nearest neighbour. Also: red crabs walking on Christmas Island and a ship and a
   plane on the routes (gfWalkers, geoflock-walkers.js), thermometers on Lonely Island and Clipperton (gfTourThermo), the
   180° meridian and the Time zones layer at Semisopochnoi.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry).
   WANT_PHOTOS: ["St Kilda Village Bay.jpg","St Kilda"], ["Ostrov Uedineniya polar station.jpg","Lonely Island"],
   ["Semisopochnoi Island.jpg","Semisopochnoi"], ["Bouvetoya-2.jpg","Bouvet Island"], ["Tromelin Island.jpg","Tromelin"],
   ["Pingelap Atoll.jpg","Pingelap"], ["Takuu atoll.jpg","Takuu"], ["Howland Island.jpg","Howland"],
   ["Pukapuka atoll.jpg","Pukapuka"], ["Napuka.jpg","Napuka"], ["Clipperton Island.jpg","Clipperton"],
   ["Rongorongo tablet.jpg","Rapa Nui"], ["Floreana Post Office Bay.jpg","Floreana"] */
window.GF_BREMOTE_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bremote:"#5f7f8c"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label,ringKm)=>Object.assign({at,label,col:"#a8763f",icon:"photo"},ringKm?{ringKm}:{});
/* the islands ([lon, lat]) and a ring that shows where each one is */
const I={kilda:[-8.57,57.81],lonely:[82.25,77.48],semi:[179.6,51.95],bouvet:[3.36,-54.42],tristan:[-12.28,-37.11],tromelin:[54.52,-15.89],christmas:[105.63,-10.49],
 pingelap:[160.7,6.22],takuu:[157.03,-4.76],howland:[-176.62,0.81],pukapuka:[-165.85,-10.88],napuka:[-141.25,-14.17],pitcairn:[-130.1,-25.07],rapanui:[-109.35,-27.12],
 floreana:[-90.43,-1.28],clipperton:[-109.22,10.3]};
const ring=(at,km)=>({circle:at,km,kind:"outline"});

const ISL=[
S({title:"Atlas of Remote Islands",view:W,globe:[-150,-5,1],
 lines:Object.keys(I).map(k=>ring(I[k],180)),
 pins:[[I.kilda,"St Kilda","point"],[I.lonely,"Lonely Island","point"],[I.bouvet,"Bouvet","point"],[I.tristan,"Tristan da Cunha","point"],[I.christmas,"Christmas Island","point"],[I.pitcairn,"Pitcairn","point"],[I.clipperton,"Clipperton","point"],[I.howland,"Howland","point"]],
 phPins:[ph([-12.31,-37.07],"Tristan da Cunha",180),ph([-109.35,-27.12],"Ahu Tongariki, Rapa Nui",180),ph([105.63,-10.49],"Red crabs on Christmas Island",180)],
 stat:"Judith Schalansky grew up in East Germany, where travel abroad was barred, and travelled the world in her atlas",
 body:"Her 2009 book draws fifty islands she has never visited and never will, each on its own page at the same scale, with a short story about what happened there. Its message: the remotest places are not paradise but stages for strange and often dark human stories. The rings mark the sixteen islands on this tour.",
 more:"Schalansky, a writer and book designer born in 1980, also designed the book, and it won the prize for the most beautiful German book of 2009. Each page lists the island’s distances to its neighbours; this tour shows them with the ruler. Her stories mix research with imagined scenes, and the cards here stick to the record."}),
S({title:"St Kilda",view:[-26.4,54.5,0,61],globe:[-8.6,57.8,5],card:"left",lines:[ring(I.kilda,12)],gfRuler:{a:I.kilda,b:[-7.45,57.65]},
 pins:[[[-8.57,57.81],"St Kilda (Hirta)","point"],[[-6.2,57.0],"The Outer Hebrides","point"]],
 stat:"On 29 August 1930 the last 36 people of St Kilda asked to be taken off the island, and left their village for ever",
 body:"For centuries St Kildans lived on seabirds. Men climbed the highest sea cliffs in Britain on ropes to catch fulmars, gannets and puffins, eaten fresh, dried or salted. Every morning the men met in the village street to decide the day’s work. Visiting ships brought tourists, money, and colds that swept through the island.",
 more:"By the 1920s young people were leaving and the island could no longer feed itself. Today it belongs to the National Trust for Scotland and is a World Heritage Site for both its nature and its culture. It lies about 65 km west of the Outer Hebrides (drag the ruler)."}),
S({title:"Lonely Island",view:[19,70,112,82],globe:[82,77.5,4],card:"left",hiSoft:["ru"],lines:[ring(I.lonely,25)],gfRuler:{a:I.lonely,b:[80.55,73.51]},
 pins:[[I.lonely,"Lonely Island (Uyedineniya)","point"],[[80.55,73.51],"Dikson","point"]],
 stat:"Lonely Island lives up to its name: about 20 km² of gravel in the frozen Kara Sea, its weather station empty since 1996",
 body:"A Norwegian sealer, Edvard Holm Johannesen, came upon it in 1878 and named it for its loneliness. From 1934 Soviet meteorologists lived here in shifts, radioing weather for ships on the Northern Sea Route. When money ran out after the Soviet Union broke up, the station closed and its crew left their huts and instruments behind.",
 more:"The sea round it is frozen for most of the year, and polar bears wander the empty station. The thermometer shows the island’s usual temperature today. Dikson, the nearest town, is over 400 km away (drag the ruler)."}),
S({title:"Semisopochnoi",view:[148.5,45,195,58],globe:[179.6,52,4],card:"left",on:["timezones"],lines:[ring(I.semi,22),{coords:[[180,45.5],[180,57.5]],kind:"dash"}],gfRuler:{a:I.semi,b:[-176.65,51.88]},
 pins:[[I.semi,"Semisopochnoi","point"],[[-176.65,51.88],"Adak","point"],[[180,56.6],"180° meridian","point"]],
 stat:"Semisopochnoi lies just past the 180° meridian, which makes it, by longitude, the easternmost point of the United States",
 body:"The Aleutian Islands curve from Alaska towards Russia and cross the 180° line (dashed), where east longitude meets west. So the United States’ most westerly and most easterly points are both out here. Semisopochnoi is Russian for ‘seven hills’: volcanic cones around a sunken crater, with nobody living among them.",
 more:"Mount Cerberus, one of its volcanoes, erupted again from 2021. The date line (see the Time zones layer) bends west of the Aleutians so that all of Alaska keeps the same date. The nearest town is Adak, about 250 km east (drag the ruler)."}),
S({title:"Bouvet Island",view:[-47.5,-72,30,-30],globe:[3.4,-54.4,2.6],card:"left",hi:["bv"],lines:[ring(I.bouvet,40)],gfRuler:{a:I.bouvet,b:[5,-69.9]},
 pins:[[I.bouvet,"Bouvet Island","point"],[[18.42,-33.92],"Cape Town","point"],[[5,-69.9],"Queen Maud Land, Antarctica","point"]],
 stat:"Bouvet is often called the remotest island on Earth: about 1,700 km from the nearest land, the coast of Antarctica",
 body:"A French navigator, Jean-Baptiste Bouvet de Lozier, sighted it in 1739 but could not land and fixed its position wrongly, so it was lost for decades. Ice covers more than nine-tenths of it. In 1964 a British ship found an abandoned lifeboat on its shore, with no sign of anyone; nobody has explained it.",
 more:"Norway has held it since the late 1920s. It is a nature reserve, visited by seals and penguins and an automatic weather station. Drag the ruler to Antarctica; Cape Town is about 2,600 km away."}),
S({title:"Tristan da Cunha",view:[-62.8,-46,24,-12],globe:[-12.3,-37,2.4],card:"left",lines:[ring(I.tristan,40)],gfRuler:{a:I.tristan,b:[-5.71,-15.94]},
 pins:[[I.tristan,"Edinburgh of the Seven Seas","point"],[[-5.71,-15.94],"St Helena","point"],[[18.42,-33.92],"Cape Town","point"]],
 phPins:[ph([-12.31,-37.07],"Tristan’s volcano",40)],
 stat:"About 240 people live on Tristan da Cunha, about 2,400 km from their nearest neighbours on St Helena",
 body:"British soldiers occupied the island in 1816 to stop anyone using it to rescue Napoleon from St Helena. A few stayed, joined by shipwrecked sailors and women from St Helena; their families still share only a handful of surnames. In 1961 the volcano erupted beside the village, and everyone was shipped to England. Almost all came back two years later.",
 more:"There is no airport: the ship from Cape Town takes about a week. Islanders farm potatoes and fish for crayfish to sell abroad. It is the remotest inhabited island on Earth (drag the ruler to St Helena)."}),
S({title:"Tromelin",view:[29.9,-27,64,-9],globe:[54.5,-16,4],card:"left",hiSoft:["mg"],lines:[ring(I.tromelin,15),{coords:[[49.53,-17.68],[52,-16.8],[54.4,-15.95]],kind:"flow"},{coords:[[54.4,-16.05],[51.5,-16.9],[49.6,-17.4]],kind:"flow"}],gfRuler:{a:I.tromelin,b:[50.25,-15.5]},
 pins:[[I.tromelin,"Tromelin","point"],[[49.53,-17.68],"Foulpointe, Madagascar","point"],[[57.5,-20.16],"Mauritius","point"]],
 stat:"In 1761 a French ship wrecked on Tromelin, 1 km² of sand; its crew sailed away and left about 80 enslaved Malagasy behind",
 body:"The Utile was carrying people bought illegally in Madagascar to sell on Mauritius. After the wreck the crew built a boat from its timbers and left, promising to send help. None came for 15 years. In 1776 the Chevalier de Tromelin found seven women and an eight-month-old baby still alive.",
 more:"The castaways kept a fire burning for years, built shelters from coral blocks and lived on seabirds, turtles and shellfish. Archaeologists excavated their camp from 2006. France holds the island today; Mauritius claims it. It is about 450 km from Madagascar (drag the ruler)."}),
S({title:"Christmas Island",view:[91.3,-14,113,-5],globe:[105.6,-10,4.5],card:"left",hi:["cx"],hiSoft:["id"],lines:[ring(I.christmas,26)],gfRuler:{a:I.christmas,b:[105.9,-7.05]},
 pins:[[[105.67,-10.42],"Flying Fish Cove","point"],[[107.5,-6.9],"Java, Indonesia","point"]],
 phPins:[ph([105.68,-10.43],"Flying Fish Cove",26)],
 stat:"Every year tens of millions of red crabs march from Christmas Island’s forest to the sea to breed",
 body:"The island belongs to Australia but lies about 1,550 km from its mainland and 350 km south of Java (drag the ruler). The crabs fill roads and gardens at the start of the wet season, timed by the moon. The island is also known for people arriving by boat from Indonesia to seek asylum in Australia.",
 more:"In 2001 Australia refused to let the Norwegian freighter Tampa land more than 400 rescued asylum seekers here, and later built a detention centre on the island. Phosphate from ancient seabird droppings has been mined here since the 1890s."}),
S({title:"Pingelap",view:[135.9,0,170,12],globe:[160.7,6.2,4.5],card:"left",hiSoft:["fm"],lines:[ring(I.pingelap,12)],gfRuler:{a:I.pingelap,b:[158.21,6.88]},
 pins:[[I.pingelap,"Pingelap","point"],[[158.21,6.88],"Pohnpei","point"]],
 stat:"On Pingelap, a tiny atoll in Micronesia, up to one person in ten sees the world entirely without colour",
 body:"Around 1775 a typhoon and the famine after it left only about 20 survivors. One of them, the ruler, carried a rare gene for achromatopsia, total colour blindness. In such a small community it spread over the generations. Elsewhere about one person in 30,000 has it; here it has a name of its own, maskun.",
 more:"People with it see in shades of grey and are dazzled by bright sunlight. The neurologist Oliver Sacks described his visit in The Island of the Colorblind (1996). Pohnpei, the nearest big island, is about 280 km away (drag the ruler)."}),
S({title:"Takuu",view:[135,-12,166,2],globe:[157,-4.8,4.5],card:"left",hiSoft:["pg","sb"],lines:[ring(I.takuu,12)],gfRuler:{a:I.takuu,b:[154.67,-5.43]},
 pins:[[I.takuu,"Takuu atoll","point"],[[154.67,-5.43],"Buka, Bougainville","point"]],
 stat:"Takuu is a ring of low islets off Bougainville, home to a few hundred Polynesians in Melanesian waters",
 body:"Its people speak a Polynesian language and kept their own songs and dances long after missionaries had changed most of the Pacific; a New Zealand ethnomusicologist, Richard Moyle, spent years recording hundreds of them. The islets rise only a metre or two above the sea, and storm surges already wash over the village.",
 more:"Takuu is part of Papua New Guinea. Some islanders have already moved to Bougainville, about 270 km away (drag the ruler), and more may have to as the sea rises."}),
S({title:"Howland",view:[109.8,-12,195,12],globe:[-176.6,0.8,2.6],card:"left",hiSoft:["pg","ki"],lines:[ring(I.howland,30),{coords:[[146.99,-6.73],[165,-3],[-179.2,0.4]],kind:"flow"},{coords:[[-179.2,0.4],[-176.75,0.78]],kind:"dash"}],gfRuler:{a:[146.99,-6.73],b:I.howland},
 pins:[[I.howland,"Howland","point"],[[146.99,-6.73],"Lae, New Guinea","point"]],
 stat:"In 1937 Amelia Earhart and Fred Noonan were flying to Howland, a speck about 2.5 km long, when they vanished",
 body:"Howland was to be the refuelling stop on her flight round the world near the equator, and a runway had been built for her. They took off from Lae in New Guinea for a flight of about 4,100 km (drag the ruler). A US Coast Guard ship waiting off Howland heard her last radio calls, but the plane never arrived.",
 more:"Despite search after search, no trace has ever been proved. Howland is uninhabited today, a US wildlife refuge for seabirds, with a day beacon named Earhart Light near the old runway."}),
S({title:"Pukapuka",view:[170.8,-24,208,-4],globe:[-165.9,-10.9,3.5],card:"left",hiSoft:["ck"],lines:[ring(I.pukapuka,18)],gfRuler:{a:I.pukapuka,b:[-159.78,-21.23]},
 pins:[[I.pukapuka,"Pukapuka","point"],[[-159.78,-21.23],"Rarotonga","point"]],
 stat:"Byron named Pukapuka the Islands of Danger in 1765; an American writer, Robert Dean Frisbie, made it his home in the 1920s",
 body:"Frisbie ran a trading store on the atoll, married an islander and wrote The Book of Puka-Puka (1929), a funny, fond portrait of island life that made it briefly famous. Pukapuka has its own language and customs, closer to Samoa’s than to the rest of the Cook Islands.",
 more:"About 400 people live on its three islets. Rarotonga, the Cook Islands’ capital, is about 1,300 km away (drag the ruler), and supply ships call only a few times a year."}),
S({title:"Napuka",view:[-163.6,-21,-131,-7],globe:[-141.3,-14.2,4],card:"left",hiSoft:["pf"],lines:[ring(I.napuka,15),{coords:[[-131.5,-18.5],[-138,-15.2],[-141.1,-14.25]],kind:"flow"},{coords:[[-141.4,-14.3],[-145.03,-14.47]],kind:"flow"}],
 pins:[[I.napuka,"Napuka","point"],[[-141.62,-14.08],"Tepoto","point"],[[-145.03,-14.47],"Takaroa","point"]],
 stat:"Commodore Byron named them the Islands of Disappointment in 1765: his men could not land or get food there",
 body:"In June 1765 Byron’s sailors, sick with scurvy, sighted coconut palms on Napuka and Tepoto but found no safe anchorage, and islanders gathered on the shore with spears. He sailed on (the arrows), and the name stuck: they are still the Disappointment Islands.",
 more:"About 300 people live on Napuka today, in the Tuamotus of French Polynesia; a supply ship calls only now and then. For a long time the islanders were among the least visited in Polynesia."}),
S({title:"Pitcairn",view:[-170.6,-30,-121,-14],globe:[-130.1,-25,3.5],card:"left",hi:["pn"],lines:[ring(I.pitcairn,30),{coords:[[-149.57,-17.53],[-141,-22],[-130.15,-25.05]],kind:"flow"}],gfRuler:{a:I.pitcairn,b:[-149.57,-17.53]},
 pins:[[I.pitcairn,"Pitcairn: Adamstown","point"],[[-128.33,-24.37],"Henderson","point"],[[-149.57,-17.53],"Tahiti","point"]],
 phPins:[ph([-128.33,-24.37],"Henderson Island",14)],
 stat:"Nine Bounty mutineers and the Tahitians with them hid on Pitcairn in 1790, then burnt their ship",
 body:"Pitcairn was wrongly placed on the Navy’s charts, which is why they chose it. Within a few years most of the men had killed one another; when an American ship came by in 1808, only one mutineer, John Adams, was left, with the women and children. Their descendants still live in Adamstown, a few dozen people in all.",
 more:"The idyll has a darker side: in 2004 trials on the island convicted six of its men of sexual abuse going back decades. Tahiti is over 2,000 km away (drag the ruler); Henderson, nearby, is uninhabited."}),
S({title:"Rapa Nui",view:[-173.4,-37,-68,-17],globe:[-109.4,-27.1,2.6],card:"left",hiSoft:["cl"],lines:[ring(I.rapanui,45)],gfRuler:{a:I.rapanui,b:I.pitcairn},
 pins:[[I.rapanui,"Rapa Nui (Easter Island)","point"],[I.pitcairn,"Pitcairn","point"],[[-71.62,-33.05],"Valparaíso, Chile","point"]],
 phPins:[ph([-109.43,-27.2],"Motu Nui, Rapa Nui",45)],
 stat:"Rapa Nui’s people carved signs on wooden tablets that no one can read today: the rongorongo script",
 body:"About two dozen inscribed objects survive, all in museums abroad. In 1862 Peruvian slave raiders carried off many islanders, and smallpox brought back by survivors killed most of the rest, including, it seems, almost everyone who might have read the signs. Whether rongorongo is true writing is still debated.",
 more:"The island is best known for its nearly 1,000 moai statues. Chile annexed it in 1888. Its nearest inhabited neighbour is Pitcairn, about 2,100 km away (drag the ruler)."}),
S({title:"Floreana",view:[-94.7,-2,-88.8,1],globe:[-90.4,-1.3,9],card:"left",hiSoft:["ec"],lines:[ring(I.floreana,10)],
 pins:[[I.floreana,"Floreana","point"],[[-90.45,-1.23],"Post Office Bay","point"],[[-90.31,-0.75],"Santa Cruz","point"]],
 stat:"In the 1930s a few Germans came to Floreana to escape the world; two of them vanished and two more died",
 body:"A doctor, Friedrich Ritter, and Dore Strauch arrived in 1929 to live as hermits; the Wittmer family followed in 1932, then a self-styled baroness with two lovers, who planned a hotel. In 1934 the baroness and one lover disappeared. The other was found dead on a far island, and Ritter died soon after, of food poisoning, Strauch said.",
 more:"What happened has never been solved. Margret Wittmer stayed on Floreana until her death in 2000. At Post Office Bay sailors have left letters in a barrel since the 1790s for passing ships to carry on by hand."}),
S({title:"Clipperton",view:[-131.1,1,-97,21],globe:[-109.2,10.3,3.5],card:"left",hiSoft:["mx"],lines:[ring(I.clipperton,20)],gfRuler:{a:I.clipperton,b:[-104.32,19.1]},
 pins:[[I.clipperton,"Clipperton","point"],[[-104.32,19.1],"Manzanillo, Mexico","point"]],
 stat:"Clipperton’s Mexican garrison was forgotten during the revolution: by 1917 only women, children and one man were left",
 body:"Captain Ramón Arnaud kept a small garrison and their families on this ring of coral. When supply ships stopped coming in 1914, scurvy killed many. Arnaud and the last soldiers drowned rowing out to a passing ship. The lighthouse keeper, Victoriano Álvarez, then declared himself king and terrorised the women, until they killed him in 1917; a US warship rescued the survivors soon after.",
 more:"In 1931 the King of Italy, chosen to settle the dispute, awarded the atoll to France, which still owns it. Nobody lives there now. It is about 1,100 km from Mexico (drag the ruler); the thermometer shows its usual temperature."}),
S({title:"Now explore",view:W,globe:[-150,-5,1],lines:Object.keys(I).map(k=>ring(I[k],180)),
 stat:"Hover any country to see its name and neighbours",
 body:"Zoom in on any ring and find the island inside it. Schalansky’s atlas has 34 more, from Easter Island to Peter I Island off Antarctica. Then try the Island life tour, about the animals that live on islands, or Collapse, about Rapa Nui and Pitcairn."})];

/* each ring is drawn wide enough to see at its stop's scale (about 2.5% of the view's width), and photo pins share it */
ISL.forEach(St=>{const v=St.view;if(!v||v===W)return;const wKm=((v[2]-v[0]+360)%360||360)*111.32*Math.cos((v[1]+v[3])/2*Math.PI/180),r=Math.max(12,Math.round(wKm*.025));
 (St.lines||[]).forEach(L=>{if(L.circle&&L.kind==="outline")L.km=Math.max(L.km,r)});(St.phPins||[]).forEach(q=>{if(q.ringKm)q.ringKm=Math.max(q.ringKm,r)})});
const TOURS={bremote:{name:"Atlas of Remote Islands",short:"Atlas of Remote Islands",hint:"Judith Schalansky’s 2009 atlas, on the map: St Kilda, Bouvet, Tristan da Cunha, Tromelin, Pitcairn, Clipperton and ten more islands far from everywhere",steps:ISL}};
const IDS=Object.keys(TOURS);
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- movers (geoflock-walkers.js) and thermometers (geoflock-tourthermo.js) ---------- */
const THERMO={"Lonely Island":[[I.lonely[0],I.lonely[1],"Lonely Island"]],"Clipperton":[[I.clipperton[0],I.clipperton[1],"Clipperton"]]};
function addMovers(){try{const Wk=window.gfWalkers;if(Wk){
  /* red crabs: the same walkers as the Island life tour's stop, marching from the forest to the coast */
  const crab=Wk["islandlife|Christmas Island’s red crabs"];if(crab)Wk["bremote|Christmas Island"]=Object.assign({},crab,{size:16});
  Wk["bremote|Tromelin"]={emoji:"⛵",name:"The Utile, then the crew’s boat",size:26,per:1,float:1};
  Wk["bremote|Howland"]={emoji:"✈️",name:"Earhart’s plane",size:26,per:1};
  Wk["bremote|Napuka"]={emoji:"⛵",name:"Byron’s Dolphin",size:26,per:1,float:1};
  Wk["bremote|Pitcairn"]={emoji:"⛵",name:"The Bounty",size:26,per:1,float:1}}
 const Th=window.gfTourThermo;if(Th)for(const t in THERMO)Th["bremote|"+t]=THERMO[t]}catch(e){console.error(e)}}
addMovers();addEventListener("load",()=>setTimeout(addMovers,0));

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bremote={mid:[
 {at:"St Kilda",st:"St Kilda",q:"What did the people of St Kilda mostly live on?",o:["Sheep","Seabirds","Whales","Potatoes"],a:1,why:"Men climbed the sea cliffs to catch fulmars, gannets and puffins.",kc:"gb"},
 {at:"Tristan da Cunha",st:"Tristan da Cunha",q:"In 1961 the people of Tristan da Cunha had to leave because of…",o:["A tsunami","A volcanic eruption","A famine","A war"],a:1,why:"The volcano erupted beside the village; most came back in 1963.",kc:"gb"},
 {at:"Christmas Island",st:"Christmas Island",q:"Which animals march to the sea on Christmas Island every year?",o:["Turtles","Red crabs","Penguins","Seals"],a:1,why:"Tens of millions of them, to breed.",kc:"au"}],
 recap:[
 {q:"Who was flying to Howland Island when she vanished in 1937?",o:["Amy Johnson","Amelia Earhart","Bessie Coleman","Jean Batten"],a:1,why:"With her navigator, Fred Noonan.",st:"Howland",kc:"us"},
 {q:"Which ship’s mutineers settled on Pitcairn in 1790?",o:["The Endeavour","The Bounty","The Beagle","The Mayflower"],a:1,why:"They burnt the ship so it could not be seen.",st:"Pitcairn",kc:"gb"},
 {q:"Which country owns Clipperton today?",o:["Mexico","France","The USA","Italy"],a:1,why:"The King of Italy awarded it to France in 1931.",st:"Clipperton",kc:"fr"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bremote|Atlas of Remote Islands":"Tristan da Cunha, British overseas territory-20March2012.jpg","bremote|Lonely Island":"Polar bear (Ursus maritimus) in the drift ice region north of Svalbard.jpg",
 "bremote|Tristan da Cunha":"Tristan Da Cunha (249833017).jpeg","bremote|Christmas Island":"Christmas Island Crabs on annual migration.JPG",
 "bremote|Pitcairn":"Adamstown.jpg","bremote|Rapa Nui":"Ahu Tongariki cropped.jpg","bremote|Floreana":"Medium ground finch on Floreana Island in the Galápagos Islands.jpg",
 "bremote|Now explore":"Balls Pyramid, Lord Howe Marine Park 1008.jpg"};
const PIN={
 "Tristan da Cunha":"Tristan da Cunha, British overseas territory-20March2012.jpg","Ahu Tongariki, Rapa Nui":"Ahu Tongariki cropped.jpg","Red crabs on Christmas Island":"Christmas Island Red Crab.jpg",
 "Tristan’s volcano":"Surroundings of Infrasound Station IS49 Tristan de Cunha, UK (13288640063).jpg","Flying Fish Cove":"Flying Fish Cove at Christmas Island.jpg",
 "Henderson Island":"Henderson Island-110259.jpg","Motu Nui, Rapa Nui":"Motu Nui Islet - Easter Island (5956399066).jpg"};
const PHOTOS=window.GF_BREMOTE_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bremote:"Tristan da Cunha, British overseas territory-20March2012.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
