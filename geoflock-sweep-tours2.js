/* GeoFlock tour sweep 2: the People & culture and Ideas & arts shelves, stop by stop.
   Tours: cities, migration, people, culture, langrel, food, sports, musicsport, festivals, houses, landmarks, flags,
   art, music, literature, philosophy, mythology, science, maths, psychology, inventions, words, learning.
   Each entry is keyed "tour|stop title" and is applied when the stop is shown (psGo is wrapped, as in
   geoflock-polish-m.js), so it wins over the tour files and the earlier patch files. Fields:
     body / stat / more / sub      card text
     view / globe / mode / on / card / hi / hiSoft / lines / legend / keyLabel / iconPins / gfRuler   set as given
     pins       the stop's map labels, replaced;   pinsDrop: RegExp of labels to drop;   pinsAdd: labels to add
     pinsMove   {label:[lon,lat]} to move a label
     phDrop     RegExp of photo-pin labels to drop;   phAdd: photo pins to add ({at,label,f,d,by,lic,page});
     phMove     {label:[lon,lat]} to move a photo pin;   phLabel {old:new} to rename one
     phDup      true: of photo pins with the same label, keep only the one with a picture
     iconDrop   true (all icon pins) or a RegExp of icon names
     fn(S)      anything else */
(function(){
"use strict";
const SET=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};
const CL=v=>v==null?v:JSON.parse(JSON.stringify(v));
function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f);
 if(i<0){PS_PHOTO_DATA.push({f:x.f,d:x.d,by:x.by,lic:x.lic,page:x.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
const has=q=>!!(q&&(q._f||q.img!=null&&q.img>=0||q._gfImg!=null));
const lab=q=>Array.isArray(q)?String(q[1]||""):String(q&&q.label||"");
const P={};
/* coloured groups of countries with their own key (S.G), for stops whose map layer (a language family or script "sub")
   does not draw on the History map the tour runs on; hi lists the same countries */
const grp=(key,G)=>({keyLabel:key,G,hi:[].concat(...G.map(g=>g.codes)),hiSoft:[]});
window.GF_SWEEP2=P;
/* entries are merged, so one stop can be touched in several places below */
const M=o=>{for(const k in o)P[k]=Object.assign(P[k]||{},o[k])};
const KEYS=["body","stat","more","sub","G","view","globe","mode","on","card","hi","hiSoft","lines","legend","keyLabel","iconPins","gfRuler","pins","flatView","flagAt"];
function photos(S,X){
 /* photo pins: the stop's own list, less the dropped ones, plus ours; kept whatever other scripts set the list to later */
 const mine=(X.phAdd||[]).map(x=>{const i=libAdd(x);return{at:x.at,label:x.label,col:x.col||"#d9682b",icon:"photo",_f:x.f,img:i}});
 const fix=L=>(Array.isArray(L)?L:[]).filter(q=>q&&!(X.phDrop&&X.phDrop.test(lab(q)))&&!mine.some(m=>m.label===q.label)).map(q=>{
   if(X.phMove&&X.phMove[q.label]){q=Object.assign({},q,{at:X.phMove[q.label].slice()})}
   if(X.phLabel&&X.phLabel[q.label]){q=Object.assign({},q,{label:X.phLabel[q.label]})}return q})
  .filter((q,i,A)=>!X.phDup||!A.some((o,j)=>j!==i&&o.label===q.label&&(has(o)&&!has(q)||has(o)===has(q)&&j<i))).concat(mine);
 if(S._gfS2p){(X.phAdd||[]).forEach(libAdd);return}S._gfS2p=1;
 /* a renamed pin keeps its picture: pictures are looked up by label (PS_SQ_IMG), so the new label gets the old one's */
 const relink=b=>{if(!X.phLabel)return;try{const M=window.PS_SQ_IMG=window.PS_SQ_IMG||{};(Array.isArray(b)?b:[]).forEach(q=>{const nl=q&&X.phLabel[q.label];if(!nl||M[nl]!=null)return;
  const v=M[q.label]!=null?M[q.label]:q.img!=null&&q.img>=0?q.img:q._gfImg;if(v!=null)M[nl]=v;try{if(typeof GF_SQ_FILE!=="undefined"&&GF_SQ_FILE[q.label]&&!GF_SQ_FILE[nl])GF_SQ_FILE[nl]=GF_SQ_FILE[q.label]}catch(e){}})}catch(e){}};
 const d=Object.getOwnPropertyDescriptor(S,"phPins");let base=d&&("value" in d)?d.value:S.phPins;let cache=null,ck=null;
 const get0=d&&d.get?d.get.bind(S):null,set0=d&&d.set?d.set.bind(S):null;
 try{Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,
  get(){const b=get0?get0():base;if(ck!==b||!cache){ck=b;cache=fix(b)}relink(b);reg(cache);return cache},
  set(v){if(set0)set0(v);else base=v;ck=null}})}catch(e){}
 /* (no forced re-prune: the app's pruner drops any photo pin whose label has no picture registered; reg() registers them) */}
/* every photo pin kept or added here has its picture registered under its label (PS_SQ_IMG), which is what the app's
   pin pruner (psSqPrune) and the pin drawing look up */
function reg(L){try{if(typeof PS_PHOTO_DATA==="undefined")return;const M=window.PS_SQ_IMG=window.PS_SQ_IMG||{};(L||[]).forEach(q=>{if(!q||!q.label||M[q.label]!=null)return;
 let v=q.img!=null&&q.img>=0?q.img:q._gfImg!=null?q._gfImg:null;let f=q._f;try{if(!f&&typeof GF_SQ_FILE!=="undefined")f=GF_SQ_FILE[q.label]}catch(e){}
 if(v==null&&f){const i=PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d);if(i>=0)v=i}if(v!=null)M[q.label]=v})}catch(e){}}
