/* GeoFlock: the 2026-10-30 tour review, applied to the Living planet and People & culture shelves.
   Living planet: environment, animals, humans, islandlife, biomes, forests, ocean, amigration, crops.
   People & culture: food, landmarks (reworked), migration, culture (Languages), flags, cities (reworked), langrel,
   people, sports, festivals, houses.
   What it does, tour by tour: new stops (place, then mechanism, then result), merged or removed stops that repeated
   another tour, renamed stops whose titles were used elsewhere, small text fixes, and map work where it helps the point
   (arrows, rulers, cross-sections in the card, the sea-level slider, day and night, lit biomes, highlighted countries,
   photo pins). The two reworked tours (Landmarks, Cities) are cut, merged and reordered as well.
   Every patch is keyed by tour id and stop title, so a stop renamed or removed elsewhere is simply skipped. The tours can
   rebuild their step arrays late, so the patch is guarded by a flag on the steps array (steps._rvLife) and re-run at
   0, 1.5, 5 and 12 s. Fields some files lock with getters are written with defineProperty; photo-pin lists are locked
   (as in geoflock-polish-k.js). Card photos are keyed "tour|title" in PS_PHOTO, so renamed stops keep theirs.
   New photos: Wikimedia Commons, free licences only (listed in GF_RVLIFE_PHOTOS with author, licence and page); the rest
   come from the shared library. Load after the other tour files and polish patches. */
window.GF_RVLIFE_PHOTOS=[{"f": "Vaquita6 Olson NOAA.jpg", "d": "photos/x946d64dc4b6c4969.webp", "by": "Paula Olson, NOAA", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Vaquita6_Olson_NOAA.jpg"}, {"f": "Saiga antelope at the Stepnoi Sanctuary.jpg", "d": "photos/xa10a5245138fafea.webp", "by": "Andrey Giljov", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Saiga_antelope_at_the_Stepnoi_Sanctuary.jpg"}];
(function(){
if(typeof PS_TOURS==="undefined")return;
const W=[-180,-58,180,80];
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});
const P=(at,label)=>[at,label,"point"];
const T=id=>{try{const t=PS_TOURS[id];return t&&Array.isArray(t.steps)&&t.steps.length?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s&&s.title===title):null};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();

/* ---------- photos ---------- */
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_RVLIFE_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[strip(q.label)]=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
/* photo pins whose file is not in the library are left out (never an empty frame) */
const okPins=a=>(a||[]).filter(q=>!q._f||libIdx(q._f)>=0);
const CARD={};   /* "tour|title" → library file, filled in below */
function cards(){try{if(typeof PS_PHOTO==="undefined")return;for(const k in CARD){const i=libIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}}catch(e){}}

/* ---------- editing helpers ---------- */
/* set(): change a stop through a proxy; a new view also gets _ff so psFrameFix keeps it */
const set=(id,title,f)=>{const s=st(id,title);if(!s)return;try{f(new Proxy(s,{set(t,k,v){if(k==="phPins")lock(t,k,okPins(v));else def(t,k,v);if(k==="view")def(t,"_ff",1);return true},deleteProperty(t,k){try{def(t,k,undefined)}catch(e){}return delete t[k]}}))}catch(e){console.error(e)}};
/* make(): a new stop object (photo pins locked, missing photos dropped) */
function make(o){const s=S(Object.assign(o.view?{_ff:1}:{},o));const pp=okPins(o.phPins||[]);delete s.phPins;lock(s,"phPins",pp);return s}
const ins=(id,after,o)=>{const t=T(id);if(!t||t.steps.some(x=>x.title===o.title))return;let i=t.steps.findIndex(x=>x.title===after);if(i<0)i=t.steps.length-2;t.steps.splice(i+1,0,make(o))};
const rm=(id,title)=>{const t=T(id);if(!t)return;const i=t.steps.findIndex(x=>x.title===title);if(i>=0)t.steps.splice(i,1)};
/* rename: the card photo and the tour questions follow the stop */
const RN=[];
const ren=(id,from,to)=>{const s=st(id,from);if(!s||st(id,to))return;def(s,"title",to);RN.push([id,from,to]);
 try{if(typeof PS_PHOTO!=="undefined"&&PS_PHOTO[id+"|"+from]!=null&&PS_PHOTO[id+"|"+to]==null)PS_PHOTO[id+"|"+to]=PS_PHOTO[id+"|"+from]}catch(e){}};
/* reorder: the listed titles first, in this order; anything unlisted keeps its place before "Now explore" */
function order(id,titles){const t=T(id);if(!t)return;const by=new Map(t.steps.map(s=>[s.title,s]));const out=[];
 titles.forEach(x=>{if(by.has(x)){out.push(by.get(x));by.delete(x)}});
 const last=t.steps[t.steps.length-1],rest=t.steps.filter(s=>by.has(s.title)&&s!==last);
 const fin=out.concat(rest);if(last&&!fin.includes(last))fin.push(last);if(fin.length===t.steps.length)t.steps.splice(0,t.steps.length,...fin)}
const once=id=>{const t=T(id);if(!t||t.steps._rvLife)return null;try{def(t.steps,"_rvLife",1)}catch(e){t.steps._rvLife=1}return t};
const dense=(a,b,n)=>Array.from({length:n+1},(_,i)=>[+(a[0]+(b[0]-a[0])*i/n).toFixed(2),+(a[1]+(b[1]-a[1])*i/n).toFixed(2)]);

/* =====================================================================================================
   LIVING PLANET
   ===================================================================================================== */
function environment(){if(!once("environment"))return;
 /* one stop for forest loss and gain (the China–India greening stop said the same; Saihanba lives in Forests) */
 set("environment","Forests lost and found",s=>{
  s.stat="In the 2010s Brazil lost the most forest each year and China gained the most, almost 2 million hectares a year";
  s.body="The tropics are losing forest to farms and ranches (red), while many richer and cooler countries are gaining it (green) as old farmland grows back or is planted with trees. Satellites show the Earth is greener than in 2000, and China and India account for about a third of the gain: China mostly from planting trees, India from growing more crops.";
  s.more="These are net figures from the UN’s Food and Agriculture Organization, so new forest is counted against forest cut down. A planted forest of one kind of tree holds far fewer kinds of animals and plants than an old rainforest. In 2024 China finished a belt of trees and shrubs about 3,000 km long right round the Taklamakan Desert.";
  s.pins=[[[[80,38],[88,40]],"Taklamakan green belt","area"]]});
 rm("environment","China and India go green");
 /* stories whose home is another tour: Costa Rica's regrowth (Forests), "If all the ice melted" (same title and stat in Seas) */
 rm("environment","Costa Rica regrows");rm("environment","If all the ice melted");
 /* Greenland: keep the melt and the 2021 rain; the fast glacier and the Titanic iceberg are the Ice tour's */
 set("environment","Greenland’s ice",s=>{s.more="In August 2021 it rained on the top of the ice sheet, over 3,200 m up, for the first time on record. Meltwater running off the ice is now one of the biggest single causes of the rise in sea level.";
  if(Array.isArray(s.pins))s.pins=s.pins.filter(p=>!/Sermeq/.test(Array.isArray(p)?p[1]:p.text))});
 set("environment","Electric Norway",s=>{s.stat="In 2025 about 96% of the new cars sold in Norway were fully electric";
  s.more="Ethiopia went further in 2024, banning imports of new petrol and diesel private cars. Its reason is geography: it has to import every litre of fuel, but makes almost all its electricity from rivers, including Africa’s biggest dam, the Grand Ethiopian Renaissance Dam on the Blue Nile."});
 set("environment","The dirtiest air",s=>{
  s.body="South Asia has the worst air. Each winter, smoke from traffic, factories, cooking fires and burning crop stubble traps a thick smog over Delhi and Lahore. The plain is walled in by the Himalaya to the north (see the chart), and on still winter nights cold air lies under warmer air like a lid, a temperature inversion, holding the smoke down for days.";
  s.xsec={title:"From the plain to the Himalaya, north of Delhi",pts:[[77.21,28.61,"Delhi"],[77.5,29.4],[77.85,30.0],[78.03,30.32,"Dehradun"],[78.5,30.75],[79.0,31.1],[79.6,31.6],[80.3,32.2,"Tibet"]],mark:1000,
   note:"The dashed line marks 1,000 m. The plain stays a few hundred metres up right to the foothills; behind them the Himalaya rise above 5,000 m, a wall the winter smoke cannot cross. The heights are smoothed."}});
 ins("environment","The dirtiest air",{title:"The man who poisoned the air twice",view:[-30,20,30,48],globe:[3,36.7,3],card:"left",hi:["dz"],
  pins:[P([3.06,36.75],"Algiers: the last leaded petrol, 2021")],iconPins:[ic([3.06,36.75],"oil","#3d3d3d")],
  stat:"The last leaded petrol on Earth was sold in Algeria in July 2021, a century after lead was first added to fuel",
  body:"In 1921 the American chemist Thomas Midgley found that a lead compound added to petrol stopped engines “knocking”. The lead came out of exhaust pipes into the air, the soil and children’s blood, where it harms the growing brain. Rich countries began phasing it out in the 1970s; Algeria, the last country still selling it, used up its final stocks in 2021.",
  more:"In the United States the lead in children’s blood has fallen by over 90% since the 1970s. Midgley also invented CFCs, the gases that later thinned the ozone layer, which led the historian J. R. McNeill to write that he had more impact on the atmosphere than any other single organism in Earth’s history."});
 ins("environment","The man who poisoned the air twice",{title:"Bags that flooded a city",view:[80,16,100,30],globe:[90.4,23.8,4],card:"left",hi:["bd"],on:["rivers"],
  pins:[P([90.41,23.81],"Dhaka")],
  stat:"In 2002 Bangladesh became the first country to ban thin plastic bags, because they were blocking Dhaka’s drains in floods",
  body:"Dhaka sits on the flat, low delta of the Ganges and Brahmaputra, drenched by the monsoon every summer. Its drains carry the rain away, and thrown-away plastic bags had choked them, making the great floods of 1988 and 1998 worse. So the ban was about flooding first and litter second.",
  more:"Dozens of countries followed, many of them in Africa. Rwanda has banned plastic bags since 2008 and checks luggage at the airport; Kenya’s 2017 ban allows fines of up to about $40,000 or four years in prison. Enforcement is the hard part: thin bags crept back into Dhaka’s markets."});
 /* the exclusion zone drawn as a rough 30 km ring round the plant */
 const ring=[];for(let a=0;a<=360;a+=20)ring.push([+(30.1+0.43*Math.cos(a*Math.PI/180)).toFixed(3),+(51.39+0.27*Math.sin(a*Math.PI/180)).toFixed(3)]);
 ins("environment","The wolves return",{title:"Chernobyl’s accidental wildlife park",view:[18,44,42,58],globe:[30.1,51.4,4],card:"left",hiSoft:["ua","by"],
  lines:[{coords:ring,kind:"dash"}],pins:[P([30.1,51.39],"Chernobyl power plant")],
  phPins:[ph([29.6,51.75],"Pripyat: a town left to nature","A bird's eye view of the town of Pripyat (02710022).jpg")],
  stat:"Wolves in the Chernobyl exclusion zone are about seven times as common as in nearby nature reserves",
  body:"After the nuclear disaster of 1986, about 2,600 km² around the plant in Ukraine (dashed ring) were emptied of people, along with more land across the border in Belarus. Elk, deer, wild boar and wolves moved into the abandoned farms and villages. A 2015 count found as many big mammals as in protected reserves, and far more wolves: for wildlife, losing people mattered more than the radiation.",
  more:"That count was made on the Belarusian side of the zone. Rare Przewalski’s horses, released in 1998, now breed there too. Scientists still argue about the damage at the most radioactive spots, where some studies find fewer insects and birds, so the zone is not healthy, just emptier of us."});
 CARD["environment|Chernobyl’s accidental wildlife park"]="A bird's eye view of the town of Pripyat (02710022).jpg";
}

