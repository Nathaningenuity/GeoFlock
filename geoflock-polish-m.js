/* GeoFlock polish M
   1. The tour map key is not shown when all it would say is the stop's own title beside the highlight colour (it named
      nothing the card does not already say: "Weeping at the campsite", "Homer's Troy and Ithaca"...). Keys with a real label
      (keyLabel) or several entries stay.
   2. A photo pin that shows the same person as a portrait pin is dropped (Dostoevsky twice on "The great Russian novels"):
      it uses the portrait's picture, or stands at the same spot and names that person.
   3. Cards that describe the climate map's colours match its softened palette. */
(function(){
"use strict";
function wrapKey(){if(typeof psKeyInfo!=="function"||psKeyInfo._gfM)return typeof psKeyInfo==="function";const _k=psKeyInfo;
 psKeyInfo=function(S){const r=_k.apply(this,arguments);try{if(r&&r.items&&r.items.length===1&&r.items[0].c==="lit"&&S&&!S.keyLabel)r.items=[]}catch(e){}return r};psKeyInfo._gfM=1;return true}
const surname=n=>{const w=String(n||"").replace(/[,(].*$/,"").trim().split(/\s+/);return(w[w.length-1]||"").toLowerCase()};
function dedupe(S){try{if(!S||!Array.isArray(S.phPins))return;const P=(window.GF_PORTRAITS||[]).filter(x=>x.stop===S.title);
 const people=P.map(x=>({f:x.f,at:x.at,sn:surname(x.name)})).concat(S.phPins.filter(q=>q&&q.person).map(q=>({f:q._f,at:q.at,sn:surname(q.label)})));if(!people.length)return;
 for(let i=S.phPins.length-1;i>=0;i--){const q=S.phPins[i];if(!q||q.person)continue;const lab=String(q.label||"").toLowerCase();
  const dup=people.some(pp=>(pp.f&&q._f&&pp.f===q._f)||(pp.at&&q.at&&Math.hypot(pp.at[0]-q.at[0],pp.at[1]-q.at[1])<.2&&pp.sn.length>2&&lab.includes(pp.sn)&&!/home|house|grave|tomb|museum/.test(lab)));
  if(dup)S.phPins.splice(i,1)}}catch(e){console.error(e)}}
function wrapGo(){if(typeof psGo!=="function"||psGo._gfM)return typeof psGo==="function";const _g=psGo;
 psGo=function(i){try{sameLat();brandt();animalsNature()}catch(e){}try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];extras(S);dedupe(S);stopFix(S)}catch(e){}return _g.apply(this,arguments)};psGo._gfM=1;return true}
let n=0;const t=setInterval(()=>{const a=wrapKey(),b=wrapGo();if(a&&b||++n>60)clearInterval(t)},500);
/* 3. the Climate map's colours were softened (hot desert a rusty orange-red, cold desert pale salmon): the cards say so */
const TXT=[["(red and orange on the climate map laid over it)","(rusty red and orange on the climate map laid over it)"],
 ["The bright red areas on the climate map are deserts: hot deserts in deep red, cooler ones in pink.","The rusty red areas on the climate map are deserts: hot deserts in deep orange-red, cooler ones in pale salmon."]];
function fixText(){try{for(const t in PS_TOURS)(PS_TOURS[t].steps||[]).forEach(S=>{["body","more","stat"].forEach(k=>{let v=S[k];if(typeof v!=="string")return;TXT.forEach(([a,b])=>{if(v.includes(a))v=v.split(a).join(b)});if(v!==S[k])try{S[k]=v}catch(e){}})})}catch(e){}}
[0,1500,4000,9000].forEach(ms=>setTimeout(fixText,ms));
/* 4. photo pins added to stops when they open (other scripts lock and reset a stop's photo pins after load, so these are
   added at the moment the stop is shown): each picture joins the photo library, the text pin or paw icon it replaces goes */
const PH={
 /* Climate tour: a photo for each stop that had none */
 "climate|The rain belt":{add:[{at:[-60,-3.5],label:"Amazon: rain nearly every afternoon",col:"#2b7bb5",f:"Aerial view of the Amazon Rainforest.jpg",d:"@b2dcb9034ad8696e",by:"lubasi",lic:"CC BY-SA 2.0",page:""},
  {at:[116.55,6.0],label:"Borneo: clouds rising off the forest",col:"#2b7bb5",f:"Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 4.jpg",d:"@336e7edb653b5320",by:"kallerna",lic:"CC BY-SA 4.0",page:""}]},
 "climate|The desert belts":{add:[{at:[8,30.5],label:"Sahara: dunes near 30°N",col:"#c0703a",f:"Two star dunes in the Grand Erg Oriental.png",d:"@f6acbf4d64b2f922",by:"Heribertus2",lic:"CC BY-SA 4.0",page:""},
  {at:[15.3,-24.7],label:"Namib: dunes near 25°S",col:"#c0703a",f:"Sossusvlei Dune Rippled cropped.jpg",d:"@e2ba87703fcf4cf1",by:"Daniel Kraft",lic:"CC BY-SA 3.0",page:""}]},
 "climate|Monsoon climates":{add:[{at:[80.27,13.08],label:"Chennai: monsoon rain",col:"#2b7bb5",f:"India - Chennai - Monsoon - 01 (3058208937).jpg",d:"@165f6fc8a776e7f3",by:"McKay Savage",lic:"CC BY 2.0",page:""}]},
 /* Island life: the Komodo dragon itself (the card shows the island-rule chart instead) and the Aldabra tortoise */
 "islandlife|Island giants":{add:[{at:[119.45,-8.55],label:"Komodo dragon, 3 m long",col:"#1f8a7a",f:"Komodo dragon (Varanus komodoensis) walking in Komodo National Park, Indonesia.png",d:"photos/xfc364f6e6f7eeaf0.webp",by:"Komodoinside",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Komodo_dragon_%28Varanus_komodoensis%29_walking_in_Komodo_National_Park%2C_Indonesia.png"},
  {at:[46.35,-9.42],label:"Aldabra giant tortoise",col:"#1f8a7a",f:"Aldabra giant tortoise (Aldabrachelys gigantea) in Curieuse Island - 02.jpg",d:"photos/x4cbc28ee4deef088.webp",by:"NorbertNagel",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Aldabra_giant_tortoise_%28Aldabrachelys_gigantea%29_in_Curieuse_Island_-_02.jpg"}]},
 /* Literature: legend says the great odes were hung on the Kaaba in Mecca, hence their name, the Mu'allaqat ("the hung ones") */
 "literature|Weeping at the campsite":{add:[{at:[39.83,21.42],label:"The Kaaba: where legend hung the odes",f:"The Kaaba during Hajj.jpg",d:"photos/da9206e8f82900f76.webp",by:"Adli Wahid",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg"}],dropPins:/^Mecca$/},
 /* Extinction: the rhinos themselves, at the sanctuary (the calf from the card's picture, cropped, so not a repeat of it) */
 "bextinction|The last Sumatran rhinos":{add:[{at:[105.77,-4.93],label:"Way Kambas: rhino sanctuary",col:"#8a6a3a",f:"Sumatran Rhino 2 (calf).jpg",d:"photos/sumatran_rhino_pin.webp",by:"Charles W. Hardin",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Sumatran_Rhino_2.jpg"}],dropPins:/^Way Kambas/,dropIcons:"paw"},
 /* Extinction: the lost giants, each where it lived */
 "bextinction|Where people arrived, big animals vanished":{add:[
  {at:[-100,42],label:"Woolly mammoth",col:"#8a6a3a",f:"Woolly mammoth model Royal BC Museum in Victoria.jpg",d:"photos/x273402151e175b35.webp",by:"Thomas Quine",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Woolly_mammoth_model_Royal_BC_Museum_in_Victoria.jpg"},
  {at:[-62,-34],label:"Giant ground sloth",col:"#8a6a3a",f:"Megatherium americanum skeleton at the Natural History Museum, London.jpg",d:"photos/b6074a5fa5cae2cb3.webp",by:"APK",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:Megatherium_americanum_skeleton_at_the_Natural_History_Museum,_London.jpg"},
  {at:[46.9,-19],label:"Elephant bird",col:"#8a6a3a",f:"Aepyornis maximus.jpg",d:"photos/dc98305d4662f0449.webp",by:"Monnier",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Aepyornis_maximus.jpg"}],
  dropIcons:"paw",keepIconsAt:[[134,-25]],sym:[{at:[134,-25],e:"kangaroo",n:"Giant kangaroos and wombats, gone about 45,000 years ago"}]},
 /* the rest of the tours' paw prints: the animal itself, as a photo where the library has one, else an animal figure */
 "*|The Roc and the valley of diamonds":{add:[{at:[46.9,-19],label:"Elephant bird: the real Roc?",col:"#8a6a3a",f:"Aepyornis maximus.jpg",d:"photos/dc98305d4662f0449.webp",by:"Monnier",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Aepyornis_maximus.jpg"}],dropIcons:"paw",sym:[]},
 "*|Tortoises, mockingbirds and finches":{add:[{at:[-89.6,-0.9],label:"A San Cristóbal mockingbird",col:"#8a6a3a",f:"Galapagos mockingbird.JPG",d:"photos/b928f93c6694e2d74.webp",by:"Charles J. Sharp",lic:"CC BY-SA 3.0",page:"https://commons.wikimedia.org/wiki/File:Galapagos_mockingbird.JPG"}],dropIcons:"paw",sym:[{at:[-90.45,-1.28],e:"turtle",n:"Floreana’s tortoises"},{at:[-90.77,-0.24],e:"bird",n:"Finches on Santiago"}]},
 "*|The Panamanian golden frog":{add:[{at:[-80.13,8.6],label:"Panamanian golden frog",col:"#c99a1a",f:"Atelopus zeteki1.jpg",d:"photos/b4bb1c11712e581dd.webp",by:"Brian Gratwicke",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Atelopus_zeteki1.jpg"}],dropIcons:"paw",sym:[]},
 "*|Cuvier’s mastodon":{add:[{at:[-84.75,38.88],label:"Mastodon bones",col:"#8a6a3a",f:"Mastodon AMNH 9951.jpg",d:"photos/d52dbe96dccd01889.webp",by:"AbstractionBlue",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:Mastodon_AMNH_9951.jpg"}],dropIcons:"paw",sym:[]},
 "*|Bats and white-nose syndrome":{add:[{at:[-74.4,42.69],label:"A bat with white-nose",col:"#8a6a3a",f:"Little brown bat white-nose syndrome on muzzle, nose (5751822293).jpg",d:"photos/b28b5170d894cc605.webp",by:"U.S. Fish and Wildlife Service Headquarters",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Little_brown_bat_white-nose_syndrome_on_muzzle,_nose_(5751822293).jpg"}],dropIcons:"paw",sym:[]},
 /* a world map is too crowded with names for figures: each animal goes into its own label instead */
  /* invasives: the stop already has rabbits, pythons, lionfish and Escobar's hippos; the cane toads in Australia join them */
 "animals|Animals out of place":{add:[{at:[-74.77,5.93],label:"Escobar’s hippos",col:"#8a6a3a",f:"Hipopótamo Vanessa.jpg",d:"photos/a3c01c99c4bfe102.webp",by:"Alvaro Morales Ríos",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Hipop%C3%B3tamo_Vanessa.jpg"},{at:[146,-19],label:"Cane toads",col:"#8a6a3a",f:"Cane toad.jpg",d:"photos/x66b8c1fe5e548d29.webp",by:"Sam Fraser-Smith",lic:"CC BY 2.0",page:"https://www.flickr.com/photos/8379434@N07/3795687193"}]},
 /* tigers and lions: a big label on each continent, and the animals themselves where they live */
 "animals|Tigers and lions":{pinsAdd:[[[[22,2],[26,8],[18,-4]],"🦁 Lions: Africa","area"],[[[96,38],[102,42],[90,36]],"🐯 Tigers: Asia","area"]],
  sym:[{at:[35,-2.5],e:"lion",n:"Lions, Serengeti"},{at:[23,-19.3],e:"lion",n:"Lions, Okavango"},{at:[31.6,-24],e:"lion",n:"Lions, Kruger"},{at:[70.8,21.1],e:"lion",n:"Asiatic lions, Gir"},
   {at:[80.5,22.3],e:"tiger",n:"Tigers, central India"},{at:[89.2,21.9],e:"tiger",n:"Tigers, the Sundarbans"},{at:[102,4.5],e:"tiger",n:"Malayan tigers"},{at:[101.5,-1.5],e:"tiger",n:"Sumatran tigers"},{at:[135,46.5],e:"tiger",n:"Siberian tigers"}]},
 "*|Animals worth taming":{dropIcons:"paw",relabel:{"Horse: the western steppe":"🐎 Horse: the western steppe","Sheep, goats, cattle, pigs":"🐑 Sheep, goats, cattle, pigs","Dromedary camel":"🐪 Dromedary camel","Bactrian camel":"🐫 Bactrian camel","Yak":"🐂 Yak","Water buffalo":"🐃 Water buffalo","Donkey":"🐴 Donkey","Llama and alpaca":"🦙 Llama and alpaca","Zebra: never tamed":"🦓 Zebra: never tamed"}},
};
function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f);if(i<0){PS_PHOTO_DATA.push({f:x.f,d:x.d,by:x.by,lic:x.lic,page:x.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
function setProp(S,k,v){try{S[k]=v}catch(e){}if(S[k]!==v)try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}}
function extras(S){try{if(!S||typeof ps==="undefined"||!ps)return;const X=PH[ps.tour+"|"+S.title]||PH["*|"+S.title];if(!X)return;X.add=X.add||[];
 /* the stop's photo pins always include these, whatever other scripts set the list to later */
 if(!S._gfXp){S._gfXp=1;const mine=X.add.map(x=>{const i=libAdd(x);return{at:x.at,label:x.label,col:x.col||"#d9682b",icon:"photo",_f:x.f,img:i}});
  let base=Array.isArray(S.phPins)?S.phPins.slice():[];const merged=()=>base.filter(q=>!mine.some(m=>q&&m.label===q.label)).concat(mine);let cache=null,ck=null;
  try{Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){if(ck!==base){ck=base;cache=merged()}return cache},set(v){base=Array.isArray(v)?v.filter(q=>!mine.includes(q)):[]}})}catch(e){}
  S._sqPruned=-1}else X.add.forEach(libAdd);
 if(X.relabel&&Array.isArray(S.pins)&&!S._gfRl){S._gfRl=1;setProp(S,"pins",S.pins.map(q=>Array.isArray(q)&&X.relabel[q[1]]?[q[0],X.relabel[q[1]]].concat(q.slice(2)):q))}
 if(X.pinsAdd&&!S._gfPa){S._gfPa=1;setProp(S,"pins",(S.pins||[]).concat(X.pinsAdd.filter(q=>!(S.pins||[]).some(x=>Array.isArray(x)&&x[1]===q[1]))))}
 if(X.dropPins&&Array.isArray(S.pins)){const L=S.pins.filter(q=>!(Array.isArray(q)&&X.dropPins.test(String(q[1]))));if(L.length!==S.pins.length)setProp(S,"pins",L)}
 if(X.dropIcons&&Array.isArray(S.iconPins)){const keep=X.keepIconsAt||[];const L=S.iconPins.filter(q=>q.icon!==X.dropIcons||keep.some(a=>Math.hypot(a[0]-q.at[0],a[1]-q.at[1])<.5));
  const L2=X.sym?L.filter(q=>!(q.icon===X.dropIcons)):L;if(L2.length!==S.iconPins.length)setProp(S,"iconPins",L2);S._gfIcons=1}
 if(X.sym&&X.sym.length&&!S._gfXs){S._gfXs=1;const m=((S.gfSym&&S.gfSym.marks)||[]).concat(X.sym.map(z=>({at:z.at,e:"gfw_"+z.e,sz:32,reach:1.6,gap:3,_gfw:z.e,_n:z.n})));setProp(S,"gfSym",{marks:m});
  try{const st=PS_TOURS[ps.tour].steps;if(!st._gfSym)Object.defineProperty(st,"_gfSym",{configurable:true,writable:true,value:1})}catch(e){}}}catch(e){console.error(e)}}
/* the rhino figure at Leuser (wild rhinos still live there), in place of its paw print */
function rhinos(){try{const T=PS_TOURS.bextinction,S=T&&T.steps.find(x=>x.title==="The last Sumatran rhinos");if(!S)return false;if(S._gfRh)return true;S._gfRh=1;
 setProp(S,"iconPins",(S.iconPins||[]).filter(q=>q.icon!=="paw"));
 setProp(S,"gfSym",{marks:[{at:[97.75,3.75],e:"gfw_rhino",sz:34,reach:1.6,gap:3,_gfw:"rhino",_n:"Wild Sumatran rhinos in Leuser"}]});
 try{if(!T.steps._gfSym)Object.defineProperty(T.steps,"_gfSym",{configurable:true,writable:true,value:1})}catch(e){}return true}catch(e){console.error(e);return false}}
[0,1500,4000,9000].forEach(ms=>setTimeout(rhinos,ms));
/* 5. tall photos: the photo viewer fits them inside the window (it sized by width only, so a standing bird lost its head
   and feet off the top and bottom), and a tour card crops them from near the top, where heads and faces are */
{const st=document.createElement("style");st.textContent=`.ps-lightbox figure{width:auto!important}.ps-lightbox figure img{width:auto!important;max-width:100%!important;max-height:calc(100vh - 120px)!important;margin:0 auto}`;document.head.appendChild(st)}
function tall(im){try{if(im&&im.naturalWidth&&im.naturalHeight>im.naturalWidth*1.1&&im._gfTall!==im.src){im._gfTall=im.src;im.style.setProperty("object-position","50% "+(im.naturalHeight>im.naturalWidth*1.3?"6%":"15%"),"important")}}catch(e){}}
document.addEventListener("load",e=>{const t=e.target;if(t&&t.tagName==="IMG"&&t.closest&&t.closest(".ps-card"))tall(t)},true);
setInterval(()=>{document.querySelectorAll(".ps-card img").forEach(tall)},1000);
/* 7. photo pins' leader lines: redrawn every frame from the photo to where the place is on the map now (the globe turns
   and the line was left pointing at the old spot, offshore of Lagos), ending in a dot on the place */
(function(){let raf=0;function step(){raf=requestAnimationFrame(step);try{if(typeof ps==="undefined"||!ps||typeof psSteps!=="function")return;const S=psSteps()[ps.i],P=S&&S.phPins;if(!P||!P.length)return;
 const L=document.querySelector(".ps-phpins");if(!L)return;const lead=L.querySelector("svg.ps-sq-lead");if(!lead)return;const lr=L.getBoundingClientRect();let h="";
 L.querySelectorAll(".ps-sq").forEach(el=>{if(el.style.display==="none")return;const q=P[+el.dataset.ph];if(!q||!q.at)return;const xy=psScreen(q.at);if(!xy||!isFinite(xy[0]))return;
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2-lr.left,cy=r.top+r.height/2-lr.top;
  /* from the nearest point of the photo's edge to the place */
  const ex=Math.max(r.left-lr.left,Math.min(r.right-lr.left,xy[0])),ey=Math.max(r.top-lr.top,Math.min(r.bottom-lr.top,xy[1]));
  if(Math.hypot(xy[0]-ex,xy[1]-ey)<6)return;
  h+=`<line x1="${xy[0].toFixed(1)}" y1="${xy[1].toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"/><circle cx="${xy[0].toFixed(1)}" cy="${xy[1].toFixed(1)}" r="3.2"/>`});
 if(lead._gfh!==h||lead.innerHTML!==lead._gfo){lead._gfh=h;lead.innerHTML=h;lead._gfo=lead.innerHTML}}catch(e){}}
 step()})();
/* 8. "The Global South" (Economy tour): the Brandt line puts North Korea on the southern side (down Korea's east coast and
   along the DMZ), crosses the Pacific north of the island nations (south of Hawaii), and Australia and New Zealand get a
   loop of their own, so Papua New Guinea, the Solomons, Fiji and the rest of the Pacific are in the South */
function brandt(){try{if(typeof GDP_BRANDT==="undefined")return false;let S=null;for(const t in PS_TOURS)(PS_TOURS[t].steps||[]).forEach(x=>{if(x&&x.title==="The Global South"&&x.lines&&x.lines.some(l=>l.coords===GDP_BRANDT))S=x});
 if(!S)return false;if(S._gfBr)return true;S._gfBr=1;const B=GDP_BRANDT,at=(lo,la)=>B.findIndex(q=>q[0]===lo&&q[1]===la);
 const iUS=at(-117.1,32.5),iK=at(131.1,42.9),iY=at(123.5,37),iP=at(130,5);if(iUS<0||iK<0||iY<0||iP<0)return false;
 const KOREA=[[130.75,42.3],[130.2,41.6],[129.7,40.8],[129.1,39.9],[128.6,39.1],[128.36,38.61],[127.9,38.32],[127.3,38.3],[126.7,37.95],[126.1,37.72],[125.2,37.65],[124.3,37.5]];
 const MAIN=[[-179.9,15],[-160,15],[-135,12],[-125,15],[-121,20]].concat(B.slice(iUS,iK+1),KOREA,B.slice(iY,iP+1),[[134,10],[150,12],[170,15],[179.9,15]]);
 const AUS=[[113,-20.5],[114,-13],[123,-11.6],[131,-10.6],[137,-10.6],[141.6,-9.9],[143.5,-9.6],[146,-12.5],[151,-15.5],[155.5,-21],[158,-27],[164,-30],[172,-29.5],[179.9,-33],[179.9,-49],[170,-53.5],[160,-50],[148,-46],[135,-40.5],[115,-37.5],[110,-32],[110,-24],[113,-20.5]];
 Object.defineProperty(S,"lines",{configurable:true,enumerable:true,writable:true,value:[{coords:MAIN,kind:"red"},{coords:AUS,kind:"red"}]});
 if(typeof S.body==="string")S.body=S.body.replace("North of the red line: North America, Europe, Russia, Japan, Australia and New Zealand.","North of the red line: North America, Europe, Russia, Japan and South Korea, with Australia and New Zealand ringed on their own.").replace("South of it: Latin America, Africa and most of Asia,","South of it: Latin America, Africa, most of Asia (North Korea too) and the Pacific islands,");
 return true}catch(e){console.error(e);return false}}
[0,1500,4000,9000].forEach(ms=>setTimeout(brandt,ms));
/* 9. "Further north than you think": the same latitude, two climates. A third parallel at about 58.8°N joins Churchill on
   Hudson Bay (January average about −26 °C) and Kirkwall in Orkney (about +4 °C), each with a thermometer
   (Environment Canada and Met Office 1991–2020 normals, rounded) */
function sameLat(){let n=0;try{for(const t in PS_TOURS)(PS_TOURS[t].steps||[]).forEach(S=>{if(!S||S.title!=="Further north than you think"||S._gfSl)return;S._gfSl=1;n++;
  const P=[];for(let lo=-94;lo<=-3;lo+=2)P.push([lo,58.8]);P.push([-2.96,58.8]);
  const L=(S.lines||[]).concat([{coords:P,kind:"dash",parallel:true}]);Object.defineProperty(S,"lines",{configurable:true,enumerable:true,writable:true,value:L});
  const M=((S.gfSym&&S.gfSym.marks)||[]).concat([{at:[-94.17,58.77],thermo:"cold",sz:30,reach:1.6,gap:2},{at:[-2.96,58.98],thermo:"hot",sz:30,reach:2.2,gap:2}]);
  Object.defineProperty(S,"gfSym",{configurable:true,enumerable:true,writable:true,value:{marks:M}});try{if(!PS_TOURS[t].steps._gfSym)Object.defineProperty(PS_TOURS[t].steps,"_gfSym",{configurable:true,writable:true,value:1})}catch(e){}
  S.pins=(S.pins||[]).concat([[[-94.17,58.77],"Churchill: −26 °C in January","point"],[[-2.96,58.98],"Kirkwall, Orkney: +4 °C in January","point"]]);
  const add=" Go further north and the gap grows: Churchill, on Hudson Bay, and Kirkwall, in Orkney off the north of Scotland, are both near 58.8°N, yet in January Churchill averages about −26 °C and Kirkwall about +4 °C.";
  if(typeof S.body==="string"&&!S.body.includes("Churchill"))S.body+=add})}catch(e){console.error(e)}return n}
[0,1500,4000,9000].forEach(ms=>setTimeout(sameLat,ms));
/* 10. the Animals tour runs on the Nature map's Biomes view (animals live by biome); its cover is the map of its seventeen animal photos */
function animalsNature(){try{const T=PS_TOURS.animals;if(!T)return false;T.mode="nature";if(T.m)T.m.mode="nature";if(T.map)T.map.mode="nature";else T.map={mode:"nature"};
 (T.steps||[]).forEach(S=>{if(S&&(!S.mode||S.mode==="relief")&&!S.sub){S.mode="nature";if(!S.nsub)S.nsub="biomes"}});
 try{const C="photos/cover_animals.webp?v=5";if(typeof TOUR_THUMBS!=="undefined")TOUR_THUMBS.animals=C;
  /* pictures already drawn with the old dark cover (the home page tiles, the tour cards) */
  document.querySelectorAll('[data-tour="animals"] img, [data-gfm="animals"] img, [data-id="animals"] img').forEach(im=>{if(!im.src.includes("cover_animals"))im.src=C})}catch(e){}return true}catch(e){return false}}
animalsNature();[0,1500,4000,9000].forEach(ms=>setTimeout(animalsNature,ms));setInterval(()=>{try{if(document.querySelector('[data-tour="animals"] img:not([src*="cover_animals"])'))animalsNature()}catch(e){}},1500);
/* 11. tours on the Nature map: no fading veil, the biome colours and the relief under them show at full strength */
(function(){let n=0;const t=setInterval(()=>{if(typeof psDimFill!=="function"){if(++n>40)clearInterval(t);return}if(psDimFill._gfNat){clearInterval(t);return}const _d=psDimFill;
 psDimFill=function(){try{const T=ps&&PS_TOURS[ps.tour],S=ps&&psSteps()[ps.i],m=(S&&S.mode)||(T&&T.map&&T.map.mode);if(m==="nature"||(ps&&ps.tour==="climate"))return"rgba(0,0,0,0)"}catch(e){}return _d.apply(this,arguments)};psDimFill._gfNat=1;clearInterval(t)},500)})();
/* 12. per-stop framing fixes, applied each time the stop opens (other scripts re-fit some views after load) */
const SET=(S,k,v)=>{try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};
const GAL=S=>{SET(S,"view",[-92.1,-1.6,-89,0.8]);SET(S,"globe",[-90.5,-0.5,9]);SET(S,"hi",[]);SET(S,"hiSoft",[]);
  if(Array.isArray(S.pins))SET(S,"pins",S.pins.filter(q=>!(Array.isArray(q)&&/^Ecuador$/.test(q[1]))))};
const FIX={
 "islandlife|The Galápagos":GAL,"islandlife|One finch, many finches":GAL,
 /* Christmas Island close up, outlined like any highlighted country; no magnifier needed at this zoom */
 "islandlife|Christmas Island’s red crabs":S=>{SET(S,"hi",["cx"]);
  /* the island is only about 20 px across even at full zoom: its photo pins point at a ring just round it, never across it */
  if(Array.isArray(S.phPins))S.phPins.forEach(q=>{if(q&&!q.ringKm){q.at=[105.63,-10.49];q.ringKm=16}})},
 /* Island giants: wide enough for Aldabra; Komodo has its own photo pin */
 "islandlife|Island giants":S=>{SET(S,"view",[38,-45,180,12])},
 /* Island dwarfs: the whole world, so Wrangel's mammoths, the Key deer and the island fox show too */
 "islandlife|Island dwarfs":S=>{SET(S,"view",[-150,-5,185,78]);SET(S,"globe",[20,40,1]);
  if(Array.isArray(S.phPins))S.phPins.forEach(q=>{if(q&&q.at&&q.at[0]<-179)q.at=[179.4,71.2]})}};
/* Remote islands: each island is a few pixels across, so nothing may sit on it. No distance ruler (its orange handles
   covered the island; the distances are in the text), no name pin on the island, photo pins point at the ring, and the
   island keeps its white ring. */
function remote(S){if(S._gfRem)return;S._gfRem=1;const R=(S.lines||[]).find(l=>l&&l.circle&&l.km);
 if(S.gfRuler)SET(S,"gfRuler",null);if(!R)return;const c=R.circle;let km=R.km;
 const near=at=>at&&Math.hypot((at[0]-c[0])*Math.cos(c[1]*Math.PI/180),at[1]-c[1])*111.2<km*1.6;
 /* centred on the island (the old views also took in the ruler's far end, and some crossed the date line) */
 if(c[1]>-80&&c[1]<80){const k=Math.cos(c[1]*Math.PI/180),hw=Math.min(14,7/Math.max(.35,k));SET(S,"view",[c[0]-hw,c[1]-4.5,c[0]+hw,c[1]+4.5]);SET(S,"globe",[c[0],c[1],5]);
  const r=Math.max(12,Math.round(2*hw*111.32*k*.025));R.km=r;km=r;(S.phPins||[]).forEach(q=>{if(q&&q.ringKm)q.ringKm=r})}
 if(Array.isArray(S.pins)){const L=S.pins.filter(q=>!(Array.isArray(q)&&Array.isArray(q[0])&&typeof q[0][0]==="number"&&near(q[0])));if(L.length!==S.pins.length)SET(S,"pins",L)}
 const ph=S.phPins;if(Array.isArray(ph))ph.forEach(q=>{if(q&&near(q.at)){q.at=c.slice();q.ringKm=km}})}
function stopFix(S){try{if(!S||typeof ps==="undefined"||!ps)return;if(ps.tour==="bremote")remote(S);if(ps.tour==="climate")climStop(S);const f=FIX[ps.tour+"|"+S.title];if(f)f(S)}catch(e){console.error(e)}}
/* 13. a shorter climate tour: 16 stops instead of 19. Stops that repeat an idea (another "same latitude, different
   climate"), go too close in, or need a lot of reading are left out; what they showed lives on in the stops kept. */
const CLIM_CUT=["Same line, different worlds","The coldest winter is a summer","Two islands, two currents"];
function climCut(){try{if(typeof ps!=="undefined"&&ps&&ps.tour==="climate")return;const L=PS_TOURS.climate&&PS_TOURS.climate.steps;if(!L)return;
 for(let i=L.length-1;i>=0;i--)if(L[i]&&CLIM_CUT.includes(L[i].title))L.splice(i,1)}catch(e){}}
[0,1500,4000,9000,13000,20000].forEach(ms=>setTimeout(climCut,ms));setInterval(climCut,5000);
{let n=0;const t=setInterval(()=>{if(typeof psLaunchTour!=="function"){if(++n>40)clearInterval(t);return}clearInterval(t);if(psLaunchTour._gfCc)return;const _l=psLaunchTour;
 psLaunchTour=function(id){if(id==="climate"){try{if(typeof ps!=="undefined"&&ps&&ps.tour==="climate"){}else climCut()}catch(e){}}return _l.apply(this,arguments)};psLaunchTour._gfCc=1},500)}
/* every climate stop: on the Climate map, without the wind arrows and jet-stream lines of the Currents layer */
function climStop(S){if(!S||S._gfCs)return;S._gfCs=1;if(S.mode==="satellite")SET(S,"mode",undefined);if(Array.isArray(S.on)&&S.on.includes("currents"))SET(S,"on",S.on.filter(x=>x!=="currents"));if(S.gfCur)SET(S,"gfCur",null)}
/* 14. City Lights as seen from space: on opening it, borders, rivers, lakes, names and cities are switched off (any can be
   switched back on there); on leaving, each switch goes back to how it was. Not inside tours, which set their own. */
(function(){const IDS=["allMapsBordersToggle","allMapsRiversToggle","allMapsLakesToggle","allMapsLandformsToggle"];/* (names: geoflock-nightx.js keeps City Lights its own setting, off by default; cities: each map keeps its own, and City Lights starts with none) */
 try{if(typeof allMapsCitiesByMode!=="undefined"&&allMapsCitiesByMode.night===undefined)allMapsCitiesByMode.night=false}catch(e){}
 let was=null,saved=null;
 setInterval(()=>{try{if(typeof appMode==="undefined"||appMode!=="allmaps")return;const tour=typeof ps!=="undefined"&&ps;const night=allMapsColorMode==="night";
  if(night&&!was&&!tour){saved={};IDS.forEach(id=>{const c=document.getElementById(id);if(c){saved[id]=c.checked;if(c.checked)c.click()}})}
  /* back: each switch as it was (tried for a few seconds, as the map's own switching can reset some of them) */
  if(!night&&saved){if(was)saved._n=0;let left=0;IDS.forEach(id=>{const c=document.getElementById(id);if(c&&saved[id]!=null&&c.checked!==saved[id]){c.click();left++}});if(++saved._n>8||!left&&saved._n>3)saved=null}
  was=night}catch(e){}},500)})();
/* 15. gentler terrain shading by default on the picture relief styles (0.3 looked heavy); a value someone set stays */
(function(){let n=0;const t=setInterval(()=>{if(typeof gfMS!=="function"){if(++n>40)clearInterval(t);return}clearInterval(t);
 try{const M=gfMS();if(!M.shadeV3){M.shadeV3=1;if(M.shadeB==null||Math.abs(M.shadeB-.3)<1e-6)M.shadeB=.16;}if(!M.shadeV4){M.shadeV4=1;/* never above 0.6 */if(M.shadeB>.6)M.shadeB=.6;if(M.shadeG>.6)M.shadeG=.6;try{gfMSsave()}catch(e){}try{gfMsRefresh()}catch(e){}try{gfGlobeDirty()}catch(e){}}}catch(e){}},300)})();
window.gfPolishM={dedupe};
})();
