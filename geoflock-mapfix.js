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
/* 2. Places region frames: the world, Europe, Asia and Africa use the standard frame (0° in the middle, cut at the 180° meridian);
      the Americas sit in the middle (cut through Asia, at 100°E); Oceania keeps its own Pacific-centred frame. */
(function(){function hook(){if(window._gfSpinRegions||typeof spinRegionDl!=="function")return;window._gfSpinRegions=1;const _s=spinRegionDl;
 spinRegionDl=function(){try{const r=typeof activeRegion==="undefined"?"All":activeRegion;if(r==="Americas"||r==="North America"||r==="South America")return 80;if(r==="Oceania")return _s.apply(this,arguments);return 0}catch(e){}return _s.apply(this,arguments)}}
 hook();document.addEventListener("DOMContentLoaded",hook);setTimeout(hook,1000)})();
/* 3. Tour stops that are about clouds show them even if the Clouds switch was turned off earlier */
(function(){if(typeof cloudsOn!=="function")return;const _c=cloudsOn;
 cloudsOn=function(){try{if(typeof ps!=="undefined"&&ps&&(psSteps()[ps.i]||{}).clouds){if(typeof cloudsLoad==="function")cloudsLoad();return true}}catch(e){}return _c.apply(this,arguments)}})();
/* 4. Picking a region (in Places or Capitals) gives that region's frame again, even if the map was dragged sideways earlier */
(function(){if(typeof bboxForActiveSelection!=="function")return;let last=null;const _b=bboxForActiveSelection;
 bboxForActiveSelection=function(){try{const r=(typeof activeRegion==="undefined"?"All":activeRegion)+"|"+(typeof activeSub==="undefined"?"":activeSub);if(r!==last){last=r;if(typeof spinUser!=="undefined"&&spinUser.W&&!(typeof spinQuizOn==="function"&&spinQuizOn())){spinUser.W=false;const want=spinRegionDl();if(Math.abs(SPIN.W.dl-want)>1e-6)spinTo("W",want);try{spinHomeSync()}catch(e){}}}}catch(e){console.error(e)}return _b.apply(this,arguments)}})();
document.addEventListener("click",e=>{try{if(e.target.closest&&e.target.closest("#regionRow .chip")&&typeof spinUser!=="undefined")spinUser.W=false}catch(_){}},true);
/* 5. Satellite: rivers and lakes can be switched on (hover names them) but start off, and stay off in tours,
      since they can't be seen from space */
(function(){try{
 if(typeof ALLMAPS_MODE_DEFAULTS!=="undefined"&&ALLMAPS_MODE_DEFAULTS.satellite)ALLMAPS_MODE_DEFAULTS.satellite.rivers=false;
 if(typeof allMapsRiversByMode!=="undefined")allMapsRiversByMode.satellite=false;
 if(typeof ALLMAPS_LAKES_DEFAULT!=="undefined")ALLMAPS_LAKES_DEFAULT.satellite=false;
 if(typeof ALLMAPS_RIVER_HOVER_MODES!=="undefined")ALLMAPS_RIVER_HOVER_MODES.add("satellite");
 const inSatTour=()=>typeof ps!=="undefined"&&ps&&typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="satellite";
 if(typeof allMapsRiversOn==="function"){const _r=allMapsRiversOn;allMapsRiversOn=function(){return inSatTour()?false:_r.apply(this,arguments)}}
 if(typeof allMapsLakesOn==="function"){const _l=allMapsLakesOn;allMapsLakesOn=function(){return inSatTour()?false:_l.apply(this,arguments)}}
 /* re-apply when a tour starts or ends */
 const re=()=>setTimeout(()=>{try{const w=document.getElementById("allMapsWrap");if(typeof applyAllMapsLakesBorders==="function")applyAllMapsLakesBorders(w);if(w)w.classList.toggle("rivers-hidden",!allMapsRiversOn());const t=document.getElementById("allMapsRiversToggle");if(t)t.checked=allMapsRiversOn();if(typeof amGlobe!=="undefined"&&amGlobe)(amGlobe.request||amGlobe.render).call(amGlobe)}catch(e){}},60);
 if(typeof psLaunchTour==="function"){const _p=psLaunchTour;psLaunchTour=function(){const r=_p.apply(this,arguments);re();return r}}
 if(typeof psEnd==="function"){const _e=psEnd;psEnd=function(){const r=_e.apply(this,arguments);re();return r}}
}catch(e){console.error(e)}})();
/* 6. A hovered lake stays blue: a clear, slightly deeper blue with its outline, instead of the near-clear tint that let the
      land picture underneath show through */
(function(){const st=document.createElement("style");st.textContent=`
html:root body :is(#allMapsWrap,#atlasStudyMapWrap,#worldMapWrap,#gfNoSuchId,.map-wrap) svg path:is(.map-lake,.map-lake-minor):is(.lake-hover,:hover){ fill:rgba(88,158,222,.72) !important; fill-opacity:1 !important; filter:none !important; stroke:#0f4f86 !important; stroke-width:1.4px !important; vector-effect:non-scaling-stroke; }
html:root body :is(#allMapsWrap,#atlasStudyMapWrap,#worldMapWrap,#gfNoSuchId,.map-wrap).sat-mode svg path:is(.map-lake,.map-lake-minor):is(.lake-hover,:hover){ fill:rgba(40,96,170,.82) !important; stroke:#cfe9ff !important; stroke-width:1.6px !important; }
html:root body #allMapsWrap.sat-mode svg path.water-casing{ stroke:rgba(10,30,60,.55) !important; stroke-width:2.5px !important; }`;document.head.appendChild(st)})();
