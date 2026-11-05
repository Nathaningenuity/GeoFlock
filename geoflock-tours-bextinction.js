/* GeoFlock: a Mapped books tour.
   bextinction  "The Sixth Extinction"   Elizabeth Kolbert, 2014
   Each stop goes to one of the places Kolbert visited and shows her point on the map. Her ideas are summarised in our own
   words and presented as her views; where scientists disagree, or the story has moved on since 2014, the card says so in a
   line. No book covers or long quotes.
   The tour runs on the Relief map; one stop uses the Nature map (mode:"nature", nsub:"forest", forest cover) through
   the shared stopModes switch (no History-map stop: that would turn the whole tour into a History-map tour,
   geoflock-tourhist.js). Stops use the ice-age sea level (gfSea:-120), circles (lines {circle,km}), the ruler (gfRuler), a
   height cross-section in the card (xsec), diagrams from the shared library (PS_DIAG: earthday, oceanph, islfrag,
   humtime) and travellers along the stops' flow lines (window.gfWalkers, geoflock-walkers.js): the frog fungus, the bat
   fungus, sailors' ships, and the Neanderthal walker of the Human journey tour.
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BEXTINCTION_PHOTOS.
   WANT_PHOTOS: [
    ["Atelopus zeteki1.jpg","The Panamanian golden frog"],
    ["Mammut americanum.jpg","Cuvier’s mastodon"],
    ["Pinguinus impennis.jpg","The great auk"],
    ["Gubbio Bottaccione K-T boundary.jpg","Gubbio: the clay at the end of the dinosaurs"],
    ["Castello Aragonese Ischia.jpg","Ischia: a sea turning sour"],
    ["One Tree Island.jpg","One Tree Island"],
    ["White-nose syndrome little brown bat.jpg","Bats and white-nose syndrome"],
    ["Sumatran Rhino 2.jpg","The last Sumatran rhinos"],
    ["Alala (Corvus hawaiiensis).jpg","The Frozen Zoo"]]
   (Commons names not checked: Wikimedia was rate-limiting.) */
window.GF_BEXTINCTION_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bextinction:"#6f7a50"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* =====================================================================================================
   The Sixth Extinction (Elizabeth Kolbert, 2014)
   ===================================================================================================== */
