/* GeoFlock: the tour review, applied to the "Start here", "Regions" and "Mapped books" shelves
   (Population, Geography, Time zones, Map projections, Earth at night, Earth from space; Europe, Asia, Africa, North America,
   South America, Oceania, Antarctica; Prisoners of Geography, Guns Germs and Steel, Why Nations Fail, Collapse).
   New stops (mechanism stops: place → why → result), merges and cuts of stops that repeated other tours word for word,
   fact fixes (Africa is not the only continent in all four hemispheres; one date range for the green Sahara everywhere),
   and new map gadgets (cross-sections, rulers, climate overlays, empire extents, lines, sea-level slider, sun and time).
   Everything is patched by tour id and stop title, so a stop that has been renamed or removed elsewhere is simply skipped.
   The "patched" flag sits on each steps array (steps._rvStart), so a tour that rebuilds its steps late is patched again.
   New photos are freely licensed files from Wikimedia Commons (GF_RVSTART_PHOTOS: author, licence, page). Load it after
   the tour files and the polish patches. */
(function(){
/* ---------- new photos from Wikimedia Commons, added to the shared library ---------- */
window.GF_RVSTART_PHOTOS=[{"f": "Plastic sea, Almería Spain.jpg", "d": "photos/xf27732ec0282620f.webp", "by": "NASA", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Plastic_sea,_Almer%C3%ADa_Spain.jpg"}, {"f": "ISS-66 Atmospheric plume from 2022 Hunga Tonga eruption (1).jpg", "d": "photos/x0c91eb24b80d78cb.webp", "by": "NASA Earth Observatory", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:ISS-66_Atmospheric_plume_from_2022_Hunga_Tonga_eruption_(1).jpg"}, {"f": "Erie Canal, Lockport New York, c.1855.jpg", "d": "photos/x01ca4a08aeb95d43.webp", "by": "Published for Herrmann J. Meyer, 164 William Street, New York City", "lic": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Erie_Canal,_Lockport_New_York,_c.1855.jpg"}];

/* ---------- helpers ---------- */
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&Array.isArray(t.steps)?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s&&s.title===title):null};
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(new Proxy(s,{set(t,k,v){def(t,k,v);if(k==="view")def(t,"_ff",1);return true},deleteProperty(t,k){try{def(t,k,undefined)}catch(e){}return delete t[k]}}))}catch(e){console.error(e)}};
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ins=(id,after,s)=>{const t=T(id);if(!t||t.steps.some(x=>x&&x.title===s.title))return;const i=t.steps.findIndex(x=>x&&x.title===after);if(i<0)return;
 const N=S(Object.assign(s.view?{_ff:1}:{},s));const P=N.phPins;delete N.phPins;if(P)lock(N,"phPins",P);t.steps.splice(i+1,0,N)};
/* removed stops are kept aside: the geography tour copies some of its stops from other tours each time it starts */
const GONE={};
const rm=(id,title)=>{const t=T(id);if(!t)return;const i=t.steps.findIndex(x=>x&&x.title===title);if(i>=0){GONE[id+"|"+title]=t.steps[i];t.steps.splice(i,1)}};
const ren=(id,from,to)=>{const s=st(id,from);if(!s)return;def(s,"title",to);try{if(typeof PS_PHOTO!=="undefined"&&PS_PHOTO[id+"|"+from]!=null&&PS_PHOTO[id+"|"+to]==null)PS_PHOTO[id+"|"+to]=PS_PHOTO[id+"|"+from]}catch(e){}};
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
const OR="#d9682b";
/* a ring of points around a centre, for circles on the map */
const ring=(c,r,n)=>{const o=[];n=n||48;for(let k=0;k<=n;k++){const a=k/n*2*Math.PI;o.push([+(c[0]+r*Math.cos(a)/Math.cos(c[1]*Math.PI/180)).toFixed(2),+(c[1]+r*Math.sin(a)).toFixed(2)])}return o};
const par=(lat,a,b,step)=>{const o=[];for(let x=a;x<=b;x+=step||2)o.push([x,lat]);return o};
const mer=(lon,a,b,step)=>{const o=[];for(let y=a;y>=b;y-=step||2)o.push([lon,y]);return o};
/* text edits: replace one exact phrase (skipped if it is no longer there) */
const rep=(s,k,a,b)=>{const v=s&&s[k];if(typeof v==="string"&&v.includes(a))def(s,k,v.replace(a,b))};
const GREEN="Between about 11,000 and 5,000 years ago";

/* card photos for new stops: "tour|title" → library file */
const CARD={"time|Pyongyang time":"Tower of Juche Idea, Pyongyang, North Korea (2909246855).jpg","night|The lights went out in Syria":"Citadel of Aleppo.jpg","asia|Two rice baskets on a pole":"Can Tho, Vietnam, Floating Market, Boats.jpg","europe|Changing wheels at the border":"Brest Brest Fortress Kholm Gate 9209 2150.jpg","africa|A railway camp became a capital":"Buffalo Nairobi Skyline Savannah Kenya May19 R1600769.jpg","africa|The city that nearly ran dry":"Cape Town (ZA), Table Mountain -- 2024 -- 2825.jpg","bnations|The convicts who sued":"View of Sydney Cove 1792.jpg","bcollapse|We are all in the polder":"The windmills of Kinderdijk.JPG","bcollapse|Iceland’s blowing soil":"Thingvellir, Iceland (21677114683).jpg","bprisoners|Congo: too big to hold":"Artisanal cobalt miners in the Democratic Republic of Congo.jpg","space|The sea of plastic":"Plastic sea, Almería Spain.jpg","oceania|The biggest blast in a century":"ISS-66 Atmospheric plume from 2022 Hunga Tonga eruption (1).jpg","namerica|The ditch that made New York":"Erie Canal, Lockport New York, c.1855.jpg"};

/* ======================================================================= START HERE */
function pop(){const id="pop";
 ins(id,"The United States: the 100th meridian",{title:"An ancient shoreline votes",view:[-104,28,-80,37.5],globe:[-87,32.5,4],card:"left",
  lines:[{coords:[[-89.2,34.6],[-88.8,34.0],[-88.45,33.45],[-88.0,32.95],[-87.5,32.6],[-87.0,32.4],[-86.4,32.25],[-85.8,32.15],[-85.1,32.05],[-84.4,32.0]],kind:"dash"}],
  pins:[[[-87.02,32.41],"Selma","point"],[[[-88.2,33.0],[-86.6,32.0]],"The Black Belt","area"]],
  stat:"A coastline from the age of the dinosaurs still shows up on maps of who lives where, and how they vote",
  body:"Some 80 million years ago a shallow sea covered the US South. The chalky mud on its floor, laid down in a curve near the old shore (dashed), weathered into dark, rich soil: the “Black Belt”. In the 1800s that soil made the best cotton land, so the plantations, and the enslaved people forced to work on them, crowded along the same arc.",
  more:"Many of their descendants still live there: the counties where most people are Black trace the old shoreline across Alabama and Mississippi, and on maps of recent US presidential elections the arc stands out as a curve of Democratic-voting counties across the mostly Republican Deep South. Booker T. Washington wrote in 1901 that the name first meant the colour of the soil, and later the people."});
 ins(id,"Australia keeps to the coast",{title:"Central America faces the Pacific",view:[-101,6.5,-76,18.5],globe:[-85,12.5,4],card:"left",
  lines:[{coords:[[-92.1,15.0],[-91.2,14.6],[-90.6,14.4],[-89.6,13.85],[-88.6,13.5],[-87.6,13.0],[-86.9,12.6],[-86.2,12.0],[-85.6,11.4],[-85.0,10.8],[-84.4,10.2],[-83.8,9.9]],kind:"dash"}],
  pins:[[[-90.51,14.63],"Guatemala City","point"],[[-89.19,13.69],"San Salvador","point"],[[-87.21,14.07],"Tegucigalpa","point"],[[-84.09,9.93],"San José","point"],[[-83.77,12.01],"Bluefields: the empty Caribbean side","point"]],
  phPins:[ph([-86.27,12.15],"Managua: the old cathedral","Old Cathedral of Managua (20450013).jpg")],
  stat:"All five capitals of the old Central American federation sit on the Pacific side or up in the highlands, and the Caribbean side is nearly empty",
  body:"A chain of volcanoes (dashed) runs down the Pacific side, and their ash makes rich soil; the cooler highlands also had fewer fevers. Big Indigenous farming towns were already there, so the Spanish settled there too. The rainy Caribbean lowlands have washed-out soils, swamps and mosquitoes, and stayed thinly settled.",
  more:"Nicaragua’s Caribbean half holds only about one Nicaraguan in seven. Britain had a long hold on that coast, so towns like Bluefields still speak an English-based Creole, and its old name, the Mosquito Coast, is usually traced to the Miskito people, not the insect. It is the same pattern as Java and the East African highlands: people follow volcanic soil and cool heights."});
 /* the "more" of these stops opened by repeating the stat or body */
 set(id,"The world lives in the north",s=>rep(s,"more","87% of people live north of the equator. ",""));
 set(id,"The Ganges plain and Bangladesh",s=>rep(s,"more"," Uttar Pradesh, a single state on the Ganges plain, has more people than Brazil.",""));
 set(id,"Java",s=>rep(s,"more","Java is the most populous island on Earth, with about 155 million people. Over half of all Indonesians live there, on just 7% of the country’s land.","About 155 million people live on Java, on just 7% of Indonesia’s land."));
 set(id,"Canada hugs the border",s=>rep(s,"more","Three in four Canadians live within 160 km of the US border, and six in ten within 100 km.","Six in ten live within just 100 km of it."));
 set(id,"Australia keeps to the coast",s=>rep(s,"more","About 85% of Australians live within 50 km of the sea. The other 91% of the continent","Beyond that thin strip, about 91% of the continent"));
 set(id,"Africa’s two crowded corners",s=>{if(!/Rwanda and Burundi/.test(s.more||""))s.more=(s.more||"")+" Highland Rwanda and Burundi are among the most crowded countries in mainland Africa, for the same reasons: cool, fertile and fairly free of malaria."});
 CARD["pop|Central America faces the Pacific"]="Fields with Concepcion Volcano - Near Santo Domingo - Ometepe Island - Nicaragua - 01 (31796975315).jpg";
}

