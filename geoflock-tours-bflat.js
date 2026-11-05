/* GeoFlock: a Mapped books tour (a big-argument book about the world, followed on the map).
   bflat  "The World Is Flat"  Thomas L. Friedman, 2005 (updated 2006 and 2007)
   Each stop shows one of the book's claims on the map. The book's ideas are summarised in our own words and presented as
   the author's views; where other scholars disagree, the card says so in a line. No book covers or long quotes.
   Stops use per-stop layers (on:[…]: time zones, connections), the day-and-night gadget (gfSun), the Economy map for one
   stop (mode:"gdp", sub:"percapita", through the shared stopModes switch), an empire overlay from the History map's data
   (gfEmpire, geoflock-tourover.js) for 1989, the ruler (gfRuler) and travellers moving along the stop's flow lines
   (container ships and parcels, added to geoflock-walkers.js's list, window.gfWalkers).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_BFLAT_PHOTOS.
   WANT_PHOTOS: [
    ["Infosys Mysore.jpg (or any photo of the Infosys campus, Electronics City, Bangalore)", "Bangalore: the field is levelled"],
    ["UPS Worldport (Louisville) aerial photo", "UPS: the parcel company that fixes laptops"],
    ["Walmart Home Office, Bentonville, Arkansas", "Walmart’s supply chain"],
    ["Netscape Navigator screenshot / Netscape logo (free licence)", "Netscape and the web"],
    ["A call centre in India (free licence)", "Working while America sleeps"]] */
window.GF_BFLAT_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={bflat:"#a87a4e"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});
const BLR=[77.59,12.97];

/* =====================================================================================================
   The World Is Flat (Thomas L. Friedman, 2005)
   ===================================================================================================== */
