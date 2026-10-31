/* GeoFlock pin fix: photo pins that point to the wrong place.
   1. "A capital in the bush" (Oceania): Canberra’s Parliament House photo stands on Canberra, Sydney’s Opera House on
      Sydney, Melbourne’s Flinders Street Station on Melbourne (the Parliament House photo had been put on Melbourne, and a
      Sydney Opera House pin sat in the middle of Australia).
   2. The shared photo enrichment puts "Country: landmark" photo pins at the country’s centre, and gives text pins a photo
      of somewhere else in the country (Kaliningrad got St Basil’s in Moscow, Point Roberts got Moraine Lake). For every
      photo of a known place (LOC: photo file → where it was taken), a pin more than 100 km (300 km when the label names
      only the country) from that place is:
        - moved to the place, when the label is "Country: …" or names the photo’s landmark and the place is on the map;
        - removed, when it is the enrichment’s own "Country: landmark" pin and the place is off the map;
        - turned back into the plain text pin it was, otherwise (the label stays where it was, without the wrong photo).
      FIX lists the same for photos with no single place (a photo that does not show what its label names).
   Runs after load (+1.5 s, re-run +1.5/+5/+12 s) and on every psGo, before and after the stop is drawn. */
(function(){
"use strict";
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const libIdx=f=>{try{if(typeof gfMergeExtra==="function")gfMergeExtra()}catch(e){}try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}};
const OR="#d9682b";
/* stops another pass is editing: never touched here */
const SKIP=new Set(["oceania|Oceania","oceania|Only in Australia","oceania|The Great Barrier Reef"]);
/* where each landmark photo was taken [lon,lat] */
const LOC={"Pyramid of Cheops - side.jpg":[31.13,29.98],"Colosseum in Rome-April 2007-1- copie 2B.jpg":[12.492,41.89],"Big Ben at sunset - 2014-10-27 17-30.jpg":[-0.1246,51.5007],"Simetría na Sagrada Familia. Barcelona B30.jpg":[2.174,41.404],"Hohenschwangau - Schloss Neuschwanstein1.jpg":[10.75,47.557],"Hagia Sophia Mars 2013.jpg":[28.98,41.008],"Naqsh-e Jahan Square from the gheisariye Vault.jpg":[51.678,32.657],"Taj Mahal, Agra, India edit2.jpg":[78.042,27.175],"Great Wall of China July 2006.JPG":[116.57,40.43],"Angkor Wat Sunrise (209237385).jpeg":[103.867,13.412],"Ha Long Bay, Tower karsts.jpg":[107.08,20.9],"Borobudur-Temple-Park Indonesia Stupas-of-Borobudur-12.jpg":[110.204,-7.608],"Sydney Opera House - Dec 2008.jpg":[151.215,-33.857],"Machu Picchu, Perú, 2015-07-30, DD 47.JPG":[-72.545,-13.163],"Rio de Janeiro - Cristo Redentor 01.jpg":[-43.21,-22.95],"Perito Moreno Glacier Patagonia Argentina Luca Galuzzi 2005.JPG":[-73.05,-50.47],"Chichen Itza 3.jpg":[-88.569,20.683],"Grand Canyon Powell Point Evening Light 02 2013.jpg":[-112.1,36.1],"Moraine Lake 17092005.jpg":[-116.18,51.32],"Table Mountain from Blouberg, South Africa (4028515275).jpg":[18.4,-33.96],"Acacia tree on a sunrise safari at the Serengeti National Park, Tanzania.jpg":[34.83,-2.33],"Lalibela, san giorgio, esterno 24.jpg":[39.04,12.03],"Adansonia grandidieri Pat Hooper.jpg":[44.42,-20.25],"2018 01 (Blue) - Chaouen.jpg":[-5.27,35.17],"Geirangerfjord from Ørnesvingen, 2013 June.jpg":[7.14,62.1],"Overwaard Mill No.4, sunrise.jpg":[4.64,51.885],"Catedral de San Basilio, Moscú, Rusia, 2016-10-03, DD 05-06 HDR.jpg":[37.623,55.752],"Winter Palace Panorama 4.jpg":[30.314,59.94],"A view towards Torres Del Paine.jpg":[-73.0,-51.0],"Templo Wat Arun, Bangkok, Tailandia, 2013-08-22, DD 30.jpg":[100.489,13.744],"Zebras and wildebeest Maasai Mara.jpg":[35.1,-1.5],"Zuma Rock.jpg":[7.23,9.13],"Edificios en la Grand-Place, Bruselas, Bélgica, 2021-12-15, DD 184-186 HDR.jpg":[4.352,50.847],"Alexander Nevsky Cathedral Sofia.jpg":[23.333,42.696],"80-391-9014 Kyiv Sofia 2 RB 24.jpg":[30.514,50.453],"Monte Roraima, ponto mais alto.jpg":[-60.76,5.14],"Mount Cameroon view from Buea (Soppo).jpg":[9.17,4.22],"Citadelle Laferrière Aerial View.jpg":[-72.244,19.573],"Ziggarat of Ur 001.jpg":[46.1,30.96],"Liechtenstein asv2022-10 img22 Vaduz Schloss.jpg":[9.52,47.14],"Clock tower - Jesuit Reduction of Trinidad - Paraguay.JPG":[-55.71,-27.13],"A balcony of the House of Slaves in Gorée.jpg":[-17.4,14.67],"Sudan Meroe Pyramids 30sep2005 2.jpg":[33.75,16.94],"Medieval Mud-Skyscrapers of Shibam, Hadramawt Valley (2286363119).jpg":[48.626,15.927],"Moraine Lake-Banff NP.JPG":[-116.18,51.32],"Lake Band-e-Amir.jpg":[67.2,34.84],"Danmark O, Fohn Fjord, Renodde.70°N 26°W (76566707).jpg":[-26.2,70.45],"Watching Sunset Salar de Uyuni Bolivia Luca Galuzzi 2006.jpg":[-67.5,-20.2],"Fields with Concepcion Volcano - Near Santo Domingo - Ometepe Island - Nicaragua - 01 (31796975315).jpg":[-85.62,11.54],"Mount Cameroon National Park 02.jpg":[9.17,4.2],"Aurora borealis over Saana fell.jpg":[20.8,69.05],"Skógafoss July 2014.JPG":[-19.51,63.53],"Munkbroleden with Kornhamstorg at Gamla Stan, Stockholm, Sweden 01.jpg":[18.07,59.325],"Galapagos giant tortoise, head (Chelonoidis niger hoodensis).jpg":[-90.4,-0.7],"Neuschwanstein Castle 2024-02.jpg":[10.75,47.557],"Empty Old Town Market Square in Kraków during the COVID-19 pandemic in Poland, April 2020.jpg":[19.937,50.062],"Charyn Canyon, Kazakhstan 03.jpg":[79.08,43.35],"Supplicating Pilgrim at Masjid Al Haram. Mecca, Saudi Arabia.jpg":[39.826,21.423],"Panoramic view from Juche Tower.jpg":[125.75,39.02],"Bete Giyorgis 01.jpg":[39.04,12.03],"All Gizah Pyramids.jpg":[31.13,29.98],"Tassili rocks.jpg":[8.3,25.6],"Western white-bearded wildebeest (Connochaetes taurinus mearnsi) Mara River crossing 2c.jpg":[35.1,-1.5],"Ennedi Hoodoos in the Ennedi Mountains - northeastern Chad 2015.jpg":[22.0,17.0],"Le Port secondaire de Ouesso, au bord de la Rivière Sangha.jpg":[16.05,1.61],"Côtes de l'île de Gorée au Sénégal 11.jpg":[-17.398,14.667],"Peyto Lake-Banff NP-Canada.jpg":[-116.51,51.72],"Fragmento del Valle de Viñales. Cuba.JPG":[-83.71,22.62],"Aerial view Ciudad Colonial Santo Domingo 09 2019 0067.jpg":[-69.88,18.47],"Cuernos del Paine in Torres del Paine National Park.jpg":[-73.0,-51.0],"Eiffel Tower and Pont Alexandre III at night.jpg":[2.294,48.858],"Houses at Waterkant, Paramaribo.JPG":[-55.2,5.83],"Mt Cook LC0247.jpg":[170.14,-43.595],"Concordia (Karakoram).jpg":[76.51,35.88],"Tourist Boat in Sundarbans, West Bengal, India 03.jpg":[89.4,22.0],"HUN-2015-Budapest-Hungarian Parliament (Budapest) 2015-02.jpg":[19.046,47.507],"Ancient ziggurat at Ali Air Base Iraq 2005.jpg":[46.103,30.963],"Angkor Wat with its reflection (cropped).jpg":[103.867,13.412],"Kuang Si Falls and a turquoise water pool in Luang Prabang province Laos.jpg":[101.99,19.75],"Ocho Ríos-Jamaica03.JPG":[-77.135,18.414],"Citadelle Laferrière.jpg":[-72.244,19.573],"Ha Long Bay, Vietnam, View from above.jpg":[107.08,20.9],"The windmills of Kinderdijk.JPG":[4.64,51.885],"Pyramids of Meroe in Bajrawiya, Sudan 09.jpg":[33.75,16.94],"Chureito Pagoda and Mount Fuji 2023-03-07.jpg":[138.61,35.5],"Great-zim-aerial-looking-West.JPG":[30.93,-20.27],"Parliament House at dusk, Canberra ACT.jpg":[149.124,-35.308],"Salto del Angel-Canaima-Venezuela18.JPG":[-62.535,5.968],"Stonehenge from the north.jpg":[-1.826,51.179],"Tour Eiffel Wikimedia Commons.jpg":[2.294,48.858]};
/* label → action, for photos that do not show what the label names (checked by eye); "tour|stop|label": [photo file, action] */
const FIX={
 "musicsport|Three hosts, 48 teams|New Jersey: the final":["Jersey - Mont Orgueil 01.jpg","text"],          /* the Channel Island of Jersey */
 "musicsport|Chess came from India|Spain: the powerful queen":["Flamenco en México 01.jpg","text"],          /* flamenco, in Mexico */
 "food|Three grains, three cradles|Yangtze: rice":[null,"text"],                                             /* a paddy field in Laos */
 "food|Coffee from Ethiopia|Brazil: a third of it":["Carnival in Rio de Janeiro.jpg","text"],                /* carnival, not coffee */
 "food|Dishes that travelled|California: fortune cookies":["Russian chapel at Fort Ross (2016).jpg","text"],
 "resources|Congo’s cobalt|Zambia’s Copperbelt":[null,"text"],                                               /* Victoria Falls */
 "hafrica|Two Benins|Benin City":[null,"text"],                                                              /* a pirogue at Ganvié, in the other Benin */
 "hempires|China’s treasure fleets|Malindi, Kenya":["A Maasai dancer jumping high.jpg","text"],
 "africa|The roof of Africa|Mount Kenya 5,199 m":["A Maasai dancer jumping high.jpg","text"],
 "islands|The island that wasn’t|Sandy Island: nothing here":[null,"text"],                                  /* a blue shark off the Azores */
 "resources|China and coal|Shanxi: China’s coal heartland":["Great Wall of China July 2006.JPG","text"],
 "geo|France: the most time zones|Metropolitan France":["Tour Eiffel Wikimedia Commons.jpg","move"]};
const LOG=window.GF_PINFIX_LOG=window.GF_PINFIX_LOG||[];
function km(a,b){const r=Math.PI/180,c=Math.sin(a[1]*r)*Math.sin(b[1]*r)+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.cos((b[0]-a[0])*r);return 6371*Math.acos(Math.max(-1,Math.min(1,c)))}
let CN=null;function countries(){if(CN)return CN;CN=new Set;try{for(const c in COUNTRY_BY_CODE){const n=COUNTRY_BY_CODE[c].n;if(n)CN.add(n)}}catch(e){}return CN}
function inView(S,ll){const v=S.flatView||S.view;if(!v||v.length<4)return false;const w=v[2]-v[0],h=v[3]-v[1];
 return ll[0]>=v[0]+w*.03&&ll[0]<=v[2]-w*.03&&ll[1]>=v[1]+h*.03&&ll[1]<=v[3]-h*.03}
function photoOf(q){try{const P=psSqPhoto(q);return P&&P.f?P:null}catch(e){return null}}
function capOf(q){try{return strip(typeof gfPhCap==="function"?gfPhCap(q.label):q.label)}catch(e){return strip(q.label)}}
function setPins(S,ph,addText){
 lock(S,"phPins",ph);
 if(addText.length){const cur=Array.isArray(S.pins)?S.pins:[];const have=new Set(cur.map(p=>strip(Array.isArray(p)?p[1]:p&&(p.text||p.label))));
  const add=addText.filter(p=>!have.has(strip(p[1])));if(add.length){lock(S,"pins",cur.concat(add));if(Array.isArray(S._pins0))S._pins0=S._pins0.concat(add)}}
 S._sqPruned=-1}
/* decide what to do with one photo pin: null (fine), ["move",ll], ["remove"], ["text"] */
function judge(id,S,q){
 const lab=strip(q.label),P=photoOf(q),f=P&&P.f;
 const fx=FIX[id+"|"+S.title+"|"+lab];
 if(fx&&(!fx[0]||fx[0]===f)){if(fx[1]==="move"&&LOC[f])return["move",LOC[f]];return[fx[1]]}
 if(!f||!LOC[f]||!Array.isArray(q.at)||typeof q.at[0]!=="number")return null;
 const ll=LOC[f],d=km(q.at,ll);
 const m=/^([^:]+):\s*(.+)$/.exec(lab),head=m?strip(m[1]):lab,cap=capOf(q).toLowerCase();
 const isC=countries().has(head);
 /* the label names the photo’s subject: "Country: landmark", or a caption that is the landmark */
 const namesIt=!!m&&isC&&cap&&cap!==lab.toLowerCase()&&cap!==head.toLowerCase();
 if(d<=(isC&&!namesIt?300:100))return null;
 if((isC||namesIt)&&inView(S,ll))return["move",ll];
 if(isC&&namesIt)return["remove"];
 return["text"]}
function fixStop(id,S){
 if(!S||!S.title||SKIP.has(id+"|"+S.title)||!Array.isArray(S.phPins)||!S.phPins.length)return false;
 let changed=false;const out=[],txt=[];
 for(const q of S.phPins){const j=q?judge(id,S,q):null;
  if(!j){out.push(q);continue}
  changed=true;const lab=strip(q.label);
  if(j[0]==="move"){out.push(Object.assign({},q,{at:[j[1][0],j[1][1]]}));LOG.push([id,S.title,lab,"moved",q.at,j[1]])}
  else if(j[0]==="remove"){LOG.push([id,S.title,lab,"removed",q.at])}
  else{txt.push([q.at,lab,"point"]);LOG.push([id,S.title,lab,"text pin (photo dropped)",q.at])}}
 if(changed)setPins(S,out,txt);
 return changed}

/* ---------- 1. A capital in the bush ---------- */
function canberra(){let S=null;try{S=PS_TOURS.oceania.steps.find(s=>s.title==="A capital in the bush"||s.title==="Canberra, the compromise")}catch(e){}
 if(!S)return false;
 const ok=Array.isArray(S.phPins)&&S.phPins.length===3&&S.phPins.every(q=>q&&q._gfPinFix);if(ok)return false;
 const ip=libIdx("Parliament House at dusk, Canberra ACT.jpg"),io=libIdx("Sydney Opera House - Dec 2008.jpg"),im=libIdx("Clocks at Flinders Street Station.jpg");
 const P=[];
 if(ip>=0)P.push({at:[149.13,-35.31],label:"Canberra: Parliament House",col:OR,icon:"photo",_gfImg:ip,_gfPinFix:1});
 if(io>=0)P.push({at:[151.21,-33.86],label:"Sydney: the Opera House",col:OR,icon:"photo",_gfImg:io,_gfPinFix:1});
 if(im>=0)P.push({at:[144.97,-37.82],label:"Melbourne: Flinders Street Station",col:OR,icon:"photo",_gfImg:im,_gfPinFix:1});
 if(P.length<3)return false;
 try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};P.forEach(q=>{PS_SQ_IMG[q.label]=q._gfImg})}catch(e){}
 try{window.GF_PHCAP=window.GF_PHCAP||{};Object.assign(GF_PHCAP,{"Canberra: Parliament House":"Canberra: Parliament House","Sydney: the Opera House":"Sydney Opera House","Melbourne: Flinders Street Station":"Melbourne: Flinders St"})}catch(e){}
 lock(S,"phPins",P);
 /* the city names are on the photo pins now; the dashed line Sydney–Canberra–Melbourne stays */
 lock(S,"pins",[]);if(Array.isArray(S._pins0))S._pins0=[];
 S._sqPruned=-1;S._enr=1;LOG.push(["oceania",S.title,"Canberra/Sydney/Melbourne","rebuilt"]);return true}

