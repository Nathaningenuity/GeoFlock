/* GeoFlock: polish for the older tours defined in index.html — Earth from space (space), Earth at night (night), Rivers,
   Lakes, Seas, Islands and Climate. Adds interactive gadgets (cross-sections, rulers, true-size ghosts, day/night, sea level,
   map layers), a few new stops, card photos for stops that had none, photo pins on the opening stops, and fixes stops whose
   map didn't match the text. It only patches PS_TOURS at load (like the ADD patches at the end of geoflock-mapsx.js); load it
   after the tour files. Every patch is keyed by stop title, so a stop that has been renamed or removed is simply skipped. */
(function(){
const OPEN={space:"The Earth from space",night:"The Earth at night",rivers:"Rivers of the world",lakes:"Lakes of the world",
 seas:"Seas & oceans",islands:"Islands",climate:"The world’s climates"};
const W=[-180,-58,180,80];
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(s)}catch(e){console.error(e)}};
/* insert a new stop after the stop titled `after` (once) */
const ins=(id,after,S)=>{const t=T(id);if(!t||t.steps.some(s=>s.title===S.title))return;const i=t.steps.findIndex(s=>s.title===after);if(i<0)return;t.steps.splice(i+1,0,S)};
const dropPh=(s,labels)=>{if(s.phPins)s.phPins=s.phPins.filter(q=>!labels.includes(q.label))};
const ph=(at,label)=>({at,label,col:"#d9682b",icon:"photo"});

/* card photos ("tour|title" → library file name) and photo-pin photos (pin label → file name) */
const CARD={
 "space|The line between day and night":"Blue Marble 2002.png",
 "night|China’s Hu line":"Shanghai by night.jpg",
 "night|India: the most people":"Ganga aarti at Varanasi.jpg",
 "night|Night moves round the planet":"The HoloGlobe Project (Version 3) (SVS155 - earth night).jpg",
 "night|Now explore":"Europe at Night 2014-2015 (SVS30693 - france night lights 201410-201504).tiff",
 "rivers|Downhill to the sea":"Murchison Falls from above.jpg",
 "rivers|The flood that made Egypt":"02010 05878 Aswan High Dam.jpg",
 "lakes|Deadly lakes":"Lake nyos co2 vent.jpg",
 "seas|The deep ocean":"Bathyscaphe Trieste with USS Lewis (DE-535) over the Marianas Trench, 23 January 1960 (NH 96797).jpg",
 "seas|If all the ice melted":"A view of Antarctica’s ice sheet and mountains.jpeg",
 "islands|An island in a lake on an island":"Samosir island.jpg",
 "climate|Why we have seasons":"Tropic of Capricorn (Namibia).jpg",
 "climate|Africa, folded at the Equator":"Acacia tree on a sunrise safari at the Serengeti National Park, Tanzania.jpg",
 "climate|Five Mediterraneans":"Vineyards of Stellenbosch.jpg",
 "climate|More CO₂, a warmer world":"Shuozhou coal power plant.JPG"};
const PIN={"Johannesburg and Pretoria":"Johannesburg-city-skyline-night.jpg"};

