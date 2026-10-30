/* GeoFlock: the tour review applied to the AP Human Geography shelf (hg1 … hg7d). New stops that give each AP term a
   real place, plain-language fixes and updated facts, and reworks of the tours that scored below 7.0 (Data, regions and
   environment; Population futures; Cultural landscapes; Religion, language and change; Forces that bind and divide;
   Empires, power and unions; Food in a global system; Building better cities; Measuring development; Sustainable
   development): weak or repeated stops cut or merged, the rest reordered. Map work: flow lines (the US centre of
   population, the Great Migration, custom cutters, roses to Europe, the Dust Bowl), dashed lines for lines on the
   ground (the Black Belt, the Huai line, the Benrath line, the Röstigraben, the Fall Line), rulers, an EEZ circle,
   day and night for Manila's night shift, photo pins from the shared library. Every patch is keyed by tour id and stop
   title (a stop that has been renamed or removed elsewhere is simply skipped); the flag sits on the steps array
   (steps._rvA). Load after the tour files and geoflock-polish-*.js. */
(function(){
const OPEN={hg1:"Thinking like a geographer",hg1b:"Data, regions and environment",hg2a:"Where people live",hg2b:"Models of population",
 hg2c:"Why people move",hg2d:"Population futures",hg3a:"How culture spreads",hg3b:"Cultural landscapes",hg3c:"Religion, language and change",
 hg4a:"States, nations and boundaries",hg4b:"Forces that bind and divide",hg4c:"Empires, power and unions",hg4d:"Lines on land, sea and ballot",
 hg5a:"How the world farms",hg5b:"Models of rural land",hg5c:"Food in a global system",hg5d:"Farming and the planet",hg6a:"A world of cities",
 hg6b:"Inside the city",hg6c:"Building better cities",hg6d:"Cities under pressure",hg7a:"Measuring development",
 hg7b:"Industry and the global economy",hg7c:"Trade and the world economy",hg7d:"Sustainable development"};
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
/* writes go through defineProperty, so they replace fields that index.html locked with getters */
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(new Proxy(s,{set(o,k,v){def(o,k,v);if(k==="view")def(o,"_ff",1);return true},deleteProperty(o,k){try{def(o,k,undefined)}catch(e){}return delete o[k]}}))}catch(e){console.error(e)}};
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
/* a view with the place a little right of centre, clear of the card on the left */
const at=(lon,lat,w,o)=>{const h=w*.58,z=w<=10?5.2:w<=17?4.5:w<=26?3:w<=40?2.4:w<=75?1.8:1.2;
 return Object.assign({view:[+(lon-.6*w).toFixed(2),+(lat-h/2).toFixed(2),+(lon+.4*w).toFixed(2),+(lat+h/2).toFixed(2)],globe:[lon,lat,z],_ff:1,card:"left"},o||{})};
const W={view:[-180,-58,180,80]};
/* insert a new stop after the stop titled `after` (once); it takes the tour's AP label and the opening stop's map filter */
/* the AP topic each new stop teaches, shown on its card */
const AP={"A coastline in the votes":"spatial association","A map in your passport":"maps and point of view","Near on the map, far in practice":"absolute and relative distance",
 "Lasers find lost cities":"remote sensing","Mapping a disaster from home":"geographic data in use","A line for heating":"formal regions","One region, two countries":"functional regions",
 "A factory city in the rainforest":"population distribution","A free hectare in the Far East":"population policy","America’s moving middle":"population distribution over time",
 "Still growing, below replacement":"population momentum","The year of the Fire Horse":"population pyramids","Healthier, yet more deaths":"crude death rate",
 "Mr Condom":"antinatalist policies","The decree that doubled births":"pronatalist policies","The rich country with big families":"culture and fertility","A village of dolls":"ageing and rural depopulation",
 "The jungle that emptied":"intervening obstacles","Everyone leaves London":"counter-urbanisation","A beetle and a train ticket":"interregional migration",
 "A wall against K-pop":"barriers to diffusion","Nollywood began with blank tapes":"reterritorialisation","A copy of Hallstatt":"placelessness","A hole for the dragon":"religion in the landscape",
 "Stop signs that say Arrêt":"language in the landscape","Where Islam meets Christianity":"interfaith boundaries","Maken or machen":"dialects and isoglosses","One language, two scripts":"language divergence",
 "Swapped by religion":"nation-states","The border that melted":"physical boundaries","A frontier, not a line":"frontiers and boundaries","A language nobody’s mother spoke":"centripetal forces",
 "Sinhala Only":"ethnonationalism","The rösti ditch":"centrifugal and centripetal forces","From 3 regions to 36 states":"federal states","China’s railway to the copper belt":"neocolonialism",
 "The heartland":"geopolitical theory","The footballer who changed Europe":"supranationalism","Concrete on two rocks":"Law of the Sea","Six million votes, one senator":"malapportionment",
 "The I-85 district":"majority-minority districts","Following the wheat north":"commercial grain farming","Cows go up the mountain":"transhumance","Salmon farms at the bottom of the world":"aquaculture",
 "Circles in squares":"centre-pivot irrigation","Split between sons":"inheritance and farm size","Corn that fuels cars":"biofuels","Roses from the equator":"global supply chains",
 "Half an island for rent":"land acquisition and food security","The Dust Bowl":"soil erosion","Bees on lorries":"monoculture","The railway city":"Borchert’s epochs","The biggest city that isn’t":"defining the city",
 "Rich in the middle":"the European city","Pools on every balcony":"gated communities","A city without cars":"the Middle Eastern city","No zoning at all":"zoning",
 "A city shaped like a hand":"transit-oriented development","The garden city":"garden cities","Superblocks":"walkable cities","The day modern architecture died":"urban renewal",
 "Venice is emptying":"displacement","Vienna houses half its people":"affordable housing","Healthy before rich":"the HDI","Gross National Happiness":"measuring wellbeing","Across the motorway":"inequality (Gini)",
 "Ore from the other side of the world":"energy and industrial location","A town planned around watchmakers":"industrial inertia","Night shift in Manila":"offshoring services","The chicken tax":"protectionism",
 "18,000 companies, one building":"offshore finance","The world’s biggest fleet sails under Liberia":"flags of convenience","The ecological footprint":"ecological footprint",
 "Rich in oil, poor in people":"the resource curse","A town that trades its waste":"circular economy","Debt for turtles":"debt-for-nature swaps","$1,500 to see a gorilla":"ecotourism"};
const NEW=new Set();
const ins=(id,after,s)=>{const t=T(id);if(!t||t.steps.some(x=>x.title===s.title))return;const i=t.steps.findIndex(x=>x.title===after);if(i<0)return;
 const un=(String((t.steps[1]&&t.steps[1].ap)||t.steps[0].ap||"").match(/Unit \d/)||["Unit"])[0];
 const base={_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,_rvNew:1,ap:AP[s.title]?un+" · "+AP[s.title]:(t.steps[0].ap||un)};
 if(t.steps[0].sub!=null&&s.sub==null)base.sub=t.steps[0].sub;if(!s.globe&&s.view)base.globe=[(s.view[0]+s.view[2])/2,(s.view[1]+s.view[3])/2,1];
 const n=Object.assign(base,s);t.steps.splice(i+1,0,n);NEW.add(n)};
const rm=(id,title)=>{const t=T(id);if(!t)return;const i=t.steps.findIndex(x=>x.title===title);if(i>0)t.steps.splice(i,1)};
/* put the stops in this order (the opening stop stays first; any stop not named keeps its place at the end) */
const ord=(id,titles)=>{const t=T(id);if(!t)return;const S=t.steps,first=S[0],rest=S.slice(1),out=[first];
 titles.forEach(x=>{const k=rest.findIndex(s=>s&&s.title===x);if(k>=0){out.push(rest[k]);rest[k]=null}});rest.forEach(s=>{if(s)out.push(s)});
 S.splice(0,S.length,...out)};
function frame(s){try{const v=s.view;if(!v||v[2]-v[0]>=200||s.card==="right")return;const P=[];
 const add=a=>{if(Array.isArray(a)&&typeof a[0]==="number"&&typeof a[1]==="number")P.push(a)};
 (s.pins||[]).forEach(p=>{if(!Array.isArray(p))return;const a=p[0];if(Array.isArray(a)&&Array.isArray(a[0]))a.forEach(add);else add(a)});
 (s.phPins||[]).forEach(q=>add(q.at));(s.ghosts||[]).forEach(g=>add(g.at));if(s.gfRuler){add(s.gfRuler.a);add(s.gfRuler.b)}
 (s.lines||[]).forEach(l=>(l.coords||[]).forEach(add));
 const L=P.filter(a=>a[0]>=v[0]-20&&a[0]<=v[2]+20).map(a=>a[0]);if(!L.length)return;
 const w=v[2]-v[0],ew=Math.max(w,(v[3]-v[1])*1.6),cx=(v[0]+v[2])/2,mn=Math.min(...L),mx=Math.max(...L),f=x=>.5+(x-cx)/ew;
 if(f(mn)>=.48)return;let W0,E0;
 if(f(mx)+(.52-f(mn))<=.95){const d=(.52-f(mn))*ew;W0=v[0]-d;E0=v[2]-d}
 else{const nw=Math.max(w,(mx-mn)/.43),c=mn-.02*nw;W0=c-nw/2;E0=c+nw/2}
 def(s,"view",[+W0.toFixed(2),v[1],+E0.toFixed(2),v[3]]);def(s,"_ff",1);def(s,"card","left")}catch(e){console.error(e)}}