function animals(){if(!once("animals"))return;
 /* three stops that repeated the Animal migration tour become one */
 const g=st("animals","The Great Migration");
 if(g){ren("animals","The Great Migration","Great journeys");
  set("animals","Great journeys",s=>{s.view=[-185,-72,45,82];s.globe=[-30,15,1];s.hi=[];
   s.stat="Some animals travel thousands of kilometres every year: wildebeest round the Serengeti, monarchs to Mexico, Arctic terns from pole to pole";
   s.body="About two million wildebeest, zebras and gazelles walk a loop of about 800 km following the rains; monarch butterflies fly up to about 4,000 km to a few fir-covered mountains in Mexico; and the Arctic tern flies about 70,000 km a year, chasing summer at both ends of the Earth.";
   s.more="None of the monarchs that reach Mexico has made the trip before: the travellers are the great-great-grandchildren of last year’s. The Animal migration tour follows these journeys, and many more, up close.";
   s.lines=[{coords:[[-80,45],[-88,38],[-96,30],[-100.3,19.6]],kind:"flow"},{coords:[[-97,48],[-99,38],[-100.3,19.6]],kind:"flow"},
    {coords:[[-25,72],[-28,55],[-25,35],[-20,15],[-12,-5],[-5,-25],[0,-45],[5,-66]],kind:"flow"},
    {coords:[[34.9,-3.5],[34.1,-2.5],[34.6,-1.5],[35.3,-1.2],[35.7,-2.2],[35.3,-3.2]],kind:"flow"}];
   s.pins=[P([-100.3,19.6],"Monarchs: winter in Mexico"),P([5,-66],"Terns: summer off Antarctica")];s.iconPins=[];
   s.phPins=[ph([35.03,-1.55],"Wildebeest crossing the Mara River","Western white-bearded wildebeest (Connochaetes taurinus mearnsi) Mara River crossing 2c.jpg"),
    ph([-100.27,19.6],"Monarchs wintering in Michoacán","Monarc Butterfly Reserve4, Michoacan, Mexico.JPG"),
    ph([-20,74],"An Arctic tern","Arctic tern (Sterna paradisaea) attacking, Amsterdam island, Svalbard.jpg")]});
  CARD["animals|Great journeys"]="Serengeti wildebeest migration JF.jpg"}
 rm("animals","Monarch butterflies");rm("animals","Pole to pole");
 /* same figure and same bleaching point as the Ocean life tour's coral stop */
 rm("animals","The Coral Triangle");
 set("animals","Pandas",s=>{s.more="Pandas are bears built to eat meat, with a short carnivore’s gut that digests bamboo badly, which is why they must eat 12 to 38 kg of it a day and rest most of the time to save energy. They were moved off the endangered list in 2016 after their numbers grew; China lends pandas to zoos abroad, a custom called panda diplomacy."});
 ins("animals","Snow leopards",{title:"The saiga’s comeback",view:[40,38,90,56],globe:[65,48,2.6],card:"left",hi:["kz"],
  pins:[P([68,47.3],"Betpak-Dala: the 2015 die-off"),P([51.5,49.4],"Ural herd"),P([56.5,44.2],"Ustyurt herd")],
  phPins:[ph([66.5,48.6],"Saiga on the steppe","Saiga antelope at the Stepnoi Sanctuary.jpg")],
  stat:"In 2015 about 200,000 saiga antelope, over half of all there were, died within a few weeks; by 2023 there were well over a million",
  body:"Saiga, with odd drooping noses that filter out dust in summer and warm the air in winter, roam the dry steppes of Kazakhstan. In May 2015, during an unusually warm, humid spell, bacteria that normally live harmlessly in their noses turned deadly, and whole calving herds died where they stood.",
  more:"Anti-poaching patrols and protected land let them breed back so fast that in 2023 the IUCN moved saiga from Critically Endangered to Near Threatened. Now some farmers complain that saiga eat their crops, and Kazakhstan has begun culling them."});
 CARD["animals|The saiga’s comeback"]="Saiga antelope at the Stepnoi Sanctuary.jpg";
 ins("animals","Polar bears never meet penguins",{title:"The last few vaquitas",view:[-124,22,-106,35],globe:[-114.6,31,4],card:"left",
  pins:[P([-114.7,31.05],"The vaquita’s last refuge"),P([-112.8,26.6],"Gulf of California")],
  phPins:[ph([-113.9,30.4],"A vaquita","Vaquita6 Olson NOAA.jpg")],
  stat:"Fewer than ten vaquitas, the world’s smallest porpoise, are thought to be left, all in one corner of one sea",
  body:"The vaquita lives only in the shallow, murky top of the Gulf of California. Fishermen there set gillnets for the totoaba, a big fish whose dried swim bladder can sell for thousands of dollars in China, and vaquitas get tangled in the nets and drown. Demand on the far side of the Pacific is emptying a sea in Mexico.",
  more:"A 2024 survey saw only about six to eight. Mexico has banned gillnets in the vaquita’s last refuge, but enforcing the ban has been hard. The good news: the few survivors look healthy and still have calves, so the species could recover if the nets stop."});
 CARD["animals|The last few vaquitas"]="Vaquita6 Olson NOAA.jpg";
 ins("animals","The last few vaquitas",{title:"The axolotl’s last lake",view:[-104.5,15.5,-95.5,23],globe:[-99.1,19.4,5],card:"left",
  lines:[{coords:[[-99.12,19.72],[-98.95,19.62],[-98.93,19.45],[-99.0,19.35],[-98.97,19.22],[-99.08,19.2],[-99.15,19.28],[-99.12,19.45],[-99.17,19.6],[-99.12,19.72]],kind:"dash"}],
  pins:[P([-99.1,19.26],"Xochimilco’s canals"),P([-98.98,19.55],"The old lake, drained")],
  phPins:[ph([-98.3,19.0],"An axolotl, gills and all","Mexican axolotl.jpg")],
  stat:"Millions of axolotls live in labs and fish tanks, but in the wild they survive only in the canals of one city",
  body:"Axolotls are salamanders that never grow up: they keep their feathery gills and live in water all their lives, and they can regrow lost legs and even parts of the heart and brain. Their home was the great lake (dashed) on which the Aztecs built Tenochtitlan. As Mexico City drained the lake and spread over it, only the canals of Xochimilco were left.",
  more:"Surveys there found about 6,000 axolotls per km² in 1998 and only about 35 in 2014, because of dirty water and the carp and tilapia released into the canals, which eat their eggs. Farmers who keep their canals clean round the chinampas, the Aztec farm plots built up from the lake bed, now act as axolotl refuges."});
 CARD["animals|The axolotl’s last lake"]="Mexican axolotl.jpg";
 order("animals",["Animals of the world","Seventeen wild countries","The Amazon","The Wallace Line","The deadliest animal","Great journeys","Elephant country","Tigers","Lions outside Africa","Pandas","Snow leopards","The saiga’s comeback","Polar bears never meet penguins","The last few vaquitas","The axolotl’s last lake","Animals out of place","Now explore"]);
}

function humans(){if(!once("humans"))return;
 ins("humans","Many kinds of human",{title:"Denny, child of two kinds",view:[29,25,119,62],globe:[85,50,2.2],card:"left",
  lines:[{coords:[[45,46],[60,49],[72,51],[84.2,51.4]],kind:"flow"},{coords:[[102.6,35.4],[96,40],[90,46],[85.2,51.1]],kind:"flow"}],
  pins:[P([84.68,51.4],"Denisova Cave"),P([77,53.6],"Neanderthals from the west"),P([102.6,35.4],"A Denisovan jaw, Tibet")],
  stat:"A bone chip from a Siberian cave belonged to a girl whose mother was a Neanderthal and whose father was a Denisovan",
  body:"In 2018 scientists read the DNA of a bone fragment about 90,000 years old from Denisova Cave, in the Altai mountains. The girl, nicknamed Denny, was at least 13 when she died, and she was a first-generation mix of two kinds of human. The Altai were a meeting place: Neanderthals spread here from the west, while Denisovans lived across Asia to the east.",
  more:"So few ancient genomes have been read that finding a first-generation child among them suggests that when different humans met, they often had children together. Her father also carried a little Neanderthal ancestry from an earlier meeting."});
 ins("humans","We still carry them",{title:"People who evolved to dive",view:[110,-12,135,10],globe:[122,-1,3.5],card:"left",
  pins:[P([122.4,-0.95],"Bajau villages, Sulawesi")],iconPins:[ic([122.4,-0.6],"fish","#1f8a7a")],
  stat:"The Bajau ‘sea nomads’ of South-East Asia have spleens about 50% bigger than their neighbours’, an adaptation for diving",
  body:"For perhaps a thousand years the Bajau have lived on boats and in stilt houses over the sea, diving to depths of up to about 70 m with just a mask and weights to spear fish. A 2018 study found that their bigger spleens, which squeeze extra oxygen-rich blood into the body during a dive, come from their genes, not from training.",
  more:"The proof came from their neighbours on land, the Saluan, who do not dive and have ordinary spleens. Seals that dive deep have huge spleens for the same reason. Our species is still adapting to the places it lives."});
}

