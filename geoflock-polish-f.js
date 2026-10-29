/* GeoFlock: polish for the older tours on Geography (geo), Population (pop), Map projections (projections), Time zones (time),
   Elevation (elev), Plate tectonics (plates), Natural hazards (hazards) and Inventions (inventions). Adds interactive gadgets
   (cross-sections, rulers, true-size ghosts, day and night, population thresholds, map layers, history-map stops), card photos
   for stops that had none, photo pins on the opening stops, moves photo pins that sat in the middle of a country onto the
   place they show (or drops them when they had nothing to do with the stop), and adds questions for the projections tour.
   It only patches PS_TOURS at load (like geoflock-polish-b.js); load it after the tour files. Every patch is keyed by stop
   title, so a stop that has been renamed or removed is simply skipped. Some tours rebuild their steps array late, so the
   "patched" flag sits on the steps array, not on the tour. All photos come from the shared library. */
(function(){
const OPEN={geo:"The world’s best surprises",pop:"Where people actually live",projections:"The map in your head is wrong",time:"Time zones",
 elev:"Ups and downs",plates:"Plate tectonics",hazards:"Natural hazards",inventions:"Where ideas were born"};
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&t.steps&&t.steps[0]&&t.steps[0].title===OPEN[id]?t:null}catch(e){return null}};
const st=(id,title)=>{const t=T(id);return t?t.steps.find(s=>s.title===title):null};
/* some stops lock fields with getters (psLock in index.html); writes go through defineProperty so they replace those */
const def=(t,k,v)=>Object.defineProperty(t,k,{configurable:true,enumerable:true,writable:true,value:v});
/* a stop given its own view keeps it: _ff stops psFrameFix re-fitting it to the highlighted countries at the first tour start */
/* a new view is locked like psLock does (getter, writes ignored): some views are re-assigned when a tour starts */
const lockv=(t,k,v)=>Object.defineProperty(t,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const set=(id,title,f)=>{const s=st(id,title);if(s)try{def(s,"_enr",1);f(new Proxy(s,{set(t,k,v){if(k==="view"){lockv(t,k,v);def(t,"_ff",1)}else def(t,k,v);return true},deleteProperty(t,k){try{delete t[k]}catch(e){}return true}}))}catch(e){console.error(e)}};
/* photo pins carry their library file; photos() turns it into the photo's index */
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
/* keep only the photo pins whose label passes the test (drops pins placed in the middle of a country by the enricher) */
const keepPh=(s,re)=>{s.phPins=(s.phPins||[]).filter(q=>!re.test(q.label))};
/* a stop that uses its own map mode: let the shared per-stop switch (stopModes) handle it */
const allowMode=(id,mode)=>{const t=T(id);if(!t)return;t.stopModes=true;t.alsoOn=t.alsoOn||[];if(!t.alsoOn.includes(mode))t.alsoOn.push(mode);if(t.map&&t.map.mode&&!t.alsoOn.includes(t.map.mode))t.alsoOn.push(t.map.mode)};
const once=id=>{const t=T(id);if(!t||t.steps._polF)return false;t.steps._polF=1;return true};

/* card photos ("tour|title" → library file name) */
const CARD={
 "pop|Half of humanity in one circle":"Terrace field yunnan china denoised.jpg",
 "pop|The most populous countries":"Crowd in shopping before Eid-ul-Fitr 02.jpg",
 "pop|The United States: the 100th meridian":"Sunset-over-the-wheat-field-featured.jpg",
 "pop|Europe’s Blue Banana":"Shipping container stacks - Port of Rotterdam - 2017 - 6.jpg",
 "pop|Now explore":"Mumbai Skyline with Bandra–Worli Sea Link 25 July 2018 (1).jpg",
 "time|Time zones":"Tourists taking pictures at Prime Meridian monument, Greenwich Observatory, London.jpg",
 "time|Why time zones":"Feet on prime meridian greenwich observatory.jpg",
 "time|Russia: eleven clocks":"The iron bridge on stone pillars. Ural. Trans-Siberian Railroad.jpg",
 "time|Australia: three zones, five in summer":"Sydney Opera House and Harbour Bridge Dusk (3) 2019-06-21.jpg",
 "time|Arizona’s clock doughnut":"West Mitten Butte in Monument Valley.jpg",
 "time|Now explore":"Times Square at Night with crowds of people.jpg",
 "elev|Low and high, neighbours":"Badwater Basin Death Valley December 2013 004.jpg",
 "elev|Africa is a raised plateau":"Amphitheatre Drakensberg.jpg",
 "plates|The continents fit together":"Vertebraria sp. (fossil plant root) (Permian; Antarctica) (49063648122).jpg",
 "plates|Australia is on the move":"Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru -- 2019 -- 3688.jpg",
 "hazards|Now explore":"Anak Krakatau (Anak Krakatoa), Indonesia - 12 May 2023 (52891922902).jpg",
 "inventions|Now explore":"Lego bricks.jpg",
 "projections|The map in your head is wrong":"Loring's Terrestrial Globe containing all the Late Discoveries and Geographical Improvements, also the Tracks of the most (IA dr lorings-terrestrial-globe-containing-all-the-late-discoveries-and-geograph-00084055).jpg",
 "projections|Greenland vs Africa":"024 Aerial view of Jakobshavn Glacier at Disko Bay (Greenland) Photo by Giles Laurent.jpg",
 "projections|Russia’s real size":"Catedral de San Basilio, Moscú, Rusia, 2016-10-03, DD 05-06 HDR.jpg",
 "projections|Alaska vs Brazil":"Holgate Glacier, Kenai Fjords NP, Alaska.jpg",
 "projections|Antarctica is not a strip":"A view of Antarctica’s ice sheet and mountains.jpeg",
 "projections|Why sailors loved Mercator":"Mercator 1569.png",
 "projections|The UN’s map":"United Nations General Assembly Hall (3).jpg"};
/* new photo (Wikimedia Commons), added to the shared library */
window.GF_POLF_PHOTOS=[{f:"Mercator 1569.png",d:"photos/x1fc6669ee4999b65.webp",by:"Gerardus Mercator",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Mercator_1569.png"}];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p.f));GF_POLF_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_POLF_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}

function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 {const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_POLF_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}
 for(const k in CARD){const i=libIdx(CARD[k]);if(i>=0)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const id in OPEN){const t=T(id);if(!t)continue;t.steps.forEach(s=>(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f||q.img!=null)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}}))}}catch(e){console.error(e)}}

