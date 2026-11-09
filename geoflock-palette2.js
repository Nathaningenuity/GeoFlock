/* GeoFlock: the Relief map's lakes get their own colour, apart from the shallow sea, and the map key follows every colour
   change in the Palette (your shades of Natural Earth or Bright, or your own colours). The lake colour is kept for each
   map style separately, in this browser (localStorage gfLakeCol). */
(function(){
"use strict";
const KEY="gfLakeCol";let LAKE={};try{LAKE=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const style=()=>{try{return gfMS().style}catch(e){return null}};
window.gfLakeColor=function(){const s=style();return(s&&LAKE[s])||null};
const DEF_LAKE="#2f7ab8";/* the rivers' blue */
function legendRefresh(){try{const lg=document.getElementById("populationLegend");if(lg&&allMapsColorMode==="relief"&&typeof allMapsLegendHTML==="function")lg.innerHTML=allMapsLegendHTML()}catch(e){}}
/* the flat map's lakes are coloured by a stylesheet rule (marked important): a rule of our own, a step stronger, carries the chosen colour */
function lakeCss(){let st=document.getElementById("gfLakeCss");const c=gfLakeColor();if(!c){if(st)st.textContent="";return}if(!st){st=document.createElement("style");st.id="gfLakeCss";document.head.appendChild(st)}
 st.textContent='html:root body #allMapsWrap.map-wrap.relief-mode:not(.climate-mode):not(.night-mode):not(.elev-mode):not(.dens-mode):not(.sat-mode) svg path:is(.map-lake, .map-lake-minor):not(.lake-hover):not(:hover){ fill:'+c+' !important; }'}
setInterval(()=>{const k=style()+"|"+gfLakeColor();if(k!==lakeCss._k){lakeCss._k=k;lakeCss()}},500);
function repaint(){lakeCss._k=style()+"|"+gfLakeColor();lakeCss();window._gfSeaSig=Date.now();try{GFG.sig=null;gfGlobeDirty()}catch(e){}try{amGlobe&&amGlobe.request()}catch(e){}try{typeof renderAllMaps==="function"&&renderAllMaps()}catch(e){}legendRefresh()}
/* ---- the key ---- */
function wrapLegend(){if(typeof reliefLegendHTML!=="function"||reliefLegendHTML._gfP2)return typeof reliefLegendHTML==="function";const _r=reliefLegendHTML;
 reliefLegendHTML=function(){let h=_r.apply(this,arguments);try{const st=style();
  /* your own colours: the key shows its heights and depths */
  if(st==="mine"&&typeof GF_STYLES!=="undefined"&&GF_STYLES.mine){const m=GF_STYLES.mine,L=m.land.map(x=>x[1]),Sd=m.sea.map(x=>x[1]);
   h=h.replace(/linear-gradient\(to right, [^)]*\)/,"linear-gradient(to right, "+Sd.join(", ")+")");
   const lab=["lowlands","hills","mountains","peaks"];h=h.replace(/<span class="legend-title">Land cover<\/span>\s*<span class="legend-swatches">[\s\S]*?<\/span>\s*<\/span>/,'<span class="legend-title">Land height</span><span class="legend-swatches">'+L.slice(0,4).map((c,i)=>`<span class="legend-swatch"><i style="background:${c}"></i>${lab[i]}</span>`).join("")+'</span>');
   h=h.replace("land colour is cover, not elevation","land colour shows height")}
  /* your shades of Natural Earth or Bright */
  const A=window.gfReliefAdj&&gfReliefAdj.ADJ&&gfReliefAdj.ADJ[st];
  if(A){const map={forest:"forest",grass:"grass, steppe",desert:"desert",ice:"ice, high peaks"};
   for(const k in map)if(A[k])h=h.replace(new RegExp('<i style="background:[^"]*"></i>'+map[k].replace(/[,]/g,"\\,")),'<i style="background:'+A[k]+'"></i>'+map[k]);
   if(A.shallow||A.deep)h=h.replace(/linear-gradient\(to right, ([^)]*)\)/,(all,list)=>{const c=list.split(/,\s*/);if(A.shallow){c[0]=A.shallow;if(c.length>2)c[1]=A.shallow}if(A.deep){c[c.length-1]=A.deep;if(c.length>2)c[c.length-2]=A.deep}return"linear-gradient(to right, "+c.join(", ")+")"})}
  /* the lake, in its own colour */
  const lk=gfLakeColor();if(lk)h=h.replace(/<i style="background:[^"]*"><\/i>lake/,'<i style="background:'+lk+'"></i>lake')}catch(e){console.error(e)}return h};
 reliefLegendHTML._gfP2=1;return true}
let n=0;const t=setInterval(()=>{if(wrapLegend()||++n>80)clearInterval(t)},400);
/* ---- the Lake well in the Palette ---- */
function addWell(){const p=document.getElementById("gfkPal");if(!p||typeof allMapsColorMode==="undefined"||allMapsColorMode!=="relief")return;
 const box=p.querySelector(".gfra .gfk-mine")||[...p.querySelectorAll(".gfk-sec")].find(x=>/Your own colours/.test(x.textContent)&&x.querySelector(".gfk-mine"))?.querySelector(".gfk-mine");
 if(!box||box.querySelector("[data-lake]"))return;const l=document.createElement("label");l.innerHTML='<input type="color" data-lake value="'+(gfLakeColor()||DEF_LAKE)+'"><span>Lakes</span>';box.appendChild(l);
 l.querySelector("input").addEventListener("input",e=>{const st=style();if(!st)return;LAKE[st]=e.target.value;try{localStorage.setItem(KEY,JSON.stringify(LAKE))}catch(err){}repaint()})}
new MutationObserver(addWell).observe(document.body,{childList:true,subtree:true});
/* every colour change in the Palette: the key follows (the shades are painted a moment later) */
document.addEventListener("change",e=>{if(e.target.closest&&e.target.closest("#gfkPal")){window._gfSeaSig=Date.now();legendRefresh();setTimeout(legendRefresh,1500);setTimeout(legendRefresh,4000)}},true);
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#gfkPal [data-ra-reset]")){/* back to the original: the lakes too */const st=style();if(st&&LAKE[st]){delete LAKE[st];try{localStorage.setItem(KEY,JSON.stringify(LAKE))}catch(err){}const i=document.querySelector("#gfkPal [data-lake]");if(i)i.value=DEF_LAKE;repaint()}}},true);
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#gfkPal [data-st], #gfkPal [data-ra-reset]")){setTimeout(legendRefresh,300);setTimeout(legendRefresh,1500)}},true);
})();
document.addEventListener("input",e=>{if(e.target.closest&&e.target.closest("#gfkPal"))window._gfSeaSig=Date.now()},true);