function patch(){
/* ───────── hg1 Thinking like a geographer ───────── */
if(T("hg1")&&!T("hg1").steps._rvA){T("hg1").steps._rvA=1;
 ins("hg1","Geography’s tools",Object.assign(at(-87,32.4,16),{title:"A coastline in the votes",
  lines:[{coords:[[-88.45,33.35],[-88.1,32.95],[-87.7,32.6],[-87.2,32.38],[-86.6,32.22],[-86.0,32.15],[-85.4,32.22],[-84.95,32.35]],kind:"dash"}],
  pins:[[[[-87.3,32.6]],"The Black Belt","area"],[[-87.02,32.41],"Selma","point"],[[-86.3,32.38],"Montgomery","point"]],
  stat:"Maps of Alabama’s elections still trace the shore of a sea from the age of the dinosaurs",
  body:"About 80 million years ago a shallow sea covered southern Alabama, and chalk built up on its floor. The chalk weathered into a crescent of dark, fertile soil, the “Black Belt” (dashed). In the 1800s it became cotton country, worked by enslaved people. Their descendants are still most of the people in many of these counties, so the same curve shows on maps of soil, of population and of votes.",
  more:"AP calls this spatial association: patterns on different maps that line up. Lining up is not proof by itself. Here a chain of causes links them: rock to soil, soil to cotton, cotton to slavery, slavery to where people live today."}));
 ins("hg1","Every flat map distorts",Object.assign({view:[62,-2,136,46],globe:[104,22,1.8],_ff:1,card:"left"},{title:"A map in your passport",
  pins:[[[[113,13]],"South China Sea","area"],[[[79.5,35.2]],"Aksai Chin","area"],[[[93.8,28]],"Arunachal Pradesh","area"]],
  stat:"In 2012 some of China’s neighbours refused to stamp its new passports, because of a map printed inside",
  body:"Every map is drawn by someone, for some purpose, and it carries their point of view. China’s 2012 passport printed a map showing its claim to most of the South China Sea, and to Aksai Chin and Arunachal Pradesh, which India also claims. Vietnam and the Philippines put their visas on separate sheets rather than stamp it, and India stamped its own map onto the visas it issued.",
  more:"The same coastlines and mountains are drawn differently on maps printed in Beijing, Hanoi, Manila or Delhi. AP asks you to spot a map’s purpose and point of view, and what it leaves out."}));
 ins("hg1","Distance decay and a shrinking world",Object.assign(at(-75,-7.5,26),{title:"Near on the map, far in practice",on:["rivers"],
  gfRuler:{a:[-77.04,-12.05],b:[-73.25,-3.75]},pins:[[[-77.04,-12.05],"Lima","point"]],phPins:[ph([-73.25,-3.75],"Iquitos: the river is the road","Amazon River - 2018.jpg")],
  stat:"Iquitos, a city of nearly half a million people, cannot be reached by road",
  body:"Absolute distance is measured in kilometres; relative distance in time, cost or effort. Drag the ruler: Iquitos is about 1,000 km from Lima, under two hours by plane, but no road crosses the Andes and the rainforest to it. Almost everything else comes up the Amazon by boat, a trip of days.",
  more:"It is often called the largest city in the world you cannot drive to. Relative distance is why goods cost more there, and why the city looks downriver, towards Brazil and the Atlantic, as much as towards its own capital."}));
 set("hg1","Distance decay and a shrinking world",s=>{s.more="Distance decay is why a functional region has an edge: past a certain distance, the pull of the centre fades. The internet weakens it for ideas and friendships, but much less for daily shopping, commuting and moving house."});
}
/* ───────── hg1b Data, regions and environment (rework) ───────── */
if(T("hg1b")&&!T("hg1b").steps._rvA){T("hg1b").steps._rvA=1;
 set("hg1b","Data, regions and environment",s=>{s.phPins=(s.phPins||[]).filter(q=>!/Rondônia/.test(q.label)).concat([ph([-89.62,17.22],"Tikal: lasers under the forest","Tikal Temple II.jpg")])});
 rm("hg1b","Seeing from space");
 ins("hg1b","Data decide who gets what",Object.assign(at(-89.6,17.2,14),{title:"Lasers find lost cities",
  pins:[[[[-89.9,16.9]],"Petén forest","area"]],phPins:[ph([-89.62,17.22],"Tikal","Tikal Temple II.jpg")],
  stat:"In 2018 lasers fired from planes revealed over 60,000 hidden Maya structures under Guatemala’s forest",
  body:"Remote sensing means gathering data from a distance, without touching the ground. LiDAR fires millions of laser pulses from an aircraft; a few slip through gaps in the leaves and bounce off the ground, so computers can strip the trees away. Under the forest round Tikal appeared houses, roads, farm terraces, walls and pyramids that people on foot had walked past for a century.",
  more:"The scans suggest the Maya lowlands held millions of people, far more than once thought. In 2024 a student found a whole lost Maya city in Mexico by re-reading LiDAR data collected to study forests. Satellites do the same job at a larger scale: Landsat has photographed the whole Earth since 1972."}));
 ins("hg1b","Lasers find lost cities",Object.assign(at(-72.34,18.54,10),{title:"Mapping a disaster from home",
  pins:[[[-72.34,18.54],"Port-au-Prince","point"]],
  stat:"After Haiti’s 2010 earthquake, volunteers around the world mapped Port-au-Prince in a few weeks",
  body:"When the quake struck, online maps of the city were nearly blank. Hundreds of volunteers traced roads, buildings and camps from fresh satellite images into OpenStreetMap, a free map anyone can edit, and rescuers and aid groups used it on the ground. It was a GIS, a map of stacked data layers, built by a crowd.",
  more:"Geographers call this volunteered geographic information. It is fast and cheap, but only as good as the people adding to it, and poor or remote places are still mapped least."}));
 set("hg1b","Formal and functional regions",s=>{s.body="A formal region shares one measurable trait: the Sahara’s desert climate, or the area where French is spoken. Drag the ruler: the Sahara stretches about 5,500 km from the Atlantic to the Red Sea. A functional region is tied to a centre by daily links, such as everyone who commutes into London, or across the Causeway into Singapore."});
 ins("hg1b","Formal and functional regions",Object.assign({view:[92,22,126,44],globe:[112,33,2.4],_ff:1,card:"left"},{title:"A line for heating",
  lines:[{coords:[[104.5,34.1],[106.5,33.9],[108.5,33.8],[110.5,33.5],[112.5,33.0],[114.5,32.6],[116.3,32.5],[117.4,32.9],[118.5,33.3],[119.6,33.9]],kind:"dash"}],
  pins:[[[[113,36.3]],"North: free coal heating","area"],[[[113,29.6]],"South: no heating system","area"],[[117.4,32.95],"Huai River","point"]],
  stat:"People just north of China’s Huai River live about three years less than people just south, because of a heating rule",
  body:"From the 1950s China gave free or cheap coal heating in winter only north of the Huai River and the Qinling mountains (dashed), its official line between north and south. A line drawn for a formal region became a line in the air: north of it, smoke pollution was far higher, and a 2017 study found life expectancy about three years lower.",
  more:"People on either side are otherwise alike, so the river works as a natural experiment: a regional boundary used to measure cause and effect. The same line roughly divides rice-growing from wheat-growing China."}));
 ins("hg1b","A line for heating",Object.assign(at(103.77,1.45,9),{title:"One region, two countries",
  pins:[[[103.76,1.49],"Johor Bahru, Malaysia","point"],[[103.82,1.35],"Singapore","point"],[[103.77,1.455],"The Causeway","point"]],
  phPins:[ph([103.86,1.28],"Singapore: jobs","Marina Bay Sands and illuminated polyhedral building Louis Vuitton over the water at blue hour with pink clouds in Singapore.jpg")],
  stat:"About 300,000 people cross between Malaysia and Singapore by land every day",
  body:"A functional region is held together by flows, and flows do not stop at borders. Many people live in cheaper Johor Bahru, in Malaysia, and work in Singapore, crossing the 1 km Causeway or the second bridge each morning. Singapore also pipes much of its water from Johor.",
  more:"A cross-border rail link, the RTS Link, is due to open around the start of 2027 and carry commuters across in minutes. The same pattern ties El Paso to Ciudad Juárez, and Geneva to the French towns around it: one functional region spanning two formal ones."}));
 set("hg1b","Using land without using it up",s=>{s.more="Sustainability means meeting today’s needs without ruining the land, water and air for later generations. There is a partial happy ending: in 2005 Kazakhstan finished the Kokaral Dam, cutting off the small northern part of the sea. Its water rose, fish returned and fishing restarted near Aralsk, while the southern part kept shrinking."});
 ord("hg1b",["Walking the streets","A map that stopped an epidemic","Counting everyone","Data decide who gets what","Lasers find lost cities","Mapping a disaster from home",
  "Formal and functional regions","A line for heating","One region, two countries","Perceptual regions","Does nature decide?","People adapt nature","Using land without using it up"]);
}
/* ───────── hg2a Where people live ───────── */
if(T("hg2a")&&!T("hg2a").steps._rvA){T("hg2a").steps._rvA=1;
 set("hg2a","Physiological density",s=>{s.more="Japan shows the same squeeze: about 330 people per km² overall, but nearly 3,000 per km² of farmland, because most of the country is steep forest. It grows only about 38% of the calories it eats and imports the rest."});
 ins("hg2a","Where people avoid",Object.assign(at(-60,-3.1,16),{title:"A factory city in the rainforest",on:["rivers"],
  pins:[[[[-62,-6]],"Rainforest: few people","area"]],phPins:[ph([-60.02,-3.12],"Manaus: where the rivers meet","The Meeting of the Waters, Manaus, Brazil.jpg")],
  stat:"About two million people live in Manaus, in the middle of the Amazon, largely because of tax breaks",
  body:"Rainforest is one of the places people usually avoid. Manaus boomed on rubber around 1900, then faded. In 1967 Brazil made it a free trade zone, with low taxes for factories, and firms came to assemble motorbikes, TVs and phones from parts shipped up the Amazon. The city has grown about six times over since then.",
  more:"Human decisions can override the environment’s usual limits, at a cost: Brazil gives up billions in taxes each year to keep the factories there, and almost everything still arrives by river or by air."}));
 ins("hg2a","Pulling people inland",Object.assign({view:[85,33,165,68],globe:[132,50,1.8],_ff:1,card:"left"},{title:"A free hectare in the Far East",
  pins:[[[[138,58]],"Russian Far East: emptying","area"],[[[126,45.5]],"Northeast China: far more people","area"],[[131.89,43.12],"Vladivostok","point"]],
  stat:"Since 2016 any Russian can claim a free hectare of land in the Far East, to stop it emptying",
  body:"Russia’s Far East is huge, cold and about 6,400 km from Moscow, and it has lost well over a million people since the Soviet Union ended. Across the border, northeast China holds many times as many people: compare the colours. The free-hectare scheme tries to pull settlers east, as Brasília tried to pull Brazilians inland.",
  more:"Tens of thousands have claimed land, but many plots lie unused and people keep leaving. Policies that fight the pull of jobs and a milder climate tend to struggle."}));
 ins("hg2a","A free hectare in the Far East",Object.assign({view:[-108,29,-68,48],globe:[-84,39,2],_ff:1,card:"left"},{title:"America’s moving middle",
  lines:[{coords:[[-76.18,39.28],[-76.93,39.27],[-77.62,39.19],[-78.55,39.09],[-79.28,38.96],[-80.3,39.03],[-81.32,38.98],[-82.81,39.0],[-83.59,39.2],[-84.66,39.07],[-85.55,39.2],[-85.81,39.16],[-86.54,39.17],[-86.72,39.17],[-87.14,39.06],[-87.38,38.95],[-88.37,38.8],[-89.21,38.6],[-89.71,38.46],[-90.57,38.14],[-91.22,37.87],[-91.81,37.7],[-92.17,37.52],[-92.33,37.42]],kind:"flow"}],
  pins:[[[-76.07,39.21],"1790: near Chestertown, Maryland","point"],[[-87.14,39.06],"1930: Indiana","point"],[[-92.51,37.25],"2020: near Hartville, Missouri","point"]],
  stat:"The centre of the US population has moved about 1,400 km since 1790, from Maryland to the Missouri Ozarks",
  body:"If every American weighed the same and stood on a flat map of the country, the map would balance at one point: the mean centre of population. In 1790 it lay near Chestertown, Maryland, by Chesapeake Bay. Every ten-year census since has moved it west (the line) as people spread across the continent; in the last century it has also drifted south.",
  more:"The southward turn is the rise of the Sun Belt, helped by air conditioning, cheaper land and jobs in Texas, Florida and Arizona. The 2020 census put the centre near Hartville, a town of about 600 people."}));
}
/* ───────── hg2b Models of population ───────── */
if(T("hg2b")&&!T("hg2b").steps._rvA){T("hg2b").steps._rvA=1;
 set("hg2b","Births, deaths and natural increase",s=>{s.title="Natural increase and doubling";s.hi=["ne","de"];
  s.pins=[[[8,17],"Niger: doubles in about 20 years","point"],[[10.4,51.2],"Germany: shrinks naturally, grows by migration","point"]];
  s.stat="Natural increase is births minus deaths; divide 70 by its rate to find the doubling time";
  s.body="The crude birth rate (CBR) and crude death rate (CDR) count births and deaths per 1,000 people a year. Their difference, as a percentage, is the rate of natural increase (RNI): a CBR of 40 and a CDR of 10 give 3% a year. At 1% a population doubles in about 70 years; Niger, growing about 3.5% a year, could double in about 20.";
  s.more="Natural increase ignores migration: Germany has more deaths than births, yet grows because people move in. Fast doubling means building twice the schools, jobs and homes within one generation just to stand still."});
 rm("hg2b","Doubling time");
 set("hg2b","Stages 4 and 5: low and shrinking",s=>{s.stat="South Korea has about 0.75 children per woman, the lowest on Earth";
  s.pins=[[[127,37.5],"South Korea: about 0.75","point"],[[139.7,35.7],"Japan: about 1.2","point"]];
  s.more="Stage 5 was added to the original model, which was drawn from Europe’s history. Critics say the model may not fit every country. South Korea’s rate rose in 2024 for the first time in nine years, but only a little."});
 ins("hg2b","Stages 4 and 5: low and shrinking",Object.assign(at(79,22,40),{title:"Still growing, below replacement",sub:"fert",hi:["in"],
  pins:[[[78,23],"India: about 2 children per woman","point"]],
  stat:"Indian women now have about two children each, below replacement, yet India is expected to grow to about 1.7 billion",
  body:"India’s fertility fell below the replacement level of 2.1 around 2020. But the many children born when families were bigger are now reaching the age to have their own. Even with small families, so many parents means many births: this is population momentum, growth carried on by a young age structure.",
  more:"UN projections have India peaking in the early 2060s, about 250 million above today. Momentum works the other way too: Japan and South Korea will keep shrinking for decades even if birth rates rise."}));
 ins("hg2b","Population pyramids",Object.assign(at(138,36,22),{title:"The year of the Fire Horse",sub:"age",hi:["jp"],
  pins:[[[139.69,35.68],"Tokyo","point"]],
  stat:"In 1966 Japan’s births fell by about a quarter in a single year, because of a superstition",
  body:"An old belief said girls born in a hinoeuma, “fire horse”, year, which comes every 60 years, would grow up headstrong and make bad wives. In 1966 many couples avoided having a baby: births dropped from about 1.8 million to about 1.4 million, then bounced back in 1967. The dent still shows as one short bar on Japan’s population pyramid.",
  more:"2026, this year, is the next fire horse year, and demographers are watching whether it dents Japan’s already record-low births again. Culture can move the birth rate as surely as wars or policies."}));
 ins("hg2b","The year of the Fire Horse",Object.assign(at(136,36,34),{title:"Healthier, yet more deaths",sub:"life",hi:["jp"],
  pins:[[[139.7,35.7],"Japan: about 13 deaths per 1,000 people","point"]],
  stat:"Japan’s crude death rate, about 13 per 1,000, is higher than Niger’s, about 8",
  body:"Japanese people live about 20 years longer than people in Niger, so how can more of them die each year? Because the crude death rate counts deaths against the whole population, and nearly three in ten Japanese are over 65. Niger’s population is so young that few people are at the ages when most deaths happen.",
  more:"That is why the rate is called “crude”: it ignores age. To compare health, demographers use life expectancy (the colours on this map) or age-adjusted rates. A classic AP trap."}));
}
/* ───────── hg2d Population futures (rework) ───────── */
if(T("hg2d")&&!T("hg2d").steps._rvA){T("hg2d").steps._rvA=1;
 set("hg2d","Malthus and his critics",s=>{Object.assign(s,at(-1.5,52.6,16));s.pins=[[[[-1.4,52.6]],"England, 1798","area"]];
  s.body="Thomas Malthus argued that population grows geometrically (2, 4, 8, 16) while food grows only arithmetically (1, 2, 3, 4), so famine, disease and war must check growth. He wrote as England’s population was starting to grow fast.";
  s.more="England went on to feed far more people than he thought possible, through new farming, imported food and, later, smaller families. World food output has, so far, grown faster than population."});
 set("hg2d","Neo-Malthusians and Boserup",s=>{Object.assign(s,at(37.26,-1.52,16));s.pins=[[[37.26,-1.52],"Machakos, Kenya","point"]];
  s.body="Neo-Malthusians such as Paul Ehrlich (The Population Bomb, 1968) revived the warning, adding pollution, water and energy. Ester Boserup argued the opposite: population pressure pushes farmers to work land harder and invent better methods. Kenya’s Machakos district is the classic test: from the 1930s to 1990 its people grew about fivefold, yet instead of collapse, farmers built terraces, planted trees and grew more per hectare.";
  s.more="A study of Machakos was titled More People, Less Erosion. Optimists point to it and to the Green Revolution; pessimists to climate change, soil loss and falling groundwater."});
 set("hg2d","Who pays for old age?",s=>{s.more="China’s retirement age had not changed since the 1950s: 60 for men and 50 or 55 for women. From 2025 it rises slowly over 15 years, to 63 for men and 55 or 58 for women. China is old before it is rich: when Japan had China’s share of elderly today, it was several times richer per person."});
 ins("hg2d","Antinatalist policies",Object.assign(at(100.5,13.75,16),{title:"Mr Condom",hi:["th"],
  pins:[[[100.5,13.75],"Bangkok","point"]],phPins:[ph([100.49,13.74],"Bangkok","Templo Wat Arun, Bangkok, Tailandia, 2013-08-22, DD 30.jpg")],
  stat:"Thailand went from about six children per woman in the 1960s to about two by 1990, without forcing anyone",
  body:"Antinatalist means aiming for fewer births. Mechai Viravaidya made family planning fun: condom-blowing contests, condoms handed out by traffic police at New Year, and a Bangkok restaurant, Cabbages & Condoms, that gives out condoms instead of mints. With free clinics and more girls in school, births fell almost as fast as under China’s one-child rule, with no fines or force.",
  more:"Thais nicknamed condoms “mechais”. Today Thailand’s fertility is around one child per woman, and it worries about ageing instead."}));
 ins("hg2d","Pronatalist policies",Object.assign(at(26.1,45.5,16),{title:"The decree that doubled births",hi:["ro"],
  pins:[[[26.1,44.43],"Bucharest","point"]],phPins:[ph([26.09,44.43],"Bucharest: Ceaușescu’s palace","Palatul Parlamentului / Palace of the Parliament - Bucharest, Romania.jpg")],
  stat:"In 1967 Romania’s births nearly doubled in a year, after its dictator banned abortion and contraception",
  body:"Pronatalist means aiming for more births. In 1966 Nicolae Ceaușescu’s Decree 770 made abortion and birth control illegal for most women, to build a bigger nation. Births jumped from about 270,000 in 1966 to about 530,000 in 1967. Then they fell again as people found secret ways round the law.",
  more:"Thousands of women died from unsafe illegal abortions, and many unwanted children ended up in state orphanages whose conditions shocked the world after 1989. It is the starkest case of a forced pronatalist policy."}));
 ins("hg2d","The decree that doubled births",Object.assign(at(35,31.5,16),{title:"The rich country with big families",hi:["il"],
  pins:[[[34.9,31.9],"Israel: about 2.9 children per woman","point"]],
  stat:"Israeli women have about three children each, nearly twice the average of other rich countries",
  body:"In almost every rich country fertility has fallen far below 2.1. Israel is the big exception, at about 2.9. Very religious families have far more, but even secular Israeli women average around two. Culture, religion and a strong sense of family can matter as much as wealth.",
  more:"Israel also pays for IVF treatment very generously. Its case suggests that money alone does not explain low birth rates, one reason cash payments for babies elsewhere achieve so little."}));
 ins("hg2d","An ageing world",Object.assign(at(134.03,33.86,9),{title:"A village of dolls",hi:["jp"],
  pins:[[[134.03,33.86],"Nagoro, Shikoku","point"]],
  stat:"In the Japanese village of Nagoro, life-size dolls far outnumber the living",
  body:"Young people left this mountain valley for the cities, and the people who stayed grew old. Resident Tsukimi Ayano began making stuffed dolls to stand in for neighbours who had died or moved away. Hundreds now sit at bus stops, in fields and in the classrooms of the school, which closed in 2012.",
  more:"Japan has thousands of villages heading the same way. Rural depopulation is ageing’s twin: the young move out, so the places they leave age much faster than the country as a whole."}));
 ord("hg2d",["Malthus and his critics","Neo-Malthusians and Boserup","Antinatalist policies","Mr Condom","Pronatalist policies","The decree that doubled births",
  "The rich country with big families","Women and fewer births","Where girls marry young","Choosing who comes in","An ageing world","A village of dolls","Who pays for old age?"]);
}
/* ───────── hg2c Why people move ───────── */
if(T("hg2c")&&!T("hg2c").steps._rvA){T("hg2c").steps._rvA=1;
 set("hg2c","Displaced at home",s=>{s.more="IDPs often get less help than refugees: no foreign country or UN body is automatically responsible for them, and their own government may be the one attacking them."});
 set("hg2c","Forced to move",s=>{s.more="Most refugees stay in neighbouring countries: Turkey, Lebanon and Jordan took most Syrians (UNHCR, 2024). The largest forced migration in history was the Atlantic slave trade: about 12 million Africans shipped to the Americas."});
 set("hg2c","Step by step, link by link",s=>{s.more="Many of Southall’s first Punjabi migrants in the 1950s found work at a local rubber factory, then sent for brothers, cousins and neighbours from the same villages, so whole districts of Punjab were reproduced in one corner of west London."});
 set("hg2c","Ravenstein’s laws",s=>{s.more="Britain still fits: most people who move house go only a few kilometres, and London both pulls in the young and sends families back out (see the next stop)."});
 ins("hg2c","Obstacles and opportunities",Object.assign(at(-77.8,8.3,22),{title:"The jungle that emptied",
  lines:[{coords:[[-76.78,8.42],[-77.3,8.6],[-77.62,8.1],[-77.95,8.42],[-78.05,8.6]],kind:"flow"}],
  pins:[[[-76.78,8.42],"Necoclí, Colombia","point"],[[-78.05,8.6],"Panama: first camps","point"]],phPins:[ph([-77.55,8.05],"The Darién Gap","Jungle path in the Darién Gap.jpg")],
  stat:"In 2023 over half a million people walked through the roadless Darién jungle towards the US; by 2025 the flow had almost stopped",
  body:"The Darién is the one gap in the Pan-American Highway: swamp, rivers and mountains between Colombia and Panama, with no road at all. For years it was a brutal intervening obstacle (a barrier on the way) that people still crossed, from Venezuela, Haiti, Ecuador and even China. When the US and Panama tightened their borders in 2025, crossings fell by over 90%.",
  more:"Some migrants then turned round and headed south again: a counterflow in real time. A policy at the destination changed a flow thousands of kilometres away."}));
 ins("hg2c","Ravenstein’s laws",Object.assign(at(-0.4,51.6,9),{title:"Everyone leaves London",
  lines:[[-0.97,51.45],[-0.76,52.04],[0.12,52.2],[0.47,51.73],[-0.14,50.83],[-1.31,51.06]].map(b=>({coords:[[-0.13,51.51],b],kind:"flow"})),
  pins:[[[-0.13,51.51],"London","point"],[[-0.97,51.45],"Reading","point"],[[-0.76,52.04],"Milton Keynes","point"],[[-0.14,50.83],"Brighton","point"]],
  stat:"Each year around 100,000 more people move out of London to the rest of the UK than move in from it",
  body:"London still grows, from births and people arriving from abroad. But within Britain the flow runs outwards: young adults arrive in their twenties for jobs and nightlife, then leave in their thirties for space, schools and cheaper homes. Moving from a big city to smaller towns and the countryside is called counter-urbanisation.",
  more:"It is Ravenstein’s counterflow in action, and a reason to look at the parts of a migration total, not just the total. Big cities that pull in the young and push out families are sometimes called “escalator regions”."}));
 ins("hg2c","From villages to cities",Object.assign({view:[-104,27,-66,47],globe:[-85,37,2],_ff:1,card:"left"},{title:"A beetle and a train ticket",
  lines:[{coords:[[-90.5,33.5],[-89.5,37],[-87.63,41.88]],kind:"flow"},{coords:[[-86.8,33.5],[-84.5,38],[-83.05,42.33]],kind:"flow"}],
  pins:[[[-87.63,41.88],"Chicago","point"],[[-83.05,42.33],"Detroit","point"],[[[-90.4,33.3]],"Mississippi Delta","area"]],
  stat:"Between 1910 and 1970 about six million Black Americans left the South for cities in the North and West",
  body:"This is interregional migration: a move from one region of a country to another. The push factors were harsh Jim Crow segregation laws, lynching, and the boll weevil, a beetle from Mexico that ruined cotton crops across the South from the 1890s. The pull was factory jobs in Chicago, Detroit and New York, especially when the First World War cut off migrants from Europe.",
  more:"News travelled in the Chicago Defender newspaper, which Pullman railway porters carried south: chain migration on rails. Chicago’s Black population grew more than tenfold between 1910 and 1960. In Enterprise, Alabama, farmers later put up a statue to the boll weevil, because it forced them to switch to more profitable peanuts."}));
}
/* ───────── hg3a How culture spreads ───────── */
if(T("hg3a")&&!T("hg3a").steps._rvA){T("hg3a").steps._rvA=1;
 set("hg3a","A shrinking world",s=>{s.body="Time–space compression means places feel closer as travel and communication speed up. In 1850 news took months to sail from London to Sydney. Today a song can top the charts on every continent in the same week: undersea cables, shown on the map, carry it from London to Sydney in a fraction of a second. Diffusion that once took generations now takes days."});
 ins("hg3a","Stimulus diffusion",Object.assign(at(126.68,38.2,12),{title:"A wall against K-pop",
  pins:[[[125.75,39.03],"Pyongyang","point"],[[126.98,37.57],"Seoul","point"]],phPins:[ph([126.68,37.96],"Panmunjom: the DMZ","DMZ AT PANMUNJOM DPRK (NORTH KOREA)OCT 2012 (8157355503).jpg")],
  stat:"In North Korea, watching or passing on South Korean films and songs can bring years in a labour camp",
  body:"Some places put up barriers to diffusion. North Korea’s 2020 law against “reactionary ideology and culture” set harsh punishments for spreading South Korean media, because pop culture carries ideas about wealth and freedom. Yet K-dramas still leak in on USB sticks smuggled across the Chinese border.",
  more:"South Korea has used loudspeakers along the DMZ to blast K-pop and news northward, switching them off and on as relations change. Most barriers are permeable: they slow a trait down without stopping it."}));
 ins("hg3a","Global culture, local culture",Object.assign(at(3.36,6.5,14),{title:"Nollywood began with blank tapes",
  pins:[[[3.36,6.5],"Lagos","point"]],phPins:[ph([3.4,6.45],"Lagos","Lagos skyline.jpg")],
  stat:"Nigeria makes more films each year than Hollywood: by count, only India makes more",
  body:"In 1992 a Lagos trader, Kenneth Nnebue, had a stock of blank video cassettes that would not sell, so he shot a film to put on them: Living in Bondage. It sold so well that a whole industry followed, making cheap films straight to video, in Nigerian settings and languages, for Nigerian tastes.",
  more:"This is reterritorialisation: people take a foreign form of popular culture, here the feature film, and make it their own. Nollywood films now play across Africa and the diaspora."}));
}
/* ───────── hg3b Cultural landscapes (rework) ───────── */
if(T("hg3b")&&!T("hg3b").steps._rvA){T("hg3b").steps._rvA=1;
 set("hg3b","Cultural landscapes",s=>{s.phPins=(s.phPins||[]).filter(q=>!/terraces/i.test(q.label)).concat([ph([13.65,47.56],"Hallstatt: copied in China","Hallstatt - 8856135370.jpg")])});
 rm("hg3b","Terraces on the mountains");
 ins("hg3b","Folk and popular culture",Object.assign({view:[-20,5,135,62],globe:[60,35,1.3],_ff:1,card:"left"},{title:"A copy of Hallstatt",
  lines:[{coords:[[13.65,47.56],[114.29,23.17]],kind:"dash"}],
  pins:[[[114.29,23.17],"Boluo, Guangdong: the copy, 2012","point"],[[121.2,31.03],"Thames Town, Shanghai","point"]],phPins:[ph([13.65,47.56],"Hallstatt, Austria: the original","Hallstatt - 8856135370.jpg")],
  stat:"China built a full-size copy of an Austrian lakeside village, church tower and all",
  body:"Hallstatt is a tiny World Heritage village in the Alps. In 2012 a Chinese developer opened a replica of it in Guangdong, after surveyors had quietly measured the original. Shanghai’s Thames Town, with mock-Tudor houses and red phone boxes, is another copy.",
  more:"Geographers call this placelessness (Edward Relph, 1976): landscapes that could be anywhere, because they are copied rather than grown from local culture. Chain stores and identical suburbs do the same thing more quietly. The real Hallstatt now struggles with crowds of tourists."}));
 ins("hg3b","Sacred spaces",Object.assign(at(114.2,22.25,9),{title:"A hole for the dragon",
  pins:[[[114.197,22.236],"Repulse Bay","point"]],phPins:[ph([114.17,22.29],"Hong Kong","Hong Kong Night Skyline.jpg")],
  stat:"A Hong Kong apartment block has a giant square hole through its middle, said to let a dragon pass from the hills to the sea",
  body:"Feng shui, an old Chinese belief about how energy flows through land and buildings, still shapes Hong Kong. The Repulse Bay tower’s gap is widely said to keep open the dragon’s path down from the mountains. Developers and banks often bring feng shui advisers in to angle towers and place doors.",
  more:"The architects have also given practical reasons, such as light and wind, so the story is partly legend. Either way, a belief system has left a visible mark on one of the world’s most modern skylines."}));
 ins("hg3b","What we call places",Object.assign(at(-73.57,45.5,14),{title:"Stop signs that say Arrêt",
  pins:[[[-73.57,45.5],"Montreal","point"]],phPins:[ph([-71.21,46.81],"Quebec City","Chateau Frontenac at dusk in Quebec City.jpg")],
  stat:"Quebec’s stop signs say ARRÊT, even though stop signs in France say STOP",
  body:"Quebec’s Charter of the French Language (Bill 101, 1977) makes French the main language on public signs, so that a French-speaking province in an English-speaking continent still looks French. A government office checks shop signs and menus.",
  more:"In 2013 inspectors told a Montreal Italian restaurant to replace words like “pasta” on its menu with French. The row, nicknamed “Pastagate”, was so widely mocked that the office changed its approach. Language on signs is part of the cultural landscape, and governments fight over it."}));
 set("hg3b","Sense of place",s=>{s.view=[-82,28,8,62];s.globe=[-35,45,1.6];s.card="left";
  s.pins=[[[2.35,48.853],"Notre-Dame de Paris","point"],[[-74.005,40.748],"The High Line","point"]];
  s.stat="People attach feeling and identity to the places they know";
  s.body="Sense of place is the emotional bond people feel with a place. When Notre-Dame in Paris burned in April 2019, crowds sang hymns along the Seine, and pledges to rebuild it passed €800 million within days. It reopened in December 2024.";
  s.more="Placemaking is related but different: shaping public space to build that bond. New York turned a disused elevated railway into the High Line park from 2009, and closed parts of Times Square to cars."});
 set("hg3b","Gender in the landscape",s=>{s.more="Mexico City’s metro has run women-only carriages at busy times since the 1970s, and Tokyo, Delhi and Cairo have them too: a gender line drawn inside a train. Planners now also study how women use streets differently, for example avoiding poorly lit routes at night."});
 set("hg3b","Culture that unites and divides",s=>{s.title="Belfast’s peace walls";s.stat="Walls built as temporary barriers still split some Belfast streets";
  s.body="In Belfast, murals and kerbstones painted in flag colours mark Catholic nationalist and Protestant unionist streets. Nearly 100 walls, fences and gates, some taller than a house, still separate neighbourhoods: the landscape itself records the division.";
  s.more="Most went up during the Troubles, from 1969, as “temporary” barriers, and few have come down. Religion and national identity act here as a centrifugal force, one that pulls a society apart."});
 ord("hg3b",["Folk and popular culture","A copy of Hallstatt","Two ways of judging","Sacred spaces","A hole for the dragon","Layers of history","What we call places",
  "Stop signs that say Arrêt","Sense of place","Ethnic neighbourhoods","Gender in the landscape","Belfast’s peace walls"]);
}
/* ───────── hg3c Religion, language and change (rework) ───────── */
if(T("hg3c")&&!T("hg3c").steps._rvA){T("hg3c").steps._rvA=1;
 const eth=st("hg3c","Ethnic religions");
 set("hg3c","Universalising religions",s=>{s.title="Two kinds of faith";s.sub="rel";
  s.pins=[[[35.2,31.8],"Jerusalem","point"],[[39.8,21.4],"Mecca","point"],[[83.3,27.5],"Lumbini: birthplace of the Buddha","point"],[[83,25.3],"Varanasi: Hinduism’s holiest city","point"]];
  if(eth&&eth.phPins)s.phPins=eth.phPins.slice();
  s.stat="Some faiths seek converts everywhere; others belong to one people";
  s.body="Universalising religions, such as Christianity (about 2.4 billion followers) and Islam (about 2 billion), offer their message to all and spread by conversion. Ethnic religions, such as Hinduism, Shinto and Judaism, are tied to one people and homeland and spread mainly when believers migrate: Indian workers carried Hinduism to Mauritius, Fiji and Trinidad in the 1800s.";
  s.more="Buddhism, a universalising faith, began in northern India but almost vanished from its hearth; it lives on mostly in East and Southeast Asia."});
 rm("hg3c","Ethnic religions");
 set("hg3c","Sikhism",s=>{s.title="Sikhism goes abroad";s.gfRuler={a:[74.88,31.62],b:[-79.76,43.73]};
  s.stat="About a quarter of the people of Brampton, near Toronto, are Sikh";
  s.body="Guru Nanak founded Sikhism in Punjab around 1500, and most of its roughly 25 million followers still live there. From the 1960s chain migration, each family following relatives, carried it to Canada and Britain. In Canada’s 2021 census about a quarter of Brampton’s 650,000 people were Sikh: drag the ruler, Amritsar is over 11,000 km away.";
  s.more="Gurdwaras, Sikh temples with free community kitchens, now mark the landscape of Brampton and of Southall in west London. Sikhism welcomes anyone, but it has spread mostly with Punjabi migrants."});
 ins("hg3c","Two kinds of faith",Object.assign(at(8,9.3,26),{title:"Where Islam meets Christianity",sub:"rel",
  pins:[[[8.52,12.0],"Kano: mostly Muslim north","point"],[[8.89,9.9],"Jos: the meeting zone","point"],[[7.5,6.4],"Mostly Christian south","point"]],
  stat:"Nigeria is split almost in half: a mostly Muslim north and a mostly Christian south",
  body:"Islam came to northern Nigeria across the Sahara with camel caravans, from about the 11th century. The forest and tsetse-fly belt to the south, deadly to horses and camels, held it back, so Christianity arrived there later, by sea, with missionaries in the 1800s. The meeting zone, the Middle Belt around Jos, is an interfaith boundary.",
  more:"Since 1999–2001, twelve northern states have added Islamic (sharia) criminal law. The Middle Belt has seen deadly clashes, which are also about land between farmers and herders, not religion alone."}));
 ins("hg3c","Other language families",Object.assign(at(8.6,51.3,13),{title:"Maken or machen",sub:"lang",
  lines:[{coords:[[5.95,50.85],[6.5,51.0],[6.88,51.16],[7.7,51.1],[8.6,51.2],[9.6,51.35],[10.8,51.6],[11.9,51.9]],kind:"dash"}],
  pins:[[[6.88,51.16],"Benrath","point"],[[[9.5,52.6]],"North: maken (Low German)","area"],[[[9.5,50.2]],"South: machen (High German)","area"]],
  stat:"A line through one Düsseldorf suburb divides Germans who say “maken” from those who say “machen”",
  body:"A dialect is a regional form of a language; an isogloss is a line on a map between places that say a word or sound differently. The Benrath line (dashed), crossing the Rhine at Benrath, separates Low German in the north (maken, “to make”) from High German in the south (machen), a sound shift that spread north from the Alps over 1,200 years ago and stopped here.",
  more:"English sits on the Low German side of the family: we say “make”, not “mache”. In the United States a similar line divides people who say “soda” from those who say “pop”."}));
 ins("hg3c","Maken or machen",Object.assign(at(74.57,30,34),{title:"One language, two scripts",
  pins:[[[74.35,31.55],"Lahore","point"],[[74.87,31.63],"Amritsar","point"]],phPins:[ph([74.57,31.6],"Wagah: the India–Pakistan border","Lowering of the flags at the Wagah border.jpg")],
  stat:"Hindi and Urdu speakers understand each other in conversation but cannot read each other’s writing",
  body:"Everyday Hindi and Urdu are close to one spoken language, Hindustani: Bollywood films are understood on both sides of the border. Hindi is written in Devanagari script and borrows learned words from Sanskrit; Urdu uses a Perso-Arabic script, written right to left, and borrows from Persian and Arabic. Religion and the Partition of 1947 pulled them apart.",
  more:"Urdu is Pakistan’s national language, yet only a small minority of Pakistanis speak it as a first language. Serbian and Croatian drew apart in a similar way after Yugoslavia broke up."}));
 set("hg3c","Multiculturalism",s=>{s.more="Canada adopted the policy in 1971, after groups such as Ukrainian Canadians argued that a country described only as English and French left them out. Its points system for migrants, from 1967, scores skills rather than origin, so newcomers come from every continent: that is why Toronto is so mixed."});
 ord("hg3c",["Two kinds of faith","Where Islam meets Christianity","Sikhism goes abroad","Indo-European languages","Other language families","Maken or machen","One language, two scripts",
  "Lingua franca","Pidgins and creoles","Acculturation and assimilation","Syncretism","Multiculturalism"]);
}
/* ───────── hg4a States, nations and boundaries ───────── */
if(T("hg4a")&&!T("hg4a").steps._rvA){T("hg4a").steps._rvA=1;
 set("hg4a","Superimposed boundaries",s=>{s.body="Superimposed boundaries were imposed by outsiders. At the Berlin Conference of 1884–85 European powers set rules for claiming Africa; most of the actual lines were drawn over the next 30 years in deals between the colonial powers, many by officials who had never seen the land. Many lines cut across ethnic groups or joined rivals: the Somali people ended up in Somalia, Ethiopia, Kenya and Djibouti."});
 set("hg4a","Subsequent boundaries",s=>{s.more="A subsequent line drawn to match cultural differences is called consequent. Over 10 million people crossed the new borders at Partition, one of history’s largest migrations; estimates of the dead range from about 200,000 to 2 million."});
 ins("hg4a","Multistate nations",Object.assign({view:[14,33,44,50],globe:[30,40,2.4],_ff:1,card:"left"},{title:"Swapped by religion",hi:["gr","tr"],
  lines:[{coords:[[34.83,38.64],[30,38.6],[23.65,37.94]],kind:"flow"},{coords:[[24.9,35.3],[26.5,37],[27.14,38.42]],kind:"flow"}],
  pins:[[[23.65,37.94],"Athens","point"],[[24.9,35.3],"Crete: Greek-speaking Muslims left","point"]],phPins:[ph([34.83,38.64],"Cappadocia: Turkish-speaking Christians left","Cappadocia Aerial View Landscape.jpg")],
  stat:"In 1923 about 1.6 million people were forced to swap countries, sorted by religion, not language",
  body:"To make more uniform nation-states, Greece and Turkey agreed in 1923 to exchange populations: about 1.2 million Orthodox Christians left Turkey, and about 400,000 Muslims left Greece. Faith decided who went, so Turkish-speaking Christians from Cappadocia were sent to Greece, and Greek-speaking Muslims from Crete to Turkey.",
  more:"It shows how hard it is to make a state and a nation match. Some Cappadocian villages still stand half empty, with Greek inscriptions on their churches."}));
 ins("hg4a","Geometric boundaries",Object.assign(at(7.71,45.94,9),{title:"The border that melted",hi:["it","ch"],
  pins:[[[7.71,45.94],"Testa Grigia: the hut","point"]],phPins:[ph([7.66,45.98],"The Matterhorn","Matterhorn, March 2019 (01).jpg")],
  stat:"Melting glaciers moved the Italy–Switzerland border near the Matterhorn, and a mountain hut changed countries",
  body:"Physical boundaries follow a feature of nature, such as a river or a mountain crest. Much of the Alpine border follows the watershed, the line where meltwater divides between flowing to Italy or to Switzerland. As the Theodul Glacier shrank, that line shifted, so in 2023 the two countries agreed to redraw it, leaving most of the Rifugio Guide del Cervino hut in Switzerland.",
  more:"When nature moves, a physical border can move too. Italy and Austria have a “moving border” agreement for the same reason."}));
 ins("hg4a","The border that melted",Object.assign(at(47,19,24),{title:"A frontier, not a line",hi:["sa","ye"],
  pins:[[[47.12,17.47],"Sharurah","point"]],phPins:[ph([50,20],"The Empty Quarter","Rub al Khali 002.JPG")],
  stat:"Until 2000, no agreed border ran through much of the Empty Quarter",
  body:"A boundary is a line; a frontier is a zone where no state has full control and no line is fixed. In the empty sands between Saudi Arabia and Yemen few people lived and nothing seemed worth dividing, so for decades the border stayed undefined. Only the Treaty of Jeddah in 2000 drew a line.",
  more:"Frontiers have almost vanished: oil, seabed minerals and satellites have given states reasons and means to claim every last piece. Antarctica, where claims are frozen by treaty, is the biggest frontier left."}));
}
/* ───────── hg4b Forces that bind and divide (rework) ───────── */
if(T("hg4b")&&!T("hg4b").steps._rvA){T("hg4b").steps._rvA=1;
 const ter=st("hg4b","Terrorism and separatism");
 set("hg4b","Separatist movements",s=>{s.title="Separatism, by ballot or by bomb";
  s.pins=[[[-71.21,46.81],"Quebec","point"],[[2.17,41.39],"Catalonia","point"],[[-1.98,43.32],"Basque Country","point"]];
  if(ter&&ter.phPins)s.phPins=ter.phPins.slice();
  s.stat="Some regions want not more power, but their own state";
  s.body="Separatism is a push by a region or cultural group to leave a state. French-speaking Quebec voted narrowly to stay in Canada in 1995, by about 50.6% to 49.4%; Catalonia held a 2017 vote that Spain’s courts ruled illegal. In the Basque Country the group ETA chose violence instead, killing over 800 people before it dissolved in 2018.";
  s.more="Spain had already granted the Basque Country wide autonomy, including collecting its own taxes: autonomy can drain a separatist movement of support."});
 rm("hg4b","Terrorism and separatism");
 set("hg4b","Autonomous regions",s=>{s.more="Autonomy can be a compromise that keeps a restless region inside the state, but it lasts only as long as the centre allows. Since the 2020 National Security Law, Beijing has sharply narrowed Hong Kong’s separate freedoms, and many argue “two systems” now exists mostly in name."});
 ins("hg4b","Centripetal forces",Object.assign(at(113,-3,50),{title:"A language nobody’s mother spoke",hi:["id"],
  pins:[[[[110,-7.3]],"Java: Javanese speakers","area"]],phPins:[ph([106.84,-6.18],"Jakarta","Jakarta Panorama.jpg")],
  stat:"Indonesia chose as its national language one that few Indonesians spoke at home",
  body:"About 40% of Indonesians are Javanese, but in the 1928 Youth Pledge nationalists chose Malay, a trading language of the ports, and named it Bahasa Indonesia. Because it belonged to no big group, nobody’s rivals “won”, and it became a strong centripetal force, one that pulls a state together, across about 17,000 islands.",
  more:"Javanese also has elaborate levels of politeness that would have carried old ranks into the new nation. Today almost all Indonesians speak Indonesian, most as a second language."}));
 ins("hg4b","Centrifugal forces",Object.assign(at(80.5,8,14),{title:"Sinhala Only",hi:["lk"],
  pins:[[[80.01,9.66],"Jaffna: Tamil north","point"],[[79.86,6.93],"Colombo","point"]],
  stat:"One language law in 1956 helped set off a civil war that lasted 26 years",
  body:"Sri Lanka’s Sinhala Only Act made the majority’s language the sole official one, shutting many Tamil speakers out of government jobs and universities. Tamil anger grew into ethnonationalism, the demand for a state for one ethnic group, here a Tamil homeland in the north and east, and war from 1983 to 2009.",
  more:"Compare Indonesia: one state chose a neutral language and held together; the other chose the majority’s language and split apart. Tamil was made an official language too, in 1987."}));
 ins("hg4b","Sinhala Only",Object.assign(at(7.4,46.8,9),{title:"The rösti ditch",hi:["ch"],
  lines:[{coords:[[7.25,47.45],[7.24,47.14],[7.12,46.93],[7.16,46.8],[7.25,46.6],[7.45,46.37],[7.6,46.28],[7.75,46.05]],kind:"dash"}],
  pins:[[[7.15,46.8],"Fribourg: bilingual","point"],[[[8.3,47.1]],"German-speaking","area"],[[[6.65,46.6]],"French-speaking","area"]],
  stat:"Switzerland has four national languages, and its votes split along a line named after a potato dish",
  body:"The Röstigraben, the “rösti ditch” (dashed), is the language line between German- and French-speaking Switzerland, and it shows up in votes: in 1992 French speakers voted to join the European Economic Area, while most German speakers voted no. Yet Switzerland holds together through strong cantons, frequent referendums and a shared civic identity.",
  more:"Fribourg and Biel/Bienne sit right on the line and are officially bilingual. Switzerland shows that a shared language is not the only centripetal force: loyalty to shared institutions can do the job."}));
 ins("hg4b","Unitary and federal states",Object.assign(at(8,9,20),{title:"From 3 regions to 36 states",sub:"fed",hi:["ng"],
  pins:[[[7.5,6.45],"Enugu: Biafra’s first capital","point"],[[7.49,9.06],"Abuja","point"]],
  stat:"Nigeria began with 3 regions; it now has 36 states",
  body:"At independence in 1960 Nigeria had three huge regions, each dominated by one big group. In 1967 the east declared itself Biafra, setting off a war in which perhaps a million people died. Since then Nigeria has kept carving out new states, so that no single region is big enough to break away.",
  more:"Splitting regions is a federal tool against centrifugal forces, though every new state also needs new money and offices."}));
 ord("hg4b",["Centripetal forces","A language nobody’s mother spoke","Centrifugal forces","Sinhala Only","The rösti ditch","Size and distance from the capital","Unitary and federal states",
  "From 3 regions to 36 states","Devolution","Autonomous regions","Separatism, by ballot or by bomb","Irredentism","Balkanisation","Failed states"]);
}
/* ───────── hg4c Empires, power and unions (rework) ───────── */
if(T("hg4c")&&!T("hg4c").steps._rvA){T("hg4c").steps._rvA=1;
 rm("hg4c","The United Nations");
 set("hg4c","Bigger than states",s=>{s.more="Members give up some sovereignty for trade and influence; Brexit, in 2020, showed the pull can reverse. The United Nations is different: an intergovernmental body, where states work together but no shared law overrides theirs."});
 set("hg4c","Choke points",s=>{s.body="A choke point is a narrow passage that is easy to block: the shipping lanes on the map all squeeze through a few of them. About a fifth of the world’s oil passes through the Strait of Hormuz. When Houthi forces in Yemen attacked ships near Bab-el-Mandeb in 2023–24, many lines sent their ships round Africa instead, adding about 10 days to Asia–Europe voyages."});
 set("hg4c","The Arctic Council",s=>{s.more="It works by consensus. After Russia invaded Ukraine in 2022, the other seven paused cooperation with Russia, showing how a club built on agreement stalls when one member breaks the rules."});
 set("hg4c","Neocolonialism",s=>{s.more="In 2019 France and eight West African states agreed to reform their CFA franc, ending the rule that half its reserves be held in Paris. Supporters of the currency say it brings stable prices; critics say it ties the region’s money to decisions made in Europe."});
 ins("hg4c","Neocolonialism",Object.assign(at(33,-10,26),{title:"China’s railway to the copper belt",hi:["tz","zm"],
  lines:[{coords:[[28.68,-14.97],[31.2,-11.0],[33.46,-8.9],[36.6,-7.8],[39.28,-6.82]],kind:"flow"}],
  pins:[[[28.68,-14.97],"Kapiri Mposhi: copper belt","point"],[[39.28,-6.82],"Dar es Salaam","point"]],
  stat:"Fifty years before the Belt and Road, China built a 1,860 km railway across East Africa",
  body:"Colonial railways ran from mines to the nearest colonial port, so Zambia’s copper had to leave through white-ruled Rhodesia and South Africa. When Western lenders declined to help, China built the TAZARA railway from 1970 to 1975, linking Zambia’s copper belt to Dar es Salaam, with tens of thousands of Chinese workers.",
  more:"It was then China’s largest foreign aid project. The debate over whether Chinese investment in Africa is partnership or a new neocolonialism goes back to this line."}));
 ins("hg4c","China’s railway to the copper belt",Object.assign({view:[10,22,140,72],globe:[70,50,1.3],_ff:1,card:"left"},{title:"The heartland",
  pins:[[[[75,55]],"The Heartland","area"],[[[100,25]],"Rimland","area"],[[[45,33]],"Rimland","area"]],phPins:[ph([71.4,51.2],"The Kazakh steppe","Astana-steppe-7748.jpg")],
  stat:"In 1904 a British geographer said whoever controlled the middle of Eurasia could rule the world",
  body:"Halford Mackinder argued that railways would let a land power in Eurasia’s interior, the “pivot” or Heartland, move armies and resources out of reach of sea powers like Britain. His later summary: “Who rules East Europe commands the Heartland; who rules the Heartland commands the World-Island; who rules the World-Island commands the World.”",
  more:"Nicholas Spykman replied that the Rimland, the coastal belt around Eurasia, mattered more. Both ideas shaped Cold War thinking about containing the Soviet Union."}));
 ins("hg4c","Bigger than states",Object.assign(at(5.2,50.6,12),{title:"The footballer who changed Europe",
  lines:[{coords:[[5.57,50.63],[2.38,51.03]],kind:"dash"}],pins:[[[5.57,50.63],"Liège","point"],[[2.38,51.03],"Dunkerque","point"]],
  stat:"One Belgian footballer’s court case is why Europe’s top clubs are full of foreign players",
  body:"In 1990 Jean-Marc Bosman’s contract with RFC Liège ended, but the club blocked his move to Dunkerque, in France. In 1995 the EU’s Court of Justice ruled for him: workers in the EU, footballers included, must be free to move, so clubs could no longer hold players at the end of contracts or cap the number of EU foreigners.",
  more:"Within years, top English, Spanish and Italian teams fielded mostly foreign players. A supranational court, one above the member states, overrode national football rules: sovereignty pooled, in a form fans feel every weekend."}));
 ord("hg4c",["Colonialism and imperialism","The end of empires","Neocolonialism","China’s railway to the copper belt","The heartland","Shatterbelts","Choke points",
  "Bigger than states","The footballer who changed Europe","Military alliances","Regional unions","The Arctic Council"]);
}
/* ───────── hg4d Lines on land, sea and ballot ───────── */
if(T("hg4d")&&!T("hg4d").steps._rvA){T("hg4d").steps._rvA=1;
 set("hg4d","Drawing the voting map",s=>{s.pins=[[[-70.95,42.55],"Essex County, 1812: the first gerrymander","point"]];
  s.body="Gerrymandering is drawing districts to favour one party. The word comes from Massachusetts governor Elbridge Gerry, whose party drew a district north of Boston in 1812 so twisted that a newspaper drew it as a salamander: the “Gerry-mander”. Packing crowds the other side’s voters into a few districts they win hugely; cracking spreads them thinly so they lose everywhere."});
 ins("hg4d","Exclusive economic zones",Object.assign(at(136.08,20.42,16),{title:"Concrete on two rocks",
  lines:[{circle:[136.08,20.42],km:370,kind:"circle"}],gfRuler:{a:[136.08,20.42],b:[139.62,20.42]},pins:[[[136.08,20.42],"Okinotorishima","point"]],
  stat:"Japan has spent hundreds of millions of dollars encasing two tiny rocks in concrete",
  body:"Under the Law of the Sea, an island earns a 200-nautical-mile EEZ (the circle; drag the ruler, about 370 km), but “rocks which cannot sustain human habitation” do not. Okinotorishima’s two rocks, each about the size of a small room at high tide, would give Japan about 400,000 km² of sea, more than Japan’s whole land area, so Japan has armoured them against erosion and calls them islands.",
  more:"China and South Korea say they are only rocks. The difference between a rock and an island can be worth fish, oil and seabed minerals across an area the size of a country."}));
 ins("hg4d","Redistricting",Object.assign(at(-119,36.3,16),{title:"Six million votes, one senator",
  pins:[[[-118.24,34.05],"Los Angeles County: about 6 million people","point"],[[-118.0,37.2],"Alpine, Inyo and Mono counties: about 15,000","point"]],
  stat:"Until 1965, Los Angeles County’s 6 million people had one state senator, the same as a mountain district of about 15,000",
  body:"Malapportionment means districts with very unequal populations. Many US states drew state senate seats by county, not by population, giving rural voters far more weight. In Reynolds v. Sims (1964) the Supreme Court ruled that districts must hold roughly equal numbers of people: “one person, one vote”.",
  more:"The US Senate is the big exception the Constitution protects: Wyoming and California both get two senators, though California has nearly 70 times as many people."}));
 ins("hg4d","Drawing the voting map",Object.assign(at(-79.9,35.7,9),{title:"The I-85 district",
  lines:[{coords:[[-78.9,35.99],[-79.4,36.07],[-79.79,36.07],[-80.0,35.96],[-80.25,35.82],[-80.47,35.67],[-80.6,35.4],[-80.84,35.23]],kind:"dash"}],
  pins:[[[-78.9,35.99],"Durham","point"],[[-79.79,36.07],"Greensboro","point"],[[-80.84,35.23],"Charlotte","point"]],
  stat:"One North Carolina district was in places no wider than the highway it followed",
  body:"In 1992 North Carolina drew its 12th district as a thin snake about 260 km along Interstate 85 (dashed), linking Black neighbourhoods from Durham to Charlotte so that Black voters would form a majority. In Shaw v. Reno (1993) the Supreme Court said shapes drawn mainly by race could be unconstitutional.",
  more:"A state politician joked that if you drove down I-85 with both car doors open, you would hit most of the voters in the district. Majority-minority districts are meant to help minorities elect their own candidates, but they also pack those voters together."}));
}
/* ───────── hg5a How the world farms ───────── */
if(T("hg5a")&&!T("hg5a").steps._rvA){T("hg5a").steps._rvA=1;
 ins("hg5a","Mixed crop and livestock",Object.assign({view:[-118,27,-86,52],globe:[-100,40,2],_ff:1,card:"left"},{title:"Following the wheat north",sub:"farm",
  lines:[{coords:[[-99.3,34.15],[-97.88,36.4],[-100.02,37.75],[-98.39,40.59],[-100.35,44.37],[-101.3,48.23],[-101.5,49]],kind:"flow"}],
  pins:[[[-99.3,34.15],"Texas: harvest in May","point"],[[-100.02,37.75],"Kansas: June","point"],[[-101.3,48.23],"North Dakota: August","point"]],
  phPins:[ph([-95.5,39.6],"Kansas: wheat harvest","Combine harvesting wheat.jpg")],
  stat:"Teams of combine harvesters start in Texas in May and work their way north to the Canadian border by late summer",
  body:"Commercial grain farming means growing grain on huge farms to sell, and it covers the dry Great Plains. Wheat ripens later the further north you go, so “custom cutters” own the expensive combines and follow the harvest north (the line), hiring out their machines farm by farm.",
  more:"One combine can cost as much as a house, so keeping it busy all season makes sense: economies of scale on wheels. Kansas alone grows more wheat in a good year than many countries."}));
 ins("hg5a","Pastoral nomadism",Object.assign(at(9.41,47.33,9),{title:"Cows go up the mountain",
  pins:[[[9.41,47.33],"Appenzell","point"]],phPins:[ph([8.0,46.55],"Alpine summer pastures","BerneseAlps.JPG")],
  stat:"Every summer Alpine farmers walk their cows up to mountain pastures, and in autumn parade them home wearing flowers",
  body:"Transhumance is moving herds between seasonal pastures: up to high meadows when the snow melts, down to valley farms for winter. Unlike nomads, the farmers keep a fixed home. Milk from the high pastures became famous mountain cheeses such as Gruyère and Appenzeller.",
  more:"Switzerland’s alpine pasture season is on UNESCO’s list of living heritage. The same up-and-down rhythm drives herders in the Pyrenees, the Zagros and the Himalaya."}));
 ins("hg5a","Plantations",Object.assign(at(-72.94,-41.47,16),{title:"Salmon farms at the bottom of the world",
  pins:[[[-72.94,-41.47],"Puerto Montt","point"],[[[-73.4,-43]],"Fjords full of fish pens","area"]],
  stat:"Chile is the world’s second-biggest salmon producer, yet no salmon is native to it",
  body:"Aquaculture is farming fish and shellfish. Southern Chile’s cold, sheltered fjords suit salmon pens, so from the 1980s companies brought in Atlantic and Pacific salmon eggs, and the sounds around Puerto Montt filled with cages. Only Norway farms more.",
  more:"In 2007 a virus tore through the crowded pens and wiped out much of the industry, a warning about one-species farming at sea. Over half of the fish people eat is now farmed."}));
}
/* ───────── hg5b Models of rural land ───────── */
if(T("hg5b")&&!T("hg5b").steps._rvA){T("hg5b").steps._rvA=1;
 ins("hg5b","Township and range",Object.assign(at(-100.87,37.97,9),{title:"Circles in squares",
  pins:[[[-100.87,37.97],"Garden City, Kansas","point"]],phPins:[ph([-101.3,37.7],"Centre-pivot circles","Centre-pivot irrigation circles from the air.jpg")],
  stat:"From the air, the Great Plains look like green circles packed into squares",
  body:"Centre-pivot irrigation, invented in the US in the 1940s, is a sprinkler arm about 400 m long turning around a well. Its circle fits neatly inside a quarter section, half a mile square, of the 1785 survey grid, so the plains show round fields in square boxes, with dry corners left over.",
  more:"The pivots draw on the Ogallala aquifer, which is being drained far faster than rain refills it. Saudi Arabia’s desert has the same green circles, fed by ancient groundwater."}));
 ins("hg5b","Long lots",Object.assign(at(80.95,26.85,16),{title:"Split between sons",
  pins:[[[[80.95,26.85]],"Uttar Pradesh: tiny plots","area"]],
  stat:"The average Indian farm is only about one hectare, and it shrinks with each generation",
  body:"Under partible inheritance, land is divided among all the heirs, so each generation’s plots get smaller. Most Indian farms are now too small to justify a tractor or feed a family, which is one reason so many farmers also work in cities. France had the same problem and spent decades merging scattered strips into larger fields (remembrement).",
  more:"England’s tradition of one heir taking all, primogeniture, kept estates big, which helped enclosure and the second agricultural revolution."}));
}
/* ───────── hg5c Food in a global system (rework) ───────── */
if(T("hg5c")&&!T("hg5c").steps._rvA){T("hg5c").steps._rvA=1;
 set("hg5c","Feeding eight billion",s=>{s.pins=[[[30,15],"Sudan: war and hunger","point"],[[48,15.5],"Yemen: war and hunger","point"],[[-8,53.2],"Ireland, 1845–52","point"]];
  s.more="The map shows the share of people in extreme poverty: hunger is worst where poverty and conflict meet. History says the same: in Ireland’s famine of 1845–52 about a million people died while the country still exported grain and cattle to Britain. Hunger is about who can get food, not just how much exists."});
 ins("hg5c","Bigger farms, fewer farmers",Object.assign(at(-93.6,42,16),{title:"Corn that fuels cars",sub:"export",
  pins:[[[[-93.6,42]],"Iowa: maize","area"],[[-93.62,42.03],"Ames","point"]],phPins:[ph([-93.2,41.8],"Iowa farmland","Iowa farm.jpg")],
  stat:"About a third of the US maize crop is made into fuel, not food",
  body:"Since US laws of 2005 and 2007 required ethanol, an alcohol fuel, in petrol, Corn Belt farmers have sold over a third of their maize to ethanol plants. Land that grows fuel cannot grow food, so biofuels push up grain prices; they were blamed in part for the 2007–08 food price spike.",
  more:"Supporters say ethanol cuts oil imports and helps farm towns; studies disagree on whether it saves carbon once the land it uses is counted."}));
 ins("hg5c","From farm to supermarket",Object.assign({view:[-22,-14,62,64],globe:[20,25,1.6],_ff:1,card:"left"},{title:"Roses from the equator",sub:"export",
  lines:[{coords:[[36.43,-0.72],[36.93,-1.32],[33,12],[25,30],[12,45],[4.75,52.27]],kind:"flow"}],
  pins:[[[36.43,-0.72],"Lake Naivasha: rose farms","point"],[[4.75,52.27],"Aalsmeer flower auction","point"]],
  stat:"A rose flown from Kenya to Europe can have a smaller carbon footprint than one grown in the Netherlands",
  body:"Kenya’s highlands sit on the equator but high up: steady sun and cool nights all year, ideal for roses. Growers around Lake Naivasha cut them, chill them and fly them overnight to Europe, many through the giant flower auction at Aalsmeer. A 2007 Cranfield University study found that Dutch roses, grown in heated greenhouses, gave off several times more carbon.",
  more:"The farms draw on the lake for water, and Naivasha’s level and wildlife have suffered. “Food miles” alone do not tell you a product’s footprint."}));
 ins("hg5c","Value-added crops",Object.assign(at(47,-19,24),{title:"Half an island for rent",sub:"export",hi:["mg"],
  pins:[[[47.51,-18.88],"Antananarivo","point"]],phPins:[ph([47.52,-18.91],"Antananarivo","Antananarivo city heights.jpg")],
  stat:"In 2008 a Korean firm planned to lease about half of Madagascar’s farmland for 99 years",
  body:"After food prices soared in 2008, governments and companies began buying or leasing farmland abroad to secure their own food. Daewoo Logistics agreed terms for about 1.3 million hectares to grow maize and palm oil for South Korea. When the plan leaked, protests helped topple Madagascar’s president in 2009, and the deal was scrapped.",
  more:"Critics call such deals land grabs; investors call them development. Gulf states and Chinese firms have leased land in Ethiopia, Sudan and Southeast Asia."}));
 ord("hg5c",["The Green Revolution","The costs of the Green Revolution","Bigger farms, fewer farmers","Corn that fuels cars","From farm to supermarket","Roses from the equator",
  "Living off exports","Fair trade","Value-added crops","Half an island for rent","Women who farm","Feeding eight billion"]);
}
/* ───────── hg5d Farming and the planet ───────── */
if(T("hg5d")&&!T("hg5d").steps._rvA){T("hg5d").steps._rvA=1;
 set("hg5d","Terraces on the slopes",s=>{s.more="Each terrace is a step that slows runoff, so rain soaks in instead of tearing soil downhill. The Ifugao share water through channels fed by forests kept on the summits: the forest, the channels and the steps work as one system."});
 set("hg5d","Spreading deserts",s=>{s.more="When rains returned in the 1990s, much of the Sahel greened again, so drought did more of the damage than people once thought. Drag the ruler: the belt from Senegal to Djibouti is about 6,500 km."});
 ins("hg5d","Spreading deserts",Object.assign({view:[-114,28,-70,48],globe:[-92,38,2],_ff:1,card:"left"},{title:"The Dust Bowl",
  lines:[{coords:[[-102.51,36.73],[-95,37.8],[-87,38.8],[-77.04,38.9]],kind:"flow"}],
  pins:[[[[-102,36.5]],"The southern Plains","area"],[[-102.51,36.73],"Boise City, Oklahoma","point"],[[-77.04,38.9],"Washington, D.C.","point"]],
  stat:"In 1934–35, dust blown from the southern Plains fell on Washington, D.C., and on ships far out in the Atlantic",
  body:"In the 1910s and 1920s, high wheat prices and tractors led farmers to plough up millions of hectares of prairie grass, whose roots had held the soil. When drought came in the 1930s, the bare soil blew away in “black blizzards”. On Black Sunday, 14 April 1935, a wall of dust turned day into night.",
  more:"In response the US created the Soil Conservation Service and planted over 200 million trees as windbreaks. It is the textbook case of soil erosion caused by the way land was farmed."}));
 ins("hg5d","Dead zones",Object.assign({view:[-132,24,-72,52],globe:[-102,38,1.8],_ff:1,card:"left"},{title:"Bees on lorries",
  lines:[[-100.5,47],[-81.5,28.5],[-97,31.5],[-89.5,44.5]].map(a=>({coords:[a,[-120.99,37.64]],kind:"flow"})),
  pins:[[[-120.99,37.64],"Central Valley almonds","point"],[[-100.5,47],"North Dakota beekeepers","point"],[[-81.5,28.5],"Florida","point"]],
  stat:"Each February, most of America’s commercial honeybees are trucked to California to pollinate almonds",
  body:"California’s Central Valley grows about 80% of the world’s almonds, in a monoculture, one crop over a vast area, so big that local wild insects cannot pollinate it all. Beekeepers rent out around two million hives, driven in from across the country, then truck them on to other crops.",
  more:"Stress, disease and pesticides kill a large share of US hives each year. Almonds are also thirsty, and in a drought-prone state that is another cost of the monoculture."}));
}
/* ───────── hg6a A world of cities ───────── */
if(T("hg6a")&&!T("hg6a").steps._rvA){T("hg6a").steps._rvA=1;
 set("hg6a","Site and situation",s=>{s.title="Where the ships stopped";s.view=[-92,29,-70,43];s.globe=[-80,36,2.6];s.card="left";s.phPins=[];
  s.lines=[{coords:[[-74.76,40.22],[-75.16,39.95],[-76.61,39.29],[-77.07,38.91],[-77.46,38.3],[-77.44,37.54],[-77.4,37.23],[-78.64,35.78],[-81.03,34.0],[-81.97,33.47],[-83.63,32.84],[-84.99,32.46]],kind:"dash"}];
  s.pins=[[[-74.76,40.22],"Trenton","point"],[[-77.07,38.91],"Georgetown, Washington","point"],[[-77.44,37.54],"Richmond","point"],[[-81.03,34.0],"Columbia","point"],[[-81.97,33.47],"Augusta","point"]];
  s.stat="A line of US cities sits where rivers tumble off the hills";
  s.body="Along the US East Coast the Fall Line (dashed) marks where hard upland rock meets the soft coastal plain, and rivers drop in rapids. Ships could sail no further upstream, and the falls could turn mill wheels, so Trenton, Richmond, Columbia, Augusta and Georgetown in Washington grew right on the line.";
  s.more="That is site and situation at once. Site is the ground a city stands on (rapids, water power); situation is its position among other places (the head of navigation, where goods switched from ships to wagons)."});
 ins("hg6a","Transport shapes cities",Object.assign({view:[-104,33,-70,49],globe:[-88,41,2.2],_ff:1,card:"left"},{title:"The railway city",
  lines:[[-74,40.7],[-95.9,41.26],[-93.27,44.98],[-90.2,38.63],[-84.5,39.1]].map(a=>({coords:[a,[-87.63,41.88]],kind:"flow"})),
  pins:[[[-90.2,38.63],"St Louis: river city","point"]],phPins:[ph([-87.63,41.88],"Chicago","Sears Tower, Wacker Drive and Jackson Boulevard, Chicago, IL - 54189600901.jpg")],
  stat:"Chicago grew from about 350 people in 1833 to over a million by 1890",
  body:"John Borchert (1967) divided American city growth into epochs set by transport: sail and wagon, then the steam railway, then steel rails and electricity, then cars and planes, and later high tech. Chicago won the railway epoch: lines from the East met here at the tip of Lake Michigan, and grain, cattle and timber from the West funnelled through.",
  more:"River towns that ruled the steamboat era, like St Louis, fell behind. In the car and air epoch, Sun Belt cities like Phoenix and Atlanta boomed."}));
 ins("hg6a","Megacities",Object.assign(at(-81.3,28.3,12),{title:"The biggest city that isn’t",
  pins:[[[-81.66,30.33],"Jacksonville: about 1 million in the city","point"]],phPins:[ph([-80.19,25.77],"Miami: about 6 million in the metro area","Miami skyline 20080328.jpg")],
  stat:"Jacksonville has about twice as many people as Miami, yet Miami’s metro area is over three times bigger",
  body:"“City” can mean very different things. In 1968 Jacksonville merged with its county, so its city limits now cover over 2,000 km² and about a million people. Miami’s city limits are tight, holding under half a million, though the metropolitan area around it holds about 6 million.",
  more:"Geographers separate the city proper, the urbanised area and the metropolitan area (the city plus the suburbs tied to it by commuting). Rankings of the “biggest city” change with which one you use, as the megacity stop warns."}));
}
/* ───────── hg6b Inside the city ───────── */
if(T("hg6b")&&!T("hg6b").steps._rvA){T("hg6b").steps._rvA=1;
 ins("hg6b","The galactic city",Object.assign(at(2.35,48.86,9),{title:"Rich in the middle",
  pins:[[[2.55,48.91],"Clichy-sous-Bois: high-rise suburb","point"],[[[2.34,48.86]],"Inside the Périphérique: rich centre","area"]],phPins:[ph([2.29,48.86],"Paris: the prestigious centre","Paris - The Eiffel Tower in spring - 2307.jpg")],
  stat:"In Paris the rich live in the centre and the poor in high-rise suburbs: Chicago’s pattern turned inside out",
  body:"Many European cities kept wealth at the centre: old palaces, culture and good transport made it prestigious, and strict planning kept towers out. Social housing towers went up in the banlieues, the suburbs beyond the Périphérique ring road. The 2005 riots began in one of them, Clichy-sous-Bois.",
  more:"Before lifts, Haussmann’s apartment blocks sorted classes by floor: the rich on the grand second floor, servants in the attics under the roof. The lift turned the top floor into the penthouse."}));
 ins("hg6b","The Latin American city",Object.assign(at(-46.72,-23.61,9),{title:"Pools on every balcony",
  pins:[[[-46.72,-23.615],"Paraisópolis favela","point"],[[-46.71,-23.6],"Morumbi: gated towers","point"]],
  stat:"A famous photo shows a tower with a swimming pool on every balcony, separated by one wall from a favela",
  body:"In São Paulo’s Morumbi district, luxury gated towers stand beside Paraisópolis, a favela of tens of thousands of people. Gated communities, walls and private guards let the rich live close to the poor yet apart. The photo, taken by Tuca Vieira in 2004, became a symbol of inequality worldwide.",
  more:"São Paulo has one of the world’s largest fleets of private helicopters, which let some of the rich avoid the streets altogether."}));
 ins("hg6b","The African city",Object.assign(at(-4.97,34.065,9),{title:"A city without cars",
  pins:[[[-4.973,34.065],"Fès el-Bali: the old medina","point"],[[-5.0,34.04],"The French new town","point"]],
  stat:"In Fès’s old medina thousands of alleys are too narrow for cars, and donkeys still deliver the goods",
  body:"The traditional Middle Eastern and North African city grew around a great mosque and its market, the souq, with trades grouped by street and quiet homes turned inward round courtyards. Fès el-Bali, founded in the 800s, kept this layout, and it is one of the largest car-free urban areas in the world.",
  more:"Narrow, shaded lanes and courtyard houses also keep people cool in summer. The French built a separate new town beside the old one rather than rebuild it."}));
}
/* ───────── hg6c Building better cities (rework) ───────── */
if(T("hg6c")&&!T("hg6c").steps._rvA){T("hg6c").steps._rvA=1;
 rm("hg6c","Counting the city");
 ins("hg6c","Urban sprawl",Object.assign(at(-95.37,29.76,9),{title:"No zoning at all",
  pins:[[[-95.37,29.76],"Houston","point"]],
  stat:"Houston, the fourth-biggest US city, has no zoning laws",
  body:"Zoning is the set of laws that splits a city into areas for homes, shops or industry. Houston’s voters rejected it in 1948, 1962 and 1993, so a petrol station can sit next to a house. Private deed rules protect many neighbourhoods instead, and building is easier, which helps keep homes cheaper than in most big US cities.",
  more:"Critics point to sprawl and flooding as the city paves over wetlands; supporters say other cities’ zoning is what makes them unaffordable."}));
 ins("hg6c","The infrastructure of cities",Object.assign(at(12.4,55.75,9),{title:"A city shaped like a hand",
  lines:[[12.55,56.0],[12.3,55.93],[12.07,55.84],[12.08,55.64],[12.18,55.46]].map(b=>({coords:[[12.57,55.68],b],kind:"flow"})),
  pins:[[[12.57,55.68],"The palm: central Copenhagen","point"]],phPins:[ph([12.56,55.69],"Copenhagen","Cityscape and skyline by the Copenhagen Lakes, Denmark - (36018109956).jpg")],
  stat:"Since 1947 Copenhagen has grown along five “fingers” of railway, with green wedges between them",
  body:"The Finger Plan put new housing and offices along rail lines reaching out from the city centre, the “palm”, and kept the land between the lines for farms, forests and parks. This is transit-oriented development: build where the trains already go.",
  more:"Nearly half of Copenhageners now ride to work or school by bike. Tokyo’s private railways went further: they built whole suburbs around their own stations."}));
 ins("hg6c","Smart growth",Object.assign(at(-0.23,51.98,9),{title:"The garden city",
  gfRuler:{a:[-0.23,51.98],b:[-0.13,51.51]},pins:[[[-0.23,51.98],"Letchworth","point"],[[-0.13,51.51],"London","point"]],
  stat:"The world’s first garden city was planned in 1903 to give workers the best of town and country",
  body:"Ebenezer Howard drew “three magnets”: the town (jobs, but slums), the country (fresh air, but no work), and the town-country, his garden city. Letchworth, about 50 km from London (drag the ruler), was built to a fixed size, with factories, homes and a ring of farmland, and owned by a trust for its residents.",
  more:"Howard’s ring of farmland grew into London’s green belt (next stop), and his ideas reshaped suburbs and new towns worldwide."}));
 ins("hg6c","New urbanism",Object.assign(at(2.2,41.4,9),{title:"Superblocks",
  pins:[[[2.2,41.4],"Poblenou superblock","point"],[[[2.16,41.39]],"Eixample: the 1860s grid","area"]],
  stat:"Barcelona closed the streets inside groups of nine blocks to through traffic and gave them to people",
  body:"Barcelona’s 1860s grid has blocks about 113 m across. Since 2016 the city has turned groups of three by three blocks into “superblocks”: cars stay on the edge roads, and the inside streets become play areas, benches and trees.",
  more:"Studies predicted fewer early deaths from cleaner air and less noise. Some shop owners feared losing trade, and opinion is still mixed."}));
 ord("hg6c",["Suburbanisation","Edge cities and boomburbs","Urban sprawl","No zoning at all","The infrastructure of cities","A city shaped like a hand","Smart growth",
  "The garden city","Greenbelts","New urbanism","Superblocks","Brownfields"]);
}
/* ───────── hg6d Cities under pressure ───────── */
if(T("hg6d")&&!T("hg6d").steps._rvA){T("hg6d").steps._rvA=1;
 ins("hg6d","Blockbusting",Object.assign(at(-90.21,38.64,9),{title:"The day modern architecture died",
  pins:[[[-90.21,38.64],"Pruitt–Igoe site","point"]],phPins:[ph([-90.19,38.62],"St Louis","St Louis night expblend cropped.jpg")],
  stat:"Thirty-three tower blocks opened in St Louis in the 1950s and were blown up less than 20 years later",
  body:"Urban renewal meant clearing old, poor neighbourhoods and rebuilding, often as public housing. Pruitt–Igoe, finished in 1954–56, held about 2,800 flats in 11-storey blocks. Poorly maintained, short of money and racially segregated, it decayed fast, and demolition began in 1972, broadcast on television.",
  more:"The critic Charles Jencks declared that modern architecture “died” that day. Historians now blame funding and segregation as much as design."}));
 ins("hg6d","Gentrification",Object.assign(at(12.33,45.44,9),{title:"Venice is emptying",
  pins:[[[12.33,45.44],"Venice’s historic centre","point"]],phPins:[ph([12.34,45.434],"Venice: San Marco","Venezia Basilica di San Marco Fassade 2.jpg")],
  stat:"Venice’s historic centre has fallen from about 175,000 people in 1951 to under 50,000",
  body:"Tourism brings tens of thousands of visitors on busy days, and many flats have become holiday lets. As rents rise and shops switch to selling souvenirs, residents leave. In 2024 Venice began charging day-trippers an entry fee on peak days.",
  more:"In 2009 Venetians held a mock funeral for their city. Barcelona, Lisbon and Amsterdam fight the same pressure, sometimes called touristification: displacement by visitors rather than by richer residents."}));
 ins("hg6d","Cities and climate",Object.assign(at(16.36,48.25,9),{title:"Vienna houses half its people",
  pins:[[[16.36,48.25],"Karl-Marx-Hof","point"],[[16.37,48.21],"Vienna centre","point"]],
  stat:"About half of Vienna’s residents live in council or subsidised flats, and rents stay low",
  body:"After 1919 Vienna taxed luxuries to build huge council estates, and it still builds and owns housing. The Karl-Marx-Hof is over 1 km long. Because so much housing is public or non-profit, private landlords must compete with it, and rents stay well below those of London or Paris.",
  more:"It is the counterpoint to this tour’s problems: affordable housing as policy. Critics point to waiting lists and rules on who qualifies."}));
}
/* ───────── hg7a Measuring development (rework) ───────── */
if(T("hg7a")&&!T("hg7a").steps._rvA){T("hg7a").steps._rvA=1;
 set("hg7a","Measuring development",s=>{s.body="Development means better material conditions and wellbeing for people. This map colours countries by the UN’s Human Development Index. The tour asks how we measure development, and why some countries are richer than others. Totals and averages tell different stories: China’s GDP is second only to the United States’, but per person it is several times lower."});
 set("hg7a","GDP, GNI and per person",s=>{Object.assign(s,at(-8,53.3,16));s.hi=["ie"];s.pins=[[[-6.26,53.35],"Dublin","point"]];
  s.stat="In 2015 Ireland’s GDP jumped 26% in a single year, and almost nobody in Ireland got richer";
  s.body="Gross domestic product (GDP) is the value of everything produced inside a country’s borders in a year. Gross national income (GNI) counts what its own people and firms earn, wherever they are. In 2015 big multinational firms moved valuable patents and aircraft leases, on paper, to Ireland: GDP soared, but GNI, which subtracts profits sent abroad, rose far less.";
  s.more="The economist Paul Krugman called it “leprechaun economics”. Ireland now publishes its own measure, modified GNI, which strips these paper flows out."});
 set("hg7a","Per person and PPP",s=>{s.pins=[[[77.2,28.6],"India: PPP far above nominal","point"]];
  s.body="Purchasing power parity (PPP) adjusts incomes for what money actually buys where people live. A haircut, a bus fare or a plate of food costs far less in Delhi than in New York, so the same dollar of income goes much further there."});
 set("hg7a","Women at work",s=>{s.body="Bangladesh’s garment industry employs about four million people, over half of them women, giving many their first wage. Rwanda has led the world for women in parliament since 2008; over 60% of its MPs are now women. Yet women everywhere still earn less and do most unpaid care work."});
 ins("hg7a","The Human Development Index",Object.assign(at(76.94,9,14),{title:"Healthy before rich",sub:"hdi",
  pins:[[[76.94,8.52],"Thiruvananthapuram","point"]],phPins:[ph([76.4,9.5],"Kerala backwaters","Kerala backwaters, Houseboats, India.jpg")],
  stat:"Kerala reached literacy and life expectancy close to rich countries’ while its incomes were still low",
  body:"For decades this Indian state had low incomes, but its governments, missionaries and old princely states invested early in schools and clinics, and girls went to school. By 2011 literacy was about 94%, and life expectancy was in the mid-70s, far above India’s average.",
  more:"Money sent home by workers in the Gulf has since made Kerala richer too. The “Kerala model” shows why the HDI counts health and schooling, not just income."}));
 ins("hg7a","Healthy before rich",Object.assign(at(89.64,27.47,12),{title:"Gross National Happiness",sub:"hdi",hi:["bt"],
  pins:[[[89.64,27.47],"Thimphu","point"]],phPins:[ph([89.36,27.49],"Bhutan: Paro Taktsang","Paro Taktsang, Bhutan (edited).jpg")],
  stat:"Bhutan’s king declared that Gross National Happiness matters more than Gross National Product",
  body:"In the 1970s Bhutan’s fourth king said development should be measured by wellbeing, not just output. Bhutan now surveys its people on health, education, time use, community, culture and environment, and its 2008 constitution tells the state to pursue Gross National Happiness.",
  more:"Critics note Bhutan’s poverty, its expulsion of many Nepali-speaking Lhotshampa in the 1990s, and the young people now leaving for Australia. Still, the idea helped inspire the UN’s World Happiness Report."}));
 ins("hg7a","Gross National Happiness",Object.assign(at(28.08,-26.1,9),{title:"Across the motorway",
  pins:[[[28.057,-26.107],"Sandton: “Africa’s richest square mile”","point"],[[28.1,-26.103],"Alexandra township","point"]],phPins:[ph([28.04,-26.2],"Johannesburg","Johannesburg-city-skyline-night.jpg")],
  stat:"South Africa is one of the most unequal countries on Earth, and you can see it across one motorway",
  body:"The Gini coefficient measures inequality from 0 (everyone has the same income) to 1 (one person has everything). South Africa’s, about 0.63, is among the highest measured. Alexandra, a crowded township, lies across the M1 motorway from Sandton, nicknamed “Africa’s richest square mile”.",
  more:"Apartheid planning deliberately put Black townships away from white suburbs, and the pattern outlived the law. National averages hide gaps like this one."}));
 ord("hg7a",["GDP, GNI and per person","Per person and PPP","The informal economy","Sectors of the economy","The Human Development Index","Healthy before rich","Gross National Happiness",
  "Across the motorway","Women and development","Women at work","Rostow’s stages of growth","World-systems theory","Dependency and commodity dependence"]);
}
/* ───────── hg7b Industry and the global economy ───────── */
if(T("hg7b")&&!T("hg7b").steps._rvA){T("hg7b").steps._rvA=1;
 set("hg7b","Deindustrialisation",s=>{s.phPins=[];
  s.pins=[[[-80.65,41.1],"Youngstown: steel","point"],[[-80,40.44],"Pittsburgh","point"],[[-81.69,41.5],"Cleveland","point"]];
  s.body="From the 1970s factories in the US Rust Belt and northern Britain closed as production moved to cheaper places and machines replaced workers. On “Black Monday”, 19 September 1977, Youngstown Sheet and Tube announced it was closing its Ohio steelworks, ending about 5,000 jobs; the city has since lost about two-thirds of its people.";
  s.more="Pittsburgh recovered through universities and health care; other places suffer long decline and empty buildings. Detroit’s story is told in the Cities under pressure tour."});
 ins("hg7b","Bulk-reducing and bulk-gaining",Object.assign(at(-16,64.9,16),{title:"Ore from the other side of the world",
  pins:[[[-14.22,65.03],"Reyðarfjörður: Alcoa smelter","point"],[[-15.8,64.95],"Kárahnjúkar dam","point"],[[-22.0,64.1],"Straumsvík smelter","point"]],
  stat:"Iceland has no bauxite, yet it smelts about 1% of the world’s aluminium",
  body:"Smelting aluminium takes so much electricity that the metal is called “solid electricity”. So firms ship alumina, refined ore, from as far as Australia and Brazil to Iceland, where hydro and geothermal power are cheap. Its three smelters use about three-quarters of the country’s electricity.",
  more:"The Kárahnjúkar dam was built to power the Alcoa smelter here, flooding highland wilderness amid fierce protest. This is a power-oriented industry: it locates near cheap energy, not near its raw material or its market."}));
 ins("hg7b","Agglomeration",Object.assign(at(6.83,47.1,9),{title:"A town planned around watchmakers",
  pins:[[[6.83,47.1],"La Chaux-de-Fonds","point"],[[6.75,47.06],"Le Locle","point"]],
  stat:"After a fire in 1794, a Swiss town was rebuilt in long sunny rows so every watchmaker’s bench got daylight",
  body:"In the Jura mountains, farmers snowed in all winter took up making watch parts at home, a cottage industry that grew into a world trade. La Chaux-de-Fonds was rebuilt in long, sunny rows of houses with workshops, and Swiss watchmaking is still clustered here, long after its first reasons faded.",
  more:"Karl Marx described the town in Das Kapital as one huge watch factory. Staying put after the original advantages have gone is called industrial inertia: skills, suppliers and reputation keep the cluster alive."}));
 ins("hg7b","The knowledge economy",Object.assign({view:[-180,-58,180,80],globe:[160,20,1]},{title:"Night shift in Manila",gfSun:{utc:15,day:80,city:["Manila",8]},
  pins:[[[-74,40.7],"New York: 10 or 11 am","point"]],phPins:[ph([121.02,14.55],"Manila: about 11 pm","Sunset in Manila Bay, Manila, Philippines.jpg")],
  stat:"When Americans call customer service, they are often talking to someone in Manila in the middle of the night",
  body:"The Philippines overtook India as the world’s call-centre capital around 2010. It has many English speakers, accents familiar to Americans from a long US colonial history, and lower wages. Because Manila is 12 or 13 hours ahead of New York, much of the work runs overnight: the shading shows the night side of the Earth.",
  more:"Well over a million Filipinos work in business process outsourcing, offshored office services. Districts like Makati stay lit and busy all night, with 24-hour cafés for night-shift workers."}));
}
/* ───────── hg7c Trade and the world economy ───────── */
if(T("hg7c")&&!T("hg7c").steps._rvA){T("hg7c").steps._rvA=1;
 set("hg7c","The world’s factory",s=>{s.title="Special economic zones";s.pins=[[[114.17,22.32],"Hong Kong","point"],[[113.75,23.02],"Dongguan","point"]];
  s.stat="Low taxes in China’s special economic zones drew foreign factories from 1980";
  s.body="From 1980 China opened special economic zones (SEZs), areas with lower taxes and looser rules for foreign firms, starting with Shenzhen beside Hong Kong. Factories spread across the Pearl River Delta: Dongguan, between Shenzhen and Guangzhou, grew from a farming county into a city of about 10 million making shoes, toys and electronics."});
 set("hg7c","Containers and global trade",s=>{s.pins=[[[122.06,30.63],"Yangshan deep-water port","point"],[[103.82,1.26],"Singapore","point"]];
  s.stat="Shanghai has been the world’s busiest container port since 2010";
  s.body="The shipping container, introduced in 1956, made moving goods so cheap that distant factories became worthwhile. Shanghai now handles about 50 million standard boxes a year, many at Yangshan, a port built on islands about 30 km offshore and joined to the city by a 32 km bridge, because the Yangtze’s mouth was too shallow for the biggest ships."});
 ins("hg7c","The World Trade Organization",Object.assign({view:[-90,22,30,62],globe:[-30,42,1.4],_ff:1,card:"left"},{title:"The chicken tax",
  lines:[{coords:[[8,50],[-76.58,39.27]],kind:"dash"}],pins:[[[-76.58,39.27],"Port of Baltimore","point"],[[[8,50]],"Europe: taxed US chicken","area"]],
  stat:"A 1964 trade war over chicken still puts a 25% tariff on imported vans and pickups in the US",
  body:"A tariff is a tax on imports. When Europe taxed American frozen chicken in the early 1960s, the US hit back with tariffs on several European goods, including light trucks. The truck tariff never ended. To dodge it, Ford imported Transit Connect vans with rear seats fitted, so they counted as passenger vehicles, then ripped the seats out in Baltimore.",
  more:"Protectionism shields home industries but invites retaliation. It is one reason big pickups are made in North America and US carmakers dominate that market."}));
 ins("hg7c","Free-trade and export processing zones",Object.assign(at(-81.38,19.29,12),{title:"18,000 companies, one building",
  pins:[[[-81.38,19.29],"Ugland House, George Town","point"]],phPins:[ph([-81.25,19.32],"Grand Cayman","Cayman Islands 2005 087.jpg")],
  stat:"One five-storey office building in the Caymans has been the registered address of about 18,000 companies",
  body:"Offshore financial centres attract companies with low or zero taxes and secrecy. The Cayman Islands, with fewer than 100,000 people, have far more registered companies than residents, and Ugland House holds the registered offices of thousands of them.",
  more:"In 2008 Barack Obama said it was “either the biggest building or the biggest tax scam on record”. Most firms are only a nameplate there: profits move on paper, not in ships."}));
 ins("hg7c","Containers and global trade",Object.assign({},W,{title:"The world’s biggest fleet sails under Liberia",globe:[-30,15,1],hi:["lr","pa","mh"],
  pins:[[[-77.4,38.95],"Virginia: Liberia’s registry office","point"],[[-80,8.5],"Panama","point"],[[171,7.1],"Marshall Islands","point"]],phPins:[ph([-10.8,6.3],"Monrovia, Liberia","Monrovia, Liberia - panoramio (13).jpg")],
  stat:"More of the world’s shipping is registered in Liberia, Panama and the Marshall Islands than in any big trading nation",
  body:"A ship can fly a flag of convenience: it registers in a country with low fees, light rules and cheap crews, whoever owns it. Liberia’s registry is run by a company based near Washington, in Virginia, and even landlocked Mongolia keeps a ship registry.",
  more:"Critics say flags of convenience let owners dodge safety and labour rules. Every ship must still obey the rules of the ports it uses. Globalisation splits who owns, who flags and who sails a ship."}));
}
/* ───────── hg7d Sustainable development (rework, on the Relief map) ───────── */
if(T("hg7d")&&!T("hg7d").steps._rvA){T("hg7d").steps._rvA=1;const t=T("hg7d");
 try{def(t,"map",Object.assign({},t.map,{mode:"relief"}))}catch(e){}
 set("hg7d","Sustainable development",s=>{s.phPins=(s.phPins||[]).filter(q=>!/North Sea|Monteverde/.test(q.label)).concat([ph([29.53,-1.47],"Rwanda: gorillas","Mountain gorilla (Gorilla beringei beringei) eyes.jpg"),ph([-90.31,-0.74],"Galápagos: debt for nature","Galapagos giant tortoise, head (Chelonoidis niger hoodensis).jpg")])});
 rm("hg7d","Saving resource wealth");rm("hg7d","Ecotourism");
 const did=st("hg7d","Did the earlier goals work?");
 set("hg7d","Goals for 2030",s=>{s.title="From 8 goals to 17";s.view=[36,-10,116,45];s.globe=[90,20,1.8];s.card="left";s._ff=1;
  s.pins=[[[90.4,23.8],"Dhaka","point"],[[105,35],"China","point"],[[78,22],"India","point"]];
  s.stat="Extreme poverty fell from over a third of humanity in 1990 to about one in ten by 2015";
  s.body="The eight Millennium Development Goals (2000–2015) met their target of halving extreme poverty early, mostly thanks to growth in China and India; Bangladesh also cut it steeply. In 2015 the UN replaced them with 17 Sustainable Development Goals for 2030, covering hunger, health, education, gender, clean energy and climate, and applying to rich countries too.";
  s.more="Many SDG targets are behind schedule, and extreme poverty is now concentrated in sub-Saharan Africa."});
 if(did)rm("hg7d","Did the earlier goals work?");
 ins("hg7d","Meeting needs without harming the future",Object.assign(at(51.53,25.29,14),{title:"The ecological footprint",
  pins:[[[51.53,25.29],"Doha","point"]],phPins:[ph([51.53,25.3],"Doha","Doha skyline in the morning (12544910974).jpg")],
  stat:"If everyone lived like the average Qatari, humanity would use up a whole year’s worth of nature by early February",
  body:"An ecological footprint is the area of land and sea needed to grow your food, absorb your carbon and supply everything you use. Qatar’s is among the largest on Earth: desert heat, air conditioning and cheap gas push its energy use per person very high. The Global Footprint Network put its 2025 “overshoot day” on 6 February.",
  more:"For the world as a whole, overshoot day fell in late July: humanity uses nature about 1.7 times faster than it regrows. Most poor countries do not overshoot at all."}));
 ins("hg7d","Minerals for a green future",Object.assign(at(8.78,2.5,16),{title:"Rich in oil, poor in people",hi:["gq"],
  pins:[[[8.78,3.75],"Malabo","point"],[[[8.3,2.6]],"Offshore oil fields","area"]],
  stat:"Equatorial Guinea has one of Africa’s highest incomes per person, yet most of its people stay poor",
  body:"Oil found offshore in the 1990s made this small country rich on paper. But much of the money flowed to a ruling family and its circle, while many people still lack clean water and good schools. Its HDI rank sits far below its income rank, one of the biggest gaps in the world.",
  more:"This is the resource curse: easy money from one resource can feed corruption and weaken everything else. Norway, which saved its oil money in a fund worth nearly $2 trillion, shows the other path."}));
 ins("hg7d","Rich in oil, poor in people",Object.assign(at(11.09,55.68,9),{title:"A town that trades its waste",
  pins:[[[11.09,55.68],"Kalundborg","point"]],
  stat:"In one Danish town, a power station’s waste steam, heat and gypsum feed other businesses",
  body:"Since the 1970s Kalundborg’s firms have swapped by-products: steam from the power station went to a pharmaceutical factory and an oil refinery, waste heat warmed homes and fish farms, and gypsum from cleaning the smoke became plasterboard. One company’s waste is another’s raw material.",
  more:"This is industrial symbiosis, a working model of the circular economy, in which materials are reused instead of thrown away. It grew deal by deal because it saved money, not from a master plan."}));
 ins("hg7d","A town that trades its waste",Object.assign(at(-90.31,-0.74,14),{title:"Debt for turtles",
  pins:[[[-90.31,-0.74],"Galápagos Islands","point"]],phPins:[ph([-90.4,-0.6],"Galápagos giant tortoise","Galapagos giant tortoise, head (Chelonoidis niger hoodensis).jpg")],
  stat:"In 2023 Ecuador refinanced about $1.6 billion of debt in return for protecting the Galápagos’ seas",
  body:"In a debt-for-nature swap, lenders accept cheaper or smaller repayments if the savings go to conservation. Ecuador bought back old bonds with a new, cheaper loan backed by insurers, and promised a fixed sum every year for nearly two decades to protect the waters around the Galápagos.",
  more:"It was the largest such swap at the time; Belize and Gabon did similar deals. Critics ask whether the promises are enforced and whether the bankers gained most."}));
 ins("hg7d","Debt for turtles",Object.assign(at(29.53,-1.47,12),{title:"$1,500 to see a gorilla",hi:["rw"],
  pins:[[[29.53,-1.47],"Volcanoes National Park","point"]],phPins:[ph([29.6,-1.42],"Mountain gorilla","Mountain gorilla (Gorilla beringei beringei) eyes.jpg")],
  stat:"Rwanda charges $1,500 for an hour with mountain gorillas, and the gorillas are increasing",
  body:"Ecotourism is travel to nature that pays for protecting it. Rwanda chose the high-price, low-volume kind: few visitors, each paying a lot. A share of park revenue goes to nearby communities, which gives villagers a reason to protect the forest rather than clear it. Mountain gorillas, in the Virunga volcanoes and Uganda’s Bwindi forest, now number over 1,000.",
  more:"Critics say the price shuts out most Rwandans. Limiting visitor numbers also protects the gorillas from catching human diseases."}));
 ord("hg7d",["Meeting needs without harming the future","The ecological footprint","From 8 goals to 17","Small loans, big changes","Resource depletion","Minerals for a green future",
  "Rich in oil, poor in people","A town that trades its waste","Debt for turtles","$1,500 to see a gorilla","Climate and development"]);
}
NEW.forEach(frame);
}

