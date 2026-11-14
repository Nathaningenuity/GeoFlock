/* GeoFlock: the Relief map's Natural Earth style gets sharper as you zoom in on the globe.
   Source: Natural Earth I with shaded relief, land cover and water, high-resolution edition (NE1_HR_LC_SR_W, 21600 x 10800,
   1/60 degree, about 1.85 km a pixel at the equator), naturalearthdata.com, public domain. It is the sharpest edition
   Natural Earth makes of this picture.
   The tiles in textures/reliefhr2 are that picture recoloured to match the globe's own Natural Earth picture
   (GLOBE_RELIEF_*_LK_NE, 8192 x 4096): a colour table fitted between the two, then a gentle local correction separately
   for land and for sea, so that shrunk back to the globe picture's size the tiles give the same colours (mean CIEDE2000
   difference about 1.1). Where the globe picture has its own edits (the Antarctic ice shelves) the tiles are see-through
   and the globe picture shows. Two sizes: 1/ is the full picture in 6-degree tiles of 360 px, 0/ the half-size picture in
   12-degree tiles.
   Zoomed in, the part of the globe in view is drawn from the tiles instead of the globe picture (index.html,
   GlobeGL.draw -> gfHRPatch). It comes in clear steps, not a slow blur-to-sharp: past a set zoom the half-size tiles
   appear with a quick fade, and zoomed further the full tiles replace them in one swap. The tiles for the next step are
   fetched ahead while you zoom, decoded off the page (createImageBitmap) and the shading worked out in a background
   worker, so the globe keeps turning smoothly while they load. The terrain shading slider and your own shades (Palette) are applied to the
   tiles the same way they are applied to the globe picture. Only on the globe; the flat map keeps its picture. */
(function(){
"use strict";
const BASE="textures/reliefhr2/",V="?v=1",PPD_BASE=8192/360,LV=[{ppd:30,deg:12,cols:30,rows:15},{ppd:60,deg:6,cols:60,rows:30}],T=360;
/* zoom (screen pixels a degree) at which each step starts; the half-size tiles start a little before the globe picture is
   magnified (zoomed out the two look the same), the full tiles once the half-size ones would be */
const ON=PPD_BASE*.85,ON1=LV[0].ppd*1.05,PRE0=PPD_BASE*.55,PRE1=LV[0].ppd*.7,FADE=260;
/* ---- tiles: fetched and decoded off the page, kept (most recent 400) ---- */
const IMG=new Map();
function load(k){const u=BASE+k+".webp"+V;
 if(window.createImageBitmap&&window.fetch)return fetch(u).then(r=>r.ok?r.blob():null).then(b=>b?createImageBitmap(b):null).catch(()=>null);
 return new Promise(res=>{const im=new Image();im.onload=()=>(im.decode?im.decode().catch(()=>{}):Promise.resolve()).then(()=>res(im));im.onerror=()=>res(null);im.src=u})}
function img(k){if(IMG.has(k)){const v=IMG.get(k);IMG.delete(k);IMG.set(k,v);return v}
 const p=load(k);IMG.set(k,p);while(IMG.size>400)IMG.delete(IMG.keys().next().value);return p}
const isRelief=k=>/^(relief|gfRelShade|reliefAdj)/.test(k||"");
function wanted(){try{return gfMS().style==="natural"&&allMapsColorMode==="relief"&&!(typeof gfStyleGen==="function"&&gfStyleGen())&&!(typeof gfSeaLevel==="function"&&gfSeaLevel())}catch(e){return false}}
let P=null,busy=false,timer=0,lastShown=0,preKey="",preT=0;
const req=()=>{try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}};
/* the part of the globe in view, as longitudes (from the centre's side) and latitudes */
function viewBox(gv){const pr=gv.projection(),{w,h}=gv.size(),c=[-gv.rot[0],-gv.rot[1]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
 for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const q=pr.invert&&pr.invert([w*i/8,h*j/8]);if(!q||!isFinite(q[0])||!isFinite(q[1]))continue;if(d3.geoDistance(q,c)>Math.PI/2)continue;let dl=((q[0]-c[0]+540)%360)-180;x0=Math.min(x0,dl);x1=Math.max(x1,dl);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);n++}
 if(n<4)return null;const lat=Math.max(Math.abs(y0),Math.abs(y1));if(lat>80){x0=-180;x1=180}return{l0:c[0]+x0,l1:c[0]+x1,b0:y0,b1:y1}}