function islandlife(){if(!once("islandlife"))return;
 ins("islandlife","Islands in the sky",{title:"Snake Island",view:[-50.5,-26,-44,-22],globe:[-46.67,-24.49,5],card:"left",gfSeaUI:1,
  pins:[P([-46.674,-24.487],"Ilha da Queimada Grande"),P([-46.33,-23.96],"Santos")],
  stat:"Brazil bars almost everyone from an island where thousands of venomous snakes live, a kind found nowhere else",
  body:"When the sea rose at the end of the last ice age, about 11,000 years ago, it cut this hill off from the mainland, about 35 km away. Its lanceheads had no prey left on the ground, so they took to the trees to catch the migrating birds that stop to rest. A bitten bird can fly off and die out of reach, so the golden lancehead is thought to have evolved unusually fast-acting venom. Drag the sea level down to join the island to the mainland again.",
  more:"Stories of a snake on every square metre are exaggerated: surveys suggest a few thousand. They are critically endangered, partly because smugglers sell them to collectors, so only the navy and approved scientists may land."});
 ins("islandlife","A land of birds",{title:"The kiwi’s Madagascan cousin",view:[-40,-64,178,14],globe:[110,-35,1.2],card:"left",gfRuler:{a:[45.5,-23.5],b:[172.5,-41]},
  pins:[P([45.5,-23.5],"Madagascar: elephant birds"),P([172.5,-41],"New Zealand: kiwi")],
  phPins:[ph([176.5,-38.5],"A kiwi","Kiwi bird transparent background.png")],
  stat:"The kiwi’s closest relative was not the moa next door, but Madagascar’s giant elephant bird, over 10,000 km away",
  body:"Elephant birds were among the heaviest birds known: some may have weighed over 600 kg, and an egg could hold as much as about 150 hen’s eggs. In 2014, DNA from their bones showed they were the kiwi’s closest kin (drag the ruler). So flightless birds did not simply ride the drifting continents apart: their ancestors flew to new lands and lost flight there, again and again.",
  more:"A kiwi lays an egg about a fifth of its own weight, one hint that its ancestors were bigger birds. Elephant birds died out roughly a thousand years ago, after people had settled Madagascar."});
}

function biomes(){if(!once("biomes"))return;
 ins("biomes","Deserts",{title:"Where the desert has a shore",view:[-35,-2,45,32],globe:[5,15,2],card:"left",biome:7,
  lines:[{coords:[[-16.5,17.3],[-10,17.5],[-3,17.2],[5,17],[12,16.5],[20,16.2],[28,15.8],[34,16],[38,16.5]],kind:"dash"},
   {coords:[[-16.8,13.6],[-10,13.4],[-3,13],[5,12.6],[12,12],[20,11.6],[28,11.3],[34,11.5]],kind:"dash"}],
  pins:[P([24,18],"about 200 mm of rain a year"),P([24,10.2],"about 600 mm"),P([-3,16.77],"Timbuktu")],
  stat:"“Sahel” means “shore” in Arabic: to camel caravans crossing the Sahara, it was the coast on the far side of a sea of sand",
  body:"Biomes rarely end at a line; they blend across a wide edge zone. In the Sahel, over a few hundred kilometres, the rain rises from about 200 mm a year at the desert’s edge to about 600 mm (the two dashed lines), and desert scrub turns to grass and then to savanna (lit). Herders keep to the drier north and farmers to the wetter south, and they meet, and sometimes clash, in between.",
  more:"Because the edge follows the rain, it moves: satellites saw it shift south in the droughts of the 1970s and 1980s, and much of it has greened again since. Ecologists call such a blend zone an ecotone; the forest-steppe of Russia and the tree line on mountains are ecotones too."});
 ins("biomes","Savanna",{title:"The Pantanal: a flooded savanna",view:[-70,-25,-45,-10],globe:[-57,-17.5,3.5],card:"left",biome:9,
  pins:[P([-57.3,-18.2],"Pantanal"),P([-57.65,-19.0],"Paraguay River")],
  phPins:[ph([-56.6,-17.0],"A jaguar on the Piquiri River","Jaguar (Panthera onca palustris) female Piquiri River 2.JPG")],
  stat:"The Pantanal, the largest tropical wetland on Earth, lies mostly under water each wet season, yet in 2020 fire swept through about a quarter of it",
  body:"Its basin is so flat that the land falls only a few centimetres in every kilometre, so the Paraguay River cannot carry the summer rains away. Water spreads across the grasslands for months, then slowly drains, and the land swings between lake and pasture every year. Wetlands like this make a biome of their own (lit: flooded grasslands), set by water as much as by climate.",
  more:"It has some of the densest jaguar populations anywhere; Pantanal jaguars dive into rivers after caimans. In the drought of 2020 the dry wetland burned, and scientists estimate that about 17 million vertebrate animals died in the fires."});
 CARD["biomes|The Pantanal: a flooded savanna"]="Jaguar (Panthera onca palustris) female Piquiri River 2.JPG";
}

function forests(){if(!once("forests"))return;
 ins("forests","The taiga: the biggest forest",{title:"The summer Canada burned",view:[-130,38,-55,66],globe:[-90,52,1.8],card:"left",
  lines:[{coords:[[-75,50],[-74.6,46],[-74.1,41.2]],kind:"flow"}],
  pins:[P([-75,50.5],"Quebec’s fires"),P([-74.0,40.71],"New York, 7 June 2023")],
  iconPins:[ic([-75,50.5],"flame","#d9480f"),ic([-121,57.5],"flame","#d9480f"),ic([-116,60],"flame","#d9480f"),ic([-78,53],"flame","#d9480f")],
  stat:"In 2023 Canada’s wildfires burned over 15 million hectares, more than double the old record and an area bigger than England",
  body:"An early snowmelt and a hot, dry spring left the taiga primed, and lightning set it alight from British Columbia to Quebec. On 7 June smoke carried south on the wind turned the sky over New York orange. One study found that the fires released about as much carbon as a whole year of burning fossil fuels in any country except China, the US and India.",
  more:"Fire is natural in the taiga, and many of its trees regrow after it, but hotter summers are making fires bigger and more frequent. If burning outpaces regrowth, the forest could turn from a store of carbon into a source of it."});
 ins("forests","Forests come back",{title:"Forests kept by churches",view:[30,4,46,16],globe:[38,11.8,4],card:"left",hiSoft:["et"],
  pins:[P([38.0,11.85],"South Gondar’s church forests"),P([37.35,12.0],"Lake Tana")],iconPins:[ic([38.0,11.6],"tree","#2e7d32")],
  stat:"In northern Ethiopia, almost the only forest left stands in green circles around churches",
  body:"Over centuries, Ethiopia’s northern highlands were cleared for farms, grazing and firewood. But the Ethiopian Orthodox Church holds that a church should stand in its own grove, a small piece of Eden. So from the air the farmland is brown, dotted with small round forests, each with a church at its centre.",
  more:"Many are only a few hectares, and cattle nibble at their edges. Priests and scientists are now building stone walls around them, because these groves hold the last seeds of the region’s native trees."});
}

function ocean(){if(!once("ocean"))return;
 set("ocean","Coral reefs and the Coral Triangle",s=>{const b=String(s.body||"");if(!/reef fish/.test(b))s.body=b+" The Coral Triangle alone shelters over a third of all reef fish species.";
  /* the 84% bleaching figure lives in the Environment tour's "Coral in hot water" */
  s.more="When the sea gets too hot, corals push out their algae and turn white, or ‘bleach’; if the heat lasts, they die. The Environment tour follows the worst bleaching on record, which began in 2023."});
 ins("ocean","Kelp forests",{title:"The biggest plant on Earth",view:[104,-32,120,-20],globe:[113.6,-26,4],card:"left",
  pins:[P([113.55,-26.0],"Shark Bay"),P([114.2,-26.4],"Hamelin Pool: stromatolites")],
  stat:"One seagrass plant in Shark Bay spreads over about 180 km², the largest known plant on Earth",
  body:"Seagrasses are flowering plants that live underwater, spreading by runners like strawberries. In 2022 DNA tests showed that a meadow of ribbon weed across Shark Bay is one single plant, a clone at least 4,500 years old. It thrives in shallow water that in places is up to twice as salty as the open sea, where few rivals can grow.",
  more:"Seagrass meadows feed dugongs and turtles and store carbon in their mud. A marine heatwave in 2011 killed over a third of Shark Bay’s seagrass. The bay also has stromatolites, mounds built by microbes, a form of life over 3 billion years old."});
 ins("ocean","The anchoveta and El Niño",{title:"Baby oysters and sour seas",view:[-140,32,-112,52],globe:[-124,45,3.5],card:"left",
  lines:[{coords:[[-125.6,50],[-125,47.5],[-124.6,44.5],[-124.4,41.5],[-123.4,38.5]],kind:"cold"}],
  pins:[P([-123.94,45.43],"Netarts Bay hatchery")],
  stat:"From 2007 most of the baby oysters at an Oregon hatchery began dying, because the seawater had turned too acidic",
  body:"The ocean soaks up about a quarter of the carbon dioxide we release, and that makes seawater more acidic. Upwelling makes it worse here: the summer winds bring up deep water along this coast (arrow) that is already rich in CO₂. In their first days, oyster larvae must build shells fast, and in this corrosive water they could not.",
  more:"The hatchery, at Netarts Bay, now checks the water as it comes in and adds soda ash to neutralise it, like an antacid for the sea. Since the 1800s the surface ocean has become about 30% more acidic."});
}

function amigration(){if(!once("amigration"))return;
 ins("amigration","Monarch butterflies",{title:"The river of raptors",view:[-115,8,-82,34],globe:[-96,22,2.8],card:"left",
  lines:[{coords:[[-98,29.5],[-97.6,26],[-97.6,23],[-97.1,20.8],[-96.35,19.4],[-95,18.2],[-92.5,16.8],[-90,15.5]],kind:"flow"},{coords:[[-90.5,29.6],[-90,25],[-89.6,21.3]],kind:"dash"}],
  pins:[P([-96.35,19.4],"Veracruz: millions pass each autumn"),P([-99.6,21.6],"Sierra Madre Oriental"),P([-89.8,26.2],"Songbirds cross at night")],
  stat:"Each autumn several million hawks, vultures and eagles funnel along one stretch of Mexico’s Gulf coast",
  body:"Big soaring birds save energy by circling up on thermals, columns of warm rising air, then gliding to the next. Thermals form over sun-warmed land, not over the sea, so these birds will not cross the Gulf of Mexico. Squeezed between the Gulf and the mountains of the Sierra Madre, they pour along a narrow coastal plain at Veracruz, sometimes hundreds of thousands in a day.",
  more:"Small songbirds flap instead of soaring, and many fly straight across the Gulf in a single night (dashed). The same squeeze sends soaring birds over the Strait of Gibraltar, the Bosphorus and Eilat."});
 ins("amigration","The East Asian–Australasian Flyway",{title:"The falcons of Nagaland",view:[-36,-38,124,52],globe:[70,10,1.4],card:"left",
  lines:[{coords:[[120,47],[108,38],[98,29],[94.25,26.2]],kind:"flow"},{coords:[[94.25,26.2],[85,22.5],[74,19],[62,14],[52,6],[43,-2],[36,-12],[30,-25]],kind:"flow"}],
  pins:[P([94.25,26.2],"Pangti, Nagaland"),P([118,48.5],"Nesting: north-east Asia"),P([30,-27],"Winter: southern Africa"),P([64,12],"Non-stop over the Arabian Sea")],
  stat:"Amur falcons fly from north-east Asia to southern Africa, crossing the Arabian Sea non-stop, and rest in one Indian valley on the way",
  body:"Each October up to a million of these small falcons gather at the Doyang reservoir in Nagaland to feast on swarming insects before thousands of kilometres of open sea. In 2012 campaigners found that over 100,000 a year were being netted for food here. Local villages banned the hunt, and Pangti now hosts a falcon festival and birdwatchers.",
  more:"Satellite-tagged falcons named Naga, Pangti and Wokha were tracked to Somalia, Kenya and South Africa. On the way they may feed on dragonflies that make the same sea crossing on the same winds."});
}

