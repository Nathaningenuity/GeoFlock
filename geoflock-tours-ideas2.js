/* GeoFlock: three tours for the Ideas & arts shelf.
   mythology  "Myths and legends"        real places behind famous myths: Olympus, Troy, Thera and Atlantis, the flood, Uluru, Kailash,
                                          Norse fire and ice, Loch Ness, Stonehenge, Pele, Fuji and Teotihuacan
   science    "Where science happened"   from Zhang Heng's earthquake detector to CERN: observatories, labs, voyages and expeditions
   maths      "Maths on the map"         where maths was made (Babylon, Alexandria, the House of Wisdom, the Kerala school, Königsberg)
                                          and maths you can see on the map (great circles, projections, latitude, antipodes, coastlines)
   Stops reuse what the World Maps view draws: per-stop layers (on:[…]), the history map for one stop (mode:"history", sub:"<year>/<group>"),
   the satellite and night maps (mode:…, through the shared stopModes switch), the ruler (gfRuler), the country dragger (ghosts),
   the day-and-night gadget (gfSun), the sea-level gadget (gfSea) and the height threshold (gfThr).
   Photos: Wikimedia Commons (licence and author in each library entry); new ones are listed in GF_IDEAS2_PHOTOS. */
window.GF_IDEAS2_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const COL={mythology:"#9a6fd8",science:"#7d68d2",maths:"#b483e0"},W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:"#8a63cf",icon:"photo"});
const MAR=[[-18,66.5],[-24,63],[-30,57],[-30,52],[-28.5,45],[-33,38],[-38,31],[-45,23],[-46,15],[-40,9],[-31,3],[-20,0],[-14,-5],[-13,-12],[-14,-20],[-12.5,-30],[-15,-38],[-17,-48],[-8,-54]];
/* a ring of n points, radius km, round a centre (for the LHC) */
const ring=(c,km,n)=>{const out=[];for(let i=0;i<=n;i++){const a=i/n*2*Math.PI;out.push([+(c[0]+km/(111.32*Math.cos(c[1]*Math.PI/180))*Math.cos(a)).toFixed(4),+(c[1]+km/111.32*Math.sin(a)).toFixed(4)])}return out};

/* =====================================================================================================
   1. Myths and legends
   ===================================================================================================== */
