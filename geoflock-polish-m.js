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
 psGo=function(i){try{const L=psSteps();dedupe(L[Math.max(0,Math.min(L.length-1,i))])}catch(e){}return _g.apply(this,arguments)};psGo._gfM=1;return true}
let n=0;const t=setInterval(()=>{const a=wrapKey(),b=wrapGo();if(a&&b||++n>60)clearInterval(t)},500);
/* 3. the Climate map's colours were softened (hot desert a rusty orange-red, cold desert pale salmon): the cards say so */
const TXT=[["(red and orange on the climate map laid over it)","(rusty red and orange on the climate map laid over it)"],
 ["The bright red areas on the climate map are deserts: hot deserts in deep red, cooler ones in pink.","The rusty red areas on the climate map are deserts: hot deserts in deep orange-red, cooler ones in pale salmon."]];
function fixText(){try{for(const t in PS_TOURS)(PS_TOURS[t].steps||[]).forEach(S=>{["body","more","stat"].forEach(k=>{let v=S[k];if(typeof v!=="string")return;TXT.forEach(([a,b])=>{if(v.includes(a))v=v.split(a).join(b)});if(v!==S[k])try{S[k]=v}catch(e){}})})}catch(e){}}
[0,1500,4000,9000].forEach(ms=>setTimeout(fixText,ms));
/* 4. "Weeping at the campsite" (Literature): a picture on the map. Legend says the great odes were hung on the Kaaba in
   Mecca, which gave them their name, the Mu'allaqat ("the hung ones"); the plain "Mecca" label becomes that photo pin. */
const KA={f:"The Kaaba during Hajj.jpg",d:"photos/da9206e8f82900f76.webp",by:"Adli Wahid",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg"},KAL="The Kaaba: where legend hung the odes";
function campsite(){try{const T=PS_TOURS.literature,S=T&&T.steps.find(x=>x.title==="Weeping at the campsite");if(!S||typeof PS_PHOTO_DATA==="undefined")return false;
 if(!PS_PHOTO_DATA.some(x=>x&&x.f===KA.f))PS_PHOTO_DATA.push(Object.assign({},KA));const idx=PS_PHOTO_DATA.findIndex(x=>x&&x.f===KA.f);
 try{if(typeof GF_SQ_FILE!=="undefined")GF_SQ_FILE[KAL]=KA.f}catch(e){}try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};if(typeof PS_SQ_IMG!=="undefined")PS_SQ_IMG[KAL]=idx}catch(e){}
 if(!Array.isArray(S.phPins))S.phPins=[];if(!S.phPins.some(q=>q&&q.label===KAL))S.phPins.push({at:[39.83,21.42],label:KAL,col:"#d9682b",icon:"photo",_f:KA.f,img:idx});
 if(Array.isArray(S.pins)){const i=S.pins.findIndex(q=>Array.isArray(q)&&q[1]==="Mecca");if(i>=0)S.pins.splice(i,1)}S._sqPruned=-1;return true}catch(e){console.error(e);return false}}
[0,1500,4000,9000].forEach(ms=>setTimeout(campsite,ms));
window.gfPolishM={dedupe};
})();