function crops(){if(!once("crops"))return;
 ren("crops","Potatoes from the Andes","Four thousand potatoes");
 ins("crops","Crops far from home",{title:"Vanilla by hand",view:[40,-27,62,-8],globe:[50,-17,3],card:"left",hiSoft:["mg"],
  pins:[P([50.17,-14.27],"Sava: most of the world’s vanilla"),P([55.53,-21.11],"Réunion: Albius, 1841")],
  stat:"Almost every vanilla flower on Earth is pollinated by hand, with a trick found by a 12-year-old enslaved boy in 1841",
  body:"Vanilla is an orchid from Mexico. Taken to islands in the Indian Ocean, the vines flowered but made no pods, because the insects that pollinate them had stayed behind in Mexico. On Réunion, Edmond Albius found he could lift a flap inside the flower with a sliver of bamboo and press the pollen in with his thumb. Each flower opens for just one day, so workers still pollinate them by hand that morning.",
  more:"Madagascar, next to Réunion, now grows most of the world’s vanilla. In 2018 its price passed $500 a kilo, more than silver by weight, and farmers guarded their vines at night. Albius was freed in 1848 and died poor."});
 ins("crops","Vanilla by hand",{title:"How a fungus made Ceylon tea",view:[70,1,90,13],globe:[80.6,7.3,5],card:"left",hiSoft:["lk"],
  pins:[P([80.63,7.29],"Kandy"),P([80.78,6.97],"Nuwara Eliya’s tea hills")],
  xsec:{title:"Sri Lanka from Colombo to the hill country",pts:[[79.86,6.93,"Colombo"],[80.1,6.95],[80.35,6.98],[80.55,6.98],[80.78,6.97,"Nuwara Eliya"]],mark:1200,
   note:"The dashed line marks 1,200 m: the famous ‘high-grown’ teas come from the cool, wet hills above it, the same slopes where the coffee estates once stood. The heights are smoothed."},
  phPins:[ph([81.2,6.6],"Tea where coffee once grew","Tea-plantation Nuwara Eliya-2567.jpg")],
  stat:"In the 1870s Ceylon was one of the world’s biggest coffee growers; within 20 years a fungus had wiped its coffee out",
  body:"Coffee leaf rust, a fungus from East Africa, was spotted in Ceylon, today’s Sri Lanka, in 1869. On estates planted wall to wall with one crop, its spores spread from bush to bush and coffee collapsed. Planters ripped out the bushes and planted tea instead, and in 1890 Thomas Lipton bought estates in the hills. ‘Ceylon tea’ was born.",
  more:"It is the twist on crops far from home: the pests left behind can catch up. Coffee rust reached Brazil in 1970 and swept Central America in 2012, which is why breeders keep searching wild Ethiopian coffee for genes that resist it."});
 CARD["crops|How a fungus made Ceylon tea"]="Sri Lanka-Tea plantation-15.jpg";
}

/* =====================================================================================================
   PEOPLE & CULTURE
   ===================================================================================================== */
function food(){if(!once("food"))return;
 ren("food","Sugar and slavery","The sugar islands");
 ren("food","Potatoes from the Andes","From Titicaca to Ireland");
 ren("food","The Columbian Exchange","Before 1492");
 set("food","From Titicaca to Ireland",s=>{const b=String(s.body||"");if(/about 8,000 years ago/.test(b))s.body=b.replace("about 8,000 years ago","over 7,000 years ago")});
 set("food","The Spice Islands",s=>{const m=String(s.more||"");const i=m.indexOf("By some accounts");if(i>0)s.more="B"+m.slice(i+1)});
 ins("food","Before 1492",{title:"Maize without the recipe",view:[-177,0,18,58],globe:[-50,30,1.2],card:"left",hi:["mx"],hiSoft:["it"],
  lines:[{coords:[[-96.7,17.06],[-75,27],[-45,36],[-15,41],[11,45.2]],kind:"flow"},{coords:[[-96.7,17.06],[-93,24],[-89,31.5]],kind:"flow"}],
  pins:[P([-96.72,17.06],"Oaxaca: maize cooked with lime"),P([11.3,45.4],"Northern Italy: polenta"),P([-87,33],"The cotton South")],
  stat:"Maize left Mexico without its cooking method, and in the US South it caused a disease that struck about 3 million people",
  body:"For thousands of years, Mexican cooks have boiled maize with lime or wood ash before grinding it into masa for tortillas. This step, nixtamalisation, frees a B vitamin, niacin, that is otherwise locked up in the grain. Europeans took the plant but not the recipe, and where poor people lived mostly on maize, from the polenta of northern Italy to the cotton South of the US, pellagra spread: rough skin, diarrhoea, confusion and death.",
  more:"In the US South about 3 million people caught pellagra between 1906 and 1940, and about 100,000 died. In the 1910s Joseph Goldberger showed that diet caused it, not germs, but the missing vitamin was only identified in 1937."});
 ins("food","Fermented foods",{title:"Milk drinkers’ map",view:[-50,-10,55,68],globe:[15,35,1.6],card:"left",hi:["dk","se","no","nl","ie","gb","is","fi"],
  pins:[P([9.5,56],"Denmark: nearly all adults digest milk"),P([36,-2.5],"Maasai: their own mutation"),P([45,23],"Arabia: camel herders’ mutation")],
  stat:"About two-thirds of adults on Earth can’t fully digest milk, but in Denmark and Sweden almost everyone can",
  body:"Babies make an enzyme, lactase, that breaks down the sugar in milk. In most mammals, and most people, it switches off after weaning. Among cattle herders in northern Europe (lit), a mutation that kept it switched on spread fast, because adults who could drink milk survived hard times better and had more children. In much of East Asia, by contrast, most adults lose it.",
  more:"The same trait evolved separately among cattle herders in East Africa, such as the Maasai, and camel herders in Arabia, each through a different mutation. Ancient DNA adds a twist: Europeans were using milk thousands of years before the mutation became common, probably as cheese and yoghurt, which hold less milk sugar."});
}

