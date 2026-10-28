/* GeoFlock: the Tours page's shelves. Eight subject shelves plus Regions, in a set order; a shelf with no tours yet
   (Mapped books, until its tours exist) stays hidden. Tours not listed here keep their own shelf (AP Human Geo has its own page). */
(function(){
if(typeof TOUR_GROUPS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const SHELVES=[
 ["start","Start here","What the maps show, how maps can mislead, and the Earth seen whole",["geo","pop","projections","space","night","time"]],
 ["physical","Physical Earth","Height, plates, climate, water, islands and the forces that shape the land",["elev","plates","climate","rivers","lakes","seas","islands","hazards"]],
 ["living","Living planet","Animals, ecosystems, island life and where we came from",["animals","environment","islandlife","humans"]],
 ["culture","People & culture","Cities, migration, languages, religions, food, sport, landmarks and flags",["cities","migration","people","culture","langrel","food","musicsport","landmarks","flags"]],
 ["ideas","Ideas & arts","What people made and thought, and where it spread",["inventions"]],
 ["power","Power & economy","Governments, alliances, borders, money, trade and resources",["politics","govmap","geopol","borders","regions","gdp","transport","resources"]],
 ["history","History","World history from the first cities to today, the explorers, then one tour for each continent",["hancient","hempires","hmodern","explorers","heurope","hasia","hafrica","hnamerica","hsamerica","hoceania","hantarctica"]],
 ["cont","Regions","Seven tours, one for each continent",["europe","asia","africa","namerica","samerica","oceania","antarctica"]],
 ["books","Mapped books","Famous books about the world, followed on the map",[]]];
function apply(){try{
 const own=new Set(SHELVES.map(s=>s[0]));
 /* the shelves, in order; any other shelf (AP Human Geo) stays after them */
 const rest=TOUR_GROUPS.filter(g=>!own.has(g[0])&&!["maps","water","lines","nature","world"].includes(g[0]));
 TOUR_GROUPS.splice(0,TOUR_GROUPS.length,...SHELVES.map(s=>[s[0],s[1],s[2]]),...rest);
 const listed=[];SHELVES.forEach(s=>s[3].forEach(k=>{if(PS_TOURS[k]){PS_TOURS[k].group=s[0];listed.push(k)}}));
 /* tours left on a retired shelf go to the closest new one */
 const MOVE={maps:"power",water:"physical",lines:"power",nature:"living",world:"culture"};
 Object.keys(PS_TOURS).forEach(k=>{const g=PS_TOURS[k].group;if(MOVE[g]&&!listed.includes(k))PS_TOURS[k].group=MOVE[g]});
 const others=PS_TOUR_ORDER.filter(k=>!listed.includes(k));PS_TOUR_ORDER.splice(0,PS_TOUR_ORDER.length,...listed,...others);
 /* the shorter names this layout wants */
 const NM={night:"Earth at night",culture:"Languages",langrel:"Religions",politics:"International relations",govmap:"Politics",regions:"Special regions"};
 for(const k in NM)if(PS_TOURS[k])PS_TOURS[k].short=NM[k];
}catch(e){console.error(e)}}
window.gfTourShelves=SHELVES;
if(typeof toursRegroup==="function"){const _r=toursRegroup;toursRegroup=function(){const r=_r.apply(this,arguments);apply();return r}}
apply();setTimeout(apply,0);document.addEventListener("DOMContentLoaded",()=>setTimeout(apply,400));
})();