/* The Religions and Languages tours were built for the Culture map, but geoflock-tourhist.js moved every stop of a tour
   with any History-map stop onto the History map, where the Culture map's layers (religion, language family, script)
   are not drawn: "each country is coloured by its largest religion" showed plain political colours. Such a stop now
   colours its countries from the Culture map's own data (TH_THEMES), as key groups (S.G), the way the History map shows
   any tour highlight. A focus ("rel/cat", "lang/ger+rom") colours only those groups; "_" keeps the stop's own highlight. */
const TH_TOURS=new Set(["culture","langrel"]);
function thAuto(tour,S,X){try{if(!TH_TOURS.has(tour)||!S||!S.sub||(X&&X.G))return;const m=String(S.sub).match(/^(rel|lang|script|drive)(?:\/(.+))?$/);if(!m||m[2]==="_")return;
 const T=PS_TOURS[tour];if(T&&T.map&&T.map.mode==="culture"&&(S.mode||"culture")==="culture")return;
 const key=m[1],th=typeof TH_THEMES!=="undefined"&&TH_THEMES[key];if(!th||!th.cats)return;
 const want=m[2]?m[2].split("+"):th.cats.map(c=>c[0]);const all=typeof COUNTRY_POPULATION!=="undefined"?Object.keys(COUNTRY_POPULATION):Object.keys(th.data||{});
 const of=c=>{try{return typeof thCatOf==="function"?thCatOf(c,key):th.data[c]||th.fallback}catch(e){return null}};
 const G=[];want.forEach(k=>{const row=th.cats.find(c=>c[0]===k);if(!row)return;const codes=all.filter(c=>of(c)===k);if(codes.length)G.push({t:row[1],c:row[2],codes})});
 if(!G.length)return;SET(S,"G",G);SET(S,"hi",[].concat(...G.map(g=>g.codes)));SET(S,"hiSoft",[]);
 if(!S.keyLabel||S.keyLabel==="undefined")SET(S,"keyLabel",m[2]&&G.length===1?G[0].t:th.title||"")}catch(e){console.error(e)}}
/* Better still, the two tours go back on the Culture map they were built for: the stops about religions, languages and
   scripts show its layers (with their focus: Catholics only, the Uralic family only...), and only the stops that are
   really about an empire of the past (AD 300, AD 800, 1783) use the History map. Without this the History map stayed
   at the year of the last history stop, so "Catholicism moved west" showed the Abbasid Caliphate and the Khazars. */
const TH_RE=/^(rel|lang|script|drive)(\/|$)/;
const TH_RELIEF={"culture|Iceland can still read its sagas":"lang","culture|Whistling across the valleys":"lang"};
function thFix(id){try{const T=PS_TOURS[id];if(!T||!TH_TOURS.has(id))return;try{if(window.gfTourHist)gfTourHist.convert(T)}catch(e){}
 if(T.map)T.map.mode="culture";T.stopModes=true;(T.steps||[]).forEach(S=>{if(!S)return;const k=id+"|"+S.title;
  if(TH_RELIEF[k]){SET(S,"mode","culture");SET(S,"sub",TH_RELIEF[k]);return}
  if(S.sub&&TH_RE.test(String(S.sub))&&S.mode!=="culture"&&S.mode!=="politics")SET(S,"mode","culture");
  /* a bare year ("800") is what geoflock-tourhist.js gives a stop it moved: the real History stops name an empire too ("800/isl") */
  else if(S.mode==="history"&&/^(bc)?\d+$/.test(String(S.sub||""))){SET(S,"mode","culture");SET(S,"sub",id==="langrel"?"rel":"lang")}})}catch(e){console.error(e)}}
[2000,6000,13000].forEach(ms=>setTimeout(()=>TH_TOURS.forEach(thFix),ms));
{let n=0;const t=setInterval(()=>{if(typeof psLaunchTour!=="function"){if(++n>60)clearInterval(t);return}clearInterval(t);if(psLaunchTour._gfS2)return;const _l=psLaunchTour;
 psLaunchTour=function(id){try{thFix(id)}catch(e){}return _l.apply(this,arguments)};psLaunchTour._gfS2=1},500)}
function apply(tour,S){if(TH_TOURS.has(tour))thFix(tour);const X=P[tour+"|"+S.title];thAuto(tour,S,X);if(!X)return;
 try{KEYS.forEach(k=>{if(k in X)SET(S,k,CL(X[k]))});
  if(X.pinsDrop||X.pinsAdd||X.pinsMove){let L=(Array.isArray(S.pins)?S.pins:[]).filter(q=>!(X.pinsDrop&&X.pinsDrop.test(lab(q))));
   if(X.pinsMove)L=L.map(q=>Array.isArray(q)&&X.pinsMove[q[1]]?[X.pinsMove[q[1]].slice()].concat(q.slice(1)):q);
   if(X.pinsAdd)L=L.filter(q=>!X.pinsAdd.some(a=>a[1]===lab(q))).concat(CL(X.pinsAdd));SET(S,"pins",L)}
  if(X.iconDrop&&Array.isArray(S.iconPins))SET(S,"iconPins",X.iconDrop===true?[]:S.iconPins.filter(q=>!X.iconDrop.test(q.icon)));
  if(X.phAdd||X.phDrop||X.phMove||X.phLabel||X.phDup)photos(S,X);
  if(X.rep)rep(S,X);
  if(X.fn)X.fn(S)}catch(e){console.error(e)}}
/* rep: [[old,new],...] small wording fixes inside body/more/stat */
function rep(S,X){["body","more","stat"].forEach(f=>{let v=S[f];if(typeof v!=="string")return;X.rep.forEach(([a,b])=>{if(v.includes(a))v=v.split(a).join(b)});if(v!==S[f])SET(S,f,v)})}
function cur(){try{return typeof ps!=="undefined"&&ps&&ps.tour}catch(e){return null}}
function wrapGo(){if(typeof psGo!=="function"||typeof psSteps!=="function")return false;if(psGo._gfS2)return true;const _g=psGo;
 psGo=function(i){try{const t=cur();if(t){const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];if(S)apply(t,S)}}catch(e){console.error(e)}return _g.apply(this,arguments)};psGo._gfS2=1;return true}
