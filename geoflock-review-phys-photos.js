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
{"f":"Salton Sea 01 2013.jpg","d":"photos/x80c8135e428f0d95.webp","by":"Tuxyso","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Salton_Sea_01_2013.jpg"}
];
/* card photos: "tour|title" → library file name (f) */
const CARD={/*CARD*/
"elev|Sea level isn’t level":"Geoid undulation 10k scale.jpg",
"lakes|A lake made by mistake":"Salton Sea 01 2013.jpg",
"islands|No snakes in Ireland":"Benny Trapp Vipera berus.jpg",
"rivers|The Amazon once flowed west":"Aerial view of the Amazon Rainforest.jpg",
"deserts|Death Valley’s heat trap":"Boardwalk at Badwater Basin, Death Valley National Park, California.jpg"
};
/* photo pins to (re)place on a stop: "tour|title" → [[lon,lat],label,file]; replaces a pin of the same label */
const PINS={/*PINS*/
"lakes|A lake made by mistake":[[[-115.95,33.4],"The Salton Sea","Salton Sea 01 2013.jpg"]],
"islands|No snakes in Ireland":[[[-2.5,51.3],"The adder, Britain’s native viper","Benny Trapp Vipera berus.jpg"]]
};
/* existing photo pins (any stop) whose label gets this picture */
const SQ={/*SQ*/
"Saimaa, Finland’s largest lake":"Lake Saimaa aerial.jpg",
"Straits of Mackinac: Michigan and Huron meet":"Mackinac Bridge Walk.jpg",
"Saint Martin: French north, Dutch south":"Grand Case auf Saint Martin.jpg",
"Strait of Magellan":"00 2521 Punta Arenas - Chile.jpg",
"Quito ~2,850 m":"Quito DotM banner.jpg"
};
/* captions for labels the caption rule would get wrong */
const CAP={/*CAP*/
"Straits of Mackinac: Michigan and Huron meet":"The Straits of Mackinac",
"Saint Martin: French north, Dutch south":"Grand Case, Saint-Martin",
"Strait of Magellan":"Punta Arenas on the Strait"
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
run();addEventListener("load",()=>setTimeout(run,1500));[0,1500,5000,12000].forEach(t=>setTimeout(run,t));
})();