function findIdx(f){try{if(typeof gfMergeExtra==="function")gfMergeExtra();return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined")return;for(const k in CARD){const i=findIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};for(const l in PIN){const i=findIdx(PIN[l]);if(i>=0)PS_SQ_IMG[l]=i}}catch(e){console.error(e)}}

function patch(){
/* ───────── Earth from space ───────── */
if(T("space")&&!T("space")._polA){T("space")._polA=1;
 set("space","The Earth from space",s=>{s.phPins=[ph([116.57,40.43],"Great Wall"),ph([8,30.5],"Grand Erg Oriental: sand sea"),ph([88.6,33.2],"Tibetan Plateau"),
  ph([23.6,-18.6],"Okavango Delta"),ph([-67.55,-20.15],"Salar de Uyuni"),ph([-49.8,69.2],"Jakobshavn Glacier: one of the fastest on Earth")]});
 set("space","The roof of the world",s=>{s.xsec={title:"From the Ganges plain over Everest to Tibet",pts:[[85.1,25.6,"Patna"],[86.0,27.0],[86.93,27.99,"Everest"],[87.6,29.3],[88.6,31.0,"Tibet"],[89.6,32.5]],mark:4500,
  note:"The dashed line marks 4,500 m, the plateau’s average height. The heights are smoothed: Everest’s real summit is 8,849 m."};
  s.body="Move along the chart: from the flat Ganges plain the land leaps up the Himalaya and then stays high. Behind the snowy peaks, the brown Tibetan Plateau averages over 4,500 m for more than 1,000 km."});
 set("space","Shallow seas, deep seas",s=>{s.gfSea=-15;s.gfSeaUI=true;
  s.body="The Bahamas sit on flat underwater platforms of white sand only a few metres deep, which sunlight lights up in pale blue. Lower the sea by just 15 m and most of the banks become dry land; beside them the floor drops to thousands of metres.";
  s.more="In the last ice age the sea was about 120 m lower and the banks really were dry land. They are made of limestone built up by sea creatures over millions of years; the deep channel called the Tongue of the Ocean, over 1,000 m deep, cuts into them."});
 /* two of the tour's questions pointed at a stop ("The Great Barrier Reef") that is no longer in the tour */
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.space;if(Q){(Q.mid||[]).forEach(q=>{if(q.at==="The Great Barrier Reef")q.at="Shallow seas, deep seas"});
  (Q.recap||[]).forEach((q,i)=>{if(q.st==="The Great Barrier Reef")Q.recap[i]={q:"Why do satellites use Bolivia’s Salar de Uyuni to check their instruments?",o:["It is the coldest place on Earth","It is huge, very flat and bright","It never has clouds","It is on the equator"],a:1,why:"Its height varies by less than a metre across 100 km.",st:"A white mirror in the Andes"}})}}catch(e){}
 ins("space","Weather patterns from space",{title:"The line between day and night",view:W,globe:[20,15,1],gfSun:{utc:15,day:80},
  stat:"At any moment, half the planet is in sunlight and half in night",
  body:"This satellite picture shows every place in daylight, but really the Sun lights only one side. The yellow line, the terminator, is where the Sun is rising or setting. Move the time and watch it sweep west.",
  more:"It moves about 1,670 km an hour at the equator, the speed the Earth turns. Change the date too: in June the whole Arctic stays lit all day, and in December it stays dark."});
}
/* ───────── Earth at night (the night map; photo pins are hidden on this tour by design) ───────── */
if(T("night")&&!T("night")._polA){T("night")._polA=1;
 ins("night","The Earth at night",{title:"Night moves round the planet",view:W,globe:[20,30,1],gfSun:{utc:20,day:300},spin:0,
  stat:"This picture is made of many nights. In reality only half the world is dark at once",
  body:"The shaded half is where it is night at the time shown. Move the clock: as night sweeps west, the lights of each continent come on in turn.",
  more:"At 20:00 in London, Europe and Africa are lighting up, Asia is deep in the night and the Americas are still in daylight."});
 set("night","An island continent lit at the edges",s=>{s.gfRuler={a:[115.86,-31.95],b:[138.6,-34.93]};
  s.body="Australia’s lights form a broken ring around a dark middle, the Outback. The ruler measures from Perth to Adelaide, the next city of over a million: about 2,100 km."});
 const t=T("night");if(!t.steps.some(s=>s.title==="Now explore"))t.steps.push({title:"Now explore",view:W,globe:[20,30,1],spin:0,
  stat:"Zoom in anywhere: every light is people, roads or industry",body:"Compare neighbours across a border, follow the lit lines of rivers, roads and railways, and look for the dark gaps where few people live."});
}
/* ───────── Rivers ───────── */
if(T("rivers")&&!T("rivers")._polA){T("rivers")._polA=1;
 set("rivers","Rivers of the world",s=>{s.phPins=[ph([-50,-0.3],"Mouth: about a fifth of all river water reaching the sea​"),ph([-59.9,-3.13],"Meeting of the Waters"),
  ph([111,30.82],"Three Gorges Dam"),ph([-112.1,36.1],"Grand Canyon"),ph([16.37,48.21],"Vienna"),ph([126,72.5],"Lena delta")]});
 ins("rivers","The longest river?",{title:"Downhill to the sea",view:[18,-5,46,33],globe:[32,12,1.8],riv:["Nile",["White Nile","#6fb3ea"]],
  xsec:{title:"The Nile from Lake Victoria to the sea",pts:[[33.2,0.45,"Lake Victoria"],[32.3,2.3],[31.6,4.85],[30.7,7.6],[31.65,9.53],[32.5,12.3],[32.53,15.6,"Khartoum"],[33.98,17.7],[33.98,18.0],[33.32,19.53],[31.85,18.55],[30.48,19.17],[30.4,19.6],[31.35,21.8],[31.6,22.35],[32.9,24.09,"Aswan"],[32.64,25.69],[32.73,26.16],[31.18,27.18],[30.75,28.1],[31.1,29.07],[31.24,30.04,"Cairo"],[31.0,31.4]],mark:380,
   note:"The dashed line marks 380 m, the river’s height at Khartoum. Heights are smoothed, and the line follows the river only roughly."},
  pins:[[[32.4,18.5],"The six cataracts: rocky rapids","point"]],
  stat:"The Nile starts 1,134 m up, but north of Khartoum it falls less than 400 m in about 3,000 km",
  body:"Move along the chart. The river drops fast from Lake Victoria through the rapids of Uganda and South Sudan, then crawls across the desert. Its last big steps are six rocky rapids called cataracts.",
  more:"The cataracts blocked boats for thousands of years, so the First Cataract at Aswan was Egypt’s traditional southern border. Lake Nasser, behind the Aswan High Dam, now drowns the first two."});
 set("rivers","Running from the sea",s=>{s.gfRuler={a:[-10.7,9.1],b:[-12.95,8.55]};s.lines=(s.lines||[]).filter(l=>!(l.coords&&l.coords.length===2&&l.coords[0][0]===-10.7));
  s.pins=[[[6.1,4.4],"Mouth, over 4,000 km later","point"]];
  s.stat="The Niger starts only about 250 km from the Atlantic, then flows over 4,000 km to reach it";
  s.body="The ruler measures from its source in the hills of Guinea to the nearest coast. Instead of going that way, the river heads inland towards the Sahara, then curves back south and reaches the ocean in Nigeria."});
}
/* ───────── Lakes ───────── */
if(T("lakes")&&!T("lakes")._polA){T("lakes")._polA=1;
 set("lakes","Lakes of the world",s=>{s.phPins=[ph([-84.7,45.8],"Straits of Mackinac: Michigan and Huron meet"),ph([108.1,53.4],"1,642 m deep​"),ph([34.6,-12],"Lake Malawi: 700+ kinds of fish"),
  ph([-69.4,-15.8],"Lake Titicaca, 3,812 m up"),ph([28.3,61.6],"Saimaa, Finland’s largest lake"),ph([14.6,13.8],"Lake Chad: shore in 1963")]});
 set("lakes","The biggest lake is called a sea",s=>{s.ghosts=[{code:"de",at:[56.5,46.5],col:"#8a63cf",label:"Germany, true size"}];
  s.body="At about 371,000 km², it is bigger than Germany: drag Germany over it to compare. It has no outlet to the ocean, so by most definitions it is a lake, not a sea."});
 set("lakes","The highest lake you can sail",s=>{s.xsec={title:"From the Pacific up to Lake Titicaca",pts:[[-71.34,-17.64,"Ilo"],[-70.6,-16.9],[-70.02,-15.84,"Puno"],[-69.4,-15.9,"Titicaca"],[-68.6,-16.2],[-68.15,-16.5,"La Paz"]],mark:3812,
  note:"The dashed line is the lake’s surface, 3,812 m up. Heights are smoothed."};
  s.body="Move along the chart: from the Pacific coast the land climbs almost 4 km to the Altiplano, a high plain between two ranges of the Andes, where the lake lies. Peru and Bolivia share it."});
 set("lakes","Lakes in a crack",s=>{s.xsec={title:"Across the rift at Lake Tanganyika",pts:[[27.0,-5.9,"Congo basin"],[28.6,-5.9],[29.6,-6.0,"Lake Tanganyika"],[30.5,-6.0],[32.8,-5.0,"Tabora"]],mark:773,
  note:"The dashed line is the lake’s surface, 773 m up. Its floor, about 1,470 m deeper, is not shown: the chart stops at sea level."};
  s.body="It fills a crack in Africa’s crust, the Great Rift Valley, where the continent is slowly pulling apart. Move along the chart to cross the rift: the land drops between steep walls into the lake."});
 set("lakes","Deadly lakes",s=>{s.view=[1,-1,19,13];s.globe=[10.3,6.44,4];s.lk=[];s.pins=[[[10.3,6.44],"Lake Nyos","point"]];s.hi=["cm"];dropPh(s,["Lake Nyos, 1986"]);});
}
/* ───────── Seas ───────── */
if(T("seas")&&!T("seas")._polA){T("seas")._polA=1;
 set("seas","Seas & oceans",s=>{s.phPins=[ph([142.2,11.35],"Challenger Deep ~10,900 m"),ph([-70.9,-53.2],"Strait of Magellan"),ph([146.5,-18],"Great Barrier Reef"),
  ph([32.35,30.5],"Suez Canal"),ph([-64.78,32.3],"Bermuda"),ph([-155.5,19.6],"Hawaii")]});
 set("seas","The busiest gateways",s=>{s.on=["connections"];s.body="Ships carrying oil and goods between Asia, Europe and the Americas must pass through a handful of chokepoints; the shipping lanes on the map squeeze through them. Blocking just one can shake the world economy."});
 set("seas","Point Nemo",s=>{s.gfRuler={a:[-123.39,-48.88],b:[-124.79,-24.67]};s.lines=(s.lines||[]).filter(l=>!(l.coords&&l.coords[1]&&l.coords[1][0]===-124.79));
  s.body="It is the spot in the ocean farthest from any land: the ruler measures about 2,700 km to Ducie Island, the nearest. The Space Station passes only about 400 km overhead."});
}
/* ───────── Islands ───────── */
if(T("islands")&&!T("islands")._polA){T("islands")._polA=1;
 set("islands","Islands",s=>{s.phPins=[ph([-155.5,19.6],"Hawaii: volcanic"),ph([73.4,3.4],"Maldives: coral atolls"),ph([110,-7.3],"Java: ~150 million"),
  ph([-91.35,0.05],"Penguins at the equator"),ph([-12.31,-37.07],"Tristan da Cunha"),ph([114.9,4.9],"Brunei, in two pieces")]});
 set("islands","The biggest islands",s=>{s.ghosts=[{code:"gl",at:[134,-25],col:"#8a63cf",label:"Greenland, true size"}];delete s.drag;
  s.body="Australia is bigger still, but it counts as a continent: drag Greenland onto it and see that Australia is over three times larger. After Greenland come New Guinea, Borneo, Madagascar and Baffin Island."});
 set("islands","Three kinds of islands",s=>{s.gfSea=-120;s.gfSeaUI=true;s.view=W;
  s.body="Continental islands, such as Great Britain and Sri Lanka, are pieces of a continent cut off by the sea. The map shows the sea 120 m lower, as in the last ice age: they join their continent again, while volcanic Hawaii and the coral Maldives stay islands. Slide the sea back to today to compare."});
 set("islands","An island in a lake on an island",s=>dropPh(s,["Samosir in Lake Toba"]));
 set("islands","The loneliest island town",s=>{s.gfRuler={a:[-12.31,-37.07],b:[-5.72,-15.95]};s.lines=(s.lines||[]).filter(l=>!(l.coords&&l.coords[0][0]===-12.31));
  s.body="It is the most remote inhabited island on Earth: the ruler measures about 2,400 km to St Helena, the nearest other town. There is no airport; a ship from South Africa takes about a week."});
 set("islands","Island born in 1963",s=>dropPh(s,["Iceland: Skógafoss"]));
 set("islands","The alien-looking island",s=>dropPh(s,["Yemen: Shibam"]));
 set("islands","One island, three countries",s=>dropPh(s,["Indonesia: Borobudur"]));
 set("islands","An island of 1,000 languages",s=>dropPh(s,["Indonesia: Borobudur"]));
}
/* ───────── Climate ───────── */
if(T("climate")&&!T("climate")._polA){T("climate")._polA=1;
 set("climate","The world’s climates",s=>{s.phPins=[ph([91.58,25.3],"Mawsynram ~11,800 mm a year"),ph([-116.87,36.46],"Death Valley 56.7 °C, 1913"),ph([143.15,63.46],"Oymyakon −67.7 °C"),
  ph([37.36,-3.07],"Kilimanjaro"),ph([167.9,-44.6],"Milford Sound, New Zealand"),ph([-0.13,51.51],"London 51.5°N")]});
 /* geoflock-mapsx.js later adds layers to climate stops 7 and 12 by index (only where a stop has none): pin them to the
    stops they were meant for before the new stop shifts the indexes, and keep the shifted stops layer-free */
 set("climate","Same line, different worlds",s=>{if(!s.on)s.on=["grid"]});set("climate","London is mild for its latitude",s=>{if(!s.on)s.on=["currents"]});
 set("climate","Five Mediterraneans",s=>{if(!s.on)s.on=[]});set("climate","The driest place, and the Andes’ trick",s=>{if(!s.on)s.on=[]});
 ins("climate","The world’s climates",{title:"Why we have seasons",view:W,globe:[20,20,1],gfSun:{utc:12,day:172},
  lines:[{coords:[[-179.9,23.44],[179.9,23.44]],kind:"dash",parallel:true},{coords:[[-179.9,-23.44],[179.9,-23.44]],kind:"dash",parallel:true}],
  stat:"The Earth is tilted, so for half the year the north leans towards the Sun",
  body:"In June the Sun stands overhead on the Tropic of Cancer (top dashed line): it is summer in the north, with long days, and winter in the south. Move the date to December and it swaps.",
  more:"The axis is tilted about 23.4°. Near the poles this means months of daylight in summer and months of night in winter; at the equator days stay about 12 hours long all year, so there is no real summer or winter."});
}
}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
