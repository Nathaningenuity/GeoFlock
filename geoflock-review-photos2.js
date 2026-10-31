/* GeoFlock: photos for gaps left after the review (follows geoflock-review-phys-photos.js).
   Four CC BY-ND photos were removed from the library (Garment workers rally in Dhaka, Oil spill in the Niger Delta,
   Millennium Development Goals poster, Rwanda's parliament in session), leaving their card photos and photo pins
   empty; a few other photo pins had no picture, and five Physical Earth stops had no card photo. This file adds
   checked Wikimedia Commons photos (author, licence, page below), sets those card photos and pin pictures, and
   installs a final psSqPhoto / psPhotoFor wrapper after load so its picks win.
   Card photos: PS_PHOTO["tour|title"]; photo pins: PS_SQ_IMG[label]; captions: GF_PHCAP. */
(function(){
"use strict";
window.GF_REVIEW_PHOTOS2=[/*PHOTOS*/
{"f":"Millennium Development Goals, UN Headquarters, New York City, New York - 20080501.jpg","d":"photos/x694a28f90513f0db.webp","by":"Babucke","lic":"Public domain","page":"https://commons.wikimedia.org/wiki/File:Millennium_Development_Goals,_UN_Headquarters,_New_York_City,_New_York_-_20080501.jpg"},
{"f":"Burning Gas Flare Nembe Creek, Nigeria.tif","d":"photos/x65f5d2bb19d0c4bc.webp","by":"Sara Leigh Lewis","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:Burning_Gas_Flare_Nembe_Creek,_Nigeria.tif"},
{"f":"Garment factory in Bangladesh Women working.jpg","d":"photos/x4463effcb1f311a6.webp","by":"Tareq Salahuddin","lic":"CC BY 2.0","page":"https://commons.wikimedia.org/wiki/File:Garment_factory_in_Bangladesh_Women_working.jpg"},
{"f":"Garment factory in Dhaka.jpg","d":"photos/xd4835b38f9586a18.webp","by":"Kroisenbrunner","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:Garment_factory_in_Dhaka.jpg"},
{"f":"An aerial view of new look of Rwanda Parliament Building in Kimihurura, Kigali on May 16, 2019. Emmanuel Kwizera.jpg","d":"photos/xfe0ccaf98fc41202.webp","by":"Emmanuel Kwizera","lic":"CC BY-SA 4.0","page":"https://commons.wikimedia.org/wiki/File:An_aerial_view_of_new_look_of_Rwanda_Parliament_Building_in_Kimihurura,_Kigali_on_May_16,_2019._Emmanuel_Kwizera.jpg"},
{"f":"The Niger delta.jpg","d":"photos/xee4227e89f91fdfb.webp","by":"European Space Agency (Envisat)","lic":"CC BY-SA 3.0 IGO","page":"https://commons.wikimedia.org/wiki/File:The_Niger_delta.jpg"},
{"f":"Aldbrough (Mount Pleasant) No Parking! - geograph.org.uk - 239850.jpg","d":"photos/xc47916d824ce2bd5.webp","by":"Paul Anderson","lic":"CC BY-SA 2.0","page":"https://commons.wikimedia.org/wiki/File:Aldbrough_(Mount_Pleasant)_No_Parking!_-_geograph.org.uk_-_239850.jpg"},
{"f":"Ice road saimaa.JPG","d":"photos/x12955219e75125ad.webp","by":"Becca8383","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Ice_road_saimaa.JPG"},
{"f":"Denmark-Strait-pack-ice.jpg","d":"photos/x806152cef19477e0.webp","by":"Algkalv","lic":"CC BY-SA 3.0","page":"https://commons.wikimedia.org/wiki/File:Denmark-Strait-pack-ice.jpg"},
{"f":"Desierto florido.jpg","d":"photos/x0962d81c9dfadbc6.webp","by":"Javier Rubilar","lic":"CC BY-SA 2.0","page":"https://commons.wikimedia.org/wiki/File:Desierto_florido.jpg"}
];
/* card photos: "tour|title" → library file name (f) */
const CARD={/*CARD*/
"hg7d|From 8 goals to 17":"Millennium Development Goals, UN Headquarters, New York City, New York - 20080501.jpg",
"hg7a|Dependency and commodity dependence":"Burning Gas Flare Nembe Creek, Nigeria.tif",
"hg7a|Women at work":"Garment factory in Bangladesh Women working.jpg",
"hg7a|Women and development":"An aerial view of new look of Rwanda Parliament Building in Kimihurura, Kigali on May 16, 2019. Emmanuel Kwizera.jpg",
"hg7c|Comparative advantage":"Garment factory in Bangladesh Women working.jpg",
"volcanoes|The biggest bang in a century":"ISS-66 Atmospheric plume from 2022 Hunga Tonga eruption (1).jpg",
"coasts|The coast that eats villages":"Aldbrough (Mount Pleasant) No Parking! - geograph.org.uk - 239850.jpg",
"ice|Driving on lakes":"Ice road saimaa.JPG",
"deserts|When the driest desert flowers":"Desierto florido.jpg",
"seas|The biggest waterfall is underwater":"Denmark-Strait-pack-ice.jpg"
};
/* photo-pin pictures: label (zero-width spaces stripped) → library file name */
const SQ={/*SQ*/
"Little Dome C: the 1.2-million-year core":"Ice-core drill hg.jpg",
"Niger Delta: oil":"Burning Gas Flare Nembe Creek, Nigeria.tif",
"Dhaka: garments for export":"Garment factory in Dhaka.jpg",
"Dhaka: from six to two":"Garment factory in Bangladesh Women working.jpg",
"Dhaka: garment jobs":"Garment factory in Bangladesh Women working.jpg",
"Dhaka: garments":"Garment factory in Dhaka.jpg",
"Dhaka":"Crowd in shopping before Eid-ul-Fitr 02.jpg",
"Kigali: women in parliament":"An aerial view of new look of Rwanda Parliament Building in Kimihurura, Kigali on May 16, 2019. Emmanuel Kwizera.jpg",
"India: about 200 million, more than Egypt":"A large queue of Muslim voters at a polling station near Jama Masjid, Delhi on 14 January 1952.jpg",
"Duisburg: Mercator’s map, 1569":"Mercator 1569.png",
"Duisburg: Mercator's map, 1569":"Mercator 1569.png",
"Mouth, over 4,000 km later":"The Niger delta.jpg"
};
/* captions */
const CAP={/*CAP*/
"Little Dome C: the 1.2-million-year core":"An EPICA ice-core drill",
"Niger Delta: oil":"Gas flare, Nembe Creek",
"Dhaka: garments for export":"A garment workshop in Dhaka",
"Dhaka: from six to two":"Garment workers, Bangladesh",
"Dhaka: garment jobs":"A garment factory, Bangladesh",
"Dhaka: garments":"A garment workshop in Dhaka",
"Kigali: women in parliament":"Rwanda’s parliament, Kigali",
"India: about 200 million, more than Egypt":"Muslim voters, Delhi, 1952",
"Mouth, over 4,000 km later":"The Niger delta from space"
};

const strip=s=>String(s==null?"":s).replace(/​/g,"");
const SQN={};for(const l in SQ)SQN[strip(l)]=SQ[l];
function libIdx(f){try{let j=-1;for(let i=0;i<PS_PHOTO_DATA.length;i++){const x=PS_PHOTO_DATA[i];if(x&&x.f===f&&x.d){j=i;break}}return j}catch(e){return -1}}
function merge(){try{if(typeof PS_PHOTO_DATA==="undefined")return;const have=new Set(PS_PHOTO_DATA.filter(p=>p&&p.d).map(p=>p.f));
 GF_REVIEW_PHOTOS2.forEach(p=>{if(!have.has(p.f)){PS_PHOTO_DATA.push(p);have.add(p.f)}})}catch(e){}}
try{if(!(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")&&typeof GF_EXTRA_PHOTOS!=="undefined")GF_REVIEW_PHOTOS2.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
function cards(){for(const k in CARD){const i=libIdx(CARD[k]);if(i<0)continue;const c=PS_PHOTO[k];
 if(c==null||!(PS_PHOTO_DATA[c]&&PS_PHOTO_DATA[c].d))PS_PHOTO[k]=i}}
function imgs(){window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const l in SQ){const i=libIdx(SQ[l]);if(i>=0)PS_SQ_IMG[l]=i}
 try{for(const id in PS_TOURS){const t=PS_TOURS[id];if(!t||!Array.isArray(t.steps))continue;t.steps.forEach(s=>{(s&&Array.isArray(s.phPins)?s.phPins:[]).forEach(q=>{
  const f=q&&SQN[strip(q.label)];if(f){const i=libIdx(f);if(i>=0){PS_SQ_IMG[q.label]=i;try{q.img=i;q._gfImg=i}catch(e){}}}})})}}catch(e){}}
function run(){try{outer();if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 try{window.GF_PHCAP=window.GF_PHCAP||{};for(const l in CAP){GF_PHCAP[l]=CAP[l];GF_PHCAP[l+"​"]=CAP[l]}}catch(e){}
 cards();imgs()}catch(e){console.error("review-photos2",e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{run()}catch(e){}return _g.apply(this,arguments)}}
/* other files also pick pictures: wrap psSqPhoto and psPhotoFor last, after load, so the pictures chosen here win */
const P=f=>{const i=libIdx(f);const X=i>=0?PS_PHOTO_DATA[i]:null;return X&&X.d?X:null};
const outer=()=>{
 if(typeof psSqPhoto==="function"&&!psSqPhoto._rvp2){const _p=psSqPhoto;psSqPhoto=function(q){try{const f=q&&SQN[strip(q.label)];if(f){const X=P(f);if(X)return X}}catch(e){}return _p.apply(this,arguments)};psSqPhoto._rvp2=1}
 if(typeof psPhotoFor==="function"&&!psPhotoFor._rvp2){const _f=psPhotoFor;psPhotoFor=function(St){try{if(St&&typeof ps!=="undefined"&&ps){const f=CARD[ps.tour+"|"+strip(St.title)];if(f){const X=P(f);if(X)return X}}}catch(e){}return _f.apply(this,arguments)};psPhotoFor._rvp2=1}};
addEventListener("load",()=>setTimeout(outer,2500));if(document.readyState==="complete")setTimeout(outer,2500);[6000,13000,25000].forEach(t=>setTimeout(outer,t));
run();addEventListener("load",()=>setTimeout(run,1500));[0,1500,5000,12000].forEach(t=>setTimeout(run,t));
})();
