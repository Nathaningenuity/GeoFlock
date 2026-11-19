/* GeoFlock: City Lights is a map tab in every theme. In the light themes, choosing it asks first, in a small window,
   whether to switch to the dark (Starlight) theme City Lights is drawn for: "Switch to dark mode" switches and opens
   City Lights; "Not now" (or ×, Esc, a click outside) stays where you were. */
(function(){
"use strict";
const SEL='[data-allmaps-mode="night"]';
const st=document.createElement("style");st.textContent=`
html body:not(.sky-night) button${SEL}{ display:inline-flex !important; }
.gf-cl-ask{ position:fixed; inset:0; z-index:9500; display:flex; align-items:center; justify-content:center; padding:16px; }
.gf-cl-ask .game-modal{ position:relative; width:min(420px,100%); padding:22px 22px 18px; text-align:center; }
.gf-cl-ask h3{ margin:0 0 6px; font-size:19px; } .gf-cl-ask p{ margin:0 0 16px; font-size:14px; opacity:.8; line-height:1.4; }
.gf-cl-ask .gf-cl-row{ display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
.gf-cl-ask .gf-cl-row button{ border-radius:999px; padding:9px 16px; font:700 14px inherit; font-family:inherit; cursor:pointer; border:1.5px solid rgba(22,50,79,.18); background:transparent; color:inherit; }
.gf-cl-ask .gf-cl-row .gf-cl-yes{ background:#232a5c; border-color:#232a5c; color:#fff; }
.gf-cl-ask .gf-cl-moon{ font-size:30px; line-height:1; margin-bottom:6px; }
.gf-cl-ask .modal-x{ position:absolute; top:10px; right:12px; }`;
document.head.appendChild(st);
function ask(b){document.querySelectorAll(".gf-cl-ask").forEach(x=>x.remove());
 const d=document.createElement("div");d.className="game-modal-backdrop gf-cl-ask";
 d.innerHTML='<div class="game-modal" role="dialog" aria-modal="true" aria-labelledby="gfClH"><button class="modal-x" type="button" aria-label="Close">×</button><div class="gf-cl-moon" aria-hidden="true">🌙</div><h3 id="gfClH">Switch to dark mode?</h3><p>City Lights shows the Earth at night, and it is made for the dark theme.</p><div class="gf-cl-row"><button type="button" class="gf-cl-yes">Switch to dark mode</button><button type="button" class="gf-cl-no">Not now</button></div></div>';
 const close=()=>{d.remove();removeEventListener("keydown",k,true)};
 const k=e=>{if(e.key==="Escape"){e.stopPropagation();close()}};addEventListener("keydown",k,true);
 d.addEventListener("click",e=>{if(e.target===d||e.target.closest(".modal-x,.gf-cl-no")){close();return}
  if(e.target.closest(".gf-cl-yes")){close();try{stats.theme="night";applyTheme();if(typeof saveStats==="function")saveStats()}catch(err){console.error(err)}
   setTimeout(()=>{try{(document.querySelector(SEL+":not([hidden])")||b).click()}catch(err){}},0)}});
 document.body.appendChild(d);setTimeout(()=>{try{d.querySelector(".gf-cl-yes").focus({preventScroll:true})}catch(e){}},30)}
addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest(SEL);if(!b||document.body.classList.contains("sky-night"))return;
 if(typeof stats==="undefined"||typeof applyTheme!=="function")return;
 e.preventDefault();e.stopImmediatePropagation();ask(b)},true);
})();
