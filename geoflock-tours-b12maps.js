/* GeoFlock: a Mapped books tour.
   b12maps  "A History of the World in Twelve Maps"   Jerry Brotton, 2012
   Each stop puts one of Brotton's maps back on the world it tried to describe. His ideas are summarised in our own words and
   presented as his views; where scholars disagree, the card says so in a line. No book covers or long quotes.
   Tours cannot switch projection stop by stop (only the separate Map projections tour on the Projections page can), so the
   projection stops use what a tour stop can draw: the true-size country dragger (ghosts) and the shared diagrams (PS_DIAG:
   mercator, tissot), and point the reader to the Projections page at the end. Stops about a past year lay that
   year’s states over the Relief map (gfHistYear, geoflock-booktours-relief.js; not mode:"history", which would turn the
   whole tour into a History-map tour, geoflock-tourhist.js); one stop uses the Satellite map (mode:"satellite") through the
   shared stopModes switch; also
   empires laid over the Relief map (gfEmpire, geoflock-tourover.js), the grid layer (on:["grid"]), circles (lines
   {circle,km}), the ruler (gfRuler) and ships along the stops' flow lines (window.gfWalkers, geoflock-walkers.js).
   Photos: Wikimedia Commons, all from the shared library (licence and author in each library entry); new ones would be
   listed in GF_B12MAPS_PHOTOS.
   WANT_PHOTOS: [
    ["Baylonianmaps.JPG","The world on a clay tablet"],
    ["PtolemyWorldMap.jpg","Ptolemy’s Geography"],
    ["TabulaRogeriana upside-down.jpg","Al-Idrisi’s map for a Norman king"],
    ["Hereford-Karte.jpg","The Hereford Mappa Mundi"],
    ["Kangnido.jpg","The Kangnido: a Korean view of the world"],
    ["Waldseemuller map 2.jpg","Waldseemüller names America"],
    ["Diogo Ribeiro map 1529.jpg","Diogo Ribeiro divides the globe"],
    ["Mercator 1569 world map composite.jpg","Mercator’s map for sailors"],
    ["Nova totius Terrarum Orbis geographica ac hydrographica tabula (Hendrik Hondius) balanced.jpg","Blaeu: maps for money"],
    ["Carte de Cassini.jpg","The Cassinis measure France"],
    ["Mackinder's Heartland.jpg","Mackinder’s heartland"],
    ["Gall–Peters projection SW.jpg","The Peters projection"]]
   (Commons names not checked: Wikimedia was rate-limiting.) */