function geo(){const id="geo";const R={gfMode:"relief",gfOn:["allMapsRiversToggle","allMapsLakesToggle"]};
 rm(id,"France: the most time zones");          /* the same stop, almost word for word, lives in Time zones */
 set(id,"Further north than you think",s=>{if(!/westerly winds/.test(s.more||""))s.more=(s.more||"")+" How much the Gulf Stream itself does is debated: some climate scientists argue that the westerly winds, warmed by the whole Atlantic, matter more than the current."});
 set(id,"When the Sahara was green",s=>{rep(s,"stat","About 8,000 years ago",GREEN);rep(s,"body","dried out again around 5,000 years ago","dried out again from about 5,000 years ago")});
 ins(id,"A planet of water",Object.assign({title:"The land hemisphere",view:[-80,6,77,88],globe:[-1.55,47.22,1],gfGlobe:true,
  pins:[[[-1.55,47.22],"Nantes","point"],[[178,-47],"Opposite: near New Zealand","point"]],
  stat:"Face the globe towards western France, and about four-fifths of all the land is on the half you can see",
  body:"Land is not spread evenly: it bunches up in one half of the planet. The half centred near Nantes, in France, holds about four-fifths of the land and the great majority of the world’s people. Switch to the globe and spin it to the opposite side, near New Zealand: that half is about nine-tenths water.",
  more:"Geographers disagree a little about the exact centre (spots in Brittany and Catalonia have been suggested too), but it always lands in western Europe. It is one small reason Europe sat at the middle of so many sea routes: from its coasts, most of the world’s land is relatively near."},R));
 ins(id,"Africa is splitting",Object.assign({title:"The sea that dried up",view:[-26,28,36,47.5],globe:[8,37,2.6],card:"left",
  lines:[{coords:[[-14,35.8],[-9,35.9],[-5.6,35.95],[-2.5,36.2]],kind:"flow"}],
  xsec:{title:"From Gibraltar across the western Mediterranean",pts:[[-5.6,35.95,"Gibraltar"],[-3,36.2],[0,37.4],[3,38.6],[5.5,39.6,"Balearic basin"],[8.1,40.5,"Sardinia"]],
   note:"The floor of the basin is nearly 3 km below the sea. When the Mediterranean dried, this was the bottom of a deep, salty pit."},
  pins:[[[-5.6,35.95],"Strait of Gibraltar: the gateway","point"],[[[5,39.2],[18,34.5]],"Salt over a kilometre thick under the floor","area"]],
  phPins:[ph([-5.5,36.1],"The Strait of Gibraltar from space","Strait of Gibraltar perspective.jpg")],
  stat:"About 6 million years ago the Mediterranean largely dried up, leaving salt more than a kilometre thick on its floor",
  body:"The Mediterranean loses more water to evaporation than its rivers bring in, so it depends on the Atlantic pouring in at Gibraltar (arrow). When plate movements closed that gateway, the sea evaporated into deep, salty basins, kilometres below today’s sea level. Move along the chart to see how far down the floor is.",
  more:"Then, about 5.3 million years ago, the Atlantic broke back through. Some scientists think the refill, the “Zanclean flood”, took only months to a few years, as a giant torrent through the strait; others think it was slower, and it is still argued over. Geologists found the buried salt in 1970, in drill cores from the sea floor."},R));
 ins(id,"The deepest and oldest lake",Object.assign({title:"The bay with weaker gravity",view:[-128,46,-62,68],globe:[-85,59,2.2],card:"left",
  lines:[{coords:[[-95,58],[-93,62],[-89,64.5],[-83,65.5],[-78,63.5],[-76.5,59],[-78.5,54.5],[-82,51.5],[-88,52],[-93,54.5],[-95,58]],kind:"dash"}],
  pins:[[[-85,59.5],"Weakest gravity","point"],[[-94.17,58.77],"Churchill","point"]],
  stat:"Gravity around Hudson Bay is a little weaker than almost anywhere else on Earth",
  body:"In the last ice age a sheet of ice about 3 km thick pressed the land here down into the soft, hot rock beneath. The ice melted about 8,000 years ago, but the land is still slowly springing back, about a centimetre a year, so some rock is still “missing” underneath (dashed). Slow currents deep inside the Earth also drag the crust down here.",
  more:"In 2007 scientists using the GRACE satellites, which mapped gravity from orbit, estimated that the leftover ice-age dent explains roughly a quarter to a half of the low; the rest comes from deeper down. The difference is far too small to feel. Around the bay, old beaches now sit high above the sea, like a staircase of raised shorelines."},R));
 CARD["geo|The sea that dried up"]="Strait of Gibraltar perspective.jpg";
}

function time(){const id="time";
 /* two stops about longitude, not time, become one */
 if(st(id,"Reno is west of LA")&&st(id,"Canada, south of Detroit")){rm(id,"Canada, south of Detroit");ren(id,"Reno is west of LA","Where north and west fool you");
  set(id,"Where north and west fool you",s=>{s.view=[-135,28.5,-76,50];s.globe=[-100,40,2.2];s.hi=[];s.holes=undefined;
   s.lines=[{coords:mer(-119.81,47,31,1),kind:"dash"},{coords:par(42.33,-90,-78,1),kind:"dash"}];
   s.pins=[[[-119.81,39.53],"Reno","point"],[[-118.24,34.05],"Los Angeles","point"],[[-83.05,42.33],"Detroit","point"],[[-83.02,42.3],"Windsor, Canada","point"]];
   s.stat="Reno is further west than Los Angeles, and from downtown Detroit, Canada is due south";
   s.body="Coastlines and borders slant, but lines of longitude run straight north–south (dashed). California’s coast slopes south-east, so Los Angeles ends up east of inland Reno. Detroit sits on a bend of the Detroit River, and Windsor, in Canada, lies across the water to its south.";
   s.more="Canada’s southernmost point, Middle Island in Lake Erie, is further south than parts of California’s northern border. On a map, the lines of longitude are the only true north–south lines; coasts and borders wander."})}
 ins(id,"Why time zones",{title:"Paris, nine minutes late",view:[-16,43.5,10,54],globe:[1.2,49.6,5],card:"left",
  lines:[{coords:mer(2.3372,51.1,42.4,0.5),kind:"dash"},{coords:mer(0,53.5,43,0.5),kind:"dash"}],
  pins:[[[2.3364,48.8364],"Paris Observatory","point"],[[0,51.4779],"Greenwich","point"]],
  stat:"From 1911, French law defined the country’s time as “Paris time, slowed by 9 minutes and 21 seconds”",
  body:"In 1884 an international conference chose Greenwich, not Paris, as the zero line for the world’s longitude. When France finally adopted Greenwich time in 1911, its law avoided the word “Greenwich”: it described the same time as Paris mean time minus 9 minutes 21 seconds, the gap between the two observatories’ meridians (dashed).",
  more:"French maps had measured longitude from the Paris meridian for over a century, and France abstained in the 1884 vote. The roundabout wording stayed in French law until 1978. Clocks are political: a country’s pride can show up in a law about seconds."});
 ins(id,"The United States: six zones",{title:"When sunset steals your sleep",view:[-128,24,-80,47],globe:[-95,36,2.6],card:"left",
  gfSun:{utc:1.5,day:172,city:["Amarillo",-5]},
  pins:[[[-101.83,35.22],"Amarillo: western edge, late sunsets","point"],[[-86.78,36.16],"Nashville: eastern edge, early sunsets","point"]],
  stat:"Inside one time zone, people at the western edge sleep less, on average, than people at the eastern edge",
  body:"The Sun sets about an hour later at the western edge of a time zone than at its eastern edge, but work and school start at the same clock time. The map shows 8:30 p.m. in June on Central Time: the Sun has set in Nashville but is still up in Amarillo. People in the west tend to go to bed later but get up at the same time, so they lose sleep.",
  more:"The economists Osea Giuntella and Fabrizio Mazzonna compared US counties on either side of time-zone borders and found that later sunsets go with less sleep, worse health and slightly lower wages. Scientists call the clash between your body clock and the clock on the wall “social jetlag”. It is one argument against permanent summer time, which would push sunsets later everywhere."});
 ins(id,"Half and quarter hours",{title:"Pyongyang time",view:[119.5,30.65,135.5,45.85],globe:[127,38.5,4],card:"left",hi:["kp","kr"],
  lines:[{coords:mer(127.5,43,33.5,0.5),kind:"dash"}],
  pins:[[[125.75,39.03],"Pyongyang","point"],[[126.98,37.57],"Seoul","point"],[[127.5,34],"127.5°E: exactly UTC+8½ by the sun","point"]],
  phPins:[ph([125.82,39.02],"Pyongyang: the Juche Tower","Tower of Juche Idea, Pyongyang, North Korea (2909246855).jpg")],
  stat:"In 2015 North Korea set its clocks half an hour behind South Korea’s, and in 2018 it changed them back",
  body:"North Korea said Korea’s clock had been imposed by Japan during its colonial rule, so in August 2015 it created “Pyongyang time”, 30 minutes behind Seoul. After the leaders of the two Koreas met in April 2018, Kim Jong Un said it was painful to see two clocks on the wall, and that May the North moved back.",
  more:"By the sun, the half hour actually fits Korea well: the peninsula lies around 127.5°E (dashed), the meridian of UTC+8½. Other countries have changed their clocks for politics, not sunlight: Venezuela moved half an hour back in 2007 and returned in 2016."});
}

