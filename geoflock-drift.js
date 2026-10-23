/* GeoFlock: continental drift from 750 million years ago to today, drawn on the GPU.
   Plate motions: C. R. Scotese, PALEOMAP Project plate model (rotations sampled every 5 million years and blended in between).
   The relief texture is cut into 0.5° cells; each cell rides on its tectonic plate, so the landscape moves smoothly as the slider moves.
   Landscapes are today's, carried back in time; ancient coastlines and mountains differed. */
(function(){
const DEG=Math.PI/180;
let G=null,loading=null;
const STAGES=[[750,"Rodinia, the supercontinent before Pangaea, is breaking apart"],[640,"Snowball Earth: ice may have reached the equator"],[560,"Gondwana assembles in the south"],[500,"Life explodes in the seas; Gondwana sits over the South Pole"],[420,"Plants and animals begin to move onto land"],[330,"The continents crash together, building the Appalachians"],[250,"Pangaea: one supercontinent, ringed by one ocean, Panthalassa"],[200,"Pangaea starts to split; dinosaurs can walk to every continent"],[150,"The Atlantic opens between Africa and North America"],[100,"Gondwana breaks up: South America leaves Africa"],[66,"An asteroid ends the dinosaurs; India races north"],[45,"India hits Asia and pushes up the Himalaya"],[0,"Today"]];
function stage(t){return STAGES.find(s=>t>=s[0]-(s[0]>100?40:12))||STAGES[STAGES.length-1]}
const NAME={na:"North America",sa:"South America",af:"Africa",eu:"Eurasia",in:"India",au:"Australia",an:"Antarctica"},SHORT={na:"N. America",sa:"S. America",af:"Africa",eu:"Eurasia",in:"India",au:"Australia",an:"Antarctica"};
const VS=`#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
layout(location=1) in vec4 aCell;
uniform highp sampler2D uQ;
uniform float uRes,uT,uLon0,uOff;
uniform vec3 uK;
uniform vec2 uSize;
out vec2 vUV; out float vL; out float vFade; out float vLat;
const float PI=3.14159265359;
vec3 sph(vec2 d){vec2 r=radians(d);return vec3(cos(r.y)*cos(r.x),cos(r.y)*sin(r.x),sin(r.y));}
vec3 qr(vec4 q,vec3 v){vec3 t=2.0*cross(q.yzw,v);return v+q.x*t+cross(q.yzw,t);}
float wr(float a){return a-2.0*PI*floor((a+PI)/(2.0*PI));}
void main(){
 vFade=clamp(1.0-(uT-aCell.w)/15.0,0.0,1.0);
 if(vFade<=0.0){gl_Position=vec4(2.,2.,2.,1.);return;}
 vec2 cc=aCell.xy+vec2(0.5,-0.5)*uRes;
 vec2 tl=aCell.xy+vec2(aCorner.x,-aCorner.y)*uRes;
 /* grow each cell by 6% around its centre so neighbouring cells on different plates don't show hairline cracks */
 vec2 ll=cc+(tl-cc)*1.06;
 vUV=vec2((ll.x+180.0)/360.0,(90.0-ll.y)/180.0);
 vec4 q=texelFetch(uQ,ivec2(int(aCell.z+0.5),0),0);
 vec3 v=qr(q,sph(ll)),c=qr(q,sph(cc));
 float lon=atan(v.y,v.x),lat=asin(clamp(v.z,-1.0,1.0));vLat=degrees(lat);
 float cr=atan(c.y,c.x),cl=wr(cr+uLon0);
 if(uOff!=0.0&&abs(cl)<PI-0.15){gl_Position=vec4(2.,2.,2.,1.);return;}
 float L=cl+wr(lon-cr)+uOff;
 vL=L;
 float M=0.8660254,l=asin(M*sin(lat)),l2=l*l,l6=l2*l2*l2;
 float x=L*cos(l)/(M*(1.340264+3.0*-0.081106*l2+l6*(7.0*0.000893+9.0*0.003796*l2)));
 float y=l*(1.340264-0.081106*l2+l6*(0.000893+0.003796*l2));
 vec2 px=vec2(uK.y+uK.x*x,uK.z-uK.x*y);
 gl_Position=vec4(px.x/uSize.x*2.0-1.0,1.0-px.y/uSize.y*2.0,0.0,1.0);
}`;
const FS=`#version 300 es
precision mediump float;
in vec2 vUV; in float vL; in float vFade; in float vLat;
uniform sampler2D uW,uE;
out vec4 o;
void main(){
 if(abs(vL)>3.14159265)discard;
 vec4 cw=texture(uW,vec2(vUV.x*2.0,vUV.y)),ce=texture(uE,vec2(vUV.x*2.0-1.0,vUV.y));
 vec3 c=(vUV.x<0.5?cw:ce).rgb*255.0;
 float L=(c.r+c.g+c.b)/3.0;
 bool blue=c.b>c.r+18.0&&c.b>c.g-6.0;
 float a=(blue?smoothstep(150.0,172.0,L):1.0)*vFade;
 if(a<0.01)discard;
 vec3 col=c/255.0;
 /* today's ice sheets and snow: carried towards the equator they become bare highland instead of staying white */
 float ice=smoothstep(0.80,0.93,min(col.r,min(col.g,col.b)))*(blue?0.0:1.0);
 float warm=1.0-smoothstep(50.0,68.0,abs(vLat));
 col=mix(col,vec3(0.70,0.62,0.50)*(0.85+0.25*L/255.0),ice*warm);
 /* continental shelves read as shallow, sunlit sea */
 if(blue)col=mix(col,vec3(0.36,0.70,0.78),0.45);
 o=vec4(col*a,a);
}`;
function bitmap(url,raw){return fetch(url).then(r=>{if(!r.ok)throw new Error(url+" "+r.status);return r.blob()}).then(b=>createImageBitmap(b,raw?{premultiplyAlpha:"none",colorSpaceConversion:"none"}:{}))}
const frame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
function sh(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
function tex(gl,img,mip){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
 if(mip){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
function load(progress){if(G)return Promise.resolve(G);if(loading)return loading;
 const say=s=>{try{progress&&progress(s)}catch(e){}};
 loading=(async()=>{
  const cv=document.createElement("canvas"),gl=cv.getContext("webgl2",{premultipliedAlpha:true,alpha:true,antialias:true});
  if(!gl)throw new Error("nogl");
  say("Loading plate motions…");
  const [meta,bin,cells]=await Promise.all([fetch("geoflock-drift.json").then(r=>r.json()),fetch("geoflock-drift.bin").then(r=>r.arrayBuffer()),bitmap("geoflock-drift.png",true)]);
  say("Loading the relief map…");
  const [tw,te]=await Promise.all([bitmap("textures/GLOBE_RELIEF_W.webp"),bitmap("textures/GLOBE_RELIEF_E.webp")]);
  say("Preparing the plates…");await frame();
  const c2=document.createElement("canvas");c2.width=cells.width;c2.height=cells.height;const x2=c2.getContext("2d",{willReadFrequently:true});x2.drawImage(cells,0,0);const px=x2.getImageData(0,0,cells.width,cells.height).data;
  const NX=cells.width,NY=cells.height,res=meta.res,inst=[];
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const k=(j*NX+i)*4,p=px[k];if(p===255)continue;const b=px[k+1];inst.push(-180+i*res,90-j*res,p,b>=255?1e5:b*5)}
  /* how far back each continent's anchor cell goes, so its name is only shown while there is land under it */
  const AB={};for(const kk in meta.anchors){const A=meta.anchors[kk],i=Math.max(0,Math.min(NX-1,Math.round((A[0]+180)/res))),j=Math.max(0,Math.min(NY-1,Math.round((90-A[1])/res))),k=(j*NX+i)*4;AB[kk]=px[k]===255?-1:px[k+1]>=255?1e5:px[k+1]*5}
  const prog=gl.createProgram();gl.attachShader(prog,sh(gl,gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inst),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,0,0);gl.vertexAttribDivisor(1,1);
  const eb=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,eb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  await frame();const TW=tex(gl,tw,true);await frame();const TE=tex(gl,te,true);await frame();
  const P=meta.plates,QT=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,QT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,P,1,0,gl.RGBA,gl.FLOAT,null);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  const U={};["uQ","uRes","uT","uLon0","uOff","uK","uSize","uW","uE"].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
  G={cv,gl,prog,vao,n:inst.length/4,meta,AB,NX,NY,PX:px.filter((_,k)=>k%4<2),Q:new Int16Array(bin),P,QT,TW,TE,U,qf:new Float32Array(P*4)};
  return G})();
 loading.catch(()=>{loading=null});return loading}
/* plate p's rotation at t million years ago, blended between the stored 5-million-year steps */
function quat(p,t,out,o){const m=G.meta,S=m.max/m.step+1,f=Math.max(0,Math.min(m.max,t))/m.step,i=Math.min(S-2,Math.floor(f)),u=f-i,b=(p*S+i)*4,Q=G.Q;
 let w=Q[b]*(1-u)+Q[b+4]*u,x=Q[b+1]*(1-u)+Q[b+5]*u,y=Q[b+2]*(1-u)+Q[b+6]*u,z=Q[b+3]*(1-u)+Q[b+7]*u;const n=Math.hypot(w,x,y,z)||1;
 out[o]=w/n;out[o+1]=x/n;out[o+2]=y/n;out[o+3]=z/n}
function turnPt(q,lo,la){const v=[Math.cos(la*DEG)*Math.cos(lo*DEG),Math.cos(la*DEG)*Math.sin(lo*DEG),Math.sin(la*DEG)];const w=q[0],x=q[1],y=q[2],z=q[3];
 const t=[2*(y*v[2]-z*v[1]),2*(z*v[0]-x*v[2]),2*(x*v[1]-y*v[0])];const r=[v[0]+w*t[0]+(y*t[2]-z*t[1]),v[1]+w*t[1]+(z*t[0]-x*t[2]),v[2]+w*t[2]+(x*t[1]-y*t[0])];
 return[Math.atan2(r[1],r[0])/DEG,Math.asin(Math.max(-1,Math.min(1,r[2])))/DEG]}
/* draw the world at t (million years ago) into a 2D canvas; lon0 turns the map */
function draw(target,t,lon0,o){if(!G)return false;o=o||{};const dpr=Math.min(2,window.devicePixelRatio||1),W=Math.max(1,Math.round(target.clientWidth*dpr)),H=Math.max(1,Math.round(target.clientHeight*dpr));
 if(target.width!==W)target.width=W;if(target.height!==H)target.height=H;
 const m=(o.margin||8)*dpr,lf=(o.left||0)*dpr,p=d3.geoEqualEarth().rotate([lon0,0]).fitExtent([[m+lf,m],[W-m,H-m]],{type:"Sphere"}),k=p.scale(),tr=p.translate();
 const ctx=target.getContext("2d"),path=d3.geoPath(p,ctx);ctx.clearRect(0,0,W,H);
 const sea=ctx.createRadialGradient(W/2,H*.42,0,W/2,H*.45,W*.62);sea.addColorStop(0,o.sea0||"#2a6aa5");sea.addColorStop(.6,"#1d5289");sea.addColorStop(1,o.sea1||"#123a64");
 ctx.beginPath();path({type:"Sphere"});ctx.fillStyle=sea;ctx.fill();
 ctx.beginPath();path(d3.geoGraticule().step([30,30])());ctx.strokeStyle="rgba(255,255,255,.10)";ctx.lineWidth=dpr;ctx.stroke();
 const gl=G.gl,U=G.U;if(G.cv.width!==W)G.cv.width=W;if(G.cv.height!==H)G.cv.height=H;
 for(let i=0;i<G.P;i++)quat(i,t,G.qf,i*4);
 gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 gl.useProgram(G.prog);gl.bindVertexArray(G.vao);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G.QT);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,G.P,1,gl.RGBA,gl.FLOAT,G.qf);gl.uniform1i(U.uQ,0);
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,G.TW);gl.uniform1i(U.uW,1);
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,G.TE);gl.uniform1i(U.uE,2);
 gl.uniform1f(U.uRes,G.meta.res);gl.uniform1f(U.uT,t);gl.uniform1f(U.uLon0,lon0*DEG);gl.uniform3f(U.uK,k,tr[0],tr[1]);gl.uniform2f(U.uSize,W,H);
 for(const off of [0,2*Math.PI,-2*Math.PI]){gl.uniform1f(U.uOff,off);gl.drawElementsInstanced(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0,G.n)}
 gl.bindVertexArray(null);
 ctx.save();if(!o.noShadow&&!G.noShadow)ctx.filter="drop-shadow(0 0 "+(1.2*dpr).toFixed(1)+"px rgba(8,22,40,.85)) drop-shadow(0 "+(1.5*dpr).toFixed(1)+"px "+(3*dpr).toFixed(1)+"px rgba(0,0,0,.25))";ctx.drawImage(G.cv,0,0);ctx.restore();
 ctx.beginPath();path({type:"Sphere"});ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=dpr;ctx.stroke();
 if(o.labels!==false){const fs=Math.round((o.fs||Math.max(10,Math.min(15,W/dpr/70)))*dpr);ctx.font="800 "+fs+"px system-ui,-apple-system,'Segoe UI',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
  /* where each of today's continents is at time t, as unit vectors */
  const q=[0,0,0,0],V={};for(const kk in G.meta.anchors){const a=G.meta.anchors[kk];if(a[2]<0)continue;quat(a[2],t,q,0);V[kk]=turnPt(q,a[0],a[1])}
  /* the supercontinent of the age, named at the middle of its pieces */
  const SUPER=t>=650?[["Rodinia",["na","sa","af","eu","in","au","an"]]]:t>335?[["Gondwana",["sa","af","in","au","an"]]]:t>=175?[["Pangaea",["na","sa","af","eu","in","au","an"]]]:t>=130?[["Laurasia",["na","eu"]],["Gondwana",["sa","af","in","au","an"]]]:[];
  const old=SUPER.length>0;
  const mid=(ks,anti)=>{let x=0,y=0,z=0;ks.forEach(k=>{const v=V[k];if(!v)return;const c=Math.cos(v[1]*DEG);x+=c*Math.cos(v[0]*DEG);y+=c*Math.sin(v[0]*DEG);z+=Math.sin(v[1]*DEG)});if(anti){x=-x;y=-y;z=-z}return[Math.atan2(y,x)/DEG,Math.atan2(z,Math.hypot(x,y))/DEG]};
  /* keep a label of width w inside the map */
  const inside=(xy,w)=>[Math.max(m+w/2+4*dpr,Math.min(W-m-w/2-4*dpr,xy[0])),Math.max(m+fs,Math.min(H-m-fs,xy[1]))];
  /* oceans: in deep time placed between the moving continents rather than at fixed spots */
  if(o.oceans!==false){const ALL=["na","sa","af","eu","in","au","an"];
   /* the superocean's name goes at the open-sea spot in view that is farthest from every continent */
   const far=()=>{let best=null,bs=-1;for(let cl=-135;cl<=135;cl+=15)for(let la=-30;la<=30;la+=15){const lo=cl-lon0;let mn=9;for(const k in V){const v=V[k];const d=Math.acos(Math.max(-1,Math.min(1,Math.sin(la*DEG)*Math.sin(v[1]*DEG)+Math.cos(la*DEG)*Math.cos(v[1]*DEG)*Math.cos((lo-v[0])*DEG))));if(d<mn)mn=d}if(mn>bs){bs=mn;best=[lo,la]}}return best};
   const OC=t>=650?[["Mirovia",far()]]:t>=560?[["Panthalassa",far()]]:t>=420?[["Panthalassa",far()],["Iapetus Ocean",mid(["na","eu"])]]:t>=130?[["Panthalassa",far()],["Tethys Ocean",mid(["eu","au"])]]:t>=60?[["Pacific Ocean",[-150,0]],["Tethys Ocean",mid(["eu","in"])],["Atlantic",mid(["na","eu","sa","af"])]]:[["Pacific Ocean",[-150,0]],["Atlantic Ocean",[-32,8]],["Indian Ocean",[78,-22]]];
   ctx.font="italic 600 "+Math.round((o.fs?o.fs*.95:Math.max(10,Math.min(14,W/dpr/80)))*dpr)+"px Georgia,serif";ctx.fillStyle="rgba(190,222,255,.75)";
   OC.forEach(([n,ll])=>{const xy=p(ll);if(xy){const q2=inside(xy,ctx.measureText(n).width);ctx.fillText(n,q2[0],q2[1])}})}
  const taken=[],hit=(x,y,hw,hh)=>taken.some(T=>Math.abs(x-T[0])<T[2]+hw&&Math.abs(y-T[1])<T[3]+hh);
  /* in deep time, today's names become small hints of what each piece will become */
  ctx.font=(old?"700 "+Math.round(fs*.78):"800 "+fs)+"px system-ui,-apple-system,'Segoe UI',sans-serif";
  for(const kk in V){if(kk==="an"&&t<40)continue;if(G.AB&&G.AB[kk]>=0&&t>G.AB[kk]-5)continue;const xy=p(V[kk]);if(!xy)continue;const nm=(o.short||old?SHORT:NAME)[kk]+(old?"*":"");const hw=ctx.measureText(nm).width/2,hh=fs*.55;let q2=inside(xy,hw*2);
   /* step down, then up, until it doesn't sit on an earlier name */
   for(const d of [0,1,-1,2,-2,3]){const y=q2[1]+d*fs*1.15;if(y<m+fs*.6||y>H-m-fs*.6)continue;if(!hit(q2[0],y,hw,hh)){q2=[q2[0],y];break}}taken.push([q2[0],q2[1],hw+3*dpr,hh]);
   ctx.lineWidth=(old?2.5:3.5)*dpr;ctx.strokeStyle=old?"rgba(255,255,255,.7)":"rgba(255,255,255,.92)";ctx.strokeText(nm,q2[0],q2[1]);ctx.fillStyle=old?"rgba(27,19,12,.8)":"#1b130c";ctx.fillText(nm,q2[0],q2[1])}
  /* the supercontinent's name: near the middle of its pieces, in the first clear spot */
  SUPER.forEach(([nm,ks])=>{const xy0=p(mid(ks));if(!xy0)return;
   const f=Math.round(fs*1.5);ctx.font="900 "+f+"px system-ui,-apple-system,'Segoe UI',sans-serif";const txt=nm.toUpperCase().split("").join(String.fromCharCode(8202)),hw=ctx.measureText(txt).width/2,hh=f*.6;
   let xy=inside(xy0,hw*2);xy[1]=Math.max(m+f*1.6,Math.min(H-m-f*1.6,xy[1]));
   let ok=false;for(const dx of [0,-.6,.6,-1.2,1.2]){for(const d of [-1,0,1,-2,2,-3,3,-4]){const y=xy0[1]+d*f*.9,x=Math.max(m+hw+4*dpr,Math.min(W-m-hw-4*dpr,xy0[0]+dx*hw*2));if(y<m+f*1.6||y>H-m-f*1.6)continue;if(!hit(x,y,hw,hh)){xy=[x,y];ok=true;break}}if(ok)break}taken.push([xy[0],xy[1],hw+6*dpr,hh]);
   ctx.lineWidth=5*dpr;ctx.strokeStyle="rgba(20,14,8,.55)";ctx.strokeText(txt,xy[0],xy[1]);ctx.fillStyle="rgba(255,248,235,.95)";ctx.fillText(txt,xy[0],xy[1])});
  /* pins for present-day places, carried with their plates */
  (o.marks||[]).forEach(M=>{const ll=placeAt(M.lon,M.lat,t);if(!ll)return;const xy=p(ll);if(!xy)return;const r=5*dpr;
   ctx.beginPath();ctx.arc(xy[0],xy[1],r*2.2,0,7);ctx.fillStyle="rgba(255,90,60,.25)";ctx.fill();ctx.beginPath();ctx.arc(xy[0],xy[1],r,0,7);ctx.fillStyle="#ff5a3c";ctx.fill();ctx.lineWidth=1.6*dpr;ctx.strokeStyle="#fff";ctx.stroke();
   if(M.label){const f=Math.round(fs*.85);ctx.font="700 "+f+"px system-ui,-apple-system,'Segoe UI',sans-serif";const w=ctx.measureText(M.label).width,pad=5*dpr,left=M.side==="l"||xy[0]+w+r*3+pad*2>W-m;const bx=left?xy[0]-r*2-w-pad*2:xy[0]+r*2,by=xy[1]-f*.8;
    ctx.fillStyle="rgba(12,22,40,.88)";ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,w+pad*2,f*1.6,6*dpr):ctx.rect(bx,by,w+pad*2,f*1.6);ctx.fill();ctx.fillStyle="#fff";ctx.textAlign="left";ctx.fillText(M.label,bx+pad,xy[1]);ctx.textAlign="center"}});
  if(old&&o.legend!==false){ctx.font="600 "+Math.round(fs*.72)+"px system-ui,sans-serif";ctx.textAlign="left";ctx.fillStyle="rgba(220,235,255,.75)";ctx.fillText("* the land that becomes today’s continent",m+4*dpr,H-m-6*dpr);ctx.textAlign="center"}}
 return true}
