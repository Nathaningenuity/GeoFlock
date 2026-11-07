/* GeoFlock: the Animals tour, every animal of "Seventeen wild countries" met again later in the tour.
   The world map of seventeen animal photos (bald eagle to red kangaroo) is a preview: each animal now has a photo pin on a
   later stop, and that map is the tour's cover (photos/cover_animals.webp, set in geoflock-polish-m.js).
   - Two new stops: "The Congo rainforest" (okapi, bonobo, forest elephants, eastern lowland gorilla, the Congo River),
     after The Wallace Line, so the tour goes Africa then Madagascar; and "Up in the Andes" (llama, vicuña, Andean condor,
     spectacled bear), after the Galápagos.
   - The Wallace Line: the Komodo dragon on Komodo island (its pin used the card's own photo, so another script dropped it
     after the photos were drawn and the remaining labels pointed at the wrong places), the Philippine tarsier, a
     bird-of-paradise and red kangaroos; the Bornean elephant, tree-kangaroo, cassowary and cockatoo pins make way.
   - Amazon wildlife: scarlet ibises at the river's mouth (in place of the scarlet macaw photo; the five-photo cap of
     geoflock-wildlife.js would otherwise drop the piranhas the card names). Elephant country: springbok in the Kalahari.
   - On the edge: a world view, with the golden poison frog (red) and the bald eagle (green); the Sumatran rhino pin uses
     the calf photo, not the card's photo (same dropped-pin problem as on the Wallace Line).
   - On any stop of this tour, photos drawn before another script cut the pin list are drawn again from the list (the
     photos had each been joined to the next pin's place: Escobar's hippos pointed at Australia).
   Photo pins are added the way geoflock-polish-m.js does it: each picture joins the photo library, and the stop's phPins
   becomes a getter that always includes them, whatever other scripts set the list to later.
   New pictures (Openverse search, free licences): listed in AN2_PHOTOS. Load right after geoflock-polish-m.js. */