function patch(){
/* ───────── Population ───────── */
if(once("pop")){
 set("pop","Where people actually live",s=>{s.phPins=[ph([139.7,35.69],"Tokyo: the biggest rich-world city","Shibuya Crossing, Tokyo; December 2017.jpg"),
  ph([90.4,23.8],"Dhaka: one of the most crowded cities","Crowd in shopping before Eid-ul-Fitr 02.jpg"),ph([3.4,6.45],"Lagos: Africa’s biggest city","2010 traffic Lagos Nigeria 4576800053.jpg"),
  ph([31.24,30.04],"Cairo: Egypt lives on the Nile","Cairo skyline, Nile River, Egypt.jpg"),ph([104,43.5],"The Gobi: almost empty","Camels in Gobi Desert 02.jpg"),
  ph([-73.99,40.76],"New York","Times Square at Night with crowds of people.jpg"),ph([-41,72.5],"Greenland: hardly anyone","Early Melt on the Greenland Ice Sheet (33354485670).jpg")]});
 set("pop","The world lives in the north",s=>{
  s.body="87% of people live north of the equator. Most land is in the north, and much of the south is desert, rainforest or ice. Drag the slider to hide every place with fewer people than you pick: what is left is mostly in the north."});
 set("pop","Half of humanity in one circle",s=>{delete s.gfThr});
 set("pop","China’s Hu line",s=>{s.view=[26,13,138,56];s.globe=[105,35,1.8];delete s.spin});
 set("pop","The Ganges plain and Bangladesh",s=>{s.phPins=[ph([78.04,27.17],"Agra, on the plain: the Taj Mahal","Taj Mahal, Agra, India edit2.jpg"),ph([90.4,23.75],"Dhaka","Crowd in shopping before Eid-ul-Fitr 02.jpg")]});
 set("pop","Java",s=>{s.view=[78,-13.5,142,9];delete s.spin});
 set("pop","The United States: the 100th meridian",s=>{delete s.gfThr;s.view=[-160,17,-63,55];
  s.phPins=[ph([-112.1,36.1],"Grand Canyon: the dry West","Grand Canyon Hopi Point with rainbow 2013.jpg")]});
 set("pop","Canada hugs the border",s=>{s.view=[-180,36,-48,72];delete s.spin;s.phPins=[ph([-116.18,51.32],"Moraine Lake, Banff: the empty Rockies","Moraine Lake-Banff NP.JPG")]});
 set("pop","Egypt is the Nile",s=>{s.view=[13,19.5,40,33.5];s.gfThr={kind:"pop",v:25};s.phPins=[ph([31.13,29.98],"Giza, on the Nile","All Gizah Pyramids.jpg")];
  s.body="That is over 100 million people on land a little bigger than Switzerland. The slider hides every place with fewer than 25 people per km²: only the river and its delta are left. Drag it back to off to see the empty desert."});
 set("pop","Africa’s two crowded corners",s=>{s.view=[-54,-14,52,21];s.globe=[15,4,1.6]});
 set("pop","Europe’s Blue Banana",s=>{s.view=[-22,40.5,18,57.5];s.globe=[5,49,4]});
 set("pop","Russia lives west of the Urals",s=>{s.view=[-42,36,138,80];s.globe=[60,58,1.3];s.phPins=[ph([37.62,55.75],"Moscow: Russia’s biggest city","Catedral de San Basilio, Moscú, Rusia, 2016-10-03, DD 05-06 HDR.jpg")]});
 set("pop","Mongolia: the emptiest country",s=>{delete s.gfThr;
  s.ghosts=[{code:"bd",at:[103.5,46.6],col:"#d9480f",label:"Bangladesh, true size"}];
  s.phPins=(s.phPins||[]).filter(q=>/Ulaanbaatar/.test(q.label)).concat([ph([104,43.6],"The Gobi Desert","Camels in Gobi Desert 02.jpg")]);
  s.body="Bigger than France, Germany, Italy and the UK combined, with fewer people than Berlin. The orange shape is Bangladesh at its true size: Mongolia could hold it ten times over, yet Bangladesh has about 50 times as many people. Drag it around."});
 set("pop","Australia keeps to the coast",s=>{s.gfThr={kind:"pop",v:10};s.view=[80,-46,158,-8];delete s.spin;s.phPins=[ph([151.21,-33.86],"Sydney","Sydney Opera House - Dec 2008.jpg"),ph([131.04,-25.34],"Uluru: the empty interior","Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru -- 2019 -- 3688.jpg")];
  s.body="The interior is almost the size of the lower 48 US states, with fewer people than Singapore. The slider hides every place with fewer than 10 people per km²: all that is left is a thin rim of coast."});
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ.pop;if(Q)[].concat(Q.mid||[],Q.recap||[]).forEach(q=>{if(q.st==="Egypt is the Nile"){q.q="Where do about 95% of Egyptians live?";q.why="About 95% of Egyptians live in the Nile valley and delta, on about 5% of the land."}})}catch(e){}
}
/* ───────── Time zones ───────── */
if(once("time")){
 set("time","Time zones",s=>{s.phPins=[ph([-0.0015,51.4778],"Greenwich: where the day is counted from","Feet on prime meridian greenwich observatory.jpg"),
  ph([-171.76,-13.83],"Samoa: skipped a day in 2011","View of Apia, Samoa, with rainbow - August 2016.jpg"),ph([116.4,39.9],"China: one clock for all","Great Wall of China July 2006.JPG"),
  ph([85.32,27.71],"Nepal: 5 h 45 min ahead of London","Boudhanath stupa, Kathmandu 01.jpg"),ph([-110.1,36.98],"Arizona: no summer time","West Mitten Butte in Monument Valley.jpg")]});
 set("time","Why time zones",s=>{keepPh(s,/^United Kingdom:/)});
 set("time","Russia: eleven clocks",s=>{s.view=[-75,20,182,82];s.globe=[90,58,1.2];delete s.spin;s.gfSun={utc:7,day:80,city:["Kaliningrad",2]};
  s.body="When it is 9 a.m. in Kaliningrad on the Baltic Sea, it is already 7 p.m. in Kamchatka on the Pacific: the map shows that moment, with the Sun already setting in the far east. Until 2018 Russia’s trains all ran on Moscow time, so a ticket bought in Vladivostok showed a time seven hours off."});
 set("time","The United States: six zones",s=>{s.view=[-162,14,-60,58];delete s.spin;s.gfSun={utc:16,day:172,city:["New York",-4]};
  s.body="At noon in New York it is 9 a.m. in Los Angeles and 6 a.m. in Honolulu (7 a.m. in winter, because Hawaii never changes its clocks). The map shows noon in New York in June: move the time and watch the day sweep west."});
 set("time","Australia: three zones, five in summer",s=>{s.view=[80,-46,158,-8];delete s.spin});
 set("time","One clock for China",s=>{s.view=[28,11,137,56];delete s.spin;keepPh(s,/^China: Great Wall/)});
 set("time","Half and quarter hours",s=>{s.phPins=(s.phPins||[]).filter(q=>/Gauri/.test(q.label)).concat([ph([85.36,27.72],"Kathmandu","Boudhanath stupa, Kathmandu 01.jpg")])});
 set("time","Spain’s clock is off",s=>{s.view=[-37,33,26,60];s.gfSun={utc:11,day:80,city:["Madrid",1]};s.phPins=[ph([2.17,41.4],"Barcelona","Simetría na Sagrada Familia. Barcelona B30.jpg"),ph([-0.12,51.5],"London","Big Ben at sunset - 2014-10-27 17-30.jpg"),ph([-9.14,38.71],"Lisbon: on London time","Lisbon 2015 10 14 0786 (23302459530).jpg")];
  s.body="In 1940, Spain moved its clocks forward to match Germany, and never moved them back. The map shows noon on Spain’s clocks: the Sun is still well to the east, over Italy."});
 set("time","Arizona’s clock doughnut",s=>{s.phPins=(s.phPins||[]).filter(q=>!/^Hopi/.test(q.label)).concat([ph([-110.1,36.98],"Monument Valley, Navajo Nation","West Mitten Butte in Monument Valley.jpg")])});
 set("time","Canada, south of Detroit",s=>{keepPh(s,/^(United States|Canada):/)});
 set("time","Daylight saving time",s=>{s.gfSun={utc:20,day:172,city:["London",1]};
  s.body="Clocks go forward an hour in spring and back in autumn, to give more evening daylight in summer. The map shows 9 p.m. in London in June: the Sun has not set yet. Near the equator, where days barely change length, almost nobody bothers."});
}
/* ───────── Hazards ───────── */
if(once("hazards")){
 set("hazards","Natural hazards",s=>{s.phPins=[ph([-97.49,35.34],"Oklahoma: tornadoes","May 20, 2013 Moore, Oklahoma tornado.JPG"),ph([-72,29],"Atlantic hurricanes","Staring Down Hurricane Florence.jpg"),
  ph([90.6,22.5],"Bangladesh: cyclone shelters","Cyclone Shelter Project (15078949337).jpg"),ph([105.42,-6.1],"Krakatoa","Anak Krakatau (Anak Krakatoa), Indonesia - 12 May 2023 (52891922902).jpg"),
  ph([-77.6,-9.12],"Huascarán, Peru","Huascaran norte.JPG"),ph([40,8],"Locust swarms","Desert Locust swarm.jpg"),ph([14.43,40.82],"Vesuvius","The harbor of Naples and Vesuvius at dawn. Italy.jpg")]});
 set("hazards","The 2004 tsunami",s=>{keepPh(s,/^Indonesia:/);s.view=[4,-22,110,26];s.globe=[75,3,1.3];delete s.spin});
 set("hazards","Tornado Alley",s=>{s.view=[-136,20,-62,54];
  s.xsec={title:"From the Gulf of Mexico across the Great Plains",pts:[[-95.4,29.76,"Houston"],[-96.8,32.8,"Dallas"],[-97.52,35.47,"Oklahoma City"],[-97.6,37.69,"Wichita"],[-98.2,41],[-98.5,44.4],[-98.9,47.5],[-97.14,49.9,"Winnipeg"]],
   note:"About 2,300 km from the Gulf coast to Canada, and the land never rises much above 600 m: nothing stops warm, wet Gulf air meeting cold Canadian air."};
  s.body="Warm, wet air from the Gulf of Mexico meets cold, dry air from Canada and the Rockies over the Great Plains, with no mountains in between to stop them: move along the chart. That makes giant thunderstorms that spin."});
 set("hazards","The silent killer",s=>{s.view=[-62,20,76,62];s.globe=[20,42,1.3]});
 set("hazards","Fire seasons",s=>{keepPh(s,/^Australia:/);s.view=[-178,22,-44,72];s.globe=[-95,52,1.6];s.hi=["ca"];s.card="left";delete s.cardLeft});
 set("hazards","The Sahel droughts",s=>{keepPh(s,/^(Senegal|Mauritania):/);s.view=[-60,-6,46,32];s.globe=[10,14,1.5]});
 set("hazards","Plagues of locusts",s=>{s.view=[-140,-16,58,46];s.globe=[-10,12,1];keepPh(s,/^Kenya:/);s.gfRuler={a:[-17.45,14.7],b:[-61.0,13.9]};
  s.more="In 2019–21, swarms in East Africa were the worst Kenya had seen in 70 years. In 1988 swarms flew across the Atlantic from West Africa to the Caribbean, about 4,700 km (drag the ruler), in roughly ten days."});
 set("hazards","When mountains fall",s=>{s.view=[-84.5,-12.6,-72.5,-5.6];s.globe=[-77.6,-9.1,6];s.hi=["pe"];delete s.spin;
  s.xsec={title:"From the Pacific over Huascarán",pts:[[-78.59,-9.07,"Chimbote (coast)"],[-78.3,-9.1],[-78.0,-9.12,"Cordillera Negra"],[-77.75,-9.14,"Yungay"],[-77.6,-9.12,"Huascarán"],[-77.35,-9.0],[-77.05,-8.85,"Marañón valley"]],mark:2500,
   note:"The dashed line marks 2,500 m, about the height of Yungay. The chart smooths the sharpest peaks: Huascarán really rises to 6,768 m, over 4 km above the town."};
  s.body="An earthquake shook loose part of Huascarán, Peru’s highest mountain. The avalanche raced down the valley and buried the town of Yungay, killing about 20,000 people: move along the chart to see how steeply the peak rises above the valley."});
}
/* ───────── Inventions ───────── */
if(once("inventions")){allowMode("inventions","history");
 set("inventions","Where ideas were born",s=>{s.phPins=[ph([14.5,45.95],"The oldest wooden wheel","Ljubljana Marshes Wheel with axle (oldest wooden wheel yet discovered).jpg"),
  ph([45.64,31.32],"Uruk: early writing","Proto cuneiform tablet OIM A12259.jpg"),ph([114.35,36.1],"Anyang: oracle bones","Shang Ox Bone Oracle Bone 03.jpg"),
  ph([-2.08,52.51],"The steam engine","Newcomen atmospheric engine (Heat Engines, 1913).jpg"),ph([-75.19,39.95],"ENIAC, Philadelphia","ENIAC-changing a tube.jpg"),
  ph([-118.44,34.07],"The internet’s first message","The IMP Log The Very First Message Sent on the Internet (6293913865).jpg"),ph([9.11,55.73],"Lego, Billund","Lego bricks.jpg")]});
 set("inventions","The wheel",s=>{s.view=[-12,22,52,58];s.globe=[25,45,1.6]});
 set("inventions","Writing, three times over",s=>{s.phPins=(s.phPins||[]).filter(q=>/^Uruk/.test(q.label)).concat([ph([114.35,36.1],"Anyang: oracle bones","Shang Ox Bone Oracle Bone 03.jpg")])});
 set("inventions","Numbers from India",s=>{s.view=[-52,0,84,56];s.mode="history";s.sub="800/isl";keepPh(s,/^(India|Iraq):/);s.bannerNote="The Abbasid Caliphate, 800";
  s.body="Indian mathematicians used nine digits and a zero, where a digit’s position gives its value. Scholars in Baghdad took the system up around 800 AD (the map shows the Caliphate ruled from Baghdad then), and it reached Europe through North Africa, Spain and Italy."});
 set("inventions","China’s Four Great Inventions",s=>{s.view=[58,14,134,52];delete s.spin;s.mode="history";s.sub="1000/chn";s.hi=["kr"];s.G=[{t:"First book printed with metal type, 1377",c:"#1c7ed6",codes:["kr"]}];keepPh(s,/^(China|South Korea):/);s.bannerNote="Song China, 1000";
  s.body="Chinese children learn these four by name. The map shows the Song empire around 1000: under the Song, printing spread, gunpowder went to war and the compass first guided ships. Each spread west along trade routes, and Europe later used them to print books, fight wars and cross oceans."});
 set("inventions","The steam engine",s=>{s.view=[-27,48,9,60];keepPh(s,/^United Kingdom:/)});
 set("inventions","The first vaccine",s=>{s.view=[-40,-6,52,60];keepPh(s,/^United Kingdom:/)});
 set("inventions","Who called first?",s=>{s.view=[-140,24,1,62];s.card="left"});
 set("inventions","Let there be light",s=>{s.view=[-135,22,8,63]});
 set("inventions","Taking to the air",s=>{s.view=[-152,18,9,62];s.on=["connections"];
  s.more="Many Brazilians credit Alberto Santos-Dumont, who flew in Paris in 1906 in front of crowds and officials, without the launch rail the Wrights used. People had already flown in hot-air balloons, made by the Montgolfier brothers of Annonay, France, in 1783. The lines on the map are today’s busiest air routes, about 120 years after Kitty Hawk."});
 set("inventions","A lucky mould",s=>{s.view=[-157,20,5,62]});
 set("inventions","The first computers",s=>{s.view=[-143,22,17,64]});
 set("inventions","Burrs, bricks and pens",s=>{s.view=[-20,33,43,66];s.globe=[15,50,2];s.card="left"});
 set("inventions","The internet and the Web",s=>{s.view=[-168,18,-64,52];s.globe=[-110,37,2];s.gfRuler={a:[-118.44,34.07],b:[-122.18,37.46]};
  s.body="ARPANET linked a computer at UCLA, in Los Angeles, to one at Stanford Research Institute, about 500 km away: drag the ruler. Twenty years later, Tim Berners-Lee, a British scientist at CERN near Geneva, proposed the World Wide Web."});
}
/* ───────── Geography (weak stops only) ───────── */
if(once("geo")){
 set("geo","Point Nemo",s=>{s.gfRuler={a:[-123.39,-48.88],b:[-124.79,-24.67]};
  s.body="It is the spot in the ocean farthest from any land: drag the ruler, the nearest island, Ducie, is about 2,700 km away. The Space Station passes about 400 km overhead."});
 set("geo","South America is east of North America",s=>{s.gfRuler={a:[-80.2,25.8],b:[-80.2,-12]};
  s.body="Lima, on South America’s west coast, is further east than Miami. Drag the ruler due south from Miami: it misses almost the whole continent and only grazes the coast of Ecuador and Peru."});
}
/* ───────── Elevation (weak stops only) ───────── */
if(once("elev")){
 set("elev","Deeper than Everest is tall",s=>{
  s.xsec={title:"From Guam down into the Mariana Trench",below:true,pts:[[144.75,13.45,"Guam"],[144.1,12.85],[143.4,12.2],[142.6,11.65],[142.2,11.35,"Challenger Deep"],[141.9,10.9],[141.5,10.3,"Pacific floor"]],
   note:"The chart averages heights over about 11 km, so it rounds off the narrow bottom of the trench: the Challenger Deep itself is about 10,900 m down."};
  s.body="The Challenger Deep, the deepest point in the trench, is about 10,900 m down, while Everest is 8,849 m tall. Move along the chart from Guam down into the trench, the darkest blue curve in the western Pacific."});
 set("elev","The lowest land on Earth",s=>{
  s.xsec={title:"From the Mediterranean to the Dead Sea",below:true,pts:[[34.76,32.06,"Mediterranean coast"],[34.98,31.92],[35.21,31.77,"Jerusalem"],[35.5,31.6,"Dead Sea"],[35.66,31.66],[35.8,31.72,"Madaba, Jordan"]],
   note:"The rift valley is narrow, so the chart’s smoothed heights (about 11 km averages) don’t reach the bottom: the shore is really over 430 m below sea level."};
  s.body="It is the lowest dry land on Earth: move along the chart from the coast over the hills of Jerusalem and down into the rift. The lake has no outlet, so water leaves only by evaporating, which has made it nearly ten times saltier than the ocean."});
 set("elev","Low and high, neighbours",s=>{
  s.xsec={title:"From Mount Whitney to Badwater",below:true,pts:[[-118.29,36.58,"Whitney"],[-118.06,36.55],[-117.09,36.17,"Panamints"],[-116.83,36.23,"Badwater"],[-116.6,36.3]],
   note:"About 135 km from the highest point in the lower 48 states to the lowest in North America. The chart smooths the sharpest peaks and the deepest dip (heights averaged over about 11 km); Badwater itself lies 86 m below sea level."};
  s.body="Badwater Basin in Death Valley is 86 m below sea level. Mount Whitney, 4,421 m high, rises just a few mountain ranges to the west: move along the chart to cross them."});
 set("elev","Cities that climbed to keep cool",s=>{if((s.phPins||[]).some(q=>/^Quito/.test(q.label))){s.phPins=s.phPins.filter(q=>!/^Quito/.test(q.label));s.pins=(s.pins||[]).concat([[[-78.47,-0.18],"Quito ~2,850 m","point"]])}});
 set("elev","Africa is a raised plateau",s=>{s.view=[-40,-37,56,20];s.card="left"});
 set("elev","Old mountains are low mountains",s=>{keepPh(s,/^Australia:/)});
 set("elev","Africa is a raised plateau",s=>{
  s.more="The Drakensberg, in the photo, is the edge of the plateau in South Africa: a wall of cliffs over 1,000 m high. Drag the slider to show only land above a height you choose."});
}
/* ───────── Plate tectonics (weak stops only) ───────── */
if(once("plates")){
 set("plates","The Ring of Fire",s=>{s.on=["hazards"];
  s.body="The Pacific is edged almost all the way round by places where its plates dive under their neighbours. The sinking rock melts and feeds volcanoes, and the plates catch and slip in huge earthquakes: the map’s volcano and earthquake symbols trace the ring."});
 set("plates","Seashells on Everest",s=>{keepPh(s,/^India:/)});
 set("plates","The Atlantic is growing",s=>{s.view=[-110,20,5,70];s.globe=[-35,45,1.4];
  s.xsec={title:"Across the Atlantic, from the US to Portugal",below:true,pts:[[-75.5,35.25,"Cape Hatteras"],[-68,35],[-60,35],[-52,35.2],[-44,35.4],[-36.2,35.6,"The ridge"],[-30,36.4],[-24,37],[-16,37.5],[-9.3,38.7,"Lisbon"]],
   note:"The sea floor is about 5 km deep on either side and rises 2 to 3 km to the ridge in the middle, where the plates pull apart. The crest is still 2 to 3 km under water: only in Iceland and the Azores does the ridge reach the surface."};
  s.body="Down the middle of the Atlantic runs the Mid-Atlantic Ridge, where two plates pull apart about 2.5 cm a year: move along the chart to cross it. Iceland is one of the few places the ridge rises above the sea: its west is on the North American plate, its east on the Eurasian plate."});
 set("plates","The Andes",s=>{s.view=[-128,-52,-30,12];
  s.xsec={title:"From the Pacific floor over the Andes",below:true,pts:[[-75,-23,"Nazca plate"],[-72.6,-23.1],[-71.5,-23.2,"Trench"],[-70.4,-23.65,"Antofagasta"],[-69.2,-23.6],[-68.0,-23.5,"Andes"],[-66.5,-23.5,"Puna"],[-64.5,-23.4],[-62.2,-23.3,"Chaco lowlands"]],
   note:"In under 400 km the surface climbs from the bottom of the Atacama Trench, about 8 km down, to volcanoes over 6 km high: some of the steepest slopes on Earth. The chart smooths the deepest and highest points."};
  s.body="The Nazca plate under the Pacific slides beneath the South American plate: move along the chart from the trench up into the mountains. That squeezes up the Andes, about 7,000 km long, and melts rock that feeds a chain of volcanoes."});
 set("plates","The continents fit together",s=>{
  s.more="Alfred Wegener noticed the fit in 1912 and was mocked, because no one could explain how continents could move. He was only proven right in the 1960s, when the sea floor was mapped. Fossils of the same freshwater reptile, Mesosaurus, are found in Brazil and southern Africa, and roots of the same tree, Glossopteris, turn up in South America, Africa, India, Australia and Antarctica."});
 set("plates","Australia is on the move",s=>{keepPh(s,/^Australia:/)});
}
/* ───────── Map projections ───────── */
if(once("projections")){
 set("projections","Why sailors loved Mercator",s=>{s.body="Gerardus Mercator designed his map in 1569 for navigation (the photo shows the original). Draw a straight line on it, read its angle, hold that compass course, and you arrive."});
 set("projections","The UN’s map",s=>{s.more="The UN chose it in 1946 because, centred on the pole, no country sits in the middle; the emblem hangs above the podium in the General Assembly Hall, in the photo. Notice how close Russia, North America and Europe are across the Arctic."});
 try{if(typeof TOURQ!=="undefined"&&!TOURQ.projections)TOURQ.projections={mid:[
  {at:"Greenland vs Africa",st:"Greenland vs Africa",q:"About how many Greenlands would fit into Africa?",o:["About 2","About 5","About 14","About 50"],a:2,why:"Greenland is about 2.2 million km², Africa about 30 million. Mercator makes them look alike.",kc:"gl"},
  {at:"Alaska vs Brazil",st:"Alaska vs Brazil",q:"Alaska looks almost as big as Brazil on Mercator. How much bigger is Brazil really?",o:["About the same","About twice","About five times","About twenty times"],a:2,why:"Alaska is about 1.7 million km², Brazil about 8.5 million.",kc:"br"},
  {at:"The shortest way is curved",st:"The shortest way is curved",q:"Why do flights from New York to Tokyo fly near Alaska?",o:["To refuel there","The shortest route on a globe curves north","The Pacific is too stormy","Planes must follow the coast"],a:1,why:"The shortest route between two places on a ball is a great circle; on Mercator it looks curved.",kc:"jp"}],
 recap:[
  {q:"Which map keeps every country at its true size?",o:["Mercator","Gall–Peters","The one on Google Maps","None of them"],a:1,why:"Gall–Peters, like Equal Earth, is equal-area: sizes are right, though shapes are stretched.",st:"True sizes, odd shapes",kc:"cd"},
  {q:"Why did sailors love the Mercator map?",o:["It showed true sizes","A straight line on it is a constant compass bearing","It was the first to show America","It had no distortion"],a:1,why:"Mercator designed it in 1569 so that sailors could steer by ruler.",st:"Why sailors loved Mercator",kc:"be"},
  {q:"The UN emblem shows the world centred on which point?",o:["New York","The Equator","The North Pole","Geneva"],a:2,why:"Centred on the pole, no country sits in the middle.",st:"The UN’s map",kc:"us"}]}}catch(e){}
}
}
function run(){patch();photos()}
/* after the photo-pin enricher (DOMContentLoaded + 2.5 s), so it neither re-adds the pins dropped here nor misses the stops */
addEventListener("load",()=>setTimeout(run,3000));setTimeout(run,7000);setTimeout(run,12000);
})();
