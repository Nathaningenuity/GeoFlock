/* GeoFlock add-on: a calmer, clearer Landforms map (Study, and the other landform maps in that view):
   soft shaded relief on the land, a harmonious category palette (map and legend dots), cleaner outlines and labels,
   in the sky (light) and night themes. (The Capitals study map's look lives in geoflock-flatglobe.js, which draws it.) */
(function(){
"use strict";
const NSV="http://www.w3.org/2000/svg";

/* ---------- Landforms: shaded relief from the relief texture (local detail only, so it reads as hill shading) ---------- */
let shadeUrl=null,shadeBusy=false;const shadeWait=[];
function getShade(cb){if(shadeUrl)return cb(shadeUrl);shadeWait.push(cb);if(shadeBusy)return;shadeBusy=true;
  const img=new Image();img.decoding="async";
  img.onload=()=>{try{const W=2000,H=1014,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d",{willReadFrequently:true});
      x.drawImage(img,0,0,W,H);const a=x.getImageData(0,0,W,H).data;x.filter="blur(5px)";x.clearRect(0,0,W,H);x.drawImage(img,0,0,W,H);x.filter="none";const bl=x.getImageData(0,0,W,H);const b=bl.data;
      const L=(d,i)=>.3*d[i]+.59*d[i+1]+.11*d[i+2];
      for(let i=0;i<a.length;i+=4){const v=(L(a,i)-L(b,i))/255;/* -1..1, mostly small */let k=Math.max(-1,Math.min(1,v*5.5));
        if(k<0){b[i]=b[i+1]=b[i+2]=20;b[i+3]=Math.round(-k*215)}else{b[i]=b[i+1]=b[i+2]=255;b[i+3]=Math.round(k*150)}}
      x.putImageData(bl,0,0);cv.toBlob(bb=>{shadeUrl=bb?URL.createObjectURL(bb):cv.toDataURL();shadeWait.splice(0).forEach(f=>f(shadeUrl))},"image/png")}
    catch(e){console.error(e);shadeBusy=false}};
  img.onerror=()=>{shadeBusy=false};img.src="textures/reliefAllMaps.webp"}
let uid=0;
function lfRestyle(map){const svg=map.querySelector(":scope > svg"),z=svg&&svg.querySelector(".lf-z"),land=z&&z.querySelector(".lf-land");if(!land)return;
  map.classList.add("gf-lfmap");
  let im=z.querySelector("image.gf-lfshade");if(im&&im.dataset.d===String(land.getAttribute("d").length))return;
  if(im)im.remove();const id="gfLfLand"+(++uid);let defs=svg.querySelector("defs");if(!defs){defs=document.createElementNS(NSV,"defs");svg.prepend(defs)}
  const cp=document.createElementNS(NSV,"clipPath");cp.id=id;const pp=document.createElementNS(NSV,"path");pp.setAttribute("d",land.getAttribute("d"));cp.appendChild(pp);defs.appendChild(cp);
  im=document.createElementNS(NSV,"image");im.setAttribute("class","gf-lfshade");im.dataset.d=String(land.getAttribute("d").length);
  im.setAttribute("x","0");im.setAttribute("y","-6.688");im.setAttribute("width","2000");im.setAttribute("height","1014.376");im.setAttribute("preserveAspectRatio","none");
  im.setAttribute("clip-path","url(#"+id+")");im.style.pointerEvents="none";land.after(im);
  getShade(u=>im.setAttribute("href",u))}
function lfScan(){const v=document.getElementById("landformsView");if(!v)return;v.querySelectorAll(".lf-map").forEach(lfRestyle)}

/* ---------- watch for the maps being (re)drawn ---------- */
let q=0;const scan=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;try{lfScan()}catch(e){console.error(e)}})};
function start(){new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan()}
if(document.body)start();else document.addEventListener("DOMContentLoaded",start);

/* ---------- styles ---------- */
const LF={/* original colour → calmer, harmonious colour (day / night) */
  "#2f7fc4":["#3d86c6","#6aa9e0"],"#8d5a2b":["#a5643a","#e08a5e"],"#2b2b2b":["#3b3833","#ece6da"],"#d9480f":["#de5a24","#ff8a5c"],
  "#e2ad2c":["#e8b440","#f4d360"],"#2f8a3e":["#6f9a34","#a3cf68"],"#1c64c8":["#2f78c8","#72b4f0"],"#4aa3e0":["#55a9df","#7cc2f0"],
  "#c2259a":["#1690a8","#4fc4dc"],"#e0569f":["#56bfd3","#8fdcec"],"#7d3cc8":["#8a63c9","#b597ec"],"#5b6b82":["#6c7a90","#a4b1c6"],
  "#ffd21f":["#f2c230","#ffd85a"],"#c0392b":["#c6493c","#ff8577"]};