(function(){
"use strict";
const AN2_PHOTOS=[
 {f:"Grauer's gorilla (Gorilla beringei graueri), Kahuzi-Biega.jpg",d:"photos/xa55773156e7e24e6.webp",by:"Mitchell Robinson",lic:"CC BY-SA 4.0",page:"https://www.inaturalist.org/photos/330155938"},
 {f:"Male Andean Condor.jpg",d:"photos/x10f6ff62b63b168d.webp",by:"digitalART2",lic:"CC BY 2.0",page:"https://www.flickr.com/photos/44237541@N00/1280977496"},
 {f:"Spectacled Bear (Tremarctos ornatus).jpg",d:"photos/xb7e1f45ec788dd00.webp",by:"Jason Pratt",lic:"CC BY 2.0",page:"https://www.flickr.com/photos/84108876@N00/3127815718"},
 {f:"Sumatran Rhino 2 (calf).jpg",d:"photos/sumatran_rhino_pin.webp",by:"Charles W. Hardin",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Sumatran_Rhino_2.jpg"}];
const RED="#c0392b",GRN="#2e8b57",AN="#8a6a3a";
/* a photo pin: label, place, library file */
const pin=(label,at,f,col)=>({label,at,f,col:col||AN});
function lib(f){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===f&&q.d);
 if(i<0){const p=AN2_PHOTOS.find(q=>q.f===f);if(!p)return -1;PS_PHOTO_DATA.push(Object.assign({},p));i=PS_PHOTO_DATA.length-1}return i}catch(e){return -1}}
function libAdd(x){const i=lib(x.f);if(i<0)return -1;try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}
function setProp(S,k,v){try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{S[k]=v}catch(e2){}}}
const asPin=x=>({at:x.at.slice(),label:x.label,col:x.col,icon:"photo",_f:x.f,img:libAdd(x)});

/* ---------- photo pins on the existing stops ---------- */
const EDIT={
 "The Wallace Line":{drop:/^(Bornean elephant|Tree-kangaroo|Cassowary|Cockatoo|Kangaroo|Komodo dragon)$/,add:[
   pin("Philippine tarsier",[124.1,9.8],"Philippine tarsier (Carlito syrichta fraterculus) Bohol.jpg"),
   pin("Komodo dragon, Komodo Island",[119.49,-8.55],"Komodo dragon, Varanus komodoensis, Komodo Island, Indonesia, 20250822 1319 2752.jpg"),
   pin("Bird-of-paradise",[146.5,-8.6],"Raggiana Bird-of-paradise 0A2A5379.jpg"),
   pin("Red kangaroos",[133,-23],"Red Kangaroos at Sturt National Park NSW.jpg")],
  body:"West of this invisible line live Asian animals like tigers and orangutans. East of it, birds-of-paradise and kangaroos take over, as in Australia.",
  more:"Alfred Russel Wallace noticed the line in the 1850s. The deep straits between Bali and Lombok, and Borneo and Sulawesi, stayed water even in the Ice Ages, when sea levels fell and the other islands were joined to Asia or Australia. Komodo dragons, the biggest lizards on Earth, live just east of the line, on Komodo and a few nearby islands. Tarsiers, tiny primates whose eyes are each about as big as their brain, live on the islands of the Philippines, Borneo, Sumatra and Sulawesi."},
 "Amazon wildlife":{drop:/^Scarlet macaw$/,add:[pin("Scarlet ibis",[-49.6,-0.9],"Scarlet ibis, Venezuela.jpg"),pin("Red-bellied piranha",[-55,-2.2],"Red-bellied piranha.jpg")],
  more:"New species are still found there every few days. Scarlet ibises nest in the mangroves at the river’s mouth; the red crabs and shrimps they eat turn them red. About a fifth of the forest has been cleared since the 1970s, mostly for cattle ranches and soy farms; scientists worry that past a certain point, parts of it could dry out into savanna."},
 "Elephant country":{add:[pin("Springbok",[23.6,-21.4],"Springbok herd, South Africa.jpg")],
  more:"Africa had millions of elephants a century ago; now there are about 415,000, because of hunting for ivory and the loss of land to farms. African elephants are the biggest land animals; Asian elephants are smaller, with smaller ears. On the dry Kalahari grasslands to the south live springbok, antelope that can go for months without drinking, getting their water from the plants they eat."},
 "On the edge":{drop:/^(Sumatran rhino|Mountain gorilla|Snow leopard|Saiga)$/,add:[
   pin("Sumatran rhino calf",[101.5,-1.2],"Sumatran Rhino 2 (calf).jpg",RED),
   pin("Snow leopard",[86,31.5],"Panthera uncia - Zoo Karlsruhe.jpg",RED),
   pin("Golden poison frog",[-76.9,5.6],"Golden poison frog.jpg",RED),
   pin("Saiga",[66.5,48.6],"Saiga antelope at the Stepnoi Sanctuary.jpg",GRN),
   pin("Mountain gorilla",[29.55,-1.45],"Mountain gorilla (Gorilla beringei beringei) female with baby.jpg",GRN),
   pin("Bald eagle: back from DDT",[-94,46],"Bald eagle about to fly in Alaska (2016).jpg",GRN)],
  view:[-180,-58,180,80],globe:[10,20,0.95],
  body:"Red photos are animals still sliding: fewer than 50 Sumatran rhinos are left, scattered in Sumatra’s forests; snow leopards are hard to count in their high mountains; and the golden poison frog, one of the most poisonous animals on Earth, is losing its small patch of Colombian rainforest to farms and mines. Green photos are comebacks: saiga antelope, mountain gorillas and the bald eagle, like the tigers, lions and pandas of the last stops, show that protection works.",
  more:"What worked was nearly always the same: guarded reserves, an end to hunting, and local people who gain from the animals living. The saiga died in hundreds of thousands in 2015, yet they now number well over a million. Mountain gorillas, about 250 in the 1980s, passed 1,000 thanks to rangers and gorilla tourism. In 1963 only about 400 pairs of bald eagles nested in the lower 48 United States, their eggs thinned by the pesticide DDT; after DDT was banned in 1972 they came back to over 300,000 birds. Far from this map, fewer than ten vaquitas survive in the Gulf of California, drowned in illegal fishing nets, and wild axolotls cling on in the canals of Mexico City."}
};
/* a stop whose photo-pin list was cut after the photos were drawn (another script drops a pin that repeats the card's
   photo) kept the old photos, each now joined to the wrong place: draw them again from the list as it is */
function resync(){try{if(typeof ps==="undefined"||!ps||ps.tour!=="animals"||typeof psPhPinsSync!=="function")return;const S=psSteps()[ps.i],P=S&&S.phPins||[];
 const L=document.querySelector(".ps-phpins");if(!L||L._for!==S)return;const E=L.querySelectorAll(".ps-sq");
 const cap=q=>{try{return typeof psSqCap==="function"?psSqCap(q.label):q.label}catch(e){return q.label}};
 const bad=E.length!==P.length||[...E].some(el=>{const q=P[+el.dataset.ph],sp=el.querySelector("span");return !q||(sp&&sp.textContent.trim()!==String(cap(q)).trim())});
 if(bad){L._for=null;psPhPinsSync()}}catch(e){}}
function edit(S){try{if(!S||typeof ps==="undefined"||!ps||ps.tour!=="animals")return;const X=EDIT[S.title];if(!X)return;
 ["body","more","stat"].forEach(k=>{if(X[k]&&S[k]!==X[k])setProp(S,k,X[k])});
 if(X.view&&!S._an2v){S._an2v=1;setProp(S,"view",X.view.slice());setProp(S,"_ff",1);if(X.globe)setProp(S,"globe",X.globe.slice())}
 if(S._an2p)return;S._an2p=1;const mine=X.add.map(asPin);
 let base=Array.isArray(S.phPins)?S.phPins.slice():[];
 const merged=()=>base.filter(q=>q&&!mine.some(m=>m.label===q.label)&&!(X.drop&&X.drop.test(String(q.label||"").replace(/​/g,"").trim()))).concat(mine);
 let cache=null,ck=null;
 Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){if(ck!==base){ck=base;cache=merged()}return cache},set(v){base=Array.isArray(v)?v.filter(q=>!mine.includes(q)):[]}});
 S._sqPruned=-1}catch(e){console.error(e)}}

