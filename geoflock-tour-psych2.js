/* GeoFlock: the Psychology tour, rebuilt (it replaces the steps of PS_TOURS.psychology from geoflock-tours-ideas3.js,
   keeping the tour's id, colour, shelf and map). Mostly psychology, each stop tied to the land: four routes from geography
   to the mind, then two warnings about reading too much into them.
     Route 1  land → how people make a living → social habits → mind   (rice and wheat, herding and honour, germs)
     Route 4  land → who moves there (selective migration)            (Hokkaido, the American frontier)
     Route 2  land → body → mood                                      (winter light in Tromsø, heat in Phoenix, pace of life)
     Route 3  land → what the senses and words practise every day     (uphill/downhill, right angles, the sea, the city)
   Plain language: a technical term is always explained in everyday words in the same sentence.
   Stop titles here are new, so the older patches keyed by the old stop titles (polish K and L, the ideas3 photo maps) skip
   them. Card photos and photo pins are wired here: card photos through PS_PHOTO and psPhotoFor, photo pins with their own
   picture (_gfImg, which polish L's psSqPhoto hook shows) re-applied just before each stop draws.
   Load it after the tour files and every polish patch. New photos (Wikimedia Commons, free licences) are in GF_PSY2_PHOTOS. */
(function(){
if(typeof PS_TOURS==="undefined"||!PS_TOURS.psychology)return;
const ID="psychology",T=PS_TOURS[ID],W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,card:"left"},o);

/* new photos from Wikimedia Commons, added to the shared library */
window.GF_PSY2_PHOTOS=[
 {"f":"Downtown Phoenix Skyline (6974043971).jpg","d":"photos/xd6680596e15dc7cc.webp","by":"Alan Stark from Goodyear, AZ, United States","lic":"CC BY-SA 2.0","page":"https://commons.wikimedia.org/wiki/File:Downtown_Phoenix_Skyline_(6974043971).jpg"},
 {"f":"Músicos tradicionales de Tenejapa (Chiapas).jpg","d":"photos/xffa8bb1ff3b2e46b.webp","by":"Secretaría de Cultura de la Ciudad de México","lic":"CC BY 2.0","page":"https://commons.wikimedia.org/wiki/File:M%C3%BAsicos_tradicionales_de_Tenejapa_(Chiapas).jpg"},
 {"f":"015a Angolan giraffe silhouette at sunrise in the Kalahari Desert of Namibia Photo by Giles Laurent.jpg","d":"photos/x2df021dec1e6f438.webp","by":"Giles Laurent","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:015a_Angolan_giraffe_silhouette_at_sunrise_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg"},
 {"f":"Château de La Brède en Gironde.jpg","d":"photos/xaeabb31a28a3371d.webp","by":"Hervé Devred","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_La_Br%C3%A8de_en_Gironde.jpg"}
,
 {"f":"Texas Longhorn grazing (8426057223).jpg","d":"photos/x9f34b50f98456acd.webp","by":"U.S. Fish and Wildlife Service (John and Karen Hollingsworth)","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Texas_Longhorn_grazing_(8426057223).jpg"}];
const PHOTOS=window.GF_PSY2_PHOTOS;
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}
 else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}