const sel=(pre,col)=>pre+' [style*="--fc:'+col+'"]';
const lfVars=Object.entries(LF).map(([o,[d,n]])=>sel("#landformsView .gf-lfmap",o)+"{--fc:"+d+" !important}"+
  sel("body.sky-night #landformsView .gf-lfmap",o)+"{--fc:"+n+" !important}"+
  '#landformsView .lf-sw[style*="--cc:'+o+'"]{--cc:'+d+' !important}body.sky-night #landformsView .lf-sw[style*="--cc:'+o+'"]{--cc:'+n+' !important}').join("\n");
const css=document.createElement("style");css.id="gf-studymaps-css";css.textContent=`
/* Landforms maps */
#landformsView .gf-lfmap{ background:#dbe9f2; border-color:#d9e3ea; }
#landformsView .gf-lfmap .lf-sea{ fill:#dbe9f2; }
#landformsView .gf-lfmap .lf-land{ fill:#f4f0e6; stroke:#fff; stroke-width:.7; }
#landformsView .gf-lfmap .gf-lfshade{ opacity:1; }
#landformsView .gf-lfmap.lf-relief-on .gf-lfshade{ display:none; }
#landformsView .gf-lfmap path.lf-f.st-study{ fill-opacity:.5; stroke:color-mix(in srgb,var(--fc) 82%,#000); stroke-width:1; stroke-linejoin:round; }
#landformsView .gf-lfmap path.lf-f.st-study:hover{ fill-opacity:.78; }
#landformsView .gf-lfmap path.lf-f.lf-poly[data-id^="pen_"].st-study{ fill-opacity:.24; stroke-dasharray:4 3; }
#landformsView .gf-lfmap path.lf-f[data-id^="sea_"].st-study{ fill:color-mix(in srgb,var(--fc) 22%,#dbe9f2); fill-opacity:1; stroke:color-mix(in srgb,var(--fc) 70%,#fff); stroke-width:.9; }
#landformsView .gf-lfmap .lf-t{ font-family:Inter,"Baloo 2",system-ui,sans-serif; font-weight:700; fill:#33291f; stroke:rgba(255,255,255,.92); stroke-linejoin:round; letter-spacing:.01em; }
#landformsView .gf-lfmap path.lf-f.st-context{ fill:#d9d2c5; }
body.sky-night #landformsView .gf-lfmap{ background:#1a2740; border-color:#2e3c58; box-shadow:0 6px 22px rgba(0,0,0,.35); }
body.sky-night #landformsView .gf-lfmap .lf-sea{ fill:#1a2740; }
body.sky-night #landformsView .gf-lfmap .lf-land{ fill:#33415c; stroke:#25324b; }
body.sky-night #landformsView .gf-lfmap .gf-lfshade{ opacity:.9; }
body.sky-night #landformsView .gf-lfmap path.lf-f.st-study{ fill-opacity:.42; stroke:color-mix(in srgb,var(--fc) 80%,#fff); }
body.sky-night #landformsView .gf-lfmap path.lf-f.st-study:hover{ fill-opacity:.7; }
body.sky-night #landformsView .gf-lfmap path.lf-f[data-id^="sea_"].st-study{ fill:color-mix(in srgb,var(--fc) 25%,#1a2740); stroke:color-mix(in srgb,var(--fc) 70%,#1a2740); }
body.sky-night #landformsView .gf-lfmap path.lf-f.st-context{ fill:#46526b; stroke:#56627b; }
body.sky-night #landformsView .gf-lfmap .lf-t{ fill:#f2eee6; stroke:rgba(18,26,44,.92); }
body.sky-night #landformsView .gf-lfmap .lf-relief-on .lf-land,body.sky-night #landformsView .gf-lfmap.lf-relief-on .lf-land{ fill:transparent; }
${lfVars}
`;
(document.head||document.documentElement).appendChild(css);
})();
