/* GeoFlock: a Mapped books tour (a big-argument book about the world, followed on the map).
   bspiky  "The World Is Spiky"  Richard Florida, 2005 essay in The Atlantic Monthly, followed by the book Who's Your City? (2008)
   Each stop shows one of Florida's claims on the map. His ideas are summarised in our own words and presented as the
   author's views; where other scholars disagree, the card says so in a line. No book covers or long quotes.
   The essay measured the world by its lights at night, so many stops run on the City Lights map (mode:"night"); others use
   the Population map (mode:"population") and the Economy map (mode:"gdp", sub:"percapita"), all through the shared stopModes
   switch; plus per-stop layers (on:["connections"]), the ruler (gfRuler) and travellers moving along the stop's flow lines
   (added to geoflock-walkers.js's list, window.gfWalkers).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BSPIKY_PHOTOS.
   WANT_PHOTOS: [
    ["Richard Florida portrait (free licence)", "Flat or spiky?"],
    ["Harvard Yard or MIT (Cambridge, Massachusetts) photo", "The peaks of science"],
    ["Seoul at night (city lights)", "Asia’s rising peaks"]] */
window.GF_BSPIKY_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bspiky:"#9c6a52"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});

/* =====================================================================================================
   The World Is Spiky (Richard Florida, 2005)
   ===================================================================================================== */