function projections(){const id="projections";
 set(id,"Greenland vs Africa",s=>{s.stat="At 60° north, Mercator draws a country four times too big; at 80°, over thirty times";
  rep(s,"more"," On Mercator, a country at 60° north is drawn four times too big in area; at 80° north, over 30 times.","")});
 /* "Identical circles" and "Same circle, two maps" made the same point back to back: keep the interactive one */
 if(st(id,"Identical circles")&&st(id,"Same circle, two maps")){rm(id,"Identical circles");
  set(id,"Same circle, two maps",s=>{s.stat="These circles are the same size on the real Earth: drag one north and Mercator blows it up, while an equal-area map keeps its size";
   s.more="Circles like these are called Tissot’s indicatrices, after the French mathematician Nicolas Tissot, who invented them in 1859 to measure how a map distorts. Mercator keeps them round but swells them; equal-area maps keep their size but squash them. Goode’s map, a few stops on, shows a whole grid of them."})}
 set(id,"A better compromise",s=>rep(s,"body","NASA and many atlases now use it.","NASA has used it for some maps, and a growing number of atlases and classrooms do."));
 set(id,"The orange peel",s=>{if(!/Fuller/.test(s.more||""))s.more=(s.more||"")+" Buckminster Fuller went further: his Dymaxion map (1943, redrawn in 1954 on a 20-sided solid) unfolds the globe so that the continents form one almost unbroken chain."});
 ins(id,"A better compromise",{title:"The map drawn by eye",proj:"winkel",rot:[0,0],
  stat:"For ten years National Geographic’s world map was shaped by eye, not by a formula",
  body:"In 1988 National Geographic adopted Arthur Robinson’s projection, which he drew by trial and error until the world “looked right”, accepting a little error everywhere. In 1998 it switched to the Winkel tripel, shown here, which keeps the combined errors in area, distance and direction smaller still.",
  more:"In 1989 several North American geography groups called for an end to rectangular world maps, such as Mercator and Gall–Peters, in schools and the media. Most atlas maps today are compromises like these: nothing is exactly true, but nothing is badly wrong. Pick Robinson on the chips above to compare."});
 ins(id,"The UN’s map",{title:"One ocean",proj:"azeq",rot:[0,90],
  labels:[{at:[-150,-30],text:"Pacific"},{at:[-25,-30],text:"Atlantic"},{at:[80,-30],text:"Indian Ocean"},{at:[0,-65],text:"Southern Ocean"}],
  stat:"Centre the map on Antarctica and the Pacific, Atlantic and Indian Oceans join into one body of water",
  body:"Most world maps cut the globe through the oceans to keep the land in one piece. Ocean scientists sometimes do the opposite, so the map shows what the water sees: from the South Pole, the three great oceans flow into each other around Antarctica, and the land is pushed out to the edges.",
  more:"The oceanographer Athelstan Spilhaus drew maps of the “world ocean” like this from the 1940s; his later square version, which tucks the continents into the corners, went viral online in 2019. For fish, whales and currents, this is the true shape of the world. The map here is a simpler cousin of his, an azimuthal map centred on the pole."});
}

function night(){const id="night";
 /* these three retold the population tour; light tells its own stories instead */
 rm(id,"Half a country in one city");rm(id,"An island continent lit at the edges");rm(id,"Brazil hugs the Atlantic");
 set(id,"China’s Hu line",s=>{s.more="The lights add something the population map can’t show: money. The brightest strip is the coast from Beijing to Guangzhou, where most of China’s factories, ports and wealth are, so the line splits richer from poorer as well as wet from dry. It has barely moved in nearly a century, despite decades of effort to move people and industry west."});
 set(id,"Losing the stars",s=>{if(!/2011 and 2022/.test(s.more||""))s.more=(s.more||"")+" Volunteers counting stars by eye found the night sky getting brighter by almost 10% a year between 2011 and 2022, much faster than satellites showed, partly because satellites barely see the blue light of LED lamps."});
 ins(id,"East of the 100th meridian",{title:"Christmas lights from space",view:[-82,36.5,-73,41.8],globe:[-77.2,38.9,6],card:"left",
  pins:[[[-77.04,38.9],"Washington, D.C.","point"],[[-77.4,39.0],"The suburbs: brightest at Christmas","point"]],
  stat:"Between Thanksgiving and New Year, many US suburbs shine 20 to 50% brighter, and satellites can see it",
  body:"NASA scientists tracked night lights day by day and found the suburbs and outskirts of US cities brightening over the holidays, when people hang lights on their houses. City centres changed less: fewer people live there, and their offices and streets are lit all year anyway.",
  more:"In many Middle Eastern cities the lights rose during Ramadan instead, when people stay up late to eat after the day’s fast. The study (Román and Stokes, 2015) shows that the night map is not fixed: it changes with culture and the calendar, not only with where people live."});
 ins(id,"Not every light is a city",{title:"The lights went out in Syria",view:[33.5,31,43.5,38],globe:[38.5,35,5],card:"left",hi:["sy"],
  pins:[[[37.16,36.2],"Aleppo","point"],[[36.29,33.51],"Damascus","point"],[[36.72,34.73],"Homs","point"]],
  phPins:[ph([37.16,36.2],"Aleppo: the citadel","Citadel of Aleppo.jpg")],
  stat:"In four years of war, Syria lost about four-fifths of its night lights",
  body:"Researchers compared satellite pictures of Syria at night from March 2011, when the war began, with early 2015. As power stations, cables and towns were destroyed and millions of people fled, the lights faded across the country. Aleppo, once Syria’s biggest city, lost almost all of them.",
  more:"The picture on this map is a composite of many nights, so it can lag behind events like these. Satellites are now used to track war damage and power cuts this way, from Syria to Ukraine: a dark patch can mean empty land, or a city whose lights have been switched off."});
}

function space(){const id="space";
 set(id,"The colours of the Sahara",s=>rep(s,"more","About 6,000 years ago the Sahara was green",GREEN+" the Sahara was green"));
 ins(id,"A sea that shrank",{title:"The sea of plastic",view:[-6.5,35.3,0.5,39.2],globe:[-2.8,36.75,7],card:"left",
  pins:[[[-2.46,36.84],"Almería","point"]],
  phPins:[ph([-2.8,36.75],"Campo de Dalías: the sea of plastic","Plastic sea, Almería Spain.jpg")],
  stat:"In southern Spain, greenhouses cover so much land that from space they look like a white sea",
  body:"Almería is one of the driest corners of Europe, but it has sun all year. Since the 1960s farmers have covered over 30,000 hectares with plastic greenhouses, growing tomatoes, peppers and cucumbers for Europe’s winter supermarkets. Zoom in on the coast west of Almería to find the pale patch.",
  more:"The white roofs reflect sunlight back into space: one study found that the area cooled slightly between 1983 and 2006, while the rest of Spain warmed. The greenhouses also drain the water under the ground, and depend on low-paid migrant workers."});
 ins(id,"The Amazon’s edge",{title:"Dust that feeds the Amazon",view:[-78,-16,32,30],globe:[-22,8,1.5],card:"left",
  lines:[{coords:[[17.5,17],[10,17.5],[0,17],[-10,15.5],[-22,13],[-35,9],[-47,4],[-57,0],[-63,-3]],kind:"flow"}],
  pins:[[[17.5,17],"Bodélé Depression","point"],[[-62,-3.5],"The Amazon","point"],[[18.5,20.5],"Tibesti","point"],[[21.8,16.5],"Ennedi","point"]],
  stat:"Each year, dust from the Sahara carries about 22,000 tonnes of phosphorus across the Atlantic to the Amazon",
  body:"The Bodélé Depression in Chad is the dried bed of a giant ancient lake, its floor full of the tiny glassy shells of algae called diatoms. Winds squeezed between the Tibesti and Ennedi mountains blast the dust into the sky, and the trade winds carry it west (arrow). A NASA satellite, CALIPSO, measured about 28 million tonnes of dust landing on the Amazon each year.",
  more:"Phosphorus is a nutrient plants need, and this much roughly matches what rain and floods wash out of the Amazon’s poor soils, so the world’s biggest rainforest may be partly fertilised by the world’s biggest hot desert. The amount changes from year to year with the rains in the Sahel. The old lakebed was part of Mega-Chad, the vast lake of the green Sahara."});
}

