/* GeoFlock tour sweep 3: the Power & economy and History shelves, stop by stop.
   Tours: govmap, politics, capitals, geopol, borders, regions, gdp, transport, energy, resources, currencies, conflicts,
   hancient, hmedieval, hgunpowder, hrevolutions, hwars, hcoldwar, hsince91, hempires, hmodern, explorers, heurope, hasia,
   hafrica, hnamerica, hsamerica, hoceania, hantarctica.
   Each entry is keyed "tour|stop title" and is applied when the stop is shown (psGo is wrapped, as in
   geoflock-polish-m.js), so it wins over the tour files and the earlier patch files. Fields:
     body / stat / more / sub      card text, whole field;   re: [[field, old, new], ...] small edits inside a field
     view / globe / mode / on / hi / hiSoft / lines / legend / keyLabel / iconPins / gfRuler   set as given
     pins       the stop's map labels, replaced;   pinsDrop: RegExp of labels to drop;   pinsAdd: labels to add
     pinsMove   {label:[lon,lat]} to move a label
     phDrop     RegExp of photo-pin labels to drop;   phAdd: photo pins to add ({at,label,f} and, for a new picture, d,by,lic,page;
                a picture already in the photo library needs only its file name f)
     phMove     {label:[lon,lat]} to move a photo pin;   phLabel {old:new} to rename one
     fn(S)      anything else */
