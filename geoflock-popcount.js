/* GeoFlock: Population map › Count people. Click a country or draw your own shape to see how many people live inside it, then split it
   with a line to compare the two parts. People: GHS-POP 2025 (European Commission, JRC; CC BY 4.0) summed over 0.1° cells (about 11 km),
   so small shapes and coasts are approximate. */
(function(){
if(typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mode=()=>{try{return appMode==="allmaps"?allMapsColorMode:null}catch(e){return null}};
const G=()=>{try{return amGlobe&&amGlobe.host.isConnected?amGlobe:null}catch(e){return null}};
/* ---------- the people grid ---------- */
let POP=null,popP=null;const W=3600,H=1800,STEP=.1;
function load(){if(popP)return popP;popP=new Promise((ok,no)=>{const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
  const d=x.getImageData(0,0,W,H).data,a=new Float32Array(W*H);for(let i=0,j=0;i<a.length;i++,j+=4){const v=(d[j]<<8)|d[j+1];a[i]=v?Math.pow(10,v/4096)-1:0}POP=a;ok(a)}catch(e){no(e)}};im.onerror=no;im.src="textures/POP_GRID_0p1.png"});return popP}
/* rings (arrays of [lon,lat]) → which grid cells are inside, drawn onto a small canvas over the shape's box */
function mask(rings){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;rings.forEach(r=>r.forEach(([lo,la])=>{x0=Math.min(x0,lo);x1=Math.max(x1,lo);y0=Math.min(y0,la);y1=Math.max(y1,la)}));
 const c0=Math.max(0,Math.floor((x0+180)/STEP)),c1=Math.min(W-1,Math.ceil((x1+180)/STEP)),r0=Math.max(0,Math.floor((90-y1)/STEP)),r1=Math.min(H-1,Math.ceil((90-y0)/STEP));
 const w=c1-c0+1,h=r1-r0+1;if(w<1||h<1)return null;const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d",{willReadFrequently:true});x.fillStyle="#fff";x.beginPath();
 rings.forEach(r=>r.forEach(([lo,la],i)=>{const px=(lo+180)/STEP-c0,py=(90-la)/STEP-r0;i?x.lineTo(px,py):x.moveTo(px,py)}));x.fill("evenodd");
 const d=x.getImageData(0,0,w,h).data;return{c0,r0,w,h,at:(i,j)=>d[(j*w+i)*4+3]>=128}}
function ringsOf(geom){const out=[];const P=geom.type==="Polygon"?[geom.coordinates]:geom.type==="MultiPolygon"?geom.coordinates:[];P.forEach(poly=>poly.forEach(r=>out.push(r)));return out}
/* count: total, and (with a split line a→b in lon/lat) the two sides */
function count(rings,split){const m=mask(rings);if(!m||!POP)return null;let tot=0,L=0,R=0,lx=0,ly=0,rx=0,ry=0,cx=0,cy=0;
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.at(i,j))continue;const gi=(m.r0+j)*W+(m.c0+i),v=POP[gi];if(!v)continue;const lo=(m.c0+i+.5)*STEP-180,la=90-(m.r0+j+.5)*STEP;tot+=v;cx+=lo*v;cy+=la*v;
  if(split){const s=(split[1][0]-split[0][0])*(la-split[0][1])-(split[1][1]-split[0][1])*(lo-split[0][0]);if(s>0){L+=v;lx+=lo*v;ly+=la*v}else{R+=v;rx+=lo*v;ry+=la*v}}}
 return{tot,c:tot?[cx/tot,cy/tot]:null,L,R,cl:L?[lx/L,ly/L]:null,cr:R?[rx/R,ry/R]:null}}
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+" billion":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" million":n>=1e3?Math.round(n/1e3).toLocaleString()+" thousand":Math.round(n).toLocaleString();
const fmtS=n=>n>=1e9?(n/1e9).toFixed(1)+" bn":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" m":n>=1e3?Math.round(n/1e3)+"k":Math.round(n)+"";
/* ---------- state and UI ---------- */
let on=false,tool="country",shape=null,split=null,res=null,panel=null,ov=null,raf=0,drawing=null;
const css=document.createElement("style");css.textContent=`
.gf-pc-ico{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; color:#b3401f; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }
.gf-pc-ico.on{ background:#c2491f; color:#fff; }
.gf-pc-ov{ position:absolute; left:0; top:0; pointer-events:none; z-index:30; }
.gf-pc{ position:absolute; left:12px; top:60px; width:300px; z-index:41; background:rgba(255,255,255,.97); border-radius:14px; box-shadow:0 6px 24px rgba(0,0,0,.25); padding:10px 12px; font:13px/1.4 system-ui,sans-serif; color:#1d2433; }
body.dark .gf-pc{ background:rgba(28,35,51,.97); color:#e8ecf3; }
.gf-pc-h{ display:flex; align-items:center; gap:6px; cursor:move; margin-bottom:6px; } .gf-pc-h b{ font-size:14px; } .gf-pc-h button{ margin-left:auto; border:0; background:none; font-size:18px; cursor:pointer; color:inherit; opacity:.7; }
.gf-pc-seg{ display:flex; background:#f6e6dc; border-radius:999px; padding:2px; margin-bottom:8px; } .gf-pc-seg button{ flex:1; border:0; background:none; border-radius:999px; padding:5px 6px; font:700 11.5px system-ui; color:#7a2e12; cursor:pointer; } .gf-pc-seg button.on{ background:#c2491f; color:#fff; }
.gf-pc-big{ font-size:22px; font-weight:800; color:#b3401f; margin:4px 0 0; } .gf-pc-sub{ font-size:12px; opacity:.75; margin:0 0 6px; }
.gf-pc-bar{ display:flex; height:22px; border-radius:6px; overflow:hidden; margin:6px 0 4px; font:700 11px system-ui; color:#fff; } .gf-pc-bar span{ display:flex; align-items:center; justify-content:center; white-space:nowrap; overflow:hidden; }
.gf-pc-src{ font-size:10.5px; opacity:.55; margin-top:6px; } .gf-pc-hint{ font-size:12.5px; opacity:.8; margin:4px 0; }
.gf-pc-btn{ border:1px solid #e3c9bb; background:#fff; border-radius:999px; padding:4px 10px; font:700 12px system-ui; cursor:pointer; color:#7a2e12; margin:4px 4px 0 0; }`;document.head.appendChild(css);
const ICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/></svg>';
function icon(){const g=G(),btns=g&&g.host.querySelector(".globe-btns");let b=btns&&btns.querySelector(".gf-pc-ico");const want=mode()==="population"&&!document.querySelector(".gf-owid");
 if(!want){if(b)b.remove();if(on)stop();return}if(!btns)return;if(!b){b=document.createElement("button");b.type="button";b.className="gf-pc-ico";b.title="Count people: click a country or draw a shape";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();on?stop():start()};btns.appendChild(b)}b.classList.toggle("on",on)}
