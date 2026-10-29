/* GeoFlock: a cross-section inside a tour card. A stop with xsec:{pts:[[lon,lat,"Place"],…],title,note} shows the land's
   height along that line (ETOPO heights from the Elevation map's cross-section tool), with its places marked. Moving along the
   chart reads off the height and shows the spot on the map; the line itself is drawn on the map. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const XS=()=>window.gfCrossSection;
const stop=()=>{try{return ps?psSteps()[ps.i]:null}catch(e){return null}};
const km=(a,b)=>{const r=Math.PI/180,dl=(b[0]-a[0])*r,p1=a[1]*r,p2=b[1]*r,h=Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(h)))};
/* points every few km along the line, each with its distance from the start; the places keep their distance too */
function sample(P,n){const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+km(P[i-1],P[i]));const tot=L[L.length-1],out=[];
 for(let k=0;k<=n;k++){const d=tot*k/n;let i=1;while(i<P.length-1&&L[i]<d)i++;const t=(d-L[i-1])/Math.max(1e-9,L[i]-L[i-1]);out.push({d,ll:[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t]})}
 return{out,tot,at:L}}
function cardHTML(S){const X=S.xsec;return'<div class="psx" data-psx><div class="psx-h"><b>'+esc(X.title||"Cross-section")+'</b><span class="psx-v">Move along the chart</span></div>'+
 '<div class="psx-c"><svg class="psx-svg" viewBox="0 0 320 132" aria-label="Height along the line"></svg></div>'+(X.note?'<small class="psx-n">'+esc(X.note)+'</small>':'')+'</div>'}
{const hook=()=>{if(typeof psCardHTML!=="function"||psCardHTML._xs)return false;const _c=psCardHTML;psCardHTML=function(){let h=_c.apply(this,arguments);try{const S=stop();if(S&&S.xsec){const ui=cardHTML(S),i=h.indexOf('class="ps-stat"'),at=i>0?h.indexOf("</div>",i):-1;h=at>0?h.slice(0,at+6)+ui+h.slice(at+6):h+ui}}catch(e){console.error(e)}return h};psCardHTML._xs=1;return true};
 if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},400)}}
/* the dot on the map */
let dot=null;
function mapDot(ll){try{const host=ps&&ps.g&&ps.g.host;if(!host)return;if(!ll){if(dot)dot.style.display="none";return}
 if(!dot||dot.parentNode!==host){dot=document.createElement("div");dot.className="psx-dot";host.appendChild(dot)}
 const q=typeof psScreen==="function"?psScreen(ll):null;if(!q){dot.style.display="none";return}dot.style.display="";dot.style.left=q[0]+"px";dot.style.top=q[1]+"px"}catch(e){}}
