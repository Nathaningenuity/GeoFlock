/* GeoFlock: map fixes.
   1. Spun flat maps: the raster is redrawn in strips, and where a strip meets the old 180° edge it samples the rim of the
      source picture, which fades to transparent, leaving a dotted line. Before a picture is used for spinning, each row's
      edge colour is carried a few pixels out past the rim, so the edge is solid wherever it is sampled. */
(function(){
if(typeof spinImg==="function"){const _si=spinImg,done=new Map();
 spinImg=function(href){if(done.has(href))return done.get(href);const p=_si.apply(this,arguments).then(im=>{try{return padEdges(im)}catch(e){console.error(e);return im}});done.set(href,p);return p}}
function padEdges(im){const W=im.naturalWidth||im.width,H=im.naturalHeight||im.height;if(!W||!H)return im;
 const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 /* the oval's rim lies in the outer quarter on each side (Robinson is about half as wide at the poles) */
 /* rows whose rim is not solid picture (for example a see-through gap) are left alone, below */
 const S=Math.ceil(W*.27),P=10;
 [[0,S,1],[W-S,S,-1]].forEach(([x0,w,dir])=>{const D=x.getImageData(x0,0,w,H),d=D.data;
  for(let y=0;y<H;y++){const row=y*w*4;let e=-1;
   if(dir===1){for(let i=0;i<w;i++)if(d[row+i*4+3]>=250){e=i;break}}else{for(let i=w-1;i>=0;i--)if(d[row+i*4+3]>=250){e=i;break}}
   if(e<0)continue;/* the outermost opaque pixels are often darkened by smoothing too: take the colour from a little way in */const ii=e+dir*9;if(ii<0||ii>=w)continue;{let solid=true;for(let k=0;k<=12;k++){const j=e+dir*k;if(j<0||j>=w||d[row+j*4+3]<250){solid=false;break}}if(!solid)continue}const o=row+ii*4;for(let k=0;k<8;k++){const q=row+(e+dir*k)*4;d[q]=d[o];d[q+1]=d[o+1];d[q+2]=d[o+2];d[q+3]=255}
   for(let k=1;k<=P;k++){const i=e-dir*k;if(i<0||i>=w)break;const q=row+i*4;d[q]=d[o];d[q+1]=d[o+1];d[q+2]=d[o+2];d[q+3]=255}}
  x.putImageData(D,x0,0)});
 c.naturalWidth=W;c.naturalHeight=H;return c}
})();
/* 2. Places region frames: Europe, Asia and Africa use the standard frame cut at the antimeridian; the Americas sit in the
      middle (cut through Asia, at 100°E); Oceania keeps its own Pacific-centred frame. The zoom box follows the frame. */
(function(){function hook(){if(window._gfSpinRegions||typeof spinRegionDl!=="function")return;window._gfSpinRegions=1;const _s=spinRegionDl;
 spinRegionDl=function(){try{const r=typeof activeRegion==="undefined"?"All":activeRegion;if(r==="Europe"||r==="Asia"||r==="Africa")return 0;if(r==="Americas"||r==="North America"||r==="South America")return 80}catch(e){}return _s.apply(this,arguments)}}
 hook();document.addEventListener("DOMContentLoaded",hook);setTimeout(hook,1000)})();
/* 3. Tour stops that are about clouds show them even if the Clouds switch was turned off earlier */
(function(){if(typeof cloudsOn!=="function")return;const _c=cloudsOn;
 cloudsOn=function(){try{if(typeof ps!=="undefined"&&ps&&(psSteps()[ps.i]||{}).clouds){if(typeof cloudsLoad==="function")cloudsLoad();return true}}catch(e){}return _c.apply(this,arguments)}})();
