/* GeoFlock: sea ice on the Satellite map (globe, Day & Night globe and flat map).
   The satellite picture (NASA Blue Marble: Next Generation, July) shows the polar oceans as open water. This lays real
   sea ice over it, as an overlay: the satellite pictures themselves are not changed.
   Data: textures/SEAICE_MASK.png (2048 x 410, two polar bands of a plate carrée grid, 0.176° per pixel:
   rows 0–204 are 90°N → 54°N, rows 205–409 are 54°S → 90°S).
     red   = mean sea-ice concentration from the NSIDC Sea Ice Index, version 4 (G02135, monthly concentration
             GeoTIFFs, 25 km polar stereographic). Arctic: mean of August and September 2017–2026 (late summer,
             to match the summer land picture: the central Arctic Ocean is frozen, most coasts open). Antarctic:
             mean of February and March 2017–2026 (the southern summer minimum). Arctic ice not joined to the main
             pack at ≥15% (the index's extent threshold) is dropped: those are microwave land-spillover artefacts in
             Siberian estuaries. Land, as the satellite picture shows it, is masked out.
             Fetterer, F., K. Knowles, W. N. Meier, M. Savoie, A. K. Windnagel (2017, updated daily). Sea Ice Index,
             Version 3/4. NSIDC, Boulder, Colorado, USA. NOAA@NSIDC data: free, no restrictions (US government work).
     green = Antarctic ice shelves (Ross, Ronne-Filchner, Amery…): Natural Earth 1:10m "antarctic ice shelves"
             polygons, public domain.
   Globe: one small RG texture (≈2 MB of GPU memory). The Day & Night shader mixes the ice in before its sunlight and
   clouds (geoflock-daynightglobe.js calls gfSeaIce.patch / gfSeaIce.bind); the plain Day globe gets the same ice from a
   second, alpha-blended pass after GlobeGL.draw, under the clouds. Flat map: two band pictures (north, south) made
   once from the same mask in the flat map's Robinson frame, added as SVG <image> layers above #allMapsSatLayer. */
