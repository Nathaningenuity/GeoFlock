/* GeoFlock: polish for the physical, culture and power tours — Weather, Coasts, Deserts, Ice (geoflock-tours-phys2.js),
   Mountain ranges, Volcanoes, Caves (geoflock-tours-phys1.js), Sports, Festivals, Houses (geoflock-tours-culture.js),
   Capitals, Energy, Currencies, Conflicts (geoflock-tours-power1.js) and Energy and resources (index.html).
   Adds card photos to stops that had none, photo pins on the Resources opening stop, interactive gadgets (cross-sections,
   rulers, true-size ghosts, map layers), replaces the elevation-threshold sliders with cross-sections, keeps Currencies and
   Conflicts on the History map with explicit years, cuts needless map switches, words stops so they read the same on every
   map a tour runs on, fixes a few facts and links every Resources question to a country. It only patches PS_TOURS at load
   (like geoflock-polish-b.js); load it after the tour files. Every patch is keyed by stop title, so a stop that has been
   renamed or removed is simply skipped. */
(function(){
const OPEN={weather:"Weather and winds",coasts:"Coasts",deserts:"Deserts",ice:"Ice",ranges:"Mountains of the world",
 volcanoes:"Volcanoes",caves:"The world underground",sports:"Sports around the world",festivals:"Festivals and holidays",
 houses:"Houses of the world",capitals:"Capital cities",energy:"Energy of the world",resources:"Energy and resources",
 currencies:"Money on the map",conflicts:"Conflicts and peace"};
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
/* some stops lock fields with getters (psLock in index.html); writes go through defineProperty so they replace those */
const def=(t,k,v)=>Object.defineProperty(t,k,{configurable:true,enumerable:true,writable:true,value:v});
/* a stop given its own view keeps it: _ff stops psFrameFix re-fitting it to the highlighted countries at the first tour start */
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(new Proxy(s,{set(t,k,v){def(t,k,v);if(k==="view")def(t,"_ff",1);return true}}))}catch(e){console.error(e)}};
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
/* patched once: the guard sits on the steps array, so a tour whose steps are rebuilt later is patched again */
const once=id=>{const t=T(id);if(!t||t.steps._polH)return null;t.steps._polH=1;return t};

/* new photos (Wikimedia Commons, free licences) */
window.GF_POLH_PHOTOS=window.GF_POLH_PHOTOS||[];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_POLH_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_POLH_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}

/* card photos ("tour|title" → library file name) */
const CARD={
 "weather|El Niño":"Waves in the Pacific Ocean.jpg",
 "weather|Now explore":"Pacific ocean rainbow.jpg",
 "coasts|The Wadden Sea":"Tidal flats Wadden sea.JPG",
 "coasts|The biggest tides":"NB - Hopewell Rocks1.jpg",
 "coasts|Now explore":"Møns Klint chalk cliffs 3.jpg",
 "deserts|Now explore":"2026 White Sands National Park Dunes Clouds and Sun.jpg",
 "ice|A park losing its glaciers":"Grinnell Glacier 2019.jpg",
 "ice|Now explore":"Jökulsárlón glacier lagoon, Iceland, 20240718 1544 2212.jpg",
 "ranges|Now explore":"Fitz Roy 2.jpg",
 "volcanoes|Now explore":"Mount Bromo at sunrise, showing its volcanoes and Mount Semeru (background).jpg",
 "caves|Now explore":"Harrisons Cave (6837980436).jpg",
 "sports|Rugby in the South Pacific and southern Africa":"New Zealand national rugby 20191101a5.jpg",
 "sports|Sepak takraw":"Sepak Takraw Bangkok.jpg",
 "sports|Now explore":"Maracanã stadium.jpg",
 "festivals|Harvest moons and Thanksgiving":"Combine harvesting wheat.jpg",
 "festivals|Now explore":"1 singapore national day parade 2011 fireworks.jpg",
 "houses|Now explore":"Lesotho mountain village (5285775857).jpg",
 "capitals|Two capitals across a river":"Kinshasa & Brazzaville - ISS007-E-6305 lrg.jpg",
 "capitals|Now explore":"Hungarian Parliament Building 2023-9.jpg",
 "energy|Now explore":"Akosombo Dam.jpg",
 "resources|Now explore":"Zollverein Coal Mine, Essen.jpg",
 "currencies|Now explore":"New York Stock Exchange August 2017 02.jpg",
 "conflicts|Now explore":"United Nations General Assembly Hall (3).jpg"};
