/* GeoFlock: inside the Earth. On the 3D globe a round button cuts a wedge out of the globe, like a textbook cutaway:
   the crust (drawn thicker than it is, or it would be a hairline), upper and lower mantle, the liquid outer core and the
   solid inner core, true to scale otherwise, with labels. The rest of the globe stays as it is (relief, satellite…). */
(function(){
if(typeof GlobeView==="undefined")return;
let on=false;const RE=6371;
/* radius fractions and colours, centre outwards */
const LAY=[["Inner core",1221,"#fff1a8","#f7c948","solid iron and nickel, about 5,200 °C"],["Outer core",3480,"#ffc06a","#f08a24","liquid iron and nickel; its swirling makes the magnetic field"],
 ["Lower mantle",5711,"#e4693a","#b8401f","hot solid rock, 660–2,890 km down"],["Upper mantle",6336,"#f08b4c","#d4582c","solid rock that flows very slowly; the plates ride on it"],["Crust",6371,"#9a6a45","#6e4528","5–70 km thick (drawn thicker here)"]];
function draw(ctx,p){const t=p.translate(),R=p.scale();if(!isFinite(R)||R<30)return;const cx=t[0],cy=t[1],a0=-Math.PI/2,a1=0;
 ctx.save();
 /* the wedge's two cut faces: a lighter one and a shaded one, each with the layers as rings */
 const face=(b0,b1,k)=>{ctx.save();ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R+.5,b0,b1);ctx.closePath();ctx.clip();
  for(let i=LAY.length-1;i>=0;i--){const L=LAY[i];let r=L[1]/RE*R;if(L[0]==="Upper mantle")r=R*.955;if(L[0]==="Crust")r=R+.5;const r0=i?(LAY[i-1][1]/RE*R):0;
   const g=ctx.createRadialGradient(cx,cy,Math.max(0,r0),cx,cy,r);g.addColorStop(0,L[2]);g.addColorStop(1,L[3]);ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill()}
  ctx.fillStyle="rgba(0,0,0,"+k+")";ctx.fillRect(cx-R-2,cy-R-2,2*R+4,2*R+4);ctx.restore()};
 face(a0,(a0+a1)/2,0);face((a0+a1)/2,a1,.16);
 /* the edges of the cut */
 ctx.strokeStyle="rgba(60,25,10,.55)";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy);ctx.lineTo(cx+R,cy);ctx.stroke();
 ctx.strokeStyle="rgba(255,240,210,.5)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(-Math.PI/4),cy+R*Math.sin(-Math.PI/4));ctx.stroke();
 /* labels, each on its layer along the diagonal */
 const fs=Math.max(10,Math.min(14,R/26));ctx.font="800 "+fs+"px system-ui";ctx.textBaseline="middle";
 LAY.forEach((L,i)=>{const rIn=i?LAY[i-1][1]/RE*R:0;let rOut=L[1]/RE*R;if(L[0]==="Upper mantle")rOut=R*.955;if(L[0]==="Crust")return;const rm=(rIn+rOut)/2,ang=-Math.PI/4+(i%2?.12:-.12),W=ctx.canvas.clientWidth||2*cx,H=ctx.canvas.clientHeight||2*cy,tw=ctx.measureText(L[0]).width;
  const x=Math.max(tw/2+6,Math.min(W-tw/2-6,cx+rm*Math.cos(ang))),y=Math.max(fs,Math.min(H-fs,cy+rm*Math.sin(ang)));
  ctx.lineWidth=3;ctx.strokeStyle="rgba(40,15,5,.55)";ctx.fillStyle="#fff";ctx.textAlign="center";ctx.strokeText(L[0],x,y);ctx.fillText(L[0],x,y)});
 /* the crust gets a pointer from outside */
 {const W=ctx.canvas.clientWidth||2*cx,H=ctx.canvas.clientHeight||2*cy;let ang=-Math.PI*.12,x0=cx+R*Math.cos(ang),y0=cy+R*Math.sin(ang);
  /* if the globe is bigger than the view, point at the crust where the cut's lower edge meets the view instead */
  if(x0>W-60||y0<10){x0=Math.min(cx+R,W-50);y0=cy;ang=0}
  const x1=Math.min(W-52,x0+R*.12),y1=Math.max(fs,y0-R*.1);ctx.strokeStyle="#5b3a17";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
  ctx.textAlign="left";ctx.lineWidth=3;ctx.strokeStyle="#fff";ctx.fillStyle="#5b3a17";ctx.strokeText("Crust",x1+4,y1);ctx.fillText("Crust",x1+4,y1)}
 ctx.restore()}
const P=GlobeView.prototype,_dm=P._drawMeasure;P._drawMeasure=function(ctx,p){const r=_dm.apply(this,arguments);try{if(on&&typeof amGlobe!=="undefined"&&this===amGlobe&&!this._flat)draw(ctx,p)}catch(e){console.error(e)}return r};
/* the key under the button: what each layer is */
function key(){let k=document.querySelector(".gf-cut-key");const g=amGlobe;if(!on||!g||g._flat){if(k)k.remove();return}
 if(!k){k=document.createElement("div");k.className="gf-cut-key";k.innerHTML='<b>Inside the Earth</b>'+LAY.slice().reverse().map(L=>'<div><i style="background:linear-gradient('+L[2]+','+L[3]+')"></i><span><b>'+L[0]+'</b> '+L[4]+'</span></div>').join("")+'<small>Distances from the surface to the centre: 6,371 km. Nobody has dug deeper than 12 km; we know the inside from how earthquake waves travel through it.</small>';g.host.appendChild(k)}}
const ICO='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M12 12V7.5M12 12h4.5" opacity=".6"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>';
function sync(){let g;try{g=amGlobe}catch(e){return}if(!g||!g.host)return;const btns=g.host.querySelector(".globe-btns");if(!btns)return;let b=btns.querySelector(".gf-cut");
 if(g._flat||appMode!=="allmaps"){if(b)b.remove();if(on){on=false;key()}return}
 if(!b){b=document.createElement("button");b.type="button";b.className="gf-cut";b.innerHTML=ICO;b.onclick=e=>{e.stopPropagation();on=!on;b.classList.toggle("on",on);key();try{g.request?g.request():g.render()}catch(_){}};btns.appendChild(b)}
 b.title=on?"Close the cutaway":"Look inside the Earth: cut a wedge out of the globe";b.classList.toggle("on",on);key()}
setInterval(()=>{try{sync()}catch(e){}},400);
const st=document.createElement("style");st.textContent=`
.globe-btns .gf-cut.on{ background:#d4582c !important; color:#fff !important; }
.gf-cut-key{ position:absolute; left:10px; top:64px; z-index:6; width:min(300px,46%); background:rgba(255,253,248,.94); color:#2b2118; border-radius:14px; padding:10px 12px; font:12px/1.35 system-ui,sans-serif; box-shadow:0 6px 18px rgba(0,0,0,.18); }
.gf-cut-key > b{ display:block; font-size:14px; margin-bottom:6px; } .gf-cut-key div{ display:flex; gap:8px; align-items:flex-start; margin:4px 0; }
.gf-cut-key i{ width:14px; height:14px; border-radius:4px; flex:none; margin-top:1px; } .gf-cut-key small{ display:block; opacity:.65; margin-top:6px; }
body.sky-night .gf-cut-key{ background:rgba(29,38,56,.94); color:#e6edf7; }`;document.head.appendChild(st);
})();
