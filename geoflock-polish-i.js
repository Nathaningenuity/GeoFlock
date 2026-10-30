/* GeoFlock: polish for the AP Human Geography unit tours (hg1 … hg7d, built from HUG in index.html). Adds photo pins on
   every opening stop, card photos for stops that had none, interactive gadgets where they teach the idea (rulers for
   migration and diffusion distances and gravity-model pairs, true-size ghosts, population and People-map filters for
   density, DTM stages and pyramids, map layers for trade, resources, rivers and currents, day and night for time–space
   compression, sea level for low deltas, a height cross-section for rice terraces), a few new stops, fact updates, and a
   country (kc) for every tour question. No History-map stops, so every tour stays on its own map. It only patches
   PS_TOURS at load (like geoflock-polish-b.js); load it after the tour files. Every patch is keyed by stop title, so a
   stop that has been renamed or removed is simply skipped. The "patched" flag sits on the steps array (steps._polI). */
(function(){
const OPEN={hg1:"Thinking like a geographer",hg1b:"Data, regions and environment",hg2a:"Where people live",hg2b:"Models of population",
 hg2c:"Why people move",hg2d:"Population futures",hg3a:"How culture spreads",hg3b:"Cultural landscapes",hg3c:"Religion, language and change",
 hg4a:"States, nations and boundaries",hg4b:"Forces that bind and divide",hg4c:"Empires, power and unions",hg4d:"Lines on land, sea and ballot",
 hg5a:"How the world farms",hg5b:"Models of rural land",hg5c:"Food in a global system",hg5d:"Farming and the planet",hg6a:"A world of cities",
 hg6b:"Inside the city",hg6c:"Building better cities",hg6d:"Cities under pressure",hg7a:"Measuring development",
 hg7b:"Industry and the global economy",hg7c:"Trade and the world economy",hg7d:"Sustainable development"};
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
/* some stops lock fields with getters (psLock in index.html); writes go through defineProperty so they replace those */
const def=(t,k,v)=>Object.defineProperty(t,k,{configurable:true,enumerable:true,writable:true,value:v});
/* a stop given its own view keeps it: _ff stops psFrameFix re-fitting it to the highlighted countries */
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(new Proxy(s,{set(t,k,v){def(t,k,v);if(k==="view")def(t,"_ff",1);return true},deleteProperty(t,k){try{def(t,k,undefined)}catch(e){}return delete t[k]}}))}catch(e){console.error(e)}};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
/* insert a new stop after the stop titled `after` (once) */
const ins=(id,after,s)=>{const t=T(id);if(!t||t.steps.some(x=>x.title===s.title))return;const i=t.steps.findIndex(x=>x.title===after);if(i<0)return;t.steps.splice(i+1,0,S(Object.assign(s.view?{_ff:1}:{},s)))};
/* photo pins carry their library file; photos() turns it into the photo's index */
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
const W=[-180,-58,180,80];

/* card photos for stops that had none ("tour|title" → library file); stops listed in GF_STOP_PHOTO keep theirs */
const CARD={
 "hg1|Reference and thematic maps":"British Empire map - The India and Colonial Exhibition, London (1886) - BL.jpg",
 "hg1|Large scale, small scale":"Tower of London from the Shard (8515883950).jpg",
 "hg1|Scale changes the story":"Kerala backwaters, Houseboats, India.jpg",
 "hg1b|Data, regions and environment":"Tourists taking pictures at Prime Meridian monument, Greenwich Observatory, London.jpg",
 "hg1b|Walking the streets":"Scotts Bakeries corner shop, London.jpg",
 "hg1b|Counting everyone":"Times Square at Night with crowds of people.jpg",
 "hg1b|Perceptual regions":"Riyadh Skyline.jpg",
 "hg2a|Where people live":"Skyline view from Seoul City (South Korea).jpg",
 "hg2b|Models of population":"A village in Niger.jpg",
 "hg2b|Stages 4 and 5: low and shrinking":"Skyline view from Seoul City (South Korea).jpg",
 "hg2b|The dependency ratio":"Old men playing cards in a Beijing hutong.jpg",
 "hg2d|Population futures":"Shibuya Crossing, Tokyo; December 2017.jpg",
 "hg2d|Antinatalist policies":"1996 -247-15a Beijing Tiananmen Gate (5068462443).jpg",
 "hg2c|Why people move":"Italian immigrants at Ellis Island.jpg",
 "hg2c|Ravenstein’s laws":"Tower of London from the Shard (8515883950).jpg",
 "hg3a|How culture spreads":"Pilgrims begin this year's Hajj rituals with a circumambulation of the Kaaba (2025) (2).jpg",
 "hg3a|Hierarchical diffusion":"Galleria Milano (179532365).jpeg",
 "hg3b|Cultural landscapes":"Banham village from the air.jpg",
 "hg3b|Folk and popular culture":"Amish buggy.jpg",
 "hg3b|Two ways of judging":"Coffee ceremony of Ethiopia and Eritrea 1.jpg",
 "hg3b|Gender in the landscape":"Riyadh Skyline.jpg",
 "hg3c|Religion, language and change":"Supplicating Pilgrim at Masjid Al Haram. Mecca, Saudi Arabia.jpg",
 "hg4a|Geometric boundaries":"Sahara satellite hires.jpg",
 "hg4b|Forces that bind and divide":"Parliament House at dusk, Canberra ACT.jpg",
 "hg4b|Size and distance from the capital":"Trans-Siberian train on the steppe.jpg",
 "hg4c|Empires, power and unions":"British Empire map - The India and Colonial Exhibition, London (1886) - BL.jpg",
 "hg4c|Neocolonialism":"Breaking open cocoa pods in Ivory Coast.png",
 "hg4d|Lines on land, sea and ballot":"Demilitarized Zone (DMZ) Joint Security Area (JSA) Looking Into North Korea (28819154694).jpg",
 "hg4d|Borders at sea":"Dover White Cliffs 4.jpg",
 "hg4d|Redistricting":"US Capitol west side.JPG",
 "hg5a|Mixed crop and livestock":"Iowa farm.jpg",
 "hg5a|Extensive farming":"Ethiopian New Year Landscape. Photo Taken on September 11 2010 Ethiopian Calendar. Ethiopian indigenous flower \"Adey Abeba\" Sheeps seen grazing.jpg",
 "hg5b|Models of rural land":"Banham village from the air.jpg",
 "hg5b|Why the rings bend":"Combine harvesting wheat.jpg",
 "hg5b|Metes and bounds":"Banham village from the air.jpg",
 "hg5b|Township and range":"Iowa farm.jpg",
 "hg5c|Food in a global system":"Colorful Spices and Teas.jpg",
 "hg5d|Dead zones":"America's Highways 1776–1976 - Mississippi River Steamboats.jpg",
 "hg5d|Genetically modified crops":"Corncobs.jpg",
 "hg6b|Inside the city":"Sears Tower, Wacker Drive and Jackson Boulevard, Chicago, IL - 54189600901.jpg",
 "hg6b|The concentric zone model":"Sears Tower, Wacker Drive and Jackson Boulevard, Chicago, IL - 54189600901.jpg",
 "hg6b|The sector model":"Skating by the Bean - Millennium Park - Chicago - Illinois - USA (32164006083).jpg",
 "hg6c|Building better cities":"Shanghai by night.jpg",
 "hg6c|Counting the city":"Times square nuit.jpg",
 "hg6d|Cities under pressure":"Low visibility due to Smog at New Delhi Railway station 31st Dec 2017 after 9AM DSCN8829 1.jpg",
 "hg6d|Redlining":"Baltimore row houses.jpg",
 "hg6d|Environmental injustice":"Children queue for water in a camp in Sudan.jpg",
 "hg7a|Measuring development":"High Angle View Of Kigali City Street on November 29, 2018. Emmanuel Kwizera.jpg",
 "hg7a|GDP, GNI and per person":"Wall Street - New York Stock Exchange.jpg",
 "hg7a|Per person and PPP":"Shanghai Pudong skyline by day.jpg",
 "hg7b|Industry and the global economy":"MAERSK HANOI Container Ship (Port Koper SIKOP, 2023).jpg",
 "hg7b|Bulk-reducing and bulk-gaining":"Anfiteatro, Valle de la Luna, San Pedro de Atacama, Chile, 2016-02-01, DD 149.JPG",
 "hg7c|Comparative advantage":"Garment workers rally in Dhaka.jpg",
 "hg7c|Neoliberal policies":"Black Star Square and Independence Arch, Accra, Ghana.jpg",
 "hg7d|Sustainable development":"Baldock Solar Highway aerial 3 (7264413934).jpg"};

