/* GeoFlock: new tour covers that say the subject at a glance — Maths gets Oliver Byrne's coloured proof of Pythagoras'
   theorem (Euclid's Elements, 1847; the diagram and the theorem, cropped from the page) and Psychology gets the first card of Hermann Rorschach's inkblot test (1921).
   Loaded after geoflock-tourcovers.js, so it has the last word on TOUR_THUMBS for these tours (tourcovers.js skips its
   Maths swap for any tour set here). The photos are freely licensed files from Wikimedia Commons (GF_COVERS2_PHOTOS, with
   author, licence and page), joined to the shared photo library the way geoflock-polish-k.js does it. */
window.GF_COVERS2_PHOTOS=[
 {f:"Byrne 1847 Pythagoras Querformat.jpg",d:"photos/x5dff1f65126282b6.webp",by:"Oliver Byrne (The First Six Books of the Elements of Euclid, 1847); scan by Dr Mirko Junge",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Byrne_1847_Pythagoras_Querformat.jpg"},
 {f:"Rorschach blot 01.jpg",d:"photos/x859e1bbbb29babb8.webp",by:"Hermann Rorschach (1921)",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Rorschach_blot_01.jpg"}
];
(function(){
const COVER={maths:"photos/x5dff1f65126282b6.webp",psychology:"photos/x859e1bbbb29babb8.webp"};
/* crop: keep the top of Byrne's red square in the card */
const POS={maths:"50% 30%"};
window.gfCovers2=COVER;
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_COVERS2_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")merge();else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_COVERS2_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
function set(){try{if(typeof TOUR_THUMBS==="undefined")return;merge();for(const id in COVER)TOUR_THUMBS[id]=COVER[id]}catch(e){}}
set();addEventListener("load",()=>{set();setTimeout(set,1700)});
const css=Object.keys(POS).map(id=>'.tr-thumb[data-tour-go="'+id+'"] img,.hx-tour[data-hx-tour="'+id+'"] .hx-tour-pic img{object-position:'+POS[id]+'}').join("\n");
if(css){const st=document.createElement("style");st.textContent=css;document.head.appendChild(st)}
})();
