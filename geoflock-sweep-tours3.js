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
function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f&&q.d);
 if(i<0){const r=x.d?x:rec(x.f);if(!r)return -1;PS_PHOTO_DATA.push({f:x.f,d:r.d,by:r.by,lic:r.lic,page:r.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
const lab=q=>Array.isArray(q)?String(q[1]||""):String(q&&q.label||"");
const P={};
window.GF_SWEEP3=P;
const KEYS=["view","globe","mode","on","hi","hiSoft","lines","legend","keyLabel","iconPins","gfRuler","pins","flatView"];
function photos(S,X){
 /* photo pins: the stop's own list, less the dropped ones, plus ours; kept whatever other scripts set the list to later */
 const mine=(X.phAdd||[]).map(x=>{const i=libAdd(x);return i<0?null:{at:x.at,label:x.label,col:x.col||"#d9682b",icon:"photo",_f:x.f,img:i,person:x.person?1:undefined}}).filter(Boolean);
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
function flagDup(S){try{if(!Array.isArray(S.flagTags)||!S.flagTags.length||!Array.isArray(S.pins))return;const N=new Set(S.flagTags.map(f=>String(f&&f.name||"").toLowerCase()));
 const L=S.pins.filter(q=>!(Array.isArray(q)&&N.has(lab(q).toLowerCase())));if(L.length!==S.pins.length)SET(S,"pins",L)}catch(e){}}
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
 psGo=function(i){try{const t=cur();if(t){const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];if(S)apply(t,S)}}catch(e){console.error(e)}return _g.apply(this,arguments)};psGo._gfS3=1;return true}
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
 "regions|Denmark’s far north":{stat:"Greenland is about 50 times bigger than Denmark, yet only about 57,000 people live there"},
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
 "resources|China and coal":{phDrop:/^(India: Taj Mahal|Indonesia: Borobudur)$/},
 "resources|Gold":{phDrop:/^South Africa: Table Mountain/},
 "resources|Rare earths aren’t rare":{phDrop:/^China: Great Wall/},
 "resources|Phosphate":{phDrop:/^Morocco: Chefchaouen$/},
});
/* ---- GDP ---- */
Object.assign(P,{
 "gdp|China’s rise":{phDrop:/^China: Great Wall/},
 "gdp|Rich in resources, poor in income":{phDrop:/^DR Congo: The Congo rainforest$/},
});
/* ---- Transport and trade ---- */
Object.assign(P,{
 "transport|The Belt and Road":{phDrop:/^China: Great Wall/},
 "transport|China’s fast trains":{phDrop:/^China: Great Wall/},
});

/* ================================ History ================================ */

/* ---- Ancient civilisations ---- */
Object.assign(P,{
 /* it pointed to Empires and independence, a tour that is no longer on any shelf: the next tour is Medieval empires */
 "hancient|Now explore":{body:"Then take the Medieval empires tour, which picks up the story from about 500 AD."},
});
/* ---- Revolutions and industry ---- */
Object.assign(P,{
 /* Fortune set out in 1848; the plants left China over the next three years */
 "hrevolutions|The great tea theft":{stat:"From 1848 a Scottish botanist, disguised as a Chinese official, smuggled about 20,000 tea plants out of China"},
});
/* ---- The World Wars ---- */
Object.assign(P,{
 /* unemployment rose to about a quarter by 1933; it did not happen at once in 1929 */
 "hwars|Crash and dictators":{stat:"After the Wall Street Crash of October 1929, unemployment in the US climbed to about one worker in four by 1933"},
});
/* ---- Europe ---- */
Object.assign(P,{
 /* the Brussels photo stood near Wavre, and a fairy-tale castle had nothing to do with coal: the Ruhr's great colliery instead */
 "heurope|Coal, rivers and ports":{phDrop:/^(Belgium: Grand-Place, Brussels|Germany: Neuschwanstein Castle)$/,
  phAdd:[{at:[7.04,51.49],label:"Zollverein colliery, the Ruhr",f:"Zollverein Coal Mine, Essen.jpg"}]},
});
/* ---- Asia ---- */
Object.assign(P,{
 /* country postcards that had nothing to do with the stop */
 "hasia|Angkor":{phDrop:/^(Thailand: Wat Arun, Bangkok|Laos: Kuang Si Falls)$/},
 "hasia|Gandhi and the princes":{phDrop:/^(India: Taj Mahal|Pakistan: K2)$/},
 "hasia|The Vietnam War":{phDrop:/^(Vietnam: Ha Long Bay|Cambodia: Angkor Wat)$/},
 "hasia|1979: a turning year":{phDrop:/^(Iran: Naqsh-e Jahan Square, Isfahan|Afghanistan: Band-e Amir lakes)$/},
});
/* ---- Africa ---- */
Object.assign(P,{
 /* the Meroë pyramids twice on one spot */
 "hafrica|Kush against Rome":{phDrop:/^Sudan: Pyramids of Meroë$/},
 "hafrica|Two Benins":{phDrop:/^Nigeria: Zuma Rock$/},
 "hafrica|Apartheid’s fake countries":{phDrop:/^South Africa: Table Mountain/},
});
/* ---- North America ---- */
Object.assign(P,{
 "hnamerica|Cahokia":{phDrop:/^United States: Grand Canyon$/},
 "hnamerica|The Taíno meet Columbus":{phDrop:/^(Cuba: Viñales Valley|Haiti: Citadelle Laferrière)$/},
});
/* ---- South America ---- */
Object.assign(P,{
 "hsamerica|Caral":{phDrop:/^Peru: Machu Picchu$/},
 "hsamerica|The Nazca lines":{phDrop:/^Peru: Machu Picchu$/},
 /* Rio twice on one spot */
 "hsamerica|Brazil’s sugar coast":{phDrop:/^Brazil: Christ the Redeemer/},
 "hsamerica|The Paraguayan War":{phDrop:/^(Brazil: Christ the Redeemer, Rio|Paraguay: Jesuit mission of Trinidad)$/},
 "hsamerica|Bolivia loses the sea":{phDrop:/^Bolivia: Sunset on the Salar de Uyuni$/},
 "hsamerica|Years of military rule":{phDrop:/^(Argentina: Perito Moreno Glacier|Bolivia: Sunset on the Salar de Uyuni|Brazil: Christ the Redeemer, Rio)$/},
 "hsamerica|The Falklands War":{phDrop:/^Argentina: Perito Moreno Glacier$/},
});
/* ---- Oceania ---- */
Object.assign(P,{
 "hoceania|Women vote first":{phDrop:/^(Australia: Sydney Opera House|Finland: Northern lights over Lapland)$/},
 "hoceania|Federation":{phDrop:/^(Australia: Sydney Opera House|New Zealand: Aoraki \/ Mount Cook)$/},
 "hoceania|The Anzac legend":{phDrop:/^Australia: Sydney Opera House$/},
});
/* ---- Antarctica ---- */
Object.assign(P,{
 /* the 2025 core was said twice, in the stat and again in the text */
 "hantarctica|Reading the ice":{re:[["more","The cores show that carbon dioxide is now far higher than at any time in the last 800,000 years, and in 2025 a new core reached ice over a million years old.","The older cores already show that carbon dioxide is now far higher than at any time in the last 800,000 years; the new one will take the record further back."]]},
});
/* ---- Explorers ---- */
Object.assign(P,{
 /* Lewis and Clark never went near the Grand Canyon */
 "explorers|Lewis and Clark":{phDrop:/^United States: Grand Canyon$/},
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
