/* GeoFlock: photos for the revised Physical Earth tours (follows geoflock-review-phys.js).
   Many new stops there name a Commons file that never reached the library (downloads were rate-limited), so the
   card had no photo and the photo pin was dropped. This file adds checked Wikimedia Commons photos (author, licence,
   page below), gives those stops their card photo and puts their photo pin back, and fills a few older photo pins
   that had no picture. Card photos: PS_PHOTO["tour|title"]; photo pins: PS_SQ_IMG[label]; captions: GF_PHCAP. */
(function(){
"use strict";
window.GF_RVPHYS_PHOTOS2=[/*PHOTOS*/
{"f":"Geoid undulation 10k scale.jpg","d":"photos/x2295951e5b7b6742.webp","by":"International Centre for Global Earth Models (ICGEM)","lic":"CC BY 4.0","page":"https://commons.wikimedia.org/wiki/File:Geoid_undulation_10k_scale.jpg"},
{"f":"Benny Trapp Vipera berus.jpg","d":"photos/xf85117e389d64a27.webp","by":"Benny Trapp","lic":"CC BY 3.0","page":"https://commons.wikimedia.org/wiki/File:Benny_Trapp_Vipera_berus.jpg"},
{"f":"Salton Sea 01 2013.jpg","d":"photos/x80c8135e428f0d95.webp","by":"Tuxyso","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Salton_Sea_01_2013.jpg"},
{"f":"Gorey Harbour at low tide.JPG","d":"photos/xcb4f6f8589cc27b0.webp","by":"FoxyOrange","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Gorey_Harbour_at_low_tide.JPG"},
{"f":"Pingelap.png","d":"photos/x3578420da9210aac.webp","by":"Smurrayinchester","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Pingelap.png"},
{"f":"Neskowin Ghost Forest - 2016.jpg","d":"photos/x086245c2b6109825.webp","by":"RocketSams","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:Neskowin_Ghost_Forest_-_2016.jpg"},
{"f":"Reelfoot Lake.jpg","d":"photos/xbde7214a2d5680a5.webp","by":"JeremyA","lic":"CC BY-SA 2.5","page":"https://commons.wikimedia.org/wiki/File:Reelfoot_Lake.jpg"},
{"f":"Armero aftermath Marso.jpg","d":"photos/xa66e3ebdbd55fe7d.webp","by":"Jeffrey Marso, USGS","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Armero_aftermath_Marso.jpg"},
{"f":"Arun River of Nepal.JPG","d":"photos/xb40c2fbaaa686e0c.webp","by":"Nirmal Dulal","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:Arun_River_of_Nepal.JPG"},
{"f":"56762-Yunnan, Three Parallel Rivers 02.jpg","d":"photos/x1e91ee253e9c27d7.webp","by":"xiquinhosilva","lic":"CC BY 2.0","page":"https://commons.wikimedia.org/wiki/File:56762-Yunnan,_Three_Parallel_Rivers_02.jpg"},
{"f":"130707 Glen Coe from east C.jpg","d":"photos/x82d8f079b56d3e04.webp","by":"Dave souza","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:130707_Glen_Coe_from_east_C.jpg"},
{"f":"Rescue equipment in Tham Luang entrance chamber (cropped).jpg","d":"photos/xcb464cc9fc965d33.webp","by":"NBT (National Broadcasting Services of Thailand)","lic":"CC BY 3.0","page":"https://commons.wikimedia.org/wiki/File:Rescue_equipment_in_Tham_Luang_entrance_chamber_(cropped).jpg"},
{"f":"Chad AMO 2004323 lrg.jpg","d":"photos/x8dad6344bb155c05.webp","by":"NASA","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Chad_AMO_2004323_lrg.jpg"},
{"f":"Mokoshuraiekotoba.jpg","d":"photos/xb1eeff3eb0b12b88.webp","by":"Unknown artist (Mōko Shūrai Ekotoba)","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Mokoshuraiekotoba.jpg"},
{"f":"Kikuchi Yoosai - Mongol Invasion (mōko shūrai) - Tokyo National Museum.jpg","d":"photos/x40ab27de022eec11.webp","by":"Kikuchi Yōsai (Tokyo National Museum)","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Kikuchi_Yoosai_-_Mongol_Invasion_(m%C5%8Dko_sh%C5%ABrai)_-_Tokyo_National_Museum.jpg"},
{"f":"MorningGloryCloudBurketownFromPlane.jpg","d":"photos/x7b3ead578dacfdc9.webp","by":"Mick Petroff","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:MorningGloryCloudBurketownFromPlane.jpg"},
{"f":"Hakkoda Ropeway.jpg","d":"photos/x3913e5ff3b4d5896.webp","by":"Mihai Florin Apostu Oota","lic":"CC BY 2.0","page":"https://commons.wikimedia.org/wiki/File:Hakkoda_Ropeway.jpg"},
{"f":"Twisted bridge Skaftafell due to Glacial lake outburst flood.JPG","d":"photos/xc02d37210c19b30b.webp","by":"Chris 73","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Twisted_bridge_Skaftafell_due_to_Glacial_lake_outburst_flood.JPG"},
{"f":"Dasht-e Lut Desert in Kerman Province 02.jpg","d":"photos/x16ae1275629da344.webp","by":"Ninaras","lic":"CC BY 4.0","page":"https://commons.wikimedia.org/wiki/File:Dasht-e_Lut_Desert_in_Kerman_Province_02.jpg"},
{"f":"Chesil Beach and the Fleet Lagoon.jpg","d":"photos/xbf338a6b6e7917ba.webp","by":"BennH","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:Chesil_Beach_and_the_Fleet_Lagoon.jpg"}
];
/* card photos: "tour|title" → library file name (f) */
const CARD={/*CARD*/
"elev|Sea level isn’t level":"Geoid undulation 10k scale.jpg",
"rivers|The Amazon once flowed west":"Aerial view of the Amazon Rainforest.jpg",
"lakes|A lake made by mistake":"Salton Sea 01 2013.jpg",
"seas|Two tides a day":"Gorey Harbour at low tide.JPG",
"islands|No snakes in Ireland":"Benny Trapp Vipera berus.jpg",
"islands|The island where many see no colour":"Pingelap.png",
"plates|The earthquake Japan wrote down":"Neskowin Ghost Forest - 2016.jpg",
"plates|An earthquake in the middle of a plate":"Reelfoot Lake.jpg",
"hazards|The town that ignored the map":"Armero aftermath Marso.jpg",
"ranges|A river older than the Himalaya":"Arun River of Nepal.JPG",
"ranges|Three rivers, three seas":"56762-Yunnan, Three Parallel Rivers 02.jpg",
"ranges|Scotland’s mountains are in America":"130707 Glen Coe from east C.jpg",
"caves|Trapped by the monsoon":"Rescue equipment in Tham Luang entrance chamber (cropped).jpg",
"weather|The Sahara feeds the Amazon":"Chad AMO 2004323 lrg.jpg",
"weather|The ‘divine wind’":"Mokoshuraiekotoba.jpg",
"weather|The snowiest city on Earth":"Hakkoda Ropeway.jpg",
"weather|A cloud 1,000 km long":"MorningGloryCloudBurketownFromPlane.jpg",
"deserts|Death Valley’s heat trap":"Boardwalk at Badwater Basin, Death Valley National Park, California.jpg",
"ice|When a volcano melts a glacier":"Twisted bridge Skaftafell due to Glacial lake outburst flood.JPG",
"deserts|Hotter than an oven floor":"Dasht-e Lut Desert in Kerman Province 02.jpg",
"coasts|Pebbles that tell you where you are":"Chesil Beach and the Fleet Lagoon.jpg"
};
/* photo pins to (re)place on a stop: "tour|title" → [[lon,lat],label,file]; replaces a pin of the same label */
const PINS={/*PINS*/
"lakes|A lake made by mistake":[[[-115.95,33.4],"The Salton Sea","Salton Sea 01 2013.jpg"]],
"islands|No snakes in Ireland":[[[-2.5,51.3],"The adder, Britain’s native viper","Benny Trapp Vipera berus.jpg"]],
"hazards|The town that ignored the map":[[[-74.9,4.965],"Armero after the 1985 mudflow","Armero aftermath Marso.jpg"]],
"ranges|Scotland’s mountains are in America":[[[-5.0,56.67],"Glen Coe, in the Highlands","130707 Glen Coe from east C.jpg"]],
"caves|Trapped by the monsoon":[[[99.868,20.382],"Inside Tham Luang’s entrance chamber","Rescue equipment in Tham Luang entrance chamber (cropped).jpg"]],
"weather|The Sahara feeds the Amazon":[[[17.5,17.4],"Dust blowing off the Bodélé, from space","Chad AMO 2004323 lrg.jpg"]],
"weather|The ‘divine wind’":[[[130.3,33.7],"Samurai and Mongols, a scroll of about 1293","Mokoshuraiekotoba.jpg"],[[129.75,33.42],"Takashima: the storm wrecks the fleet","Kikuchi Yoosai - Mongol Invasion (mōko shūrai) - Tokyo National Museum.jpg"]],
"weather|The snowiest city on Earth":[[[140.87,40.66],"Hakkōda, in Aomori city, in winter","Hakkoda Ropeway.jpg"]],
"weather|A cloud 1,000 km long":[[[139.6,-17.6],"The Morning Glory","MorningGloryCloudBurketownFromPlane.jpg"]],
"ice|When a volcano melts a glacier":[[[-16.97,64.01],"The bridge girders left by the 1996 flood","Twisted bridge Skaftafell due to Glacial lake outburst flood.JPG"]],
"deserts|Hotter than an oven floor":[[[59.2,30.4],"The kaluts of the Lut","Dasht-e Lut Desert in Kerman Province 02.jpg"]],
"coasts|Pebbles that tell you where you are":[[[-2.6,50.65],"Chesil Beach and the Fleet","Chesil Beach and the Fleet Lagoon.jpg"]]
};
/* existing photo pins (any stop) whose label gets this picture */
const SQ={/*SQ*/
"Saimaa, Finland’s largest lake":"Lake Saimaa aerial.jpg",
"Straits of Mackinac: Michigan and Huron meet":"Mackinac Bridge Walk.jpg",
"Saint Martin: French north, Dutch south":"Grand Case auf Saint Martin.jpg","Saint Martin: French north, Dutch south\u200b":"Grand Case auf Saint Martin.jpg",
"Strait of Magellan":"00 2521 Punta Arenas - Chile.jpg",
"Quito ~2,850 m":"Quito DotM banner.jpg",
"Mawsynram: the wettest place":"Living root bridge, Maghalaya, India1.jpg",
"Brunei, in two pieces":"Kampong Ayer, Brunei in January 2026 (DSCF1416).jpg"
};
/* captions for labels the caption rule would get wrong */
const CAP={/*CAP*/
"Straits of Mackinac: Michigan and Huron meet":"The Straits of Mackinac",
"Saint Martin: French north, Dutch south":"Grand Case, Saint-Martin","Saint Martin: French north, Dutch south\u200b":"Grand Case, Saint-Martin",
"Strait of Magellan":"Punta Arenas on the Strait",
"Armero after the 1985 mudflow":"Armero after the mudflow",
"Inside Tham Luang’s entrance chamber":"Tham Luang’s entrance",
"Dust blowing off the Bodélé, from space":"Bodélé dust from space",
"Samurai and Mongols, a scroll of about 1293":"Samurai board a Mongol ship",
"Takashima: the storm wrecks the fleet":"The storm, painted 1847",
"Hakkōda, in Aomori city, in winter":"Hakkōda Ropeway in winter",
"The adder, Britain’s native viper":"The adder",
"The bridge girders left by the 1996 flood":"Skeiðará bridge girders",
"Mawsynram: the wettest place":"Root bridge, Meghalaya",
"Brunei, in two pieces":"Kampong Ayer, Brunei"
};

const OR="#d9682b";
const TOURS=["elev","climate","rivers","lakes","seas","islands","plates","hazards","ranges","volcanoes","caves","weather","coasts","deserts","ice"];
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const TT=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&Array.isArray(t.steps)&&t.steps.length?t:null}catch(e){return null}};
const st=(id,title)=>{const t=TT(id);return t?t.steps.find(s=>s&&s.title===title):null};
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function merge(){try{if(typeof PS_PHOTO_DATA==="undefined")return;const have=new Set(PS_PHOTO_DATA.filter(p=>p&&p.d).map(p=>p.f));
 GF_RVPHYS_PHOTOS2.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(!(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")&&typeof GF_EXTRA_PHOTOS!=="undefined")GF_RVPHYS_PHOTOS2.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}

function pins(){for(const k in PINS){const i=k.indexOf("|"),s=st(k.slice(0,i),k.slice(i+1));if(!s)continue;
 const L=Array.isArray(s.phPins)?s.phPins:[];const want=PINS[k].filter(p=>libIdx(p[2])>=0);
 const ok=want.every(p=>L.some(q=>q&&q.label===p[1]&&q._f===p[2]));if(ok)continue;
 const labs=new Set(want.map(p=>p[1]));
 const N=L.filter(q=>!(q&&labs.has(q.label))).concat(want.map(p=>({at:p[0],label:p[1],col:OR,icon:"photo",_f:p[2]})));
 lock(s,"phPins",N);def(s,"_sqPruned",-1)}}
function imgs(){window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 const lab={};for(const l in SQ)lab[l]=SQ[l];
 for(const k in PINS)PINS[k].forEach(p=>{lab[p[1]]=p[2]});
 for(const l in lab){const i=libIdx(lab[l]);if(i>=0)PS_SQ_IMG[l]=i}
 TOURS.forEach(id=>{const t=TT(id);if(t)t.steps.forEach(s=>{(Array.isArray(s.phPins)?s.phPins:[]).forEach(q=>{if(q&&lab[q.label]!=null){const i=libIdx(lab[q.label]);if(i>=0){q.img=i;if(PINS[id+"|"+s.title]&&!q._f)q._f=lab[q.label]}}})})})}
function cards(){for(const k in CARD){const i=libIdx(CARD[k]);if(i<0)continue;const c=PS_PHOTO[k];
 if(c==null||!(PS_PHOTO_DATA[c]&&PS_PHOTO_DATA[c].d))PS_PHOTO[k]=i}}
function run(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 try{window.GF_PHCAP=window.GF_PHCAP||{};Object.assign(GF_PHCAP,CAP)}catch(e){}
 cards();pins();imgs()}catch(e){console.error("review-phys-photos",e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&TOURS.includes(ps.tour))run()}catch(e){}return _g.apply(this,arguments)}}
/* other files also pick pictures for pin labels (some wrong, e.g. Saint Kitts for Saint Martin): wrap psSqPhoto last, after load, so the pictures chosen here win; labels are matched without zero-width spaces */
const PICK=()=>{const m={};for(const l in SQ)m[l.replace(/\u200b/g,"")]=SQ[l];for(const k in PINS)PINS[k].forEach(p=>{m[p[1]]=p[2]});return m};
const outer=()=>{if(typeof psSqPhoto!=="function"||psSqPhoto._rvpp)return;const m=PICK(),_p=psSqPhoto;psSqPhoto=function(q){try{const f=q&&m[String(q.label||"").replace(/\u200b/g,"")];if(f){const i=libIdx(f);const P=i>=0?PS_PHOTO_DATA[i]:null;if(P&&P.d)return P}}catch(e){}return _p.apply(this,arguments)};psSqPhoto._rvpp=1};
addEventListener("load",()=>setTimeout(outer,2000));if(document.readyState==="complete")setTimeout(outer,2000);
run();addEventListener("load",()=>setTimeout(run,1500));[0,1500,5000,12000].forEach(t=>setTimeout(run,t));
})();