(function(){
if(typeof GlobeGL==="undefined")return;
const SRC="textures/SEAICE_MASK.png?v=202610301",BAND=36,LAT0=90-BAND;
let maskImg=null,maskP=null;
function req(){try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}}
function load(){if(maskP)return maskP;maskP=new Promise(res=>{const im=new Image;im.onload=()=>{maskImg=im;res(im);req();try{flatSync()}catch(e){}};im.onerror=()=>res(null);im.src=SRC});return maskP}
const satOn=()=>{try{return allMapsColorMode==="satellite"&&allMapsColorModeOn!==false}catch(e){return false}};

/* ---------- the ice, in GLSL (shared by the Day & Night shader and the overlay pass) ---------- */
const GLSL=`
uniform sampler2D uIce; uniform float uIceA;
float iceH(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float iceN(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(iceH(i), iceH(i + vec3(1,0,0)), f.x), mix(iceH(i + vec3(0,1,0)), iceH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(iceH(i + vec3(0,0,1)), iceH(i + vec3(1,0,1)), f.x), mix(iceH(i + vec3(0,1,1)), iceH(i + vec3(1,1,1)), f.x), f.y), f.z); }
/* a fixed rotation, so the octaves' lattices do not line up (no visible grid squares) */
vec3 iceR(vec3 v){ return vec3(0.8*v.y + 0.6*v.z, -0.8*v.x + 0.36*v.y - 0.48*v.z, -0.6*v.x - 0.48*v.y + 0.64*v.z); }
/* uv: the satellite picture's (u, v); p: the point on the unit sphere; fw: the size of a screen pixel on the sphere;
   wat: how much the satellite pixel is water (ice only on water, so islands stay visible). Returns colour and cover. */
vec4 seaIce(vec2 uv, vec3 p, float fw, float wat){
  if(uIceA <= 0.0) return vec4(0.0);
  float lat = 90.0 - uv.y * 180.0;
  vec2 t = lat >= ${LAT0.toFixed(1)} ? vec2(uv.x, (90.0 - lat) / ${(BAND*2).toFixed(1)}) : lat <= -${LAT0.toFixed(1)} ? vec2(uv.x, 0.5 + (-${LAT0.toFixed(1)} - lat) / ${(BAND*2).toFixed(1)}) : vec2(-1.0);
  if(t.x < 0.0) return vec4(0.0);
  vec2 m = texture(uIce, t).rg;
  if(m.r + m.g < 0.004) return vec4(0.0);
  /* texture on the sphere (no seams, no pinching at the poles); fine octaves fade out when smaller than a pixel */
  float w2 = 1.0 - smoothstep(0.25, 0.8, 260.0 * fw), w3 = 1.0 - smoothstep(0.25, 0.8, 900.0 * fw);
  float n1 = iceN(p * 70.0);
  vec3 q = iceR(p * 260.0); q += (vec3(iceN(q * 0.31 + 11.0), iceN(q * 0.31 + 23.0), iceN(q * 0.31 + 37.0)) - 0.5) * 2.4;
  float n2 = mix(0.5, iceN(q), w2), n3 = mix(0.5, iceN(iceR(iceR(p * 900.0)) + q * 0.9), w3);
  float n = n1 * 0.5 + n2 * 0.32 + n3 * 0.18;
  float c = m.r;
  /* the pack: solid where concentration is high; toward the edge it breaks into floes and fades into the water */
  float brk = n1 * 0.15 + n2 * 0.55 + n3 * 0.3;
  float a = smoothstep(0.2, 0.55, c + (brk - 0.5) * 0.6 * (1.0 - c * 0.5));
  vec3 ice = vec3(0.80, 0.85, 0.90) * (0.88 + 0.18 * n1);
  /* summer melt ponds: a blue-grey mottling */
  float pond = (1.0 - smoothstep(0.32, 0.5, n2)) * w2;
  ice = mix(ice, vec3(0.60, 0.72, 0.84), pond * 0.45);
  ice = mix(vec3(0.56, 0.66, 0.76) * (0.9 + 0.2 * n), ice, smoothstep(0.2, 0.8, c));
  /* leads: faint darker cracks inside the pack */
  float ld = (1.0 - smoothstep(0.0, 0.05, abs(n2 - 0.5))) * w2 * smoothstep(0.55, 0.95, c);
  ice *= 1.0 - 0.1 * ld;
  a *= mix(1.0, smoothstep(0.05, 0.45, wat), 0.85);
  /* ice shelves: smooth, bright, faintly blue, joined to the ice sheet's white */
  float s = smoothstep(0.2, 0.7, m.g);
  vec3 sh = vec3(0.90, 0.925, 0.95) * (0.96 + 0.05 * n1);
  vec3 col = mix(ice, sh, s);
  a = max(a * 0.96, s * 0.97);
  return vec4(col, a * uIceA);
}
`;
/* the Day & Night shader's two marks: /*ICE_DEF*\/ (before main) and /*ICE_MIX*\/ (after its sea colouring) */
function patch(fs){return fs.replace("/*ICE_DEF*/",GLSL).replace("/*ICE_MIX*/",
 "{ vec3 ip = nrm(phi, lam); vec4 si = seaIce(vec2(u, v), ip, length(fwidth(ip)), water); day = mix(day, si.rgb, si.a); }")}
/* the mask's GPU copy, per GL context */
function tex(G){if(G._iceTex)return G._iceTex;if(!maskImg){load();return null}const gl=G.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RG8,gl.RG,gl.UNSIGNED_BYTE,maskImg)}catch(e){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,maskImg)}
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return G._iceTex=t}
/* binds the mask for a program that includes GLSL (unit 4); marks this frame's ice as drawn */
function bind(G,pr,unit){const gl=G.gl,t=tex(G);unit=unit||4;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
 gl.uniform1i(gl.getUniformLocation(pr,"uIce"),unit);gl.uniform1f(gl.getUniformLocation(pr,"uIceA"),t?1:0);gl.activeTexture(gl.TEXTURE0);G._iceDone=true}

