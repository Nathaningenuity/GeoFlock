/* GeoFlock polish K: pictures for tour stops that showed only text labels. Turns the main text pins of the ideas tours
   (Literature, Art, Music, Mythology, Science, Maths, Psychology, Words, Learning) and of Festivals, Sports, Houses and
   Landmarks into photo pins (a famous scene, illustration, portrait or building that the label names), and adds card
   photos to stops that had none. New pictures are freely licensed files from Wikimedia Commons (GF_POLK_PHOTOS, with
   author, licence and page); the rest come from the shared library. Every patch is keyed by tour and stop title, so a
   renamed or removed stop is simply skipped; card photos are only filled in where a stop still has none. Load it after
   the tour files and the other polish patches. */
(function(){
/* new photos from Wikimedia Commons, added to the shared library */
window.GF_POLK_PHOTOS=[];
/* photo pins to add, by tour and stop title: {at, label, f (library file), drop: [text pins it replaces]}.
   A pin whose label equals a text pin's label replaces that text pin. */
const P=(at,label,f,drop)=>({at,label,f,drop:drop||[]});
const PINS={
 literature:{
  "The Epic of Gilgamesh":[P([45.64,31.32],"Uruk: Gilgamesh’s city","Uruk ziggurat (2).jpg")
   ],
  "Homer’s Troy and Ithaca":[],
  "The Mahabharata and the Ramayana":[],
  "The Tale of Genji":[
   ],
  "Dante’s journey":[],
  "Shakespeare’s London":[],
  "Don Quixote’s La Mancha":[],
  "Gutenberg’s printing press":[],
  "The great Russian novels":[
   ],
  "Magical realism in Colombia":[],
  "Things Fall Apart":[],
  "The Nobel map":[
   ],
  "The most translated books":[
   ]},
 art:{
  "The first artists":[P([119.68,-4.98],"Maros caves, Sulawesi","Leang Tedongnge rock art panel credit Basran Burhan.jpg")],
  "Angkor":[P([103.859,13.441],"The Bayon’s stone faces","Das Lächeln von Angkor.jpg")],
  "Gothic cathedrals":[]},
 music:{
  "The didgeridoo":[],
  "Vienna, city of music":[],
  "Down the Mississippi: blues and jazz":[]},
 mythology:{
  "Mount Olympus and Delphi":[],
  "Troy":[],
  "The flood":[],
  "Mount Kailash":[],
  "Loch Ness":[P([-4.44,57.32],"Urquhart Castle","Urquhart Castle Tower House 2.jpg")]},
 science:{
  "Zhang Heng’s earthquake detector":[],
  "Galileo’s telescope":[
   ],
  "Humboldt on Chimborazo":[],
  "Marie Curie":[],
  "The eclipse that tested Einstein":[],
  "Mapping the ocean floor":[],
  "CERN":[],
  "Dark skies":[]},
 maths:{
  "Counting in sixties":[],
  "Euclid’s Alexandria":[],
  "Zero travels west":[
   ],
  "The House of Wisdom":[],
  "Mercator’s stretched map":[P([6.76,51.43],"Duisburg: Mercator’s map, 1569","Mercator 1569.png")],
  "The coastline paradox":[]},
 words:{
  "Writing begins":[P([114.35,36.1],"Anyang: oracle bones, about 1200 BC","Shang Ox Bone Oracle Bone 03.jpg")],
  "Hangul: an alphabet by design":[],
  "Esperanto":[
   ]},
 learning:{
  "Nalanda":[P([85.44,25.14],"Nalanda","Temple 3 - Sariputta Stupa - Nalanda Mahavihara (10).jpg")],
  "Al-Qarawiyyin":[],
  "Exams for an empire":[],
  "The manuscripts of Timbuktu":[],
  "Cables under the sea":[],
  "The internet is born":[]},
 festivals:{
  "Sun, Moon or both":[P([35.22,31.78],"Jerusalem","Western wall and its square, jerusalem.jpg")],
  "Ramadan and Eid":[P([106.83,-6.17],"Jakarta","Istiqlal Mosque Jakarta prayer hall interior view 04.jpg")],
  "Christmas and Easter":[P([35.2,31.7],"Bethlehem","Church of the Nativity (7703592746).jpg"),
   P([39.04,12.03],"Lalibela: Christmas on 7 January","Lalibela, san giorgio, esterno 24.jpg")],
  "Inti Raymi":[P([-68.67,-16.55],"Tiwanaku: the Andean new year","PUERTA DEL SOL TIWANAKU.jpg")],
  "Oktoberfest and La Tomatina":[],
  "Harvest moons and Thanksgiving":[],
  "Fire and ice in midwinter":[]},
 sports:{
  "World Cup hosts":[],
  "Cricket and the Commonwealth":[],
  "Baseball’s map":[],
  "Sumo":[],
  "The Tour de France":[P([2.35,48.87],"Paris: the Champs-Élysées","Avenue des Champs-Élysées July 24, 2009 N1.jpg")
   ],
  "Where sports were invented":[]},
 houses:{
  "Snow houses":[],
  "Living underground":[],
  "Steep roofs for rain and snow":[],
  "Cities of towers":[]},
 landmarks:{
  "The Great Wall":[P([116.39,39.92],"Forbidden City","Sunset of the Forbidden City 2006.JPG")],
  "Seven ancient wonders":[
   ],
  "The New Seven Wonders":[P([12.49,41.89],"Colosseum","Colosseum in Rome-April 2007-1- copie 2B.jpg"),P([78.04,27.17],"Taj Mahal","Taj Mahal, Agra, India edit2.jpg"),
   P([-43.21,-22.95],"Christ the Redeemer","Rio de Janeiro - Cristo Redentor 01.jpg")],
  "The Statue of Liberty":[],
  "Machu Picchu":[P([-71.97,-13.53],"Cusco","Catedral de la ciudad del Cusco.jpg")],
  "Natural wonders":[P([-112.1,36.1],"Grand Canyon","Grand Canyon Hopi Point with rainbow 2013.jpg"),P([-43.17,-22.9],"Rio’s harbour","Rio skyline and Cristo Redentor from Sugarloaf Mountain, Brazil.jpg"),
   P([146,-18],"Great Barrier Reef","Aerial View of Great Barrier Reef (Ank Kumar) 09.jpg")],
  "World Heritage":[P([-3,16.77],"Timbuktu","Djinguereber Mosque, Timbuktu.jpg")]}
};
/* card photos for stops that had none ("tour|title" → library file); only used when the stop still has no photo */
const CARD={
 "mythology|Now explore":"Great Sphinx of Giza (أبو الهول).jpg",
 "science|Now explore":"Aldrin Apollo 11.jpg",
 "maths|Now explore":"Feet on prime meridian greenwich observatory.jpg",
 "psychology|Now explore":"Times square nuit.jpg",
 "words|Now explore":"Street signs in Tuzla.jpg",
 "learning|Now explore":"Bodleian MS. Huntington 214 roll332 frame36.jpg"
};
/* photo pins that showed the wrong thing for the stop */
const RM={"mythology|The flood":["A cuneiform tablet"]};

/* ---------- engine ---------- */
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
/* the ideas tours (geoflock-tours-ideas*.js) put back their own photo-pin list whenever its length changes; on those stops the
   new list is locked (psLock style: a getter that ignores assignments), so the shared pruning still works on it in place */
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const IDEAS=new Set(["literature","art","music","mythology","science","maths","psychology","words","learning"]);
const stopOf=(id,title)=>{try{const t=PS_TOURS[id];return t&&t.steps?t.steps.find(s=>s.title===title):null}catch(e){return null}};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_POLK_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")merge();else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_POLK_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}

function patch(){merge();
 for(const id in PINS){const t=(typeof PS_TOURS!=="undefined")&&PS_TOURS[id];if(!t||!t.steps||t.steps._polK)continue;t.steps._polK=1;
  for(const title in PINS[id]){const s=stopOf(id,title);if(!s)continue;
   try{const add=PINS[id][title].map(o=>({at:o.at,label:o.label,col:"#d9682b",icon:"photo",_f:o.f}));
    const labs=new Set(add.map(q=>strip(q.label)));
    const rm=new Set((RM[id+"|"+title]||[]).map(strip));
    const keep=(s.phPins||[]).filter(q=>!labs.has(strip(q.label))&&!rm.has(strip(q.label))).map(q=>Object.assign({},q));
    const arr=keep.concat(add);
    /* text pins that a photo pin now stands for */
    const drop=new Set(PINS[id][title].flatMap(o=>[strip(o.label)].concat(o.drop||[])));
    const fp=a=>Array.isArray(a)?a.filter(p=>!drop.has(strip(Array.isArray(p)?p[1]:p.text))):a;
    if(Array.isArray(s.pins))def(s,"pins",fp(s.pins));if(Array.isArray(s._pins0))s._pins0=fp(s._pins0);
    if(IDEAS.has(id))lock(s,"phPins",arr);else def(s,"phPins",arr);
    s._sqPruned=-1}catch(e){console.error(e)}}}
}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 for(const k in CARD){const i=libIdx(CARD[k]);if(i<0||PS_PHOTO[k]!=null)continue;const [id,title]=k.split("|");const s=stopOf(id,title);let has=null;
  try{const o=ps;ps={tour:id,i:0};try{has=s&&psPhotoFor(s)}finally{ps=o}}catch(e){}if(!has)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const id in PINS)for(const title in PINS[id]){const s=stopOf(id,title);if(s)reg(s)}}catch(e){console.error(e)}}
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
/* register just before a stop draws too, in case another file rebuilt the label map */
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&PINS[ps.tour]){const S=psSteps()[i];if(S)reg(S)}}catch(e){}return _g.apply(this,arguments)}}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
