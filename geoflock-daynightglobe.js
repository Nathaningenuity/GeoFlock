/* GeoFlock: the Day & Night globe.
   A second globe view of the Satellite map: the sunlit half shows the satellite picture (seas a little lighter and more
   turquoise), the dark half shows the City Lights picture, with a soft twilight band (about 10° of sun angle) and a faint
   warm glow along the line between them. The cloud layer is bright white by day and dark and faint by night, dimming the
   city lights under it.
   How it works: the globe is drawn by a WebGL fragment shader (GlobeGL). While this view is on and the globe is drawing the
   satellite picture, GlobeGL.draw uses a second shader program, on the same context, that samples the satellite, night and
   cloud textures the app already loads (no new pictures, no extra canvases) and mixes them per pixel by the angle between
   the surface and the sun. The slider below the globe moves the sun: its longitude (as a UTC time of day) and, with the
   season slider, its latitude (±23.4°). It starts where the sun really is now (gfDayNight.subsolar).
   Globe only: choosing the flat map, another map or a tour turns it off and leaves the ordinary Satellite map. */
(function(){
if(typeof GlobeGL==="undefined"||typeof GlobeView==="undefined"||typeof amGlobeSync!=="function"||typeof GLOBE_TEX==="undefined")return;
const D2R=Math.PI/180,TILT=23.44;
const S={on:false,lon:0,lat:0,eot:0,play:null};
const subsolar=t=>{try{return window.gfDayNight.subsolar(t)}catch(e){return[0,0]}};
/* minutes past 00:00 UTC that a sun longitude stands for; eot carries the gap between the real sun and the mean sun
   so that "now" reads the clock time */
const lonToMin=lon=>{let m=(12-(lon-S.eot)/15)*60;return((m%1440)+1440)%1440};
const minToLon=m=>{let l=(12-m/60)*15+S.eot;return((l+540)%360+360)%360-180};
function toNow(){const now=Date.now(),s=subsolar(now),d=new Date(now),mins=d.getUTCHours()*60+d.getUTCMinutes()+d.getUTCSeconds()/60;
 let e=s[0]-(12-mins/60)*15;e=((e+540)%360+360)%360-180;S.eot=e;S.lon=s[0];S.lat=s[1]}
toNow();
function req(){try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}}

/* ---------- the shader ---------- */
const FS=`#version 300 es
precision highp float;
uniform vec2 uC; uniform float uS; uniform float uF; uniform float uLam0; uniform float uSp; uniform float uCp; uniform vec2 uRoll;
uniform float uSpace; uniform sampler2D uSat; uniform sampler2D uNight; uniform sampler2D uCl; uniform float uClA; uniform vec3 uSun;
out vec4 o;
float gmin(float a, float b){ return abs(a) < abs(b) ? a : b; }
vec3 nrm(float phi, float lam){ return vec3(cos(phi)*cos(lam), cos(phi)*sin(lam), sin(phi)); }
void main(){
  vec2 f = gl_FragCoord.xy;
  float dd = length(f - uC); if(dd > uF * (uSpace > 0.5 ? 1.045 : 1.0)) discard;
  float x0 = (f.x - uC.x) / uS, y0 = (f.y - uC.y) / uS;
  float xx = x0*uRoll.x + y0*uRoll.y, yy = -x0*uRoll.y + y0*uRoll.x;
  float r2 = xx*xx + yy*yy;
  if(r2 > 1.0){
    if(uSpace < 0.5) discard;
    /* the air round the rim: blue where the sun shines on it, warm at the terminator, gone on the night side */
    float rr = sqrt(r2), t = rr - 1.0; float lx = xx/rr, ly = yy/rr;
    float phi = asin(clamp(ly*uCp, -1.0, 1.0)); float lam = uLam0 + atan(lx, -ly*uSp);
    float s = dot(nrm(phi, lam), uSun);
    float lit = smoothstep(-0.25, 0.15, s);
    vec3 c = mix(vec3(1.0, 0.55, 0.25), vec3(0.42, 0.66, 1.0), smoothstep(-0.05, 0.3, s));
    o = vec4(c, exp(-t * 30.0) * 0.8 * lit); return;
  }
  if(dd > uF) discard;
  float z = sqrt(1.0 - r2);
  float phi = asin(clamp(z*uSp + yy*uCp, -1.0, 1.0));
  float lam = uLam0 + atan(xx, z*uCp - yy*uSp);
  float uc = lam / 6.283185307 + 0.5, v = 0.5 - phi / 3.141592654;
  float u = fract(uc), u2 = fract(uc + 0.5);
  vec2 gx = vec2(gmin(dFdx(uc), dFdx(u2)), dFdx(v)), gy = vec2(gmin(dFdy(uc), dFdy(u2)), dFdy(v));
  vec3 day = textureGrad(uSat, vec2(u, v), gx, gy).rgb;
  vec3 ngt = textureGrad(uNight, vec2(u, v), gx, gy).rgb;
  float s = dot(nrm(phi, lam), uSun);
  /* the sea by day: blue-dominant, dark, low-saturation pixels get lighter and more turquoise */
  float lum = dot(day, vec3(0.3, 0.55, 0.15));
  float water = smoothstep(0.015, 0.07, day.b - max(day.r, day.g*0.82)) * (1.0 - smoothstep(0.28, 0.5, lum));
  vec3 sea = day * vec3(1.06, 1.32, 1.16) + vec3(0.008, 0.045, 0.05);
  day = mix(day, sea, water);
  /* a little shading towards the terminator, as the sun gets low */
  day *= mix(0.62, 1.0, smoothstep(-0.05, 0.45, s));
  float dayMix = smoothstep(-0.18, 0.10, s);
  float cl = 0.0;
  if(uClA > 0.0){ cl = smoothstep(0.1, 0.86, textureGrad(uCl, vec2(uc, v), gx, gy).r) * uClA;
    float cs = smoothstep(0.1, 0.86, textureGrad(uCl, vec2(uc + 0.0018, v - 0.0014), gx, gy).r) * uClA;
    day *= 1.0 - 0.3 * cs; day = mix(day, vec3(0.97, 0.98, 1.0) * mix(0.62, 1.0, smoothstep(-0.05, 0.45, s)), cl * 0.95);
    ngt = ngt * (1.0 - cl * 0.7) + cl * 0.06; }
  vec3 col = mix(ngt, day, dayMix);
  /* the warm glow along the terminator, a touch stronger on the clouds that catch it */
  col += vec3(1.0, 0.48, 0.16) * exp(-pow(s / 0.08, 2.0)) * (0.17 + 0.16 * cl + 0.04 * dot(day, vec3(0.33)));
  if(uSpace > 0.5){ col = mix(col, vec3(0.45, 0.68, 1.0), pow(1.0 - z, 2.4) * 0.6 * smoothstep(-0.2, 0.2, s)); }
  o = vec4(col, 1.0);
}`;
const VS="#version 300 es\nin vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
function prog(G){if(G._dng!==undefined)return G._dng;G._dng=null;const gl=G.gl;
 try{const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.bindAttribLocation(pr,gl.getAttribLocation(G.prog,"p"),"p");gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  const u={};["uF","uC","uS","uLam0","uSp","uCp","uRoll","uSpace","uSat","uNight","uCl","uClA","uSun"].forEach(n=>u[n]=gl.getUniformLocation(pr,n));G._dng={pr,u}}
 catch(e){console.error("Day & Night globe:",e)}return G._dng}
const nightReady=()=>{try{return GLOBE_TEX.night?globeImages("night",()=>req()):null}catch(e){return null}};
{const _draw=GlobeGL.prototype.draw;GlobeGL.prototype.draw=function(o){
 try{if(o&&S.on&&typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.gl===this&&!amGlobe._flat&&this.tex.satellite&&o.tex===this.tex.satellite){
  const imgs=nightReady(),P=imgs&&prog(this);
  if(P){const gl=this.gl,u=P.u,N=this.texture("night",imgs);
   gl.viewport(0,0,gl.canvas.width,gl.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(P.pr);
   gl.uniform2f(u.uC,o.cx,o.cy);gl.uniform1f(u.uS,o.s);gl.uniform1f(u.uF,o.frame||1e9);gl.uniform1f(u.uLam0,o.lam0);
   {const g=(o.roll||0)*D2R;gl.uniform2f(u.uRoll,Math.cos(g),Math.sin(g))}gl.uniform1f(u.uSp,Math.sin(o.phi0));gl.uniform1f(u.uCp,Math.cos(o.phi0));gl.uniform1f(u.uSpace,o.space?1:0);
   const la=S.lat*D2R,lo=S.lon*D2R;gl.uniform3f(u.uSun,Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la));
   let ct=null;try{if(cloudsOn()){cloudsLoad();ct=this.cloudTex()}}catch(e){}
   gl.uniform1f(u.uClA,ct?1:0);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,ct||null);gl.uniform1i(u.uCl,3);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.tex.list[0]);gl.uniform1i(u.uSat,0);
   gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,N.list[0]);gl.uniform1i(u.uNight,1);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return}}}catch(e){console.error(e)}
 return _draw.apply(this,arguments)}}
