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
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];extras(S);dedupe(S)}catch(e){}return _g.apply(this,arguments)};psGo._gfM=1;return true}
let n=0;const t=setInterval(()=>{const a=wrapKey(),b=wrapGo();if(a&&b||++n>60)clearInterval(t)},500);
/* 3. the Climate map's colours were softened (hot desert a rusty orange-red, cold desert pale salmon): the cards say so */
const TXT=[["(red and orange on the climate map laid over it)","(rusty red and orange on the climate map laid over it)"],
 ["The bright red areas on the climate map are deserts: hot deserts in deep red, cooler ones in pink.","The rusty red areas on the climate map are deserts: hot deserts in deep orange-red, cooler ones in pale salmon."]];
function fixText(){try{for(const t in PS_TOURS)(PS_TOURS[t].steps||[]).forEach(S=>{["body","more","stat"].forEach(k=>{let v=S[k];if(typeof v!=="string")return;TXT.forEach(([a,b])=>{if(v.includes(a))v=v.split(a).join(b)});if(v!==S[k])try{S[k]=v}catch(e){}})})}catch(e){}}
[0,1500,4000,9000].forEach(ms=>setTimeout(fixText,ms));
/* 4. photo pins added to stops when they open (other scripts lock and reset a stop's photo pins after load, so these are
   added at the moment the stop is shown): each picture joins the photo library, the text pin or paw icon it replaces goes */
const PH={
 /* Literature: legend says the great odes were hung on the Kaaba in Mecca, hence their name, the Mu'allaqat ("the hung ones") */
 "literature|Weeping at the campsite":{add:[{at:[39.83,21.42],label:"The Kaaba: where legend hung the odes",f:"The Kaaba during Hajj.jpg",d:"photos/da9206e8f82900f76.webp",by:"Adli Wahid",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg"}],dropPins:/^Mecca$/},
 /* Extinction: the rhinos themselves, at the sanctuary (the calf from the card's picture, cropped, so not a repeat of it) */
 "bextinction|The last Sumatran rhinos":{add:[{at:[105.77,-4.93],label:"Way Kambas: rhino sanctuary",col:"#8a6a3a",f:"Sumatran Rhino 2 (calf).jpg",d:"photos/sumatran_rhino_pin.webp",by:"Charles W. Hardin",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Sumatran_Rhino_2.jpg"}],dropPins:/^Way Kambas/,dropIcons:"paw"},
 /* Extinction: the lost giants, each where it lived */
 "bextinction|Where people arrived, big animals vanished":{add:[
  {at:[-100,42],label:"Woolly mammoth",col:"#8a6a3a",f:"Woolly mammoth model Royal BC Museum in Victoria.jpg",d:"photos/x273402151e175b35.webp",by:"Thomas Quine",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Woolly_mammoth_model_Royal_BC_Museum_in_Victoria.jpg"},
  {at:[-62,-34],label:"Giant ground sloth",col:"#8a6a3a",f:"Megatherium americanum skeleton at the Natural History Museum, London.jpg",d:"photos/b6074a5fa5cae2cb3.webp",by:"APK",lic:"CC BY 4.0",page:"https://commons.wikimedia.org/wiki/File:Megatherium_americanum_skeleton_at_the_Natural_History_Museum,_London.jpg"},
  {at:[46.9,-19],label:"Elephant bird",col:"#8a6a3a",f:"Aepyornis maximus.jpg",d:"photos/dc98305d4662f0449.webp",by:"Monnier",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Aepyornis_maximus.jpg"}],
  dropIcons:"paw",keepIconsAt:[[134,-25]],sym:[{at:[134,-25],e:"kangaroo",n:"Giant kangaroos and wombats, gone about 45,000 years ago"}]}};
function libAdd(x){try{if(typeof PS_PHOTO_DATA==="undefined")return -1;let i=PS_PHOTO_DATA.findIndex(q=>q&&q.f===x.f);if(i<0){PS_PHOTO_DATA.push({f:x.f,d:x.d,by:x.by,lic:x.lic,page:x.page});i=PS_PHOTO_DATA.length-1}
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[x.label]=x.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};PS_SQ_IMG[x.label]=i}catch(e){}return i}catch(e){return -1}}
function setProp(S,k,v){try{S[k]=v}catch(e){}if(S[k]!==v)try{Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}}
function extras(S){try{if(!S||typeof ps==="undefined"||!ps)return;const X=PH[ps.tour+"|"+S.title];if(!X)return;
 /* the stop's photo pins always include these, whatever other scripts set the list to later */
 if(!S._gfXp){S._gfXp=1;const mine=X.add.map(x=>{const i=libAdd(x);return{at:x.at,label:x.label,col:x.col||"#d9682b",icon:"photo",_f:x.f,img:i}});
  let base=Array.isArray(S.phPins)?S.phPins.slice():[];const merged=()=>base.filter(q=>!mine.some(m=>q&&m.label===q.label)).concat(mine);let cache=null,ck=null;
  try{Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){if(ck!==base){ck=base;cache=merged()}return cache},set(v){base=Array.isArray(v)?v.filter(q=>!mine.includes(q)):[]}})}catch(e){}
  S._sqPruned=-1}else X.add.forEach(libAdd);
 if(X.dropPins&&Array.isArray(S.pins)){const L=S.pins.filter(q=>!(Array.isArray(q)&&X.dropPins.test(String(q[1]))));if(L.length!==S.pins.length)setProp(S,"pins",L)}
 if(X.dropIcons&&Array.isArray(S.iconPins)){const keep=X.keepIconsAt||[];const L=S.iconPins.filter(q=>q.icon!==X.dropIcons||keep.some(a=>Math.hypot(a[0]-q.at[0],a[1]-q.at[1])<.5));
  const L2=X.sym?L.filter(q=>!(q.icon===X.dropIcons)):L;if(L2.length!==S.iconPins.length)setProp(S,"iconPins",L2);S._gfIcons=1}
 if(X.sym&&!S._gfXs){S._gfXs=1;const m=((S.gfSym&&S.gfSym.marks)||[]).concat(X.sym.map(z=>({at:z.at,e:"gfw_"+z.e,sz:32,reach:1.6,gap:3,_gfw:z.e,_n:z.n})));setProp(S,"gfSym",{marks:m});
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
window.gfPolishM={dedupe};
})();
