/* GeoFlock: the Elevation map gets sharper as you zoom in on the globe. Its picture is about 10 km a pixel; zoomed in, the
   heights for the view are fetched (AWS Terrain Tiles, the same heights the cross-section uses: SRTM, GMTED2010, ETOPO1 and
   other open data) and coloured with the Elevation map's own colours, which are read off the picture itself (each height's
   colour is the typical colour the picture gives that height in view), then shaded with light from the north-west as the
   picture is. The globe's shader puts it in place of the picture (index.html, GlobeGL.draw → gfElevPatch). It is worked out
   once the map is still; while it moves, the last one is kept. */
(function(){
"use strict";
const TILES=new Map();
function tile(k){if(TILES.has(k))return TILES.get(k);
 const pr=new Promise(res=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0);
   const d=g.getImageData(0,0,256,256).data,h=new Float32Array(65536);for(let i=0;i<65536;i++)h[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768;res(h)}catch(e){res(null)}};im.onerror=()=>res(null);
  im.src="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/"+k+".png"});TILES.set(k,pr);while(TILES.size>160)TILES.delete(TILES.keys().next().value);return pr}
/* where the heights are the rock under an ice sheet (Antarctica, Greenland), not the ice: the picture is left as it is */
const iceZone=(lo,la)=>la<-60||la>84||(lo>-75&&lo<-10&&la>59&&!(lo>-25&&lo<-13&&la>63&&la<67.5));
const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const LANDS=typeof ELEV_LAND_STOPS!=="undefined"?ELEV_LAND_STOPS:[[0,"#5f9f72"],[7e3,"#ffffff"]],SEAS=typeof ELEV_SEA_STOPS!=="undefined"?ELEV_SEA_STOPS:[[-11e3,"#183660"],[0,"#bedaee"]];
let PIC=null;
function picOf(key){try{const im=globeImages(key,()=>{});if(!im||!im.length)return null;const a=im[0];if(PIC&&PIC.a===a)return PIC;const c=document.createElement("canvas");c.width=2048;c.height=1024;const x=c.getContext("2d",{willReadFrequently:true});
 if(im.length===2){x.drawImage(im[0],0,0,1024,1024);x.drawImage(im[1],1024,0,1024,1024)}else x.drawImage(a,0,0,2048,1024);PIC={a,d:x.getImageData(0,0,2048,1024).data};return PIC}catch(e){return null}}
const picAt=(P,lo,la)=>{const x=Math.max(0,Math.min(2047,Math.floor((((lo+180)%360+360)%360)/360*2048))),y=Math.max(0,Math.min(1023,Math.floor((90-la)/180*1024))),o=(y*2048+x)*4;return o};
function viewBox(gv){const pr=gv.projection(),{w,h}=gv.size(),c=[-gv.rot[0],-gv.rot[1]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
 for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){const q=pr.invert&&pr.invert([w*i/10,h*j/10]);if(!q||!isFinite(q[0])||d3.geoDistance(q,c)>Math.PI/2)continue;const dl=((q[0]-c[0]+540)%360)-180;x0=Math.min(x0,dl);x1=Math.max(x1,dl);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);n++}
 if(n<6||y1>84||y0<-84)return null;return{lon0:c[0]+x0,lon1:c[0]+x1,lat0:y0,lat1:y1,w,h}}