/* ---------- the stops ---------- */
const STEPS=[
S({title:"From the land to the mind",view:W,globe:[20,30,1],card:undefined,
 stat:"Psychologists have found real differences in how people think around the world, and many of them trace back to the land",
 body:"This tour follows four routes from geography to the mind. One: the land decides how people make a living, which shapes daily habits and then thinking. Two: the land acts on the body (light, heat), and the body on mood. Three: the land decides what the senses and words practise every day. Four: the land decides who moves there in the first place.",
 more:"Everything here is about averages across large groups. People inside one region differ far more than regions differ from each other, so none of it tells you what any one person is like. Each stop ends with the strongest objection to the idea."}),

/* ----- route 1: making a living ----- */
S({title:"Rice south, wheat north",view:[96,18,132,44],globe:[113,32,2.6],hi:["cn"],on:["rivers"],
 lines:[{coords:[[103.5,33.6],[106,33.7],[108.9,33.9],[111,33.6],[113.5,33],[116,32.8],[118.5,33.2],[120.5,33.8]],kind:"dash"}],
 pins:[[[112,34.4],"Roughly where rice gives way to wheat","area"]],
 stat:"Rice is a team sport; wheat is a solo event",
 body:"Route 1, making a living. Rice paddies in southern China need shared canals and neighbours who swap days of work; wheat in the north is watered by rain and can be farmed alone. In 2014 Thomas Talhelm and colleagues (in the journal Science) found students from rice areas thought more ‘holistically’, meaning they saw things in terms of relationships rather than separate categories, and the gap held even between neighbouring counties on either side of the rice–wheat border.",
 more:"In 2018 the team watched people in cafés such as Starbucks. In Beijing (wheat) more people sat alone, and when the researchers blocked the aisle with chairs, people more often moved the chair; in Shanghai (rice) more people squeezed through instead. The pushback: a comparison between regions cannot be read as a rule about any one person (the ‘ecological fallacy’), and the crop comes bundled with differences in history, dialect and migration."}),
S({title:"A culture of honour",view:[-106,23,-66,46],globe:[-88,35,3],hi:["us"],
 lines:[{coords:[[-6.5,54.6],[-30,52],[-55,46],[-70,41],[-75.2,39.95],[-79,38],[-82,36.5]],kind:"flow"}],
 pins:[[[-83.74,42.28],"Ann Arbor: the insult experiment","point"],[[-75.2,39.95],"Philadelphia: many Ulster Scots landed here","point"]],
 stat:"Your reputation is your fence: where wealth walks on four legs, people learn to answer an insult",
 body:"Route 1, making a living. In 1996 Richard Nisbett and Dov Cohen had a man bump into students at the University of Michigan and mutter an insult. Men raised in the American South showed bigger rises in cortisol, a stress hormone, and testosterone than men from the North, and were readier to act tough afterwards.",
 more:"Their explanation: many Southern settlers came from the herding borderlands of Scotland and Ireland. A herd can be stolen in one night, and where the law is far away, a reputation for hitting back is the best protection. The pushback: herding and a lawless frontier came together in the South, so it is hard to tell which one did the work."}),
S({title:"Germs and the group",view:[-110,-40,160,45],globe:[20,5,1.2],on:["grid"],
 pins:[[[23,-1],"Congo basin: a heavy load of infectious disease","point"],[[16,62],"Scandinavia: a light load","point"]],
 stat:"Where infectious disease has been common, cultures tend to be more group-minded and more wary of outsiders",
 body:"Route 1, making a living. In 2008 Corey Fincher, Randy Thornhill and colleagues compared countries and found that more disease went with more collectivism, putting the family and group ahead of the individual. Their idea is a ‘behavioural immune system’: habits such as sticking with your own people and being careful with strangers may once have cut the risk of catching something new.",
 more:"This is the weakest stop on the tour. In 2013 Daniel Hruschka and Joseph Henrich found the link shrinks a lot once you allow for wealth and history. And neighbouring countries are not independent tests, because they share ancestors, languages and empires (anthropologists call this ‘Galton’s problem’)."}),

/* ----- route 4: who moves there ----- */
S({title:"Hokkaido’s frontier",view:[124,29,156,48],globe:[140,40,3],hi:["jp"],
 lines:[{coords:[[139.7,35.7],[140.5,38.5],[140.7,41.8],[141.35,43.06]],kind:"flow"}],
 pins:[[[139.69,35.69],"Tokyo","point"]],
 stat:"People in Hokkaido, Japan’s northern frontier, think more like Americans than other Japanese do",
 body:"Route 4, who moves there. Hokkaido was settled mostly in the late 1800s by Japanese families who chose to move north to an open, cold frontier. In 2006 Shinobu Kitayama and colleagues found people there were more independent than other Japanese and more likely to explain someone’s behaviour by their personality rather than their situation.",
 more:"Their ‘voluntary settlement’ theory says frontiers draw people who are already more independent, and then the hard, open life rewards independence, so the habit outlasts the frontier."}),
S({title:"The American frontier",view:[-126,24,-66,50],globe:[-100,40,2.2],hi:["us"],
 pins:[[[-104.82,41.14],"Wyoming: frontier until about 1890","point"],[[-72,42.3],"New England: settled long before","point"]],
 stat:"The frontier is a filter, then a school",
 body:"Route 4, who moves there. In 2020 economists Samuel Bazzi, Martin Fiszbein and Mesay Gebresilasse found that US counties which spent longer on the frontier, thinly settled and far from help, still differ a century later. Parents there give their babies rarer names, a sign of valuing standing out, and more people oppose taxes that move money from rich to poor.",
 more:"The pushback: did the frontier shape people (a school), or only attract those who were already individualists (a filter)? The authors think both, but the two are hard to pull apart."}),

/* ----- route 2: body and mood ----- */
S({title:"Winter in Tromsø",view:[-100,22,40,74],globe:[-30,52,1.6],on:["grid"],gfSun:{utc:11,day:355},
 pins:[[[-71.47,42.77],"Nashua, New Hampshire: 9.7%","point"],[[18.96,69.65],"Tromsø: sun below the horizon for about seven weeks","point"]],
 stat:"Winter depression was about seven times as common in New Hampshire as in Florida",
 body:"Route 2, body and mood. Seasonal affective disorder is a depression that comes with the dark months. In 1990 Leora Rosen and colleagues surveyed four US places and found it rose with latitude, from about 1.4% in Florida to 9.7% in New Hampshire. Yet in Arctic Norway, with far darker winters, studies have found less winter depression than latitude predicts.",
 more:"The American psychologist Kari Leibowitz, who spent a year in Tromsø, described a positive ‘wintertime mindset’: people there look forward to winter as a season of its own, with candles, skiing and the northern lights. The twist: geography acts on the body, but culture changes how strongly it lands."}),
S({title:"Heat and tempers",view:[-126,24,-66,50],globe:[-100,36,2.2],hi:["us"],
 stat:"In baseball, pitchers hit more batters as the temperature rises",
 body:"Route 2, body and mood. Phoenix is one of the hottest big cities in the US, with summer days above 40 °C. Psychologist Craig Anderson’s ‘heat hypothesis’ says hot, uncomfortable people get angry more easily, and violent crime does rise in hot weather. In 2011 Richard Larrick and colleagues studied over 57,000 Major League games and found pitchers hit more batters on hot days, especially after one of their own teammates had been hit.",
 more:"The pushback is ‘routine activities’: in hot weather more people are out, meeting each other and drinking, so there are simply more chances for trouble, whatever their temper."}),
S({title:"The pace of life",view:W,globe:[10,35,1],hi:["ch","ie","de","jp","it"],hiSoft:["mx","id","br"],
 pins:[[[7.45,46.95],"Switzerland: fastest","point"],[[-99.13,19.43],"Mexico: slowest","point"]],
 stat:"Of 31 countries, Switzerland had the fastest pace of life",
 body:"Route 2, body and mood. In 1999 Robert Levine and Ara Norenzayan timed people in 31 countries: how fast they walked down a street, how long a post office took to sell a stamp, and how accurate the bank clocks were. Switzerland came first, then Ireland, Germany, Japan and Italy (strong colour); Brazil, Indonesia and Mexico were slowest (pale). Colder and richer countries tended to be faster.",
 more:"The pushback: colder countries also tend to be richer, and wealth probably does most of the work. Busy economies make time valuable, and valuable time makes people hurry."}),

/* ----- route 3: what the senses and words practise ----- */
S({title:"Uphill and downhill",view:W,globe:[-160,0,1],
 pins:[[[145.11,-15.29],"Hope Vale: Guugu Yimithirr","point"]],
 stat:"In Tenejapa, a cup can be ‘uphill’ of a plate, even on a flat table",
 body:"Route 3, what words practise. Tzeltal Maya speakers in Tenejapa, in the mountains of Chiapas, Mexico, describe where things are with ‘uphill’ (roughly south) and ‘downhill’ (north), taken from the slope of their land. Guugu Yimithirr speakers in Queensland use north, south, east and west for everything. In memory tests by Stephen Levinson’s team, people who saw a row of objects, turned round and rebuilt it kept the compass order, where Dutch speakers kept left and right.",
 more:"This is ‘linguistic relativity’, the idea that the language you speak nudges how you think, here with the land as the first link. The pushback: in 2002 Peggy Li and Lila Gleitman found English speakers also switched to compass-style answers when the test room offered clear landmarks, so the setting may matter as much as the language."}),
S({title:"A world of right angles",view:W,globe:[-30,10,1],
 pins:[[[-87.69,42.05],"Evanston, Illinois: most fooled","point"]],
 stat:"Two equal lines, one with arrowheads and one with arrow tails: most people raised among square buildings see the second as longer",
 body:"Route 3, what the senses practise. That is the Müller-Lyer illusion (in the picture). In the 1960s Marshall Segall, Donald Campbell and Melville Herskovits tested it around the world: students in Evanston, Illinois, were fooled most, while San foragers in the Kalahari were hardly fooled at all. Their ‘carpentered world’ idea: eyes raised among straight walls and square corners learn to read the arrows as the corners of rooms.",
 more:"In 2010 Joseph Henrich and colleagues used this as a key example in their critique of psychology’s WEIRD samples: Western, Educated, Industrialised, Rich and Democratic people, who make up most test subjects but a small slice of humanity. The study is old, and other explanations, such as differences in eyesight, have been suggested."}),
S({title:"Blue space",view:[-12,49,3,57],globe:[-4,53,4],hi:["gb"],
 stat:"In more than a million phone check-ins, people in Britain were happiest by the sea",
 body:"Route 3, what the senses practise. The Mappiness app asked people at random moments how happy they felt, and used the phone’s location. In 2013 George MacKerron and Susana Mourato found people were happiest on the coast, the ‘blue space’, ahead of woods, mountains and farmland, even after allowing for weather, company and what they were doing.",
 more:"Why? ‘Attention restoration theory’ says nature holds your attention gently, so the tiring, effortful kind of focus gets a rest. ‘Biophilia’ is the idea that humans have an inborn pull toward living things and natural scenes. The pushback: people at the coast are often on holiday, and no app can fully remove that."}),
S({title:"City minds",view:[2,52,20,60],globe:[11,56,4],hi:["dk"],
 stat:"Danes who grew up in Copenhagen were more than twice as likely to develop schizophrenia as those raised in the countryside",
 body:"Route 3, what the senses practise. In 2001 Carsten Pedersen and Preben Mortensen followed almost two million Danes and found the risk of schizophrenia, a serious illness that changes how people perceive reality, rose with the years a child spent in a city. In 2011 Florian Lederbogen and colleagues scanned brains and found that in city dwellers the amygdala, a small almond-shaped part of the brain that works like a threat alarm, reacted more strongly to social stress.",
 more:"The pushback is ‘social drift’: people who are becoming ill may move into cities, rather than cities making them ill. But the risk follows where people were born and raised, as children, long before illness, which suggests the city plays some causal role. Genes and family still matter a great deal."}),

/* ----- two warnings ----- */
S({title:"Montesquieu’s mistake",view:[-12,38,12,51],globe:[0,45,3.5],hi:["fr"],
 stat:"In 1748 Montesquieu wrote that hot climates make people timid and lazy, and cold ones make them brave",
 body:"A warning. The philosopher Montesquieu, writing at his château at La Brède near Bordeaux, was sure climate fixed a people’s character. This ‘environmental determinism’, the idea that the land dictates who people are, was later used to claim that Europeans were born to rule people in hot countries, and to justify colonial empires.",
 more:"Modern research is different in three ways. It is probabilistic: geography shifts averages, it does not fix destinies. It is mediated: it works through farming, disease, institutions and migration, not straight from the weather to the soul. And it is reversible: when conditions change, minds change too."}),
S({title:"One soil, two Germanys",view:[0,46,25,57],globe:[12,51,3.5],hi:["de"],
 lines:[{coords:[[10.9,54.0],[10.8,53.6],[11.2,53.1],[10.6,52.85],[11.0,52.5],[10.6,52.0],[10.6,51.6],[10.1,51.3],[10.0,50.9],[10.25,50.55],[10.75,50.35],[11.3,50.4],[11.9,50.4],[12.1,50.3]],kind:"dash"}],
 pins:[[[11.6,52.9],"The old border between East and West","area"]],
 stat:"After 45 years of socialism, East Germans wanted the state to provide far more than West Germans did",
 body:"A second warning. Germany was split from 1945 to 1990 along a line (dashed) that followed no mountain or river: the same soil, climate and history on both sides. In 2007 Alberto Alesina and Nicola Fuchs-Schündeln found that after reunification, East Germans were much more in favour of the state looking after people than West Germans.",
 more:"Institutions, the rules and systems people live under, can override geography within a single generation. The gap has slowly narrowed since 1990, as you would expect if it was learned rather than given by the land."}),
S({title:"Now explore",view:W,globe:[20,30,1],card:undefined,
 stat:"Geography doesn’t write personality",
 body:"It sets the incentives, the selection pressures, and what the senses practise on, and culture carries the result forward long after the original reason is gone. Try it: turn on Rivers and follow the rice–wheat line across China, or switch on Day and night and compare winter in Tromsø with Florida.",
 more:"The Time zones tour looks at how clocks and the sun pull against each other, and the People tour at where humanity lives."})];
