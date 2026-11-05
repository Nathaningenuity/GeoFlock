/* GeoFlock: a Mapped books tour (a famous book about the world, followed on the map).
   bbeagle  "The Voyage of the Beagle"  Charles Darwin, 1839 (first as Journal and Remarks, 3rd volume of FitzRoy's Narrative;
            revised 1845)
   Each stop follows the ship round the world (27 December 1831 to 2 October 1836) and shows what Darwin saw and thought there.
   His ideas are summarised in our own words and presented as his views; where historians disagree, the card says so in a
   line. No book covers or long quotes.
   Stops use the ship sailing along each leg of the route (the stop's flow lines, through geoflock-walkers.js's list,
   window.gfWalkers), thermometers (geoflock-tourthermo.js's list, window.gfTourThermo), a height cross-section of the
   Andes in the card (xsec), the true-size country dragger (ghosts), the ruler (gfRuler), ocean currents (gfCur), per-stop
   layers (on:[…]: plates, hazards).
   The tour stays on the Relief map throughout.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BBEAGLE_PHOTOS.
   WANT_PHOTOS: [
    ["Charles Darwin 1840.jpg (George Richmond's watercolour of the young Darwin)", "Plymouth, 1831: a young man joins"],
    ["HMS Beagle by Conrad Martens.jpg", "The Voyage of the Beagle"],
    ["Megatherium americanum skeleton (Natural History Museum)", "Giant bones at Punta Alta"],
    ["Darwin's forest, Paramillos de Uspallata (fossil trees)", "Seashells on the Andes"],
    ["Galápagos mockingbird (Mimus parvulus)", "Tortoises, mockingbirds and finches"],
    ["Down House, Downe, Kent", "From the Beagle to the Origin"],
    ["Ruins of the cathedral of Concepción, 1835 (drawing by J. C. Wickham)", "The earthquake at Concepción"]] */
window.GF_BBEAGLE_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bbeagle:"#8f6f45"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* ---------- the route, leg by leg ([lon, lat], at sea between ports) ---------- */
const LEG={
 out:[[-4.14,50.36],[-5.5,48.5],[-10,43],[-14,36],[-16.25,28.47],[-19,22],[-23.51,14.92]],
 bahia:[[-23.51,14.92],[-29.35,0.92],[-32.42,-3.85],[-35.5,-9],[-38.55,-13.0]],
 rio:[[-38.55,-13.0],[-37.6,-15.5],[-38.4,-18.2],[-40.2,-21.6],[-43.15,-23.0]],
 plata:[[-43.15,-23.0],[-46.5,-25.5],[-50,-30],[-53,-34.6],[-56.2,-35.0]],
 south:[[-56.2,-35.0],[-56.5,-36.6],[-58,-38.6],[-62.1,-39.0],[-61.5,-40.8],[-64.5,-43.3],[-65.5,-46],[-65.8,-47.8],[-67.5,-50.2],[-67.2,-53.5],[-65.3,-54.9],[-66.6,-55.3],[-68.2,-55.1]],
 falk:[[-68.2,-55.1],[-65.3,-54.9],[-61,-53.2],[-58.1,-51.6]],
 strait:[[-68.3,-52.4],[-69.6,-52.5],[-70.9,-53.2],[-71.5,-53.9],[-73,-53.3],[-74.6,-52.6],[-75.6,-50],[-75.4,-46],[-74.3,-43.4],[-74.1,-41.8],[-73.6,-39.9],[-73.5,-37.5],[-73.15,-36.7],[-72.2,-34.5],[-71.65,-33.0]],
 peru:[[-71.65,-33.0],[-72.4,-30],[-71.8,-24],[-71,-18.6],[-74,-15.6],[-77.25,-12.1]],
 galap:[[-77.25,-12.1],[-82,-7],[-89.35,-0.95],[-90.45,-1.3],[-91.4,-0.3],[-90.8,-0.22]],
 tahiti:[[-90.8,-0.22],[-100,-6],[-120,-12],[-140,-15.6],[-149.5,-17.45]],
 nz:[[-149.5,-17.45],[-160,-23],[-175,-30],[178,-33],[174.15,-35.2]],
 aus:[[174.15,-35.2],[170,-35],[160,-34.5],[151.3,-33.84]],
 tas:[[151.3,-33.84],[151.4,-35],[150.5,-38],[148.6,-40],[148.2,-42],[147.4,-43.1]],
 west:[[147.4,-43.1],[146.4,-44],[140,-40.5],[130,-36.8],[120,-35.7],[117.95,-35.1]],
 cocos:[[117.95,-35.1],[112,-30],[100,-18],[96.87,-12.17]],
 cape:[[96.87,-12.17],[80,-15],[57.5,-20.1],[50,-26],[38,-33.5],[26,-35.2],[19.6,-35],[18.35,-33.9]],
 home:[[18.35,-33.9],[10,-26],[-5.72,-15.93],[-14.4,-7.93],[-30,-10],[-38.55,-13.0],[-34.75,-8.05],[-27,0],[-23.51,14.92],[-27.2,38.6],[-15,46],[-5.07,50.12]]};