/* ---------- the two new stops ---------- */
const NEW=[
 {after:"The Wallace Line",card:"Rainforest - Ituri (20874628148).jpg",s:{title:"The Congo rainforest",view:[8,-11,34,8],globe:[22,-1,3.2],card:"left",hi:["cd"],riv:["Congo"],
  pins:[],
  ph:[pin("Okapi",[28.6,1.4],"Giraffidae Okapia johnstoni 3.2.jpg"),
   pin("Bonobo",[21.3,-2.2],"Bonobo (Pan paniscus) at Lola Ya Bonobo - 3.JPG"),
   pin("Forest elephants",[16.2,2.95],"African forest elephants at Dzanga Bai, Central African Republic.jpg"),
   pin("Grauer’s gorilla",[28.7,-2.3],"Grauer's gorilla (Gorilla beringei graueri), Kahuzi-Biega.jpg"),
   pin("The Congo River, Kisangani",[25.2,0.5],"Aerial view of the Congo River near Kisangani.jpg")],
  stat:"The Congo Basin holds Africa’s largest rainforest, the second largest on Earth after the Amazon, and more than half of it is in DR Congo",
  body:"The forest grows on both sides of the equator, in the basin of the Congo River. The river splits the forest in two, and some animals never cross it: bonobos live only south of it, chimpanzees only to the north and east. Okapis, forest cousins of the giraffe with zebra-striped legs, live wild only in DR Congo.",
  more:"The Congo is the deepest river known, over 220 m deep in places, and only the Amazon carries more water. Forest elephants are smaller than savanna elephants, with straighter tusks, and they plant the forest by spreading seeds in their dung. In the mountains of the east live the biggest gorillas of all, eastern lowland (Grauer’s) gorillas, found only in DR Congo, and the mountain gorillas of Virunga, Africa’s oldest national park."}},
 {after:"Galápagos: animals with no fear",card:"Colors of Altiplano Boliviano 4340m Bolivia Luca Galuzzi 2006.jpg",s:{title:"Up in the Andes",view:[-88,-24,-58,8],globe:[-74,-8,3],card:"left",hi:[],
  pins:[],
  ph:[pin("Llama at Machu Picchu",[-72.55,-13.16],"Llama on Machu Picchu.jpg"),
   pin("Vicuña",[-78.82,-1.47],"Vicuña - Chimborazo, Ecuador.jpg"),
   pin("Andean condor",[-71.9,-15.6],"Male Andean Condor.jpg"),
   pin("Spectacled bear",[-75.6,2.4],"Spectacled Bear (Tremarctos ornatus).jpg")],
  stat:"The Andes run about 7,000 km down South America, the longest mountain range on land, and their high grasslands have animals built for thin, cold air",
  body:"High in the Andes, above about 3,500 m, each breath holds about a third less oxygen than at sea level. Vicuñas and guanacos, wild cousins of the camel, have blood that grabs oxygen well and thick wool against the cold. People here tamed the guanaco into the llama, and the vicuña into the alpaca, thousands of years ago.",
  more:"The Inca moved goods across their empire on llamas, which can carry about 30 kg for days over the mountains. Hunting for their fine wool left only about 6,000 vicuñas by the 1960s; protected since, they now number over 400,000. The Andean condor, with wings about 3 m across, rides the mountain winds, and the spectacled bear, South America’s only bear, lives in the cloud forests lower down."}}];