let P=null,busy=false,timer=0;
async function build(gv,key){busy=true;try{const v=viewBox(gv);if(!v){busy=false;return}const PI=picOf(key);if(!PI){busy=false;return}
 /* about a screen pixel a cell, at most 1100 a side */
 const nx=Math.min(1100,Math.max(64,Math.round(v.w))),ny=Math.min(1100,Math.max(64,Math.round(v.h))),dlon=(v.lon1-v.lon0)/nx,dlat=(v.lat1-v.lat0)/ny;
 /* the tiles' zoom: about one tile pixel a cell, fewer tiles if the view needs too many */
 const midLat=(v.lat0+v.lat1)/2;let z=Math.round(Math.log2(360/dlon/256*Math.cos(midLat*Math.PI/180)));z=Math.max(2,Math.min(12,z));
 const merc=(lo,la,z)=>{const n=2**z,s=Math.sin(Math.max(-85,Math.min(85,la))*Math.PI/180);return[(((lo+180)/360)%1+1)%1*n*256,(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n*256]};
 let a,b,tx0,tx1,ty0,ty1;for(;;){a=merc(v.lon0,v.lat1,z);b=merc(v.lon1,v.lat0,z);tx0=Math.floor(a[0]/256);ty0=Math.floor(a[1]/256);tx1=Math.floor(b[0]/256);ty1=Math.floor(b[1]/256);if(tx1<tx0)tx1+=2**z;if((tx1-tx0+1)*(ty1-ty0+1)<=36||z<=2)break;z--}
 const n=2**z,ks=[];for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++)ks.push([tx,ty]);const hs=await Promise.all(ks.map(([tx,ty])=>tile(z+"/"+(((tx%n)+n)%n)+"/"+Math.max(0,Math.min(n-1,ty)))));
 if(gv._moving){busy=false;return}const TM=new Map();ks.forEach(([tx,ty],i)=>TM.set(tx+","+ty,hs[i]));
 const H=new Float32Array(nx*ny);let ok=0;
 for(let j=0;j<ny;j++){const la=v.lat1-(j+.5)*dlat;for(let i=0;i<nx;i++){const lo=v.lon0+(i+.5)*dlon;let [px,py]=merc(lo,la,z);let tx=Math.floor(px/256);if(tx<tx0)tx+=n,px+=n*256;const ty=Math.floor(py/256),T=TM.get(tx+","+ty);if(!T){H[j*nx+i]=NaN;continue}
   const x=Math.min(255,Math.max(0,px-tx*256-.5)),y=Math.min(255,Math.max(0,py-ty*256-.5)),x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(255,x0+1),y1=Math.min(255,y0+1),fx=x-x0,fy=y-y0;
   H[j*nx+i]=(T[y0*256+x0]*(1-fx)+T[y0*256+x1]*fx)*(1-fy)+(T[y1*256+x0]*(1-fx)+T[y1*256+x1]*fx)*fy;ok++}}
 if(ok<nx*ny*.5){busy=false;return}
 /* the Elevation map's own colours for each height (its legend's stops, the same as the zoomed-out picture: tools/build-elev.py);
    sea where the height is below 0 and the picture shows sea (land below sea level, as round the Caspian, stays land) */
 const stops=(S,h)=>{let i=1;while(i<S.length-1&&S[i][0]<h)i++;const a=S[i-1],b=S[i],t=Math.max(0,Math.min(1,(h-a[0])/(b[0]-a[0]))),A=hex(a[1]),B=hex(b[1]);return[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]};
 const seaAt=(i,j)=>{const o=picAt(PI,v.lon0+(i+.5)*dlon,v.lat1-(j+.5)*dlat);return PI.d[o+2]>PI.d[o]+25};
 /* shading: light from the north-west, about as strong as the picture's */
 const mx=dlon*111320*Math.cos(midLat*Math.PI/180),my=dlat*110540,L=[-.5,.5,.707];
 const out=new Uint8ClampedArray(nx*ny*4);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i,h=H[k];if(!isFinite(h))continue;const land=h>=0||!seaAt(i,j);{const lo=v.lon0+(i+.5)*dlon,la=v.lat1-(j+.5)*dlat;if(land&&iceZone(lo,la))continue}
  const hx=(H[j*nx+Math.min(nx-1,i+1)]-H[j*nx+Math.max(0,i-1)])/(2*mx),hy=(H[Math.max(0,j-1)*nx+i]-H[Math.min(ny-1,j+1)*nx+i])/(2*my);
  const ex=land?1.6:1.1,nl=Math.hypot(hx*ex,hy*ex,1),dot=(-hx*ex*L[0]-hy*ex*L[1]+L[2])/nl,sh=Math.max(.55,Math.min(1.35,1+(land?1.1:.8)*(dot-L[2])));
  const c=land?stops(LANDS,Math.max(0,h)):stops(SEAS,Math.min(0,h));out[k*4]=c[0]*sh;out[k*4+1]=c[1]*sh;out[k*4+2]=c[2]*sh;out[k*4+3]=255}
 const G=gv.gl&&gv.gl.gl;if(!G){busy=false;return}const t=P&&P.gl===G?P.tex:G.createTexture();G.activeTexture(G.TEXTURE6);G.bindTexture(G.TEXTURE_2D,t);G.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,false);
 G.texImage2D(G.TEXTURE_2D,0,G.RGBA,nx,ny,0,G.RGBA,G.UNSIGNED_BYTE,new Uint8Array(out.buffer));[G.TEXTURE_MIN_FILTER,G.TEXTURE_MAG_FILTER].forEach(p=>G.texParameteri(G.TEXTURE_2D,p,G.LINEAR));
 G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_S,G.CLAMP_TO_EDGE);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_T,G.CLAMP_TO_EDGE);G.activeTexture(G.TEXTURE0);
 P={gl:G,tex:t,bb:[v.lon0,v.lat1,nx*dlon,ny*dlat],key:sig(gv,key)};try{gv.request?gv.request():gv.render()}catch(e){}}catch(e){console.error(e)}busy=false}
