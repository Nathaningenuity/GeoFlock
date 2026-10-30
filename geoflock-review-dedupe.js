/* GeoFlock: the tour review, de-duplication pass (review of 2026-10-30). Load it after every other geoflock-review-*.js file.
   Where an overview tour tells the same story as a detailed tour, word for word, the detailed (home) tour keeps the full
   story and the overview stop gets a short new angle that fits its own thread: a different stat, a distinct title and a
   body that links on to its neighbours. Where two tours had the same title but genuinely different angles, one of them is
   renamed. No stop is removed or moved, and the Geography tour (geo) is left alone.
   Other files keep adding and renaming stops until the page has loaded, so this patch runs after window "load" + 1.5 s,
   again at +1.5, +5 and +12 s, and whenever a tour starts. Stops are found by tour id and current title; a stop that has
   already been patched (found by its new title) is patched again harmlessly, and a stop that is missing is skipped.
   Tour questions (TOURQ) and the photo-card maps follow the renamed stops. */
(function(){
"use strict";
const def=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{o[k]=v}catch(_){}}};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();

/* [tour id, current title, {title, stat, body, more}] : fields left out stay as they are */
const EDITS=[

/* ---------- Modern history (overview) vs World wars / Cold War / Since 1991 ---------- */
["hmodern","The Holocaust",{title:"The Holocaust and “never again”",
 stat:"The word “genocide” was coined in 1944, and in 1948 the UN made genocide a crime under international law",
 body:"Nazi Germany murdered about six million Jews, two-thirds of the Jews of Europe, in ghettos and in death camps such as Treblinka and Auschwitz-Birkenau, along with Roma, disabled people and many others. After the war the world tried to make sure it could never happen again: Nazi leaders were tried at Nuremberg, and the new United Nations wrote the crime of genocide into law.",
 more:"The word was made up by Raphael Lemkin, a Polish Jewish lawyer who lost dozens of relatives in the Holocaust. The camps and the killing are told in full in the World wars tour. Auschwitz was liberated on 27 January 1945, now International Holocaust Remembrance Day."}],
["hmodern","Hiroshima and Nagasaki",{title:"The nuclear age begins",
 stat:"Today nine countries hold about 12,000 nuclear warheads between them",
 body:"On 6 and 9 August 1945, US atomic bombs destroyed Hiroshima and Nagasaki, and Japan surrendered days later. A single bomb could now wipe out a city, and the fear of that shaped the rivalry that came next.",
 more:"The Soviet Union tested its own bomb in 1949 and Britain in 1952, and the arms race was on. In Hiroshima, the ruined Genbaku Dome was left standing as a memorial; the end of the war in the Pacific is told in the World wars tour."}],
["hmodern","Korea’s unfinished war",{
 stat:"Divided since 1945, the two Koreas took opposite paths: today the South is one of the world’s richest countries and the North one of the poorest",
 body:"Korea was split at the 38th parallel (dashed) in 1945. North Korea invaded the South in 1950; after three years and perhaps 2 to 3 million deaths, the fighting stopped close to where it began (red), with no peace treaty. The same people, split by the Cold War, then lived under two opposite systems.",
 more:"Along the line runs the Demilitarised Zone, a strip about 4 km wide that almost no one has entered for 70 years, so it has become a haven for wildlife such as red-crowned cranes. Talks are still held at Panmunjom, right on the line."}],
["hmodern","The space race",{title:"Racing to the Moon"}],
["hmodern","The Cuban Missile Crisis",{title:"The closest call",
 stat:"After the scare of 1962, Washington and Moscow set up a hotline, and in 1963 agreed to stop testing nuclear weapons in the air, in space and under the sea",
 body:"In October 1962 US spy planes found Soviet nuclear missiles in Cuba, within reach of Washington (circle: their rough range). After 13 tense days the Soviet leader Khrushchev agreed to take them away, and both sides set out to make sure it never came that close again.",
 more:"On a Soviet submarine near Cuba, officer Vasily Arkhipov is said to have refused to agree to firing a nuclear torpedo. The 1963 treaty still allowed tests underground, but it was the first deal to limit the bomb; the crisis itself is told day by day in the Cold War tour."}],
["hmodern","The year the Wall fell",{
 stat:"The Berlin Wall stood for 28 years, and opened in a single night, on 9 November 1989",
 body:"In 1989 communist governments across Eastern Europe fell one after another, mostly without a shot, once it was clear that the Soviet Union would not send its tanks to save them. By 1993 the Soviet Union had split into 15 countries, and Yugoslavia and Czechoslovakia had broken up too.",
 more:"The Wall, about 155 km long, had ringed West Berlin since 1961, and at least 140 people died at it. Germany reunited on 3 October 1990, and the Soviet Union itself broke up on 26 December 1991."}],
["hmodern","War in Ukraine",{title:"War returns to Europe",
 stat:"After Russia’s full-scale invasion of Ukraine in 2022, Finland and Sweden gave up decades of neutrality and joined NATO",
 body:"On 24 February 2022 Russian forces attacked Ukraine from the north, east and south, starting the biggest war in Europe since 1945. Countries that had stayed out of alliances for decades decided they needed one.",
 more:"Finland, which shares about 1,340 km of border with Russia, joined NATO in April 2023 and Sweden in March 2024, so the alliance founded by 12 countries in 1949 now has 32. The war grew out of 2014, when Russia annexed Crimea, a move most countries do not recognise; the war itself is told in the Since 1991 tour."}],

/* ---------- Music and sport (overview) vs Sports / Music ---------- */
["musicsport","The world’s game",{title:"Football conquers the world",
 stat:"FIFA, football’s world body, has 211 members, more than the 193 countries in the UN",
 body:"Football’s modern rules were written in England in 1863, and the game needs nothing but a ball and some open ground, one reason it spread to every continent. It is now the most played and watched sport on Earth.",
 more:"Uruguay hosted and won the first World Cup, in 1930, when only 13 teams took part. Brazil has won it five times, Germany and Italy four each and Argentina three. FIFA counts places such as England, Scotland, Wales and Hong Kong as separate members, which is how it outnumbers the UN."}],
["musicsport","Three hosts, 48 teams",{
 stat:"Mexico City’s Estadio Azteca became the first stadium to host games at three World Cups: 1970, 1986 and 2026",
 body:"With 48 teams and 104 matches, the 2026 World Cup was too big for most countries alone, so the United States, Canada and Mexico shared it, using 16 cities and many big stadiums already built for American football.",
 more:"Eleven host cities were in the US, three in Mexico and two in Canada, and the final was played at MetLife Stadium in New Jersey, near New York, on 19 July 2026."}],
["musicsport","The Olympic map",{title:"Africa’s first Olympics",
 stat:"Dakar, in Senegal, hosts the Youth Olympic Games from 31 October 2026, the first Olympic event ever held in Africa",
 body:"Every other inhabited continent has hosted the Summer Olympics, but Africa never has. The Games now cost many billions of dollars to stage, and African bids, such as Cape Town’s for 2004, have so far lost.",
 more:"The modern Olympics began in Athens in 1896. London and Paris lead with three Summer Games each, Rio de Janeiro (2016) is still the only South American host, and Los Angeles hosts its third Games in 2028."}],
["musicsport","Vienna, city of music",{title:"Vienna’s pull",
 stat:"Of Vienna’s four great classical composers, only Schubert was born there",
 body:"Haydn, Mozart and Beethoven all moved to Vienna because the Habsburg emperors and nobles there paid for orchestras, operas and lessons. Music, like any other trade, went where the money was.",
 more:"Mozart came from Salzburg, Beethoven from Bonn, in Germany, and Haydn grew up in a village not far from the city. Vienna still holds hundreds of balls each winter, many of them opening with a waltz."}],
["musicsport","Jamaica’s big sound",{
 stat:"Hip hop was born in New York, but one of its founders, DJ Kool Herc, brought the idea of giant street-party speakers from Jamaica",
 body:"Jamaica has under 3 million people, but its music travelled with its emigrants to New York, London and Toronto. Ska, rocksteady and reggae grew up in Kingston in the 1960s, and Bob Marley took reggae worldwide.",
 more:"Clive Campbell, known as DJ Kool Herc, moved from Kingston to the Bronx as a boy; his 1973 party there is often counted as the start of hip hop. Jamaican dancehall also helped shape reggaeton, which grew up in Panama and Puerto Rico."}],
["musicsport","Baseball’s map",{title:"Where baseball went",
 stat:"About one in ten Major League Baseball players comes from the Dominican Republic, a country of about 11 million people",
 body:"Baseball spread from the US with American sailors, soldiers and teachers from the 1870s, so it took root where American influence was strongest: Cuba and the Caribbean, Japan, South Korea and Taiwan.",
 more:"Japan learned the game early and won three of the first five World Baseball Classics. In the Dominican Republic, many big-leaguers come from one sugar-mill town, San Pedro de Macorís. Japan’s star Shohei Ohtani, a top pitcher and hitter at once, plays in Los Angeles."}],
["musicsport","Runners from the highlands",{title:"East Africa’s runners",
 stat:"In 1960 Ethiopia’s Abebe Bikila won the Olympic marathon in Rome running barefoot, the first Olympic gold won by a Black African",
 body:"Many of the world’s best distance runners grow up 2,000 to 2,500 m up, in Kenya’s Rift Valley and Ethiopia’s highlands, where thin air builds stamina; small towns such as Iten in Kenya and Bekoji in Ethiopia have produced champion after champion. Success feeds itself: coaches, training camps and young runners gather where champions came from.",
 more:"From 2003 on, each time the men’s marathon world record fell, it went to a Kenyan or an Ethiopian. The thin air, the training camps and the champions are mapped in the Sports tour."}],

/* ---------- Empires and independence (overview) vs the detailed history tours ---------- */
["hempires","The Mongol Empire",{title:"Too big to hold: the Mongols",
 stat:"Within about 40 years of Genghis Khan’s death in 1227, his empire had split into four rival khanates",
 body:"From 1206 Mongol horsemen conquered from Korea to Hungary, but no single ruler could hold land that big for long: by the 1260s Genghis Khan’s grandsons ruled four separate realms, from China to Russia.",
 more:"Even split up, Mongol rule kept the Silk Road open, which also helped carry the Black Death to Europe. A 2003 study suggested that about 16 million men alive today may descend from Genghis Khan or his close family."}],
["hempires","Russia reaches the Pacific",{title:"An empire by land",
 stat:"Russia sold Alaska to the United States in 1867 for $7.2 million, about 2 cents an acre",
 body:"While Spain and Portugal built empires by sea, Russia grew over land: from the 1580s it pushed east over the Urals, and its fur traders reached the Pacific in 1639.",
 more:"It went on into Alaska and even built a fort in California, Fort Ross, in 1812, but Alaska was too far away to defend. In 1858–60 Russia also took the land north of the Amur River and around Vladivostok from Qing China. Because its lands were joined to the homeland, much of Russia’s empire was never given up the way overseas colonies were: Siberia is still Russia."}],
["hempires","The Atlantic slave trade",{title:"Sugar, slaves and empire",
 stat:"Brazil, in 1888, was the last country in the Americas to end slavery",
 body:"Europe’s empires in the Americas ran on sugar, and sugar ran on forced labour: from the 1500s to the 1860s about 12.5 million Africans were shipped from West and Central Africa (bright) to the Americas (pale), most of them to Brazil and the Caribbean.",
 more:"Sugar, tobacco and cotton grown by enslaved people made fortunes in Lisbon, Amsterdam, London and Nantes. Britain banned the trade in 1807 and slavery in most of its colonies in 1834; the crossing itself is told in the Africa and gunpowder-age tours."}],
["hempires","American independence",{title:"The first colonies to break free",
 stat:"The United States was the first European colony in the Americas to win its independence",
 body:"Britain’s 13 colonies on the Atlantic coast declared independence in 1776 and, with French help, won it by 1783. Their success showed that colonies could break away, and it inspired revolutions from France in 1789 to Haiti in 1804.",
 more:"The peace treaty of 1783 gave the new country all the land to the Mississippi, more than doubling it. Canada stayed British, and tens of thousands of colonists loyal to the king moved north."}],
["hempires","Latin America breaks free",{title:"Spain’s empire splits up",
 stat:"Spain’s mainland American empire, about 300 years old, broke up into what are now 16 countries",
 body:"From 1810 to 1825 armies led by Simón Bolívar and José de San Martín drove Spain out. The empire broke along its old colonial divisions, and the big unions that tried to hold parts of it together, Gran Colombia and the Federation of Central America, fell apart within a few decades.",
 more:"Brazil broke away from Portugal in 1822 with far less fighting, under the Portuguese king’s own son as emperor, and stayed in one piece. Only Cuba and Puerto Rico stayed Spanish, until 1898."}],
["hempires","The Scramble for Africa",{title:"Borders drawn in Europe",
 stat:"By 1914 every part of Africa except Ethiopia and Liberia was ruled from Europe",
 body:"In about 30 years, seven European countries shared out the continent, often drawing borders with rulers on maps of lands they had never seen. Most of those lines became the borders of independent Africa, which is why so many of them are straight.",
 more:"King Leopold II of Belgium owned the Congo personally from 1885 to 1908, a land about 75 times the size of Belgium, where forced labour for rubber killed huge numbers of people. In 1964 the newly independent states agreed to keep the colonial borders, fearing endless wars if they tried to redraw them. Ethiopia stayed free because its army beat an Italian invasion at Adwa in 1896."}],
["hempires","The Year of Africa",{title:"Africa’s wave of independence",
 stat:"In the ten years after Ghana’s independence in 1957, about 30 African countries won theirs",
 body:"World War II left Britain and France weakened and in debt, and Africans who had fought for them came home demanding freedom. Once Ghana led the way, neighbours pushed for the same: in 1960 alone, 17 African countries became independent.",
 more:"When the UN was founded in 1945 it had 51 members; by 1970 it had over 120, mostly newly independent countries in Africa and Asia. Some independence came peacefully; elsewhere, as in Algeria and Kenya, it took long wars."}],

/* ---------- Timeline (overview) ---------- */
["timeline","Rome and Han China",{title:"Silk crosses Asia",
 stat:"AD 1: Romans wear Chinese silk without ever having seen China"}],
["timeline","Latin America breaks free",{title:"Independence sweeps Latin America"}],
["timeline","The Year of Africa",{title:"Africa’s great year",
 stat:"1960: a third of Africa’s countries win independence in a single year",
 body:"Seventeen African countries became free in 1960. Hover the pink and green countries: Kenya, Angola, Mozambique and others were still colonies, some for another 15 years."}],
["timeline","One country becomes fifteen",{title:"Three countries become 22",
 stat:"1991–93: the Soviet Union, Yugoslavia and Czechoslovakia split into 22 countries",
 body:"The Soviet Union alone became 15. Drag the timeline from 1960 to 1995 to watch it happen; the map has barely changed since.",
 more:"It was the biggest wave of new countries since Africa’s independence in the 1960s, and nearly all of it happened along the old internal borders of the three federations."}],

/* ---------- Physical and continent tours ---------- */
["climate","Greenland icy, Iceland green",{title:"Two islands, two currents",
 stat:"Reykjavík and Nuuk lie at almost the same latitude, but Nuuk’s January is about 7°C colder",
 body:"The difference is the sea. A branch of the warm North Atlantic Current (red arrow) reaches Iceland’s south and west coasts, while the cold East Greenland Current (blue arrow) carries Arctic water and ice down Greenland’s east side.",
 more:"So about 80% of Greenland lies under an ice sheet, while only about a tenth of Iceland is glacier. Iceland’s biggest glacier, Vatnajökull, is still the largest in Europe by volume."}],
["asia","Fourteen neighbours",{title:"The two giants’ neighbours",
 stat:"Between them, China and Russia touch 23 other countries, and each other along about 4,200 km",
 body:"Hover a country to see who it touches. Each of the two borders 14 countries, more than any other: China’s run from North Korea to Afghanistan, Russia’s from Norway to North Korea.",
 more:"Three countries, Kazakhstan, Mongolia and North Korea, border both. Some of China’s borders run over the highest mountains on Earth, and several are still disputed, including long stretches with India. Russia’s 14 count Kaliningrad’s neighbours, Poland and Lithuania."}],
["asia","The roof of the world",{title:"Asia’s high peaks"}],
["asia","The monsoon",{title:"The rains that feed Asia"}],
["asia","Megacities",{title:"Asia’s giant cities"}],
["space","The roof of the world",{title:"The Himalaya from orbit"}],
["space","Greenland’s ice",{title:"Greenland from orbit"}],
["environment","Greenland’s ice",{title:"Greenland is melting",
 stat:"In August 2021 rain fell on the summit of Greenland’s ice sheet, over 3,200 m up, for the first time on record",
 body:"Warmer summers now melt Greenland’s ice faster than new snow replaces it, and meltwater running off the island is one of the biggest single causes of rising seas.",
 more:"All of Greenland’s ice would raise the world’s seas by about 7 m, though melting it all would take centuries. Rain brings heat to the ice and leaves wet, darker snow that soaks up more sunlight."}],
["plates","The Ring of Fire",{title:"Where the Pacific sinks",
 stat:"About 90% of the world’s earthquakes strike around the edge of the Pacific",
 body:"The Pacific is edged almost all the way round by places where its plates dive under their neighbours. The plates catch and slip in huge earthquakes, and the sinking rock melts to feed about three-quarters of the world’s active volcanoes: the map’s symbols trace this Ring of Fire.",
 more:"The ring runs about 40,000 km from New Zealand through Indonesia, Japan, Alaska and down the Americas. Where the plates dive, they leave the deepest trenches on Earth: the Mariana Trench, where the Pacific plate sinks under the Philippine Sea plate, reaches almost 11 km down."}],
["plates","The Andes",{title:"Squeezing up the Andes"}],
["samerica","The Andes",{title:"Living high in the Andes",
 stat:"La Paz, Quito and Bogotá all sit more than 2,500 m up in the Andes",
 body:"The Andes run about 7,000 km, the whole length of the continent, through seven countries. Move along the chart from the Pacific over Aconcagua, 6,961 m, the highest mountain anywhere outside Asia, and down to the flat pampas of Argentina.",
 more:"The Andes are still rising, as the Nazca Plate dives under South America, which also brings earthquakes and volcanoes. Living high has shaped life here: potatoes and quinoa were first farmed in the Andes, and people whose families have lived high for thousands of years have bodies adapted to the thin air."}],
["samerica","The Amazon",{title:"The Amazon basin",
 stat:"The Amazon basin is so flat that Iquitos, in Peru, more than 3,000 km upstream, is only about 100 m above sea level",
 body:"The forest covers about 5.5 million km² across nine countries, and the river carries about a fifth of all the river water that reaches the sea. Move along the chart: the land barely rises all the way to the foot of the Andes.",
 more:"Because the slope is so gentle, the river is slow and wide, and ocean-going ships can sail about 1,500 km upstream to Manaus. One in ten known species lives in the Amazon, and scientists worry that if too much forest is cleared, parts of it could dry out into savanna."}],
["samerica","The Galápagos",{title:"Darwin’s islands",
 stat:"The Galápagos, about 1,000 km off Ecuador, helped Charles Darwin work out how species change",
 body:"These volcanic islands have animals found nowhere else, and different ones on each island. When Darwin visited in 1835, he noticed that finches and tortoises varied from island to island.",
 more:"Cold currents keep the water cool enough for penguins, the only ones that live north of the equator. Ecuador is named after the equator itself."}],
["animals","The Amazon",{title:"Amazon wildlife"}],
["forests","The Amazon",{title:"The Amazon’s trees",
 more:"Parts of the forest were shaped by people long before 1492: dark, fertile ‘terra preta’ soils and groves of useful trees mark old settlements."}],
["night","China’s Hu line",{title:"The Hu line by night"}],
["oceania","Canberra, the compromise",{title:"A capital in the bush",
 stat:"Canberra, Australia’s capital, is home to under 2% of Australians",
 body:"When Australia’s colonies united in 1901, neither Sydney nor Melbourne would let the other be the capital, so a new city was planned inland, roughly between them.",
 more:"Parliament met in Melbourne until 1927. Most Australians still live in a handful of big coastal cities, and Sydney and Melbourne each have over ten times as many people as Canberra."}],
["africa","Three capitals",{title:"South Africa’s balancing act",
 stat:"South Africa has 12 official languages and three capitals, and its biggest city, Johannesburg, is not one of them",
 body:"After apartheid, the system of racial separation enforced from 1948 to 1994, the new South Africa set out to share power and recognition: 11 languages were made official, from Zulu and Xhosa to Afrikaans and English, and sign language became the 12th in 2023. The capital is shared too: government in Pretoria, parliament in Cape Town, courts in Bloemfontein.",
 more:"Nelson Mandela, jailed for 27 years, became its first president elected by all races in 1994. Why the capital was split three ways is told in the Capitals tour."}],
["explorers","Out of Africa",{title:"The first explorers",
 stat:"The first people to reach Australia, at least 50,000 years ago, had to cross open sea, even when sea levels were at their lowest",
 body:"Our species evolved in Africa. Small groups that left it became the first explorers: on foot and by boat, their descendants reached Asia, Australia, Europe and, last of all, the Americas.",
 more:"In the last Ice Age, sea levels were lower and Siberia was joined to Alaska, so people could walk into the Americas, at least 15,000 years ago and perhaps much earlier. Their boats were probably rafts or canoes of wood, bamboo or bark, which have long since rotted away."}],
["biomes","Deserts",{title:"The desert biome"}],
["cities","Where the ships stopped",{title:"The fall line"}],
["geopol","Lines in the sand",{title:"Straight lines across the desert"}],

/* ---------- History tours ---------- */
["hasia","The first emperor",{title:"The emperor’s clay army",
 stat:"Qin Shi Huang, who united China in 221 BC, was buried with about 8,000 life-size clay soldiers",
 body:"He joined older walls into a first Great Wall and made the whole country use one script, one currency and one set of weights. Farmers digging a well near Xi’an found his Terracotta Army in 1974.",
 more:"The emperor’s own tomb has still not been opened. Most of the Great Wall you can visit today (amber) was built much later, under the Ming: from Shanhaiguan to Jiayuguan is about 1,800 km in a straight line (ruler), but all its sections and branches add up to about 21,000 km."}],
["hmedieval","Angkor",{title:"Angkor’s reservoirs"}],
["hafrica","The Benin Bronzes",{title:"Two Benins"}],
["hafrica","The Atlantic slave trade",{title:"What the slave trade cost Africa",
 stat:"Parts of Africa that lost the most people to the slave trades are, on average, poorer today, one study found",
 body:"From the 1500s to the 1860s about 12.5 million Africans were forced onto slave ships, and nearly 2 million died on the way. Most were young, and the wars and raids to capture them spread fear and distrust across West and Central Africa for centuries.",
 more:"About 40% were taken to Brazil, and fewer than 400,000, about 3%, to mainland North America. The economist Nathan Nunn compared regions in 2008 and found that those that lost the most people are poorer today, and later work found less trust between neighbours there. Britain banned the trade in 1807 and the US in 1808, but ships kept sailing illegally for decades."}],
["hnamerica","1492",{title:"The Taíno meet Columbus"}],
["hoceania","Captain Cook",{title:"Tupaia and Captain Cook"}],
["hsamerica","Machu Picchu",{title:"Pachacuti’s mountain estate",
 more:"Pachacuti turned a small kingdom around Cusco into the Inca Empire, and estates like this one showed off his power and wealth. The site itself, and how it survived, is a stop in the Landmarks tour."}],
["heurope","The Industrial Revolution",{title:"Coal, rivers and ports"}],
["hg7b","The Industrial Revolution",{title:"Where industrialisation began",
 body:"Steam engines, cheap coal and iron, and machines for spinning cotton moved work out of homes and small workshops into factories, first in Britain. Workers followed the jobs, and factory towns such as Manchester grew very fast, fed by cotton grown by enslaved people in the American South."}],

/* ---------- Culture tours ---------- */
["mythology","Stonehenge",{title:"Merlin’s stones",
 body:"Geoffrey of Monmouth wrote around 1136 that the wizard Merlin brought the stones over the sea from Ireland by magic. Geologists have since traced the smaller ‘bluestones’ to the Preseli Hills in Wales, so the legend got one thing right: the stones really did travel a long way."}],
["art","The Taj Mahal",{title:"Mughal style: the Taj Mahal",
 stat:"The Taj Mahal blends Persian, Indian and Central Asian ideas: domes, slim minarets and a garden split in four by water",
 body:"The Mughal emperor Shah Jahan built this white marble tomb at Agra for his wife Mumtaz Mahal, who died in 1631. The Mughals came from Central Asia and admired Persian culture, so their buildings mixed those traditions with Indian ones; their empire is shaded on this map of 1650."}]
];