function landmarks(){if(!once("landmarks"))return;
 set("landmarks","Landmarks of the world",s=>{
  s.body="Some landmarks were built to honour gods and kings, others to show off a city or a new technology, and many owe their shape to the ground they stand on. This tour visits the most famous, roughly from oldest to newest, and asks why each stands where, and how, it does.";
  s.phPins=(s.phPins||[]).filter(q=>!/Sydney/.test(q.label)).concat([ph([35.44,30.33],"Petra","Al-Khazneh (Treasury) Petra.JPG"),ph([10.4,43.72],"Pisa","Piazza dei Miracoli (Pisa) 2023.jpg")])});
 set("landmarks","The Great Wall",s=>{
  s.stat="The Ming wall winds about 8,850 km, yet its two ends are only about 1,800 km apart";
  s.body="All China’s walls together, built and rebuilt over 2,000 years, run about 21,000 km. The Ming wall that most visitors see snakes over mountains and deserts between its two ends: drag the ruler to measure the straight line.";
  s.more="The wall is long but only a few metres wide, and about the colour of the land around it; China’s first astronaut, Yang Liwei, said in 2003 that he couldn’t see it from orbit. Much of the older wall was rammed earth, and parts have worn away. Beijing’s other great landmark, the Forbidden City, was the emperors’ palace for almost 500 years."});
 /* the two wonders lists become one stop */
 const w=st("landmarks","Seven ancient wonders"),nw=st("landmarks","The New Seven Wonders");
 if(w){const keepNew=nw?(nw.phPins||[]).filter(q=>/Colosseum|Machu|Taj|Christ|Great Wall/.test(q.label)).map(q=>Object.assign({},q)):[];
  ren("landmarks","Seven ancient wonders","Wonders old and new");
  set("landmarks","Wonders old and new",s=>{s.view=[-100,-45,135,55];s.globe=[30,25,1];s.hi=[];s.hiSoft=["cn","jo","it","mx","pe","in","br"];
   s.stat="Of the Seven Wonders of the Ancient World, only the Great Pyramid still stands; in 2007 a public vote picked seven new ones";
   s.body="Greek travellers listed seven must-see sights over 2,000 years ago; earthquakes, fire and looters took all but the pyramid. The 2007 winners (their countries shaded) were the Great Wall, Petra, the Colosseum, Chichén Itzá, Machu Picchu, the Taj Mahal and Christ the Redeemer, with Giza as an honorary eighth.";
   s.more="The Colossus of Rhodes stood for only about 54 years before an earthquake toppled it; the Hanging Gardens of Babylon may never have existed. The 2007 vote was run by a private foundation, not by UNESCO.";
   s.pins=[P([-88.57,20.68],"Chichén Itzá")];
   s.phPins=(s.phPins||[]).filter(q=>/Pyramid|Hanging|Lighthouse/.test(q.label)).map(q=>Object.assign({},q)).concat(keepNew)})}
 rm("landmarks","The New Seven Wonders");
 rm("landmarks","Sydney Opera House");     /* the same stop is in Art and architecture */
 rm("landmarks","The moai of Rapa Nui");   /* full stops in Oceania history and Collapse */
 rm("landmarks","World Heritage");         /* a count, no mechanism */
 set("landmarks","Machu Picchu",s=>{const m=String(s.more||"");if(!/underground/.test(m))s.more=m.replace("Visitor numbers are now capped to protect it.","").trim()+" Engineers estimate that about 60% of the building work is hidden underground: deep foundations and drainage layers of crushed stone, which is why it hasn’t washed off its steep, rainy ridge."});
 set("landmarks","The race for the sky",s=>{const b=String(s.body||"");if(!/confuse/.test(b))s.body=b+" Its Y-shaped plan steps back in a spiral as it rises: its engineers designed it to “confuse the wind”, breaking up the swirling gusts that would make a tall tower sway."});
 ins("landmarks","Wonders old and new",{title:"Petra’s war on floods",view:[29.6,27.72,38.6,32.92],globe:[35.45,30.32,6],card:"left",hiSoft:["jo"],
  pins:[P([35.451,30.322],"Petra")],
  phPins:[ph([35.444,30.322],"Petra: the Treasury at the end of the Siq","Al-Khazneh (Treasury) Petra.JPG")],
  stat:"Petra’s builders dug a tunnel through a mountain to keep flash floods out of the city’s narrow entrance",
  body:"Petra is reached through the Siq, a twisting gorge over 1 km long. Rain rarely falls here, but when it does, water pours off the bare rock into the gorge. The Nabataeans, who carved Petra about 2,000 years ago, dammed the Siq’s entrance and cut an 88 m tunnel to send floodwater around it, and built channels and cisterns to store every drop for the city.",
  more:"Over the centuries the dam fell into ruin. In 1963 a flash flood swept through the Siq and killed more than 20 tourists, and engineers rebuilt the dam along the old Nabataean lines."});
 CARD["landmarks|Petra’s war on floods"]="Al Khazneh Petra edit 2.jpg";
 ins("landmarks","Angkor Wat",{title:"The tower that leans to survive",view:[4.55,41.12,13.55,46.32],globe:[10.4,43.72,6],card:"left",on:["rivers"],
  pins:[P([10.396,43.723],"Pisa")],
  phPins:[ph([10.396,43.723],"The Leaning Tower of Pisa","Piazza dei Miracoli (Pisa) 2023.jpg")],
  stat:"The Leaning Tower of Pisa began to tilt in 1178, five years into building, and the same soft ground has helped it survive at least four strong earthquakes",
  body:"The tower stands on soft river clay and sand near the Arno, which sank under its weight on one side. Wars then halted the building for almost a century, and the pause let the soil firm up; otherwise it would probably have fallen. When work started again, the masons made the upper floors slightly taller on the low side, so the tower is gently curved.",
  more:"By 1990 it leaned about 5.5° and was closed. Engineers slowly drew soil out from under the high side and pulled it back by about 45 cm; it reopened in 2001. A 2018 study found that the soft ground and the stiff tower shake at different rhythms, so earthquakes don’t rock it hard."});
 CARD["landmarks|The tower that leans to survive"]="Piazza dei Miracoli (Pisa) 2023.jpg";
 ins("landmarks","The tower that leans to survive",{title:"Churches carved downwards",view:[33.19,9.43,42.19,14.63],globe:[39.04,12.03,6],card:"left",hiSoft:["et"],
  pins:[P([39.041,12.032],"Lalibela")],
  phPins:[ph([39.041,12.032],"Lalibela: the Church of St George","Lalibela, san giorgio, esterno 24.jpg")],
  stat:"Lalibela’s 11 churches were not built up: they were carved down into solid rock",
  body:"In the late 1100s and early 1200s, workers at Lalibela, high in Ethiopia’s mountains, cut trenches into soft volcanic rock and hollowed out whole churches, with windows, columns and roofs, each from a single block. The cross-shaped Church of St George stands in a pit about 12 m deep.",
  more:"Tradition says King Lalibela wanted a new Jerusalem after the real one fell to Saladin in 1187, and places here carry names such as Jordan and Golgotha. It is still a working holy site: tens of thousands of pilgrims in white come for Ethiopian Christmas, in early January."});
 CARD["landmarks|Churches carved downwards"]="Lalibela, san giorgio, esterno 24.jpg";
 ins("landmarks","Churches carved downwards",{title:"An island only twice a day",view:[-7.36,46.04,1.64,51.24],globe:[-1.51,48.64,6],card:"left",
  pins:[P([-1.511,48.636],"Mont-Saint-Michel")],
  stat:"The tide in the bay of Mont-Saint-Michel can rise and fall by about 14 m, among the biggest tides in Europe",
  body:"The abbey sits on a rocky island in a wide, shallow bay. At high tide the sea surrounds it; at low tide it stands in kilometres of sand, with patches of quicksand, and the water comes back fast. That made it easy to defend: in the Hundred Years’ War the English besieged it but never took it.",
  more:"In 1879 a solid causeway was built so visitors could drive out. It trapped silt, and the island was slowly turning into a hill on dry land. In 2014 the causeway was replaced by a light bridge on stilts, and a new dam on the Couesnon river now flushes the sand away, so the Mont should stay an island."});
 order("landmarks",["Landmarks of the world","Stonehenge","The pyramids of Giza","Wonders old and new","Petra’s war on floods","The Great Wall","Angkor Wat","The tower that leans to survive","Churches carved downwards","An island only twice a day","Machu Picchu","The Taj Mahal","The Statue of Liberty","The Eiffel Tower","The race for the sky","Natural wonders","Now explore"]);
}

function migration(){if(!once("migration"))return;
 ins("migration","China moves to the cities",{title:"North by railway",view:[-155,22,-68,52],globe:[-90,38,1.8],card:"left",
  lines:[{coords:[[-90.57,34.2],[-90.05,35.15],[-89.18,37.0],[-88.24,40.12],[-87.63,41.88]],kind:"flow"},
   {coords:[[-80.84,35.23],[-77.44,37.54],[-77.04,38.9],[-75.16,39.95],[-74.0,40.71]],kind:"flow"},
   {coords:[[-96.8,32.78],[-101.8,33.6],[-106.4,31.76],[-112.07,33.45],[-118.24,34.05]],kind:"flow"}],
  pins:[P([-87.63,41.88],"Chicago"),P([-74.0,40.71],"New York"),P([-118.24,34.05],"Los Angeles"),P([-90.57,34.2],"The Mississippi Delta")],
  iconPins:[ic([-89.18,37.0],"train","#1e7fa8"),ic([-77.04,38.9],"train","#1e7fa8"),ic([-106.4,31.76],"train","#1e7fa8")],
  stat:"Where a Black family from the US South settled in the North often depended on which railway ran past its town",
  body:"Between about 1910 and 1970, some 6 million Black Americans left the segregated South for cities in the North and West, in what is called the Great Migration. They tended to follow the train lines: people from Mississippi rode the Illinois Central to Chicago, people from the Carolinas and Virginia went up the coast to Washington, Philadelphia and New York, and Texans went west to California.",
  more:"Pullman porters on the trains quietly carried copies of the Chicago Defender, a Black newspaper that urged Southerners to come north. The music came along the same tracks, which is why the Mississippi Delta blues became Chicago’s electric blues."});
 CARD["migration|North by railway"]="Sears Tower, Wacker Drive and Jackson Boulevard, Chicago, IL - 54189600901.jpg";
 ins("migration","Built by newcomers",{title:"Niue lives in Auckland",view:[-210,-45,-155,-8],globe:[-178,-28,2.5],card:"left",hiSoft:["nz"],
  lines:[{coords:[[-169.87,-19.05],[-175,-28],[-181,-34],[-185.24,-36.85]],kind:"flow"},{coords:[[-159.78,-21.23],[-170,-30],[-185.24,-36.85]],kind:"flow"}],
  pins:[P([-169.87,-19.05],"Niue: about 1,700 people"),P([-185.24,-36.85],"Auckland"),P([-159.78,-21.23],"Rarotonga, Cook Islands")],
  phPins:[ph([-169.92,-19.06],"Niue","Sustainable Niue Ocean Wide Event, Niue, 17 October 2024 - 1.jpg"),ph([-185.24,-36.85],"Auckland","Sky Tower, Auckland - 0206 (cropped).jpg")],
  stat:"About 1,700 people live on the island of Niue, but nearly 20 times as many Niueans live in New Zealand",
  body:"Niue, the Cook Islands and Tokelau are tied to New Zealand, so their people hold New Zealand citizenship and can move there freely. Faced with small islands, few jobs and a long flight from anywhere, most have done so. Far more Cook Islanders also live in New Zealand than in the Cook Islands themselves.",
  more:"Auckland now has the largest Polynesian population of any city on Earth. Niue’s government worries whether so few people at home can keep the island running."});
}