const FLAT=[
S({title:"The World Is Flat",view:W,globe:[60,25,1],
 lines:[{coords:[[-122.08,37.39],[-140,30],[-170,22],[160,18],[121.5,31.2]],kind:"flow"},{coords:[[121.5,31.2],[110,12],[100,5],[80.3,13.1]],kind:"flow"},{coords:[[72.85,19.0],[60,15],[45,12.5],[32.5,30],[15,37],[-5.5,36],[-9,43],[-5,49.5],[-1,50.6]],kind:"flow"}],
 phPins:[ph([77.66,12.85],"A tech park in Bengaluru"),ph([13.38,52.52],"The Berlin Wall falls"),ph([-122.05,37.37],"Silicon Valley"),ph([121.5,31.24],"Shanghai’s skyline"),ph([114.06,22.54],"Shenzhen"),ph([122.0,30.6],"Containers at Yangshan, Shanghai")],
 stat:"Thomas Friedman’s 2005 bestseller says that around 2000 the world’s economic playing field became level",
 body:"Friedman, a New York Times columnist, argues that the internet, cheap fibre-optic cables and new software let people in Bangalore, Beijing and Boston compete for the same work. He calls the result a ‘flat’ world, and lists ten forces that flattened it. This tour follows them on the map.",
 more:"The book sold millions of copies and was updated in 2006 and 2007. Its title is a metaphor: Friedman knows the Earth is round, but says that distance and borders matter much less for business than they did."}),
S({title:"Bangalore: the field is levelled",view:[62,4,94,26],globe:[78,14,3.5],card:"left",hi:["in"],
 pins:[[[77.66,12.85],"Electronics City: the Infosys campus","point"],[[77.59,12.97],"Bangalore (Bengaluru)","point"],[[78.47,17.38],"Hyderabad","point"],[[80.27,13.08],"Chennai","point"]],
 iconPins:[ic([77.66,12.85],"gear")],
 phPins:[ph([77.6,12.98],"Cricket in Bengaluru")],
 stat:"In 2004 Nandan Nilekani, boss of the Indian software firm Infosys, told Friedman the playing field was being levelled",
 body:"The book begins on the Infosys campus outside Bangalore, India’s ‘Silicon Valley’. Friedman watched engineers there work for clients in America and Europe over video links. Nilekani’s remark, he says, made him write in his notebook that the world is flat.",
 more:"Bangalore (officially Bengaluru since 2014) grew from a quiet garden city into one of the world’s great centres of software work. Hyderabad and Chennai followed."}),
S({title:"Three ages of globalisation",view:[-100,-5,90,62],globe:[-20,35,1.3],card:"left",
 lines:[{coords:[[-6.89,37.22],[-16,28],[-40,25],[-74.5,24.1]],kind:"flow"},{coords:[[-10.3,51.9],[-30,52.5],[-53.6,47.98]],kind:"dash"},{coords:[[-74,40.7],[-45,43],[-10,49],[-5.5,50.1]],kind:"flow"}],
 pins:[[[-6.89,37.22],"Palos: Columbus sails, 1492","point"],[[-10.3,51.9],"Valentia: telegraph cable, 1866","point"],[[-53.6,47.98],"Heart’s Content, Newfoundland","point"],[[-74,40.7],"New York","point"]],
 iconPins:[ic([-40,25],"ship")],
 phPins:[ph([-5.5,50.1],"A container ship")],
 stat:"Friedman’s three ages: countries went global from 1492, companies from about 1800, and individuals from about 2000",
 body:"In Globalisation 1.0, he says, countries and their muscle, like Spain’s fleets, drove the world together. In 2.0, steamships, telegraph cables (dashed: the first lasting one crossed the Atlantic in 1866) and big companies did it. In 3.0, ordinary people with a computer can work with anyone, anywhere.",
 more:"Historians point out that trade linked the world long before 1492, along the Silk Roads and the monsoon routes of the Indian Ocean."}),
S({title:"11/9/89: the Wall comes down",view:[-12,40,45,62],globe:[15,52,2.4],card:"left",gfEmpire:{y:1988,gk:"ussr",name:"The Soviet Union, 1988",at:[31,57]},
 lines:[{coords:[[10.87,53.96],[10.8,52.4],[10.1,51.2],[10.2,50.5],[12.1,50.3],[13.8,48.8],[16.9,48.6],[17.1,48.0],[16.5,47.2],[16.1,46.7],[13.7,45.65]],kind:"dash"}],
 pins:[[[13.38,52.52],"Berlin: the Wall opens, 9 November 1989","point"],[[13.7,45.65],"Trieste","point"],[[10.87,53.96],"Lübeck","point"]],
 phPins:[ph([13.38,52.52],"The Berlin Wall falls")],
 stat:"Friedman’s first flattener is the fall of the Berlin Wall, on 9 November 1989 (11/9 in American date order)",
 body:"The dashed line is the Iron Curtain that split Europe; the Soviet Union is shaded. When the Curtain fell, Friedman argues, hundreds of millions of people in the Soviet bloc, and soon in India and China too, could join one world market. He also notes that Windows-based personal computers were spreading at the same moment.",
 more:"He likes the date pairs: 11/9, the day walls came down, and 9/11, the 2001 attacks, which showed that the same open world could be used for harm."}),
S({title:"Netscape and the web",view:[-128,30,-110,42],globe:[-121,37.5,5],card:"left",gfRuler:{a:[-122.18,37.46],b:[-118.44,34.07]},
 pins:[[[-122.08,37.39],"Mountain View: Netscape","point"],[[-118.44,34.07],"UCLA: the first internet message, 1969","point"],[[-122.18,37.46],"SRI, Menlo Park: the reply","point"]],
 iconPins:[ic([-122.08,37.39],"gear")],
 phPins:[ph([-118.44,34.07],"The first internet message"),ph([-121.95,37.35],"Silicon Valley")],
 stat:"On 9 August 1995 the web-browser company Netscape sold its first shares, and the internet boom began",
 body:"Netscape’s browser, made in Mountain View in Silicon Valley, let anyone click through the World Wide Web. Friedman’s second flattener is that moment: the web went from a tool for scientists to something everyone used, and investors poured money into it.",
 more:"The internet itself began in 1969, when a computer at UCLA sent a message to one at the Stanford Research Institute, some 500 km away (drag the ruler). The web was invented at CERN, near Geneva, by Tim Berners-Lee in 1989."}),
S({title:"Fibre under the sea",view:[-100,-15,150,62],globe:[30,30,1.2],card:"left",on:["connections"],
 lines:[{coords:[[-74,40.6],[-50,43],[-20,48],[-4.55,50.83]],kind:"flow"},{coords:[[-4.55,50.83],[-9,44],[-9.5,37],[-5.6,35.95],[5,37.8],[20,34],[29.9,31.2]],kind:"flow"},{coords:[[32.55,29.9],[38,21],[43.4,12.6],[55,14],[72.85,19.0]],kind:"flow"},{coords:[[72.85,19.0],[76,8],[80,6],[95,6],[103.8,1.3]],kind:"flow"}],
 pins:[[[-4.55,50.83],"Bude, Cornwall: cables land","point"],[[72.85,19.0],"Mumbai","point"],[[29.9,31.2],"Alexandria","point"],[[103.8,1.3],"Singapore","point"]],
 stat:"During the 1990s boom, firms laid so much fibre-optic cable that calls and data to India became almost free",
 body:"The lines sketch the kind of route that undersea cables take from America to Europe, through Egypt and on to India and Singapore. Friedman argues that the dot-com crash of 2000 left this glass highway in place but cheap to use, which let work flow to Bangalore by cable.",
 more:"Today more than 95% of data between continents travels through undersea cables, not satellites. The shipping lanes shown follow many of the same routes."}),
S({title:"Y2K: India’s big break",view:[60,5,95,32],globe:[78,20,3],card:"left",hi:["in"],
 pins:[[[77.59,12.97],"Bangalore","point"],[[78.47,17.38],"Hyderabad","point"],[[73.86,18.52],"Pune","point"],[[77.03,28.46],"Gurugram","point"],[[72.88,19.08],"Mumbai","point"],[[80.27,13.08],"Chennai","point"]],
 iconPins:[ic([77.59,12.97],"gear"),ic([78.47,17.38],"gear"),ic([73.86,18.52],"gear")],
 phPins:[ph([72.83,18.95],"Mumbai’s skyline")],
 stat:"Old computers stored years as two digits, so in 2000 many risked reading ‘00’ as 1900: the Y2K bug",
 body:"Friedman’s fifth flattener is outsourcing. Western firms needed huge numbers of programmers to check old code before 1 January 2000, and India had many English-speaking engineers. The work went well, and afterwards the same firms sent India much more of their computer work.",
 more:"India’s IT and outsourcing industry now earns well over 200 billion dollars a year and employs around 5 million people."}),
S({title:"Working while America sleeps",view:[-130,-30,100,62],globe:[-10,25,1],card:"left",on:["timezones"],gfSun:{utc:3,day:79},
 lines:[{coords:[[-74,40.71],[-40,55],[10,55],[50,38],[77.59,12.97]],kind:"dash"}],
 pins:[[[-74,40.71],"New York: 11 at night","point"],[[77.59,12.97],"Bangalore: 8.30 in the morning","point"]],
 phPins:[ph([-73.99,40.76],"Times Square at night")],
 stat:"India is 9½ to 10½ hours ahead of New York, so work sent at bedtime can be done by breakfast",
 body:"The map shows day and night at 3 a.m. Greenwich time in March, with the time zones on. While New Yorkers sleep, Bangalore is starting the day. Friedman describes Indian call-centre staff learning American accents and Indian accountants doing American tax returns overnight.",
 more:"He calls this the 24-hour workday: a company can hand its work round the globe like a relay baton."}),
S({title:"China joins the world’s factory floor",view:[96,14,130,42],globe:[115,28,2.8],card:"left",hi:["cn"],
 lines:[{coords:[[113.95,22.5],[118,20],[130,25],[150,30],[180,38],[-150,38],[-118.2,33.74]],kind:"flow"},{coords:[[122.05,30.6],[135,32],[160,38],[-170,42],[-140,42],[-122.3,37.8]],kind:"flow"}],
 pins:[[[113.95,22.5],"Shenzhen","point"],[[113.75,23.02],"Dongguan","point"],[[121.47,31.23],"Shanghai","point"],[[6.14,46.2],"Geneva: the WTO","point"]],
 phPins:[ph([114.06,22.54],"Shenzhen"),ph([122.0,30.6],"Containers at Yangshan, Shanghai")],
 stat:"China joined the World Trade Organization on 11 December 2001, and became the world’s workshop",
 body:"Friedman’s sixth flattener is offshoring: moving a whole factory to another country. Once China joined the WTO, its rules on trade were tied to the rest of the world’s, and firms moved huge amounts of manufacturing to cities like Shenzhen and Dongguan. Watch the container ships set off for California.",
 more:"Shenzhen was a small town until it became China’s first Special Economic Zone in 1980. Today it has over 17 million people."}),
S({title:"Walmart’s supply chain",view:[-130,15,-70,52],globe:[-100,35,2.2],card:"left",hiSoft:["us"],
 lines:[{coords:[[-118.2,33.74],[-112,34.5],[-104,35.2],[-97.5,35.5],[-94.21,36.37]],kind:"flow"},{coords:[[-94.21,36.37],[-90,38.6],[-84.39,33.75]],kind:"flow"},{coords:[[-94.21,36.37],[-87.6,41.9],[-80,40.44]],kind:"flow"}],
 pins:[[[-94.21,36.37],"Bentonville, Arkansas: Walmart’s home","point"],[[-118.2,33.74],"Port of Long Beach","point"]],
 phPins:[ph([-118.2,33.74],"A container ship")],
 stat:"Walmart became the world’s biggest company by revenue by moving goods from factory to shelf faster than anyone",
 body:"Friedman’s seventh flattener is supply-chaining. Every time a till beeps, he writes, Walmart’s computers tell a factory far away to make another one. Goods from China arrive at ports like Long Beach and go by truck to huge distribution centres, then to the shops.",
 more:"Walmart’s global sourcing office has been in Shenzhen since 2002. Critics say its low prices came with low wages and lost factory jobs in America."}),
S({title:"The Dell laptop and peace",view:[95,-5,145,42],globe:[118,18,2],card:"left",hi:["tw","cn"],hiSoft:["my","kr","jp","ph"],
 lines:[{coords:[[121.2,24.9],[115,15],[110,8],[100.3,5.4]],kind:"flow"},{coords:[[127,37.5],[125,30],[115,15],[100.3,5.4]],kind:"flow"},{coords:[[139.7,35.7],[130,25],[115,12],[100.3,5.4]],kind:"flow"},{coords:[[121,14.6],[110,9],[100.3,5.4]],kind:"flow"}],
 pins:[[[100.33,5.41],"Penang, Malaysia: assembled here","point"],[[121.2,24.9],"Taiwan: co-designed here","point"],[[127,37.5],"Korea: memory","point"],[[121,14.6],"The Philippines: chips","point"],[[139.7,35.7],"Japan: parts","point"]],
 phPins:[ph([121.56,25.03],"Taipei 101")],
 stat:"Friedman traced his own Dell laptop: designed in Texas and Taiwan, assembled in Penang from parts made all over Asia",
 body:"From this he drew his ‘Dell theory of conflict prevention’: two countries that are both part of the same big global supply chain, he argues, will not go to war with each other, because both would lose too much. He hoped it would keep China and Taiwan at peace.",
 more:"Critics point to wars between close trading partners, such as Russia and Ukraine in 2014 and 2022. Friedman himself called it a theory, not a law."}),
S({title:"UPS: the parcel company that fixes laptops",view:[-128,22,-64,52],globe:[-95,37,2.2],card:"left",hiSoft:["us"],
 lines:[{coords:[[-122.38,37.62],[-85.74,38.17]],kind:"flow"},{coords:[[-73.78,40.64],[-85.74,38.17]],kind:"flow"},{coords:[[-97.04,32.9],[-85.74,38.17]],kind:"flow"},{coords:[[-80.29,25.8],[-85.74,38.17]],kind:"flow"},{coords:[[-85.74,38.17],[-122.31,47.45]],kind:"flow"},{coords:[[-85.74,38.17],[-87.9,41.98]],kind:"flow"}],
 pins:[[[-85.74,38.17],"Louisville, Kentucky: the UPS Worldport","point"]],
 iconPins:[ic([-85.74,38.17],"gear")],
 phPins:[ph([-84.43,33.64],"A US airport hub")],
 stat:"Every night, hundreds of UPS planes fly into Louisville, sort their parcels and fly out again before dawn",
 body:"Friedman’s eighth flattener is insourcing: a firm like UPS doing jobs inside other firms. When you sent a broken Toshiba laptop back, he found, it went to Louisville, where UPS staff repaired it themselves and flew it straight back. Watch the parcels arrive.",
 more:"Louisville sits within a day’s drive of a large share of America’s people, and its weather rarely closes the airport."}),
S({title:"Dalian: Japan’s back office",view:[110,30,145,45],globe:[128,38,3.5],card:"left",hi:["cn"],hiSoft:["jp","kr"],gfRuler:{a:[121.6,38.91],b:[139.69,35.69]},
 lines:[{coords:[[121.6,38.91],[126,35],[130,33.5],[135,34],[139.69,35.69]],kind:"flow"}],
 pins:[[[121.6,38.91],"Dalian","point"],[[139.69,35.69],"Tokyo","point"],[[126.98,37.57],"Seoul","point"]],
 phPins:[ph([121.62,38.92],"A noodle maker in Dalian")],
 stat:"In Dalian, in north-east China, thousands of Japanese-speaking staff do office work for firms in Japan",
 body:"Friedman visited this port city, which had been under Japanese control for 40 years before 1945 and still teaches many students Japanese. He found call centres and back offices doing data entry, accounts and software for Japanese and Korean firms: China, he says, competing with India for service work too.",
 more:"Tokyo is about 1,700 km away (drag the ruler), a two-hour flight, but over a fibre-optic cable it is next door."}),
S({title:"Drive-through orders from far away",view:[-112,30,-82,44],globe:[-97,38,3.5],card:"left",hiSoft:["us"],gfRuler:{a:[-89.52,37.31],b:[-104.82,38.83]},
 lines:[{coords:[[-89.52,37.31],[-104.82,38.83]],kind:"dash"}],
 pins:[[[-89.52,37.31],"Cape Girardeau, Missouri: a McDonald’s","point"],[[-104.82,38.83],"Colorado Springs: the call centre","point"],[[-111.89,40.76],"Salt Lake City: JetBlue’s home agents","point"]],
 phPins:[ph([-77.0,38.89],"The US Capitol")],
 stat:"A McDonald’s owner had drive-through orders from Missouri taken by staff in Colorado, some 1,400 km away",
 body:"You spoke into the drive-through box, and a worker at a call centre in Colorado Springs typed your order and sent it back to the kitchen (drag the ruler). Friedman uses stories like this, and JetBlue’s booking agents working from home in Utah, to show work moving to wherever it is done best and cheapest.",
 more:"Not all such work went abroad: the flat world, he argues, also lets work move around within a country, or into people’s homes."}),
S({title:"The unflat world",view:W,globe:[20,10,1],card:"left",mode:"gdp",sub:"percapita",
 pins:[[[85.31,25.6],"Bihar, India’s poorest state","point"],[[17,10],"The Sahel","point"],[[77.59,12.97],"Bangalore","point"]],
 phPins:[ph([2.1,13.5],"A village in Niger")],
 stat:"In 2005, the World Bank later estimated, about 1.4 billion people lived on less than $1.25 a day",
 body:"The Economy map shows money per person. Friedman admits that billions of people are not on the flat playing field at all: villages without power or schools, often only a few hours’ drive from booming tech parks. He calls them the unflat world, and warns that their frustration could become a danger.",
 more:"Since 2005 extreme poverty has fallen a lot, above all in China and India, but it remains high in parts of Africa."}),
S({title:"Is the world really flat?",view:[-128,15,30,62],globe:[-30,42,1.6],card:"left",on:["connections"],
 pins:[[[2.17,41.39],"Barcelona: Pankaj Ghemawat","point"],[[-79.4,43.66],"Toronto: Richard Florida","point"]],
 phPins:[ph([-79.38,43.64],"Toronto’s skyline")],
 stat:"The economist Pankaj Ghemawat found that only about 2% of phone-call minutes were international",
 body:"Many scholars think Friedman overstated his case. Ghemawat, writing in 2007, argued that most trade, investment, calls and people still stay at home or close to it: the world is only ‘semi-globalised’. Richard Florida replied that economic activity piles up in a few spiky places. His view is the next tour.",
 more:"The shipping lanes shown are busy, but they link a small number of great ports. Distance, language and borders still shape who trades with whom."}),
S({title:"Now explore",view:W,globe:[60,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Switch on Time zones and Day and night and see which cities are at work right now. Turn on Connections to follow the ships and cables that tie the flat world together. Then try The World Is Spiky, Richard Florida’s answer to this book."})];

const TOURS={
 bflat:{name:"The World Is Flat",short:"The World Is Flat",hint:"Thomas Friedman’s 2005 book, on the map: Bangalore, the Berlin Wall, undersea cables, the 24-hour workday, China’s factories and supply chains",steps:FLAT}};
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
 Wk["bflat|China joins the world’s factory floor"]={emoji:"🚢",name:"Container ships heading for California",size:26,per:2,float:1};
 Wk["bflat|Three ages of globalisation"]={emoji:"⛵",name:"Ships of the three ages",size:24,per:1,float:1};
 Wk["bflat|Walmart’s supply chain"]={emoji:"🚚",name:"Trucks on their way to the shops",size:24,per:2};
 Wk["bflat|UPS: the parcel company that fixes laptops"]={emoji:"📦",name:"Parcels flying in and out of Louisville",size:20,per:1};
 return true});

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.bflat={mid:[
 {at:"Bangalore: the field is levelled",st:"Bangalore: the field is levelled",q:"In which Indian city does the book begin, at the Infosys campus?",o:["Mumbai","Bangalore","Kolkata","Delhi"],a:1,why:"Officially Bengaluru, India’s ‘Silicon Valley’.",kc:"in"},
 {at:"11/9/89: the Wall comes down",st:"11/9/89: the Wall comes down",q:"Friedman’s first flattener is the fall of which wall?",o:["Hadrian’s Wall","The Great Wall","The Berlin Wall","The Western Wall"],a:2,why:"It opened on 9 November 1989.",kc:"de"},
 {at:"China joins the world’s factory floor",st:"China joins the world’s factory floor",q:"China joined the World Trade Organization in which year?",o:["1978","1989","2001","2008"],a:2,why:"On 11 December 2001.",kc:"cn"}],
 recap:[
 {q:"Where was Friedman’s Dell laptop assembled?",o:["Austin, Texas","Penang, Malaysia","Shenzhen, China","Seoul, Korea"],a:1,why:"From parts made all over Asia.",st:"The Dell laptop and peace",kc:"my"},
 {q:"Which Chinese city does back-office work for Japanese firms?",o:["Dalian","Chengdu","Xi’an","Kunming"],a:0,why:"Many of its staff speak Japanese.",st:"Dalian: Japan’s back office",kc:"cn"},
 {q:"Which economist said the world is only ‘semi-globalised’?",o:["Pankaj Ghemawat","Adam Smith","Milton Friedman","John Maynard Keynes"],a:0,why:"Most calls, trade and people still stay close to home.",st:"Is the world really flat?",kc:"es"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "bflat|The World Is Flat":"Pudong Shanghai November 2017 panorama.jpg","bflat|Bangalore: the field is levelled":"Bagmane Tech Park, Bengaluru.jpg",
 "bflat|Three ages of globalisation":"Early European ship - Google Art Project.jpg","bflat|11/9/89: the Wall comes down":"BerlinWall-BrandenburgGate.jpg",
 "bflat|Netscape and the web":"Silicon Valley from above.jpg","bflat|Fibre under the sea":"Land's End, Cornwall, England.jpg",
 "bflat|Y2K: India’s big break":"India vs Australia Test Match at Bengaluru (13 March 2017).jpg","bflat|Working while America sleeps":"Mumbai Skyline with Bandra–Worli Sea Link 25 July 2018 (1).jpg",
 "bflat|China joins the world’s factory floor":"The panorama of Futian Shenzhen.jpg","bflat|Walmart’s supply chain":"Line3174 - Shipping Containers at the terminal at Port Elizabeth, New Jersey - NOAA.jpg",
 "bflat|The Dell laptop and peace":"Taipei 101 from Xiangshan 20260927 (cropped).jpg","bflat|UPS: the parcel company that fixes laptops":"Atlanta Airport – Hartsfield-Jackson Atlanta International Airport in Georgia 20.jpg",
 "bflat|Dalian: Japan’s back office":"Dalian Liaoning China Noodlemaker-01.jpg","bflat|Drive-through orders from far away":"Ford assembly line, 1953.jpg",
 "bflat|The unflat world":"A village in Niger.jpg","bflat|Is the world really flat?":"MAERSK HANOI Container Ship (Port Koper SIKOP, 2023).jpg",
 "bflat|Now explore":"Shanghai-Yangshan-Port-Containers2013-01.JPG"};
const PIN={
 "A tech park in Bengaluru":"Bagmane Tech Park, Bengaluru.jpg","The Berlin Wall falls":"Fall of the Berlin Wall 1989, people walking.jpg","Silicon Valley":"Silicon Valley from above.jpg",
 "Shanghai’s skyline":"Shanghai Pudong skyline by day.jpg","Shenzhen":"The panorama of Futian Shenzhen.jpg","Containers at Yangshan, Shanghai":"Shanghai-Yangshan-Port-Containers2013-01.JPG",
 "Cricket in Bengaluru":"India vs Australia Test Match at Bengaluru (13 March 2017).jpg","A container ship":"MAERSK HANOI Container Ship (Port Koper SIKOP, 2023).jpg",
 "The first internet message":"The IMP Log The Very First Message Sent on the Internet (6293913865).jpg","Mumbai’s skyline":"Mumbai Skyline with Bandra–Worli Sea Link 25 July 2018 (1).jpg",
 "Times Square at night":"Times Square at Night with crowds of people.jpg","Taipei 101":"Taipei 101 from Xiangshan 20260927 (cropped).jpg",
 "A US airport hub":"Atlanta Airport – Hartsfield-Jackson Atlanta International Airport in Georgia 20.jpg","A noodle maker in Dalian":"Dalian Liaoning China Noodlemaker-01.jpg",
 "The US Capitol":"United States Capitol.jpg","A village in Niger":"A village in Niger.jpg","Toronto’s skyline":"Sunset Toronto Skyline Panorama Crop from Snake Island.jpg"};
/* new photos (GF_BFLAT_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_BFLAT_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={bflat:"Bagmane Tech Park, Bengaluru.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