/* where a present-day place was at time t: the plate under it, turned back; null if that land didn't exist yet */
function placeAt(lon,lat,t){if(!G)return null;const r=G.meta.res,i=Math.max(0,Math.min(G.NX-1,Math.floor((lon+180)/r))),j=Math.max(0,Math.min(G.NY-1,Math.floor((90-lat)/r))),k=(j*G.NX+i)*2,pl=G.PX[k],b=G.PX[k+1];
 if(pl===255)return null;if(b<255&&t>b*5)return null;const q=[0,0,0,0];quat(pl,t,q,0);return turnPt(q,lon,lat)}
/* the longitude of the middle of the land at time t, unwrapped so it changes smoothly; used to keep deep-time land in view */
let LL=null;function landLon(t){if(!G)return 0;if(!LL){LL=new Float32Array(751);const q=[0,0,0,0];let prev=null;
 for(let y=0;y<=750;y++){let x=0,yy=0;for(const kk in G.meta.anchors){const a=G.meta.anchors[kk];if(a[2]<0)continue;quat(a[2],y,q,0);const v=turnPt(q,a[0],a[1]),c=Math.cos(v[1]*DEG);x+=c*Math.cos(v[0]*DEG);yy+=c*Math.sin(v[0]*DEG)}
  let L=Math.atan2(yy,x)/DEG;if(prev!=null){while(L-prev>180)L-=360;while(L-prev<-180)L+=360}LL[y]=prev=L}
 /* a 60-million-year running mean, so the view turns gently */const S=new Float32Array(751);for(let y=0;y<=750;y++){let a=0,n=0;for(let k=Math.max(0,y-30);k<=Math.min(750,y+30);k++){a+=LL[k];n++}S[y]=a/n}LL=S}
 t=Math.max(0,Math.min(750,t));const a=Math.floor(t),b=Math.min(750,a+1);return LL[a]+(LL[b]-LL[a])*(t-a)}