/* the night picture's GPU copy is let go on leaving, unless City Lights is the map showing */
function freeNight(){try{const G=amGlobe&&amGlobe.gl;if(!G||!G.tex.night||allMapsColorMode==="night")return;G.tex.night.list.forEach(t=>{try{G.gl.deleteTexture(t)}catch(e){}});delete G.tex.night}catch(e){}}

/* the sun, a small disc where it is overhead */
{const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){
 try{if(S.on&&typeof amGlobe!=="undefined"&&this===amGlobe&&!this._flat){const s=[S.lon,S.lat],c=[-this.rot[0],-this.rot[1]];
  if(d3.geoDistance(s,c)<Math.PI/2-.02){const q=p(s);if(q){ctx.save();const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],16);g.addColorStop(0,"rgba(255,236,170,.75)");g.addColorStop(1,"rgba(255,210,90,0)");
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],16,0,7);ctx.fill();ctx.fillStyle="#ffd34d";ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(q[0],q[1],5,0,7);ctx.fill();ctx.stroke();ctx.restore()}}}}
 catch(e){console.error(e)}return _dm.apply(this,arguments)}}

/* rivers and lakes are drawn over the picture in day colours; they are left off here */
function patchCfg(){if(typeof amGlobe==="undefined"||!amGlobe||amGlobe._dngCfg)return;amGlobe._dngCfg=1;const ov=amGlobe.cfg.overlays;
 amGlobe.cfg.overlays=function(){const o=ov.apply(this,arguments);if(S.on&&o){o.rivers=false;o.lakes=false}return o}}

