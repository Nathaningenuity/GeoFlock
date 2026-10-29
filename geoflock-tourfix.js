/* GeoFlock: shared tour-engine fixes.
   A stop on its own map (History, Politics, Wealth, Population, People, Culture…) gets its own sub-view: the shared
   psSetSub only looked at the tour's map, so a stop's `sub` on another map was ignored (first fixed in the power tours). */
(function(){
if(typeof psSetSub!=="function")return;
const _ss=psSetSub;psSetSub=function(sub){try{if(sub&&typeof ps!=="undefined"&&ps){const St=psSteps()[ps.i],T=PS_TOURS[ps.tour],m=St&&(St.mode||(St.map&&St.map.mode));
 if(m&&T&&T.map&&T.map.mode!==m){const k0=String(sub).split("/")[0];
  if(m==="gdp"&&typeof TH_THEMES!=="undefined"&&TH_THEMES[k0]&&k0!=="total"&&k0!=="percapita"&&typeof allMapsSubMode!=="undefined"){allMapsSubMode.gdp=k0;return}
  if((m==="gdp"||m==="population"||m==="people")&&typeof allMapsSubMode!=="undefined"){if(allMapsSubMode[m]!==sub){allMapsSubMode[m]=sub;document.querySelectorAll("#allMapsSubModes [data-allmaps-sub]").forEach(x=>x.classList.toggle("active",x.dataset.allmapsSub===sub));try{applyAllMapsColorMode(document.getElementById("allMapsWrap"))}catch(e){}try{if(typeof amGlobeOn==="function"&&amGlobeOn())amGlobeSync()}catch(e){}try{if(ps.g)ps.g.render()}catch(e){}}return}
  const m0=T.map.mode;T.map.mode=m;try{return _ss.apply(this,arguments)}finally{T.map.mode=m0}}}}catch(e){console.error(e)}return _ss.apply(this,arguments)};
})();
