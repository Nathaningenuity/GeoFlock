/* GeoFlock: lakes in tours on the Satellite map. On Satellite the Lakes switch paints lakes in blue over the photo, so
   tours leave it off (the honest photo) and turn it on only at stops that look at a lake. Stops where the real look
   matters (the shrunken Aral Sea, salt flats, dried lake beds, lakes under ice) keep it off. The viewer's own setting
   comes back when the tour ends. Stops that need fine detail inside a lake (Samosir in Lake Toba) use the Relief map. */
(function(){
const ON=new Set([
 "rivers|How a river makes a lake","rivers|The river that reverses","rivers|Rivers that never reach the sea",
 "lakes|Lakes of the world","lakes|The biggest lake is called a sea","lakes|The Great Lakes","lakes|The deepest and oldest lake",
 "lakes|Africa’s great shallow lake","lakes|Lakes in a crack","lakes|The highest lake you can sail","lakes|Lakes made by people",
 "lakes|A lake made by mistake","lakes|Sharks in fresh water","lakes|Half fresh, half salty","lakes|Deadly lakes",
 "lakes|A tsunami on Lake Geneva","lakes|Lakes scraped by ice","lakes|Now explore",
 "islands|An island in a lake on an island","islands|The most islands",
 "asia|Siberia","africa|The Nile","africa|A railway camp became a capital","namerica|The ditch that made New York",
 "animals|The axolotl’s last lake","islandlife|Lakes are islands too","islandlife|Now explore","caves|The longest cave: Mammoth Cave",
 "weather|The lightning capital","ice|Driving on lakes","amigration|The falcons of Nagaland"]);
/* stops that need the Relief map for fine detail (an island inside a lake) */
/* (Samosir in Lake Toba: kept on Satellite with its lake painted, which shows the island clearly; moving a stop to another
   map mid-tour currently ends the tour when the next stop switches back, see the task list) */
const RELIEF={};
try{Object.keys(RELIEF).forEach(k=>{const[t,title]=k.split("|"),T=PS_TOURS[t];if(!T)return;const S=(T.steps||[]).find(s=>s.title===title);if(S){S.mode="relief";T.stopModes=true}})}catch(e){}
/* satellite tours no longer switch Lakes on for the whole tour: each stop decides */
try{Object.values(PS_TOURS).forEach(T=>{if(T&&T.map&&T.map.mode==="satellite"&&Array.isArray(T.map.on))T.map.on=T.map.on.filter(id=>id!=="allMapsLakesToggle")})}catch(e){}
/* during a tour on Satellite the Lakes layer follows the stop (an older rule kept it off for whole tours); the viewer's own
   switch is not touched, so it is as they left it after the tour */
const want=()=>{try{const S=psSteps()[ps.i];return!!(S&&(ON.has(ps.tour+"|"+S.title)||S.gfFrom&&ON.has(S.gfFrom)))}catch(e){return false}};
const inSat=()=>typeof ps!=="undefined"&&ps&&typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="satellite";
if(typeof allMapsLakesOn==="function"){const _l=allMapsLakesOn;allMapsLakesOn=function(){return inSat()?want():_l.apply(this,arguments)}}
function apply(){try{if(typeof applyAllMapsLakesBorders==="function")applyAllMapsLakesBorders();if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request()}catch(e){}}
{const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);setTimeout(apply,0);setTimeout(apply,800);return r}}
{const _e=psEnd;psEnd=function(){const r=_e.apply(this,arguments);setTimeout(apply,60);return r}}
/* stops whose map is changed here: psSteps() hands out copies, so the change is made on those too */
{const _s=psSteps;psSteps=function(){const L=_s.apply(this,arguments);try{if(ps&&L)L.forEach(S=>{if(S&&RELIEF[ps.tour+"|"+S.title]&&S.mode!=="relief")S.mode="relief"})}catch(e){}return L}}
})();
