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
A("europe|Europe",{view:[-48,33,45,71]});
A("europe|The European Union",{view:[-48,33,45,71]});
A("europe|Now explore",{view:[-48,33,45,71]});
A("europe|A city on two continents",{view:[24.5,39.8,31.5,42.2],globe:[29,41,9]});
A("europe|Russia, cut off from Russia",{view:[8,51,30,59.5],pinsDrop:/^(Poland|Lithuania)$/});
A("europe|Europe’s great rivers",{view:[-35,38,62,62]});
/* Svalbard: the Arctic Circle the card points to (dashed) comes into view, and the islands sit clear of the card */
A("europe|Islands of the midnight sun",{view:[-12,65,38,81],globe:[18,74,3.6]});
A("europe|Greenland icy, Iceland green",{pinsDrop:/^Iceland$/});
A("europe|Choirs and good government",{pinsDrop:/^Italy$/});

/* Asia: views widened to the west, so the Middle East, Central Asia and the west of Siberia are not hidden under the card */
{const W=[-10,-12,150,62];["Asia","Most people","The biggest countries","Asia’s economies","Now explore"].forEach(t=>A("asia|"+t,{view:W}))}
A("asia|Asia’s high peaks",{view:[52,22,104,46]});
A("asia|The rains that feed Asia",{view:[30,-5,135,40]});
A("asia|Asia’s water tower",{view:[40,5,125,45]});
A("asia|Deserts and steppe",{view:[10,15,125,55]});
A("asia|Siberia",{view:[25,42,180,78]});
A("asia|Birthplace of religions",{view:[5,10,92,42]});
A("asia|The Silk Road",{view:[-5,20,115,50]});
A("asia|Asia’s giant cities",{view:[45,-12,145,42]});
A("asia|The two giants’ neighbours",{view:[-15,10,150,75]});
A("asia|Islands of fire",{view:[80,-14,168,58]});
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
A("africa|The long shadow of the slave trade",{pinsDrop:/^Benin$/});
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
A("namerica|Canada’s water",{phDrop:/^Canada: Moraine Lake/});/* the card's own photo already */
A("namerica|The longest border",{view:[-205,36,-55,72]});
A("namerica|Greenland belongs to North America",{view:[-130,28,22,84]});
A("namerica|Alaska breaks every record",{view:[-215,36,-83,72]});
A("namerica|Mountains and rivers",{view:[-205,15,-55,72]});
A("namerica|A capital that sinks",{view:[-118.6,12,-88.6,27],phDrop:/^Mexico: Chichén Itzá/});
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
A("samerica|Living high in the Andes",{view:[-115,-56,-50,12]});
A("samerica|A ribbon of a country",{view:[-100,-57,-50,-16]});
A("samerica|The Amazon basin",{view:[-100,-22,-44,8]});
/* the map's colours are not named: the Cerrado is drawn on the map, and the climate palette has since changed */
A("samerica|Turning bad soil into soybeans",{rep:[["The Cerrado, the tropical savanna (light blue on the map) south of the Amazon rainforest (dark blue), has","The Cerrado, the tropical savanna south of the Amazon rainforest, has"]]});
A("samerica|The Inca Empire",{view:[-95,-36,-60,2]});
/* Rio's pin showed the Maracanã stadium, built in 1950; the Paço Imperial was the royal palace from 1808 */
A("samerica|Europe ruled from Rio",{view:[-80,-32,5,45],phDrop:/^(Rio de Janeiro: capital, 1808–1821|Brazil: Christ the Redeemer)/,
 ph:[{at:[-43.174,-22.903],label:"Paço Imperial: the king’s palace in Rio",f:"Paço Imperial ao entardecer.jpg",d:"@4505c64d931a9bfc",by:"Guilherme Soares",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Pa%C3%A7o_Imperial_ao_entardecer.jpg"}]});
A("samerica|Rich from frozen beef",{view:[-80,-41,-50,-28]});
A("samerica|Two great waterfalls",{view:[-110,-62,-25,21]});
A("samerica|Two landlocked countries",{view:[-80,-28,-53,-9]});
/* the islands were under the card; the tortoise pin repeated both the islands' pin spot and the card's own tortoise photo */
A("samerica|Darwin’s islands",{view:[-105,-10,-75,5],pinsDrop:/^Ecuador$/,phDrop:/^Ecuador: Galápagos tortoise/});
A("samerica|The far south",{view:[-100,-60,-50,-38]});
A("samerica|Two-thirds of Guyana",{view:[-73,0,-53,10]});

/* Oceania: Australia sits clear of the card on the whole-region views */
["Australia is most of it","Now explore"].forEach(t=>A("oceania|"+t,{view:[80,-50,180,8]}));
A("oceania|Oceania",{view:[80,-50,236,22]});
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
A("bnations|Nogales: one town, two countries",{view:[-114.5,29.6,-108.5,33],pinsDrop:/^(United States|Mexico)$/});
A("bnations|The convicts who sued",{pinsDrop:/^Australia$/});
A("bnations|Printing held back",{view:[8,35,40,46]});
A("bnations|Tearing up the railway",{pinsDrop:/^Sierra Leone$/});
A("bnations|Growth that cannot last?",{pinsDrop:/^(Russia|China)$/});
/* the tropics stop now shows the Economy map's money per person, so the reader can see where the poorest countries lie;
   the Stockholm picture (for the Nobel) sat on the Sahara and goes */
A("bnations|Geography or institutions?",{mode:"gdp",sub:"percapita",phDrop:/^Stockholm$/,
 body:"The Economy map shows money per person: the poorest countries cluster between the tropics. Writers such as Jared Diamond and the economist Jeffrey Sachs stress geography: climate, disease and soils. Acemoglu and Robinson reply that the same places were often richer than Europe’s colonies in temperate lands before 1500, and that colonisers set up worse institutions where they could exploit large populations."});

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
let n=0;const t=setInterval(()=>{if((typeof psGo==="function"&&psGo._gfM||n>30)&&wrapGo()||++n>80)clearInterval(t)},500);
window.gfSweepT4=P;
})();
