/* GeoFlock: every map has its own address, updated as you switch, without reloading the page.
   #maps/<map>[/<measure>][/globe|/day-night]   e.g. #maps/gdp/percapita, #maps/satellite/day-night, #maps/history/globe
   Also #maps/projections and #maps/deep-time. Opening such a link (or going back and forward) shows that map. */
(function(){
const on=()=>typeof appMode!=="undefined"&&appMode==="allmaps";
const touring=()=>typeof ps!=="undefined"&&!!ps;
const chips=()=>[...document.querySelectorAll("#allMapsToggleRow button, #allMapsToggleRow [data-allmaps-mode]")];
const byText=t=>chips().find(b=>(b.textContent||"").trim().toLowerCase().startsWith(t));
function deepOn(){const d=document.getElementById("gfDeep");return!!(d&&!d.hidden&&d.offsetParent)}
function projOn(){return typeof proj!=="undefined"&&!!proj.on}
/* the address for what is on screen now */
function addr(){try{if(projOn())return"#maps/projections";if(deepOn())return"#maps/deep-time";
  if(typeof allMapsColorModeOn!=="undefined"&&!allMapsColorModeOn)return"#maps";
  const m=allMapsColorMode;let a="#maps/"+m;
  const subs=typeof ALLMAPS_SUBMODES!=="undefined"&&ALLMAPS_SUBMODES[m];if(subs&&subs.length){const s=allMapsSubMode[m];if(s&&s!==subs[0].id)a+="/"+encodeURIComponent(s)}
  const dn=window.gfDNG&&gfDNG.on&&gfDNG.on();
  if(dn)a+="/day-night";else if(typeof amGlobeOn==="function"&&amGlobeOn()&&!(amGlobe&&amGlobe._flat))a+="/globe";
  return a}catch(e){return null}}
let last="",applying=false;
setInterval(()=>{try{if(applying||!on()||touring())return;if(/^#(tour|wi)=/.test(location.hash))return;const a=addr();if(!a||a===last)return;
  /* a different map is a new history entry (so Back works); a different measure or view just updates the address */
  if(location.hash!==a){const sameMap=last&&last.split("/")[1]===a.split("/")[1];if(sameMap||!last)history.replaceState(null,"",location.pathname+location.search+a);else history.pushState(null,"",location.pathname+location.search+a)}last=a}catch(e){}},400);
/* open a link like #maps/gdp/percapita/globe */
function open(h){const m=/^#maps\/([^/?&]+)(?:\/([^/?&]+))?(?:\/([^/?&]+))?/.exec(h||"");if(!m)return;applying=true;
 const parts=[m[1],m[2],m[3]].filter(Boolean).map(decodeURIComponent),map=parts[0];let rest=parts.slice(1);
 const view=rest.find(x=>x==="globe"||x==="flat"||x==="day-night"),sub=rest.find(x=>x!==view);
 const steps=[];
 steps.push(()=>{if(!on())switchAppMode("allmaps")});
 if(map==="projections"){steps.push(()=>{const b=document.getElementById("projTabChip")||byText("projections");if(b&&!projOn())b.click()})}
 else if(map==="deep-time"){steps.push(()=>{const b=byText("deep time");if(b&&!deepOn())b.click()})}
 else{
  steps.push(()=>{const b=document.querySelector('[data-allmaps-mode="'+map+'"]');if(b&&!(allMapsColorModeOn&&allMapsColorMode===map))b.click()});
  if(view)steps.push(()=>{try{const g=view!=="flat";if(!!globePrefs().allmaps!==g){globePrefs().allmaps=g;saveStats();amGlobeSync()}}catch(e){}});
  if(sub)steps.push(()=>{const b=document.querySelector('#amGlobeSubs [data-sub="'+sub+'"], #allMapsSubModes [data-allmaps-sub="'+sub+'"]');if(b&&!b.classList.contains("active"))b.click();
   else if(!b){try{allMapsSubMode[map]=sub;applyAllMapsColorMode(document.getElementById("allMapsWrap"));amGlobeSync()}catch(e){}}});
  if(view==="day-night")steps.push(()=>{try{gfDNG.set(true)}catch(e){}});
  else if(map==="satellite"&&view==="globe")steps.push(()=>{try{gfDNG.state.userDay=true;if(gfDNG.on())gfDNG.set(false)}catch(e){}})}
 let i=0;const next=()=>{if(i>=steps.length){setTimeout(()=>{applying=false;last=""},800);return}try{steps[i++]()}catch(e){}setTimeout(next,i===1?900:600)};next()}
function ready(f){let n=0;const t=setInterval(()=>{if(typeof switchAppMode==="function"&&document.querySelector("[data-allmaps-mode]")||++n>80){clearInterval(t);f()}},250)}
if(/^#maps\//.test(location.hash)){const h=location.hash;applying=true;const go=()=>ready(()=>setTimeout(()=>open(h),600));if(document.readyState==="complete")go();else addEventListener("load",go)}
addEventListener("popstate",()=>{if(/^#maps\//.test(location.hash)&&location.hash!==addr())open(location.hash)});
window.gfMapLink={addr,open};
})();