STEPS.forEach(o=>{if(o.card===undefined)delete o.card});

/* card photos ("title" → library file) and photo pins (title → [[lon,lat], label, file]). A card photo also stands on the
   map where it was taken, like the other tours (polish L). */
const CARD={
 "From the land to the mind":"Rice terraces, Bali.jpg",
 "Rice south, wheat north":"Terrace field yunnan china denoised.jpg",
 "A culture of honour":"Texas Longhorn grazing (8426057223).jpg",
 "Germs and the group":"Rainforest - Ituri (20874628148).jpg",
 "Hokkaido’s frontier":"SapporoFestival8.JPG",
 "The American frontier":"United States Wyoming Devils Tower Frosty Morning view from Joyner Ridge.jpg",
 "Winter in Tromsø":"Northern lights in Tromso.jpg",
 "Heat and tempers":"Downtown Phoenix Skyline (6974043971).jpg",
 "The pace of life":"Altstadt Bern (Südostseite).jpg",
 "Uphill and downhill":"Músicos tradicionales de Tenejapa (Chiapas).jpg",
 "A world of right angles":"Müller-Lyer illusion.svg",
 "Blue space":"Land's End, Cornwall, England.jpg",
 "City minds":"Cityscape and skyline by the Copenhagen Lakes, Denmark - (36018109956).jpg",
 "Montesquieu’s mistake":"Château de La Brède en Gironde.jpg",
 "One soil, two Germanys":"Fall of the Berlin Wall 1989, people walking.jpg",
 "Now explore":"Old men playing cards in a Beijing hutong.jpg"};
