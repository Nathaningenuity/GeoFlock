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
];
/* card photos: "tour|title" → library file name (f) */
const CARD={/*CARD*/
};
/* photo-pin pictures: label (zero-width spaces stripped) → library file name */
const SQ={/*SQ*/
};
/* captions */
const CAP={/*CAP*/
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
  const f=q&&SQN[strip(q.label)];if(f){const i=libIdx(f);if(i>=0){PS_SQ_IMG[q.label]=i;try{q.img=i}catch(e){}}}})})}}catch(e){}}
function run(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 try{window.GF_PHCAP=window.GF_PHCAP||{};for(const l in CAP){GF_PHCAP[l]=CAP[l];GF_PHCAP[l+"​"]=CAP[l]}}catch(e){}
 cards();imgs()}catch(e){console.error("review-photos2",e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{run()}catch(e){}return _g.apply(this,arguments)}}
/* other files also pick pictures: wrap psSqPhoto and psPhotoFor last, after load, so the pictures chosen here win */
const P=f=>{const i=libIdx(f);const X=i>=0?PS_PHOTO_DATA[i]:null;return X&&X.d?X:null};
const outer=()=>{
 if(typeof psSqPhoto==="function"&&!psSqPhoto._rvp2){const _p=psSqPhoto;psSqPhoto=function(q){try{const f=q&&SQN[strip(q.label)];if(f){const X=P(f);if(X)return X}}catch(e){}return _p.apply(this,arguments)};psSqPhoto._rvp2=1}
 if(typeof psPhotoFor==="function"&&!psPhotoFor._rvp2){const _f=psPhotoFor;psPhotoFor=function(St){try{if(St&&typeof ps!=="undefined"&&ps){const f=CARD[ps.tour+"|"+strip(St.title)];if(f){const X=P(f);if(X)return X}}}catch(e){}return _f.apply(this,arguments)};psPhotoFor._rvp2=1}};
addEventListener("load",()=>setTimeout(outer,2500));if(document.readyState==="complete")setTimeout(outer,2500);
run();addEventListener("load",()=>setTimeout(run,1500));[0,1500,5000,12000].forEach(t=>setTimeout(run,t));
})();
