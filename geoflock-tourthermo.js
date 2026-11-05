/* GeoFlock: thermometers on tour stops. On stops about temperature, the places they compare get a thermometer each
   (the Toolkit's Thermometer: the gauge shows today's usual temperature there, a click opens its climate chart). They go
   when the stop is left. Lists: [lon, lat, name]. */
(function(){
const T={
 "elev|Cities that climbed to keep cool":[[-78.51,-0.22,"Quito, 2,850 m"],[-79.9,-2.19,"Guayaquil, on the coast"]],
 "climate|The coldest winter is a summer":[[-122.42,37.77,"San Francisco"],[-121.49,38.58,"Sacramento"]],
 "climate|The hottest and coldest ever recorded":[[-116.87,36.46,"Death Valley"],[106.84,-78.46,"Vostok Station"]],
 "climate|The coldest places people live":[[143.2,63.46,"Oymyakon"],[129.73,62.03,"Yakutsk"]],
 "climate|London is mild for its latitude":[[-0.13,51.5,"London"],[-114.07,51.05,"Calgary"]],
 "climate|Two islands, two currents":[[-51.72,64.18,"Nuuk"],[-21.9,64.15,"Reykjavík"]],
 "climate|Ice far from the poles":[[37.35,-3.07,"Kilimanjaro’s summit"],[37.34,-3.35,"Moshi, at its foot"]],
 "cities|Cities at the extremes":[[129.73,62.03,"Yakutsk"],[47.98,29.37,"Kuwait City"]],
 "capitals|The coldest capital":[[106.92,47.92,"Ulaanbaatar"]],
 "deserts|The Gobi":[[104.0,43.0,"The Gobi"]],
 "deserts|Not heat, but rain":[[5.53,22.79,"The Sahara (Tamanrasset)"],[104.0,43.0,"The Gobi"]],
 "deserts|Death Valley’s heat trap":[[-116.87,36.46,"Death Valley"]],
 "deserts|The Empty Quarter":[[50.0,20.5,"The Empty Quarter"]],
 "biomes|Tundra":[[-100,67.5,"Tundra, Canada"]],
 "biomes|Taiga":[[105,60,"Taiga, Siberia"]],
 "biomes|Mountains: biomes stacked up":[[86.92,27.99,"Everest"],[85.32,27.7,"Kathmandu"]],
 "energy|Burning oil to stay cool":[[46.72,24.71,"Riyadh"]],
 "psychology|Heat and tempers":[[-112.07,33.45,"Phoenix"]],
 "festivals|Fire and ice in midwinter":[[126.63,45.75,"Harbin"]],
 "weather|The snowiest city on Earth":[[140.74,40.82,"Aomori"]],
 "antarctica|Coldest, driest, windiest, highest":[[106.84,-78.46,"Vostok Station"],[-56.99,-63.4,"Antarctic Peninsula"]],
 "houses|Yurts and gers":[[106.92,47.92,"Ulaanbaatar"]],
 "sports|Ice hockey and the cold north":[[-73.57,45.5,"Montréal"],[-79.38,43.65,"Toronto"]],
 /* added by the tour review of 2026-11-05 */
 "climate|Same line, different worlds":[[31.24,30.04,"Cairo"],[-90.07,29.95,"New Orleans"],[121.47,31.23,"Shanghai"]],
 "houses|Snow houses":[[-81.8,69.38,"Igloolik"]],
 "houses|Towers that catch the wind":[[54.37,31.9,"Yazd"]],
 "deserts|Hotter than an oven floor":[[59.1,30.4,"Lut Desert"],[57.08,30.28,"Kerman"]],
 "weather|Warm winds off the mountains":[[-110.5,47.93,"Loma, Montana"],[-111.3,47.5,"Great Falls"]]};
window.gfTourThermo=T;
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
let cur=null;
function sync(){try{const on=typeof ps!=="undefined"&&ps,S=on?psSteps()[ps.i]:null,k=on&&S?ps.tour+"|"+clean(S.title):null,L=k&&T[k];
 if((L?k:null)===cur)return;cur=L?k:null;if(!window.gfThermo)return;gfThermo.clearAuto();if(L)setTimeout(()=>{if(cur===k)gfThermo.setAuto(L)},700)}catch(e){console.error("tourthermo",e)}}
setInterval(sync,500);
})();
