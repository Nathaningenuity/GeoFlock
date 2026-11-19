/* GeoFlock: Satellite map defaults.
   - The globe only starts spinning by itself on Day & Night (the Spin button still turns it on or off anywhere).
   - Clouds: the plain Day picture starts without clouds; Day & Night keeps its own clouds setting as before. The one
     stored setting (stats.globe.clouds) is split in two, cloudsDN (Day & Night, as the old setting was) and cloudsDay
     (off unless switched on), and globePrefs().clouds reads and writes whichever view is showing, so every existing
     switch and button keeps working unchanged. */
(function(){
"use strict";
const dn=()=>{try{return !!(window.gfDNG&&gfDNG.on())}catch(e){return false}};
/* spin */
if(typeof gfSpinWanted==="function"){const _w=gfSpinWanted;gfSpinWanted=function(g){
 try{if(g&&g._gfSpin==null&&typeof amGlobe!=="undefined"&&g===amGlobe&&allMapsColorMode==="satellite"&&!dn())return false}catch(e){}
 return _w.apply(this,arguments)}}
/* clouds */
function split(o){if(!o||o.__gfCl)return o;
 const had=Object.prototype.hasOwnProperty.call(o,"clouds")?o.clouds:undefined;delete o.clouds;
 if(o.cloudsDN===undefined&&had!==undefined)o.cloudsDN=had;
 Object.defineProperty(o,"__gfCl",{value:1,enumerable:false});
 Object.defineProperty(o,"clouds",{enumerable:false,configurable:true,
  get(){return dn()?o.cloudsDN:(o.cloudsDay===true)},
  set(v){if(dn())o.cloudsDN=v;else o.cloudsDay=!!v}});
 return o}
if(typeof globePrefs==="function"){const _g=globePrefs;globePrefs=function(){return split(_g.apply(this,arguments))}}
/* keep the Clouds switch showing the setting of the view in front, and redraw when Day & Night is switched */
let last=null;
setInterval(()=>{try{const now=dn();if(now===last)return;last=now;
 const t=document.getElementById("amCloudsToggle");if(t)t.checked=typeof cloudsOn==="function"?cloudsOn():!!globePrefs().clouds;
 if(typeof cloudsOn==="function"&&cloudsOn()&&typeof cloudsLoad==="function")cloudsLoad();
 try{if(typeof cloudFlatSync==="function")cloudFlatSync()}catch(e){}
 try{if(typeof amGlobe!=="undefined"&&amGlobe){if(typeof gfSpinBtnSync==="function")gfSpinBtnSync(amGlobe);amGlobe.request?amGlobe.request():amGlobe.render()}}catch(e){}
 try{document.querySelectorAll('[data-g="gfclouds"]').forEach(b=>b.classList.toggle("on",!!(typeof cloudsOn==="function"&&cloudsOn())))}catch(e){}}catch(e){}},400);
})();