function languages(){if(!once("culture"))return;
 /* Cyrillic and the alphabet switches: one stop, on the alphabets map */
 const c=st("culture","Countries that switched"),cy=st("culture","Cyrillic: Russian letters");
 if(c){ren("culture","Countries that switched","Alphabets follow empires");
  set("culture","Alphabets follow empires",s=>{s.view=[0,5,140,70];s.globe=[60,45,1.3];
   s.stat="Uzbek has changed alphabet three times since 1928: Arabic to Latin, Latin to Cyrillic, then back to Latin";
   s.body="Alphabets follow empires. Cyrillic was created in Bulgaria about 1,100 years ago and spread with the Russian Empire and the Soviet Union as far as Mongolia, about 6,000 km away (drag the ruler). Turkey swapped Arabic letters for Latin in 1928, in a few months; its president toured the country with a chalkboard.";
   s.more="The Soviet Union first gave Central Asia Latin letters, then switched it to Cyrillic around 1940; after 1991 Uzbekistan, Azerbaijan and Turkmenistan went back to Latin, and Kazakhstan keeps delaying its own switch. Vietnam left Chinese characters for a Latin script, Mongolia is reviving its old vertical script, and Serbian is written in both alphabets.";
   const G=(s.G||[]).map(x=>Object.assign({},x));if(!G.some(x=>/Russia/.test(x.t)))G.unshift({t:"Cyrillic, spread by Russia and the USSR",c:"#9b59b6",codes:["ru","by","ua","bg","rs","mk","kg","tj"]});s.G=G;
   s.hi=Array.from(new Set((s.hi||[]).concat(["ru","by","ua","bg","rs","mk","kg","tj"])));
   s.lines=(cy&&cy.lines)?cy.lines.map(l=>Object.assign({},l)):[{coords:[[23.3,42.7],[30.5,50.4],[37.6,55.75]],kind:"flow"},{coords:[[37.6,55.75],[60.6,56.8],[82.9,55],[104.3,52.3],[106.9,47.9]],kind:"flow"}];
   s.gfRuler={a:[26.8,43.16],b:[106.9,47.92]}})}
 rm("culture","Cyrillic: Russian letters");
 ren("culture","A thousand languages","Every valley its own tongue");
 set("culture","The Arab world",s=>{
  s.stat="A Moroccan and an Iraqi may struggle to understand each other’s everyday Arabic";
  s.body="Arabic spread with Islam from Arabia in the 600s, across North Africa and the Middle East (arrows). Today about 400 million people speak it, and the 22 countries of the Arab League are highlighted.";
  s.more="Spoken Arabic varies so much from place to place that people from far apart often switch to Modern Standard Arabic, the form used in news and books. Not all Muslims are Arabs: most are not."});
 rm("culture","Left or right?");   /* driving side is not about language; the layer stays in Now explore */
 ins("culture","Every valley its own tongue",{title:"Whistling across the valleys",view:[-23.08,25.5,-14.08,30.7],globe:[-17.23,28.1,6],card:"left",mode:"relief",
  pins:[P([-17.23,28.1],"La Gomera")],
  xsec:{title:"Across La Gomera, west to east",pts:[[-17.335,28.09,"Valle Gran Rey"],[-17.3,28.105],[-17.265,28.11],[-17.236,28.106,"Garajonay"],[-17.2,28.105],[-17.16,28.1],[-17.115,28.09,"San Sebastián"]],mark:500,
   note:"The dashed line marks 500 m. The island is only about 25 km across, but deep ravines, barrancos, cut it into steep valleys around its 1,487 m summit. The heights are smoothed."},
  stat:"On La Gomera people can ‘speak’ Spanish by whistling, and be understood several kilometres away",
  body:"La Gomera, in the Canary Islands, is cut by deep ravines, so walking to a neighbour can take an hour even when you can see their house (the chart crosses the island). Islanders turned Spanish into whistles, called Silbo Gomero, which carry much further than shouting. Children have learned it at school since 1999.",
  more:"Whistled languages exist in other rugged or forested places too: a Turkish one in the Black Sea mountains at Kuşköy, ‘bird village’, and others in Mexico, the Amazon and South-East Asia. They tend to appear where steep land or thick forest keeps people apart."});
 ins("culture","Whistling across the valleys",{title:"Tones need wet air?",view:[55,-12,145,45],globe:[105,20,1.6],card:"left",mode:"climate",
  pins:[P([113.26,23.13],"Guangzhou: Cantonese, 6–9 tones"),P([105.85,21.03],"Hanoi: Vietnamese, 6 tones"),P([100.5,13.75],"Bangkok: Thai, 5 tones")],
  stat:"Languages with many tones, like Cantonese, are rare in deserts and cold, dry places, though linguists argue about why",
  body:"In a tonal language the pitch of a word changes its meaning. A 2015 study of over 3,700 languages found that languages with complex tones cluster in warm, humid regions: southern China, South-East Asia and West Africa. The authors suggested that dry air makes it harder for the vocal cords to hit exact pitches. The map shows climates: the blues are the wet tropics.",
  more:"It is a bold idea and is disputed: many linguists think history and language families explain the pattern better. Cantonese has six to nine tones depending on how you count; Arabic, from the desert, has none."});
 ins("culture","Surname first",{title:"Iceland can still read its sagas",view:[-35,60,-5,68],globe:[-19,65,4],card:"left",mode:"relief",
  pins:[P([-21.94,64.15],"Reykjavík")],
  stat:"Icelanders can read their 800-year-old sagas with little help, while English speakers need a translation for Chaucer, who wrote 200 years later",
  body:"Iceland was settled around 870 and then sat alone in the North Atlantic, so its language changed slowly. Icelanders also chose to keep it pure: instead of borrowing foreign words, they build new ones from old roots, helped by a language committee.",
  more:"A computer is a tölva, from tala, ‘number’, and völva, ‘prophetess’: a fortune-teller of numbers. A telephone is a sími, from an old word for ‘thread’."});
}

function flags(){if(!once("flags"))return;
 set("flags","The Southern Cross",s=>{const m=String(s.more||"");if(!/mirror/.test(m))s.more=m+" Its stars are drawn as if seen from outside the sky, looking down, so the constellations appear mirror-reversed."});
 ins("flags","Three flags from one country",{title:"Two oceans and a strip of land",view:[-100,3,-74,22],globe:[-86,13,4],card:"left",hi:["gt","hn","sv","ni","cr"],
  pins:[P([-87.19,14.07],"Tegucigalpa")],
  stat:"Five Central American flags share blue and white stripes: two oceans with the land between",
  body:"Guatemala, Honduras, El Salvador, Nicaragua and Costa Rica were once one country, the Federal Republic of Central America (1823–1841). Its flag’s two blue bands are usually read as the Pacific and the Caribbean, with the white isthmus between them. All five kept the design, or echoes of it, after the union broke up.",
  more:"Honduras’s five stars stand for the five old members. El Salvador’s and Nicaragua’s emblems show five volcanoes between two seas, and Nicaragua’s rainbow makes it the other flag with purple besides Dominica’s. Costa Rica added a red stripe in 1848."});
 ins("flags","Maps on flags",{title:"Flags that are sea charts",view:[150,-12,180,14],globe:[167,0,3],card:"left",hi:["nr","mh"],
  lines:[{coords:dense([150,0],[180,0],10),kind:"dash"}],
  pins:[P([166.93,-0.53],"Nauru"),P([171.2,7.1],"Marshall Islands"),P([176,0],"The equator")],
  stat:"Nauru’s flag is a map: a yellow line for the equator, and a star just below it for the island",
  body:"Nauru’s flag puts a white star on a blue sea just under a yellow stripe, because the island lies about 60 km south of the equator (dashed). The star’s 12 points stand for Nauru’s 12 traditional tribes.",
  more:"The Marshall Islands, north of the equator, fly a star above two rays that widen as they rise, orange and white, for its two chains of islands: Ralik, ‘sunset’, and Ratak, ‘sunrise’."});
 CARD["flags|Flags that are sea charts"]="Aerial view of Nauru-mod.jpg";
}

function cities(){if(!once("cities"))return;
 set("cities","Cities of the world",s=>{s.body="In 1950 fewer than a third of people lived in towns and cities; today it is over half, and by 2050 it may be two-thirds. This tour first asks why cities stand where they do (a river crossing, a waterfall, the rock beneath), then how big and crowded they have become. The dots on the map are cities."});
 rm("cities","The capital isn’t the biggest city");   /* the capitals tour has these stories */
 rm("cities","Capitals across a river");
 rm("cities","The most visited cities");
 rm("cities","The longest metros");
 rm("cities","Sinking cities");                      /* home: the Coasts tour's "Sinking cities, rising seas" */
 rm("cities","Capitals in the clouds");              /* La Paz and El Alto: Elevation and Capitals tours */
 rm("cities","Capitals at the ends of the Earth");
 const x=st("cities","Coldest and hottest cities");
 if(x){ren("cities","Coldest and hottest cities","Cities at the extremes");
  set("cities","Cities at the extremes",s=>{
   s.stat="Yakutsk’s January average is below −35 °C, while Kuwait City’s summer highs often pass 45 °C";
   s.body="Yakutsk, in Siberia, is the coldest big city on Earth, with about 350,000 people. It began as a Russian fort for the fur trade and grew as the capital of a region rich in diamonds and gold. At the other extreme, summer highs in Kuwait City and Ahvaz often pass 45 °C, and Phoenix, Arizona, had a whole month of days over 43 °C in 2023.";
   s.more="Air conditioning made the hottest cities livable on this scale; Singapore’s founding leader, Lee Kuan Yew, called it the most important invention of the 20th century. Cooling now uses about a tenth of the world’s electricity."})}
 set("cities","The busiest ports",s=>{s.more="Shanghai’s main container port, Yangshan, sits on islands about 30 km offshore, linked to the mainland by a 32 km sea bridge, because the mouth of the Yangtze is too shallow and muddy for the biggest ships."});
 ins("cities","The oldest cities",{title:"The lowest bridge on the Thames",view:[-5.94,48.9,3.06,54.1],globe:[-0.09,51.5,6],card:"left",on:["rivers"],
  pins:[P([-0.088,51.508],"London Bridge")],
  stat:"London stands where it does because it was the point nearest the sea where the Romans could bridge the Thames",
  body:"Around AD 50 the Romans found firm gravel on both banks where the river was narrow enough to bridge. The Thames was still tidal there, so sea-going ships could sail right up to the bridge. Roads met at the crossing and ships unloaded beside it, so a city grew: Londinium.",
  more:"For centuries London Bridge was the only bridge across the Thames in the city; the next one in central London, at Westminster, opened only in 1750. Tower Bridge, often mistaken for it, was built downstream in 1894 as a drawbridge, so that tall ships could still pass."});
 ins("cities","The lowest bridge on the Thames",{title:"Paris was built from its own underground",view:[-3.52,46.23,5.48,51.43],globe:[2.33,48.85,6],card:"left",on:["rivers"],
  pins:[P([2.332,48.834],"The Catacombs"),P([2.343,48.886],"Montmartre: gypsum")],
  phPins:[ph([2.35,48.853],"Notre-Dame: stone from under Paris","Notre-Dame de Paris, 4 October 2017.jpg")],
  stat:"Paris dug its building stone from beneath its own streets, and the old quarries now hold the bones of about 6 million Parisians",
  body:"Paris sits on thick beds of limestone, so for centuries builders quarried it from tunnels under the city: much of Notre-Dame and the Louvre rose from stone dug nearby. The tunnels spread for hundreds of kilometres, until in 1774 a street caved in. The city began mapping and propping up its underground, and from 1786 moved the bones from its overflowing cemeteries into the old quarries: the Catacombs.",
  more:"Geologists named a whole age of Earth’s history, the Lutetian, after Lutetia, Paris’s Roman name, because its limestone is so typical. Montmartre’s gypsum gave the world “plaster of Paris”."});
 ins("cities","Paris was built from its own underground",{title:"Where the ships stopped",view:[-92,30.5,-70,43],globe:[-78,37,3],card:"left",on:["rivers"],
  lines:[{coords:[[-74.76,40.22],[-75.16,39.95],[-75.55,39.74],[-76.61,39.29],[-77.25,39.0],[-77.46,38.3],[-77.44,37.54],[-77.4,37.23],[-78.64,35.78],[-81.03,34.0],[-81.97,33.47],[-83.63,32.84],[-84.99,32.46]],kind:"dash"}],
  pins:[P([-74.76,40.22],"Trenton"),P([-75.16,39.95],"Philadelphia"),P([-76.61,39.29],"Baltimore"),P([-77.04,38.9],"Washington"),P([-77.44,37.54],"Richmond"),P([-81.03,34.0],"Columbia"),P([-81.97,33.47],"Augusta")],
  stat:"A string of US East Coast cities, from Trenton through Philadelphia, Baltimore and Washington to Richmond and Augusta, sits on one geological line",
  body:"The fall line (dashed) is where the hard rock of the uplands meets the soft sands of the coastal plain, so rivers tumble over rapids and falls there. Ships sailing upriver could go no further, so goods were unloaded and towns grew at the falls. The falling water also turned the wheels of the first mills and factories.",
  more:"Washington’s Great Falls of the Potomac lie just upstream of the city. Geographers call a place where goods must move from one kind of transport to another a break of bulk; the same idea explains cities at river mouths, mountain passes and border crossings around the world."});
 ins("cities","Where the ships stopped",{title:"The bedrock myth",view:[-79.83,38.15,-70.83,43.35],globe:[-73.99,40.73,6],card:"left",
  pins:[P([-73.984,40.754],"Midtown")],
  phPins:[ph([-74.012,40.707],"Downtown towers","Lower Manhattan from Jersey City November 2016 002.jpg")],
  stat:"Guides often say Manhattan’s skyscrapers skip the stretch between Downtown and Midtown because the bedrock lies too deep there; economists found that is mostly a myth",
  body:"Manhattan has two clusters of towers with lower buildings in between. The popular story is that solid rock lies deep under the gap. In 2011 economists compared the depth to bedrock with where tall buildings went up and found it made little difference: engineers could simply dig deeper foundations. Older neighbourhoods, land prices and new railway stations such as Grand Central mattered more.",
  more:"It is a good lesson for a geographer: the obvious physical explanation isn’t always the right one. Cities grow where people and money want to be, and engineers usually find a way."});
 order("cities",["Cities of the world","The oldest cities","The lowest bridge on the Thames","Paris was built from its own underground","Where the ships stopped","The bedrock myth","Money cities","The busiest ports","Countries that are a city","Divided cities","The biggest cities","A city the size of a country","Packed together","Africa’s booming cities","Cities at the extremes","Now explore"]);
}