const T=id=>{try{const t=PS_TOURS[id];return t&&Array.isArray(t.steps)?t:null}catch(e){return null}};
const find=(steps,ti)=>steps.find(s=>s&&strip(s.title)===strip(ti));
const KEYMAPS=()=>{const L=[];try{if(typeof PS_PHOTO!=="undefined")L.push(PS_PHOTO)}catch(e){}
 ["PS_PHOTO_CAP","PS_PHOTO_BASE"].forEach(n=>{try{if(window[n]&&typeof window[n]==="object")L.push(window[n])}catch(e){}});return L};
function carry(id,from,to){KEYMAPS().forEach(M=>{try{const a=id+"|"+from,b=id+"|"+to;if(M[a]!=null&&M[b]==null)M[b]=M[a]}catch(e){}})}
function fixQ(id,from,to){try{if(typeof TOURQ==="undefined"||!TOURQ[id])return;const Q=TOURQ[id];
 [Q.mid,Q.recap].forEach(L=>(L||[]).forEach(q=>{if(!q)return;if(q.st===from)q.st=to;if(q.at===from)q.at=to}))}catch(e){}}
const byTour={};EDITS.forEach(e=>{(byTour[e[0]]=byTour[e[0]]||[]).push(e)});
const RENAMED=[];
function patchTour(id,force){const t=T(id);if(!t||id==="geo")return;const steps=t.steps;if(steps._rvDedupe&&!force)return;let all=true;
 byTour[id].forEach(([,from,f])=>{try{const to=f.title||from;const s=find(steps,from)||find(steps,to);if(!s){all=false;return}
  ["stat","body","more"].forEach(k=>{if(f[k]!=null&&s[k]!==f[k])def(s,k,f[k])});
  if(to!==from){if(strip(s.title)!==to)def(s,"title",to);carry(id,from,to)}
  fixQ(id,from,to)}catch(e){all=false;console.error(e)}});
 if(all)def(steps,"_rvDedupe",1)}
function run(){for(const id in byTour)patchTour(id,true)}
window.gfRvDedupe={EDITS,run};
EDITS.forEach(([id,from,f])=>{if(f.title&&f.title!==from)RENAMED.push([id,f.title])});window.gfRvDedupe.renamed=RENAMED;
const hook=()=>{try{if(typeof psGo==="function"&&!psGo._rvDedupe){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&byTour[ps.tour])patchTour(ps.tour)}catch(e){}return _g.apply(this,arguments)};psGo._rvDedupe=1}}catch(e){}};
const ready=()=>setTimeout(()=>{run();hook();[1500,5000,12000].forEach(ms=>setTimeout(()=>{run();hook()},ms))},1500);
if(document.readyState==="complete")ready();else addEventListener("load",ready);
})();