const PH={
 "From the land to the mind":[[[102.8,23.1],"Rice terraces of Yunnan","Terrace field yunnan china denoised.jpg"],[[141.35,43.06],"Sapporo in winter","SapporoFestival8.JPG"],
  [[18.96,69.65],"Aurora over Tromsø","Northern lights in Tromso.jpg"],[[7.45,46.95],"Bern’s old town","Altstadt Bern (Südostseite).jpg"],
  [[-112.07,33.45],"Phoenix in the desert","Downtown Phoenix Skyline (6974043971).jpg"],[[-92.5,16.82],"Musicians from Tenejapa","Músicos tradicionales de Tenejapa (Chiapas).jpg"],
  [[-5.71,50.07],"Land’s End, Cornwall","Land's End, Cornwall, England.jpg"],[[19.5,-24.5],"The Kalahari at sunrise","015a Angolan giraffe silhouette at sunrise in the Kalahari Desert of Namibia Photo by Giles Laurent.jpg"]],
 "Rice south, wheat north":[[[102.8,23.1],"Yunnan’s rice terraces","Terrace field yunnan china denoised.jpg"],[[116.4,39.9],"Beijing (wheat north)","Old men playing cards in a Beijing hutong.jpg"],[[121.47,31.23],"Shanghai (rice south)","Pudong Shanghai November 2017 panorama.jpg"]],
 "A culture of honour":[[[-83.18,35.33],"The Southern uplands, herding country","Cowee Mountain Overlook, Blue Ridge Parkway.jpg"]],
 "Germs and the group":[[[28.6,1.5],"Ituri rainforest, Congo","Rainforest - Ituri (20874628148).jpg"]],
 "Hokkaido’s frontier":[[[141.35,43.06],"Sapporo, Hokkaido’s capital","SapporoFestival8.JPG"]],
 "The American frontier":[[[-104.71,44.59],"Devils Tower, Wyoming","United States Wyoming Devils Tower Frosty Morning view from Joyner Ridge.jpg"]],
 "Winter in Tromsø":[[[18.96,69.65],"Tromsø’s polar night","Northern lights in Tromso.jpg"],[[-86.14,30.32],"Florida: about 1.4%","Seaside, Florida.jpg"]],
 "Heat and tempers":[[[-112.07,33.45],"Phoenix: over 40 °C in summer","Downtown Phoenix Skyline (6974043971).jpg"]],
 "The pace of life":[[[7.45,46.95],"Bern, Switzerland","Altstadt Bern (Südostseite).jpg"]],
 "Uphill and downhill":[[[-92.5,16.82],"Tenejapa’s Tzeltal Maya","Músicos tradicionales de Tenejapa (Chiapas).jpg"]],
 "A world of right angles":[[[19.5,-24.5],"Kalahari: San foragers hardly fooled","015a Angolan giraffe silhouette at sunrise in the Kalahari Desert of Namibia Photo by Giles Laurent.jpg"]],
 "Blue space":[[[-5.71,50.07],"Land’s End: the coast scored highest","Land's End, Cornwall, England.jpg"]],
 "City minds":[[[12.56,55.685],"Copenhagen","Cityscape and skyline by the Copenhagen Lakes, Denmark - (36018109956).jpg"]],
 "Montesquieu’s mistake":[[[-0.53,44.68],"La Brède: Montesquieu’s château","Château de La Brède en Gironde.jpg"]],
 "One soil, two Germanys":[[[13.38,52.51],"Berlin, November 1989","Fall of the Berlin Wall 1989, people walking.jpg"]],
 "Now explore":[]};