function langrel(){if(!once("langrel"))return;
 rm("langrel","The biggest journey home");   /* Festivals' Lunar New Year is its home */
 set("langrel","Holy cities",s=>{const m=String(s.more||"");s.more=m.replace(/\s*The Golden Temple in Amritsar[^.]*\./,"").trim()});
 ins("langrel","Holy cities",{title:"Which way is Mecca?",view:[-160,-5,48,70],globe:[-20,40,1.3],card:"left",mode:"relief",
  gfRuler:{a:[-74.0,40.71],b:[39.83,21.42]},lines:[{coords:dense([-74.0,40.71],[39.83,21.42],24),kind:"dash"}],
  pins:[P([-74.0,40.71],"New York"),P([39.83,21.42],"Mecca")],
  stat:"From New York, the shortest way to Mecca sets off to the north-east, even though Mecca lies further south",
  body:"Muslims face Mecca to pray, a direction called the qibla. On a flat map Mecca looks south-east of New York (dashed), but on the globe the shortest route, a great circle, sets off north-east over the Atlantic towards Europe (the ruler; drag its ends). American Muslims long argued about which was right, and most mosques there now face north-east.",
  more:"Muslim astronomers worked out the qibla with spherical trigonometry over 1,000 years ago, and many old mosques face in slightly different directions as their methods improved. In Manhattan, the Islamic Cultural Center is turned about 29° off the street grid so that it faces Mecca."});
 ins("langrel","Sikhism’s Punjab",{title:"Waiting for the vultures",view:[50,12,80,32],globe:[70,22,3],card:"left",sub:"rel/_",_from:"culture",
  lines:[{coords:[[54.37,31.9],[60,27.5],[66,24.5],[72.87,20.48]],kind:"flow"}],
  pins:[P([72.80,18.96],"Doongerwadi, Mumbai"),P([72.87,20.48],"Udvada: the Parsis’ holiest fire"),P([54.37,31.9],"Yazd, Iran")],
  stat:"Mumbai’s Parsis traditionally leave their dead to vultures, but India lost almost all its vultures in about a decade",
  body:"Zoroastrians from Persia settled in Gujarat over 1,000 years ago and became the Parsis. Their faith holds that earth and fire must not be polluted, so instead of burial or cremation, the dead were laid in Towers of Silence for vultures to clean. In the 1990s India’s vultures crashed by over 95%, poisoned by a cattle painkiller, diclofenac, in the carcasses they fed on.",
  more:"India banned diclofenac for cattle in 2006, and some towers now use solar mirrors to speed things up. There are only about 57,000 Parsis in India, yet they founded firms such as Tata."});
}

function people(){if(!once("people"))return;
 set("people","Tomorrow’s biggest city",s=>{
  s.body="Dhaka grows by hundreds of thousands of people a year, many of them migrants from villages hit by floods, river erosion and poverty. Much of the new housing is crowded and informal, on low land that floods. (How the UN now measures cities, and the current ranking, are in the Cities tour.)";
  s.more="Bangladesh is one of the most crowded countries on Earth, and Dhaka holds much of its industry, including the garment factories that employ millions, most of them women.";
  s.view=[78,14,102,32];s.globe=[90.4,23.8,3.5];s.card="left";s.pins=[P([90.41,23.81],"Dhaka")];s.phPins=[]});
 ins("people","Town and country",{title:"A short-sighted generation",view:[95,15,150,48],globe:[122,32,2],card:"left",sub:"urban",hiSoft:["kr","tw","cn","jp","sg"],
  pins:[P([126.98,37.57],"Seoul"),P([113.26,23.13],"Guangzhou: the outdoor trial"),P([121.56,25.03],"Taipei")],
  stat:"In Seoul and other East Asian cities, around eight or nine in ten young people leaving school are short-sighted",
  body:"Short sight used to be fairly uncommon, but in East Asia’s cities it has become the norm. The main cause seems to be too little time outdoors: bright daylight appears to slow the growth of the eyeball, and children who study indoors all day get too little of it.",
  more:"In a trial in Guangzhou, one extra 40-minute class outdoors every school day cut new cases by about a quarter. Taiwan now urges schools to send children outside for two hours a day."});
 ins("people","Still on the land",{title:"From short to tallest",view:[-30,35,40,65],globe:[5,50,2.5],card:"left",sub:"hdi",hi:["nl"],hiSoft:["me","ba"],
  pins:[P([5.3,52.1],"The Netherlands: about 1.83 m")],
  stat:"In the mid-1800s Dutch men were among the shorter men in Europe; today they are the tallest on Earth, about 1.83 m on average",
  body:"Height is a record of childhood: good food, clean water and few illnesses let children reach their full height. As the Netherlands grew rich, with a diet heavy in milk and fairly equal incomes, its men grew about 20 cm in 150 years. Americans, the tallest people in the 1800s, have since fallen behind.",
  more:"One study found that taller Dutch men had slightly more children, so natural selection may also play a small part. Men in the mountains of Montenegro and Bosnia are nearly as tall."});
}

function sports(){if(!once("sports"))return;
 set("sports","Where sports were invented",s=>{const m=String(s.more||"");s.more=m.replace("Golf grew up in Scotland, and lawn tennis","Lawn tennis");
  s.phPins=(s.phPins||[]).filter(q=>!/St Andrews/.test(q.label)).map(q=>Object.assign({},q));
  if(Array.isArray(s.pins))s.pins=s.pins.filter(p=>!/St Andrews/.test(Array.isArray(p)?p[1]:p.text))});
 ins("sports","Runners from the highlands",{title:"The jump into thin air",view:[-110,12,-90,26],globe:[-99.13,19.43,4],card:"left",hiSoft:["mx"],
  pins:[P([-99.13,19.33],"Mexico City, 2,240 m")],
  xsec:{title:"From the Gulf coast up to Mexico City",pts:[[-96.13,19.2,"Veracruz"],[-96.9,19.5],[-97.6,19.2],[-98.2,19.05,"Puebla"],[-98.7,19.2],[-99.13,19.43,"Mexico City"]],mark:2000,
   note:"The dashed line marks 2,000 m. The Olympic city sat on a high plateau, where each breath holds about a quarter less oxygen than at sea level, and the air pushes back less. The heights are smoothed."},
  stat:"At the 1968 Olympics, 2,240 m up in Mexico City, Bob Beamon long-jumped 8.90 m, beating the world record by 55 cm",
  body:"Thin air at altitude pushes back less, so sprinters, jumpers and throwers go further. Mexico City’s Games brought a burst of records in short events, and Beamon’s leap stood for nearly 23 years. Distance runners, short of oxygen, struggled, and many of the long races were won by men who had grown up at altitude, in Kenya and Ethiopia.",
  more:"In 2007 FIFA tried to ban international football above 2,500 m, which would have stopped matches in La Paz, where Bolivia’s home team is famously hard to beat; after protests the ban was dropped within a year."});
 ins("sports","Ice hockey and the cold north",{title:"Skiing speaks Norwegian",view:[-2,55,22,66],globe:[8.6,59.5,4],card:"left",hi:["no"],
  pins:[P([8.62,59.48],"Morgedal, Telemark")],
  stat:"Norway has won more Winter Olympic medals than any other country, and ‘ski’ and ‘slalom’ are Norwegian words",
  body:"In snowy, mountainous Norway, skis were for centuries the way to get around in winter. In the 1800s Sondre Norheim of Morgedal, in Telemark, used bindings that held the heel firmly and found turns that let skiers race downhill, starting modern skiing. ‘Slalom’ comes from the Norwegian for ‘sloping track’.",
  more:"The telemark turn is named after his home region. With only about 5.5 million people, Norway often tops the medal table at the Winter Games."});
 ins("sports","Where sports were invented",{title:"Golf on useless land",view:[-8.65,53.74,0.35,58.94],globe:[-2.8,56.34,6],card:"left",
  pins:[P([-2.8,56.34],"St Andrews")],
  phPins:[ph([-2.82,56.345],"St Andrews: the Old Course","Swilken Bridge, Old Course geograph-6310525-by-Gordon-Hatton.jpg")],
  stat:"Golf grew up on ‘links’, sandy strips by the sea too poor to farm",
  body:"Along Scotland’s east coast, wind-blown sand dunes link the beach to the farmland behind. Their grass was short, cropped by sheep and rabbits, and nobody could plough the sand, so townspeople played games there. At St Andrews, golf has been played since at least the 1500s.",
  more:"In 1457 Scotland’s king banned golf and football, because men were playing instead of practising archery. Bunkers are said to have begun as hollows where sheep sheltered from the wind."});
 CARD["sports|Golf on useless land"]="Swilken Bridge, Old Course geograph-6310525-by-Gordon-Hatton.jpg";
}