function draw(box,S){const X=S.xsec,svg=box.querySelector("svg");if(!svg||!XS())return;box._done=1;
 XS().loadDEM().then(()=>{const{out,tot,at}=sample(X.pts,180);const fl=X.below?-1e5:0;out.forEach(p=>p.h=Math.max(fl,XS().elevAt(p.ll[0],p.ll[1])));
  const W=320,H=132,l=34,r=8,t=14,b=22,top=Math.max(500,Math.ceil(Math.max(...out.map(p=>p.h))/500)*500),bot=(m=>m>=0?0:X.below?Math.floor(m/100)*100:m>-300?0:Math.floor(m/500)*500)(Math.min(...out.map(p=>p.h)));
  const x=d=>l+(W-l-r)*d/tot,y=h=>t+(H-t-b)*(top-h)/(top-bot);
  const land=out.map((p,i)=>(i?"L":"M")+x(p.d).toFixed(1)+" "+y(p.h).toFixed(1)).join("")+"L"+x(tot)+" "+(H-b)+"L"+l+" "+(H-b)+"Z";
  let g="";for(let v=bot;v<=top;v+=top-bot>3000?1000:500)g+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(v)+'" y2="'+y(v)+'" class="psx-gl"/><text x="'+(l-4)+'" y="'+(y(v)+3)+'" class="psx-yl">'+(v?v.toLocaleString("en-GB"):"sea")+'</text>';if(bot<0)g+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(0)+'" y2="'+y(0)+'" stroke="#1f63a8" stroke-dasharray="3 2" stroke-opacity=".6"/>';
  const mark=X.mark!=null?'<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(X.mark)+'" y2="'+y(X.mark)+'" class="psx-mk"/><text x="'+(W-r-2)+'" y="'+(y(X.mark)-3)+'" class="psx-mkl">'+X.mark.toLocaleString("en-GB")+' m</text>':"";
  const places=X.pts.map((p,i)=>p[2]?'<g class="psx-pl"><line x1="'+x(at[i])+'" x2="'+x(at[i])+'" y1="'+(H-b)+'" y2="'+(y(XS().elevAt(p[0],p[1]))-2)+'"/><circle cx="'+x(at[i])+'" cy="'+y(XS().elevAt(p[0],p[1]))+'" r="2.6"/><text x="'+Math.max(l+2,Math.min(W-r-2,x(at[i])))+'" y="'+(H-b+12)+'" text-anchor="'+(i===0?"start":i===X.pts.length-1?"end":"middle")+'">'+esc(p[2])+'</text></g>':"").join("");
  svg.innerHTML='<defs><linearGradient id="psxG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0855a"/><stop offset=".5" stop-color="#9fb26a"/><stop offset="1" stop-color="#5f9d63"/></linearGradient></defs>'+g+
   '<path d="'+land+'" fill="url(#psxG)" stroke="#5b4a34" stroke-width="1"/>'+mark+places+'<line class="psx-cur" y1="'+t+'" y2="'+(H-b)+'" x1="-9" x2="-9"/><circle class="psx-cd" r="3.6" cx="-9" cy="-9"/><rect x="'+l+'" y="0" width="'+(W-l-r)+'" height="'+H+'" fill="transparent" class="psx-hit"/>';
  const v=box.querySelector(".psx-v"),cur=svg.querySelector(".psx-cur"),cd=svg.querySelector(".psx-cd"),hit=svg.querySelector(".psx-hit");
  const show=e=>{const R=svg.getBoundingClientRect(),cx=(e.clientX-R.left)/R.width*W,d=Math.max(0,Math.min(tot,(cx-l)/(W-l-r)*tot));
   const k=Math.round(d/tot*(out.length-1)),p=out[k];cur.setAttribute("x1",x(p.d));cur.setAttribute("x2",x(p.d));cd.setAttribute("cx",x(p.d));cd.setAttribute("cy",y(p.h));
   let near="";X.pts.forEach((q,i)=>{if(q[2]&&Math.abs(at[i]-p.d)<tot*.04)near=q[2]+" · "});
   v.textContent=near+Math.round(p.h).toLocaleString("en-GB")+" m up · "+Math.round(p.d)+" km along";mapDot(p.ll)};
  hit.addEventListener("pointermove",show);hit.addEventListener("pointerdown",show);hit.addEventListener("pointerleave",()=>{mapDot(null)});
 }).catch(()=>{box.querySelector(".psx-v").textContent="Heights could not load"})}
setInterval(()=>{try{const S=stop();if(!S||!S.xsec){mapDot(null);return}const box=ps.card&&ps.card.querySelector("[data-psx]");if(box&&!box._done)draw(box,S)}catch(e){}},250);
const css=document.createElement("style");css.textContent=`
.psx{ margin:10px 0 4px; padding:10px 12px 8px; border-radius:14px; background:rgba(22,50,79,.05); border:1px solid rgba(22,50,79,.08); }
.psx-h{ display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-size:13px; } .psx-v{ font-size:12px; color:#1f6f9f; font-weight:700; text-align:right; }
.psx-svg{ width:100%; height:auto; display:block; margin-top:4px; touch-action:none; cursor:crosshair; }
.psx-gl{ stroke:rgba(22,50,79,.12); stroke-width:.6; } .psx-yl{ font:600 7.5px system-ui,sans-serif; fill:#6a7383; text-anchor:end; }
.psx-mk{ stroke:#e8701a; stroke-width:1; stroke-dasharray:3 2; } .psx-mkl{ font:700 7.5px system-ui,sans-serif; fill:#c25a10; text-anchor:end; }
.psx-pl line{ stroke:#16324f; stroke-width:.6; stroke-dasharray:2 2; opacity:.55; } .psx-pl circle{ fill:#16324f; } .psx-pl text{ font:700 7.5px system-ui,sans-serif; fill:#16324f; }
.psx-cur{ stroke:#16324f; stroke-width:1; } .psx-cd{ fill:#fff; stroke:#16324f; stroke-width:1.4; }
.psx-n{ display:block; font-size:11.5px; opacity:.7; margin-top:2px; }
.psx-dot{ position:absolute; width:14px; height:14px; margin:-7px 0 0 -7px; border-radius:50%; background:#fff; border:3px solid #e8701a; box-shadow:0 1px 6px rgba(0,0,0,.35); pointer-events:none; z-index:30; }
body.sky-night .psx{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.1); } body.sky-night .psx-pl text, body.sky-night .psx-yl{ fill:#dfe6f5; } body.sky-night .psx-pl line, body.sky-night .psx-cur{ stroke:#dfe6f5; } body.sky-night .psx-pl circle{ fill:#dfe6f5; } body.sky-night .psx-v{ color:#8fd0ff; }`;
document.head.appendChild(css);
})();