const SPIKY=[
S({title:"The World Is Spiky",view:W,globe:[40,30,1],
 pins:[[[139.69,35.69],"Tokyo","point"],[[-74,40.71],"New York","point"],[[-0.13,51.5],"London","point"],[[121.47,31.23],"Shanghai","point"],[[-122.2,37.6],"San Francisco Bay","point"]],
 phPins:[ph([139.7,35.66],"Shibuya, Tokyo"),ph([-74.02,40.7],"Lower Manhattan"),ph([121.49,31.24],"Shanghai at night"),ph([114.17,22.28],"Hong Kong at night"),ph([2.3,48.86],"Paris at night"),ph([3.4,6.45],"Lagos")],
 stat:"In October 2005 the urban thinker Richard Florida answered Friedman: the world is not flat but spiky",
 body:"Florida, an American professor of cities and the economy, mapped where people live, where wealth is made and where new ideas come from. Each map looked like a mountain range: a few tall peaks, many low hills and wide, dark valleys. This tour climbs his peaks.",
 more:"His essay appeared in The Atlantic Monthly. He later turned it into a book, Who’s Your City? (2008). Florida agrees that the world is more connected than ever; he argues that this makes the peaks matter more, not less."}),
S({title:"Where people are",view:W,globe:[80,25,1],card:"left",mode:"population",
 pins:[[[139.69,35.69],"Tokyo","point"],[[77.21,28.61],"Delhi","point"],[[121.47,31.23],"Shanghai","point"],[[-46.63,-23.55],"São Paulo","point"],[[-99.13,19.43],"Mexico City","point"],[[31.24,30.04],"Cairo","point"],[[3.38,6.52],"Lagos","point"]],
 phPins:[ph([77.21,28.64],"Delhi’s railway station")],
 stat:"Since 2007, more than half of all humans have lived in towns and cities",
 body:"Florida’s first map is of people. The Population map shows how they crowd into river valleys, coasts and great cities, while deserts, forests and ice stay almost empty. But a crowd is not a peak by itself: Florida’s next maps ask what all these people make.",
 more:"The UN expects about two-thirds of humanity to live in cities by 2050."}),
S({title:"Read the lights",view:[-135,-45,160,72],globe:[20,30,1],card:"left",mode:"night",
 pins:[[[-77,40],"The US north-east","point"],[[5,50.5],"North-west Europe","point"],[[137,35.5],"Japan","point"],[[18,5],"Central Africa: dark","point"]],
 stat:"Florida’s team used satellite photos of night-time lights to estimate how much each region produces",
 body:"Light at night follows money: streets, factories, offices and homes with power. The City Lights map shows the result. Florida saw a few blazing spikes (the US north-east, western Europe, Japan) and huge dark areas, even in crowded parts of the world.",
 more:"Light is only a rough guide: farm regions and poor but crowded places can be dim, and gas flares on oilfields glow brightly. Economists still use it where official figures are missing or unreliable."}),
S({title:"Bos-Wash: one long city",view:[-82,36.5,-67,44],globe:[-74,40.5,5],card:"left",mode:"night",gfRuler:{a:[-71.06,42.36],b:[-77.04,38.9]},
 lines:[{coords:[[-71.06,42.36],[-71.41,41.82],[-72.92,41.31],[-74,40.71],[-75.17,39.95],[-76.61,39.29],[-77.04,38.9]],kind:"dash"}],
 pins:[[[-71.06,42.36],"Boston","point"],[[-74,40.71],"New York","point"],[[-75.17,39.95],"Philadelphia","point"],[[-76.61,39.29],"Baltimore","point"],[[-77.04,38.9],"Washington","point"]],
 phPins:[ph([-77.01,38.89],"The US Capitol"),ph([-71.05,42.35],"Boston’s harbour")],
 stat:"Florida counted about 54 million people and $2.2 trillion of yearly output in the Boston–Washington corridor",
 body:"From Boston to Washington the lights hardly break: one ‘mega-region’ of cities that have grown into each other, about 630 km long (drag the ruler). Florida’s team called it Bos-Wash and found it would rank among the world’s biggest economies if it were a country.",
 more:"The geographer Jean Gottmann first described this chain of cities in 1961 and called it Megalopolis. Florida’s figures come from a 2008 study with Tim Gulden and Charlotta Mellander."}),
S({title:"Chi-Pitts and the Great Lakes",view:[-95,37,-72,47],globe:[-84,42,4],card:"left",mode:"night",
 lines:[{coords:[[-91.5,41.6],[-87.63,41.88],[-86.2,41.7],[-83.05,42.33],[-81.69,41.5],[-80,40.44]],kind:"dash"}],
 pins:[[[-87.63,41.88],"Chicago","point"],[[-83.05,42.33],"Detroit","point"],[[-81.69,41.5],"Cleveland","point"],[[-80,40.44],"Pittsburgh","point"],[[-79.38,43.65],"Toronto","point"]],
 phPins:[ph([-87.62,41.88],"Chicago’s Millennium Park"),ph([-83.07,42.31],"Detroit’s Ambassador Bridge")],
 stat:"Chi-Pitts, from Chicago to Pittsburgh, was the third-biggest mega-region in Florida’s ranking",
 body:"The old industrial heart of America still glows: Chicago, Detroit, Cleveland and Pittsburgh run together along the Great Lakes. Across the border, Toronto anchors its own mega-region, which Florida’s team linked with Buffalo and Rochester.",
 more:"Some of these cities lost many factory jobs from the 1970s on. Florida argues that the regions that recovered best, like Pittsburgh, did it with universities, hospitals and talent rather than steel."}),
S({title:"Greater Tokyo: the tallest peak",view:[128,30,145,41],globe:[137,35.5,4],card:"left",mode:"night",gfRuler:{a:[139.69,35.69],b:[135.5,34.69]},
 lines:[{coords:[[139.69,35.69],[138.38,34.98],[136.91,35.18],[135.77,35.01],[135.5,34.69],[133.92,34.66],[132.46,34.39],[130.4,33.59]],kind:"dash"}],
 pins:[[[139.69,35.69],"Tokyo","point"],[[136.91,35.18],"Nagoya","point"],[[135.5,34.69],"Osaka","point"],[[130.4,33.59],"Fukuoka","point"]],
 phPins:[ph([135.53,34.69],"Osaka Castle"),ph([139.7,35.69],"Shinjuku at night")],
 stat:"Greater Tokyo, with about 37 million people, was the world’s biggest economic peak in Florida’s ranking",
 body:"Florida’s team put its output at some $2.5 trillion a year, more than any other city region. A second Japanese mega-region runs from Osaka to Nagoya, about 400 km away (drag the ruler), and fast trains tie them into one long belt of light along the Pacific coast.",
 more:"The Tōkaidō Shinkansen, the world’s first high-speed railway, opened between Tokyo and Osaka in 1964."}),
S({title:"Europe’s banana",view:[-12,40,22,57],globe:[6,49,3],card:"left",mode:"night",
 lines:[{coords:[[-2.24,53.48],[-1.47,52.9],[-0.13,51.5],[1.9,51.1],[4.4,51.2],[6.96,50.94],[8.68,50.11],[9.18,48.78],[8.54,47.37],[9.19,45.46]],kind:"dash"}],
 pins:[[[4.4,51.2],"Am-Brus-Twerp: Amsterdam, Brussels, Antwerp","point"],[[-1.2,52.6],"Lon-Leed-Chester","point"],[[8.9,49.5],"Frank-Gart: Frankfurt to Stuttgart","point"],[[2.35,48.86],"Paris","point"],[[9.19,45.46],"Rom-Mil-Tur","point"],[[3.5,43.2],"Euro-Sunbelt: Barcelona to Lyon","point"]],
 phPins:[ph([9.19,45.46],"Milan Cathedral"),ph([4.4,51.22],"Antwerp")],
 stat:"In Florida’s ranking, Amsterdam–Brussels–Antwerp was Europe’s biggest peak, with about 59 million people",
 body:"Europe’s lights run in a curved band from northern England through the Low Countries and the Rhine valley to northern Italy (dashed). French geographers called it the ‘blue banana’ in 1989. Florida’s team split it into several mega-regions with playful names.",
 more:"Much of this band follows old trade routes: the Rhine, the Alpine passes and the North Sea ports. Paris and Madrid shine as single great peaks of their own."}),
S({title:"Asia’s rising peaks",view:[100,18,135,42],globe:[118,31,2.6],card:"left",mode:"night",
 pins:[[[121.47,31.23],"Shanghai, Nanjing, Hangzhou","point"],[[116.4,39.9],"Beijing–Tianjin","point"],[[114.1,22.4],"Hong Kong–Shenzhen–Guangzhou","point"],[[127.8,36.4],"Seoul to Busan","point"],[[126.5,39.6],"North Korea: dark","point"]],
 phPins:[ph([114.16,22.28],"Hong Kong at night"),ph([126.93,37.53],"Seoul by the Han River")],
 stat:"South Korea glows from end to end at night, while North Korea, next door, is almost completely dark",
 body:"Florida saw Asia’s peaks rising fastest: the Pearl River Delta around Hong Kong and Shenzhen, Shanghai and the Yangtze delta, Beijing, and Seoul down to Busan. Even so, he argued, China’s growth was piled into these coastal peaks, while much of its inland stayed far behind.",
 more:"Since 2005 China’s lights have spread far inland, and its coastal mega-regions are now among the richest and most inventive in the world."}),
S({title:"India: peaks, not a plain",view:[64,6,94,33],globe:[79,21,3],card:"left",mode:"night",hiSoft:["in"],
 pins:[[[77.59,12.97],"Bangalore","point"],[[72.88,19.08],"Mumbai","point"],[[77.21,28.61],"Delhi","point"],[[78.47,17.38],"Hyderabad","point"],[[80.27,13.08],"Chennai","point"],[[85.31,25.6],"Bihar","point"]],
 phPins:[ph([72.83,18.95],"Mumbai’s skyline")],
 stat:"Florida’s reply to Friedman: Bangalore is a peak, not proof that India is flat",
 body:"Friedman began his book in Bangalore’s tech parks. Florida argues that these are islands: a few city-regions, around Bangalore, Mumbai, Delhi, Hyderabad and Chennai, hold most of India’s modern jobs, while most Indians live in villages and small towns where incomes are far lower.",
 more:"The crowded Ganges plain shows up on the night map, but Bihar, with over 120 million people, earns less per person than any other Indian state."}),
S({title:"Where new ideas come from",view:[-130,10,150,60],globe:[150,35,1.2],card:"left",
 pins:[[[139.64,35.44],"Tokyo–Yokohama","point"],[[114.06,22.54],"Shenzhen–Hong Kong–Guangzhou","point"],[[116.4,39.9],"Beijing","point"],[[126.98,37.57],"Seoul","point"],[[121.0,31.3],"Shanghai–Suzhou","point"],[[-122.0,37.4],"San Jose–San Francisco","point"],[[-71.1,42.37],"Boston–Cambridge","point"]],
 iconPins:[ic([139.64,35.44],"bulb"),ic([114.06,22.54],"bulb"),ic([116.4,39.9],"bulb"),ic([126.98,37.57],"bulb"),ic([121,31.3],"bulb"),ic([-122,37.4],"bulb"),ic([-71.1,42.37],"bulb")],
 phPins:[ph([114.06,22.54],"Shenzhen"),ph([126.99,37.55],"Seoul’s skyline")],
 stat:"Florida found that new patents are even more piled up than wealth: a handful of city-regions file most of them",
 body:"His third map counted patents, the legal claims to new inventions. In 2005 the peaks were in the United States and Japan, with a few in Europe. Today the UN’s patent agency, WIPO, ranks Tokyo–Yokohama and Shenzhen–Hong Kong–Guangzhou as the world’s top science and technology clusters.",
 more:"Silicon Valley (San Jose–San Francisco) is the highest-ranked cluster outside East Asia. Inventors cluster because they learn from each other: ideas, Florida says, travel best over a coffee."}),
S({title:"The peaks of science",view:[-128,22,40,62],globe:[-40,45,1.4],card:"left",
 pins:[[[-71.1,42.37],"Boston and Cambridge: Harvard, MIT","point"],[[-122.17,37.43],"The Bay Area: Stanford, Berkeley","point"],[[-0.13,51.5],"London, Oxford and Cambridge","point"],[[6.05,46.23],"Geneva: CERN","point"],[[2.35,48.86],"Paris","point"],[[-76.6,39.3],"Baltimore–Washington","point"]],
 iconPins:[ic([-71.1,42.37],"book"),ic([-122.17,37.43],"book"),ic([-0.13,51.5],"book"),ic([2.35,48.86],"book"),ic([6.05,46.23],"atom")],
 stat:"Florida’s fourth map, of the scientists most cited by other scientists, was the spikiest of all",
 body:"Top researchers gather in a few places with great universities and labs, because the best want to work beside the best. In Florida’s 2005 map, the tallest science peaks stood around Boston, the San Francisco Bay and a handful of European cities.",
 more:"China now publishes more scientific papers than any other country, and Beijing and Shanghai have become science peaks too. Rankings of ‘most cited’ change slowly, because citations pile up over many years."}),
S({title:"Africa’s lights",view:[-48,-36,56,38],globe:[18,5,1.4],card:"left",mode:"night",
 pins:[[[3.38,6.52],"Lagos","point"],[[28.05,-26.2],"Johannesburg–Pretoria","point"],[[31.24,30.04],"Cairo and the Nile","point"],[[15.31,-4.32],"Kinshasa","point"],[[36.82,-1.29],"Nairobi","point"]],
 phPins:[ph([3.4,6.45],"Lagos traffic"),ph([27.86,-26.25],"Soweto, Johannesburg"),ph([31.23,30.05],"Cairo and the Nile")],
 stat:"About 600 million people in Africa still live without electricity at home",
 body:"The Nile valley shines like a thread, and South Africa’s Gauteng glows. But Lagos, one of the world’s biggest cities, is far dimmer than its crowds would suggest. Florida uses places like this to show that population peaks and economic peaks are not the same thing.",
 more:"Africa is the fastest-growing continent and its cities are booming. Mobile phones and solar panels are spreading faster than power lines, so its night map is changing quickly."}),
S({title:"Who’s your city?",view:[-128,24,-66,50],globe:[-96,38,2.2],card:"left",hiSoft:["us"],
 lines:[{coords:[[-98.5,38.5],[-97.74,30.27]],kind:"flow"},{coords:[[-89.6,44.5],[-87.63,41.88]],kind:"flow"},{coords:[[-108,43.5],[-104.99,39.74]],kind:"flow"},{coords:[[-116.2,44],[-122.33,47.61]],kind:"flow"},{coords:[[-82,38.3],[-74,40.71]],kind:"flow"},{coords:[[-112,40],[-122.42,37.77]],kind:"flow"}],
 pins:[[[-97.74,30.27],"Austin","point"],[[-87.63,41.88],"Chicago","point"],[[-104.99,39.74],"Denver","point"],[[-122.33,47.61],"Seattle","point"],[[-74,40.71],"New York","point"],[[-122.42,37.77],"San Francisco","point"]],
 phPins:[ph([-73.99,40.76],"Times Square")],
 stat:"Florida calls choosing where to live one of the biggest decisions of your life, as big as your job or your partner",
 body:"In Who’s Your City? (2008) he argues that place still shapes your chances: the same person earns, learns and meets more in some cities than others. He divides people into the ‘mobile’, free to move to the peaks, and the ‘stuck’, who cannot. Watch young people pack their bags for the big cities.",
 more:"Moving is costly, and many people stay near family on purpose. Critics also note that the cities that pull in the most talent are often the hardest to afford."}),
S({title:"The creative class",view:[-128,24,-60,52],globe:[-96,40,2.2],card:"left",hiSoft:["us","ca"],
 pins:[[[-97.74,30.27],"Austin","point"],[[-122.42,37.77],"San Francisco","point"],[[-122.33,47.61],"Seattle","point"],[[-71.06,42.36],"Boston","point"],[[-79.38,43.65],"Toronto: Florida’s home since 2007","point"]],
 iconPins:[ic([-97.74,30.27],"music"),ic([-122.42,37.77],"gear"),ic([-122.33,47.61],"gear"),ic([-71.06,42.36],"book")],
 phPins:[ph([-122.45,37.81],"The Golden Gate Bridge")],
 stat:"In 2002 Florida counted a ‘creative class’ of scientists, engineers, artists and designers: about a third of US workers",
 body:"His earlier book, The Rise of the Creative Class, argued that these workers flock to cities with three Ts: technology, talent and tolerance. Cities like Austin, Seattle and San Francisco, he said, grew by being open, lively places where such people want to live.",
 more:"Critics, such as the geographer Jamie Peck, said the idea mostly helped people who were already well off. In The New Urban Crisis (2017) Florida himself warned that the winning cities had become unequal and very expensive."}),
S({title:"Peaks pull apart",view:W,globe:[20,20,1],card:"left",mode:"gdp",sub:"percapita",
 pins:[[[-74,40.71],"New York","point"],[[8.54,47.37],"Zurich","point"],[[103.82,1.35],"Singapore","point"],[[17,10],"The Sahel","point"]],
 phPins:[ph([2.1,13.5],"A village in Niger")],
 stat:"Florida warned that in a spiky world the peaks grow taller while the valleys fall further behind",
 body:"The Economy map shows money per person, country by country. Florida argues that the gaps that matter most now run between regions: talent and money flow to the peaks, and places without a peak nearby lose their young people. That, he warns, breeds anger and division.",
 more:"Since 2005 the gap between rich and poor countries has narrowed overall, mainly because China and India grew fast; gaps inside many countries have widened."}),
S({title:"Flat and spiky at once",view:[-135,-30,160,68],globe:[40,30,1],card:"left",on:["connections"],
 lines:[{coords:[[-74,40.71],[-0.13,51.5]],kind:"flow"},{coords:[[-0.13,51.5],[55.27,25.2]],kind:"flow"},{coords:[[55.27,25.2],[103.82,1.35]],kind:"flow"},{coords:[[103.82,1.35],[139.69,35.69]],kind:"flow"},{coords:[[139.69,35.69],[-122.42,37.77]],kind:"flow"}],
 pins:[[[-74,40.71],"New York","point"],[[-0.13,51.5],"London","point"],[[103.82,1.35],"Singapore","point"],[[139.69,35.69],"Tokyo","point"],[[55.27,25.2],"Dubai","point"]],
 phPins:[ph([103.86,1.28],"Singapore’s Marina Bay")],
 stat:"The peaks are linked to each other more tightly than to the land around them",
 body:"Florida does not deny Friedman’s flat world: ships, planes and cables (shown) link the peaks closely. But in his view the world is flat for the peaks and steep for everyone else. New York and London, he argues, have more in common with each other than with their own countryside. Watch the flights between them.",
 more:"Scholars still argue over which picture is truer. Both men agree that where you are born, and which city you can reach, still shapes your life."}),
S({title:"Now explore",view:W,globe:[40,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Open the City Lights map and hunt for the peaks: the long glow of Bos-Wash, the banana across Europe, the Nile’s thread of light. Then compare the Population and Economy maps: where are crowds without light, and light without crowds? For the other side of the argument, try The World Is Flat."})];

const TOURS={
 bspiky:{name:"The World Is Spiky",short:"The World Is Spiky",hint:"Richard Florida’s 2005 answer to Friedman, on the map: night lights, Bos-Wash, Greater Tokyo, Europe’s banana, Asia’s rising peaks and the creative class",steps:SPIKY}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"gdp", sub:"percapita"): the sub itself is set by the shared fix in
   geoflock-tourfix.js (psSetSub is not wrapped here: lending the mode before that fix runs would hide the stop's map from
   it); the key reads the tour's map mode, so it is lent the stop's mode for that call only */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- travellers along the stops' flow lines (geoflock-walkers.js reads window.gfWalkers when a stop opens) ---------- */
const later=fn=>{if(fn())return;let n=0;const t=setInterval(()=>{if(fn()||++n>60)clearInterval(t)},500)};
later(()=>{const Wk=window.gfWalkers;if(!Wk)return false;
 Wk["bspiky|Who’s your city?"]={emoji:"🧳",name:"Young people moving to the big cities",size:22,per:1};
 Wk["bspiky|Flat and spiky at once"]={emoji:"✈️",name:"Flights between the peaks",size:22,per:1};
 return true});
/* a stop reached through a map switch is opened by the switch itself, past the walkers' own psGo hook, so its travellers would
   not start: once the switch is over, the stop is opened once more */
if(typeof psGo==="function"){let again=null;const _g=psGo;psGo=function(i){const tour=mine()?ps.tour:null;const r=_g.apply(this,arguments);try{if(tour&&again!==i){const want=i;let n=0,ok=0;
 const t=setInterval(()=>{try{if(++n>40){clearInterval(t);return}if((typeof psSwitching!=="undefined"&&psSwitching)||typeof ps==="undefined"||!ps)return;if(ps.tour!==tour||ps.i!==want){clearInterval(t);return}
  if(++ok<4)return;clearInterval(t);const St=psSteps()[want],W=window.gfWalkers;if(W&&St&&W[ps.tour+"|"+St.title]&&!document.querySelector(".hw-lay")){again=want;psGo(want);again=null}}catch(e){clearInterval(t)}},500)}}catch(e){}return r}}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bspiky={mid:[
 {at:"Read the lights",st:"Read the lights",q:"What did Florida’s team use to estimate how much each region produces?",o:["Tax records","Night-time lights seen from space","Road traffic","Rainfall"],a:1,why:"Light at night follows money and power.",kc:"us"},
 {at:"Greater Tokyo: the tallest peak",st:"Greater Tokyo: the tallest peak",q:"Which city region was the biggest economic peak in Florida’s ranking?",o:["New York","London","Greater Tokyo","Shanghai"],a:2,why:"About 37 million people live in Greater Tokyo.",kc:"jp"},
 {at:"Asia’s rising peaks",st:"Asia’s rising peaks",q:"Which country is almost completely dark at night, next to a brightly lit neighbour?",o:["North Korea","Mongolia","Laos","Japan"],a:0,why:"South Korea glows; North Korea has little power.",kc:"kp"}],
 recap:[
 {q:"Bos-Wash runs from Boston to which city?",o:["Chicago","Washington","Atlanta","Montreal"],a:1,why:"About 630 km of almost unbroken city.",st:"Bos-Wash: one long city",kc:"us"},
 {q:"What are Florida’s ‘three Ts’?",o:["Trade, tax, transport","Technology, talent, tolerance","Towns, trains, trees","Time, travel, trust"],a:1,why:"From The Rise of the Creative Class (2002).",st:"The creative class",kc:"ca"},
 {q:"Europe’s band of lights from England to Italy is often called the…",o:["Golden arc","Blue banana","Red line","Green belt"],a:1,why:"Named by French geographers in 1989.",st:"Europe’s banana",kc:"be"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bspiky|The World Is Spiky":"The HoloGlobe Project (Version 3) (SVS155 - earth night).jpg","bspiky|Where people are":"Shibuya Crossing, Tokyo; December 2017.jpg",
 "bspiky|Read the lights":"Europe at Night 2014-2015 (SVS30693 - france night lights 201410-201504).tiff","bspiky|Bos-Wash: one long city":"Brooklyn Bridge and the Lower Manhattan skyline from Pebble Beach, New York.jpg",
 "bspiky|Chi-Pitts and the Great Lakes":"Sunset Toronto Skyline Panorama Crop from Snake Island.jpg","bspiky|Greater Tokyo: the tallest peak":"Minato City, Tokyo, Japan.jpg",
 "bspiky|Europe’s banana":"Eiffel Tower and Pont Alexandre III at night.jpg","bspiky|Asia’s rising peaks":"Shanghai by night.jpg",
 "bspiky|India: peaks, not a plain":"Bagmane Tech Park, Bengaluru.jpg","bspiky|Where new ideas come from":"Silicon Valley from above.jpg",
 "bspiky|The peaks of science":"CERN Atlas Caverne.jpg","bspiky|Africa’s lights":"Lagos skyline.jpg",
 "bspiky|Who’s your city?":"Golden Gate Bridge as seen from Marshall’s Beach, March 2018.jpg","bspiky|The creative class":"Skating by the Bean - Millennium Park - Chicago - Illinois - USA (32164006083).jpg",
 "bspiky|Peaks pull apart":"Wall Street - New York Stock Exchange.jpg","bspiky|Flat and spiky at once":"9V-SHI - Airbus A350-941 - Singapore Airlines - 322 - VGHS.jpg",
 "bspiky|Now explore":"Hong Kong Harbour Night 2019-06-11.jpg"};
const PIN={
 "Shibuya, Tokyo":"Tokyo Shibuya Scramble Crossing 2021-04-27.jpg","Lower Manhattan":"Lower Manhattan from Jersey City November 2016 002.jpg","Shanghai at night":"Shanghai by night.jpg",
 "Hong Kong at night":"Hong Kong Night Skyline.jpg","Paris at night":"Eiffel Tower and Pont Alexandre III at night.jpg","Lagos":"Lagos skyline.jpg",
 "Delhi’s railway station":"Low visibility due to Smog at New Delhi Railway station 31st Dec 2017 after 9AM DSCN8829 1.jpg","The US Capitol":"US Capitol west side.JPG",
 "Boston’s harbour":"Boston Tea Party Ship & Museum, Boston (493623) (11062434853).jpg","Chicago’s Millennium Park":"Skating by the Bean - Millennium Park - Chicago - Illinois - USA (32164006083).jpg",
 "Detroit’s Ambassador Bridge":"Ambassador Bridge from the Detroit River, Windsor, Ontario, 2025-07-27 03.jpg","Osaka Castle":"Osaka Castle 03bs3200.jpg",
 "Shinjuku at night":"Kabukicho red gate and colorful neon street signs at night, Shinjuku, Tokyo, Japan.jpg","Milan Cathedral":"Milan Cathedral from Piazza del Duomo.jpg",
 "Antwerp":"Grote Markt and Cathedral of Our Lady - Antwerp, Belgium - panoramio.jpg","Seoul by the Han River":"Yeouido Han River Seoul Bamseom Pixabay 1602524.jpg",
 "Mumbai’s skyline":"Mumbai Skyline with Bandra–Worli Sea Link 25 July 2018 (1).jpg","Shenzhen":"The panorama of Futian Shenzhen.jpg","Seoul’s skyline":"Skyline view from Seoul City (South Korea).jpg",
 "Lagos traffic":"2010 traffic Lagos Nigeria 4576800053.jpg","Soweto, Johannesburg":"Soweto township.jpg","Cairo and the Nile":"Cairo skyline, Nile River, Egypt.jpg",
 "Times Square":"Times square nuit.jpg","The Golden Gate Bridge":"Golden Gate Bridge as seen from Marshall’s Beach, March 2018.jpg","A village in Niger":"A village in Niger.jpg",
 "Singapore’s Marina Bay":"Marina Bay Singapore-3499.jpg"};
/* new photos (GF_BSPIKY_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BSPIKY_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bspiky:"Hong Kong Night Skyline.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