/* the tiles covering the view and a margin of one tile, middle first */
function tilesFor(gv,lv,MAXC){const L=LV[lv],D=L.deg,v=viewBox(gv);if(!v)return null;
 let c0=Math.floor((v.l0+180)/D)-1,c1=Math.floor((v.l1+180)/D)+1,r0=Math.max(0,Math.floor((90-v.b1)/D)-1),r1=Math.min(L.rows-1,Math.floor((90-v.b0)/D)+1);
 if(c1-c0+1>MAXC){const m=Math.floor((c0+c1)/2);c0=m-(MAXC>>1);c1=c0+MAXC-1}if(r1-r0+1>MAXC){const m=Math.floor((r0+r1)/2);r0=Math.max(0,m-(MAXC>>1));r1=Math.min(L.rows-1,r0+MAXC-1)}
 const ks=[],mc=(c0+c1)/2,mr=(r0+r1)/2;for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const cc=((c%L.cols)+L.cols)%L.cols;ks.push([c-c0,r-r0,lv+"/"+cc+"_"+r,(c-mc)**2+(r-mr)**2])}
 ks.sort((a,b)=>a[3]-b[3]);return{c0,c1,r0,r1,D,ks}}
/* ---- the same changes the globe picture gets ---- */
/* terrain shading: the shade and light layers (flat map frame) re-sampled onto a longitude/latitude grid, as geoflock-mapfix.js does */
let EQ=null;
function eqLayers(){const M=gfMS(),sk=M.sun+"|"+M.shadeB;if(!(GFL.canv.shade&&GFL.shadeKey===sk))return null;if(EQ&&EQ.sk===sk)return EQ;
 const W=GFG.W,H=GFG.H,lut=gfGlobeLut();const toEq=src=>{const S=src.getContext("2d").getImageData(0,0,src.width,src.height).data,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d"),D=x.createImageData(W,H),d=D.data;
  for(let i=0,j=0;i<W*H;i++,j+=4){const k=lut[i]*4;if(k<0)continue;d[j]=S[k];d[j+1]=S[k+1];d[j+2]=S[k+2];d[j+3]=S[k+3]}x.putImageData(D,0,0);return c};
 EQ={sk,s:toEq(GFL.canv.shade),l:GFL.canv.light?toEq(GFL.canv.light):null};return EQ}
/* a layer's part over the patch at the layer's own size (the patch may run past 180 degrees: drawn three times), with how
   to place it on the patch; it is enlarged smoothly pixel by pixel in the worker, not here */
function layerOver(src,bb,cw,ch){const W=src.width,H=src.height,sx=W/360,sy=H/180,X0=(bb[0]+180)*sx,Y0=(90-bb[1])*sy,w=bb[2]*sx,h=bb[3]*sy;
 const ox=Math.floor(X0)-1,oy=Math.floor(Y0)-1,sw=Math.ceil(X0+w)+2-ox,sh=Math.ceil(Y0+h)+2-oy,c=document.createElement("canvas");c.width=sw;c.height=sh;const x=c.getContext("2d",{willReadFrequently:true});
 for(const off of[0,-W,W])x.drawImage(src,off-ox,-oy);return{d:x.getImageData(0,0,sw,sh).data,w:sw,h:sh,fx:X0-ox,fy:Y0-oy,kx:w/cw,ky:h/ch}}
