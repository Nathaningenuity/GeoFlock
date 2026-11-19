/* GeoFlock: the guided tour button on the map is a small tab: "▶ Tour" in the tour's own colour, with a small ▾ at its
   end when the map has more tours (it opens the same list as "N more" did). The full tour name stays as the button's
   tooltip and spoken label. Hooked on psSync, which builds the launcher. */
(function(){
"use strict";
if(typeof psSync!=="function")return;
try{localStorage.removeItem("gfTourFolded")}catch(e){}
function deco(L){const go=L.querySelector(".ps-launch");if(!go)return;
 if(!go.dataset.gfTab){go.dataset.gfTab="1";
  const name=(go.textContent||"").trim();if(name){go.setAttribute("aria-label",name);go.title=name+(go.title?" — "+go.title:"")}
  [...go.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});go.insertAdjacentHTML("beforeend","<span>Tour</span>")}
 const more=L.querySelector(".ps-launch-more");
 if(more&&!more.dataset.gfTab){more.dataset.gfTab="1";more.setAttribute("aria-label",(more.textContent||"More tours").replace("▾","").trim());more.textContent="▾"}
 L.classList.toggle("gf-tab-more",!!more);
 /* the list starts with this map's own tour, marked as the main one */
 const menu=L.querySelector(".ps-menu"),id=go.dataset.psStart;
 if(menu&&id&&!menu.querySelector('.gf-main[data-ps-start="'+id+'"]')){try{const T=PS_TOURS[id];if(T){const b=document.createElement("button");b.type="button";b.className="ps-menu-item gf-main";b.dataset.psStart=id;
  b.innerHTML='<i style="background:'+T.col+'"></i><span><b></b><small></small></span>';b.querySelector("b").textContent=T.short||T.name;b.querySelector("small").textContent=T.hint||"";menu.prepend(b)}}catch(e){}}
 if(menu&&!menu._gfTop){menu._gfTop=1;new MutationObserver(()=>{if(!menu.hidden)menu.scrollTop=0}).observe(menu,{attributes:true,attributeFilter:["hidden"]})}
 /* the arrow wears the tab's colour */
 if(more){try{const cs=getComputedStyle(go);more.style.background=cs.backgroundImage&&cs.backgroundImage!=="none"?cs.backgroundImage:cs.backgroundColor;more.style.color=cs.color;const bw=cs.borderTopWidth,bc=cs.borderTopColor;if(parseFloat(bw)>0)more.style.setProperty("border",bw+" solid "+bc,"important"),more.style.setProperty("border-left","0","important")}catch(e){}}}
function all(){document.querySelectorAll(".ps-launcher").forEach(deco)}
const _s=psSync;psSync=function(){const r=_s.apply(this,arguments);try{all()}catch(e){}return r};
const st=document.createElement("style");st.textContent=`
.ps-launcher{ gap:0 !important; }
.ps-launcher > .ps-launch{ font-size:12px !important; padding:5px 11px 5px 9px !important; gap:5px; line-height:1.1 !important; }
.ps-launcher > .ps-launch svg{ width:13px; height:13px; }
.ps-launcher.gf-tab-more > .ps-launch{ border-right:0 !important; border-top-right-radius:0 !important; border-bottom-right-radius:0 !important; padding-right:5px !important; }
.ps-launcher > .ps-launch-more{ border:0 !important; border-radius:0 999px 999px 0 !important; padding:5px 9px 5px 4px !important;
 font-size:11px !important; line-height:1.1 !important; margin:0 !important; align-self:stretch; display:inline-flex; align-items:center; }
.ps-launcher > .ps-launch-more:hover{ filter:brightness(1.1); }
.ps-menu .ps-menu-item{ transition:background .15s, transform .15s, box-shadow .15s; }
.ps-menu .ps-menu-item i{ transition:transform .15s, box-shadow .15s; }
.ps-menu .ps-menu-item:hover, .ps-menu .ps-menu-item:focus-visible{ background:rgba(22,50,79,.09) !important; transform:translateX(3px); box-shadow:inset 3px 0 0 rgba(22,50,79,.25); }
.ps-menu .ps-menu-item:hover i, .ps-menu .ps-menu-item:focus-visible i{ transform:scale(1.35); box-shadow:0 0 0 3px rgba(255,255,255,.35); }
:is(body.dark-theme, body.sky-night) .ps-menu .ps-menu-item:hover, :is(body.dark-theme, body.sky-night) .ps-menu .ps-menu-item:focus-visible{ background:rgba(255,255,255,.12) !important; box-shadow:inset 3px 0 0 rgba(255,255,255,.45); }
:is(body.dark-theme, body.sky-night) .ps-menu .ps-menu-item:hover small{ color:#d4dbf5 !important; }
@media (prefers-reduced-motion: reduce){ .ps-menu .ps-menu-item, .ps-menu .ps-menu-item i{ transition:none; transform:none !important; } }`;
document.head.appendChild(st);
setTimeout(all,300);
})();