/* ======================================================================= REGIONS */
function europe(){const id="europe";
 rm(id,"Further north than you think");            /* word for word the same as the geography tour's stop */
 set(id,"The biggest countries",s=>{s.stat="Texas is bigger than any country that lies wholly in Europe";
  s.body="Russia is Europe’s biggest country: its European part alone is about 4 million km², roughly two-fifths of the continent. Ukraine, about 604,000 km², is the biggest that lies wholly in Europe, yet Texas, about 696,000 km², is bigger still: drag it over Europe to compare. After Ukraine come France, Spain and Sweden."});
 set(id,"Europe’s great rivers",s=>{if(!/Belgrade/.test(s.more||""))s.more=(s.more||"")+" Many of Europe’s capitals and big cities sit on rivers that boats could sail up from the sea: London, Paris, Vienna, Budapest, Belgrade. Before railways, a navigable river into the heart of a country was the easiest highway."});
 ins(id,"Emptying in the east",{title:"The Hajnal line",view:[-12,36,45,66],globe:[18,52,1.8],card:"left",
  lines:[{coords:[[30.32,59.94],[27.5,58],[25,56],[23,53.5],[21.5,51.5],[19.5,50],[17.5,48.7],[15.5,47.3],[13.77,45.65]],kind:"dash"}],
  pins:[[[30.32,59.94],"St Petersburg","point"],[[13.77,45.65],"Trieste","point"],[[[10.5,51.5],[8.5,50.5]],"West: late marriage, a home of their own","area"],[[[35,52],[30,49]],"East: early marriage, big family households","area"]],
  stat:"For centuries a line from St Petersburg to Trieste split Europe into late marriages in the west and early ones in the east",
  body:"West of the line, women usually married in their mid-twenties, many never married at all, and a new couple set up a household of its own. East of it, almost everyone married young, and the bride usually moved in with her husband’s family. The demographer John Hajnal mapped the line in 1965.",
  more:"Late marriage meant fewer children per woman, and many young people worked for years as servants in other households before they married. Some historians link this “European marriage pattern” to western Europe’s early economic growth; others disagree, and the line is a broad pattern, not a wall."});
 ins(id,"The olive line",{title:"Choirs and good government",view:[4,36,21,47.5],globe:[12.5,42.5,4],card:"left",hi:["it"],
  pins:[[[11.34,44.49],"Emilia-Romagna: among the best-run","point"],[[16.35,39.0],"Calabria: among the worst-run","point"]],
  stat:"In Italy, the regions with the most choirs and football clubs turned out to have the best-run governments",
  body:"In 1970 Italy set up new regional governments, all with the same powers. Twenty years later the political scientist Robert Putnam found that some, mostly in the north, worked far better than others, mostly in the south. The best predictor was not wealth but how many people joined choirs, sports clubs and societies, read newspapers and voted.",
  more:"Putnam traced the gap back to the Middle Ages, when cities in the north governed themselves while the south was ruled from above by kings. Critics say he gives too little weight to later history and economics, but his 1993 book, Making Democracy Work, made “social capital”, the trust people build by joining in, famous."});
 ins(id,"The European Union",{title:"Changing wheels at the border",view:[-36,34,45,64],globe:[15,50,1.8],card:"left",
  G:[{t:"Rails 1,520 mm apart (Finland 1,524)",c:"#c92a2a",codes:["ru","by","ua","md","lt","lv","ee","fi"]},{t:"Rails 1,668 mm apart",c:"#f08c00",codes:["es","pt"]}],
  hi:["ru","by","ua","md","lt","lv","ee","fi","es","pt"],hiSoft:[],legend:null,_hsMerged:1,
  pins:[[[23.69,52.08],"Brest: wheels changed here","point"],[[-1.79,43.34],"Irun–Hendaye: the gauge changes","point"]],
  phPins:[ph([23.66,52.08],"Brest Fortress, by the border","Brest Brest Fortress Kholm Gate 9209 2150.jpg")],
  stat:"Trains crossing from Poland into Belarus stop so their wheels can be changed: the rails to the east are 85 mm wider apart",
  body:"Most of Europe’s railways use “standard gauge”, rails 1,435 mm apart. Russia and the former Soviet countries (red) use 1,520 mm, and Spain and Portugal (orange) built most of their lines wider still, at 1,668 mm. At Brest, carriages are lifted and new sets of wheels are rolled underneath, which takes hours.",
  more:"People often say the wide gauges were chosen to slow down invaders, but the records suggest more ordinary reasons: Russia followed an American engineer’s advice in the 1840s, and Spain wanted room for bigger engines to climb its steep hills. Spain’s Talgo trains now change their own wheel spacing as they roll slowly through a special stretch of track, and its new high-speed lines use standard gauge."});
}

function asia(){const id="asia";
 set(id,"Most people",s=>{s.stat="South Asia alone has more people than North and South America combined";
  s.body="India, Pakistan, Bangladesh and their neighbours hold about 2 billion people; all the Americas together, about 1 billion. India and China each have over 1.4 billion people, and India overtook China in 2023."});
 set(id,"Birthplace of religions",s=>{if(!/Indian Ocean/.test(s.body||""))s.body=(s.body||"")+" They spread along the trade and pilgrim routes that crossed Asia: Islam sailed with merchants across the Indian Ocean to Indonesia, now the country with the most Muslims."});
 /* "The biggest island country" and "The Ring of Fire" covered the same volcanoes: one stop */
 if(st(id,"The Ring of Fire")){rm(id,"The biggest island country");ren(id,"The Ring of Fire","Islands of fire");
  set(id,"Islands of fire",s=>{s.hi=["id","ph","jp"];
   s.stat="Indonesia, the Philippines and Japan are island chains built by the Ring of Fire";
   s.body="Around the edge of the Pacific, ocean plates dive under Asia (the plate edges are drawn on the map). Rock melts as it sinks, and the melt rises to build chains of volcanic islands: Indonesia’s 17,000 islands, the Philippines and Japan. The same plates give the islands rich volcanic soil, and shake them with earthquakes and tsunamis.";
   s.more="Indonesia is the world’s largest island country, stretching over 5,100 km, wider than the United States, and the fourth most populous country on Earth. Its volcanoes have changed world history: Tambora’s eruption in 1815, the biggest in recorded history, chilled Europe’s summer the next year, and Krakatoa’s in 1883 was heard about 4,800 km away. In Japan, the 2011 earthquake and tsunami killed nearly 20,000 people."})}
 ins(id,"Asia’s water tower",{title:"The Grand Canal",view:[104,22,128,42.5],globe:[117,33,3],card:"left",
  gfEmpire:{y:610,gk:"chn",name:"Sui China, 610",at:[114,26]},
  lines:[{coords:[[120.16,30.27],[120.62,31.3],[119.45,32.2],[119.43,32.39],[119.0,33.6],[118.3,34.0],[117.2,34.6],[116.6,35.4],[116.0,36.45],[116.3,37.45],[116.85,38.3],[117.2,39.13],[116.66,39.9]],kind:"flow"}],
  pins:[[[120.16,30.27],"Hangzhou","point"],[[119.43,32.39],"Yangzhou","point"],[[116.4,39.9],"Beijing","point"],[[[115,31],[112,29]],"Rice country: the Yangtze","area"]],
  stat:"China dug the world’s longest canal, about 1,800 km, to move rice to its capital",
  body:"China’s rice grew in the warm, wet south, around the Yangtze, but its capitals and armies were in the drier north, facing the steppe. Its great rivers flow east, not north, so in the early 600s the Sui emperors (their empire shaded) linked them with canals, and later dynasties extended the line to Beijing (arrows). Grain barges kept the north fed for over a thousand years.",
  more:"Building it cost the lives of huge numbers of forced labourers, and the Sui dynasty fell soon after. Cities along it, like Yangzhou, grew rich on the traffic, and parts are still busy with barges today. It became a UNESCO World Heritage Site in 2014."});
 ins(id,"The monsoon",{title:"Two rice baskets on a pole",view:[98,7,115,24.5],globe:[106,16,3.5],card:"left",hi:["vn"],
  gfRuler:{a:[106.62,17.47],b:[106.17,17.62]},
  pins:[[[105.85,21.03],"Hanoi: the Red River delta","point"],[[105.78,10.03],"The Mekong delta","point"]],
  iconPins:[{at:[106.2,20.6],icon:"wheat",col:"#8a5a2b"},{at:[105.6,9.7],icon:"wheat",col:"#8a5a2b"}],
  phPins:[ph([105.78,10.03],"Can Tho: a Mekong delta market","Can Tho, Vietnam, Floating Market, Boats.jpg")],
  stat:"At its narrowest, Vietnam is only about 50 km wide",
  body:"Vietnamese describe their country as a carrying pole with a basket of rice at each end: the Red River delta around Hanoi in the north and the Mekong delta in the south. Most people live in or near these two flat, flooded deltas, and the thin coastal strip between them, backed by mountains, carries the main road and railway. Drag the ruler across the narrowest part.",
  more:"The shape comes from history: Vietnamese rulers spread south from the Red River along the coast over many centuries, reaching the Mekong delta only in the 1600s and 1700s. That is one reason the north and south have different accents and dishes, and, from 1954 to 1975, had different governments."});
 ins(id,"Deserts and steppe",{title:"Arabia’s monsoon corner",view:[43,9,63,25],globe:[54,17,4],card:"left",hi:["om"],
  lines:[{coords:[[50,9.5],[51.8,12.5],[53,15],[54,16.8]],kind:"flow"}],
  pins:[[[54.09,17.02],"Salalah","point"],[[[50,22],[47,20]],"The Empty Quarter: over 45 °C","area"]],
  stat:"Every summer, one corner of the Arabian desert turns green with mist and drizzle",
  body:"The edge of the Indian Ocean monsoon brushes Dhofar, in southern Oman. From June to September its moist south-west winds (arrow) cross water chilled by currents rising from the deep, then hit the coastal mountains, wrapping them in fog and drizzle. The hills turn green while the rest of Arabia bakes at over 45 °C.",
  more:"People drive here from across the Gulf for the khareef, the monsoon season, to enjoy cool, rainy weather. The dry slopes just behind the mist grow frankincense trees, whose scented resin made southern Arabia rich in ancient times."});
}

