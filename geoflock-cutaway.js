/* GeoFlock: inside the Earth. On the 3D globe a round button cuts a wedge out of the Earth itself: one eighth of it, between
   the equator and the meridian in the middle of the view, to the east of it, north of the equator. It is part of the globe,
   so it turns with it when the globe is dragged. Its flat faces show the layers (the crust drawn thicker than it is, the rest
   to scale); hovering a layer lights it up and names it, clicking it opens its card. */
(function(){
if(typeof GlobeView==="undefined")return;
let on=false,lon0=0,hov=null,sel=null;const RE=6371;
/* name, outer radius km, colours, what it is, depth, temperature, density */
const LAY=[["Inner core",1221,"#fff1a8","#f7c948","solid iron and nickel, squeezed solid by the pressure","5,150–6,371 km","about 5,200 °C","about 13 g/cm³"],
 ["Outer core",3480,"#ffc06a","#f08a24","liquid iron and nickel; its swirling makes the magnetic field","2,890–5,150 km","4,000–5,000 °C","10–12 g/cm³"],
 ["Lower mantle",5711,"#e4693a","#b8401f","hot solid rock under great pressure","660–2,890 km","1,900–3,700 °C","4.4–5.6 g/cm³"],
 ["Upper mantle",6336,"#f08b4c","#d4582c","solid rock that flows very slowly; the plates ride on it","about 35–660 km","500–1,900 °C","3.4–4.0 g/cm³"],
 ["Crust",6371,"#9a6a45","#6e4528","solid rock: granite under the continents, basalt under the oceans","0–70 km (5–70 km thick)","15 °C at the surface to about 900 °C","2.7–3.0 g/cm³"]];
const rOf=i=>LAY[i][0]==="Upper mantle"?.955:LAY[i][0]==="Crust"?1:LAY[i][1]/RE;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),rgb=(c,k)=>"rgb("+c.map(x=>Math.round(Math.max(0,Math.min(255,x*k)))).join(",")+")";
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],LIGHT=(()=>{const v=[-.45,.55,.7],l=Math.hypot(...v);return v.map(x=>x/l)})();
/* a point on the Earth (lon, lat) as a view vector: x right, y up, z towards you */
function vec(p,ll){const r=d3.geoRotation(p.rotate())(ll),la=r[1]*Math.PI/180,lo=r[0]*Math.PI/180;return[Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)]}
let G=null;/* the last drawn geometry, for hovering */
function geom(p){const t=p.translate(),R=p.scale(),N=vec(p,[0,90]),B=vec(p,[lon0,0]),C=vec(p,[lon0+90,0]);
 /* the three faces: the equator's quarter (B,C; faces north), the two meridians' quarters (N,C faces west… N,B faces east) */
 const faces=[{u:B,v:C,n:N},{u:N,v:C,n:B},{u:N,v:B,n:C}].map(f=>({...f,z:(f.u[2]+f.v[2])/2}));
 return{t,R,faces,N,B,C}}