/* ---------- the plain Day globe: an overlay pass ---------- */
const FS=`#version 300 es
precision highp float;
uniform vec2 uC; uniform float uS; uniform float uF; uniform float uLam0; uniform float uSp; uniform float uCp; uniform vec2 uRoll;
uniform float uSpace; uniform sampler2D uSat; uniform sampler2D uCl; uniform float uClA;
out vec4 o;
${GLSL}
float gmin(float a, float b){ return abs(a) < abs(b) ? a : b; }
void main(){
  vec2 f = gl_FragCoord.xy;
  float dd = length(f - uC); if(dd > uF) discard;
  float x0 = (f.x - uC.x) / uS, y0 = (f.y - uC.y) / uS;
  float xx = x0*uRoll.x + y0*uRoll.y, yy = -x0*uRoll.y + y0*uRoll.x;
  float r2 = xx*xx + yy*yy; if(r2 > 1.0) discard;
  float z = sqrt(1.0 - r2);
  float phi = asin(clamp(z*uSp + yy*uCp, -1.0, 1.0));
  float lam = uLam0 + atan(xx, z*uCp - yy*uSp);
  float uc = lam / 6.283185307 + 0.5, v = 0.5 - phi / 3.141592654;
  float u = fract(uc), u2 = fract(uc + 0.5);
  vec2 gx = vec2(gmin(dFdx(uc), dFdx(u2)), dFdx(v)), gy = vec2(gmin(dFdy(uc), dFdy(u2)), dFdy(v));
  vec3 ip = vec3(cos(phi)*cos(lam), cos(phi)*sin(lam), sin(phi)); float fw = length(fwidth(ip));
  vec3 day = textureGrad(uSat, vec2(u, v), gx, gy).rgb;
  float lum = dot(day, vec3(0.3, 0.55, 0.15));
  float water = smoothstep(0.015, 0.07, day.b - max(day.r, day.g*0.82)) * (1.0 - smoothstep(0.28, 0.5, lum));
  vec4 si = seaIce(vec2(u, v), ip, fw, water);
  if(si.a < 0.002) discard;
  vec3 col = si.rgb; float a = si.a;
  /* the clouds stay on top: as in the globe shader */
  if(uClA > 0.0){ float cl = smoothstep(0.1, 0.86, textureGrad(uCl, vec2(uc, v), gx, gy).r); float cs = smoothstep(0.1, 0.86, textureGrad(uCl, vec2(uc + 0.0018, v - 0.0014), gx, gy).r);
    col *= 1.0 - 0.3 * cs * uClA; a *= 1.0 - cl * 0.95 * uClA; }
  if(uSpace > 0.5){ vec3 n = vec3(xx, yy, z); float d = max(dot(n, normalize(vec3(-0.42, 0.5, 0.76))), 0.0);
    col *= 0.5 + 0.62 * d; col = mix(col, vec3(0.45, 0.68, 1.0), pow(1.0 - z, 2.4) * 0.6); }
  o = vec4(col, a);
}`;
const VS="#version 300 es\nin vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
function prog(G){if(G._iceP!==undefined)return G._iceP;G._iceP=null;const gl=G.gl;
 try{const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.bindAttribLocation(pr,gl.getAttribLocation(G.prog,"p"),"p");gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  const u={};["uF","uC","uS","uLam0","uSp","uCp","uRoll","uSpace","uSat","uCl","uClA"].forEach(n=>u[n]=gl.getUniformLocation(pr,n));G._iceP={pr,u}}
 catch(e){console.error("Sea ice:",e)}return G._iceP}
{const _draw=GlobeGL.prototype.draw;GlobeGL.prototype.draw=function(o){this._iceDone=false;const r=_draw.apply(this,arguments);
 try{if(o&&!this._iceDone&&this.tex.satellite&&o.tex===this.tex.satellite&&!(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.gl===this&&amGlobe._flat)){
  const t=tex(this),P=t&&prog(this);
  if(P){const gl=this.gl,u=P.u;gl.useProgram(P.pr);
   gl.uniform2f(u.uC,o.cx,o.cy);gl.uniform1f(u.uS,o.s);gl.uniform1f(u.uF,o.frame||1e9);gl.uniform1f(u.uLam0,o.lam0);
   {const g=(o.roll||0)*Math.PI/180;gl.uniform2f(u.uRoll,Math.cos(g),Math.sin(g))}gl.uniform1f(u.uSp,Math.sin(o.phi0));gl.uniform1f(u.uCp,Math.cos(o.phi0));gl.uniform1f(u.uSpace,o.space?1:0);
   const ct=o.clouds&&this.cloudTex?this.cloudTex():null;gl.uniform1f(u.uClA,ct?o.clouds:0);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,ct||null);gl.uniform1i(u.uCl,3);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.tex.list[0]);gl.uniform1i(u.uSat,0);
   bind(this,P.pr,4);
   gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ZERO,gl.ONE);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disable(gl.BLEND);gl.useProgram(this.prog)}}}
 catch(e){console.error(e)}return r}}

/* ---------- the flat map: two band pictures in the Robinson frame ---------- */
const fract=x=>x-Math.floor(x);
function hJ(x,y,z){x=fract(x*.3183099+.1)*17;y=fract(y*.3183099+.1)*17;z=fract(z*.3183099+.1)*17;return fract(x*y*z*(x+y+z))}
function nJ(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let fx=x-ix,fy=y-iy,fz=z-iz;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
 const L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(hJ(ix,iy,iz),hJ(ix+1,iy,iz),fx),L(hJ(ix,iy+1,iz),hJ(ix+1,iy+1,iz),fx),fy),L(L(hJ(ix,iy,iz+1),hJ(ix+1,iy,iz+1),fx),L(hJ(ix,iy+1,iz+1),hJ(ix+1,iy+1,iz+1),fx),fy),fz)}
