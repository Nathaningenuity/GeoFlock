/* GeoFlock: City Lights is a map tab in every theme. In the light themes the tab shows like the others, and choosing it
   switches the page to the Starlight (night) theme first, which City Lights is drawn for. */
(function(){
"use strict";
const SEL='[data-allmaps-mode="night"]';
const st=document.createElement("style");st.textContent=`
html body:not(.sky-night) button${SEL}{ display:inline-flex !important; }`;
document.head.appendChild(st);
document.addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest(SEL);if(!b||document.body.classList.contains("sky-night"))return;
 try{if(typeof stats!=="undefined"&&typeof applyTheme==="function"){stats.theme="night";applyTheme();if(typeof saveStats==="function")saveStats()}}catch(err){console.error(err)}},true);
})();
