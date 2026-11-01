/* GeoFlock: a moving icon on a tour stop. A stop with mover:{icon:"raft", path:[[lon,lat],…], secs} shows the icon travelling
   along the path over and over (fading in at the start and out at the end, bobbing on the way), on the flat map and the globe.
   Used by Human origins › "Monkeys on rafts": a raft of tangled trees with a monkey aboard, drifting from Africa to South America. */
(function(){
const ICONS={
 raft:'<svg viewBox="0 0 64 48" width="46" height="35" aria-hidden="true">'+
  '<ellipse cx="32" cy="41" rx="27" ry="4" fill="rgba(20,60,110,.35)"/>'+
  /* a leafy branch sticking up from the raft */
  '<path d="M41 33 L45 12" stroke="#5a3d22" stroke-width="2.4" stroke-linecap="round"/>'+
  '<ellipse cx="45" cy="11" rx="9" ry="6" fill="#3f8f46"/><ellipse cx="38" cy="15" rx="6" ry="4" fill="#4fa356"/><ellipse cx="51" cy="16" rx="6" ry="4" fill="#367d3d"/>'+
  /* the logs */
  '<g stroke="#4a3018" stroke-width="1"><rect x="6" y="31" width="52" height="5.5" rx="2.7" fill="#9b6b3c"/><rect x="9" y="35.5" width="48" height="5.5" rx="2.7" fill="#8a5c31"/><rect x="5" y="27" width="46" height="5.5" rx="2.7" fill="#a8774a"/></g>'+
  '<path d="M18 26 v15 M34 26 v15" stroke="#d9c08a" stroke-width="1.6"/>'+
  /* a small monkey sitting on it */
  '<path d="M17 25 q-6 -2 -5 -9" stroke="#6b4426" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
  '<ellipse cx="22" cy="22" rx="5" ry="5.5" fill="#7a4e2b"/><circle cx="23.5" cy="14.5" r="4.2" fill="#7a4e2b"/><circle cx="24.6" cy="15" r="2.3" fill="#d8b48a"/><circle cx="24.4" cy="14.2" r=".6" fill="#222"/>'+
  '</svg>'};
let el=null,raf=0,t0=0,key=null;
const stop=()=>{try{return typeof ps!=="undefined"&&ps?psSteps()[ps.i]:null}catch(e){return null}};
function along(P,f){/* the point a fraction f of the way along the path */
 const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const d=f*L[L.length-1];let i=1;while(i<P.length-1&&L[i]<d)i++;
 const t=(d-L[i-1])/Math.max(1e-9,L[i]-L[i-1]);return[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t]}
function hide(){if(el)el.style.display="none";if(raf){cancelAnimationFrame(raf);raf=0}}
function frame(ts){raf=0;const S=stop(),M=S&&S.mover,host=typeof ps!=="undefined"&&ps&&ps.g&&ps.g.host;if(!M||!host){hide();return}
 if(!el||el.parentNode!==host){if(el)el.remove();el=document.createElement("div");el.className="gf-mover";host.appendChild(el);key=null}
 const k=(typeof ps!=="undefined"&&ps.tour)+"|"+ps.i;if(k!==key){key=k;t0=ts;el.innerHTML=ICONS[M.icon]||ICONS.raft}
 const still=matchMedia("(prefers-reduced-motion: reduce)").matches,secs=M.secs||9,u=still?.5:((ts-t0)/1000%secs)/secs,ll=along(M.path,u),q=typeof psScreen==="function"?psScreen(ll):null;
 if(!q){el.style.display="none"}else{const fade=Math.min(1,u/.08,(1-u)/.1),bob=still?0:Math.sin(ts/420)*3.5,tilt=still?0:Math.sin(ts/610)*5;
  el.style.display="";el.style.left=q[0]+"px";el.style.top=q[1]+"px";el.style.opacity=Math.max(0,fade).toFixed(3);el.firstChild&&(el.firstChild.style.transform="translate(-50%,-80%) translateY("+bob.toFixed(1)+"px) rotate("+tilt.toFixed(1)+"deg)")}
 raf=requestAnimationFrame(frame)}
setInterval(()=>{try{const S=stop();if(S&&S.mover){if(!raf)raf=requestAnimationFrame(frame)}else hide()}catch(e){}},250);
const css=document.createElement("style");css.textContent=`
.gf-mover{ position:absolute; width:0; height:0; pointer-events:none; z-index:25; }
.gf-mover svg{ position:absolute; left:0; top:0; display:block; filter:drop-shadow(0 2px 3px rgba(0,0,0,.35)); }`;
document.head.appendChild(css);
/* Human origins › Monkeys on rafts */
const add=()=>{try{const T=typeof PS_TOURS!=="undefined"&&PS_TOURS.humans;const S=T&&(T.steps||[]).find(s=>s&&s.title==="Monkeys on rafts");if(!S)return false;
 if(!S.mover)S.mover={icon:"raft",path:[[8,2],[-5,0],[-18,-2],[-30,-4],[-40,-5]],secs:10};return true}catch(e){return false}};
if(!add()){let n=0;const t=setInterval(()=>{if(add()||++n>60)clearInterval(t)},500)}
})();