const rJ=(x,y,z)=>[.8*y+.6*z,-.8*x+.36*y-.48*z,-.6*x-.48*y+.64*z];
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const FLAT={urls:null,busy:false};
function flatBuild(){if(FLAT.urls||FLAT.busy||!maskImg||typeof d3==="undefined"||!d3.geoRobinson)return;FLAT.busy=true;
 try{const MW=maskImg.naturalWidth,MH=maskImg.naturalHeight,mc=document.createElement("canvas");mc.width=MW;mc.height=MH;const mx=mc.getContext("2d",{willReadFrequently:true});mx.drawImage(maskImg,0,0);
  const M=mx.getImageData(0,0,MW,MH).data;mc.width=mc.height=0;
  const ROB=d3.geoRobinson().scale(318.31).translate([1e3,500.5]),K=1.5,out=[],pend=[];/* 1.5 px per map unit: 3000 px wide */
  const samp=(lon,lat)=>{let fy;if(lat>=LAT0)fy=(90-lat)/BAND*(MH/2)-.5;else if(lat<=-LAT0)fy=MH/2+(-LAT0-lat)/BAND*(MH/2)-.5;else return null;
   const fx=(lon+180)/360*MW-.5,x0=Math.floor(fx),y0=Math.max(0,Math.min(MH-2,Math.floor(fy))),tx=fx-x0,ty=Math.min(1,Math.max(0,fy-y0)),xa=(x0%MW+MW)%MW,xb=(xa+1)%MW;
   const g=(x,y,c)=>M[(y*MW+x)*4+c],v=c=>(g(xa,y0,c)*(1-tx)+g(xb,y0,c)*tx)*(1-ty)+(g(xa,y0+1,c)*(1-tx)+g(xb,y0+1,c)*tx)*ty;return[v(0)/255,v(1)/255]};
  [[90,LAT0],[-LAT0,-90]].forEach(([la0,la1])=>{const y0=ROB([0,la0])[1],y1=ROB([0,la1])[1],W=Math.round(2e3*K),H=Math.ceil((y1-y0)*K),c=document.createElement("canvas");c.width=W;c.height=H;
   const x=c.getContext("2d"),id=x.createImageData(W,H),D=id.data,fw=1/(318.31*K);
   for(let py=0;py<H;py++){const my=y0+(py+.5)/K;for(let px=0;px<W;px++){const ll=ROB.invert([(px+.5)/K,my]);if(!ll||!(Math.abs(ll[0])<=180))continue;
    const m=samp(ll[0],ll[1]);if(!m||m[0]+m[1]<.004)continue;
    const la=ll[1]*Math.PI/180,lo=ll[0]*Math.PI/180,X=Math.cos(la)*Math.cos(lo),Y=Math.cos(la)*Math.sin(lo),Z=Math.sin(la);
    const w2=1-ss(.25,.8,260*fw),w3=1-ss(.25,.8,900*fw);const n1=nJ(X*70,Y*70,Z*70);
    let [qx,qy,qz]=rJ(X*260,Y*260,Z*260);const ox=nJ(qx*.31+11,qy*.31+11,qz*.31+11)-.5,oy=nJ(qx*.31+23,qy*.31+23,qz*.31+23)-.5,oz=nJ(qx*.31+37,qy*.31+37,qz*.31+37)-.5;qx+=ox*2.4;qy+=oy*2.4;qz+=oz*2.4;
    const n2=w2?.5+(nJ(qx,qy,qz)-.5)*w2:.5;let n3=.5;if(w3){const r=rJ(...rJ(X*900,Y*900,Z*900));n3=.5+(nJ(r[0]+qx*.9,r[1]+qy*.9,r[2]+qz*.9)-.5)*w3}
    const n=n1*.5+n2*.32+n3*.18,cc=m[0],brk=n1*.15+n2*.55+n3*.3;let a=ss(.2,.55,cc+(brk-.5)*.6*(1-cc*.5));
    const k=.88+.18*n1,k2=.9+.2*n,pd=(1-ss(.32,.5,n2))*w2*.45,mix=ss(.2,.8,cc);
    const ir=.8*k+(.6-.8*k)*pd,ig=.85*k+(.72-.85*k)*pd,ib=.9*k+(.84-.9*k)*pd;
    let r=.56*k2+(ir-.56*k2)*mix,gg=.66*k2+(ig-.66*k2)*mix,b=.76*k2+(ib-.76*k2)*mix;
    const ld=(1-ss(0,.05,Math.abs(n2-.5)))*w2*ss(.55,.95,cc),dk=1-.1*ld;r*=dk;gg*=dk;b*=dk;
    const s=ss(.2,.7,m[1]),sk=.96+.05*n1;r+=(.9*sk-r)*s;gg+=(.925*sk-gg)*s;b+=(.95*sk-b)*s;a=Math.max(a*.96,s*.97);
    const i=(py*W+px)*4;D[i]=r*255;D[i+1]=gg*255;D[i+2]=b*255;D[i+3]=a*255}}
   x.putImageData(id,0,0);out.push({x:0,y:y0,w:2e3,h:y1-y0});pend.push(new Promise(res=>c.toBlob(bl=>{res(bl?URL.createObjectURL(bl):null);c.width=c.height=0},"image/png")))});
  Promise.all(pend).then(urls=>{urls.forEach((u,i)=>out[i].h_=u);FLAT.urls=out.map(o=>Object.assign({href:o.h_},o));FLAT.busy=false;flatSync()})}
 catch(e){console.error("Sea ice (flat):",e);FLAT.busy=false}}