function start(){const g=G();if(!g)return;on=true;mount();render();load().then(render).catch(()=>{});loop()}
function stop(){on=false;shape=split=res=null;drawing=null;if(panel){panel.remove();panel=null}if(ov){ov.remove();ov=null}cancelAnimationFrame(raf)}
function mount(){const g=G();if(!g)return;const h=g.host;if(getComputedStyle(h).position==="static")h.style.position="relative";
 if(!ov||ov.parentNode!==h){ov=document.createElement("canvas");ov.className="gf-pc-ov";h.appendChild(ov)}
 if(!panel||panel.parentNode!==h){panel=document.createElement("div");panel.className="gf-pc";h.appendChild(panel);
  panel.addEventListener("pointerdown",e=>{if(!e.target.closest(".gf-pc-h")||e.target.closest("button"))return;e.preventDefault();e.stopPropagation();const hr=h.getBoundingClientRect(),r=panel.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;
   const mv=ev=>{panel.style.left=Math.max(-200,Math.min(hr.width-80,ev.clientX-hr.left-dx))+"px";panel.style.top=Math.max(0,Math.min(hr.height-40,ev.clientY-hr.top-dy))+"px"};const up=()=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true)};addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)},true);
  ["pointerdown","click","wheel","dblclick"].forEach(t=>panel.addEventListener(t,e=>e.stopPropagation()))}}