/* ───────── tour questions: follow renamed and merged stops, drop the ones whose stop is gone, add new ones ───────── */
const REN={hg2b:{"Births, deaths and natural increase":"Natural increase and doubling","Doubling time":"Natural increase and doubling"},
 hg3b:{"Culture that unites and divides":"Belfast’s peace walls"},
 hg3c:{"Universalising religions":"Two kinds of faith","Ethnic religions":"Two kinds of faith","Sikhism":"Two kinds of faith"},
 hg4b:{"Separatist movements":"Separatism, by ballot or by bomb","Terrorism and separatism":"Separatism, by ballot or by bomb"},
 hg6a:{"Site and situation":"Where the ships stopped"},hg7c:{"The world’s factory":"Special economic zones"},
 hg7d:{"Goals for 2030":"From 8 goals to 17","Did the earlier goals work?":"From 8 goals to 17","Ecotourism":"$1,500 to see a gorilla"}};
const DROP=[/^This photo, taken from a plane over Rondônia/,/^Click the country whose canal the Ever Given blocked/];
const REWORD={"Istanbul’s control of the strait between the Black Sea and the Mediterranean describes its…":{q:"Richmond and Augusta grew where ships could sail no further upstream. That position among other places describes their…",why:"Situation is a place’s position relative to other places and routes; the rapids themselves are part of its site.",kc:"us"},
 "Detroit losing over half its population after 1950 is best explained by…":{q:"Youngstown losing about two-thirds of its people after its steelworks closed is best explained by…",why:"Steelworks closed, automated or moved to cheaper places."},
 "Which best describes ecotourism in Costa Rica?":{q:"Which best describes Rwanda’s gorilla tourism?",kc:"rw"}};