function flatSync(){try{const wrap=document.getElementById("allMapsWrap"),svg=wrap&&wrap.querySelector("svg");if(!svg)return;const want=satOn();
  if(want&&!FLAT.urls){if(maskImg)setTimeout(flatBuild,30);else load();}
  ["gfSeaIceN","gfSeaIceS"].forEach((id,i)=>{let img=svg.querySelector("#"+id);const d=FLAT.urls&&FLAT.urls[i];
   if(!img&&want&&d&&d.href){img=document.createElementNS("http://www.w3.org/2000/svg","image");img.id=id;img.setAttribute("href",d.href);img.setAttribute("x","0");
    img.setAttribute("y",String(d.y));img.setAttribute("width","2000");img.setAttribute("height",String(d.h));img.setAttribute("preserveAspectRatio","none");img.style.pointerEvents="none"}
   if(!img)return;
   /* order: above the satellite picture, below the clouds */
   const sat=svg.querySelector("#allMapsSatLayer"),cl=svg.querySelector("#allMapsCloudLayer"),clEl=cl&&(cl._spinFo||cl);
   if(clEl&&clEl.parentNode){if(!img.parentNode||!(img.compareDocumentPosition(clEl)&Node.DOCUMENT_POSITION_FOLLOWING))clEl.before(img)}
   else if(!img.parentNode){if(sat)(sat._spinFo||sat).after(img);else svg.insertBefore(img,svg.firstChild)}
   if(i===1){const n=svg.querySelector("#gfSeaIceN");if(n&&n.nextSibling!==img)n.after(img)}
   img.style.display=want?"":"none"});
  try{if(typeof spinStaleCheck==="function")spinStaleCheck(svg)}catch(e){}
  try{if(window.gfFlatOn&&gfFlatOn())req()}catch(e){}}catch(e){console.error(e)}}

/* ---------- hooks: when the Satellite map is chosen or redrawn ---------- */
if(typeof applyAllMapsColorMode==="function"){const _ap=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_ap.apply(this,arguments);try{if(satOn()){load();setTimeout(flatSync,0)}else flatSync()}catch(e){}return r}}
if(typeof amGlobeSync==="function"){const _s=amGlobeSync;amGlobeSync=function(){const r=_s.apply(this,arguments);try{if(satOn())load();flatSync()}catch(e){}return r}}
if(typeof cloudFlatSync==="function"){const _c=cloudFlatSync;cloudFlatSync=function(){const r=_c.apply(this,arguments);try{flatSync()}catch(e){}return r}}
/* the legend's credit line */
if(typeof allMapsLegendHTML==="function"){const _lg=allMapsLegendHTML;allMapsLegendHTML=function(){const h=_lg.apply(this,arguments);try{if(allMapsColorMode==="satellite"&&typeof h==="string"&&h.indexOf("Sea ice:")<0)
 return h.replace(/(<span class="legend-note">[^]*?)(<\/span>)/,'$1 Sea ice: NSIDC Sea Ice Index (mean concentration, Aug–Sep in the Arctic, Feb–Mar around Antarctica, 2017–2026); ice shelves: Natural Earth.$2')}catch(e){}return h}}
window.gfSeaIce={patch,bind,tex,load,flatSync,glsl:GLSL};
try{if(satOn())load()}catch(e){}
})();