/* country inked by each tour question (kc), by the stop the question is about */
const KC={
 hg1:{"Reference and thematic maps":"us","Large scale, small scale":"gb","Geography’s tools":"us","Site and situation":"tr","Distance decay and a shrinking world":"gb","Time–space compression":"in","Density, concentration and pattern":"eg","Every flat map distorts":"gl"},
 hg1b:{"Walking the streets":"gb","Seeing from space":"br","A map that stopped an epidemic":"gb","Data decide who gets what":"us","Perceptual regions":"us","People adapt nature":"nl","Using land without using it up":"uz","Formal and functional regions":"eg"},
 hg2a:{"Coasts and rivers":"cn","Arithmetic density":"mn","Physiological density":"eg","Agricultural density":"bd","When one island is too crowded":"id","The big clusters":"in","Pulling people inland":"br"},
 hg2b:{"Births, deaths and natural increase":"de","Infant mortality":"td","Doubling time":"ne","Stage 3: births fall":"eg","Stages 4 and 5: low and shrinking":"kr","Population pyramids":"jp","The dependency ratio":"ne","Fertility and replacement":"kr"},
 hg2d:{"Malthus and his critics":"gb","Neo-Malthusians and Boserup":"cn","Antinatalist policies":"cn","Pronatalist policies":"hu","Choosing who comes in":"ca","Where girls marry young":"ne","An ageing world":"jp","Women and fewer births":"ir"},
 hg2c:{"Push and pull":"mx","Obstacles and opportunities":"ly","Step by step, link by link":"in","Forced to move":"sy","From villages to cities":"cn","Money sent home":"in","Brain drain":"ng","Built by migrants":"ae"},
 hg3a:{"Relocation diffusion":"br","Contagious diffusion":"kr","Stimulus diffusion":"in","Trade carries faith":"id","A shrinking world":"au","Hierarchical diffusion":"fr","Empires spread culture":"br","Expansion diffusion":"sa"},
 hg3b:{"Two ways of judging":"in","Sacred spaces":"in","What we call places":"in","Gender in the landscape":"sa","Ethnic neighbourhoods":"sg","Culture that unites and divides":"gb","Terraces on the mountains":"cn","Folk and popular culture":"us"},
 hg3c:{"Universalising religions":"id","Ethnic religions":"jp","Indo-European languages":"in","Pidgins and creoles":"pg","Syncretism":"cu","Other language families":"mg"},
 hg4a:{"State, nation, nation-state":"is","Multinational states":"gb","Stateless nations":"iq","Multistate nations":"kr","Subsequent boundaries":"pk","Relic boundaries":"de","Antecedent boundaries":"ca","Geometric boundaries":"eg","Sovereignty":"tw"},
 hg4b:{"Centrifugal forces":"be","Unitary and federal states":"de","Devolution":"gb","Autonomous regions":"cn","Irredentism":"ua","Balkanisation":"ba","Size and distance from the capital":"ru"},
 hg4c:{"Colonialism and imperialism":"et","Neocolonialism":"sn","Choke points":"pa","Military alliances":"fi","Regional unions":"id"},
 hg4d:{"How a border is made":"mx","Exclusive economic zones":"vn","Fragmented, prorupted and perforated":"za","Landlocked states":"bo","Drawing the voting map":"us","Borders at sea":"fr","Compact and elongated states":"cl"},
 hg5a:{"The Columbian Exchange":"ie","Subsistence and commercial":"et","Intensive farming":"cn","Mixed crop and livestock":"us","Extensive farming":"ar","Shifting cultivation":"br","Plantations":"id"},
 hg5b:{"Von Thünen’s rings":"de","Why the rings bend":"de","Von Thünen today":"nl","Patterns of rural settlement":"us","Township and range":"us","Long lots":"ca","The second agricultural revolution":"gb"},
 hg5c:{"The Green Revolution":"in","From farm to supermarket":"ec","Living off exports":"ci","Women who farm":"mw","Fair trade":"co"},
 hg5d:{"Clearing the forest":"br","Spreading deserts":"sn","Draining the water":"uz","Dead zones":"us","Genetically modified crops":"us","Food deserts":"us"},
 hg6a:{"Site and situation":"tr","Why cities grow":"ng","Megacities":"id","Megalopolis and metacity":"us","Primate cities":"th","Central place theory":"de","The gravity model":"us"},
 hg6b:{"The sector model":"us","The galactic city":"us","The African city":"ng","Land rent and density":"us","The concentric zone model":"us"},
 hg6c:{"Suburbanisation":"us","Edge cities and boomburbs":"us","Urban sprawl":"us","Smart growth":"us","Greenbelts":"gb"},
 hg6d:{"Redlining":"us","Gentrification":"us","Informal settlements":"cd","Squatter settlements":"br","Zones of abandonment":"us","Environmental injustice":"us","Cities and climate":"id"},
 hg7a:{"GDP, GNI and per person":"ie","The informal economy":"ng","The Human Development Index":"is","Women at work":"rw","Women and development":"tn","Rostow’s stages of growth":"kr","World-systems theory":"cf","Dependency and commodity dependence":"zm"},
 hg7b:{"The Industrial Revolution":"gb","Industry spreads":"de","Bulk-reducing and bulk-gaining":"cl","Break-of-bulk points":"nl","Deindustrialisation":"us","From Fordism to post-Fordism":"jp"},
 hg7c:{"Complementarity":"au","Neoliberal policies":"gh","OPEC and oil":"sa","Free-trade and export processing zones":"mu","Factories on the border":"mx","Containers and global trade":"eg","Comparative advantage":"bd","Trade blocs":"be"},
 hg7d:{"Goals for 2030":"us","Did the earlier goals work?":"cn","Small loans, big changes":"bd","Resource depletion":"ca","Ecotourism":"cr","Climate and development":"bd","Minerals for a green future":"cd"}};

/* new questions, each tied to a stop this file adds or changes (mid: shown after that stop) */
const NEWQ={
 hg1:[{at:"Every flat map distorts",st:"Every flat map distorts",q:"Drag Greenland’s true shape onto Africa. Why does Greenland look as big as Africa on a Mercator map?",o:["Greenland is really that big","Mercator stretches areas more and more towards the poles","Africa is drawn too small on purpose","Satellites measured Greenland wrongly"],a:1,why:"Mercator keeps directions true but swells areas near the poles; Africa is about 14 times bigger.",kc:"gl"}],
 hg2a:[{at:"The big clusters",st:"The big clusters",q:"On the population map, where are the largest areas with over 220 people per km²?",o:["North Africa and Arabia","South and East Asia","Canada and Russia","Australia"],a:1,why:"The Ganges plain, eastern China and Java are the largest dark areas; deserts, forests and cold lands are almost empty.",kc:"in"}],
 hg2b:[{at:"Population pyramids",st:"Population pyramids",q:"Which country’s pyramid has the widest base?",o:["Japan","Italy","Niger","South Korea"],a:2,why:"Niger has about six children per woman, so each new age group is much larger than the last.",kc:"ne"}],
 hg2c:[{at:"Brain drain",st:"Brain drain",q:"A Nigerian-trained nurse moves to a London hospital for higher pay. For Nigeria this is an example of…",o:["brain drain","chain migration","an intervening opportunity","forced migration"],a:0,why:"Skilled people trained at home leave for better pay abroad.",kc:"ng"}],
 hg3a:[{at:"Trade carries faith",st:"Trade carries faith",q:"With the shipping lanes switched on, which route best explains how Islam reached Indonesia?",o:["Overland across the Himalayas","Indian Ocean sea routes used by Muslim traders","The Trans-Siberian Railway","Pacific routes from the Americas"],a:1,why:"Muslim merchants sailing from Arabia, Persia and India carried the faith to the ports of Southeast Asia.",kc:"id"}],
 hg3c:[{at:"Indo-European languages",st:"Indo-European languages",q:"English, Hindi and Russian all descend from one ancestor. They belong to the same…",o:["language family","pidgin","creole","lingua franca"],a:0,why:"They are all Indo-European, the family spoken by nearly half of humanity.",kc:"in"}],
 hg4b:[{at:"Size and distance from the capital",st:"Size and distance from the capital",q:"Why can great distance from the capital act as a centrifugal force?",o:["Distant regions can feel neglected and grow their own identity","Distance always unites a state","Far regions have the same time zone as the capital","Distance makes borders shorter"],a:0,why:"Far-off regions are harder to govern, serve and bind into a national identity.",kc:"ru"}],
 hg4c:[{at:"Choke points",st:"Choke points",q:"About a fifth of the world’s oil passes through which choke point?",o:["The Strait of Hormuz","The Strait of Gibraltar","The Bosphorus","The Panama Canal"],a:0,why:"Tankers from the Gulf states must all pass through Hormuz.",kc:"ir"},{at:"Colonialism and imperialism",st:"Colonialism and imperialism",q:"Drag Belgium onto the Congo. About how many times larger was the colony its king, Leopold II, once owned?",o:["About 2 times","About 10 times","About 76 times","About 500 times"],a:2,why:"The Democratic Republic of the Congo covers about 2.3 million km², Belgium about 30,700 km².",kc:"cd"}],
 hg4d:[{at:"Compact and elongated states",st:"Compact and elongated states",q:"Chile is over 4,000 km long but under 200 km wide on average. Which problem does this shape cause?",o:["Its regions are all close to the capital","Transport and defence are harder","It has no coastline","It is surrounded by one other state"],a:1,why:"Elongated states struggle to link and defend distant ends.",kc:"cl"}],
 hg5b:[{at:"Rent falls with distance",st:"Rent falls with distance",q:"In bid-rent theory, why does market gardening win the land closest to the city?",o:["It earns the most per hectare and its produce spoils quickly","It needs the most land","Its crops are the cheapest to transport","Ranchers prefer cheap land far away"],a:0,why:"Crops that earn a lot per hectare can pay the highest rent, and fresh produce must reach market fast.",kc:"de"}],
 hg5d:[{at:"Draining the water",st:"Draining the water",q:"The Aral Sea once covered about as much as which country?",o:["Luxembourg","Ireland","France","Brazil"],a:1,why:"About 68,000 km² in 1960, a little smaller than the Republic of Ireland.",kc:"uz"}],
 hg6a:[{at:"The gravity model",st:"The gravity model",q:"Use the gravity model. Which pair of cities should interact most?",o:["Two large cities close together","Two small cities far apart","One large and one small city far apart","Two small cities close together"],a:0,why:"Interaction rises with the cities’ populations and falls with the distance between them.",kc:"us"}],
 hg6b:[{at:"The concentric zone model",st:"The concentric zone model",q:"In Burgess’s concentric zone model, where do newcomers to the city usually first live?",o:["The outer commuter zone","The zone of transition next to the CBD","Middle-class homes","On farms beyond the city"],a:1,why:"Cheap, old housing beside the factories and offices drew new arrivals, who moved outward as they got richer.",kc:"us"},
  {at:"The Latin American city",st:"The Latin American city",q:"In the Griffin–Ford model, where do the richest households live?",o:["In squatter settlements at the edge","Along a commercial spine running from the old plaza","Only in the outer suburbs","Beside the city dump"],a:1,why:"An elite residential sector follows the spine, like Mexico City’s Paseo de la Reforma.",kc:"mx"},{at:"The multiple nuclei model",st:"The multiple nuclei model",q:"Los Angeles has business centres around downtown, the airport and the port. Which model fits best?",o:["Concentric zone","Sector","Multiple nuclei","Von Thünen"],a:2,why:"Harris and Ullman’s model has several centres, each drawing related land uses.",kc:"us"}],
 hg6c:[{at:"Brownfields",st:"Brownfields",q:"London built its 2012 Olympic Park on old rail yards and factory land. Reusing land like this…",o:["is called greenfield development","spares farmland and is part of smart growth","is a kind of redlining","creates a greenbelt"],a:1,why:"Cleaning up brownfields saves open countryside from building.",kc:"gb"}],
 hg6d:[{at:"Cities and climate",st:"Cities and climate",q:"Raise the sea level a few metres. Why is northern Jakarta so exposed?",o:["It sits on high ground","It is low-lying and sinking as groundwater is pumped out","It has no coastline","It is far from the sea"],a:1,why:"Land subsidence plus rising seas puts much of North Jakarta at risk of flooding.",kc:"id"}],
 hg7a:[{at:"Dependency and commodity dependence",st:"Dependency and commodity dependence",q:"Zambia earns most of its export income from copper. When copper prices crash, Zambia…",o:["gains, because copper is cheaper to mine","loses revenue, showing commodity dependence","is unaffected","switches at once to selling cars"],a:1,why:"Relying on one raw material ties a country’s budget to that material’s world price.",kc:"zm"}],
 hg7b:[{at:"Bulk-reducing and bulk-gaining",st:"Bulk-reducing and bulk-gaining",q:"Copper ore is smelted beside the mine, about 1,250 km from Santiago. Why?",o:["Smelting removes most of the weight, so it is cheaper to ship the metal than the ore","Miners prefer to live in the desert","Copper is bulk-gaining","Santiago bans factories"],a:0,why:"Copper smelting is bulk-reducing, so it locates near the raw material.",kc:"cl"}],
 hg7c:[{at:"Trade blocs",st:"Trade blocs",q:"Which group lists only trade blocs?",o:["EU, USMCA, Mercosur","NATO, OPEC, UN","WTO, IMF, World Bank","ASEAN, NATO, African Union"],a:0,why:"Each is a group of neighbouring states that cut trade barriers among themselves.",kc:"be"}],
 hg7d:[{at:"Did the earlier goals work?",st:"Did the earlier goals work?",q:"Between 1990 and 2015 the share of people in extreme poverty fell from over a third to about…",o:["one in two","one in four","one in ten","one in a hundred"],a:2,why:"Growth in China and India did most to halve extreme poverty early.",kc:"cn"},{at:"Climate and development",st:"Climate and development",q:"Raise the sea by 1 metre over Bangladesh. What does this show about climate and development?",o:["Countries that emit least can face some of the worst impacts","Bangladesh emits the most CO₂","Rising seas only affect rich countries","Deltas are safe from flooding"],a:0,why:"Bangladesh emits very little, yet much of its crowded delta lies only a few metres above the sea.",kc:"bd"}]};