/* ---------- the chip, the panel ---------- */
const fmtMin=m=>{m=Math.round(m)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
const fmtLL=(v,p,n)=>Math.abs(v).toFixed(0)+"°"+(v>=0?p:n);
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function dayName(doy){const d=new Date(Date.UTC(2026,0,1)+((Math.round(doy)%365+365)%365)*864e5);return d.getUTCDate()+" "+MON[d.getUTCMonth()]}
function season(lat){if(Math.abs(lat)>23.2)return lat>0?"June solstice":"December solstice";if(Math.abs(lat)<.4)return"equinox (Mar / Sep)";
 const a=Math.asin(lat/TILT)*365.25/(2*Math.PI),d1=80+a,d2=80+182.6-a;return"≈ "+dayName(d1)+" or "+dayName(d2)}
const SUN_SVG='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.6" fill="#ffc533"/><g stroke="#ffb020" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>';
function panel(){let el=document.getElementById("gfDngPanel");const host=document.getElementById("amGlobeHost");if(!host)return null;
 if(!el){el=document.createElement("div");el.id="gfDngPanel";el.className="gf-dng";el.setAttribute("role","group");el.setAttribute("aria-label","Day and night: move the sun");
  el.innerHTML='<div class="gf-dng-top"><span class="gf-dng-ico">'+SUN_SVG+'</span><b class="gf-dng-time" aria-live="polite"></b><span class="gf-dng-where"></span><span class="gf-dng-sp"></span>'+
   '<button type="button" class="gf-dng-btn" data-dng="play" title="Play a day" aria-pressed="false">▶</button><button type="button" class="gf-dng-btn" data-dng="now" title="Put the sun where it is right now">Now</button><button type="button" class="gf-dng-btn" data-dng="reset" title="Reset time and season to now">Reset to now</button></div>'+
   '<label class="gf-dng-row"><span>Time</span><input type="range" title="Time of day (UTC). The bar shows day and night at Greenwich, 0°" min="0" max="1440" step="1" data-dng="time" aria-label="Time of day, UTC: moves the line between day and night"></label>'+
   '<label class="gf-dng-row"><span>Season</span><input type="range" min="-23.4" max="23.4" step="0.1" data-dng="lat" aria-label="Season: the latitude where the sun is overhead"><em class="gf-dng-season"></em></label>';
  const t=el.querySelector('[data-dng="time"]'),l=el.querySelector('[data-dng="lat"]');
  t.addEventListener("input",()=>{stop();S.lon=minToLon(+t.value);ui(true);req()});
  l.addEventListener("input",()=>{stop();S.lat=+l.value;ui(true);req()});
  el.querySelector('[data-dng="now"]').onclick=()=>{stop();const lat=S.lat;toNow();S.lat=lat;ui();req()};
  el.querySelector('[data-dng="reset"]').onclick=()=>{stop();toNow();ui();req()};
  el.querySelector('[data-dng="play"]').onclick=()=>{if(S.play)stop();else play()}}
 if(el.previousElementSibling!==host)host.after(el);return el}
function ui(fromSlider){const el=document.getElementById("gfDngPanel");if(!el)return;const m=lonToMin(S.lon);
 el.querySelector(".gf-dng-time").textContent=fmtMin(m)+" UTC";
 el.querySelector(".gf-dng-where").textContent="Sun overhead at "+fmtLL(S.lat,"N","S")+", "+fmtLL(S.lon,"E","W");
 el.querySelector(".gf-dng-season").textContent=season(S.lat);
 const t=el.querySelector('[data-dng="time"]'),l=el.querySelector('[data-dng="lat"]');
 if(!fromSlider||document.activeElement!==t)t.value=m;if(!fromSlider||document.activeElement!==l)l.value=S.lat.toFixed(1);
 const p=el.querySelector('[data-dng="play"]');p.textContent=S.play?"❚❚":"▶";p.setAttribute("aria-pressed",String(!!S.play))}
/* play: a day in 24 seconds */
function play(){let last=performance.now();const step=now=>{if(!S.play)return;const dt=Math.min(100,now-last);last=now;S.lon=((S.lon-dt*.015+540)%360+360)%360-180;ui();req();S.play=requestAnimationFrame(step)};S.play=requestAnimationFrame(step);ui()}
function stop(){if(S.play){cancelAnimationFrame(S.play);S.play=null;ui()}}
function chip(){const sat=document.querySelector('#allMapsToggleRow [data-allmaps-mode="satellite"]');if(!sat)return null;let c=document.getElementById("gfDngChip");
 if(!c){c=document.createElement("button");c.type="button";c.className="chip gf-dng-chip";c.id="gfDngChip";c.title="The satellite globe lit by the sun: day on one half, city lights on the other";c.innerHTML='<span aria-hidden="true">🌗</span> Day &amp; Night';c.onclick=()=>set(!S.on)}
 if(c.previousElementSibling!==sat)sat.after(c);return c}
function allowed(){try{return appMode==="allmaps"&&FEATURES.globe&&!!GLOBE_TEX.night&&!(typeof proj!=="undefined"&&proj.on)&&!(typeof ps!=="undefined"&&ps)}catch(e){return false}}
function set(v){if(v&&!allowed())v=false;if(v===S.on){sync();return}
 if(v){const sat=document.querySelector('#allMapsToggleRow [data-allmaps-mode="satellite"]');if(allMapsColorMode!=="satellite"&&sat)sat.click();}
 S.on=v;
 if(v){toNow();
  try{S.wasFlat=!globePrefs().allmaps;globePrefs().allmaps=true;saveStats()}catch(e){}try{amGlobeSync()}catch(e){console.error(e)}patchCfg();try{if(cloudsOn())cloudsLoad()}catch(e){}nightReady()}
 else{stop();freeNight();if(S.wasFlat){S.wasFlat=false;try{globePrefs().allmaps=false;saveStats();amGlobeSync()}catch(e){}}}
 sync();req()}
function sync(){const c=chip(),view=document.getElementById("allMapsView");
 if(S.on&&!(allowed()&&allMapsColorMode==="satellite"&&amGlobeOn()&&!(amGlobe&&amGlobe._flat))){S.on=false;stop();freeNight();req()}
 if(c){c.classList.toggle("active",S.on);c.setAttribute("aria-pressed",String(S.on));c.style.display=GLOBE_TEX.night&&FEATURES.globe?"":"none";
  const sat=document.querySelector('#allMapsToggleRow [data-allmaps-mode="satellite"]');if(sat&&S.on)sat.classList.remove("active");else if(sat&&!S.on&&allMapsColorMode==="satellite"&&!(typeof proj!=="undefined"&&proj.on))sat.classList.add("active")}
 if(view)view.classList.toggle("gf-dng-on",S.on);
 const p=S.on?panel():document.getElementById("gfDngPanel");if(p){p.hidden=!S.on;if(S.on)ui()}}
/* any other map chip, or the Flat map switch, leaves this view; the checks run after the click has done its work */
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest('#allMapsToggleRow [data-allmaps-mode], #allMapsToggleRow [data-view="flat"], #projTabChip');
 if(t&&S.on){S.on=false;stop();freeNight();
  /* back to the flat map if that is where Day & Night was opened from */
  if(S.wasFlat&&t.matches("[data-allmaps-mode]"))try{globePrefs().allmaps=false;saveStats()}catch(e){}
  S.wasFlat=false;setTimeout(()=>{try{amGlobeSync()}catch(e){}sync();req()},0)}},true);
{const _s=amGlobeSync;amGlobeSync=function(){const r=_s.apply(this,arguments);try{patchCfg();sync()}catch(e){console.error(e)}return r}}
if(typeof renderAllMapsView==="function"){const _r=renderAllMapsView;renderAllMapsView=function(){const r=_r.apply(this,arguments);try{sync()}catch(e){}return r}}
setInterval(()=>{try{if(document.getElementById("allMapsToggleRow"))sync()}catch(e){}},500);

