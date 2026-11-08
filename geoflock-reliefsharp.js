/* GeoFlock: the Relief map sharpens as you zoom in. The relief picture is about 10 km a pixel, so close up its hills and
   valleys go soft. Once the map has been still for a moment, detailed heights for what is in view are fetched (AWS Terrain
   Tiles: SRTM, GMTED2010, ETOPO1 and other open data; no key) and turned into hill shading (light from the north-west, as
   the picture's own shading), one sample every 2 screen pixels, laid over the picture as light and shade. The picture's
   colours stay; ridges, valleys and cliffs come out sharp. Nothing is fetched at whole-world zoom. Works on the globe and the
   flat map (the globe engine's flat mode). Drawn under the lakes, rivers and borders (through geoflock-detail.js). */
(function(){
"use strict";
if(typeof GlobeView==="undefined"||typeof d3==="undefined")return;
const R_KM=6371,MAXT=64,STEP=2,TILES=new Map();
function tile(k){if(TILES.has(k)){const v=TILES.get(k);TILES.delete(k);TILES.set(k,v);return v}
 const pr=new Promise((res,rej)=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0);res(g.getImageData(0,0,256,256).data)}catch(e){rej(e)}};im.onerror=rej;
  im.src="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/"+k+".png"});TILES.set(k,pr);pr.catch(()=>TILES.delete(k));
 while(TILES.size>200)TILES.delete(TILES.keys().next().value);return pr}
const txy=(ll,z)=>{const n=2**z,la=Math.max(-85.05,Math.min(85.05,ll[1]))*Math.PI/180;return[(((ll[0]+180)/360)%1+1)%1*n*256,(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n*256]};
const isRelief=I=>!!(I&&I.drewRaster&&/^(relief|gfRelShade)/.test(I.texKey||""));
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected&&typeof appMode!=="undefined"&&appMode==="allmaps"?amGlobe:null}catch(e){return null}};
function viewKey(g){const{w,h}=g.size();return[w,h,g.zoom.toFixed(4),g.rot[0].toFixed(3),g.rot[1].toFixed(3),g._flat?1:0,g._gfDl||0,(g._gfOx||0).toFixed(1),(g.roll&&g.roll()||0).toFixed(2)].join("|")}
/* km per screen pixel at the middle of the view */
function kmPx(g){try{const{w,h}=g.size(),pr=g.projection(),a=pr.invert([w/2,h/2]);if(!a||!isFinite(a[0]))return 99;const p0=pr(a),p1=pr([a[0],a[1]+.01]);if(!p0||!p1)return 99;const d=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);return d>0?1.11195/d:99}catch(e){return 99}}
/* the shading starts once a screen pixel is under about 4 km (the picture is about 10 km a pixel) and is full by about 1.5 km */
const START=4,FULL=1.5;
let OV=null,job=0,timer=0,lastKey="",DBG={};
async function build(g,key){const id=++job;const{w,h}=g.size(),pr=g.projection(),GW=Math.ceil(w/STEP),GH=Math.ceil(h/STEP),N=GW*GH;
 const LL=new Array(N);let cy=0,cn=0;const ctr=g._flat?null:[-g.rot[0],-g.rot[1]];
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){let ll=null;try{ll=pr.invert([i*STEP+STEP/2,j*STEP+STEP/2])}catch(e){}
  if(ll&&isFinite(ll[0])&&isFinite(ll[1])&&Math.abs(ll[1])<85&&(!ctr||d3.geoDistance(ll,ctr)<Math.PI/2-.02)){const b=pr(ll);if(b&&Math.abs(b[0]-(i*STEP+STEP/2))<2&&Math.abs(b[1]-(j*STEP+STEP/2))<2){LL[j*GW+i]=ll;cy+=ll[1];cn++}}}
 if(!cn)return null;
 const kmS=kmPx(g)*STEP,lat=cy/cn;
 /* tiles a little finer than the samples (true heights, not smoothed ones), as many as the budget allows */
 let z=Math.max(4,Math.min(13,Math.round(Math.log2(40075*Math.cos(lat*Math.PI/180)/(256*kmS)))+2));
 const need=z=>{const S=new Set(),n=2**z;for(let k=0;k<N;k+=3){const ll=LL[k];if(!ll)continue;const q=txy(ll,z);S.add(z+"/"+((Math.floor(q[0]/256)%n)+n)%n+"/"+Math.floor(q[1]/256))}return S};
 let S=need(z);while(S.size>MAXT&&z>4){z--;S=need(z)}
 DBG={z,tiles:S.size,t0:Date.now()};const T={};await Promise.all([...S].map(k=>tile(k).then(d=>{T[k]=d}).catch(()=>{})));
 DBG.ms=Date.now()-DBG.t0;if(id!==job)return null;
 const n2=2**z,E=new Float32Array(N).fill(NaN);
 for(let k=0;k<N;k++){const ll=LL[k];if(!ll)continue;const q=txy(ll,z),fx=q[0]-.5,fy=q[1]-.5,x0=Math.floor(fx),y0=Math.floor(fy),ax=fx-x0,ay=fy-y0;
  const v=(X,Y)=>{const tx=((Math.floor(X/256)%n2)+n2)%n2,ty=Math.max(0,Math.min(n2-1,Math.floor(Y/256))),d=T[z+"/"+tx+"/"+ty];if(!d)return NaN;const o=((((Y%256)+256)%256)*256+(((X%256)+256)%256))*4;return d[o]*256+d[o+1]+d[o+2]/256-32768};
  const a=v(x0,y0),b=v(x0+1,y0),c=v(x0,y0+1),d=v(x0+1,y0+1);E[k]=(a*(1-ax)+b*ax)*(1-ay)+(c*(1-ax)+d*ax)*ay}
 /* the shading: Lambert light from the north-west, 45° up; flat ground is left as it is, slopes facing the light are
    lightened and those facing away darkened. The screen's own north is used (true north on the flat map; on the globe the
    view is turned only slightly near the middle) */
 const m=kmS*1000,ZEN=Math.PI/4,AZ=Math.PI*1.75,flat=Math.cos(ZEN),ex=1.6;
 const c=document.createElement("canvas");c.width=GW;c.height=GH;const x=c.getContext("2d"),D=x.createImageData(GW,GH),px=D.data;
 for(let j=1;j<GH-1;j++)for(let i=1;i<GW-1;i++){const k=j*GW+i,e=E[k];if(!(e>0))continue;const l=E[k-1],r=E[k+1],u=E[k-GW],dn=E[k+GW];if(!(l===l&&r===r&&u===u&&dn===dn))continue;
  const dzx=(r-l)/(2*m)*ex,dzy=(dn-u)/(2*m)*ex,sl=Math.atan(Math.hypot(dzx,dzy)),asp=Math.atan2(dzy,-dzx);
  const sh=Math.cos(ZEN)*Math.cos(sl)+Math.sin(ZEN)*Math.sin(sl)*Math.cos(AZ-asp),dv=sh-flat,o=k*4;
  /* the coast: the first metres of land fade in, so the shading never draws its own coastline */const f=Math.min(1,e/6);
  if(dv<0){px[o]=px[o+1]=px[o+2]=20;px[o+3]=Math.min(150,-dv*330*f)}else{px[o]=px[o+1]=255;px[o+2]=240;px[o+3]=Math.min(90,dv*220*f)}}
 x.putImageData(D,0,0);return{key,c,z}}
