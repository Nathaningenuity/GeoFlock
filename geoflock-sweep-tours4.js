/* GeoFlock sweep, tours 4: the Regions shelf (Europe, Asia, Africa, North America, South America, Oceania, Antarctica)
   and the Mapped books shelf, reviewed stop by stop in the app.
   Each stop's fixes are keyed "tour|stop title" and applied when the stop opens (psGo is wrapped, as in
   geoflock-polish-m.js, because other scripts reset some stop fields after load):
     body / stat / more   new text (a string), or rep: [[old, new], …] for a small change inside the current text
     view / globe / hi / pins / mode / sub / on / card   set as they are
     pinsDrop: RegExp     drops the text pins whose label matches
     pinsAdd: [...]       adds text pins ([at, label, kind])
     relabel: {old: new}  renames text pins
     ph: [...]            adds photo pins ({at, label, f, d, by, lic, page}); the picture joins the photo library
     phDrop: RegExp       drops photo pins whose label matches
     fn(S)                anything else
   Photos: Wikimedia Commons, free licences, credited in each entry; new files are saved in photos/ as webp. */
(function(){
"use strict";
const SET=(S,k,v)=>{try{S[k]=v}catch(e){}if(S[k]!==v)try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};
const P={};
const A=(k,o)=>{const X=P[k]=P[k]||{};for(const j in o){if(j==="rep"||j==="ph"||j==="pinsAdd")X[j]=(X[j]||[]).concat(o[j]);else X[j]=o[j]}};

/* Around the World in Eighty Days: text pins that only repeated the map's own country names go (the map already
   labels them, and two labels for one country read as two places) */
A("b80days|The wager at the Reform Club",{pinsDrop:/^United Kingdom$/});
A("b80days|The Suez Canal",{pinsDrop:/^Egypt$/});
A("b80days|A railway that wasn’t finished",{pinsDrop:/^India$/});
A("b80days|Saving Aouda",{pinsDrop:/^India$/});
A("b80days|The Pacific Railroad",{pinsDrop:/^United States$/});
A("b80days|Attack on the plains",{pinsDrop:/^United States$/});
A("b80days|Arrested in Liverpool",{pinsDrop:/^(United Kingdom|Ireland)$/});

/* Atlas of Remote Islands: the distance rulers were removed (they covered the islands), so the cards no longer ask
   the reader to drag one; the distances stay in the text */
{const R=[[" (drag the ruler to St Helena)",""],[" (drag the ruler)",""],["Drag the ruler to Antarctica; Cape Town","Cape Town"],
 ["Each page lists the island’s distances to its neighbours; this tour shows them with the ruler.","Each page lists the island’s distances to its neighbours, and so do the cards here."]];
 ["Atlas of Remote Islands","St Kilda","Lonely Island","Semisopochnoi","Bouvet Island","Tristan da Cunha","Tromelin","Christmas Island","Pingelap","Takuu","Howland",
  "Pukapuka","Napuka","Pitcairn","Rapa Nui","Floreana","Clipperton"].forEach(t=>{A("bremote|"+t,{rep:R})})}
/* Pingelap: a "Micronesia" name pin beside the map's own Micronesia label */
A("bremote|Pingelap",{pinsDrop:/^Micronesia$/});

/* Europe */
/* "7 in 10 left in Latvia" read as if seven in ten had left; the chart in the card counts those still there */
A("europe|Emptying in the east",{relabel:{"7 in 10 left in Latvia":"Latvia: about 3 in 10 gone since 1990"}});
/* Asia: the peninsula was divided in 1945, but the two states were founded in 1948 */
A("asia|Two Koreas",{stat:"One people, divided in 1945 and split into two states since 1948"});
/* Africa */
A("africa|The kingdom in the sky",{rep:[["Its rivers supply water to Johannesburg through tunnels, which is one of its main exports.","Its rivers also supply Johannesburg through long tunnels: water is one of Lesotho’s main exports."]]});

/* Stat lines that ran to two or three lines, made to land faster (the detail is still in the card) */
A("oceania|Water from under the desert",{stat:"Beneath more than a fifth of Australia lies a vast store of underground water, some of it two million years old"});
A("bggs|The Chatham Islands, 1835",{stat:"Two peoples from the same Polynesian ancestors met again after centuries apart: the farmers overwhelmed the foragers"});
A("bnations|Printing held back",{stat:"The Ottoman Empire’s first Muslim-run printing press opened in 1727, nearly 300 years after Gutenberg’s"});
A("brihla|The Travels of Ibn Battuta",{stat:"From 1325 to 1354 a young scholar from Tangier travelled some 117,000 km, perhaps farther than anyone before the age of steam"});
A("b80days|Missed by 45 minutes",{stat:"The liner for Liverpool sailed 45 minutes before Fogg reached New York, so he hired a cargo steamer, then took it over"});
A("bsilkroads|Roads of faith",{stat:"Merchants carried gods as well as goods: Buddhism reached China this way, and Christianity reached Chang’an"});
A("b1001|The tales travel on",{stat:"Within a few years of Galland, the Nights were read in English and German; today they exist in almost every language"});
A("bextinction|Ischia: a sea turning sour",{stat:"Off Ischia, volcanic vents bubble carbon dioxide into the sea: a preview of the oceans’ future"});

/* Europe: the tour card covers the left of the map, so views that put the subject at the centre-left are moved for it to
   sit right of the card; Ireland, Iceland and Portugal show on the whole-Europe views */
A("europe|Europe",{view:[-62,33,45,71]});
A("europe|The European Union",{view:[-62,33,45,71]});
A("europe|Now explore",{view:[-62,33,45,71]});
A("europe|A city on two continents",{view:[24.5,39.8,31.5,42.2],globe:[29,41,9]});
A("europe|Russia, cut off from Russia",{view:[8,51,30,59.5],pinsDrop:/^(Poland|Lithuania)$/});
A("europe|Europe’s great rivers",{view:[-35,38,62,62]});
/* Svalbard: the Arctic Circle the card points to (dashed) comes into view, and the islands sit clear of the card */
A("europe|Islands of the midnight sun",{view:[-12,65,38,81],globe:[18,74,3.6]});
A("europe|Greenland icy, Iceland green",{pinsDrop:/^Iceland$/});
A("europe|Choirs and good government",{pinsDrop:/^Italy$/});

/* Asia: views widened to the west, so the Middle East, Central Asia and the west of Siberia are not hidden under the card */
{const W=[-55,-12,150,62];["Asia","Most people","The biggest countries","Asia’s economies","Now explore"].forEach(t=>A("asia|"+t,{view:W}))}
A("asia|Asia’s high peaks",{view:[48,22,104,46]});
A("asia|The rains that feed Asia",{view:[30,-5,135,40]});
A("asia|Asia’s water tower",{view:[40,5,125,45]});
A("asia|Deserts and steppe",{view:[-23,15,125,55]});
A("asia|Siberia",{view:[-27,40,180,78]});
A("asia|Birthplace of religions",{view:[-7,10,92,42]});
A("asia|The Silk Road",{view:[-21,20,115,50]});
A("asia|Asia’s giant cities",{view:[27,-12,145,42]});
A("asia|The two giants’ neighbours",{view:[-65,10,150,75]});
A("asia|Islands of fire",{view:[42,-14,168,58],pinsDrop:/^(Japan|Philippines)$/});
A("asia|Two Koreas",{view:[112,32,134,44]});
A("asia|Two rice baskets on a pole",{pinsDrop:/^Vietnam$/});

/* Africa: whole-continent views widened west, so West Africa is not under the card */
{const W=[-65,-37,56,38];["Africa","Room for three giants","The biggest countries","Most people","Never colonised","Now explore"].forEach(t=>A("africa|"+t,{view:W}))}
/* the straight Saharan borders: the band of countries it names, from Mauritania to Egypt, framed on its own */
A("africa|The Sahara is mostly rock",{view:[-40,12,38,36]});
A("africa|Straight-line borders",{view:[-62,4,42,38]});
/* the Nile's card photo was a felucca's mast against the sky (a tall picture cropped at the top): the river from orbit instead */
A("africa|The Nile",{photo:{f:"Nile River and delta from orbit.jpg",d:"photos/d06b45fd6dbcb764e.webp",by:"Jacques Descloitres, MODIS Rapid Response Team, NASA/GSFC",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Nile_River_and_delta_from_orbit.jpg"}});
/* two photo pins at Giza (the same pyramids twice) and a "Sudan" pin beside the map's own Sudan label */
A("africa|The pyramids",{phDrop:/^Egypt: Pyramids of Giza$/,pinsDrop:/^Sudan$/});
A("africa|Africa’s other great rivers",{view:[-32,-22,40,18]});
/* the twin capitals close up and right of the card; the far-off rainforest and Sangha River pictures pulled the eye away */
A("africa|Capitals face to face",{view:[9.5,-6.5,18.5,-2.5],globe:[15.3,-4.3,7],phDrop:/^(DR Congo: The Congo rainforest|Congo: The Sangha River)/});
A("africa|A river country",{view:[-23,10.5,-11,16.5]});
A("africa|The kingdom in the sky",{view:[20.6,-33.5,32.6,-25.5]});
A("africa|South Africa’s balancing act",{view:[7,-36,34,-21],phDrop:/^South Africa: Table Mountain/});
/* zoomed out a little so the climate map's Mediterranean zone reads as a region, not as big square cells */
A("africa|The city that nearly ran dry",{view:[4,-37,34,-23]});
A("africa|The real southern tip",{view:[14.2,-36.5,22.2,-33],phDrop:/^South Africa: Table Mountain/});

/* North America: the whole-continent views reach west past the date line, so Alaska and the Pacific coast come out from
   under the card */
["North America","Three giants","Three languages","Now explore"].forEach(t=>A("namerica|"+t,{view:[-205,5,-45,80]}));
A("namerica|Canada’s water",{view:[-175,41,-52,75],pinsDrop:/^Canada$/,phDrop:/^Canada: Moraine Lake/});/* the card's own photo already */
A("namerica|The longest border",{view:[-205,36,-55,72]});
A("namerica|Greenland belongs to North America",{view:[-130,28,22,84]});
A("namerica|Alaska breaks every record",{view:[-215,36,-83,72]});
A("namerica|Mountains and rivers",{view:[-205,15,-55,72]});
A("namerica|A capital that sinks",{view:[-118.6,12,-88.6,27],pinsDrop:/^Mexico$/,phDrop:/^Mexico: Chichén Itzá/});
A("namerica|Smaller than Texas",{view:[-118,6,-76,37]});
A("namerica|The Panama Canal",{view:[-90,4,-74,12.5]});
A("namerica|The Caribbean",{view:[-100,9,-58,28]});
A("namerica|Cuba",{view:[-91,18.5,-73,25.5]});
A("namerica|Haiti’s revolution",{view:[-79,16.5,-67,21.5],pinsDrop:/^(Haiti|Dominican Republic)$/});

/* South America: the continent sits right of the card (the Andes and the Pacific coast were under it) */
["South America","Now explore"].forEach(t=>A("samerica|"+t,{view:[-130,-57,-25,14]}));
A("samerica|Further east than you think",{view:[-160,-60,0,50]});
A("samerica|Brazil is half the continent",{view:[-118,-36,5,16]});
A("samerica|A line from 1494",{view:[-110,-57,-25,14],pinsDrop:/^Brazil$/});
A("samerica|Living high in the Andes",{view:[-115,-56,-50,12],pinsDrop:/^(Argentina|Chile)$/});
A("samerica|A ribbon of a country",{view:[-100,-57,-50,-16],pinsDrop:/^Chile$/});
A("samerica|The Amazon basin",{view:[-100,-22,-44,8]});
/* the map's colours are not named: the Cerrado is drawn on the map, and the climate palette has since changed */
A("samerica|Turning bad soil into soybeans",{rep:[["The Cerrado, the tropical savanna (light blue on the map) south of the Amazon rainforest (dark blue), has","The Cerrado, the tropical savanna south of the Amazon rainforest, has"]]});
A("samerica|The Inca Empire",{view:[-95,-36,-60,2]});
/* Rio's pin showed the Maracanã stadium, built in 1950; the Paço Imperial was the royal palace from 1808 */
A("samerica|Europe ruled from Rio",{view:[-80,-32,5,45],pinsDrop:/^Brazil$/,phDrop:/^(Rio de Janeiro: capital, 1808–1821|Brazil: Christ the Redeemer)/,
 ph:[{at:[-43.174,-22.903],label:"Paço Imperial: the king’s palace in Rio",f:"Paço Imperial ao entardecer.jpg",d:"@4505c64d931a9bfc",by:"Guilherme Soares",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Pa%C3%A7o_Imperial_ao_entardecer.jpg"}]});
A("samerica|Rich from frozen beef",{view:[-80,-41,-50,-28],pinsDrop:/^Argentina$/});
A("samerica|Two great waterfalls",{view:[-110,-62,-25,21],pinsDrop:/^(Venezuela|Argentina|Brazil)$/});
A("samerica|Two landlocked countries",{view:[-80,-28,-53,-9],pinsDrop:/^Bolivia$/});
/* the islands were under the card; the tortoise pin repeated both the islands' pin spot and the card's own tortoise photo */
A("samerica|Darwin’s islands",{view:[-105,-10,-75,5],pinsDrop:/^Ecuador$/,phDrop:/^Ecuador: Galápagos tortoise/});
A("samerica|The far south",{view:[-100,-60,-50,-38]});
A("samerica|Two-thirds of Guyana",{view:[-73,0,-53,10]});

/* Oceania: Australia sits clear of the card on the whole-region views */
["Australia is most of it","Now explore"].forEach(t=>A("oceania|"+t,{view:[80,-50,180,8]}));
A("oceania|The red centre",{view:[95,-40,156,-10],pinsDrop:/^Australia$/});
A("oceania|Goyder’s Line",{pinsDrop:/^Australia$/});
A("oceania|Only in Australia",{view:[80,-47,160,-7]});
A("oceania|Water from under the desert",{view:[100,-36,158,-9],pinsDrop:/^Australia$/});
/* two photo pins on the same spot in Funafuti */
A("oceania|Tuvalu’s lucky letters",{phDrop:/^Funafuti, Tuvalu’s capital$/});

/* Antarctica: the penguin and whale pictures off the coast near 80°E were cut off at the bottom of the globe */
A("antarctica|Life at the edge",{globe:[50,-76,1.1]});

/* Prisoners of Geography: repeated pins go (country names beside the map's own labels; a second photo of the Congo at
   Kinshasa, the card's own picture; two photo pins on Damascus) */
A("bprisoners|America’s lucky geography",{pinsDrop:/^United States$/});
A("bprisoners|Africa: bigger than it looks",{phDrop:/^The Congo at Kinshasa$/,globe:[8,2,1.4]});
A("bprisoners|Lines in the sand",{phDrop:/^Damascus$/});
A("bprisoners|Iran, a mountain fortress",{pinsDrop:/^Iran$/});
A("bprisoners|Latin America’s walls",{pinsDrop:/^Peru$/});
A("bprisoners|Brazil’s wall by the sea",{pinsDrop:/^Brazil$/});

/* Guns, Germs, and Steel: name pins that repeated the map's own country labels go */
A("bggs|Yali’s question",{pinsDrop:/^(Papua New Guinea|Indonesia)$/});
A("bggs|The Chatham Islands, 1835",{pinsDrop:/^New Zealand$/});
A("bggs|Germs from the farmyard",{pinsDrop:/^(Mexico|Peru|Spain)$/});
/* the Bantu homeland had "Nigeria" and "Cameroon" pins on top of it; the Cape, where the farmers stopped, was cut off */
A("bggs|Africa’s great migration",{pinsDrop:/^(Cameroon|Nigeria)$/,view:[-55,-37,60,20]});

/* Why Nations Fail */
/* the fence itself, through the middle of town */
A("bnations|Nogales: one town, two countries",{view:[-114.5,29.6,-108.5,33],pinsDrop:/^(United States|Mexico|The two Nogales)$/,
 ph:[{at:[-110.94,31.33],label:"The two Nogales: one fence between them",col:"#d9682b",f:"Mexican-American border at Nogales.jpg",d:"photos/x5f6c26be416216b1.webp",by:"Sgt. 1st Class Gordon Hyde",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Mexican-American_border_at_Nogales.jpg"}]});
A("bnations|The convicts who sued",{pinsDrop:/^Australia$/});
A("bnations|Printing held back",{view:[8,35,40,46]});
A("bnations|Tearing up the railway",{pinsDrop:/^Sierra Leone$/});
A("bnations|Growth that cannot last?",{pinsDrop:/^(Russia|China)$/});
/* the tropics stop now shows the Economy map's money per person, so the reader can see where the poorest countries lie;
   the Stockholm picture (for the Nobel) sat on the Sahara and goes */
A("bnations|Geography or institutions?",{mode:"gdp",sub:"percapita",phDrop:/^Stockholm$/,
 body:"The Economy map shows money per person: the poorest countries cluster between the tropics. Writers such as Jared Diamond and the economist Jeffrey Sachs stress geography: climate, disease and soils. Acemoglu and Robinson reply that the same places were often richer than Europe’s colonies in temperate lands before 1500, and that colonisers set up worse institutions where they could exploit large populations."});

/* Collapse */
/* Pitcairn's label sat behind the card; one of the two moai pictures (the card has its own) goes */
A("bcollapse|Easter Island",{view:[-155,-40,-68,-15],phDrop:/^Rapa Nui \(Easter Island\)$/});
A("bcollapse|Iceland’s blowing soil",{view:[-33,62.8,-12,67],pinsDrop:/^Iceland$/});
/* the Norse in Greenland: the church of the last written record; country-name pins beside the map's own labels go */
A("bcollapse|The Norse in Greenland",{view:[-105,48,8,76],pinsDrop:/^(Iceland|Norway|Greenland \(Denmark\))$/,
 ph:[{at:[-45.78,60.82],label:"Hvalsey church: a wedding in 1408, the last record",col:"#d9682b",f:"Hvalsey Church.jpg",d:"photos/xad319d4040847c9b.webp",by:"Number 57 at English Wikipedia",lic:"CC0",page:"https://commons.wikimedia.org/wiki/File:Hvalsey_Church.jpg"}]});
A("bcollapse|Too many people, too little land",{pinsDrop:/^Rwanda$/});
/* the border between forest and bare hills only shows close up */
A("bcollapse|Hispaniola: one island, two paths",{globe:[-71.7,18.9,9]});
A("bcollapse|Australia: mining the soil",{pinsDrop:/^Australia$/});
A("bcollapse|An oil field that saved the forest",{pinsDrop:/^Papua New Guinea$/});
A("bcollapse|We are all in the polder",{pinsDrop:/^Netherlands$/});

/* Candide: frames moved west so each place sits right of the card (South America, Lisbon, Salé, Buenos Aires,
   Paramaribo, Portsmouth and Edinburgh were under it); country names that repeated the map's labels go */
A("bcandide|Candide",{view:[-140,-45,60,62]});
A("bcandide|Now explore",{view:[-140,-45,60,62]});
A("bcandide|Westphalia: the best of all possible castles",{view:[-8,46,22,56]});
A("bcandide|Bulgars and Abares",{view:[-14,44,26,57]});
A("bcandide|Lisbon, 1 November 1755",{view:[-28,31,1,44]});
A("bcandide|An auto-da-fé to stop the earthquakes",{view:[-16.5,36.3,-3,42.6]});
A("bcandide|The old woman’s story",{view:[-30,28,44,62]});
A("bcandide|From Cádiz to Buenos Aires",{view:[-100,-40,0,42]});
A("bcandide|The Jesuits of Paraguay",{view:[-78,-35,-44,-17],pinsDrop:/^(Paraguay|Argentina|Brazil)$/});
A("bcandide|The golden land",{view:[-100,-20,-46,13]});
A("bcandide|Suriname: the price of sugar",{view:[-90,-10,18,20]});
A("bcandide|Bordeaux and Paris",{view:[-90,-2,12,56]});
A("bcandide|Portsmouth: to encourage the others",{view:[-20,36,14,55]});
A("bcandide|Six kings at the Carnival",{view:[-18,36,36,62]});
A("bcandide|Voltaire’s own garden",{view:[-6,44.5,10,53.5]});

/* Journey to the West: the walk runs west, and its western places sat under the card; frames moved west */
A("bjourneywest|Journey to the West",{view:[30,5,122,50]});
A("bjourneywest|Now explore",{view:[30,5,122,50]});
A("bjourneywest|Monkey, Pigsy and Sandy",{view:[54,10,125,46]});
A("bjourneywest|The khan of the Western Turks",{view:[58,36,84,48]});
A("bjourneywest|Leaving Chang’an against orders",{view:[84,26,120,44]});
A("bjourneywest|Alone across the Gobi",{view:[82,36,106,45]});
A("bjourneywest|A king who would not let him go",{view:[78,39,98,46]});
A("bjourneywest|Kucha and the icy Tian Shan",{view:[66,38,88,45.5]});
A("bjourneywest|Samarkand and the Iron Gate",{view:[52,33,76,44]});
A("bjourneywest|Gandhara and Kashmir",{view:[58,29,82,38.5]});
A("bjourneywest|Harsha’s India",{view:[66,20,92,32]});
A("bjourneywest|Nalanda",{view:[58,8,96,30]});
A("bjourneywest|Over the Pamirs",{view:[62,33,82,41.5]});
A("bjourneywest|Home along the Taklamakan",{view:[60,33,112,44],stat:"The Taklamakan, about 1,000 km across, is one of the largest sand deserts on Earth",
 rep:[["Xuanzang took the southern road around it, from oasis to oasis.","Xuanzang took the southern road around it, from oasis to oasis (drag the ruler across the sand)."]]});

/* The Silk Roads: the western end of each road (Constantinople, Venice, Antioch, Birka, Genoa, Duisburg...) sat under the
   card; frames moved west. Country-name pins beside the map's own labels go. */
A("bsilkroads|The Silk Roads",{view:[-70,0,125,58]});
A("bsilkroads|Now explore",{view:[-70,0,125,58]});
A("bsilkroads|The world’s centre",{view:[5,18,95,52]});
A("bsilkroads|Persia’s royal road",{view:[6,24,58,44]});
A("bsilkroads|Silk and heavenly horses",{view:[-10,22,115,48]});
A("bsilkroads|Roads of faith",{view:[-10,15,118,46]});
A("bsilkroads|Furs, slaves and silver",{view:[-18,28,62,64]});
A("bsilkroads|Crusades and Italian fortunes",{view:[-20,26,46,50]});
A("bsilkroads|The Mongol road",{view:[-50,15,130,58]});
A("bsilkroads|The Black Death",{view:[-45,30,82,56]});
A("bsilkroads|The Great Game",{view:[48,30.3,79.2,43.5]});
A("bsilkroads|The road of black gold",{view:[28,22,64,44]});
A("bsilkroads|The road of wheat",{view:[12,38,54,56],pinsDrop:/^Ukraine$/});
A("bsilkroads|1979 and after",{view:[14,18,80,44],pinsDrop:/^(Iran|Afghanistan|Iraq)$/});
A("bsilkroads|The new Silk Roads",{view:[-60,0,125,58],pinsDrop:/^China$/});

/* Plagues and Peoples: frames moved west so the western end of each route sits right of the card (Kansas and Boston in
   1918, Hispaniola and Seville in 1520, London and Bergen in 1348, Marseille in 541...) */
A("bplagues|Born among parasites",{view:[-46,-36,62,24]});
A("bplagues|Crowds, farms and new diseases",{view:[10,22,62,44],pinsDrop:/^(Iraq|Syria|Turkey|Iran)$/});
A("bplagues|Four pools of disease",{view:[-60,0,135,56]});
A("bplagues|The pools meet: Rome and Han China",{view:[-60,4,128,52]});
A("bplagues|The Plague of Justinian",{view:[-28,22,48,50]});
A("bplagues|From Caffa to Europe, 1346–1351",{view:[-42,28,52,64]});
A("bplagues|Forty days: the first quarantines",{view:[-15,36,32,49]});
A("bplagues|Smallpox conquers Mexico",{view:[-160,-2,-2,42]});
A("bplagues|Fevers that guarded Africa",{view:[-140,-10,20,35]});
A("bplagues|Cholera follows the pilgrims and the armies",{view:[-60,8,100,60]});
A("bplagues|The influenza of 1918",{view:[-180,-2,28,60]});
A("bplagues|The end of smallpox",{view:[-52,-12,60,58],pinsDrop:/^Somalia$/});
A("bplagues|The contest goes on",{view:[-60,-25,130,45],pinsDrop:/^DR Congo$/});

/* A History of the World in Twelve Maps: frames moved west so the European end of each map's story (the Canaries,
   Ceuta, Hereford, Saint-Dié, Amsterdam, London) sits right of the card */
A("b12maps|The world on a clay tablet",{pinsDrop:/^Iraq$/});
A("b12maps|Ptolemy’s Geography",{view:[-110,-30,172,72]});
A("b12maps|Al-Idrisi’s map for a Norman king",{view:[-90,-6,132,60]});
A("b12maps|The Hereford Mappa Mundi",{view:[-62,-7,79,70]});
A("b12maps|The Kangnido: a Korean view of the world",{view:[-80,-40,152,62],pinsDrop:/^North Korea$/});
A("b12maps|Waldseemüller names America",{view:[-160,-42,28,62]});
A("b12maps|Blaeu: maps for money",{view:[-90,-42,150,58]});
A("b12maps|The Cassinis measure France",{view:[-16,40.5,14,52.5],pinsDrop:/^France$/});
A("b12maps|Mackinder’s heartland",{view:[-90,10,150,78]});

/* One Thousand and One Nights: frames moved west so Baghdad, Cairo, Madagascar and the western ports sit right of the card */
A("b1001|One Thousand and One Nights",{view:[-44,-25,125,55]});
A("b1001|Now explore",{view:[-44,-25,125,55]});
A("b1001|Shahrazad’s frame",{view:[5,15,95,50]});
A("b1001|Where the tales came from",{view:[-19,5,95,45]});
A("b1001|Basra: Sindbad sets out",{view:[22,19,64,36]});
A("b1001|The Roc and the valley of diamonds",{view:[4,-30,95,28]});
A("b1001|Camphor, cloves and nutmeg",{view:[40,-14,140,14]});
A("b1001|Mamluk Cairo",{view:[15,20,48,38]});
A("b1001|The City of Brass",{view:[-21,20,40,40]});

/* The Sixth Extinction: frames moved west so the western end of each story (Kentucky, Funk Island, Chicxulub, Washington
   state, Gibraltar) sits right of the card; country names beside the map's own labels and a second white-nose bat go */
A("bextinction|The Panamanian golden frog",{view:[-92,5,-76,13],pinsDrop:/^Panama$/});
A("bextinction|Cuvier’s mastodon",{view:[-160,18,12,62]});
A("bextinction|The great auk",{view:[-95,40,0,68]});
A("bextinction|Gubbio: the clay at the end of the dinosaurs",{view:[-160,8,22,52]});
A("bextinction|Trees climbing the Andes",{pinsDrop:/^Peru$/});
A("bextinction|Bats and white-nose syndrome",{view:[-165,26,-62,52],pinsDrop:/^United States$/,phDrop:/^Bat with white-nose$/});
A("bextinction|The last Sumatran rhinos",{view:[80,-10,122,10],pinsDrop:/^(Indonesia|Malaysia)$/});
/* the lost giants: the world map centred on the Atlantic, so the American mammoth and ground sloth show beside Australia's */
A("bextinction|Where people arrived, big animals vanished",{globe:[10,0,1]});
A("bextinction|Neanderthals in us",{view:[-60,30,95,62]});
A("bextinction|The Frozen Zoo",{view:[-200,10,-100,40]});

/* The World Is Flat: frames moved west so the American end of each story sits right of the card; country-name pins
   beside the map's own labels go */
A("bflat|Bangalore: the field is levelled",{pinsDrop:/^India$/});
A("bflat|Three ages of globalisation",{view:[-150,-5,90,62]});
A("bflat|Netscape and the web",{view:[-132,30,-110,42]});
A("bflat|Fibre under the sea",{view:[-129,-15,150,62]});
A("bflat|Y2K: India’s big break",{view:[55,5,95,32],pinsDrop:/^India$/});
A("bflat|Working while America sleeps",{view:[-170,-30,100,62]});
A("bflat|China joins the world’s factory floor",{pinsDrop:/^China$/});
A("bflat|Walmart’s supply chain",{view:[-156,15,-70,52],pinsDrop:/^United States$/});
A("bflat|The Dell laptop and peace",{view:[65,-5,145,42],pinsDrop:/^(China|South Korea|Taiwan)$/});
A("bflat|UPS: the parcel company that fixes laptops",{pinsDrop:/^United States$/});
A("bflat|Dalian: Japan’s back office",{view:[103,30,145,45],pinsDrop:/^(China|Japan|South Korea)$/,rep:[["Tokyo is about 1,700 km away (drag the ruler)","Tokyo is about 1,600 km away (drag the ruler)"]]});
A("bflat|Drive-through orders from far away",{view:[-135,30,-82,44]});
A("bflat|Is the world really flat?",{view:[-167,15,30,62]});

/* The World Is Spiky: frames moved west so the American peaks (Boston, the Bay Area, Washington) and Lagos sit right of
   the card */
A("bspiky|Read the lights",{view:[-175,-45,160,72]});
A("bspiky|Bos-Wash: one long city",{view:[-86,36.5,-67,44]});
A("bspiky|Chi-Pitts and the Great Lakes",{view:[-101,37,-72,47]});
A("bspiky|Greater Tokyo: the tallest peak",{view:[120,30,145,41]});
A("bspiky|Europe’s banana",{view:[-21,40,22,57]});
A("bspiky|India: peaks, not a plain",{view:[56,6,94,33]});
A("bspiky|Where new ideas come from",{view:[-215,10,150,60]});
A("bspiky|The peaks of science",{view:[-215,22,40,62]});
A("bspiky|Africa’s lights",{view:[-75,-36,56,38]});
A("bspiky|Who’s your city?",{view:[-167,24,-66,50]});
A("bspiky|The creative class",{view:[-172,24,-60,52]});
A("bspiky|Flat and spiky at once",{view:[-190,-30,160,68]});

/* The Voyage of the Beagle: frames moved west so each landing sits right of the card; Tahiti and New Zealand framed
   across the date line (New Zealand's Bay of Islands was off the map) */
A("bbeagle|Plymouth, 1831: a young man joins",{view:[-48,10,8,54]});
A("bbeagle|Giant bones at Punta Alta",{view:[-80,-44,-52,-30],pinsDrop:/^(Argentina|Uruguay)$/});
A("bbeagle|Patagonia: a land that rose",{view:[-90,-56,-54,-38]});
A("bbeagle|The earthquake at Concepción",{view:[-92,-44,-60,-30]});
A("bbeagle|Seashells on the Andes",{view:[-82,-38,-64,-29],pinsDrop:/^Argentina$/});
A("bbeagle|Galápagos: islands of difference",{view:[-108,-12,-72,6],pinsDrop:/^Ecuador$/});
A("bbeagle|Tahiti and New Zealand",{view:[130,-48,215,-12],globe:[-170,-30,2],pinsDrop:/^New Zealand$/});
A("bbeagle|Australia: a strange continent",{view:[86,-46,158,-24]});
A("bbeagle|Coral atolls: Cocos (Keeling)",{view:[40,-30,175,22]});
A("bbeagle|Home by the Cape",{view:[-125,-42,62,56]});
A("bbeagle|From the Beagle to the Origin",{view:[-95,-15,140,60]});

/* Ibn Battuta: the whole-journey maps reach west to the Atlantic so Tangier, Fez and Timbuktu sit right of the card */
A("brihla|The Travels of Ibn Battuta",{view:[-110,-14,126,58]});
A("brihla|A book from memory",{view:[-120,-14,126,58]});

/* Wording: jargon explained, one distance corrected (Cape Horn to the South Shetlands, across the Drake Passage, is
   about 800 km) */
A("europe|The smallest countries",{rep:[["Liechtenstein is one of only two countries surrounded by landlocked countries.","Liechtenstein is one of only two “doubly landlocked” countries, with Uzbekistan: you must cross two borders to reach the sea."]]});
A("asia|Deserts and steppe",{rep:[["one of only two double-landlocked countries, with Liechtenstein.","one of only two “doubly landlocked” countries, with Liechtenstein: from either, you must cross two borders to reach the sea."]]});
A("samerica|The far south",{rep:[["about 1,000 km from Antarctica across the Drake Passage","about 800 km from Antarctica across the Drake Passage"]]});

/* New photo pins (Wikimedia Commons), where a picture explains the idea */
A("europe|Changing wheels at the border",{view:[-52,33,48,70],phDrop:/^Brest Fortress/,ph:[{at:[22.22,48.43],label:"Chop, Ukraine: jacks that lift carriages for new wheels",col:"#d9682b",f:"Bogie change station at Chop station Ukraine.jpg",d:"photos/xc1d9e763dc601185.webp",by:"Maxim75",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Bogie_change_station_at_Chop_station_Ukraine.jpg"}]});
A("asia|The Grand Canal",{pinsDrop:/^Yangzhou$/,ph:[{at:[119.43,32.39],label:"Yangzhou: barges still use the canal",col:"#d9682b",f:"Yangzhou-Modern-Grand-Canal-boats-3353.JPG",d:"photos/x69bd745ca76e7b74.webp",by:"Vmenkov",lic:"CC BY-SA 3.0",page:"https://commons.wikimedia.org/wiki/File:Yangzhou-Modern-Grand-Canal-boats-3353.JPG"}]});
A("bcollapse|Montana: trouble in paradise",{pinsDrop:/^(United States|Butte|Missoula)$/,ph:[{at:[-112.5,46.02],label:"Butte: the Berkeley Pit from space",col:"#d9682b",f:"Berkeley Pit Butte, Montana.jpg",d:"photos/xdb67784f931d425c.webp",by:"NASA",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Berkeley_Pit_Butte%2C_Montana.jpg"}]});

A("africa|The long shadow of the slave trade",{pinsDrop:/^(Benin|Ouidah)$/,ph:[{at:[2.09,6.33],label:"Ouidah: the Door of No Return",col:"#d9682b",f:"Door of no return.jpg",d:"photos/x252e5f06e3a68d5a.webp",by:"Francisco Anzola",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Door_of_no_return.jpg"}]});
A("europe|Islands of the midnight sun",{pinsDrop:/^Global Seed Vault$/,ph:[{at:[15.49,78.24],label:"The Global Seed Vault",col:"#d9682b",f:"Svalbard Global Seed Vault February 2025.jpg",d:"photos/xde1ccd848b107e1c.webp",by:"Michael Major for Crop Trust",lic:"CC BY-SA 2.0",page:"https://commons.wikimedia.org/wiki/File:Svalbard_Global_Seed_Vault_February_2025.jpg"}]});

/* the Fall Line: the falls themselves, from the photo library */
A("namerica|Cities on the waterfall line",{pinsDrop:/^Great Falls of the Potomac$/,ph:[{at:[-77.25,38.998],label:"Great Falls of the Potomac",col:"#d9682b",f:"Great Falls Potomac River VA.JPG",d:"photos/da9c36107d174a3e3.webp",by:"NortyNort",lic:"CC BY-SA 3.0",page:"https://commons.wikimedia.org/wiki/File:Great_Falls_Potomac_River_VA.JPG"}]});

/* the artesian basin: a newly drilled bore gushing by itself, around 1900 */
A("oceania|Water from under the desert",{ph:[{at:[146.5,-28.5],label:"A new bore gushing, about 1900",col:"#d9682b",f:"Beels Bore (9014738440).jpg",d:"photos/xcc16946edd43d869.webp",by:"Powerhouse Museum from Sydney, Australia",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Beels_Bore_%289014738440%29.jpg"}]});

/* ---------- patches go here ---------- */

function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f);
 if(i<0){PS_PHOTO_DATA.push({f:x.f,d:x.d,by:x.by,lic:x.lic,page:x.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
function photos(S,X){
 /* photo pins: the stop always shows these, whatever other scripts later set the list to */
 if(!S._gfT4p){S._gfT4p=1;const mine=(X.ph||[]).map(x=>{const i=libAdd(x);return{at:x.at,label:x.label,col:x.col||"#d9682b",icon:"photo",_f:x.f,img:i}});
  const drop=X.phDrop;const keep=q=>!(drop&&q&&drop.test(String(q.label||"")));
  let base=Array.isArray(S.phPins)?S.phPins.slice():[];let cache=null,ck=null;
  const merged=()=>base.filter(q=>keep(q)&&!mine.some(m=>q&&m.label===q.label)).concat(mine);
  try{Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){if(ck!==base){ck=base;cache=merged()}return cache},set(v){base=Array.isArray(v)?v.filter(q=>!mine.includes(q)):[]}})}catch(e){}
  S._sqPruned=-1}else (X.ph||[]).forEach(libAdd)}
const TXT=["body","stat","more"],RAW=["view","globe","hi","hiSoft","mode","sub","on","card","lines","iconPins","list","keyLabel","gfRuler","xsec","drag","ghosts","G"];
function apply(S){try{if(!S||typeof ps==="undefined"||!ps)return;const X=P[ps.tour+"|"+S.title];if(!X)return;
 /* a stop moved to another map: the tour must be allowed to run on it (alsoOn) */
 if(typeof X.mode==="string"){try{const T=PS_TOURS[ps.tour];if(Array.isArray(T.alsoOn)&&!T.alsoOn.includes(X.mode))T.alsoOn.push(X.mode);if(!T.stopModes)T.stopModes=true}catch(e){}}
 TXT.forEach(k=>{if(typeof X[k]==="string"&&S[k]!==X[k])SET(S,k,X[k])});
 if(X.rep&&!S._gfT4r){S._gfT4r=1;TXT.forEach(k=>{let v=S[k];if(typeof v!=="string")return;X.rep.forEach(([a,b])=>{if(v.includes(a))v=v.split(a).join(b)});if(v!==S[k])SET(S,k,v)})}
 RAW.forEach(k=>{if(!(k in X))return;if(typeof X[k]==="function"){if(S["_gfT4_"+k]!==1){S["_gfT4_"+k]=1;SET(S,k,X[k](S[k],S))}}else if(S[k]!==X[k])SET(S,k,X[k])});
 /* text pins: dropped and renamed on every read, since other scripts add the highlighted countries' name pins later */
 if((X.pinsDrop||X.relabel)&&!S._gfT4d){S._gfT4d=1;let base=S.pins;
  /* cleaned in place on each read, so pins pushed onto the list later are caught too */
  const fix=()=>{if(!Array.isArray(base))return;for(let i=base.length-1;i>=0;i--){const q=base[i];if(!Array.isArray(q))continue;
   if(X.pinsDrop&&X.pinsDrop.test(String(q[1])))base.splice(i,1);else if(X.relabel&&X.relabel[q[1]])base[i]=[q[0],X.relabel[q[1]]].concat(q.slice(2))}};
  try{Object.defineProperty(S,"pins",{configurable:true,enumerable:true,get(){fix();return base},set(v){base=v}})}catch(e){}}
 if(X.pinsAdd&&!S._gfT4a){S._gfT4a=1;SET(S,"pins",(S.pins||[]).concat(X.pinsAdd.filter(q=>!(S.pins||[]).some(x=>Array.isArray(x)&&x[1]===q[1]))))}
 if(X.ph||X.phDrop)photos(S,X);
 /* the card's own photo (PS_PHOTO, by tour and stop title) */
 if(X.photo){try{const i=libAdd(Object.assign({label:"\u200b"+S.title},X.photo));if(i>=0&&typeof PS_PHOTO!=="undefined")PS_PHOTO[ps.tour+"|"+S.title]=i}catch(e){}}
 if(X.fn&&!S._gfT4f){S._gfT4f=1;X.fn(S)}}catch(e){console.error(e)}}
function wrapGo(){if(typeof psGo!=="function")return false;if(psGo._gfT4)return true;const _g=psGo;
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];apply(S)}catch(e){}return _g.apply(this,arguments)};psGo._gfT4=1;return true}
/* wrapped after geoflock-polish-m.js has wrapped psGo, so these fixes run first and polish-m's per-stop fixes still apply */
/* photo pins dropped here are also taken out just before the photo pins are drawn: other scripts (polish-m's own photo
   pins, the stop-photos list) lay their own lists over a stop's photo pins after it opens */
function phClean(){try{if(typeof ps==="undefined"||!ps)return;const S=psSteps()[ps.i],X=S&&P[ps.tour+"|"+S.title];if(!X||!X.phDrop)return;
 const L=S.phPins;if(Array.isArray(L)&&L.some(q=>q&&X.phDrop.test(String(q.label||"")))){S.phPins=L.filter(q=>!(q&&X.phDrop.test(String(q.label||""))));
  /* geoflock-stopphotos.js would add its pins back on the next draw: mark this list as already done */
  try{S._gfSpOk=S.phPins}catch(e){}}}catch(e){}}
function wrapSync(){if(typeof psPhPinsSync!=="function")return false;if(psPhPinsSync._gfT4)return true;const _s=psPhPinsSync;
 psPhPinsSync=function(){phClean();return _s.apply(this,arguments)};psPhPinsSync._gfT4=1;return true}
setInterval(wrapSync,2000);
let n=0;const t=setInterval(()=>{if((typeof psGo==="function"&&psGo._gfM||n>30)&&wrapGo()||++n>80)clearInterval(t)},500);
window.gfSweepT4=P;
})();