/* ---------- install: the new steps replace the old ones (same id, colour, shelf, map) ---------- */
T.steps=STEPS;
T.hint="Rice and wheat, honour in the American South, germs, frontiers, winter light, heat, the pace of life, compass languages, illusions, the sea and the city";
const modes=[...new Set(STEPS.map(s=>s.mode).filter(Boolean))];T.stopModes=modes.length>0;
if(typeof psLock==="function")STEPS.forEach(o=>{if(o.card)psLock(o,"card",o.card)});
const mine=()=>typeof ps!=="undefined"&&ps&&ps.tour===ID;

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined")TOURQ[ID]={mid:[
 {at:"Rice south, wheat north",st:"Rice south, wheat north",q:"In the café study, what did people in wheat-farming Beijing more often do when chairs blocked the way?",o:["Squeezed past","Moved the chair","Asked for help","Turned back"],a:1,why:"In rice-farming Shanghai people more often squeezed through instead.",kc:"cn"},
 {at:"A culture of honour",st:"A culture of honour",q:"After being insulted in Nisbett and Cohen’s experiment, whose stress hormone and testosterone rose most?",o:["Men raised in the North","Men raised in the South","Both the same","Neither changed"],a:1,why:"Herding country with distant law made a reputation for hitting back a kind of protection.",kc:"us"},
 {at:"The pace of life",st:"The pace of life",q:"Which country had the fastest pace of life of the 31 measured in 1999?",o:["Japan","Germany","Switzerland","United States"],a:2,why:"Walking speed, post-office service and accurate clocks put Switzerland first.",kc:"ch"}],
 recap:[
 {q:"Tzeltal Maya speakers in Tenejapa describe where things are using…",o:["Left and right","Uphill and downhill","Near and far","Sun and shade"],a:1,why:"Taken from the slope of their land, even on a flat table.",st:"Uphill and downhill",kc:"mx"},
 {q:"Who was least fooled by the Müller-Lyer illusion in the 1960s study?",o:["Students in Evanston","San foragers in the Kalahari","Office workers in London","Farmers in Japan"],a:1,why:"The ‘carpentered world’ idea: fewer straight walls and square corners.",st:"A world of right angles",kc:"bw"},
 {q:"After 45 years of socialism, East Germans were more likely than West Germans to…",o:["Favour the state looking after people","Distrust every government","Vote for lower taxes","Move abroad"],a:0,why:"Same soil, different institutions: minds changed within a generation.",st:"One soil, two Germanys",kc:"de"}]}}catch(e){}

