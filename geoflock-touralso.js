/* GeoFlock: tours that also make sense on other maps get an entry point there, and run on the map they were opened from
   (the engine's `alsoOn` list). Only tours whose stops are highlights, pins and lines go on other maps; tours built on one
   map's own data (People, Politics, GDP, Languages, Religions, the History tours) stay on their map. */
(function(){
const ALSO={
 nature:["animals","amigration","ocean","islandlife","humans","crops","environment","food","deserts","bggs","bcollapse"],
 satellite:["biomes","forests","ranges","volcanoes","ice","caves","landmarks","geo","humans","islandlife","animals","bggs","bcollapse","hantarctica","explorers"],
 elevation:["ranges","volcanoes","lakes","ice","geo","resources","bprisoners","hantarctica"],
 politics:["capitals","regions","conflicts","flags","sports","festivals","bprisoners","bnations","europe","asia","africa","namerica","samerica","oceania"],
 population:["cities","night"],
 people:["migration","pop"],
 night:["pop","cities","energy","transport","time"],
 gdp:["energy","resources","currencies","bnations"],
 relief:["space","time"]};
function apply(){try{for(const m in ALSO)ALSO[m].forEach(id=>{const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];if(!T||!T.map||T.map.mode===m||T.map.mode==="history")return;
  T.alsoOn=T.alsoOn||[];if(!T.alsoOn.includes(m))T.alsoOn.push(m)})}catch(e){}}
apply();[1500,5000,12000].forEach(ms=>setTimeout(apply,ms));
window.gfTourAlso=ALSO;
})();