function build(o){const s=Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,_ff:1,mode:"nature",nsub:"biomes"},JSON.parse(JSON.stringify(Object.assign({},o.s,{ph:undefined}))));
 delete s.ph;const P=o.s.ph.map(asPin);let base=P;
 Object.defineProperty(s,"phPins",{configurable:true,enumerable:true,get(){return base},set(v){if(Array.isArray(v))base=v}});s._an2p=1;return s}
function cards(){try{if(typeof PS_PHOTO==="undefined")return;NEW.forEach(o=>{const i=lib(o.card);if(i>=0)PS_PHOTO["animals|"+o.s.title]=i})}catch(e){}}
function insert(){try{if(typeof PS_TOURS==="undefined"||!PS_TOURS.animals)return false;const st=PS_TOURS.animals.steps;if(!Array.isArray(st)||!st.length)return false;
 if(typeof PS_PHOTO_DATA==="undefined")return false;
 NEW.forEach(o=>{if(st.some(x=>x&&x.title===o.s.title))return;let i=st.findIndex(x=>x&&x.title===o.after);if(i<0)i=st.length-2;st.splice(i+1,0,build(o))});
 /* The Wallace Line is moved to the 4th place when the tour opens: the Congo stays right after it */
 const w=st.findIndex(x=>x&&x.title==="The Wallace Line"),c=st.findIndex(x=>x&&x.title==="The Congo rainforest");
 if(w>=0&&c>=0&&c!==w+1){const [C]=st.splice(c,1);st.splice(st.findIndex(x=>x&&x.title==="The Wallace Line")+1,0,C)}
 cards();return true}catch(e){console.error(e);return false}}
[0,800,2000,5000,10000,15000].forEach(ms=>setTimeout(insert,ms));
function wrap(){let ok=true;
 if(typeof psGo==="function"&&!psGo._an2){const _g=psGo;psGo=function(i){try{insert();const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];edit(S)}catch(e){}const r=_g.apply(this,arguments);[0,400,1500].forEach(ms=>setTimeout(resync,ms));return r};psGo._an2=1}else if(typeof psGo!=="function")ok=false;
 if(typeof psLaunchTour==="function"&&!psLaunchTour._an2){const _l=psLaunchTour;psLaunchTour=function(id){try{if(id==="animals")insert()}catch(e){}const r=_l.apply(this,arguments);try{if(id==="animals")setTimeout(insert,0)}catch(e){}return r};psLaunchTour._an2=1}else if(typeof psLaunchTour!=="function")ok=false;
 return ok}
/* other scripts wrap psGo later too: keep checking for a while that this wrapper is in the chain */
let n=0;const t=setInterval(()=>{wrap();if(++n>40)clearInterval(t)},500);
window.gfAnimals2={insert,edit,NEW,EDIT};
})();