/* wrapped after geoflock-polish-m.js has wrapped it, so these run first and its fixes still follow; checked again later in case
   a later script replaced psGo without keeping the wrapper */
let n=0;const t=setInterval(()=>{wrapGo();if(++n>80)clearInterval(t)},700);
/* text: also written into the tour data straight away, so lists, search and quizzes that read the cards see it */
function text(){try{for(const k in P){const X=P[k],i=k.indexOf("|"),T=PS_TOURS[k.slice(0,i)];if(!T)continue;
 const S=(T.steps||[]).find(s=>s&&s.title===k.slice(i+1));if(!S)continue;["body","stat","more","sub"].forEach(f=>{if(f in X&&S[f]!==X[f])SET(S,f,X[f])});if(X.rep)rep(S,X)}}catch(e){}}
[0,1500,4000,9000,15000].forEach(ms=>setTimeout(text,ms));

/* ================================ People & culture ================================ */

/* ---- Sports ---- */
M({
 "sports|The world’s game":{view:[-125,-58,70,72],stat:"Only eight countries won the first 22 World Cups; Brazil won the most"},
 "sports|The jump into thin air":{stat:"At the 1968 Olympics, 2,240 m up in Mexico City, Bob Beamon long-jumped 8.90 m: 55 cm further than anyone before"},
 "sports|The Olympic map":{more:"Africa’s first Olympic event is the Youth Olympic Games in Dakar, Senegal, held from 31 October to 13 November 2026. Rio de Janeiro, in 2016, is still the only South American host; Brisbane hosts in 2032."},
 /* Hawaii and Tahiti were under the card on a Greenwich-centred world map: a Pacific frame that still reaches Paris */
 "sports|Surfing from Hawaii":{view:[-282,-45,8,64]},
 "sports|Runners from the highlands":{stat:"Every men’s marathon world record set from 2003 to 2023 went to a Kenyan or an Ethiopian"},
});
/* ---- Festivals ---- */
M({
 /* Kiritimati and American Samoa, first and last to midnight, sat at the two edges of a Greenwich-centred map: a frame
    with the date line in view, from Samoa round to Edinburgh */
 "festivals|Hogmanay and the race to midnight":{view:[-300,-45,20,70]},
 "festivals|Welcome back, Sun":{stat:"Longyearbyen goes about four months without the Sun, and celebrates when its rays first touch the old hospital steps, around 8 March"},
 "festivals|The biggest crowd on Earth":{stat:"The 2025 Kumbh Mela at Prayagraj counted over 600 million visits in six weeks: among the largest gatherings in history"},
});
/* ---- Houses ---- */
M({
 /* a Leiden label on a stop about Amsterdam, and two Amsterdam photos on the same spot */
 "houses|The Dutch canal house":{pinsDrop:/^Leiden$/,phDrop:/^Amsterdam$/},
 /* two Hong Kong photos on the same spot */
 "houses|Cities of towers":{phDrop:/^Hong Kong$/},
 "houses|Cities built by their people":{stat:"Over a billion people live in informal settlements: neighbourhoods built by the people who live there, without planning permission or deeds"},
 /* the turf farm the card names, which had only a text label */
 "houses|Houses made of grass":{pinsDrop:/^Glaumbær$/,phAdd:[{at:[-19.51,65.61],label:"Glaumbær: a turf farm, now a museum",col:"#d9682b",f:"Turf houses in Glaumbær open-air museum, Iceland, 20240715 1430 0924.jpg",d:"photos/s2glaumbaer.webp",by:"Jakub Hałun",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:Turf_houses_in_Glaumb%C3%A6r_open-air_museum,_Iceland,_20240715_1430_0924.jpg"}]},
 "houses|Snow houses":{stat:"With a small lamp and body heat, the inside of an igloo can be over 30 °C warmer than the air outside"},
});
/* ---- Landmarks ---- */
const LIB={
 stone1:{f:"Stonehenge from the north.jpg",d:"@057c2846f4914c3f",by:"Sumit Surai",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Stonehenge_from_the_north.jpg"},
 angkor1:{f:"Angkor Wat with its reflection (cropped).jpg",d:"@93cddba34de5857c",by:"Satdeep Gill",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Angkor_Wat_with_its_reflection_(cropped).jpg"},
 liberty1:{f:"View of Liberty Island from the ferry, NYC, 20231003 1607 2000.jpg",d:"@c86b080d4a95faa1",by:"Jakub Hałun",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:View_of_Liberty_Island_from_the_ferry,_NYC,_20231003_1607_2000.jpg"},
 taj1:{f:"Taj Mahal, Agra, India edit2.jpg",d:"@6b923b9f55fdc6c9",by:"Yann; edited by King of Hearts",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India_edit2.jpg"},
};
const ph=(k,at,label,col)=>Object.assign({at,label,col},LIB[k]);
M({
 /* a photo of Big Ben on a Stonehenge stop: the stones themselves instead of the temple icon */
 "landmarks|Stonehenge":{phDrop:/^(United Kingdom: Big Ben|Stonehenge$)/,phAdd:[ph("stone1",[-1.826,51.179],"Stonehenge")]},
 /* the pyramid three times on one spot: icon pin, photo pin and icon */
 "landmarks|The pyramids of Giza":{phDrop:/^(Great Pyramid of Giza|Egypt: Pyramids of Giza)$/,iconDrop:true},
 "landmarks|Angkor Wat":{phDrop:/^Angkor Wat$/,iconDrop:true,phAdd:[ph("angkor1",[103.867,13.4125],"Angkor Wat")]},
 "landmarks|Machu Picchu":{phDrop:/^Machu Picchu$/,iconDrop:true},
 "landmarks|The Taj Mahal":{phDrop:/^Taj Mahal, Agra$/,iconDrop:true,phAdd:[ph("taj1",[78.042,27.175],"The Taj Mahal, Agra")]},
 "landmarks|The Statue of Liberty":{view:[-136,8,16,66],phDrop:/^(Statue of Liberty|United States: Grand Canyon)$/,iconDrop:true,phAdd:[ph("liberty1",[-74.0445,40.6892],"Liberty Island, New York")],
  more:"It travelled in about 350 pieces packed in over 200 crates, and was put back together on its island in New York harbour. The green coating, called a patina, formed as the copper weathered and now protects it, so when officials talked of painting it, people objected. Its full name is “Liberty Enlightening the World”."},
 "landmarks|The Eiffel Tower":{phDrop:/^Eiffel Tower$/,iconDrop:true},
 "landmarks|The tower that leans to survive":{stat:"Pisa’s tower began to lean in 1178, five years into building; the same soft ground has helped it ride out at least four strong earthquakes"},
});
/* ---- Flags ---- */
M({
 /* Iceland's flag, and West Africa's, were under the card */
 "flags|The Nordic cross":{view:[-62,52,40,72]},
 "flags|Pan-African colours":{view:[-75,-36,55,38],more:"Because Ethiopia had kept its freedom, its colours came to stand for independence. A second family uses red, black and green, from Marcus Garvey’s movement in the 1920s: Kenya and Malawi fly those. Bolivia and Lithuania use green, gold and red too, by coincidence."},
 /* Serbia, Slovakia, Slovenia, Croatia and Czechia were under the card, only Russia showed */
 "flags|Pan-Slavic colours":{view:[-35,35,75,66]},
 /* Algeria, Tunisia and Turkey were under the card */
 "flags|The crescent and star":{view:[-90,-15,127,52]},
 /* Malaysia, one of the two flags the card is about, was off the map */
 "flags|Stars and stripes":{view:[-130,-15,125,60]},
 /* Nauru's flag sat on the island itself (a few pixels across): it now floats to the west, over open sea */
 "flags|Flags that are sea charts":{flagAt:{nr:[160.5,-3.2]}},
 /* Guatemala and Haiti were under the card */
 "flags|Weapons on flags":{view:[-150,-38,70,40],card:"left"},
 /* Switzerland and Vatican City, the square flags the card names, had no flag on the map */
 "flags|Not a rectangle":{view:[-75,10,110,60]},
 "flags|Pan-Arab colours":{stat:"Red, white, black and green, the colours of the 1916 Arab Revolt, live on in a dozen flags"},
});

/* ---- Languages and writing ---- */
M({
 /* the language-family and script colours these cards describe did not show (the History map has no such layer):
    the countries are now coloured, with a key */
 "culture|One family of languages":{view:[-75,5,95,68],globe:[30,45,1.2]},
 "culture|Madagascar speaks Bornean":{view:[-25,-34,150,30],globe:[85,-8,1.2]},
 "culture|The Spanish Empire":{stat:"Spanish began in one corner of Spain; its empire carried it across the Americas, and 20 countries now speak it"},
 "culture|Portuguese: the colony outgrew the country":{stat:"Brazil has 20 times as many people as Portugal, so most Portuguese speakers are Brazilian"},
 /* the Armenian alphabet had a picture, the Georgian one none: a Tbilisi street sign in Georgian letters */
 "culture|Two neighbours, two alphabets":{phAdd:[{at:[44.8,41.69],label:"Tbilisi: Georgian letters",col:"#d9682b",f:"Old Street Sign in Tbilisi, Georgia.jpg",d:"@1ca07a2cc676f3f2",by:"AlexandreAssatiani",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:Old_Street_Sign_in_Tbilisi,_Georgia.jpg"}]},
 "culture|Iceland can still read its sagas":{stat:"Icelanders can read their 800-year-old sagas with little help; English speakers need a translation for Chaucer, written 150 years later"},
 "culture|Tones need wet air?":{stat:"Languages with many tones, like Cantonese, are rare in deserts and cold, dry places; linguists argue about why"},
});
/* ---- Religions ---- */
/* the Ethiopian and Nepali years worked out for today's date (Ethiopia's year begins on 11 September, Nepal's in mid-April) */
function calYears(){const d=new Date(),y=d.getFullYear(),m=d.getMonth(),dd=d.getDate();
 return{eth:(m>8||m===8&&dd>=11)?y-7:y-8,nep:(m>3||m===3&&dd>=14)?y+57:y+56,y}}
M({
 /* the key read "undefined" */
 "langrel|Hindu India, Hindu Bali":{view:[-40,-35,185,40],keyLabel:"Where most people are Hindu"},
 "langrel|It isn’t 2026 everywhere":{fn:S=>{const c=calYears();SET(S,"stat","In Ethiopia’s calendar it is now "+c.eth+"; in Nepal’s it is already "+c.nep)}},
 /* the card had no picture of a Tower of Silence: one of the two above Yazd */
 "langrel|Waiting for the vultures":{pinsDrop:/^Yazd, Iran$/,phAdd:[{at:[54.37,31.9],label:"Yazd: a Tower of Silence",col:"#d9682b",f:"Torre del silencio, Yazd, Irán, 2016-09-21, DD 65.jpg",d:"photos/s2yazdtower.webp",by:"Diego Delso",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Torre_del_silencio,_Yazd,_Ir%C3%A1n,_2016-09-21,_DD_65.jpg"}]},
 "langrel|Holy cities":{view:[-48,8,89,52],more:"Millions of pilgrims visit every year: nearly 2 million make the Hajj to Mecca, where only Muslims may enter."},
});
/* ---- Food ---- */
M({
 /* the rice cradle was labelled twice, and wheat and maize had both a label and an icon at the same spot */
 "food|Three grains, three cradles":{pinsDrop:/^(Yangtze: rice|Wheat: the Fertile Crescent|Maize: southern Mexico)$/},
 "food|Milk drinkers’ map":{rep:[["in northern Europe (lit),","in northern Europe (coloured on the map),"]]},
 "food|Maize without the recipe":{stat:"Maize left Mexico without its cooking method, and in the US South a disease spread that struck about 3 million people"},
 /* the "te" countries of western Europe, half of the story, were under the card */
 "food|Tea, or chai?":{view:[-110,-40,142,70],globe:[60,35,1]},
 "food|The Spice Islands":{view:[-119,-40,135,50],hi:["id"],
  body:"The Maluku Islands, the “Spice Islands”, were the only source of cloves, and the tiny Banda Islands the only source of nutmeg. Drag the ruler: the Bandas are about 12,500 km from Venice.",
  more:"Spices passed through many traders’ hands on the way to Europe, growing dearer each time; by some accounts nutmeg was worth more than its weight in gold. The Dutch took the Bandas by force in 1621, killing, enslaving or driving out most of the islanders. In 1667 a peace treaty let the Dutch keep Run, a tiny nutmeg island, while the English kept Manhattan. Black pepper first came from India’s Malabar Coast, but today Vietnam exports the most, about 250,000 tonnes a year."},
});

/* ---- Cities ---- */
M({
 /* the Levant, where most of these cities are, sat under the card: the view is now centred on it, Varanasi still in */
 "cities|The oldest cities":{view:[-12,14,89,47],globe:[40,30,1.5],
  body:"Some cities have been lived in, on and off, since the first farmers. Jericho, Damascus, Aleppo and Byblos, in the Middle East, are among the oldest; Athens and Varanasi, in India, have been lived in for over 3,000 years."},
 "cities|The lowest bridge on the Thames":{stat:"London stands where the Romans could bridge the Thames as close to the sea as possible"},
 "cities|Paris was built from its own underground":{view:[1.0,48.4,3.7,49.3],globe:[2.33,48.85,9],
  stat:"Paris dug its building stone from under its own streets; the old quarries now hold the bones of about 6 million Parisians"},
 "cities|The fall line":{stat:"Trenton, Philadelphia, Baltimore, Washington, Richmond and Augusta all stand on one geological line"},
 /* close enough to see Manhattan, so Midtown and the Downtown towers are two places, not one dot */
 "cities|The bedrock myth":{view:[-74.32,40.62,-73.66,40.86],globe:[-73.99,40.74,40],
  stat:"Manhattan’s skyscrapers skip the stretch between Downtown and Midtown, and guides often blame deep bedrock; economists found that is mostly a myth"},
 "cities|Money cities":{stat:"New York and London are the world’s two biggest money centres"},
 /* the ship icons sat under the Ningbo and Qingdao photos */
 "cities|The busiest ports":{iconDrop:true,
  body:"Shanghai is the busiest of all, handling over 50 million containers a year (counted in TEU: one TEU is one standard 20-foot box). Singapore is second, and Ningbo, Qingdao, Shenzhen, Guangzhou and Tianjin are all in the top ten. The blue shipping lanes on the map link them to the world."},
 /* Monaco and the Vatican were under the card */
 "cities|Countries that are a city":{view:[-62,-12,122,62],globe:[40,25,1]},
 /* the map showed five photos and no numbers: the labels now carry the figures the card gives */
 "cities|Africa’s booming cities":{view:[-36,-36,60,38],globe:[15,5,1.35],
  phLabel:{"Lagos":"Lagos: about 17 million","Kinshasa":"Kinshasa: about 17 million","Cairo":"Cairo: Africa’s biggest city","Dar es Salaam":"Dar es Salaam: 50 million by 2100?"},
  body:"Africa’s cities are growing faster than any others: their populations are young, and people keep moving in from the countryside to find work."},
 "cities|Cities at the extremes":{stat:"Yakutsk’s January averages below −35 °C; Kuwait City’s summer days often pass 45 °C"},
});
/* ---- Migration ---- */
M({
 "migration|America the magnet":{view:[-156,20,-70,53],phDrop:/Grand Canyon/},
 "migration|Mexico to the US":{phDrop:/Grand Canyon/},
 /* Moraine Lake is a fine view, but says nothing about newcomers */
 "migration|Built by newcomers":{phDrop:/^Canada: Moraine Lake/},
 "migration|Nine in ten from abroad":{view:[-13,0,124,42],stat:"In the UAE and Qatar, nearly nine in ten people are foreigners",
  more:"Because most of the workers are men who come alone, the UAE and Qatar have more than two men for every woman, the most lopsided ratios in the world. Indians are the largest group in the UAE, around 3.5 million, though estimates vary. Most foreign workers can never become citizens, however long they stay. Many work under kafala, a system that ties a worker to one employer, the ‘sponsor’; several Gulf states have loosened it in recent years."},
 "migration|India’s diaspora":{stat:"India has the biggest diaspora, about 18 million people, and receives more money from them than any country does",
  body:"In 2024 Indians abroad sent home about $130 billion, a world record. They work as engineers in California, doctors in Britain and builders in the Gulf. (A diaspora is a people scattered far from its homeland.)"},
 /* Chengdu, where the ruler starts, sat under the card */
 "migration|China moves to the cities":{view:[88,18,124,45],globe:[110,31,2.85]},
 /* Warsaw and Berlin were under the card */
 "migration|Ukraine, 2022":{view:[-3,42,35,57],card:"left"},
 "migration|Fleeing Syria":{view:[-10,26,43,58],stat:"Syria’s war, from 2011, drove over 6 million people abroad: one of the largest refugee crises since World War II"},
 "migration|Crossing the Mediterranean":{stat:"From North Africa to Europe can be under 200 km by sea, yet it is one of the world’s deadliest migration routes"},
 "migration|The Philippines works abroad":{stat:"About one Filipino in ten lives or works abroad, as nurses, carers, builders and sailors"},
 "migration|Lebanon’s global family":{stat:"Far more people of Lebanese descent live abroad than in Lebanon itself, perhaps several times more"},
});
/* ---- People ---- */
M({
 "people|Too few to replace":{pinsMove:{"China: about 1.0":[110,27]},stat:"About two in three people live where families are too small to replace their parents"},
 "people|Switzerland, land of newcomers":{
  more:"Most of Switzerland’s newcomers come from elsewhere in Europe, especially Italy, Germany, Portugal and France, drawn by high wages. In the UAE nearly nine in ten people were born abroad, and in Qatar about three in four. At the other extreme, China, India and Indonesia, home to over a third of humanity, have almost no immigrants."},
 "people|Machines, not hands":{stat:"Only about 2 in 100 American workers farm, yet the US grows nearly a third of the world’s maize (corn)"},
 "people|From short to tallest":{stat:"In the mid-1800s Dutch men were shorter than most Europeans; today they are the tallest on Earth, about 1.83 m"},
});

/* ---- Music and sport (not on any shelf at present, kept tidy all the same) ---- */
/* generic country photos (the Grand Canyon, Neuschwanstein, Mount Fuji...) that said nothing about music or sport */
const GENERIC=/^(Brazil: Christ the Redeemer, Rio|Germany: Neuschwanstein Castle|Argentina: Perito Moreno Glacier|United States: Grand Canyon|Japan: Mount Fuji|Dominican Republic: Santo Domingo|Nigeria: Zuma Rock|Kenya: Maasai Mara|Senegal: Gorée Island|Jamaica: Dunn’s River Falls)$/;
M({
 "musicsport|Football conquers the world":{phDrop:GENERIC},
 "musicsport|Three hosts, 48 teams":{phDrop:GENERIC},
 "musicsport|Africa’s first Olympics":{phDrop:GENERIC,stat:"Dakar, in Senegal, hosts the Youth Olympic Games from 31 October to 13 November 2026: the first Olympic event ever held in Africa"},
 "musicsport|Jamaica’s big sound":{phDrop:GENERIC},
 "musicsport|Where baseball went":{phDrop:GENERIC},
 "musicsport|Lagos and Mumbai":{phDrop:GENERIC},
 "musicsport|East Africa’s runners":{phDrop:GENERIC},
});

/* ================================ Ideas & arts ================================ */
/* ---- Art and architecture ---- */
M({
 /* plain labels that sat on top of photo pins of the same places */
 "art|Pyramids and ziggurats":{pinsDrop:/^(Ur|Meroë)$/},
 "art|The Parthenon":{phDrop:/^The Acropolis, Athens$/},
 "art|The Alhambra":{pinsDrop:/^Córdoba$/,phDrop:/^Granada from the Alhambra$/},
 "art|The Forbidden City":{pinsDrop:/^Terracotta Army/,phDrop:/^Forbidden City, Beijing$/},
 "art|Renaissance Florence":{pinsDrop:/^(Venice|Rome: St Peter’s and the Sistine Chapel)$/,phLabel:{"St Peter’s, Rome":"Rome: St Peter’s and the Sistine Chapel"}},
 "art|Mughal style: the Taj Mahal":{pinsDrop:/^Lahore$/,phDrop:/^Agra$/,phLabel:{"Badshahi Mosque, Lahore":"Lahore: the Badshahi Mosque"}},
 "art|Gaudí’s Barcelona":{pinsDrop:/^Casa Batlló$/},
 "art|Skyscrapers":{pinsDrop:/^(New York|Kuala Lumpur|Shibam’s mud towers)$/,phLabel:{"Shibam, Yemen":"Shibam’s mud towers"}},
 /* Edo and Mount Fuji fell off the right-hand edge of the map; now Japan and Paris are both in view, clear of the card */
 "art|The Great Wave":{view:[-110,0,152,74],globe:[70,45,1]},
 "art|Pagodas that dance":{stat:"Japan’s wooden pagodas have stood through centuries of earthquakes; the one at Hōryū-ji is about 1,300 years old"},
 "art|The blue from one valley":{view:[-37,18,74,58],stat:"For centuries Europe’s finest blue paint came from one set of mines in north-east Afghanistan"},
 "art|Dots in the desert":{stat:"One of the world’s best-known art movements began in 1971, with a mural on a school wall in a remote desert settlement"},
});
/* ---- Music ---- */
M({
 "music|Steelpan from Trinidad":{phDup:true},
 "music|Reggae in Kingston":{phDrop:/^Kingston$/},
 "music|Samba and bossa nova":{phDrop:/^Christ the Redeemer, Rio$/},
 "music|Afrobeats from Lagos":{stat:"In 2023 Rema’s ‘Calm Down’ became the first song by an African artist to top a billion plays on Spotify"},
 "music|K-pop":{stat:"South Korea’s ‘Gangnam Style’ was the first YouTube video to reach a billion views, in 2012"},
});
/* ---- Literature ---- */
M({
 "literature|The Tale of Genji":{phDrop:/^Kyoto$/},
 "literature|Dante’s journey":{phDrop:/^Florence$/},
 /* St Petersburg (Dostoevsky) was cut off at the top edge */
 "literature|The great Russian novels":{pinsDrop:/^Moscow$/,view:[12,47.5,46,63.5]},
 "literature|Weeping at the campsite":{body:"In the dry steppes and deserts of Arabia (rusty red and orange on the climate map), Bedouin herders moved with the rains and the grass, so tribes camped together for a season and then went their separate ways. That is why the classical ode, the qasida, opens with the poet at the traces of an old camp, hearth stones half buried in sand, weeping for a beloved whose tribe has moved on. Then he rides off across the desert on his camel."},
 "literature|Homer’s Troy and Ithaca":{body:"The Iliad tells of the Trojan War; the Odyssey follows Odysseus on his ten-year voyage home. The Lotus-eaters, the Cyclops, the bag of winds, the giants who sink eleven of his ships, the witch Circe, the Underworld, the Sirens, Scylla and Charybdis: each danger waits on its own island or strait. He spends seven years on Calypso’s island before the Phaeacians carry him home. A sea full of islands suits such a story: an archipelago is a plot already cut into chapters.",
  stat:"Troy to Ithaca is about 500 km as the crow flies; Odysseus’s way home, as readers have mapped it, is over 5,000 km and takes him ten years"},
});
/* ---- Philosophy ---- */
M({
 "philosophy|Córdoba: reason and revelation":{body:"Ibn Rushd (Averroes, born 1126) and Moses Maimonides (born 1138) both grew up in Córdoba, in al-Andalus, where Muslims, Jews and Christians lived side by side. Both tried to square reason with revelation. Ibn Rushd argued that truth cannot contradict truth, so careful reasoning and the Qur’an must agree; Maimonides, that where the Bible seems to clash with reason, it should be read as a metaphor. The question can’t be avoided when rival scriptures share one city."},
 /* the History map widened this stop to fit the whole Dutch Republic, colonies included: a world map with Amsterdam a dot
    under the card. It stays on the Netherlands (the _histWide flag tells the History map the frame is settled) */
 "philosophy|Amsterdam: a refuge for ideas":{flatView:null,fn:S=>{S._histWide=1}},
 /* Geneva (Rousseau) and Vienna (Wittgenstein) were cut off at the right-hand edge */
 "philosophy|Edinburgh: what can experience teach us?":{view:[-25,43,18,60]},
 "philosophy|Vienna: the limits of language":{view:[-30,44,30,57]},
 "philosophy|Paris: condemned to be free":{view:[-30,35,22,57]},
 "philosophy|Fragmentation: Greece’s many constitutions":{stat:"Aristotle’s school collected 158 constitutions to compare: Greece’s mountains and islands supplied the sample"},
});
/* ---- Mythology ---- */
M({
 /* Ireland, where the legend says the stones came from, was under the card */
 "mythology|Merlin’s stones":{phDup:true,view:[-22,49,4,60.5]},
 /* Uluru has nothing to do with the drowned coasts of this stop */
 "mythology|Stories that remember the sea":{phDrop:/^Uluru$/},
 "mythology|Troy":{rep:[["whose empire is lit on this map","whose empire is coloured on this map"]]},
 "mythology|Where the gods were born":{rep:[["their empire is lit here as it was in 1500","their empire is coloured here as it was in 1500"]]},
 /* Lake Kariba and its dam were half under the card; the lake label now sits on the lake */
 "mythology|The river god and the dam":{view:[17.5,-22,33.5,-12],pinsMove:{"Lake Kariba":[27.9,-17]}},
 "mythology|Mount Kailash":{stat:"Mount Kailash is sacred to four religions, and nobody has ever climbed it"},
});
/* ---- Science ---- */
M({
 "science|Ibn al-Haytham and light":{phDrop:/^Cairo$/,view:[0,20,52,40]},
 /* two photo pins and a label on one spot in Samarkand: the observatory model stays, the label goes */
 "science|Ulugh Beg’s observatory":{pinsDrop:/^Ulugh Beg’s observatory, Samarkand$/,view:[38,30,80,48]},
 /* the stop lost its Padua and Rome pictures to a later clean-up (they stand by the Galileo portrait); they come back
    under their own names, so the card's three places, Padua, Rome and Florence, all show */
 "science|Galileo’s telescope":{pinsDrop:/^Florence$/,phLabel:{"Florence’s cathedral":"Florence: his last years"},phAdd:[
   {at:[11.88,45.41],label:"Padua: his telescopes, 1609",col:"#d9682b",f:"Galileo galilei, telescopi del 1609-10 ca..JPG",d:"photos/xa7cd3dae372cf933.webp",by:"Sailko",lic:"CC BY-SA 3.0",page:"https://commons.wikimedia.org/wiki/File:Galileo_galilei,_telescopi_del_1609-10_ca..JPG"},
   {at:[12.48,41.9],label:"Rome: on trial, 1633",col:"#d9682b",f:"Galileo before the Holy Office - Joseph-Nicolas Robert-Fleury, 1847.png",d:"photos/xd48772b3f9e2ea6e.webp",by:"Joseph-Nicolas Robert-Fleury (1847)",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Galileo_before_the_Holy_Office_-_Joseph-Nicolas_Robert-Fleury,_1847.png"}]},
 "science|Greenwich and longitude":{phDup:true,phDrop:/^Greenwich’s prime meridian$/},
 /* the Galápagos, the subject, were under the card */
 "science|Darwin in the Galápagos":{view:[-112,-10,-76,6]},
 /* the Big Island was half under the card */
 "science|The curve from a volcano":{view:[-163,17.5,-151,23.5]},
 "science|The natural nuclear reactor":{stat:"About 2 billion years ago a natural nuclear reactor started up by itself underground in Gabon, and ran on and off for hundreds of thousands of years"},
});
/* ---- Maths ---- */
M({
 "maths|Counting in sixties":{pinsDrop:/^Babylon$/},
 /* Madhava's coast was at the card's edge */
 "maths|The Kerala school":{view:[63,6,85,15.5]},
 "maths|Eratosthenes measures the Earth":{phDrop:/^The Nile at Aswan$/},
});
/* ---- Psychology: places the cards name, which had no label on the map ---- */
M({
 "psychology|Hokkaido’s frontier":{pinsAdd:[[[142.6,43.5],"Hokkaido: settled in the late 1800s","point"]]},
 "psychology|Winter in Tromsø":{view:[-185,10,45,85],pinsAdd:[[[-82.53,27.34],"Sarasota, Florida: 1.4%","point"]]},
 "psychology|Heat and tempers":{view:[-156,22,-64,50]},
 "psychology|City minds":{view:[-6,52,20,60]},
 "psychology|One soil, two Germanys":{view:[-14,46,24,57]},
});
/* ---- Inventions ---- */
M({
 /* generic country photos (the Great Wall, a Seoul palace, Big Ben) that had nothing to do with the stops */
 "inventions|China’s Four Great Inventions":{phDrop:/^(China: Great Wall of China|South Korea: Gyeongbokgung Palace)$/},
 "inventions|The first vaccine":{view:[-58,-5,73,58],phDrop:/^United Kingdom: Big Ben/},
 "inventions|The first computers":{view:[-147,30,18,60],pinsDrop:/^Berlin: Z3, 1941$/,iconDrop:/^statue$/},
 "inventions|Burrs, bricks and pens":{view:[-27,36,45,68],card:"left",pinsDrop:/^(Switzerland: Velcro|Billund: Lego, 1958|Moscow: Tetris, 1984)$/},
 /* the dry Mediterranean, half the comparison, and western Britain were under the card */
 "inventions|The heavy plough and the furlong":{view:[-40,33,40,64]},
 "inventions|The steam engine":{view:[-16,48,8,59]},
 "inventions|The first bouncing balls":{stat:"About 3,600 years ago people in Mexico were making rubber balls that bounced, some 3,000 years before any European saw rubber"},
});
/* ---- Words ---- */
M({
 "words|Papua New Guinea: 840 languages":{pinsDrop:/^(Goroka|Vanuatu: over 100 languages)$/,phLabel:{"An Asaro mud man":"Goroka: an Asaro mud man","Port Vila, Vanuatu":"Vanuatu: over 100 languages"}},
 "words|England’s place-name layers":{view:[-14,49.8,4,56.2]},
 /* Hawaii, one of the four revivals on the card, was off the map: a Pacific frame with Hawaii, New Zealand, Wales and Israel */
 "words|Endangered and revived":{view:[-200,-50,50,65]},
 "words|Saints and rivers":{pinsDrop:/^Rio de Janeiro$/},
});
/* ---- Learning ---- */
M({
 /* Alexandria and its rival Pergamon both clear of the card */
 "learning|The Library of Alexandria":{view:[-2,22,46,43]},
 /* Xuanzang's route from Chang'an, the start of it, was under the card */
 "learning|Nalanda":{view:[20,4,128,48]},
 /* Hanoi's Temple of Literature and Seoul's Sungkyunkwan were at the edges */
 "learning|Exams for an empire":{view:[64,6,134,46]},
 /* the European end of the paper road (Xàtiva, Fabriano) and Fez were at the card's edge */
 "learning|The road of paper":{view:[-90,-5,124,72]},
 "learning|Al-Qarawiyyin":{view:[-40,24,14,44]},
 "learning|Print, Protestants and reading":{view:[-40,34,32,64]},
 /* Valentia, the cable's Irish end, was cut off at the right */
 "learning|Cables under the sea":{view:[-150,25,25,72]},
 /* Alice Springs was at the card's edge */
 "learning|School by radio":{view:[100,-40,156,-10]},
 /* a picture of the herding life the camel libraries serve: camels with a herder in the Somali lands next door */
 "learning|Libraries on camels":{phAdd:[{at:[41.2,0.8],label:"Camel herders of the north-east",col:"#d9682b",f:"Somali veterinary technician carrying a camel calf in the rural of Xudun district, Sool, Somalia.jpg",d:"@e4f15d381bf9ac4d",by:"Cabdixamiid Xasan Cawad",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Somali_veterinary_technician_carrying_a_camel_calf_in_the_rural_of_Xudun_district,_Sool,_Somalia.jpg"}]},
 /* six miles round Charing Cross was a dot on a map of south-east England: now London fills the map */
 "learning|The Knowledge":{view:[-0.62,51.35,0.32,51.66],globe:[-0.13,51.5,40]},
});
M({
});

/* ---- framing: views that keep each stop's places clear of the card (the card covers the left two-fifths of the map
   on a laptop screen), centred on the subject ---- */
M({
 "cities|The biggest cities":{view:[23,-12,144,46]},
 "migration|Called in to rebuild":{view:[-162,8,34,62]},
 "people|Russia’s missing men":{view:[-8,22,95,75]},
 "culture|Europe’s odd ones out":{view:[-52,33,62,71]},
 "culture|How the world writes":{view:[-22,16,58,52]},
 "culture|Sign languages have borders too":{view:[-135,8,8,64]},
 "langrel|Catholicism moved west":{view:[-168,-56,16,62]},
 "langrel|The Reformation went south":{view:[-140,-36,20,72]},
 "langrel|Two homes for most Jews":{view:[-161,15,40,62]},
 "langrel|The most Muslim countries are not Arab":{view:[-24,-14,124,44],card:"left"},
 "langrel|Buddhism left home":{view:[12,-12,140,50]},
 "langrel|Sikhism’s Punjab":{view:[-210,-8,92,72]},
 "langrel|Waiting for the vultures":{view:[35,12,80,32]},
 "food|Chocolate moved to Africa":{view:[-170,-32,34,42]},
 "food|The first noodles":{view:[-85,-5,141,58]},
 "food|Dishes that travelled":{view:[-230,-10,19,65]},
 "festivals|Carnival":{view:[-172,-38,16,62]},
 "festivals|Holi and Diwali":{view:[64,19.9,92,33.1]},
 "landmarks|The race for the sky":{view:[-29,-10,126,45]},
 "flags|Maps on flags":{view:[2.5,30,41,48]},
 "art|The first artists":{view:[-105,-35,128,65]},
 "music|Vienna, city of music":{view:[0,43.5,25,54.5]},
 "music|Down the Mississippi: blues and jazz":{view:[-112,24,-62,47],card:"left"},
 "literature|One Thousand and One Nights":{view:[-47,8,68,60]},
 "maths|Zero and algebra go west":{view:[-55,4,82,56]},
 "inventions|The wheel":{view:[-25,20,62,60]},
 "inventions|Who called first?":{view:[-140,28,15,64],card:"left"},
 "inventions|Taking to the air":{view:[-157,28,10,55]},
 "inventions|A lucky mould":{view:[-163,25,5,60]},
 "words|Words named after places":{view:[-48,26,46,58]},
});

})();