function africa(){const id="africa";
 set(id,"Africa",s=>{rep(s,"body","and the only one that reaches into all four hemispheres","and the only one crossed by both the equator and the prime meridian (dashed)");
  if(!s.lines)s.lines=[{coords:par(0,-10,43,1),kind:"dash"},{coords:mer(0,37,5,1),kind:"dash"}]});
 /* back-to-back Mercator stops: keep the three outlines, fold the Greenland point into them */
 if(st(id,"Room for three giants")){rm(id,"Bigger than it looks");
  set(id,"Room for three giants",s=>{if(!/Greenland/.test(s.more||""))s.more=(s.more||"")+" Most world maps use Mercator, which stretches lands far from the equator: Africa is about 14 times bigger than Greenland, though many maps draw them the same size."})}
 set(id,"The Nile",s=>{if(!/tilts/.test(s.more||""))s.more="The Nile flows north through the desert because the land tilts from the East African highlands down to the Mediterranean, and most of the water that reaches Egypt falls as rain on the Ethiopian highlands, over 1,500 km away. "+(s.more||"")});
 set(id,"The Sahara is mostly rock",s=>rep(s,"more","About 8,000 years ago the Sahara was green",GREEN+" the Sahara was green"));
 rm(id,"The roundest and the squarest");          /* a record with no why; its slot goes to the new stops */
 ins(id,"Wild Africa",{title:"The long shadow of the slave trade",view:[-30,-4,14,18],globe:[2,8,3],card:"left",hi:["bj"],
  lines:[{coords:[[2.09,6.3],[-2,4.8],[-8,3.6],[-14,3],[-19,2.6]],kind:"flow"}],
  pins:[[[2.09,6.36],"Ouidah","point"],[[[1,7],[4,7.5]],"The “Slave Coast”","area"]],
  stat:"In Africa, people whose ancestors’ groups lost the most people to the slave trade trust others less today",
  body:"For centuries, people were captured and sold to European ships at coastal ports like Ouidah, in Benin: often by raiders from nearby groups or by local rulers, and sometimes even by neighbours or relatives. The economists Nathan Nunn and Leonard Wantchekon compared surveys from across Africa and found that in the groups raided most, people still trust their neighbours, relatives and local leaders less.",
  more:"An earlier study by Nunn found that the African countries that lost the most people to the slave trades are, on average, the poorest today. Mistrust makes trade, lending and local government harder, which is one way the past still costs money. On Ouidah’s beach, a memorial arch, the Door of No Return, marks the end of the route the captives walked to the ships."});
 ins(id,"Straight-line borders",{title:"A railway camp became a capital",view:[30,-6,42.5,3],globe:[37,-1.5,5],card:"left",hi:["ke"],hiSoft:["ug"],
  lines:[{coords:[[39.67,-4.05],[38.56,-3.4],[37.6,-2.5],[36.82,-1.29],[36.43,-0.72],[36.07,-0.3],[35.3,-0.2],[34.76,-0.09]],kind:"flow"}],
  pins:[[[39.67,-4.05],"Mombasa: the port","point"],[[34.76,-0.09],"Kisumu, on Lake Victoria","point"]],
  phPins:[ph([36.82,-1.29],"Nairobi, from its national park","Buffalo Nairobi Skyline Savannah Kenya May19 R1600769.jpg")],
  stat:"Nairobi didn’t exist until 1899: it began as a camp on a railway line",
  body:"The British built the Uganda Railway (arrows) from the port of Mombasa to Lake Victoria. Nairobi was a supply depot about halfway along, on flat ground with water, just before the line had to climb the steep highlands towards the Rift Valley. Within a few years it was the colony’s capital; today over 4 million people live there.",
  more:"A 2017 study of Kenya found that towns that grew up around railway stations kept growing even after the trains mattered less, because the people, shops and roads were already there. Look at Africa’s railways: most were built to run from a mine or farmland straight to a port, not between neighbouring countries."});
 ins(id,"Three capitals",{title:"The city that nearly ran dry",view:[13,-35.6,23,-31],globe:[18.9,-33.9,6],card:"left",
  gfClimate:{alpha:.55,box:[12,-37,30,-28]},
  pins:[[[18.42,-33.92],"Cape Town","point"],[[19.28,-34.08],"Theewaterskloof, its biggest dam","point"]],
  phPins:[ph([18.41,-33.96],"Cape Town and Table Mountain","Cape Town (ZA), Table Mountain -- 2024 -- 2825.jpg")],
  stat:"In 2018 Cape Town, a city of over 4 million people, came close to turning off its taps",
  body:"Cape Town has a Mediterranean climate (yellow on the map): almost all its rain falls in winter and is stored in a few big dams. After three dry winters in a row, the city warned of “Day Zero”, the day the taps would be shut and people would queue for water. Each person was asked to use no more than 50 litres a day, and the city roughly halved its water use.",
  more:"Day Zero never came: saving water and the return of the rains pushed it back. People flushed toilets with shower water, and hotels asked guests to shower for under two minutes. Other cities with a long dry season, from Chennai to São Paulo, have had similar scares."});
}

function namerica(){const id="namerica";
 set(id,"Three giants",s=>rep(s,"more","; so much of Canada is water that it holds more lakes than the rest of the world combined",""));
 set(id,"Mountains and rivers",s=>rep(s,"more","The Great Plains are some of the flattest farmland on Earth: Kansas really is, measurably, flatter than a pancake.","The Great Plains are flat because they are an old sea floor, later smoothed over by sand and gravel washed down from the Rockies: Kansas really is, as a 2003 joke study measured, flatter than a pancake."));
 ins(id,"Mountains and rivers",{title:"Cities on the waterfall line",view:[-87,31,-72,42],globe:[-78,37,4],card:"left",
  lines:[{coords:[[-74.76,40.22],[-75.16,39.95],[-76.61,39.29],[-77.04,38.9],[-77.44,37.54],[-78.64,35.78],[-81.03,34.0],[-81.97,33.47],[-83.63,32.84],[-84.99,32.46]],kind:"dash"}],
  pins:[[[-79.6,35.2],"The Fall Line","point"],[[-77.25,38.99],"Great Falls of the Potomac","point"]],
  stat:"Join up Philadelphia, Baltimore, Washington, Richmond and Columbia, and you have traced a line of waterfalls",
  body:"Along the US East Coast, rivers drop off the hard old rock of the hills onto the soft, flat coastal plain, in falls and rapids. Boats coming up from the sea had to stop there and unload, and the falling water could turn mill wheels. So a chain of cities grew up exactly where the rocks change: the Fall Line (dashed).",
  more:"Washington’s Great Falls on the Potomac and Richmond’s rapids on the James are close to downtown. Geographers call a place where goods must switch from one kind of transport to another a “break-of-bulk point”, and the Fall Line is a textbook case."});
 ins(id,"Cities on the waterfall line",{title:"The ditch that made New York",view:[-85,39.8,-71,45.2],globe:[-75.5,42.5,5],card:"left",
  lines:[{coords:[[-78.88,42.89],[-78.69,43.17],[-77.61,43.16],[-76.15,43.05],[-75.23,43.1],[-74.6,42.95],[-73.94,42.81],[-73.75,42.65]],kind:"flow"},{coords:[[-73.75,42.65],[-73.9,42.0],[-73.95,41.4],[-74.0,40.75]],kind:"flow"}],
  xsec:{title:"Along the canal: Buffalo to Albany",pts:[[-78.88,42.89,"Buffalo"],[-77.61,43.16,"Rochester"],[-76.15,43.05,"Syracuse"],[-75.23,43.1,"Utica"],[-74.6,42.95,"Mohawk Valley"],[-73.75,42.65,"Albany"]],mark:200,
   note:"The dashed line marks 200 m. The route stays low the whole way: the Mohawk Valley is the one easy gap through the Appalachians. Heights are smoothed."},
  phPins:[ph([-78.69,43.17],"Lockport’s locks, about 1855","Erie Canal, Lockport New York, c.1855.jpg")],
  pins:[[[-78.88,42.89],"Buffalo, on Lake Erie","point"],[[-73.75,42.65],"Albany, on the Hudson","point"],[[-74.0,40.71],"New York","point"]],
  stat:"In 1825 a canal through the one easy gap in the Appalachians made New York the gateway to the American interior",
  body:"The Erie Canal ran about 580 km from the Hudson River at Albany to Lake Erie at Buffalo, along the low Mohawk Valley (move along the chart). Moving goods between the Great Lakes and New York suddenly cost about a tenth as much, so the Midwest’s grain flowed down the canal and the Hudson to New York’s port.",
  more:"New York was already the biggest US city, but Philadelphia and Baltimore were close rivals; within a few decades it had pulled far ahead. Doubters had mocked the canal as “Clinton’s Ditch”, after DeWitt Clinton, the governor who pushed it through."});
}

function samerica(){const id="samerica";
 set(id,"A ribbon of a country",s=>{if(!/Humboldt/.test(s.more||""))s.more="The Atacama is so dry because the cold Humboldt Current chills the air above the sea, so it can’t rise to make rain clouds, and the Andes block wet air from the east. "+(s.more||"")});
 /* the satellite detail is the space tour's story */
 set(id,"The world’s biggest mirror",s=>rep(s,"more"," Satellites use the salt flat to calibrate their height measurements because it is so flat.",""));
 ins(id,"The Inca Empire",{title:"Farming in floors",view:[-80,-19,-64,-8],globe:[-72,-13.3,4.5],card:"left",
  xsec:{title:"From the Pacific over the Sacred Valley to the Amazon",pts:[[-76.2,-13.7,"Pacific"],[-75.0,-13.6],[-73.6,-13.6],[-72.08,-13.33,"Sacred Valley"],[-71.7,-13.0],[-71.35,-12.65,"Cloud forest"],[-70.7,-12.3,"Amazon lowlands"]],mark:3500,
   note:"The dashed line marks 3,500 m: roughly where maize gives way to potatoes, with llama pastures higher still. Heights are smoothed."},
  pins:[[[-72.08,-13.33],"The Sacred Valley","point"],[[-71.97,-13.53],"Cusco","point"]],
  phPins:[ph([-72.2,-13.33],"Moray: Inca farming terraces","Peru - Sacred Valley & Incan Ruins 279 - Moray (8118174960).jpg")],
  stat:"In the Andes, one village could farm a tropical valley, a cool slope and a freezing plateau, all within a day’s walk",
  body:"Climb the steep Andes and the climate changes every few hundred metres. So Andean families farmed several “floors” at once: maize and coca low down, potatoes higher up, and llamas and alpacas grazing near the snow. With fields on many floors, one bad harvest could not starve everyone. Move along the chart from the Pacific over the Sacred Valley down to the Amazon.",
  more:"The anthropologist John Murra called this the “vertical archipelago”: islands of farmland stacked up a mountainside rather than spread across a plain. It helps explain how the Inca fed a big empire without markets or money: food moved up and down the mountains and was kept in thousands of storehouses."});
 ins(id,"The Amazon",{title:"Turning bad soil into soybeans",view:[-66,-24,-40,-4],globe:[-52,-13,3],card:"left",
  gfClimate:{alpha:.5,box:[-70,-26,-36,0]},
  pins:[[[-55.71,-12.55],"Sorriso: soy capital","point"],[[-47.93,-15.78],"Brasília","point"],[[[-50,-14],[-46,-18]],"The Cerrado","area"]],
  iconPins:[{at:[-55.71,-12.55],icon:"wheat",col:"#8a5a2b"}],
  phPins:[ph([-54.5,-13.5],"Soybeans","Soybean.USDA.jpg")],
  stat:"Brazil’s central savanna was once thought useless for farming; now it helps make Brazil the world’s biggest soybean exporter",
  body:"The Cerrado, the tropical savanna (light blue on the map) south of the Amazon rainforest (dark blue), has old, acidic red soils where crops struggled. From the 1970s Embrapa, Brazil’s farm research agency, showed farmers how to spread crushed limestone to cancel out the acid, and bred soybeans that grow well in the tropics. Flat land and big machines did the rest.",
  more:"The cost is the Cerrado itself: about half of this savanna, rich in wildlife and the source of many of Brazil’s rivers, has already been cleared. Towns like Sorriso, which calls itself Brazil’s soy capital, barely existed 50 years ago: it became a town only in 1986."});
 ins(id,"Europe ruled from Rio",{title:"Rich from frozen beef",view:[-68,-41,-50,-28],globe:[-61,-35,4],card:"left",hi:["ar"],
  lines:[{coords:[[-58.38,-34.6],[-54,-33],[-50,-31]],kind:"flow"}],
  pins:[[[-58.38,-34.6],"Buenos Aires","point"],[[[-62,-35],[-60,-33]],"The Pampas","area"]],
  stat:"Around 1900, Argentina was one of the richest countries in the world per person",
  body:"The Pampas are a huge flat grassland with deep, rich soil, perfect for cattle and wheat. In the late 1870s, ships with refrigerated holds began carrying frozen meat across the Atlantic (arrow), and suddenly Argentine beef could feed Europe. Railways, migrants and money poured in, and Buenos Aires grew into a grand city.",
  more:"Argentina then slipped down the rankings for most of the 1900s, and economists still argue why: political crises, closed trade, debt. It is a favourite example that good land alone doesn’t keep a country rich."});
 CARD["samerica|Farming in floors"]="Peru - Sacred Valley & Incan Ruins 279 - Moray (8118174960).jpg";
}

