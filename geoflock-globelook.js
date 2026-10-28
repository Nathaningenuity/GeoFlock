/* GeoFlock: how the 3D globe sits on the page.
   1. Satellite mode: the starry sky fades out softly in a circle round the globe instead of ending in a hard black box
      (full screen keeps the whole sky).
   2. A thin atmosphere rim round the globe in every map, not only satellite.
   3. In the light themes, a soft shadow under the globe so it seems to float. */
(function(){
if(typeof GlobeView==="undefined")return;
const dark=()=>document.body.classList.contains("sky-night");
const css=document.createElement("style");css.textContent=`
.globe-stage.gf-sky{ background:none !important; isolation:isolate; }
.globe-stage.gf-sky::before{ content:""; position:absolute; inset:calc(var(--gf-r,200px) * -.32); z-index:-1; pointer-events:none; background-image:var(--gf-sky); background-size:auto;
 -webkit-mask-image:radial-gradient(circle at calc(var(--gf-cx,400px) + var(--gf-r,200px) * .32) calc(var(--gf-cy,400px) + var(--gf-r,200px) * .32), #000 calc(var(--gf-r,200px) * 1.0), transparent calc(var(--gf-r,200px) * 1.32));
 mask-image:radial-gradient(circle at calc(var(--gf-cx,400px) + var(--gf-r,200px) * .32) calc(var(--gf-cy,400px) + var(--gf-r,200px) * .32), #000 calc(var(--gf-r,200px) * 1.0), transparent calc(var(--gf-r,200px) * 1.32)); }
.globe-stage{ isolation:isolate; } .globe-stage .gf-float{ position:absolute; z-index:-1; pointer-events:none; left:calc(var(--gf-cx) - var(--gf-r) * .62); width:calc(var(--gf-r) * 1.24); top:calc(var(--gf-cy) + var(--gf-r) * 1.04); height:calc(var(--gf-r) * .16);
 background:radial-gradient(ellipse at center, rgba(20,40,70,.28), rgba(20,40,70,.1) 45%, transparent 70%); filter:blur(2px); }`;document.head.appendChild(css);
/* the rim: drawn just outside the globe's edge, after everything else */
const P=GlobeView.prototype,_dm=P._drawMeasure;P._drawMeasure=function(ctx,p){const r=_dm.apply(this,arguments);try{if(typeof amGlobe!=="undefined"&&this===amGlobe&&!this._flat){
 const t=p.translate(),R=p.scale(),sat=document.getElementById("allMapsView")?.classList.contains("sat-on");if(sat||!isFinite(R))return r;
 const g=ctx.createRadialGradient(t[0],t[1],R*.985,t[0],t[1],R*1.07),c=dark()?"120,170,255":"110,170,240";
 g.addColorStop(0,"rgba("+c+",0.55)");g.addColorStop(.35,"rgba("+c+",0.22)");g.addColorStop(1,"rgba("+c+",0)");
 ctx.save();ctx.beginPath();ctx.arc(t[0],t[1],R*1.08,0,7);ctx.arc(t[0],t[1],R*.985,0,7,true);ctx.fillStyle=g;ctx.fill("evenodd");ctx.restore()}}catch(e){}return r};
function sync(){let g;try{g=amGlobe}catch(e){return}if(!g||!g.host)return;const st=g.host.querySelector(".globe-stage");if(!st)return;
 const v=document.getElementById("allMapsView"),sat=v&&v.classList.contains("sat-on"),full=!!document.fullscreenElement,globe=!g._flat&&appMode==="allmaps";
 /* where the globe is, for the fade and the shadow */
 try{const p=g.projection(),t=p.translate(),R=p.scale(),cr=g.canvas.getBoundingClientRect(),sr=st.getBoundingClientRect();
  st.style.setProperty("--gf-cx",(cr.left-sr.left+t[0])+"px");st.style.setProperty("--gf-cy",(cr.top-sr.top+t[1])+"px");st.style.setProperty("--gf-r",Math.max(40,R)+"px")}catch(e){}
 const wantSky=globe&&sat&&!full;
 if(wantSky&&!st.classList.contains("gf-sky")){st.classList.remove("gf-sky");const bg=getComputedStyle(st).backgroundImage;if(bg&&bg!=="none"){st.style.setProperty("--gf-sky",bg);st.classList.add("gf-sky")}}
 else if(!wantSky&&st.classList.contains("gf-sky"))st.classList.remove("gf-sky");
 let fl=st.querySelector(":scope > .gf-float");const wantFloat=globe&&!sat&&!dark();
 if(wantFloat&&!fl){fl=document.createElement("div");fl.className="gf-float";st.insertBefore(fl,st.firstChild)}else if(!wantFloat&&fl)fl.remove()}
setInterval(()=>{try{sync()}catch(e){}},300);
})();