function festivals(){if(!once("festivals"))return;
 ins("festivals","Holi and Diwali",{title:"The biggest crowd on Earth",view:[60,12,92,33],globe:[81.9,25.4,3.5],card:"left",on:["rivers"],hiSoft:["in"],
  pins:[P([81.88,25.43],"Prayagraj: the rivers meet"),P([78.16,29.95],"Haridwar"),P([75.78,23.18],"Ujjain"),P([73.79,20.0],"Nashik")],
  stat:"The 2025 Kumbh Mela at Prayagraj counted over 600 million visits in six weeks, among the largest gatherings in human history",
  body:"Hindu pilgrims come to bathe where the Ganges and Yamuna rivers meet, believing it washes away sin. The Kumbh Mela moves between four river cities, Prayagraj, Haridwar, Ujjain and Nashik, over a 12-year cycle, with dates set by the positions of Jupiter, the Sun and the Moon.",
  more:"Crowds this big are hard to count, so the numbers are official estimates; on one of the busiest days in 2025 a crush killed dozens of pilgrims. The festival’s tent city on the riverbanks is big enough to see in satellite pictures."});
 ins("festivals","Inti Raymi",{title:"Naadam: the three games of the steppe",view:[85,38,125,54],globe:[106.9,47.9,3],card:"left",hi:["mn"],
  pins:[P([106.92,47.92],"Ulaanbaatar")],
  phPins:[ph([107.6,47.6],"Naadam horse race","Naadam 2023 - Horse racing 09.jpg")],
  stat:"In the horse races of Mongolia’s Naadam festival, the jockeys are children, and the races run 15 to 30 km across open grassland",
  body:"Every July, Mongolia celebrates Naadam with the three ‘manly games’ of a herding people: wrestling, horse racing and archery. The open steppe is the racecourse, and children ride because they are light: the race tests the horse, bred and trained by herding families, more than the rider.",
  more:"Women and girls compete in archery and in the horse races, though not in the wrestling. Naadam is on UNESCO’s list of the world’s intangible cultural heritage."});
 CARD["festivals|Naadam: the three games of the steppe"]="Naadam 2023 - Horse racing 09.jpg";
 ins("festivals","Fire and ice in midwinter",{title:"Welcome back, Sun",view:[-20,58,45,82],globe:[15,72,2.5],card:"left",gfSun:{utc:12,day:67},
  pins:[P([15.65,78.22],"Longyearbyen"),P([18.96,69.65],"Tromsø: sun day in late January"),P([8.59,59.88],"Rjukan: mirrors on the mountain")],
  phPins:[ph([16.3,78.0],"Longyearbyen","Longyearbyen-spisshus-2022.jpg")],
  stat:"In Longyearbyen the Sun stays away for about four months; the town celebrates when its rays first touch the old hospital steps, around 8 March",
  body:"Far north of the Arctic Circle, the Sun stays below the horizon from late October to mid-February, and the mountains around the town hide it for a few weeks more. The day its light reaches the steps is the heart of Solfestuka, ‘Sun festival week’. The map shows noon on 8 March: the day-and-night line has only just let Svalbard back into the light.",
  more:"Rjukan, in a deep Norwegian valley, gets no direct sun for about half the year, so in 2013 it put giant mirrors on the mountainside to beam sunlight into the town square."});
}

function houses(){if(!once("houses"))return;
 set("houses","Snow houses",s=>{const m=String(s.more||"");s.more=m.replace(/\s*In Sweden the Icehotel[^.]*\./,"").trim()});
 ren("houses","Informal settlements","Cities built by their people");
 ins("houses","Building with earth",{title:"Towers that catch the wind",view:[42,24,64,38],globe:[54.4,31.9,3.5],card:"left",hiSoft:["ir"],
  pins:[P([54.37,31.9],"Yazd")],
  stat:"Yazd’s skyline is full of windcatchers, towers that cooled houses for centuries without electricity",
  body:"In hot, dry Yazd, in the middle of Iran, tall towers called badgirs catch any breeze high above the street and steer it down into the rooms, while warm air escapes out of the top. Some send the air over cool water in underground channels, qanats, before it reaches the house.",
  more:"The same desert builders made yakhchāls, domed ice houses: in winter, water froze in shallow pools at night, and the ice was stored under the thick dome through the summer."});
 ins("houses","Steep roofs for rain and snow",{title:"Houses made of grass",view:[-34,61,-10,68],globe:[-19,65,4],card:"left",hiSoft:["is"],
  pins:[P([-19.51,65.61],"Glaumbær")],
  stat:"For about 1,000 years, most Icelanders lived in houses with walls and roofs of turf",
  body:"Iceland has had little timber since the first settlers cleared its birch woods. So families built thick walls of cut turf on stone footings, around a wooden frame of driftwood or imported logs, with grass growing on the roof. Turf kept out the long, windy winters well.",
  more:"Grass roofs are traditional in Norway and the Faroe Islands too. Some Icelanders still lived in turf houses well into the 20th century; the turf farm at Glaumbær, in the north, is now a museum."});
}

/* =====================================================================================================
   TOUR QUESTIONS: follow renamed and removed stops, a few new ones
   ===================================================================================================== */
const NEWQ={
 environment:[{st:"Bags that flooded a city",q:"Why did Bangladesh ban thin plastic bags in 2002?",o:["They blocked Dhaka’s drains in floods","They were killing river dolphins","Plastic was too expensive to import","To protect its jute farmers"],a:0,why:"Choked drains made the floods of 1988 and 1998 worse, so the ban was about flooding first.",kc:"bd"},{st:"The man who poisoned the air twice",q:"Which country sold the world’s last leaded petrol, in 2021?",o:["Algeria","Norway","Bhutan","Brazil"],a:0,why:"Algeria used up the last stocks in July 2021, a century after lead was first added to petrol.",kc:"dz"}],
 animals:[{st:"The last few vaquitas",q:"What is killing the last vaquitas?",o:["Gillnets set for the totoaba fish","Oil spills","Shark attacks","Cold water"],a:0,why:"Vaquitas drown in gillnets set for totoaba, whose swim bladders sell for thousands of dollars in China.",kc:"mx"}],
 landmarks:[{st:"The tower that leans to survive",q:"Why does the Leaning Tower of Pisa lean?",o:["Its soft clay ground sank on one side","It was built leaning on purpose","An earthquake in 1990 tipped it","Its top floors are made of heavier stone"],a:0,why:"The soft river clay under it sank on one side within five years of the start of building.",kc:"it"},
  {st:"Petra’s war on floods",q:"How did Petra’s builders protect the Siq from flash floods?",o:["With a dam and a tunnel through the mountain","By roofing over the gorge","By moving the city uphill","With walls of sandbags"],a:0,why:"The Nabataeans dammed the Siq’s entrance and cut an 88 m tunnel to send floodwater around it.",kc:"jo"}],
 cities:[{st:"Paris was built from its own underground",q:"What did Paris move into its old underground quarries from 1786?",o:["The bones from its overflowing cemeteries","The king’s wine cellars","Its first metro line","Gunpowder stores"],a:0,why:"The old limestone quarries became the Catacombs, which hold the bones of about 6 million Parisians.",kc:"fr"}],
 culture:[],
 food:[{st:"Maize without the recipe",q:"Why did maize cause pellagra outside Mexico?",o:["It was eaten without first being cooked with lime","It was grown in poor soil","It carried a virus from Mexico","It was always eaten raw"],a:0,why:"Cooking maize with lime (nixtamalisation) frees its niacin; Europeans took the plant but not the recipe.",kc:"mx"}],
 langrel:[{st:"Which way is Mecca?",q:"From New York, which way does the shortest route to Mecca set off?",o:["North-east","South-east","Due east","Due south"],a:0,why:"On a globe the great-circle route sets off north-east over the Atlantic, although Mecca lies further south.",kc:"sa"}],
 flags:[{st:"Flags that are sea charts",q:"On Nauru’s flag, what does the yellow line stand for?",o:["The equator","A beach","The Sun’s path","Phosphate"],a:0,why:"The star sits just below the line, as Nauru lies about 60 km south of the equator.",kc:"nr"}]
};
const RECAP={
 cities:{"The capital isn’t the biggest city":{st:"The lowest bridge on the Thames",q:"Why did London grow up where it did?",o:["The Romans could bridge the Thames there, close to the sea","It had England’s best farmland","It stood on the highest hill in the south","It was the old capital of the Celts"],a:0,why:"It was the point nearest the sea where the river could be bridged, and sea-going ships could reach it.",kc:"gb"},
  "Sinking cities":{st:"Where the ships stopped",q:"Why did towns grow along the US East Coast’s fall line?",o:["Ships could sail no further upriver, and the falls powered mills","Gold was found there","It was the border between colonies","The land was flattest there"],a:0,why:"At the falls goods had to be unloaded, and the falling water turned the first mills.",kc:"us"}},
 culture:{"Left or right?":{st:"Whistling across the valleys",q:"How can people on La Gomera ‘speak’ across deep ravines?",o:["By whistling Spanish","By drumming","With smoke signals","By tapping on wood"],a:0,why:"Silbo Gomero turns Spanish into whistles that carry several kilometres.",kc:"es"}}
};
function questions(){try{if(typeof TOURQ==="undefined")return;
 const ids=["environment","animals","humans","islandlife","biomes","forests","ocean","amigration","crops","food","landmarks","migration","culture","flags","cities","langrel","people","sports","festivals","houses"];
 ids.forEach(id=>{const Q=TOURQ[id],t=T(id);if(!Q||!t)return;const titles=t.steps.map(s=>s.title);
  /* renamed stops */
  RN.filter(r=>r[0]===id).forEach(([,a,b])=>[...(Q.mid||[]),...(Q.recap||[])].forEach(q=>{if(q.st===a)q.st=b;if(q.at===a)q.at=b}));
  /* recap questions about a removed stop are replaced */
  const R=RECAP[id]||{};(Q.recap||[]).forEach((q,i)=>{if(R[q.st]&&!titles.includes(q.st)&&titles.includes(R[q.st].st))Q.recap[i]=Object.assign({},R[q.st])});
  /* a mid question is asked on leaving its own stop */
  (Q.mid||[]).forEach(q=>{if(q.st&&titles.includes(q.st)&&!titles.includes(q.at))q.at=q.st});
  /* a mid question whose stop is gone goes too (its replacement is in NEWQ) */
  if(Q.mid)Q.mid=Q.mid.filter(q=>!q.st||titles.includes(String(q.st).split("|").pop()));
  (NEWQ[id]||[]).forEach(q=>{if(titles.includes(q.st)&&!(Q.mid||[]).some(x=>x.q===q.q))(Q.mid=Q.mid||[]).push(Object.assign({at:q.st},q))})})}catch(e){console.error(e)}}

/* ---------- run ---------- */
function patch(){merge();
 [environment,animals,humans,islandlife,biomes,forests,ocean,amigration,crops,food,landmarks,migration,languages,flags,cities,langrel,people,sports,festivals,houses].forEach(f=>{try{f()}catch(e){console.error(e)}});
 cards();questions();
 try{for(const id in PS_TOURS){const t=T(id);if(t&&t.steps._rvLife)t.steps.forEach(reg)}}catch(e){}}
/* register just before a stop draws too, in case another file rebuilt the label map */
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&ps.tour){const t=T(ps.tour);if(t&&t.steps._rvLife){const s=psSteps()[i];if(s)reg(s)}}}catch(e){}return _g.apply(this,arguments)}}
window.gfReviewLife={patch,RN};
[0,1500,5000,12000].forEach(ms=>setTimeout(patch,ms));
})();