const ALL=["out","bahia","rio","plata","south","strait","peru","galap","tahiti","nz","aus","tas","west","cocos","cape","home"].reduce((a,k)=>a.concat(a.length?LEG[k].slice(1):LEG[k]),[]);
/* the whole voyage as one line (lines are drawn as great circles, so the Pacific leg crosses 180° the short way); fl() gives a stop its legs */
const fl=(...ks)=>ks.map(k=>({coords:LEG[k],kind:"flow"}));

/* =====================================================================================================
   The Voyage of the Beagle (Charles Darwin, 1839)
   ===================================================================================================== */
const BEAGLE=[
S({title:"The Voyage of the Beagle",view:[-125,-60,180,72],globe:[-40,-10,1],
 lines:[{coords:ALL,kind:"flow"}],
 pins:[[[-4.14,50.36],"Plymouth: out, December 1831","point"],[[-89.6,-0.9],"Galápagos, 1835","point"],[[151.21,-33.86],"Sydney, 1836","point"],[[-5.07,50.15],"Falmouth: home, October 1836","point"]],
 phPins:[ph([-38.5,-12.97],"Salvador, Bahia"),ph([-68.3,-54.8],"Ushuaia, Tierra del Fuego"),ph([-91.3,-0.6],"A Galápagos giant tortoise"),ph([-69.99,-32.65],"Aconcagua"),ph([96.83,-12.12],"Cocos (Keeling) Islands"),ph([18.42,-33.96],"Table Mountain"),ph([150.3,-33.73],"The Blue Mountains")],
 stat:"A five-year voyage round the world turned a 22-year-old graduate into the scientist who explained evolution",
 body:"In 1831 the Royal Navy ship HMS Beagle sailed to chart the coasts of South America, with Charles Darwin on board as a gentleman naturalist. His journal of the trip, published in 1839, became one of the most famous travel books ever. Follow the ship round the world.",
 more:"The voyage was planned for two years and lasted almost five. Darwin spent more than three of them on land, riding, climbing and collecting, while the Beagle surveyed the coasts."}),
S({title:"Plymouth, 1831: a young man joins",view:[-32,10,8,54],globe:[-12,35,2],card:"left",lines:fl("out"),
 pins:[[[-4.14,50.36],"Plymouth: sails 27 December 1831","point"],[[-2.75,52.71],"Shrewsbury: Darwin’s home town","point"],[[0.12,52.2],"Cambridge: his university","point"],[[-16.25,28.47],"Tenerife: no landing allowed","point"],[[-23.51,14.92],"Cape Verde","point"]],
 stat:"Darwin was 22 and the captain, Robert FitzRoy, 26; the ship was only about 27 metres long",
 body:"Darwin had studied medicine in Edinburgh and then trained for the Church at Cambridge, but loved beetles and rocks more. His teacher John Henslow found him a place on the Beagle. He was seasick for much of the voyage. Watch the ship set off.",
 more:"At Tenerife the ship was told to wait in quarantine because of cholera in England, so FitzRoy sailed straight on. Darwin had longed to see the island."}),
S({title:"Cape Verde: rocks that rose",view:[-27,12.5,-20,18],globe:[-23.6,15,6],card:"left",hi:["cv"],
 pins:[[[-23.51,14.92],"Porto Praya, St Jago (Santiago)","point"],[[-24.35,14.95],"Fogo volcano","point"]],
 iconPins:[ic([-24.35,14.95],"volcano")],
 phPins:[ph([-24.38,14.95],"Fogo volcano")],
 stat:"In January 1832, on his first landing, Darwin found a band of seashells in a cliff about 14 metres above the sea",
 body:"The shells had been baked by lava and then slowly lifted out of the water. Darwin had been reading Charles Lyell’s new book, which argued that the Earth changes through slow, everyday forces acting over vast time. Here he saw it for himself, and decided he might write a book on geology.",
 more:"Lyell’s idea of slow change over huge spans of time later helped Darwin imagine species changing slowly too."}),
S({title:"Bahia: into the rainforest",view:[-52,-28,-30,-6],globe:[-41,-17,3],card:"left",hiSoft:["br"],lines:fl("bahia","rio"),
 pins:[[[-38.51,-12.97],"Salvador (Bahia): 28 February 1832","point"],[[-43.17,-22.91],"Rio de Janeiro: April to July","point"],[[-38.7,-17.96],"The Abrolhos reefs","point"]],
 phPins:[ph([-43.16,-22.95],"Sugarloaf, Rio de Janeiro")],
 stat:"On his first day in a tropical forest, Darwin wrote that he had never felt such delight",
 body:"Darwin wandered the Atlantic Forest around Bahia and Rio, filling notebooks and jars with insects, frogs and plants. He was also horrified by slavery in Brazil, and quarrelled with FitzRoy about it. The Darwins and his mother’s family, the Wedgwoods, were leading campaigners against slavery.",
 more:"Today only about an eighth of Brazil’s Atlantic Forest is left, but it is still one of the richest places for life on Earth."}),
S({title:"Giant bones at Punta Alta",view:[-72,-44,-52,-30],globe:[-62,-37,3.5],card:"left",hiSoft:["ar","uy"],lines:fl("plata","south"),
 pins:[[[-62.07,-38.88],"Punta Alta: fossils, September 1832","point"],[[-56.19,-34.9],"Montevideo","point"],[[-58.38,-34.6],"Buenos Aires","point"]],
 iconPins:[ic([-62.07,-38.88],"pick")],
 phPins:[ph([-60,-37.5],"A rhea"),ph([-57.6,-35.5],"A three-toed sloth today")],
 stat:"Darwin dug giant fossils out of the low cliffs at Punta Alta, near Bahía Blanca in Argentina",
 body:"He found the bones of extinct giant ground sloths, some as big as elephants, and bony armour like a giant armadillo’s; later, in Uruguay, he bought the skull of a hippo-sized grazer called Toxodon. He was struck that these giants looked like small animals still living in South America, and wondered why the living ones resembled the dead.",
 more:"In Patagonia he also learned of a second, smaller kind of rhea that lived further south, and ate one before he realised what it was. Both clues, close species replacing each other, stuck in his mind."}),
S({title:"Tierra del Fuego",view:[-80,-58,-54,-48],globe:[-67,-54,3.5],card:"left",hiSoft:["ar","cl"],lines:fl("falk"),
 pins:[[[-68.15,-55.05],"Wulaia: the Fuegians return, January 1833","point"],[[-68.3,-54.85],"The Beagle Channel","point"],[[-67.27,-55.98],"Cape Horn","point"],[[-58.1,-51.6],"The Falklands","point"]],
 phPins:[ph([-67.27,-55.98],"Cape Horn"),ph([-58.5,-51.7],"Penguins in the Falklands")],
 stat:"The Beagle brought home three Fuegians whom FitzRoy had taken to England on an earlier voyage",
 body:"Jemmy Button, York Minster and Fuegia Basket had been dressed and schooled in England. Darwin was shocked by the cold, wild coast and by how differently people lived here. His descriptions of the Fuegians, though, show the prejudices of his time. Compare the thermometers: Ushuaia and Salvador.",
 more:"The Fuegians’ descendants, the Yagán (Yámana) and their neighbours, still live in the region. On the Falklands Darwin predicted that the islands’ fox-like wolf would soon die out; the last was killed in 1876."}),
S({title:"Patagonia: a land that rose",view:[-82,-56,-54,-38],globe:[-68,-47,2.4],card:"left",hiSoft:["ar"],
 ghosts:[{code:"gb",at:[-68,-46],col:"#8f6f45",label:"Britain, true size"}],
 lines:[{coords:[[-68.52,-50.02],[-70,-50.1],[-71.2,-50.2]],kind:"dash"}],
 pins:[[[-68.52,-50.02],"Mouth of the Santa Cruz","point"],[[-71.2,-50.2],"Upriver, May 1834","point"],[[-65.9,-47.75],"Port Desire","point"],[[-73.04,-49.27],"Mount Fitz Roy","point"]],
 phPins:[ph([-73.04,-49.27],"Mount Fitz Roy")],
 stat:"Patagonia’s flat, stony plains rise in steps, and Darwin found seashells on them far from the sea",
 body:"In 1834 FitzRoy, Darwin and a party of sailors dragged boats about 200 km up the Santa Cruz river (dashed) until they could see the Andes. Darwin read the terraced plains as old beaches: he believed the whole land had risen slowly from the sea. Drag Britain across Patagonia to see its size.",
 more:"He was partly right: the land did rise, but later geologists showed that ice ages and changing sea levels made many of the steps too. Mount Fitz Roy was later named after the captain."}),
S({title:"The earthquake at Concepción",view:[-84,-44,-60,-30],globe:[-73,-37,3.5],card:"left",hiSoft:["cl"],on:["plates","hazards"],lines:fl("strait"),
 pins:[[[-73.24,-39.81],"Valdivia: Darwin feels the quake","point"],[[-73.05,-36.83],"Concepción: in ruins","point"],[[-73.53,-37.03],"Santa María island: lifted","point"],[[-72.6,-41.1],"Osorno volcano erupts","point"],[[-71.62,-33.05],"Valparaíso","point"]],
 iconPins:[ic([-73.05,-36.83],"crack"),ic([-72.6,-41.1],"erupt")],
 phPins:[ph([-73.2,-39.7],"The Valdivian rainforest")],
 stat:"On 20 February 1835 a great earthquake struck Chile; at Concepción it and a tsunami left the town in ruins",
 body:"Darwin was resting in a forest near Valdivia when the ground rocked. At Concepción he saw the wreckage, and FitzRoy measured that the land around the bay, and Santa María island, had been lifted by two to three metres. Here was the proof: the Andes coast was rising, one jolt at a time.",
 more:"The plates layer shows why: the Nazca Plate is sliding under South America here. A month earlier Darwin had watched Osorno volcano erupting from the island of Chiloé."}),
S({title:"Seashells on the Andes",view:[-76,-38,-64,-29],globe:[-70,-33,4],card:"left",hiSoft:["cl","ar"],
 xsec:{title:"Darwin’s ride over the Andes, Santiago to Mendoza",pts:[[-70.65,-33.45,"Santiago"],[-70.35,-33.64,"Maipo valley"],[-70.05,-33.75],[-69.9,-33.62,"Piuquenes Pass"],[-69.75,-33.58,"Portillo Pass"],[-69.45,-33.5],[-69.15,-33.37,"Tunuyán"],[-68.84,-32.89,"Mendoza"]],mark:4000,note:"The dashed line marks 4,000 m. Darwin crossed both passes, each over 4,000 m high, in March 1835; the chart’s heights are smoothed."},
 pins:[[[-70.65,-33.45],"Santiago","point"],[[-68.84,-32.89],"Mendoza","point"],[[-69.1,-32.5],"Uspallata: Darwin’s fossil trees","point"],[[-70.01,-32.65],"Aconcagua","point"]],
 iconPins:[ic([-69.1,-32.5],"tree")],
 phPins:[ph([-70.01,-32.65],"Aconcagua")],
 stat:"High in the Andes Darwin found fossil seashells, and a fossil forest that had once grown by the sea",
 body:"He rode across the mountains on mules (see the cross-section in this card). On the way back, at Uspallata, he found petrified trees still standing where they grew. He worked out that the land had sunk under the sea, been buried, then pushed up thousands of metres. Mountains, he saw, are made slowly.",
 more:"Aconcagua, the highest mountain outside Asia at 6,961 m, rises just north of his route. Darwin’s fossil forest is now a protected site."}),
S({title:"Galápagos: islands of difference",view:[-100,-12,-72,6],globe:[-86,-3,3],card:"left",hi:["ec"],gfCur:{ocean:1},lines:fl("galap"),gfRuler:{a:[-89.6,-0.9],b:[-80.7,-1.05]},
 pins:[[[-89.6,-0.9],"San Cristóbal (Chatham)","point"],[[-90.45,-1.28],"Floreana (Charles)","point"],[[-91.35,-0.27],"Isabela (Albemarle)","point"],[[-90.77,-0.24],"Santiago (James)","point"]],
 phPins:[ph([-91.6,-0.3],"A Galápagos penguin"),ph([-90.32,-0.5],"A marine iguana")],
 stat:"The Beagle spent five weeks at the Galápagos, from 15 September to 20 October 1835",
 body:"These volcanic islands sit on the equator, about 1,000 km from Ecuador (drag the ruler), yet a cold current from the south (shown) brings penguins and sea lions, and keeps them cooler than the mainland coast (compare the thermometers). Darwin saw that the plants and animals were like South America’s, but not the same: as if they had arrived from there and then changed.",
 more:"He found black lava fields, iguanas that swim in the sea and birds so tame he could push a hawk off a branch with his gun."}),
S({title:"Tortoises, mockingbirds and finches",view:[-92.2,-1.6,-89,0.8],globe:[-90.6,-0.5,9],card:"left",hi:["ec"],
 pins:[[[-90.45,-1.28],"Floreana: Lawson’s tortoises","point"],[[-89.6,-0.9],"San Cristóbal: a different mockingbird","point"],[[-90.77,-0.24],"Santiago: nine days ashore","point"],[[-91.35,-0.6],"Isabela","point"]],
 iconPins:[ic([-90.45,-1.28],"paw"),ic([-89.6,-0.9],"paw"),ic([-90.77,-0.24],"paw")],
 phPins:[ph([-91.0,-0.95],"A Galápagos giant tortoise"),ph([-90.3,-0.65],"A ground finch"),ph([-89.4,-0.75],"A blue-footed booby")],
 stat:"The islands’ vice-governor told Darwin he could tell which island a tortoise came from by its shell",
 body:"Darwin noticed the same thing in mockingbirds: each island seemed to have its own kind. Only back in London, in 1837, did the bird expert John Gould show him that his finches were a dozen or so separate species. Darwin began to think that species can split and change.",
 more:"Historians point out that the famous ‘finch moment’ is a myth: Darwin had not even labelled most of his finches by island. The mockingbirds were his real first clue. Today about 17 kinds of ‘Darwin’s finches’ are recognised."}),
S({title:"Tahiti and New Zealand",view:[-180,-45,-140,-10],globe:[-165,-28,2],card:"left",hiSoft:["nz"],lines:fl("tahiti","nz"),
 pins:[[[-149.49,-17.5],"Matavai Bay, Tahiti: November 1835","point"],[[174.1,-35.25],"Bay of Islands: December 1835","point"]],
 phPins:[ph([174.07,-35.27],"Waitangi, Bay of Islands"),ph([-149.48,-17.49],"Matavai Bay, painted in 1776")],
 stat:"After almost four weeks crossing the open Pacific, Darwin landed on Tahiti and climbed into its steep green mountains",
 body:"He admired the Tahitians and the island’s forests. In New Zealand he visited a mission farm and Māori villages, but was glad to leave. He noted how settlers’ animals and plants were already pushing out native ones: an early record of invasive species.",
 more:"The British signed the Treaty of Waitangi with Māori chiefs at the Bay of Islands just four years later, in 1840."}),
S({title:"Australia: a strange continent",view:[108,-46,158,-24],globe:[140,-35,2.4],card:"left",hiSoft:["au"],lines:fl("aus","tas","west"),
 pins:[[[151.21,-33.86],"Sydney: January 1836","point"],[[150.3,-33.7],"The Blue Mountains","point"],[[149.58,-33.42],"Bathurst","point"],[[147.33,-42.88],"Hobart, Tasmania","point"],[[117.88,-35.02],"King George Sound","point"]],
 phPins:[ph([150.31,-33.73],"The Blue Mountains"),ph([149.9,-33.5],"A platypus"),ph([151.21,-33.86],"Sydney Cove in 1792")],
 stat:"Watching a platypus near Bathurst, Darwin wondered if two different creators had been at work on the world",
 body:"He rode over the Blue Mountains to Bathurst. Australia’s pouched mammals, egg-laying platypus and strange plants seemed made on a different plan from anywhere else. Then he dropped the idea: the same kinds of laws, he decided, had simply worked in isolation here.",
 more:"He thought Sydney a remarkable new town, but wrote that he would not want to emigrate. He also saw how the arrival of Europeans was destroying the lives of Aboriginal people."}),
S({title:"Coral atolls: Cocos (Keeling)",view:[60,-30,175,22],globe:[120,-5,1.5],card:"left",lines:fl("cocos"),
 pins:[[[96.87,-12.17],"Cocos (Keeling): April 1836","point"],[[162.33,11.5],"Enewetak: drilled in 1952","point"],[[165.38,11.6],"Bikini Atoll","point"]],
 phPins:[ph([96.85,-12.15],"Cocos (Keeling) Islands"),ph([165.38,11.6],"Bikini Atoll")],
 stat:"Darwin worked out how a ring-shaped coral atoll forms before he ever saw one",
 body:"Corals grow only in warm, shallow, sunlit water. Darwin reasoned that a reef starts as a fringe round a volcanic island. As the island slowly sinks, the coral keeps growing upward, until only a ring is left round a lagoon. At Cocos (Keeling) he studied a real atoll and found his idea fitted.",
 more:"In 1952 American scientists drilled into Enewetak atoll and hit volcanic rock under more than a kilometre of coral: Darwin was right."}),
S({title:"Home by the Cape",view:[-85,-42,62,56],globe:[0,5,1.2],card:"left",lines:fl("cape","home"),
 pins:[[[57.5,-20.16],"Mauritius","point"],[[18.42,-33.92],"Cape Town: meets John Herschel","point"],[[-5.72,-15.93],"St Helena","point"],[[-14.4,-7.93],"Ascension","point"],[[-27.22,38.66],"The Azores","point"],[[-5.07,50.15],"Falmouth: 2 October 1836","point"]],
 phPins:[ph([-5.72,-15.93],"Jamestown, St Helena"),ph([57.35,-20.45],"Mauritius")],
 stat:"To finish its measurements of longitude, the Beagle crossed the Atlantic to Brazil once more before heading home",
 body:"The ship called at Mauritius, then Cape Town, where Darwin met the great astronomer John Herschel, who was puzzling over how new species appear. Mauritius, the Cape, St Helena and Ascension were all British by then: the Royal Navy’s stepping stones. Darwin landed at Falmouth on 2 October 1836 and never left Britain again.",
 more:"On St Helena he visited Napoleon’s first grave. The extra crossing to Bahia, so near the end, made the homesick Darwin furious."}),
S({title:"From the Beagle to the Origin",view:[-30,-15,140,60],globe:[50,25,1.2],card:"left",
 lines:[{coords:[[127.38,0.79],[100,5],[80,6],[55,13],[32.5,30],[15,37],[-5.6,36],[-0.13,51.5]],kind:"dash"}],
 pins:[[[0.05,51.33],"Down House, Kent: Darwin’s home from 1842","point"],[[-0.13,51.51],"London: the Linnean Society, 1 July 1858","point"],[[127.38,0.79],"Ternate: Wallace’s letter, 1858","point"]],
 iconPins:[ic([0.05,51.33],"book"),ic([127.38,0.79],"scroll")],
 stat:"Darwin waited more than 20 years before publishing On the Origin of Species, on 24 November 1859",
 body:"Back home he sorted his collections, married, and moved to Down House in Kent. By 1838 he had his key idea, natural selection, but kept testing it. In 1858 a letter came from Alfred Russel Wallace, working in the islands of south-east Asia, with the same idea. Their papers were read together in London that July.",
 more:"The Origin sold out on its first day. Darwin is buried in Westminster Abbey, near Isaac Newton."}),
S({title:"Now explore",view:W,globe:[-40,-10,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on Plates and Hazards and look down the west coast of South America, where Darwin felt the land rise. Switch on Currents to see the cold water that reaches the Galápagos. Then follow other voyages: try the Explorers tour."})];

const TOURS={
 bbeagle:{name:"The Voyage of the Beagle",short:"The Voyage of the Beagle",hint:"Charles Darwin’s 1839 travel book, on the map: Patagonia’s fossils, Tierra del Fuego, the Chile earthquake, the Andes, the Galápagos and coral atolls",steps:BEAGLE}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);

/* ---------- the Beagle sailing each leg (geoflock-walkers.js) and thermometers (geoflock-tourthermo.js) ---------- */
const later=fn=>{if(fn())return;let n=0;const t=setInterval(()=>{if(fn()||++n>60)clearInterval(t)},500)};
later(()=>{const Wk=window.gfWalkers;if(!Wk)return false;
 BEAGLE.forEach((St,i)=>{if(!(St.lines||[]).some(l=>l.kind==="flow"))return;const w={emoji:"⛵",name:"HMS Beagle",size:26,per:1,float:1};if(i===0){w.per=2;w.dur=30000}Wk["bbeagle|"+St.title]=w});
 return true});
later(()=>{const Th=window.gfTourThermo;if(!Th)return false;
 Th["bbeagle|Tierra del Fuego"]=[[-68.3,-54.8,"Ushuaia, Tierra del Fuego"],[-38.51,-12.97,"Salvador, Bahia"]];
 Th["bbeagle|Galápagos: islands of difference"]=[[-90.31,-0.74,"Puerto Ayora, Galápagos"],[-79.9,-2.19,"Guayaquil, Ecuador"]];
 return true});

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bbeagle={mid:[
 {at:"Giant bones at Punta Alta",st:"Giant bones at Punta Alta",q:"In which country did Darwin dig up giant ground-sloth fossils?",o:["Brazil","Argentina","Peru","Chile"],a:1,why:"At Punta Alta, near Bahía Blanca.",kc:"ar"},
 {at:"The earthquake at Concepción",st:"The earthquake at Concepción",q:"What did FitzRoy measure after the 1835 earthquake in Chile?",o:["The sea had risen","The land had been lifted","A new island had formed","The river had changed course"],a:1,why:"By two to three metres around Concepción.",kc:"cl"},
 {at:"Tortoises, mockingbirds and finches",st:"Tortoises, mockingbirds and finches",q:"The Galápagos Islands belong to which country?",o:["Peru","Colombia","Ecuador","Chile"],a:2,why:"About 1,000 km off its coast.",kc:"ec"}],
 recap:[
 {q:"Who was the captain of HMS Beagle?",o:["James Cook","Robert FitzRoy","Horatio Nelson","John Franklin"],a:1,why:"He was 26 when the voyage began.",st:"Plymouth, 1831: a young man joins",kc:"gb"},
 {q:"How did Darwin explain ring-shaped coral atolls?",o:["Coral grows on a sinking island","Coral grows round meteor craters","Waves pile up sand","Coral grows in deep, dark water"],a:0,why:"Drilling at Enewetak proved him right.",st:"Coral atolls: Cocos (Keeling)",kc:"au"},
 {q:"When was On the Origin of Species published?",o:["1836","1842","1859","1882"],a:2,why:"More than 20 years after the voyage.",st:"From the Beagle to the Origin",kc:"gb"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bbeagle|The Voyage of the Beagle":"Galápagos giant tortoise (Chelonoidis niger hoodensis).jpg","bbeagle|Plymouth, 1831: a young man joins":"Land's End, Cornwall, England.jpg",
 "bbeagle|Cape Verde: rocks that rose":"Praia Cabo Verde.jpg","bbeagle|Bahia: into the rainforest":"Centro Histórico Salvador Vista Aérea 2021-0933.jpg",
 "bbeagle|Giant bones at Punta Alta":"Nandu Rhea americana Tierpark Hellabrunn-1.jpg","bbeagle|Tierra del Fuego":"ARG-2016-Aerial-Tierra del Fuego (Ushuaia)–Valle Carbajal 01.jpg",
 "bbeagle|Patagonia: a land that rose":"Perito Moreno Glacier Patagonia Argentina Luca Galuzzi 2005.JPG","bbeagle|The earthquake at Concepción":"Hornopirén and hualiaque or apagado volcanoes chile x region.jpg",
 "bbeagle|Seashells on the Andes":"Aconcagua Provincial Park 04.jpg","bbeagle|Galápagos: islands of difference":"Iguana marina (Amblyrhynchus cristatus), Las Bachas, isla Santa Cruz, islas Galápagos, Ecuador, 2015-07-23, DD 23.jpg",
 "bbeagle|Tortoises, mockingbirds and finches":"Medium ground finch on Floreana Island in the Galápagos Islands.jpg","bbeagle|Tahiti and New Zealand":"Hodges, Resolution and Adventure in Matavai Bay.jpg",
 "bbeagle|Australia: a strange continent":"Blue mountains - three sisters.jpg","bbeagle|Coral atolls: Cocos (Keeling)":"Cocos (Keeling) Islands 2017 (31).jpg",
 "bbeagle|Home by the Cape":"Cape Town (ZA), Table Mountain -- 2024 -- 2825.jpg","bbeagle|From the Beagle to the Origin":"Darwin's finches by Gould.jpg",
 "bbeagle|Now explore":"Galapagos giant tortoise, head (Chelonoidis niger hoodensis).jpg"};
const PIN={
 "Salvador, Bahia":"Centro Histórico Salvador Vista Aérea 2021-0933.jpg","Ushuaia, Tierra del Fuego":"Moored boats and edge of town Ushuaia Argentina Coral Prines.jpg",
 "A Galápagos giant tortoise":"20180809-Galápagos giant tortoise eating leaves (9960).jpg","Aconcagua":"Aconcagua 13.JPG","Cocos (Keeling) Islands":"Cocos (Keeling) Islands (32206670676).jpg",
 "Table Mountain":"Table Mountain from Blouberg, South Africa (4028515275).jpg","The Blue Mountains":"Jamison Valley, Blue Mountains, Australia - Nov 2008.jpg",
 "Fogo volcano":"Cape Verde Pico do Fogo wide.jpg","Sugarloaf, Rio de Janeiro":"Sugarloaf Sunrise 2.jpg",
 "A rhea":"Nandu Rhea americana Tierpark Hellabrunn-1.jpg","A three-toed sloth today":"Three-toed sloth mother and baby.jpg","Cape Horn":"00 2477 Cape Horn - Chile.jpg",
 "Penguins in the Falklands":"Falkland Islands Penguins 49.jpg","Mount Fitz Roy":"Fitz Roy 2.jpg","The Valdivian rainforest":"Valdivian rainforest.jpg",
 "A Galápagos penguin":"Galápagos penguin (Spheniscus mendiculus) male.jpg","A marine iguana":"Marine iguana, Plaza island, July 13, 2025.jpg",
 "A ground finch":"Large Ground Finch.jpg","A blue-footed booby":"Blue footed booby courtship display.jpg","Waitangi, Bay of Islands":"00 27 0577 Waitangi, New Zealand - Treaty House.jpg",
 "Matavai Bay, painted in 1776":"Hodges, Resolution and Adventure in Matavai Bay.jpg","A platypus":"Duck-billed platypus (Ornithorhynchus anatinus) Scottsdale.jpg",
 "Sydney Cove in 1792":"View of Sydney Cove 1792.jpg","Bikini Atoll":"Bikini Atoll, Marshall Islands (35055478541).jpg","Jamestown, St Helena":"St-Helena-Jamestown.jpg",
 "Mauritius":"Le Morne Peninsula in Mauritius (53697779236).jpg"};
/* new photos (GF_BBEAGLE_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BBEAGLE_PHOTOS||[];
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
/* covers for the Guided tours page cards */
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bbeagle:"Galápagos giant tortoise (Chelonoidis niger hoodensis).jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