GF_POLH_PHOTOS.forEach(p=>{if(p.card)CARD[p.card]=p.f});

function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 {const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_POLH_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}
 for(const k in CARD){if(PS_PHOTO[k]!=null&&k.indexOf("resources|")!==0)continue;const i=libIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const id in OPEN){const t=T(id);if(!t)continue;t.steps.forEach(s=>(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f||q.img!=null)return;const i=libIdx(f);if(i>=0){q.img=i;if(PS_SQ_IMG[q.label]==null)PS_SQ_IMG[q.label]=i}}))}}catch(e){console.error(e)}}
/* the tour files pick their own card photos first (psPhotoFor wrappers keyed by their CARD lists); a stop they have no photo
   for falls through to PS_PHOTO, which is where these go */

function patch(){
/* ───────── Weather ───────── */
if(once("weather")){
 set("weather","Where air masses collide",s=>{s.view=[-150,18,-66,56];s.globe=[-98,38,2]});
 /* the story spans the whole Pacific, which the flat map cuts in half: show it on the globe */
 set("weather","El Niño",s=>{s.pacific=true;s.globe=[-128,-4,1.35];s.body="Normally the trade winds push warm surface water west towards Indonesia, and cold, food-rich water wells up off Peru. In an El Niño year the trade winds weaken, the warm water spreads back east, and the rain follows it. The ocean-currents layer shows the currents that normally run west."});
}
/* ───────── Coasts ───────── */
if(once("coasts")){
 set("coasts","Rias: drowned river valleys",s=>{s.gfSeaUI=true;
  s.body="In the last ice age the sea stood about 120 m lower, as the map shows now, and rivers cut valleys across today’s coast. When the ice melted, the sea rose and flowed up the valleys. Drag the sea level on the card back to 0 m to watch them flood."});
 set("coasts","Now explore",s=>{s.body="Switch to the Satellite map and zoom into a coast: look for deltas fanning out, fjords cutting inland, sandbars and reefs. The Seas & oceans tour explains tides and currents, and the Ice tour shows how glaciers carved the fjords."});
}
/* ───────── Deserts ───────── */
if(once("deserts")){
 set("deserts","Deserts",s=>{s.body="A desert is a place that gets very little rain. Deserts are not all sand: most are bare rock, stony plains, salt flats and mountains, and some freeze hard every winter. On the Climate map, hot deserts are deep red and cold ones pink."});
 set("deserts","Now explore",s=>{s.body="On the Climate map, click the desert colours in the key to see only them; on the Satellite map, look for sand seas, salt flats and oases. The climate tour explains the belts of rising and sinking air, and the Ice tour visits the coldest desert of all."});
}
/* ───────── Ice ───────── */
if(once("ice")){
 set("ice","Greenland’s ice",s=>{s.more="Since about 2002, Greenland has lost roughly 270 billion tonnes of ice a year, more than Antarctica, making it the biggest single source of melting land ice. In summer, blue lakes and rivers of meltwater spread across its surface."});
}
/* ───────── Mountain ranges ───────── */
once("ranges");
/* ───────── Volcanoes ───────── */
if(once("volcanoes")){
 set("volcanoes","Mauna Loa: a giant shield",s=>{
  s.xsec={title:"From the sea floor over Mauna Loa",pts:[[-157.7,18.55,"Sea floor"],[-157.0,18.85],[-156.3,19.15],[-155.95,19.3,"Coast"],[-155.608,19.475,"Mauna Loa"],[-155.468,19.821,"Mauna Kea"],[-155.1,20.05],[-154.6,20.3],[-154.0,20.6,"Sea floor"]],mark:0,
   note:"The dashed line is sea level. Most of the volcano is hidden under the Pacific: from the sea floor, about 5 km down, it climbs about 9 km."};
  s.body="Hawaii’s volcanoes erupt runny basalt lava that spreads far before it cools, building wide, gentle domes shaped like a warrior’s shield lying on the ground. Move along the chart: most of Mauna Loa is under the sea."});
 set("volcanoes","Yellowstone’s supervolcano",s=>{s.view=[-130,40,-104,48.5];s.card="left"});
 set("volcanoes","Vesuvius and Pompeii",s=>{s.view=[12.2,40.15,15.4,41.4];s.card="left";s.gfRuler={a:[14.08,40.78],b:[14.426,40.821]};
  s.body="Pliny the Younger watched from Misenum, about 30 km across the bay (the ruler), as a column of ash rose like a giant pine tree, then fell on Pompeii and Herculaneum. The towns were buried, preserved for archaeologists to dig up 1,700 years later."});
 set("volcanoes","Krakatoa and Tambora",s=>{s.view=[56,-30,128,10];s.globe=[92,-10,1.6];s.card="left";
  s.gfRuler={a:[105.42,-6.1],b:[63.42,-19.72]};
  s.pins=(s.pins||[]).concat([[[63.42,-19.72],"Rodrigues: the bang was heard here","point"]]);
  s.body="Tambora blew off the top of its mountain and filled the sky with gas that cooled the planet: 1816 became ‘the year without a summer’. Krakatoa’s explosion was heard on Rodrigues Island, about 4,800 km away (drag the ruler), and its tsunamis killed about 36,000 people."});
 set("volcanoes","Floods of lava: the Deccan Traps",s=>{s.ghosts=[{code:"fr",at:[75.6,19.2],col:"#c2410c",label:"France, true size"}];
  s.body="This was not one volcano but long cracks that poured out lava again and again for hundreds of thousands of years. The lava that is left still covers an area bigger than France: the orange shape is France at its true size, so drag it to compare. The layers weathered into step-like hills, so they were named ‘traps’, from a Swedish word for stairs."});
}
/* ───────── Caves ───────── */
if(once("caves")){
 set("caves","Down to 2 km: the deepest caves",s=>{s.stat="Two caves in the western Caucasus go about 2.2 km down, deeper than any other caves known";
  s.body="Krubera Cave and Veryovkina Cave both open high in the Arabika Massif, above the Black Sea coast of Abkhazia, a breakaway region of Georgia. Krubera was the first cave known to go beyond 2 km, in 2004; Veryovkina reached about 2,212 m in 2018. Move along the chart to climb the massif."});
}
/* ───────── Sports ───────── */
once("sports");
/* ───────── Festivals ───────── */
once("festivals");
/* ───────── Houses ───────── */
once("houses");
/* ───────── Capitals ───────── */
if(once("capitals")){
 set("capitals","Federal capitals: neutral ground",s=>{s.more="The map now colours the world’s federations. Mexico City, Kuala Lumpur and Delhi are also federal territories of their own."});
 set("capitals","La Paz: the highest seat of government",s=>{delete s.gfThr;s.view=[-75,-20.5,-62,-13];s.globe=[-68.6,-16.6,4];
  s.xsec={title:"From the Pacific over La Paz to the Amazon",pts:[[-70.31,-18.48,"Arica (coast)"],[-69.9,-18.2],[-69.5,-17.95],[-69.1,-17.6,"Altiplano"],[-68.6,-17.05],[-68.15,-16.5,"La Paz"],[-67.85,-16.2],[-67.57,-15.83,"Yungas"],[-67.5,-15.1],[-67.53,-14.44,"Amazon lowlands"]],mark:3600,
   note:"The dashed line marks 3,600 m. La Paz lies on the edge of the Altiplano, a high plain between two ranges of the Andes; just beyond it the land drops steeply to the Amazon lowlands."};
  s.body="Bolivia’s constitution names Sucre as the capital, and the top courts sit there, but the president and parliament work in La Paz. The city fills a deep canyon cut into the Altiplano, the high plateau of the Andes: move along the chart to climb there from the Pacific."});
 set("capitals","The coldest capital",s=>{delete s.mode;delete s.sub;s.gfRuler={a:[106.92,47.92],b:[117.7,39.0]};
  s.body="The city sits about 1,350 m up, far from any ocean: the nearest sea is about 1,300 km away (drag the ruler). In winter a huge high-pressure system of cold air settles over Siberia and Mongolia, and January averages around −20 °C, yet summers are warm.";
  s.more="Nearly half of all Mongolians live in the city, many in gers (felt tents) on its edges. Astana, Ottawa and Moscow are other famously cold capitals."});
}
/* ───────── Energy ───────── */
if(once("energy")){
 set("energy","Lights in the dark",s=>{s.mode="night";delete s.sub;
  s.more="The map now shows the Earth at night, from satellite photos: much of Africa is dark, while Europe, India and the eastern US glow. Small solar panels with batteries are now bringing light to many villages beyond the grid."});
 set("energy","Norway: oil money, electric cars",s=>{delete s.mode;delete s.sub;s.hi=["no"];
  s.more="Its oil fund owns about 1.5% of all the shares listed on the world’s stock markets, small slices of thousands of companies. The money is saved for the day the oil runs out."});
}
/* ───────── Energy and resources (index.html) ───────── */
if(once("resources")){
 const OFF=/^(United States: Grand Canyon|Iran: Naqsh-e Jahan Square, Isfahan|Russia: St Basil’s Cathedral, Moscow|India: Taj Mahal|Indonesia: Borobudur|China: Great Wall of China|South Africa: Table Mountain, Cape Town|Morocco: Chefchaouen|DR Congo: The Congo rainforest)$/;
 PS_TOURS.resources.steps.forEach(s=>{if(s.phPins&&s.phPins.some(q=>OFF.test(q.label)))def(s,"phPins",s.phPins.filter(q=>!OFF.test(q.label)))});
 set("resources","Energy and resources",s=>{s.phPins=[ph([-64,8.5],"Orinoco Belt"),ph([111,30.82],"Three Gorges"),ph([-68.25,-23.5],"Salar de Atacama"),
  ph([113.99,62.53],"Mir: a giant diamond pit in Siberia"),ph([-12.77,26.32],"Bou Craa: phosphate in Western Sahara"),ph([26.5,-11.2],"Artisanal cobalt mining, DR Congo","Artisanal cobalt miners in the Democratic Republic of Congo.jpg"),
  ph([-22.43,63.88],"Blue Lagoon")];
  s.more="Turn the Resources layer on or off in the toolbar: its icons mark oil and gas fields, coal, metal mines and power stations."});
 set("resources","Heat from the Earth",s=>{s.on=["plates"];
  s.body="Iceland sits on the Mid-Atlantic Ridge, where two plates pull apart (the plate lines on the map), so hot rock lies close to the surface. Almost all its electricity comes from dams and geothermal power, and some pavements in Reykjavík are heated in winter."});
 set("resources","Phosphate",s=>{s.view=[-19,23,-4,35];s.globe=[-10,29,4];s.card="right";s.gfRuler={a:[-12.77,26.32],b:[-13.4,27.1]};
  s.more="From the Bou Craa mine in Western Sahara, a conveyor belt about 100 km long (the ruler) carries rock to the coast, and it can be seen from space. Western Sahara is a disputed territory, mostly controlled by Morocco. China is the biggest producer of phosphate today."});
 set("resources","Now explore",s=>{s.body="Turn on the Resources layer and hover any icon to read about the field, mine or power station. Try the GDP tour to see which resource-rich countries grew rich, and which didn’t."});
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.resources;if(Q){const KC={"A field for two":"qa","Heat from the Earth":"is","Congo’s cobalt":"cd","Diamonds":"bw","Phosphate":"ma","Water from the sea":"sa"};
  [].concat(Q.mid||[],Q.recap||[]).forEach(q=>{const k=KC[q.st||q.at];if(k&&!q.kc)q.kc=k})}}catch(e){}
}
/* ───────── Currencies (on the History map) ───────── */
if(once("currencies")){
 const H=(title,sub)=>set("currencies",title,s=>{s.mode="history";if(sub)s.sub=sub});
 [["Money on the map","2026"],["The first coins","bc500/per"],["Stone money of Yap","bc500"],["Paper money from China","1000/chn"],["The pound sterling","1000"],
  ["Amsterdam’s stock exchange","1650/ned"],["The euro","2026"],["The CFA francs","1945"],["The Eastern Caribbean dollar","1975"],["Dollarisation","2026"],
  ["Germany, 1923","1919"],["Zimbabwe’s trillion-dollar notes","2010"],["Venezuela’s lost zeros","2010"],["The market never sleeps","2026"],["Money on a phone","2005"],["Now explore","2026"]].forEach(([t,y])=>H(t,y));
 set("currencies","Amsterdam’s stock exchange",s=>{s.gfRuler={a:[4.9,52.37],b:[106.83,-6.13]};
  s.more="The History map lights up the Dutch trading empire around 1650, with bases from the Americas to Indonesia. Drag the ruler: Amsterdam to Batavia is over 11,000 km, and the voyage round Africa took about eight months."});
 set("currencies","The euro",s=>{s.hi=["at","be","bg","hr","cy","ee","fi","fr","de","gr","ie","it","lv","lt","lu","mt","nl","pt","sk","si","es"];s.hiSoft=["me","xk","ad","mc","sm","va"];
  s.more="Each country puts its own design on one side of its coins, but they can be spent anywhere in the euro area. Montenegro and Kosovo use the euro without being members, and Andorra, Monaco, San Marino and Vatican City use it by agreement (pale)."});
 set("currencies","Dollarisation",s=>{s.hi=["ec","sv","pa"];s.hiSoft=["tl","mh","fm","pw","zw"];
  s.more="Timor-Leste, the Marshall Islands, Micronesia and Palau use it too, and in Zimbabwe most payments are made in dollars (pale). El Salvador made bitcoin legal money in 2021, but in 2025 dropped the rule that shops must accept it."});
 set("currencies","Now explore",s=>{s.stat="The Economy map’s Currencies view shows the money every country uses";
  s.body="Open the Economy map and choose Currencies, then click a colour in the key to see one currency on its own. Switch to GDP per person to compare rich and poor countries that share a currency. The GDP tour explains how the world’s money is shared out."});
}
/* ───────── Conflicts (on the History map) ───────── */
if(once("conflicts")){
 const H=(title,sub)=>set("conflicts",title,s=>{s.mode="history";if(sub)s.sub=sub});
 [["Conflicts and peace","1945"],["The Peace of Westphalia","1650"],["Blue helmets","1950"],["Cyprus: the Green Line","1975"],["Korea’s DMZ","1955"],["Kashmir","1945"],
  ["Clearing hidden bombs","1965"],["Refugees: where people go","2026"],["Neutral ground","2026"],["The Good Friday Agreement","2000"],["Colombia’s peace deal","2015"],
  ["Settled in court","2000"],["The world’s longest border","1815"],["Now explore","2026"]].forEach(([t,y])=>H(t,y));
 set("conflicts","Kashmir",s=>{delete s.gfThr;
  s.xsec={title:"From Srinagar up to the Siachen Glacier",pts:[[74.8,34.08,"Srinagar"],[75.3,34.25],[75.48,34.28,"Zoji La pass"],[75.95,34.45],[76.4,34.6],[76.8,34.9],[77.05,35.2],[77.1,35.45,"Siachen Glacier"],[76.9,35.75]],mark:5000,
   note:"The dashed line marks 5,000 m. The Line of Control runs across these mountains; north of it, on the Siachen Glacier, troops have faced each other since 1984."};
  s.more="China administers Aksai Chin, in the east, which India also claims. Move along the chart: troops face each other on the Siachen Glacier, up to about 6,000 m high, the highest battlefield on Earth. GeoFlock does not take sides in these claims."});
 set("conflicts","Refugees: where people go",s=>{s.sub="2026"});
 set("conflicts","Neutral ground",s=>{s.hi=["ch"];s.hiSoft=["at","ie","mt","cy"];
  s.more="Austria, Ireland, Malta and Cyprus (pale) are in the EU but, like Switzerland, stay outside NATO, while Finland (2023) and Sweden (2024) ended long neutrality and joined it. Far away, Costa Rica abolished its army in 1948."});
}
}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);[8000,13000].forEach(ms=>setTimeout(photos,ms));
})();