window.gfDrift={load:load,draw:draw,landLon:landLon,placeAt:placeAt,stage:stage,MAX:750,ready:()=>!!G,credit:"Plate motions: C. R. Scotese, PALEOMAP Project"};

/* All Maps: a "Deep Time" chip that opens a full-size drift map with a smooth time slider */
if(typeof renderAllMapsView!=="function")return;
const css=document.createElement("style");css.textContent=`
#gfDeep{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;background:#0e2238;border-radius:inherit;overflow:hidden;color:#fff;font-family:inherit}
#gfDeep canvas{flex:1;min-height:0;width:100%;cursor:grab;touch-action:none;display:block}
#gfDeep canvas.drag{cursor:grabbing}
#gfDeep .gfd-bar{display:flex;flex-direction:column;gap:6px;padding:10px 16px 12px;background:rgba(8,20,36,.92)}
#gfDeep .gfd-row{display:flex;align-items:center;gap:12px}
#gfDeep .gfd-play{flex:none;width:34px;height:34px;border-radius:50%;border:0;background:#e8701a;color:#fff;font-size:14px;cursor:pointer;display:grid;place-items:center}
#gfDeep input[type=range]{flex:1;accent-color:#e8701a;min-width:0}
#gfDeep .gfd-time{flex:none;min-width:10.5em;font-weight:800;font-size:15px;text-align:right}
#gfDeep .gfd-stage{font-size:13px;font-weight:700;color:#ffc58a;min-height:1.2em}
#gfDeep .gfd-ticks{display:flex;justify-content:space-between;font-size:10.5px;opacity:.65;padding:0 calc(10.5em + 12px) 0 46px}
#gfDeep .gfd-credit{font-size:10.5px;opacity:.6}
#gfDeep .gfd-x{position:absolute;top:10px;right:12px;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:18px;cursor:pointer;z-index:2}
#gfDeep .gfd-load{position:absolute;inset:0 0 120px;display:grid;place-items:center;font-weight:700;opacity:.85;pointer-events:none}
`;document.head.appendChild(css);
const st={t:250,lon:-10,playing:false,raf:0,pend:0,marks:null};
function box(){return document.getElementById("gfDeep")}
function paint(){if(st.pend)return;st.pend=requestAnimationFrame(()=>{st.pend=0;const b=box();if(!b||b.hidden)return;
 if(gfDrift.ready()){/* past ~150 Ma turn the world gradually so the land stays in the middle; a drag adds on top */const w=Math.max(0,Math.min(1,(st.t-150)/200)),f=w*w*(3-2*w);gfDrift.draw(b.querySelector("canvas"),st.t,st.lon-f*(gfDrift.landLon(st.t)-gfDrift.landLon(150)),{margin:12,marks:st.marks,left:st.left||0})}
 b.querySelector(".gfd-time").textContent=st.t<.5?"Today":(st.t<10?st.t.toFixed(1):Math.round(st.t))+" million years ago";
 b.querySelector(".gfd-stage").textContent=gfDrift.stage(st.t)[1];
 const r=b.querySelector("input[type=range]"),v=gfDrift.MAX-st.t;if(Math.abs(+r.value-v)>.05)r.value=v})}