function frame(s){try{const v=s.view;if(!v||v[2]-v[0]>=200||s.card==="right")return;const P=[];
 const add=a=>{if(Array.isArray(a)&&typeof a[0]==="number"&&typeof a[1]==="number")P.push(a)};
 (s.pins||[]).forEach(p=>{if(!Array.isArray(p))return;const a=p[0];if(Array.isArray(a)&&Array.isArray(a[0]))a.forEach(add);else add(a)});
 (s.ghosts||[]).forEach(g=>add(g.at));if(s.gfRuler){add(s.gfRuler.a);add(s.gfRuler.b)}(s.iconPins||[]).forEach(q=>add(q.at));
 (s.lines||[]).forEach(l=>(l.coords||[]).forEach(add));
 const L=P.filter(a=>a[0]>=v[0]-20&&a[0]<=v[2]+20).map(a=>a[0]);if(!L.length)return;
 const w=v[2]-v[0],ew=Math.max(w,(v[3]-v[1])*1.6),cx=(v[0]+v[2])/2,mn=Math.min(...L),mx=Math.max(...L),f=x=>.5+(x-cx)/ew;
 if(f(mn)>=.45)return;let W0,E0;
 if(f(mx)+(.46-f(mn))<=.95){const d=(.46-f(mn))*ew;W0=v[0]-d;E0=v[2]-d}
 else{const nw=Math.max(w,(mx-mn)/.48),c=mn+.04*nw;W0=c-nw/2;E0=c+nw/2}
 def(s,"view",[+W0.toFixed(2),v[1],+E0.toFixed(2),v[3]]);def(s,"_ff",1);def(s,"card","left")}catch(e){console.error(e)}}
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 for(const k in CARD){const i=libIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const id in OPEN){const t=T(id);if(!t)continue;t.steps.forEach(s=>(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f||q.img!=null)return;const i=libIdx(f);if(i>=0){q.img=i;if(PS_SQ_IMG[q.label]==null)PS_SQ_IMG[q.label]=i}}))}}catch(e){console.error(e)}}