function oceania(){const id="oceania";
 rm(id,"Wider than the Moon");                     /* word for word the same as the geography tour's stop */
 set(id,"Only in Australia",s=>{s.stat="About 80% of Australia’s mammals, reptiles and flowering plants are found nowhere else";
  rep(s,"more","About 80% of its mammals, reptiles and flowering plants are found nowhere else. ","")});
 ins(id,"The red centre",{title:"Goyder’s Line",view:[127,-36.5,143,-29],globe:[138.5,-33,5],card:"left",hi:["au"],
  lines:[{coords:[[133.9,-32.0],[135.1,-32.6],[136.0,-33.4],[136.9,-33.2],[137.7,-32.6],[138.3,-32.5],[138.75,-32.7],[139.4,-33.1],[140.1,-33.6],[141.0,-33.9]],kind:"dash"}],
  pins:[[[138.61,-32.73],"Orroroo","point"],[[138.6,-34.93],"Adelaide","point"],[[[138.5,-31.6],[137.6,-31.2]],"North of the line: too dry to farm","area"]],
  stat:"In 1865 a surveyor drew a line beyond which farming would fail. Farmers ignored it, and their ruined houses still stand",
  body:"George Goyder rode across South Australia during a drought and mapped where the saltbush showed the land was too dry for crops (dashed, roughly drawn). A run of wet years in the 1870s tempted farmers north of his line to grow wheat. When the dry years returned, the crops failed and families walked away.",
  more:"Stone cottages and empty towns north of the line are still there. It is still used as a guide to where crops are safe, and scientists warn that a warmer, drier climate could push it south."});
 ins(id,"Only in Australia",{title:"Water from under the desert",view:[116,-36,158,-9],globe:[143,-25,2.5],card:"left",
  lines:[{poly:[[138,-12.5],[142.5,-10.9],[145,-14.5],[147,-19.5],[149.3,-24],[151,-27.5],[150.3,-30.5],[148.3,-32.6],[145.5,-32.8],[143,-31.6],[140.3,-30.5],[137.8,-29.6],[135.6,-28.6],[134.2,-26.2],[135.2,-23.2],[137,-20.2],[138,-16.8],[138,-12.5]],kind:"shade"}],
  xsec:{title:"From the Great Dividing Range west to Lake Eyre",pts:[[150.3,-26.6,"Great Dividing Range"],[148,-26.2],[145.5,-26],[143,-26.5],[140.5,-27.5],[137.6,-28.4,"Lake Eyre"]],mark:300,
   note:"The dashed line marks 300 m. Under the land, sandstone layers slope the same way, carrying rain from the hills west under the Outback."},
  pins:[[[150.3,-26.6],"Rain soaks in here","point"],[[137.6,-28.4],"Mound springs","point"]],
  stat:"Under more than a fifth of Australia lies one of the biggest stores of underground water on Earth, some of it about two million years old",
  body:"Rain falling on the Great Dividing Range soaks into layers of sandstone that slope west under the Outback (shaded, roughly), and creeps inland a few metres a year. Drill a well and the water often rushes up by itself, because it is under pressure: an artesian bore. Much of outback cattle farming depends on it.",
  more:"Where the water leaks out naturally it forms “mound springs”, tiny oases in the desert with fish and snails found nowhere else. Early bores were left running freely and the pressure dropped, so thousands are now being capped and piped."});
 const T2=[-175.39,-20.55];
 ins(id,"The Polynesian triangle",{title:"The biggest blast in a century",view:[-180,-27,-168,-14],globe:[-175.4,-20.6,6],card:"left",hi:["to"],
  lines:[{coords:ring(T2,1.2),kind:"dash"},{coords:ring(T2,2.4),kind:"dash"},{coords:ring(T2,3.6),kind:"dash"}],
  pins:[[T2,"Hunga Tonga–Hunga Haʻapai","point"],[[-175.2,-21.14],"Nukuʻalofa","point"]],
  phPins:[ph([-175.0,-20.0],"The ash cloud, seen from the Space Station","ISS-66 Atmospheric plume from 2022 Hunga Tonga eruption (1).jpg")],
  stat:"In 2022 an undersea volcano in Tonga threw ash and gas higher than any eruption ever measured, about 57 km up",
  body:"Hunga Tonga–Hunga Haʻapai exploded on 15 January 2022 just under the sea surface, where seawater flashing into steam made the blast far more violent. Its pressure wave (rings) raced round the Earth several times, and people heard the bang in Alaska, over 9,000 km away.",
  more:"It blasted so much water vapour high into the sky that it raised the amount in the stratosphere by around a tenth. Tsunamis reached Japan and Peru, and Tonga’s undersea internet cable was cut, leaving the country almost cut off from the world for about five weeks."});
}

function antarctica(){const id="antarctica";
 set(id,"The moving South Pole",s=>{rep(s,"more"," The station there keeps New Zealand time, because its flights come from Christchurch.","");
  if(!/winter/.test(s.more||""))s.more=(s.more||"")+" Each year’s new marker is designed and made by the people who spent the winter at the station."});
 set(id,"Coldest, driest, windiest, highest",s=>rep(s,"more","Inland it gets so little snow that it counts as the largest desert on Earth.","Its height, its white surface reflecting sunlight back into space, and months of polar night make it far colder than the Arctic, which is ocean."));
 ins(id,"Antarctic rainforest",{title:"Why Antarctica froze",view:[-180,-90,180,-40],globe:[-30,-78,0.95],
  lines:[{coords:par(-57,-178,178,4).concat([[178,-57]]),kind:"flow"}],
  pins:[[[-64,-58.5],"Drake Passage","point"],[[146,-50],"Tasmanian Gateway","point"]],
  stat:"Antarctica was green and wooded until the seas opened between it and its last neighbours",
  body:"Around 34 million years ago, the sea opened between Antarctica and South America (the Drake Passage) and widened between Antarctica and Australia. A current could then circle the continent with nothing in its way (arrows), which kept warm water from the north away, and the ice began to grow.",
  more:"Falling carbon dioxide in the air mattered too, and scientists still argue about which did more. The Antarctic Circumpolar Current still flows around the continent today: it carries more water than any other current on Earth."});
 ins(id,"Life at the edge",{title:"Fish with clear blood",view:[-75,-68,-45,-55],globe:[-58,-62,4],card:"left",
  pins:[[[-58.5,-62],"South Shetland Islands","point"]],
  iconPins:[{at:[-60,-63],icon:"fish",col:"#3aa0c8"}],
  stat:"Antarctic icefish are the only animals with backbones known to live without haemoglobin, the substance that makes blood red",
  body:"Their blood is almost clear, with almost no red blood cells. Ice-cold water holds much more oxygen than warm water, so these fish get by on oxygen dissolved straight into their blood, pumped by extra-large hearts. Many Antarctic fish also make antifreeze proteins that stop ice crystals growing in their bodies.",
  more:"Living without red blood cells works only in the coldest, most oxygen-rich seas on Earth. As the Southern Ocean warms, icefish may be among the first to struggle."});
 ins(id,"Blood Falls",{title:"The pond that never freezes",view:[150,-80,175,-75],globe:[161.2,-77.6,6],
  pins:[[[161.19,-77.56],"Don Juan Pond","point"],[[162.27,-77.72],"Blood Falls","point"]],
  stat:"In one of the coldest places on Earth, a pond stays liquid far below −40 °C",
  body:"Don Juan Pond, in the McMurdo Dry Valleys, is one of the saltiest bodies of water known: over 40% salt, more than ten times saltier than the sea. All that salt, mostly calcium chloride, lowers its freezing point to about −50 °C, so it almost never freezes.",
  more:"It is only a few centimetres deep, and scientists study it to imagine where salty water might stay liquid on Mars. It was found in 1961 and named after the two helicopter pilots, Don Roe and John Hickey, who flew the team there."});
}