const S=(g,v,r)=>[g.t[0]+g.R*r*v[0],g.t[1]-g.R*r*v[1]];
function facePath(ctx,g,f,r){const o=S(g,[0,0,0],0);ctx.moveTo(o[0],o[1]);for(let a=0;a<=40;a++){const th=a/40*Math.PI/2,q=S(g,f.u.map((x,i)=>x*Math.cos(th)+f.v[i]*Math.sin(th)),r);ctx.lineTo(q[0],q[1])}ctx.closePath()}
function octant(){return{type:"Polygon",coordinates:[[[lon0,0],[lon0,90],[lon0+90,0],[lon0,0]]]}}
function draw(ctx,p){const g=geom(p);G=g;if(!isFinite(g.R)||g.R<30)return;ctx.save();
 /* only where the cut-away piece of the surface was (on the side facing you) can you see in */
 let oct=octant();if(d3.geoArea(oct)>2*Math.PI)oct={type:"Polygon",coordinates:[oct.coordinates[0].slice().reverse()]};
 ctx.beginPath();d3.geoPath(p,ctx)(oct);ctx.clip();
 /* the faces, furthest first */
 g.faces.slice().sort((a,b)=>a.z-b.z).forEach(f=>{const lit=.6+.45*Math.max(0,Math.abs(dot(f.n,LIGHT)));
  for(let i=LAY.length-1;i>=0;i--){const L=LAY[i],r=rOf(i),r0=i?rOf(i-1):0,o=S(g,[0,0,0],0);ctx.beginPath();facePath(ctx,g,f,r);
   const gr=ctx.createRadialGradient(o[0],o[1],g.R*r0,o[0],o[1],g.R*r),k=lit*(hov===i||sel===i?1.18:1);gr.addColorStop(0,rgb(hex(L[2]),k));gr.addColorStop(1,rgb(hex(L[3]),k));ctx.fillStyle=gr;ctx.fill();
   /* a faint dashed line in the middle of each thick layer, as in a textbook cutaway */
   if(i<4&&g.R*(r-r0)>14){ctx.save();ctx.setLineDash([5,6]);ctx.strokeStyle="rgba(255,240,220,.35)";ctx.lineWidth=1.2;ctx.beginPath();for(let a=0;a<=40;a++){const th=a/40*Math.PI/2,q=S(g,f.u.map((x,j)=>x*Math.cos(th)+f.v[j]*Math.sin(th)),(r+r0)/2);a?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke();ctx.restore()}}
  /* the hovered or chosen layer gets a white edge */
  [hov,sel].forEach(i=>{if(i==null)return;ctx.beginPath();facePath(ctx,g,f,rOf(i));ctx.strokeStyle="rgba(255,255,255,.95)";ctx.lineWidth=2;ctx.stroke()})});
 /* the cut's edges */
 ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=1.6;[g.N,g.B,g.C].forEach(a=>{const o=S(g,[0,0,0],0),e=S(g,a,1);ctx.beginPath();ctx.moveTo(o[0],o[1]);ctx.lineTo(e[0],e[1]);ctx.stroke()});
 /* names on the face that faces you most */
 const f=g.faces.slice().sort((a,b)=>b.n[2]-a.n[2])[0];if(f&&f.n[2]>.15){const fs=Math.max(10,Math.min(13,g.R/30));ctx.font="800 "+fs+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";
  LAY.forEach((L,i)=>{const r0=i?rOf(i-1):0,r=rOf(i),rm=L[0]==="Crust"?1.0:i?(r0+r)/2:r*.5,th=Math.PI/4+(i%2?.16:-.16),q=S(g,f.u.map((x,j)=>x*Math.cos(th)+f.v[j]*Math.sin(th)),rm);
   if(L[0]==="Crust")return;ctx.lineWidth=3;ctx.strokeStyle="rgba(40,15,5,.6)";ctx.fillStyle="#fff";ctx.strokeText(L[0],q[0],q[1]);ctx.fillText(L[0],q[0],q[1])})}
 ctx.restore()}
const P=GlobeView.prototype,_dm=P._drawMeasure;P._drawMeasure=function(ctx,p){const r=_dm.apply(this,arguments);try{if(on&&typeof amGlobe!=="undefined"&&this===amGlobe&&!this._flat)draw(ctx,p)}catch(e){console.error(e)}return r};
/* which layer is under the pointer (null if none) */
function layerAt(cx,cy){const g0=amGlobe;if(!on||!G||!g0||g0._flat)return null;const rc=g0.canvas.getBoundingClientRect(),x=(cx-rc.left-G.t[0])/G.R,y=-(cy-rc.top-G.t[1])/G.R;
 /* must be inside the cut (the removed surface, seen from here) */
 try{const p=g0.projection(),ll=p.invert([cx-rc.left,cy-rc.top]);let oct=octant();if(d3.geoArea(oct)>2*Math.PI)oct={type:"Polygon",coordinates:[oct.coordinates[0].slice().reverse()]};if(!ll||!d3.geoContains(oct,ll))return null}catch(e){return null}
 /* the nearest face (to you) that the point lies on: solve x,y = a·u + b·v on each face */
 let best=null;G.faces.forEach(f=>{const det=f.u[0]*f.v[1]-f.u[1]*f.v[0];if(Math.abs(det)<1e-6)return;const a=(x*f.v[1]-y*f.v[0])/det,b=(f.u[0]*y-f.u[1]*x)/det;if(a<0||b<0)return;const r=Math.hypot(a,b);if(r>1)return;
  const z=a*f.u[2]+b*f.v[2];if(!best||z>best.z)best={z,r}});if(!best)return null;for(let i=0;i<LAY.length;i++)if(best.r<=rOf(i)+1e-6)return i;return LAY.length-1}
const tip=document.createElement("div");tip.className="gf-cut-tip";tip.hidden=true;document.body.appendChild(tip);
addEventListener("pointermove",e=>{if(!on)return;const g=amGlobe;if(!g||!g.canvas||e.target!==g.canvas){if(!tip.hidden)tip.hidden=true;return}const i=layerAt(e.clientX,e.clientY);
 if(i!==hov){hov=i;g.request?g.request():g.render()}
 if(i==null){tip.hidden=true;return}
 /* over the cut, the layer's name replaces the map's own hover note */
 e.stopPropagation();try{g.tip.hidden=true;g.hot=null;g.hotWater=null}catch(_){}g.canvas.style.cursor="pointer";
 const L=LAY[i];tip.innerHTML='<b>'+L[0]+'</b><span>'+L[5]+' down</span>';tip.hidden=false;tip.style.left=(e.clientX+14)+"px";tip.style.top=(e.clientY+12)+"px"},true);
addEventListener("click",e=>{if(!on)return;const g=amGlobe;if(!g||e.target!==g.canvas)return;const i=layerAt(e.clientX,e.clientY);if(i==null)return;e.stopPropagation();e.preventDefault();sel=sel===i?null:i;key();g.request?g.request():g.render()},true);
/* the card: every layer, the chosen one opened up with its depth, temperature and density */
function key(){let k=document.querySelector(".gf-cut-key");const g=amGlobe;if(!on||!g||g._flat){if(k)k.remove();tip.hidden=true;return}
 if(!k){k=document.createElement("div");k.className="gf-cut-key";g.host.appendChild(k);
  /* drag it by its title or any empty part of the card */
  k.addEventListener("pointerdown",e=>{if(e.button||e.target.closest("[data-li]"))return;e.preventDefault();e.stopPropagation();const hr=g.host.getBoundingClientRect(),r=k.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;k.classList.add("drag");
   const mv=ev=>{k.style.left=Math.max(-r.width+60,Math.min(hr.width-60,ev.clientX-hr.left-dx))+"px";k.style.top=Math.max(0,Math.min(hr.height-40,ev.clientY-hr.top-dy))+"px"};
   const up=()=>{k.classList.remove("drag");removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true)};addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)});k.addEventListener("click",e=>{const r=e.target.closest("[data-li]");if(!r)return;e.stopPropagation();const i=+r.dataset.li;sel=sel===i?null:i;key();g.request?g.request():g.render()})}
 k.innerHTML='<b class="ck-h">Inside the Earth</b>'+LAY.map((L,i)=>[L,i]).reverse().map(([L,i])=>'<div data-li="'+i+'" class="'+(sel===i?"on":"")+'"><i style="background:linear-gradient('+L[2]+','+L[3]+')"></i><span><b>'+L[0]+'</b> '+L[4]+
  (sel===i?'<dl><dt>Depth</dt><dd>'+L[5]+'</dd><dt>Temperature</dt><dd>'+L[6]+'</dd><dt>Density</dt><dd>'+L[7]+'</dd></dl>':'')+'</span></div>').join("")+
  '<small>Click a layer (here or in the cut) for more. Drag the globe to turn it; the cut turns with it. Nobody has dug deeper than 12 km: we know the inside from how earthquake waves travel through it.</small>'}