function patch(){
/* ───────── Unit 1: Thinking like a geographer ───────── */
if(T("hg1")&&!T("hg1").steps._polI){T("hg1").steps._polI=1;
 set("hg1","Thinking like a geographer",s=>{s.phPins=[ph([139.7,35.66],"Tokyo: density","Tokyo Shibuya Scramble Crossing 2021-04-27.jpg"),ph([103.86,1.28],"Singapore: relative location","Marina Bay Sands and illuminated polyhedral building Louis Vuitton over the water at blue hour with pink clouds in Singapore.jpg"),
  ph([29.05,41.05],"Istanbul: site and situation","Bosphorus Bridge (235499411).jpeg"),ph([0,51.48],"Greenwich: 0° longitude","Tourists taking pictures at Prime Meridian monument, Greenwich Observatory, London.jpg"),
  ph([31.2,27],"The Nile: a clustered pattern","Nile River (MODIS 2022-09-06).jpg"),ph([-71.06,42.36],"Boston: a shrinking world","9V-SHI - Airbus A350-941 - Singapore Airlines - 322 - VGHS.jpg")]});
 set("hg1","Every flat map distorts",s=>{s.ghosts=[{code:"gl",at:[20,2],col:"#8a63cf",label:"Greenland, true size"}];
  s.body="You cannot flatten a sphere without stretching it, so every projection distorts shape, area, distance or direction. Mercator keeps directions true for sailors but swells areas towards the poles. The purple shape is Greenland at its true size: drag it north and south."});
 set("hg1","Geography’s tools",s=>{delete s.mode;s.on=["rivers","cities"];
  s.body="GPS fixes a position from satellite signals: every phone map uses it. A GIS (geographic information system) stacks layers of data, such as rivers, cities, roads and flood zones, so you can ask where they overlap. Rivers and cities are switched on here as two layers.";
  s.more="Every map on this site is a GIS layer: relief, population, climate, borders. Switching between them over one place is what a geographer does with a GIS. Satellites gather much of the data: that is remote sensing."});
 set("hg1","Absolute and relative location",s=>{s.on=["grid","connections"];
  s.body="Singapore’s absolute location is about 1.3°N, 103.8°E: a point on the grid of latitude and longitude. Its relative location matters more: at the tip of the Malay Peninsula, on the Strait of Malacca, where the shipping lanes between the Indian Ocean and the Pacific squeeze past."});
 set("hg1","Time–space compression",s=>{s.gfSun={utc:13,day:80,city:["London",0]};
  s.body="Time–space compression is the shrinking of effective distance as transport and communication improve. Cunard’s first steamship took about two weeks from Liverpool to Boston; a message now crosses in under a second. The shading shows 1 pm in London, still early morning in Boston: move the time.";
  s.more="The places do not move; the time and cost of linking them fall. Firms now run offices on several continents as one team, handing work across the time zones."});
 set("hg1","Density, concentration and pattern",s=>{s.view=[8,16,46,36];s.globe=[30,26,3];delete s.spin;s.iconPins=[];s.gfRuler={a:[32.9,24.09],b:[31.24,30.04]};
  s.pins=[[[[31.2,27]],"Clustered: the Nile valley","area"],[[[25,25]],"Dispersed: the Sahara","area"]];
  s.body="Density is how many per unit of area. Concentration is how close together they sit: clustered or dispersed. Pattern is their arrangement: lines, grids, rings. Egypt’s people cluster in a line along the Nile: drag the ruler, Aswan to Cairo is about 680 km of crowded valley, often only a few kilometres wide.";
  s.more="Pattern shows in the US Great Plains too: the Land Ordinance of 1785 divided much of the interior into square-mile sections, so farms and roads form a grid."});
}
/* ───────── Unit 1: Data, regions and environment ───────── */
if(T("hg1b")&&!T("hg1b").steps._polI){T("hg1b").steps._polI=1;
 set("hg1b","Data, regions and environment",s=>{s.phPins=[ph([-0.137,51.513],"Soho: John Snow’s pump","John Snow's pump, Broadwick Street.jpg"),ph([-62.5,-10.5],"Rondônia: seen from space","Aerial view of the Amazon Rainforest.jpg"),
  ph([10,23],"The Sahara: a formal region","Sahara satellite hires.jpg"),ph([59.02,43.77],"Moynaq: the shrinking Aral Sea","Stranded ships at Moynaq, Aral Sea.jpg"),
  ph([103.86,1.29],"Singapore: hot and rich","Puente Helix, Marina Bay, Singapur, 2023-08-16, DD 144-146 HDR.jpg"),ph([-77.01,38.89],"Washington: census seats","United States Capitol.jpg")]});
 set("hg1b","Counting everyone",s=>{s.pins=[[[-76.93,38.85],"Suitland, Maryland: the Census Bureau","point"]];
  s.body="A census is an official count of a whole population, usually with questions on age, household, work and origin. It is the basis of most population maps, and of the city sizes behind the city dots switched on here."});
 set("hg1b","Formal and functional regions",s=>{s.gfRuler={a:[-16,21],b:[37,21]};
  s.body="A formal region shares one measurable trait: the Sahara’s desert climate, or the area where French is spoken. Drag the ruler: the Sahara stretches about 5,500 km from the Atlantic to the Red Sea. A functional region is tied to a centre by links, such as everyone who commutes into London."});
 set("hg1b","Does nature decide?",s=>{s.on=["grid"]});
 set("hg1b","People adapt nature",s=>{s.gfSea=2;s.gfSeaUI=true;
  s.body="About a quarter of the Netherlands lies below sea level. The sea is raised 2 m here to show the land the dykes protect: move the slider. The Dutch built dykes, pumped out lakes and made new land: Flevoland was reclaimed from the sea between the 1950s and 1968."});
}
/* ───────── Unit 2: Where people live ───────── */
if(T("hg2a")&&!T("hg2a").steps._polI){T("hg2a").steps._polI=1;
 set("hg2a","Where people live",s=>{s.phPins=[ph([139.7,35.69],"Tokyo","Tokyo Shibuya Scramble Crossing 2021-04-27.jpg"),ph([31.24,30.04],"Cairo: the Nile","Cairo skyline, Nile River, Egypt.jpg"),
  ph([88,31],"Tibet: almost empty","Tibetan Plateau landscape.jpg"),ph([106.9,47.92],"Ulaanbaatar","Ulaanbaatar skyline from Sukhbaatar square in 2025.jpg"),
  ph([106.85,-6.2],"Jakarta, Java","Jakarta Panorama.jpg"),ph([-47.88,-15.79],"Brasília","Catedral Metropolitana de Brasília - Brasília - 20150603150521.jpg"),ph([5.3,52.37],"Amsterdam","Water reflection of canal houses at blue hour in Damrak Amsterdam the Netherlands.jpg")]});
 set("hg2a","The big clusters",s=>{s.on=["cities"];
  s.body="East Asia (eastern China, Japan, Korea) and South Asia (India, Pakistan, Bangladesh) are the two largest clusters: the darkest areas on the map. Europe and the eastern United States are smaller; West Africa is growing fast."});
 set("hg2a","Coasts and rivers",s=>{s.on=["rivers"]});
 set("hg2a","Arithmetic density",s=>{s.ghosts=[{code:"bd",at:[103,46.5],col:"#8a63cf",label:"Bangladesh, true size"}];
  s.body="Arithmetic density is total people divided by total land area. Bangladesh packs about 175 million people into an area the size of England and Wales; Mongolia, over ten times larger, has about 3.5 million. Drag Bangladesh, in purple at its true size, around Mongolia."});
 set("hg2a","Pulling people inland",s=>{s.lines=[];s.gfRuler={a:[-43.2,-22.9],b:[-47.88,-15.79]};
  s.body="Most Brazilians lived along the Atlantic coast. Brasília was built in the empty interior to draw people, roads and investment inland: drag the ruler, it is about 930 km from Rio. Today its metropolitan area holds over four million people."});
}
/* ───────── Unit 2: Models of population ───────── */
if(T("hg2b")&&!T("hg2b").steps._polI){T("hg2b").steps._polI=1;
 set("hg2b","Models of population",s=>{s.phPins=[ph([2.1,13.5],"Niger: about six children per woman","A village in Niger.jpg"),ph([126.98,37.52],"Seoul: under one","Yeouido Han River Seoul Bamseom Pixabay 1602524.jpg"),
  ph([139.7,35.69],"Tokyo: an ageing city","Tokyo traffic (9412150126).jpg"),ph([90.4,23.8],"Dhaka: from six to two","Garment workers rally in Dhaka.jpg"),
  ph([7.99,16.97],"Agadez, Niger","Niger, Agadez (28), grand mosque, old city.jpg"),ph([116.4,39.93],"Beijing: old before rich","Old men playing cards in a Beijing hutong.jpg")]});
 set("hg2b","Births, deaths and natural increase",s=>{s.ix="rni"});
 set("hg2b","Fertility and replacement",s=>{s.sub="fert/f1+f2";
  s.more="The map now shows only countries below replacement level. Together they hold about two-thirds of humanity, including China, India and almost all of Europe and the Americas."});
 set("hg2b","Stage 3: births fall",s=>{s.sub="fert/f3+f4";
  s.more="The map shows the countries with 2.1 to 4.5 children per woman, roughly stage 3. The fall can be fast: Bangladesh went from about six children per woman in the 1970s to about two today."});
 set("hg2b","Population pyramids",s=>{s.ix="pyramid";
  s.body="A wide base means many children and fast growth: Niger’s median age is about 15. Straight sides mean slow growth: the United States. A narrow base and heavy top mean decline: Japan’s median age is about 49. Shape your own pyramid below."});
 set("hg2b","The dependency ratio",s=>{s.sub="age/a1+a4";
  s.body="The dependency ratio compares children and the elderly with people aged 15 to 64. The map shows only the youngest countries (median age under 20) and the oldest (over 40). Niger’s ratio is high because of children; Japan’s because of old people."});
}
/* ───────── Unit 2: Population futures ───────── */
if(T("hg2d")&&!T("hg2d").steps._polI){T("hg2d").steps._polI=1;
 set("hg2d","Population futures",s=>{s.phPins=[ph([19.05,47.51],"Budapest: paying for births","Budapest Parliament 4604.JPG"),ph([-79.38,43.65],"Toronto: migrants fill the gap","Sunset Toronto Skyline Panorama Crop from Snake Island.jpg"),
  ph([139.7,35.69],"Tokyo: nearly three in ten over 65","Tokyo traffic (9412150126).jpg"),ph([116.4,39.93],"Beijing: a shrinking China","Old men playing cards in a Beijing hutong.jpg"),
  ph([102.8,23.1],"Yunnan: more people, more terraces","Terrace field yunnan china denoised.jpg"),ph([2.1,13.5],"Niger: still growing fast","A village in Niger.jpg")]});
 set("hg2d","Pronatalist policies",s=>{s.stat="South Korea has spent over $200 billion since 2006 trying to raise its birth rate"});
 set("hg2d","Choosing who comes in",s=>{s.sub="mig/m4+m5";
  s.more="The map shows the countries where over one in ten people was born abroad: Canada, Australia, the Gulf states and much of Europe. Japan, in pale, is not among them."});
 set("hg2d","An ageing world",s=>{s.sub="age/a4";
  s.more="The map shows only the countries with a median age over 40: almost all of Europe, plus Japan, South Korea, Canada and Cuba. Most of Africa’s median ages are under 20."});
}
/* ───────── Unit 2: Why people move ───────── */
if(T("hg2c")&&!T("hg2c").steps._polI){T("hg2c").steps._polI=1;
 set("hg2c","Why people move",s=>{s.phPins=[ph([-117.1,32.54],"Tijuana–San Diego","Border Wall at Tijuana and San Diego Border.jpg"),ph([-0.38,51.51],"Southall, London","The Broadway, Southall - DSC07009.JPG"),
  ph([55.14,25.08],"Dubai: built by migrants","Dubai Marina Skyline.jpg"),ph([36.32,32.29],"Zaatari camp, Jordan","Zaatari Refugee Camp John Green 18.png"),
  ph([116.32,39.89],"Beijing West station","North 1F entrance of Beijing West Railway Station (20180201144216).jpg"),ph([3.4,6.45],"Lagos","Lagos skyline.jpg")]});
 set("hg2c","Push and pull",s=>{s.lines=[];s.gfRuler={a:[-99.13,19.43],b:[-118.24,34.05]};
  s.body="Push factors drive people out: war, poverty, persecution, drought. Pull factors draw them in: jobs, safety, family. Mexico to the United States has been one of the world’s largest flows for decades, driven by much higher wages. Drag the ruler: Mexico City to Los Angeles is about 2,500 km."});
 set("hg2c","Obstacles and opportunities",s=>{s.lines=[];s.gfRuler={a:[13.19,32.89],b:[12.6,35.5]};
  s.body="Everett Lee added intervening obstacles: distance, cost, borders, seas. Drag the ruler: Tripoli to the Italian island of Lampedusa is only about 300 km, yet the crossing has drowned thousands. An intervening opportunity, such as a job on the way, can end the journey early."});
 set("hg2c","Brain drain",s=>{s.lines=[];s.gfRuler={a:[3.4,6.45],b:[-0.12,51.5]};
  s.body="Brain drain is the loss of skilled people, trained at home, who leave for better pay abroad: drag the ruler, Lagos to London is about 5,000 km. It leaves hospitals short in the sending country. Return migrants can bring back skills and savings: brain gain."});
}
/* ───────── Unit 3: How culture spreads ───────── */
if(T("hg3a")&&!T("hg3a").steps._polI){T("hg3a").steps._polI=1;
 set("hg3a","How culture spreads",s=>{s.phPins=[ph([46.1,30.96],"Mesopotamia: a hearth","Ancient ziggurat at Ali Air Base Iraq 2005.jpg"),ph([39.83,21.42],"Mecca","Pilgrims begin this year's Hajj rituals with a circumambulation of the Kaaba (2025) (2).jpg"),
  ph([-4.78,37.88],"Córdoba","View to the Great Mosque from the Lions Tower of the Alcázar de los Reyes Cristianos. Cordoba, Spain.jpg"),ph([66.98,39.65],"Samarkand","Registan 01.jpg"),
  ph([127.03,37.5],"Seoul: K-pop","Gangnam Style flash mob in Seoul.jpg"),ph([9.19,45.47],"Milan: fashion","Galleria Milano (179532365).jpeg")]});
 set("hg3a","Relocation diffusion",s=>{s.sub="lang/rom+ger"});
 set("hg3a","Expansion diffusion",s=>{s.gfRuler={a:[39.83,21.42],b:[-4.78,37.88]};
  s.body="In expansion diffusion a trait grows outward from its hearth without leaving it. Islam spread from Mecca after 632; within about a century it reached from Spain to Central Asia, yet Arabia stayed its heartland. Drag the ruler: Mecca to Córdoba is about 4,600 km."});
 set("hg3a","Trade carries faith",s=>{s.on=["connections"];
  s.body="Buddhism travelled from India along the Silk Road and reached China by about the 1st century CE. Muslim traders sailing the Indian Ocean, along the sea lanes still shown here, carried Islam east: Indonesia, never conquered by Arab armies, now has more Muslims than any other country."});
 set("hg3a","A shrinking world",s=>{s.on=["connections"];s.lines=[];
  s.body="Time–space compression means places feel closer as travel and communication speed up. In 1850 news took months to sail from London to Sydney; today flights and undersea cables, shown on the map, carry a video posted in London to Sydney in seconds. Distance slows diffusion far less than before."});
}
/* ───────── Unit 3: Cultural landscapes ───────── */
if(T("hg3b")&&!T("hg3b").steps._polI){T("hg3b").steps._polI=1;
 set("hg3b","Cultural landscapes",s=>{s.phPins=[ph([102.8,23.1],"Yunnan: rice terraces","Terrace field yunnan china denoised.jpg"),ph([83.01,25.3],"Varanasi: sacred ghats","Varanasi Munshi Ghat3.jpg"),
  ph([-4.78,37.88],"Córdoba: mosque and cathedral","Great Mosque of Cordoba, interior, 8th - 10th centuries (38) (29721130342).jpg"),ph([-73.99,40.76],"Times Square","Times Square at Night with crowds of people.jpg"),
  ph([103.84,1.28],"Singapore’s Chinatown","Singapore (SG), China Town -- 2019 -- 4524.jpg"),ph([-5.95,54.6],"Belfast: peace walls","Belfast peace wall.jpg"),ph([-76.3,40.04],"Amish country","Amish buggy.jpg")]});
 set("hg3b","Folk and popular culture",s=>{s.gfRuler={a:[-76.3,40.04],b:[-75.16,39.95]};
  s.body="Folk culture belongs to small, often rural groups and changes slowly: many Amish in Pennsylvania still farm with horses and dress plainly, only about 100 km from Philadelphia (drag the ruler). Popular culture spreads quickly through cities and media, so jeans and smartphones look the same from Lagos to Lima."});
 set("hg3b","Two ways of judging",s=>{s.more="Coffee is another example: in Ethiopia a coffee ceremony, with beans roasted and brewed in front of guests, can take an hour and is a mark of respect, not slowness."});
 set("hg3b","Terraces on the mountains",s=>{s.view=[95,14,115,30];s.globe=[103,23,4];delete s.spin;
  s.xsec={title:"Across the Hani terraces of Yuanyang",pts:[[102.83,23.24,"Red River valley"],[102.8,23.19],[102.78,23.15,"Yuanyang (Xinjie)"],[102.76,23.1],[102.76,23.06],[102.75,23.01]],mark:1000,
   note:"The dashed line marks 1,000 m. Over a few kilometres the land climbs from the hot Red River valley to cool, misty ridges; the Hani cut terraces into most of the slope between. The chart’s smoothed heights round off the steepest drops."};
  s.body="In southern China, the Philippines and Bali, farmers cut steep slopes into flat terraces that hold water for rice. Move along the chart: in Yunnan the Honghe Hani terraces climb from a deep river valley to ridges well over 1,000 m. They and the Banaue terraces in the Philippines are UNESCO World Heritage Sites."});
 set("hg3b","Layers of history",s=>{s.gfRuler={a:[36.31,33.51],b:[-4.78,37.88]};
  s.body="Sequent occupance means a place is shaped by a series of cultures, each leaving a layer. Córdoba’s mosque was begun in 785 by an Umayyad prince who fled Damascus, about 3,700 km away (drag the ruler); in the 1500s a Christian cathedral was built inside it. Istanbul’s Hagia Sophia was a church, a mosque, a museum, and became a mosque again in 2020."});
}
/* ───────── Unit 3: Religion, language and change ───────── */
if(T("hg3c")&&!T("hg3c").steps._polI){T("hg3c").steps._polI=1;
 set("hg3c","Religion, language and change",s=>{s.phPins=[ph([110.2,-7.61],"Borobudur, Java","Borobudur-Temple-Park Indonesia Stupas-of-Borobudur-12.jpg"),ph([139.7,35.68],"Tokyo: Shinto","The entrance to Meiji Jingu- a Shinto Shrine in Tokyo, Japan.jpg"),
  ph([39.19,-6.16],"Zanzibar: Swahili","Dhow Zanzibar-7.jpg"),ph([-72.33,18.54],"Haiti: Creole","Kolore Tap-Tap nan Port au Prince - panoramio.jpg"),
  ph([-99.13,19.43],"Mexico City: Day of the Dead","Ofrenda Día de Muertos Zócalo 2014.jpg"),ph([-157.86,21.3],"Hawaii: Austronesian","Hokule'a.jpg"),ph([-0.38,51.51],"Southall, London","The Broadway, Southall - DSC07009.JPG")]});
 set("hg3c","Indo-European languages",s=>{s.sub="lang/ger+rom+sla+ieo+iir";s.gfRuler={a:[40,48],b:[77.2,28.6]};
  s.body="A language family shares a distant ancestor. Indo-European, coloured on the map, includes English, Spanish, Hindi, Russian and Persian. A leading theory places its hearth on the steppes north of the Black Sea, from where it spread about 5,000 years ago: drag the ruler, it is about 3,800 km to Delhi."});
 set("hg3c","Other language families",s=>{s.sub="lang/st+nc+an";s.gfRuler={a:[121,23.7],b:[174.78,-41.29]};
  s.body="Sino-Tibetan includes Chinese, the language with the most native speakers. Niger-Congo covers most of Africa south of the Sahara, including Swahili and Yoruba. Austronesian spread by canoe from Taiwan to Madagascar, Hawaii and New Zealand: drag the ruler, Taiwan to New Zealand alone is about 9,100 km."});
}
/* ───────── Unit 4: States, nations and boundaries ───────── */
if(T("hg4a")&&!T("hg4a").steps._polI){T("hg4a").steps._polI=1;
 set("hg4a","States, nations and boundaries",s=>{s.phPins=[ph([-73.97,40.75],"UN headquarters, New York","United Nations General Assembly Hall (3).jpg"),ph([-3.2,55.95],"Edinburgh: a nation in a state","Castle, City of Edinburgh (IMG 20190628 180330).jpg"),
  ph([126.68,37.96],"The Korean DMZ","DMZ AT PANMUNJOM DPRK (NORTH KOREA)OCT 2012 (8157355503).jpg"),ph([-114,49],"The 49th parallel","International Boundary (4499904895).jpg"),
  ph([13.38,52.52],"Berlin: a relic boundary","BerlinWall-BrandenburgGate.jpg"),ph([121.56,25.04],"Taipei","Presidential Office Building, Taipei.jpg")]});
 set("hg4a","Sovereignty",s=>{s.gfRuler={a:[119.79,25.5],b:[120.95,24.85]};
  s.body="Sovereignty is a state’s control over its own territory without outside interference, and it depends on other states recognising it. Taiwan governs itself fully, with its own army and elections, but only about a dozen states formally recognise it. Drag the ruler: the Taiwan Strait is about 130 km wide at its narrowest."});
 set("hg4a","Antecedent boundaries",s=>{s.lines=[];s.gfRuler={a:[-95.15,49],b:[-123.3,49]};
  s.body="An antecedent boundary is drawn before an area is heavily settled. From Lake of the Woods to the Pacific, about 2,000 km (drag the ruler), the US–Canada border follows the 49th parallel, agreed in 1818 and 1846, when the land was home mainly to Indigenous peoples."});
 set("hg4a","Geometric boundaries",s=>{s.gfRuler={a:[25,22],b:[36.9,22]};
  s.body="A geometric boundary ignores rivers and mountains and follows a straight line. Egypt’s border with Sudan follows the 22nd parallel for about 1,200 km (drag the ruler); its border with Libya runs close to the 25th meridian. Straight lines cluster where borders were drawn by distant officials."});
}
/* ───────── Unit 4: Forces that bind and divide ───────── */
if(T("hg4b")&&!T("hg4b").steps._polI){T("hg4b").steps._polI=1;
 set("hg4b","Forces that bind and divide",s=>{s.phPins=[ph([139.7,35.68],"Japan: centripetal","The entrance to Meiji Jingu- a Shinto Shrine in Tokyo, Japan.jpg"),ph([4.35,50.85],"Brussels: a divided Belgium","Edificios en la Grand-Place, Bruselas, Bélgica, 2021-12-15, DD 184-186 HDR.jpg"),
  ph([-3.2,55.95],"Edinburgh: devolution","Castle, City of Edinburgh (IMG 20190628 180330).jpg"),ph([-71.21,46.81],"Quebec","Chateau Frontenac at dusk in Quebec City.jpg"),
  ph([114.17,22.3],"Hong Kong","Hong Kong Harbour Night 2019-06-11.jpg"),ph([17.81,43.34],"Mostar","Mostar Old Town Panorama 2007.jpg"),ph([45.34,2.05],"Mogadishu","Lido Beach 2023.jpg")]});
 ins("hg4b","Centrifugal forces",{title:"Size and distance from the capital",view:[15,30,190,78],globe:[90,58,1.3],card:"left",sub:"fed",hi:["ru"],on:["timezones"],
  gfRuler:{a:[37.62,55.75],b:[131.89,43.12]},
  pins:[[[37.62,55.75],"Moscow","point"],[[131.89,43.12],"Vladivostok","point"]],
  stat:"Russia spans 11 time zones: Vladivostok is about 6,400 km from Moscow",
  body:"Distance from the capital can be a centrifugal force: far-off regions are harder to govern and can feel neglected. When Moscow’s working day ends at 6 pm, it is already 3 am in Kamchatka. Drag the ruler from Moscow to the Pacific.",
  more:"States bind distant regions with transport and media. The Trans-Siberian Railway, finished in 1916, still takes about a week from Moscow to Vladivostok.",
  ap:"Unit 4 · territorial size and centrifugal forces"});
 set("hg4b","Autonomous regions",s=>{s.ghosts=[{code:"dk",at:[-42,72],col:"#8a63cf",label:"Denmark, true size"}];
  s.body="An autonomous region governs many of its own affairs while staying part of a state. Hong Kong returned to China in 1997 under “one country, two systems”. Greenland has wide self-government within the Kingdom of Denmark: drag Denmark, in purple at its true size, across it."});
}
/* ───────── Unit 4: Empires, power and unions ───────── */
if(T("hg4c")&&!T("hg4c").steps._polI){T("hg4c").steps._polI=1;
 set("hg4c","Empires, power and unions",s=>{s.phPins=[ph([44.06,9.56],"Hargeisa: independence, 1960","Somaliland independence 26 June 1960.jpg"),ph([32.58,30.0],"Suez Canal","Container Ship 'Ever Given' stuck in the Suez Canal, Egypt - March 24th, 2021 cropped.jpg"),
  ph([7.77,48.6],"Strasbourg: European Parliament","European Parliament Strasbourg Hemicycle - Diliff.jpg"),ph([4.42,50.88],"Brussels: NATO","2018 NATO Summit in Brussels (29510554308).jpg"),
  ph([38.75,9.03],"Addis Ababa: African Union","African Union Headquarters Addis Ababa.jpg"),ph([-73.97,40.75],"New York: the UN","United Nations General Assembly Hall (3).jpg")]});
 set("hg4c","Colonialism and imperialism",s=>{s.ghosts=[{code:"be",at:[23.5,-3],col:"#8a63cf",label:"Belgium, true size"}];
  s.body="Imperialism is extending a state’s power over other lands; colonialism is settling and ruling them. By 1914 European powers ruled about 90% of Africa; only Ethiopia and Liberia stayed independent. The purple shape is Belgium at its true size: its king, Leopold II, once owned the Congo, about 76 times larger."});
 set("hg4c","Choke points",s=>{s.on=["connections"];
  s.body="A choke point is a narrow passage that is easy to block: the shipping lanes on the map all squeeze through a few of them. About a fifth of the world’s oil passes through the Strait of Hormuz. In 2021 the stuck ship Ever Given closed the Suez Canal for six days, holding up hundreds of ships."});
}
/* ───────── Unit 4: Lines on land, sea and ballot ───────── */
if(T("hg4d")&&!T("hg4d").steps._polI){T("hg4d").steps._polI=1;
 set("hg4d","Lines on land, sea and ballot",s=>{s.phPins=[ph([-117.1,32.54],"Tijuana–San Diego","Border Wall at Tijuana and San Diego Border.jpg"),ph([126.68,37.96],"The Korean DMZ","Demilitarized Zone (DMZ) Joint Security Area (JSA) Looking Into North Korea (28819154694).jpg"),
  ph([1.36,51.13],"Dover: borders at sea","Dover White Cliffs 4.jpg"),ph([-73,-51],"Chile: 4,300 km long","A view towards Torres Del Paine.jpg"),
  ph([28.2,-29.6],"Lesotho: an enclave","Lesotho mountain village (5285775857).jpg"),ph([12.45,41.9],"Vatican City","Vatican City and St. Peter Square evening twilight aerial view.jpg"),ph([-67.5,-19.5],"Bolivia: landlocked","Colors of Altiplano Boliviano 4340m Bolivia Luca Galuzzi 2006.jpg")]});
 set("hg4d","Borders at sea",s=>{s.view=[-3.6,49.3,5.6,52.9];s.globe=[1.4,51,6];s.gfRuler={a:[1.31,51.12],b:[1.58,50.87]};
  s.body="The UN Convention on the Law of the Sea (UNCLOS, 1982) gives each coastal state a territorial sea of 12 nautical miles, about 22 km, treated almost like land. Drag the ruler: the Strait of Dover is only about 33 km wide, so Britain’s and France’s territorial seas meet in the middle. Foreign ships may still pass through peacefully."});
 set("hg4d","Exclusive economic zones",s=>{s.gfRuler={a:[109.2,12.2],b:[112.61,12.2]};
  s.body="In its exclusive economic zone (EEZ), reaching 200 nautical miles (about 370 km, the ruler’s length) from the coast, a state alone may fish, drill and mine. In the South China Sea, China’s broad claim overlaps the EEZs of Vietnam, the Philippines, Malaysia and Brunei."});
 set("hg4d","Compact and elongated states",s=>{s.ghosts=[{code:"cl",at:[12,46],col:"#8a63cf",label:"Chile, true size"}];
  s.body="A compact state, roughly round like Rwanda or Poland, has all its regions close to the centre. An elongated state stretches thin: Chile is over 4,000 km long but on average under 200 km wide, which makes transport and defence harder. The purple shape is Chile at its true size: drag it over Europe."});
}
/* ───────── Unit 5: How the world farms ───────── */
if(T("hg5a")&&!T("hg5a").steps._polI){T("hg5a").steps._polI=1;
 set("hg5a","How the world farms",s=>{s.phPins=[ph([102.8,23.1],"Yunnan: rice terraces","Terrace field yunnan china denoised.jpg"),ph([102.6,19.9],"Laos: wet rice","Water reflection of a boy feeding hay to a cow in a paddy field at golden hour in Laos.jpg"),
  ph([31.75,5.43],"South Sudan: herders","Campamento de ganado de la tribu Mundari, Terekeka, Sudán del Sur, 2024-01-28, DD 155.jpg"),ph([80.7,7],"Sri Lanka: tea","Sri Lanka-Tea plantation-15.jpg"),
  ph([18.42,-34.03],"Cape Town: vineyards","Constantia Winelands Cultural Landscape. Buitenverwachting and Vineyards.jpg"),ph([-93.5,42],"Iowa: maize and pigs","Iowa farm.jpg")]});
 set("hg5a","The Columbian Exchange",s=>{s.lines=[];s.gfRuler={a:[-5.99,37.39],b:[-96.13,19.2]};
  s.body="Maize, potatoes, tomatoes, cassava and cacao went from the Americas to Europe, Africa and Asia. Wheat, sugar cane, coffee, cattle and horses went west, with diseases such as smallpox that killed most of the Indigenous population. Drag the ruler: Seville to Veracruz, Spain’s main route, is about 8,700 km."});
 set("hg5a","Subsistence and commercial",s=>{s.sub="farm/w1+w5";
  s.body="Subsistence farmers grow food mainly for their own families, mostly in poorer countries. Commercial farmers grow crops and animals to sell, usually on large, mechanised farms. The map shows only the two extremes: where over half of workers farm, as in Ethiopia, and where under one in twenty do, as in the United States."});
 set("hg5a","Intensive farming",s=>{s.sub="farm/w3+w4+w5";
  s.more="It feeds the densest rural populations on Earth, in the river deltas of Bangladesh, Vietnam and southern China. The map shows only countries where over 15% of workers farm."});
}
/* ───────── Unit 5: Models of rural land ───────── */
if(T("hg5b")&&!T("hg5b").steps._polI){T("hg5b").steps._polI=1;
 set("hg5b","Models of rural land",s=>{s.phPins=[ph([4.25,52.0],"Westland: greenhouses","Westland greenhouse.webp"),ph([-93.5,42],"Iowa: the grid","Iowa farm.jpg"),
  ph([1.03,52.45],"Norfolk: old fields","Banham village from the air.jpg"),ph([-71.21,46.81],"Quebec: long lots","Chateau Frontenac at dusk in Quebec City.jpg"),
  ph([75.85,30.9],"Punjab: the Green Revolution","Wheat field in Punjab.jpg"),ph([-98.5,38.5],"Kansas: wheat","Combine harvesting wheat.jpg")]});
 set("hg5b","Rent falls with distance",s=>{s.ix="bidrent"});
 set("hg5b","Why the rings bend",s=>{s.on=["rivers"];s.lines=[];s.gfRuler={a:[9.99,53.55],b:[11.63,52.13]};
  s.body="Von Thünen himself added a navigable river: because shipping is cheap, each ring stretches along it, like the Elbe here, about 190 km from Magdeburg to Hamburg in a straight line (drag the ruler). Railways did the same in the 1800s, letting wheat from the American prairies reach European cities."});
 set("hg5b","Long lots",s=>{s.on=["rivers"]});
}
/* ───────── Unit 5: Food in a global system ───────── */
if(T("hg5c")&&!T("hg5c").steps._polI){T("hg5c").steps._polI=1;
 set("hg5c","Food in a global system",s=>{s.sub="export/food";
  s.phPins=[ph([75.85,30.9],"Punjab: wheat","Wheat field in Punjab.jpg"),ph([-5.5,7.5],"Côte d’Ivoire: cocoa","Breaking open cocoa pods in Ivory Coast.png"),
  ph([-75.6,4.8],"Colombia: coffee","Coffee tree in Hacienda Guayabal, Colombia.jpg"),ph([3.95,49.1],"Champagne","Marne Hautvillers Forets et Vignes 22062016 - panoramio.jpg"),
  ph([23.5,-3],"DR Congo: women farmers","Women farmers in DR Congo.jpg"),ph([-93.5,42],"Iowa: maize and soy","Iowa farm.jpg")];
  s.body="Modern farming is tied to world markets, big companies and international aid. The map shows the countries whose main export is food. This tour follows the Green Revolution, the chains that carry food to shops, the countries that live off exports, and the fight against hunger."});
 set("hg5c","From farm to supermarket",s=>{s.on=["connections"];s.lines=[];
  s.body="Agribusiness joins farming to the firms that supply seeds and machines and those that process, ship and sell food. A commodity chain links a banana grown in Ecuador, the world’s largest banana exporter, to a supermarket in Germany: refrigerated ships carry it about 10,000 km along the shipping lanes on the map."});
 set("hg5c","Living off exports",s=>{s.sub="export/food"});
 set("hg5c","Feeding eight billion",s=>{s.sub="poverty";
  s.more="The map shows the share of people in extreme poverty: hunger is worst where poverty and conflict meet. Roughly a third of all food is lost or wasted between farm and fork."});
}
/* ───────── Unit 5: Farming and the planet ───────── */
if(T("hg5d")&&!T("hg5d").steps._polI){T("hg5d").steps._polI=1;
 set("hg5d","Farming and the planet",s=>{s.phPins=[ph([-63,-10.5],"Rondônia: cleared forest","SOBREVVO EM RONDONIA DIA 07-08-2020 (FOTO BRUNO KELLY) (62) (50224604772).jpg"),ph([-0.03,14.03],"Dori, Burkina Faso","Dori BurkinaFaso.png"),
  ph([59.02,43.77],"Moynaq: the lost Aral Sea","Stranded ships at Moynaq, Aral Sea.jpg"),ph([121.06,16.92],"Banaue terraces","Banaue Philippines Ifugao-Tribesman-01.jpg"),
  ph([14.51,46.05],"Ljubljana market","Grape tomatoes on the vine at Ljubljana Central Market.JPG"),ph([-82.38,23.13],"Havana: city farms","Urban farm in Havana.jpg")]});
 set("hg5d","Spreading deserts",s=>{s.gfRuler={a:[-17.45,14.7],b:[43.15,11.6]};
  s.more="The Great Green Wall aims to restore a belt of land across Africa from Senegal to Djibouti: drag the ruler, its two ends are about 6,500 km apart, and the planned belt itself is about 8,000 km long."});
 set("hg5d","Draining the water",s=>{s.ghosts=[{code:"ie",at:[60,45],col:"#8a63cf",label:"Ireland, true size"}];
  s.body="From the 1960s Soviet planners diverted the Amu Darya and Syr Darya to grow cotton, and the Aral Sea, once the world’s fourth-largest lake, largely dried up. In 1960 it covered about 68,000 km², a little less than the Republic of Ireland, shown in purple: drag it."});
 set("hg5d","Dead zones",s=>{s.on=["rivers"];s.lines=[];
  s.body="Nitrogen and phosphorus from Corn Belt fields flow down the Mississippi, shown on the map, to the Gulf of Mexico. They feed algae blooms that rot and use up the oxygen, leaving a summer dead zone, often over 10,000 square kilometres, where fish cannot live."});
 set("hg5d","Changing diets",s=>{s.on=["connections"];s.lines=[];
  s.body="As incomes rise, diets shift from grains to meat, dairy and oils. China eats over a quarter of the world’s meat and imports about 60% of the world’s traded soybeans, many shipped from Brazil along the sea lanes on the map, to feed its pigs."});
}
/* ───────── Unit 6: A world of cities ───────── */
if(T("hg6a")&&!T("hg6a").steps._polI){T("hg6a").steps._polI=1;
 set("hg6a","A world of cities",s=>{s.phPins=[ph([139.7,35.66],"Tokyo","Tokyo Shibuya Scramble Crossing 2021-04-27.jpg"),ph([28.98,41.01],"Istanbul","Sultanahmet ferry on the Bosphorus in Istanbul, Turkey 001.jpg"),
  ph([3.4,6.45],"Lagos","Lagos skyline.jpg"),ph([-74.01,40.71],"New York","Lower Manhattan from Jersey City November 2016 002.jpg"),
  ph([100.49,13.74],"Bangkok: a primate city","Templo Wat Arun, Bangkok, Tailandia, 2013-08-22, DD 30.jpg")];});
 set("hg6a","Megacities",s=>{s.on=["cities"]});
 set("hg6a","Megalopolis and metacity",s=>{s.lines=[];s.gfRuler={a:[-71.06,42.36],b:[-77.04,38.9]};
  s.body="A megalopolis is a chain of cities grown together. “BosWash”, from Boston through New York and Philadelphia to Washington, about 630 km (drag the ruler), holds about 50 million people. Japan’s corridor from Tokyo to Osaka is another. A metacity has over 20 million people."});
 set("hg6a","World cities",s=>{s.on=["connections"];
  s.more="They connect more closely to each other than to their own countryside: the flight paths and undersea cables on the map tie them together, and a London banker may deal more with New York than with towns nearby."});
 set("hg6a","The gravity model",s=>{s.gfRuler={a:[-74,40.7],b:[-87.63,41.88]};
  s.body="The gravity model predicts the interaction between two places: multiply their populations and divide by the distance between them squared. Drag the ruler: Chicago is about 1,150 km from New York, Denver about 2,600 km, so far more people travel between New York and Chicago."});
}
/* ───────── Unit 6: Inside the city ───────── */
if(T("hg6b")&&!T("hg6b").steps._polI){T("hg6b").steps._polI=1;
 set("hg6b","Inside the city",s=>{s.phPins=[ph([-87.64,41.88],"Chicago","Sears Tower, Wacker Drive and Jackson Boulevard, Chicago, IL - 54189600901.jpg"),ph([-118.25,34.05],"Los Angeles","Downtown Los Angeles skyline from Toy District.jpg"),
  ph([-99.13,19.43],"Mexico City","Mexico City Zocalo and Cathedral c 1950s, MAF 007305-001.jpg"),ph([3.39,6.45],"Lagos","Lagos skyline.jpg"),
  ph([106.83,-6.2],"Jakarta","Jakarta Panorama.jpg"),ph([-74.01,40.71],"New York","Lower Manhattan from Jersey City November 2016 002.jpg")];
  s.body="Each city is unique, but patterns repeat: business centres, industrial zones, rich and poor districts and suburbs. This tour sets each classic model beside a real city. The satellite map shows each city’s setting; the diagrams and photos show its inside."});
 set("hg6b","Land rent and density",s=>{
  s.more="On the population map the darkest cells, over 5,000 people per km², sit at the centre; colours fade as density falls away towards the suburbs."});
}
/* ───────── Unit 6: Building better cities ───────── */
if(T("hg6c")&&!T("hg6c").steps._polI){T("hg6c").steps._polI=1;
 set("hg6c","Building better cities",s=>{s.phPins=[ph([121.47,31.23],"Shanghai: a new metro","Type 1 \"Watermelon\" Train of Line 2 leaving Yuandong Avenue Station, Shanghai Metro, Aug 11 2023.jpg"),ph([-0.016,51.543],"London: a brownfield park","Queen Elizabeth Olympic Park.jpg"),
  ph([-77.23,38.92],"Tysons: an edge city","Tysons Corner, Virginia.jpg"),ph([-96.95,32.81],"Texas suburbs","Suburbs of Irving, Texas.jpg"),
  ph([-122.68,45.52],"Portland: smart growth","Portland Streetcar.jpg"),ph([-86.13,30.32],"Seaside: new urbanism","Seaside, Florida.jpg")]});
 set("hg6c","Urban sprawl",s=>{
  s.more="Sprawl raises traffic, emissions and the cost of pipes and roads for each household. On the population map Atlanta shows as a wide, pale smudge, not a dark core."});
}
/* ───────── Unit 6: Cities under pressure ───────── */
if(T("hg6d")&&!T("hg6d").steps._polI){T("hg6d").steps._polI=1;
 set("hg6d","Cities under pressure",s=>{s.phPins=[ph([-76.61,39.29],"Baltimore","Baltimore row houses.jpg"),ph([-73.96,40.71],"Brooklyn","Williamsburg, Brooklyn.jpg"),
  ph([3.4,6.5],"Lagos","2010 traffic Lagos Nigeria 4576800053.jpg"),ph([-43.19,-22.97],"Rio de Janeiro","Copacabana, Rio de Janeiro, Brazil.jpg"),
  ph([120.97,14.62],"Manila","Tondo Church, Manila, Philippines.jpg"),ph([106.79,-6.17],"Jakarta: floods","Banjir Jakarta Perumahan di Tanjung Duren 1 Januari 2020.jpg"),ph([-49.27,-25.43],"Curitiba: rapid buses","Bus stop tube, Curitiba.jpg")]});
 set("hg6d","Cities and climate",s=>{s.gfSea=2;s.gfSeaUI=true;
  s.body="Concrete and asphalt trap heat, creating an urban heat island. Coastal cities face rising seas: parts of northern Jakarta are sinking several centimetres a year as groundwater is pumped out, one reason Indonesia is building a new capital, Nusantara, on Borneo. Raise the sea with the slider."});
}
/* ───────── Unit 7: Measuring development ───────── */
if(T("hg7a")&&!T("hg7a").steps._polI){T("hg7a").steps._polI=1;
 set("hg7a","Measuring development",s=>{s.phPins=[ph([7.2,62.1],"Norway: very high HDI","Geirangerfjord from Ørnesvingen, 2013 June.jpg"),ph([3.38,6.52],"Lagos: informal work","A lady by the Lagos Jetty.jpg"),
  ph([90.4,23.8],"Dhaka: garment jobs","Garment workers rally in Dhaka.jpg"),ph([30.06,-1.95],"Kigali: women in parliament","Rwanda's parliament in session.jpg"),
  ph([6.5,4.8],"Niger Delta: oil","Oil spill in the Niger Delta.jpg"),ph([2.1,13.5],"Niger: low HDI","A village in Niger.jpg")]});
 set("hg7a","Dependency and commodity dependence",s=>{s.on=["resources"];
  s.body="Dependency theory argues that colonial trade patterns keep poor countries supplying raw materials to rich ones. Oil and gas earn most of Nigeria’s exports; copper earns about 70% of Zambia’s. The map’s resource symbols show where they come from. When prices crash, their budgets crash too."});
}
/* ───────── Unit 7: Industry and the global economy ───────── */
if(T("hg7b")&&!T("hg7b").steps._polI){T("hg7b").steps._polI=1;
 set("hg7b","Industry and the global economy",s=>{s.phPins=[ph([-2.24,53.48],"Manchester: the first factories","Newcomen atmospheric engine (Heat Engines, 1913).jpg"),ph([7.04,51.49],"The Ruhr: coal and steel","Zollverein Coal Mine, Essen.jpg"),
  ph([4.1,51.95],"Rotterdam: break of bulk","Shipping container stacks - Port of Rotterdam - 2017 - 6.jpg"),ph([-122.03,37.37],"Silicon Valley","Silicon Valley from above.jpg"),
  ph([1.36,43.63],"Toulouse: Airbus","Airbus A350 under assembly in Toulouse.jpg"),ph([77.66,12.98],"Bengaluru: IT services","Bagmane Tech Park, Bengaluru.jpg"),ph([-83.07,42.31],"Detroit","Ambassador Bridge from the Detroit River, Windsor, Ontario, 2025-07-27 03.jpg")]});
 set("hg7b","Industry spreads",s=>{s.on=["resources"];
  s.body="Belgium and the Ruhr in Germany industrialised in the early 1800s, then the north-eastern United States. Meiji Japan industrialised deliberately after 1868, opening the Yawata steelworks in 1901. Early factories clustered on coalfields, shown by the map’s resource symbols, because coal was bulky and costly to move."});
 set("hg7b","Bulk-reducing and bulk-gaining",s=>{s.gfRuler={a:[-68.9,-22.3],b:[-70.65,-33.45]};
  s.body="Copper ore is mostly waste rock, so it is smelted beside mines like Chuquicamata in Chile’s Atacama, about 1,250 km from Santiago (drag the ruler): a bulk-reducing industry. Bottling drinks adds heavy water, so bottling plants sit near the cities that drink them: bulk-gaining."});
 set("hg7b","Break-of-bulk points",s=>{s.on=["rivers"];s.lines=[];
  s.body="A break-of-bulk point is where goods are moved between ships, barges, trains or lorries. Rotterdam, Europe’s largest port, transfers ocean cargo onto barges bound up the Rhine, on the map, to the Ruhr. Industries that process imports, such as oil refineries, cluster there."});
 set("hg7b","The knowledge economy",s=>{s.on=["connections"];
  s.more="Undersea cables, shown on the map, carry its work round the world in an instant. In rich countries most workers are now in services, and the most valuable firms sell software and ideas."});
}
/* ───────── Unit 7: Trade and the world economy (moved to the Economy map, with its trade data) ───────── */
if(T("hg7c")&&!T("hg7c").steps._polI){const t=T("hg7c");t.steps._polI=1;
 try{def(t,"map",Object.assign({},t.map||{},{mode:"gdp"}))}catch(e){}
 const sub=(title,v)=>set("hg7c",title,s=>{s.sub=v});
 set("hg7c","Trade and the world economy",s=>{s.sub="trade";
  s.phPins=[ph([122.06,30.63],"Shanghai: Yangshan port","Shanghai-Yangshan-Port-Containers2013-01.JPG"),ph([118.58,-20.31],"Port Hedland: iron ore","Iron ore loader at Port Hedland.jpg"),
  ph([6.15,46.21],"Geneva: the WTO","Arc-en-ciel sur le jet d'eau de Genève - GT 2025.jpg"),ph([16.37,48.21],"Vienna: OPEC","OPEC headquarters in Vienna.jpg"),
  ph([114.06,22.54],"Shenzhen","The panorama of Futian Shenzhen.jpg"),ph([-117.0,32.52],"Tijuana: maquiladoras","Maquiladoras in Tijuana.jpg"),ph([90.4,23.8],"Dhaka: garments","Garment workers rally in Dhaka.jpg")];
  s.body="No country makes everything it needs. The map shows how much each country trades, compared with the size of its economy. This tour asks why countries trade, who sets the rules, and how global trade has moved factories to new places."});
 set("hg7c","Comparative advantage",s=>{s.sub="export/textiles";
  s.more="The map shows the countries whose main export is clothing and textiles, mostly in South Asia, where labour is cheap."});
 set("hg7c","Complementarity",s=>{s.sub="export/metals";s.on=["resources"]});
 sub("Neoliberal policies","debt");sub("The World Trade Organization","trade");
 set("hg7c","Trade blocs",s=>{s.sub="blocs/eu+usmca+mercosur+asean";s.hi=[];s.view=W;s.globe=[10,25,1];
  s.body="The European Union’s single market lets goods, services, money and people move freely among its 27 members. Other blocs on the map include the USMCA in North America, Mercosur in South America and ASEAN in Southeast Asia."});
 set("hg7c","OPEC and oil",s=>{s.sub="export/oil";s.on=["resources"];
  s.more="The map shows the countries whose main export is oil and gas, OPEC members and others such as Russia, Norway and Canada."});
 sub("The world’s factory","export/machinery");sub("Free-trade and export processing zones","trade");sub("Factories on the border","blocs/usmca");
 set("hg7c","Containers and global trade",s=>{s.sub="trade";s.on=["connections"]});
}
/* ───────── Unit 7: Sustainable development ───────── */
if(T("hg7d")&&!T("hg7d").steps._polI){T("hg7d").steps._polI=1;
 set("hg7d","Sustainable development",s=>{s.phPins=[ph([-116.6,33.92],"California: wind power","Wind turbines in southern California.jpg"),ph([90.4,23.8],"Dhaka: Grameen Bank","Grameen Bank branch.jpg"),
  ph([25.47,-10.72],"Kolwezi: cobalt","Artisanal cobalt miners in the Democratic Republic of Congo.jpg"),ph([2.5,60.5],"North Sea oil","North Sea oil rig.jpg"),
  ph([-84.82,10.3],"Monteverde, Costa Rica","Monteverde Reserve Costa Rica 02.jpg"),ph([-52.7,47.57],"St John’s: the cod collapse","The Battery, St John's, Newfoundland.jpg")]});
 set("hg7d","Resource depletion",s=>{s.on=["currents"];
  s.more="The Grand Banks were rich because the cold Labrador Current meets the warm Gulf Stream there, stirring up nutrients: see the currents on the map."});
 set("hg7d","Minerals for a green future",s=>{s.on=["resources"];
  s.body="The Democratic Republic of the Congo mines about three-quarters of the world’s cobalt, used in electric-car batteries. Around Kolwezi, artisanal miners, sometimes children, dig by hand. The minerals bring revenue but rarely broad development."});
 set("hg7d","Climate and development",s=>{s.gfSea=1;s.gfSeaUI=true;
  s.body="China, the US and India emit the most carbon dioxide in total. Bangladesh emits very little, yet rising seas and stronger cyclones threaten its low delta: the sea is raised 1 m here, move the slider. It has built thousands of cyclone shelters and cut storm deaths sharply."});
}
/* ───────── second pass: more hands-on stops, steadier map modes ───────── */
if(T("hg1")&&!T("hg1").steps._polI2){T("hg1").steps._polI2=1;
 set("hg1","Reference and thematic maps",s=>{delete s.mode;delete s.sub;s.on=["hazards"];
  s.body="This relief map, with its borders, cities and rivers, is a reference map: it shows where things are. A thematic map shows one topic: the earthquake and volcano symbols switched on here are a thematic layer, and later in this tour the population and People maps shade countries by one value each."});
}
if(T("hg1b")&&!T("hg1b").steps._polI2){T("hg1b").steps._polI2=1;
 set("hg1b","Counting everyone",s=>{delete s.mode;s.on=["cities"]});
}
if(T("hg2d")&&!T("hg2d").steps._polI2){T("hg2d").steps._polI2=1;
 set("hg2d","Neo-Malthusians and Boserup",s=>{s.ix="malthus"});
 set("hg2d","An ageing world",s=>{s.ix="pyramid"});
}
if(T("hg3a")&&!T("hg3a").steps._polI2){T("hg3a").steps._polI2=1;
 set("hg3a","Relocation diffusion",s=>{s.gfRuler={a:[-9.14,38.72],b:[-43.2,-22.9]};
  s.more="Drag the ruler: Portuguese sailed about 7,700 km from Lisbon to Rio de Janeiro. The hearth keeps the trait too: Portugal still speaks Portuguese. Relocation also explains islands of culture far from home, like Chinatowns."});
}
if(T("hg3b")&&!T("hg3b").steps._polI2){T("hg3b").steps._polI2=1;
 set("hg3b","Ethnic neighbourhoods",s=>{s.view=[70,-8,126,30];s.globe=[110,12,2];delete s.spin;s.gfRuler={a:[103.84,1.28],b:[118.09,24.48]};
  s.pins=[[[103.84,1.28],"Singapore’s Chinatown","point"],[[118.09,24.48],"Xiamen, Fujian","point"]];
  s.more="Many of Singapore’s Chinese families came from southern Fujian and Guangdong in the 1800s: drag the ruler, Xiamen is about 3,000 km away. Enclaves help newcomers find work and support; over generations many mix, or become tourist districts."});
}
if(T("hg3c")&&!T("hg3c").steps._polI2){T("hg3c").steps._polI2=1;
 set("hg3c","Sikhism",s=>{s.gfRuler={a:[74.88,31.62],b:[-0.38,51.51]};
  s.more="Drag the ruler: Amritsar to Southall, in west London, is about 6,300 km, yet chain migration has made Southall one of the largest Punjabi communities outside India."});
}
if(T("hg4a")&&!T("hg4a").steps._polI2){T("hg4a").steps._polI2=1;
 set("hg4a","Multistate nations",s=>{s.lines=[];s.gfRuler={a:[126.1,37.75],b:[128.37,38.61]};
  s.body="A multistate nation lives in more than one state. Koreans share one language and history but have been split between North and South Korea since 1945; the Demilitarised Zone, about 250 km long (drag the ruler), still divides them. When the Soviet Union broke up in 1991, millions of ethnic Russians were left in neighbouring states."});
}
if(T("hg4b")&&!T("hg4b").steps._polI2){T("hg4b").steps._polI2=1;
 set("hg4b","Devolution",s=>{s.gfRuler={a:[-0.13,51.5],b:[-3.17,55.95]};
  s.more="Drag the ruler: Edinburgh is about 530 km from Westminster, in London. Distance and a separate history, law and church helped Scotland keep its own identity."});
}
if(T("hg4c")&&!T("hg4c").steps._polI2){T("hg4c").steps._polI2=1;
 set("hg4c","The end of empires",s=>{s.stat="More than half of today’s states have become independent since 1945"});
 set("hg4c","Military alliances",s=>{s.gfRuler={a:[27.9,60.55],b:[29.6,69.5]};
  s.body="NATO, founded in 1949, is a military alliance of North American and European states. Under Article 5, members treat an attack on one as an attack on all. After Russia’s 2022 invasion of Ukraine, Finland joined in 2023 and Sweden in 2024; Finland’s border with Russia, about 1,340 km long, roughly doubled NATO’s land border with Russia. Drag the ruler along it."});
}
if(T("hg4d")&&!T("hg4d").steps._polI2){T("hg4d").steps._polI2=1;
 set("hg4d","Enclaves and exclaves",s=>{s.gfRuler={a:[22.79,54.36],b:[23.5,53.95]};
  s.more="Drag the ruler: only about 65 km of Polish and Lithuanian land, the Suwałki Gap, separates Kaliningrad from Belarus, Russia’s ally."});
}
if(T("hg5a")&&!T("hg5a").steps._polI2){T("hg5a").steps._polI2=1;
 set("hg5a","Extensive farming",s=>{s.ghosts=[{code:"be",at:[136.3,-28.9],col:"#8a63cf",label:"Belgium, true size"}];
  s.pins=(s.pins||[]).concat([[[136.34,-28.9],"Anna Creek station","point"]]);
  s.more="Anna Creek, the world’s largest cattle station, covers about 23,700 km², over three-quarters the size of Belgium: drag Belgium, in purple at its true size, onto it."});
}
if(T("hg5b")&&!T("hg5b").steps._polI2){T("hg5b").steps._polI2=1;
 set("hg5b","Von Thünen’s rings",s=>{s.ix="vonthunen"});
 set("hg5b","Why the rings bend",s=>{delete s.ix});
}
if(T("hg5c")&&!T("hg5c").steps._polI2){T("hg5c").steps._polI2=1;
 set("hg5c","Fair trade",s=>{s.gfRuler={a:[-75.6,4.8],b:[9.99,53.55]};
  s.more="Drag the ruler: the beans travel about 9,000 km to roasters in Europe. Fair trade is still a small share of sales, and much of the shop price stays with roasters and retailers."});
}
/* Inside the city and Building better cities move to the population map: the satellite and city-lights maps cannot
   zoom in far enough to show a city's inside, and the city-lights map is not offered in the light theme */
if(T("hg6b")&&!T("hg6b").steps._polI2){const t=T("hg6b");t.steps._polI2=1;
 try{def(t,"map",Object.assign({},t.map||{},{mode:"population"}))}catch(e){}
 set("hg6b","Inside the city",s=>{s.body="Each city is unique, but patterns repeat: business centres, industrial zones, rich and poor districts and suburbs. This tour sets each classic model beside a real city on the population map, where the darkest colours mark the most people per km²; the diagrams and photos show each city’s inside."});
 set("hg6b","The concentric zone model",s=>{s.gfRuler={a:[-87.63,41.88],b:[-88.15,41.75]};
  s.more="It fits older North American cities built around one downtown, less so European cities where the rich live centrally. Drag the ruler: Naperville, a commuter suburb in the outer ring, is about 45 km from the Loop."});
 set("hg6b","The multiple nuclei model",s=>{s.on=["cities"]});
 set("hg6b","The galactic city",s=>{s.on=["cities"];
  s.more="Many suburbanites now commute from suburb to suburb and rarely visit downtown."});
}
if(T("hg6c")&&!T("hg6c").steps._polI2){const t=T("hg6c");t.steps._polI2=1;
 try{def(t,"map",Object.assign({},t.map||{},{mode:"population"}))}catch(e){}
 set("hg6c","Suburbanisation",s=>{s.gfRuler={a:[-73.99,40.75],b:[-73.51,40.72]};
  s.more="Many early suburbs sold only to white buyers, fuelling “white flight” from city centres. Drag the ruler: Levittown is about 40 km from Midtown Manhattan."});
 set("hg6c","Edge cities and boomburbs",s=>{s.on=["cities"]});
 set("hg6c","Greenbelts",s=>{s.on=["cities"];
  s.more="It has contained sprawl but squeezed housing supply, which many blame for London’s high prices. Growth has leapt to towns beyond the belt, such as Reading and Milton Keynes."});
}
if(T("hg6d")&&!T("hg6d").steps._polI2){T("hg6d").steps._polI2=1;
 set("hg6d","Informal settlements",s=>{s.on=["cities"]});
}
if(T("hg7a")&&!T("hg7a").steps._polI2){T("hg7a").steps._polI2=1;
 set("hg7a","World-systems theory",s=>{s.on=["connections"];
  s.more="Unlike Rostow’s ladder, development depends on a country’s position in the system, and the core gains most from the exchange. The flight paths and cables on the map bunch between core countries."});
 set("hg7a","Per person and PPP",s=>{s.stat="A dollar buys three to four times as much in India as in the United States"});
 set("hg7a","Sectors of the economy",s=>{s.sub="farm/w1+w5"});
}
if(T("hg7d")&&!T("hg7d").steps._polI2){T("hg7d").steps._polI2=1;
 set("hg7d","Saving resource wealth",s=>{s.on=["resources"]});
}
/* photos that repeated on two stops of one tour, and pictures for the diagram stops */
Object.assign(CARD,{"hg7c|Trade and the world economy":"Locomotives Tow Container Ship through Miraflores Locks - Panama Canal.jpg",
 "hg6a|Megacities":"Jakarta skyline 2.jpg","hg5a|Intensive farming":"Can Tho, Vietnam, Floating Market, Boats.jpg",
 "hg5b|Models of rural land":"Sunset-over-the-wheat-field-featured.jpg","hg5b|Von Thünen’s rings":"Cocktail tomatoes at Campbell farmer's market.jpg",
 "hg5b|Rent falls with distance":"Westland greenhouse.webp","hg5b|Long lots":"Chateau Frontenac at dusk in Quebec City.jpg",
 "hg5b|Three agricultural revolutions":"Corncobs.jpg","hg5b|Patterns of rural settlement":"Hopi Village on the Second Mesa.jpg"});
/* framing: on every zoomed-in stop the card covers the left ~40% of the map, so shift (or widen) the view until
   everything the stop draws sits in the right part */
for(const id in OPEN){const t=T(id);if(!t||t.steps._polIF)continue;t.steps._polIF=1;
 /* the city stops of Unit 6 were framed 16° wide; zoom in as far as the flat map goes (about 9°), the city right of centre */
 if(/^hg6[bcd]$/.test(id))t.steps.forEach(s=>{const v=s.view;if(!v||v[2]-v[0]>17)return;const p=(s.pins||[])[0];if(!p)return;const a=Array.isArray(p[0][0])?p[0][0]:p[0];
  def(s,"view",[+(a[0]-5.85).toFixed(2),+(a[1]-2.6).toFixed(2),+(a[0]+3.15).toFixed(2),+(a[1]+2.6).toFixed(2)]);def(s,"_ff",1)});
 t.steps.forEach(frame)}
/* ───────── tour questions: a country (kc) for each, plus the new ones ───────── */
try{if(typeof TOURQ!=="undefined")for(const id in OPEN){const Q=TOURQ[id];if(!Q||!T(id)||Q._polI)continue;Q._polI=1;
 [...(Q.mid||[]),...(Q.recap||[])].forEach(q=>{if(!q.kc&&KC[id]&&KC[id][q.st])q.kc=KC[id][q.st];if(!q.kc&&q.pick&&q.pick.length)q.kc=q.pick[0]});
 (NEWQ[id]||[]).forEach(q=>{if(T(id).steps.some(s=>s.title===q.st)&&!(Q.mid||[]).some(x=>x.q===q.q))(Q.mid=Q.mid||[]).push(q)})}}catch(e){console.error(e)}
}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