/* ======================================================================= MAPPED BOOKS */
function prisoners(){const id="bprisoners";const H=y=>({mode:"history",sub:y,card:"left"});
 ins(id,"Lines in the sand",Object.assign(H("2015"),{title:"Iran, a mountain fortress",view:[36,22,66,42],globe:[53,32,3],hi:["ir"],
  xsec:{title:"From Baghdad over the Zagros to the salt desert",pts:[[44.36,33.31,"Baghdad"],[46,33.6],[47.6,33.8,"Zagros"],[49.5,33.4],[51.67,32.65,"Isfahan"],[53.5,33.6],[55,34.2,"Dasht-e Kavir"]],mark:1500,
   note:"The dashed line marks 1,500 m. The land jumps from the flat plain of Iraq up into the Zagros, then stays high around a dry, salty middle. Heights are smoothed."},
  pins:[[[51.39,35.69],"Tehran","point"],[[56.4,26.6],"Strait of Hormuz","point"],[[[54,34.3],[57.5,30.5]],"Salt deserts","area"]],
  stat:"Marshall describes Iran as a fortress: mountains along its western and northern edges, salt desert in the middle",
  body:"In his Middle East chapter, Marshall points out that the Zagros and Alborz ranges wall Iran off, and its centre is the great salt deserts, the Dasht-e Kavir and the Dasht-e Lut. Move along the chart from the flat Iraqi plain up into the Zagros. He argues this makes Iran very hard to invade, but also hard to hold together, as many of its peoples live in separate mountain regions.",
  more:"Most Iranians live around the rim, in and below the mountains, not in the empty middle. Marshall also notes Iran’s hold over the Strait of Hormuz, the narrow exit from the Gulf that a large share of the world’s oil passes through."}));
 ins(id,"Africa: bigger than it looks",Object.assign(H("2015"),{title:"Congo: too big to hold",view:[6,-16,36,8],globe:[23,-3,3],hi:["cd"],hiSoft:["ao","zm","tz","bi","rw","ug","ss","cf","cg"],
  gfRuler:{a:[15.31,-4.32],b:[29.22,-1.68]},
  pins:[[[15.31,-4.32],"Kinshasa","point"],[[29.22,-1.68],"Goma: the far east","point"],[[27.48,-11.66],"Lubumbashi: copper and cobalt","point"]],
  phPins:[ph([26.5,-10.9],"Cobalt miners in the south-east","Artisanal cobalt miners in the Democratic Republic of Congo.jpg")],
  stat:"DR Congo is about as big as Western Europe, borders nine countries and has few roads across it",
  body:"Marshall uses DR Congo to show the limits that geography and colonial borders set. Its peoples are split by rainforest, rivers and distance, and its mineral riches lie far to the east and south-east, closer to its neighbours than to the capital, Kinshasa (drag the ruler). From 1998 to 2003 armies from about nine countries fought there.",
  more:"Millions of people died, mostly from hunger and disease, though estimates vary widely. Marshall argues that a state like this can be stronger on the map than on the ground."}));
 ins(id,"Latin America’s walls",Object.assign(H("2015"),{title:"Brazil’s wall by the sea",view:[-55,-28,-38,-16],globe:[-46.4,-23.7,5],hi:["br"],
  xsec:{title:"From the port of Santos up to São Paulo and inland",pts:[[-46.33,-23.96,"Santos"],[-46.45,-23.8],[-46.63,-23.55,"São Paulo"],[-47.06,-22.9,"Campinas"],[-47.8,-22.5]],mark:700,
   note:"The dashed line marks 700 m. The coast climbs onto the plateau in a few tens of kilometres. Heights are smoothed, so the real cliff is steeper still."},
  pins:[[[-46.33,-23.96],"Santos","point"],[[-46.63,-23.55],"São Paulo","point"],[[-43.2,-22.9],"Rio de Janeiro","point"],[[-58.4,-34.6],"The River Plate","point"]],
  stat:"Marshall argues that much of Brazil’s coast is backed by a steep wall that cuts its ports off from the interior",
  body:"Behind cities such as Santos and Rio de Janeiro, the land climbs steeply onto a high plateau: move along the chart from the port of Santos up to São Paulo, about 750 m higher, in only a few tens of kilometres. Roads and railways must climb hard. Marshall argues that this, with the Amazon’s poor soils and the lack of big rivers flowing to these ports, held back the giant’s growth.",
  more:"He contrasts Brazil with Argentina’s River Plate, the region’s natural highway into farm country. Brazil has grown into a big economy anyway: Marshall writes about limits, not fate."}));
}

function ggs(){const id="bggs";
 set(id,"Why Europe, not China?",s=>{if(!/exaggerat/.test(s.more||""))s.more=(s.more||"")+" How big Zheng He’s largest ships really were is debated: some historians think the old records exaggerate them."});
 ins(id,"Yali’s question",{title:"The Chatham Islands, 1835",view:[166,-48,186,-35],globe:[178,-42.5,3.5],card:"left",hi:["nz"],
  lines:[{coords:[[174.8,-41.3],[178.5,-42.3],[183.2,-43.8]],kind:"flow"}],
  pins:[[[183.45,-43.95],"Chatham Islands: the Moriori","point"],[[174.8,-38.5],"North Island: Māori farmers","point"]],
  stat:"Two peoples with the same Polynesian ancestors met again after centuries apart, and the farmers overwhelmed the hunter-gatherers",
  body:"Diamond’s chapter 2: the ancestors of the Māori settled New Zealand and farmed sweet potato in the warm north. Some went on to the Chatham Islands, about 800 km east, where it was too cold for their crops; there they became the Moriori, small groups of hunter-gatherers with a tradition of settling quarrels peacefully. In 1835 a ship brought about 900 armed Māori (arrow); the Moriori chose not to fight, and were killed or enslaved.",
  more:"Diamond calls it a natural experiment over a few centuries: the same people, put in different environments, ended up with very different societies. By the 1860s only about a hundred Moriori survived."});
}

function nations(){const id="bnations";const H=y=>({mode:"history",sub:y,card:"left"});
 set(id,"Botswana’s chiefs",s=>{if(!/Zimbabwe/.test(s.more||""))s.more=(s.more||"")+" Next door, Zimbabwe had richer farmland, but its rulers seized land and power, and its economy shrank by roughly half between 1998 and 2008."});
 ins(id,"The Glorious Revolution",Object.assign(H("1800"),{title:"The convicts who sued",view:[144,-38.5,157,-29],globe:[151.2,-33.86,6],hi:["au"],
  pins:[[[151.21,-33.86],"Sydney Cove, 1788","point"]],
  phPins:[ph([151.21,-33.86],"Sydney Cove in 1792","View of Sydney Cove 1792.jpg")],
  stat:"In 1788 two convicts in the new prison colony at Sydney sued a ship’s captain over a lost parcel, and won",
  body:"Henry Kable and Susannah Holmes arrived with the First Fleet. When their luggage went missing, they took the captain of their ship to the colony’s new court, and were awarded £15. The authors see this as a sign of things to come: Australia’s convicts and freed settlers kept pushing for rights, and the prison colony turned into a democracy.",
  more:"They compare it with Spanish America, where colonists ruled over forced labourers instead of becoming citizens with rights of their own."}));
 ins(id,"Venice closes its doors",Object.assign(H("1700"),{title:"Printing held back",view:[18,33,42,47],globe:[28.98,41.01,5],
  pins:[[[28.98,41.01],"Istanbul, the Ottoman capital","point"]],
  phPins:[ph([28.96,41.02],"Istanbul: the Süleymaniye Mosque","SüleymaniyeMosqueIstanbul (cropped).jpg")],
  stat:"Printing in Arabic letters was long resisted in the Ottoman Empire: the first Muslim-run press was allowed only in 1727, nearly 300 years after Gutenberg",
  body:"The authors argue that the Ottoman sultans feared new ideas that could weaken their rule, so printing in Arabic script was blocked for centuries. They say that by about 1800 only 2 or 3 Ottomans in 100 could read, against about 6 in 10 adult men in England.",
  more:"Historians debate how strict the ban really was: scribes and religious scholars also had reasons to resist, and Jewish, Armenian and Greek printers worked in Istanbul long before 1727. Even İbrahim Müteferrika’s press printed fewer than twenty books before it closed."}));
 ins(id,"Botswana’s chiefs",Object.assign(H("1975"),{title:"Tearing up the railway",view:[-14.5,6.6,-9.6,10.2],globe:[-11.8,8.4,6],hi:["sl"],
  lines:[{coords:[[-13.23,8.48],[-12.9,8.35],[-12.4,8.1],[-11.74,7.96],[-11.19,7.88],[-10.7,8.1]],kind:"dash"}],
  pins:[[[-13.23,8.48],"Freetown","point"],[[-11.74,7.96],"Bo","point"],[[-10.7,8.1],"Pendembu: the end of the line","point"]],
  phPins:[ph([-13.25,8.47],"Freetown’s beach","Beach in Freetown, Sierra Leone (14176784751).jpg")],
  stat:"In the 1970s Sierra Leone’s ruler shut the railway to the region where his opponents lived, and sold off its track",
  body:"The authors tell how Siaka Stevens, who ruled from 1968 to 1985, closed the line (dashed) that ran into the Mende lands of the south and east, which backed his rivals, and sold off the rails and trains. A tool for the whole economy was destroyed because it could help the wrong people.",
  more:"For the authors this is extractive politics at its plainest: a ruler would rather the country stay poor than risk his power. Compare Botswana, the stop before, where leaders shared the wealth instead."}));
}