function blur(H,nx,ny,r){const T=new Float32Array(nx*ny),O=new Float32Array(nx*ny);
 for(let j=0;j<ny;j++){let s=0,c=0;for(let i=-r;i<nx+r;i++){const a=i+r,b=i-r-1;if(a>=0&&a<nx&&isFinite(H[j*nx+a])){s+=H[j*nx+a];c++}if(b>=0&&b<nx&&isFinite(H[j*nx+b])){s-=H[j*nx+b];c--}if(i>=0&&i<nx)T[j*nx+i]=c?s/c:NaN}}
 for(let i=0;i<nx;i++){let s=0,c=0;for(let j=-r;j<ny+r;j++){const a=j+r,b=j-r-1;if(a>=0&&a<ny&&isFinite(T[a*nx+i])){s+=T[a*nx+i];c++}if(b>=0&&b<ny&&isFinite(T[b*nx+i])){s-=T[b*nx+i];c--}if(j>=0&&j<ny)O[j*nx+i]=c?s/c:NaN}}return O}
const sig=(gv,key)=>[key,gv.rot[0].toFixed(3),gv.rot[1].toFixed(3),gv.zoom.toFixed(3)].join("|");
/* from when the picture starts to be magnified (it has about 11 pixels a degree), full a little after */
/* the height under the pointer, from the same tiles (zoom 10, about 150 m a pixel); null until that tile has loaded */
const HV=new Map();
window.gfElevHeight=function(ll){if(iceZone(ll[0],ll[1]))return null;const z=10,n=2**z,la=Math.max(-85,Math.min(85,ll[1]))*Math.PI/180,px=(((ll[0]+180)/360)%1+1)%1*n*256,py=(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n*256,tx=Math.floor(px/256),ty=Math.floor(py/256),k=z+"/"+tx+"/"+ty;
 if(!HV.has(k)){HV.set(k,null);tile(k).then(h=>{HV.set(k,h);while(HV.size>40)HV.delete(HV.keys().next().value)})}const T=HV.get(k);if(!T)return null;return T[Math.min(255,Math.floor(py-ty*256))*256+Math.min(255,Math.floor(px-tx*256))]};
window.gfElevPatch=function(G,o){const gv=o&&o.gv;if(!gv||gv._flat||o.key!=="elevation")return null;const ppd=o.s*Math.PI/180,a=Math.max(0,Math.min(1,(ppd/11.4-.9)/.6));if(a<=0)return null;
 if(P&&P.gl!==G.gl)P=null;const k=sig(gv,o.key);
 if((!P||P.key!==k)&&!busy){clearTimeout(timer);timer=setTimeout(function go(){if(gv._moving){timer=setTimeout(go,250);return}if(!busy)build(gv,o.key)},250)}
 return P?{tex:P.tex,bb:P.bb,a}:null};
})();
