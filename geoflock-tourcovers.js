/* GeoFlock: the cover picture of each guided tour, in one place. Loaded after every tour file and the shelves file, so it has
   the last word on TOUR_THUMBS. Most subject tours (Physical Earth, Living planet, People & culture, Ideas & arts, Power &
   economy) get one iconic photo that says the topic at a glance; a few keep their map cover because the map is the point
   (elevation, plate tectonics, climate, human migration, geopolitics, borders). Start here, Regions and the continent history
   tours keep their maps. Photos are files from the app's own photo library (author and licence in each library entry);
   the few new ones are listed in GF_TOURCOVER_PHOTOS with their credits and joined to the library like the tour files do.
   POS gives a crop position (CSS object-position) where the centre crop would cut the subject. */
window.GF_TOURCOVER_PHOTOS=[
 {f:"Pieter Bruegel the Elder - The Tower of Babel (Vienna) - Google Art Project - edited.jpg",d:"photos/x546debb7a1c39ad1.webp",by:"Pieter Bruegel the Elder (1563, Kunsthistorisches Museum, Vienna)",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg"},
 {f:"Into the Jaws of Death 23-0455M edit.jpg",d:"photos/xad4859e801ef2ea2.webp",by:"Robert F. Sargent, U.S. Coast Guard (Omaha Beach, 6 June 1944)",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Into_the_Jaws_of_Death_23-0455M_edit.jpg"}
];
(function(){
if(typeof TOUR_THUMBS==="undefined")return;
const COVER={
 /* Physical Earth (elev, plates, climate keep their maps) */
 weather:"photos/63e89f0f1ee7dfb8.webp",       /* Catatumbo lightning */
 rivers:"photos/2c86464f6fc1c882.webp",        /* Amazon meanders from the air */
 lakes:"photos/219a9da8185303cf.webp",         /* Moraine Lake, Banff */
 seas:"photos/dfc2228f633a7309.webp",          /* a breaking Pacific wave */
 coasts:"photos/x72768f24d02e00c1.webp",       /* the Twelve Apostles */
 islands:"photos/4515181c9a206c67.webp",       /* Bora Bora */
 deserts:"photos/d561612c3de5aa24.webp",       /* Rub' al Khali dunes */
 ice:"photos/xc489b4a888705131.webp",          /* iceberg in the Ilulissat Icefjord */
 ranges:"photos/747a185c48c9d604.webp",        /* Everest's north face */
 volcanoes:"photos/c461bbeeabdb6ae9.webp",     /* Anak Krakatau erupting */
 hazards:"photos/930b570d1cd187a2.webp",       /* the eye of Hurricane Florence from the ISS */
 caves:"photos/xb3378c2b589dcd9d.webp",        /* Naica's giant crystals */
 /* Living planet */
 forests:"photos/b2dcb9034ad8696e.webp",       /* Amazon rainforest from the air */
 ocean:"photos/cfb39cebccc9d689.webp",         /* reefscape, Bird's Head Seascape */
 amigration:"photos/f1c025a86ab24b5c.webp",    /* wildebeest crossing the Mara */
 environment:"photos/dca0847ac3e10b53.webp",   /* polar bear on drift ice */
 biomes:"photos/de3ee20861d85605.webp",        /* acacia at sunrise, Serengeti */
 islandlife:null,humans:null,animals:null,     /* their own photo covers stay */
 crops:"photos/abfe879172ff5cb6.webp",         /* maize cobs */
 /* People & culture (migration keeps its map) */
 people:"photos/775367a524a15285.webp",        /* Shibuya crossing */
 culture:"photos/x546debb7a1c39ad1.webp",                 /* Bruegel's Tower of Babel */
 langrel:"photos/dcaea11597ca53ec.webp",       /* Western Wall and Dome of the Rock */
 landmarks:"photos/6b923b9f55fdc6c9.webp",     /* Taj Mahal */
 /* Ideas & arts */
 music:"photos/8cd84a6b682fd1b5.webp",         /* a kora */
 philosophy:"photos/6ce322a62a9c847b.webp",    /* the Parthenon */
 mythology:"photos/057c2846f4914c3f.webp",     /* Stonehenge */
 maths:"photos/c42e80d75e85defd.webp",          /* the Great Pyramid: geometry in stone */
 /* Power & economy (geopol and borders keep their maps) */
 govmap:"photos/adb6b96d4f5194c8.webp",        /* Hungarian Parliament */
 politics:"photos/24bb01956a15d334.webp",      /* UN General Assembly hall */
 regions:"photos/4e9c552dbcaf4804.webp",       /* Hong Kong from the Peak */
 gdp:"photos/398242c17bedf52c.webp",           /* Pudong skyline */
 transport:"photos/ccc869827cc62263.webp",     /* a Maersk container ship */
 resources:"photos/291dc57d0366a4c3.webp",     /* oil pumpjack, Permian Basin */
 currencies:"photos/1b219c4a10a48cb6.webp",    /* Yap stone money */
 conflicts:"photos/d69f76a8fad90198.webp",     /* the DMZ at Panmunjom */
 /* History: the era tours */
 hmedieval:"photos/6fa6857ad0df08b9.webp",     /* Hagia Sophia */
 hgunpowder:"photos/7fa897c7ae40b0b7.webp",    /* Santa María replica */
 hrevolutions:"photos/2c283212b6dce7df.webp",  /* the Statue of Liberty */
 hwars:"photos/xad4859e801ef2ea2.webp"         /* Into the Jaws of Death, D-Day */
};
const POS={capitals:"50% 88%",hgunpowder:"50% 15%",hwars:"50% 55%",hrevolutions:"50% 30%"};
/* the new photos join the library (as the tour files do) */
try{const L=window.GF_TOURCOVER_PHOTOS;if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));L.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")L.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
function set(){for(const id in COVER)if(COVER[id])TOUR_THUMBS[id]=COVER[id]}
set();addEventListener("load",()=>setTimeout(set,1600));
/* crop positions on the tour cards and the home page tour tiles */
const css=Object.keys(POS).map(id=>'.tr-thumb[data-tour-go="'+id+'"] img,.hx-tour[data-hx-tour="'+id+'"] .hx-tour-pic img{object-position:'+POS[id]+'}').join("\n");
if(css){const st=document.createElement("style");st.textContent=css;document.head.appendChild(st)}
window.gfTourCovers=COVER;
})();