function schedule(g){clearTimeout(timer);timer=setTimeout(async()=>{const g2=G();if(!g2)return;const key=viewKey(g2);if(OV&&OV.key===key)return;
  let r=null;try{r=await build(g2,key)}catch(e){}if(r&&viewKey(g2)===r.key){OV=r;try{g2.request?g2.request():g2.render()}catch(e){}}},320)}
function shade(g,ctx,I){if(g!==G()||!isRelief(I))return;const kp=kmPx(g);if(kp>START){OV=null;return}
 const key=viewKey(g);if(key!==lastKey){lastKey=key;schedule(g)}
 if(!OV||OV.key!==key)return;const{w,h}=g.size(),a=Math.max(0,Math.min(1,(START-kp)/(START-FULL)));if(a<=0)return;
 ctx.save();ctx.globalAlpha=a;ctx.imageSmoothingEnabled=true;ctx.drawImage(OV.c,0,0,w,h);ctx.restore()}
/* hooked in front of the detail layer's drawing, so lakes, rivers, coast and borders come on top */
let n=0;const t=setInterval(()=>{if(window.gfDetail&&gfDetail.draw&&!gfDetail.draw._gfRS){const d0=gfDetail.draw;gfDetail.draw=function(g,ctx,I){try{shade(g,ctx,I)}catch(e){}return d0.apply(this,arguments)};gfDetail.draw._gfRS=1;clearInterval(t)}else if(++n>120)clearInterval(t)},250);
window.gfReliefSharp={state:()=>OV&&{key:OV.key,z:OV.z},dbg:()=>DBG,kmPx:()=>{const g=G();return g?kmPx(g):null}};
})();
