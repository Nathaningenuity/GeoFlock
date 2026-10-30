/* GeoFlock: a tour that uses the History map stays on the History map.
   Tours such as Learning, Maths or Mythology mixed History-map stops with Relief-map stops, so the map jumped back and
   forth, each jump reloading a whole map (several seconds on the slow ones). Now such a tour runs entirely on the History
   map: its relief/satellite/elevation stops become History-map stops at the year the stop talks about (the first year or
   century in its title, stat or text), or at the latest year for stops about today. Stops on data maps that carry the
   point (Economy, People, Culture…) keep their own map. */
(function(){
const BASE=["relief","satellite","elevation",undefined,null,""];
function keys(){try{return HIST_DATA.years.map(Y=>Y.y)}catch(e){return null}}
const yk=k=>/^bc/.test(k)?1-(+k.slice(2)):+k;
function snap(y,K){let best=K[K.length-1],d=1e9;K.forEach(k=>{const e=Math.abs(yk(k)-y);if(e<d){d=e;best=k}});return best}
/* the year a stop talks about */
function yearOf(S){const txt=[S.title,S.stat,S.body].filter(Boolean).join(" ");
 if(/\b(today|now|modern|nowadays)\b/i.test(S.title||""))return null;
 let m=txt.match(/\b(\d{1,2})(?:st|nd|rd|th) centur(?:y|ies)( BC| BCE)?/i);const c=m?((+m[1])-.5)*100*(m[2]?-1:1):null;
 /* a year, not a count: four digits (1000–2030) not followed by a unit or a noun such as "characters"; or three digits
    only after "in", "by", "around", "AD"… ("500 characters" or "980 buildings" are not years) */
 let y=null;
 m=txt.match(/\b(1\d{3}|20[0-2]\d)\b(?!\s*(?:km|m\b|people|metres|meters|kilometres|miles|%|years|characters|languages|buildings|species|islands|kinds|words|letters|books|towns|cities|villages|temples|ships|men|soldiers|tonnes|tons|feet))/);
 if(m)y=+m[1];
 const m3=txt.match(/\b(?:in|by|from|since|until|around|about|c\.|circa|AD)\s+(\d{3})\b(?!\s*(?:km|m\b|people|metres|kilometres|miles|%|years|BC|BCE))/i);
 if(y==null&&m3)y=+m3[1];
 m=txt.match(/\b(\d{2,5})\s*(BC|BCE)\b/i);if(m&&(y==null||y>0))y=1-(+m[1]);
 if(c!=null&&(y==null||txt.search(/centur/i)<txt.search(/\d{3,4}/)))return c;return y}
function convert(T){try{const K=keys();if(!K||!T||!T.steps||T.steps._gfHist)return;const home=T.map&&T.map.mode;
 const isHist=s=>(s.mode||home)==="history";if(home==="history"||!T.steps.some(isHist))return;
 T.steps._gfHist=1;T.map.mode="history";let last=null;
 T.steps.forEach((S,i)=>{const m=S.mode;if(m==="history"){last=S.sub?String(S.sub).split("/")[0]:last;return}
  if(!BASE.includes(m))return;           /* a data map that carries the point keeps its map */
  try{Object.defineProperty(S,"mode",{value:"history",writable:true,configurable:true,enumerable:true})}catch(e){S.mode="history"}
  if(!S.sub){const y=yearOf(S);const k=y==null?(i===0||i===T.steps.length-1||!last?K[K.length-1]:last):snap(y,K);
   try{Object.defineProperty(S,"sub",{value:k,writable:true,configurable:true,enumerable:true})}catch(e){S.sub=k}last=k}});
 if(T.alsoOn)T.alsoOn=T.alsoOn.filter(x=>x!=="history"&&x!=="relief")}catch(e){console.error("tourhist",e)}}
function all(){try{Object.keys(PS_TOURS).forEach(id=>convert(PS_TOURS[id]))}catch(e){}}
/* before a tour opens (its steps may have been rebuilt late) and at load */
function hook(){if(typeof psLaunchTour!=="function"||psLaunchTour._gfHist)return false;const _l=psLaunchTour;psLaunchTour=function(id){try{convert(PS_TOURS[id])}catch(e){}return _l.apply(this,arguments)};psLaunchTour._gfHist=1;
 if(typeof psStart==="function"){const _s=psStart;psStart=function(id){try{if(id)convert(PS_TOURS[id])}catch(e){}return _s.apply(this,arguments)}}return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},300)}
[1500,5000,12000].forEach(ms=>setTimeout(all,ms));
window.gfTourHist={convert,yearOf};
})();
