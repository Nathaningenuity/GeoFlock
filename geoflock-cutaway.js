/* GeoFlock: inside the Earth. On the 3D globe a round button cuts a wedge out of the globe, like a textbook cutaway:
   the crust (drawn thicker than it is, or it would be a hairline), upper and lower mantle, the liquid outer core and the
   solid inner core, true to scale otherwise, with labels. The rest of the globe stays as it is (relief, satellite…). */
(function(){
if(typeof GlobeView==="undefined")return;
let on=false;const RE=6371;
/* radius fractions and colours, centre outwards */
const LAY=[["Inner core",1221,"#fff1a8","#f7c948","solid iron and nickel, about 5,200 °C"],["Outer core",3480,"#ffc06a","#f08a24","liquid iron and nickel; its swirling makes the magnetic field"],
 ["Lower mantle",5711,"#e4693a","#b8401f","hot solid rock, 660–2,890 km down"],["Upper mantle",6336,"#f08b4c","#d4582c","solid rock that flows very slowly; the plates ride on it"],["Crust",6371,"#9a6a45","#6e4528","5–70 km thick (drawn thicker here)"]];
/* the cut: one eighth of the Earth taken out, its corner at the centre, opening up and to the right towards you.
   The three flat faces of the cut show the layers as rings; drawn in true 3D (an orthographic view), shaded by the light. */
const nrm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function rotTo(v,d){/* the rotation that turns the view axis (0,0,1) to d, applied to v (Rodrigues) */const z=[0,0,1],k=cross(z,d),s=Math.hypot(...k),c=dot(z,d);if(s<1e-9)return v;const K=k.map(x=>x/s),t=Math.atan2(s,c),ct=Math.cos(t),st=Math.sin(t);
 const kv=cross(K,v),kd=dot(K,v);return v.map((x,i)=>x*ct+kv[i]*st+K[i]*kd*(1-ct))}
const DIR=nrm([.5,.42,.76]),q=Math.sqrt(2/3),AX=[90,210,330].map(a=>rotTo([q*Math.cos(a*Math.PI/180),q*Math.sin(a*Math.PI/180),1/Math.sqrt(3)],DIR));
const LIGHT=nrm([-.45,.55,.7]);
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),rgb=(c,k)=>"rgb("+c.map(x=>Math.round(Math.min(255,x*k))).join(",")+")";
function draw(ctx,p){const t=p.translate(),R=p.scale();if(!isFinite(R)||R<30)return;const cx=t[0],cy=t[1],S=v=>[cx+R*v[0],cy-R*v[1]];
 ctx.save();ctx.lineJoin="round";
 /* the three faces: each lies between two of the axes and faces the third */
 const faces=[[0,1,2],[1,2,0],[2,0,1]].map(([i,j,k])=>({u:AX[i],v:AX[j],n:AX[k]})).filter(f=>f.n[2]>0);
 faces.forEach(f=>{const lit=.62+.45*Math.max(0,dot(f.n,LIGHT));
  for(let li=LAY.length-1;li>=0;li--){const L=LAY[li];let r=L[1]/RE;if(L[0]==="Upper mantle")r=.955;
   ctx.beginPath();const o=S([0,0,0]);ctx.moveTo(o[0],o[1]);for(let a=0;a<=32;a++){const th=a/32*Math.PI/2,pt=S(f.u.map((x,i)=>r*(x*Math.cos(th)+f.v[i]*Math.sin(th))));ctx.lineTo(pt[0],pt[1])}ctx.closePath();
   const g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],R*r);g.addColorStop(0,rgb(hex(L[2]),lit));g.addColorStop(1,rgb(hex(L[3]),lit));ctx.fillStyle=g;ctx.fill()}
  /* the face's rim */
  ctx.beginPath();for(let a=0;a<=32;a++){const th=a/32*Math.PI/2,pt=S(f.u.map((x,i)=>x*Math.cos(th)+f.v[i]*Math.sin(th)));a?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1])}ctx.strokeStyle="rgba(50,25,10,.45)";ctx.lineWidth=1.2;ctx.stroke()});
 /* the three edges of the cut, from the centre out */
 ctx.strokeStyle="rgba(255,235,200,.75)";ctx.lineWidth=1.3;AX.forEach(a=>{const o=S([0,0,0]),e=S(a);ctx.beginPath();ctx.moveTo(o[0],o[1]);ctx.lineTo(e[0],e[1]);ctx.stroke()});
 /* labels on the face that faces you most */
 const f=faces.slice().sort((a,b)=>b.n[2]-a.n[2])[0];if(f){const fs=Math.max(10,Math.min(14,R/26)),W=ctx.canvas.clientWidth||2*cx,H=ctx.canvas.clientHeight||2*cy;ctx.font="800 "+fs+"px system-ui";ctx.textBaseline="middle";ctx.textAlign="center";
  LAY.forEach((L,i)=>{if(L[0]==="Crust")return;const rIn=i?LAY[i-1][1]/RE:0,rOut=L[0]==="Upper mantle"?.955:L[1]/RE,rm=i?(rIn+rOut)/2:rOut*.45,th=Math.PI/4+(i%2?.2:-.2);
   const pt=S(f.u.map((x,k)=>rm*(x*Math.cos(th)+f.v[k]*Math.sin(th)))),tw=ctx.measureText(L[0]).width,x=Math.max(tw/2+6,Math.min(W-tw/2-6,pt[0])),y=Math.max(fs,Math.min(H-fs,pt[1]));
   ctx.lineWidth=3;ctx.strokeStyle="rgba(40,15,5,.6)";ctx.fillStyle="#fff";ctx.strokeText(L[0],x,y);ctx.fillText(L[0],x,y)})}
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
.gf-cut-key{ position:absolute; left:10px; top:118px; z-index:6; width:min(300px,46%); background:rgba(255,253,248,.94); color:#2b2118; border-radius:14px; padding:10px 12px; font:12px/1.35 system-ui,sans-serif; box-shadow:0 6px 18px rgba(0,0,0,.18); }
.gf-cut-key > b{ display:block; font-size:14px; margin-bottom:6px; } .gf-cut-key div{ display:flex; gap:8px; align-items:flex-start; margin:4px 0; }
.gf-cut-key i{ width:14px; height:14px; border-radius:4px; flex:none; margin-top:1px; } .gf-cut-key small{ display:block; opacity:.65; margin-top:6px; }
body.sky-night .gf-cut-key{ background:rgba(29,38,56,.94); color:#e6edf7; }`;document.head.appendChild(st);
})();