function all(){let n=0;try{canberra()}catch(e){console.error("pinfix canberra",e)}
 try{for(const id in PS_TOURS){const st=PS_TOURS[id]&&PS_TOURS[id].steps;if(!Array.isArray(st))continue;
  for(const S of st){try{if(fixStop(id,S))n++}catch(e){console.error("pinfix",id,S&&S.title,e)}}}}catch(e){console.error(e)}
 return n}

function hookGo(){if(typeof psGo!=="function"||psGo._gfPinFix)return;const _g=psGo;
 psGo=function(i){let S=null,id=null;
  try{if(typeof ps!=="undefined"&&ps){id=ps.tour;const st=psSteps();S=st[i];
   if(S&&typeof psEnrich==="function")psEnrich(id,S,i,st.length);
   if(S){if(id==="oceania")canberra();fixStop(id,S)}}}catch(e){}
  const r=_g.apply(this,arguments);
  try{if(S&&ps&&ps.tour===id&&!psGo._again){let c=fixStop(id,S);if(id==="oceania"&&canberra())c=true;if(c){psGo._again=1;try{_g.call(this,i)}finally{psGo._again=0}}}}catch(e){}
  return r};psGo._gfPinFix=1}
function run(){all();hookGo()}
function boot(){setTimeout(()=>{run();[1500,5000,12000].forEach(ms=>setTimeout(run,ms))},1500)}
if(document.readyState==="complete")boot();else window.addEventListener("load",boot);
})();