window.GF_B12MAPS_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={b12maps:"#7d6b48"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#a8763f",icon:"photo"});
const ic=(at,icon,col)=>({at,icon,col:col||"#8a5a2b"});
/* a parallel of latitude, in short steps so it is not drawn as one great circle */
const lat=(y,a,b)=>{const c=[];for(let x=a;x<b;x+=4)c.push([x,y]);c.push([b,y]);return{coords:c,kind:"dash"}};

/* =====================================================================================================
   A History of the World in Twelve Maps (Jerry Brotton, 2012)
   ===================================================================================================== */
const MAPS=[
S({title:"A History of the World in Twelve Maps",view:W,globe:[30,30,1],
 phPins:[ph([44.42,32.54],"The Processional Way, Babylon"),ph([29.89,31.21],"The Pharos of Alexandria"),ph([126.98,37.58],"Gyeongbokgung Palace, Seoul"),ph([4.88,52.36],"The Rijksmuseum, Amsterdam"),ph([2.35,48.85],"The Panthéon, Paris"),ph([-122.08,37.42],"Silicon Valley from above")],
 stat:"Jerry Brotton’s 2012 book tells world history through twelve maps, from Ptolemy to Google Earth",
 body:"Brotton, a historian at Queen Mary University of London, argues that no map simply shows the world as it is. Each one puts some place at the centre, chooses what to leave out and serves someone: a king, a church, a company, a nation. This tour puts his maps back on the real world.",
 more:"Each chapter carries a theme: science, exchange, faith, empire, discovery, globalism, toleration, money, nation, geopolitics, equality and information. The stops below follow them in order."}),
S({title:"The world on a clay tablet",view:[28,20,62,44],globe:[44,32,3],card:"left",hi:["iq"],on:["rivers"],
 lines:[{circle:[44.42,32.54],km:520,kind:"circle"}],
 pins:[[[44.42,32.54],"Babylon","point"],[[44.25,33.06],"Sippar, where the tablet was found","point"],[[43.15,36.36],"Assyria","point"],[[48.25,32.19],"Susa","point"],[[47.5,30.5],"The marshes","point"]],
 iconPins:[ic([44.42,32.54],"scroll")],
 phPins:[ph([44.42,32.54],"The Processional Way, Babylon")],
 stat:"The oldest known map of the world, from about 600 BC, puts Babylon at the centre of a disc",
 body:"Brotton begins with a clay tablet now in the British Museum. It shows Babylon and its neighbours ringed by a ‘bitter river’, the ocean (the circle), with strange lands beyond it. He argues that every world map since has done the same thing: put its maker’s home in the middle.",
 more:"The tablet is small enough to hold in one hand. Its cuneiform text describes the far regions beyond the ocean, where mythical beasts and heroes live."}),
S({title:"Ptolemy’s Geography",view:[-34,-30,172,72],globe:[60,25,1.2],card:"left",on:["grid"],gfEmpire:{y:150,gk:"rom",name:"Roman Empire",at:[14,47.5]},
 lines:[lat(63,-15.5,164.5),lat(-16.4,-15.5,164.5),{coords:[[-15.5,63],[-15.5,-16.4]],kind:"dash"},{coords:[[164.5,63],[164.5,-16.4]],kind:"dash"}],
 pins:[[[29.92,31.2],"Alexandria","point"],[[-15.5,28.1],"The Fortunate Isles: longitude 0","point"],[[-1.3,60.3],"Thule","point"],[[80.7,7.9],"Taprobane (Sri Lanka), far too big","point"],[[29.9,0.4],"The Mountains of the Moon","point"]],
 phPins:[ph([29.89,31.21],"The Pharos of Alexandria")],
 stat:"Around AD 150 Ptolemy, in Roman Alexandria, listed some 8,000 places by latitude and longitude",
 body:"Ptolemy’s Geography gave instructions for drawing the known world on a grid, from the Fortunate Isles (the Canaries) in the west through 180° of longitude, and from Thule in the north to south of the Equator (the dashed box). Brotton calls this the birth of a scientific way of mapping that could be copied and corrected.",
 more:"Ptolemy took the Earth to be too small and Asia too wide. When his book reached Florence around 1400 it became a bestseller, and its errors encouraged Columbus to think Asia lay a short sail west of Spain. No maps drawn by Ptolemy himself survive: all we have are later copies."}),
S({title:"Al-Idrisi’s map for a Norman king",view:[-24,-6,132,60],globe:[50,30,1.3],card:"left",
 lines:[12.75,20.5,27.5,33.6,38.9,43.4,47.2,50.5].map(y=>lat(y,-18,128)),
 pins:[[[13.36,38.12],"Palermo, Sicily","point"],[[-5.32,35.89],"Ceuta: al-Idrisi’s birthplace","point"],[[-4.78,37.88],"Córdoba","point"]],
 iconPins:[ic([13.36,38.12],"castle")],
 phPins:[ph([15,37.75],"Mount Etna, Sicily")],
 stat:"In 1154 the Muslim scholar al-Idrisi finished a great geography for Roger II, the Christian king of Sicily",
 body:"Working in Palermo, al-Idrisi drew the world in 70 sectional maps, cutting it into seven climates from the Equator north (the dashed bands) and each climate into ten parts. His map puts south at the top, as many Islamic maps did. Brotton’s theme is exchange: Greek, Arabic and Latin learning meeting at a Norman court.",
 more:"He also made a large silver disc of the world for Roger, said to have been broken up in a revolt soon after the king died. Al-Idrisi gathered reports from merchants and sailors, so his Mediterranean is far better than his Africa or Asia."}),
S({title:"The Hereford Mappa Mundi",view:[-18,12,62,60],globe:[20,38,1.8],card:"left",
 lines:[{circle:[35.23,31.78],km:3300,kind:"circle"},{coords:[[-5.35,36.14],[5,38],[15,36.5],[25,34.8],[34.75,32.05]],kind:"dash"},{coords:[[39.3,47.1],[36,42.8],[33,36.5],[31.2,30.05],[32.9,24.1]],kind:"dash"}],
 pins:[[[-2.716,52.054],"Hereford Cathedral","point"],[[35.23,31.78],"Jerusalem, at the centre","point"],[[-5.35,36.14],"The Pillars of Hercules","point"],[[12.5,41.9],"Rome","point"]],
 iconPins:[ic([35.23,31.78],"cross"),ic([-2.716,52.054],"cross")],
 phPins:[ph([35.23,31.78],"The Church of the Holy Sepulchre")],
 stat:"Drawn around 1300, the Hereford map puts Jerusalem at the centre of the world and the east, with Paradise, at the top",
 body:"The map is about 1.6 m tall, on a single calf skin. Its world is a circle (drawn here round Jerusalem) split by the Mediterranean and by the rivers Don and Nile into Europe, Asia and Africa (the dashed lines). Brotton’s theme is faith: this map shows the story of salvation more than the routes a traveller could follow.",
 more:"It is crowded with Bible stories, Alexander the Great, monsters and over 1,000 inscriptions. In 1988 the cathedral planned to sell it to pay for repairs; a public campaign and gifts, including one from John Paul Getty Jr, kept it in Hereford."}),
S({title:"The Kangnido: a Korean view of the world",view:[-26,-40,152,62],globe:[80,25,1.1],card:"left",hi:["kr","kp"],
 lines:[{coords:[[126.98,37.57],[80,38],[29.89,31.21]],kind:"dash"},{coords:[[126.98,37.57],[70,5],[20,-34.8]],kind:"dash"}],
 pins:[[[126.98,37.57],"Hanseong (Seoul): the map’s home","point"],[[116.4,39.9],"China, drawn huge at the centre","point"],[[135.76,34.99],"Kyoto: the oldest surviving copy","point"],[[29.89,31.21],"Alexandria and its lighthouse","point"],[[20,-34.8],"Africa’s southern tip","point"]],
 iconPins:[ic([29.89,31.21],"lighthouse")],
 phPins:[ph([126.98,37.58],"Gyeongbokgung Palace, Seoul")],
 stat:"Made in Korea in 1402, the Kangnido shows Europe, Africa and Arabia, decades before Europeans sailed round Africa",
 body:"Korean scholars of the new Joseon dynasty combined Chinese maps made under the Mongols with their own map of Korea. China fills the middle; Korea is drawn far larger than life and Japan small. Yet the far west is there too: the Mediterranean, Alexandria’s lighthouse and a pointed southern tip of Africa (the dashed lines show how far the map reached).",
 more:"Brotton’s theme is empire: the map celebrates the new dynasty’s place in a Chinese-centred world. The original is lost; the oldest copy is kept at Ryukoku University in Kyoto."}),
S({title:"Waldseemüller names America",view:[-108,-42,28,62],globe:[-40,20,1.2],card:"left",
 lines:[{coords:[[-9.14,38.72],[-17,27],[-23.5,14.9],[-30,3],[-35.3,-5.5],[-38.5,-13],[-41,-22.5],[-47,-26]],kind:"flow"},{coords:[[-6.95,37.2],[-16,28.1],[-40,26],[-74.5,24.1]],kind:"flow"}],
 pins:[[[6.95,48.28],"Saint-Dié, Lorraine","point"],[[9.79,47.82],"Wolfegg Castle: found in 1901","point"],[[-77,38.89],"Library of Congress, Washington","point"],[[-55,-18],"‘America’, written here","point"]],
 phPins:[ph([7.75,48.58],"Strasbourg, where his 1513 Ptolemy was printed")],
 stat:"In 1507 Martin Waldseemüller printed a world map that named the new southern continent ‘America’",
 body:"Working in Saint-Dié, in eastern France, Waldseemüller and his colleagues read Amerigo Vespucci’s accounts of sailing down the coast of Brazil (the southern arrow) and concluded this was a new continent, not Asia, as Columbus (the northern arrow) believed. They named it after Vespucci. Brotton’s theme is discovery: the map changed what Europeans thought the world was.",
 more:"Of about 1,000 printed copies, one survives. It turned up in a German castle in 1901, and the Library of Congress bought it in 2003 for $10 million. Waldseemüller later dropped the name, but it had already caught on."}),
S({title:"Diogo Ribeiro divides the globe",view:W,globe:[20,10,1],card:"left",gfHistYear:{y:1530,labels:[]},
 lines:[{coords:[[-46.6,72],[-46.6,0],[-46.6,-60]],kind:"red"},{coords:[[144.5,60],[144.5,0],[144.5,-50]],kind:"red"}],
 pins:[[[-5.99,37.39],"Seville: the Casa de Contratación","point"],[[127.38,0.79],"Ternate, in the Moluccas","point"],[[-46.6,25],"Tordesillas line, 1494","point"],[[144.5,25],"Zaragoza line, 1529","point"]],
 iconPins:[ic([127.38,0.79],"spice")],
 phPins:[ph([127.38,0.79],"Nutmeg, from the Spice Islands"),ph([12.45,41.9],"The Vatican: one copy of the map")],
 stat:"In 1529 Spain and Portugal split the whole globe between them along two lines (red)",
 body:"The shading shows the states of 1530. The Treaty of Tordesillas had drawn a line down the Atlantic; but where did the line fall on the other side of the world, among the clove and nutmeg islands of the Moluccas? Diogo Ribeiro, a Portuguese mapmaker working for Spain in Seville, drew a world map that placed the Spice Islands on Spain’s side.",
 more:"Brotton’s theme is globalism: one of the first maps of the whole world, made to win an argument about trade. In the Treaty of Zaragoza in 1529 Spain sold its claim to the islands to Portugal for 350,000 ducats; the line was set about 17° east of the Moluccas."}),
S({title:"Mercator’s map for sailors",view:W,globe:[10,30,1],card:"left",
 ghosts:[{code:"gl",at:[18,4],col:"#7d6b48",label:"Greenland, true size"}],
 pins:[[[6.76,51.43],"Duisburg: the map is printed, 1569","point"],[[4.29,51.13],"Rupelmonde: Mercator jailed, 1544","point"]],
 iconPins:[ic([6.76,51.43],"anchor")],
 phPins:[ph([-25,36],"A replica of Columbus’s Santa María")],
 stat:"Gerard Mercator’s 1569 map let sailors steer a straight line, and made Greenland look as big as Africa",
 body:"Mercator stretched the map north and south exactly as much as it stretched east and west, so every compass bearing became a straight line: perfect for navigators. The price is that lands far from the Equator swell: drag Greenland, here at its true size, back north. The card’s chart shows by how much.",
 more:"Brotton’s theme is toleration: Mercator, a Catholic from Flanders, was jailed for months on suspicion of heresy and later settled in Protestant Duisburg. He also gave the word ‘atlas’ to a book of maps."}),
S({title:"Blaeu: maps for money",view:[-10,-42,150,58],globe:[60,10,1.2],card:"left",gfHistYear:{y:1650,focus:"ned"},
 lines:[{coords:[[4.9,52.37],[-5,48],[-18,25],[-15,0],[0,-25],[18.42,-33.92]],kind:"flow"},{coords:[[18.42,-33.92],[50,-38],[90,-32],[106.82,-6.13]],kind:"flow"},{coords:[[106.82,-6.13],[110,5],[120,22],[129.87,32.74]],kind:"flow"}],
 pins:[[[4.9,52.37],"Amsterdam","point"],[[18.42,-33.92],"The Cape, 1652","point"],[[106.82,-6.13],"Batavia (Jakarta)","point"],[[129.87,32.74],"Dejima, Nagasaki","point"]],
 iconPins:[ic([106.82,-6.13],"ship"),ic([4.9,52.37],"book")],
 phPins:[ph([4.88,52.36],"The Rijksmuseum, Amsterdam"),ph([18.42,-33.96],"Table Mountain, Cape Town"),ph([129.87,32.74],"Dejima, Nagasaki")],
 stat:"Joan Blaeu’s Atlas Maior of 1662 was the biggest and most expensive book of the 17th century",
 body:"The shading shows the world in 1650, the Dutch possessions strongest. The Blaeu family were official mapmakers to the Dutch East India Company, keeping its secret charts of the route to Asia (the arrows). Brotton’s theme is money: in Amsterdam, maps became luxury goods, sold to rich buyers as much for show as for use.",
 more:"The Atlas Maior had around 600 maps in up to 11 volumes, often hand-coloured. Brotton argues that, beautiful as it was, it added little new: it was a product, made to sell."}),
S({title:"The Cassinis measure France",view:[-10,40.5,14,52.5],globe:[2.4,46.5,3.5],card:"left",hi:["fr"],gfRuler:{a:[2.37,51.03],b:[2.17,41.39]},
 lines:[{coords:[[2.37,51.03],[2.3364,48.8363],[2.4,47.08],[2.57,44.35],[2.9,42.7],[2.17,41.39]],kind:"dash"},{coords:[[2.37,51.03],[3.1,50.2],[1.8,49.5],[2.3364,48.8363],[1.6,48],[2.4,47.08],[3.1,46],[2.57,44.35],[1.8,43.5],[2.9,42.7]],kind:"solid"}],
 pins:[[[2.3364,48.8363],"Paris Observatory","point"],[[2.37,51.03],"Dunkirk","point"],[[2.17,41.39],"Barcelona","point"]],
 phPins:[ph([2.35,48.85],"The Panthéon, Paris")],
 stat:"Four generations of the Cassini family spent over a century mapping France by measuring triangles",
 body:"From the Paris Observatory, surveyors measured a long chain of triangles along the meridian (the zigzag) and then across the whole country. The finished map, 182 sheets, showed every village, road and river. Brotton’s theme is the nation: for the first time a state could see all its land, measured the same way.",
 more:"The Revolution took the map over from the family in 1793. In the 1790s, surveyors measured the meridian from Dunkirk to Barcelona again (drag the ruler) to define a new unit, the metre."}),
S({title:"Mackinder’s heartland",view:[-20,10,150,78],globe:[75,50,1.2],card:"left",gfEmpire:{y:1904,gk:"rus",name:"Russian Empire",at:[95,62]},
 lines:[{coords:[[37.62,55.75],[60.6,56.84],[73.37,54.98],[82.92,55.03],[104.3,52.29],[113.5,52.03],[127.5,50.25],[135.07,48.48],[131.89,43.12]],kind:"flow"}],
 pins:[[[-0.175,51.501],"London: the Royal Geographical Society","point"],[[75,57],"The ‘pivot area’","point"],[[131.89,43.12],"Vladivostok: end of the Trans-Siberian","point"]],
 iconPins:[ic([90,55],"train")],
 phPins:[ph([82,54],"The Trans-Siberian Railway")],
 stat:"In 1904 the geographer Halford Mackinder told London that the power holding inner Eurasia could rule the world",
 body:"Mackinder called the vast inland region he saw as the ‘pivot of history’, out of reach of sea power, the heartland; here it is shaded as the Russian Empire of 1904. Railways like the Trans-Siberian (the line), he argued, would let a land power move armies and goods across it faster than Britain’s navy could sail around.",
 more:"Brotton’s theme is geopolitics. Mackinder’s idea was later taken up by German writers and used to justify expansion, which he opposed; it still shapes debate about Russia and China. Many historians think it gave geography too much power over events."}),
S({title:"The Peters projection",view:W,globe:[20,10,1],card:"left",
 ghosts:[{code:"in",at:[12,51],col:"#7d6b48",label:"India, true size"},{code:"br",at:[-100,48],col:"#9a5a48",label:"Brazil, true size"}],
 pins:[[[7.1,50.73],"Bonn: the map is launched, 1973","point"],[[-4.25,55.86],"Glasgow: James Gall’s version, 1855","point"]],
 stat:"In 1973 the German historian Arno Peters presented an equal-area world map as a fairer picture of the poorer south",
 body:"Peters argued that maps like Mercator’s make Europe and North America look bigger and more important than Africa, South America and South Asia. His map shows every country at its true area, though shapes near the Equator are stretched tall. Drag India over Europe and Brazil over the USA to compare. The card shows how one circle changes shape on two maps.",
 more:"Brotton’s theme is equality. Cartographers attacked Peters: his projection was almost the same as one James Gall had published in 1855, and many equal-area maps keep shapes better. Yet aid groups and UN agencies adopted it, and the row made millions ask what their maps were hiding."}),
S({title:"Google Earth",view:[-150,-50,60,75],globe:[-30,25,1],card:"left",mode:"satellite",
 pins:[[[-122.08,37.42],"Mountain View: Google","point"]],
 phPins:[ph([-122.0,37.4],"Silicon Valley from above")],
 stat:"Launched in 2005, Google Earth let anyone fly over a picture of the whole planet stitched from satellite photos",
 body:"This is the Satellite map, built the same way: thousands of satellite images joined into one. Brotton’s last theme is information. He argues that the map of the world is now made by a private company, which decides what to show, how to rank it and what to sell around it.",
 more:"Google bought the start-up Keyhole, which had built the software, in 2004. Brotton’s conclusion: no map, however detailed, is ever the world itself; every map is an argument about it."}),
S({title:"Now explore",view:W,globe:[30,30,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Open the Projections page and take the Map projections tour: switch between Mercator, equal-area and globe views, and drag countries to their true size. Turn on the grid to see Ptolemy’s latitude and longitude. Then try Prisoners of Geography, another book about how maps shape power."})];

const TOURS={
 b12maps:{name:"A History of the World in Twelve Maps",short:"Twelve Maps",hint:"Jerry Brotton’s 2012 book, on the map: Ptolemy, al-Idrisi, the Hereford Mappa Mundi, the Kangnido, America named, Mercator, Blaeu, the Cassinis, Mackinder, Peters and Google Earth",steps:MAPS}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"books",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"1650/ned") is set up as if the tour ran on that map */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- diagrams in the card (shared library) ---------- */
try{if(typeof PS_DIAG!=="undefined"&&typeof DG!=="undefined"){const D={"b12maps|Mercator’s map for sailors":"mercator","b12maps|The Peters projection":"tissot"};for(const k in D)if(DG[D[k]])PS_DIAG[k]=D[k]}}catch(e){}

/* ---------- travellers along the stops’ flow lines (geoflock-walkers.js) ---------- */
const WALK={
 "b12maps|Waldseemüller names America":{emoji:"⛵",name:"Vespucci’s and Columbus’s ships",size:26,per:1,float:1},
 "b12maps|Blaeu: maps for money":{emoji:"⛵",name:"A Dutch East Indiaman",size:26,per:2,float:1},
 "b12maps|Mackinder’s heartland":{emoji:"🚂",name:"The Trans-Siberian Railway",size:24,per:2}};
const addW=()=>{try{if(window.gfWalkers)for(const k in WALK)if(!gfWalkers[k])gfWalkers[k]=WALK[k]}catch(e){}};addW();addEventListener("load",addW);

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.b12maps={mid:[
 {at:"Ptolemy’s Geography",st:"Ptolemy’s Geography",q:"In which city did Ptolemy write his Geography?",o:["Athens","Rome","Alexandria","Babylon"],a:2,why:"Roman Alexandria, around AD 150.",kc:"eg"},
 {at:"The Hereford Mappa Mundi",st:"The Hereford Mappa Mundi",q:"Which city sits at the centre of the Hereford Mappa Mundi?",o:["Rome","Jerusalem","Constantinople","Hereford"],a:1,why:"East, with Paradise, is at the top.",kc:"il"},
 {at:"Waldseemüller names America",st:"Waldseemüller names America",q:"Who was America named after?",o:["Christopher Columbus","Amerigo Vespucci","John Cabot","Martin Waldseemüller"],a:1,why:"Waldseemüller read Vespucci’s accounts of sailing down the coast of Brazil.",kc:"br"}],
 recap:[
 {q:"Which country made the Kangnido world map in 1402?",o:["China","Japan","Korea","Mongolia"],a:2,why:"Scholars of the new Joseon dynasty, in Hanseong (Seoul).",st:"The Kangnido: a Korean view of the world",kc:"kr"},
 {q:"What was Mercator’s 1569 map designed for?",o:["Showing true areas","Navigation at sea","Measuring mountains","Teaching children"],a:1,why:"Every compass bearing is a straight line on it.",st:"Mercator’s map for sailors",kc:"de"},
 {q:"Which unit of length came out of measuring the meridian from Dunkirk to Barcelona?",o:["The mile","The metre","The league","The foot"],a:1,why:"In the 1790s, after the Cassinis’ survey.",st:"The Cassinis measure France",kc:"fr"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "b12maps|A History of the World in Twelve Maps":"British Empire map - The India and Colonial Exhibition, London (1886) - BL.jpg","b12maps|The world on a clay tablet":"Processional Way, Babylon - Google Art Project.jpg",
 "b12maps|Ptolemy’s Geography":"Philip Galle - Lighthouse of Alexandria (Pharos of Alexandria) - 1572.jpg","b12maps|Al-Idrisi’s map for a Norman king":"Great Mosque of Cordoba, interior, 8th - 10th centuries (38) (29721130342).jpg",
 "b12maps|The Hereford Mappa Mundi":"Jerusalem Dome of the rock BW 14.JPG","b12maps|The Kangnido: a Korean view of the world":"Gyeonghoeru (Royal Banquet Hall) at Gyeongbokgung Palace, Seoul.jpg",
 "b12maps|Waldseemüller names America":"Landing of Columbus (2).jpg","b12maps|Diogo Ribeiro divides the globe":"Sevilla Cathedral - Southeast.jpg",
 "b12maps|Mercator’s map for sailors":"Santa Maria replica ship.jpg","b12maps|Blaeu: maps for money":"KeizersgrachtReguliersgrachtAmsterdam.jpg",
 "b12maps|The Cassinis measure France":"Pantheon of Paris 007.JPG","b12maps|Mackinder’s heartland":"Trans-Siberian train on the steppe.jpg",
 "b12maps|The Peters projection":"Blue Marble Western Hemisphere.jpg","b12maps|Google Earth":"Blue Marble 2002.png",
 "b12maps|Now explore":"Feet on prime meridian greenwich observatory.jpg"};
const PIN={
 "The Processional Way, Babylon":"Processional Way, Babylon - Google Art Project.jpg","The Pharos of Alexandria":"Philip Galle - Lighthouse of Alexandria (Pharos of Alexandria) - 1572.jpg",
 "Gyeongbokgung Palace, Seoul":"Gyeonghoeru (Royal Banquet Hall) at Gyeongbokgung Palace, Seoul.jpg","The Rijksmuseum, Amsterdam":"South facade of the Rijksmuseum Amsterdam (DSCF0528).jpg",
 "The Panthéon, Paris":"Pantheon of Paris 007.JPG","Silicon Valley from above":"Silicon Valley from above.jpg","Mount Etna, Sicily":"Etna eruptions April 2012.JPG",
 "The Church of the Holy Sepulchre":"Church of the Holy Sepulchre by Gerd Eichmann (cropped).jpg","Strasbourg, where his 1513 Ptolemy was printed":"Strasbourg Cathedral Exterior - Diliff.jpg",
 "Nutmeg, from the Spice Islands":"Nutmeg ready.jpg","The Vatican: one copy of the map":"Museums in the Vatican City.jpg","A replica of Columbus’s Santa María":"Santa Maria replica ship.jpg",
 "Table Mountain, Cape Town":"Cape Town (ZA), Table Mountain -- 2024 -- 2825.jpg","Dejima, Nagasaki":"Former Dejima Protestant Seminary, Dejima, Nagasaki, 20240815 1453 3707.jpg",
 "The Trans-Siberian Railway":"Trans-Siberian train on the steppe.jpg"};
/* new photos (GF_B12MAPS_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_B12MAPS_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={b12maps:"British Empire map - The India and Colonial Exhibition, London (1886) - BL.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