/* your own shades: the same shift geoflock-reliefadjust.js makes to the globe picture */
const CL=["forest","grass","desert","ice","shallow","deep"];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function shiftPrep(B,T){const ks=CL.filter(k=>T[k]);if(!ks.length)return null;return{A:ks.map(k=>B[k]),S:ks.map(k=>{const t=rgb(T[k]),b=B[k];return[t[0]-b[0],t[1]-b[1],t[2]-b[2]]}),all:CL.map(k=>B[k])}}
/* the pixel work, for one stretch of pixels; written to run either in the worker or here */
function pixWork(d,cw,s,l,Q,i0,i1){
 if(Q){const A=Q.A,S=Q.S,all=Q.all,sig=1/(2*38*38);
  for(let i=i0;i<i1;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(!d[i+3])continue;
   let tot=.02,dr=0,dg=0,db=0;for(let k=0;k<all.length;k++){const a=all[k],q=(r-a[0])**2+(g-a[1])**2+(b-a[2])**2;tot+=Math.exp(-q*sig)}
   for(let k=0;k<A.length;k++){const a=A[k],q=(r-a[0])**2+(g-a[1])**2+(b-a[2])**2,wv=Math.exp(-q*sig)/tot;dr+=wv*S[k][0];dg+=wv*S[k][1];db+=wv*S[k][2]}
   d[i]=r+dr;d[i+1]=g+dg;d[i+2]=b+db}}
 if(s){const S=[0,0,0,0],Lq=[0,0,0,0];
  /* the layer's value at a patch pixel, smoothly between its own pixels */
  const at=(L,px,py,o)=>{let u=L.fx+(px+.5)*L.kx-.5,v=L.fy+(py+.5)*L.ky-.5;if(u<0)u=0;if(v<0)v=0;if(u>L.w-1.001)u=L.w-1.001;if(v>L.h-1.001)v=L.h-1.001;
   const x0=u|0,y0=v|0,fx=u-x0,fy=v-y0,D=L.d,a=(y0*L.w+x0)*4,b=a+4,c=a+L.w*4,e=c+4;
   for(let k=0;k<4;k++)o[k]=(D[a+k]*(1-fx)+D[b+k]*fx)*(1-fy)+(D[c+k]*(1-fx)+D[e+k]*fx)*fy};
  for(let i=i0;i<i1;i+=4){const n=i>>2,px=n%cw,py=(n-px)/cw;at(s,px,py,S);let a=S[3]/255;if(a>0)for(let c=0;c<3;c++)d[i+c]=d[i+c]*(1-a)+a*d[i+c]*S[c]/255;
   if(l){at(l,px,py,Lq);if((a=Lq[3]/255)>0)for(let c=0;c<3;c++){const D0=d[i+c]/255,S0=Lq[c]/255;d[i+c]=255*(D0*(1-a)+a*(S0+D0-S0*D0))}}}}}
let WK=null,wid=0;const WP=new Map();
function worker(){if(WK!==null)return WK;try{const src=pixWork.toString()+";onmessage=function(e){var m=e.data,d=new Uint8ClampedArray(m.d);pixWork(d,m.cw,m.s,m.l,m.Q,0,d.length);postMessage({id:m.id,d:d.buffer},[d.buffer])}";
 WK=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));WK.onmessage=e=>{const f=WP.get(e.data.id);WP.delete(e.data.id);f&&f(new Uint8ClampedArray(e.data.d))};WK.onerror=()=>{WK=false;WP.forEach(f=>f(null));WP.clear()}}catch(e){WK=false}return WK}
/* in the worker when there is one; otherwise here, in short stretches with pauses so the page never stops */
async function pixels(d,cw,s,l,Q){const w=worker();
 if(w){const r=await new Promise(res=>{const id=++wid;WP.set(id,res);const tr=[d.buffer];if(s)tr.push(s.d.buffer);if(l)tr.push(l.d.buffer);w.postMessage({id,d:d.buffer,cw,s,l,Q},tr)});if(r)return r;return null}
 const step=Q?200000:800000;for(let i=0;i<d.length;i+=step){pixWork(d,cw,s,l,Q,i,Math.min(d.length,i+step));await new Promise(r=>setTimeout(r,0))}return d}