const MYTH=[
S({title:"Myths and legends",view:W,globe:[30,25,1],
 phPins:[ph([22.5,38.48],"Delphi"),ph([131.04,-25.34],"Uluru"),ph([-1.83,51.18],"Stonehenge"),ph([25.38,36.46],"Santorini"),ph([31.14,29.98],"The Great Sphinx"),ph([138.73,35.36],"Mount Fuji"),ph([-98.84,19.69],"Teotihuacan"),ph([-155.28,19.41],"Kīlauea’s lava"),ph([-21.13,64.26],"Þingvellir")],
 stat:"Every people on Earth tells stories about how the world began, and many of them are tied to real places",
 body:"Myths explain where the world, the gods and the people came from. This tour visits the mountains, islands, lakes and ruins where famous myths and legends are set, and asks what is really there.",
 more:"Some legends may hold memories of real events, such as eruptions, floods or rising seas. Others were invented, or grew with each telling; this tour says which is which, as far as anyone knows."}),
S({title:"Mount Olympus and Delphi",view:[13.7,35.8,27.7,42.8],globe:[22.4,39.3,4],card:"left",hi:["gr"],gfThr:{kind:"elev",v:2000},
 pins:[[[22.35,40.09],"Mount Olympus 2,918 m","peak"],[[22.5,38.48],"Delphi","point"],[[22.62,38.53],"Mount Parnassus","peak"]],
 phPins:[ph([22.5,38.48],"Delphi")],
 stat:"Mount Olympus, home of the Greek gods, is Greece’s highest mountain: 2,918 m",
 body:"The Greeks said Zeus and the other Olympians lived on its cloudy summit; the map shows only land above 2,000 m, and Olympus stands out. Zeus once sent two eagles flying from the two ends of the world, and where they met, at Delphi, was the centre of the Earth.",
 more:"A carved stone at Delphi, the omphalos, marked this ‘navel of the world’, and the priestess of Apollo gave oracles there. The summit of Olympus was first climbed only in 1913."}),
S({title:"Troy",view:[12.9,33.5,38.9,46.5],globe:[28,39.5,3.2],card:"left",mode:"history",sub:"bc1500/hit",
 pins:[[[26.24,39.96],"Troy (Hisarlik)","point"],[[34.62,40.02],"Hattusa, the Hittite capital","point"],[[22.76,37.73],"Mycenae","point"]],
 phPins:[ph([22.76,37.73],"Mycenae’s Lion Gate")],
 stat:"Homer’s Troy was a real city: its ruins lie at Hisarlik in Turkey, near the Dardanelles",
 body:"Homer’s Iliad tells of a ten-year Greek siege of Troy. Heinrich Schliemann began digging the mound of Hisarlik in 1871 and found nine cities built on top of one another; one that burned around 1200 BC may be the Troy of the legend.",
 more:"Letters of the Hittite kings, whose empire is lit on this map of about 1500 BC, mention a city called Wilusa, probably the Greek Ilios, Troy. Whether the war happened as Homer tells it, no one knows."}),
S({title:"Thera and Atlantis",view:[21.6,34.7,27.6,37.7],globe:[25.4,36.4,5],card:"left",on:["hazards","plates"],
 pins:[[[25.4,36.4],"Thera (Santorini)","point"],[[25.16,35.3],"Knossos, Crete","point"]],
 phPins:[ph([25.38,36.46],"Santorini"),ph([25.16,35.3],"Knossos")],
 stat:"Santorini’s ring of islands is the rim of a volcano that blew apart about 3,600 years ago",
 body:"Around 1600 BC Thera erupted in one of the biggest eruptions of the last 10,000 years, and the sea flooded into its collapsed centre, leaving today’s ring of islands. It is one of a chain of volcanoes above the place where the African plate sinks under the Aegean. The Minoans of nearby Crete, builders of the palace of Knossos, lived through it.",
 more:"The philosopher Plato told of Atlantis, an island empire beyond the Pillars of Heracles that sank in a single day and night. Most historians think Plato made Atlantis up to teach a lesson; one theory says memories of Thera helped inspire it."}),
S({title:"The flood",view:[30.9,29.5,52.9,41],globe:[44,35,3],card:"left",mode:"history",sub:"bc700/ass",
 pins:[[[43.15,36.36],"Nineveh: the flood tablet","point"],[[44.3,39.7],"Mount Ararat 5,137 m","peak"],[[45.51,31.78],"Shuruppak","point"]],
 phPins:[ph([44.3,39.7],"Mount Ararat"),ph([40.5,34.8],"A cuneiform tablet")],
 stat:"A clay tablet from Nineveh tells of a great flood, a boat and a bird sent out to find land, long before the Bible was written down",
 body:"In 1872 George Smith, working at the British Museum, read a tablet of the Epic of Gilgamesh from the library of the Assyrian king Ashurbanipal. In it Utnapishtim, warned by a god, builds a boat for his family and animals; it comes to rest on a mountain.",
 more:"The Bible’s story of Noah places the ark ‘on the mountains of Ararat’, the old kingdom of Urartu; today Mount Ararat, in Turkey, carries the name. Mesopotamia’s rivers flooded often, and archaeologists have found thick flood layers in its cities."}),
S({title:"Stories that remember the sea",view:[94.6,-47,164.6,-3],globe:[135,-25,1.8],card:"left",hi:["au"],gfSea:-120,
 pins:[[[137.4,-34.2],"Spencer Gulf","point"],[[137.2,-35.8],"Kangaroo Island","point"],[[144.9,-38.1],"Port Phillip Bay","point"]],
 phPins:[ph([131.04,-25.34],"Uluru")],
 stat:"At the end of the last ice age the sea rose about 120 m, drowning wide coastal plains",
 body:"Here the sea is lowered to its ice-age level: Australia joins New Guinea and Tasmania. Aboriginal stories from more than 20 places around the coast tell of a time when the shore was far out and islands were part of the mainland.",
 more:"Researchers Patrick Nunn and Nicholas Reid argued in 2016 that these stories may be memories passed down for more than 7,000 years, since the sea reached about today’s level. Other experts are more cautious; stories also change as they are retold."}),
S({title:"Uluru",view:[116.1,-31,140.1,-19],globe:[131,-25,3],card:"left",hi:["au"],
 pins:[[[131.04,-25.34],"Uluru","point"],[[130.73,-25.3],"Kata Tjuta","point"]],
 phPins:[ph([131.04,-25.36],"Uluru’s Kuniya walk")],
 stat:"Uluru rises 348 m above the flat desert of central Australia",
 body:"For the Anangu, Uluru’s caves, cracks and waterholes were made by ancestral beings in the Tjukurpa, the creation time, and the stories are still law today. Marks on the rock are left from a battle between Kuniya, a python woman, and Liru, a poisonous snake man.",
 more:"The land was handed back to the Anangu in 1985 and is run jointly with the national park. Since 26 October 2019 visitors may no longer climb the rock, out of respect for its meaning."}),
S({title:"Mount Kailash",view:[65.9,24.5,91.9,37.5],globe:[82,31,3],card:"left",hi:["cn"],hiSoft:["in","np"],on:["rivers"],
 pins:[[[81.31,31.07],"Mount Kailash 6,638 m","peak"],[[81.45,30.67],"Lake Manasarovar","point"]],
 phPins:[ph([84,32.2],"The Tibetan Plateau")],
 stat:"Mount Kailash is sacred to four religions, and no one has ever climbed it",
 body:"Hindus see it as the home of the god Shiva; Buddhists, Jains and followers of Bon hold it sacred too. Pilgrims walk the 52 km path around it instead of climbing it, and climbing is not allowed.",
 more:"Look at the rivers: four great rivers, the Indus, the Sutlej, the Brahmaputra and the Karnali (a source of the Ganges), all rise near Kailash. Many think it inspired the idea of Mount Meru, the mountain at the centre of the world."}),
S({title:"Fire and ice in the Norse myths",view:[-35,61,-10,68.5],globe:[-19,64.8,4],card:"left",hi:["is"],on:["plates","hazards"],
 pins:[[[-21.13,64.26],"Þingvellir","point"],[[-20.6,63.3],"Surtsey","point"],[[-21.29,64.66],"Reykholt, Snorri’s home","point"]],
 phPins:[ph([-21.13,64.26],"Þingvellir"),ph([-20.6,63.3],"Surtsey, 1963")],
 stat:"In the Norse myths the world began where fire met ice, and Iceland is a land of both",
 body:"Most of what we know of the Norse gods was written down in Iceland, by Snorri Sturluson and others around 1220. In their tales, the world began in a yawning gap between a land of fire and a land of ice; Iceland sits on the Mid-Atlantic Ridge, where volcanoes erupt beneath glaciers.",
 more:"When a new volcanic island rose from the sea south of Iceland in 1963, it was named Surtsey after Surtr, the fire giant who will set the world alight at Ragnarök, the end of the world in the myths."}),
S({title:"Loch Ness",view:[-9.6,55.6,-1.6,58.8],globe:[-4.6,57.2,5],card:"left",hi:["gb"],gfRuler:{a:[-5.11,56.82],b:[-4.22,57.48]},
 pins:[[[-4.44,57.32],"Urquhart Castle","point"],[[-4.22,57.48],"Inverness","point"],[[-5.11,56.82],"Fort William","point"]],
 phPins:[ph([-5.52,57.27],"Eilean Donan Castle")],
 stat:"Loch Ness holds more fresh water than all the lakes of England and Wales put together",
 body:"The loch fills part of the Great Glen, a valley carved along a geological fault that cuts Scotland in two: so straight that a ruler fits it. It is about 36 km long and up to about 230 m deep, with dark, peaty water.",
 more:"Stories of a monster boomed in 1933, after a new road opened along the shore. The famous 1934 ‘surgeon’s photograph’ was revealed as a hoax in 1994, and a 2018 survey of DNA in the water found no sign of a giant reptile, but plenty of eels. (The photo shows Eilean Donan Castle, on a sea loch west of the Great Glen.)"}),
S({title:"Stonehenge",view:[-11.7,49.5,2.3,59.5],globe:[-3,53.5,3.5],card:"left",gfRuler:{a:[-4.75,51.99],b:[-1.83,51.18]},
 pins:[[[-1.83,51.18],"Stonehenge","point"],[[-4.75,51.99],"Preseli Hills: the bluestones","point"],[[-3.2,58.4],"North-east Scotland: the Altar Stone","point"]],
 phPins:[ph([-1.85,51.2],"Stonehenge")],
 stat:"In legend the wizard Merlin moved Stonehenge from Ireland; in fact its bluestones came from Wales",
 body:"Geoffrey of Monmouth wrote around 1136 that Merlin brought the stones over the sea by magic. Geologists have traced the smaller ‘bluestones’ to the Preseli Hills in Wales, about 220 km away (see the ruler), and in 2024 the six-tonne Altar Stone to north-east Scotland, over 700 km away.",
 more:"People began building Stonehenge about 5,000 years ago. It is lined up with the sunrise on midsummer’s day and the sunset on midwinter’s day, and thousands still gather there for the solstices."}),
S({title:"Pele’s islands",view:[-163.5,17.5,-153.5,23.5],globe:[-157,20.5,4],card:"left",hi:["us"],on:["hazards","motion"],
 lines:[{coords:[[-159.5,22.05],[-157.9,21.45],[-156.9,21.1],[-156.3,20.75],[-155.28,19.41]],kind:"flow"}],
 pins:[[[-155.28,19.41],"Kīlauea: Halemaʻumaʻu crater","point"],[[-159.5,22.05],"Kauaʻi, oldest of the main islands","point"]],
 phPins:[ph([-155.2,19.35],"Kīlauea’s lava"),ph([-155.6,19.6],"Pāhoehoe lava")],
 stat:"Pele, the Hawaiian goddess of fire, is said to live in the crater of Kīlauea, one of Earth’s most active volcanoes",
 body:"In Hawaiian tradition Pele travelled from island to island, from Kauaʻi in the north-west to Hawaiʻi in the south-east, digging fire pits as she went. Geologists tell a similar story: the Pacific plate slides north-west over a hot spot, so the islands get younger towards the south-east.",
 more:"Fine threads of volcanic glass blown by the wind are called ‘Pele’s hair’, even in science books. Kīlauea erupted almost without a break from 1983 to 2018, and has erupted often since."}),
S({title:"Mount Fuji",view:[127.5,29,145.5,41],globe:[138.7,35.4,4],card:"left",hi:["jp"],on:["plates","hazards"],
 pins:[[[138.73,35.36],"Mount Fuji 3,776 m","peak"]],
 phPins:[ph([138.73,35.36],"Mount Fuji"),ph([138.76,35.5],"Lake Kawaguchi and Fuji")],
 stat:"Mount Fuji is a sacred mountain, and its summit belongs to a shrine",
 body:"In Shinto belief the mountain is the home of a goddess, Konohanasakuya-hime, and the shrine at its foot owns the top of the mountain. Fuji stands near the place where three of Earth’s plates meet, and last erupted in 1707.",
 more:"Pilgrims have climbed it for centuries; today around 200,000 people a year make the climb in summer. UNESCO listed Fuji in 2013 as a sacred place and a source of inspiration for artists."}),
S({title:"Where the gods were born",view:[-115.1,9,-89.1,30],globe:[-99,20,3],card:"left",mode:"history",sub:"1500/aztec",
 pins:[[[-98.84,19.69],"Teotihuacan","point"],[[-99.13,19.43],"Tenochtitlan (Mexico City)","point"]],
 phPins:[ph([-98.84,19.69],"Teotihuacan"),ph([-99.13,19.44],"The Templo Mayor")],
 stat:"The Aztecs named an ancient ruined city Teotihuacan: ‘the place where the gods were made’",
 body:"Teotihuacan was a huge city around AD 450, but it had been empty for centuries when the Aztecs found it. They believed the gods gathered there to make the Sun: the humble god Nanahuatzin leapt into a fire and rose as the Fifth Sun.",
 more:"Aztec rulers made pilgrimages to the ruins, about 40 km from their capital, Tenochtitlan; their empire is lit here as it was in 1500. Its Pyramid of the Sun is about 65 m tall, one of the largest in the Americas."}),
S({title:"Now explore",view:W,globe:[30,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on the Plate boundaries and Hazards layers: many sacred mountains in myth are volcanoes. The History map shows the empires that told these stories, and the Literature tour follows Gilgamesh, Homer and the Mahabharata."})];

/* =====================================================================================================
   2. Where science happened
   ===================================================================================================== */
const SCI=[
S({title:"Where science happened",view:W,globe:[20,25,1],
 phPins:[ph([-0.0015,51.48],"Greenwich’s prime meridian"),ph([-90.5,-0.7],"A Galápagos giant tortoise"),ph([-155.47,19.82],"Mauna Kea’s telescopes"),ph([-80.6,28.6],"Apollo 11 lifts off"),ph([-25.5,-75.6],"Halley VI station"),ph([66.98,39.65],"The Registan, Samarkand"),ph([10.4,43.72],"Pisa’s leaning tower"),ph([6.15,46.21],"Geneva")],
 stat:"Science is a way of finding out by measuring, testing and sharing, and it has happened all over the world",
 body:"This tour visits the places where people measured the sky and the Earth, sailed off to collect evidence, and built machines to look deeper. Each stop asks why that place mattered.",
 more:"Many discoveries needed a particular place: a dark mountain top, an island far out at sea, a spot on the line of a total eclipse, or the ice of Antarctica."}),
S({title:"Zhang Heng’s earthquake detector",view:[85.7,22,121.7,46],globe:[108,34,2.4],card:"left",hi:["cn"],on:["hazards"],
 pins:[[[112.45,34.62],"Luoyang, the Han capital","point"],[[104.6,35],"Longxi","point"]],
 phPins:[ph([112.45,34.62],"Luoyang")],
 stat:"In AD 132 Zhang Heng built the first known instrument to detect distant earthquakes",
 body:"China is one of the most earthquake-prone countries on Earth (see the hazard layer). At the Han court in Luoyang, the astronomer Zhang Heng made a bronze jar with eight dragons; a shake made a ball drop from a dragon’s mouth into a toad’s, showing the direction of the quake.",
 more:"The story goes that a ball once dropped when no one in Luoyang had felt anything. Days later a messenger arrived: there had been an earthquake far to the west, in Longxi. No original survives; modern copies are guesses at how it worked."}),
S({title:"Ibn al-Haytham and light",view:[16,20,50,40],globe:[38,30,2.6],card:"left",hi:["eg","iq"],
 lines:[{coords:[[47.78,30.5],[44,31],[38,30.5],[31.26,30.05]],kind:"dash"}],
 pins:[[[47.78,30.5],"Basra, his birthplace","point"],[[31.26,30.05],"Cairo","point"]],
 phPins:[ph([31.24,30.05],"Cairo and the Nile")],
 stat:"Ibn al-Haytham’s Book of Optics, written in Cairo around 1011 to 1021, showed that we see because light enters the eye",
 body:"Born in Basra, in today’s Iraq, he moved to Cairo. Earlier thinkers argued about whether the eye sends out rays; he tested ideas with experiments, using dark rooms with a small hole, the camera obscura, and showed that light travels in straight lines.",
 more:"His insistence on testing ideas by experiment makes him one of the founders of the scientific method. Translated into Latin, his book was studied in Europe for 600 years."}),
S({title:"Ulugh Beg’s observatory",view:[45.9,30,79.9,48],globe:[67,38,2.4],card:"left",mode:"history",sub:"1400/timur",
 pins:[[[67.01,39.67],"Ulugh Beg’s observatory, Samarkand","point"]],
 phPins:[ph([66.98,39.65],"The Registan, Samarkand"),ph([67,39.66],"Shah-i-Zinda, Samarkand")],
 stat:"Ulugh Beg’s astronomers measured the length of the year to within about a minute",
 body:"Ulugh Beg, grandson of the conqueror Timur and ruler of Samarkand, built a great observatory in the 1420s. Its giant curved instrument, cut into the hillside, had a radius of about 36 m; with it his astronomers charted 1,018 stars.",
 more:"Their year was 365 days, 6 hours, 10 minutes and 8 seconds, only about 58 seconds too long. Ulugh Beg was murdered in 1449 and the observatory was destroyed; its buried remains were found in 1908."}),
S({title:"Galileo’s telescope",view:[2.8,38.5,16.8,48.5],globe:[11.5,43.5,4],card:"left",hi:["it"],
 pins:[[[11.88,45.41],"Padua: the telescope, 1609","point"],[[10.4,43.72],"Pisa, his birthplace","point"],[[11.25,43.77],"Florence","point"],[[12.48,41.9],"Rome: his trial, 1633","point"]],
 phPins:[ph([10.4,43.72],"Pisa’s leaning tower"),ph([11.26,43.77],"Florence’s cathedral")],
 stat:"On 7 January 1610 Galileo saw moons going round Jupiter, proof that not everything circles the Earth",
 body:"Galileo, a professor in Padua, heard of a Dutch spyglass in 1609 and built his own, much better ones. He saw mountains on the Moon, countless stars in the Milky Way and four moons of Jupiter, and published them in 1610 in his book The Starry Messenger.",
 more:"He came to argue that the Earth goes round the Sun, and in 1633 he was tried in Rome and kept under house arrest for the rest of his life. The story that he dropped balls from the Leaning Tower of Pisa may be only a legend."}),
S({title:"Greenwich and longitude",view:[-18.6,42,11.4,61],globe:[-2,51,3],card:"left",hi:["gb"],on:["grid","timezones"],
 pins:[[[-0.0015,51.4778],"Royal Observatory, Greenwich","point"]],
 phPins:[ph([-0.0015,51.48],"Greenwich’s prime meridian")],
 stat:"Since 1884, longitude 0° has run through the Royal Observatory in Greenwich",
 body:"Sailors could find their latitude from the Sun and stars, but not their longitude, and ships were wrecked. The observatory was founded in 1675 to solve this; the answer was a clock that kept perfect time at sea, so a navigator could compare local noon with Greenwich time.",
 more:"John Harrison’s watch H4 lost only about 5 seconds on an 81-day voyage to Jamaica in 1761–62. At a conference in Washington in 1884, 22 countries voted for Greenwich as the prime meridian; the world’s time zones still count from it."}),
S({title:"Darwin in the Galápagos",view:[-106,-10,-79,6],globe:[-85,-1,3.6],card:"left",hi:["ec"],on:["currents"],gfRuler:{a:[-80.9,-2.2],b:[-89.6,-0.9]},
 pins:[[[-89.6,-0.9],"San Cristóbal: Darwin lands, 1835","point"],[[-91.1,-0.8],"Isabela","point"]],
 phPins:[ph([-90.5,-0.7],"A Galápagos giant tortoise"),ph([-91.4,-0.3],"A Galápagos penguin")],
 stat:"Charles Darwin spent five weeks in the Galápagos in 1835, and it helped change how we see all life",
 body:"The islands rose from the sea as volcanoes, about 1,000 km off South America (see the ruler), so every plant and animal there arrived by air or sea and then changed in its own way. Darwin noticed that tortoises and mockingbirds differed from island to island.",
 more:"Cold water of the Humboldt Current lets penguins live right on the equator. Darwin published On the Origin of Species, his theory of evolution by natural selection, in 1859."}),
S({title:"Humboldt on Chimborazo",view:[-84.9,-5,-74.9,3],globe:[-78.8,-1.5,4],card:"left",hi:["ec"],gfThr:{kind:"elev",v:3000},
 pins:[[[-78.82,-1.47],"Chimborazo 6,263 m","peak"],[[-78.44,-0.68],"Cotopaxi","peak"],[[-78.47,-0.18],"Quito","point"]],
 phPins:[ph([-78.44,-0.68],"Cotopaxi")],
 stat:"In 1802 Alexander von Humboldt climbed to about 5,900 m on Chimborazo, higher than any European had been",
 body:"Humboldt, a German scientist, travelled through Latin America from 1799 to 1804. On the Andes (the map shows land above 3,000 m) he saw how plants change with height, from palms to mosses, much as they change from the equator to the poles.",
 more:"His famous drawing of Chimborazo, published in 1807, showed which plants grow at each height: the first picture of nature as one connected web. Because the Earth bulges at the equator, Chimborazo’s top is the point on land farthest from the Earth’s centre. (The photo shows Cotopaxi, another volcano Humboldt studied.)"}),
S({title:"Marie Curie",view:[-13,42,24,58],globe:[11,50,2.6],card:"left",hi:["pl","fr"],gfRuler:{a:[21.01,52.23],b:[2.35,48.85]},
 pins:[[[21.01,52.23],"Warsaw: born 1867","point"],[[2.35,48.85],"Paris: her laboratory","point"]],
 phPins:[ph([21.01,52.25],"Warsaw’s Old Town"),ph([2.35,48.85],"The Panthéon, Paris")],
 stat:"Marie Curie is the only person to have won Nobel Prizes in two different sciences: physics in 1903, chemistry in 1911",
 body:"Maria Skłodowska grew up in Warsaw, then under Russian rule, where women could not go to university. In 1891 she moved to Paris, about 1,370 km away; there, with Pierre Curie, she discovered two new elements in 1898: polonium, named after Poland, and radium.",
 more:"She coined the word ‘radioactivity’, and was the first woman to win a Nobel Prize. In 1995 she became the first woman buried in the Panthéon in Paris on her own merits."}),
S({title:"The eclipse that tested Einstein",view:[-82,-25,14,22],globe:[-15,0,1.8],card:"left",gfRuler:{a:[-40.35,-3.69],b:[7.42,1.61]},
 lines:[{coords:[[-50,-6.5],[-40.35,-3.69],[-20,-1],[0,0.8],[7.42,1.61],[12,2.3]],kind:"dash"}],
 pins:[[[-40.35,-3.69],"Sobral, Brazil","point"],[[7.42,1.61],"Príncipe","point"]],
 phPins:[ph([7.42,1.61],"Príncipe")],
 stat:"On 29 May 1919 two teams watched the Sun go dark, in Brazil and on an island off Africa, to test Einstein’s theory of gravity",
 body:"Einstein predicted that the Sun’s gravity bends starlight passing close to it. Stars near the Sun can only be photographed during a total eclipse, so Arthur Eddington sailed to Príncipe and another team to Sobral, along the path of the Moon’s shadow (dashed).",
 more:"In November 1919 they announced that starlight was bent by about the amount Einstein predicted, not Newton’s smaller figure. Einstein became world-famous overnight."}),
S({title:"Mapping the ocean floor",view:[-110,-58,40,72],globe:[-30,20,1.5],card:"left",mode:"satellite",on:["plates"],
 lines:[{coords:MAR,kind:"amber"}],
 pins:[[[-40,71],"Greenland: Wegener’s last expedition","point"]],
 phPins:[ph([-21.13,64.26],"Þingvellir")],
 stat:"In the 1950s Marie Tharp found a rift valley running along the middle of the Atlantic floor",
 body:"In 1912 Alfred Wegener argued that the continents drift, but few believed him; he died on the Greenland ice in 1930. Working from ships’ depth soundings, Marie Tharp and Bruce Heezen mapped the Mid-Atlantic Ridge and the crack down its centre, where the sea floor is pulled apart (the orange line).",
 more:"In the 1960s this led to plate tectonics: Earth’s surface is made of plates that move a few centimetres a year. In Iceland the ridge rises above the sea and you can walk through the rift."}),
S({title:"CERN",view:[-3,43,13,49.5],globe:[6.06,46.27,6],card:"left",holes:[{circle:[6.066,46.272],km:30}],
 lines:[{coords:ring([6.066,46.272],4.3,48),kind:"amber"}],
 pins:[[[6.15,46.21],"Geneva","point"]],
 phPins:[ph([6.16,46.21],"Geneva")],
 stat:"The Large Hadron Collider is a ring 27 km round, about 100 m underground, that crosses the French–Swiss border",
 body:"CERN, Europe’s particle physics laboratory, was founded in 1954 so that countries could share machines no one country could afford. In the collider, the small ring by Geneva, beams of protons race round in opposite directions at almost the speed of light and smash together.",
 more:"In 2012 CERN announced the discovery of the Higgs boson, predicted almost 50 years before. And in 1989 Tim Berners-Lee, a scientist at CERN, proposed the World Wide Web, to help physicists share their work."}),
S({title:"Launching into space",view:[-125,-15,-20,45],globe:[-20,25,1.2],card:"left",on:["grid"],hi:["us","gf"],
 pins:[[[-80.6,28.57],"Cape Canaveral: Apollo 11, 1969","point"],[[-52.77,5.23],"Kourou, near the equator","point"]],
 phPins:[ph([-80.6,28.6],"Apollo 11 lifts off"),ph([-52.65,5.16],"Kourou")],
 stat:"The Earth’s spin gives a rocket launched eastwards near the equator a free push of about 1,670 km/h",
 body:"Sputnik, the first satellite, went up from Baikonur in Kazakhstan in 1957, and Yuri Gagarin, the first person in space, in 1961. Apollo 11 left Florida for the Moon in July 1969; rockets there fly east, over the sea.",
 more:"The equator spins fastest, so Europe launches its rockets from Kourou in French Guiana, only 5° north of the equator (see the grid lines). The same rocket can carry more there than from further north."}),
S({title:"Dark skies",view:[-125,-45,5,45],globe:[-60,0,1.2],card:"left",mode:"population",
 pins:[[[-70.4,-24.63],"Paranal, Chile","point"],[[-67.75,-23.03],"ALMA, Chajnantor","point"],[[-17.88,28.76],"La Palma, Canary Islands","point"]],
 phPins:[ph([-67.8,-23.7],"The Atacama")],
 stat:"The world’s biggest telescopes are on high, dry mountains far from city lights",
 body:"This map shows where people live: the Atacama Desert in Chile is almost empty, so there are few lights to spoil its nights, as on the top of Mauna Kea in Hawaiʻi, 4,207 m above the Pacific. Up high, the air is thin, dry and steady, so stars twinkle less.",
 more:"Chile hosts many of the world’s largest observatories; ALMA, a field of 66 radio dishes, stands at 5,000 m. A 2016 study found that over a third of humanity can no longer see the Milky Way from home."}),
S({title:"The ozone hole",view:[-95,-88,65,-28],globe:[-30,-80,1.6],card:"left",gfSun:{utc:12,day:355},
 pins:[[[-25.5,-75.57],"Halley station","point"]],
 phPins:[ph([-25.5,-75.6],"Halley VI station")],
 stat:"In 1985 scientists at Britain’s Halley station reported a hole in the ozone layer over Antarctica",
 body:"Ozone high in the sky blocks harmful ultraviolet light. Joseph Farman, Brian Gardiner and Jonathan Shanklin found that each spring it thinned dramatically over Antarctica, destroyed by CFC gases from fridges and spray cans. In December, as shown, Antarctica has sunlight round the clock: the season for science.",
 more:"In 1987 countries agreed the Montreal Protocol to stop making CFCs; it was the first treaty ratified by every member of the UN. The hole is slowly healing and is expected to close in the second half of this century."}),
S({title:"Now explore",view:W,globe:[20,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Turn on the Time zones layer to see how the world still counts from Greenwich, or the Plate boundaries to follow Tharp’s ridge. The Maths tour visits Eratosthenes, who measured the whole Earth with a shadow."})];

/* =====================================================================================================
   3. Maths on the map
   ===================================================================================================== */
const MATHS=[
S({title:"Maths on the map",view:W,globe:[40,25,1],on:["grid"],
 phPins:[ph([44.42,32.54],"Babylon’s Processional Way"),ph([29.91,31.21],"Alexandria’s new library"),ph([-89.62,17.22],"Tikal"),ph([76.3,9.9],"The Kerala backwaters"),ph([10.4,43.72],"Pisa"),ph([-78.45,0],"The Middle of the World monument"),ph([-0.0015,51.48],"Greenwich")],
 stat:"Every map is made with maths, and maths itself was made in many places",
 body:"This tour visits places where big mathematical ideas were born, from counting in sixties to zero and infinite sums. Then it shows the maths hiding in the map itself: lines of latitude, great circles, stretched countries and the far side of the world.",
 more:"The faint grid on this map shows lines of latitude and longitude, every 10 degrees: an idea that goes back to Greek astronomers such as Hipparchus and Ptolemy."}),
S({title:"Counting in sixties",view:[31.4,26,53.4,38],globe:[45,32,3],card:"left",mode:"history",sub:"bc2000/sum",
 pins:[[[44.42,32.54],"Babylon","point"],[[45.85,31.29],"Larsa","point"],[[46.1,30.96],"Ur","point"]],
 phPins:[ph([44.42,32.54],"Babylon’s Processional Way"),ph([45.2,32.1],"A counting tablet")],
 stat:"There are 60 minutes in an hour and 360 degrees in a circle because of Mesopotamia’s maths",
 body:"Scribes in Sumer and Babylon counted in sixties, and wrote numbers on clay with a reed. Sixty can be split evenly into halves, thirds, quarters, fifths and sixths, which made sharing out grain and land easy.",
 more:"A tablet known as Plimpton 322, written about 1800 BC and probably from Larsa, lists sets of numbers that fit a right-angled triangle, over 1,000 years before Pythagoras."}),
S({title:"Euclid’s Alexandria",view:[15,25,39,37],globe:[30,31,3],card:"left",mode:"history",sub:"bc300/ptol",
 pins:[[[29.92,31.2],"Alexandria","point"]],
 phPins:[ph([29.91,31.21],"Alexandria’s new library")],
 stat:"Euclid’s Elements, written in Alexandria around 300 BC, was used to teach geometry for over 2,000 years",
 body:"Alexander the Great founded Alexandria in 331 BC, and its Greek kings, the Ptolemies, built a great library and museum where scholars were paid to think. Euclid started from a few simple rules and proved hundreds of facts about shapes from them, step by step.",
 more:"The Elements is said to be the most-printed book after the Bible. Centuries later the mathematician Hypatia taught in Alexandria, until she was murdered in AD 415."}),
S({title:"Eratosthenes measures the Earth",view:[20.9,22.5,40.9,32.5],globe:[31,27,3],card:"left",gfSun:{utc:9.8,day:172},gfRuler:{a:[29.92,31.2],b:[32.9,24.09]},
 pins:[[[29.92,31.2],"Alexandria: shadow at 7.2°","point"],[[32.9,24.09],"Syene (Aswan): no shadow","point"]],
 phPins:[ph([32.89,24.09],"The Nile at Aswan")],
 stat:"Around 240 BC Eratosthenes worked out the size of the whole Earth from a shadow",
 body:"He heard that at noon on midsummer’s day the Sun shone straight down a well at Syene, today’s Aswan (the yellow dot is where the Sun is overhead). At the same moment in Alexandria a stick cast a shadow at about 7.2°, one-fiftieth of a circle.",
 more:"So the distance from Alexandria to Syene (the ruler) must be one-fiftieth of the way round the Earth: he got 250,000 stadia. Depending on the length of his stadion, that is close to the true 40,000 km."}),
S({title:"Zu Chongzhi and π",view:[100.2,24.5,130.2,39.5],globe:[115,32,2.6],card:"left",hi:["cn"],
 pins:[[[118.8,32.06],"Jiankang (Nanjing)","point"]],
 stat:"Around AD 480 Zu Chongzhi worked out π to seven decimal places, a record for about 900 years",
 body:"π is the number of times a circle’s width fits round its edge, about 3.14. Working in Jiankang, today’s Nanjing, Zu Chongzhi showed it lies between 3.1415926 and 3.1415927, probably by drawing polygons with thousands of sides inside a circle.",
 more:"He also gave the fraction 355/113, which is right to six decimal places. Nobody did better until the Persian mathematician al-Kashi in Samarkand, in 1424."}),
S({title:"The Maya and zero",view:[-99.9,13,-83.9,21],globe:[-90,17,3.8],card:"left",mode:"history",sub:"500/maya",
 pins:[[[-89.62,17.22],"Tikal","point"],[[-89.14,14.84],"Copán","point"],[[-92.05,17.48],"Palenque","point"]],
 phPins:[ph([-89.62,17.22],"Tikal"),ph([-89.14,14.84],"A stela at Copán"),ph([-92.05,17.48],"Palenque")],
 stat:"The Maya counted in twenties and wrote a zero, shaped like a shell",
 body:"Maya scribes wrote numbers with dots for ones and bars for fives, stacked in levels worth 1, 20, 400 and so on. Their Long Count calendar, carved on stone monuments called stelae, used zero to count the days since a starting date in 3114 BC.",
 more:"Zero was invented more than once: in Babylon as a gap-filler, by the peoples of Mesoamerica, and in India, where it became a number you can add and multiply."}),
S({title:"Zero travels west",view:[-58,2,82,58],globe:[40,30,1.6],card:"left",hi:["in"],hiSoft:["iq","dz","it"],
 lines:[{coords:[[72.27,25],[66,26],[58,27],[50,30],[44.36,33.31]],kind:"flow"},{coords:[[44.36,33.31],[36,32],[30,31],[20,32],[10,34],[5.08,36.75]],kind:"flow"},{coords:[[5.08,36.75],[8,40],[10.4,43.72]],kind:"flow"}],
 pins:[[[72.27,25],"Bhinmal: Brahmagupta, 628","point"],[[78.17,26.23],"Gwalior: a zero carved in 876","point"],[[44.36,33.31],"Baghdad","point"],[[5.08,36.75],"Béjaïa","point"],[[10.4,43.72],"Pisa: Fibonacci","point"]],
 phPins:[ph([10.4,43.72],"Pisa")],
 stat:"The digits 0 to 9 that the whole world uses were invented in India",
 body:"Indian mathematicians wrote any number with just ten signs, the value of each set by its place, with zero holding empty places. In 628 Brahmagupta, at Bhinmal, wrote the first rules for doing sums with zero as a number.",
 more:"The digits reached Baghdad, then North Africa, where the young Leonardo of Pisa, later called Fibonacci, learned them at Béjaïa. His book Liber Abaci, 1202, spread them through Europe, which called them ‘Arabic numerals’."}),
S({title:"The House of Wisdom",view:[29,26,63,43],globe:[44,33,2.8],card:"left",mode:"history",sub:"800/isl",
 pins:[[[44.36,33.31],"Baghdad","point"],[[60.62,41.38],"Khwarazm, al-Khwarizmi’s homeland","point"]],
 phPins:[ph([44.38,33.33],"Baghdad")],
 stat:"The words ‘algebra’ and ‘algorithm’ both come from one book, and one man, in Baghdad",
 body:"The Abbasid caliphs made Baghdad a centre of learning, where scholars at the House of Wisdom translated Greek, Persian and Indian books into Arabic. Around 820, Muhammad ibn Musa al-Khwarizmi wrote a book on solving equations by al-jabr, ‘restoring’: algebra.",
 more:"His other book explained the Indian digits; in Latin his name became ‘Algoritmi’, which gave us the word algorithm. The caliphate he worked in is lit on this map of about AD 800."}),
S({title:"The Kerala school",view:[67.5,7,81.5,14],globe:[76,11,3.6],card:"left",hi:["in"],
 pins:[[[76.21,10.34],"Sangamagrama: Madhava","point"],[[75.93,10.91],"Tirur: Nilakantha","point"]],
 phPins:[ph([76.4,9.6],"The Kerala backwaters")],
 stat:"In Kerala, around 1400, Madhava found infinite sums for π, 250 years before European mathematicians",
 body:"Madhava of Sangamagrama, in south-west India, found that π/4 = 1 − 1/3 + 1/5 − 1/7 + … going on forever, and similar endless sums for sines and cosines. His pupils and their pupils carried on his work for 200 years.",
 more:"These ideas are first steps towards calculus, developed in Europe by Newton and Leibniz in the late 1600s. Whether any Kerala work reached Europe is still debated."}),
S({title:"The bridges of Königsberg",view:[17.4,53.9,22.4,55.4],globe:[20.5,54.7,6],card:"left",hi:["ru"],
 pins:[[[20.512,54.706],"The Kneiphof island","point"]],
 stat:"In 1736 Leonhard Euler proved you cannot cross all seven bridges of Königsberg once each",
 body:"The river in Königsberg flowed round an island and split in two, and seven bridges joined the four pieces of land. Could you walk across every bridge exactly once? Euler showed it was impossible: such a walk allows at most two pieces of land with an odd number of bridges, and here all four had one.",
 more:"He drew the city as dots joined by lines, and invented graph theory, the maths behind route-finders and networks today. Königsberg is now Kaliningrad, in Russia; two of the bridges were destroyed in the Second World War."}),
S({title:"The metre and the meridian",view:[-10.9,39.5,13.1,52.5],globe:[2,46,3],card:"left",hi:["fr"],hiSoft:["es"],on:["grid"],gfRuler:{a:[2.37,51.03],b:[2.18,41.38]},
 pins:[[[2.37,51.03],"Dunkirk","point"],[[2.18,41.38],"Barcelona","point"],[[2.34,48.84],"Paris Observatory","point"]],
 phPins:[ph([2.17,41.4],"Barcelona")],
 stat:"The metre was first defined as one ten-millionth of the distance from the North Pole to the equator",
 body:"Lines of latitude are equally spaced: each degree is about 111 km. In the 1790s two French astronomers, Delambre and Méchain, measured the meridian from Dunkirk to Barcelona, about 1,070 km (the ruler), to fix the length of the new metre.",
 more:"Your latitude is the height of the Pole Star above the horizon, so sailors could always find it. The measurements were slightly off, so the Earth’s quarter-circle is really about 10,002 km, not exactly 10,000."}),
S({title:"Great circles",view:W,globe:[70,55,1.4],card:"left",on:["connections"],gfRuler:{a:[-0.45,51.47],b:[139.78,35.55]},
 pins:[[[-0.45,51.47],"London","point"],[[139.78,35.55],"Tokyo","point"]],
 stat:"The shortest way between two places on a globe looks curved on a flat map",
 body:"The shortest route from London to Tokyo, about 9,600 km, does not cross the middle of this map: it bends far north over Scandinavia and Siberia (the ruler). That is the great circle, the shortest path on a sphere; on a flat map it looks curved because the map is stretched.",
 more:"A great circle is any circle that cuts the globe into two equal halves, like the equator. Stretch a string tight between two cities on a real globe and it follows one. Airliners fly close to great circles, bending them for winds and closed airspace."}),
S({title:"Mercator’s stretched map",view:W,globe:[0,30,1],card:"left",hi:["gl"],ghosts:[{code:"gl",at:[18,4],col:"#8a63cf",label:"Greenland, true size"}],
 pins:[[[6.76,51.43],"Duisburg: Mercator’s map, 1569","point"]],
 phPins:[ph([6.76,51.43],"Mercator’s world map")],
 stat:"On many world maps Greenland looks as big as Africa; Africa is really about 14 times bigger",
 body:"A round Earth cannot be flattened without stretching it. Here Greenland has been moved onto Africa at its true size; drag it back north and watch it grow. Maps like this one stretch places more and more towards the poles.",
 more:"Gerardus Mercator’s map of 1569 kept angles true so that sailors could steer by straight lines, but it made Greenland, Russia and Antarctica look enormous. Try the country dragger in the toolkit with other countries."}),
S({title:"Antipodes",view:W,globe:[-40,0,1],card:"left",hi:["es","nz"],
 holes:[{circle:[-3.7,40.42],km:400},{circle:[176.3,-40.42],km:400}],
 pins:[[[-3.7,40.42],"Madrid","point"],[[176.3,-40.42],"Madrid’s antipode, New Zealand","point"]],
 phPins:[ph([174.78,-41.29],"Wellington")],
 stat:"Dig straight through the Earth from Madrid and you would come out in New Zealand, 12,742 km away",
 body:"The antipode is the point exactly opposite you on the globe: same latitude, but north and south swapped, and 180° of longitude away. Spain and New Zealand are antipodes, and so are northern China and Argentina.",
 more:"Most land has ocean on its far side; only about 15% of land is opposite other land. Take the shovel from the toolkit and dig anywhere to find your own antipode."}),
S({title:"The coastline paradox",view:[-12.9,49,3.1,60],globe:[-3,54.5,3.4],card:"left",gfRuler:{a:[-5.71,50.07],b:[-3.07,58.64]},
 pins:[[[-5.71,50.07],"Land’s End","point"],[[-3.07,58.64],"John o’ Groats","point"]],
 phPins:[ph([1.35,51.13],"The White Cliffs of Dover")],
 stat:"The more closely you measure a coastline, the longer it gets",
 body:"Great Britain is about 970 km from end to end (the ruler), but its coast has been measured as anything from about 12,400 km to nearly 18,000 km. Measure with a shorter ruler and you follow more bays, rocks and pebbles, so the total keeps growing.",
 more:"Lewis Fry Richardson noticed this, and in 1967 Benoit Mandelbrot asked ‘How long is the coast of Britain?’. His answer led to fractals: shapes that look just as wrinkly however far you zoom in."}),
S({title:"Now explore",view:W,globe:[40,25,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Open the toolkit: measure with the ruler, drag countries to compare their true sizes, and dig to your antipode with the shovel. Turn on the grid lines and find your own latitude, and the Science tour visits Greenwich, where longitude starts."})];

const TOURS={
 mythology:{name:"Guided tour on myths and legends",short:"Myths and legends",hint:"Olympus, Troy, Thera and Atlantis, the flood, Uluru, Kailash, Norse fire and ice, Loch Ness, Stonehenge, Pele and Teotihuacan",steps:MYTH},
 science:{name:"Guided tour on where science happened",short:"Where science happened",hint:"Zhang Heng, Ibn al-Haytham, Samarkand, Galileo, Greenwich, the Galápagos, Curie, Einstein’s eclipse, CERN and Antarctica",steps:SCI},
 maths:{name:"Guided tour on maths on the map",short:"Maths on the map",hint:"Counting in sixties, Euclid and Eratosthenes, π and zero, the House of Wisdom, Königsberg, great circles, Mercator and antipodes",steps:MATHS}};
const IDS=Object.keys(TOURS);
/* stops with their own map mode use the shared per-stop switch (stopModes); alsoOn keeps the tour running in those modes */
IDS.forEach(id=>{const T=TOURS[id],modes=[...new Set(T.steps.map(s=>s.mode).filter(Boolean))];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"relief"},group:"ideas",col:COL[id],steps:T.steps,stopModes:modes.length>0,alsoOn:modes}});
/* on the Tours page (the shelf file sets the final order) */
{const o=PS_TOUR_ORDER;IDS.forEach(id=>{const k=o.indexOf(id);if(k>=0)o.splice(k,1)});o.push(...IDS)}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
/* a stop with its own map mode and a sub (mode:"history", sub:"1500/aztec") is set up as if the tour ran on that map:
   the shared sub switch and key read the tour's map mode, so it is lent the stop's mode for that call only */
{const lend=fn=>function(){try{const T=mine()&&PS_TOURS[ps.tour],S=T&&psSteps()[ps.i];if(S&&S.mode&&S.sub&&S.mode!==T.map.mode){const m0=T.map;T.map=Object.assign({},m0,{mode:S.mode});try{return fn.apply(this,arguments)}finally{T.map=m0}}}catch(e){console.error(e)}return fn.apply(this,arguments)};
 if(typeof psSetSub==="function")psSetSub=lend(psSetSub);if(typeof psKeyInfo==="function")psKeyInfo=lend(psKeyInfo)}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.mythology={mid:[
 {at:"Troy",st:"Troy",q:"In which country are the ruins of Troy?",o:["Greece","Turkey","Italy","Cyprus"],a:1,why:"At Hisarlik, near the Dardanelles, dug by Schliemann from 1871.",kc:"tr"},
 {at:"Mount Kailash",st:"Mount Kailash",q:"Why has no one climbed Mount Kailash?",o:["It is too steep for ropes","It is sacred, and climbing is not allowed","It is always covered in cloud","It is an active volcano"],a:1,why:"It is holy to Hindus, Buddhists, Jains and followers of Bon; pilgrims walk round it instead.",kc:"cn"},
 {at:"Stonehenge",st:"Stonehenge",q:"Where did Stonehenge’s bluestones come from?",o:["Ireland, by magic","The Preseli Hills in Wales","The Alps","Brittany in France"],a:1,why:"Geologists traced them to the Preseli Hills, about 220 km away.",kc:"gb"}],
 recap:[
 {q:"Which mountain was the home of the Greek gods?",o:["Parnassus","Etna","Olympus","Ida"],a:2,why:"Mount Olympus, 2,918 m, is Greece’s highest.",st:"Mount Olympus and Delphi",kc:"gr"},
 {q:"Which Hawaiian goddess is said to live in Kīlauea’s crater?",o:["Pele","Hina","Laka","Papa"],a:0,why:"Pele, goddess of fire and volcanoes, lives in Halemaʻumaʻu.",st:"Pele’s islands",kc:"us"},
 {q:"The volcanic island Surtsey, born in 1963, is named after a figure from which myths?",o:["Greek","Norse","Celtic","Egyptian"],a:1,why:"Surtr is the fire giant of the Norse myths.",st:"Fire and ice in the Norse myths",kc:"is"}]};
TOURQ.science={mid:[
 {at:"Ulugh Beg’s observatory",st:"Ulugh Beg’s observatory",q:"In which city did Ulugh Beg build his observatory?",o:["Baghdad","Samarkand","Isfahan","Delhi"],a:1,why:"In the 1420s, in today’s Uzbekistan.",kc:"uz"},
 {at:"Darwin in the Galápagos",st:"Darwin in the Galápagos",q:"The Galápagos Islands belong to which country?",o:["Peru","Chile","Ecuador","Colombia"],a:2,why:"They lie about 1,000 km off Ecuador’s coast.",kc:"ec"},
 {at:"CERN",st:"CERN",q:"What was invented at CERN in 1989?",o:["The laser","The World Wide Web","The transistor","GPS"],a:1,why:"Tim Berners-Lee proposed the Web to help physicists share their work.",kc:"ch"}],
 recap:[
 {q:"Marie Curie was born in which city?",o:["Paris","Vienna","Warsaw","Prague"],a:2,why:"She moved from Warsaw to Paris in 1891.",st:"Marie Curie",kc:"pl"},
 {q:"Which observatory marks longitude 0°?",o:["Paris","Greenwich","Washington","Uppsala"],a:1,why:"It was chosen at a conference in 1884.",st:"Greenwich and longitude",kc:"gb"},
 {q:"Where was Ibn al-Haytham working when he wrote his Book of Optics?",o:["Cairo","Córdoba","Damascus","Samarkand"],a:0,why:"He was born in Basra and moved to Cairo.",st:"Ibn al-Haytham and light",kc:"eg"}]};
TOURQ.maths={mid:[
 {at:"Eratosthenes measures the Earth",st:"Eratosthenes measures the Earth",q:"At which town was the Sun said to be straight overhead at noon on midsummer’s day?",o:["Alexandria","Syene (Aswan)","Memphis","Thebes"],a:1,why:"Syene lies close to the Tropic of Cancer.",kc:"eg"},
 {at:"The House of Wisdom",st:"The House of Wisdom",q:"In which city was the House of Wisdom?",o:["Cairo","Damascus","Baghdad","Córdoba"],a:2,why:"The Abbasid capital, where al-Khwarizmi wrote his algebra.",kc:"iq"},
 {at:"The bridges of Königsberg",st:"The bridges of Königsberg",q:"Königsberg, Euler’s city of seven bridges, is now called…",o:["Gdańsk","Kaliningrad","Vilnius","Riga"],a:1,why:"It has been Kaliningrad, in Russia, since 1946.",kc:"ru"}],
 recap:[
 {q:"Where were the digits 0 to 9 invented?",o:["Arabia","Greece","India","China"],a:2,why:"They reached Europe through Baghdad and North Africa.",st:"Zero travels west",kc:"in"},
 {q:"What is the antipode of Spain?",o:["Australia","New Zealand","Chile","South Africa"],a:1,why:"Madrid’s far side is on New Zealand’s North Island.",st:"Antipodes",kc:"nz"},
 {q:"Madhava found infinite sums for π in which part of India?",o:["Bengal","Punjab","Kerala","Gujarat"],a:2,why:"The Kerala school worked from about 1400 for 200 years.",st:"The Kerala school",kc:"in"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names) ---------- */
const CARD={
 "mythology|Myths and legends":"Delphi, Greece - panoramio.jpg","mythology|Mount Olympus and Delphi":"Delphi, Greece - panoramio.jpg",
 "mythology|Troy":"Path upto the Lion Gate, Mycenae (28693130016).jpg","mythology|Thera and Atlantis":"1000 Three domes of Oia in Santorini Photo by Giles Laurent.jpg",
 "mythology|The flood":"Mount Ararat and the Yerevan skyline in spring from the Cascade.jpg","mythology|Stories that remember the sea":"Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru, Kuniya Walk -- 2019 -- 3674.jpg",
 "mythology|Uluru":"Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru -- 2019 -- 3688.jpg","mythology|Mount Kailash":"Landscape of the Tibetan Plateau.jpg",
 "mythology|Fire and ice in the Norse myths":"Surtsey eruption 1963.jpg","mythology|Loch Ness":"Eilean Donan Castle, Scotland - Jan 2011.jpg",
 "mythology|Stonehenge":"Stonehenge, Condado de Wiltshire, Inglaterra, 2014-08-12, DD 12.JPG","mythology|Pele’s islands":"Kilauea lava flow.jpg",
 "mythology|Mount Fuji":"Chureito Pagoda and Mount Fuji 2023-03-07.jpg","mythology|Where the gods were born":"Pyramid of the Sun, Teotihuacan, from path to parking lot.jpg",
 "science|Where science happened":"Mauna Kea Eastern Telescopes.jpg","science|Zhang Heng’s earthquake detector":"27427-Luoyang (49067744628).jpg",
 "science|Ibn al-Haytham and light":"Cairo skyline, Nile River, Egypt.jpg","science|Ulugh Beg’s observatory":"Registan 01.jpg",
 "science|Galileo’s telescope":"Piazza dei Miracoli (Pisa) 2023.jpg","science|Greenwich and longitude":"Tourists taking pictures at Prime Meridian monument, Greenwich Observatory, London.jpg",
 "science|Darwin in the Galápagos":"Darwin's finches by Gould.jpg","science|Humboldt on Chimborazo":"Cotopaxi 01.jpg",
 "science|Marie Curie":"Pantheon of Paris 007.JPG","science|The eclipse that tested Einstein":"Príncipe Island Biosphere Reserve - Praia Salgada.jpg",
 "science|Mapping the ocean floor":"Almannagjá rift at Þingvellir National Park.jpg","science|CERN":"Arc-en-ciel sur le jet d'eau de Genève - GT 2025.jpg",
 "science|Launching into space":"Apollo 11 Launch - GPN-2000-000630.jpg","science|Dark skies":"Mauna Kea Eastern Telescopes.jpg",
 "science|The ozone hole":"Halley VI Antarctic Research Station - Science modules.jpg",
 "maths|Maths on the map":"Mitad del Mundo 05.jpg",
 "maths|Counting in sixties":"Proto cuneiform tablet OIM A12259.jpg","maths|Euclid’s Alexandria":"Alexandrina Library in Alexandria, Egypt. 03.jpg",
 "maths|Eratosthenes measures the Earth":"Aswan Nile R04.jpg","maths|The Maya and zero":"Frederick Catherwood - Maya Stela at Copan, Honduras - B1979.12.689 - Yale Center for British Art.jpg",
 "maths|Zero travels west":"Piazza dei Miracoli (Pisa) 2023.jpg","maths|The House of Wisdom":"Tigris in Baghdad 1958 04.jpg",
 "maths|The Kerala school":"Kerala backwaters, Houseboats, India.jpg","maths|The metre and the meridian":"Mitad del Mundo 05.jpg",
 "maths|Great circles":"Blue Marble 2002.png",
 "maths|Mercator’s stretched map":"Blue Marble Western Hemisphere.jpg","maths|Antipodes":"Clyde Quay Wharf and Wellington Harbour, Wellington 2017.jpg","maths|The coastline paradox":"Dover White Cliffs 4.jpg"};
const PIN={
 /* mythology */
 "Delphi":"Delphi, Greece - panoramio.jpg","Uluru":"Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru -- 2019 -- 3688.jpg","Stonehenge":"Stonehenge from the north.jpg",
 "Santorini":"1000 Three domes of Oia in Santorini Photo by Giles Laurent.jpg","The Great Sphinx":"Great Sphinx of Giza (أبو الهول).jpg","Mount Fuji":"Chureito Pagoda and Mount Fuji 2023-03-07.jpg",
 "Teotihuacan":"Pyramid of the Sun, Teotihuacan, from path to parking lot.jpg","Kīlauea’s lava":"Kilauea lava flow.jpg","Þingvellir":"Almannagjá rift at Þingvellir National Park.jpg",
 "Mycenae’s Lion Gate":"Path upto the Lion Gate, Mycenae (28693130016).jpg","Knossos":"Knossos R03.jpg","Mount Ararat":"Mount Ararat and the Yerevan skyline in spring from the Cascade.jpg",
 "A cuneiform tablet":"Proto cuneiform tablet OIM A12259.jpg","Uluru’s Kuniya walk":"Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru, Kuniya Walk -- 2019 -- 3674.jpg",
 "The Tibetan Plateau":"Landscape of the Tibetan Plateau.jpg","Surtsey, 1963":"Surtsey eruption 1963.jpg","Eilean Donan Castle":"Eilean Donan Castle, Scotland - Jan 2011.jpg",
 "Pāhoehoe lava":"Pāhoehoe Lava flow.JPG","Lake Kawaguchi and Fuji":"Lake Kawaguchiko Sakura Mount Fuji 4.JPG","The Templo Mayor":"Main Pyramid - Templo Mayor - Mexico 2024.jpg",
 /* science */
 "Greenwich’s prime meridian":"Feet on prime meridian greenwich observatory.jpg","A Galápagos giant tortoise":"Galápagos giant tortoise (Chelonoidis niger hoodensis).jpg",
 "Mauna Kea’s telescopes":"Mauna Kea Eastern Telescopes.jpg","Apollo 11 lifts off":"Apollo 11 Launch - GPN-2000-000630.jpg","Halley VI station":"Halley VI Antarctic Research Station - end elevation.jpg",
 "The Registan, Samarkand":"Registan 01.jpg","Pisa’s leaning tower":"Piazza dei Miracoli (Pisa) 2023.jpg","Geneva":"Arc-en-ciel sur le jet d'eau de Genève - GT 2025.jpg",
 "Luoyang":"27427-Luoyang (49067744628).jpg","Cairo and the Nile":"Cairo skyline in the morning.jpg","Shah-i-Zinda, Samarkand":"Shah-i-Zinda, Samarkand (Shohi-Zinda majmuasi, Samarqand, Шахи Зинда).jpg",
 "Florence’s cathedral":"Florence, Italy - panoramio (125).jpg","A Galápagos penguin":"189 365 Galapagos Penguin - Spheniscus mendiculus, Fernandina Island, Galapagos, Ecuador, July 8, 2021 (51329133046).jpg",
 "Cotopaxi":"Cotopaxi 01.jpg","Warsaw’s Old Town":"Warsaw, Old Town Square.jpg","The Panthéon, Paris":"Pantheon of Paris 007.JPG","Príncipe":"Príncipe Island Biosphere Reserve - Praia Salgada.jpg",
 "Kourou":"Kourou pointe des Roches A.jpg","The Atacama":"Miscanti Lagoon near San Pedro de Atacama Chile Luca Galuzzi 2006.jpg",
 /* maths */
 "Babylon’s Processional Way":"Processional Way, Babylon - Google Art Project.jpg","Alexandria’s new library":"Alexandrina Library in Alexandria, Egypt. 03.jpg","Tikal":"Tikal Temple II.jpg",
 "The Kerala backwaters":"Kerala backwaters, Houseboats, India.jpg","Pisa":"Piazza dei Miracoli (Pisa) 2023.jpg","The Middle of the World monument":"Mitad del Mundo 05.jpg",
 "Greenwich":"Feet on prime meridian greenwich observatory.jpg","A counting tablet":"Proto cuneiform tablet OIM A12259.jpg","The Nile at Aswan":"Aswan Nile R23.jpg",
 "A stela at Copán":"Frederick Catherwood - Maya Stela at Copan, Honduras - B1979.12.689 - Yale Center for British Art.jpg","Palenque":"Palenque temple 1.jpg",
 "Baghdad":"Tigris in Baghdad 1958 04.jpg","Barcelona":"Casa Batllo Overview Barcelona Spain cut.jpg",
 "Wellington":"Clyde Quay Wharf and Wellington Harbour, Wellington 2017.jpg","The White Cliffs of Dover":"Dover White Cliffs 4.jpg"};
/* new photos (GF_IDEAS2_PHOTOS) name the stops (card:"tour|title") and pin labels they belong to */
const PHOTOS=window.GF_IDEAS2_PHOTOS||[];
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
try{if(typeof TOUR_THUMBS!=="undefined"){const C={mythology:"1000 Three domes of Oia in Santorini Photo by Giles Laurent.jpg",science:"Mauna Kea Eastern Telescopes.jpg",maths:"Feet on prime meridian greenwich observatory.jpg"};
 const set=()=>{for(const id in C){if(TOUR_THUMBS[id])continue;const p=findP(C[id]);if(p&&p.d&&/^photos\//.test(p.d))TOUR_THUMBS[id]=p.d}};set();addEventListener("load",()=>setTimeout(set,1500))}}catch(e){}
})();