function render(){if(!panel)return;const T=[["country","Click a country"],["draw","Draw a shape"],["split","Split it"]];
 let body="";if(!POP)body='<p class="gf-pc-hint">Loading the people grid…</p>';
 else if(res&&res.tot!=null){body='<p class="gf-pc-big">'+fmt(res.tot)+' people</p><p class="gf-pc-sub">'+esc(shape&&shape.name?"live in "+shape.name:"live inside your shape")+(shape&&shape.km2?", about "+Math.round(shape.km2).toLocaleString()+" km² ("+Math.round(res.tot/shape.km2).toLocaleString()+" per km²)":"")+'</p>';
  if(split&&res.L+res.R>0){const pl=res.L/(res.L+res.R)*100;body+='<div class="gf-pc-bar"><span style="width:'+pl+'%;background:#2f6fb0">'+(pl>18?fmtS(res.L)+" · "+Math.round(pl)+"%":"")+'</span><span style="width:'+(100-pl)+'%;background:#e07b2e">'+(100-pl>18?fmtS(res.R)+" · "+Math.round(100-pl)+"%":"")+'</span></div><p class="gf-pc-sub">Blue side: '+fmt(res.L)+' · orange side: '+fmt(res.R)+'</p>'}
  else body+='<p class="gf-pc-hint">'+(tool==="split"?"Now drag a straight line across it to cut it in two.":"Press “Split it” to cut it with a line and compare the two parts.")+'</p>'}
 else body='<p class="gf-pc-hint">'+(tool==="country"?"Click any country on the map.":tool==="draw"?"Drag on the map to draw round an area; let go to close the shape.":"Pick a country or draw a shape first.")+'</p>';
 panel.innerHTML='<div class="gf-pc-h"><b>👥 Count people</b><button type="button" title="Close">×</button></div><div class="gf-pc-seg">'+T.map(([k,l])=>'<button type="button" data-t="'+k+'" class="'+(tool===k?"on":"")+'">'+l+'</button>').join("")+'</div>'+body+
  (shape?'<button type="button" class="gf-pc-btn" data-clear>Start again</button>':'')+'<div class="gf-pc-src">People: GHS-POP 2025 (European Commission JRC, CC BY 4.0), counted in cells about 11 km across, so small shapes and coastlines are approximate.</div>';
 panel.querySelector(".gf-pc-h button").onclick=stop;
 panel.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{tool=b.dataset.t;if(tool!=="split")split=null;if(tool==="draw"){shape=null;res=null}recount();render()});
 const c=panel.querySelector("[data-clear]");if(c)c.onclick=()=>{shape=split=res=null;tool="country";render()}}