/* ---------- photos ---------- */
const libIdx=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra();
 try{const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}
 return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}};
function cards(){try{if(typeof PS_PHOTO==="undefined")return;for(const t in CARD){const i=libIdx(CARD[t]);if(i>=0)PS_PHOTO[ID+"|"+t]=i}}catch(e){}}
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(mine()&&St&&STEPS.includes(St)&&CARD[St.title]){const i=libIdx(CARD[St.title]);if(i>=0)return PS_PHOTO_DATA[i]}}catch(e){}return _pf.apply(this,arguments)}}
/* photo pins carry their own picture (_gfImg); the shared pruning keeps a photo pin only if its label is in PS_SQ_IMG, so
   the label is registered there too (without overwriting a label another tour already uses) */
function prep(St){try{if(!St||!STEPS.includes(St))return;const L=PH[St.title]||[];window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 const arr=[];L.forEach(([at,label,f])=>{const i=libIdx(f);if(i<0)return;if(PS_SQ_IMG[label]==null)PS_SQ_IMG[label]=i;arr.push({at,label,col:"#d9682b",icon:"photo",_gfImg:i,img:i})});
 const cur=St.phPins||[];if(cur.length===arr.length&&cur.every((q,k)=>q&&q.label===arr[k].label&&q._gfImg===arr[k]._gfImg))return false;
 Object.defineProperty(St,"phPins",{configurable:true,enumerable:true,writable:true,value:arr});St._sqPruned=-1;return true}catch(e){console.error(e)}}
STEPS.forEach(St=>{St.phPins=[]});
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);try{if(mine()){restore();setTimeout(restore,300);setTimeout(restore,1200)}}catch(e){}return r}}
function run(){cards();try{if(typeof GF_SQ_FILE!=="undefined")for(const t in PH)PH[t].forEach(([at,l,f])=>{if(!GF_SQ_FILE[l])GF_SQ_FILE[l]=f})}catch(e){}}
run();addEventListener("load",()=>setTimeout(run,1600));setTimeout(run,5000);
})();