function open(){const wrap=document.getElementById("allMapsWrap");if(!wrap)return;let b=box();
 if(!b){if(getComputedStyle(wrap).position==="static")wrap.style.position="relative";b=document.createElement("div");b.id="gfDeep";
  b.innerHTML='<canvas aria-label="The continents through time"></canvas><div class="gfd-load">Loading…</div><button type="button" class="gfd-x" aria-label="Close deep time">×</button><div class="gfd-bar"><div class="gfd-stage"></div><div class="gfd-row"><button type="button" class="gfd-play" aria-label="Play">▶</button><input type="range" min="0" max="'+gfDrift.MAX+'" step="0.1" aria-label="Time"><span class="gfd-time"></span></div><div class="gfd-ticks"><span>750 Ma</span><span>500 Ma</span><span>250 Ma</span><span>Today</span></div><div class="gfd-credit">'+gfDrift.credit+'. Positions from a published plate model; the landscapes are today’s, carried back in time. Before about 500 million years ago positions are less certain. Drag the map to turn the world.</div></div>';
  wrap.appendChild(b);
  const r=b.querySelector("input[type=range]");r.oninput=()=>{stop();st.t=gfDrift.MAX-(+r.value);paint()};
  b.querySelector(".gfd-play").onclick=()=>{st.playing?stop():play()};
  b.querySelector(".gfd-x").onclick=close;
  const cv=b.querySelector("canvas");let d0=null;
  cv.addEventListener("pointerdown",e=>{d0={x:e.clientX,lon:st.lon};cv.classList.add("drag");try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener("pointermove",e=>{if(!d0)return;st.lon=d0.lon+(e.clientX-d0.x)*300/(cv.clientWidth||800);paint()});
  const up=()=>{d0=null;cv.classList.remove("drag")};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  new ResizeObserver(()=>{if(b.isConnected&&!b.hidden)paint()}).observe(b)}
 b.hidden=false;document.querySelectorAll("#allMapsToggleRow .chip").forEach(c=>c.classList.toggle("active",c.id==="gfDeepChip"));paint();
 const L=b.querySelector(".gfd-load");
 gfDrift.load(s=>{if(L)L.textContent=s}).then(()=>{if(L)L.remove();paint()}).catch(e=>{console.error(e);if(L)L.textContent=String(e&&e.message)==="nogl"?"This browser can’t draw the drift map (it needs WebGL 2).":"Couldn’t load the drift map. Check your connection and try again."})}
function play(){const b=box();st.playing=true;b.querySelector(".gfd-play").textContent="❚❚";if(st.t<.5)st.t=gfDrift.MAX;let last=performance.now();
 const step=n=>{if(!st.playing||!b.isConnected||b.hidden)return stop();const dt=Math.min(.05,(n-last)/1000);last=n;st.t=Math.max(0,st.t-dt*(st.t>250?60:35));paint();if(st.t<=0)return stop();st.raf=requestAnimationFrame(step)};st.raf=requestAnimationFrame(step)}
function stop(){st.playing=false;cancelAnimationFrame(st.raf);const b=document.querySelector("#gfDeep .gfd-play");if(b)b.textContent="▶"}
function close(){stop();const b=box();if(b)b.hidden=true;const c=document.getElementById("gfDeepChip");if(c)c.classList.remove("active");
 const cur=document.querySelector('#allMapsToggleRow [data-allmaps-mode="'+(typeof allMapsColorMode!=="undefined"?allMapsColorMode:"relief")+'"]');if(cur)cur.classList.add("active")}
function ensure(){const row=document.getElementById("allMapsToggleRow");if(!row||document.getElementById("gfDeepChip"))return;
 const c=document.createElement("button");c.type="button";c.className="chip";c.id="gfDeepChip";c.textContent="Deep Time";c.title="Watch the continents drift over 750 million years";c.onclick=open;row.appendChild(c);
 row.addEventListener("click",e=>{if(e.target.closest("[data-allmaps-mode]"))close()},true)}
const _r=renderAllMapsView;renderAllMapsView=function(){const r=_r.apply(this,arguments);try{ensure()}catch(e){console.error(e)}return r};
window.gfDeepTimeOpen=open;
window.gfDeepUI={st:st,paint:paint,open:open,stop:stop,close:close,box:box};
})();