function recount(){if(!shape||!POP){res=null;return}res=count(shape.rings,split)}
/* ---------- the map: clicks and drawing ---------- */
function local(e){const g=G(),r=g.canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
const inUI=e=>e.target.closest&&e.target.closest(".gf-pc,.globe-btns,.gfk-tray,.gfk-panel,button,a,input,select");
function down(e){if(!on||inUI(e))return;const g=G();if(!g||!g.host.contains(e.target))return;
 if(tool==="country"){drawing={k:"click",x:e.clientX,y:e.clientY,id:e.pointerId};return}
 if(tool==="draw"||(tool==="split"&&shape)){e.stopImmediatePropagation();e.preventDefault();drawing={k:tool,pts:[local(e)],id:e.pointerId}}}
function move(e){if(!drawing||e.pointerId!==drawing.id||drawing.k==="click")return;e.stopImmediatePropagation();e.preventDefault();const p=local(e);
 if(drawing.k==="split")drawing.pts=[drawing.pts[0],p];else{const l=drawing.pts[drawing.pts.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>4)drawing.pts.push(p)}}
function up(e){if(!drawing||e.pointerId!==drawing.id)return;const D=drawing;drawing=null;const g=G();if(!g)return;const inv=g.projection().invert;
 if(D.k==="click"){if(Math.hypot(e.clientX-D.x,e.clientY-D.y)>5)return;const h=g.hit(e.clientX,e.clientY);const code=h&&h.code;if(!code)return;e.stopImmediatePropagation();e.preventDefault();suppress();
  let rings=[];try{projFeatures().filter(f=>f.geometry&&String(f.properties.c).toLowerCase()===code).forEach(f=>rings=rings.concat(ringsOf(f.geometry)))}catch(_){}if(!rings.length)return;
  const C=(typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[code])||{};let km2=null;try{km2=COUNTRY_AREA_KM2[code]||null}catch(_){}
  shape={rings,name:C.n||code.toUpperCase(),km2,geo:true};split=null;tool="country";load().then(()=>{recount();render()});render();return}
 e.stopImmediatePropagation();e.preventDefault();suppress();
 if(D.k==="split"){if(D.pts.length<2||Math.hypot(D.pts[1][0]-D.pts[0][0],D.pts[1][1]-D.pts[0][1])<10)return;const a=inv(D.pts[0]),b=inv(D.pts[1]);if(!a||!b)return;split=[a,b];recount();render();return}
 if(D.pts.length<6)return;const ring=D.pts.map(p=>inv(p)).filter(q=>q&&isFinite(q[0]));if(ring.length<4)return;ring.push(ring[0]);
 let km2=0;try{let A=d3.geoArea({type:"Polygon",coordinates:[ring]});if(A>2*Math.PI)A=4*Math.PI-A;km2=A*6371*6371}catch(_){}
 shape={rings:[ring],name:null,km2};split=null;tool="split";load().then(()=>{recount();render()});render()}
let eatUntil=0;function suppress(){eatUntil=Date.now()+500}
if(!window._gfPcL){window._gfPcL=1;addEventListener("pointerdown",down,true);addEventListener("pointermove",move,true);addEventListener("pointerup",up,true);
 addEventListener("click",e=>{if(on&&Date.now()<eatUntil){e.stopImmediatePropagation();e.preventDefault()}},true)}
/* ---------- drawing the shape, the split and the labels over the map ---------- */
function loop(){cancelAnimationFrame(raf);if(!on)return;raf=requestAnimationFrame(loop);const g=G();if(!g||!ov)return;const c=g.canvas,r=c.getBoundingClientRect(),hr=g.host.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 if(ov.width!==Math.round(r.width*dpr)||ov.height!==Math.round(r.height*dpr)){ov.width=Math.round(r.width*dpr);ov.height=Math.round(r.height*dpr);ov.style.width=r.width+"px";ov.style.height=r.height+"px"}
 ov.style.left=(r.left-hr.left)+"px";ov.style.top=(r.top-hr.top)+"px";const x=ov.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);const pr=g.projection(),path=d3.geoPath(pr,x);
 if(shape){x.beginPath();shape.rings.forEach(R=>{let pen=false,last=null;R.forEach(ll=>{const q=pr(ll);if(!q||!isFinite(q[0])){pen=false;return}if(pen&&last&&Math.abs(q[0]-last[0])>r.width/2)pen=false;pen?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);pen=true;last=q})});
  x.fillStyle="rgba(194,73,31,.12)";x.fill("evenodd");x.lineJoin="round";x.strokeStyle="#fff";x.lineWidth=4.5;x.stroke();x.strokeStyle="#c2491f";x.lineWidth=2.2;x.stroke()}
 const seg=(a,b,col)=>{const q1=pr(a),q2=pr(b);if(!q1||!q2)return;x.setLineDash([8,6]);x.strokeStyle="#fff";x.lineWidth=5;x.beginPath();x.moveTo(q1[0],q1[1]);x.lineTo(q2[0],q2[1]);x.stroke();x.strokeStyle=col;x.lineWidth=2.5;x.stroke();x.setLineDash([])};
 if(split)seg(split[0],split[1],"#1d2433");
 if(drawing&&drawing.pts){x.strokeStyle="#c2491f";x.lineWidth=2.5;x.setLineDash(drawing.k==="split"?[8,6]:[]);x.beginPath();drawing.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.setLineDash([])}
 const tagXY=(X,Y,t,col)=>{x.font="800 13px system-ui";x.textAlign="center";x.textBaseline="middle";const w=x.measureText(t).width+14;x.fillStyle=col;x.beginPath();x.roundRect?x.roundRect(X-w/2,Y-12,w,24,12):x.rect(X-w/2,Y-12,w,24);x.fill();x.fillStyle="#fff";x.fillText(t,X,Y+1)};
 const tag=(ll,t,col)=>{const q=pr(ll);if(!q)return;x.font="800 13px system-ui";x.textAlign="center";x.textBaseline="middle";const w=x.measureText(t).width+14;x.fillStyle=col;x.beginPath();x.roundRect?x.roundRect(q[0]-w/2,q[1]-12,w,24,12):x.rect(q[0]-w/2,q[1]-12,w,24);x.fill();x.fillStyle="#fff";x.fillText(t,q[0],q[1]+1)};
 if(res&&split&&res.cl&&res.cr){/* each label pushed off the cut line, towards its own side */const s1=pr(split[0]),s2=pr(split[1]),ql=pr(res.cl),qr=pr(res.cr);
  if(s1&&s2&&ql&&qr){let nx=-(s2[1]-s1[1]),ny=s2[0]-s1[0];const n=Math.hypot(nx,ny)||1;nx/=n;ny/=n;const side=q=>Math.sign((q[0]-s1[0])*nx+(q[1]-s1[1])*ny)||1;
   const put=(q,t,col)=>{const sd=side(q),d=(q[0]-s1[0])*nx+(q[1]-s1[1])*ny,push=Math.max(0,22-Math.abs(d));tagXY(q[0]+nx*sd*push,q[1]+ny*sd*push,t,col)};put(ql,fmtS(res.L),"#2f6fb0");put(qr,fmtS(res.R),"#e07b2e")}}else if(res&&res.c)tag(res.c,fmtS(res.tot)+" people","#c2491f")}
window.gfPopCount={start,stop,load,count};
setInterval(()=>{try{icon();if(on)mount()}catch(e){}},400);
})();