function adjNow(){try{const A=window.gfReliefAdj;return A&&A.OUT&&A.OUT.natural&&A.ADJ.natural&&Object.keys(A.ADJ.natural).length?A.ADJ.natural:null}catch(e){return null}}
const maxC=G=>Math.floor(Math.min(4096,G.getParameter(G.MAX_TEXTURE_SIZE)||4096)/T);
/* ---- the patch for the part in view ---- */
async function build(gv,o,lv,sig){busy=true;try{const G=gv.gl&&gv.gl.gl;if(!G){busy=false;return}
 const tf=tilesFor(gv,lv,maxC(G));if(!tf){busy=false;return}const{c0,c1,r0,r1,D,ks}=tf;
 const key=[lv,c0,c1,r0,r1,sig].join(",");if(P&&P.key===key){busy=false;return}
 const ims=await Promise.all(ks.map(k=>img(k[2])));
 const cols=c1-c0+1,rows=r1-r0+1,cw=cols*T,ch=rows*T,cv=document.createElement("canvas");cv.width=cw;cv.height=ch;const x=cv.getContext("2d",{willReadFrequently:true});
 ks.forEach(([i,j],n)=>{if(ims[n])x.drawImage(ims[n],i*T,j*T)});
 const bb=[c0*D-180,90-r0*D,cols*D,rows*D];
 /* the shading and your shades, in the order the globe picture gets them: shades first, then shading over them */
 const shaded=/^gfRelShade/.test(o.key||""),adj=adjNow();
 if(shaded||adj){const id=x.getImageData(0,0,cw,ch);let Q=null;
  if(adj){try{Q=shiftPrep(await gfReliefAdj.base("natural"),adj)}catch(e){}}
  const E=shaded?eqLayers():null,s=E?layerOver(E.s,bb,cw,ch):null,l=E&&E.l?layerOver(E.l,bb,cw,ch):null;
  if(Q||s){const out=await pixels(id.data,cw,s,l,Q);if(!out){busy=false;return}x.putImageData(new ImageData(out,cw,ch),0,0)}}
 if(gv.gl.gl!==G){busy=false;return}
 const t=G.createTexture();G.activeTexture(G.TEXTURE4);G.bindTexture(G.TEXTURE_2D,t);G.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,false);G.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
 G.texImage2D(G.TEXTURE_2D,0,G.RGBA,G.RGBA,G.UNSIGNED_BYTE,cv);G.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);G.generateMipmap(G.TEXTURE_2D);
 G.texParameteri(G.TEXTURE_2D,G.TEXTURE_MIN_FILTER,G.LINEAR_MIPMAP_LINEAR);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_MAG_FILTER,G.LINEAR);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_S,G.CLAMP_TO_EDGE);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_T,G.CLAMP_TO_EDGE);
 try{const an=gv.gl.aniso;if(an)G.texParameterf(G.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,G.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))}catch(e){}
 G.activeTexture(G.TEXTURE0);if(P&&P.tex&&P.gl===G)try{G.deleteTexture(P.tex)}catch(e){}
 /* fades in only when nothing sharp was showing; a step up from half-size to full tiles is one swap */
 const now=performance.now();
 P={key,lv,sig,gl:G,tex:t,bb,box:[c0*D-180,c1*D-180+D,90-r1*D-D,90-r0*D],t0:now-lastShown<300?-1e9:now};busy=false;req()}catch(e){console.error(e);busy=false}}
function inside(gv){if(!P)return false;const v=viewBox(gv);if(!v)return false;const l=((v.l0-P.box[0])%360+360)%360,r=l+(v.l1-v.l0);return l>=0&&r<=P.box[1]-P.box[0]+1e-6&&v.b0>=P.box[2]-1e-6&&v.b1<=P.box[3]+1e-6}
function sigNow(o){let s=/^gfRelShade/.test(o.key||"")?"s"+(EQ?EQ.sk:"")+(window.GFL?GFL.shadeKey:""):"p";const a=adjNow();if(a)s+="|"+JSON.stringify(a);return s}
/* fetch ahead the tiles the next step will need, a few at a time */
function prefetch(gv,lv){const now=performance.now();if(now-preT<300)return;preT=now;const G=gv.gl&&gv.gl.gl;if(!G)return;const tf=tilesFor(gv,lv,maxC(G));if(!tf)return;
 const k=lv+":"+tf.c0+","+tf.r0+","+tf.c1+","+tf.r1;if(k===preKey)return;preKey=k;tf.ks.forEach(t=>img(t[2]))}
window.gfHRPatch=function(G,o){const gv=o&&o.gv;if(!gv||gv._flat||!isRelief(o.key)||!wanted())return null;const ppd=o.s*Math.PI/180;
 if(P&&P.gl!==G.gl)P=null;
 if(ppd<ON){if(ppd>PRE0)prefetch(gv,0);return null}
 const lv=ppd>ON1?1:0,sig=sigNow(o);if(lv===0&&ppd>PRE1)prefetch(gv,1);
 const fresh=P&&P.lv===lv&&P.sig===sig&&inside(gv);
 if(!busy&&!fresh){clearTimeout(timer);timer=setTimeout(function go(){
   /* while the globe moves, only rebuild once the view has left the sharp part (the work is off the page, so this does not stall it) */
   if(gv._moving&&P&&P.lv===lv&&P.sig===sigNow(o)&&inside(gv)){timer=setTimeout(go,250);return}
   if(!busy)build(gv,o,lv,sigNow(o))},P?(gv._moving?300:60):0)}
 /* a patch made with other shading or shades is never shown */
 if(!P||P.sig!==sig)return null;const now=performance.now(),f=Math.max(0,Math.min(1,(now-P.t0)/FADE));
 if(f<1)requestAnimationFrame(req);lastShown=now;return{tex:P.tex,bb:P.bb,a:f}};
gfHRPatch.state=()=>({busy,key:P&&P.key,worker:!!WK,cached:IMG.size});
})();