function collapse(){const id="bcollapse";const H=y=>({mode:"history",sub:y,card:"left"});
 set(id,"Easter Island",s=>{rep(s,"stat","on an island 3,670 km from Chile","on an island about 3,500 km from mainland Chile");s.gfRuler={a:[-109.35,-27.12],b:[-73.65,-37.6]};
  if(Array.isArray(s.pins))s.pins=s.pins.map(p=>p&&p[1]==="Valparaíso, Chile"?[[-73.65,-37.6],"Nearest mainland, Chile","point"]:p)});
 set(id,"Hispaniola: one island, two paths",s=>{s.more="Later satellite studies give higher figures for Haiti, depending on what counts as forest, but the contrast along the border is real."});
 ins(id,"The Classic Maya",Object.assign(H("1000"),{title:"Iceland’s blowing soil",view:[-26,62.8,-12,67],globe:[-18.6,64.9,5],hi:["is"],
  pins:[[[-21.94,64.15],"Reykjavík","point"],[[[-17,64.8],[-19,65]],"The bare highlands","area"]],
  phPins:[ph([-21.1,64.26],"Þingvellir","Thingvellir, Iceland (21677114683).jpg")],
  stat:"Iceland’s Viking settlers thought the land was like Norway’s, but its soil was so light that it blew away",
  body:"Diamond explains that much of Iceland’s soil is made of fine volcanic ash. Settlers arriving around 870 cut the birch woods and grazed sheep, which stripped away the plants holding the soil down, and wind and water carried it off. Most of the original woodland, and much of the soil, was lost.",
  more:"Diamond still counts Iceland as a partial success: once farmers understood the danger, they agreed together how many sheep each could graze on the shared highland pastures, and their society survived, unlike the Norse in Greenland, the next stop."}));
 ins(id,"Societies that succeeded",Object.assign(H("1990"),{title:"Too many people, too little land",view:[27.5,-3.3,31.5,-0.6],globe:[29.6,-2,7],hi:["rw"],
  pins:[[[29.36,-1.68],"Kanama","point"],[[30.06,-1.95],"Kigali","point"]],
  stat:"Diamond argues that a shortage of land helped fuel the killing, even in a Rwandan district where almost everyone was Hutu",
  body:"Rwanda is the most crowded country in mainland Africa. Diamond cites a study of the commune of Kanama, in the north-west, where family farms had shrunk to under a third of a hectare. During the 1994 genocide people there also killed fellow Hutu, often in quarrels over land.",
  more:"Diamond calls population pressure one cause, not the only one: the genocide of the Tutsi was planned and organised by Hutu extremists. Many historians put far more weight on politics than on land."}));
 ins(id,"Australia: mining the soil",Object.assign(H("2005"),{title:"An oil field that saved the forest",view:[139,-9.5,148,-3],globe:[143.3,-6.4,6],hi:["pg"],
  pins:[[[143.33,-6.38],"Lake Kutubu: the oil field","point"]],
  iconPins:[{at:[143.4,-6.5],icon:"oil",col:"#8a5a2b"}],
  stat:"Diamond found some of the best-protected rainforest in Papua New Guinea around an oil field",
  body:"Diamond was surprised by the Kutubu oil project, run by Chevron when he visited: the company banned its workers from hunting or buying wild animals and guarded hard against spills, because an accident would cost it far more than prevention. Birds of paradise and tree kangaroos thrived there.",
  more:"Diamond uses Kutubu to argue that companies protect the environment when the public and governments make damage costly to them. Critics say one well-run field doesn’t excuse the oil industry."}));
 ins(id,"An oil field that saved the forest",Object.assign(H("2005"),{title:"We are all in the polder",view:[2.5,50.8,8,54],globe:[5.5,52.5,6],hi:["nl"],
  gfSea:3,gfSeaUI:true,
  pins:[[[5.5,52.5],"Flevoland: land from the sea","point"],[[4.48,51.92],"Rotterdam","point"]],
  phPins:[ph([4.64,51.88],"Kinderdijk: windmills that pumped the polders","The windmills of Kinderdijk.JPG")],
  stat:"A Dutch saying: be kind to your enemy, because he may run the pump next to yours in the polder",
  body:"Diamond ends with the Netherlands, where about a quarter of the land lies below sea level, in polders: land won from the sea and kept dry by dikes and pumps. If the dikes fail, rich and poor drown together, so everyone has a reason to work together. Try the sea-level slider to see what the dikes hold back.",
  more:"Diamond sees this as the lesson of his book: societies do better when their leaders cannot escape the problems they cause. Dutch politics, with its habit of bargaining until everyone can agree, is called the polder model. Flevoland, the newest province, was pumped dry in the 1950s and 1960s."}));
}

/* ======================================================================= questions */
function questions(){try{if(typeof TOURQ==="undefined")return;const Q=TOURQ;
 const fix=(id,f)=>{const q=Q[id];if(q&&!q._rvStart){try{f(q)}catch(e){console.error(e)}q._rvStart=1}};
 const swap=(arr,st,n)=>{const i=(arr||[]).findIndex(x=>x&&x.st===st);if(i>=0)arr[i]=n;else if(arr)arr.push(n)};
 fix("geo",q=>swap(q.recap,"France: the most time zones",{q:"About 6 million years ago, which sea largely dried up when its gateway to the ocean closed?",o:["The Black Sea","The Mediterranean","The Caspian Sea","The Red Sea"],a:1,why:"With the Strait of Gibraltar closed, the Mediterranean evaporated and left thick salt on its floor.",st:"The sea that dried up",kc:"es"}));
 fix("night",q=>{(q.mid||[]).forEach(x=>{if(x.at==="An island continent lit at the edges")x.at="Japan’s lit coastline"});
  swap(q.recap,"An island continent lit at the edges",{q:"About how much of its night lights did Syria lose in four years of war?",o:["About a tenth","About a third","About four-fifths","All of them"],a:2,why:"Satellite pictures from 2011 and 2015 showed about four-fifths of the lights gone; Aleppo lost almost all of its.",st:"The lights went out in Syria",kc:"sy"})});
 fix("asia",q=>{(q.recap||[]).forEach(x=>{if(x.st==="The biggest island country")x.st="Islands of fire"});
  (q.mid||[]).forEach(x=>{if(x.at==="The biggest island country")x.at="Islands of fire";if(x.at==="The Ring of Fire")x.at="Islands of fire";if(x.st==="The Ring of Fire")x.st="Islands of fire"})});
 fix("time",q=>{(q.mid||[]).concat(q.recap||[]).forEach(x=>{if(x.at==="Reno is west of LA"||x.at==="Canada, south of Detroit")x.at="Where north and west fool you";if(x.st==="Reno is west of LA"||x.st==="Canada, south of Detroit")x.st="Where north and west fool you"})});
 fix("projections",q=>{(q.mid||[]).concat(q.recap||[]).forEach(x=>{if(x.at==="Identical circles")x.at="Same circle, two maps";if(x.st==="Identical circles")x.st="Same circle, two maps"})});
 fix("africa",q=>{(q.mid||[]).concat(q.recap||[]).forEach(x=>{if(x.at==="Bigger than it looks"||x.at==="The roundest and the squarest")x.at=x.at==="Bigger than it looks"?"Room for three giants":"Straight-line borders";if(x.st==="Bigger than it looks")x.st="Room for three giants"})});
 fix("europe",q=>{(q.mid||[]).forEach(x=>{if(x.at==="Further north than you think")x.at="Europe’s great rivers"})});
 fix("oceania",q=>{(q.mid||[]).forEach(x=>{if(x.at==="Wider than the Moon")x.at="Australia is most of it"})});
}catch(e){console.error(e)}}

/* ======================================================================= green Sahara, everywhere */
/* the geography tour's stop is copied from the climate tour's; give both the same, best-supported range */
function sahara(){set("climate","When the Sahara was green",s=>{rep(s,"stat","About 8,000 years ago",GREEN);rep(s,"body","dried out again around 5,000 years ago","dried out again from about 5,000 years ago")})}

/* ======================================================================= photos */
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_RVSTART_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
/* a few older photo pins carry an area's nested coordinates ([[lon,lat],[lon,lat]]), which the map cannot project (a console
   error on the stop and the next one): give them their first point */
function fixAt(s){try{(s.phPins||[]).forEach(q=>{if(q&&Array.isArray(q.at)&&Array.isArray(q.at[0]))q.at=q.at[0].slice()})}catch(e){}}
function reg(s){fixAt(s);try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
const IDS=["pop","geo","time","projections","night","space","europe","asia","africa","namerica","samerica","oceania","antarctica","bprisoners","bggs","bnations","bcollapse"];
function photos(){try{merge();if(typeof PS_PHOTO!=="undefined")for(const k in CARD){const i=libIdx(CARD[k]);if(i>=0&&PS_PHOTO[k]==null)PS_PHOTO[k]=i}
 IDS.forEach(id=>{const t=T(id);if(t)t.steps.forEach(s=>s&&reg(s))})}catch(e){console.error(e)}}
if(typeof psGo==="function"&&!psGo._rvStart){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour)){const s=psSteps()[i];if(s)reg(s)}}catch(e){}return _g.apply(this,arguments)};psGo._rvStart=1}

/* ======================================================================= run */
const FN={pop,geo,time,projections,night,space,europe,asia,africa,namerica,samerica,oceania,antarctica,bprisoners:prisoners,bggs:ggs,bnations:nations,bcollapse:collapse};
function run(){try{for(const id in FN){const t=T(id);if(!t||t.steps._rvStart)continue;try{FN[id]()}catch(e){console.error("review-start",id,e)}def(t.steps,"_rvStart",1)}
 const c=T("climate");if(c&&!c.steps._rvStartS){sahara();def(c.steps,"_rvStartS",1)}
 questions();photos()}catch(e){console.error(e)}}
[0,1500,5000,12000].forEach(ms=>setTimeout(run,ms));
/* the geography tour is rebuilt from its picks every time it starts (geoBuild): patch each new list as it is made */
if(typeof geoBuild==="function"&&!geoBuild._rvStart){const _gb=geoBuild;geoBuild=function(){
  /* put the removed source stops back for a moment, so the geography tour can still copy them */
  const back=[];for(const k in GONE){const [id,title]=k.split("|");const t=T(id);if(id!=="geo"&&t&&!t.steps.some(x=>x&&x.title===title)){t.steps.push(GONE[k]);back.push([t,GONE[k]])}}
  let r;try{r=_gb.apply(this,arguments)}finally{back.forEach(([t,o])=>{const i=t.steps.indexOf(o);if(i>=0)t.steps.splice(i,1)})}
  try{const G=PS_TOURS.geo,old=G.steps;G.steps=r;try{geo();def(r,"_rvStart",1)}finally{G.steps=old}photos()}catch(e){console.error(e)}return r};geoBuild._rvStart=1}
/* any other tour that rebuilds its steps when it starts is patched again straight away */
if(typeof psStart==="function"&&!psStart._rvStart){const _ps=psStart;psStart=function(){const r=_ps.apply(this,arguments);try{run()}catch(e){}return r};psStart._rvStart=1}
if(document.readyState!=="complete")addEventListener("load",()=>setTimeout(run,300));
})();
