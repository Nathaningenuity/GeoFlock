/* GeoFlock: the Relief map gets sharper as you zoom in on the globe. The relief picture is about 5 km a pixel; zoomed in,
   the fine detail of Natural Earth I's high-resolution edition (NE1_HR_LC_SR_W, 21600 × 10800, about 1.85 km a pixel,
   public domain, naturalearthdata.com) is laid over it: each tile in textures/nehr holds that picture divided by a copy of
   itself blurred to the relief picture's own resolution (128 = no change), so only the detail the relief picture lacks is
   added, and its colours, your own shades and the terrain shading all stay as they are. Built by tools/build-nehr.py.
   The globe's WebGL shader multiplies it in for the part in view (index.html, GlobeGL.draw → gfHRPatch). */
(function(){
"use strict";
const BASE="textures/nehr/",V="?v=1",PPD_BASE=4096/180,MAXC=8;
let IDX=null,HAVE=null;fetch(BASE+"index.json"+V).then(r=>r.json()).then(j=>{IDX=j;HAVE=new Set(j.have.map(a=>a[0]+"_"+a[1]));req()}).catch(()=>{});
const IMG=new Map();
function img(k){if(IMG.has(k)){const v=IMG.get(k);IMG.delete(k);IMG.set(k,v);return v}
 const p=new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=BASE+k+".webp"+V});IMG.set(k,p);while(IMG.size>160)IMG.delete(IMG.keys().next().value);return p}
const isRelief=k=>/^(relief|gfRelShade|reliefAdj)/.test(k||"");
let P=null,want=null,busy=false,timer=0,glRef=null;
const req=()=>{try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}};
/* the part of the globe in view, as longitudes (from the centre's side) and latitudes */
function viewBox(gv){const pr=gv.projection(),{w,h}=gv.size(),c=[-gv.rot[0],-gv.rot[1]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
 for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const q=pr.invert&&pr.invert([w*i/8,h*j/8]);if(!q||!isFinite(q[0])||!isFinite(q[1]))continue;if(d3.geoDistance(q,c)>Math.PI/2)continue;let dl=((q[0]-c[0]+540)%360)-180;x0=Math.min(x0,dl);x1=Math.max(x1,dl);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);n++}
 if(n<4)return null;const lat=Math.max(Math.abs(y0),Math.abs(y1));if(lat>80){x0=-180;x1=180}return{l0:c[0]+x0,l1:c[0]+x1,b0:y0,b1:y1}}
async function build(gv,o){if(!IDX)return;busy=true;try{const T=IDX.tile,D=T/IDX.ppd,v=viewBox(gv);if(!v){busy=false;return}
 let c0=Math.floor((v.l0+180)/D)-1,c1=Math.floor((v.l1+180)/D)+1,r0=Math.max(0,Math.floor((90-v.b1)/D)-1),r1=Math.min(IDX.rows-1,Math.floor((90-v.b0)/D)+1);
 /* never more than MAXC tiles a side: the middle of the view first */
 if(c1-c0+1>MAXC){const m=Math.floor((c0+c1)/2);c0=m-(MAXC>>1);c1=c0+MAXC-1}if(r1-r0+1>MAXC){const m=Math.floor((r0+r1)/2);r0=Math.max(0,m-(MAXC>>1));r1=Math.min(IDX.rows-1,r0+MAXC-1)}
 const key=[c0,c1,r0,r1].join(",");if(P&&P.key===key){busy=false;return}
 const cols=c1-c0+1,rows=r1-r0+1,ks=[];for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const cc=((c%IDX.cols)+IDX.cols)%IDX.cols;ks.push([c-c0,r-r0,cc+"_"+r])}
 const ims=await Promise.all(ks.map(([, ,k])=>HAVE.has(k)?img(k):null));
 const cv=document.createElement("canvas");cv.width=cols*T;cv.height=rows*T;const x=cv.getContext("2d");x.fillStyle="rgb(128,128,128)";x.fillRect(0,0,cv.width,cv.height);
 ks.forEach(([i,j],n)=>{if(ims[n])x.drawImage(ims[n],i*T,j*T)});
 const G=gv.gl&&gv.gl.gl;if(!G){busy=false;return}const t=G.createTexture();G.activeTexture(G.TEXTURE4);G.bindTexture(G.TEXTURE_2D,t);G.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,false);
 G.texImage2D(G.TEXTURE_2D,0,G.RGB,G.RGB,G.UNSIGNED_BYTE,cv);[G.TEXTURE_MIN_FILTER,G.TEXTURE_MAG_FILTER].forEach(p=>G.texParameteri(G.TEXTURE_2D,p,G.LINEAR));G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_S,G.CLAMP_TO_EDGE);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_T,G.CLAMP_TO_EDGE);
 G.activeTexture(G.TEXTURE0);if(P&&P.tex&&P.gl===G)try{G.deleteTexture(P.tex)}catch(e){}
 P={key,gl:G,tex:t,bb:[c0*D-180,90-r0*D,cols*D,rows*D],box:[c0*D-180,c1*D-180+D,90-r1*D-D,90-r0*D]};busy=false;req()}catch(e){console.error(e);busy=false}}
/* how strongly to add the detail: from when the relief picture starts to be magnified, full a little after */
function strength(o){const ppd=o.s*Math.PI/180;return Math.max(0,Math.min(1,(ppd/PPD_BASE-.6)/.5))}
function inside(gv){if(!P)return false;const v=viewBox(gv);if(!v)return false;const l=((v.l0-P.box[0])%360+360)%360,r=l+(v.l1-v.l0);return l>=0&&r<=P.box[1]-P.box[0]+1e-6&&v.b0>=P.box[2]-1e-6&&v.b1<=P.box[3]+1e-6}
window.gfHRPatch=function(G,o){const gv=o&&o.gv;if(!gv||gv._flat||!isRelief(o.key)||!IDX)return null;const a=strength(o);if(a<=0)return null;
 if(P&&P.gl!==G.gl)P=null;
 if(!busy&&!inside(gv)){clearTimeout(timer);timer=setTimeout(()=>build(gv,o),P?120:30)}
 if(!P)return null;return{tex:P.tex,bb:P.bb,a}};
})();