(function(){
"use strict";
const SET=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};
const CL=v=>v==null?v:JSON.parse(JSON.stringify(v));
/* a picture's record, from the photo library or the other photo lists in the app */
function rec(f){try{const L=[];if(typeof PS_PHOTO_DATA!=="undefined")L.push(PS_PHOTO_DATA);["GF_EXTRA_PHOTOS","GF_PORTRAIT_PHOTOS","GF_STOP_PHOTOS"].forEach(n=>{if(Array.isArray(window[n]))L.push(window[n])});
 try{if(window.GF_TOUR_PH&&Array.isArray(GF_TOUR_PH.photos))L.push(GF_TOUR_PH.photos)}catch(e){}
 for(const A of L){const r=A.find(q=>q&&q.f===f&&q.d);if(r)return r}}catch(e){}return null}
function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;
 /* a picture another stop already shows, found by that stop's pin label */
 if(!x.f&&x.fromLabel){const S=window.PS_SQ_IMG||{};let i=S[x.fromLabel];if(typeof i!=="number"||!PS_PHOTO_DATA[i]){try{const f=GF_SQ_FILE[x.fromLabel];i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===f&&q.d)}catch(e){i=-1}}
  if(i>=0){x.f=PS_PHOTO_DATA[i].f;S[x.label]=i;window.PS_SQ_IMG=S;try{GF_SQ_FILE[x.label]=x.f}catch(e){}}return i}
 let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f&&q.d);
 if(i<0){const r=x.d?x:rec(x.f);if(!r)return -1;PS_PHOTO_DATA.push({f:x.f,d:r.d,by:r.by,lic:r.lic,page:r.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
const lab=q=>Array.isArray(q)?String(q[1]||""):String(q&&q.label||"");
const P={};
/* new pictures for this sweep (Wikimedia Commons, free licences), saved in photos/ */
const NEW={
 qeswachaka:{f:"Inka suspension bridge Qeswachaka DSC 2730.jpg",d:"photos/t3dd161d93a74bb3f6.webp",by:"Aga Khan (IT)",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Inka_suspension_bridge_Qeswachaka_DSC_2730.jpg"},
 tupaia:{f:"Tupaia's map, c. 1769.jpg",d:"photos/t377d8bd3416f44d61.webp",by:"Tupaia, copied by James Cook",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Tupaia%27s_map,_c._1769.jpg"},
 kemal:{f:"Mustafa Kemal in Gallipoli.jpg",d:"photos/t3c723d34ee3f3df21.webp",by:"Unknown author",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Mustafa_Kemal_in_Gallipoli.jpg"},
 churchill:{f:"Winston Churchill 1945 (2x3 cropped).jpg",d:"photos/t39ef90376a95b0ef3.webp",by:"Central Office of Information",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Winston_Churchill_1945_(2x3_cropped).jpg"},
 yermak:{f:"Vasily Surikov - Yermak's Conquest of Siberia - Google Art Project.jpg",d:"photos/t3dcf89d924e20ccbf.webp",by:"Vasily Surikov",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Vasily_Surikov_-_Yermak%27s_Conquest_of_Siberia_-_Google_Art_Project.jpg"},
 gorbachev:{f:"RIAN archive 770913 The final speech of the General Secretary of the CPSU Central Committee M. Gorbachev cropped.jpg",d:"photos/t329d3db1d218f89ac.webp",by:"Yuryi Abramochkin / RIA Novosti",lic:"CC BY-SA 3.0",page:"https://commons.wikimedia.org/wiki/File:RIAN_archive_770913_The_final_speech_of_the_General_Secretary_of_the_CPSU_Central_Committee_M._Gorbachev_cropped.jpg"},
 pervomaisk:{f:"Pervomaisk missile base.JPG",d:"photos/t34eb0506e8279c188.webp",by:"Michael",lic:"CC BY 3.0",page:"https://commons.wikimedia.org/wiki/File:Pervomaisk_missile_base.JPG"},
};
const np=(k,at,label,o)=>Object.assign({at,label},NEW[k],o||{});
window.GF_SWEEP3=P;
const KEYS=["view","globe","mode","on","hi","hiSoft","lines","legend","keyLabel","iconPins","gfRuler","pins","flatView"];
function photos(S,X){
 /* photo pins: the stop's own list, less the dropped ones, plus ours; kept whatever other scripts set the list to later */
 const mine=(X.phAdd||[]).map(x=>{const i=libAdd(x);return i<0?null:{at:x.at,label:x.label,col:x.col||(x.person?"#3d3466":"#d9682b"),icon:"photo",_f:x.f,img:i,person:x.person?1:undefined}}).filter(Boolean);
 const fix=L=>(Array.isArray(L)?L:[]).filter(q=>q&&!(X.phDrop&&!q.person&&X.phDrop.test(lab(q)))&&!mine.some(m=>m.label===q.label)).map(q=>{
   if(X.phMove&&X.phMove[q.label]){q=Object.assign({},q,{at:X.phMove[q.label].slice()})}
   if(X.phLabel&&X.phLabel[q.label]){q=Object.assign({},q,{label:X.phLabel[q.label]})}return q}).concat(mine);
 if(S._gfS3p){(X.phAdd||[]).forEach(libAdd);return}S._gfS3p=1;
 const d=Object.getOwnPropertyDescriptor(S,"phPins");let base=d&&("value" in d)?d.value:S.phPins;let cache=null,ck=null;
 const get0=d&&d.get?d.get.bind(S):null,set0=d&&d.set?d.set.bind(S):null;
 try{Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,
  get(){const b=get0?get0():base;if(ck!==b||!cache){ck=b;cache=fix(b)}return cache},
  set(v){if(set0)set0(v);else base=v;ck=null}})}catch(e){}
 S._sqPruned=-1}
function text(S,X){["body","stat","more","sub"].forEach(f=>{if(f in X&&S[f]!==X[f])SET(S,f,X[f])});
 (X.re||[]).forEach(([k,a,b])=>{if(typeof S[k]==="string"&&S[k].includes(a))SET(S,k,S[k].split(a).join(b))})}
const MINE=new Set("govmap politics capitals geopol borders regions gdp transport energy resources currencies conflicts hancient hmedieval hgunpowder hrevolutions hwars hcoldwar hsince91 hempires hmodern explorers heurope hasia hafrica hnamerica hsamerica hoceania hantarctica".split(" "));
/* a country named twice: by its flag tag and again by a plain label (Togo, Gabon, Rwanda and Mozambique on the
   Commonwealth stop): the plain label goes */
function flagDup(S){try{if(!Array.isArray(S.flagTags)||!S.flagTags.length||!Array.isArray(S.pins))return false;const N=new Set(S.flagTags.map(f=>String(f&&f.name||"").toLowerCase()));
 const L=S.pins.filter(q=>!(Array.isArray(q)&&N.has(lab(q).toLowerCase())));if(L.length!==S.pins.length){SET(S,"pins",L);return true}}catch(e){}return false}
function apply(tour,S){if(MINE.has(tour))flagDup(S);const X=P[tour+"|"+S.title];if(!X)return;
 try{text(S,X);KEYS.forEach(k=>{if(k in X)SET(S,k,CL(X[k]))});
  if(X.pinsDrop||X.pinsAdd||X.pinsMove){let L=(Array.isArray(S.pins)?S.pins:[]).filter(q=>!(X.pinsDrop&&X.pinsDrop.test(lab(q))));
   if(X.pinsMove)L=L.map(q=>Array.isArray(q)&&X.pinsMove[q[1]]?[X.pinsMove[q[1]].slice()].concat(q.slice(1)):q);
   if(X.pinsAdd)L=L.filter(q=>!X.pinsAdd.some(a=>a[1]===lab(q))).concat(CL(X.pinsAdd));SET(S,"pins",L)}
  if(X.iconDrop&&Array.isArray(S.iconPins))SET(S,"iconPins",X.iconDrop===true?[]:S.iconPins.filter(q=>!X.iconDrop.test(q.icon)));
  if(X.phAdd||X.phDrop||X.phMove||X.phLabel)photos(S,X);
  if(X.fn)X.fn(S)}catch(e){console.error(e)}}
function cur(){try{return typeof ps!=="undefined"&&ps&&ps.tour}catch(e){return null}}
function wrapGo(){if(typeof psGo!=="function"||typeof psSteps!=="function")return false;if(psGo._gfS3)return true;const _g=psGo;
 psGo=function(i){let S=null;try{const t=cur();if(t){const L=psSteps();S=L[Math.max(0,Math.min(L.length-1,i))];if(S)apply(t,S)}}catch(e){console.error(e)}const r=_g.apply(this,arguments);
  /* flag tags are added while the stop is drawn: plain labels that repeat them go afterwards */
  try{if(S&&MINE.has(cur())&&flagDup(S)&&typeof psDrawPins==="function")psDrawPins()}catch(e){}return r};psGo._gfS3=1;return true}
/* wrapped after geoflock-polish-m.js has wrapped it, so these run first and its fixes still follow; checked again later in case
   a later script replaced psGo without keeping the wrapper */
let n=0;const t=setInterval(()=>{wrapGo();if(++n>80)clearInterval(t)},700);
/* text: also written into the tour data straight away, so lists, search and quizzes that read the cards see it */
function textAll(){try{for(const k in P){const X=P[k],i=k.indexOf("|"),T=PS_TOURS[k.slice(0,i)];if(!T)continue;
 const S=(T.steps||[]).find(s=>s&&s.title===k.slice(i+1));if(S)text(S,X)}}catch(e){}}
[0,1500,4000,9000,15000].forEach(ms=>setTimeout(textAll,ms));
/* "Now explore" cards whose text began with the very sentence their stat line had just said */
const HOVER="Hover any country to see its name and neighbours. ";
function nowExplore(){try{["transport","resources","explorers","hasia","heurope","hafrica","hnamerica","hsamerica","hoceania","hantarctica","hancient","hempires","hmodern"].forEach(t=>{
 const T=PS_TOURS[t];if(!T)return;(T.steps||[]).forEach(S=>{if(S&&S.title==="Now explore"&&typeof S.body==="string"&&S.body.startsWith(HOVER)&&String(S.stat||"").startsWith("Hover any country"))SET(S,"body",S.body.slice(HOVER.length))})})}catch(e){}}
[0,1500,4000,9000,15000].forEach(ms=>setTimeout(nowExplore,ms));

/* ================================ Power & economy ================================ */

/* ---- How countries are run ---- */
Object.assign(P,{
 /* China is the third or fourth largest country, depending on how its borders and the US’s waters are counted */
 "govmap|Big countries split power":{re:[["body","China, the third-largest country, is run as one unit from Beijing.","China, about as big as the United States, is run as one unit from Beijing."]]},
});
/* ---- International relations ---- */
Object.assign(P,{
 /* “its land border”: NATO’s, not Finland’s own */
});
/* ---- Capital cities ---- */
Object.assign(P,{
 /* the card's own photo of the Capitol, again as a pin beside the Washington Monument photo */
 "capitals|Washington, D.C.":{phDrop:/^Washington, D\.C\.$/},
 /* the card's stadium photo again as a pin, beside the cathedral */
 /* the ruler on the map reads 363 km */
 "capitals|Kyoto, never formally replaced":{re:[["body","about 370 km away (the ruler)","about 360 km away (the ruler)"]]},
 "capitals|Brasília: built in 41 months":{phDrop:/^Brasília$/},
});
/* ---- Borders ---- */
Object.assign(P,{
 /* a stop about today's borders shown on the map of 1935, where northern Morocco is coloured as Spain's */
 "borders|The shortest borders":{sub:"2026"},
});
/* ---- Special regions ---- */
Object.assign(P,{
 /* the map was centred on Canada, with Greenland squeezed against the top edge: now Greenland, Iceland, the Faroes and
    Denmark itself; the card no longer says the size twice */
 "regions|Denmark’s far north":{stat:"Greenland is about 50 times bigger than Denmark, yet only about 57,000 people live there",
  re:[["body","Drag Denmark around Greenland: Greenland is about 50 times bigger, with about 57,000 people.","Drag Denmark’s outline around Greenland to compare their sizes."]],view:[-78,54,22,84],globe:[-28,68,1.6]},
 /* Puerto Rico, about 3.2 million people, outnumbers 18 states (Nevada and Iowa are a little bigger) */
 "regions|America’s islands":{re:[["body","Puerto Rico alone has more people than 20 US states.","Puerto Rico alone has more people than 18 of the 50 US states."]]},
});
/* ---- Geopolitics ---- */
Object.assign(P,{
 /* the east bank of the Mississippi was already American in 1803: the purchase added New Orleans and the west of the basin */
 "geopol|The luckiest country":{re:[["more","it gave the young country the whole Mississippi basin and New Orleans.","it gave the young country New Orleans and the western half of the Mississippi basin, so the whole river system was American."]]},
});
/* ---- Energy of the world ---- */
Object.assign(P,{
 /* “Its reservoir…” followed the sentence about the Tibet project, so it seemed to be about that one */
 "energy|Three Gorges":{more:"It also holds back floods and lets big ships sail far inland through locks and a giant ship lift. Its reservoir holds so much water that a NASA geophysicist calculated it makes each day about 0.06 millionths of a second longer. In 2025 China began building an even bigger hydropower project on the Yarlung Tsangpo in Tibet."},
});
/* ---- Energy and resources ---- */
Object.assign(P,{
 /* “the white powder made from bauxite”: named, so the “Alumina by sea” label makes sense */
 "resources|Frozen electricity":{re:[["body","So it is cheaper to ship the white powder made from bauxite ore across the world (the arrow shows one route) to where power is cheap.","So it is cheaper to ship alumina, the white powder refined from bauxite ore, across the world (the arrow shows one route) to where power is cheap."]]},
 "resources|America pumps the most":{phDrop:/^United States: Grand Canyon$/},
 "resources|China and coal":{phDrop:/^(India: Taj Mahal|Indonesia: Borobudur)$/,
  phAdd:[{at:[112.43,39.33],label:"Shuozhou, Shanxi: a coal power plant",f:"Shuozhou coal power plant.JPG"}]},
 /* a rainforest photo standing on the copper mines of Katanga */
 "resources|Congo’s cobalt":{phDrop:/Congo rainforest/},
 "resources|Gold":{phDrop:/^South Africa: Table Mountain/},
 "resources|Rare earths aren’t rare":{phDrop:/^China: Great Wall/},
 "resources|Phosphate":{phDrop:/^Morocco: Chefchaouen$/},
});
/* ---- Money on the map ---- */
Object.assign(P,{
 /* the opening map was the world of AD 200, with photos of Wall Street and Hong Kong on it: today's map instead */
 "currencies|Money on the map":{sub:"2026"},
 /* the Bank of England's own map: 1715, Great Britain, rather than 1700, where a “United Kingdom” label sat on the
    separate kingdoms of England and Scotland */
 "currencies|The pound sterling":{sub:"1715"},
 /* Panama City twice on one spot */
 "currencies|Dollarisation":{phDrop:/^Panama City$/},
 /* the map of 1919 still drew the Austro-Hungarian Empire: 1925, the Germany of the hyperinflation */
 "currencies|Germany, 1923":{sub:"1925"},
});
/* ---- Conflicts and peace ---- */
Object.assign(P,{
 /* today's missions (South Sudan, the Central African Republic, Kosovo) were labelled on the colonial map of 1950 */
 "conflicts|Blue helmets":{sub:"2026"},
 /* the map of 1945 has no Pakistan, yet a “Pakistan” label pointed into British India: today's map */
 "conflicts|Kashmir":{sub:"2026"},
 /* the Bakassi peninsula sat on the bottom edge of the map */
 "conflicts|Settled in court":{view:[-25,-7,22,56]},
 /* the arrows' labels piled up over Europe and the Middle East on a whole-world map: Colombia to Iran, a little closer */
 "conflicts|Refugees: where people go":{view:[-95,-25,80,62]},
});
/* ---- GDP ---- */
Object.assign(P,{
 /* an Afghan lake on the opening world map of economies */
 "gdp|The world’s money map":{phDrop:/Band-e Amir/},
 "gdp|China’s rise":{phDrop:/^China: Great Wall/},
 /* “…and the Pacific islands, including the Caucasus and Central Asia” read as if the Caucasus were Pacific islands */
 "gdp|The Global South":{re:[["body","South of it: Latin America, Africa, most of Asia (North Korea too) and the Pacific islands, including the Caucasus and Central Asia.","South of it: Latin America, Africa, the Pacific islands and most of Asia, including the Caucasus, Central Asia and North Korea."]]},
 "gdp|Rich in resources, poor in income":{phDrop:/^DR Congo: The Congo rainforest$/},
});
/* ---- Transport and trade ---- */
Object.assign(P,{
 "transport|The Belt and Road":{phDrop:/^China: Great Wall/},
 "transport|China’s fast trains":{phDrop:/^China: Great Wall/},
 /* the route runs from Hong Kong over Alaska to Memphis, but the map stopped at Alaska, with Anchorage on its edge:
    now the whole North Pacific, across the date line */
 "transport|Planes stop in Alaska":{view:[100,10,-78,72],globe:[-165,50,1.3]},
});

/* ================================ History ================================ */

/* ---- Ancient civilisations ---- */
Object.assign(P,{
 /* it pointed to Empires and independence, a tour that is no longer on any shelf: the next tour is Medieval empires */
 /* Rosetta, on the coast, was hidden under the year at the top of the map */
 "hancient|Egypt and the pyramids":{view:[24,20,40,35]},
 "hancient|Now explore":{body:"Then take the Medieval empires tour, which picks up the story from about 500 AD."},
});
/* ---- Medieval empires ---- */
Object.assign(P,{
 /* places on the edge of the map: Kaifeng (top), Jerusalem (right corner), Lalibela (bottom), Novgorod (right) */
 "hmedieval|Rice from Champa":{view:[96,8,126,40.5]},
 "hmedieval|The Crusades":{view:[-12,25,50,56]},
 "hmedieval|Churches carved down into rock":{view:[22,4,52,36]},
 "hmedieval|Letters on birch bark":{view:[0,50,42,66]},
});
/* ---- Revolutions and industry ---- */
Object.assign(P,{
 /* Fortune set out in 1848; the plants left China over the next three years */
 /* Boston on the top edge; Hong Kong and Shanghai on the right edge; Africa pushed right, with Brazil in view */
 "hrevolutions|American independence":{view:[-85,33,-64,46]},
 "hrevolutions|The Opium Wars":{view:[60,-2,130,42]},
 "hrevolutions|The Scramble for Africa":{view:[-22,-36,55,38]},
 "hrevolutions|The great tea theft":{stat:"From 1848 a Scottish botanist, disguised as a Chinese official, smuggled about 20,000 tea plants out of China"},
});
/* ---- The World Wars ---- */
Object.assign(P,{
 /* unemployment rose to about a quarter by 1933; it did not happen at once in 1929 */
 /* places on the map's edges or under its year: Ypres, Ankara, Finland, Brest and Madrid, Germany and Italy, Auschwitz */
 "hwars|The Western Front":{view:[-4,45.5,12,54.5]},
 "hwars|A new Middle East":{view:[15,12,58,45.5]},
 "hwars|Four empires fall":{view:[-18,34,42,70]},
 "hwars|Why “Spanish” flu?":{view:[-135,-12,15,62]},
 "hwars|The Holocaust":{view:[13,46,29.5,55.73]},
 /* the Italian Empire's colour made the map zoom out to all of Africa: El Alamein's 60 km gap again */
 "hwars|The line that couldn’t be outflanked":{fn:S=>{S._histWide=1}},
 "hwars|Crash and dictators":{view:[-130,5,35,75],stat:"After the Wall Street Crash of October 1929, unemployment in the US climbed to about one worker in four by 1933"},
});
/* ---- Europe ---- */
Object.assign(P,{
 /* the Brussels photo stood near Wavre, and a fairy-tale castle had nothing to do with coal: the Ruhr's great colliery instead */
 /* the empire's colour made the History map zoom out to the whole world: Napoleon's Europe and the Ottomans at Vienna
    stay on Europe */
 "heurope|Napoleon’s Europe":{fn:S=>{S._histWide=1}},
 "heurope|The Turks at Vienna":{fn:S=>{S._histWide=1}},
 /* places at the top or right edge, under the map's year: the Altar Stone's Scotland, Florence, Bergen and Novgorod */
 "heurope|Europe’s first artists":{view:[-14,42,10,61]},
 "heurope|The Renaissance":{view:[4.5,35.6,20.5,50]},
 "heurope|The Hanseatic League":{view:[-12,46,40,65]},
 "heurope|Coal, rivers and ports":{phDrop:/^(Belgium: Grand-Place, Brussels|Germany: Neuschwanstein Castle)$/,
  phAdd:[{at:[7.04,51.49],label:"Zollverein colliery, the Ruhr",f:"Zollverein Coal Mine, Essen.jpg"}]},
});
/* ---- Asia ---- */
Object.assign(P,{
 /* country postcards that had nothing to do with the stop */
 /* the stat names Spain, which was off the left edge; Java sat on the bottom-right corner */
 "hasia|Islam’s rapid spread":{view:[-12,-12,128,50]},
 /* photos and labels at the top edge sat under the map's year (Lumbini, Fergana) */
 "hasia|Buddhism spreads":{view:[60,-14,145,54]},
 "hasia|The Mughals":{view:[56,5,98,45.5]},
 "hasia|Angkor":{phDrop:/^(Thailand: Wat Arun, Bangkok|Laos: Kuang Si Falls)$/},
 "hasia|Gandhi and the princes":{phDrop:/^(India: Taj Mahal|Pakistan: K2)$/},
 "hasia|The Vietnam War":{phDrop:/^(Vietnam: Ha Long Bay|Cambodia: Angkor Wat)$/},
 "hasia|1979: a turning year":{phDrop:/^(Iran: Naqsh-e Jahan Square, Isfahan|Afghanistan: Band-e Amir lakes)$/},
});
/* ---- Africa ---- */
Object.assign(P,{
 /* the Meroë pyramids twice on one spot */
 /* the 1914 empires' colours made the opening map zoom out to the Atlantic and South America */
 "hafrica|Africa’s history":{fn:S=>{S._histWide=1}},
 /* photos at the top edge sat under the map's year (Aswan, the Alps, Oman), Zanzibar on the bottom edge */
 "hafrica|Kush against Rome":{phDrop:/^Sudan: Pyramids of Meroë$/,view:[22,12,42,29.5]},
 "hafrica|Carthage against Rome":{view:[-10,27,28,50.5]},
 "hafrica|The Swahili coast":{view:[25,-18,80,32]},
 "hafrica|Two Benins":{phDrop:/^Nigeria: Zuma Rock$/},
 /* the stop quotes Nkrumah: Ghana's independence stamp with his portrait */
 "hafrica|Freedom, one by one":{phAdd:[{at:[-0.2,5.6],label:"Kwame Nkrumah on Ghana’s 1957 stamp",f:"KwameNkrumahOnGhanianIndependenceDay6March1957PostageStamp.JPG"}]},
 "hafrica|Apartheid’s fake countries":{phDrop:/^South Africa: Table Mountain/},
});
/* ---- North America ---- */
Object.assign(P,{
 /* the empire's colour (Spain, Britain, the US) made the History map zoom out to the whole world; these stops stay on
    their own region */
 "hnamerica|Spain in the US":{fn:S=>{S._histWide=1}},
 "hnamerica|Thirteen colonies":{fn:S=>{S._histWide=1}},
 "hnamerica|Coast to coast by rail":{fn:S=>{S._histWide=1}},
 /* Columbus's landing and portrait sat under the year at the top edge */
 "hnamerica|The Taíno meet Columbus":{view:[-88,13,-62,29.5]},
 "hnamerica|Cahokia":{phDrop:/^United States: Grand Canyon$/},
 "hnamerica|The Taíno meet Columbus":{phDrop:/^(Cuba: Viñales Valley|Haiti: Citadelle Laferrière)$/},
});
/* ---- South America ---- */
Object.assign(P,{
  /* the grass rope bridge the text describes */
 "hsamerica|The Inca roads":{phAdd:[np("qeswachaka",[-71.4,-14.38],"Q’eswachaka: a grass rope bridge")]},
 /* Caracas, where Bolívar's march began, sat on the top edge with its label cut off */
 "hsamerica|The liberators":{view:[-90,-47,-46,17]},
 "hsamerica|Caral":{phDrop:/^Peru: Machu Picchu$/},
 "hsamerica|The Nazca lines":{phDrop:/^Peru: Machu Picchu$/},
 /* Rio twice on one spot */
 "hsamerica|Brazil’s sugar coast":{phDrop:/^Brazil: Christ the Redeemer/},
 "hsamerica|The Paraguayan War":{phDrop:/^(Brazil: Christ the Redeemer, Rio|Paraguay: Jesuit mission of Trinidad)$/},
 "hsamerica|Bolivia loses the sea":{phDrop:/^Bolivia: Sunset on the Salar de Uyuni$/},
 "hsamerica|Years of military rule":{phDrop:/^(Argentina: Perito Moreno Glacier|Bolivia: Sunset on the Salar de Uyuni|Brazil: Christ the Redeemer, Rio)$/,
  phAdd:[{at:[-58.37,-34.61],label:"Mothers of the Plaza de Mayo, Buenos Aires",f:"La Asociación Madres de Plaza de Mayo Línea Fundadora recibe el título de Honoris Causa de la UNLP.jpg"}]},
 "hsamerica|The Falklands War":{phDrop:/^Argentina: Perito Moreno Glacier$/},
});
/* ---- Oceania ---- */
Object.assign(P,{
 /* the British Empire's colour made the History map zoom out to the whole world; the stop is about New Zealand and
    Australia's east coast */
 "hoceania|Tupaia and Captain Cook":{fn:S=>{S._histWide=1}},
 /* the new nations shown on the map of 1955, under the label of the British Western Pacific Territories: now 1995 */
 "hoceania|New Pacific nations":{sub:"1995"},
 "hoceania|Women vote first":{phDrop:/^(Australia: Sydney Opera House|Finland: Northern lights over Lapland)$/,
  phAdd:[{at:[172.63,-43.53],label:"Kate Sheppard memorial, Christchurch",f:"Kate Sheppard National Memorial, Christchurch, New Zealand.jpg"}]},
 /* Tupaia's own chart of the islands round Tahiti, at Raiatea, his home island */
 "hoceania|Voyagers of the open Pacific":{phAdd:[np("tupaia",[-151.45,-16.8],"Tupaia’s chart of the islands, 1769")]},
 "hoceania|Federation":{phDrop:/^(Australia: Sydney Opera House|New Zealand: Aoraki \/ Mount Cook)$/},
 "hoceania|The Anzac legend":{phDrop:/^Australia: Sydney Opera House$/},
});
/* ---- Antarctica ---- */
Object.assign(P,{
 /* the globe faced Africa and South America, and Antarctica, the subject, was out of sight below them */
 "hantarctica|A continent for science":{globe:[10,-58,1]},
 /* the 2025 core was said twice, in the stat and again in the text */
 "hantarctica|Reading the ice":{re:[["more","The cores show that carbon dioxide is now far higher than at any time in the last 800,000 years, and in 2025 a new core reached ice over a million years old.","The older cores already show that carbon dioxide is now far higher than at any time in the last 800,000 years; the new one will take the record further back."]]},
});
/* ---- The world since 1991 ---- */
Object.assign(P,{
 /* the map was centred on southern China with Taiwan squeezed on its right edge; the ruler on the map reads 145 km */
 "hsince91|The chip island":{view:[110,17,134,31],re:[["body","about 150 km across the strait from mainland China","about 145 km across the strait from mainland China"]]},
 /* Vukovar under the year; Mosul under the year and Basra on the corner; the pirates' route to Suez and Tunisia's
    Sidi Bouzid off the top edge */
 "hsince91|Yugoslavia breaks apart":{view:[6,38,24,49.5]},
 "hsince91|The Iraq War":{view:[30,26,52,40.5]},
 "hsince91|Pirates of the Gulf of Aden":{view:[24,-4,70,33]},
 "hsince91|The Arab Spring":{view:[-18,6,56,42]},
});
/* ---- Explorers ---- */
/* ---- Gunpowder and sea; World Wars; Cold War; since 1991 ---- */
Object.assign(P,{
 /* Vienna under the year at the top; Tenochtitlan and Machu Picchu on the top and bottom edges; Potosí, where the
    galleons' silver came from, off the right edge */
 "hgunpowder|The Ottomans at their height":{view:[-20,10,55,56]},
 "hgunpowder|Aztecs and Inca fall":{view:[-115,-25,-50,30]},
 "hgunpowder|Silver and the Manila galleons":{view:[20,-40,300,55]},
 /* Tokugawa Japan's colour made the map zoom out to Mongolia and the Pacific */
 "hgunpowder|Japan closes its doors":{fn:S=>{S._histWide=1}},
 "hgunpowder|Russia across Siberia":{phAdd:[np("yermak",[68.4,58.1],"Yermak takes Sibir, 1582 (painted 1895)")]},
 "hwars|Gallipoli":{phAdd:[np("kemal",[26.75,40.5],"Mustafa Kemal at Gallipoli, 1915",{person:1})]},
 /* NATO's two founders across the Atlantic, the US and Canada, were off the left edge */
 "hcoldwar|NATO and the Warsaw Pact":{view:[-130,22,62,76]},
 /* Lahore under the year; Beijing on the right edge with the Middle East filling the map */
 "hcoldwar|Partition of India":{view:[55,5,100,40]},
 "hcoldwar|China’s revolution":{view:[70,5,142,55]},
 /* the empires' and the Soviet colour made these maps zoom out to the whole world */
 "hcoldwar|The Year of Africa":{fn:S=>{S._histWide=1}},
 "hcoldwar|The uranium from Congo":{fn:S=>{S._histWide=1}},
 "hcoldwar|The end of the Soviet Union":{fn:S=>{S._histWide=1}},
 /* Gorbachev on television on 25 December 1991, resigning as the last Soviet leader */
 "hcoldwar|The end of the Soviet Union":{phAdd:[np("gorbachev",[47,59],"Mikhail Gorbachev resigns, 25 December 1991",{person:1})]},
 "hcoldwar|The Iron Curtain":{phAdd:[np("churchill",[-0.13,51.5],"Winston Churchill",{person:1})]},
 "hsince91|Giving up the bomb":{pinsDrop:/^Pervomaisk/,phAdd:[np("pervomaisk",[31.0,48.05],"Pervomaisk: a missile base, now a museum")]},
});
Object.assign(P,{
 /* Lewis and Clark never went near the Grand Canyon */
 "explorers|Lewis and Clark":{phDrop:/^United States: Grand Canyon$/},
 /* Hawaii, Tahiti and Rapa Nui were squeezed onto the left edge of a world map centred on Africa: the Pacific instead */
 "explorers|Sailing by the stars":{view:[140,-50,-70,32]},
 /* Marseille's statue of Pytheas sat on the bottom edge; Chang'an, where Zhang Qian set out, on the right edge */
 "explorers|The man nobody believed":{view:[-35,34,25,72]},
 "explorers|The envoy who opened the Silk Road":{view:[35,18,130,55]},
});
/* ---- Empires and independence, Modern history (overview tours, not on a shelf) ---- */
Object.assign(P,{
 "hempires|India’s independence":{phDrop:/^(India: Taj Mahal|Pakistan: K2|Bangladesh: The Sundarbans)$/},
 /* the Hungarian Parliament photo stood 50 km south of Budapest */
 "hmodern|World War I":{phDrop:/^(Germany: Neuschwanstein Castle|Hungary: The Hungarian Parliament|Turkey: Hagia Sophia)/},
 "hmodern|The nuclear age begins":{phDrop:/^Japan: Mount Fuji$/},
 "hmodern|China since 1949":{phDrop:/^China: Great Wall/},
 "hmodern|The closest call":{phDrop:/^Cuba: Viñales Valley$/},
 "hmodern|From six to 27":{phDrop:/^(Belgium: Grand-Place, Brussels|Italy: Colosseum)$/},
 "hmodern|The end of apartheid":{phDrop:/^South Africa: Table Mountain/},
 "hmodern|After 9/11":{phDrop:/^(Afghanistan: Band-e Amir lakes|Iraq: Ziggurat of Ur)$/},
});
window.gfSweep3={apply};
})();
