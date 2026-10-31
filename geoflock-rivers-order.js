/* GeoFlock: Rivers tour tweaks (the user's picks).
   - "Rivers that split" frames the Danube Sinkhole in Europe (the Orinoco half stays in the text).
   - "Rivers that never reach the sea" moves to just before "Now explore" and shows on the Satellite map (plain daylight). */
(function(){
const def=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{o[k]=v}catch(x){}}};
const nm=s=>String(s&&s.title||"").replace(/​/g,"").trim();
function go(){try{if(typeof PS_TOURS==="undefined"||!PS_TOURS.rivers)return;const T=PS_TOURS.rivers,st=T.steps;
 const sp=st.find(s=>nm(s)==="Rivers that split");
 if(sp&&!sp._gfRo){def(sp,"view",[-4,44.5,16,53]);def(sp,"globe",[8.8,48.3,5.2]);def(sp,"flatView",[-4,44.5,16,53]);sp._gfRo=1}
 const i=st.findIndex(s=>nm(s)==="Rivers that never reach the sea"),j=st.findIndex(s=>nm(s)==="Now explore");
 if(i>=0){const S=st[i];if(S.mode!=="satellite"){def(S,"mode","satellite");T.stopModes=true}
  if(j>=0&&i!==j-1){st.splice(i,1);const k=st.findIndex(s=>nm(s)==="Now explore");st.splice(k,0,S)}}
}catch(e){console.error("rivers-order",e)}}
const run=()=>[1500,3000,6500,13500].forEach(ms=>setTimeout(go,ms));
if(document.readyState==="complete")run();else addEventListener("load",run)})();