const css=document.createElement("style");css.textContent=`
.gf-dng-chip span{ font-size:1.05em; margin-right:2px; }
.gf-dng{ position:relative; z-index:5; max-width:620px; margin:8px auto 4px; padding:10px 14px 8px; border-radius:16px; background:var(--surface,#101c30); color:rgb(var(--text-rgb)); border:1px solid var(--line); box-shadow:0 4px 18px rgba(0,0,0,.18); font-size:13px; }
.gf-dng[hidden]{ display:none !important; }
.gf-dng-top{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px; }
.gf-dng-ico{ display:inline-flex; }
.gf-dng-time{ font-size:17px; font-variant-numeric:tabular-nums; letter-spacing:.2px; }
.gf-dng-where{ font-size:12px; opacity:.72; }
.gf-dng-sp{ flex:1; }
.gf-dng-btn{ border:1px solid var(--line); background:var(--raised); color:inherit; border-radius:999px; padding:4px 11px; font:600 12px system-ui,sans-serif; cursor:pointer; }
.gf-dng-btn:hover{ border-color:var(--gold); }
.gf-dng-btn[data-dng="play"]{ min-width:34px; }
.gf-dng-row{ display:flex; align-items:center; gap:10px; margin:4px 0; }
.gf-dng-row > span{ width:52px; flex:none; font-size:11.5px; font-weight:700; opacity:.75; text-transform:uppercase; letter-spacing:.4px; }
.gf-dng-row input[type=range]{ flex:1; min-width:0; accent-color:var(--gold); height:22px; cursor:pointer; touch-action:none; }
.gf-dng-row input[data-dng="time"]{ -webkit-appearance:none; appearance:none; height:10px; border-radius:999px;
 background:linear-gradient(90deg,#0d1a3a 0%,#2a3f78 20%,#f0a24a 26%,#8fd0ff 34%,#bfe6ff 50%,#8fd0ff 66%,#f0a24a 74%,#2a3f78 80%,#0d1a3a 100%); }
.gf-dng-row input[data-dng="time"]::-webkit-slider-thumb{ -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#ffc533; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.4); }
.gf-dng-row input[data-dng="time"]::-moz-range-thumb{ width:20px; height:20px; border-radius:50%; background:#ffc533; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.4); }
.gf-dng-season{ font-style:normal; font-size:11.5px; opacity:.75; min-width:150px; text-align:right; }
body.sky-night .gf-dng{ background:#16213a; border-color:rgba(150,175,230,.22); box-shadow:0 4px 22px rgba(0,0,0,.45); }
body.sky-night .gf-dng-btn{ background:#22304f; border-color:rgba(150,175,230,.25); }
@media (max-width:600px){ .gf-dng{ margin:6px 0 4px; padding:8px 10px; } .gf-dng-where{ width:100%; order:9; } .gf-dng-season{ min-width:0; } }`;
document.head.appendChild(css);
window.gfDNG={on:()=>S.on,set,state:S,ui,req};
})();