const NEWQ={
 hg1b:[{at:"Lasers find lost cities",st:"Lasers find lost cities",q:"Aircraft fired laser pulses over Guatemala’s forest to map the ground beneath the trees. This is an example of…",o:["remote sensing","a census","field observation","a perceptual region"],a:0,why:"Remote sensing gathers data from a distance, here from aircraft, without anyone on the ground.",kc:"gt"},
  {at:"A line for heating",st:"A line for heating",q:"China gave free winter heating only north of the Huai River, and life expectancy just north of the line is about three years lower. The line is the edge of a…",o:["formal region","perceptual region","functional region","frontier"],a:0,why:"A formal region shares one measurable trait, here a heating policy, with a clear edge.",kc:"cn"}],
 hg2d:[{at:"The decree that doubled births",st:"The decree that doubled births",q:"Romania banned abortion and contraception in 1966 to raise its birth rate. This was a…",o:["pronatalist policy","antinatalist policy","neo-Malthusian policy","guest-worker policy"],a:0,why:"Pronatalist policies aim for more births; Romania’s was forced and its effect short-lived.",kc:"ro"}],
 hg3b:[{at:"A copy of Hallstatt",st:"A copy of Hallstatt",q:"A Chinese developer built a copy of an Austrian village in Guangdong. Geographers call landscapes like this…",o:["placelessness","sequent occupance","a sacred space","a cultural hearth"],a:0,why:"Placelessness describes landscapes copied from elsewhere that could be anywhere.",kc:"cn"}],
 hg3c:[{at:"Maken or machen",st:"Maken or machen",q:"The line between Germans who say “maken” and those who say “machen” is an example of…",o:["an isogloss","a lingua franca","a creole","an interfaith boundary"],a:0,why:"An isogloss is a boundary between places that use a word or sound differently.",kc:"de"}],
 hg4b:[{at:"Sinhala Only",st:"Sinhala Only",q:"Indonesia chose a neutral national language; Sri Lanka made the majority’s language the only official one. Which outcome followed?",o:["Indonesia held together; Sri Lanka slid into civil war","Both split apart","Both became unitary nation-states without conflict","Sri Lanka held together; Indonesia split"],a:0,why:"A neutral language worked as a centripetal force; Sinhala Only fed Tamil ethnonationalism and a 26-year war.",kc:"lk"}],
 hg4c:[{at:"The heartland",st:"The heartland",q:"Which idea says that whoever controls the interior of Eurasia could dominate the world?",o:["Mackinder’s Heartland theory","Spykman’s Rimland theory","World-systems theory","The gravity model"],a:0,why:"Halford Mackinder put forward the Heartland theory in 1904.",kc:"kz"}],
 hg5c:[{at:"Roses from the equator",st:"Roses from the equator",q:"Why can a Kenyan rose flown to Europe have a smaller carbon footprint than a Dutch one?",o:["Dutch roses are grown in heated greenhouses","Planes give off no carbon","Kenya has no farms","Roses grow faster in the cold"],a:0,why:"Kenya’s high-altitude equatorial climate needs no heating; heating Dutch greenhouses uses far more energy than the flight.",kc:"ke"}],
 hg6c:[{at:"No zoning at all",st:"No zoning at all",q:"In Houston a petrol station can open next to a house, because the city has no…",o:["zoning laws","greenbelt","census tracts","edge cities"],a:0,why:"Zoning laws split a city into areas for homes, shops and industry; Houston’s voters have rejected them three times.",kc:"us"}],
 hg7a:[{at:"Across the motorway",st:"Across the motorway",q:"South Africa’s Gini coefficient is about 0.63. That tells you its…",o:["incomes are very unequal","people live long lives","GDP is very high","population is very young"],a:0,why:"The Gini coefficient runs from 0 (everyone equal) to 1 (one person has everything).",kc:"za"}],
 hg7d:[{at:"A town that trades its waste",st:"A town that trades its waste",q:"In Kalundborg one firm’s waste steam and gypsum become another firm’s raw materials. This is an example of…",o:["the circular economy","the resource curse","a debt-for-nature swap","deindustrialisation"],a:0,why:"A circular economy reuses materials instead of throwing them away; Kalundborg’s version is called industrial symbiosis.",kc:"dk"}]};
