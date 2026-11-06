/* GeoFlock: rivers on every map (Maps page and Study › Locations), switched on by default. On the Relief and Elevation maps
   they come in as before; on every other map they come in later (about twice the zoom) and fainter when zoomed out, so
   the map's own colours lead. gfRiverLate(view) gives that factor to the river drawing (index.html and geoflock-detail.js). */
(function(){
const OWN=new Set(["relief","elevation"]);
try{["satellite","population","gdp","climate","politics","political","culture","people","nature","history","night"].forEach(m=>{
  ALLMAPS_RIVER_MODES[m]=true;if(ALLMAPS_MODE_DEFAULTS[m])ALLMAPS_MODE_DEFAULTS[m].rivers=true;allMapsRiversByMode[m]=true})}catch(e){console.error(e)}
try{atlasRiversByMode.colour=true}catch(e){}
window.gfRiverLate=function(g){try{if(typeof amGlobe!=="undefined"&&g===amGlobe){return appMode==="allmaps"&&OWN.has(allMapsColorMode)?1:2}return 2}catch(e){return 1}};
})();