const EXT=[
S({title:"The Sixth Extinction",view:W,globe:[-30,15,1],
 phPins:[ph([-84.8,10.3],"Monteverde cloud forest"),ph([152.09,-23.51],"Bleached coral"),ph([-60,-3],"The Amazon from the air"),ph([6.95,51.23],"A Neanderthal, reconstructed"),ph([-52.7,47.57],"St John’s, Newfoundland"),ph([102,-0.5],"A Sumatran tiger"),ph([14.25,40.83],"The Bay of Naples")],
 stat:"Elizabeth Kolbert’s 2014 book argues that people are causing the sixth mass extinction in the history of life",
 body:"Kolbert, a journalist at The New Yorker, travels from the cloud forests of Panama to a coral reef, a cave in Vermont and a zoo in Ohio. At each stop she meets scientists watching species disappear. Five times in the last 500 million years, most life on Earth was wiped out. This time, she argues, the asteroid is us.",
 more:"The book won the 2015 Pulitzer Prize for general nonfiction. Scientists still debate whether today’s losses already count as a mass extinction or are on the way to becoming one; few doubt that extinction rates are far above normal."}),
S({title:"The Panamanian golden frog",view:[-88,5,-76,13],globe:[-81.5,9,5],card:"left",hi:["pa"],hiSoft:["cr"],
 lines:[{coords:[[-84.8,10.3],[-83.6,9.6],[-82.2,8.75],[-81.2,8.62],[-80.6,8.63],[-80.13,8.6],[-78.5,8.4],[-77.6,7.9]],kind:"flow"}],
 pins:[[[-84.8,10.3],"Monteverde: golden toad, last seen 1989","point"],[[-82.2,8.75],"Fortuna, 1996","point"],[[-80.6,8.63],"El Copé, 2004","point"],[[-80.13,8.6],"El Valle, 2006","point"]],
 iconPins:[ic([-80.13,8.6],"paw")],
 phPins:[ph([-84.8,10.3],"Monteverde cloud forest")],
 stat:"A fungus moved through Central America at about 30 km a year, killing frogs as it went",
 body:"Kolbert starts at El Valle in Panama, home of the golden frog, a national symbol. A chytrid fungus, Batrachochytrium dendrobatidis, swept south-east from Costa Rica (follow it along the arrow), killing whole populations. Scientists rushed frogs into a rescue centre at El Valle just ahead of it. The golden frog now survives only in captivity.",
 more:"The fungus seems to have spread round the world with the global trade in amphibians, possibly from East Asia. Amphibians are today the most threatened class of animals; chytrid has since been linked to declines in some 500 species. Pictured: a red-eyed tree frog, another Central American frog."}),
S({title:"Cuvier’s mastodon",view:[-128,18,12,62],globe:[-55,42,1.4],card:"left",gfSea:-120,gfRuler:{a:[-84.75,38.88],b:[2.36,48.84]},
 pins:[[[-84.75,38.88],"Big Bone Lick, Kentucky, 1739","point"],[[2.36,48.84],"Paris: Cuvier’s lecture, 1796","point"]],
 iconPins:[ic([-84.75,38.88],"paw")],
 phPins:[ph([-123.37,48.42],"A woolly mammoth, reconstructed")],
 stat:"In 1796 the French naturalist Georges Cuvier argued that whole species could vanish for ever",
 body:"Huge bones and teeth found at Big Bone Lick, in Kentucky, were shipped to Paris (drag the ruler). Cuvier saw they belonged to no living elephant: the mastodon, like the mammoth, was gone. Kolbert calls this the discovery of extinction itself. The pale blue shows the coasts of the last ice age, when mastodons still roamed North America.",
 more:"Before Cuvier, many thought God would never let a species die out: Thomas Jefferson hoped Lewis and Clark might find living mastodons in the West. Cuvier believed in sudden catastrophes; Darwin and Lyell later argued that extinction was slow."}),
S({title:"The great auk",view:[-64,40,0,68],globe:[-30,55,2],card:"left",
 lines:[{coords:[[-4.5,48.4],[-20,49],[-40,49.5],[-53.18,49.76]],kind:"flow"},{coords:[[-1.5,53],[-20,57],[-40,53],[-53.18,49.76]],kind:"flow"}],
 pins:[[[-53.18,49.76],"Funk Island","point"],[[-22.96,63.74],"Eldey: the last pair, 1844","point"],[[-8.58,57.81],"St Kilda","point"]],
 iconPins:[ic([-53.18,49.76],"penguin"),ic([-22.96,63.74],"penguin")],
 phPins:[ph([-21.12,64.26],"Iceland")],
 stat:"The great auk, a flightless seabird almost 1 m tall, was the original ‘penguin’; the last known pair was killed in 1844",
 body:"Hundreds of thousands of auks nested on Funk Island off Newfoundland. From the 1500s European fishing crews (the arrows) herded them onto their boats for meat, eggs, feathers and bait. By the 1840s the last birds lived on Eldey, a rock off Iceland, where two were strangled for a collector.",
 more:"The name penguin was first given to the great auk; explorers later gave it to the southern birds that look like it. Kolbert uses the auk to show that people could wipe out a species that had once seemed endlessly abundant."}),
S({title:"Gubbio: the clay at the end of the dinosaurs",view:[-102,8,22,52],globe:[-40,32,1.4],card:"left",gfRuler:{a:[12.58,43.36],b:[-89.5,21.3]},
 lines:[{circle:[-89.5,21.3],km:90,kind:"circle"},{circle:[-89.5,21.3],km:1500,kind:"circle"}],
 pins:[[[12.58,43.36],"Gubbio: the Bottaccione gorge","point"],[[-89.5,21.3],"Chicxulub crater","point"]],
 iconPins:[ic([-89.5,21.3],"flame")],
 phPins:[ph([-89.6,20.97],"A meteorite")],
 stat:"In a gorge near Gubbio, Italy, a thin layer of clay marks the moment 66 million years ago when the dinosaurs died",
 body:"In 1980 the geologist Walter Alvarez and his father Luis, a physicist, found the clay full of iridium, a metal rare on Earth but common in asteroids. They proposed an asteroid strike. In 1991 its crater was identified, some 180 km wide (the small circle), at Chicxulub in Mexico, over 9,000 km from Gubbio (drag the ruler).",
 more:"Kolbert follows the ammonites, which flourished for 300 million years and then vanished, while some groups survived by luck. Many geologists at first scoffed at the Alvarez idea; most now accept it, though some think huge volcanic eruptions in India also played a part."}),
S({title:"The Big Five and the Anthropocene",view:W,globe:[40,30,1],card:"left",
 pins:[[[-3.27,55.42],"Dob’s Linn: end-Ordovician, 445 million years ago","point"],[[119.7,31.08],"Meishan: end-Permian, 252 million","point"],[[100,63],"Siberian Traps: the Permian’s volcanoes","point"],[[12.58,43.36],"Gubbio: end-Cretaceous, 66 million","point"]],
 iconPins:[ic([100,63],"volcano")],
 stat:"In the worst of the five, at the end of the Permian, roughly nine in ten species in the sea died",
 body:"Kolbert visits Dob’s Linn in Scotland, where tiny fossils called graptolites vanish from the rocks at the first great extinction. Her guide there, the geologist Jan Zalasiewicz, led the push to name our own time the Anthropocene, the age of humans. The chart in the card squeezes Earth’s history into one day: all of human history fits in the last few seconds.",
 more:"The causes differ: ice ages, giant volcanic eruptions that changed the air and sea, an asteroid. Geologists voted in 2024 not to make the Anthropocene an official unit of time, though the word is widely used."}),
S({title:"Ischia: a sea turning sour",view:[12.5,39.8,15.5,41.6],globe:[13.96,40.73,7],card:"left",
 lines:[{circle:[13.965,40.731],km:0.6,kind:"circle"}],
 pins:[[[13.965,40.731],"Castello Aragonese: CO₂ vents","point"],[[14.25,40.83],"Naples","point"]],
 iconPins:[ic([13.965,40.731],"wave")],
 phPins:[ph([14.25,40.84],"The Bay of Naples")],
 stat:"Off a castle on the island of Ischia, volcanic vents bubble carbon dioxide into the sea, making a preview of the oceans’ future",
 body:"Near the vents the water is as acidic as the open ocean may be by 2100. Kolbert swims there with the biologist Jason Hall-Spencer: barnacles, urchins and snails that build shells disappear; weedy seagrass and algae take over. The sea has absorbed about a third of the carbon dioxide we have released, and become about 30% more acidic since 1800. Try the card’s chart.",
 more:"Scientists have called acidification global warming’s ‘evil twin’. Kolbert argues that it threatens the tiny shelled plankton at the base of ocean food chains, and coral reefs."}),
S({title:"One Tree Island",view:[140,-30,160,-10],globe:[150,-21,3.5],card:"left",hi:["au"],
 pins:[[[152.09,-23.51],"One Tree Island","point"],[[151.91,-23.44],"Heron Island","point"]],
 iconPins:[ic([152.09,-23.51],"fish")],
 phPins:[ph([150,-19.5],"The Great Barrier Reef from the air")],
 stat:"Coral reefs cover a tiny share of the sea floor but are home to perhaps a quarter of all marine species",
 body:"On One Tree Island, at the southern end of the Great Barrier Reef, Kolbert joins scientists measuring how fast the reef grows. Corals build their skeletons from calcium carbonate; as seawater becomes more acidic and warmer, that gets harder. Some researchers she meets think reefs could start to dissolve this century.",
 more:"Since the book came out, heatwaves have bleached the Great Barrier Reef again and again: in 2016, 2017, 2020, 2022 and 2024. Pictured: bleached coral, white where the corals have lost the algae that feed them."}),
S({title:"Islands in the Amazon",view:[-74,-14,-46,5],globe:[-60,-3,3.5],card:"left",mode:"nature",nsub:"forest",
 lines:[{circle:[-59.9,-2.4],km:12,kind:"circle"}],
 pins:[[[-59.9,-2.4],"Reserve 1202 and the forest fragments","point"],[[-60.02,-3.12],"Manaus","point"]],
 iconPins:[ic([-59.9,-2.4],"tree")],
 phPins:[ph([-59.9,-3.13],"The meeting of the waters, Manaus"),ph([-62.5,-4.5],"Slash and burn")],
 stat:"North of Manaus, the forest has been cut into ‘islands’ of 1, 10 and 100 hectares on purpose, to see what dies",
 body:"This is the Nature map’s forest cover: around Manaus the forest is still almost unbroken. In 1979 the biologist Thomas Lovejoy persuaded ranchers clearing land for cattle to leave square patches of forest standing. Kolbert visits one, Reserve 1202. The smaller the fragment, the faster it loses its species: first the army ants and the birds that follow them, then many more.",
 more:"The card’s diagram shows why: cut a forest into pieces and each piece holds fewer species than the whole did. Kolbert links this to a wider world where roads, farms and cities chop every habitat into islands."}),
S({title:"Trees climbing the Andes",view:[-76,-16,-66,-9],globe:[-71.5,-12.5,5],card:"left",hi:["pe"],gfThr:{kind:"elev",v:3000},
 xsec:{title:"Manu, Peru: from the Amazon up to the high Andes",pts:[[-71.4,-11.89,"Amazon lowlands"],[-71.3,-12.3],[-71.25,-12.6],[-71.3,-12.9,"Pilcopata"],[-71.45,-13.05],[-71.59,-13.18,"Wayqecha"],[-71.62,-13.12,"Tres Cruces"]],mark:3000,note:"The dashed line marks 3,000 m. In a few dozen kilometres the forest climbs from the Amazon to the treeline."},
 pins:[[[-71.59,-13.18],"Wayqecha research station","point"],[[-71.4,-11.89],"Manu National Park","point"]],
 iconPins:[ic([-71.59,-13.18],"tree")],
 phPins:[ph([-77.8,-0.99],"The Amazon’s treetops")],
 stat:"As the climate warms, tropical trees must move uphill to stay cool, but most are moving too slowly",
 body:"Kolbert walks with the ecologist Miles Silman up a chain of forest plots in Peru’s Manu National Park, from the Amazon lowlands to the cold grassland at 3,500 m (the cross-section in the card; land above 3,000 m is shaded). By counting seedlings in each plot, his team found trees creeping upslope, on average a few metres a year.",
 more:"That is slower than the warming demands. Species at the top of the mountain have nowhere higher to go. Kolbert asks what happens to the lowland rainforest, already the hottest, when it warms beyond anything trees there have lived through."}),
S({title:"Bats and white-nose syndrome",view:[-128,26,-62,52],globe:[-90,40,1.8],card:"left",hi:["us"],
 lines:[{coords:[[-74.4,42.69],[-73.03,43.08]],kind:"flow"},{coords:[[-74.4,42.69],[-77.5,40.8],[-80,38.5],[-85,36]],kind:"flow"},{coords:[[-80,38.5],[-87,38],[-92.5,38],[-96,36.5]],kind:"flow"},{coords:[[-74.4,42.69],[-79,44],[-81.5,46.5]],kind:"flow"},{coords:[[-92.5,38],[-105,43],[-121.8,47.5]],kind:"dash"}],
 pins:[[[-74.4,42.69],"Howes Cave, near Albany: first seen 2006","point"],[[-73.03,43.08],"Aeolus Cave, Vermont","point"],[[-121.8,47.5],"Washington state, 2016","point"]],
 iconPins:[ic([-74.4,42.69],"paw")],
 phPins:[ph([-116,39],"A hoary bat")],
 stat:"A fungus from Europe, first photographed in a cave near Albany, New York, in 2006, has killed millions of North American bats",
 body:"Kolbert crawls into Aeolus Cave in Vermont, where hibernating little brown bats lay dead in heaps. White-nose syndrome wakes them in winter so they burn their fat and starve. The fungus spread from cave to cave across the continent (the arrows), and in 2016 jumped to Washington state (dashed). Kolbert calls this the New Pangaea: people move species around the world faster than ever.",
 more:"European bats live with the fungus, which probably arrived on a caver’s boots or gear. In some caves in the north-east over 90% of the bats died. Pictured: a hoary bat, another North American bat."}),
S({title:"The last Sumatran rhinos",view:[90,-10,122,10],globe:[105,0,3],card:"left",hi:["id","my"],
 lines:[{coords:[[-84.51,39.14],[-130,45],[170,40],[130,15],[105.77,-4.93]],kind:"dash"}],
 pins:[[[105.77,-4.93],"Way Kambas: the rhino sanctuary","point"],[[117,5.3],"Sabah, Borneo: the last Malaysian rhino died, 2019","point"],[[97.5,4],"Leuser, Sumatra","point"]],
 iconPins:[ic([105.77,-4.93],"paw"),ic([97.5,4],"paw")],
 phPins:[ph([102,-1],"A Sumatran tiger"),ph([98.3,3.5],"A Sumatran orangutan")],
 stat:"Sumatran rhinos, the smallest and hairiest rhinos, are down to perhaps a few dozen animals",
 body:"Kolbert meets Suci, a Sumatran rhino born at Cincinnati Zoo, where keepers struggled for years to breed the species. Her brother Andalas was flown to a sanctuary on Sumatra (the dashed line), where he fathered a calf in 2012. Logging, poaching and tiny, scattered populations have driven the species to the edge.",
 more:"Suci died in 2014. Malaysia’s last rhino, Iman, died in 2019. A few more calves have been born at Way Kambas since, but every one counts."}),
S({title:"Where people arrived, big animals vanished",view:W,globe:[100,0,1],card:"left",gfSea:-120,
 pins:[[[134,-25],"Australia: giant animals gone about 45,000 years ago","point"],[[-100,42],"North America: mammoths and mastodons, about 13,000","point"],[[172,-43],"New Zealand: the moa, about 1400","point"],[[46.9,-19],"Madagascar: elephant birds, about 1000","point"]],
 iconPins:[ic([134,-25],"paw"),ic([-100,42],"paw"),ic([172,-43],"paw"),ic([46.9,-19],"paw")],
 phPins:[ph([170.5,-45.87],"A moa skeleton"),ph([1.17,45.05],"Ice-age animals painted at Lascaux")],
 stat:"Wherever modern humans arrived, the biggest animals tended to disappear soon after",
 body:"The pale blue shows the coasts of the ice age, when the sea was up to 120 m lower and modern humans spread round the world. Kolbert sets out the case that hunting by our ancestors wiped out the ice-age giants: giant kangaroos and wombats in Australia, mammoths and ground sloths in the Americas, moas in New Zealand. The dates of extinction follow the dates of arrival.",
 more:"This ‘overkill’ idea is still argued over. Many scientists think changing climate at the end of the ice age played a big part, especially in Eurasia and North America; on islands like New Zealand, the evidence against people is strongest."}),
S({title:"Neanderthals in us",view:[-15,30,95,62],globe:[40,46,1.5],card:"left",
 pins:[[[6.95,51.23],"The Neander valley, 1856","point"],[[12.39,51.32],"Leipzig: Svante Pääbo’s lab","point"],[[-5.34,36.12],"Gibraltar: some of the last Neanderthals","point"]],
 iconPins:[ic([12.39,51.32],"atom")],
 phPins:[ph([6.95,51.23],"A Neanderthal, reconstructed"),ph([0.5,45],"A Neanderthal skull")],
 stat:"Neanderthals lived across Europe and western Asia for over 300,000 years and vanished about 40,000 years ago",
 body:"In Leipzig Kolbert meets Svante Pääbo, whose team read the Neanderthal genome in 2010. It showed that most people whose families come from outside Africa carry about 2% Neanderthal DNA: our ancestors met them and had children together. Kolbert sees the Neanderthals as perhaps the first species our own kind helped push out.",
 more:"Why they disappeared is still debated: competition with us, climate swings, small numbers, or being absorbed into our population. Pääbo won the Nobel Prize in 2022."}),
S({title:"The Frozen Zoo",view:[-165,10,-100,40],globe:[-135,25,1.6],card:"left",
 lines:[{coords:[[-116.99,33.1],[-140,26],[-155.3,19.5]],kind:"dash"}],
 pins:[[[-116.99,33.1],"San Diego: the Frozen Zoo","point"],[[-155.3,19.5],"Hawaii: the ‘alalā, or Hawaiian crow","point"]],
 iconPins:[ic([-116.99,33.1],"snow")],
 phPins:[ph([-159.5,22.05],"A nēnē, Hawaii’s goose"),ph([-156.2,20.7],"A Hawaiian honeycreeper")],
 stat:"In San Diego, cells from thousands of animals are kept in liquid nitrogen, in case they are needed one day",
 body:"Kolbert ends with the people trying to save what they can: the Frozen Zoo, and keepers coaxing the last Hawaiian crows to breed. The ‘alalā vanished from the wild in 2002. She argues that the same human ingenuity that is causing the extinction is also our only hope of slowing it.",
 more:"Hawaii has lost more bird species than anywhere else in the US. Some recoveries have worked: the nēnē, Hawaii’s goose, fell to about 30 birds in the 1950s and now numbers in the thousands. Releases of ‘alalā since 2016 have so far struggled."}),
S({title:"Now explore",view:W,globe:[-30,15,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch to the Nature map and compare forest cover and forest change around the Amazon and Borneo. Try the Ocean life and Forests tours to see reefs and rainforests up close, and Collapse for societies that damaged their own environments."})];

const TOURS={
 bextinction:{name:"The Sixth Extinction",short:"The Sixth Extinction",hint:"Elizabeth Kolbert’s 2014 book, on the map: Panama’s golden frog, the mastodon, the great auk, Gubbio, Ischia, the Great Barrier Reef, the Amazon, bats, rhinos and Neanderthals",steps:EXT}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"bc45000/sap") is set up as if the tour ran on that map */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- the Nature map stop picks its tab (nsub), as the Living planet tours do (geoflock-tours-living.js) ---------- */
function natSync(){try{if(!mine()||typeof allMapsColorMode==="undefined"||allMapsColorMode!=="nature")return;const St=psSteps()[ps.i];if(!St||!St.nsub)return;
 if(typeof allMapsSubMode!=="undefined"&&allMapsSubMode.nature!==St.nsub){const b=document.querySelector('#allMapsSubModes [data-allmaps-sub="'+St.nsub+'"]');if(b)b.click()}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);if(mine())[400,1300,2600,5000,8000].forEach(t=>setTimeout(natSync,t));return r}}

/* ---------- diagrams in the card (shared library) ---------- */
try{if(typeof PS_DIAG!=="undefined"&&typeof DG!=="undefined"){const D={"bextinction|The Big Five and the Anthropocene":"earthday","bextinction|Ischia: a sea turning sour":"oceanph","bextinction|Islands in the Amazon":"islfrag","bextinction|Neanderthals in us":"humtime"};for(const k in D)if(DG[D[k]])PS_DIAG[k]=D[k]}}catch(e){}

/* ---------- travellers along the stops’ flow lines (geoflock-walkers.js); the Neanderthal borrows the Human journey tour's walker ---------- */
const WALK={
 "bextinction|The Panamanian golden frog":{emoji:"🍄",name:"The chytrid fungus on the move",size:22,per:2},
 "bextinction|The great auk":{emoji:"⛵",name:"European fishing boats",size:24,per:1,float:1},
 "bextinction|Bats and white-nose syndrome":{emoji:"🦇",name:"White-nose syndrome spreading from cave to cave",size:22,per:1}};
const addW=()=>{try{const G=window.gfWalkers;if(!G)return;for(const k in WALK)if(!G[k])G[k]=WALK[k];const N=G["humans|Many kinds of human"];if(N&&!G["bextinction|Neanderthals in us"])G["bextinction|Neanderthals in us"]=N}catch(e){}};addW();addEventListener("load",addW);

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bextinction={mid:[
 {at:"The Panamanian golden frog",st:"The Panamanian golden frog",q:"What has been killing Central America’s frogs?",o:["A virus","A chytrid fungus","Snakes","Pesticides"],a:1,why:"It swept from Costa Rica into Panama.",kc:"pa"},
 {at:"Gubbio: the clay at the end of the dinosaurs",st:"Gubbio: the clay at the end of the dinosaurs",q:"Which metal in Gubbio’s clay pointed to an asteroid strike?",o:["Gold","Iridium","Uranium","Iron"],a:1,why:"Rare on Earth but common in asteroids.",kc:"it"},
 {at:"Ischia: a sea turning sour",st:"Ischia: a sea turning sour",q:"What bubbles out of the vents near Ischia’s castle?",o:["Methane","Carbon dioxide","Oxygen","Steam"],a:1,why:"It makes the water more acidic, like tomorrow’s oceans.",kc:"it"}],
 recap:[
 {q:"Where did the last known pair of great auks live?",o:["Funk Island","Eldey, off Iceland","St Kilda","Greenland"],a:1,why:"They were killed in 1844.",st:"The great auk",kc:"is"},
 {q:"Who argued in 1796 that species could go extinct?",o:["Charles Darwin","Georges Cuvier","Thomas Jefferson","Charles Lyell"],a:1,why:"From mastodon bones found in Kentucky.",st:"Cuvier’s mastodon",kc:"fr"},
 {q:"About how much Neanderthal DNA do most people from outside Africa carry?",o:["None","About 2%","About 20%","About 50%"],a:1,why:"Svante Pääbo’s team read the Neanderthal genome in 2010.",st:"Neanderthals in us",kc:"de"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bextinction|The Sixth Extinction":"Coral Outcrop Flynn Reef.jpg","bextinction|The Panamanian golden frog":"Red eyed tree frog edit2.jpg",
 "bextinction|Cuvier’s mastodon":"Woolly mammoth model Royal BC Museum in Victoria.jpg","bextinction|The great auk":"The Battery, St John's, Newfoundland.jpg",
 "bextinction|Gubbio: the clay at the end of the dinosaurs":"Miller Range, Antarctica - Meteorite (2).jpg","bextinction|The Big Five and the Anthropocene":"Dodo Skeleton at the ROM.jpg",
 "bextinction|Ischia: a sea turning sour":"The harbor of Naples and Vesuvius at dawn. Italy.jpg","bextinction|One Tree Island":"Bleached Staghorn Coral.jpg",
 "bextinction|Trees climbing the Andes":"Amazon rainforest treetops in Tena, Ecuador.jpg","bextinction|Islands in the Amazon":"Aerial view of the Amazon Rainforest.jpg",
 "bextinction|Bats and white-nose syndrome":"Hawaiian hoary bat Lasiurus cinereus semotus.jpg","bextinction|The last Sumatran rhinos":"Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 4.jpg",
 "bextinction|Where people arrived, big animals vanished":"Giant Haasts eagle attacking New Zealand moa.jpg","bextinction|Neanderthals in us":"La Qhina 18 Rekonstruktion, Museum Neanderthal.jpg",
 "bextinction|The Frozen Zoo":"Nēnē, or Hawaiian goose, in Kaua'i (52218223488).jpg","bextinction|Now explore":"Monteverde bosque.jpg"};
const PIN={
 "Monteverde cloud forest":"Monteverde Cloud Forest 01.jpg","Bleached coral":"Bleached Staghorn Coral.jpg","The Amazon from the air":"Aerial view of the Amazon Rainforest.jpg",
 "A Neanderthal, reconstructed":"Neanderthal man reconstruction, Natural History Museum, London.jpg","St John’s, Newfoundland":"The Battery, St John's, Newfoundland.jpg",
 "A Sumatran tiger":"Panthera tigris sumatran subspecies.jpg","The Bay of Naples":"Naples, Italy, A view over Bay of Naples, Port of Naples and Mt. Vesuvius.jpg",
 "A woolly mammoth, reconstructed":"Woolly mammoth model Royal BC Museum in Victoria.jpg","Iceland":"Thingvellir, Iceland (21677114683).jpg","A meteorite":"Miller Range, Antarctica - Meteorite (2).jpg",
 "The Great Barrier Reef from the air":"Aerial View of Great Barrier Reef (Ank Kumar) 05.jpg","The Amazon’s treetops":"Amazon rainforest treetops in Tena, Ecuador.jpg",
 "The meeting of the waters, Manaus":"The Meeting of the Waters, Manaus, Brazil.jpg","Slash and burn":"Slash and burn in the rainforest.jpg","A hoary bat":"Hawaiian hoary bat Lasiurus cinereus semotus.jpg",
 "A Sumatran orangutan":"Sumatran Orangutan male.jpg","A moa skeleton":"Upland moa skeleton, Otago Museum, 2016-01-29.jpg","Ice-age animals painted at Lascaux":"Lascaux painting.jpg",
 "A Neanderthal skull":"Neanderthal skull.jpg","A nēnē, Hawaii’s goose":"Nēnē, or Hawaiian goose, in Kaua'i (52218223488).jpg","A Hawaiian honeycreeper":"Hawaii Amakihi (Chlorodrepanis virens) Molokai, Hawaii.jpg"};
/* new photos (GF_BEXTINCTION_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BEXTINCTION_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bextinction:"Bleached Staghorn Coral.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