function questions(){try{if(typeof TOURQ==="undefined")return;for(const id in OPEN){const Q=TOURQ[id],t=T(id);if(!Q||!t||!t.steps._rvA||Q._rvA)continue;Q._rvA=1;
 const titles=new Set(t.steps.map(s=>s.title)),R=REN[id]||{};
 ["mid","recap"].forEach(k=>{if(!Array.isArray(Q[k]))return;
  const keep=Q[k].filter(q=>{if(DROP.some(r=>r.test(q.q||"")))return false;
   if(R[q.at])q.at=R[q.at];const sp=String(q.st||"").split("|");if(R[sp[sp.length-1]])q.st=R[sp[sp.length-1]];
   const w=REWORD[q.q];if(w)Object.assign(q,w);
   return titles.has(q.at)||titles.has(String(q.st||"").split("|").pop())});
  Q[k].splice(0,Q[k].length,...keep)});
 (NEWQ[id]||[]).forEach(q=>{if(titles.has(q.st)&&!(Q.mid||[]).some(x=>x.q===q.q))(Q.mid=Q.mid||[]).push(q)})}}catch(e){console.error(e)}}

/* ───────── photos: library files → photo-pin indexes ───────── */
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
function photos(){try{if(typeof PS_PHOTO_DATA==="undefined")return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 for(const id in OPEN){const t=T(id);if(t&&t.steps._rvA)t.steps.forEach(reg)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&OPEN[ps.tour]){const S=psSteps()[i];if(S)reg(S)}}catch(e){}return _g.apply(this,arguments)}}

function run(){try{patch()}catch(e){console.error(e)}questions();photos()}
run();[1500,5000,12000].forEach(ms=>setTimeout(run,ms));addEventListener("load",()=>setTimeout(run,1500));
})();