const ICO='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M12 12V7.5M12 12h4.5" opacity=".6"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>';
function toggle(g){on=!on;hov=null;sel=null;if(on){/* the cut starts at the meridian in the middle of the view, going east */try{lon0=Math.round(-g.rot[0])}catch(e){lon0=0}}key();try{g.request?g.request():g.render()}catch(_){}}
function sync(){let g;try{g=amGlobe}catch(e){return}if(!g||!g.host)return;const btns=g.host.querySelector(".globe-btns");if(!btns)return;let b=btns.querySelector(".gf-cut");
 if(g._flat||appMode!=="allmaps"){if(b)b.remove();if(on){on=false;key()}return}
 if(!b){b=document.createElement("button");b.type="button";b.className="gf-cut";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();toggle(g)};btns.appendChild(b)}
 b.title=on?"Close the cutaway":"Look inside the Earth: cut a wedge out of the globe";b.classList.toggle("on",on);if(on&&!document.querySelector(".gf-cut-key"))key()}
setInterval(()=>{try{sync()}catch(e){}},400);
const st=document.createElement("style");st.textContent=`
.globe-btns .gf-cut.on{ background:#d4582c !important; color:#fff !important; }
.gf-cut-key{ position:absolute; left:10px; top:118px; z-index:6; width:min(300px,46%); background:rgba(255,253,248,.95); color:#2b2118; border-radius:14px; padding:10px 12px; font:12px/1.35 system-ui,sans-serif; box-shadow:0 6px 18px rgba(0,0,0,.18); }
.gf-cut-key{ cursor:grab; } .gf-cut-key.drag{ cursor:grabbing; user-select:none; } .gf-cut-key .ck-h{ display:block; font-size:14px; margin-bottom:6px; } .gf-cut-key div{ display:flex; gap:8px; align-items:flex-start; margin:2px 0; padding:4px 6px; border-radius:9px; cursor:pointer; }
.gf-cut-key div:hover{ background:rgba(212,88,44,.08); } .gf-cut-key div.on{ background:rgba(212,88,44,.14); }
.gf-cut-key i{ width:14px; height:14px; border-radius:4px; flex:none; margin-top:1px; } .gf-cut-key small{ display:block; opacity:.65; margin-top:6px; }
.gf-cut-key dl{ display:grid; grid-template-columns:auto 1fr; gap:2px 10px; margin:6px 0 2px; } .gf-cut-key dt{ opacity:.65; } .gf-cut-key dd{ margin:0; font-weight:700; }
.gf-cut-tip{ position:fixed; z-index:9000; pointer-events:none; background:#1d2433; color:#fff; border-radius:9px; padding:6px 9px; font:12px/1.3 system-ui,sans-serif; box-shadow:0 6px 16px rgba(0,0,0,.25); }
.gf-cut-tip b{ display:block; font-size:13px; } .gf-cut-tip span{ opacity:.75; } .gf-cut-tip[hidden]{ display:none; }
body.sky-night .gf-cut-key{ background:rgba(29,38,56,.95); color:#e6edf7; }`;document.head.appendChild(st);
})();
