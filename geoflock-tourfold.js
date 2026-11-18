/* GeoFlock: the "Guided tour on …" button on the map can be folded away into a small tab of the same colour.
   A "‹" button after "N more" folds it; the tab (play icon + "Tour") unfolds it again. The choice is kept on this
   device for every map (localStorage, used only as a convenience). Hooked on psSync, which builds the launcher. */
(function(){
"use strict";
if(typeof psSync!=="function")return;
const KEY="gfTourFolded";
const get=()=>{try{return localStorage.getItem(KEY)==="1"}catch(e){return false}};
const set=v=>{try{v?localStorage.setItem(KEY,"1"):localStorage.removeItem(KEY)}catch(e){}};
const PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
function deco(L){const go=L.querySelector(".ps-launch");if(!go)return;
 if(!L.querySelector(".gf-tf-fold")){
  const f=document.createElement("button");f.type="button";f.className="gf-tf-fold";f.title="Fold the tour button away";f.setAttribute("aria-label","Fold the tour button away");f.textContent="‹";
  f.onclick=e=>{e.stopPropagation();set(true);all()};
  const more=L.querySelector(".ps-launch-more");(more||go).after(f);
  const t=document.createElement("button");t.type="button";t.className="gf-tf-tab";t.title="Show the guided tours";t.setAttribute("aria-label","Show the guided tours");
  t.innerHTML=PLAY+"<span>Tour</span>";t.onclick=e=>{e.stopPropagation();set(false);all();try{L.querySelector(".ps-launch").focus({preventScroll:true})}catch(_){}};
  L.appendChild(t)}
 /* the tab takes the tour button's own colour */
 const t=L.querySelector(".gf-tf-tab");try{const cs=getComputedStyle(go);t.style.background=cs.backgroundImage&&cs.backgroundImage!=="none"?cs.backgroundImage:cs.backgroundColor;t.style.color=cs.color}catch(e){}
 L.classList.toggle("gf-tf-on",get())}
function all(){document.querySelectorAll(".ps-launcher").forEach(deco)}
const _s=psSync;psSync=function(){const r=_s.apply(this,arguments);try{all()}catch(e){}return r};
const st=document.createElement("style");st.textContent=`
.ps-launcher .gf-tf-fold{ width:28px; height:28px; min-width:28px; border-radius:50%; border:1px solid rgba(255,255,255,.9); background:rgba(255,255,255,.85);
 color:#16324f; font:700 17px/1 inherit; font-family:inherit; cursor:pointer; padding:0 0 2px; align-self:center; box-shadow:0 3px 10px rgba(20,40,70,.15); flex:none; }
.ps-launcher .gf-tf-fold:hover{ background:#fff; }
body.dark-theme .ps-launcher .gf-tf-fold, body.sky-night .ps-launcher .gf-tf-fold{ background:rgba(30,40,64,.85); color:#fff; border-color:rgba(255,255,255,.25); }
.ps-launcher .gf-tf-tab{ display:none; align-items:center; gap:5px; border:0; border-radius:999px; padding:5px 11px 5px 8px; color:#fff;
 font:700 12px/1.1 inherit; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(20,40,70,.25); }
.ps-launcher .gf-tf-tab svg{ width:13px; height:13px; }
.ps-launcher .gf-tf-tab:hover{ filter:brightness(1.08); }
.ps-launcher.gf-tf-on > .ps-launch, .ps-launcher.gf-tf-on > .ps-launch-more, .ps-launcher.gf-tf-on > .ps-menu, .ps-launcher.gf-tf-on > .gf-tf-fold{ display:none !important; }
.ps-launcher.gf-tf-on > .gf-tf-tab{ display:inline-flex; }`;
document.head.appendChild(st);
setTimeout(all,300);
})();
